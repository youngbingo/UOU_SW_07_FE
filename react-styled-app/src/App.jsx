import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CalendarPage from './pages/CalendarPage';
import NotePage from './pages/NotePage';
import NoteListPage from './pages/NoteListPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CalendarPage />} />
          <Route path="notes" element={<NoteListPage />} />
          <Route path="note/:date" element={<NotePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
