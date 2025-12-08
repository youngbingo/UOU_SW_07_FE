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
  max-width: 320px;
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
`;

const Message = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 24px;
  line-height: 1.5;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const AlertModal = ({ isOpen, onClose, title = "알림", message, onConfirm }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <Button onClick={handleConfirm}>확인</Button>
      </ModalContainer>
    </Overlay>
  );
};

export default AlertModal;