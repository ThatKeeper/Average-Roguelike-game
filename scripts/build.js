#!/usr/bin/env node
/* ======================================================================
 * scripts/build.js
 * Empaqueta src/ en un único dist/index.html (sin dependencias externas).
 *
 * Uso:   node scripts/build.js          (o:  npm run build)
 *
 * Qué hace:
 *   1. Lee src/index.template.html.
 *   2. Sustituye {{css/archivo.css}} por el contenido de src/css/archivo.css.
 *   3. Sustituye {{scripts}} por todos los módulos de src/js, en el orden
 *      indicado en src/modules.json (el orden importa: es un único <script>
 *      global, así que cada módulo ve lo definido por los anteriores).
 *   4. Inserta los sprites de src/assets/sprites/*_16x16.png como data-URI
 *      en lugar del marcador `/*__WEAPON_SPRITES__*\/ {}` (así el juego
 *      sigue siendo un solo archivo y funciona abriéndolo con doble clic).
 *   5. Copia src/public/* (manifest, iconos, service worker...) a dist/.
 * ====================================================================== */

"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");

const read = (p) => fs.readFileSync(p, "utf8");

/** Devuelve { nombre: "data:image/png;base64,..." } con los sprites *_16x16.png. */
function loadSprites() {
  const dir = path.join(SRC, "assets", "sprites");
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).sort()) {
    const m = /^(.+)_16x16\.png$/.exec(f);
    if (!m) continue;
    out[m[1]] = "data:image/png;base64," + fs.readFileSync(path.join(dir, f)).toString("base64");
  }
  return out;
}

/** Copia recursivamente src/public a dist (si existe). */
function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    e.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

function build() {
  const modules = JSON.parse(read(path.join(SRC, "modules.json")));
  const sprites = loadSprites();

  const scripts = modules
    .map((m) => {
      const file = path.join(SRC, m);
      if (!fs.existsSync(file)) throw new Error("Falta el módulo listado en modules.json: " + m);
      let code = read(file);
      code = code.replace("/*__WEAPON_SPRITES__*/ {}", () => JSON.stringify(sprites, null, 2));
      return "// ---- src/" + m + " ----\n" + code;
    })
    .join("");

  let html = read(path.join(SRC, "index.template.html"));
  html = html.replace(/\{\{css\/([\w.\-]+)\}\}/g, (_, n) => read(path.join(SRC, "css", n)));
  html = html.replace("{{scripts}}", () => scripts);

  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, "index.html"), html);
  copyDir(path.join(SRC, "public"), DIST);

  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(`dist/index.html listo (${kb} KB, ${modules.length} módulos, ${Object.keys(sprites).length} sprites)`);
}

build();
