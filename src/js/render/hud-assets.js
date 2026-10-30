/* ======================================================================
 * src/js/render/hud-assets.js
 * Tilemap y sprites del HUD (marcos, barras, paneles, iconos de habilidades y pociones).
 *
 * Los PNG de src/assets/hud (hud_tilemap.png + hud_tilemap.json + icons/*.png) se incrustan en el
 * build (scripts/build.js sustituye el marcador de HUD_DATA). Se regeneran con
 * scripts/gen_hud_assets.py o se pueden retocar a mano: el juego solo lee los PNG.
 *
 * Define:
 * HUD_DATA, HUDA, hudLoad, hSlice, hNine, hIcon, hHas, hKey, hBar
 * ====================================================================== */

const HUD_DATA = /*__HUD_ASSETS__*/ {};
const HUDA = { atlas: null, icons: {} };
/** (Re)crea las imágenes a partir de HUD_DATA. El build la deja lista con data-URI; en el modo sin build
 *  (index.html de la raíz) se llama otra vez tras rellenar HUD_DATA con las rutas de src/assets/hud. */
function hudLoad() {
  const mkImg = (src) => {
    const im = new Image();
    im.src = src;
    return im;
  };
  if (HUD_DATA.atlas) HUDA.atlas = mkImg(HUD_DATA.atlas);
  for (const k in HUD_DATA.icons || {}) HUDA.icons[k] = mkImg(HUD_DATA.icons[k]);
}
hudLoad();
const hRdy = (im) => !!im && im.complete && im.naturalWidth > 0;
const hHas = (id) => hRdy(HUDA.icons[id]);

/** Dibuja un trozo del tilemap (rectángulo sx,sy,sw,sh de la pieza `name`) en destino (dx,dy,dw,dh). */
function hSlice(name, sx, sy, sw, sh, dx, dy, dw, dh) {
  const r = (HUD_DATA.map || {})[name];
  if (!r || !hRdy(HUDA.atlas)) return false;
  x.imageSmoothingEnabled = false;
  x.drawImage(HUDA.atlas, r[0] + sx, r[1] + sy, sw, sh, Math.round(dx), Math.round(dy), Math.round(dw), Math.round(dh));
  return true;
}
/** Marco de 9 casillas: las esquinas (c px del tilemap, ampliadas ×sc) no se deforman; bordes y centro se estiran. */
function hNine(name, px, py, w, h, sc = 2, c = 5) {
  const r = (HUD_DATA.map || {})[name];
  if (!r || !hRdy(HUDA.atlas)) return false;
  const e = c * sc,
    m = r[2] - 2 * c,
    mw = w - 2 * e,
    mh = h - 2 * e;
  hSlice(name, 0, 0, c, c, px, py, e, e);
  hSlice(name, c + m, 0, c, c, px + w - e, py, e, e);
  hSlice(name, 0, c + m, c, c, px, py + h - e, e, e);
  hSlice(name, c + m, c + m, c, c, px + w - e, py + h - e, e, e);
  hSlice(name, c, 0, m, c, px + e, py, mw, e);
  hSlice(name, c, c + m, m, c, px + e, py + h - e, mw, e);
  hSlice(name, 0, c, c, m, px, py + e, e, mh);
  hSlice(name, c + m, c, c, m, px + w - e, py + e, e, mh);
  hSlice(name, c, c, m, m, px + e, py + e, mw, mh);
  return true;
}
/** Icono (32x32) del HUD centrado en (cx,cy) escalado a `size`. Devuelve false si no existe. */
function hIcon(id, cx, cy, size, dim) {
  const im = HUDA.icons[id];
  if (!hRdy(im)) return false;
  const sz = Math.max(16, Math.round(size));
  x.save();
  x.imageSmoothingEnabled = true; // los iconos están dibujados a 32 px con suavizado
  x.imageSmoothingQuality = "high";
  if (dim) x.globalAlpha *= 0.4;
  x.drawImage(im, Math.round(cx - sz / 2), Math.round(cy - sz / 2), sz, sz);
  x.restore();
  return true;
}
/** Pieza suelta del tilemap (p. ej. iconos de barra o huecos de equipo) escalada de forma entera. */
function hPiece(name, cx, cy, sc = 1, dim) {
  const r = (HUD_DATA.map || {})[name];
  if (!r) return false;
  x.save();
  if (dim) x.globalAlpha *= 0.55;
  const ok = hSlice(name, 0, 0, r[2], r[3], cx - (r[2] * sc) / 2, cy - (r[3] * sc) / 2, r[2] * sc, r[3] * sc);
  x.restore();
  return ok;
}
/** Tapa de tecla (3 trozos) con texto; (px,py) = esquina superior izquierda. */
function hKey(t, px, py, dim) {
  x.save();
  x.font = "bold 10px Georgia";
  const w = Math.max(11, Math.round(x.measureText(t).width) + 6),
    n = dim ? "key_dim" : "key";
  hSlice(n, 0, 0, 3, 11, px, py, 3, 11);
  hSlice(n, 3, 0, 2, 11, px + 3, py, w - 6, 11);
  hSlice(n, 5, 0, 3, 11, px + w - 3, py, 3, 11);
  x.fillStyle = "#1a1020";
  x.textAlign = "center";
  x.fillText(t, px + w / 2, py + 9);
  x.restore();
  return w;
}
/** Barra con marco del tilemap: (px,py) esquina, w ancho total, v 0..1, fill = "hp" | "mp" | "xp" | "sh". */
function hBar(px, py, w, v, fill) {
  hSlice("bar_l", 0, 0, 8, 16, px, py, 8, 16);
  hSlice("bar_m", 0, 0, 8, 16, px + 8, py, w - 16, 16);
  hSlice("bar_r", 0, 0, 8, 16, px + w - 8, py, 8, 16);
  const iw = w - 8,
    fw = Math.round(iw * cl(v, 0, 1));
  if (fw > 0) hSlice("fill_" + fill, 0, 3, 8, 10, px + 4, py + 3, fw, 10);
}
