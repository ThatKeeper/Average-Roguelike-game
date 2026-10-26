/* ======================================================================
 * src/js/data/classes.js
 * Clases del juego, ramas por estadística y requisitos de desbloqueo.
 *
 * Las 3 clases base (Guerrero, Cazador, Mago) siempre están disponibles. De cada una
 * salen 2 clases avanzadas (6 en total) que se desbloquean con requisitos permanentes.
 * El índice de CLS es el que se guarda en S.cls (0-2 coinciden con el guardado antiguo).
 *
 * Las habilidades Q/E/clic derecho/R de cada clase están en game/class-skills.js (SKL),
 * indexadas por la clave `k` de la clase.
 *
 * Define:
 * BRN, CLS, CLS_NONE, SOON, clsReqOK, clsReqTxt, clsReqs, clsOK, clsCheck, clsAll, curCls, mageOn
 * ====================================================================== */

// Ramas por estadística (color de la rama en la sala de clases)
const BRN = {
  str: { n: "Fuerza", c: "#e0584a", sc: "FUE", i: "💪" },
  dex: { n: "Destreza", c: "#6fd08a", sc: "DES", i: "🎯" },
  int: { n: "Inteligencia", c: "#7aa4ff", sc: "INT", i: "📘" },
};

/*
 * k   clave interna · n nombre · i emoji · br rama · w índice de arma inicial (WP) · par clase de la que sale (-1 = base)
 * req requisitos de desbloqueo [tipo, valor] · bon bonificaciones pasivas (ver ST en game/run.js)
 * a2  atributos extra al empezar · col/dk/ac colores de aspecto (ver render/class-look.js)
 */
const CLS = [
  {
    k: "war", n: "Guerrero", i: "⚔️", br: "str", w: 0, par: -1, req: [],
    col: "#d8b36a", dk: "#6b5530", ac: "#c0392b",
    tag: "Cuerpo a cuerpo equilibrado",
    d: "Espada, guardia con parry perfecto, remolino y salto. Su Veredicto ejecuta a los enemigos heridos.",
    bon: {}, a2: {},
  },
  {
    k: "hun", n: "Cazador", i: "🏹", br: "dex", w: 5, par: -1, req: [],
    col: "#7fd08a", dk: "#3c6a44", ac: "#e8c97a",
    tag: "A distancia, movilidad y crítico",
    d: "Arco con cargador de 12, andanada, flecha explosiva y venenosa. Su Lluvia de flechas castiga zonas enteras.",
    bon: {}, a2: {},
  },
  {
    k: "mag", n: "Mago", i: "🪄", br: "int", w: 9, par: -1, req: [],
    col: "#8aa8ff", dk: "#3a4a8a", ac: "#c8a0ff",
    tag: "Magia con maná y cartas",
    d: "Báculo arcano y cartas de hechizo elementales. Su Sobrecarga arcana abarata y potencia la magia.",
    bon: {}, a2: {},
  },
  {
    k: "tank", n: "Tanque", i: "🛡️", br: "str", w: 3, par: 0,
    req: [["depth", 3], ["pf", 15]],
    col: "#8a9bb8", dk: "#46556f", ac: "#e0b84a",
    tag: "Armadura pesada y control",
    d: "Empieza con el Martillo. Aguanta lo que sea y aturde a todo lo que toca: ondas sísmicas, bastión y un golpe del coloso devastador.",
    bon: { hp: 0.15, arm: 12, spd: -0.05 }, a2: { vit: 3 },
  },
  {
    k: "assa", n: "Asesino", i: "🗡️", br: "str", w: 1, par: 0,
    req: [["depth", 4], ["kills", 300]],
    col: "#4a3a72", dk: "#1f1636", ac: "#e0405a",
    tag: "Velocidad, sangrado y crítico",
    d: "Empieza con las Dagas. Se desplaza entre las sombras, lanza cuchillos y se convierte en un torbellino de hojas.",
    bon: { cc: 0.08, spd: 0.06, hp: -0.05 }, a2: { agi: 3 },
  },
  {
    k: "xbow", n: "Ballestero", i: "🎯", br: "dex", w: 6, par: 1,
    req: [["depth", 3], ["bosses", 2]],
    col: "#b08a58", dk: "#5d4528", ac: "#d9a441",
    tag: "Disparos pesados y trampas",
    d: "Empieza con la Ballesta. Perfora filas enteras, planta trampas de púas y vacía una andanada de asedio.",
    bon: { cc: 0.06, dm: 0.08 }, a2: { dex: 2 },
  },
  {
    k: "rune", n: "Disparador rúnico", i: "🔮", br: "dex", w: 7, par: 1,
    req: [["depth", 5], ["bosses", 3]],
    col: "#3fb7c9", dk: "#1c5a6b", ac: "#8ff4ff",
    tag: "Cadencia, runas y control de zona",
    d: "Empieza con el Arma rúnica. Runas buscadoras, sellos que castigan el suelo y una sobrecarga de cadencia.",
    bon: { as: 0.1 }, a2: { agi: 2 },
  },
  {
    k: "fimg", n: "Mago de fuego y hielo", i: "🔥", br: "int", w: 10, par: 2,
    req: [["depth", 4], ["kills", 250]],
    col: "#ff8a4a", dk: "#3a8fb8", ac: "#9fe8ff",
    tag: "Dos elementos, un solo báculo",
    d: "Empieza con el Báculo ígneo. Sus disparos alternan fuego y hielo; llamarada, glaciar y un choque térmico que revienta lo quemado y lo helado.",
    bon: { mp: 0.2 }, a2: { int: 2 },
  },
  {
    k: "alch", n: "Alquimista", i: "⚗️", br: "int", w: 15, par: 2,
    req: [["depth", 6], ["bosses", 3]],
    col: "#8fb85a", dk: "#3d5a2a", ac: "#e8e0c0",
    tag: "Veneno, nubes y contagio",
    d: "Empieza con el Báculo venenoso. Todo lo que toca queda envenenado: frascos corrosivos, nubes tóxicas y una pandemia que lo detona.",
    bon: { mp: 0.1, hp: 0.05 }, a2: { int: 2 },
  },
];

// "Sin clase": aspecto del aprendiz en la sala de clases antes de elegir.
const CLS_NONE = { k: "none", n: "Aprendiz", i: "👤", br: "str", w: 0, par: -1, req: [], col: "#e8e8ee", dk: "#8a8a99", ac: "#ffffff", tag: "", d: "", bon: {}, a2: {} };

// Pedestales "próximamente" por rama: armas que aún no tienen clase.
const SOON = {
  str: ["Gran espada", "Lanza", "Hacha", "Hachas dobles"],
  dex: ["Chakram"],
  int: ["Báculo helado", "Báculo de tormenta", "Báculo de marea"],
};

// ---- requisitos de desbloqueo ----
// [tipo, valor]: depth (mejor profundidad) · bosses (jefes distintos derrotados) · kills (enemigos derrotados) · pf (parries perfectos)
const clsReqVal = (r) =>
  r[0] == "depth" ? S.best : r[0] == "bosses" ? Object.keys(S.bosses || {}).length : r[0] == "kills" ? st("k") : st("pf");
const clsReqOK = (r) => clsReqVal(r) >= r[1],
  clsReqTxt = (r) =>
    ({
      depth: `Alcanzar la profundidad ${r[1]}`,
      bosses: `Derrotar a ${r[1]} jefes distintos`,
      kills: `Derrotar a ${r[1]} enemigos`,
      pf: `Hacer ${r[1]} parries perfectos`,
    })[r[0]] + ` (${Math.min(clsReqVal(r), r[1])}/${r[1]})`;
const clsReqs = (i) => CLS[i].req,
  clsOK = (i) => !CLS[i].req.length || !!(S.cu && S.cu[i]);
const clsAll = () => CLS.map((c, i) => i);

// Comprueba los requisitos y desbloquea (permanente). Devuelve los nombres de las clases nuevas.
function clsCheck() {
  if (!S.cu || typeof S.cu != "object") S.cu = {};
  const nw = [];
  CLS.forEach((c, i) => {
    if (c.req.length && !S.cu[i] && c.req.every(clsReqOK)) {
      S.cu[i] = 1;
      nw.push(c.n);
    }
  });
  if (nw.length) {
    save();
    if (typeof flash == "function") flash("🔓 Clase desbloqueada: " + nw.join(", "));
  }
  return nw;
}

// Clase del jugador actual (o la elegida en el hub, o "sin clase").
const curCls = () => (P && P.ci >= 0 && CLS[P.ci]) || CLS_NONE;
// Sistema de magia (cartas, grimorio y hechizos de clase): solo ramas de Inteligencia y con un arma mágica equipada.
const mageOn = () => !!P && P.br == "int" && !!P.w && P.w.s == "g";
