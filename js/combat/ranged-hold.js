/* ======================================================================
 * src/js/combat/ranged-hold.js
 * Estado del arma a distancia en la mano: retroceso al disparar, si está
 * "cargada" (lista para disparar) y desde dónde sale el proyectil.
 *
 * Define:
 * RK, RK_TIME, rangedKick, rangedTick, rangedReady, rangedMuzzle, projFor
 * ====================================================================== */

let RK = 0; // tiempo restante de retroceso tras el último disparo
const RK_TIME = 0.14;

/** Llamar al disparar: el arma retrocede (o se adelanta, en los báculos) y se descarga. */
function rangedKick() {
  RK = RK_TIME;
}
function rangedTick(dt) {
  if (RK > 0) RK = Math.max(0, RK - dt);
}

/** ¿Está el arma lista para disparar? (enfriamiento cumplido, sin recargar y con maná). */
function rangedReady() {
  const w = P.w;
  return P.acd <= 0 && !(P.rl > 0) && (w.s != "g" || P.mp >= w.mp);
}

/** Distancia desde el centro del jugador hasta la boca del arma (sale de aquí el proyectil). */
function rangedMuzzle(w) {
  const A = RANGED_ART[w.n];
  return A ? A.hd + (A.tu - A.gu) * A.s : 14;
}

/** Sprite de flecha según el arma: la ballesta dispara virotes. `charged` = versión encendida. */
function projFor(charged) {
  const bolt = P.w.n == "Ballesta";
  return charged ? (bolt ? "virote_cargado" : "flecha_cargada") : bolt ? "virote" : "flecha";
}
