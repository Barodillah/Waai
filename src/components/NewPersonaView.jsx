import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, CircleDashed, ChevronDown, Search, Bot, Settings, Trash2, Plus } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { callOpenRouterAPI } from '../utils/api';
import { getPersonaAvatar } from '../utils/avatar';
import ModelSearchModal from './ModelSearchModal';

export default function NewPersonaView() {
  const { setActiveProfileFeature, setActiveMobileTab, addCustomPersona, updateCustomPersona, editingPersona, setEditingPersona, openRouterApiKey, showToast, showApiKeyModal } = useChat();

  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [interest, setInterest] = useState('');
  const [tone, setTone] = useState('');
  const [types, setTypes] = useState(['afirmasi']); // afirmasi, debat, devil, etc
  const [customTypeInput, setCustomTypeInput] = useState('');
  const [baseModel, setBaseModel] = useState('');

  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [selectedModelData, setSelectedModelData] = useState(null);
  const [selectedModelIconUrl, setSelectedModelIconUrl] = useState(null);

  const [advancedSettings, setAdvancedSettings] = useState([]);
  const [showAdvanceSettings, setShowAdvanceSettings] = useState(false);

  useEffect(() => {
    if (editingPersona) {
      setName(editingPersona.name);
      setInterest(editingPersona.interest || '');
      setTone(editingPersona.tone || '');

      const existingType = editingPersona.characterType || 'afirmasi';
      setTypes(existingType.split(', ').filter(Boolean));

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
        } catch (e) { }
      }

      if (editingPersona.advancedSettings && Array.isArray(editingPersona.advancedSettings)) {
        setAdvancedSettings(editingPersona.advancedSettings);
      } else {
        setAdvancedSettings([]);
      }
    } else {
      setName('');
      setInterest('');
      setTone('');
      setTypes(['afirmasi']);
      setCustomTypeInput('');
      setBaseModel('');
      setSelectedModelData(null);
      setSelectedModelIconUrl(null);
      setAdvancedSettings([]);
      setShowAdvanceSettings(false);
    }
  }, [editingPersona]);

  const handleBack = () => {
    if (setEditingPersona) setEditingPersona(null);
    setActiveProfileFeature('default');
  };

  const addAdvanceSetting = () => {
    setAdvancedSettings([...advancedSettings, { key: '', value: '' }]);
  };

  const updateAdvanceSetting = (index, field, value) => {
    const newSettings = [...advancedSettings];
    newSettings[index][field] = value;
    setAdvancedSettings(newSettings);
  };

  const removeAdvanceSetting = (index) => {
    const newSettings = [...advancedSettings];
    newSettings.splice(index, 1);
    setAdvancedSettings(newSettings);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    if (!openRouterApiKey) {
      showApiKeyModal();
      return;
    }

    setIsSaving(true);
    let generatedSystemPrompt = '';
    let generatedTagline = '';
    let generatedWelcomeMessage = '';

    try {
      const advSettingsStr = advancedSettings.filter(s => s.key && s.value).map(s => `- ${s.key}: ${s.value}`).join('\n');
      const advSettingsPrompt = advSettingsStr ? `\nPengaturan Tambahan (PENTING):\n${advSettingsStr}` : '';

      const promptToAI = `Buat system prompt spesifik (maks 3 paragraf) untuk AI ini:
Nama: ${name}
Minat: ${interest}
Gaya: ${tone}
Sifat: ${types.join(', ')}${advSettingsPrompt}

PENTING: Instruksikan AI untuk BENAR-BENAR mengadopsi identitas bernama "${name}". AI HARUS menggunakan nama "${name}" saat merespons, memperkenalkan diri, atau menyebut dirinya sendiri (jangan menggunakan "saya adalah asisten AI" atau entitas bahasa lainnya). Jika pengguna memanggil dengan nama "${name}", AI harus merespons secara natural sebagai identitas tersebut tanpa keluar dari karakter. Pastikan instruksi dari Pengaturan Tambahan juga dimuat kuat ke dalam system prompt.

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
      generatedSystemPrompt = `Kamu adalah persona khusus bernama ${name}. Nama kamu adalah ${name} dan kamu harus SELALU menyebut dirimu sebagai ${name} dalam percakapan. Jika pengguna memanggil namamu, responslah sebagai ${name}. Minat/Keahlian kamu adalah: ${interest}. Gaya bicara dan penyampaianmu harus: ${tone}. Kamu harus bertindak sebagai: ${types.join(', ')} (jika afirmasi: selalu mendukung, jika debat: suka berdebat, jika devil: selalu mengambil sudut pandang berlawanan untuk menguji argumen pengguna). Jangan pernah mengungkapkan bahwa kamu adalah AI, tetaplah berada dalam karakter ${name}.`;
      generatedTagline = `${interest} | ${tone}`;
    }

    const newPersona = {
      id: editingPersona ? editingPersona.id : `custom-${Date.now()}`,
      name,
      avatar: getPersonaAvatar(name),
      welcomeMessage: generatedWelcomeMessage || `Halo, saya ${name}. Berbicara tentang ${interest} dengan gaya ${tone} adalah keahlian saya!`,
      systemPrompt: generatedSystemPrompt.trim(),
      slug: 'custom',
      description: generatedTagline,
      baseModel: baseModel,
      interest: interest,
      tone: tone,
      characterType: types.join(', '),
      advancedSettings: advancedSettings.filter(s => s.key && s.value)
    };

    try {
      if (editingPersona) {
        await updateCustomPersona(newPersona);
      } else {
        await addCustomPersona(newPersona);
      }
      handleBack();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
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
                <img src={getPersonaAvatar(name)} alt="Avatar" className="w-full h-full object-cover" />
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
              <label className="text-sm text-[#008069] font-medium block mb-2">Jenis Karakter (Bisa pilih &gt;1)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['afirmasi', 'debat', 'devil'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      if (types.includes(t)) {
                        setTypes(types.filter(x => x !== t));
                      } else {
                        setTypes([...types, t]);
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${types.includes(t) ? 'bg-[#d9fdd3] text-[#008069]' : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]'}`}
                  >
                    {t === 'afirmasi' ? 'Afirmasi' : t === 'debat' ? 'Debat' : "Devil's Advocate"}
                  </button>
                ))}

                {/* Render custom types as well so they can be deselected */}
                {types.filter(t => !['afirmasi', 'debat', 'devil'].includes(t)).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTypes(types.filter(x => x !== t));
                    }}
                    className="px-3 py-1 rounded-full text-[13px] font-medium transition-colors bg-[#d9fdd3] text-[#008069] flex items-center gap-1.5 border border-[#c3f4bb]"
                  >
                    {t} <span className="text-[#008069] font-bold">&times;</span>
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={customTypeInput}
                onChange={(e) => setCustomTypeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const val = customTypeInput.trim().replace(/,$/, '');
                    if (val && !types.includes(val)) {
                      setTypes([...types, val]);
                    }
                    setCustomTypeInput('');
                  }
                }}
                placeholder="Ketik tag karakter custom & tekan Enter/Koma"
                className="w-full border-b-2 border-[#8696a0] focus:border-[#008069] bg-transparent outline-none py-2 text-[#111b21] transition-colors mt-2 text-sm"
              />
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

          <div className="pt-4 border-t border-[#e9edef]">
            <button
              onClick={() => {
                if (!showAdvanceSettings && advancedSettings.length === 0) {
                  setAdvancedSettings([{ key: '', value: '' }]);
                }
                setShowAdvanceSettings(!showAdvanceSettings);
              }}
              className="flex items-center gap-2 text-[#008069] text-sm font-medium hover:bg-[#f0f2f5] py-2 px-3 -mx-3 rounded-md w-[calc(100%+1.5rem)] text-left transition-colors"
            >
              <ChevronDown size={18} className={`transform transition-transform ${showAdvanceSettings ? 'rotate-180' : ''}`} />
              <Settings size={18} className="text-[#008069]" />
              Pengaturan Lanjutan (Advance Settings)
            </button>
            
            {showAdvanceSettings && (
              <div className="mt-3 flex flex-col gap-3">
                <p className="text-xs text-[#54656f] mb-1 px-1">
                  Tambahkan parameter unik seperti "Nama Panggilan", "Bahasa", atau larangan tertentu agar AI lebih spesifik.
                </p>
                
                <div className="flex flex-col gap-0 mb-2 bg-white rounded-xl border border-[#e9edef] overflow-hidden">
                  {advancedSettings.length > 0 && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-[#f0f2f5] border-b border-[#e9edef]">
                      <div className="w-1/3 text-[10px] text-[#54656f] uppercase font-semibold">Parameter</div>
                      <div className="flex-1 text-[10px] text-[#54656f] uppercase font-semibold">Nilai</div>
                      <div className="w-6"></div>
                    </div>
                  )}
                  {advancedSettings.map((setting, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 ${idx !== advancedSettings.length - 1 ? 'border-b border-[#e9edef]' : ''} hover:bg-[#f5f6f6] transition-colors`}>
                      <input
                        type="text"
                        placeholder="Misal: Bahasa"
                        value={setting.key}
                        onChange={(e) => updateAdvanceSetting(idx, 'key', e.target.value)}
                        className="w-1/3 text-sm font-medium text-[#111b21] bg-transparent border-b border-[#00a884] focus:outline-none py-1"
                      />
                      <input
                        type="text"
                        placeholder="Misal: Sunda Kasar"
                        value={setting.value}
                        onChange={(e) => updateAdvanceSetting(idx, 'value', e.target.value)}
                        className="flex-1 text-sm font-normal text-[#111b21] bg-transparent border-b border-[#00a884] focus:outline-none py-1"
                      />
                      <button
                        onClick={() => removeAdvanceSetting(idx)}
                        className="p-1.5 text-[#54656f] hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex shrink-0"
                        title="Hapus aturan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addAdvanceSetting}
                  className="self-start flex items-center gap-1 text-[#008069] text-xs font-medium bg-[#e7fce3] hover:bg-[#d9fdd3] px-3 py-2 rounded-md transition-colors mt-1"
                >
                  <Plus size={14} />
                  Tambah Aturan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#f0f2f5] p-6 flex justify-center shrink-0">
        <button
          onClick={handleSave}
          disabled={!name.trim() || types.length === 0 || isSaving}
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
