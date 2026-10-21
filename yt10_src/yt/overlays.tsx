import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ARRIVE, DISPLAY, K, LEAVE, MONO, Mono, Ring, SANS, kick, slam, sweep, Word} from './kit';
import {PIP} from './data';

const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

/** soft vignette under text zones so type reads on any plate */
export const Shade: React.FC<{side: 'left' | 'right' | 'bottom'; o?: number; f0?: number; f1: number}> = ({side, o = 0.55, f0 = 0, f1}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [f0, f0 + 10, f1 - 8, f1], [0, 1, 1, 0], CL);
  const g = side === 'left' ? 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 48%)' : side === 'right' ? 'linear-gradient(270deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 48%)' : 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 42%)';
  return <AbsoluteFill style={{background: g, opacity: p * o}} />;
};

/** word that slams in and smears out; light/heavy pairing like the reference ("SEM" light + "CÂMERA" heavy) */
export type W = {at: number; out: number; light?: string; heavy: string; color?: string};
export const SlamPairs: React.FC<{items: W[]; x?: number | string; y: number; size?: number; align?: 'left' | 'center'}> = ({items, x = 0, y, size = 220, align = 'center'}) => {
  const f = useCurrentFrame();
  return (
    <>
      {items.map((w, i) =>
        f >= w.at && f < w.out ? (
          <div key={i} style={{position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y, textAlign: align, transform: `translateY(${kick(f, [w.at])}px)`}}>
            {w.light ? <div style={{fontFamily: SANS, fontWeight: 300, fontSize: size * 0.32, color: K.white, letterSpacing: '0.04em', opacity: slam(f, w.at, w.out).o, marginBottom: 6, textShadow: '0 4px 30px rgba(0,0,0,0.6)'}}>{w.light}</div> : null}
            <Word text={w.heavy} at={w.at} out={w.out} size={size} color={w.color ?? K.orange} style={{display: 'inline-block'}} />
          </div>
        ) : null,
      )}
      {items.map((w, i) => <Ring key={`r${i}`} at={w.at} x={align === 'center' ? '50%' : '22%'} y={`${((y + size * 0.5) / 1080) * 100}%`} />)}
    </>
  );
};

/** rubber stamp: rotated box, 2.2 -> 1 slam, red ink */
export const Stamp: React.FC<{at: number; text: string; x: number; y: number; rot?: number; size?: number; color?: string; out?: number}> = ({at, text, x, y, rot = -7, size = 92, color = K.red, out}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const t = f - at;
  const s = t < 2 ? 2.4 : t < 6 ? interpolate(t, [2, 6], [2.2, 0.97], {easing: ARRIVE}) : t < 9 ? interpolate(t, [6, 9], [0.97, 1]) : 1 + Math.min(0.02, (t - 9) * 0.0005);
  const o = t < 2 ? 0 : 1;
  const xo = out !== undefined ? interpolate(f, [out - 4, out], [1, 0], {...CL, easing: LEAVE}) : 1;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${s})`, opacity: o * xo, transformOrigin: 'center'}}>
      <div style={{border: `${Math.max(6, size * 0.07)}px solid ${color}`, borderRadius: 12, padding: `${size * 0.1}px ${size * 0.28}px`, fontFamily: DISPLAY, fontSize: size, color, letterSpacing: '0.02em', lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', background: 'rgba(10,10,11,0.25)', boxShadow: `0 0 40px rgba(249,5,5,0.25)`, maskImage: 'radial-gradient(circle at 30% 40%, #000 60%, rgba(0,0,0,0.75) 100%)'}}>{text}</div>
    </div>
  );
};

/** stack of short lines that sweep in one by one (left/right zone) */
export const Stack: React.FC<{items: {at: number; text: string; accent?: boolean}[]; x: number; y: number; out: number; title?: {at: number; text: string}; align?: 'left' | 'right'; size?: number; numbered?: boolean}> = ({items, x, y, out, title, align = 'left', size = 46, numbered}) => {
  const f = useCurrentFrame();
  const xo = interpolate(f, [out - 6, out], [0, 1], {...CL, easing: LEAVE});
  return (
    <div style={{position: 'absolute', [align === 'left' ? 'left' : 'right']: x, top: y, textAlign: align, opacity: 1 - xo, transform: `translateX(${(align === 'left' ? -1 : 1) * xo * 40}px)`}}>
      {title && f >= title.at ? <div style={{marginBottom: 18, opacity: sweep(f, title.at, 8)}}><Mono style={{fontSize: 20, color: K.orange}}>{title.text}</Mono></div> : null}
      {items.map((it, i) => {
        if (f < it.at) return null;
        const p = sweep(f, it.at, 10);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 16, justifyContent: align === 'left' ? 'flex-start' : 'flex-end', marginBottom: 16, clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`, transform: `translateX(${(1 - p) * 30 + (f - it.at) * 0.04}px)`}}>
            {numbered ? <Mono style={{fontSize: 20, color: K.orange}}>{String(i + 1).padStart(2, '0')}</Mono> : null}
            <div style={{fontFamily: it.accent ? DISPLAY : SANS, fontWeight: it.accent ? 400 : 800, fontSize: it.accent ? size * 1.6 : size, color: it.accent ? K.orange : K.white, letterSpacing: it.accent ? '-0.01em' : '-0.015em', textTransform: it.accent ? 'uppercase' : 'none', lineHeight: 1.05, textShadow: '0 4px 28px rgba(0,0,0,0.7)', whiteSpace: 'nowrap'}}>{it.text}</div>
          </div>
        );
      })}
    </div>
  );
};

/** chapter badge over a shot */
export const ChapterBadge: React.FC<{n: string; title: string; at: number; out: number}> = ({n, title, at, out}) => {
  const f = useCurrentFrame();
  const p = sweep(f, at, 12);
  const xo = interpolate(f, [out - 8, out], [0, 1], {...CL, easing: LEAVE});
  return (
    <div style={{position: 'absolute', left: 96, bottom: 110, display: 'flex', alignItems: 'flex-end', gap: 26, opacity: 1 - xo}}>
      <Word text={n} at={at} size={190} color={K.orange} style={{lineHeight: 0.8}} />
      <div style={{paddingBottom: 12, clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`}}>
        <Mono style={{fontSize: 18, color: K.dim}}>CAPÍTULO</Mono>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 54, color: K.white, letterSpacing: '-0.02em', textShadow: '0 4px 24px rgba(0,0,0,0.6)'}}>{title}</div>
      </div>
    </div>
  );
};

/** numbered tip card (07) */
export const Tip: React.FC<{n: number; title: string; at: number; out: number; chips?: {at: number; t: string}[]; side?: 'left' | 'right'; top?: number}> = ({n, title, at, out, chips = [], side = 'left', top}) => {
  const f = useCurrentFrame();
  const p = sweep(f, at + 4, 12);
  const xo = interpolate(f, [out - 6, out], [0, 1], {...CL, easing: LEAVE});
  const pos: React.CSSProperties = top !== undefined ? {top} : {bottom: 120};
  return (
    <div style={{position: 'absolute', [side]: 90, ...pos, width: 760, opacity: 1 - xo}}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 22}}>
        <Word text={String(n)} at={at} size={230} color={K.orange} style={{lineHeight: 0.78}} />
        <div style={{paddingBottom: 14, clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`}}>
          <Mono style={{fontSize: 18, color: K.dim}}>{`DICA ${n} DE 3`}</Mono>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, color: K.white, letterSpacing: '-0.02em', lineHeight: 1.04, textShadow: '0 4px 24px rgba(0,0,0,0.7)', width: 520}}>{title}</div>
        </div>
      </div>
      <div style={{display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap'}}>
        {chips.map((c) => (f >= c.at ? <div key={c.t} style={{padding: '10px 22px', borderRadius: 999, background: 'rgba(10,10,11,0.55)', border: '1px solid rgba(249,98,5,0.75)', transform: `scale(${slam(f, c.at).s})`}}><Mono style={{fontSize: 20, color: K.white}}>{c.t}</Mono></div> : null))}
      </div>
      <Ring at={at} x="12%" y="70%" />
    </div>
  );
};

/** PiP frame for the tutorial (host video is composited under this by ffmpeg) */
export const PipFrame: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const p = sweep(f, 0, 14);
  const xo = interpolate(f, [dur - 10, dur], [0, 1], {...CL, easing: LEAVE});
  const s = PIP.s;
  return (
    <div style={{position: 'absolute', left: PIP.x - 4, top: PIP.y - 4, width: s + 8, height: s + 8, opacity: p * (1 - xo)}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 30, padding: 4, background: K.grad, WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude'}} />
      <div style={{position: 'absolute', left: 20, bottom: 18, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: 'rgba(10,10,11,0.65)'}}>
        <div style={{width: 8, height: 8, borderRadius: 8, background: K.orange}} />
        <Mono style={{fontSize: 14, color: K.white, letterSpacing: '0.18em'}}>SILASTEC CAST</Mono>
      </div>
    </div>
  );
};

/** cold open title over the world-jump stills */
export const ColdTitle: React.FC = () => {
  const f = useCurrentFrame();
  const ws = [
    {at: 4, out: 22, t: 'A IA'},
    {at: 22, out: 44, t: 'JÁ ESTÁ'},
    {at: 44, out: 92, t: 'FAZENDO CINEMA.'},
  ];
  const flash = interpolate(f, [86, 88, 90], [0, 1, 0], CL);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(70% 60% at 50% 55%, rgba(0,0,0,0.0), rgba(0,0,0,0.65))'}} />
      {ws.map((w) => (f >= w.at && f < w.out ? <div key={w.t} style={{position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', transform: `translateY(${kick(f, [w.at])}px)`}}><Word text={w.t} at={w.at} out={w.out} size={w.t.length > 10 ? 190 : 230} color={w.t.includes('CINEMA') ? K.orange : K.white} style={{display: 'inline-block'}} /></div> : null))}
      {ws.map((w) => <Ring key={w.t} at={w.at} />)}
      <div style={{position: 'absolute', left: 64, top: 52, opacity: sweep(f, 2, 10)}}><Mono style={{fontSize: 17, color: K.white}}>● SILASTEC CAST · IA NO CINEMA</Mono></div>
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.85}} />
    </AbsoluteFill>
  );
};

/** subscribe CTA pill with cursor click */
export const Subscribe: React.FC<{at: number; out: number}> = ({at, out}) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  const p = sweep(f, at, 10);
  const click = at + 16;
  const done = f >= click + 3;
  const cx = interpolate(f, [at + 2, click], [220, 0], {...CL, easing: ARRIVE});
  const cy = interpolate(f, [at + 2, click], [140, 0], {...CL, easing: ARRIVE});
  const press = f >= click && f < click + 4 ? 0.92 : 1;
  const xo = interpolate(f, [out - 6, out], [0, 1], {...CL, easing: LEAVE});
  return (
    <div style={{position: 'absolute', left: 96, bottom: 120, opacity: p * (1 - xo), transform: `translateY(${(1 - p) * 30}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 34px', borderRadius: 999, background: done ? 'rgba(255,255,255,0.14)' : K.orange, transform: `scale(${press})`, boxShadow: done ? 'none' : '0 10px 40px rgba(249,98,5,0.45)'}}>
        <Img src={staticFile('silastec/silastec_logo.png')} style={{height: 30}} />
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: done ? K.white : '#0a0a0b', letterSpacing: '-0.01em'}}>{done ? 'Inscrito ✓' : 'Inscreva-se'}</div>
      </div>
      <svg width="44" height="54" viewBox="0 0 44 54" style={{position: 'absolute', left: 300 + cx, top: 40 + cy}}>
        <path d="M4 2 L4 42 L14 32 L22 50 L29 47 L21 29 L36 29 Z" fill="#fff" stroke="#000" strokeWidth="2" />
      </svg>
    </div>
  );
};

export {MONO};
