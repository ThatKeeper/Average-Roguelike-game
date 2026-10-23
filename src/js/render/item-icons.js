/* ======================================================================
 * src/js/render/item-icons.js
 * Iconos de objetos: usa el sprite si existe y, si no, el emoji provisional.
 *
 * Armas: el sprite sale de MELEE_ART / RANGED_ART (en las de distancia, la
 * versión "cargada", que luce más como icono).
 * Resto de objetos (equipo, reliquias...): basta con dejar en
 * src/assets/sprites un PNG llamado <nombre del objeto en minúsculas, sin
 * tildes y con guiones bajos>_16x16.png (p. ej. yelmo_del_abismo_16x16.png)
 * y volver a ejecutar el build: el icono aparece solo, sin tocar código.
 *
 * Define:
 * slug, itemSprKey, iconImg, icoHTML, drawItemIcon
 * ====================================================================== */

const ICON_CACHE = {};

/** "Yelmo del Abismo" -> "yelmo_del_abismo" */
function slug(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** Clave del sprite de un objeto (o null si todavía no tiene). */
function itemSprKey(it) {
  if (!it || !it.n) return null;
  const m = MELEE_ART[it.n],
    r = RANGED_ART[it.n];
  if (m) return m.spr;
  if (r) return r.spr2;
  const k = slug(it.n);
  return WEAPON_SPRITE_DATA[k] ? k : null;
}

/** Imagen ya cargada para una clave de sprite, o null si aún no está lista. */
function iconImg(key) {
  const w = WSPR[key];
  if (w && w.ready) return w.img;
  const c = (ICON_CACHE[key] ||= (() => {
    const img = new Image();
    img.src = WEAPON_SPRITE_DATA[key] || "";
    return img;
  })());
  return c.complete && c.naturalWidth ? c : null;
}

/** HTML del icono para tarjetas y menús: <img> pixelado si hay sprite, emoji si no. */
function icoHTML(it, px = 48) {
  const k = itemSprKey(it);
  if (k && WEAPON_SPRITE_DATA[k])
    return `<img src="${WEAPON_SPRITE_DATA[k]}" alt="" style="width:${px}px;height:${px}px;image-rendering:pixelated;display:block">`;
  return `<div style="font-size:26px">${it.i || ""}</div>`;
}

/** Dibuja el icono en el canvas centrado en (cx, cy). Devuelve false si no hay sprite (usar emoji). */
function drawItemIcon(it, cx, cy, size) {
  const k = itemSprKey(it),
    img = k && iconImg(k);
  if (!img) return false;
  const sz = 16 * Math.max(1, Math.round(size / 16)); // escala entera: sin píxeles deformados
  x.save();
  x.imageSmoothingEnabled = false;
  x.drawImage(img, Math.round(cx - sz / 2), Math.round(cy - sz / 2), sz, sz);
  x.restore();
  return true;
}
