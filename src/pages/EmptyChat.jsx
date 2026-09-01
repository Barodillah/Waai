import { Bot } from 'lucide-react';

export default function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] border-l border-[#e9edef]">
      <div className="text-center px-4">
        <Bot size={80} className="mx-auto mb-6 text-[#00a884] opacity-70" />
        <h2 className="text-3xl font-light text-[#41525d] mb-4">WhatsApp AI Web</h2>
        <p className="text-sm text-[#667781] max-w-md mx-auto leading-relaxed">
          Kirim dan terima pesan dari asisten cerdas AI. Terhubung dengan berbagai persona AI untuk membantu produktivitas Anda.
        </p>
      </div>
      <div className="absolute bottom-10 text-xs text-[#8696a0] flex items-center gap-1">
        <span>Dilindungi enkripsi end-to-end</span>
      </div>
    </div>
  );
}
