/* ======================================================================
 * src/js/core/storage.js
 * Versión del juego, progreso permanente (S) en localStorage y reinicios por versión (hard/soft reset).
 *
 * Define:
 * GAME_VERSION, HARD_RESET, SOFT_RESET, SKEY, SOFT_WIPE, S, RESET_MSG, save
 * ====================================================================== */

// ===== VERSIONES =====
// GAME_VERSION: solo informativa (se muestra en el titulo y fuerza a renovar el service worker).
// HARD_RESET: sube +1 para BORRAR TODO el guardado (partida nueva desde cero, incluidos logros y bestiario).
// SOFT_RESET: sube +1 para reiniciar solo el PROGRESO (claves de SOFT_WIPE); se conservan logros, bestiario, estadisticas, jefes derrotados y ajustes.
const GAME_VERSION = "1.3.6",
  HARD_RESET = 1,
  SOFT_RESET = 1,
  SKEY = "idv1",
  SOFT_WIPE = ["best", "souls", "pw", "fv", "hard", "hv2", "up", "cards"];
let S = { best: 0, souls: 0, pw: 0 },
  RESET_MSG = "";
try {
  const raw = JSON.parse(localStorage.getItem(SKEY)) || {};
  if (raw.hv === undefined) {
    raw.hv = HARD_RESET;
    raw.sv = SOFT_RESET;
  }
  if (raw.hv !== HARD_RESET) {
    RESET_MSG = "Nueva versión: partida reiniciada desde cero.";
  } else {
    if (raw.sv !== SOFT_RESET) {
      SOFT_WIPE.forEach((k) => delete raw[k]);
      RESET_MSG = "Nueva versión: progreso reiniciado (logros y bestiario conservados).";
    }
    S = Object.assign(S, raw);
  }
} catch (e) {}
S.hv = HARD_RESET;
S.sv = SOFT_RESET;
const save = () => {
  try {
    localStorage.setItem(SKEY, JSON.stringify(S));
  } catch (e) {}
};
save();

