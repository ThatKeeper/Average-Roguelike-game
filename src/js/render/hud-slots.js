/* ======================================================================
 * src/js/render/hud-slots.js
 * Casillas del HUD dibujadas con el tilemap y los iconos (render/hud-assets.js): habilidades de la clase,
 * habilidad de rama, esquiva, pociones, cartas de hechizo, equipo y etiquetas al pasar el ratón.
 *
 * Define:
 * KL, rr, HT, slot, hudSkillSpecs, hudSlots
 * ====================================================================== */

// ---- HUD: casillas con icono, tecla, estado (listo, enfriamiento, sin maná, seleccionado) y etiqueta contextual al pasar el ratón ----
const KL = (c) =>
  (c || "").replace("Key", "").replace("Digit", "").replace("Space", "ESP").replace("Arrow", "");
function rr(px, py, w, h, r) {
  x.beginPath();
  x.moveTo(px + r, py);
  x.arcTo(px + w, py, px + w, py + h, r);
  x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r);
  x.arcTo(px, py, px + w, py, r);
  x.closePath();
}
let HT = null;
// o: ico (id de icono) · em/it (emoji u objeto) · pc (pieza del tilemap) · off · sel · empty · cd/cdm · nomp · key · mp · tip · rdy
function slot(px, py, s, o) {
  const hov = M.x >= px && M.x <= px + s && M.y >= py && M.y <= py + s,
    fr = o.sel ? "slot_sel" : o.off ? "slot_off" : o.empty ? "slot_empty" : o.eq ? "slot_equip" : o.rdy ? "slot_ready" : "slot";
  x.save();
  if (!hNine(fr, px, py, s, s, 2, 5)) {
    rr(px, py, s, s, 7);
    x.fillStyle = "#161120dd";
    x.fill();
    x.strokeStyle = o.sel ? "#fff" : o.col || "#6a5d80";
    x.stroke();
  }
  const isz = Math.round(s * 0.78);
  if (o.ico) hIcon(o.ico, px + s / 2, py + s / 2, isz, o.off);
  else if (o.pc) hPiece(o.pc, px + s / 2, py + s / 2, Math.max(1, Math.floor((s - 6) / 16)), 1);
  else if (o.em && !(o.it && drawItemIcon(o.it, px + s / 2, py + s / 2, s * 0.78)))
    spr(o.em, px + s / 2, py + s / 2 + 1, s * 0.6);
  if (o.cd > 0) {
    x.fillStyle = "#000b";
    x.fillRect(px + 3, py + 3, s - 6, (s - 6) * cl(o.cd / (o.cdm || 1), 0, 1));
    x.fillStyle = "#fff";
    x.font = "bold 13px Georgia";
    x.textAlign = "center";
    x.fillText(o.cd.toFixed(o.cd < 10 ? 1 : 0), px + s / 2, py + s / 2 + 5);
  } else if (o.nomp) {
    x.fillStyle = "#2a4cc088";
    x.fillRect(px + 3, py + 3, s - 6, s - 6);
  }
  if (o.key) hKey(o.key, px - 2, py - 5, o.off);
  if (o.mp) {
    x.fillStyle = "#8cf";
    x.font = "bold 10px Georgia";
    x.textAlign = "right";
    x.strokeStyle = "#000";
    x.lineWidth = 3;
    x.strokeText(o.mp, px + s - 4, py + s - 4);
    x.fillText(o.mp, px + s - 4, py + s - 4);
  }
  x.restore();
  if (hov && o.tip) HT = o.tip;
}

/**
 * Casillas de habilidades de la clase actual, en orden: Q, E, clic derecho (o guardia), R, rama (C) y esquiva.
 * Las clases de Inteligencia pierden sus hechizos si no llevas un arma mágica (mageOn).
 */
function hudSkillSpecs() {
  const ck = P.ck,
    br = P.br,
    lock = br == "int" && !mageOn(),
    out = [],
    LOCK = "Necesitas un arma mágica equipada";
  const add = (i, key, def) => {
    const A = skOf(ck, i);
    if (!A) return;
    const ok = !!A.f,
      mc = A.mp ? Math.ceil(spMp(A.mp)) : 0;
    out.push({
      ico: A.ic,
      key,
      col: BRN[br].c,
      off: lock || (!ok && !A.g),
      cd: ok ? P.cd[i] : 0,
      cdm: A.cd,
      nomp: ok && A.mp && P.mp < spMp(A.mp),
      sel: !!A.g && P.g,
      rdy: ok && P.cd[i] <= 0 && !lock && (!A.mp || P.mp >= spMp(A.mp)),
      mp: mc || "",
      tip: [A.n + (lock ? " (bloqueada)" : ""), lock ? LOCK : A.g ? "Mantén clic derecho o " + KL(KY.util) : `Enfriamiento ${A.cd}s${mc ? " · " + mc + " maná" : ""}`],
    });
  };
  add(0, KL(KY.q));
  add(1, KL(KY.e));
  if (br == "str") add(2, "CLIC D");
  else if (skOf(ck, 2)) add(2, "CLIC D");
  add(3, KL(KY.r));
  if (br != "str") {
    const U2 = skUtil(br);
    out.push({
      ico: U2.ic,
      key: KL(KY.util),
      col: "#c9a24a",
      cd: P.cd[8],
      cdm: U2.cd,
      rdy: P.cd[8] <= 0,
      tip: [U2.n + " (siempre disponible)", U2.d],
    });
  }
  return out;
}
function hudSlots() {
  const s = 42,
    g = 7,
    y = H - s - 14,
    mg = mageOn(),
    sk = P.nov ? [] : hudSkillSpecs();
  HT = null;
  tcSync();
  if (!TOUCH)
    ["hp", "mp"].forEach((k, n) =>
      slot(12 + n * 46, y - 46, 38, {
        ico: "potion_" + k,
        key: KL(KY[k == "hp" ? "php" : "pmp"]),
        col: POT[k].c,
        off: !potCount(k),
        cd: P.potcd,
        cdm: 1,
        mp: potCount(k) || "",
        tip: [POT[k].n, `Tecla ${KL(KY[k == "hp" ? "php" : "pmp"])} · tienes ${potCount(k)}`],
      }),
    );
  const n = sk.length + 1 + (mg ? 4 : 0);
  let px = TOUCH ? Math.max(12, (W - n * (s + g)) / 2) : 12;
  for (const o of sk) {
    slot(px, y, s, o);
    px += s + g;
  }
  slot(px, y, s, {
    ico: "dodge",
    key: KL(KY.dodge),
    col: "#9cf",
    cd: P.dcd,
    cdm: 0.8,
    rdy: P.dcd <= 0,
    tip: ["Esquivar", "Breve invulnerabilidad"],
  });
  px += s + g * 2;
  if (mg)
    for (let i = 0; i < 4; i++) {
      const k = S.cards.slots[i],
        c = k && CARDS[k];
      if (!c) {
        slot(px, y, s, {
          empty: 1,
          key: KL(KY["c" + (i + 1)]),
          tip: ["Espacio de carta vacío", "Pulsa B para equipar una carta"],
        });
      } else {
        const sp = build(c.a, c.b, c.f),
          IC = "el_" + c.a; // un icono por elemento (fuego, agua, planta, luz, viento, roca, hielo, oscuridad, sangre, corrosión)
        slot(px, y, s, {
          ico: IC,
          key: KL(KY["c" + (i + 1)]),
          col: EL[c.a].c,
          cd: P["cd"][4 + i],
          cdm: sp.cd,
          nomp: P.mp < sp.cost,
          rdy: !(P.cd[4 + i] > 0) && P.mp >= sp.cost,
          mp: Math.ceil(sp.cost),
          tip: [c.n, `Coste ${Math.ceil(sp.cost)} · Enfr. ${sp.cd.toFixed(1)}s · Daño ${Math.round(sp.dmg)}`],
        });
      }
      px += s + g;
    }
  if (TOUCH) return;
  // equipo visible a la derecha
  const eq = [
    ["w", { i: WI[P.w.n] || "\u2694\ufe0f", n: P.w.n, r: RN.indexOf(P.w.rn), st: {} }],
    ...["h", "b", "g", "f", "a"].map((k) => [k, P.eq[k]]),
  ];
  let ex = W - 12 - eq.length * (s - 4 + g);
  eq.forEach(([k, it]) => {
    slot(ex, y, s - 4, {
      em: it && it.i,
      it,
      eq: 1,
      pc: it ? null : "eq_" + k,
      col: it ? RC[it.r || 0] : "#4a4258",
      key: "",
      tip: it
        ? [it.n, it.st && Object.keys(it.st).length ? stT(it.st) : `${SLOT[k]}`]
        : [SLOT[k] + " vacío", "Abre el inventario (I)"],
    });
    if (it) {
      x.save();
      x.strokeStyle = RC[it.r || 0];
      x.lineWidth = 2;
      rr(ex + 2, y + 2, s - 8, s - 8, 6);
      x.stroke();
      x.restore();
    }
    ex += s - 4 + g;
  });
  x.fillStyle = "#fffb";
  x.font = "11px Georgia";
  x.textAlign = "center";
  x.fillText(
    `[${KL(KY.inv)}] Inventario   [${KL(KY.tal)}] Talentos${mg ? "   [" + KL(KY.book) + "] Cartas" : ""}   [${KL(KY.map)}] Mapa`,
    W / 2,
    H - 2,
  );
  if (HT) {
    x.font = "12px Georgia";
    const w1 = Math.max(x.measureText(HT[0]).width, x.measureText(HT[1]).width) + 22,
      tx = cl(M.x - w1 / 2, 6, W - w1 - 6),
      ty = y - 54;
    if (!hNine("panel", tx, ty, w1, 46, 2, 5)) {
      rr(tx, ty, w1, 46, 6);
      x.fillStyle = "#000d";
      x.fill();
    }
    x.fillStyle = "#fff";
    x.textAlign = "left";
    x.fillText(HT[0], tx + 11, ty + 19);
    x.fillStyle = "#bbb";
    x.fillText(HT[1], tx + 11, ty + 36);
  }
}
