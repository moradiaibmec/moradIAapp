import { describe, expect, it } from 'vitest';
import { PILARES } from './opcoes.js';
import { criarRespostasIniciais } from './respostas.js';
import { pesosPadrao } from './prePreenchimento.js';
import { calcularMatch, notaCusto, notaTemperatura, percentil } from './match.js';
import { cidades } from '../dados/cidadesFixture.js';

const todosOsPilares = (nivel) => Object.fromEntries(PILARES.map(({ id }) => [id, nivel]));

function respostasCom(mudancas = {}) {
    const base = criarRespostasIniciais();
    return {
        ...base,
        pesos: pesosPadrao(),
        ...mudancas,
        domicilio: { ...base.domicilio, ...mudancas.domicilio },
        orcamento: { ...base.orcamento, ...mudancas.orcamento },
        onde: { ...base.onde, ...mudancas.onde },
        trabalho: { ...base.trabalho, ...mudancas.trabalho },
        clima: { ...base.clima, ...mudancas.clima },
    };
}

const resultadoDe = (resultados, nome) => resultados.find(({ cidade }) => cidade.startsWith(nome));
const nomes = (resultados) => resultados.map(({ cidade }) => cidade);

describe('percentil', () => {
    it('é a fração das outras cidades que ficam atrás', () => {
        expect(percentil(1, [1, 2, 3, 4, 5])).toBe(0);
        expect(percentil(3, [1, 2, 3, 4, 5])).toBe(50);
        expect(percentil(5, [1, 2, 3, 4, 5])).toBe(100);
    });

    it('conta empates pela metade e ignora valores ausentes', () => {
        expect(percentil(2, [1, 2, 2, 3, null])).toBe(50);
    });

    it('dá 50 quando só existe uma cidade com o dado', () => {
        expect(percentil(7, [7, null])).toBe(50);
    });
});

describe('notaTemperatura', () => {
    const cidade = (tempMedia, tempMesFrio) => ({ indicadores: { tempMedia, tempMesFrio } });

    it('vale 100 dentro da faixa e perde 15 pontos por grau fora dela', () => {
        expect(notaTemperatura('calor', cidade(26, 24))).toBe(100);
        expect(notaTemperatura('calor', cidade(22, 18))).toBe(70);
        expect(notaTemperatura('ameno', cidade(25, 20))).toBe(85);
        expect(notaTemperatura('ameno', cidade(17, 12))).toBe(85);
        expect(notaTemperatura('frio', cidade(18, 13.6))).toBe(100);
        expect(notaTemperatura('frio', cidade(21, 16.5))).toBe(77.5);
    });

    it('não passa de 0 e não se aplica a "tanto faz"', () => {
        expect(notaTemperatura('calor', cidade(10, 5))).toBe(0);
        expect(notaTemperatura('tantoFaz', cidade(20, 15))).toBeNull();
    });
});

describe('notaCusto', () => {
    it('vale 100 até 25% da renda, 0 a partir de 60% e cai em linha reta entre os dois', () => {
        expect(notaCusto(0.2)).toBe(100);
        expect(notaCusto(0.25)).toBe(100);
        expect(notaCusto(0.425)).toBe(50);
        expect(notaCusto(0.6)).toBe(0);
        expect(notaCusto(0.9)).toBe(0);
    });
});

describe('calcularMatch', () => {
    it('só devolve cidades que passam nos filtros, do maior para o menor match', () => {
        const resultados = calcularMatch(respostasCom({ onde: { praia: 'indispensavel' } }), cidades);
        expect(resultados.length).toBeGreaterThan(0);
        for (const { cidade } of resultados) {
            expect(cidades.find((c) => `${c.nome}, ${c.uf}` === cidade).litoranea).toBe(true);
        }
        const matches = resultados.map(({ match }) => match);
        expect(matches).toEqual([...matches].sort((a, b) => b - a));
    });

    it('calcula as notas sobre todas as cidades, sem depender dos filtros', () => {
        const semFiltro = resultadoDe(calcularMatch(respostasCom(), cidades), 'Curitiba');
        const soSul = resultadoDe(calcularMatch(respostasCom({ onde: { regioes: ['S'] } }), cidades), 'Curitiba');
        expect(soSul.notas).toEqual(semFiltro.notas);
    });

    it('"calor + praia indispensável", com o clima como critério, põe todas as litorâneas quentes à frente das amenas', () => {
        const r = respostasCom({ onde: { praia: 'indispensavel' }, clima: { temperatura: 'calor' }, pesos: { ...todosOsPilares('tantoFaz'), clima: 'essencial' } });
        const temperaturas = calcularMatch(r, cidades).map(({ cidade }) => cidades.find((c) => `${c.nome}, ${c.uf}` === cidade).indicadores.tempMedia);
        const primeiraAmena = temperaturas.findIndex((t) => t < 24);
        expect(primeiraAmena).toBeGreaterThan(0);
        expect(temperaturas.slice(primeiraAmena).every((t) => t < 24)).toBe(true);
    });

    it('"inverno frio" como único critério favorece o Sul', () => {
        const r = respostasCom({ clima: { temperatura: 'frio' }, pesos: { ...todosOsPilares('tantoFaz'), clima: 'essencial' } });
        expect(nomes(calcularMatch(r, cidades)).slice(0, 2).sort()).toEqual(['Curitiba, PR', 'Porto Alegre, RS']);
    });

    it('com todos os pilares em "tanto faz", usa a média simples das notas', () => {
        const [primeiro] = calcularMatch(respostasCom({ pesos: todosOsPilares('tantoFaz') }), cidades);
        const notas = Object.values(primeiro.notas).map(({ nota }) => nota);
        expect(primeiro.match).toBe(Math.round(notas.reduce((a, b) => a + b, 0) / notas.length));
    });

    it('aplica 0,85 ao match quando um pilar essencial tem nota abaixo de 30', () => {
        const r = respostasCom({ pesos: { ...pesosPadrao(), seguranca: 'essencial' } });
        const salvador = resultadoDe(calcularMatch(r, cidades), 'Salvador');
        expect(salvador.notas.seguranca.nota).toBeLessThan(30);
        const pesos = { essencial: 3, importante: 1, tantoFaz: 0 };
        const soma = Object.values(salvador.notas).reduce((total, { nota, peso }) => total + pesos[peso] * nota, 0);
        const somaPesos = Object.values(salvador.notas).reduce((total, { peso }) => total + pesos[peso], 0);
        expect(salvador.match).toBe(Math.round(0.85 * (soma / somaPesos)));
        expect(salvador.pontosAtencao).toContain('seguranca');
    });

    it('passar um pilar para essencial nunca faz uma cidade melhor nele cair abaixo de outra que estava atrás', () => {
        const base = respostasCom({ clima: { temperatura: 'ameno' } });
        const antes = calcularMatch(base, cidades);
        for (const { id } of PILARES) {
            const depois = calcularMatch({ ...base, pesos: { ...base.pesos, [id]: 'essencial' } }, cidades);
            const posicao = (lista, cidade) => lista.findIndex((item) => item.cidade === cidade);
            for (const a of antes) {
                for (const b of antes) {
                    const aMelhorNoPilar = a.notas[id].nota > b.notas[id].nota;
                    if (aMelhorNoPilar && posicao(antes, a.cidade) < posicao(antes, b.cidade)) {
                        expect(posicao(depois, a.cidade)).toBeLessThan(posicao(depois, b.cidade));
                    }
                }
            }
        }
    });

    it('marca como estimada a nota de um pilar cujo indicador está em cidade.estimados', () => {
        const comEstimativa = cidades.map((c) => (c.nome === 'Maringá' ? { ...c, estimados: ['aluguel'] } : c));
        const maringa = resultadoDe(calcularMatch(respostasCom(), comEstimativa), 'Maringá');
        expect(maringa.notas.custo.estimado).toBe(true);
        expect(maringa.notas.seguranca.estimado).toBe(false);
    });

    it('mostra os leitos como dado de saúde quando não há médicos (base real)', () => {
        const semMedicos = cidades.map((c) => ({ ...c, indicadores: { ...c.indicadores, medicos1k: null } }));
        const joinville = resultadoDe(calcularMatch(respostasCom(), semMedicos), 'Joinville');
        expect(joinville.notas.saude.bruto).toBe(2.4);
        expect(joinville.notas.saude.dadoIndisponivel).toBe(false);
    });

    it('não quebra com uma cidade sem aluguel e marca o custo como indisponível', () => {
        const semAluguel = cidades.map((c) => (c.nome === 'Joinville' ? { ...c, indicadores: { ...c.indicadores, aluguel: null } } : c));
        const joinville = resultadoDe(calcularMatch(respostasCom({ orcamento: { faixaRenda: 'r4a7', tetoMoradia: 1650 } }), semAluguel), 'Joinville');
        expect(joinville.notas.custo).toMatchObject({ nota: 50, dadoIndisponivel: true });
    });

    it('dá nota 50 e marca o dado como indisponível quando o indicador falta', () => {
        const semDado = cidades.map((c) => (c.nome === 'Joinville' ? { ...c, indicadores: { ...c.indicadores, homicidios100k: null } } : c));
        const joinville = resultadoDe(calcularMatch(respostasCom(), semDado), 'Joinville');
        expect(joinville.notas.seguranca).toMatchObject({ nota: 50, dadoIndisponivel: true });
        expect(joinville.pontosFortes).not.toContain('seguranca');
        expect(joinville.pontosAtencao).not.toContain('seguranca');
    });

    it('lista até 3 pontos fortes com peso e nota a partir de 70, e pontos de atenção abaixo de 40', () => {
        for (const resultado of calcularMatch(respostasCom({ clima: { temperatura: 'ameno' } }), cidades)) {
            expect(resultado.pontosFortes.length).toBeLessThanOrEqual(3);
            for (const pilar of resultado.pontosFortes) {
                expect(resultado.notas[pilar].nota).toBeGreaterThanOrEqual(70);
                expect(resultado.notas[pilar].peso).not.toBe('tantoFaz');
            }
            for (const pilar of resultado.pontosAtencao) {
                expect(resultado.notas[pilar].nota).toBeLessThan(40);
                expect(resultado.notas[pilar].peso).not.toBe('tantoFaz');
            }
        }
    });

    it('avalia o custo pela renda: mais renda, nota de custo maior na mesma cidade', () => {
        const nota = (faixaRenda) => resultadoDe(calcularMatch(respostasCom({ orcamento: { faixaRenda, tetoMoradia: null } }), cidades), 'Curitiba').notas.custo;
        expect(nota('r12a20').nota).toBeGreaterThan(nota('r4a7').nota);
        // Só o aluguel conta: Curitiba, 1 pessoa, R$ 1.800 sobre R$ 5.500.
        expect(nota('r4a7').bruto).toBeCloseTo(1800 / 5500, 3);
    });

    it('compara o aluguel do tamanho do domicílio com a renda', () => {
        const r = respostasCom({ domicilio: { moradia: 'familia', filhosEscolares: true }, orcamento: { faixaRenda: 'r7a12', tetoMoradia: null } });
        const maringa = resultadoDe(calcularMatch(r, cidades), 'Maringá').notas.custo;
        expect(maringa.bruto).toBeCloseTo(2600 / 9500, 3);
        expect(maringa.nota).toBe(Math.round((100 * (0.6 - 2600 / 9500)) / 0.35));
    });

    it('sem renda informada, a cidade mais barata tem a melhor nota de custo', () => {
        const resultados = calcularMatch(respostasCom(), cidades);
        expect(resultadoDe(resultados, 'Campina Grande').notas.custo.nota).toBe(100);
        expect(resultadoDe(resultados, 'São Paulo').notas.custo.nota).toBe(0);
    });

    it('usa o Ideb para quem tem filhos e as vagas no ensino superior para quem vai estudar', () => {
        const comFilhos = calcularMatch(respostasCom({ domicilio: { moradia: 'familia', filhosEscolares: true } }), cidades);
        expect(resultadoDe(comFilhos, 'Joinville').notas.educacao.bruto).toBe((6.9 + 5.6) / 2);
        const estudante = calcularMatch(respostasCom({ situacao: ['estudo'], trabalho: { ensinoSuperior: true } }), cidades);
        expect(resultadoDe(estudante, 'Joinville').notas.educacao.bruto).toBe(300);
    });

    it('melhora a nota de trabalho de uma cidade forte no setor escolhido', () => {
        const nota = (setores) => resultadoDe(calcularMatch(respostasCom({ situacao: ['presencial'], trabalho: { setores } }), cidades), 'Joinville').notas.trabalho.nota;
        expect(nota(['industria'])).toBeGreaterThan(nota([]));
    });
});
