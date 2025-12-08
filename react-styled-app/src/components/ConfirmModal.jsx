import React from 'react';
import styled from 'styled-components';

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
  max-width: 350px;
  border-radius: 12px;
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const Title = styled.h3`
  font-size: 18px;
  margin-bottom: 12px;
  font-weight: 600;
  color: ${({ $danger, theme }) => $danger ? theme.colors.danger : theme.colors.text};
`;

const Message = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 24px;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: ${({ $primary, $danger, theme }) => 
    $danger ? theme.colors.danger : 
    $primary ? theme.colors.primary : 
    theme.colors.gray};
  color: ${({ $primary, $danger }) => ($primary || $danger) ? 'white' : 'inherit'};

  &:hover {
    opacity: 0.9;
  }
`;

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = "확인", message, danger = false }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title $danger={danger}>{title}</Title>
        <Message>{message}</Message>
        <ButtonGroup>
          <Button onClick={onClose}>취소</Button>
          <Button $danger={danger} $primary={!danger} onClick={handleConfirm}>
            {danger ? '삭제' : '확인'}
          </Button>
        </ButtonGroup>
      </ModalContainer>
    </Overlay>
  );
};

export default ConfirmModal;
