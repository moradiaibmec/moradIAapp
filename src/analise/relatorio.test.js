import { describe, expect, it } from 'vitest';
import { cidades as cidadesFixture } from '../dados/cidadesFixture.js';
import { FAIXAS_RENDA } from './opcoes.js';
import { calcularMatch } from './match.js';
import { montarRelatorio, textoParaCompartilhar } from './relatorio.js';
import { criarRespostasIniciais } from './respostas.js';

const DATA = '2026-11-06T23:30:00+00:00';
const fontes = {
    aluguel: { nome: 'FipeZap', periodo: 'set/2026', comoEstimado: 'Censo' },
    homicidios100k: { nome: 'Atlas', periodo: '2023' },
};

function montar(alterar = (respostas) => respostas, cidades = cidadesFixture) {
    const respostas = alterar(criarRespostasIniciais());
    return montarRelatorio({ respostas, resultados: calcularMatch(respostas, cidades), cidades, fontes, data: DATA });
}

describe('montarRelatorio', () => {
    it('traz o ranking na ordem do resultado, limitado a 10 cidades', () => {
        const respostas = criarRespostasIniciais();
        const resultados = calcularMatch(respostas, cidadesFixture);
        const repetidos = Array.from({ length: 12 }, (_, indice) => ({ ...resultados[0], match: 90 - indice }));
        const relatorio = montarRelatorio({ respostas, resultados: repetidos, cidades: cidadesFixture, fontes, data: DATA });

        expect(relatorio.ranking).toHaveLength(10);
        expect(relatorio.cidades).toHaveLength(10);
        expect(relatorio.ranking.map(({ posicao }) => posicao)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(relatorio.totalCidades).toBe(12);
    });

    it('explica cada cidade com indicadores, pontos fortes e pontos de atenção', () => {
        const [primeira] = montar().cidades;
        expect(primeira.posicao).toBe(1);
        expect(primeira.indicadores).toHaveLength(8);
        expect(primeira.indicadores[0]).toEqual(expect.objectContaining({ rotulo: expect.any(String), qualificacao: expect.any(String) }));
        expect(primeira.porQue).toContain(primeira.cidade.split(',')[0]);
        expect(Array.isArray(primeira.pontosFortes)).toBe(true);
        expect(Array.isArray(primeira.pontosAtencao)).toBe(true);
    });

    it('usa a data da análise no horário de Brasília, no texto e no nome do arquivo', () => {
        const relatorio = montar();
        expect(relatorio.data).toBe('06 de novembro de 2026');
        expect(relatorio.nomeArquivo).toBe('moradia-relatorio-2026-11-06.pdf');
    });

    it('lista as prioridades pelo peso escolhido, sem os critérios marcados como tanto faz', () => {
        const { prioridades } = montar((respostas) => ({
            ...respostas,
            pesos: { ...respostas.pesos, seguranca: 'essencial', clima: 'tantoFaz' },
        }));
        expect(prioridades.essenciais).toContain('Segurança');
        expect([...prioridades.essenciais, ...prioridades.importantes]).not.toContain('Clima');
    });

    it('não revela a renda, porque o relatório pode ser compartilhado', () => {
        const relatorio = montar((respostas) => ({
            ...respostas,
            orcamento: { ...respostas.orcamento, faixaRenda: FAIXAS_RENDA.find(({ pontoMedio }) => pontoMedio).id },
        }));
        const custo = relatorio.cidades[0].indicadores.find(({ id }) => id === 'custo');
        expect(custo.frase).toBe('');
        expect(JSON.stringify(relatorio)).not.toMatch(/sua renda/);
    });

    it('marca a nota ausente como sem dado', () => {
        const respostas = criarRespostasIniciais();
        const [resultado] = calcularMatch(respostas, cidadesFixture);
        const semDado = { ...resultado, notas: { ...resultado.notas, saude: { ...resultado.notas.saude, dadoIndisponivel: true } } };
        const relatorio = montarRelatorio({ respostas, resultados: [semDado], cidades: cidadesFixture, fontes, data: DATA });
        const saude = relatorio.cidades[0].indicadores.find(({ id }) => id === 'saude');
        expect(saude.nota).toBeNull();
        expect(saude.qualificacao).toBe('Sem dado');
    });

    it('cita cada fonte uma vez e traz as limitações da base', () => {
        const relatorio = montar();
        expect(relatorio.fontes).toEqual(['FipeZap, set/2026', 'Atlas, 2023']);
        expect(relatorio.limitacoes.length).toBeGreaterThan(0);
    });
});

describe('textoParaCompartilhar', () => {
    it('resume as três primeiras cidades com o match', () => {
        const relatorio = montar();
        const texto = textoParaCompartilhar(relatorio);
        expect(texto).toContain('MoradIA');
        relatorio.ranking.slice(0, 3).forEach(({ posicao, cidade, match }) => {
            expect(texto).toContain(`${posicao}. ${cidade}: ${match}% de match`);
        });
        expect(texto.split('\n').filter((linha) => /^\d+\. /.test(linha)).length).toBeLessThanOrEqual(3);
    });
});
