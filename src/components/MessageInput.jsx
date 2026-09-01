import { useState, useRef } from 'react';
import { Smile, Paperclip, Send, Mic, Code2, Languages, PenTool } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function MessageInput({ activeSessionId }) {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const { sendMessage, isTyping, showToast } = useChat();
  const inputRef = useRef(null);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;
    sendMessage(activeSessionId, inputText);
    setInputText('');
  };

  return (
    <>
      {showAttachMenu && (
        <div className="absolute bottom-20 left-4 md:left-8 p-3 rounded-2xl shadow-lg flex gap-4 border border-[#e9edef] bg-white z-20 animate-fade-in">
          <button
            onClick={() => {
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

      <div className="p-2.5 md:px-4 md:py-3 flex items-center gap-2 shrink-0 bg-[#f0f2f5] border-t border-[#e9edef]">
        <button
          type="button"
          onClick={() => setInputText((prev) => prev + ' 😊')}
          className="p-2 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors"
        >
          <Smile size={22} />
        </button>

        <button
          type="button"
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className="p-2 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors"
        >
          <Paperclip size={22} />
        </button>

        <form onSubmit={handleSendMessage} className="flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik pesan AI..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className="w-full px-4 py-2.5 rounded-lg text-sm border-none outline-none bg-white text-[#111b21] placeholder-[#54656f] shadow-xs"
          />
        </form>

        {inputText.trim() ? (
          <button
            onClick={handleSendMessage}
            disabled={isTyping}
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
    </>
  );
}
