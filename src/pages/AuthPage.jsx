import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ChevronDown, X, Search, Check } from 'lucide-react';

const LANGUAGES = [
  "Bahasa Indonesia",
  "English",
  "Español",
  "Français",
  "Deutsch",
  "Italiano",
  "Português",
  "Русский",
  "日本語",
  "한국어",
  "中文"
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('Bahasa Indonesia');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Redirect jika sudah login
    if (localStorage.getItem('waai_auth_token')) {
      navigate('/');
      return;
    }

    const showTimer = setTimeout(() => {
      setShowTooltip(true);
      // Sembunyikan kembali setelah 4 detik agar tidak mengganggu terus-terusan
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 4000);
      return () => clearTimeout(hideTimer);
    }, 1000);
    
    return () => clearTimeout(showTimer);
  }, []);

  const handleLogin = () => {
    // Redirect ke endpoint backend Laravel untuk memulai Google OAuth
    window.location.href = 'https://wai.bewhy.id/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans overflow-hidden">

      {/* Main Container - Responsive flex direction */}
      <div className="w-full max-w-4xl px-4 py-6 md:px-6 md:py-12 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-20 h-screen md:h-auto overflow-hidden">

        {/* Left Side (Desktop) / Top Side (Mobile) - Illustration */}
        <div className="w-full max-w-[240px] sm:max-w-xs md:max-w-md shrink-0 flex justify-center mt-2 md:mt-0">
          <img
            src="/auth-illustration.svg"
            alt="WhatsAI Onboarding"
            className="w-full h-auto object-contain max-h-[220px] sm:max-h-[280px] md:max-h-[500px]"
          />
        </div>

        {/* Right Side (Desktop) / Bottom Side (Mobile) - Content */}
        <div className="w-full max-w-sm flex flex-col items-center text-center">

          <h1 className="text-[22px] md:text-[28px] font-normal text-[#111b21] mb-2 md:mb-5 flex flex-col items-center justify-center gap-1">
            <span>Selamat datang di</span>
            <span 
              onClick={() => navigate('/explore')}
              className="relative group flex items-center cursor-pointer"
            >
              <span className="font-bold text-[#25d366] tracking-tight">
                WhatsAI
              </span>
              {/* WhatsApp style tooltip */}
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-3 py-1.5 bg-[#4b5563]/95 text-white text-[13px] font-normal rounded-md transition-all duration-500 whitespace-nowrap pointer-events-none z-50 shadow-sm leading-normal ${showTooltip ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'}`}>
                Explore WhatsAI
              </div>
            </span>
          </h1>

          <p className="text-[13px] md:text-[14px] text-[#54656f] mb-4 md:mb-8 leading-relaxed px-2">
            Silakan baca <a href="/privacy" className="text-[#027eb5] hover:underline cursor-pointer font-medium">Kebijakan Privasi</a> kami. Ketuk "Masuk dengan Google" untuk menerima <a href="/terms" className="text-[#027eb5] hover:underline cursor-pointer font-medium">Ketentuan Layanan</a> kami.
          </p>

          {/* Language Selector */}
          <button 
            onClick={() => setShowLanguageModal(true)}
            className="bg-[#f0f2f5] hover:bg-[#e9edef] transition-colors rounded-full px-5 py-2 md:py-2.5 flex items-center justify-between gap-3 text-[13px] md:text-[14px] text-[#111b21] mb-6 md:mb-12 min-w-[180px] md:min-w-[200px]"
          >
            <Globe size={18} className="text-[#54656f]" />
            <span className="flex-1 text-center font-medium">{language}</span>
            <ChevronDown size={18} className="text-[#54656f]" />
          </button>

          {/* Login Button - Standard Google style */}
          <button
            onClick={handleLogin}
            className="w-full bg-[#dcf8c7] hover:bg-[#cbf1a8] text-[#111b21] py-2.5 md:py-3 px-6 rounded-full font-medium text-[14px] shadow-sm transition-colors flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Masuk dengan Google
          </button>

        </div>
      </div>

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:bg-black/40 animate-fade-in sm:p-4 text-left">
          <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:rounded-xl shadow-xl flex flex-col sm:max-w-[420px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 px-4 h-14 shrink-0 bg-[#f0f2f5] border-b border-[#e9edef]">
              <button
                onClick={() => setShowLanguageModal(false)}
                className="text-[#54656f] hover:text-[#111b21] p-1 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              <h1 className="text-base font-semibold text-[#111b21]">Pilih Bahasa</h1>
            </div>
            
            {/* Search */}
            <div className="p-2 border-b border-[#f0f2f5] shrink-0 bg-white">
              <div className="bg-[#f0f2f5] rounded-lg flex items-center px-3 py-1.5 transition-all">
                <Search size={18} className="text-[#54656f] min-w-[18px]" />
                <input
                  type="text"
                  placeholder="Cari bahasa..."
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  className="w-full bg-transparent border-none outline-none px-3 py-1 text-[14px] md:text-[15px] text-[#111b21] placeholder-[#54656f]"
                />
                {languageSearch && (
                  <button onClick={() => setLanguageSearch('')} className="text-[#54656f] hover:text-[#111b21]">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin bg-white">
              {LANGUAGES.filter(l => l.toLowerCase().includes(languageSearch.toLowerCase())).map((lang) => (
                <div
                  key={lang}
                  onClick={() => { setLanguage(lang); setShowLanguageModal(false); }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#f5f6f6] cursor-pointer"
                >
                  <span className="text-[15px] text-[#111b21]">{lang}</span>
                  {language === lang && <Check size={20} className="text-[#008069]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
