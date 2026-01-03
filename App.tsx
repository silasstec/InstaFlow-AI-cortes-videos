
import React, { useState, useRef } from 'react';
import { AspectRatio, Slide, CarouselData, PALETTES, ColorPalette, DesignTone, BrandingIcon, LogoPlacement, DesignStyle } from './types';
import { generateCarouselStructure, generateSlideImage, regenerateSingleSlideText } from './services/geminiService';
import SlideCard from './components/SlideCard';
import * as htmlToImage from 'html-to-image';
import JSZip from 'jszip';

const FONT_OPTIONS = [
  { name: 'Impactante (Impact)', value: "'Impact', sans-serif" },
  { name: 'Moderno (Inter)', value: "'Inter', sans-serif" },
  { name: 'Elegante (Serif)', value: "'Playfair Display', serif" },
  { name: 'Tech (Mono)', value: "'Roboto Mono', monospace" },
  { name: 'Redondo (Lexend)', value: "'Lexend', sans-serif" },
];

const LOGO_PLACEMENT_OPTIONS: { name: string, value: LogoPlacement }[] = [
  { name: 'Nenhum', value: 'None' },
  { name: 'Todos os Slides', value: 'All Slides' },
  { name: 'Início e Fim', value: 'Intro & Outro' },
  { name: 'Apenas Primeiro', value: 'First Slide' },
  { name: 'Apenas Último', value: 'Last Slide' },
  { name: 'Marca d\'água', value: 'Discrete Watermark' },
];

const TONE_OPTIONS: DesignTone[] = ['Profissional', 'Casual', 'Divertido', 'Urgente', 'Minimalista'];
const DESIGN_STYLES: DesignStyle[] = [
  'Cinematográfico', '3D Render', 'Minimalista', 'Cyberpunk', 'Aquarela', 'Fotorealista',
  'Retro/Vintage', 'Colagem Digital', 'Neon Futurista', 'Minimalista Japonês', 'Ilustração 3D', 'Editorial High-End'
];

// Emojis populares para seleção rápida
const QUICK_ICONS = ['Instagram', 'Sparkles', 'Lightning', 'Circle', '🔥', '🚀', '💡', '✨', '💎', '🎯', '📢', '✅', '❤️'];

const App: React.FC = () => {
  const [theme, setTheme] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [brandHandle, setBrandHandle] = useState('@seuusuario');
  const [tone, setTone] = useState<DesignTone>('Profissional');
  const [designStyle, setDesignStyle] = useState<DesignStyle>('Cinematográfico');
  
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(PALETTES[0]);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [logoPlacement, setLogoPlacement] = useState<LogoPlacement>('None');

  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[1].value);
  const [headlineFontSize, setHeadlineFontSize] = useState(42);
  const [bodyFontSize, setBodyFontSize] = useState(20);
  const [imageOpacity, setImageOpacity] = useState(60);
  const [brandingIcon, setBrandingIcon] = useState<BrandingIcon>('Instagram');
  const [ctaIntent, setCtaIntent] = useState('Siga para mais dicas');
  const [nextSlideCTA, setNextSlideCTA] = useState('Próximo');
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [carousel, setCarousel] = useState<CarouselData | null>(null);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleCustomColorChange = (key: keyof ColorPalette, value: string) => {
    setIsCustomColor(true);
    setSelectedPalette(prev => ({ ...prev, name: 'Custom', [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        if (logoPlacement === 'None') setLogoPlacement('All Slides');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme) return;

    setLoading(true);
    setStatusMessage('Escrevendo roteiro estratégico...');
    setCarousel(null);
    setCurrentGeneratingIndex(null);

    try {
      const structure = await generateCarouselStructure(theme, slideCount, tone, ctaIntent);
      
      if (!structure || structure.length === 0) {
        throw new Error("Falha ao gerar roteiro.");
      }

      const newSlides: Slide[] = structure.map((s) => ({
        ...s,
        id: Math.random().toString(36).substr(2, 9)
      }));

      const carouselData: CarouselData = {
        theme,
        aspectRatio,
        slideCount,
        slides: newSlides,
        options: {
          palette: selectedPalette,
          fontFamily: selectedFont,
          tone,
          brandHandle,
          layoutStyle: 'Clássico',
          icon: brandingIcon,
          ctaText: ctaIntent,
          nextSlideCTA,
          logoUrl,
          logoPlacement,
          designStyle,
          headlineFontSize,
          bodyFontSize,
          imageOpacity
        }
      };

      setCarousel(carouselData);
      setLoading(false);

      const updatedSlides = [...newSlides];
      for (let i = 0; i < updatedSlides.length; i++) {
        setCurrentGeneratingIndex(i);
        setStatusMessage(`Renderizando arte ${i + 1} de ${updatedSlides.length}...`);
        
        const imgUrl = await generateSlideImage(updatedSlides[i].imagePrompt, aspectRatio, designStyle);
        
        if (imgUrl) {
          updatedSlides[i] = { ...updatedSlides[i], imageUrl: imgUrl };
          setCarousel(prev => prev ? { ...prev, slides: [...updatedSlides] } : null);
        }
      }
    } catch (error) {
      console.error(error);
      setStatusMessage('Erro na geração. Verifique sua chave API.');
      setLoading(false);
    } finally {
      setCurrentGeneratingIndex(null);
      setStatusMessage('');
    }
  };

  const handleDownloadSingle = async (index: number) => {
    if (!carousel) return;
    const element = document.getElementById(`slide-render-${index}`);
    if (element) {
      try {
        setStatusMessage(`Preparando slide ${index + 1}...`);
        const dataUrl = await htmlToImage.toPng(element, { quality: 1, pixelRatio: 2 });
        const link = document.createElement('a');
        const slideFileName = `${carousel.theme.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'carousel'}_slide_${index + 1}.png`;
        link.download = slideFileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error(`Erro ao capturar o slide ${index + 1}:`, err);
        setStatusMessage(`Erro ao baixar o slide ${index + 1}.`);
      } finally {
        setStatusMessage('');
      }
    }
  };

  const handleDownloadAll = async () => {
    if (!carousel) return;
    setStatusMessage('Criando arquivo .zip...');

    const zip = new JSZip();

    for (let i = 0; i < carousel.slides.length; i++) {
      setStatusMessage(`Processando slide ${i + 1}/${carousel.slides.length}...`);
      const element = document.getElementById(`slide-render-${i}`);
      if (element) {
        try {
          const dataUrl = await htmlToImage.toPng(element, { quality: 1, pixelRatio: 2 });
          const base64Data = dataUrl.split(',')[1];
          zip.file(`slide-${i + 1}.png`, base64Data, { base64: true });
        } catch (err) {
          console.error(`Erro ao capturar o slide ${i + 1}:`, err);
          setStatusMessage(`Erro ao processar o slide ${i + 1}.`);
        }
      }
    }

    try {
      setStatusMessage('Gerando o download...');
      const content = await zip.generateAsync({ type: 'blob' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      const zipFileName = `${carousel.theme.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'carousel'}.zip`;
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (err) {
      console.error('Erro ao criar o arquivo .zip:', err);
      setStatusMessage('Erro ao criar o arquivo .zip.');
    } finally {
      setStatusMessage('');
    }
  };

  const handleRegenerateSlideImage = async (slideId: string) => {
    if (!carousel) return;
    const slideIndex = carousel.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;
    setCurrentGeneratingIndex(slideIndex);
    const updatedSlides = [...carousel.slides];
    const imgUrl = await generateSlideImage(updatedSlides[slideIndex].imagePrompt, carousel.aspectRatio, carousel.options.designStyle);
    if (imgUrl) {
      updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], imageUrl: imgUrl };
      setCarousel({ ...carousel, slides: updatedSlides });
    }
    setCurrentGeneratingIndex(null);
  };

  const handleRegenerateSlideText = async (slideId: string) => {
    if (!carousel) return;
    const slideIndex = carousel.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;
    setLoading(true);
    const newContent = await regenerateSingleSlideText(carousel.theme, carousel.options.tone, slideIndex, carousel.slideCount);
    if (newContent) {
      const updatedSlides = [...carousel.slides];
      updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], ...newContent, imageUrl: undefined };
      setCarousel({ ...carousel, slides: updatedSlides });
      const imgUrl = await generateSlideImage(newContent.imagePrompt, carousel.aspectRatio, carousel.options.designStyle);
      if (imgUrl) {
        updatedSlides[slideIndex].imageUrl = imgUrl;
        setCarousel({ ...carousel, slides: [...updatedSlides] });
      }
    }
    setLoading(false);
  };

  const updateSlideContent = (id: string, updated: Partial<Slide>) => {
    setCarousel(prev => {
      if (!prev) return null;
      return {
        ...prev,
        slides: prev.slides.map(s => s.id === id ? { ...s, ...updated } : s)
      };
    });
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 450;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col lg:flex-row overflow-hidden font-inter">
      {/* SIDEBAR PANEL */}
      <aside className="w-full lg:w-[420px] bg-neutral-900 border-r border-white/5 p-6 lg:p-8 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar z-20 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            <i className="fa-solid fa-wand-magic-sparkles text-xl text-white"></i>
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter leading-none">InstaFlow AI</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-bold">Creator Engine</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col gap-6">
          {/* SEÇÃO CONTEÚDO */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Conteúdo Base</label>
            <textarea 
              placeholder="Ex: Como crescer no Instagram em 2024" 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-neutral-800 border border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500/30 outline-none text-sm font-medium transition-all"
            />
            <div className="space-y-1">
                <span className="text-[9px] font-bold text-neutral-500 uppercase">Estilo de IA</span>
                <select value={designStyle} onChange={(e) => setDesignStyle(e.target.value as DesignStyle)} className="w-full bg-neutral-800 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold uppercase">
                  {DESIGN_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-neutral-500 uppercase">Nº Slides</span>
                <input type="number" min="3" max="10" value={slideCount} onChange={(e) => setSlideCount(parseInt(e.target.value))} className="w-full bg-neutral-800 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-neutral-500 uppercase">Proporção</span>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full bg-neutral-800 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold uppercase">
                  <option value={AspectRatio.SQUARE}>1:1 (Quadrado)</option>
                  <option value={AspectRatio.PORTRAIT}>4:5 (Vertical)</option>
                  <option value={AspectRatio.STORY}>9:16 (Story)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEÇÃO DESIGN */}
          <div className="space-y-4 p-4 bg-neutral-800/30 rounded-2xl border border-white/5">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Personalização Visual</label>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase">Opacidade da Imagem</span>
                  <span className="text-[10px] font-black text-pink-500">{imageOpacity}%</span>
                </div>
                <input type="range" min="0" max="100" step="5" value={imageOpacity} onChange={(e) => setImageOpacity(parseInt(e.target.value))} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase">Tam. Título</span>
                  <input type="number" value={headlineFontSize} onChange={(e) => setHeadlineFontSize(parseInt(e.target.value))} className="w-full bg-neutral-800 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase">Tam. Texto</span>
                  <input type="number" value={bodyFontSize} onChange={(e) => setBodyFontSize(parseInt(e.target.value))} className="w-full bg-neutral-800 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold" />
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO BRANDING */}
          <div className="space-y-4 p-5 bg-neutral-800/30 border border-white/5 rounded-2xl">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Branding & Identidade</label>
            <div className="flex gap-4 items-center">
              <button type="button" onClick={() => logoInputRef.current?.click()} className="flex-1 py-3 px-4 rounded-xl bg-neutral-800 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-700">
                {logoUrl ? 'Trocar Logo' : 'Adicionar Logo'}
              </button>
              {logoUrl && <img src={logoUrl} className="w-12 h-12 object-contain rounded-xl bg-black/40 p-1" alt="Preview Logo" />}
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
            {logoUrl && (
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-neutral-500 uppercase">Posição da Logo</span>
                <select value={logoPlacement} onChange={(e) => setLogoPlacement(e.target.value as LogoPlacement)} className="w-full bg-neutral-800 border border-white/5 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase">
                  {LOGO_PLACEMENT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-neutral-500 uppercase">Usuário (@)</span>
              <input type="text" value={brandHandle} onChange={(e) => setBrandHandle(e.target.value)} placeholder="@seu.perfil" className="w-full bg-neutral-800 border border-white/5 rounded-xl px-4 py-2.5 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-neutral-500 uppercase">Ícone / Emoji</span>
                <input 
                  type="text" 
                  value={brandingIcon} 
                  onChange={(e) => setBrandingIcon(e.target.value)} 
                  maxLength={10}
                  className="w-full bg-neutral-800 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold text-center" 
                  placeholder="Emoji ou ícone"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-neutral-500 uppercase">Texto Deslize</span>
                <input type="text" value={nextSlideCTA} onChange={(e) => setNextSlideCTA(e.target.value)} className="w-full bg-neutral-800 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold" />
              </div>
            </div>
            
            {/* Lista de ícones rápidos */}
            <div className="flex flex-wrap gap-2">
               {QUICK_ICONS.map((ic) => (
                 <button 
                  key={ic} 
                  type="button" 
                  onClick={() => setBrandingIcon(ic)}
                  className={`px-2 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold transition-all ${brandingIcon === ic ? 'bg-pink-600 border-pink-500 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                 >
                   {ic === 'Instagram' ? <i className="fa-brands fa-instagram"></i> : 
                    ic === 'Sparkles' ? <i className="fa-solid fa-sparkles"></i> : 
                    ic === 'Lightning' ? <i className="fa-solid fa-bolt"></i> : 
                    ic === 'Circle' ? <i className="fa-solid fa-circle-dot"></i> : 
                    ic}
                 </button>
               ))}
               <button 
                type="button" 
                onClick={() => setBrandingIcon('None')}
                className={`px-2 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold transition-all ${brandingIcon === 'None' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
               >
                 <i className="fa-solid fa-ban"></i>
               </button>
            </div>
          </div>

          {/* SEÇÃO IA & CORES */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-neutral-500 uppercase">Tom de Voz</span>
                <select value={tone} onChange={(e) => setTone(e.target.value as DesignTone)} className="w-full bg-neutral-800 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold uppercase">
                  {TONE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-neutral-500 uppercase">Fonte</span>
                <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} className="w-full bg-neutral-800 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold uppercase">
                  {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Paleta</span>
                <button type="button" onClick={() => setIsCustomColor(!isCustomColor)} className="text-[9px] font-bold text-pink-500 underline uppercase">Customizar</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {PALETTES.map(p => (
                  <button key={p.name} type="button" onClick={() => { setSelectedPalette(p); setIsCustomColor(false); }} className={`h-11 rounded-xl border-2 transition-all p-1 ${selectedPalette.name === p.name && !isCustomColor ? 'border-pink-500 scale-105' : 'border-transparent opacity-60'}`}>
                    <div className="w-full h-full rounded-lg overflow-hidden flex flex-col">
                        <div className="flex-1" style={{ backgroundColor: p.primary }}></div>
                        <div className="flex-1" style={{ backgroundColor: p.background }}></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" disabled={loading || !theme}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:brightness-110 disabled:grayscale text-white font-black uppercase tracking-[0.25em] text-xs transition-all flex items-center justify-center gap-3 shadow-2xl shadow-pink-500/20 active:scale-95"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin text-lg"></i> : <i className="fa-solid fa-sparkles text-lg"></i>}
            GERAR CARROSSEL COMPLETO
          </button>
        </form>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)]">
        {!carousel && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 animate-in fade-in zoom-in-95 duration-1000">
             <div className="w-32 h-32 bg-neutral-900 border border-white/10 rounded-[2.5rem] flex items-center justify-center rotate-12 mb-10 shadow-2xl">
                <i className="fa-solid fa-layer-group text-5xl text-neutral-700"></i>
             </div>
             <h2 className="text-4xl font-black italic tracking-tighter mb-4 uppercase">Criatividade Ativada.</h2>
             <p className="text-neutral-500 text-sm max-w-sm uppercase tracking-[0.2em] leading-loose font-bold">Configure os estilos na barra lateral e gere sua arte.</p>
          </div>
        )}

        {loading && !carousel && (
           <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <div className="relative">
                <div className="w-20 h-20 border-[6px] border-pink-500/10 border-t-pink-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fa-solid fa-brain text-2xl text-pink-400 animate-pulse"></i>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">{statusMessage}</h3>
              </div>
           </div>
        )}

        {carousel && (
          <div className="flex-1 flex flex-col p-8 lg:p-14 overflow-hidden gap-12 print:overflow-visible print:p-0 print:bg-white">
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <span className="text-[11px] font-black text-pink-500 uppercase tracking-[0.4em] block mb-2">Editor Ativo</span>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase truncate max-w-lg">{carousel.theme}</h2>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => scroll('left')} className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/5 hover:bg-neutral-800 flex items-center justify-center transition-all active:scale-90 shadow-xl">
                    <i className="fa-solid fa-chevron-left text-lg"></i>
                  </button>
                  <button onClick={() => scroll('right')} className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/5 hover:bg-neutral-800 flex items-center justify-center transition-all active:scale-90 shadow-xl">
                    <i className="fa-solid fa-chevron-right text-lg"></i>
                  </button>
                </div>
            </div>

            <div 
              ref={scrollContainerRef}
              className="flex-1 flex gap-12 lg:gap-16 overflow-x-auto pb-12 px-6 custom-scrollbar items-center snap-x print:flex-col print:gap-0 print:overflow-visible"
            >
              {carousel.slides.map((slide, idx) => (
                <div key={slide.id} className="snap-center h-full flex items-center print:h-auto print:mb-0">
                    <SlideCard 
                      slide={slide} 
                      index={idx} 
                      total={carousel.slides.length} 
                      aspectRatio={carousel.aspectRatio}
                      options={{
                        ...carousel.options, 
                        palette: selectedPalette, 
                        fontFamily: selectedFont, 
                        layoutStyle: 'Clássico',
                        icon: brandingIcon, 
                        brandHandle, 
                        logoUrl, 
                        logoPlacement,
                        nextSlideCTA,
                        designStyle,
                        headlineFontSize,
                        bodyFontSize,
                        imageOpacity
                      }}
                      onUpdateSlide={(updated) => updateSlideContent(slide.id, updated)}
                      onRegenerateImage={() => handleRegenerateSlideImage(slide.id)}
                      onRegenerateText={() => handleRegenerateSlideText(slide.id)}
                      onDownloadSlide={() => handleDownloadSingle(idx)}
                      isGeneratingImage={currentGeneratingIndex === idx}
                    />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between bg-neutral-900/60 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl print:hidden">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shadow-inner">
                        <i className="fa-solid fa-check-double text-green-400 text-sm"></i>
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-white">Carrossel Pronto</p>
                        <p className="text-[9px] text-neutral-500 font-bold uppercase mt-1">Design: {designStyle} | Layout: Clássico</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleDownloadAll} className="px-10 py-4 rounded-2xl bg-pink-600 text-white font-black uppercase text-[11px] tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl flex items-center gap-3">
                        <i className="fa-solid fa-download"></i> Baixar Imagens (.zip)
                    </button>
                    <button onClick={() => { setCarousel(null); setTheme(''); }} className="px-8 py-4 rounded-2xl bg-neutral-900 border border-white/10 text-white font-black uppercase text-[11px] tracking-widest hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-3">
                        <i className="fa-solid fa-plus"></i> Criar Novo
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
