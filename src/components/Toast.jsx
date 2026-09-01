import { Check } from 'lucide-react';

export default function Toast({ message }) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#008069] text-white px-4 py-2 rounded-full shadow-md text-xs md:text-sm font-medium flex items-center gap-2 animate-bounce">
      <Check size={16} />
      <span>{message}</span>
    </div>
  );
}
