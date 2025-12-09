import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUsers, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { joinTeam } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: ${({ theme }) => theme.spacing.large};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xlarge};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.large};
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const Icon = styled.div`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing.large};
  color: ${({ $success, theme }) => $success ? '#2ECC71' : '#E74C3C'};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.large};
  line-height: 1.6;
`;

const TeamName = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin: ${({ theme }) => theme.spacing.medium} 0;
  padding: ${({ theme }) => theme.spacing.medium};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: bold;
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.medium};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: ${({ theme }) => theme.colors.gray};
  color: ${({ theme }) => theme.colors.text};
  margin-left: ${({ theme }) => theme.spacing.small};
`;

const LoadingSpinner = styled.div`
  border: 4px solid ${({ theme }) => theme.colors.border};
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin: 0 auto ${({ theme }) => theme.spacing.large};

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const JoinTeamPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'need-login'
  const [teamName, setTeamName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleJoinTeam = React.useCallback(async () => {
    if (!teamId) {
      setStatus('error');
      setErrorMessage('유효하지 않은 초대 링크입니다.');
      return;
    }

    // 로그인 확인
    if (!currentUser) {
      setStatus('need-login');
      return;
    }

    setStatus('loading');
    
    try {
      const result = await joinTeam(teamId);
      setTeamName(result.teamName);
      setStatus('success');
      
      // 3초 후 팀 페이지로 이동
      setTimeout(() => {
        navigate(`/team/${teamId}`);
      }, 3000);
    } catch (e) {
      setStatus('error');
      setErrorMessage(e.message || '팀 참가에 실패했습니다.');
    }
  }, [teamId, currentUser, navigate]);

  useEffect(() => {
    handleJoinTeam();
  }, [handleJoinTeam]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <LoadingSpinner />
            <Title>팀에 참가하는 중...</Title>
            <Message>잠시만 기다려주세요.</Message>
          </>
        );

      case 'need-login':
        return (
          <>
            <Icon>
              <FaUsers />
            </Icon>
            <Title>로그인이 필요합니다</Title>
            <Message>
              팀에 참가하려면 먼저 로그인해주세요.
            </Message>
            <Button onClick={() => navigate('/')}>
              홈으로 이동하여 로그인
            </Button>
          </>
        );

      case 'success':
        return (
          <>
            <Icon $success>
              <FaCheckCircle />
            </Icon>
            <Title>팀 참가 완료! 🎉</Title>
            <TeamName>{teamName}</TeamName>
            <Message>
              성공적으로 팀에 참가했습니다!<br/>
              잠시 후 팀 페이지로 이동합니다...
            </Message>
            <Button onClick={() => navigate(`/team/${teamId}`)}>
              팀 페이지로 이동
            </Button>
            <SecondaryButton onClick={() => navigate('/')}>
              홈으로
            </SecondaryButton>
          </>
        );

      case 'error':
        return (
          <>
            <Icon>
              <FaTimesCircle />
            </Icon>
            <Title>팀 참가 실패</Title>
            <Message>{errorMessage}</Message>
            <Message style={{ fontSize: '14px', marginTop: '20px' }}>
              💡 팁: 초대 코드를 직접 입력하려면<br/>
              사이드바 → 팀 워크스페이스 → "팀 참가하기"를 이용하세요.
            </Message>
            <Button onClick={() => navigate('/')}>
              홈으로
            </Button>
            <SecondaryButton onClick={handleJoinTeam}>
              다시 시도
            </SecondaryButton>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <Card>
        {renderContent()}
      </Card>
    </PageContainer>
  );
};

export default JoinTeamPage;
