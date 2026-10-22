import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {K, DISPLAY, SANS, MONO, ARRIVE, LEAVE, Fonts, slam, Ring, kick, Grain} from '../yt/kit';

/*
 * SILASTEC CAST intro, 6 s (180 f @30). Opaque. Cut to the music bed
 * "Strong Future" (invideo stock M15) played from 24.4 s of the track:
 * hits at f19, f34, f49; build peak f86; hit f108; decay from f165.
 */
export const INTRO15_FRAMES = 180;
const H1 = 19, H2 = 34, H3 = 49, PEAK = 86, H4 = 108, EXIT = 168;
const RAPID = [
  {t: 'OSCAR', at: 58},
  {t: 'ATORES', at: 64},
  {t: 'BRASIL', at: 70},
  {t: 'VOCÊ', at: 76},
];
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Streak: React.FC<{at: number; dur: number; y: number; dir?: 1 | -1; color?: string; h?: number}> = ({at, dur, y, dir = 1, color = K.orange, h = 3}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], {...CL, easing: ARRIVE});
  if (f < at || f > at + dur + 4) return null;
  const x = dir === 1 ? -40 + p * 140 : 140 - p * 140;
  return (
    <div style={{position: 'absolute', top: y, left: `${x - 30}%`, width: '30%', height: h, background: `linear-gradient(90deg, transparent, ${color}, #fff)`, filter: 'blur(1px)', opacity: 1 - interpolate(f, [at + dur, at + dur + 4], [0, 1], CL), boxShadow: `0 0 24px ${color}`}} />
  );
};

/* RGB-split glitch slice on hits */
const Glitch: React.FC<{ats: number[]}> = ({ats}) => {
  const f = Math.floor(useCurrentFrame());
  const on = ats.some((a) => f >= a + 1 && f < a + 3);
  if (!on) return null;
  const seed = (f * 97) % 13;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {[0, 1].map((i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: `${(seed * 7 + i * 31) % 90}%`, height: 4 + ((seed + i) % 3) * 6, background: i % 2 ? 'rgba(124,0,218,0.35)' : 'rgba(249,98,5,0.35)', transform: `translateX(${(i - 1) * 40}px)`, mixBlendMode: 'screen'}} />
      ))}
    </AbsoluteFill>
  );
};

const Big: React.FC<{text: string; at: number; out: number; grad?: boolean; size?: number}> = ({text, at, out, grad, size = 330}) => {
  const f = useCurrentFrame();
  const st = slam(f, at, out);
  if (!st.show || f >= out) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: DISPLAY, fontSize: size, lineHeight: 0.86, letterSpacing: '-0.03em', textTransform: 'uppercase', opacity: st.o, transform: `scale(${st.s})`, filter: st.blur ? `blur(${st.blur}px)` : undefined, whiteSpace: 'nowrap', ...(grad ? {background: K.grad, WebkitBackgroundClip: 'text', color: 'transparent'} : {color: K.white}), textShadow: grad ? undefined : '0 20px 90px rgba(249,98,5,0.35)'}}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

const Stage: React.FC = () => {
  const f = useCurrentFrame();
  // background: ribbon art, pushes in, brightens on peak
  const bgO = interpolate(f, [0, H1, PEAK - 6, PEAK, EXIT], [0.12, 0.3, 0.32, 0.6, 0.5], CL);
  const bgS = 1.18 - f * 0.0009 + (f >= PEAK ? interpolate(f, [PEAK, PEAK + 10], [0.04, 0], {...CL, easing: ARRIVE}) : 0);
  const exitU = interpolate(f, [EXIT, 180], [0, 1], {...CL, easing: LEAVE});
  const flashA = interpolate(f, [H3, H3 + 1, H3 + 3], [0.35, 0.35, 0], CL) * (f >= H3 ? 1 : 0);
  const flashP = interpolate(f, [PEAK, PEAK + 1, PEAK + 5], [0.85, 0.85, 0], CL) * (f >= PEAK ? 1 : 0);
  const flashE = interpolate(f, [178, 179, 180], [0, 1, 1], CL);
  const ky = kick(f, [H1, H2, H3, PEAK, H4]);
  const lock = f >= PEAK;
  const L = slam(f, PEAK, EXIT + 8);
    const subP = interpolate(f, [H4, H4 + 14], [0, 1], {...CL, easing: ARRIVE});
  const barP = interpolate(f, [H4 + 2, H4 + 22], [0, 1], {...CL, easing: ARRIVE});
  const credP = interpolate(f, [H4 + 12, H4 + 26], [0, 1], {...CL, easing: ARRIVE});
  const drift = Math.max(0, f - PEAK) * 0.0006;
  return (
    <AbsoluteFill style={{background: K.black, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translateY(${ky}px) scale(${1 + 0.25 * exitU})`, filter: exitU ? `blur(${24 * exitU}px)` : undefined}}>
        <Img src={staticFile('brand/art/ribbon-hero-16x9.webp')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: bgO, transform: `scale(${bgS}) translateX(${-f * 0.5}px)`, filter: `blur(${interpolate(f, [0, H1], [26, 4], CL)}px)`}} />
        <AbsoluteFill style={{background: 'radial-gradient(90% 80% at 50% 50%, rgba(10,10,11,0.05) 20%, rgba(10,10,11,0.95) 100%)'}} />

        {/* tension: light streaks before the first hit, and converging into the peak */}
        <Streak at={2} dur={16} y={540} />
        <Streak at={8} dur={11} y={470} dir={-1} color={K.violet} h={2} />
        <Streak at={12} dur={7} y={610} color={K.pink} h={2} />
        <Streak at={78} dur={8} y={520} color={K.orange} h={5} />
        <Streak at={80} dur={6} y={560} dir={-1} color={K.violet} h={5} />

        {/* teaser kicker */}
        <div style={{position: 'absolute', top: 500, left: 0, right: 0, textAlign: 'center', opacity: interpolate(f, [4, 12, H1 - 1, H1], [0, 1, 1, 0], CL)}}>
          <div style={{fontFamily: MONO, fontSize: 30, letterSpacing: '0.5em', color: K.white}}>{'SILASTEC CAST · NOVO EPISÓDIO'.slice(0, Math.max(0, Math.floor((f - 4) * 2.2)))}</div>
        </div>

        {/* three hits: the three words of the episode */}
        <Big text="IA" at={H1 - 2} out={H2 - 1} grad size={460} />
        <Big text="CINEMA" at={H2 - 2} out={H3 - 1} size={360} />
        <Big text="HOLLYWOOD" at={H3 - 2} out={58 - 1} grad size={300} />
        {RAPID.map((w, i) => (
          <Big key={w.t} text={w.t} at={w.at - 2} out={(RAPID[i + 1]?.at ?? PEAK - 4) - 1} size={250} grad={i % 2 === 1} />
        ))}

        {/* lockup on the peak */}
        {lock ? (
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + drift})`}}>
            <div style={{marginTop: -90, opacity: L.o, transform: `scale(${L.s})`, filter: L.blur ? `blur(${L.blur}px)` : undefined}}>
              <Img src={staticFile('silastec/silastec_logo.png')} style={{height: 300, filter: 'drop-shadow(0 20px 80px rgba(124,0,218,0.45))'}} />
            </div>
            <div style={{position: 'absolute', top: 700, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{height: 5, width: 760 * barP, background: K.grad, boxShadow: '0 0 30px rgba(255,56,129,0.6)'}} />
              <div style={{marginTop: 26, overflow: 'hidden'}}>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 76, letterSpacing: '-0.01em', color: K.white, transform: `translateY(${(1 - subP) * 80}px)`, opacity: subP}}>IA no cinema</div>
              </div>
              <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 18, opacity: credP, transform: `translateY(${(1 - credP) * 20}px)`}}>
                <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: '0.3em', color: K.dim}}>UMA PRODUÇÃO</div>
                <Img src={staticFile('brand/logos/fulgortec-horizontal-gradient-on-dark.svg')} style={{height: 46}} />
              </div>
            </div>
          </AbsoluteFill>
        ) : null}

        <Ring at={H1 - 2} />
        <Ring at={H2 - 2} color={K.violet} />
        <Ring at={H3 - 2} color={K.pink} />
        <Ring at={PEAK} />
        <Ring at={PEAK + 4} x="62%" color={K.violet} />
        <Glitch ats={[H1, H2, H3, PEAK, 58, 64, 70, 76]} />
      </AbsoluteFill>
      <Grain o={0.07} />
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(flashA, flashP, flashE)}} />
    </AbsoluteFill>
  );
};

export const Intro15: React.FC = () => (
  <AbsoluteFill style={{background: K.black}}>
    <Fonts />
    <CameraMotionBlur shutterAngle={180} samples={6}>
      <Stage />
    </CameraMotionBlur>
  </AbsoluteFill>
);
