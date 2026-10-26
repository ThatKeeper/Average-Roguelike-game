/* ======================================================================
 * src/js/render/tiles.js
 * Tilemaps y tilesets de las salas: cuadrícula de tiles por sala, puertas con estado
 * (cerrada / abierta / oculta) y objetos del centro (cofre, santuario, mercader).
 *
 * Define:
 * WORLD_ASSETS, TILE, roomGrid, bakeRoom, drawRoomBase, doorKind, drawDoors, drawProp
 *
 * Convenciones (ver src/assets/world/tilemap_biomas.json):
 *  - Tile de 16 px dibujado a 40 px (TS). Sala = 24x15 tiles = 960x600.
 *  - Orden del tileset: terreno, decoración 1-3, obstáculo, agujero, pared, puerta.
 *  - Puertas dibujadas para la pared superior; se rotan para las demás paredes.
 *  - Hoja de puertas: filas = normal, tesoro, secreta, mercader, santuario/suceso, jefe;
 *    columnas = cerrada, abierta, oculta (solo la fila secreta).
 * ====================================================================== */

const WORLD_ASSETS = /*__WORLD_ASSETS__*/ {};
const TILE = { FLOOR: 0, OBS: 4, PIT: 5, WALL: 6, DOOR: 7 };

// ---- carga de imágenes (data-URI incrustados por scripts/build.js) ----
const WIMG = {};
function wImg(src) {
  if (!src) return null;
  if (!WIMG[src]) {
    const im = new Image();
    im.src = src;
    WIMG[src] = im;
  }
  return WIMG[src];
}
const wReady = (im) => !!im && im.complete && im.naturalWidth > 0;
[].concat(WORLD_ASSETS.ts || [], WORLD_ASSETS.d2 || [], WORLD_ASSETS.d3 || [], Object.values(WORLD_ASSETS.pr || {})).forEach(wImg);

const biomeIdx = () => Math.max(0, BI.indexOf(G.bi));

// ---- cuadrícula de la sala ----
// Casillas de las puertas: arriba/abajo 2 tiles (centradas en x=480), izquierda/derecha 3 tiles (centradas en y=300).
const DOOR_CELLS = [
  [[11, 0], [12, 0]],
  [[GW - 1, 6], [GW - 1, 7], [GW - 1, 8]],
  [[11, GH - 1], [12, GH - 1]],
  [[0, 6], [0, 7], [0, 8]],
];
// Centro (px) de cada puerta y giro que hay que aplicar al dibujo de la pared superior.
const DOOR_POS = [
  [480, TS / 2, 0],
  [GW * TS - TS / 2, 300, Math.PI / 2],
  [480, GH * TS - TS / 2, Math.PI],
  [TS / 2, 300, -Math.PI / 2],
];

function roomGrid(r) {
  const g = [];
  for (let j = 0; j < GH; j++) g.push(new Array(GW).fill(TILE.FLOOR));
  for (let i = 0; i < GW; i++) g[0][i] = g[GH - 1][i] = TILE.WALL;
  for (let j = 0; j < GH; j++) g[j][0] = g[j][GW - 1] = TILE.WALL;
  for (const k in r.nb) for (const [i, j] of DOOR_CELLS[k]) g[j][i] = TILE.DOOR;
  const near = []; // casillas sin decoración: centro de la sala y entrada de cada puerta
  for (let j = 6; j <= 8; j++) for (let i = 10; i <= 13; i++) near.push(i + "," + j);
  for (let k = 0; k < 4; k++)
    for (const [i, j] of DOOR_CELLS[k]) {
      const di = i == 0 ? 1 : i == GW - 1 ? -1 : 0,
        dj = j == 0 ? 1 : j == GH - 1 ? -1 : 0;
      near.push(i + di + "," + (j + dj), i + 2 * di + "," + (j + 2 * dj));
    }
  for (const b of r.obs || [])
    for (let j = Math.floor(b.y / TS); j < Math.ceil((b.y + b.h) / TS); j++)
      for (let i = Math.floor(b.x / TS); i < Math.ceil((b.x + b.w) / TS); i++)
        if (g[j] && g[j][i] === TILE.FLOOR) g[j][i] = b.pit ? TILE.PIT : TILE.OBS;
  const idx = G.R ? G.R.indexOf(r) : 0,
    rr = rngS(G.seed + G.d * 7919 + idx * 131 + 77);
  for (let j = 1; j < GH - 1; j++)
    for (let i = 1; i < GW - 1; i++) {
      const q = rr();
      if (g[j][i] !== TILE.FLOOR || near.includes(i + "," + j)) continue;
      const dn = r.dens ?? 0.15; // densidad de decoración (las salas del hub usan menos para que los textos se lean)
      if (q < dn) g[j][i] = 1 + Math.floor((q / dn) * 3); // decoración 1, 2 o 3
    }
  return g;
}

// ---- sala "horneada": suelo, decoración, obstáculos, hoyos y muros en un canvas de 960x600 ----
const RCACHE = [];
function bakeRoom(r) {
  const b = biomeIdx(),
    sig = b + ":" + (r.obs ? r.obs.length : 0) + ":" + Object.keys(r.nb).join("");
  if (r.tc && r.tc.sig === sig) return r.tc.cv;
  const ts = wImg(WORLD_ASSETS.ts && WORLD_ASSETS.ts[b]);
  if (!wReady(ts)) return null;
  const cv2 = (r.tc && r.tc.cv) || document.createElement("canvas");
  cv2.width = W;
  cv2.height = H;
  const c = cv2.getContext("2d"),
    g = roomGrid(r);
  c.imageSmoothingEnabled = false;
  for (let j = 0; j < GH; j++)
    for (let i = 0; i < GW; i++) {
      let t = g[j][i];
      if (t === TILE.DOOR) t = TILE.WALL; // bajo la puerta va muro; la puerta se dibuja aparte (drawDoors)
      c.drawImage(ts, t * 16, 0, 16, 16, i * TS, j * TS, TS, TS);
    }
  // sombra suave del muro sobre el suelo
  const sh = c.createLinearGradient(0, TS, 0, TS + 14);
  sh.addColorStop(0, "rgba(0,0,0,.35)");
  sh.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = sh;
  c.fillRect(TS, TS, W - 2 * TS, 14);
  const sh2 = c.createLinearGradient(TS, 0, TS + 12, 0);
  sh2.addColorStop(0, "rgba(0,0,0,.28)");
  sh2.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = sh2;
  c.fillRect(TS, TS, 12, H - 2 * TS);
  r.tc = { cv: cv2, sig };
  if (!RCACHE.includes(r)) RCACHE.push(r);
  while (RCACHE.length > 4) delete RCACHE.shift().tc; // memoria: solo se conservan las últimas salas
  return cv2;
}

// Alternativa (solo mientras cargan las imágenes): dibujo plano con los colores del bioma.
function drawRoomFlat(r) {
  const b = G.bi;
  x.fillStyle = b[1];
  x.fillRect(0, 0, W, H);
  x.fillStyle = b[2];
  x.fillRect(RB.x0, RB.y0, RB.x1 - RB.x0, RB.y1 - RB.y0);
  for (const o of r.obs) {
    if (o.pit) {
      pitDraw(o);
      continue;
    }
    x.fillStyle = b[1];
    x.fillRect(o.x, o.y, o.w, o.h);
    x.strokeStyle = b[3];
    x.lineWidth = 2;
    x.strokeRect(o.x, o.y, o.w, o.h);
  }
}
function drawRoomBase(r) {
  const c = bakeRoom(r);
  if (c) x.drawImage(c, 0, 0);
  else drawRoomFlat(r);
}

// ---- puertas ----
// Tipo de puerta según la sala de destino.
function doorKind(r, k) {
  const n = G.R[r.nb[k]];
  if (n.sec) return 2;
  return { treasure: 1, shop: 3, shrine: 4, event: 4, boss: 5 }[n.tp] || 0;
}
let DW_T = 0;
function drawDoors(r) {
  const now = performance.now(),
    dd = Math.min(0.1, DW_T ? (now - DW_T) / 1000 : 0);
  DW_T = now;
  const tgt = r.cl ? 1 : 0;
  if (r.dop === undefined) r.dop = tgt;
  else {
    if (r.dcl === 0 && r.cl) snd(196, 0.3, "triangle", 0.05); // al limpiar la sala suenan las puertas
    r.dop += (tgt - r.dop) * Math.min(1, dd * 7);
    if (Math.abs(tgt - r.dop) < 0.01) r.dop = tgt;
  }
  r.dcl = r.cl ? 1 : 0;
  const b = biomeIdx(),
    d2 = wImg(WORLD_ASSETS.d2 && WORLD_ASSETS.d2[b]),
    d3 = wImg(WORLD_ASSETS.d3 && WORLD_ASSETS.d3[b]);
  x.save();
  x.imageSmoothingEnabled = false;
  for (const k in r.nb) {
    const wide = k % 2 ? 3 : 2,
      sheet = wide == 3 ? d3 : d2,
      row = doorKind(r, k),
      [cx, cy, rot] = DOOR_POS[k],
      cw = wide * 16,
      dw = wide * TS;
    if (!wReady(sheet)) {
      // sin imágenes todavía: rectángulo simple
      x.fillStyle = r.cl ? G.bi[3] : "#922";
      const hv = k % 2;
      x.fillRect(cx - (hv ? 14 : dw / 2), cy - (hv ? dw / 2 : 14), hv ? 28 : dw, hv ? dw : 28);
      continue;
    }
    x.save();
    x.translate(cx, cy);
    x.rotate(rot);
    const hidden = !doorVis(r, k);
    if (hidden) x.drawImage(sheet, 2 * cw, row * 16, cw, 16, -dw / 2, -TS / 2, dw, TS);
    else {
      x.drawImage(sheet, 0, row * 16, cw, 16, -dw / 2, -TS / 2, dw, TS); // cerrada
      if (r.dop > 0) {
        x.globalAlpha = r.dop;
        x.drawImage(sheet, cw, row * 16, cw, 16, -dw / 2, -TS / 2, dw, TS); // abierta
      }
    }
    x.restore();
  }
  x.restore();
}

// ---- objetos del centro de la sala ----
function drawProp(r, cx, cy) {
  const pr = WORLD_ASSETS.pr || {},
    key = r.tp == "treasure" ? (r.used ? "cofre_abierto" : "cofre_cerrado") : r.tp == "shop" ? "mercader" : "santuario",
    im = wImg(pr[key]);
  if (wReady(im)) {
    x.save();
    x.imageSmoothingEnabled = false;
    x.fillStyle = "#0006";
    x.beginPath();
    x.ellipse(cx, cy + 20, 20, 6, 0, 0, 7);
    x.fill();
    if (r.used && r.tp != "shop" && r.tp != "treasure") x.globalAlpha = 0.5;
    x.drawImage(im, cx - 24, cy - 28, 48, 48);
    x.restore();
  } else {
    x.fillStyle = r.tp == "treasure" ? "#c9a24a" : r.tp == "shrine" ? "#b07af0" : r.tp == "event" ? "#e66" : "#5c8";
    x.fillRect(cx - 16, cy - 12, 32, 24);
  }
  if (r.used && r.tp != "shop") return;
  x.fillStyle = "#fff";
  x.font = "12px Georgia";
  x.fillText({ treasure: "Cofre [F]", shrine: "Santuario [F]", shop: "Mercader [F]", event: "Suceso [F]" }[r.tp], cx, cy - 34);
}
