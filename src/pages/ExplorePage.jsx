import { useNavigate } from 'react-router-dom';
import { Shield, BrainCircuit, MessageSquare, Lock, ArrowRight, Download, Activity, Users, Plus, Settings, ChevronDown, Check, Bot, Sparkles } from 'lucide-react';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import AppLogo from '../components/AppLogo';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const getIconUrl = (model) => {
  const modelName = model.name.toLowerCase();
  const modelId = (model.id || '').toLowerCase();

  if (modelName.includes('gemini') || modelId.includes('google')) return 'https://openrouter.ai/images/icons/GoogleGemini.svg';
  if (modelName.includes('deepseek') || modelId.includes('deepseek')) return 'https://openrouter.ai/images/icons/DeepSeek.png';
  if (modelName.includes('openai') || modelName.includes('gpt') || modelId.includes('openai')) return 'https://openrouter.ai/images/icons/OpenAI.svg';
  if (modelName.includes('claude') || modelName.includes('anthropic') || modelId.includes('anthropic')) return 'https://openrouter.ai/images/icons/Anthropic.svg';
  if (modelName.includes('llama') || modelName.includes('meta') || modelId.includes('meta')) return 'https://openrouter.ai/images/icons/Meta.png';
  if (modelName.includes('mistral') || modelId.includes('mistral')) return 'https://openrouter.ai/images/icons/Mistral.png';
  if (modelName.includes('cohere') || modelId.includes('cohere')) return 'https://openrouter.ai/images/icons/Cohere.png';
  if (modelName.includes('qwen') || modelId.includes('qwen')) return 'https://openrouter.ai/images/icons/Qwen.png';
  if (modelName.includes('z.ai')) return 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://z.ai/&size=256';
  if (modelName.includes('xiaomi')) return 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.mi.com&size=256';
  if (modelName.includes('tencent')) return 'https://openrouter.ai/images/icons/Tencent.png';
  if (modelName.includes('minimax')) return 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://minimaxi.com/&size=256';
  if (model.icon) return model.icon;

  if (model.endpoint?.provider_info?.icon?.url) {
    return model.endpoint.provider_info.icon.url.startsWith('/')
      ? `https://openrouter.ai${model.endpoint.provider_info.icon.url}`
      : model.endpoint.provider_info.icon.url;
  }
  return null;
};

export default function ExplorePage() {
  const navigate = useNavigate();
  const [openRouterModels, setOpenRouterModels] = useState([]);
  const [isModelsLoading, setIsModelsLoading] = useState(true);
  const [activeScenario, setActiveScenario] = useState(0);

  const bubble1Ref = useRef(null);
  const bubble2Ref = useRef(null);
  const typing1Ref = useRef(null);
  const typing2Ref = useRef(null);
  const sectionsRef = useRef([]);

  useGSAP(() => {
    // 1. Hero Bubbles Load Animation
    if (bubble1Ref.current && bubble2Ref.current && typing1Ref.current && typing2Ref.current) {
      const tl = gsap.timeline({ delay: 0.5 });

      tl.fromTo(typing1Ref.current, { y: 20, opacity: 0, display: 'flex' }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' })
        .to(typing1Ref.current, { opacity: 0, duration: 0.2, delay: 0.6 })
        .set(typing1Ref.current, { display: 'none' })
        .fromTo(bubble1Ref.current, { y: 20, opacity: 0, display: 'block' }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' })

        .to({}, { duration: 0.6 })

        .fromTo(typing2Ref.current, { y: 20, opacity: 0, display: 'flex' }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' })
        .to(typing2Ref.current, { opacity: 0, duration: 0.2, delay: 0.6 })
        .set(typing2Ref.current, { display: 'none' })
        .fromTo(bubble2Ref.current, { y: 20, opacity: 0, display: 'block' }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
    }

    // 2. Sections Scroll Animation
    sectionsRef.current.forEach((section) => {
      if (section) {
        gsap.fromTo(
          section.children,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
            },
          }
        );
      }
    });
  }, []);

  const chatScenarios = [
    {
      title: "Diskusi Pekerjaan 💼",
      participants: "Anda, Bos Idaman, Ahli Bahasa",
      avatar1: "https://api.dicebear.com/9.x/micah/svg?seed=Bos",
      avatar2: "https://robohash.org/claude",
      question: "Tolong revisi email komplain ini ke vendor agar lebih profesional tapi tetap tegas.",
      name1: "Bos Idaman (Persona)",
      color1: "text-[#e23670]",
      answer1: "Gunakan kalimat ini: 'Kami menyoroti beberapa ketidaksesuaian SLA pada pengiriman bulan ini.' Tegas tanpa emosi.",
      name2: "Claude 3.5 (Model)",
      color2: "text-[#3b82f6]",
      answer2: "Setuju. Tambahkan batas waktu perbaikan eksplisit di akhir email agar mereka tahu ada konsekuensi dari keterlambatan ini."
    },
    {
      title: "Masalah Keluarga 🏡",
      participants: "Anda, Psikolog Anak, Llama",
      avatar1: "https://api.dicebear.com/9.x/micah/svg?seed=Psikolog",
      avatar2: "https://robohash.org/llama",
      question: "Anak saya yang umur 10 tahun kecanduan main gadget, saya harus bagaimana?",
      name1: "Bu Rina (Psikolog - Persona)",
      color1: "text-[#ff9800]",
      answer1: "Memutus akses tiba-tiba bisa memicu tantrum. Mulailah perlahan dengan membuat kesepakatan zona bebas gadget (misal di meja makan).",
      name2: "Llama 3 (Model)",
      color2: "text-[#9c27b0]",
      answer2: "Penting juga memberikan aktivitas pengganti. Jika Anda hanya melarang tanpa memberi alternatif, mereka akan bosan dan berontak."
    },
    {
      title: "Rencana Liburan 🏖️",
      participants: "Anda, Si Petualang, Gemini",
      avatar1: "https://api.dicebear.com/9.x/micah/svg?seed=Petualang",
      avatar2: "https://robohash.org/gemini",
      question: "Rekomendasi liburan 3 hari ke Bali yang antimainstream dong. Bosan ke Kuta terus.",
      name1: "Bli Wayan (Guide - Persona)",
      color1: "text-[#4caf50]",
      answer1: "Lewati Kuta! Coba ke Sidemen di Karangasem. Suasananya sejuk seperti Ubud 20 tahun lalu. Hamparan sawahnya luar biasa.",
      name2: "Gemini 1.5 (Model)",
      color2: "text-[#f44336]",
      answer2: "Saran yang bagus. Tapi perlu dicatat fasilitas transportasi publik di Sidemen minim. Sebaiknya Anda menyewa mobil atau motor dari bandara."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScenario(prev => (prev + 1) % chatScenarios.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('https://openrouter.ai/api/frontend/v1/models/find?active=true&order=most-popular&output_modalities=text');
        if (!res.ok) throw new Error("Failed to fetch models");
        const json = await res.json();
        setOpenRouterModels(json.data.models.slice(0, 20));
      } catch (err) {
        setOpenRouterModels([
          { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
          { id: "deepseek/deepseek-chat", name: "DeepSeek V3" },
          { id: "openai/gpt-4o", name: "GPT-4o" },
          { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro" },
          { id: "meta-llama/llama-3-70b-instruct", name: "Llama 3 70B" },
          { id: "qwen/qwen-2.5-coder-32b", name: "Qwen 2.5 Coder" },
          { id: "anthropic/claude-3-opus", name: "Claude 3 Opus" },
          { id: "deepseek/deepseek-coder", name: "DeepSeek Coder" },
          { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
          { id: "google/gemini-1.5-flash", name: "Gemini 1.5 Flash" },
          { id: "meta-llama/llama-3-8b-instruct", name: "Llama 3 8B" },
          { id: "qwen/qwen-2-72b", name: "Qwen 2 72B" },
          { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku" },
          { id: "mistral/mistral-large", name: "Mistral Large" },
          { id: "cohere/command-r-plus", name: "Command R+" },
          { id: "databricks/dbrx-instruct", name: "DBRX Instruct" },
          { id: "microsoft/wizardlm-2-8x22b", name: "WizardLM-2" },
          { id: "01-ai/yi-34b-chat", name: "Yi 34B Chat" },
          { id: "google/gemma-7b-it", name: "Gemma 7B" },
          { id: "perplexity/llama-3-sonar-large", name: "Sonar Large" }
        ]);
      } finally {
        setIsModelsLoading(false);
      }
    };
    fetchModels();
  }, []);

  return (
    <div className="min-h-screen bg-[#FCF5EB] text-[#111B21] font-sans selection:bg-[#25d366] selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#FCF5EB]/90 backdrop-blur-md border-b border-[#111B21]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/auth')}>
            <AppLogo className="w-8 h-8 text-[#25d366]" />
            <h1 className="text-2xl font-bold text-[#25d366] tracking-tight">WhatsAI</h1>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="bg-[#25d366] hover:bg-[#20bd5a] text-[#111B21] px-5 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2"
          >
            Masuk
            <ArrowRight size={18} />
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight mb-6">
              Berkirim pesan dengan AI secara privat
            </h1>
            <p className="text-xl md:text-2xl text-[#111B21]/80 mb-10 max-w-2xl leading-relaxed">
              Dengan WhatsAI, Anda bisa mengobrol dengan teman cerdas favorit Anda dalam satu platform yang simpel, andal, dan aman.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-[#25d366] hover:bg-[#20bd5a] text-[#111B21] px-8 py-4 rounded-full font-bold text-lg transition-colors flex items-center gap-3 mx-auto md:mx-0 shadow-lg"
            >
              Coba Sekarang Gratis
            </button>
          </div>
          <div className="flex-1 w-full relative">
            <img
              src="https://bewhy.id/wp-content/uploads/asset_6a9cc5295baa74.31333239.jpg"
              alt="Orang sedang menggunakan handphone tersenyum"
              className="rounded-3xl shadow-2xl object-cover h-[500px] w-full"
            />
            {/* Dekorasi mengambang ala chat */}
            <div ref={typing1Ref} className="absolute top-10 -left-6 bg-[#dcf8c7] px-5 py-4 rounded-2xl rounded-tl-sm shadow-xl opacity-0 hidden gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-[#005c4b]/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#005c4b]/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#005c4b]/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <div ref={bubble1Ref} className="absolute top-10 -left-6 bg-[#dcf8c7] p-4 rounded-2xl rounded-tl-sm shadow-xl opacity-0 hidden">
              <p className="text-[#111b21] font-medium text-sm">"Bro, ada rekomendasi film seru nggak buat malam ini?"</p>
            </div>

            <div ref={typing2Ref} className="absolute bottom-20 -right-6 bg-white px-5 py-4 rounded-2xl rounded-tr-sm shadow-xl opacity-0 hidden gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <div ref={bubble2Ref} className="absolute bottom-20 -right-6 bg-white p-4 rounded-2xl rounded-tr-sm shadow-xl opacity-0 hidden">
              <p className="text-[#111b21] font-medium text-sm">"Coba nonton Interstellar deh! Dijamin mindblowing! 🤯"</p>
            </div>
          </div>
        </section>

        {/* Floating Avatars / Quote Section */}
        <section ref={(el) => { if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el); }} className="bg-[#FCF5EB] py-8 md:py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4 md:gap-8 overflow-hidden">

          {/* Top Avatars (5 items) */}
          <div className="relative w-full max-w-6xl h-32 md:h-48 mx-auto">
            {/* Avatar 1 (Mobile Visible) */}
            <div className="absolute top-[15%] left-[5%] md:left-[10%] animate-[bounce_8s_infinite]">
              <div className="relative w-10 md:w-14 h-10 md:h-14">
                <img src="https://api.dicebear.com/9.x/micah/svg?seed=Mia" alt="Persona" className="w-full h-full rounded-full shadow-lg border-2 border-white object-cover bg-white relative z-10" />
              </div>
            </div>

            {/* Avatar 2 */}
            <div className="absolute top-[65%] left-[25%] animate-[bounce_10s_infinite_reverse] hidden md:block">
              <div className="relative w-12 h-12">
                <img src="https://robohash.org/claude3" alt="Model" className="w-full h-full rounded-full shadow-lg border-2 border-white object-cover bg-white p-1 relative z-10" />
                <div className="absolute top-1/2 -translate-y-1/2 left-full ml-2 bg-[#dcf8c7] px-3 py-1.5 rounded-full rounded-tl-sm shadow-md text-sm font-semibold text-[#111b21] whitespace-nowrap">Mari berdiskusi!</div>
              </div>
            </div>

            {/* Avatar 3 (Mobile Visible) */}
            <div className="absolute top-[20%] right-[15%] md:right-[20%] animate-[bounce_11s_infinite]">
              <div className="relative w-10 md:w-12 h-10 md:h-12">
                <img src="https://api.dicebear.com/9.x/micah/svg?seed=Budi" alt="Persona" className="w-full h-full rounded-full shadow-lg border-2 border-white object-cover bg-white relative z-10" />
                <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 bg-white px-3 py-1.5 rounded-full rounded-tr-sm shadow-md text-xs md:text-sm font-semibold text-[#111b21] whitespace-nowrap">Halo! 👋</div>
              </div>
            </div>

            {/* Avatar 4 */}
            <div className="absolute top-[70%] right-[35%] animate-[bounce_9s_infinite] hidden md:block">
              <div className="relative w-14 h-14">
                <img src="https://robohash.org/gpt4" alt="Model" className="w-full h-full rounded-full shadow-lg border-2 border-white object-cover bg-white p-1 relative z-10" />
              </div>
            </div>

            {/* Avatar 5 */}
            <div className="absolute top-[10%] left-[45%] animate-[bounce_12s_infinite_reverse]">
              <div className="relative w-10 h-10">
                <img src="https://api.dicebear.com/9.x/micah/svg?seed=Siti" alt="Persona" className="w-full h-full rounded-full shadow-lg border-2 border-white object-cover bg-white relative z-10" />
              </div>
            </div>
          </div>

          {/* Teks Utama */}
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-medium text-[#111B21] leading-tight md:leading-snug">
              Dengan teman AI secara privat, Anda bebas berekspresi tanpa takut menyinggung perasaan, serta menjadikannya ruang aman untuk menyimulasikan berbagai skenario kehidupan nyata.
            </h2>
          </div>

          {/* Bottom Avatars (5 items) */}
          <div className="relative w-full max-w-6xl h-32 md:h-48 mx-auto">
            {/* Avatar 6 (Mobile Visible) */}
            <div className="absolute top-[25%] right-[10%] animate-[bounce_12s_infinite]">
              <div className="relative w-10 md:w-14 h-10 md:h-14">
                <img src="https://api.dicebear.com/9.x/micah/svg?seed=Rio" alt="Persona" className="w-full h-full rounded-full shadow-lg border-2 border-white object-cover bg-white relative z-10" />
                <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 bg-white px-3 py-1.5 rounded-full rounded-tr-sm shadow-md text-xs md:text-sm font-semibold text-[#111b21] whitespace-nowrap">Tentu saja!</div>
              </div>
            </div>

            {/* Avatar 7 */}
            <div className="absolute top-[75%] left-[20%] animate-[bounce_9s_infinite_reverse] hidden md:block">
              <div className="relative w-12 h-12">
                <img src="https://robohash.org/gemini" alt="Model" className="w-full h-full rounded-full shadow-lg border-2 border-white object-cover bg-white p-1 relative z-10" />
                <div className="absolute top-1/2 -translate-y-1/2 left-full ml-2 bg-[#dcf8c7] px-3 py-1.5 rounded-full rounded-tl-sm shadow-md text-sm font-semibold text-[#111b21] whitespace-nowrap">Bisa, bos!</div>
              </div>
            </div>

            {/* Avatar 8 */}
            <div className="absolute top-[20%] left-[40%] animate-[bounce_11s_infinite]">
              <div className="relative w-10 h-10">
                <img src="https://api.dicebear.com/9.x/micah/svg?seed=J" alt="Persona" className="w-full h-full rounded-full shadow-lg border-2 border-white object-cover bg-white relative z-10" />
              </div>
            </div>

            {/* Avatar 9 */}
            <div className="absolute top-[60%] right-[30%] animate-[bounce_8s_infinite] hidden md:block">
              <div className="relative w-14 h-14">
                <img src="https://robohash.org/llama" alt="Model" className="w-full h-full rounded-full shadow-lg border-2 border-white object-cover bg-[#f0f2f5] p-1 relative z-10" />
                <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 bg-white px-3 py-1.5 rounded-full rounded-tr-sm shadow-md text-sm font-semibold text-[#111b21] whitespace-nowrap">Siap!</div>
              </div>
            </div>

            {/* Avatar 10 */}
            <div className="absolute top-[50%] left-[10%] animate-[bounce_10s_infinite_reverse]">
              <div className="relative w-12 h-12">
                <img src="https://robohash.org/mistral" alt="Model" className="w-full h-full rounded-full shadow-lg border-2 border-white object-cover bg-[#e9edef] p-1 relative z-10" />
              </div>
            </div>
          </div>

        </section>

        {/* Fitur 1: OpenRouter Models */}
        <section ref={(el) => { if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el); }} className="bg-[#111B21] text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">Didukung oleh OpenRouter</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Bebas memilih kecerdasan buatan mana yang ingin Anda ajak bicara. Kami menyediakan akses ke model-model terbaik dunia.
              </p>
            </div>

            <div className="relative w-full overflow-hidden flex flex-col gap-3 py-4">
              <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#111B21] to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#111B21] to-transparent z-10 pointer-events-none"></div>

              {isModelsLoading ? (
                <div className="flex flex-col gap-4 items-center justify-center py-8">
                  <Activity className="h-8 w-8 text-[#25d366] animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex w-max animate-[marquee-left_40s_linear_infinite] hover:[animation-play-state:paused]">
                    {[...(openRouterModels || []).slice(0, 10), ...(openRouterModels || []).slice(0, 10)].map((model, index) => {
                      const iconUrl = getIconUrl(model);

                      return (
                        <div key={`row1-${index}`} className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-full px-4 py-2 mx-2 whitespace-nowrap shadow-sm hover:bg-white/20 transition-colors cursor-pointer">
                          <div className="w-6 h-6 flex items-center justify-center shrink-0">
                            {iconUrl ? <img src={iconUrl} alt={model.name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none' }} /> : <Activity size={16} className="text-white/50" />}
                          </div>
                          <span className="text-sm font-semibold text-white/90">{model.name}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex w-max animate-[marquee-right_45s_linear_infinite] hover:[animation-play-state:paused]">
                    {[...(openRouterModels || []).slice(10, 20), ...(openRouterModels || []).slice(10, 20)].map((model, index) => {
                      const iconUrl = getIconUrl(model);

                      return (
                        <div key={`row2-${index}`} className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-full px-4 py-2 mx-2 whitespace-nowrap shadow-sm hover:bg-white/20 transition-colors cursor-pointer">
                          <div className="w-6 h-6 flex items-center justify-center shrink-0">
                            {iconUrl ? <img src={iconUrl} alt={model.name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none' }} /> : <Activity size={16} className="text-white/50" />}
                          </div>
                          <span className="text-sm font-semibold text-white/90">{model.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Fitur Tambahan: Custom Persona */}
        <section ref={(el) => { if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el); }} className="bg-[#FCF5EB] py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-[#111b21]">Rancang Teman Anda</h2>
            <p className="text-xl text-[#111B21]/80 mb-8 leading-relaxed">
              Buat persona kustom khusus untuk bermain peran (roleplay). Tentukan <strong className="text-[#008069]">karakter</strong>, <strong className="text-[#008069]">gaya bicara</strong>, dan sifatnya, lalu nikmati percakapan mendalam tanpa AI pernah mengaku bahwa ia adalah sebuah program komputer.
            </p>
            <ul className="space-y-4 mb-8 text-[#111b21]/80">
              <li className="flex items-center gap-3"><Check className="text-[#25d366]" size={20} /> Konsisten menjiwai peran 100% tanpa batas batasan kaku</li>
              <li className="flex items-center gap-3"><Check className="text-[#25d366]" size={20} /> Pilih spesifik otak model AI di baliknya (GPT, Claude, dll)</li>
              <li className="flex items-center gap-3"><Check className="text-[#25d366]" size={20} /> AI meta-prompting akan menyiapkan instruksi otomatis untuk Anda</li>
            </ul>
          </div>
          <div className="flex-1 w-full flex justify-center md:justify-end">
            <div className="bg-[#f0f2f5] p-6 rounded-3xl shadow-xl border border-gray-200 w-full max-w-sm rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#dcf8c7] rounded-full flex items-center justify-center p-1 shadow-sm">
                  <img src="https://api.dicebear.com/9.x/micah/svg?seed=Budi" alt="Budi" className="w-full h-full rounded-full" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-[#111b21]">Budi Sang Kritis</h4>
                  <p className="text-sm text-gray-500">Teknologi | Sarkas & Kritis</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-[11px] font-bold text-[#008069] uppercase tracking-wider block mb-1">Minat / Keahlian</span>
                  <p className="text-sm text-[#111b21] font-medium">Teknologi, Web Development</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-[11px] font-bold text-[#008069] uppercase tracking-wider block mb-1">Gaya Penyampaian (Tone)</span>
                  <p className="text-sm text-[#111b21] font-medium">Sarkas, Blak-blakan, Logis</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <span className="bg-[#d9fdd3] text-[#008069] px-3 py-1.5 text-xs font-bold rounded-full border border-[#c3f4bb] shadow-sm">Debat</span>
                  <span className="bg-[#d9fdd3] text-[#008069] px-3 py-1.5 text-xs font-bold rounded-full border border-[#c3f4bb] shadow-sm">Devil's Advocate</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fitur Tambahan: Group Chat */}
        <section ref={(el) => { if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el); }} className="bg-[#111b21] py-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
          {/* Background decorative blob */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#25d366]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-[#25d366]/20 p-3 rounded-2xl shrink-0">
                  <Users className="text-[#25d366]" size={32} />
                </div>
                <h2 className="text-4xl md:text-5xl font-semibold">Grup Obrolan</h2>
              </div>
              <p className="text-xl text-white/70 mb-10 leading-relaxed">
                Mengapa ngobrol sendirian jika Anda bisa membuat grup diskusi dengan berbagai AI? Masukkan persona kustom dan model top dunia ke dalam satu ruangan, berikan topik, dan saksikan mereka <strong className="text-[#25d366] font-semibold">berdiskusi atau berdebat secara mandiri</strong>.
              </p>
              <button onClick={() => navigate('/auth')} className="bg-transparent border border-white/30 hover:border-white px-8 py-3 rounded-full font-bold transition-colors inline-flex items-center gap-2">
                Eksplorasi Sekarang <ArrowRight size={18} />
              </button>
            </div>

            <div className="flex-1 w-full">
              <div className="bg-[#efeae2] relative rounded-[2.5rem] shadow-2xl border-8 border-[#2a3942] overflow-hidden flex flex-col h-[500px]">
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0 chat-bg"></div>

                {/* Chat Header */}
                <div className="bg-[#f0f2f5] relative z-10 px-4 py-3 flex items-center gap-3 border-b border-[#e9edef] shrink-0">
                  <div className="flex -space-x-3 transition-all duration-500">
                    <img src={chatScenarios[activeScenario].avatar1} className="w-10 h-10 rounded-full border-2 border-[#f0f2f5] bg-white object-cover" />
                    <img src={chatScenarios[activeScenario].avatar2} className="w-10 h-10 rounded-full border-2 border-[#f0f2f5] bg-white object-cover p-0.5" />
                  </div>
                  <div className="transition-all duration-500 flex flex-col justify-center">
                    <h4 className="font-semibold text-[#111b21] text-[15px] leading-tight">{chatScenarios[activeScenario].title}</h4>
                    <p className="text-[13px] text-[#667781] mt-0.5">{chatScenarios[activeScenario].participants}</p>
                  </div>
                </div>
                {/* Chat Body */}
                <div key={activeScenario} className="flex-1 p-5 flex flex-col gap-4 overflow-hidden relative z-10 bg-transparent animate-in fade-in duration-500">
                  <div className="self-end bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md relative z-10 text-[15px]">
                    {chatScenarios[activeScenario].question}
                  </div>

                  <div className="self-start bg-white text-[#111b21] p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] shadow-md relative z-10">
                    <span className={`${chatScenarios[activeScenario].color1} text-xs font-bold block mb-1`}>{chatScenarios[activeScenario].name1}</span>
                    <p className="text-[15px] leading-relaxed">{chatScenarios[activeScenario].answer1}</p>
                  </div>

                  <div className="self-start bg-white text-[#111b21] p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] shadow-md relative z-10">
                    <span className={`${chatScenarios[activeScenario].color2} text-xs font-bold block mb-1`}>{chatScenarios[activeScenario].name2}</span>
                    <p className="text-[15px] leading-relaxed">{chatScenarios[activeScenario].answer2}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fitur 2: Desain Familiar */}
        <section ref={(el) => { if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el); }} className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-semibold mb-6">Ngobrol selayaknya dengan teman</h2>
            <p className="text-xl text-[#111B21]/80 mb-8 leading-relaxed">
              Kami mendesain WhatsAI agar terasa persis seperti aplikasi perpesanan yang Anda gunakan setiap hari. Tidak perlu adaptasi, langsung bisa dipakai.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="bg-[#25d366]/20 p-3 rounded-full mt-1">
                  <MessageSquare className="text-[#008069]" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Antarmuka Chat Familiar</h4>
                  <p className="text-[#111B21]/70">Tata letak yang sama dengan WhatsApp.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-[#25d366]/20 p-3 rounded-full mt-1">
                  <Download className="text-[#008069]" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Cepat dan Ringan</h4>
                  <p className="text-[#111B21]/70">Performa tinggi tanpa loading yang mengganggu.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="hidden md:block flex-1 w-full">
            <img
              src="https://bewhy.id/wp-content/uploads/asset_6a9dd9d0ddc5c3.28191066.jpg"
              alt="Orang mengetik di keyboard"
              className="rounded-3xl shadow-xl w-full h-[400px] object-cover"
            />
          </div>
        </section>

        {/* Fitur 3: Privacy */}
        <section ref={(el) => { if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el); }} className="bg-[#e9edef] py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <Lock size={28} className="text-[#008069]" />
                <h2 className="text-3xl font-bold text-[#111b21]">End-to-End Encryption</h2>
              </div>
              <p className="text-lg text-[#111B21]/70 mb-8 leading-relaxed max-w-md mx-auto md:mx-0">
                Pesan Anda dikunci secara otomatis. Tidak ada pihak lain, <strong>bahkan kami</strong> tidak dapat mengintip percakapan privasi Anda dengan teman AI.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="bg-[#25d366] hover:bg-[#20bd5a] text-[#111B21] px-6 py-3 rounded-full font-bold transition-colors inline-flex items-center gap-2"
              >
                Mulai Mengobrol Aman <ArrowRight size={18} />
              </button>
            </div>

            <div className="flex-1 w-full flex justify-center mt-6 md:mt-0">
              {/* Visualisasi E2E */}
              <div className="flex items-center justify-between w-full max-w-md bg-[#f0f2f5] p-6 md:p-8 rounded-3xl border border-gray-200 shadow-inner">
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                    <Shield size={28} className="text-[#008069]" />
                  </div>
                  <span className="text-sm font-bold text-gray-500">Anda</span>
                </div>

                <div className="flex-1 flex items-center justify-center relative px-2">
                  <div className="w-full h-1.5 bg-gradient-to-r from-gray-300 via-[#25d366] to-gray-300 rounded-full"></div>
                  <div className="absolute bg-[#25d366] text-white p-2.5 rounded-full ring-8 ring-[#f0f2f5] shadow-sm">
                    <Lock size={20} />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                    <BrainCircuit size={28} className="text-[#008069]" />
                  </div>
                  <span className="text-sm font-bold text-gray-500">AI</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#111B21] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <AppLogo className="w-8 h-8 text-[#25d366]" />
            <h1 className="text-2xl font-bold text-[#25d366] tracking-tight">WhatsAI</h1>
          </div>
          <div className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} WhatsAI. Semua hak dilindungi.
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <a href="/privacy" className="hover:text-[#25d366] transition-colors">Privasi</a>
            <a href="/terms" className="hover:text-[#25d366] transition-colors">Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
