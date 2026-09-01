import { useEffect, useRef, useState } from 'react';
import { Lock, Copy, Check, CheckCheck } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function MessageList({ activeSession }) {
  const { isTyping, showToast } = useChat();
  const messagesEndRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession.messages, isTyping]);

  const handleCopyText = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    showToast('Teks berhasil disalin!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-3 md:px-12 py-4 space-y-3 relative scrollbar-thin"
      style={{
        backgroundImage: `radial-gradient(circle at center, rgba(0, 0, 0, 0.035) 0%, transparent 70%)`
      }}
    >
      <div className="flex justify-center my-2">
        <div className="text-[11px] px-3 py-1.5 rounded-lg max-w-sm text-center shadow-xs flex items-center gap-1.5 bg-[#ffeecd] text-[#54656f] border border-[#ffdf9e]/50">
          <Lock size={12} className="shrink-0 text-[#856404]" />
          <span>Pesan diproses langsung secara cerdas oleh Google Gemini AI.</span>
        </div>
      </div>

      {activeSession.messages.map((msg) => {
        const isUser = msg.sender === 'user';
        return (
          <div
            key={msg.id}
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group`}
          >
            <div
              className={`relative max-w-[85%] md:max-w-[70%] lg:max-w-[60%] rounded-lg px-3 py-2 text-sm shadow-xs transition-all ${
                isUser
                  ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                  : 'bg-[#ffffff] text-[#111b21] rounded-tl-none border border-[#e9edef]/60'
              }`}
            >
              <button
                onClick={() => handleCopyText(msg.text, msg.id)}
                className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/90 text-[#54656f] hover:text-[#111b21] p-1 rounded transition-opacity shadow-xs text-xs flex items-center gap-1 border border-[#e9edef]"
                title="Salin Teks"
              >
                {copiedId === msg.id ? <Check size={12} className="text-[#008069]" /> : <Copy size={12} />}
              </button>

              <div className="whitespace-pre-wrap break-words leading-relaxed font-normal text-[#111b21]">
                {msg.text}
              </div>

              <div className="flex items-center justify-end gap-1 text-[10px] text-[#667781] mt-1 float-right ml-2 -mb-0.5 select-none">
                <span>{msg.time}</span>
                {isUser && (
                  <CheckCheck size={14} className="text-[#53bdeb]" />
                )}
              </div>
            </div>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex justify-start">
          <div className="rounded-lg px-4 py-2.5 shadow-xs flex items-center gap-1.5 bg-[#ffffff] text-[#667781] border border-[#e9edef]">
            <span className="w-2 h-2 rounded-full bg-[#008069] animate-bounce"></span>
            <span
              className="w-2 h-2 rounded-full bg-[#008069] animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></span>
            <span
              className="w-2 h-2 rounded-full bg-[#008069] animate-bounce"
              style={{ animationDelay: '0.4s' }}
            ></span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
