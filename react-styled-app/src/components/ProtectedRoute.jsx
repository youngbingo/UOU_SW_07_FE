import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

const Icon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.primary};
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 30px;
  line-height: 1.5;
`;

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return null; // 로딩 중에는 아무것도 표시하지 않음 (또는 로딩 스피너)

  if (!currentUser) {
    return (
      <Container>
        <Icon>🔒</Icon>
        <Title>로그인이 필요합니다</Title>
        <Description>
            서비스를 이용하려면 로그인이 필요합니다.<br/>
            우측 상단의 로그인 버튼을 눌러 시작해주세요.
        </Description>
      </Container>
    );
  }

  return children;
};

export default ProtectedRoute;
