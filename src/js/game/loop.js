/* ======================================================================
 * src/js/game/loop.js
 * Bucle principal con paso fijo, música y manejo de errores de render.
 *
 * Define:
 * lt, mi, music, ACC, loop
 * ====================================================================== */

let lt = performance.now(),
  mi;
function music() {
  if (mi) return;
  mi = setInterval(() => {
    if (G.st != "play" || S.mute) return;
    snd(
      pick([110, 130.8, 146.8, 164.8, 196, 220]) * (Math.random() < 0.3 ? 2 : 1),
      1.6,
      "triangle",
      0.02,
      1,
    );
  }, 900);
}
let ACC = 0;
function loop(t) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.1, (t - lt) / 1000);
  lt = t;
  ACC += dt * DBG.ts;
  dbgTick(dt);
  try {
    let n = 0;
    while (ACC >= 1 / 60 && n++ < 6) {
      ACC -= 1 / 60;
      if (G.st == "play" && !G.ov && !ROT && !(G.hs > 0 && ((G.hs -= 1 / 60), 1))) {
        const h = 1 / 60;
        upP(h);
        if (G.st == "play") {
          upE(h);
          upPR(h);
          upMisc(h);
          amb(h);
          if (P.pend > 0 && !G.ov) lvUp();
        }
      }
    }
    if (n >= 6) ACC = 0;
    G.st == "title" ? titleFrame(dt) : G.st == "hub" ? hubFrame(dt) : draw();
  } catch (er) {
    console.error(er);
    cv.width = W;
  }
}

