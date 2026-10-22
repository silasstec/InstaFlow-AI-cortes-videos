"""FULGORTEC guide for the SILASTEC CAST episode 'IA no cinema' (Oct 2026). Content in SPEC, HTML generated."""
import html, os

PUB = '/root/tutorial/video/public/brand'
OUT = os.path.dirname(os.path.abspath(__file__))
E = html.escape

SPEC = {
    'footer': 'GUIA DO EPISÓDIO • IA NO CINEMA • OUTUBRO 2026',
    'cover': {
        'kicker': 'GUIA DO EPISÓDIO · IA NO CINEMA',
        'title': 'Ferramentas, preços e fontes.',
        'lead': 'Tudo o que foi citado no episódio sobre inteligência artificial no cinema, com a data e a fonte de cada número, mais o custo real de produzir o próprio episódio com IA.',
        'stats': [('≈300', 'TÍTULOS NETFLIX COM IA GENERATIVA EM 2026'), ('US$ 0,097', 'POR SEGUNDO · SEEDANCE 2.5, OFERTA DE LANÇAMENTO'), ('39%', 'DOS ADULTOS NOS EUA VERIAM UM FILME 100% IA')],
        'cta': 'Vídeos com IA para marcas, artistas e imobiliário · fulgortech.com',
    },
    'tools': {
        'kicker': '01 / AS FERRAMENTAS',
        'title': 'O que está no mercado hoje.',
        'rows': [
            ('Seedance 2.5', 'ByteDance · Dreamina', '30 s contínuos com som; modo longo até 3 min. Preço de lançamento para novos planos anuais. No Runway desde agosto.', 'desde US$ 0,097/s', 'PR Newswire, 3 ago 2026 · Runway changelog'),
            ('Gemini Omni 1.1 Flash', 'Google', 'Vídeos estendidos até 40 s; 1080p ou 4K por upscale. Os endpoints de teste do Veo 3.1 foram desligados em 22 out.', 'grátis no Google Vids', 'Google, 19 mai · Gemini API docs · Unite.AI, 23 set 2026'),
            ('Kling', 'Kuaishou', 'A Kling AI está captando cerca de US$ 3 bi com Baidu, Alibaba Cloud e Tencent.', 'rodada em captação', 'SCMP, 3 jul 2026'),
            ('Runway', 'Runway', 'Plugins para Premiere e After Effects (8 set) e DaVinci Resolve (23 set). Lionsgate entrou como sócia.', 'plugins nos editores', 'Runway changelog · Runway, 11 jun 2026'),
            ('Higgsfield', 'Higgsfield', 'Plataforma que reúne vários modelos de imagem, vídeo e voz. Usada para produzir este episódio.', 'US$ 5,4 bi', 'FinSMEs, 17 ago 2026'),
            ('ElevenLabs', 'ElevenLabs', 'Mercado de vozes licenciadas; Michael Caine licenciou a voz para um audiolivro de 13 h.', 'US$ 22 mi a criadores', 'LA Times via News Tribune, 30 ago 2026'),
        ],
    },
    'cost': {
        'kicker': '02 / O CUSTO DESTE EPISÓDIO',
        'title': 'Quanto custou fazer este vídeo.',
        'lead': 'Valores medidos na produção, em créditos Higgsfield (plano Ultra, outubro de 2026). O valor de cada crédito depende do plano contratado.',
        'rows': [
            ('Retrato de referência e câmeras do estúdio', 'Nano Banana Pro, 4K', '2 créditos por imagem'),
            ('Voz do apresentador, clonada da voz real', 'Seed Audio', 'cerca de 1 crédito por frase'),
            ('Apresentador a falar, sincronizado com a voz', 'Wan 2.7, 720p', '1,5 crédito por segundo'),
            ('Planos de apoio (B-roll)', 'Kling 3.0', '7,5 créditos por plano de 5 s'),
            ('Sincronização de lábios numa dublagem', 'Higgsfield dubbing', '3,6 créditos por segundo'),
        ],
        'tiles': [('≈ 2 000', 'CRÉDITOS NO TOTAL, INCLUINDO REFAZER PLANOS'), ('15:37', 'MINUTOS DE EPISÓDIO'), ('4', 'CÂMERAS VIRTUAIS DO MESMO ESTÚDIO')],
        'note': 'Motion graphics, montagem, mistura de som e legendas foram feitos em código (Remotion e ffmpeg), sem custo de geração.',
    },
    'method': {
        'kicker': '03 / O MÉTODO DO TUTORIAL',
        'title': 'Você em qualquer lugar, em seis passos.',
        'steps': [
            ('Identidade', '10 a 15 fotos nítidas, de vários ângulos, e um visual fixo de roupa e acessórios.'),
            ('Lugar', '3 a 5 imagens do mesmo espaço; a mesma direção de luz em todos os prompts.'),
            ('Keyframes', 'Primeiro e último quadro de cada plano gerados como imagem e corrigidos antes do vídeo.'),
            ('Movimento', 'Modelo de imagem para vídeo (Seedance, Kling ou Veo) a partir dos keyframes aprovados.'),
            ('Voz', 'Gravação própria ou clone da própria voz, com sincronização de lábios.'),
            ('Montagem', 'Cortes que escondem as emendas, legendas e rótulo de conteúdo gerado.'),
        ],
        'ethic': 'Gere apenas com a sua imagem e a sua voz, ou com autorização por escrito da pessoa retratada.',
    },
    'rules': {
        'kicker': '04 / AS REGRAS QUE JÁ VALEM',
        'items': [
            ('Oscar 2027', 'Só atuações creditadas e comprovadamente feitas por humanos, com consentimento; roteiro de autoria humana; a Academia pode pedir informações sobre o uso de IA.', 'NPR · TechCrunch, 2 mai 2026'),
            ('Globo de Ouro', 'IA não desqualifica, desde que direção criativa, julgamento artístico e autoria continuem humanos. Inscrições até 30 out.', 'CNN Brasil, 8 mai 2026'),
            ('União Europeia', 'AI Act, artigo 50, desde 2 ago 2026: rótulo visível e marcação legível por máquina em vídeo e áudio gerados que pareçam reais. Multa até 15 mi € ou 3% do faturamento global.', 'Comissão Europeia, 2 ago 2026'),
            ('Brasil', 'Marco da IA (PL 2338) com votação na Câmara prevista para o fim de 2026; direitos autorais são o ponto pendente.', 'Mobile Time, 24 ago 2026'),
        ],
    },
    'sources': {
        'kicker': '05 / FONTES',
        'title': 'Cada número, com a sua origem.',
        'items': [
            ('Netflix, InterPositive e "Animals"', 'worldofreel.com · forbes.com · iol.co.za · inc.com'),
            ('Nicolas Cage e Spider-Noir', 'thewrap.com, 10 out 2026'),
            ('Globo: chamada com IA e microdramas', 'terra.com.br, 4 set · tvpop.com.br, 8 out 2026'),
            ('Prime Video e Maxton Hall', 'exame.com, 9 set · techspot.com, 10 set 2026'),
            ('Oscar e Globo de Ouro', 'npr.org · techcrunch.com · cnnbrasil.com.br'),
            ('Gods Don\'t Give Gifts e Critterz', 'netinfluencer.com · vanguardia.com · futurism.com'),
            ('Tilly Norwood e SAG-AFTRA', 'euronews.com, 21 set 2026 · upi.com, 30 set 2025'),
            ('Mark Wahlberg', 'techcrunch.com, 16 out 2026'),
            ('Vozes, ElevenLabs e Val Kilmer', 'newstribune.com, 30 ago · livenowfox.com'),
            ('Disney: CTO e D\'Amaro', 'ciodive.com, 21 set · laughingplace.com, 5 ago 2026'),
            ('Disney, Universal, Warner × Midjourney', 'ailawsuittracker.com, 19 out 2026'),
            ('Pesquisa de público (Angus Reid USA)', 'angusreid.us, 10 jul 2026 (2.007 adultos, 22 a 26 jun)'),
            ('Fim do Sora', 'OpenAI, 24 mar 2026 · The Hollywood Reporter'),
            ('AI Act e PL 2338', 'commission.europa.eu · mobiletime.com.br'),
        ],
        'cta_title': 'Quer um vídeo assim para a sua marca?',
        'cta': 'Videoclipes, trailers, imobiliário e publicidade com IA · fulgortech.com',
        'contact': 'legal@fulgortech.com',
    },
}


def fonts():
    css = ''
    for w in (400, 500, 600, 700, 800):
        css += f"@font-face{{font-family:'Inter Tight';font-weight:{w};src:url('file://{PUB}/fonts/InterTight-{w}.woff2')}}"
    for w in (400, 500):
        css += f"@font-face{{font-family:'JB';font-weight:{w};src:url('file://{PUB}/fonts/JetBrainsMono-{w}.woff2')}}"
    return css


CSS = fonts() + """
@page{size:210mm 297mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0a0a0b;color:#f5f5f3;font-family:'Inter Tight',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;overflow:hidden;position:relative;padding:15mm 16mm 16mm;display:flex;flex-direction:column;page-break-after:always;background:#0a0a0b}
.page.light{background:#f4f4f6;color:#0d0d10}
.hd{display:flex;justify-content:space-between;align-items:center;padding-bottom:4mm;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:9mm}
.light .hd{border-color:rgba(10,10,10,.1)}
.hd img{height:6.5mm}
.hd .m{font-weight:700;font-size:7.5pt;letter-spacing:.1em;color:rgba(245,245,243,.5)}
.light .hd .m{color:rgba(13,13,16,.52)}
.ft{position:absolute;left:16mm;right:16mm;bottom:9mm;display:flex;justify-content:space-between;font-family:'JB';font-size:7pt;letter-spacing:.18em;color:rgba(245,245,243,.45)}
.light .ft{color:rgba(13,13,16,.5)}
.ft b{font-family:'Inter Tight';font-weight:700;letter-spacing:0;font-size:9pt;color:inherit}
.k{font-weight:700;font-size:9pt;letter-spacing:.1em;color:#f96205;margin-bottom:3mm}
.light .k{color:#b4480a}
h1{font-weight:800;font-size:31pt;letter-spacing:-.03em;line-height:1.03;margin-bottom:5mm}
.lead{font-size:11.5pt;line-height:1.45;color:rgba(245,245,243,.72);max-width:150mm}
.light .lead{color:rgba(13,13,16,.72)}
.rule{height:2px;background:linear-gradient(90deg,#F96205,#F90505 30%,#FF3881 55%,#7C00DA 80%,#00509F 100%);margin:6mm 0}
/* cover */
.cover{padding:0}
.cover .art{position:absolute;inset:0;background:url('file://""" + PUB + """/art/ribbon-hero-16x9.webp') 62% 30%/cover}
.cover .ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,11,.35) 0%,rgba(10,10,11,.55) 38%,#0a0a0b 66%)}
.cover .in{position:relative;padding:15mm 16mm 0;display:flex;flex-direction:column;height:100%}
.cover h1{font-size:45pt;margin-top:96mm;max-width:160mm}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6mm;border-top:1px solid rgba(255,255,255,.14);padding-top:6mm;margin-top:10mm}
.stats .n{font-weight:800;font-size:25pt;letter-spacing:-.03em;color:#f5f5f3}
.stats .l{font-weight:700;font-size:6.8pt;letter-spacing:.1em;color:rgba(245,245,243,.5);margin-top:2mm;line-height:1.4}
.cta{background:#f96205;color:#0a0a0b;font-weight:700;font-size:11.5pt;border-radius:9px;padding:5mm 6mm;margin-top:auto;margin-bottom:22mm}
/* tools */
.tl{display:flex;flex-direction:column;gap:3.4mm}
.tc{background:#15151a;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:4.6mm 5.5mm;display:grid;grid-template-columns:1fr 50mm;gap:5mm;align-items:center}
.tc.hot{border-color:#f96205}
.tc .nm{font-weight:700;font-size:14pt;letter-spacing:-.01em}
.tc .by{font-weight:700;font-size:6.8pt;letter-spacing:.1em;color:rgba(245,245,243,.5);margin:1mm 0 1.6mm}
.tc .d{font-size:9.6pt;line-height:1.42;color:rgba(245,245,243,.72)}
.tc .p{text-align:right;font-weight:800;font-size:13pt;letter-spacing:-.02em;color:#f96205;line-height:1.15}
.tc .s{text-align:right;font-family:'JB';font-size:6.4pt;letter-spacing:.06em;color:rgba(245,245,243,.45);margin-top:2mm;line-height:1.45}
/* cost (light page) */
.ct{margin-top:7mm;display:flex;flex-direction:column}
.cr{display:grid;grid-template-columns:1fr 40mm 50mm;gap:4mm;padding:5.6mm 0;border-top:1px solid rgba(10,10,10,.1);align-items:baseline}
.cr:last-child{border-bottom:1px solid rgba(10,10,10,.1)}
.cr .a{font-weight:700;font-size:12pt}
.cr .b{font-family:'JB';font-size:7.4pt;letter-spacing:.08em;color:rgba(13,13,16,.6)}
.cr .c{text-align:right;font-weight:800;font-size:13pt;color:#b4480a;white-space:nowrap}
.box{background:#101014;color:#f5f5f3;border-radius:10px;padding:6mm 7mm;margin-top:8mm}
.box .t{font-weight:700;font-size:13pt;margin-bottom:2mm}
.box p{font-size:10pt;line-height:1.5;color:rgba(245,245,243,.72)}
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-top:8mm}.tiles>div{background:#fff;border:1px solid rgba(10,10,10,.1);border-radius:12px;padding:5mm}.tiles .n{font-weight:800;font-size:26pt;letter-spacing:-.03em}.tiles .l{font-weight:700;font-size:6.8pt;letter-spacing:.1em;color:rgba(13,13,16,.52);margin-top:2mm;line-height:1.4}
/* method */
.st{display:grid;grid-template-columns:1fr 1fr;gap:3.4mm;margin-top:2mm}
.sc{background:#15151a;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:4.4mm 5mm;display:grid;grid-template-columns:11mm 1fr}
.sc .n{font-weight:800;font-size:15pt;color:#f96205}
.sc .t{font-weight:700;font-size:11.5pt;margin-bottom:1.2mm}
.sc .d{font-size:9pt;line-height:1.42;color:rgba(245,245,243,.72)}
.eth{border:1px solid #f96205;border-radius:12px;padding:4mm 5mm;margin-top:3.4mm;display:grid;grid-template-columns:30mm 1fr;align-items:center}
.eth .t{font-family:'JB';font-size:7pt;letter-spacing:.18em;color:#f96205}
.eth .d{font-size:9.6pt;color:rgba(245,245,243,.85)}
.rl{margin-top:2mm}
.ri{display:grid;grid-template-columns:30mm 1fr;gap:4mm;padding:3.6mm 0;border-top:1px solid rgba(255,255,255,.1)}
.ri .t{font-weight:700;font-size:11pt}
.ri .d{font-size:9.3pt;line-height:1.45;color:rgba(245,245,243,.72)}
.ri .s{font-family:'JB';font-size:6.4pt;letter-spacing:.06em;color:rgba(245,245,243,.45);margin-top:1.4mm}
/* sources */
.sr{display:grid;grid-template-columns:1fr 1fr;column-gap:8mm;margin-top:2mm}
.si{padding:3mm 0;border-top:1px solid rgba(255,255,255,.1)}
.si .t{font-weight:700;font-size:9.8pt}
.si .d{font-family:'JB';font-size:6.8pt;letter-spacing:.04em;color:rgba(245,245,243,.5);margin-top:1mm}
.end{margin-top:auto;margin-bottom:14mm;border-radius:14px;overflow:hidden;position:relative;min-height:56mm}
.end .bg{position:absolute;inset:0;background:url('file://""" + PUB + """/art/ribbon-side-16x9.webp') center 40%/cover}
.end .o{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,10,10,.97) 0%,rgba(10,10,10,.92) 50%,rgba(10,10,10,.35) 100%)}
.end .in{position:relative;padding:8mm}
.end .t{font-weight:800;font-size:22pt;letter-spacing:-.025em;line-height:1.05;max-width:110mm}
.end .bar{display:inline-block;background:#f96205;color:#0a0a0b;font-weight:700;font-size:10.5pt;border-radius:8px;padding:3.4mm 5mm;margin-top:5mm}
.end .c{font-family:'JB';font-size:7pt;letter-spacing:.18em;color:rgba(245,245,243,.55);margin-top:4mm}
.sig{display:flex;justify-content:space-between;align-items:center;margin-bottom:6mm}
.sig img{height:6mm}
.sig span{font-family:'JB';font-size:7.4pt;letter-spacing:.16em;color:rgba(245,245,243,.55)}
"""


def hd(meta, light=False):
    logo = 'fulgortec-horizontal-gradient-on-light.svg' if light else 'fulgortec-horizontal-white.svg'
    return f"<div class='hd'><img src='file://{PUB}/logos/{logo}'><div class='m'>{E(meta)}</div></div>"


def ft(n):
    return f"<div class='ft'><span>{E(SPEC['footer'])}</span><b>{n:02d}</b></div>"


def build():
    S = SPEC
    c = S['cover']
    p = []
    p.append(f"""<section class='page cover'><div class='art'></div><div class='ov'></div><div class='in'>
<div class='hd' style='border:none'><img src='file://{PUB}/logos/fulgortec-horizontal-gradient-on-dark.svg'><div class='m'>OUTUBRO 2026</div></div>
<h1>{E(c['title'])}</h1><div class='k'>{E(c['kicker'])}</div><div class='lead'>{E(c['lead'])}</div>
<div class='stats'>{''.join(f"<div><div class='n'>{E(n)}</div><div class='l'>{E(l)}</div></div>" for n, l in c['stats'])}</div>
<div class='cta' style='margin-top:12mm'>{E(c['cta'])}</div></div>{ft(1)}</section>""")
    t = S['tools']
    rows = ''.join(f"<div class='tc{' hot' if nm == 'Seedance 2.5' else ''}'><div><div class='nm'>{E(nm)}</div><div class='by'>{E(by.upper())}</div><div class='d'>{E(d)}</div></div><div><div class='p'>{E(pr)}</div><div class='s'>{E(src)}</div></div></div>" for nm, by, d, pr, src in t['rows'])
    p.append(f"<section class='page'>{hd('01 / FERRAMENTAS')}<div class='k'>{E(t['kicker'])}</div><h1>{E(t['title'])}</h1><div class='tl'>{rows}</div>{ft(2)}</section>")
    k = S['cost']
    rows = ''.join(f"<div class='cr'><div class='a'>{E(a)}</div><div class='b'>{E(b.upper())}</div><div class='c'>{E(cc)}</div></div>" for a, b, cc in k['rows'])
    p.append(f"<section class='page light'>{hd('02 / CUSTO REAL', True)}<div class='k'>{E(k['kicker'])}</div><h1>{E(k['title'])}</h1><div class='lead'>{E(k['lead'])}</div><div class='ct'>{rows}</div><div class='tiles'>{''.join(f"<div><div class='n'>{E(n)}</div><div class='l'>{E(l)}</div></div>" for n, l in k['tiles'])}</div><div class='box'><div class='t'>O resto é direção.</div><p>{E(k['note'])} O que separa um vídeo de IA que convence de um que vira meme é revisão e saber o que não pedir à máquina.</p></div>{ft(3)}</section>")
    m = S['method']
    r = S['rules']
    steps = ''.join(f"<div class='sc'><div class='n'>{i + 1:02d}</div><div><div class='t'>{E(a)}</div><div class='d'>{E(b)}</div></div></div>" for i, (a, b) in enumerate(m['steps']))
    rules = ''.join(f"<div class='ri'><div class='t'>{E(a)}</div><div><div class='d'>{E(b)}</div><div class='s'>{E(s.upper())}</div></div></div>" for a, b, s in r['items'])
    p.append(f"<section class='page'>{hd('03 / MÉTODO E REGRAS')}<div class='k'>{E(m['kicker'])}</div><h1 style='font-size:26pt'>{E(m['title'])}</h1><div class='st'>{steps}</div><div class='eth'><div class='t'>REGRA ÉTICA</div><div class='d'>{E(m['ethic'])}</div></div><div class='rule'></div><div class='k'>{E(r['kicker'])}</div><div class='rl'>{rules}</div>{ft(4)}</section>")
    s = S['sources']
    items = ''.join(f"<div class='si'><div class='t'>{E(a)}</div><div class='d'>{E(b)}</div></div>" for a, b in s['items'])
    p.append(f"<section class='page'>{hd('04 / FONTES')}<div class='k'>{E(s['kicker'])}</div><h1 style='font-size:26pt'>{E(s['title'])}</h1><div class='sr'>{items}</div><div class='end'><div class='bg'></div><div class='o'></div><div class='in'><div class='t'>{E(s['cta_title'])}</div><div class='bar'>{E(s['cta'])}</div><div class='c'>CONTACTO · {E(s['contact'].upper())}</div></div></div><div class='sig'><img src='file://{PUB}/logos/fulgortec-horizontal-white.svg'><span>MAIS TECNOLOGIA. MAIS POSSIBILIDADES.</span></div>{ft(5)}</section>")
    doc = f"<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><title>FULGORTEC · Guia do episódio IA no cinema</title><style>{CSS}</style></head><body>{''.join(p)}</body></html>"
    open(OUT + '/guide.html', 'w').write(doc)


if __name__ == '__main__':
    build()
