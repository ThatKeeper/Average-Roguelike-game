/* ======================================================================
 * src/js/bosses/boss-lifecycle.js
 * Aparición y muerte de jefes, modo práctica (revancha) y descripciones BDS.
 *
 * Define:
 * spawnBoss, bossDie, endPractice, BDS
 * ====================================================================== */

function spawnBoss() {
  const i = G.bo ?? bossIdx(G.d),
    B = BD[i],
    b = spawn("boss", 480, 150);
  b.bi = i;
  b.nm = B.n;
  b.r = B.r;
  b.hp = b.mhp *= B.hp * (FIN(i) ? 1.1 : 1);
  b.dmg *= FIN(i) ? 1.25 : 1;
  b.al = 1;
  b.sp = 2.4;
  b.t1 = 2;
  b.dir = Math.random() < 0.5 ? 1 : -1;
  G.intro = { n: B.n, i, t: 2.4 };
  bsnd(i, "in");
  ring(b, 120, B.c);
  G.bo = undefined;
  return b;
}
function bossDie(e) {
  let nu = [];
  if (!G.arena) {
    S.bosses[e.bi] = 1;
    nu = checkUnlocks();
    save();
  }
  (e.mn || []).concat(e.dc || [], e.orb || []).forEach((q) => {
    q.hp = 0;
    q.dead = 1;
  });
  E.forEach((q) => {
    if (q != e) {
      q.hp = 0;
      q.dead = 1;
    }
  });
  shake = 18;
  bsnd(e.bi, "die");
  for (let i = 0; i < 4; i++)
    FX.push({
      k: "ring",
      x: e.x,
      y: e.y,
      r: 80 + i * 50,
      t: 0.5 + i * 0.2,
      m: 0.5 + i * 0.2,
      c: BD[e.bi].c,
    });
  G.dk = 0;
  P.invc = 0;
  if (!G.arena && G.d >= 10 && !S.hard) {
    S.hard = 1;
    S.hv2 = 1;
    save();
    G.ban = ["Todo se ha vuelto un poco más difícil", 7];
  }
  chk();
  flash("\u00a1" + e.nm + " derrotado!" + (nu.length ? " Carta nueva: " + nu.join(", ") : ""));
}
// Practica (revancha): al derrotar al jefe y cruzar el portal vuelve al menu SIN recompensas, almas, mejor profundidad ni desbloqueos.
function endPractice() {
  if (G.done) return;
  G.done = 1;
  G.st = "menu";
  menu();
}
const BDS = [
  "Embestidas encadenadas y fintas.",
  "Ondas de choque; sus embestidas destrozan el escenario.",
  "Disparos curvos y espirales; recarga.",
  "Copias id\u00e9nticas: halla al verdadero.",
  "Trampas retardadas y barridos.",
  "Cambia de forma al 50% de vida.",
  "Orbes protectores e inversi\u00f3n de controles.",
  "Invoca esqueletos; el suelo cede.",
  "Franjas el\u00e9ctricas con carriles seguros.",
  "Oscuridad y orbes rastreadores.",
  "Rebobina el tiempo: interr\u00fampelo.",
  "Imita tu estilo de combate.",
];

