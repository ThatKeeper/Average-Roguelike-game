/* ======================================================================
 * src/js/debug/debug.js
 * Sistema de debug secreto: panel flotante con herramientas para probar
 * funciones nuevas sin jugar toda la partida.
 *
 * CÓMO ABRIRLO (no aparece en ningún menú):
 *   - Teclado: escribe  debug  en cualquier momento (fuera de un campo de texto).
 *   - Móvil:   toca 7 veces seguidas la esquina superior izquierda de la pantalla.
 *   Se repite la misma acción para cerrarlo. No se guarda: al recargar vuelve oculto.
 *
 * CÓMO AÑADIR TUS PROPIAS HERRAMIENTAS (en src/js/debug/debug-features.js):
 *   dbgAdd("Grupo", "Texto del botón", () => { ...código... });
 *   dbgAdd("Grupo", "Invulnerable", null, { toggle: "god" });   // botón ON/OFF sobre DBG.god
 * Los grupos nuevos se crean solos. Para una opción de tipo interruptor, lee DBG.<clave>
 * en el código que quieras condicionar.
 *
 * Define:
 * DBG, dbgAdd, dbgToggle, dbgBuild, dbgRefresh, dbgTick, dbgWorld, dbgHud
 * ====================================================================== */

const DBG = {
  on: false,
  god: false, // no recibes daño
  mana: false, // maná infinito
  hb: false, // dibuja hitboxes
  fps: false, // muestra FPS
  ts: 1, // velocidad del juego
  groups: [], // [{ n, items: [{ t, f, tg }] }]
  fpsv: 0,
  el: null,
};

function dbgAdd(group, label, fn, opt = {}) {
  let g = DBG.groups.find((q) => q.n == group);
  if (!g) DBG.groups.push((g = { n: group, items: [] }));
  g.items.push({ t: label, f: fn, tg: opt.toggle, lb: opt.label });
  if (DBG.el) dbgBuild();
}

function dbgToggle() {
  DBG.on = !DBG.on;
  if (!DBG.el) dbgBuild();
  DBG.el.style.display = DBG.on ? "block" : "none";
  if (typeof flash == "function") flash("Debug " + (DBG.on ? "activado" : "desactivado"));
}

/** (Re)construye el panel HTML a partir de los grupos registrados. */
function dbgBuild() {
  const open = DBG.el ? [...DBG.el.querySelectorAll("details")].map((d) => d.open) : [];
  if (!DBG.el) {
    DBG.el = document.createElement("div");
    DBG.el.id = "dbg";
    DBG.el.style.cssText =
      "position:fixed;left:6px;top:6px;z-index:50;width:250px;max-height:calc(100vh - 12px);overflow:auto;background:#000d;border:1px solid #c9a24a;border-radius:6px;padding:6px;font:11px monospace;color:#eee;display:" +
      (DBG.on ? "block" : "none");
    document.body.appendChild(DBG.el);
    // no dejar que los clics en el panel lleguen al juego
    for (const ev of ["pointerdown", "pointerup", "mousedown", "mouseup", "click", "wheel"])
      DBG.el.addEventListener(ev, (e) => e.stopPropagation());
  }
  DBG.el.innerHTML = '<b style="color:#c9a24a">DEBUG</b> <small>(escribe "debug" para cerrar)</small>';
  DBG.groups.forEach((g, gi) => {
    const d = document.createElement("details");
    d.open = open[gi] ?? gi == 0;
    d.innerHTML = `<summary style="cursor:pointer;color:#ffd34a;margin-top:4px">${g.n}</summary>`;
    const box = document.createElement("div");
    box.style.cssText = "display:flex;flex-wrap:wrap;gap:3px;margin:3px 0";
    g.items.forEach((it) => {
      const b = document.createElement("button");
      b.style.cssText = "font:11px monospace;padding:3px 5px;cursor:pointer";
      b.onclick = () => {
        try {
          if (it.tg) DBG[it.tg] = !DBG[it.tg];
          if (it.f) it.f();
        } catch (er) {
          console.error(er);
        }
        dbgRefresh();
      };
      b._it = it;
      box.appendChild(b);
    });
    d.appendChild(box);
    DBG.el.appendChild(d);
  });
  dbgRefresh();
}

/** Actualiza el texto de los botones de tipo interruptor. */
function dbgRefresh() {
  if (!DBG.el) return;
  DBG.el.querySelectorAll("button").forEach((b) => {
    const it = b._it;
    b.textContent = it.tg ? `${it.t}: ${DBG[it.tg] === true ? "SÍ" : DBG[it.tg] === false ? "NO" : DBG[it.tg]}` : it.t;
    b.style.background = it.tg && DBG[it.tg] === true ? "#3a6a3a" : "";
  });
}

/** Una vez por fotograma: maná infinito y cálculo de FPS. */
function dbgTick(dt) {
  if (!DBG.on) return;
  if (DBG.mana && P && G.st == "play") P.mp = P.mmp;
  DBG.fpsv += (1 / Math.max(dt, 1e-3) - DBG.fpsv) * 0.1;
}

/** Hitboxes en coordenadas de mundo (se llama dentro de draw(), con el temblor aplicado). */
function dbgWorld() {
  if (!DBG.on || !DBG.hb || G.st != "play") return;
  x.save();
  x.lineWidth = 1;
  const ring = (px, py, r, c) => {
    x.strokeStyle = c;
    x.beginPath();
    x.arc(px, py, r, 0, 7);
    x.stroke();
  };
  ring(P.x, P.y, P.r, "#0f0");
  for (const e of E) ring(e.x, e.y, e.r, "#f44");
  for (const p of PR) ring(p.x, p.y, p.r || 4, p.f == "p" || p.t == "p" ? "#6f6" : "#f84");
  for (const z of Z) ring(z.x, z.y, z.r, "#fa4");
  // círculos de colisión del sprite del arma durante un golpe
  if (SW && SW.owner === P) {
    const pose = swingPose(SW, SW.t),
      A = SW.art,
      rec = A.spr && WSPR[A.spr],
      circ = rec && rec.ready && rec.circ ? rec.circ : FALLBACK_CIRC,
      s = A.s * pose.k,
      ca = Math.cos(pose.ang),
      sa = Math.sin(pose.ang);
    for (const c of circ) {
      const lu = (c.u - A.gu) * s,
        lv = c.v * s * pose.sy;
      ring(P.x + pose.hx + ca * lu - sa * lv, P.y + pose.hy + sa * lu + ca * lv, 1.45 * s, pose.active ? "#ff0" : "#886");
    }
  }
  x.restore();
}

/** Insignias en pantalla (FPS, modos activos). Se llama tras dibujar el HUD. */
function dbgHud() {
  if (!DBG.on) return;
  x.save();
  x.font = "11px monospace";
  x.textAlign = "left";
  const tags = ["DEBUG"];
  if (DBG.fps) tags.push(Math.round(DBG.fpsv) + " FPS");
  if (DBG.god) tags.push("INVULNERABLE");
  if (DBG.mana) tags.push("MANÁ ∞");
  if (DBG.ts != 1) tags.push("×" + DBG.ts);
  x.fillStyle = "#000a";
  const tx = tags.join("  ·  ");
  x.fillRect(4, H - 18, x.measureText(tx).width + 10, 14);
  x.fillStyle = "#ffd34a";
  x.fillText(tx, 9, H - 7);
  x.restore();
}

// --- apertura secreta: teclado (escribir "debug") ---
let dbgBuf = "";
document.addEventListener("keydown", (e) => {
  if (/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || "") || !e.key || e.key.length != 1) return;
  dbgBuf = (dbgBuf + e.key.toLowerCase()).slice(-5);
  if (dbgBuf == "debug") {
    dbgBuf = "";
    dbgToggle();
  }
});
// --- apertura secreta: móvil (7 toques en la esquina superior izquierda) ---
let dbgTaps = [];
cv.addEventListener("pointerdown", (e) => {
  const r = cv.getBoundingClientRect(),
    px = ((e.clientX - r.left) / r.width) * W,
    py = ((e.clientY - r.top) / r.height) * H;
  if (px > 70 || py > 40) return;
  const n = Date.now();
  dbgTaps = dbgTaps.filter((t) => n - t < 3000).concat(n);
  if (dbgTaps.length >= 7) {
    dbgTaps = [];
    dbgToggle();
  }
});
