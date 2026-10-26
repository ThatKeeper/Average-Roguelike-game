/* ======================================================================
 * src/js/game/projectiles.js
 * Proyectiles (límite, actualización) y actualización de efectos varios.
 *
 * Define:
 * capPR, upPR, upMisc
 * ====================================================================== */

// Límite de proyectiles: enemigos 120 hasta d3 y luego baja 5 por nivel (mínimo 48); jugador 220 aparte. Al exceder se descartan los más antiguos del mismo bando.
function capPR() {
  const ec = G.d <= 3 ? 120 : Math.max(48, 120 - 5 * (G.d - 3));
  let ne = 0,
    np = 0;
  for (const p of PR) p.f == "e" ? ne++ : np++;
  if (ne > ec || np > 220) {
    let a = Math.max(0, ne - ec),
      b = Math.max(0, np - 220);
    PR = PR.filter((p) => (p.f == "e" ? !(a-- > 0) : !(b-- > 0)));
  }
}
function upPR(dt) {
  capPR();
  for (const p of PR) {
    if (p.cv) {
      const q = Math.atan2(p.vy, p.vx) + p.cv * dt,
        s = Math.hypot(p.vx, p.vy);
      p.vx = Math.cos(q) * s;
      p.vy = Math.sin(q) * s;
    }
    if (p.hm && p.f == "e") {
      const q0 = Math.atan2(p.vy, p.vx),
        q = q0 + cl(nrm(ang(p, P) - q0), -p.hm * dt, p.hm * dt),
        s = Math.hypot(p.vx, p.vy);
      p.vx = Math.cos(q) * s;
      p.vy = Math.sin(q) * s;
    }
    if (p.hm && p.f == "p") {
      // runas buscadoras: giran hacia el enemigo vivo más cercano
      let b = null,
        bd = 520;
      for (const q of E) if (q.hp > 0 && q.sp <= 0 && q.t != "decoy" && !p.h.has(q) && dist(p, q) < bd) ((bd = dist(p, q)), (b = q));
      if (b) {
        const q0 = Math.atan2(p.vy, p.vx),
          q = q0 + cl(nrm(ang(p, b) - q0), -p.hm * dt, p.hm * dt),
          s2 = Math.hypot(p.vx, p.vy);
        p.vx = Math.cos(q) * s2;
        p.vy = Math.sin(q) * s2;
      }
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.l -= dt;
    if (p.ret && !p.rt && p.l < p.l0 * 0.55) {
      p.rt = 1;
      p.h = new Set();
    }
    if (p.rt) {
      const a = ang(p, P);
      p.vx = Math.cos(a) * p.s;
      p.vy = Math.sin(a) * p.s;
      if (dist(p, P) < 20) p.l = 0;
    }
    if (p.x < RB.x0 || p.x > RB.x1 || p.y < RB.y0 || p.y > RB.y1) {
      if (p.bn > 0) {
        p.bn--;
        if (p.x < RB.x0 || p.x > RB.x1) p.vx *= -1;
        else p.vy *= -1;
        p.x = cl(p.x, RB.x0, RB.x1);
        p.y = cl(p.y, RB.y0, RB.y1);
      } else p.l = 0;
    }
    for (const b of RM_.obs)
      if (!b.pit && p.x > b.x && p.x < b.x + b.w && p.y > b.y && p.y < b.y + b.h) {
        if (p.ex && !p.xd) area(p.x, p.y, p.ex, p.d * 0.8, p.t, { fx: p.fx });
        p.xd = 1;
        p.l = 0;
      }
    if (p.f == "p") {
      if (p.l <= 0) continue;
      for (const e of E) {
        if (e.sp > 0 || e.hp <= 0 || p.h.has(e) || dist(p, e) > e.r + p.r) continue;
        p.h.add(e);
        if (p.sf) spHit(e, p.sf, p.x, p.y);
        else hit(e, p.d, p.t, { kb: 60, a: Math.atan2(p.vy, p.vx), fx: p.fx, ch: p.ch });
        if (p.ex) {
          area(p.x, p.y, p.ex, p.d * 0.8, p.t, { fx: p.fx });
          p.xd = 1;
        }
        if (p.ch) chain(e, p.d * 0.6, p.ch);
        if (p.pc-- <= 0) {
          p.l = 0;
          break;
        }
      }
    } else if (dist(p, P) < P.r + p.r) {
      if (P.g && P.gt < 0.22 && !(P.pcd > 0) && !p.rf) parryProj(p);
      else {
        hurtP(p.d);
        p.l = 0;
      }
    }
  }
  // proyectiles que estallan al acabar su recorrido (frasco corrosivo)
  for (const p of PR) if (p.eol && p.l <= 0 && !p.xd && p.ex) ((p.xd = 1), area(p.x, p.y, p.ex, p.d * 0.8, p.t, { fx: p.fx }));
  PR = PR.filter((p) => p.l > 0);
}
function upMisc(dt) {
  if (G.train) trainTick(dt);
  if (G.st == "play") {
    if (SBH.length) sbhTick(dt);
    sqTick(dt);
  }
  if (G.intro) G.intro.t -= dt;
  if (G.ban) G.ban[1] -= dt;
  const fm = LOW ? 120 : 250;
  if (FX.length > fm) FX.splice(0, FX.length - fm);
  for (const z of Z) {
    z.t -= dt;
    if (z.t <= 0) {
      FX.push({ k: "ring", x: z.x, y: z.y, r: z.r, t: 0.25, m: 0.25, c: z.c });
      if (dist(z, P) < z.r + P.r) hurtP(z.d);
    }
  }
  Z = Z.filter((z) => z.t > 0);
  for (const f of FX) {
    f.t -= dt;
    if (f.k == "p" || f.k == "star") {
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.g) f.vy += f.g * dt;
    }
  }
  FX = FX.filter((f) => f.t > 0);
  for (const n of NM) {
    n.l -= dt;
    n.y -= 40 * dt;
  }
  NM = NM.filter((n) => n.l > 0);
  for (const o of O) {
    const d = dist(o, P);
    if (o.hold > 0) o.hold -= dt; // objeto soltado o con mochila llena: no se recoge hasta que pase el tiempo
    if (d < 100 * (1 + 0.1 * U("mag")) && !(o.hold > 0)) {
      o.x += (P.x - o.x) * dt * 6;
      o.y += (P.y - o.y) * dt * 6;
    }
    if (d < 20 && !(o.hold > 0)) {
      if (o.k == "i" && !bagAdd(o.it)) {
        o.hold = 2.5;
        flash("Mochila llena (I)");
        continue;
      }
      o.got = 1;
      if (o.k == "g") P.gold += o.v;
      else if (o.k == "i") {
        flash("Recoges: " + o.it.n + " (I)");
        lootSnd(o.it.r);
        lootFX(o.x, o.y, o.it.r);
      } else P.hp = Math.min(P.mhp, P.hp + P.mhp * o.v);
      snd(900, 0.05, "triangle", 0.03);
    }
  }
  RM_.O = O = O.filter((o) => !o.got);
  const r = RM_;
  if (!r.cl && r.st && E.length == 0) {
    if (r.wv > 1) {
      r.wv--;
      wave(r);
    } else {
      r.cl = 1;
      if (!G.hurt) {
        cnt("fl");
        if (r.tp == "elite") cnt("fe");
        if (r.tp == "boss") cnt("fbs");
      }
      chk();
      flash(r.tp == "boss" ? "¡Jefe derrotado! Pulsa F en el portal" : "Sala despejada");
      for (let i = 0; i < 3; i++)
        O.push({ x: 480 + rnd(-40, 40), y: 300 + rnd(-40, 40), k: "g", v: Math.ceil(G.d * 3) });
      if (r.tp == "elite") O.push({ x: 480, y: 300, k: "h", v: 0.1 });
    }
  }
  for (const h of RM_.hz || [])
    if (dist(h, P) < h.r) {
      const q = (G.d - 1) % 8;
      if (q == 6) P.slow = 0.3;
      else {
        P.hp -= (q == 5 ? 7 : 3) * dt * (1 - (P.res[q == 5 ? "fire" : "poison"] || 0));
        if (P.hp <= 0) die();
      }
    }
  msg[1] -= dt;
  shake *= Math.pow(0.01, dt);
}

