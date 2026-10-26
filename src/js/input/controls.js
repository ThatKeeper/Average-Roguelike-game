/* ======================================================================
 * src/js/input/controls.js
 * Teclas configurables (KD/KY) y manejadores de teclado y ratón.
 *
 * Define:
 * KD, KY, tapped
 * ====================================================================== */

// ===== ENTRADA =====
const KD = {
    up: "KeyW",
    down: "KeyS",
    left: "KeyA",
    right: "KeyD",
    q: "KeyQ",
    e: "KeyE",
    r: "KeyR",
    util: "KeyC",
    dodge: "Space",
    inv: "KeyI",
    map: "KeyM",
    use: "KeyF",
    c1: "Digit1",
    c2: "Digit2",
    c3: "Digit3",
    c4: "Digit4",
    book: "KeyB",
    tal: "KeyT",
    php: "KeyZ",
    pmp: "KeyX",
  },
  KY = Object.assign({}, KD, S.keys);
onkeydown = (e) => {
  if (G.rb) {
    e.preventDefault();
    if (e.code != "Escape") {
      KY[G.rb] = e.code;
      S.keys = KY;
      save();
    }
    G.rb = 0;
    ctrls();
    return;
  }
  K[e.code] = 1;
  if (G.st == "title") {
    if (!G.tf) G.tf = 0.5;
    return;
  }
  if (G.st == "hub") {
    if (e.code == KY.use && !G.ov && !trnBusy()) hubUse();
    else if (e.code == "Escape" && G.ov) hide();
    else if (G.sbx && P && !trnBusy()) {
      // sala de clases: se puede esquivar y abrir las cartas para probar la clase
      if (e.code == KY.book) book();
      if (e.code == KY.dodge) {
        e.preventDefault();
        if (!G.ov) dodge();
      }
    }
    return;
  }
  if (G.st == "menu" && G.cfg && e.code == "Escape" && G.ov) return cfgClose();
  if (G.st != "play" || trnBusy()) return;
  if (e.code == "Escape") pause();
  if (e.code == KY.map) bigmap ^= 1;
  if (e.code == KY.inv) inv();
  if (e.code == KY.use) interact();
  if (e.code == KY.book) book();
  if (e.code == KY.tal) tal();
  if (e.code == KY.php && !G.ov) usePotion("hp");
  if (e.code == KY.pmp && !G.ov) usePotion("mp");
  if (e.code == KY.dodge) {
    e.preventDefault();
    if (!G.ov) dodge();
  }
};
onkeyup = (e) => (K[e.code] = 0);
cv.onmousemove = (e) => {
  const b = cv.getBoundingClientRect();
  M.x = ((e.clientX - b.left) * W) / b.width;
  M.y = ((e.clientY - b.top) * H) / b.height;
};
cv.onmousedown = (e) => {
  e.button ? (M.r = 1) : (M.d = 1);
};
onmouseup = (e) => {
  e.button ? (M.r = 0) : (M.d = 0);
};
cv.oncontextmenu = (e) => e.preventDefault();

// Táctil/lápiz: el navegador emite mousedown+mouseup juntos al soltar el dedo, así que M.d
// vuelve a 0 antes de que el bucle lo lea y los menús (título, hub) nunca ven el clic.
// pointerdown registra el toque y lo conserva un instante; tapped() lo consume una vez.
cv.addEventListener("pointerdown", (e) => {
  if (e.pointerType == "mouse") return;
  const b = cv.getBoundingClientRect();
  M.x = ((e.clientX - b.left) * W) / b.width;
  M.y = ((e.clientY - b.top) * H) / b.height;
  M.tap = performance.now();
});
const tapped = () => {
  const v = M.tap && performance.now() - M.tap < 400;
  M.tap = 0;
  return !!v;
};

