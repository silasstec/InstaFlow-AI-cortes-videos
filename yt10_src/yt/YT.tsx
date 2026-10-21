import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Fonts, K, LowerThird, Mono, sweep, Word} from './kit';
import {CUTS, TOTAL_S} from './data';
import {Bi50, Chapter, Chrome, Contract, DealOff, EndCard, Failures, GapCard, GlitchInterview, L, News1, News2, News3, News4, Quote, Stat, Sting, T, Timeline, Tools} from './cards';
import {ChapterBadge, ColdTitle, PipFrame, Shade, SlamPairs, Stack, Stamp, Subscribe, Tip} from './overlays';

export const YT_FRAMES = T(TOTAL_S);

/* overlay content for each cut index; a = cut start (global s), d = duration in frames */
const over = (i: number, a: number, d: number): React.ReactNode => {
  const l = (t: number) => L(t, a);
  switch (i) {
    case 1:
      return <Stack x={96} y={900} out={d} items={[{at: l(3.18), text: 'Dezembro · cinemas dos EUA'}]} size={34} />;
    case 2:
      return (
        <>
          <Shade side="bottom" f1={d} o={0.5} />
          <SlamPairs y={340} size={230} items={[
            {at: l(10.18), out: l(11.26), light: 'SEM', heavy: 'CÂMERA'},
            {at: l(11.26), out: l(12.3), light: 'SEM', heavy: 'SET'},
            {at: l(12.3), out: d - 2, light: 'SEM UM ÚNICO', heavy: 'ATOR REAL'},
          ]} />
        </>
      );
    case 3:
      return (
        <>
          <Stamp at={l(15.3)} text="Classificação R" x={90} y={330} size={78} out={d} />
          <Stamp at={l(17.34)} text="18+" x={200} y={560} size={110} rot={5} out={d} />
          <Stamp at={l(20.16)} text="Oscar?" x={1350} y={380} size={130} rot={-5} color={K.orange} out={d} />
        </>
      );
    case 4:
      return (
        <>
          <Shade side="left" f1={d} />
          <Stack x={110} y={380} out={d} size={56} items={[
            {at: l(21.42), text: 'E isso nem é'},
            {at: l(22.66), text: 'A notícia mais louca', accent: true},
            {at: l(23.88), text: 'de 2026.'},
          ]} />
        </>
      );
    case 9:
      return (
        <>
          <Shade side="left" f1={l(56.7)} o={0.5} />
          <Stack x={80} y={330} out={l(56.7)} size={38} numbered title={{at: l(47.1), text: 'HOJE NESTE VÍDEO'}} items={[
            {at: l(52.12), text: 'O que já funciona'},
            {at: l(53.32), text: 'Quem está usando'},
            {at: l(54.48), text: 'As ferramentas na frente'},
          ]} />
          <Shade side="right" f0={l(56.7)} f1={d} o={0.5} />
          <Stack x={80} y={360} align="right" out={d} size={36} title={{at: l(56.9), text: 'E NO FINAL'}} items={[
            {at: l(58.18), text: 'PASSO A PASSO', accent: true},
            {at: l(61.4), text: 'você em qualquer'},
            {at: l(62.5), text: 'lugar do mundo.'},
          ]} />
        </>
      );
    case 10:
      return (
        <>
          <Shade side="left" f1={d} />
          <Stack x={110} y={400} out={d} size={60} items={[
            {at: l(64.02), text: 'Fica até o fim.', accent: true},
            {at: l(65.4), text: 'Essa parte vale o vídeo inteiro.'},
          ]} />
        </>
      );
    case 12:
      return <ChapterBadge n="01" title="Hollywood já está usando" at={4} out={d} />;
    case 13:
      return (
        <>
          <LowerThird name="Ted Sarandos" role="co-CEO · Netflix" inF={l(78.9)} outF={l(82.4)} />
          <Shade side="bottom" f0={l(82.5)} f1={d} o={0.45} />
          <Stack x={96} y={820} out={d} size={40} items={[{at: l(82.68), text: '≈300 títulos em 2026', accent: true}]} />
        </>
      );
    case 14:
      return (
        <>
          <Shade side="bottom" f1={d} o={0.6} />
          <SlamPairs y={640} x={110} align="left" size={150} items={[
            {at: l(86.94), out: l(88.4), light: 'NÃO É MARKETING. É', heavy: 'PÓS-PRODUÇÃO'},
            {at: l(88.4), out: l(89.24), heavy: 'MULTIDÕES'},
            {at: l(89.24), out: l(90.5), heavy: 'BATALHAS'},
            {at: l(90.5), out: l(91.56), heavy: 'PLANOS DE ABERTURA'},
            {at: l(91.56), out: d - 2, light: 'PRÉ-VISUALIZAÇÃO', heavy: 'PREVIZ'},
          ]} />
        </>
      );
    case 16:
      return (
        <>
          <Shade side="left" f1={d} />
          <Stack x={110} y={360} out={d} size={52} title={{at: l(102.38), text: 'REPARA NISSO'}} items={[
            {at: l(104.36), text: 'A cena que era cortada'},
            {at: l(106.62), text: 'por falta de orçamento…'},
            {at: l(108.34), text: 'Agora entra.', accent: true},
          ]} />
        </>
      );
    case 17:
      return <LowerThird name="Brasil 70 — A Saga do Tri" role="Netflix · na lista de títulos com IA" inF={l(111.34)} outF={d} />;
    case 20: {
      const t0 = l(120.96);
      return (
        <>
          <Shade side="bottom" f1={d} o={0.5} />
          <BigTitle at={t0} out={l(128.9)} text="GODS DON'T GIVE GIFTS" sub={{at: l(124.58), text: 'GOSSIP GOBLIN × FABLE'}} />
          <Stack x={110} y={740} out={d} size={48} items={[
            {at: l(129.62), text: '4 histórias'},
            {at: l(131.36), text: 'o corpo é descartável'},
            {at: l(133.12), text: 'A consciência virou mercadoria', accent: true},
          ]} />
        </>
      );
    }
    case 22:
      return (
        <>
          <Shade side="left" f1={d} o={0.5} />
          <Stack x={80} y={340} out={d} size={38} title={{at: l(139.34), text: 'O MOTIVO'}} items={[
            {at: l(141.28), text: 'temporada do'},
            {at: l(141.9), text: 'OSCAR', accent: true},
          ]} />
          <Shade side="right" f0={l(142.6)} f1={d} o={0.5} />
          <Stack x={80} y={340} align="right" out={d} size={38} title={{at: l(142.78), text: 'A DISPUTA'}} items={[
            {at: l(143.6), text: 'MELHOR', accent: true},
            {at: l(144.02), text: 'ANIMAÇÃO', accent: true},
          ]} />
        </>
      );
    case 24:
      return (
        <>
          <Shade side="left" f1={d} />
          <Stack x={110} y={250} out={l(155.2)} size={54} title={{at: l(150.2), text: 'GUARDA ESTA FRASE'}} items={[
            {at: l(152.92), text: 'Não foi um estúdio'},
            {at: l(154.14), text: 'de Hollywood.'},
          ]} />
        </>
      );
    case 27:
      return (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
            <Word text="Atores digitais" at={l(163.64)} out={l(165.5)} size={130} style={{display: 'inline-block'}} />
          </div>
          <LowerThird name="Tilly Norwood" role="atriz criada por IA · Particle6" inF={l(165.86)} outF={d} />
        </>
      );
    case 29:
      return (
        <>
          <LowerThird name="SAG-AFTRA" role="sindicato dos atores de Hollywood" inF={l(185.14)} outF={l(188.0)} />
          <Shade side="bottom" f0={l(188.0)} f1={d} o={0.55} />
          <Quote1 at={l(188.2)} out={d} />
        </>
      );
    case 30:
      return (
        <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center'}}>
          <Mono style={{fontSize: 20, color: K.orange, opacity: sweep(useFrame(), l(193.76), 8)}}>DO OUTRO LADO DA MESA</Mono>
          <div style={{marginTop: 10}}><Word text="Mark Wahlberg" at={l(195.24)} out={d} size={120} style={{display: 'inline-block'}} /></div>
        </div>
      );
    case 31:
      return (
        <>
          <LowerThird name="Mark Wahlberg" role="TechCrunch Disrupt · out. 2026" inF={l(197.88)} outF={l(200.6)} />
          <Shade side="left" f0={l(200.6)} f1={d} o={0.5} />
          <Stack x={80} y={330} out={d} size={36} title={{at: l(200.76), text: 'UMA VERSÃO DE IA DELE'}} items={[
            {at: l(202.66), text: 'na franquia'},
            {at: l(203.02), text: 'TED', accent: true},
            {at: l(203.28), text: 'por décadas'},
            {at: l(205.7), text: 'filhos e netos'},
            {at: l(206.72), text: 'cuidando da imagem'},
          ]} />
        </>
      );
    case 32:
      return (
        <>
          <Shade side="left" f1={d} />
          <Stack x={110} y={360} out={d} size={52} items={[
            {at: l(209.54), text: 'A mesma tecnologia'},
            {at: l(210.72), text: 'que assusta uns…'},
            {at: l(211.98), text: 'outros tratam como'},
            {at: l(213.36), text: 'Herança.', accent: true},
          ]} />
        </>
      );
    case 33:
      return (
        <>
          <LowerThird name="CAA Vault" role="CAA · réplicas digitais de atores" inF={l(221.03)} outF={l(224.9)} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
            <Word text="Réplicas digitais" at={l(225.05)} out={d} size={120} style={{display: 'inline-block'}} />
          </div>
        </>
      );
    case 34:
      return (
        <>
          <Shade side="left" f1={d} />
          <Stack x={110} y={400} out={d} size={50} items={[
            {at: l(227.87), text: 'Wahlberg ainda não foi.'},
            {at: l(229.85), text: 'Mas tem interesse.', accent: true},
          ]} />
        </>
      );
    case 36:
      return (
        <>
          <Shade side="bottom" f1={d} o={0.5} />
          <SlamPairs y={720} size={130} items={[{at: l(236.36), out: d - 2, light: 'EM TEMPO REAL', heavy: 'GUERRA DE FERRAMENTAS'}]} />
        </>
      );
    case 37:
      return (
        <Stack x={80} y={360} out={d} size={38} items={[
          {at: l(239.86), text: 'a primeira baixa'},
          {at: l(240.92), text: 'UM GIGANTE', accent: true},
        ]} />
      );
    case 38:
      return (
        <>
          <Stamp at={l(244.22)} text="Sora — off" x={1290} y={330} size={110} rot={-8} out={d} />
          <Shade side="left" f0={l(246.5)} f1={d} o={0.5} />
          <Stack x={80} y={380} out={d} size={36} items={[
            {at: l(246.96), text: 'topo da App Store'},
            {at: l(248.14), text: 'fim em menos de'},
            {at: l(248.74), text: '6 MESES', accent: true},
          ]} />
        </>
      );
    case 40:
      return (
        <>
          <Shade side="left" f1={d} />
          <Stack x={110} y={400} out={d} size={52} items={[
            {at: l(258.02), text: 'Então, quem está'},
            {at: l(259.0), text: 'Na frente agora?', accent: true},
          ]} />
        </>
      );
    case 42:
      return (
        <>
          <Shade side="left" f1={d} />
          <Stack x={110} y={380} out={d} size={56} items={[
            {at: l(294.78), text: 'Não é escolher a melhor.'},
            {at: l(297.04), text: 'É combinar.', accent: true},
          ]} />
        </>
      );
    case 43:
      return (
        <Stack x={80} y={350} out={d} size={38} title={{at: l(298.78), text: 'UM PLANO DE CINEMA'}} items={[
          {at: l(300.3), text: '3 A 4 MODELOS', accent: true},
          {at: l(302.42), text: 'antes de chegar na tela'},
        ]} />
      );
    case 45:
      return (
        <Stack x={80} y={360} out={d} size={38} items={[
          {at: l(304.59), text: 'Hollywood conta'},
          {at: l(306.03), text: 'ESTA HISTÓRIA', accent: true},
        ]} />
      );
    case 46:
      return <LowerThird name="Artificial" role="de Luca Guadagnino · Andrew Garfield como Sam Altman" inF={l(308.09)} outF={d} />;
    case 47:
      return (
        <>
          <Shade side="bottom" f1={d} o={0.6} />
          <Stack x={110} y={700} out={d} size={46} items={[
            {at: l(317.61), text: 'Altman demitido…', accent: true},
            {at: l(320.79), text: '…e de volta ao comando.'},
            {at: l(321.57), text: 'Estreia: Festival de Nova York, outubro'},
          ]} />
        </>
      );
    case 48:
      return (
        <>
          <Shade side="left" f1={d} />
          <Stack x={110} y={400} out={d} size={52} items={[
            {at: l(326.33), text: 'Um detalhe'},
            {at: l(326.93), text: 'Que parece roteiro', accent: true},
          ]} />
        </>
      );
    case 50:
      return (
        <Stack x={80} y={360} out={d} size={38} title={{at: l(336.07), text: 'QUEM FICOU COM O FILME'}} items={[{at: l(337.15), text: 'NEON', accent: true}]} />
      );
    case 51:
      return (
        <>
          <Shade side="left" f1={d} />
          <Stack x={110} y={360} out={d} size={52} items={[
            {at: l(339.51), text: 'A IA virou personagem.'},
            {at: l(342.61), text: 'E a guerra mais cara'},
            {at: l(343.75), text: 'do entretenimento.', accent: true},
          ]} />
        </>
      );
    case 53:
      return (
        <>
          <Shade side="left" f0={l(353.9)} f1={d} o={0.5} />
          <Stack x={80} y={330} out={d} size={34} title={{at: l(350.49), text: 'LEMBRA'}} items={[
            {at: l(354.25), text: 'não saiu de um estúdio'},
            {at: l(355.99), text: 'SAIU DE UM', accent: true},
            {at: l(356.49), text: 'CRIADOR.', accent: true},
          ]} />
        </>
      );
    case 54:
      return <BrandLT at={l(357.97)} out={d} />;
    case 55:
      return (
        <>
          <Shade side="bottom" f1={d} o={0.6} />
          <div style={{position: 'absolute', left: 64, top: 110, opacity: sweep(useFrame(), 4, 10)}}><Mono style={{fontSize: 18, color: K.orange}}>PRODUZIDO PELA FULGORTEC</Mono></div>
          <SlamPairs y={700} x={110} align="left" size={140} items={[
            {at: l(362.23), out: l(363.17), heavy: 'VIDEOCLIPE'},
            {at: l(363.17), out: l(364.45), heavy: 'TRAILER DE FILME'},
            {at: l(364.45), out: l(366.75), light: 'IMOBILIÁRIO COM', heavy: 'APRESENTADOR DIGITAL'},
            {at: l(366.75), out: l(368.0), heavy: 'PUBLICIDADE'},
          ]} />
          <Strikes at={[l(369.79), l(370.51), l(371.27)]} words={['EQUIPE', 'EQUIPAMENTO', 'SEMANAS']} strike={l(371.75)} />
        </>
      );
    case 56:
      return (
        <Stack x={80} y={340} out={d} size={38} title={{at: l(372.39), text: 'HOJE'}} items={[
          {at: l(373.25), text: 'UM COMPUTADOR', accent: true},
          {at: l(374.25), text: 'e dias.'},
        ]} />
      );
    case 58:
      return (
        <Stack x={80} y={360} out={d} size={38} items={[
          {at: l(379.0), text: 'sem vender ilusão'},
          {at: l(380.45), text: 'A IA AINDA ERRA', accent: true},
        ]} />
      );
    case 60:
      return (
        <>
          <Shade side="left" f1={d} />
          <Stack x={110} y={360} out={d} size={56} title={{at: l(390.62), text: 'A PARTE SÉRIA'}} items={[
            {at: l(391.75), text: 'Direitos', accent: true},
            {at: l(392.38), text: 'e consentimento.', accent: true},
          ]} />
        </>
      );
    case 61:
      return <LowerThird name="Disney & Universal × Midjourney" role="processo por uso de personagens" inF={l(393.77)} outF={d} />;
    case 63:
      return (
        <>
          <Shade side="left" f1={d} o={0.5} />
          <Stack x={80} y={320} out={d} size={34} title={{at: l(404.92), text: 'A REGRA QUE EU SIGO'}} items={[
            {at: l(407.06), text: 'SUA IMAGEM', accent: true},
            {at: l(408.0), text: 'SUA VOZ', accent: true},
            {at: l(409.04), text: 'ou autorização'},
            {at: l(409.81), text: 'por escrito.'},
          ]} />
        </>
      );
    case 65:
      return (
        <>
          <Shade side="bottom" f1={d} o={0.5} />
          <SlamPairs y={720} size={150} items={[{at: l(415.51), out: d - 2, light: 'EU FARIA', heavy: '3 COISAS'}]} />
        </>
      );
    case 66:
      return (
        <>
          <Shade side="left" f1={d} o={0.45} />
          <Tip n={1} top={170} title="Uma de imagem, uma de vídeo" at={l(416.81)} out={d} chips={[
            {at: l(420.47), t: 'DOMINA AS DUAS'},
            {at: l(423.73), t: 'NÃO PULA DE FERRAMENTA'},
          ]} />
        </>
      );
    case 67:
      return (
        <>
          <Shade side="left" f1={d} />
          <Tip n={2} title="Pensa como diretor" at={l(427.53)} out={d} top={300} chips={[
            {at: l(431.67), t: 'PLANO'},
            {at: l(432.39), t: 'LUZ'},
            {at: l(432.93), t: 'MOVIMENTO DE CÂMERA'},
            {at: l(434.13), t: 'RITMO'},
            {at: l(436.47), t: 'QUEM DECIDE É VOCÊ'},
          ]} />
        </>
      );
    case 68:
      return (
        <>
          <Shade side="left" f1={d} o={0.45} />
          <Tip n={3} top={170} title="Publica." at={l(438.81)} out={d} chips={[
            {at: l(440.65), t: 'TODO DIA'},
            {at: l(447.01), t: 'VANTAGEM: QUEM COMEÇA ANTES'},
          ]} />
        </>
      );
    case 70:
      return (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center'}}>
            <Mono style={{fontSize: 20, color: K.orange, opacity: sweep(useFrame(), l(452.31), 8)}}>A PARTE QUE EU PROMETI</Mono>
          </div>
          <SlamPairs y={150} size={110} items={[
            {at: l(454.07), out: l(458.7), light: 'COMO COLOCAR', heavy: 'VOCÊ EM QUALQUER LUGAR'},
            {at: l(458.83), out: d - 1, heavy: 'PRESTA ATENÇÃO', color: K.white},
          ]} />
        </>
      );
    case 72:
      return <PipFrame dur={d} />;
    case 73:
      return (
        <>
          <Shade side="left" f1={d} o={0.5} />
          <Stack x={80} y={320} out={l(635.6)} size={36} title={{at: l(627.73), text: 'E AÍ?'}} items={[
            {at: l(628.25), text: 'você assistiria'},
            {at: l(629.33), text: 'a um filme 100% IA?'},
            {at: l(632.49), text: 'COMENTA AQUI ↓', accent: true},
          ]} />
          <Subscribe at={l(635.71)} out={d} />
        </>
      );
    default:
      return null;
  }
};

const useFrame = () => useCurrentFrame();
const Over: React.FC<{i: number; a: number; d: number}> = ({i, a, d}) => <>{over(i, a, d)}</>;

const BigTitle: React.FC<{at: number; out: number; text: string; sub?: {at: number; text: string}}> = ({at, out, text, sub}) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  const xo = f > out - 6 ? (f - (out - 6)) / 6 : 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', opacity: 1 - xo}}>
      <div style={{display: 'inline-flex', gap: 2}}>
        {text.split('').map((ch, i) => {
          const p = sweep(f, at + i * 1.2, 14);
          return <span key={i} style={{fontFamily: "'Inter Tight', sans-serif", fontWeight: 300, fontSize: 90, color: K.white, letterSpacing: '0.28em', filter: `blur(${(1 - p) * 18}px)`, opacity: p, display: 'inline-block', transform: `scale(${1.25 - 0.25 * p})`, whiteSpace: 'pre'}}>{ch}</span>;
        })}
      </div>
      {sub && f >= sub.at ? <div style={{marginTop: 26, opacity: sweep(f, sub.at, 10)}}><Mono style={{fontSize: 24, color: K.orange, letterSpacing: '0.36em'}}>{sub.text}</Mono></div> : null}
    </div>
  );
};

const Quote1: React.FC<{at: number; out: number}> = ({at, out}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = sweep(f, at, 12);
  const xo = f > out - 6 ? (f - (out - 6)) / 6 : 0;
  return (
    <div style={{position: 'absolute', left: 160, right: 160, bottom: 110, textAlign: 'center', opacity: 1 - xo}}>
      <div style={{fontFamily: "'Inter Tight', sans-serif", fontWeight: 300, fontSize: 50, color: K.white, lineHeight: 1.25, clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`, textShadow: '0 4px 24px rgba(0,0,0,0.7)'}}>
        “Um personagem gerado por um programa, treinado no trabalho de inúmeros atores.”
      </div>
      <div style={{marginTop: 14, opacity: sweep(f, at + 10, 10)}}><Mono style={{fontSize: 16, color: K.faint}}>SAG-AFTRA, EM COMUNICADO · TRADUÇÃO LIVRE</Mono></div>
    </div>
  );
};

const BrandLT: React.FC<{at: number; out: number}> = ({at, out}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = sweep(f, at, 14);
  const xo = f > out - 8 ? (f - (out - 8)) / 8 : 0;
  return (
    <div style={{position: 'absolute', left: 96, bottom: 120, opacity: p * (1 - xo), transform: `translateX(${(1 - p) * -50 + (f - at) * 0.06}px)`}}>
      <div style={{height: 4, width: 120 * p, background: K.grad, marginBottom: 20}} />
      <Img src={staticFile('brand/logos/fulgortec-horizontal-white.svg')} style={{height: 54}} />
      <div style={{marginTop: 14}}><Mono style={{fontSize: 20, color: K.orange}}>ESTE FLUXO, TODOS OS DIAS</Mono></div>
    </div>
  );
};

const Strikes: React.FC<{at: number[]; words: string[]; strike: number}> = ({at, words, strike}) => {
  const f = useCurrentFrame();
  if (f < at[0] - 2) return null;
  const s = sweep(f, strike, 6);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', gap: 60}}>
      {words.map((w, i) => (
        <div key={w} style={{position: 'relative'}}>
          {f >= at[i] ? <Word text={w} at={at[i]} size={120} color={f >= strike ? K.faint : K.white} /> : null}
          <div style={{position: 'absolute', left: -10, right: -10, top: '50%', height: 8, background: K.red, transform: `scaleX(${f >= at[i] ? s : 0})`, transformOrigin: 'left'}} />
        </div>
      ))}
    </div>
  );
};

const CardFor: React.FC<{src: string; a: number; d: number}> = ({src, a, d}) => {
  if (src === 'mg:news1') return <News1 a={a} dur={d} />;
  if (src === 'mg:news2') return <News2 a={a} dur={d} />;
  if (src === 'mg:news3') return <News3 a={a} dur={d} />;
  if (src === 'mg:news4') return <News4 a={a} dur={d} />;
  if (src === 'sting') return <Sting dur={d} />;
  if (src === 'mg:stat') return <Stat a={a} dur={d} />;
  if (src === 'mg:timeline') return <Timeline a={a} dur={d} />;
  if (src === 'mg:quote') return <Quote a={a} dur={d} />;
  if (src === 'mg:glitch') return <GlitchInterview a={a} dur={d} />;
  if (src === 'mg:dealoff') return <DealOff a={a} dur={d} />;
  if (src === 'mg:tools') return <Tools a={a} dur={d} />;
  if (src === 'mg:50bi') return <Bi50 a={a} dur={d} />;
  if (src === 'mg:failures') return <Failures a={a} dur={d} />;
  if (src === 'mg:contract') return <Contract a={a} dur={d} />;
  if (src === 'endcard') return <EndCard a={a} dur={d} />;
  if (src.startsWith('chapter:')) return <Chapter a={a} dur={d} n={src.split(':')[1]} />;
  if (src.startsWith('gap:')) {
    const [label, n] = src.slice(4).split('|');
    if (n) return <Chapter a={a} dur={d} n={n} />;
    return <GapCard a={a} dur={d} label={label} sub={label === 'TUTORIAL' ? 'VOCÊ EM QUALQUER LUGAR DO MUNDO' : undefined} />;
  }
  return null;
};

/** Full transparent overlay track (VP9 alpha). Full-screen MG cards are opaque inside it. */
export const YTOverlay: React.FC = () => (
  <AbsoluteFill>
    <Fonts />
    {CUTS.map((c) => {
      const from = T(c.a);
      const d = T(c.b) - T(c.a);
      const isCard = c.k === 'v' && !c.src.startsWith('broll') && !c.src.startsWith('pf');
      return (
        <Sequence key={c.i} from={from} durationInFrames={d} layout="none">
          <AbsoluteFill>
            {c.k === 'cold' ? <ColdTitle /> : null}
            {isCard ? <CardFor src={c.src} a={c.a} d={d} /> : null}
            {!isCard && c.k !== 'cold' && c.k !== 'tut' ? <Chrome t={c.a + 0.01} /> : null}
            <Over i={c.i} a={c.a} d={d} />
          </AbsoluteFill>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

/** Text that sits BEHIND the host (composited between plate and matte by ffmpeg). Local timeline per shot. */
export const Behind1: React.FC = () => {
  const a = 3.0;
  const l = (t: number) => L(t, a);
  return (
    <AbsoluteFill>
      <Fonts />
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 40}}>
        <Word text="100%" at={l(4.82)} size={430} color={K.orange} />
        <Word text="IA" at={l(6.04)} size={430} color={K.white} />
      </div>
    </AbsoluteFill>
  );
};
export const BEHIND1_FRAMES = T(9.733) - T(3.0);

export const Behind2: React.FC = () => {
  const a = 149.9;
  const l = (t: number) => L(t, a);
  return (
    <AbsoluteFill>
      <Fonts />
      <div style={{position: 'absolute', left: 120, top: 560}}>
        <Word text="Criador de conteúdo do" at={l(155.5)} size={64} display={false} style={{fontWeight: 300}} />
        <Word text="YOUTUBE" at={l(156.86)} size={330} color={K.orange} style={{marginTop: -10}} />
      </div>
    </AbsoluteFill>
  );
};
export const BEHIND2_FRAMES = T(157.5) - T(149.9);
