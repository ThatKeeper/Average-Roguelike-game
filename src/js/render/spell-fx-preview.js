/* ======================================================================
 * src/js/render/spell-fx-preview.js
 * Vista previa animada de un hechizo en un lienzo propio (grimorio): usa exactamente los mismos
 * renderizadores que el juego, sobre un escenario con un mago y unos blancos.
 *
 * Define:
 * spPreview
 * ====================================================================== */

function spPreview(cv2, key, t) {
  const g = cv2.getContext("2d"),
    art = SPA[key],
    c = CB[key],
    f = c.f,
    S = cv2.width / 420,
    cy = 150;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, cv2.width, cv2.height);
  g.fillStyle = "#0d0a14";
  g.fillRect(0, 0, cv2.width, cv2.height);
  g.scale(S, S);
  const gr = g.createRadialGradient(210, 150, 10, 210, 150, 220);
  gr.addColorStop(0, art.p[1] + "33");
  gr.addColorStop(1, "#0d0a1400");
  g.fillStyle = gr;
  g.fillRect(0, 0, 420, 300);
  SFX_C = g;
  try {
    const dummy = (dx, dy, hot) => {
      g.fillStyle = hot ? "#c9b8d8" : "#7a6a88";
      g.fillRect(dx - 6, dy - 9, 12, 14);
      g.fillStyle = hot ? "#fff" : "#c9b8d8";
      g.fillRect(dx - 6, dy - 12, 12, 4);
    };
    // mago
    g.fillStyle = "#3d4c8c";
    g.fillRect(36, cy - 14, 16, 24);
    g.fillStyle = "#8ea4f4";
    g.fillRect(36, cy + 6, 16, 4);
    g.fillStyle = "#f2c14e";
    g.fillRect(40, cy - 22, 8, 8);
    const hot = Math.floor(t * 6) % 2 == 0;
    if (f == "bolt") {
      if (c.beam) {
        const u = t % 1.4;
        [[230, cy], [300, cy - 18], [360, cy + 14]].forEach((d) => dummy(d[0], d[1], u < 0.3));
        if (u < 0.45) drawSpellFx({ v: "beam", sv: key, x: 70, y: cy, x2: 390, y2: cy, t: 0.45 - u, m: 0.45 });
      } else if (c.lob) {
        const T = 1.1,
          u = t % 2.4;
        dummy(340, cy + 14, u > T && u < T + 0.4);
        if (u < T) drawSpellProj({ x: 70 + (340 - 70) * (u / T), y: cy + (cy + 14 - cy) * (u / T), vx: 1, vy: 0, l0: T, l: T - u, r: 8, sv: key, sx: 70, sy: cy, tx: 340, ty: cy + 14, lob: 1 });
        else drawSpellFx({ v: "crater", sv: key, x: 340, y: cy + 14, r: 105, t: Math.max(0.01, 1.1 - (u - T)), m: 1.1 });
      } else {
        const T = 1.3,
          u = t % 2.3,
          hx = 70 + 290 * Math.min(1, u / T);
        dummy(370, cy, u > T && u < T + 0.3);
        if (u < T) drawSpellProj({ x: hx, y: cy, vx: 1, vy: 0, l0: T, l: T - u, r: 8, sv: key });
        else {
          if (c.fz) drawSpellZone({ x: 360, y: cy, r: c.fz.r, t: Math.max(0.01, 2.2 - (u - T)), u: u - T, v: c.fz.v, key });
          drawSpellFx({ v: "hit", sv: key, x: 365, y: cy, a: 0, t: Math.max(0.01, 0.5 - (u - T)), m: 0.5 });
        }
      }
    } else if (f == "nova") {
      const u = t % 2.4,
        ctr = c.ground ? [250, cy + 6] : [44, cy];
      [[130, cy - 28], [190, cy + 18], [250, cy - 6], [150, cy + 36], [90, cy - 40]].forEach((d) => dummy(d[0], d[1], u > 0.3 && u < 0.7));
      drawSpellWave({ zk: "wave", f: "nova", x: c.ground ? 210 : 44 + 50, y: cy + 6, a: 0, r: c.ground ? 125 : 140, u: u, T: 0.45, key });
    } else if (f == "cone") {
      const u = t % 2.2;
      [[150, cy - 24], [210, cy + 6], [260, cy - 14], [200, cy + 36]].forEach((d) => dummy(d[0], d[1], u > 0.25 && u < 0.6));
      drawSpellWave({ zk: "wave", f: "cone", x: 58, y: cy + 4, a: 0, r: 290, u, T: 0.4, key });
    } else {
      const life = 3.6,
        u = t % (life + 0.4);
      [[190, cy - 20], [240, cy + 14], [215, cy + 40]].forEach((d) => dummy(d[0], d[1], Math.floor(u * 3) % 2 == 0));
      if (u < life) drawSpellZone({ x: 215, y: cy + 8, r: 100, t: life - u, u, v: art.v, key });
    }
  } finally {
    SFX_C = null;
  }
}
