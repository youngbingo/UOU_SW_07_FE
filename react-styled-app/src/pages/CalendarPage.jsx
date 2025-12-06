import React, { useState } from 'react';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaPlus, FaList, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import CreateNoteModal from '../components/CreateNoteModal';

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
  padding: 8px;
  min-height: 60px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
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
  gap: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
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

const CalendarPage = () => {
  const [view, setView] = useState('calendar'); // 'calendar' | 'timetable'
  const [value, onChange] = useState(new Date());
  const navigate = useNavigate();
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (date) => {
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    const existingNote = localStorage.getItem(`note_${dateStr}`);
    
    if (existingNote) {
        navigate(`/note/${dateStr}`);
    } else {
        setSelectedDate(dateStr);
        setIsModalOpen(true);
    }
  };

  const handleCreateNote = (settings) => {
    setIsModalOpen(false);
    navigate(`/note/${selectedDate}`, { state: settings });
  };

  const days = ['시간', '월', '화', '수', '목', '금'];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

  const recentNotes = [
    { id: 1, title: '알고리즘 3주차 정리', date: '2025-10-06', tag: '전공필수', time: '방금 전' },
    { id: 2, title: '팀 프로젝트 아이디어 회의', date: '2025-10-05', tag: '캡스톤디자인', time: '어제' },
    { id: 3, title: '데이터베이스 모델링 실습', date: '2025-10-03', tag: '데이터베이스', time: '3일 전' },
  ];

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
            <Title>10월 일정</Title>
            <StyledCalendarWrapper>
              <Calendar 
                onChange={onChange} 
                value={value} 
                onClickDay={handleDateClick}
                formatDay={(locale, date) => format(date, 'd')}
              />
            </StyledCalendarWrapper>
          </>
        ) : (
          <>
            <Title>
              이번 주 시간표 <DummyBadge>DUMMY</DummyBadge>
            </Title>
            <TimeTableGrid>
              {days.map((day) => <HeaderCell key={day}>{day}</HeaderCell>)}
              {times.map((time, i) => (
                <React.Fragment key={time}>
                  <GridCell>{time}</GridCell>
                  {[0, 1, 2, 3, 4].map((dayIdx) => {
                    if (dayIdx === 0 && i === 1) {
                      return (
                        <ClassCell key={dayIdx} color="#E74C3C" onClick={() => handleDateClick('2025-10-06')}>
                          알고리즘<br/>(302호)
                        </ClassCell>
                      );
                    }
                    if (dayIdx === 2 && i === 4) {
                      return (
                        <ClassCell key={dayIdx} color="#F5A623" onClick={() => handleDateClick('2025-10-08')}>
                          데이터베이스<br/>(205호)
                        </ClassCell>
                      );
                    }
                    return <GridCell key={dayIdx} />;
                  })}
                </React.Fragment>
              ))}
            </TimeTableGrid>
          </>
        )}
      </Section>

      <Section>
        <Title>
          최근 작성한 노트 <DummyBadge>DUMMY</DummyBadge>
          <MoreLink onClick={() => navigate('/notes')}>
            더보기 <FaChevronRight size={12} />
          </MoreLink>
        </Title>
        {recentNotes.map((note) => (
          <NoteItem key={note.id} onClick={() => navigate('/notes')}>
            <div>
              <NoteItemTitle>{note.title}</NoteItemTitle>
              <NoteItemMeta>
                {note.date} | {note.tag}
              </NoteItemMeta>
            </div>
            <NoteItemTime>{note.time}</NoteItemTime>
          </NoteItem>
        ))}
      </Section>

      <FloatingButton onClick={() => handleDateClick(new Date())}>
        <FaPlus />
      </FloatingButton>

      {isModalOpen && (
        <CreateNoteModal 
          onClose={() => setIsModalOpen(false)} 
          onConfirm={handleCreateNote} 
        />
      )}
    </PageContainer>
  );
};

export default CalendarPage;
