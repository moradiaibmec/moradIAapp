# Onboarding e modelo de análise — design

Data: 2026-10-05 · Status: aprovado em conversa, aguardando revisão da spec escrita

## Contexto

O Figma (frame `218:2`) tem um onboarding de 8 etapas definido pelo agente do Figma, sem ligação explícita com os dados que alimentam o ranking. Problemas encontrados:

- A importância é medida 4 vezes, de formas diferentes (slider de trabalho, slider de lazer, notas 1–5 em 7 critérios, ordenação de 10 prioridades), e as respostas podem se contradizer.
- Há perguntas sem dado correspondente: "Exterior", "Chuvoso", "Limpeza urbana", "Infraestrutura", e "Objetivo" sem efeito no cálculo.
- Não existe filtro eliminatório: uma cidade fora do orçamento pode aparecer no topo.
- Faltam informações que mudam o custo (tamanho do domicílio, filhos).

## Objetivo e critério de sucesso

Ranking **assertivo e coerente**: cada pergunta tem destino claro no cálculo (filtro, nota de um pilar ou peso) e todo resultado é explicável com dados reais.

Sucesso significa:

1. Nenhuma pergunta sem efeito no ranking.
2. Um único mecanismo define os pesos.
3. Nenhuma cidade que viole um filtro aparece no ranking.
4. Cada cidade recomendada traz pontos fortes e de atenção com o dado bruto que os justifica.

## Decisões tomadas

| Decisão | Escolha |
|---|---|
| Fonte de dados | Dados públicos reais e gratuitos (pesquisa de APIs do projeto, complementada abaixo) |
| Universo de cidades | Municípios com mais de ~100 mil habitantes (≈ 320), onde os dados são estáveis |
| Público | Aberto, sem personas fixas: o fluxo se adapta a **fatos da situação**, não a rótulos |
| Mecanismo de pesos | Filtros eliminatórios + 3 níveis de importância por pilar, no máximo 3 essenciais |
| Matching | Determinístico na V1. LLM fica para o futuro (ver "Evolução futura") |
| Imigrantes / fora do Brasil | Fora do MVP: exigiria outro idioma e uma cidade atual no exterior |

## Decomposição

Três peças independentes. Esta spec é o **contrato entre elas**; cada uma terá sua própria spec e plano.

- **(a) Onboarding**: telas, estado e modelo de respostas. Começa por aqui, já que as telas existem no Figma.
- **(b) Base de cidades**: script que coleta as APIs e gera o `cidades.json`.
- **(c) Motor de score e resultados**: `calcularMatch(respostas, cidades)` e a tela de ranking.

Enquanto (b) não existir, (a) e (c) usam um `cidades.json` de fixture, com poucas cidades e valores plausíveis, marcado como tal.

## Pilares do score

Cada pilar gera uma nota de 0 a 100 por cidade.

| Pilar | Dado por cidade | Fonte | Tipo de nota |
|---|---|---|---|
| Custo de vida | Aluguel estimado por tamanho de domicílio + custo básico | IBGE SIDRA (Censo/POF); FipeZap onde houver | Pessoal (depende da renda) |
| Segurança | Homicídios por 100 mil hab., média de 3 anos | Atlas da Violência (Ipeadata) / DataSUS SIM | Percentil (invertido) |
| Clima | Temperatura média anual, do mês mais frio e do mais quente; dias chuvosos/ano | Open-Meteo (normais) | Pessoal (distância da preferência) |
| Trabalho | Empregos formais per capita, saldo de vagas em 12 meses (%), participação por setor | Novo Caged / RAIS | Percentil, ajustado pelo setor |
| Saúde | Médicos e leitos por mil hab. | DataSUS / CNES | Percentil |
| Educação | Ideb (anos iniciais e finais) e vagas no ensino superior por 10 mil hab. | INEP | Pessoal (escolhe o indicador) |
| Lazer & cultura | Restaurantes, bares, cafés, equipamentos culturais por 10 mil hab. | OpenStreetMap (Overpass) | Percentil |
| Natureza | Área de parques/praças por habitante; município litorâneo | OpenStreetMap; IBGE (municípios defrontantes com o mar) | Percentil + bônus de praia |

**Atributos usados só como filtro:** população (Censo 2022), região/UF, coordenadas (BrasilAPI/IBGE), litorâneo.

**Removidos do Figma:**

- "Exterior": fora do escopo.
- Limpeza urbana e infraestrutura: sem dado municipal confiável.
- IDHM: o dado municipal é de 2010.
- Mobilidade: dado municipal fraco. Sai do score; pode voltar como informação na página da cidade.
- "Proximidade da família": vira filtro de distância de uma cidade de referência, em vez de pilar.

## Etapas do onboarding

Seis etapas (cinco quando a 4 não se aplica), cerca de 3 minutos. Toda pergunta tem um valor neutro padrão, então "Pular esta etapa" sempre funciona.

### 1. Seu momento

| Pergunta | Opções | Destino |
|---|---|---|
| Com quem você vai morar? | Sozinho(a) · Com parceiro(a) · Com família · Com amigos | Tamanho do domicílio → nota de Custo |
| Tem filhos em idade escolar? *(só se "Com família")* | Sim · Não | Educação usa Ideb; sugere Educação = Importante |
| Qual sua situação hoje? *(múltipla)* | Remoto · Híbrido · Presencial · Procurando emprego · Estudo ou vou estudar · Aposentado(a) · Não trabalho no momento | Exibe ou não a etapa 4; pesos sugeridos |
| O que mais te motiva a mudar? *(opcional)* | Economizar · Qualidade de vida · Carreira · Estudar · Ficar perto de alguém · Recomeçar | Só pré-preenche a etapa 6 |

Tamanho do domicílio: sozinho = 1; parceiro = 2; família = 3 (4 com filhos); amigos = a parte de 1 pessoa num imóvel de 2 quartos (aluguel de 2 pessoas ÷ 2).

### 2. Orçamento

| Pergunta | Opções | Destino |
|---|---|---|
| Renda mensal do domicílio | Até R$ 2.000 · R$ 2.000–4.000 · R$ 4.000–7.000 · R$ 7.000–12.000 · R$ 12.000–20.000 · Acima de R$ 20.000 | Nota de Custo (usa o ponto médio da faixa; a última usa R$ 25.000) |
| Quanto pode gastar com moradia | Slider, padrão = 30% da renda, com a simulação de orçamento do Figma | **Filtro**: elimina cidades com aluguel estimado > teto × 1,10 |

### 3. Onde

| Pergunta | Opções | Destino |
|---|---|---|
| Regiões que você aceita *(múltipla)* | Norte · Nordeste · Centro-Oeste · Sudeste · Sul (todas marcadas por padrão) | **Filtro** |
| Quer ficar perto de alguma cidade? | Não · Sim → cidade (pré-preenchida com a cidade atual do perfil) + raio 100 / 300 / 600 km | **Filtro** por distância em linha reta |
| Porte *(múltipla)* | Metrópole (> 1 milhão) · Grande (500 mil–1 milhão) · Média (100–500 mil), todas marcadas por padrão | **Filtro** |
| Praia | Indispensável · Seria bom · Tanto faz | Indispensável = **filtro** (só litorâneas); Seria bom = bônus em Natureza |

### 4. Trabalho e estudo *(só para Presencial, Híbrido, Procurando emprego ou Estudo)*

| Pergunta | Opções | Destino |
|---|---|---|
| Setores de interesse *(até 2)* | Tecnologia · Finanças · Saúde · Educação · Indústria · Comércio · Serviços · Agronegócio · Outro | Ajuste da nota de Trabalho ("Outro" não ajusta) |
| Vai cursar ensino superior? *(só se "Estudo")* | Sim · Não | Educação usa as vagas de ensino superior |

### 5. Clima

| Pergunta | Opções | Destino |
|---|---|---|
| Temperatura preferida | Calor o ano todo · Ameno · Gosto de inverno frio · Tanto faz | Nota de Clima; "Tanto faz" sugere Clima = Tanto faz |
| Chuva frequente te incomoda? | Sim · Não | Nota de Clima |

### 6. O que importa para você

- Os 8 pilares, cada um em **Essencial · Importante · Tanto faz**, com no máximo 3 essenciais. O 4º essencial é bloqueado, com uma mensagem explicando o limite.
- Os pilares vêm pré-preenchidos pelas regras abaixo, com a justificativa visível ("marcamos Educação porque você tem filhos").
- O botão final é "Encontrar minha cidade".

**Pré-preenchimento.** As regras são aplicadas de cima para baixo, e uma regra posterior sobrescreve a anterior no mesmo pilar. Se ao final houver mais de 3 essenciais, ficam os 3 definidos pelas regras mais abaixo na tabela, e os demais caem para Importante.

| Condição | Efeito |
|---|---|
| Padrão | Educação = Tanto faz; todos os outros = Importante |
| Clima = Tanto faz | Clima = Tanto faz |
| Situação apenas entre Remoto, Aposentado(a) e Não trabalho | Trabalho = Tanto faz |
| Procurando emprego | Trabalho = Essencial |
| Filhos em idade escolar ou "Estudo" | Educação = Importante |
| Aposentado(a) | Saúde = Essencial |
| Motivação Economizar | Custo = Essencial |
| Motivação Qualidade de vida | Segurança = Essencial; Natureza = Importante |
| Motivação Carreira | Trabalho = Essencial |
| Motivação Estudar | Educação = Essencial |

**Contador de cidades:** as etapas 2 e 3 mostram em tempo real quantas cidades atendem aos filtros. Se sobrarem menos de 3, a etapa avisa antes de avançar e indica o filtro mais restritivo.

## Modelo de respostas

```js
{
  versao: 1,
  domicilio: { moradia: 'sozinho' | 'parceiro' | 'familia' | 'amigos', filhosEscolares: false },
  situacao: ['remoto', 'hibrido', 'presencial', 'procurando', 'estudo', 'aposentado', 'naoTrabalho'],
  motivacao: 'economizar' | 'qualidadeVida' | 'carreira' | 'estudar' | 'pertoDeAlguem' | 'recomecar' | null,
  orcamento: { faixaRenda: 'r4a7', tetoMoradia: 2100 },
  onde: {
    regioes: ['N', 'NE', 'CO', 'SE', 'S'],
    referencia: { cidade: 'Curitiba, PR', raioKm: 300 } | null,
    portes: ['metropole', 'grande', 'media'],
    praia: 'indispensavel' | 'bom' | 'tantoFaz',
  },
  trabalho: { setores: ['tecnologia'], ensinoSuperior: false },
  clima: { temperatura: 'calor' | 'ameno' | 'frio' | 'tantoFaz', chuvaIncomoda: false },
  pesos: { custo, seguranca, clima, trabalho, saude, educacao, lazer, natureza }, // 'essencial' | 'importante' | 'tantoFaz'
}
```

A `versao` permite recalcular análises antigas quando os dados das cidades mudarem.

## Formato do `cidades.json`

```js
{
  versaoDados: '2026-10',
  fontes: { seguranca: 'Atlas da Violência 2021–2023', ... },
  cidades: [{
    ibge: 4106902, nome: 'Curitiba', uf: 'PR', regiao: 'S',
    lat: -25.43, lon: -49.27, populacao: 1773718, litoranea: false,
    indicadores: {
      aluguel: { 1: 1800, 2: 2400, 3: 3000, 4: 3500 },  // R$/mês por tamanho de domicílio
      custoBasico: 1400,                                // R$/mês por pessoa, sem moradia
      homicidios100k: 14.2,
      tempMedia: 17.9, tempMesFrio: 13.6, tempMesQuente: 21.5, diasChuvaAno: 168,
      empregoPerCapita: 0.48, saldoEmprego12m: 2.1, empregoSetor: { tecnologia: 0.041, ... },
      medicos1k: 4.1, leitos1k: 3.2,
      idebIniciais: 6.2, idebFinais: 5.0, vagasSuperior10k: 410,
      lazer10k: 38.5, parquesM2Hab: 51,
    },
  }],
}
```

Indicador ausente = `null`. Os percentis são calculados pelo motor, não gravados no arquivo.

## Cálculo do match

1. **Filtrar:** orçamento (aluguel do tamanho do domicílio > teto × 1,10 elimina), regiões, distância da referência, porte e praia indispensável.
2. **Nota por pilar (0–100):**
   - **Percentil** entre as ~320 cidades do universo (não só as filtradas, para que a nota não mude conforme os filtros): Segurança (invertido), Saúde (média de médicos e leitos), Lazer, Natureza.
   - **Trabalho:** percentil da média entre emprego per capita e saldo. Com setor informado: 60% geral + 40% percentil da participação do setor (média entre os setores escolhidos).
   - **Custo:**
     - comprometimento = (aluguel do domicílio + custo básico × pessoas) ÷ renda;
     - ≤ 25% vale 100, ≥ 60% vale 0, linear entre os dois.
   - **Clima:**
     - Faixas e o indicador que cada uma usa: Calor = `tempMedia` ≥ 24 °C; Ameno = `tempMedia` entre 18 e 24 °C; Frio = `tempMesFrio` ≤ 15 °C.
     - Dentro da faixa vale 100, com −15 pontos por °C de distância até o limite da faixa (mínimo 0).
     - Se chuva incomoda: 70% temperatura + 30% percentil invertido de dias de chuva.
     - "Tanto faz": usa só a chuva, ou 50 se chuva também não importa.
   - **Educação:** filhos → percentil do Ideb médio; ensino superior → percentil de vagas; ambos → média; nenhum → média dos dois percentis.
   - **Natureza:** percentil de parques + 15 pontos (teto 100) se litorânea e praia = "Seria bom".
   - **Dado ausente:** nota 50 e flag `dadoIndisponivel`.
3. **Pesos:** Essencial = 3, Importante = 1, Tanto faz = 0. Se todos forem Tanto faz, todos os pesos viram 1.
4. **Match** = Σ(peso × nota) ÷ Σ(peso), arredondado.
5. **Coerência:** cada pilar essencial com nota < 30 multiplica o match por 0,85 e gera um ponto de atenção.
6. **Ordenação:** match decrescente; em caso de empate, a maior nota no pilar essencial de maior peso.

O percentual exibido é o match real, sem reescalar.

## Explicação do resultado

Gerada como **dados estruturados** (não texto livre), para a interface montar as frases. No futuro, uma LLM pode redigir a partir do mesmo objeto:

```js
{
  cidade: 'Curitiba, PR', match: 82,
  notas: { seguranca: { nota: 84, peso: 'essencial', bruto: 14.2, unidade: 'homicídios/100 mil' }, ... },
  pontosFortes: ['seguranca', 'clima'],     // com peso, nota ≥ 70, até 3, por peso × nota
  pontosAtencao: ['custo'],                 // com peso e nota < 40, mais essenciais < 30
}
```

Exemplos de frase: "Segurança: 14 homicídios por 100 mil, melhor que 84% das cidades" · "Moradia comprometeria cerca de 34% da sua renda".

## Testes

O projeto ainda não tem testes; será adicionado o **Vitest**. O motor é uma função pura, `calcularMatch(respostas, cidades)`, testada com uma fixture de cidades:

- Nenhuma cidade que viole um filtro aparece no resultado.
- Se a cidade A tem nota maior que a B num pilar, passar esse pilar para Essencial nunca faz A cair abaixo de B quando antes estava acima.
- Pré-preenchimento nunca gera mais de 3 essenciais.
- Dado ausente resulta em nota 50 com a flag.
- Sanidade: "Calor + Praia indispensável" coloca só cidades litorâneas quentes no topo; "Inverno frio" favorece o Sul.

## Riscos e pendências

- **Aluguel por município é o maior risco.** É preciso confirmar se o SIDRA tem aluguel médio por município no Censo 2022. Se não tiver, o fallback é o Censo 2010 corrigido pelo IPCA, mais o FipeZap nas cerca de 50 cidades cobertas. Isso é decidido na spec da peça (b).
- **Segurança** mede só homicídios (roubos e furtos municipais não são padronizados). A interface deve deixar isso claro.
- **Open-Meteo** é gratuito para uso não comercial; revisar se o produto for monetizado.
- **OSM** pode estar incompleto em cidades médias; a densidade por habitante ameniza, mas não resolve totalmente.

## Impacto no Figma

| Figma atual | Novo |
|---|---|
| 1 Sobre você | 1 Seu momento (+ domicílio, filhos, situação múltipla; objetivo vira motivação opcional) |
| 2 Orçamento | 2 Orçamento (mantido; renda passa a ser do domicílio e o teto vira filtro) |
| 3 Localização | 3 Onde (sem "Exterior"; + cidade de referência e raio, porte, praia) |
| 4 Trabalho | 4 Trabalho e estudo (condicional; sem o slider de importância) |
| 5 Estilo de vida | Removida: porte e praia → etapa 3; lazer e natureza → pilares |
| 6 Notas 1–5 | Removida: os pesos ficam só na etapa 6 |
| 7 Clima | 5 Clima (sem "Chuvoso"; chuva vira pergunta própria) |
| 8 Ordenar 10 prioridades | 6 O que importa (3 níveis, máximo 3 essenciais, pré-preenchido) |

## Fora do escopo

- Matching ou textos por LLM (ver abaixo).
- Mobilidade no score.
- Comparação entre cidades e simulador financeiro (telas posteriores do fluxo).
- Idiomas além do pt-BR.

## Evolução futura: LLM

O score determinístico continua sendo a fonte da verdade, porque é explicável, testável e barato. Caminhos possíveis, a discutir depois:

1. **Textos de resposta:** gerar o resumo de cada cidade a partir do objeto de explicação estruturado, sem inventar números.
2. **Pergunta aberta:** um campo livre ("conte o que procura") que a LLM converte em ajustes de filtros e pesos, que a pessoa revisa antes de aplicar.
3. **Reordenação fina:** a LLM só reordena o top 10 já calculado, com justificativa, nunca incluindo cidades filtradas.
