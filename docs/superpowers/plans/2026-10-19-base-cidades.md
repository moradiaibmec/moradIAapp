# Base real de cidades — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerar `src/dados/cidades.json` com os ~320 municípios de 100 mil habitantes ou mais a partir de fontes públicas, e fazer o app usar essa base, mostrando a fonte de cada pilar e marcando o que é estimado.

**Architecture:**
- **Transformações puras** em `scripts/base/lib/`, testadas com Vitest: mediana do aluguel, regressão, taxa de homicídios, resumo do clima, emprego, faixas, montagem e validação.
- **Coletores de rede**, um por fonte, em `scripts/base/fontes/`, com cache em disco.
- **Orquestrador:** `scripts/base/gerar.mjs` junta tudo e grava o JSON; `scripts/base/validar.mjs` valida a base gerada.
- **No app**, a base é carregada sob demanda e passada por props.

**Tech Stack:** Node 24 (ESM, `fetch` nativo), Vitest 5, `exceljs` e `fflate` (dev), React 19 + styled-components.

**Spec:** `docs/superpowers/specs/2026-10-19-base-cidades-design.md`. A spec da análise (`2026-10-05-onboarding-analise-design.md`) define o motor.

## Global Constraints

- Universo: municípios com população residente ≥ 100.000 no Censo 2022 (SIDRA, agregado 4709, variável 93, nível N6).
- Só fontes públicas, gratuitas e sem chave de API.
- Toda requisição de rede usa o User-Agent `MoradIA-base/1.0 (prototipo academico)`. Overpass e Open-Meteo: uma requisição por cidade, com pelo menos 1 s de pausa entre elas.
- Downloads brutos em cache em `scripts/base/.cache/`, ignorado pelo git.
- Indicador ausente ou fora da faixa → `null`, com registro no log. A geração não para por causa de uma cidade.
- "Estimado" = valor calculado pelo MoradIA por modelo ou extrapolação. Nesta versão, só o `aluguel` das cidades fora do FipeZap.
- Faixas plausíveis (fora delas → `null`): `tempMedia` 10–30; `homicidios100k` 0–150; `leitos1k` 0–20; `idebIniciais` e `idebFinais` 2–9. Os demais indicadores numéricos precisam ser ≥ 0.
- Aluguel: SM de 2010 = R$ 510; limite superior da faixa aberta "mais de 5 SM" = 7,5 SM; áreas por domicílio 1→40 m², 2→55 m², 3→70 m², 4→85 m².
- Setores para seções CNAE: tecnologia J, financas K, saude Q, educacao P, industria C, comercio G, servicos I+L+M+N+S, agronegocio A.
- Pt-BR em identificadores e textos, como no resto do projeto. Scripts de Node em `.mjs`, porque o ESLint já dá globais de Node a `scripts/**/*.mjs`.

## Review Focus

1. **URL de fonte mudou ou caiu na hora de gerar** → a geração para com erro dizendo qual fonte e qual URL falharam, sem gravar um `cidades.json` parcial. Teste na Tarefa 2.
2. **Cidade do universo sem dado numa fonte** (timeout no Overpass, município que não está no arquivo do INEP) → aquele indicador fica `null` e a cidade continua na base. Teste na Tarefa 6.
3. **Aba do FipeZap sem município correspondente, ou homônima** → não é casada com a cidade errada, e fica listada como não encontrada. Teste na Tarefa 3.
4. **Município sem Censo 2010** (criado depois de 2010, ou com faixas todas zeradas) → mediana `null`, aluguel `null` e a cidade não aparece como estimada. Teste na Tarefa 3.
5. **`cidades.json` demorando ou falhando para carregar no app** → "Nova Análise" mostra carregamento ou erro com "Tentar de novo", e não uma tela em branco. Verificação manual na Tarefa 9.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/dados/cidadesFixture.js` | Fixture atual, renomeada, só para testes |
| `src/analise/match.js` | Renomeia indicadores e marca `estimado` em cada nota |
| `scripts/base/baixar.mjs` | `baixar()` com cache, User-Agent e erro claro |
| `scripts/base/lib/aluguel.mjs` | Mediana de 2010, regressão, previsão e aluguel por tamanho |
| `scripts/base/lib/fipezap.mjs` | Casar abas do FipeZap com municípios |
| `scripts/base/lib/homicidios.mjs` | Taxa com descarte de ano destoante |
| `scripts/base/lib/clima.mjs` | Resumo de 10 anos de dados diários |
| `scripts/base/lib/emprego.mjs` | Indicadores de emprego por seção CNAE |
| `scripts/base/lib/montagem.mjs` | Faixas, montagem da cidade e da base |
| `scripts/base/lib/validacao.mjs` | Regras de `base:validar` |
| `scripts/base/fontes/*.mjs` | Um coletor por fonte (rede) |
| `scripts/base/gerar.mjs`, `scripts/base/validar.mjs` | Comandos `npm run base:gerar` e `base:validar` |
| `src/dados/cidades.json` | Base gerada, com commit |
| `src/dados/base.js` | `carregarBase()` sob demanda |
| `src/analise/explicacao.js` | `fonteDoPilar()` |
| `src/analise/coerencia.test.js` | Testes do motor sobre a base real |

Os testes de `scripts/base/lib/*.mjs` ficam ao lado de cada arquivo (`*.test.mjs`). O Vitest já os encontra.

---

### Task 1: Motor e fixture no formato novo

**Files:**
- Rename: `src/dados/cidades.js` → `src/dados/cidadesFixture.js`, atualizando todos os imports (testes e app)
- Modify: `src/dados/cidadesFixture.js`, `src/analise/match.js`, `src/analise/match.test.js`

**Interfaces:**
- Produces:
  - `INDICADORES_DO_PILAR` (exportado de `match.js`): `{ custo: ['aluguel'], seguranca: ['homicidios100k'], clima: ['tempMedia', 'tempMesFrio', 'tempMesQuente', 'diasChuvaAno'], trabalho: ['empregoPerCapita', 'crescimentoEmprego', 'empregoSetor'], saude: ['leitos1k', 'medicos1k'], educacao: ['idebIniciais', 'idebFinais', 'vagasSuperior10k'], lazer: ['lazer10k'], natureza: ['parques10k', 'litoranea'] }`.
  - Cada nota de `calcularMatch` ganha `estimado: boolean`.
  - Cidade: `indicadores.crescimentoEmprego` (em vez de `saldoEmprego12m`), `indicadores.parques10k` (em vez de `parquesM2Hab`), sem `custoBasico`, mais `estimados: string[]`.

- [ ] **Step 1: Escrever o teste**

Em `match.test.js`: `'marca como estimada a nota de um pilar cujo indicador está em cidade.estimados'`. Dê a Maringá `estimados: ['aluguel']` e espere `notas.custo.estimado === true` e `notas.seguranca.estimado === false`. Atualize os testes existentes para os nomes novos.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- match`. Expected: o teste novo falha com `estimado` `undefined`.

- [ ] **Step 3: Implementar**

Na fixture, renomeie os campos e converta `parquesM2Hab` em `parques10k` dividindo por 10 (só precisa manter a ordem entre as cidades). Remova `custoBasico` e adicione `estimados: []`.

No motor, `estimado` = algum indicador de `INDICADORES_DO_PILAR[pilar]` está em `cidade.estimados ?? []`.

- [ ] **Step 4: Rodar a suíte inteira, lint e build**

Run: `npm test && npm run lint && npm run build`. Expected: tudo passa.

- [ ] **Step 5: Commit** — `Motor e fixture no formato da base real`

---

### Task 2: Download com cache

**Files:**
- Create: `scripts/base/baixar.mjs`, `scripts/base/baixar.test.mjs`
- Modify: `.gitignore` (adicionar `scripts/base/.cache/`), `package.json` (devDependencies `exceljs` e `fflate`; scripts `"base:gerar": "node scripts/base/gerar.mjs"` e `"base:validar": "node scripts/base/validar.mjs"`)

**Interfaces:**
- Produces: `baixar(url, { arquivoCache, fonte, pausaMs = 0, metodo = 'GET', corpo }) → Promise<Buffer>`.
  - Se `scripts/base/.cache/<arquivoCache>` existe, devolve o arquivo sem rede.
  - Senão, faz o `fetch` com o User-Agent das Global Constraints, grava no cache e espera `pausaMs`.
  - Resposta não-2xx: lança `Error('Falha ao baixar <fonte>: HTTP <status> (<url>)')`.

- [ ] **Step 1: Escrever os testes** (com `vi.stubGlobal('fetch', …)` e uma pasta de cache temporária)
  - `'usa o cache sem chamar a rede na segunda vez'`: dois `baixar` com o mesmo `arquivoCache`, e `fetch` chamado 1 vez.
  - `'manda o User-Agent do projeto'`
  - `'falha com o nome da fonte e a URL quando a resposta não é 2xx'`: `rejects.toThrow('Falha ao baixar FipeZap: HTTP 404 (https://x)')`.

  Para o teste controlar a pasta de cache, aceite a variável de ambiente `MORADIA_CACHE_DIR`.

- [ ] **Step 2: Rodar e ver falhar** — `npm test -- baixar`
- [ ] **Step 3: Implementar `baixar`** e instalar as dependências: `npm install -D exceljs fflate`
- [ ] **Step 4: Rodar e ver passar** — `npm test -- baixar`
- [ ] **Step 5: Commit** — `Download com cache para os scripts da base`

---

### Task 3: Aluguel (cálculos e FipeZap)

**Files:**
- Create: `scripts/base/lib/aluguel.mjs`, `scripts/base/lib/aluguel.test.mjs`, `scripts/base/lib/fipezap.mjs`, `scripts/base/lib/fipezap.test.mjs`

**Interfaces:**
- Produces:
  - `medianaAluguel2010(contagens: number[8]) → number | null`. Contagens das 8 faixas do agregado 3511, em ordem; `'-'` já convertido em 0. Retorna R$ de 2010, ou `null` se o total for 0.
  - `ajustarRegressao(pares: { x, y }[]) → { a, b, r2, n }`, com `ln y = a + b · ln x`.
  - `preverM2({ a, b }, mediana) → number`.
  - `aluguelPorTamanho(m2: number) → { 1, 2, 3, 4 }`, arredondado em R$.
  - `casarAbasFipezap(abas: string[], municipios: { ibge, nome, uf }[]) → { casadas: Map<aba, ibge>, naoEncontradas: string[] }`. Usa a tabela fixa `UF_DAS_ABAS` (uma UF por aba das 50 com Locação, as mesmas listadas na pesquisa de 2026-10-19), casando nome e UF. Aba fora da tabela ou sem município correspondente vai para `naoEncontradas`.

- [ ] **Step 1: Escrever os testes**
  - `medianaAluguel2010([68, 839, 18737, 55902, 35085, 6434, 2631, 683])` ≈ 439.95 (`toBeCloseTo(439.95, 1)`). São os dados reais de Curitiba: mediana na faixa ½–1 SM.
  - `medianaAluguel2010([0, 0, 0, 0, 0, 0, 0, 0])` → `null`.
  - `ajustarRegressao` com pontos exatos de `ln y = 1 + 0.5 ln x` (x = 100, 400, 900) → `a ≈ 1`, `b ≈ 0.5`, `r2 ≈ 1`, `n = 3`.
  - `aluguelPorTamanho(50)` → `{ 1: 2000, 2: 2750, 3: 3500, 4: 4250 }`.
  - `casarAbasFipezap(['Curitiba', 'São José', 'Cidade Fantasma'], municipios)`:
    - casa Curitiba → 4106902;
    - casa São José → o código de São José, **SC** (não de São José dos Campos ou outro homônimo);
    - põe "Cidade Fantasma" em `naoEncontradas`.
- [ ] **Step 2: Rodar e ver falhar** — `npm test -- aluguel fipezap`
- [ ] **Step 3: Implementar** — mediana por interpolação linear dentro da faixa da metade do total; limites das faixas em SM: 0, ⅛, ¼, ½, 1, 2, 3, 5, 7,5.
- [ ] **Step 4: Rodar e ver passar**
- [ ] **Step 5: Commit** — `Cálculo do aluguel: mediana de 2010, regressão e FipeZap`

---

### Task 4: Homicídios, clima e emprego (cálculos)

**Files:**
- Create: `scripts/base/lib/homicidios.mjs`, `scripts/base/lib/clima.mjs`, `scripts/base/lib/emprego.mjs`, cada um com `.test.mjs`

**Interfaces:**
- Produces:
  - `taxaHomicidios(porAno: { [ano]: number | null }, populacao) → number | null`. Descarta o ano cujo valor é mais de 3 vezes, ou menos de ⅓, da média dos outros anos. Faz a média do que sobra e multiplica por 100.000 ÷ população.
  - `resumirClima({ time: string[], temperature_2m_mean: number[], precipitation_sum: number[] }) → { tempMedia, tempMesFrio, tempMesQuente, diasChuvaAno }`.
    - `tempMesFrio` e `tempMesQuente`: o menor e o maior dos 12 meses do calendário, cada mês com a média de todos os anos.
    - `diasChuvaAno`: dias com chuva ≥ 1 mm ÷ número de anos.
    - Valores arredondados com 1 casa decimal.
  - `indicadoresEmprego({ total2022, total2024, porSecao: { [letraCNAE]: number } }, populacao) → { empregoPerCapita, crescimentoEmprego, empregoSetor }`.
    - `crescimentoEmprego`: em %, com 1 casa decimal.
    - `empregoSetor`: participação de cada setor no total de 2024, usando o mapa de setores das Global Constraints.

- [ ] **Step 1: Escrever os testes**
  - `taxaHomicidios({ 2020: 336, 2021: 320, 2022: 361 }, 1773718)` ≈ 19.11.
  - `taxaHomicidios({ 2020: 2, 2021: 320, 2022: 361 }, 1773718)` ≈ 19.20: o 2 é descartado, e a média de 320 e 361 é 340,5.
  - `taxaHomicidios({ 2020: null, 2021: null, 2022: null }, 1000)` → `null`.
  - `resumirClima` com 2 anos sintéticos: janeiro a 25 °C, julho a 10 °C, demais meses a 20 °C, e 30 dias de chuva ≥ 1 mm por ano. Espera `tempMesQuente` 25, `tempMesFrio` 10 e `diasChuvaAno` 30.
  - `indicadoresEmprego({ total2022: 100, total2024: 110, porSecao: { J: 11, I: 10, L: 5, M: 5, N: 5, S: 5, C: 20 } }, 1000)` → `empregoPerCapita` 0.11, `crescimentoEmprego` 10, `empregoSetor.tecnologia` 0.1, `empregoSetor.servicos` ≈ 0.2727, `empregoSetor.industria` ≈ 0.1818, `empregoSetor.agronegocio` 0.
- [ ] **Step 2: Rodar e ver falhar**
- [ ] **Step 3: Implementar**
- [ ] **Step 4: Rodar e ver passar**
- [ ] **Step 5: Commit** — `Cálculos de homicídios, clima e emprego para a base`

---

### Task 5: Faixas, montagem e validação

**Files:**
- Create: `scripts/base/lib/montagem.mjs`, `scripts/base/lib/validacao.mjs`, com testes

**Interfaces:**
- Produces:
  - `aplicarFaixas(indicadores) → { indicadores, foraDaFaixa: string[] }`. Usa as faixas das Global Constraints e anula valores negativos ou `NaN`.
  - `montarCidade({ ibge, nome, uf, regiao, lat, lon, populacao, litoranea }, parciais: object[], estimados: string[]) → cidade`. Junta os indicadores parciais. Todo campo do formato da spec que estiver ausente vira `null`, e `medicos1k` é sempre `null`.
  - `montarBase(cidades, fontes, agora: Date) → { versaoDados: 'AAAA-MM', geradoEm, fontes, cidades }`. As cidades vão em ordem de `ibge`.
  - `validarBase(base, { ibgesFipezap: Set<number>, minimo = 290, maximo = 340 }) → string[]` (lista de erros). Regras da seção "Validação" da spec:
    - número de cidades fora do intervalo;
    - mais de 10% de `null` num indicador;
    - checagens de coerência de Curitiba, Porto Alegre, Fortaleza, Salvador, Florianópolis, Rio de Janeiro, Brasília e Belo Horizonte, buscadas por nome e UF;
    - cidades do FipeZap marcadas como estimadas (ou outras sem a marca).

- [ ] **Step 1: Escrever os testes**
  - `aplicarFaixas({ tempMedia: 45, homicidios100k: 12, leitos1k: -1 })` → `tempMedia` e `leitos1k` `null`, `foraDaFaixa` = `['tempMedia', 'leitos1k']`.
  - `montarCidade` sem nenhum parcial de clima → `indicadores.tempMedia === null`, e a cidade é montada mesmo assim (Review Focus 2).
  - `validarBase` com uma base de 8 cidades coerentes (`minimo: 1`) → `[]`.
  - A mesma base com Curitiba mais quente que Fortaleza → um erro citando Curitiba.
  - A mesma base com `estimados: ['aluguel']` numa cidade do FipeZap → um erro citando essa cidade.
- [ ] **Step 2: Rodar e ver falhar**
- [ ] **Step 3: Implementar**
- [ ] **Step 4: Rodar e ver passar**
- [ ] **Step 5: Commit** — `Montagem e validação da base de cidades`

---

### Task 6: Coletores das fontes e geração da base

**Files:**
- Create:
  - `scripts/base/fontes/ibge.mjs`: universo, identidade, população, Censo 2010 e CEMPRE;
  - `scripts/base/fontes/fipezap.mjs`, `ipeadata.mjs`, `openmeteo.mjs`, `overpass.mjs`, `leitos.mjs`, `inep.mjs`, `litoral.mjs`;
  - `scripts/base/gerar.mjs`, `scripts/base/validar.mjs`.
- Create (gerado): `src/dados/cidades.json`

**Interfaces:**
- Consumes: `baixar` (Tarefa 2) e todas as funções de `scripts/base/lib/` (Tarefas 3–5).
- Produces:
  - Cada coletor exporta `coletar<Fonte>(municipios) → Promise<{ porIbge: Map<number, object>, fonte: { [indicador]: { nome, periodo, url, comoEstimado? } }, avisos: string[] }>`.
  - `ibge.mjs` também exporta `listarUniverso() → Promise<municipio[]>`.

Endereços e formatos verificados na pesquisa de 2026-10-19 (detalhes na spec):
- **SIDRA:** 4709/93 (população), 3511/1549/classificação 511 (aluguel de 2010), 9510 (CEMPRE, por seção CNAE).
- **Ipeadata:** `ValoresSerie(SERCODIGO='AVIOL12_HOMIC')`, nível "Municípios", anos 2020–2022.
- **FipeZap:** abas por cidade; coluna "Preço médio (R$/m²)" Total da seção Locação; último mês com número.
- **Leitos:** `Leitos_csv_<ano>.zip` do ano mais recente; mês mais recente do arquivo.
- **Overpass:** área `["IBGE:GEOCODIGO"="<ibge>"]` com `out count`.
- **Open-Meteo:** `daily=temperature_2m_mean,precipitation_sum`, de 2015-01-01 a 2024-12-31.

`gerar.mjs`:
- roda os coletores;
- calcula o aluguel (FipeZap onde houver, regressão nas demais, registrando a, b, r² e n no log);
- aplica faixas, monta, valida e só então grava `src/dados/cidades.json` com 2 espaços de indentação;
- se `validarBase` devolver erros ou um coletor lançar exceção, imprime os erros e sai com código 1 sem gravar (Review Focus 1).

O log final lista os avisos de cada coletor e as faixas violadas.

- [ ] **Step 1: Implementar os coletores e o `gerar.mjs`** seguindo as Interfaces. Se a lista de municípios costeiros do IBGE não estiver acessível de forma estável, use a interseção com `natural=coastline` no OpenStreetMap e registre a escolha na `fonte`.
- [ ] **Step 2: Gerar**

Run: `npm run base:gerar`. Expected:
- termina com código 0;
- o log mostra entre 290 e 340 cidades, ~50 com aluguel do FipeZap, a regressão com r² e n, e nenhuma exceção de coletor.

- [ ] **Step 3: Validar**

Run: `npm run base:validar`. Expected: `Base válida: <N> cidades`.

- [ ] **Step 4: Conferir à mão 3 cidades no `cidades.json`.** Curitiba deve ter `tempMesFrio` ≤ 15, aluguel não estimado e homicídios entre 15 e 25. Fortaleza deve ser litorânea com `tempMedia` > 25. Uma cidade média fora do FipeZap deve ter `estimados: ['aluguel']`.
- [ ] **Step 5: Commit** — `Coletores das fontes públicas e base real de cidades gerada` (com `cidades.json`)

---

### Task 7: Fonte e selo "Estimado" na tela de resultados

**Files:**
- Modify: `src/analise/explicacao.js`, `src/analise/explicacao.test.js`, `src/componentes/Resultados/index.jsx`

**Interfaces:**
- Consumes: `INDICADORES_DO_PILAR` e `nota.estimado` (Tarefa 1); `base.fontes` (formato da spec).
- Produces: `fonteDoPilar(pilar, fontes) → string`, no formato `'Fonte: <nome>, <periodo>'`. Com várias fontes, junta com `'; '` sem repetir. Indicadores sem entrada em `fontes` são ignorados.
- O componente `Resultados` recebe a nova prop `fontes`.

- [ ] **Step 1: Escrever os testes**
  - `fonteDoPilar('trabalho', fontes)`, com as três entradas apontando para o mesmo CEMPRE → `'Fonte: IBGE, Cadastro Central de Empresas, 2022–2024'` (uma vez só).
  - `fonteDoPilar('natureza', fontes)` com parques do OSM e litoral do IBGE → as duas fontes separadas por `'; '`.
- [ ] **Step 2: Rodar e ver falhar**
- [ ] **Step 3: Implementar `fonteDoPilar` e a tela**
  - Cada cartão de pilar ganha a linha de fonte (12 px, `#9CA3AF`).
  - Quando `nota.estimado`, o cartão ganha o selo "Estimado" (`#FFFBEB` / `#B45309`, 11 px, peso 700, raio 6 px), com `title` vindo de `fontes[indicador].comoEstimado`.
- [ ] **Step 4: Rodar testes, lint e build**
- [ ] **Step 5: Commit** — `Fonte de cada pilar e selo Estimado nos resultados`

---

### Task 8: Testes de coerência sobre a base real

**Files:**
- Create: `src/analise/coerencia.test.js`

**Interfaces:**
- Consumes: `calcularMatch` (motor) e `src/dados/cidades.json` (Tarefa 6).

- [ ] **Step 1: Escrever os testes**
  - `'com inverno frio como único critério, as 10 primeiras têm mês mais frio até 15 °C'`.
  - `'com segurança essencial e o resto em tanto faz, as 10 primeiras têm homicídios abaixo da mediana da base'`.
  - `'toda cidade fora do FipeZap tem o custo marcado como estimado'`: confere que `notas.custo.estimado` acompanha `estimados`.
- [ ] **Step 2: Rodar**

Run: `npm test -- coerencia`. Expected: PASS. Se falhar, o problema está nos dados: volte à Tarefa 6, sem afrouxar o teste.

- [ ] **Step 3: Commit** — `Testes de coerência do ranking sobre a base real`

---

### Task 9: App carrega a base real

**Files:**
- Create: `src/dados/base.js`
- Modify: `src/App.jsx`, `src/componentes/Onboarding/index.jsx`, `elementos.jsx` (`ContadorCidades`), `EtapaOrcamento.jsx`, `EtapaOnde.jsx`, `src/componentes/Processamento/index.jsx` (sem mudança de interface: já recebe `totalCidades`)

**Interfaces:**
- Produces:
  - `carregarBase() → Promise<{ versaoDados, fontes, cidades }>`, com `import('./cidades.json')` em cache de módulo, igual a `carregarMunicipios`.
  - `Onboarding` recebe a prop `cidades` e repassa às etapas e ao `ContadorCidades`.
  - O App guarda `base` no estado. Passa `base.cidades` ao Onboarding e ao `calcularMatch`, `base.versaoDados` ao `montarAnalise`, `base.cidades.length` ao Processamento e `base.fontes` aos Resultados.
- Nenhum arquivo do app importa mais a fixture. O `cidades.json` não entra no carregamento do login (confira no build que ele sai num arquivo separado).

- [ ] **Step 1: Implementar.** "Nova Análise" chama `carregarBase()`. Enquanto carrega, a página `onboarding` mostra "Carregando cidades…". Se falhar, mostra "Não foi possível carregar as cidades." com "Tentar de novo" (Review Focus 5).
- [ ] **Step 2: Testes, lint e build**

Run: `npm test && npm run lint && npm run build`. Expected: tudo passa, e o build lista `cidades-*.js` como arquivo separado.

- [ ] **Step 3: Verificação no navegador**
  - Uma análise completa com "Inverno frio" e "Segurança" essencial: o Processamento mostra "Comparando <N> cidades", com o N real.
  - Os resultados trazem cidades frias e seguras no topo, a linha "Fonte:" em cada pilar e o selo "Estimado" no custo das cidades fora do FipeZap.
  - Simule a falha de carregamento bloqueando `cidades-*.js` nas ferramentas de desenvolvedor: aparece o erro com "Tentar de novo".
- [ ] **Step 4: Atualizar o `CLAUDE.md`.** Trocar a menção à fixture por "base real em `src/dados/cidades.json`, gerada com `npm run base:gerar` (ver `docs/superpowers/specs/2026-10-19-base-cidades-design.md`)" e acrescentar `npm run base:gerar` e `npm run base:validar` na lista de comandos.
- [ ] **Step 5: Commit** — `App usa a base real de cidades`
