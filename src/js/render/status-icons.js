/* ======================================================================
 * src/js/render/status-icons.js
 * Iconos de efectos de estado. Cada icono se va oscureciendo conforme se
 * agota el efecto y parpadea cuando le queda poco.
 *
 * Para añadir un estado nuevo basta con una entrada en STATUS_E (enemigos,
 * clave de e.st) o en STATUS_P (jugador, clave de P). Opcionales: stack = clave
 * con el número de pilas (se muestra como número) y tm = clave del temporizador
 * si el efecto no se mide con su propia clave.
 *
 * Define:
 * STATUS_E, STATUS_P, statusFrac, statusList, drawStatusRow
 * ====================================================================== */

// clave -> icono (emoji provisional, sustituible por sprite), color del borde y nombre
const STATUS_E = {
  burn: { i: "🔥", c: "#f80", n: "Quemadura" },
  poison: { i: "☠️", c: "#6c4", n: "Veneno" },
  bleed: { i: "🩸", c: "#d22", n: "Hemorragia", stack: "bleedN" },
  wet: { i: "💧", c: "#4af", n: "Empapado" },
  slow: { i: "🐌", c: "#9ef", n: "Ralentizado" },
  stun: { i: "💫", c: "#ff4", n: "Aturdido" },
  root: { i: "🌿", c: "#4a4", n: "Enraizado" },
  frac: { i: "💔", c: "#999", n: "Armadura rota" },
  curse: { i: "😈", c: "#a4f", n: "Maldición" },
  cor: { i: "🟣", c: "#c2a", n: "Corrupción", stack: "cor", tm: "cort" }, // pilas; el temporizador es el de la siguiente pila
};
const STATUS_P = {
  slow: { i: "🐌", c: "#9ef", n: "Ralentizado" },
  invc: { i: "🔄", c: "#f5a", n: "Controles invertidos" },
  bt: { i: "💢", c: "#f84", n: "Furia" },
};

/**
 * Fracción (0-1) que le queda a un efecto. Recuerda el valor máximo visto de cada efecto
 * en o._sm para saber cuánto duraba al empezar; al terminar se olvida y se reinicia.
 */
function statusFrac(o, key, v) {
  const m = (o._sm ||= {});
  if (v <= 0) {
    m[key] = 0;
    return 0;
  }
  if (v > (m[key] || 0)) m[key] = v;
  return Math.min(1, v / m[key]);
}

/** Lista de efectos activos de `src` (e.st para enemigos, P para el jugador) según la tabla `defs`. */
function statusList(owner, src, defs) {
  const out = [];
  for (const k in defs) {
    const d = defs[k],
      v = d.tm ? src[d.tm] : src[k];
    if (src[k] > 0 && v > 0) out.push({ k, d, f: statusFrac(owner, k, v), n: d.stack ? src[d.stack] : 0 });
    else if (owner._sm && owner._sm[k]) owner._sm[k] = 0;
  }
  return out;
}

/** Dibuja la fila de iconos centrada en (cx, cy); más de 6 pasan a una segunda fila hacia arriba. */
function drawStatusRow(list, cx, cy, sz) {
  if (!list.length) return;
  const gap = 2,
    per = 6,
    tm = Date.now() / 1000;
  x.save();
  x.textAlign = "center";
  x.textBaseline = "middle";
  list.forEach((s, i) => {
    const row = (i / per) | 0,
      n = Math.min(per, list.length - row * per),
      px = cx + ((i % per) - (n - 1) / 2) * (sz + gap),
      py = cy - row * (sz + gap),
      blink = s.f < 0.25 ? 0.55 + 0.45 * Math.sin(tm * 18) : 1;
    x.globalAlpha = blink;
    x.fillStyle = "#000b";
    x.beginPath();
    x.arc(px, py, sz / 2, 0, 7);
    x.fill();
    x.font = `${sz - 4}px serif`;
    x.fillStyle = "#fff";
    x.fillText(s.d.i, px, py + 1);
    // se oscurece a medida que se agota
    x.fillStyle = `rgba(0,0,0,${(1 - s.f) * 0.8})`;
    x.beginPath();
    x.arc(px, py, sz / 2, 0, 7);
    x.fill();
    x.strokeStyle = s.d.c;
    x.lineWidth = 1.5;
    x.beginPath();
    x.arc(px, py, sz / 2, 0, 7);
    x.stroke();
    if (s.n > 1) {
      x.font = `bold ${Math.max(8, sz - 5)}px Georgia`;
      x.fillStyle = "#fff";
      x.fillText(s.n, px + sz / 2 - 1, py + sz / 2 - 1);
    }
  });
  x.restore();
}
