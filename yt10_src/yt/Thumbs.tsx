import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Fonts, K, DISPLAY, SANS} from './kit';

const stroke = '0 6px 0 rgba(0,0,0,0.35), 0 10px 40px rgba(0,0,0,0.75)';

export const Thumb1: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fonts />
    <Img src={staticFile('thumb/tA1.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.08) saturate(1.12)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 38%)'}} />
    <div style={{position: 'absolute', right: 40, bottom: 34, textAlign: 'right'}}>
      <div style={{display: 'inline-block', background: K.white, color: '#0a0a0b', fontFamily: SANS, fontWeight: 800, fontSize: 40, padding: '6px 18px', borderRadius: 8, transform: 'rotate(-2deg)', marginBottom: 6, letterSpacing: '-0.01em'}}>1º FILME</div>
      <div style={{fontFamily: DISPLAY, fontSize: 210, lineHeight: 0.86, color: K.orange, letterSpacing: '-0.02em', textShadow: stroke, WebkitTextStroke: '3px #0a0a0b'}}>100% IA</div>
      <div style={{fontFamily: DISPLAY, fontSize: 86, lineHeight: 0.95, color: K.white, letterSpacing: '0.01em', textShadow: stroke}}>NO OSCAR?</div>
    </div>
  </AbsoluteFill>
);

export const Thumb2: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fonts />
    <Img src={staticFile('thumb/tB2.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.08) saturate(1.1)'}} />
    <div style={{position: 'absolute', left: 52, top: 120}}>
      <div style={{fontFamily: DISPLAY, fontSize: 120, lineHeight: 0.9, color: K.white, textShadow: stroke}}>A IA JÁ</div>
      <div style={{fontFamily: DISPLAY, fontSize: 168, lineHeight: 0.88, color: K.orange, textShadow: stroke}}>TOMOU</div>
      <div style={{fontFamily: DISPLAY, fontSize: 120, lineHeight: 0.9, color: K.white, textShadow: stroke}}>HOLLYWOOD</div>
      <div style={{marginTop: 22, display: 'inline-block', background: K.orange, color: '#0a0a0b', fontFamily: SANS, fontWeight: 800, fontSize: 34, padding: '6px 16px', borderRadius: 8}}>+ TUTORIAL NO FINAL</div>
    </div>
  </AbsoluteFill>
);
