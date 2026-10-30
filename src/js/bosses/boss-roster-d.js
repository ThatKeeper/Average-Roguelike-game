/* ======================================================================
 * src/js/bosses/boss-roster-d.js
 * Jefes FINALES hechos a mano (3 fases cada uno, c.ph 0-2).
 *   Criptas malditas: Aeon, Mordrake · Bosque subterráneo: Abyssia, Tiamat
 *   Cavernas de lava: Solaris, Omega, Ragnarok · Dimensión corrupta: Kharon, Nyarl, Eterna
 * ====================================================================== */

// Cuadrante (qx,qy ∈ {0,1}) de la sala como rectángulo peligroso
const quad = (qx, qy, t, d, c, life) => bz({ k: "beam", x: 40 + qx * 440, y: 40 + qy * 260 + 130, a: 0, len: 440, w: 130, t, d, c, life });

// ---------- 34 · Aeon, Rey Ceniciento (Criptas malditas) ----------
mkBoss(34, {
  d: "Rey caído que gobierna desde su trono de cenizas. Dicta «Decretos» que incendian cuadrantes de la sala (2, luego 3 y, en la fase final, en cascada), golpea con su cetro, convoca caballeros de ceniza y entona un Réquiem de coronas. Tras cada decreto se sienta a descansar.",
  mv: (e, c) => {
    if (c.d > 150) c.mv(c.nx * c.sp * 0.9, c.ny * c.sp * 0.9);
  },
  ph: (e, c, k) => {
    flash(c.ph == 1 ? "¡Aeon se alza de su trono!" : "¡La corona de Aeon arde!");
  },
  at: [
    {
      n: "Decreto de ceniza",
      w: 2,
      f: (e, c, k) => {
        const qs = [[0, 0], [1, 0], [0, 1], [1, 1]].sort(() => Math.random() - 0.5),
          n = c.ph == 0 ? 2 : 3;
        for (let i = 0; i < n; i++) quad(qs[i][0], qs[i][1], c.ph == 2 ? 1.2 + i * 0.9 : 1.5, e.dmg * 1.3, k, 0.25);
        e.busy = 1.4;
        later(e, 1.6 + (c.ph == 2 ? 2.4 : 0), () => {
          e.vul = 1.6;
          flash("Aeon se sienta a descansar");
        });
        return 3.4;
      },
    },
    {
      n: "Cetro de ceniza",
      f: (e, c, k) => {
        bz({ k: "cone", x: e.x, y: e.y, a: c.a, ha: 0.7, r: 200, t: 0.8, d: e.dmg * 1.4, c: k });
        later(e, 0.8, () => bz({ k: "ring", x: e.x, y: e.y, ri: 200, ro: 270, t: 0.35, d: e.dmg, c: k }));
        e.busy = 1;
        return 2.2;
      },
    },
    {
      n: "Caballeros de ceniza",
      p: 1,
      f: (e, c, k) => {
        e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
        for (let i = 0; e.mn.length < 2 && i < 2; i++) bmn(e, "tank", e.x + rnd(-90, 90), e.y + 80);
        ring(e, 120, k);
        return 2.4;
      },
    },
    {
      n: "Corona de cenizas",
      f: (e, c, k) => {
        for (let j = 0; j < 3; j++) later(e, j * 0.4, () => brs(e, 12 + c.ph * 2, 180 + j * 25, e.dmg * 0.45, j * 0.26, j % 2 ? 0.5 : -0.5, "#d8c8b0"));
        return 2.6;
      },
    },
    {
      n: "Réquiem",
      p: 2,
      f: (e, c, k) => {
        for (let i = 0; i < 6; i++) bz({ k: "pool", x: cl(P.x + Math.cos(i * 1.05) * 150, 100, 860), y: cl(P.y + Math.sin(i * 1.05) * 150, 100, 500), r: 50, t: 0.9 + i * 0.22, life: 4, d: e.dmg * 0.35, c: "#d8c8b0" });
        for (let j = 0; j < 16; j++) later(e, j * 0.1, () => bt(e, j * 0.39, 190, e.dmg * 0.4, 0.3, "#d8c8b0"));
        return 3;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    dPo([[-r * 0.9, r], [-r * 0.7, -r * 0.3], [r * 0.7, -r * 0.3], [r * 0.9, r]]); // manto
    x.fillStyle = "#6a5a4a";
    dPo([[-r * 1.0, -r * 0.2], [-r * 0.6, -r * 0.5], [-r * 0.5, r * 0.1]]);
    dPo([[r * 1.0, -r * 0.2], [r * 0.6, -r * 0.5], [r * 0.5, r * 0.1]]); // capa de ceniza
    x.fillStyle = "#e8e0d0";
    dCi(0, -r * 0.6, r * 0.38); // cráneo
    dEy(-r * 0.14, -r * 0.62, 3, "#f93");
    dEy(r * 0.14, -r * 0.62, 3, "#f93");
    x.fillStyle = "#ffd34a"; // corona
    dPo([[-r * 0.4, -r * 0.85], [-r * 0.35, -r * 1.35], [-r * 0.15, -r * 1.0], [0, -r * 1.45], [r * 0.15, -r * 1.0], [r * 0.35, -r * 1.35], [r * 0.4, -r * 0.85]]);
    dLn(r * 0.9, r * 0.9, r * 1.1, -r * 1.2, 5, "#caa"); // cetro
    dCi(r * 1.1, -r * 1.25, 7);
    x.fillStyle = "#b8a898aa";
    for (let i = 0; i < 6 + c.ph * 3; i++) dEy(Math.sin(t + i * 2.1) * r * 1.3, ((t * 30 + i * 37) % (r * 3)) - r * 1.5, 2, "#b8a898");
  },
});

// ---------- 40 · Mordrake, Emperador Hueso (Criptas malditas) ----------
mkBoss(40, {
  d: "Emperador de huesos articulados. Su columna vertebral barre la sala como un látigo, sus costillas se cierran sobre ti en anillos, levanta una legión de esqueletos (más grande en cada fase) y lanza cráneos rastreadores. En la fase final se hace pedazos en una explosión de huesos.",
  mv: (e, c) => {
    if (c.d > 140) c.mv(c.nx * c.sp, c.ny * c.sp);
  },
  ph: (e, c, k) => {
    if (c.ph == 1) {
      e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
      for (let i = 0; i < 3; i++) bmn(e, "grunt", e.x + rnd(-100, 100), e.y + 80);
    } else {
      bz({ k: "ring", x: e.x, y: e.y, ri: 0, ro: 300, t: 1.1, d: e.dmg * 1.3, c: k });
      later(e, 1.1, () => brs(e, 24, 230, e.dmg * 0.45, 0, 0, "#e6dcc0"));
    }
  },
  at: [
    {
      n: "Columna vertebral",
      w: 2,
      f: (e, c, k) => {
        bz({ k: "bar", x: e.x, y: e.y, a: c.a - 1.4 * (e.dir || 1), len: 430, w: 22, sp: 1.9 * (e.dir || 1), t: 0.9, life: 1.6, d: e.dmg * 1.1, c: k, fol: e });
        e.busy = 2.6;
        e.dir *= -1;
        return 1.4;
      },
    },
    {
      n: "Costillas",
      f: (e, c, k) => {
        const cx = P.x,
          cy = P.y;
        bz({ k: "ring", x: cx, y: cy, ri: 175, ro: 215, t: 1, d: e.dmg, c: k });
        bz({ k: "ring", x: cx, y: cy, ri: 95, ro: 135, t: 1.7, d: e.dmg, c: k });
        bz({ k: "pool", x: cx, y: cy, r: 40, t: 2.4, d: e.dmg * 1.2, c: k });
        e.busy = 1;
        later(e, 2.5, () => {
          e.vul = 1.5;
          flash("Mordrake se recompone");
        });
        return 3.4;
      },
    },
    {
      n: "Legión",
      f: (e, c, k) => {
        e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
        for (let i = 0; e.mn.length < 2 + c.ph * 2 && i < 3; i++) bmn(e, "grunt", e.x + rnd(-110, 110), e.y + rnd(50, 110));
        ring(e, 130, k);
        return 2.8;
      },
    },
    {
      n: "Cráneos errantes",
      f: (e, c, k) => {
        for (let i = -1; i <= 1; i++) bt(e, c.a + i * 0.8, 170, e.dmg * 0.6, 0, "#f4ecd0", 1.2);
        return 2.4;
      },
    },
    {
      n: "Dedos de hueso",
      p: 1,
      f: (e, c, k) => {
        for (let i = 1; i <= 9; i++) bz({ k: "pool", x: cl(e.x + Math.cos(c.a) * i * 62, 90, 870), y: cl(e.y + Math.sin(c.a) * i * 62, 90, 510), r: 34, t: 0.6 + i * 0.09, d: e.dmg, c: k });
        return 2.4;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    for (let i = 0; i < 5; i++) dEl(0, r * 0.1 + i * 7, r * (0.95 - Math.abs(i - 1.5) * 0.12), r * 0.14, 0); // costillar
    dLn(0, -r * 0.3, 0, r * 1.1, 8, "#e6dcc0"); // columna
    dCi(0, -r * 0.7, r * 0.42); // cráneo grande
    x.fillStyle = "#000";
    dEl(-r * 0.17, -r * 0.72, r * 0.13, r * 0.17, 0);
    dEl(r * 0.17, -r * 0.72, r * 0.13, r * 0.17, 0);
    dEy(-r * 0.17, -r * 0.72, 2.8, "#8f8");
    dEy(r * 0.17, -r * 0.72, 2.8, "#8f8");
    x.fillStyle = "#c8b030"; // corona de huesos
    for (let i = -2; i <= 2; i++) dPo([[i * 8 - 4, -r * 1.05], [i * 8, -r * 1.35 + Math.abs(i) * 4], [i * 8 + 4, -r * 1.05]]);
    for (const s of [-1, 1]) {
      dLn(s * r * 0.95, -r * 0.1, s * r * 1.4, r * 0.5 + Math.sin(t * 2 + s) * 6, 6, "#e6dcc0"); // brazos
      dCi(s * r * 1.45, r * 0.55 + Math.sin(t * 2 + s) * 6, 6);
    }
  },
});

// ---------- 41 · Abyssia, Madre Abismal (Bosque subterráneo) ----------
mkBoss(41, {
  d: "Madre de la cría abismal. Pone huevos que eclosionan en crías si no los destruyes, lanza tentáculos en hileras y larvas rastreadoras, lanza un grito en ondas y su abrazo se cierra en anillos. En la fase final los huevos eclosionan más rápido y son más.",
  init: (e) => {
    e.orb = [];
  },
  pas: (e, c, dt) => {
    e.orb = e.orb.filter((q) => q.hp > 0 && !q.dead);
    for (const q of e.orb) {
      q.hatch -= dt;
      if (q.hatch <= 0) {
        // eclosión: dos crías (como máximo 8 vivas a la vez) y el huevo desaparece
        e.mn = (e.mn || []).filter((m) => m.hp > 0 && !m.dead);
        if (e.mn.length < 8) {
          bmn(e, "runner", q.x, q.y);
          bmn(e, "runner", q.x + 14, q.y);
        }
        ring(q, 40, "#9fd");
        q.hp = 0;
        q.dead = 1;
      }
    }
  },
  mv: (e, c) => {
    if (c.d < 200) c.mv(-c.nx * c.sp, -c.ny * c.sp);
    else if (c.d > 320) c.mv(c.nx * c.sp, c.ny * c.sp);
  },
  at: [
    {
      n: "Puesta de huevos",
      w: 2,
      f: (e, c, k) => {
        e.orb = e.orb.filter((q) => q.hp > 0 && !q.dead);
        const n = 2 + c.ph;
        for (let i = 0; i < n && e.orb.length < 6; i++) {
          const q = spawn("orb", rnd(130, 830), rnd(130, 470));
          q.sp = 0;
          q.al = 1;
          q.hp = q.mhp = 30 * hpM();
          q.hatch = c.ph == 2 ? 4.5 : 7;
          e.orb.push(q);
        }
        flash("¡Destruye los huevos antes de que eclosionen!");
        return 3;
      },
    },
    {
      n: "Tentáculos abisales",
      f: (e, c, k) => {
        const gap = (Math.random() * 3) | 0;
        for (let r2 = 0; r2 < 3; r2++) {
          if (r2 == gap) continue;
          for (let i = 0; i < 9; i++) bz({ k: "pool", x: 90 + i * 98, y: 150 + r2 * 150, r: 40, t: 0.8 + i * 0.12, d: e.dmg, c: k });
        }
        return 3.2;
      },
    },
    {
      n: "Larvas rastreadoras",
      f: (e, c, k) => {
        for (let i = 0; i < 5 + c.ph * 2; i++) later(e, i * 0.15, () => bt(e, c.a + rnd(-1.2, 1.2), 150, e.dmg * 0.45, 0, "#7fe0c8", 1.0));
        return 2.6;
      },
    },
    {
      n: "Grito de la madre",
      p: 1,
      f: (e, c, k) => {
        for (let j = 0; j < 4; j++) bz({ k: "ring", x: e.x, y: e.y, ri: j * 80 + 30, ro: j * 80 + 85, t: 0.8 + j * 0.3, d: e.dmg, c: k });
        e.busy = 1.5;
        return 2.8;
      },
    },
    {
      n: "Abrazo abisal",
      p: 1,
      f: (e, c, k) => {
        [210, 140, 70].forEach((R, j) => bz({ k: "ring", x: P.x, y: P.y, ri: R - 20, ro: R + 20, t: 0.9 + j * 0.5, d: e.dmg, c: k }));
        later(e, 2.3, () => {
          e.vul = 1.6;
          flash("Abyssia se repliega");
        });
        return 3.4;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    for (let i = 0; i < 7; i++) {
      const q = (i / 7) * 6.283 + Math.sin(t * 0.9 + i) * 0.2;
      x.strokeStyle = "#000";
      x.lineWidth = 11;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(Math.cos(q) * r * 0.4, Math.sin(q) * r * 0.4);
      x.quadraticCurveTo(Math.cos(q + 0.7) * r * 1.1, Math.sin(q + 0.7) * r * 1.1, Math.cos(q + Math.sin(t + i) * 0.5) * r * 1.6, Math.sin(q + Math.sin(t + i) * 0.5) * r * 1.6);
      x.stroke();
      x.strokeStyle = F;
      x.lineWidth = 8;
      x.stroke();
    }
    x.strokeStyle = "#000";
    x.lineWidth = 3;
    dEl(0, 0, r * 0.85, r * 0.75);
    x.fillStyle = "#10303a";
    dEl(0, -r * 0.1, r * 0.55, r * 0.35);
    for (let i = 0; i < 3; i++) dEy((i - 1) * r * 0.28, -r * 0.1, 4.2, "#9fd");
    x.fillStyle = "#e8fff0"; // sacos de huevos
    for (let i = 0; i < 4; i++) dCi(Math.cos(i * 1.57 + 0.8) * r * 0.55, r * 0.35 + Math.sin(i * 1.57) * r * 0.15, 6 + Math.sin(t * 3 + i));
  },
});

// ---------- 36 · Tiamat Quebrada (Bosque subterráneo) ----------
mkBoss(36, {
  d: "Hidra de escamas rotas. Cada cabeza tiene su aliento: fuego en cono, ácido en charcos y escarcha en ondas; su cola barre todo alrededor. En la fase 2 despierta una segunda cabeza y en la 3 las tres atacan a la vez. Tras el coletazo queda expuesta.",
  init: (e) => {
    e.hd = 1;
  },
  ph: (e, c, k) => {
    e.hd = 1 + c.ph;
    flash(c.ph == 1 ? "¡Una segunda cabeza despierta!" : "¡Tiamat despliega las tres cabezas!");
    brs(e, 20, 220, e.dmg * 0.4, 0, 0, "#9fe0b0");
  },
  mv: (e, c) => {
    if (c.d > 140) c.mv(c.nx * c.sp * 0.9, c.ny * c.sp * 0.9);
  },
  at: [
    {
      n: "Aliento ígneo",
      w: 2,
      f: (e, c, k) => {
        const a = c.a;
        bz({ k: "cone", x: e.x, y: e.y, a, ha: 0.5, r: 440, t: 0.95, d: e.dmg * 1.2, c: "#ff7a2a" });
        if (c.ph > 0) {
          bz({ k: "cone", x: e.x, y: e.y, a: a + 1.0, ha: 0.4, r: 400, t: 1.15, d: e.dmg, c: "#ff7a2a" });
          bz({ k: "cone", x: e.x, y: e.y, a: a - 1.0, ha: 0.4, r: 400, t: 1.15, d: e.dmg, c: "#ff7a2a" });
        }
        e.busy = 1.3;
        return 2.4;
      },
    },
    {
      n: "Saliva ácida",
      f: (e, c, k) => {
        for (let i = 0; i < 4 + c.ph * 2; i++) bz({ k: "pool", x: cl(P.x + rnd(-150, 150), 100, 860), y: cl(P.y + rnd(-120, 120), 100, 500), r: 56, t: 0.9 + i * 0.15, life: 4.5, d: e.dmg * 0.35, c: "#8fe04a" });
        return 2.5;
      },
    },
    {
      n: "Aliento helado",
      p: 1,
      f: (e, c, k) => {
        for (let j = 0; j < 4; j++) bz({ k: "ring", x: e.x, y: e.y, ri: j * 85 + 30, ro: j * 85 + 85, t: 0.8 + j * 0.3, d: e.dmg, c: "#bfeaff" });
        e.busy = 1.4;
        return 2.6;
      },
    },
    {
      n: "Coletazo",
      f: (e, c, k) => {
        const s = (Math.random() < 0.5 ? 1 : -1) * (2 + c.ph * 0.3);
        bz({ k: "bar", x: e.x, y: e.y, a: c.a, len: 330, w: 26, sp: s, t: 0.8, life: 2.2, d: e.dmg * 1.1, c: k, fol: e });
        bz({ k: "bar", x: e.x, y: e.y, a: c.a + Math.PI, len: 330, w: 26, sp: s, t: 0.8, life: 2.2, d: e.dmg * 1.1, c: k, fol: e });
        e.busy = 3;
        later(e, 3, () => {
          e.vul = 1.5;
          flash("Tiamat queda expuesta");
        });
        return 3.4;
      },
    },
    {
      n: "Tres alientos",
      p: 2,
      f: (e, c, k) => {
        for (let i = 0; i < 3; i++) bz({ k: "cone", x: e.x, y: e.y, a: c.a + i * 2.094, ha: 0.45, r: 420, t: 1.1, d: e.dmg * 1.2, c: ["#ff7a2a", "#8fe04a", "#bfeaff"][i] });
        e.busy = 1.4;
        return 2.8;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    dEl(0, 0, r * 1.0, r * 0.85); // cuerpo con escamas
    x.strokeStyle = "#0005";
    x.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      x.beginPath();
      x.arc(Math.cos(i * 2.4) * r * 0.55, Math.sin(i * 2.4) * r * 0.5, r * 0.18, 0, 3.14);
      x.stroke();
    }
    x.strokeStyle = "#000";
    x.lineWidth = 3;
    const n = e.hd || 1;
    for (let i = 0; i < n; i++) {
      // cabezas sobre cuellos
      const q = a + (i - (n - 1) / 2) * 0.9,
        hx = Math.cos(q) * r * 1.5 + Math.sin(t * 2 + i) * 4,
        hy = Math.sin(q) * r * 1.5;
      dLn(Math.cos(q) * r * 0.5, Math.sin(q) * r * 0.5, hx, hy, 11, "#3f8f60");
      x.fillStyle = ["#ff7a2a", "#8fe04a", "#bfeaff"][i];
      dCi(hx, hy, r * 0.3);
      dEy(hx + Math.cos(q) * 5, hy + Math.sin(q) * 5 - 3, 3, "#fff");
      dEy(hx + Math.cos(q) * 5, hy + Math.sin(q) * 5 + 4, 3, "#fff");
    }
    x.fillStyle = "#3a6f4a";
    dPo([[-r * 0.9, -r * 0.2], [-r * 1.7, r * 0.2 + Math.sin(t * 2) * 8], [-r * 0.9, r * 0.3]]); // cola
  },
});

// ---------- 39 · Solaris, Sol Caído (Cavernas de lava) ----------
mkBoss(39, {
  d: "Sol que cayó del cielo. Sus rayos solares son radios giratorios con huecos (4 y, a fase 3, 6), lanza llamaradas en ondas, deja manchas solares que arden, y su supernova crece en el centro de la sala. Tras la supernova se enfría y queda expuesto.",
  init: (e) => {
    e.og = 0;
  },
  mv: (e, c, dt) => {
    e.og += 0.4 * dt;
    const tx = 480 + Math.cos(e.og) * 130,
      ty = 300 + Math.sin(e.og) * 100,
      d = Math.hypot(tx - e.x, ty - e.y) || 1;
    c.mv(((tx - e.x) / d) * Math.min(120, d * 2.5), ((ty - e.y) / d) * Math.min(120, d * 2.5));
  },
  at: [
    {
      n: "Rayos solares",
      w: 2,
      f: (e, c, k) => {
        const n = c.ph == 2 ? 6 : 4,
          s = (Math.random() < 0.5 ? 1 : -1) * (0.65 + c.ph * 0.15);
        for (let i = 0; i < n; i++) bz({ k: "bar", x: e.x, y: e.y, a: (i * 6.283) / n + c.a, len: 540, w: 22, sp: s, t: 1, life: 4, d: e.dmg * 0.9, c: "#ffd34a", fol: e });
        e.busy = 5;
        return 1.3;
      },
    },
    {
      n: "Llamarada",
      f: (e, c, k) => {
        for (let j = 0; j < 4; j++) bz({ k: "ring", x: e.x, y: e.y, ri: j * 90 + 20, ro: j * 90 + 80, t: 0.8 + j * 0.3, d: e.dmg, c: k });
        e.busy = 1.5;
        return 2.6;
      },
    },
    {
      n: "Manchas solares",
      f: (e, c, k) => {
        for (let i = 0; i < 4 + c.ph; i++) bz({ k: "pool", x: cl(P.x + rnd(-170, 170), 100, 860), y: cl(P.y + rnd(-130, 130), 100, 500), r: 56, t: 0.9 + i * 0.14, life: 6, d: e.dmg * 0.35, c: "#ff9a2a" });
        return 2.4;
      },
    },
    {
      n: "Supernova",
      p: 1,
      f: (e, c, k) => {
        bz({ k: "pool", x: e.x, y: e.y, r: 330, t: 1.7, d: e.dmg * 1.4, c: "#ffd34a" });
        e.busy = 1.8;
        later(e, 1.8, () => {
          brs(e, 20, 240, e.dmg * 0.45, 0, 0, "#ffd34a");
          e.vul = 2;
          flash("Solaris se enfría: ¡ataca!");
        });
        return 3.2;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.fillStyle = "#ffd34a";
    for (let i = 0; i < 12; i++) {
      const q = (i / 12) * 6.283 + t * 0.4,
        l = r * (i % 2 ? 1.5 : 1.8) + Math.sin(t * 4 + i) * 3;
      dPo([[Math.cos(q - 0.12) * r * 1.05, Math.sin(q - 0.12) * r * 1.05], [Math.cos(q) * l, Math.sin(q) * l], [Math.cos(q + 0.12) * r * 1.05, Math.sin(q + 0.12) * r * 1.05]]);
    }
    x.fillStyle = F;
    dCi(0, 0, r);
    x.fillStyle = "#ff7a2a";
    dEl(0, 0, r * 0.7, r * 0.7, 0, 0);
    x.fillStyle = "#300"; // rostro
    dEl(-r * 0.3, -r * 0.1, r * 0.15, r * 0.2, 0);
    dEl(r * 0.3, -r * 0.1, r * 0.15, r * 0.2, 0);
    x.fillRect(-r * 0.3, r * 0.3, r * 0.6, r * 0.1);
  },
});

// ---------- 37 · Omega, Autómata Final (Cavernas de lava) ----------
mkBoss(37, {
  d: "Máquina de guerra que ejecuta un protocolo fijo: escaneo con cuadrícula láser, salva de misiles, cañón láser que te sigue y sobrecarga (se abre y queda expuesta 3 s). En la fase 2 despliega drones kamikaze y en la 3 ejecuta el Protocolo final con todo a la vez.",
  seq: 1,
  mv: (e, c) => {
    if (c.d > 200) c.mv(c.nx * c.sp * 0.8, c.ny * c.sp * 0.8);
  },
  at: [
    {
      n: "Escaneo",
      f: (e, c, k) => {
        const gx = (Math.random() * 5) | 0,
          gy = (Math.random() * 3) | 0;
        for (let i = 0; i < 5; i++) if (i != gx) bz({ k: "beam", x: 130 + i * 175, y: 40, a: Math.PI / 2, len: 520, w: 11, t: 0.9 + i * 0.12, d: e.dmg, c: "#7cf" });
        for (let j = 0; j < 3; j++) if (j != gy) bz({ k: "beam", x: 40, y: 140 + j * 160, a: 0, len: 880, w: 11, t: 1.5 + j * 0.12, d: e.dmg, c: "#7cf" });
        return 3;
      },
    },
    {
      n: "Salva de misiles",
      f: (e, c, k) => {
        for (let i = 0; i < 6 + c.ph * 2; i++) later(e, i * 0.14, () => bt(e, c.a + (i % 2 ? 1 : -1) * (0.6 + (i % 3) * 0.2), 250, e.dmg * 0.5, 0, "#f84", 1.5));
        return 2.8;
      },
    },
    {
      n: "Cañón láser",
      f: (e, c, k) => {
        bz({ k: "bar", x: e.x, y: e.y, a: c.a, len: 720, w: 24, trk: 0.55 + c.ph * 0.1, t: 1, life: 2.3, d: e.dmg * 1.1, c: "#f55", fol: e });
        e.busy = 3.4;
        return 1.4;
      },
    },
    {
      n: "Sobrecarga",
      f: (e, c, k) => {
        bz({ k: "ring", x: e.x, y: e.y, ri: 0, ro: 220, t: 0.9, d: e.dmg * 1.2, c: "#ff8a4a" });
        e.busy = 1;
        later(e, 0.9, () => {
          e.vul = 3;
          flash("Omega se sobrecalienta: ¡ataca!");
        });
        return 3.5;
      },
    },
    {
      n: "Drones kamikaze",
      p: 1,
      f: (e, c, k) => {
        e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
        for (let i = 0; e.mn.length < 3 && i < 2; i++) bmn(e, "bomber", e.x + rnd(-80, 80), e.y + rnd(40, 90));
        return 2;
      },
    },
    {
      n: "Protocolo final",
      p: 2,
      f: (e, c, k) => {
        for (let i = 0; i < 3; i++) bz({ k: "beam", x: 40, y: 140 + i * 160, a: 0, len: 880, w: 11, t: 1.2, d: e.dmg, c: "#7cf" });
        for (let i = 0; i < 8; i++) later(e, i * 0.18, () => bt(e, c.a + (i - 3.5) * 0.25, 260, e.dmg * 0.45, 0, "#f84", 1.2));
        return 3;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.save();
    x.rotate(a);
    for (const s of [-1, 1]) {
      dLn(0, s * r * 0.8, r * 0.9, s * r * 1.15, 9, "#667");
      dEl(r * 0.95, s * r * 1.15, r * 0.2, r * 0.2);
    }
    dPo([[-r * 0.9, -r * 0.8], [r * 0.6, -r * 0.9], [r * 1.0, 0], [r * 0.6, r * 0.9], [-r * 0.9, r * 0.8]]); // chasis
    x.fillStyle = e.vul > 0 ? "#fc4" : "#334";
    dPo([[r * 0.2, -r * 0.4], [r * 0.7, -r * 0.4], [r * 0.7, r * 0.4], [r * 0.2, r * 0.4]]); // cabeza
    x.fillStyle = "#f33";
    x.fillRect(r * 0.3, -r * 0.08 + Math.sin(t * 5) * r * 0.2, r * 0.35, r * 0.16); // sensor
    x.restore();
    x.fillStyle = "#4af";
    dCi(-r * 0.2, 0, r * 0.25 + Math.sin(t * 6) * 2);
  },
});

// ---------- 42 · Ragnarok Encadenado (Cavernas de lava) ----------
mkBoss(42, {
  d: "Gigante de fuego atado por cuatro cadenas a las esquinas: mientras sigan, solo se mueve en el centro y, al agotar una embestida, las cadenas lo frenan y lo dejan expuesto. Cada fase rompe cadenas y lo vuelve más libre. Latigazos de cadenas, puñetazos, lluvia de magma y rugidos.",
  init: (e) => {
    e.cx = 480;
    e.cy = 300;
  },
  pas: (e, c) => {
    const R = c.ph == 0 ? 190 : c.ph == 1 ? 290 : 999,
      d = Math.hypot(e.x - 480, e.y - 300);
    if (d > R) {
      e.x = 480 + ((e.x - 480) / d) * R;
      e.y = 300 + ((e.y - 300) / d) * R;
    }
    if (e.chg && !(e.lu > 0)) {
      e.chg = 0;
      if (c.ph < 2) {
        e.vul = 1.5;
        shake = 12;
        flash("¡Las cadenas se tensan!");
      }
    }
  },
  ph: (e, c, k) => {
    flash(c.ph == 1 ? "¡Se rompen dos cadenas!" : "¡Ragnarok se libera!");
    bz({ k: "ring", x: e.x, y: e.y, ri: 0, ro: 340, t: 1.2, d: e.dmg * 1.3, c: k });
    e.busy = 1.3;
  },
  mv: (e, c) => {
    if (c.d > 130) c.mv(c.nx * c.sp, c.ny * c.sp);
  },
  at: [
    {
      n: "Puñetazo",
      w: 2,
      f: (e, c, k) => {
        bz({ k: "cone", x: e.x, y: e.y, a: c.a, ha: 0.7, r: 190, t: 0.8, d: e.dmg * 1.4, c: k });
        later(e, 0.8, () => bz({ k: "ring", x: e.x, y: e.y, ri: 190, ro: 260, t: 0.35, d: e.dmg, c: k }));
        e.busy = 1;
        return 2.2;
      },
    },
    {
      n: "Latigazo de cadenas",
      f: (e, c, k) => {
        const s = (Math.random() < 0.5 ? 1 : -1) * (1.2 + c.ph * 0.2);
        for (let i = 0; i < 4 - c.ph; i++) bz({ k: "bar", x: e.x, y: e.y, a: c.a + (i * 6.283) / (4 - c.ph), len: 370, w: 14, sp: s, t: 0.9, life: 2.6, d: e.dmg * 0.8, c: "#ffb070", fol: e });
        e.busy = 3.6;
        return 1.3;
      },
    },
    {
      n: "Embestida encadenada",
      f: (e, c, k) => {
        bz({ k: "beam", x: e.x, y: e.y, a: c.a, len: 620, w: e.r * 0.85, t: 0.8, d: e.dmg * 1.3, c: k });
        e.busy = 0.85;
        later(e, 0.8, () => {
          dsh(e, 0.5, 540);
          e.chg = 1;
        });
        return 3;
      },
    },
    {
      n: "Lluvia de magma",
      f: (e, c, k) => {
        for (let i = 0; i < 5 + c.ph * 2; i++) bz({ k: "pool", x: cl(P.x + rnd(-170, 170), 100, 860), y: cl(P.y + rnd(-140, 140), 100, 500), r: 54, t: 0.9 + i * 0.13, life: 3.5, d: e.dmg * 0.4, c: "#ff5a1a" });
        return 2.6;
      },
    },
    {
      n: "Rugido",
      p: 1,
      f: (e, c, k) => {
        for (let j = 0; j < 3; j++) bz({ k: "ring", x: e.x, y: e.y, ri: j * 100 + 30, ro: j * 100 + 90, t: 0.8 + j * 0.3, d: e.dmg, c: k });
        later(e, 1.6, () => brs(e, 16, 230, e.dmg * 0.45, 0, 0, "#ffb070"));
        e.busy = 1.7;
        return 2.8;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    const ph = e.hp < e.mhp * 0.33 ? 2 : e.hp < e.mhp * 0.66 ? 1 : 0,
      corners = [[40, 40], [920, 40], [40, 560], [920, 560]];
    x.strokeStyle = "#8a8a94";
    x.lineWidth = 4;
    x.setLineDash([9, 5]);
    for (let i = ph == 0 ? 0 : ph == 1 ? 2 : 4; i < 4; i++) {
      // cadenas hacia las esquinas (las que quedan sin romper: 4 en la fase 1, 2 en la 2, ninguna en la 3)
      x.beginPath();
      x.moveTo(0, 0);
      x.lineTo(corners[i][0] - e.x, corners[i][1] - e.y);
      x.stroke();
    }
    x.setLineDash([]);
    x.strokeStyle = "#000";
    x.lineWidth = 3;
    dPo([[-r, r * 0.9], [-r * 1.05, -r * 0.1], [-r * 0.5, -r * 0.9], [r * 0.5, -r * 0.9], [r * 1.05, -r * 0.1], [r, r * 0.9]]); // torso de basalto
    x.fillStyle = "#ff7a2a";
    for (let i = 0; i < 5; i++) dPo([[-r * 0.6 + i * r * 0.3, r * 0.3], [-r * 0.5 + i * r * 0.3, -r * 0.2], [-r * 0.4 + i * r * 0.3, r * 0.3]]); // grietas de lava
    x.fillStyle = "#2a1a14";
    dCi(0, -r * 0.5, r * 0.4);
    dEy(-r * 0.16, -r * 0.52, 4, "#ff0");
    dEy(r * 0.16, -r * 0.52, 4, "#ff0");
    for (const s of [-1, 1]) {
      x.fillStyle = "#8a8a94";
      dCi(s * r * 1.1, r * 0.1, 8); // grilletes
    }
  },
});

// ---------- 35 · Kharon, Barquero del Vacío (Dimensión corrupta) ----------
mkBoss(35, {
  d: "Barquero de almas. El río del Vacío arrastra al jugador por las dos corrientes que cruzan la sala (en fase 2 aparece una tercera). Su remo barre en arco, cobra el peaje con lluvias de monedas, su linterna fija un cono y su barca embiste de lado a lado: si encalla queda expuesto.",
  init: (e) => {
    e.og = Math.random() * 6.28;
    e.rv = [bz({ k: "beam", x: 40, y: 150, a: 0, len: 880, w: 52, t: 0.1, life: 9999, d: 0, c: "#2a8a7a" }), bz({ k: "beam", x: 40, y: 450, a: 0, len: 880, w: 52, t: 0.1, life: 9999, d: 0, c: "#2a8a7a" })];
  },
  ph: (e, c, k) => {
    if (c.ph == 1) e.rv.push(bz({ k: "beam", x: 40, y: 300, a: 0, len: 880, w: 40, t: 0.1, life: 9999, d: 0, c: "#2a8a7a" }));
    flash("¡La corriente se acelera!");
  },
  pas: (e, c, dt) => {
    const sp = 60 + c.ph * 35;
    if (Math.abs(P.y - 150) < 52) pushP(sp * dt, 0);
    else if (Math.abs(P.y - 450) < 52) pushP(-sp * dt, 0);
    else if (c.ph > 0 && Math.abs(P.y - 300) < 40) pushP(sp * dt, 0);
  },
  mv: (e, c, dt) => {
    e.og += 0.45 * dt * e.dir;
    const tx = 480 + Math.cos(e.og) * 260,
      ty = 300 + Math.sin(e.og) * 140,
      d = Math.hypot(tx - e.x, ty - e.y) || 1;
    c.mv(((tx - e.x) / d) * Math.min(150, d * 3), ((ty - e.y) / d) * Math.min(150, d * 3));
  },
  at: [
    {
      n: "Remo",
      w: 2,
      f: (e, c, k) => {
        bz({ k: "bar", x: e.x, y: e.y, a: c.a - 1.2, len: 340, w: 22, sp: 2.5, t: 0.85, life: 1.4, d: e.dmg * 1.1, c: k, fol: e });
        e.busy = 2.3;
        return 1.4;
      },
    },
    {
      n: "Peaje",
      f: (e, c, k) => {
        for (let j = 0; j < 3; j++) later(e, j * 0.5, () => brs(e, 10, 190 + j * 20, e.dmg * 0.45, j * 0.3, j % 2 ? 0.4 : -0.4, "#e8d070"));
        return 2.6;
      },
    },
    {
      n: "Linterna",
      f: (e, c, k) => {
        bz({ k: "cone", x: e.x, y: e.y, a: c.a, ha: 0.45, r: 470, t: 1, d: e.dmg * 1.2, c: "#7ff0d0" });
        later(e, 1, () => brs(e, 5, 280, e.dmg * 0.4, c.a, 0, "#7ff0d0"));
        e.busy = 1.1;
        return 2.3;
      },
    },
    {
      n: "Almas pasajeras",
      p: 1,
      f: (e, c, k) => {
        e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
        for (let i = 0; e.mn.length < 3 && i < 2; i++) bmn(e, "runner", e.x + rnd(-60, 60), e.y + 50);
        ring(e, 100, k);
        return 2.4;
      },
    },
    {
      n: "Travesía",
      w: 2,
      f: (e, c, k) => {
        bz({ k: "beam", x: e.x, y: e.y, a: c.a, len: 800, w: 38, t: 1, d: e.dmg * 1.3, c: k });
        e.busy = 1.05;
        later(e, 1, () => {
          dsh(e, 0.7, 760);
          e.chg = 1;
        });
        later(e, 1.9, () => {
          e.vul = 1.8;
          flash("La barca de Kharon encalla");
        });
        return 3.6;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.save();
    x.rotate(a);
    x.fillStyle = "#2a2a3a"; // barca
    dPo([[-r * 1.2, 0], [-r * 0.6, -r * 0.8], [r * 1.0, -r * 0.5], [r * 1.5, 0], [r * 1.0, r * 0.5], [-r * 0.6, r * 0.8]]);
    x.fillStyle = F;
    dEl(-r * 0.1, 0, r * 0.45, r * 0.55); // figura encapuchada
    x.fillStyle = "#08121a";
    dEl(r * 0.05, 0, r * 0.28, r * 0.3);
    dEy(r * 0.12, -r * 0.1, 2.6, "#7ff0d0");
    dEy(r * 0.12, r * 0.1, 2.6, "#7ff0d0");
    dLn(-r * 0.2, r * 0.55, r * 0.7, r * 1.3 + Math.sin(t * 2) * 4, 5, "#8a7a6a"); // remo
    dLn(r * 1.4, 0, r * 1.7, 0, 3, "#999");
    x.fillStyle = "#7ff0d0";
    dCi(r * 1.8, 0, 6 + Math.sin(t * 6)); // linterna
    x.restore();
  },
});

// ---------- 38 · Nyarl, Pesadilla Coronada (Dimensión corrupta) ----------
mkBoss(38, {
  d: "Pesadilla con una corona de ojos. Las «Pesadillas» invierten tus controles; los ojos de su corona disparan rayos a la vez, aparece a tu espalda y, desde la fase 3, apaga la luz con un sueño profundo. Al despertar de una pesadilla queda expuesta.",
  mv: (e, c) => {
    if (c.d < 220) c.mv(-c.nx * c.sp * 1.2, -c.ny * c.sp * 1.2);
    else if (c.d > 320) c.mv(c.nx * c.sp, c.ny * c.sp);
    else c.mv(-c.ny * c.sp * e.dir, c.nx * c.sp * e.dir);
  },
  at: [
    {
      n: "Pesadilla",
      w: 2,
      f: (e, c, k) => {
        flash("¡Nyarl invierte tus controles!");
        later(e, 1, () => {
          P.invc = 2 + c.ph * 0.5;
        });
        for (let j = 0; j < 3; j++) later(e, 1 + j * 0.7, () => brs(e, 12, 180, e.dmg * 0.4, j * 0.3, 0, "#c04fd8"));
        e.busy = 1;
        later(e, 3.2, () => {
          e.vul = 1.4;
          flash("Nyarl despierta");
        });
        return 3.6;
      },
    },
    {
      n: "Ojos de la corona",
      f: (e, c, k) => {
        const n = 5 + c.ph;
        for (let i = 0; i < n; i++) {
          const q = (i / n) * 6.283 + e.tm,
            ox = e.x + Math.cos(q) * e.r * 1.6,
            oy = e.y + Math.sin(q) * e.r * 1.6;
          bz({ k: "beam", x: ox, y: oy, a: Math.atan2(P.y - oy, P.x - ox), len: 640, w: 12, t: 1 + i * 0.1, d: e.dmg, c: k });
        }
        return 2.8;
      },
    },
    {
      n: "Despertar a tu espalda",
      f: (e, c, k) => {
        const bx = cl(P.x - Math.cos(P.face) * 140, 100, 860),
          by = cl(P.y - Math.sin(P.face) * 140, 100, 500);
        bz({ k: "pool", x: bx, y: by, r: 50, t: 0.8, d: 0, c: "#c04fd8" });
        ghost(e, 0.8);
        e.busy = 0.8;
        later(e, 0.8, () => {
          e.x = bx;
          e.y = by;
          ring(e, 80, k);
          bz({ k: "cone", x: e.x, y: e.y, a: Math.atan2(P.y - e.y, P.x - e.x), ha: 1, r: 170, t: 0.4, d: e.dmg * 1.4, c: k });
        });
        return 2.4;
      },
    },
    {
      n: "Terror",
      p: 1,
      f: (e, c, k) => {
        for (let i = 0; i < 4; i++) bz({ k: "pool", x: rnd(110, 850), y: rnd(110, 490), r: 62, t: 1.3 + i * 0.1, d: e.dmg, c: k, fx: (h) => brs({ x: h.x, y: h.y }, 6, 170, e.dmg * 0.35, 0, 0, "#c04fd8") });
        return 2.6;
      },
    },
    {
      n: "Sueño profundo",
      p: 2,
      f: (e, c, k) => {
        G.dk = 170;
        later(e, 5, () => (G.dk = 0));
        for (let j = 0; j < 5; j++) later(e, 0.5 + j * 0.9, () => bz({ k: "pool", x: P.x, y: P.y, r: 62, t: 0.85, d: e.dmg, c: k }));
        return 5.4;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    dPo([[-r * 0.8, r], [-r * 0.6, -r * 0.2], [r * 0.6, -r * 0.2], [r * 0.8, r]]);
    dCi(0, -r * 0.45, r * 0.42);
    x.fillStyle = "#fff";
    dEl(0, -r * 0.45, r * 0.3, r * 0.2);
    dEy(Math.cos(a) * 4, -r * 0.45 + Math.sin(a) * 3, 4.5, "#000");
    for (let i = 0; i < 5; i++) {
      // corona de ojos
      const q = -1.57 + (i - 2) * 0.5;
      x.fillStyle = "#e8d0ff";
      dEl(Math.cos(q) * r * 0.75, -r * 0.45 + Math.sin(q) * r * 0.75, 7, 4.5);
      dEy(Math.cos(q) * r * 0.75 + Math.cos(a) * 2, -r * 0.45 + Math.sin(q) * r * 0.75 + Math.sin(a) * 2, 2.4, "#400");
    }
  },
});

// ---------- 43 · Eterna, la Última Sombra (Dimensión corrupta) ----------
mkBoss(43, {
  d: "Última sombra del abismo: apaga la luz de la sala (más cada fase) y ataca desde la oscuridad. Lanzas de sombra desde los bordes, un reflejo que golpea tu posición espejada, noche cerrada en anillos que convergen y abrazos de sombra. Tras la noche cerrada se desvanece.",
  pas: (e, c) => {
    G.dk = [270, 215, 160][c.ph];
  },
  mv: (e, c) => {
    if (c.d < 200) c.mv(-c.nx * c.sp * 1.2, -c.ny * c.sp * 1.2);
    else if (c.d > 300) c.mv(c.nx * c.sp, c.ny * c.sp);
    else c.mv(-c.ny * c.sp * e.dir, c.nx * c.sp * e.dir);
  },
  at: [
    {
      n: "Lanzas de sombra",
      w: 2,
      f: (e, c, k) => {
        const n = 5 + c.ph;
        for (let i = 0; i < n; i++) {
          const q = rnd(0, 6.283),
            ox = cl(480 + Math.cos(q) * 460, 40, 920),
            oy = cl(300 + Math.sin(q) * 290, 40, 560);
          bz({ k: "beam", x: ox, y: oy, a: Math.atan2(P.y - oy, P.x - ox), len: 900, w: 14, t: 1 + i * 0.13, d: e.dmg, c: "#8a7ad0" });
        }
        return 3;
      },
    },
    {
      n: "Reflejo",
      f: (e, c, k) => {
        bz({ k: "pool", x: 960 - P.x, y: 600 - P.y, r: 70, t: 1.1, d: e.dmg * 1.2, c: "#6a5aa8" });
        bz({ k: "pool", x: P.x, y: P.y, r: 60, t: 1.6, d: e.dmg, c: "#6a5aa8" });
        later(e, 1.1, () => bz({ k: "pool", x: 960 - P.x, y: 600 - P.y, r: 70, t: 0.8, d: e.dmg * 1.2, c: "#6a5aa8" }));
        return 2.6;
      },
    },
    {
      n: "Noche cerrada",
      f: (e, c, k) => {
        [390, 290, 190, 100].forEach((R, j) => bz({ k: "ring", x: 480, y: 300, ri: R - 24, ro: R + 24, t: 0.9 + j * 0.45, d: e.dmg, c: "#8a7ad0" }));
        later(e, 2.4, () => {
          e.vul = 1.7;
          flash("Eterna se desvanece un instante");
        });
        return 3.4;
      },
    },
    {
      n: "Abrazo de sombra",
      p: 1,
      f: (e, c, k) => {
        bz({ k: "beam", x: e.x, y: e.y, a: c.a, len: 600, w: e.r * 0.8, t: 0.7, d: e.dmg * 1.3, c: k });
        e.busy = 0.75;
        later(e, 0.7, () => dsh(e, 0.35, 620));
        return 2.4;
      },
    },
    {
      n: "Última noche",
      p: 2,
      f: (e, c, k) => {
        for (let j = 0; j < 18; j++) later(e, j * 0.12, () => bt(e, j * 0.5 + e.tm, 210, e.dmg * 0.4, 0.4, "#8a7ad0"));
        for (let i = 0; i < 4; i++) bz({ k: "pool", x: cl(P.x + rnd(-150, 150), 100, 860), y: cl(P.y + rnd(-120, 120), 100, 500), r: 56, t: 1 + i * 0.2, d: e.dmg, c: "#6a5aa8" });
        return 3;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.fillStyle = "#0c0818";
    for (let i = 0; i < 5; i++) {
      x.globalAlpha *= 0.85;
      dPo([[-r * 0.6, r * 0.2], [-r * 0.3, -r * 1.0 - i * 3], [r * 0.3, -r * 1.0 - i * 3], [r * 0.6, r * 0.2], [r * 0.5, r * 1.2 + Math.sin(t * 3 + i) * 5], [0, r * 0.8], [-r * 0.5, r * 1.2 + Math.cos(t * 3 + i) * 5]], 0);
    }
    x.globalAlpha = 1;
    x.fillStyle = F;
    dEl(0, -r * 0.5, r * 0.34, r * 0.4);
    dEy(-r * 0.14, -r * 0.55, 3.4, "#fff");
    dEy(r * 0.14, -r * 0.55, 3.4, "#fff");
    x.strokeStyle = "#8a7ad0";
    x.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      x.globalAlpha = 0.5;
      x.beginPath();
      x.arc(0, 0, r * (1.2 + i * 0.25 + Math.sin(t * 2 + i) * 0.05), t + i, t + i + 2.4);
      x.stroke();
    }
    x.globalAlpha = 1;
  },
});
