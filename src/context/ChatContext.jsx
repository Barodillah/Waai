import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { getCurrentTime } from '../utils/time';
import { callOpenRouterAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const navigate = useNavigate();

  const [sessions, setSessionsState] = useState([]);
  const sessionsRef = useRef(sessions);

  const setSessions = (updater) => {
    setSessionsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      sessionsRef.current = next;
      return next;
    });
  };

  const [activeSessionId, setActiveSessionId] = useState(null);
  const activeSessionIdRef = useRef(activeSessionId);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
    if (activeSessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId && s.unreadCount > 0
            ? { ...s, unreadCount: 0 }
            : s
        )
      );
    }
  }, [activeSessionId]);
  const [activeMobileTab, setActiveMobileTab] = useState('chats'); // 'chats' | 'new_chat' | 'apikey'
  const [toastMessage, setToastMessage] = useState(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showSearchInfo, setShowSearchInfo] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const [activeProfileFeature, setActiveProfileFeature] = useState('default');
  const [openRouterApiKey, setOpenRouterApiKey] = useState(() => localStorage.getItem('openRouterApiKey') || '');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'Barod');

  const [customPersonas, setCustomPersonas] = useState(() => {
    const saved = localStorage.getItem('customPersonas');
    return saved ? JSON.parse(saved) : [];
  });

  const [editingPersona, setEditingPersona] = useState(null);

  const deleteCustomPersona = (id) => {
    const newPersonas = customPersonas.filter(p => p.id !== id);
    setCustomPersonas(newPersonas);
    localStorage.setItem('customPersonas', JSON.stringify(newPersonas));
    showToast('Persona berhasil dihapus');
  };

  const updateCustomPersona = (updatedPersona) => {
    const newPersonas = customPersonas.map(p => p.id === updatedPersona.id ? updatedPersona : p);
    setCustomPersonas(newPersonas);
    localStorage.setItem('customPersonas', JSON.stringify(newPersonas));
    showToast('Persona berhasil diperbarui');
  };

  const addCustomPersona = (persona) => {
    const newPersonas = [persona, ...customPersonas];
    setCustomPersonas(newPersonas);
    localStorage.setItem('customPersonas', JSON.stringify(newPersonas));
    showToast('Persona berhasil ditambahkan');
    startNewChat(persona);
  };

  const saveApiKey = (key) => {
    setOpenRouterApiKey(key);
    localStorage.setItem('openRouterApiKey', key);
    showToast('API Key OpenRouter berhasil disimpan');
  };

  const saveUserName = (name) => {
    setUserName(name);
    localStorage.setItem('userName', name);
    showToast('Nama profil berhasil disimpan');
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
    const isModel = persona.id && persona.id.includes('/');
    const sessionName = isModel ? `Sesi ${persona.name.split(' ')[0]}` : persona.name;
    const sessionAvatar = isModel
      ? `https://robohash.org/${encodeURIComponent(sessionName)}?set=set1`
      : (persona.avatar || `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(sessionName)}`);

    const newSession = {
      id: newSessionId,
      personaId: persona.id,
      name: sessionName,
      avatar: sessionAvatar,
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

    setSessions((prev) => {
      const next = [newSession, ...prev];
      sessionsRef.current = next;
      return next;
    });
    setActiveSessionId(newSessionId);
    setActiveMobileTab('chats');
    navigate(`/chat/${newSessionId}`);
    showToast(`Membuka obrolan dengan ${persona.name}`);
    return newSessionId;
  };

  const startIncognitoChat = () => {
    const currentTime = getCurrentTime();
    const newSessionId = 'session-incognito-' + Date.now();

    const newSession = {
      id: newSessionId,
      personaId: 'google/gemini-2.5-flash-lite',
      name: "Pertanyaan Cepat",
      avatar: "https://api.dicebear.com/9.x/micah/svg?seed=Incognito",
      unreadCount: 0,
      lastUpdated: currentTime,
      isIncognito: true,
      messages: [
        {
          id: 'm-' + Date.now(),
          sender: 'ai',
          text: "Mode Pertanyaan Cepat diaktifkan. Obrolan ini tidak akan disimpan setelah Anda keluar dari sesi ini. Apa yang ingin Anda tanyakan?",
          time: currentTime,
          status: 'read'
        }
      ]
    };

    setSessions((prev) => {
      const next = [newSession, ...prev];
      sessionsRef.current = next;
      return next;
    });
    setActiveSessionId(newSessionId);
    setActiveMobileTab('chats');
    navigate(`/chat/${newSessionId}`);
    showToast(`Membuka mode Pertanyaan Cepat`);
    return newSessionId;
  };

  const startGroupChat = (groupName, members) => {
    const currentTime = getCurrentTime();
    const newSessionId = 'session-group-' + Date.now();

    const newSession = {
      id: newSessionId,
      name: groupName,
      isGroup: true,
      members: members, // array of persona/model objects
      avatar: "group", // We will handle UI rendering for group avatars separately
      unreadCount: 0,
      lastUpdated: currentTime,
      isIncognito: false,
      messages: [
        {
          id: 'm-' + Date.now(),
          sender: 'system',
          text: `Grup "${groupName}" berhasil dibuat dengan ${members.length} anggota.`,
          time: currentTime,
          status: 'read'
        }
      ]
    };

    setSessions((prev) => {
      const next = [newSession, ...prev];
      sessionsRef.current = next;
      return next;
    });
    setActiveSessionId(newSessionId);
    setActiveMobileTab('chats');
    navigate(`/chat/${newSessionId}`);
    return newSessionId;
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

  const updateSessionPersonaId = (sessionId, newPersonaId) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, personaId: newPersonaId } : s));
    showToast('Model berhasil diubah');
  };

  const generateSessionTitle = async (sessionId, firstMessageText, personaId) => {
    try {
      const prompt = `Buatkan judul singkat (maksimal 2-3 kata) untuk sesi chat yang diawali dengan pesan ini: "${firstMessageText}". Jangan berikan tanda kutip atau kata tambahan lainnya. Cukup kembalikan teks judulnya saja.`;
      const titleMessage = [{ sender: 'user', text: prompt }];

      let newTitle = "";
      if (personaId.startsWith('custom-')) {
        const customPersona = customPersonas.find(p => p.id === personaId);
        if (customPersona && customPersona.baseModel && openRouterApiKey) {
          newTitle = await callOpenRouterAPI(titleMessage, customPersona.baseModel, openRouterApiKey, "Kamu adalah asisten pembuat judul.");
        } else {
          const titlePersona = { systemPrompt: "Kamu adalah asisten pembuat judul." };
          newTitle = await callGeminiAPI(titleMessage, titlePersona);
        }
      } else if (personaId.includes('/') && openRouterApiKey) {
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

  const sendMessage = async (sessionId, text, replyToMsg = null) => {
    const currentTime = getCurrentTime();
    const userMsgId = 'msg-' + Date.now();

    const newUserMessage = {
      id: userMsgId,
      sender: 'user',
      text: text,
      time: currentTime,
      status: 'sent',
      ...(replyToMsg && { replyTo: replyToMsg })
    };

    const session = sessionsRef.current.find(s => s.id === sessionId);
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

    if (updatedMessages.length === 2 && !session.isGroup) {
      // Generate title asinkron (Hanya untuk model AI)
      const isModel = session.personaId && session.personaId.includes('/');
      if (isModel) {
        generateSessionTitle(sessionId, text, session.personaId);
      }
    }

    if (session.isGroup) {
      let currentMessages = [...updatedMessages];

      // Round 1: Semua AI menjawab
      for (let i = 0; i < session.members.length; i++) {
        try {
          const member = session.members[i];
          const formattedApiMessages = currentMessages.map(msg => {
            const prefix = msg.sender === 'user' ? `[${userName}]: ` : (msg.senderName ? `[${msg.senderName}]: ` : '');
            return { ...msg, text: `${prefix}${msg.text}` };
          });

          let aiReplyText = "";
          if (member._type === 'custom' || member._type === 'default_persona') {
            const fallbackModel = 'google/gemini-2.5-flash-lite';
            const modelToUse = (member.baseModel && openRouterApiKey) ? member.baseModel : fallbackModel;
            aiReplyText = await callOpenRouterAPI(formattedApiMessages, modelToUse, openRouterApiKey, member.systemPrompt, userName, true);
          } else {
            aiReplyText = await callOpenRouterAPI(formattedApiMessages, member.id, openRouterApiKey, null, userName, true);
          }

          const cleanReplyText = aiReplyText.replace(/^\[.*?\]:\s*/gm, '').trim();
          const replies = cleanReplyText.split('|||').map(t => t.trim()).filter(Boolean);
          for (let j = 0; j < replies.length; j++) {
            const aiMessage = {
              id: 'ai-' + Date.now() + '-r1-' + i + '-' + j,
              sender: 'ai',
              senderId: member.id,
              senderName: member.name,
              avatar: member.avatar,
              text: replies[j],
              time: getCurrentTime(),
              status: 'read',
              replyTo: newUserMessage
            };
            currentMessages = [...currentMessages, aiMessage];
          }
          setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, messages: currentMessages, lastUpdated: getCurrentTime() } : s));
        } catch (err) {
          console.error(`Error in Round 1 for member ${session.members[i]?.name}:`, err);
        }
      }

      // Round 2: Semua AI menanggapi hasil Round 1
      for (let i = 0; i < session.members.length; i++) {
        try {
          const member = session.members[i];
          const formattedApiMessagesRound2 = currentMessages.map(msg => {
            const prefix = msg.sender === 'user' ? `[${userName}]: ` : (msg.senderName ? `[${msg.senderName}]: ` : '');
            return { ...msg, text: `${prefix}${msg.text}` };
          });

          let aiReplyText2 = "";
          if (member._type === 'custom' || member._type === 'default_persona') {
            const fallbackModel = 'google/gemini-flash-1.5';
            const modelToUse = (member.baseModel && openRouterApiKey) ? member.baseModel : fallbackModel;
            aiReplyText2 = await callOpenRouterAPI(formattedApiMessagesRound2, modelToUse, openRouterApiKey, member.systemPrompt, userName, true);
          } else {
            aiReplyText2 = await callOpenRouterAPI(formattedApiMessagesRound2, member.id, openRouterApiKey, null, userName, true);
          }

          const cleanReplyText2 = aiReplyText2.replace(/^\[.*?\]:\s*/gm, '').trim();
          const replies2 = cleanReplyText2.split('|||').map(t => t.trim()).filter(Boolean);
          for (let j = 0; j < replies2.length; j++) {
            const aiMessage2 = {
              id: 'ai-' + Date.now() + '-r2-' + i + '-' + j,
              sender: 'ai',
              senderId: member.id,
              senderName: member.name,
              avatar: member.avatar,
              text: replies2[j],
              time: getCurrentTime(),
              status: 'read',
              replyTo: currentMessages[currentMessages.length - 1]
            };
            currentMessages = [...currentMessages, aiMessage2];
          }
          setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, messages: currentMessages, lastUpdated: getCurrentTime() } : s));
        } catch (err) {
          console.error(`Error in Round 2 for member ${session.members[i]?.name}:`, err);
        }
      }
      setIsTyping(false);
      return;
    }

    try {
      let aiReplyText = "";

      const apiMessages = updatedMessages.map(msg => {
        if (msg.replyTo) {
          return {
            ...msg,
            text: `[Membalas pesan: "${msg.replyTo.text}"]\n\n${msg.text}`
          };
        }
        return msg;
      });

      if (session.personaId.startsWith('custom-')) {
        const customPersona = customPersonas.find(p => p.id === session.personaId);
        if (customPersona) {
          const fallbackModel = 'google/gemini-flash-1.5';
          const modelToUse = (customPersona.baseModel && openRouterApiKey) ? customPersona.baseModel : fallbackModel;
          aiReplyText = await callOpenRouterAPI(apiMessages, modelToUse, openRouterApiKey, customPersona.systemPrompt, userName);
        } else {
          throw new Error("Persona kustom tidak ditemukan");
        }
      } else if (session.personaId.includes('/')) {
        aiReplyText = await callOpenRouterAPI(apiMessages, session.personaId, openRouterApiKey, null, userName);
      } else {
        // Unknown persona
        aiReplyText = await callOpenRouterAPI(apiMessages, 'google/gemini-flash-1.5', openRouterApiKey, "Anda adalah asisten AI yang ramah.", userName);
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
                lastUpdated: getCurrentTime(),
                unreadCount: s.id === activeSessionIdRef.current ? 0 : (s.unreadCount || 0) + 1
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
        startIncognitoChat,
        startGroupChat,
        deleteSession,
        deleteMultipleSessions,
        updateSessionPersonaId,
        sendMessage,
        isTyping,
        showContactInfo,
        setShowContactInfo,
        showSearchInfo,
        setShowSearchInfo,
        activeProfileFeature,
        setActiveProfileFeature,
        openRouterApiKey,
        saveApiKey,
        userName,
        saveUserName,
        customPersonas,
        addCustomPersona,
        deleteCustomPersona,
        updateCustomPersona,
        editingPersona,
        setEditingPersona,
        replyingTo,
        setReplyingTo,
        forwardMessage,
        setForwardMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
