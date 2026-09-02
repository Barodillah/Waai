import { FileText, Mic, Wand2, Sparkles, Laptop, Bot } from 'lucide-react';

export default function ProfileFeatureView() {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#f0f2f5] text-center px-4">
      
      {/* Main Card */}
      <div className="bg-white rounded-3xl p-10 max-w-[400px] w-full flex flex-col items-center shadow-sm mb-8">
        {/* Illustration Placeholder */}
        <div className="relative mb-6">
          <div className="w-48 h-32 relative">
             <Laptop size={120} strokeWidth={1} className="text-[#111b21] mx-auto absolute inset-0 m-auto" />
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] bg-[#00a884] p-2 rounded-lg border-2 border-[#111b21]">
                <Sparkles size={32} className="text-white" />
             </div>
          </div>
        </div>

        <h1 className="text-2xl font-normal text-[#111b21] mb-3 leading-tight">
          Asisten AI cerdas untuk segala kebutuhanmu
        </h1>
        <p className="text-sm text-[#54656f] mb-8">
          Kini Anda dapat berinteraksi dengan berbagai persona AI cerdas langsung dari WhatsAI Web.
        </p>

        <button className="bg-[#dcf8c6] text-[#008069] font-medium px-6 py-2.5 rounded-full hover:bg-[#c2f3a3] transition-colors">
          Jelajahi Persona AI
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-8">
        <button className="flex flex-col items-center group cursor-pointer">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#111b21] shadow-sm mb-3 group-hover:bg-gray-50 transition-colors">
            <FileText size={24} />
          </div>
          <span className="text-xs text-[#54656f]">Analisis Dokumen</span>
        </button>
        
        <button className="flex flex-col items-center group cursor-pointer">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#111b21] shadow-sm mb-3 group-hover:bg-gray-50 transition-colors">
            <Wand2 size={24} />
          </div>
          <span className="text-xs text-[#54656f]">Buat Persona</span>
        </button>
        
        <button className="flex flex-col items-center group cursor-pointer">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#111b21] shadow-sm mb-3 group-hover:bg-gray-50 transition-colors">
            <Mic size={24} />
          </div>
          <span className="text-xs text-[#54656f]">Chat Suara AI</span>
        </button>
        
        <button className="flex flex-col items-center group cursor-pointer">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#111b21] shadow-sm mb-3 group-hover:bg-gray-50 transition-colors">
            <Sparkles size={24} className="text-[#a855f7]" />
          </div>
          <span className="text-xs text-[#54656f]">Tanya WhatsAI</span>
        </button>
      </div>

    </div>
  );
}
