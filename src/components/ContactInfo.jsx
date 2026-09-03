import { useState, useEffect } from 'react';
import { X, Search, ChevronRight, Bell, Clock, Ban, ThumbsDown, Trash2, Bot } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { AI_PERSONAS } from '../data/personas';

export default function ContactInfo() {
  const { setShowContactInfo, sessions, activeSessionId, deleteSession, customPersonas } = useChat();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modelDescription, setModelDescription] = useState('');
  const [modelIconUrl, setModelIconUrl] = useState(null);
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  useEffect(() => {
    if (!activeSession?.personaId) return;

    const isModel = activeSession.personaId.includes('/');
    let targetModelId = activeSession.personaId;

    if (!isModel) {
      // It's a persona (custom or predefined)
      const persona = customPersonas.find(p => p.id === activeSession.personaId) || AI_PERSONAS.find(p => p.id === activeSession.personaId);
      if (persona) {
        setModelDescription(persona.systemPrompt || 'Tidak ada prompt khusus.');
        targetModelId = persona.baseModel; // Gunakan base model untuk fetch icon
      } else {
        setModelDescription('Tidak ada deskripsi tersedia.');
        targetModelId = null;
      }
    }

    if (!targetModelId) {
      setModelIconUrl(null);
      return;
    }

    const fetchDescription = async () => {
      setIsLoadingDescription(true);
      try {
        const res = await fetch(`https://openrouter.ai/api/frontend/v1/models/find?q=${encodeURIComponent(targetModelId)}`);
        const data = await res.json();
        const modelData = data?.data?.models?.[0];
        
        if (modelData) {
          // Hanya timpa deskripsi jika ini BUKAN persona khusus (artinya ini model murni)
          if (isModel) {
            setModelDescription(modelData.description || 'Tidak ada deskripsi tersedia.');
          }

          const modelName = modelData.name.toLowerCase();
          let iconUrl = null;
          
          if (modelName.includes('gemini')) iconUrl = 'https://openrouter.ai/images/icons/GoogleGemini.svg';
          else if (modelName.includes('deepseek')) iconUrl = 'https://openrouter.ai/images/icons/DeepSeek.png';
          else if (modelName.includes('openai')) iconUrl = 'https://openrouter.ai/images/icons/OpenAI.svg';
          else if (modelName.includes('z.ai')) iconUrl = 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://z.ai/&size=256';
          else if (modelName.includes('xiaomi')) iconUrl = 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.mi.com&size=256';
          else if (modelName.includes('tencent')) iconUrl = 'https://openrouter.ai/images/icons/Tencent.png';
          else if (modelName.includes('minimax')) iconUrl = 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://minimaxi.com/&size=256';
          else if (modelName.includes('qwen')) iconUrl = 'https://openrouter.ai/images/icons/Qwen.png';
          else if (modelData.endpoint?.provider_info?.icon?.url) {
            iconUrl = modelData.endpoint.provider_info.icon.url.startsWith('/') 
              ? `https://openrouter.ai${modelData.endpoint.provider_info.icon.url}` 
              : modelData.endpoint.provider_info.icon.url;
          }
          setModelIconUrl(iconUrl);
        } else {
          setModelDescription('Tidak ada deskripsi tersedia.');
          setModelIconUrl(null);
        }
      } catch (err) {
        console.error('Failed to fetch description:', err);
        setModelDescription('Gagal memuat deskripsi.');
      } finally {
        setIsLoadingDescription(false);
      }
    };

    fetchDescription();
  }, [activeSession?.personaId, customPersonas]);

  if (!activeSession) return null;

  const handleDelete = () => {
    deleteSession(null, activeSessionId);
    setShowContactInfo(false);
  };

  return (
    <div className="absolute md:relative right-0 top-0 h-full w-full md:w-[400px] bg-white shadow-xl md:shadow-none z-30 md:z-auto flex flex-col animate-slide-in-right border-l border-[#e9edef] shrink-0">
      {/* Header */}
      <div className="h-16 px-4 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center gap-6 shrink-0 text-[#54656f]">
        <button onClick={() => setShowContactInfo(false)} className="hover:text-[#111b21] transition-colors p-1 rounded-full">
          <X size={20} />
        </button>
        <span className="text-base font-medium text-[#111b21]">Info kontak</span>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#f0f2f5] scrollbar-thin">
        {/* Profile Info */}
        <div className="bg-white px-4 py-8 flex flex-col items-center shadow-sm">
          <img
            src={activeSession.avatar}
            alt={activeSession.name}
            className="w-48 h-48 rounded-full object-cover mb-4"
          />
          <h2 className="text-2xl font-normal text-[#111b21]">{activeSession.name}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="relative shrink-0 w-4 h-4 flex items-center justify-center rounded-[3px] bg-[#f0f2f5] overflow-hidden">
              {modelIconUrl ? (
                <img
                  src={modelIconUrl}
                  alt="model icon"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Bot size={12} className="text-[#54656f]" />
              )}
            </div>
            <p className="text-sm text-[#54656f]">
              {
                activeSession.personaId.includes('/') 
                  ? activeSession.personaId 
                  : ((customPersonas.find(p => p.id === activeSession.personaId) || AI_PERSONAS.find(p => p.id === activeSession.personaId))?.baseModel || activeSession.personaId)
              }
            </p>
          </div>
        </div>

        {/* Tentang */}
        <div className="bg-white px-6 py-4 mt-2 shadow-sm">
          <p className="text-sm text-[#54656f] mb-1">Tentang</p>
          <p className="text-sm text-[#111b21]">
            {isLoadingDescription ? 'Memuat deskripsi...' : (modelDescription || 'Tidak ada deskripsi.')}
          </p>
        </div>

        {/* Media, tautan, dan dok */}
        <div className="bg-white mt-2 shadow-sm cursor-pointer hover:bg-[#f5f6f6] transition-colors">
          <div className="px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-[#111b21]">Media, tautan, dan dok</span>
            <div className="flex items-center gap-2 text-[#54656f]">
              <span className="text-xs">46</span>
              <ChevronRight size={16} />
            </div>
          </div>
          <div className="px-6 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
            <div className="w-20 h-20 bg-gray-200 rounded shrink-0 flex items-center justify-center text-xs text-gray-500 overflow-hidden">
              <img src="https://bewhy.id/wp-content/uploads/asset_6a97be88da3ea3.32901038.jpeg" className="w-full h-full object-cover" alt="Media 1" />
            </div>
            <div className="w-20 h-20 bg-gray-200 rounded shrink-0 flex items-center justify-center text-xs text-gray-500 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Media 2" />
            </div>
            <div className="w-20 h-20 bg-[#f0f2f5] rounded shrink-0 flex items-center justify-center text-xs text-gray-500">
              +
            </div>
            <div className="w-20 h-20 bg-[#f0f2f5] rounded shrink-0 flex items-center justify-center text-xs text-gray-500">
              +
            </div>
          </div>
        </div>

        {/* Actions List */}
        <div className="bg-white mt-2 shadow-sm flex flex-col">
          <button className="px-6 py-4 flex items-center gap-4 hover:bg-[#f5f6f6] transition-colors text-left">
            <span className="text-sm text-[#111b21] flex-1">Pesan berbintang</span>
            <ChevronRight size={16} className="text-[#54656f]" />
          </button>

          <div className="px-6 py-4 flex items-center justify-between border-t border-[#f0f2f5]">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#111b21]">Bisukan notifikasi</span>
            </div>
            <div className="w-9 h-5 bg-[#e9edef] rounded-full relative shadow-inner cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
            </div>
          </div>

          <button className="px-6 py-4 flex items-center justify-between border-t border-[#f0f2f5] hover:bg-[#f5f6f6] transition-colors text-left">
            <div>
              <span className="text-sm text-[#111b21] block">Pesan sementara</span>
              <span className="text-xs text-[#54656f]">Mati</span>
            </div>
            <ChevronRight size={16} className="text-[#54656f]" />
          </button>
        </div>

        {/* Danger Actions */}
        <div className="bg-white mt-2 shadow-sm flex flex-col mb-8">
          <button className="px-6 py-4 flex items-center gap-4 text-[#ea0038] hover:bg-[#f5f6f6] transition-colors text-left">
            <Ban size={20} />
            <span className="text-sm">Blokir {activeSession.name}</span>
          </button>
          <button className="px-6 py-4 flex items-center gap-4 text-[#ea0038] border-t border-[#f0f2f5] hover:bg-[#f5f6f6] transition-colors text-left">
            <ThumbsDown size={20} />
            <span className="text-sm">Laporkan {activeSession.name}</span>
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-4 flex items-center gap-4 text-[#ea0038] border-t border-[#f0f2f5] hover:bg-[#f5f6f6] transition-colors text-left"
          >
            <Trash2 size={20} />
            <span className="text-sm">Hapus chat</span>
          </button>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="bg-white rounded shadow-[0_17px_50px_0_rgba(11,20,26,.19),0_12px_15px_0_rgba(11,20,26,.24)] w-[90%] max-w-[400px] p-5 animate-fade-in text-[#3b4a54]">
            <div className="text-[15px] leading-relaxed mb-10">
              Hapus chat dengan "{activeSession.name}"?
            </div>
            <div className="flex justify-end gap-2 font-medium">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2.5 text-[#008069] border border-[#e9edef] rounded-full hover:bg-[#f5f6f6] transition-colors text-sm"
              >
                Batal
              </button>
              <button 
                onClick={handleDelete}
                className="px-6 py-2.5 bg-[#008069] text-white rounded-full hover:bg-[#06cf9c] transition-colors shadow-sm text-sm"
              >
                Hapus chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
