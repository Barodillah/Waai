import React from 'react';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Hapus', 
  cancelText = 'Batal',
  isDanger = true,
  extraAction = null,
  extraText = '',
  extraStyle = 'bg-[#008069] hover:bg-[#06cf9c] text-white'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 animate-fade-in">
      <div className="bg-white rounded shadow-[0_17px_50px_0_rgba(11,20,26,.19),0_12px_15px_0_rgba(11,20,26,.24)] w-[90%] max-w-[400px] p-5 text-[#3b4a54]">
        {title && <h2 className="text-xl font-normal text-[#111b21] mb-3">{title}</h2>}
        <div className="text-[15px] leading-relaxed mb-10">
          {message}
        </div>
        
        <div className="flex justify-end gap-2 font-medium flex-wrap">
          <button 
            onClick={onCancel}
            className="px-6 py-2.5 text-[#008069] border border-[#e9edef] rounded-full hover:bg-[#f5f6f6] transition-colors text-sm"
          >
            {cancelText}
          </button>
          
          {extraAction && (
            <button 
              onClick={extraAction}
              className={`px-6 py-2.5 rounded-full transition-colors shadow-sm text-sm ${extraStyle}`}
            >
              {extraText}
            </button>
          )}

          <button 
            onClick={onConfirm}
            className={`px-6 py-2.5 text-white rounded-full transition-colors shadow-sm text-sm ${
              isDanger 
                ? 'bg-[#ea0038] hover:bg-[#d60033]' 
                : 'bg-[#008069] hover:bg-[#06cf9c]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
