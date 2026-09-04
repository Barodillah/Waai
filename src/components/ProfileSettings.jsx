import {
  Star,
  Key,
  Lock,
  Palette,
  Bell,
  User,
  HelpCircle,
  ChevronRight,
  Bot,
  Wand2,
  LogOut,
  Archive,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useChat } from '../context/ChatContext';

export default function ProfileSettings() {
  const { setActiveMobileTab, setActiveProfileFeature, userName, saveUserName } = useChat();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const handleApiKeyClick = () => {
    if (window.innerWidth < 768) {
      setActiveMobileTab('apikey');
    } else {
      setActiveProfileFeature('apikey');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] md:bg-white overflow-hidden">

      {/* --- DESKTOP HEADER (REMOVED) --- */}

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-[68px] md:pb-0">
        {/* PROFILE HEADER (Mobile & Desktop) */}
        <div className="flex flex-col items-center pt-8 pb-4 md:py-8 bg-[#f0f2f5] md:bg-white relative">

          {/* Flag bubble (REMOVED) */}

          {/* Avatar */}
          <div className="relative mt-2">
            <img
              src="https://bewhy.id/wp-content/uploads/asset_6a97be88da3ea3.32901038.jpeg"
              alt="Profil"
              className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-sm"
            />
          </div>

          {/* Name & Username */}
          <div className="mt-4 flex items-center justify-center">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="text-2xl font-normal text-[#111b21] bg-transparent border-b border-[#00a884] focus:outline-none w-40 text-center"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveUserName(tempName);
                      setIsEditingName(false);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    saveUserName(tempName);
                    setIsEditingName(false);
                  }}
                  className="p-1 text-[#00a884] hover:bg-gray-100 rounded-full"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="p-1 text-[#54656f] hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <h2 className="text-2xl font-normal text-[#111b21] flex items-center gap-2 group cursor-pointer"
                  onClick={() => {
                    setTempName(userName);
                    setIsEditingName(true);
                  }}>
                {userName}
                <Pencil size={18} className="text-[#54656f] opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
            )}
          </div>
          <p className="text-[#54656f] mt-1">jerukbalimu@email.com</p>
        </div>

        {/* --- MOBILE MENUS (Cards) --- */}
        <div className="md:hidden px-4 pb-6 flex flex-col gap-4">

          {/* Kelompok 1: Pengaturan AI */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#e9edef]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f2f5] active:bg-gray-50 cursor-pointer hover:bg-[#f5f6f6]">
              <div className="flex items-center gap-4">
                <Bot size={22} className="text-[#54656f]" />
                <div className="flex flex-col">
                  <span className="text-[15px] text-[#111b21]">Model AI Default</span>
                  <span className="text-[12px] text-[#54656f]">Gemini, ChatGPT, Claude</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#8696a0]" />
            </div>
            <div 
              onClick={handleApiKeyClick}
              className="flex items-center justify-between px-4 py-3 border-b border-[#f0f2f5] active:bg-gray-50 cursor-pointer hover:bg-[#f5f6f6]"
            >
              <div className="flex items-center gap-4">
                <Key size={22} className="text-[#54656f]" />
                <div className="flex flex-col">
                  <span className="text-[15px] text-[#111b21]">Kunci API</span>
                  <span className="text-[12px] text-[#54656f]">Atur API kustom</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#8696a0]" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 active:bg-gray-50 cursor-pointer hover:bg-[#f5f6f6]">
              <div className="flex items-center gap-4">
                <Wand2 size={22} className="text-[#54656f]" />
                <div className="flex flex-col">
                  <span className="text-[15px] text-[#111b21]">Personalisasi & Prompt</span>
                  <span className="text-[12px] text-[#54656f]">Gaya bahasa AI</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#8696a0]" />
            </div>
          </div>

          {/* Kelompok 2: Akun & Keuangan */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#e9edef]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f2f5] active:bg-gray-50 cursor-pointer hover:bg-[#f5f6f6]">
              <div className="flex items-center gap-4">
                <Star size={22} className="text-[#54656f]" />
                <div className="flex flex-col">
                  <span className="text-[15px] text-[#111b21]">Langganan</span>
                  <span className="text-[12px] text-[#54656f]">Upgrade ke WhatsAI Pro</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#8696a0]" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f2f5] active:bg-gray-50 cursor-pointer hover:bg-[#f5f6f6]">
              <div className="flex items-center gap-4">
                <User size={22} className="text-[#54656f]" />
                <div className="flex flex-col">
                  <span className="text-[15px] text-[#111b21]">Akun & Profil</span>
                  <span className="text-[12px] text-[#54656f]">Info profil, nomor</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#8696a0]" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 active:bg-gray-50 cursor-pointer hover:bg-[#f5f6f6]">
              <div className="flex items-center gap-4">
                <Lock size={22} className="text-[#54656f]" />
                <div className="flex flex-col">
                  <span className="text-[15px] text-[#111b21]">Privasi & Keamanan</span>
                  <span className="text-[12px] text-[#54656f]">Enkripsi chat, blokir</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#8696a0]" />
            </div>
          </div>

          {/* Kelompok 3: Preferensi */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#e9edef]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f2f5] active:bg-gray-50 cursor-pointer hover:bg-[#f5f6f6]">
              <div className="flex items-center gap-4">
                <Palette size={22} className="text-[#54656f]" />
                <div className="flex flex-col">
                  <span className="text-[15px] text-[#111b21]">Tampilan</span>
                  <span className="text-[12px] text-[#54656f]">Tema & wallpaper</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#8696a0]" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f2f5] active:bg-gray-50 cursor-pointer hover:bg-[#f5f6f6]">
              <div className="flex items-center gap-4">
                <Bell size={22} className="text-[#54656f]" />
                <div className="flex flex-col">
                  <span className="text-[15px] text-[#111b21]">Pemberitahuan</span>
                  <span className="text-[12px] text-[#54656f]">Suara & notifikasi</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#8696a0]" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 active:bg-gray-50 cursor-pointer hover:bg-[#f5f6f6]">
              <div className="flex items-center gap-4">
                <Archive size={22} className="text-[#54656f]" />
                <div className="flex flex-col">
                  <span className="text-[15px] text-[#111b21]">Penyimpanan Data</span>
                  <span className="text-[12px] text-[#54656f]">Kelola riwayat chat</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#8696a0]" />
            </div>
          </div>

          {/* Kelompok 4: Tindakan */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#e9edef]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f2f5] active:bg-gray-50 cursor-pointer hover:bg-[#f5f6f6]">
              <div className="flex items-center gap-4">
                <HelpCircle size={22} className="text-[#54656f]" />
                <div className="flex flex-col">
                  <span className="text-[15px] text-[#111b21]">Bantuan & Masukan</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 active:bg-gray-50 cursor-pointer hover:bg-[#f5f6f6]">
              <div className="flex items-center gap-4">
                <LogOut size={22} className="text-red-500" />
                <div className="flex flex-col">
                  <span className="text-[15px] text-red-500">Keluar</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* --- DESKTOP MENUS (List) --- */}
        <div className="hidden md:flex flex-col bg-white">

          <div className="px-6 py-4">
            <h3 className="text-[#008069] text-[13px] font-medium">PENGATURAN AI</h3>
          </div>
          <div className="flex items-center gap-6 px-6 py-4 hover:bg-[#f5f6f6] cursor-pointer">
            <Bot size={24} className="text-[#54656f]" />
            <div className="flex flex-col">
              <span className="text-[17px] text-[#111b21]">Model AI Default</span>
              <span className="text-sm text-[#54656f]">Pilih model bahasa (Gemini, ChatGPT)</span>
            </div>
          </div>
          <div 
            onClick={handleApiKeyClick}
            className="flex items-center gap-6 px-6 py-4 hover:bg-[#f5f6f6] cursor-pointer"
          >
            <Key size={24} className="text-[#54656f]" />
            <div className="flex flex-col">
              <span className="text-[17px] text-[#111b21]">Kunci API</span>
              <span className="text-sm text-[#54656f]">Atur kunci API kustom Anda</span>
            </div>
          </div>
          <div className="flex items-center gap-6 px-6 py-4 hover:bg-[#f5f6f6] cursor-pointer">
            <Wand2 size={24} className="text-[#54656f]" />
            <div className="flex flex-col">
              <span className="text-[17px] text-[#111b21]">Personalisasi & Prompt</span>
              <span className="text-sm text-[#54656f]">Atur gaya bahasa instruksi AI</span>
            </div>
          </div>

          <div className="h-2 bg-[#f0f2f5] w-full mt-2"></div>

          <div className="px-6 py-4">
            <h3 className="text-[#008069] text-[13px] font-medium">AKUN & KEUANGAN</h3>
          </div>
          <div className="flex items-center gap-6 px-6 py-4 hover:bg-[#f5f6f6] cursor-pointer">
            <Star size={24} className="text-[#54656f]" />
            <div className="flex flex-col">
              <span className="text-[17px] text-[#111b21]">Langganan</span>
              <span className="text-sm text-[#54656f]">Tingkatkan ke WhatsAI Pro</span>
            </div>
          </div>
          <div className="flex items-center gap-6 px-6 py-4 hover:bg-[#f5f6f6] cursor-pointer">
            <User size={24} className="text-[#54656f]" />
            <div className="flex flex-col">
              <span className="text-[17px] text-[#111b21]">Akun & Profil</span>
              <span className="text-sm text-[#54656f]">Nama, foto profil, email</span>
            </div>
          </div>
          <div className="flex items-center gap-6 px-6 py-4 hover:bg-[#f5f6f6] cursor-pointer">
            <Lock size={24} className="text-[#54656f]" />
            <div className="flex flex-col">
              <span className="text-[17px] text-[#111b21]">Privasi & Keamanan</span>
              <span className="text-sm text-[#54656f]">Enkripsi chat, pesan sementara</span>
            </div>
          </div>

          <div className="h-2 bg-[#f0f2f5] w-full mt-2"></div>

          <div className="px-6 py-4">
            <h3 className="text-[#008069] text-[13px] font-medium">PREFERENSI</h3>
          </div>
          <div className="flex items-center gap-6 px-6 py-4 hover:bg-[#f5f6f6] cursor-pointer">
            <Palette size={24} className="text-[#54656f]" />
            <div className="flex flex-col">
              <span className="text-[17px] text-[#111b21]">Tampilan</span>
              <span className="text-sm text-[#54656f]">Tema gelap/terang, wallpaper</span>
            </div>
          </div>
          <div className="flex items-center gap-6 px-6 py-4 hover:bg-[#f5f6f6] cursor-pointer">
            <Bell size={24} className="text-[#54656f]" />
            <div className="flex flex-col">
              <span className="text-[17px] text-[#111b21]">Pemberitahuan</span>
              <span className="text-sm text-[#54656f]">Pesan, sistem, suara</span>
            </div>
          </div>
          <div className="flex items-center gap-6 px-6 py-4 hover:bg-[#f5f6f6] cursor-pointer">
            <Archive size={24} className="text-[#54656f]" />
            <div className="flex flex-col">
              <span className="text-[17px] text-[#111b21]">Penyimpanan Data</span>
              <span className="text-sm text-[#54656f]">Kelola & ekspor riwayat percakapan</span>
            </div>
          </div>

          <div className="h-2 bg-[#f0f2f5] w-full mt-2"></div>

          <div className="flex items-center gap-6 px-6 py-4 hover:bg-[#f5f6f6] cursor-pointer mt-2">
            <HelpCircle size={24} className="text-[#54656f]" />
            <div className="flex flex-col">
              <span className="text-[17px] text-[#111b21]">Bantuan & Masukan</span>
              <span className="text-sm text-[#54656f]">Pusat bantuan, hubungi kami</span>
            </div>
          </div>
          <div className="flex items-center gap-6 px-6 py-4 hover:bg-[#f5f6f6] cursor-pointer">
            <LogOut size={24} className="text-red-500" />
            <div className="flex flex-col">
              <span className="text-[17px] text-red-500">Keluar</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
