import { Check } from 'lucide-react';

export default function Toast({ message }) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-[250px] lg:left-[270px] z-50 bg-[#222222] text-[#f1f1f2] px-5 py-2.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] text-[13px] md:text-sm font-normal flex items-center gap-3 animate-fade-in whitespace-nowrap">
      <div className="flex items-center justify-center w-[18px] h-[18px] rounded-full border-[1.5px] border-[#f1f1f2]">
        <Check size={12} strokeWidth={3} className="text-[#f1f1f2]" />
      </div>
      <span>{message}</span>
    </div>
  );
}
