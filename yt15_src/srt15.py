"""SRT for yt15 from timeline words (presenter) + whisper on the tutorial narration."""
import json, re, os, sys
H = '/home/user/yt15'
TL = json.load(open(H + '/build/timeline.json'))
words = []
for s in TL['tl']:
    if isinstance(s.get('n'), int):
        ws = s['words']
        if s['id'] == 'T14':  # whisper hallucinated on the leading/trailing silence of this take
            ws = [w for w in ws if 199.9 <= w[1] < 209.6]
        words += [[w[0], w[1]] for w in ws]
    elif s['n'] == 'tut':
        cache = H + '/build/tut_words.json'
        if not os.path.exists(cache):
            from faster_whisper import WhisperModel
            m = WhisperModel('small', device='cpu', compute_type='int8')
            segs, _ = m.transcribe('/home/user/tut/aud/narr_master.wav', language='pt', word_timestamps=True, vad_filter=True)
            tw = [[w.word.strip(), w.start, w.end] for sg in segs for w in sg.words]
            json.dump(tw, open(cache, 'w'), ensure_ascii=False)
        tw = json.load(open(cache))
        words += [[w[0], s['a'] + w[1]] for w in tw]
# normalise tokens
out = []
for w, t in words:
    if w in ('.A.', '.A.,', '.A.?', '.A') and out and out[-1][0] == 'I':
        out[-1][0] = {'.A.': 'IA.', '.A.,': 'IA,', '.A.?': 'IA?', '.A': 'IA'}[w]
        continue
    if w.startswith('-') and out:
        out[-1][0] += w
        continue
    if w in ('.5,', '.1', '.1.', '.5') and out:
        out[-1][0] += w
        continue
    if out and out[-1][0] in ('IA.', 'IA,') and w[:1].islower():
        out[-1][0] = 'IA' if out[-1][0] == 'IA.' else 'IA,'
    if w == '...':
        continue
    out.append([w, t])
seg_end = {}
for s in TL['tl']:
    seg_end[round(s['a'], 3)] = s['b']
ends = sorted(s['b'] for s in TL['tl'])


def ts(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}".replace(',1000', ',999')


cues = []
cur = []
for i, (w, t) in enumerate(out):
    nxt = out[i + 1][1] if i + 1 < len(out) else t + 1.5
    cur.append((w, t))
    text = ' '.join(x[0] for x in cur)
    gap = nxt - t
    if len(text) > 34 or re.search(r'[.?!]$', w) or gap > 0.8 or (cur and t - cur[0][1] > 3.2):
        end = min(nxt - 0.02, t + 1.2)
        cues.append((cur[0][1], max(end, cur[0][1] + 0.6), text))
        cur = []
if cur:
    cues.append((cur[0][1], cur[-1][1] + 1.0, ' '.join(x[0] for x in cur)))
with open(H + '/out/SILASTEC-IA-no-cinema-15min.pt-BR.srt', 'w') as f:
    for k, (a, b, tx) in enumerate(cues, 1):
        f.write(f"{k}\n{ts(a)} --> {ts(b)}\n{tx}\n\n")
print('cues', len(cues))
