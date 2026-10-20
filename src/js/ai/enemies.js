/* ======================================================================
 * src/js/ai/enemies.js
 * IA y actualización de enemigos normales.
 *
 * Define:
 * EID, slots, upE, eshot
 * ====================================================================== */

let EID = 0;
// Agresividad ag (0..1 hasta d13): menos pausas (+60% cadencia), +25% velocidad, más ataques simultáneos. Desde d3 los cuerpo a cuerpo se reparten en un anillo alrededor del jugador (flanqueo).
function slots() {
  const m = E.filter(
      (q) => q.hp > 0 && q.al && q.sp <= 0 && q.t != "boss" && ET[q.t].ai == "melee",
    ),
    n = m.length;
  if (G.d < 3 || n < 2) {
    m.forEach((q) => (q.sl = null));
    return;
  }
  const k = G.d < 6 ? n >> 1 : n,
    a0 = Math.atan2(300 - P.y, 480 - P.x);
  m.sort((p, q) => p.id - q.id);
  m.forEach((q, i) => {
    if (i >= k) {
      q.sl = null;
      return;
    }
    const a = a0 + ((i + 0.5) * 2 * Math.PI) / k;
    q.sl = { x: cl(P.x + Math.cos(a) * 150, 90, 870), y: cl(P.y + Math.sin(a) * 150, 90, 510) };
  });
}
function upE(dt) {
  slots();
  const ag = Math.min(1, (G.d - 1) / 12);
  for (const e of E) {
    if (e.hp <= 0) continue;
    const T = ET[e.t];
    e.fl -= dt;
    e.cd -= dt * (1 + ag * 0.6);
    e.sh -= dt;
    e.tm += dt;
    if (e.sp > 0) {
      e.sp -= dt;
      continue;
    }
    for (const k of ["burn", "poison"]) {
      if (e.st[k] > 0) {
        e.st[k] -= dt;
        e.hp -= e.dot * dt;
        if (e.hp <= 0) {
          kill(e);
          break;
        }
      }
    }
    if (e.hp > 0 && e.st.bleed > 0) {
      e.st.bleed -= dt;
      e.hp -= e.bd * e.st.bleedN * dt;
      if (e.hp <= 0) kill(e);
    } else if (!(e.st.bleed > 0)) e.st.bleedN = 0;
    if (e.st.wet > 0) e.st.wet -= dt;
    for (const k of ["frac", "curse", "root"]) if (e.st[k] > 0) e.st[k] -= dt;
    if (e.hp > 0 && e.st.cor > 0) {
      e.hp -= e.cdm * e.st.cor * dt;
      e.st.cort -= dt;
      if (e.st.cort <= 0) {
        e.st.cor--;
        e.st.cort = 3;
      }
      if (e.hp <= 0) kill(e);
    }
    if (e.hp <= 0) continue;
    if (e.st.slow > 0) e.st.slow -= dt;
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    const dc = Math.pow(0.01, dt);
    e.vx *= dc;
    e.vy *= dc;
    if (e.st.stun > 0) {
      e.st.stun -= dt;
      col(e);
      continue;
    }
    const dx = P.x - e.x,
      dy = P.y - e.y,
      d = Math.hypot(dx, dy) || 1,
      nx = dx / d,
      ny = dy / d,
      sp = T.sp * (e.sx || 1) * (e.st.slow > 0 ? 0.5 : 1) * (1 + ag * 0.25),
      mv = (vx, vy) => {
        if (e.st.root > 0) return;
        e.x += vx * dt;
        e.y += vy * dt;
      },
      near = T.r + P.r;
    const strike = (rg, dm) => {
      if (e.wind > 0) {
        e.wind -= dt;
        if (e.wind <= 0 && dist(e, P) < rg + near) hurtP(dm, e);
        if (e.wind <= 0 && e.mod == "vampírico") e.hp = Math.min(e.mhp, e.hp + dm * 0.5);
      } else if (d > near + rg - 14) {
        if (e.sl && d > 150 && los(e, e.sl)) {
          const q = Math.hypot(e.sl.x - e.x, e.sl.y - e.y) || 1;
          mv(((e.sl.x - e.x) / q) * sp, ((e.sl.y - e.y) / q) * sp);
        } else mv(nx * sp, ny * sp);
      } else if (e.cd <= 0) {
        if (E.filter((q) => q.wind > 0).length < 3 + ((ag * 3) | 0)) {
          e.wind = 0.5;
          e.cd = 1.5;
        } else e.cd = 0.5;
      }
    };
    if (!e.al) {
      if ((d < 340 && los(e, P)) || e.hp < e.mhp || e.t == "boss") e.al = 1;
      else {
        e.wt = (e.wt || 0) - dt;
        if (e.wt <= 0) {
          e.wt = rnd(1, 2.5);
          e.wa = rnd(0, 6.28);
        }
        mv(Math.cos(e.wa) * sp * 0.4, Math.sin(e.wa) * sp * 0.4);
        col(e);
        continue;
      }
    }
    if (e.t != "boss" && e.t != "decoy" && e.al && !e.lu) {
      if (los(e, P)) {
        e.lk = { x: P.x, y: P.y };
        e.nl = 0;
        e.iw = 0;
      } else {
        e.nl = (e.nl || 0) + dt;
        if (e.nl > 1.5 && e.lk) {
          const q = Math.hypot(e.lk.x - e.x, e.lk.y - e.y);
          if (q > 20) mv(((e.lk.x - e.x) / q) * sp, ((e.lk.y - e.y) / q) * sp);
          else e.iw = (e.iw || 0) + dt;
          if (e.iw > 2.5) {
            e.al = 0;
            e.iw = 0;
            e.nl = 0;
            e.lk = null;
          }
          col(e);
          continue;
        }
      }
    }
    if ((T.ai == "flank" || T.ai == "range" || T.ai == "cast" || T.ai == "leap") && !e.lu) {
      e.dgt -= dt;
      if (!(e.dgt > 0)) {
        const p = PR.find(
          (p) =>
            p.f == "p" &&
            Math.hypot(p.x - e.x, p.y - e.y) < 150 &&
            (e.x - p.x) * p.vx + (e.y - p.y) * p.vy > 0,
        );
        if (p) {
          e.dgt = 2.2;
          const m = Math.hypot(p.vx, p.vy) || 1;
          e.vx += (-p.vy / m) * e.dir * 380;
          e.vy += (p.vx / m) * e.dir * 380;
        }
      }
    }
    if (e.lu > 0) {
      e.lu -= dt;
      mv(e.lvx, e.lvy);
      if (d < near + 4 && !e.lh) {
        e.lh = 1;
        hurtP(e.dmg, e);
      }
      if (e.lu <= 0 && !e.nr) e.st.stun = 0.5;
    } else
      switch (T.ai) {
        case "melee":
          strike(24, e.dmg);
          break;
        case "flank":
          if (d > 100) mv((nx * 0.7 - ny * e.dir * 0.7) * sp, (ny * 0.7 + nx * e.dir * 0.7) * sp);
          if (e.cd <= 0 && d < 240) {
            e.lu = 0.22;
            e.lh = 0;
            e.lvx = nx * 400;
            e.lvy = ny * 400;
            e.cd = 1.8;
          }
          break;
        case "range":
          if (d < 200) mv(-nx * sp, -ny * sp);
          else if (d > 320) mv(nx * sp, ny * sp);
          else mv(-ny * e.dir * sp * 0.6, nx * e.dir * sp * 0.6);
          if (e.cd <= 0 && los(e, P)) {
            e.cd = 1.9;
            eshot(e, nx, ny, 290, e.dmg);
          } else if (e.cd <= 0) mv(-ny * e.dir * sp, nx * e.dir * sp);
          break;
        case "cast":
          if (d < 230) mv(-nx * sp, -ny * sp);
          else if (d > 300) mv(nx * sp, ny * sp);
          if (e.cd <= 0 && los(e, P)) {
            e.cd = 2.7;
            Z.push({ x: P.x, y: P.y, r: 55, t: 0.9, m: 0.9, d: e.dmg, c: "#a6f" });
          }
          break;
        case "bomb":
          mv(nx * sp, ny * sp);
          if (d < 60) {
            e.fuse = (e.fuse || 0.6) - dt;
            if (e.fuse <= 0) {
              e.hp = 0;
              Z.push({ x: e.x, y: e.y, r: 75, t: 0.01, d: e.dmg, c: "#fa4" });
              e.dead = 1;
            }
          }
          break;
        case "sum":
          if (d < 220) mv(-nx * sp, -ny * sp);
          if (e.cd <= 0 && E.length < 18) {
            e.cd = 5;
            spawn("grunt", e.x + 20, e.y + 20);
          }
          break;
        case "shield": {
          const a = E.find((q) => q != e && q.hp > 0 && q.t != "guardian");
          if (a && dist(a, e) > 80)
            mv(((a.x - e.x) / dist(a, e)) * sp, ((a.y - e.y) / dist(a, e)) * sp);
          else if (d < 120) strike(24, e.dmg);
          if (e.cd <= 0) {
            e.cd = 3.5;
            for (const q of E) if (dist(q, e) < 170) q.sh = 3;
            FX.push({ k: "ring", x: e.x, y: e.y, r: 170, t: 0.4, m: 0.4, c: "#4a8" });
          }
          break;
        }
        case "leap":
          if (Math.abs(d - 220) > 30)
            mv(nx * sp * (d > 220 ? 1 : -1), ny * sp * (d > 220 ? 1 : -1));
          else mv(-ny * e.dir * sp, nx * e.dir * sp);
          if (e.cd <= 0 && d < 300) {
            e.lu = 0.35;
            e.lh = 0;
            e.lvx = nx * 520;
            e.lvy = ny * 520;
            e.cd = 2.5;
          }
          break;
        case "elite":
          strike(30, e.dmg);
          e.nv = (e.nv ?? 2) - dt;
          if (e.nv <= 0) {
            e.nv = 4;
            Z.push({ x: e.x, y: e.y, r: 115, t: 0.8, m: 0.8, d: e.dmg * 1.2, c: "#f44" });
          }
          break;
        case "boss": {
          e.imm -= dt;
          e.vul -= dt;
          e.sr -= dt;
          const ph = e.hp < e.mhp * 0.33 ? 2 : e.hp < e.mhp * 0.66 ? 1 : 0;
          if (e.ph1 !== ph) {
            if (e.ph1 !== undefined) bsnd(e.bi, "ph");
            e.ph1 = ph;
          }
          const cx = { d, nx, ny, mv, sp, a: Math.atan2(dy, dx), ph };
          guard(e, dt);
          schd(e, dt);
          BO[e.bi].up(e, dt, cx);
          if (e.bi < 12) xat(e, dt, cx);
          break;
        }
      }
    col(e);
    for (const q of E)
      if (q != e && q.hp > 0) {
        const ddx = e.x - q.x,
          ddy = e.y - q.y,
          dd = Math.hypot(ddx, ddy),
          m = e.r + q.r;
        if (dd < m && dd > 0) {
          e.x += (ddx / dd) * (m - dd) * 0.3;
          e.y += (ddy / dd) * (m - dd) * 0.3;
        }
      }
  }
  E = E.filter((e) => !e.dead && e.hp > 0);
}
function eshot(e, nx, ny, sp, d) {
  PR.push({ x: e.x, y: e.y, vx: nx * sp, vy: ny * sp, r: 5, d, l: 3, f: "e", c: "#cf6" });
}
