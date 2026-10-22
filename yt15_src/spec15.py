"""yt15 edit spec -> data15.ts (Remotion) + edl15.json (sandbox base assembly).
All times are anchored to word onsets of the narration (timeline.json from words.py).
Sandbox: python3 spec15.py timeline.json data15.ts edl15.json cams.json  (also writes anchors.json)
Local:   python3 spec15.py anchors.json data15.ts edl15.json cams.json"""
import json, re, sys, unicodedata

SRC = json.load(open(sys.argv[1]))
OUT_TS = sys.argv[2]
OUT_EDL = sys.argv[3]
CAMS = json.load(open(sys.argv[4]))['cams']
LOCAL = 'anch' in SRC
TL = SRC if not LOCAL else {'total': SRC['total'], 'tl': SRC['tl']}
segs = {s['id']: s for s in TL['tl'] if isinstance(s.get('n'), int)}
special = {s['n']: s for s in TL['tl'] if not isinstance(s.get('n'), int)}
ANCH = SRC.get('anch', {})
REC = {}

def norm(w):
    w = unicodedata.normalize('NFD', w.lower())
    w = ''.join(c for c in w if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9%$]', '', w)


def A(sid, word=None, off=0.0, nth=1):
    s = segs[sid]
    if word is None:
        return round(s['a'] + off, 3)
    if word == '$end':
        return round(s['b'] + off, 3)
    key = f'{sid}|{word}|{nth}'
    if LOCAL:
        if key not in ANCH:
            print(f'WARN anchor missing locally: {key}', file=sys.stderr)
            return round(s['a'] + off, 3)
        return round(ANCH[key] + off, 3)
    k = norm(word)
    c = 0
    for w in s['words']:
        if norm(w[0]).startswith(k):
            c += 1
            if c == nth:
                REC[key] = w[1]
                return round(w[1] + off, 3)
    print(f'WARN anchor not found: {sid} {word}', file=sys.stderr)
    REC[key] = s['a']
    return round(s['a'] + off, 3)


def S(sid):
    return segs[sid]['a']


def E(sid):
    return segs[sid]['b']


EV = []      # remotion events
BR = []      # b-roll inserts for base video


def card(t0, t1, type_, **p):
    EV.append({'k': 'card', 't0': round(t0, 3), 't1': round(t1, 3), 'type': type_, 'p': p})


def over(t0, t1, type_, **p):
    EV.append({'k': 'over', 't0': round(t0, 3), 't1': round(t1, 3), 'type': type_, 'p': p})


def broll(t0, t1, src, ss=0.0, speed=1.0):
    BR.append({'t0': round(t0, 3), 't1': round(t1, 3), 'src': src, 'ss': ss, 'speed': speed})


CH = [('00', 'Abertura', 0.0)]
def chapter(n, title, sid, dur=2.4):
    t = S(sid)
    CH.append((n, title, t))
    card(t, t + dur, 'chapter', n=n)

# ---------------- 00 ABERTURA ----------------
over(S('T01a') + 0.2, E('T01a'), 'stack', x=96, y=860, items=[{'at': S('T01a') + 0.3, 'text': 'NETFLIX · "ANIMALS" · 9 OUT 2026'}], size=30)
over(A('T01a', 'menos'), A('T01a', 'criança') - 0.1, 'stamp', text='< 1 segundo', x=1180, y=300, size=96, rot=-6)
broll(A('T01a', 'criança') - 0.1, E('T01a'), 'n201')
over(A('T01b', 'isso'), E('T01b') + 0.1, 'slam', y=330, size=260, items=[{'at': A('T01b', 'isso'), 'light': 'ISSO É', 'heavy': 'IA?'}])
over(A('T02', 'cem'), E('T02'), 'stamp', text='100% IA', x=130, y=280, size=130, rot=-5, color='orange')
over(A('T02', 'oscar'), E('T02'), 'stamp', text='Oscar?', x=1300, y=560, size=120, rot=6)
card(A('T03', 'globo'), E('T03'), 'timeline', kicker='GLOBO · CHAMADA FEITA COM IA', src='FONTE: TERRA / ROLLING STONE BRASIL · 4 SET 2026',
     steps=[{'at': A('T03', 'colocou'), 'label': '2 SET', 'sub': 'Mion vira Tom Cruise · no ar'}, {'at': A('T03', 'apagou'), 'label': '3 SET', 'sub': 'apagado', 'red': True}, {'at': A('T03', 'notificacao'), 'label': 'HOLLYWOOD', 'sub': 'notificação extrajudicial', 'red': True}])
over(S('T04a'), E('T04b'), 'shade', side='left')
over(S('T04a'), E('T04b'), 'stack', x=110, y=300, size=48, numbered=True, title={'at': A('T04a', 'mostrar'), 'text': 'HOJE NESTE VÍDEO'},
     items=[{'at': A('T04b', 'quem'), 'text': 'Quem já usa'}, {'at': A('T04b', 'dizendo'), 'text': 'Quem está dizendo não'}, {'at': A('T04b', 'regra'), 'text': 'A regra nova do Oscar'}, {'at': A('T04b', 'guerra'), 'text': 'A guerra das ferramentas'}, {'at': A('T04b', 'muda'), 'text': 'O que muda para você', 'accent': True}])
over(S('T05'), E('T05'), 'shade', side='right')
over(S('T05'), E('T05'), 'stack', x=110, y=360, align='right', size=56, title={'at': A('T05', 'final'), 'text': 'E NO FINAL'},
     items=[{'at': A('T05', 'tutorial'), 'text': 'TUTORIAL COMPLETO', 'accent': True}, {'at': A('T05', 'qualquer'), 'text': 'você em qualquer lugar do mundo'}, {'at': A('T05', 'fica'), 'text': 'Fica até o fim.', 'accent': True}])
st = special['sting']
EV.append({'k': 'sting', 't0': st['a'], 't1': st['b'], 'type': 'sting', 'p': {}})

# ---------------- 01 HOLLYWOOD ----------------
chapter('01', 'Hollywood já está usando', 'T061')
over(S('T061') + 2.6, S('T061') + 6.3, 'lt', name='Silas Costa', role='SILASTEC CAST · FULGORTEC')
over(A('T062', 'ted'), A('T062', 'contou'), 'lt', name='Ted Sarandos', role='co-CEO · Netflix')
card(A('T062', 'contou') - 0.1, E('T062'), 'stat', kicker='NETFLIX · IA GENERATIVA EM 2026', big='≈300', count=300, prefix='≈', line='filmes e séries com IA generativa', sub='pós-produção, multidões, pré-visualização', hit=A('T062', 'trezentos'), src='FONTE: NETFLIX · RESULTADOS 2T 2026 (JUL)')
broll(A('T071', 'multidoes'), A('T071', 'batalhas'), 'b2')
broll(A('T071', 'batalhas'), A('T071', 'planos'), 'b3')
broll(A('T071', 'planos'), E('T071'), 'b4')
card(A('T072', 'dezessete') - 0.2, E('T072'), 'stat', kicker='DOCUMENTÁRIO · THE AMERICAN EXPERIMENT', big='17 MIN', line='de imagens feitas com IA', sub='na metade do tempo e pela metade do custo', hit=A('T072', 'dezessete'), src='FONTE: NETFLIX · 2026')
over(A('T08', 'cena'), E('T08'), 'shade', side='left')
over(A('T08', 'cena'), E('T08'), 'stack', x=110, y=380, size=60, items=[{'at': A('T08', 'cena'), 'text': 'A cena que era cortada'}, {'at': A('T08', 'agora'), 'text': 'agora entra.', 'accent': True}])
card(A('T09a1', 'netflix') - 0.1, E('T09a1'), 'stat', kicker='NETFLIX COMPRA A INTERPOSITIVE · MAR 2026', big='US$ 587 MI', line='a empresa de IA do Ben Affleck', hit=A('T09a1', 'quinhentos'), src='FONTE: FORBES · INC. · 2026')
over(A('T09a2', 'virou'), E('T09a2'), 'lt', name='Ben Affleck', role='conselheiro de IA · Netflix')
over(A('T09b', 'animals'), E('T09b'), 'stamp', text='"Animals" · 9 out', x=1120, y=320, size=78, rot=-5, color='orange')
card(A('T10', 'comparou') - 0.1, E('T10'), 'quote', kicker='BEN AFFLECK SOBRE ONDE USOU IA', text='Como um mágico que não revela o truque.', who='E o público achou o truque. Rotten Tomatoes: 35%.', src='FONTE: FORBES 7 OUT · IOL 16 OUT 2026')
over(A('T11', 'perdoa') - 0.3, A('T11', 'amplifica') - 0.1, 'slam', y=300, size=200, items=[{'at': A('T11', 'perdoa') - 0.3, 'light': 'A IA NÃO PERDOA', 'heavy': 'PLANO PREGUIÇOSO'}])
over(A('T11', 'amplifica'), E('T11'), 'shade', side='bottom')
over(A('T11', 'amplifica'), E('T11'), 'stack', x=110, y=820, size=54, items=[{'at': A('T11', 'amplifica'), 'text': 'Ela amplifica o que você faz.', 'accent': True}])
broll(S('T12a'), E('T12a'), 'b12')
over(S('T12a') + 0.2, E('T12a'), 'stamp', text='Disney', x=1300, y=300, size=110, rot=-6, color='orange')
card(A('T12b', 'cargo') - 0.3, E('T12b'), 'stat', kicker='DISNEY · 2 OUT 2026', big='1º CTO', line='ex-CEO da Character.ai para as plataformas de IA', hit=A('T12b', 'cargo'), src='FONTE: CIO DIVE · 21 SET 2026')
card(S('T12c'), E('T12c'), 'quote', kicker='JOSH D\'AMARO · CEO DA DISNEY', text='Amplifica o que os nossos contadores de histórias fazem, não os substitui.', who='Teleconferência de resultados · 5 ago 2026', src='FONTE: LAUGHING PLACE · 5 AGO 2026')

# ---------------- 02 FILME 100% IA + OSCAR ----------------
chapter('02', 'O primeiro filme 100% IA', 'T13a')
over(A('T13a', 'chama'), E('T13a'), 'shade', side='left')
over(A('T13a', 'chama'), E('T13a'), 'stack', x=110, y=360, size=58, items=[{'at': A('T13a', 'gods'), 'text': 'GODS DON\'T GIVE GIFTS', 'accent': True}, {'at': A('T13a', 'youtuber'), 'text': 'criado por um youtuber'}, {'at': A('T13a', 'fable'), 'text': 'produzido pela Fable'}])
broll(S('T13b'), A('T13b', 'consciencia') - 0.1, 'b1')
broll(A('T13b', 'consciencia') - 0.1, E('T13b'), 'b5')
card(A('T14', 'adiaram') - 0.6, E('T14'), 'timeline', kicker='GODS DON\'T GIVE GIFTS · ESTREIA NOS EUA', src='FONTE: FUTURISM · LA VANGUARDIA (8 OUT 2026)',
     steps=[{'at': A('T14', 'adiaram') - 0.4, 'label': '30 OUT', 'sub': 'data original', 'red': True}, {'at': A('T14', 'dezembro'), 'label': '4 DEZ', 'sub': 'nova data'}, {'at': A('T14', 'animacao'), 'label': 'OSCAR?', 'sub': 'melhor animação'}])
over(A('T15', 'academia'), E('T15') + 0.1, 'slam', y=320, size=210, items=[{'at': A('T15', 'academia'), 'light': 'EM MAIO A ACADEMIA', 'heavy': 'MUDOU AS REGRAS'}])
card(A('T16', 'vale') - 0.3, E('T16'), 'list', kicker='OSCAR 2027 · REGRAS NOVAS', title='SÓ VALE HUMANO', src='FONTE: NPR · TECHCRUNCH · 2 MAI 2026',
     items=[{'at': A('T16', 'atuacao'), 'text': 'Atuação feita por humanos, com consentimento', 'tag': '01'}, {'at': A('T16', 'roteiro'), 'text': 'Roteiro de autoria humana', 'tag': '02'}, {'at': A('T16', 'academia'), 'text': 'A Academia pode perguntar onde a IA foi usada', 'tag': '03', 'accent': True}])
card(A('T171', 'globo') - 0.2, E('T171'), 'versus', kicker='PRÊMIOS 2027 · DUAS REGRAS', src='FONTE: NPR (2 MAI) · CNN BRASIL (8 MAI 2026)',
     left={'title': 'OSCAR', 'lines': ['Atuação e roteiro humanos', 'IA pode ser questionada'], 'at': A('T171', 'globo') - 0.1},
     right={'title': 'GLOBO DE OURO', 'lines': ['IA não desqualifica', 'se a autoria for humana'], 'at': A('T171', 'desqualifica')})
over(A('T172', 'inscricoes'), E('T172'), 'stamp', text='Inscrições até 30 out', x=1000, y=300, size=78, rot=-5)
broll(A('T18a', 'critterz'), E('T18a'), 'n206')
over(A('T18a', 'orcamento'), E('T18a'), 'shade', side='bottom')
over(A('T18a', 'orcamento'), E('T18a'), 'stack', x=110, y=820, size=46, items=[{'at': A('T18a', 'orcamento'), 'text': '< US$ 30 mi', 'accent': True}, {'at': A('T18a', 'quinze'), 'text': '15 pessoas · 9 meses'}])
card(A('T18b', 'sora') - 0.6, E('T18b'), 'off', kicker='CRITTERZ · A "PIXAR DA OPENAI"', word='CANNES', offAt=A('T18b', 'perdeu'), line='A OpenAI: "nem financiadora, nem produtora".', lineAt=A('T18b', 'disse'), src='FONTE: FUTURISM · BLOOMBERG (MAI 2026)')
over(A('T19', 'plano'), E('T19') + 0.1, 'slam', y=330, size=230, items=[{'at': A('T19', 'plano'), 'light': 'TENHA UM', 'heavy': 'PLANO B'}])

# ---------------- 03 ATORES ----------------
chapter('03', 'Atores, clones e dublagem', 'T20a')
broll(A('T20a', 'tilly') - 0.2, E('T20a'), 'b7')
card(A('T20b', 'piers') - 0.3, E('T20b'), 'glitch', kicker='TILLY NORWOOD · ATRIZ GERADA POR IA', first='AO VIVO', second='CANTONÊS', secondAt=A('T20b', 'cantones'), stat='14M', statAt=A('T20b', 'catorze'), src='FONTE: EURONEWS · 21 SET 2026')
card(A('T21', 'ela') - 0.2, E('T21'), 'quote', kicker='SAG-AFTRA SOBRE TILLY NORWOOD', text='Um personagem gerado por um programa treinado no trabalho de inúmeros atores de verdade.', who='Sindicato dos atores de Hollywood', src='FONTE: EURONEWS · SET 2026')
card(A('T22a', 'disse') - 0.2, E('T22a'), 'quote', kicker='MARK WAHLBERG · TECHCRUNCH DISRUPT · 16 OUT', text='Uma versão de IA dele continuando Ted por décadas? Ele não se opõe.', who='E quer que filhos e netos cuidem da imagem', src='FONTE: TECHCRUNCH · 16 OUT 2026', marks=False)
over(A('T23a', 'nicolas'), E('T23a'), 'stamp', text='Nicolas Cage · NYCC', x=1080, y=300, size=72, rot=-5, color='orange')
card(S('T23b'), E('T23b'), 'quote', kicker='NICOLAS CAGE · COMIC CON DE NOVA YORK · 10 OUT', text='Não assinei o waiver para usarem IA em Spider-Noir. Não sou um ator amigável à IA.', who='Tradução livre · TheWrap', src='FONTE: THEWRAP · 10 OUT 2026')
card(A('T24', 'amazon') - 0.2, E('T24'), 'stat', kicker='SPIDER-NOIR · AMAZON', big='11', line='indicações ao Emmy — e cancelada antes', hit=A('T24', 'onze'), src='FONTE: THEWRAP · 10 OUT 2026')
over(A('T25', 'assina') - 0.2, E('T25') + 0.1, 'slam', y=320, size=210, items=[{'at': A('T25', 'assina') - 0.2, 'out': A('T25', 'recusa') - 0.1, 'light': 'UM', 'heavy': 'ASSINA'}, {'at': A('T25', 'recusa') - 0.1, 'light': 'OUTRO', 'heavy': 'RECUSA', 'color': 'red'}])
broll(A('T26a', 'prime') - 0.2, E('T26a'), 'n208')
card(A('T26b', 'maxton') - 0.3, E('T26b'), 'pipeline', kicker='PRIME VIDEO · MAXTON HALL · 9 SET 2026', src='FONTE: EXAME · TECHSPOT · SET 2026',
     nodes=[{'at': A('T26b', 'maxton'), 'label': 'ATOR', 'sub': 'filmagem original'}, {'at': A('T26b', 'voz'), 'label': 'VOZ', 'sub': 'dublador humano'}, {'at': A('T26b', 'imagem'), 'label': 'LÁBIOS', 'sub': 'ajustados por IA'}],
     foot='A voz continua humana. A boca, não.')
over(A('T27', 'portugues'), E('T27'), 'stamp', text='Próximo: português', x=1050, y=320, size=78, rot=-5, color='orange')
broll(A('T28a', 'michael') - 0.2, E('T28a'), 'n209')
over(A('T28a', 'odisseia'), E('T28a'), 'stack', x=110, y=840, size=40, items=[{'at': A('T28a', 'odisseia'), 'text': 'MICHAEL CAINE × ELEVENLABS · 13 H DE AUDIOLIVRO', 'accent': True}])
card(S('T28b'), E('T28b'), 'stat', kicker='ELEVENLABS · MERCADO DE VOZES', big='US$ 22 MI', line='pagos a mais de 10 mil criadores de voz', hit=A('T28b', 'vinte'), src='FONTE: LA TIMES · 30 AGO 2026')
card(A('T29', 'kilmer') - 0.4, E('T29'), 'quote', kicker='VAL KILMER · AS DEEP AS THE GRAVE', text='Recriado por IA, com autorização e pagamento ao espólio.', who='Segundo a filha, Mercedes Kilmer', src='FONTE: LIVENOW FOX · 2026', marks=False)
over(A('T30', 'assina') - 0.2, E('T30') + 0.1, 'slam', y=320, size=220, items=[{'at': A('T30', 'assina') - 0.2, 'out': A('T30', 'recebe') - 0.1, 'light': 'QUEM', 'heavy': 'ASSINA'}, {'at': A('T30', 'recebe') - 0.1, 'light': 'E QUEM', 'heavy': 'RECEBE'}])

# ---------------- 04 BRASIL ----------------
chapter('04', 'E o Brasil?', 'T31')
card(A('T31', 'mion') - 0.4, E('T31'), 'list', kicker='GLOBO · CHAMADA DE 2 SET 2026', title='TUDO GERADO POR IA', src='FONTE: TERRA / ROLLING STONE BRASIL · 4 SET 2026',
     items=[{'at': A('T31', 'mion'), 'text': 'Marcos Mion → Tom Cruise', 'tag': '01'}, {'at': A('T31', 'huck'), 'text': 'Luciano Huck → Hulk', 'tag': '02'}, {'at': A('T31', 'ana'), 'text': 'Ana Maria Braga + Rocket', 'tag': '03'}])
card(A('T32', 'estudio') - 0.3, E('T32'), 'timeline', kicker='O DIA (COLUNA CANAL D) · TERRA', src='FONTE: O DIA · TERRA · 4 SET 2026',
     steps=[{'at': A('T32', 'estudio') - 0.2, 'label': 'NOTIFICAÇÃO', 'sub': 'estúdio de Hollywood', 'red': True}, {'at': A('T32', 'sumiu'), 'label': 'APAGADA', 'sub': 'no dia seguinte', 'red': True}, {'at': A('T32', 'pronunciou'), 'label': 'SILÊNCIO', 'sub': 'Globo não comentou'}])
card(A('T331', 'microdramas') - 0.3, E('T331'), 'stat', kicker='GLOBO · DATA CENTER WORLD BRASIL · 6 OUT', big='1T 2027', line='microdramas verticais "nativos em IA"', hit=A('T331', 'primeiro'), src='FONTE: TV POP · 8 OUT 2026')
over(A('T332', 'direitos') - 0.2, E('T332') + 0.1, 'slam', y=320, size=220, items=[{'at': A('T332', 'direitos') - 0.2, 'light': 'O ERRO FOI DE', 'heavy': 'DIREITOS'}])
over(A('T34a', 'marco'), E('T34a'), 'shade', side='left')
over(A('T34a', 'marco'), E('T34a'), 'stack', x=110, y=380, size=56, title={'at': A('T34a', 'marco'), 'text': 'MARCO DA IA · PL 2338'}, items=[{'at': A('T34a', 'votado'), 'text': 'Votação na Câmara: fim de 2026'}, {'at': A('T34a', 'direitos'), 'text': 'Trava: direitos autorais', 'accent': True}])
card(A('T34b', 'europa') - 0.2, E('T34b'), 'stat', kicker='UNIÃO EUROPEIA · AI ACT · ARTIGO 50', big='2 AGO 2026', line='rótulo visível + marca legível por máquina', sub='em vídeo e áudio gerados que pareçam reais', hit=A('T34b', 'agosto'), src='FONTE: COMISSÃO EUROPEIA · 2 AGO 2026')
card(S('T34c'), E('T34c'), 'stat', kicker='AI ACT · MULTA MÁXIMA', big='€ 15 MI', line='ou 3% do faturamento global', hit=A('T34c', 'quinze'), src='FONTE: COMISSÃO EUROPEIA')

# ---------------- 05 FERRAMENTAS ----------------
chapter('05', 'A guerra das ferramentas', 'T36a')
broll(A('T36a', 'guerra') - 0.2, E('T36a'), 'n215')
card(S('T36b'), E('T36b'), 'off', kicker='OPENAI · 24 MAR 2026', word='SORA', offAt=A('T36b', 'desligou'), line='E a Disney saiu do acordo bilionário.', lineAt=A('T36b', 'disney'), src='FONTE: OPENAI · THE HOLLYWOOD REPORTER')
broll(S('T37a'), A('T37a', 'trinta') - 0.2, 'b8')
card(A('T37a', 'trinta') - 0.2, E('T37a'), 'stat', kicker='BYTEDANCE · SEEDANCE 2.5 · 31 JUL 2026', big='30 S', line='contínuos, com som · modo longo até 3 min', sub='a partir de US$ 0,097 por segundo', hit=A('T37a', 'trinta'), src='FONTE: PR NEWSWIRE · 3 AGO 2026')
over(S('T37b'), E('T37b'), 'stamp', text='No Runway · ago', x=1150, y=320, size=78, rot=-5, color='orange')
card(A('T38a', 'gemini') - 0.2, E('T38a'), 'stat', kicker='GOOGLE · GEMINI OMNI 1.1 FLASH', big='40 S', line='1080p ou 4K · grátis no Google Vids', hit=A('T38a', 'quarenta'), src='FONTE: GOOGLE · GEMINI API DOCS · UNITE.AI')
over(A('T38b', 'veo'), E('T38b'), 'stamp', text='Veo 3.1 preview · OFF hoje', x=900, y=320, size=72, rot=-5)
card(A('T39a', 'kuaishou') - 0.2, E('T39a'), 'stat', kicker='KUAISHOU (KLING) · BAIDU · ALIBABA · TENCENT', big='US$ 3 BI', line='rodada para a Kling AI', hit=A('T39a', 'tres'), src='FONTE: SCMP · 3 JUL 2026')
card(S('T39b'), E('T39b'), 'list', kicker='O DINHEIRO NAS FERRAMENTAS', src='FONTE: RUNWAY · KOMPOZY · FINSMES (2026)',
     items=[{'at': A('T39b', 'premiere'), 'text': 'Runway: plugins no Premiere, After Effects e DaVinci', 'tag': '01'}, {'at': A('T39b', 'lionsgate'), 'text': 'Lionsgate vira sócia da Runway', 'tag': '02'}, {'at': A('T39b', 'higgsfield'), 'text': 'Higgsfield: US$ 400 mi · avaliada em US$ 5,4 bi', 'tag': '03', 'accent': True}], size=50)
card(A('T40', 'plano') - 0.2, E('T40'), 'pipeline', kicker='COMO UM PLANO É FEITO HOJE', src='',
     nodes=[{'at': A('T40', 'plano'), 'label': 'IMAGEM', 'sub': 'Nano Banana · Seedream'}, {'at': A('T40', 'passa'), 'label': 'VÍDEO', 'sub': 'Seedance · Kling · Veo'}, {'at': A('T40', 'tres'), 'label': 'VOZ', 'sub': 'ElevenLabs'}, {'at': A('T40', 'tela'), 'label': 'EDIÇÃO', 'sub': 'direção humana'}],
     foot='3 a 4 modelos por plano.')
broll(S('T41a'), E('T41a'), 'n214')
over(A('T41a', 'disney'), E('T41a'), 'stamp', text='Estúdios × Midjourney', x=980, y=320, size=78, rot=-5)
card(A('T41b', 'seis') - 0.3, E('T41b'), 'timeline', kicker='DISNEY, UNIVERSAL E WARNER × MIDJOURNEY', src='FONTE: AI LAWSUIT TRACKER · 19 OUT 2026',
     steps=[{'at': A('T41b', 'seis'), 'label': '6 OUT', 'sub': 'entrega dos dados de treino'}, {'at': A('T41b', 'pericia'), 'label': '9 NOV', 'sub': 'perícia'}, {'at': A('T41b', 'julgamento'), 'label': '?', 'sub': 'sem data de julgamento'}])
over(A('T42', 'justo') - 0.2, E('T42') + 0.1, 'slam', y=320, size=230, items=[{'at': A('T42', 'justo') - 0.2, 'light': 'TREINAR COM FILMES É', 'heavy': 'USO JUSTO?'}])

# ---------------- 06 PÚBLICO ----------------
chapter('06', 'O público e onde a IA falha', 'T431')
broll(A('T431', 'pesquisa') - 0.2, E('T431'), 'n216')
card(S('T432'), E('T432'), 'bars', kicker='ANGUS REID · EUA · JUN 2026 · 2.007 ADULTOS', title='Você assistiria a um filme 100% feito por IA?', src='FONTE: ANGUS REID INSTITUTE · 10 JUL 2026',
     bars=[{'at': A('T432', 'trinta'), 'label': 'Sim', 'value': 39}, {'at': A('T432', 'cinquenta'), 'label': 'Não', 'value': 50, 'color': 'red'}])
card(A('T44', 'jovens') - 0.2, E('T44'), 'bars', kicker='DISPOSTOS A ASSISTIR, POR IDADE', title='Os mais jovens são os mais resistentes.', src='FONTE: ANGUS REID INSTITUTE · 2026',
     bars=[{'at': A('T44', 'jovens'), 'label': '18–34 anos', 'value': 35}, {'at': A('T44', 'geracao'), 'label': '55+ anos', 'value': 42}])
card(A('T45', 'maos') - 0.3, E('T45'), 'list', kicker='ONDE A IA AINDA FALHA', title='CUIDADO COM', src='',
     items=[{'at': A('T45', 'maos'), 'text': 'Mãos', 'tag': '01'}, {'at': A('T45', 'fisica'), 'text': 'Física', 'tag': '02'}, {'at': A('T45', 'continuidade'), 'text': 'Continuidade entre planos', 'tag': '03'}, {'at': A('T45', 'texto'), 'text': 'Texto dentro da imagem', 'tag': '04'}], size=64)
over(A('T46', 'direcao') - 0.2, E('T46'), 'shade', side='left')
over(A('T46', 'direcao') - 0.2, E('T46'), 'stack', x=110, y=380, size=64, items=[{'at': A('T46', 'direcao'), 'text': 'Direção.'}, {'at': A('T46', 'revisao'), 'text': 'Revisão.'}, {'at': A('T46', 'saber'), 'text': 'Saber o que não pedir.', 'accent': True}])

# ---------------- 07 PARA VOCÊ ----------------
chapter('07', 'O que muda para você', 'T47')
over(A('T47', 'criador') - 0.3, E('T47') + 0.1, 'slam', y=330, size=240, items=[{'at': A('T47', 'criador') - 0.3, 'light': 'SAIU DE UM', 'heavy': 'CRIADOR'}])
broll(A('T48a', 'videoclipe') - 0.2, A('T48a', 'trailer'), 'b11')
broll(A('T48a', 'trailer'), A('T48a', 'imobiliario'), 'pf:ih3')
broll(A('T48a', 'imobiliario'), A('T48a', 'publicidade'), 'pf:sintra')
broll(A('T48a', 'publicidade'), E('T48a'), 'b10')
over(A('T48a', 'videoclipe'), E('T48a'), 'lt', name='Produzido pela FULGORTEC', role='videoclipe · trailer · imobiliário · publicidade')
over(A('T48b', 'semanas') - 0.3, E('T48b') + 0.1, 'slam', y=320, size=220, items=[{'at': A('T48b', 'semanas') - 0.3, 'out': A('T48b', 'dias') - 0.1, 'light': 'ANTES', 'heavy': 'SEMANAS'}, {'at': A('T48b', 'dias') - 0.1, 'light': 'HOJE', 'heavy': 'DIAS'}])
card(S('T49a1'), A('T49b', 'rotulo') - 0.15, 'list', kicker='COMO COMEÇAR HOJE', title='3 PASSOS', src='',
     items=[{'at': A('T49a1', 'comece'), 'text': 'Comece pelo que você já tem', 'tag': '01'}, {'at': A('T49a2', 'junte'), 'text': 'Três ferramentas, não trinta', 'tag': '02'}, {'at': A('T49a2', 'tres', nth=2), 'text': 'Publique com transparência', 'tag': '03', 'accent': True}])
over(A('T49b', 'rotulo'), E('T49b'), 'stamp', text='Rótulo de IA ≠ sem monetização', x=760, y=320, size=66, rot=-4, color='orange')
over(A('T50', 'guia'), E('T50'), 'shade', side='bottom')
over(A('T50', 'guia'), E('T50'), 'stack', x=110, y=800, size=60, items=[{'at': A('T50', 'guia'), 'text': 'GUIA PDF GRÁTIS', 'accent': True}, {'at': A('T50', 'descricao'), 'text': 'link na descrição'}])

# ---------------- 08 TUTORIAL ----------------
chapter('08', 'Tutorial: você em qualquer lugar', 'T51')
tu = special['tut']
EV.append({'k': 'pip', 't0': tu['a'] + 0.5, 't1': tu['b'] - 0.2, 'type': 'pip', 'p': {}})

# ---------------- 09 ENCERRAMENTO ----------------
CH.append(('09', 'Encerramento', S('T52a')))
over(A('T52a', 'assistiria') - 0.2, E('T52a') + 0.1, 'slam', y=320, size=210, items=[{'at': A('T52a', 'assistiria') - 0.2, 'light': 'VOCÊ', 'heavy': 'ASSISTIRIA?'}])
over(A('T52b', 'inscreve'), E('T52b'), 'subscribe')
en = special['end']
EV.append({'k': 'end', 't0': en['a'], 't1': en['b'], 'type': 'end', 'p': {}})

# chrome on every presenter/b-roll moment not covered by a card
EV.sort(key=lambda e: e['t0'])

# ---- SFX cue list (files from ~/yt10/sfx) ----
H = 0.067
SFX = []
def sx(t, f, g):
    SFX.append([round(t, 3), f, g])
for e in EV:
    t0, p = e['t0'], e['p']
    if e['k'] == 'card':
        if e['type'] == 'chapter':
            sx(t0 - 0.25, 'kit_whoosh.wav', -14); sx(t0 + 5 / 30, 'hit_big.wav', -11)
            continue
        sx(t0 - 0.2, 'whoosh_s.wav', -15); sx(t0 + 0.1, 'tick.wav', -21)
        ty = e['type']
        if ty == 'stat':
            sx(max(t0 + 0.2, p.get('hit', t0 + 0.27)) + H, 'hit_big.wav', -11)
        elif ty == 'timeline':
            for stp in p['steps']:
                sx(stp['at'] + H, 'hit.wav', -13)
        elif ty in ('list',):
            for it in p['items']:
                sx(it['at'], 'tick.wav', -19)
        elif ty == 'versus':
            sx(p['left']['at'] + H, 'hit.wav', -12); sx(p['right']['at'] + H, 'hit.wav', -12)
        elif ty == 'bars':
            for b in p['bars']:
                sx(b['at'], 'tick.wav', -19); sx(b['at'] + 0.7, 'hit.wav', -14)
        elif ty == 'glitch':
            sx(p['secondAt'], 'glitch.wav', -13); sx(p['secondAt'] + H, 'hit.wav', -13); sx(p['statAt'] + H, 'hit_big.wav', -12)
        elif ty == 'off':
            sx(p['offAt'], 'crt.wav', -12); sx(p['offAt'] + H, 'hit.wav', -12)
        elif ty == 'pipeline':
            for nd in p['nodes']:
                sx(nd['at'] + H, 'tick.wav', -18)
            sx(p['nodes'][-1]['at'] + H, 'hit.wav', -14)
    elif e['k'] == 'over':
        ty = e['type']
        if ty == 'slam':
            for w in p['items']:
                sx(w['at'] - 0.25, 'whoosh_s.wav', -20); sx(w['at'] + H, 'hit.wav', -12)
        elif ty == 'stamp':
            sx(t0 + H, 'thud.wav', -9)
        elif ty == 'stack':
            if p.get('title'):
                sx(p['title']['at'], 'tick.wav', -22)
            for it in p['items']:
                sx(it['at'], 'tick.wav', -22)
        elif ty == 'lt':
            sx(t0, 'whoosh_s.wav', -23)
        elif ty == 'subscribe':
            sx(t0 + 16 / 30, 'click.wav', -12)
    elif e['k'] == 'sting':
        sx(t0 - 1.0, 'kit_riser.wav', -16); sx(t0, 'kit_whoosh.wav', -12)
        sx(t0 + 10 / 30, 'hit_big.wav', -9); sx(t0 + 40 / 30, 'hit.wav', -10); sx(t0 + 76 / 30, 'whoosh_s.wav', -15)
    elif e['k'] == 'pip':
        sx(t0 - 0.3, 'whoosh_s.wav', -18)
    elif e['k'] == 'end':
        sx(t0 - 0.25, 'kit_whoosh.wav', -14); sx(t0 + 6 / 30, 'hit.wav', -14)
for b in BR:
    sx(b['t0'] - 0.12, 'whoosh_s.wav', -23)
SFX.sort()

# ---- emit TS ----
ts = ['// generated by spec15.py — do not edit by hand', 'export type Ev = {k: string; t0: number; t1: number; type: string; p: any};',
      f"export const TOTAL15 = {TL['total']};",
      'export const CH15: {n: string; title: string; t: number}[] = ' + json.dumps([{'n': n, 'title': t, 't': round(x, 3)} for n, t, x in CH], ensure_ascii=False) + ';',
      'export const chapter15At = (t: number) => { let c = CH15[0]; for (const x of CH15) if (t >= x.t - 0.01) c = x; return c; };',
      'export const EV15: Ev[] = ' + json.dumps(EV, ensure_ascii=False) + ';',
      'export const TUT15 = ' + json.dumps({'a': tu['a'], 'b': tu['b']}) + ';',
      'export const END15T = ' + json.dumps({'a': en['a'], 'b': en['b']}) + ';',
      'export const STING15 = ' + json.dumps({'a': st['a'], 'b': st['b']}) + ';']
open(OUT_TS, 'w').write('\n'.join(ts) + '\n')

# ---- EDL for base video ----
pres = []
for s in TL['tl']:
    if isinstance(s.get('n'), int):
        pres.append({'n': s['n'], 'id': s['id'], 'cam': CAMS[s['n']], 'a': s['a'], 'b': s['b']})
cards = [{'t0': e['t0'], 't1': e['t1']} for e in EV if e['k'] in ('card', 'sting', 'end')]
json.dump({'total': TL['total'], 'pres': pres, 'broll': sorted(BR, key=lambda x: x['t0']), 'cards': cards, 'tut': {'a': tu['a'], 'b': tu['b']}, 'sting': {'a': st['a'], 'b': st['b']}, 'end': {'a': en['a'], 'b': en['b']},
           'sfx': SFX, 'chapters': [{'n': n, 'title': t, 't': round(x, 3)} for n, t, x in CH]}, open(OUT_EDL, 'w'), ensure_ascii=False, indent=0)

# ---- coverage stats ----
tot = TL['total'] - (tu['b'] - tu['a']) - (en['b'] - en['a'])
cov = sum(e['t1'] - e['t0'] for e in EV if e['k'] == 'card') + sum(b['t1'] - b['t0'] for b in BR)
print(f"events {len(EV)} broll {len(BR)} cover {cov:.1f}s of {tot:.1f}s = {100 * cov / tot:.0f}%", file=sys.stderr)

if not LOCAL:
    json.dump({'total': TL['total'], 'tl': [{'id': x.get('id'), 'n': x['n'], 'a': round(x['a'], 3), 'b': round(x['b'], 3)} for x in TL['tl']], 'anch': REC}, open('anchors.json', 'w'), ensure_ascii=False, separators=(',', ':'))
