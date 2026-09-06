import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import { useUser } from '../context/UserContext';

export default function ActiveChat() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessions, setActiveSessionId, markMessagesAsRead } = useChat();
  const { user } = useUser();

  const activeSession = sessions.find((s) => s.id === sessionId);

  useEffect(() => {
    if (activeSession) {
      setActiveSessionId(sessionId);
      
      if (activeSession.unreadCount > 0) {
        const unreadIds = activeSession.messages
          .filter(m => m.sender !== 'user' && !m.reads?.some(r => r.user_id === user?.id))
          .map(m => m.id);
          
        if (unreadIds.length > 0) {
          markMessagesAsRead(sessionId, unreadIds);
        }
      }
    } else {
      navigate('/');
    }
  }, [sessionId, activeSession, setActiveSessionId, navigate, markMessagesAsRead, user]);

  if (!activeSession) return null;

  return (
    <>
      <ChatHeader activeSession={activeSession} />
      
      <MessageList activeSession={activeSession} />

      <MessageInput activeSessionId={sessionId} />
    </>
  );
}
