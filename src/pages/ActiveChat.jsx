import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';

export default function ActiveChat() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessions, setActiveSessionId } = useChat();

  const activeSession = sessions.find((s) => s.id === sessionId);

  useEffect(() => {
    if (activeSession) {
      setActiveSessionId(sessionId);
    } else {
      navigate('/');
    }
  }, [sessionId, activeSession, setActiveSessionId, navigate]);

  if (!activeSession) return null;

  return (
    <>
      <ChatHeader activeSession={activeSession} />
      
      <MessageList activeSession={activeSession} />

      <MessageInput activeSessionId={sessionId} />
    </>
  );
}
