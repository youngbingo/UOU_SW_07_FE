import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaPen, FaSearch, FaTrash } from 'react-icons/fa';
import { deleteNote } from '../utils/storage'; // deleteNote 추가
import ConfirmModal from '../components/ConfirmModal';

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

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 4px;
  cursor: pointer;
  transition: color 0.2s;
  margin-left: 8px;

  &:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const NoteListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag'); // URL에서 tag 파라미터 가져오기
  
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmState, setConfirmState] = useState({ isOpen: false, noteId: null, noteDate: null });
  const [subjects, setSubjects] = useState([]); // 시간표 과목 목록

  // 시간표에서 과목 목록 가져오기
  useEffect(() => {
    const savedTimetable = localStorage.getItem('timetable');
    if (savedTimetable) {
      try {
        const parsed = JSON.parse(savedTimetable);
        const uniqueSubjects = [...new Set(parsed.map(item => item.name))].filter(Boolean);
        setSubjects(uniqueSubjects);
      } catch (e) {
        console.error('Failed to load timetable subjects', e);
      }
    }
  }, []);

  // URL tag 파라미터가 있으면 자동 필터링
  useEffect(() => {
    if (tagFilter) {
      setSelectedCategory(tagFilter);
    }
  }, [tagFilter]);

  const loadNotes = () => {
    const loadedNotes = [];
    
    // 로컬스토리지 데이터 추가 (key가 note_로 시작하는 것들)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('note_')) {
        try {
          const noteData = JSON.parse(localStorage.getItem(key));
          if (!loadedNotes.find(n => n.date === noteData.date)) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = noteData.content;
              const plainText = tempDiv.textContent || tempDiv.innerText || '';
              
              loadedNotes.unshift({
                  id: key.replace('note_', ''), // ID 추출 방식 수정
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

  // 데이터 로드
  useEffect(() => {
    loadNotes();
  }, []);

  const handleDelete = (e, noteId, noteDate) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    setConfirmState({ isOpen: true, noteId, noteDate });
  };

  const confirmDelete = async () => {
    try {
      await deleteNote(confirmState.noteId, confirmState.noteDate);
      loadNotes(); // 목록 새로고침
      setConfirmState({ isOpen: false, noteId: null, noteDate: null });
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

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

  // 카테고리 목록: 전체 + 시간표 과목 + 기타 카테고리들
  const timetableCategories = ['전체', ...subjects];
  const otherCategories = [...new Set(notes.map(n => n.category))].filter(cat => !subjects.includes(cat));
  const categories = [...timetableCategories, ...otherCategories];

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
          <NoteCard key={note.id} onClick={() => navigate(`/note/${note.id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <NoteTitle>{note.title || '제목 없음'}</NoteTitle>
                <Tag>{note.category}</Tag>
              </div>
              <DeleteButton onClick={(e) => handleDelete(e, note.id, note.date)}>
                <FaTrash size={12} />
              </DeleteButton>
            </div>
            <NotePreview>
              {note.preview}
            </NotePreview>
            <NoteMeta>
              <span>{note.date || '날짜 없음'}</span>
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

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, noteId: null, noteDate: null })}
        onConfirm={confirmDelete}
        title="노트 삭제"
        message="정말 삭제하시겠습니까?"
        danger={true}
      />
    </PageContainer>
  );
};

export default NoteListPage;
