# yt15 — estado da produção (SILASTEC CAST, IA no cinema, 15 min)

## Decisões
- Nova versão completa (não remendo do yt10). Identidade real do Silas obrigatória antes de animar.
- 4 câmaras fixas do MESMO estúdio FULGORTEC (plate1.png = estúdio vazio, 2752x1536): A aberta frontal, B média frontal, C close 45°, D perfil. Alternância por frase/ideia, sem mudar cenário.
- Mãos sempre apoiadas na mesa em todas as câmaras e drives.
- Tutorial 2:46 existente entra no fim com PiP quadrado inferior-esquerdo.

## Referências de identidade (reais, sem boné)
- Element Silas-Real-Originais c6d70147-5f37-4200-bdac-aacd946a7866
  - da27ca17-d9d3-4c4f-b95f-0014a48233a8 frontal neutro/falando (512x910) → upscale 4K job 1a81ace6-e696-4fea-ac91-6b32e8124643
  - 0dc0438b-f005-405f-9d9f-01bcb6470a67 frontal sorriso (assinatura) → upscale 4K job 1ba6f3f7-4910-47e2-a64a-96608c00bd72  (HERO)
  - b93eb935-13dd-46ec-a9de-37cf62ea45c3 perfil/3/4 direita → upscale 4K job 61c4ff78-69fb-441b-a1ba-af1f0398faeb
- Selfies com boné (27) em sandbox ~/yt15/ref/cand/ — não usar como identidade principal (boné, grande angular); no máximo 1 como apoio de expressão.
- Rejeitado: Soul "Silas Cinema" 4c46542c (yt10) — utilizador disse que não parece ele. Caminho Soul falhado para esta pessoa.

## Ledger de identidade
| frame | path | modelo | refs | mudança | veredicto | motivo |
|---|---|---|---|---|---|---|
| sheet A | ref photos | nano_banana_pro | 3 reais 4K | round 1 | — | — |
| sheet B | ref photos | gpt_image_2 | 3 reais 4K | round 1 | — | — |

## Progresso 22 out (05:40 UTC)
- Hero 4K: smile 1ba6f3f7, neutral 1a81ace6, profile 61c4ff78 (jobs upscale). Sheet NBP 451bf581 (round 1 OK-ish; GPT2 falhou 2x).
- Plate estúdio vazio uploaded d44b28fb. Plates C: deeb3ac3/2b88d38d; D: 75820ad8/b9ea8d9b.
- Câmaras round1: A0 054a001b, B1 c4082947 (1080 jpg = media 6b31b88c), C3 464e9df2, D2 74c4acf4. QA: rosto mais magro e barba mais densa/escura que o real -> round2 edição (jobs c2f8258d 61645db2 B; 9219db7a 412fe69d A; f84dfee8 bd77b837 C; 91e2c2a9 8c431444 D).
- Voz: ElevenLabs 0 créditos. Clone Seed Audio via audio_references media 4c6f7ceb (2 min de narr_full yt10). Timbre f0 176 vs 167 ref. Higgsfield voice limit atingido (não dá para criar voice element).
- TTS: 74 takes em ~/yt15/tts/tNN.wav (sandbox); ids em /root/yt15/build/tts_jobs.json. Re-take T02 (pausa "..." gerou lixo) e T12b.
- Lipsync testes (10 s, mesmo áudio): Wan2.7 720p r=0.00 (boca abre em silêncio); Seedance2.0 fast audio_ref r=0.07; Seedance2.0 c/ áudio nativo muda o texto/tempo; Grok 1.5 falhou; Wan + dubbing_lipsync(por) r=0.27 vs áudio próprio, 0.17 vs áudio original, palavras alinhadas ±0.1s; Aurora yt10 r=0.33. Custo: Wan 720p 1.5 cr/s + dubbing 3.6 cr/s.
- Roteiro: /root/yt15/roteiro_v2.md; takes /root/yt15/build/takes.json (74 takes, ~11.6 min).

## Créditos
- Higgsfield 3683 (ultra) em 22 out, antes dos upscales (3 x 2 cr).
- ElevenLabs: 0 créditos (quota esgotada no yt10). TTS + Aurora dependem de recarga.

## Agentes
- Pesquisa notícias: a correr (a7d6c1accea6e2511)
- Pesquisa direção multicâmara/retenção: a correr (ae5005db500eba066)

## Abordagens rejeitadas (não repetir)
- Identidade por Soul sem QA contra fotos reais.
- Prompt Aurora com "hands below frame" (mãos devem estar na mesa).
- Seedance 2.5 t2v 1080p para B-roll genérico (falhas repetidas; Kling 3.0 pro resolveu).
- Supabase transfer para ficheiros > 50 MB (400).

## Progresso 22 out (tarde)
- timeline.json pronto (937.43 s). spec15.py local usa anchors.json (copiado do sandbox); gera data15.ts + edl15.json. YT15Overlay registado; render VP9 alpha em 8 chunks (out/yt15/ov_N.webm) em background.
- ls_all: medianas r0 A .13 B .26 C .27 D .12. Redo Wan (2 variantes, prompt + articulação) segs 0,4,7,23,29,30,34,41,70,73,80 (index = seg*10+v):
  0:54f0d8f4 1:d1cd47c3 40:92302601 41:01bfe005 70:9d1865d2 71:74c25eb4 230:abbf0d0b 231:01748710 290:c8736d3d 291:5ab67770 300:c9066082 301:67dc4284
  340:a985e2dc 341:7e004339 410:6b80f3e2 411:23f703d9 700:16f32dc1 701:6d4de929 730:ca4b8ccd 731:728105d1 800:f8da4f51 801:f2a53597
- Tutorial audio == narr_master (lag 0). PiP: v{n} em tut.a + pip_segs[n].ss.
- Picks lipsync (drv/pick.json): 0:r0(.20) 4:r41(.31) 7:r70(.70) 23:r230(.28) 29:r290(.16) 30:r301(.12) 34:r341(.62) 41:r411(.25) 70:r701(.22) 73:r730(.11) 80:r801(.18). idle end clip: drv/idle.mp4 (kling 5410f105).
- Sandbox: base15.py (segs/special/music/cat/audio/v/mux), srt15.py; out em ~/yt15/out. Overlays chegam via relay yt15_ov/ov_N.webm.
- Guia PDF: /root/yt15/guide/FULGORTEC-Guia-IA-no-Cinema.pdf (5 pág), relay yt15_src/. Metadata: /root/yt15/youtube_metadata.md (falta link do guia).
- Thumbs: sandbox ~/yt15/thumb/thumb15_A.jpg, thumb15_B.jpg.
- 07:40 fact-check agent: 22 defeitos (1 P0 Affleck). Corrigido: 17 segmentos re-TTS (fix/fN.wav → seg/sNNN.mp3; originais em seg_v1/), timeline v2 949.784 s (words_fix.py), spec com textos de ecrã corrigidos, anchors v2 local. Drives novos drv/xN.mp4; redo2 (2 variantes) para 0,15,29,60: idx n*10+v jobs 8f4bb57c 6e7a6711 521ccb38 f21cd8e5 fa2c6a20 f5e84bc7 cb5f3af0 6d38f1ff.
- Guia v2 PDF: media 80827f10 (url d2ol7oe51mr4n9.../80827f10-...pdf). Overlay render v2 em curso (N=28494).
- 10:25 ENTREGUE: final media 2f218946 (410 MB, 949.74 s, -13.9 LUFS, TP -1.0); thumbs af89b962 (A) b8832a2b (B); srt c2adec33 (.txt); guia 80827f10. Stock Mixkit (6 planos). Patches de overlay p1-p3 (stacks fora do rosto). Pendente opcional: trechos reais (precisa ficheiros do utilizador).

## invideo (timeline editável) — concluído
- Projeto: https://invideo.io/@fulgortec/silastec-cast-ia-no-cinema-15-min · timeline T1 (seq-1.1), 30 fps, agente "silas-claude", revisão 42.
- V1 A-roll 84 clipes por plano (T## · câmera X, vinheta, tutorial+PiP, tela final); V2 B-roll 24 clipes nomeados por fonte; V3 grafismos alpha (ov_0..7 + patches p1..p3); A1 voz, A2 trilha ducked, A3 SFX.
- QA: 12 capturas (3s..940s) iguais ao render final; check_timeline sem findings.
