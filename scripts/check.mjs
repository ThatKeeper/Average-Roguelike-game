#!/usr/bin/env node
// Comprueba el proyecto sin dependencias externas:
//  1. todos los <script src> de index.html existen y tienen sintaxis válida
//  2. no hay archivos en src/js que falten en index.html
//  3. no hay funciones/constantes de nivel superior duplicadas entre archivos
//     (en scripts clásicos la última función "gana" en silencio: así se rompió la tecla R)
// Uso: node scripts/check.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const listed = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
const problems = [];

// 1. existencia + sintaxis
const decls = new Map(); // nombre -> [archivos]
for (const rel of listed) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) { problems.push(`No existe: ${rel}`); continue; }
  const code = fs.readFileSync(file, 'utf8');
  try { new vm.Script(code, { filename: rel }); }
  catch (e) { problems.push(`Sintaxis en ${rel}: ${e.message}`); }
  for (const m of code.matchAll(/^(?:async\s+)?function\s+([\w$]+)|^(?:const|let|var)\s+([\w$]+)/gm)) {
    const name = m[1] || m[2];
    if (!decls.has(name)) decls.set(name, []);
    decls.get(name).push(rel);
  }
}

// 2. archivos huérfanos
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk(path.join(root, 'src/js'))) {
  const rel = path.relative(root, f).split(path.sep).join('/');
  if (f.endsWith('.js') && !listed.includes(rel)) problems.push(`Sin cargar en index.html: ${rel}`);
}

// 3. duplicados
for (const [name, files] of decls) if (files.length > 1) problems.push(`Nombre duplicado "${name}" en: ${files.join(', ')}`);

if (problems.length) { console.error('✗ Problemas:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log(`✓ ${listed.length} scripts correctos, ${decls.size} nombres globales únicos.`);
