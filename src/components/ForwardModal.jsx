import React, { useState, useEffect } from 'react';
import { X, Search, Users, UserPlus, Zap, MessageSquare, Bot, CircleDashed } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';

export default function ForwardModal() {
  const {
    forwardMessage,
    setForwardMessage,
    customPersonas,
    startNewChat,
    startIncognitoChat,
    sendMessage,
    sessions,
    activeSessionId
  } = useChat();

  const [openRouterModels, setOpenRouterModels] = useState([]);
  const [defaultModels, setDefaultModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredPersonas = (customPersonas || []).filter(
    (p) =>
      p.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(modelSearchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!forwardMessage) return; // Only fetch if modal is open
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch('https://openrouter.ai/api/frontend/v1/models/find?active=true&order=most-popular&output_modalities=text');
        const data = await response.json();
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
  }, [forwardMessage]);

  useEffect(() => {
    const searchModels = async () => {
      if (modelSearchQuery.length >= 3) {
        setIsLoadingModels(true);
        try {
          const response = await fetch(`https://openrouter.ai/api/frontend/v1/models/find?active=true&output_modalities=text&q=${encodeURIComponent(modelSearchQuery)}`);
          const data = await response.json();
          setOpenRouterModels(data.data.models.slice(0, 20));
        } catch (error) {
          console.error('Failed to search OpenRouter models:', error);
        } finally {
          setIsLoadingModels(false);
        }
      } else if (modelSearchQuery.length === 0) {
        setOpenRouterModels(defaultModels);
      }
    };

    const timer = setTimeout(() => {
      if (forwardMessage) searchModels();
    }, 500);

    return () => clearTimeout(timer);
  }, [modelSearchQuery, defaultModels, forwardMessage]);

  if (!forwardMessage) return null;

  const handleForwardToSession = (sessionId) => {
    sendMessage(sessionId, forwardMessage.text);
    setForwardMessage(null);
    if (activeSessionId !== sessionId) {
      navigate(`/chat/${sessionId}`);
    }
  };

  const handleForwardToPersona = (persona) => {
    const newSessionId = startNewChat(persona);
    if (newSessionId) {
      sendMessage(newSessionId, forwardMessage.text);
    }
    setForwardMessage(null);
  };

  const handleForwardToIncognito = () => {
    const newSessionId = startIncognitoChat();
    if (newSessionId) {
      sendMessage(newSessionId, forwardMessage.text);
    }
    setForwardMessage(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:bg-black/40 animate-fade-in sm:p-4">
      <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:rounded-xl shadow-xl flex flex-col sm:max-w-[420px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 h-14 shrink-0 bg-[#f0f2f5] border-b border-[#e9edef]">
          <button
            onClick={() => setForwardMessage(null)}
            className="text-[#54656f] hover:text-[#111b21] p-1 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <h1 className="text-base font-semibold text-[#111b21]">Teruskan pesan ke</h1>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-[#f0f2f5] shrink-0 bg-white">
          <div className="bg-[#f0f2f5] rounded-lg flex items-center px-3 py-1.5 transition-all">
            <Search size={18} className="text-[#54656f] min-w-[18px]" />
            <input
              type="text"
              placeholder="Cari model atau persona..."
              value={modelSearchQuery}
              onChange={(e) => setModelSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none px-3 py-1 text-[14px] md:text-[15px] text-[#111b21] placeholder-[#54656f]"
            />
            {modelSearchQuery && (
              <button onClick={() => setModelSearchQuery('')} className="text-[#54656f] hover:text-[#111b21]">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin bg-white">

          {/* Chat Terbaru */}
          {sessions && sessions.filter(s => s.id !== activeSessionId).length > 0 && !modelSearchQuery && (
            <>
              <div className="px-4 py-2 bg-white">
                <h3 className="text-[13px] text-[#54656f] font-medium">Chat terbaru</h3>
              </div>
              {sessions.filter(s => s.id !== activeSessionId).map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleForwardToSession(session.id)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-[#f5f6f6] cursor-pointer group"
                >
                  <img
                    src={session.avatar}
                    alt={session.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="text-[15px] font-normal text-[#111b21] truncate">
                      {session.name}
                    </h3>
                  </div>
                </div>
              ))}
              <div className="h-2 border-b border-[#f0f2f5]"></div>
            </>
          )}

          {/* Action list */}
          {!modelSearchQuery && (
            <div className="py-2">
              <div
                className="flex items-center gap-4 px-4 py-3 hover:bg-[#f5f6f6] cursor-pointer"
                onClick={handleForwardToIncognito}
              >
                <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center shrink-0">
                  <Zap size={20} />
                </div>
                <span className="text-sm font-medium text-[#111b21]">Pertanyaan Cepat</span>
              </div>
            </div>
          )}

          {/* Persona Tersimpan */}
          {filteredPersonas && filteredPersonas.length > 0 && (
            <>
              <div className="px-4 py-2 mt-2 border-t border-[#f0f2f5]">
                <h3 className="text-[13px] text-[#54656f] font-medium">Persona Tersimpan</h3>
              </div>
              {filteredPersonas.map((persona) => (
                <div
                  key={persona.id}
                  onClick={() => handleForwardToPersona(persona)}
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
                      <p className="text-[13px] md:text-[14px] text-[#54656f] truncate">
                        {persona.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Model Populer */}
          <div className="px-4 py-2 mt-2 border-t border-[#f0f2f5]">
            <h3 className="text-[13px] text-[#54656f] font-medium">
              {modelSearchQuery ? 'Hasil Pencarian' : 'Model Terpopuler'}
            </h3>
          </div>

          {isLoadingModels ? (
            <div className="px-4 py-3 text-sm text-[#54656f] text-center flex items-center justify-center gap-2">
              <CircleDashed size={18} className="animate-spin text-[#00a884]" />
              Memuat model...
            </div>
          ) : openRouterModels.length > 0 ? (
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
                  key={model.slug || model.id}
                  onClick={() => handleForwardToPersona({
                    id: model.slug || model.id,
                    name: model.name,
                    avatar: iconUrl || `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(model.name)}`,
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
                    <p className="text-[11px] text-[#54656f] truncate">{model.slug || model.id}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-[#54656f] text-[13px]">
              Tidak ada model ditemukan
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
