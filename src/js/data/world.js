/* ======================================================================
 * src/js/data/world.js
 * Datos del mundo: biomas, nombres de los jefes de bioma y direcciones del mapa de salas.
 *
 * Define:
 * BI, BN, DIR, TS, GW, GH, RB
 * ====================================================================== */

const BI = [
  ["Catacumbas", "#26222e", "#4a4257", "#8a7fa3"],
  ["Criptas malditas", "#221828", "#432a52", "#b05fd0"],
  ["Minas abandonadas", "#2b2218", "#52402a", "#c9964a"],
  ["Bosque subterráneo", "#14241a", "#2c4a30", "#5fd078"],
  ["Ruinas arcanas", "#18203a", "#2e3f6a", "#5f9bd0"],
  ["Cavernas de lava", "#2e1410", "#5a2a1c", "#ff7a3a"],
  ["Abismos helados", "#142830", "#2f5566", "#8fe3ff"],
  ["Dimensión corrupta", "#2a0e20", "#5a1f45", "#ff4fa0"],
];
const BN = [
  "Rey Exhumado",
  "Devoradora de Luz",
  "Coloso de Mena",
  "Madre Raíz",
  "Arconte Roto",
  "Señor del Magma",
  "Reina Escarcha",
  "Voz del Vacío",
];
const DIR = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];


// Sala = cuadrícula de 24x15 tiles de 40 px (960x600). El anillo exterior es muro; la zona jugable es RB.
const TS = 40,
  GW = 24,
  GH = 15,
  RB = { x0: TS, y0: TS, x1: (GW - 1) * TS, y1: (GH - 1) * TS };
