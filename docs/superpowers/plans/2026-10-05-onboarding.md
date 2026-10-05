# Onboarding da análise — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a peça (a) da spec: o onboarding de 6 etapas adaptativas que coleta as respostas no formato definido, sugere os pesos, aplica os filtros eliminatórios com contador de cidades em tempo real e termina numa tela de conclusão.

**Architecture:** A lógica fica em funções puras em `src/analise/`, testadas com Vitest: opções, respostas, pré-preenchimento de pesos, filtros e coordenadas. A interface fica em `src/componentes/Onboarding/`: um componente "casca" que guarda o estado e navega entre as etapas, e um componente por etapa, que só lê `respostas` e chama `alterar`. Os filtros usam uma base de cidades de fixture (`src/dados/cidades.js`), que a peça (b) vai substituir.

**Tech Stack:** React 19, Vite 8, styled-components 6, react-icons/fi, Vitest 5 (nova dependência de desenvolvimento).

**Spec:** `docs/superpowers/specs/2026-10-05-onboarding-analise-design.md`

## Global Constraints

- Identificadores, nomes de componentes e textos da interface em português (pt-BR), como no resto do projeto.
- Componentes em `src/componentes/<Nome>/index.jsx`; styled-components no mesmo arquivo; props transitórias com prefixo `$`.
- Ícones só de `react-icons/fi` (Feather).
- Cores, tipografia e raios de `docs/design-system.md`: roxo `#4F46E5` (`var(--roxo-moradia)`), roxo claro `#EEF2FF`, título `#111827`, corpo `#6B7280`, suave `#9CA3AF`, borda `#E5E7EB`, fundo `#F8FAFC`, verde `#10B981`. Fonte `var(--fonte-moradia)`.
- Nenhuma dependência nova de runtime. Única dependência nova: `vitest` (dev).
- Toda pergunta tem valor neutro padrão; "Pular esta etapa" sempre funciona.
- Máximo de 3 pilares essenciais; máximo de 2 setores de interesse.
- Filtro de orçamento: elimina cidades com aluguel estimado maior que `tetoMoradia × 1,10`. Indicador ausente (`null`) **não** elimina.
- Teto padrão de moradia = 30% do ponto médio da faixa de renda, arredondado a múltiplos de R$ 50, limitado entre R$ 500 e R$ 8.000.
- `npm run lint` e `npm run build` sem erros ao final de cada tarefa.

## Review Focus

1. **Cidade de referência sem coordenadas:** a pessoa escolhe uma cidade que não está no arquivo de coordenadas. Esperado: mensagem "Não encontramos a localização dessa cidade", filtro de distância ignorado, sem quebrar. Teste na Tarefa 3 (filtro ignorado sem `lat`) e na Tarefa 4 (`coordenadasDe` retorna `null`).
2. **Respostas de etapa que ficou oculta:** a pessoa escolhe "Presencial", marca setores e depois volta e troca para só "Remoto". Esperado: os setores são descartados e não influenciam nada. Teste na Tarefa 1 (`limparEtapasOcultas`).
3. **Pergunta condicional que sumiu:** "Com família" + filhos = Sim, depois troca para "Sozinho(a)". Esperado: `filhosEscolares` volta a `false`. Teste na Tarefa 1.
4. **Pesos ajustados à mão:** a pessoa ajusta os pesos na etapa 6, volta à etapa 5 e avança de novo. Esperado: os ajustes são preservados, não sobrescritos pela sugestão. Verificação manual na Tarefa 10.
5. **Nenhuma cidade restante:** filtros combinados zeram o resultado. Esperado: aviso visível e "Continuar" desabilitado até afrouxar um filtro. Teste na Tarefa 3 (`filtroMaisRestritivo`) e verificação manual na Tarefa 6.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/analise/opcoes.js` | Constantes: pilares, opções de cada pergunta, faixas de renda, portes, limites |
| `src/analise/respostas.js` | Respostas neutras, etapas visíveis, navegação, limpeza de etapas, teto padrão, pessoas no domicílio |
| `src/analise/prePreenchimento.js` | `sugerirPesos(respostas)` e `limitarEssenciais` |
| `src/analise/filtros.js` | `aplicarFiltros`, `filtroMaisRestritivo`, `distanciaKm`, `porteDaCidade`, `aluguelDoDomicilio` |
| `src/analise/coordenadas.js` | Carrega as coordenadas sob demanda e responde `coordenadasDe(cidade)` |
| `src/analise/formatacao.js` | `formatarReais(valor)` |
| `src/dados/cidades.js` | **Fixture** com 16 cidades (substituída pela peça b) |
| `src/dados/coordenadasMunicipios.json` | Gerado: `{ "Nome, UF": [lat, lon] }` dos 5.571 municípios |
| `scripts/gerarCoordenadas.mjs` | Gera o JSON acima a partir do IBGE + dataset aberto |
| `src/componentes/BuscaCidade/busca.js` | Busca sem acentos com ranking (extraída de `CidadesSalvas`) |
| `src/componentes/BuscaCidade/index.jsx` | Campo de busca com sugestões, reutilizável |
| `src/componentes/CidadesSalvas/index.jsx` | Passa a usar `BuscaCidade` |
| `src/componentes/Onboarding/index.jsx` | Casca: estado, navegação, topo, rodapé, tela de conclusão |
| `src/componentes/Onboarding/elementos.jsx` | Peças visuais compartilhadas: título, pergunta, grupo de opções, contador |
| `src/componentes/Onboarding/Etapa*.jsx` | Uma etapa por arquivo |
| `src/App.jsx` | Rota `onboarding` |

Testes ficam ao lado do código: `src/analise/*.test.js`, `src/componentes/BuscaCidade/busca.test.js`.

---

### Task 1: Vitest, opções e modelo de respostas

**Files:**
- Modify: `package.json` (script `test`, devDependency `vitest`)
- Modify: `CLAUDE.md` (comando de testes)
- Create: `src/analise/opcoes.js`
- Create: `src/analise/respostas.js`
- Test: `src/analise/respostas.test.js`

**Interfaces:**
- Produces:
  - `opcoes.js`: `PILARES`, `NIVEIS_IMPORTANCIA`, `MAXIMO_ESSENCIAIS`, `OPCOES_MORADIA`, `SIM_NAO`, `OPCOES_SITUACAO`, `SITUACOES_COM_TRABALHO`, `OPCOES_MOTIVACAO`, `FAIXAS_RENDA`, `TETO_MINIMO`, `TETO_MAXIMO`, `PASSO_TETO`, `TOLERANCIA_TETO`, `REGIOES`, `PORTES`, `RAIOS_KM`, `RAIO_PADRAO_KM`, `OPCOES_PRAIA`, `SETORES`, `MAXIMO_SETORES`, `OPCOES_TEMPERATURA`. Cada opção é `{ id: string, rotulo: string, detalhe?: string }`.
  - `respostas.js`: `VERSAO_QUESTIONARIO`, `ETAPAS`, `criarRespostasIniciais(): Respostas`, `etapasVisiveis(r): string[]`, `proximaEtapa(etapas, atual): string | null`, `etapaAnterior(etapas, atual): string | null`, `limparEtapa(r, etapa): Respostas`, `limparEtapasOcultas(r): Respostas`, `pontoMedioRenda(faixaId): number | null`, `tetoPadrao(faixaId): number | null`, `pessoasNoDomicilio(domicilio): number`.

- [ ] **Step 1: Instalar o Vitest e criar o script de testes**

Run: `npm install -D vitest@^5`

Em `package.json`, dentro de `"scripts"`, adicionar depois de `"preview"`:

```json
    "preview": "vite preview",
    "test": "vitest run"
```

Em `CLAUDE.md`, trocar a linha `There is no test framework configured.` por:

```markdown
- `npm test` — Vitest (testes de lógica pura em `src/**/*.test.js`)
```

- [ ] **Step 2: Criar `src/analise/opcoes.js`**

```js
// Opções do questionário de análise. Os ids são gravados nas respostas;
// os rótulos só aparecem na interface.

export const PILARES = [
    { id: 'custo', rotulo: 'Custo de vida', descricao: 'Quanto da sua renda a cidade compromete com moradia e custos básicos.' },
    { id: 'seguranca', rotulo: 'Segurança', descricao: 'Taxa de homicídios por 100 mil habitantes.' },
    { id: 'clima', rotulo: 'Clima', descricao: 'O quanto o clima da cidade combina com o que você prefere.' },
    { id: 'trabalho', rotulo: 'Trabalho', descricao: 'Emprego formal e oportunidades no seu setor.' },
    { id: 'saude', rotulo: 'Saúde', descricao: 'Médicos e leitos por habitante.' },
    { id: 'educacao', rotulo: 'Educação', descricao: 'Qualidade das escolas e oferta de ensino superior.' },
    { id: 'lazer', rotulo: 'Lazer & cultura', descricao: 'Restaurantes, bares e equipamentos culturais por habitante.' },
    { id: 'natureza', rotulo: 'Natureza', descricao: 'Parques, áreas verdes e praia.' },
];

export const NIVEIS_IMPORTANCIA = [
    { id: 'essencial', rotulo: 'Essencial' },
    { id: 'importante', rotulo: 'Importante' },
    { id: 'tantoFaz', rotulo: 'Tanto faz' },
];

export const MAXIMO_ESSENCIAIS = 3;

export const OPCOES_MORADIA = [
    { id: 'sozinho', rotulo: 'Sozinho(a)' },
    { id: 'parceiro', rotulo: 'Com parceiro(a)' },
    { id: 'familia', rotulo: 'Com família' },
    { id: 'amigos', rotulo: 'Com amigos' },
];

export const SIM_NAO = [
    { id: 'sim', rotulo: 'Sim' },
    { id: 'nao', rotulo: 'Não' },
];

export const OPCOES_SITUACAO = [
    { id: 'remoto', rotulo: 'Remoto' },
    { id: 'hibrido', rotulo: 'Híbrido' },
    { id: 'presencial', rotulo: 'Presencial' },
    { id: 'procurando', rotulo: 'Procurando emprego' },
    { id: 'estudo', rotulo: 'Estudo ou vou estudar' },
    { id: 'aposentado', rotulo: 'Aposentado(a)' },
    { id: 'naoTrabalho', rotulo: 'Não trabalho no momento' },
];

// Situações em que o mercado de trabalho ou o estudo local importam: exibem a etapa 4.
export const SITUACOES_COM_TRABALHO = ['presencial', 'hibrido', 'procurando', 'estudo'];

export const OPCOES_MOTIVACAO = [
    { id: 'economizar', rotulo: 'Economizar' },
    { id: 'qualidadeVida', rotulo: 'Qualidade de vida' },
    { id: 'carreira', rotulo: 'Carreira' },
    { id: 'estudar', rotulo: 'Estudar' },
    { id: 'pertoDeAlguem', rotulo: 'Ficar perto de alguém' },
    { id: 'recomecar', rotulo: 'Recomeçar' },
];

export const FAIXAS_RENDA = [
    { id: 'r0a2', rotulo: 'Até R$ 2.000', pontoMedio: 1500 },
    { id: 'r2a4', rotulo: 'R$ 2.000 - R$ 4.000', pontoMedio: 3000 },
    { id: 'r4a7', rotulo: 'R$ 4.000 - R$ 7.000', pontoMedio: 5500 },
    { id: 'r7a12', rotulo: 'R$ 7.000 - R$ 12.000', pontoMedio: 9500 },
    { id: 'r12a20', rotulo: 'R$ 12.000 - R$ 20.000', pontoMedio: 16000 },
    { id: 'r20', rotulo: 'Acima de R$ 20.000', pontoMedio: 25000 },
];

export const TETO_MINIMO = 500;
export const TETO_MAXIMO = 8000;
export const PASSO_TETO = 50;
export const TOLERANCIA_TETO = 1.1;

export const REGIOES = [
    { id: 'N', rotulo: 'Norte' },
    { id: 'NE', rotulo: 'Nordeste' },
    { id: 'CO', rotulo: 'Centro-Oeste' },
    { id: 'SE', rotulo: 'Sudeste' },
    { id: 'S', rotulo: 'Sul' },
];

// Em ordem decrescente de população mínima (o ranking só tem cidades com mais de ~100 mil habitantes).
export const PORTES = [
    { id: 'metropole', rotulo: 'Metrópole', detalhe: 'Mais de 1 milhão', minimo: 1_000_000 },
    { id: 'grande', rotulo: 'Grande', detalhe: '500 mil a 1 milhão', minimo: 500_000 },
    { id: 'media', rotulo: 'Média', detalhe: '100 a 500 mil', minimo: 0 },
];

export const RAIOS_KM = [100, 300, 600];
export const RAIO_PADRAO_KM = 300;

export const OPCOES_PRAIA = [
    { id: 'indispensavel', rotulo: 'Indispensável' },
    { id: 'bom', rotulo: 'Seria bom' },
    { id: 'tantoFaz', rotulo: 'Tanto faz' },
];

export const SETORES = [
    { id: 'tecnologia', rotulo: 'Tecnologia' },
    { id: 'financas', rotulo: 'Finanças' },
    { id: 'saude', rotulo: 'Saúde' },
    { id: 'educacao', rotulo: 'Educação' },
    { id: 'industria', rotulo: 'Indústria' },
    { id: 'comercio', rotulo: 'Comércio' },
    { id: 'servicos', rotulo: 'Serviços' },
    { id: 'agronegocio', rotulo: 'Agronegócio' },
    { id: 'outro', rotulo: 'Outro' },
];

export const MAXIMO_SETORES = 2;

export const OPCOES_TEMPERATURA = [
    { id: 'calor', rotulo: 'Calor o ano todo' },
    { id: 'ameno', rotulo: 'Ameno' },
    { id: 'frio', rotulo: 'Gosto de inverno frio' },
    { id: 'tantoFaz', rotulo: 'Tanto faz' },
];
```

- [ ] **Step 3: Escrever os testes de `respostas.js`**

Criar `src/analise/respostas.test.js`:

```js
import { describe, expect, it } from 'vitest';
import {
    criarRespostasIniciais, etapaAnterior, etapasVisiveis, limparEtapa, limparEtapasOcultas,
    pessoasNoDomicilio, proximaEtapa, tetoPadrao,
} from './respostas.js';

function respostasCom(mudancas) {
    return { ...criarRespostasIniciais(), ...mudancas };
}

describe('criarRespostasIniciais', () => {
    it('começa neutra, com todas as regiões e portes aceitos', () => {
        const r = criarRespostasIniciais();
        expect(r.versao).toBe(1);
        expect(r.onde.regioes).toEqual(['N', 'NE', 'CO', 'SE', 'S']);
        expect(r.onde.portes).toEqual(['metropole', 'grande', 'media']);
        expect(r.orcamento).toEqual({ faixaRenda: null, tetoMoradia: null });
        expect(r.pesos).toBeNull();
    });

    it('devolve objetos novos a cada chamada', () => {
        const a = criarRespostasIniciais();
        a.onde.regioes.push('X');
        expect(criarRespostasIniciais().onde.regioes).not.toContain('X');
    });
});

describe('etapasVisiveis', () => {
    it('esconde a etapa de trabalho sem situação que dependa dela', () => {
        expect(etapasVisiveis(criarRespostasIniciais())).toEqual(['momento', 'orcamento', 'onde', 'clima', 'prioridades']);
        expect(etapasVisiveis(respostasCom({ situacao: ['remoto', 'aposentado'] }))).not.toContain('trabalho');
    });

    it('mostra a etapa de trabalho na 4ª posição quando alguma situação depende dela', () => {
        expect(etapasVisiveis(respostasCom({ situacao: ['remoto', 'estudo'] }))[3]).toBe('trabalho');
        expect(etapasVisiveis(respostasCom({ situacao: ['procurando'] }))).toContain('trabalho');
    });
});

describe('navegação', () => {
    const etapas = ['momento', 'orcamento', 'clima'];

    it('avança e volta pela lista', () => {
        expect(proximaEtapa(etapas, 'momento')).toBe('orcamento');
        expect(etapaAnterior(etapas, 'clima')).toBe('orcamento');
    });

    it('retorna null nas pontas', () => {
        expect(proximaEtapa(etapas, 'clima')).toBeNull();
        expect(etapaAnterior(etapas, 'momento')).toBeNull();
    });
});

describe('limparEtapa', () => {
    it('volta só as respostas daquela etapa ao neutro', () => {
        const r = respostasCom({
            onde: { regioes: ['S'], referencia: null, portes: ['media'], praia: 'indispensavel' },
            clima: { temperatura: 'frio', chuvaIncomoda: true },
        });
        const limpa = limparEtapa(r, 'onde');
        expect(limpa.onde).toEqual(criarRespostasIniciais().onde);
        expect(limpa.clima).toEqual({ temperatura: 'frio', chuvaIncomoda: true });
    });

    it('limpa domicílio, situação e motivação na etapa momento', () => {
        const r = respostasCom({
            domicilio: { moradia: 'familia', filhosEscolares: true },
            situacao: ['remoto'],
            motivacao: 'economizar',
        });
        const limpa = limparEtapa(r, 'momento');
        expect(limpa.domicilio).toEqual({ moradia: null, filhosEscolares: false });
        expect(limpa.situacao).toEqual([]);
        expect(limpa.motivacao).toBeNull();
    });
});

describe('limparEtapasOcultas', () => {
    it('descarta respostas de trabalho quando a etapa deixou de aparecer', () => {
        const r = respostasCom({ situacao: ['remoto'], trabalho: { setores: ['tecnologia'], ensinoSuperior: false } });
        expect(limparEtapasOcultas(r).trabalho).toEqual({ setores: [], ensinoSuperior: false });
    });

    it('descarta "ensino superior" quando a pessoa deixou de marcar estudo', () => {
        const r = respostasCom({ situacao: ['presencial'], trabalho: { setores: ['saude'], ensinoSuperior: true } });
        expect(limparEtapasOcultas(r).trabalho).toEqual({ setores: ['saude'], ensinoSuperior: false });
    });

    it('descarta "filhos em idade escolar" quando a moradia deixou de ser com família', () => {
        const r = respostasCom({ domicilio: { moradia: 'sozinho', filhosEscolares: true } });
        expect(limparEtapasOcultas(r).domicilio).toEqual({ moradia: 'sozinho', filhosEscolares: false });
    });

    it('mantém respostas que continuam visíveis', () => {
        const r = respostasCom({
            situacao: ['estudo'],
            domicilio: { moradia: 'familia', filhosEscolares: true },
            trabalho: { setores: ['educacao'], ensinoSuperior: true },
        });
        expect(limparEtapasOcultas(r)).toEqual(r);
    });
});

describe('tetoPadrao', () => {
    it('usa 30% do ponto médio da faixa, em múltiplos de R$ 50', () => {
        expect(tetoPadrao('r7a12')).toBe(2850);
        expect(tetoPadrao('r4a7')).toBe(1650);
    });

    it('respeita os limites do slider', () => {
        expect(tetoPadrao('r0a2')).toBe(500);
        expect(tetoPadrao('r20')).toBe(7500);
    });

    it('retorna null sem faixa', () => {
        expect(tetoPadrao(null)).toBeNull();
    });
});

describe('pessoasNoDomicilio', () => {
    it('conta as pessoas conforme a moradia', () => {
        expect(pessoasNoDomicilio({ moradia: 'sozinho', filhosEscolares: false })).toBe(1);
        expect(pessoasNoDomicilio({ moradia: 'parceiro', filhosEscolares: false })).toBe(2);
        expect(pessoasNoDomicilio({ moradia: 'familia', filhosEscolares: false })).toBe(3);
        expect(pessoasNoDomicilio({ moradia: 'familia', filhosEscolares: true })).toBe(4);
    });

    it('conta 1 pessoa para quem divide com amigos ou não respondeu', () => {
        expect(pessoasNoDomicilio({ moradia: 'amigos', filhosEscolares: false })).toBe(1);
        expect(pessoasNoDomicilio({ moradia: null, filhosEscolares: false })).toBe(1);
    });
});
```

- [ ] **Step 4: Rodar os testes e ver falharem**

Run: `npm test`
Expected: FAIL, com erro de importação de `./respostas.js` (arquivo não existe).

- [ ] **Step 5: Implementar `src/analise/respostas.js`**

```js
import {
    FAIXAS_RENDA, PASSO_TETO, PORTES, REGIOES, SITUACOES_COM_TRABALHO, TETO_MAXIMO, TETO_MINIMO,
} from './opcoes.js';

export const VERSAO_QUESTIONARIO = 1;

export const ETAPAS = ['momento', 'orcamento', 'onde', 'trabalho', 'clima', 'prioridades'];

// Partes das respostas que cada etapa preenche (usado para "Pular esta etapa").
const SECOES_DA_ETAPA = {
    momento: ['domicilio', 'situacao', 'motivacao'],
    orcamento: ['orcamento'],
    onde: ['onde'],
    trabalho: ['trabalho'],
    clima: ['clima'],
    prioridades: ['pesos'],
};

export function criarRespostasIniciais() {
    return {
        versao: VERSAO_QUESTIONARIO,
        domicilio: { moradia: null, filhosEscolares: false },
        situacao: [],
        motivacao: null,
        orcamento: { faixaRenda: null, tetoMoradia: null },
        onde: {
            regioes: REGIOES.map(({ id }) => id),
            referencia: null,
            portes: PORTES.map(({ id }) => id),
            praia: 'tantoFaz',
        },
        trabalho: { setores: [], ensinoSuperior: false },
        clima: { temperatura: 'tantoFaz', chuvaIncomoda: false },
        pesos: null,
    };
}

export function etapasVisiveis(respostas) {
    const comTrabalho = respostas.situacao.some((situacao) => SITUACOES_COM_TRABALHO.includes(situacao));
    return ETAPAS.filter((etapa) => etapa !== 'trabalho' || comTrabalho);
}

export function proximaEtapa(etapas, atual) {
    return etapas[etapas.indexOf(atual) + 1] ?? null;
}

export function etapaAnterior(etapas, atual) {
    const indice = etapas.indexOf(atual);
    return indice > 0 ? etapas[indice - 1] : null;
}

export function limparEtapa(respostas, etapa) {
    const neutras = criarRespostasIniciais();
    const limpas = { ...respostas };
    for (const secao of SECOES_DA_ETAPA[etapa]) limpas[secao] = neutras[secao];
    return limpas;
}

// Respostas de perguntas que deixaram de aparecer não podem influenciar o resultado.
export function limparEtapasOcultas(respostas) {
    let limpas = respostas;

    if (!etapasVisiveis(limpas).includes('trabalho')) {
        limpas = limparEtapa(limpas, 'trabalho');
    } else if (!limpas.situacao.includes('estudo') && limpas.trabalho.ensinoSuperior) {
        limpas = { ...limpas, trabalho: { ...limpas.trabalho, ensinoSuperior: false } };
    }

    if (limpas.domicilio.moradia !== 'familia' && limpas.domicilio.filhosEscolares) {
        limpas = { ...limpas, domicilio: { ...limpas.domicilio, filhosEscolares: false } };
    }

    return limpas;
}

export function pontoMedioRenda(faixaId) {
    return FAIXAS_RENDA.find(({ id }) => id === faixaId)?.pontoMedio ?? null;
}

export function tetoPadrao(faixaId) {
    const renda = pontoMedioRenda(faixaId);
    if (renda === null) return null;
    const teto = Math.round((renda * 0.3) / PASSO_TETO) * PASSO_TETO;
    return Math.min(Math.max(teto, TETO_MINIMO), TETO_MAXIMO);
}

// Quem divide com amigos conta como 1 pessoa: paga a sua parte de um imóvel compartilhado.
export function pessoasNoDomicilio({ moradia, filhosEscolares }) {
    if (moradia === 'parceiro') return 2;
    if (moradia === 'familia') return filhosEscolares ? 4 : 3;
    return 1;
}
```

- [ ] **Step 6: Rodar os testes e ver passarem**

Run: `npm test`
Expected: PASS em todos os testes de `respostas.test.js`.

- [ ] **Step 7: Lint e commit**

Run: `npm run lint`
Expected: sem erros.

```bash
git add package.json package-lock.json CLAUDE.md src/analise/opcoes.js src/analise/respostas.js src/analise/respostas.test.js
git commit -m "Vitest, opções do questionário e modelo de respostas do onboarding"
```

---

### Task 2: Pré-preenchimento dos pesos

**Files:**
- Create: `src/analise/prePreenchimento.js`
- Test: `src/analise/prePreenchimento.test.js`

**Interfaces:**
- Consumes: `PILARES`, `MAXIMO_ESSENCIAIS`, `OPCOES_SITUACAO`, `OPCOES_MOTIVACAO` de `opcoes.js`; `criarRespostasIniciais()` de `respostas.js` (só nos testes).
- Produces: `pesosPadrao(): Pesos`; `limitarEssenciais(pesos, ordem: string[]): Pesos`; `sugerirPesos(respostas): { pesos: Pesos, motivos: { [pilar]: string } }`. `Pesos` = `{ custo, seguranca, clima, trabalho, saude, educacao, lazer, natureza }`, cada um `'essencial' | 'importante' | 'tantoFaz'`.

- [ ] **Step 1: Escrever os testes**

Criar `src/analise/prePreenchimento.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { OPCOES_MOTIVACAO, OPCOES_SITUACAO } from './opcoes.js';
import { criarRespostasIniciais } from './respostas.js';
import { limitarEssenciais, pesosPadrao, sugerirPesos } from './prePreenchimento.js';

function respostasCom(mudancas) {
    return { ...criarRespostasIniciais(), ...mudancas };
}

function comTemperatura(temperatura, mudancas = {}) {
    return respostasCom({ ...mudancas, clima: { temperatura, chuvaIncomoda: false } });
}

describe('pesosPadrao', () => {
    it('deixa Educação em Tanto faz e o resto em Importante', () => {
        expect(pesosPadrao()).toEqual({
            custo: 'importante', seguranca: 'importante', clima: 'importante', trabalho: 'importante',
            saude: 'importante', educacao: 'tantoFaz', lazer: 'importante', natureza: 'importante',
        });
    });
});

describe('sugerirPesos', () => {
    it('com respostas neutras, só tira o peso do clima (temperatura "tanto faz")', () => {
        const { pesos, motivos } = sugerirPesos(criarRespostasIniciais());
        expect(pesos).toEqual({ ...pesosPadrao(), clima: 'tantoFaz' });
        expect(motivos.clima).toBe('Você disse que tanto faz a temperatura');
    });

    it('marca Trabalho como essencial para quem procura emprego', () => {
        const { pesos, motivos } = sugerirPesos(comTemperatura('ameno', { situacao: ['procurando'] }));
        expect(pesos.trabalho).toBe('essencial');
        expect(motivos.trabalho).toBe('Você está procurando emprego');
    });

    it('tira o peso de Trabalho só quando nenhuma situação depende do mercado local', () => {
        expect(sugerirPesos(comTemperatura('ameno', { situacao: ['remoto', 'aposentado'] })).pesos.trabalho).toBe('tantoFaz');
        expect(sugerirPesos(comTemperatura('ameno', { situacao: ['remoto', 'presencial'] })).pesos.trabalho).toBe('importante');
        expect(sugerirPesos(comTemperatura('ameno', { situacao: [] })).pesos.trabalho).toBe('importante');
    });

    it('sobe Educação para Importante com filhos em idade escolar, explicando o motivo', () => {
        const r = comTemperatura('ameno', { domicilio: { moradia: 'familia', filhosEscolares: true } });
        const { pesos, motivos } = sugerirPesos(r);
        expect(pesos.educacao).toBe('importante');
        expect(motivos.educacao).toBe('Você tem filhos em idade escolar');
    });

    it('combina aposentadoria e motivação "economizar"', () => {
        const { pesos } = sugerirPesos(comTemperatura('calor', { situacao: ['aposentado'], motivacao: 'economizar' }));
        expect(pesos.saude).toBe('essencial');
        expect(pesos.custo).toBe('essencial');
        expect(pesos.trabalho).toBe('tantoFaz');
    });

    it('nunca sugere mais de 3 essenciais, em nenhuma combinação de respostas', () => {
        const situacoes = OPCOES_SITUACAO.map(({ id }) => id);
        const motivacoes = [null, ...OPCOES_MOTIVACAO.map(({ id }) => id)];
        for (let mascara = 0; mascara < 2 ** situacoes.length; mascara += 1) {
            const situacao = situacoes.filter((_, i) => mascara & (1 << i));
            for (const motivacao of motivacoes) {
                for (const filhosEscolares of [false, true]) {
                    const r = comTemperatura('ameno', { situacao, motivacao, domicilio: { moradia: 'familia', filhosEscolares } });
                    const essenciais = Object.values(sugerirPesos(r).pesos).filter((nivel) => nivel === 'essencial');
                    expect(essenciais.length).toBeLessThanOrEqual(3);
                }
            }
        }
    });
});

describe('limitarEssenciais', () => {
    const quatroEssenciais = { ...pesosPadrao(), custo: 'essencial', seguranca: 'essencial', saude: 'essencial', trabalho: 'essencial' };

    it('mantém os 3 primeiros da ordem e rebaixa o resto para Importante', () => {
        const pesos = limitarEssenciais(quatroEssenciais, ['trabalho', 'saude', 'custo', 'seguranca']);
        expect(pesos.seguranca).toBe('importante');
        expect([pesos.trabalho, pesos.saude, pesos.custo]).toEqual(['essencial', 'essencial', 'essencial']);
    });

    it('rebaixa primeiro os essenciais que não estão na ordem', () => {
        const pesos = limitarEssenciais(quatroEssenciais, ['custo', 'seguranca', 'saude']);
        expect(pesos.trabalho).toBe('importante');
    });

    it('não mexe em quem já está dentro do limite', () => {
        const pesos = { ...pesosPadrao(), custo: 'essencial' };
        expect(limitarEssenciais(pesos, [])).toEqual(pesos);
    });
});
```

- [ ] **Step 2: Rodar os testes e ver falharem**

Run: `npm test -- prePreenchimento`
Expected: FAIL, com erro de importação de `./prePreenchimento.js`.

- [ ] **Step 3: Implementar `src/analise/prePreenchimento.js`**

```js
import { MAXIMO_ESSENCIAIS, PILARES } from './opcoes.js';

const SEM_TRABALHO_LOCAL = ['remoto', 'aposentado', 'naoTrabalho'];

// Aplicadas de cima para baixo: uma regra posterior sobrescreve a anterior no mesmo pilar.
const REGRAS = [
    {
        aplica: (r) => r.clima.temperatura === 'tantoFaz',
        efeitos: { clima: 'tantoFaz' },
        motivo: 'Você disse que tanto faz a temperatura',
    },
    {
        aplica: (r) => r.situacao.length > 0 && r.situacao.every((s) => SEM_TRABALHO_LOCAL.includes(s)),
        efeitos: { trabalho: 'tantoFaz' },
        motivo: 'Sua situação não depende do mercado de trabalho local',
    },
    {
        aplica: (r) => r.situacao.includes('procurando'),
        efeitos: { trabalho: 'essencial' },
        motivo: 'Você está procurando emprego',
    },
    {
        aplica: (r) => r.domicilio.filhosEscolares || r.situacao.includes('estudo'),
        efeitos: { educacao: 'importante' },
        motivo: (r) => (r.domicilio.filhosEscolares ? 'Você tem filhos em idade escolar' : 'Você estuda ou vai estudar'),
    },
    {
        aplica: (r) => r.situacao.includes('aposentado'),
        efeitos: { saude: 'essencial' },
        motivo: 'Você é aposentado(a)',
    },
    {
        aplica: (r) => r.motivacao === 'economizar',
        efeitos: { custo: 'essencial' },
        motivo: 'Sua motivação é economizar',
    },
    {
        aplica: (r) => r.motivacao === 'qualidadeVida',
        efeitos: { seguranca: 'essencial', natureza: 'importante' },
        motivo: 'Sua motivação é qualidade de vida',
    },
    {
        aplica: (r) => r.motivacao === 'carreira',
        efeitos: { trabalho: 'essencial' },
        motivo: 'Sua motivação é a carreira',
    },
    {
        aplica: (r) => r.motivacao === 'estudar',
        efeitos: { educacao: 'essencial' },
        motivo: 'Sua motivação é estudar',
    },
];

export function pesosPadrao() {
    return Object.fromEntries(PILARES.map(({ id }) => [id, id === 'educacao' ? 'tantoFaz' : 'importante']));
}

// `ordem` lista os pilares do mais para o menos prioritário. Essenciais fora da ordem são rebaixados primeiro.
export function limitarEssenciais(pesos, ordem) {
    const essenciais = Object.keys(pesos).filter((pilar) => pesos[pilar] === 'essencial');
    const priorizados = [
        ...ordem.filter((pilar) => essenciais.includes(pilar)),
        ...essenciais.filter((pilar) => !ordem.includes(pilar)),
    ];
    const manter = new Set(priorizados.slice(0, MAXIMO_ESSENCIAIS));
    return Object.fromEntries(Object.entries(pesos).map(([pilar, nivel]) => (
        [pilar, nivel === 'essencial' && !manter.has(pilar) ? 'importante' : nivel]
    )));
}

export function sugerirPesos(respostas) {
    const pesos = pesosPadrao();
    const motivos = {};
    const definidoPelaRegra = {};

    REGRAS.forEach((regra, indice) => {
        if (!regra.aplica(respostas)) return;
        const motivo = typeof regra.motivo === 'function' ? regra.motivo(respostas) : regra.motivo;
        for (const [pilar, nivel] of Object.entries(regra.efeitos)) {
            pesos[pilar] = nivel;
            motivos[pilar] = motivo;
            definidoPelaRegra[pilar] = indice;
        }
    });

    // Regras mais abaixo na lista têm prioridade para continuar essenciais.
    const ordem = Object.keys(definidoPelaRegra).sort((a, b) => definidoPelaRegra[b] - definidoPelaRegra[a]);
    return { pesos: limitarEssenciais(pesos, ordem), motivos };
}
```

- [ ] **Step 4: Rodar os testes e ver passarem**

Run: `npm test`
Expected: PASS em `respostas.test.js` e `prePreenchimento.test.js`.

- [ ] **Step 5: Lint e commit**

Run: `npm run lint`
Expected: sem erros.

```bash
git add src/analise/prePreenchimento.js src/analise/prePreenchimento.test.js
git commit -m "Pré-preenchimento dos pesos a partir das respostas"
```

---

### Task 3: Base de cidades (fixture) e filtros eliminatórios

**Files:**
- Create: `src/dados/cidades.js`
- Create: `src/analise/filtros.js`
- Test: `src/analise/filtros.test.js`
- Modify: `docs/superpowers/specs/2026-10-05-onboarding-analise-design.md` (formato de `referencia`)

**Interfaces:**
- Consumes: `PORTES`, `TOLERANCIA_TETO` de `opcoes.js`; `pessoasNoDomicilio` de `respostas.js`.
- Produces:
  - `src/dados/cidades.js`: `cidades: Cidade[]`, onde `Cidade = { ibge, nome, uf, regiao, lat, lon, populacao, litoranea, indicadores: { aluguel: { 1, 2, 3, 4 } } }`.
  - `filtros.js`: `porteDaCidade(populacao): 'metropole' | 'grande' | 'media'`; `distanciaKm(a: {lat, lon}, b: {lat, lon}): number`; `aluguelDoDomicilio(cidade, domicilio): number | null`; `aplicarFiltros(respostas, cidades, ignorar?: string): Cidade[]`; `filtroMaisRestritivo(respostas, cidades): { id, rotulo, cidadesSem } | null`.
  - `respostas.onde.referencia` passa a ser `{ cidade: string | null, lat: number | null, lon: number | null, raioKm: number } | null`. O filtro de distância só se aplica quando `lat` não é `null`.

- [ ] **Step 1: Criar a fixture `src/dados/cidades.js`**

```js
// FIXTURE: valores plausíveis, não oficiais, só para desenvolver o onboarding e o motor de score.
// Será substituída pela base gerada na peça (b) da spec, com o mesmo formato.
// aluguel: R$/mês estimado por número de pessoas no domicílio (1 a 4).

export const versaoDados = 'fixture';

export const cidades = [
    { ibge: 3550308, nome: 'São Paulo', uf: 'SP', regiao: 'SE', lat: -23.55, lon: -46.63, populacao: 11451999, litoranea: false, indicadores: { aluguel: { 1: 2600, 2: 3400, 3: 4300, 4: 5200 } } },
    { ibge: 3304557, nome: 'Rio de Janeiro', uf: 'RJ', regiao: 'SE', lat: -22.91, lon: -43.17, populacao: 6211223, litoranea: true, indicadores: { aluguel: { 1: 2300, 2: 3100, 3: 3900, 4: 4700 } } },
    { ibge: 3106200, nome: 'Belo Horizonte', uf: 'MG', regiao: 'SE', lat: -19.92, lon: -43.94, populacao: 2315560, litoranea: false, indicadores: { aluguel: { 1: 1700, 2: 2300, 3: 2900, 4: 3500 } } },
    { ibge: 2927408, nome: 'Salvador', uf: 'BA', regiao: 'NE', lat: -12.97, lon: -38.50, populacao: 2417678, litoranea: true, indicadores: { aluguel: { 1: 1500, 2: 2000, 3: 2600, 4: 3100 } } },
    { ibge: 2304400, nome: 'Fortaleza', uf: 'CE', regiao: 'NE', lat: -3.73, lon: -38.52, populacao: 2428708, litoranea: true, indicadores: { aluguel: { 1: 1400, 2: 1900, 3: 2400, 4: 2900 } } },
    { ibge: 1302603, nome: 'Manaus', uf: 'AM', regiao: 'N', lat: -3.12, lon: -60.02, populacao: 2063689, litoranea: false, indicadores: { aluguel: { 1: 1400, 2: 1800, 3: 2300, 4: 2800 } } },
    { ibge: 4106902, nome: 'Curitiba', uf: 'PR', regiao: 'S', lat: -25.43, lon: -49.27, populacao: 1773718, litoranea: false, indicadores: { aluguel: { 1: 1800, 2: 2400, 3: 3000, 4: 3500 } } },
    { ibge: 2611606, nome: 'Recife', uf: 'PE', regiao: 'NE', lat: -8.05, lon: -34.88, populacao: 1488920, litoranea: true, indicadores: { aluguel: { 1: 1500, 2: 2000, 3: 2500, 4: 3000 } } },
    { ibge: 5208707, nome: 'Goiânia', uf: 'GO', regiao: 'CO', lat: -16.69, lon: -49.26, populacao: 1437366, litoranea: false, indicadores: { aluguel: { 1: 1500, 2: 2000, 3: 2500, 4: 3000 } } },
    { ibge: 4314902, nome: 'Porto Alegre', uf: 'RS', regiao: 'S', lat: -30.03, lon: -51.23, populacao: 1332845, litoranea: false, indicadores: { aluguel: { 1: 1600, 2: 2100, 3: 2700, 4: 3200 } } },
    { ibge: 2408102, nome: 'Natal', uf: 'RN', regiao: 'NE', lat: -5.79, lon: -35.21, populacao: 751300, litoranea: true, indicadores: { aluguel: { 1: 1300, 2: 1700, 3: 2200, 4: 2600 } } },
    { ibge: 3170206, nome: 'Uberlândia', uf: 'MG', regiao: 'SE', lat: -18.92, lon: -48.28, populacao: 713224, litoranea: false, indicadores: { aluguel: { 1: 1300, 2: 1700, 3: 2200, 4: 2600 } } },
    { ibge: 4209102, nome: 'Joinville', uf: 'SC', regiao: 'S', lat: -26.30, lon: -48.85, populacao: 616317, litoranea: false, indicadores: { aluguel: { 1: 1400, 2: 1900, 3: 2400, 4: 2800 } } },
    { ibge: 4205407, nome: 'Florianópolis', uf: 'SC', regiao: 'S', lat: -27.59, lon: -48.55, populacao: 537211, litoranea: true, indicadores: { aluguel: { 1: 2200, 2: 2900, 3: 3600, 4: 4300 } } },
    { ibge: 2504009, nome: 'Campina Grande', uf: 'PB', regiao: 'NE', lat: -7.23, lon: -35.88, populacao: 419379, litoranea: false, indicadores: { aluguel: { 1: 1000, 2: 1300, 3: 1700, 4: 2000 } } },
    { ibge: 4115200, nome: 'Maringá', uf: 'PR', regiao: 'S', lat: -23.42, lon: -51.94, populacao: 409657, litoranea: false, indicadores: { aluguel: { 1: 1300, 2: 1700, 3: 2200, 4: 2600 } } },
];
```

- [ ] **Step 2: Escrever os testes**

Criar `src/analise/filtros.test.js`. Usa um conjunto pequeno e fixo de cidades para que as expectativas não dependam da fixture:

```js
import { describe, expect, it } from 'vitest';
import { criarRespostasIniciais } from './respostas.js';
import { aluguelDoDomicilio, aplicarFiltros, distanciaKm, filtroMaisRestritivo, porteDaCidade } from './filtros.js';
import { cidades as fixture } from '../dados/cidades.js';

const curitiba = { nome: 'Curitiba', regiao: 'S', lat: -25.43, lon: -49.27, populacao: 1773718, litoranea: false, indicadores: { aluguel: { 1: 1800, 2: 2400, 3: 3000, 4: 3500 } } };
const salvador = { nome: 'Salvador', regiao: 'NE', lat: -12.97, lon: -38.50, populacao: 2417678, litoranea: true, indicadores: { aluguel: { 1: 1500, 2: 2000, 3: 2600, 4: 3100 } } };
const joinville = { nome: 'Joinville', regiao: 'S', lat: -26.30, lon: -48.85, populacao: 616317, litoranea: false, indicadores: { aluguel: { 1: 1400, 2: 1900, 3: 2400, 4: 2800 } } };
const santos = { nome: 'Santos', regiao: 'SE', lat: -23.96, lon: -46.33, populacao: 418608, litoranea: true, indicadores: { aluguel: { 1: 2200, 2: 2900, 3: 3600, 4: 4200 } } };
const cidades = [curitiba, salvador, joinville, santos];

const nomes = (lista) => lista.map(({ nome }) => nome);

function respostasCom({ orcamento, onde, domicilio } = {}) {
    const base = criarRespostasIniciais();
    return {
        ...base,
        domicilio: { ...base.domicilio, ...domicilio },
        orcamento: { ...base.orcamento, ...orcamento },
        onde: { ...base.onde, ...onde },
    };
}

describe('porteDaCidade', () => {
    it('classifica pelos limites de população', () => {
        expect(porteDaCidade(1_000_000)).toBe('metropole');
        expect(porteDaCidade(999_999)).toBe('grande');
        expect(porteDaCidade(500_000)).toBe('grande');
        expect(porteDaCidade(499_999)).toBe('media');
    });
});

describe('distanciaKm', () => {
    it('calcula a distância em linha reta', () => {
        const km = distanciaKm(curitiba, joinville);
        expect(km).toBeGreaterThan(100);
        expect(km).toBeLessThan(112);
        expect(distanciaKm(curitiba, curitiba)).toBe(0);
    });
});

describe('aluguelDoDomicilio', () => {
    it('usa o aluguel do número de pessoas', () => {
        expect(aluguelDoDomicilio(curitiba, { moradia: 'parceiro', filhosEscolares: false })).toBe(2400);
        expect(aluguelDoDomicilio(curitiba, { moradia: 'familia', filhosEscolares: true })).toBe(3500);
    });

    it('usa metade do aluguel de 2 pessoas para quem divide com amigos', () => {
        expect(aluguelDoDomicilio(curitiba, { moradia: 'amigos', filhosEscolares: false })).toBe(1200);
    });

    it('retorna null quando o dado não existe', () => {
        const semDado = { ...curitiba, indicadores: { aluguel: { 1: null, 2: null, 3: null, 4: null } } };
        expect(aluguelDoDomicilio(semDado, { moradia: 'sozinho', filhosEscolares: false })).toBeNull();
    });
});

describe('aplicarFiltros', () => {
    it('com respostas neutras, mantém todas as cidades', () => {
        expect(aplicarFiltros(criarRespostasIniciais(), cidades)).toHaveLength(4);
    });

    it('elimina cidades com aluguel acima do teto com 10% de tolerância', () => {
        const r = respostasCom({ orcamento: { faixaRenda: 'r4a7', tetoMoradia: 1600 } });
        expect(nomes(aplicarFiltros(r, cidades))).toEqual(['Salvador', 'Joinville']);
    });

    it('aplica o teto ao aluguel compartilhado de quem mora com amigos', () => {
        const r = respostasCom({ domicilio: { moradia: 'amigos' }, orcamento: { faixaRenda: 'r2a4', tetoMoradia: 1000 } });
        expect(nomes(aplicarFiltros(r, cidades))).toEqual(['Salvador', 'Joinville']);
    });

    it('não elimina cidade com aluguel indisponível', () => {
        const semDado = { ...santos, nome: 'Sem dado', indicadores: { aluguel: { 1: null, 2: null, 3: null, 4: null } } };
        const r = respostasCom({ orcamento: { faixaRenda: 'r0a2', tetoMoradia: 500 } });
        expect(nomes(aplicarFiltros(r, [...cidades, semDado]))).toEqual(['Sem dado']);
    });

    it('filtra por região, porte e praia', () => {
        expect(nomes(aplicarFiltros(respostasCom({ onde: { regioes: ['S'] } }), cidades))).toEqual(['Curitiba', 'Joinville']);
        expect(nomes(aplicarFiltros(respostasCom({ onde: { portes: ['media'] } }), cidades))).toEqual(['Santos']);
        expect(nomes(aplicarFiltros(respostasCom({ onde: { praia: 'indispensavel' } }), cidades))).toEqual(['Salvador', 'Santos']);
    });

    it('não filtra por praia quando ela só "seria bom"', () => {
        expect(aplicarFiltros(respostasCom({ onde: { praia: 'bom' } }), cidades)).toHaveLength(4);
    });

    it('filtra pela distância da cidade de referência', () => {
        // Joinville fica a ~106 km e Santos a ~340 km de Curitiba.
        const referencia = { cidade: 'Curitiba, PR', lat: -25.43, lon: -49.27, raioKm: 300 };
        expect(nomes(aplicarFiltros(respostasCom({ onde: { referencia } }), cidades))).toEqual(['Curitiba', 'Joinville']);
        const pertinho = { ...referencia, raioKm: 100 };
        expect(nomes(aplicarFiltros(respostasCom({ onde: { referencia: pertinho } }), cidades))).toEqual(['Curitiba']);
    });

    it('ignora a referência enquanto ela não tem coordenadas', () => {
        const referencia = { cidade: null, lat: null, lon: null, raioKm: 100 };
        expect(aplicarFiltros(respostasCom({ onde: { referencia } }), cidades)).toHaveLength(4);
    });

    it('funciona com a fixture completa', () => {
        const r = respostasCom({ onde: { regioes: ['NE'], praia: 'indispensavel' } });
        expect(nomes(aplicarFiltros(r, fixture))).toEqual(['Salvador', 'Fortaleza', 'Recife', 'Natal']);
    });
});

describe('filtroMaisRestritivo', () => {
    it('indica o filtro que, removido, devolve mais cidades', () => {
        const r = respostasCom({ onde: { regioes: ['S', 'NE'], praia: 'indispensavel' } });
        expect(filtroMaisRestritivo(r, cidades)).toEqual({ id: 'praia', rotulo: 'Praia indispensável', cidadesSem: 3 });
    });

    it('aponta um filtro mesmo quando o resultado zerou', () => {
        const r = respostasCom({ onde: { regioes: ['S'], praia: 'indispensavel' } });
        expect(aplicarFiltros(r, cidades)).toHaveLength(0);
        expect(filtroMaisRestritivo(r, cidades)?.cidadesSem).toBe(2);
    });

    it('retorna null sem filtros ativos', () => {
        expect(filtroMaisRestritivo(criarRespostasIniciais(), cidades)).toBeNull();
    });
});
```

- [ ] **Step 3: Rodar os testes e ver falharem**

Run: `npm test -- filtros`
Expected: FAIL, com erro de importação de `./filtros.js`.

- [ ] **Step 4: Implementar `src/analise/filtros.js`**

```js
import { PORTES, TOLERANCIA_TETO } from './opcoes.js';
import { pessoasNoDomicilio } from './respostas.js';

const RAIO_TERRA_KM = 6371;

export function porteDaCidade(populacao) {
    return PORTES.find(({ minimo }) => populacao >= minimo).id;
}

export function distanciaKm(a, b) {
    const rad = (graus) => (graus * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLon = rad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(h));
}

// Quem divide com amigos paga metade do aluguel de um imóvel para 2 pessoas.
export function aluguelDoDomicilio(cidade, domicilio) {
    const { aluguel } = cidade.indicadores;
    if (domicilio.moradia === 'amigos') return aluguel[2] === null ? null : aluguel[2] / 2;
    return aluguel[pessoasNoDomicilio(domicilio)] ?? null;
}

// Cada filtro só vale quando a pessoa o configurou. Dado ausente nunca elimina uma cidade.
const FILTROS = [
    {
        id: 'orcamento',
        rotulo: 'Orçamento para moradia',
        ativo: (r) => r.orcamento.tetoMoradia !== null,
        passa: (cidade, r) => {
            const aluguel = aluguelDoDomicilio(cidade, r.domicilio);
            return aluguel === null || aluguel <= r.orcamento.tetoMoradia * TOLERANCIA_TETO;
        },
    },
    {
        id: 'regioes',
        rotulo: 'Regiões',
        ativo: (r) => r.onde.regioes.length > 0,
        passa: (cidade, r) => r.onde.regioes.includes(cidade.regiao),
    },
    {
        id: 'referencia',
        rotulo: 'Distância da cidade de referência',
        ativo: (r) => r.onde.referencia !== null && r.onde.referencia.lat !== null,
        passa: (cidade, r) => distanciaKm(cidade, r.onde.referencia) <= r.onde.referencia.raioKm,
    },
    {
        id: 'portes',
        rotulo: 'Porte da cidade',
        ativo: (r) => r.onde.portes.length > 0,
        passa: (cidade, r) => r.onde.portes.includes(porteDaCidade(cidade.populacao)),
    },
    {
        id: 'praia',
        rotulo: 'Praia indispensável',
        ativo: (r) => r.onde.praia === 'indispensavel',
        passa: (cidade) => cidade.litoranea,
    },
];

export function aplicarFiltros(respostas, cidades, ignorar = null) {
    const ativos = FILTROS.filter(({ id, ativo }) => id !== ignorar && ativo(respostas));
    return cidades.filter((cidade) => ativos.every(({ passa }) => passa(cidade, respostas)));
}

// O filtro que, se removido, devolveria mais cidades. Usado para orientar quando sobram poucas.
export function filtroMaisRestritivo(respostas, cidades) {
    const atuais = aplicarFiltros(respostas, cidades).length;
    let maisRestritivo = null;
    for (const { id, rotulo, ativo } of FILTROS) {
        if (!ativo(respostas)) continue;
        const cidadesSem = aplicarFiltros(respostas, cidades, id).length;
        if (cidadesSem > atuais && (!maisRestritivo || cidadesSem > maisRestritivo.cidadesSem)) {
            maisRestritivo = { id, rotulo, cidadesSem };
        }
    }
    return maisRestritivo;
}
```

- [ ] **Step 5: Rodar os testes e ver passarem**

Run: `npm test`
Expected: PASS nos três arquivos de teste.

- [ ] **Step 6: Atualizar a spec com o formato de `referencia`**

Em `docs/superpowers/specs/2026-10-05-onboarding-analise-design.md`, no bloco "Modelo de respostas", trocar:

```js
    referencia: { cidade: 'Curitiba, PR', raioKm: 300 } | null,
```

por:

```js
    referencia: { cidade: 'Curitiba, PR', lat: -25.43, lon: -49.27, raioKm: 300 } | null, // lat/lon null até a cidade ser escolhida
```

- [ ] **Step 7: Lint e commit**

Run: `npm run lint`
Expected: sem erros.

```bash
git add src/dados/cidades.js src/analise/filtros.js src/analise/filtros.test.js docs/superpowers/specs/2026-10-05-onboarding-analise-design.md
git commit -m "Filtros eliminatórios do onboarding e base de cidades de fixture"
```

---

### Task 4: Coordenadas dos municípios

**Files:**
- Create: `scripts/gerarCoordenadas.mjs`
- Create (gerado): `src/dados/coordenadasMunicipios.json`
- Create: `src/analise/coordenadas.js`
- Test: `src/analise/coordenadas.test.js`
- Modify: `eslint.config.js` (globais de Node para `scripts/`)

**Interfaces:**
- Produces: `carregarCoordenadas(): Promise<{ [cidade: string]: [lat, lon] }>`; `coordenadasDe(cidade: string): Promise<{ lat, lon } | null>`. A chave `cidade` tem o mesmo formato de `src/dados/municipios.json`: `"Nome, UF"`.

- [ ] **Step 1: Permitir globais de Node nos scripts**

Em `eslint.config.js`, adicionar um segundo bloco dentro do array, depois do bloco existente:

```js
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
```

- [ ] **Step 2: Criar `scripts/gerarCoordenadas.mjs`**

Cruza o IBGE (nomes oficiais, os mesmos de `municipios.json`) com o dataset aberto `kelvins/municipios-brasileiros` (licença MIT, coordenadas por código IBGE). Cruzar pelo código evita as 31 diferenças de grafia que um cruzamento por nome teria.

```js
// Gera src/dados/coordenadasMunicipios.json: { "Nome, UF": [lat, lon] }.
// Uso: node scripts/gerarCoordenadas.mjs
import { readFile, writeFile } from 'node:fs/promises';

const URL_IBGE = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado';
const URL_COORDENADAS = 'https://raw.githubusercontent.com/kelvins/municipios-brasileiros/main/csv/municipios.csv';
const DESTINO = new URL('../src/dados/coordenadasMunicipios.json', import.meta.url);
const LISTA_DE_NOMES = new URL('../src/dados/municipios.json', import.meta.url);

async function baixar(url) {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Falha ao baixar ${url}: ${resposta.status}`);
    return resposta;
}

const municipiosIbge = await (await baixar(URL_IBGE)).json();
const csv = await (await baixar(URL_COORDENADAS)).text();

// Colunas: codigo_ibge,nome,latitude,longitude,...
const coordenadasPorCodigo = new Map(
    csv.trim().split('\n').slice(1).map((linha) => {
        const [codigo, , latitude, longitude] = linha.split(',');
        return [Number(codigo), [Number(latitude), Number(longitude)]];
    }),
);

const coordenadas = {};
const semCoordenada = [];
for (const municipio of municipiosIbge) {
    const nome = `${municipio['municipio-nome']}, ${municipio['UF-sigla']}`;
    const ponto = coordenadasPorCodigo.get(municipio['municipio-id']);
    if (ponto) coordenadas[nome] = ponto.map((valor) => Math.round(valor * 10000) / 10000);
    else semCoordenada.push(nome);
}

const nomesDaBusca = JSON.parse(await readFile(LISTA_DE_NOMES, 'utf8'));
const foraDaBusca = nomesDaBusca.filter((nome) => !coordenadas[nome]);

await writeFile(DESTINO, JSON.stringify(coordenadas));
console.log(`${Object.keys(coordenadas).length} municípios com coordenadas.`);
if (semCoordenada.length) console.warn('Sem coordenada no dataset:', semCoordenada);
if (foraDaBusca.length) console.warn('Nomes de municipios.json sem coordenada:', foraDaBusca);
```

- [ ] **Step 3: Gerar o arquivo**

Run: `node scripts/gerarCoordenadas.mjs`
Expected: `5571 municípios com coordenadas.` e nenhum aviso. O arquivo `src/dados/coordenadasMunicipios.json` deve ter cerca de 150 KB.

- [ ] **Step 4: Escrever os testes**

Criar `src/analise/coordenadas.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { coordenadasDe } from './coordenadas.js';
import municipios from '../dados/municipios.json';
import coordenadas from '../dados/coordenadasMunicipios.json';

describe('coordenadasDe', () => {
    it('encontra as coordenadas de uma cidade da busca', async () => {
        const curitiba = await coordenadasDe('Curitiba, PR');
        expect(curitiba.lat).toBeCloseTo(-25.42, 1);
        expect(curitiba.lon).toBeCloseTo(-49.27, 1);
    });

    it('retorna null para cidade desconhecida', async () => {
        expect(await coordenadasDe('Cidade Inventada, XX')).toBeNull();
    });

    it('cobre todos os nomes usados na busca de cidades', () => {
        expect(municipios.filter((nome) => !coordenadas[nome])).toEqual([]);
    });
});
```

- [ ] **Step 5: Rodar os testes e ver falharem**

Run: `npm test -- coordenadas`
Expected: FAIL, com erro de importação de `./coordenadas.js`.

- [ ] **Step 6: Implementar `src/analise/coordenadas.js`**

```js
// As coordenadas (~150 KB) só são baixadas quando a pessoa escolhe uma cidade de referência.
let promessaCoordenadas;

export function carregarCoordenadas() {
    promessaCoordenadas ??= import('../dados/coordenadasMunicipios.json').then((modulo) => modulo.default);
    return promessaCoordenadas;
}

export async function coordenadasDe(cidade) {
    const ponto = (await carregarCoordenadas())[cidade];
    return ponto ? { lat: ponto[0], lon: ponto[1] } : null;
}
```

- [ ] **Step 7: Rodar os testes, lint e build**

Run: `npm test && npm run lint && npm run build`
Expected: testes PASS; lint sem erros; o build lista um chunk separado `coordenadasMunicipios-*.js`.

- [ ] **Step 8: Commit**

```bash
git add eslint.config.js scripts/gerarCoordenadas.mjs src/dados/coordenadasMunicipios.json src/analise/coordenadas.js src/analise/coordenadas.test.js
git commit -m "Coordenadas dos municípios para o filtro de distância"
```

---

### Task 5: Extrair a busca de cidades para um componente reutilizável

A etapa "Onde" precisa da mesma busca que a seção "Cidades Salvas" do perfil. A lógica pura vai para `busca.js` (agora com testes) e a interface para `BuscaCidade`; `CidadesSalvas` passa a usá-la sem mudar de comportamento.

**Files:**
- Create: `src/componentes/BuscaCidade/busca.js`
- Test: `src/componentes/BuscaCidade/busca.test.js`
- Create: `src/componentes/BuscaCidade/index.jsx`
- Modify: `src/componentes/CidadesSalvas/index.jsx`

**Interfaces:**
- Produces:
  - `busca.js`: `normalizar(texto): string`; `buscarCidades(municipios: string[], termo: string): string[]` (até 8); `carregarMunicipios(): Promise<string[]>`.
  - `BuscaCidade` (default export), props: `onEscolher(cidade: string)`, `indisponiveis?: string[]` (aparecem com `rotuloIndisponivel` e não podem ser escolhidas), `rotuloAcao?: string` (padrão `'Escolher'`), `iconeAcao?: ReactNode`, `rotuloIndisponivel?: string` (padrão `'Escolhida'`), `placeholder?: string`, `rotuloAcessivel: string`, `desabilitada?: boolean`.

- [ ] **Step 1: Escrever os testes da busca**

Criar `src/componentes/BuscaCidade/busca.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { buscarCidades, normalizar } from './busca.js';
import municipios from '../../dados/municipios.json';

describe('normalizar', () => {
    it('ignora acentos, maiúsculas e espaços nas pontas', () => {
        expect(normalizar('  São Paulo ')).toBe('sao paulo');
    });
});

describe('buscarCidades', () => {
    it('coloca o nome exato primeiro', () => {
        expect(buscarCidades(municipios, 'sao paulo')[0]).toBe('São Paulo, SP');
        expect(buscarCidades(municipios, 'campinas')[0]).toBe('Campinas, SP');
    });

    it('prioriza capitais entre os nomes que começam com o termo', () => {
        expect(buscarCidades(municipios, 'rio').slice(0, 2)).toEqual(['Rio Branco, AC', 'Rio de Janeiro, RJ']);
    });

    it('encontra também nomes que só contêm o termo, depois dos que começam com ele', () => {
        expect(buscarCidades(municipios, 'curit')).toEqual(['Curitiba, PR', 'Curitibanos, SC', 'Bacurituba, MA', 'Urucurituba, AM']);
    });

    it('limita a 8 sugestões e devolve vazio sem termo ou sem resultado', () => {
        expect(buscarCidades(municipios, 'sao')).toHaveLength(8);
        expect(buscarCidades(municipios, '   ')).toEqual([]);
        expect(buscarCidades(municipios, 'xyzw')).toEqual([]);
    });
});
```

- [ ] **Step 2: Rodar os testes e ver falharem**

Run: `npm test -- busca`
Expected: FAIL, com erro de importação de `./busca.js`.

- [ ] **Step 3: Criar `src/componentes/BuscaCidade/busca.js`**

Mover de `src/componentes/CidadesSalvas/index.jsx` a constante `LIMITE_SUGESTOES`, a função `carregarMunicipios`, `normalizar`, o `Set` `capitais` e `buscarCidades`, exportando-os:

```js
const LIMITE_SUGESTOES = 8;

// A lista do IBGE (~100 KB) só é baixada quando a pessoa começa a buscar.
let promessaMunicipios;
export function carregarMunicipios() {
    promessaMunicipios ??= import('../../dados/municipios.json').then((modulo) => modulo.default);
    return promessaMunicipios;
}

// Ignora acentos e maiúsculas: "sao paulo" encontra "São Paulo, SP".
export function normalizar(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const capitais = new Set([
    'Aracaju, SE', 'Belém, PA', 'Belo Horizonte, MG', 'Boa Vista, RR', 'Brasília, DF', 'Campo Grande, MS',
    'Cuiabá, MT', 'Curitiba, PR', 'Florianópolis, SC', 'Fortaleza, CE', 'Goiânia, GO', 'João Pessoa, PB',
    'Macapá, AP', 'Maceió, AL', 'Manaus, AM', 'Natal, RN', 'Palmas, TO', 'Porto Alegre, RS', 'Porto Velho, RO',
    'Recife, PE', 'Rio Branco, AC', 'Rio de Janeiro, RJ', 'Salvador, BA', 'São Luís, MA', 'São Paulo, SP',
    'Teresina, PI', 'Vitória, ES',
]);

// Ordem: nome exato, depois começa com o termo, depois só contém;
// em cada grupo, capitais primeiro e então os nomes mais curtos.
export function buscarCidades(municipios, termo) {
    const busca = normalizar(termo);
    if (!busca) return [];

    const encontradas = [];
    for (const cidade of municipios) {
        const nome = normalizar(cidade.slice(0, cidade.lastIndexOf(', ')));
        const grupo = nome === busca ? 0 : nome.startsWith(busca) ? 1 : nome.includes(busca) ? 2 : -1;
        if (grupo >= 0) encontradas.push({ cidade, grupo, capital: capitais.has(cidade) ? 0 : 1 });
    }

    return encontradas
        .sort((a, b) => a.grupo - b.grupo || a.capital - b.capital || a.cidade.length - b.cidade.length)
        .slice(0, LIMITE_SUGESTOES)
        .map(({ cidade }) => cidade);
}
```

- [ ] **Step 4: Rodar os testes e ver passarem**

Run: `npm test -- busca`
Expected: PASS.

- [ ] **Step 5: Criar `src/componentes/BuscaCidade/index.jsx`**

Mover de `CidadesSalvas` os styled components `Busca`, `IconeBusca`, `EntradaBusca`, `Sugestoes`, `Sugestao` e `MensagemSugestoes` (sem alterar os estilos), e a parte do componente que cuida do campo e das sugestões:

```jsx
import { useEffect, useId, useRef, useState } from 'react';
import styled from "styled-components"
import { FiSearch } from 'react-icons/fi';
import { buscarCidades, carregarMunicipios } from './busca.js';

// (colar aqui, sem alterações, os styled components Busca, IconeBusca, EntradaBusca,
//  Sugestoes, Sugestao e MensagemSugestoes que estavam em CidadesSalvas/index.jsx)

function BuscaCidade({
    onEscolher, indisponiveis = [], rotuloAcao = 'Escolher', iconeAcao = null,
    rotuloIndisponivel = 'Escolhida', placeholder = 'Pesquise uma cidade pelo nome', rotuloAcessivel, desabilitada = false,
}) {
    const [termo, setTermo] = useState('');
    const [municipios, setMunicipios] = useState(null);
    const [erroCarregar, setErroCarregar] = useState(false);
    const [aberta, setAberta] = useState(false);
    const [destaque, setDestaque] = useState(0);
    const busca = useRef(null);
    const idSugestoes = useId();

    const sugestoes = municipios ? buscarCidades(municipios, termo) : [];
    const mostrarSugestoes = aberta && termo.trim() !== '';

    useEffect(() => {
        if (!mostrarSugestoes) return;
        function fecharSeFora(evento) {
            if (!busca.current.contains(evento.target)) setAberta(false);
        }
        document.addEventListener('mousedown', fecharSeFora);
        return () => document.removeEventListener('mousedown', fecharSeFora);
    }, [mostrarSugestoes]);

    function prepararBusca() {
        if (municipios) return;
        carregarMunicipios()
            .then(setMunicipios)
            .catch(() => setErroCarregar(true));
    }

    function escolher(cidade) {
        if (!cidade || desabilitada || indisponiveis.includes(cidade)) return;
        onEscolher(cidade);
        setTermo('');
        setAberta(false);
    }

    function handleTeclado(evento) {
        if (!mostrarSugestoes || sugestoes.length === 0) return;
        const acoes = {
            ArrowDown: () => setDestaque((atual) => Math.min(atual + 1, sugestoes.length - 1)),
            ArrowUp: () => setDestaque((atual) => Math.max(atual - 1, 0)),
            Enter: () => escolher(sugestoes[destaque]),
            Escape: () => setAberta(false),
        };
        if (acoes[evento.key]) {
            evento.preventDefault();
            acoes[evento.key]();
        }
    }

    return (
        <Busca ref={busca}>
            <IconeBusca aria-hidden="true" />
            <EntradaBusca
                type="search"
                role="combobox"
                aria-label={rotuloAcessivel}
                aria-autocomplete="list"
                aria-expanded={mostrarSugestoes}
                aria-controls={idSugestoes}
                aria-activedescendant={mostrarSugestoes && sugestoes.length > 0 ? `${idSugestoes}-${destaque}` : undefined}
                $aberta={mostrarSugestoes}
                value={termo}
                placeholder={placeholder}
                autoComplete="off"
                onFocus={() => { prepararBusca(); setAberta(true); }}
                onChange={(e) => { setTermo(e.target.value); setDestaque(0); setAberta(true); }}
                onKeyDown={handleTeclado}
            />

            {mostrarSugestoes && (
                <Sugestoes id={idSugestoes} role="listbox">
                    {erroCarregar && <MensagemSugestoes>Não foi possível carregar as cidades.</MensagemSugestoes>}
                    {!erroCarregar && !municipios && <MensagemSugestoes>Carregando cidades…</MensagemSugestoes>}
                    {municipios && sugestoes.length === 0 && (
                        <MensagemSugestoes>Nenhuma cidade encontrada para “{termo.trim()}”.</MensagemSugestoes>
                    )}
                    {sugestoes.map((cidade, indice) => {
                        const indisponivel = indisponiveis.includes(cidade);
                        return (
                            <Sugestao
                                key={cidade}
                                id={`${idSugestoes}-${indice}`}
                                role="option"
                                aria-selected={indice === destaque}
                                aria-disabled={indisponivel}
                                $destacada={indice === destaque}
                                $salva={indisponivel}
                                onMouseEnter={() => setDestaque(indice)}
                                onMouseDown={(evento) => evento.preventDefault()}
                                onClick={() => escolher(cidade)}
                            >
                                <span>{cidade}</span>
                                <span>{indisponivel ? rotuloIndisponivel : <>{iconeAcao} {rotuloAcao}</>}</span>
                            </Sugestao>
                        );
                    })}
                </Sugestoes>
            )}
        </Busca>
    );
}

export default BuscaCidade
```

O comentário entre os imports e a função marca onde colar o código movido; ele não deve ficar no arquivo final.

- [ ] **Step 6: Simplificar `src/componentes/CidadesSalvas/index.jsx`**

1. Apagar os styled components `Busca`, `IconeBusca`, `EntradaBusca`, `Sugestoes`, `Sugestao`, `MensagemSugestoes` e as declarações `LIMITE_SUGESTOES`, `promessaMunicipios`, `carregarMunicipios`, `normalizar`, `capitais`, `buscarCidades` (já movidos).
2. Trocar os imports do topo por:

```jsx
import { useState } from 'react';
import styled from "styled-components"
import { FiMapPin, FiPlus, FiX } from 'react-icons/fi';
import BuscaCidade from '../BuscaCidade/index.jsx';
```

3. Substituir a função `CidadesSalvas` inteira por:

```jsx
function CidadesSalvas({ cidades, onSalvar }) {
    const [salvas, setSalvas] = useState(cidades);
    const [salvando, setSalvando] = useState(false);
    const [erroSalvar, setErroSalvar] = useState(false);

    async function atualizar(novaLista) {
        const anterior = salvas;
        setSalvas(novaLista);
        setSalvando(true);
        setErroSalvar(false);
        const { error } = await onSalvar(novaLista);
        setSalvando(false);
        if (error) {
            setSalvas(anterior);
            setErroSalvar(true);
        }
    }

    function salvar(cidade) {
        if (salvando || salvas.includes(cidade)) return;
        atualizar([...salvas, cidade]);
    }

    function remover(cidade) {
        atualizar(salvas.filter((item) => item !== cidade));
    }

    return (
        <>
            <BuscaCidade
                onEscolher={salvar}
                indisponiveis={salvas}
                rotuloAcao="Salvar"
                iconeAcao={<FiPlus aria-hidden="true" />}
                rotuloIndisponivel="Salva"
                rotuloAcessivel="Pesquisar cidade para salvar"
                desabilitada={salvando}
            />

            {erroSalvar && <Erro role="alert">Não foi possível salvar. Tente novamente.</Erro>}

            {salvas.length > 0 ? (
                <Lista aria-label="Cidades salvas">
                    {salvas.map((cidade) => {
                        const { nome, uf } = separarCidade(cidade);
                        return (
                            <ItemCidade key={cidade}>
                                <CaixaIcone><FiMapPin /></CaixaIcone>
                                <TextosCidade>
                                    <NomeCidade title={nome}>{nome}</NomeCidade>
                                    <UfCidade>{uf}</UfCidade>
                                </TextosCidade>
                                <BotaoRemover
                                    type="button"
                                    onClick={() => remover(cidade)}
                                    disabled={salvando}
                                    title="Remover"
                                    aria-label={`Remover ${cidade}`}
                                >
                                    <FiX />
                                </BotaoRemover>
                            </ItemCidade>
                        );
                    })}
                </Lista>
            ) : (
                <Vazio>
                    <CaixaIcone><FiMapPin /></CaixaIcone>
                    Você ainda não salvou nenhuma cidade. Pesquise acima para começar.
                </Vazio>
            )}
        </>
    );
}
```

- [ ] **Step 7: Testes, lint e build**

Run: `npm test && npm run lint && npm run build`
Expected: tudo PASS e sem erros.

- [ ] **Step 8: Verificação manual**

Run: `npm run dev`, entrar e abrir "Meu perfil" → "Cidades Salvas".
Expected: buscar "curit" mostra Curitiba primeiro; "+ Salvar" adiciona; a cidade salva aparece como "Salva" nas sugestões; remover com ✕ funciona.

- [ ] **Step 9: Commit**

```bash
git add src/componentes/BuscaCidade src/componentes/CidadesSalvas/index.jsx
git commit -m "Extrai a busca de cidades para o componente BuscaCidade"
```

---

### Task 6: Casca do onboarding, peças visuais e etapa "Seu momento"

**Files:**
- Create: `src/analise/formatacao.js`
- Test: `src/analise/formatacao.test.js`
- Create: `src/componentes/Onboarding/elementos.jsx`
- Create: `src/componentes/Onboarding/EtapaMomento.jsx`
- Create: `src/componentes/Onboarding/index.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: Tarefas 1–3 (`criarRespostasIniciais`, `etapasVisiveis`, `proximaEtapa`, `etapaAnterior`, `limparEtapa`, `limparEtapasOcultas`, `sugerirPesos`, `aplicarFiltros`, `filtroMaisRestritivo`, `cidades`, constantes de `opcoes.js`).
- Produces:
  - `formatarReais(valor: number): string`, ex.: `'R$ 2.850'`.
  - `elementos.jsx`: `TituloEtapa`, `Pergunta` (fieldset com `<legend>`), `Ajuda`, `GrupoOpcoes({ legenda, ajuda?, opcoes, valor, onChange, multipla?, maximo?, minimo?, colunas? })`, `ContadorCidades({ respostas, cidades })`.
  - Contrato de toda etapa: `function EtapaX({ respostas, alterar, alterarPeso, usuario })`, onde `alterar(secao, valor)` mescla objetos (`alterar('onde', { praia: 'bom' })`) e substitui arrays e valores simples (`alterar('situacao', ['remoto'])`).
  - `Onboarding({ usuario, onSair })` (default export).

- [ ] **Step 1: Teste de `formatarReais`**

Criar `src/analise/formatacao.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { formatarReais } from './formatacao.js';

describe('formatarReais', () => {
    it('formata em reais sem centavos', () => {
        expect(formatarReais(2850)).toBe('R$ 2.850');
        expect(formatarReais(-400)).toBe('-R$ 400');
    });
});
```

Run: `npm test -- formatacao`
Expected: FAIL, com erro de importação de `./formatacao.js`.

- [ ] **Step 2: Implementar `src/analise/formatacao.js`**

```js
const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function formatarReais(valor) {
    return reais.format(valor);
}
```

Run: `npm test -- formatacao`
Expected: PASS.

- [ ] **Step 3: Criar `src/componentes/Onboarding/elementos.jsx`**

Valores do Figma (frame `5:269`): título 32/800; pergunta 16/700; cartões de opção com borda 2px, raio 12px e padding 16px; selecionado com fundo `#EEF2FF` e borda roxa.

```jsx
import styled from "styled-components"
import { FiAlertTriangle, FiMapPin } from 'react-icons/fi';
import { aplicarFiltros, filtroMaisRestritivo } from '../../analise/filtros.js';

export const TituloEtapa = styled.h1`
    margin: 0;
    font-size: 32px;
    font-weight: 800;
    line-height: 1.2;
    color: #111827;

    @media (max-width: 600px) {
        font-size: 24px;
    }
`;

export const Pergunta = styled.fieldset`
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: none;

    legend {
        margin-bottom: 16px;
        padding: 0;
        font-size: 16px;
        font-weight: 700;
        color: #111827;
    }
`;

export const Ajuda = styled.p`
    font-size: 13px;
    line-height: 1.5;
    color: #6B7280;
`;

const Grade = styled.div`
    display: grid;
    grid-template-columns: repeat(${({ $colunas }) => $colunas}, 1fr);
    gap: 16px;

    @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const CartaoOpcao = styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 16px;
    border: 2px solid ${({ $ativa }) => ($ativa ? 'var(--roxo-moradia)' : '#E5E7EB')};
    border-radius: 12px;
    background-color: ${({ $ativa }) => ($ativa ? '#EEF2FF' : '#FFFFFF')};
    color: ${({ $ativa }) => ($ativa ? 'var(--roxo-moradia)' : '#111827')};
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 700;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;

    &:hover:not(:disabled),
    &:focus-visible {
        outline: none;
        border-color: var(--roxo-moradia);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    span {
        font-size: 12px;
        font-weight: 400;
        color: #6B7280;
    }
`;

// Seleção única (radio) ou múltipla (botões alternáveis), no visual de cartões do Figma.
export function GrupoOpcoes({
    legenda, ajuda, opcoes, valor, onChange, multipla = false, maximo = Infinity, minimo = 0, colunas = 3,
}) {
    const selecionadas = multipla ? valor : [valor];

    function alternar(id) {
        if (!multipla) return onChange(id);
        const nova = valor.includes(id) ? valor.filter((item) => item !== id) : [...valor, id];
        if (nova.length >= minimo) onChange(nova);
    }

    return (
        <Pergunta>
            <legend>{legenda}</legend>
            {ajuda && <Ajuda>{ajuda}</Ajuda>}
            <Grade $colunas={colunas} role={multipla ? 'group' : 'radiogroup'}>
                {opcoes.map(({ id, rotulo, detalhe }) => {
                    const ativa = selecionadas.includes(id);
                    const bloqueada = multipla && !ativa && valor.length >= maximo;
                    return (
                        <CartaoOpcao
                            key={id}
                            type="button"
                            role={multipla ? undefined : 'radio'}
                            aria-checked={multipla ? undefined : ativa}
                            aria-pressed={multipla ? ativa : undefined}
                            $ativa={ativa}
                            disabled={bloqueada}
                            title={bloqueada ? `Escolha no máximo ${maximo}` : undefined}
                            onClick={() => alternar(id)}
                        >
                            {rotulo}
                            {detalhe && <span>{detalhe}</span>}
                        </CartaoOpcao>
                    );
                })}
            </Grade>
        </Pergunta>
    );
}

const Caixa = styled.p`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 12px;
    background-color: ${({ $alerta }) => ($alerta ? '#FFFBEB' : '#EEF2FF')};
    color: ${({ $alerta }) => ($alerta ? '#B45309' : 'var(--roxo-moradia)')};
    font-size: 14px;
    line-height: 1.5;

    svg {
        flex-shrink: 0;
        font-size: 16px;
    }
`;

export function ContadorCidades({ respostas, cidades }) {
    const restantes = aplicarFiltros(respostas, cidades).length;
    const alerta = restantes < 3;
    const restritivo = alerta ? filtroMaisRestritivo(respostas, cidades) : null;

    return (
        <Caixa $alerta={alerta} role="status">
            {alerta ? <FiAlertTriangle aria-hidden="true" /> : <FiMapPin aria-hidden="true" />}
            <span>
                <strong>{restantes} de {cidades.length}</strong> cidades atendem aos seus critérios.
                {restantes === 0 && ' Afrouxe algum filtro para continuar.'}
                {restritivo && ` O filtro mais restritivo é: ${restritivo.rotulo}.`}
            </span>
        </Caixa>
    );
}
```

- [ ] **Step 4: Criar `src/componentes/Onboarding/EtapaMomento.jsx`**

```jsx
import { OPCOES_MORADIA, OPCOES_MOTIVACAO, OPCOES_SITUACAO, SIM_NAO } from '../../analise/opcoes.js';
import { GrupoOpcoes } from './elementos.jsx';

function EtapaMomento({ respostas, alterar }) {
    const { moradia, filhosEscolares } = respostas.domicilio;

    return (
        <>
            <GrupoOpcoes
                legenda="Com quem você vai morar?"
                opcoes={OPCOES_MORADIA}
                valor={moradia}
                onChange={(valor) => alterar('domicilio', { moradia: valor })}
                colunas={4}
            />

            {moradia === 'familia' && (
                <GrupoOpcoes
                    legenda="Tem filhos em idade escolar?"
                    opcoes={SIM_NAO}
                    valor={filhosEscolares ? 'sim' : 'nao'}
                    onChange={(valor) => alterar('domicilio', { filhosEscolares: valor === 'sim' })}
                    colunas={2}
                />
            )}

            <GrupoOpcoes
                legenda="Qual é a sua situação hoje?"
                ajuda="Pode marcar mais de uma."
                opcoes={OPCOES_SITUACAO}
                valor={respostas.situacao}
                onChange={(valor) => alterar('situacao', valor)}
                multipla
                colunas={4}
            />

            <GrupoOpcoes
                legenda="O que mais te motiva a mudar? (opcional)"
                ajuda="Usamos isso só para sugerir suas prioridades no final. Você pode mudar tudo lá."
                opcoes={OPCOES_MOTIVACAO}
                valor={respostas.motivacao}
                onChange={(valor) => alterar('motivacao', valor)}
            />
        </>
    );
}

export default EtapaMomento
```

- [ ] **Step 5: Criar a casca `src/componentes/Onboarding/index.jsx`**

Topo com logo, progresso "Etapa X de N" (N muda conforme a etapa 4 aparece), selo "~3 min" e botão de sair. Cartão central de 1000px com raio 24px. Rodapé com "Pular esta etapa", "Voltar" e "Continuar".

```jsx
import { useState } from 'react';
import styled from "styled-components"
import { FiCheck, FiClock, FiCompass, FiX } from 'react-icons/fi';
import { cidades } from '../../dados/cidades.js';
import { aplicarFiltros } from '../../analise/filtros.js';
import { sugerirPesos } from '../../analise/prePreenchimento.js';
import {
    criarRespostasIniciais, etapaAnterior, etapasVisiveis, limparEtapa, limparEtapasOcultas, proximaEtapa,
} from '../../analise/respostas.js';
import { Ajuda, TituloEtapa } from './elementos.jsx';
import EtapaMomento from './EtapaMomento.jsx';

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F8FAFC;
    font-family: var(--fonte-moradia);
`;

const Topo = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 80px;
    padding: 0 80px;
    border-bottom: 1px solid #E5E7EB;
    background-color: #FFFFFF;

    @media (max-width: 900px) {
        padding: 0 16px;
    }
`;

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 700;
    color: #111827;

    span {
        color: var(--roxo-moradia);
    }
`;

const IconeLogo = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background-color: var(--roxo-moradia);
    color: #FFFFFF;
    font-size: 16px;
`;

const LadoDireito = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;

    @media (max-width: 600px) {
        gap: 12px;
    }
`;

const Progresso = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #6B7280;
`;

const TrilhaProgresso = styled.div`
    width: 160px;
    height: 6px;
    overflow: hidden;
    border-radius: 3px;
    background-color: #E5E7EB;

    div {
        width: ${({ $valor }) => $valor}%;
        height: 100%;
        background-color: var(--roxo-moradia);
        transition: width 0.3s;
    }

    @media (max-width: 600px) {
        width: 96px;
    }
`;

const Tempo = styled.p`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-size: 12px;
    font-weight: 700;

    @media (max-width: 600px) {
        display: none;
    }
`;

const BotaoSair = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    background-color: #FFFFFF;
    color: #6B7280;
    font-size: 16px;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
        color: var(--roxo-moradia);
    }
`;

const Cartao = styled.main`
    display: flex;
    flex-direction: column;
    gap: 40px;
    box-sizing: border-box;
    max-width: 1000px;
    margin: 48px auto 80px;
    padding: 64px 64px 48px;
    border-radius: 24px;
    background-color: #FFFFFF;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

    @media (max-width: 1040px) {
        margin: 24px 16px 48px;
        padding: 32px 24px;
    }
`;

const Conteudo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
`;

const Rodape = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    padding-top: 24px;
    border-top: 1px solid #E5E7EB;
`;

const BotaoPular = styled.button`
    padding: 0;
    border: none;
    background: none;
    color: #6B7280;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        color: var(--roxo-moradia);
    }
`;

const Acoes = styled.div`
    display: flex;
    gap: 16px;
    margin-left: auto;
`;

const Botao = styled.button`
    padding: 12px 24px;
    border-radius: 8px;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const BotaoVoltar = styled(Botao)`
    border: 1px solid #E5E7EB;
    background-color: #FFFFFF;
    color: #111827;
`;

const BotaoContinuar = styled(Botao)`
    border: 1px solid var(--roxo-moradia);
    background-color: var(--roxo-moradia);
    color: #FFFFFF;

    &:hover:not(:disabled) {
        background-color: #4338CA;
    }
`;

const Concluido = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;

    p {
        max-width: 520px;
    }
`;

const IconeConcluido = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background-color: #ECFDF5;
    color: #10B981;
    font-size: 28px;
`;

// Etapas ainda não implementadas mostram só o título; cada tarefa seguinte registra a sua.
const ETAPAS_INFO = {
    momento: { titulo: 'Primeiro, queremos conhecer o seu momento.', Componente: EtapaMomento },
    orcamento: { titulo: 'Quanto você pretende gastar para viver?' },
    onde: { titulo: 'Onde você topa morar?' },
    trabalho: { titulo: 'Sua cidade precisa acompanhar seus objetivos.' },
    clima: { titulo: 'Qual clima combina com você?' },
    prioridades: { titulo: 'Agora, o que realmente importa para você?' },
};

function isObjetoSimples(valor) {
    return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}

function Onboarding({ usuario, onSair }) {
    const [respostas, setRespostas] = useState(criarRespostasIniciais);
    const [etapaAtual, setEtapaAtual] = useState('momento');
    const [pesosAjustados, setPesosAjustados] = useState(false);
    const [concluido, setConcluido] = useState(false);

    const etapas = etapasVisiveis(respostas);
    const posicao = etapas.indexOf(etapaAtual) + 1;
    const restantes = aplicarFiltros(respostas, cidades).length;
    const { titulo, Componente } = ETAPAS_INFO[etapaAtual];
    const ultimaEtapa = proximaEtapa(etapas, etapaAtual) === null;

    function alterar(secao, valor) {
        setRespostas((atuais) => ({
            ...atuais,
            [secao]: isObjetoSimples(atuais[secao]) && isObjetoSimples(valor) ? { ...atuais[secao], ...valor } : valor,
        }));
    }

    function alterarPeso(pilar, nivel) {
        setPesosAjustados(true);
        alterar('pesos', { [pilar]: nivel });
    }

    function irPara(etapa) {
        setEtapaAtual(etapa);
        window.scrollTo(0, 0);
    }

    // Os pesos só são sugeridos enquanto a pessoa não os ajustou à mão.
    function avancar(base) {
        const limpas = limparEtapasOcultas(base);
        const proxima = proximaEtapa(etapasVisiveis(limpas), etapaAtual);
        if (!proxima) {
            setRespostas(limpas);
            setConcluido(true);
            window.scrollTo(0, 0);
            return;
        }
        const sugerir = proxima === 'prioridades' && !pesosAjustados;
        setRespostas(sugerir ? { ...limpas, pesos: sugerirPesos(limpas).pesos } : limpas);
        irPara(proxima);
    }

    function voltar() {
        const anterior = etapaAnterior(etapas, etapaAtual);
        if (anterior) irPara(anterior);
        else onSair();
    }

    function pular() {
        if (etapaAtual === 'prioridades') {
            setPesosAjustados(false);
            avancar({ ...respostas, pesos: sugerirPesos(respostas).pesos });
            return;
        }
        avancar(limparEtapa(respostas, etapaAtual));
    }

    return (
        <Pagina>
            <Topo>
                <Logo>
                    <IconeLogo><FiCompass /></IconeLogo>
                    <p>Morad<span>IA</span></p>
                </Logo>
                <LadoDireito>
                    {!concluido && (
                        <Progresso>
                            Etapa {posicao} de {etapas.length}
                            <TrilhaProgresso
                                $valor={(posicao / etapas.length) * 100}
                                role="progressbar"
                                aria-valuemin={1}
                                aria-valuemax={etapas.length}
                                aria-valuenow={posicao}
                                aria-label="Progresso da análise"
                            >
                                <div />
                            </TrilhaProgresso>
                        </Progresso>
                    )}
                    <Tempo><FiClock aria-hidden="true" /> ~3 min</Tempo>
                    <BotaoSair type="button" onClick={onSair} title="Sair da análise" aria-label="Sair da análise">
                        <FiX />
                    </BotaoSair>
                </LadoDireito>
            </Topo>

            <Cartao>
                {concluido ? (
                    <Concluido>
                        <IconeConcluido><FiCheck /></IconeConcluido>
                        <TituloEtapa>Tudo pronto!</TituloEtapa>
                        <Ajuda>
                            {restantes} {restantes === 1 ? 'cidade atende' : 'cidades atendem'} aos seus critérios.
                            O ranking com o seu percentual de match chega na próxima versão.
                        </Ajuda>
                        <BotaoContinuar type="button" onClick={onSair}>Voltar ao dashboard</BotaoContinuar>
                    </Concluido>
                ) : (
                    <>
                        <TituloEtapa>{titulo}</TituloEtapa>
                        <Conteudo>
                            {Componente && (
                                <Componente
                                    respostas={respostas}
                                    alterar={alterar}
                                    alterarPeso={alterarPeso}
                                    usuario={usuario}
                                />
                            )}
                        </Conteudo>
                        <Rodape>
                            <BotaoPular type="button" onClick={pular}>Pular esta etapa</BotaoPular>
                            <Acoes>
                                <BotaoVoltar type="button" onClick={voltar}>Voltar</BotaoVoltar>
                                <BotaoContinuar
                                    type="button"
                                    onClick={() => avancar(respostas)}
                                    disabled={restantes === 0}
                                    title={restantes === 0 ? 'Nenhuma cidade atende aos seus filtros' : undefined}
                                >
                                    {ultimaEtapa ? 'Encontrar minha cidade' : 'Continuar'}
                                </BotaoContinuar>
                            </Acoes>
                        </Rodape>
                    </>
                )}
            </Cartao>
        </Pagina>
    );
}

export default Onboarding
```

- [ ] **Step 6: Ligar a rota no `src/App.jsx`**

Adicionar o import depois do de `Perfil`:

```jsx
import Onboarding from './componentes/Onboarding/index.jsx';
```

Trocar a função `iniciarAnalise` por:

```jsx
  function iniciarAnalise() {
    navegar('onboarding');
  }
```

Trocar o `return` final por:

```jsx
  if (pagina === 'onboarding') {
    return <Onboarding usuario={sessao.user} onSair={() => navegar('dashboard')} />;
  }

  return pagina === 'perfil'
    ? <Perfil usuario={sessao.user} onNavegar={navegar} onNovaAnalise={iniciarAnalise} />
    : <Dashboard usuario={sessao.user} onNavegar={navegar} onIniciarAnalise={iniciarAnalise} />;
```

- [ ] **Step 7: Testes, lint e build**

Run: `npm test && npm run lint && npm run build`
Expected: tudo PASS e sem erros.

- [ ] **Step 8: Verificação manual**

Run: `npm run dev`, entrar e clicar em "Nova Análise".
Expected:
- Abre "Etapa 1 de 5" com as 4 perguntas; "Com família" faz aparecer "Tem filhos em idade escolar?".
- Marcar "Presencial" muda o topo para "Etapa 1 de 6".
- "Continuar" avança (as etapas 2 a 6 mostram só o título, por enquanto); "Voltar" na etapa 1 e o ✕ voltam ao dashboard.
- Na última etapa o botão diz "Encontrar minha cidade" e leva à tela "Tudo pronto!".
- Em 375px de largura não há rolagem horizontal.

- [ ] **Step 9: Commit**

```bash
git add src/analise/formatacao.js src/analise/formatacao.test.js src/componentes/Onboarding src/App.jsx
git commit -m "Casca do onboarding com a etapa Seu momento"
```

---

### Task 7: Etapa "Orçamento"

**Files:**
- Create: `src/componentes/Onboarding/EtapaOrcamento.jsx`
- Modify: `src/componentes/Onboarding/index.jsx` (registrar a etapa)

**Interfaces:**
- Consumes: `FAIXAS_RENDA`, `TETO_MINIMO`, `TETO_MAXIMO`, `PASSO_TETO`; `pontoMedioRenda`, `tetoPadrao`; `formatarReais`; `GrupoOpcoes`, `Pergunta`, `Ajuda`, `ContadorCidades`; `cidades`.

- [ ] **Step 1: Criar `src/componentes/Onboarding/EtapaOrcamento.jsx`**

A simulação mostra só o que é calculável com honestidade: renda estimada, teto de moradia, o que sobra e o percentual da renda. Os valores de alimentação e transporte do Figma eram fictícios e ficam de fora.

```jsx
import styled from "styled-components"
import { FAIXAS_RENDA, PASSO_TETO, TETO_MAXIMO, TETO_MINIMO } from '../../analise/opcoes.js';
import { pontoMedioRenda, tetoPadrao } from '../../analise/respostas.js';
import { formatarReais } from '../../analise/formatacao.js';
import { cidades } from '../../dados/cidades.js';
import { Ajuda, ContadorCidades, GrupoOpcoes, Pergunta } from './elementos.jsx';

const Linha = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 32px;

    @media (max-width: 900px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const ValoresSlider = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    font-size: 14px;
    color: #6B7280;

    strong {
        font-size: 18px;
        font-weight: 800;
        color: var(--roxo-moradia);
    }
`;

const Slider = styled.input`
    width: 100%;
    height: 8px;
    margin: 12px 0;
    border-radius: 4px;
    background: linear-gradient(
        to right,
        var(--roxo-moradia) ${({ $preenchimento }) => $preenchimento}%,
        #E5E7EB ${({ $preenchimento }) => $preenchimento}%
    );
    appearance: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
        width: 20px;
        height: 20px;
        border: 3px solid var(--roxo-moradia);
        border-radius: 50%;
        background-color: #FFFFFF;
        appearance: none;
    }

    &::-moz-range-thumb {
        width: 14px;
        height: 14px;
        border: 3px solid var(--roxo-moradia);
        border-radius: 50%;
        background-color: #FFFFFF;
    }

    &:focus-visible {
        outline: 3px solid #EEF2FF;
        outline-offset: 4px;
    }
`;

const Simulacao = styled.dl`
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
    width: 340px;
    box-sizing: border-box;
    margin: 0;
    padding: 24px;
    border-radius: 16px;
    background-color: #F8FAFC;
    font-size: 13px;

    @media (max-width: 900px) {
        width: auto;
    }

    div {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
    }

    dt {
        font-weight: 500;
        color: #111827;
    }

    dd {
        margin: 0;
        font-weight: 700;
    }
`;

const TituloSimulacao = styled.p`
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    color: #6B7280;
`;

const LinhaRenda = styled.div`
    border-bottom: 1px solid #E5E7EB;
    font-size: 14px;

    dt, dd {
        font-weight: 700;
        color: #111827;
    }
`;

function EtapaOrcamento({ respostas, alterar }) {
    const { faixaRenda, tetoMoradia } = respostas.orcamento;
    const renda = pontoMedioRenda(faixaRenda);
    const preenchimento = tetoMoradia === null ? 0 : ((tetoMoradia - TETO_MINIMO) / (TETO_MAXIMO - TETO_MINIMO)) * 100;
    const sobra = renda === null ? 0 : renda - tetoMoradia;

    return (
        <>
            <GrupoOpcoes
                legenda="Qual é a renda mensal do seu domicílio?"
                ajuda="Some a renda de todos que vão dividir as despesas."
                opcoes={FAIXAS_RENDA}
                valor={faixaRenda}
                onChange={(id) => alterar('orcamento', { faixaRenda: id, tetoMoradia: tetoPadrao(id) })}
            />

            {faixaRenda && (
                <Linha>
                    <Pergunta>
                        <legend>Quanto você pode gastar com moradia?</legend>
                        <div>
                            <ValoresSlider>
                                <span>{formatarReais(TETO_MINIMO)}</span>
                                <strong>{formatarReais(tetoMoradia)} / mês</strong>
                                <span>{formatarReais(TETO_MAXIMO)}+</span>
                            </ValoresSlider>
                            <Slider
                                type="range"
                                min={TETO_MINIMO}
                                max={TETO_MAXIMO}
                                step={PASSO_TETO}
                                value={tetoMoradia}
                                $preenchimento={preenchimento}
                                aria-label="Gasto máximo com moradia por mês"
                                aria-valuetext={`${formatarReais(tetoMoradia)} por mês`}
                                onChange={(e) => alterar('orcamento', { tetoMoradia: Number(e.target.value) })}
                            />
                        </div>
                        <Ajuda>
                            Cidades em que o aluguel estimado passa deste valor (com 10% de tolerância) saem do ranking.
                        </Ajuda>
                    </Pergunta>

                    <Simulacao aria-label="Simulação de orçamento">
                        <TituloSimulacao>Simulação de orçamento</TituloSimulacao>
                        <LinhaRenda><dt>Renda estimada</dt><dd>{formatarReais(renda)}</dd></LinhaRenda>
                        <div><dt>Moradia (meta)</dt><dd style={{ color: 'var(--roxo-moradia)' }}>{formatarReais(tetoMoradia)}</dd></div>
                        <div>
                            <dt>Sobra para o resto</dt>
                            <dd style={{ color: sobra < 0 ? '#DC2626' : '#10B981' }}>{formatarReais(sobra)}</dd>
                        </div>
                        <div><dt>Moradia / renda</dt><dd style={{ color: '#6B7280' }}>{Math.round((tetoMoradia / renda) * 100)}%</dd></div>
                    </Simulacao>
                </Linha>
            )}

            <ContadorCidades respostas={respostas} cidades={cidades} />
        </>
    );
}

export default EtapaOrcamento
```

- [ ] **Step 2: Registrar a etapa na casca**

Em `src/componentes/Onboarding/index.jsx`, adicionar o import depois de `EtapaMomento`:

```jsx
import EtapaOrcamento from './EtapaOrcamento.jsx';
```

e trocar a linha `orcamento` de `ETAPAS_INFO` por:

```jsx
    orcamento: { titulo: 'Quanto você pretende gastar para viver?', Componente: EtapaOrcamento },
```

- [ ] **Step 3: Lint e build**

Run: `npm run lint && npm run build`
Expected: sem erros.

- [ ] **Step 4: Verificação manual**

Run: `npm run dev` → "Nova Análise" → avançar até a etapa 2.
Expected:
- Antes de escolher a renda, só aparecem as 6 faixas e o contador "16 de 16".
- Escolher "R$ 7.000 - R$ 12.000" mostra o slider em R$ 2.850 e a simulação: renda R$ 9.500, sobra R$ 6.650, 30%.
- Mover o slider até R$ 1.500 diminui o contador (cidades com aluguel de 1 pessoa acima de R$ 1.650 saem).
- Com o slider ajustado, trocar a faixa de renda volta o teto a 30% da nova faixa.
- Em "Até R$ 2.000" com teto R$ 500, o contador fica em alerta âmbar e "Continuar" desabilita quando chegar a 0.
- "Pular esta etapa" limpa a renda e o teto.

- [ ] **Step 5: Commit**

```bash
git add src/componentes/Onboarding/EtapaOrcamento.jsx src/componentes/Onboarding/index.jsx
git commit -m "Etapa Orçamento do onboarding com teto de moradia e simulação"
```

---

### Task 8: Etapa "Onde"

**Files:**
- Create: `src/componentes/Onboarding/EtapaOnde.jsx`
- Modify: `src/componentes/Onboarding/index.jsx` (registrar a etapa)

**Interfaces:**
- Consumes: `REGIOES`, `PORTES`, `RAIOS_KM`, `RAIO_PADRAO_KM`, `OPCOES_PRAIA`, `SIM_NAO`; `coordenadasDe`; `BuscaCidade`; `GrupoOpcoes`, `Pergunta`, `Ajuda`, `ContadorCidades`; `cidades`; `usuario.user_metadata.perfil.cidadeAtual` (texto livre, opcional).

- [ ] **Step 1: Criar `src/componentes/Onboarding/EtapaOnde.jsx`**

Ao marcar "Sim" em "ficar perto de alguma cidade", a etapa tenta pré-preencher com a cidade atual do perfil. Se o texto do perfil não bater com nenhum município conhecido, o campo fica vazio, sem mensagem de erro. Se a pessoa escolher uma cidade sem coordenadas, aparece a mensagem e o filtro não é aplicado.

```jsx
import { useState } from 'react';
import styled from "styled-components"
import { FiMapPin } from 'react-icons/fi';
import { OPCOES_PRAIA, PORTES, RAIO_PADRAO_KM, RAIOS_KM, REGIOES, SIM_NAO } from '../../analise/opcoes.js';
import { coordenadasDe } from '../../analise/coordenadas.js';
import { cidades } from '../../dados/cidades.js';
import BuscaCidade from '../BuscaCidade/index.jsx';
import { Ajuda, ContadorCidades, GrupoOpcoes, Pergunta } from './elementos.jsx';

const CidadeEscolhida = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 2px solid var(--roxo-moradia);
    border-radius: 12px;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-size: 14px;
    font-weight: 700;

    button {
        margin-left: auto;
        padding: 0;
        border: none;
        background: none;
        color: #6B7280;
        font-family: var(--fonte-moradia);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
    }
`;

const Erro = styled.p`
    color: #DC2626;
    font-size: 13px;
    font-weight: 600;
`;

const opcoesRaio = RAIOS_KM.map((km) => ({ id: String(km), rotulo: `Até ${km} km` }));

function EtapaOnde({ respostas, alterar, usuario }) {
    const { regioes, referencia, portes, praia } = respostas.onde;
    const [erroReferencia, setErroReferencia] = useState(null);
    const cidadeDoPerfil = usuario.user_metadata?.perfil?.cidadeAtual?.trim();

    async function escolherReferencia(cidade, { silencioso = false } = {}) {
        const raioKm = referencia?.raioKm ?? RAIO_PADRAO_KM;
        const coordenadas = await coordenadasDe(cidade).catch(() => null);
        if (!coordenadas) {
            if (!silencioso) setErroReferencia('Não encontramos a localização dessa cidade. Escolha outra.');
            return;
        }
        setErroReferencia(null);
        alterar('onde', { referencia: { cidade, ...coordenadas, raioKm } });
    }

    function alternarProximidade(valor) {
        setErroReferencia(null);
        if (valor === 'nao') {
            alterar('onde', { referencia: null });
            return;
        }
        alterar('onde', { referencia: { cidade: null, lat: null, lon: null, raioKm: RAIO_PADRAO_KM } });
        if (cidadeDoPerfil) escolherReferencia(cidadeDoPerfil, { silencioso: true });
    }

    return (
        <>
            <GrupoOpcoes
                legenda="Em quais regiões você toparia morar?"
                ajuda="Desmarque as regiões que não quer considerar. Pelo menos uma precisa ficar marcada."
                opcoes={REGIOES}
                valor={regioes}
                onChange={(valor) => alterar('onde', { regioes: valor })}
                multipla
                minimo={1}
                colunas={5}
            />

            <GrupoOpcoes
                legenda="Quer ficar perto de alguma cidade?"
                ajuda="Por exemplo, a cidade onde você mora hoje ou onde mora sua família."
                opcoes={SIM_NAO}
                valor={referencia ? 'sim' : 'nao'}
                onChange={alternarProximidade}
                colunas={2}
            />

            {referencia && (
                <Pergunta>
                    <legend>Perto de qual cidade?</legend>
                    {referencia.cidade ? (
                        <CidadeEscolhida>
                            <FiMapPin aria-hidden="true" /> {referencia.cidade}
                            <button
                                type="button"
                                onClick={() => alterar('onde', { referencia: { ...referencia, cidade: null, lat: null, lon: null } })}
                            >
                                Trocar
                            </button>
                        </CidadeEscolhida>
                    ) : (
                        <BuscaCidade onEscolher={escolherReferencia} rotuloAcessivel="Pesquisar cidade de referência" />
                    )}
                    {erroReferencia && <Erro role="alert">{erroReferencia}</Erro>}
                    <GrupoOpcoes
                        legenda="A que distância, no máximo?"
                        ajuda="Distância em linha reta."
                        opcoes={opcoesRaio}
                        valor={String(referencia.raioKm)}
                        onChange={(id) => alterar('onde', { referencia: { ...referencia, raioKm: Number(id) } })}
                    />
                </Pergunta>
            )}

            <GrupoOpcoes
                legenda="De que tamanho de cidade você gosta?"
                ajuda="Pode marcar mais de um."
                opcoes={PORTES}
                valor={portes}
                onChange={(valor) => alterar('onde', { portes: valor })}
                multipla
                minimo={1}
            />

            <GrupoOpcoes
                legenda="E praia?"
                opcoes={OPCOES_PRAIA}
                valor={praia}
                onChange={(valor) => alterar('onde', { praia: valor })}
            />

            <Ajuda>Indispensável deixa só cidades litorâneas no ranking; “Seria bom” dá um bônus a elas.</Ajuda>

            <ContadorCidades respostas={respostas} cidades={cidades} />
        </>
    );
}

export default EtapaOnde
```

- [ ] **Step 2: Registrar a etapa na casca**

Em `src/componentes/Onboarding/index.jsx`, adicionar o import:

```jsx
import EtapaOnde from './EtapaOnde.jsx';
```

e trocar a linha `onde` de `ETAPAS_INFO` por:

```jsx
    onde: { titulo: 'Onde você topa morar?', Componente: EtapaOnde },
```

- [ ] **Step 3: Lint e build**

Run: `npm run lint && npm run build`
Expected: sem erros.

- [ ] **Step 4: Verificação manual**

Run: `npm run dev` → "Nova Análise" → etapa 3.
Expected:
- Desmarcar todas as regiões não é possível: a última marcada não desmarca.
- Só "Sul" marcado deixa o contador em "5 de 16".
- "Sim" em "ficar perto": com "São Paulo, SP" como cidade atual no perfil, já aparece "São Paulo, SP"; com o perfil vazio, aparece a busca.
- Escolher "Curitiba, PR" com 300 km deixa o contador em "3 de 16" (Curitiba, Joinville e Florianópolis; Maringá e São Paulo ficam a ~350 km), com todas as regiões marcadas.
- "Trocar" volta para a busca e o contador ignora a distância enquanto não houver cidade.
- Praia "Indispensável" deixa o contador só com cidades litorâneas.

- [ ] **Step 5: Commit**

```bash
git add src/componentes/Onboarding/EtapaOnde.jsx src/componentes/Onboarding/index.jsx
git commit -m "Etapa Onde do onboarding com regiões, distância, porte e praia"
```

---

### Task 9: Etapas "Trabalho e estudo" e "Clima"

**Files:**
- Create: `src/componentes/Onboarding/EtapaTrabalho.jsx`
- Create: `src/componentes/Onboarding/EtapaClima.jsx`
- Modify: `src/componentes/Onboarding/index.jsx` (registrar as etapas)

**Interfaces:**
- Consumes: `SETORES`, `MAXIMO_SETORES`, `SIM_NAO`, `OPCOES_TEMPERATURA`; `GrupoOpcoes`.

- [ ] **Step 1: Criar `src/componentes/Onboarding/EtapaTrabalho.jsx`**

```jsx
import { MAXIMO_SETORES, SETORES, SIM_NAO } from '../../analise/opcoes.js';
import { GrupoOpcoes } from './elementos.jsx';

function EtapaTrabalho({ respostas, alterar }) {
    const { setores, ensinoSuperior } = respostas.trabalho;

    return (
        <>
            <GrupoOpcoes
                legenda="Quais setores te interessam?"
                ajuda={`Escolha até ${MAXIMO_SETORES}. Usamos isso para avaliar o mercado da sua área em cada cidade.`}
                opcoes={SETORES}
                valor={setores}
                onChange={(valor) => alterar('trabalho', { setores: valor })}
                multipla
                maximo={MAXIMO_SETORES}
            />

            {respostas.situacao.includes('estudo') && (
                <GrupoOpcoes
                    legenda="Você vai cursar o ensino superior?"
                    ajuda="Se sim, avaliamos a oferta de faculdades e universidades."
                    opcoes={SIM_NAO}
                    valor={ensinoSuperior ? 'sim' : 'nao'}
                    onChange={(valor) => alterar('trabalho', { ensinoSuperior: valor === 'sim' })}
                    colunas={2}
                />
            )}
        </>
    );
}

export default EtapaTrabalho
```

- [ ] **Step 2: Criar `src/componentes/Onboarding/EtapaClima.jsx`**

```jsx
import { OPCOES_TEMPERATURA, SIM_NAO } from '../../analise/opcoes.js';
import { GrupoOpcoes } from './elementos.jsx';

function EtapaClima({ respostas, alterar }) {
    const { temperatura, chuvaIncomoda } = respostas.clima;

    return (
        <>
            <GrupoOpcoes
                legenda="Qual temperatura combina com o seu dia a dia?"
                opcoes={OPCOES_TEMPERATURA}
                valor={temperatura}
                onChange={(valor) => alterar('clima', { temperatura: valor })}
                colunas={4}
            />

            <GrupoOpcoes
                legenda="Chuva frequente te incomoda?"
                opcoes={SIM_NAO}
                valor={chuvaIncomoda ? 'sim' : 'nao'}
                onChange={(valor) => alterar('clima', { chuvaIncomoda: valor === 'sim' })}
                colunas={2}
            />
        </>
    );
}

export default EtapaClima
```

- [ ] **Step 3: Registrar as etapas na casca**

Em `src/componentes/Onboarding/index.jsx`, adicionar os imports:

```jsx
import EtapaTrabalho from './EtapaTrabalho.jsx';
import EtapaClima from './EtapaClima.jsx';
```

e trocar as linhas `trabalho` e `clima` de `ETAPAS_INFO` por:

```jsx
    trabalho: { titulo: 'Sua cidade precisa acompanhar seus objetivos.', Componente: EtapaTrabalho },
    clima: { titulo: 'Qual clima combina com você?', Componente: EtapaClima },
```

- [ ] **Step 4: Lint e build**

Run: `npm run lint && npm run build`
Expected: sem erros.

- [ ] **Step 5: Verificação manual**

Run: `npm run dev` → "Nova Análise".
Expected:
- Com "Presencial" + "Estudo" na etapa 1, a etapa 4 aparece com setores e a pergunta de ensino superior; o 3º setor fica bloqueado depois de escolher 2.
- Com só "Presencial", a pergunta de ensino superior não aparece.
- Marcar setores, voltar à etapa 1, trocar para só "Remoto" e avançar: a etapa 4 some e, ao voltar a marcar "Presencial", os setores estão vazios.
- Etapa de clima: as 4 opções de temperatura e a pergunta da chuva funcionam.

- [ ] **Step 6: Commit**

```bash
git add src/componentes/Onboarding/EtapaTrabalho.jsx src/componentes/Onboarding/EtapaClima.jsx src/componentes/Onboarding/index.jsx
git commit -m "Etapas Trabalho e estudo e Clima do onboarding"
```

---

### Task 10: Etapa "O que importa para você"

**Files:**
- Create: `src/componentes/Onboarding/EtapaPrioridades.jsx`
- Modify: `src/componentes/Onboarding/index.jsx` (registrar a etapa)
- Modify: `CLAUDE.md` (descrever o onboarding)

**Interfaces:**
- Consumes: `PILARES`, `NIVEIS_IMPORTANCIA`, `MAXIMO_ESSENCIAIS`; `sugerirPesos`; `Ajuda`; prop `alterarPeso(pilar, nivel)` da casca. `respostas.pesos` já vem preenchido pela casca ao entrar na etapa.

- [ ] **Step 1: Criar `src/componentes/Onboarding/EtapaPrioridades.jsx`**

```jsx
import styled from "styled-components"
import { MAXIMO_ESSENCIAIS, NIVEIS_IMPORTANCIA, PILARES } from '../../analise/opcoes.js';
import { sugerirPesos } from '../../analise/prePreenchimento.js';
import { Ajuda } from './elementos.jsx';

const Cabecalho = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
`;

const ContadorEssenciais = styled.p`
    padding: 6px 12px;
    border-radius: 8px;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-size: 13px;
    font-weight: 700;
`;

const Lista = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const LinhaPilar = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 20px;
    border: 1px solid #E5E7EB;
    border-radius: 16px;

    @media (max-width: 700px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const TextosPilar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
`;

const NomePilar = styled.p`
    font-size: 16px;
    font-weight: 700;
    color: #111827;
`;

const DescricaoPilar = styled.p`
    font-size: 13px;
    color: #6B7280;
`;

const Motivo = styled.p`
    font-size: 12px;
    font-weight: 600;
    color: var(--roxo-moradia);
`;

const Segmentado = styled.div`
    display: flex;
    flex-shrink: 0;
    gap: 4px;
    padding: 4px;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
`;

const CORES_NIVEL = {
    essencial: { fundo: 'var(--roxo-moradia)', texto: '#FFFFFF' },
    importante: { fundo: '#EEF2FF', texto: 'var(--roxo-moradia)' },
    tantoFaz: { fundo: '#F3F4F6', texto: '#6B7280' },
};

const BotaoNivel = styled.button`
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    background-color: ${({ $ativo, $nivel }) => ($ativo ? CORES_NIVEL[$nivel].fundo : 'transparent')};
    color: ${({ $ativo, $nivel }) => ($ativo ? CORES_NIVEL[$nivel].texto : '#6B7280')};
    font-family: var(--fonte-moradia);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;

    &:hover:not(:disabled):not([aria-checked='true']) {
        color: var(--roxo-moradia);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

function EtapaPrioridades({ respostas, alterarPeso }) {
    const { pesos } = respostas;
    const { motivos } = sugerirPesos(respostas);
    const essenciais = Object.values(pesos).filter((nivel) => nivel === 'essencial').length;

    return (
        <>
            <Cabecalho>
                <Ajuda>
                    Já sugerimos uma combinação com base nas suas respostas. Ajuste à vontade: os essenciais pesam
                    3 vezes mais, e “Tanto faz” tira o pilar do cálculo.
                </Ajuda>
                <ContadorEssenciais>Essenciais: {essenciais} de {MAXIMO_ESSENCIAIS}</ContadorEssenciais>
            </Cabecalho>

            <Lista>
                {PILARES.map(({ id, rotulo, descricao }) => (
                    <LinhaPilar key={id}>
                        <TextosPilar>
                            <NomePilar>{rotulo}</NomePilar>
                            <DescricaoPilar>{descricao}</DescricaoPilar>
                            {motivos[id] && <Motivo>Sugerido: {motivos[id]}</Motivo>}
                        </TextosPilar>
                        <Segmentado role="radiogroup" aria-label={`Importância de ${rotulo}`}>
                            {NIVEIS_IMPORTANCIA.map((nivel) => {
                                const ativo = pesos[id] === nivel.id;
                                const bloqueado = nivel.id === 'essencial' && !ativo && essenciais >= MAXIMO_ESSENCIAIS;
                                return (
                                    <BotaoNivel
                                        key={nivel.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={ativo}
                                        $ativo={ativo}
                                        $nivel={nivel.id}
                                        disabled={bloqueado}
                                        title={bloqueado ? `Máximo de ${MAXIMO_ESSENCIAIS} essenciais` : undefined}
                                        onClick={() => alterarPeso(id, nivel.id)}
                                    >
                                        {nivel.rotulo}
                                    </BotaoNivel>
                                );
                            })}
                        </Segmentado>
                    </LinhaPilar>
                ))}
            </Lista>
        </>
    );
}

export default EtapaPrioridades
```

- [ ] **Step 2: Registrar a etapa na casca**

Em `src/componentes/Onboarding/index.jsx`, adicionar o import:

```jsx
import EtapaPrioridades from './EtapaPrioridades.jsx';
```

trocar a linha `prioridades` de `ETAPAS_INFO` por:

```jsx
    prioridades: { titulo: 'Agora, o que realmente importa para você?', Componente: EtapaPrioridades },
```

e apagar o comentário `// Etapas ainda não implementadas mostram só o título; cada tarefa seguinte registra a sua.` acima de `ETAPAS_INFO`, já que todas as etapas estão registradas.

- [ ] **Step 3: Atualizar o `CLAUDE.md`**

Em "Project", trocar a frase `Currently only the Login screen is implemented; there is no backend, routing, or real data yet.` por:

```markdown
Implemented: Login, Dashboard, Meu perfil and the analysis onboarding (6 adaptive steps). The ranking/score (results screen) and the real city dataset are not built yet — the onboarding filters run against a fixture in `src/dados/cidades.js`. The onboarding/scoring design lives in `docs/superpowers/specs/2026-10-05-onboarding-analise-design.md`.
```

Em "Architecture & conventions", depois da linha sobre `src/main.jsx`, adicionar:

```markdown
- Pure analysis logic (answers model, weight suggestions, filters) lives in `src/analise/` with Vitest tests next to each file; UI components only read `respostas` and call `alterar(secao, valor)`.
```

- [ ] **Step 4: Testes, lint e build**

Run: `npm test && npm run lint && npm run build`
Expected: tudo PASS e sem erros.

- [ ] **Step 5: Verificação manual**

Run: `npm run dev` → "Nova Análise".
Expected:
- Com "Aposentado(a)" + motivação "Economizar", a etapa 6 abre com Saúde e Custo de vida em Essencial, Trabalho em Tanto faz, e "Sugerido: …" explicando cada um.
- Com 3 essenciais marcados, o botão "Essencial" dos outros pilares fica desabilitado, com a dica "Máximo de 3 essenciais".
- **Pesos preservados (Review Focus 4):** mudar Lazer para Essencial, clicar em "Voltar", trocar o clima e avançar de novo: Lazer continua Essencial.
- "Pular esta etapa" na etapa 6 volta à sugestão e conclui.
- "Encontrar minha cidade" leva à tela "Tudo pronto!" com o número de cidades.
- Em 375px de largura, as linhas dos pilares empilham o seletor abaixo do texto, sem rolagem horizontal.

- [ ] **Step 6: Commit**

```bash
git add src/componentes/Onboarding/EtapaPrioridades.jsx src/componentes/Onboarding/index.jsx CLAUDE.md
git commit -m "Etapa O que importa para você, com pesos sugeridos e limite de essenciais"
```
