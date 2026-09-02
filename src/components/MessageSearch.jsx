import { X, CalendarSearch, CheckCheck, Search } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useState } from 'react';

export default function MessageSearch() {
  const { setShowSearchInfo, sessions, activeSessionId } = useChat();
  const [keyword, setKeyword] = useState('');

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  if (!activeSession) return null;

  const handleSearch = (e) => {
    setKeyword(e.target.value);
  };

  const results = keyword.trim().length > 0 
    ? activeSession.messages.filter(m => m.text.toLowerCase().includes(keyword.toLowerCase()))
    : [];

  const scrollToMessage = (id) => {
    const el = document.getElementById(`msg-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Temporary highlight
      el.style.transition = 'background-color 0.3s';
      el.style.backgroundColor = '#dcf8c6';
      setTimeout(() => {
        el.style.backgroundColor = 'transparent';
      }, 1500);
      
      // On mobile, close search panel automatically
      if (window.innerWidth < 768) {
        setShowSearchInfo(false);
      }
    }
  };

  const renderHighlightedText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="text-[#00a884] font-semibold">{part}</span>
      ) : part
    );
  };

  return (
    <div className="absolute md:relative right-0 top-0 h-full w-full md:w-[400px] bg-white shadow-xl md:shadow-none z-30 md:z-auto flex flex-col animate-slide-in-right border-l border-[#e9edef] shrink-0">
      {/* Header */}
      <div className="h-16 px-4 bg-white border-b border-[#e9edef] flex items-center gap-6 shrink-0 text-[#54656f]">
        <button onClick={() => setShowSearchInfo(false)} className="hover:text-[#111b21] transition-colors p-1 rounded-full text-[#111b21]">
          <X size={20} />
        </button>
        <span className="text-base font-medium text-[#111b21]">Cari Pesan</span>
      </div>

      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Search Input Area */}
        <div className="p-3 bg-white border-b border-[#f0f2f5] flex items-center gap-3">
          <button className="text-[#54656f] hover:text-[#111b21] transition-colors p-1">
            <CalendarSearch size={22} />
          </button>
          <div className="flex-1 relative flex items-center">
            <div className="absolute left-3 text-[#54656f]">
               <Search size={16} />
            </div>
            <input 
              type="text"
              value={keyword}
              onChange={handleSearch}
              placeholder=""
              className="w-full bg-white border border-[#00a884] rounded-full py-1.5 pl-10 pr-10 text-sm text-[#111b21] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              autoFocus
            />
            {keyword && (
              <button 
                onClick={() => setKeyword('')}
                className="absolute right-3 text-[#54656f] hover:text-[#111b21]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {keyword.trim().length === 0 ? (
            <div className="p-6 text-center text-sm text-[#54656f]">
              Cari pesan dalam obrolan ini.
            </div>
          ) : results.length > 0 ? (
            results.map((msg) => (
              <div 
                key={msg.id} 
                onClick={() => scrollToMessage(msg.id)}
                className="p-4 hover:bg-[#f5f6f6] cursor-pointer border-b border-[#f0f2f5] transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-[#54656f]">{msg.time}</span>
                </div>
                <div className="flex items-start gap-1">
                  {msg.sender === 'user' && (
                    <CheckCheck size={14} className="text-[#53bdeb] mt-0.5 shrink-0" />
                  )}
                  <p className="text-sm text-[#54656f] line-clamp-3 leading-snug break-words flex-1">
                    {renderHighlightedText(msg.text, keyword)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-[#54656f]">
              Tidak ditemukan pesan untuk "{keyword}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
