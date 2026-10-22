/* ======================================================================
 * src/js/ui/overlay.js
 * Capa de menús (ov): cerrar, mensajes, menú antiguo y pausa.
 *
 * Define:
 * hide, flash, legacy, pause
 * ====================================================================== */

function hide() {
  ov.style.display = "none";
  ov.innerHTML = "";
  G.ov = 0;
  G.pz = 0;
  G.iv = 0;
  G.bk = 0;
  G.tl = 0;
}
function flash(t) {
  msg = [t, 2.5];
}
function legacy() {
  G.st = "menu";
  show(
    `<h1>AVERAGE ROGUELIKE GAME</h1><p>Mazmorra infinita de fantasía oscura. Cada nivel termina con un jefe; después, un descenso más profundo y peligroso.</p><p><b>Si mueres pierdes:</b> nivel, armas, reliquias y botín de la expedición. <b>Conservas:</b> tu mejor profundidad y la mitad del oro como almas, con las que compras mejoras permanentes.</p><p>WASD mover · Ratón apuntar · Clic izq. atacar · Clic der. habilidad/guardia · Espacio esquivar · Q/E habilidades · F interactuar · I inventario · M mapa · Esc pausa</p><p>${S.hard ? '<b style="color:#f55">☠ MODO DIFÍCIL ACTIVO</b> · ' : ""}Mejor profundidad: <b>${S.best}</b> · Almas: <b>${S.souls}</b></p>`,
    [
      {
        t: "⚔ Guerrero (cuerpo a cuerpo)",
        i: "⚔️",
        n: "Guerrero",
        tp: "Clase · cuerpo a cuerpo",
        r: 0,
        d: "Espada, guardia con parada perfecta, remolino y salto. Resistente y letal de cerca.",
        stx: "FUE +4 · Espada",
        f: () => run(0),
      },
      {
        t: "🏹 Cazador (a distancia)",
        i: "🏹",
        n: "Cazador",
        tp: "Clase · a distancia",
        r: 0,
        d: "Arco, andanada, flecha explosiva y flecha venenosa. Movilidad y crítico.",
        stx: "DES +4 · Arco",
        f: () => run(5),
      },
      {
        t: "✦ Mago (magia)",
        i: "🪄",
        n: "Mago",
        tp: "Clase · magia",
        r: 0,
        d: "Báculo arcano, bola de fuego, nova de hielo y rayo en cadena. Usa maná.",
        stx: "INT +4 · Báculo",
        f: () => run(9),
      },
      {
        t: `Forja de almas: +6% daño permanente (nivel ${S.pw}, ${40 * (S.pw + 1)} almas)`,
        i: "🔨",
        n: "Forja de almas",
        tp: "Mejora permanente",
        r: 2,
        d: "+6% de daño permanente en todas tus partidas.",
        stx: `Nivel ${S.pw} · coste ${40 * (S.pw + 1)} almas`,
        nc: 1,
        f: () => {
          const c = 40 * (S.pw + 1);
          if (S.souls >= c) {
            S.souls -= c;
            S.pw++;
            save();
          }
          menu();
        },
      },
      { t: "Controles", nc: 1, f: ctrls },
      {
        t: "Música: " + (S.mute ? "apagada" : "encendida"),
        nc: 1,
        f: () => {
          S.mute = !S.mute;
          save();
          menu();
        },
      },
      {
        t: "Volumen general: " + Math.round((S.vol ?? 1) * 100) + "%",
        nc: 1,
        f: () => {
          S.vol = [1, 0.6, 0.3, 0][([1, 0.6, 0.3, 0].indexOf(S.vol ?? 1) + 1) % 4];
          save();
          menu();
        },
      },
      {
        t: "Temblor de pantalla: " + (S.nosh ? "no" : "sí"),
        nc: 1,
        f: () => {
          S.nosh = !S.nosh;
          save();
          menu();
        },
      },
      {
        t: "Controles táctiles: " + ({ on: "siempre", off: "nunca" }[S.touch] || "automático"),
        nc: 1,
        f: () => {
          S.touch = { on: "off", off: "auto" }[S.touch] || "on";
          save();
          TOUCH = S.touch == "on" || (S.touch != "off" && TOUCH_AUTO);
          if (TOUCH) buildTouch();
          tcApply();
          menu();
        },
      },
      {
        t: "Tamaño de controles táctiles: " + Math.round((S.tscale || 1) * 100) + "%",
        nc: 1,
        f: () => {
          S.tscale = [1, 1.25, 0.8][([1, 1.25, 0.8].indexOf(S.tscale || 1) + 1) % 3];
          save();
          tcApply();
          menu();
        },
      },
      {
        t: "Gráficos: " + (S.hq ? "altos" : "ligeros (recomendado en móvil)"),
        nc: 1,
        f: () => {
          S.hq = !S.hq;
          save();
          LOW = TOUCH && !S.hq;
          menu();
        },
      },
      { t: "🏆 Logros", nc: 1, f: achMenu },
      { t: "📖 Bestiario", nc: 1, f: bestMenu },
      { t: "Arena de jefes", nc: 1, f: arenaMenu },
    ],
  );
}
function pause() {
  if (G.pz) {
    hide();
    return;
  }
  if (G.ov) return;
  G.pz = 1;
  show("<h2>Pausa</h2>", [
    { t: "Reanudar", f: () => {} },
    {
      t: "Abandonar expedición",
      nc: 1,
      f: () => {
        G.pz = 0;
        die(1);
      },
    },
  ]);
}

