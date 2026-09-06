import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, Check, Bot, ArrowRight, CircleDashed, X } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { getModelAvatar } from '../utils/avatar';
import ConfirmModal from './ConfirmModal';

export default function NewGroupView() {
  const { setActiveProfileFeature, customPersonas, startGroupChat } = useChat();

  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [openRouterModels, setOpenRouterModels] = useState([]);
  const [defaultModels, setDefaultModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch initial top models
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch('https://openrouter.ai/api/frontend/v1/models/find?active=true&order=most-popular&output_modalities=text&categories=roleplay');
        const data = await response.json();
        const models = data.data.models.slice(0, 20).map(m => ({
          id: m.slug,
          name: m.name,
          description: m.description,
          endpoint: m.endpoint,
          _type: 'model'
        }));
        setOpenRouterModels(models);
        setDefaultModels(models);
      } catch (error) {
        console.error('Failed to fetch OpenRouter models:', error);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchModels();
  }, []);

  // Search models
  useEffect(() => {
    const searchModels = async () => {
      if (searchQuery.length >= 3) {
        setIsLoadingModels(true);
        try {
          const response = await fetch(`https://openrouter.ai/api/frontend/v1/models/find?active=true&output_modalities=text&q=${encodeURIComponent(searchQuery)}`);
          const data = await response.json();
          const models = data.data.models.slice(0, 20).map(m => ({
            id: m.slug,
            name: m.name,
            description: m.description,
            endpoint: m.endpoint,
            _type: 'model'
          }));
          setOpenRouterModels(models);
        } catch (error) {
          console.error('Failed to search models:', error);
        } finally {
          setIsLoadingModels(false);
        }
      } else if (searchQuery.length === 0) {
        setOpenRouterModels(defaultModels);
      }
    };

    const timeoutId = setTimeout(() => {
      searchModels();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, defaultModels]);

  const allPersonas = useMemo(() => {
    const custom = (customPersonas || []).map(p => ({ ...p, _type: 'custom' }));
    return custom;
  }, [customPersonas]);

  const filteredPersonas = searchQuery
    ? allPersonas.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    : allPersonas;

  const toggleMember = (member) => {
    const isSelected = selectedMembers.some(m => m.id === member.id);
    if (isSelected) {
      setSelectedMembers(prev => prev.filter(m => m.id !== member.id));
    } else {
      let avatarUrl = member.avatar;
      if (!avatarUrl && member.id && member.id.includes('/')) {
        // Use robohash for models
        avatarUrl = getModelAvatar(member.id);
      }
      setSelectedMembers(prev => [...prev, { ...member, avatar: avatarUrl, _type: member._type || 'model' }]);
    }
  };

  const handleBack = () => {
    setActiveProfileFeature('default');
  };

  const handleSubmit = () => {
    startGroupChat(groupName, selectedMembers);
    setActiveProfileFeature('default');
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="h-16 px-4 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center gap-6 shrink-0 text-[#54656f] z-10 relative">
        <button onClick={handleBack} className="hover:text-[#111b21] transition-colors p-1 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <span className="text-base font-medium text-[#111b21]">Tambah Anggota Grup</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col">
        {/* Selected Members Area */}
        <div className="bg-white border-b border-[#f0f2f5]">
          {selectedMembers.length > 0 && (
            <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto scrollbar-thin">
              {selectedMembers.map(member => {
                return (
                  <div key={member.id} className="relative w-[52px] flex-shrink-0 flex flex-col items-center group cursor-pointer" onClick={() => toggleMember(member)}>
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#f0f2f5] border border-[#e9edef] flex items-center justify-center shrink-0 mb-1">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <Bot size={24} className="text-[#54656f]" />
                      )}
                      <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center transition-colors">
                        <X size={20} className="text-white" />
                      </div>
                    </div>
                    <span className="text-[11px] text-[#54656f] font-medium text-center w-full truncate px-0.5">{member.name.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-4 pb-3 pt-3">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nama grup"
              className="w-full border-b-2 border-[#00a884] focus:border-[#00a884] bg-transparent outline-none py-2 text-sm text-[#111b21] placeholder-[#8696a0]"
            />
          </div>

          {/* Search Input */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm bg-[#f0f2f5] text-[#111b21]">
              <Search size={18} className="text-[#54656f] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari anggota..."
                className="w-full bg-transparent border-none outline-none placeholder-[#54656f] text-sm text-[#111b21]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#54656f] hover:text-[#111b21]">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Available Members List */}
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Custom Personas */}
          {filteredPersonas.length > 0 && (
            <>
              <div className="px-4 py-3 bg-white">
                <h3 className="text-sm font-medium text-[#008069]">Persona Anda</h3>
              </div>
              {filteredPersonas.map(persona => {
                const isSelected = selectedMembers.some(m => m.id === persona.id);
                return (
                  <div
                    key={persona.id}
                    onClick={() => toggleMember(persona)}
                    className="flex items-center px-4 py-2 hover:bg-[#f5f6f6] cursor-pointer"
                  >
                    <div className="relative mr-3 shrink-0">
                      <img src={persona.avatar} alt={persona.name} className="w-12 h-12 rounded-full object-cover" />
                      {isSelected && (
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#00a884] rounded-full flex items-center justify-center border-2 border-white">
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 border-b border-[#f0f2f5] py-2">
                      <h3 className="text-[15px] font-normal text-[#111b21] truncate">{persona.name}</h3>
                      <p className="text-[13px] text-[#54656f] truncate">{persona.description || 'Persona kustom'}</p>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* OpenRouter Models */}
          <div className="px-4 py-3 bg-white mt-2 border-t border-[#f0f2f5]">
            <h3 className="text-sm font-medium text-[#008069]">{searchQuery ? 'Hasil Pencarian Model' : 'Model Populer'}</h3>
          </div>

          {isLoadingModels ? (
            <div className="px-4 py-3 text-sm text-[#54656f] text-center flex items-center justify-center gap-2">
              <CircleDashed size={18} className="animate-spin text-[#00a884]" />
              Memuat model...
            </div>
          ) : (
            openRouterModels.map((model, idx) => {
              const isSelected = selectedMembers.some(m => m.id === model.id);
              const modelName = model.name.toLowerCase();
              let iconUrl = null;

              if (modelName.includes('gemini')) iconUrl = 'https://openrouter.ai/images/icons/GoogleGemini.svg';
              else if (modelName.includes('deepseek')) iconUrl = 'https://openrouter.ai/images/icons/DeepSeek.png';
              else if (modelName.includes('openai')) iconUrl = 'https://openrouter.ai/images/icons/OpenAI.svg';
              else if (modelName.includes('z.ai')) iconUrl = 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://z.ai/&size=256';
              else if (modelName.includes('xiaomi')) iconUrl = 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.mi.com&size=256';
              else if (modelName.includes('tencent')) iconUrl = 'https://openrouter.ai/images/icons/Tencent.png';
              else if (modelName.includes('minimax')) iconUrl = 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://minimaxi.com/&size=256';
              else if (modelName.includes('qwen')) iconUrl = 'https://openrouter.ai/images/icons/Qwen.png';
              else if (model.endpoint?.provider_info?.icon?.url) {
                iconUrl = model.endpoint.provider_info.icon.url.startsWith('/')
                  ? `https://openrouter.ai${model.endpoint.provider_info.icon.url}`
                  : model.endpoint.provider_info.icon.url;
              }

              return (
                <div
                  key={`${model.id}-${idx}`}
                  onClick={() => toggleMember(model)}
                  className="flex items-center px-4 py-3 hover:bg-[#f5f6f6] cursor-pointer"
                >
                  <div className="relative mr-3.5 shrink-0">
                    <div className="relative w-8 h-8 flex items-center justify-center rounded-md bg-[#f0f2f5] overflow-hidden">
                      {iconUrl ? (
                        <img src={iconUrl} alt={model.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Bot size={18} className="text-[#54656f]" />
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00a884] rounded-full flex items-center justify-center border-2 border-white z-10">
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 border-b border-[#f0f2f5] py-2">
                    <h3 className="text-[15px] font-normal text-[#111b21] truncate">{model.name}</h3>
                    <p className="text-[13px] text-[#54656f] truncate">{model.description || 'Model OpenRouter'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FAB Submit Button */}
      {groupName.trim() !== '' && selectedMembers.length > 0 && (
        <button
          onClick={() => setShowConfirmModal(true)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-[#00a884] rounded-full flex items-center justify-center shadow-lg hover:bg-[#008f6f] transition-colors text-white z-20"
        >
          <ArrowRight size={24} />
        </button>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Buat Grup Baru"
        message={`Apakah Anda yakin ingin membuat grup "${groupName}" dengan ${selectedMembers.length} anggota?`}
        confirmText="Buat Grup"
        cancelText="Batal"
        onConfirm={() => {
          setShowConfirmModal(false);
          handleSubmit();
        }}
        onCancel={() => setShowConfirmModal(false)}
        isDanger={false}
      />
    </div>
  );
}
