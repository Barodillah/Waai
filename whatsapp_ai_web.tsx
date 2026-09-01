import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  PlusCircle,
  Search,
  Send,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  Phone,
  Video,
  CheckCheck,
  Bot,
  Sparkles,
  Trash2,
  ArrowLeft,
  Code2,
  PenTool,
  Languages,
  Briefcase,
  X,
  Copy,
  Check,
  Lock
} from 'lucide-react';

// Daftar Preset Persona Asisten AI (Light Mode Optimized)
const AI_PERSONAS = [
  {
    id: 'general',
    name: 'Gemini AI (Asisten Pintar)',
    role: 'Asisten Serbaguna',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    icon: Sparkles,
    systemPrompt: 'Kamu adalah asisten pintar WhatsApp yang ramah, ringkas, solutif, dan menggunakan bahasa Indonesia santai namun profesional layaknya teman ngobrol di WA. Gunakan emoji yang sesuai.',
    welcomeMessage: 'Halo! Ada yang bisa saya bantu hari ini? Tanyakan apa saja! 🚀'
  },
  {
    id: 'coder',
    name: 'DevBot (Ahli Koding)',
    role: 'Programmer & Debugger',
    avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
    icon: Code2,
    systemPrompt: 'Kamu adalah programmer senior ahli (fullstack, debugging, arsitektur). Jawab pertanyaan teknis dengan ringkas, kode bersih, dan penjelasan jelas.',
    welcomeMessage: 'Siap membantu ngoding! Kirim cuplikan error, algoritma, atau minta rekomendasi arsitektur.'
  },
  {
    id: 'writer',
    name: 'CopyCrafter (Penulis Konten)',
    role: 'Copywriter & Kreatif',
    avatar: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=150&auto=format&fit=crop&q=80',
    icon: PenTool,
    systemPrompt: 'Kamu adalah copywriter profesional dan konsultan konten viral. Berikan ide caption, copywriting, naskah video, atau artikel yang persuasif.',
    welcomeMessage: 'Halo! Mau bikin caption medsos, email profesional, atau artikel kreatif hari ini?'
  },
  {
    id: 'translator',
    name: 'PolyGlot (Penerjemah Bahasa)',
    role: 'Bahasa & Grammar',
    avatar: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
    icon: Languages,
    systemPrompt: 'Kamu adalah penerjemah multi-bahasa handal (Inggris, Mandarin, Jepang, Arab, dll.) dan tutor tata bahasa. Terjemahkan dengan luwes dan jelaskan konteks budayanya jika perlu.',
    welcomeMessage: 'Ketik kalimat atau paragraf yang ingin kamu terjemahkan atau periksa tata bahasanya!'
  },
  {
    id: 'business',
    name: 'BizAdvisor (Konsultan Bisnis)',
    role: 'Strategi & Finansial',
    avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
    icon: Briefcase,
    systemPrompt: 'Kamu adalah konsultan bisnis, manajemen, dan keuangan mikro. Berikan analisis logis, strategi eksekusi, serta tips efisiensi bisnis.',
    welcomeMessage: 'Salam sukses! Diskusikan ide bisnis, perhitungan modal, atau strategi marketing kamu di sini.'
  }
];

export default function App() {
  // State Sesi Chat WhatsApp
  const [sessions, setSessions] = useState([
    {
      id: 'session-1',
      personaId: 'general',
      name: 'Gemini AI (Asisten Pintar)',
      avatar: AI_PERSONAS[0].avatar,
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
      personaId: 'coder',
      name: 'DevBot (Ahli Koding)',
      avatar: AI_PERSONAS[1].avatar,
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
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll saat pesan baru masuk
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, isTyping]);

  // Cari sesi aktif saat ini
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Helper Toast Notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Panggil Gemini API dengan retry exponential backoff
  const callGeminiAPI = async (chatMessages, persona) => {
    const apiKey = "";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const contents = chatMessages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: persona.systemPrompt }]
      }
    };

    let retries = 5;
    let delay = 1000;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) return responseText;
        throw new Error('Pesan balasan kosong');
      } catch (err) {
        if (i === retries - 1) {
          throw err;
        }
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      }
    }
  };

  // Format jam saat ini (HH:MM)
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  };

  // Kirim Pesan User
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeSessionId || isTyping) return;

    const userMessageText = inputText.trim();
    const currentTime = getCurrentTime();
    const userMsgId = 'msg-' + Date.now();

    const newUserMessage = {
      id: userMsgId,
      sender: 'user',
      text: userMessageText,
      time: currentTime,
      status: 'sent'
    };

    const updatedMessages = [...activeSession.messages, newUserMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: updatedMessages,
              lastUpdated: currentTime
            }
          : s
      )
    );

    setInputText('');
    setIsTyping(true);

    const persona = AI_PERSONAS.find((p) => p.id === activeSession.personaId) || AI_PERSONAS[0];

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
          s.id === activeSessionId
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
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s))
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Mulai obrolan baru dengan AI
  const startNewChat = (persona) => {
    const existing = sessions.find((s) => s.personaId === persona.id);
    if (existing) {
      setActiveSessionId(existing.id);
      setActiveMobileTab('chats');
      return;
    }

    const currentTime = getCurrentTime();
    const newSession = {
      id: 'session-' + Date.now(),
      personaId: persona.id,
      name: persona.name,
      avatar: persona.avatar,
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
    setActiveSessionId(newSession.id);
    setActiveMobileTab('chats');
    showToast(`Membuka obrolan dengan ${persona.name}`);
  };

  // Hapus Sesi Obrolan
  const deleteSession = (e, sessionId) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
    showToast('Sesi obrolan berhasil dihapus');
  };

  // Salin teks pesan
  const handleCopyText = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    showToast('Teks berhasil disalin!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter daftar obrolan
  const filteredSessions = sessions.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.messages[s.messages.length - 1]?.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-screen flex flex-col font-sans overflow-hidden select-none bg-[#f0f2f5] text-[#111b21]">
      {/* Toast Notification Floating */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#008069] text-white px-4 py-2 rounded-full shadow-md text-xs md:text-sm font-medium flex items-center gap-2 animate-bounce">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden w-full h-full relative">
        {/* ========================================================= */}
        {/* PANEL KIRI: DAFTAR CHAT & CHAT BARU (Mobile & Desktop)     */}
        {/* ========================================================= */}
        <div
          className={`h-full flex flex-col transition-all duration-200 border-r border-[#e9edef] bg-[#ffffff] ${
            activeSessionId ? 'hidden md:flex md:w-[380px] lg:w-[420px]' : 'w-full md:w-[380px] lg:w-[420px]'
          }`}
        >
          {/* Header Panel Kiri Khas WhatsApp Light */}
          {}
          <div className="h-16 px-4 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Profil"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00a884]"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-[#111b21] flex items-center gap-1.5">
                  <span>WhatsApp AI</span>
                  <span className="text-[10px] bg-[#00a884]/15 text-[#008069] font-bold px-2 py-0.5 rounded-full">
                    Online
                  </span>
                </h1>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-1 text-[#54656f]">
              <button
                onClick={() => setActiveMobileTab(activeMobileTab === 'chats' ? 'new_chat' : 'chats')}
                title="Mulai Obrolan Baru"
                className={`p-2 rounded-full transition-colors ${
                  activeMobileTab === 'new_chat' ? 'text-[#008069] bg-[#e9edef]' : 'hover:bg-[#e9edef]'
                }`}
              >
                <PlusCircle size={21} />
              </button>
            </div>
          </div>

          {/* Konten Kiri (Tabs: Chats vs New Chat) */}
          {activeMobileTab === 'chats' ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Search Bar WhatsApp Light */}
              <div className="p-2 border-b border-[#f0f2f5] shrink-0 bg-white">
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm bg-[#f0f2f5] text-[#111b21]">
                  <Search size={18} className="text-[#54656f] shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari atau mulai chat baru"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none placeholder-[#54656f] text-sm text-[#111b21]"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-[#54656f] hover:text-[#111b21]">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* List Sesi Obrolan */}
              {}
              <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5] scrollbar-thin">
                {filteredSessions.length === 0 ? (
                  <div className="p-8 text-center text-[#54656f] flex flex-col items-center justify-center">
                    <Bot size={40} className="mb-2 text-[#00a884] opacity-70" />
                    <p className="text-sm font-semibold text-[#111b21]">Belum ada obrolan</p>
                    <p className="text-xs mt-1 text-[#667781]">Klik tombol Chat Baru untuk memilih asisten AI favoritmu.</p>
                  </div>
                ) : (
                  filteredSessions.map((session) => {
                    const lastMsg = session.messages[session.messages.length - 1];
                    const isSelected = activeSessionId === session.id;

                    return (
                      <div
                        key={session.id}
                        onClick={() => setActiveSessionId(session.id)}
                        className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors relative group ${
                          isSelected
                            ? 'bg-[#ebebeb]'
                            : 'hover:bg-[#f5f6f6] bg-white'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <img
                            src={session.avatar}
                            alt={session.name}
                            className="w-12 h-12 rounded-full object-cover border border-[#e9edef]"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full ring-2 ring-white"></span>
                        </div>

                        {/* Info Chat */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <h2 className="text-sm font-semibold truncate text-[#111b21]">
                              {session.name}
                            </h2>
                            <span className="text-[11px] text-[#667781] font-medium">{session.lastUpdated}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-[#667781]">
                            <div className="flex items-center gap-1 truncate max-w-[200px] lg:max-w-[240px]">
                              {lastMsg?.sender === 'user' && (
                                <CheckCheck size={15} className="text-[#53bdeb] shrink-0" />
                              )}
                              <span className="truncate">{lastMsg?.text || 'Memulai pesan...'}</span>
                            </div>

                            {/* Tombol Hapus */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => deleteSession(e, session.id)}
                                title="Hapus Chat"
                                className="opacity-0 group-hover:opacity-100 p-1 text-[#667781] hover:text-red-500 rounded transition-opacity"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            // =========================================================
            // TAB: PILIH ASISTEN AI BARU (NEW CHAT LIGHT MODE)
            // =========================================================
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-white">
              <div className="px-2 py-1">
                <h2 className="text-xs font-bold text-[#008069] uppercase tracking-wider">
                  Pilih Asisten AI Spesialis
                </h2>
                <p className="text-xs text-[#667781] mt-0.5">
                  Mulai percakapan langsung dengan AI sesuai kebutuhanmu
                </p>
              </div>

              {AI_PERSONAS.map((persona) => {
                const IconComponent = persona.icon;
                return (
                  <div
                    key={persona.id}
                    onClick={() => startNewChat(persona)}
                    className="p-3 rounded-xl cursor-pointer flex items-center gap-3.5 transition-all border border-[#e9edef] bg-white hover:bg-[#f5f6f6] hover:border-[#00a884]/40 shadow-xs"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00a884]"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-[#008069] text-white p-1 rounded-full shadow-xs">
                        <IconComponent size={12} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#111b21] truncate">{persona.name}</h3>
                      </div>
                      <p className="text-xs text-[#008069] font-semibold">{persona.role}</p>
                      <p className="text-[11px] text-[#667781] truncate mt-0.5">{persona.welcomeMessage}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================= */}
          {/* BOTTOM MENU MOBILE (2 Menu: Chats & Chat Baru)           */}
          {/* ========================================================= */}
          <div className="md:hidden h-16 border-t border-[#e9edef] bg-white flex items-center justify-around shrink-0 shadow-xs">
            {/* Tombol Menu 1: Chats */}
            <button
              onClick={() => setActiveMobileTab('chats')}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
                activeMobileTab === 'chats' ? 'text-[#008069] font-bold' : 'text-[#54656f]'
              }`}
            >
              <div className="relative">
                <MessageSquare size={22} />
                {sessions.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#008069] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {sessions.length}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1">Chats</span>
            </button>

            {/* Tombol Menu 2: Chat Baru AI */}
            <button
              onClick={() => setActiveMobileTab('new_chat')}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
                activeMobileTab === 'new_chat' ? 'text-[#008069] font-bold' : 'text-[#54656f]'
              }`}
            >
              <PlusCircle size={22} />
              <span className="text-[11px] mt-1">Chat Baru</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PANEL KANAN: RUANG CHAT AKTIF / EMPTY STATE               */}
        {/* ========================================================= */}
        <div
          className={`flex-1 h-full flex flex-col relative bg-[#efeae2] ${
            activeSessionId ? 'flex w-full' : 'hidden md:flex'
          }`}
        >
          {activeSession ? (
            <>
              {/* Header Ruang Chat Aktif Khas WhatsApp Light */}
              <div className="h-16 px-3 md:px-4 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  {/* Tombol Kembali (Khusus Mobile) */}
                  <button
                    onClick={() => setActiveSessionId(null)}
                    className="md:hidden p-1.5 -ml-1 text-[#54656f] hover:text-[#111b21] rounded-full"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <img
                    src={activeSession.avatar}
                    alt={activeSession.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-[#00a884]"
                  />

                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold truncate leading-tight text-[#111b21]">
                      {activeSession.name}
                    </h2>
                    <p className="text-[11px] text-[#008069] font-medium truncate">
                      {isTyping ? 'sedang mengetik balasan...' : 'online (Asisten AI Aktif)'}
                    </p>
                  </div>
                </div>

                {/* Aksi Header Kanan */}
                <div className="flex items-center gap-1 md:gap-3 text-[#54656f]">
                  <button
                    onClick={() => showToast('Fitur panggilan suara AI segera hadir')}
                    className="p-2 hover:bg-[#e9edef] rounded-full transition-colors"
                    title="Panggilan Suara"
                  >
                    <Phone size={19} />
                  </button>
                  <button
                    onClick={() => showToast('Fitur panggilan video AI segera hadir')}
                    className="p-2 hover:bg-[#e9edef] rounded-full transition-colors"
                    title="Panggilan Video"
                  >
                    <Video size={19} />
                  </button>
                  <button
                    onClick={() => showToast('Model: Gemini 2.5 Flash')}
                    className="p-2 hover:bg-[#e9edef] rounded-full transition-colors"
                    title="Info Asisten"
                  >
                    <MoreVertical size={19} />
                  </button>
                </div>
              </div>

              {/* Area Pesan Chat (Background Doodle Light WhatsApp) */}
              {}
              <div
                className="flex-1 overflow-y-auto px-3 md:px-12 py-4 space-y-3 relative scrollbar-thin"
                style={{
                  backgroundImage: `radial-gradient(circle at center, rgba(0, 0, 0, 0.035) 0%, transparent 70%)`
                }}
              >
                {/* Banner Enkripsi WhatsApp Light */}
                <div className="flex justify-center my-2">
                  <div className="text-[11px] px-3 py-1.5 rounded-lg max-w-sm text-center shadow-xs flex items-center gap-1.5 bg-[#ffeecd] text-[#54656f] border border-[#ffdf9e]/50">
                    <Lock size={12} className="shrink-0 text-[#856404]" />
                    <span>Pesan diproses langsung secara cerdas oleh Google Gemini AI.</span>
                  </div>
                </div>

                {/* List Pesan Chat */}
                {activeSession.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div
                        className={`relative max-w-[85%] md:max-w-[70%] lg:max-w-[60%] rounded-lg px-3 py-2 text-sm shadow-xs transition-all ${
                          isUser
                            ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                            : 'bg-[#ffffff] text-[#111b21] rounded-tl-none border border-[#e9edef]/60'
                        }`}
                      >
                        {/* Copy Button on Hover */}
                        <button
                          onClick={() => handleCopyText(msg.text, msg.id)}
                          className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/90 text-[#54656f] hover:text-[#111b21] p-1 rounded transition-opacity shadow-xs text-xs flex items-center gap-1 border border-[#e9edef]"
                          title="Salin Teks"
                        >
                          {copiedId === msg.id ? <Check size={12} className="text-[#008069]" /> : <Copy size={12} />}
                        </button>

                        {/* Teks Pesan */}
                        <div className="whitespace-pre-wrap break-words leading-relaxed font-normal text-[#111b21]">
                          {msg.text}
                        </div>

                        {/* Timestamp & Tanda Centang */}
                        <div className="flex items-center justify-end gap-1 text-[10px] text-[#667781] mt-1 float-right ml-2 -mb-0.5 select-none">
                          <span>{msg.time}</span>
                          {isUser && (
                            <CheckCheck size={14} className="text-[#53bdeb]" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Indikator Mengetik */}
                {}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-2.5 shadow-xs flex items-center gap-1.5 bg-[#ffffff] text-[#667781] border border-[#e9edef]">
                      <span className="w-2 h-2 rounded-full bg-[#008069] animate-bounce"></span>
                      <span
                        className="w-2 h-2 rounded-full bg-[#008069] animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></span>
                      <span
                        className="w-2 h-2 rounded-full bg-[#008069] animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                      ></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Attachment Popup Menu */}
              {showAttachMenu && (
                <div className="absolute bottom-20 left-4 md:left-8 p-3 rounded-2xl shadow-lg flex gap-4 border border-[#e9edef] bg-white z-20 animate-fade-in">
                  <button
                    onClick={() => {
                      setInputText('Bantu analisis kode ini: ');
                      setShowAttachMenu(false);
                      inputRef.current?.focus();
                    }}
                    className="flex flex-col items-center gap-1 text-xs text-[#54656f] hover:text-[#111b21]"
                  >
                    <div className="w-11 h-11 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-xs">
                      <Code2 size={20} />
                    </div>
                    <span>Kode</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText('Tolong terjemahkan teks berikut: ');
                      setShowAttachMenu(false);
                      inputRef.current?.focus();
                    }}
                    className="flex flex-col items-center gap-1 text-xs text-[#54656f] hover:text-[#111b21]"
                  >
                    <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs">
                      <Languages size={20} />
                    </div>
                    <span>Bahasa</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText('Buatkan copywriting menarik untuk: ');
                      setShowAttachMenu(false);
                      inputRef.current?.focus();
                    }}
                    className="flex flex-col items-center gap-1 text-xs text-[#54656f] hover:text-[#111b21]"
                  >
                    <div className="w-11 h-11 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <PenTool size={20} />
                    </div>
                    <span>Ide Konten</span>
                  </button>
                </div>
              )}

              {/* Input Bar Chat Khas WhatsApp Light */}
              {}
              <div className="p-2.5 md:px-4 md:py-3 flex items-center gap-2 shrink-0 bg-[#f0f2f5] border-t border-[#e9edef]">
                {/* Tombol Emoji */}
                <button
                  type="button"
                  onClick={() => setInputText((prev) => prev + ' 😊')}
                  className="p-2 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors"
                >
                  <Smile size={22} />
                </button>

                {/* Tombol Attachment */}
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="p-2 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors"
                >
                  <Paperclip size={22} />
                </button>

                {/* Input Textbox */}
                <form onSubmit={handleSendMessage} className="flex-1 flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ketik pesan AI..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isTyping}
                    className="w-full px-4 py-2.5 rounded-lg text-sm border-none outline-none bg-white text-[#111b21] placeholder-[#54656f] shadow-xs"
                  />
                </form>

                {/* Tombol Kirim / Mic */}
                {inputText.trim() ? (
                  <button
                    onClick={handleSendMessage}
                    disabled={isTyping}
                    className="p-2.5 bg-[#008069] hover:bg-[#00705c] text-white rounded-full transition-colors shadow-xs flex items-center justify-center"
                  >
                    <Send size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => showToast('Mendengarkan rekaman suara...')}
                    className="p-2 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors"
                  >
                    <Mic size={22} />
                  </button>
                )}
              </div>
            </>
          ) : (
            // =========================================================
            // EMPTY STATE DESKTOP PERSIS WHATSAPP WEB LIGHT
            // =========================================================
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#f0f2f5] border-b-[6px] border-[#008069]">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-[#008069]/10 flex items-center justify-center text-[#008069]">
                  <Bot size={52} />
                </div>
                <div className="absolute -top-1 -right-1 bg-[#008069] text-white p-2 rounded-full shadow-md">
                  <Sparkles size={18} />
                </div>
              </div>

              <h2 className="text-2xl font-light text-[#111b21] tracking-wide mb-2">WhatsApp AI Web</h2>
              <p className="text-sm text-[#667781] max-w-md leading-relaxed mb-6">
                Kirim dan terima jawaban AI secara instan. Pilih salah satu obrolan di bilah kiri atau mulai chat baru dengan persona spesialis.
              </p>

              <button
                onClick={() => setActiveMobileTab('new_chat')}
                className="px-5 py-2.5 bg-[#008069] hover:bg-[#00705c] text-white rounded-full text-sm font-semibold shadow-xs flex items-center gap-2 transition-all hover:scale-105"
              >
                <PlusCircle size={18} />
                <span>Mulai Chat Baru</span>
              </button>

              <div className="mt-16 flex items-center gap-2 text-xs text-[#667781]">
                <Lock size={12} className="text-[#667781]" />
                <span>Terenkripsi & Didukung oleh Google Gemini AI</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}