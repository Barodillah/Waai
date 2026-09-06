import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Search, MoreVertical, Info, CheckSquare, Heart, RefreshCw, Save, Download, XCircle, Link2, UserPlus, MinusCircle, Trash2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';

export default function ChatHeader({ activeSession }) {
  const navigate = useNavigate();
  const { setActiveSessionId, deleteSession, showToast, typingSessionId, setShowContactInfo, showContactInfo, setShowSearchInfo, customPersonas, saveIncognitoSession } = useChat();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const dropdownRef = useRef(null);

  const persona = customPersonas?.find(p => p.id === activeSession.personaId);
  
  const getGroupSubtitle = () => {
    if (!activeSession.members || activeSession.members.length === 0) return 'Grup';
    const aiMembers = activeSession.members.filter(m => m._type !== 'user' && m.member_type !== 'user');
    const names = aiMembers.map(m => m.name.split(' ')[0]).join(', ');
    return names ? `Anda, ${names}` : 'Anda';
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!activeSession) return null;

  let subtitleText = '';
  if (activeSession.isIncognito) {
    subtitleText = 'Pesan akan hilang setelah obrolan ditutup';
  } else if (activeSession.isGroup) {
    const members = activeSession.members || [];
    const memberNames = members
      .filter(m => m._type !== 'user' && m.member_type !== 'user')
      .map(m => m.name.split(' ')[0]);
    subtitleText = memberNames.length > 0 ? `Anda, ${memberNames.join(', ')}` : 'Anda';
  } else {
    const persona = customPersonas?.find(p => p.id === activeSession.personaId);
    if (persona) {
       subtitleText = persona.description || 'Persona Kustom';
    } else {
       subtitleText = activeSession.personaId;
    }
  }

  const handleDropdownItemClick = (e, action) => {
    e.stopPropagation();
    setShowDropdown(false);
    action();
  };

  return (
    <div className="bg-[#f0f2f5] px-4 py-2 flex items-center justify-between border-b border-[#e9edef] h-[60px] shrink-0">
      <div className="flex items-center gap-3 w-full">
        <button 
          onClick={() => {
            if (activeSession.isIncognito) {
              if (activeSession.messages.length <= 1) {
                deleteSession(null, activeSession.id);
                navigate('/');
              } else {
                setShowExitConfirm(true);
              }
            } else {
              setActiveSessionId(null);
              navigate('/');
            }
          }}
          className="md:hidden text-[#54656f] hover:bg-black/5 p-1 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>

        <div 
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={() => {
            setShowContactInfo(!showContactInfo);
            setShowSearchInfo(false);
          }}
        >
          {activeSession.isGroup && activeSession.members?.length >= 2 ? (
            <div className="relative w-10 h-10 shrink-0">
              <img src={activeSession.members[1].avatar} className="absolute bottom-0 right-0 w-7 h-7 rounded-full object-cover border-2 border-[#f0f2f5] z-0 bg-white" />
              <img src={activeSession.members[0].avatar} className="absolute top-0 left-0 w-7 h-7 rounded-full object-cover border-2 border-[#f0f2f5] z-10 bg-white" />
            </div>
          ) : (
            <img 
              src={activeSession.avatar} 
              alt={activeSession.name} 
              className="w-10 h-10 rounded-full object-cover bg-white shrink-0"
            />
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate text-[#111b21]">{activeSession.name}</span>
            <span className={`text-xs truncate ${typingSessionId === activeSession.id ? 'text-[#008069] font-medium' : 'text-[#667781]'}`}>
              {typingSessionId === activeSession.id ? 'sedang mengetik balasan...' : subtitleText}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-3 text-[#54656f]">
        {activeSession.isIncognito && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowSaveConfirm(true); }}
            className="p-2 hover:bg-[#e9edef] rounded-full transition-colors"
            title="Simpan Pesan"
          >
            <Save size={19} />
          </button>
        )}
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
                  setActiveSessionId(null);
                  navigate('/');
                })}
                className="w-full px-4 py-2 text-left text-[14.5px] text-[#111b21] hover:bg-[#f5f6f6] flex items-center justify-between"
              >
                <span>Tutup obrolan</span>
              </button>
              <button 
                onClick={(e) => handleDropdownItemClick(e, () => {
                  setShowDeleteConfirm(true);
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
        extraAction={() => {
          setShowExitConfirm(false);
          saveIncognitoSession(activeSession.id);
        }}
        extraText="Simpan Pesan"
        extraStyle="bg-[#008069] hover:bg-[#06cf9c] text-white"
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Hapus Obrolan"
        message="Apakah Anda yakin ingin menghapus obrolan ini?"
        onConfirm={(e) => {
          deleteSession(e, activeSession.id);
          setShowDeleteConfirm(false);
          navigate('/');
        }}
        onCancel={(e) => {
          e?.stopPropagation();
          setShowDeleteConfirm(false);
        }}
        confirmText="Hapus"
        cancelText="Batal"
      />

      <ConfirmModal
        isOpen={showSaveConfirm}
        title="Simpan Pesan"
        message="Apakah Anda yakin ingin menyimpan percakapan Pertanyaan Cepat ini menjadi obrolan permanen?"
        onConfirm={(e) => {
          e?.stopPropagation();
          setShowSaveConfirm(false);
          saveIncognitoSession(activeSession.id);
        }}
        onCancel={(e) => {
          e?.stopPropagation();
          setShowSaveConfirm(false);
        }}
        confirmText="Ya, Simpan"
        cancelText="Batal"
        isDanger={false}
      />
    </div>
  );
}
