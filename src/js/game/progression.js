/* ======================================================================
 * src/js/game/progression.js
 * Experiencia y subida de nivel.
 *
 * Define:
 * xp, lvUp
 * ====================================================================== */

function xp(v) {
  P.xp += v * (1 + 0.02 * U("gro"));
  while (P.xp >= P.nx) {
    P.xp -= P.nx;
    P.lv++;
    P.nx = Math.floor(P.nx * 1.32 + 10);
    P.pend++;
    P.pts++;
    chk();
    P.hp = Math.min(P.mhp, P.hp + P.mhp * 0.15);
    levelUpFX();
  }
}
function lvUp() {
  P.pend--;
  const ks = ["str", "dex", "int", "vit", "agi", "luk"],
    nmz = {
      str: "Fuerza (arm. pesadas)",
      dex: "Destreza (crítico, a distancia)",
      int: "Inteligencia (magia, maná)",
      vit: "Vitalidad (vida, armadura)",
      agi: "Agilidad (velocidad)",
      luk: "Suerte (botín, crítico)",
    };
  const o = ks.sort(() => Math.random() - 0.5).slice(0, 3);
  show(
    `<h2>¡Nivel ${P.lv}!</h2><p>Elige un atributo (+2)</p>`,
    o.map((k) => ({
      i: ATI[k],
      n: ATN[k],
      tp: "Atributo",
      r: 0,
      d: ATD[k],
      stx: `${k.toUpperCase()} ${P.a[k]} → ${P.a[k] + 2}`,
      f: () => {
        P.a[k] += 2;
        ST();
      },
    })),
  );
}

