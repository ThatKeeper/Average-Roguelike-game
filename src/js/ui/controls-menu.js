/* ======================================================================
 * src/js/ui/controls-menu.js
 * Ventana de ajustes (pestañas: sonido, juego, táctil, controles, extras) y reasignación de teclas.
 * Mismo aspecto que la ventana del inventario (ver css/windows.css).
 *
 * Define:
 * uiEl, CFG, cfgMenu, cfgRender, cfgClose, ctrls
 * ====================================================================== */

const uiEl = (t, c, h) => {
  const e = document.createElement(t);
  if (c) e.className = c;
  if (h !== undefined) e.innerHTML = h;
  return e;
};
const CFG = { ret: null, tab: "snd" };
const CTRL_L = {
  up: "Arriba", down: "Abajo", left: "Izquierda", right: "Derecha",
  q: "Habilidad Q", e: "Habilidad E", r: "Habilidad R", util: "Habilidad de rama",
  dodge: "Esquivar", use: "Interactuar", inv: "Inventario", map: "Mapa", tal: "Talentos",
  php: "Poción de vida", pmp: "Poción de maná", book: "Cartas de hechizo",
  c1: "Carta 1", c2: "Carta 2", c3: "Carta 3", c4: "Carta 4",
};
// Abre los ajustes. ret: función a la que volver al cerrar (p. ej. la pausa); null = volver al hub.
function cfgMenu(ret) {
  if (ret !== undefined) CFG.ret = ret;
  if (G.st != "play") G.st = "menu";
  cfgRender();
}
function cfgClose() {
  G.rb = 0;
  hide();
  if (CFG.ret) CFG.ret();
  else {
    G.cfg = 0;
    hub();
  }
}
const ctrls = () => {
  CFG.tab = "ctl";
  cfgRender();
};

function cfgRender() {
  const keep = ov.firstChild ? ov.firstChild.scrollTop : 0;
  ov.style.display = "flex";
  ov.innerHTML = "";
  G.ov = 1;
  const re = () => cfgRender(),
    on = (k, f) => () => {
      f();
      save();
      re();
    },
    row = (l, d, ...ctl) => {
      const r = uiEl("div", "uw-row"),
        a = uiEl("div", "uw-lbl", `<b>${l}</b>${d ? `<small>${d}</small>` : ""}`),
        c = uiEl("div", "uw-ctl");
      ctl.forEach((q) => c.appendChild(q));
      r.append(a, c);
      return r;
    },
    sw = (v, f) => {
      const b = uiEl("button", "uw-sw" + (v ? " on" : ""));
      b.setAttribute("aria-pressed", v ? "true" : "false");
      b.onclick = on(0, f);
      return b;
    },
    seg = (opts, cur, f) => {
      const d = uiEl("div", "uw-seg");
      opts.forEach(([val, t]) => {
        const b = uiEl("button", val === cur ? "on" : "", t);
        b.onclick = on(0, () => f(val));
        d.appendChild(b);
      });
      return d;
    },
    sl = (key) => {
      const v = Math.round((S[key] ?? 1) * 100),
        d = uiEl("div", "uw-sl"),
        i = uiEl("input"),
        o = uiEl("output", "", v + "%");
      i.type = "range";
      i.min = 0;
      i.max = 100;
      i.step = 5;
      i.value = v;
      i.style.setProperty("--p", v + "%");
      i.oninput = () => {
        S[key] = i.value / 100;
        o.textContent = i.value + "%";
        i.style.setProperty("--p", i.value + "%");
        snd(440 + i.value * 2, 0.06, "sine", 0.05);
      };
      i.onchange = save;
      d.append(i, o);
      return d;
    },
    sec = (t, ...rows) => {
      const s = uiEl("div", "uw-sec", `<h3>${t}</h3>`);
      rows.forEach((r) => s.appendChild(r));
      return s;
    },
    btn = (t, f, c) => {
      const b = uiEl("button", c || "", t);
      b.onclick = f;
      return b;
    };
  const win = uiEl("div", "uw"),
    top = uiEl("div", "uw-top", `<h2>⚙ Ajustes</h2>`);
  top.appendChild(btn("Volver (Esc)", cfgClose, "uw-btn"));
  win.appendChild(top);
  const tabs = [["snd", "🔊 Sonido"], ["gam", "🎮 Juego"], ["tch", "👆 Táctil"], ["ctl", "⌨ Controles"]];
  if (G.st != "play") tabs.push(["ext", "📚 Extras"]);
  if (!tabs.some((t) => t[0] == CFG.tab)) CFG.tab = "snd";
  const tb = uiEl("div", "uw-tabs");
  tabs.forEach(([k, t]) => {
    const b = btn(t, () => {
      G.rb = 0;
      CFG.tab = k;
      re();
    }, k == CFG.tab ? "on" : "");
    tb.appendChild(b);
  });
  win.appendChild(tb);
  const body = uiEl("div", "uw-body");
  win.appendChild(body);
  const T = CFG.tab;
  if (T == "snd")
    body.append(
      sec("Volumen", row("General", "Volumen de todo el juego", sl("vol")), row("Música", "Música ambiental", sl("vm")), row("Efectos", "Golpes, habilidades y avisos", sl("vfx"))),
      sec("Música", row("Música de fondo", "Activa o apaga la música ambiental", sw(!S.mute, () => (S.mute = !S.mute)))),
    );
  else if (T == "gam")
    body.append(
      sec("Pantalla",
        row("Temblor de pantalla", "Sacudida de cámara al recibir daño y en explosiones", sw(!S.nosh, () => (S.nosh = !S.nosh))),
        row("Gráficos", "Ligeros recomendado en móvil", seg([[false, "Ligeros"], [true, "Altos"]], !!S.hq, (v) => {
          S.hq = v;
          LOW = TOUCH && !S.hq;
        })),
      ),
    );
  else if (T == "tch") {
    body.append(
      sec("Controles táctiles",
        row("Mostrar controles", "Automático los muestra solo en pantallas táctiles", seg([["auto", "Auto"], ["on", "Siempre"], ["off", "Nunca"]], S.touch || "auto", (v) => {
          S.touch = v;
          TOUCH = S.touch == "on" || (S.touch != "off" && TOUCH_AUTO);
          if (TOUCH) buildTouch();
          tcApply();
        })),
        row("Tamaño de los botones", "", seg([[0.8, "80%"], [1, "100%"], [1.25, "125%"]], S.tscale || 1, (v) => {
          S.tscale = v;
          tcApply();
        })),
        row("Movimiento", "", seg([[false, "Joystick"], [true, "Cruceta"]], !!S.dpad, (v) => {
          S.dpad = v;
          tcReset();
          tcApply();
        })),
        row("Apuntar al moverse", "El ataque sale hacia donde caminas (si no, auto-apuntado)", sw(!!S.aimmv, () => (S.aimmv = !S.aimmv))),
      ),
      sec("Distribución",
        row("Ordenar botones", "Arrastra los botones donde quieras", btn("🎛️ Editar", () => tcEditStart(() => cfgRender()), "uw-btn")),
        row("Restablecer botones", "Vuelve a la distribución automática", btn("↺ Restablecer", () => {
          tcResetLayout();
          flash("Botones restablecidos");
        }, "uw-btn")),
      ),
    );
  } else if (T == "ctl") {
    const g = uiEl("div", "uw-keys");
    Object.keys(CTRL_L).forEach((k) => {
      const b = uiEl("button", "uw-key" + (G.rb == k ? " wait" : ""), `<span>${CTRL_L[k]}</span><kbd>${G.rb == k ? "…" : KL(KY[k])}</kbd>`);
      b.onclick = () => {
        G.rb = k;
        re();
      };
      g.appendChild(b);
    });
    const s = uiEl("div", "uw-sec", `<h3>Teclas (pulsa una acción y luego la nueva tecla · Esc cancela)</h3>`);
    s.appendChild(g);
    body.appendChild(s);
    body.appendChild(sec("", row("Restablecer teclas", "Vuelve a las teclas originales", btn("↺ Restablecer", () => {
      Object.assign(KY, KD);
      S.keys = KY;
      save();
      re();
    }, "uw-btn dng"))));
  } else {
    body.append(
      sec("Accesos",
        row("🏆 Logros", "", btn("Abrir", achMenu, "uw-btn")),
        row("📖 Bestiario", "", btn("Abrir", bestMenu, "uw-btn")),
        row("🌀 Arena de jefes", "", btn("Abrir", arenaMenu, "uw-btn")),
      ),
    );
  }
  ov.appendChild(win);
  win.scrollTop = keep;
}
