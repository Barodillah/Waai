import { Routes, Route } from 'react-router-dom';
import MainLayout from './pages/MainLayout';
import EmptyChat from './pages/EmptyChat';
import ActiveChat from './pages/ActiveChat';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Render EmptyChat by default (for desktop view) */}
        <Route index element={<EmptyChat />} />
        {/* Render ActiveChat when a session is selected */}
        <Route path="chat/:sessionId" element={<ActiveChat />} />
      </Route>
    </Routes>
  );
}

export default App;
