import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUsers, FaFileAlt, FaPlus, FaClock, FaEllipsisH } from 'react-icons/fa';

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

const ActivityList = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gray};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
  
  strong {
    font-weight: 600;
  }
`;

const ActivityTime = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DummyBadge = styled.span`
  font-size: 12px;
  background-color: ${({ theme }) => theme.colors.gray};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: normal;
  margin-left: 8px;
  vertical-align: middle;
`;

const TeamSpacePage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  
  // 더미 데이터
  const teamName = teamId === 'capstone' ? '🎓 캡스톤 디자인 A조' : 
                   teamId === 'hackathon' ? '🚀 해커톤 불꽃코딩' : '팀 스페이스';
  
  const members = [
    { id: 1, name: '나', color: '#4A90E2' },
    { id: 2, name: '김철수', color: '#F5A623' },
    { id: 3, name: '이영희', color: '#2ECC71' },
    { id: 4, name: '박지민', color: '#E74C3C' },
  ];

  const docs = [
    { id: 1, title: '기획안 v1.0', date: '2025-10-06', author: '김철수' },
    { id: 2, title: 'API 명세서', date: '2025-10-05', author: '이영희' },
    { id: 3, title: '회의록 (10/04)', date: '2025-10-04', author: '나' },
    { id: 4, title: '발표 자료 초안', date: '2025-10-03', author: '박지민' },
  ];

  const activities = [
    { id: 1, user: '김철수', action: '기획안 v1.0 문서를 수정했습니다.', time: '10분 전' },
    { id: 2, user: '이영희', action: 'API 명세서에 댓글을 남겼습니다.', time: '1시간 전' },
    { id: 3, user: '박지민', action: '새로운 문서 "디자인 가이드"를 생성했습니다.', time: '3시간 전' },
  ];

  return (
    <PageContainer>
      <Header>
        <TeamInfo>
          <TeamName>
            {teamName} <DummyBadge>DUMMY</DummyBadge>
          </TeamName>
          <TeamMeta>
            <FaUsers /> 멤버 {members.length}명 · <FaClock /> 최근 활동: 오늘
          </TeamMeta>
        </TeamInfo>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MemberList>
                {members.map(m => (
                    <MemberAvatar key={m.id} $color={m.color} title={m.name}>
                        {m.name[0]}
                    </MemberAvatar>
                ))}
            </MemberList>
            <InviteButton onClick={() => alert('초대 링크가 복사되었습니다!')}>
                <FaPlus /> 초대
            </InviteButton>
        </div>
      </Header>

      <Section>
        <SectionTitle>
          <span>공유 문서 <DummyBadge>DUMMY</DummyBadge></span>
          <button 
            style={{ background: 'none', border: 'none', color: '#4A90E2', cursor: 'pointer', fontSize: '14px' }}
            onClick={() => navigate('/note/new', { state: { method: 'text', template: 'meeting' } })}
          >
            + 새 문서 만들기
          </button>
        </SectionTitle>
        <CardGrid>
          {docs.map(doc => (
            <DocCard key={doc.id} onClick={() => navigate(`/note/${doc.date}`)}>
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
            onClick={() => navigate('/note/new')}
          >
            <FaPlus size={24} />
            <span style={{ marginTop: '8px' }}>새 문서</span>
          </DocCard>
        </CardGrid>
      </Section>

      <Section>
        <SectionTitle>최근 활동 <DummyBadge>DUMMY</DummyBadge></SectionTitle>
        <ActivityList>
          {activities.map(activity => (
            <ActivityItem key={activity.id}>
              <ActivityIcon>
                <FaClock size={14} />
              </ActivityIcon>
              <ActivityContent>
                <ActivityText>
                  <strong>{activity.user}</strong>님이 {activity.action}
                </ActivityText>
                <ActivityTime>{activity.time}</ActivityTime>
              </ActivityContent>
            </ActivityItem>
          ))}
        </ActivityList>
      </Section>
    </PageContainer>
  );
};

export default TeamSpacePage;

