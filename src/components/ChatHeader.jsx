import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { AI_PERSONAS } from '../data/personas';

export default function ChatHeader({ activeSession }) {
  const { setActiveSessionId, showToast, isTyping } = useChat();

  const activePersona = AI_PERSONAS.find(p => p.id === activeSession.personaId);
  const modelName = activePersona ? activePersona.name : 'Asisten AI Aktif';

  return (
    <div className="h-16 px-3 md:px-4 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          onClick={() => {
            setActiveSessionId(null);
            window.history.pushState(null, '', '/');
          }}
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
            {isTyping ? 'sedang mengetik balasan...' : `${modelName}`}
          </p>
        </div>
      </div>

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
          onClick={() => showToast(`Model: ${modelName}`)}
          className="p-2 hover:bg-[#e9edef] rounded-full transition-colors"
          title="Info Asisten"
        >
          <MoreVertical size={19} />
        </button>
      </div>
    </div>
  );
}
