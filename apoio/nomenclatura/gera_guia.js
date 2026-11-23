// Gera o guia de nomenclatura (.docx).
// Uso: python3 apoio/nomenclatura/desenha.py && NODE_PATH=<node_modules com docx> node apoio/nomenclatura/gera_guia.js
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, HeadingLevel, LevelFormat, BorderStyle, Footer, PageNumber,
} = require("docx");

const AQUI = __dirname;
const SAIDA = path.join(AQUI, "Nomenclatura-de-componentes.docx");
const AZUL = "1E2A6E";
const CINZA = "5A6275";
const LARG = 9638; // largura útil A4 com margens de 2 cm (DXA)

// ------------------------------------------------------------ auxiliares
function runs(texto, base = {}) {
  // **negrito** dentro do texto
  return texto.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((t) =>
    t.startsWith("**") ? new TextRun({ ...base, text: t.slice(2, -2), bold: true }) : new TextRun({ ...base, text: t }));
}
const p = (texto, opt = {}) => new Paragraph({ spacing: { after: 120 }, ...opt, children: runs(texto) });
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const item = (t, ref = "marcador") => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 80 }, children: runs(t) });
const nota = (t) => new Paragraph({
  spacing: { before: 60, after: 160 }, indent: { left: 284 },
  border: { left: { style: BorderStyle.SINGLE, size: 12, color: AZUL, space: 8 } },
  children: runs(t, { color: CINZA, size: 20 }),
});

function figura(arquivo, larguraPx, legenda) {
  const caminho = path.join(AQUI, "img", arquivo);
  const buf = fs.readFileSync(caminho);
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, keepNext: true,
      children: [new ImageRun({ type: "png", data: buf, transformation: { width: larguraPx, height: Math.round(larguraPx * h / w) },
        altText: { title: legenda, description: legenda, name: arquivo } })],
    }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: legenda, italics: true, size: 19, color: CINZA })] }),
  ];
}

const borda = { style: BorderStyle.SINGLE, size: 4, color: "B8BDD0" };
const bordas = { top: borda, bottom: borda, left: borda, right: borda };
function tabela(cabecalho, linhas, larguras) {
  const total = larguras.reduce((a, b) => a + b, 0);
  const cel = (t, i, cab) => new TableCell({
    borders: bordas, width: { size: larguras[i], type: WidthType.DXA },
    shading: cab ? { fill: "E3E6F2", type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: runs(t, { size: 19, bold: cab || undefined }) })],
  });
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: larguras,
    rows: [
      new TableRow({ tableHeader: true, children: cabecalho.map((t, i) => cel(t, i, true)) }),
      ...linhas.map((l) => new TableRow({ cantSplit: true, children: l.map((t, i) => cel(t, i, false)) })),
    ],
  });
}
const espaco = () => new Paragraph({ spacing: { after: 120 }, children: [] });

// ------------------------------------------------------------ conteúdo
const corpo = [
  new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("Identificação de componentes em circuitos eletropneumáticos e eletro-hidráulicos")] }),
  new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Regras da ISO 1219-2 e da IEC 81346-2, com exemplos", size: 24, color: AZUL })] }),
  new Paragraph({ spacing: { after: 300 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: AZUL, space: 6 } },
    children: [new TextRun({ text: "Circuitos Eletropneumáticos e Eletro-hidráulicos Aplicados à Manufatura · Técnico em Mecatrônica · SENAI · Instrutor: Iago Teixeira", size: 19, color: CINZA })] }),

  p("Todo componente de um diagrama recebe um código. O mesmo código aparece no desenho, na lista de peças, na etiqueta da máquina e no diagrama elétrico. Com ele, quem monta, testa ou faz a manutenção localiza a peça sem dúvida. Este guia reúne as regras das normas, mostra como aplicá-las e traz exemplos desenhados."),

  h1("1. Normas envolvidas"),
  tabela(["Norma", "O que define", "Situação"], [
    ["ISO 1219-1", "Símbolos gráficos dos componentes hidráulicos e pneumáticos", "Em vigor"],
    ["ISO 1219-2:2012", "Regras dos diagramas de circuito, incluindo o **código de identificação** dos componentes", "Em vigor (revisada e confirmada pela ISO em 2023)"],
    ["ISO 1219-2:1995", "Primeira edição. Código com **letra de grupo**: 1A1, 1V1, 1S1", "Cancelada em 2012. Ainda usada nos materiais Festo, no FluidSIM e nos slides desta unidade"],
    ["ISO 11727", "Numeração dos orifícios de válvulas pneumáticas: 1, 2, 3, 4, 5, 12, 14", "Em vigor"],
    ["IEC 81346-1 e IEC 81346-2", "Designação de referência e **letras de classe** dos componentes elétricos (e, opcionalmente, também dos fluídicos)", "Em vigor (parte 2: edição de 2019)"],
    ["IEC 60947-5-1", "Numeração dos terminais de contatos e bobinas: 13-14, 21-22, A1-A2", "Em vigor"],
  ], [2000, 4638, 3000]),
  espaco(),
  p("A ISO 1219-2:2012 cuida da parte fluídica. Para a parte elétrica, ela apenas exige que o diagrama pneumático ou hidráulico mostre, junto de cada solenoide e de cada conexão elétrica, a mesma designação usada no diagrama elétrico (item 6.3). As letras dos componentes elétricos vêm da IEC 81346-2."),

  h1("2. O código atual: ISO 1219-2:2012"),
  ...figura("fig1-anatomia.png", 620, "Figura 1: estrutura do código na edição atual (em cima) e na edição de 1995 (embaixo)"),
  h2("Regras"),
  item("Todo componente e todo conjunto de mangueira recebe um código, escrito ao lado do símbolo e repetido em todos os documentos relacionados (item 5.1.1.1).", "regras"),
  item("O código é formado, nesta ordem, por: **código da instalação**, seguido de hífen; **código do meio**; **número do circuito**, seguido de ponto; **número do componente**. O conjunto fica **dentro de um retângulo** (item 5.1.1.2).", "regras"),
  item("**Código da instalação:** número ou letra. Só é obrigatório quando o circuito abrange mais de uma instalação; com uma só, é omitido (item 5.1.2).", "regras"),
  item("**Código do meio:** só é obrigatório quando o diagrama usa mais de um meio. Letras: **H** hidráulica, **P** pneumática, **C** refrigeração, **K** fluido de corte (lubrificante refrigerante), **L** lubrificação, **G** gases técnicos (item 5.1.3).", "regras"),
  item("**Número do circuito:** os acessórios da unidade de potência ou da alimentação de ar recebem, de preferência, o circuito **0**. Os demais circuitos recebem 1, 2, 3... (item 5.1.4).", "regras"),
  item("**Número do componente:** começa em 1 e segue sem saltos dentro de cada circuito (item 5.1.5).", "regras"),
  item("**Não há letra de grupo.** A edição de 2012 retirou as letras A, V, S... porque elas conflitavam com as letras da IEC 61346-2 usadas na parte elétrica (Introdução da norma).", "regras"),
  item("Fins de curso e válvulas de fim de curso acionados pelo atuador são desenhados no ponto em que atuam, por exemplo junto ao cilindro, com um traço de marcação e o seu código. Se o acionamento ocorre em um só sentido, o traço recebe uma seta (item 4.3.5).", "regras"),
  item("Os orifícios são identificados no diagrama com os mesmos números ou letras gravados no componente (item 5.2). Em válvulas pneumáticas: 1 alimentação, 2 e 4 utilização, 3 e 5 escape, 12 e 14 pilotagem (ISO 11727).", "regras"),
  item("Disposição do desenho: fontes de energia embaixo, à esquerda; elementos de comando acima delas, da esquerda para a direita; atuadores em cima (item 4.3.6).", "regras"),
  h2("Como montar o código, passo a passo"),
  item("Verificar quantas instalações o diagrama abrange. Se for uma só, não usar código de instalação.", "passos"),
  item("Verificar quantos meios aparecem. Se for só ar comprimido, não usar código do meio.", "passos"),
  item("Numerar os circuitos: 0 para a alimentação; 1, 2, 3... para cada atuador e o comando que o atende.", "passos"),
  item("Numerar os componentes de cada circuito a partir de 1, sem pular números.", "passos"),
  item("Escrever o código dentro de um retângulo, ao lado do símbolo, e usar o mesmo código na lista de peças.", "passos"),
  h2("Exemplos de código"),
  tabela(["Situação", "Código"], [
    ["Cilindro de um circuito pneumático simples (uma instalação, um meio)", "**1.1**"],
    ["Unidade de conservação do mesmo circuito", "**0.1**"],
    ["Terceiro componente do circuito 2 de uma prensa eletro-hidráulica que também tem fixação pneumática (dois meios)", "**H2.3**"],
    ["Cilindro pneumático de fixação da mesma prensa", "**P1.1**"],
    ["O mesmo componente H2.3, quando o diagrama cobre duas máquinas de uma linha e a prensa é a instalação A", "**A-H2.3**"],
  ], [7638, 2000]),
  espaco(),
  nota("A norma não define a ordem em que os componentes de um circuito são numerados, apenas que a numeração começa em 1 e não tem saltos. Nos exemplos deste guia, o atuador recebe o número 1 e as válvulas vêm em seguida."),

  h1("3. O código com letras: ISO 1219-2:1995"),
  p("A edição de 1995 foi cancelada, mas o seu código continua em uso na biblioteca do FluidSIM, nos materiais da Festo e nos slides desta unidade curricular. Por isso, é preciso saber ler e escrever os dois sistemas. O formato é **número do circuito + letra do grupo + número do componente**, sem ponto e sem retângulo: 1V2 é o segundo componente do grupo V (válvulas) no circuito 1."),
  tabela(["Letra", "Grupo", "Exemplos"], [
    ["**A**", "Atuadores", "Cilindros, motores pneumáticos e hidráulicos: 1A1, 2A1"],
    ["**V**", "Válvulas", "Direcionais, reguladoras de fluxo, alternadoras, de simultaneidade: 1V1, 1V2"],
    ["**S**", "Elementos de sinal", "Fins de curso, sensores, botões pneumáticos: 1S1, 1S2"],
    ["**P**", "Bombas e compressores", "Bomba da unidade hidráulica: 0P1"],
    ["**M**", "Máquinas de acionamento", "Motor elétrico da bomba: 0M1"],
    ["**Z**", "Demais componentes", "Fonte de ar, unidade de conservação, filtro, reservatório: 0Z1, 0Z2"],
  ], [1100, 3200, 5338]),
  espaco(),
  h2("Convenções de uso"),
  p("Os itens abaixo não são exigências da norma de 1995. São convenções da Festo, adotadas nos slides e no laboratório desta unidade:"),
  item("**1V1** é a válvula que comanda diretamente o atuador 1A1. As demais válvulas do circuito 1 (reguladoras de fluxo, alternadoras...) recebem 1V2, 1V3..."),
  item("Os sensores de cada cilindro são numerados pela posição: **1S1** detecta o cilindro 1A1 **recuado**, **1S2** detecta o cilindro **avançado**."),
  item("Os solenoides levam o número do circuito e a letra Y: **1Y1** faz o cilindro avançar; **1Y2**, em válvula de duplo solenoide, faz o cilindro recuar."),
  item("A alimentação é o circuito 0: **0Z1** para a fonte de ar comprimido, **0Z2** para a unidade de conservação."),

  h1("4. Componentes elétricos: IEC 81346-2"),
  p("Na IEC 81346-2, a letra indica **o que o componente faz no sistema**, e não o que ele é fisicamente. A edição de 2009 introduziu códigos de duas letras (classe e subclasse); a edição de 2019 acrescentou uma terceira letra opcional. A tabela mostra as letras usadas nesta unidade (apostila e slides) e os códigos correspondentes da IEC 81346-2."),
  tabela(["Componente", "Usado nesta unidade", "IEC 81346-2", "Exemplo"], [
    ["Botão, chave seletora", "S", "SF", "SF1"],
    ["Fim de curso, sensor de proximidade", "1S1 ou B", "BG", "BG1"],
    ["Pressostato", "B", "BP", "BP1"],
    ["Relé auxiliar, relé temporizador, contador", "K, KT", "KF", "KF1"],
    ["Contator de potência", "K", "QA", "QA1"],
    ["Solenoide da válvula", "Y (1Y1)", "MB", "MB1"],
    ["Lâmpada de sinalização", "H", "PF", "PF1"],
    ["Fusível, disjuntor", "F", "FC", "FC1"],
    ["Fonte de 24 V cc", "G", "TB", "TB1"],
    ["Régua de bornes", "X", "XD", "XD1"],
  ], [3600, 2100, 1800, 2138]),
  espaco(),
  nota("A IEC 81346-1 usa o sinal de menos como prefixo do código de produto (-KF1). Em diagramas pequenos, como os desta unidade, o prefixo costuma ser omitido. As letras Y e H são de normas antigas, mas continuam comuns em painéis didáticos."),
  h2("Numeração dos terminais (IEC 60947-5-1)"),
  item("O **segundo dígito** indica a função do contato: **1-2** para NF e **3-4** para NA."),
  item("O **primeiro dígito** indica a ordem do contato no componente: 13-14 é o primeiro contato (NA), 21-22 é o segundo (NF), 23-24 seria um segundo contato NA."),
  item("Em contatos comutadores, o terminal 1 é o comum, o 2 é o NF e o 4 é o NA: 11-12 e 11-14."),
  item("Bobinas de relés e solenoides têm os terminais **A1** e **A2**."),

  h1("5. Ligação entre o diagrama fluídico e o elétrico"),
  item("O código de cada solenoide e de cada sensor elétrico é **idêntico** nos dois desenhos. Se o diagrama pneumático mostra 1Y1, o diagrama elétrico também mostra 1Y1, e não Y1."),
  item("O código do solenoide fica escrito ao lado do solenoide, no símbolo da válvula (ISO 1219-2:2012, item 6.3)."),
  item("Cada sensor aparece no diagrama fluídico junto ao cilindro, no ponto em que é acionado, com traço de marcação e código (item 4.3.5)."),
  item("No diagrama elétrico, as linhas de corrente são numeradas da esquerda para a direita. Cada contato traz o código do componente e os números dos seus terminais."),
  item("Embaixo de cada bobina de relé, uma referência cruzada indica em que linhas estão os contatos daquele relé (por exemplo, K1: 13-14 → linha 2)."),
  item("Os contatos são desenhados na posição de repouso: sem energia e sem acionamento."),

  h1("6. Exemplo 1: retorno automático, com o código usado nesta unidade"),
  p("**Funcionamento:** o botão S1 dá partida somente com o cilindro recuado (1S1 acionado). O relé K1 se mantém ligado pelo seu contato 13-14 (auto-retenção) e, pelo contato 23-24, energiza o solenoide 1Y1. A válvula 1V1 comuta e o cilindro 1A1 avança. Ao chegar ao fim do curso, o sensor 1S2 abre o seu contato NF, K1 desliga, 1Y1 é desenergizado, a mola devolve a válvula à posição de repouso e o cilindro recua sozinho."),
  ...figura("fig2-pneumatico-letras.png", 440, "Figura 2: diagrama pneumático do exemplo 1 (código com letras)"),
  ...figura("fig3-eletrico-letras.png", 380, "Figura 3: diagrama elétrico do exemplo 1"),
  nota("Os contatos estão desenhados sem acionamento. Com o cilindro recuado, 1S1 está acionado e o seu contato NA está fechado; é essa condição que libera a partida."),
  tabela(["Código", "Componente", "Aparece em"], [
    ["0Z1", "Fonte de ar comprimido", "Pneumático"],
    ["1A1", "Cilindro de dupla ação", "Pneumático"],
    ["1V1", "Válvula 5/2 de simples solenoide, retorno por mola", "Pneumático"],
    ["1Y1", "Solenoide de 1V1", "Pneumático e elétrico"],
    ["1S1, 1S2", "Fins de curso: cilindro recuado e avançado", "Pneumático e elétrico"],
    ["S1", "Botão de partida (NA, 13-14)", "Elétrico"],
    ["K1", "Relé auxiliar", "Elétrico"],
  ], [1800, 5638, 2200]),

  h1("7. Exemplo 2: o mesmo circuito no sistema atual"),
  p("O circuito é o mesmo do exemplo 1. Mudam apenas os códigos: os componentes fluídicos seguem a ISO 1219-2:2012 (sem letra de grupo, com ponto e retângulo) e os elétricos seguem a IEC 81346-2. Os sensores e o solenoide aparecem no diagrama pneumático com a designação elétrica, como exige o item 6.3."),
  ...figura("fig4-pneumatico-atual.png", 440, "Figura 4: diagrama pneumático do exemplo 2 (ISO 1219-2:2012)"),
  ...figura("fig5-eletrico-atual.png", 380, "Figura 5: diagrama elétrico do exemplo 2 (IEC 81346-2)"),
  tabela(["Componente", "Exemplo 1 (unidade)", "Exemplo 2 (atual)"], [
    ["Fonte de ar comprimido", "0Z1", "0.1"],
    ["Cilindro de dupla ação", "1A1", "1.1"],
    ["Válvula 5/2 de simples solenoide", "1V1", "1.2"],
    ["Solenoide da válvula", "1Y1", "MB1"],
    ["Fim de curso, cilindro recuado", "1S1", "BG1"],
    ["Fim de curso, cilindro avançado", "1S2", "BG2"],
    ["Botão de partida", "S1", "SF1"],
    ["Relé auxiliar", "K1", "KF1"],
  ], [4638, 2500, 2500]),

  h1("8. Exemplo 3: dois cilindros"),
  p("Cada cilindro forma um circuito: tudo o que comanda o cilindro 1A1 recebe o número 1; tudo o que comanda 2A1 recebe o número 2. A fonte é comum aos dois e fica no circuito 0. As válvulas reguladoras de fluxo unidirecionais do cilindro 1 são componentes do circuito 1 e recebem os números seguintes à válvula direcional: 1V2 e 1V3."),
  ...figura("fig6-dois-cilindros.png", 620, "Figura 6: dois cilindros com válvulas 5/2 de duplo solenoide (código com letras)"),
  tabela(["Componente", "Com letras", "ISO 1219-2:2012 + IEC 81346-2"], [
    ["Fonte de ar comprimido", "0Z1", "0.1"],
    ["Cilindro 1", "1A1", "1.1"],
    ["Válvula direcional do cilindro 1", "1V1", "1.2"],
    ["Reguladoras de fluxo do cilindro 1", "1V2, 1V3", "1.3, 1.4"],
    ["Solenoides de avanço e de retorno do cilindro 1", "1Y1, 1Y2", "MB1, MB2"],
    ["Sensores do cilindro 1 (recuado, avançado)", "1S1, 1S2", "BG1, BG2"],
    ["Cilindro 2", "2A1", "2.1"],
    ["Válvula direcional do cilindro 2", "2V1", "2.2"],
    ["Solenoides do cilindro 2", "2Y1, 2Y2", "MB3, MB4"],
    ["Sensores do cilindro 2", "2S1, 2S2", "BG3, BG4"],
  ], [4638, 2000, 3000]),
  espaco(),
  nota("Na IEC 81346-2, a numeração dos componentes elétricos é contínua no diagrama inteiro (MB1 a MB4), porque a designação elétrica não traz o número do circuito fluídico."),

  h1("9. Erros frequentes"),
  tabela(["Erro", "Correção"], [
    ["Letra O no lugar do algarismo zero (OZ1, O.1)", "O circuito de alimentação é o número zero: 0Z1, 0.1"],
    ["Código diferente nos dois desenhos (Y1 no pneumático, 1Y1 no elétrico)", "Usar exatamente o mesmo código nos dois"],
    ["Dois sistemas misturados (1A1 ao lado de 1.2)", "Escolher um sistema e usá-lo no diagrama inteiro"],
    ["Números repetidos ou com saltos no mesmo circuito (1V1, 1V3)", "Numerar a partir de 1, sem saltos"],
    ["Sensor desenhado solto, longe do cilindro", "Desenhar o traço de marcação no ponto de acionamento, com o código"],
    ["Contato sem código ou sem terminais", "Escrever o código do componente e os terminais (13-14, 21-22)"],
    ["Dois relés diferentes com o mesmo código", "Cada componente tem um código único: K1, K2..."],
    ["No sistema atual, código sem retângulo", "Envolver o código em um retângulo"],
  ], [4819, 4819]),

  h1("Referências"),
  p("ISO 1219-2:2012. Fluid power systems and components: graphical symbols and circuit diagrams. Part 2: Circuit diagrams. Introdução e itens 4.3.5, 4.3.6, 5.1, 5.2 e 6.3."),
  p("ISO 1219-2:1995. Fluid power systems and components: graphic symbols and circuit diagrams. Part 2: Circuit diagrams (cancelada)."),
  p("ISO 11727:1999. Pneumatic fluid power: identification of ports and control mechanisms of control valves and other components."),
  p("IEC 81346-1:2022 e IEC 81346-2:2019. Industrial systems, installations and equipment and industrial products: structuring principles and reference designations."),
  p("IEC 60947-5-1. Low-voltage switchgear and controlgear. Part 5-1: Control circuit devices and switching elements."),
  p("Apostila de Acionamentos Hidráulicos e Pneumáticos, revisão 2026, seção “Identificação dos componentes no diagrama”."),
];

const doc = new Document({
  creator: "Iago Teixeira",
  title: "Identificação de componentes em circuitos eletropneumáticos e eletro-hidráulicos",
  styles: {
    default: { document: { run: { font: "Arial", size: 21 }, paragraph: { spacing: { line: 276 } } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", run: { font: "Arial", size: 36, bold: true, color: AZUL },
        paragraph: { spacing: { before: 0, after: 120 }, keepNext: true } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Arial", size: 28, bold: true, color: AZUL }, paragraph: { spacing: { before: 360, after: 140 }, keepNext: true, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Arial", size: 23, bold: true, color: AZUL }, paragraph: { spacing: { before: 220, after: 100 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "marcador", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 567, hanging: 284 } } } }] },
      { reference: "regras", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "R%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 567, hanging: 454 } }, run: { bold: true, color: AZUL } } }] },
      { reference: "passos", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 567, hanging: 340 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: "Identificação de componentes · página ", size: 16, color: CINZA }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: CINZA })] })] }) },
    children: corpo,
  }],
});

Packer.toBuffer(doc).then((b) => { fs.writeFileSync(SAIDA, b); console.log(SAIDA); });
