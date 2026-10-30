/* ======================================================================
 * src/js/render/spell-icons.js
 * Iconos de 96 px de los 55 hechizos (src/assets/spells/<clave con _>.png: fire.png, fire_ice.png...), para el
 * HUD del lienzo, el grimorio y los botones táctiles. El build los incrusta como data-URI.
 *
 * Define:
 * SPELL_ICON_DATA, SPI, spellIconsLoad, spIconURL, spIcon
 * ====================================================================== */

const SPELL_ICON_DATA = /*__SPELL_ICONS__*/ {};
const SPI = {};
/** (Re)crea las imágenes a partir de SPELL_ICON_DATA (en el modo sin build se llama tras rellenarlo con rutas). */
function spellIconsLoad() {
  for (const k in SPELL_ICON_DATA) {
    const im = new Image();
    im.src = SPELL_ICON_DATA[k];
    SPI[k] = im;
  }
}
spellIconsLoad();
const spIconURL = (key) => SPELL_ICON_DATA[SPA_ICON(key)] || "";
/** Dibuja el icono del hechizo `key` centrado en (cx,cy) con lado `size`; `w` permite un hueco ancho (pareja fundida). */
function spIcon(key, cx, cy, size, dim) {
  const im = SPI[SPA_ICON(key)];
  if (!im || !im.complete || !im.naturalWidth) return false;
  x.save();
  x.imageSmoothingEnabled = false;
  if (dim) x.globalAlpha *= 0.4;
  x.drawImage(im, Math.round(cx - size / 2), Math.round(cy - size / 2), Math.round(size), Math.round(size));
  x.restore();
  return true;
}
