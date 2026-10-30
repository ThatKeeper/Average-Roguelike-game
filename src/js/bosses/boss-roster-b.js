/* ======================================================================
 * src/js/bosses/boss-roster-b.js
 * Jefes hechos a mano · Bosque subterráneo (Ilmara, Lyssa, Thorn, Grendal) y Ruinas arcanas (Quill).
 * ====================================================================== */

// ---------- 13 · Ilmara, la Tejedora (Bosque subterráneo) ----------
mkBoss(13, {
  d: "Tejedora etérea que dibuja la sala con hilos: telares de rayos que se cierran por turnos (hay que cruzar entre ellos), un hilo del destino que te persigue atado a ella y capullos de seda que ralentizan. Al terminar un telar, recoge los hilos y queda expuesta.",
  mv: (e, c) => {
    if (c.d < 260) c.mv(-c.nx * c.sp * 1.2, -c.ny * c.sp * 1.2);
    else if (c.d > 360) c.mv(c.nx * c.sp, c.ny * c.sp);
    else c.mv(-c.ny * c.sp * e.dir * 0.8, c.nx * c.sp * e.dir * 0.8);
  },
  at: [
    {
      n: "Telar",
      w: 2,
      f: (e, c, k) => {
        const g = (Math.random() * 6) | 0;
        for (let i = 0; i < 6; i++) if (i != g) bz({ k: "beam", x: 120 + i * 140, y: 50, a: Math.PI / 2, len: 520, w: 26, t: 1 + (i % 2) * 0.8, d: e.dmg, c: k });
        if (c.ph > 0) {
          const h = (Math.random() * 3) | 0;
          for (let j = 0; j < 3; j++) if (j != h) bz({ k: "beam", x: 50, y: 150 + j * 150, a: 0, len: 880, w: 26, t: 2.6, d: e.dmg, c: k });
        }
        e.busy = 2.2;
        later(e, 2.9, () => {
          e.vul = 1.4;
          flash("Ilmara recoge los hilos");
        });
        return 3.6;
      },
    },
    {
      n: "Hilo del destino",
      f: (e, c, k) => {
        bz({ k: "bar", x: e.x, y: e.y, a: c.a, len: 470, w: 12, trk: 0.85 + c.ph * 0.2, t: 0.9, life: 2.6, d: e.dmg * 0.9, c: "#f0c8ff", fol: e });
        e.busy = 3.5;
        return 1.3;
      },
    },
    {
      n: "Agujas",
      f: (e, c, k) => {
        for (let j = 0; j < 2; j++) later(e, j * 0.45, () => { for (let i = -3; i <= 3; i++) bt(e, Math.atan2(P.y - e.y, P.x - e.x) + i * 0.11, 380, e.dmg * 0.45, 0, "#f0c8ff"); });
        return 2.3;
      },
    },
    {
      n: "Capullos de seda",
      p: 1,
      f: (e, c, k) => {
        for (let i = 0; i < 3; i++) bz({ k: "web", x: cl(P.x + rnd(-130, 130), 100, 860), y: cl(P.y + rnd(-110, 110), 100, 500), r: 78, t: 0.7, life: 6.5, c: "#e8d0ff" });
        return 2.2;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.strokeStyle = "#e8d0ffaa";
    x.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      // seis hilos que ondulan
      const q = (i / 6) * 6.283 + t * 0.5;
      x.beginPath();
      x.moveTo(Math.cos(q) * r * 0.5, Math.sin(q) * r * 0.5);
      x.quadraticCurveTo(Math.cos(q + 0.6) * r * 1.5, Math.sin(q + 0.6) * r * 1.5, Math.cos(q + Math.sin(t + i) * 0.4) * r * 2.1, Math.sin(q + Math.sin(t + i) * 0.4) * r * 2.1);
      x.stroke();
    }
    x.strokeStyle = "#000";
    x.lineWidth = 3;
    x.fillStyle = F;
    dEl(0, r * 0.2, r * 0.55, r * 0.95); // vestido esbelto
    dCi(0, -r * 0.6, r * 0.38);
    x.fillStyle = "#2a1040";
    dEl(0, -r * 0.7, r * 0.42, r * 0.3); // tocado
    for (const s of [-1, 1]) dLn(s * r * 0.45, r * 0.1, s * r * 1.1, -r * 0.5 + Math.sin(t * 2 + s) * 4, 3, "#e8d0ff"); // agujas
    dEy(-r * 0.12, -r * 0.55, 2.5, "#fff");
    dEy(r * 0.12, -r * 0.55, 2.5, "#fff");
  },
});

// ---------- 25 · Lyssa, Reina Araña (Bosque subterráneo) ----------
mkBoss(25, {
  d: "Araña gigante veloz. Teje telarañas que ralentizan (la sala se va llenando), salta sobre su presa con un aviso en el suelo, escupe veneno rastreador y cría arañitas. Cada aterrizaje la deja jadeando un instante.",
  init: (e) => {
    e.wt = 4;
  },
  pas: (e, c, dt) => {
    e.wt -= dt;
    if (e.wt <= 0 && BHZ.filter((h) => h.k == "web").length < 5) {
      e.wt = 7;
      bz({ k: "web", x: rnd(130, 830), y: rnd(130, 470), r: 70, t: 1, life: 14, c: "#e8e8f8" });
    }
  },
  mv: (e, c, dt) => {
    const j = Math.sin(e.tm * 7) * 0.9;
    c.mv((c.nx - c.ny * j) * c.sp * 1.6, (c.ny + c.nx * j) * c.sp * 1.6);
    if (c.d < 100) c.mv(-c.nx * c.sp * 2, -c.ny * c.sp * 2);
  },
  at: [
    {
      n: "Salto sobre la presa",
      w: 2,
      f: (e, c, k) => {
        const px = P.x,
          py = P.y;
        bz({ k: "pool", x: px, y: py, r: 95, t: 1, d: e.dmg * 1.3, c: k });
        ghost(e, 1.05);
        e.busy = 1.05;
        later(e, 1, () => {
          e.x = cl(px, 90, 870);
          e.y = cl(py, 90, 510);
          ring(e, 90, k);
          e.vul = 0.9;
        });
        return 2.2;
      },
    },
    {
      n: "Escupitajo venenoso",
      f: (e, c, k) => {
        for (let i = -2; i <= 2; i++) bt(e, c.a + i * 0.22, 200, e.dmg * 0.5, 0, "#9cff4a", 0.7);
        return 2.3;
      },
    },
    {
      n: "Cría de arañas",
      f: (e, c, k) => {
        e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
        const mx = c.ph > 0 ? 4 : 2;
        for (let i = 0; e.mn.length < mx && i < 2; i++) bmn(e, "runner", e.x + rnd(-50, 50), e.y + rnd(30, 70));
        ring(e, 80, k);
        return 2.6;
      },
    },
    {
      n: "Tela de emboscada",
      p: 1,
      f: (e, c, k) => {
        for (let i = 0; i < 4; i++) bz({ k: "web", x: cl(P.x + Math.cos(i * 1.57) * 120, 100, 860), y: cl(P.y + Math.sin(i * 1.57) * 120, 100, 500), r: 70, t: 0.6, life: 8, c: "#e8e8f8" });
        bz({ k: "pool", x: P.x, y: P.y, r: 70, t: 1.2, d: e.dmg, c: k });
        return 2.4;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    x.save();
    x.rotate(a);
    for (let i = 0; i < 4; i++)
      for (const s of [-1, 1]) {
        const q = Math.sin(t * 9 + i * 1.3 * s) * 0.3,
          ba = s * (0.55 + i * 0.42) + q;
        dLn(0, 0, Math.cos(ba) * r * 1.2, Math.sin(ba) * r * 1.2, 4, "#6a2a8a");
        dLn(Math.cos(ba) * r * 1.2, Math.sin(ba) * r * 1.2, Math.cos(ba + s * 0.7) * r * 1.9, Math.sin(ba + s * 0.7) * r * 1.9, 3, "#6a2a8a");
      }
    dEl(-r * 0.35, 0, r * 0.8, r * 0.7); // abdomen
    x.fillStyle = "#d8a0ff";
    dEl(-r * 0.35, 0, r * 0.25, r * 0.4, 0); // marca
    x.fillStyle = F;
    dEl(r * 0.45, 0, r * 0.5, r * 0.45); // cefalotórax
    for (let i = 0; i < 4; i++) dEy(r * (0.6 + (i % 2) * 0.15), (i < 2 ? -1 : 1) * r * (0.12 + (i % 2) * 0.14), 2.6, "#ff4a4a");
    x.restore();
  },
});

// ---------- 27 · Thorn, Madre de Espinas (Bosque subterráneo) ----------
mkBoss(27, {
  d: "Maraña arraigada que no se mueve. Lanza hileras de zarzas hacia ti, hace brotar raíces bajo tus pies, expulsa polen en espiral y cultiva capullos: mientras haya capullos es inmune y, si no los destruyes a tiempo, estallan. Al caerlos queda expuesta.",
  init: (e) => {
    e.orb = [];
  },
  pas: (e, c, dt) => {
    e.orb = e.orb.filter((q) => q.hp > 0 && !q.dead);
    if (e.pod && e.orb.length == 0) {
      e.pod = 0;
      e.imm = 0;
      e.vul = 2.6;
      flash("¡Thorn queda al descubierto!");
    }
    if (e.pod) {
      e.pod -= dt;
      e.imm = 1;
      if (e.pod <= 0) {
        // los capullos supervivientes estallan
        e.pod = 0;
        for (const q of e.orb) {
          bz({ k: "pool", x: q.x, y: q.y, r: 105, t: 0.45, d: e.dmg * 1.2, c: "#9be86a" });
          q.hp = 0;
          q.dead = 1;
        }
        e.orb = [];
        e.imm = 0;
        e.vul = 1;
      }
    }
    e.orb.forEach((q) => {
      q.sp = 0;
    });
  },
  at: [
    {
      n: "Zarzas",
      f: (e, c, k) => {
        const line = (da) => {
          for (let i = 1; i <= 8; i++) bz({ k: "pool", x: cl(e.x + Math.cos(c.a + da) * i * 62, 90, 870), y: cl(e.y + Math.sin(c.a + da) * i * 62, 90, 510), r: 36, t: 0.5 + i * 0.1, d: e.dmg, c: "#4fbf5a" });
        };
        line(0);
        if (c.ph > 0) {
          line(0.5);
          line(-0.5);
        }
        return 2.4;
      },
    },
    {
      n: "Raíces",
      f: (e, c, k) => {
        bz({ k: "web", x: P.x, y: P.y, r: 90, t: 0.7, life: 3.5, c: "#5a8f3a" });
        bz({ k: "pool", x: P.x, y: P.y, r: 62, t: 1.1, d: e.dmg * 1.2, c: k });
        return 2.2;
      },
    },
    {
      n: "Polen",
      f: (e, c, k) => {
        for (let j = 0; j < 14; j++) later(e, j * 0.12, () => bt(e, j * 0.55, 170, e.dmg * 0.4, 0.25, "#f0e060"));
        return 2.6;
      },
    },
    {
      n: "Capullos",
      w: 2,
      f: (e, c, k) => {
        if (e.pod) return 1;
        e.orb = [];
        for (let i = 0; i < 3; i++) {
          const q = spawn("orb", cl(e.x + Math.cos(i * 2.094 + 0.5) * 160, 110, 850), cl(e.y + Math.sin(i * 2.094 + 0.5) * 160, 110, 490));
          q.sp = 0;
          q.al = 1;
          q.hp = q.mhp = 40 * hpM();
          e.orb.push(q);
        }
        e.pod = 8;
        e.imm = 1;
        flash("¡Destruye los capullos antes de que estallen!");
        return 3;
      },
    },
    {
      n: "Floración",
      p: 2,
      f: (e, c, k) => {
        for (let j = 0; j < 3; j++) later(e, j * 0.5, () => brs(e, 16, 190, e.dmg * 0.4, j * 0.2, 0, "#ff9ad0"));
        return 2.6;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    for (let i = 0; i < 10; i++) {
      const q = (i / 10) * 6.283 + Math.sin(t * 0.7 + i) * 0.15;
      x.strokeStyle = "#1a3a1a";
      x.lineWidth = 9;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(0, 0);
      x.quadraticCurveTo(Math.cos(q + 0.5) * r * 0.8, Math.sin(q + 0.5) * r * 0.8, Math.cos(q) * r * 1.2, Math.sin(q) * r * 1.2);
      x.stroke();
      x.strokeStyle = F;
      x.lineWidth = 6;
      x.stroke();
      dPo([[Math.cos(q) * r * 1.2, Math.sin(q) * r * 1.2], [Math.cos(q + 0.15) * r * 1.5, Math.sin(q + 0.15) * r * 1.5], [Math.cos(q - 0.15) * r * 1.5, Math.sin(q - 0.15) * r * 1.5]]);
    }
    x.strokeStyle = "#000";
    x.lineWidth = 3;
    x.fillStyle = "#2f7f3a";
    dCi(0, 0, r * 0.7);
    x.fillStyle = e.imm > 0 ? "#cde" : "#e84a7a"; // capullo central
    for (let i = 0; i < 5; i++) dEl(Math.cos(i * 1.257 + t * 0.2) * r * 0.25, Math.sin(i * 1.257 + t * 0.2) * r * 0.25, r * 0.3, r * 0.17, i * 1.257 + t * 0.2);
    dEy(0, 0, 4, "#ffe9a0");
  },
});

// ---------- 18 · Grendal el Podrido (Bosque subterráneo) ----------
mkBoss(18, {
  d: "Gigante en descomposición que va dejando charcos de podredumbre a su paso (a partir de la fase 2, muchos más). Vomita conos de glóbulos, revienta pústulas que sueltan esporas y aplasta el suelo. Tras cada aplastamiento se hunde en su propia podredumbre.",
  pas: (e, c, dt) => {
    e.t5 = (e.t5 || 0.8) - dt;
    if (e.t5 <= 0 && !(e.vul > 0)) {
      e.t5 = c.ph > 0 ? 0.5 : 0.9;
      bz({ k: "pool", x: e.x, y: e.y, r: 34, t: 0.3, life: 4.2, d: e.dmg * 0.3, c: "#6f8f2a" });
    }
  },
  mv: (e, c) => {
    if (c.d > 100) c.mv(c.nx * c.sp * 0.85, c.ny * c.sp * 0.85);
  },
  at: [
    {
      n: "Vómito pútrido",
      f: (e, c, k) => {
        const a = c.a;
        bz({ k: "cone", x: e.x, y: e.y, a, ha: 0.5, r: 340, t: 0.9, d: e.dmg * 0.9, c: k });
        e.busy = 1.1;
        later(e, 0.9, () => { for (let i = -4; i <= 4; i++) bt(e, a + i * 0.11, 150 + Math.abs(i) * 8, e.dmg * 0.4, 0, "#a8d84a"); });
        return 2.4;
      },
    },
    {
      n: "Estallido de pústulas",
      w: 2,
      f: (e, c, k) => {
        for (let i = 0; i < 4 + c.ph; i++) {
          const px = cl(P.x + rnd(-150, 150), 100, 860),
            py = cl(P.y + rnd(-120, 120), 100, 500);
          bz({ k: "pool", x: px, y: py, r: 46, t: 1 + i * 0.2, d: e.dmg, c: k, fx: (h) => { for (let j = 0; j < 6; j++) bt({ x: h.x, y: h.y }, j * 1.047 + 0.3, 140, e.dmg * 0.35, 0.4, "#a8d84a"); } });
        }
        return 2.6;
      },
    },
    {
      n: "Aplastamiento",
      f: (e, c, k) => {
        bz({ k: "ring", x: e.x, y: e.y, ri: 0, ro: 130, t: 0.8, d: e.dmg * 1.3, c: k });
        bz({ k: "ring", x: e.x, y: e.y, ri: 165, ro: 240, t: 1.3, d: e.dmg, c: k });
        e.busy = 1.2;
        later(e, 1.3, () => {
          e.vul = 1.3;
          flash("Grendal se hunde en su podredumbre");
        });
        return 2.8;
      },
    },
    {
      n: "Enjambre",
      p: 1,
      f: (e, c, k) => {
        e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
        for (let i = 0; e.mn.length < 3 && i < 2; i++) bmn(e, "runner", e.x + rnd(-60, 60), e.y + 50);
        ring(e, 90, k);
        return 2.4;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    dEl(0, 0, r * 1.05, r * 0.95); // cuerpo hinchado
    x.fillStyle = "#4f6a1e";
    for (let i = 0; i < 6; i++) dCi(Math.cos(i * 1.05 + 0.4) * r * 0.6, Math.sin(i * 1.05 + 0.4) * r * 0.55, r * (0.12 + (i % 3) * 0.04)); // pústulas
    x.save();
    x.rotate(a);
    x.fillStyle = "#c8d89a";
    dCi(r * 0.65, 0, r * 0.35);
    x.fillStyle = "#1a2a08";
    dEl(r * 0.8, 0, r * 0.14, r * 0.2);
    dEy(r * 0.7, -r * 0.18, 2.8, "#ff5");
    dEy(r * 0.7, r * 0.18, 2.8, "#ff5");
    x.restore();
    x.fillStyle = "#111"; // moscas
    for (let i = 0; i < 5; i++) dEy(Math.cos(t * 3 + i * 1.3) * r * 1.5, Math.sin(t * 3.7 + i * 1.7) * r * 1.4, 2.4, "#222");
  },
});

// ---------- 31 · Quill, el Archivista (Ruinas arcanas) ----------
mkBoss(31, {
  d: "Archivista flotante que lee su biblioteca contra ti: «Capítulos» numerados que detonan en orden, una lluvia de páginas curvas, un índice prohibido (franja de silencio) y charcos de tinta. Si se corrige a sí mismo se teletransporta. Al terminar los capítulos se queda sin tinta.",
  mv: (e, c) => {
    if (c.d < 240) c.mv(-c.nx * c.sp * 1.3, -c.ny * c.sp * 1.3);
    else if (c.d > 330) c.mv(c.nx * c.sp, c.ny * c.sp);
    else c.mv(-c.ny * c.sp * e.dir * 0.7, c.nx * c.sp * e.dir * 0.7);
  },
  at: [
    {
      n: "Capítulos",
      w: 2,
      f: (e, c, k) => {
        const n = 4 + c.ph;
        for (let i = 0; i < n; i++) {
          const px = cl(P.x + rnd(-170, 170), 100, 860),
            py = cl(P.y + rnd(-140, 140), 100, 500),
            tt = 1 + i * 0.6;
          bz({ k: "pool", x: px, y: py, r: 52 + (i % 2) * 12, t: tt, d: e.dmg, c: k, lb: ["I", "II", "III", "IV", "V", "VI"][i] });
        }
        e.busy = 1.5;
        later(e, 1 + n * 0.6, () => {
          e.vul = 1.4;
          flash("Quill se queda sin tinta");
        });
        return 3.8;
      },
    },
    {
      n: "Lluvia de páginas",
      f: (e, c, k) => {
        for (let j = 0; j < 9; j++) later(e, j * 0.1, () => bt(e, Math.atan2(P.y - e.y, P.x - e.x) + (j - 4) * 0.09, 300, e.dmg * 0.4, (j - 4) * 0.12, "#f4f0d8"));
        return 2.3;
      },
    },
    {
      n: "Índice prohibido",
      f: (e, c, k) => {
        const v = Math.random() < 0.5;
        bz({ k: "beam", x: v ? P.x : 50, y: v ? 50 : P.y, a: v ? Math.PI / 2 : 0, len: v ? 520 : 880, w: 52, t: 1.1, life: 2.5, d: e.dmg * 0.8, c: "#7c8cff" });
        return 2.4;
      },
    },
    {
      n: "Tinta derramada",
      f: (e, c, k) => {
        for (let i = 0; i < 3; i++) bz({ k: "pool", x: cl(P.x + rnd(-120, 120), 100, 860), y: cl(P.y + rnd(-100, 100), 100, 500), r: 58, t: 0.8, life: 6, d: e.dmg * 0.3, c: "#1a1a4a" });
        return 2.2;
      },
    },
    {
      n: "Corrección",
      p: 1,
      f: (e, c, k) => {
        const ox = e.x,
          oy = e.y;
        tp(e, 260);
        bz({ k: "pool", x: ox, y: oy, r: 80, t: 0.8, d: e.dmg, c: k });
        brs(e, 8, 240, e.dmg * 0.4, 0, 0, "#f4f0d8");
        return 2.3;
      },
    },
  ],
  dw: (e, r, t, a, c, F) => {
    dPo([[-r * 0.55, r], [-r * 0.4, -r * 0.2], [r * 0.4, -r * 0.2], [r * 0.55, r]]); // toga
    dCi(0, -r * 0.55, r * 0.38);
    x.fillStyle = "#222";
    dEl(-r * 0.15, -r * 0.55, r * 0.14, r * 0.1, 0, 1); // gafas
    dEl(r * 0.15, -r * 0.55, r * 0.14, r * 0.1, 0, 1);
    dEy(-r * 0.15, -r * 0.55, 2, "#fff");
    dEy(r * 0.15, -r * 0.55, 2, "#fff");
    for (let i = 0; i < 3; i++) {
      // tomos que orbitan
      const q = t * 1.4 + i * 2.094,
        bx = Math.cos(q) * r * 1.5,
        by = Math.sin(q) * r * 1.5;
      x.save();
      x.translate(bx, by);
      x.rotate(q + 1.57);
      x.fillStyle = "#4a3a8a";
      dPo([[-8, -6], [8, -6], [8, 6], [-8, 6]]);
      x.fillStyle = "#f4f0d8";
      x.fillRect(-6, -4, 5, 8);
      x.fillRect(1, -4, 5, 8);
      x.restore();
    }
  },
});
