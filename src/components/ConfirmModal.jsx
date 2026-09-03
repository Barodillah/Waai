import React from 'react';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Hapus', 
  cancelText = 'Batal' 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white rounded-md w-[85%] max-w-[400px] shadow-xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-normal text-[#111b21] mb-3">{title}</h2>
          <p className="text-[15px] text-[#54656f] leading-relaxed">{message}</p>
        </div>
        
        <div className="px-6 py-4 flex justify-end gap-3 bg-white pt-2">
          <button 
            onClick={onCancel}
            className="px-5 py-2 rounded-full border border-[#e9edef] text-[#008069] font-medium hover:bg-[#f5f6f6] transition-colors text-sm"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="px-5 py-2 rounded-full bg-[#ea0038] text-white font-medium hover:bg-[#d60033] transition-colors text-sm shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
