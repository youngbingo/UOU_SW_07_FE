import React, { useState, useEffect } from 'react';
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
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const Title = styled.h3`
  font-size: 18px;
  margin-bottom: 16px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
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
  background: ${({ $primary, theme }) => $primary ? theme.colors.primary : theme.colors.gray};
  color: ${({ $primary, theme }) => $primary ? 'white' : theme.colors.text};

  &:hover {
    opacity: 0.9;
  }
`;

const PromptModal = ({ isOpen, onClose, onConfirm, title, placeholder, initialValue = '' }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue || '');
    }
  }, [isOpen, initialValue]);

  const handleSubmit = () => {
    if (value.trim()) {
        onConfirm(value);
        onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>{title}</Title>
        <Input 
            autoFocus
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
            placeholder={placeholder}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <ButtonGroup>
            <Button onClick={onClose}>취소</Button>
            <Button $primary onClick={handleSubmit}>확인</Button>
        </ButtonGroup>
      </ModalContainer>
    </Overlay>
  );
};

export default PromptModal;