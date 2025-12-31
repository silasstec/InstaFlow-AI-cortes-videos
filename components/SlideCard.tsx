
import React from 'react';
import { Slide, AspectRatio, CustomizationOptions } from '../types';

interface SlideCardProps {
  slide: Slide;
  aspectRatio: AspectRatio;
  index: number;
  total: number;
  options: CustomizationOptions;
  onUpdateSlide?: (updatedSlide: Slide) => void;
  onRegenerateImage?: () => void;
  onRegenerateText?: () => void;
  isGeneratingImage?: boolean;
}

const SlideCard: React.FC<SlideCardProps> = ({ 
  slide, 
  aspectRatio, 
  index, 
  total, 
  options, 
  onUpdateSlide,
  onRegenerateImage,
  onRegenerateText,
  isGeneratingImage 
}) => {
  const { 
    palette, 
    fontFamily, 
    brandHandle, 
    icon, 
    logoUrl, 
    logoPlacement, 
    nextSlideCTA,
    headlineFontSize,
    bodyFontSize,
    imageOpacity
  } = options;

  // --- HELPER CLASSES & STYLES ---

  const getRatioClass = () => {
    switch (aspectRatio) {
      case AspectRatio.SQUARE: return 'aspect-square';
      case AspectRatio.PORTRAIT: return 'aspect-[4/5]';
      case AspectRatio.STORY: return 'aspect-[9/16]';
      default: return 'aspect-[4/5]';
    }
  };

  const textStyleBase = { 
    fontFamily: fontFamily || "'Inter', sans-serif",
    color: palette.text,
  };

  const renderIconContent = () => {
    const iconMap: Record<string, string> = {
      'Instagram': 'fa-brands fa-instagram',
      'Sparkles': 'fa-solid fa-sparkles',
      'Lightning': 'fa-solid fa-bolt',
      'Circle': 'fa-solid fa-circle-dot',
    };
    if (!icon || icon === 'None') return null;
    const faClass = iconMap[icon];
    if (faClass) return <i className={`${faClass} text-white text-xs`}></i>;
    return <span className="text-xs leading-none flex items-center justify-center">{icon}</span>;
  };

  const shouldShowLogo = (position: 'header' | 'footer' | 'body') => {
    if (!logoUrl || logoPlacement === 'None') return false;
    
    // Header Logic
    if (position === 'header') {
      return (logoPlacement === 'All Slides' || 
             (logoPlacement === 'Intro & Outro' && (index === 0 || index === total - 1)) ||
             (logoPlacement === 'Last Slide' && index === total - 1));
    }
    // Body Logic (Big logo)
    if (position === 'body') {
      return (logoPlacement === 'First Slide' && index === 0);
    }
    // Watermark
    if (position === 'footer') {
      return (logoPlacement === 'Discrete Watermark');
    }
    return false;
  };

  // --- SUB-COMPONENTS ---

  const SlideImage = ({ className = "inset-0 absolute", opacityOverride }: { className?: string, opacityOverride?: number }) => (
    <div className={`z-0 bg-neutral-900 overflow-hidden ${className}`} style={{ backgroundColor: palette.background }}>
      {slide.imageUrl ? (
        <img 
          src={slide.imageUrl} 
          alt="" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          style={{ opacity: (opacityOverride ?? imageOpacity) / 100 }}
        />
      ) : isGeneratingImage ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-neutral-800">
            <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Gerando...</span>
        </div>
      ) : (
        <div className="w-full h-full bg-neutral-800 opacity-20" style={{ backgroundColor: palette.background }}></div>
      )}
    </div>
  );

  const SlideHeader = ({ className = '' }: { className?: string }) => (
    <div className={`absolute top-0 left-0 w-full p-8 z-30 flex justify-between items-start ${className}`}>
        <>
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {shouldShowLogo('header') ? (
              <img src={logoUrl} className="w-6 h-6 object-contain" alt="Logo" />
            ) : icon && icon !== 'None' && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: palette.primary }}>
                 {renderIconContent()}
              </div>
            )}
            {brandHandle && <span className="text-[9px] font-bold uppercase tracking-widest text-white/90">{brandHandle}</span>}
          </div>
          <div className="px-3 py-1.5 rounded-full text-[9px] font-black border border-white/10 bg-black/40 text-white backdrop-blur-md">
            {index + 1}/{total}
          </div>
        </>
    </div>
  );

  const SlideFooter = ({ className = '' }: { className?: string }) => (
    <div className={`absolute bottom-0 left-0 w-full p-8 z-30 flex justify-between items-end ${className}`}>
       {index < total - 1 && nextSlideCTA?.trim() ? (
         <div className={`flex items-center gap-3 px-4 py-2 rounded-full bg-black/80 backdrop-blur-lg border border-white/10`}>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{nextSlideCTA}</span>
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
         </div>
       ) : <div />}
       {shouldShowLogo('footer') && (
         <img src={logoUrl} className="w-12 h-12 object-contain opacity-50 grayscale" alt="Watermark" />
       )}
    </div>
  );

  return (
    <div 
      id={`slide-render-${index}`}
      className={`relative w-[320px] md:w-[420px] flex-shrink-0 overflow-hidden shadow-2xl ${getRatioClass()} group print:shadow-none print:border-none print:rounded-none select-none rounded-[2.5rem]`}
      style={{ 
        backgroundColor: palette.background, 
      }}
    >
        {/* --- CLASSIC LAYOUT --- */}
        <SlideImage />
        
        {/* Improved Gradient Overlay: Taller and more consistent for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-[70%] z-10"
             style={{ 
               background: `linear-gradient(to top, ${palette.background}F2 15%, ${palette.background}BF 50%, transparent 100%)` 
             }}></div>

        <SlideHeader />

        {/* Content Area - Expanded Padding and Spacing */}
        <div className="absolute bottom-0 left-0 w-full z-20 flex flex-col justify-end p-10 pb-20"> {/* Added pb-20 to lift text away from bottom edge */}
          
          {shouldShowLogo('body') && (
            <img src={logoUrl} className="w-20 h-20 object-contain mb-6 drop-shadow-xl" alt="Logo" />
          )}

          <div className="flex flex-col gap-6"> {/* Increased gap between Headline and Body */}
             <textarea
              className="w-full bg-transparent border-none p-0 focus:ring-0 font-black leading-[1.1] uppercase resize-none drop-shadow-lg text-left"
              style={{ ...textStyleBase, fontSize: `${headlineFontSize}px` }}
              value={slide.headline}
              rows={4}
              onChange={(e) => onUpdateSlide?.({ ...slide, headline: e.target.value })}
            />
            
            {/* Visual Separator */}
            <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: palette.primary }}></div>

            <textarea
              className="w-full bg-transparent border-none p-0 focus:ring-0 font-medium resize-none opacity-90 drop-shadow-md text-left leading-relaxed"
              style={{ ...textStyleBase, fontSize: `${bodyFontSize}px` }}
              value={slide.body}
              rows={4}
              onChange={(e) => onUpdateSlide?.({ ...slide, body: e.target.value })}
            />
          </div>
        </div>

        <SlideFooter />

      {/* Tools Overlay (Hover) */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 print:hidden">
        <button 
          onClick={(e) => { e.stopPropagation(); onRegenerateText?.(); }}
          className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all shadow-lg"
          title="Regenerar Texto"
        >
          <i className="fa-solid fa-pen-nib text-[10px]"></i>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onRegenerateImage?.(); }}
          className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all shadow-lg"
          title="Regenerar Imagem"
        >
          <i className="fa-solid fa-image text-[10px]"></i>
        </button>
      </div>
    </div>
  );
};

export default SlideCard;