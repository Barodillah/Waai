import { createContext, useState, useContext } from 'react';
import { AI_PERSONAS } from '../data/personas';
import { getCurrentTime } from '../utils/time';
import { callGeminiAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([
    {
      id: 'session-1',
      personaId: 'openai',
      name: 'Jadwal Belajar',
      avatar: `https://robohash.org/Jadwal%20Belajar?set=set1`,
      unreadCount: 0,
      lastUpdated: '10:45',
      messages: [
        {
          id: 'm1',
          sender: 'ai',
          text: 'Halo! Saya asisten AI WhatsApp kamu. Ada yang bisa saya bantu hari ini? 🚀',
          time: '10:42',
          status: 'read'
        },
        {
          id: 'm2',
          sender: 'user',
          text: 'Bisa bantu saya membuat jadwal belajar produktif untuk minggu ini?',
          time: '10:44',
          status: 'read'
        },
        {
          id: 'm3',
          sender: 'ai',
          text: 'Tentu! Berikut rekomendasi jadwal belajar efektif dengan metode Pomodoro:\n\n1. **Pagi (08:00 - 10:00)**: Materi Konsep & Teori Berat\n2. **Siang (13:00 - 15:00)**: Latihan Soal / Praktik Langsung\n3. **Malam (19:30 - 20:30)**: Review kilat & rangkuman\n\nAda topik atau target khusus yang ingin kamu prioritaskan?',
          time: '10:45',
          status: 'read'
        }
      ]
    },
    {
      id: 'session-2',
      personaId: 'anthropic',
      name: 'Tanya Koding',
      avatar: `https://robohash.org/Tanya%20Koding?set=set1`,
      unreadCount: 0,
      lastUpdated: '09:15',
      messages: [
        {
          id: 'm2-1',
          sender: 'ai',
          text: 'Siap membantu ngoding! Kirim cuplikan error, algoritma, atau minta rekomendasi arsitektur.',
          time: '09:15',
          status: 'read'
        }
      ]
    }
  ]);

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState('chats'); // 'chats' | 'new_chat'
  const [toastMessage, setToastMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const startNewChat = (persona) => {
    const existing = sessions.find((s) => s.personaId === persona.id);
    if (existing) {
      setActiveSessionId(existing.id);
      setActiveMobileTab('chats');
      navigate(`/chat/${existing.id}`);
      return;
    }

    const currentTime = getCurrentTime();
    const newSessionId = 'session-' + Date.now();
    const sessionName = `Sesi ${persona.name.split(' ')[0]}`;
    const newSession = {
      id: newSessionId,
      personaId: persona.id,
      name: sessionName,
      avatar: `https://robohash.org/${encodeURIComponent(sessionName)}?set=set1`,
      unreadCount: 0,
      lastUpdated: currentTime,
      messages: [
        {
          id: 'm-' + Date.now(),
          sender: 'ai',
          text: persona.welcomeMessage,
          time: currentTime,
          status: 'read'
        }
      ]
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setActiveMobileTab('chats');
    navigate(`/chat/${newSessionId}`);
    showToast(`Membuka obrolan dengan ${persona.name}`);
  };

  const deleteSession = (e, sessionId) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      navigate('/');
    }
    showToast('Sesi obrolan berhasil dihapus');
  };

  const sendMessage = async (sessionId, text) => {
    const currentTime = getCurrentTime();
    const userMsgId = 'msg-' + Date.now();

    const newUserMessage = {
      id: userMsgId,
      sender: 'user',
      text: text,
      time: currentTime,
      status: 'sent'
    };

    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const updatedMessages = [...session.messages, newUserMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, messages: updatedMessages, lastUpdated: currentTime }
          : s
      )
    );

    setIsTyping(true);

    const persona = AI_PERSONAS.find((p) => p.id === session.personaId) || AI_PERSONAS[0];

    try {
      const aiReplyText = await callGeminiAPI(updatedMessages, persona);
      const aiReplyTime = getCurrentTime();
      const aiMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: aiReplyText,
        time: aiReplyTime,
        status: 'read'
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [...s.messages, aiMessage],
                lastUpdated: aiReplyTime
              }
            : s
        )
      );
    } catch (error) {
      const errorMsg = {
        id: 'err-' + Date.now(),
        sender: 'ai',
        text: 'Maaf, ada kendala koneksi ke server AI. Coba kirim ulang pesanmu ya!',
        time: getCurrentTime(),
        status: 'read'
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, messages: [...s.messages, errorMsg] } : s))
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSessionId,
        setActiveSessionId,
        activeMobileTab,
        setActiveMobileTab,
        toastMessage,
        showToast,
        startNewChat,
        deleteSession,
        sendMessage,
        isTyping
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
