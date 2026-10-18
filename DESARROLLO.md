# Infinite Depths — Guía para desarrolladores
(La guía para jugadores está en `README.md`.)
Dungeon crawler roguelite 2D en el navegador (HTML5 Canvas + JavaScript, **sin dependencias, sin servidor en producción**).

## Jugar en local
```
npm start        # servidor estático en http://localhost:8080
npm test         # 6 suites sin navegador (DOM simulado)
npm run build    # genera infinite-depths.html (todo en un solo archivo)
```
No hace falta instalar nada: `npm start` solo usa módulos incluidos en Node. Abre la URL en el navegador (no uses `file://`).

## Publicar en GitHub Pages
1. Crea un repositorio y sube el contenido de esta carpeta a la rama `main`.
2. En **Settings → Pages → Build and deployment → Source** elige **GitHub Actions**.
3. Cada `git push` a `main` ejecuta `.github/workflows/pages.yml`: lanza las pruebas y publica `index.html`, `styles.css` y `src/`.
4. El juego quedará en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

Alternativa sin Actions: Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
Todas las rutas son relativas (funciona bajo un subdirectorio), no hay llamadas a servidores ni recursos externos, y el progreso se guarda en `localStorage` del navegador (no se sincroniza entre dispositivos).

## Contenido
- **12 jefes**: 7 normales (profundidades 1–7) y 5 finales (profundidades 10, 20, 30, 40, 50), cada uno con su propia función en `src/10b-jefes.js`. También accesibles desde **Arena de jefes** (menú) al alcanzar su profundidad.
- 3 estilos de combate, 10 elementos con 45 combinaciones, talentos, inventario con equipo, tienda, santuarios, sucesos y salas secretas.
- Controles reasignables (menú → Controles), volumen, música y temblor de pantalla configurables.

## Estructura
- `src/00-dano-frmula-centralizada.js`
- `src/01-entrada.js`
- `src/02-ui-overlay.js`
- `src/03-talentos-victoria-resistencias.js`
- `src/04-magia-elemental-elementos.js`
- `src/05-partida.js`
- `src/06-combate.js`
- `src/07-actualizacion.js`
- `src/08-ventanas-de-tarjetas.js`
- `src/09-sprites-emoji-provisionales.js`
- `src/10-objetos-equipo-e.js`
- `src/10b-jefes.js`
- `src/11-render.js`

## Notas de diseño
- **Daño:** todo pasa por `hit()` y `wd()`; la fórmula está al inicio de `src/00-*.js`.
- **Estadísticas:** `ST()` recalcula desde cero (atributos + equipo + talentos); nunca acumula.
- **Añadir contenido:** armas `WP`, objetos `IT`, reliquias `RL`, enemigos `ET`, talentos `TL`, combinaciones `CB`, jefes `BD`/`BO`.
- **Bucle:** paso fijo de 1/60 s independiente de los FPS.
- **Jefes:** infraestructura común (fases por % de vida, inmunidad `imm`, vulnerabilidad `vul`, zonas telegrafiadas) + comportamiento propio por jefe.


## Android (PWA y APK)
**Estado:** la adaptación táctil, la PWA y la configuración de Capacitor están hechas y comprobadas con pruebas automáticas, pero **el APK no se ha compilado ni probado en un dispositivo** (requiere el SDK de Android).

### Opción A — PWA (sin compilar nada)
Publica en GitHub Pages (HTTPS) y, desde Chrome en Android, *Añadir a pantalla de inicio*. `sw.js` guarda los archivos para jugar sin conexión. Si añades o renombras archivos, ejecuta `npm run pwa` y sube `VERSION` en `sw.js`.

### Opción B — APK en GitHub (recomendada, sin instalar el SDK)
1. Sube el proyecto a GitHub.
2. **Actions → “APK Android (debug)” → Run workflow.**
3. Descarga el artefacto `infinite-depths-debug-apk` (`app-debug.apk`) e instálalo en el teléfono (permite instalar apps de origen desconocido).

### Opción C — APK en local
Requiere Node 20, JDK 17 y Android SDK (Android Studio).
```
npm install --no-save @capacitor/core@6 @capacitor/cli@6 @capacitor/android@6
npm run android:www        # prepara www/
npx cap add android        # una sola vez
# en android/app/src/main/AndroidManifest.xml añade android:screenOrientation="sensorLandscape" a <activity>
npm run android:sync
npm run android:apk        # android/app/build/outputs/apk/debug/app-debug.apk
```
Para una versión firmada de publicación (Google Play) hace falta una clave de firma propia; no se incluye ninguna en el repositorio.

## Arquitectura de los sistemas nuevos
- **Cartas** (`src/10d-cartas.js`): `CARDS` se genera a partir de `EL` y `CB`; requisitos como `['depth'|'boss'|'card', valor]` evaluados por `reqOK`. `checkUnlocks()` se llama al derrotar jefes, descender y morir. `normS()` valida y migra el guardado (v1 → v2).
- **Táctil** (`src/12-tactil.js`): reutiliza `K`, `M`, `dodge()`, `interact()`… Cada control captura su puntero; `tcReset()` libera todo al cambiar de foco, abrir menús o cancelar un toque.
- **Balance:** vida enemiga `hpM()`; límite de proyectiles `capPR()`; agresividad y flanqueo en `slots()` y `upE()`.
- **Práctica:** `G.arena` desactiva todo guardado permanente (`endPractice()`, `die()`, `bossDie()`).
