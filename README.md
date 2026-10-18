# ⚔️ Infinite Depths

**Un dungeon crawler roguelite de fantasía oscura que se juega en el navegador.**
Desciende por una mazmorra infinita, derrota a 12 jefes, combina diez elementos mágicos y construye tu propio personaje. Cada partida genera mazmorras nuevas.

> Se juega con teclado y ratón. No hay que instalar nada ni crear cuenta.

---

## 🚀 Cómo empezar

1. Abre el juego en tu navegador (escritorio recomendado: Chrome, Firefox, Edge o Safari).
2. En el menú elige tu clase: **Guerrero**, **Cazador** o **Mago**.
3. Entra en la mazmorra, limpia cada sala de enemigos y busca la **sala del jefe**.
4. Derrota al jefe, pulsa **F** en el portal y desciende un nivel más.

¿Tienes el juego en tu ordenador? Ejecuta `npm start` y abre `http://localhost:8080` (consulta `DESARROLLO.md`).

---

## 🎮 Controles

| Acción | Tecla / ratón |
|---|---|
| Moverte | **W A S D** |
| Apuntar | **Ratón** |
| Ataque principal | **Clic izquierdo** |
| Habilidad secundaria o guardia | **Clic derecho** |
| Esquivar (breve invulnerabilidad) | **Espacio** |
| Habilidades equipadas | **Q** y **E** |
| Acción especial (o hechizo de tomo) | **R** |
| Lanzar carta de hechizo (solo Mago) | **1 2 3 4** |
| Cartas de hechizo (solo Mago) | **B** |
| Talentos | **T** |
| Inventario y equipo | **I** |
| Mapa grande | **M** |
| Interactuar (cofres, mercader, portal…) | **F** |
| Pausa y menú | **Esc** |

Todas las teclas (menos Esc y el ratón) se pueden cambiar en **Menú → Controles**.

---

## 🧙 Las tres clases

Tu estilo lo decide el **arma que llevas**: si encuentras otra de un estilo distinto, tus habilidades cambian con ella. Puedes jugar híbrido.

| | Guerrero | Cazador | Mago |
|---|---|---|---|
| Arma inicial | Espada | Arco | Báculo arcano |
| Clic derecho | **Guardia**: mantén para reducir mucho el daño. Si la activas justo antes del golpe, haces una **parada perfecta** que aturde al atacante | **Flecha venenosa** que atraviesa enemigos | **Rayo en cadena** (18 de maná) |
| Q | Remolino de área | Andanada de 5 flechas | Bola de fuego (22 de maná) |
| E | Salto con impacto que aturde | Flecha explosiva | Nova de hielo (25 de maná) |
| R | **Grito de guerra** (+35 % daño y escudo) | **Recarga ágil** (reinicia tus enfriamientos) | **Canalizar** (recuperas maná) |
| Recurso | Ninguno | Ballesta y arma rúnica requieren recarga | **Maná** |

**Armas que puedes encontrar:** espadas, dagas, gran espada, martillo, lanza, hacha, hachas dobles, arco, ballesta, arma rúnica, chakram, y báculos arcano, ígneo, helado, de tormenta, venenoso y de marea.
La **Daga de la Hemorragia** apila hemorragia (hasta 8) y con **R** detonas todas las acumulaciones.

---

## 🗺️ La mazmorra

Cada nivel es un conjunto de salas conectadas. Las puertas se cierran mientras haya enemigos y se abren al limpiarlas.

| Sala | Qué hay |
|---|---|
| Combate | Oleadas de enemigos (dos oleadas desde la profundidad 3) |
| Élite | Un enemigo élite con habilidades especiales |
| Cofre | Elige 1 tesoro entre arma, tomo mágico, equipo o reliquia |
| Santuario | Una bendición… o un pacto con riesgo |
| Mercader | Compra con oro: pociones, armas, equipo y reliquias |
| Suceso | Pozo de deseos, altar de sangre o emboscada |
| **Secreta** | Su puerta no aparece en el mapa. Busca huecos en la pared: guarda un botín mayor |
| **Jefe** | Siempre al final. Al vencerlo aparece un portal (**F**) |

La mazmorra **no tiene fin** y cambia de bioma cada nivel:
Catacumbas → Criptas malditas → Minas abandonadas → Bosque subterráneo → Ruinas arcanas → Cavernas de lava → Abismos helados → Dimensión corrupta.

Algunos biomas tienen **zonas peligrosas** en el suelo (lava y veneno hacen daño; el hielo te ralentiza) y **su propio tipo de daño** (fuego, hielo, veneno, rayo o corrupción). El equipo con resistencia a ese tipo te protege. La barra superior te avisa del daño del bioma.

---

## 📈 Progresar

- **Subir de nivel:** eliges 1 de 3 atributos (+2) y ganas **1 punto de talento**.
- **Atributos:** Fuerza (armas pesadas), Destreza (críticos, armas ligeras y a distancia), Inteligencia (hechizos y maná), Vitalidad (vida y armadura), Agilidad (velocidad), Suerte (crítico y botín).
- **Talentos (T):** 7 pasivas con 3 rangos (hemorragia, esquiva, coste de hechizos, robo de vida, armadura, crítico, maná).
- **Equipo (I):** casco, armadura, guantes, botas y accesorio, además del arma. Ves la comparación con lo que llevas puesto y los requisitos que te faltan. El inventario se pagina y se puede **filtrar y ordenar**.
- **Reliquias:** mejoras permanentes durante la partida (por ejemplo: más crítico, robo de vida o que tus golpes quemen).

---

## 🔮 Magia elemental y cartas (solo Mago)

El **Mago** lleva una colección de **55 cartas de hechizo** (10 elementos + 45 combinaciones). Pulsa **B** para abrirla:

1. **Arrastra** una carta desbloqueada a uno de los **4 espacios** (con ratón o con el dedo), o toca la carta y luego el espacio. También puedes reorganizarlas entre espacios o arrastrarlas fuera para retirarlas.
2. Lánzalas con las teclas **1 – 4** (o los botones táctiles). Cada espacio tiene su propio enfriamiento.
3. Cada carta muestra su coste de maná, enfriamiento, daño, radio y forma (proyectil, nova, cono o zona).

**Desbloqueos permanentes:** las cartas que desbloquees **se conservan para siempre**, aunque mueras o abandones. Cada carta bloqueada te dice de antemano **qué necesitas** y cuánto llevas (✓ / ✗):

- Fuego, Hielo y Electricidad: iniciales.
- Agua, Planta y Viento: alcanzar la profundidad 2, 3 y 4.
- Roca, Oscuridad, Sangre y Corrupción: derrotar a Valdris, Sylra, Veyra y Zeth **en una partida normal**.
- Combinaciones: tener las cartas de sus dos elementos y alcanzar cierta profundidad (más jefes para las más avanzadas).

> Derrotar jefes en la **Arena de jefes** (práctica) **no** desbloquea cartas.

Algunos ejemplos de combinación:

- **Fuego + Electricidad → Sobrecarga de plasma:** gran explosión que aturde.
- **Agua + Electricidad → Conductividad:** el enemigo mojado recibe +60 % de la descarga, que salta entre objetivos.
- **Agua + Hielo → Prisión glacial:** congela a los empapados.
- **Sangre + Oscuridad → Pacto carmesí:** sacrificas vida a cambio de mucho poder y robo de vida.
- **Corrupción + Fuego → Incineración impura:** consume la corrupción para explotar.
- Algunas se **anulan**: Fuego + Agua (Vapor) hace menos daño.

**Costes y riesgos:** la Sangre cuesta vida, la Corrupción encarece y alarga el hechizo, y los aturdimientos fuertes tienen límite (una vez cada 6 s).
Los demás estilos conservan sus habilidades (Q, E, clic derecho y R); las cartas son exclusivas del Mago. También puedes encontrar **tomos** (escudo, trampa, espíritu, rayo continuo y aliento ígneo) que se lanzan con **R**.

### Estados alterados

| Estado | Efecto |
|---|---|
| Quemadura / Veneno / Hemorragia | Daño continuo (la hemorragia y la corrupción se acumulan) |
| Empapado | La electricidad hace +60 %; apaga la quemadura; el hielo lo congela |
| Ralentizado / Aturdido / Enraizado | No se mueve bien o no actúa |
| Fracturado | Recibe +20 % de daño |
| Maldito | Hace −25 % de daño; la Oscuridad hace +30 % contra afectados |
| Corrupto | Hasta 10 acumulaciones de daño progresivo |

Los **élites** y los **jefes** resisten los controles (aturdimiento, raíces) y los jefes tienen un pequeño periodo de inmunidad tras ser aturdidos.

---

## 👹 Los 12 jefes

Cada jefe tiene su propia mecánica. Fíjate en la **barra superior**: te dice si está **[INMUNE]** o **[VULNERABLE]**. Un rombo sobre su cabeza cambia de color igual.

**Jefes normales (profundidades 1 a 7)**

| Nº | Jefe | Cómo se lucha |
|---|---|---|
| 1 | Valdris, el Duelista | Combos rápidos con **fintas**: si esquivas demasiado pronto, te castiga. Queda vulnerable al terminar |
| 2 | Gorgrim, el Coloso | Ondas de choque; sus embestidas **destrozan el escenario**. Si se estrella contra un muro, ¡atácale! |
| 3 | Sylra, la Centinela | Disparos curvos y espirales. Cuando **recarga**, es vulnerable |
| 4 | Mirax, Maestro de Espejos | Crea **copias idénticas**. Hay que encontrar al verdadero |
| 5 | Veyra, la Trampera | Trampas retardadas y barridos. Al rearmarse queda expuesta |
| 6 | Nyx, la Mudable | Cambia de estilo de combate al **50 %** de vida |
| 7 | Zeth, el Arconte | Es inmune mientras sus **orbes** lo protejan e **invierte tus controles** |

**Jefes finales (profundidades 10, 20, 30, 40 y 50), con tres fases**

| Jefe | Mecánica central |
|---|---|
| Soberano de Huesos | Invoca esqueletos: inmune mientras vivan. En la fase final, el suelo cede y debes buscar un refugio |
| Fulgor, Heraldo del Rayo | Electrifica franjas del suelo con **carriles seguros**; tras descargar queda vulnerable |
| Noctis, Devoradora de Luz | Oscurece la sala y lanza orbes que te persiguen. Al devorar la luz queda vulnerable |
| Cronos, el Reloj Roto | **Rebobina el tiempo** y se cura salvo que lo interrumpas con daño. Castiga donde estuviste |
| El Vacío | Copia tu estilo de combate y combina todo lo anterior |

**Arena de jefes** (Menú): práctica contra cualquier jefe que ya hayas alcanzado, con un personaje de nivel acorde. Al derrotarlo y entrar en el portal **vuelves al menú sin recompensas**: no da almas, ni profundidad, ni cartas. Morir o abandonar tampoco cambia tu progreso.

---

## 💀 Morir y ganar

- **Si mueres pierdes:** nivel, armas, reliquias y el botín de esa expedición.
- **Conservas:** tu **mejor profundidad**, la **mitad de tu oro convertido en almas** y tus ajustes.
- **Forja de almas (menú):** gasta almas para ganar **+6 % de daño permanente** en todas tus partidas.
- **Victoria:** al derrotar al jefe de la profundidad 10 puedes **retirarte con gloria** (conservas *todo* tu oro como almas, +50) o **seguir descendiendo**. El reto se repite cada 10 niveles.

---

## 📱 Jugar en el móvil (Android)

- **Navegador:** abre la web en Chrome y elige *Añadir a pantalla de inicio* para instalarla (funciona sin conexión).
- **Controles táctiles:** joystick a la izquierda; **ATACAR** a la derecha (apunta solo al enemigo más cercano; si arrastras el dedo, apuntas tú), botones **Q / E / R / HAB / ESQ / F** y accesos a pausa, inventario, mapa y talentos. El Mago tiene además los botones **1–4** y **B**.
- **Horizontal:** el juego se juega con el teléfono en horizontal; en vertical se pausa y te avisa.
- **Ajustes táctiles:** en el menú puedes activar o desactivar los controles, cambiar su tamaño y elegir gráficos ligeros (por defecto en móvil) o altos.
- **APK:** consulta `DESARROLLO.md` para generar el APK de prueba.

## ⚙️ Ajustes

En el menú principal: **Controles**, **Música** (sí/no), **Volumen** (100 % / 60 % / 30 % / 0 %), **Temblor de pantalla** (sí/no) y **Arena de jefes**.
El juego se adapta al tamaño de tu ventana.

## 💾 Guardado

Tu progreso permanente (mejor profundidad, almas, mejoras, controles y ajustes) se guarda **en este navegador**, en este dispositivo. **No se sincroniza** entre ordenadores ni navegadores, y se borra si limpias los datos del sitio. Las partidas en curso no se guardan: cada expedición empieza de cero.

---

## 💡 Consejos

- Aprende a **esquivar con tiempo**: los ataques peligrosos se anuncian con un aro rojo, una línea o una zona que se rellena.
- Con varios enemigos, **muévete**: solo unos pocos atacan a la vez, y los arqueros pierden la línea si te tapas con un pilar.
- Los enemigos te pierden de vista tras los obstáculos y van a investigar. Úsalo para reposicionarte.
- Mezcla estados: **Agua → Electricidad**, **Hielo sobre empapado**, **Roca → Fuego**…
- Guarda **maná** para los jefes: sus ventanas de vulnerabilidad son tu mejor oportunidad.
- Mira los **requisitos** del equipo (en rojo si no los cumples) antes de gastar oro.
- En una sala secreta o un cofre, elige según tu build: no todo el botín es mejor.

---

## ❓ Problemas frecuentes

| Problema | Solución |
|---|---|
| Pantalla en negro | Recarga la página y comprueba que JavaScript está activado |
| No suena | Revisa **Volumen** y **Música** en el menú; algunos navegadores esperan a que hagas clic primero |
| No puedo cambiar una tecla | Pulsa la acción, luego la nueva tecla. **Esc** cancela |
| Perdí mi progreso | Se guarda por navegador: usa siempre el mismo y no borres los datos del sitio |
| Va lento | Cierra otras pestañas pesadas y desactiva el temblor de pantalla |

¡Buena suerte ahí abajo!
