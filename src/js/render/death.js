/* ======================================================================
 * src/js/render/death.js
 * Animación de muerte: la pantalla se oscurece, decenas de manos blancas salen de la oscuridad y agarran
 * al protagonista; él forcejea, resiste y al final se lo llevan hacia arriba. Después aparece la pantalla
 * de estadísticas de la partida.
 *
 * Define:
 * DTH_END, dthStart, dthHandBody, dthHandSprite, drawHand, drawDeath, deathStats
 * ====================================================================== */

const DTH_END = 7.2; // segundos hasta mostrar las estadísticas
const dthEase = (p) => p * p * (3 - 2 * p);
let DTH_VIG = null; // textura de la viñeta (caché)

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

// Una mano pálida y huesuda con antebrazo. (hx,hy) = muñeca/palma · ang = hacia dónde apunta · grip 0..1 = cuánto cierra los dedos
// Dedos finos de tres falanges (con nudillos y uña), palma con forma de mano, pulgar oponible y antebrazo estrecho que se pierde en la oscuridad.
// RENDIMIENTO: la palma y los dedos se pintan una sola vez por tamaño y apretón (sprite en caché) y cada fotograma solo se estampan;
// antes se redibujaban ~60 trazados y un degradado por mano y fotograma (46 manos), lo que causaba el lag de la pantalla de muerte.
function dthHandBody(g2, sz, grip) {
  g2.lineCap = g2.lineJoin = "round";
  const SK = "#e8e6ee", SH = "#b9b6c6", ED = "#6f6c80", NA = "#d4d0dc",
    wx = -sz * 0.46;
  // dedo de 3 falanges: base (bx,by), ángulo a0, longitudes, curvatura total (rad) repartida 25/35/40 %, anchura base→punta
  const finger = (bx, by, a0, len, curl, w0, w1) => {
    const ls = [len * 0.42, len * 0.32, len * 0.26],
      cs = [curl * 0.25, curl * 0.35, curl * 0.4],
      pts = [[bx, by]],
      ws = [w0, w0 * 0.88, w0 * 0.74, w1];
    let a = a0,
      px = bx,
      py = by;
    for (let i = 0; i < 3; i++) {
      a += cs[i];
      px += Math.cos(a) * ls[i];
      py += Math.sin(a) * ls[i];
      pts.push([px, py]);
    }
    const seg = (i, grow) => {
      const [x0, y0] = pts[i],
        [x1, y1] = pts[i + 1],
        n = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2,
        r0 = ws[i] / 2 + grow,
        r1 = ws[i + 1] / 2 + grow,
        c = Math.cos(n),
        sn = Math.sin(n);
      g2.beginPath();
      g2.moveTo(x0 + c * r0, y0 + sn * r0);
      g2.lineTo(x1 + c * r1, y1 + sn * r1);
      g2.lineTo(x1 - c * r1, y1 - sn * r1);
      g2.lineTo(x0 - c * r0, y0 - sn * r0);
      g2.closePath();
      g2.fill();
      g2.beginPath();
      g2.arc(x1, y1, r1, 0, 7);
      g2.fill();
    };
    g2.fillStyle = ED; // contorno
    for (let i = 0; i < 3; i++) seg(i, 1);
    g2.fillStyle = SK; // carne
    for (let i = 0; i < 3; i++) seg(i, 0);
    g2.strokeStyle = SH; // pliegues de los nudillos
    g2.lineWidth = Math.max(1, w0 * 0.12);
    for (let i = 1; i < 3; i++) {
      const [jx, jy] = pts[i],
        n = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]) + Math.PI / 2,
        r = ws[i] * 0.4;
      g2.beginPath();
      g2.moveTo(jx + Math.cos(n) * r, jy + Math.sin(n) * r);
      g2.lineTo(jx - Math.cos(n) * r, jy - Math.sin(n) * r);
      g2.stroke();
    }
    const [tx, ty] = pts[3]; // uña
    g2.fillStyle = NA;
    g2.beginPath();
    g2.ellipse(tx, ty, ws[3] * 0.55, ws[3] * 0.38, a, 0, 7);
    g2.fill();
  };
  // palma: muñeca estrecha → nudillos anchos, con el abultamiento del pulgar en el lado +y
  const pw = sz * 0.34;
  g2.beginPath();
  g2.moveTo(wx, -sz * 0.12);
  g2.quadraticCurveTo(-sz * 0.12, -pw * 1.02, sz * 0.36, -pw);
  g2.lineTo(sz * 0.4, -pw * 0.2);
  g2.lineTo(sz * 0.4, pw * 0.85);
  g2.quadraticCurveTo(sz * 0.02, pw * 1.35, wx, sz * 0.12);
  g2.closePath();
  g2.fillStyle = SK;
  g2.fill();
  g2.strokeStyle = ED;
  g2.lineWidth = 1.6;
  g2.stroke();
  g2.strokeStyle = SH; // tendones del dorso
  g2.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const by = (i - 1.5) * sz * 0.2;
    g2.beginPath();
    g2.moveTo(sz * 0.36, by);
    g2.lineTo(wx * 0.5, by * 0.35);
    g2.stroke();
  }
  // dedos: se abren al acercarse y se curvan hacia el centro al agarrar (meñique más corto, corazón más largo)
  const fl = [0.78, 0.98, 1, 0.9];
  for (let i = 0; i < 4; i++) {
    const by = (i - 1.5) * sz * 0.2,
      side = by < 0 ? 1 : -1,
      spread = (1 - grip) * 0.2 * (i - 1.5),
      curl = side * (0.18 + grip * 1.15) * (1 + Math.abs(i - 1.5) * 0.12);
    finger(sz * 0.37, by, spread, sz * 0.78 * fl[i], curl, sz * 0.105, sz * 0.07);
    g2.fillStyle = SH; // nudillo
    g2.beginPath();
    g2.arc(sz * 0.38, by, sz * 0.05, 0, 7);
    g2.fill();
  }
  finger(sz * 0.0, sz * 0.3, 0.75 - grip * 0.45, sz * 0.56, -0.25 - grip * 0.6, sz * 0.12, sz * 0.08); // pulgar
}
const DTH_HC = {}; // sprites de mano en caché: "tamaño|apretón" -> { cv, ox, oy }
function dthHandSprite(sz, grip) {
  const szq = Math.max(3, Math.round(sz / 3) * 3),
    gq = Math.round(grip * 6),
    key = szq + "|" + gq;
  let s = DTH_HC[key];
  if (!s) {
    const pad = 2,
      ox = Math.ceil(szq * 0.7) + pad,
      w = Math.ceil(szq * 2.4) + pad * 2,
      h = Math.ceil(szq * 2.6) + pad * 2,
      cv3 = document.createElement("canvas");
    cv3.width = w;
    cv3.height = h;
    const c = cv3.getContext("2d");
    c.translate(ox, h / 2);
    dthHandBody(c, szq, gq / 6);
    s = DTH_HC[key] = { cv: cv3, ox, oy: h / 2, sz: szq };
  }
  return s;
}
let DTH_ARMG = null; // degradado del antebrazo en espacio unitario (se crea una vez)
function drawHand(hx, hy, ang, sz, grip, alpha, L) {
  x.save();
  x.globalAlpha = alpha;
  x.translate(hx, hy);
  x.rotate(ang);
  // antebrazo: estrecho, con degradado hacia la oscuridad (polígono unitario escalado: x·L, y·sz)
  if (!DTH_ARMG) {
    DTH_ARMG = x.createLinearGradient(0, 0, -1, 0);
    DTH_ARMG.addColorStop(0, "#e8e6ee");
    DTH_ARMG.addColorStop(0.6, "#e8e6eecc");
    DTH_ARMG.addColorStop(1, "#e8e6ee00");
  }
  x.save();
  x.translate(-sz * 0.46, 0);
  x.scale(L, sz);
  x.fillStyle = DTH_ARMG;
  x.beginPath();
  x.moveTo(0, -0.12);
  x.lineTo(-0.35, -0.105);
  x.lineTo(-1, -0.14);
  x.lineTo(-1, 0.14);
  x.lineTo(-0.35, 0.105);
  x.lineTo(0, 0.12);
  x.closePath();
  x.fill();
  x.strokeStyle = "#6f6c8099"; // contorno de los bordes largos (separa los antebrazos que se superponen)
  x.lineWidth = 1 / sz;
  x.beginPath();
  x.moveTo(0, -0.12);
  x.lineTo(-0.35, -0.105);
  x.lineTo(-0.6, -0.125);
  x.moveTo(0, 0.12);
  x.lineTo(-0.35, 0.105);
  x.lineTo(-0.6, 0.125);
  x.stroke();
  x.restore();
  const sp = dthHandSprite(sz, grip),
    k = sz / sp.sz;
  x.drawImage(sp.cv, -sp.ox * k, -sp.oy * k, sp.cv.width * k, sp.cv.height * k);
  x.restore();
}

// Fotograma de la muerte; devuelve true cuando ya terminó
function drawDeath() {
  const D = G.dth,
    now = performance.now();
  D.t += Math.min(0.1, (now - D.last) / 1000);
  D.last = now;
  if ((M.d || K.Enter || tapped()) && D.t > 1.4 && D.t < DTH_END - 1.1) {
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
  // El mundo no cambia durante la escena: se dibuja una vez y se guarda como imagen (antes se redibujaba entero en cada fotograma).
  if (!D.bg) {
    drawWorld(true);
    D.bg = document.createElement("canvas");
    D.bg.width = cv.width;
    D.bg.height = cv.height;
    D.bg.getContext("2d").drawImage(cv, 0, 0);
  } else x.drawImage(D.bg, 0, 0);
  // oscuridad: velo general + círculo de luz que se cierra sobre él (textura radial en caché, escalada)
  x.globalAlpha = 1;
  x.fillStyle = `rgba(0,0,0,${0.5 * dark})`;
  x.fillRect(0, 0, W, H);
  const r0 = 520 - 400 * dark;
  if (!DTH_VIG) {
    DTH_VIG = document.createElement("canvas");
    DTH_VIG.width = DTH_VIG.height = 256;
    const c = DTH_VIG.getContext("2d"),
      vg = c.createRadialGradient(128, 128, 32, 128, 128, 128);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,1)");
    c.fillStyle = vg;
    c.fillRect(0, 0, 256, 256);
  }
  x.globalAlpha = 0.97 * dark;
  x.drawImage(DTH_VIG, px - r0, py - r0, r0 * 2, r0 * 2);
  x.fillStyle = "#000";
  x.fillRect(0, 0, W, Math.max(0, py - r0));
  x.fillRect(0, Math.min(H, py + r0), W, H);
  x.fillRect(0, Math.max(0, py - r0), Math.max(0, px - r0), Math.min(H, py + r0) - Math.max(0, py - r0));
  x.fillRect(Math.min(W, px + r0), Math.max(0, py - r0), W, Math.min(H, py + r0) - Math.max(0, py - r0));
  x.globalAlpha = 1;
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
    extra = (G.nu && G.nu.length ? `<div class="dx">🃏 Cartas nuevas: ${G.nu.join(", ")}</div>` : "") + (G.ncl && G.ncl.length ? `<div class="dx">🔓 Clases desbloqueadas: ${G.ncl.join(", ")}</div>` : "") + (D.hard ? `<div class="dx">☠ Todo se ha vuelto un poco más difícil: modo difícil desbloqueado</div>` : "");
  ov.style.display = "flex";
  G.ov = 1;
  ov.innerHTML = `<div class="uw ds"><div class="ds-h"><h1>${D.fin ? "LA OSCURIDAD TE RECLAMA" : q ? "EXPEDICIÓN ABANDONADA" : "HAS CAÍDO"}</h1><div class="ds-s">${D.cls} · ${D.weapon}${D.arena ? " · sin recompensas" : ""}</div></div><div class="ds-g">${tiles
    .map((t, i) => `<div class="ds-t" style="animation-delay:${0.08 * i}s"><i>${t[0]}</i><b>${t[1]}</b><span>${t[2]}</span></div>`)
    .join("")}</div>${extra}<p class="ds-n">Pierdes tu equipo y reliquias. Conviertes ${D.souls} de oro en almas (total ${S.souls}).</p></div>`;
  const b = document.createElement("button");
  b.className = "uw-btn pri";
  b.textContent = "Volver a la zona segura";
  b.onclick = menu;
  ov.firstChild.appendChild(b);
}
