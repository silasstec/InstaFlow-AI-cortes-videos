import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {ARRIVE, ArtBg, DISPLAY, Grain, K, LEAVE, MONO, Mono, Ring, SANS, kick, slam, sweep, Word} from './kit';
import {CHAPTERS, END_BOX, chapterAt} from './data';

const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const T = (s: number) => Math.round(s * 30);
/** local frame of global time t inside a sequence that starts at global a */
export const L = (t: number, a: number) => T(t) - T(a);

/* ---------- shared chrome ---------- */
export const Chrome: React.FC<{t: number; src?: string; dark?: boolean}> = ({t, src}) => {
  const c = chapterAt(t);
  return (
    <>
      <div style={{position: 'absolute', left: 64, top: 52, display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{width: 9, height: 9, borderRadius: 9, background: K.orange, boxShadow: `0 0 12px ${K.orange}`}} />
        <Mono style={{fontSize: 17, color: K.white, letterSpacing: '0.24em'}}>SILASTEC CAST</Mono>
        <Mono style={{fontSize: 17, color: K.faint, letterSpacing: '0.24em'}}>· IA NO CINEMA</Mono>
      </div>
      <Mono style={{position: 'absolute', right: 64, top: 52, fontSize: 17, color: K.faint, letterSpacing: '0.24em'}}>
        {c.n === '00' ? 'ABERTURA' : `CAP ${c.n} / 08 — ${c.title.toUpperCase()}`}
      </Mono>
      {src ? <Mono style={{position: 'absolute', left: 64, bottom: 48, fontSize: 16, color: K.faint, letterSpacing: '0.2em'}}>{src}</Mono> : null}
    </>
  );
};

/** Full-screen card wrapper: shutter open from the centre line (8f), smear exit (3f) */
export const Card: React.FC<{dur: number; t: number; src?: string; art?: string; artO?: number; children: React.ReactNode}> = ({dur, t, src, art, artO, children}) => {
  const f = useCurrentFrame();
  const o = sweep(f, 0, 8);
  const x = interpolate(f, [dur - 3, dur], [0, 1], {...CL, easing: LEAVE});
  const line = interpolate(f, [0, 3, 9], [0, 1, 0], CL);
  return (
    <AbsoluteFill style={{clipPath: `inset(${(1 - o) * 50}% 0 ${(1 - o) * 50}% 0)`, transform: `scale(${1 + 0.06 * x})`, filter: x ? `blur(${12 * x}px)` : undefined}}>
      <ArtBg art={art} o={artO} />
      <Chrome t={t} src={src} />
      {children}
      <Grain />
      <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: K.grad, opacity: line, transform: `scaleX(${o})`}} />
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{children: React.ReactNode; at?: number; style?: React.CSSProperties}> = ({children, at = 4, style}) => {
  const f = useCurrentFrame();
  const p = sweep(f, at, 12);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: p, transform: `translateX(${(1 - p) * -40}px)`, ...style}}>
      <div style={{width: 48 * p, height: 3, background: K.grad}} />
      <Mono style={{fontSize: 22, color: K.orange, letterSpacing: '0.26em'}}>{children}</Mono>
    </div>
  );
};

/** sweep-in sans line (never fades: wipes in left->right with a 6f light edge) */
const Wipe: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties; dur?: number}> = ({at, children, style, dur = 10}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = sweep(f, at, dur);
  return <div style={{clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`, transform: `translateX(${(1 - p) * 24 + (f - at) * 0.05}px)`, ...style}}>{children}</div>;
};

/* ---------- NEWS CARDS (S004-S007) ---------- */
const NewsFrame: React.FC<{n: number; head: string; sub: string; src: string; children?: React.ReactNode; f0: number}> = ({n, head, sub, children}) => (
  <>
    <div style={{position: 'absolute', left: 140, top: 230}}>
      <Kicker>{`O QUE ESTÁ BOMBANDO · ${String(n).padStart(2, '0')} / 04`}</Kicker>
    </div>
    <div style={{position: 'absolute', left: 140, top: 300, width: 880}}>
      <Word text={head} at={3} size={112} style={{whiteSpace: 'normal', lineHeight: 0.98}} />
      <Wipe at={14} style={{marginTop: 34, fontFamily: SANS, fontWeight: 300, fontSize: 44, color: K.dim, lineHeight: 1.25, width: 900}}>{sub}</Wipe>
    </div>
    {children}
  </>
);

export const News1: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const hit = L(28.82, a);
  const v = Math.round(interpolate(f, [hit - 22, hit], [0, 300], {...CL, easing: ARRIVE}));
  const st = slam(f, hit);
  return (
    <Card dur={dur} t={a} src="FONTE: NETFLIX · RESULTADOS 2T 2026">
      <NewsFrame n={1} f0={0} head="Netflix usou IA generativa" sub="em cerca de 300 filmes e séries só em 2026." src="" />
      <div style={{position: 'absolute', right: 120, top: 250, textAlign: 'right', transform: `translateY(${kick(f, [hit])}px)`}}>
        <div style={{fontFamily: DISPLAY, fontSize: 330, lineHeight: 0.85, color: K.orange, letterSpacing: '-0.03em', transform: `scale(${f >= hit ? st.s : 1})`, textShadow: '0 20px 80px rgba(249,98,5,0.35)'}}>≈{v}</div>
        <Mono style={{fontSize: 26, color: K.white, marginTop: 18}}>TÍTULOS COM IA</Mono>
      </div>
      <Ring at={hit} x="78%" y="42%" />
    </Card>
  );
};

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

export const News2: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const g = L(33.26, a);
  const c = L(36.34, a);
  return (
    <Card dur={dur} t={a} src="FONTE: EURONEWS · 21 SET 2026">
      <NewsFrame n={2} f0={0} head="Uma atriz que não existe travou ao vivo" sub="num programa de TV… e começou a falar cantonês." src="" />
      <div style={{position: 'absolute', right: 120, top: 420, transform: `translateY(${kick(f, [c])}px)`}}>
        {f >= c - 2 ? <GlitchText text="CANTONÊS" f={f} on={c} size={210} color={K.orange} seed="ct" /> : <GlitchText text="AO VIVO" f={f} on={g} size={210} seed="av" />}
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, justifyContent: 'flex-end'}}>
          <div style={{width: 12, height: 12, borderRadius: 12, background: K.red, opacity: Math.floor(f / 12) % 2 ? 1 : 0.3}} />
          <Mono style={{fontSize: 22, color: K.white}}>REC · ENTREVISTA</Mono>
        </div>
      </div>
      <Ring at={c} x="74%" y="48%" color={K.red} />
    </Card>
  );
};

export const News3: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const c = L(40.2, a);
  const echoes = 4;
  return (
    <Card dur={dur} t={a} src="FONTE: TECHCRUNCH DISRUPT · OUT 2026">
      <NewsFrame n={3} f0={0} head="Um clone digital por décadas" sub="Um astro de Hollywood topa uma versão de IA dele em cena." src="" />
      <div style={{position: 'absolute', right: 130, top: 300, width: 640, height: 520}}>
        {Array.from({length: echoes}).map((_, i) => {
          const p = sweep(f, c + i * 2, 14);
          const y = i * 78 * p;
          return (
            <div key={i} style={{position: 'absolute', right: 0, top: y, fontFamily: DISPLAY, fontSize: 200, lineHeight: 1, letterSpacing: '-0.02em', color: i === 0 ? K.white : 'transparent', WebkitTextStroke: i === 0 ? undefined : `2px rgba(249,98,5,${0.9 - i * 0.14})`, opacity: f >= c + i * 2 ? 1 : 0, transform: `scale(${i === 0 ? slam(f, c).s : 1})`}}>CLONE</div>
          );
        })}
      </div>
      <Ring at={c} x="76%" y="40%" />
    </Card>
  );
};

export const News4: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const off = L(43.98, a);
  const t = f - off;
  const sy = t < 0 ? 1 : interpolate(t, [0, 5], [1, 0.012], {...CL, easing: LEAVE});
  const sx = t < 5 ? 1 : interpolate(t, [5, 10], [1, 0], {...CL, easing: LEAVE});
  const dot = t >= 9 && t < 18 ? interpolate(t, [9, 18], [1, 0], CL) : 0;
  return (
    <Card dur={dur} t={a} src="FONTE: OPENAI · ANÚNCIO DE 24 MAR 2026">
      <NewsFrame n={4} f0={0} head="A OpenAI desligou o Sora" sub="O app de vídeo saiu do ar menos de seis meses depois do lançamento." src="" />
      <div style={{position: 'absolute', right: 120, top: 300, width: 660, height: 420, borderRadius: 28, background: '#0d0d10', border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `scale(${sx}, ${sy})`, filter: t >= 0 ? `brightness(${1 + 2 * (1 - sy)})` : undefined, fontFamily: DISPLAY, fontSize: 230, color: K.white, letterSpacing: '-0.02em'}}>SORA</div>
        <div style={{position: 'absolute', width: 14, height: 14, borderRadius: 14, background: '#fff', boxShadow: '0 0 40px 12px rgba(255,255,255,0.8)', opacity: dot}} />
        {t >= 12 ? <div style={{position: 'absolute', bottom: 34, right: 40}}><Word text="OFF" at={off + 12} size={90} color={K.red} /></div> : null}
      </div>
    </Card>
  );
};

/* ---------- STING SILASTEC × FULGORTEC ---------- */
export const Sting: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const s1 = 10, s2 = 40, s3 = 76;
  const up = interpolate(f, [s3 - 6, s3 + 8], [0, 1], {...CL, easing: ARRIVE});
  const x = interpolate(f, [dur - 4, dur], [0, 1], {...CL, easing: LEAVE});
  const flash = interpolate(f, [dur - 3, dur - 1, dur], [0, 1, 1], CL);
  const ribbon = interpolate(f, [0, 30], [-1, 0.2], {...CL, easing: ARRIVE});
  return (
    <AbsoluteFill style={{background: K.black, overflow: 'hidden', transform: `translateY(${kick(f, [s1, s2])}px) scale(${1 + 0.05 * x})`}}>
      <Img src={staticFile('brand/art/ribbon-side-16x9.webp')} style={{position: 'absolute', width: '120%', height: '120%', left: `${ribbon * 30}%`, top: '-10%', objectFit: 'cover', opacity: 0.55, filter: `blur(${interpolate(f, [0, 20], [30, 0], CL)}px)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(80% 70% at 50% 50%, rgba(10,10,11,0.15), rgba(10,10,11,0.95))'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 360 - up * 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, transform: `scale(${1 - up * 0.22})`}}>
        <div style={{opacity: slam(f, s1).o, transform: `scale(${slam(f, s1).s})`, filter: slam(f, s1).blur ? `blur(${slam(f, s1).blur}px)` : undefined}}>
          <Img src={staticFile('silastec/silastec_logo.png')} style={{height: 150}} />
        </div>
        <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 90, color: K.dim, opacity: f > s1 + 14 ? 1 : 0, transform: `rotate(${Math.min(8, (f - s1) * 0.1)}deg)`}}>×</div>
        <div style={{opacity: slam(f, s2).o, transform: `scale(${slam(f, s2).s})`, filter: slam(f, s2).blur ? `blur(${slam(f, s2).blur}px)` : undefined}}>
          <Img src={staticFile('brand/logos/fulgortec-horizontal-gradient-on-dark.svg')} style={{height: 110}} />
        </div>
      </div>
      <Ring at={s1} x="32%" y="40%" />
      <Ring at={s2} x="68%" y="40%" color={K.violet} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center'}}>
        {f >= s3 ? <Word text="A IA já está fazendo cinema." at={s3} size={110} display={false} style={{fontWeight: 800, letterSpacing: '-0.02em'}} /> : null}
        <div style={{marginTop: 26, opacity: sweep(f, s3 + 10, 12)}}><Mono style={{fontSize: 22, color: K.orange}}>EDIÇÃO 2026 · O QUE JÁ MUDOU EM HOLLYWOOD</Mono></div>
      </div>
      <Grain />
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.9}} />
    </AbsoluteFill>
  );
};

/* ---------- CHAPTER CARD ---------- */
export const Chapter: React.FC<{a: number; dur: number; n: string}> = ({a, dur, n}) => {
  const f = useCurrentFrame();
  const c = CHAPTERS.find((x) => x.n === n)!;
  const idx = CHAPTERS.findIndex((x) => x.n === n);
  const hit = 5;
  return (
    <Card dur={dur} t={a + 0.2} art="brand/art/waves-16x9.webp" artO={0.3}>
      <div style={{position: 'absolute', right: 60, top: 170, transform: `translateY(${kick(f, [hit])}px)`}}>
        <div style={{fontFamily: DISPLAY, fontSize: 600, lineHeight: 0.8, color: 'transparent', WebkitTextStroke: '3px rgba(249,98,5,0.85)', letterSpacing: '-0.04em', transform: `scale(${slam(f, hit).s}) translateX(${-f * 0.6}px)`, opacity: slam(f, hit).o}}>{n}</div>
      </div>
      <Ring at={hit} x="75%" y="45%" />
      <div style={{position: 'absolute', left: 140, top: 380}}>
        <Kicker at={8}>{`CAPÍTULO ${n} / 08`}</Kicker>
        <div style={{marginTop: 28}}>
          <Wipe at={12} dur={12} style={{fontFamily: SANS, fontWeight: 800, fontSize: 96, color: K.white, letterSpacing: '-0.025em', lineHeight: 1.04, width: 940}}>{c.title}.</Wipe>
        </div>
      </div>
      <div style={{position: 'absolute', left: 140, right: 140, bottom: 120, display: 'flex', gap: 10}}>
        {CHAPTERS.slice(1).map((x, i) => {
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
    </Card>
  );
};

/* ---------- STAT: The American Experiment ---------- */
export const Stat: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const h17 = L(95.64, a), t1 = L(98.78, a), t2 = L(100.5, a);
  const bar = (at: number) => interpolate(f, [at, at + 16], [1, 0.5], {...CL, easing: ARRIVE});
  return (
    <Card dur={dur} t={a} src="FONTE: NETFLIX · RESULTADOS 2T 2026">
      <div style={{position: 'absolute', left: 140, top: 200}}><Kicker>DOCUMENTÁRIO · THE AMERICAN EXPERIMENT</Kicker></div>
      <div style={{position: 'absolute', left: 120, top: 330, display: 'flex', alignItems: 'flex-end', gap: 26, transform: `translateY(${kick(f, [h17])}px)`}}>
        <Word text="17" at={h17} size={520} color={K.orange} style={{lineHeight: 0.82}} />
        {f >= h17 + 4 ? <div style={{paddingBottom: 50}}><Word text="min" at={h17 + 4} size={130} /><Wipe at={h17 + 10} style={{fontFamily: SANS, fontWeight: 300, fontSize: 40, color: K.dim, marginTop: 8}}>de imagens feitas com IA</Wipe></div> : null}
      </div>
      <Ring at={h17} x="20%" y="50%" />
      <div style={{position: 'absolute', right: 140, top: 330, width: 640}}>
        {[{at: t1, label: 'DO TEMPO'}, {at: t2, label: 'DO CUSTO'}].map((r) => (
          <div key={r.label} style={{marginBottom: 70, opacity: f >= r.at ? 1 : 0}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
              <Word text="½" at={r.at} size={140} color={K.white} />
              <Word text={r.label} at={r.at + 3} size={70} color={K.dim} />
            </div>
            <div style={{marginTop: 18, height: 14, background: 'rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden'}}>
              <div style={{height: '100%', width: `${bar(r.at) * 100}%`, background: K.grad, borderRadius: 14}} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* ---------- TIMELINE 30 OUT -> 4 DEZ ---------- */
export const Timeline: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const s0 = L(135.52, a), strike = L(136.98, a), d4 = L(137.76, a);
  const travel = interpolate(f, [strike, d4], [0, 1], {...CL, easing: ARRIVE});
  const st = sweep(f, strike, 6);
  return (
    <Card dur={dur} t={a} src="FONTE: FUTURISM · LA VANGUARDIA, OUT 2026">
      <div style={{position: 'absolute', left: 140, top: 230}}><Kicker>GODS DON'T GIVE GIFTS · ESTREIA NOS EUA</Kicker></div>
      <div style={{position: 'absolute', left: 200, right: 200, top: 600, height: 4, background: 'rgba(255,255,255,0.15)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, height: 4, width: `${(0.18 + 0.64 * travel) * 100}%`, background: K.grad}} />
        <div style={{position: 'absolute', left: `${(0.18 + 0.64 * travel) * 100}%`, top: -10, width: 24, height: 24, marginLeft: -12, borderRadius: 24, background: K.orange, boxShadow: `0 0 30px ${K.orange}`}} />
      </div>
      <div style={{position: 'absolute', left: 300, top: 360, textAlign: 'center'}}>
        <div style={{position: 'relative', display: 'inline-block'}}>
          <Word text="30 OUT" at={s0} size={170} color={f >= strike ? K.faint : K.white} />
          <div style={{position: 'absolute', left: -10, right: -10, top: '52%', height: 10, background: K.red, transform: `scaleX(${st})`, transformOrigin: 'left'}} />
        </div>
        <Mono style={{marginTop: 30}}>PREVISÃO ORIGINAL</Mono>
      </div>
      <div style={{position: 'absolute', right: 300, top: 330, textAlign: 'center', transform: `translateY(${kick(f, [d4])}px)`}}>
        <Word text="4 DEZ" at={d4} size={230} color={K.orange} />
        {f >= d4 + 6 ? <Mono style={{marginTop: 24, color: K.white}}>MAIS PERTO DA TEMPORADA DO OSCAR</Mono> : null}
      </div>
      <Ring at={d4} x="72%" y="40%" />
    </Card>
  );
};

/* ---------- QUOTE: critics divided ---------- */
export const Quote: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const h = L(145.16, a), v = L(147.44, a), s = L(148.76, a);
  const line = sweep(f, h + 4, 16);
  return (
    <Card dur={dur} t={a} src="SÍNTESE DAS CRÍTICAS PUBLICADAS">
      <div style={{position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center'}}>
        <Word text="A crítica está dividida" at={h} size={96} style={{display: 'inline-block'}} />
      </div>
      <div style={{position: 'absolute', left: '50%', top: 400, width: 2, height: 440 * line, background: K.grad}} />
      <div style={{position: 'absolute', left: 0, width: '50%', top: 470, textAlign: 'center'}}>
        <Mono style={{fontSize: 24, color: K.dim}}>O VISUAL</Mono>
        <div style={{marginTop: 18, display: 'inline-block'}}><Word text="IMPRESSIONA" at={v} size={150} /></div>
      </div>
      <div style={{position: 'absolute', right: 0, width: '50%', top: 470, textAlign: 'center'}}>
        <Mono style={{fontSize: 24, color: K.dim}}>A HISTÓRIA</Mono>
        <div style={{marginTop: 18, display: 'inline-block'}}><Word text="É FRACA" at={s} size={150} color={K.red} /></div>
      </div>
      <Ring at={v} x="25%" y="58%" />
      <Ring at={s} x="75%" y="58%" color={K.red} />
    </Card>
  );
};

/* ---------- GLITCH INTERVIEW: Tilly Norwood ---------- */
export const GlitchInterview: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const sep = L(172.28, a), pm = L(174.08, a), trav = L(178.88, a), can = L(180.22, a), m14 = L(182.46, a);
  const n = Math.round(interpolate(f, [m14 - 4, m14 + 10], [0, 14], {...CL, easing: ARRIVE}));
  const glitching = f >= trav && f < can + 30;
  const scan = (f * 7) % 420;
  return (
    <Card dur={dur} t={a} src="FONTE: EURONEWS · 21 SET 2026">
      <div style={{position: 'absolute', left: 140, top: 210}}><Kicker>{f >= pm ? 'ENTREVISTA · PIERS MORGAN' : 'SETEMBRO · 2026'}</Kicker></div>
      <div style={{position: 'absolute', left: 140, top: 290, width: 1000, height: 562, borderRadius: 26, overflow: 'hidden', background: 'linear-gradient(160deg,#16161c,#0b0b0e)', border: '1px solid rgba(255,255,255,0.12)', transform: glitching ? `translateX(${(random(`gx${f}`) - 0.5) * 18}px)` : undefined}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 5px)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: scan, height: 90, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.05), transparent)'}} />
        <div style={{position: 'absolute', left: 40, top: 34, display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 12, height: 12, borderRadius: 12, background: K.red, opacity: Math.floor(f / 12) % 2 ? 1 : 0.3}} />
          <Mono style={{fontSize: 20, color: K.white}}>AO VIVO</Mono>
        </div>
        <div style={{position: 'absolute', left: 60, right: 60, top: 190}}>
          {f < trav ? (
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 120}}>
              {Array.from({length: 40}).map((_, i) => (
                <div key={i} style={{flex: 1, borderRadius: 4, background: 'rgba(255,255,255,0.6)', height: 10 + Math.abs(Math.sin(i * 0.6 + f * 0.4)) * 100 * sweep(f, sep, 12)}} />
              ))}
            </div>
          ) : (
            <GlitchText text={f >= can ? 'CANTONÊS' : 'TRAVOU'} f={f} on={f >= can ? can : trav} size={200} color={f >= can ? K.orange : K.white} seed="ti" />
          )}
        </div>
        <Mono style={{position: 'absolute', left: 40, bottom: 30, fontSize: 18, color: K.faint}}>TILLY NORWOOD · ATRIZ GERADA POR IA</Mono>
      </div>
      <div style={{position: 'absolute', right: 140, top: 330, textAlign: 'right', transform: `translateY(${kick(f, [m14])}px)`}}>
        {f >= m14 ? <Word text={`${n}M`} at={m14} size={300} color={K.orange} /> : null}
        {f >= m14 + 8 ? <Mono style={{fontSize: 26, color: K.white, marginTop: 10}}>VISUALIZAÇÕES</Mono> : null}
      </div>
      <Ring at={m14} x="80%" y="42%" />
      <Mono style={{position: 'absolute', left: 140, top: 878, fontSize: 16, color: K.faint}}>RECRIAÇÃO GRÁFICA · NÃO É IMAGEM DO PROGRAMA</Mono>
    </Card>
  );
};

/* ---------- DISNEY x OPENAI deal off ---------- */
export const DealOff: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const hr = L(252.92, a), dis = L(254.22, a), brk = L(254.46, a), acc = L(255.4, a), oai = L(256.98, a);
  const grow = sweep(f, dis + 2, 10);
  const snap = f >= brk + 6;
  const gapPx = snap ? interpolate(f, [brk + 6, brk + 14], [0, 90], {...CL, easing: ARRIVE}) : 0;
  return (
    <Card dur={dur} t={a} src="FONTE: THE HOLLYWOOD REPORTER">
      <div style={{position: 'absolute', left: 140, top: 230}}><Kicker at={Math.max(4, hr - 30)}>SEGUNDO O HOLLYWOOD REPORTER</Kicker></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0}}>
        <div style={{width: 520, textAlign: 'right', transform: `translateX(${-gapPx}px)`}}><Word text="DISNEY" at={dis} size={170} style={{display: 'inline-block'}} /></div>
        <div style={{width: 360, position: 'relative', height: 40}}>
          <div style={{position: 'absolute', left: 30, right: 30, top: 18, height: 4, background: K.grad, transform: `scaleX(${grow})`, clipPath: snap ? 'polygon(0 0, 44% 0, 40% 100%, 0 100%, 0 0, 100% 0, 100% 100%, 58% 100%, 62% 0)' : undefined}} />
          {snap ? <div style={{position: 'absolute', left: '50%', top: -60, marginLeft: -50, width: 100, textAlign: 'center'}}><Word text="✕" at={brk + 6} size={150} color={K.red} display={false} style={{fontWeight: 300}} /></div> : null}
        </div>
        <div style={{width: 520, transform: `translateX(${gapPx}px)`}}>{f >= oai - 50 ? <Word text="OPENAI" at={Math.min(oai, dis + 12)} size={170} /> : null}</div>
      </div>
      <Ring at={brk + 6} x="50%" y="44%" color={K.red} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center'}}>
        {f >= acc ? <Mono style={{fontSize: 30, color: K.white, letterSpacing: '0.3em'}}>ACORDO BILIONÁRIO · ENCERRADO</Mono> : null}
      </div>
    </Card>
  );
};

/* ---------- AMAZON 50 BI -> NEON ---------- */
export const Bi50: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const am = L(328.53, a), ap = L(329.17, a), de = L(330.69, a), b50 = L(332.89, a), oa = L(334.91, a);
  return (
    <Card dur={dur} t={a} src="ARTIFICIAL · LUCA GUADAGNINO · DISTRIBUIÇÃO NEON">
      <div style={{position: 'absolute', left: 140, top: 230}}><Kicker>UM DETALHE QUE PARECE ROTEIRO</Kicker></div>
      <div style={{position: 'absolute', left: 140, top: 330}}>
        <Word text="AMAZON" at={am} size={150} />
        <div style={{display: 'flex', gap: 30, marginTop: 30}}>
          <div style={{opacity: f >= ap ? (f >= de ? 0.35 : 1) : 0}}><Mono style={{fontSize: 26, color: K.white}}>✓ APROVOU O FILME</Mono></div>
          {f >= de ? <Mono style={{fontSize: 26, color: K.red}}>✕ DESISTIU</Mono> : null}
        </div>
      </div>
      <div style={{position: 'absolute', right: 140, top: 300, textAlign: 'right', transform: `translateY(${kick(f, [b50])}px)`}}>
        <Mono style={{fontSize: 24, opacity: f >= b50 ? 1 : 0}}>DEPOIS DE INVESTIR</Mono>
        <Word text="US$ 50 BI" at={b50} size={230} color={K.orange} />
        {f >= oa ? <Word text="NA OPENAI" at={oa} size={110} /> : null}
      </div>
      <Ring at={b50} x="72%" y="44%" />
    </Card>
  );
};

/* ---------- AI FAILURES ---------- */
export const Failures: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const items = [
    {at: L(382.07, a), t: 'Mão que derrete'},
    {at: L(383.36, a), t: 'Rosto que muda entre planos'},
    {at: L(385.6, a), t: 'Física que não convence'},
    {at: L(387.44, a), t: 'Letreiro inventado'},
  ];
  return (
    <Card dur={dur} t={a} src="LIMITES ATUAIS DOS MODELOS DE VÍDEO">
      <div style={{position: 'absolute', left: 140, top: 210}}><Kicker>ONDE A IA AINDA ERRA</Kicker></div>
      <div style={{position: 'absolute', left: 140, right: 140, top: 300, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 34}}>
        {items.map((it, i) => {
          const p = sweep(f, it.at, 10);
          const melt = i === 0 ? interpolate(f, [it.at + 6, it.at + 40], [0, 1], CL) : 0;
          return (
            <div key={i} style={{height: 290, borderRadius: 28, background: '#15151a', border: '1px solid rgba(255,255,255,0.08)', padding: 44, position: 'relative', overflow: 'hidden', opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
              <Mono style={{fontSize: 20, color: K.orange}}>{`0${i + 1}`}</Mono>
              <div style={{marginTop: 40, fontFamily: SANS, fontWeight: 800, fontSize: 64, color: K.white, letterSpacing: '-0.02em', lineHeight: 1.05, transform: `skewY(${melt * 4}deg) scaleY(${1 + melt * 0.18})`, filter: melt ? `blur(${melt * 2}px)` : undefined, transformOrigin: 'top'}}>{it.t}</div>
              <div style={{position: 'absolute', right: 40, top: 30}}>{f >= it.at + 8 ? <Word text="✕" at={it.at + 8} size={90} color={K.red} display={false} /> : null}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/* ---------- SAG-AFTRA 2026 contract ---------- */
export const Contract: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const c = L(398.95, a), r = L(402.31, a);
  const p = sweep(f, 2, 16);
  return (
    <Card dur={dur} t={a} src="SAG-AFTRA · CONTRATO TV/CINEMA 2026">
      <div style={{position: 'absolute', left: 140, top: 230}}><Kicker>O SINDICATO DOS ATORES</Kicker></div>
      <div style={{position: 'absolute', left: 140, top: 320}}>
        <Word text="Novo contrato" at={c} size={150} />
        <Word text="2026" at={c + 8} size={150} color={K.orange} />
      </div>
      <div style={{position: 'absolute', right: 160, top: 200, width: 560, height: 700, borderRadius: 18, background: '#f2efe8', transform: `rotate(${3 - p * 2}deg) translateY(${(1 - p) * 120}px)`, boxShadow: '0 40px 120px rgba(0,0,0,0.6)', padding: 54}}>
        <div style={{fontFamily: MONO, fontSize: 18, color: '#2a2a2a', letterSpacing: '0.2em'}}>AGREEMENT · 2026</div>
        {Array.from({length: 11}).map((_, i) => (
          <div key={i} style={{height: 12, marginTop: i === 0 ? 40 : 22, width: `${60 + random(`l${i}`) * 38}%`, background: i === 6 && f >= r ? K.orange : 'rgba(0,0,0,0.14)', borderRadius: 6}} />
        ))}
        {f >= r ? <div style={{position: 'absolute', left: 54, right: 54, bottom: 70, fontFamily: SANS, fontWeight: 800, fontSize: 42, color: '#111', letterSpacing: '-0.01em'}}>Regras para réplicas digitais.</div> : null}
      </div>
    </Card>
  );
};

/* ---------- GAP cards (short whip transitions) ---------- */
export const GapCard: React.FC<{a: number; dur: number; label: string; sub?: string}> = ({a, dur, label, sub}) => {
  const f = useCurrentFrame();
  return (
    <Card dur={dur} t={a} art="brand/art/signal-16x9.webp" artO={0.4}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center'}}>
        {sub ? <div style={{marginBottom: 20}}><Mono style={{fontSize: 22, color: K.orange}}>{sub}</Mono></div> : null}
        <Word text={label} at={3} size={dur > 40 ? 150 : 170} style={{display: 'inline-block'}} />
      </div>
      <Ring at={3} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${kick(f, [3])}px)`}} />
    </Card>
  );
};

/* ---------- END CARD ---------- */
export const EndCard: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const boxEnd = L(639.364, a);
  const B = END_BOX;
  const hole = f < boxEnd;
  const clip = hole ? `path(evenodd, 'M0 0 H1920 V1080 H0 Z M${B.x} ${B.y} H${B.x + B.w} V${B.y + B.h} H${B.x} Z')` : undefined;
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
        <Chrome t={640} />
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
      {hole ? (
        <div style={{position: 'absolute', left: B.x - 3, top: B.y - 3, width: B.w + 6, height: B.h + 6, border: '3px solid transparent', borderImage: `${K.grad} 1`, opacity: o}} />
      ) : (
        <div style={{position: 'absolute', left: B.x, top: B.y, width: B.w, height: B.h, background: '#0d0d10', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26, clipPath: `inset(0 0 0 0)`}}>
          <div style={{transform: `scale(${slam(f, boxEnd).s})`, opacity: slam(f, boxEnd).o}}><Img src={staticFile('silastec/silastec_logo.png')} style={{height: 110}} /></div>
          <Mono style={{fontSize: 18, color: K.dim, opacity: sweep(f, boxEnd + 8, 10)}}>@SILASTEC-CAST</Mono>
          <div style={{position: 'absolute', inset: -3, border: '3px solid transparent', borderImage: `${K.grad} 1`}} />
        </div>
      )}
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- TOOL STACK (S053-S057) : partially opaque ---------- */
const CATS = ['VÍDEO', 'IMAGEM', 'VOZ', 'PLATAFORMA'];
export const Tools: React.FC<{a: number; dur: number}> = ({a, dur}) => {
  const f = useCurrentFrame();
  const g = (t: number) => L(t, a);
  const catStarts = [g(259.9), g(279.88), g(284.18), g(290.1)];
  let cat = 0;
  catStarts.forEach((s, i) => { if (f >= s) cat = i; });
  const video = [
    {at: g(261.34), name: 'Seedance 2.5', sub: 'BYTEDANCE · ATÉ 30 s COM SOM', end: g(270.6)},
    {at: g(270.84), name: 'Kling 3.0', sub: 'ÁUDIO NATIVO', end: g(273.5)},
    {at: g(273.7), name: 'Veo 3.1', sub: 'GOOGLE', end: g(275.3)},
    {at: g(275.44), name: 'Gemini Omni', sub: 'GOOGLE', end: g(277.2)},
    {at: g(277.42), name: 'Runway Gen-4.5', sub: 'RUNWAY', end: g(279.7)},
  ];
  const imgs = [
    {at: g(280.82), name: 'Nano Banana'},
    {at: g(282.02), name: 'Seedream'},
    {at: g(282.7), name: 'GPT Image'},
    {at: g(283.8), name: 'Flux'},
  ];
  const voice = [
    {at: g(286.44), name: 'CLONAGEM'},
    {at: g(287.2), name: 'LIP SYNC'},
    {at: g(288.58), name: 'TRILHA'},
    {at: g(289.12), name: 'EFEITOS'},
  ];
  const opaque = f >= catStarts[2];
  const allNames = [...video.map((v) => v.name), ...imgs.map((v) => v.name), 'ElevenLabs'];
  const hf = g(291.02);
  const x = interpolate(f, [dur - 3, dur], [0, 1], {...CL, easing: LEAVE});
  return (
    <AbsoluteFill style={{transform: `scale(${1 + 0.06 * x})`, filter: x ? `blur(${12 * x}px)` : undefined}}>
      {opaque ? <ArtBg art="brand/art/waves-16x9.webp" o={0.28} /> : <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 45%), linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 40%)'}} />}
      <Chrome t={a + 1} />
      {/* rail */}
      <div style={{position: 'absolute', right: 64, top: 300, display: 'flex', flexDirection: 'column', gap: 26}}>
        {CATS.map((c, i) => (
          <div key={c} style={{display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'flex-end', opacity: i === cat ? 1 : 0.35}}>
            <Mono style={{fontSize: 18, color: i === cat ? K.white : K.dim}}>{c}</Mono>
            <div style={{width: i === cat ? 46 : 16, height: 3, background: i === cat ? K.grad : 'rgba(255,255,255,0.5)'}} />
          </div>
        ))}
      </div>
      {cat === 0 && f >= video[0].at
        ? video.map((v) =>
            f >= v.at && f < v.end + 3 ? (
              <div key={v.name} style={{position: 'absolute', left: 110, bottom: 130}}>
                <Mono style={{fontSize: 20, color: K.orange, marginBottom: 14}}>NO VÍDEO</Mono>
                <Word text={v.name} at={v.at} out={v.end + 3} size={160} />
                <Wipe at={v.at + 8} style={{marginTop: 18}}><Mono style={{fontSize: 22, color: K.white}}>{v.sub}</Mono></Wipe>
              </div>
            ) : null,
          )
        : null}
      {cat === 1 ? (
        <div style={{position: 'absolute', left: 110, bottom: 130}}>
          <Mono style={{fontSize: 20, color: K.orange, marginBottom: 20}}>NA IMAGEM</Mono>
          <div style={{display: 'flex', gap: 34}}>
            {imgs.map((m) => (f >= m.at ? <Word key={m.name} text={m.name} at={m.at} size={96} /> : null))}
          </div>
        </div>
      ) : null}
      {cat === 2 ? (
        <>
          <div style={{position: 'absolute', left: 140, top: 270}}>
            <Mono style={{fontSize: 22, color: K.orange, marginBottom: 20}}>NA VOZ</Mono>
            <Word text="ElevenLabs" at={g(285.48)} size={190} />
          </div>
          <div style={{position: 'absolute', left: 140, top: 560, display: 'flex', gap: 18}}>
            {voice.map((v) => {
              const p = sweep(f, v.at, 8);
              return f >= v.at ? <div key={v.name} style={{padding: '16px 28px', borderRadius: 999, border: '1px solid rgba(249,98,5,0.7)', transform: `scale(${slam(f, v.at).s})`, opacity: p}}><Mono style={{fontSize: 22, color: K.white}}>{v.name}</Mono></div> : null;
            })}
          </div>
          <div style={{position: 'absolute', left: 140, right: 140, top: 720, height: 180, display: 'flex', alignItems: 'center', gap: 6}}>
            {Array.from({length: 96}).map((_, i) => {
              const h = 12 + Math.abs(Math.sin(i * 0.37 + f * 0.33) * Math.cos(i * 0.11 - f * 0.17)) * 160 * sweep(f, g(285.48), 20);
              return <div key={i} style={{flex: 1, height: h, borderRadius: 4, background: i % 9 === 0 ? K.orange : 'rgba(255,255,255,0.55)'}} />;
            })}
          </div>
        </>
      ) : null}
      {cat === 3 ? (
        <>
          {allNames.map((nm, i) => {
            const ang = (i / allNames.length) * Math.PI * 2 + f * 0.01;
            const conv = interpolate(f, [hf + 10, g(293.3)], [1, 0.12], {...CL, easing: ARRIVE});
            const r = 400 * conv;
            const p = sweep(f, catStarts[3] + i, 10);
            return (
              <div key={nm} style={{position: 'absolute', left: 960 + Math.cos(ang) * r * 1.5, top: 540 + Math.sin(ang) * r, transform: 'translate(-50%,-50%)', opacity: p * Math.max(0, Math.min(1, (conv - 0.3) / 0.4))}}>
                <Mono style={{fontSize: 22, color: K.white}}>{nm.toUpperCase()}</Mono>
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', transform: `translateY(${kick(f, [hf])}px)`}}>
            <Mono style={{fontSize: 22, color: K.orange, marginBottom: 14, opacity: f >= hf ? 1 : 0}}>TUDO NUM LUGAR SÓ</Mono>
            {f >= hf ? <Word text="Higgsfield" at={hf} size={170} style={{display: 'inline-block'}} /> : null}
          </div>
          <Ring at={hf} />
        </>
      ) : null}
      {opaque ? <Grain o={0.04} /> : null}
    </AbsoluteFill>
  );
};
