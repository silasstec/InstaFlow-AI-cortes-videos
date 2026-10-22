import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Fonts, K, LowerThird, Mono} from '../yt/kit';
import {Sting} from '../yt/cards';
import {Shade, SlamPairs, Stack, Stamp, Subscribe} from '../yt/overlays';
import {EV15, Ev, TOTAL15} from './data15';
import {BarsCard, Chapter15, Chrome15, EndCard15, F, GlitchCard, LF, ListCard, OffCard, PipelineCard, PipFrame15, QuoteCard, StatCard, TimelineCard, VersusCard} from './ui15';

export const YT15_FRAMES = F(TOTAL15);

const col = (c?: string) => (c === 'orange' ? K.orange : c === 'red' ? K.red : c);

/** full-screen cards: a = absolute start (s), dur in frames */
const CardFor: React.FC<{e: Ev; dur: number}> = ({e, dur}) => {
  const a = e.t0;
  const p = e.p;
  switch (e.type) {
    case 'stat':
      return <StatCard a={a} dur={dur} {...p} color={col(p.color)} />;
    case 'quote':
      return <QuoteCard a={a} dur={dur} {...p} />;
    case 'timeline':
      return <TimelineCard a={a} dur={dur} {...p} />;
    case 'list':
      return <ListCard a={a} dur={dur} {...p} />;
    case 'versus':
      return <VersusCard a={a} dur={dur} {...p} />;
    case 'bars':
      return <BarsCard a={a} dur={dur} {...p} bars={p.bars.map((b: any) => ({...b, color: col(b.color)}))} />;
    case 'glitch':
      return <GlitchCard a={a} dur={dur} {...p} />;
    case 'off':
      return <OffCard a={a} dur={dur} {...p} />;
    case 'pipeline':
      return <PipelineCard a={a} dur={dur} {...p} />;
    case 'chapter':
      return <Chapter15 a={a} dur={dur} n={p.n} />;
    default:
      return null;
  }
};

/** overlays on presenter / b-roll shots; every absolute time converted to the sequence's local frame */
const OverFor: React.FC<{e: Ev; dur: number}> = ({e, dur}) => {
  const a = e.t0;
  const p = e.p;
  const l = (t: number) => Math.max(0, LF(t, a));
  switch (e.type) {
    case 'stack':
      return (
        <Stack
          x={p.x}
          y={p.y}
          out={dur}
          size={p.size}
          align={p.align}
          numbered={p.numbered}
          title={p.title ? {at: l(p.title.at), text: p.title.text} : undefined}
          items={p.items.map((it: any) => ({...it, at: l(it.at)}))}
        />
      );
    case 'stamp':
      return <Stamp at={0} out={dur} text={p.text} x={p.x} y={p.y} rot={p.rot} size={p.size} color={col(p.color)} />;
    case 'slam':
      return <SlamPairs y={p.y} size={p.size} items={p.items.map((w: any) => ({light: w.light, heavy: w.heavy, color: col(w.color), at: l(w.at), out: w.out !== undefined ? l(w.out) : dur - 1}))} />;
    case 'shade':
      return <Shade side={p.side} f1={dur} o={p.o ?? 0.55} />;
    case 'lt':
      return <LowerThird name={p.name} role={p.role} inF={4} outF={dur} />;
    case 'subscribe':
      return <Subscribe at={0} out={dur} />;
    default:
      return null;
  }
};

/** intervals where the channel chrome is hidden (full cards draw their own) */
const HIDE = EV15.filter((e) => e.k === 'card' || e.k === 'sting' || e.k === 'end' || e.k === 'pip').map((e) => [F(e.t0), F(e.t1)] as const);
const TUT = EV15.find((e) => e.k === 'pip')!;
const TUT_HIDE = [F(TUT.t0) - 15, F(TUT.t1) + 6] as const;

const ChromeLayer: React.FC = () => {
  const f = useCurrentFrame();
  const hidden = HIDE.some(([a, b]) => f >= a && f < b) || (f >= TUT_HIDE[0] && f < TUT_HIDE[1]);
  if (hidden) return null;
  const t = f / 30;
  return (
    <>
      <Chrome15 t={t} />
      {/* AI disclosure on every presenter/b-roll shot (YouTube altered-content + AI Act art. 50 spirit) */}
      <Mono style={{position: 'absolute', right: 64, bottom: 48, fontSize: 14, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.2em'}}>APRESENTADOR DIGITAL · GERADO COM IA</Mono>
    </>
  );
};

export const YT15Overlay: React.FC = () => (
  <AbsoluteFill>
    <Fonts />
    <ChromeLayer />
    {EV15.map((e, i) => {
      const from = F(e.t0);
      const dur = Math.max(1, F(e.t1) - from);
      return (
        <Sequence key={i} from={from} durationInFrames={dur} layout="none">
          <AbsoluteFill>
            {e.k === 'card' ? <CardFor e={e} dur={dur} /> : null}
            {e.k === 'over' ? <OverFor e={e} dur={dur} /> : null}
            {e.k === 'sting' ? <Sting dur={dur} /> : null}
            {e.k === 'pip' ? <PipFrame15 dur={dur} /> : null}
            {e.k === 'end' ? <EndCard15 a={e.t0} dur={dur} /> : null}
          </AbsoluteFill>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
