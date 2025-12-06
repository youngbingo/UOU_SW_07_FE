import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaBold, FaItalic, FaUnderline, FaPalette, FaHeading } from 'react-icons/fa';

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
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: ${({ $primary, theme }) => $primary ? theme.colors.primary : 'white'};
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
  background: white;
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
  background: ${({ $active, theme }) => $active ? '#e0e0e0' : 'white'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    background: #f0f0f0;
  }
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
`;

const ContentEditable = styled.div`
  flex: 1;
  padding: 20px;
  outline: none;
  overflow-y: auto;
  font-size: 16px;
  line-height: 1.6;

  h2, h3 {
    font-weight: bold;
    margin: 0.5em 0;
  }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  p { margin: 0.5em 0; }

  &:empty:before {
    content: attr(placeholder);
    color: #aaa;
    display: block;
  }
`;

const NotePage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const savedRange = useRef(null); // 선택 영역 저장용
  const [color, setColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('16');

  // 선택 영역 변경 시 저장
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // 에디터 내부인지 확인
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRange.current = range.cloneRange();
      }
    }
  };

  // 저장된 선택 영역 복구
  const restoreSelection = () => {
    const selection = window.getSelection();
    selection.removeAllRanges();
    if (savedRange.current) {
      selection.addRange(savedRange.current);
    }
  };

  // 스타일 적용 공통 함수 (Range 복구 포함)
  const applyStyle = (command, value = null) => {
    restoreSelection(); // 스타일 적용 전 선택 영역 복구
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      saveSelection(); // 적용 후 다시 저장
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
    restoreSelection(); // 포커스 잃었을 때를 대비해 복구
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    // 1. 기존 방식: execCommand (px 단위 직접 지원 안함, size 1~7만 가능) -> 꼼수 사용
    // document.execCommand("fontSize", false, "7"); 
    
    // 2. Span 태그 감싸기 방식 (px 지원)
    const range = selection.getRangeAt(0);
    if (!selection.isCollapsed) {
      const span = document.createElement('span');
      span.style.fontSize = `${size}px`;
      
      try {
        range.surroundContents(span);
      } catch (e) {
        // 이미 다른 태그와 겹쳐서 surroundContents가 실패하는 경우
        // execCommand로 임시 폰트 크기를 주고, 해당 폰트 태그를 찾아 스타일을 입히는 방식 사용
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

  return (
    <PageContainer>
      <Header>
        <DateTitle>
          <ActionButton onClick={() => navigate(-1)} style={{ padding: '8px' }}>
            <FaArrowLeft />
          </ActionButton>
          {date} 노트
        </DateTitle>
        <ActionButton $primary onClick={() => {
            if (editorRef.current) console.log(editorRef.current.innerHTML);
            alert('저장되었습니다!');
            navigate('/');
        }}>
          <FaSave /> 저장
        </ActionButton>
      </Header>

      <EditorContainer>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '12px' }}>크기:</span>
            <FontSizeInput 
              type="number" 
              value={fontSize} 
              onFocus={() => {
                // 입력창 포커스 시 선택 영역이 날아가지 않도록 미리 저장
                // 하지만 이미 onMouseUp 등에서 저장되었을 것임
              }}
              onChange={(e) => setFontSize(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyFontSize(fontSize);
                  e.preventDefault(); // 폼 제출 방지
                }
              }}
            />
            <span style={{ fontSize: '12px' }}>px</span>
            <ToolBtn onClick={() => applyFontSize(fontSize)} style={{fontSize: '12px'}}>적용</ToolBtn>
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
          placeholder="여기에 내용을 작성하세요..."
          onMouseUp={saveSelection} // 마우스 뗄 때 선택 영역 저장
          onKeyUp={saveSelection}   // 키보드 입력 시 선택 영역 저장
        />
      </EditorContainer>
    </PageContainer>
  );
};

export default NotePage;
