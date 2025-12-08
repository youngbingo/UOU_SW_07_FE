import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaEnvelope, FaLock, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

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
  padding: 32px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  position: relative;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 24px;
  font-family: 'Pretendard';
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
  position: relative;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 12px;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

const PrimaryButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
`;

const GoogleButton = styled(Button)`
  background: white;
  color: #333;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ToggleText = styled.p`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 16px;
  
  span {
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    font-weight: 600;
    margin-left: 4px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 12px;
  text-align: center;
  margin-bottom: 16px;
`;

const LoginModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      console.error(err);
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error(err);
      setError('구글 로그인에 실패했습니다.');
    }
  };
  
  const handleSignUpClick = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}><FaTimes /></CloseButton>
        <Title>로그인</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <IconWrapper><FaEnvelope /></IconWrapper>
            <Input 
              type="email" 
              placeholder="이메일" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <IconWrapper><FaLock /></IconWrapper>
            <Input 
              type="password" 
              placeholder="비밀번호" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
          
          <PrimaryButton type="submit">
            로그인
          </PrimaryButton>
        </form>

        <div style={{display: 'flex', alignItems: 'center', margin: '16px 0'}}>
            <div style={{flex: 1, height: '1px', background: '#ddd'}}></div>
            <span style={{padding: '0 8px', fontSize: '12px', color: '#999'}}>또는</span>
            <div style={{flex: 1, height: '1px', background: '#ddd'}}></div>
        </div>

        <GoogleButton onClick={handleGoogleLogin}>
          <FaGoogle color="#DB4437" /> Google로 계속하기
        </GoogleButton>

        <ToggleText>
          계정이 없으신가요?
          <span onClick={handleSignUpClick}>
            회원가입
          </span>
        </ToggleText>
      </ModalContainer>
    </Overlay>
  );
};

export default LoginModal;

