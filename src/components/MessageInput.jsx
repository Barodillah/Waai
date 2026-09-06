import { useState, useRef } from 'react';
import { Smile, Paperclip, Send, Mic, Code2, Languages, PenTool, X } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function MessageInput({ activeSessionId }) {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const { sendMessage, typingSessionId, showToast, replyingTo, setReplyingTo, sessions, openRouterApiKey, showApiKeyModal } = useChat();
  const activeSession = sessions?.find(s => s.id === activeSessionId);
  const inputRef = useRef(null);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!openRouterApiKey) {
      showApiKeyModal();
      return;
    }
    const isTyping = typingSessionId === activeSessionId;
    if (!inputText.trim() || isTyping) return;
    sendMessage(activeSessionId, inputText, replyingTo);
    setInputText('');
    setReplyingTo(null);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  return (
    <>
      {showAttachMenu && (
        <div className="absolute bottom-20 left-4 md:left-8 p-3 rounded-2xl shadow-lg flex gap-4 border border-[#e9edef] bg-white z-20 animate-fade-in">
          <button
            onClick={() => {
              if (!openRouterApiKey) {
                showApiKeyModal();
                return;
              }
              setInputText('Bantu analisis kode ini: ');
              setShowAttachMenu(false);
              inputRef.current?.focus();
            }}
            className="flex flex-col items-center gap-1 text-xs text-[#54656f] hover:text-[#111b21]"
          >
            <div className="w-11 h-11 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-xs">
              <Code2 size={20} />
            </div>
            <span>Kode</span>
          </button>
          <button
            onClick={() => {
              if (!openRouterApiKey) {
                showApiKeyModal();
                return;
              }
              setInputText('Tolong terjemahkan teks berikut: ');
              setShowAttachMenu(false);
              inputRef.current?.focus();
            }}
            className="flex flex-col items-center gap-1 text-xs text-[#54656f] hover:text-[#111b21]"
          >
            <div className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs">
              <Languages size={20} />
            </div>
            <span>Bahasa</span>
          </button>
          <button
            onClick={() => {
              if (!openRouterApiKey) {
                showApiKeyModal();
                return;
              }
              setInputText('Buatkan copywriting menarik untuk: ');
              setShowAttachMenu(false);
              inputRef.current?.focus();
            }}
            className="flex flex-col items-center gap-1 text-xs text-[#54656f] hover:text-[#111b21]"
          >
            <div className="w-11 h-11 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <PenTool size={20} />
            </div>
            <span>Ide Konten</span>
          </button>
        </div>
      )}

      <div className="flex flex-col shrink-0 bg-[#f0f2f5] border-t border-[#e9edef]">
        {replyingTo && (
          <div className="px-2.5 pt-2.5 md:px-4 md:pt-3 flex justify-between items-start animate-fade-in">
            <div className="flex-1 bg-white/70 rounded-xl px-3 py-2 border-l-4 border-[#ea0038] shadow-[0_1px_2px_rgba(0,0,0,0.05)] relative overflow-hidden flex justify-between items-start">
              <div className="flex flex-col flex-1 min-w-0 pr-4">
                <span className="text-[13px] font-semibold text-[#ea0038] truncate">{replyingTo.sender === 'user' ? 'Anda' : (activeSession?.name || 'AI')}</span>
                <span className="text-[13px] text-[#54656f] truncate mt-0.5 max-h-[40px] whitespace-pre-wrap line-clamp-2 leading-snug">{replyingTo.text}</span>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-[#54656f] hover:text-[#111b21] p-1 absolute top-1.5 right-1.5 bg-white rounded-full hover:bg-[#e9edef]"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="p-2.5 md:px-4 md:py-3 flex items-center gap-2">

          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors"
          >
            <Paperclip size={22} />
          </button>

          <form onSubmit={handleSendMessage} className="flex-1 flex items-center">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Ketik pesan..."
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 84)}px`;
              }}
              onKeyDown={(e) => {
                const isMobile = window.innerWidth < 768;
                if (e.key === 'Enter') {
                  if (isMobile) return;
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }
              }}
              disabled={typingSessionId === activeSessionId}
              className="w-full px-4 py-2.5 rounded-lg text-sm border-none outline-none bg-white text-[#111b21] placeholder-[#54656f] shadow-xs resize-none overflow-y-auto scrollbar-thin block"
              style={{ minHeight: '40px' }}
            />
          </form>

          {inputText.trim() ? (
            <button
              onClick={handleSendMessage}
              disabled={typingSessionId === activeSessionId}
              className="p-2.5 bg-[#008069] hover:bg-[#00705c] text-white rounded-full transition-colors shadow-xs flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          ) : (
            <button
              onClick={() => showToast('Mendengarkan rekaman suara...')}
              className="p-2 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors"
            >
              <Mic size={22} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
