import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { getCurrentTime } from '../utils/time';
import { callOpenRouterAPI, extractMemoryFromMessage } from '../utils/api';
import { fetchFromDB } from '../utils/dbApi';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { getPersonaAvatar, getModelAvatar, getGroupAvatar, getDefaultAiAvatar } from '../utils/avatar';

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
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [typingSessionId, setTypingSessionId] = useState(null);
  const [scrollToMessageId, setScrollToMessageId] = useState(null);

  const [activeProfileFeature, setActiveProfileFeature] = useState('default');
  const [openRouterApiKey, setOpenRouterApiKey] = useState(() => localStorage.getItem('openRouterApiKey') || '');
  const { user } = useUser();

  const [customPersonas, setCustomPersonas] = useState([]);
  const [editingPersona, setEditingPersona] = useState(null);
  
  const [userMemories, setUserMemories] = useState([]);

  const [defaultIncognitoModel, setDefaultIncognitoModel] = useState(() => localStorage.getItem('defaultIncognitoModel') || 'google/gemini-2.5-flash-lite');

  const updateDefaultIncognitoModel = (modelId) => {
    setDefaultIncognitoModel(modelId);
    localStorage.setItem('defaultIncognitoModel', modelId);
  };

  // Fetch initial data from DB when user is available
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      const [fetchedPersonas, fetchedSessions, fetchedMemories] = await Promise.all([
        fetchFromDB('/personas'),
        fetchFromDB('/sessions'),
        fetchFromDB('/user/memories')
      ]);

      if (fetchedMemories && Array.isArray(fetchedMemories)) {
        setUserMemories(fetchedMemories);
      }

      const mappedPersonas = (fetchedPersonas || []).map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar_url,
        welcomeMessage: p.welcome_message,
        systemPrompt: p.system_prompt,
        description: p.description,
        baseModel: p.base_model,
        interest: p.interest,
        tone: p.tone,
        characterType: p.character_types,
        advancedSettings: p.advanced_settings
      }));

      setCustomPersonas(mappedPersonas);

      // Load sessions and messages for each session
      if (fetchedSessions && fetchedSessions.length > 0) {
        // Map backend sessions to frontend state structure
        const mappedSessions = await Promise.all(fetchedSessions.map(async (s) => {
          const messages = await fetchFromDB(`/sessions/${s.id}/messages`);

          let members = s.members || [];
          // If group, construct members array. If direct, figure out personaId
          let personaId = null;
          let isGroup = s.type === 'group';

          if (!isGroup) {
            const aiMember = members.find(m => m.member_type !== 'user');
            if (aiMember) {
              personaId = aiMember.persona_id || aiMember.model_id;
            }
          }

          const mappedMembers = members.map(m => {
            if (m.member_type === 'user') {
              return { id: m.user_id, name: m.user?.name || 'User', avatar: m.user?.avatar_url, _type: 'user' };
            } else if (m.member_type === 'persona') {
              const p = m.persona;
              const pName = p?.name || 'Persona';
              return {
                id: m.persona_id,
                name: pName,
                avatar: p?.avatar_url || getPersonaAvatar(pName),
                baseModel: p?.base_model || null,
                systemPrompt: p?.system_prompt || null,
                _type: 'persona'
              };
            } else {
              // model
              const rawModelId = m.model_id || '';
              const modelName = rawModelId.includes('/') ? rawModelId.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Model AI';
              return { id: m.model_id, name: modelName, avatar: getModelAvatar(modelName), _type: 'model' };
            }
          });

          return {
            id: s.id,
            personaId: personaId,
            name: s.name,
            avatar: isGroup ? getGroupAvatar(s.id) : (s.avatar_url || getPersonaAvatar(s.name)),
            isGroup: isGroup,
            members: mappedMembers,
            unreadCount: s.id === activeSessionIdRef.current ? 0 : (s.unread_count || 0),
            lastUpdated: s.updated_at,
            messages: messages.map(m => {
              let sender, senderName, senderId, avatar;

              if (m.sender_type === 'system') {
                sender = 'system';
                senderName = 'System';
              } else if (m.sender_type === 'user') {
                sender = 'user';
                senderName = m.user_sender?.name || 'User';
                senderId = m.sender_user_id;
                avatar = m.user_sender?.avatar_url;
              } else if (m.sender_type === 'persona') {
                sender = 'ai';
                senderId = m.sender_persona_id;
                // Cross-reference with mappedMembers for reliable name/avatar
                const memberMatch = mappedMembers.find(mb => mb.id === senderId);
                if (memberMatch) {
                  senderName = memberMatch.name;
                  avatar = memberMatch.avatar;
                } else {
                  const pName = m.persona_sender?.name || 'Persona';
                  senderName = pName;
                  avatar = m.persona_sender?.avatar_url || getPersonaAvatar(pName);
                }
              } else {
                // model
                sender = 'ai';
                senderId = m.sender_model_id;
                // Cross-reference with mappedMembers for reliable name/avatar
                const memberMatch = mappedMembers.find(mb => mb.id === senderId);
                if (memberMatch) {
                  senderName = memberMatch.name;
                  avatar = memberMatch.avatar;
                } else {
                  const rawId = m.sender_model_id || '';
                  senderName = rawId.includes('/')
                    ? rawId.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    : 'Model AI';
                  avatar = getModelAvatar(senderName);
                }
              }

              // Reconstruct replyTo from eager-loaded data
              let replyTo = null;
              if (m.reply_to) {
                const rt = m.reply_to;
                replyTo = {
                  id: rt.id,
                  sender: rt.sender_type === 'user' ? 'user' : 'ai',
                  senderName: rt.sender_type === 'user' ? 'Anda' : (
                    mappedMembers.find(mb => mb.id === (rt.sender_persona_id || rt.sender_model_id))?.name || 'AI'
                  ),
                  text: rt.text
                };
              }

              return {
                id: m.id,
                sender,
                senderName,
                senderId,
                avatar,
                text: m.text,
                time: m.created_at,
                status: 'read', // Legacy field, we use reads now
                reads: m.reads || [],
                ...(replyTo && { replyTo })
              };
            })
          };
        }));

        setSessions(mappedSessions);
      }
    } catch (error) {
      console.error("Failed to load initial data", error);
      showToast('Gagal memuat data dari server');
    }
  };

  const markMessagesAsRead = async (sessionId, messageIds) => {
    if (!messageIds || messageIds.length === 0) return;
    try {
      await fetchFromDB(`/sessions/${sessionId}/read`, {
        method: 'POST',
        body: { message_ids: messageIds }
      });
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          const newMessages = s.messages.map(m => {
            if (messageIds.includes(m.id)) {
              return {
                ...m,
                reads: [...(m.reads || []), { user_id: user?.id, read_at: new Date().toISOString() }]
              };
            }
            return m;
          });
          return { ...s, unreadCount: 0, messages: newMessages };
        }
        return s;
      }));
    } catch (e) {
      console.error('Failed to mark as read', e);
    }
  };

  const deleteCustomPersona = async (id) => {
    try {
      await fetchFromDB(`/personas/${id}`, { method: 'DELETE' });
      const newPersonas = customPersonas.filter(p => p.id !== id);
      setCustomPersonas(newPersonas);
      showToast('Persona berhasil dihapus');
    } catch (e) {
      showToast('Gagal menghapus persona');
    }
  };

  const updateCustomPersona = async (updatedPersona) => {
    try {
      const payload = {
        name: updatedPersona.name,
        avatar_url: updatedPersona.avatar,
        welcome_message: updatedPersona.welcomeMessage,
        system_prompt: updatedPersona.systemPrompt,
        description: updatedPersona.description,
        base_model: updatedPersona.baseModel,
        interest: updatedPersona.interest,
        tone: updatedPersona.tone,
        character_types: updatedPersona.characterType,
        advanced_settings: updatedPersona.advancedSettings
      };

      const savedPersona = await fetchFromDB(`/personas/${updatedPersona.id}`, {
        method: 'PUT',
        body: payload
      });

      const mappedSaved = {
        id: savedPersona.id,
        name: savedPersona.name,
        avatar: savedPersona.avatar_url,
        welcomeMessage: savedPersona.welcome_message,
        systemPrompt: savedPersona.system_prompt,
        description: savedPersona.description,
        baseModel: savedPersona.base_model,
        interest: savedPersona.interest,
        tone: savedPersona.tone,
        characterType: savedPersona.character_types,
        advancedSettings: savedPersona.advanced_settings
      };

      const newPersonas = customPersonas.map(p => p.id === updatedPersona.id ? mappedSaved : p);
      setCustomPersonas(newPersonas);
      showToast('Persona berhasil diperbarui');
      startNewChat(mappedSaved);
      return mappedSaved;
    } catch (e) {
      showToast('Gagal memperbarui persona');
      throw e;
    }
  };

  const addCustomPersona = async (persona) => {
    try {
      const payload = {
        name: persona.name,
        avatar_url: persona.avatar,
        welcome_message: persona.welcomeMessage,
        system_prompt: persona.systemPrompt,
        description: persona.description,
        base_model: persona.baseModel,
        interest: persona.interest,
        tone: persona.tone,
        character_types: persona.characterType,
        advanced_settings: persona.advancedSettings
      };

      const savedPersona = await fetchFromDB('/personas', {
        method: 'POST',
        body: payload
      });

      const mappedSaved = {
        id: savedPersona.id,
        name: savedPersona.name,
        avatar: savedPersona.avatar_url,
        welcomeMessage: savedPersona.welcome_message,
        systemPrompt: savedPersona.system_prompt,
        description: savedPersona.description,
        baseModel: savedPersona.base_model,
        interest: savedPersona.interest,
        tone: savedPersona.tone,
        characterType: savedPersona.character_types,
        advancedSettings: savedPersona.advanced_settings
      };

      const newPersonas = [mappedSaved, ...customPersonas];
      setCustomPersonas(newPersonas);
      showToast('Persona berhasil ditambahkan ke DB');
      startNewChat(mappedSaved);
      return mappedSaved;
    } catch (e) {
      showToast('Gagal menambahkan persona');
      throw e;
    }
  };

  const saveApiKey = (key) => {
    setOpenRouterApiKey(key);
    localStorage.setItem('openRouterApiKey', key);
    showToast('API Key OpenRouter berhasil disimpan');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const saveUserMemories = async (memoriesArray) => {
    try {
      const response = await fetchFromDB('/user/memories', {
        method: 'POST',
        body: { memories: memoriesArray }
      });
      if (response && response.memories) {
        // Reload all memories from server or just update state, reloading is safer to get IDs
        const fetchedMemories = await fetchFromDB('/user/memories');
        if (fetchedMemories && Array.isArray(fetchedMemories)) {
          setUserMemories(fetchedMemories);
        }
        showToast('Pengaturan personalisasi berhasil disimpan');
      }
    } catch (e) {
      console.error(e);
      showToast('Gagal menyimpan pengaturan personalisasi');
    }
  };

  const deleteUserMemory = async (id) => {
    try {
      await fetchFromDB(`/user/memories/${id}`, { method: 'DELETE' });
      setUserMemories(prev => prev.filter(m => m.id !== id));
      showToast('Personalisasi berhasil dihapus');
    } catch (e) {
      console.error(e);
      showToast('Gagal menghapus personalisasi');
    }
  };

  const startNewChat = async (persona) => {
    if (persona.id && persona.id.includes('/') && !openRouterApiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    const isModel = persona.id && persona.id.includes('/');

    // Hanya lompat ke sesi sebelumnya jika ini adalah persona kustom (bukan model)
    if (!isModel) {
      const existing = sessions.find((s) => !s.isGroup && s.personaId === persona.id);
      if (existing) {
        setActiveSessionId(existing.id);
        setActiveMobileTab('chats');
        navigate(`/chat/${existing.id}`);
        return;
      }
    }
    const sessionName = isModel ? `Sesi ${persona.name.split(' ')[0]}` : persona.name;
    const sessionAvatar = isModel
      ? getModelAvatar(sessionName)
      : (persona.avatar || getPersonaAvatar(sessionName));

    try {
      // Prepare member data
      const memberData = {
        member_type: isModel ? 'model' : 'persona'
      };
      if (isModel) {
        memberData.model_id = persona.id;
      } else {
        memberData.persona_id = persona.id;
      }

      // Create session in DB
      const dbSession = await fetchFromDB('/sessions', {
        method: 'POST',
        body: {
          type: 'direct',
          name: sessionName,
          avatar_url: sessionAvatar,
          members: [memberData]
        }
      });

      // Send initial welcome message if any
      const welcomeText = persona.welcomeMessage || `Halo, saya ${persona.name}. Ada yang bisa dibantu?`;
      const initialMessage = await fetchFromDB(`/sessions/${dbSession.id}/messages`, {
        method: 'POST',
        body: {
          sender_type: isModel ? 'model' : 'persona',
          sender_model_id: isModel ? persona.id : null,
          sender_persona_id: isModel ? null : persona.id,
          text: welcomeText,
          is_forwarded: false
        }
      });

      const newSession = {
        id: dbSession.id,
        personaId: persona.id,
        name: dbSession.name,
        avatar: dbSession.avatar_url,
        isGroup: false,
        members: dbSession.members,
        unreadCount: 0,
        lastUpdated: dbSession.updated_at,
        messages: [{
          id: initialMessage.id,
          sender: 'ai',
          senderName: persona.name,
          text: initialMessage.text,
          time: initialMessage.created_at,
          status: 'read'
        }]
      };

      setSessions((prev) => {
        const next = [newSession, ...prev];
        sessionsRef.current = next;
        return next;
      });

      setActiveSessionId(newSession.id);
      setActiveMobileTab('chats');
      navigate(`/chat/${newSession.id}`);
      showToast(`Membuka obrolan dengan ${persona.name}`);
    } catch (e) {
      console.error(e);
      showToast('Gagal membuat sesi chat baru');
    }
  };

  const startIncognitoChat = () => {
    const currentTime = getCurrentTime();
    const newSessionId = 'session-incognito-' + Date.now();

    const newSession = {
      id: newSessionId,
      personaId: defaultIncognitoModel,
      name: "Pertanyaan Cepat",
      avatar: "https://api.dicebear.com/10.x/adventurer/svg?seed=Adil",
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

  const saveIncognitoSession = async (sessionId) => {
    const session = sessionsRef.current.find(s => s.id === sessionId);
    if (!session || !session.isIncognito) return;

    try {
      showToast('Menyimpan obrolan...');
      const personaId = session.personaId || defaultIncognitoModel;
      const isModel = personaId.includes('/');
      
      const memberData = {
        member_type: isModel ? 'model' : 'persona'
      };
      if (isModel) {
        memberData.model_id = personaId;
      } else {
        memberData.persona_id = personaId;
      }

      const dbSession = await fetchFromDB('/sessions', {
        method: 'POST',
        body: {
          type: 'direct',
          name: 'Sesi Tersimpan',
          avatar_url: getModelAvatar('Sesi Tersimpan'),
          members: [memberData]
        }
      });

      const newSessionId = dbSession.id;
      const messagesToSave = session.messages.slice(1);
      
      let firstUserMessageText = "";
      
      for (const msg of messagesToSave) {
        if (msg.sender === 'user' && !firstUserMessageText) {
          firstUserMessageText = msg.text;
        }

        const isUser = msg.sender === 'user';
        await fetchFromDB(`/sessions/${newSessionId}/messages`, {
          method: 'POST',
          body: {
            sender_type: isUser ? 'user' : (isModel ? 'model' : 'persona'),
            ...( !isUser && isModel ? { sender_model_id: personaId } : {} ),
            ...( !isUser && !isModel ? { sender_persona_id: personaId } : {} ),
            text: msg.text,
            is_forwarded: false
          }
        });
      }

      if (firstUserMessageText) {
        // We run this without awaiting so it can update the title in the background
        generateSessionTitle(newSessionId, firstUserMessageText, personaId);
      }

      // Remove incognito session from state and load actual data
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      await loadInitialData();
      
      setActiveSessionId(newSessionId);
      navigate(`/chat/${newSessionId}`);
      showToast('Pesan berhasil disimpan');

    } catch (e) {
      console.error(e);
      showToast('Gagal menyimpan pesan');
    }
  };

  const startGroupChat = async (groupName, members) => {
    try {
      // Map frontend members to backend payload structure
      const apiMembers = members.map(m => {
        const isModel = m.id && m.id.includes('/');
        const isUser = m._type === 'user'; // though currently frontend only creates group with AI

        if (isUser) {
          return { member_type: 'user', user_id: m.id };
        } else if (isModel) {
          return { member_type: 'model', model_id: m.id };
        } else {
          return { member_type: 'persona', persona_id: m.id };
        }
      });

      const dbSession = await fetchFromDB('/sessions', {
        method: 'POST',
        body: {
          type: 'group',
          name: groupName,
          avatar_url: 'group', // We could save actual URL or leave it as group and map it
          members: apiMembers
        }
      });

      const sysText = `Grup "${groupName}" berhasil dibuat dengan ${members.length} anggota.`;
      const initialMessage = await fetchFromDB(`/sessions/${dbSession.id}/messages`, {
        method: 'POST',
        body: {
          sender_type: 'system',
          text: sysText,
          is_forwarded: false
        }
      });

      const newSession = {
        id: dbSession.id,
        name: dbSession.name,
        isGroup: true,
        members: members,
        avatar: getGroupAvatar(dbSession.id),
        unreadCount: 0,
        lastUpdated: dbSession.updated_at,
        isIncognito: false,
        messages: [
          {
            id: initialMessage.id,
            sender: 'system',
            text: initialMessage.text,
            time: initialMessage.created_at,
            status: 'read'
          }
        ]
      };

      setSessions((prev) => {
        const next = [newSession, ...prev];
        sessionsRef.current = next;
        return next;
      });
      setActiveSessionId(newSession.id);
      setActiveMobileTab('chats');
      navigate(`/chat/${newSession.id}`);
      return newSession.id;
    } catch (e) {
      console.error(e);
      showToast('Gagal membuat grup chat');
    }
  };

  const deleteSession = async (e, sessionId) => {
    e?.stopPropagation();

    // Check if session is incognito (no need to delete from DB)
    const sessionToDel = sessionsRef.current.find(s => s.id === sessionId);

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      navigate('/');
    }

    if (sessionToDel && !sessionToDel.isIncognito) {
      try {
        await fetchFromDB(`/sessions/${sessionId}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete session in DB', err);
      }
    }

    showToast('Sesi obrolan berhasil dihapus');
  };

  const deleteMultipleSessions = async (sessionIds) => {
    const sessionsToDel = sessionsRef.current.filter(s => sessionIds.includes(s.id));

    setSessions((prev) => prev.filter((s) => !sessionIds.includes(s.id)));
    if (sessionIds.includes(activeSessionId)) {
      setActiveSessionId(null);
      navigate('/');
    }

    for (const s of sessionsToDel) {
      if (!s.isIncognito) {
        try {
          await fetchFromDB(`/sessions/${s.id}`, { method: 'DELETE' });
        } catch (err) {
          console.error(`Failed to delete session ${s.id} in DB`, err);
        }
      }
    }

    showToast(`${sessionIds.length} obrolan berhasil dihapus`);
  };

  const updateSessionPersonaId = async (sessionId, newPersonaId) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, personaId: newPersonaId } : s));
    showToast('Model berhasil diubah secara lokal');

    try {
      await fetchFromDB(`/sessions/${sessionId}/model`, {
        method: 'PUT',
        body: { persona_id: newPersonaId }
      });
      showToast('Model berhasil diperbarui');
    } catch (err) {
      console.error('Failed to update session model in DB', err);
    }
  };

  const deleteMessage = async (sessionId, messageId) => {
    // Optimistic UI update
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, messages: s.messages.filter(m => m.id !== messageId) };
      }
      return s;
    }));

    // API Call
    try {
      await fetchFromDB(`/sessions/${sessionId}/messages/${messageId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete message in DB', err);
    }
  };

  const generateSessionTitle = async (sessionId, firstMessageText, personaId) => {
    try {
      const prompt = `Buatkan judul singkat (maksimal 2-3 kata) untuk sesi chat yang diawali dengan pesan ini: "${firstMessageText}". Jangan berikan tanda kutip atau kata tambahan lainnya. Cukup kembalikan teks judulnya saja.`;
      const titleMessage = [{ sender: 'user', text: prompt }];

      let newTitle = "";
      const currentUserName = user?.name || 'User';

      if (personaId.startsWith('custom-')) {
        const customPersona = customPersonas.find(p => p.id === personaId);
        if (customPersona && customPersona.baseModel && openRouterApiKey) {
          newTitle = await callOpenRouterAPI(titleMessage, customPersona.baseModel, openRouterApiKey, "Kamu adalah asisten pembuat judul.", currentUserName);
        } else {
          newTitle = await callOpenRouterAPI(titleMessage, 'google/gemini-flash-1.5', openRouterApiKey, "Kamu adalah asisten pembuat judul.", currentUserName);
        }
      } else if (personaId.includes('/') && openRouterApiKey) {
        newTitle = await callOpenRouterAPI(titleMessage, personaId, openRouterApiKey, null, currentUserName);
      } else {
        newTitle = await callOpenRouterAPI(titleMessage, 'google/gemini-flash-1.5', openRouterApiKey, "Kamu adalah asisten pembuat judul.", currentUserName);
      }

      if (newTitle) {
        const cleanTitle = newTitle.replace(/["']/g, '').trim();
        const isModel = personaId && personaId.includes('/');
        const newAvatar = isModel ? getModelAvatar(cleanTitle) : getPersonaAvatar(cleanTitle);

        try {
          await fetchFromDB(`/sessions/${sessionId}`, {
            method: 'PUT',
            body: { name: cleanTitle, avatar_url: newAvatar }
          });
        } catch (err) {
          console.error('Failed to save title to DB', err);
        }

        setSessions(prev => prev.map(s => {
          if (s.id === sessionId) {
            return {
              ...s,
              name: cleanTitle,
              avatar: newAvatar
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
    const currentUserName = user?.name || 'User';

    const session = sessionsRef.current.find(s => s.id === sessionId);
    if (!session) return;

    // Build API payload for user message
    let dbUserMsg;
    if (session.isIncognito) {
      dbUserMsg = {
        id: 'incognito-m-' + Date.now(),
        created_at: currentTime
      };
    } else {
      try {
        dbUserMsg = await fetchFromDB(`/sessions/${sessionId}/messages`, {
          method: 'POST',
          body: {
            sender_type: 'user',
            text: text,
            reply_to_id: replyToMsg?.id || null,
            is_forwarded: false
          }
        });
      } catch (e) {
        showToast('Gagal mengirim pesan ke server');
        return;
      }
      
      // Async memory extraction (background)
      if (openRouterApiKey) {
        extractMemoryFromMessage(text, openRouterApiKey).then(async extracted => {
          if (extracted && extracted.length > 0) {
            try {
              const res = await fetchFromDB('/user/memories', {
                method: 'POST',
                body: { memories: extracted }
              });
              if (res.memories) {
                // Update local memory state without overriding others not returned
                setUserMemories(prev => {
                  const map = new Map();
                  prev.forEach(m => map.set(m.parameter, m));
                  res.memories.forEach(m => map.set(m.parameter, m));
                  return Array.from(map.values());
                });
              }
            } catch (e) {
              console.error("Failed to save extracted memory:", e);
            }
          }
        });
      }
    }

    const newUserMessage = {
      id: dbUserMsg.id,
      sender: 'user',
      text: text,
      time: dbUserMsg.created_at,
      status: 'sent',
      ...(replyToMsg && { replyTo: replyToMsg })
    };

    let updatedMessages = [...session.messages, newUserMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, messages: updatedMessages, lastUpdated: dbUserMsg.created_at }
          : s
      )
    );

    if (typingSessionId) return; // Prevent multiple requests at once
    setTypingSessionId(sessionId);

    if (updatedMessages.length === 2 && !session.isGroup && !session.isIncognito) {
      const isModel = session.personaId && session.personaId.includes('/');
      if (isModel) {
        generateSessionTitle(sessionId, text, session.personaId);
      }
    }

    // A helper to save AI reply to DB and update state
    const saveAiReply = async (replyText, memberData, rToMsg) => {
      if (session.isIncognito) {
        return {
          id: 'incognito-ai-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          sender: 'ai',
          senderId: memberData.id,
          senderName: memberData.name,
          avatar: memberData.avatar,
          text: replyText,
          time: getCurrentTime(),
          status: 'read',
          ...(rToMsg && { replyTo: rToMsg })
        };
      }

      try {
        const isModel = memberData._type === 'model' || (!memberData._type && memberData.id?.includes('/'));
        const dbAiMsg = await fetchFromDB(`/sessions/${sessionId}/messages`, {
          method: 'POST',
          body: {
            sender_type: isModel ? 'model' : 'persona',
            sender_model_id: isModel ? memberData.id : null,
            sender_persona_id: isModel ? null : memberData.id,
            text: replyText,
            reply_to_id: rToMsg?.id || null,
            is_forwarded: false
          }
        });

        const aiMessageObj = {
          id: dbAiMsg.id,
          sender: 'ai',
          senderId: memberData.id,
          senderName: memberData.name,
          avatar: memberData.avatar,
          text: dbAiMsg.text,
          time: dbAiMsg.created_at,
          status: 'read',
          ...(rToMsg && { replyTo: rToMsg })
        };

        return aiMessageObj;
      } catch (e) {
        console.error(`Failed to save AI reply for ${memberData.name} (${memberData._type}):`, e);
        // Return a local-only message as fallback so UI still shows it
        return {
          id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          sender: 'ai',
          senderId: memberData.id,
          senderName: memberData.name,
          avatar: memberData.avatar,
          text: replyText,
          time: getCurrentTime(),
          status: 'read',
          ...(rToMsg && { replyTo: rToMsg })
        };
      }
    };

    if (session.isGroup) {
      let currentMessages = [...updatedMessages];

      const buildPersonaSystemPrompt = (member) => {
        if (member.systemPrompt) {
          return `${member.systemPrompt}\n\nPENTING: Kamu HARUS merespon sebagai "${member.name}". Jangan pernah keluar dari karakter. Jangan pernah menambahkan prefix "[${member.name}]:" di awal pesanmu.`;
        }
        return `Kamu adalah ${member.name}, sebuah AI assistant di grup chat. Respon dengan natural dan tetap dalam karakter sebagai ${member.name}. Jangan pernah menambahkan prefix nama di awal pesanmu.`;
      };

      const formatGroupMessages = (messages) => {
        return messages.map(msg => {
          const prefix = msg.sender === 'user' ? `[${currentUserName}]: ` : (msg.senderName ? `[${msg.senderName}]: ` : '');
          return { ...msg, text: `${prefix}${msg.text}` };
        });
      };

      const callMemberAPI = async (member, formattedMessages) => {
        const FALLBACK_MODEL = 'google/gemini-2.5-flash-lite';
        // 'custom' from fresh creation, 'persona' from DB reload
        if (member._type === 'custom' || member._type === 'default_persona' || member._type === 'persona') {
          const modelToUse = (member.baseModel && openRouterApiKey) ? member.baseModel : FALLBACK_MODEL;
          const enrichedPrompt = buildPersonaSystemPrompt(member);
          return await callOpenRouterAPI(formattedMessages, modelToUse, openRouterApiKey, enrichedPrompt, currentUserName, true, member.name, userMemories);
        } else {
          return await callOpenRouterAPI(formattedMessages, member.id, openRouterApiKey, null, currentUserName, true, member.name, userMemories);
        }
      };

      // Filter out user-type members — only AI members should respond
      // Handles both mapped format (_type) and raw backend format (member_type)
      const aiMembers = session.members.filter(m => m._type !== 'user' && m.member_type !== 'user');

      // Round 1
      for (let i = 0; i < aiMembers.length; i++) {
        try {
          const member = aiMembers[i];
          const formattedApiMessages = formatGroupMessages(currentMessages);

          const aiReplyText = await callMemberAPI(member, formattedApiMessages);

          const cleanReplyText = aiReplyText.replace(/^\[.*?\]:\s*/gm, '').trim();
          const replies = cleanReplyText.split('|||').map(t => t.trim()).filter(Boolean);
          for (let j = 0; j < replies.length; j++) {
            const savedMsg = await saveAiReply(replies[j], member, newUserMessage);
            if (savedMsg) {
              currentMessages = [...currentMessages, savedMsg];
            }
          }
          setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, messages: currentMessages, lastUpdated: getCurrentTime() } : s));

          if (i < aiMembers.length - 1) {
            await new Promise(res => setTimeout(res, 500));
          }
        } catch (err) {
          console.error(`Error in Round 1 for member ${session.members[i]?.name}:`, err);
          const is402 = err.status === 402 || (err.message && err.message.includes('HTTP 402'));
          if (is402) setIsLimitModalOpen(true);
        }
      }

      // Round 2
      for (let i = 0; i < aiMembers.length; i++) {
        try {
          const member = aiMembers[i];
          const messagesWithoutOwnRound1 = currentMessages.filter(
            msg => !(msg.sender === 'ai' && msg.senderName === member.name)
          );

          const lastOtherMessage = [...currentMessages].reverse().find(
            msg => msg.sender === 'ai' && msg.senderName && msg.senderName !== member.name
          );

          if (!lastOtherMessage) continue;

          const formattedApiMessagesRound2 = formatGroupMessages(messagesWithoutOwnRound1);

          const aiReplyText2 = await callMemberAPI(member, formattedApiMessagesRound2);

          const cleanReplyText2 = aiReplyText2.replace(/^\[.*?\]:\s*/gm, '').trim();
          const replies2 = cleanReplyText2.split('|||').map(t => t.trim()).filter(Boolean);
          for (let j = 0; j < replies2.length; j++) {
            const savedMsg = await saveAiReply(replies2[j], member, lastOtherMessage);
            if (savedMsg) {
              currentMessages = [...currentMessages, savedMsg];
            }
          }
          setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, messages: currentMessages, lastUpdated: getCurrentTime() } : s));

          if (i < aiMembers.length - 1) {
            await new Promise(res => setTimeout(res, 500));
          }
        } catch (err) {
          console.error(`Error in Round 2 for member ${session.members[i]?.name}:`, err);
          const is402 = err.status === 402 || (err.message && err.message.includes('HTTP 402'));
          if (is402) setIsLimitModalOpen(true);
        }
      }
      setTypingSessionId(null);
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

      if (session.personaId.startsWith('custom-') || !session.personaId.includes('/')) {
        const customPersona = customPersonas.find(p => p.id === session.personaId);
        if (customPersona) {
          const fallbackModel = 'google/gemini-flash-1.5';
          const modelToUse = (customPersona.baseModel && openRouterApiKey) ? customPersona.baseModel : fallbackModel;
          aiReplyText = await callOpenRouterAPI(apiMessages, modelToUse, openRouterApiKey, customPersona.systemPrompt, currentUserName, false, null, userMemories);
        } else {
          // Maybe it's a default persona loaded from DB, we treat it similarly
          aiReplyText = await callOpenRouterAPI(apiMessages, 'google/gemini-flash-1.5', openRouterApiKey, "Anda adalah asisten AI.", currentUserName, false, null, userMemories);
        }
      } else {
        aiReplyText = await callOpenRouterAPI(apiMessages, session.personaId, openRouterApiKey, null, currentUserName, false, null, userMemories);
      }

      const replies = aiReplyText.split('|||').map(t => t.trim()).filter(Boolean);
      let currentMessages = [...updatedMessages];

      for (let i = 0; i < replies.length; i++) {
        const textChunk = replies[i];

        const memberData = {
          id: session.personaId,
          name: session.name, // The AI uses session name in direct chat
          avatar: session.avatar
        };

        const savedMsg = await saveAiReply(textChunk, memberData, null);

        if (savedMsg) {
          currentMessages.push(savedMsg);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? {
                  ...s,
                  messages: currentMessages,
                  lastUpdated: savedMsg.time,
                  unreadCount: s.id === activeSessionIdRef.current ? 0 : (s.unreadCount || 0) + 1
                }
                : s
            )
          );
        }

        if (i < replies.length - 1) {
          await new Promise(res => setTimeout(res, 800));
        }
      }
    } catch (error) {
      const is402 = error.status === 402 || (error.message && error.message.includes('HTTP 402'));
      if (is402) {
        setIsLimitModalOpen(true);
      }
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
      setTypingSessionId(null);
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
        isApiKeyModalOpen,
        showApiKeyModal: () => setIsApiKeyModalOpen(true),
        hideApiKeyModal: () => setIsApiKeyModalOpen(false),
        isLimitModalOpen,
        showLimitModal: () => setIsLimitModalOpen(true),
        hideLimitModal: () => setIsLimitModalOpen(false),
        startNewChat,
        startIncognitoChat,
        saveIncognitoSession,
        startGroupChat,
        deleteSession,
        deleteMultipleSessions,
        markMessagesAsRead,
        updateSessionPersonaId,
        deleteMessage,
        sendMessage,
        typingSessionId,
        scrollToMessageId,
        setScrollToMessageId,
        showContactInfo,
        setShowContactInfo,
        showSearchInfo,
        setShowSearchInfo,
        activeProfileFeature,
        setActiveProfileFeature,
        openRouterApiKey,
        setOpenRouterApiKey,
        saveApiKey,
        defaultIncognitoModel,
        updateDefaultIncognitoModel,
        customPersonas,
        addCustomPersona,
        deleteCustomPersona,
        updateCustomPersona,
        editingPersona,
        setEditingPersona,
        userMemories,
        saveUserMemories,
        deleteUserMemory,
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
