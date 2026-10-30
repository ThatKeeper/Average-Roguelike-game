/* ======================================================================
 * src/js/debug/debug-features.js
 * Herramientas del panel de debug. Añade aquí las nuevas pruebas con dbgAdd().
 *
 * Define: dbgEnsureRun, dbgGoto, dbgFinSkip (y registra botones)
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

// ---------------- Viaje rápido y modo difícil ----------------
// Si no hay partida en curso, empieza una con la clase elegida (o la primera) y salta al piso pedido.
const dbgEnsureRun = () => {
  if (G.st == "play") return;
  const ci = chosenCls();
  run(ci >= 0 ? ci : 0);
};
// Viaja al piso d (regenera el piso con la semilla de la partida). room = "boss" te deja en la sala del jefe.
function dbgGoto(d, room) {
  dbgEnsureRun();
  hide();
  G.fin = null; // por si había una cinemática en curso
  G.finWait = 0;
  G.cs = null;
  G.dk = 0;
  G.d = Math.max(1, d | 0);
  genLevel();
  const bi = room == "boss" ? G.R.findIndex((r) => r.tp == "boss") : 0;
  enter(bi < 0 ? 0 : bi, 4);
  flash("Piso " + G.d + (room == "boss" ? " · sala del jefe" : "") + (S.hard ? " (modo difícil)" : ""));
}
[1, 2, 3, 5, 7, 9, 10, 11, 15, 20, 30, 40].forEach((d) => dbgAdd("Pisos y modo", "Ir al piso " + d, () => dbgGoto(d)));
dbgAdd("Pisos y modo", "Piso −1", () => dbgGoto((G.d || 1) - 1));
dbgAdd("Pisos y modo", "Piso +1", () => dbgGoto((G.d || 1) + 1));
dbgAdd("Pisos y modo", "Sala del jefe (piso actual)", () => dbgGoto(G.d || 1, "boss"));
// Atajo para probar el final: piso 10, sala del jefe y el jefe con 1 de vida (un golpe y cae)
dbgAdd("Pisos y modo", "Piso 10 · jefe a 1 PV (probar final)", () => {
  dbgGoto(10, "boss");
  const b = dbgBoss();
  if (b) {
    b.sp = 0;
    b.imm = 0;
    b.hp = 1;
  }
  flash(S.hard ? "Modo difícil activo: el final animado no se ejecuta" : "Derrota al jefe para ver el final");
});
// Modo difícil: interruptor sobre S.hard. Los pisos ya generados no cambian; viaja a un piso para aplicarlo.
// (Si tu mejor profundidad es ≥ 11, el juego lo vuelve a activar al recargar.)
Object.defineProperty(DBG, "hard", {
  get: () => !!S.hard,
  set: (v) => {
    S.hard = v ? 1 : 0;
    if (v) S.hv2 = 1;
    save();
    flash("Modo difícil " + (v ? "ACTIVADO" : "desactivado") + " · viaja a un piso para regenerarlo");
  },
});
dbgAdd("Pisos y modo", "Modo difícil", null, { toggle: "hard" });

// ---------------- Cinemáticas ----------------
// Avanza la cinemática del final sin esperar (simula los fotogramas): hasta s segundos o hasta que la Parca empiece el golpe
const dbgFinSkip = (s, hastaGolpe) => {
  if (!G.fin) return flash("No hay final en curso");
  for (let i = 0; i < s * 60 && G.fin && !(hastaGolpe && G.fin.rp.st > 0); i++) finTick(1 / 60);
};
dbgAdd("Cinemáticas", "Final del piso 10 (Parca)", () => {
  dbgEnsureRun();
  hide();
  G.cs = null;
  finStart();
});
dbgAdd("Cinemáticas", "Final: saltar 10 s", () => dbgFinSkip(10));
dbgAdd("Cinemáticas", "Final: saltar hasta el golpe", () => dbgFinSkip(60, 1));
dbgAdd("Cinemáticas", "Final: estadísticas finales", () => {
  dbgEnsureRun();
  G.fin = null;
  G.endHard = 1;
  die(0, 1);
});
dbgAdd("Cinemáticas", "Escena de muerte (manos)", () => {
  dbgEnsureRun();
  hide();
  G.fin = null;
  G.cs = null;
  P.hp = 0;
  die(0);
});
dbgAdd("Cinemáticas", "Presentación del jefe secreto", () => {
  dbgGoto(10, "boss");
  E = [];
  G.intro = null;
  sbIntro();
});
dbgAdd("Cinemáticas", "Ventana de victoria (vic)", () => {
  dbgEnsureRun();
  vic();
});
dbgAdd("Cinemáticas", "Transición de cubos", () => trnCubes("down"));
dbgAdd("Cinemáticas", "Cancelar cinemática en curso", () => {
  G.fin = null;
  G.finWait = 0;
  G.cs = null;
  flash("Cinemática cancelada");
});

// ---------------- Quest ----------------
// Atajo para probar la misión secreta: mercader al nivel máximo, empieza en la profundidad 7
// y al terminar ese piso baja directamente a la 10.
dbgAdd("Quest", "Activar quest del jefe secreto", () => {
  if (G.st != "play") {
    const ci = chosenCls();
    run(ci >= 0 ? ci : 0);
  }
  G.dbgQ = 1;
  G.sqLamp = 0;
  G.d = 7;
  S.best = Math.max(S.best, 7);
  genLevel();
  enter(0, 4);
  flash("Quest secreta: profundidad 7 · al terminarla bajas a la 10");
});

// ---------------- Clases ----------------
dbgAdd("Clases", "Desbloquear todas las clases", () => {
  CLS.forEach((c, i) => c.req.length && (S.cu[i] = 1));
  save();
  flash("Todas las clases desbloqueadas");
});
CLS.forEach((c, i) =>
  dbgAdd("Clases", "Ser " + c.n, () => {
    P.ci = i;
    P.ck = c.k;
    P.br = c.br;
    P.nov = 0;
    P.w = mk(c.w);
    P.am = undefined;
    P.rl = 0;
    P.cd = new Array(10).fill(0);
    ST();
  }),
);

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
BD.slice(0, BDV()).forEach((b, i) =>
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
