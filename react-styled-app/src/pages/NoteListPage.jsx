import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaPen, FaSearch } from 'react-icons/fa';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.text};
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.surface};
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  flex: 1;
  max-width: 400px;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  
  input {
    border: none;
    outline: none;
    margin-left: 8px;
    width: 100%;
    font-size: ${({ theme }) => theme.fontSizes.medium};
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterChip = styled.button`
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.text};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  padding: 6px 12px;
  border-radius: 16px;
  font-size: ${({ theme }) => theme.fontSizes.small};
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.gray};
  }
`;

const NoteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const NoteCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const NoteTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  margin-bottom: 4px;
  font-family: 'Pretendard';
  color: ${({ theme }) => theme.colors.text};
`;

const NotePreview = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 10px;
  line-height: 1.4;
`;

const NoteMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: 'Inter';
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.background};
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  margin-left: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const NoteListPage = () => {
  const navigate = useNavigate();

  // 더미 데이터 (CalendarPage보다 더 많이)
  const notes = [
    { id: 1, title: '알고리즘 3주차 정리', date: '2025-10-06', tag: '전공필수', preview: '그래프 탐색 알고리즘(BFS, DFS)의 시간복잡도 분석...' },
    { id: 2, title: '팀 프로젝트 아이디어 회의', date: '2025-10-05', tag: '캡스톤디자인', preview: '주제: 대학생을 위한 올인원 플래너 앱 개발...' },
    { id: 3, title: '데이터베이스 모델링 실습', date: '2025-10-03', tag: '데이터베이스', preview: 'ERD 다이어그램 작성 및 정규화 과정 실습...' },
    { id: 4, title: '운영체제 중간고사 대비', date: '2025-09-28', tag: '전공선택', preview: '프로세스와 스레드의 차이점, 스케줄링 알고리즘 정리...' },
    { id: 5, title: '웹 프로그래밍 기초', date: '2025-09-20', tag: '교양', preview: 'HTML, CSS, JavaScript의 기본 동작 원리...' },
  ];

  return (
    <PageContainer>
      <Header>
        <Title>내 노트 목록</Title>
      </Header>

      <SearchBar>
        <FaSearch color="#888" />
        <input type="text" placeholder="노트 제목, 내용 검색..." />
      </SearchBar>

      <FilterBar>
        <FilterChip $active>전체</FilterChip>
        <FilterChip>전공필수</FilterChip>
        <FilterChip>캡스톤디자인</FilterChip>
        <FilterChip>데이터베이스</FilterChip>
        <FilterChip>교양</FilterChip>
      </FilterBar>

      <NoteList>
        {notes.map(note => (
          <NoteCard key={note.id} onClick={() => navigate(`/note/${note.date}`)}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
              <NoteTitle>{note.title}</NoteTitle>
              <Tag>{note.tag}</Tag>
            </div>
            <NotePreview>
              {note.preview}
            </NotePreview>
            <NoteMeta>
              <span>{note.date}</span>
              <FaPen style={{ fontSize: '12px' }} />
            </NoteMeta>
          </NoteCard>
        ))}
      </NoteList>
    </PageContainer>
  );
};

export default NoteListPage;
