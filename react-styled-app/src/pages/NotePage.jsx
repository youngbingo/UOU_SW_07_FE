import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaBold, FaItalic, FaUnderline, FaPalette, FaListUl, FaMinus, FaSmile, FaPen, FaEraser, FaTrash } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { Stage, Layer, Line } from 'react-konva';

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
  const [fontSize, setFontSize] = useState('16');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [category, setCategory] = useState('전공필수');
  const [settings, setSettings] = useState(location.state || { method: 'text', template: 'blank' });

  // 드로잉 관련 상태
  const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);

  useEffect(() => {
    const savedNote = localStorage.getItem(`note_${date}`);
    if (savedNote) {
      const parsed = JSON.parse(savedNote);
      if (editorRef.current) {
        editorRef.current.innerHTML = parsed.content;
      }
      setSettings({ method: parsed.method, template: parsed.template });
      if (parsed.category) setCategory(parsed.category);
      if (parsed.drawingData) setLines(parsed.drawingData);
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

  // 드로잉 이벤트 핸들러
  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y], color: color, strokeWidth: tool === 'eraser' ? 20 : 2 }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
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
                onClick={() => setTool('pen')}
                title="펜"
              >
                <FaPen />
              </ToolBtn>
              <ToolBtn 
                $active={tool === 'eraser'} 
                onClick={() => setTool('eraser')}
                title="지우개"
              >
                <FaEraser />
              </ToolBtn>

              <ToolBtn 
                onClick={() => {
                    if(window.confirm('모든 필기 내용을 지우시겠습니까?')) {
                        setLines([]);
                    }
                }}
                title="전체 지우기"
              >
                <FaTrash />
              </ToolBtn>
              
              <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 4px' }}></div>
              
              <ColorPickerWrapper>
                <FaPalette color={color} />
                <ColorInput 
                  type="color" 
                  value={color} 
                  onChange={(e) => {
                    setColor(e.target.value);
                  }} 
                  title="펜 색상"
                />
              </ColorPickerWrapper>
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
                  onChange={(e) => {
                    setColor(e.target.value);
                    restoreSelection();
                    document.execCommand('foreColor', false, e.target.value);
                  }} 
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
                      <Layer>
                          {lines.map((line, i) => (
                              <Line
                                  key={i}
                                  points={line.points}
                                  stroke={line.tool === 'eraser' ? '#ffffff' : line.color} // 지우개는 배경색으로 덮어쓰기 (간단 구현)
                                  strokeWidth={line.strokeWidth}
                                  tension={0.5}
                                  lineCap="round"
                                  lineJoin="round"
                                  globalCompositeOperation={
                                      line.tool === 'eraser' ? 'destination-out' : 'source-over'
                                  }
                              />
                          ))}
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
