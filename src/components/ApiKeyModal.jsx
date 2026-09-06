import React from 'react';
import { Key } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function ApiKeyModal() {
  const { isApiKeyModalOpen, hideApiKeyModal, setActiveMobileTab, setActiveProfileFeature } = useChat();

  if (!isApiKeyModalOpen) return null;

  const handleGoToSettings = () => {
    hideApiKeyModal();
    setActiveMobileTab('profile');
    setActiveProfileFeature('apikey');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={hideApiKeyModal}
    >
      <div
        className="bg-white rounded-2xl w-[90%] max-w-sm p-6 shadow-xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-[#dcf8c6] rounded-full flex items-center justify-center mb-4 text-[#008069]">
          <Key size={32} />
        </div>

        <h2 className="text-xl font-medium text-center mb-2">API Key Diperlukan</h2>
        <p className="text-sm text-center text-[#54656f] mb-6">
          Anda perlu mengatur OpenRouter API Key di Pengaturan untuk dapat berbicara dengan AI atau membuat persona baru.
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
            onClick={hideApiKeyModal}
          >
            Dapatkan API Key
          </a>
        </div>
      </div>
    </div>
  );
}
