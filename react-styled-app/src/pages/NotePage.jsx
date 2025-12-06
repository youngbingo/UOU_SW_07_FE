import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaBold, FaItalic, FaUnderline, FaPalette, FaListUl, FaMinus, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

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

const NotePage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const editorRef = useRef(null);
  const savedRange = useRef(null); 
  const [color, setColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('16');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const [settings, setSettings] = useState(location.state || { method: 'text', template: 'blank' });

  useEffect(() => {
    const savedNote = localStorage.getItem(`note_${date}`);
    if (savedNote) {
      const parsed = JSON.parse(savedNote);
      if (editorRef.current) {
        editorRef.current.innerHTML = parsed.content;
      }
      setSettings({ method: parsed.method, template: parsed.template });
    } else {
        if (editorRef.current && editorRef.current.innerHTML === "") {
            let initialHTML = "";
            
            if (settings.method === 'handwriting' && settings.template === 'cornell') {
                initialHTML = `
                    <div class="cornell-container" style="display: flex; height: 100%; gap: 10px;">
                        <div class="cue-column" style="width: 30%; min-width: 150px; border-right: 2px solid #ddd; padding-right: 10px;" contenteditable="true" placeholder="키워드/질문"></div>
                        <div class="note-column" style="flex: 1;" contenteditable="true" placeholder="강의 내용 필기"></div>
                    </div>
                    <div class="summary-section" style="border-top: 2px solid #ddd; min-height: 100px; margin-top: 20px; padding-top: 10px;" contenteditable="true" placeholder="요약 정리"></div>
                `;
            }
            else if (settings.method === 'text' && settings.template === 'meeting') {
                initialHTML = `
                    <h2>📅 회의 개요</h2>
                    <p><strong>일시:</strong> ${date}</p>
                    <p><strong>참석자:</strong> </p>
                    <hr />
                    <h3>📝 안건</h3>
                    <ul>
                        <li>안건 1</li>
                        <li>안건 2</li>
                    </ul>
                    <br />
                    <h3>✅ 결정 사항 및 할 일</h3>
                    <ul>
                        <li>[담당자] 할 일 내용</li>
                    </ul>
                `;
            }
            else if (settings.method === 'text' && settings.template === 'dev_log') {
                initialHTML = `
                    <h2>🎯 오늘의 목표</h2>
                    <ul>
                        <li></li>
                    </ul>
                    <hr />
                    <h3>💡 배운 점 / 진행 상황</h3>
                    <p>오늘 학습하거나 개발한 내용을 자유롭게 기록하세요.</p>
                    <br />
                    <h3>🔥 이슈 / 트러블슈팅</h3>
                    <p><strong>문제:</strong> </p>
                    <p><strong>해결:</strong> </p>
                `;
            }
            else if (settings.method === 'text' && settings.template === 'todo') {
                initialHTML = `
                    <h2>✅ 체크리스트</h2>
                    <ul>
                        <li>할 일 1</li>
                        <li>할 일 2</li>
                        <li>할 일 3</li>
                    </ul>
                    <hr />
                    <h3>📌 메모</h3>
                    <p></p>
                `;
            }

            if (initialHTML) {
                editorRef.current.innerHTML = initialHTML;
            }
        }
    }
  }, [date, settings.method, settings.template]);

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
        updatedAt: new Date().toISOString(),
        title: editorRef.current.innerText.split('\n')[0] || '제목 없음' 
      };
      
      localStorage.setItem(`note_${date}`, JSON.stringify(noteData));
      console.log('Saved:', noteData);
    }
    alert('저장되었습니다!');
    navigate('/');
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
        <ActionButton $primary onClick={handleSave}>
          <FaSave /> 저장
        </ActionButton>
      </Header>

      <EditorContainer $template={settings.template} $method={settings.method}>
        <Toolbar>
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
        </Toolbar>
        
        <ContentEditable 
          ref={editorRef}
          contentEditable={true}
          $template={settings.template}
          $method={settings.method}
          placeholder={settings.template === 'cornell' || settings.template === 'meeting' ? '' : "여기에 내용을 작성하세요..."}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
        />
      </EditorContainer>
    </PageContainer>
  );
};

export default NotePage;
