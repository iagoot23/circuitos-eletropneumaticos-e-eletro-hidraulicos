from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
import datetime as dt
import sys

OUT = sys.argv[1]

HOR = ["13:30–14:15", "14:15–15:00", "15:00–15:45", "16:00–16:45", "16:45–17:30"]

# Referências abreviadas
TPI = "Apresentação - Tecnologia Pneumática Industrial"
FIEMG = "Apostila - Acionamentos hidráulicos e pneumáticos"
MOC = "Apostila - Circuitos Pneumáticos e Hidráulicos"
CIM = "Apresentação - Circuitos Pneumáticos"
FESTO = "Manual de Operação, Conservação e Manutenção (Festo)"
COMPL = "Conteúdo pesquisado na web e consolidado nos slides (ver aba Ferramentas e Recursos)"

# Dias: (nº, data, tipo, tema, capacidades, avaliação do dia)
DIAS = [
    (1, "2026-10-28", "Teoria", "Fundamentos, produção, tratamento e distribuição do ar comprimido", "C2, C6", ""),
    (2, "2026-10-29", "Teoria + Simulação", "Componentes pneumáticos, simbologia e introdução ao FluidSIM", "C2, C3, C6", ""),
    (3, "2026-11-04", "Avaliação + Teoria", "Atividade em Sala + eletroválvulas e componentes elétricos de comando", "C2, C3, C6", "Atividade em Sala (20 pts)"),
    (4, "2026-11-05", "Teoria + Simulação", "Circuitos eletropneumáticos – método intuitivo e diagrama trajeto-passo", "C2, C3", ""),
    (5, "2026-11-11", "Prática 1", "PRÁTICA – Eletropneumática com comandos eletromecânicos (contatoras/relés, botões, temporizadores, sensores)", "C1, C2, C4, C5", ""),
    (6, "2026-11-12", "Avaliação + Teoria", "Avaliação Teórica + introdução à hidráulica e fluidos hidráulicos", "C2, C6", "Avaliação Teórica (20 pts)"),
    (7, "2026-11-18", "Teoria + Simulação", "Componentes e circuitos eletro-hidráulicos + CLP e redes industriais", "C2, C3, C6", ""),
    (8, "2026-11-19", "Prática 2", "PRÁTICA – Eletropneumática acionada por CLP", "C1, C2, C4, C5", ""),
    (9, "2026-11-25", "Prática 3", "PRÁTICA – Eletro-hidráulica", "C1, C2, C4, C5", ""),
    (10, "2026-11-26", "Avaliação + Teoria", "Avaliação Prática + manutenção, diagnóstico e revisão para o SAEP", "C1, C4, C5", "Avaliação Prática (20 pts)"),
]

# Aulas: dia -> lista de 5 tuplas (tipo, conteúdo, estratégia, ferramenta, referência)
AV = "Avaliação"
AULAS = {
    1: [
        ("Conteúdo", "Apresentação da UC: plano de ensino, cronograma, critérios de avaliação (100 pts; <40 reprovado, 40–59 recuperação, ≥60 aprovado) e frequência mínima de 75% por aula. Manual de segurança e boas práticas do laboratório; EPIs. Tour virtual 360° pela fábrica STAUFF (Alemanha): missão de identificar aplicações de ar comprimido e hidráulica.",
         "Exposição dialogada + tour virtual guiado", "Slides HTML; Tour virtual STAUFF", f"{MOC} – cap. 1.2 (p. 5–6); info-unidade-curricular.txt"),
        ("Conteúdo", "Introdução à pneumática: histórico, aplicações, vantagens e limitações. Princípios físicos do ar: compressibilidade, elasticidade, peso do ar, pressão atmosférica, pressão absoluta x relativa, unidades de pressão (bar, kgf/cm², psi, Pa).",
         "Exposição dialogada + demonstração", "Slides HTML; PhET Under Pressure", f"{TPI} – slides 3–6; {FIEMG} – p. 7–16"),
        ("Conteúdo", "Leis dos gases (Boyle-Mariotte, Charles, Gay-Lussac), efeito combinado e Princípio de Pascal. Exercícios: conversão de unidades e força em cilindros (F = P·A).",
         "Resolução de exercícios", "Slides HTML; PhET Under Pressure; lista de exercícios", f"{TPI} – slide 7; {FIEMG} – p. 16–21"),
        ("Conteúdo", "Produção do ar comprimido: tipos de compressores (pistão, parafuso, palhetas, radial), resfriador posterior, reservatório (dreno, válvula de segurança, manômetro), manutenção do compressor.",
         "Exposição dialogada + imagens/vídeos", "Slides HTML; visita à casa de compressores (se disponível)", f"{TPI} – slides 8–12; {FIEMG} – p. 22–36"),
        ("Conteúdo", "Tratamento e distribuição: contaminantes, filtros, ponto de orvalho, secadores (refrigeração, absorção, adsorção); rede de distribuição (layout, inclinação, tomadas, materiais), perda de carga e vazamentos. Orientação do Formulário Assíncrono I.",
         "Exposição dialogada + estudo de caso (custo de vazamentos)", "Slides HTML", f"{TPI} – slides 13–30; {FIEMG} – p. 37–59"),
    ],
    2: [
        ("Conteúdo", "Unidade de preparação (lubrefil): filtro, regulador de pressão, manômetro, lubrificador, sistema non-lube. Mangueiras, tubos (PU/nylon) e conexões (engates rápidos, conexões instantâneas).",
         "Exposição + manuseio de componentes", "Slides HTML; componentes do painel Festo", f"{TPI} – slides 28–40; {FESTO} – componentes pneumáticos (p. 7+)"),
        ("Conteúdo", "Válvulas de controle direcional: vias e posições, identificação dos orifícios (1, 2, 3, 4, 5, 12, 14), tipos de acionamento e retorno. Simbologia ISO 1219.",
         "Exposição dialogada + exercício de leitura de símbolos", "Slides HTML; componentes do painel Festo", f"{TPI} – slides 41–56; {FIEMG} – p. 60–64"),
        ("Conteúdo", "Válvulas auxiliares: retenção, escape rápido, elemento OU, elemento E, controle de fluxo (meter-in/meter-out), temporizador pneumático. Visão geral de vácuo (Venturi e ventosas).",
         "Exposição dialogada", "Slides HTML", f"{TPI} – slides 66–93"),
        ("Conteúdo", "Atuadores pneumáticos: simples e dupla ação, amortecimento, haste dupla, tandem, sem haste, rotativos, garras. Cálculo de força de avanço/retorno e consumo de ar.",
         "Exposição + resolução de exercícios", "Slides HTML; lista de exercícios", f"{TPI} – slides 94–115; {FIEMG} – p. 65–70"),
        ("Conteúdo", "Software de simulação: introdução ao FluidSIM-P (interface, biblioteca, conexões, simulação). Comando direto e indireto de cilindro; válvulas 5/2 por alavanca, piloto e duplo piloto.",
         "Prática guiada no software", "FluidSIM (laboratório de informática)", f"{CIM} – Ensaios 01, 02, 15, 17, 18; {FIEMG} – p. 71–83"),
    ],
    3: [
        (AV, "ATIVIDADE EM SALA (20 pts): projeto e simulação no FluidSIM de circuitos pneumáticos (comando direto/indireto, comando de dois locais – elemento OU, bimanual – elemento E, controle de velocidade, retorno automático) + identificação de componentes e simbologia.",
         "Atividade avaliativa individual/dupla", "FluidSIM; Modelo de Atividade.docx", f"{CIM} – Ensaios 03–13, 19–23"),
        (AV, "ATIVIDADE EM SALA (continuação).", "Atividade avaliativa", "FluidSIM; Modelo de Atividade.docx", f"{CIM}"),
        (AV, "ATIVIDADE EM SALA (continuação e entrega).", "Atividade avaliativa", "FluidSIM; Modelo de Atividade.docx", f"{CIM}"),
        ("Conteúdo", "Eletroválvulas: solenoide (bobina 24 Vcc, LED indicador), acionamento direto x servocomandado (indireto), simples solenoide com retorno por mola x duplo solenoide (memória), acionamento manual auxiliar. Simbologia.",
         "Exposição dialogada + manuseio", "Slides HTML; eletroválvulas do painel Festo", f"{TPI} – slides 48–51, 55; {FIEMG} – p. 84–85; {FESTO} – p. 49+"),
        ("Conteúdo", "Componentes elétricos de comando: fonte 24 Vcc, botoeiras (NA/NF, pulsador/trava, emergência), relés e contatores (A1/A2, 13-14 / 11-12), fim de curso, sensores de proximidade (indutivo, capacitivo, óptico, magnético; PNP/NPN), temporizador (retardo na energização/desenergização), contador, pressostato. Simbologia elétrica (IEC 60617). Orientação do Formulário Assíncrono II.",
         "Exposição + manuseio de componentes", "Slides HTML; módulos elétricos do painel Festo", f"{FESTO} – componentes eletropneumáticos e eletroeletrônicos (p. 49–76)"),
    ],
    4: [
        ("Conteúdo", "Diagramas elétrico e pneumático: convenções do diagrama de comando (escada), numeração de linhas e contatos, identificação (S, K, KT, B, Y). Comando direto e indireto (com relé) de cilindro de simples ação.",
         "Exposição + simulação", "Slides HTML; FluidSIM", f"{FIEMG} – p. 86–87"),
        ("Conteúdo", "Lógicas OU e E com botoeiras; intertravamento por botoeiras e por contatos de relé.",
         "Simulação guiada", "FluidSIM", f"{FIEMG} – p. 88–91"),
        ("Conteúdo", "Auto-retenção (selo): ligar dominante x desligar dominante; uso de válvula simples solenoide x duplo solenoide.",
         "Simulação guiada", "FluidSIM", f"{FIEMG} – p. 92–95, 98–99"),
        ("Conteúdo", "Retorno automático com fim de curso e sensores; ciclo único x ciclo contínuo; temporizador (parada temporizada no fim de curso); contador predeterminado; pressostato.",
         "Simulação guiada + desafio", "FluidSIM", f"{FIEMG} – p. 96–97, 100–111; {CIM} – Ensaio 24"),
        ("Conteúdo", "Diagrama trajeto-passo e representação algébrica (ex.: A+ B+ A− B−; A+ B+ B− A−). Identificação de sobreposição de sinais. Sequência com 2 cilindros no FluidSIM.",
         "Exposição + simulação", "Slides HTML; FluidSIM", f"{TPI} – slides 127–128; {CIM} – Ensaio 26"),
    ],
    5: [
        ("Conteúdo", "Sequências com sobreposição de sinais resolvidas por relés (método passo a passo / cascata elétrica). Briefing de segurança e organização do painel; roteiro da prática.",
         "Exposição + validação prévia no software", "Slides HTML; FluidSIM", f"{FIEMG} – p. 86–111"),
        ("Prática", "Reconhecimento do painel Festo; montagem de comando indireto com relé/contatora e auto-retenção (botões liga/desliga, emergência) acionando cilindro de dupla ação.",
         "Montagem em bancada (grupos)", "Painel Festo de Eletropneumática; multímetro", f"{FESTO}; {FIEMG} – p. 92–99"),
        ("Prática", "Retorno automático e ciclo contínuo com fim de curso e sensores (indutivo, capacitivo, óptico, magnético). Ligação de sensores PNP de 3 fios.",
         "Montagem em bancada", "Painel Festo; sensores; multímetro", f"{FESTO} – sensores; {FIEMG} – p. 96–97, 104–107"),
        ("Prática", "Temporizador (parada temporizada no avanço) e contador (n ciclos e parada).",
         "Montagem em bancada", "Painel Festo; placa de temporizadores; contador", f"{FIEMG} – p. 100–107"),
        ("Prática", "Sequência eletropneumática com 2 cilindros (A+ B+ A− B− ou A+ B+ B− A−) por relés. Testes de funcionamento, diagnóstico de falhas, desmontagem e organização.",
         "Montagem em bancada + checklist de testes", "Painel Festo; multímetro; roteiro de testes", f"{FESTO} – recomendações de operação (p. 77+)"),
    ],
    6: [
        (AV, "AVALIAÇÃO TEÓRICA (20 pts): ar comprimido, componentes pneumáticos, simbologia, eletroválvulas, componentes elétricos, circuitos eletropneumáticos, diagrama trajeto-passo e representação algébrica.",
         "Prova escrita individual", "Prova impressa", "Conteúdos dos dias 1 a 5"),
        (AV, "AVALIAÇÃO TEÓRICA (continuação).", "Prova escrita individual", "Prova impressa", ""),
        (AV, "AVALIAÇÃO TEÓRICA (continuação e entrega).", "Prova escrita individual", "Prova impressa", ""),
        ("Conteúdo", "Introdução à hidráulica: aplicações e comparação com a pneumática; pressão, Lei de Pascal, multiplicação de força, conservação de energia, transmissão hidráulica de força; vazão x velocidade (Q = v·A); manômetro.",
         "Exposição + simulação", "Slides HTML; PhET Under Pressure", f"{FIEMG} – p. 112–125"),
        ("Conteúdo", "Fluidos hidráulicos: tipos (mineral, sintético, base água, biodegradável), características (viscosidade, índice de viscosidade, compressibilidade, ponto de fulgor), aplicações; contaminação, ar e água no óleo; reservatório e resfriadores.",
         "Exposição + simulação", "Slides HTML; PhET Density", f"{FIEMG} – p. 124–131"),
    ],
    7: [
        ("Conteúdo", "Unidade hidráulica: reservatório, motor, bombas (engrenagem externa/interna, palhetas, pistões), cavitação, filtros, manômetro. Tubulações, mangueiras e conexões hidráulicas.",
         "Exposição + tour virtual", "Slides HTML; Tour virtual Stauff (mangueiras, conexões, filtros)", f"{FIEMG} – p. 129–146"),
        ("Conteúdo", "Válvulas hidráulicas: limitadora/reguladora de pressão (alívio), redutora, de sequência; controle de fluxo; retenção simples e pilotada. Atuadores hidráulicos (cilindros e motores).",
         "Exposição dialogada", "Slides HTML", COMPL),
        ("Conteúdo", "Eletroválvulas direcionais (4/2, 4/3 – centro fechado, aberto, tandem) e proporcionais (conceito, amplificador, aplicações). Circuitos eletro-hidráulicos: diagramas elétrico e hidráulico, simbologia, trajeto-passo; simulação.",
         "Exposição + simulação", "Slides HTML; FluidSIM-H", COMPL),
        ("Conteúdo", "Controlador Lógico Programável (CLP): arquitetura, entradas/saídas digitais 24 Vcc, ligação de botões, sensores e solenoides, ciclo de varredura. Linguagem Ladder: contatos NA/NF, bobina, set/reset, temporizador (TON), contador.",
         "Exposição + programação guiada", "Slides HTML; WEG Clic02 Edit", "WEG – Manual do usuário CLIC-02 (cap. 5 e 7)"),
        ("Conteúdo", "Conversão de circuito eletropneumático por relés para Ladder. Válvulas com comunicação em rede industrial: bloco manifold, ilha de válvulas, fieldbus (Profibus/Profinet/IO-Link). Briefing da prática com CLP.",
         "Exposição + exercício de conversão", "Slides HTML; WEG Clic02 Edit", f"{TPI} – slides 60–65"),
    ],
    8: [
        ("Prática", "Ligação física do CLP: alimentação, entradas (botões, sensores PNP) e saídas (solenoides); tabela de mapeamento de E/S; teste de E/S.",
         "Montagem em bancada (grupos)", "Painel Festo + CLP WEG Clic02; multímetro", f"{FESTO} – interface CLP"),
        ("Prática", "Programação em Ladder: comando liga/desliga com auto-retenção e set/reset acionando cilindro de dupla ação.",
         "Programação + montagem", "CLP WEG Clic02; Clic02 Edit; painel Festo", ""),
        ("Prática", "Retorno automático com sensores, ciclo contínuo e temporizador (TON).",
         "Programação + montagem", "CLP WEG Clic02; Clic02 Edit; painel Festo", ""),
        ("Prática", "Sequência A+ B+ B− A− em Ladder (passos com memórias); contador de ciclos.",
         "Programação + montagem", "CLP WEG Clic02; Clic02 Edit; painel Festo", ""),
        ("Prática", "Testes de funcionamento, botão de emergência, diagnóstico de falhas; comparação comando por relés x CLP; registro dos resultados.",
         "Testes + discussão", "CLP; painel Festo; roteiro de testes", ""),
    ],
    9: [
        ("Prática", "Segurança em hidráulica (pressão residual, vazamentos, óleo, despressurização). Reconhecimento da bancada/unidade hidráulica: nível, filtro, ajuste da válvula limitadora de pressão.",
         "Demonstração + reconhecimento", "Bancada eletro-hidráulica (confirmar disponibilidade); manômetro", COMPL),
        ("Prática", "Desenho do esquema eletro-hidráulico e simulação prévia; planejamento da instalação e sequência de montagem.",
         "Simulação + planejamento", "FluidSIM-H", ""),
        ("Prática", "Montagem: cilindro de dupla ação com eletroválvula 4/3 duplo solenoide (centro tandem/fechado), botoeiras e relés.",
         "Montagem em bancada (grupos)", "Bancada eletro-hidráulica; módulos elétricos", ""),
        ("Prática", "Controle de velocidade (válvula reguladora de fluxo) e retorno automático por fim de curso/pressostato; leitura de pressão no manômetro.",
         "Montagem em bancada + medições", "Bancada eletro-hidráulica; manômetro", ""),
        ("Prática", "Testes de funcionamento, diagnóstico de falhas, despressurização, desmontagem e limpeza. Orientação da Avaliação Prática.",
         "Testes + checklist", "Bancada eletro-hidráulica; roteiro de testes", ""),
    ],
    10: [
        (AV, "AVALIAÇÃO PRÁTICA (20 pts): interpretação de esquema, montagem e testes de funcionamento de circuito eletropneumático (relés ou CLP) e/ou eletro-hidráulico no painel.",
         "Avaliação prática em bancada", "Painel Festo; CLP; bancada eletro-hidráulica; ficha de avaliação", "Conteúdos dos dias 1 a 9"),
        (AV, "AVALIAÇÃO PRÁTICA (continuação).", "Avaliação prática em bancada", "Painel Festo; ficha de avaliação", ""),
        (AV, "AVALIAÇÃO PRÁTICA (continuação e encerramento).", "Avaliação prática em bancada", "Painel Festo; ficha de avaliação", ""),
        ("Conteúdo", "Manutenção e diagnóstico: recomendações de operação, conservação e manutenção; vedações e falhas típicas (extrusão, deformação, abrasão, descompressão explosiva); falhas comuns em circuitos eletropneumáticos e eletro-hidráulicos.",
         "Exposição + estudo de casos", "Slides HTML", f"{FESTO} – p. 77+; {TPI} – slides 116–126"),
        ("Conteúdo", "Revisão geral para o Simulado SAEP (14/12), devolutiva das avaliações e encerramento da UC.",
         "Revisão com questões estilo SAEP", "Slides HTML; questões de revisão", "Todos os materiais"),
    ],
}

ASSINC = [
    ("A1", "2026-10-30", "Formulário Aula Assíncrona I (10 pts)", "Ar comprimido (física, produção, tratamento, distribuição), unidade de preparação, válvulas direcionais e auxiliares, atuadores, simbologia ISO 1219.", "Formulário online + leitura dirigida", f"{TPI} – slides 3–115; {FIEMG} – p. 7–83"),
    ("A2", "2026-11-06", "Formulário Aula Assíncrona II (10 pts)", "Eletroválvulas, componentes elétricos de comando, diagramas elétricos, circuitos eletropneumáticos pelo método intuitivo, trajeto-passo e representação algébrica.", "Formulário online + leitura dirigida", f"{FIEMG} – p. 84–111; {FESTO} – p. 49–76"),
]

AVALIACOES = [
    ("Formulário Aula Assíncrona I", "2026-10-30", 10, "Assíncrona", "Dias 1–2", "Formulário online"),
    ("Atividade em Sala", "2026-11-04", 20, "Presencial – Dia 3 (aulas 1–3)", "Dias 1–2 (pneumática e simulação)", "Atividade no FluidSIM (Modelo de Atividade.docx)"),
    ("Formulário Aula Assíncrona II", "2026-11-06", 10, "Assíncrona", "Dias 3–4", "Formulário online"),
    ("Avaliação Teórica", "2026-11-12", 20, "Presencial – Dia 6 (aulas 1–3)", "Dias 1–5 (pneumática e eletropneumática)", "Prova escrita"),
    ("Avaliação Prática", "2026-11-26", 20, "Presencial – Dia 10 (aulas 1–3)", "Dias 5, 8, 9 (práticas) e conteúdos relacionados", "Montagem e testes em bancada + ficha de avaliação"),
    ("Simulado SAEP", "2026-12-14", 20, "Simulado", "Todos os conteúdos", "Simulado objetivo"),
]

CAPACIDADES = [
    ("C1", "Identificar, selecionar e utilizar as ferramentas, equipamentos e instrumentos, visando a instalação de componentes em sistemas eletro-hidráulicos e eletropneumáticos"),
    ("C2", "Identificar os componentes, circuitos e conexões, de acordo com o projeto e manual do fabricante, tendo em vista a instalação de dispositivos de sistemas eletro-hidráulicos e eletropneumáticos"),
    ("C3", "Aplicar técnicas de simulação de sistemas eletro-hidráulicos e eletropneumáticos, por meio da utilização de softwares específicos, em conformidade com o projeto e instruções do fabricante"),
    ("C4", "Aplicar técnicas de montagem e instalação de dispositivos de sistemas eletro-hidráulicos e eletropneumáticos, de acordo com o projeto e manual do fabricante"),
    ("C5", "Aplicar técnicas de testes de funcionamento dos dispositivos de sistemas eletro-hidráulicos e eletropneumáticos, por meio da utilização de instrumentos de verificação, em conformidade com o manual do fabricante"),
    ("C6", "Identificar as especificações técnicas dos insumos, dispositivos, máquinas, equipamentos e ferramentas nos manuais e catálogos do fabricante, para a instalação dos dispositivos de sistemas eletro-hidráulicos e eletropneumáticos"),
]

# Conhecimentos (ementa) x dias
CONHEC = [
    ("Sistemas Eletropneumáticos", "Ar comprimido: produção, distribuição, tratamento; características físicas", [1]),
    ("Sistemas Eletropneumáticos", "Componentes pneumáticos: unidade de preparação, atuadores, mangueiras e conexões", [2]),
    ("Sistemas Eletropneumáticos", "Eletroválvulas", [3]),
    ("Sistemas Eletropneumáticos", "Circuitos eletropneumáticos: diagramas elétrico e pneumático; simbologias", [2, 3, 4]),
    ("Sistemas Eletropneumáticos", "Diagrama trajeto-passo; representação algébrica", [4, 5]),
    ("Sistemas Eletropneumáticos", "Software de simulação", [2, 3, 4]),
    ("Sistemas Eletropneumáticos", "Montagem: desenho de esquemas, planejamento, sequência de montagem, instalação de componentes", [5, 8]),
    ("Sistemas Eletropneumáticos", "Instalação de válvulas com comunicação em rede industrial", [7]),
    ("Sistemas Eletropneumáticos", "Testes de funcionamento", [5, 8, 10]),
    ("Sistemas Eletro-hidráulicos", "Fluidos hidráulicos: tipos, características, aplicações", [6]),
    ("Sistemas Eletro-hidráulicos", "Componentes: unidade hidráulica, válvulas reguladoras de pressão, atuadores, tubulações e conexões", [7]),
    ("Sistemas Eletro-hidráulicos", "Eletroválvulas: direcionais e proporcionais", [7]),
    ("Sistemas Eletro-hidráulicos", "Circuitos eletro-hidráulicos: diagramas, simbologia, trajeto-passo, representação algébrica, simulação", [7, 9]),
    ("Sistemas Eletro-hidráulicos", "Montagem: desenho de esquemas, planejamento, sequência de montagem, instalação de componentes", [9]),
    ("Sistemas Eletro-hidráulicos", "Instalação de válvulas com comunicação em rede industrial", [7]),
    ("Sistemas Eletro-hidráulicos", "Testes de funcionamento", [9, 10]),
]

RECURSOS = [
    ("Slides HTML", "Apresentação da disciplina", "Todos os dias de teoria", "apresentacao/Circuitos-Eletropneumaticos-e-Eletro-hidraulicos.html"),
    ("FluidSIM 4/5 (P e H)", "Software de simulação de circuitos pneumáticos, eletropneumáticos e eletro-hidráulicos", "Dias 2, 3, 4, 5, 7, 9", "Laboratório de informática"),
    ("Painel Festo de Pneumática e Eletropneumática", "Bancada com módulos pneumáticos, eletroválvulas, relés, temporizadores, contador, sensores e interface CLP", "Dias 2, 3, 5, 8, 10", "material/Manual de Operação, Conservação e Manutenção.pdf"),
    ("CLP WEG Clic02 + Clic02 Edit", "CLP do laboratório; programação Ladder e simulação no Clic02 Edit (download gratuito WEG)", "Dias 7, 8, 10", "https://www.weg.net"),
    ("Bancada eletro-hidráulica", "Unidade hidráulica, eletroválvulas, cilindros, manômetros", "Dias 9, 10", "Confirmar disponibilidade; alternativa: FluidSIM-H"),
    ("PhET – Under Pressure", "Pressão em fluidos: profundidade, densidade, gravidade", "Dias 1, 6", "https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_all.html"),
    ("PhET – Density", "Densidade de fluidos; modo fluido misterioso", "Dia 6", "https://phet.colorado.edu/sims/html/density/latest/density_all.html"),
    ("Tour virtual Stauff", "Fábrica real do setor hidráulico (tubos, conexões, mangueiras, filtros)", "Dias 1, 7", "https://cdn-assets.stauff.com/$web/plant-tour/index.htm"),
    ("Multímetro / manômetro", "Instrumentos para testes de funcionamento", "Dias 5, 8, 9, 10", "Laboratório"),
    ("Formulário online", "Formulários das aulas assíncronas", "30/10 e 06/11", "Será criado na etapa de avaliações"),
    ("Modelo de Atividade.docx", "Modelo para a Atividade em Sala", "Dia 3", "modelos/Modelo de Atividade.docx"),
]

# ---------- estilos ----------
AZUL = "1F3864"
thin = Side(style="thin", color="A6A6A6")
BORDA = Border(left=thin, right=thin, top=thin, bottom=thin)
HDR_FONT = Font(bold=True, color="FFFFFF", size=11)
HDR_FILL = PatternFill("solid", fgColor=AZUL)
WRAP = Alignment(wrap_text=True, vertical="top")
CENTER = Alignment(wrap_text=True, vertical="top", horizontal="center")
CORES_TIPO = {
    "Conteúdo": "FFFFFF",
    "Prática": "E2EFDA",
    AV: "FCE4D6",
    "Assíncrona": "DDEBF7",
}
CORES_DIA = {
    "Teoria": "FFFFFF",
    "Teoria + Simulação": "FFFFFF",
    "Prática 1": "E2EFDA",
    "Prática 2": "E2EFDA",
    "Prática 3": "E2EFDA",
    "Avaliação + Teoria": "FCE4D6",
}
SEM = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"]


def d(s):
    return dt.date.fromisoformat(s)


def header(ws, row, cols, widths):
    for i, (c, w) in enumerate(zip(cols, widths), 1):
        cell = ws.cell(row=row, column=i, value=c)
        cell.font = HDR_FONT
        cell.fill = HDR_FILL
        cell.alignment = CENTER
        cell.border = BORDA
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.row_dimensions[row].height = 30


def title(ws, text, sub, ncols):
    ws.cell(row=1, column=1, value=text).font = Font(bold=True, size=14, color=AZUL)
    ws.cell(row=2, column=1, value=sub).font = Font(italic=True, size=10, color="595959")
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=ncols)
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=ncols)


def style_row(ws, row, ncols, fill, center_cols=()):
    for c in range(1, ncols + 1):
        cell = ws.cell(row=row, column=c)
        cell.border = BORDA
        cell.alignment = CENTER if c in center_cols else WRAP
        if fill:
            cell.fill = PatternFill("solid", fgColor=fill)


UC = "Circuitos Eletropneumáticos e Eletro-hidráulicos Aplicados à Manufatura"
wb = Workbook()

# ---------- Plano de Aulas (detalhado) ----------
wp = wb.active
wp.title = "Plano de Aulas"
title(wp, f"Plano de Aulas – {UC}", "5 aulas de 45 min/dia (13:30–17:30, intervalo 15:45–16:00). Nos dias de avaliação: aulas 1–3 avaliação, aulas 4–5 conteúdo.", 9)
cols = ["Dia", "Data", "Aula", "Horário", "Tipo", "Conteúdo", "Estratégia", "Ferramenta / Recurso", "Material de referência (repo)"]
header(wp, 4, cols, [6, 12, 6, 13, 12, 70, 26, 34, 48])
r = 5
for n, data, *_ in DIAS:
    for i, (tipo, cont, estr, ferr, ref) in enumerate(AULAS[n], 1):
        vals = [n, d(data), i, HOR[i - 1], tipo, cont, estr, ferr, ref]
        for c, v in enumerate(vals, 1):
            wp.cell(row=r, column=c, value=v)
        wp.cell(row=r, column=2).number_format = "DD/MM/YYYY"
        style_row(wp, r, 9, CORES_TIPO[tipo], center_cols=(1, 2, 3, 4, 5))
        r += 1
    if n in (2, 4):
        a = ASSINC[0 if n == 2 else 1]
        vals = [a[0], d(a[1]), "—", "Assíncrona", "Assíncrona", f"{a[2]}: {a[3]}", a[4], "Formulário online", a[5]]
        for c, v in enumerate(vals, 1):
            wp.cell(row=r, column=c, value=v)
        wp.cell(row=r, column=2).number_format = "DD/MM/YYYY"
        style_row(wp, r, 9, CORES_TIPO["Assíncrona"], center_cols=(1, 2, 3, 4, 5))
        r += 1
last_plano = r - 1
wp.freeze_panes = "F5"
wp.auto_filter.ref = f"A4:I{last_plano}"
dv = DataValidation(type="list", formula1='"Conteúdo,Prática,Avaliação,Assíncrona"', allow_blank=False)
wp.add_data_validation(dv)
dv.add(f"E5:E{last_plano}")

# ---------- Visão Geral ----------
wv = wb.create_sheet("Visão Geral", 0)
title(wv, f"Cronograma – {UC}", "10 aulas presenciais + 2 aulas assíncronas. Contagens calculadas a partir da aba 'Plano de Aulas'.", 10)
cols = ["Dia", "Data", "Dia da semana", "Tipo do dia", "Tema", "Aulas de conteúdo/prática", "Aulas de avaliação", "Avaliação", "Ferramentas principais", "Capacidades"]
header(wv, 4, cols, [6, 12, 13, 18, 58, 14, 12, 24, 46, 14])
PL = "'Plano de Aulas'"
r = 5
for n, data, tipo, tema, cap, aval in DIAS:
    ferrs = []
    for a in AULAS[n]:
        for f in a[3].split(";"):
            f = f.strip()
            key = f.split("(")[0].strip().lower()
            if f and a[0] != AV and key not in [x.split("(")[0].strip().lower() for x in ferrs]:
                ferrs.append(f.split("(")[0].strip() if "confirmar" in f else f)
    vals = [n, d(data), SEM[d(data).weekday()], tipo, tema,
            f"=COUNTIFS({PL}!$A$5:$A${last_plano},A{r},{PL}!$E$5:$E${last_plano},\"<>Avaliação\")",
            f"=COUNTIFS({PL}!$A$5:$A${last_plano},A{r},{PL}!$E$5:$E${last_plano},\"Avaliação\")",
            aval or "—", "; ".join(ferrs), cap]
    for c, v in enumerate(vals, 1):
        wv.cell(row=r, column=c, value=v)
    wv.cell(row=r, column=2).number_format = "DD/MM/YYYY"
    style_row(wv, r, 10, CORES_DIA[tipo], center_cols=(1, 2, 3, 4, 6, 7, 10))
    r += 1
    if n in (2, 4):
        a = ASSINC[0 if n == 2 else 1]
        vals = [a[0], d(a[1]), SEM[d(a[1]).weekday()], "Assíncrona", a[3], "—", "—", a[2], "Formulário online", "C2, C6"]
        for c, v in enumerate(vals, 1):
            wv.cell(row=r, column=c, value=v)
        wv.cell(row=r, column=2).number_format = "DD/MM/YYYY"
        style_row(wv, r, 10, CORES_TIPO["Assíncrona"], center_cols=(1, 2, 3, 4, 6, 7, 10))
        r += 1
last_v = r - 1
wv.cell(row=r, column=5, value="TOTAL (presencial)").font = Font(bold=True)
wv.cell(row=r, column=6, value=f"=SUM(F5:F{last_v})").font = Font(bold=True)
wv.cell(row=r, column=7, value=f"=SUM(G5:G{last_v})").font = Font(bold=True)
style_row(wv, r, 10, "D9D9D9", center_cols=(6, 7))
r += 2
wv.cell(row=r, column=1, value="Legenda:").font = Font(bold=True)
for txt, cor in [("Teoria / simulação", "FFFFFF"), ("Prática em bancada", "E2EFDA"), ("Dia com avaliação (2 aulas de conteúdo)", "FCE4D6"), ("Aula assíncrona", "DDEBF7")]:
    r += 1
    c = wv.cell(row=r, column=2, value="")
    c.fill = PatternFill("solid", fgColor=cor)
    c.border = BORDA
    wv.cell(row=r, column=3, value=txt)
wv.freeze_panes = "A5"

# ---------- Avaliações ----------
wa = wb.create_sheet("Avaliações")
title(wa, "Distribuição de pontos", "Aprovado ≥ 60 | Recuperação 40–59 | Reprovado < 40 | Frequência mínima 75% (por aula)", 6)
header(wa, 4, ["Instrumento", "Data", "Pontos", "Momento", "Conteúdo avaliado", "Formato"], [32, 12, 9, 30, 44, 46])
r = 5
for nome, data, pts, mom, cont, fmt in AVALIACOES:
    for c, v in enumerate([nome, d(data), pts, mom, cont, fmt], 1):
        wa.cell(row=r, column=c, value=v)
    wa.cell(row=r, column=2).number_format = "DD/MM/YYYY"
    style_row(wa, r, 6, None, center_cols=(2, 3))
    r += 1
wa.cell(row=r, column=1, value="TOTAL").font = Font(bold=True)
wa.cell(row=r, column=3, value=f"=SUM(C5:C{r-1})").font = Font(bold=True)
style_row(wa, r, 6, "D9D9D9", center_cols=(3,))
r += 2
wa.cell(row=r, column=1, value="Frequência").font = Font(bold=True, color=AZUL)
r += 1
linhas = [
    ("Aulas presenciais (10 dias × 5)", "=COUNTA('Plano de Aulas'!F5:F{0})-COUNTIF('Plano de Aulas'!E5:E{0},\"Assíncrona\")".format(last_plano)),
    ("Aulas assíncronas", "=COUNTIF('Plano de Aulas'!E5:E{0},\"Assíncrona\")".format(last_plano)),
    ("Máximo de faltas permitido (25% das presenciais)", f"=FLOOR(B{r}*0.25,1)"),
]
for i, (lbl, f) in enumerate(linhas):
    wa.cell(row=r + i, column=1, value=lbl)
    wa.cell(row=r + i, column=2, value=f)
    style_row(wa, r + i, 2, None, center_cols=(2,))

# ---------- Conhecimentos x Dias ----------
wc = wb.create_sheet("Conhecimentos x Dias")
title(wc, "Cobertura da ementa por dia", "X = conhecimento trabalhado no dia", 13)
header(wc, 4, ["Bloco", "Conhecimento"] + [f"D{n}" for n, *_ in DIAS] + ["Nº dias"], [24, 62] + [5] * 10 + [8])
r = 5
for bloco, conh, dias in CONHEC:
    wc.cell(row=r, column=1, value=bloco)
    wc.cell(row=r, column=2, value=conh)
    for n in range(1, 11):
        wc.cell(row=r, column=2 + n, value="X" if n in dias else None)
    wc.cell(row=r, column=13, value=f'=COUNTIF(C{r}:L{r},"X")')
    style_row(wc, r, 13, "DDEBF7" if bloco.endswith("Eletro-hidráulicos") else None, center_cols=tuple(range(3, 14)))
    r += 1
wc.freeze_panes = "C5"

# ---------- Capacidades ----------
wk = wb.create_sheet("Capacidades")
title(wk, "Capacidades técnicas", "Códigos usados na aba 'Visão Geral'", 2)
header(wk, 4, ["Código", "Capacidade técnica"], [9, 120])
for i, (c, t) in enumerate(CAPACIDADES, 5):
    wk.cell(row=i, column=1, value=c)
    wk.cell(row=i, column=2, value=t)
    style_row(wk, i, 2, None, center_cols=(1,))

# ---------- Recursos ----------
wr = wb.create_sheet("Ferramentas e Recursos")
title(wr, "Ferramentas e recursos", "Itens marcados 'confirmar' dependem do laboratório", 4)
header(wr, 4, ["Ferramenta", "Descrição", "Uso (dias)", "Local / link"], [36, 60, 22, 70])
for i, row in enumerate(RECURSOS, 5):
    for c, v in enumerate(row, 1):
        wr.cell(row=i, column=c, value=v)
    style_row(wr, i, 4, None)

for ws in wb.worksheets:
    ws.sheet_view.zoomScale = 100
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True

wb.save(OUT)
print("ok", OUT, "linhas plano:", last_plano)
