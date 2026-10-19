# Base real de cidades (peça b) — design

Data: 2026-10-19 · Complementa `docs/superpowers/specs/2026-10-05-onboarding-analise-design.md` (peça b da decomposição).

## Por quê

Hoje o ranking roda sobre 16 cidades com valores fictícios (`src/dados/cidades.js`). O dono do produto disse o que faria alguém desconfiar do resultado: **quando as características das cidades recomendadas não têm relação com o que foi marcado no onboarding**. Quem marca "inverno frio" e "segurança essencial" precisa ver no topo cidades que realmente são frias e seguras. A base de dados é o que garante isso.

## Objetivos

1. Gerar a base de **todos os municípios brasileiros com 100 mil habitantes ou mais pelo Censo 2022** (≈ 320), no formato que o motor de score já consome.
2. Usar só **fontes públicas e gratuitas, sem chave de API**.
3. **Mostrar a fonte de cada indicador** na tela de resultados e **marcar como "estimado"** todo valor que não foi medido diretamente.
4. Poder **regerar a base com um comando** quando as fontes forem atualizadas.

## Não-objetivos

- Mobilidade (continua fora do score, como na spec da análise).
- Médicos por mil habitantes. O pilar Saúde usa só leitos nesta versão; o motor já tolera `medicos1k: null`.
- Cidades com menos de 100 mil habitantes.
- Atualização automática agendada ou backend próprio.

## Anti-objetivos (seria fracasso mesmo funcionando)

- Um valor estimado aparecer na tela como se fosse medido.
- Um único dado errado de uma fonte virar o ranking. Exemplo real: a taxa pronta de homicídios do Ipeadata dá **0,05 por 100 mil para Curitiba em 2020**, contra ~16 nos anos vizinhos.
- Uma cidade sumir do ranking em silêncio por falta de um indicador. Indicador ausente vira `null`; o motor já dá nota 50 e marca "dado indisponível".

## Decisões do dono do produto

- **Aluguel:** medido onde houver FipeZap (50 cidades) e **estimado** para as demais, marcado como tal.
- **Transparência:** a tela mostra a fonte de cada indicador e marca o que é estimado.

## Decisões do assistente (revisáveis)

- **O que é "estimado":** um valor que **o MoradIA calculou por modelo ou extrapolação** a partir de outra cidade ou de outro ano. Nesta versão, só o aluguel fora do FipeZap. Valores que a própria fonte publica para a cidade não são estimados, mesmo quando a fonte usa um modelo, como a reanálise climática do Open-Meteo (ERA5). Nesses casos, o método aparece na linha de fonte ("Open-Meteo, reanálise ERA5, 2015–2024"). Se `litoranea` vier do OpenStreetMap, a fonte diz isso. `estimados` continua sendo a lista de indicadores estimados por cidade, e o texto de ajuda do selo vem de `fontes[indicador].comoEstimado`.
- **Valores absurdos:** cada indicador tem uma faixa plausível. Um valor fora dela vira `null` (o motor mostra "dado indisponível") e entra no log, e a geração segue. Nos homicídios, um ano que destoa mais de 3 vezes da média dos outros dois anos é descartado antes da média, o que pega erros "plausíveis" como o de Curitiba. Não há arquivo de correções manuais nesta versão. A validação só interrompe por problema estrutural: número de cidades, excesso de `null` ou falha nas checagens de coerência.
- **"Inverno frio":** o motor continua dando 100 a toda cidade com mês mais frio até 15 °C. Mais frio que isso não é necessariamente melhor, e cidades serranas do Sudeste entram legitimamente. O teste de coerência verifica que **todas as cidades no topo têm `tempMesFrio` ≤ 15 °C**, e não que são do Sul.
- **Linha de fonte:** vai no cartão de cada pilar da tela de resultados, que já existe. Pilares com mais de um indicador listam as fontes juntas, sem repetir ("Fonte: IBGE CEMPRE 2022–2024" no Trabalho; "Fonte: Open-Meteo, reanálise ERA5, 2015–2024" no Clima). Não há UI nova por indicador.

## Fontes e cálculos por indicador

Todas as fontes abaixo foram verificadas em 2026-10-19 (respondem sem chave e trazem dado por município).

| Indicador | Fonte | Cálculo |
|---|---|---|
| Universo e `populacao` | IBGE SIDRA, Censo 2022, população residente por município (agregado 4709, a confirmar o id da variável) | Municípios com população ≥ 100.000 |
| `nome`, `uf`, `regiao` | API de localidades do IBGE (`/api/v1/localidades/municipios?view=nivelado`) | Nome oficial, sigla da UF e região (N, NE, CO, SE, S) |
| `lat`, `lon` | `src/dados/coordenadasMunicipios.json` (já existe; gerado de `kelvins/municipios-brasileiros`, MIT) | Cruzar pelo nome "Nome, UF" |
| `litoranea` | IBGE, relação de municípios defrontantes com o mar | Verdadeiro se o município está na lista. Ver "Deixado ao construtor" |
| `aluguel` (1–4 pessoas) | FipeZap (`https://downloads.fipe.org.br/indices/fipezap/fipezap-serieshistoricas.xlsx`), seção Locação, coluna "Preço médio (R$/m²) Total", último mês com valor; e IBGE SIDRA Censo 2010, agregado 3511 (variável 1549, classificação 511) | Ver "Estimativa do aluguel" |
| `homicidios100k` | Ipeadata, série `AVIOL12_HOMIC` (número de homicídios, fonte DataSUS), nível Municípios | Média dos homicídios de 2020–2022 ÷ população × 100.000. **Não** usar a série de taxa pronta (`AVIOL12_THOMIC`), que tem erros |
| `tempMedia`, `tempMesFrio`, `tempMesQuente`, `diasChuvaAno` | Open-Meteo Historical Weather API (`archive-api.open-meteo.com`), diário de 2015-01-01 a 2024-12-31, nas coordenadas da cidade | Média anual; média do mês civil mais frio e do mais quente (média dos 10 anos); dias com chuva ≥ 1 mm por ano |
| `empregoPerCapita`, `crescimentoEmprego`, `empregoSetor` | IBGE SIDRA, Cadastro Central de Empresas, agregado 9510 (2022–2024, nível N6, por seção CNAE) | Pessoal ocupado assalariado 2024 ÷ população; crescimento % de 2022 a 2024; participação de cada seção no total |
| `leitos1k` | Ministério da Saúde, Leitos (CNES), arquivo do ano mais recente em `s3.sa-east-1.amazonaws.com/ckan.saude.gov.br/Leitos_SUS/` | Leitos existentes (SUS e não SUS) do mês mais recente ÷ população × 1.000 |
| `idebIniciais`, `idebFinais` | INEP, Ideb 2023 por município (`download.inep.gov.br/ideb/resultados/`) | Ideb da rede pública municipal + estadual (a linha "Pública" do arquivo) |
| `vagasSuperior10k` | INEP, microdados do Censo da Educação Superior 2023 | Soma das vagas totais oferecidas pelos cursos do município ÷ população × 10.000 |
| `lazer10k` | OpenStreetMap via Overpass (`overpass-api.de`), área pela tag `IBGE:GEOCODIGO` | Contagem de `amenity` restaurant, bar, cafe, pub, theatre, cinema, arts_centre ÷ população × 10.000 |
| `parques10k` | OpenStreetMap via Overpass | Contagem de `leisure=park` ÷ população × 10.000 |

**Mapa de setores para seções CNAE:** tecnologia → J; finanças → K; saúde → Q; educação → P; indústria → C; comércio → G; serviços → I, L, M, N e S somadas; agronegócio → A.

### Estimativa do aluguel

1. Para cada município, calcular a **mediana do aluguel de 2010** (Censo 2010, agregado 3511) por interpolação linear dentro das faixas de salário mínimo (SM de 2010 = R$ 510). A faixa aberta "mais de 5 SM" usa 7,5 SM como limite superior.
2. Nas cidades que têm FipeZap e Censo 2010, ajustar uma regressão `ln(R$/m² atual) = a + b · ln(mediana 2010)` por mínimos quadrados. Registrar `a`, `b`, o R² e o número de cidades no log da geração.
3. Para cidades sem FipeZap, `R$/m²` = valor previsto pela regressão, e o aluguel é marcado como estimado.
4. Converter `R$/m²` em aluguel mensal por tamanho de domicílio: 1 pessoa → 40 m²; 2 → 55 m²; 3 → 70 m²; 4 → 85 m². *(Decisão do assistente.)*

## Formato gerado

Arquivo `src/dados/cidades.json`, carregado pelo app no lugar da fixture. Muda em relação à spec da análise:

```js
{
  versaoDados: '2026-10',                 // ano-mês da geração
  geradoEm: '2026-10-19T12:00:00Z',
  fontes: {
    aluguel: { nome: 'FipeZap (Locação) e estimativa MoradIA', periodo: 'set/2026', url: '...',
               comoEstimado: 'Calculado pelo MoradIA a partir do Censo 2010 e do FipeZap' },
    homicidios100k: { nome: 'Atlas da Violência / DataSUS (Ipeadata)', periodo: '2020–2022', url: '...' },
    // uma entrada por indicador
  },
  cidades: [{
    ibge, nome, uf, regiao, lat, lon, populacao, litoranea,
    indicadores: {
      aluguel: { 1, 2, 3, 4 },
      homicidios100k, tempMedia, tempMesFrio, tempMesQuente, diasChuvaAno,
      empregoPerCapita, crescimentoEmprego, empregoSetor: { tecnologia, ... },
      leitos1k, medicos1k: null,
      idebIniciais, idebFinais, vagasSuperior10k,
      lazer10k, parques10k,
    },
    estimados: ['aluguel'],               // indicadores estimados nesta cidade (vazio se nenhum)
  }],
}
```

Renomeações no motor de score (`src/analise/match.js`): `saldoEmprego12m` → `crescimentoEmprego`; `parquesM2Hab` → `parques10k`. `custoBasico` sai do formato, porque o motor não usa mais.

## Mudanças no app

- **Motor:** cada nota passa a carregar `estimado: true` quando o indicador que a gerou está em `cidade.estimados`.
- **Tela de resultados:** cada cartão de pilar ganha uma linha "Fonte: <nome>, <período>" (de `fontes`, uma por indicador usado no pilar, sem repetir) e, quando algum indicador do pilar está em `estimados`, um selo **"Estimado"** em âmbar (`#FFFBEB` / `#B45309`, como os avisos do onboarding) com o texto de ajuda de `fontes[indicador].comoEstimado`. Para o aluguel: "Calculado pelo MoradIA a partir do Censo 2010 e do FipeZap".
- **Processamento:** "Comparando N cidades" passa a mostrar o total real.
- **Testes:** a fixture atual continua existindo só para os testes, renomeada para `src/dados/cidadesFixture.js`. O app usa `cidades.json`.
- **Carregamento:** `cidades.json` não pode entrar no carregamento do login. Deve ser carregado sob demanda, como `municipios.json`.

## Geração

- Scripts Node em `scripts/base/`, um por fonte, e um script que junta tudo e grava `cidades.json`. Comando: `npm run base:gerar`.
- Downloads brutos ficam em cache em `scripts/base/.cache/` (fora do git), para regerar sem baixar tudo de novo.
- Overpass e Open-Meteo: uma requisição por cidade, com pausa entre elas e User-Agent identificando o projeto. O Overpass recusa requisições sem User-Agent (HTTP 406).
- Uma falha de uma fonte numa cidade grava `null` naquele indicador e segue. O log final lista as falhas.

## Validação

Um script `npm run base:validar` roda depois da geração e falha se:

- o número de cidades estiver fora de 290–340;
- algum valor numérico for `NaN`, negativo ou fora de faixas plausíveis (temperatura média 10–30 °C; homicídios 0–150 por 100 mil; leitos 0–20 por mil; Ideb 2–9);
- mais de 10% das cidades tiverem um mesmo indicador `null`;
- falharem estas checagens de coerência, ligadas ao "isso não faz sentido":
  - Curitiba e Porto Alegre têm `tempMesFrio` menor que Fortaleza e Salvador, e ambas têm `tempMesFrio` ≤ 15 °C;
  - Florianópolis, Rio de Janeiro e Salvador são litorâneas; Brasília e Belo Horizonte não;
  - as 50 cidades do FipeZap não estão marcadas como estimadas, e as demais estão.

Também há um teste automatizado (Vitest) do motor rodando sobre a base real, no estilo dos de `match.test.js`: com "inverno frio" como único critério, as 10 primeiras têm `tempMesFrio` ≤ 15 °C; com "segurança essencial", as 10 primeiras têm taxa de homicídios abaixo da mediana.

## Riscos conhecidos

- A estimativa do aluguel vem de dados de 2010 e pode errar em cidades que mudaram muito desde então. Mitigação: o selo "Estimado" e o R² registrado no log.
- Os homicídios mais recentes são de 2022.
- O OpenStreetMap é menos completo em cidades médias, o que pode subestimar Lazer e Natureza nelas.
- Open-Meteo é gratuito para uso não comercial. Rever se o produto for monetizado.
- Arquivos do INEP e do Ministério da Saúde são grandes (dezenas de MB) e mudam de nome entre anos. Os scripts devem falhar com mensagem clara se a URL mudar.

## Deixado ao construtor

- Confirmar o id da variável de população no agregado 4709 do SIDRA (ou outro agregado do Censo 2022 com população por município).
- Encontrar a lista oficial de municípios defrontantes com o mar no IBGE. Se ela não estiver acessível de forma estável, usar a interseção do limite do município com `natural=coastline` no OpenStreetMap, e registrar a escolha.
- Ler os formatos exatos dos arquivos do INEP, do CNES e do FipeZap (nomes de colunas e abas).
- Mapear os nomes das abas do FipeZap para "Nome, UF". As abas trazem só o nome, e há homônimos possíveis.
