/* ======================================================================
 * src/js/game/secret-quest.js
 * Contenido secreto de las profundidades: objetos clave, escena del mercader, sala dentro de la sala secreta
 * con su puzzle y el pedestal. (El resto del contenido se descubre jugando.)
 *
 * Define:
 * KEYI, hasKey, sqLampReady, sqGen, sqEnter, sqTick, sqDraw, sqUse, dlgOpen, zoomK, sqZoom
 * ====================================================================== */

// ---- objetos clave (solo duran la partida) ----
const KEYI = {
  lamp: { n: "Lámpara extraña", i: "🪔", d: "Una lámpara que nunca se apaga. Parece reaccionar a algo." },
};
const hasKey = (k) => !!(P && P.keys && P.keys[k]);

// ---- diálogo con texto que se escribe solo ----
// Cuadro de texto con retrato (dentro del contenedor del juego, no del <body>: no desplaza nada).
// Cada frase entra con la misma animación que el cuadro al abrirse.
let DLG = null;
const DLG_PORTRAITS = { Mercader: "mercader" };
// Dibuja el retrato (recorte del sprite: capucha y cara) con píxeles nítidos
function dlgPortrait(cv, key) {
  const c = cv.getContext("2d"),
    im = wImg(WORLD_ASSETS.pr && WORLD_ASSETS.pr[key]);
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, cv.width, cv.height);
  const g = c.createRadialGradient(cv.width / 2, cv.height * 0.45, 6, cv.width / 2, cv.height / 2, cv.width * 0.75);
  g.addColorStop(0, "#3a2d5a");
  g.addColorStop(1, "#120d1c");
  c.fillStyle = g;
  c.fillRect(0, 0, cv.width, cv.height);
  if (wReady(im)) c.drawImage(im, 1, 0, 14, 13, 0, 4, cv.width, (cv.width * 13) / 14);
  else {
    c.font = "56px serif";
    c.textAlign = "center";
    c.fillText("🧙", cv.width / 2, cv.height * 0.7);
  }
}
function dlgOpen(who, lines, done, portrait) {
  dlgClose();
  const el = document.createElement("div");
  el.id = "dlg";
  el.innerHTML = `<div class="dp"><canvas width="112" height="112"></canvas></div><div class="db"><b class="dn"></b><p class="dt"></p><div class="df"><span class="dh"></span><button class="dc">Continuar ▶</button></div></div>`;
  (document.getElementById("w") || document.body).appendChild(el);
  el.querySelector(".dn").textContent = who;
  const pcv = el.querySelector("canvas"),
    pk = portrait || DLG_PORTRAITS[who];
  pk && dlgPortrait(pcv, pk);
  if (!pk) el.querySelector(".dp").style.display = "none";
  else if (!wReady(wImg(WORLD_ASSETS.pr && WORLD_ASSETS.pr[pk]))) setTimeout(() => DLG && dlgPortrait(pcv, pk), 300);
  const tx = el.querySelector(".dt"),
    btn = el.querySelector(".dc"),
    hint = el.querySelector(".dh"),
    d = { i: 0, c: 0, el, tm: 0, done };
  hint.textContent = `${KL(KY.use)} / Espacio`;
  // reinicia la animación de entrada (la misma para el cuadro y para cada frase)
  const enter = () => {
    el.classList.remove("dlg-in");
    void el.offsetWidth;
    el.classList.add("dlg-in");
  };
  const step = () => {
    const L = lines[d.i];
    if (d.c < L.length) {
      d.c = Math.min(L.length, d.c + 1);
      tx.textContent = L.slice(0, d.c);
      if (d.c % 3 == 0) snd(520 + Math.random() * 60, 0.03, "square", 0.012);
    }
    el.classList.toggle("talk", d.c < L.length); // el retrato "habla" mientras se escribe
    btn.textContent = d.i == lines.length - 1 ? "Aceptar ▶" : "Continuar ▶";
  };
  d.tm = setInterval(step, 26);
  d.next = () => {
    const L = lines[d.i];
    if (d.c < L.length) {
      d.c = L.length; // primer toque: termina de escribir la frase
      tx.textContent = L;
      el.classList.remove("talk");
      return;
    }
    if (d.i < lines.length - 1) {
      d.i++;
      d.c = 0;
      tx.textContent = "";
      enter();
      return;
    }
    dlgClose();
    done && done();
  };
  btn.onclick = (e) => {
    e.stopPropagation();
    d.next();
  };
  el.onclick = d.next;
  DLG = d;
  enter();
  step();
}
function dlgClose() {
  if (!DLG) return;
  clearInterval(DLG.tm);
  DLG.el.remove();
  DLG = null;
}
addEventListener(
  "keydown",
  (e) => {
    if (DLG && (e.code == "Escape" || e.code == "Space" || e.code == "Enter" || e.code == KY.use)) {
      e.preventDefault();
      e.stopPropagation();
      if (e.code != "Escape") DLG.next();
    }
  },
  true,
);

// ---- zoom de cámara hacia un punto (escena del mercader) ----
// G.zm = { t0, tx, ty, out }  ·  sqZoom() devuelve la escala actual (1 = sin zoom)
function sqZoom() {
  const z = G.zm;
  if (!z) return 1;
  const n = performance.now(),
    ez = (q) => 1 - Math.pow(1 - cl(q, 0, 1), 3);
  let s;
  if (z.out) {
    s = 1 + 0.75 * (1 - ez((n - z.out) / 700));
    if (n - z.out > 700) {
      G.zm = null;
      return 1;
    }
  } else s = 1 + 0.75 * ez((n - z.t0) / 1000);
  return s;
}

// ---- 1. El mercader y la lámpara ----
// Requisito: tienda al nivel máximo del mercader y profundidad 7 o más.
const sqLampReady = () => !!P && merchLv() >= 3 && G.d >= 7 && !hasKey("lamp") && !G.sqLamp && !(G.sq && G.sq.placed);
function sqLampScene() {
  G.sqLamp = 1;
  G.ov = 1;
  G.zm = { t0: performance.now(), tx: 480, ty: 285 };
  snd(180, 0.5, "sine", 0.05);
  setTimeout(() => {
    dlgOpen(
      "Mercader",
      [
        "Vaya… tantas compras tuyas, y nunca te había visto tan hondo. Eres un cliente especial, viajero.",
        "Entre unas ruinas, hace mucho, encontré esto: una lámpara extraña. No se apaga, no pesa nada y jamás he logrado abrirla.",
        "Dicen que ciertos lugares ocultos reaccionan a ella… Dime, ¿tú qué crees que podrías hacer con algo así?",
        "Quédatela. A mí solo me da escalofríos cuando la miro de noche.",
      ],
      () => {
        P.keys = P.keys || {};
        P.keys.lamp = 1;
        snd(660, 0.3, "triangle", 0.06);
        snd(990, 0.4, "sine", 0.05);
        FX.push({ k: "ring", x: 480, y: 300, r: 90, t: 0.6, m: 0.6, c: "#ffd34a" });
        flash("Objeto clave obtenido: Lámpara extraña (I)");
        G.zm.out = performance.now();
        G.ov = 0;
      },
    );
  }, 900);
}

// ---- 2. Generación del nivel (profundidad 7-10) ----
function sqGen(R, mp, bi) {
  const d = G.d;
  // Entre las profundidades 7 y 9 siempre hay un mercader mientras todavía te falte la lámpara
  if (d >= 7 && d <= 9 && P && merchLv() >= 3 && !hasKey("lamp") && !G.sqLamp && !R.some((r) => r.tp == "shop")) {
    const c = R.find((q, i) => i && i != bi && !q.sec && (q.tp == "combat" || q.tp == "event" || q.tp == "shrine"));
    if (c) {
      c.tp = "shop";
      c.cl = 1;
      c.wv = 1;
    }
  }
  if (d != 10 || !hasKey("lamp")) return;
  // La sala secreta de este piso es obligatoria; dentro de ella se oculta otra sala
  const FREE = (a) => [0, 1, 2, 3].find((di) => mp[a.gx + DIR[di][0] + "," + (a.gy + DIR[di][1])] === undefined);
  const cand = R.map((q, i) => [q, i])
    .filter(([q, i]) => i && i != bi && !q.sup)
    .sort((a, b) => (b[0].sec ? 1 : 0) - (a[0].sec ? 1 : 0) || Object.keys(a[0].nb).length - Object.keys(b[0].nb).length || b[0].dist - a[0].dist);
  for (const [sr, si] of cand) {
    const di = FREE(sr);
    if (di === undefined) continue;
    sr.sec = 1;
    sr.tp = "treasure";
    sr.cl = 1;
    const key = sr.gx + DIR[di][0] + "," + (sr.gy + DIR[di][1]),
      ni = R.length;
    mp[key] = ni;
    sr.nb[di] = ni;
    R.push({
      gx: sr.gx + DIR[di][0],
      gy: sr.gy + DIR[di][1],
      nb: { [(di + 2) % 4]: si },
      dist: sr.dist + 1,
      tp: "puzzle",
      cl: 1,
      sec: 1,
      sup: 1,
      wv: 1,
      obs: [],
      hz: [],
    });
    G.sq = { sr: si, sup: ni, placed: 0, rev: 0 };
    return;
  }
}

// ---- 3. Entrar en las salas ----
const SQ_CR = [
  [300, 190, "#ff5a5a"],
  [660, 190, "#5aa0ff"],
  [300, 410, "#6fe07a"],
  [660, 410, "#ffd34a"],
];
function sqEnter(r, i) {
  if (r.tp == "shop" && sqLampReady()) G.sqPend = 1;
  if (G.sq && G.sq.sr === i && hasKey("lamp") && !G.sq.rev) G.sq.revT = 1.7;
  if (r.tp == "puzzle") r.pz = r.pz || { st: "idle", t: 0, round: 0, seq: [], i: 0, lit: -1, litT: 0, on: [0, 0, 0, 0], done: 0, rise: 0, placed: G.sq ? G.sq.placed : 0 };
}
const sqNewSeq = (r) => {
  const z = r.pz,
    n = 3 + z.round;
  z.seq = Array.from({ length: n }, () => (Math.random() * 4) | 0);
};
function sqTick(dt) {
  if (G.sqPend && !trnBusy() && !G.ov && !G.cs) {
    G.sqPend = 0;
    sqLampScene();
  }
  const r = RM_;
  // la lámpara vibra al entrar en la sala secreta y delata la pared oculta
  if (G.sq && G.sq.revT > 0 && G.R[G.cur] === G.R[G.sq.sr]) {
    G.sq.revT -= dt;
    if (G.sq.revT <= 0 && !G.sq.rev) {
      G.sq.rev = 1;
      G.seen[G.sq.sup] = 1;
      shake = Math.max(shake, 7);
      snd(120, 0.6, "sine", 0.08);
      FX.push({ k: "ring", x: P.x, y: P.y, r: 160, t: 0.7, m: 0.7, c: "#ffd34a" });
      flash("La lámpara vibra con fuerza… una pared se ha desvelado");
    }
  }
  if (r.tp != "puzzle" || !r.pz) return;
  const z = r.pz;
  if (z.litT > 0) z.litT -= dt;
  if (z.done) {
    z.rise = Math.min(1, z.rise + dt / 1.6);
    return;
  }
  z.t += dt;
  if (z.st == "idle") {
    if (z.t > 1.6) {
      sqNewSeq(r);
      z.st = "show";
      z.t = 0;
      flash("Los cristales se iluminan…");
    }
  } else if (z.st == "show") {
    const k = Math.floor(z.t / 0.8),
      ph = z.t - k * 0.8;
    if (k >= z.seq.length) {
      z.st = "input";
      z.i = 0;
      z.lit = -1;
      z.t = 0;
    } else {
      const nl = ph < 0.5 ? z.seq[k] : -1;
      if (nl != z.lit && nl >= 0) snd(300 + nl * 110, 0.35, "sine", 0.06);
      z.lit = nl;
    }
  } else if (z.st == "input") {
    SQ_CR.forEach((c, j) => {
      const near = Math.hypot(P.x - c[0], P.y - c[1]) < 38;
      if (near && !z.on[j]) {
        z.on[j] = 1;
        z.lit = j;
        z.litT = 0.4;
        snd(300 + j * 110, 0.35, "sine", 0.07);
        if (j == z.seq[z.i]) {
          z.i++;
          if (z.i >= z.seq.length) {
            z.round++;
            if (z.round >= 3) {
              z.done = 1;
              z.rise = 0;
              shake = 12;
              flash("Los cristales resuenan… algo emerge del suelo");
              snd(90, 1, "sawtooth", 0.08);
              FX.push({ k: "ring", x: 480, y: 300, r: 220, t: 0.9, m: 0.9, c: "#ffd34a" });
            } else {
              z.st = "between";
              z.t = 0;
              snd(880, 0.4, "triangle", 0.06);
            }
          }
        } else {
          z.st = "fail";
          z.t = 0;
          z.i = 0;
          snd(90, 0.5, "sawtooth", 0.07);
        }
      } else if (!near) z.on[j] = 0;
    });
    if (z.litT <= 0 && z.st == "input") z.lit = -1;
  } else if (z.st == "between") {
    if (z.t > 1.2) {
      sqNewSeq(r);
      z.st = "show";
      z.t = 0;
    }
  } else if (z.st == "fail") {
    if (z.t > 1.5) {
      z.st = "show";
      z.t = 0;
    }
  }
}

// ---- 4. Dibujo de la sala del puzzle ----
function sqDraw(r) {
  const z = r.pz;
  if (!z) return;
  const t = Date.now() / 1000;
  x.save();
  // sello del suelo
  x.strokeStyle = "#ffd34a";
  x.globalAlpha = 0.18 + (z.done ? 0.2 : 0);
  x.lineWidth = 2;
  x.beginPath();
  x.arc(480, 300, 120, 0, 7);
  x.stroke();
  x.beginPath();
  for (let i = 0; i < 4; i++) x.lineTo(SQ_CR[i == 2 ? 3 : i == 3 ? 2 : i][0], SQ_CR[i == 2 ? 3 : i == 3 ? 2 : i][1]);
  x.closePath();
  x.stroke();
  x.globalAlpha = 1;
  SQ_CR.forEach((c, j) => {
    const lit = z.lit == j || z.done || (z.st == "fail" && z.t < 0.5),
      col = z.st == "fail" && z.t < 0.5 && !z.done ? "#ff3030" : c[2];
    x.fillStyle = "#0007";
    x.beginPath();
    x.ellipse(c[0], c[1] + 22, 22, 7, 0, 0, 7);
    x.fill();
    x.fillStyle = "#2b2438";
    x.fillRect(c[0] - 15, c[1] + 6, 30, 16);
    if (lit) {
      const g = x.createRadialGradient(c[0], c[1], 4, c[0], c[1], 80);
      g.addColorStop(0, col + "aa");
      g.addColorStop(1, col + "00");
      x.fillStyle = g;
      x.beginPath();
      x.arc(c[0], c[1], 80, 0, 7);
      x.fill();
    }
    x.fillStyle = lit ? col : "#3a3350";
    x.strokeStyle = "#000";
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(c[0], c[1] - 24 + Math.sin(t * 2 + j) * 2);
    x.lineTo(c[0] + 13, c[1]);
    x.lineTo(c[0], c[1] + 8);
    x.lineTo(c[0] - 13, c[1]);
    x.closePath();
    x.fill();
    x.stroke();
    if (z.st == "input" && !z.done) {
      x.strokeStyle = col;
      x.globalAlpha = 0.25;
      x.beginPath();
      x.arc(c[0], c[1], 38, 0, 7);
      x.stroke();
      x.globalAlpha = 1;
    }
  });
  // progreso de rondas
  x.fillStyle = "#fff";
  x.font = "12px Georgia";
  x.textAlign = "center";
  if (!z.done) {
    for (let i = 0; i < 3; i++) {
      x.fillStyle = i < z.round ? "#ffd34a" : "#ffffff30";
      x.beginPath();
      x.arc(450 + i * 30, 70, 6, 0, 7);
      x.fill();
    }
  }
  // pedestal
  if (z.done) {
    const k = z.rise,
      py = 300 + 40 * (1 - k);
    x.globalAlpha = Math.min(1, k * 2);
    x.fillStyle = "#0007";
    x.beginPath();
    x.ellipse(480, py + 26, 26, 8, 0, 0, 7);
    x.fill();
    x.fillStyle = "#4a4060";
    x.strokeStyle = "#000";
    x.lineWidth = 2;
    x.fillRect(466, py - 8, 28, 32);
    x.strokeRect(466, py - 8, 28, 32);
    x.fillStyle = "#6a5d88";
    x.fillRect(458, py - 16, 44, 10);
    x.strokeRect(458, py - 16, 44, 10);
    if (z.placed) {
      // lámpara encendida sobre el pedestal
      const g = x.createRadialGradient(480, py - 30, 4, 480, py - 30, 90);
      g.addColorStop(0, "#ffd34aaa");
      g.addColorStop(1, "#ffd34a00");
      x.fillStyle = g;
      x.beginPath();
      x.arc(480, py - 30, 90, 0, 7);
      x.fill();
      x.globalAlpha = 1;
      spr("🪔", 480, py - 30 + Math.sin(t * 3) * 2, 30);
    } else if (k >= 1) {
      x.globalAlpha = 0.5 + 0.3 * Math.sin(t * 3);
      x.strokeStyle = "#ffd34a";
      x.lineWidth = 2;
      x.beginPath();
      x.ellipse(480, py - 26, 12, 7, 0, 0, 7);
      x.stroke();
      x.globalAlpha = 1;
      x.fillStyle = "#fff";
      x.font = "12px Georgia";
      x.fillText(hasKey("lamp") ? "Colocar lámpara [F]" : "Un hueco con forma de lámpara", 480, py - 46);
    }
  }
  x.restore();
}

// ---- 5. Interacción con el pedestal (tecla F) ----
function sqUse() {
  const r = RM_;
  if (r.tp != "puzzle" || !r.pz || !r.pz.done || r.pz.rise < 1) return false;
  if (r.pz.placed) return true;
  if (!hasKey("lamp")) {
    flash("Falta algo que encaje en el pedestal…");
    return true;
  }
  delete P.keys.lamp;
  r.pz.placed = 1;
  G.sq.placed = 1;
  shake = 14;
  snd(110, 0.9, "sine", 0.09);
  snd(660, 0.6, "triangle", 0.06);
  for (let i = 0; i < 4; i++) FX.push({ k: "ring", x: 480, y: 300, r: 80 + i * 60, t: 0.5 + i * 0.2, m: 0.5 + i * 0.2, c: "#ffd34a" });
  flash("La lámpara encaja y se enciende. Algo ha despertado en lo más hondo…");
  return true;
}
