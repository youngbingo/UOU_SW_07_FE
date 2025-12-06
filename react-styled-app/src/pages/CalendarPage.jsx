import React, { useState } from 'react';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { format, addDays, startOfWeek } from 'date-fns';
import { FaPlus, FaList, FaCalendarAlt } from 'react-icons/fa';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  position: relative;
  min-height: 80vh;
`;

const ViewToggle = styled.div`
  display: flex;
  background: white;
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
  border-radius: ${({ theme }) => theme.borderRadius.small};
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
  background: white;
  padding: ${({ theme }) => theme.spacing.medium};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  color: ${({ theme }) => theme.colors.text};
`;

// 캘린더 스타일 오버라이드
const StyledCalendarWrapper = styled.div`
  .react-calendar {
    width: 100%;
    border: none;
    font-family: inherit;
  }
  .react-calendar__tile {
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 8px;
  }
  .react-calendar__tile--active {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
  .react-calendar__tile--now {
    background: ${({ theme }) => theme.colors.secondary}33;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
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
  background-color: white;
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

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray};
  }
`;

const CalendarPage = () => {
  const [view, setView] = useState('calendar'); // 'calendar' | 'timetable'
  const [value, onChange] = useState(new Date());
  const navigate = useNavigate();

  const handleDateClick = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    navigate(`/note/${dateStr}`);
  };

  const days = ['시간', '월', '화', '수', '목', '금'];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

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
            <Title>이번 주 시간표</Title>
            <TimeTableGrid>
              {days.map((day) => <HeaderCell key={day}>{day}</HeaderCell>)}
              {times.map((time, i) => (
                <React.Fragment key={time}>
                  <GridCell>{time}</GridCell> {/* 시간 표시 */}
                  {/* 월~금 데이터 (더미) */}
                  {[0, 1, 2, 3, 4].map((dayIdx) => {
                    // 예시: 월요일 10시, 수요일 13시에 수업
                    if (dayIdx === 0 && i === 1) {
                      return <ClassCell key={dayIdx} color="#E74C3C">알고리즘<br/>(302호)</ClassCell>;
                    }
                    if (dayIdx === 2 && i === 4) {
                      return <ClassCell key={dayIdx} color="#F5A623">데이터베이스<br/>(205호)</ClassCell>;
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
        <Title>최근 작성한 노트</Title>
        <NoteItem onClick={() => handleDateClick(new Date())}>
          <div>
            <h4 style={{ marginBottom: '4px' }}>알고리즘 3주차 정리</h4>
            <span style={{ fontSize: '12px', color: '#666' }}>2025-10-06 | 전공필수</span>
          </div>
          <span style={{ fontSize: '12px', color: '#999' }}>방금 전</span>
        </NoteItem>
        <NoteItem onClick={() => handleDateClick(new Date())}>
           <div>
            <h4 style={{ marginBottom: '4px' }}>팀 프로젝트 아이디어 회의</h4>
            <span style={{ fontSize: '12px', color: '#666' }}>2025-10-05 | 캡스톤디자인</span>
          </div>
          <span style={{ fontSize: '12px', color: '#999' }}>어제</span>
        </NoteItem>
      </Section>

      <FloatingButton onClick={() => handleDateClick(new Date())}>
        <FaPlus />
      </FloatingButton>
    </PageContainer>
  );
};

export default CalendarPage;
