import { useState, useEffect } from 'react';
import { X, Search, ChevronRight, Bell, Clock, Ban, ThumbsDown, Trash2, Bot } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useUser } from '../context/UserContext';
import ModelSearchModal from './ModelSearchModal';
import ConfirmModal from './ConfirmModal';

export default function ContactInfo() {
  const { setShowContactInfo, sessions, activeSessionId, deleteSession, customPersonas, updateSessionPersonaId, startNewChat, setActiveProfileFeature, setActiveMobileTab, saveIncognitoSession } = useChat();
  const { user } = useUser();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
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
      const persona = customPersonas.find(p => p.id === activeSession.personaId);
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

  // Menghitung rata-rata waktu respon AI (dalam detik)
  const calculateAvgResponseTime = () => {
    if (!activeSession || !activeSession.messages || activeSession.messages.length < 2) return null;

    let totalResponseTimeMs = 0;
    let responseCount = 0;
    const messages = activeSession.messages;

    const extractTimestamp = (msg) => {
      if (!msg || !msg.time) return null;
      return new Date(msg.time).getTime();
    };

    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      if (msg.sender === 'user') {
        // Cari pesan AI pertama setelah pesan user ini
        let nextAiMsg = null;
        for (let j = i + 1; j < messages.length; j++) {
          if (messages[j].sender === 'ai') {
            nextAiMsg = messages[j];
            break;
          }
        }

        if (nextAiMsg) {
          const userTime = extractTimestamp(msg);
          const aiTime = extractTimestamp(nextAiMsg);
          if (userTime && aiTime && aiTime >= userTime) {
            totalResponseTimeMs += (aiTime - userTime);
            responseCount++;
          }
        }
      }
    }

    if (responseCount === 0) return null;
    const avgSec = totalResponseTimeMs / responseCount / 1000;
    return avgSec < 0.1 ? "< 0.1s" : avgSec.toFixed(1) + "s";
  };

  const avgResponseTime = calculateAvgResponseTime();

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
          {activeSession.isGroup && activeSession.members?.length >= 2 ? (
            <div className="relative w-48 h-48 mb-4 shrink-0">
              <img src={activeSession.members[1].avatar} className="absolute bottom-0 right-0 w-32 h-32 rounded-full object-cover border-4 border-white z-0 bg-white" />
              <img src={activeSession.members[0].avatar} className="absolute top-0 left-0 w-32 h-32 rounded-full object-cover border-4 border-white z-10 bg-white" />
            </div>
          ) : (
            <img
              src={activeSession.avatar}
              alt={activeSession.name}
              className="w-48 h-48 rounded-full object-cover mb-4"
            />
          )}
          <h2 className="text-2xl font-normal text-[#111b21] text-center px-4">{activeSession.name}</h2>

          {activeSession.isGroup ? (
            <div className="mt-1">
              <p className="text-sm text-[#54656f] font-medium">
                {(() => {
                  const personaCount = activeSession.members?.filter(m => m._type === 'persona' || m._type === 'custom' || m.member_type === 'persona').length || 0;
                  const modelCount = activeSession.members?.filter(m => m._type === 'model' || m.member_type === 'model' || (!m._type && m.id?.includes('/'))).length || 0;
                  const parts = ['1 User'];
                  if (personaCount > 0) parts.push(`${personaCount} Persona`);
                  if (modelCount > 0) parts.push(`${modelCount} Model`);
                  return parts.join(', ');
                })()}
              </p>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 mt-1 cursor-pointer hover:bg-[#f0f2f5] px-2 py-1 rounded-md transition-colors"
              onClick={() => setIsModelModalOpen(true)}
              title="Ubah Model"
            >
              <div className="relative shrink-0 w-4 h-4 flex items-center justify-center rounded-[3px] bg-white overflow-hidden">
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
              <p className="text-sm text-[#008069] hover:underline font-medium">
                {(() => {
                  const aiMember = activeSession.members?.find(m => m._type !== 'user' && m.member_type !== 'user');
                  if (aiMember) {
                    if (aiMember._type === 'persona') {
                      return aiMember.baseModel || 'google/gemini-2.5-flash-lite';
                    }
                    return aiMember.id; // For models
                  }
                  return activeSession.personaId;
                })()}
              </p>
            </div>
          )}
        </div>

        {/* Tentang */}
        <div className="bg-white px-6 py-4 mt-2 shadow-sm">
          <p className="text-sm text-[#54656f] mb-1">Tentang</p>
          <p className="text-sm text-[#111b21]">
            {isLoadingDescription ? 'Memuat deskripsi...' : (modelDescription || 'Tidak ada deskripsi.')}
          </p>
          <p className="text-sm text-[#54656f] mb-1 mt-3">Waktu Respon (Rata-rata)</p>
          <p className="text-sm text-[#111b21]">
            {avgResponseTime || 'Belum ada data'}
          </p>
        </div>

        {/* Media, tautan, dan dok */}
        {!activeSession.isIncognito && (
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
        )}

        {/* Actions List */}
        {!activeSession.isIncognito && (
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
        )}

        {/* Group Members List */}
        {activeSession.isGroup && (
          <div className="bg-white mt-2 shadow-sm flex flex-col">
            <div className="px-6 py-3 flex items-center justify-between text-[#54656f]">
              <span className="text-sm">{activeSession.members.length} anggota</span>
              <button className="p-1 hover:bg-[#f0f2f5] rounded-full transition-colors">
                <Search size={20} />
              </button>
            </div>

            <button className="px-6 py-3 flex items-center gap-4 hover:bg-[#f5f6f6] transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
              </div>
              <span className="text-[15px] text-[#111b21] flex-1">Tambah anggota</span>
            </button>

            <button className="px-6 py-3 flex items-center gap-4 hover:bg-[#f5f6f6] transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              </div>
              <span className="text-[15px] text-[#111b21] flex-1">Undang ke grup via tautan</span>
            </button>

            {/* Current User */}
            <div
              onClick={() => {
                setActiveProfileFeature('profile');
                setActiveMobileTab('profile');
                setShowContactInfo(false);
              }}
              className="px-6 py-3 flex items-center gap-4 hover:bg-[#f5f6f6] transition-colors cursor-pointer"
            >
              <img src={user?.avatar_url || "https://bewhy.id/wp-content/uploads/asset_6a97be88da3ea3.32901038.jpeg"} alt={user?.name || "Anda"} className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#e9edef]" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-[15px] text-[#111b21] truncate">{user?.name || "Anda"}</h3>
                  <span className="text-[11px] text-[#008069] bg-[#e7f7ec] px-1.5 py-0.5 rounded border border-[#008069]/20 font-medium tracking-wide">Admin Grup</span>
                </div>
                <p className="text-[13px] text-[#54656f] truncate">Online</p>
              </div>
            </div>

            {/* AI Members */}
            {activeSession.members.filter(m => m._type !== 'user' && m.member_type !== 'user').map((member, idx) => (
              <div
                key={idx}
                onClick={() => {
                  startNewChat(member);
                  setShowContactInfo(true);
                }}
                className="px-6 py-3 flex items-center gap-4 hover:bg-[#f5f6f6] transition-colors cursor-pointer"
              >
                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#f0f2f5] border border-[#e9edef]" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <h3 className="text-[15px] text-[#111b21] truncate flex-1">{member.name}</h3>
                    <span
                      className="text-[10px] text-[#54656f] bg-[#f0f2f5] px-1.5 py-0.5 rounded border border-[#e9edef] font-medium truncate max-w-[120px] shrink-0"
                      title={member._type === 'persona' || member._type === 'custom' || member.member_type === 'persona' ? (member.baseModel || 'google/gemini-2.5-flash-lite') : member.id}
                    >
                      {member._type === 'persona' || member._type === 'custom' || member.member_type === 'persona' ? (member.baseModel || 'google/gemini-2.5-flash-lite') : member.id}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#54656f] truncate">{member._type === 'model' ? 'Model AI' : 'Persona Kustom'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Danger Actions */}
        <div className="bg-white mt-2 shadow-sm flex flex-col mb-8">
          {activeSession.isIncognito ? (
            <button 
              onClick={() => {
                if (activeSession.messages.length <= 1) {
                  deleteSession(null, activeSession.id);
                  setShowContactInfo(false);
                } else {
                  setShowExitConfirm(true);
                }
              }}
              className="px-6 py-4 flex items-center gap-4 text-[#ea0038] hover:bg-[#f5f6f6] transition-colors text-left"
            >
              <X size={20} />
              <span className="text-sm">Tutup Pesan</span>
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        message={`Hapus chat dengan "${activeSession.name}"?`}
        confirmText="Hapus chat"
        cancelText="Batal"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <ModelSearchModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        onSelect={(model, iconUrl) => {
          updateSessionPersonaId(activeSessionId, model.slug || model.id);
          setIsModelModalOpen(false);
        }}
      />

      <ConfirmModal
        isOpen={showExitConfirm}
        title="Keluar dari Pertanyaan Cepat?"
        message="Sesi Pertanyaan Cepat tidak akan disimpan. Apakah Anda yakin ingin keluar?"
        onConfirm={() => {
          deleteSession(null, activeSession.id);
          setShowExitConfirm(false);
          setShowContactInfo(false);
        }}
        onCancel={() => setShowExitConfirm(false)}
        confirmText="Ya, Keluar"
        cancelText="Batal"
        extraAction={() => {
          setShowExitConfirm(false);
          setShowContactInfo(false);
          saveIncognitoSession(activeSession.id);
        }}
        extraText="Simpan Pesan"
        extraStyle="bg-[#008069] hover:bg-[#06cf9c] text-white"
      />
    </div>
  );
}
