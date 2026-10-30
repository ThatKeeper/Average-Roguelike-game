# Average roguelike game

Roguelike de mazmorras con vista cenital, en un único archivo HTML (canvas + JavaScript, sin dependencias). Basado en *Infinite Depths*.

**Versión actual: 1.3.9**

- **Archivo del juego:** `average-roguelike-game.html`
- **Cómo jugar:** abre el archivo en un navegador moderno (escritorio o móvil). No necesita instalación ni servidor.
- **Guardado:** `localStorage` (clave `idv1`), con sistema de versiones (ver [Versiones del guardado](#versiones-del-guardado)).

> El HTML enlaza `manifest.webmanifest`, `sw.js` y `icons/` (PWA). Esos archivos no forman parte de este paquete; el juego funciona igual sin ellos.

---

## Flujo del juego

1. **Pantalla de título** animada → clic o cualquier tecla.
2. **Hub** (habitación central) → mueves a un personaje en blanco y te acercas a los objetos (`F` o clic).
3. **Mazmorra** → pisos con salas, un jefe al final de cada piso, descenso cada vez más difícil.
4. Al morir vuelves al hub; conservas almas, mejoras de la forja, logros y bestiario.

### El hub

| Objeto | Función |
|---|---|
| Puerta de la mazmorra | Inicia la partida con la clase elegida (pide confirmación) |
| Sala de clases (arco de la derecha) | 9 clases ramificadas por estadística; al elegir una se equipa. A su derecha, la sala de pruebas con maniquíes (único sitio donde se combate fuera de la mazmorra) |
| Tablón de logros | Lista de logros, progreso y fecha de desbloqueo |
| Bestiario | Fichas de enemigos y jefes descubiertos, con filtro y búsqueda por nombre |
| Mesa de estadísticas | Datos acumulados de todas tus partidas |
| Forja de almas | Mejoras permanentes que se compran con almas |
| Arena de jefes | Practicar cualquiera de los 44 jefes (sin recompensas) |
| Campo de entrenamiento | Maniquíes, arquero de práctica y combatiente para probar ataques, habilidades, parry y esquivas |
| Cartel de progresión y créditos | Explica el modo difícil y la progresión |
| Ajustes | Controles, música, volúmenes (general, música, efectos), temblor de pantalla, controles táctiles, gráficos |

El entrenamiento y la arena **no dan** experiencia, botín, oro, logros ni progreso.

---

## Controles (reasignables en Ajustes → Controles)

| Acción | Tecla |
|---|---|
| Mover | `W A S D` |
| Apuntar / atacar | Ratón / clic izquierdo |
| Habilidad o guardia (parry) | Clic derecho |
| Esquivar | `Espacio` |
| Habilidades de clase | `Q`, `E`, `R` (únicas de cada clase) |
| Habilidad de rama | `C` (parry / reiniciar enfriamientos / recargar maná) |
| Interactuar | `F` |
| Inventario / Mapa / Mejoras de clase | `I` / `M` / `T` |
| Cartas de hechizo (Mago) | `B` y `1`–`4` |
| Pausa | `Esc` |

En móvil se muestran controles táctiles (joystick y botones), configurables en Ajustes.

---

## Clases y armas

Tres ramas por estadística; cada base tiene dos clases avanzadas que se desbloquean con requisitos permanentes.

| Rama | Clase | Arma inicial | Q / E / R |
|---|---|---|---|
| Fuerza | Guerrero | Espada | Remolino / Salto con impacto / Veredicto |
| Fuerza | Tanque | Martillo | Onda sísmica / Bastión / Golpe del coloso |
| Fuerza | Asesino | Dagas | Paso sombrío / Lluvia de dagas / Danza mortal |
| Destreza | Cazador | Arco | Andanada / Flecha explosiva / Lluvia de flechas (clic der.: flecha venenosa) |
| Destreza | Ballestero | Ballesta | Virote perforante / Trampa de púas / Fuego de asedio |
| Destreza | Disparador rúnico | Arma rúnica | Runas buscadoras / Sello rúnico / Sobrecarga rúnica |
| Inteligencia | Mago | Báculo arcano | Bola de fuego / Nova de hielo / Sobrecarga arcana (clic der.: rayo en cadena) |
| Inteligencia | Mago de fuego y hielo | Báculo ígneo | Llamarada / Glaciar / Choque térmico |
| Inteligencia | Alquimista | Báculo venenoso | Frasco corrosivo / Nube tóxica / Pandemia |

- **Habilidad de rama (`C`)**: Fuerza = guardia/parry (mantener, también clic derecho), Destreza = reiniciar enfriamientos, Inteligencia = recargar maná.
- Las clases de **Inteligencia** solo tienen hechizos y cartas mientras llevas un arma mágica equipada.
- Requisitos de las clases avanzadas: Tanque (prof. 3 + 15 parries perfectos), Asesino (prof. 4 + 300 enemigos), Ballestero (prof. 3 + 2 jefes), Disparador rúnico (prof. 5 + 3 jefes), Mago de fuego y hielo (prof. 4 + 250 enemigos), Alquimista (prof. 6 + 3 jefes).

- Todas las armas **cuerpo a cuerpo escalan con Fuerza**. Las de distancia escalan con Destreza y las mágicas con Inteligencia.
- Las armas con cargador (Arco, Ballesta, Arma rúnica) muestran una **barra de munición** junto al personaje con el progreso de recarga. No hay reserva de munición: la recarga es gratuita.

---

## Combate

### Parry (armas cuerpo a cuerpo)
- Mantén el clic derecho para la guardia: reduce el daño recibido.
- Los primeros **0,22 s** son la ventana de **parry perfecto**: anula el golpe, aturde al atacante (los jefes son inmunes), le **devuelve el doble de su daño** y activa sonido, destello y una pausa de impacto de 0,07 s.
- Un parry perfecto sobre un **proyectil** lo refleja hacia el enemigo más cercano, con más velocidad y el doble de daño. Un proyectil reflejado no se puede reflejar de nuevo.
- Enfriamiento: 0,9 s tras un parry perfecto y 0,45 s tras soltar la guardia (evita el spam). El borde de la guardia es blanco (perfecto disponible), gris (enfriamiento) o azul (guardia normal).
- Solo afecta a golpes y proyectiles con atacante; las zonas de área no se pueden parar.

### Robo de vida
Fuentes reducidas, con tope de **6 %** del daño por golpe y máximo **3 % de la vida máxima** por golpe. El daño periódico (veneno, quemadura, hemorragia) y el daño devuelto por parry no curan. La regeneración (forja) es independiente.

**Asesino:** el robo de vida está más limitado: tope de **3 %** del daño por golpe, máximo **1 % de la vida máxima** por golpe y como mucho **3 % de la vida máxima por segundo** (así la Danza mortal y las dagas rápidas ya no lo mantienen inmortal).

### Mejoras de clase (tecla T)
Los talentos generales se han sustituido por un **árbol de mejoras exclusivo de cada clase**: 3 ramas de 3 mejoras (81 en total, ninguna repetida). Cada nivel da 1 punto; una mejora se desbloquea al completar los rangos de la anterior de su rama, y los puntos no dan para todo el árbol (16-18 por clase), así que hay que elegir qué rama profundizar. Los efectos son pequeños (más radio o duración de una habilidad concreta, menos maná o enfriamiento, +1 proyectil, etc.) y solo afectan a la clase que los aprende.

**Martillo (Tanque):** daño ×2,0 (antes ×2,5) y 1,2 s entre golpes (antes 0,95 s).

### Estados
Los jefes **ignoran** aturdimiento, congelación y enraizamiento. Enemigos normales y élites siguen sufriéndolos (reducido en élites).

---

## Dificultad

- La vida y el daño de los enemigos crecen con la profundidad.
- **Escalado adaptativo:** la vida enemiga sube con tu daño y tu vida máxima (hasta +120 %); el daño enemigo sube con tu vida máxima y algo con tu daño (hasta +60 %).
- **Modo difícil:** se desbloquea **permanentemente al derrotar al jefe de la profundidad 10**, con un aviso único (*“Todo se ha vuelto un poco más difícil”*) y un indicador ☠ permanente.
  - Enemigos con +20 % de vida y +12 % de daño.
  - Pisos de **10–20 salas** (antes 5–12), con bucles y rutas alternativas, una segunda cámara secreta, más obstáculos, oleadas mayores (hasta 18) y plantillas de terreno combinables.
  - El minimapa se centra en tu sala.

### Terreno de las salas (estilo *The Binding of Isaac*)
Sin cambiar el tamaño de las salas, alrededor del **40 %** usan plantillas con **hoyos** y **muros**; el otro **60 %** son salas comunes (también entre las de jefe).
- Los **hoyos** bloquean el paso de jugador y enemigos, pero **no** los proyectiles ni la línea de visión.
- Hay 13 plantillas: Pilares, Hoyos laterales, Grietas, Esquinas en L, Galería, Diagonales, Río, Estanques, Ajedrez, Muralla partida, Fosos de esquina, Cruz de muros e Islotes.
- Cada plantilla se **valida** para que las cuatro puertas, el centro y todo el suelo libre estén conectados (sin zonas aisladas). Las salas de jefe usan solo plantillas abiertas.

### Tilemaps, puertas y transiciones (1.3.6)
- Cada sala es una cuadrícula de **24×15 tiles de 40 px** dibujada con el tileset de su bioma (terreno, 3 decoraciones, obstáculo, agujero y muro). Los obstáculos y hoyos se alinean a la cuadrícula, así que lo que ves coincide con la colisión.
- **Puertas** con la hoja del bioma: el tipo depende de la sala de destino (normal, tesoro, secreta, mercader, santuario/suceso, jefe). Se ven **cerradas** mientras queden enemigos, se **abren** al limpiar la sala y la secreta no descubierta se ve como muro.
- **Transiciones:** al cruzar una puerta la cámara se desplaza hacia la nueva sala; al bajar de piso, entrar a la mazmorra o volver al hub se usan cubitos negros (descendentes al entrar, ascendentes al volver al hub).
- **Mapa:** marco propio, el minimapa sigue a tu sala y oculta las lejanas; completadas en blanco, con marca de color para tesoro/tienda/santuario/élite/suceso/jefe. `M` abre el mapa grande con leyenda.

### Móvil, inventario y mercader (1.3.7)
- **Controles táctiles:** iconos SVG que cambian con tu clase/arma/tomo/cartas; el botón de ataque es un joystick que muestra el arma equipada; el movimiento puede ser joystick o cruceta. Los botones se recolocan según el tamaño de pantalla sin solaparse.
- **Ajustes:** movimiento (joystick/cruceta), apuntar al moverse, ordenar botones (editor por arrastre) y restablecer.
- **Inventario por slots (32):** personaje con sus 6 ranuras de equipo, pociones apilables (Z vida / X maná), favoritos ★, papelera de un hueco, arrastrar y soltar y panel de acciones al pulsar. Atajos de ratón: Ctrl+clic tirar, Alt+clic favorito, Mayús+clic equipar/desequipar; en móvil, doble toque equipa.
- **Cofres y mercader** equipan el objeto directamente (lo sustituido pasa a la mochila). El mercader también compra, tiene "vender todos los comunes" con vista previa y un nivel oculto (10 compras → 4 objetos, 20 → 5).

### Jefes
- **44 jefes**: 12 originales + **32 nuevos** (22 normales y 10 finales). 15 son jefes finales.
- Aparecen en **cualquier bioma** y **rotan en cada partida** (el orden se baraja con la semilla).
- Los jefes eligen sus ataques **al azar**, sin repetir el anterior, y se exponen (vulnerables) cada pocos ataques.
- **Diseño propio de cada jefe nuevo:**
  - una **firma** única, con nombre propio, de entre 8 geometrías con parámetros propios (pétalos, rayos giratorios, columnas de meteoros con hueco, embestida con estela, tablero, anillos que se cierran, ráfagas dirigidas, pulsar con huecos);
  - un **rasgo pasivo** (furia veloz, aura abrasadora, estela ardiente, pulso, cría esbirros, parpadeo, buscador teledirigido o meteoros);
  - un **combo** propio (la firma encadena otro ataque de su kit) y satélites orbitales distintos.
  - Las 32 combinaciones geometría + rasgo son únicas.
- Jefes nuevos: 5 ataques (normales) o 7 (finales, con 3 fases), más su firma. Catálogo de 13 ataques: lluvia de meteoros, onda expansiva, cruz mortal, espiral, plaga rastreadora, embestida telegrafiada, convocar secuaces, abanico, anillos concéntricos, minas retardadas, barrido, salto sombrío y jaula. En la fase 3 los finales añaden el colapso del suelo y la inversión de controles, y refuerzan su firma.
- Los 12 jefes originales también usan estos ataques como extra.
- **Seguridad:** inmunidad del 99 %, sin aturdimiento, máximo 10 % de su vida por golpe y 25 % por segundo (no se pueden matar de un golpe) y un sistema anti-bloqueo que los deja vulnerables si pasan 20 s sin recibir daño.

### Botín y rarezas
- Menos objetos de enemigos comunes; las ranuras vacías aumentan algo la probabilidad (sin garantizarla).
- **Niveles 0–5:** nada por encima de *raro* (botín, cofres, mercader).
- **Nivel 6+:** épico y legendario con probabilidad reducida; hay armaduras legendarias.
- El **mercader** genera su inventario una sola vez por sala y lo conserva.

---

## Progresión permanente

### Forja de almas (estilo Vampire Survivors)
Las almas se ganan al morir (mitad del oro) o al retirarte con gloria. Cada mejora tiene nivel máximo y coste creciente.

| Mejora | Efecto por nivel | Máx. |
|---|---|---|
| Poder | +0,5 % de daño (hasta +25 %) | 50 |
| Vigor | +1 % de vida máxima | 20 |
| Armadura | +1 de armadura | 10 |
| Recuperación | +0,1 vida/s | 10 |
| Enfriamiento | −1 % de enfriamiento de habilidades | 15 |
| Celeridad | +1 % de velocidad | 10 |
| Imán | +10 % de radio de recogida | 5 |
| Codicia | +3 % de oro | 10 |
| Crecimiento | +2 % de experiencia | 10 |
| Renacer | Revives una vez por partida con el 50 % de vida | 1 |

### Cartas de hechizo (Mago)
Se desbloquean con profundidad y jefes derrotados. Los requisitos de jefe son *“derrotar a N jefes distintos”*, compatibles con la rotación.

### Logros (34)
Cada logro tiene id estable, fecha de desbloqueo y +10 almas. Los marcados (oculto) no muestran su condición hasta conseguirlos. Las partidas de Arena y Entrenamiento no cuentan.

| Logro | Condición |
|---|---|
| Primera sangre / Cazador de monstruos / Exterminador | Derrotar 1 / 100 / 500 enemigos |
| Primer descenso / Cada vez más hondo / Abismo | Profundidad 3 / 5 / 10 |
| Aprendiz / Veterano / Leyenda viva | Nivel 5 / 10 / 20 |
| Todo más difícil | Desbloquear el modo difícil |
| Rompe-jefes / Triple amenaza | Derrotar 1 / 3 jefes distintos |
| Cazador de finales | Derrotar un jefe final |
| Siete pecados / Fin del mundo | Los 7 jefes normales originales / los 5 finales originales |
| Reflejos / Muro de acero | 1 / 25 parries perfectos |
| Devuélvelo / Francotirador al revés | Reflejar 1 / 10 proyectiles |
| Saqueador / Coleccionista | Abrir 1 / 10 cofres |
| Ojo de lince | Entrar en una cámara secreta |
| Cliente / Cliente fiel | 1 / 5 compras al mercader |
| Brillo violeta / Brillo dorado | Conseguir un objeto épico / legendario |
| Intocable | Despejar una sala sin recibir daño |
| Danza de espadas | Derrotar a un élite sin recibir daño |
| Sin un rasguño (oculto) | Derrotar a un jefe sin recibir daño |
| Erudito / Enciclopedia | 50 % / 100 % del bestiario |
| Reliquiario | 5 reliquias en una expedición |
| Aprender cayendo | Morir por primera vez |
| Gloria eterna (oculto) | Retirarte con gloria |

### Bestiario
Una ficha se desbloquea al derrotar al enemigo una vez. Muestra comportamiento, consejo, estadísticas base y resistencias (enemigos), o firma, rasgo y profundidad (jefes), y las veces derrotado. Incluye aviso de descubrimiento, filtro (todos / enemigos / jefes), búsqueda por nombre entre los descubiertos y porcentaje total.

---

## Versiones del guardado

Al principio del script (`// ===== VERSIONES =====`) hay tres constantes:

| Constante | Qué hace al subirla en +1 |
|---|---|
| `HARD_RESET` | **Borra todo** el guardado: partida nueva desde cero (incluye logros, bestiario y ajustes). |
| `SOFT_RESET` | Reinicia solo el **progreso** (claves de `SOFT_WIPE`: mejor profundidad, almas, forja, cartas, modo difícil). **Conserva** logros, bestiario, estadísticas, jefes derrotados y ajustes. |
| `GAME_VERSION` | Informativa (actualmente `1.3.4`): se muestra abajo a la derecha en el título y se añade a la URL del service worker (`sw.js?v=…`) para forzar su actualización. |

- Un guardado antiguo sin versión se **adopta** sin borrar nada.
- Tras un reinicio, el título muestra un aviso con el motivo.
- Para cambiar lo que conserva el reinicio suave, edita la lista `SOFT_WIPE`.
- Si en GitHub Pages sigues viendo la versión vieja, casi seguro es la caché del navegador o de tu `sw.js`. La versión visible en el título indica qué HTML se sirve; si tu `sw.js` guarda caché, usa también `GAME_VERSION` en el nombre de esa caché.

---

## Límites conocidos

- Las salas mantienen el tamaño de pantalla; el modo difícil aumenta el número de salas y la complejidad del terreno, no su tamaño.
- Los 32 jefes nuevos tienen firma, rasgo y combo propios, pero comparten el motor de ataques: no tienen animaciones ni escenas únicas como un jefe hecho a mano.
- No hay sonidos de ambiente, por lo que los volúmenes son general, música y efectos.
- Las pruebas realizadas fueron simulaciones automáticas sin navegador; la sensación de combate y el aspecto visual requieren probarse jugando.
