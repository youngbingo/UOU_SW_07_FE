import React, { useState, useEffect } from 'react';
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
  
  /* 2줄까지만 표시하고 ... 처리 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  // 더미 데이터 + 로컬스토리지 데이터 로드
  useEffect(() => {
    const loadNotes = () => {
      const loadedNotes = [];
      // 더미 데이터 추가
      loadedNotes.push(
        { id: 1, title: '알고리즘 3주차 정리', date: '2025-10-06', category: '전공필수', preview: '그래프 탐색 알고리즘(BFS, DFS)의 시간복잡도 분석...' },
        { id: 2, title: '팀 프로젝트 아이디어 회의', date: '2025-10-05', category: '캡스톤디자인', preview: '주제: 대학생을 위한 올인원 플래너 앱 개발...' },
        { id: 3, title: '데이터베이스 모델링 실습', date: '2025-10-03', category: '데이터베이스', preview: 'ERD 다이어그램 작성 및 정규화 과정 실습...' },
        { id: 4, title: '운영체제 중간고사 대비', date: '2025-09-28', category: '전공선택', preview: '프로세스와 스레드의 차이점, 스케줄링 알고리즘 정리...' },
        { id: 5, title: '웹 프로그래밍 기초', date: '2025-09-20', category: '교양', preview: 'HTML, CSS, JavaScript의 기본 동작 원리...' }
      );

      // 로컬스토리지 데이터 추가 (key가 note_로 시작하는 것들)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('note_')) {
          try {
            const noteData = JSON.parse(localStorage.getItem(key));
            // 중복 방지 (날짜 기준, 실제로는 ID가 필요)
            if (!loadedNotes.find(n => n.date === noteData.date)) {
                // HTML 태그 제거하고 순수 텍스트만 미리보기에 사용
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = noteData.content;
                const plainText = tempDiv.textContent || tempDiv.innerText || '';
                
                loadedNotes.unshift({
                    id: key,
                    title: noteData.title,
                    date: noteData.date,
                    category: noteData.category || '기타',
                    preview: plainText.substring(0, 100) + '...'
                });
            }
          } catch (e) {
            console.error('Error parsing note data', e);
          }
        }
      }
      
      // 날짜순 정렬
      loadedNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
      setNotes(loadedNotes);
      setFilteredNotes(loadedNotes);
    };

    loadNotes();
  }, []);

  // 필터링 로직
  useEffect(() => {
    let result = notes;

    if (selectedCategory !== '전체') {
      result = result.filter(note => note.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.preview.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotes(result);
  }, [selectedCategory, searchTerm, notes]);

  // 카테고리 목록 추출
  const categories = ['전체', ...new Set(notes.map(n => n.category))];

  return (
    <PageContainer>
      <Header>
        <Title>내 노트 목록</Title>
      </Header>

      <SearchBar>
        <FaSearch color="#888" />
        <input 
            type="text" 
            placeholder="노트 제목, 내용 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      <FilterBar>
        {categories.map(cat => (
            <FilterChip 
                key={cat} 
                $active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
            >
                {cat}
            </FilterChip>
        ))}
      </FilterBar>

      <NoteList>
        {filteredNotes.map(note => (
          <NoteCard key={note.id} onClick={() => navigate(`/note/${note.date}`)}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
              <NoteTitle>{note.title}</NoteTitle>
              <Tag>{note.category}</Tag>
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
        {filteredNotes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                작성된 노트가 없습니다.
            </div>
        )}
      </NoteList>
    </PageContainer>
  );
};

export default NoteListPage;
