import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaBold, FaItalic, FaUnderline, FaPalette, FaListUl, FaMinus, FaSmile, FaPen, FaEraser, FaTrash, FaHighlighter, FaUndo, FaRedo, FaShapes, FaHandPaper, FaImage, FaFilePdf, FaSquare, FaCircle, FaPlay, FaSyncAlt, FaGoogle } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { Stage, Layer, Line, Circle, Rect, Image as KonvaImage, Transformer, RegularPolygon } from 'react-konva';
import useImage from 'use-image';
import { Document, Page, pdfjs } from 'react-pdf';
import { saveNote, loadNote, deleteNote, loadTeamNote, saveTeamNote, deleteTeamNote } from '../utils/storage'; // Storage 유틸 임포트
import AlertModal from '../components/AlertModal';
import PromptModal from '../components/PromptModal';
import ConfirmModal from '../components/ConfirmModal';

// PDF Worker 설정 (필수)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// 스타일 추가
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  height: 85vh;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

const DateTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CategorySelect = styled.select`
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ActionButton = styled.button`
  background: ${({ $primary, theme }) => $primary ? theme.colors.primary : theme.colors.surface};
  color: ${({ $primary, theme }) => $primary ? 'white' : theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.small};
  
  &:hover {
    opacity: 0.9;
    background: ${({ $primary, theme }) => $primary ? theme.colors.primary : theme.colors.gray};
  }
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({ $template, $method, theme }) => 
    $method === 'handwriting' && $template === 'line' ? `repeating-linear-gradient(transparent, transparent 31px, ${theme.colors.border} 32px)` : 
    $method === 'handwriting' && $template === 'grid' ? `linear-gradient(${theme.colors.border} 1px, transparent 1px), linear-gradient(90deg, ${theme.colors.border} 1px, transparent 1px)` : 
    theme.colors.surface};
  background-size: ${({ $template, $method }) => $method === 'handwriting' && $template === 'grid' ? '32px 32px' : 'auto'};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  position: relative;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
  align-items: center;
  position: relative;
  z-index: 20; 
`;

const ToolBtn = styled.button`
  background: ${({ $active, theme }) => $active ? theme.colors.gray : theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ $bold }) => $bold ? 'bold' : 'normal'};

  &:hover {
    background: ${({ theme }) => theme.colors.gray};
  }
`;

const EmojiPickerWrapper = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  margin-top: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  border-radius: 8px;
`;

const EmojiWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const ColorPickerWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const ColorInput = styled.input`
  width: 30px;
  height: 30px;
  border: none;
  padding: 0;
  margin-left: 5px;
  cursor: pointer;
  background: none;
  border-radius: 50%;
  overflow: hidden;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.1);
  }
`;

const ColorBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  background-color: ${({ color }) => color};
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.1s;
  padding: 0;
  position: relative;

  &:hover {
    transform: scale(1.1);
    z-index: 1;
  }

  &::after {
    content: '';
    display: ${({ $active }) => $active ? 'block' : 'none'};
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    border: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;

const FontSizeInput = styled.input`
  width: 50px;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  text-align: center;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

const ContentEditable = styled.div`
  flex: 1;
  padding: 20px;
  outline: none;
  overflow-y: auto;
  font-size: 16px;
  line-height: ${({ $template, $method }) => $method === 'handwriting' && ($template === 'line' || $template === 'grid') ? '2.0' : '1.6'}; 
  color: ${({ theme }) => theme.colors.text};
  position: relative;
  z-index: 1;

  h2, h3 {
    font-weight: bold;
    margin: 0.5em 0;
    color: ${({ theme }) => theme.colors.text};
  }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  p { margin: 0.5em 0; }
  
  ul, ol {
    margin-left: 20px;
  }
  
  li {
    margin-bottom: 4px;
  }
  
  blockquote {
    border-left: 4px solid ${({ theme }) => theme.colors.primary};
    padding-left: 16px;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 1em 0;
  }
  
  hr {
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    margin: 1em 0;
  }

  &:empty:before {
    content: attr(placeholder);
    color: ${({ theme }) => theme.colors.textSecondary};
    display: block;
  }
`;

// 이미지 컨트롤 버튼 그룹 - DrawingLayer 내부에서 절대 위치
const ImageControls = styled.div`
  position: absolute;
  top: ${({ y }) => y - 50}px;
  left: ${({ x }) => x}px;
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.8);
  padding: 8px;
  border-radius: 8px;
  z-index: 10000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  pointer-events: auto;
`;

const ImageControlBtn = styled.button`
  background: ${({ $danger }) => $danger ? '#e74c3c' : 'white'};
  color: ${({ $danger }) => $danger ? 'white' : '#333'};
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    transform: scale(1.05);
    background: ${({ $danger }) => $danger ? '#c0392b' : '#f0f0f0'};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    font-size: 14px;
  }
`;

const DrawingLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: ${({ $active }) => $active ? 5 : 0};
  pointer-events: ${({ $active }) => $active ? 'auto' : 'none'};
`;

const ShapeMenuWrapper = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  margin-top: 8px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  padding: 8px;
  display: flex;
  gap: 8px;
`;

// 개별 도형 컴포넌트 (선택 및 변형 가능)
const EditableShape = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const commonProps = {
    onClick: onSelect,
    onTap: onSelect,
    ref: shapeRef,
    ...shapeProps,
    draggable: true,
    onDragEnd: (e) => {
      onChange({
        ...shapeProps,
        x: e.target.x(),
        y: e.target.y(),
      });
    },
    onTransformEnd: (e) => {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      node.scaleX(1);
      node.scaleY(1);

      onChange({
        ...shapeProps,
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        radius: node.radius ? Math.max(5, node.radius() * scaleX) : undefined,
      });
    },
  };

  return (
    <React.Fragment>
      {shapeProps.type === 'rect' && <Rect {...commonProps} />}
      {shapeProps.type === 'circle' && <Circle {...commonProps} />}
      {shapeProps.type === 'triangle' && <RegularPolygon {...commonProps} sides={3} />}
      
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

// 이미지를 로드하는 컴포넌트
const URLImage = ({ image, isSelected, onSelect, onChange, onRotate, onDelete }) => {
  const [img] = useImage(image.src);
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        image={img}
        x={image.x}
        y={image.y}
        width={image.width}
        height={image.height}
        rotation={image.rotation || 0}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...image,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // reset scale to 1
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...image,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

// PDF 페이지를 이미지로 변환하여 렌더링하는 컴포넌트
const PDFPageImage = ({ pdfPage, x, y, width, scale }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!pdfPage) return;

    const viewport = pdfPage.getViewport({ scale: scale || 1.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    const renderTask = pdfPage.render(renderContext);
    renderTask.promise.then(() => {
      setImage(canvas);
    });
  }, [pdfPage, scale]);

  if (!image) return null;

  return <KonvaImage image={image} x={x} y={y} width={width} />;
};

// PDF 컨테이너 (Konva 뒤에 배치)
const PDFBackgroundContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; // 필기 레이어(z-index: 5)보다 아래, 에디터 배경보다 위
  overflow: auto;
  display: flex;
  justify-content: center;
  background-color: #f0f0f0;
  pointer-events: none; // 클릭은 필기 레이어가 받음
  
  canvas {
    max-width: 100%;
    height: auto !important;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const CanvasBorder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px dashed ${({ theme }) => theme.colors.primary}44; // 옅은 점선
  pointer-events: none;
  z-index: 10;
  display: ${({ $visible }) => $visible ? 'block' : 'none'};
`;

const NotePage = () => {
  const { id } = useParams(); // URL 파라미터 이름 변경: date -> id
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('teamId'); // 쿼리 파라미터에서 teamId 추출

  const editorRef = useRef(null);
  const savedRange = useRef(null); 
  
  // 상태
  const [noteId, setNoteId] = useState(id);
  const [noteDate, setNoteDate] = useState(null); // 실제 날짜 데이터
  const [noteTitle, setNoteTitle] = useState('');
  
  const [color, setColor] = useState('#000000');
  // 도구별 색상/두께 기억
  const [penColor, setPenColor] = useState('#000000');
  const [highlighterColor, setHighlighterColor] = useState('#FFEB3B');
  const [penWidth, setPenWidth] = useState(2);
  const [highlighterWidth, setHighlighterWidth] = useState(15);
  
  const [fontSize, setFontSize] = useState('16');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [category, setCategory] = useState('전공필수');
  const [settings, setSettings] = useState(location.state || { method: 'text', template: 'blank' });

  // 드로잉 관련 상태
  const [tool, setTool] = useState('pen'); // 'pen', 'eraser', 'highlighter', 'shape'
  const [lineWidth, setLineWidth] = useState(2);
  const [lines, setLines] = useState([]);
  // 히스토리 구조 변경: { lines, images, shapes } 객체를 저장
  const [history, setHistory] = useState([{ lines: [], images: [], shapes: [] }]);
  const [historyStep, setHistoryStep] = useState(0);
  const isDrawing = useRef(false);
  const [isPenModeOnly, setIsPenModeOnly] = useState(false); // 팜 리젝션 (펜 전용 모드)
  
  // 지우개 커서 상태 추가
  const [eraserCursor, setEraserCursor] = useState({ x: 0, y: 0, visible: false });
  
  // 이미지 관련 상태
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const fileInputRef = useRef(null);
  
  // PDF 관련 상태
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pdfPageImages, setPdfPageImages] = useState([]); // 렌더링된 PDF 페이지 이미지들
  const pdfInputRef = useRef(null);

  // 도형 삽입 관련 상태
  const [shapes, setShapes] = useState([]); // 삽입된 도형들
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [showShapeMenu, setShowShapeMenu] = useState(false);

  // 모달 상태
  const [alertState, setAlertState] = useState({ isOpen: false, title: '', message: '' });
  const [promptState, setPromptState] = useState({ isOpen: false, title: '', placeholder: '', initialValue: '', onConfirm: () => {} });
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, danger: false });

  // 최적화: 현재 그리고 있는 선을 위한 Ref (리액트 렌더링 우회)
  const currentLineRef = useRef(null);
  const layerRef = useRef(null);

  // 도구 변경 핸들러
  const changeTool = (newTool) => {
    setTool(newTool);
    if (newTool === 'pen' || newTool === 'shape') {
        setColor(penColor);
        setLineWidth(penWidth);
    } else if (newTool === 'highlighter') {
        setColor(highlighterColor);
        setLineWidth(highlighterWidth);
    } 
    // 지우개는 색상/두께 변경 없음 (지우개 고정 두께 사용 시)
  };

  // 색상 변경 핸들러
  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (tool === 'pen' || tool === 'shape') setPenColor(newColor);
    if (tool === 'highlighter') setHighlighterColor(newColor);
    
    // 텍스트 모드일 때도 적용
    if (settings.method === 'text') {
        restoreSelection();
        document.execCommand('foreColor', false, newColor);
    }
  };

  // 두께 변경 핸들러
  const handleWidthChange = (newWidth) => {
    const width = parseInt(newWidth);
    setLineWidth(width);
    if (tool === 'pen' || tool === 'shape') setPenWidth(width);
    if (tool === 'highlighter') setHighlighterWidth(width);
  };

  // 도형 인식 함수
  const recognizeShape = (points) => {
    if (points.length < 10) return null; // 점이 너무 적으면 무시

    const start = { x: points[0], y: points[1] };
    const end = { x: points[points.length - 2], y: points[points.length - 1] };
    
    // 1. 닫힌 도형인지 확인 (시작점과 끝점의 거리)
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const isClosed = distance < 50;

    // x, y 좌표 분리
    const xPoints = points.filter((_, i) => i % 2 === 0);
    const yPoints = points.filter((_, i) => i % 2 === 1);
    
    const minX = Math.min(...xPoints);
    const maxX = Math.max(...xPoints);
    const minY = Math.min(...yPoints);
    const maxY = Math.max(...yPoints);
    const width = maxX - minX;
    const height = maxY - minY;

    if (isClosed) {
        // 원 vs 사각형 구분 (단순화: 가로세로 비율이 비슷하면 원으로 간주)
        // 더 정교하게 하려면 면적 비율 등을 계산해야 함
        const ratio = width / height;
        if (ratio > 0.8 && ratio < 1.2) {
            return { type: 'circle', x: minX + width/2, y: minY + height/2, radius: Math.max(width, height)/2 };
        } else {
            return { type: 'rect', x: minX, y: minY, width, height };
        }
    } else {
        // 직선 인식 (간단히 시작점과 끝점 연결)
        return { type: 'line', points: [start.x, start.y, end.x, end.y] };
    }
  };

  useEffect(() => {
    const fetchNote = async () => {
        // 팀 문서인 경우
        if (teamId) {
            const teamNote = await loadTeamNote(teamId, id);
            
            if (teamNote) {
                setNoteDate(teamNote.date);
                setNoteTitle(teamNote.title || '');
                
                if (editorRef.current) {
                    editorRef.current.innerHTML = teamNote.content || '';
                }
                setSettings({ 
                    method: teamNote.method || 'text', 
                    template: teamNote.template || 'blank' 
                });
                if (teamNote.category) setCategory(teamNote.category);
                if (teamNote.drawingData) {
                    setLines(teamNote.drawingData);
                    const initialImages = teamNote.images || [];
                    const initialShapes = teamNote.shapes || [];
                    setHistory([{ lines: teamNote.drawingData, images: initialImages, shapes: initialShapes }]);
                    setHistoryStep(0);
                    setShapes(initialShapes);
                }
                if (teamNote.images) {
                    setImages(teamNote.images);
                }
            }
            return; // 팀 문서 처리 완료
        }

        // 개인 노트인 경우 (기존 로직)
        const savedNote = await loadNote(id);
        
        if (savedNote) {
            setNoteDate(savedNote.date);
            setNoteTitle(savedNote.title || '');
            
            if (editorRef.current) {
                editorRef.current.innerHTML = savedNote.content || ''; // undefined 방지
            }
            setSettings({ method: savedNote.method, template: savedNote.template });
            if (savedNote.category) setCategory(savedNote.category);
            if (savedNote.drawingData) {
                setLines(savedNote.drawingData);
                // 초기 로드 시 히스토리도 동기화
                const initialImages = savedNote.images || [];
                const initialShapes = savedNote.shapes || [];
                setHistory([{ lines: savedNote.drawingData, images: initialImages, shapes: initialShapes }]);
                setHistoryStep(0);
                setShapes(initialShapes);
            }
            if (savedNote.images) {
                setImages(savedNote.images);
            }
        } else {
            // 새 노트인 경우
            // ID가 날짜 형식이면 (구버전 즐겨찾기 등)
            if (id.match(/^\d{4}-\d{2}-\d{2}$/)) {
                setNoteDate(id);
            } else {
                // ID에서 날짜 추출 시도 (YYYY-MM-DD_timestamp 형식)
                const parts = id.split('_');
                if (parts.length > 0 && parts[0].match(/^\d{4}-\d{2}-\d{2}$/)) {
                     setNoteDate(parts[0]);
                }
            }

            // 새 노트일 때 템플릿 내용 적용
            if (editorRef.current) {
                let initialHTML = "";
                
                // 손글씨 모드 템플릿
                if (settings.method === 'handwriting' && settings.template === 'cornell') {
                    initialHTML = `
                        <div class="cornell-container" style="display: flex; height: 100%; gap: 10px;">
                            <div class="cue-column" style="width: 30%; min-width: 150px; border-right: 2px solid #ddd; padding-right: 10px;" contenteditable="true" placeholder="키워드/질문"></div>
                            <div class="note-column" style="flex: 1;" contenteditable="true" placeholder="강의 내용 필기"></div>
                        </div>
                        <div class="summary-section" style="border-top: 2px solid #ddd; min-height: 100px; margin-top: 20px; padding-top: 10px;" contenteditable="true" placeholder="요약 정리"></div>
                    `;
                }
                
                // 텍스트 모드 템플릿
                if (settings.method === 'text') {
                    if (settings.template === 'meeting') {
                        initialHTML = `
                            <h2>📋 회의록</h2>
                            <p><strong>일시:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>참석자:</strong> </p>
                            <p><strong>작성자:</strong> </p>
                            <hr/>
                            <h3>📌 안건</h3>
                            <ul>
                                <li>안건 1</li>
                                <li>안건 2</li>
                            </ul>
                            <h3>💬 논의 내용</h3>
                            <p>주요 논의 사항을 작성하세요...</p>
                            <h3>✅ 결정 사항</h3>
                            <ul>
                                <li>결정 사항 1</li>
                                <li>결정 사항 2</li>
                            </ul>
                            <h3>📝 다음 액션 아이템</h3>
                            <ul>
                                <li>[ ] 할 일 - 담당자 (기한)</li>
                            </ul>
                        `;
                    } else if (settings.template === 'dev_log') {
                        initialHTML = `
                            <h2>💻 학습/개발 일지</h2>
                            <p><strong>날짜:</strong> ${new Date().toLocaleDateString()}</p>
                            <hr/>
                            <h3>🎯 오늘의 목표</h3>
                            <ul>
                                <li>목표 1</li>
                                <li>목표 2</li>
                            </ul>
                            <h3>📚 학습 내용</h3>
                            <p>오늘 배운 내용을 정리하세요...</p>
                            <h3>🔨 구현 내용</h3>
                            <p>오늘 구현한 기능이나 작성한 코드를 설명하세요...</p>
                            <h3>❓ 문제 & 해결</h3>
                            <p><strong>문제:</strong> </p>
                            <p><strong>해결:</strong> </p>
                            <h3>💡 배운 점 / 느낀 점</h3>
                            <p>오늘의 인사이트를 작성하세요...</p>
                        `;
                    } else if (settings.template === 'todo') {
                        initialHTML = `
                            <h2>✅ 체크리스트</h2>
                            <p><strong>날짜:</strong> ${new Date().toLocaleDateString()}</p>
                            <hr/>
                            <h3>🔴 긴급 & 중요</h3>
                            <ul>
                                <li>☐ 할 일 작성</li>
                            </ul>
                            <h3>🟡 중요하지만 급하지 않음</h3>
                            <ul>
                                <li>☐ 할 일 작성</li>
                            </ul>
                            <h3>🟢 급하지만 중요하지 않음</h3>
                            <ul>
                                <li>☐ 할 일 작성</li>
                            </ul>
                            <h3>⚪ 나중에 해도 됨</h3>
                            <ul>
                                <li>☐ 할 일 작성</li>
                            </ul>
                            <hr/>
                            <h3>✨ 완료한 작업</h3>
                            <ul>
                                <li>✅ 완료한 작업 작성</li>
                            </ul>
                        `;
                    }
                }
                
                // 템플릿 내용 적용
                if (initialHTML) {
                    editorRef.current.innerHTML = initialHTML;
                }
            }
        }
    };
    
    fetchNote();
  }, [id, teamId, settings.method, settings.template]);

  useEffect(() => {
    // 키보드 이벤트 리스너: Delete 키로 이미지 삭제
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedImageId) {
        const newImages = images.filter(img => img.id !== selectedImageId);
        setImages(newImages);
        setSelectedImageId(null);
        saveHistory(lines, newImages);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageId, images, lines]); // lines 의존성 추가

  // ... (Selection, Style, Save 함수들 생략 - 기존 코드 유지)
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRange.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    selection.removeAllRanges();
    if (savedRange.current) {
      selection.addRange(savedRange.current);
    }
  };

  const applyStyle = (command, value = null) => {
    restoreSelection();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      saveSelection();
    }
  };

  const applyHeading = (tag) => {
    restoreSelection();
    document.execCommand('formatBlock', false, tag);
    if (editorRef.current) {
      editorRef.current.focus();
      saveSelection();
    }
  };

  const applyFontSize = (size) => {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (!selection.isCollapsed) {
      // 선택된 텍스트를 span으로 감싸서 폰트 크기 적용
      const span = document.createElement('span');
      span.style.fontSize = `${size}px`;
      
      // 기존 컨텐츠를 추출하여 span에 넣음
      try {
          const content = range.extractContents();
          span.appendChild(content);
          range.insertNode(span);
          
          // 커서 위치 조정 (선택 영역 유지)
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          selection.removeAllRanges();
          selection.addRange(newRange);
      } catch (e) {
          console.error("Font size apply error:", e);
          // 예외 발생 시 execCommand로 fallback (하지만 px 단위는 아님)
          document.execCommand("fontSize", false, "7");
      }
    }
    if (editorRef.current) {
      editorRef.current.focus();
      saveSelection();
    }
  };

  const insertText = (text) => {
    restoreSelection();
    document.execCommand('insertText', false, text);
    if (editorRef.current) {
      editorRef.current.focus();
      saveSelection();
    }
  };
  
  const onEmojiClick = (emojiObject) => {
    insertText(emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSave = async () => {
    if (editorRef.current) {
      // 제목 자동 추출 (첫 줄 or 기본값)
      let extractedTitle = '제목 없음';
      if (settings.method === 'text') {
        extractedTitle = editorRef.current.innerText.split('\n')[0] || '제목 없음';
      } else {
        extractedTitle = noteTitle || '손글씨 노트';
      }
      
      // prompt 대신 PromptModal 사용
      setPromptState({
        isOpen: true,
        title: '노트 제목 입력',
        placeholder: '노트 제목을 입력하세요',
        initialValue: extractedTitle,
        onConfirm: async (currentTitle) => {
      const noteData = {
        id: id, 
        date: noteDate,
        content: editorRef.current.innerHTML,
        method: settings.method,
        template: settings.template,
        category: category,
            drawingData: lines,
            images: images,
            shapes: shapes,
        updatedAt: new Date().toISOString(),
        title: currentTitle
      };
      
      try {
              if (teamId) {
                  await saveTeamNote(teamId, id, noteData);
                  console.log('Team note saved successfully:', noteData);
              } else {
          await saveNote(id, noteData);
                  console.log('Personal note saved successfully:', noteData);
              }
          setNoteTitle(currentTitle);
              setAlertState({
                isOpen: true,
                title: '성공',
                message: '저장되었습니다!',
                onConfirm: () => navigate(-1) // 리다이렉션 추가
              });
      } catch (e) {
          console.error(e);
              setAlertState({
                isOpen: true,
                title: '오류',
                message: '저장 중 오류가 발생했습니다.'
              });
      }
    }
      });
    }
  };

  const handleDelete = async () => {
    setConfirmState({
      isOpen: true,
      title: '노트 삭제',
      message: '정말 이 노트를 삭제하시겠습니까?',
      danger: true,
      onConfirm: async () => {
        try {
            if (teamId) {
                await deleteTeamNote(teamId, id);
            } else {
            await deleteNote(id, noteDate);
            }
            setAlertState({
              isOpen: true,
              title: '완료',
              message: '삭제되었습니다.',
              onConfirm: () => navigate(-1)
            });
        } catch (e) {
            console.error(e);
            setAlertState({
              isOpen: true,
              title: '오류',
              message: '삭제 중 오류가 발생했습니다.'
            });
        }
    }
    });
  };

  const handleAddShape = (type) => {
    const newShape = {
      id: Date.now().toString(),
      type: type,
      x: 150,
      y: 150,
      stroke: color,
      strokeWidth: 2,
    };

    if (type === 'rect') {
        newShape.width = 100;
        newShape.height = 100;
    } else {
        // circle, triangle
        newShape.radius = 50;
    }

    const newShapes = [...shapes, newShape];
    setShapes(newShapes);
    saveHistory(lines, images, newShapes);
    setShowShapeMenu(false);
  };

  // 히스토리 저장 함수
  const saveHistory = (newLines, newImages, newShapes) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push({ 
        lines: newLines !== undefined ? newLines : lines, 
        images: newImages !== undefined ? newImages : images,
        shapes: newShapes !== undefined ? newShapes : shapes
    });
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep === 0) return;
    const previous = history[historyStep - 1];
    setLines(previous.lines);
    setImages(previous.images);
    setShapes(previous.shapes);
    setHistoryStep(historyStep - 1);
  };

  const handleRedo = () => {
    if (historyStep === history.length - 1) return;
    const next = history[historyStep + 1];
    setLines(next.lines);
    setImages(next.images);
    setShapes(next.shapes);
    setHistoryStep(historyStep + 1);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('📸 이미지 업로드 시작:', file.name, file.size, 'bytes');
      const reader = new FileReader();
      reader.onload = (e) => {
        if (settings.method === 'handwriting') {
            const imgObj = new Image();
            imgObj.src = e.target.result;
            imgObj.onload = () => {
                const newImage = {
                    id: Date.now().toString(),
                    src: e.target.result,
                    x: 50,
                    y: 50,
                    width: 200,
                    height: 200 * (imgObj.height / imgObj.width),
                    rotation: 0,
                };
                console.log('✅ 이미지 객체 생성:', newImage.id, `${newImage.width}x${newImage.height.toFixed(0)}`);
                const newImages = [...images, newImage];
                setImages(newImages);
                saveHistory(lines, newImages, shapes);
                console.log('📝 총 이미지 개수:', newImages.length);
            };
            imgObj.onerror = (err) => {
                console.error('❌ 이미지 로드 실패:', err);
                setAlertState({
                    isOpen: true,
                    title: '오류',
                    message: '이미지를 불러올 수 없습니다.'
                });
            };
        } else {
            // 텍스트 모드: 에디터에 이미지 삽입
            restoreSelection();
            document.execCommand('insertImage', false, e.target.result);
            // 이미지 크기 조절을 위해 스타일 추가 (선택적)
            const imgs = editorRef.current.getElementsByTagName('img');
            const lastImg = imgs[imgs.length - 1];
            if (lastImg) {
                lastImg.style.maxWidth = '100%';
                lastImg.style.borderRadius = '8px';
            }
            console.log('✅ 텍스트 모드에 이미지 삽입됨');
        }
      };
      reader.onerror = (err) => {
        console.error('❌ 파일 읽기 실패:', err);
        setAlertState({
            isOpen: true,
            title: '오류',
            message: '파일을 읽을 수 없습니다.'
        });
      };
      reader.readAsDataURL(file);
    }
    // 같은 파일 다시 선택 가능하게 초기화
    e.target.value = '';
  };

  // 이미지 회전 핸들러
  const handleRotateImage = () => {
    if (!selectedImageId) return;
    const imageIndex = images.findIndex(img => img.id === selectedImageId);
    if (imageIndex === -1) return;
    
    const newImages = [...images];
    const currentRotation = newImages[imageIndex].rotation || 0;
    const newRotation = (currentRotation + 90) % 360;
    newImages[imageIndex] = {
      ...newImages[imageIndex],
      rotation: newRotation
    };
    console.log('🔄 이미지 회전:', selectedImageId, `${currentRotation}° → ${newRotation}°`);
    setImages(newImages);
    saveHistory(lines, newImages, shapes);
  };

  // 이미지 삭제 핸들러
  const handleDeleteImage = () => {
    if (!selectedImageId) return;
    console.log('🗑️ 이미지 삭제:', selectedImageId);
    const newImages = images.filter(img => img.id !== selectedImageId);
    setImages(newImages);
    setSelectedImageId(null);
    saveHistory(lines, newImages, shapes);
    console.log('📝 남은 이미지 개수:', newImages.length);
  };

  // 구글 캘린더에 노트 추가
  const addToGoogleCalendar = () => {
    if (!noteDate) {
      setAlertState({
        isOpen: true,
        title: '알림',
        message: '날짜 정보가 없는 노트입니다.'
      });
      return;
    }

    const title = encodeURIComponent(noteTitle || '노트');
    const dateStr = noteDate.replace(/-/g, '');
    const details = encodeURIComponent(`카테고리: ${category}\n\n노트 내용을 확인하세요.`);
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}&details=${details}`;
    
    window.open(url, '_blank');
    
    setAlertState({
      isOpen: true,
      title: '구글 캘린더 📅',
      message: '구글 캘린더 추가 페이지가 열렸습니다!\n날짜와 내용을 확인하고 저장하세요.'
    });
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    // PDF 로드 성공 시 첫 페이지부터 순차적으로 이미지화는 여기서 처리하지 않고
    // Document 컴포넌트 내부에서 onLoadSuccess 등을 활용하거나
    // react-pdf는 Canvas 렌더링을 기본 지원하므로 Konva와 통합하기 위해
    // 별도의 캔버스 변환 과정이 필요함 (위의 PDFPageImage 컴포넌트 활용 예정)
  };

  const handlePdfUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          setPdfFile(file);
          // PDF 모드로 자동 전환 (손글씨 모드 강제)
          if (settings.method !== 'handwriting') {
              setSettings({ ...settings, method: 'handwriting' });
          }
      }
      e.target.value = '';
  };

  // 배경 클릭 시 선택 해제
  const checkDeselect = (e) => {
    // clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedImageId(null);
    }
  };

  // 드로잉 이벤트 핸들러
  const handleMouseDown = (e) => {
    // 팜 리젝션 (펜 전용 모드)
    if (isPenModeOnly && e.evt.pointerType !== 'pen') return;

    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    
    let currentWidth = lineWidth;
    if (tool === 'eraser') currentWidth = 20;

    // 현재 그리는 선 정보 초기화 (Ref에 저장)
    currentLineRef.current = {
      tool,
      points: [pos.x, pos.y],
      color: color,
      strokeWidth: currentWidth,
      opacity: tool === 'highlighter' ? 0.5 : 1,
      shapeType: null
    };
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    // 지우개 커서 위치 업데이트
    if (tool === 'eraser') {
      setEraserCursor({ x: point.x, y: point.y, visible: true });
    }
    
    if (!isDrawing.current || !currentLineRef.current) return;
    // 팜 리젝션 체크 (그리는 중에도 터치 무시)
    if (isPenModeOnly && e.evt.pointerType !== 'pen') return;

    
    // Ref의 포인트 업데이트 (상태 업데이트 X -> 렌더링 X)
    currentLineRef.current.points = currentLineRef.current.points.concat([point.x, point.y]);
    
    // Konva 레이어만 직접 다시 그리기 (batchDraw가 최적화됨)
    if (layerRef.current) {
        layerRef.current.batchDraw();
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawing.current || !currentLineRef.current) return;
    if (isPenModeOnly && e.evt.pointerType !== 'pen') {
        isDrawing.current = false;
        currentLineRef.current = null;
        if (layerRef.current) layerRef.current.batchDraw();
        return;
    }

    isDrawing.current = false;
    let newLine = { ...currentLineRef.current };
    
    // 도형 보정 로직
    if (tool === 'shape') {
        const shape = recognizeShape(newLine.points);
        if (shape) {
            newLine = {
                ...newLine,
                tool: 'shape_result', 
                shapeData: shape,
                points: [] 
            };
        }
    }

    // 최종적으로 리액트 상태에 반영
    const newLines = lines.concat(newLine);
    setLines(newLines);
    
    // 히스토리 저장
    saveHistory(newLines, images, shapes);
    
    currentLineRef.current = null;
    // 상태 업데이트 후 레이어 다시 그리기
    if (layerRef.current) layerRef.current.batchDraw();
  };

  return (
    <PageContainer>
      <Header>
        <DateTitle>
          <ActionButton onClick={() => navigate(-1)} style={{ padding: '8px' }}>
            <FaArrowLeft />
          </ActionButton>
          {noteDate || '새 노트'} {teamId ? '팀 문서' : '노트'}
          <span style={{fontSize: '14px', color: '#666', fontWeight: 'normal'}}>
            {noteTitle ? `- ${noteTitle}` : ''}
          </span>
        </DateTitle>
        <div style={{ display: 'flex', gap: '10px' }}>
            <CategorySelect value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="전공필수">전공필수</option>
                <option value="전공선택">전공선택</option>
                <option value="교양">교양</option>
                <option value="캡스톤디자인">캡스톤디자인</option>
                <option value="해커톤">해커톤</option>
                <option value="토이프로젝트">토이프로젝트</option>
                <option value="기타">기타</option>
            </CategorySelect>
            <ActionButton onClick={handleDelete} title="삭제">
                <FaTrash />
            </ActionButton>
            <ActionButton onClick={addToGoogleCalendar} title="구글 캘린더에 추가" style={{ background: '#4285F4', color: 'white' }}>
                <FaGoogle />
            </ActionButton>
            <ActionButton $primary onClick={handleSave}>
            <FaSave /> 저장
            </ActionButton>
        </div>
      </Header>

      <EditorContainer $template={settings.template} $method={settings.method}>
        <Toolbar>
          {/* 손글씨 모드일 때 */}
          {settings.method === 'handwriting' ? (
            <>
              <ToolBtn 
                $active={tool === 'pen'} 
                onClick={() => changeTool('pen')}
                title="펜"
              >
                <FaPen />
              </ToolBtn>
              <ToolBtn 
                $active={tool === 'highlighter'} 
                onClick={() => changeTool('highlighter')}
                title="형광펜"
              >
                <FaHighlighter />
              </ToolBtn>
              <ToolBtn 
                $active={tool === 'eraser'} 
                onClick={() => changeTool('eraser')}
                title="지우개"
              >
                <FaEraser />
              </ToolBtn>

              <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 4px' }}></div>

              <ToolBtn 
                $active={isPenModeOnly}
                onClick={() => setIsPenModeOnly(!isPenModeOnly)}
                title={isPenModeOnly ? "펜 전용 모드 ON (터치 무시)" : "펜 전용 모드 OFF"}
                style={{ color: isPenModeOnly ? '#4A90E2' : 'inherit' }}
              >
                <FaHandPaper />
              </ToolBtn>

              <ToolBtn 
                onClick={() => fileInputRef.current.click()}
                title="이미지 삽입"
              >
                <FaImage />
              </ToolBtn>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleImageUpload}
              />

              <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 4px' }}></div>
              
              <ToolBtn onClick={handleUndo} title="실행 취소">
                <FaUndo />
              </ToolBtn>
              <ToolBtn onClick={handleRedo} title="다시 실행">
                <FaRedo />
              </ToolBtn>

              <ToolBtn 
                onClick={() => pdfInputRef.current.click()} 
                title="PDF 불러오기"
              >
                <FaFilePdf />
              </ToolBtn>
              <input 
                type="file" 
                accept="application/pdf" 
                ref={pdfInputRef} 
                style={{ display: 'none' }} 
                onChange={handlePdfUpload}
              />

              <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 4px' }}></div>
              
              <ToolBtn 
                onClick={() => {
                    if (selectedImageId) {
                        // 이미지 선택 상태면 이미지 삭제
                        setConfirmState({
                          isOpen: true,
                          title: '이미지 삭제',
                          message: '선택한 이미지를 삭제하시겠습니까?',
                          danger: true,
                          onConfirm: () => {
                            const newImages = images.filter(img => img.id !== selectedImageId);
                            setImages(newImages);
                            setSelectedImageId(null);
                            saveHistory(lines, newImages);
                        }
                        });
                    } else {
                        // 아니면 전체 필기 삭제
                        setConfirmState({
                          isOpen: true,
                          title: '전체 지우기',
                          message: '모든 필기 내용을 지우시겠습니까?',
                          danger: true,
                          onConfirm: () => {
                            setLines([]);
                            setHistory([{ lines: [], images: images }]);
                            setHistoryStep(0);
                        }
                        });
                    }
                }}
                title={selectedImageId ? "선택한 이미지 삭제" : "전체 지우기"}
              >
                <FaTrash color={selectedImageId ? "#e74c3c" : "inherit"} />
              </ToolBtn>
              
              <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 4px' }}></div>
              
              {/* 색상 팔레트 (지우개가 아닐 때만 표시) */}
              {tool !== 'eraser' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {(tool === 'highlighter' ? ['#FFEB3B', '#4CD964', '#FF2D55'] : ['#000000', '#FF3B30', '#007AFF']).map((preset) => (
                        <ColorBtn 
                            key={preset}
                            color={preset}
                            $active={color === preset}
                            onClick={() => handleColorChange(preset)}
                            title={preset}
                        />
                    ))}
                    <div style={{position: 'relative', width: '28px', height: '28px'}}>
                        <ColorInput 
                            type="color" 
                            value={color} 
                            onChange={(e) => handleColorChange(e.target.value)} 
                            title="사용자 지정 색상"
                            style={{ width: '100%', height: '100%', marginLeft: 0 }}
                        />
                        {/* 프리셋에 없는 색상이 선택되었을 때만 강조 테두리 */}
                        {!(tool === 'highlighter' ? ['#FFEB3B', '#4CD964', '#FF2D55'] : ['#000000', '#FF3B30', '#007AFF']).includes(color) && (
                            <div style={{
                                position: 'absolute', 
                                top: '-4px', left: '-4px', right: '-4px', bottom: '-4px', 
                                border: `2px solid #4A90E2`, 
                                borderRadius: '50%',
                                pointerEvents: 'none'
                            }}></div>
                        )}
                    </div>
                  </div>
              )}

              {tool !== 'eraser' && <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 4px' }}></div>}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>두께:</span>
                <input 
                    type="range" 
                    min="1" 
                    max="40" 
                    value={lineWidth} 
                    onChange={(e) => handleWidthChange(e.target.value)}
                    style={{ width: '60px' }}
                    title="펜 두께"
                />
              </div>
            </>
          ) : (
            /* 텍스트 모드일 때 */
            <>
              <ToolBtn onMouseDown={(e) => { e.preventDefault(); applyStyle('bold'); }} title="굵게">
                <FaBold />
              </ToolBtn>
              <ToolBtn onMouseDown={(e) => { e.preventDefault(); applyStyle('italic'); }} title="기울임">
                <FaItalic />
              </ToolBtn>
              <ToolBtn onMouseDown={(e) => { e.preventDefault(); applyStyle('underline'); }} title="밑줄">
                <FaUnderline />
              </ToolBtn>
              <ToolBtn onMouseDown={(e) => { e.preventDefault(); applyStyle('insertUnorderedList'); }} title="글머리 기호">
                <FaListUl />
              </ToolBtn>
              <ToolBtn onMouseDown={(e) => { e.preventDefault(); applyStyle('insertHorizontalRule'); }} title="구분선">
                <FaMinus />
              </ToolBtn>
              
              <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 4px' }}></div>

              <ToolBtn $bold onMouseDown={(e) => { e.preventDefault(); applyHeading('H2'); }} title="제목 1 (H2)">
                H1
              </ToolBtn>
              <ToolBtn $bold onMouseDown={(e) => { e.preventDefault(); applyHeading('H3'); }} title="제목 2 (H3)">
                H2
              </ToolBtn>
              <ToolBtn onMouseDown={(e) => { e.preventDefault(); applyHeading('P'); }} title="본문 (P)">
                본문
              </ToolBtn>

              <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 4px' }}></div>

              <EmojiWrapper>
                <ToolBtn 
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    setShowEmojiPicker(!showEmojiPicker); 
                  }} 
                  $active={showEmojiPicker}
                  title="이모지 삽입"
                >
                  <FaSmile />
                </ToolBtn>
                {showEmojiPicker && (
                  <EmojiPickerWrapper>
                    <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                  </EmojiPickerWrapper>
                )}
              </EmojiWrapper>

              <ToolBtn 
                onClick={() => fileInputRef.current.click()} 
                title="이미지 삽입"
              >
                <FaImage />
              </ToolBtn>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleImageUpload}
              />

              <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 4px' }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '12px', color: ({theme}) => theme.colors.text }}>크기:</span>
                <FontSizeInput 
                  type="number" 
                  value={fontSize} 
                  onChange={(e) => {
                    setFontSize(e.target.value);
                    applyFontSize(e.target.value);
                  }}
                  onBlur={() => applyFontSize(fontSize)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applyFontSize(fontSize);
                      e.preventDefault();
                    }
                  }}
                />
                <span style={{ fontSize: '12px', color: ({theme}) => theme.colors.text }}>px</span>
              </div>

              <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 4px' }}></div>

              <ColorPickerWrapper>
                <FaPalette color={color} />
                <ColorInput 
                  type="color" 
                  value={color} 
                  onChange={(e) => handleColorChange(e.target.value)} 
                  title="글자 색상"
                />
              </ColorPickerWrapper>
            </>
          )}
        </Toolbar>
        
        <div style={{ position: 'relative', flex: 1, width: '100%', overflow: 'hidden' }}>
          
          {/* PDF 배경 렌더링 (손글씨 모드일 때만) */}
          {settings.method === 'handwriting' && pdfFile && (
              <PDFBackgroundContainer>
                  <Document
                      file={pdfFile}
                      onLoadSuccess={onDocumentLoadSuccess}
                  >
                      {/* 스크롤 가능한 전체 페이지 렌더링 */}
                      {Array.from(new Array(numPages), (el, index) => (
                        <Page 
                            key={`page_${index + 1}`}
                            pageNumber={index + 1} 
                            width={window.innerWidth > 800 ? 800 : window.innerWidth - 40} // 적절한 너비 제한
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="pdf-page"
                        />
                      ))}
                  </Document>
              </PDFBackgroundContainer>
          )}

          {/* 드로잉 캔버스 (손글씨 모드일 때만 활성화) */}
          {settings.method === 'handwriting' && (
              <DrawingLayer $active={true}>
                  <CanvasBorder $visible={true} />
                  <Stage 
                      width={window.innerWidth} 
                      height={pdfFile && numPages ? numPages * 1150 : window.innerHeight} // PDF 길이에 맞춰 캔버스 높이 확장 (대략적 계산)
                      onMouseDown={(e) => {
                        checkDeselect(e);
                        handleMouseDown(e);
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={() => setEraserCursor({ ...eraserCursor, visible: false })}
                      onMouseEnter={() => tool === 'eraser' && setEraserCursor({ ...eraserCursor, visible: true })}
                      style={{ cursor: tool === 'eraser' ? 'none' : 'crosshair' }}
                      onTouchStart={(e) => {
                        checkDeselect(e);
                        handleMouseDown(e);
                      }}
                      onTouchMove={handleMouseMove}
                      onTouchEnd={handleMouseUp}
                  >
                      <Layer>
                        {/* 이미지 객체들 */}
                        {images.map((img, i) => (
                            <URLImage
                                key={img.id}
                                image={img}
                                isSelected={img.id === selectedImageId}
                                onSelect={() => {
                                    setSelectedImageId(img.id);
                                    setSelectedShapeId(null);
                                }}
                                onChange={(newAttrs) => {
                                    const newImages = images.slice();
                                    newImages[i] = newAttrs;
                                    setImages(newImages);
                                    // 드래그/변형 종료 시 히스토리 저장
                                    saveHistory(lines, newImages, shapes);
                                }}
                            />
                        ))}
                        {/* 삽입된 도형들 - 렌더링 코드 추가 */}
                        {shapes.map((shape, i) => (
                            <EditableShape
                                key={shape.id}
                                shapeProps={shape}
                                isSelected={shape.id === selectedShapeId}
                                onSelect={() => {
                                    setSelectedShapeId(shape.id);
                                    setSelectedImageId(null);
                                }}
                                onChange={(newAttrs) => {
                                    const newShapes = shapes.slice();
                                    newShapes[i] = newAttrs;
                                    setShapes(newShapes);
                                    saveHistory(lines, images, newShapes);
                                }}
                            />
                        ))}
                      </Layer>
                      <Layer ref={layerRef}>
                        {lines.map((line, i) => {
                            if (line.tool === 'shape_result' && line.shapeData) {
                                // 보정된 도형 렌더링
                                const { shapeData, color, strokeWidth, opacity } = line;
                                if (shapeData.type === 'circle') {
                                    return (
                                        <Circle
                                            key={i}
                                            x={shapeData.x}
                                            y={shapeData.y}
                                            radius={shapeData.radius}
                                            stroke={color}
                                            strokeWidth={strokeWidth}
                                            opacity={opacity}
                                            perfectDrawEnabled={false}
                                            listening={false}
                                        />
                                    );
                                } else if (shapeData.type === 'rect') {
                                    return (
                                        <Rect
                                            key={i}
                                            x={shapeData.x}
                                            y={shapeData.y}
                                            width={shapeData.width}
                                            height={shapeData.height}
                                            stroke={color}
                                            strokeWidth={strokeWidth}
                                            opacity={opacity}
                                            perfectDrawEnabled={false}
                                            listening={false}
                                        />
                                    );
                                } else if (shapeData.type === 'line') {
                                     return (
                                        <Line
                                            key={i}
                                            points={shapeData.points}
                                            stroke={color}
                                            strokeWidth={strokeWidth}
                                            tension={0}
                                            lineCap="round"
                                            lineJoin="round"
                                            opacity={opacity}
                                            perfectDrawEnabled={false}
                                            listening={false}
                                        />
                                    );
                                }
                            }

                            return (
                                <Line
                                    key={i}
                                    points={line.points}
                                    stroke={line.tool === 'eraser' ? '#ffffff' : line.color} 
                                    strokeWidth={line.strokeWidth}
                                    tension={0.5}
                                    lineCap="round"
                                    lineJoin="round"
                                    opacity={line.opacity || 1}
                                    globalCompositeOperation={
                                        line.tool === 'eraser' ? 'destination-out' : 'source-over'
                                    }
                                    perfectDrawEnabled={false} // 성능 최적화: 히트 감지용 버퍼 그리기 생략
                                    listening={false} // 성능 최적화: 이벤트 감지 끄기
                                />
                            );
                        })}
                        {/* 현재 그리고 있는 선 (임시 렌더링) */}
                        {currentLineRef.current && (
                             <Line
                                points={currentLineRef.current.points}
                                stroke={currentLineRef.current.tool === 'eraser' ? '#ffffff' : currentLineRef.current.color}
                                strokeWidth={currentLineRef.current.strokeWidth}
                                tension={0.5}
                                lineCap="round"
                                lineJoin="round"
                                opacity={currentLineRef.current.opacity || 1}
                                globalCompositeOperation={
                                    currentLineRef.current.tool === 'eraser' ? 'destination-out' : 'source-over'
                                }
                                perfectDrawEnabled={false} // 최적화
                                listening={false}
                            />
                        )}
                        
                        {/* 지우개 커서 표시 */}
                        {tool === 'eraser' && eraserCursor.visible && (
                            <Circle
                                x={eraserCursor.x}
                                y={eraserCursor.y}
                                radius={10}
                                stroke="#666"
                                strokeWidth={2}
                                dash={[5, 5]}
                                listening={false}
                                perfectDrawEnabled={false}
                            />
                        )}
                      </Layer>
                  </Stage>

                  {/* 이미지 컨트롤 버튼 - Stage 외부에 렌더링 */}
                  {selectedImageId && images.find(img => img.id === selectedImageId) && (
                    <ImageControls
                      x={images.find(img => img.id === selectedImageId).x}
                      y={images.find(img => img.id === selectedImageId).y}
                    >
                      <ImageControlBtn onClick={handleRotateImage}>
                        <FaSyncAlt />
                        회전
                      </ImageControlBtn>
                      <ImageControlBtn $danger onClick={handleDeleteImage}>
                        <FaTrash />
                        삭제
                      </ImageControlBtn>
                    </ImageControls>
                  )}
              </DrawingLayer>
          )}

          <ContentEditable 
            ref={editorRef}
            contentEditable={settings.method === 'text'} // 손글씨 모드에서는 편집 불가
            $template={settings.template}
            $method={settings.method}
            placeholder={settings.method === 'handwriting' || settings.template === 'cornell' || settings.template === 'meeting' ? '' : "여기에 내용을 작성하세요..."}
            onMouseUp={saveSelection}
            onKeyUp={saveSelection}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              zIndex: settings.method === 'handwriting' ? 0 : 1,
              pointerEvents: settings.method === 'handwriting' ? 'none' : 'auto', // 손글씨 모드에서는 마우스 이벤트 무시
              userSelect: settings.method === 'handwriting' ? 'none' : 'auto' // 손글씨 모드에서는 텍스트 선택 불가
            }}
          />
        </div>
      </EditorContainer>

      <AlertModal 
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
        title={alertState.title}
        message={alertState.message}
        onConfirm={alertState.onConfirm}
      />
      
      <PromptModal
        isOpen={promptState.isOpen}
        onClose={() => setPromptState({ ...promptState, isOpen: false })}
        onConfirm={promptState.onConfirm}
        title={promptState.title}
        placeholder={promptState.placeholder}
        initialValue={promptState.initialValue}
      />
      
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        danger={confirmState.danger}
      />
    </PageContainer>
  );
};

export default NotePage;
