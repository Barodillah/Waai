import { useState, useEffect } from 'react';
import { Search, X, ArrowLeft, Users, UserPlus, Zap, MoreVertical, CircleDashed, Bot } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { getModelAvatar } from '../utils/avatar';

export default function NewChatView({ handleNavigation, setPersonaToDelete }) {
  const {
    setActiveMobileTab,
    startNewChat,
    startIncognitoChat,
    activeProfileFeature,
    setActiveProfileFeature,
    customPersonas,
    setEditingPersona,
    openRouterApiKey,
    showApiKeyModal
  } = useChat();

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [openRouterModels, setOpenRouterModels] = useState([]);
  const [defaultModels, setDefaultModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  const filteredPersonas = (customPersonas || []).filter(
    (p) =>
      p.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(modelSearchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch('https://openrouter.ai/api/frontend/v1/models/find?active=true&order=most-popular&output_modalities=text&categories=roleplay');
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

  return (
    <div className="flex-1 overflow-y-auto bg-white flex flex-col h-full">
      {/* Header Obrolan Baru */}
      <div className="h-16 px-4 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center gap-6 shrink-0 text-[#54656f]">
        <button onClick={() => handleNavigation(() => setActiveMobileTab('chats'))} className="hover:text-[#111b21] transition-colors p-1 rounded-full">
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
            placeholder="Cari model atau persona..."
            className="w-full bg-transparent border-none outline-none placeholder-[#54656f] text-sm text-[#111b21]"
          />
          {modelSearchQuery && (
            <button onClick={() => setModelSearchQuery('')} className="text-[#54656f] hover:text-[#111b21]">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Action list - hide during search */}
        {!modelSearchQuery && (
          <div className="py-2">
            <div
              className={`flex items-center gap-4 px-4 py-3 hover:bg-[#f5f6f6] cursor-pointer ${activeProfileFeature === 'new_group' ? 'bg-[#f0f2f5]' : ''}`}
              onClick={() => {
                if (!openRouterApiKey) {
                  showApiKeyModal();
                  return;
                }
                handleNavigation(() => setActiveProfileFeature('new_group'));
              }}
            >
              <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <span className="text-sm font-medium text-[#111b21]">Grup baru</span>
            </div>
            <div
              className={`flex items-center gap-4 px-4 py-3 hover:bg-[#f5f6f6] cursor-pointer ${activeProfileFeature === 'new_persona' ? 'bg-[#f0f2f5]' : ''}`}
              onClick={() => {
                if (!openRouterApiKey) {
                  showApiKeyModal();
                  return;
                }
                handleNavigation(() => setActiveProfileFeature('new_persona'));
              }}
            >
              <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center shrink-0">
                <UserPlus size={20} />
              </div>
              <span className="text-sm font-medium text-[#111b21]">Persona baru</span>
            </div>
            <div
              className="flex items-center gap-4 px-4 py-3 hover:bg-[#f5f6f6] cursor-pointer"
              onClick={() => {
                if (!openRouterApiKey) {
                  showApiKeyModal();
                  return;
                }
                handleNavigation(() => { setActiveProfileFeature(null); startIncognitoChat(); })
              }}
            >
              <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center shrink-0">
                <Zap size={20} />
              </div>
              <span className="text-sm font-medium text-[#111b21]">Pertanyaan Cepat</span>
            </div>
          </div>
        )}

        {filteredPersonas && filteredPersonas.length > 0 && (
          <>
            <div className="px-4 py-2 mt-2 border-t border-[#f0f2f5]">
              <h3 className="text-[13px] text-[#54656f] font-medium">Persona Tersimpan</h3>
            </div>
            {filteredPersonas.map((persona) => (
              <div
                key={persona.id}
                onClick={() => {
                  if (!openRouterApiKey) {
                    showApiKeyModal();
                    return;
                  }
                  handleNavigation(() => { setActiveProfileFeature(null); startNewChat(persona); })
                }}
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
          <h3 className="text-[13px] text-[#54656f] font-medium">Model Terpopuler</h3>
        </div>

        {isLoadingModels ? (
          <div className="px-4 py-3 text-sm text-[#54656f] text-center flex items-center justify-center gap-2">
            <CircleDashed size={18} className="animate-spin text-[#00a884]" />
            Memuat model...
          </div>
        ) : (
          openRouterModels.map((model, idx) => {
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
                key={`${model.slug}-${idx}`}
                onClick={() => {
                  if (!openRouterApiKey) {
                    showApiKeyModal();
                    return;
                  }
                  handleNavigation(() => {
                    setActiveProfileFeature(null); startNewChat({
                      id: model.slug,
                      name: model.name,
                      avatar: iconUrl || getModelAvatar(model.name),
                      welcomeMessage: `Halo! Saya adalah ${model.name}. Ada yang bisa saya bantu?`
                    });
                  })
                }}
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
  );
}
