import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaSearch, FaCog, FaBell, FaChevronDown, FaChevronUp, FaQuestionCircle, FaMoon, FaSun, FaUsers, FaPlus } from 'react-icons/fa';
import { ThemeContext } from '../App';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.header`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  color: ${({ theme }) => theme.colors.text};
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

const SearchInput = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 14px;
  outline: none;
  transition: width 0.3s;
  width: ${({ $isOpen }) => ($isOpen ? '150px' : '0')};
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
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
  width: 280px;
  height: 100%;
  background: ${({ theme }) => theme.colors.surface};
  z-index: 201;
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '-100%')});
  transition: transform 0.3s ease-in-out;
  padding: ${({ theme }) => theme.spacing.large};
  box-shadow: ${({ theme }) => theme.shadows.large};
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.colors.text};
`;

const SidebarMenu = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const MenuSectionTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 20px;
  margin-bottom: 8px;
  padding-left: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MenuItem = styled.div`
  padding: 12px 0;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SubMenu = styled.div`
  padding-left: 16px;
  max-height: ${({ $isOpen }) => ($isOpen ? '200px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease-out;
`;

const SubMenuItem = styled.div`
  padding: 8px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SidebarFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 16px;
`;

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 10px;
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
  const { themeMode, toggleTheme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState({}); // { subjects: true, projects: false, team: false }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  
  const toggleMenu = (menu) => {
    setExpandedMenu(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/notes?q=${e.target.value}`);
      setIsSearchOpen(false);
    }
  };

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
          <SearchInput 
            $isOpen={isSearchOpen} 
            placeholder="검색어 입력..." 
            onKeyDown={handleSearch}
          />
          <IconBtn onClick={toggleSearch}>
            <FaSearch />
          </IconBtn>
          <IconBtn>
            <FaBell />
          </IconBtn>
        </HeaderRight>
      </Header>

      <SidebarOverlay $isOpen={isSidebarOpen} onClick={toggleSidebar} />
      <Sidebar $isOpen={isSidebarOpen}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
             <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Menu</h2>
        </div>
        
        <SidebarMenu>
          <MenuSectionTitle>개인 스페이스</MenuSectionTitle>
          <MenuItem onClick={() => { navigate('/'); toggleSidebar(); }}>
            홈 / 캘린더
          </MenuItem>

          <MenuItem onClick={() => toggleMenu('subjects')}>
            수강 중인 과목
            {expandedMenu.subjects ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </MenuItem>
          <SubMenu $isOpen={expandedMenu.subjects}>
            <SubMenuItem onClick={() => { navigate('/notes?tag=알고리즘'); toggleSidebar(); }}>알고리즘</SubMenuItem>
            <SubMenuItem onClick={() => { navigate('/notes?tag=데이터베이스'); toggleSidebar(); }}>데이터베이스</SubMenuItem>
            <SubMenuItem onClick={() => { navigate('/notes?tag=운영체제'); toggleSidebar(); }}>운영체제</SubMenuItem>
            <SubMenuItem onClick={() => { navigate('/notes?tag=웹프로그래밍'); toggleSidebar(); }}>웹프로그래밍</SubMenuItem>
          </SubMenu>

          <MenuItem onClick={() => toggleMenu('projects')}>
            개인 프로젝트
            {expandedMenu.projects ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </MenuItem>
          <SubMenu $isOpen={expandedMenu.projects}>
            <SubMenuItem onClick={() => { navigate('/notes?tag=토이프로젝트'); toggleSidebar(); }}>토이프로젝트</SubMenuItem>
          </SubMenu>

          <MenuItem onClick={() => { navigate('/notes'); toggleSidebar(); }}>
            전체 노트 목록
          </MenuItem>

          <MenuSectionTitle>팀 워크스페이스</MenuSectionTitle>
          <MenuItem onClick={() => toggleMenu('team')}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <FaUsers /> 팀 프로젝트
            </div>
            {expandedMenu.team ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </MenuItem>
          <SubMenu $isOpen={expandedMenu.team}>
            <SubMenuItem onClick={() => { navigate('/team/capstone'); toggleSidebar(); }}>🎓 캡스톤 디자인</SubMenuItem>
            <SubMenuItem onClick={() => { navigate('/team/hackathon'); toggleSidebar(); }}>🚀 해커톤 준비</SubMenuItem>
            <SubMenuItem onClick={() => { alert('새 팀 만들기 모달 (준비중)'); }} style={{ color: '#4A90E2', fontWeight: 'bold' }}>
                <FaPlus size={10} style={{marginRight: '4px'}}/> 새 팀 만들기
            </SubMenuItem>
          </SubMenu>

        </SidebarMenu>

        <SidebarFooter>
          <MenuItem onClick={toggleTheme}>
            <ToggleSwitch>
              {themeMode === 'light' ? <FaMoon /> : <FaSun />}
              {themeMode === 'light' ? '다크 모드 켜기' : '라이트 모드 켜기'}
            </ToggleSwitch>
          </MenuItem>
          <MenuItem onClick={() => { alert('설정 기능은 준비 중입니다.'); toggleSidebar(); }}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <FaCog /> 설정
            </div>
          </MenuItem>
          <MenuItem onClick={() => { alert('도움말 기능은 준비 중입니다.'); toggleSidebar(); }}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <FaQuestionCircle /> 도움말
            </div>
          </MenuItem>
        </SidebarFooter>
      </Sidebar>

      <Main>
        <Outlet />
      </Main>
    </Container>
  );
};

export default Layout;
