/* ======================================================================
 * src/js/bosses/boss-catalog.js
 * Catálogo BO: comportamiento propio de los 7 jefes normales y 5 finales originales.
 *
 * Define:
 * BO
 * ====================================================================== */

const BO = [
  {
    up: (e, dt, c) => {
      e.t1 -= dt;
      if (e.wd > 0) {
        e.wd -= dt;
        if (e.fk && P.dash && e.wd > 0.1) e.wd = 0.05;
        if (e.wd <= 0) {
          if (e.fk) {
            e.fk = 0;
            e.wd = 0.35;
            ring(e, 40, "#fff");
            return;
          }
          dsh(e, 0.2, 560 + c.ph * 60);
          e.wl = 1;
        }
        return;
      }
      if (e.wl && !e.lu) {
        e.wl = 0;
        if (e.cmb > 0) {
          e.cmb--;
          e.wd = 0.28;
        } else {
          e.st.stun = 1.1;
          e.vul = 1.1;
        }
        return;
      }
      if (c.d > 110) c.mv(c.nx * c.sp, c.ny * c.sp);
      if (e.t1 <= 0) {
        e.t1 = 2.2 - c.ph * 0.4;
        e.cmb = 2 + c.ph;
        e.fk = Math.random() < 0.45;
        e.wd = 0.55;
      }
    },
  },
  {
    up: (e, dt, c) => {
      e.t1 -= dt;
      if (e.wl && !e.lu) {
        e.wl = 0;
        const w = e.x < e.r + 58 || e.x > 902 - e.r || e.y < e.r + 58 || e.y > 542 - e.r;
        RM_.obs = RM_.obs.filter(
          (b) => b.pit || Math.hypot(b.x + b.w / 2 - e.x, b.y + b.h / 2 - e.y) > 140,
        );
        shake = 14;
        if (w) {
          e.st.stun = 2.4;
          e.vul = 2.4;
          flash("\u00a1Gorgrim se estrella! Ataca ahora");
        } else e.st.stun = 0.8;
        return;
      }
      if (e.wd > 0) {
        e.wd -= dt;
        if (e.wd <= 0) {
          if (e.md) {
            dsh(e, 0.9, 430);
            e.wl = 1;
          } else {
            tz(e.x, e.y, 115, 0.2, e.dmg * 1.3, "#f84");
            tz(e.x, e.y, 205, 0.55, e.dmg, "#fa6");
            if (c.ph > 0)
              for (let i = 0; i < 4; i++) tz(rnd(100, 860), rnd(100, 500), 55, 1.1, e.dmg, "#f84");
          }
        }
        return;
      }
      if (c.d > 100) c.mv(c.nx * c.sp, c.ny * c.sp);
      if (e.t1 <= 0) {
        e.t1 = 3.2 - c.ph * 0.5;
        e.md = Math.random() < 0.45;
        e.wd = e.md ? 0.8 : 1;
      }
    },
  },
  {
    up: (e, dt, c) => {
      e.t1 -= dt;
      if (e.vul > 0) return;
      const d = c.d;
      if (d < 260) c.mv(-c.nx * c.sp * 1.3, -c.ny * c.sp * 1.3);
      else if (d > 340) c.mv(c.nx * c.sp, c.ny * c.sp);
      else c.mv(-c.ny * c.sp * 0.8, c.nx * c.sp * 0.8);
      if (e.t1 <= 0) {
        const k = rk(e, 4);
        e.t1 = 1.5 - c.ph * 0.25;
        if (k == 1)
          for (let i = -2; i <= 2; i++) bt(e, c.a + i * 0.16, 300, e.dmg * 0.6, i * 0.5, "#9cf");
        else if (k == 2) brs(e, 10 + c.ph * 4, 200, e.dmg * 0.5, e.tm, 0.6, "#9cf");
        else if (k == 3) {
          bt(e, c.a, 520, e.dmg, 0, "#fff");
          bt(e, c.a + 0.08, 520, e.dmg, 0, "#fff");
        } else {
          e.vul = 1.8;
          e.t1 = 1.8;
          flash("Sylra recarga");
        }
      }
    },
  },
  {
    up: (e, dt, c) => {
      if (!e.dc) e.dc = [];
      e.dc = e.dc.filter((q) => q.hp > 0 && !q.dead);
      e.t1 -= dt;
      e.t2 = (e.t2 || 5) - dt;
      e.t3 = (e.t3 || 3) - dt;
      if (e.t3 <= 0 && e.dc.length < 2 + c.ph) {
        e.t3 = 3;
        const q = spawn("decoy", e.x + rnd(-150, 150), e.y + rnd(-60, 100));
        q.sp = 0;
        q.al = 1;
        q.bi = e.bi;
        q.r = e.r;
        q.hp = q.mhp = 1;
        e.dc.push(q);
      }
      for (const q of e.dc) {
        q.tm += dt;
        q.x += Math.cos(q.tm * 0.7 + q.y) * 40 * dt;
        q.y += Math.sin(q.tm * 0.7 + q.x) * 30 * dt;
        col(q);
      }
      c.mv(-c.ny * c.sp * e.dir, c.nx * c.sp * e.dir);
      if (e.t2 <= 0 && e.dc.length) {
        e.t2 = 6;
        const q = pick(e.dc),
          x0 = e.x,
          y0 = e.y;
        e.x = q.x;
        e.y = q.y;
        q.x = x0;
        q.y = y0;
        ring(e, 60, "#fff");
        ring(q, 60, "#fff");
      }
      if (e.t1 <= 0) {
        e.t1 = 2 - c.ph * 0.3;
        for (const q of [e, ...e.dc])
          bt(q, Math.atan2(P.y - q.y, P.x - q.x), 260, e.dmg * 0.7, 0, "#ddd");
      }
    },
  },
  {
    up: (e, dt, c) => {
      e.t1 -= dt;
      if (e.vul > 0) return;
      if (e.t1 <= 0) {
        const k = rk(e, 3);
        e.t1 = 3.2 - c.ph * 0.4;
        if (k == 1) {
          for (let i = -3; i <= 3; i++) tz(P.x + i * 70, P.y, 45, 1.6, e.dmg, "#c6f");
          for (let i = -3; i <= 3; i++)
            if (i) tz(P.x, P.y + i * 70, 45, 1.6 + Math.abs(i) * 0.05, e.dmg, "#c6f");
        } else if (k == 2) {
          for (let i = 1; i <= 9; i++)
            tz(
              e.x + Math.cos(c.a) * i * 70,
              e.y + Math.sin(c.a) * i * 70,
              42,
              0.8 + i * 0.12,
              e.dmg,
              "#fc6",
            );
        } else {
          for (let i = 0; i < 5 + c.ph * 2; i++)
            tz(rnd(90, 870), rnd(90, 510), 60, 2.2, e.dmg * 1.2, "#f6a");
          e.vul = 2;
          e.t1 = 2.4;
          flash("Veyra rearma sus trampas: \u00a1es vulnerable!");
        }
        tp(e, 260);
      }
    },
  },
  {
    up: (e, dt, c) => {
      e.t1 -= dt;
      if (!e.tf && e.hp < e.mhp * 0.5) {
        e.tf = 1;
        e.imm = 1;
        e.col = "#6cf";
        shake = 16;
        ring(e, 150, "#6cf");
        ring(e, 90, "#fff");
        flash("\u00a1Nyx cambia de forma!");
        e.cmb = 0;
        e.wd = 0;
      }
      if (!e.tf) {
        if (e.wd > 0) {
          e.wd -= dt;
          if (e.wd <= 0) {
            dsh(e, 0.25, 500);
            e.wl = 1;
          }
          return;
        }
        if (e.wl && !e.lu) {
          e.wl = 0;
          if (e.cmb-- > 1) e.wd = 0.25;
          else e.st.stun = 0.9;
          return;
        }
        if (c.d > 70) c.mv(c.nx * c.sp * 1.5, c.ny * c.sp * 1.5);
        if (e.t1 <= 0) {
          e.t1 = 1.8;
          e.cmb = 3;
          e.wd = 0.4;
        }
      } else if (e.t1 <= 0) {
        e.t1 = 1.5;
        const k = (e.k = (e.k || 0) + 1);
        tp(e, 280);
        if (k % 2)
          for (let i = 0; i < 7; i++)
            bt(
              e,
              Math.atan2(P.y - e.y, P.x - e.x) + (i - 3) * 0.2,
              280,
              e.dmg * 0.6,
              (i - 3) * 0.4,
              "#6cf",
            );
        else tz(P.x, P.y, 70, 0.9, e.dmg, "#6cf");
      }
    },
  },
  {
    up: (e, dt, c) => {
      e.t1 -= dt;
      e.t3 = (e.t3 || 8) - dt;
      if (!e.orb) e.orb = [];
      const vivos = e.orb.some((q) => q.hp > 0 && !q.dead);
      if (!vivos && !(e.vul > 0)) {
        if (e.orb.length && !e.rs) {
          e.rs = 1;
          e.vul = 5;
          flash("\u00a1Zeth queda expuesto!");
        } else {
          e.rs = 0;
          e.orb = [];
          for (let i = 0; i < 3; i++) {
            const q = spawn("orb", e.x, e.y);
            q.sp = 0;
            q.al = 1;
            q.hp = q.mhp = 40 * hpM();
            q.oi = i;
            e.orb.push(q);
          }
        }
      }
      e.imm = vivos ? 1 : 0;
      e.orb.forEach((q) => {
        const a = e.tm * 1.6 + q.oi * 2.094;
        q.x = e.x + Math.cos(a) * 70;
        q.y = e.y + Math.sin(a) * 70;
      });
      if (c.d > 150) c.mv(c.nx * c.sp, c.ny * c.sp);
      if (e.t3 <= 0) {
        e.t3 = 12;
        e.warn = 1.2;
        flash("\u00a1Zeth va a invertir tus controles!");
      }
      if (e.warn > 0) {
        e.warn -= dt;
        if (e.warn <= 0) P.invc = 4;
      }
      if (e.wd > 0) {
        e.wd -= dt;
        if (e.wd <= 0) dsh(e, 0.25, 520);
      }
      if (e.t1 <= 0) {
        e.t1 = 2.1 - c.ph * 0.3;
        const k = rk(e, 3);
        if (k == 0) brs(e, 12, 230, e.dmg * 0.6, e.tm);
        else if (k == 1) e.wd = 0.5;
        else
          for (let i = 0; i < 3 + c.ph; i++)
            tz(P.x + rnd(-90, 90), P.y + rnd(-90, 90), 55, 1, e.dmg, "#a4f");
      }
    },
  },
  // ---- FINALES ----
  {
    up: (e, dt, c) => {
      e.t1 -= dt;
      e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
      if (e.ph0 !== c.ph) {
        e.ph0 = c.ph;
        for (let i = 0; i < 3 + c.ph * 2; i++) {
          const q = spawn("grunt", e.x + rnd(-120, 120), e.y + rnd(40, 140));
          q.minion = 1; // invocado: sin oro ni XP
          q.al = 1;
          q.sp = 0.4;
          e.mn.push(q);
        }
        ring(e, 160, "#dcb");
        flash("\u00a1El Soberano alza a sus huestes!");
      }
      e.imm = e.mn.length ? 1 : 0;
      if (c.d > 120) c.mv(c.nx * c.sp, c.ny * c.sp);
      if (e.wd > 0) {
        e.wd -= dt;
        if (e.wd <= 0) dsh(e, 0.3, 480);
      }
      if (e.t1 <= 0) {
        e.t1 = 2.4 - c.ph * 0.3;
        const k = rk(e, 3);
        if (k == 0) brs(e, 14 + c.ph * 6, 210, e.dmg * 0.6, e.tm, 0.4, "#dcb");
        else if (k == 1 && c.ph > 0) e.wd = 0.6;
        else if (c.ph == 2) {
          const s1 = { x: rnd(120, 840), y: rnd(120, 480) },
            s2 = { x: rnd(120, 840), y: rnd(120, 480) };
          for (let X = 100; X < 870; X += 100)
            for (let Y = 100; Y < 520; Y += 100)
              if (Math.hypot(X - s1.x, Y - s1.y) > 115 && Math.hypot(X - s2.x, Y - s2.y) > 115)
                tz(X, Y, 60, 1.5, e.dmg, "#cba");
          flash("\u00a1El suelo cede! Busca un refugio");
        } else brs(e, 10, 250, e.dmg * 0.6, -e.tm, 0, "#dcb");
      }
    },
  },
  {
    up: (e, dt, c) => {
      e.t1 -= dt;
      if (e.vt > 0) {
        e.vt -= dt;
        if (e.vt <= 0) {
          e.vul = 2.2;
          flash("Fulgor se descarga: \u00a1ataca!");
        }
      }
      if (e.vul > 0) return;
      if (e.t1 <= 0) {
        const k = rk(e, 3);
        e.t1 = 2.8 - c.ph * 0.3;
        if (k == 1 || (k == 2 && c.ph > 0)) {
          const g = (Math.random() * 4) | 0,
            g2 = (Math.random() * 4) | 0,
            hz = k == 1;
          for (let i = 0; i < 4; i++) {
            if (i == g && hz) continue;
            for (let j = 0; j < 9; j++) tz(100 + j * 95, 130 + i * 110, 50, 1.4, e.dmg, "#fe6");
          }
          if (c.ph > 0)
            for (let i = 0; i < 4; i++) {
              if (i == g2) continue;
              for (let j = 0; j < 5; j++) tz(150 + i * 210, 110 + j * 95, 50, 1.4, e.dmg, "#fe6");
            }
          e.vt = 2.2;
        } else if (k == 2) brs(e, 8, 320, e.dmg * 0.6, 0, 0, "#fe6");
        else {
          tp(e, 240);
          tz(e.x, e.y, 130, 0.9, e.dmg * 1.2, "#fe6");
          for (let i = -1; i <= 1; i++)
            bt(e, Math.atan2(P.y - e.y, P.x - e.x) + i * 0.15, 420, e.dmg * 0.7, 0, "#fe6");
        }
      }
    },
  },
  {
    up: (e, dt, c) => {
      G.dk = [270, 215, 165][c.ph];
      e.t1 -= dt;
      if (e.vul > 0) return;
      c.mv(-c.ny * c.sp * e.dir, c.nx * c.sp * e.dir);
      if (e.t1 <= 0) {
        const k = rk(e, 3);
        e.t1 = 2.4 - c.ph * 0.3;
        if (k == 1)
          for (let i = 0; i < 4 + c.ph * 2; i++)
            bt(e, i * 1.57 + i, 140, e.dmg * 0.8, 0, "#a4f", 1.1);
        else if (k == 2) {
          tp(e, 300);
          tz(P.x, P.y, 80, 1, e.dmg, "#a4f");
        } else {
          e.vul = 2.4;
          e.t1 = 2.4;
          flash("Noctis devora la luz... \u00a1ataca!");
        }
      }
    },
  },
  {
    up: (e, dt, c) => {
      e.t1 -= dt;
      e.rc = e.rc || [];
      e.t4 = (e.t4 || 0.3) - dt;
      if (e.t4 <= 0) {
        e.t4 = 0.3;
        e.rc.push({ x: P.x, y: P.y });
        if (e.rc.length > 9) e.rc.shift();
      }
      e.t2 = (e.t2 || 9) - dt;
      if (e.ch > 0) {
        e.ch -= dt;
        if (e.ch <= 0) {
          if (e.hl0 - e.hp < e.mhp * 0.04) {
            e.hp = Math.min(e.mhp, e.hp + e.mhp * 0.08);
            flash("\u00a1Cronos retrocede el tiempo!");
          } else {
            e.st.stun = 1.6;
            e.vul = 1.6;
            flash("\u00a1Rebobinado interrumpido!");
          }
        }
        return;
      }
      if (c.d > 150) c.mv(c.nx * c.sp, c.ny * c.sp);
      if (e.t2 <= 0) {
        e.t2 = 10 - c.ph * 1.5;
        e.ch = 2.2;
        e.hl0 = e.hp;
        flash("Cronos rebobina: \u00a1interr\u00fampelo con da\u00f1o!");
        ring(e, 100, "#8cf");
      }
      if (e.t1 <= 0) {
        const k = rk(e, 3);
        e.t1 = 1.3 - c.ph * 0.2;
        const o = e.rc[0];
        if (o) tz(o.x, o.y, 64, 0.9, e.dmg, "#8cf");
        if (k == 0) brs(e, 10, 220, e.dmg * 0.6, e.tm, 0, "#8cf");
        if (c.ph > 0 && k == 1) tz(P.x, P.y, 50, 0.7, e.dmg, "#8cf");
      }
    },
  },
  {
    up: (e, dt, c) => {
      e.t1 -= dt;
      e.t2 = (e.t2 || 10) - dt;
      const s = P.w.s;
      if (c.ph >= 1) {
        if (!e.orb) e.orb = [];
        e.orb = e.orb.filter((q) => q.hp > 0 && !q.dead);
        if (!e.o2 && c.ph >= 1) {
          e.o2 = 1;
          for (let i = 0; i < 2; i++) {
            const q = spawn("orb", e.x, e.y);
            q.sp = 0;
            q.al = 1;
            q.hp = q.mhp = 60 * hpM();
            q.oi = i;
            e.orb.push(q);
          }
        }
        e.orb.forEach((q) => {
          const a = e.tm * 1.8 + q.oi * 3.14;
          q.x = e.x + Math.cos(a) * 75;
          q.y = e.y + Math.sin(a) * 75;
        });
        e.imm = e.orb.length ? 1 : 0;
      }
      if (c.ph == 2 && e.t2 <= 0) {
        e.t2 = 11;
        P.invc = 3;
        flash("\u00a1El Vac\u00edo invierte tu mundo!");
      }
      if (e.wd > 0) {
        e.wd -= dt;
        if (e.wd <= 0) dsh(e, 0.25, 540);
      }
      if (s == "r" && c.d < 240) c.mv(-c.nx * c.sp, -c.ny * c.sp);
      else if (c.d > 130 && !(e.wd > 0)) c.mv(c.nx * c.sp, c.ny * c.sp);
      if (e.t1 <= 0) {
        e.t1 = 1.9 - c.ph * 0.3;
        e.k = (e.k || 0) + 1;
        if (s == "m") {
          if (e.k % 2) e.wd = 0.5;
          else tz(e.x, e.y, 150, 0.8, e.dmg, "#99c");
        } else if (s == "r") {
          for (let i = 0; i < 5; i++) bt(e, c.a + (i - 2) * 0.05, 520, e.dmg * 0.6, 0, "#99c");
        } else {
          for (let i = 0; i < 3; i++)
            tz(P.x + rnd(-100, 100), P.y + rnd(-100, 100), 60, 0.9, e.dmg, "#99c");
          bt(e, c.a, 200, e.dmg * 0.7, 0, "#99c", 1.5);
        }
      }
    },
  },
];
