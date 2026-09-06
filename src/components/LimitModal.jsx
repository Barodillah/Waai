import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function LimitModal() {
  const { isLimitModalOpen, hideLimitModal, setActiveMobileTab, setActiveProfileFeature } = useChat();

  if (!isLimitModalOpen) return null;

  const handleGoToSettings = () => {
    hideLimitModal();
    setActiveMobileTab('profile');
    setActiveProfileFeature('apikey');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={hideLimitModal}
    >
      <div
        className="bg-white rounded-2xl w-[90%] max-w-sm p-6 shadow-xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-[#ffdde5] rounded-full flex items-center justify-center mb-4 text-[#ea0038]">
          <AlertCircle size={32} />
        </div>

        <h2 className="text-xl font-medium text-center mb-2">Limit API Habis</h2>
        <p className="text-sm text-center text-[#54656f] mb-6">
          Kredit OpenRouter Anda telah habis atau Anda mencapai batas token. Silakan gunakan API Key lain atau perbarui limit Anda.
        </p>

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={handleGoToSettings}
            className="w-full py-2.5 bg-[#008069] text-white rounded-full font-medium text-sm hover:bg-[#01705c] transition-colors"
          >
            Buka Pengaturan API
          </button>

          <a
            href="https://shop.bewhy.id/?from=whatsai"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-[#f0f2f5] text-[#111b21] rounded-full font-medium text-sm hover:bg-[#e9edef] transition-colors text-center"
            onClick={hideLimitModal}
          >
            Dapatkan API Key
          </a>
        </div>
      </div>
    </div>
  );
}
