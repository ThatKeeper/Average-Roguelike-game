/* ======================================================================
 * src/js/game/interaction.js
 * Interacción con el entorno (tecla F / clic): puertas, cofres, mercader, santuarios.
 *
 * Define:
 * interact
 * ====================================================================== */

function interact() {
  if (G.st == "hub") {
    if (!G.ov) hubUse();
    return;
  }
  const r = RM_;
  if (G.ov || trnBusy() || dist(P, { x: 480, y: 300 }) > 70) return;
  if (r.tp == "boss" && r.cl) {
    if (G.arena) {
      endPractice();
      return;
    }
    if (G.d % 10 == 0 && !r.vc) {
      r.vc = 1;
      vic();
      return;
    }
    trnCubes("down");
    G.d++; // la vida se conserva tal cual al bajar de piso (ya no se cura)
    genLevel();
    enter(0, 4);
    flash("Profundidad " + G.d + " — " + G.bi[0]);
    S.best = Math.max(S.best, G.d);
    checkUnlocks();
    save();
    chk();
    return;
  }
  if (r.used) return;
  if (r.tp == "treasure") {
    r.used = 1;
    cnt("ch");
    if (r.sec) cnt("sc");
    chk();
    chestFX(480, 300);
    show(
      `<h2>${r.sec ? "Cámara secreta" : "Cofre antiguo"}</h2><p>Elige un tesoro</p>`,
      loot2(r.sec ? 4 : 3),
    );
  } else if (r.tp == "shrine") {
    r.used = 1;
    show("<h2>Santuario</h2><p>Un altar susurra...</p>", [
      // El trago solo se ofrece si te falta vida.
      ...(P.hp < P.mhp ? [{ t: "Beber un trago: recuperas el 40% de la vida", f: () => (P.hp = Math.min(P.mhp, P.hp + P.mhp * 0.4)) }] : []),
      { t: "Bendición: +10% daño", f: () => (P.dm *= 1.1) },
      {
        t: "Pacto: −20 vida máx., +3 a un atributo al azar",
        f: () => {
          P.bhp -= 20;
          P.hp = Math.min(P.hp, P.mhp - 20);
          P.a[pick(Object.keys(P.a))] += 3;
        },
      },
    ]);
  } else if (r.tp == "event") {
    r.used = 1;
    show("<h2>Suceso extraño</h2><p>Algo antiguo te observa...</p>", [
      {
        t: "Pozo de deseos: paga 25 oro → reliquia al azar",
        c: 25,
        f: () => {
          const q = pick(RL);
          q[2](P);
          P.relics.push(q[0]);
          ST();
        },
      },
      {
        t: "Altar de sangre: −25% vida → +60 oro y experiencia",
        f: () => {
          P.hp = Math.max(1, P.hp * 0.75);
          P.gold += 60;
          xp(30 + G.d * 8);
        },
      },
      {
        t: "Despertar la emboscada (botín mayor)",
        f: () => {
          r.cl = 0;
          r.st = 1;
          r.wv = 1;
          r.tp = "combat";
          wave(r);
          wave(r);
        },
      },
      { t: "Ignorar", f: () => {} },
    ]);
  } else if (r.tp == "shop") shop(r);
}
