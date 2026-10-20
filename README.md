# Average roguelike game

Roguelike de mazmorras con vista cenital, hecho en un único archivo HTML (canvas + JavaScript, sin dependencias). Basado en *Infinite Depths*.

- **Archivo del juego:** `average-roguelike-game.html`
- **Cómo jugar:** abre el archivo en un navegador moderno (escritorio o móvil). No necesita instalación ni servidor.
- **Guardado:** `localStorage`, con la misma clave que la versión anterior (`idv1`). Tu progreso anterior se conserva y se migra solo.

> El HTML enlaza `manifest.webmanifest`, `sw.js` y `icons/` (PWA). Esos archivos no forman parte de este paquete; el juego funciona igual sin ellos.

---

## Flujo del juego

1. **Pantalla de título** → clic o cualquier tecla.
2. **Hub (habitación central)** → mueves a un personaje en blanco y te acercas a los objetos (F o clic).
3. **Mazmorra** → pisos con salas, jefe al final de cada piso, descenso cada vez más difícil.
4. Al morir vuelves al hub; conservas almas, logros, bestiario y mejoras permanentes.

### El hub

| Objeto | Función |
|---|---|
| Puerta de la mazmorra | Inicia la partida con la clase elegida (pide confirmación) |
| Pedestal de clases | Elegir Guerrero, Cazador o Mago (descripción, estadísticas, estilo y habilidades) |
| Tablón de logros | Lista de logros, progreso y fecha de desbloqueo |
| Bestiario | Fichas de enemigos y jefes descubiertos, con filtro y búsqueda |
| Mesa de estadísticas | Datos acumulados de todas tus partidas |
| Forja de almas | Mejoras permanentes que se compran con almas |
| Arena de jefes | Practicar cualquiera de los 44 jefes (sin recompensas) |
| Campo de entrenamiento | Maniquíes, arquero de práctica y combatiente, para probar ataques, habilidades, parry y esquivas |
| Cartel de progresión y créditos | Explica el modo difícil y la progresión |
| Ajustes | Controles, música, volúmenes, temblor de pantalla, controles táctiles, gráficos |

El entrenamiento y la arena **no dan** experiencia, botín, oro, logros ni progreso.

---

## Controles (reasignables en Ajustes → Controles)

| Acción | Tecla |
|---|---|
| Mover | `W A S D` |
| Apuntar / atacar | Ratón / clic izquierdo |
| Habilidad o guardia (parry) | Clic derecho |
| Esquivar | `Espacio` |
| Habilidades | `Q`, `E` |
| Acción de clase | `R` |
| Interactuar | `F` |
| Inventario / Mapa / Talentos | `I` / `M` / `T` |
| Cartas de hechizo (Mago) | `B` y `1`–`4` |
| Pausa | `Esc` |

En móvil se muestran controles táctiles (joystick y botones), configurables en Ajustes.

---

## Clases

| Clase | Arma inicial | Estilo |
|---|---|---|
| Guerrero | Espada | Cuerpo a cuerpo, guardia con parry perfecto, remolino y salto |
| Cazador | Arco (cargador de 12) | A distancia: andanada, flecha explosiva y flecha venenosa |
| Mago | Báculo arcano | Magia con maná y cartas de hechizo elementales |

**Armas:** todas las armas cuerpo a cuerpo escalan con **Fuerza**. Las de distancia escalan con Destreza y las mágicas con Inteligencia. Las armas con cargador (Arco, Ballesta, Arma rúnica) muestran una barra de munición junto al personaje.

---

## Combate

### Parry (armas cuerpo a cuerpo)
- Mantén el clic derecho para guardia: reduce el daño recibido.
- Los primeros **0,22 s** son la ventana de **parry perfecto**: anula el golpe, aturde al atacante (los jefes son inmunes al aturdimiento), le **devuelve el doble de su daño** y activa sonido propio, destello y una pausa de impacto de 0,07 s.
- Un parry perfecto sobre un **proyectil** lo refleja hacia el enemigo más cercano con más velocidad y el doble de daño. Un proyectil reflejado no se puede reflejar de nuevo.
- Enfriamiento: 0,9 s tras un parry perfecto y 0,45 s tras soltar la guardia, para impedir el spam. El borde de la guardia es blanco (perfecto disponible), gris (enfriamiento) o azul (guardia normal).
- No funciona contra zonas de área sin atacante, solo contra golpes y proyectiles.

### Robo de vida
Es una ventaja especializada: fuentes reducidas, tope de **6 %** del daño por golpe y máximo **3 % de la vida máxima** por golpe. El daño periódico (veneno, quemadura, hemorragia) no cura. La regeneración (talento/forja) es independiente.

### Estados
Los jefes **ignoran** aturdimiento, congelación y enraizamiento. Los enemigos normales y élites siguen sufriéndolos (con duración reducida en élites).

---

## Dificultad

- La vida y el daño de los enemigos crecen con la profundidad.
- **Escalado adaptativo:** la vida enemiga sube con tu daño y con tu vida máxima (hasta +120 %); el daño enemigo sube con tu vida máxima y algo con tu daño (hasta +60 %).
- **Modo difícil:** se desbloquea **permanentemente** al alcanzar el **nivel 10** por primera vez. Se muestra el aviso *“Todo se ha vuelto un poco más difícil”* una sola vez y un indicador ☠ permanente.
  - Enemigos con +20 % de vida y +12 % de daño.
  - Pisos de **10–20 salas** (antes 5–12), con bucles, rutas alternativas, una segunda cámara secreta, más obstáculos y oleadas mayores.
  - El minimapa se centra en tu sala.

### Jefes
- **44 jefes**: 12 originales + **32 nuevos** (22 normales y 10 finales). 15 son jefes finales en total.
- Aparecen en **cualquier bioma** y **rotan en cada partida** (el orden se baraja con la semilla de la partida).
- Los jefes eligen sus ataques **al azar**, sin repetir el anterior, y se exponen (vulnerables) cada pocos ataques.
- Jefes nuevos: 5 ataques (normales) o 7 (finales, 3 fases). Se combinan 13 ataques: lluvia de meteoros, onda expansiva, cruz mortal, espiral, plaga rastreadora, embestida telegrafiada, convocar secuaces, abanico, anillos concéntricos, minas retardadas, barrido, salto sombrío y jaula. Los finales añaden en fase 3 el colapso del suelo y la inversión de controles.
- Los 12 jefes originales también usan estos ataques como extra.
- **Seguridad:** inmunidad del 99 %, sin aturdimiento, máximo 10 % de su vida por golpe y 25 % por segundo (no se pueden matar de un golpe), y un sistema anti-bloqueo que los deja vulnerables si pasan 20 s sin recibir daño.

### Botín y rarezas
- Menos objetos de enemigos comunes; las ranuras vacías aumentan algo la probabilidad (sin garantizarla).
- **Niveles 0–5:** nada por encima de *raro* (botín, cofres, mercader).
- **Nivel 6+:** épico y legendario con probabilidad reducida. Hay armaduras legendarias.
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
Se desbloquean con profundidad y jefes derrotados. Los requisitos de jefe ahora son *“derrotar a N jefes distintos”* para que funcionen con la rotación.

### Logros (34)
Cada logro tiene id estable, fecha de desbloqueo y +10 almas. Los marcados con (oculto) no muestran su condición hasta conseguirlos.

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
Una ficha se desbloquea al derrotar al enemigo una vez. Muestra comportamiento, consejo, estadísticas base y resistencias (enemigos), o ataques y profundidad (jefes), y las veces derrotado. Aviso al descubrir una entrada, filtro (todos/enemigos/jefes), búsqueda por nombre y porcentaje total.

---

## Límites conocidos

- Las salas mantienen el tamaño de pantalla; el modo difícil aumenta el número de salas, no su tamaño.
- Los 32 jefes nuevos son combinaciones de un catálogo de 13 ataques con nombre, color y forma propios; no tienen mecánicas únicas por jefe como los 12 originales.
- No hay sonidos de ambiente, por lo que los volúmenes son general, música y efectos.
- Las pruebas realizadas fueron simulaciones automáticas sin navegador; la sensación de combate y el aspecto visual requieren probarse jugando.
