import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Fonts, K, DISPLAY, SANS} from '../yt/kit';

/* transparent text layers; the presenter frame is composited underneath in the sandbox */
const stroke = '0 6px 0 rgba(0,0,0,0.35), 0 10px 40px rgba(0,0,0,0.8)';

export const Thumb15A: React.FC = () => (
  <AbsoluteFill>
    <Fonts />
    <AbsoluteFill style={{background: 'linear-gradient(270deg, rgba(5,5,8,0.92) 0%, rgba(5,5,8,0.55) 34%, rgba(5,5,8,0) 55%)'}} />
    <div style={{position: 'absolute', right: 44, top: 70, textAlign: 'right'}}>
      <div style={{display: 'inline-block', background: K.white, color: '#0a0a0b', fontFamily: SANS, fontWeight: 800, fontSize: 40, padding: '6px 18px', borderRadius: 8, transform: 'rotate(-2deg)', marginBottom: 10}}>1º FILME</div>
      <div style={{fontFamily: DISPLAY, fontSize: 196, lineHeight: 0.86, color: K.orange, letterSpacing: '-0.02em', textShadow: stroke, WebkitTextStroke: '3px #0a0a0b'}}>100% IA</div>
      <div style={{fontFamily: DISPLAY, fontSize: 92, lineHeight: 0.95, color: K.white, textShadow: stroke}}>NO OSCAR?</div>
      <div style={{marginTop: 26, display: 'inline-block', background: K.orange, color: '#0a0a0b', fontFamily: SANS, fontWeight: 800, fontSize: 30, padding: '6px 16px', borderRadius: 8}}>+ TUTORIAL NO FINAL</div>
    </div>
    <Img src={staticFile('silastec/silastec_logo.png')} style={{position: 'absolute', left: 36, bottom: 30, height: 34, opacity: 0.9}} />
  </AbsoluteFill>
);

export const Thumb15B: React.FC = () => (
  <AbsoluteFill>
    <Fonts />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,5,8,0.92) 0%, rgba(5,5,8,0.55) 36%, rgba(5,5,8,0) 58%)'}} />
    <div style={{position: 'absolute', left: 52, top: 92}}>
      <div style={{fontFamily: DISPLAY, fontSize: 112, lineHeight: 0.9, color: K.white, textShadow: stroke}}>HOLLYWOOD</div>
      <div style={{fontFamily: DISPLAY, fontSize: 112, lineHeight: 0.9, color: K.white, textShadow: stroke}}>JÁ USA</div>
      <div style={{fontFamily: DISPLAY, fontSize: 200, lineHeight: 0.86, color: K.orange, textShadow: stroke, WebkitTextStroke: '3px #0a0a0b'}}>IA</div>
      <div style={{marginTop: 22, display: 'inline-block', background: K.white, color: '#0a0a0b', fontFamily: SANS, fontWeight: 800, fontSize: 32, padding: '6px 16px', borderRadius: 8, transform: 'rotate(-2deg)'}}>E O BRASIL?</div>
    </div>
    <Img src={staticFile('silastec/silastec_logo.png')} style={{position: 'absolute', right: 36, bottom: 30, height: 34, opacity: 0.9}} />
  </AbsoluteFill>
);
