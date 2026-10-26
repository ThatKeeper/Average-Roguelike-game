/* ======================================================================
 * src/js/render/death.js
 * Animación de muerte: la pantalla se oscurece, decenas de manos blancas salen de la oscuridad y agarran
 * al protagonista; él forcejea, resiste y al final se lo llevan hacia arriba. Después aparece la pantalla
 * de estadísticas de la partida.
 *
 * Define:
 * DTH_END, dthStart, drawHand, drawDeath, deathStats
 * ====================================================================== */

const DTH_END = 7.2; // segundos hasta mostrar las estadísticas
const dthEase = (p) => p * p * (3 - 2 * p);

function dthStart() {
  const hands = [],
    n = 46;
  for (let i = 0; i < n; i++)
    hands.push({
      a: Math.random() * 6.283, // dónde agarra alrededor del protagonista
      d: 0.5 + (i / n) * 3.7 + Math.random() * 0.25, // retraso: llegan cada vez más
      ox: P.x + (Math.random() - 0.5) * 520, // todas salen de la parte de arriba de la pantalla
      oy: -40 - Math.random() * 90,
      sz: 26 + Math.random() * 14,
      w: Math.random() * 6.283,
      g: 0,
    });
  G.dth = { t: 0, last: performance.now(), hands, x0: P.x, y0: P.y };
  shake = 0;
  snd(70, 1.6, "sawtooth", 0.05);
  snd(55, 2.2, "sine", 0.07);
}

// Una mano blanca con antebrazo. (hx,hy) = muñeca/palma · ang = hacia dónde apunta · grip 0..1 = cuánto cierra los dedos
function drawHand(hx, hy, ang, sz, grip, alpha, L) {
  x.save();
  x.globalAlpha = alpha;
  x.translate(hx, hy);
  x.rotate(ang);
  const g = x.createLinearGradient(-sz * 0.4, 0, -sz * 0.4 - L, 0);
  g.addColorStop(0, "#eeeef4");
  g.addColorStop(1, "#eeeef466");
  x.fillStyle = g; // antebrazo que se pierde en la oscuridad
  x.beginPath();
  x.moveTo(-sz * 0.4, -sz * 0.3);
  x.lineTo(-sz * 0.4 - L, -sz * 0.2);
  x.lineTo(-sz * 0.4 - L, sz * 0.2);
  x.lineTo(-sz * 0.4, sz * 0.3);
  x.closePath();
  x.fill();
  x.lineCap = x.lineJoin = "round";
  const finger = (bx, by, a0, len, curl, w) => {
    const a1 = a0 + curl,
      mx = bx + Math.cos(a0) * len,
      my = by + Math.sin(a0) * len,
      ex = mx + Math.cos(a1) * len * 0.8,
      ey = my + Math.sin(a1) * len * 0.8;
    for (const [c, lw] of [["#8a8a99", w + 2.5], ["#f4f4fa", w]]) {
      x.strokeStyle = c;
      x.lineWidth = lw;
      x.beginPath();
      x.moveTo(bx, by);
      x.lineTo(mx, my);
      x.lineTo(ex, ey);
      x.stroke();
    }
  };
  // dedos (se abren al acercarse y se cierran al agarrar)
  for (let i = 0; i < 4; i++) {
    const by = (i - 1.5) * sz * 0.22,
      spread = (1 - grip) * 0.32 * (i - 1.5),
      curl = (by < 0 ? 1 : -1) * (0.35 + grip * 1.05);
    finger(sz * 0.38, by, spread, sz * 0.42, curl, sz * 0.17);
  }
  finger(sz * 0.05, sz * 0.36, 0.7 - grip * 0.4, sz * 0.34, -0.5 - grip * 0.5, sz * 0.18); // pulgar
  x.fillStyle = "#f4f4fa"; // palma
  x.strokeStyle = "#8a8a99";
  x.lineWidth = 2;
  x.beginPath();
  x.ellipse(0, 0, sz * 0.5, sz * 0.42, 0, 0, 7);
  x.fill();
  x.stroke();
  x.restore();
}

// Fotograma de la muerte; devuelve true cuando ya terminó
function drawDeath() {
  const D = G.dth,
    now = performance.now();
  D.t += Math.min(0.1, (now - D.last) / 1000);
  D.last = now;
  if ((M.d || K.Enter) && D.t > 1.4 && D.t < DTH_END - 1.1) {
    D.t = DTH_END - 1.1; // saltar: va directo al final de la escena
    M.d = 0;
  }
  const t = D.t,
    dark = Math.min(1, t / 1.5);
  // arrastre: forcejea (tira y afloja) y, al final, se lo llevan hacia arriba
  const struggle = t < 1.2 ? 0 : Math.min(1, (t - 1.2) / 1.5),
    tug = Math.sin(t * 6.5) * 9 * struggle,
    creep = t < 1.8 ? 0 : Math.min(t, 4.6) - 1.8,
    haul = t < 4.6 ? 0 : dthEase(Math.min(1, (t - 4.6) / 2.0)),
    px = D.x0 + Math.sin(t * 11) * 4 * struggle + tug * 0.5,
    py = D.y0 - creep * 16 + tug - haul * (D.y0 + 230),
    gr = hands => hands.filter((h) => h.g > 0.3).length;
  x.save();
  x.setTransform(1, 0, 0, 1, 0, 0);
  drawWorld(true);
  // oscuridad: velo general + círculo de luz que se cierra sobre él
  x.globalAlpha = 1;
  x.fillStyle = `rgba(0,0,0,${0.5 * dark})`;
  x.fillRect(0, 0, W, H);
  const r0 = 520 - 400 * dark,
    vg = x.createRadialGradient(px, py, r0 * 0.25, px, py, r0);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, `rgba(0,0,0,${0.97 * dark})`);
  x.fillStyle = vg;
  x.fillRect(0, 0, W, H);
  // protagonista: sacudiéndose y encogiéndose al final
  const sx = P.x,
    sy = P.y,
    sf = P.face,
    sfl = P.fl,
    si = P.inv;
  P.x = px;
  P.y = py;
  P.face = sf + Math.sin(t * 9) * 1.2 * struggle + haul * 5;
  P.fl = 0;
  P.inv = 0;
  x.globalAlpha = Math.max(0, 1 - haul * 0.9);
  safe(drawP);
  P.x = sx;
  P.y = sy;
  P.face = sf;
  P.fl = sfl;
  P.inv = si;
  x.globalAlpha = 1;
  // manos
  for (const h of D.hands) {
    const p = Math.max(0, Math.min(1, (t - h.d) / 0.95));
    if (p <= 0) continue;
    const e = 1 - Math.pow(1 - p, 3),
      grabbed = p >= 1;
    if (grabbed && !h.g0) {
      h.g0 = 1;
      snd(75 + Math.random() * 40, 0.12, "sawtooth", 0.03);
    }
    h.g = grabbed ? Math.min(1, h.g + 0.08) : p * 0.4;
    // la mano baja desde el borde superior hasta agarrar; el antebrazo llega siempre hasta arriba
    const jit = grabbed ? Math.sin(t * 14 + h.w) * 2.2 * struggle : 0,
      gx = px + Math.cos(h.a) * (22 + jit),
      gy = py + Math.sin(h.a) * (22 + jit),
      hx = h.ox + (gx - h.ox) * e,
      hy = h.oy + (gy - h.oy) * e + Math.sin(t * 3 + h.w) * 2,
      L = Math.max(40, Math.hypot(hx - h.ox, hy - h.oy) + 10);
    drawHand(hx, hy, Math.atan2(hy - h.oy, hx - h.ox), h.sz, h.g, Math.min(1, p * 2) * (1 - Math.max(0, (haul - 0.8) * 5)), L);
  }
  // fundido final a negro
  if (t > DTH_END - 1.6) {
    x.fillStyle = `rgba(0,0,0,${Math.min(1, (t - (DTH_END - 1.6)) / 1.2)})`;
    x.fillRect(0, 0, W, H);
  }
  x.restore();
  return t >= DTH_END;
}

// ---- Pantalla de estadísticas de la partida ----
function deathStats() {
  const D = G.dst,
    q = D.q,
    tiles = [
      ["🕳️", D.depth, "Profundidad"],
      ["⭐", D.lv, "Nivel"],
      ["💀", D.kills, "Enemigos"],
      ["⏱️", D.time, "Tiempo"],
      ["🪙", D.gold, "Oro reunido"],
      ["👻", "+" + D.souls, "Almas ganadas"],
      ["💎", D.relics, "Reliquias"],
      ["🏆", D.best, "Mejor profundidad"],
    ],
    extra = (G.nu && G.nu.length ? `<div class="dx">🃏 Cartas nuevas: ${G.nu.join(", ")}</div>` : "") + (G.ncl && G.ncl.length ? `<div class="dx">🔓 Clases desbloqueadas: ${G.ncl.join(", ")}</div>` : "");
  ov.style.display = "flex";
  G.ov = 1;
  ov.innerHTML = `<div class="uw ds"><div class="ds-h"><h1>${q ? "EXPEDICIÓN ABANDONADA" : "HAS CAÍDO"}</h1><div class="ds-s">${D.cls} · ${D.weapon}${D.arena ? " · sin recompensas" : ""}</div></div><div class="ds-g">${tiles
    .map((t, i) => `<div class="ds-t" style="animation-delay:${0.08 * i}s"><i>${t[0]}</i><b>${t[1]}</b><span>${t[2]}</span></div>`)
    .join("")}</div>${extra}<p class="ds-n">Pierdes tu equipo y reliquias. Conviertes ${D.souls} de oro en almas (total ${S.souls}).</p></div>`;
  const b = document.createElement("button");
  b.className = "uw-btn pri";
  b.textContent = "Volver a la zona segura";
  b.onclick = menu;
  ov.firstChild.appendChild(b);
}
