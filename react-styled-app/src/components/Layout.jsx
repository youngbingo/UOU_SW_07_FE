import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaSearch, FaCog, FaBell, FaCalendarAlt, FaStickyNote, FaUser } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.header`
  background-color: white;
  padding: ${({ theme }) => theme.spacing.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Logo = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  cursor: pointer;
  
  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.fontSizes.medium};
  }
`;

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
`;

const Sidebar = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  background: white;
  z-index: 201;
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '-100%')});
  transition: transform 0.3s ease-in-out;
  padding: ${({ theme }) => theme.spacing.large};
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const SidebarItem = styled.div`
  padding: ${({ theme }) => theme.spacing.medium} 0;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Main = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.medium};
  max-width: 1024px;
  width: 100%;
  margin: 0 auto;
  
  @media ${({ theme }) => theme.device.mobile} {
    padding: ${({ theme }) => theme.spacing.small};
  }
`;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <IconBtn onClick={toggleSidebar}>
            <FaBars />
          </IconBtn>
          <Logo onClick={() => navigate('/')}>My Uni Planner</Logo>
        </HeaderLeft>
        <HeaderRight>
          <IconBtn>
            <FaSearch />
          </IconBtn>
          <IconBtn>
            <FaBell />
          </IconBtn>
          <IconBtn>
            <FaCog />
          </IconBtn>
        </HeaderRight>
      </Header>

      <SidebarOverlay $isOpen={isSidebarOpen} onClick={toggleSidebar} />
      <Sidebar $isOpen={isSidebarOpen}>
        <h2 style={{ marginBottom: '20px' }}>Menu</h2>
        <SidebarItem onClick={() => { navigate('/'); toggleSidebar(); }}>홈 / 캘린더</SidebarItem>
        <SidebarItem onClick={() => { toggleSidebar(); }}>과목별 노트</SidebarItem>
        <SidebarItem onClick={() => { toggleSidebar(); }}>할 일 관리</SidebarItem>
        <SidebarItem onClick={() => { toggleSidebar(); }}>설정</SidebarItem>
      </Sidebar>

      <Main>
        <Outlet />
      </Main>
    </Container>
  );
};

export default Layout;
