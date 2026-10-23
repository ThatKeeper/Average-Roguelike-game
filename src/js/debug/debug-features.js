/* ======================================================================
 * src/js/debug/debug-features.js
 * Herramientas del panel de debug. Añade aquí las nuevas pruebas con dbgAdd().
 *
 * Define: (solo registra botones)
 * ====================================================================== */

const dbgBoss = () => E.find((e) => e.t == "boss" && e.hp > 0);
const dbgNeedBoss = (fn) => () => {
  const b = dbgBoss();
  if (!b) return flash("No hay jefe: invoca uno primero");
  fn(b);
};
const dbgGive = (r) => {
  const pool = IT.filter((i) => (i.r || 0) == r),
    it = Object.assign({}, pool.length ? pick(pool) : pickIT(), { id: Date.now() + Math.random() });
  O.push({ x: P.x + 40, y: P.y, k: "i", it });
};

// ---------------- Jugador ----------------
dbgAdd("Jugador", "Subir de nivel", () => xp(P.nx));
dbgAdd("Jugador", "+500 oro", () => (P.gold += 500));
dbgAdd("Jugador", "Curar vida y maná", () => {
  P.hp = P.mhp;
  P.mp = P.mmp;
});
dbgAdd("Jugador", "Invulnerable", null, { toggle: "god" });
dbgAdd("Jugador", "Maná infinito", null, { toggle: "mana" });
dbgAdd("Jugador", "Reiniciar enfriamientos", () => {
  P.cd = P.cd.map(() => 0);
  P.dcd = 0;
  P.acd = 0;
});
dbgAdd("Jugador", "Enfriamientos a 8 s", () => {
  P.cd = Array.from({ length: 8 }, () => 8);
  P.dcd = 8;
});
dbgAdd("Jugador", "Velocidad del juego", () => (DBG.ts = { 1: 0.5, 0.5: 0.25, 0.25: 2, 2: 1 }[DBG.ts] || 1), { toggle: "ts" });

// ---------------- Armas ----------------
WP.forEach((w, i) =>
  dbgAdd("Armas (equipar)", w.n, () => {
    P.w = mk(i, 1);
    ST();
    P.am = undefined;
    P.rl = 0;
  }),
);

// ---------------- Objetos y botín ----------------
["Común", "Raro", "Épico", "Legendario"].forEach((n, r) => dbgAdd("Objetos y botín", "Soltar objeto " + n, () => dbgGive(r)));
dbgAdd("Objetos y botín", "Sonido épico", () => lootSnd(2));
dbgAdd("Objetos y botín", "Sonido legendario", () => lootSnd(3));
dbgAdd("Objetos y botín", "Abrir cofre", () => {
  chestFX(480, 300);
  show("<h2>Cofre antiguo</h2><p>Elige un tesoro</p>", loot2(3));
});
dbgAdd("Objetos y botín", "Elegir: épico y legendario", () => {
  const card = (it) =>
    Object.assign({}, it, { tp: it.tp || SLOT[it.s], cp: it.s ? cmp(it) : "", f: () => it.s && giveItem(Object.assign({}, it, { id: Date.now() + Math.random() })) });
  const itm = (r) => card(pick(IT.filter((i) => (i.r || 0) == r)) || pickIT()),
    wpn = (r) => {
      const w = mk((Math.random() * WP.length) | 0, r);
      return { i: WI[w.n] || "⚔️", n: w.n, tp: "Arma", r, d: "Prueba de rareza.", stx: `Daño ×${(w.dmg * w.rm).toFixed(2)}`, f: () => (P.w = w, ST()) };
    };
  show("<h2>Debug: elección de botín</h2><p>Elige uno para oír su sonido</p>", [itm(2), itm(3), wpn(2), wpn(3)]);
});

// ---------------- Efectos visuales ----------------
dbgAdd("Efectos", "Partículas de nivel", () => levelUpFX());
dbgAdd("Efectos", "Partículas de cofre", () => chestFX(P.x, P.y - 30));
dbgAdd("Efectos", "Destello épico", () => lootFX(P.x, P.y, 2));
dbgAdd("Efectos", "Destello legendario", () => lootFX(P.x, P.y, 3));

// ---------------- Estados ----------------
dbgAdd("Estados (jugador)", "Ralentizado 8 s", () => (P.slow = 8));
dbgAdd("Estados (jugador)", "Controles invertidos 8 s", () => (P.invc = 8));
dbgAdd("Estados (jugador)", "Furia 8 s", () => (P.bt = 8));
dbgAdd("Estados (jugador)", "Quitar todos", () => {
  P.slow = P.invc = P.bt = 0;
});
// se aplican con la función real del juego (apply) para que se comporten exactamente igual que en partida
const DBG_FX = (k, v) => ({ burn: { burn: v }, poison: { poison: v }, bleed: { bleed: 3 }, wet: { wet: v }, slow: { slow: v }, stun: { stun: v }, root: { root: v }, frac: { frac: v }, curse: { curse: v }, cor: { cor: 4 } })[k];
const dbgApply = (k, v = 8) => E.forEach((e) => e.hp > 0 && apply(e, DBG_FX(k, v)));
for (const k in STATUS_E) dbgAdd("Estados (enemigos)", STATUS_E[k].n, () => dbgApply(k));
dbgAdd("Estados (enemigos)", "TODOS (12 s)", () => Object.keys(STATUS_E).forEach((k) => dbgApply(k, 12)));
dbgAdd("Estados (enemigos)", "Quitar todos", () => E.forEach((e) => (e.st = {})));

// ---------------- Enemigos y jefes ----------------
Object.keys(ET)
  .filter((k) => k != "boss" && k != "decoy" && k != "orb")
  .forEach((k) =>
    dbgAdd("Invocar enemigo", k == "bomber" ? "bomber (kamikaze)" : k, () => {
      const a = rnd(0, 6.28);
      spawn(k, P.x + Math.cos(a) * 140, P.y + Math.sin(a) * 140);
    }),
  );
dbgAdd("Invocar enemigo", "Matar a todos", () => E.slice().forEach((e) => e.hp > 0 && hit(e, 1e9, "p", {})));
BD.forEach((b, i) =>
  dbgAdd("Invocar jefe", (FIN(i) ? "★ " : "") + b.n, () => {
    G.bo = i;
    spawnBoss();
  }),
);
dbgAdd("Jefe (estado)", "Vulnerable 6 s", dbgNeedBoss((b) => (b.vul = 6)));
dbgAdd("Jefe (estado)", "Inmune 6 s", dbgNeedBoss((b) => (b.imm = 6)));
[1, 0.7, 0.5, 0.35, 0.2].forEach((p) => dbgAdd("Jefe (estado)", "Vida " + p * 100 + "%", dbgNeedBoss((b) => (b.hp = b.mhp * p))));

// ---------------- Pantalla ----------------
dbgAdd("Pantalla", "Hitboxes", null, { toggle: "hb" });
dbgAdd("Pantalla", "FPS", null, { toggle: "fps" });
