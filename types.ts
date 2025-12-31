
export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '4:5',
  STORY = '9:16',
}

export type DesignTone = 'Profissional' | 'Casual' | 'Divertido' | 'Urgente' | 'Minimalista';
export type LayoutStyle = 'Clássico';

export type BrandingIcon = string;
export type LogoPlacement = 'None' | 'All Slides' | 'Intro & Outro' | 'First Slide' | 'Last Slide' | 'Discrete Watermark';
export type DesignStyle = 
  | 'Cinematográfico' 
  | '3D Render' 
  | 'Minimalista' 
  | 'Cyberpunk' 
  | 'Aquarela' 
  | 'Fotorealista'
  | 'Retro/Vintage'
  | 'Colagem Digital'
  | 'Neon Futurista'
  | 'Minimalista Japonês'
  | 'Ilustração 3D'
  | 'Editorial High-End';

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  text: string;
  accent: string;
  background: string;
}

export const PALETTES: ColorPalette[] = [
  { name: 'Insta Default', primary: '#E1306C', secondary: '#F77737', text: '#FFFFFF', accent: '#FFDC80', background: '#000000' },
  { name: 'Midnight', primary: '#00F5FF', secondary: '#7000FF', text: '#FFFFFF', accent: '#FF00D6', background: '#0A0A0A' },
  { name: 'Luxury Gold', primary: '#D4AF37', secondary: '#1C1C1C', text: '#F4F4F4', accent: '#C0C0C0', background: '#000000' },
  { name: 'Soft Cotton', primary: '#B2A4FF', secondary: '#FFB7B2', text: '#404040', accent: '#B5EAD7', background: '#F8F9FA' },
  { name: 'Deep Ocean', primary: '#0077B6', secondary: '#023E8A', text: '#CAF0F8', accent: '#90E0EF', background: '#03045E' },
  { name: 'Organic Leaf', primary: '#2D6A4F', secondary: '#52B788', text: '#D8F3DC', accent: '#B7E4C7', background: '#081C15' },
  { name: 'Cyberpunk 2077', primary: '#FCEE09', secondary: '#00FF00', text: '#FFFFFF', accent: '#FF003C', background: '#1A1A1A' },
  { name: 'Minimal Mono', primary: '#333333', secondary: '#666666', text: '#111111', accent: '#000000', background: '#FFFFFF' },
];

export interface SlideContent {
  headline: string;
  body: string;
  imagePrompt: string;
}

export interface Slide extends SlideContent {
  id: string;
  imageUrl?: string;
}

export interface CustomizationOptions {
  palette: ColorPalette;
  fontFamily: string;
  tone: DesignTone;
  brandHandle: string;
  layoutStyle: LayoutStyle;
  icon: BrandingIcon;
  ctaText: string;
  nextSlideCTA: string;
  logoUrl?: string;
  logoPlacement: LogoPlacement;
  designStyle: DesignStyle;
  headlineFontSize: number;
  bodyFontSize: number;
  imageOpacity: number;
}

export interface CarouselData {
  theme: string;
  aspectRatio: AspectRatio;
  slideCount: number;
  slides: Slide[];
  options: CustomizationOptions;
}