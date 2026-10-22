import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {ARRIVE, ArtBg, DISPLAY, Grain, K, LEAVE, Mono, Ring, SANS, kick, slam, sweep, Word} from '../yt/kit';
import {CH15, chapter15At} from './data15';

const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const F = (s: number) => Math.round(s * 30);
/** local frame of absolute time t inside a sequence starting at absolute a */
export const LF = (t: number, a: number) => F(t) - F(a);

export const Chrome15: React.FC<{t: number; src?: string}> = ({t, src}) => {
  const c = chapter15At(t);
  return (
    <>
      <div style={{position: 'absolute', left: 64, top: 52, display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{width: 9, height: 9, borderRadius: 9, background: K.orange, boxShadow: `0 0 12px ${K.orange}`}} />
        <Mono style={{fontSize: 17, color: K.white, letterSpacing: '0.24em'}}>SILASTEC CAST</Mono>
        <Mono style={{fontSize: 17, color: K.faint, letterSpacing: '0.24em'}}>· IA NO CINEMA</Mono>
      </div>
      <Mono style={{position: 'absolute', right: 64, top: 52, fontSize: 17, color: K.faint, letterSpacing: '0.24em'}}>
        {c.n === '00' ? 'ABERTURA' : `CAP ${c.n} / 09 — ${c.title.toUpperCase()}`}
      </Mono>
      {src ? <Mono style={{position: 'absolute', left: 64, bottom: 48, fontSize: 16, color: K.faint, letterSpacing: '0.2em'}}>{src}</Mono> : null}
    </>
  );
};

export const Card15: React.FC<{dur: number; t: number; src?: string; art?: string; artO?: number; children: React.ReactNode}> = ({dur, t, src, art, artO, children}) => {
  const f = useCurrentFrame();
  const o = sweep(f, 0, 8);
  const x = interpolate(f, [dur - 3, dur], [0, 1], {...CL, easing: LEAVE});
  const line = interpolate(f, [0, 3, 9], [0, 1, 0], CL);
  return (
    <AbsoluteFill style={{clipPath: `inset(${(1 - o) * 50}% 0 ${(1 - o) * 50}% 0)`, transform: `scale(${1 + 0.06 * x})`, filter: x ? `blur(${12 * x}px)` : undefined}}>
      <ArtBg art={art} o={artO} />
      <Chrome15 t={t} src={src} />
      {children}
      <Grain />
      <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: K.grad, opacity: line, transform: `scaleX(${o})`}} />
    </AbsoluteFill>
  );
};

export const Kicker: React.FC<{children: React.ReactNode; at?: number; style?: React.CSSProperties}> = ({children, at = 4, style}) => {
  const f = useCurrentFrame();
  const p = sweep(f, at, 12);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: p, transform: `translateX(${(1 - p) * -40}px)`, ...style}}>
      <div style={{width: 48 * p, height: 3, background: K.grad}} />
      <Mono style={{fontSize: 22, color: K.orange, letterSpacing: '0.26em'}}>{children}</Mono>
    </div>
  );
};

export const Wipe: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties; dur?: number}> = ({at, children, style, dur = 10}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = sweep(f, at, dur);
  return <div style={{clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`, transform: `translateX(${(1 - p) * 24 + (f - at) * 0.05}px)`, ...style}}>{children}</div>;
};

/* ---------- STAT: big number/word with optional count-up ---------- */
export const StatCard: React.FC<{a: number; dur: number; kicker: string; big: string; count?: number; prefix?: string; suffix?: string; line?: string; sub?: string; src?: string; hit?: number; color?: string}> = ({a, dur, kicker, big, count, prefix = '', suffix = '', line, sub, src, hit, color = K.orange}) => {
  const f = useCurrentFrame();
  const h = hit !== undefined ? Math.max(6, LF(hit, a)) : 8;
  const v = count !== undefined ? Math.round(interpolate(f, [h - 20, h], [0, count], {...CL, easing: ARRIVE})) : null;
  const st = slam(f, h);
  const txt = v !== null ? `${prefix}${v}${suffix}` : big;
  const size = txt.length > 9 ? 190 : txt.length > 6 ? 250 : 330;
  return (
    <Card15 dur={dur} t={a} src={src}>
      <div style={{position: 'absolute', left: 140, top: 230}}><Kicker>{kicker}</Kicker></div>
      <div style={{position: 'absolute', left: 130, top: 300, transform: `translateY(${kick(f, [h])}px)`}}>
        <div style={{fontFamily: DISPLAY, fontSize: size, lineHeight: 0.9, color, letterSpacing: '-0.03em', transform: `scale(${f >= h ? st.s : 1})`, transformOrigin: 'left center', opacity: count !== undefined ? 1 : st.o, textShadow: '0 20px 80px rgba(249,98,5,0.3)', whiteSpace: 'nowrap'}}>{txt}</div>
      </div>
      {line ? (
        <div style={{position: 'absolute', left: 140, top: 330 + size * 0.95, width: 1500}}>
          <Wipe at={h + 6} style={{fontFamily: SANS, fontWeight: 700, fontSize: 56, color: K.white, letterSpacing: '-0.015em', lineHeight: 1.12}}>{line}</Wipe>
          {sub ? <Wipe at={h + 14} style={{fontFamily: SANS, fontWeight: 300, fontSize: 38, color: K.dim, marginTop: 16, lineHeight: 1.25}}>{sub}</Wipe> : null}
        </div>
      ) : null}
      <Ring at={h} x="30%" y="45%" />
    </Card15>
  );
};

/* ---------- QUOTE / STATEMENT ---------- */
export const QuoteCard: React.FC<{a: number; dur: number; kicker: string; text: string; who?: string; src?: string; marks?: boolean}> = ({a, dur, kicker, text, who, src, marks = true}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  const per = Math.max(2, Math.min(5, Math.floor((dur * 0.55) / Math.max(1, words.length))));
  const size = text.length > 90 ? 64 : text.length > 55 ? 78 : 96;
  return (
    <Card15 dur={dur} t={a} src={src} art="brand/art/waves-16x9.webp" artO={0.22}>
      <div style={{position: 'absolute', left: 140, top: 210}}><Kicker>{kicker}</Kicker></div>
      {marks ? <div style={{position: 'absolute', left: 110, top: 220, fontFamily: DISPLAY, fontSize: 340, color: K.orange, opacity: 0.22 * sweep(f, 2, 10)}}>“</div> : null}
      <div style={{position: 'absolute', left: 150, top: 330, width: 1560, fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1.12, letterSpacing: '-0.02em', color: K.white}}>
        {words.map((w, i) => {
          const at = 6 + i * per;
          const p = sweep(f, at, 8);
          return <span key={i} style={{display: 'inline-block', marginRight: '0.26em', opacity: f >= at ? 1 : 0.0, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 18}px)`}}>{w}</span>;
        })}
      </div>
      {who ? <div style={{position: 'absolute', left: 150, bottom: 150}}><Wipe at={10} style={{fontFamily: SANS, fontWeight: 600, fontSize: 34, color: K.orange}}>{who}</Wipe></div> : null}
    </Card15>
  );
};

/* ---------- TIMELINE ---------- */
export const TimelineCard: React.FC<{a: number; dur: number; kicker: string; steps: {at: number; label: string; sub?: string; red?: boolean}[]; src?: string; title?: string}> = ({a, dur, kicker, steps, src, title}) => {
  const f = useCurrentFrame();
  const n = steps.length;
  const ats = steps.map((s) => Math.max(4, LF(s.at, a)));
  const prog = interpolate(f, [ats[0], ats[n - 1] + 6], [0, 1], {...CL, easing: ARRIVE});
  return (
    <Card15 dur={dur} t={a} src={src}>
      <div style={{position: 'absolute', left: 140, top: 210}}><Kicker>{kicker}</Kicker></div>
      {title ? <div style={{position: 'absolute', left: 140, top: 270}}><Word text={title} at={6} size={110} /></div> : null}
      <div style={{position: 'absolute', left: 160, top: 600, width: 1600, height: 4, background: 'rgba(255,255,255,0.12)'}}>
        <div style={{width: `${prog * 100}%`, height: 4, background: K.grad}} />
      </div>
      {steps.map((s, i) => {
        const at = ats[i];
        const st = slam(f, at);
        const x = n === 1 ? 160 : 160 + i * (n > 1 ? 1600 / (n - 1) : 0);
        return (
          <div key={i} style={{position: 'absolute', left: x - (i === n - 1 && n > 1 ? 420 : 0), top: 520, width: 440, textAlign: i === n - 1 && n > 1 ? 'right' : 'left', transform: `translateY(${kick(f, [at])}px)`}}>
            <div style={{position: 'absolute', left: i === n - 1 && n > 1 ? 412 : -8, top: 70, width: 24, height: 24, borderRadius: 24, background: f >= at ? (s.red ? K.red : K.orange) : 'rgba(255,255,255,0.2)', boxShadow: f >= at ? `0 0 24px ${s.red ? K.red : K.orange}` : undefined}} />
            <div style={{fontFamily: DISPLAY, fontSize: 92, lineHeight: 0.9, color: s.red ? K.red : K.white, opacity: st.o, transform: `scale(${st.s})`, transformOrigin: i === n - 1 && n > 1 ? 'right center' : 'left center', marginTop: 130, whiteSpace: 'nowrap'}}>{f >= at ? s.label : ''}</div>
            {s.sub && f >= at + 6 ? <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 30, color: K.dim, marginTop: 14, opacity: sweep(f, at + 6, 8)}}>{s.sub}</div> : null}
          </div>
        );
      })}
      {steps.map((s, i) => <Ring key={i} at={ats[i]} x={`${((n === 1 ? 160 : 160 + i * (1600 / Math.max(1, n - 1))) / 1920) * 100}%`} y="56%" color={s.red ? K.red : K.orange} />)}
    </Card15>
  );
};

/* ---------- LIST (rules / steps / names) ---------- */
export const ListCard: React.FC<{a: number; dur: number; kicker: string; title?: string; items: {at: number; text: string; tag?: string; accent?: boolean}[]; src?: string; size?: number}> = ({a, dur, kicker, title, items, src, size = 60}) => {
  const f = useCurrentFrame();
  return (
    <Card15 dur={dur} t={a} src={src}>
      <div style={{position: 'absolute', left: 140, top: 210}}><Kicker>{kicker}</Kicker></div>
      {title ? <div style={{position: 'absolute', left: 140, top: 270}}><Word text={title} at={5} size={120} /></div> : null}
      <div style={{position: 'absolute', left: 140, top: title ? 440 : 320, width: 1640}}>
        {items.map((it, i) => {
          const at = Math.max(6, LF(it.at, a));
          if (f < at) return null;
          const p = sweep(f, at, 10);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 28, marginBottom: 30, opacity: p, transform: `translateX(${(1 - p) * -60}px) translateY(${kick(f, [at]) * 0.5}px)`}}>
              <div style={{fontFamily: DISPLAY, fontSize: size * 0.9, color: K.orange, width: size * 1.3}}>{it.tag ?? String(i + 1).padStart(2, '0')}</div>
              <div style={{fontFamily: SANS, fontWeight: it.accent ? 800 : 700, fontSize: size, color: it.accent ? K.orange : K.white, letterSpacing: '-0.015em', lineHeight: 1.08}}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </Card15>
  );
};

/* ---------- VERSUS ---------- */
export const VersusCard: React.FC<{a: number; dur: number; kicker: string; left: {title: string; lines: string[]; at: number}; right: {title: string; lines: string[]; at: number}; src?: string}> = ({a, dur, kicker, left, right, src}) => {
  const f = useCurrentFrame();
  const la = Math.max(5, LF(left.at, a));
  const ra = Math.max(la + 12, LF(right.at, a));
  const col = (s: typeof left, at: number, x: number, c: string) => (
    <div style={{position: 'absolute', left: x, top: 320, width: 740, opacity: slam(f, at).o, transform: `scale(${slam(f, at).s}) translateY(${kick(f, [at])}px)`, transformOrigin: 'left top'}}>
      <div style={{fontFamily: DISPLAY, fontSize: 130, color: c, lineHeight: 0.9}}>{s.title}</div>
      {s.lines.map((l, i) => <Wipe key={i} at={at + 8 + i * 8} style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, color: K.white, marginTop: 22, lineHeight: 1.2}}>{l}</Wipe>)}
    </div>
  );
  return (
    <Card15 dur={dur} t={a} src={src}>
      <div style={{position: 'absolute', left: 140, top: 210}}><Kicker>{kicker}</Kicker></div>
      {col(left, la, 140, K.white)}
      <div style={{position: 'absolute', left: 930, top: 300, width: 3, height: 520, background: K.grad, transform: `scaleY(${sweep(f, la + 6, 14)})`, transformOrigin: 'top'}} />
      <div style={{position: 'absolute', left: 892, top: 500, fontFamily: DISPLAY, fontSize: 80, color: K.orange, opacity: f >= ra - 4 ? 1 : 0}}>✕</div>
      {col(right, ra, 1030, K.orange)}
      <Ring at={ra} x="72%" y="40%" />
    </Card15>
  );
};

/* ---------- BARS (survey) ---------- */
export const BarsCard: React.FC<{a: number; dur: number; kicker: string; title?: string; bars: {at: number; label: string; value: number; color?: string}[]; src?: string}> = ({a, dur, kicker, title, bars, src}) => {
  const f = useCurrentFrame();
  return (
    <Card15 dur={dur} t={a} src={src}>
      <div style={{position: 'absolute', left: 140, top: 210}}><Kicker>{kicker}</Kicker></div>
      {title ? <div style={{position: 'absolute', left: 140, top: 270, width: 1600}}><Wipe at={5} style={{fontFamily: SANS, fontWeight: 800, fontSize: 64, color: K.white, letterSpacing: '-0.02em', lineHeight: 1.1}}>{title}</Wipe></div> : null}
      <div style={{position: 'absolute', left: 140, top: title ? 470 : 360, width: 1640}}>
        {bars.map((b, i) => {
          const at = Math.max(6, LF(b.at, a));
          const p = interpolate(f, [at, at + 22], [0, 1], {...CL, easing: ARRIVE});
          const v = Math.round(b.value * p);
          return (
            <div key={i} style={{marginBottom: 46, opacity: f >= at - 2 ? 1 : 0.15}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 44, color: K.white}}>{b.label}</div>
                <div style={{fontFamily: DISPLAY, fontSize: 120, color: b.color ?? K.orange, lineHeight: 0.9, transform: `scale(${f >= at + 20 ? slam(f, at + 20).s : 1})`, transformOrigin: 'right bottom'}}>{v}%</div>
              </div>
              <div style={{height: 22, background: 'rgba(255,255,255,0.1)', marginTop: 10, borderRadius: 4, overflow: 'hidden'}}>
                <div style={{width: `${b.value * p}%`, height: '100%', background: b.color ?? K.grad}} />
              </div>
            </div>
          );
        })}
      </div>
    </Card15>
  );
};

/* ---------- GLITCH (Tilly) ---------- */
const GlitchText: React.FC<{text: string; f: number; on: number; size: number; color?: string; seed?: string}> = ({text, f, on, size, color = K.white, seed = 'g'}) => {
  const active = f >= on && f < on + 26;
  const amt = active ? interpolate(f, [on, on + 4, on + 26], [0, 1, 0.15], CL) : 0;
  const slices = 7;
  const base: React.CSSProperties = {fontFamily: DISPLAY, fontSize: size, lineHeight: 1.2, textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: '-0.02em'};
  return (
    <div style={{position: 'relative'}}>
      <div style={{...base, color: 'transparent'}}>{text}</div>
      {Array.from({length: slices}).map((_, i) => {
        const dx = amt * (random(`${seed}${i}${Math.floor(f / 2)}`) - 0.5) * 120;
        const top = (i / slices) * 100;
        const bot = 100 - ((i + 1) / slices) * 100;
        return (
          <div key={i} style={{position: 'absolute', inset: 0, clipPath: `inset(${top}% 0 ${bot}% 0)`, transform: `translateX(${dx}px)`}}>
            <div style={{...base, position: 'absolute', left: -amt * 10, top: 0, color: '#ff2a3d', mixBlendMode: 'screen', opacity: amt}}>{text}</div>
            <div style={{...base, position: 'absolute', left: amt * 10, top: 0, color: '#19d3ff', mixBlendMode: 'screen', opacity: amt}}>{text}</div>
            <div style={{...base, position: 'absolute', left: 0, top: 0, color}}>{text}</div>
          </div>
        );
      })}
    </div>
  );
};

export const GlitchCard: React.FC<{a: number; dur: number; kicker: string; first: string; second: string; secondAt: number; stat: string; statAt: number; src?: string}> = ({a, dur, kicker, first, second, secondAt, stat, statAt, src}) => {
  const f = useCurrentFrame();
  const c = Math.max(8, LF(secondAt, a));
  const s = Math.max(c + 10, LF(statAt, a));
  const flick = f >= c && f < c + 20 && Math.floor(f / 2) % 2 === 0;
  return (
    <Card15 dur={dur} t={a} src={src}>
      <div style={{position: 'absolute', left: 140, top: 210}}><Kicker>{kicker}</Kicker></div>
      <div style={{position: 'absolute', left: 140, top: 330, transform: `translateY(${kick(f, [c, s])}px) translateX(${flick ? 14 : 0}px)`}}>
        {f >= c - 2 ? <GlitchText text={second} f={f} on={c} size={230} color={K.orange} seed="b" /> : <GlitchText text={first} f={f} on={4} size={230} seed="a" />}
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 10}}>
          <div style={{width: 14, height: 14, borderRadius: 14, background: K.red, opacity: Math.floor(f / 12) % 2 ? 1 : 0.3}} />
          <Mono style={{fontSize: 22, color: K.white}}>AO VIVO · TV</Mono>
        </div>
      </div>
      <div style={{position: 'absolute', right: 140, bottom: 170, textAlign: 'right', opacity: slam(f, s).o, transform: `scale(${slam(f, s).s})`, transformOrigin: 'right bottom'}}>
        <div style={{fontFamily: DISPLAY, fontSize: 200, color: K.white, lineHeight: 0.9}}>{stat}</div>
        <Mono style={{fontSize: 24, color: K.orange, marginTop: 10}}>VISUALIZAÇÕES</Mono>
      </div>
      <Ring at={s} x="80%" y="72%" />
    </Card15>
  );
};

/* ---------- OFF (Sora) ---------- */
export const OffCard: React.FC<{a: number; dur: number; kicker: string; word: string; offAt: number; line?: string; lineAt?: number; src?: string}> = ({a, dur, kicker, word, offAt, line, lineAt, src}) => {
  const f = useCurrentFrame();
  const o = Math.max(10, LF(offAt, a));
  const la = lineAt !== undefined ? Math.max(o + 8, LF(lineAt, a)) : o + 14;
  const dim = interpolate(f, [o, o + 6], [1, 0.25], CL);
  const strike = sweep(f, o, 8);
  return (
    <Card15 dur={dur} t={a} src={src}>
      <div style={{position: 'absolute', left: 140, top: 210}}><Kicker>{kicker}</Kicker></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', transform: `translateY(${kick(f, [o])}px)`}}>
        <div style={{display: 'inline-block', position: 'relative'}}>
          <div style={{fontFamily: DISPLAY, fontSize: 300, lineHeight: 1, color: K.white, opacity: dim * slam(f, 4).o, transform: `scale(${slam(f, 4).s})`}}>{word}</div>
          <div style={{position: 'absolute', left: -20, right: -20, top: '52%', height: 22, background: K.red, transform: `scaleX(${strike}) rotate(-4deg)`, transformOrigin: 'left', boxShadow: `0 0 30px ${K.red}`}} />
        </div>
        {f >= o ? <div style={{marginTop: 10}}><Word text="OFF" at={o} size={150} color={K.red} /></div> : null}
      </div>
      {line ? <div style={{position: 'absolute', left: 0, right: 0, bottom: 96, textAlign: 'center'}}><Wipe at={la} style={{fontFamily: SANS, fontWeight: 700, fontSize: 52, color: K.white, display: 'inline-block'}}>{line}</Wipe></div> : null}
      <Ring at={o} color={K.red} />
    </Card15>
  );
};

/* ---------- PIPELINE (tool stack) ---------- */
export const PipelineCard: React.FC<{a: number; dur: number; kicker: string; nodes: {at: number; label: string; sub: string}[]; foot?: string; src?: string}> = ({a, dur, kicker, nodes, foot, src}) => {
  const f = useCurrentFrame();
  const n = nodes.length;
  const w = 340;
  const gap = (1640 - n * w) / Math.max(1, n - 1);
  return (
    <Card15 dur={dur} t={a} src={src}>
      <div style={{position: 'absolute', left: 140, top: 210}}><Kicker>{kicker}</Kicker></div>
      {nodes.map((nd, i) => {
        const at = Math.max(6, LF(nd.at, a));
        const st = slam(f, at);
        const x = 140 + i * (w + gap);
        return (
          <React.Fragment key={i}>
            {i > 0 ? <div style={{position: 'absolute', left: x - gap, top: 520, width: gap * sweep(f, at - 4, 8), height: 4, background: K.grad}} /> : null}
            <div style={{position: 'absolute', left: x, top: 400, width: w, height: 240, borderRadius: 24, border: `2px solid ${f >= at ? K.orange : 'rgba(255,255,255,0.15)'}`, background: 'rgba(255,255,255,0.04)', opacity: f >= at ? st.o : 0.3, transform: `scale(${f >= at ? st.s : 1})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
              <div style={{fontFamily: DISPLAY, fontSize: 64, color: K.white}}>{nd.label}</div>
              <Mono style={{fontSize: 18, color: K.orange, textAlign: 'center', padding: '0 16px'}}>{nd.sub}</Mono>
            </div>
          </React.Fragment>
        );
      })}
      {foot ? <div style={{position: 'absolute', left: 140, bottom: 170}}><Wipe at={Math.max(10, LF(nodes[n - 1].at, a) + 10)} style={{fontFamily: SANS, fontWeight: 700, fontSize: 52, color: K.white}}>{foot}</Wipe></div> : null}
    </Card15>
  );
};

/* ---------- CHAPTER ---------- */
export const Chapter15: React.FC<{a: number; dur: number; n: string}> = ({a, dur, n}) => {
  const f = useCurrentFrame();
  const c = CH15.find((x) => x.n === n)!;
  const idx = CH15.findIndex((x) => x.n === n);
  const hit = 5;
  return (
    <Card15 dur={dur} t={a + 0.2} art="brand/art/waves-16x9.webp" artO={0.3}>
      <div style={{position: 'absolute', right: 60, top: 170, transform: `translateY(${kick(f, [hit])}px)`}}>
        <div style={{fontFamily: DISPLAY, fontSize: 600, lineHeight: 0.8, color: 'transparent', WebkitTextStroke: '3px rgba(249,98,5,0.85)', letterSpacing: '-0.04em', transform: `scale(${slam(f, hit).s}) translateX(${-f * 0.6}px)`, opacity: slam(f, hit).o}}>{n}</div>
      </div>
      <Ring at={hit} x="75%" y="45%" />
      <div style={{position: 'absolute', left: 140, top: 380}}>
        <Kicker at={8}>{`CAPÍTULO ${n} / 09`}</Kicker>
        <div style={{marginTop: 28}}>
          <Wipe at={12} dur={12} style={{fontFamily: SANS, fontWeight: 800, fontSize: 96, color: K.white, letterSpacing: '-0.025em', lineHeight: 1.04, width: 1000}}>{c.title}.</Wipe>
        </div>
      </div>
      <div style={{position: 'absolute', left: 140, right: 140, bottom: 120, display: 'flex', gap: 10}}>
        {CH15.slice(1).map((x, i) => {
          const done = i + 1 < idx;
          const cur = i + 1 === idx;
          const p = cur ? sweep(f, 14, 20) : done ? 1 : 0;
          return (
            <div key={x.n} style={{flex: 1}}>
              <div style={{height: 4, background: 'rgba(255,255,255,0.14)', position: 'relative', overflow: 'hidden'}}>
                <div style={{position: 'absolute', inset: 0, width: `${p * 100}%`, background: cur ? K.grad : 'rgba(255,255,255,0.55)'}} />
              </div>
              <Mono style={{fontSize: 14, marginTop: 10, color: cur ? K.white : K.faint}}>{x.n}</Mono>
            </div>
          );
        })}
      </div>
    </Card15>
  );
};

/* ---------- PIP FRAME (tutorial) ---------- */
export const PIP15 = {x: 48, y: 1080 - 48 - 320, s: 320};
export const PipFrame15: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const p = sweep(f, 0, 12);
  const q = interpolate(f, [dur - 10, dur], [0, 1], {...CL, easing: LEAVE});
  const P = PIP15;
  return (
    <div style={{position: 'absolute', left: P.x - 4, top: P.y - 4, width: P.s + 8, height: P.s + 8, opacity: p * (1 - q)}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 20, padding: 4, background: K.grad, WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude'}} />
      <Mono style={{position: 'absolute', left: 0, top: -34, fontSize: 15, color: K.white, letterSpacing: '0.2em'}}>SILAS · AO VIVO</Mono>
    </div>
  );
};

/* ---------- END CARD with presenter box ---------- */
export const END15 = {x: 120, y: 300, w: 800, h: 450};
export const EndCard15: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const B = END15;
  const clip = `path(evenodd, 'M0 0 H1920 V1080 H0 Z M${B.x} ${B.y} H${B.x + B.w} V${B.y + B.h} H${B.x} Z')`;
  const o = sweep(f, 0, 10);
  const slot = (x: number, y: number, w: number, h: number, at: number, label: string) => {
    const p = sweep(f, at, 12);
    return (
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 22, border: '2px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.03)', opacity: p, transform: `scale(${0.94 + 0.06 * p})`}}>
        <Mono style={{position: 'absolute', left: 24, top: -40, fontSize: 18, color: K.dim}}>{label}</Mono>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: clip, opacity: o}}>
        <ArtBg art="brand/art/ribbon-hero-16x9.webp" o={0.32} />
        <Chrome15 t={a + 0.5} />
        <div style={{position: 'absolute', left: B.x, top: 160}}><Kicker at={6}>OBRIGADO POR ASSISTIR</Kicker></div>
        <div style={{position: 'absolute', left: B.x, top: B.y + B.h + 50}}>
          <Wipe at={10} style={{fontFamily: SANS, fontWeight: 800, fontSize: 54, color: K.white, letterSpacing: '-0.02em'}}>Comenta: você assistiria?</Wipe>
          <Wipe at={18} style={{fontFamily: SANS, fontWeight: 300, fontSize: 32, color: K.dim, marginTop: 12}}>Um filme 100% feito com inteligência artificial.</Wipe>
        </div>
        {slot(1040, 210, 760, 428, 12, 'ASSISTA A SEGUIR')}
        {slot(1040, 720, 360, 203, 18, 'MAIS DO CANAL')}
        <div style={{position: 'absolute', left: 1470, top: 700, width: 240, height: 240, borderRadius: 240, border: '2px solid rgba(249,98,5,0.7)', opacity: sweep(f, 24, 12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
          <Mono style={{fontSize: 18, color: K.white}}>INSCREVA-SE</Mono>
        </div>
        <div style={{position: 'absolute', left: 64, bottom: 44, display: 'flex', alignItems: 'center', gap: 28}}>
          <Img src={staticFile('brand/logos/fulgortec-horizontal-white.svg')} style={{height: 34, opacity: 0.85}} />
          <Mono style={{fontSize: 16, color: K.faint}}>FULGORTECH.COM</Mono>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: B.x - 3, top: B.y - 3, width: B.w + 6, height: B.h + 6, border: '3px solid transparent', borderImage: `${K.grad} 1`, opacity: o}} />
      <Grain />
    </AbsoluteFill>
  );
};
