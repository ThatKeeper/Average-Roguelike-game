#!/usr/bin/env node
// Empaqueta el juego en UN solo archivo (dist/index.html): CSS y JS incrustados,
// respetando el orden de <script src> de index.html. Útil para compartirlo o subirlo suelto.
// Uso: node scripts/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
let html = read('index.html');

// CSS local -> <style>
html = html.replace(/<link rel="stylesheet" href="([^"]+)"\s*\/?>/g, (_, href) => `<style>\n${read(href)}</style>`);

// JS local -> un único <script> (se quitan todas las etiquetas y se añade una al final)
const files = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"[^>]*><\/script>/g)].map((m) => m[1]);
const js = files.map((f) => `// ---- ${f} ----\n${read(f)}`).join('\n');
html = html.replace(/\s*<script[^>]*\ssrc="[^"]+"[^>]*><\/script>/g, '');
html = html.replace(/\s*<!-- IMPORTANTE[\s\S]*?-->/, '');
html = html.replace('</body>', `<script>\n${js.replace(/<\/script>/gi, '<\\/script>')}</script>\n</body>`);

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/index.html'), html);
console.log(`✓ dist/index.html (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB, ${files.length} scripts incrustados)`);
