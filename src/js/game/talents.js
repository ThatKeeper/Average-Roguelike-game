/* ======================================================================
 * src/js/game/talents.js
 * Variantes por bioma, árbol de mejoras de clase (talentos), su ventana, victoria y final.
 *
 * Define:
 * EBI, BV, TT, ttOf, ttNodes, trk, ttOpen, tmCalc, tv, ttSpent, tal, vic, win
 * ====================================================================== */

// ===== TALENTOS, VICTORIA, RESISTENCIAS Y VARIANTES POR BIOMA =====
const EBI = [null, "corr", null, "poison", "light", "fire", "ice", "corr"],
  BV = [
    ["Esquel\u00e9tico", 0.9, 1.05],
    ["Maldito", 1, 1],
    ["Minero", 1.3, 0.9],
    ["Silvestre", 1, 1.1],
    ["Arcano", 0.9, 1],
    ["\u00cdgneo", 1.1, 1],
    ["G\u00e9lido", 1.2, 0.9],
    ["Corrupto", 1, 1.1],
  ];
/*
 * ÁRBOL DE MEJORAS DE CLASE
 * Cada clase tiene 3 ramas de 3 mejoras (nivel 1 → 2 → 3). Una mejora se desbloquea al completar los
 * rangos de la anterior de su rama. Cada nivel de personaje da 1 punto; no da para todo el árbol, así que
 * hay que elegir qué rama profundizar. Los efectos son pequeños y solo afectan a la clase que los aprende.
 *
 * Nodo: k clave · n nombre · i icono · m rangos máximos · d descripción (por rango)
 *       fx: { modificador: valor por rango }  (se suman en P.tm, ver tmCalc / tv)
 * Modificadores genéricos que lee el motor:
 *   cc, arm, mmp, mr, as (estadísticas) · mpc (coste de maná) · cd0..cd3 (segundos de enfriamiento de Q, E, clic der., R)
 * El resto (whR, leapR, ...) los leen las propias habilidades (game/class-actions.js, spells/casting.js, combat/*).
 */
const TT = {
  war: [
    { n: "Maestría del filo", i: "⚔️", nodes: [
      { k: "whR", n: "Torbellino amplio", i: "🌀", m: 3, d: "+7% radio del Remolino por rango.", fx: { whR: 0.07 } },
      { k: "verEx", n: "Verdugo", i: "🪓", m: 2, d: "+4% de umbral de ejecución del Veredicto por rango (35% → 43%).", fx: { verEx: 0.04 } },
      { k: "verCut", n: "Cosecha de veredictos", i: "☠️", m: 1, d: "Cada baja con el Veredicto reduce 2 s más Q y E.", fx: { verCut: 2 } },
    ] },
    { n: "Salto y presión", i: "🦘", nodes: [
      { k: "leapR", n: "Impacto sísmico", i: "💥", m: 3, d: "+8% radio de aterrizaje del Salto por rango.", fx: { leapR: 0.08 } },
      { k: "leapS", n: "Aterrizaje aplastante", i: "🔨", m: 2, d: "+0,25 s de aturdimiento del Salto por rango.", fx: { leapS: 0.25 } },
      { k: "leapC", n: "Salto de gigante", i: "🏔️", m: 1, d: "−2,5 s de enfriamiento del Salto y +15% de distancia.", fx: { cd1: 2.5, leapD: 0.15 } },
    ] },
    { n: "Guardia", i: "🛡️", nodes: [
      { k: "pw", n: "Guardia firme", i: "⏱️", m: 3, d: "+0,03 s de ventana del parry perfecto por rango.", fx: { pw: 0.03 } },
      { k: "pcDm", n: "Contragolpe", i: "⚡", m: 2, d: "Tras un parry perfecto: +10% de daño durante 4 s por rango.", fx: { pcDm: 0.1 } },
      { k: "gdr", n: "Muro de acero", i: "🧱", m: 1, d: "La guardia reduce 5 puntos más el daño recibido.", fx: { gdr: 0.05 } },
    ] },
  ],
  hun: [
    { n: "Puntería", i: "🎯", nodes: [
      { k: "hunt", n: "Ojo de cazador", i: "👁️", m: 3, d: "+3% probabilidad de crítico por rango.", fx: { cc: 0.03 } },
      { k: "rl", n: "Recarga veloz", i: "🔄", m: 2, d: "−8% tiempo de recarga del arco por rango.", fx: { rl: 0.08 } },
      { k: "volN", n: "Andanada generosa", i: "🏹", m: 1, d: "La Andanada dispara 1 flecha más.", fx: { volN: 1 } },
    ] },
    { n: "Explosivos y veneno", i: "💣", nodes: [
      { k: "exR", n: "Carga potente", i: "💥", m: 3, d: "+8% radio de la explosión de la Flecha explosiva por rango.", fx: { exR: 0.08 } },
      { k: "venD", n: "Veneno virulento", i: "🧪", m: 2, d: "+1 s de veneno de la Flecha venenosa por rango.", fx: { venD: 1 } },
      { k: "exC", n: "Pólvora fina", i: "🧨", m: 1, d: "−1,5 s de enfriamiento y +10% de daño de la Flecha explosiva.", fx: { cd1: 1.5, exDm: 0.1 } },
    ] },
    { n: "Tormenta", i: "🌧️", nodes: [
      { k: "rainR", n: "Nube de flechas", i: "☁️", m: 3, d: "+8% radio de la Lluvia de flechas por rango.", fx: { rainR: 0.08 } },
      { k: "rainD", n: "Tormenta prolongada", i: "⏳", m: 2, d: "+0,4 s de duración de la Lluvia de flechas por rango.", fx: { rainD: 0.4 } },
      { k: "rainC", n: "Aguacero", i: "⛈️", m: 1, d: "−3 s de enfriamiento de la Lluvia de flechas.", fx: { cd3: 3 } },
    ] },
  ],
  mag: [
    { n: "Arcanista", i: "📘", nodes: [
      { k: "will", n: "Voluntad", i: "🧘", m: 3, d: "+15 maná máximo y +1 de regeneración de maná por rango.", fx: { mmp: 15, mr: 1 } },
      { k: "eco", n: "Economía arcana", i: "💠", m: 2, d: "−7% coste de maná de hechizos y habilidades por rango.", fx: { mpc: 0.07 } },
      { k: "ovD", n: "Mente clara", i: "🧠", m: 1, d: "La Sobrecarga arcana dura 2 s más.", fx: { ovD: 2 } },
    ] },
    { n: "Evocación", i: "🔥", nodes: [
      { k: "fbR", n: "Bola ampliada", i: "☄️", m: 3, d: "+8% radio de la explosión de la Bola de fuego por rango.", fx: { fbR: 0.08 } },
      { k: "novS", n: "Escarcha profunda", i: "❄️", m: 2, d: "+0,2 s de aturdimiento de la Nova de hielo por rango.", fx: { novS: 0.2 } },
      { k: "cascade", n: "Cascada elemental", i: "🌊", m: 1, d: "−1 s de enfriamiento de la Bola de fuego y de la Nova de hielo.", fx: { cd0: 1, cd1: 1 } },
    ] },
    { n: "Grimorio", i: "📖", nodes: [
      { k: "chN", n: "Rayo conductor", i: "⚡", m: 2, d: "El Rayo en cadena salta a 1 enemigo más por rango.", fx: { chN: 1 } },
      { k: "ccd", n: "Cartas ágiles", i: "🃏", m: 2, d: "−6% enfriamiento de las cartas de hechizo por rango.", fx: { ccd: 0.06 } },
      { k: "gr", n: "Grimorio expansivo", i: "📜", m: 1, d: "Cartas con +20% de área y +1,5 s de duración de zonas.", fx: { cardR: 0.2, cardD: 1.5 } },
    ] },
  ],
  tank: [
    { n: "Terremoto", i: "🌋", nodes: [
      { k: "qakeN", n: "Ondas largas", i: "〰️", m: 2, d: "La Onda sísmica lanza 1 impacto más por rango.", fx: { qakeN: 1 } },
      { k: "qakeR", n: "Tierra pesada", i: "🪨", m: 2, d: "+10% radio de cada impacto de la Onda sísmica por rango.", fx: { qakeR: 0.1 } },
      { k: "qakeC", n: "Fractura", i: "⛰️", m: 1, d: "La Onda sísmica aturde 0,3 s más y enfría 1 s antes.", fx: { qakeS: 0.3, cd0: 1 } },
    ] },
    { n: "Fortaleza", i: "🏰", nodes: [
      { k: "skin", n: "Piel de piedra", i: "🧱", m: 3, d: "+5 de armadura por rango.", fx: { arm: 5 } },
      { k: "bulD", n: "Bastión férreo", i: "🛡️", m: 2, d: "+0,5 s de duración del Bastión y de su sobrevida por rango.", fx: { bulD: 0.5 } },
      { k: "bulC", n: "Inamovible", i: "🗿", m: 1, d: "−2 s de enfriamiento del Bastión y +20% de sobrevida.", fx: { cd1: 2, bulSh: 0.2 } },
    ] },
    { n: "Coloso", i: "👊", nodes: [
      { k: "colR", n: "Impacto colosal", i: "💢", m: 3, d: "+7% radio del Golpe del coloso por rango.", fx: { colR: 0.07 } },
      { k: "colP", n: "Preparación brusca", i: "⏩", m: 2, d: "−0,08 s de preparación del Golpe del coloso por rango.", fx: { colP: 0.08 } },
      { k: "colC", n: "Aplastar", i: "🔔", m: 1, d: "−3 s de enfriamiento del Golpe del coloso y +0,4 s de aturdimiento.", fx: { cd3: 3, colS: 0.4 } },
    ] },
  ],
  assa: [
    { n: "Sangre", i: "🩸", nodes: [
      { k: "bleed", n: "Maestro del desangrado", i: "🩸", m: 3, d: "+1 acumulación máxima de hemorragia por rango.", fx: { bleedN: 1 } },
      { k: "bleedD", n: "Hemorragia profunda", i: "💧", m: 2, d: "La hemorragia dura 1,5 s más por rango.", fx: { bleedD: 1.5 } },
      { k: "bleedC", n: "Corazón sangrante", i: "❤️‍🔥", m: 1, d: "Tus críticos añaden 1 acumulación extra de hemorragia.", fx: { bleedC: 1 } },
    ] },
    { n: "Sombras", i: "🌑", nodes: [
      { k: "refl", n: "Reflejos", i: "👟", m: 3, d: "−8% enfriamiento de la esquiva por rango.", fx: { dcd: 0.08 } },
      { k: "stepL", n: "Paso extendido", i: "💨", m: 2, d: "+12% distancia del Paso sombrío por rango.", fx: { stepL: 0.12 } },
      { k: "stepC", n: "Sombra fugaz", i: "👤", m: 1, d: "−2 s de enfriamiento del Paso sombrío y +0,15 s de invulnerabilidad.", fx: { cd0: 2, stepI: 0.15 } },
    ] },
    { n: "Torbellino", i: "🌪️", nodes: [
      { k: "danR", n: "Hojas afiladas", i: "🍃", m: 3, d: "+8% radio de la Danza mortal por rango.", fx: { danR: 0.08 } },
      { k: "danD", n: "Torbellino prolongado", i: "⏳", m: 2, d: "+0,3 s de duración de la Danza mortal por rango.", fx: { danD: 0.3 } },
      { k: "dagC", n: "Lluvia letal", i: "🗡️", m: 1, d: "La Lluvia de dagas lanza 2 cuchillos más y enfría 1,5 s antes.", fx: { dagN: 2, cd1: 1.5 } },
    ] },
  ],
  xbow: [
    { n: "Virotes", i: "🎯", nodes: [
      { k: "pier", n: "Punta de acero", i: "📍", m: 2, d: "Los virotes básicos perforan 1 enemigo más por rango.", fx: { pier: 1 } },
      { k: "boltDm", n: "Virote pesado", i: "🔩", m: 2, d: "+8% daño del Virote perforante por rango.", fx: { boltDm: 0.08 } },
      { k: "boltC", n: "Tiro certero", i: "🎯", m: 1, d: "−1,5 s de enfriamiento del Virote perforante.", fx: { cd0: 1.5 } },
    ] },
    { n: "Trampas", i: "🪤", nodes: [
      { k: "trapR", n: "Trampas amplias", i: "💥", m: 3, d: "+8% radio de la explosión de la Trampa de púas por rango.", fx: { trapR: 0.08 } },
      { k: "trapS", n: "Cepo largo", i: "⛓️", m: 2, d: "+0,4 s de inmovilización de la Trampa de púas por rango.", fx: { trapS: 0.4 } },
      { k: "trapC", n: "Campo minado", i: "🧷", m: 1, d: "+1 trampa activa (máx. 4) y −2 s de enfriamiento.", fx: { trapN: 1, cd1: 2 } },
    ] },
    { n: "Asedio", i: "🏰", nodes: [
      { k: "crank", n: "Manivela rápida", i: "⚙️", m: 3, d: "+4% velocidad de ataque por rango.", fx: { as: 0.04 } },
      { k: "sieN", n: "Ráfaga de asedio", i: "🔫", m: 2, d: "El Fuego de asedio dispara 1 virote más por rango.", fx: { sieN: 1 } },
      { k: "sieC", n: "Bombardeo", i: "💣", m: 1, d: "−3 s de enfriamiento del Fuego de asedio y sus virotes perforan 1 más.", fx: { cd3: 3, sieP: 1 } },
    ] },
  ],
  rune: [
    { n: "Runas", i: "🔮", nodes: [
      { k: "runeN", n: "Runas gemelas", i: "🔱", m: 2, d: "Las Runas buscadoras lanzan 1 runa más por rango.", fx: { runeN: 1 } },
      { k: "runeDm", n: "Runas cargadas", i: "✨", m: 2, d: "+10% daño de las Runas buscadoras por rango.", fx: { runeDm: 0.1 } },
      { k: "runeC", n: "Resonancia rúnica", i: "🔔", m: 1, d: "−1,5 s de enfriamiento de las Runas buscadoras.", fx: { cd0: 1.5 } },
    ] },
    { n: "Sellos", i: "⭕", nodes: [
      { k: "sealR", n: "Sello extendido", i: "🔵", m: 3, d: "+8% radio del Sello rúnico por rango.", fx: { sealR: 0.08 } },
      { k: "sealD", n: "Sello duradero", i: "⏳", m: 2, d: "+0,8 s de duración del Sello rúnico por rango.", fx: { sealD: 0.8 } },
      { k: "sealC", n: "Sello opresor", i: "🕸️", m: 1, d: "El Sello ralentiza más y enfría 2 s antes.", fx: { sealSl: 0.5, cd1: 2 } },
    ] },
    { n: "Cadencia", i: "⚡", nodes: [
      { k: "rpoi", n: "Veneno rúnico", i: "🧪", m: 2, d: "+1 s de veneno de los disparos rúnicos por rango.", fx: { rpoi: 1 } },
      { k: "ovrD", n: "Sobrecalentamiento", i: "🔥", m: 2, d: "+1 s de duración de la Sobrecarga rúnica por rango.", fx: { ovrD: 1 } },
      { k: "ovrC", n: "Cadencia infinita", i: "♾️", m: 1, d: "−3 s de enfriamiento de la Sobrecarga rúnica.", fx: { cd3: 3 } },
    ] },
  ],
  fimg: [
    { n: "Fuego", i: "🔥", nodes: [
      { k: "flR", n: "Llamarada ancha", i: "🔥", m: 3, d: "+7% alcance de la Llamarada por rango.", fx: { flR: 0.07 } },
      { k: "flD", n: "Brasas persistentes", i: "♨️", m: 2, d: "+1 s de quemadura de la Llamarada por rango.", fx: { flD: 1 } },
      { k: "flC", n: "Infierno", i: "🌋", m: 1, d: "−1,5 s de enfriamiento de la Llamarada.", fx: { cd0: 1.5 } },
    ] },
    { n: "Hielo", i: "❄️", nodes: [
      { k: "glN", n: "Picos largos", i: "🧊", m: 2, d: "El Glaciar lanza 1 pico más por rango.", fx: { glN: 1 } },
      { k: "glF", n: "Hielo profundo", i: "🥶", m: 2, d: "+0,25 s de congelación del Glaciar por rango.", fx: { glF: 0.25 } },
      { k: "glC", n: "Ventisca", i: "🌨️", m: 1, d: "−2 s de enfriamiento y +12% radio de los picos del Glaciar.", fx: { cd1: 2, glR: 0.12 } },
    ] },
    { n: "Termodinámica", i: "⚛️", nodes: [
      { k: "flow", n: "Flujo térmico", i: "🌡️", m: 3, d: "+1,2 de regeneración de maná por rango.", fx: { mr: 1.2 } },
      { k: "shkDm", n: "Contraste", i: "💥", m: 2, d: "+10% daño del Choque térmico por rango.", fx: { shkDm: 0.1 } },
      { k: "shkC", n: "Choque expansivo", i: "🌀", m: 1, d: "−3 s de enfriamiento y +15% radio del Choque térmico.", fx: { cd3: 3, shkR: 0.15 } },
    ] },
  ],
  alch: [
    { n: "Frascos", i: "⚗️", nodes: [
      { k: "flaskR", n: "Frasco ampliado", i: "💥", m: 3, d: "+8% radio de explosión del Frasco corrosivo por rango.", fx: { flaskR: 0.08 } },
      { k: "flaskD", n: "Ácido persistente", i: "🧪", m: 2, d: "+1,5 s de veneno del Frasco corrosivo por rango.", fx: { flaskD: 1.5 } },
      { k: "flaskC", n: "Reacción en cadena", i: "⛓️", m: 1, d: "−1,5 s de enfriamiento del Frasco corrosivo.", fx: { cd0: 1.5 } },
    ] },
    { n: "Nubes", i: "☁️", nodes: [
      { k: "cloudR", n: "Nube expansiva", i: "🌫️", m: 3, d: "+8% radio de la Nube tóxica por rango.", fx: { cloudR: 0.08 } },
      { k: "cloudD", n: "Vapores persistentes", i: "⏳", m: 2, d: "+0,8 s de duración de la Nube tóxica por rango.", fx: { cloudD: 0.8 } },
      { k: "cloudC", n: "Miasma", i: "☣️", m: 1, d: "−2 s de enfriamiento y +20% de daño de la Nube tóxica.", fx: { cd1: 2, cloudDm: 0.2 } },
    ] },
    { n: "Contagio", i: "🦠", nodes: [
      { k: "plN", n: "Contagio ampliado", i: "🦠", m: 2, d: "La Pandemia afecta a 1 enemigo más por rango.", fx: { plN: 1 } },
      { k: "plH", n: "Savia vital", i: "💚", m: 2, d: "La Pandemia cura +0,5% de vida por enemigo (tope +2%) por rango.", fx: { plH: 0.005, plC: 0.02 } },
      { k: "plC", n: "Plaga virulenta", i: "☠️", m: 1, d: "−3 s de enfriamiento y +15% radio de la explosión de la Pandemia.", fx: { cd3: 3, plR: 0.15 } },
    ] },
  ],
};

// Árbol de la clase actual (o null si no hay clase / aprendiz).
const ttOf = () => (P && !P.nov && TT[P.ck]) || null;
const ttNodes = () => (ttOf() || []).flatMap((b) => b.nodes);
// Rango aprendido de la mejora k.
const trk = (k) => (P && P.tal && P.tal[k]) || 0;
// ¿Está desbloqueada la mejora j de la rama b? (la anterior de su rama debe estar completa)
const ttOpen = (b, j) => j == 0 || trk(b.nodes[j - 1].k) >= b.nodes[j - 1].m;
// Suma de los modificadores de las mejoras aprendidas → P.tm (se recalcula en ST).
function tmCalc() {
  const tm = {};
  for (const n of ttNodes()) {
    const r = trk(n.k);
    if (r) for (const m in n.fx) tm[m] = (tm[m] || 0) + n.fx[m] * r;
  }
  return tm;
}
// Valor del modificador k de las mejoras de clase (0 si no hay).
const tv = (k) => (P && P.tm && P.tm[k]) || 0;
// Puntos gastados en el árbol.
const ttSpent = () => ttNodes().reduce((s, n) => s + trk(n.k), 0);

function tal(f) {
  if (G.st != "play" || (G.ov && !G.tl)) return;
  if (G.tl && !f) {
    hide();
    return;
  }
  const T = ttOf();
  if (!T) {
    flash("Elige una clase para aprender mejoras");
    return;
  }
  G.tl = 1;
  G.pz = 1;
  ov.style.display = "flex";
  const c = curCls(),
    br = BRN[c.br].c,
    col = T.map((b) => {
      const nodes = b.nodes
        .map((n, j) => {
          const r = trk(n.k),
            open = ttOpen(b, j),
            full = r >= n.m,
            can = open && !full && P.pts > 0;
          return (
            (j ? `<div class="tt-link${open ? " on" : ""}"></div>` : "") +
            `<button class="tt-node${full ? " full" : r ? " part" : ""}${open ? "" : " lock"}${can ? " can" : ""}" data-k="${n.k}" ${open ? "" : "disabled"}>` +
            `<span class="tt-ic">${open ? n.i : "🔒"}</span>` +
            `<span class="tt-tx"><b>${n.n}</b><small>${n.d}</small></span>` +
            `<span class="tt-rk">${"●".repeat(r)}${"○".repeat(n.m - r)}</span></button>`
          );
        })
        .join("");
      const sp = b.nodes.reduce((s, n) => s + trk(n.k), 0),
        tot = b.nodes.reduce((s, n) => s + n.m, 0);
      return `<div class="tt-col"><div class="tt-bh"><span>${b.i}</span><b>${b.n}</b><small>${sp}/${tot}</small></div>${nodes}</div>`;
    })
    .join("");
  ov.innerHTML =
    `<div class="uw tt" style="--tc:${br}"><div class="uw-top"><h2>${c.i} Mejoras de ${c.n}</h2><button class="uw-btn" id="ttx">Cerrar (T)</button></div>` +
    `<p class="uw-sub">Puntos disponibles: <b>${P.pts}</b> (1 por nivel) · gastados: ${ttSpent()}. Completa una mejora para desbloquear la siguiente de su rama.</p>` +
    `<div class="tt-cols">${col}</div></div>`;
  ov.querySelector("#ttx").onclick = hide;
  ov.querySelectorAll(".tt-node").forEach((el) => {
    el.onclick = () => {
      const n = ttNodes().find((q) => q.k == el.dataset.k),
        b = T.find((q) => q.nodes.includes(n));
      if (!n || P.pts < 1 || trk(n.k) >= n.m || !ttOpen(b, b.nodes.indexOf(n))) return;
      P.pts--;
      P.tal[n.k] = trk(n.k) + 1;
      ST();
      snd(660, 0.08, "triangle");
      tal(1);
    };
  });
}
function vic() {
  show(
    "<h1>\u00a1PROFUNDIDAD " +
      G.d +
      " CONQUISTADA!</h1><p>Has vencido a " +
      G.bi[0] +
      ". Puedes retirarte con gloria o seguir descendiendo.</p>",
    [
      {
        i: "🏆",
        n: "Retirarte con gloria",
        tp: "Victoria",
        r: 3,
        d: "Terminas la expedici\u00f3n: conservas TODO tu oro como almas (+50 de bonificaci\u00f3n).",
        nc: 1,
        f: win,
      },
      {
        i: "\u2b07\ufe0f",
        n: "Seguir descendiendo",
        tp: "Continuar",
        r: 1,
        d: "Vuelve al portal (F) cuando est\u00e9s listo. Si mueres, solo conservas la mitad del oro.",
        f: () => {},
      },
    ],
  );
}
function win() {
  G.st = "won";
  cnt("vic");
  chk();
  S.best = Math.max(S.best, G.d);
  S.souls += P.gold + 50;
  checkUnlocks();
  save();
  show(
    `<h1>VICTORIA</h1><p>Profundidad ${G.d} \u00b7 Nivel ${P.lv} \u00b7 ${G.kills} enemigos. Almas totales: ${S.souls}</p>`,
    [{ t: "Volver a la zona segura", nc: 1, f: menu }],
  );
}

