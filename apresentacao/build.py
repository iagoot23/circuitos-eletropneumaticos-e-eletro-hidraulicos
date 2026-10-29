#!/usr/bin/env python3
"""Monta a apresentação em um único arquivo HTML a partir de src/.

Uso: python3 apresentacao/build.py
Saída: apresentacao/Circuitos-Eletropneumaticos-e-Eletro-hidraulicos.html
"""
import re
from html import escape as html_escape
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
OUT = ROOT / "Circuitos-Eletropneumaticos-e-Eletro-hidraulicos.html"

read = lambda n: (SRC / n).read_text(encoding="utf-8")
logo_sesi = read("logo-sesi.txt").strip()
logo_senai = read("logo-senai.txt").strip()

parts = ["00-abertura.html"] + [f"dia{i:02d}.html" for i in range(1, 11)] + ["99-fim.html"]
body = "\n".join(read(p) for p in parts if (SRC / p).exists())
CHIP = '<div class="chip anim"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5a2 2 0 0 1 4 0v6"/><path d="M13 10a2 2 0 0 1 4 0v3"/><path d="M17 12a2 2 0 0 1 4 0v3a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L4.5 15a2 2 0 0 1 3.3-2.2L9 14"/></svg>Interação</div>'
# páginas autônomas embutidas como iframe srcdoc: {{DOC:arquivo.html}} (tema claro e letra maior para projeção)
DOC_CSS = "<style>body{font-size:20px}.wrap{max-width:1320px;padding:16px 28px 40px}header>div:first-child{display:none}header{margin-bottom:12px}</style></head>"
def doc(m):
    d = read(m.group(1)).replace('<html lang="pt-BR">', '<html lang="pt-BR" data-theme="light">', 1).replace("</head>", DOC_CSS, 1)
    return html_escape(d, quote=True)
body = re.sub(r"\{\{DOC:([\w.-]+)\}\}", doc, body)
body = body.replace("{{CHIP}}", CHIP).replace("{{LOGO_SESI}}", logo_sesi).replace("{{LOGO_SENAI}}", logo_senai)

html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Circuitos Eletropneumáticos e Eletro-hidráulicos | SENAI</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>
{read("base.css")}
{read("extra.css")}
</style>
<script>window.QZ={{}};</script>
</head>
<body>
<div id="stage">
{body}
<div id="menu" role="dialog" aria-label="Mapa das aulas">
  <h2>Mapa das aulas <span class="note" style="font-size:26px">(tecla M abre e fecha)</span></h2>
  <button class="btn ghost close">Fechar</button>
  <div class="daymap"></div>
</div>
<footer id="footer">
  <button class="nav-btn" id="prev" aria-label="Slide anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg><span>Anterior</span></button>
  <div class="foot-mid">
    <button class="nav-btn" id="menuBtn" aria-label="Mapa das aulas">Dias</button>
    <span id="themeLabel">Abertura</span>
    <div class="foot-right"><img class="foot-logo" src="{logo_senai}" alt="SENAI"><span id="counter">1 / 1</span></div>
  </div>
  <button class="nav-btn" id="next" aria-label="Próximo slide"><span>Próximo</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>
</footer>
</div>
<script>
{read("ladder.js")}
</script>
<script>
{read("engine.js")}
</script>
</body>
</html>
"""
OUT.write_text(html, encoding="utf-8")
print(f"{OUT.name}: {len(html)/1024:.0f} KB, {body.count('<section')} slides")
