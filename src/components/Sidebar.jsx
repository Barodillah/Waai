import { useState, useEffect } from 'react';
import { PlusCircle, Search, X, MessageSquare, Bot, CheckCheck, Trash2, ArrowLeft, Users, UserPlus, Megaphone, CircleDashed, Phone, MessageSquarePlus, MoreHorizontal, MoreVertical, Camera, Plus, CheckCircle2, Pin, Check } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { AI_PERSONAS } from '../data/personas';
import ProfileSettings from './ProfileSettings';
import ApiKeyView from './ApiKeyView';
import ConfirmModal from './ConfirmModal';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    activeMobileTab,
    setActiveMobileTab,
    startNewChat,
    deleteSession,
    deleteMultipleSessions,
    showToast,
    activeProfileFeature,
    setActiveProfileFeature,
    customPersonas,
    deleteCustomPersona,
    setEditingPersona
  } = useChat();

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [personaToDelete, setPersonaToDelete] = useState(null);
  const [selectedChatIds, setSelectedChatIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openRouterModels, setOpenRouterModels] = useState([]);
  const [defaultModels, setDefaultModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch('https://openrouter.ai/api/frontend/v1/models/find?active=true&order=most-popular&output_modalities=text');
        const data = await response.json();
        // Limit to 20 models for performance in this UI
        const models = data.data.models.slice(0, 20);
        setOpenRouterModels(models);
        setDefaultModels(models);
      } catch (error) {
        console.error('Failed to fetch OpenRouter models:', error);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    const searchModels = async () => {
      if (modelSearchQuery.length >= 3) {
        setIsLoadingModels(true);
        try {
          const response = await fetch(`https://openrouter.ai/api/frontend/v1/models/find?active=true&output_modalities=text&q=${encodeURIComponent(modelSearchQuery)}`);
          const data = await response.json();
          setOpenRouterModels(data.data.models.slice(0, 20));
        } catch (error) {
          console.error('Failed to search models:', error);
        } finally {
          setIsLoadingModels(false);
        }
      } else if (modelSearchQuery.length === 0) {
        setOpenRouterModels(defaultModels);
      }
    };

    const timeoutId = setTimeout(() => {
      searchModels();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [modelSearchQuery, defaultModels]);

  const filteredSessions = sessions.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.messages[s.messages.length - 1]?.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`h-full flex flex-col transition-all duration-200 border-r border-[#e9edef] bg-[#ffffff] ${
        ((activeSessionId && activeMobileTab === 'chats') || activeProfileFeature === 'new_persona') 
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
                    deleteMultipleSessions(selectedChatIds);
                    setIsSelectionMode(false);
                    setSelectedChatIds([]);
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
                placeholder="Tanya Meta AI atau cari"
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
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button className="px-4 py-1.5 rounded-full text-[13px] whitespace-nowrap bg-[#dcf8c6] text-[#008069]">Semua</button>
              {AI_PERSONAS.map(persona => (
                <button key={persona.id} className="px-4 py-1.5 rounded-full text-[13px] whitespace-nowrap bg-[#f0f2f5] text-[#54656f]">
                  {persona.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5] scrollbar-thin">
            {filteredSessions.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full mt-10">
                <MessageSquarePlus size={48} strokeWidth={1} className="mb-4 text-[#00a884]" />
                <h3 className="text-base font-semibold text-[#111b21] mb-2">Mulai Percakapan Baru</h3>
                <p className="text-[13px] text-[#54656f] mb-6 leading-relaxed">
                  Jelajahi berbagai model AI dari seluruh dunia untuk mendiskusikan apa saja.
                </p>
                <button
                  onClick={() => setActiveMobileTab('new_chat')}
                  className="bg-[#00a884] hover:bg-[#008f6f] text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm text-sm"
                >
                  Buat Chat Baru
                </button>
              </div>
            ) : (
              filteredSessions.map((session) => {
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
                        setActiveSessionId(session.id);
                        navigate(`/chat/${session.id}`);
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
                      <img
                        src={session.avatar}
                        alt={session.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#e9edef]"
                      />
                      {!isSelectionMode && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full ring-2 ring-white"></span>
                      )}
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
                          {/* Trash button moved to ContactInfo */}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : activeMobileTab === 'profile' ? (
        <ProfileSettings />
      ) : activeMobileTab === 'apikey' ? (
        <ApiKeyView isMobile={true} />
      ) : (
        <div className="flex-1 overflow-y-auto bg-white flex flex-col h-full">
          {/* Header Obrolan Baru */}
          <div className="h-16 px-4 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center gap-6 shrink-0 text-[#54656f]">
            <button onClick={() => setActiveMobileTab('chats')} className="hover:text-[#111b21] transition-colors p-1 rounded-full">
              <ArrowLeft size={20} />
            </button>
            <span className="text-base font-medium text-[#111b21]">Obrolan baru</span>
          </div>

          <div className="p-3 border-b border-[#f0f2f5] shrink-0">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm bg-[#f0f2f5] text-[#111b21]">
              <Search size={18} className="text-[#54656f] shrink-0" />
              <input
                type="text"
                value={modelSearchQuery}
                onChange={(e) => setModelSearchQuery(e.target.value)}
                placeholder="Cari model AI..."
                className="w-full bg-transparent border-none outline-none placeholder-[#54656f] text-sm text-[#111b21]"
              />
              {modelSearchQuery && (
                <button onClick={() => setModelSearchQuery('')} className="text-[#54656f] hover:text-[#111b21]">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Action list */}
            <div className="py-2">
              <div className="flex items-center gap-4 px-4 py-3 hover:bg-[#f5f6f6] cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center shrink-0">
                  <Users size={20} />
                </div>
                <span className="text-sm font-medium text-[#111b21]">Grup baru</span>
              </div>
              <div 
                className="flex items-center gap-4 px-4 py-3 hover:bg-[#f5f6f6] cursor-pointer"
                onClick={() => {
                  setActiveProfileFeature('new_persona');
                }}
              >
                <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center shrink-0">
                  <UserPlus size={20} />
                </div>
                <span className="text-sm font-medium text-[#111b21]">Persona baru</span>
              </div>
            </div>



            {customPersonas && customPersonas.length > 0 && (
              <>
                <div className="px-4 py-2 mt-2 border-t border-[#f0f2f5]">
                  <h3 className="text-[13px] text-[#54656f] font-medium">Persona Tersimpan</h3>
                </div>
                {customPersonas.map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => startNewChat(persona)}
                    className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2 md:py-3 hover:bg-[#f5f6f6] cursor-pointer group"
                  >
                    <img
                      src={persona.avatar}
                      alt={persona.name}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0 border-b border-[#f0f2f5] pb-2 md:pb-3 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="text-[15px] md:text-base font-normal text-[#111b21] truncate pr-2">
                            {persona.name}
                          </h3>
                        </div>
                        <p className="text-[13px] md:text-sm text-[#54656f] truncate">
                          {persona.description}
                        </p>
                      </div>
                      
                      <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === persona.id ? null : persona.id)}
                          className={`p-2 text-[#54656f] hover:bg-[#ebebeb] rounded-full transition-opacity ${openDropdownId === persona.id ? 'opacity-100 bg-[#ebebeb]' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                          <MoreVertical size={20} />
                        </button>
                        
                        {openDropdownId === persona.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-[#e9edef] py-1 z-50 overflow-hidden">
                            <button 
                              onClick={() => {
                                alert(`Info Persona:\n\nNama: ${persona.name}\nDeskripsi: ${persona.description}\n\nPrompt Sistem:\n${persona.systemPrompt}`);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-[#111b21] hover:bg-[#f5f6f6]"
                            >
                              Info persona
                            </button>
                            <button 
                              onClick={() => {
                                setEditingPersona(persona);
                                setActiveProfileFeature('new_persona');
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-[#111b21] hover:bg-[#f5f6f6]"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => {
                                setPersonaToDelete(persona);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#f5f6f6]"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className="px-4 py-2 mt-2 border-t border-[#f0f2f5]">
              <h3 className="text-[13px] text-[#54656f] font-medium">Model Avaliable</h3>
            </div>

            {isLoadingModels ? (
              <div className="px-4 py-3 text-sm text-[#54656f] text-center flex items-center justify-center gap-2">
                <CircleDashed size={18} className="animate-spin text-[#00a884]" />
                Memuat model...
              </div>
            ) : (
              openRouterModels.map((model) => {
                const modelName = model.name.toLowerCase();
                let iconUrl = null;
                
                if (modelName.includes('gemini')) iconUrl = 'https://openrouter.ai/images/icons/GoogleGemini.svg';
                else if (modelName.includes('deepseek')) iconUrl = 'https://openrouter.ai/images/icons/DeepSeek.png';
                else if (modelName.includes('openai')) iconUrl = 'https://openrouter.ai/images/icons/OpenAI.svg';
                else if (modelName.includes('z.ai')) iconUrl = 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://z.ai/&size=256';
                else if (modelName.includes('xiaomi')) iconUrl = 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.mi.com&size=256';
                else if (modelName.includes('tencent')) iconUrl = 'https://openrouter.ai/images/icons/Tencent.png';
                else if (modelName.includes('minimax')) iconUrl = 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://minimaxi.com/&size=256';
                else if (modelName.includes('qwen')) iconUrl = 'https://openrouter.ai/images/icons/Qwen.png';
                else if (model.endpoint?.provider_info?.icon?.url) {
                  iconUrl = model.endpoint.provider_info.icon.url.startsWith('/') 
                    ? `https://openrouter.ai${model.endpoint.provider_info.icon.url}` 
                    : model.endpoint.provider_info.icon.url;
                }

                return (
                  <div
                    key={model.slug}
                    onClick={() => startNewChat({
                      id: model.slug,
                      name: model.name,
                      avatar: `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(model.name)}`,
                      welcomeMessage: `Halo! Saya adalah ${model.name}. Ada yang bisa saya bantu?`
                    })}
                    className="px-4 py-3 flex items-center gap-3.5 hover:bg-[#f5f6f6] cursor-pointer"
                  >
                    <div className="relative shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-[#f0f2f5] overflow-hidden">
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={model.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Bot size={18} className="text-[#54656f]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-[#111b21] truncate">{model.name}</h3>
                      <p className="text-[11px] text-[#54656f] truncate">{model.slug}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div className="md:hidden h-[68px] pb-1 border-t border-[#e9edef] bg-[#f0f2f5] flex items-center justify-around px-4 shrink-0 z-10">
        <button
          onClick={() => setActiveMobileTab('status')}
          className="flex flex-col items-center justify-center text-[#111b21]"
        >
          <div className={`relative px-4 py-1 rounded-full ${activeMobileTab === 'status' ? 'bg-[#dcf8c6]' : ''}`}>
            <CircleDashed size={24} strokeWidth={1.5} className={activeMobileTab === 'status' ? 'text-[#008069]' : 'text-[#54656f]'} />
          </div>
          <span className={`text-[10px] mt-1 ${activeMobileTab === 'status' ? 'font-bold' : 'font-medium text-[#54656f]'}`}>Pembaruan</span>
        </button>
        <button
          onClick={() => setActiveMobileTab('chats')}
          className="flex flex-col items-center justify-center text-[#111b21]"
        >
          <div className={`relative px-4 py-1 rounded-full ${activeMobileTab === 'chats' ? 'bg-[#dcf8c6]' : ''}`}>
            <MessageSquare size={24} className={activeMobileTab === 'chats' ? 'text-[#008069] fill-current' : 'text-[#54656f]'} />
            {sessions.length > 0 && (
              <span className="absolute top-0 right-0 -mr-1 -mt-1 bg-[#ea0038] text-white text-[10px] font-bold px-[5px] py-[1px] rounded-full">
                {sessions.length}
              </span>
            )}
          </div>
          <span className={`text-[10px] mt-1 ${activeMobileTab === 'chats' ? 'font-bold' : 'font-medium'}`}>Chat</span>
        </button>
        <button
          onClick={() => setActiveMobileTab('profile')}
          className="flex flex-col items-center justify-center text-[#111b21]"
        >
          <div className={`relative px-4 py-1 rounded-full ${activeMobileTab === 'profile' ? 'bg-[#dcf8c6]' : ''}`}>
            <img src="https://bewhy.id/wp-content/uploads/asset_6a97be88da3ea3.32901038.jpeg" alt="Anda" className="w-[24px] h-[24px] rounded-full object-cover" />
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
      />
    </div>
  );
}
