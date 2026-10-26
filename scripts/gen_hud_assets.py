#!/usr/bin/env python3
"""
scripts/gen_hud_assets.py
Genera los gráficos del HUD (pixel art 16x16) sin dependencias salvo Pillow:

  src/assets/hud/hud_tilemap.png   tilemap de marcos, barras, paneles y huecos de equipo
  src/assets/hud/hud_tilemap.json  nombre -> rectángulo dentro del tilemap
  src/assets/hud/icons/<id>.png    iconos de habilidades / pociones / utilidades (16x16)
  src/assets/sprites/<id>_16x16.png  sprites de proyectil nuevos (daga lanzada, frasco)

Se ejecuta a mano cuando se quiera cambiar el arte (no forma parte del build):
    python3 scripts/gen_hud_assets.py
Los PNG resultantes se pueden retocar con cualquier editor: el build solo lee los PNG.
"""
import json, math, os
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
HUD = os.path.join(ROOT, "src", "assets", "hud")
ICO = os.path.join(HUD, "icons")
SPR = os.path.join(ROOT, "src", "assets", "sprites")
for d in (HUD, ICO, SPR):
    os.makedirs(d, exist_ok=True)

# ---------------------------------------------------------------- paleta
def C(h, a=255):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)

INK = C("0e0a16")
GOLD, GOLD_D, GOLD_L = C("e8c460"), C("a8802f"), C("fff0a8")
STEEL, STEEL_D, STEEL_L = C("cdd6e6"), C("8794ad"), C("f4f8ff")
RED, RED_D, RED_L = C("e04848"), C("942434"), C("ff9a8a")
ORG, ORG_D, YEL = C("ff9632"), C("c85a1e"), C("ffe66e")
BLU, BLU_D, BLU_L = C("5a96ff"), C("325abe"), C("a8c8ff")
CYA, CYA_D, CYA_L = C("96e8ff"), C("4cb0d8"), C("e0faff")
GRN, GRN_D, GRN_L = C("6ed26e"), C("328246"), C("b8f0a0")
PUR, PUR_D, PUR_L = C("b46eff"), C("643caa"), C("e0c0ff")
BRN, BRN_D, BRN_L = C("a06a3c"), C("603c24"), C("d09a64")
GRY, GRY_D, GRY_L = C("6c6878"), C("3c384a"), C("9a96aa")
WHT = C("ffffff")
CLEAR = (0, 0, 0, 0)


def new(n=16):
    return Image.new("RGBA", (n, n), CLEAR)


def outline(im, col=INK):
    """Contorno de 1 px alrededor de lo opaco (se dibuja detrás)."""
    w, h = im.size
    out = Image.new("RGBA", (w, h), CLEAR)
    px, po = im.load(), out.load()
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > 0:
                po[x, y] = px[x, y]
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] > 0:
                    po[x, y] = col
                    break
    return out


def P(d, pts, c):
    for x, y in pts:
        d.point((x, y), c)


def L(d, a, b, c):
    d.line([a, b], fill=c)


# ---------------------------------------------------------------- iconos
# Cada icono se dibuja sobre una cuadrícula de 16x16 y se genera en dos versiones:
#   - "px": 16x16 tal cual (pieza del tilemap: corazón, gota, estrella, candado, huecos de equipo)
#   - suave: dibujado a 8x (128 px), con contorno y luz, y reducido a 32x32 (iconos de habilidades)
ICONS = {}
K8 = 8


class SD:
    """Proxy de ImageDraw: recibe coordenadas de la cuadrícula 16x16 y dibuja en un lienzo K veces mayor."""

    def __init__(self, d, k, im=None):
        self.d, self.k, self.im = d, k, im

    def _p(self, p):
        return ((p[0] + 0.5) * self.k, (p[1] + 0.5) * self.k)

    def _b(self, b):
        k = self.k
        return [b[0] * k, b[1] * k, (b[2] + 1) * k - 1, (b[3] + 1) * k - 1]

    def point(self, p, fill):
        k = self.k
        # los puntos sueltos fuera de la silueta quedaban como motas: solo se pintan sobre lo ya dibujado
        if self.im is not None and self.im.getpixel((int((p[0] + 0.5) * k), int((p[1] + 0.5) * k)))[3] == 0:
            return
        self.d.rectangle([p[0] * k, p[1] * k, (p[0] + 1) * k - 1, (p[1] + 1) * k - 1], fill=fill)

    def line(self, pts, fill=None, width=1):
        self.d.line([self._p(p) for p in pts], fill=fill, width=max(1, int(width * self.k)), joint="curve")

    def polygon(self, pts, fill=None, outline=None):
        self.d.polygon([self._p(p) for p in pts], fill=fill, outline=outline)

    def rectangle(self, b, fill=None, outline=None, width=1):
        self.d.rectangle(self._b(b), fill=fill, outline=outline, width=int(width * self.k))

    def ellipse(self, b, fill=None, outline=None, width=1):
        self.d.ellipse(self._b(b), fill=fill, outline=outline, width=max(1, int(width * self.k)))

    def arc(self, b, a0, a1, fill=None, width=1):
        self.d.arc(self._b(b), a0, a1, fill=fill, width=max(1, int(width * self.k)))

    def pieslice(self, b, a0, a1, fill=None, outline=None):
        self.d.pieslice(self._b(b), a0, a1, fill=fill, outline=outline)

    def rounded_rectangle(self, b, radius=0, fill=None, outline=None):
        self.d.rounded_rectangle(self._b(b), radius=radius * self.k, fill=fill, outline=outline)


def shade(im):
    """Luz arriba-izquierda y sombra abajo-derecha sobre lo opaco, para dar volumen."""
    w, h = im.size
    px = im.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            t = ((h - y) / h - 0.5) * 0.34 + ((w - x) / w - 0.5) * 0.14
            f = 1 + t
            px[x, y] = (max(0, min(255, int(r * f + (255 * t if t > 0 else 0) * 0.35))), max(0, min(255, int(g * f + (255 * t if t > 0 else 0) * 0.35))), max(0, min(255, int(b * f + (255 * t if t > 0 else 0) * 0.35))), a)
    return im


def smooth_outline(im, col=INK):
    from PIL import ImageFilter
    a = im.split()[3]
    grown = a.filter(ImageFilter.MaxFilter(13))  # ~0,75 casillas de contorno a 8x
    base = Image.new("RGBA", im.size, col)
    base.putalpha(grown)
    base.alpha_composite(im)
    return base


def icon(name, smooth=True):
    def deco(fn):
        def run(px=False):
            if px:
                im = new()
                fn(ImageDraw.Draw(im), im)
                return outline(im)
            n = 16 * K8
            im = Image.new("RGBA", (n, n), CLEAR)
            fn(SD(ImageDraw.Draw(im), K8, im), im)
            im = smooth_outline(shade(im))
            return im.resize((32, 32), Image.LANCZOS)
        ICONS[name] = run
        return fn
    return deco


@icon("whirl")
def _(d, im):
    d.arc([2, 2, 13, 13], 40, 330, fill=STEEL_L, width=2)
    d.arc([3, 3, 12, 12], 40, 330, fill=STEEL, width=1)
    P(d, [(12, 2), (13, 3), (13, 5), (11, 5), (12, 4)], GOLD)
    d.polygon([(11, 1), (14, 4), (10, 5)], fill=GOLD)
    L(d, (7, 7), (8, 8), STEEL_L)


@icon("leap")
def _(d, im):
    d.arc([2, 2, 13, 14], 190, 350, fill=STEEL_L, width=2)
    d.polygon([(11, 9), (14, 9), (13, 12)], fill=GOLD)
    L(d, (13, 7), (13, 10), GOLD)
    d.rectangle([2, 13, 13, 14], fill=BRN)
    P(d, [(4, 12), (7, 12), (10, 12)], BRN_L)


@icon("guard")
def _(d, im):
    d.polygon([(8, 1), (14, 3), (13, 9), (8, 14), (3, 9), (2, 3)], fill=STEEL_D)
    d.polygon([(8, 2), (13, 4), (12, 9), (8, 13), (4, 9), (3, 4)], fill=STEEL)
    d.rectangle([7, 4, 8, 11], fill=GOLD)
    d.rectangle([4, 6, 11, 7], fill=GOLD)
    P(d, [(5, 4), (4, 5)], STEEL_L)


@icon("verdict")
def _(d, im):
    L(d, (2, 13), (12, 3), STEEL_L)
    L(d, (3, 13), (13, 3), STEEL)
    L(d, (2, 12), (12, 2), STEEL_D)
    d.line([(1, 11), (4, 14)], fill=GOLD, width=2)
    P(d, [(0, 15), (1, 14)], BRN)
    d.arc([5, 0, 16, 11], 280, 40, fill=RED, width=2)
    P(d, [(14, 8), (15, 9)], RED_L)


@icon("volley")
def _(d, im):
    for y in (3, 8, 13):
        L(d, (1, y), (11, y), BRN_L)
        d.polygon([(10, y - 2), (14, y), (10, y + 2)], fill=STEEL_L)
        P(d, [(1, y - 1), (2, y - 1), (1, y + 1), (2, y + 1)], GRN)


@icon("bomb")
def _(d, im):
    L(d, (1, 12), (9, 8), BRN_L)
    P(d, [(1, 11), (2, 11), (1, 13), (2, 13)], GRN)
    d.ellipse([8, 3, 14, 9], fill=ORG)
    d.ellipse([9, 4, 13, 8], fill=YEL)
    P(d, [(11, 1), (11, 2), (14, 2), (15, 5), (7, 5), (6, 3)], ORG)
    P(d, [(11, 6)], WHT)


@icon("venom")
def _(d, im):
    d.polygon([(8, 1), (13, 8), (12, 12), (8, 14), (4, 12), (3, 8)], fill=GRN_D)
    d.polygon([(8, 3), (12, 8), (11, 11), (8, 13), (5, 11), (4, 8)], fill=GRN)
    P(d, [(6, 7), (6, 8), (7, 6)], GRN_L)
    P(d, [(8, 10), (9, 10), (8, 11)], GRN_D)


@icon("rain")
def _(d, im):
    d.ellipse([1, 1, 8, 5], fill=GRY_L)
    d.ellipse([6, 0, 14, 5], fill=GRY)
    for (x, y) in ((3, 6), (8, 7), (12, 6)):
        L(d, (x, y), (x - 1, y + 5), BRN_L)
        d.polygon([(x - 3, y + 4), (x + 1, y + 4), (x - 1, y + 8)], fill=STEEL_L)


@icon("fireball")
def _(d, im):
    d.polygon([(1, 14), (6, 7), (8, 9)], fill=ORG_D)
    d.ellipse([5, 3, 14, 12], fill=ORG)
    d.ellipse([7, 5, 12, 10], fill=YEL)
    P(d, [(9, 7), (10, 7)], WHT)
    P(d, [(4, 12), (3, 10), (6, 14)], ORG)


@icon("frostnova")
def _(d, im):
    for a in range(0, 180, 60):
        r = math.radians(a)
        dx, dy = math.cos(r) * 7, math.sin(r) * 7
        L(d, (8 - dx, 8 - dy), (8 + dx, 8 + dy), CYA)
        L(d, (8 - dx * .5, 8 - dy * .5), (8 + dx * .5, 8 + dy * .5), CYA_L)
    P(d, [(7, 7), (8, 7), (7, 8), (8, 8)], WHT)
    P(d, [(1, 1), (14, 14), (14, 1), (1, 14)], CYA_D)


@icon("chain")
def _(d, im):
    d.polygon([(10, 0), (3, 9), (7, 9), (5, 15), (13, 6), (9, 6)], fill=YEL)
    d.polygon([(10, 2), (6, 8), (9, 8), (7, 12), (11, 7), (8, 7)], fill=WHT)
    P(d, [(1, 3), (14, 12), (14, 13)], YEL)


@icon("overload")
def _(d, im):
    d.ellipse([1, 1, 14, 14], outline=PUR, width=1)
    pts = []
    for i in range(10):
        r = 6 if i % 2 == 0 else 2.4
        a = math.radians(i * 36 - 90)
        pts.append((8 + math.cos(a) * r, 8 + math.sin(a) * r))
    d.polygon(pts, fill=PUR_L)
    d.ellipse([6, 6, 9, 9], fill=WHT)


@icon("quake")
def _(d, im):
    d.rectangle([1, 11, 14, 14], fill=BRN)
    P(d, [(2, 11), (6, 11), (11, 11)], BRN_L)
    d.polygon([(7, 11), (6, 8), (8, 6), (7, 3), (9, 6), (9, 8), (9, 11)], fill=ORG)
    L(d, (8, 11), (8, 7), YEL)
    d.arc([0, 5, 15, 15], 200, 340, fill=BRN_L, width=1)
    P(d, [(2, 7), (13, 7), (4, 5), (12, 5)], BRN_L)


@icon("bulwark")
def _(d, im):
    d.rectangle([3, 1, 12, 11], fill=STEEL_D)
    d.polygon([(3, 11), (12, 11), (8, 15)], fill=STEEL_D)
    d.rectangle([4, 2, 11, 10], fill=STEEL)
    d.polygon([(4, 10), (11, 10), (8, 13)], fill=STEEL)
    d.ellipse([6, 4, 9, 7], fill=BLU)
    P(d, [(7, 5)], CYA_L)
    L(d, (5, 3), (5, 8), STEEL_L)


@icon("colossus")
def _(d, im):
    d.rectangle([5, 1, 10, 5], fill=STEEL)
    d.rectangle([5, 1, 10, 2], fill=STEEL_L)
    d.rectangle([7, 5, 8, 11], fill=BRN)
    d.rectangle([1, 12, 14, 14], fill=BRN_D)
    L(d, (0, 10), (4, 12), ORG)
    L(d, (15, 10), (11, 12), ORG)
    L(d, (1, 7), (3, 9), YEL)
    L(d, (14, 7), (12, 9), YEL)


@icon("shadowstep")
def _(d, im):
    for i, a in enumerate((70, 120, 190)):
        d.rectangle([i * 2, 3 + i * 3, 4 + i * 2 + 1, 4 + i * 3], fill=(120, 80, 200, a))
    d.polygon([(8, 4), (14, 8), (8, 12)], fill=STEEL_L)
    d.polygon([(8, 6), (12, 8), (8, 10)], fill=STEEL)
    d.rectangle([6, 5, 7, 11], fill=PUR_D)


@icon("daggers")
def _(d, im):
    for a in (-35, 0, 35):
        r = math.radians(a - 90)
        cx, cy = 8, 14
        tip = (cx + math.cos(r) * 13, cy + math.sin(r) * 13)
        mid = (cx + math.cos(r) * 6, cy + math.sin(r) * 6)
        L(d, mid, tip, STEEL_L)
        L(d, (cx, cy), mid, BRN_L)
        px = (mid[0] + math.cos(r + 1.57) * 1.5, mid[1] + math.sin(r + 1.57) * 1.5)
        px2 = (mid[0] - math.cos(r + 1.57) * 1.5, mid[1] - math.sin(r + 1.57) * 1.5)
        L(d, px, px2, GOLD)


@icon("dance")
def _(d, im):
    for a in (0, 90, 180, 270):
        r = math.radians(a)
        x1, y1 = 8 + math.cos(r) * 2, 8 + math.sin(r) * 2
        x2, y2 = 8 + math.cos(r + 0.7) * 7, 8 + math.sin(r + 0.7) * 7
        L(d, (x1, y1), (x2, y2), STEEL_L)
        P(d, [(round(x2), round(y2))], RED_L)
    d.ellipse([6, 6, 9, 9], fill=PUR)
    d.arc([1, 1, 14, 14], 20, 120, fill=RED, width=1)
    d.arc([1, 1, 14, 14], 200, 300, fill=RED, width=1)


@icon("pierce")
def _(d, im):
    L(d, (0, 8), (11, 8), BRN_L)
    d.polygon([(10, 5), (15, 8), (10, 11)], fill=STEEL_L)
    P(d, [(0, 7), (1, 7), (0, 9), (1, 9)], GOLD)
    d.ellipse([3, 3, 7, 13], outline=ORG, width=1)
    d.ellipse([8, 4, 11, 12], outline=ORG_D, width=1)


@icon("spiketrap")
def _(d, im):
    d.rectangle([1, 12, 14, 14], fill=GRY)
    for x in (2, 6, 10):
        d.polygon([(x, 12), (x + 2, 3), (x + 4, 12)], fill=STEEL)
        d.polygon([(x + 1, 12), (x + 2, 4), (x + 3, 12)], fill=STEEL_L)
        P(d, [(x + 2, 3)], RED)


@icon("siege")
def _(d, im):
    for (y, o) in ((3, 0), (8, 2), (13, 0)):
        L(d, (o, y), (10 + o, y), BRN_L)
        d.polygon([(9 + o, y - 2), (14 + o, y), (9 + o, y + 2)], fill=STEEL_L)
    d.arc([0, 0, 15, 15], 300, 60, fill=ORG, width=1)
    P(d, [(13, 5), (13, 11)], YEL)


@icon("homing")
def _(d, im):
    d.arc([1, 1, 12, 12], 190, 330, fill=CYA, width=1)
    d.arc([2, 5, 14, 15], 200, 20, fill=CYA_D, width=1)
    d.ellipse([9, 8, 14, 13], fill=CYA)
    d.ellipse([10, 9, 12, 11], fill=WHT)
    P(d, [(2, 6), (3, 4), (5, 3)], CYA_L)


@icon("seal")
def _(d, im):
    d.ellipse([1, 1, 14, 14], outline=CYA, width=1)
    pts = [(8 + math.cos(math.radians(a - 90)) * 6, 8 + math.sin(math.radians(a - 90)) * 6) for a in (0, 120, 240)]
    d.polygon(pts, outline=PUR_L)
    pts2 = [(8 + math.cos(math.radians(a - 90)) * 6, 8 + math.sin(math.radians(a - 90)) * 6) for a in (60, 180, 300)]
    d.polygon(pts2, outline=PUR)
    d.point((8, 8), WHT)


@icon("runeover")
def _(d, im):
    d.rectangle([2, 2, 13, 13], outline=CYA_D, width=1)
    d.polygon([(9, 1), (4, 9), (7, 9), (6, 15), (12, 6), (9, 6)], fill=CYA_L)
    d.polygon([(9, 3), (6, 8), (8, 8), (7, 12), (10, 7), (8, 7)], fill=WHT)


@icon("flare")
def _(d, im):
    d.polygon([(8, 0), (12, 5), (14, 10), (11, 15), (5, 15), (2, 10), (4, 5), (6, 8)], fill=ORG)
    d.polygon([(8, 5), (11, 9), (10, 14), (6, 14), (5, 10)], fill=YEL)
    d.polygon([(8, 9), (9, 12), (7, 13), (7, 11)], fill=WHT)


@icon("glacier")
def _(d, im):
    for (x, h) in ((2, 8), (5, 13), (8, 15), (11, 10)):
        d.polygon([(x, 15), (x + 2, 15 - h), (x + 4, 15)], fill=CYA)
        d.polygon([(x + 1, 15), (x + 2, 15 - h + 1), (x + 2, 15)], fill=CYA_L)
    d.rectangle([1, 14, 14, 15], fill=CYA_D)


@icon("shock")
def _(d, im):
    d.pieslice([0, 0, 15, 15], 90, 270, fill=ORG)
    d.pieslice([0, 0, 15, 15], 270, 90, fill=CYA)
    d.pieslice([3, 3, 12, 12], 90, 270, fill=YEL)
    d.pieslice([3, 3, 12, 12], 270, 90, fill=CYA_L)
    d.polygon([(9, 0), (6, 7), (9, 7), (6, 15), (10, 8), (7, 8)], fill=WHT)


@icon("flask")
def _(d, im):
    d.rectangle([6, 1, 9, 4], fill=GRY_L)
    d.rectangle([5, 1, 10, 1], fill=BRN_L)
    d.polygon([(6, 4), (9, 4), (14, 12), (12, 14), (3, 14), (1, 12)], fill=GRY_L)
    d.polygon([(6, 8), (9, 8), (13, 12), (11, 13), (4, 13), (2, 12)], fill=GRN)
    P(d, [(5, 10), (8, 11), (10, 9), (11, 3), (4, 6)], GRN_L)


@icon("cloud")
def _(d, im):
    d.ellipse([1, 5, 8, 12], fill=GRN_D)
    d.ellipse([5, 2, 12, 10], fill=GRN)
    d.ellipse([8, 6, 15, 13], fill=GRN_D)
    d.rectangle([3, 9, 13, 13], fill=GRN)
    P(d, [(6, 5), (7, 4), (10, 9)], GRN_L)
    P(d, [(5, 11), (6, 11), (9, 11), (10, 11)], GRN_D)
    d.point((7, 8), INK)
    d.point((10, 8), INK)


@icon("plague")
def _(d, im):
    d.ellipse([2, 1, 13, 10], fill=PUR_L)
    d.rectangle([5, 9, 10, 13], fill=PUR_L)
    d.rectangle([4, 4, 6, 6], fill=GRN_D)
    d.rectangle([9, 4, 11, 6], fill=GRN_D)
    P(d, [(7, 7), (8, 7)], PUR_D)
    P(d, [(6, 11), (8, 11), (10, 11)], PUR_D)
    P(d, [(1, 13), (14, 13), (7, 15)], GRN)


@icon("reset")
def _(d, im):
    d.arc([2, 2, 13, 13], 40, 320, fill=GOLD, width=2)
    d.polygon([(10, 0), (14, 4), (9, 5)], fill=GOLD_L)
    L(d, (8, 8), (8, 5), WHT)
    L(d, (8, 8), (10, 9), WHT)


@icon("mana")
def _(d, im):
    d.polygon([(8, 0), (13, 7), (8, 15), (3, 7)], fill=BLU)
    d.polygon([(8, 1), (12, 7), (8, 14)], fill=BLU_L)
    d.polygon([(8, 0), (3, 7), (8, 15)], fill=BLU_D)
    P(d, [(7, 4), (7, 5)], WHT)
    P(d, [(1, 2), (14, 3), (14, 12), (1, 11)], CYA_L)


@icon("dodge")
def _(d, im):
    for o in (0, 5):
        d.line([(2 + o, 2), (7 + o, 8), (2 + o, 14)], fill=CYA_L, width=2)
        d.line([(3 + o, 2), (8 + o, 8), (3 + o, 14)], fill=CYA_D, width=1)


@icon("potion_hp")
def _(d, im):
    d.rectangle([6, 1, 9, 3], fill=BRN_L)
    d.rectangle([7, 3, 8, 5], fill=GRY_L)
    d.ellipse([2, 5, 13, 15], fill=GRY_L)
    d.ellipse([3, 7, 12, 14], fill=RED)
    P(d, [(5, 8), (4, 9), (10, 12)], RED_L)
    d.rectangle([7, 9, 8, 12], fill=WHT)
    d.rectangle([6, 10, 9, 11], fill=WHT)


@icon("potion_mp")
def _(d, im):
    d.rectangle([6, 1, 9, 3], fill=BRN_L)
    d.rectangle([7, 3, 8, 5], fill=GRY_L)
    d.ellipse([2, 5, 13, 15], fill=GRY_L)
    d.ellipse([3, 7, 12, 14], fill=BLU)
    P(d, [(5, 8), (4, 9), (10, 12)], BLU_L)
    d.polygon([(8, 8), (10, 11), (8, 13), (6, 11)], fill=CYA_L)


def eq_icon(name, painter):
    def run(px=False):
        im = new()
        painter(ImageDraw.Draw(im))
        p = im.load()
        for y in range(16):
            for x in range(16):
                if p[x, y][3]:
                    p[x, y] = (88, 80, 108, 255)
        return outline(im, C("1a1426"))
    ICONS[name] = run


eq_icon("eq_w", lambda d: (L(d, (3, 13), (12, 3), STEEL), L(d, (4, 13), (13, 3), STEEL), d.line([(2, 10), (6, 14)], fill=STEEL, width=2)))
eq_icon("eq_h", lambda d: (d.pieslice([2, 2, 13, 14], 180, 360, fill=STEEL), d.rectangle([2, 8, 13, 11], fill=STEEL), d.rectangle([6, 8, 9, 13], fill=STEEL)))
eq_icon("eq_b", lambda d: d.polygon([(4, 2), (11, 2), (14, 5), (12, 14), (3, 14), (1, 5)], fill=STEEL))
eq_icon("eq_g", lambda d: (d.rectangle([4, 6, 11, 13], fill=STEEL), d.rectangle([3, 3, 4, 7], fill=STEEL), d.rectangle([6, 2, 7, 6], fill=STEEL), d.rectangle([9, 3, 10, 6], fill=STEEL)))
eq_icon("eq_f", lambda d: (d.rectangle([4, 2, 8, 11], fill=STEEL), d.rectangle([4, 9, 13, 13], fill=STEEL)))
eq_icon("eq_a", lambda d: (d.ellipse([3, 5, 12, 14], outline=STEEL, width=2), d.polygon([(6, 1), (9, 1), (10, 5), (5, 5)], fill=STEEL)))


@icon("lock")
def _(d, im):
    d.arc([4, 1, 11, 9], 180, 360, fill=STEEL, width=2)
    d.rectangle([3, 7, 12, 14], fill=GOLD_D)
    d.rectangle([4, 8, 11, 13], fill=GOLD)
    d.rectangle([7, 9, 8, 12], fill=INK)


@icon("heart")
def _(d, im):
    d.ellipse([1, 2, 8, 9], fill=RED)
    d.ellipse([7, 2, 14, 9], fill=RED)
    d.polygon([(1, 7), (14, 7), (8, 14)], fill=RED)
    P(d, [(4, 4), (3, 5), (5, 3)], RED_L)


@icon("manadrop")
def _(d, im):
    d.polygon([(8, 1), (13, 9), (11, 13), (5, 13), (3, 9)], fill=BLU)
    d.ellipse([3, 7, 12, 14], fill=BLU)
    P(d, [(6, 8), (5, 10), (6, 5)], BLU_L)


@icon("star")
def _(d, im):
    pts = []
    for i in range(10):
        r = 7 if i % 2 == 0 else 3
        a = math.radians(i * 36 - 90)
        pts.append((8 + math.cos(a) * r, 8.5 + math.sin(a) * r))
    d.polygon(pts, fill=GOLD)
    P(d, [(7, 6), (8, 5)], GOLD_L)


# ---- iconos de interfaz: moneda (contador de oro) y escalera (piso, mapa grande)
@icon("coin")
def _(d, im):
    d.ellipse([2, 2, 13, 13], fill=GOLD_D)
    d.ellipse([3, 3, 12, 12], fill=GOLD)
    d.ellipse([4, 4, 11, 11], outline=GOLD_D)
    d.rectangle([7, 5, 8, 10], fill=GOLD_D)
    d.rectangle([6, 6, 9, 6], fill=GOLD_D)
    d.rectangle([6, 9, 9, 9], fill=GOLD_D)
    P(d, [(4, 4), (5, 3), (6, 3), (4, 5)], GOLD_L)
    P(d, [(10, 12), (11, 11)], GOLD_L)


@icon("stairs")
def _(d, im):
    d.polygon([(1, 4), (6, 4), (6, 7), (10, 7), (10, 10), (14, 10), (14, 14), (1, 14)], fill=GRY)
    d.polygon([(1, 4), (6, 4), (6, 5), (1, 5)], fill=GRY_L)
    d.polygon([(6, 7), (10, 7), (10, 8), (6, 8)], fill=GRY_L)
    d.polygon([(10, 10), (14, 10), (14, 11), (10, 11)], fill=GRY_L)
    d.polygon([(11, 1), (14, 1), (14, 4), (15, 4), (12.5, 7), (10, 4), (11, 4)], fill=GOLD)
    P(d, [(12, 2), (12, 3)], GOLD_L)


# ---- iconos de elemento (cartas de hechizo)
@icon("el_fire")
def _(d, im):
    d.polygon([(8, 0), (12, 5), (14, 10), (11, 15), (5, 15), (2, 10), (4, 5), (6, 8)], fill=ORG)
    d.polygon([(8, 5), (11, 9), (10, 14), (6, 14), (5, 10)], fill=YEL)


@icon("el_water")
def _(d, im):
    d.polygon([(8, 0), (13, 8), (12, 12), (8, 15), (4, 12), (3, 8)], fill=BLU)
    d.ellipse([3, 6, 12, 14], fill=BLU)
    d.arc([5, 8, 11, 13], 20, 160, fill=CYA_L, width=1)
    P(d, [(6, 7), (6, 8)], WHT)


@icon("el_plant")
def _(d, im):
    d.polygon([(2, 14), (3, 6), (8, 1), (14, 2), (13, 8), (8, 13)], fill=GRN)
    L(d, (3, 13), (11, 4), GRN_D)
    L(d, (7, 9), (4, 8), GRN_D)
    L(d, (9, 7), (11, 9), GRN_D)


@icon("el_light")
def _(d, im):
    d.polygon([(10, 0), (3, 9), (7, 9), (5, 15), (13, 6), (9, 6)], fill=YEL)
    d.polygon([(10, 2), (6, 8), (9, 8), (7, 12), (11, 7), (8, 7)], fill=WHT)


@icon("el_wind")
def _(d, im):
    d.arc([2, 2, 12, 9], 200, 20, fill=CYA_L, width=2)
    d.arc([4, 6, 14, 14], 160, 340, fill=CYA, width=2)
    d.arc([1, 9, 9, 15], 180, 360, fill=CYA_D, width=2)
    d.polygon([(12, 3), (14, 6), (11, 6)], fill=CYA_L)


@icon("el_rock")
def _(d, im):
    d.polygon([(2, 12), (3, 6), (7, 2), (12, 4), (14, 9), (12, 13), (6, 14)], fill=GRY_L)
    d.polygon([(7, 2), (12, 4), (14, 9), (9, 8)], fill=STEEL)
    d.polygon([(2, 12), (3, 6), (6, 9), (6, 14)], fill=GRY_D)
    L(d, (6, 8), (9, 12), GRY_D)


@icon("el_ice")
def _(d, im):
    for a in range(0, 180, 60):
        r = math.radians(a)
        dx, dy = math.cos(r) * 7, math.sin(r) * 7
        L(d, (8 - dx, 8 - dy), (8 + dx, 8 + dy), CYA)
        L(d, (8 - dx * .5, 8 - dy * .5), (8 + dx * .5, 8 + dy * .5), CYA_L)
    d.ellipse([6, 6, 9, 9], fill=WHT)


@icon("el_dark")
def _(d, im):
    d.ellipse([2, 1, 13, 14], fill=PUR_D)
    d.ellipse([5, 0, 15, 12], fill=CLEAR)
    d.ellipse([4, 3, 11, 12], fill=INK)
    d.ellipse([6, 5, 9, 8], fill=PUR)


@icon("el_blood")
def _(d, im):
    d.polygon([(8, 0), (13, 8), (12, 12), (8, 15), (4, 12), (3, 8)], fill=RED)
    d.ellipse([3, 6, 12, 14], fill=RED)
    P(d, [(6, 7), (6, 8), (7, 6)], RED_L)
    d.ellipse([7, 10, 9, 12], fill=RED_D)


@icon("el_corr")
def _(d, im):
    d.polygon([(8, 1), (13, 8), (12, 12), (8, 15), (4, 12), (3, 8)], fill=PUR)
    d.ellipse([3, 6, 12, 14], fill=PUR)
    d.ellipse([5, 9, 8, 12], fill=GRN)
    d.ellipse([9, 8, 11, 10], fill=GRN_L)
    L(d, (6, 1), (6, 4), GRN)


# ---------------------------------------------------------------- tilemap (16x16 por casilla, 16 columnas)
COLS, ROWS = 16, 6
TILE = 16
atlas = Image.new("RGBA", (COLS * TILE, ROWS * TILE), CLEAR)
amap = {}


def put(name, im, tx, ty):
    atlas.paste(im, (tx * TILE, ty * TILE))
    amap[name] = [tx * TILE, ty * TILE, im.width, im.height]


def frame9(bg, edge, hi=None, lo=None, glow=None, dash=False):
    """Marco 16x16 para 9-slice (esquinas de 5 px)."""
    im = new()
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, 15, 15], radius=4, fill=INK)
    d.rounded_rectangle([1, 1, 14, 14], radius=3, fill=edge)
    d.rounded_rectangle([2, 2, 13, 13], radius=2, fill=bg)
    if hi:
        L(d, (3, 2), (12, 2), hi)
        L(d, (2, 3), (2, 12), hi)
    if lo:
        L(d, (3, 13), (12, 13), lo)
        L(d, (13, 3), (13, 12), lo)
    if glow:
        for (x, y) in ((1, 1), (14, 1), (1, 14), (14, 14)):
            d.point((x, y), glow)
    if dash:
        for i in range(3, 13, 3):
            d.point((i, 1), INK)
            d.point((i, 14), INK)
            d.point((1, i), INK)
            d.point((14, i), INK)
    return im


put("slot", frame9(C("1c1528"), C("6a5d80"), C("2a2140"), C("120d1c")), 0, 0)
put("slot_ready", frame9(C("1c1528"), GOLD_D, C("2a2140"), C("120d1c"), GOLD), 1, 0)
put("slot_sel", frame9(C("2a2140"), WHT, C("3a2e58"), C("120d1c"), GOLD_L), 2, 0)
put("slot_off", frame9(C("100c18"), C("3c3450"), None, None), 3, 0)
put("slot_empty", frame9(C("140f1e"), C("4a4258"), None, None, None, True), 4, 0)
put("slot_equip", frame9(C("181224"), C("5a4d70"), C("241c38"), C("100b18")), 5, 0)
put("panel", frame9(C("100c18"), GOLD_D, C("1c1528"), C("0a0710"), GOLD), 6, 0)
put("panel_soft", frame9(C("0e0a16"), C("3c3450"), None, None), 7, 0)

# tapa de tecla (3-slice horizontal 8x11)
key = Image.new("RGBA", (8, 11), CLEAR)
d = ImageDraw.Draw(key)
d.rounded_rectangle([0, 0, 7, 10], radius=3, fill=INK)
d.rounded_rectangle([1, 1, 6, 9], radius=2, fill=GOLD)
L(d, (2, 1), (5, 1), GOLD_L)
L(d, (2, 9), (5, 9), GOLD_D)
put("key", key, 8, 0)
keyb = key.copy()
pxk = keyb.load()
for yy in range(11):
    for xx in range(8):
        r_, g_, b_, a_ = pxk[xx, yy]
        if a_ and (r_, g_, b_) != (INK[0], INK[1], INK[2]):
            pxk[xx, yy] = (min(255, int(r_ * .55)), min(255, int(g_ * .6)), min(255, int(b_ * .75)), 255)
put("key_dim", keyb, 8, 1)

# barras: marco (cap izq 8, medio 16, cap der 8) de 16 de alto; relleno 16 de alto
def bar_frame():
    f = Image.new("RGBA", (32, 16), CLEAR)
    d = ImageDraw.Draw(f)
    d.rounded_rectangle([0, 1, 31, 14], radius=4, fill=INK)
    d.rounded_rectangle([1, 2, 30, 13], radius=3, fill=C("2a2140"))
    d.rounded_rectangle([2, 3, 29, 12], radius=2, fill=C("0c0814"))
    L(d, (4, 2), (27, 2), C("5a4d70"))
    return f


bf = bar_frame()
put("bar_l", bf.crop((0, 0, 8, 16)), 0, 1)
put("bar_m", bf.crop((12, 0, 20, 16)).resize((8, 16)), 1, 1)
put("bar_r", bf.crop((24, 0, 32, 16)), 2, 1)


def bar_fill(c1, c2, c3):
    im = Image.new("RGBA", (8, 16), CLEAR)
    d = ImageDraw.Draw(im)
    for y in range(3, 13):
        col = c1 if y < 6 else (c2 if y < 10 else c3)
        L(d, (0, y), (7, y), col)
    L(d, (0, 3), (7, 3), tuple(min(255, v + 50) for v in c1[:3]) + (255,))
    return im


put("fill_hp", bar_fill(C("ff6a6a"), C("d93a3a"), C("8e1f2c")), 3, 1)
put("fill_mp", bar_fill(C("7ab4ff"), C("3f7cf0"), C("24489e")), 4, 1)
put("fill_xp", bar_fill(C("ffe27a"), C("e0b030"), C("a07a18")), 5, 1)
put("fill_sh", bar_fill(C("c8f0ff"), C("78c8f0"), C("3c88b8")), 6, 1)

# iconos de barra
for i, n in enumerate(("heart", "manadrop", "star")):
    put("bi_" + n, ICONS[n](True), 8 + i, 2)

# marca de selección / listo (brillos de esquina 16x16)
shine = new()
d = ImageDraw.Draw(shine)
for (x, y) in ((0, 0), (15, 0), (0, 15), (15, 15)):
    d.point((x, y), GOLD_L)
put("shine", shine, 11, 2)

# huecos de equipo vacíos y candado
for i, n in enumerate(("eq_w", "eq_h", "eq_b", "eq_g", "eq_f", "eq_a")):
    put(n, ICONS[n](True), i, 3)
put("lock", ICONS["lock"](True), 6, 3)

atlas.save(os.path.join(HUD, "hud_tilemap.png"))
json.dump({"tile": TILE, "cols": COLS, "rows": ROWS, "rects": amap}, open(os.path.join(HUD, "hud_tilemap.json"), "w"), indent=1)

# ---------------------------------------------------------------- iconos sueltos
names = []
for n, fn in ICONS.items():
    if n.startswith("eq_") and False:
        continue
    (fn() if not n.startswith("eq_") else fn().resize((32, 32), Image.NEAREST)).save(os.path.join(ICO, n + ".png"))
    names.append(n)

# ---------------------------------------------------------------- sprites de proyectil nuevos (16x16, apuntan a la derecha)
def spr_dagger():
    im = new()
    d = ImageDraw.Draw(im)
    d.polygon([(6, 6), (14, 8), (6, 10)], fill=STEEL_L)
    d.polygon([(6, 7), (12, 8), (6, 9)], fill=WHT)
    d.rectangle([4, 5, 5, 11], fill=GOLD)
    d.rectangle([0, 7, 3, 9], fill=PUR_D)
    return outline(im)


def spr_flask():
    im = new()
    d = ImageDraw.Draw(im)
    d.rectangle([6, 2, 9, 4], fill=BRN_L)
    d.polygon([(6, 4), (9, 4), (13, 12), (11, 14), (4, 14), (2, 12)], fill=GRY_L)
    d.polygon([(6, 8), (9, 8), (12, 12), (10, 13), (5, 13), (3, 12)], fill=GRN)
    P(d, [(6, 10), (9, 11), (8, 6)], GRN_L)
    return outline(im)


spr_dagger().save(os.path.join(SPR, "daga_lanzada_16x16.png"))
spr_flask().save(os.path.join(SPR, "frasco_16x16.png"))

# hoja de contacto para revisar el arte
sheet = Image.new("RGBA", (10 * 40 + 20, ((len(names) + 9) // 10) * 40 + 10), (24, 18, 36, 255))
for i, n in enumerate(names):
    im = Image.open(os.path.join(ICO, n + ".png"))
    sheet.paste(im, (10 + (i % 10) * 40, 5 + (i // 10) * 40), im)
sheet.save("/tmp/hud_icons_sheet.png")
print("OK:", len(names), "iconos;", len(amap), "piezas de tilemap")
