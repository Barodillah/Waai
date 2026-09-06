import { useState, useEffect } from 'react';
import { PlusCircle, Search, X, MessageSquare, Bot, CheckCheck, Trash2, ArrowLeft, Users, UserPlus, Megaphone, CircleDashed, Phone, MessageSquarePlus, MoreHorizontal, MoreVertical, Camera, Plus, CheckCircle2, Pin, Check, Zap, ChevronDown } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useUser } from '../context/UserContext';
import { formatTime } from '../utils/time';
import ProfileSettings from './ProfileSettings';
import ApiKeyView from './ApiKeyView';
import ConfirmModal from './ConfirmModal';
import NewChatView from './NewChatView';
import MemoriesView from './MemoriesView';
import NewGroupView from './NewGroupView';
import { useNavigate } from 'react-router-dom';

const HighlightMatch = ({ text, query }) => {
  if (!query || !text) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <span key={i} className="text-[#00a884] font-medium">{part}</span> 
          : part
      )}
    </span>
  );
};

export default function Sidebar() {
  const navigate = useNavigate();
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    typingSessionId,
    activeMobileTab,
    setActiveMobileTab,
    startNewChat,
    startIncognitoChat,
    deleteSession,
    deleteMultipleSessions,
    showToast,
    activeProfileFeature,
    setActiveProfileFeature,
    customPersonas,
    deleteCustomPersona,
    setEditingPersona,
    setScrollToMessageId,
    saveIncognitoSession
  } = useChat();
  const { user } = useUser();

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState(null);
  const [selectedChatIds, setSelectedChatIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [showDeleteMultipleConfirm, setShowDeleteMultipleConfirm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [messageSearchLimit, setMessageSearchLimit] = useState(10);

  useEffect(() => {
    setMessageSearchLimit(10);
  }, [searchQuery]);

  const handleNavigation = (action) => {
    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (currentSession?.isIncognito) {
      if (currentSession.messages.length <= 1) {
        deleteSession(null, currentSession.id);
        action();
      } else {
        setPendingNavigation(() => action);
      }
    } else {
      action();
    }
  };



  const isSearchActive = searchQuery.trim().length > 0;

  const baseSessions = sessions.filter(
    (s) =>
      !s.isIncognito &&
      (
        activeFilter === 'all' ? true :
          activeFilter === 'persona' ? (!s.isGroup && s.personaId && !s.personaId.includes('/')) :
            activeFilter === 'model' ? (!s.isGroup && s.personaId && s.personaId.includes('/')) :
              activeFilter === 'group' ? (s.isGroup) :
                (s.personaId === activeFilter)
      )
  ).sort((a, b) => {
    // Treat null/undefined as very old
    const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
    const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
    return dateB - dateA;
  });

  const chatMatches = isSearchActive
    ? baseSessions.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : baseSessions;

  const messageMatches = isSearchActive
    ? baseSessions.flatMap(s => 
        s.messages
          .filter(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(m => ({ ...m, session: s }))
      ).sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
    : [];

  const visibleMessageMatches = messageMatches.slice(0, messageSearchLimit);

  const renderSessionCard = (session) => {
    const lastMsg = session.messages[session.messages.length - 1];
    const isSelectedForChat = activeSessionId === session.id;
    const isChecked = selectedChatIds.includes(session.id);

    return (
      <div
        key={session.id}
        onClick={() => {
          if (isSelectionMode) {
            setSelectedChatIds(prev =>
              prev.includes(session.id)
                ? prev.filter(id => id !== session.id)
                : [...prev, session.id]
            );
          } else {
            handleNavigation(() => {
              setActiveSessionId(session.id);
              navigate(`/chat/${session.id}`);
            });
          }
        }}
        className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors relative group ${isSelectedForChat && !isSelectionMode ? 'bg-[#ebebeb]' : 'hover:bg-[#f5f6f6] bg-white'}`}
      >
        {isSelectionMode && (
          <div className="shrink-0 flex items-center justify-center animate-fade-in pl-2 pr-1">
            {isChecked ? (
              <div className="bg-[#00a884] rounded-full border border-[#00a884] flex items-center justify-center w-[20px] h-[20px] shadow-xs">
                <Check size={12} strokeWidth={4} className="text-white" />
              </div>
            ) : (
              <div className="border-[1.5px] border-[#8696a0] rounded-full w-[20px] h-[20px]"></div>
            )}
          </div>
        )}
        <div className="relative shrink-0 transition-transform duration-200">
          {session.isGroup && session.members?.length >= 2 ? (
            <div className="relative w-12 h-12">
              <img src={session.members[1].avatar} className="absolute bottom-0 right-0 w-8 h-8 rounded-full object-cover border-2 border-white z-0 bg-[#f0f2f5]" />
              <img src={session.members[0].avatar} className="absolute top-0 left-0 w-9 h-9 rounded-full object-cover border-2 border-white z-10 bg-[#f0f2f5]" />
            </div>
          ) : (
            <img
              src={session.avatar}
              alt={session.name}
              className="w-12 h-12 rounded-full object-cover border border-[#e9edef] bg-[#f0f2f5]"
            />
          )}
          {!isSelectionMode && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full ring-2 ring-white z-20"></span>
          )}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between mb-0.5">
            <h2 className="text-sm font-semibold truncate text-[#111b21]">
              <HighlightMatch text={session.name} query={isSearchActive ? searchQuery : ''} />
            </h2>
            <span className="text-[11px] text-[#667781] font-medium">{formatTime(session.lastUpdated)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#667781]">
            <div className="flex items-center gap-1 truncate max-w-[200px] lg:max-w-[240px]">
              {typingSessionId === session.id ? (
                <span className="truncate text-[#00a884] italic font-medium">sedang mengetik...</span>
              ) : (
                <>
                  {lastMsg?.sender === 'user' && (
                    <CheckCheck size={15} className="text-[#53bdeb] shrink-0" />
                  )}
                  <span className="truncate">{lastMsg?.text || 'Memulai pesan...'}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {session.unreadCount > 0 && (
                <span className="bg-[#00a884] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {session.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMessageMatchCard = (msg) => {
    return (
      <div
        key={msg.id}
        onClick={() => {
          handleNavigation(() => {
            setActiveSessionId(msg.session.id);
            setScrollToMessageId(msg.id);
            navigate(`/chat/${msg.session.id}`);
          });
        }}
        className="flex flex-col gap-1 px-4 py-3 cursor-pointer transition-colors relative hover:bg-[#f5f6f6] bg-white border-b border-[#f0f2f5] last:border-0"
      >
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-sm font-semibold truncate text-[#111b21]">
            {msg.session.name}
          </h2>
          <span className="text-[11px] text-[#667781] font-medium">{formatTime(msg.time)}</span>
        </div>
        <div className="flex items-start gap-1 text-[13px] text-[#667781] line-clamp-2">
          {msg.sender === 'user' && <CheckCheck size={15} className="text-[#53bdeb] shrink-0 mt-0.5" />}
          <span className="whitespace-pre-wrap"><HighlightMatch text={msg.text} query={searchQuery} /></span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`h-full flex flex-col transition-all duration-200 border-r border-[#e9edef] bg-[#ffffff] ${((activeSessionId && activeMobileTab === 'chats') || activeProfileFeature === 'new_persona')
        ? 'hidden md:flex md:w-[380px] lg:w-[420px]'
        : 'w-full md:w-[380px] lg:w-[420px]'
        }`}
    >
      {activeMobileTab === 'chats' && (
        isSelectionMode ? (
          <div className="bg-white shrink-0 pt-4 pb-2 px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => { setIsSelectionMode(false); setSelectedChatIds([]); }} className="text-[#54656f] hover:text-[#111b21] transition-colors">
                <X size={22} />
              </button>
              <span className="text-lg font-normal text-[#111b21]">{selectedChatIds.length} dipilih</span>
            </div>
            <div className="flex items-center gap-3 text-[#54656f]">
              <button
                onClick={(e) => { e.stopPropagation(); showToast('Fitur sematkan pesan segera hadir'); }}
                className="hover:bg-[#f0f2f5] p-1.5 rounded-full transition-colors"
                title="Sematkan"
              >
                <Pin size={20} />
              </button>
              <button
                onClick={() => {
                  if (selectedChatIds.length > 0) {
                    setShowDeleteMultipleConfirm(true);
                  }
                }}
                className="hover:bg-[#f0f2f5] p-1.5 rounded-full transition-colors"
                title="Hapus"
              >
                <Trash2 size={20} />
              </button>
              <button className="hover:bg-[#f0f2f5] p-1.5 rounded-full transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shrink-0 pt-4 pb-2 px-4 flex items-center justify-between">
            <h1 className="text-[22px] font-bold text-[#25d366] tracking-tight">WhatsAI</h1>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSelectionMode(true)} className="text-[#54656f] hover:bg-gray-100 p-1.5 rounded-full transition-colors" title="Pilih pesan">
                <CheckCircle2 size={20} />
              </button>
              <button
                onClick={() => setActiveMobileTab('new_chat')}
                className="text-white bg-[#00a884] rounded-full p-2 hover:bg-[#008f6f] transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        )
      )}

      {activeMobileTab === 'chats' ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="p-2 border-b border-[#f0f2f5] shrink-0 bg-white">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm bg-[#f0f2f5] text-[#111b21] mb-2">
              <Search size={18} className="text-[#54656f] shrink-0" />
              <input
                type="text"
                placeholder="Cari pesan"
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

            {/* Filter Pills */}
            <div className="flex items-center gap-2 pr-2">
              <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1 pl-1 items-center">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-colors ${activeFilter === 'all' ? 'bg-[#e7fce3] text-[#008069] font-medium border border-[#e7fce3]' : 'bg-white border border-[#e9edef] text-[#54656f] hover:bg-[#f5f6f6]'}`}
                >
                  Semua
                </button>

                {(() => {
                  const personaCount = sessions.filter(s => !s.isGroup && s.personaId && !s.personaId.includes('/') && !s.isIncognito).length;
                  const modelCount = sessions.filter(s => !s.isGroup && s.personaId && s.personaId.includes('/') && !s.isIncognito).length;
                  const groupCount = sessions.filter(s => s.isGroup).length;

                  return (
                    <>
                      {personaCount > 0 && (
                        <button
                          onClick={() => setActiveFilter('persona')}
                          className={`px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeFilter === 'persona' ? 'bg-[#e7fce3] text-[#008069] font-medium border border-[#e7fce3]' : 'bg-white border border-[#e9edef] text-[#54656f] hover:bg-[#f5f6f6]'}`}
                        >
                          Persona <span className="text-[11px] opacity-80">{personaCount}</span>
                        </button>
                      )}
                      {modelCount > 0 && (
                        <button
                          onClick={() => setActiveFilter('model')}
                          className={`px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeFilter === 'model' ? 'bg-[#e7fce3] text-[#008069] font-medium border border-[#e7fce3]' : 'bg-white border border-[#e9edef] text-[#54656f] hover:bg-[#f5f6f6]'}`}
                        >
                          Model <span className="text-[11px] opacity-80">{modelCount}</span>
                        </button>
                      )}
                      {groupCount > 0 && (
                        <button
                          onClick={() => setActiveFilter('group')}
                          className={`px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeFilter === 'group' ? 'bg-[#e7fce3] text-[#008069] font-medium border border-[#e7fce3]' : 'bg-white border border-[#e9edef] text-[#54656f] hover:bg-[#f5f6f6]'}`}
                        >
                          Grup <span className="text-[11px] opacity-80">{groupCount}</span>
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="relative shrink-0">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="px-2 py-1.5 rounded-full bg-white border border-[#e9edef] text-[#54656f] hover:bg-[#f5f6f6] flex items-center justify-center transition-colors"
                >
                  <ChevronDown size={16} />
                </button>

                {isFilterDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-[#e9edef] py-2 z-50 overflow-hidden">
                    <div className="px-4 pb-2 pt-1">
                      <span className="text-[11px] font-semibold text-[#54656f] uppercase tracking-wider">Filter Model</span>
                    </div>
                    {(() => {
                      const usedModels = sessions.filter(s => s.personaId?.includes('/') && !s.isIncognito)
                        .reduce((acc, s) => {
                          const existing = acc.find(m => m.id === s.personaId);
                          if (!existing) {
                            acc.push({
                              id: s.personaId,
                              name: s.personaId.split('/').pop(),
                              count: 1
                            });
                          } else {
                            existing.count++;
                          }
                          return acc;
                        }, [])
                        .sort((a, b) => b.count - a.count);

                      return usedModels.length > 0 ? (
                        <>
                          {usedModels.map(model => (
                            <button
                              key={model.id}
                              onClick={() => {
                                setActiveFilter(model.id);
                                setIsFilterDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-[14px] text-[#111b21] hover:bg-[#f5f6f6] flex items-center justify-between"
                            >
                              <span className={`truncate mr-2 ${activeFilter === model.id ? "font-bold text-[#008069]" : ""}`}>{model.name}</span>
                              <span className="text-[12px] text-[#54656f] shrink-0">{model.count}</span>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-4 py-2 text-[13px] text-[#54656f] text-center">Belum ada obrolan dengan model.</div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5] scrollbar-thin">
            {baseSessions.length === 0 && !isSearchActive ? (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full mt-10">
                <MessageSquarePlus size={48} strokeWidth={1} className="mb-4 text-[#00a884]" />
                <h3 className="text-base font-semibold text-[#111b21] mb-2">Mulai Percakapan Baru</h3>
                <p className="text-[13px] text-[#54656f] mb-6 leading-relaxed">
                  Jelajahi berbagai model AI dari seluruh dunia untuk mendiskusikan apa saja.
                </p>
                <button
                  onClick={() => handleNavigation(() => setActiveMobileTab('new_chat'))}
                  className="bg-[#00a884] hover:bg-[#008f6f] text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm text-sm"
                >
                  Buat Chat Baru
                </button>
              </div>
            ) : (
              isSearchActive ? (
                <>
                  {chatMatches.length > 0 && (
                    <div className="mb-2">
                      <h3 className="px-5 py-3 text-[15px] font-semibold text-[#008069]">Chat</h3>
                      {chatMatches.map(session => renderSessionCard(session))}
                    </div>
                  )}
                  {visibleMessageMatches.length > 0 && (
                    <div className="mb-2 border-t border-[#f0f2f5]">
                      <h3 className="px-5 py-3 text-[15px] font-semibold text-[#008069]">Pesan</h3>
                      {visibleMessageMatches.map((msg) => renderMessageMatchCard(msg))}
                      {messageMatches.length > visibleMessageMatches.length && (
                        <div className="p-4 text-center">
                          <button 
                            onClick={() => setMessageSearchLimit(prev => prev + 10)}
                            className="text-[#008069] text-sm font-medium hover:underline"
                          >
                            Muat lebih banyak...
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {chatMatches.length === 0 && messageMatches.length === 0 && (
                    <div className="p-10 text-center flex flex-col items-center justify-center mt-10">
                      <p className="text-[#54656f] text-sm">Pesan tidak ditemukan</p>
                    </div>
                  )}
                </>
              ) : (
                baseSessions.map(session => renderSessionCard(session))
              )
            )}
          </div>
        </div>
      ) : activeMobileTab === 'profile' ? (
        <ProfileSettings />
      ) : activeMobileTab === 'apikey' ? (
        <ApiKeyView isMobile={true} />
      ) : activeMobileTab === 'memories' ? (
        <MemoriesView isMobile={true} />
      ) : activeProfileFeature === 'new_group' ? (
        <NewGroupView />
      ) : (
        <NewChatView handleNavigation={handleNavigation} setPersonaToDelete={setPersonaToDelete} />
      )}

      <div className="md:hidden h-[68px] pb-1 border-t border-[#e9edef] bg-[#f0f2f5] flex items-center justify-around px-4 shrink-0 z-10">
        <button
          onClick={() => handleNavigation(() => setActiveMobileTab('new_chat'))}
          className="flex flex-col items-center justify-center text-[#111b21]"
        >
          <div className={`relative px-4 py-1 rounded-full ${activeMobileTab === 'new_chat' || activeMobileTab === 'status' ? 'bg-[#dcf8c6]' : ''}`}>
            <PlusCircle size={24} strokeWidth={1.5} className={activeMobileTab === 'new_chat' || activeMobileTab === 'status' ? 'text-[#008069]' : 'text-[#54656f]'} />
          </div>
          <span className={`text-[10px] mt-1 ${activeMobileTab === 'new_chat' || activeMobileTab === 'status' ? 'font-bold' : 'font-medium text-[#54656f]'}`}>Pesan Baru</span>
        </button>
        <button
          onClick={() => handleNavigation(() => setActiveMobileTab('chats'))}
          className="flex flex-col items-center justify-center text-[#111b21]"
        >
          <div className={`relative px-4 py-1 rounded-full ${activeMobileTab === 'chats' ? 'bg-[#dcf8c6]' : ''}`}>
            <MessageSquare size={24} className={activeMobileTab === 'chats' ? 'text-[#008069] fill-current' : 'text-[#54656f]'} />
            {(() => {
              const totalUnread = sessions.reduce((acc, s) => acc + (s.unreadCount || 0), 0);
              if (totalUnread === 0) return null;
              return (
                <span className="absolute top-0 right-0 -mr-1 -mt-1 bg-[#ea0038] text-white text-[10px] font-bold px-[5px] py-[1px] rounded-full">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              );
            })()}
          </div>
          <span className={`text-[10px] mt-1 ${activeMobileTab === 'chats' ? 'font-bold' : 'font-medium'}`}>Chat</span>
        </button>
        <button
          onClick={() => handleNavigation(() => setActiveMobileTab('profile'))}
          className="flex flex-col items-center justify-center text-[#111b21]"
        >
          <div className={`relative px-4 py-1 rounded-full ${activeMobileTab === 'profile' ? 'bg-[#dcf8c6]' : ''}`}>
            <img src={user?.avatar_url || "https://bewhy.id/wp-content/uploads/asset_6a97be88da3ea3.32901038.jpeg"} alt={user?.name || "Anda"} className="w-[24px] h-[24px] rounded-full object-cover" />
          </div>
          <span className={`text-[10px] mt-1 ${activeMobileTab === 'profile' ? 'font-bold' : 'font-medium text-[#54656f]'}`}>Profil</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={!!personaToDelete}
        title="Hapus Persona"
        message={`Apakah Anda yakin ingin menghapus persona "${personaToDelete?.name}" beserta seluruh riwayat obrolannya? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={() => {
          if (personaToDelete) {
            // Hapus sesi obrolan yang terkait dengan persona ini jika ada
            const sessionToDelete = sessions.find(s => s.personaId === personaToDelete.id);
            if (sessionToDelete) {
              deleteSession(null, sessionToDelete.id);
            }

            deleteCustomPersona(personaToDelete.id);
            setPersonaToDelete(null);
          }
        }}
        onCancel={() => setPersonaToDelete(null)}
        confirmText="Hapus"
        cancelText="Batal"
      />

      <ConfirmModal
        isOpen={!!pendingNavigation}
        title="Keluar dari Pertanyaan Cepat?"
        message="Sesi Pertanyaan Cepat tidak akan disimpan. Apakah Anda yakin ingin keluar?"
        onConfirm={() => {
          if (pendingNavigation) {
            deleteSession(null, activeSessionId);
            pendingNavigation();
            setPendingNavigation(null);
          }
        }}
        onCancel={() => setPendingNavigation(null)}
        confirmText="Ya, Keluar"
        cancelText="Batal"
        extraAction={() => {
          if (pendingNavigation) {
            saveIncognitoSession(activeSessionId);
            pendingNavigation();
            setPendingNavigation(null);
          }
        }}
        extraText="Simpan Pesan"
        extraStyle="bg-[#008069] hover:bg-[#06cf9c] text-white"
      />
      <ConfirmModal
        isOpen={showDeleteMultipleConfirm}
        title="Hapus Obrolan"
        message={`Apakah Anda yakin ingin menghapus ${selectedChatIds.length} obrolan yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={() => {
          deleteMultipleSessions(selectedChatIds);
          setIsSelectionMode(false);
          setSelectedChatIds([]);
          setShowDeleteMultipleConfirm(false);
        }}
        onCancel={() => setShowDeleteMultipleConfirm(false)}
        confirmText="Hapus"
        cancelText="Batal"
      />
    </div>
  );
}
