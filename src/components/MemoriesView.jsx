import { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { ArrowLeft, Wand2, Plus, Trash2, Check, X, Save, Pencil } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function MemoriesView({ isMobile }) {
  const { userMemories, saveUserMemories, deleteUserMemory, setActiveMobileTab, setActiveProfileFeature } = useChat();
  const [memories, setMemories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState(null);
  
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempMemory, setTempMemory] = useState({ parameter: '', value: '' });

  // Sync state with context
  useEffect(() => {
    setMemories(userMemories || []);
  }, [userMemories]);

  const handleBack = () => {
    if (isMobile) setActiveMobileTab('profile');
    else setActiveProfileFeature('default');
  };

  const updateMemory = (index, field, value) => {
    const newMemories = [...memories];
    newMemories[index][field] = value;
    setMemories(newMemories);
  };

  const addEmptyMemory = () => {
    setMemories([{ parameter: '', value: '' }, ...memories]);
    setEditingIndex(0);
    setTempMemory({ parameter: '', value: '' });
  };

  const startEditing = (idx, mem) => {
    setEditingIndex(idx);
    setTempMemory({ parameter: mem.parameter, value: mem.value });
  };

  const saveEdit = (idx) => {
    const newMemories = [...memories];
    newMemories[idx] = { ...newMemories[idx], ...tempMemory };
    setMemories(newMemories);
    setEditingIndex(null);
  };

  const cancelEdit = (idx) => {
    if (!memories[idx].parameter && !memories[idx].value) {
      removeLocalMemory(idx);
    }
    setEditingIndex(null);
  };

  const removeLocalMemory = (index) => {
    const mem = memories[index];
    if (mem.id) {
      // It's a saved memory from DB, trigger confirm
      setMemoryToDelete(mem.id);
      setShowDeleteConfirm(true);
    } else {
      // It's a new unsaved memory
      const newMemories = [...memories];
      newMemories.splice(index, 1);
      setMemories(newMemories);
    }
  };

  const confirmDelete = async () => {
    if (memoryToDelete) {
      await deleteUserMemory(memoryToDelete);
    }
    setShowDeleteConfirm(false);
    setMemoryToDelete(null);
  };

  const handleSave = async () => {
    // filter out empty ones
    const validMemories = memories.filter(m => m.parameter.trim() && m.value.trim());
    if (validMemories.length === 0 && memories.length > 0) {
       // if all were empty but they tried to save, just restore from context
       setMemories(userMemories || []);
       return;
    }
    
    setIsSaving(true);
    try {
      await saveUserMemories(validMemories);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`flex-1 h-full flex flex-col bg-[#f0f2f5] text-[#111b21] ${isMobile ? 'w-full' : ''}`}>
      {/* Header */}
      <div className="h-[60px] px-4 bg-[#f0f2f5] flex items-center justify-between shrink-0 shadow-sm z-10 border-b border-[#e9edef]">
        <div className="flex items-center gap-4">
          {isMobile && (
            <button onClick={handleBack} className="p-1 rounded-full hover:bg-gray-200">
              <ArrowLeft size={20} className="text-[#54656f]" />
            </button>
          )}
          <h1 className="text-base font-medium">Personalisasi & Prompt</h1>
        </div>
        {!isMobile && (
           <button onClick={handleBack} className="p-1 rounded-full hover:bg-gray-200 text-[#54656f]">
             <X size={20} />
           </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-[#efeae2] md:bg-white relative">
        <div className="w-full max-w-[600px] flex flex-col">
          <div className="w-16 h-16 bg-[#dcf8c6] rounded-full flex items-center justify-center mx-auto mb-4 text-[#008069]">
            <Wand2 size={32} />
          </div>

          <h2 className="text-2xl font-light text-center mb-2">Memori Pengguna</h2>
          <p className="text-sm text-center text-[#54656f] mb-8">
            Data spesifik tentang Anda yang akan selalu diingat oleh AI. Atur parameter (misal: Punya Anak) dan nilainya (misal: Ya, umur 3).
          </p>

          <button
            onClick={addEmptyMemory}
            className="self-start flex items-center gap-2 text-[#008069] text-sm font-medium bg-[#e7fce3] hover:bg-[#d9fdd3] px-4 py-2 rounded-lg transition-colors mb-4 border border-[#d9fdd3]"
          >
            <Plus size={18} />
            Tambah Memori Baru
          </button>

          <div className="flex flex-col gap-0 mb-6 bg-white md:bg-[#f0f2f5] rounded-xl border border-[#e9edef] overflow-hidden">
            {memories.length === 0 ? (
              <div className="text-center p-6 text-[#54656f] text-sm">
                Belum ada memori yang disimpan. Tambahkan memori agar AI lebih mengenal Anda.
              </div>
            ) : (
              memories.map((mem, idx) => (
                <div key={mem.id || idx} className={`flex items-center justify-between p-4 ${idx !== memories.length - 1 ? 'border-b border-[#e9edef]' : ''} hover:bg-[#f5f6f6] transition-colors group`}>
                  {editingIndex === idx ? (
                    <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-3">
                      <div className="flex flex-col gap-1 w-full md:w-1/3">
                         <span className="text-[10px] text-[#54656f] uppercase font-semibold">Parameter</span>
                         <input
                           type="text"
                           value={tempMemory.parameter}
                           onChange={(e) => setTempMemory({ ...tempMemory, parameter: e.target.value })}
                           className="w-full text-sm font-medium text-[#111b21] bg-transparent border-b border-[#00a884] focus:outline-none py-1"
                           placeholder="Misal: Nama Anak"
                           autoFocus
                         />
                      </div>
                      <div className="flex flex-col gap-1 w-full md:flex-1">
                         <span className="text-[10px] text-[#54656f] uppercase font-semibold">Nilai</span>
                         <input
                           type="text"
                           value={tempMemory.value}
                           onChange={(e) => setTempMemory({ ...tempMemory, value: e.target.value })}
                           className="w-full text-sm font-normal text-[#111b21] bg-transparent border-b border-[#00a884] focus:outline-none py-1"
                           placeholder="Misal: Rama, 3 tahun"
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') saveEdit(idx);
                           }}
                         />
                      </div>
                      <div className="flex items-center gap-1 mt-2 md:mt-0 self-end md:self-center">
                        <button onClick={() => saveEdit(idx)} className="p-1.5 text-[#00a884] hover:bg-gray-200 rounded-full transition-colors">
                          <Check size={18} />
                        </button>
                        <button onClick={() => cancelEdit(idx)} className="p-1.5 text-[#54656f] hover:bg-gray-200 rounded-full transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div 
                        className="flex-1 cursor-pointer flex flex-col"
                        onClick={() => startEditing(idx, mem)}
                      >
                        <span className="text-sm font-medium text-[#111b21]">{mem.parameter || '(Kosong)'}</span>
                        <span className="text-sm text-[#54656f] mt-0.5">{mem.value || '(Kosong)'}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(idx, mem)}
                          className="p-1.5 text-[#54656f] hover:text-[#00a884] hover:bg-gray-200 rounded-full transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => removeLocalMemory(idx)}
                          className="p-1.5 text-[#54656f] hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || memories.length === 0}
            className="w-full bg-[#00a884] text-white font-medium py-3 rounded-full hover:bg-[#008f6f] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mb-8"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Simpan Personalisasi</span>
              </>
            )}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Hapus Memori?"
        message="Memori ini akan dihapus dari data AI Anda secara permanen. Apakah Anda yakin?"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText="Hapus"
        isDanger={true}
      />
    </div>
  );
}
