# Changelog

Formato basado en *Keep a Changelog*. Los cambios se comparan con la versión anterior, *Infinite Depths*.

## [Sin publicar]

### Cambiado
- **Manos de la animación de muerte** rediseñadas: ya no son un círculo con dedos, sino manos pálidas y huesudas con palma anatómica, cuatro dedos y pulgar de tres falanges (nudillos, pliegues y uñas) y antebrazo fino que se pierde en la oscuridad (`render/death.js`, `drawHand`).
- **Bendición del santuario (+10 % de daño)**: solo se puede acumular **3 veces por partida** (el altar muestra el contador y, al llegar al máximo, la opción queda desactivada).
- **Bastión (Tanque)**: la sobrevida (escudo) ahora **dura 3 s** y después se pierde; el enfriamiento sube de 12 s a **16 s**.
- **Jefes hechos a mano.** Se eliminan los kits de ataques compartidos (`AT2`, `KIT`, `SIG`, `xat`): cada uno de los 32 jefes nuevos (índices 12-43) tiene su propia mecánica, ataques, ventana de vulnerabilidad y dibujo (`bosses/boss-roster-*.js`). Los 12 originales conservan su comportamiento y reciben un ataque extra exclusivo cada uno (`boss-roster-orig.js`).
- **Jefes por bioma**: cada jefe pertenece a un bioma (`BIO_N` / `BIO_F` en `boss-core.js`) y solo aparece en él; dentro del bioma rotan según la semilla. Los jefes finales (pisos 10, 20, 30...) salen en los biomas impares. El desbloqueo de la arena/bestiario usa la primera profundidad en la que puede aparecer cada jefe (y también se puede practicar uno ya derrotado).
- Nuevo sistema de peligros de jefe con forma (`BHZ`): rayos, anillos, conos, charcos, telarañas y barras giratorias o perseguidoras.

### Añadido
- **Debug**: nuevos grupos en el panel (`debug/debug-features.js`):
  - *Pisos y modo*: viaje rápido a los pisos 1-40, piso −1 / +1, ir a la sala del jefe, atajo «piso 10 · jefe a 1 PV» para probar el final e interruptor de **modo difícil**.
  - *Cinemáticas*: lanzar el final de la Parca, saltarlo (+10 s o hasta el golpe), ver sus estadísticas, la escena de muerte, la presentación del jefe secreto, la ventana de victoria y la transición de cubos; botón para cancelar cualquier cinemática en curso.
- **Final del piso 10** (solo la primera vez, fuera del modo difícil, y es la entrada a este): al caer el jefe todo se oscurece dejando solo al protagonista, la HUD desaparece y la cámara hace zoom. Se puede caminar, pero despacio. Unas manos se asoman por el borde superior, primero agarrándose y luego acercándose a rastras, mientras una **Parca** (sprite pixel art propio) camina hacia él. Cuando lo alcanza, un guadañazo le quita el 100 % de la vida y las manos se lo llevan; después aparece la pantalla de estadísticas (`render/finale.js`).

## [1.3.9]

### Cambiado
- **Talentos rehechos como árbol de mejoras de clase** (`game/talents.js`, tecla T): se eliminan los 7 talentos generales. Cada una de las 9 clases tiene 3 ramas × 3 mejoras (81 únicas) que se desbloquean en cadena y se compran con 1 punto por nivel; efectos pequeños y propios de las habilidades de la clase (área, duración, enfriamiento, coste de maná, nº de proyectiles, parry, hemorragia...). Nueva ventana con ramas, rangos y mejoras bloqueadas (`css/windows.css`, `.tt-*`). Los modificadores se suman en `P.tm` (`tmCalc`, `tv()`).
- **Asesino:** robo de vida nerfeado (tope 3 % del daño, 1 % de la vida máx. por golpe y 3 % de la vida máx. por segundo; antes 6 %, 3 % por golpe y sin límite por segundo).
- **Martillo:** daño ×2,5 → ×2,0 y tiempo entre golpes 0,95 s → 1,2 s.

### Corregido
- **Iconos de habilidades y barras del HUD que no cargaban** al abrir `index.html` de la raíz (modo sin build): faltaba el cargador del HUD (`hudLoad()` + rutas de `src/assets/hud`).
- **Diálogo del mercader** salía a un lado y desplazaba la pantalla: el `index.html` de la raíz no enlazaba `secret.css`.
- **Sala de pruebas inaccesible:** `hubFrame` solo gestionaba la sala de clases (`G.hr == 1`) y en la sala de pruebas devolvía al jugador a la sala de clases.
- El arma en mano ya solo se muestra en la sala de pruebas y en la mazmorra; el personaje sin clase no muestra barras ni habilidades.

### Añadido
- Las barras de vida/oro (arriba a la izquierda) y el minimapa (arriba a la derecha) se vuelven semitransparentes cuando el jugador o un enemigo se acerca, para ver lo que hay detrás.
- Contador de oro con icono de moneda prerenderizado (`icons/coin.png`) y número que sube/baja animado. El piso actual se muestra con icono (`icons/stairs.png`) en el mapa grande; se quitó el indicador de arma y el texto de profundidad junto a las barras.
- Barras de vida, maná y experiencia renovadas, con el estilo de la barra de jefes (estela de daño, destellos, pulso con poca vida, escudo).
- Diálogo del mercader en cuadro de texto con retrato; cada frase repite la animación de entrada.
- Animación de muerte (oscuridad, manos blancas, forcejeo y arrastre) y pantalla de estadísticas de la partida (todas las manos salen de la parte superior de la pantalla; clic o Enter para saltar la escena).
- Menús de pausa y ajustes rediseñados al estilo del inventario (pestañas, deslizadores, interruptores, teclas); `css/windows.css`, `render/death.js`.

## [1.5.0]

### Corregido
- Errores de CORS del manifiesto en la consola al abrir el juego desde un archivo local (file://): ahora solo se enlaza con http(s).
- **Veredicto** (R del Guerrero): ahora usa el swing real del arma equipada (sprite, trayectoria y hitbox actuales) en lugar del cono antiguo.
- Los golpes cuerpo a cuerpo se cancelaban al instante fuera de la mazmorra (el swing comprobaba solo el estado de partida).
- **Sala de pruebas** separada de la sala de clases: solo allí se puede atacar y usar habilidades; en la sala de clases el combate está desactivado.
- Sala de clases con más separación entre clases (nombres a un lado, sin solaparse) y trazos visibles también hacia las clases bloqueadas (discontinuos, con candado).
- El suelo y las paredes con el tilemap del juego aparecen ahora también en el hub y en la sala de pruebas (antes solo en la sala de clases).
- Un clic en el arco de la sala de clases del hub te lleva directamente, sin tener que acercarte.
- Sin clase elegida el personaje recupera el aspecto original (círculo blanco); el diseño de cada clase solo se aplica al elegirla.
- Iconos de habilidades redibujados a 32 px con suavizado y contorno, y un icono propio por elemento para las cartas de hechizo (antes todas usaban el mismo según su forma).
- Arco de la estela del anillo y otros ajustes menores de dibujo.

### Añadido
- Debug: botón «Activar quest» para probar el contenido secreto (atajo de pruebas).
- Contenido secreto en las profundidades. Los detalles se descubren jugando.

## [1.4.0]

### Añadido
- **Tilemap y sprites del HUD** (`src/assets/hud`): marcos de casillas, barras de vida/maná/experiencia, paneles, tapas de tecla, huecos de equipo e iconos de 45 habilidades/pociones. Sustituyen al HUD dibujado con formas; los botones táctiles usan los mismos iconos. Se regeneran con `scripts/gen_hud_assets.py`.
- **Sala de clases** a la derecha del hub (arco en la pared derecha, transición con la cámara): árbol ramificado por estadística (Fuerza, Destreza, Inteligencia) con un pedestal por clase que muestra su aspecto, requisitos de desbloqueo y la ficha completa de habilidades.
- **6 clases nuevas (2 por rama)**, cada una con su arma inicial, aspecto propio y habilidades Q, E y R únicas:
  - Fuerza: **Tanque** (Martillo) y **Asesino** (Dagas).
  - Destreza: **Ballestero** (Ballesta) y **Disparador rúnico** (Arma rúnica).
  - Inteligencia: **Mago de fuego y hielo** (Báculo ígneo; sus disparos alternan fuego y hielo) y **Alquimista** (Báculo venenoso; todo lo que toca queda envenenado).
- Pedestales oscurecidos con cartel **PRÓXIMAMENTE** para las armas sin clase (Gran espada, Lanza, Hacha, Hachas dobles, Chakram, Báculo helado, de tormenta y de marea).
- **Requisitos de desbloqueo** permanentes (profundidad, jefes distintos, enemigos derrotados, parries perfectos). Avisos al cumplirlos.
- **Habilidad de rama (tecla C)**, siempre disponible: Fuerza = guardia/parry (también clic derecho), Destreza = reiniciar enfriamientos, Inteligencia = recargar maná.
- Habilidad R única para **Guerrero** (Veredicto), **Cazador** (Lluvia de flechas) y **Mago** (Sobrecarga arcana).
- Al elegir clase en la sala, el personaje la recibe al instante (arma, HUD y habilidades) y puedes probarla contra maniquíes en la zona de pruebas.
- Si intentas descender sin clase, el botón **Elegir clase** te teletransporta con una animación a la sala de clases.

### Cambiado
- Las habilidades Q/E/R dependen de la **clase** y no del arma. El sistema de magia (cartas, grimorio y hechizos de Inteligencia) solo está activo mientras llevas un **arma mágica**; se recupera al volver a equiparla.
- Pedestal de clases del hub sustituido por la sala de clases; la Forja de almas se movió al centro-izquierda.

### Eliminado
- Los **tomos de hechizo** (escudo, trampa, espíritu, rayo, cono) y la antigua acción de clase de la tecla R.

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
