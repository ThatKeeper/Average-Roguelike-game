/* ======================================================================
 * src/js/game/terrain.js
 * Terreno estilo "Binding of Isaac": plantillas de hoyos y muros, validación de salas, disposición y dibujado de hoyos.
 *
 * Define:
 * okItems, TPL, cv_, OKT, layout, pitDraw
 * ====================================================================== */

// ===== TERRENO ESTILO "BINDING OF ISAAC": hoyos (bloquean el paso, no los proyectiles) y muros. Cada plantilla se valida (sin zonas aisladas) =====
function okItems(it) {
  const cs = 20,
    nx = 43,
    ny = 25,
    B = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const cx = 60 + i * cs,
        cy = 60 + j * cs;
      if (
        it.some((b) => cx > b.x - 14 && cx < b.x + b.w + 14 && cy > b.y - 14 && cy < b.y + b.h + 14)
      )
        B[j * nx + i] = 1;
    }
  const id = (px, py) => (((py - 50) / cs) | 0) * nx + (((px - 50) / cs) | 0),
    a0 = id(480, 300);
  if (B[a0]) return false;
  const sn = new Uint8Array(nx * ny),
    st = [a0];
  sn[a0] = 1;
  let n = 0;
  while (st.length) {
    const c = st.pop();
    n++;
    const ci = c % nx,
      cj = (c / nx) | 0;
    for (const [di, dj] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const a = ci + di,
        b = cj + dj;
      if (a < 0 || b < 0 || a >= nx || b >= ny) continue;
      const q = b * nx + a;
      if (!B[q] && !sn[q]) {
        sn[q] = 1;
        st.push(q);
      }
    }
  }
  let fr = 0;
  for (let q = 0; q < nx * ny; q++) if (!B[q]) fr++;
  return (
    n == fr &&
    [
      [480, 80],
      [880, 300],
      [480, 520],
      [80, 300],
      [480, 170],
    ].every((p) => sn[id(p[0], p[1])])
  );
}
const TPL = [
  [
    "Pilares",
    1,
    [
      ["w", 220, 160, 50, 50],
      ["w", 690, 160, 50, 50],
      ["w", 220, 390, 50, 50],
      ["w", 690, 390, 50, 50],
    ],
  ],
  [
    "Hoyos laterales",
    1,
    [
      ["p", 180, 150, 140, 60],
      ["p", 640, 150, 140, 60],
      ["p", 180, 390, 140, 60],
      ["p", 640, 390, 140, 60],
    ],
  ],
  [
    "Grietas",
    0,
    [
      ["p", 300, 200, 60, 200],
      ["p", 600, 200, 60, 200],
    ],
  ],
  [
    "Esquinas en L",
    1,
    [
      ["w", 70, 70, 160, 30],
      ["w", 70, 70, 30, 150],
      ["w", 730, 70, 160, 30],
      ["w", 860, 70, 30, 150],
      ["w", 70, 470, 160, 30],
      ["w", 70, 350, 30, 150],
      ["w", 730, 470, 160, 30],
      ["w", 860, 350, 30, 150],
    ],
  ],
  [
    "Galería",
    0,
    [
      ["w", 200, 200, 200, 25],
      ["w", 560, 200, 200, 25],
      ["w", 200, 375, 200, 25],
      ["w", 560, 375, 200, 25],
    ],
  ],
  [
    "Diagonales",
    0,
    [
      ["w", 180, 140, 40, 40],
      ["w", 260, 200, 40, 40],
      ["w", 740, 140, 40, 40],
      ["w", 660, 200, 40, 40],
      ["w", 180, 420, 40, 40],
      ["w", 260, 360, 40, 40],
      ["w", 740, 420, 40, 40],
      ["w", 660, 360, 40, 40],
    ],
  ],
  [
    "Río",
    1,
    [
      ["p", 150, 285, 250, 30],
      ["p", 560, 285, 250, 30],
    ],
  ],
  [
    "Estanques",
    1,
    [
      ["p", 200, 230, 100, 140],
      ["p", 660, 230, 100, 140],
    ],
  ],
  [
    "Ajedrez",
    0,
    [
      ["w", 260, 150, 30, 30],
      ["w", 670, 150, 30, 30],
      ["w", 330, 330, 30, 30],
      ["w", 600, 240, 30, 30],
      ["w", 260, 420, 30, 30],
      ["w", 670, 420, 30, 30],
    ],
  ],
  [
    "Muralla partida",
    0,
    [
      ["w", 330, 100, 30, 110],
      ["w", 330, 390, 30, 110],
      ["w", 600, 100, 30, 110],
      ["w", 600, 390, 30, 110],
    ],
  ],
  [
    "Fosos de esquina",
    1,
    [
      ["p", 80, 80, 90, 70],
      ["p", 790, 80, 90, 70],
      ["p", 80, 450, 90, 70],
      ["p", 790, 450, 90, 70],
    ],
  ],
  [
    "Cruz de muros",
    0,
    [
      ["w", 250, 285, 120, 30],
      ["w", 590, 285, 120, 30],
      ["w", 465, 230, 30, 0.01],
    ]
      .slice(0, 2)
      .concat([
        ["w", 465, 100, 30, 60],
        ["w", 465, 440, 30, 60],
      ]),
  ],
  [
    "Islotes",
    0,
    [
      ["p", 240, 240, 80, 120],
      ["w", 640, 240, 80, 120],
    ],
  ],
];
const cv_ = (t) => t[2].map((a) => ({ x: a[1], y: a[2], w: a[3], h: a[4], pit: a[0] == "p" })),
  OKT = TPL.filter((t) => okItems(cv_(t)));
function layout(o, tp, rr) {
  if (rr() >= 0.4) return o;
  const pl = tp == "boss" ? OKT.filter((t) => t[1]) : OKT;
  if (!pl.length) return o;
  let it = cv_(pl[(rr() * pl.length) | 0]);
  if (S.hard && tp != "boss" && rr() < 0.5) {
    const e = it.concat(cv_(pl[(rr() * pl.length) | 0]));
    if (okItems(e)) it = e;
  }
  return it;
}
function pitDraw(o) {
  x.save();
  const g = x.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
  g.addColorStop(0, "#000");
  g.addColorStop(1, "#140b1c");
  x.fillStyle = g;
  x.fillRect(o.x, o.y, o.w, o.h);
  x.strokeStyle = "#4a3858";
  x.lineWidth = 3;
  x.strokeRect(o.x + 1.5, o.y + 1.5, o.w - 3, o.h - 3);
  x.globalAlpha = 0.3;
  x.fillStyle = "#000";
  for (let i = 8; i < o.w - 4; i += 16) x.fillRect(o.x + i, o.y + 5, 2, o.h - 10);
  x.restore();
}
