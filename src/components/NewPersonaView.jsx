import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, CircleDashed, ChevronDown, Search, Bot } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { callOpenRouterAPI } from '../utils/api';

export default function NewPersonaView() {
  const { setActiveProfileFeature, setActiveMobileTab, addCustomPersona, updateCustomPersona, editingPersona, setEditingPersona, openRouterApiKey, showToast } = useChat();

  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [interest, setInterest] = useState('');
  const [tone, setTone] = useState('');
  const [type, setType] = useState('afirmasi'); // afirmasi, debat, devil
  const [baseModel, setBaseModel] = useState('');
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [defaultModels, setDefaultModels] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (editingPersona) {
      setName(editingPersona.name);
      setBaseModel(editingPersona.baseModel || '');
      
      // Mengembalikan field interest dan tone (dengan fallback untuk kompatibilitas data lama)
      setInterest(editingPersona.interest || '');
      setTone(editingPersona.tone || '');
      
      if (!editingPersona.interest && editingPersona.description) {
        try {
          const parts = editingPersona.description.split(' | ');
          if (parts.length === 2) {
            setInterest(parts[0].replace('Minat: ', ''));
            setTone(parts[1].replace('Gaya: ', ''));
          }
        } catch (e) {}
      }

      if (editingPersona.systemPrompt.includes('selalu mendukung')) setType('afirmasi');
      else if (editingPersona.systemPrompt.includes('suka berdebat')) setType('debat');
      else if (editingPersona.systemPrompt.includes('selalu mengambil sudut pandang berlawanan')) setType('devil');
    }
  }, [editingPersona]);
  const [openRouterModels, setOpenRouterModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch('https://openrouter.ai/api/frontend/v1/models/find?active=true&order=most-popular&output_modalities=text');
        const data = await response.json();
        const models = data.data.models.slice(0, 20);
        setOpenRouterModels(models);
        setDefaultModels(models);
        if (models.length > 0 && !baseModel) {
          setBaseModel(models[0].slug || models[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch OpenRouter models:', error);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    const searchModels = async () => {
      if (modelSearchQuery.length >= 3) {
        setIsLoadingModels(true);
        try {
          const response = await fetch(`https://openrouter.ai/api/frontend/v1/models/find?active=true&output_modalities=text&q=${encodeURIComponent(modelSearchQuery)}`);
          const data = await response.json();
          setOpenRouterModels(data.data.models.slice(0, 20));
        } catch (error) {
          console.error('Failed to search models:', error);
        } finally {
          setIsLoadingModels(false);
        }
      } else if (modelSearchQuery.length === 0) {
        setOpenRouterModels(defaultModels);
      }
    };

    const timeoutId = setTimeout(() => {
      searchModels();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [modelSearchQuery, defaultModels]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModelIcon = (modelName, modelEndpointIconUrl) => {
    if (!modelName) return null;
    const lowerName = modelName.toLowerCase();
    let iconUrl = null;
    if (lowerName.includes('gemini')) iconUrl = 'https://openrouter.ai/images/icons/GoogleGemini.svg';
    else if (lowerName.includes('deepseek')) iconUrl = 'https://openrouter.ai/images/icons/DeepSeek.png';
    else if (lowerName.includes('openai')) iconUrl = 'https://openrouter.ai/images/icons/OpenAI.svg';
    else if (lowerName.includes('z.ai')) iconUrl = 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://z.ai/&size=256';
    else if (lowerName.includes('xiaomi')) iconUrl = 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.mi.com&size=256';
    else if (lowerName.includes('tencent')) iconUrl = 'https://openrouter.ai/images/icons/Tencent.png';
    else if (lowerName.includes('minimax')) iconUrl = 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://minimaxi.com/&size=256';
    else if (lowerName.includes('qwen')) iconUrl = 'https://openrouter.ai/images/icons/Qwen.png';
    else if (modelEndpointIconUrl) {
      iconUrl = modelEndpointIconUrl.startsWith('/') 
        ? `https://openrouter.ai${modelEndpointIconUrl}` 
        : modelEndpointIconUrl;
    }
    return iconUrl;
  };

  const selectedModelData = openRouterModels.find(m => (m.slug || m.id) === baseModel) || defaultModels.find(m => (m.slug || m.id) === baseModel);
  const selectedModelIconUrl = selectedModelData ? getModelIcon(selectedModelData.name, selectedModelData.endpoint?.provider_info?.icon?.url) : null;

  const handleBack = () => {
    if (setEditingPersona) setEditingPersona(null);
    setActiveProfileFeature('default');
  };

  const handleSuggest = () => {
    const suggestions = [
      { interest: 'Teknologi & AI', tone: 'Sarkas tapi suportif', type: 'debat' },
      { interest: 'Filsafat Stoikisme', tone: 'Tenang dan bijak', type: 'devil' },
      { interest: 'Pengembangan Diri', tone: 'Sangat antusias dan memotivasi', type: 'afirmasi' },
      { interest: 'Sejarah Dunia', tone: 'Formal dan mendetail', type: 'afirmasi' },
      { interest: 'Pop Culture & Film', tone: 'Santai dan gaul', type: 'debat' }
    ];
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    setInterest(random.interest);
    setTone(random.tone);
    setType(random.type);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    if (!openRouterApiKey) {
      showToast('API Key OpenRouter belum diisi! Mohon isi di Pengaturan.');
      return;
    }

    setIsSaving(true);
    let generatedSystemPrompt = '';
    let generatedTagline = '';

    try {
      const promptToAI = `Buat system prompt spesifik (maks 3 paragraf) untuk AI ini:
Nama: ${name}
Minat: ${interest}
Gaya: ${tone}
Sifat: ${type}

KEMBALIKAN HANYA JSON MURNI DENGAN FORMAT:
{
  "prompt_hasil": "isi prompt dari sudut pandang 'Kamu adalah...'",
  "tagline": "Frasa singkat 1-3 kata yang menggambarkan profesi atau keahlian karakter ini (misal: Pakar Teknologi, Tukang Debat, Motivator Handal)"
}`;

      const aiMessages = [{ sender: 'user', text: promptToAI }];
      // Menggunakan model google/gemini-2.5-flash agar lebih stabil di OpenRouter
      const response = await callOpenRouterAPI(aiMessages, 'google/gemini-2.5-flash', openRouterApiKey, "Kamu adalah mesin pembuat JSON murni. Jangan tambahkan penjelasan.");
      
      try {
        const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        generatedSystemPrompt = parsed.prompt_hasil || cleanJson;
        generatedTagline = parsed.tagline || `${interest} | ${tone}`;
      } catch (parseError) {
        generatedSystemPrompt = response.trim();
        generatedTagline = `${interest} | ${tone}`;
      }
    } catch (e) {
      console.error('Gagal generate prompt:', e);
      // Fallback ke template hardcode jika gagal
      generatedSystemPrompt = `Kamu adalah persona khusus bernama ${name}. Minat/Keahlian kamu adalah: ${interest}. Gaya bicara dan penyampaianmu harus: ${tone}. Kamu harus bertindak sebagai: ${type} (jika afirmasi: selalu mendukung, jika debat: suka berdebat, jika devil: selalu mengambil sudut pandang berlawanan untuk menguji argumen pengguna). Jangan keluar dari karakter ini.`;
      generatedTagline = `${interest} | ${tone}`;
    }

    const newPersona = {
      id: editingPersona ? editingPersona.id : `custom-${Date.now()}`,
      name,
      avatar: `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(name)}`,
      welcomeMessage: `Halo, saya ${name}. Berbicara tentang ${interest} dengan gaya ${tone} adalah keahlian saya!`,
      systemPrompt: generatedSystemPrompt.trim(),
      slug: 'custom',
      description: generatedTagline,
      baseModel: baseModel,
      interest: interest,
      tone: tone
    };

    if (editingPersona) {
      updateCustomPersona(newPersona);
    } else {
      addCustomPersona(newPersona);
    }
    setIsSaving(false);
    handleBack();
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#f0f2f5] animate-slide-in-right z-30">
      {/* Header */}
      <div className="h-[60px] bg-[#f0f2f5] flex items-center shrink-0 px-4 shadow-sm border-b border-[#e9edef] text-[#111b21] z-10">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="text-[#54656f] hover:bg-black/5 p-2 rounded-full transition-colors flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-medium leading-none mt-1">{editingPersona ? 'Edit Persona' : 'Persona Baru'}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 bg-[#f0f2f5] scrollbar-thin">
        <div className="bg-white rounded-lg shadow-sm p-5 md:p-8 max-w-2xl mx-auto flex flex-col gap-6">

          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-[#f0f2f5] overflow-hidden flex items-center justify-center border-2 border-transparent">
              {name ? (
                <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(name)}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#8696a0] text-xs text-center px-4 leading-tight">Ketik nama untuk avatar</span>
              )}
            </div>
            <p className="text-xs text-[#8696a0]">Avatar di-generate oleh DiceBear</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-[#008069] font-medium block mb-1.5">Nama Persona</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Budi Sang Debater"
                className="w-full border-b-2 border-[#8696a0] focus:border-[#008069] bg-transparent outline-none py-2 text-[#111b21] transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-[#008069] font-medium block mb-1.5">Interest / Keahlian</label>
              <input
                type="text"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="Misal: Teknologi, Memasak, Filsafat"
                className="w-full border-b-2 border-[#8696a0] focus:border-[#008069] bg-transparent outline-none py-2 text-[#111b21] transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-[#008069] font-medium block mb-1.5">Gaya Penyampaian (Tone)</label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Misal: Sarkas, Santai, Penuh motivasi"
                className="w-full border-b-2 border-[#8696a0] focus:border-[#008069] bg-transparent outline-none py-2 text-[#111b21] transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-[#008069] font-medium block mb-2">Jenis Karakter</label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="type" value="afirmasi" checked={type === 'afirmasi'} onChange={() => setType('afirmasi')} className="w-4 h-4 text-[#008069] focus:ring-[#008069]" />
                  <span className="text-[#111b21] text-sm group-hover:text-[#008069]">Afirmasi (Mendukung & Positif)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="type" value="debat" checked={type === 'debat'} onChange={() => setType('debat')} className="w-4 h-4 text-[#008069] focus:ring-[#008069]" />
                  <span className="text-[#111b21] text-sm group-hover:text-[#008069]">Debat (Kritis & Argumentatif)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="type" value="devil" checked={type === 'devil'} onChange={() => setType('devil')} className="w-4 h-4 text-[#008069] focus:ring-[#008069]" />
                  <span className="text-[#111b21] text-sm group-hover:text-[#008069]">Devil's Advocate (Selalu berlawanan)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm text-[#008069] font-medium block mb-2">Model Dasar (AI Backend)</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isLoadingModels && !selectedModelData}
                  className="w-full bg-[#f0f2f5] border border-[#e9edef] text-[#111b21] rounded-md py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#008069] flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3 truncate">
                    {selectedModelIconUrl ? (
                      <img src={selectedModelIconUrl} alt="icon" className="w-5 h-5 object-contain shrink-0" />
                    ) : (
                      <Bot size={20} className="text-[#54656f] shrink-0" />
                    )}
                    <span className="truncate text-[#111b21]">{selectedModelData ? selectedModelData.name : (baseModel || 'Pilih model...')}</span>
                  </div>
                  {isLoadingModels && !selectedModelData ? (
                    <CircleDashed size={16} className="animate-spin text-[#008069] shrink-0" />
                  ) : (
                    <ChevronDown size={18} className={`text-[#54656f] transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e9edef] rounded-md shadow-lg z-50 overflow-hidden animate-fade-in">
                    <div className="p-2 border-b border-[#f0f2f5] sticky top-0 bg-white z-10">
                      <div className="flex items-center gap-2 bg-[#f0f2f5] rounded px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#008069]">
                        <Search size={16} className="text-[#54656f]" />
                        <input
                          type="text"
                          placeholder="Cari model AI..."
                          value={modelSearchQuery}
                          onChange={(e) => setModelSearchQuery(e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-sm text-[#111b21]"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto scrollbar-thin">
                      {isLoadingModels ? (
                        <div className="p-4 text-center text-sm text-[#54656f] flex items-center justify-center gap-2">
                          <CircleDashed size={16} className="animate-spin text-[#008069]" /> Mencari...
                        </div>
                      ) : openRouterModels.length > 0 ? (
                        openRouterModels.map((m) => {
                          const icon = getModelIcon(m.name, m.endpoint?.provider_info?.icon?.url);
                          return (
                            <div
                              key={m.slug || m.id}
                              onClick={() => {
                                setBaseModel(m.slug || m.id);
                                setIsDropdownOpen(false);
                                setModelSearchQuery('');
                              }}
                              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[#f5f6f6] transition-colors ${baseModel === (m.slug || m.id) ? 'bg-[#f0f2f5]' : ''}`}
                            >
                              <div className="shrink-0 w-7 h-7 flex items-center justify-center bg-white rounded-full border border-[#e9edef] overflow-hidden">
                                {icon ? <img src={icon} alt={m.name} className="w-4 h-4 object-contain" /> : <Bot size={16} className="text-[#54656f]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[13px] font-medium text-[#111b21] truncate leading-tight">{m.name}</h4>
                                <p className="text-[11px] text-[#8696a0] truncate mt-0.5">{m.slug || m.id}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-sm text-[#54656f]">Model tidak ditemukan.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSuggest}
            className="self-start text-[#008069] text-sm font-medium hover:underline py-1 mt-2"
          >
            💡 Berikan saran personal lainnya (Isi Otomatis)
          </button>
        </div>
      </div>

      <div className="bg-[#f0f2f5] p-6 flex justify-center shrink-0">
        <button
          onClick={handleSave}
          disabled={!name.trim() || isSaving}
          className="bg-[#008069] text-white px-8 py-3 rounded-md shadow-md hover:bg-[#06cf9c] transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <CircleDashed size={20} className="animate-spin" />
              Menghasilkan Persona...
            </>
          ) : (
            <>
              <Check size={20} />
              Simpan Persona
            </>
          )}
        </button>
      </div>
    </div>
  );
}
