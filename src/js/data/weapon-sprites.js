/* ======================================================================
 * src/js/data/weapon-sprites.js
 * Sprites de las armas cuerpo a cuerpo y parámetros de su animación.
 *
 * Los PNG 16x16 de src/assets/sprites se incrustan en el build
 * (scripts/build.js reemplaza el marcador de WEAPON_SPRITE_DATA).
 * Todos los sprites apuntan en diagonal: empuñadura abajo-izquierda y
 * punta arriba-derecha. El "eje" del arma es esa diagonal; sobre él se miden:
 *   gu = posición de la mano (px del sprite, 0 = centro de la imagen)
 *   tu = posición de la punta
 *   s  = píxeles de pantalla por píxel de sprite (tamaño del arma)
 * El alcance real se calcula con s, así que el daño coincide con lo dibujado.
 *
 * También define los sprites de las armas a distancia (RANGED_ART, con su
 * versión "cargada" cuando está lista para disparar) y de los proyectiles
 * (PROJ_ART, todos apuntando a la derecha).
 *
 * Define:
 * WEAPON_SPRITE_DATA, SQ2, MELEE_ART, RANGED_ART, PROJ_ART, SPELL_SPR, WSPR, meleeArt,
 * spriteCircles, loadWeaponSprites
 * ====================================================================== */

const WEAPON_SPRITE_DATA = /*__WEAPON_SPRITES__*/ {};
const SQ2 = Math.SQRT2;

/*
 * Familias de movimiento:
 *   sweep  - tajo en arco (espadas, hachas, martillo)
 *   thrust - estocada larga en línea recta (lanza)
 *   jab    - puñalada rápida con un pequeño corte lateral (dagas)
 * Campos de animación (fracciones de la duración total `dur`):
 *   w = preparación (el arma se echa hacia atrás), r = recuperación
 *   back = radianes extra que se echa atrás antes de golpear
 *   lunge = cuánto se adelanta la mano al golpear · pull = dónde está la mano al prepararse
 *   idle = ángulo del arma en reposo · lat = desplazamiento lateral de la mano (estocadas)
 *   edge = lado del filo si el sprite es asimétrico (hacha) · shake = temblor de pantalla al impactar
 */
const MELEE_ART = {
  Espada: { spr: "espada", fam: "sweep", gu: -7, tu: 10, s: 3.5, dur: 0.22, w: 0.24, r: 0.22, back: 0.45, lunge: 4, pull: 7, idle: 0.85, trail: "#e8f2ff" },
  "Gran espada": { spr: "gran_espada", fam: "sweep", gu: -8, tu: 10.6, s: 4.3, dur: 0.34, w: 0.34, r: 0.24, back: 0.7, lunge: 6, pull: 4, idle: 0.85, trail: "#cfe3ff", shake: 3 },
  Hacha: { spr: "hacha", fam: "sweep", gu: -8, tu: 7.1, s: 4.1, dur: 0.27, w: 0.3, r: 0.22, back: 0.6, lunge: 5, pull: 5, idle: 0.85, edge: -1, trail: "#ffe2b8" },
  "Hachas dobles": { spr: "hachas_dobles", fam: "sweep", gu: -6, tu: 7.1, s: 2.8, dur: 0.13, w: 0.16, r: 0.22, back: 0.3, lunge: 3, pull: 7, idle: 0.85, trail: "#ffe2b8" },
  Martillo: { spr: "martillo", fam: "sweep", slam: 1, gu: -7, tu: 8, s: 3.6, dur: 0.42, w: 0.44, r: 0.26, back: 1.0, lunge: 8, pull: 2, idle: 0.9, trail: "#ffd9a0", shake: 6 },
  Lanza: { spr: "lanza", fam: "thrust", gu: -2, tu: 10.6, s: 4.4, dur: 0.26, w: 0.28, r: 0.3, pull: -6, idle: 0.3, lat: 3, trail: "#d8efff" },
  Dagas: { spr: "dagas", fam: "jab", gu: -5, tu: 7.8, s: 2.4, dur: 0.14, w: 0.2, r: 0.28, back: 0.25, jab: 0.55, pull: 3, idle: 0.5, lat: 5, trail: "#ffffff" },
  "Daga de la Hemorragia": { spr: "dagas_hemorragia", fam: "jab", gu: -5, tu: 7.8, s: 2.4, dur: 0.14, w: 0.2, r: 0.28, back: 0.25, jab: 0.55, pull: 3, idle: 0.5, lat: 5, trail: "#ff6a78" },
};

/*
 * Armas a distancia. spr = sprite en reposo/recargando, spr2 = sprite "cargado" (listo para
 * disparar: flecha puesta, báculo brillando...). rot = giro que alinea el sprite con su dirección
 * de disparo (π/4 si apunta arriba-derecha, π/2 si apunta arriba, 0 si es simétrico).
 * gu = punto de agarre sobre ese eje · tu = boca del arma (de aquí sale el proyectil)
 * s = tamaño · hd = distancia de la mano al centro del jugador · kick = retroceso al disparar
 * (negativo = el arma se adelanta, como al lanzar un hechizo) · proj = sprite del proyectil.
 */
const R_NE = Math.PI / 4,
  R_N = Math.PI / 2;
const RANGED_ART = {
  Arco: { spr: "arco", spr2: "arco_cargado", rot: R_NE, gu: 3.5, tu: 9, s: 2.6, hd: 14, kick: 5, proj: "flecha" },
  Ballesta: { spr: "ballesta", spr2: "ballesta_cargada", rot: R_NE, gu: -3, tu: 9.2, s: 2.4, hd: 12, kick: 7, proj: "virote" },
  "Arma rúnica": { spr: "arma_runica", spr2: "arma_runica_cargada", rot: R_N, gu: 0, tu: 7, s: 2.4, hd: 18, kick: 4, proj: "magia_runica", glow: "#7ff" },
  Chakram: { spr: "chakram", spr2: "chakram_cargado", rot: 0, gu: 0, tu: 0, s: 1.9, hd: 14, kick: 0, spin: 5, proj: "chakram", glow: "#fa4" },
  "Báculo arcano": { spr: "baculo_arcano", spr2: "baculo_arcano_cargado", rot: R_NE, gu: -4, tu: 5, s: 2.4, hd: 9, kick: -4, proj: "magia_arcana", glow: "#c8a0ff" },
  "Báculo ígneo": { spr: "baculo_igneo", spr2: "baculo_igneo_cargado", rot: R_NE, gu: -4, tu: 5, s: 2.4, hd: 9, kick: -4, proj: "magia_ignea", glow: "#ff8a30" },
  "Báculo helado": { spr: "baculo_helado", spr2: "baculo_helado_cargado", rot: R_NE, gu: -4, tu: 5, s: 2.4, hd: 9, kick: -4, proj: "magia_helada", glow: "#9fe8ff" },
  "Báculo de tormenta": { spr: "baculo_tormenta", spr2: "baculo_tormenta_cargado", rot: R_NE, gu: -4, tu: 5, s: 2.4, hd: 9, kick: -4, proj: "magia_tormenta", glow: "#fff27a" },
  "Báculo venenoso": { spr: "baculo_venenoso", spr2: "baculo_venenoso_cargado", rot: R_NE, gu: -4, tu: 5, s: 2.4, hd: 9, kick: -4, proj: "magia_venenosa", glow: "#7e4" },
  "Báculo de marea": { spr: "baculo_marea", spr2: "baculo_marea_cargado", rot: R_NE, gu: -4, tu: 5, s: 2.4, hd: 9, kick: -4, proj: "magia_marea", glow: "#4af" },
};

/*
 * Proyectiles. s = tamaño, r = radio de colisión de referencia (si el proyectil tiene otro radio
 * el sprite se escala en proporción), ax/ay = punto del sprite que coincide con la posición real
 * del proyectil (la punta de la flecha, el centro del orbe), spin = giro por segundo (chakram).
 */
const PROJ_ART = {
  flecha: { s: 2.6, r: 5, ax: 13, ay: 7.5 },
  flecha_cargada: { s: 2.6, r: 7, ax: 13, ay: 7 },
  virote: { s: 2.6, r: 5, ax: 13, ay: 7.5 },
  virote_cargado: { s: 2.6, r: 7, ax: 13, ay: 7 },
  magia_arcana: { s: 2.2, r: 7, ax: 9.5, ay: 7.5 },
  magia_ignea: { s: 2.2, r: 7, ax: 9, ay: 7.5 },
  magia_helada: { s: 2.2, r: 7, ax: 9, ay: 7 },
  magia_tormenta: { s: 2.2, r: 7, ax: 8, ay: 7.5 },
  magia_venenosa: { s: 2.2, r: 7, ax: 11, ay: 9 },
  magia_marea: { s: 2.2, r: 7, ax: 9, ay: 7.5 },
  magia_runica: { s: 2, r: 5, ax: 10.5, ay: 8 },
  chakram: { s: 1.9, r: 11, ax: 8, ay: 8, spin: 22 },
};

// Elemento de un hechizo de carta -> sprite de proyectil (los demás elementos siguen como orbe de color)
const SPELL_SPR = { fire: "magia_ignea", water: "magia_marea", ice: "magia_helada", light: "magia_tormenta", plant: "magia_venenosa", dark: "magia_arcana" };

// Registro de sprites cargados: clave -> { img, circ (círculos de colisión), ready }
const WSPR = {};
const ART_CACHE = {};

/** Configuración de animación del arma; si no tiene sprite propio usa un tajo genérico. */
function meleeArt(w) {
  if (MELEE_ART[w.n]) return MELEE_ART[w.n];
  return (ART_CACHE[w.n] ||= {
    spr: null, fam: "sweep", gu: -7, tu: 10, s: Math.max(1.5, (0.95 * (w.rng || 60) - 14) / 17),
    dur: 0.22, w: 0.24, r: 0.22, back: 0.45, lunge: 4, pull: 7, idle: 0.85, trail: "#e8f2ff",
  });
}

/**
 * Convierte el sprite en una lista de círculos de colisión (celdas de 2x2 píxeles
 * con algo opaco). Cada círculo se guarda como (u, v): u a lo largo del eje del arma
 * y v perpendicular a él. Así la zona de daño es la silueta real del sprite.
 */
function spriteCircles(src) {
  const c = document.createElement("canvas");
  c.width = c.height = 16;
  const g = c.getContext("2d");
  g.drawImage(src, 0, 0, 16, 16);
  let d;
  try {
    d = g.getImageData(0, 0, 16, 16).data;
  } catch (e) {
    return null;
  }
  const out = [];
  for (let cy = 0; cy < 8; cy++)
    for (let cx = 0; cx < 8; cx++) {
      let on = 0;
      for (let j = 0; j < 2; j++)
        for (let i = 0; i < 2; i++) if (d[((cy * 2 + j) * 16 + cx * 2 + i) * 4 + 3] > 40) on++;
      if (!on) continue;
      const X = cx * 2 + 1 - 8,
        Y = cy * 2 + 1 - 8;
      out.push({ u: (X - Y) / SQ2, v: (X + Y) / SQ2 });
    }
  return out;
}

function loadWeaponSprites() {
  const keys = new Set(Object.values(MELEE_ART).map((a) => a.spr));
  for (const a of Object.values(RANGED_ART)) keys.add(a.spr).add(a.spr2);
  for (const k of Object.keys(PROJ_ART)) keys.add(k);
  for (const key of keys) {
    const rec = (WSPR[key] = { img: null, circ: null, ready: false });
    const uri = WEAPON_SPRITE_DATA[key];
    if (!uri) continue;
    const img = new Image();
    img.onload = () => {
      rec.img = img;
      rec.circ = spriteCircles(img);
      rec.ready = true;
    };
    img.src = uri;
  }
}
loadWeaponSprites();
