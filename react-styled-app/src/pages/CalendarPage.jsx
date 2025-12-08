import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaPlus, FaList, FaCalendarAlt, FaChevronRight, FaCog, FaTimes } from 'react-icons/fa';
import CreateNoteModal from '../components/CreateNoteModal';
import AlertModal from '../components/AlertModal';
import { loadDayNotesList, saveNote, loadRecentNotes, deleteNote, getUserTeams, createTeam } from '../utils/storage'; // loadRecentNotes, 팀 관련 함수 추가

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  position: relative;
  min-height: 80vh;
`;

const ViewToggle = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.surface};
  padding: 4px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  width: fit-content;
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const ToggleBtn = styled.button`
  border: none;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  color: ${({ $active, theme }) => ($active ? 'white' : theme.colors.textSecondary)};
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    color: ${({ $active, theme }) => ($active ? 'white' : theme.colors.primary)};
  }
`;

const Section = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.medium};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.small};
  position: relative;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DummyBadge = styled.span`
  font-size: 12px;
  background-color: ${({ theme }) => theme.colors.gray};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: normal;
`;

const MoreLink = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  margin-left: auto;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

const SettingBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  font-size: 16px;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

// 캘린더 스타일 오버라이드
const StyledCalendarWrapper = styled.div`
  .react-calendar {
    width: 100%;
    border: none;
    font-family: inherit;
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
  }
  .react-calendar__tile {
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 8px;
    color: ${({ theme }) => theme.colors.text};
    position: relative;
  }
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background: ${({ theme }) => theme.colors.gray};
  }
  .react-calendar__tile--active {
    background: ${({ theme }) => theme.colors.primary} !important;
    color: white !important;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
  .react-calendar__tile--now {
    background: ${({ theme }) => theme.colors.secondary}33;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
  .react-calendar__month-view__days__day--weekend {
    color: ${({ theme }) => theme.colors.danger};
  }
  .react-calendar__navigation button {
    color: ${({ theme }) => theme.colors.text};
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: ${({ theme }) => theme.colors.gray};
  }
`;

const NoteDot = styled.div`
  width: 6px;
  height: 6px;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 50%;
  position: absolute;
  bottom: 8px;
`;

// 시간표 (Grid) 스타일
const TimeTableGrid = styled.div`
  display: grid;
  grid-template-columns: 50px repeat(5, 1fr); // 시간 + 월~금
  gap: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
`;

const GridCell = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 4px;
  min-height: 60px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
`;

const HeaderCell = styled(GridCell)`
  background-color: ${({ theme }) => theme.colors.background};
  font-weight: bold;
`;

const ClassCell = styled(GridCell)`
  background-color: ${({ theme, color }) => color || theme.colors.primary}22;
  color: ${({ theme }) => theme.colors.text};
  border-left: 3px solid ${({ theme, color }) => color || theme.colors.primary};
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  font-size: 11px;
  line-height: 1.2;

  &:hover {
    opacity: 0.8;
  }
`;

const AddClassBtn = styled.button`
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;

  &:hover {
    opacity: 1;
    background: ${({ theme }) => theme.colors.primary}11;
  }
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  box-shadow: ${({ theme }) => theme.shadows.large};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  z-index: 100;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const NoteItem = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
  position: relative;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray};
  }
`;

const NoteItemTitle = styled.h4`
  margin-bottom: 4px;
  font-weight: 600;
  font-family: 'Pretendard';
  color: ${({ theme }) => theme.colors.text};
`;

const NoteItemMeta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: 'Inter';
`;

const NoteItemTime = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// 모달 스타일
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 20px;
  border-radius: 12px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModalTitle = styled.h3`
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Button = styled.button`
  padding: 8px;
  background: ${({ $primary, theme }) => $primary ? theme.colors.primary : theme.colors.gray};
  color: ${({ $primary, theme }) => $primary ? 'white' : theme.colors.text};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    opacity: 0.9;
  }
`;

const TeamItem = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  transition: transform 0.2s;

  &:hover {
    transform: translateX(4px);
    background-color: ${({ theme }) => theme.colors.gray};
  }
`;

const CalendarPage = () => {
  const [view, setView] = useState('calendar'); // 'calendar' | 'timetable'
  const [value, onChange] = useState(new Date());
  const navigate = useNavigate();
  
  // 노트 생성/목록 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayNotes, setDayNotes] = useState([]); // 해당 날짜의 노트 목록

  const [timetableData, setTimetableData] = useState([]);
  const [isTimeSettingOpen, setIsTimeSettingOpen] = useState(false);
  const [timeRange, setTimeRange] = useState({ start: 9, end: 18 }); // timeRange 상태 추가
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null); // { day: 0, time: 9 }
  const [classInput, setClassInput] = useState({ name: '', room: '', color: '#4A90E2' });

  const [recentNotes, setRecentNotes] = useState([]);
  const [teams, setTeams] = useState([]); // 팀 목록 상태
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState('');
  const [alertState, setAlertState] = useState({ isOpen: false, title: '', message: '' });

  // 데이터 로드
  useEffect(() => {
    const savedTimetable = localStorage.getItem('timetable');
    if (savedTimetable) setTimetableData(JSON.parse(savedTimetable));
    
    const savedTimeRange = localStorage.getItem('timeRange');
    if (savedTimeRange) setTimeRange(JSON.parse(savedTimeRange));

    // 최근 노트 불러오기
    const fetchRecent = async () => {
        const notes = await loadRecentNotes(3);
        setRecentNotes(notes);
    };
    fetchRecent();

    // 팀 목록 불러오기
    const fetchTeams = async () => {
        const myTeams = await getUserTeams();
        setTeams(myTeams);
    };
    fetchTeams();
  }, []);

  const handleCreateTeam = async () => {
    if (!teamNameInput.trim()) return;
    try {
        const newTeamId = await createTeam(teamNameInput);
        setAlertState({ isOpen: true, title: '성공', message: '팀이 생성되었습니다!' });
        setIsTeamModalOpen(false);
        setTeamNameInput('');
        // 목록 갱신
        const myTeams = await getUserTeams();
        setTeams(myTeams);
    } catch (e) {
        setAlertState({ isOpen: true, title: '오류', message: '팀 생성에 실패했습니다. (로그인 필요)' });
    }
  };

  // 노트 목록 로드 (전체 노트에서 필터링)
  const fetchDayNotes = async (dateStr) => {
    // Storage 유틸 사용 (로컬 -> Firebase 순)
    const notes = await loadDayNotesList(dateStr);
    
    // 마이그레이션 로직 (구버전 호환)
    if (notes.length === 0) {
         const oldNote = localStorage.getItem(`note_${dateStr}`);
         if (oldNote) {
            const parsed = JSON.parse(oldNote);
            const newList = [{
                id: dateStr, 
                title: parsed.title || '제목 없음',
                date: dateStr,
                ...parsed
            }];
            // 새 구조로 저장 (마이그레이션)
            await saveNote(dateStr, newList[0]); 
            return newList;
         }
    }
    return notes;
  };

  const handleDateClick = async (date) => {
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    
    const notes = await fetchDayNotes(dateStr);
    setDayNotes(notes);
    setIsModalOpen(true);
  };

  const handleCreateNote = async (settings) => {
    // 새 노트 ID 생성 (timestamp)
    const newNoteId = `${selectedDate}_${Date.now()}`;
    
    // 빈 노트 데이터 생성
    const newNote = {
        id: newNoteId,
        date: selectedDate,
        title: '새로운 노트',
        updatedAt: new Date().toISOString(), // updatedAt 추가
        ...settings
    };
    
    // Storage 유틸 사용하여 저장
    await saveNote(newNoteId, newNote);

    // 상태 업데이트 (모달 닫고 이동)
    setIsModalOpen(false);
    navigate(`/note/${newNoteId}`);
  };

  const handleNoteClick = (noteId) => {
      navigate(`/note/${noteId}`);
  };

  const handleDeleteNote = async (noteId) => {
    if (!selectedDate) return;
    await deleteNote(noteId, selectedDate);
    const notes = await fetchDayNotes(selectedDate);
    setDayNotes(notes);
  };

  const saveTimeRange = (newRange) => {
    setTimeRange(newRange);
    localStorage.setItem('timeRange', JSON.stringify(newRange));
    setIsTimeSettingOpen(false);
  };

  const saveTimetable = (newData) => {
    setTimetableData(newData);
    localStorage.setItem('timetable', JSON.stringify(newData));
  };

  const days = ['시간', '월', '화', '수', '목', '금'];
  // 동적 시간 배열 생성
  const times = [];
  for (let i = timeRange.start; i < timeRange.end; i++) {
    times.push(`${i.toString().padStart(2, '0')}:00`);
  }

  const handleCellClick = (dayIdx, timeIdx) => {
    const time = timeRange.start + timeIdx;
    const existing = timetableData.find(t => t.day === dayIdx && t.time === time);
    
    setSelectedCell({ day: dayIdx, time });
    if (existing) {
        setClassInput({ name: existing.name, room: existing.room, color: existing.color });
    } else {
        setClassInput({ name: '', room: '', color: '#4A90E2' });
    }
    setClassModalOpen(true);
  };

  const handleSaveClass = () => {
    if (!selectedCell) return;
    
    const newData = timetableData.filter(t => !(t.day === selectedCell.day && t.time === selectedCell.time));
    if (classInput.name) {
        newData.push({ ...selectedCell, ...classInput });
    }
    saveTimetable(newData);
    setClassModalOpen(false);
  };

  const handleDeleteClass = () => {
    if (!selectedCell) return;
    const newData = timetableData.filter(t => !(t.day === selectedCell.day && t.time === selectedCell.time));
    saveTimetable(newData);
    setClassModalOpen(false);
  };


  // 날짜 타일 내용 (메모 있으면 점 표시)
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // 로컬 스토리지에서 리스트 키 존재 여부만 빠르게 확인
      // (비동기 함수를 여기서 쓸 수 없으므로 로컬만 체크)
      const listKey = `note_list_${dateStr}`;
      const hasNotes = localStorage.getItem(listKey);
      const hasOldNote = localStorage.getItem(`note_${dateStr}`);
      
      if (hasNotes || hasOldNote) {
        return <NoteDot />;
      }
    }
    return null;
  };

  return (
    <PageContainer>
      <ViewToggle>
        <ToggleBtn $active={view === 'timetable'} onClick={() => setView('timetable')}>
          <FaList /> 시간표
        </ToggleBtn>
        <ToggleBtn $active={view === 'calendar'} onClick={() => setView('calendar')}>
          <FaCalendarAlt /> 캘린더
        </ToggleBtn>
      </ViewToggle>

      <Section>
        {view === 'calendar' ? (
          <>
            <StyledCalendarWrapper>
              <Calendar 
                onChange={onChange} 
                value={value} 
                onClickDay={handleDateClick}
                formatDay={(locale, date) => format(date, 'd')}
                calendarType="gregory" // 일요일 시작
                tileContent={tileContent} // 메모 점 표시
              />
            </StyledCalendarWrapper>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <Title style={{ marginBottom: 0 }}>
                이번 주 시간표
                </Title>
                <SettingBtn onClick={() => setIsTimeSettingOpen(true)}>
                    <FaCog /> 시간 설정
                </SettingBtn>
            </div>
            
            <TimeTableGrid>
              {days.map((day) => <HeaderCell key={day}>{day}</HeaderCell>)}
              {times.map((time, i) => (
                <React.Fragment key={time}>
                  <GridCell>{time}</GridCell>
                  {[0, 1, 2, 3, 4].map((dayIdx) => {
                    const currentClass = timetableData.find(t => t.day === dayIdx && t.time === (timeRange.start + i));
                    
                    if (currentClass) {
                      return (
                        <ClassCell 
                            key={dayIdx} 
                            color={currentClass.color} 
                            onClick={() => handleCellClick(dayIdx, i)}
                        >
                          {currentClass.name}<br/>({currentClass.room})
                        </ClassCell>
                      );
                    }
                    return (
                        <GridCell key={dayIdx}>
                            <AddClassBtn onClick={() => handleCellClick(dayIdx, i)} />
                        </GridCell>
                    );
                  })}
                </React.Fragment>
              ))}
            </TimeTableGrid>
          </>
        )}
      </Section>

      <Section>
        <Title>
          내 팀 공간
          <SettingBtn onClick={() => setIsTeamModalOpen(true)} style={{ marginLeft: 'auto', fontSize: '14px', background: '#4A90E2', color: 'white', padding: '4px 12px', borderRadius: '4px' }}>
            + 새 팀 만들기
          </SettingBtn>
        </Title>
        {teams.length > 0 ? teams.map((team) => (
          <TeamItem key={team.id} onClick={() => navigate(`/team/${team.id}`)}>
            <NoteItemTitle>{team.name || '팀 이름 없음'}</NoteItemTitle>
            <NoteItemMeta>멤버 {team.members ? team.members.length : 1}명</NoteItemMeta>
          </TeamItem>
        )) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                가입된 팀이 없습니다.
            </div>
        )}
      </Section>

      <Section>
        <Title>
          최근 작성한 노트
          <MoreLink onClick={() => navigate('/notes')}>
            더보기 <FaChevronRight size={12} />
          </MoreLink>
        </Title>
        {recentNotes.length > 0 ? recentNotes.map((note) => (
          <NoteItem key={note.id} onClick={() => navigate(`/note/${note.id}`)}>
            <div>
              <NoteItemTitle>{note.title || '제목 없음'}</NoteItemTitle>
              <NoteItemMeta>
                {note.date || '날짜 없음'} | {note.category || '미분류'}
              </NoteItemMeta>
            </div>
            <NoteItemTime>
                {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : ''}
            </NoteItemTime>
          </NoteItem>
        )) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                작성된 노트가 없습니다.
            </div>
        )}
      </Section>

      <FloatingButton onClick={() => handleDateClick(new Date())}>
        <FaPlus />
      </FloatingButton>

      {isModalOpen && (
        <CreateNoteModal 
          onClose={() => setIsModalOpen(false)} 
          onConfirm={handleCreateNote}
          dayNotes={dayNotes} // 기존 노트 목록 전달
          onSelectNote={handleNoteClick} // 기존 노트 선택 핸들러
          onDeleteNote={handleDeleteNote} // 삭제 핸들러 전달
        />
      )}

      {/* 시간표 설정 모달 */}
      {isTimeSettingOpen && (
        <ModalOverlay onClick={() => setIsTimeSettingOpen(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalTitle>시간표 범위 설정</ModalTitle>
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <span>시작:</span>
                    <Input type="number" value={timeRange.start} onChange={e => setTimeRange({...timeRange, start: Number(e.target.value)})} min="6" max="22" />
                </div>
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <span>종료:</span>
                    <Input type="number" value={timeRange.end} onChange={e => setTimeRange({...timeRange, end: Number(e.target.value)})} min="12" max="24" />
                </div>
                <Button $primary onClick={() => saveTimeRange(timeRange)}>저장</Button>
            </ModalContent>
        </ModalOverlay>
      )}

      {/* 수업 입력 모달 */}
      {classModalOpen && (
        <ModalOverlay onClick={() => setClassModalOpen(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalTitle>수업 정보 입력</ModalTitle>
                <Input 
                    placeholder="수업명" 
                    value={classInput.name} 
                    onChange={e => setClassInput({...classInput, name: e.target.value})} 
                />
                <Input 
                    placeholder="강의실" 
                    value={classInput.room} 
                    onChange={e => setClassInput({...classInput, room: e.target.value})} 
                />
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <span>색상:</span>
                    <Input 
                        type="color" 
                        value={classInput.color} 
                        onChange={e => setClassInput({...classInput, color: e.target.value})} 
                        style={{height: '40px', padding: '2px'}}
                    />
                </div>
                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <Button style={{flex: 1}} onClick={handleDeleteClass}>삭제</Button>
                    <Button $primary style={{flex: 1}} onClick={handleSaveClass}>저장</Button>
                </div>
            </ModalContent>
        </ModalOverlay>
      )}

      {/* 팀 생성 모달 */}
      {isTeamModalOpen && (
        <ModalOverlay onClick={() => setIsTeamModalOpen(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalTitle>새 팀 만들기</ModalTitle>
                <Input 
                    placeholder="팀 이름 (예: 캡스톤 디자인 A조)" 
                    value={teamNameInput} 
                    onChange={e => setTeamNameInput(e.target.value)} 
                />
                <Button $primary onClick={handleCreateTeam}>생성하기</Button>
            </ModalContent>
        </ModalOverlay>
      )}

      <AlertModal 
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
        title={alertState.title}
        message={alertState.message}
      />

    </PageContainer>
  );
};

export default CalendarPage;
