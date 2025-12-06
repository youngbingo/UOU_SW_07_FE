import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

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
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing.medium};
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100%;
  border: none;
  resize: none;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  line-height: 1.6;
  outline: none;
`;

const NotePage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState('');

  const handleSave = () => {
    console.log('저장된 텍스트:', text);
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

      <EditorContainer>
        <TextArea 
          placeholder="오늘의 수업 내용, 과제, 할 일을 자유롭게 적어보세요..." 
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </EditorContainer>
    </PageContainer>
  );
};

export default NotePage;
