import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const K = {
  black: '#0a0a0b',
  white: '#f5f5f3',
  dim: 'rgba(245,245,243,0.62)',
  faint: 'rgba(245,245,243,0.38)',
  orange: '#f96205',
  red: '#F90505',
  pink: '#FF3881',
  violet: '#7C00DA',
  blue: '#00509F',
  grad: 'linear-gradient(90deg,#F96205 0%,#F90505 30%,#FF3881 55%,#7C00DA 80%,#00509F 100%)',
};
export const DISPLAY = "'Anton', 'Inter Tight', sans-serif";
export const SANS = "'Inter Tight', sans-serif";
export const MONO = "'JetBrains Mono', monospace";
export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);

export const ARRIVE = Easing.bezier(0.05, 0.7, 0.1, 1);
export const LEAVE = Easing.bezier(0.3, 0, 0.8, 0.15);

export const Fonts: React.FC = () => (
  <style>{`
    @font-face{font-family:'Anton';src:url('${staticFile('brand/fonts/Anton-400.woff2')}') format('woff2');font-weight:400}
    @font-face{font-family:'Inter Tight';src:url('${staticFile('brand/fonts/InterTight-300.woff2')}') format('woff2');font-weight:300}
    @font-face{font-family:'Inter Tight';src:url('${staticFile('brand/fonts/InterTight-400.woff2')}') format('woff2');font-weight:400}
    @font-face{font-family:'Inter Tight';src:url('${staticFile('brand/fonts/InterTight-500.woff2')}') format('woff2');font-weight:500}
    @font-face{font-family:'Inter Tight';src:url('${staticFile('brand/fonts/InterTight-600.woff2')}') format('woff2');font-weight:600}
    @font-face{font-family:'Inter Tight';src:url('${staticFile('brand/fonts/InterTight-700.woff2')}') format('woff2');font-weight:700}
    @font-face{font-family:'Inter Tight';src:url('${staticFile('brand/fonts/InterTight-800.woff2')}') format('woff2');font-weight:800}
    @font-face{font-family:'JetBrains Mono';src:url('${staticFile('brand/fonts/JetBrainsMono-400.woff2')}') format('woff2');font-weight:400}
    @font-face{font-family:'JetBrains Mono';src:url('${staticFile('brand/fonts/JetBrainsMono-500.woff2')}') format('woff2');font-weight:500}
  `}</style>
);

/** Slam grammar: anticipation 2f @0.92/op0 -> punch 1.6->1.0 in 3f -> overshoot 0.96 -> settle by f9 -> drift; exit smear 3f */
export const slam = (f: number, at: number, out?: number) => {
  const t = f - at;
  if (t < 0) return {s: 0.92, o: 0, blur: 0, show: false};
  let s = 1, o = 1, blur = 0;
  if (t < 2) { s = 0.92; o = 0; }
  else if (t < 5) { s = interpolate(t, [2, 5], [1.6, 1.0], {easing: ARRIVE}); o = interpolate(t, [2, 3], [0, 1], {extrapolateRight: 'clamp'}); blur = interpolate(t, [2, 5], [10, 0]); }
  else if (t < 6) { s = 0.96; }
  else if (t < 9) { s = interpolate(t, [6, 9], [0.96, 1.0], {easing: ARRIVE}); }
  else { s = 1 + Math.min(0.02, (t - 9) * 0.0006); }
  if (out !== undefined && f >= out - 3) {
    const u = interpolate(f, [out - 3, out], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: LEAVE});
    s *= 1 + 0.25 * u; blur = 24 * u; o *= 1 - u;
  }
  return {s, o, blur, show: true};
};

/** shock ring + camera kick helpers */
export const Ring: React.FC<{at: number; x?: string; y?: string; color?: string}> = ({at, x = '50%', y = '50%', color = K.orange}) => {
  const f = useCurrentFrame();
  const {width} = useVideoConfig();
  const t = f - at - 2;
  if (t < 0 || t > 8) return null;
  const r = interpolate(t, [0, 8], [0, 1.6 * width], {easing: ARRIVE});
  return (
    <div style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r, borderRadius: '50%', border: `${interpolate(t, [0, 8], [3, 0])}px solid ${color}`, opacity: interpolate(t, [0, 8], [0.6, 0]), mixBlendMode: 'screen'}} />
  );
};
export const kick = (f: number, ats: number[], h = 1080) => {
  let y = 0;
  for (const a of ats) {
    const t = f - a - 2;
    if (t >= 0 && t < 12) y += (t < 2 ? 0.006 * h : 0.006 * h * (1 - (t - 2) / 10)) * (t % 2 === 0 ? 1 : -1);
  }
  return y;
};

export const Word: React.FC<{text: string; at: number; out?: number; style?: React.CSSProperties; display?: boolean; size?: number; color?: string}> = ({text, at, out, style, display = true, size = 150, color = K.white}) => {
  const f = useCurrentFrame();
  const st = slam(f, at, out);
  if (!st.show) return null;
  return (
    <div style={{fontFamily: display ? DISPLAY : SANS, fontWeight: display ? 400 : 300, fontSize: size, lineHeight: 0.92, letterSpacing: display ? '-0.02em' : '-0.02em', textTransform: display ? 'uppercase' : 'none', color, opacity: st.o, transform: `scale(${st.s})`, filter: st.blur ? `blur(${st.blur}px)` : undefined, textShadow: '0 8px 40px rgba(0,0,0,0.45)', whiteSpace: 'nowrap', ...style}}>
      {text}
    </div>
  );
};

/** lower third: mono kicker + name, gradient rule, sweeps in and out */
export const LowerThird: React.FC<{name: string; role?: string; inF?: number; outF: number}> = ({name, role, inF = 6, outF}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [inF, inF + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ARRIVE});
  const q = interpolate(f, [outF - 10, outF], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: LEAVE});
  const drift = f * 0.08;
  return (
    <div style={{position: 'absolute', left: 96, bottom: 120, transform: `translateX(${(1 - p) * -60 + q * -40 + drift}px)`, opacity: p * (1 - q)}}>
      <div style={{height: 4, width: 120 * p, background: K.grad, marginBottom: 18}} />
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, color: K.white, letterSpacing: '-0.01em', textShadow: '0 4px 24px rgba(0,0,0,0.6)'}}>{name}</div>
      {role ? <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: '0.18em', textTransform: 'uppercase', color: K.orange, marginTop: 10, textShadow: '0 2px 12px rgba(0,0,0,0.7)'}}>{role}</div> : null}
    </div>
  );
};

export const Grain: React.FC<{o?: number}> = ({o = 0.06}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: o, mixBlendMode: 'overlay', backgroundImage: `repeating-radial-gradient(circle at ${(f * 37) % 100}% ${(f * 53) % 100}%, rgba(255,255,255,0.5) 0 1px, transparent 1px 3px)`}} />
  );
};

export const ArtBg: React.FC<{art?: string; o?: number}> = ({art = 'brand/art/ribbon-hero-16x9.webp', o = 0.35}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: K.black, overflow: 'hidden'}}>
      <Img src={staticFile(art)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: o, transform: `scale(${1.06 + f * 0.0008}) translateX(${-f * 0.4}px)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(110% 90% at 50% 45%, rgba(10,10,11,0) 30%, rgba(10,10,11,0.92) 100%)'}} />
    </AbsoluteFill>
  );
};

export const Mono: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: '0.22em', textTransform: 'uppercase', color: K.dim, ...style}}>{children}</div>
);

export const sweep = (f: number, at: number, dur = 14) => interpolate(f, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ARRIVE});
