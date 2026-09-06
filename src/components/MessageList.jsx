import React, { useEffect, useRef, useState } from 'react';
import { Lock, Copy, Check, CheckCheck, ChevronDown, Reply, Forward, Pin, Star, Trash2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useUser } from '../context/UserContext';
import { formatTime, formatDateSeparator } from '../utils/time';
import ReactMarkdown from 'react-markdown';
import InfoMessage from './InfoMessage';
import remarkGfm from 'remark-gfm';
import { getDefaultAiAvatar } from '../utils/avatar';

export default function MessageList({ activeSession }) {
  const { showToast, customPersonas, setReplyingTo, setForwardMessage, startNewChat, setShowContactInfo, deleteMessage, scrollToMessageId, setScrollToMessageId, typingSessionId } = useChat();
  const { user } = useUser();
  const messagesEndRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const longPressTimer = useRef(null);

  const handleTouchStart = (msgId) => {
    longPressTimer.current = setTimeout(() => {
      setOpenDropdownId(msgId);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  useEffect(() => {
    const handleClick = () => setOpenDropdownId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (openDropdownId) {
      setTimeout(() => {
        const dropdownEl = document.getElementById(`dropdown-${openDropdownId}`);
        if (dropdownEl) {
          dropdownEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }, [openDropdownId]);

  const persona = customPersonas?.find(p => p.id === activeSession.personaId);
  const modelId = persona ? (persona.baseModel || persona.id) : activeSession.personaId;
  const isWaitingForAi = typingSessionId === activeSession.id;

  const isScrollingToMessage = useRef(false);

  useEffect(() => {
    if (scrollToMessageId) {
      isScrollingToMessage.current = true;
      setTimeout(() => {
        const el = document.getElementById(`msg-${scrollToMessageId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedMessageId(scrollToMessageId);
          setTimeout(() => {
            setHighlightedMessageId(null);
          }, 2000);
        }
        setScrollToMessageId(null);
        setTimeout(() => {
          isScrollingToMessage.current = false;
        }, 500);
      }, 100);
    } else if (!isScrollingToMessage.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession.messages, isWaitingForAi, scrollToMessageId, setScrollToMessageId]);

  const handleCopyText = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    showToast('Teks berhasil disalin!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 md:px-12 py-4 space-y-3 relative scrollbar-thin bg-[#efeae2] chat-bg">
      {/* Global Backdrop Blur (Mobile Only) */}
      {openDropdownId && (
        <div className="md:hidden fixed inset-0 z-40 bg-white/20 backdrop-blur-[2px] transition-all" />
      )}

      <InfoMessage 
        text={<span>Pesan diproses langsung oleh <strong>{modelId}</strong>.</span>}
        icon={<Lock size={12} className="text-[#856404]" />}
        variant="warning"
      />

      {activeSession.messages.map((msg, index) => {
        let showDateSeparator = false;
        let dateSeparatorText = '';
        if (index === 0) {
          showDateSeparator = true;
          dateSeparatorText = formatDateSeparator(msg.time);
        } else {
          const prevMsg = activeSession.messages[index - 1];
          const prevDate = new Date(prevMsg.time).toDateString();
          const currDate = new Date(msg.time).toDateString();
          if (prevDate !== currDate) {
            showDateSeparator = true;
            dateSeparatorText = formatDateSeparator(msg.time);
          }
        }

        const dateSeparatorNode = (showDateSeparator && !activeSession.isIncognito) ? (
          <InfoMessage key={`date-${msg.id}`} text={dateSeparatorText} />
        ) : null;

        if (msg.sender === 'system') {
          return (
            <React.Fragment key={msg.id}>
              {dateSeparatorNode}
              <InfoMessage text={msg.text} />
            </React.Fragment>
          );
        }

        const isUser = msg.sender === 'user';
        return (
          <React.Fragment key={msg.id}>
            {dateSeparatorNode}
            <div
              id={`msg-${msg.id}`}
              className={`flex w-full mb-1.5 ${isUser ? 'justify-end' : 'justify-start'} group ${openDropdownId === msg.id ? 'relative z-50' : ''}`}
            >
            {!isUser && activeSession.isGroup && (
               <div className="mr-2 shrink-0 self-start mt-0.5">
                  <img src={msg.avatar || getDefaultAiAvatar()} alt={msg.senderName} className="w-[34px] h-[34px] rounded-full object-cover bg-[#f0f2f5]" />
               </div>
            )}
            <div
              onTouchStart={() => handleTouchStart(msg.id)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
              onDoubleClick={() => setOpenDropdownId(msg.id)}
              className={`relative max-w-[85%] md:max-w-[70%] lg:max-w-[60%] rounded-lg px-2.5 py-1.5 text-sm shadow-sm transition-all duration-500 ${isUser
                  ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                  : 'bg-[#ffffff] text-[#111b21] rounded-tl-none'
                } ${highlightedMessageId === msg.id ? 'ring-2 ring-[#00a884] bg-opacity-80 scale-[1.02]' : ''}`}
            >
              {/* Removed tails based on user feedback */}

              <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === msg.id ? null : msg.id); }}
                  className="hidden md:block text-[#8696a0] hover:text-[#54656f] p-0.5 rounded-full"
                >
                  <ChevronDown size={22} />
                </button>
              </div>
              {openDropdownId === msg.id && (
                <div id={`dropdown-${msg.id}`} className="absolute right-0 top-full mt-2 md:top-8 md:right-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.15)] py-1.5 w-52 border border-[#e9edef] z-50 overflow-hidden">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplyingTo(msg);
                      setOpenDropdownId(null);
                    }}
                    className="w-full px-5 py-3 hover:bg-[#f5f6f6]/50 text-[#111b21] text-[15px] flex items-center justify-between border-b border-[#e9edef]/80"
                  >
                      <span>Balas</span>
                      <Reply size={20} className="text-[#111b21]" />
                  </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setForwardMessage(msg);
                        setOpenDropdownId(null);
                      }}
                      className="w-full px-5 py-3 hover:bg-[#f5f6f6]/50 text-[#111b21] text-[15px] flex items-center justify-between border-b border-[#e9edef]/80"
                    >
                      <span>Teruskan</span>
                      <Forward size={20} className="text-[#111b21]" />
                    </button>
                    <button onClick={() => handleCopyText(msg.text, msg.id)} className="w-full px-5 py-3 hover:bg-[#f5f6f6]/50 text-[#111b21] text-[15px] flex items-center justify-between border-b border-[#e9edef]/80">
                      <span>Salin</span>
                      {copiedId === msg.id ? <Check size={20} className="text-[#008069]" /> : <Copy size={20} className="text-[#111b21]" />}
                    </button>
                    <button className="w-full px-5 py-3 hover:bg-[#f5f6f6]/50 text-[#111b21] text-[15px] flex items-center justify-between border-b border-[#e9edef]/80">
                      <span>Beri bintang</span>
                      <Star size={20} className="text-[#111b21]" />
                    </button>
                    <button className="w-full px-5 py-3 hover:bg-[#f5f6f6]/50 text-[#111b21] text-[15px] flex items-center justify-between border-b border-[#e9edef]/80">
                      <span>Sematkan</span>
                      <Pin size={20} className="text-[#111b21]" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(activeSession.id, msg.id);
                        setOpenDropdownId(null);
                      }}
                      className="w-full px-5 py-3 hover:bg-[#f5f6f6]/50 text-[#ea0038] text-[15px] flex items-center justify-between"
                    >
                      <span>Hapus</span>
                      <Trash2 size={20} className="text-[#ea0038]" />
                    </button>
                  </div>
                )}

              {!isUser && activeSession.isGroup && msg.senderName && (
                <div className="mb-0.5 pr-8">
                  <span 
                    className="font-medium text-[13px] text-[#e55030] leading-none cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      const memberObj = activeSession.members?.find(m => m.id === msg.senderId);
                      if (memberObj) {
                        startNewChat(memberObj);
                        setShowContactInfo(true);
                      }
                    }}
                  >
                    {msg.senderName}
                  </span>
                </div>
              )}

              {msg.replyTo && (
                <div 
                  className="mb-1.5 p-2 rounded bg-black/5 border-l-4 border-[#ea0038] text-[13px] text-[#54656f] cursor-pointer"
                  onClick={() => {
                    const el = document.getElementById(`msg-${msg.replyTo.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <div className="font-semibold text-[#ea0038] mb-0.5">{msg.replyTo.sender === 'user' ? 'Anda' : (msg.replyTo.senderName || activeSession?.name || 'AI')}</div>
                  <div className="truncate max-h-[36px] whitespace-pre-wrap line-clamp-2 leading-snug">{msg.replyTo.text}</div>
                </div>
              )}

              <div className={`whitespace-pre-wrap break-words leading-relaxed font-normal text-[#111b21] prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-1 prose-pre:bg-gray-800 prose-pre:text-white prose-code:text-[#008069] prose-code:bg-[#f0f2f5] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-a:text-[#53bdeb] prose-strong:font-bold ${openDropdownId === msg.id ? 'line-clamp-3' : ''}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.text}
                </ReactMarkdown>
              </div>

              <div className="flex items-center justify-end gap-1 text-[10px] text-[#667781] mt-1 float-right ml-2 -mb-0.5 select-none">
                <span>{formatTime(msg.time)}</span>
                {(() => {
                  if (!isUser) return null;
                  
                  const otherHumans = activeSession.members?.filter(m => m._type === 'user' && m.id !== user?.id).length || 0;
                  const isRead = msg.reads?.length > 0 || otherHumans === 0;
                  
                  return isRead 
                    ? <CheckCheck size={14} className="text-[#53bdeb]" /> 
                    : <CheckCheck size={14} className="text-[#8696a0]" />;
                })()}
              </div>
            </div>
          </div>
          </React.Fragment>
        );
      })}

      {isWaitingForAi && (
        <div className="flex justify-start">
          <div className="rounded-lg px-4 py-2.5 shadow-xs flex items-center gap-1.5 bg-[#ffffff] text-[#667781] border border-[#e9edef]">
            <span className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce"></span>
            <span
              className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></span>
            <span
              className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce"
              style={{ animationDelay: '0.4s' }}
            ></span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
