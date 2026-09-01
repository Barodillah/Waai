import { useState } from 'react';
import { PlusCircle, Search, X, MessageSquare, Bot, CheckCheck, Trash2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { AI_PERSONAS } from '../data/personas';

export default function Sidebar() {
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    activeMobileTab,
    setActiveMobileTab,
    startNewChat,
    deleteSession
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.messages[s.messages.length - 1]?.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`h-full flex flex-col transition-all duration-200 border-r border-[#e9edef] bg-[#ffffff] ${activeSessionId ? 'hidden md:flex md:w-[380px] lg:w-[420px]' : 'w-full md:w-[380px] lg:w-[420px]'
        }`}
    >
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
              <span>Barod</span>
              <span className="text-[10px] bg-[#00a884]/15 text-[#008069] font-bold px-2 py-0.5 rounded-full">
                Online
              </span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[#54656f]">
          <button
            onClick={() => setActiveMobileTab(activeMobileTab === 'chats' ? 'new_chat' : 'chats')}
            title="Mulai Obrolan Baru"
            className={`p-2 rounded-full transition-colors ${activeMobileTab === 'new_chat' ? 'text-[#008069] bg-[#e9edef]' : 'hover:bg-[#e9edef]'
              }`}
          >
            <PlusCircle size={21} />
          </button>
        </div>
      </div>

      {activeMobileTab === 'chats' ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
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
                    onClick={() => {
                      setActiveSessionId(session.id);
                      window.history.pushState(null, '', `/chat/${session.id}`); // Manual url sync via context or let router handle? We let router handle via Navigate but wait, Sidebar uses Link or navigate.
                      // I should use `useNavigate` in ChatContext or here. I did use it in ChatContext for `startNewChat` but here I'm setting state. Let's fix this in ActiveChat/Router later.
                      // Actually, setActiveSessionId should probably navigate if it's not.
                    }}
                    className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors relative group ${isSelected ? 'bg-[#ebebeb]' : 'hover:bg-[#f5f6f6] bg-white'
                      }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={session.avatar}
                        alt={session.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#e9edef]"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full ring-2 ring-white"></span>
                    </div>

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

      <div className="md:hidden h-16 border-t border-[#e9edef] bg-white flex items-center justify-around shrink-0 shadow-xs">
        <button
          onClick={() => setActiveMobileTab('chats')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${activeMobileTab === 'chats' ? 'text-[#008069] font-bold' : 'text-[#54656f]'
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

        <button
          onClick={() => setActiveMobileTab('new_chat')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${activeMobileTab === 'new_chat' ? 'text-[#008069] font-bold' : 'text-[#54656f]'
            }`}
        >
          <PlusCircle size={22} />
          <span className="text-[11px] mt-1">Chat Baru</span>
        </button>
      </div>
    </div>
  );
}
