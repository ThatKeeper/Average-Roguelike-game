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
 *   6. Inserta los tilesets, puertas y props de src/assets/world/ (data-URI) en lugar del
 *      marcador `/*__WORLD_ASSETS__*\/ {}` (módulo js/render/tiles.js).
 *   7. Inserta el tilemap y los iconos del HUD de src/assets/hud/ (data-URI) en lugar del
 *      marcador `/*__HUD_ASSETS__*\/ {}` (módulo js/render/hud-assets.js).
 *   8. Inserta los 55 iconos de hechizo de src/assets/spells/ (data-URI) en lugar del
 *      marcador `/*__SPELL_ICONS__*\/ {}` (módulo js/render/spell-icons.js).
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

/** Devuelve { ts:[8 tilesets], d2:[8 puertas 2 casillas], d3:[8 puertas 3 casillas], pr:{props} } como data-URI. */
function loadWorldAssets() {
  const base = path.join(SRC, "assets", "world");
  const uri = (f) => "data:image/png;base64," + fs.readFileSync(f).toString("base64");
  const list = (d) =>
    fs.existsSync(path.join(base, d))
      ? fs.readdirSync(path.join(base, d)).filter((f) => f.endsWith(".png")).sort()
      : [];
  const out = { ts: [], d2: [], d3: [], pr: {} };
  for (const f of list("tilesets")) out.ts.push(uri(path.join(base, "tilesets", f)));
  for (const f of list("doors2")) out.d2.push(uri(path.join(base, "doors2", f)));
  for (const f of list("doors3")) out.d3.push(uri(path.join(base, "doors3", f)));
  for (const f of list("props")) out.pr[f.replace(/_16x16\.png$/, "")] = uri(path.join(base, "props", f));
  return out;
}

/** Devuelve { atlas: data-URI del tilemap, map: {nombre:[x,y,w,h]}, icons: {id: data-URI} } del HUD. */
function loadHudAssets() {
  const base = path.join(SRC, "assets", "hud");
  const uri = (f) => "data:image/png;base64," + fs.readFileSync(f).toString("base64");
  const out = { atlas: "", map: {}, icons: {} };
  if (!fs.existsSync(base)) return out;
  const png = path.join(base, "hud_tilemap.png"),
    js = path.join(base, "hud_tilemap.json");
  if (fs.existsSync(png)) out.atlas = uri(png);
  if (fs.existsSync(js)) out.map = JSON.parse(read(js)).rects || {};
  const dir = path.join(base, "icons");
  if (fs.existsSync(dir))
    for (const f of fs.readdirSync(dir).sort()) if (f.endsWith(".png")) out.icons[f.replace(/\.png$/, "")] = uri(path.join(dir, f));
  return out;
}

/** Devuelve { "fire": data-URI, "fire_ice": ... } con los 55 iconos de hechizo de src/assets/spells. */
function loadSpellIcons() {
  const dir = path.join(SRC, "assets", "spells"),
    out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).sort())
    if (f.endsWith(".png")) out[f.replace(/\.png$/, "")] = "data:image/png;base64," + fs.readFileSync(path.join(dir, f)).toString("base64");
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
  const world = loadWorldAssets();
  const hudA = loadHudAssets();
  const spi = loadSpellIcons();

  const scripts = modules
    .map((m) => {
      const file = path.join(SRC, m);
      if (!fs.existsSync(file)) throw new Error("Falta el módulo listado en modules.json: " + m);
      let code = read(file);
      code = code.replace("/*__WEAPON_SPRITES__*/ {}", () => JSON.stringify(sprites, null, 2));
      code = code.replace("/*__WORLD_ASSETS__*/ {}", () => JSON.stringify(world));
      code = code.replace("/*__HUD_ASSETS__*/ {}", () => JSON.stringify(hudA));
      code = code.replace("/*__SPELL_ICONS__*/ {}", () => JSON.stringify(spi));
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
  console.log(`dist/index.html listo (${kb} KB, ${modules.length} módulos, ${Object.keys(sprites).length} sprites, ${world.ts.length} tilesets, ${world.d2.length + world.d3.length} hojas de puertas, ${Object.keys(hudA.icons).length} iconos de HUD, ${Object.keys(spi).length} iconos de hechizo)`);
}

build();
