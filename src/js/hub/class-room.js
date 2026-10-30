/* ======================================================================
 * src/js/hub/class-room.js
 * Sala de clases (a la derecha del hub): árbol de clases ramificado por estadística (Fuerza, Destreza,
 * Inteligencia), pedestales con el aspecto de cada clase, pedestales "próximamente" para las armas que aún
 * no tienen clase y una zona de pruebas con maniquíes.
 *
 * Al elegir una clase se crea al instante al personaje con su arma, su HUD y sus habilidades (G.sbx):
 * puedes probarlas contra los maniquíes y, al bajar a la mazmorra, ya lo llevas todo puesto.
 *
 * Define:
 * CR_ROOM, CR_LANE, CR_NODES, CR_DUM, chosenCls, goClassRoom, crEnter, crExit, crStep, crFrame, crDraw,
 * crUse, crClassMenu, crSetClass, drawHubHero
 * ====================================================================== */

// Clase elegida válida (índice de CLS) o -1 si no hay ninguna
const chosenCls = () => (typeof S.cls == "number" && CLS[S.cls] && clsOK(S.cls) ? S.cls : -1);

// Salas "virtuales" para que el combate (upP, upE, upPR...) funcione fuera de la mazmorra:
//  G.hr 1 = sala de clases (sin combate) · G.hr 2 = sala de pruebas (combate contra maniquíes)
const CR_ROOM = { obs: [], nb: {}, cl: 1, st: 1, wv: 0, tp: "hub", hz: [], O: [], gx: 0, gy: 0, dens: 0.03 },
  TS_ROOM = { obs: [], nb: {}, cl: 1, st: 1, wv: 0, tp: "hub", hz: [], O: [], gx: 1, gy: 0, dens: 0.03 };
const CR_LANE = { str: 150, dex: 300, int: 450 },
  CR_DUM = [
    [520, 190],
    [640, 300],
    [520, 410],
    [780, 220],
    [780, 380],
    [850, 300],
  ];
// Nodos: clases (base y avanzadas) y pedestales "próximamente"
const CR_NODES = [];
for (const br of ["str", "dex", "int"]) {
  const ly = CR_LANE[br],
    bi = CLS.findIndex((c) => c.br == br && c.par < 0);
  CR_NODES.push({ t: "cls", i: bi, br, x: 175, y: ly, base: 1 });
  CLS.forEach((c, i) => {
    if (c.par == bi) {
      const n = CR_NODES.filter((q) => q.t == "cls" && CLS[q.i].par == bi).length;
      CR_NODES.push({ t: "cls", i, br, x: 370, y: ly + (n ? 46 : -46) });
    }
  });
  SOON[br].forEach((w, j) => CR_NODES.push({ t: "soon", w, br, x: 615 + j * 85, y: ly }));
}
const crNear = () => {
  if (G.hr != 1) return null;
  let b = null,
    bd = 52;
  for (const n of CR_NODES) {
    const d = Math.hypot(n.x - P.x, n.y - P.y);
    if (d < bd) {
      bd = d;
      b = n;
    }
  }
  return b;
};

// ---- entrada y salida ----
// Coloca al jugador en la sala `room` (1 clases, 2 pruebas) en (x0,y0)
function crEnter(x0, y0, room = 1) {
  const ci = chosenCls();
  G.hr = room;
  G.sbx = 1;
  G.nocb = room == 1;
  if (G.cp !== ci || !P) {
    mkPlayer(ci);
    G.cp = ci;
  }
  P.x = x0 ?? 88;
  P.y = y0 ?? 300;
  P.vx = P.vy = 0;
  P.hp = P.mhp;
  P.mp = P.mmp;
  G.d = 1;
  G.bi = BI[0];
  G.seed = 4242;
  RM_ = room == 1 ? CR_ROOM : TS_ROOM;
  RM_.O = [];
  E = [];
  PR = [];
  Z = [];
  FX = [];
  NM = [];
  O = RM_.O;
  TR = [];
  FZ = [];
  LT = [];
  ZN = [];
  SW = null;
  K = {};
  M.d = M.r = 0;
  G.dt = 0;
  hide();
  const nw = clsCheck();
  if (nw.length) G.ncl = (G.ncl || []).concat(nw);
}
function crLeave() {
  G.hr = 0;
  G.sbx = 0;
  G.nocb = 0;
  E = [];
  PR = [];
  FX = [];
  NM = [];
  FZ = [];
  TR = [];
  LT = [];
  SW = null;
  K = {};
  M.d = M.r = 0;
}
// Transiciones: la cámara se desliza entre el hub, la sala de clases y la sala de pruebas
function goClassRoomSlide() {
  if (XTR || trnBusy()) return;
  trnHubSlide(1, () => crEnter(88, 300, 1), { x: HB.x, y: HB.y }, { x: 88, y: 300 });
}
function crExit() {
  const y0 = P.y;
  trnHubSlide(
    3,
    () => {
      crLeave();
      HB.x = 862;
      HB.y = 300;
    },
    { x: P.x, y: y0 },
    { x: 862, y: 300 },
  );
}
const crToTest = () => trnHubSlide(1, () => crEnter(88, 300, 2), { x: P.x, y: P.y }, { x: 88, y: 300 }),
  crToClasses = () => trnHubSlide(3, () => crEnter(884, 300, 1), { x: P.x, y: P.y }, { x: 884, y: 300 });
// Teletransporte con cubitos (cuando intentas bajar sin clase)
function goClassRoom() {
  hide();
  trnCubes("up");
  crEnter(88, 300, 1);
}

// ---- simulación (paso fijo de 1/60 s, llamado desde el bucle principal) ----
function crStep(h) {
  upE(h);
  upPR(h);
  upMisc(h);
  const dy = Math.abs(P.y - 300) < 60;
  if (G.hr == 2) {
    G.dt -= h;
    if (G.dt <= 0) {
      G.dt = 0.8;
      for (const s of CR_DUM)
        if (!E.some((e) => e.t == "dummy" && e.hp > 0 && Math.hypot(e.x - s[0], e.y - s[1]) < 40)) {
          const q = spawn("dummy", s[0], s[1]);
          q.hp = q.mhp = 600;
          q.al = 1;
          q.sp = 0.2;
        }
    }
    if (P.x <= RB.x0 + P.r + 4 && dy && !XTR) crToClasses();
    return;
  }
  if (P.x <= RB.x0 + P.r + 4 && dy && !XTR) crExit();
  else if (P.x >= RB.x1 - P.r - 4 && dy && !XTR) crToTest();
}

// ---- interacción ----
function crUse() {
  if (G.ov || trnBusy()) return;
  const n = crNear();
  if (!n) return flash("Acércate a un pedestal y pulsa " + KL(KY.use));
  if (n.t == "soon") return flash("Próximamente: clase con " + n.w);
  crClassMenu(n.i);
}
const BON_TXT = { hp: ["vida máx.", 1], mp: ["maná máx.", 1], spd: ["velocidad", 1], cc: ["prob. de crítico", 1], as: ["vel. de ataque", 1], dm: ["daño", 1], arm: ["armadura", 0] };
function crBonus(c) {
  const t = Object.keys(c.bon).map((k) => {
    const v = c.bon[k],
      s = BON_TXT[k];
    return (v > 0 ? "+" : "−") + (s[1] ? Math.round(Math.abs(v) * 100) + " %" : Math.abs(v)) + " " + s[0];
  });
  for (const k in c.a2) t.push("+" + c.a2[k] + " " + { str: "FUE", dex: "DES", int: "INT", vit: "VIT", agi: "AGI", luk: "SUE" }[k]);
  return t.length ? t.join(" · ") : "Sin bonificaciones pasivas";
}
function crClassMenu(i) {
  const c = CLS[i],
    B = BRN[c.br],
    ok = clsOK(i),
    ch = chosenCls() == i,
    keys = ["Q", "E", "Clic der.", "R"],
    L = [];
  for (let k = 0; k < 4; k++) {
    const A = skOf(c.k, k);
    if (!A) continue;
    const nm = k == 2 && c.br == "str" ? "Guardia / parry (también C)" : A.n;
    L.push(`<div style="margin:3px 0"><b style="color:${B.c}">[${keys[k]}]</b> <b>${nm}</b>${A.cd ? ` <small>· ${A.cd} s${A.mp ? " · " + A.mp + " maná" : ""}</small>` : ""}<br><small style="opacity:.85">${k == 2 && c.br == "str" ? A.d : A.d}</small></div>`);
  }
  const U2 = skUtil(c.br);
  if (c.br != "str") L.push(`<div style="margin:3px 0"><b style="color:#c9a24a">[${KL(KY.util)}]</b> <b>${U2.n}</b> <small>· siempre disponible · ${U2.cd} s</small><br><small style="opacity:.85">${U2.d}</small></div>`);
  const rq = c.req.length
    ? c.req.map((r) => `<div style="color:${clsReqOK(r) ? "#8c8" : "#e88"}">${clsReqOK(r) ? "✓" : "✗"} ${clsReqTxt(r)}</div>`).join("")
    : '<div style="color:#8c8">✓ Clase base: siempre disponible</div>';
  const mgn = c.br == "int" ? "<p><small>Las clases de Inteligencia usan cartas y hechizos solo mientras llevas un arma mágica.</small></p>" : "";
  const h = `<h2 style="color:${B.c}">${c.i} ${c.n}</h2><p><b>Rama de ${B.n}</b> · ${c.tag}</p><p>${c.d}</p><p>Arma inicial: <b>${WP[c.w].n}</b><br><small>${crBonus(c)}</small></p><div style="text-align:left;max-width:600px;font-size:13px;border:1px solid ${B.c}55;border-radius:8px;padding:8px 12px;background:#14101cc0">${L.join("")}</div>${mgn}<div style="text-align:left;font-size:12px;margin-top:2px"><b>Requisitos</b>${rq}</div>`;
  show(h, [
    ok
      ? {
          t: ch ? "✔ Es tu clase actual" : "Elegir " + c.n,
          nc: 1,
          f: () => {
            if (ch) return hide();
            S.cls = i;
            save();
            hide();
            crSetClass(i);
          },
        }
      : { t: "🔒 Bloqueada", nc: 1, f: hide },
    { t: "Cerrar", nc: 1, f: hide },
  ]);
}
// Pone al personaje la clase elegida: arma, HUD y habilidades listos para probar y para bajar
function crSetClass(i) {
  const x0 = P.x,
    y0 = P.y;
  mkPlayer(i);
  G.cp = i;
  P.x = x0;
  P.y = y0;
  FZ = [];
  TR = [];
  LT = [];
  PR = [];
  FX.push({ k: "ring", x: P.x, y: P.y, r: 60, t: 0.5, m: 0.5, c: BRN[CLS[i].br].c }, { k: "ring", x: P.x, y: P.y, r: 30, t: 0.35, m: 0.35, c: "#fff" });
  burst(P.x, P.y, BRN[CLS[i].br].c, 10, 160);
  snd(660, 0.25, "triangle", 0.06);
  snd(990, 0.3, "sine", 0.05);
  flash(`Clase elegida: ${CLS[i].n} · ${P.w.n} equipada`);
}

// ---- dibujo ----
const CRK = { str: "m", dex: "r", int: "g" };
function drawNodeHero(c, cx, cy, sc, a, alpha) {
  x.save();
  x.globalAlpha = alpha;
  x.translate(cx, cy);
  x.scale(sc, sc);
  drawHeroBody(x, CRK[c.br], a, 12, 0, c.col, c.dk, c.k);
  x.restore();
}
// Héroe del hub (sin P): sin clase es el círculo blanco original; con clase elegida, su aspecto
function drawHubHero(px, py) {
  const ci = chosenCls(),
    c = CLS[ci],
    t = Date.now() / 1000;
  x.save();
  x.fillStyle = "#0006";
  x.beginPath();
  x.ellipse(px, py + 11, 12, 4.5, 0, 0, 7);
  x.fill();
  x.translate(px, py + Math.sin(t * 3) * 1.5);
  if (ci < 0) {
    x.fillStyle = "#e8e8ee";
    x.strokeStyle = "#000";
    x.lineWidth = 2;
    x.beginPath();
    x.arc(0, 0, 12, 0, 7);
    x.fill();
    x.stroke();
  } else drawHeroBody(x, CRK[c.br], 0.35, 12, 0, c.col, c.dk, c.k);
  x.restore();
}
function crRails() {
  const t = Date.now() / 1000;
  x.save();
  x.lineCap = "round";
  // trazo luminoso; on = camino abierto (sólido) · !on = bloqueado (discontinuo y más tenue, pero siempre visible)
  const seg = (pts, col, on) => {
    x.strokeStyle = col;
    x.globalAlpha = on ? 0.6 : 0.42;
    x.lineWidth = on ? 5 : 4;
    x.setLineDash(on ? [] : [10, 9]);
    x.beginPath();
    pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])));
    x.stroke();
    x.setLineDash([]);
    if (on) {
      x.globalAlpha = 0.9;
      x.lineWidth = 1.5;
      x.strokeStyle = "#fff";
      x.setLineDash([2, 14]);
      x.lineDashOffset = -t * 40;
      x.stroke();
      x.setLineDash([]);
    }
  };
  seg([[62, 300], [105, 300]], "#c9a24a", 1);
  seg([[105, CR_LANE.str], [105, CR_LANE.int]], "#c9a24a", 1);
  for (const br of ["str", "dex", "int"]) {
    const ly = CR_LANE[br],
      c = BRN[br].c,
      bi = CLS.findIndex((q) => q.br == br && q.par < 0);
    seg([[105, ly], [148, ly]], c, 1);
    CR_NODES.filter((n) => n.t == "cls" && CLS[n.i].par == bi).forEach((n) => {
      const on = clsOK(n.i);
      seg([[202, ly], [275, ly], [275, n.y], [338, n.y]], c, on);
      if (!on) hPiece("lock", 275, (ly + n.y) / 2, 1); // candado en el trazo bloqueado
    });
    // las armas sin clase se alinean en el mismo carril, apagadas
    const last = CR_NODES.filter((n) => n.br == br && n.t == "soon");
    if (last.length) {
      x.globalAlpha = 0.2;
      x.strokeStyle = c;
      x.lineWidth = 3;
      x.setLineDash([6, 10]);
      x.beginPath();
      x.moveTo(500, ly);
      x.lineTo(last[last.length - 1].x, ly);
      x.stroke();
      x.setLineDash([]);
    }
    // etiqueta de la rama sobre la base
    x.globalAlpha = 1;
    if (!hNine("panel", 137, ly - 82, 76, 22, 2, 5)) {
      x.fillStyle = "#000a";
      x.fillRect(137, ly - 82, 76, 22);
    }
    x.fillStyle = c;
    x.font = "bold 9px Georgia";
    x.textAlign = "center";
    x.fillText(BRN[br].n.toUpperCase(), 175, ly - 67);
  }
  x.restore();
}
function drawNode(n, near) {
  const t = Date.now() / 1000;
  x.save();
  x.textAlign = "center";
  const B = BRN[n.br];
  x.fillStyle = "#0007";
  x.beginPath();
  x.ellipse(n.x, n.y + 22, 26, 8, 0, 0, 7);
  x.fill();
  const base = (dim) => {
    x.fillStyle = dim ? "#1c1824" : "#3a3248";
    x.beginPath();
    x.moveTo(n.x - 24, n.y + 20);
    x.lineTo(n.x - 18, n.y + 6);
    x.lineTo(n.x + 18, n.y + 6);
    x.lineTo(n.x + 24, n.y + 20);
    x.closePath();
    x.fill();
    x.strokeStyle = dim ? "#2c2638" : B.c;
    x.lineWidth = 2;
    x.stroke();
    x.fillStyle = dim ? "#14101a" : "#54486a";
    x.fillRect(n.x - 20, n.y + 4, 40, 4);
  };
  if (n.t == "soon") {
    base(1);
    x.globalAlpha = 0.55;
    drawItemIcon({ n: n.w }, n.x, n.y - 8, 32);
    x.globalAlpha = 1;
    x.fillStyle = "#08060c99";
    x.fillRect(n.x - 40, n.y - 26, 80, 50);
    hPiece("lock", n.x, n.y - 3, 1);
    if (!hNine("panel_soft", n.x - 38, n.y + 28, 76, 30, 2, 5)) {
      x.fillStyle = "#0009";
      x.fillRect(n.x - 38, n.y + 28, 76, 30);
    }
    x.fillStyle = "#e8c97a";
    x.font = "bold 9px Georgia";
    x.fillText("PRÓXIMAMENTE", n.x, n.y + 40);
    x.fillStyle = "#8d85a0";
    x.font = "10px Georgia";
    x.fillText(n.w, n.x, n.y + 52);
  } else {
    const c = CLS[n.i],
      ok = clsOK(n.i),
      ch = chosenCls() == n.i;
    base(!ok);
    if (ch) {
      x.strokeStyle = "#ffd34a";
      x.globalAlpha = 0.5 + 0.3 * Math.sin(t * 4);
      x.lineWidth = 3;
      x.beginPath();
      x.ellipse(n.x, n.y + 6, 30, 11, 0, 0, 7);
      x.stroke();
      x.globalAlpha = 1;
    }
    drawNodeHero(c, n.x, n.y - 10 + Math.sin(t * 2 + n.x) * 1.5, 1.35, 0.55 + Math.sin(t * 0.8 + n.x) * 0.5, ok ? 1 : 0.22);
    if (!ok) hPiece("lock", n.x, n.y - 8, 1);
    // las avanzadas llevan el nombre a la derecha (no se pisan entre sí); la base, debajo
    const side = !n.base,
      lx = side ? n.x + 36 : n.x,
      ly = side ? n.y - 2 : n.y + 38;
    x.textAlign = side ? "left" : "center";
    x.fillStyle = near ? "#ffd34a" : ok ? "#fff" : "#9a92ac";
    x.font = (near ? "bold " : "") + "12px Georgia";
    x.fillText(c.n, lx, ly);
    x.font = "10px Georgia";
    if (ch) {
      x.fillStyle = "#ffd34a";
      x.fillText("✔ ELEGIDA", lx, ly + 13);
    } else if (!ok) {
      x.fillStyle = "#e88";
      const miss = c.req.filter((r) => !clsReqOK(r)).length;
      x.fillText(`🔒 ${miss} requisito${miss > 1 ? "s" : ""}`, lx, ly + 13);
    } else if (!n.base) {
      x.fillStyle = "#8c8";
      x.fillText("Desbloqueada", lx, ly + 13);
    }
  }
  x.restore();
}
// Arco de pared: lado "l" o "r"
function crArch(side, label) {
  x.save();
  const l = side == "l",
    x0 = l ? 0 : 916,
    g = x.createLinearGradient(x0, 0, x0 + (l ? 60 : 44), 0);
  g.addColorStop(l ? 0 : 1, "#000");
  g.addColorStop(l ? 1 : 0, "#2a2236");
  x.fillStyle = g;
  x.fillRect(x0, 250, 44, 100);
  x.strokeStyle = "#c9a24a";
  x.lineWidth = 3;
  x.strokeRect(x0 + 2, 248, 42, 104);
  x.fillStyle = "#e8c97a";
  x.font = "bold 11px Georgia";
  x.textAlign = l ? "left" : "right";
  x.fillText(label, l ? 52 : 908, 240);
  x.restore();
}
function crDraw(noHero) {
  x.save();
  x.clearRect(0, 0, W, H);
  drawRoomBase(G.hr == 2 ? TS_ROOM : CR_ROOM);
  x.textAlign = "center";
  x.fillStyle = "#e8c97a";
  x.font = "bold 22px Georgia";
  if (G.hr == 1) {
    crArch("l", "◀ HUB");
    crArch("r", "SALA DE PRUEBAS ▶");
    crRails();
    const near = noHero ? null : crNear();
    for (const n of CR_NODES) drawNode(n, near == n);
    x.textAlign = "center";
    x.fillStyle = "#e8c97a";
    x.font = "bold 22px Georgia";
    x.fillText("SALA DE CLASES", 480, 30);
  } else {
    crArch("l", "◀ CLASES");
    x.fillText("SALA DE PRUEBAS", 480, 30);
    x.fillStyle = "#ffffff14";
    x.font = "bold 46px Georgia";
    x.fillText("ZONA DE COMBATE", 480, 312);
    // marcas de las posiciones de los maniquíes
    x.strokeStyle = "#ffffff22";
    x.lineWidth = 2;
    for (const s of CR_DUM) {
      x.beginPath();
      x.arc(s[0], s[1], 26, 0, 7);
      x.stroke();
    }
  }
  if (P) drawActors(!!noHero);
  x.restore();
}
function crFrame(dt) {
  const near = crNear();
  crDraw();
  if (!P.nov) {
    // el personaje en blanco (sin clase) no tiene barras ni habilidades hasta que elija una
    hudBars();
    hudSlots();
  }
  x.save();
  x.textAlign = "center";
  x.fillStyle = "#fffb";
  x.font = "13px Georgia";
  let msg = "";
  if (G.hr == 1)
    msg = near
      ? `[${KL(KY.use)}] ${near.t == "soon" ? "Próximamente: " + near.w : "Ver clase: " + CLS[near.i].n}`
      : P.nov
        ? "Acércate a un pedestal y pulsa " + KL(KY.use) + " para elegir clase · aquí no se puede combatir"
        : "Aquí no se combate: prueba tu clase en la sala de pruebas ▶";
  else msg = P.nov ? "Primero elige una clase en la sala de clases" : "Prueba tus habilidades con los maniquíes · sal por la izquierda para volver";
  if (!HT) x.fillText(msg, 480, H - 62);
  x.restore();
}
