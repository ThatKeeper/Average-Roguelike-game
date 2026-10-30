/* ======================================================================
 * src/js/render/hud-slots.js
 * Casillas del HUD con iconos, teclas, estado y etiquetas.
 *
 * Define:
 * KL, rr, ico, HT, slot, hudSlots
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
function ico(id, cx, cy, s, c) {
  x.save();
  x.translate(cx, cy);
  x.strokeStyle = c;
  x.fillStyle = c;
  x.lineWidth = 2;
  const r = s / 2;
  switch (id) {
    case "whirl":
      x.beginPath();
      x.arc(0, 0, r * 0.7, 0, 4.7);
      x.stroke();
      x.beginPath();
      x.moveTo(r * 0.7, -r * 0.1);
      x.lineTo(r * 0.4, -r * 0.5);
      x.lineTo(r * 0.95, -r * 0.45);
      x.fill();
      break;
    case "leap":
      x.beginPath();
      x.moveTo(-r * 0.7, r * 0.6);
      x.quadraticCurveTo(0, -r, r * 0.7, r * 0.6);
      x.stroke();
      x.fillRect(-r * 0.8, r * 0.6, r * 1.6, 3);
      break;
    case "guard":
      x.beginPath();
      x.moveTo(0, -r * 0.8);
      x.lineTo(r * 0.7, -r * 0.4);
      x.lineTo(r * 0.5, r * 0.5);
      x.lineTo(0, r * 0.85);
      x.lineTo(-r * 0.5, r * 0.5);
      x.lineTo(-r * 0.7, -r * 0.4);
      x.closePath();
      x.stroke();
      break;
    case "volley":
      for (let i = -1; i <= 1; i++) {
        x.beginPath();
        x.moveTo(-r * 0.7, i * r * 0.45);
        x.lineTo(r * 0.7, i * r * 0.45);
        x.lineTo(r * 0.45, i * r * 0.45 - 4);
        x.stroke();
      }
      break;
    case "bomb":
      x.beginPath();
      x.arc(0, r * 0.1, r * 0.5, 0, 7);
      x.fill();
      x.beginPath();
      x.moveTo(0, -r * 0.4);
      x.lineTo(r * 0.3, -r * 0.8);
      x.stroke();
      break;
    case "drop":
      x.beginPath();
      x.moveTo(0, -r * 0.8);
      x.quadraticCurveTo(r * 0.7, r * 0.2, 0, r * 0.8);
      x.quadraticCurveTo(-r * 0.7, r * 0.2, 0, -r * 0.8);
      x.fill();
      break;
    case "orb":
      x.beginPath();
      x.arc(0, 0, r * 0.55, 0, 7);
      x.fill();
      break;
    case "nova":
      for (let i = 0; i < 8; i++) {
        x.beginPath();
        x.moveTo(Math.cos(i * 0.785) * r * 0.3, Math.sin(i * 0.785) * r * 0.3);
        x.lineTo(Math.cos(i * 0.785) * r * 0.85, Math.sin(i * 0.785) * r * 0.85);
        x.stroke();
      }
      break;
    case "bolt":
      x.beginPath();
      x.moveTo(r * 0.2, -r * 0.9);
      x.lineTo(-r * 0.4, r * 0.1);
      x.lineTo(0, r * 0.1);
      x.lineTo(-r * 0.2, r * 0.9);
      x.lineTo(r * 0.5, -r * 0.2);
      x.lineTo(r * 0.1, -r * 0.2);
      x.closePath();
      x.fill();
      break;
    case "cone":
      x.beginPath();
      x.moveTo(-r * 0.8, 0);
      x.lineTo(r * 0.8, -r * 0.6);
      x.lineTo(r * 0.8, r * 0.6);
      x.closePath();
      x.stroke();
      break;
    case "zone":
      x.setLineDash([3, 3]);
      x.beginPath();
      x.arc(0, 0, r * 0.7, 0, 7);
      x.stroke();
      x.setLineDash([]);
      break;
    case "rage":
      x.beginPath();
      for (let i = 0; i < 10; i++) {
        const q = i * 0.628 - 1.57,
          rr2 = i % 2 ? r * 0.35 : r * 0.85;
        x.lineTo(Math.cos(q) * rr2, Math.sin(q) * rr2);
      }
      x.closePath();
      x.fill();
      break;
    case "reload":
      x.beginPath();
      x.arc(0, 0, r * 0.65, 0.5, 5.8);
      x.stroke();
      x.beginPath();
      x.moveTo(r * 0.6, -r * 0.5);
      x.lineTo(r * 0.9, -r * 0.1);
      x.lineTo(r * 0.3, -r * 0.05);
      x.fill();
      break;
    case "dodge":
      for (let i = 0; i < 2; i++) {
        x.beginPath();
        x.moveTo(-r * 0.6 + i * r * 0.5, -r * 0.6);
        x.lineTo(-r * 0.1 + i * r * 0.5, 0);
        x.lineTo(-r * 0.6 + i * r * 0.5, r * 0.6);
        x.stroke();
      }
      break;
    default:
      x.beginPath();
      x.arc(0, 0, r * 0.4, 0, 7);
      x.fill();
  }
  x.restore();
}
let HT = null;
function slot(px, py, s, o) {
  const hov = M.x >= px && M.x <= px + s && M.y >= py && M.y <= py + s;
  x.save();
  rr(px, py, s, s, 7);
  x.fillStyle = o.off ? "#0c0a10dd" : "#161120dd";
  x.fill();
  x.lineWidth = o.sel ? 3 : 2;
  x.strokeStyle = o.sel ? "#fff" : o.col || "#6a5d80";
  if (o.empty) x.setLineDash([4, 3]);
  x.stroke();
  x.setLineDash([]);
  if (o.ico) ico(o.ico, px + s / 2, py + s / 2 + 2, s * 0.8, o.off ? "#666" : o.col || "#ddd");
  else if (o.em && !(o.it && drawItemIcon(o.it, px + s / 2, py + s / 2, s * 0.78)))
    spr(o.em, px + s / 2, py + s / 2 + 1, s * 0.6);
  if (o.cd > 0) {
    x.fillStyle = "#000b";
    x.fillRect(px + 2, py + 2, s - 4, (s - 4) * cl(o.cd / (o.cdm || 1), 0, 1));
    x.fillStyle = "#fff";
    x.font = "bold 13px Georgia";
    x.textAlign = "center";
    x.fillText(o.cd.toFixed(o.cd < 10 ? 1 : 0), px + s / 2, py + s / 2 + 5);
  } else if (o.nomp) {
    x.fillStyle = "#2a4cc088";
    x.fillRect(px + 2, py + 2, s - 4, s - 4);
  }
  if (o.key) {
    x.font = "bold 10px Georgia";
    const w = x.measureText(o.key).width + 8;
    rr(px - 2, py - 4, w, 13, 4);
    x.fillStyle = "#c9a24a";
    x.fill();
    x.fillStyle = "#000";
    x.textAlign = "left";
    x.fillText(o.key, px + 2, py + 6);
  }
  if (o.mp) {
    x.fillStyle = "#8cf";
    x.font = "9px Georgia";
    x.textAlign = "right";
    x.fillText(o.mp, px + s - 3, py + s - 3);
  }
  x.restore();
  if (hov && o.tip) HT = o.tip;
}
function hudSlots() {
  const s = 42,
    g = 7,
    y = H - s - 14,
    w = P.w.s,
    A = AB[w],
    mg = P.cls == "g",
    IC = {
      m: ["whirl", "leap", "guard"],
      r: ["volley", "bomb", "drop"],
      g: ["orb", "nova", "bolt"],
    },
    NM = {
      m: ["Remolino", "Salto con impacto", "Guardia (mantener)"],
      r: ["Andanada", "Flecha explosiva", "Flecha venenosa"],
      g: ["Bola de fuego", "Nova de hielo", "Rayo en cadena"],
    },
    EC2 = { m: "#d8b36a", r: "#7fd08a", g: "#8aa8ff" }[w];
  HT = null;
  tcSync();
  if (!TOUCH)
    ["hp", "mp"].forEach((k, n) =>
      slot(12 + n * 38, y - 38, 32, {
        em: POT[k].i,
        key: KL(KY[k == "hp" ? "php" : "pmp"]),
        col: POT[k].c,
        off: !potCount(k),
        cd: P.potcd,
        cdm: 1,
        mp: potCount(k) || "",
        tip: [POT[k].n, `Tecla ${KL(KY[k == "hp" ? "php" : "pmp"])} · tienes ${potCount(k)}`],
      }),
    );
  let px = TOUCH ? Math.max(12, (W - (5 + (mg ? 4 : 0)) * (s + g)) / 2) : 12;
  for (let i = 0; i < 3; i++) {
    const a = A[i],
      ok = a && a.f;
    slot(px, y, s, {
      ico: IC[w][i],
      key: i < 2 ? KL(KY[i ? "e" : "q"]) : "CLIC D",
      col: EC2,
      off: !ok,
      cd: ok ? P.cd[i] : 0,
      cdm: a.cd,
      nomp: a.mp && P.mp < spMp(a.mp),
      sel: i == 2 && P.g,
      mp: a.mp ? Math.ceil(spMp(a.mp)) : "",
      tip: [
        NM[w][i],
        ok
          ? `Enfriamiento ${a.cd || 0}s${a.mp ? " \u00b7 " + Math.ceil(spMp(a.mp)) + " man\u00e1" : ""}`
          : "Mant\u00e9n el clic derecho para guardia",
      ],
    });
    px += s + g;
  }
  const tm = P.tm,
    rI = tm
      ? { shield: "guard", trap: "zone", summon: "orb", beam: "bolt", cone: "cone" }[tm]
      : w == "m"
        ? P.w.bleed
          ? "drop"
          : "rage"
        : w == "r"
          ? "reload"
          : "orb";
  slot(px, y, s, {
    ico: rI,
    key: KL(KY.r),
    col: "#c9a24a",
    cd: P.cd[3],
    cdm: tm ? 10 : 14,
    tip: [tm ? TM[tm] : "Acci\u00f3n de clase", "Tecla " + KL(KY.r)],
  });
  px += s + g;
  slot(px, y, s, {
    ico: "dodge",
    key: KL(KY.dodge),
    col: "#9cf",
    cd: P.dcd,
    cdm: 0.8,
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
          tip: ["Espacio de carta vac\u00edo", "Pulsa B para equipar una carta"],
        });
      } else {
        const sp = build(c.a, c.b, c.f);
        slot(px, y, s, {
          ico: { bolt: "orb", nova: "nova", cone: "cone", zone: "zone" }[sp.f],
          key: KL(KY["c" + (i + 1)]),
          col: EL[c.a].c,
          cd: P["cd"][4 + i],
          cdm: sp.cd,
          nomp: P.mp < sp.cost,
          mp: Math.ceil(sp.cost),
          tip: [
            c.n,
            `Coste ${Math.ceil(sp.cost)} \u00b7 Enfr. ${sp.cd.toFixed(1)}s \u00b7 Da\u00f1o ${Math.round(sp.dmg)}`,
          ],
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
      col: it ? RC[it.r || 0] : "#4a4258",
      empty: !it,
      key: "",
      tip: it
        ? [it.n, it.st && Object.keys(it.st).length ? stT(it.st) : `${SLOT[k]}`]
        : [SLOT[k] + " vac\u00edo", "Abre el inventario (I)"],
    });
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
    const w1 = Math.max(x.measureText(HT[0]).width, x.measureText(HT[1]).width) + 16,
      tx = cl(M.x - w1 / 2, 6, W - w1 - 6),
      ty = y - 46;
    rr(tx, ty, w1, 40, 6);
    x.fillStyle = "#000d";
    x.fill();
    x.strokeStyle = "#c9a24a";
    x.stroke();
    x.fillStyle = "#fff";
    x.textAlign = "left";
    x.fillText(HT[0], tx + 8, ty + 16);
    x.fillStyle = "#bbb";
    x.fillText(HT[1], tx + 8, ty + 32);
  }
}

