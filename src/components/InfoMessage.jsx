import React from 'react';

/**
 * Komponen untuk menampilkan pesan informasi/sistem di tengah chat.
 * @param {Object} props
 * @param {React.ReactNode} props.text - Teks yang akan ditampilkan.
 * @param {React.ReactNode} [props.icon] - Ikon Lucide atau komponen ikon lainnya (opsional).
 * @param {string} [props.variant] - Varian gaya: 'default' (putih) atau 'warning' (kuning). Default: 'default'.
 */
export default function InfoMessage({ text, icon, variant = 'default' }) {
  const isWarning = variant === 'warning';
  
  const containerClasses = isWarning
    ? 'bg-[#ffeecd] text-[#54656f] border border-[#ffdf9e]/50 shadow-xs'
    : 'bg-[#ffffff] text-[#54656f] border border-[#e9edef] shadow-sm';

  return (
    <div className="flex justify-center my-2">
      <div className={`text-[12px] px-3 py-1.5 rounded-lg max-w-sm text-center flex items-center justify-center gap-1.5 ${containerClasses}`}>
        {icon && <div className="shrink-0">{icon}</div>}
        <span>{text}</span>
      </div>
    </div>
  );
}
