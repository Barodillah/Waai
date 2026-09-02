import { X, Search, ChevronRight, Bell, Clock, Ban, ThumbsDown, Trash2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function ContactInfo() {
  const { setShowContactInfo, sessions, activeSessionId } = useChat();

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  if (!activeSession) return null;

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
          <p className="text-sm text-[#54656f] mt-1">{activeSession.personaId}</p>
        </div>

        {/* Tentang */}
        <div className="bg-white px-6 py-4 mt-2 shadow-sm">
          <p className="text-sm text-[#54656f] mb-1">Tentang</p>
          <p className="text-sm text-[#111b21]">hectic</p>
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
          <button className="px-6 py-4 flex items-center gap-4 text-[#ea0038] border-t border-[#f0f2f5] hover:bg-[#f5f6f6] transition-colors text-left">
            <Trash2 size={20} />
            <span className="text-sm">Hapus chat</span>
          </button>
        </div>

      </div>
    </div>
  );
}
