import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  height: 80vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DateTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
`;

const Button = styled.button`
  background-color: ${({ theme, $secondary }) => $secondary ? theme.colors.gray : theme.colors.primary};
  color: ${({ theme, $secondary }) => $secondary ? theme.colors.text : 'white'};
  border: none;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  
  &:hover {
    opacity: 0.9;
  }
`;

const EditorArea = styled.textarea`
  flex: 1;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.medium};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  resize: none;
  
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    border-color: transparent;
  }
`;

const NotePage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');

  const handleSave = () => {
    alert('저장되었습니다! (기능 미구현)');
    navigate('/');
  };

  return (
    <PageContainer>
      <Header>
        <DateTitle>{date} 노트</DateTitle>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button $secondary onClick={() => navigate(-1)}>취소</Button>
          <Button onClick={handleSave}>저장</Button>
        </div>
      </Header>
      <EditorArea 
        placeholder="오늘의 수업 내용, 과제, 할 일을 자유롭게 적어보세요..." 
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </PageContainer>
  );
};

export default NotePage;

