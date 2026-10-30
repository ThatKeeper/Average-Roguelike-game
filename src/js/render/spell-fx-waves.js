/* ======================================================================
 * src/js/render/spell-fx-waves.js
 * Renderizadores de las ondas: novas (9 motivos) y conos (7 motivos). El frente de la onda coincide con la
 * zona de daño real (casting.js, spWave): el enemigo recibe el golpe cuando el frente le alcanza.
 *
 * Define:
 * SXRB, SNV, SCN, drawSpellWave
 * ====================================================================== */

const SXRB = ["#ff6a6a", "#ffb04a", "#ffe45c", "#6fe66f", "#5cc8ff", "#6a7fff", "#b070ff"];
// c = { px, py, a, u, k (0..1 de expansión), rr (radio actual), R (radio final), fade, p, sh, key }
const SNV = {
  sun(c) {
    const { px, py, u, rr, R } = c,
      [d1, m1, b1, c1] = c.p,
      sy = py - 40,
      sr = Math.min(6, Math.round(u * 16) + 1);
    for (let k = 0; k < 12; k++) {
      const ag = k * 0.5236 + u * 1.5,
        l = sr + 3 + (k % 2 ? 3 : 6);
      for (let s = sr + 1; s < l; s++) sxR(px + Math.cos(ag) * s * 3, sy + Math.sin(ag) * s * 3, 1, 1, k % 2 ? m1 : b1);
    }
    sxD(px, sy, sr, m1);
    sxD(px, sy, Math.max(1, sr - 2), b1);
    sxD(px, sy, Math.max(1, sr - 4), c1);
    sxA(c.fade * 0.18);
    sxD(px, py, Math.round(rr / 3), m1);
    sxA(c.fade);
    sxRing(px, py, rr, b1, 2);
    sxRing(px, py, Math.max(0, rr - 6), m1, 1);
    for (let k = 0; k < 10; k++) {
      const ag = k * 0.628 + u * 0.6;
      sxL(px, py, px + Math.cos(ag) * rr * 0.92, py + Math.sin(ag) * rr * 0.92, k % 2 ? c1 : b1, 1);
    }
  },
  wisps(c) {
    const { px, py, u, rr } = c,
      [d1, m1, b1, c1] = c.p;
    for (let i = 0; i < 8; i++) {
      const ag = i * 0.785 + u * 3,
        r = Math.max(10, rr * 0.92),
        wx = px + Math.cos(ag) * r,
        wy = py + Math.sin(ag) * r + Math.sin(u * 8 + i) * 3;
      for (let j = 4; j >= 1; j--) sxR(px + Math.cos(ag - j * 0.12) * r, py + Math.sin(ag - j * 0.12) * r, 1, 1, j < 2 ? b1 : j < 3 ? m1 : d1);
      sxR(wx - 1, wy - 27, 1, 3, b1);
      sxR(wx - 3, wy - 18, 3, 3, m1);
      sxR(wx - 6, wy - 9, 5, 3, m1);
      sxR(wx - 9, wy - 3, 7, 3, d1);
      sxR(wx - 6, wy - 3, 2, 2, c1);
      sxR(wx + 3, wy - 3, 2, 2, c1);
      sxR(wx - 3, wy + 6, 3, 1, d1);
    }
    sxRing(px, py, rr, m1, 1);
  },
  prism(c) {
    const { px, py, u, rr } = c,
      [d1, m1, b1, c1] = c.p,
      cy = py - 42;
    for (let y = 0; y < 9; y++) {
      const w = Math.round(y * 0.7);
      sxR(px - w * 3, cy - 12 + y * 3, w * 2 + 1, 1, y < 2 ? c1 : m1);
      sxR(px - w * 3, cy - 12 + y * 3, 1, 1, b1);
    }
    for (let k = 0; k < 7; k++) {
      const ag = k * 0.9 + Math.sin(u * 2) * 0.08;
      sxA(c.fade * 0.65);
      sxL(px, cy + 6, px + Math.cos(ag) * rr, py + Math.sin(ag) * rr * 0.9, SXRB[k], 1);
      sxA(c.fade);
      if (rr - k * 7 > 4) sxRing(px, py, rr - k * 7, SXRB[k], 1);
    }
  },
  shock(c) {
    const { px, py, u, k, R } = c,
      [d1, m1, b1, c1] = c.p;
    for (let j = 0; j < 3; j++) {
      const kk = k * 1.3 - j * 0.22;
      if (kk <= 0 || kk >= 1.05) continue;
      const r = Math.min(1, kk) * R;
      sxA(c.fade * (1 - Math.max(0, kk - 0.7) * 3));
      sxRing(px, py, r, kk < 0.5 ? b1 : m1, 2);
      sxRing(px, py, Math.max(0, r - 5), d1, 1);
    }
    sxA(c.fade);
    for (let i = 0; i < 16 * sxQ(); i++) {
      const ag = i * 0.39 + 0.2,
        r0 = (k * 70 + sxH(i) * 14) % R;
      for (let s = 0; s < 6; s++) sxR(px + Math.cos(ag) * (r0 + s * 2), py + Math.sin(ag) * (r0 + s * 2), 1, 1, s < 3 ? b1 : m1);
    }
    if (c.key == "wind+dark") for (let i = 0; i < 8; i++) sxS(px + Math.cos(i * 0.785 + u * 4) * R * 0.5 * k, py + Math.sin(i * 0.785 + u * 4) * R * 0.5 * k, c1, 0);
    else for (let i = 0; i < 8; i++) sxS(px + Math.cos(i * 0.785) * R * 0.7 * k, py + Math.sin(i * 0.785) * R * 0.7 * k, c1, 1);
  },
  crystals(c) {
    const { px, py, u, rr, R } = c,
      [d1, m1, b1, c1] = c.p;
    for (let ring = 0; ring < 3; ring++) {
      const r = (R * (ring + 1)) / 3.2;
      if (rr < r) continue;
      const gr = Math.min(1, (rr - r) / 14 + 0.2),
        n = 8 + ring * 4;
      for (let i = 0; i < n; i++) {
        const an = (i / n) * 6.2832 + ring * 0.4,
          cx = px + Math.cos(an) * r,
          cy = py + Math.sin(an) * r,
          H = Math.round((7 + ring * 2 + (i % 2) * 3) * gr);
        for (let h = 0; h < H; h++) {
          const w = Math.max(1, 3 - Math.floor((h * 3) / H));
          sxR(cx - Math.floor(w / 2) * 3, cy - h * 3, w, 1, h < H * 0.4 ? m1 : h == H - 1 ? c1 : b1);
        }
        if ((i + Math.floor(u * 8)) % 5 == 0) sxS(cx, cy - H * 3 - 6, c1, 1);
      }
    }
    sxRing(px, py, rr, b1, 1);
  },
  bloom(c) {
    const { px, py, u, k, rr, R } = c,
      [d1, m1, b1, c1] = c.p,
      op = Math.min(1, k * 1.6),
      n = c.key == "dark+plant" ? 6 : 12; // flor nocturna: 6 pétalos largos con estrellas; loto: 12 pétalos
    for (let i = 0; i < n; i++) {
      const ag = (i / n) * 6.2832 + u * 0.5,
        L = (R * 0.62 * op) / 3;
      for (let s = 1; s <= L; s++) {
        const rad = Math.max(1, Math.round((s / L) * 3 + 0.5) * (s < L ? 1 : 1));
        sxD(px + Math.cos(ag) * s * 3, py + Math.sin(ag) * s * 3, s > L * 0.35 ? 2 : 1, s % 2 ? b1 : m1);
      }
      sxD(px + Math.cos(ag) * L * 3, py + Math.sin(ag) * L * 3, 1, c1);
    }
    if (c.key != "dark+plant")
      for (let i = 0; i < 12; i++) {
        const ag = ((i + 0.5) / 12) * 6.2832 - u * 0.4,
          L2 = (R * 0.36 * op) / 3;
        for (let s = 1; s <= L2; s++) sxD(px + Math.cos(ag) * s * 3, py + Math.sin(ag) * s * 3, 1, s % 2 ? c1 : b1);
      }
    sxD(px, py, 3, d1);
    sxD(px, py, 2, c1);
    for (let i = 0; i < 18 * sxQ(); i++) {
      const t = (u * 0.9 + sxH(i)) % 1,
        r = t * rr,
        an = i * 0.35 + sxH(i + 2) * 2;
      sxS(px + Math.cos(an) * r, py + Math.sin(an) * r - t * 14, i % 2 ? c1 : b1, c.sh);
    }
    sxRing(px, py, rr, m1, 1);
  },
  pull(c) {
    const { px, py, u, k, R } = c,
      [d1, m1, b1, c1] = c.p,
      tight = 1 - k * 0.45;
    for (let j = 0; j < 3; j++)
      for (let s = 6; s < R * tight; s += 3) {
        const an = j * 2.094 + s * 0.05 - u * 9,
          r = s;
        sxR(px + Math.cos(an) * r, py + Math.sin(an) * r, s < R * 0.5 ? 2 : 1, s < R * 0.5 ? 2 : 1, s < R * 0.3 ? c1 : s < R * 0.6 ? b1 : m1);
      }
    for (let i = 0; i < 14 * sxQ(); i++) {
      const t = (u * 1.3 + sxH(i)) % 1,
        r = R * (1 - t),
        an = i * 0.9 + t * 5;
      sxR(px + Math.cos(an) * r, py + Math.sin(an) * r, 1, 1, i % 2 ? b1 : c1);
    }
    sxD(px, py, Math.round(3 + Math.sin(Math.min(1, k * 1.6) * 3.14) * 4), "#05020f");
    sxD(px, py, 2, d1);
    sxA(c.fade * 0.5);
    sxRing(px, py, R * (1 - k * 0.2), m1, 1);
  },
  quake(c) {
    const { px, py, u, rr, R } = c,
      [d1, m1, b1, c1] = c.p;
    for (let j = 0; j < 8; j++) {
      const ag = j * 0.785 + 0.3;
      for (let s = 6; s < rr; s += 3) {
        const jx = (sxH(j * 9 + s) - 0.5) * 6;
        sxR(px + Math.cos(ag) * s - Math.sin(ag) * jx, py + Math.sin(ag) * s + Math.cos(ag) * jx, 1, 1, d1);
        if (s % 12 == 0) sxR(px + Math.cos(ag) * s - Math.sin(ag) * jx, py + Math.sin(ag) * s + Math.cos(ag) * jx, 1, 1, m1);
      }
    }
    for (let i = 0; i < 8; i++) {
      const ag = i * 0.785 + 0.3,
        d = R * (0.3 + (i % 3) * 0.27),
        kk = (u - 0.12 - i * 0.05) / 0.5;
      if (kk <= 0 || kk >= 1) continue;
      const H = Math.round(Math.sin(kk * 3.14) * 16),
        gx = px + Math.cos(ag) * d,
        gy = py + Math.sin(ag) * d;
      for (let h = 0; h < H; h++) sxR(gx, gy - h * 3, h > H - 3 ? 1 : 2, 1, h > H - 2 ? b1 : m1);
      sxS(gx - 6, gy - H * 3 - 6, c1, 0);
      sxS(gx + 6, gy - H * 3 - 3, b1, 0);
    }
    sxRing(px, py, rr, b1, 2);
  },
  heart(c) {
    const { px, py, u, rr } = c,
      [d1, m1, b1, c1] = c.p,
      beat = u < 0.2 || (u > 0.5 && u < 0.7),
      cs = beat ? 3 : 2,
      hx = Math.round(px - (7 * cs * 3) / 2),
      hy = py - 62;
    ["..XX.XX..", ".XXXXXXX.", ".XXXXXXX.", "..XXXXX..", "...XXX...", "....X...."].forEach((r, j) => {
      for (let i = 0; i < 9; i++) if (r[i] == "X") sxR(hx + i * cs * 3 * 0.78, hy + j * cs * 3 * 0.9, cs * 0.78 < 2 ? 1 : cs - 1, cs - 1, j < 1 ? b1 : j < 4 ? m1 : d1);
    });
    sxR(hx + 6, hy + 4, 1, 1, c1);
    for (let q = 0; q < 70; q++) {
      const an = (q / 70) * 6.2832,
        x0 = px + Math.cos(an) * rr,
        y0 = py + Math.sin(an) * rr;
      sxR(x0, y0, 1, 1, b1);
      sxR(x0 - Math.cos(an) * 3, y0 - Math.sin(an) * 3, 1, 1, m1);
      if (q % 9 == 0) sxS(x0, y0 - 9 - sxH(q) * 12, c1, 0);
    }
    for (let i = 0; i < 6; i++) sxR(px + Math.cos(i * 1.05 + u * 4) * 8, py + Math.sin(i * 1.05 + u * 4) * 8 - 22 + u * 18, 1, 1, c1);
  },
};

// Conos: origen (px,py), eje a, semiángulo 0.65 rad; lx = distancia a lo largo del eje, ly = lateral
const scnW = (c, lx, ly) => [c.px + Math.cos(c.a) * lx - Math.sin(c.a) * ly, c.py + Math.sin(c.a) * lx + Math.cos(c.a) * ly];
const SCN = {
  dual(c) {
    const { rr, u } = c,
      st = sxQ() < 1 ? 9 : 6;
    for (let gx = 18; gx < rr; gx += st) {
      const hw = gx * 0.76;
      for (let ly = -hw; ly <= hw; ly += st) {
        const n = sxH(gx * 7.3 + ly * 3.1 + Math.floor(u * 12) * 5.7),
          thr = (gx / c.R) * 0.5 + (Math.abs(ly) / (hw + 1)) * 0.35;
        if (n <= thr) continue;
        const v = n - thr,
          up = ly < 0,
          [wx, wy] = scnW(c, gx, ly);
        sxR(wx, wy, 2, 2, v > 0.5 ? (up ? "#ffb23a" : "#e8fbff") : v > 0.3 ? (up ? "#ff6a13" : "#5cc8ff") : up ? "#7a1d0c" : "#1f4e8c");
      }
    }
    for (let i = 0; i < 10; i++) {
      const t = (u * 1.1 + sxH(i)) % 1,
        [wx, wy] = scnW(c, t * rr, (sxH(i + 2) - 0.5) * 8 - t * 6);
      sxS(wx, wy, "#ffffff", 0);
    }
  },
  melt(c) {
    const { rr, u } = c,
      [d1, m1, b1, c1] = c.p,
      n = Math.round(46 * sxQ());
    for (let j = 0; j < 8; j++) {
      const d = c.R * (0.25 + sxH(j) * 0.7);
      if (rr < d) continue;
      const [wx, wy] = scnW(c, d, (sxH(j + 5) - 0.5) * d * 1.1);
      sxA(c.fade * 0.8);
      sxE(wx, wy + 2, 4, 2, d1);
      sxE(wx, wy + 2, 3, 1, m1);
      sxR(wx - 3 + ((u * 8 + j * 3) % 6), wy, 1, 1, b1);
      sxA(c.fade);
    }
    for (let i = 0; i < n; i++) {
      const t = (u * 1.1 + sxH(i)) % 1,
        d = t * rr,
        [wx, wy] = scnW(c, d, (sxH(i + 4) - 0.5) * 2 * d * 0.7);
      sxD(wx, wy - Math.sin(t * 3.14) * 16, i % 4 ? 2 : 3, i % 3 ? m1 : b1);
      sxD(wx, wy - Math.sin(t * 3.14) * 16, 1, c1);
      if (i % 5 == 0) sxS(wx + 3, wy - 22 - Math.sin(u * 8 + i) * 3, c1, 0);
    }
  },
  sand(c) {
    const { rr, u } = c,
      [d1, m1, b1, c1] = c.p,
      n = Math.round(200 * sxQ()),
      snow = c.key == "ice+wind";
    for (let i = 0; i < n; i++) {
      const t = (u * 1.5 + sxH(i)) % 1,
        d = t * rr,
        [wx, wy] = scnW(c, d, (sxH(i + 4) - 0.5) * 2 * d * 0.72 + (i % 5 == 0 ? Math.sin(u * 8 + i) * 6 : 0));
      sxR(wx, wy, i % 3 ? 1 : 3, i % 5 ? 1 : 2, i % 4 ? m1 : b1);
      if (snow && i % 3 == 0) sxS(wx, wy, c1, 0);
    }
    for (let i = 0; i < 7; i++) {
      const t = (u * 0.9 + i / 7) % 1,
        d = t * rr,
        [wx, wy] = scnW(c, d, (sxH(i + 30) - 0.5) * 2 * d * 0.6 + Math.sin(u * 9 + i) * 8);
      sxR(wx, wy, 3, 3, d1);
      sxR(wx, wy, 3, 1, b1);
      sxR(wx + 3, wy + 3, 1, 1, m1);
      if (snow) sxS(wx + 9, wy - 6, c1, 1);
    }
  },
  spikes(c) {
    const { u } = c,
      [d1, m1, b1, c1] = c.p;
    for (let j = -1; j <= 1; j++) {
      const an = c.a + j * 0.5;
      for (let i = 0; i < 9; i++) {
        const t0 = 0.05 + i * 0.045 + (j ? 0.03 : 0),
          f = Math.min(1, Math.max(0, (u - t0) / 0.14)) * (u - t0 > 0.6 ? Math.max(0, 1 - (u - t0 - 0.6) / 0.25) : 1);
        if (f <= 0) continue;
        const d = 22 + i * (c.R / 9.6),
          bx = c.px + Math.cos(an) * d,
          by = c.py + Math.sin(an) * d,
          H = Math.round((6 + (i % 2) * 3 + i * 0.6) * f);
        sxA(c.fade * 0.5);
        sxE(bx, by + 2, 3, 1, d1);
        sxA(c.fade);
        for (let h = 0; h < H; h++) {
          const w = Math.max(1, 3 - Math.floor((h * 3) / H));
          sxR(bx - Math.floor(w / 2) * 3, by - h * 3, w, 1, h < H * 0.35 ? c1 : h == H - 1 ? b1 : m1);
        }
        if (f < 1) sxS(bx - 9, by - 6, b1, 0);
      }
    }
  },
  rays(c) {
    const { u, rr } = c,
      [d1, m1, b1, c1] = c.p;
    for (let k = 0; k < 5; k++) {
      const an = c.a + (k - 2) * 0.26,
        wd = 1 + Math.round((1 + Math.sin(u * 8 + k * 1.7)) * 0.8),
        ex = c.px + Math.cos(an) * rr,
        ey = c.py + Math.sin(an) * rr;
      sxA(c.fade * 0.4);
      sxBeam(c.px, c.py, ex, ey, wd, m1);
      sxA(c.fade);
      sxBeam(c.px, c.py, ex, ey, Math.max(0, wd - 1), b1);
      sxBeam(c.px, c.py, ex, ey, 0, c1);
    }
    for (let i = 0; i < 10; i++) {
      const t = (u * 1.2 + sxH(i)) % 1,
        [wx, wy] = scnW(c, t * rr * 0.95, (sxH(i + 4) - 0.5) * 2 * t * rr * 0.4);
      sxS(wx, wy, c1, 0);
    }
    for (let i = 0; i < 5; i++) {
      const t = 1 - ((u * 1.6 + i * 0.2) % 1),
        [wx, wy] = scnW(c, t * 90, (i - 2) * 6 * t);
      sxR(wx, wy, 1, 1, "#ff9ab0");
    }
  },
  swarm(c) {
    const { u, rr } = c,
      [d1, m1, b1, c1] = c.p,
      n = Math.round(30 * sxQ());
    for (let i = 0; i < n; i++) {
      const t = (u * 1.2 + sxH(i)) % 1,
        d = t * rr;
      if (d < 14) continue;
      const [wx, wy] = scnW(c, d, (sxH(i + 4) - 0.5) * 2 * d * 0.7 + Math.sin(u * 9 + i) * 5),
        f = Math.floor(u * 14 + i) % 2;
      sxR(wx - 12, wy - f * 6, 4, 1, m1);
      sxR(wx + 3, wy - f * 6, 4, 1, m1);
      sxR(wx - 6, wy - f * 3, 2, 1, m1);
      sxR(wx + 3, wy - f * 3, 2, 1, m1);
      sxR(wx - 1, wy - 3, 2, 3, d1);
      sxR(wx - 3, wy - 3, 1, 1, c1);
      sxR(wx + 3, wy - 3, 1, 1, c1);
      if (i % 4 == 0) sxR(wx, wy + 9 + ((u * 20 + i * 3) % 8), 1, 1, c1);
    }
  },
  gale(c) {
    const { u, rr } = c,
      [d1, m1, b1, c1] = c.p,
      n = Math.round(80 * sxQ());
    for (let i = 0; i < 6; i++) {
      const o = (i - 2.5) * 0.26;
      for (let s = 12; s < rr; s += 3) {
        const [wx, wy] = scnW(c, s, Math.sin(s * 0.05 - u * 8 + i) * 8 + Math.tan(o) * s * 0.9);
        if ((s + i * 5 + Math.floor(u * 20)) % 9 < 4) sxR(wx, wy, 1, 1, c1);
      }
    }
    for (let i = 0; i < n; i++) {
      const t = (u * 1.4 + sxH(i)) % 1,
        d = t * rr,
        [wx, wy] = scnW(c, d, (sxH(i + 4) - 0.5) * 2 * d * 0.74);
      sxL(wx, wy - 6, wx - 2, wy + 6, i % 3 ? b1 : m1, 1);
    }
    for (let i = 0; i < 12; i++) {
      const t = (u * 1.1 + sxH(i + 40)) % 1,
        [wx, wy] = scnW(c, t * rr, (sxH(i + 44) - 0.5) * 2 * t * rr * 0.6);
      sxR(wx, wy + t * 10, 1, 1, d1);
    }
  },
};

function drawSpellWave(z) {
  if (z.u < 0) return;
  const art = SPA[z.key],
    g = sxC(),
    k = Math.min(1, z.u / z.T),
    c = {
      px: z.x,
      py: z.y,
      a: z.a,
      u: z.u,
      k,
      R: z.r,
      rr: Math.max(4, z.r * (1 - (1 - k) * (1 - k))),
      fade: z.u < z.T ? 1 : Math.max(0, 1 - (z.u - z.T) / 0.55),
      p: art.p,
      sh: art.sh,
      key: z.key,
    },
    fn = (z.f == "cone" ? SCN : SNV)[art.v];
  if (!fn) return;
  g.save();
  g.globalAlpha = c.fade;
  fn(c);
  g.restore();
}
