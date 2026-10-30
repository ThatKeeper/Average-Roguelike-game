/* ======================================================================
 * src/js/bosses/boss-roster-c.js
 * Jefes hechos a mano · Cavernas de lava (Pyrrus, Aska, Brann), Abismos helados (Cael, Ymir Menor, Morwen)
 * y Dimensión corrupta (Dagon, Nuru, Sable).
 * ====================================================================== */

// ---------- 20 · Pyrrus, Alma de Brasa (Cavernas de lava) ----------
mkBoss(20, {
  d: "Espíritu de fuego nervioso que no se queda quieto y deja un rastro de brasas. Espirales de ascuas, saltos de llama con charco al aterrizar, una danza de tres embestidas encadenadas y una combustión que crece hasta estallar: después se apaga y queda expuesto.",
  init: (e) => {
    e.wp = { x: e.x, y: e.y };
  },
  pas: (e, c, dt) => {
    e.t5 = (e.t5 || 0.5) - dt;
    if (e.t5 <= 0) {
      e.t5 = 0.5;
      bz({ k: "pool", x: e.x, y: e.y, r: 24, t: 0.25, life: 3, d: e.dmg * 0.3, c: "#ff8a2a" });
    }
  },
  mv: (e, c, dt) => {
    const d = Math.hypot(e.wp.x - e.x, e.wp.y - e.y);
    if (d < 20 || Math.random() < dt * 0.4) e.wp = { x: rnd(120, 840), y: rnd(120, 480) };
    c.mv(((e.wp.x - e.x) / (d || 1)) * c.sp * 2.3, ((e.wp.y - e.y) / (d || 1)) * c.sp * 2.3);
  },
  at: [
    {
      n: "Espiral de ascuas",
      f: (e, c, k) => {
        const n = 16 + c.ph * 4;
        for (let j = 0; j < n; j++) later(e, j * 0.09, () => bt(e, j * 0.62, 200, e.dmg * 0.4, 0.3, "#ffb04a"));
        return 2.4;
      },
    },
    {
      n: "Salto de llama",
      w: 2,
      f: (e, c, k) => {
        const px = cl(P.x + rnd(-80, 80), 100, 860),
          py = cl(P.y + rnd(-80, 80), 100, 500);
        bz({ k: "pool", x: px, y: py, r: 100, t: 0.9, d: e.dmg * 1.2, c: k });
        ghost(e, 0.9);
        e.busy = 0.9;
        later(e, 0.9, () => {
          e.x = px;
          e.y = py;
          bz({ k: "pool", x: px, y: py, r: 100, t: 0.1, life: 3.5, d: e.dmg * 0.3, c: "#ff8a2a" });
        });
        return 2.1;
      },
    },
    {
      n: "Combustión",
      f: (e, c, k) => {
        bz({ k: "ring", x: e.x, y: e.y, ri: 0, ro: 260, t: 1.5, d: e.dmg * 1.3, c: k });
        e.busy = 1.6;
        e.cmb = 1;
        later(e, 1.5, () => {
          brs(e, 14, 230, e.dmg * 0.45, 0, 0, "#ffb04a");
          e.vul = 1.8;
          flash("Pyrrus se apaga: ¡ataca!");
        });
        return 2.6;
      },
    },
    {
      n: "Danza de brasas",
      p: 1,
      f: (e, c, k) => {
        for (let j = 0; j < 3; j++)
          later(e, j * 0.75, () => {
            bz({ k: "beam", x: e.x, y: e.y, a: Math.atan2(P.y - e.y, P.x - e.x), len: 420, w: 18, t: 0.4, d: e.dmg, c: k });
            later(e, 0.4, () => dsh(e, 0.22, 600));
          });
        e.busy = 2.4;
        return 2.8;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    for (let i = 0; i < 3; i++) {
      x.fillStyle = ["#ff4a1a", F, "#ffe08a"][i];
      const s = 1 - i * 0.28;
      dPo([[0, -r * 1.5 * s + Math.sin(t * 9 + i) * 3], [r * 0.7 * s, -r * 0.2], [r * 0.85 * s, r * 0.5 * s], [0, r * 0.95 * s], [-r * 0.85 * s, r * 0.5 * s], [-r * 0.7 * s, -r * 0.2]]);
    }
    dEy(-r * 0.22, 0, 3, "#300");
    dEy(r * 0.22, 0, 3, "#300");
    x.fillStyle = "#ffa04a";
    for (let i = 0; i < 5; i++) dEy(Math.sin(t * 2 + i * 1.7) * r * 0.9, -((t * 40 + i * 20) % (r * 2)) + r * 0.6, 2, "#ffa04a");
  },
});

// ---------- 19 · Aska, Lanza Tormenta (Cavernas de lava) ----------
mkBoss(19, {
  d: "Guerrera de la tormenta volcánica. Lanzazos con arrancada, lanza arrojadiza que clava un relámpago ramificado y tormentas de rayos que cierran el cerco sobre ti. En fase 2 gira su lanza como un arco eléctrico. Tras cada lanzazo recupera el arma un instante.",
  mv: (e, c) => {
    if (c.d < 180) c.mv(-c.nx * c.sp * 1.4, -c.ny * c.sp * 1.4);
    else if (c.d > 290) c.mv(c.nx * c.sp * 1.3, c.ny * c.sp * 1.3);
    else c.mv(-c.ny * c.sp * e.dir * 1.2, c.nx * c.sp * e.dir * 1.2);
  },
  at: [
    {
      n: "Lanzazo",
      w: 2,
      f: (e, c, k) => {
        bz({ k: "beam", x: e.x, y: e.y, a: c.a, len: 600, w: 13, t: 0.5, d: e.dmg * 1.3, c: k });
        e.busy = 0.55;
        later(e, 0.5, () => dsh(e, 0.24, 720));
        later(e, 0.8, () => {
          e.vul = 0.8;
        });
        return 2.2;
      },
    },
    {
      n: "Lanza arrojadiza",
      f: (e, c, k) => {
        const px = P.x,
          py = P.y,
          a = Math.atan2(py - e.y, px - e.x);
        bt(e, a, Math.hypot(px - e.x, py - e.y) / 0.9, e.dmg * 0.5, 0, "#fff");
        bz({ k: "pool", x: px, y: py, r: 52, t: 0.9, d: e.dmg * 1.3, c: k });
        for (let i = 0; i < 4; i++) bz({ k: "beam", x: px, y: py, a: i * 1.5708 + 0.785, len: 150, w: 12, t: 0.9, d: e.dmg, c: k });
        return 2.4;
      },
    },
    {
      n: "Tormenta",
      f: (e, c, k) => {
        const n = 6 + c.ph * 2;
        for (let i = 0; i < n; i++) {
          const R = 230 - i * (190 / n),
            q = i * 1.9;
          bz({ k: "pool", x: cl(P.x + Math.cos(q) * R, 100, 860), y: cl(P.y + Math.sin(q) * R, 100, 500), r: 46, t: 0.7 + i * 0.25, d: e.dmg, c: "#ffe14a" });
        }
        return 3.2;
      },
    },
    {
      n: "Arco de tormenta",
      p: 1,
      f: (e, c, k) => {
        const s = Math.random() < 0.5 ? 1.3 : -1.3;
        for (let i = 0; i < 2; i++) bz({ k: "bar", x: e.x, y: e.y, a: c.a + i * Math.PI, len: 330, w: 14, sp: s, t: 0.9, life: 2.8, d: e.dmg * 0.8, c: "#ffe14a", fol: e });
        e.busy = 3.7;
        return 1.4;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.save();
    x.rotate(a);
    dLn(-r * 0.6, r * 0.7, r * 2.1, -r * 0.1, 4, "#ddd"); // lanza larga
    dPo([[r * 2.1, -r * 0.1], [r * 1.8, -r * 0.35], [r * 1.85, r * 0.12]]);
    dEl(0, 0, r * 0.8, r * 0.9);
    dCi(r * 0.25, 0, r * 0.45);
    x.fillStyle = "#ffe14a";
    dPo([[r * 0.0, -r * 0.4], [r * 0.2, -r * 0.95], [r * 0.4, -r * 0.4]]); // cresta de rayo
    dEy(r * 0.5, -r * 0.1, 2.6, "#fff");
    dEy(r * 0.5, r * 0.15, 2.6, "#fff");
    x.restore();
    x.strokeStyle = "#ffe14a";
    x.lineWidth = 2;
    if (Math.sin(t * 17) > 0.2) {
      x.beginPath();
      x.moveTo(-r * 0.9, -r * 0.4);
      x.lineTo(-r * 1.3, -r * 0.1);
      x.lineTo(-r * 1.0, r * 0.05);
      x.lineTo(-r * 1.5, r * 0.5);
      x.stroke();
    }
  },
});

// ---------- 30 · Brann, Forjador Maldito (Cavernas de lava) ----------
mkBoss(30, {
  d: "Herrero maldito. Martillazos con onda expansiva, escoria que arde en el suelo, yunques que caen sobre ti y, desde la fase 2, un coraza viviente que forja. Tras dejar caer el yunque debe recoger el martillo y queda expuesto.",
  mv: (e, c) => {
    if (c.d > 110) c.mv(c.nx * c.sp * 0.9, c.ny * c.sp * 0.9);
  },
  at: [
    {
      n: "Martillazo",
      w: 2,
      f: (e, c, k) => {
        bz({ k: "cone", x: e.x, y: e.y, a: c.a, ha: 0.8, r: 175, t: 0.8, d: e.dmg * 1.4, c: k });
        later(e, 0.8, () => bz({ k: "ring", x: e.x, y: e.y, ri: 175, ro: 240, t: 0.35, d: e.dmg * 0.9, c: k }));
        e.busy = 1;
        return 2.3;
      },
    },
    {
      n: "Escoria fundida",
      f: (e, c, k) => {
        for (let i = 0; i < 3 + c.ph; i++) bz({ k: "pool", x: cl(P.x + rnd(-140, 140), 100, 860), y: cl(P.y + rnd(-110, 110), 100, 500), r: 56, t: 0.9 + i * 0.15, life: 5, d: e.dmg * 0.35, c: "#ff6a2a" });
        return 2.4;
      },
    },
    {
      n: "Yunque",
      w: 2,
      f: (e, c, k) => {
        const px = P.x,
          py = P.y;
        bz({ k: "pool", x: px, y: py, r: 90, t: 1.4, d: e.dmg * 1.7, c: k, fx: (h) => { shake = 10; brs({ x: px, y: py }, 8, 230, e.dmg * 0.45, 0.4, 0, "#ffb070"); } });
        later(e, 1.5, () => {
          e.vul = 1.4;
          flash("Brann recoge el martillo");
        });
        return 3;
      },
    },
    {
      n: "Coraza viviente",
      p: 1,
      f: (e, c, k) => {
        e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
        if (e.mn.length < 1) bmn(e, "tank", e.x + rnd(-70, 70), e.y + 70);
        ring(e, 120, k);
        return 2.6;
      },
    },
    {
      n: "Forja desatada",
      p: 2,
      f: (e, c, k) => {
        [90, 170, 250, 330].forEach((R, j) => bz({ k: "ring", x: e.x, y: e.y, ri: R - 28, ro: R + 28, t: 0.9 + j * 0.3, d: e.dmg, c: k }));
        e.busy = 1.8;
        return 2.8;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.save();
    x.rotate(a);
    dEl(-r * 0.1, 0, r * 0.95, r * 0.9);
    x.fillStyle = "#3a2a22";
    dPo([[-r * 0.5, -r * 0.2], [r * 0.2, -r * 0.5], [r * 0.5, r * 0.3], [-r * 0.5, r * 0.6]]); // delantal
    dCi(r * 0.55, 0, r * 0.38);
    x.fillStyle = "#222";
    dPo([[r * 0.4, -r * 0.3], [r * 0.95, -r * 0.3], [r * 0.95, -r * 0.1], [r * 0.4, -r * 0.1]]); // gafas de soldar
    dEy(r * 0.7, -r * 0.2, 3, "#ff8a2a");
    const sw = Math.sin(t * 2) * 0.3;
    dLn(r * 0.2, r * 0.7, r * 1.5, r * 0.5 + sw * r, 8, "#8a6a52"); // mango
    x.fillStyle = "#9aa";
    dPo([[r * 1.35, r * 0.2 + sw * r], [r * 1.85, r * 0.2 + sw * r], [r * 1.85, r * 0.85 + sw * r], [r * 1.35, r * 0.85 + sw * r]]); // cabeza del martillo
    x.restore();
  },
});

// ---------- 28 · Cael, Heraldo Gélido (Abismos helados) ----------
mkBoss(28, {
  d: "Heraldo de la ventisca. Su «Ventisca» congela toda la sala salvo un refugio que debes alcanzar a tiempo; también lanza una andanada de carámbanos, un clarín en cono que ralentiza y ecos gélidos. Tras la ventisca se queda sin aliento.",
  mv: (e, c) => {
    if (c.d < 230) c.mv(-c.nx * c.sp * 1.3, -c.ny * c.sp * 1.3);
    else if (c.d > 320) c.mv(c.nx * c.sp, c.ny * c.sp);
    else c.mv(-c.ny * c.sp * e.dir * 0.8, c.nx * c.sp * e.dir * 0.8);
  },
  at: [
    {
      n: "Ventisca",
      w: 2,
      f: (e, c, k) => {
        const sx = cl(P.x + rnd(-170, 170), 150, 810),
          sy = cl(P.y + rnd(-130, 130), 150, 450);
        bz({ k: "ring", x: sx, y: sy, ri: 105 - c.ph * 8, ro: 1200, t: 1.7, d: e.dmg * 1.3, c: "#bfeaff", hf: () => (P.slow = 1.2) });
        e.busy = 1.8;
        later(e, 1.9, () => {
          e.vul = 1.5;
          flash("Cael recobra el aliento");
        });
        return 3.2;
      },
    },
    {
      n: "Carámbanos",
      f: (e, c, k) => {
        for (let i = 0; i < 10 + c.ph * 3; i++) bz({ k: "pool", x: cl(P.x + rnd(-170, 170), 100, 860), y: cl(P.y + rnd(-140, 140), 100, 500), r: 30, t: 0.7 + i * 0.12, d: e.dmg, c: "#bfeaff" });
        return 2.4;
      },
    },
    {
      n: "Clarín",
      f: (e, c, k) => {
        bz({ k: "cone", x: e.x, y: e.y, a: c.a, ha: 0.55, r: 430, t: 0.9, d: e.dmg * 1.1, c: k, hf: () => (P.slow = 1.5) });
        e.busy = 1;
        return 2.3;
      },
    },
    {
      n: "Eco gélido",
      p: 1,
      f: (e, c, k) => {
        for (let j = 0; j < 4; j++) bz({ k: "ring", x: e.x, y: e.y, ri: j * 75 + 20, ro: j * 75 + 70, t: 0.8 + j * 0.28, d: e.dmg, c: k });
        e.busy = 1.4;
        return 2.5;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.save();
    x.rotate(a);
    dPo([[-r * 0.8, -r * 0.8], [r * 0.3, -r * 0.9], [r * 0.7, 0], [r * 0.3, r * 0.9], [-r * 0.8, r * 0.8]]); // armadura de hielo
    x.fillStyle = "#e8f8ff";
    for (const s of [-1, 1]) dPo([[r * 0.0, s * r * 0.8], [r * 0.3, s * r * 1.35], [r * 0.45, s * r * 0.8]]); // hombreras de cristal
    dCi(r * 0.3, 0, r * 0.4);
    dPo([[r * 0.0, -r * 0.35], [r * 0.15, -r * 0.95], [r * 0.3, -r * 0.4], [r * 0.45, -r * 1.1], [r * 0.55, -r * 0.35]]); // corona
    dEy(r * 0.5, -r * 0.1, 2.8, "#37a");
    dEy(r * 0.5, r * 0.12, 2.8, "#37a");
    dLn(r * 0.4, r * 0.9, r * 1.3, r * 1.2, 7, "#cfeeff"); // cuerno
    x.restore();
  },
});

// ---------- 32 · Ymir Menor (Abismos helados) ----------
mkBoss(32, {
  d: "Coloso de hielo. Levanta pilares de hielo que sirven de cobertura (y que luego revientan en esquirlas), lanza avalanchas en oleada con un hueco y se deja caer sobre ti con una onda. Tras aplastar el suelo se tambalea.",
  mv: (e, c) => {
    if (c.d > 120) c.mv(c.nx * c.sp * 0.8, c.ny * c.sp * 0.8);
  },
  at: [
    {
      n: "Pilares de hielo",
      w: 2,
      f: (e, c, k) => {
        const n = 3 + c.ph;
        for (let i = 0; i < n; i++) {
          const px = rnd(150, 810),
            py = rnd(140, 460);
          if (Math.hypot(px - P.x, py - P.y) < 100 || Math.hypot(px - 480, py - 300) < 80) continue;
          const o = { x: px - 22, y: py - 22, w: 44, h: 44, ice: 1, exp: 5 };
          RM_.obs.push(o);
          later(e, 5, () => {
            RM_.obs = RM_.obs.filter((b) => b != o);
            bz({ k: "pool", x: px, y: py, r: 60, t: 0.25, d: e.dmg, c: "#bfeaff" });
            brs({ x: px, y: py }, 6, 220, e.dmg * 0.4, 0.3, 0, "#bfeaff");
          });
        }
        return 2.4;
      },
    },
    {
      n: "Avalancha",
      f: (e, c, k) => {
        const fromL = Math.random() < 0.5,
          gap = (Math.random() * 7) | 0;
        for (let i = 0; i < 9; i++) {
          if (Math.abs(i - gap) < 1) continue;
          const y = 105 + i * 50;
          PR.push({ x: fromL ? RB.x0 + 10 : RB.x1 - 10, y, vx: (fromL ? 1 : -1) * 240, vy: 0, r: 14, d: e.dmg * 0.55, l: 5, f: "e", c: "#dff4ff", cv: 0, hm: 0 });
        }
        return 2.6;
      },
    },
    {
      n: "Aplastamiento",
      w: 2,
      f: (e, c, k) => {
        const px = P.x,
          py = P.y;
        bz({ k: "pool", x: px, y: py, r: 105, t: 1.1, d: e.dmg * 1.4, c: k });
        ghost(e, 1.1);
        e.busy = 1.1;
        later(e, 1.1, () => {
          e.x = cl(px, 90, 870);
          e.y = cl(py, 90, 510);
          shake = 12;
          bz({ k: "ring", x: e.x, y: e.y, ri: 105, ro: 210, t: 0.35, d: e.dmg, c: k });
          e.vul = 1.5;
          flash("Ymir se tambalea");
        });
        return 3;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    dPo([[-r * 0.9, r * 0.9], [-r * 1.0, -r * 0.2], [-r * 0.5, -r * 0.95], [r * 0.5, -r * 0.95], [r * 1.0, -r * 0.2], [r * 0.9, r * 0.9]]); // tronco de bloques
    x.fillStyle = "#e8f8ff";
    for (const s of [-1, 1]) dPo([[s * r * 0.9, -r * 0.7], [s * r * 1.35, -r * 1.2], [s * r * 1.2, -r * 0.4]]); // cristales en los hombros
    x.fillStyle = "#a8d8f0";
    dEl(0, -r * 0.2, r * 0.42, r * 0.36); // cabeza
    dEy(-r * 0.15, -r * 0.25, 3.6, "#08f");
    dEy(r * 0.15, -r * 0.25, 3.6, "#08f");
    x.strokeStyle = "#fff8";
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(-r * 0.5, r * 0.2);
    x.lineTo(-r * 0.1, r * 0.5);
    x.lineTo(r * 0.4, r * 0.3);
    x.stroke();
  },
});

// ---------- 22 · Morwen, Cazadora Pálida (Abismos helados) ----------
mkBoss(22, {
  d: "Cazadora fantasmal que se mantiene a distancia. Marca a su presa y, dos segundos después, aparece a su espalda para rematarla. También dispara salvas de flechas y planta trampas de escarcha. Tras ejecutar la marca queda expuesta.",
  pas: (e, c, dt) => {
    if (e.mk > 0) {
      e.mk -= dt;
      if (e.mk <= 0) {
        // golpe por la espalda: aparece detrás del jugador (según su dirección de apuntado)
        const bx = cl(P.x - Math.cos(P.face) * 130, 100, 860),
          by = cl(P.y - Math.sin(P.face) * 130, 100, 500);
        e.x = bx;
        e.y = by;
        ring(e, 80, "#dfe8f5");
        const a = Math.atan2(P.y - e.y, P.x - e.x);
        bz({ k: "cone", x: e.x, y: e.y, a, ha: 0.9, r: 170, t: 0.45, d: e.dmg * 1.5, c: "#dfe8f5" });
        e.vul = 1.6;
        flash("Morwen queda expuesta");
      }
    }
  },
  mv: (e, c) => {
    if (c.d < 300) c.mv(-c.nx * c.sp * 1.7, -c.ny * c.sp * 1.7);
    else if (c.d > 400) c.mv(c.nx * c.sp, c.ny * c.sp);
    else c.mv(-c.ny * c.sp * e.dir, c.nx * c.sp * e.dir);
  },
  at: [
    {
      n: "Marca de la cazadora",
      w: 2,
      f: (e, c, k) => {
        e.mk = 2;
        e.busy = 2.1;
        ghost(e, 2);
        bz({ k: "pool", x: P.x, y: P.y, r: 40, t: 2, d: 0, c: "#dfe8f5", fol: P, lb: "☠" });
        return 3;
      },
    },
    {
      n: "Salva de flechas",
      f: (e, c, k) => {
        for (let j = 0; j < 3; j++) later(e, j * 0.4, () => { const a = Math.atan2(P.y - e.y, P.x - e.x); for (let i = -2; i <= 2; i++) bt(e, a + i * 0.1, 420, e.dmg * 0.45, 0, "#dfe8f5"); });
        return 2.6;
      },
    },
    {
      n: "Trampas de escarcha",
      f: (e, c, k) => {
        for (let i = 0; i < 4 + c.ph; i++) bz({ k: "pool", x: cl(P.x + rnd(-150, 150), 100, 860), y: cl(P.y + rnd(-120, 120), 100, 500), r: 38, t: 1.6, d: e.dmg, c: "#bfeaff", fx: (h) => brs({ x: h.x, y: h.y }, 4, 200, e.dmg * 0.4, 0.7, 0, "#bfeaff") });
        return 2.4;
      },
    },
    {
      n: "Caza veloz",
      p: 1,
      f: (e, c, k) => {
        for (let j = 0; j < 2; j++)
          later(e, j * 0.8, () => {
            bz({ k: "beam", x: e.x, y: e.y, a: Math.atan2(P.y - e.y, P.x - e.x), len: 500, w: 14, t: 0.4, d: e.dmg, c: k });
            later(e, 0.4, () => dsh(e, 0.22, 640));
          });
        e.busy = 1.8;
        return 2.6;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.save();
    x.rotate(a);
    dPo([[-r * 0.9, -r * 0.7], [r * 0.3, -r * 0.5], [r * 0.3, r * 0.5], [-r * 0.9, r * 0.7], [-r * 0.5, 0]]); // capa
    dCi(r * 0.15, 0, r * 0.42);
    x.fillStyle = "#223";
    dEl(r * 0.28, 0, r * 0.26, r * 0.22);
    dEy(r * 0.4, -r * 0.08, 2.4, "#8cf");
    dEy(r * 0.4, r * 0.1, 2.4, "#8cf");
    x.strokeStyle = "#9ab";
    x.lineWidth = 3;
    x.beginPath();
    x.arc(r * 0.9, 0, r * 0.8, -1.1, 1.1); // arco
    x.stroke();
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(r * 0.9 + Math.cos(-1.1) * r * 0.8, Math.sin(-1.1) * r * 0.8);
    x.lineTo(r * 0.9 + Math.cos(1.1) * r * 0.8, Math.sin(1.1) * r * 0.8);
    x.stroke();
    x.restore();
  },
});

// ---------- 23 · Dagon, Marea Negra (Dimensión corrupta) ----------
mkBoss(23, {
  d: "Masa de tentáculos y mareas. Lanza olas muro que cruzan la sala con un único hueco, hace brotar tentáculos que persiguen tus pasos y abre un remolino que te arrastra hacia él antes de estallar. Tras el remolino se retira con la marea.",
  pas: (e, c, dt) => {
    if (e.pl > 0) {
      e.pl -= dt;
      const d = Math.hypot(e.x - P.x, e.y - P.y) || 1;
      pushP(((e.x - P.x) / d) * 130 * dt, ((e.y - P.y) / d) * 130 * dt);
    }
  },
  mv: (e, c) => {
    if (c.d > 120) c.mv(c.nx * c.sp * 0.9, c.ny * c.sp * 0.9);
  },
  at: [
    {
      n: "Ola muro",
      w: 2,
      f: (e, c, k) => {
        const fromL = Math.random() < 0.5,
          gy = rnd(170, 430),
          sx = fromL ? 40 : 920,
          v = fromL ? 150 : -150;
        bz({ k: "beam", x: sx, y: 50, a: Math.PI / 2, len: Math.max(20, gy - 70 - 50), w: 22, vx: v, t: 1, life: 6.4, d: e.dmg, c: "#1e4a8a" });
        bz({ k: "beam", x: sx, y: gy + 70, a: Math.PI / 2, len: 550 - (gy + 70), w: 22, vx: v, t: 1, life: 6.4, d: e.dmg, c: "#1e4a8a" });
        if (c.ph > 1) bz({ k: "beam", x: fromL ? 920 : 40, y: 50, a: Math.PI / 2, len: 500, w: 18, vx: -v * 0.7, t: 2.6, life: 6, d: e.dmg, c: "#1e4a8a" });
        return 3.4;
      },
    },
    {
      n: "Tentáculos",
      w: 2,
      f: (e, c, k) => {
        for (let j = 0; j < 4 + c.ph; j++) later(e, j * 0.55, () => bz({ k: "pool", x: P.x, y: P.y, r: 46, t: 0.75, d: e.dmg, c: "#2a2a6a" }));
        return 3.2;
      },
    },
    {
      n: "Remolino",
      p: 1,
      f: (e, c, k) => {
        e.pl = 1.6;
        e.busy = 1.6;
        bz({ k: "ring", x: e.x, y: e.y, ri: 0, ro: 150, t: 1.6, d: e.dmg * 1.3, c: k });
        later(e, 1.6, () => {
          brs(e, 14, 230, e.dmg * 0.45, 0, 0, "#3a6ab0");
          e.vul = 1.8;
          flash("Dagon se retira con la marea");
        });
        return 3.2;
      },
    },
    {
      n: "Zarpazo abisal",
      f: (e, c, k) => {
        bz({ k: "cone", x: e.x, y: e.y, a: c.a, ha: 1.1, r: 190, t: 0.75, d: e.dmg * 1.3, c: k });
        e.busy = 0.85;
        return 2.2;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    for (let i = 0; i < 8; i++) {
      const q = (i / 8) * 6.283 + Math.sin(t * 1.2 + i) * 0.25;
      x.strokeStyle = "#000";
      x.lineWidth = 10;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(Math.cos(q) * r * 0.5, Math.sin(q) * r * 0.5);
      x.quadraticCurveTo(Math.cos(q + 0.6 * Math.sin(t + i)) * r * 1.1, Math.sin(q + 0.6 * Math.sin(t + i)) * r * 1.1, Math.cos(q + 0.3) * r * 1.5, Math.sin(q + 0.3) * r * 1.5);
      x.stroke();
      x.strokeStyle = F;
      x.lineWidth = 7;
      x.stroke();
    }
    x.strokeStyle = "#000";
    x.lineWidth = 3;
    x.fillStyle = "#0a1a3a";
    dCi(0, 0, r * 0.75);
    for (let i = 0; i < 5; i++) dEy(Math.cos(i * 1.257 + t * 0.3) * r * 0.35, Math.sin(i * 1.257 + t * 0.3) * r * 0.35, 3 + (i % 2), "#7cf");
    dEy(0, 0, 5, "#fff");
  },
});

// ---------- 29 · Nuru, Ojo del Desierto (Dimensión corrupta) ----------
mkBoss(29, {
  d: "Ojo enorme que lo ve todo. Su mirada es un rayo que te persigue, crea espejismos de ojos que también miran, levanta tormentas de arena que ralentizan y fija la pupila en ti. Al terminar la mirada cierra el párpado y queda expuesto.",
  pas: (e, c, dt) => {
    if (e.dc && e.dc.length) {
      e.dc = e.dc.filter((q) => q.hp > 0 && !q.dead);
      e.dc.forEach((q) => {
        q.ex = (q.ex ?? 7) - dt;
        if (q.ex <= 0) {
          q.hp = 0;
          q.dead = 1;
        }
      });
    }
  },
  mv: (e, c) => {
    if (c.d < 230) c.mv(-c.nx * c.sp * 1.1, -c.ny * c.sp * 1.1);
    else if (c.d > 330) c.mv(c.nx * c.sp, c.ny * c.sp);
    else c.mv(-c.ny * c.sp * e.dir * 0.6, c.nx * c.sp * e.dir * 0.6);
  },
  at: [
    {
      n: "Mirada",
      w: 2,
      f: (e, c, k) => {
        bz({ k: "bar", x: e.x, y: e.y, a: c.a, len: 640, w: 17, trk: 0.75 + c.ph * 0.15, t: 0.9, life: 3, d: e.dmg * 0.9, c: "#ffe9a0", fol: e });
        e.busy = 3.9;
        later(e, 3.9, () => {
          e.vul = 1.8;
          flash("Nuru cierra el párpado");
        });
        return 1.3;
      },
    },
    {
      n: "Espejismos",
      f: (e, c, k) => {
        e.dc = (e.dc || []).filter((q) => q.hp > 0 && !q.dead);
        if (e.dc.length >= 2) return 1.2;
        for (let i = 0; i < 2; i++) {
          const q = spawn("decoy", rnd(140, 820), rnd(140, 460));
          q.sp = 0;
          q.al = 1;
          q.bi = e.bi;
          q.r = e.r;
          q.hp = q.mhp = 1;
          e.dc.push(q);
          bz({ k: "bar", x: q.x, y: q.y, a: Math.atan2(P.y - q.y, P.x - q.x), len: 520, w: 14, trk: 0.5, t: 1.3, life: 2.4, d: e.dmg * 0.7, c: "#ffe9a0", fol: q });
        }
        return 2.8;
      },
    },
    {
      n: "Tormenta de arena",
      f: (e, c, k) => {
        for (let i = 0; i < 2; i++) bz({ k: "web", x: cl(P.x + rnd(-120, 120), 150, 810), y: cl(P.y + rnd(-100, 100), 150, 450), r: 130, t: 0.6, life: 6, c: "#d9b860" });
        for (let i = -2; i <= 2; i++) bt(e, c.a + i * 0.5, 170, e.dmg * 0.45, 0, "#e8c15a", 0.9);
        return 2.6;
      },
    },
    {
      n: "Pupila fija",
      p: 1,
      f: (e, c, k) => {
        for (let j = 0; j < 4; j++) later(e, j * 0.6, () => bz({ k: "pool", x: P.x, y: P.y, r: 58 - j * 6, t: 0.75, d: e.dmg, c: "#fff0b0" }));
        return 3.2;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    const bl = e.vul > 0 ? 0.15 : 0.55 + 0.45 * Math.abs(Math.sin(t * 0.5 + 1));
    x.fillStyle = "#e8e0c0";
    x.beginPath();
    x.moveTo(-r * 1.4, 0);
    x.quadraticCurveTo(0, -r * 1.4 * bl, r * 1.4, 0);
    x.quadraticCurveTo(0, r * 1.4 * bl, -r * 1.4, 0);
    x.fill();
    x.stroke();
    x.fillStyle = F;
    dCi(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3 * bl, r * 0.55 * Math.min(1, bl + 0.2));
    dEy(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4 * bl, r * 0.22, "#000");
    x.strokeStyle = "#c8a040";
    x.lineWidth = 3;
    for (const s of [-1, 1]) {
      x.beginPath();
      x.moveTo(s * r * 1.4, 0);
      x.lineTo(s * r * 1.9, -r * 0.5);
      x.moveTo(s * r * 1.4, 0);
      x.lineTo(s * r * 1.9, r * 0.5);
      x.stroke();
    }
  },
});

// ---------- 33 · Sable, Sombra Errante (Dimensión corrupta) ----------
mkBoss(33, {
  d: "Sombra que desaparece y vuelve a tu espalda. Marca dónde va a aparecer y ataca en cono; encadena apariciones con andanadas de dagas, deja sombras que estallan y, desde la fase 2, apaga la luz (eclipse) mientras te golpea. Tras cada aparición queda expuesta un instante.",
  mv: (e, c) => {
    if (c.d > 260) c.mv(c.nx * c.sp * 1.2, c.ny * c.sp * 1.2);
    else c.mv(-c.ny * c.sp * e.dir * 0.9, c.nx * c.sp * e.dir * 0.9);
  },
  at: [
    {
      n: "Paso en sombras",
      w: 2,
      f: (e, c, k) => {
        const bx = cl(P.x - Math.cos(P.face) * 120, 100, 860),
          by = cl(P.y - Math.sin(P.face) * 120, 100, 500);
        bz({ k: "pool", x: bx, y: by, r: 46, t: 0.7, d: 0, c: "#7a6aaa" });
        ghost(e, 0.7);
        e.busy = 0.7;
        later(e, 0.7, () => {
          e.x = bx;
          e.y = by;
          ring(e, 70, k);
          const a = Math.atan2(P.y - e.y, P.x - e.x);
          bz({ k: "cone", x: e.x, y: e.y, a, ha: 0.9, r: 150, t: 0.35, d: e.dmg * 1.3, c: "#9a8ad0" });
          later(e, 0.4, () => {
            e.vul = 0.9;
          });
        });
        return 2.4;
      },
    },
    {
      n: "Cuchillas en cadena",
      f: (e, c, k) => {
        for (let j = 0; j < 3; j++)
          later(e, j * 0.7, () => {
            tp(e, 240);
            ring(e, 50, k);
            const a = Math.atan2(P.y - e.y, P.x - e.x);
            for (let i = -2; i <= 2; i++) bt(e, a + i * 0.14, 400, e.dmg * 0.45, 0, "#cfc8ff");
          });
        e.busy = 2.1;
        return 2.6;
      },
    },
    {
      n: "Sombras explosivas",
      f: (e, c, k) => {
        for (let i = 0; i < 4; i++) bz({ k: "pool", x: cl(P.x + rnd(-150, 150), 100, 860), y: cl(P.y + rnd(-120, 120), 100, 500), r: 70, t: 1.6 + i * 0.1, d: e.dmg * 1.1, c: "#3a2a6a", fx: (h) => brs({ x: h.x, y: h.y }, 6, 170, e.dmg * 0.35, 0, 0, "#7a6aaa") });
        return 2.5;
      },
    },
    {
      n: "Eclipse",
      p: 1,
      f: (e, c, k) => {
        G.dk = 150;
        later(e, 4.5, () => (G.dk = 0));
        for (let j = 0; j < 5; j++) later(e, 0.6 + j * 0.8, () => bz({ k: "pool", x: P.x, y: P.y, r: 60, t: 0.85, d: e.dmg, c: "#6a5aaa" }));
        return 5;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.fillStyle = F;
    for (let i = 0; i < 6; i++) {
      x.globalAlpha *= 0.82;
      dPo([[-r * 0.5 + i * 3, r * 0.2], [0, -r * 1.1 - i * 2], [r * 0.5 - i * 3, r * 0.2], [r * 0.3, r * 1.1 + Math.sin(t * 4 + i) * 5], [-r * 0.3, r * 1.1 + Math.cos(t * 4 + i) * 5]], 0);
    }
    x.globalAlpha = 1;
    dEy(-r * 0.2, -r * 0.35, 4, "#fff");
    dEy(r * 0.2, -r * 0.35, 4, "#fff");
    x.save();
    x.rotate(a);
    for (const s of [-1, 1]) dLn(r * 0.4, s * r * 0.6, r * 1.5, s * r * 0.9, 4, "#cfc8ff");
    x.restore();
  },
});
