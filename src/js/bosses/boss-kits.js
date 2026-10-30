/* ======================================================================
 * src/js/bosses/boss-kits.js
 * Utilidades comunes de los jefes: escalado adaptativo, acciones retardadas, anti-bloqueo y sorteo sin repetir.
 * (Los antiguos kits de ataques compartidos AT2/KIT/SIG se han eliminado: cada jefe tiene ahora sus ataques propios
 * en boss-roster-*.js.)
 *
 * Define:
 * adH, adD, later, schd, guard, rk
 * ====================================================================== */

// Escalado adaptativo: la vida enemiga crece con tu daño y su daño con tu vida (con tope). Jefes: inmunidad 99%, sin aturdimiento, tope de daño por golpe/segundo, anti-bloqueo.
const adH = () =>
    P
      ? 1 +
        Math.min(
          1.2,
          0.4 * Math.max(0, P.dm * P.edm * P.w.rm - 1.2) +
            0.35 * Math.max(0, P.mhp / (130 + 14 * G.d) - 1),
        )
      : 1,
  adD = () =>
    P
      ? 1 +
        Math.min(
          0.6,
          0.3 * Math.max(0, P.mhp / (130 + 14 * G.d) - 1) + 0.15 * Math.max(0, P.dm * P.edm - 1.3),
        )
      : 1;
const later = (e, t, f) => (e.sc = e.sc || []).push({ t, f });
function schd(e, dt) {
  if (!e.sc || !e.sc.length) return;
  for (const q of e.sc) q.t -= dt;
  const rd = e.sc.filter((q) => q.t <= 0);
  e.sc = e.sc.filter((q) => q.t > 0);
  rd.forEach((q) => q.f());
}
function guard(e, dt) {
  if (e.lhp === undefined || e.hp < e.lhp) e.wg = 0;
  e.lhp = e.hp;
  e.wg = (e.wg || 0) + dt;
  if (e.wg > 20) {
    e.wg = 0;
    [...(e.mn || []), ...(e.dc || []), ...(e.orb || [])].forEach((q) => {
      q.hp = 0;
      q.dead = 1;
    });
    e.mn = [];
    e.dc = [];
    e.orb = [];
    e.o2 = 0;
    e.rs = 0;
    e.imm = 0;
    e.vul = 3;
    if (dist(e, P) > 420) {
      e.x = cl(P.x + 150, 90, 870);
      e.y = cl(P.y, 90, 510);
    }
    flash("El jefe queda expuesto");
  }
}
function rk(e, n, key = "lk2") {
  let k;
  do {
    k = (Math.random() * n) | 0;
  } while (n > 1 && k == e[key]);
  return (e[key] = k);
}
