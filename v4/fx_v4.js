// v4 hit-reactive layers for the Katana canvas engine. KT (hit tables) is prepended by mv4_build.py.
(function () {
  const U = RRC.util;
  const TAU = Math.PI * 2;
  let TMP = null, TA = null, TB = null;
  function sized(x) {
    const w = x.canvas.width, h = x.canvas.height;
    if (!TMP || TMP.width !== w || TMP.height !== h) { TMP = U.mk(w, h); TA = U.mk(w, h); TB = U.mk(w, h); }
  }
  function grab(x) { sized(x); U.copyFull(TMP.x, x.canvas, "copy"); return TMP; }
  // events [t, s] with 0 <= t_now - t < win  ->  [age, strength, t]
  function near(list, t, win) {
    const out = [];
    for (const it of list) { const d = t - it[0]; if (d >= -0.001 && d < win) out.push([Math.max(0, d), it[1] === undefined ? 1 : it[1], it[0]]); }
    return out;
  }
  function nearT(list, t, win) { const out = []; for (const v of list) { const d = t - v; if (d >= -0.001 && d < win) out.push([Math.max(0, d), 1, v]); } return out; }
  function center(S, p) {
    if (p && p.pos) return [p.pos[0] * S.W, p.pos[1] * S.H];
    if (S.fo && S.fo.ok && S.fo.x > 0 && S.fo.y > 0) return [S.fo.x, S.fo.y];
    return [S.W / 2, S.H * 0.45];
  }
  const COLS = ["#ffb347", "#49d7ff", "#ffffff", "#ff3cb4"];

  // ---- kick / clap channel split with true per-hit decay (the engine's rgbsplit decays from the shot start)
  RRC.register("LAYERS", "k_clap", {
    phase: "post", order: 15,
    draw(S, p, x) {
      const hs = near(KT.claps, S.t, p.win || 0.3);
      if (!hs.length) return;
      let v = 0;
      for (const [d, s] of hs) v = Math.max(v, (p.v ?? 12) * s * Math.pow(1 - d / (p.win || 0.3), 1.5));
      v *= (p.amt ?? 1);
      if (v < 0.6) return;
      sized(x);
      const PW = x.canvas.width, PH = x.canvas.height, vv = v * U.px(1);
      for (const [c, tint] of [[TA, "#ff0000"], [TB, "#00ffff"]]) {
        const cx = c.x;
        cx.setTransform(1, 0, 0, 1, 0, 0);
        cx.globalCompositeOperation = "copy"; cx.drawImage(x.canvas, 0, 0);
        cx.globalCompositeOperation = "multiply"; cx.fillStyle = tint; cx.fillRect(0, 0, PW, PH);
        cx.globalCompositeOperation = "source-over";
      }
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
      x.globalCompositeOperation = "copy"; x.drawImage(TB, -vv, 0, PW + 2 * vv, PH);
      x.globalCompositeOperation = "lighter"; x.drawImage(TA, 0, 0, PW + 2 * vv, PH);
      x.restore();
    },
  });

  // ---- particle bursts on claps, phrase downbeats and drops (closed-form, seeded)
  RRC.register("LAYERS", "k_particles", {
    phase: "over", order: 55,
    draw(S, p, x) {
      const amt = p.amt ?? 0.8, [cx, cy] = center(S, p);
      x.save(); x.globalCompositeOperation = "lighter";
      for (const [d, s, t] of near(KT.claps, S.t, 0.55)) {
        U.particles(x, S.t, { seed: Math.round(t * 1000) % 100000, t0: t, burst: Math.round(70 * amt * (0.5 + s)), life: 0.5, lifeVar: 0.4,
          at: [cx, cy], radius: 26, angle: -Math.PI / 2, cone: TAU, speed: 760, speedVar: 0.6, gravity: 420, drag: 1.8,
          size: 4.5, sizeVar: 0.6, sizeEnd: 0.25, fadeIn: 0.02, fadeOut: 0.5, colors: COLS, shape: "spark", streak: 0.03, alpha: 0.9 * amt });
      }
      for (const [d, s, t] of nearT(KT.phrases, S.t, 0.8)) {
        U.particles(x, S.t, { seed: 7 + Math.round(t * 100), t0: t, burst: Math.round(180 * amt), life: 0.8, lifeVar: 0.35,
          at: [cx, cy], radius: 40, angle: -Math.PI / 2, cone: TAU, speed: 1050, speedVar: 0.7, gravity: 300, drag: 1.4,
          size: 5.5, sizeVar: 0.6, sizeEnd: 0.2, fadeIn: 0.02, fadeOut: 0.45, colors: COLS, shape: "spark", streak: 0.035, alpha: 0.95 * amt });
      }
      for (const [d, s, t] of nearT(KT.drops, S.t, 1.0)) {
        U.particles(x, S.t, { seed: 99 + Math.round(t * 100), t0: t, burst: Math.round((p.big ? 420 : 260) * amt), life: 1.0, lifeVar: 0.35,
          at: [S.W / 2, S.H / 2], radius: 60, angle: -Math.PI / 2, cone: TAU, speed: 1500, speedVar: 0.7, gravity: 200, drag: 1.3,
          size: 7, sizeVar: 0.6, sizeEnd: 0.15, fadeIn: 0.02, fadeOut: 0.5, colors: COLS, shape: "spark", streak: 0.04, alpha: 1.0 });
      }
      x.restore();
    },
  });

  // ---- ambient 3D dust field that moves with the camera (parallax) : the "space with particles" feel
  RRC.register("LAYERS", "k_dust", {
    phase: "over", order: 40,
    draw(S, p, x) {
      const amt = p.amt ?? 0.5;
      if (amt <= 0) return;
      const P = U.parallax(S, p.depth ?? 1.5);
      x.save(); x.globalCompositeOperation = "screen"; P.apply(x);
      U.particles(x, S.t, { seed: 4128, t0: -10, rate: 36 * amt, life: 7, lifeVar: 0.5, rect: [-120, -120, S.W + 120, S.H + 120],
        angle: 0, cone: TAU, speed: 22, speedVar: 0.8, wobble: 14, wobbleHz: 0.4, size: 5, sizeVar: 0.9, sizeEnd: 0.8,
        fadeIn: 0.25, fadeOut: 0.35, colors: ["#9fe8ff", "#ffd9a0", "#ffffff"], alpha: 0.55 * amt, max: 400 });
      // a few bigger bokeh discs in the foreground
      x.globalCompositeOperation = "lighter";
      const P2 = U.parallax(S, (p.depth ?? 1.5) * 1.8);
      x.restore(); x.save(); x.globalCompositeOperation = "lighter"; P2.apply(x);
      U.particles(x, S.t, { seed: 8256, t0: -10, rate: 3 * amt, life: 8, lifeVar: 0.5, rect: [-160, -160, S.W + 160, S.H + 160],
        angle: 0, cone: TAU, speed: 30, speedVar: 0.8, wobble: 20, wobbleHz: 0.3, size: 26, sizeVar: 0.7, sizeEnd: 1.2,
        fadeIn: 0.3, fadeOut: 0.3, colors: ["#49d7ff", "#ffb347"], alpha: 0.16 * amt, max: 40 });
      x.restore();
    },
  });

  // ---- light rays on phrase downbeats (screen), rotating slowly
  RRC.register("LAYERS", "k_rays", {
    phase: "post", order: 62,
    draw(S, p, x) {
      const d0 = p.d ?? 0.5, amt = p.amt ?? 0.8;
      let q = -1;
      if (p.at !== undefined) { const lt = S.lt - p.at; if (lt >= 0 && lt < d0) q = lt / d0; }
      else { const h = nearT(KT.phrases, S.t, d0); if (h.length) q = h[0][0] / d0; }
      if (q < 0) return;
      const [cx, cy] = center(S, p), R = Math.hypot(S.W, S.H) * 0.8, n = p.n ?? 14, step = TAU / n;
      const a = amt * Math.pow(1 - q, 1.6) * 0.65, rot = S.t * 0.35 + q * 1.2;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, "rgba(255,244,214," + a.toFixed(3) + ")"); g.addColorStop(0.45, "rgba(255,210,150," + (a * 0.5).toFixed(3) + ")"); g.addColorStop(1, "rgba(120,200,255,0)");
      x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = g;
      for (let i = 0; i < n; i++) {
        const a0 = rot + i * step, w = step * (0.22 + 0.16 * U.hash(31, i, 1));
        x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, R, a0, a0 + w); x.closePath(); x.fill();
      }
      x.restore();
    },
  });

  // ---- radial zoom blur (drops, climax)
  RRC.register("LAYERS", "k_radial", {
    phase: "post", order: 60,
    draw(S, p, x) {
      const d0 = p.d ?? 0.4, at = p.at ?? 0, lt = S.lt - at;
      if (lt < 0 || lt >= d0) return;
      const q = lt / d0, amt = p.amt ?? 1, c = grab(x), cx = S.W / 2, cy = S.H / 2, n = p.n ?? 8;
      x.save();
      for (let i = 1; i <= n; i++) {
        const s = 1 + i * 0.045 * (1 - q) * amt;
        x.globalAlpha = (0.42 * (1 - q) * amt) / Math.sqrt(i);
        x.save(); x.translate(cx, cy); x.scale(s, s); x.translate(-cx, -cy); x.drawImage(c, 0, 0, S.W, S.H); x.restore();
      }
      x.restore();
    },
  });

  // ---- kaleidoscope (mirrored wedges of the frame), blended over the plate by amt
  RRC.register("LAYERS", "k_kaleido", {
    phase: "post", order: 50,
    draw(S, p, x) {
      const n = p.n ?? 6, amt = p.amt ?? 0.5;
      if (amt <= 0) return;
      const ramp = Math.min(1, S.lt / (p.ramp ?? 0.25));
      const c = grab(x), cx = S.W / 2, cy = S.H / 2, R = Math.hypot(S.W, S.H), step = TAU / n, spin = S.t * (p.spin ?? 0.1);
      x.save(); x.globalAlpha = amt * ramp;
      for (let i = 0; i < n; i++) {
        x.save();
        x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, R, spin + i * step, spin + (i + 1) * step + 0.004); x.closePath(); x.clip();
        x.translate(cx, cy); x.rotate(spin);
        if (i % 2 === 0) x.rotate(i * step);
        else { const ph = ((i + 1) * step) / 2; x.rotate(ph); x.scale(1, -1); x.rotate(-ph); }
        x.rotate(-spin); x.translate(-cx, -cy);
        x.drawImage(c, 0, 0, S.W, S.H);
        x.restore();
      }
      x.restore();
    },
  });

  // ---- cyan ticks on the intro 8th-note hats
  RRC.register("LAYERS", "k_tick", {
    phase: "post", order: 20,
    draw(S, p, x) {
      const hs = near(KT.ticks, S.t, 0.1);
      if (!hs.length) return;
      let v = 0;
      for (const [d, s] of hs) v = Math.max(v, s * (1 - d / 0.1));
      v *= (p.amt ?? 1) * 0.22;
      if (v < 0.01) return;
      x.save(); x.globalCompositeOperation = "screen"; x.globalAlpha = v; x.fillStyle = "#49d7ff"; x.fillRect(0, 0, S.W, S.H); x.restore();
    },
  });

  // ---- hue cycling look chained after a base grade (psychedelic layer; never on face shots)
  RRC.register("LOOKS", "k_hue", async (S, src, p) => {
    const base = p.base ? await U.applyLook(S, src, p.base) : src;
    const per = (p.period ?? 4) * KT.BAR, ph = (((S.t - KT.T0) / per) % 1 + 1) % 1;
    const amp = p.amp ?? 0.5;
    const deg = amp >= 1 ? ph * 360 : Math.sin(ph * TAU) * 70 * amp;
    return U.applyLook(S, base, { type: "grade", filter: "hue-rotate(" + deg.toFixed(1) + "deg) saturate(" + (p.sat ?? 1.2) + ")" });
  });

  RRC.hook("ready", ({ R }) => R.log("v4 fx: kicks " + KT.kicks.length + " claps " + KT.claps.length + " phrases " + KT.phrases.length + " drops " + KT.drops.length));
})();
