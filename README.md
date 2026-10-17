# Infinite Depths
Dungeon crawler roguelite 2D en el navegador (HTML5 Canvas + JavaScript, **sin dependencias, sin servidor en producción**).

## Jugar en local
```
npm start        # servidor estático en http://localhost:8080
npm test         # 6 suites sin navegador (DOM simulado)
npm run build    # genera infinite-depths.html (todo en un solo archivo)
```
No hace falta instalar nada: `npm start` solo usa módulos incluidos en Node. Abre la URL en el navegador (no uses `file://`).

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
