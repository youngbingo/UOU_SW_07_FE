import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFont, FaPen, FaRegFile, FaRegFileAlt, FaBorderAll, FaColumns, FaChevronRight, FaPlus, FaTrash } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  width: 90%;
  max-width: 400px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  animation: slideUp 0.3s ease-out;
  color: ${({ theme }) => theme.colors.text};

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const Title = styled.h3`
  font-size: 20px;
  margin-bottom: 20px;
  text-align: center;
  font-family: 'Pretendard';
  color: ${({ theme }) => theme.colors.text};
`;

const StepContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
`;

const OptionCard = styled.div`
  border: 2px solid ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  background: ${({ $selected, theme }) => $selected ? theme.colors.primary + '11' : theme.colors.surface};
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    font-size: 24px;
    color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.textSecondary};
  }

  span {
    font-size: 14px;
    font-weight: 600;
    color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.text};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px; /* 간격을 10px -> 12px로 증가 */
  margin-top: 16px; /* 상단 여백 추가 */
`;

const Button = styled.button`
  flex: 1;
  padding: 10px; /* 패딩을 12px -> 10px로 줄여서 버튼 크기 축소 */
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px; /* 폰트 사이즈 14px -> 13px로 축소 */
  background: ${({ $primary, theme }) => $primary ? theme.colors.primary : theme.colors.gray};
  color: ${({ $primary, theme }) => $primary ? 'white' : theme.colors.text};

  &:hover {
    opacity: 0.9;
  }
`;

const NoteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px; /* 하단 여백 증가 */
  max-height: 250px; /* 최대 높이 증가 */
  overflow-y: auto;
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const NoteListItem = styled.div`
  padding: 12px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray};
  }
`;

const CreateNoteModal = ({ onClose, onConfirm, dayNotes = [], onSelectNote, onDeleteNote }) => {
  const [step, setStep] = useState(dayNotes.length > 0 ? 0 : 1); // 0: 목록, 1: Method, 2: Template
  const [method, setMethod] = useState('text');
  const [template, setTemplate] = useState('blank');
  const [confirmState, setConfirmState] = useState({ isOpen: false, noteId: null });

  const handleNext = () => {
    if (step === 0) setStep(1);
    else if (step === 1) setStep(2);
    else onConfirm({ method, template });
  };

  const handleDeleteClick = (e, noteId) => {
    e.stopPropagation();
    setConfirmState({ isOpen: true, noteId });
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        
        {step === 0 && (
            <>
                <Title>이 날짜의 메모</Title>
                <NoteList>
                    {dayNotes.map(note => (
                        <NoteListItem key={note.id} onClick={() => onSelectNote(note.id)}>
                            <div style={{flex: 1}}>
                                <span style={{fontWeight: 'bold', display: 'block'}}>{note.title}</span>
                                <span style={{fontSize: '12px', color: '#666'}}>{note.method === 'handwriting' ? '손글씨' : '텍스트'} | {note.template}</span>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                <DeleteBtn onClick={(e) => handleDeleteClick(e, note.id)}>
                                    <FaTrash size={14} />
                                </DeleteBtn>
                                <FaChevronRight size={12} color="#999" />
                            </div>
                        </NoteListItem>
                    ))}
                </NoteList>
                <ButtonGroup>
                    <Button onClick={onClose}>닫기</Button>
                    <Button $primary onClick={() => setStep(1)}>
                        <FaPlus size={12} style={{marginRight: '4px'}}/> 새 메모 작성
                    </Button>
                </ButtonGroup>
            </>
        )}

        {step === 1 && (
          <>
            <Title>어떻게 기록할까요?</Title>
            <StepContainer>
              <OptionCard $selected={method === 'text'} onClick={() => setMethod('text')}>
                <FaFont />
                <span>텍스트 입력</span>
              </OptionCard>
              <OptionCard $selected={method === 'handwriting'} onClick={() => setMethod('handwriting')}>
                <FaPen />
                <span>손글씨</span>
              </OptionCard>
            </StepContainer>
          </>
        )}

        {step === 2 && (
          <>
            <Title>템플릿을 선택해주세요</Title>
            <StepContainer>
              {method === 'handwriting' ? (
                // 손글씨 모드일 때: 시각적 배경 템플릿
                <>
                  <OptionCard $selected={template === 'blank'} onClick={() => setTemplate('blank')}>
                    <FaRegFile />
                    <span>무지</span>
                  </OptionCard>
                  <OptionCard $selected={template === 'line'} onClick={() => setTemplate('line')}>
                    <FaRegFileAlt />
                    <span>줄글</span>
                  </OptionCard>
                  <OptionCard $selected={template === 'grid'} onClick={() => setTemplate('grid')}>
                    <FaBorderAll />
                    <span>모눈종이</span>
                  </OptionCard>
                  <OptionCard $selected={template === 'cornell'} onClick={() => setTemplate('cornell')}>
                    <FaColumns />
                    <span>코넬 노트</span>
                  </OptionCard>
                </>
              ) : (
                // 텍스트 모드일 때: 구조적 템플릿
                <>
                  <OptionCard $selected={template === 'blank'} onClick={() => setTemplate('blank')}>
                    <FaRegFile />
                    <span>기본 (무지)</span>
                  </OptionCard>
                  <OptionCard $selected={template === 'meeting'} onClick={() => setTemplate('meeting')}>
                    <FaColumns />
                    <span>회의록</span>
                  </OptionCard>
                  <OptionCard $selected={template === 'dev_log'} onClick={() => setTemplate('dev_log')}>
                    <FaPen />
                    <span>학습/개발 일지</span>
                  </OptionCard>
                  <OptionCard $selected={template === 'todo'} onClick={() => setTemplate('todo')}>
                    <FaRegFileAlt />
                    <span>체크리스트</span>
                  </OptionCard>
                </>
              )}
            </StepContainer>
          </>
        )}

        <ButtonGroup>
          <Button onClick={step === 1 ? onClose : () => setStep(1)}>취소/이전</Button>
          <Button $primary onClick={handleNext}>
            {step === 1 ? '다음' : '노트 생성'}
          </Button>
        </ButtonGroup>
      </ModalContainer>
      
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, noteId: null })}
        onConfirm={() => {
          onDeleteNote(confirmState.noteId);
          setConfirmState({ isOpen: false, noteId: null });
        }}
        title="노트 삭제"
        message="정말 삭제하시겠습니까?"
        danger={true}
      />
    </Overlay>
  );
};

export default CreateNoteModal;
