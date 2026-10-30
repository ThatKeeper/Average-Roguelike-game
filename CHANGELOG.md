# Changelog

Formato basado en *Keep a Changelog*. Los cambios se comparan con la versión anterior, *Infinite Depths*.

## [1.3.7]

### Añadido
- Controles táctiles con iconos, joystick de ataque con icono del arma, cruceta opcional, apuntar al moverse, editor de distribución y distribución automática sin solapes.
- Inventario por slots (32), personaje con equipo, pociones de vida/maná (teclas Z/X y botones táctiles), favoritos, papelera, arrastrar y soltar, atajos (Ctrl/Alt/Mayús + clic, doble toque en móvil).
- Mercader: vender, vender todos los comunes con vista previa y nivel oculto (10/20 compras → 4/5 objetos).

### Cambiado
- Los cofres y el mercader equipan directamente el equipo y las armas; lo sustituido va a la mochila.
- Textos e iconos de talentos corregidos (se veían como "U0001f…"). Minimapa bajo la fila de botones en móvil.

## [1.3.6]

### Añadido
- Tilemaps y tilesets por bioma en las salas; puertas con estado (cerrada/abierta/oculta) y tipo según la sala de destino; sprites de cofre, santuario y mercader.
- Transición de cámara al cruzar puertas y transición de cubitos negros (ascendente/descendente) en cambios de piso, entrada a la mazmorra y regreso al hub.
- Mapa con marco, minimapa que sigue al jugador, salas completadas en blanco y mapa grande con leyenda.

### Cambiado
- Zona jugable de la sala: 40–920 × 40–560 (antes 50–910 × 50–550). Obstáculos y hoyos alineados a tiles de 40 px.
- Puertas: 80 px arriba/abajo y 120 px a los lados.

## [1.3.4]

### Renombrado
- *Infinite Depths* → **Average roguelike game** (título de la pestaña, pantalla de título y hub).
- Se mantiene la clave de guardado (`idv1`): el progreso anterior se conserva.

### Añadido

**Pantalla de título y hub**
- Pantalla de título animada (antorchas, brasas) con botón COMENZAR y fundido de salida. Efecto al pasar el ratón: las letras del título se elevan, las brasas se apartan del cursor y el botón crece, brilla y suelta chispas.
- **Hub** (habitación central, sustituye al menú de botones) con 10 puntos de interacción (`F` o clic): puerta de la mazmorra, pedestal de clases, tablón de logros, bestiario, mesa de estadísticas, forja de almas, arena de jefes, campo de entrenamiento, cartel de progresión y créditos, y ajustes.
- Selección de clase con descripción, estadísticas, estilo y habilidades, y confirmación antes de entrar.
- El menú antiguo se conserva dentro de **Ajustes**.
- **Campo de entrenamiento**: maniquíes, arquero de práctica y combatiente; sin XP, oro, botín, logros ni progreso; no se puede morir.

**Jefes**
- **32 jefes nuevos** (22 normales y 10 finales): 44 jefes en total, 15 finales.
- **Diseño propio por jefe nuevo:** firma única con nombre (8 geometrías × parámetros propios), rasgo pasivo (8 tipos), combo propio tras la firma, firma reforzada en la fase 3 de los finales y satélites orbitales distintos. Las 32 combinaciones geometría + rasgo son únicas.
- 13 ataques nuevos con aviso visual: lluvia de meteoros, onda expansiva, cruz mortal, espiral, plaga rastreadora, embestida telegrafiada, convocar secuaces, abanico, anillos concéntricos, minas retardadas, barrido, salto sombrío y jaula.
- Jefes normales con 5 ataques; finales con 7 y **3 fases** (fase 3: colapso del suelo e inversión de controles). 6 formas visuales nuevas y corona para los finales.
- **Ataques extra** también para los 12 jefes originales.
- **Rotación:** el orden de jefes se baraja en cada partida y cualquier jefe puede aparecer en cualquier bioma.
- **Patrón aleatorio:** los ataques se eligen al azar sin repetir el anterior; las ventanas de vulnerabilidad aparecen tras 3–5 ataques. Los jefes antiguos con secuencia fija también eligen al azar.
- Arena de jefes ampliada a 44 entradas con profundidad de desbloqueo propia.

**Logros y bestiario**
- **34 logros** persistentes con id estable, fecha y +10 almas; 2 ocultos. Pantalla de logros con progreso.
- **Bestiario**: fichas bloqueadas hasta derrotar al enemigo, con datos del combate real, filtro, búsqueda por nombre, porcentaje total y aviso de descubrimiento.
- Estadísticas acumuladas y mesa de estadísticas en el hub. La Arena y el Entrenamiento no cuentan.

**Modo difícil**
- Se desbloquea **permanentemente al derrotar al jefe de la profundidad 10**, con aviso único *“Todo se ha vuelto un poco más difícil”* e indicador ☠ permanente (HUD, título y hub).
- Enemigos +20 % de vida y +12 % de daño.
- Pisos de 10–20 salas (antes 5–12) con bucles y rutas alternativas, segunda cámara secreta, más obstáculos y oleadas mayores (hasta 18). Minimapa centrado en la sala actual.

**Terreno de las salas (estilo The Binding of Isaac)**
- 13 plantillas con **hoyos** (bloquean el paso, no proyectiles ni línea de visión) y **muros**, sin cambiar el tamaño de las salas. Alrededor del **40 %** de las salas las usan; el 60 % son salas comunes, también entre las de jefe.
- Cada plantilla se valida automáticamente (puertas, centro y suelo libre conectados). Jefes: solo plantillas abiertas. Modo difícil: puede combinar dos plantillas.

**Forja de almas rediseñada** (ver *Cambiado*): 10 mejoras permanentes tipo Vampire Survivors.

**Parry perfecto**
- Ventana de 0,22 s, sonido, destello, pausa de impacto de 0,07 s, aturdimiento del atacante y devolución del doble de su daño.
- Reflejo de proyectiles hacia el enemigo más cercano (más velocidad, doble de daño, sin reflejo en bucle).
- Enfriamientos de 0,9 s (tras éxito) y 0,45 s (tras soltar la guardia) con indicador visual.

**Armas, botín y escalado**
- Barra de munición junto al personaje para armas con cargador; tiempo de recarga configurable por arma.
- Armaduras legendarias *Coraza del Coloso* y *Yelmo del Abismo*.
- Bonificación por ranuras vacías en el botín (peso ×1,5 en la elección y hasta +3 % de probabilidad de soltar objeto).
- **Escalado adaptativo:** vida enemiga con tu daño y vida máxima (tope +120 %); daño enemigo con tu vida máxima y algo con tu daño (tope +60 %).

**Ajustes y versiones**
- Volumen separado de **música** y **efectos**, además del general.
- **Sistema de versiones del guardado** (`HARD_RESET`, `SOFT_RESET`, `GAME_VERSION`, al inicio del script):
  - `HARD_RESET` +1 → borra todo (desde cero).
  - `SOFT_RESET` +1 → reinicia solo el progreso (`SOFT_WIPE`) y conserva logros, bestiario, estadísticas, jefes derrotados y ajustes.
  - Los guardados antiguos sin versión se adoptan sin perder nada.
  - Aviso en el título tras un reinicio y número de versión visible (`v1.3.4`).
  - El service worker se registra como `sw.js?v=<GAME_VERSION>` para forzar su actualización.

### Cambiado

**Armas**
- Dagas, Lanza, Hachas dobles y Daga de la Hemorragia pasan de escalar con Destreza a **Fuerza**; ahora todas las armas cuerpo a cuerpo escalan con Fuerza. Descripciones de atributos actualizadas.
- **Arco:** cadencia 0,34 s → 0,38 s; daño ×0,9 → ×0,85; cargador sin límite → **12**; recarga **1,9 s**. Daño sostenido aproximado −40 %. Sin reserva de munición.

**Robo de vida**

| Fuente | Antes | Ahora |
|---|---|---|
| Hoja sedienta | 3 % | 1,5 % |
| Anillo sangriento | 4 % | 2 % |
| Talento Sed de sangre | 2 % por rango | 1 % por rango |
| Sangre (elemento) | 5 % del daño del hechizo | 2 % |
| Pacto carmesí | 12 % | 5 % |
| Sangre ardiente | 10 % | 4 % |
| Savia carmesí | 15 % | 5 % |

- Tope global: 6 % del daño por golpe y 3 % de la vida máxima por golpe. El daño periódico y el daño devuelto por parry no curan.

**Rarezas y botín**
- Niveles 0–5: nada por encima de *raro* (botín, cofres, mercader, reliquias). Nivel 6+: épico/legendario con probabilidad reducida.
- Probabilidad de objeto de enemigos comunes: 6 % + Suerte×0,3 % → 4 % + Suerte×0,2 % (+ bonus por ranuras vacías).

**Forja de almas**
- Reinicio total. Antes: +6 % de daño por nivel sin tope. Ahora: **Poder +0,5 % por nivel, máx. 50 niveles (+25 %)**, más Vigor, Armadura, Recuperación, Enfriamiento, Celeridad, Imán, Codicia, Crecimiento y Renacer.
- Migración: las almas gastadas en el sistema antiguo se **reembolsan** y el nivel antiguo pasa a 0.

**Jefes**
- Inmunidad: 90 % → **99 %**.
- Aturdimiento: antes limitado a 0,6 s cada 5 s; ahora los jefes **ignoran** aturdimiento, congelación y enraizamiento.
- Tope de daño: máximo 10 % de su vida por golpe y 25 % por segundo; imposible matar a un jefe de un golpe.
- Requisitos de cartas con jefes: de *“derrotar a X”* a *“derrotar a N jefes distintos”* (compatible con la rotación).
- La rotura de obstáculos de Gorgrim ya no elimina hoyos.

**Mercader y navegación**
- El inventario del mercader se genera una vez por sala y se conserva.
- Los botones “Volver”, la muerte y la victoria regresan al hub.

**Migración del modo difícil**
- Guardados con mejor profundidad ≥ 11 reciben el modo difícil automáticamente; el desbloqueo por nivel sin haber superado el jefe de la profundidad 10 se retira.

### Corregido
- **Primer jefe (Valdris):** ya no retrocede al ejecutar su finta; hace una pausa con destello en su sitio.
- **Mercader:** el inventario ya no se regenera al reabrirlo.
- **Bloqueos de jefe:** al morir un jefe se eliminan los enemigos restantes de la sala, y un temporizador anti-bloqueo (20 s sin daño) elimina inmunidades, orbes, señuelos y esbirros y lo deja vulnerable.
- **Armaduras legendarias:** ahora pueden generarse (antes no existía ninguna).

### Eliminado
- Nada. El menú antiguo sigue accesible desde Ajustes.

### Limitaciones conocidas
- Las salas mantienen el tamaño de pantalla.
- Los 32 jefes nuevos comparten el motor de ataques (sin animaciones ni escenas únicas).
- No hay sonidos de ambiente.
- Las pruebas fueron simulaciones automáticas (generación de pisos y terreno, 44 jefes, parry, forja, migraciones, versiones de guardado, logros, entrenamiento); no se jugó en un navegador real.
