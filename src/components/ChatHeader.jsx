import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Search, MoreVertical, Info, CheckSquare, Heart, RefreshCw, Download, XCircle, Link2, UserPlus, MinusCircle, Trash2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';

export default function ChatHeader({ activeSession }) {
  const navigate = useNavigate();
  const { setActiveSessionId, deleteSession, showToast, isTyping, setShowContactInfo, showContactInfo, setShowSearchInfo, customPersonas } = useChat();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const dropdownRef = useRef(null);

  const persona = customPersonas?.find(p => p.id === activeSession.personaId);
  
  const getGroupSubtitle = () => {
    if (!activeSession.members || activeSession.members.length === 0) return 'Grup';
    const names = activeSession.members.map(m => m.name.split(' ')[0]).join(', ');
    return `${names}, Anda`;
  };

  const subtitleText = activeSession.isGroup 
    ? getGroupSubtitle()
    : (persona ? (persona.description || 'Persona Kustom') : activeSession.personaId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownItemClick = (e, action) => {
    e.stopPropagation();
    setShowDropdown(false);
    action();
  };

  return (
    <div className="h-16 px-3 md:px-4 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between shrink-0 z-10 cursor-pointer" onClick={() => setShowContactInfo(!showContactInfo)}>
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (activeSession.isIncognito) {
              setShowExitConfirm(true);
            } else {
              setActiveSessionId(null);
              navigate('/');
            }
          }}
          className="md:hidden p-1.5 -ml-1 text-[#54656f] hover:text-[#111b21] rounded-full"
        >
          <ArrowLeft size={20} />
        </button>

        {activeSession.isGroup && activeSession.members?.length >= 2 ? (
          <div className="relative w-10 h-10 shrink-0">
            <img src={activeSession.members[1].avatar} className="absolute bottom-0 right-0 w-7 h-7 rounded-full object-cover border-2 border-[#f0f2f5] z-0 bg-white" />
            <img src={activeSession.members[0].avatar} className="absolute top-0 left-0 w-7 h-7 rounded-full object-cover border-2 border-[#f0f2f5] z-10 bg-white" />
          </div>
        ) : (
          <img
            src={activeSession.avatar}
            alt={activeSession.name}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-[#00a884] shrink-0"
          />
        )}

        <div className="min-w-0">
          <h2 className="text-sm font-semibold truncate leading-tight text-[#111b21]">
            {activeSession.name}
          </h2>
          <p className="text-[11px] text-[#008069] font-medium truncate">
            {isTyping ? 'sedang mengetik balasan...' : subtitleText}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-3 text-[#54656f]">
        <button
          onClick={(e) => { e.stopPropagation(); showToast('Fitur panggilan suara AI segera hadir'); }}
          className="p-2 hover:bg-[#e9edef] rounded-full transition-colors"
          title="Panggilan Suara"
        >
          <Phone size={19} />
        </button>
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            setShowSearchInfo(true);
            setShowContactInfo(false);
          }}
          className="p-2 hover:bg-[#e9edef] rounded-full transition-colors"
          title="Cari Pesan"
        >
          <Search size={19} />
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="p-2 hover:bg-[#e9edef] rounded-full transition-colors"
          >
            <MoreVertical size={19} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-[0_2px_15px_-3px_rgba(0,0,0,0.15)] py-2 z-50 animate-fade-in origin-top-right">
              <button 
                onClick={(e) => handleDropdownItemClick(e, () => setShowContactInfo(true))}
                className="w-full px-4 py-2 text-left text-[14.5px] text-[#111b21] hover:bg-[#f5f6f6] flex items-center justify-between"
              >
                <span>Info kontak</span>
              </button>
              <button 
                onClick={(e) => handleDropdownItemClick(e, () => {
                  deleteSession(e, activeSession.id);
                  navigate('/');
                })}
                className="w-full px-4 py-2 text-left text-[14.5px] text-[#ea0038] hover:bg-[#f5f6f6] flex items-center justify-between"
              >
                <span>Hapus obrolan</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showExitConfirm}
        title="Keluar dari Pertanyaan Cepat?"
        message="Sesi Pertanyaan Cepat tidak akan disimpan. Apakah Anda yakin ingin keluar?"
        onConfirm={() => {
          deleteSession(null, activeSession.id);
          setShowExitConfirm(false);
        }}
        onCancel={(e) => {
          e?.stopPropagation();
          setShowExitConfirm(false);
        }}
        confirmText="Ya, Keluar"
        cancelText="Batal"
      />
    </div>
  );
}
