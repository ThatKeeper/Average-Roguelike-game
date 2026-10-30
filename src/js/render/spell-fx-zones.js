/* ======================================================================
 * src/js/render/spell-fx-zones.js
 * Renderizadores de las zonas persistentes: 18 motivos de combinación, el charco de ácido y las zonas que dejan
 * los proyectiles (zarzas, agujero de sombra y nube tóxica).
 *
 * Define:
 * SZN, szPos, drawSpellZone
 * ====================================================================== */

// Posición determinista dentro del disco de la zona (i = índice, s = semilla)
const szPos = (c, i, s = 0, f = 0.82) => {
  const an = sxH(i * 3 + s) * 6.2832,
    r = Math.sqrt(sxH(i * 5 + s + 1)) * c.R * f;
  return [c.px + Math.cos(an) * r, c.py + Math.sin(an) * r * 0.92];
};
// c = { px, py, R, u, left, g (crecimiento 0..1), fade, p, sh, key }
const SZN = {
  geyser(c) {
    const [d1, m1, b1, c1] = c.p;
    for (let i = 0; i < 6; i++) {
      const ti = 0.15 + i * 0.16;
      if (c.u < ti) continue;
      const k2 = ((c.u - ti) % 0.95) / 0.95,
        H = Math.round(Math.sin(k2 * 3.14) * (16 + (i % 3) * 5)),
        [gx, gy] = szPos(c, i, 4, 0.7);
      for (let h = 0; h < H; h++) {
        sxR(gx - 3, gy - h * 3, 2, 1, m1);
        sxR(gx - 3, gy - h * 3, 1, 1, b1);
      }
      sxD(gx, gy - H * 3, 2, b1);
      for (let j = 0; j < 4; j++) {
        const q = (c.u * 2 + j * 0.25 + i * 0.1) % 1;
        sxA(c.fade * (1 - q) * 0.8);
        sxD(gx + Math.sin(j * 2 + i) * q * 18, gy - H * 3 - q * 36, 2 + Math.round(q * 2), c1);
      }
      sxA(c.fade);
      sxE(gx, gy, 3, 1, c1);
    }
  },
  wildfire(c) {
    const [d1, m1, b1, c1] = c.p;
    for (let i = 0; i < 8; i++) {
      const [tx, ty] = szPos(c, i, 8, 0.7),
        g = Math.min(1, Math.max(0, (c.u - 0.1 - i * 0.05) / 0.3)),
        bt = 0.5 + i * 0.22,
        burn = c.u > bt,
        ash = c.u > bt + 1.2;
      if (g <= 0) continue;
      if (ash) {
        sxR(tx - 6, ty - 3, 5, 1, "#3a3a3a");
        sxR(tx, ty - 9, 1, 2, "#2a2a2a");
        continue;
      }
      sxR(tx, ty - 12 * g, 1, Math.round(4 * g), "#4a3320");
      [9, 9, 7, 5, 3, 1].forEach((w, s) => sxR(tx - Math.floor(w / 2) * 3, ty - 12 - (s + 1) * 6 * g, w, 2, burn ? (s % 2 ? b1 : m1) : s % 2 ? "#2f6a2a" : "#3f8a36"));
      if (burn)
        for (let s = 0; s < 5; s++) {
          const fh = 4 + Math.round(sxH(i * 5 + s + Math.floor(c.u * 10)) * 6);
          sxR(tx - 12 + s * 6, ty - 54 - fh * 3, 2, fh, s % 2 ? m1 : b1);
          sxR(tx - 12 + s * 6, ty - 54 - fh * 3, 1, 1, c1);
        }
    }
  },
  tornado(c) {
    const [d1, m1, b1, c1] = c.p,
      leaf = c.key == "plant+wind",
      H = Math.round(Math.min(26, c.u * 70) * (0.7 + c.R / 300));
    sxA(c.fade * 0.28);
    sxE(c.px, c.py, Math.round(c.R / 3.4), Math.round(c.R / 4.6), d1);
    sxA(c.fade);
    for (let y = 0; y < H; y++) {
      const r = 2 + y * 0.6,
        cx = c.px + Math.sin(c.u * 3 + y * 0.12) * 6;
      for (let k = 0; k < 7; k++) {
        const ag = c.u * 7 + y * 0.45 + k * 0.8976,
          wx = cx + Math.cos(ag) * r * 3,
          wy = c.py - 6 - y * 3 + Math.sin(ag) * r * 0.9,
          front = Math.sin(ag) > 0;
        if (leaf && (k + y) % 4 == 0) {
          sxR(wx, wy, 3, 1, front ? b1 : m1);
          sxR(wx + 3, wy - 3, 2, 1, m1);
        } else sxR(wx, wy, front ? 2 : 1, front ? 2 : 1, (k + y / 2) % 3 ? (front ? b1 : m1) : front ? c1 : d1);
      }
    }
    for (let i = 0; i < 10; i++) {
      const ag = c.u * 4 + i * 0.63,
        r = c.R * (0.55 + sxH(i) * 0.35);
      sxS(c.px + Math.cos(ag) * r, c.py + Math.sin(ag) * r * 0.9 - sxH(i + 3) * 18, leaf ? (i % 2 ? "#6fd9a0" : b1) : b1, c.sh);
    }
  },
  volcano(c) {
    const [d1, m1, b1, c1] = c.p,
      g = Math.min(1, c.u / 0.5),
      H = Math.round(26 * g),
      W = Math.round(c.R / 4.5);
    sxA(c.fade * 0.4);
    sxD(c.px, c.py, Math.round(c.R / 3.4), m1);
    sxA(c.fade);
    for (let y = 0; y < H; y++) {
      const w = Math.max(1, Math.round(W - y * (W / (H + 2))));
      sxR(c.px - w * 3, c.py - y * 3, w * 2, 1, y > H - 3 ? m1 : "#4a3320");
      sxR(c.px - w * 3, c.py - y * 3, 2, 1, "#2a1a10");
    }
    if (g >= 1) {
      for (let i = 0; i < 12 * sxQ(); i++) {
        const t = (c.u * 1.6 + sxH(i)) % 1,
          bx = c.px + (sxH(i + 3) - 0.5) * c.R * 1.3 * t,
          by = c.py - H * 3 - Math.sin(t * 3.14) * (50 + sxH(i + 5) * 40) + t * t * 40;
        sxD(bx, by, i % 3 ? 1 : 2, t < 0.5 ? b1 : m1);
      }
      for (let s = 0; s < 3; s++) {
        const k = (c.u * 0.9 + s * 0.33) % 1;
        sxR(c.px - 6 + (s - 1) * 6 - k * 12 * (s - 1), c.py - H * 3 + 3 + k * (H * 3 - 3), 2, 2, b1);
      }
    }
  },
  rink(c) {
    const [d1, m1, b1, c1] = c.p,
      fr = Math.min(1, Math.max(0, (c.u - 0.2) / 0.6));
    sxA(c.fade * 0.85);
    sxD(c.px, c.py, Math.round(c.R / 3.2), m1);
    sxA(c.fade * fr);
    sxD(c.px, c.py, Math.round(c.R / 3.2), "#dff6ff");
    sxA(c.fade);
    if (fr > 0.3)
      for (let j = 0; j < 7; j++) {
        const ag = j * 0.9 + 0.3;
        for (let s = 0; s < (c.R * fr) / 1.2; s += 3) sxR(c.px + Math.cos(ag) * s, c.py + Math.sin(ag) * s * 0.92 + Math.round((sxH(j * 7 + s) - 0.5) * 2) * 3, 1, 1, c1);
      }
    for (let k = 0; k < 3; k++) sxRing(c.px, c.py, c.R * (0.35 + k * 0.22), b1, 1, c.u * (k % 2 ? -1.4 : 1.4), c.u * (k % 2 ? -1.4 : 1.4) + 1.7);
    for (let i = 0; i < 8; i++) if ((Math.floor(c.u * 6) + i) % 4 == 0) {
      const [sx, sy] = szPos(c, i, 12, 0.9);
      sxS(sx, sy, b1, 1);
    }
  },
  stalac(c) {
    const [d1, m1, b1, c1] = c.p,
      ic = (px, py, l) => {
        for (let s = 0; s < l; s++) {
          const w = Math.max(1, 5 - Math.floor((s * 5) / l));
          sxR(px - Math.floor(w / 2) * 3, py + s * 3, w, 1, s < l * 0.3 ? b1 : s < l * 0.6 ? m1 : c1);
        }
      };
    sxA(c.fade * 0.35);
    sxD(c.px, c.py, Math.round(c.R / 3.2), d1);
    sxA(c.fade);
    for (let i = 0; i < 8; i++) {
      const [lx, ly] = szPos(c, i, 17, 0.85),
        ph = c.u - 0.2 - i * 0.3;
      if (ph < 0) continue;
      const cy = ph % 2.2,
        k = cy / 0.28,
        L = 14 + Math.round(sxH(i) * 8);
      if (cy < 1.9 && k < 1) {
        sxA(c.fade * 0.5 * k);
        sxE(lx, ly, 2 + Math.round(k * 2), 1, d1);
        sxA(c.fade);
        ic(lx, ly - (1 - k) * 170 - L * 3, L);
      } else if (cy < 1.9) {
        ic(lx, ly - L * 3, L);
        sxR(lx - 3, ly, 3, 1, c1);
        if (k < 1.5) for (let j = 0; j < 4; j++) sxS(lx + (j - 1.5) * 6, ly - 6 - (k - 1) * 30, c1, 0);
      }
    }
  },
  acid(c) {
    const [d1, m1, b1, c1] = c.p,
      rx = Math.round((Math.min(c.R, c.u * 260) / 3.2) * 1),
      ice = c.key == "ice+corr";
    sxA(c.fade * 0.55);
    sxD(c.px, c.py, rx, m1);
    sxA(c.fade * 0.4);
    sxD(c.px, c.py, Math.max(1, rx - 3), d1);
    sxA(c.fade);
    if (ice)
      for (let j = 0; j < 4; j++) {
        const [fx, fy] = szPos(c, j, 40, 0.65);
        sxR(fx, fy + Math.sin(c.u * 2 + j) * 3, 3, 1, "#eaf8ff");
        sxR(fx + 3, fy + 3 + Math.sin(c.u * 2 + j) * 3, 2, 1, "#bef0ff");
      }
    for (let i = 0; i < 12 * sxQ(); i++) {
      const k = (c.u * 1.3 + sxH(i)) % 1,
        [bx, by] = szPos(c, i, 21, 0.8);
      if (k < 0.8) sxS(bx, by - k * 24, i % 3 ? b1 : c1, 0, 1 + (k > 0.4 ? 1 : 0));
      else {
        const s2 = Math.round(((k - 0.8) / 0.2) * 2) * 3;
        sxR(bx - 3 - s2, by, 1, 1, c1);
        sxR(bx + 3 + s2, by, 1, 1, c1);
      }
    }
  },
  rainbow(c) {
    const [d1, m1, b1, c1] = c.p,
      g = Math.min(1, c.u / 0.7);
    sxA(c.fade * 0.35);
    sxD(c.px, c.py, Math.round(c.R / 3.2), m1);
    sxA(c.fade);
    for (let k = 0; k < 7; k++) {
      const rr = c.R * 1.05 - k * 7;
      for (let q = 0; q <= Math.round(g * 70); q++) {
        const ag = 3.1416 + (q / 70) * 3.1416;
        sxR(c.px + Math.cos(ag) * rr, c.py + Math.sin(ag) * rr * 0.9, 2, 2, SXRB[k]);
      }
    }
    for (let i = 0; i < 18; i++) {
      const k = (c.u * 1.4 + sxH(i)) % 1;
      sxS(c.px + (sxH(i + 4) - 0.5) * c.R * 1.7, c.py - c.R * 0.8 + k * c.R * 0.85, i % 2 ? c1 : b1, 0);
    }
  },
  meadow(c) {
    const [d1, m1, b1, c1] = c.p;
    sxA(c.fade * 0.3);
    sxD(c.px, c.py, Math.round(c.R / 3.2), d1);
    sxA(c.fade * 0.2);
    for (let k = 0; k < 5; k++) sxR(c.px - c.R * 0.8 + k * c.R * 0.4, c.py - c.R * 1.7, 5, Math.round((c.R * 1.7) / 3), b1);
    sxA(c.fade);
    for (let i = 0; i < 26; i++) {
      const [gx, gy] = szPos(c, i, 33, 0.9),
        g = Math.min(1, Math.max(0, (c.u - 0.1 - sxH(i + 3) * 0.7) / 0.3)),
        H = Math.round((3 + sxH(i + 2) * 4) * g);
      sxR(gx, gy - H * 3, 1, H, "#4cc552");
      sxR(gx + 3, gy - Math.floor(H / 2) * 3, 1, 1, "#7ee06a");
      if (i % 4 == 0 && g >= 1) {
        sxR(gx - 3, gy - H * 3 - 6, 3, 1, i % 8 ? b1 : "#ff9ac8");
        sxR(gx, gy - H * 3 - 3, 1, 1, c1);
      }
    }
    for (let i = 0; i < 10; i++) {
      const k = (c.u * 0.8 + sxH(i)) % 1;
      sxS(c.px + (sxH(i + 9) - 0.5) * c.R * 1.6 + Math.sin(c.u * 3 + i) * 6, c.py - k * 80, c1, 0);
    }
  },
  eclipse(c) {
    const [d1, m1, b1, c1] = c.p,
      a = Math.min(1, c.u / 1.2),
      sx = c.px,
      sy = c.py - c.R * 1.15,
      mx = sx - 24 + a * 24,
      cov = a > 0.7;
    for (let q = 0; q < 12; q++) {
      sxA(c.fade * 0.4);
      sxD(c.px, c.py, Math.round(c.R / 3.2), "#0a0414");
      break;
    }
    sxA(c.fade * 0.5);
    for (let k = 0; k < 8; k++) sxRing(c.px, c.py, c.R * (0.2 + k * 0.1), k % 2 ? b1 : d1, 1, c.u * (k % 2 ? 1 : -1), c.u * (k % 2 ? 1 : -1) + 1.6);
    if (cov) for (let k = 0; k < 6; k++) {
      sxA(c.fade * 0.35);
      sxR(c.px - c.R * 0.75 + k * c.R * 0.3, sy + 24, 3, Math.round((c.py - sy - 24) / 3), k % 2 ? m1 : d1);
    }
    sxA(c.fade);
    for (let k = 0; k < 16; k++) {
      const ag = k * 0.3927 + c.u,
        l = (cov ? 10 : 4) + (k % 2) * 5;
      for (let s = 3; s < 3 + l; s++) sxR(sx + Math.cos(ag) * s * 3, sy + Math.sin(ag) * s * 3, 1, 1, k % 2 ? b1 : m1);
    }
    sxD(sx, sy, 8, m1);
    sxD(sx, sy, 6, b1);
    sxD(sx, sy, 4, c1);
    sxD(mx, sy, 8, "#0a0414");
    if (cov) for (let i = 0; i < 10; i++) sxS(c.px + (sxH(i) - 0.5) * c.R * 1.6, c.py - ((c.u * 40 + i * 20) % 70), i % 2 ? c1 : b1, 0);
  },
  swamp(c) {
    const [d1, m1, b1, c1] = c.p;
    sxA(c.fade * 0.6);
    sxD(c.px, c.py, Math.round(c.R / 3.2), "#1f3a2a");
    sxA(c.fade * 0.5);
    sxD(c.px, c.py, Math.round(c.R / 4), m1);
    sxA(c.fade);
    for (let i = 0; i < 7; i++) {
      const an = i * 0.9,
        sx = c.px + Math.cos(an) * c.R * 0.85,
        sy = c.py + Math.sin(an) * c.R * 0.8;
      for (let s = 0; s < 14 * c.g; s++) {
        const o = Math.sin(s * 0.35 + c.u * 3 + i) * 3;
        sxR(sx - Math.cos(an) * s * 3 * 0.35 + o * 0.3, sy - Math.sin(an) * s * 3 * 0.35 + 1 - (s > 8 ? 0 : 0), 1, 1, s % 4 ? m1 : b1);
      }
    }
    for (let i = 0; i < 6; i++) {
      const [rx, ry] = szPos(c, i + 20, 50, 0.7);
      sxR(rx, ry - 15, 1, 5, "#3a5a2a");
      sxR(rx - 3, ry - 18, 3, 1, "#4a7a3a");
    }
    for (let i = 0; i < 8; i++) {
      const k = (c.u * 1.1 + sxH(i)) % 1,
        [bx, by] = szPos(c, i, 60, 0.7);
      sxS(bx, by - k * 16, c1, 0);
    }
  },
  alluvium(c) {
    const [d1, m1, b1, c1] = c.p;
    sxA(c.fade * 0.45);
    sxD(c.px, c.py, Math.round(c.R / 3.2), "#3a2f24");
    sxA(c.fade * 0.4);
    sxD(c.px, c.py, Math.round(c.R / 3.8), "#3a8dff");
    sxA(c.fade);
    for (let i = 0; i < 8; i++) {
      const [lx, ly] = szPos(c, i, 70, 0.85),
        ph = c.u - 0.15 - i * 0.22;
      if (ph < 0) continue;
      const cy = ph % 1.5,
        k = cy / 0.3;
      if (k < 1) {
        sxA(c.fade * 0.5 * k);
        sxE(lx, ly, 2, 1, "#000");
        sxA(c.fade);
        sxD(lx, ly - (1 - k) * 150, 2, "#8a6a4a");
        sxR(lx - 3, ly - (1 - k) * 150 - 3, 1, 1, "#d8c098");
        sxR(lx + 6, ly - (1 - k) * 150 - 24, 1, 3, b1);
      } else if (k < 2.5) {
        sxA(c.fade * (1 - (k - 1) / 1.5));
        sxRing(lx, ly, (k - 1) * 14, c1, 1);
        for (let j = 0; j < 5; j++) sxR(lx + Math.cos(j * 1.3) * (k - 1) * 14, ly - Math.sin((k - 1) * 2) * 14 + 0, 1, 1, j % 2 ? "#8a6a4a" : b1);
        sxA(c.fade);
      }
    }
  },
  waves(c) {
    const [d1, m1, b1, c1] = c.p;
    sxA(c.fade * 0.4);
    sxD(c.px, c.py, Math.round(c.R / 3.2), d1);
    sxA(c.fade);
    for (let j = 0; j < 4; j++) {
      const yb = Math.sin(c.u * 2 + j * 1.6) * c.R * 0.7;
      for (let xx = -c.R; xx <= c.R; xx += 3) {
        if (xx * xx + yb * yb > c.R * c.R) continue;
        const wy = yb + Math.sin(xx * 0.14 + c.u * 6 + j) * 5;
        sxR(c.px + xx, c.py + wy, 1, 1, j % 2 ? b1 : m1);
        if ((xx / 3 + j) % 5 == 0) sxR(c.px + xx, c.py + wy - 3, 1, 1, c1);
      }
    }
  },
  rain(c) {
    const [d1, m1, b1, c1] = c.p,
      cy = c.py - c.R * 0.95;
    sxA(c.fade * 0.3);
    sxD(c.px, c.py, Math.round(c.R / 3.2), m1);
    sxA(c.fade);
    for (let i = 0; i < 44 * sxQ(); i++) {
      const lx = c.px + (sxH(i) - 0.5) * c.R * 1.6,
        t = (c.u * 2.4 + sxH(i + 4)) % 1;
      sxL(lx, cy + t * c.R * 0.95, lx - 2, cy + t * c.R * 0.95 + 8, i % 3 ? m1 : c1, 1);
    }
    for (let i = 0; i < 6; i++) {
      const [rx, ry] = szPos(c, i, 90, 0.8),
        k = (c.u * 1.6 + sxH(i)) % 1;
      sxA(c.fade * (1 - k));
      sxRing(rx, ry, 2 + k * 10, b1, 1);
      sxA(c.fade);
    }
    for (let i = 0; i < 6; i++) sxD(c.px + (i - 2.5) * c.R * 0.3, cy + Math.sin(i * 2 + c.u) * 3 + (i % 2) * 5, 5 - (i % 3), i % 2 ? "#2a3a10" : d1);
    sxD(c.px, cy - 6, 5, "#3a4a18");
  },
  shrooms(c) {
    const [d1, m1, b1, c1] = c.p;
    sxA(c.fade * 0.35);
    sxD(c.px, c.py, Math.round(c.R / 3.2), d1);
    sxA(c.fade);
    for (let i = 0; i < 9; i++) {
      const [mx, my] = szPos(c, i, 110, 0.82),
        ph = c.u - 0.1 - sxH(i + 2) * 0.6;
      if (ph < 0) continue;
      const cy = ph % 1.6,
        g = Math.min(1, cy / 0.4),
        H = Math.round((3 + sxH(i) * 3) * g);
      if (cy < 1.1) {
        sxR(mx - 3, my - H * 3, 2, H, "#e8e0c0");
        sxE(mx, my - H * 3, 4 + (i % 2), 2 + (i % 2), m1);
        sxR(mx - 6, my - H * 3 - 3, 2, 1, b1);
        sxR(mx + 3, my - H * 3, 1, 1, c1);
        sxR(mx - 3, my - H * 3 + 3, 3, 1, d1);
      } else
        for (let j = 0; j < 7; j++) {
          const q = (cy - 1.1) / 0.5;
          sxA(c.fade * (1 - q));
          sxS(mx + Math.cos(j * 0.9 + i) * q * 26, my - H * 3 + Math.sin(j * 0.9 + i) * q * 18 - q * 12, j % 2 ? c1 : b1, c.sh);
          sxA(c.fade);
        }
    }
  },
  blades(c) {
    const [d1, m1, b1, c1] = c.p;
    sxA(c.fade * 0.3);
    sxD(c.px, c.py, Math.round(c.R / 3.2), d1);
    sxA(c.fade);
    for (let i = 0; i < 12; i++) {
      const [lx, ly] = szPos(c, i, 130, 0.85),
        ph = c.u - 0.1 - i * 0.12;
      if (ph < 0) continue;
      const cy = ph % 1.5,
        k = cy / 0.3;
      if (k < 1) for (let s = 0; s < 8; s++) sxR(lx + (1 - k) * 60 - s * 5, ly - (1 - k) * 150 - s * 10, 2, 2, s < 2 ? c1 : s < 5 ? b1 : m1);
      else if (k < 2.6) {
        const b = (k - 1) / 1.6;
        sxA(c.fade * (1 - b));
        sxR(lx - 24, ly, 9, 1, b1);
        sxR(lx - 15, ly - 3, 5, 1, m1);
        sxR(lx - 24, ly + 3, 5, 1, d1);
        sxS(lx - 12 - b * 9, ly - 6 - b * 12, c1, 0);
        sxS(lx + 12 + b * 9, ly - 6 - b * 12, c1, 0);
        sxA(c.fade);
      }
    }
  },
  obelisk(c) {
    const [d1, m1, b1, c1] = c.p,
      sc = c.R / 90,
      pr = ((c.u * 1.1) % 1) * c.R;
    sxA(c.fade * 0.35);
    sxD(c.px, c.py, Math.round(c.R / 3.2), "#0a0414");
    sxA(c.fade);
    sxRing(c.px, c.py, pr, c1, 1);
    [[-14, -4, 66], [12, -3, 78], [0, -1, 96], [-7, 4, 54], [9, 4, 60]].forEach((o, i) => {
      const g = Math.min(1, Math.max(0, (c.u - 0.1 - i * 0.12) / 0.35));
      if (g <= 0) return;
      const h = o[2] * g * sc,
        ox = c.px + o[0] * 3 * sc,
        oy = c.py + o[1] * 3 * sc;
      sxR(ox - 6, oy - h, 4, Math.round(h / 3), m1);
      sxR(ox + 3, oy - h, 2, Math.round(h / 3), d1);
      sxR(ox - 6, oy - h, 1, Math.round(h / 3), b1);
      sxR(ox - 3, oy - h - 6, 3, 2, m1);
      sxR(ox, oy - h - 9, 1, 1, b1);
      if (g >= 1) for (let r = 0; r < 3; r++) {
        const ry = oy - h + 12 + r * 18;
        if (ry < oy - 6) sxR(ox - 3, ry, 3, 1, Math.floor(c.u * 6 + i + r) % 2 ? c1 : b1);
      }
    });
  },
  ritual(c) {
    const [d1, m1, b1, c1] = c.p,
      rot = c.u * 1.2,
      R2 = c.R * 0.86;
    sxA(c.fade * 0.45);
    sxD(c.px, c.py, Math.round(c.R / 3.2), d1);
    sxA(c.fade);
    sxRing(c.px, c.py, R2, m1, 1);
    sxRing(c.px, c.py, R2 - 5, d1, 1);
    const pts = [0, 1, 2, 3, 4].map((k) => [c.px + Math.cos(rot + k * 1.2566) * R2, c.py + Math.sin(rot + k * 1.2566) * R2]);
    for (let k = 0; k < 5; k++) sxL(pts[k][0], pts[k][1], pts[(k + 2) % 5][0], pts[(k + 2) % 5][1], b1, 1);
    pts.forEach((o, k) => {
      const g = Math.min(1, Math.max(0, (c.u - 0.2 - k * 0.1) / 0.3)),
        H = Math.round((10 + Math.sin(c.u * 6 + k) * 3) * g);
      sxR(o[0] - 3, o[1] - H * 3, 3, H, m1);
      sxR(o[0], o[1] - H * 3, 1, H, b1);
      sxD(o[0], o[1], 1, c1);
      sxS(o[0] + Math.sin(c.u * 5 + k) * 9, o[1] - H * 3 - 9 - ((c.u * 30 + k * 12) % 24), c1, 0);
    });
    const cH = Math.round(Math.min(1, Math.max(0, (c.u - 0.5) / 0.4)) * 26);
    if (cH > 0) {
      sxR(c.px - 6, c.py - cH * 3, 5, cH, d1);
      sxR(c.px - 3, c.py - cH * 3, 3, cH, m1);
      sxR(c.px, c.py - cH * 3, 1, cH, c1);
      sxD(c.px, c.py - cH * 3, 3, m1);
      sxD(c.px, c.py - cH * 3, 1, c1);
    }
  },
  vines(c) {
    const [d1, m1, b1, c1] = c.p,
      ice = c.key == "ice+plant",
      gv = ice ? "#7fd8c0" : "#4cc552",
      g = Math.min(1, c.u / 0.5);
    sxA(c.fade * 0.3);
    sxD(c.px, c.py, Math.round(c.R / 3.2), ice ? "#9fe8ff" : "#2f6a2a");
    sxA(c.fade);
    for (let j = 0; j < 6; j++) {
      const an = j * 1.047,
        bx = c.px + Math.cos(an) * c.R * 0.45,
        by = c.py + Math.sin(an) * c.R * 0.4,
        h = Math.round(g * (12 + (j % 2) * 8));
      for (let y = 0; y < h; y++) {
        const wx = bx + Math.sin(y * 0.45 + j + c.u * 3) * 6;
        sxR(wx, by - y * 3, 1, 1, y % 5 ? gv : b1);
        if (y % 6 == 3) {
          sxR(wx + 3, by - y * 3, 1, 1, b1);
          sxR(wx - 6, by - y * 3 - 3, 1, 1, ice ? c1 : "#2f7a2a");
        }
      }
      if (g > 0.9) {
        sxD(bx + Math.sin(h * 0.45 + j + c.u * 3) * 6, by - h * 3, 1, c1);
        sxR(bx - 6, by - h * 3, 1, 1, b1);
        sxR(bx + 9, by - h * 3, 1, 1, b1);
      }
    }
  },
  hole(c) {
    const [d1, m1, b1, c1] = c.p,
      g = Math.min(1, c.u / 0.35);
    sxA(c.fade * 0.8);
    sxE(c.px, c.py, Math.round((c.R / 4.5) * g), Math.round((c.R / 7) * g), "#05020f");
    sxA(c.fade);
    sxRing(c.px, c.py, (c.R / 2.2) * g, d1, 1, c.u * 4, c.u * 4 + 4);
    for (let t = 0; t < 6; t++) {
      const ag = (t / 6) * 6.2832 + 0.5,
        L = Math.round(g * (11 + (t % 2) * 5)),
        sx = c.px + Math.cos(ag) * 12,
        sy = c.py + Math.sin(ag) * 7;
      for (let s = 0; s < L; s++) sxR(sx + Math.cos(ag) * s * 2.2 + Math.sin(s * 0.45 + c.u * 4 + t) * 4, sy - s * 3.2, s < L * 0.3 ? 2 : 1, 1, s < L * 0.4 ? d1 : m1);
      sxR(sx + Math.cos(ag) * L * 2.2, sy - L * 3.2, 1, 1, c1);
    }
  },
  cloud(c) {
    const [d1, m1, b1, c1] = c.p,
      g = Math.min(1, c.u / 0.4);
    for (let i = 0; i < 11 * sxQ(); i++) {
      const an = i * 1.7 + c.u * (i % 2 ? 0.8 : -0.8),
        r = c.R * (0.25 + (i % 4) * 0.17) * g,
        qx = c.px + Math.cos(an) * r,
        qy = c.py + Math.sin(an) * r * 0.8 - 6 + Math.sin(c.u * 2 + i) * 3,
        rad = 4 + (i % 3);
      sxA(c.fade * 0.5);
      sxD(qx, qy, rad, i % 3 ? d1 : m1);
      sxA(c.fade * 0.7);
      sxD(qx - 2, qy - 2, Math.max(1, rad - 3), b1);
    }
    sxA(c.fade);
    for (let i = 0; i < 8; i++) sxS(c.px + Math.cos(i * 0.8 + c.u * 2) * c.R * 0.9, c.py + Math.sin(i * 0.8 + c.u * 2) * c.R * 0.7 - ((c.u * 20 + i * 9) % 20), c1, 0);
  },
};

function drawSpellZone(z) {
  const art = SPA[z.key],
    g = sxC(),
    c = {
      px: z.x,
      py: z.y,
      R: z.r,
      u: z.u,
      left: z.t,
      g: Math.min(1, z.u / 0.4),
      fade: z.t < 0.5 ? Math.max(0, z.t / 0.5) : 1,
      p: art.p,
      sh: art.sh,
      key: z.key,
    },
    fn = SZN[z.v || art.v];
  if (!fn) return;
  g.save();
  g.globalAlpha = c.fade;
  // borde punteado del área real de daño
  sxA(c.fade * 0.5);
  sxRing(c.px, c.py, c.R * c.g, c.p[1], 1, 0, 6.2832);
  sxA(c.fade);
  fn(c);
  g.restore();
}

// Vínculo del Parásito carmesí: enredadera entre el jugador y el enemigo, con motas de vida que vuelven a ti
function drawSpellLink(z) {
  if (z.e.hp <= 0) return;
  const art = SPA[z.key],
    [d1, m1, b1, c1] = art.p,
    x1 = P.x,
    y1 = P.y,
    x2 = z.e.x,
    y2 = z.e.y,
    l = Math.hypot(x2 - x1, y2 - y1) || 1,
    n = Math.ceil(l / 4),
    nx = -(y2 - y1) / l,
    ny = (x2 - x1) / l,
    g = sxC();
  g.save();
  g.globalAlpha = Math.min(1, z.t * 2);
  for (let i = 0; i <= n; i++) {
    const q = i / n,
      o = Math.sin(q * 10 - z.u * 14) * 6 * Math.sin(q * 3.14);
    sxR(x1 + (x2 - x1) * q + nx * o, y1 + (y2 - y1) * q + ny * o, 1, 1, i % 3 ? m1 : "#2f7a2a");
    if (i % 5 == 2) sxR(x1 + (x2 - x1) * q + nx * (o + 5), y1 + (y2 - y1) * q + ny * (o + 5), 1, 1, b1);
  }
  for (let j = 0; j < 4; j++) {
    const t = 1 - ((z.u * 1.6 + j / 4) % 1);
    sxS(x1 + (x2 - x1) * t + nx * Math.sin(t * 10 - z.u * 14) * 6 * Math.sin(t * 3.14), y1 + (y2 - y1) * t + ny * Math.sin(t * 10 - z.u * 14) * 6 * Math.sin(t * 3.14), c1, 0);
  }
  sxRing(x2, y2, z.e.r + 4, m1, 1);
  g.restore();
}
// Bloque de hielo sobre un enemigo congelado
function drawIceBlock(e) {
  const g = sxC(),
    w = Math.max(2, Math.round((e.r + 5) / 3)),
    px = e.x - w * 3,
    py = e.y - w * 3 - 3;
  g.save();
  g.globalAlpha = 0.55;
  sxR(px, py, w * 2, w * 2, "#9fe8ff");
  g.globalAlpha = 0.9;
  sxR(px, py, w * 2, 1, "#eaf8ff");
  sxR(px, py, 1, w * 2, "#eaf8ff");
  sxR(px + (w * 2 - 1) * 3, py, 1, w * 2, "#5cc8ff");
  sxR(px, py + (w * 2 - 1) * 3, w * 2, 1, "#5cc8ff");
  sxR(px + 6, py + 6, 2, 1, "#ffffff");
  sxR(px + 6, py + 9, 1, 2, "#ffffff");
  sxR(px + w * 6 - 12, py + w * 6 - 9, 2, 1, "#ffffff");
  g.restore();
}
