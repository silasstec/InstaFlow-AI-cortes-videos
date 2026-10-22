"""yt15 base video + audio assembly (Higgsfield sandbox, 1 core).
steps: segs [n0 n1] | special | cat | music | audio | v <k> | mux <out>
"""
import json, os, subprocess, sys
import numpy as np

H = '/home/user/yt15'
B = H + '/build'
O = H + '/out'
os.makedirs(O + '/seg', exist_ok=True)
E = json.load(open(B + '/edl15.json'))
F = lambda s: round(s * 30)
TOT = E['total']
NF = F(TOT)
PICK = json.load(open(H + '/drv/pick.json')) if os.path.exists(H + '/drv/pick.json') else {}
PIPC = json.load(open(B + '/pipcrop.json')) if os.path.exists(B + '/pipcrop.json') else {'x': 280, 'y': 0, 's': 720}
BRS = {'pf:ih3': ('/home/user/yt10/pf/ih3.mp4', 8.0, False), 'pf:sintra': ('/home/user/yt10/pf/sintra.mp4', 4.0, True)}
ENC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '30', '-g', '60', '-an']


def run(c):
    r = subprocess.run(c, capture_output=True, text=True)
    if r.returncode:
        print('ERR', ' '.join(c)[:400], r.stderr[-1500:])
        sys.exit(1)
    return r


def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout.strip())


def brsrc(src):
    if src in BRS:
        return BRS[src]
    for d in (H + '/broll', '/home/user/yt10/broll'):
        p = f'{d}/{src}.mp4'
        if os.path.exists(p):
            return (p, 0.0, False)
    raise SystemExit('missing broll ' + src)


def broll_chain(idx, src, D):
    """filter chain for input idx producing exactly D seconds at 1920x1080/30"""
    p, ss, vert = brsrc(src)
    L = dur(p) - ss
    s = min(max(D / L, 1.0), 1.5)
    if vert:
        base = f"[{idx}:v]trim=start={ss},setpts=PTS-STARTPTS,split[vb{idx}][vf{idx}];[vb{idx}]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=30:3,eq=brightness=-0.12[vbb{idx}];[vf{idx}]scale=-2:1080:flags=lanczos[vff{idx}];[vbb{idx}][vff{idx}]overlay=(W-w)/2:0,setsar=1"
    else:
        base = f"[{idx}:v]trim=start={ss},setpts=PTS-STARTPTS,scale=1920:1080:flags=lanczos:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1"
    ch = base + f",setpts={s:.4f}*PTS,fps=30"
    if L * s < D - 0.05:
        ch += f",split[fw{idx}][rv{idx}];[rv{idx}]reverse[rr{idx}];[fw{idx}][rr{idx}]concat=n=2:v=1:a=0"
    ch += f",trim=duration={D:.4f},setpts=PTS-STARTPTS[b{idx}]"
    return ch


def seg(p):
    n = p['n']
    out = f"{O}/seg/v{n:03d}.mp4"
    if os.path.exists(out):
        return
    a, b = p['a'], p['b']
    N = F(b) - F(a)
    drv = PICK.get(str(n), f'{H}/drv/d{n:03d}.mp4')
    D = N / 30
    ins = ['-i', drv]
    fc = f"[0:v]scale=1920:1080:flags=lanczos,fps=30,tpad=stop_mode=clone:stop_duration=3,trim=duration={D:.4f},setpts=PTS-STARTPTS,unsharp=5:5:0.4[v0]"
    last = '[v0]'
    k = 1
    for br in E['broll']:
        if br['t0'] >= b - 0.01 or br['t1'] <= a + 0.01:
            continue
        t0 = max(a, br['t0']) - a
        t1 = min(b, br['t1']) - a
        bp, _, _ = brsrc(br['src'])
        ins += ['-i', bp]
        fc += ';' + broll_chain(k, br['src'], t1 - t0)
        fc += f";[b{k}]tpad=start_duration={t0:.4f}:color=black[bd{k}];{last}[bd{k}]overlay=0:0:enable='between(t,{t0:.4f},{t1 - 0.001:.4f})':eof_action=pass[v{k}]"
        last = f'[v{k}]'
        k += 1
    run(['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', fc, '-map', last, '-frames:v', str(N)] + ENC + [out])


def special():
    sp = {'sting': E['sting'], 'tut': E['tut'], 'end': E['end']}
    # sting: black
    s = sp['sting']; N = F(s['b']) - F(s['a'])
    o = f"{O}/seg/sting.mp4"
    if not os.path.exists(o):
        run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0x0a0a0b:s=1920x1080:r=30', '-frames:v', str(N)] + ENC + [o])
    # tutorial with square PiP of cam B drives at bottom-left (frame drawn by the overlay)
    t = sp['tut']; N = F(t['b']) - F(t['a'])
    o = f"{O}/seg/tut.mp4"
    if not os.path.exists(o):
        pip = json.load(open(H + '/pip/pip_segs.json'))
        lst = O + '/pip_list.txt'
        with open(lst, 'w') as f:
            for x in pip:
                f.write(f"file '{H}/pip/v{x['n']:03d}.mp4'\ninpoint 0\noutpoint {x['dur']:.3f}\n")
        c = PIPC
        run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-vf', f"fps=30,crop={c['s']}:{c['s']}:{c['x']}:{c['y']},scale=320:320:flags=lanczos,format=yuv420p", '-an', '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast', O + '/pip_sq.mp4'])
        P = 320; R = 18
        mask = f"format=yuva420p,geq=lum='p(X,Y)':cb='p(X,Y)':cr='p(X,Y)':a='if(gt(abs(X-{P}/2+0.5),{P}/2-{R})*gt(abs(Y-{P}/2+0.5),{P}/2-{R}),if(lte(hypot(abs(X-{P}/2+0.5)-({P}/2-{R}),abs(Y-{P}/2+0.5)-({P}/2-{R})),{R}),255,0),255)'"
        fc = f"[0:v]fps=30,scale=1920:1080[t];[1:v]{mask}[p];[t][p]overlay=48:712:eof_action=pass,tpad=stop_mode=clone:stop_duration=2[v]"
        run(['ffmpeg', '-v', 'error', '-y', '-i', '/home/user/tut/tutorial_silent.mp4', '-i', O + '/pip_sq.mp4', '-filter_complex', fc, '-map', '[v]', '-frames:v', str(N)] + ENC + [o])
    # end card: idle presenter inside the 800x450 box at (120,300)
    e = sp['end']; N = F(e['b']) - F(e['a'])
    o = f"{O}/seg/end.mp4"
    if not os.path.exists(o):
        idle = H + '/drv/idle.mp4'
        fc = "[1:v]fps=30,scale=800:450:flags=lanczos,split[i1][i2];[i2]reverse[ir];[i1][ir]concat=n=2:v=1:a=0,loop=loop=2:size=600[il];[0:v][il]overlay=120:300:shortest=0:eof_action=repeat[v]"
        run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0x0a0a0b:s=1920x1080:r=30', '-i', idle, '-filter_complex', fc, '-map', '[v]', '-frames:v', str(N)] + ENC + [o])


def order():
    seq = []
    for x in E['pres']:
        seq.append((x['a'], f"{O}/seg/v{x['n']:03d}.mp4", F(x['b']) - F(x['a'])))
    for k in ('sting', 'tut', 'end'):
        seq.append((E[k]['a'], f"{O}/seg/{k}.mp4", F(E[k]['b']) - F(E[k]['a'])))
    return sorted(seq)


def cat():
    seq = order()
    tot = 0
    with open(O + '/full.txt', 'w') as f:
        for a, p, n in seq:
            if not os.path.exists(p):
                raise SystemExit('missing ' + p)
            f.write(f"file '{p}'\n")
            tot += n
    print('frames', tot, 'expected', NF)
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', O + '/full.txt', '-c', 'copy', O + '/base_cat.mp4'])
    run(['ffmpeg', '-v', 'error', '-y', '-i', O + '/base_cat.mp4', '-c', 'copy', '-bsf:v', 'h264_mp4toannexb', '-f', 'h264', O + '/base.h264'])
    run(['ffmpeg', '-v', 'error', '-y', '-fflags', '+genpts', '-r', '30', '-i', O + '/base.h264', '-c', 'copy', O + '/base_full.mp4'])
    os.remove(O + '/base.h264'); os.remove(O + '/base_cat.mp4')
    print('base', dur(O + '/base_full.mp4'))


SR = 48000


def load(p, sr=SR):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(r, np.float32).reshape(-1, 2).astype(np.float64)


def music():
    """original ambient bed: slow minor pads + soft pulse, chapters shift the chord"""
    n = int(SR * (TOT + 1))
    t = np.arange(n) / SR
    chords = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]]  # Am F G Em
    starts = [c['t'] for c in E['chapters']] + [TOT + 1]
    out = np.zeros(n)
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    for i in range(len(starts) - 1):
        a, b = int(starts[i] * SR), int(starts[i + 1] * SR)
        seg = np.arange(b - a) / SR
        sub = np.zeros(b - a)
        bar = 8.0
        for j in range(int(len(seg) / SR / bar) + 1):
            c = chords[(i + j) % 4]
            s0, s1 = int(j * bar * SR), min(len(seg), int((j + 1) * bar * SR) + SR)
            if s0 >= len(seg):
                break
            tt = seg[s0:s1] - seg[s0]
            env = np.minimum(1, tt / 1.5) * np.minimum(1, np.maximum(0, (tt[-1] - tt) / 1.5 + 0.0))
            tone = sum(np.sin(2 * np.pi * hz(m) * tt + k) + 0.5 * np.sin(2 * np.pi * hz(m) * 1.003 * tt) for k, m in enumerate(c))
            tone += 0.6 * np.sin(2 * np.pi * hz(c[0] - 24) * tt)
            sub[s0:s1] += tone * env
        out[a:b] += sub
    # soft 4/4 pulse at 96 bpm (kick-like thump), very low
    beat = 60 / 96
    k = np.arange(int(0.25 * SR)) / SR
    kick = np.sin(2 * np.pi * (50 + 60 * np.exp(-k * 30)) * k) * np.exp(-k * 14)
    for bt in np.arange(0, TOT, beat):
        i = int(bt * SR)
        out[i:i + len(kick)] += 0.9 * kick[:max(0, n - i)]
    out /= np.max(np.abs(out)) + 1e-9
    # gentle low-pass via moving average
    w = 9
    out = np.convolve(out, np.ones(w) / w, mode='same')
    st = np.stack([out, np.roll(out, 240)], 1) * 0.5
    write_wav(O + '/music.wav', st)


def write_wav(p, x):
    x = np.clip(x, -1, 1)
    run_in = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', p], input=x.astype(np.float32).tobytes(), capture_output=True)
    if run_in.returncode:
        print(run_in.stderr.decode()[-800:]); sys.exit(1)


def audio():
    n = int(SR * TOT)
    voice = np.zeros((n + SR * 2, 2))
    for x in E['pres']:
        v = load(f"{H}/seg/s{x['n']:03d}.mp3")
        i = int(round(x['a'] * SR)); L = min(len(v), int((x['b'] - x['a']) * SR) + int(0.05 * SR))
        voice[i:i + L] += v[:L]
    tv = load('/home/user/tut/tutorial_final.mp4')
    i = int(round(E['tut']['a'] * SR)); L = min(len(tv), int((E['tut']['b'] - E['tut']['a']) * SR))
    voice[i:i + L] += tv[:L]
    voice = voice[:n]
    sfx = np.zeros((n + SR * 4, 2))
    cache = {}
    for t, f, g in E['sfx']:
        if f not in cache:
            cache[f] = load('/home/user/yt10/sfx/' + f)
        y = cache[f] * 10 ** (g / 20)
        i = max(0, int(t * SR))
        sfx[i:i + len(y)] += y[:len(sfx) - i]
    sfx = sfx[:n]
    mu = load(O + '/music.wav')[:n]
    if len(mu) < n:
        mu = np.pad(mu, ((0, n - len(mu)), (0, 0)))
    # ducking envelope from voice RMS (20 ms), music at -30 dB under speech, -22 dB in gaps
    hop = int(0.02 * SR)
    m = np.sqrt(np.convolve((voice[:, 0] ** 2), np.ones(hop) / hop, mode='same'))
    speech = (m > 0.01).astype(float)
    a = np.exp(-1 / (0.15 * SR)); r = np.exp(-1 / (0.6 * SR))
    env = np.zeros(n); e = 0.0
    sp = speech[::hop]
    envs = np.zeros(len(sp)); e = 0
    for i, s in enumerate(sp):
        c = a ** hop if s > e else r ** hop
        e = c * e + (1 - c) * s
        envs[i] = e
    env = np.repeat(envs, hop)[:n]
    g = 10 ** ((-22 - 8 * env) / 20)
    # bed off during the tutorial core and gentle during sting/end
    ta, tb = int(E['tut']['a'] * SR), int(E['tut']['b'] * SR)
    g[ta:tb] *= 0.55
    mix = voice + sfx + mu * g[:, None]
    write_wav(O + '/mix_raw.wav', mix * 0.8)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', O + '/mix_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    af = f"loudnorm=I=-14:TP=-1.2:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    run(['ffmpeg', '-v', 'error', '-y', '-i', O + '/mix_raw.wav', '-af', af, '-ar', '48000', '-c:a', 'pcm_s16le', O + '/mix_final.wav'])
    print('audio ok', j['input_i'])


def vchunk(k):
    CH = 3600
    f0 = k * CH; f1 = min(NF, (k + 1) * CH)
    if f0 >= NF:
        print('none'); return
    t0 = f0 / 30
    ov = f'{O}/ov/ov_{k}.webm'
    ins = ['-ss', f'{t0:.4f}', '-i', O + '/base_full.mp4', '-c:v', 'libvpx-vp9', '-i', ov]
    fc = "[0:v][1:v]overlay=0:0:eof_action=pass:format=auto,format=yuv420p[v]"
    run(['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', fc, '-map', '[v]', '-frames:v', str(f1 - f0), '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', '30', '-an', f'{O}/vchunk_{k:02d}.mp4'])
    print('chunk', k, 'ok')


def mux(out):
    ch = sorted(x for x in os.listdir(O) if x.startswith('vchunk_'))
    with open(O + '/vch.txt', 'w') as f:
        for x in ch:
            f.write(f"file '{O}/{x}'\n")
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', O + '/vch.txt', '-i', O + '/mix_final.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out])
    print('mux ok', dur(out))


if __name__ == '__main__':
    st = sys.argv[1]
    if st == 'segs':
        lo = int(sys.argv[2]) if len(sys.argv) > 2 else 0
        hi = int(sys.argv[3]) if len(sys.argv) > 3 else 999
        for p in E['pres']:
            if lo <= p['n'] <= hi:
                seg(p); print('seg', p['n'], flush=True)
    elif st == 'special':
        special(); print('special ok')
    elif st == 'cat':
        cat()
    elif st == 'music':
        music(); print('music ok')
    elif st == 'audio':
        audio()
    elif st == 'v':
        vchunk(int(sys.argv[2]))
    elif st == 'mux':
        mux(sys.argv[2])
