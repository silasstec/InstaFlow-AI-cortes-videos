// Cut list built from ~/yt10/build/cuts.json (sandbox). Times in seconds on the master timeline.
export type Cut = {i: number; k: 'cold' | 'a' | 'v' | 'tut'; src: string; a: number; b: number; fx: string};

export const CUTS: Cut[] = [
  {i: 0, k: 'cold', src: 'cold', a: 0.0, b: 3.0, fx: ''},
  {i: 1, k: 'a', src: 'camB', a: 3.0, b: 9.733, fx: 'text_behind:100% IA'},
  {i: 2, k: 'v', src: 'broll:scifi_world', a: 9.733, b: 14.567, fx: ''},
  {i: 3, k: 'a', src: 'env2', a: 14.567, b: 21.167, fx: ''},
  {i: 4, k: 'a', src: 'camC', a: 21.167, b: 25.133, fx: ''},
  {i: 5, k: 'v', src: 'mg:news1', a: 25.133, b: 31.833, fx: ''},
  {i: 6, k: 'v', src: 'mg:news2', a: 31.833, b: 37.933, fx: ''},
  {i: 7, k: 'v', src: 'mg:news3', a: 37.933, b: 43.0, fx: ''},
  {i: 8, k: 'v', src: 'mg:news4', a: 43.0, b: 46.967, fx: ''},
  {i: 9, k: 'a', src: 'camB', a: 46.967, b: 63.867, fx: ''},
  {i: 10, k: 'a', src: 'camC', a: 63.867, b: 67.233, fx: ''},
  {i: 11, k: 'v', src: 'sting', a: 67.233, b: 71.433, fx: ''},
  {i: 12, k: 'a', src: 'camA', a: 71.433, b: 74.6, fx: ''},
  {i: 13, k: 'a', src: 'env1', a: 74.6, b: 85.167, fx: ''},
  {i: 14, k: 'v', src: 'broll:crowd_battle_aerial', a: 85.167, b: 93.1, fx: ''},
  {i: 15, k: 'v', src: 'mg:stat', a: 93.1, b: 102.067, fx: ''},
  {i: 16, k: 'a', src: 'camC', a: 102.067, b: 109.267, fx: ''},
  {i: 17, k: 'a', src: 'camB', a: 109.267, b: 114.6, fx: ''},
  {i: 18, k: 'v', src: 'chapter:02', a: 114.6, b: 117.6, fx: ''},
  {i: 19, k: 'a', src: 'camA', a: 117.6, b: 120.067, fx: ''},
  {i: 20, k: 'v', src: 'broll:alien_anthology', a: 120.067, b: 135.2, fx: ''},
  {i: 21, k: 'v', src: 'mg:timeline', a: 135.2, b: 139.067, fx: ''},
  {i: 22, k: 'a', src: 'camB', a: 139.067, b: 144.7, fx: ''},
  {i: 23, k: 'v', src: 'mg:quote', a: 144.7, b: 149.9, fx: ''},
  {i: 24, k: 'a', src: 'camC', a: 149.9, b: 157.5, fx: 'text_behind:CRIADOR DO YOUTUBE'},
  {i: 25, k: 'v', src: 'chapter:03', a: 157.5, b: 160.633, fx: ''},
  {i: 26, k: 'a', src: 'camA', a: 160.633, b: 163.4, fx: ''},
  {i: 27, k: 'a', src: 'env3', a: 163.4, b: 171.8, fx: ''},
  {i: 28, k: 'v', src: 'mg:glitch', a: 171.8, b: 184.867, fx: ''},
  {i: 29, k: 'a', src: 'camB', a: 184.867, b: 193.2, fx: ''},
  {i: 30, k: 'a', src: 'env4', a: 193.2, b: 196.267, fx: ''},
  {i: 31, k: 'a', src: 'camB', a: 196.267, b: 208.2, fx: ''},
  {i: 32, k: 'a', src: 'camC', a: 208.2, b: 214.7, fx: ''},
  {i: 33, k: 'a', src: 'env5', a: 214.7, b: 227.433, fx: ''},
  {i: 34, k: 'a', src: 'camC', a: 227.433, b: 231.533, fx: ''},
  {i: 35, k: 'v', src: 'chapter:04', a: 231.533, b: 234.533, fx: ''},
  {i: 36, k: 'a', src: 'camA', a: 234.533, b: 239.367, fx: ''},
  {i: 37, k: 'a', src: 'camB', a: 239.367, b: 241.733, fx: ''},
  {i: 38, k: 'a', src: 'env6', a: 241.733, b: 251.067, fx: ''},
  {i: 39, k: 'v', src: 'mg:dealoff', a: 251.067, b: 257.867, fx: ''},
  {i: 40, k: 'a', src: 'camC', a: 257.867, b: 259.833, fx: ''},
  {i: 41, k: 'v', src: 'mg:tools', a: 259.833, b: 294.0, fx: ''},
  {i: 42, k: 'a', src: 'camC', a: 294.0, b: 298.367, fx: ''},
  {i: 43, k: 'a', src: 'camB', a: 298.367, b: 303.533, fx: ''},
  {i: 44, k: 'v', src: 'gap:HOLLYWOOD × IA', a: 303.533, b: 304.2, fx: ''},
  {i: 45, k: 'a', src: 'camB', a: 304.2, b: 307.833, fx: ''},
  {i: 46, k: 'a', src: 'env7', a: 307.833, b: 315.533, fx: ''},
  {i: 47, k: 'v', src: 'broll:boardroom_drama', a: 315.533, b: 325.767, fx: ''},
  {i: 48, k: 'a', src: 'camC', a: 325.767, b: 328.133, fx: ''},
  {i: 49, k: 'v', src: 'mg:50bi', a: 328.133, b: 335.867, fx: ''},
  {i: 50, k: 'a', src: 'camB', a: 335.867, b: 338.033, fx: ''},
  {i: 51, k: 'a', src: 'camC', a: 338.033, b: 344.9, fx: ''},
  {i: 52, k: 'v', src: 'chapter:05', a: 344.9, b: 347.9, fx: ''},
  {i: 53, k: 'a', src: 'camB', a: 347.9, b: 357.533, fx: ''},
  {i: 54, k: 'a', src: 'env8', a: 357.533, b: 362.0, fx: ''},
  {i: 55, k: 'v', src: 'pf:portfolio', a: 362.0, b: 372.233, fx: ''},
  {i: 56, k: 'a', src: 'camB', a: 372.233, b: 374.967, fx: ''},
  {i: 57, k: 'v', src: 'chapter:06', a: 374.967, b: 378.067, fx: ''},
  {i: 58, k: 'a', src: 'camB', a: 378.067, b: 381.867, fx: ''},
  {i: 59, k: 'v', src: 'mg:failures', a: 381.867, b: 390.1, fx: ''},
  {i: 60, k: 'a', src: 'camC', a: 390.1, b: 393.367, fx: ''},
  {i: 61, k: 'a', src: 'env9', a: 393.367, b: 398.333, fx: ''},
  {i: 62, k: 'v', src: 'mg:contract', a: 398.333, b: 404.6, fx: ''},
  {i: 63, k: 'a', src: 'camB', a: 404.6, b: 410.7, fx: ''},
  {i: 64, k: 'v', src: 'chapter:07', a: 410.7, b: 412.5, fx: ''},
  {i: 65, k: 'a', src: 'camA', a: 412.5, b: 416.567, fx: ''},
  {i: 66, k: 'a', src: 'camB', a: 416.567, b: 427.3, fx: ''},
  {i: 67, k: 'a', src: 'camC', a: 427.3, b: 438.4, fx: ''},
  {i: 68, k: 'a', src: 'camB', a: 438.4, b: 449.433, fx: ''},
  {i: 69, k: 'v', src: 'gap:A PARTE QUE EU PROMETI', a: 449.433, b: 451.233, fx: ''},
  {i: 70, k: 'a', src: 'env10', a: 451.233, b: 459.8, fx: ''},
  {i: 71, k: 'v', src: 'gap:TUTORIAL', a: 459.8, b: 460.833, fx: ''},
  {i: 72, k: 'tut', src: 'tutorial', a: 460.833, b: 627.267, fx: ''},
  {i: 73, k: 'a', src: 'camB', a: 627.267, b: 636.8, fx: ''},
  {i: 74, k: 'v', src: 'endcard', a: 636.8, b: 649.478, fx: ''},
];

export const TOTAL_S = 649.478;

export const CHAPTERS: {t: number; n: string; title: string}[] = [
  {t: 0, n: '00', title: 'Abertura'},
  {t: 71.433, n: '01', title: 'Hollywood já está usando'},
  {t: 114.6, n: '02', title: 'O primeiro filme 100% IA'},
  {t: 157.5, n: '03', title: 'Atores digitais e clones'},
  {t: 231.533, n: '04', title: 'A guerra das ferramentas'},
  {t: 344.9, n: '05', title: 'O que isso muda para você'},
  {t: 374.967, n: '06', title: 'Onde a IA ainda falha'},
  {t: 410.7, n: '07', title: 'Como começar hoje'},
  {t: 460.833, n: '08', title: 'Tutorial: você em qualquer lugar'},
];

export const chapterAt = (t: number) => {
  let c = CHAPTERS[0];
  for (const x of CHAPTERS) if (t >= x.t) c = x;
  return c;
};

// End card: avatar box (sandbox composites P43 scaled into this rect until 639.364)
export const END_BOX = {x: 120, y: 300, w: 800, h: 450};
// Tutorial PiP square (sandbox composites the host here)
export const PIP = {x: 48, y: 1080 - 48 - 320, s: 320};
