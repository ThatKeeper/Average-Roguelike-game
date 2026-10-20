/* ======================================================================
 * src/js/game/state.js
 * Estado global mutable de la partida: G, P, E, PR, Z, FX, NM, O, K, M...
 *
 * Define:
 * G, P, E, PR, Z, FX, NM, O, K, M, shake, bigmap, RM_, msg
 * ====================================================================== */

let G = { st: "menu" },
  P,
  E = [],
  PR = [],
  Z = [],
  FX = [],
  NM = [],
  O = [],
  K = {},
  M = { x: 480, y: 300, d: 0, r: 0 },
  shake = 0,
  bigmap = 0,
  RM_,
  msg = ["", 0];
