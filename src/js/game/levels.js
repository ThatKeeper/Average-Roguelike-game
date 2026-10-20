/* ======================================================================
 * src/js/game/levels.js
 * Generación de niveles/salas, entrada a salas, aparición de enemigos y oleadas.
 *
 * Define:
 * doorVis, genLevel, enter, spawn, wave
 * ====================================================================== */

// doorVis: una puerta se dibuja siempre salvo la de una sala secreta aun no descubierta (mecanica intencional)
function doorVis(r, k) {
  const n = G.R[r.nb[k]];
  return !(n.sec && !G.seen[r.nb[k]]);
}
function genLevel() {
  const d = G.d,
    rng = rngS(G.seed + d * 7919),
    n = S.hard ? Math.min(10 + (d >> 1), 20) : Math.min(5 + (d >> 1), 12),
    R = [{ gx: 0, gy: 0, nb: {}, tp: "start", cl: 1, dist: 0 }],
    mp = { "0,0": 0 };
  while (R.length < n) {
    const b = R[(rng() * R.length) | 0],
      di = (rng() * 4) | 0,
      gx = b.gx + DIR[di][0],
      gy = b.gy + DIR[di][1],
      k = gx + "," + gy;
    if (mp[k] !== undefined) continue;
    mp[k] = R.length;
    const r = { gx, gy, nb: {}, dist: b.dist + 1 };
    r.nb[(di + 2) % 4] = R.indexOf(b);
    b.nb[di] = R.length;
    R.push(r);
  }
  if (S.hard)
    for (const a of R)
      for (let di = 0; di < 4; di++) {
        if (a.nb[di] !== undefined) continue;
        const j = mp[a.gx + DIR[di][0] + "," + (a.gy + DIR[di][1])];
        if (j !== undefined && rng() < 0.3 && R[j].nb[(di + 2) % 4] === undefined) {
          a.nb[di] = j;
          R[j].nb[(di + 2) % 4] = R.indexOf(a);
        }
      }
  let bi = 1;
  R.forEach((r, i) => {
    if (r.dist > R[bi].dist) bi = i;
  });
  R.forEach((r, i) => {
    if (i == 0) {
      r.obs = [];
      r.hz = [];
      r.wv = 1;
      return;
    }
    const q = rng();
    r.tp =
      i == bi
        ? "boss"
        : q < 0.5
          ? "combat"
          : q < 0.62 && d > 1
            ? "elite"
            : q < 0.74
              ? "treasure"
              : q < 0.82
                ? "shrine"
                : q < 0.88
                  ? "shop"
                  : q < 0.95
                    ? "event"
                    : "combat";
    r.cl = !["combat", "elite", "boss"].includes(r.tp);
    r.wv = d >= 3 && i != bi ? 2 : 1;
    const o = [],
      rr = rngS(G.seed + d * 7919 + i * 131),
      k = r.tp == "boss" ? 2 : 2 + ((rr() * (S.hard ? 7 : 5)) | 0);
    for (let j = 0; j < k; j++) {
      const t = rr(),
        w = t < 0.5 ? 40 : t < 0.8 ? 30 : 110,
        h = t < 0.5 ? 40 : t < 0.8 ? 110 : 30,
        ox = 90 + rr() * (780 - w),
        oy = 90 + rr() * (420 - h);
      if ((ox + w > 400 && ox < 560) || (oy + h > 240 && oy < 360)) continue;
      o.push({ x: ox, y: oy, w, h });
    }
    r.obs = o;
    r.hz = [];
    if ([3, 5, 6, 7].includes((d - 1) % 8))
      for (let j = 0; j < 2; j++)
        r.hz.push({ x: 150 + rr() * 660, y: 120 + rr() * 360, r: 40 + rr() * 30 });
  });
  if (!R.some((r) => r.tp == "treasure")) {
    const r = R.find((q, i) => i && i != bi);
    r.tp = "treasure";
    r.cl = 1;
  }
  const sr = R.find(
    (q, i) => i && i != bi && q.tp == "combat" && q.dist > 1 && Object.keys(q.nb).length == 1,
  );
  if (sr && d >= 2) {
    sr.sec = 1;
    sr.tp = "treasure";
    sr.cl = 1;
  }
  const sr2 =
    S.hard &&
    R.find(
      (q, i) =>
        i && i != bi && q != sr && q.tp == "combat" && q.dist > 1 && Object.keys(q.nb).length == 1,
    );
  if (sr2 && d >= 2) {
    sr2.sec = 1;
    sr2.tp = "treasure";
    sr2.cl = 1;
  }
  G.R = R;
  G.seen = { 0: 1 };
  G.bi = BI[(d - 1) % 8];
}
function enter(i, from) {
  G.cur = i;
  G.hurt = 0;
  const r = G.R[i];
  RM_ = r;
  G.seen[i] = 1;
  E = [];
  PR = [];
  Z = [];
  TR = [];
  ZN = [];
  O = r.O || (r.O = []);
  const pos = [
    [480, 80],
    [880, 300],
    [480, 520],
    [80, 300],
  ];
  if (from < 4) {
    P.x = pos[from][0];
    P.y = pos[from][1];
  } else {
    P.x = 480;
    P.y = 300;
  }
  for (const k in r.nb) if (!G.R[r.nb[k]].sec) G.seen[r.nb[k]] = 1;
  if (!r.cl && !r.st) {
    r.st = 1;
    wave(r);
  } else if (!r.cl && r.st) {
    wave(r);
  }
}
function spawn(t, x0, y0, mod) {
  const T = ET[t];
  let px, py;
  for (let i = 0; i < 25; i++) {
    px = x0 ?? rnd(100, 860);
    py = y0 ?? rnd(100, 500);
    if (
      dist({ x: px, y: py }, P) > 230 &&
      !RM_.obs.some(
        (b) => px > b.x - 20 && px < b.x + b.w + 20 && py > b.y - 20 && py < b.y + b.h + 20,
      )
    )
      break;
  }
  const hm = hpM() * adH() * (t == "boss" ? 1 + G.d * 0.1 : 1);
  const e = {
    id: ++EID,
    t,
    x: px,
    y: py,
    r: T.r,
    hp: T.hp * hm,
    mhp: T.hp * hm,
    dmg: T.dm * dmM() * adD(),
    vx: 0,
    vy: 0,
    st: {},
    cd: rnd(0.8, 2),
    sp: 0.8,
    wind: 0,
    lu: 0,
    dir: Math.random() < 0.5 ? 1 : -1,
    sh: 0,
    fl: 0,
    dot: 0,
    mod,
    fz: 0,
    ph: 0,
    tm: 0,
  };
  {
    const v = BV[(G.d - 1) % 8];
    e.hp = e.mhp *= v[1];
    e.sx = (e.sx || 1) * v[2];
    e.vn = v[0];
  }
  if (mod == "veloz") e.sx = 1.4;
  if (mod == "blindado") e.hp = e.mhp *= 1.4;
  E.push(e);
  return e;
}
function wave(r) {
  const d = G.d;
  if (r.tp == "boss" && !r.bs) {
    r.bs = 1;
    spawnBoss();
    return;
  }
  const n = Math.min(
      S.hard ? 18 : 14,
      3 + (S.hard ? 2 : 0) + Math.floor(Math.sqrt(d) * 2) + ((Math.random() * 3) | 0),
    ),
    pool = ["grunt", "runner", "archer"];
  if (d > 1) pool.push("mage", "tank");
  if (d > 2) pool.push("bomber", "guardian");
  if (d > 3) pool.push("summoner", "stalker");
  const bf = ["grunt", "summoner", "bomber", "stalker", "mage", "bomber", "tank", "summoner"][
    (d - 1) % 8
  ];
  pool.push(bf, bf);
  if (r.tp == "elite" && r.wv == (d >= 3 ? 2 : 1))
    spawn(
      "elite",
      undefined,
      undefined,
      d > 2 ? pick(["veloz", "blindado", "vampírico", "explosivo"]) : 0,
    );
  for (let i = 0; i < n; i++)
    spawn(
      pick(pool),
      undefined,
      undefined,
      Math.random() < Math.min(0.45, 0.035 * d)
        ? pick(["veloz", "blindado", "vampírico", "explosivo"])
        : 0,
    );
}
