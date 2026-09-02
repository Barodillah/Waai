import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { ArrowLeft, Key, ExternalLink } from 'lucide-react';

export default function ApiKeyView({ isMobile }) {
  const { openRouterApiKey, saveApiKey, setActiveMobileTab, setActiveProfileFeature } = useChat();
  const [apiKey, setApiKey] = useState(openRouterApiKey);

  const handleSave = () => {
    saveApiKey(apiKey);
    if (isMobile) {
      setActiveMobileTab('profile');
    } else {
      setActiveProfileFeature('default');
    }
  };

  return (
    <div className={`flex-1 h-full flex flex-col bg-[#f0f2f5] text-[#111b21] ${isMobile ? 'w-full' : ''}`}>
      {/* Header */}
      <div className="h-[60px] px-4 bg-[#f0f2f5] flex items-center gap-4 shrink-0 shadow-sm z-10 border-b border-[#e9edef]">
        {isMobile && (
          <button onClick={() => setActiveMobileTab('profile')} className="p-1 rounded-full hover:bg-gray-200">
            <ArrowLeft size={20} className="text-[#54656f]" />
          </button>
        )}
        <h1 className="text-base font-medium">Kunci API OpenRouter</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center justify-center bg-white relative">
        <div className="w-full max-w-[400px]">
          <div className="w-16 h-16 bg-[#dcf8c6] rounded-full flex items-center justify-center mx-auto mb-6 text-[#008069]">
            <Key size={32} />
          </div>
          
          <h2 className="text-2xl font-light text-center mb-2">Atur Kunci API</h2>
          <p className="text-sm text-center text-[#54656f] mb-8">
            Simpan OpenRouter API Key Anda dengan aman di penyimpanan lokal peramban ini. Kami tidak menyimpan kunci Anda di server kami.
          </p>

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-xs font-semibold text-[#54656f] ml-1">OPENROUTER API KEY</label>
            <input 
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-3 bg-[#f0f2f5] border border-[#e9edef] rounded-lg outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-all"
            />
            <a 
              href="https://openrouter.ai/keys" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-[#00a884] hover:underline flex items-center gap-1 self-start ml-1 mt-1"
            >
              Dapatkan API Key di OpenRouter <ExternalLink size={12} />
            </a>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-[#00a884] text-white font-medium py-3 rounded-full hover:bg-[#008f6f] transition-colors shadow-sm"
          >
            Simpan Kunci API
          </button>
        </div>
      </div>
    </div>
  );
}
