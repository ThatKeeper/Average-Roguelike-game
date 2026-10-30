/* ======================================================================
 * src/js/render/transitions.js
 * Transiciones de escena (evitan los cambios bruscos):
 *  - trnCubes(dir): cubitos negros que cubren la pantalla y la descubren, de arriba abajo
 *    ("down") o de abajo arriba ("up"). Se usa en las transiciones normales: bajar de piso,
 *    entrar a la mazmorra desde el hub y volver al hub.
 *  - trnSlide(k, sala, desde): la cámara se desplaza hacia la nueva sala por la puerta k.
 *    Se usa al cruzar puertas entre salas.
 * Mientras una transición bloquea el juego (trnBusy) la simulación queda en pausa.
 *
 * Define:
 * XTR, trnCubes, trnSlide, trnHubSlide, trnTick, trnBusy, trnFull, trnOverlay
 * ====================================================================== */

let XTR = null;
const XC = { step: 0.024, jit: 0.1, grow: 0.2, hold: 0.12, slide: 0.55 },
  XC_TOTAL = (GH - 1) * XC.step + XC.jit + XC.grow;
const xEase = (p) => p * p * (3 - 2 * p),
  xEaseIO = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

function snapCanvas() {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  c.getContext("2d").drawImage(cv, 0, 0);
  return c;
}

// dir: "down" (descendente) | "up" (ascendente). skipCover: no cubrir (la pantalla ya está oscura).
function trnCubes(dir, skipCover) {
  if (XTR) return;
  const jit = [];
  for (let i = 0; i < GW * GH; i++) jit.push(Math.random() * XC.jit);
  XTR = { k: "cubes", dir, t: 0, ph: skipCover ? 2 : 1, snap: skipCover ? null : snapCanvas(), jit };
}

// Cruza la puerta k: la cámara se mueve hacia la nueva sala (que ya queda cargada con enter()).
function trnSlide(k, to, from) {
  if (XTR) return;
  const p0 = { x: P.x, y: P.y };
  drawWorld(true);
  const A = snapCanvas();
  enter(to, from);
  drawWorld(true);
  const B = snapCanvas();
  XTR = { k: "slide", dir: +k, t: 0, A, B, p0, p1: { x: P.x, y: P.y } };
  P.vx = P.vy = 0;
}

// Desliza la cámara entre las dos salas del hub (hub ↔ sala de clases). sw() cambia el estado; p0/p1 = recorrido del personaje.
function trnHubSlide(k, sw, p0, p1) {
  if (XTR) return;
  G.hr ? crDraw(true) : hubDraw(true);
  const A = snapCanvas();
  sw();
  G.hr ? crDraw(true) : hubDraw(true);
  const B = snapCanvas();
  XTR = { k: "slide", dir: +k, t: 0, A, B, p0, p1, hub: 1 };
  if (P) P.vx = P.vy = 0;
  K = {};
}

function trnTick(dt) {
  if (!XTR) return;
  XTR.t += dt;
  if (XTR.k == "slide") {
    if (XTR.t >= XC.slide) XTR = null;
  } else if (XTR.ph == 1) {
    if (XTR.t >= XC_TOTAL + XC.hold) {
      XTR.ph = 2;
      XTR.t = 0;
      XTR.snap = null;
    }
  } else if (XTR.t >= XC_TOTAL) XTR = null;
}
// ¿hay que pausar la simulación?
const trnBusy = () => !!XTR && (XTR.k == "slide" || XTR.ph == 1);

function cubesDraw(T) {
  x.save();
  x.fillStyle = "#000";
  for (let j = 0; j < GH; j++) {
    const o = T.dir == "down" ? j : GH - 1 - j;
    for (let i = 0; i < GW; i++) {
      const p = Math.max(0, Math.min(1, (T.t - (o * XC.step + T.jit[j * GW + i])) / XC.grow)),
        e = xEase(p),
        s = T.ph == 1 ? e : 1 - e;
      if (s <= 0.01) continue;
      const cx = i * TS + TS / 2,
        cy = j * TS + TS / 2;
      if (s >= 0.999) {
        x.fillRect(i * TS - 0.5, j * TS - 0.5, TS + 1, TS + 1);
        continue;
      }
      x.save();
      x.translate(cx, cy);
      x.rotate((1 - s) * 0.9 * (T.ph == 1 ? 1 : -1));
      x.fillRect((-TS * s) / 2, (-TS * s) / 2, TS * s, TS * s);
      x.restore();
    }
  }
  x.restore();
}

// Devuelve true si la transición dibujó el fotograma completo (el bucle no dibuja el juego).
function trnFull() {
  const T = XTR;
  if (!T) return false;
  if (T.k == "slide") {
    const e = xEaseIO(Math.min(1, T.t / XC.slide)),
      v = DIR[T.dir],
      vx = v[0] * W,
      vy = v[1] * H,
      cx = vx * e,
      cy = vy * e;
    x.save();
    x.clearRect(0, 0, W, H);
    x.drawImage(T.A, -cx, -cy);
    x.drawImage(T.B, vx - cx, vy - cy);
    if (T.hub) {
      drawHubHero(T.p0.x + (T.p1.x + vx - T.p0.x) * e - cx, T.p0.y + (T.p1.y + vy - T.p0.y) * e - cy);
      x.restore();
      return true;
    }
    // el jugador recorre el trayecto entre ambas puertas mientras la cámara avanza
    const sx = P.x,
      sy = P.y;
    P.x = T.p0.x + (T.p1.x + vx - T.p0.x) * e - cx;
    P.y = T.p0.y + (T.p1.y + vy - T.p0.y) * e - cy;
    x.globalAlpha = P.inv > 0 && Math.floor(Date.now() / 60) % 2 ? 0.4 : 1;
    safe(drawP);
    x.globalAlpha = 1;
    P.x = sx;
    P.y = sy;
    x.restore();
    hud();
    dbgHud();
    return true;
  }
  if (T.ph == 1) {
    x.clearRect(0, 0, W, H);
    if (T.snap) x.drawImage(T.snap, 0, 0);
    cubesDraw(T);
    return true;
  }
  return false;
}
// Segunda mitad de los cubos: se dibuja sobre el juego ya renderizado.
function trnOverlay() {
  if (XTR && XTR.k == "cubes" && XTR.ph == 2) cubesDraw(XTR);
}
