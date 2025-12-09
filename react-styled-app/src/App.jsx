import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import Layout from './components/Layout';
import CalendarPage from './pages/CalendarPage';
import NotePage from './pages/NotePage';
import NoteListPage from './pages/NoteListPage';
import TeamSpacePage from './pages/TeamSpacePage';
import JoinTeamPage from './pages/JoinTeamPage';
import SignUpPage from './pages/SignUpPage';
import { AuthProvider } from './context/AuthContext';

// 테마 컨텍스트 생성
export const ThemeContext = createContext();

function App() {
  // 로컬 스토리지에서 테마 불러오기 (기본값 light)
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    localStorage.setItem('theme', newMode);
  };

  return (
    <AuthProvider>
        <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                <Route index element={<CalendarPage />} />
                <Route path="notes" element={<NoteListPage />} />
                {/* 기존 date 파라미터를 id로 변경하여 다중 메모 지원 */}
                <Route path="note/:id" element={<NotePage />} />
                <Route path="team/:teamId" element={<TeamSpacePage />} />
                <Route path="join-team/:teamId" element={<JoinTeamPage />} />
                <Route path="signup" element={<SignUpPage />} />
                </Route>
            </Routes>
            </BrowserRouter>
        </ThemeProvider>
        </ThemeContext.Provider>
    </AuthProvider>
  );
}

export default App;
