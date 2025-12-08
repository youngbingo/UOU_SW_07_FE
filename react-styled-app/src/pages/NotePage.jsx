import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaBold, FaItalic, FaUnderline, FaPalette, FaListUl, FaMinus, FaSmile, FaPen, FaEraser, FaTrash, FaHighlighter, FaUndo, FaRedo, FaShapes, FaHandPaper } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { Stage, Layer, Line, Circle, Rect } from 'react-konva';

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

const DrawingLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: ${({ $active }) => $active ? 5 : 0};
  pointer-events: ${({ $active }) => $active ? 'auto' : 'none'};
`;

const NotePage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const editorRef = useRef(null);
  const savedRange = useRef(null); 
  
  // 상태
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
  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const isDrawing = useRef(false);
  const [isPenModeOnly, setIsPenModeOnly] = useState(false); // 팜 리젝션 (펜 전용 모드)
  
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
    const savedNote = localStorage.getItem(`note_${date}`);
    if (savedNote) {
      const parsed = JSON.parse(savedNote);
      if (editorRef.current) {
        editorRef.current.innerHTML = parsed.content;
      }
      setSettings({ method: parsed.method, template: parsed.template });
      if (parsed.category) setCategory(parsed.category);
      if (parsed.drawingData) {
        setLines(parsed.drawingData);
        setHistory([parsed.drawingData]);
        setHistoryStep(0);
      }
    } else {
        // ... (초기 템플릿 로직 생략)
        if (editorRef.current && editorRef.current.innerHTML === "") {
            let initialHTML = "";
            // ... (템플릿별 초기 HTML 설정)
            if (settings.method === 'handwriting' && settings.template === 'cornell') {
                initialHTML = `
                    <div class="cornell-container" style="display: flex; height: 100%; gap: 10px;">
                        <div class="cue-column" style="width: 30%; min-width: 150px; border-right: 2px solid #ddd; padding-right: 10px;" contenteditable="true" placeholder="키워드/질문"></div>
                        <div class="note-column" style="flex: 1;" contenteditable="true" placeholder="강의 내용 필기"></div>
                    </div>
                    <div class="summary-section" style="border-top: 2px solid #ddd; min-height: 100px; margin-top: 20px; padding-top: 10px;" contenteditable="true" placeholder="요약 정리"></div>
                `;
            }
            // ... (기타 템플릿)
            if (initialHTML) editorRef.current.innerHTML = initialHTML;
        }
    }
  }, [date, settings.method, settings.template]);

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
      const span = document.createElement('span');
      span.style.fontSize = `${size}px`;
      try {
        range.surroundContents(span);
      } catch (e) {
        document.execCommand("fontSize", false, "7");
        const fontElements = editorRef.current.getElementsByTagName("font");
        for (let i = 0; i < fontElements.length; i++) {
            if (fontElements[i].size === "7") {
                fontElements[i].removeAttribute("size");
                fontElements[i].style.fontSize = `${size}px`;
            }
        }
      }
      selection.removeAllRanges();
      selection.addRange(range);
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

  const handleSave = () => {
    if (editorRef.current) {
      const noteData = {
        id: date, 
        date: date,
        content: editorRef.current.innerHTML,
        method: settings.method,
        template: settings.template,
        category: category,
        drawingData: lines, // 드로잉 데이터 저장
        updatedAt: new Date().toISOString(),
        title: editorRef.current.innerText.split('\n')[0] || '제목 없음' 
      };
      
      localStorage.setItem(`note_${date}`, JSON.stringify(noteData));
      console.log('Saved:', noteData);
    }
    alert('저장되었습니다!');
    navigate('/');
  };

  const handleUndo = () => {
    if (historyStep === 0) return;
    const previous = history[historyStep - 1];
    setLines(previous);
    setHistoryStep(historyStep - 1);
  };

  const handleRedo = () => {
    if (historyStep === history.length - 1) return;
    const next = history[historyStep + 1];
    setLines(next);
    setHistoryStep(historyStep + 1);
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
    if (!isDrawing.current || !currentLineRef.current) return;
    // 팜 리젝션 체크 (그리는 중에도 터치 무시)
    if (isPenModeOnly && e.evt.pointerType !== 'pen') return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
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
    
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newLines);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    
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
          {date} 노트
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

              <ToolBtn 
                $active={tool === 'shape'} 
                onClick={() => changeTool('shape')}
                title="도형 보정 펜"
              >
                <FaShapes />
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

              <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 4px' }}></div>

              <ToolBtn onClick={handleUndo} title="실행 취소">
                <FaUndo />
              </ToolBtn>
              <ToolBtn onClick={handleRedo} title="다시 실행">
                <FaRedo />
              </ToolBtn>

              <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 4px' }}></div>

              <ToolBtn 
                onClick={() => {
                    if(window.confirm('모든 필기 내용을 지우시겠습니까?')) {
                        setLines([]);
                        setHistory([[]]);
                        setHistoryStep(0);
                    }
                }}
                title="전체 지우기"
              >
                <FaTrash />
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
          {/* 드로잉 캔버스 (손글씨 모드일 때만 활성화) */}
          {settings.method === 'handwriting' && (
              <DrawingLayer $active={true}>
                  <Stage 
                      width={window.innerWidth} 
                      height={window.innerHeight} // 실제로는 컨테이너 크기에 맞춰야 함
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onTouchStart={handleMouseDown}
                      onTouchMove={handleMouseMove}
                      onTouchEnd={handleMouseUp}
                  >
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
                      </Layer>
                  </Stage>
              </DrawingLayer>
          )}

          <ContentEditable 
            ref={editorRef}
            contentEditable={true}
            $template={settings.template}
            $method={settings.method}
            placeholder={settings.method === 'handwriting' || settings.template === 'cornell' || settings.template === 'meeting' ? '' : "여기에 내용을 작성하세요..."}
            onMouseUp={saveSelection}
            onKeyUp={saveSelection}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: settings.method === 'handwriting' ? 0 : 1 }}
          />
        </div>
      </EditorContainer>
    </PageContainer>
  );
};

export default NotePage;
