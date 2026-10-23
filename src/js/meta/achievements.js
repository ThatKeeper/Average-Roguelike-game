/* ======================================================================
 * src/js/meta/achievements.js
 * Logros, estadísticas permanentes y bestiario (datos y comprobación).
 *
 * Define:
 * st, C, nBk, TOT, SN, AT, ACH, cnt, bk, chk, achMenu
 * ====================================================================== */

// ===== LOGROS Y BESTIARIO (persisten en S.ach / S.bk / S.st; la Arena de práctica no cuenta) =====
const st = (k) => S.st[k] || 0,
  C = (k, n) => [() => st(k) >= n, () => st(k) + "/" + n],
  nBk = () => Object.keys(S.bk).length,
  TOT = () =>
    Object.keys(ET).filter((k) => !["decoy", "orb", "boss", "dummy"].includes(k)).length +
    BD.length;
const SN = {
  grunt: "Zombi",
  runner: "Lobo desollado",
  archer: "Arquero goblin",
  mage: "Hechicero",
  tank: "Coloso de piedra",
  bomber: "Bombardero",
  summoner: "Invocador",
  guardian: "Guardián",
  stalker: "Acechador",
  elite: "Campeón élite",
};
const AT = {
  melee: [
    "Cuerpo a cuerpo",
    "Se acerca y golpea tras un aro rojo de aviso.",
    "Esquiva al ver el aro o usa la guardia.",
  ],
  flank: [
    "Asaltante",
    "Rodea al jugador y embiste en línea recta.",
    "Esquiva de lado justo antes de la embestida.",
  ],
  range: [
    "A distancia",
    "Mantiene la distancia y dispara.",
    "Usa obstáculos; el parry perfecto devuelve sus disparos.",
  ],
  cast: [
    "Lanzador",
    "Marca el suelo con un área retardada.",
    "Sal del círculo antes de que estalle.",
  ],
  bomb: ["Kamikaze", "Corre hacia ti y explota.", "Mátalo a distancia."],
  sum: ["Invocador", "Convoca zombis periódicamente.", "Prioriza eliminarlo."],
  shield: ["Soporte", "Da escudos (−50% de daño) a aliados cercanos.", "Elimínalo primero."],
  leap: ["Acechador", "Orbita y salta sobre ti.", "Esquiva cuando cargue el salto."],
  elite: ["Élite", "Golpea fuerte y emite pulsos de área cada 4 s.", "Aléjate del pulso."],
};
const ACH = [
  ["a1", "Primera sangre", "Derrota a un enemigo.", ...C("k", 1)],
  ["a2", "Cazador de monstruos", "Derrota a 100 enemigos.", ...C("k", 100)],
  ["a3", "Exterminador", "Derrota a 500 enemigos.", ...C("k", 500)],
  ["a4", "Primer descenso", "Alcanza la profundidad 3.", () => S.best >= 3, () => S.best + "/3"],
  ["a5", "Cada vez más hondo", "Alcanza la profundidad 5.", () => S.best >= 5, () => S.best + "/5"],
  ["a6", "Abismo", "Alcanza la profundidad 10.", () => S.best >= 10, () => S.best + "/10"],
  ["a7", "Aprendiz", "Alcanza el nivel 5.", () => st("ml") >= 5, () => st("ml") + "/5"],
  ["a8", "Veterano", "Alcanza el nivel 10.", () => st("ml") >= 10, () => st("ml") + "/10"],
  ["a9", "Leyenda viva", "Alcanza el nivel 20.", () => st("ml") >= 20, () => st("ml") + "/20"],
  ["a10", "Todo más difícil", "Desbloquea el modo difícil.", () => S.hard],
  ["a11", "Rompe-jefes", "Derrota a un jefe.", () => Object.keys(S.bosses).length >= 1],
  [
    "a12",
    "Triple amenaza",
    "Derrota a 3 jefes distintos.",
    () => Object.keys(S.bosses).length >= 3,
    () => Object.keys(S.bosses).length + "/3",
  ],
  [
    "a13",
    "Cazador de finales",
    "Derrota a un jefe final.",
    () => Object.keys(S.bosses).some((k) => FIN(+k)),
  ],
  [
    "a14",
    "Siete pecados",
    "Derrota a los 7 jefes normales.",
    () => [0, 1, 2, 3, 4, 5, 6].every((k) => S.bosses[k]),
    () => [0, 1, 2, 3, 4, 5, 6].filter((k) => S.bosses[k]).length + "/7",
  ],
  [
    "a15",
    "Fin del mundo",
    "Derrota a los 5 jefes finales.",
    () => [7, 8, 9, 10, 11].every((k) => S.bosses[k]),
    () => [7, 8, 9, 10, 11].filter((k) => S.bosses[k]).length + "/5",
  ],
  ["a16", "Reflejos", "Haz un parry perfecto.", ...C("pf", 1)],
  ["a17", "Muro de acero", "Haz 25 parries perfectos.", ...C("pf", 25)],
  ["a18", "Devuélvelo", "Refleja un proyectil con parry perfecto.", ...C("pj", 1)],
  ["a19", "Francotirador al revés", "Refleja 10 proyectiles.", ...C("pj", 10)],
  ["a20", "Saqueador", "Abre un cofre.", ...C("ch", 1)],
  ["a21", "Coleccionista", "Abre 10 cofres.", ...C("ch", 10)],
  ["a22", "Ojo de lince", "Entra en una cámara secreta.", ...C("sc", 1)],
  ["a23", "Cliente", "Compra al mercader.", ...C("sh", 1)],
  ["a24", "Cliente fiel", "Haz 5 compras.", ...C("sh", 5)],
  ["a25", "Brillo violeta", "Consigue un objeto épico.", () => st("ep") > 0],
  ["a26", "Brillo dorado", "Consigue un objeto legendario.", () => st("lg") > 0],
  ["a27", "Intocable", "Despeja una sala sin recibir daño.", ...C("fl", 1)],
  ["a28", "Danza de espadas", "Derrota a un élite sin recibir daño.", ...C("fe", 1)],
  ["a29", "Sin un rasguño", "Derrota a un jefe sin recibir daño.", ...C("fbs", 1), 1],
  [
    "a30",
    "Erudito",
    "Descubre la mitad del bestiario.",
    () => nBk() * 2 >= TOT(),
    () => nBk() + "/" + Math.ceil(TOT() / 2),
  ],
  [
    "a31",
    "Enciclopedia",
    "Completa el bestiario.",
    () => nBk() >= TOT(),
    () => nBk() + "/" + TOT(),
  ],
  ["a32", "Reliquiario", "Reúne 5 reliquias en una expedición.", () => !!P && P.relics.length >= 5],
  ["a33", "Aprender cayendo", "Muere por primera vez.", ...C("dt", 1)],
  ["a34", "Gloria eterna", "Retírate con gloria.", ...C("vic", 1), 1],
];
function cnt(k) {
  if (!G.arena) S.st[k] = st(k) + 1;
}
function bk(e) {
  if (G.arena) return;
  const k = e.t == "boss" ? "b" + e.bi : e.t;
  if (!S.bk[k]) flash("📖 Bestiario: " + (e.t == "boss" ? e.nm : SN[e.t] || k));
  S.bk[k] = (S.bk[k] || 0) + 1;
  cnt("k");
  save();
  chk();
}
function chk() {
  if (!P || G.arena || G.st == "menu") return;
  S.st.ml = Math.max(st("ml"), P.lv);
  const all = [...P.bag.filter(Boolean), ...Object.values(P.eq)];
  if (all.some((i) => i.r == 3) || P.w.rn == "Legendaria") S.st.lg = 1;
  if (all.some((i) => i.r == 2) || P.w.rn == "Épica") S.st.ep = 1;
  let nw = 0;
  for (const a of ACH)
    if (!S.ach[a[0]] && a[3]()) {
      S.ach[a[0]] = Date.now();
      S.souls += 10;
      nw = 1;
      flash("🏆 Logro: " + a[1] + " (+10 almas)");
    }
  if (nw) save();
}
function achMenu() {
  const n = Object.keys(S.ach).length;
  show(
    `<h2>Logros ${n}/${ACH.length}</h2>`,
    ACH.map((a) => {
      const u = S.ach[a[0]],
        h = a[5] && !u;
      return {
        i: u ? "🏆" : "🔒",
        n: h ? "???" : a[1],
        tp: u ? "Desbloqueado " + new Date(u).toLocaleDateString() : "Pendiente",
        r: u ? 3 : 0,
        d: h ? "Logro oculto." : a[2],
        stx: (u || h || !a[4] ? "" : a[4]() + " · ") + "+10 almas",
        nc: 1,
        dis: 1,
        f: () => {},
      };
    }).concat([{ t: "Volver", nc: 1, f: menu }]),
  );
}

