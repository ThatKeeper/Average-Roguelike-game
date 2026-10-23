/* ======================================================================
 * src/js/game/bag.js
 * Mochila por slots (32 casillas fijas), consumibles apilables (pociones), equipar/desequipar,
 * papelera de un solo hueco y valor de venta.
 *
 * P.bag    : array de BAG_N posiciones (objeto o null). El índice es el slot.
 * P.trash  : último objeto tirado (al tirar otro, el anterior se borra del todo).
 * Objetos  : equipo {s:'h|b|g|f|a'}, armas {s:'w', wp:<arma>}, consumibles {cons:'hp|mp', q}.
 * Favoritos: it.fav = true (no se tiran ni se venden en lote).
 *
 * Define:
 * BAG_N, POT, SLOT_ORDER, bagInit, bagAll, bagFree, bagAdd, isWeapon, wrapWeapon, itemKind,
 * canEquip, equipFromBag, unequipSlot, giveItem, dropFloor, trashItem, restoreTrash, toggleFav,
 * usePotion, potCount, sellValue, newPotion, itemTip
 * ====================================================================== */

const BAG_N = 32,
  SLOT_ORDER = ["w", "h", "b", "g", "f", "a"],
  POT = {
    hp: { n: "Poción de vida", i: "🧪", d: "Restaura el 50% de la vida máxima.", c: "#e55" },
    mp: { n: "Poción de maná", i: "🔹", d: "Restaura el 60% del maná máximo.", c: "#58f" },
  };
const POT_MAX = 10;

function bagInit() {
  P.bag = new Array(BAG_N).fill(null);
  P.trash = null;
  P.potcd = 0;
}
const bagAll = () => P.bag.filter(Boolean),
  bagFree = () => P.bag.indexOf(null),
  isWeapon = (it) => !!it && it.s == "w",
  potCount = (k) => P.bag.reduce((a, b) => a + (b && b.cons == k ? b.q : 0), 0);

function newPotion(k, q = 1) {
  const p = POT[k];
  return { cons: k, n: p.n, i: p.i, s: "c", tp: "Consumible", r: 0, d: p.d, q, st: {}, id: Date.now() + Math.random() };
}
const itemKind = (it) => (it.cons ? "Consumible" : it.tp && isWeapon(it) ? it.tp : SLOT[it.s] || it.tp || "Objeto");

// Un arma se guarda en la mochila envuelta como objeto (conserva todos sus datos en .wp).
function wrapWeapon(w) {
  return {
    id: Date.now() + Math.random(),
    s: "w",
    wp: w,
    fav: !!w.fav,
    n: w.n,
    i: WI[w.n] || "⚔️",
    r: Math.max(0, RN.indexOf(w.rn)),
    tp: { m: "Arma cuerpo a cuerpo", r: "Arma a distancia", g: "Arma mágica" }[w.s],
    d: `Escala con ${w.sc.toUpperCase()}.`,
    stx: `Daño ×${(w.dmg * w.rm).toFixed(2)} · Crít ${Math.round(w.crit * 100)}%`,
    st: {},
  };
}

// Añade a la mochila (apila pociones). Devuelve false si no hay sitio.
function bagAdd(it) {
  if (it.cons) {
    for (const b of P.bag)
      if (b && b.cons == it.cons && b.q < POT_MAX) {
        const t = Math.min(POT_MAX - b.q, it.q || 1);
        b.q += t;
        it.q = (it.q || 1) - t;
        if (it.q <= 0) return true;
      }
  }
  const i = bagFree();
  if (i < 0) return false;
  P.bag[i] = it;
  return true;
}

function dropFloor(it) {
  const a = Math.random() * 6.28;
  it.hold = 1.2;
  O.push({ x: cl(P.x + Math.cos(a) * 46, RB.x0 + 14, RB.x1 - 14), y: cl(P.y + Math.sin(a) * 46, RB.y0 + 14, RB.y1 - 14), k: "i", it, hold: 1.5 });
  flash("Mochila llena: " + it.n + " cae al suelo");
}

const canEquip = (it) => !!it && !it.cons && it.s != "c" && (isWeapon(it) || meets(it));

function setWeapon(w) {
  P.w = w;
  P.am = undefined;
  P.rl = 0;
}
// Equipa un objeto (sin pasar por la mochila). El objeto que había va a la casilla `into` o al primer hueco libre.
function equipItem(it, into) {
  const old = isWeapon(it) ? wrapWeapon(P.w) : P.eq[it.s];
  if (isWeapon(it)) {
    it.wp.fav = !!it.fav;
    setWeapon(it.wp);
  }
  else P.eq[it.s] = it;
  if (old) {
    if (into !== undefined && !P.bag[into]) P.bag[into] = old;
    else if (!bagAdd(old)) dropFloor(old);
  }
  ST();
}
function equipFromBag(i) {
  const it = P.bag[i];
  if (!it) return false;
  if (!canEquip(it)) {
    flash(it.cons ? "Eso no se equipa" : "No cumples los requisitos");
    return false;
  }
  P.bag[i] = null;
  equipItem(it, i);
  return true;
}
function unequipSlot(s, into) {
  if (s == "w") {
    flash("No puedes quedarte sin arma");
    return false;
  }
  const it = P.eq[s];
  if (!it) return false;
  const j = into !== undefined && !P.bag[into] ? into : bagFree();
  if (j < 0) {
    flash("Mochila llena");
    return false;
  }
  delete P.eq[s];
  P.bag[j] = it;
  ST();
  return true;
}

// Entrada única de objetos (cofres, mercader, suelo): el equipo se equipa directamente.
// Devuelve el objeto resultante o false si no cupo (solo ocurre con el botín del suelo).
function giveItem(it, fromFloor) {
  if (it.cons) {
    if (!bagAdd(it)) {
      if (fromFloor) return false;
      dropFloor(it);
    }
    return true;
  }
  if (!canEquip(it)) {
    if (!bagAdd(it)) {
      if (fromFloor) return false;
      dropFloor(it);
    } else flash("Guardado en la mochila (no cumples los requisitos)");
    return true;
  }
  if (fromFloor) {
    const need = isWeapon(it) || P.eq[it.s];
    if (need && bagFree() < 0) return false;
  }
  equipItem(it);
  flash("Equipas: " + it.n);
  return true;
}

function trashItem(it, from) {
  if (it.fav) {
    flash("Quita el favorito antes de tirarlo");
    return false;
  }
  if (from && from.k == "b") P.bag[from.i] = null;
  else if (from && from.k == "e") {
    if (from.s == "w") {
      flash("No puedes tirar tu arma equipada");
      return false;
    }
    delete P.eq[from.s];
    ST();
  }
  P.trash = it; // el que estuviera antes se borra por completo
  return true;
}
function restoreTrash() {
  if (!P.trash) return false;
  if (!bagAdd(P.trash)) {
    flash("Mochila llena");
    return false;
  }
  P.trash = null;
  return true;
}
const toggleFav = (it) => {
  it.fav = !it.fav;
  return it.fav;
};

function usePotion(k, fromBag) {
  if (!P || G.st != "play" || trnBusy()) return false;
  const i = P.bag.findIndex((b) => b && b.cons == k);
  if (i < 0) {
    flash("No tienes " + POT[k].n.toLowerCase());
    return false;
  }
  if (P.potcd > 0 && !fromBag) return false;
  if (k == "hp") {
    if (P.hp >= P.mhp) return flash("Vida completa"), false;
    P.hp = Math.min(P.mhp, P.hp + P.mhp * 0.5);
  } else {
    if (P.mp >= P.mmp) return flash("Maná completo"), false;
    P.mp = Math.min(P.mmp, P.mp + P.mmp * 0.6);
  }
  P.potcd = 1;
  if (--P.bag[i].q <= 0) P.bag[i] = null;
  snd(k == "hp" ? 520 : 700, 0.18, "triangle", 0.05);
  flash(POT[k].n + " usada");
  return true;
}

// Precio de venta según rareza (se escala con la profundidad como el resto de precios).
function sellValue(it) {
  if (it.cons) return Math.round(8 * (1 + 0.1 * G.d));
  return Math.round([18, 42, 85, 170][it.r || 0] * (1 + 0.1 * G.d));
}
function itemTip(it) {
  return `${it.n} · ${itemKind(it)} · ${RN[it.r || 0]}`;
}
