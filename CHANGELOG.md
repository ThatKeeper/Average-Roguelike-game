# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado semántico.

## [1.1.0] — Balance, cartas del Mago, HUD, revancha y Android
### Corregido
- **Puertas que no se dibujaban / sala del jefe inalcanzable:** la sala secreta se elegía entre *cualquier* sala de combate, también las del camino al jefe; al ocultarse su puerta (a propósito) cortaba la ruta. Medido: en **577 de 1.160 niveles** simulados no existía ninguna ruta visible hasta el jefe. Ahora una sala secreta es siempre un **callejón sin salida**: 0 de 1.160 niveles sin ruta y las salas secretas siguen funcionando (974 en la simulación). Las puertas se dibujan con marco y brillo, y las cerradas muestran barrotes.
### Añadido
- **Cartas de hechizo (solo Mago):** 55 cartas (10 elementos + 45 combinaciones) con requisitos visibles desde el principio (profundidad, jefes derrotados, cartas previas), arrastrar y soltar (ratón y táctil) en 4 espacios y lanzamiento con 1–4. Desbloqueos **permanentes** guardados en `localStorage`, con migración de guardados antiguos y tolerancia a datos corruptos.
- **HUD rediseñado:** casillas con iconos dibujados, tecla asignada, estados (listo, enfriamiento, sin maná, seleccionado), objetos equipados visibles con borde de rareza y etiqueta contextual al pasar el ratón.
- **Android:** controles táctiles (joystick, ATACAR con auto-apuntado, habilidades, esquiva, interactuar, menús y cartas), zonas seguras, aviso en vertical, modo gráfico ligero, ajustes de tamaño, PWA instalable sin conexión, configuración de Capacitor y workflow para generar el APK de prueba.
- **IA en niveles altos:** más cadencia y velocidad con la profundidad, más ataques simultáneos permitidos y **flanqueo en anillo** de los cuerpo a cuerpo desde la profundidad 3.
### Cambiado
- **Vida enemiga:** `(1+0,22·(d−1))·(1+0,35·⌊(d−1)/4⌋)·(1+0,025·máx(0,d−8))`.
- **Límite de proyectiles enemigos:** 120 hasta la profundidad 3 y baja 5 por nivel (mínimo 48); el del jugador (220) es independiente. Al superarlo se descartan los más antiguos.
- **Revancha (Arena de jefes) = práctica:** al derrotar al jefe y entrar en el portal vuelve al menú **sin recompensas, almas, profundidad ni desbloqueos**; morir o abandonar tampoco guardan nada. Las runs normales no cambian.
- El grimorio libre se sustituye por las cartas y queda **exclusivo del Mago**; los demás estilos conservan sus habilidades.
### Pruebas
- 12 suites (234 comprobaciones): puertas en 1.160 niveles, balance, límite de proyectiles, IA y flanqueo, práctica, cartas y persistencia (contextos nuevos que simulan reiniciar el juego), controles táctiles (eventos de puntero simulados), PWA y rutas bajo subdirectorio.
### Limitaciones conocidas
- El APK **no se ha compilado ni probado en un dispositivo real**; tampoco el aspecto ni el tacto de los controles en un teléfono.

## [1.0.1] — Corrección crítica
### Corregido
- **Crash al llegar a la sala del jefe del nivel 2 (y siguientes):** el aura de los jefes se dibujaba sumando un sufijo de transparencia a su color (`'#b87' + '77'`). Con colores de 3 dígitos el resultado era inválido (`#b8777`), el navegador lanzaba un error en cada fotograma y el lienzo quedaba a medias (salas dibujadas dos veces, pantalla corrupta). El jefe 1 usaba un color de 6 dígitos y por eso no fallaba. Ahora un ayudante `hx()` normaliza el color antes de añadir la transparencia.
- Los dibujados de jugador, enemigos y jefes se ejecutan protegidos (`save/restore` garantizado) y, si ocurre un error de render, el lienzo se reinicia en vez de quedarse corrupto.
### Pruebas
- El contexto de lienzo simulado de las pruebas ahora **rechaza colores inválidos** como un navegador real. Nueva suite `tests/render.test.js` que dibuja los 12 jefes, sus copias, los 10 enemigos y al jugador.
- Verificado el flujo completo nivel 1 → 2 → 3 por puertas reales en 25 semillas (75 salas de jefe) sin errores ni jefes duplicados.
### Documentación
- Nuevo `README.md` para jugadores; la guía técnica pasa a `DESARROLLO.md`.

## [1.0.0] — Primera versión completa
### Añadido
- **12 jefes** con comportamiento propio: 7 normales (profundidades 1–7) y 5 finales de tres fases (10, 20, 30, 40, 50): Valdris, Gorgrim, Sylra, Mirax, Veyra, Nyx, Zeth, Soberano de Huesos, Fulgor, Noctis, Cronos y El Vacío. Presentación, barra con estado [INMUNE]/[VULNERABLE], efecto de derrota y **sonidos propios**.
- **Arena de jefes** en el menú (se desbloquean al alcanzar su profundidad).
- **Sprites animados** para jugador y los 10 enemigos normales (balanceo, anticipación, estiramiento al embestir, destello al recibir daño, animación de muerte). Fondos con partículas ambientales, estalactitas y viñeta.
- **IA mejorada:** detección por línea de visión, estado *investigar* (última posición conocida y vuelta a patrullar), esquiva de proyectiles, reposicionamiento de arqueros y magos, y máximo de 3 ataques simultáneos.
- **Rendimiento:** bucle de paso fijo (1/60 s) independiente de los FPS y límite de efectos simultáneos.
- **Ajustes:** volumen y temblor de pantalla. Guardado local tolerante a datos corruptos.
- **GitHub Pages:** flujo `.github/workflows/pages.yml`, `.nojekyll`, rutas relativas y prueba de despliegue bajo subdirectorio.

## [0.9.0] — Sinergias y ventanas
### Añadido
- **33 sinergias nuevas:** las 45 parejas de los 10 elementos tienen combinación propia (contagio de estados, consumo de acumulaciones, ruptura de congelados, zonas…).
### Cambiado
- Las ventanas ya no recortan su contenido: **desplazamiento**, botones en cuadrícula y, en el inventario, **paginación, filtros por ranura y orden**. El grimorio lista solo las sinergias del elemento elegido.
### Corregido
- Botón *Anterior* de la paginación (relacionado con `appendChild`).

## [0.8.0] — Talentos, victoria y resistencias
### Añadido
- **Talentos** (tecla T): 7 pasivas de 3 rangos, 1 punto por nivel.
- **Resistencias elementales** en el equipo; cada bioma inflige un tipo de daño.
- **Pantalla de victoria** en la profundidad 10 (retirarse con gloria o seguir).
- Variantes de enemigo por bioma.
- Proyecto modular con `package.json`, servidor estático sin dependencias y `build.js`.
### Eliminado
- Código muerto (`loot`, `showOld`, `invOld`).
### Corregido
- La pantalla de victoria se cerraba sola (mismo fallo que la de derrota).

## [0.7.0] — Magia elemental y estados
### Añadido
- **10 elementos**, **Grimorio** (tecla B) con elemento principal, secundario y forma (proyectil, nova, cono, zona); lanzamiento con C.
- 12 combinaciones iniciales y **estados alterados**: raíz, fractura, maldición, corrupción, empapado, hemorragia, veneno, quemadura, ralentización y aturdimiento, con reglas de acumulación, resistencia de élites/jefes y limpieza al morir.
- **Tomos mágicos** (escudo, trampa, espíritu, rayo continuo, aliento ígneo).
- Build de dagas: Daga de la Hemorragia, detonación con R y reliquias asociadas.

## [0.6.0] — Objetos y equipo
### Añadido
- **Tarjetas de objetos** con rareza, descripción, estadísticas, requisitos y comparación.
- **Inventario y equipamiento** (casco, armadura, guantes, botas, accesorio) con estadísticas recalculadas sin acumular bonificaciones.
- Ventanas de tarjetas para menú, subida de nivel, cofres, mercader, santuarios y sucesos.
### Cambiado
- Los emojis quedan **solo para los objetos**; el resto vuelve a gráficos dibujados.

## [0.5.0] — Estabilidad del ciclo de partida
### Corregido
- **La pantalla de inicio no aparecía tras perder:** el botón abría el menú y el mismo manejador lo cerraba. Reinicio completo de estado (teclas, enemigos, proyectiles, efectos) al empezar otra partida.
- Embestidas con posición inválida (NaN), cambio de lado al cruzar puertas y bucle detenido por un error puntual.

## [0.4.0] — Contenido y sistemas
### Añadido
- Controles reasignables, acción **R** por clase, armas nuevas, recarga de ballesta.
- Salas secretas y sucesos aleatorios; zonas peligrosas por bioma; patrulla de enemigos; música ambiental.

## [0.1.0] — Base jugable
### Añadido
- Mazmorra infinita procedural con semilla; 3 estilos de combate (cuerpo a cuerpo, distancia, magia); 10 arquetipos de enemigos; jefes iniciales; 8 biomas; salas de combate, élite, tesoro, santuario y mercader; fórmula de daño centralizada; guardado local; Web Audio.
