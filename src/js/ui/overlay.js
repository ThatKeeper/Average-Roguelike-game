/* ======================================================================
 * src/js/ui/overlay.js
 * Capa de menús (ov): cerrar, mensajes, menú antiguo y pausa.
 *
 * Define:
 * DRAGLOCK, hide, flash, legacy, pause
 * ====================================================================== */

// Candado de arrastre táctil: mientras un elemento se arrastra con el dedo (tras una pulsación larga o un gesto horizontal) se bloquea el
// desplazamiento de la ventana. Fuera de eso las ventanas se desplazan con el dedo también sobre los elementos arrastrables
// (antes tenían touch-action:none y en móvil no se podía bajar por el inventario, el grimorio ni las tiendas).
let DRAGLOCK = 0;
addEventListener("touchmove", (e) => DRAGLOCK && e.cancelable && e.preventDefault(), { passive: false });


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
        f: () => run(1),
      },
      {
        t: "✦ Mago (magia)",
        i: "🪄",
        n: "Mago",
        tp: "Clase · magia",
        r: 0,
        d: "Báculo arcano, bola de fuego, nova de hielo y rayo en cadena. Usa maná.",
        stx: "INT +4 · Báculo",
        f: () => run(2),
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
        t: "Movimiento táctil: " + (S.dpad ? "cruceta" : "joystick"),
        nc: 1,
        f: () => {
          S.dpad = !S.dpad;
          save();
          tcReset();
          tcApply();
          menu();
        },
      },
      {
        t: "Apuntar al moverse: " + (S.aimmv ? "sí (el ataque sale hacia donde caminas)" : "no (auto-apuntado)"),
        nc: 1,
        f: () => {
          S.aimmv = !S.aimmv;
          save();
          menu();
        },
      },
      { t: "🎛️ Ordenar botones táctiles", nc: 1, f: () => tcEditStart(menu) },
      {
        t: "↺ Restablecer botones táctiles",
        nc: 1,
        f: () => {
          tcResetLayout();
          flash("Botones restablecidos");
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
  if (G.fin) return; // durante el final animado no hay pausa
  if (G.pz) {
    hide();
    return;
  }
  if (G.ov) return;
  pauseMenu();
}
// Ventana de pausa: personaje, accesos rápidos y salida con confirmación
function pauseMenu(confirm) {
  G.pz = 1;
  G.ov = 1;
  ov.style.display = "flex";
  ov.innerHTML = "";
  const win = uiEl("div", "uw ps"),
    top = uiEl("div", "uw-top", "<h2>⏸ Pausa</h2>"),
    b = (t, f) => {
      const e = uiEl("button", "uw-btn", t);
      e.onclick = f;
      return e;
    };
  top.appendChild(b("Reanudar (Esc)", hide));
  win.appendChild(top);
  win.appendChild(uiEl("p", "uw-sub", `Profundidad ${G.d} · ${G.bi[0]}${G.train ? " · entrenamiento" : G.arena ? " · arena" : ""}`));
  const main = uiEl("div", "ps-main"),
    ch = uiEl("div", "ps-char"),
    cv = uiEl("canvas");
  cv.width = DOLL_W;
  cv.height = DOLL_H;
  try {
    drawDoll(cv);
  } catch (e) {}
  const pc = (v, c) => `<div class="ps-bar"><i style="width:${Math.round(cl(v, 0, 1) * 100)}%;background:${c}"></i></div>`;
  ch.append(cv, uiEl("b", "", `${curCls().n}`), uiEl("small", "", `Nivel ${P.lv} · ${P.w.n}<br>Vida ${Math.ceil(P.hp)}/${P.mhp} · Maná ${Math.floor(P.mp)}/${P.mmp}<br>Oro ${P.gold} · ${G.kills} enemigos`),
    uiEl("div", "ps-bars", pc(P.hp / P.mhp, "#d9434e") + pc(P.mp / Math.max(1, P.mmp), "#4a90e2") + pc(P.xp / P.nx, "#e0b84a")));
  const menu_ = uiEl("div", "ps-menu"),
    item = (ic, t, k, f, c) => {
      const e = uiEl("button", c || "", `<i>${ic}</i>${t}${k ? `<kbd>${k}</kbd>` : ""}`);
      e.onclick = f;
      menu_.appendChild(e);
    };
  item("▶", "Reanudar", "Esc", hide, "pri");
  item("🎒", "Inventario", KL(KY.inv), () => {
    hide();
    inv();
  });
  item("🗺️", "Mapa", KL(KY.map), () => {
    hide();
    bigmap = 1;
  });
  item("⚙", "Ajustes", "", () => cfgMenu(() => pauseMenu()));
  if (confirm) {
    const cf = uiEl("div", "cf", `<b>${G.train || G.arena ? "¿Salir?" : "¿Abandonar la expedición?"}</b><br><small>${G.train || G.arena ? "No pierdes nada." : "Perderás tu equipo y reliquias; conservas la mitad del oro como almas."}</small>`),
      r = uiEl("div");
    r.append(b(G.train || G.arena ? "Sí, salir" : "Sí, abandonar", () => {
      G.pz = 0;
      hide();
      die(1);
    }), b("Cancelar", () => pauseMenu()));
    cf.appendChild(r);
    r.firstChild.classList.add("dng");
    menu_.appendChild(cf);
  } else item("🚪", G.train || G.arena ? "Salir" : "Abandonar expedición", "", () => pauseMenu(1), "dng");
  main.append(ch, menu_);
  win.appendChild(main);
  ov.appendChild(win);
}
