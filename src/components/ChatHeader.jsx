import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Search, MoreVertical, Info, CheckSquare, Heart, RefreshCw, Download, XCircle, Link2, UserPlus, MinusCircle, Trash2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { AI_PERSONAS } from '../data/personas';
import { useNavigate } from 'react-router-dom';

export default function ChatHeader({ activeSession }) {
  const navigate = useNavigate();
  const { setActiveSessionId, showToast, isTyping, setShowContactInfo, showContactInfo, setShowSearchInfo, customPersonas } = useChat();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const persona = customPersonas?.find(p => p.id === activeSession.personaId) || AI_PERSONAS.find(p => p.id === activeSession.personaId);
  const subtitleText = persona ? (persona.description || 'Persona Kustom') : activeSession.personaId;

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
            setActiveSessionId(null);
            navigate('/');
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
            onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
            className={`p-2 rounded-full transition-colors ${showDropdown ? 'bg-[#d9dbdf]' : 'hover:bg-[#e9edef]'}`}
            title="Menu"
          >
            <MoreVertical size={19} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-[220px] bg-white rounded-md shadow-[0_2px_5px_0_rgba(11,20,26,.26),0_2px_10px_0_rgba(11,20,26,.16)] py-2 z-50 animate-fade-in text-[14.5px] text-[#3b4a54] font-normal cursor-default" onClick={e => e.stopPropagation()}>
              <ul className="flex flex-col">
                <li className="px-5 py-[10px] hover:bg-[#f5f6f6] cursor-pointer flex items-center gap-3" onClick={(e) => handleDropdownItemClick(e, () => setShowContactInfo(true))}><Info size={18} className="text-[#54656f]" /> Info kontak</li>
                <li className="px-5 py-[10px] hover:bg-[#f5f6f6] cursor-pointer flex items-center gap-3" onClick={(e) => handleDropdownItemClick(e, () => setShowSearchInfo(true))}><Search size={18} className="text-[#54656f]" /> Cari</li>
                <li className="px-5 py-[10px] hover:bg-[#f5f6f6] cursor-pointer flex items-center gap-3" onClick={(e) => handleDropdownItemClick(e, () => showToast('Fitur pilih pesan segera hadir'))}><CheckSquare size={18} className="text-[#54656f]" /> Pilih pesan</li>
                <li className="px-5 py-[10px] hover:bg-[#f5f6f6] cursor-pointer flex items-center gap-3" onClick={(e) => handleDropdownItemClick(e, () => showToast('Fitur tambah ke favorit segera hadir'))}><Heart size={18} className="text-[#54656f]" /> Tambah ke favorit</li>
                <li className="px-5 py-[10px] hover:bg-[#f5f6f6] cursor-pointer flex items-center gap-3" onClick={(e) => handleDropdownItemClick(e, () => showToast('Fitur ganti model segera hadir'))}><RefreshCw size={18} className="text-[#54656f]" /> Ganti model</li>
                <li className="px-5 py-[10px] hover:bg-[#f5f6f6] cursor-pointer flex items-center gap-3" onClick={(e) => handleDropdownItemClick(e, () => showToast('Fitur ekspor obrolan segera hadir'))}><Download size={18} className="text-[#54656f]" /> Ekspor obrolan</li>
                <li className="px-5 py-[10px] hover:bg-[#f5f6f6] cursor-pointer flex items-center gap-3" onClick={(e) => handleDropdownItemClick(e, () => { setActiveSessionId(null); navigate('/'); })}><XCircle size={18} className="text-[#54656f]" /> Tutup obrolan</li>
                
                <div className="border-b border-[#f0f2f5] my-1"></div>
                
                <li className="px-5 py-[10px] hover:bg-[#f5f6f6] cursor-pointer flex items-center gap-3" onClick={(e) => handleDropdownItemClick(e, () => showToast('Fitur kirim tautan obrolan segera hadir'))}><Link2 size={18} className="text-[#54656f]" /> Kirim tautan obrolan</li>
                <li className="px-5 py-[10px] hover:bg-[#f5f6f6] cursor-pointer flex items-center gap-3" onClick={(e) => handleDropdownItemClick(e, () => showToast('Fitur undang ke grup segera hadir'))}><UserPlus size={18} className="text-[#54656f]" /> Undang ke grup</li>
                
                <div className="border-b border-[#f0f2f5] my-1"></div>
                
                <li className="px-5 py-[10px] hover:bg-[#f5f6f6] cursor-pointer flex items-center gap-3" onClick={(e) => handleDropdownItemClick(e, () => showToast('Fitur bersihkan obrolan segera hadir'))}><MinusCircle size={18} className="text-[#54656f]" /> Bersihkan obrolan</li>
                <li className="px-5 py-[10px] hover:bg-[#f5f6f6] cursor-pointer flex items-center gap-3" onClick={(e) => handleDropdownItemClick(e, () => showToast('Silakan gunakan Hapus chat di Info Kontak'))}><Trash2 size={18} className="text-[#54656f]" /> Hapus obrolan</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
