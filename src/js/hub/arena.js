/* ======================================================================
 * src/js/hub/arena.js
 * Arena de práctica contra jefes.
 *
 * Define:
 * arenaMenu, arena
 * ====================================================================== */

function arenaMenu() {
  show(
    `<h2>Arena de jefes</h2><p>Se desbloquean al alcanzar su profundidad (tu mejor: ${S.best}). Empiezas con un personaje de nivel acorde.</p>`,
    BD.map((b, i) => ({
      i: `<span style="color:${b.c}">\u25c6</span>`,
      n: b.n,
      tp: FIN(i) ? "Jefe final" : "Jefe",
      r: FIN(i) ? 3 : 1,
      d: BDS[i],
      stx: "Profundidad " + bossDepth(i),
      dis: S.best < bossDepth(i),
      nc: 1,
      f: () => arena(i),
    })).concat([{ t: "Volver", nc: 1, f: menu }]),
  );
}
function arena(i) {
  run(0);
  const d = bossDepth(i);
  G.d = d;
  G.bo = i;
  G.arena = 1;
  genLevel();
  const L = Math.min(40, 1 + d * 2);
  P.lv = L;
  for (let k = 1; k < L; k++) {
    P.a[P.w.sc] += 1;
    if (k % 2) P.a.vit += 1;
    else P.a.agi += 1;
  }
  ST();
  P.hp = P.mhp;
  P.mp = P.mmp;
  enter(
    G.R.findIndex((r) => r.tp == "boss"),
    4,
  );
}
