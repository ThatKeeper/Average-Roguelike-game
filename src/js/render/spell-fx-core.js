/* ======================================================================
 * src/js/render/spell-fx-core.js
 * Herramientas de dibujo "pixel art" de los hechizos y renderizadores de proyectiles, rayo, impactos,
 * cráter del meteoro, salto del contagio y destello de lanzamiento.
 *
 * Define:
 * SFX_C, sxC, sxH, sxQ, sxR, sxD, sxE, sxS, sxL, sxRing, sxBeam, SBO, SHI, drawSpellProj, drawSpellFx
 * ====================================================================== */

// Todo se dibuja en una rejilla de 3 px (cada "píxel" del hechizo mide 3×3 px del juego) para que se vea como pixel art.
// SFX_C permite redirigir el dibujo a otro lienzo (vista previa del grimorio).
let SFX_C = null;
const sxC = () => SFX_C || x,
  sxH = (n) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  },
  sxQ = () => (typeof LOW != "undefined" && LOW ? 0.55 : 1), // factor de partículas (modo ligero en móvil)
  sxA = (a) => (sxC().globalAlpha = a < 0 ? 0 : a > 1 ? 1 : a);
function sxR(px, py, w, h, c) {
  const g = sxC();
  g.fillStyle = c;
  g.fillRect(Math.round(px / 3) * 3, Math.round(py / 3) * 3, w * 3, h * 3);
}
function sxD(cx, cy, r, c) {
  const g = sxC(),
    gx = Math.round(cx / 3),
    gy = Math.round(cy / 3);
  g.fillStyle = c;
  for (let j = -r; j <= r; j++) {
    const w = Math.floor(Math.sqrt(r * r - j * j + 0.5));
    g.fillRect((gx - w) * 3, (gy + j) * 3, (2 * w + 1) * 3, 3);
  }
}
function sxE(cx, cy, rx, ry, c) {
  const g = sxC(),
    gx = Math.round(cx / 3),
    gy = Math.round(cy / 3);
  g.fillStyle = c;
  for (let j = -ry; j <= ry; j++) {
    const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j / ry) * (j / ry))));
    g.fillRect((gx - w) * 3, (gy + j) * 3, (2 * w + 1) * 3, 3);
  }
}
// Chispa según la forma del hechizo: 0 cuadrada · 1 cruz · 2 cuadrado hueco · 3 aspa
function sxS(px, py, c, sh = 0, z = 1) {
  if (sh == 1) {
    sxR(px - 3, py, 3, 1, c);
    sxR(px, py - 3, 1, 3, c);
  } else if (sh == 2) {
    sxR(px, py, z + 2, 1, c);
    sxR(px, py + 3 * (z + 1), z + 2, 1, c);
    sxR(px, py, 1, z + 2, c);
    sxR(px + 3 * (z + 1), py, 1, z + 2, c);
  } else if (sh == 3) {
    sxR(px - 3, py - 3, 1, 1, c);
    sxR(px + 3, py - 3, 1, 1, c);
    sxR(px, py, 1, 1, c);
    sxR(px - 3, py + 3, 1, 1, c);
    sxR(px + 3, py + 3, 1, 1, c);
  } else sxR(px, py, z, z, c);
}
function sxL(x1, y1, x2, y2, c, w = 1) {
  const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 3));
  for (let i = 0; i <= n; i++) sxR(x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n, w, w, c);
}
function sxRing(cx, cy, rr, c, w = 1, a0 = 0, a1 = 6.2832) {
  const n = Math.max(10, Math.ceil(((a1 - a0) * rr) / 3.2));
  for (let i = 0; i < n; i++) {
    const an = a0 + ((a1 - a0) * i) / n;
    sxR(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr, w, w, c);
  }
}
// Haz grueso (w celdas a cada lado) con tres capas: halo, cuerpo y núcleo
function sxBeam(x1, y1, x2, y2, w, c) {
  const l = Math.hypot(x2 - x1, y2 - y1) || 1,
    nx = -(y2 - y1) / l,
    ny = (x2 - x1) / l,
    n = Math.ceil(l / 3);
  for (let i = 0; i <= n; i++) {
    const px = x1 + ((x2 - x1) * i) / n,
      py = y1 + ((y2 - y1) * i) / n;
    for (let o = -w; o <= w; o++) sxR(px + nx * o * 3, py + ny * o * 3, 1, 1, c);
  }
}

// ---------------- proyectiles ----------------
// c = { px, py, a (ángulo), u (segundos de vida), k (0..1), r, p: [d, m, b, c], sh, key, p0 (proyectil) }
const SBO = {
  comet(c) {
    const { px, py, a, u } = c,
      [d1, m1, b1, c1] = c.p,
      ca = Math.cos(a),
      sa = Math.sin(a),
      n = Math.round(22 * sxQ());
    for (let i = n; i >= 0; i--) {
      const q = i / n,
        dd = 7 + q * 72,
        w = Math.sin(q * 9 - u * 16) * (2 + q * 8);
      sxR(px - ca * dd - sa * w, py - sa * dd + ca * w, i < n * 0.3 ? 2 : 1, i < n * 0.3 ? 2 : 1, q < 0.25 ? b1 : q < 0.6 ? m1 : d1);
    }
    for (let i = 0; i < 6; i++) {
      const t = (u * 1.8 + sxH(i)) % 1,
        dd = 10 + t * 55,
        o = (sxH(i + 3) - 0.5) * 26;
      sxR(px - ca * dd - sa * o, py - sa * dd + ca * o - t * 8, 1, 1, i % 2 ? c1 : b1);
    }
    sxD(px, py, 6, d1);
    sxD(px, py, 5, m1);
    sxD(px, py, 4, b1);
    sxD(px, py, 2, c1);
  },
  freeze(c) {
    const { px, py, a, u } = c,
      [d1, m1, b1, c1] = c.p,
      ca = Math.cos(a),
      sa = Math.sin(a);
    for (let d = -45; d <= 33; d += 3) {
      const w = d > 12 ? Math.max(0, (33 - d) * 0.6) : d < -30 ? 3 : 9;
      for (let o = -w; o <= w; o += 3) {
        const col = Math.abs(o) < 2 ? c1 : o < 0 ? b1 : m1;
        sxR(px + ca * d - sa * o, py + sa * d + ca * o, 1, 1, col);
      }
    }
    sxL(px - ca * 42, py - sa * 42, px + ca * 26, py + sa * 26, d1, 1);
    for (let i = 0; i < 7; i++) {
      const t = (u * 2.2 + sxH(i)) % 1,
        dd = 24 + t * 50,
        o = (sxH(i + 7) - 0.5) * 22;
      sxS(px - ca * dd - sa * o, py - sa * dd + ca * o, i % 2 ? c1 : b1, 1);
    }
  },
  wave(c) {
    const { px, py, a, u } = c,
      [d1, m1, b1, c1] = c.p,
      ca = Math.cos(a),
      sa = Math.sin(a);
    for (let k = 0; k < 3; k++)
      for (let i = 0; i < 16; i++) {
        const o = Math.sin(i * 0.9 - u * 14 + k * 2) * 3 + (k - 1) * 8;
        sxR(px - ca * (9 + i * 4.2) - sa * o, py - sa * (9 + i * 4.2) + ca * o, 1, 1, i < 4 ? c1 : i % 2 ? b1 : m1);
      }
    for (let t = -1.2; t <= 1.2; t += 0.15) {
      const lx = Math.cos(t) * 8 + 4,
        ly = Math.sin(t) * 14;
      sxR(px + ca * lx - sa * ly, py + sa * lx + ca * ly, 2, 2, Math.abs(t) < 0.5 ? c1 : b1);
      sxR(px + ca * (lx - 6) - sa * ly, py + sa * (lx - 6) + ca * ly, 2, 2, m1);
    }
    for (let i = 0; i < 6; i++) {
      const t = (u * 3 + i * 0.17) % 1;
      sxR(px - ca * t * 30 - sa * Math.sin(i * 5) * 16, py - sa * t * 30 + ca * Math.sin(i * 5) * 16 - Math.sin(t * 3.14) * 8, 1, 1, i % 2 ? c1 : b1);
    }
    sxD(px, py, 3, d1);
    sxD(px, py, 2, b1);
  },
  seed(c) {
    const { px, py, a, u } = c,
      [d1, m1, b1, c1] = c.p,
      ca = Math.cos(a),
      sa = Math.sin(a),
      ice = c.key == "ice+plant",
      leaf = ice ? "#9fe8c8" : "#4cc552";
    for (let i = 0; i < 9; i++) {
      const q = i / 9,
        an = u * 12 - q * 5;
      sxR(px - ca * (8 + q * 38) + Math.cos(an) * (3 + q * 4) * -sa, py - sa * (8 + q * 38) + Math.cos(an) * (3 + q * 4) * ca, 1, 1, i < 3 ? b1 : m1);
    }
    sxD(px, py, 4, d1);
    sxD(px, py, 3, m1);
    sxD(px, py, 1, b1);
    sxR(px - 3, py - 6, 1, 1, c1);
    for (let i = 0; i < 4; i++) {
      const an = u * 10 + i * 1.5708;
      sxR(px + Math.cos(an) * 9, py + Math.sin(an) * 9, 1, 1, i % 2 ? leaf : ice ? c1 : b1);
      sxR(px + Math.cos(an) * 12, py + Math.sin(an) * 12, 1, 1, leaf);
    }
  },
  slash(c) {
    const { px, py, a, u } = c,
      [d1, m1, b1, c1] = c.p,
      ca = Math.cos(a),
      sa = Math.sin(a);
    for (let i = 0; i < 9; i++) {
      const yy = (sxH(i) - 0.5) * 36,
        len = 5 + sxH(i + 3) * 10,
        xx = -10 - ((u * 90 + sxH(i + 9) * 30) % 30);
      for (let j = 0; j < len; j += 3) sxR(px + ca * (xx - j) - sa * yy, py + sa * (xx - j) + ca * yy, 1, 1, i % 2 ? m1 : b1);
    }
    for (let t = -1.25; t <= 1.25; t += 0.1) {
      const ox = Math.cos(t) * 14,
        oy = Math.sin(t) * 20,
        ix = ox - 11 * (1 - Math.abs(t) / 1.4);
      for (const [lx, col] of [[ox, c1], [(ox + ix) / 2, b1], [ix, m1]]) sxR(px + ca * lx - sa * oy, py + sa * lx + ca * oy, 1, 1, col);
    }
  },
  boulder(c) {
    const { px, py, u } = c,
      [d1, m1, b1, c1] = c.p,
      hop = Math.abs(Math.sin(u * 12)) * 7,
      g = sxC();
    g.globalAlpha = 0.4;
    sxE(px, py + 9, 5, 2, "#000");
    for (let i = 1; i <= 6; i++) {
      g.globalAlpha = Math.max(0, 0.6 - i * 0.09);
      sxD(px - c.dx * i * 8, py + 7 - Math.abs(Math.sin(u * 12 - i)) * 3, Math.max(1, 3 - (i >> 1)), b1);
    }
    g.globalAlpha = 1;
    sxD(px, py - hop, 6, d1);
    sxD(px, py - hop, 5, m1);
    sxD(px - 3, py - hop - 3, 2, b1);
    for (let j = 0; j < 3; j++) {
      const an = u * 11 + j * 2.1;
      sxR(px + Math.cos(an) * 8, py - hop + Math.sin(an) * 8, 1, 1, c1);
    }
    sxR(px + 3, py - hop + 3, 2, 1, d1);
  },
  shade(c) {
    const { px, py, a, u } = c,
      [d1, m1, b1, c1] = c.p,
      ca = Math.cos(a),
      sa = Math.sin(a),
      g = sxC();
    for (let i = 4; i >= 1; i--) {
      g.globalAlpha = 0.5 - i * 0.1;
      sxD(px - ca * i * 11, py - sa * i * 11 + Math.sin(u * 7 - i * 0.8) * 4, Math.max(1, 5 - i), m1);
    }
    g.globalAlpha = 1;
    for (let i = 0; i < 10; i++) sxR(px - ca * (18 + sxH(i) * 40) - sa * (sxH(i + 3) - 0.5) * 18, py - sa * (18 + sxH(i) * 40) + ca * (sxH(i + 3) - 0.5) * 18 + Math.sin(u * 9 + i) * 2, 1, 1, sxH(i) > 0.5 ? m1 : d1);
    sxD(px, py, 7, d1);
    sxD(px, py, 6, "#0a0414");
    sxR(px - 9, py - 3, 6, 3, c1);
    sxR(px - 6, py - 3, 3, 3, b1);
    sxR(px - 6 + Math.round(ca * 1.2) * 3, py - 3, 1, 3, "#0a0414");
  },
  meteor(c) {
    const { px, py, u } = c,
      p0 = c.p0,
      [d1, m1, b1, c1] = c.p,
      k = p0 ? cl(u / p0.l0, 0, 1) : c.k,
      H = (q) => Math.sin(q * Math.PI) * 150 + q * 0,
      g = sxC(),
      tx = p0 ? p0.tx : px,
      ty = p0 ? p0.ty : py;
    // marca del punto de impacto en el suelo
    g.globalAlpha = 0.35 + 0.25 * Math.sin(u * 14);
    sxRing(tx, ty, 14 + (1 - k) * 18, m1, 1);
    g.globalAlpha = 0.5;
    sxE(tx, ty, 6, 3, d1);
    g.globalAlpha = 1;
    const sx0 = p0 ? p0.sx : px,
      sy0 = p0 ? p0.sy : py;
    for (let i = 0; i < 20; i++) {
      const q = Math.max(0, k - i * 0.022),
        hx = sx0 + (tx - sx0) * q + (sxH(i) - 0.5) * 8,
        hy = sy0 + (ty - sy0) * q - H(q) + (sxH(i + 3) - 0.5) * 8;
      sxR(hx, hy, i < 5 ? 2 : 1, i < 5 ? 2 : 1, i < 4 ? b1 : i < 11 ? m1 : "#7a1d0c");
    }
    // sombra bajo el meteoro y roca ardiente
    g.globalAlpha = 0.4;
    sxE(px, py, 5 - Math.round(H(k) / 60), 2, "#000");
    g.globalAlpha = 1;
    const hy2 = py - H(k);
    sxD(px, hy2, 9, "#7a1d0c");
    sxD(px, hy2, 8, d1);
    sxD(px, hy2, 6, "#7a5a40");
    sxD(px - 3, hy2 - 3, 3, "#a07850");
    sxR(px - 6, hy2 - 6, 2, 1, b1);
    sxR(px + 3, hy2 + 3, 2, 1, m1);
    sxR(px - 3, hy2 + 3, 1, 1, c1);
  },
  ribbon(c) {
    const { px, py, a, u } = c,
      [d1, m1, b1, c1] = c.p,
      ca = Math.cos(a),
      sa = Math.sin(a),
      CL = ["#5cffb0", m1, "#ff8ad0"],
      n = Math.round(40 * sxQ());
    for (let k = 0; k < 3; k++)
      for (let i = 0; i < n; i++) {
        const q = i / n,
          o = Math.sin(q * 11 - u * 12 + k * 1.3) * (3 + q * 9) + (k - 1) * 7;
        sxR(px - ca * (q * 96) - sa * o, py - sa * (q * 96) + ca * o, i < n * 0.5 ? 2 : 1, i < n * 0.5 ? 2 : 1, i < 5 ? c1 : CL[k]);
      }
    sxD(px, py, 6, d1);
    sxD(px, py, 5, m1);
    sxD(px, py, 3, b1);
    sxD(px, py, 1, c1);
  },
  leech(c) {
    const { px, py, a, u } = c,
      [d1, m1, b1, c1] = c.p,
      ca = Math.cos(a),
      sa = Math.sin(a);
    for (let i = 0; i < 26; i++) {
      const q = i / 26,
        o = Math.sin(q * 10 - u * 14) * (2 + q * 5),
        qx = px - ca * q * 80 - sa * o,
        qy = py - sa * q * 80 + ca * o;
      sxR(qx, qy, 1, 1, i % 2 ? m1 : "#2f7a2a");
      if (i % 4 == 2) sxR(qx - sa * 4, qy + ca * 4, 1, 1, b1);
    }
    sxD(px, py, 5, d1);
    sxD(px, py, 4, m1);
    sxD(px, py, 2, b1);
    sxD(px, py, 1, c1);
    for (let i = 0; i < 4; i++) sxR(px + Math.cos(u * 6 + i * 1.57) * 12, py + Math.sin(u * 6 + i * 1.57) * 12, 2, 2, b1);
  },
  plague(c) {
    const { px, py, a, u } = c,
      [d1, m1, b1, c1] = c.p,
      ca = Math.cos(a),
      sa = Math.sin(a);
    for (let i = 0; i < 8; i++) {
      const t = (u * 2 + i * 0.13) % 1;
      sxR(px - ca * t * 55 - sa * Math.sin(i * 3 + u * 6) * 8, py - sa * t * 55 + ca * Math.sin(i * 3 + u * 6) * 8, 1, 1, i % 2 ? b1 : "#7ed957");
    }
    const pl = 5 + (Math.sin(u * 14) > 0 ? 1 : 0);
    sxD(px, py, pl, d1);
    sxD(px, py, pl - 1, m1);
    sxD(px, py, 2, "#9acd32");
    sxR(px - 1, py - 1, 1, 1, c1);
    for (let i = 0; i < 4; i++) sxR(px + Math.cos(u * 9 + i * 1.57) * 11, py + Math.sin(u * 9 + i * 1.57) * 11, 1, 1, i % 2 ? "#7ed957" : "#d3304a");
  },
  cloud(c) {
    const { px, py, a, u } = c,
      [d1, m1, b1, c1] = c.p,
      ca = Math.cos(a),
      sa = Math.sin(a),
      g = sxC(),
      gr = Math.min(1, u / 1.3),
      bl = (qx, qy, r, al) => {
        g.globalAlpha = Math.max(0, al);
        for (let i = 0; i < 5; i++) sxD(qx + Math.cos(i * 1.26 + u * 4) * r * 0.7, qy + Math.sin(i * 1.26 + u * 4) * r * 0.55, Math.round(r * 0.55) + 1, d1);
        sxD(qx, qy, Math.round(r * 0.7) + 1, m1);
        sxD(qx - r * 0.2, qy - r * 0.2, Math.max(1, Math.round(r * 0.3)), b1);
        g.globalAlpha = 1;
      };
    for (let i = 5; i >= 1; i--) bl(px - ca * i * 18 - sa * Math.sin(i + u * 3) * 5, py - sa * i * 18 + ca * Math.sin(i + u * 3) * 5, 3 + gr * 4 - i * 0.4, 0.55 - i * 0.08);
    bl(px, py, 4 + gr * 5, 1);
    for (let i = 0; i < 5; i++) sxS(px + Math.cos(i * 1.9 + u * 8) * (14 + gr * 8), py + Math.sin(i * 1.9 + u * 8) * (14 + gr * 8), c1, 0);
  },
};

// ---------------- impactos (u: 0..0.5 s) ----------------
const SHI_STYLE = { comet: "burst", freeze: "shards", wave: "splash", seed: "petals", slash: "xslash", boulder: "dust", shade: "implode", ribbon: "star", leech: "puff", plague: "puff", cloud: "puff", meteor: "burst", beam: "star" };
const SHI = {
  burst(c, k) {
    const [d1, m1, b1, c1] = c.p;
    sxA(1 - k * 0.6);
    sxD(c.px, c.py, Math.round(2 + k * 9), m1);
    sxD(c.px, c.py, Math.round(1 + k * 6), b1);
    sxD(c.px, c.py, Math.round(k * 3), c1);
    for (let i = 0; i < 10; i++) sxR(c.px + Math.cos(i * 0.628 + sxH(i)) * k * 38, c.py + Math.sin(i * 0.628 + sxH(i)) * k * 38 - Math.sin(k * 3) * 6, 1, 1, i % 2 ? b1 : d1);
  },
  shards(c, k) {
    const [d1, m1, b1, c1] = c.p;
    sxA(1 - k * 0.7);
    sxRing(c.px, c.py, k * 26, b1, 1);
    for (let i = 0; i < 10; i++) {
      const an = i * 0.628 + sxH(i),
        r = k * (14 + sxH(i + 2) * 30);
      sxS(c.px + Math.cos(an) * r, c.py + Math.sin(an) * r + k * k * 14, i % 2 ? c1 : b1, 1);
    }
  },
  splash(c, k) {
    const [d1, m1, b1, c1] = c.p;
    sxA(1 - k);
    sxRing(c.px, c.py, 4 + k * 24, b1, 1);
    sxRing(c.px, c.py, 2 + k * 14, c1, 1);
    for (let i = 0; i < 9; i++) {
      const an = i * 0.7 + sxH(i),
        r = k * (12 + sxH(i + 3) * 24);
      sxR(c.px + Math.cos(an) * r, c.py + Math.sin(an) * r - Math.sin(k * 3.14) * 14, 1, 1, i % 2 ? b1 : m1);
    }
  },
  petals(c, k) {
    const [d1, m1, b1, c1] = c.p;
    sxA(1 - k * 0.8);
    for (let i = 0; i < 10; i++) {
      const an = i * 0.628 + k * 2,
        r = k * (10 + sxH(i) * 28);
      sxR(c.px + Math.cos(an) * r, c.py + Math.sin(an) * r - k * 10, 1, 1, i % 3 == 0 ? b1 : i % 3 == 1 ? m1 : "#ff9ac8");
    }
  },
  xslash(c, k) {
    const [d1, m1, b1, c1] = c.p,
      l = 6 + k * 24;
    sxA(1 - k);
    sxL(c.px - l, c.py - l, c.px + l, c.py + l, c1, 1);
    sxL(c.px - l, c.py + l, c.px + l, c.py - l, b1, 1);
    for (let i = 0; i < 8; i++) sxR(c.px + Math.cos(i * 0.785) * k * 32, c.py + Math.sin(i * 0.785) * k * 32, 1, 1, m1);
  },
  dust(c, k) {
    const [d1, m1, b1, c1] = c.p;
    sxA(1 - k);
    for (let i = 0; i < 8; i++) sxD(c.px + Math.cos(i * 0.785) * k * 24, c.py + 4 + Math.sin(i * 0.785) * k * 8, 2, i % 2 ? b1 : m1);
    for (let i = 0; i < 7; i++) sxR(c.px + Math.cos(i * 0.9) * k * 26, c.py - Math.sin(k * 3.14) * (8 + sxH(i) * 16), 1, 1, i % 2 ? d1 : m1);
  },
  implode(c, k) {
    const [d1, m1, b1, c1] = c.p;
    sxA(1 - k * 0.5);
    sxD(c.px, c.py, Math.max(1, Math.round((1 - k) * 6 + 1)), "#0a0414");
    for (let s = 0; s < 6; s++) {
      const ag = s * 1.05 + 0.4;
      for (let j = 0; j < 14 * Math.min(1, k * 3); j++) {
        const an = ag + j * 0.08 * (s % 2 ? 1 : -1);
        sxR(c.px + Math.cos(an) * j * 1.6, c.py + Math.sin(an) * j * 1.6, j < 6 ? 2 : 1, j < 6 ? 2 : 1, j < 6 ? d1 : m1);
      }
    }
  },
  puff(c, k) {
    const [d1, m1, b1, c1] = c.p;
    sxA(1 - k * 0.8);
    for (let i = 0; i < 6; i++) sxD(c.px + Math.cos(i * 1.05) * k * 16, c.py + Math.sin(i * 1.05) * k * 12 - k * 8, 2 + Math.round(k * 2), i % 2 ? m1 : d1);
    sxD(c.px, c.py - k * 6, 2, b1);
  },
  star(c, k) {
    const [d1, m1, b1, c1] = c.p;
    sxA(1 - k);
    for (let i = 0; i < 8; i++) for (let s = 2; s < 4 + k * 8; s++) sxR(c.px + Math.cos(i * 0.785) * s * 3, c.py + Math.sin(i * 0.785) * s * 3, 1, 1, s < 4 ? c1 : i % 2 ? b1 : m1);
    sxD(c.px, c.py, 2, c1);
  },
};

function drawSpellProj(p) {
  const art = SPA[p.sv],
    g = sxC(),
    a = Math.atan2(p.vy, p.vx),
    fn = SBO[art.v] || SBO.comet;
  g.save();
  fn({ px: p.x, py: p.y, a, dx: Math.cos(a), u: p.l0 - p.l, k: (p.l0 - p.l) / p.l0, r: p.r, p: art.p, sh: art.sh, key: p.sv, p0: p });
  g.restore();
}

// ---------------- efectos sueltos (FX k:"sfx") ----------------
// v: hit · beam · cast · crater · jump  (sv = clave del hechizo)
function drawSpellFx(f) {
  const art = SPA[f.sv],
    g = sxC(),
    u = f.m - f.t,
    k = u / f.m,
    [d1, m1, b1, c1] = art.p;
  g.save();
  g.globalAlpha = 1;
  const c = { px: f.x, py: f.y, a: f.a || 0, p: art.p, sh: art.sh, key: f.sv };
  if (f.v == "hit") (SHI[SHI_STYLE[art.v] || "burst"] || SHI.burst)(c, k);
  else if (f.v == "beam") {
    const w = Math.sin(Math.min(1, u / 0.12) * 1.57) * (1 - k);
    sxA(0.3 * (1 - k));
    sxBeam(f.x, f.y, f.x2, f.y2, 3, m1);
    sxA(0.8 * (1 - k * 0.6));
    sxBeam(f.x, f.y, f.x2, f.y2, Math.round(1 + w * 1.5), b1);
    sxA(1 - k * 0.5);
    sxBeam(f.x, f.y, f.x2, f.y2, 0, c1);
    const l = Math.hypot(f.x2 - f.x, f.y2 - f.y);
    for (let i = 0; i < 14 * sxQ(); i++) {
      const t = (u * 2 + sxH(i)) % 1;
      sxS(f.x + (f.x2 - f.x) * t, f.y + (f.y2 - f.y) * t + (sxH(i + 5) - 0.5) * 18 * w, i % 2 ? c1 : b1, 1);
    }
    sxA(1 - k);
    for (let i = 0; i < 8; i++) for (let s = 2; s < 3 + w * 5; s++) sxR(f.x2 + Math.cos(i * 0.785) * s * 3, f.y2 + Math.sin(i * 0.785) * s * 3, 1, 1, s < 4 ? c1 : b1);
    sxD(f.x2, f.y2, Math.round(1 + w * 3), c1);
    sxD(f.x, f.y, Math.round(2 + w * 2), b1);
  } else if (f.v == "cast") {
    sxA(1 - k);
    sxRing(f.x, f.y, 6 + k * 22, b1, 1);
    for (let i = 0; i < 6; i++) sxS(f.x + Math.cos(i * 1.05 + k * 3) * (4 + k * 20), f.y + Math.sin(i * 1.05 + k * 3) * (4 + k * 20), i % 2 ? c1 : m1, art.sh);
  } else if (f.v == "crater") {
    const R = f.r;
    if (k < 0.3) {
      sxA(1 - k / 0.3);
      sxD(f.x, f.y, Math.round((1 - k / 0.3) * 11 + 2), b1);
      sxD(f.x, f.y, Math.round((1 - k / 0.3) * 7), c1);
    }
    sxA(k < 0.8 ? 0.55 : 0.55 * (1 - (k - 0.8) / 0.2));
    sxE(f.x, f.y + 2, Math.round((R * 0.55 * Math.min(1, k * 5)) / 3), Math.round((R * 0.3 * Math.min(1, k * 5)) / 3), "#1a0f0a");
    sxE(f.x, f.y + 2, Math.round((R * 0.3 * Math.min(1, k * 5)) / 3), Math.round((R * 0.16 * Math.min(1, k * 5)) / 3), "#ff6a13");
    sxA(1 - k);
    sxRing(f.x, f.y, k * R * 1.15, k < 0.5 ? b1 : m1, 2);
    sxRing(f.x, f.y, k * R * 0.95, d1, 1);
    for (let i = 0; i < 14; i++) {
      const an = i * 0.45 + sxH(i),
        r = k * (20 + sxH(i + 1) * R * 0.9);
      sxR(f.x + Math.cos(an) * r, f.y + Math.sin(an) * r * 0.8 - Math.sin(k * 3.14) * (14 + sxH(i + 2) * 40), i % 3 ? 1 : 2, i % 3 ? 1 : 2, i % 2 ? m1 : d1);
    }
  } else if (f.v == "jump") {
    sxA(Math.min(1, 2 - k * 2));
    for (let i = 0; i < 7; i++) {
      const q = Math.max(0, k - i * 0.05);
      sxR(f.x + (f.x2 - f.x) * q, f.y + (f.y2 - f.y) * q - Math.sin(q * 3.14) * 26, i < 2 ? 2 : 1, i < 2 ? 2 : 1, i % 2 ? b1 : "#7ed957");
    }
    sxD(f.x + (f.x2 - f.x) * k, f.y + (f.y2 - f.y) * k - Math.sin(k * 3.14) * 26, 2, m1);
  }
  g.restore();
}
