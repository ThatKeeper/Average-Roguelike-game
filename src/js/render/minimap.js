/* ======================================================================
 * src/js/render/minimap.js
 * Mapa de salas con marco: minimapa que se desplaza siguiendo al jugador (las salas lejanas
 * quedan fuera del marco y se ocultan) y mapa grande (tecla M) con todas las salas descubiertas.
 *
 * Colores: las salas completadas se ven en blanco; las descubiertas pero sin visitar, con el color de su
 * tipo; las salas especiales llevan una marca de color en el centro.
 *
 * Define:
 * MMC, MAPC, mapFrame, mapRooms, drawMap
 * ====================================================================== */

let MMC = null; // centro suavizado del minimapa, en coordenadas de cuadrícula de salas
const MAPC = {
    boss: "#f35",
    treasure: "#ca4",
    shrine: "#a7e",
    shop: "#5c8",
    elite: "#e83",
    start: "#888",
    combat: "#667",
    event: "#e66",
    puzzle: "#b9f",
  },
  MAP_MARK = ["boss", "elite", "treasure", "shrine", "shop", "event"],
  MAP_NAME = { boss: "Jefe", elite: "Élite", treasure: "Tesoro", shrine: "Santuario", shop: "Mercader", event: "Suceso" };

// Marco: fondo, viñeta que difumina los bordes (las salas lejanas se desvanecen) y borde con remaches.
function mapFrame(fx, fy, fw, fh, inner) {
  const b = G.bi;
  x.save();
  x.fillStyle = "#0b0a10";
  x.fillRect(fx - 6, fy - 6, fw + 12, fh + 12);
  x.fillStyle = "#14121bf0";
  x.fillRect(fx, fy, fw, fh);
  x.save();
  x.beginPath();
  x.rect(fx, fy, fw, fh);
  x.clip();
  inner();
  const f = Math.min(18, fh / 4),
    fade = (x0, y0, x1, y1, rx, ry, rw, rh) => {
      const g = x.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, "#14121b");
      g.addColorStop(1, "#14121b00");
      x.fillStyle = g;
      x.fillRect(rx, ry, rw, rh);
    };
  fade(fx, 0, fx + f, 0, fx, fy, f, fh);
  fade(fx + fw, 0, fx + fw - f, 0, fx + fw - f, fy, f, fh);
  fade(0, fy, 0, fy + f, fx, fy, fw, f);
  fade(0, fy + fh, 0, fy + fh - f, fx, fy + fh - f, fw, f);
  x.restore();
  x.strokeStyle = "#000";
  x.lineWidth = 2;
  x.strokeRect(fx - 5, fy - 5, fw + 10, fh + 10);
  x.strokeStyle = b[3];
  x.globalAlpha = 0.9;
  x.lineWidth = 2;
  x.strokeRect(fx - 2, fy - 2, fw + 4, fh + 4);
  x.globalAlpha = 1;
  x.strokeStyle = "#0009";
  x.lineWidth = 2;
  x.strokeRect(fx + 1, fy + 1, fw - 2, fh - 2);
  // remaches en las esquinas y placas en el centro de cada lado
  x.fillStyle = b[3];
  for (const [cx, cy] of [
    [fx - 5, fy - 5],
    [fx + fw - 1, fy - 5],
    [fx - 5, fy + fh - 1],
    [fx + fw - 1, fy + fh - 1],
  ]) {
    x.fillRect(cx, cy, 6, 6);
    x.fillStyle = "#000";
    x.fillRect(cx + 2, cy + 2, 2, 2);
    x.fillStyle = b[3];
  }
  x.fillRect(fx + fw / 2 - 10, fy - 5, 20, 4);
  x.fillRect(fx + fw / 2 - 10, fy + fh + 1, 20, 4);
  x.restore();
}

// Dibuja pasillos y salas. (cgx, cgy) es la sala que queda en el centro del marco.
function mapRooms(fx, fy, fw, fh, sz, gap, cgx, cgy) {
  const pitch = sz + gap,
    ox = fx + fw / 2 - sz / 2,
    oy = fy + fh / 2 - sz / 2,
    px = (r) => ox + (r.gx - cgx) * pitch,
    py = (r) => oy + (r.gy - cgy) * pitch,
    b = G.bi,
    pulse = 0.55 + 0.45 * Math.sin(Date.now() / 220);
  x.fillStyle = "#6c6a80";
  G.R.forEach((r, i) => {
    if (!G.seen[i]) return;
    for (const k in r.nb) {
      const j = r.nb[k];
      if (j < i || !G.seen[j]) continue;
      const q = G.R[j],
        ax = px(r) + sz / 2,
        ay = py(r) + sz / 2,
        bx = px(q) + sz / 2,
        by = py(q) + sz / 2;
      x.fillRect(Math.min(ax, bx) - 1.5, Math.min(ay, by) - 1.5, Math.abs(ax - bx) + 3, Math.abs(ay - by) + 3);
    }
  });
  G.R.forEach((r, i) => {
    if (!G.seen[i]) return;
    const rx = px(r),
      ry = py(r);
    if (rx + sz < fx || rx > fx + fw || ry + sz < fy || ry > fy + fh) return; // fuera del marco: oculta
    const here = i == G.cur,
      done = here || (G.vis && G.vis[i] && r.cl);
    x.fillStyle = done ? "#f1eff7" : MAPC[r.tp] || "#667";
    x.globalAlpha = done ? 1 : 0.6;
    x.fillRect(rx, ry, sz, sz);
    x.globalAlpha = 1;
    if (done && MAP_MARK.includes(r.tp)) {
      const m = Math.max(4, Math.round(sz * 0.4));
      x.fillStyle = r.used && r.tp != "boss" && r.tp != "shop" ? "#8a8898" : MAPC[r.tp];
      x.fillRect(rx + (sz - m) / 2, ry + (sz - m) / 2, m, m);
    }
    if (here) {
      x.strokeStyle = r.cl ? b[3] : "#f44";
      x.globalAlpha = pulse;
      x.lineWidth = 2;
      x.strokeRect(rx - 2, ry - 2, sz + 4, sz + 4);
      x.globalAlpha = 1;
    }
  });
}

function drawMap() {
  if (!G.R || G.cur === undefined) return;
  const cur = G.R[G.cur];
  if (!MMC || MMC.R !== G.R) MMC = { R: G.R, x: cur.gx, y: cur.gy, t: performance.now() };
  const now = performance.now(),
    k = 1 - Math.exp(-Math.min(0.1, (now - MMC.t) / 1000) * 9);
  MMC.t = now;
  MMC.x += (cur.gx - MMC.x) * k;
  MMC.y += (cur.gy - MMC.y) * k;
  if (!bigmap) {
    const fw = 156,
      fh = 108,
      fx = W - fw - 16,
      fy = TOUCH ? 62 : 16; // con controles táctiles, bajo la fila de botones superiores
    mapFrame(fx, fy, fw, fh, () => mapRooms(fx, fy, fw, fh, 14, 4, MMC.x, MMC.y));
    return;
  }
  // mapa grande: todas las salas descubiertas, centradas en el marco
  let x0 = 1e9,
    x1 = -1e9,
    y0 = 1e9,
    y1 = -1e9;
  G.R.forEach((r, i) => {
    if (!G.seen[i]) return;
    x0 = Math.min(x0, r.gx);
    x1 = Math.max(x1, r.gx);
    y0 = Math.min(y0, r.gy);
    y1 = Math.max(y1, r.gy);
  });
  const cols = x1 - x0 + 1,
    rows = y1 - y0 + 1,
    pitch = Math.max(22, Math.min(44, 460 / cols, 260 / rows)),
    sz = Math.round(pitch * 0.78),
    fw = Math.round(Math.max(340, Math.min(600, cols * pitch + 120))),
    fh = Math.round(Math.max(220, Math.min(360, rows * pitch + 100))),
    fx = Math.round((W - fw) / 2),
    fy = Math.round((H - fh) / 2) - 10;
  x.save();
  x.fillStyle = "#000a";
  x.fillRect(0, 0, W, H);
  mapFrame(fx, fy, fw, fh, () => mapRooms(fx, fy, fw, fh, sz, Math.round(pitch - sz), (x0 + x1) / 2, (y0 + y1) / 2));
  x.textAlign = "center";
  x.fillStyle = "#fff";
  x.font = "bold 18px Georgia";
  {
    // piso actual con su icono (ya no se muestra junto a las barras)
    const el = EBI[(G.d - 1) % 8],
      t = `${G.bi[0]} · Profundidad ${G.d}${el ? " · daño de " + EL_DMG[el] : ""}`,
      tw = x.measureText(t).width;
    if (hIcon("stairs", W / 2 - tw / 2 - 16, fy - 28, 28)) {
      x.textAlign = "left";
      x.fillText(t, W / 2 - tw / 2 + 4, fy - 22);
      x.textAlign = "center";
    } else x.fillText(t, W / 2, fy - 22);
  }
  // leyenda
  const items = [["Completada", "#f1eff7"], ["Sin visitar", "#667"]].concat(MAP_MARK.map((t) => [MAP_NAME[t], MAPC[t]]));
  x.font = "12px Georgia";
  x.textAlign = "left";
  const wd = items.map((q) => 20 + x.measureText(q[0]).width + 14),
    tot = wd.reduce((a, c) => a + c, 0);
  let lx = (W - tot) / 2 + 4;
  items.forEach((q, n) => {
    x.fillStyle = q[1];
    x.fillRect(lx, fy + fh + 18, 10, 10);
    x.fillStyle = "#ddd";
    x.fillText(q[0], lx + 16, fy + fh + 27);
    lx += wd[n];
  });
  x.restore();
}
