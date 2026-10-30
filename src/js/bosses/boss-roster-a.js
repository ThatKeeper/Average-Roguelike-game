/* ======================================================================
 * src/js/bosses/boss-roster-a.js
 * Jefes hechos a mano · Catacumbas (Karg, Eriks, Seraphine), Criptas malditas (Tamsin, Zhul, Voss) y
 * Minas abandonadas (Bruk, Orlo).
 * ====================================================================== */

// ---------- 12 · Karg, Rompehuesos (Catacumbas) ----------
mkBoss(12, {
  d: "Bruto lento con un fémur gigante. Garrotazos en cono (a fase 2, con vuelta de rebote), pisotones que revientan en coronas de esquirlas y una lluvia de huesos que rebotan. Su embestida, si choca contra el muro, lo deja atontado.",
  pas: (e) => {
    if (e.chg && !(e.lu > 0)) {
      e.chg = 0;
      const w = e.x < RB.x0 + e.r + 12 || e.x > RB.x1 - e.r - 12 || e.y < RB.y0 + e.r + 12 || e.y > RB.y1 - e.r - 12;
      if (w) {
        shake = 14;
        e.vul = 2.4;
        flash("¡Karg se estrella contra el muro! Ataca ahora");
      } else e.vul = 0.5;
    }
  },
  mv: (e, c) => {
    if (c.d > 95) c.mv(c.nx * c.sp * 1.1, c.ny * c.sp * 1.1);
  },
  at: [
    {
      n: "Garrotazo",
      f: (e, c, k) => {
        const a = c.a;
        bz({ k: "cone", x: e.x, y: e.y, a, ha: 0.85, r: 175, t: 0.75, d: e.dmg * 1.3, c: k });
        if (c.ph > 0) later(e, 0.8, () => bz({ k: "cone", x: e.x, y: e.y, a: a + Math.PI, ha: 0.85, r: 175, t: 0.4, d: e.dmg, c: k }));
        e.busy = 0.9 + (c.ph > 0 ? 0.45 : 0);
        return 2.1;
      },
    },
    {
      n: "Pisotón de esquirlas",
      f: (e, c, k) => {
        bz({ k: "ring", x: e.x, y: e.y, ri: 0, ro: 115, t: 0.75, d: e.dmg * 1.2, c: k });
        bz({ k: "ring", x: e.x, y: e.y, ri: 150, ro: 235, t: 1.25, d: e.dmg, c: k });
        later(e, 0.8, () => brs(e, 8 + c.ph * 3, 210, e.dmg * 0.5, 0.2, 0, "#efe6cf"));
        e.busy = 1.1;
        return 2.3;
      },
    },
    {
      n: "Lluvia de huesos",
      f: (e, c, k) => {
        for (let i = 0; i < 4 + c.ph; i++) {
          const px = cl(P.x + rnd(-130, 130), 100, 860),
            py = cl(P.y + rnd(-110, 110), 100, 500);
          bz({ k: "pool", x: px, y: py, r: 44, t: 1 + i * 0.18, d: e.dmg, c: "#efe6cf", fx: (h) => { for (let j = 0; j < 4; j++) bt({ x: h.x, y: h.y }, j * 1.57 + 0.78, 170, e.dmg * 0.45, 0, "#efe6cf"); } });
        }
        return 2.6;
      },
    },
    {
      n: "Embestida de hueso",
      p: 1,
      f: (e, c, k) => {
        bz({ k: "beam", x: e.x, y: e.y, a: c.a, len: 620, w: e.r * 0.8, t: 0.7, d: e.dmg, c: k });
        e.busy = 0.75;
        later(e, 0.7, () => {
          dsh(e, 0.5, 560);
          e.chg = 1;
        });
        return 3;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.save();
    x.rotate(a);
    const sw = Math.sin(t * 2.2) * 0.35;
    dLn(r * 0.2, r * 0.75, r * 1.7, r * 0.65 + sw * r, 11, "#efe6cf"); // fémur
    dCi(r * 1.8, r * 0.62 + sw * r, 9, 0);
    dCi(r * 1.7, r * 0.8 + sw * r, 8, 0);
    dEl(-r * 0.1, 0, r, r * 0.88); // torso encorvado
    x.strokeStyle = "#0006";
    x.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      x.beginPath();
      x.arc(-r * 0.3, i * r * 0.22, r * 0.45, -0.9, 0.9);
      x.stroke();
    }
    x.fillStyle = "#efe6cf";
    x.strokeStyle = "#000";
    x.lineWidth = 3;
    dCi(r * 0.62, 0, r * 0.4); // cráneo
    dEy(r * 0.78, -r * 0.14, 3.4, "#000");
    dEy(r * 0.78, r * 0.14, 3.4, "#000");
    x.fillStyle = "#000";
    x.fillRect(r * 0.9, -r * 0.08, r * 0.14, r * 0.16);
    x.restore();
  },
});

// ---------- 24 · Eriks, Caballero Hueco (Catacumbas) ----------
mkBoss(24, {
  d: "Armadura vacía con escudo torre. Estocadas relámpago, barridos dobles y una guardia hueca en la que es inmune: si le pegas durante la guardia contraataca con una onda; si te contienes, baja el escudo y queda expuesto.",
  mv: (e, c) => {
    if (c.d > 170) c.mv(c.nx * c.sp * 1.2, c.ny * c.sp * 1.2);
    else if (c.d < 110) c.mv(-c.nx * c.sp, -c.ny * c.sp);
    else c.mv(-c.ny * c.sp * e.dir * 0.8, c.nx * c.sp * e.dir * 0.8);
  },
  at: [
    {
      n: "Estocada",
      f: (e, c, k) => {
        bz({ k: "beam", x: e.x, y: e.y, a: c.a, len: 430, w: 17, t: 0.55, d: e.dmg * 1.2, c: k });
        e.busy = 0.6;
        later(e, 0.55, () => dsh(e, 0.25, 640));
        return 2.1;
      },
    },
    {
      n: "Barrido de espada",
      f: (e, c, k) => {
        bz({ k: "cone", x: e.x, y: e.y, a: c.a, ha: 1.05, r: 150, t: 0.6, d: e.dmg, c: k });
        later(e, 0.55, () => bz({ k: "cone", x: e.x, y: e.y, a: c.a + Math.PI, ha: 1.05, r: 150, t: 0.45, d: e.dmg, c: k }));
        e.busy = 1.1;
        return 2.2;
      },
    },
    {
      n: "Guardia hueca",
      w: 2,
      f: (e, c, k) => {
        e.imm = 1.8;
        e.busy = 1.8;
        e.hp0 = e.hp;
        ring(e, 70, "#cde");
        later(e, 1.8, () => {
          if (e.hp < e.hp0) {
            bz({ k: "ring", x: e.x, y: e.y, ri: 0, ro: 210, t: 0.45, d: e.dmg * 1.1, c: k });
            brs(e, 10, 230, e.dmg * 0.5, 0, 0, "#cde");
            flash("¡Contraataque!");
          } else {
            e.vul = 1.6;
            flash("Eriks baja la guardia: ¡ataca!");
          }
        });
        return 2.2;
      },
    },
    {
      n: "Juramento",
      p: 1,
      f: (e, c, k) => {
        e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
        if (e.mn.length < 3) for (let i = 0; i < 2; i++) bmn(e, "grunt", e.x + rnd(-80, 80), e.y + rnd(40, 100));
        ring(e, 110, k);
        return 2.4;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.save();
    x.rotate(a);
    dPo([[-r * 0.8, -r * 0.7], [r * 0.4, -r * 0.9], [r * 0.7, 0], [r * 0.4, r * 0.9], [-r * 0.8, r * 0.7]]); // peto
    dEl(r * 0.5, 0, r * 0.45, r * 0.4, 0, 0); // yelmo
    x.fillStyle = "#000";
    x.fillRect(r * 0.55, -r * 0.1, r * 0.55, r * 0.2); // visor vacío
    dEy(r * 0.9, 0, 2.5, "#7df");
    x.fillStyle = e.imm > 0 ? "#cde" : "#556"; // escudo torre
    dPo([[r * 0.7, -r * 1.0], [r * 1.25, -r * 0.6], [r * 1.25, r * 0.6], [r * 0.7, r * 1.0]]);
    dLn(-r * 0.2, r * 0.9, -r * 1.3, r * 1.5, 6, "#bcd"); // espada
    x.restore();
  },
});

// ---------- 15 · Seraphine Ceniza (Catacumbas) ----------
mkBoss(15, {
  d: "Espectro de ceniza flotante. Deja charcos de brasa que duran varios segundos, barre la sala con una cinta de ceniza giratoria y dispara plumas rastreadoras. Al caer por debajo de un tercio de vida se consume y renace, quedando expuesta.",
  mv: (e, c) => {
    c.mv(-c.ny * c.sp * e.dir * 0.9, c.nx * c.sp * e.dir * 0.9);
    if (c.d < 200) c.mv(-c.nx * c.sp, -c.ny * c.sp);
    else if (c.d > 340) c.mv(c.nx * c.sp, c.ny * c.sp);
  },
  ph: (e, c, k) => {
    if (c.ph == 2) {
      btxt(e, "Renacer", k);
      bz({ k: "ring", x: e.x, y: e.y, ri: 0, ro: 330, t: 1.4, d: e.dmg * 1.2, c: k });
      e.busy = 1.5;
      later(e, 1.45, () => {
        e.vul = 3;
        flash("Seraphine renace de sus cenizas: ¡vulnerable!");
      });
    }
  },
  at: [
    {
      n: "Cenizas lentas",
      f: (e, c, k) => {
        for (let i = 0; i < 3 + c.ph; i++) bz({ k: "pool", x: cl(P.x + rnd(-150, 150), 100, 860), y: cl(P.y + rnd(-120, 120), 100, 500), r: 62, t: 0.9 + i * 0.2, life: 5.5, d: e.dmg * 0.35, c: "#b9a8a0" });
        return 2.2;
      },
    },
    {
      n: "Cinta de ceniza",
      f: (e, c, k) => {
        const s = (Math.random() < 0.5 ? 1 : -1) * (1.15 + c.ph * 0.25);
        bz({ k: "bar", x: e.x, y: e.y, a: c.a, len: 440, w: 20, sp: s, t: 0.9, life: 3.2, d: e.dmg * 0.8, c: k, fol: e });
        e.busy = 4.2;
        return 1.2;
      },
    },
    {
      n: "Plumas de ceniza",
      f: (e, c, k) => {
        for (let i = -2; i <= 2; i++) bt(e, c.a + i * 0.35, 215, e.dmg * 0.5, 0, "#d8c8c0", 1.0);
        return 2.4;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    for (let i = 0; i < 9; i++) {
      // jirones de ceniza
      const q = t * 1.3 + i * 0.7;
      x.globalAlpha *= 0.85;
      x.fillStyle = i % 2 ? "#8c8088" : F;
      dEl(Math.cos(q) * r * 0.5, r * 0.5 + ((i * 7 + t * 20) % (r * 1.2)), r * 0.28, r * 0.5, Math.sin(q) * 0.4);
    }
    x.globalAlpha = 1;
    x.fillStyle = F;
    dEl(0, -r * 0.1, r * 0.62, r * 0.85); // túnica
    x.fillStyle = "#1a1418";
    dEl(0, -r * 0.45, r * 0.4, r * 0.36); // capucha
    dEy(-r * 0.14, -r * 0.45, 3, "#f93");
    dEy(r * 0.14, -r * 0.45, 3, "#f93");
    x.strokeStyle = "#e9a";
    x.globalAlpha = 0.5;
    dCi(0, 0, r * 1.15, 1);
  },
});

// ---------- 17 · Tamsin, Voz Hueca (Criptas malditas) ----------
mkBoss(17, {
  d: "Banshee de canto vacío. Lanza coronas de lamento que hay que cruzar por los huecos, repite como un eco las posiciones donde estuviste y llama a coristas arqueros. Tras cada Alarido se queda sin voz.",
  pas: (e, c, dt) => {
    e.tr = e.tr || [];
    e.t4 = (e.t4 || 0) - dt;
    if (e.t4 <= 0) {
      e.t4 = 0.3;
      e.tr.push({ x: P.x, y: P.y });
      if (e.tr.length > 7) e.tr.shift();
    }
  },
  mv: (e, c) => {
    if (c.d < 250) c.mv(-c.nx * c.sp * 1.3, -c.ny * c.sp * 1.3);
    else if (c.d > 340) c.mv(c.nx * c.sp, c.ny * c.sp);
    else c.mv(-c.ny * c.sp * e.dir * 0.8, c.nx * c.sp * e.dir * 0.8);
  },
  at: [
    {
      n: "Alarido",
      f: (e, c, k) => {
        [100, 190, 280].forEach((R, j) => bz({ k: "ring", x: e.x, y: e.y, ri: R - 26, ro: R + 26, t: 0.8 + j * 0.45, d: e.dmg, c: k }));
        e.busy = 1.6;
        later(e, 1.9, () => {
          e.vul = 1.4;
          flash("Tamsin se queda sin voz");
        });
        return 2.4;
      },
    },
    {
      n: "Eco",
      w: 2,
      f: (e, c, k) => {
        (e.tr || []).slice(0, 5).forEach((q, i) => bz({ k: "pool", x: q.x, y: q.y, r: 52, t: 0.9 + i * 0.2, d: e.dmg, c: k }));
        return 2.5;
      },
    },
    {
      n: "Lamento dirigido",
      f: (e, c, k) => {
        bz({ k: "cone", x: e.x, y: e.y, a: c.a, ha: 0.42, r: 400, t: 0.85, d: e.dmg * 1.1, c: k });
        later(e, 0.85, () => brs(e, 6, 240, e.dmg * 0.4, c.a, 0, "#9fe0ff"));
        return 2.3;
      },
    },
    {
      n: "Coro de lamentos",
      p: 1,
      f: (e, c, k) => {
        e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
        if (e.mn.length < 2) bmn(e, "archer", e.x + rnd(-70, 70), e.y + 60);
        ring(e, 100, k);
        return 2.2;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.fillStyle = F;
    x.globalAlpha *= 0.9;
    dPo([[-r * 0.5, -r * 0.3], [r * 0.5, -r * 0.3], [r * 0.95, r * 1.2 + Math.sin(t * 3) * 4], [r * 0.3, r * 0.95], [0, r * 1.35], [-r * 0.3, r * 0.95], [-r * 0.95, r * 1.2 + Math.sin(t * 3 + 1) * 4]]); // vestido
    x.globalAlpha = 1;
    dCi(0, -r * 0.45, r * 0.5); // cabeza
    x.fillStyle = "#001018";
    dEl(0, -r * 0.35, r * 0.17, r * 0.27 + Math.abs(Math.sin(t * 6)) * 3); // boca abierta
    dEy(-r * 0.2, -r * 0.6, 2.5, "#fff");
    dEy(r * 0.2, -r * 0.6, 2.5, "#fff");
    x.strokeStyle = F;
    x.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      x.globalAlpha = 0.6 - i * 0.18;
      x.beginPath();
      x.arc(0, -r * 0.35, r * (0.75 + ((t * 0.8 + i * 0.33) % 1) * 0.8), -0.5, 0.5 + Math.PI, false);
      x.stroke();
    }
    x.globalAlpha = 1;
  },
});

// ---------- 21 · Zhul, Sacerdote Oxidado (Criptas malditas) ----------
mkBoss(21, {
  d: "Sacerdote con un incensario colgado de una cadena que gira sin parar a su alrededor. Reparte charcos de óxido, te encierra en un anillo de excomunión mientras llueven saetas y recita sermones de proyectiles. Tras el encierro queda arrodillado.",
  init: (e, c, k) => {
    e.cs = bz({ k: "bar", x: e.x, y: e.y, a: 0, len: 150, w: 17, sp: 1.6, t: 1.2, life: 9999, d: e.dmg * 0.6, c: "#d07a3a", fol: e });
  },
  pas: (e, c) => {
    if (e.cs) e.cs.sp = (e.cs.sp < 0 ? -1 : 1) * (1.6 + c.ph * 0.5);
  },
  mv: (e, c) => {
    if (c.d > 230) c.mv(c.nx * c.sp, c.ny * c.sp);
    else if (c.d < 150) c.mv(-c.nx * c.sp, -c.ny * c.sp);
  },
  at: [
    {
      n: "Letanía de óxido",
      f: (e, c, k) => {
        const n = 4 + c.ph;
        for (let i = 0; i < n; i++) bz({ k: "pool", x: cl(P.x + Math.cos((i / n) * 6.283) * 110, 100, 860), y: cl(P.y + Math.sin((i / n) * 6.283) * 110, 100, 500), r: 54, t: 1 + i * 0.12, life: 5, d: e.dmg * 0.35, c: "#c46a2e" });
        return 2.4;
      },
    },
    {
      n: "Excomunión",
      w: 2,
      f: (e, c, k) => {
        const cx = cl(P.x, 200, 760),
          cy = cl(P.y, 190, 410);
        bz({ k: "ring", x: cx, y: cy, ri: 150, ro: 186, t: 1, life: 4, d: e.dmg * 0.5, c: "#d07a3a" });
        for (let j = 0; j < 4; j++) later(e, 1.3 + j * 0.8, () => brs(e, 12, 170 + j * 14, e.dmg * 0.4, j * 0.4, 0, "#c46a2e"));
        e.busy = 1.2;
        later(e, 5.1, () => {
          e.vul = 1.6;
          flash("Zhul se arrodilla");
        });
        return 3.2;
      },
    },
    {
      n: "Sermón de óxido",
      f: (e, c, k) => {
        for (let j = 0; j < 3; j++)
          later(e, j * 0.5, () => {
            const a = Math.atan2(P.y - e.y, P.x - e.x);
            for (let i = -1; i <= 1; i++) bt(e, a + i * 0.2, 255, e.dmg * 0.5, 0, "#d9833a");
          });
        return 2.6;
      },
    },
    {
      n: "Inversión del incensario",
      p: 1,
      f: (e, c, k) => {
        if (e.cs) e.cs.sp *= -1;
        bz({ k: "ring", x: e.x, y: e.y, ri: 120, ro: 175, t: 0.8, d: e.dmg, c: k });
        return 2.2;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    dPo([[-r * 0.7, r * 1.0], [-r * 0.5, -r * 0.4], [r * 0.5, -r * 0.4], [r * 0.7, r * 1.0]]); // sotana
    dCi(0, -r * 0.65, r * 0.38);
    x.fillStyle = "#7a3a1a";
    dPo([[-r * 0.42, -r * 0.8], [0, -r * 1.45], [r * 0.42, -r * 0.8]]); // mitra
    dEy(-r * 0.13, -r * 0.62, 2.5, "#fc6");
    dEy(r * 0.13, -r * 0.62, 2.5, "#fc6");
    x.strokeStyle = "#7a3a1a";
    x.lineWidth = 3;
    x.beginPath();
    x.moveTo(-r * 0.2, 0);
    x.lineTo(r * 0.2, 0);
    x.stroke();
    if (e.cs) {
      // el incensario es el propio peligro giratorio: se dibuja su bola al final de la cadena
      const q = e.cs.a;
      dLn(0, 0, Math.cos(q) * e.cs.len, Math.sin(q) * e.cs.len, 3, "#8a8a8a");
      x.fillStyle = "#5a3a2a";
      dCi(Math.cos(q) * e.cs.len, Math.sin(q) * e.cs.len, 13);
      x.fillStyle = "rgba(180,170,160,0.5)";
      dCi(Math.cos(q) * e.cs.len - Math.cos(q) * 12, Math.sin(q) * e.cs.len - Math.sin(q) * 12 - 8, 7, 1);
    }
  },
});

// ---------- 26 · Voss, Hereje Carmesí (Criptas malditas) ----------
mkBoss(26, {
  d: "Hereje que paga con su propia sangre: cada ataque le cuesta vida. Lanzas de sangre rastreadoras, una estrella de rayos giratorios y un círculo ritual que estalla. Cada pocos ataques se desangra y queda expuesto.",
  mv: (e, c) => {
    if (c.d < 190) c.mv(-c.nx * c.sp * 1.3, -c.ny * c.sp * 1.3);
    else if (c.d > 280) c.mv(c.nx * c.sp * 1.1, c.ny * c.sp * 1.1);
    else c.mv(-c.ny * c.sp * e.dir, c.nx * c.sp * e.dir);
  },
  at: [
    {
      n: "Lanzas de sangre",
      f: (e, c, k) => {
        for (let i = -1; i <= 1; i++) bt(e, c.a + i * 0.5, 300, e.dmg * 0.55, 0, "#ff2a4a", 1.5);
        return vsOwn(e, 2.2);
      },
    },
    {
      n: "Estrella sangrienta",
      f: (e, c, k) => {
        const s = Math.random() < 0.5 ? 0.9 : -0.9;
        for (let i = 0; i < 4; i++) bz({ k: "bar", x: e.x, y: e.y, a: (i * Math.PI) / 2 + c.a, len: 390, w: 15, sp: s, t: 0.9, life: 2.6, d: e.dmg * 0.8, c: k, fol: e });
        e.busy = 3.6;
        return vsOwn(e, 1.4);
      },
    },
    {
      n: "Círculo ritual",
      f: (e, c, k) => {
        const cx = P.x,
          cy = P.y;
        bz({ k: "pool", x: cx, y: cy, r: 85, t: 1.1, life: 2.4, d: e.dmg * 0.35, c: "#c01030" });
        later(e, 3.5, () => {
          brs({ x: cx, y: cy }, 10, 200, e.dmg * 0.5, 0, 0, "#ff2a4a");
          ring({ x: cx, y: cy }, 90, "#ff2a4a");
        });
        return vsOwn(e, 2.4);
      },
    },
    {
      n: "Cuchilla carmesí",
      p: 1,
      f: (e, c, k) => {
        for (let j = 0; j < 2; j++)
          later(e, j * 1.0, () => {
            const a = Math.atan2(P.y - e.y, P.x - e.x);
            bz({ k: "beam", x: e.x, y: e.y, a, len: 520, w: 16, t: 0.5, d: e.dmg, c: k });
            later(e, 0.5, () => dsh(e, 0.28, 620));
          });
        e.busy = 2.1;
        return vsOwn(e, 2.4);
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.save();
    x.rotate(a);
    dPo([[-r * 0.9, -r * 0.8], [r * 0.4, -r * 0.6], [r * 0.4, r * 0.6], [-r * 0.9, r * 0.8], [-r * 0.5, 0]]); // túnica carmesí
    dCi(r * 0.25, 0, r * 0.45);
    x.fillStyle = "#220008";
    dPo([[r * 0.45, -r * 0.35], [r * 0.95, -r * 0.1], [r * 0.45, r * 0.1]], 0); // máscara de cuernos
    dPo([[r * 0.1, -r * 0.4], [r * 0.3, -r * 0.95], [r * 0.4, -r * 0.4]]);
    dPo([[r * 0.1, r * 0.4], [r * 0.3, r * 0.95], [r * 0.4, r * 0.4]]);
    dEy(r * 0.5, -r * 0.12, 3, "#ff4a6a");
    dLn(r * 0.3, r * 0.6, r * 1.3, r * 0.4, 5, "#ddd"); // daga
    x.restore();
    x.fillStyle = "#c01030";
    for (let i = 0; i < 4; i++) dEy(Math.cos(t * 1.5 + i * 1.57) * r * 1.3, Math.sin(t * 1.5 + i * 1.57) * r * 1.3, 3, "#d01c3c"); // gotas orbitando
  },
});
// cuesta de sangre: cada ataque de Voss le quita el 1,5 % de vida y cada 4 ataques queda expuesto
function vsOwn(e, cd) {
  e.hp = Math.max(1, e.hp - e.mhp * 0.015);
  e.vn2 = (e.vn2 || 0) + 1;
  if (e.vn2 >= 4) {
    e.vn2 = 0;
    later(e, 1.2, () => {
      e.vul = 1.6;
      flash("Voss se desangra: ¡vulnerable!");
    });
  }
  return cd;
}

// ---------- 14 · Bruk, Devorador de Rocas (Minas abandonadas) ----------
mkBoss(14, {
  d: "Gigante de roca con las fauces llenas de cristales. Escupe peñascos que dejan metralla, provoca derrumbes en oleadas con un único hueco seguro y succiona al jugador antes de vomitar esquirlas. Tras la digestión queda indigesto.",
  pas: (e, c, dt) => {
    if (e.pl > 0) {
      e.pl -= dt;
      const d = Math.hypot(e.x - P.x, e.y - P.y) || 1;
      pushP(((e.x - P.x) / d) * 150 * dt, ((e.y - P.y) / d) * 150 * dt);
    }
  },
  mv: (e, c) => {
    if (c.d > 110) c.mv(c.nx * c.sp * 0.9, c.ny * c.sp * 0.9);
  },
  at: [
    {
      n: "Peñascazo",
      f: (e, c, k) => {
        for (let i = 0; i < 3 + c.ph; i++) {
          const px = cl(P.x + rnd(-120, 120), 100, 860),
            py = cl(P.y + rnd(-100, 100), 100, 500);
          bz({ k: "pool", x: px, y: py, r: 68, t: 1.1 + i * 0.25, d: e.dmg * 1.1, c: "#a8864f", fx: (h) => { for (let j = 0; j < 6; j++) bt({ x: h.x, y: h.y }, j * 1.047, 190, e.dmg * 0.4, 0, "#c9b07a"); } });
        }
        return 2.8;
      },
    },
    {
      n: "Derrumbe",
      w: 2,
      f: (e, c, k) => {
        const dir = (Math.random() * 4) | 0,
          gap = (Math.random() * 4) | 0;
        for (let j = 0; j < 11; j++)
          for (let i = 0; i < 5; i++) {
            if (Math.abs(i - gap) < 1) continue;
            const u = 100 + j * 76,
              v = 105 + i * 100,
              px = dir == 0 ? u : dir == 1 ? 960 - u : v + 130,
              py = dir == 2 ? u * 0.6 + 40 : dir == 3 ? 560 - u * 0.6 : v;
            bz({ k: "pool", x: cl(px, 90, 870), y: cl(py, 90, 510), r: 46, t: 0.9 + j * 0.13, d: e.dmg, c: "#a8864f" });
          }
        return 3.8;
      },
    },
    {
      n: "Digestión",
      p: 1,
      f: (e, c, k) => {
        e.pl = 1.5;
        e.imm = 1.5;
        e.busy = 1.5;
        later(e, 1.5, () => {
          bz({ k: "ring", x: e.x, y: e.y, ri: 0, ro: 150, t: 0.3, d: e.dmg * 1.2, c: k });
          brs(e, 18, 260, e.dmg * 0.45, 0, 0, "#c9b07a");
          e.vul = 2.2;
          flash("¡Bruk está indigesto!");
        });
        return 3;
      },
    },
    {
      n: "Mordisco",
      f: (e, c, k) => {
        bz({ k: "cone", x: e.x, y: e.y, a: c.a, ha: 1, r: 160, t: 0.7, d: e.dmg * 1.4, c: k });
        e.busy = 0.8;
        later(e, 0.7, () => dsh(e, 0.2, 460));
        return 2.3;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    dPo([[-r, 0], [-r * 0.6, -r * 0.9], [r * 0.2, -r * 1.0], [r * 0.95, -r * 0.4], [r * 0.95, r * 0.5], [r * 0.2, r], [-r * 0.6, r * 0.9]]); // masa de roca
    x.save();
    x.rotate(a);
    x.fillStyle = "#1a0f08"; // fauces
    dEl(r * 0.45, 0, r * 0.5, r * 0.4 + (e.pl > 0 ? Math.sin(t * 20) * 3 : 0));
    x.fillStyle = "#b8e8ff";
    for (let i = -2; i <= 2; i++) dPo([[r * 0.2 + i * 7, -r * 0.34], [r * 0.25 + i * 7, -r * 0.1], [r * 0.3 + i * 7, -r * 0.34]]); // cristales / dientes
    dEy(r * 0.3, -r * 0.62, 3.5, "#fc4");
    dEy(r * 0.3, r * 0.62, 3.5, "#fc4");
    x.restore();
    x.fillStyle = "#6fd6ff";
    for (let i = 0; i < 4; i++) dPo([[-r * 0.8 + i * 9, -r * 0.7], [-r * 0.7 + i * 9, -r * 1.15], [-r * 0.6 + i * 9, -r * 0.7]]);
  },
});

// ---------- 16 · Orlo, Guardián del Pozo (Minas abandonadas) ----------
mkBoss(16, {
  d: "Guardián que vigila un pozo sin fondo en el centro de la sala: su gravedad te arrastra y quema al caer. Lanza una cadena con gancho que te tira hacia él, barre con su linterna y suelta un cubo gigante. En fase 3 el pozo rebosa.",
  init: (e) => {
    e.og = Math.random() * 6.28;
    bz({ k: "pool", x: 480, y: 300, r: 52, t: 1.4, life: 9999, d: 12 * dmM(), c: "#06060c" });
  },
  pas: (e, c, dt) => {
    const dx = 480 - P.x,
      dy = 300 - P.y,
      d = Math.hypot(dx, dy) || 1;
    if (d < 280) pushP((dx / d) * 34 * dt, (dy / d) * 34 * dt); // gravedad del pozo
    if (e.pl > 0) {
      e.pl -= dt;
      const q = Math.hypot(e.x - P.x, e.y - P.y) || 1;
      pushP(((e.x - P.x) / q) * 420 * dt, ((e.y - P.y) / q) * 420 * dt);
    }
  },
  mv: (e, c, dt) => {
    e.og += 0.55 * e.dir * dt; // orbita alrededor del pozo
    const tx = 480 + Math.cos(e.og) * 175,
      ty = 300 + Math.sin(e.og) * 175,
      d = Math.hypot(tx - e.x, ty - e.y) || 1;
    c.mv(((tx - e.x) / d) * Math.min(160, d * 3), ((ty - e.y) / d) * Math.min(160, d * 3));
  },
  at: [
    {
      n: "Cadena con gancho",
      f: (e, c, k) => {
        bz({ k: "beam", x: e.x, y: e.y, a: c.a, len: 540, w: 14, t: 0.75, d: e.dmg * 0.7, c: k, once: 1, hf: () => {
            e.pl = 0.45;
            later(e, 0.5, () => bz({ k: "pool", x: e.x, y: e.y, r: 95, t: 0.35, d: e.dmg * 1.3, c: k }));
          } });
        return 2.6;
      },
    },
    {
      n: "Linterna del pozo",
      f: (e, c, k) => {
        bz({ k: "bar", x: e.x, y: e.y, a: c.a, len: 400, w: 44, sp: (Math.random() < 0.5 ? 1 : -1) * 0.85, t: 0.9, life: 3, d: e.dmg * 0.8, c: "#ffe9a0", fol: e });
        e.busy = 3.9;
        return 1.2;
      },
    },
    {
      n: "Cubo gigante",
      f: (e, c, k) => {
        const px = P.x,
          py = P.y;
        bz({ k: "pool", x: px, y: py, r: 100, t: 1.3, d: e.dmg * 1.3, c: "#5d8aa8" });
        later(e, 1.3, () => brs({ x: px, y: py }, 8, 220, e.dmg * 0.45, 0.4, 0, "#9fd0e8"));
        return 2.4;
      },
    },
    {
      n: "El pozo rebosa",
      p: 2,
      f: (e, c, k) => {
        bz({ k: "ring", x: 480, y: 300, ri: 60, ro: 150, t: 1, life: 4, d: e.dmg * 0.5, c: "#1a2a3a" });
        e.busy = 1.2;
        later(e, 5, () => {
          e.vul = 2;
          flash("Orlo pierde el equilibrio");
        });
        return 3.4;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.save();
    x.rotate(a);
    dEl(-r * 0.1, 0, r * 0.95, r * 0.8); // cuerpo encorvado con capa de minero
    x.fillStyle = "#8a5a2a";
    dPo([[r * 0.1, -r * 0.55], [r * 0.9, -r * 0.5], [r * 0.9, -r * 0.2], [r * 0.1, -r * 0.2]]); // casco
    dEy(r * 0.65, -r * 0.05, 3, "#fff");
    dEy(r * 0.65, r * 0.25, 3, "#fff");
    dLn(r * 0.4, r * 0.8, r * 1.35, r * 0.9, 4, "#999");
    x.fillStyle = "#ffe9a0";
    dCi(r * 1.45, r * 0.9, 8 + Math.sin(t * 8) * 1.5); // linterna
    x.restore();
    x.strokeStyle = "#9ab";
    x.lineWidth = 3;
    x.globalAlpha *= 0.6;
    x.setLineDash([4, 5]);
    x.beginPath();
    x.moveTo(0, 0);
    x.lineTo(480 - e.x, 300 - e.y); // cuerda al pozo
    x.stroke();
    x.setLineDash([]);
  },
});
