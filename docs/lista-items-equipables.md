# Lista de objetos equipables (para preparar sprites)

**Formato:** PNG de 16×16 con fondo transparente (opcional: versión 256×256 reescalada sin suavizado). Se guarda en `src/assets/sprites/` con el nombre de la columna *Archivo*; al ejecutar `node scripts/build.js` el juego lo usa solo (tarjetas de elección, inventario, barra de equipo y objetos del suelo), sin tocar código. Si falta alguno, se muestra el emoji de reserva.

**Regla del nombre:** nombre del objeto en minúsculas, sin tildes y con guiones bajos, más `_16x16.png`.

## Armas (18): todas con sprite

| Arma | Tipo | Sprite |
|---|---|---|
| Espada | Cuerpo a cuerpo | listo |
| Dagas | Cuerpo a cuerpo | listo |
| Gran espada | Cuerpo a cuerpo | listo |
| Martillo | Cuerpo a cuerpo | listo |
| Lanza | Cuerpo a cuerpo | listo |
| Arco | Distancia | listo |
| Ballesta | Distancia | listo |
| Arma rúnica | Distancia | listo |
| Chakram | Distancia | listo |
| Báculo arcano | Mágica | listo |
| Báculo ígneo | Mágica | listo |
| Báculo helado | Mágica | listo |
| Báculo de tormenta | Mágica | listo |
| Hacha | Cuerpo a cuerpo | listo |
| Hachas dobles | Cuerpo a cuerpo | listo |
| Báculo venenoso | Mágica | listo |
| Daga de la Hemorragia | Cuerpo a cuerpo | listo |
| Báculo de marea | Mágica | listo |

## Equipo (15 objetos): todos con sprite

### Casco (4)

| Objeto | Rareza | Emoji actual | Archivo |
|---|---|---|---|
| Casco de hierro | Común | ⛑️ | `casco_de_hierro_16x16.png` |
| Capucha del sombrío | Rara | 🎩 | `capucha_del_sombrio_16x16.png` |
| Gorro de escarcha | Rara | 🧢 | `gorro_de_escarcha_16x16.png` |
| Yelmo del Abismo | Legendaria | 👑 | `yelmo_del_abismo_16x16.png` |

### Armadura (4)

| Objeto | Rareza | Emoji actual | Archivo |
|---|---|---|---|
| Coraza de escamas | Rara | 🦺 | `coraza_de_escamas_16x16.png` |
| Manto ignífugo | Rara | 🧥 | `manto_ignifugo_16x16.png` |
| Túnica arcana | Rara | 👘 | `tunica_arcana_16x16.png` |
| Coraza del Coloso | Legendaria | 🛡️ | `coraza_del_coloso_16x16.png` |

### Guantes (1)

| Objeto | Rareza | Emoji actual | Archivo |
|---|---|---|---|
| Guantes de cazador | Común | 🧤 | `guantes_de_cazador_16x16.png` |

### Botas (1)

| Objeto | Rareza | Emoji actual | Archivo |
|---|---|---|---|
| Botas veloces | Rara | 👢 | `botas_veloces_16x16.png` |

### Accesorio (5)

| Objeto | Rareza | Emoji actual | Archivo |
|---|---|---|---|
| Amuleto antiveneno | Rara | 🧿 | `amuleto_antiveneno_16x16.png` |
| Pendiente aislante | Rara | 💎 | `pendiente_aislante_16x16.png` |
| Amuleto de furia | Épica | 📿 | `amuleto_de_furia_16x16.png` |
| Anillo sangriento | Épica | 💍 | `anillo_sangriento_16x16.png` |
| Cinturón del acechador | Épica | 🥋 | `cinturon_del_acechador_16x16.png` |

## Extra: reliquias (16)

No se equipan, pero también salen en las ventanas de elección y usan la misma regla de nombre.

| Reliquia | Archivo |
|---|---|
| Anillo de furia | `anillo_de_furia_16x16.png` |
| Amuleto de vida | `amuleto_de_vida_16x16.png` |
| Botas de viento | `botas_de_viento_16x16.png` |
| Ojo certero | `ojo_certero_16x16.png` |
| Hoja sedienta | `hoja_sedienta_16x16.png` |
| Cristal arcano | `cristal_arcano_16x16.png` |
| Garra letal | `garra_letal_16x16.png` |
| Coraza rúnica | `coraza_runica_16x16.png` |
| Moneda de la suerte | `moneda_de_la_suerte_16x16.png` |
| Brasas eternas | `brasas_eternas_16x16.png` |
| Escarcha viva | `escarcha_viva_16x16.png` |
| Escudo torre | `escudo_torre_16x16.png` |
| Vial de maná | `vial_de_mana_16x16.png` |
| Venas abiertas | `venas_abiertas_16x16.png` |
| Hoja envenenada | `hoja_envenenada_16x16.png` |
| Resonancia carmesí | `resonancia_carmesi_16x16.png` |
