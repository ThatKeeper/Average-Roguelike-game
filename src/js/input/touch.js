/* ======================================================================
 * src/js/input/touch.js
 * Controles táctiles (Android/iOS): iconos SVG dinámicos, joystick de ataque con el icono del arma,
 * movimiento por joystick o cruceta, apuntar al moverse, distribución sin solapamientos según la
 * pantalla, editor para reordenar los botones y modo ligero.
 *
 * Define:
 * TOUCH_AUTO, TOUCH, LOW, ROT, TC, TCDEF, TIC, tcReset, tcAim, bind, hold, buildTouch
 * tcLayout, tcResolve, tcIcons, tcApply, tcSync, tcCooldowns, tcFS, tcEditStart, tcEditEnd
 * ====================================================================== */

// ===== CONTROLES TÁCTILES (Android/iOS), MODO LIGERO Y PWA =====
// Los controles se dibujan como HTML encima del juego y reutilizan exactamente las mismas acciones que el teclado (K[...], M.d/M.r, dodge(), interact()...).
// Cada control captura su propio puntero (setPointerCapture): un dedo no activa dos botones y soltar o cancelar siempre libera la acción.
const TOUCH_AUTO =
  (typeof matchMedia == "function" && matchMedia("(pointer:coarse)").matches) ||
  (typeof navigator != "undefined" && navigator.maxTouchPoints > 0);
let TOUCH = S.touch == "on" || (S.touch != "off" && TOUCH_AUTO),
  LOW = TOUCH && !S.hq,
  ROT = false;
const TC = { ah: 0, am: 0, ap: null, jp: null, els: {}, wasOv: 0, box: null, mx: 0, my: 0, rev: 0, sig: "", isig: "", edit: 0, ed: {}, drag: null, size: {}, vis: {}, pos: {} };
if (LOW)
  Object.defineProperty(x, "shadowBlur", {
    set() {},
    get() {
      return 0;
    },
    configurable: true,
  });

// ---------- iconos SVG ----------
const TIC = {
  whirl: '<path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 3.5v5h-5" fill="none"/>',
  leap: '<path d="M3.5 16q8.5-14 17 0"/><path d="M3 20.5h18"/><path d="M17 12.5l3.5 3.5-4.5 1"/>',
  guard: '<path d="M12 3l7.5 3v6c0 4.5-3.2 7.6-7.5 9-4.3-1.4-7.5-4.5-7.5-9V6z"/><path d="M12 7v10M8 11h8" opacity=".6"/>',
  volley: '<path d="M3 6h16M3 12h16M3 18h16"/><path d="M16 3l4 3-4 3M16 9l4 3-4 3M16 15l4 3-4 3"/>',
  bomb: '<circle cx="10.5" cy="14.5" r="6.5" fill="currentColor"/><path d="M15 9.5l3-3"/><path d="M18 3v2.5M21 6.5h-2.5M20 4l-1.5 1.5" />',
  drop: '<path d="M12 2.5c4.2 5 6.5 8.2 6.5 11.5a6.5 6.5 0 0 1-13 0c0-3.300 2.300-6.500 6.500-11.500z" fill="currentColor"/>',
  orb: '<circle cx="12" cy="12" r="5.5" fill="currentColor"/><circle cx="12" cy="12" r="9.5" opacity=".45"/><path d="M4 4l2 2M20 4l-2 2M4 20l2-2M20 20l-2-2" opacity=".6"/>',
  nova: '<circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5M5.300 5.300l3.500 3.500M15.200 15.200l3.500 3.500M5.300 18.700l3.500-3.500M15.200 8.800l3.500-3.500"/>',
  bolt: '<path d="M13.500 2L5 13.500h6L9.500 22 19 10h-6.500z" fill="currentColor"/>',
  cone: '<path d="M3 12l17-7.500v15z"/><path d="M8 12h8" opacity=".5"/>',
  zone: '<circle cx="12" cy="12" r="8.500" stroke-dasharray="3.500 3"/><circle cx="12" cy="12" r="2.500" fill="currentColor"/>',
  rage: '<path d="M12 2.500l2.800 6.200 6.700.700-5 4.600 1.500 6.600L12 17.200 6 20.600l1.500-6.600-5-4.600 6.700-.700z" fill="currentColor"/>',
  reload: '<path d="M4.500 12a7.500 7.500 0 0 1 13-5"/><path d="M19.500 12a7.500 7.500 0 0 1-13 5"/><path d="M18 2.500v4.500h-4.500M6 21.500V17h4.500"/>',
  dodge: '<path d="M4 5l7 7-7 7M12 5l7 7-7 7"/>',
  use: '<path d="M8.500 12.500V5.500a1.600 1.600 0 0 1 3.200 0V11"/><path d="M11.700 10.500a1.600 1.600 0 0 1 3.200 0V12"/><path d="M14.900 11.500a1.600 1.600 0 0 1 3.200 0v4.500a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.600-2.100L3.800 15.500a1.600 1.600 0 0 1 2.500-2l2.200 2.300"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>',
  bag: '<path d="M5.500 9h13l1 11.500h-15z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/><path d="M10 14h4" />',
  map: '<path d="M3 6l6-2.500 6 2.500 6-2.500v14.500l-6 2.500-6-2.500-6 2.500z"/><path d="M9 3.500v14.500M15 6v14.500" opacity=".6"/>',
  tal: '<path d="M12 3l2.600 5.300 5.900.8-4.300 4.100 1 5.800L12 16.200 6.800 19l1-5.800L3.500 9.100l5.900-.8z"/>',
  book: '<path d="M12 6.500C10 4.500 6.500 4.300 3.500 5.500v13c3-1.200 6.500-1 8.500 1 2-2 5.500-2.200 8.500-1v-13c-3-1.200-6.500-1-8.500 1zM12 6.500v13"/>',
  card: '<rect x="5" y="2.500" width="14" height="19" rx="2.500"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  hp: '<path d="M9 3h6M10 3v5.500L5.800 17a3.200 3.200 0 0 0 2.900 4.500h6.600a3.200 3.200 0 0 0 2.900-4.500L14 8.500V3"/><path d="M7.200 14.500h9.600l1.300 2.700a2.600 2.600 0 0 1-2.400 3.800H8.300a2.600 2.600 0 0 1-2.400-3.800z" fill="#e55" stroke="none"/>',
  mp: '<path d="M9 3h6M10 3v5.500L5.800 17a3.200 3.200 0 0 0 2.900 4.500h6.600a3.200 3.200 0 0 0 2.900-4.500L14 8.500V3"/><path d="M7.200 14.500h9.600l1.300 2.700a2.600 2.600 0 0 1-2.400 3.800H8.300a2.600 2.600 0 0 1-2.400-3.800z" fill="#58f" stroke="none"/>',
};
const tcSvg = (id, extra = "") =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${TIC[id] || ""}</svg>`;

// ---------- definición de controles (tamaños base en px a escala 100%) ----------
const TCDEF = {
  move: { s: 130, n: "Movimiento" },
  atk: { s: 108, n: "Ataque" },
  skill: { s: 54, n: "Habilidad" },
  q: { s: 54, n: "Q" },
  e: { s: 54, n: "E" },
  r: { s: 54, n: "Habilidad R" },
  util: { s: 54, n: "Habilidad de rama" },
  dodge: { s: 54, n: "Esquivar" },
  use: { s: 54, n: "Interactuar" },
  hp: { s: 46, n: "Poción de vida" },
  mp: { s: 46, n: "Poción de maná" },
  pause: { s: 38, n: "Pausa" },
  inv: { s: 38, n: "Inventario" },
  map: { s: 38, n: "Mapa" },
  tal: { s: 38, n: "Talentos" },
  book: { s: 38, n: "Hechizos" },
  c1: { s: 44, n: "Carta 1" },
  c2: { s: 44, n: "Carta 2" },
  c3: { s: 44, n: "Carta 3" },
  c4: { s: 44, n: "Carta 4" },
};
const tcMage = () => mageOn();
// el botón de clic derecho solo existe si la clase tiene habilidad ahí (o es guardia); la rama de Fuerza usa ese botón también para C
// ¿La pareja p (casillas 1+2 o 3+4) del grimorio está fundida en una combinación? (entonces solo se muestra un botón, más grande)
const tcFused = (p) => typeof pairState == "function" && !TC.edit && tcMage() && pairState(p).fused;
const tcVisible = (id) => {
  if (TC.edit) return true;
  if (G.st == "hub" && !G.sbx && /^(q|e|r|skill|util|c\d|book)$/.test(id)) return false;
  if (/^c\d$|^book$/.test(id)) return tcMage() && !(id == "c2" && tcFused(0)) && !(id == "c4" && tcFused(1));
  if (!P || P.nov) return !/^(q|e|r|skill|util)$/.test(id) || G.st != "hub";
  if (id == "skill") return P.br == "str" || !!skOf(P.ck, 2);
  if (id == "util") return P.br != "str";
  return true;
};

function tcReset() {
  for (const k of ["up", "down", "left", "right", "q", "e", "r", "util", "c1", "c2", "c3", "c4"]) K[KY[k]] = 0;
  M.d = 0;
  M.r = 0;
  TC.ah = 0;
  TC.am = 0;
  TC.ap = null;
  TC.jp = null;
  TC.mx = TC.my = 0;
  if (TC.els.knob) TC.els.knob.style.transform = "translate(0,0)";
  if (TC.els.aknob) TC.els.aknob.style.transform = "translate(0,0)";
  if (TC.els.dpad) TC.els.dpad.querySelectorAll(".da").forEach((a) => a.classList.remove("on"));
  for (const id in TC.els) {
    const el = TC.els[id];
    if (el._pid != null) el._pid = null;
  }
}
function tcAim() {
  if (TC.am || !P) return;
  // "Apuntar al moverse": si te mueves, el ataque sale hacia donde caminas
  if (S.aimmv && (TC.mx || TC.my)) {
    const l = Math.hypot(TC.mx, TC.my) || 1;
    M.x = P.x + (TC.mx / l) * 300;
    M.y = P.y + (TC.my / l) * 300;
    return;
  }
  let b = null,
    bd = 420;
  for (const e of E)
    if (e.hp > 0 && e.sp <= 0 && e.t != "decoy") {
      const d = dist(P, e);
      if (d < bd) {
        bd = d;
        b = e;
      }
    }
  if (b) {
    M.x = b.x;
    M.y = b.y;
  } else {
    const a = Math.hypot(P.vx, P.vy) > 20 ? Math.atan2(P.vy, P.vx) : P.face;
    M.x = P.x + Math.cos(a) * 200;
    M.y = P.y + Math.sin(a) * 200;
  }
}
function bind(el, down, up) {
  el.style.touchAction = "none";
  el.onpointerdown = (e) => {
    if (el._pid != null) return;
    el._pid = e.pointerId;
    el.setPointerCapture && el.setPointerCapture(e.pointerId);
    el.classList && el.classList.add("p");
    down(e);
  };
  const end = (e) => {
    if (el._pid !== e.pointerId) return;
    el._pid = null;
    el.classList && el.classList.remove("p");
    up && up(e);
  };
  el.onpointerup = end;
  el.onpointercancel = end;
  el.onlostpointercapture = end;
}
// Crea un control circular con icono y capa de enfriamiento.
function mkCtl(id, cls) {
  const b = document.createElement("div");
  b.className = "tctl tb " + (cls || "");
  b.dataset.id = id;
  b.innerHTML = `<div class="ic"></div><span class="n"></span>`;
  TC.box.appendChild(b);
  TC.els[id] = b;
  return b;
}
const hold = (k) => [
  () => {
    K[KY[k]] = 1;
  },
  () => {
    K[KY[k]] = 0;
  },
];
const setMove = (vx, vy) => {
  TC.mx = vx;
  TC.my = vy;
  K[KY.right] = vx > 0.35 ? 1 : 0;
  K[KY.left] = vx < -0.35 ? 1 : 0;
  K[KY.down] = vy > 0.35 ? 1 : 0;
  K[KY.up] = vy < -0.35 ? 1 : 0;
};

function buildTouch() {
  if (TC.box) return;
  TC.box = document.createElement("div");
  TC.box.className = "tc";
  $("w").appendChild(TC.box);
  // --- movimiento: joystick ---
  const jb = document.createElement("div");
  jb.className = "tctl tj";
  jb.dataset.id = "move";
  jb.innerHTML = ["up", "up", "up", "up"].map((u, i) => `<div class="ch c${i}">${tcSvg("up")}</div>`).join("");
  TC.box.appendChild(jb);
  TC.els.joy = jb;
  const knob = document.createElement("div");
  knob.className = "tk";
  jb.appendChild(knob);
  TC.els.knob = knob;
  const jv = (e) => {
    const r = jb.getBoundingClientRect(),
      m = r.width / 2,
      dx = e.clientX - (r.left + m),
      dy = e.clientY - (r.top + m),
      l = Math.hypot(dx, dy) || 1,
      k = Math.min(1, l / m);
    knob.style.transform = `translate(${(dx / l) * k * m * 0.6}px,${(dy / l) * k * m * 0.6}px)`;
    setMove((dx / l) * k, (dy / l) * k);
  };
  jb.style.touchAction = "none";
  jb.onpointerdown = (e) => {
    if (TC.jp != null) return;
    TC.jp = e.pointerId;
    jb.setPointerCapture && jb.setPointerCapture(e.pointerId);
    jv(e);
  };
  jb.onpointermove = (e) => {
    if (e.pointerId === TC.jp) jv(e);
  };
  const jend = (e) => {
    if (e.pointerId !== TC.jp) return;
    TC.jp = null;
    setMove(0, 0);
    knob.style.transform = "translate(0,0)";
  };
  jb.onpointerup = jend;
  jb.onpointercancel = jend;
  jb.onlostpointercapture = jend;
  // --- movimiento: cruceta ---
  const db = document.createElement("div");
  db.className = "tctl td";
  db.dataset.id = "move";
  db.innerHTML =
    `<div class="da u">${tcSvg("up")}</div><div class="da r">${tcSvg("up")}</div><div class="da d">${tcSvg("up")}</div><div class="da l">${tcSvg("up")}</div><div class="dc"></div>`;
  TC.box.appendChild(db);
  TC.els.dpad = db;
  db.style.touchAction = "none";
  let dp = null;
  const dv = (e) => {
    const r = db.getBoundingClientRect(),
      m = r.width / 2,
      dx = (e.clientX - (r.left + m)) / m,
      dy = (e.clientY - (r.top + m)) / m,
      dead = Math.hypot(dx, dy) < 0.16,
      vx = dead ? 0 : Math.abs(dx) > 0.34 ? Math.sign(dx) : 0,
      vy = dead ? 0 : Math.abs(dy) > 0.34 ? Math.sign(dy) : 0,
      l = Math.hypot(vx, vy) || 1;
    setMove(vx / l, vy / l);
    db.querySelector(".u").classList.toggle("on", vy < 0);
    db.querySelector(".d").classList.toggle("on", vy > 0);
    db.querySelector(".l").classList.toggle("on", vx < 0);
    db.querySelector(".r").classList.toggle("on", vx > 0);
  };
  db.onpointerdown = (e) => {
    if (dp != null) return;
    dp = e.pointerId;
    db.setPointerCapture && db.setPointerCapture(e.pointerId);
    dv(e);
  };
  db.onpointermove = (e) => {
    if (e.pointerId === dp) dv(e);
  };
  const dend = (e) => {
    if (e.pointerId !== dp) return;
    dp = null;
    setMove(0, 0);
    db.querySelectorAll(".da").forEach((a) => a.classList.remove("on"));
  };
  db.onpointerup = dend;
  db.onpointercancel = dend;
  db.onlostpointercapture = dend;
  // --- ataque: pseudo-joystick con el icono del arma equipada ---
  const at = document.createElement("div");
  at.className = "tctl ta";
  at.dataset.id = "atk";
  at.innerHTML = `<div class="ar"></div><div class="ak"></div>`;
  TC.box.appendChild(at);
  TC.els.atk = at;
  const ak = at.querySelector(".ak");
  TC.els.aknob = ak;
  at.onpointermove = (e) => {
    if (e.pointerId !== TC.ap) return;
    const r = at.getBoundingClientRect(),
      dx = e.clientX - (r.left + r.width / 2),
      dy = e.clientY - (r.top + r.height / 2),
      l = Math.hypot(dx, dy),
      mx = r.width * 0.3,
      k = Math.min(1, l / mx);
    ak.style.transform = l > 1 ? `translate(${(dx / l) * k * mx}px,${(dy / l) * k * mx}px)` : "translate(0,0)";
    if (l > 14 && P) {
      TC.am = 1;
      M.x = P.x + (dx / l) * 300;
      M.y = P.y + (dy / l) * 300;
    }
  };
  bind(
    at,
    (e) => {
      TC.ap = e.pointerId;
      TC.ah = 1;
      M.d = 1;
      TC.am = 0;
      tcFS();
    },
    () => {
      TC.ah = 0;
      M.d = 0;
      TC.am = 0;
      TC.ap = null;
      ak.style.transform = "translate(0,0)";
    },
  );
  const B = (id, cls, d, u) => bind(mkCtl(id, cls), d, u);
  B("skill", "", () => (M.r = 1), () => (M.r = 0));
  B("q", "", ...hold("q"));
  B("e", "", ...hold("e"));
  B("r", "", ...hold("r"));
  B("util", "", ...hold("util"));
  B("dodge", "", () => {
    if (!G.ov && G.st == "play") dodge();
  });
  B("use", "", () => interact());
  B("hp", "sm", () => usePotion("hp"));
  B("mp", "sm", () => usePotion("mp"));
  B("pause", "top", () => pause());
  B("inv", "top", () => inv());
  B("map", "top", () => {
    bigmap ^= 1;
  });
  B("tal", "top", () => tal());
  B("book", "top", () => book());
  for (let i = 0; i < 4; i++) B("c" + (i + 1), "card", ...hold("c" + (i + 1)));
  const rot = document.createElement("div");
  rot.className = "rot";
  rot.textContent = "Gira el tel\u00e9fono: se juega en horizontal";
  TC.box.appendChild(rot);
  TC.els.rot = rot;
  // --- editor: arrastrar controles ---
  TC.box.addEventListener(
    "pointerdown",
    (e) => {
      if (!TC.edit) return;
      const t = e.target.closest && e.target.closest(".tctl");
      e.stopPropagation();
      e.preventDefault();
      if (!t) return;
      const id = t.dataset.id,
        sz = TC.size[id] || 50,
        c = TC.pos[id] || [e.clientX, e.clientY];
      TC.drag = { id, dx: e.clientX - c[0], dy: e.clientY - c[1], pid: e.pointerId };
      t.classList.add("dragging");
    },
    true,
  );
  window.addEventListener("pointermove", (e) => {
    if (!TC.edit || !TC.drag || e.pointerId !== TC.drag.pid) return;
    const vw = innerWidth,
      vh = innerHeight,
      s = TC.size[TC.drag.id] / 2;
    TC.ed[TC.drag.id] = [cl(e.clientX - TC.drag.dx, s, vw - s) / vw, cl(e.clientY - TC.drag.dy, s, vh - s) / vh];
    tcLayout(1);
  });
  const eend = (e) => {
    if (!TC.drag || e.pointerId !== TC.drag.pid) return;
    document.querySelectorAll(".tctl.dragging").forEach((q) => q.classList.remove("dragging"));
    TC.drag = null;
    tcLayout(1);
  };
  window.addEventListener("pointerup", eend);
  window.addEventListener("pointercancel", eend);
  tcApply();
}

// ---------- distribución sin solapamientos ----------
// Posiciones por defecto (centros en px) calculadas a partir del tamaño real de la pantalla.
function tcDefaults(vw, vh, sz) {
  const m = 14,
    p = {},
    ax = vw - m - sz.atk / 2,
    ay = vh - m - sz.atk / 2,
    R1 = sz.atk / 2 + sz.q / 2 + 8,
    R2 = R1 + sz.q + 6,
    pol = (R, deg) => [ax + R * Math.cos((deg * Math.PI) / 180), ay + R * Math.sin((deg * Math.PI) / 180)];
  p.move = [m + sz.move / 2, vh - m - sz.move / 2];
  p.atk = [ax, ay];
  p.dodge = pol(R1, 180);
  p.skill = pol(R1, 225);
  p.use = pol(R1, 270);
  p.q = pol(R2, 172);
  p.e = pol(R2, 200);
  p.r = pol(R2, 228);
  p.util = pol(R2 + sz.q + 6, 205);
  p.hp = pol(R2, 256);
  p.mp = pol(R2, 284);
  ["pause", "inv", "map", "tal", "book"].forEach((id, i) => (p[id] = [vw - m - sz[id] / 2 - i * (sz[id] + 8), m + sz[id] / 2]));
  for (let i = 0; i < 4; i++) p["c" + (i + 1)] = [vw / 2 + (i - 1.5) * (sz.c1 + 10), vh - 8 - sz.c1 / 2];
  return p;
}
// Empuja los círculos que se tocan hasta separarlos y los mantiene dentro de la pantalla.
function tcResolve(pos, sz, ids, vw, vh) {
  const gap = 6;
  for (let it = 0; it < 80; it++) {
    let moved = 0;
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i],
          b = ids[j],
          pa = pos[a],
          pb = pos[b],
          need = sz[a] / 2 + sz[b] / 2 + gap;
        let dx = pb[0] - pa[0],
          dy = pb[1] - pa[1],
          d = Math.hypot(dx, dy);
        if (d >= need) continue;
        if (d < 0.01) {
          dx = 1;
          dy = 0;
          d = 1;
        }
        const k = (need - d) / 2 / d;
        // el control grande (movimiento/ataque) se mueve menos
        const wa = sz[a] > 90 ? 0.25 : 1,
          wb = sz[b] > 90 ? 0.25 : 1,
          t = wa + wb;
        pa[0] -= dx * k * 2 * (wa / t);
        pa[1] -= dy * k * 2 * (wa / t);
        pb[0] += dx * k * 2 * (wb / t);
        pb[1] += dy * k * 2 * (wb / t);
        moved = 1;
      }
    for (const id of ids) {
      const s = sz[id] / 2;
      pos[id][0] = cl(pos[id][0], s + 4, vw - s - 4);
      pos[id][1] = cl(pos[id][1], s + 4, vh - s - 4);
    }
    if (!moved) return true;
  }
  return false;
}
function tcLayout(editing) {
  if (!TC.box) return;
  const vw = innerWidth,
    vh = innerHeight;
  let fit = Math.min(1, Math.min(vw, vh) / 420) * (S.tscale || 1);
  const ids = Object.keys(TCDEF).filter(tcVisible);
  for (let tries = 0; tries < 8; tries++) {
    const sz = {};
    for (const id in TCDEF) sz[id] = Math.round(TCDEF[id].s * fit);
    const pos = tcDefaults(vw, vh, sz),
      src = editing || TC.edit ? Object.assign({}, S.tl || {}, TC.ed) : S.tl || {};
    for (const id in src) if (pos[id] && src[id]) pos[id] = [src[id][0] * vw, src[id][1] * vh];
    // pareja de hechizos fundida: un único botón más grande, entre los dos botones de la pareja
    for (let p = 0; p < 2; p++)
      if (tcFused(p)) {
        const a = "c" + (2 * p + 1),
          b = "c" + (2 * p + 2);
        pos[a] = [(pos[a][0] + pos[b][0]) / 2, (pos[a][1] + pos[b][1]) / 2];
        sz[a] = Math.round(sz[a] * 1.3);
      }
    // en el editor se deja colocar libremente (los solapes se marcan en rojo); en juego se resuelven
    const ok = TC.edit ? true : tcResolve(pos, sz, ids, vw, vh);
    if (ok || tries == 7 || TC.edit) {
      TC.size = sz;
      TC.pos = pos;
      break;
    }
    fit *= 0.92; // si no cabe, se reducen los botones
  }
  const sz = TC.size,
    pos = TC.pos,
    dpad = !!S.dpad;
  TC.vis = {};
  for (const id in TCDEF) {
    const show = tcVisible(id);
    TC.vis[id] = show;
    const els = id == "move" ? [TC.els.joy, TC.els.dpad] : [TC.els[id] || TC.els.atk];
    els.forEach((el, k) => {
      if (!el) return;
      const on = show && (id != "move" || (k == 1) == dpad);
      el.style.display = on ? "" : "none";
      el.style.width = el.style.height = sz[id] + "px";
      el.style.left = pos[id][0] - sz[id] / 2 + "px";
      el.style.top = pos[id][1] - sz[id] / 2 + "px";
      el.style.fontSize = Math.round(sz[id] * 0.3) + "px";
      el.classList.remove("bad");
    });
  }
  if (TC.edit) {
    const vis = ids.filter((id) => TC.vis[id]);
    for (const a of vis)
      for (const b of vis)
        if (a < b && Math.hypot(pos[a][0] - pos[b][0], pos[a][1] - pos[b][1]) < sz[a] / 2 + sz[b] / 2 - 2)
          [a, b].forEach((id) => (id == "move" ? [TC.els.joy, TC.els.dpad] : [TC.els[id]]).forEach((el) => el && el.classList.add("bad")));
  }
  tcIcons(1);
}

// ---------- iconos dinámicos (según clase, arma, tomo y cartas) ----------
function tcIcons(force) {
  if (!TC.box) return;
  const sig = [P ? P.ck : "", P ? P.w.n : "", P && P.nov, S.cards && JSON.stringify(S.cards.slots), tcPairSig(), TC.size.atk].join("|");
  if (!force && sig == TC.isig) return;
  TC.isig = sig;
  const col = P && !P.nov ? BRN[P.br].c : "#c9a24a",
    // iconos de habilidad: los mismos sprites del HUD (src/assets/hud/icons); si faltan, el SVG genérico
    im = (id) => (HUD_DATA.icons && HUD_DATA.icons[id] ? `<img src="${HUD_DATA.icons[id]}" alt="" style="width:100%;height:100%;image-rendering:auto">` : tcSvg(id)),
    set = (id, ic, c, svg) => {
      const el = TC.els[id];
      if (!el) return;
      el.querySelector(".ic").innerHTML = svg ? tcSvg(ic) : im(ic);
      el.style.setProperty("--c", c);
      el.title = TCDEF[id].n;
    },
    k = (i) => (P && !P.nov && skOf(P.ck, i)) || null,
    U2 = P && !P.nov ? skUtil(P.br) : null;
  set("q", k(0) ? k(0).ic : "whirl", col);
  set("e", k(1) ? k(1).ic : "leap", col);
  set("skill", k(2) ? k(2).ic : "guard", col);
  set("r", k(3) ? k(3).ic : "star", "#c9a24a");
  set("util", U2 ? U2.ic : "reset", "#c9a24a");
  set("dodge", "dodge", "#9cf");
  set("use", "use", "#fff", 1);
  set("hp", "potion_hp", "#e55");
  set("mp", "potion_mp", "#58f");
  set("pause", "pause", "#ddd", 1);
  set("inv", "bag", "#e8c97a", 1);
  set("map", "map", "#9fd", 1);
  set("tal", "tal", "#fd6", 1);
  set("book", "book", "#a9f", 1);
  for (let i = 0; i < 4; i++) {
    const kk = S.cards && S.cards.slots[i],
      pr = typeof pairState == "function" && S.cards ? pairState(i >> 1) : null,
      fz = pr && pr.fused,
      key = fz ? (i & 1 ? null : pr.k) : kk,
      el = TC.els["c" + (i + 1)];
    if (!el || (fz && i & 1)) continue;
    const sp = (kk0, big) => `<img src="${spIconURL(kk0)}" alt="" style="width:100%;height:100%;image-rendering:pixelated">`;
    el.querySelector(".ic").innerHTML = (key ? sp(key) : tcSvg("card")) + `<i class="num">${fz ? i + 1 + "+" + (i + 2) : i + 1}</i>`;
    el.style.setProperty("--c", fz ? "#ffd54a" : kk ? EL[kk].c : "#777");
    el.title = TCDEF["c" + (i + 1)].n;
  }
  // arma equipada dentro del joystick de ataque
  if (TC.els.aknob) {
    const px = Math.round((TC.size.atk || 100) * 0.42);
    TC.els.aknob.innerHTML = P ? icoHTML(P.w, px) : `<div style="font-size:${px * 0.6}px">⚔️</div>`;
  }
}

function tcApply() {
  if (!TC.box) return;
  TC.box.className = "tc" + (TOUCH ? " on" : "") + (TC.edit ? " edit" : "");
  TC.box.style.setProperty && TC.box.style.setProperty("--s", S.tscale || 1);
  const w = typeof window == "object" ? window : {},
    ro = TOUCH && (w.innerHeight || 0) > (w.innerWidth || 1e9);
  ROT = !!ro;
  if (TC.els.rot) TC.els.rot.style.display = ROT ? "flex" : "none";
  TC.rev++;
  tcLayout();
}
const tcPairSig = () => (typeof pairState == "function" && S.cards ? [0, 1].map((p) => (pairState(p).fused ? pairState(p).k : "")).join(",") : "");
function tcSync() {
  if (!TOUCH) return;
  if (!TC.box) buildTouch();
  const sig = innerWidth + "x" + innerHeight + "|" + tcMage() + "|" + tcPairSig() + "|" + (P ? P.ck + P.nov : "") + "|" + (G.sbx ? 1 : 0) + "|" + G.st + "|" + TC.rev + "|" + (TC.edit ? 1 : 0) + "|" + (S.dpad ? 1 : 0);
  if (sig != TC.sig) {
    TC.sig = sig;
    tcLayout();
  }
  tcIcons();
  if (G.ov && !TC.wasOv) tcReset();
  TC.wasOv = G.ov ? 1 : 0;
  // Con un menú abierto (pausa, ajustes, inventario, pantalla de muerte...) los controles táctiles se ocultan: si no, quedaban
  // encima del menú, tapaban sus botones y bloqueaban el desplazamiento táctil.
  TC.box.style.display = ROT || TC.edit || ((G.st == "play" || G.st == "hub") && !G.ov) ? "block" : "none";
  tcCooldowns();
}
/** Muestra los segundos de enfriamiento restantes sobre cada botón de habilidad. */
function tcCooldown(id, cd) {
  const b = TC.els[id];
  if (!b) return;
  const n = b.lastChild,
    on = cd > 0.05,
    txt = on ? (cd >= 1 ? String(Math.ceil(cd)) : cd.toFixed(1)) : "";
  if (b._cd !== txt) {
    b._cd = txt;
    n.textContent = txt;
    b.classList.toggle("cd", on);
  }
}
function tcCooldowns() {
  const ok = P && (G.st == "play" || G.sbx) && !P.nov,
    A = (i) => ok && skOf(P.ck, i);
  tcCooldown("q", A(0) && A(0).f ? P.cd[0] : 0);
  tcCooldown("e", A(1) && A(1).f ? P.cd[1] : 0);
  tcCooldown("skill", A(2) && A(2).f ? P.cd[2] : 0); // la guardia no tiene enfriamiento
  tcCooldown("r", A(3) && A(3).f ? P.cd[3] : 0);
  tcCooldown("util", ok ? P.cd[8] : 0);
  tcCooldown("dodge", ok ? P.dcd : 0);
  tcCooldown("hp", ok && P.potcd > 0 ? P.potcd : 0);
  tcCooldown("mp", ok && P.potcd > 0 ? P.potcd : 0);
  for (let i = 0; i < 4; i++) tcCooldown("c" + (i + 1), ok && mageOn() ? P.cd[4 + i] : 0);
  // contador de pociones en el borde del botón
  for (const k of ["hp", "mp"]) {
    const b = TC.els[k];
    if (b) {
      const n = ok ? potCount(k) : 0;
      if (b._pc !== n) {
        b._pc = n;
        if (n) b.dataset.q = n;
        else b.removeAttribute("data-q");
        b.classList.toggle("empty", !n);
      }
    }
  }
}
function tcFS() {
  try {
    const d = document.documentElement;
    if (d && d.requestFullscreen && !document.fullscreenElement)
      d.requestFullscreen()
        .then(
          () =>
            screen.orientation &&
            screen.orientation.lock &&
            screen.orientation.lock("landscape").catch(() => {}),
        )
        .catch(() => {});
  } catch (e) {}
}

// ---------- editor de distribución ----------
function tcEditStart(ret) {
  if (!TOUCH) return flash("Activa los controles táctiles para ordenarlos");
  if (!TC.box) buildTouch();
  hide();
  TC.edit = 1;
  TC.ed = {};
  TC.ret = ret;
  tcReset();
  const bar = document.createElement("div");
  bar.className = "tedit";
  bar.innerHTML = `<b>Ordenar botones</b><small>Arrastra cada control a donde quieras. En rojo = se tocan.</small>`;
  const mk = (t, f) => {
    const b = document.createElement("button");
    b.textContent = t;
    b.onclick = f;
    bar.appendChild(b);
  };
  mk("Guardar", () => tcEditEnd(1));
  mk("Restablecer", () => {
    TC.ed = {};
    S.tl = {};
    tcLayout(1);
  });
  mk("Cancelar", () => tcEditEnd(0));
  document.body.appendChild(bar);
  TC.bar = bar;
  tcApply();
}
function tcEditEnd(saveIt) {
  if (saveIt) {
    // se separan los que queden solapados y se guarda la posición final de cada control
    const vw = innerWidth,
      vh = innerHeight,
      pos = {};
    for (const id in TC.pos) pos[id] = TC.pos[id].slice();
    const ids = Object.keys(TCDEF).filter(tcVisible);
    tcResolve(pos, TC.size, ids, vw, vh);
    S.tl = {};
    for (const id in pos) S.tl[id] = [pos[id][0] / vw, pos[id][1] / vh];
    save();
  }
  TC.edit = 0;
  TC.ed = {};
  if (TC.bar) TC.bar.remove();
  TC.bar = null;
  document.querySelectorAll(".tctl.bad,.tctl.dragging").forEach((q) => q.classList.remove("bad", "dragging"));
  tcApply();
  if (TC.ret) TC.ret();
}
function tcResetLayout() {
  S.tl = {};
  save();
  TC.rev++;
  tcLayout();
}

if (typeof window == "object" && window.addEventListener) {
  window.addEventListener("blur", tcReset);
  window.addEventListener("resize", tcApply);
  window.addEventListener("orientationchange", tcApply);
  if (document.addEventListener)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) tcReset();
    });
}
if (TOUCH) buildTouch();
