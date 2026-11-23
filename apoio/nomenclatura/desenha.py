"""Desenhos do guia de nomenclatura (SVG -> PNG via ImageMagick).

Uso: python3 apoio/nomenclatura/desenha.py
Gera os PNG em apoio/nomenclatura/img/.
"""
import math
import subprocess
from pathlib import Path

AQUI = Path(__file__).parent
IMG = AQUI / "img"
C = "#1e2a6e"
CINZA = "#5a6275"
F = "Liberation Sans"


# ------------------------------------------------------------------ básicos
def ln(x1, y1, x2, y2, w=3, dash=None, cor=C):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{cor}" stroke-width="{w}"{d} stroke-linecap="round"/>'


def pl(pts, w=3, fill="none"):
    p = " ".join(f"{a},{b}" for a, b in pts)
    return f'<polyline points="{p}" fill="{fill}" stroke="{C}" stroke-width="{w}" stroke-linejoin="round"/>'


def rect(x, y, w, h, sw=3, fill="none", dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{C}" stroke-width="{sw}"{d}/>'


def txt(x, y, s, size=20, anchor="middle", bold=False, cor=C):
    b = ' font-weight="bold"' if bold else ""
    return f'<text x="{x}" y="{y}" font-family="{F}" font-size="{size}" fill="{cor}" text-anchor="{anchor}"{b}>{s}</text>'


def dot(x, y, r=5):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{C}"/>'


def arrow(x1, y1, x2, y2, w=3, head=13):
    a = math.atan2(y2 - y1, x2 - x1)
    bx, by = x2 - head * math.cos(a), y2 - head * math.sin(a)
    px, py = -math.sin(a) * 6, math.cos(a) * 6
    return (ln(x1, y1, bx, by, w)
            + f'<polygon points="{x2},{y2} {bx + px:.1f},{by + py:.1f} {bx - px:.1f},{by - py:.1f}" fill="{C}"/>')


def codigo(x, y, s, caixa=False, anchor="middle", size=20):
    """Código de identificação; caixa=True desenha o retângulo exigido pela ISO 1219-2:2012."""
    t = txt(x, y, s, size, anchor, bold=True)
    if not caixa:
        return t
    w = 0.62 * size * len(s) + 14
    x0 = {"middle": x - w / 2, "start": x - 7, "end": x - w + 7}[anchor]
    return rect(round(x0), y - size - 2, round(w), size + 10, sw=2) + t


def svg(body, w, h, nome):
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
         f'<rect width="100%" height="100%" fill="#fff"/>{body}</svg>')
    p = IMG / f"{nome}.svg"
    p.write_text(s, encoding="utf-8")
    subprocess.run(["magick", "-density", "200", str(p), str(IMG / f"{nome}.png")], check=True)
    p.unlink()


# ------------------------------------------------------- símbolos ISO 1219-1
def cilindro_da(x0, y0, W=320, H=70, curso=170):
    """Cilindro de dupla ação recuado. Devolve (svg, porta_traseira_x, porta_dianteira_x, y_portas, x_ponta)."""
    s = rect(x0, y0, W, H)
    xp = x0 + 34
    s += f'<rect x="{xp - 5}" y="{y0 + 3}" width="10" height="{H - 6}" fill="{C}"/>'
    ponta = x0 + W + 50
    s += f'<rect x="{xp}" y="{y0 + H / 2 - 6}" width="{ponta - xp}" height="12" fill="#fff" stroke="{C}" stroke-width="3"/>'
    pt, pd = x0 + 22, x0 + W - 22
    s += ln(pt, y0 + H, pt, y0 + H + 22) + ln(pd, y0 + H, pd, y0 + H + 22)
    return s, pt, pd, y0 + H + 22, ponta, ponta + curso


def marca(x, y_haste, rotulo, caixa=False, seta=False):
    """Marca do fim de curso na posição de atuação (ISO 1219-2:2012, 4.3.5)."""
    y1, y2 = y_haste - 14, y_haste - 70
    s = ln(x, y1, x, y2, 2.5)
    if seta:
        s += arrow(x - 22, y2 + 16, x - 2, y2 + 16, 2.5, 10)
    return s + codigo(x, y2 - 10, rotulo, caixa, size=19)


def escape(x, y):
    return ln(x, y, x, y + 20) + f'<polygon points="{x - 11},{y + 20} {x + 11},{y + 20} {x},{y + 38}" fill="#fff" stroke="{C}" stroke-width="2.5"/>'


def fonte(x, y):
    """Fonte de pressão pneumática: círculo com triângulo vazado."""
    return (f'<circle cx="{x}" cy="{y}" r="20" fill="#fff" stroke="{C}" stroke-width="3"/>'
            f'<polygon points="{x},{y - 13} {x - 11},{y + 7} {x + 11},{y + 7}" fill="#fff" stroke="{C}" stroke-width="2.5"/>')


def solenoide(x, yc, lado):
    """Acionamento por solenoide: retângulo com traço diagonal. lado='e' (esquerda) ou 'd' (direita)."""
    x0 = x - 42 if lado == "e" else x
    return rect(x0, yc - 18, 42, 36) + ln(x0, yc + 18, x0 + 42, yc - 18, 2.5)


def mola(x, yc):
    pts = [(x, yc)] + [(x + 7 + i * 8, yc - 12 if i % 2 == 0 else yc + 12) for i in range(5)] + [(x + 48, yc)]
    return pl(pts, 2.5)


def valvula_52(L, T, s=120, duplo=False):
    """Válvula 5/2; quadrado da direita = posição de repouso (1→2, 4→5). Devolve svg e posições das vias."""
    R, B = L + s, T + s
    g = rect(L, T, s, s) + rect(R, T, s, s)
    k = s / 120
    v = {"4": R + 32 * k, "2": R + 88 * k, "5": R + 18 * k, "1": R + 60 * k, "3": R + 102 * k}
    # posição acionada (quadrado esquerdo): 1→4 e 2→3
    g += arrow(L + 60 * k, B, L + 32 * k, T) + arrow(L + 88 * k, T, L + 102 * k, B)
    # posição de repouso (quadrado direito): 1→2 e 4→5
    g += arrow(v["1"], B, v["2"], T) + arrow(v["4"], T, v["5"], B)
    yc = T + s / 2
    g += solenoide(L, yc, "e")
    g += solenoide(R + s, yc, "d") if duplo else mola(R + s, yc)
    for p in ("4", "2"):
        g += ln(v[p], T, v[p], T - 18) + txt(v[p] + 10, T - 4, p, 15, "start")
    g += txt(v["1"] + 8, B + 15, "1", 15, "start")
    g += txt(v["5"] - 8, B + 15, "5", 15, "end") + txt(v["3"] + 8, B + 15, "3", 15, "start")
    return g, v, B


def estrangulamento_retencao(x, y, cor_rot):
    """Válvula reguladora de fluxo unidirecional (vertical, fluxo livre para cima, rótulo à esquerda).
    Ocupa de y a y+90. Devolve svg."""
    s = rect(x - 22, y, 74, 90, sw=2, dash="7 5")
    s += ln(x, y, x, y + 28) + ln(x, y + 62, x, y + 90)
    s += f'<path d="M{x - 9} {y + 28} Q{x + 2} {y + 45} {x - 9} {y + 62}" fill="none" stroke="{C}" stroke-width="2.5"/>'
    s += f'<path d="M{x + 9} {y + 28} Q{x - 2} {y + 45} {x + 9} {y + 62}" fill="none" stroke="{C}" stroke-width="2.5"/>'
    s += arrow(x - 16, y + 66, x + 16, y + 24, 2.2, 9)
    # ramal com retenção: assento em V (vértice embaixo) e esfera; fluxo livre de baixo para cima
    xb = x + 32
    s += ln(x, y + 12, xb, y + 12, 2.5) + ln(x, y + 78, xb, y + 78, 2.5)
    s += ln(xb, y + 12, xb, y + 36, 2.5) + ln(xb, y + 58, xb, y + 78, 2.5)
    s += pl([(xb - 10, y + 44), (xb, y + 58), (xb + 10, y + 44)], 2.5)
    s += f'<circle cx="{xb}" cy="{y + 40}" r="6" fill="#fff" stroke="{C}" stroke-width="2.5"/>'
    s += dot(x, y + 12, 4) + dot(x, y + 78, 4)
    return s + cor_rot


# ------------------------------------------------------------ figura 1: anatomia dos códigos
def fig_anatomia():
    b = txt(40, 40, "ISO 1219-2:2012 (atual)", 22, "start", True)
    y, passo, x = 150, 40, 470
    chars = "A-H2.3"
    pos = [x + i * passo for i in range(len(chars))]
    b += rect(pos[0] - 32, y - 52, passo * (len(chars) - 1) + 64, 72, sw=3)
    for px, ch in zip(pos, chars):
        b += txt(px, y, ch, 46, bold=True)
    alvos = [(pos[0], "código da instalação", "opcional se houver só uma", 150),
             (pos[2], "código do meio", "H, P, C, K, L ou G;", 450, "opcional com um só meio"),
             (pos[3], "número do circuito", "0 = alimentação", 760),
             (pos[5], "número do componente", "1, 2, 3...", 1070)]
    for a in alvos:
        px, t1, t2, lx = a[:4]
        b += ln(px, y + 26, px, y + 55, 2) + ln(px, y + 55, lx, y + 95, 2)
        b += txt(lx, y + 120, t1, 18, bold=True) + txt(lx, y + 143, t2, 15, cor=CINZA)
        if len(a) > 4:
            b += txt(lx, y + 163, a[4], 15, cor=CINZA)
    b += txt(780, 112, "o código fica dentro de um retângulo,", 16, "start", cor=CINZA)
    b += txt(780, 134, "ao lado do símbolo", 16, "start", cor=CINZA)
    y2 = 420
    b += ln(30, y2 - 90, 1230, y2 - 90, 1.5, cor="#c8cbd6")
    b += txt(40, y2 - 50, "ISO 1219-2:1995 (cancelada; ainda usada pela Festo e no FluidSIM)", 22, "start", True)
    x = 560
    pos = [x + i * 40 for i in range(3)]
    for px, ch in zip(pos, "1V2"):
        b += txt(px, y2 + 40, ch, 46, bold=True)
    for px, t1, t2, lx in [(pos[0], "número do circuito", "0 = alimentação", 300),
                           (pos[1], "letra do grupo", "A, V, S, P, M ou Z", 600),
                           (pos[2], "número do componente", "1, 2, 3...", 900)]:
        b += ln(px, y2 + 52, px, y2 + 75, 2) + ln(px, y2 + 75, lx, y2 + 105, 2)
        b += txt(lx, y2 + 130, t1, 18, bold=True) + txt(lx, y2 + 153, t2, 15, cor=CINZA)
    svg(b, 1260, 600, "fig1-anatomia")


# ---------------------------------------------- figura 2/3: circuito pneumático de um cilindro
def fig_pneumatico(nome, atual):
    b = ""
    cs, pt, pd, yp, ponta, ponta_av = cilindro_da(200, 90)
    b += cs
    yh = 90 + 35
    if atual:
        b += codigo(200, 75, "1.1", True, "start")
        b += marca(ponta, yh, "BG1", False) + marca(ponta_av, yh, "BG2", False)
    else:
        b += codigo(200, 75, "1A1", False, "start")
        b += marca(ponta, yh, "1S1") + marca(ponta_av, yh, "1S2")
    vg, v, B = valvula_52(200, 270)
    b += vg
    # tubulações
    b += pl([(v["4"], 252), (v["4"], 225), (pt, 225), (pt, yp)])
    b += pl([(v["2"], 252), (v["2"], 225), (pd, 225), (pd, yp)])
    b += escape(v["5"], B) + escape(v["3"], B)
    b += ln(v["1"], B, v["1"], B + 52) + fonte(v["1"], B + 72)
    if atual:
        b += codigo(200, 258, "1.2", True, "start")
        b += txt(150, 337, "MB1", 19, "end", True)
        b += codigo(v["1"] - 32, B + 80, "0.1", True, "end")
    else:
        b += codigo(200, 258, "1V1", False, "start")
        b += txt(150, 337, "1Y1", 19, "end", True)
        b += codigo(v["1"] - 32, B + 80, "0Z1", False, "end")
    svg(b, 820, 520, nome)


# ------------------------------------------------------------ diagrama elétrico (linhas verticais)
def contato(x, ya, tipo, cod, t1, t2, atuador=None):
    """Contato vertical entre ya e ya+44. tipo='na' ou 'nf'. atuador: None, 'botao', 'rolete'."""
    yb = ya + 44
    s = ""
    if tipo == "na":
        s += pl([(x, yb), (x - 20, ya + 6)], 3)
        ym = ya + 24
        xa = x - 10
    else:
        s += ln(x, yb, x + 20, yb, 3)  # batente do contato fixo
        s += pl([(x, ya), (x + 24, yb + 5)], 3)
        ym = ya + 22
        xa = x + 10
    if atuador:
        s += ln(xa, ym, x - 58, ym, 2, "6 4")
        if atuador == "botao":
            s += pl([(x - 50, ym - 11), (x - 58, ym - 11), (x - 58, ym + 11), (x - 50, ym + 11)], 2.5)
        else:
            s += f'<circle cx="{x - 66}" cy="{ym}" r="8" fill="#fff" stroke="{C}" stroke-width="2.5"/>'
    s += txt(x - (84 if atuador else 32), ya + 30, cod, 19, "end", True)
    s += txt(x + 30, ya + 4, t1, 14, "start", cor=CINZA) + txt(x + 30, yb + 4, t2, 14, "start", cor=CINZA)
    return s, ya, yb


def bobina(x, ya, cod, solen=False):
    s = rect(x - 26, ya, 52, 34)
    if solen:
        s += ln(x - 26, ya + 34, x + 26, ya, 2.5)
    s += txt(x - 36, ya + 24, cod, 19, "end", True)
    s += txt(x + 32, ya - 2, "A1", 14, "start", cor=CINZA) + txt(x + 32, ya + 48, "A2", 14, "start", cor=CINZA)
    return s, ya, ya + 34


def fig_eletrico(nome, atual):
    S1, B1, B2, K1, Y1 = (("SF1", "BG1", "BG2", "KF1", "MB1") if atual
                          else ("S1", "1S1", "1S2", "K1", "1Y1"))
    top, bot = 70, 560
    x1, x2, x3 = 200, 360, 540
    b = ln(110, top, 620, top) + ln(110, bot, 620, bot)
    b += txt(100, top + 7, "+24 V", 18, "end", True) + txt(100, bot + 7, "0 V", 18, "end", True)
    for i, x in enumerate((x1, x2, x3), 1):
        b += txt(x, top - 22, str(i), 18, cor=CINZA)
    b += dot(x1, top) + dot(x2, top) + dot(x3, top) + dot(x1, bot) + dot(x3, bot)
    # linha 1: S1 (NA) · 1S1 (NA) · nó · 1S2 (NF) · K1
    e, a, z = contato(x1, 110, "na", S1, "13", "14", "botao"); b += e + ln(x1, top, x1, a)
    e, a2, z2 = contato(x1, 200, "na", B1, "13", "14", "rolete"); b += e + ln(x1, z, x1, a2)
    yn = 290
    b += ln(x1, z2, x1, yn) + dot(x1, yn)
    e, a3, z3 = contato(x1, 320, "nf", B2, "11", "12", "rolete"); b += e + ln(x1, yn, x1, a3)
    e, a4, z4 = bobina(x1, 430, K1); b += e + ln(x1, z3, x1, a4) + ln(x1, z4, x1, bot)
    # linha 2: K1 13-14 em paralelo com S1 + 1S1
    e, a, z = contato(x2, 150, "na", K1, "13", "14"); b += e + ln(x2, top, x2, a)
    b += pl([(x2, z), (x2, yn), (x1, yn)])
    # linha 3: K1 23-24 · solenoide
    e, a, z = contato(x3, 150, "na", K1, "23", "24"); b += e + ln(x3, top, x3, a)
    e, a5, z5 = bobina(x3, 430, Y1, solen=True); b += e + ln(x3, z, x3, a5) + ln(x3, z5, x3, bot)
    # referência cruzada dos contatos de K1 (sob a bobina, na linha 1)
    b += txt(x1, bot + 34, f"{K1}: 13-14 → linha 2", 15, cor=CINZA)
    b += txt(x1, bot + 54, f"{K1}: 23-24 → linha 3", 15, cor=CINZA)
    svg(b, 700, 640, nome)


# ------------------------------------------------- figura 6: dois cilindros (sistema com letras)
def bloco(xc, n, regul=False):
    """Um cilindro com válvula 5/2 de duplo solenoide. xc = x do cilindro. n = número do circuito."""
    b = ""
    cs, pt, pd, yp, ponta, ponta_av = cilindro_da(xc, 90, W=240, curso=110)
    b += cs + codigo(xc, 75, f"{n}A1", False, "start")
    b += marca(ponta, 125, f"{n}S1") + marca(ponta_av, 125, f"{n}S2")
    L, T = xc + 10, 400
    vg, v, B = valvula_52(L, T, 110, duplo=True)
    b += vg
    b += codigo(L, T - 26, f"{n}V1", False, "end")
    b += txt(L - 50, T + 62, f"{n}Y1", 17, "end", True)
    b += txt(L + 220 + 50, T + 62, f"{n}Y2", 17, "start", True)
    yh = 345
    if regul:
        yr = 225
        b += estrangulamento_retencao(pt, yr, codigo(pt - 30, yr + 52, f"{n}V2", False, "end", 17))
        b += estrangulamento_retencao(pd, yr, codigo(pd + 64, yr + 52, f"{n}V3", False, "start", 17))
        b += ln(pt, yp, pt, yr) + ln(pd, yp, pd, yr)
        b += pl([(pt, yr + 90), (pt, yh), (v["4"], yh), (v["4"], T - 18)])
        b += pl([(pd, yr + 90), (pd, yh), (v["2"], yh), (v["2"], T - 18)])
    else:
        b += pl([(pt, yp), (pt, yh), (v["4"], yh), (v["4"], T - 18)])
        b += pl([(pd, yp), (pd, yh), (v["2"], yh), (v["2"], T - 18)])
    b += escape(v["5"], B) + escape(v["3"], B)
    return b, v["1"], B


def fig_dois_cilindros():
    b1, xa, ya = bloco(150, 1, regul=True)
    b2, xb, yb = bloco(700, 2)
    b = b1 + b2
    yl = 600
    b += ln(xa, ya, xa, yl) + pl([(xb, yb), (xb, yl), (xa, yl)]) + dot(xa, yl)
    b += ln(xa, yl, xa, yl + 30) + fonte(xa, yl + 50)
    b += codigo(xa - 32, yl + 58, "0Z1", False, "end")
    svg(b, 1180, 690, "fig6-dois-cilindros")


if __name__ == "__main__":
    IMG.mkdir(exist_ok=True)
    fig_anatomia()
    fig_pneumatico("fig2-pneumatico-letras", atual=False)
    fig_eletrico("fig3-eletrico-letras", atual=False)
    fig_pneumatico("fig4-pneumatico-atual", atual=True)
    fig_eletrico("fig5-eletrico-atual", atual=True)
    fig_dois_cilindros()
    print("ok")
