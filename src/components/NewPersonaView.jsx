import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, CircleDashed, ChevronDown, Search, Bot } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { callOpenRouterAPI } from '../utils/api';
import ModelSearchModal from './ModelSearchModal';

export default function NewPersonaView() {
  const { setActiveProfileFeature, setActiveMobileTab, addCustomPersona, updateCustomPersona, editingPersona, setEditingPersona, openRouterApiKey, showToast } = useChat();

  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [interest, setInterest] = useState('');
  const [tone, setTone] = useState('');
  const [type, setType] = useState('afirmasi'); // afirmasi, debat, devil
  const [baseModel, setBaseModel] = useState('');
  
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [selectedModelData, setSelectedModelData] = useState(null);
  const [selectedModelIconUrl, setSelectedModelIconUrl] = useState(null);

  useEffect(() => {
    if (editingPersona) {
      setName(editingPersona.name);
      setInterest(editingPersona.interest || '');
      setTone(editingPersona.tone || '');
      setType(editingPersona.characterType || 'afirmasi');
      
      if (editingPersona.baseModel) {
        setBaseModel(editingPersona.baseModel);
        setSelectedModelData({ name: editingPersona.baseModel.split('/').pop() || editingPersona.baseModel });
      }
      
      if (!editingPersona.interest && editingPersona.description) {
        try {
          const parts = editingPersona.description.split(' | ');
          if (parts.length === 2) {
            setInterest(parts[0].replace('Minat: ', ''));
            setTone(parts[1].replace('Gaya: ', ''));
          }
        } catch (e) {}
      }
    }
  }, [editingPersona]);

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
    let generatedWelcomeMessage = '';

    try {
      const promptToAI = `Buat system prompt spesifik (maks 3 paragraf) untuk AI ini:
Nama: ${name}
Minat: ${interest}
Gaya: ${tone}
Sifat: ${type}

PENTING: Instruksikan AI untuk BENAR-BENAR mengadopsi identitas bernama "${name}". AI HARUS menggunakan nama "${name}" saat merespons, memperkenalkan diri, atau menyebut dirinya sendiri (jangan menggunakan "saya adalah asisten AI" atau entitas bahasa lainnya). Jika pengguna memanggil dengan nama "${name}", AI harus merespons secara natural sebagai identitas tersebut tanpa keluar dari karakter.

KEMBALIKAN HANYA JSON MURNI DENGAN FORMAT:
{
  "prompt_hasil": "isi prompt dari sudut pandang 'Kamu adalah [Nama]...'",
  "tagline": "Frasa singkat 1-3 kata yang menggambarkan profesi atau keahlian karakter ini (misal: Pakar Teknologi, Tukang Debat, Motivator Handal)",
  "sapaan": "Satu kalimat sapaan pembuka khas karakter ini (misal: 'Halo! Ada yang bisa kubantu tentang kode hari ini?' atau 'Yo! Mau ngobrolin film apa kita?')"
}`;

      const aiMessages = [{ sender: 'user', text: promptToAI }];
      // Menggunakan model google/gemini-2.5-flash agar lebih stabil di OpenRouter
      const response = await callOpenRouterAPI(aiMessages, 'google/gemini-2.5-flash', openRouterApiKey, "Kamu adalah mesin pembuat JSON murni. Jangan tambahkan penjelasan.");
      
      try {
        const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        generatedSystemPrompt = parsed.prompt_hasil || cleanJson;
        generatedTagline = parsed.tagline || `${interest} | ${tone}`;
        generatedWelcomeMessage = parsed.sapaan || '';
      } catch (parseError) {
        generatedSystemPrompt = response.trim();
        generatedTagline = `${interest} | ${tone}`;
      }
    } catch (e) {
      console.error('Gagal generate prompt:', e);
      // Fallback ke template hardcode jika gagal
      generatedSystemPrompt = `Kamu adalah persona khusus bernama ${name}. Nama kamu adalah ${name} dan kamu harus SELALU menyebut dirimu sebagai ${name} dalam percakapan. Jika pengguna memanggil namamu, responslah sebagai ${name}. Minat/Keahlian kamu adalah: ${interest}. Gaya bicara dan penyampaianmu harus: ${tone}. Kamu harus bertindak sebagai: ${type} (jika afirmasi: selalu mendukung, jika debat: suka berdebat, jika devil: selalu mengambil sudut pandang berlawanan untuk menguji argumen pengguna). Jangan pernah mengungkapkan bahwa kamu adalah AI, tetaplah berada dalam karakter ${name}.`;
      generatedTagline = `${interest} | ${tone}`;
    }

    const newPersona = {
      id: editingPersona ? editingPersona.id : `custom-${Date.now()}`,
      name,
      avatar: `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(name)}`,
      welcomeMessage: generatedWelcomeMessage || `Halo, saya ${name}. Berbicara tentang ${interest} dengan gaya ${tone} adalah keahlian saya!`,
      systemPrompt: generatedSystemPrompt.trim(),
      slug: 'custom',
      description: generatedTagline,
      baseModel: baseModel,
      interest: interest,
      tone: tone,
      characterType: type
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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setType('afirmasi')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${type === 'afirmasi' ? 'bg-[#d9fdd3] text-[#008069]' : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]'}`}
                >
                  Afirmasi
                </button>
                <button
                  type="button"
                  onClick={() => setType('debat')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${type === 'debat' ? 'bg-[#d9fdd3] text-[#008069]' : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]'}`}
                >
                  Debat
                </button>
                <button
                  type="button"
                  onClick={() => setType('devil')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${type === 'devil' ? 'bg-[#d9fdd3] text-[#008069]' : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]'}`}
                >
                  Devil's Advocate
                </button>
                <button
                  type="button"
                  onClick={() => setType('')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!['afirmasi', 'debat', 'devil'].includes(type) ? 'bg-[#d9fdd3] text-[#008069]' : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]'}`}
                >
                  Kustom
                </button>
              </div>
              
              {!['afirmasi', 'debat', 'devil'].includes(type) && (
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Ketik jenis karakter kustom (misal: Suka bercanda, Bijak)"
                  className="w-full border-b-2 border-[#8696a0] focus:border-[#008069] bg-transparent outline-none py-2 text-[#111b21] transition-colors mt-2 text-sm"
                  autoFocus
                />
              )}
            </div>

            <div>
              <label className="text-sm text-[#008069] font-medium block mb-2">Model Dasar (AI Backend)</label>
              <button
                onClick={() => setIsModelModalOpen(true)}
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
                <ChevronDown size={18} className="text-[#54656f] transition-transform shrink-0" />
              </button>
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
          disabled={!name.trim() || !type.trim() || isSaving}
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
      <ModelSearchModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        onSelect={(model, iconUrl) => {
          setBaseModel(model.slug || model.id);
          setSelectedModelData(model);
          setSelectedModelIconUrl(iconUrl);
          setIsModelModalOpen(false);
        }}
      />
    </div>
  );
}
