import { createContext, useState, useContext } from 'react';
import { AI_PERSONAS } from '../data/personas';
import { getCurrentTime } from '../utils/time';
import { callGeminiAPI, callOpenRouterAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState('chats'); // 'chats' | 'new_chat' | 'apikey'
  const [toastMessage, setToastMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showSearchInfo, setShowSearchInfo] = useState(false);
  
  const [activeProfileFeature, setActiveProfileFeature] = useState('default');
  const [openRouterApiKey, setOpenRouterApiKey] = useState(() => localStorage.getItem('openRouterApiKey') || '');

  const saveApiKey = (key) => {
    setOpenRouterApiKey(key);
    localStorage.setItem('openRouterApiKey', key);
    showToast('API Key OpenRouter berhasil disimpan');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const startNewChat = (persona) => {
    // Check if it's an OpenRouter model (has a slash in the ID like 'anthropic/claude-...')
    if (persona.id && persona.id.includes('/') && !openRouterApiKey) {
      showToast('Mohon isi OpenRouter API Key di Pengaturan terlebih dahulu');
      return;
    }

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
    e?.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      navigate('/');
    }
    showToast('Sesi obrolan berhasil dihapus');
  };

  const deleteMultipleSessions = (sessionIds) => {
    setSessions((prev) => prev.filter((s) => !sessionIds.includes(s.id)));
    if (sessionIds.includes(activeSessionId)) {
      setActiveSessionId(null);
      navigate('/');
    }
    showToast(`${sessionIds.length} obrolan berhasil dihapus`);
  };

  const generateSessionTitle = async (sessionId, firstMessageText, personaId) => {
    try {
      const prompt = `Buatkan judul singkat (maksimal 2-3 kata) untuk sesi chat yang diawali dengan pesan ini: "${firstMessageText}". Jangan berikan tanda kutip atau kata tambahan lainnya. Cukup kembalikan teks judulnya saja.`;
      const titleMessage = [{ sender: 'user', text: prompt }];
      
      let newTitle = "";
      if (personaId.includes('/') && openRouterApiKey) {
        // Call OpenRouter with the current model to generate title
        newTitle = await callOpenRouterAPI(titleMessage, personaId, openRouterApiKey);
      } else {
        // Fallback to Gemini API
        const titlePersona = { systemPrompt: "Kamu adalah asisten pembuat judul." };
        newTitle = await callGeminiAPI(titleMessage, titlePersona);
      }

      if (newTitle) {
        const cleanTitle = newTitle.replace(/["']/g, '').trim();
        setSessions(prev => prev.map(s => {
          if (s.id === sessionId) {
            return {
              ...s,
              name: cleanTitle,
              avatar: `https://robohash.org/${encodeURIComponent(cleanTitle)}?set=set1`
            };
          }
          return s;
        }));
      }
    } catch (e) {
      console.error('Failed to generate title', e);
    }
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

    if (updatedMessages.length === 2) {
      // Generate title asinkron
      generateSessionTitle(sessionId, text, session.personaId);
    }

    try {
      let aiReplyText = "";
      
      if (session.personaId.includes('/')) {
        // Model dari OpenRouter
        aiReplyText = await callOpenRouterAPI(updatedMessages, session.personaId, openRouterApiKey);
      } else {
        // Model / Persona bawaan lokal (Gemini)
        const persona = AI_PERSONAS.find((p) => p.id === session.personaId) || AI_PERSONAS[0];
        aiReplyText = await callGeminiAPI(updatedMessages, persona);
      }

      const replies = aiReplyText.split('|||').map(t => t.trim()).filter(Boolean);

      for (let i = 0; i < replies.length; i++) {
        const textChunk = replies[i];
        const aiMessage = {
          id: 'ai-' + Date.now() + '-' + i,
          sender: 'ai',
          text: textChunk,
          time: getCurrentTime(),
          status: 'read'
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [...s.messages, aiMessage],
                  lastUpdated: getCurrentTime()
                }
              : s
          )
        );

        if (i < replies.length - 1) {
          await new Promise(res => setTimeout(res, 800));
        }
      }
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
        deleteMultipleSessions,
        sendMessage,
        isTyping,
        showContactInfo,
        setShowContactInfo,
        showSearchInfo,
        setShowSearchInfo,
        activeProfileFeature,
        setActiveProfileFeature,
        openRouterApiKey,
        saveApiKey
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
