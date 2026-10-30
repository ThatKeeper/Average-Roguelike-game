/* ======================================================================
 * src/js/hub/menus.js
 * Menús del hub: mejoras permanentes (forja), estadísticas, información y ajustes.
 *
 * Define:
 * U, cyc, UPG, forgeMenu, statsMenu, infoMenu (los ajustes están en ui/controls-menu.js)
 * ====================================================================== */

const U = (k) => (S.up && S.up[k]) || 0,
  cyc = (v) => [1, 0.6, 0.3, 0][([1, 0.6, 0.3, 0].indexOf(v ?? 1) + 1) % 4];
const UPG = [
  ["pow", "Poder", "+0.5% de daño por nivel (máx. +25%).", 50, 25, "⚔️"],
  ["vig", "Vigor", "+1% de vida máxima por nivel.", 20, 30, "❤️"],
  ["arm", "Armadura", "+1 de armadura por nivel.", 10, 40, "🛡️"],
  [
    "rec",
    "Recuperación",
    "+0.1 vida/s de regeneración por nivel (no es robo de vida).",
    10,
    60,
    "🌿",
  ],
  ["cdr", "Enfriamiento", "−1% de enfriamiento de habilidades por nivel.", 15, 50, "⏳"],
  ["spd", "Celeridad", "+1% de velocidad de movimiento por nivel.", 10, 35, "👟"],
  ["mag", "Imán", "+10% de radio de recogida por nivel.", 5, 30, "🧲"],
  ["gre", "Codicia", "+3% de oro por nivel.", 10, 30, "🪙"],
  ["gro", "Crecimiento", "+2% de experiencia por nivel.", 10, 40, "📈"],
  ["rev", "Renacer", "Revives una vez por partida con el 50% de vida.", 1, 400, "✨"],
];
function forgeMenu() {
  show(
    `<h2>Forja de almas</h2><p>Almas: ${S.souls}. Mejoras permanentes que se aplican a todas tus partidas.</p>`,
    UPG.map(([k, n, d, mx, b, i]) => {
      const l = U(k),
        c = Math.round(b * (1 + l * 0.25));
      return {
        i,
        n,
        tp: "Mejora permanente",
        r: l >= mx ? 3 : l ? 1 : 0,
        d,
        stx: l >= mx ? `Nivel ${l}/${mx} (MÁX.)` : `Nivel ${l}/${mx} · coste ${c} almas`,
        nc: 1,
        t: "Mejorar",
        dis: l >= mx || S.souls < c,
        f: () => {
          if (U(k) < mx && S.souls >= c) {
            S.souls -= c;
            S.up[k] = U(k) + 1;
            save();
          }
          forgeMenu();
        },
      };
    }).concat([back()]),
  );
}
function statsMenu() {
  show(
    "<h2>Estadísticas</h2>" +
      [
        `Mejor profundidad: ${S.best}`,
        `Almas: ${S.souls}`,
        `Enemigos derrotados: ${st("k")}`,
        `Jefes distintos derrotados: ${Object.keys(S.bosses).length}/${BDV()}`,
        `Bestiario: ${nBk()}/${TOT()}`,
        `Logros: ${Object.keys(S.ach).length}/${ACH.length}`,
        `Parries perfectos: ${st("pf")} · proyectiles reflejados: ${st("pj")}`,
        `Cofres: ${st("ch")} · compras: ${st("sh")} · caídas: ${st("dt")}`,
        `Modo difícil: ${S.hard ? "activo" : "bloqueado (derrota al jefe de la profundidad 10)"}`,
      ]
        .map((t) => `<p>${t}</p>`)
        .join(""),
    [back()],
  );
}
function infoMenu() {
  show(
    `<h2>Progresión y créditos</h2><p>Modo difícil: <b>${S.hard ? "ACTIVO (permanente)" : "se desbloquea al derrotar al jefe de la profundidad 10"}</b>. Al activarse: enemigos más duros, pisos de 10–20 salas con bucles y rutas alternativas.</p><p>Los enemigos y jefes escalan con tu vida y tu daño. Los jefes rotan en cada partida, son inmunes al aturdimiento y no pueden morir de un golpe.</p><p>Parry: mantén clic derecho con un arma cuerpo a cuerpo; el primer instante es parry perfecto (refleja daño y proyectiles).</p><p>Average roguelike game · basado en Infinite Depths.</p>`,
    [back()],
  );
}
