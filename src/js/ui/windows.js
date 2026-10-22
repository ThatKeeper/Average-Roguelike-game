/* ======================================================================
 * src/js/ui/windows.js
 * Ventanas de tarjetas: menús, subida de nivel, cofres y botín.
 *
 * Define:
 * ATI, ATN, ATD, TD, show, loot2
 * ====================================================================== */

// ===== VENTANAS DE TARJETAS (menús, nivel, cofres, mercader, santuarios, sucesos) =====
const ATI = { str: "💪", dex: "🎯", int: "📘", vit: "❤️", agi: "👟", luk: "🍀" },
  ATN = {
    str: "Fuerza",
    dex: "Destreza",
    int: "Inteligencia",
    vit: "Vitalidad",
    agi: "Agilidad",
    luk: "Suerte",
  },
  ATD = {
    str: "Daño de todas las armas cuerpo a cuerpo.",
    dex: "Crítico y daño de armas a distancia.",
    int: "Potencia de hechizos y maná.",
    vit: "Vida máxima y armadura.",
    agi: "Velocidad de movimiento y de ataque.",
    luk: "Crítico y botín.",
  };
const TD = {
  shield: "Absorbe daño (15 maná).",
  trap: "Trampa que congela al pisarla.",
  summon: "Espíritu aliado que dispara.",
  beam: "Rayo continuo (mantener R).",
  cone: "Cono de fuego con quemadura.",
};
function show(h, btns, keep) {
  ov.style.display = "flex";
  ov.innerHTML = h;
  G.ov = 1;
  const cs = btns.filter((b) => !b.nc && !b.x).length >= 3,
    row = document.createElement("div");
  row.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:96%";
  ov.appendChild(row);
  const bw = document.createElement("div");
  bw.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:96%";
  ov.appendChild(bw);
  btns.forEach((b) => {
    const act = () => {
      if (b.nc) {
        b.f();
        return;
      }
      if (b.c && P.gold < b.c) {
        flash("Oro insuficiente");
        return;
      }
      if (b.c) P.gold -= b.c;
      if (b.f) b.f();
      if (b.r >= 2 && P && G.st == "play") {
        lootSnd(b.r); // sonido propio al elegir un objeto épico o legendario
        lootFX(P.x, P.y, b.r);
      }
      if (!keep || b.x) hide();
      else if (b.re) b.re();
    };
    if (b.i || b.c !== undefined || (cs && !b.nc && !b.x)) {
      const p = (b.t || "").split(": "),
        ic =
          b.i ||
          (/vida|sanaci|poci/i.test(b.t)
            ? "🧪"
            : /dañ|poder/i.test(b.t)
              ? "⚔️"
              : /reliquia/i.test(b.t)
                ? "💎"
                : /pacto|sangre/i.test(b.t)
                  ? "🩸"
                  : /oro/i.test(b.t)
                    ? "🪙"
                    : "📜"),
        no = b.c && P.gold < b.c;
      row.appendChild(
        card(
          {
            i: ic,
            n: b.n || p[0],
            tp: b.tp || "Opción",
            r: b.r || 0,
            d: b.d || p.slice(1).join(": "),
            stx: b.stx,
            st: b.st,
            req: b.req,
          },
          [[b.c ? `${b.c} 🪙` : "Elegir", act, no || b.dis]],
          b.cp,
        ),
      );
    } else {
      const e = document.createElement("button");
      e.innerHTML = b.t;
      e.onclick = act;
      bw.appendChild(e);
    }
  });
}
function loot2(n) {
  const o = [],
    q = Math.random() + G.d * 0.03 + P.a.luk * 0.01,
    ra = Math.min(rcap(), q > 1.1 ? 3 : q > 0.85 ? 2 : q > 0.55 ? 1 : 0);
  if (Math.random() < 0.3) {
    const k = pick(Object.keys(TM));
    o.push({
      i: "📖",
      n: "Tomo: " + TM[k],
      tp: "Tomo mágico",
      r: ra,
      d: TD[k],
      stx: "Se lanza con R",
      f: () => {
        P.tm = k;
      },
    });
  } else {
    const w = mk((Math.random() * WP.length) | 0, ra);
    o.push({
      i: WI[w.n] || "⚔️",
      n: w.n,
      tp: { m: "Arma cuerpo a cuerpo", r: "Arma a distancia", g: "Arma mágica" }[w.s],
      r: ra,
      d: w.bleed
        ? "Cada golpe aplica hemorragia acumulable (máx. 8); los críticos añaden una acumulación extra."
        : w.el == "water"
          ? "Empapa al objetivo: la electricidad le hace +60% de daño."
          : "Cambia tu estilo de combate.",
      stx: `Daño ×${(w.dmg * w.rm).toFixed(2)} · Crít ${Math.round(w.crit * 100)}% · ${w.sc.toUpperCase()}`,
      cp: `${P.w.n} → ${w.n}`,
      f: () => {
        P.w = w;
        ST();
        P.am = undefined;
        P.rl = 0;
      },
    });
  }
  const it = Object.assign({}, pickIT(), { id: Date.now() + Math.random() });
  o.push(
    Object.assign({}, it, {
      tp: SLOT[it.s],
      cp: cmp(it),
      f: () => {
        P.bag.push(it);
      },
    }),
  );
  const ix = [...RL.keys()].sort(() => Math.random() - 0.5);
  for (let i = 0; i < n - 2; i++) {
    const R = RL[ix[i]];
    o.push({
      i: "💎",
      n: R[0],
      tp: "Reliquia",
      r: Math.min(rcap(), 1 + (i & 1)),
      d: R[1],
      f: () => {
        R[2](P);
        P.relics.push(R[0]);
        ST();
      },
    });
  }
  return o;
}

