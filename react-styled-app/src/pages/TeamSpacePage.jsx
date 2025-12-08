import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUsers, FaFileAlt, FaPlus, FaClock, FaUser } from 'react-icons/fa';
import { subscribeToTeam, subscribeToTeamDocs, createTeamDoc } from '../utils/storage';
import AlertModal from '../components/AlertModal';
import PromptModal from '../components/PromptModal';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const Header = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.medium};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.small};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TeamInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TeamName = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TeamMeta = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InviteButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    opacity: 0.9;
  }
`;

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacing.medium};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.medium};
`;

const DocCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const DocTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const DocMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MemberList = styled.div`
  display: flex;
  gap: -8px;
`;

const MemberAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color || '#ccc'};
  border: 2px solid ${({ theme }) => theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  margin-left: -8px;
  
  &:first-child {
    margin-left: 0;
  }
`;

const TeamSpacePage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  
  const [teamData, setTeamData] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState({ isOpen: false, title: '', message: '' });
  const [promptState, setPromptState] = useState({ isOpen: false, title: '', placeholder: '', onConfirm: () => {} });

  useEffect(() => {
    if (!teamId) return;

    setLoading(true);
    // 1. 팀 정보 구독
    const unsubscribeTeam = subscribeToTeam(teamId, (data) => {
        setTeamData(data);
    });

    // 2. 팀 문서 구독
    const unsubscribeDocs = subscribeToTeamDocs(teamId, (data) => {
        setDocs(data);
        setLoading(false);
    });

    return () => {
        unsubscribeTeam();
        unsubscribeDocs();
    };
  }, [teamId]);

  const handleCreateDoc = () => {
    setPromptState({
        isOpen: true,
        title: "새 문서 만들기",
        placeholder: "문서 제목을 입력하세요",
        onConfirm: async (title) => {
            try {
                await createTeamDoc(teamId, title);
            } catch (e) {
                setAlertState({
                    isOpen: true,
                    title: "오류",
                    message: "문서 생성에 실패했습니다. (권한이 없거나 로그인이 필요합니다)"
                });
            }
        }
    });
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(teamId);
    setAlertState({
        isOpen: true,
        title: "초대 코드 복사 완료",
        message: `팀 코드(${teamId})가 복사되었습니다! 팀원에게 공유하세요.`
    });
  };

  if (loading && !teamData) {
      return <PageContainer><div style={{padding: 20}}>Loading...</div></PageContainer>;
  }

  if (!teamData) {
      return <PageContainer><div style={{padding: 20}}>팀을 찾을 수 없습니다.</div></PageContainer>;
  }

  return (
    <PageContainer>
      <Header>
        <TeamInfo>
          <TeamName>
            {teamData.name}
          </TeamName>
          <TeamMeta>
            <FaUsers /> 멤버 {teamData.members ? teamData.members.length : 0}명
          </TeamMeta>
        </TeamInfo>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MemberList>
                {teamData.members && teamData.members.slice(0, 5).map((uid, index) => (
                    <MemberAvatar key={uid} $color={['#4A90E2', '#F5A623', '#2ECC71'][index % 3]} title={uid}>
                        <FaUser size={12}/>
                    </MemberAvatar>
                ))}
                {teamData.members && teamData.members.length > 5 && (
                    <MemberAvatar $color="#999">+{teamData.members.length - 5}</MemberAvatar>
                )}
            </MemberList>
            <InviteButton onClick={copyInviteLink}>
                <FaPlus /> 초대
            </InviteButton>
        </div>
      </Header>

      <Section>
        <SectionTitle>
          <span>공유 문서</span>
          <button 
            style={{ background: 'none', border: 'none', color: '#4A90E2', cursor: 'pointer', fontSize: '14px' }}
            onClick={handleCreateDoc}
          >
            + 새 문서 만들기
          </button>
        </SectionTitle>
        <CardGrid>
          {docs.map(doc => (
            <DocCard key={doc.id} onClick={() => navigate(`/note/${doc.id}?teamId=${teamId}`)}>
              <FaFileAlt size={24} color="#4A90E2" style={{ marginBottom: '12px' }} />
              <DocTitle>{doc.title}</DocTitle>
              <DocMeta>
                <span>{doc.author}</span>
                <span>{doc.date}</span>
              </DocMeta>
            </DocCard>
          ))}
          <DocCard 
            style={{ border: '2px dashed #ddd', background: 'transparent', justifyContent: 'center', alignItems: 'center', color: '#888' }}
            onClick={handleCreateDoc}
          >
            <FaPlus size={24} />
            <span style={{ marginTop: '8px' }}>새 문서</span>
          </DocCard>
        </CardGrid>
      </Section>

      <Section>
        <SectionTitle>최근 활동</SectionTitle>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999', background: '#f9f9f9', borderRadius: '8px' }}>
            활동 로그 기능은 준비 중입니다.
        </div>
      </Section>

      <AlertModal 
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
        title={alertState.title}
        message={alertState.message}
      />
      
      <PromptModal
        isOpen={promptState.isOpen}
        onClose={() => setPromptState({ ...promptState, isOpen: false })}
        onConfirm={promptState.onConfirm}
        title={promptState.title}
        placeholder={promptState.placeholder}
      />
    </PageContainer>
  );
};

export default TeamSpacePage;

