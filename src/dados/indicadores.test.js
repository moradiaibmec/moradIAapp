import { describe, expect, it } from 'vitest';
import { calcularIndicadores, tracosPreenchidos } from './indicadores.js';

const curitiba = (match) => ({ ibge: 4106902, nome: 'Curitiba', uf: 'PR', match });
const maringa = (match) => ({ ibge: 4115200, nome: 'Maringá', uf: 'PR', match });

const analises = [
    { id: 'antiga', data: '2026-09-01T10:00:00Z', cidades: [curitiba(80), maringa(70)] },
    { id: 'recente', data: '2026-11-01T10:00:00Z', cidades: [maringa(90), curitiba(60)] },
    { id: 'meio', data: '2026-10-01T10:00:00Z', cidades: [curitiba(84)] },
];

describe('calcularIndicadores', () => {
    it('identifica a cidade mais recomendada e a análise mais recente em que ela venceu', () => {
        expect(calcularIndicadores(analises).cidadeMaisRecomendada).toEqual({
            cidade: 'Curitiba, PR', ibge: 4106902, vezes: 2, idAnalise: 'meio',
        });
    });

    it('no empate de vitórias, destaca a cidade que vem antes na lista (mais aparições)', () => {
        const empate = [
            { id: 'a', data: '2026-11-03T10:00:00Z', cidades: [curitiba(90)] },
            { id: 'b', data: '2026-11-02T10:00:00Z', cidades: [curitiba(80), maringa(70)] },
            { id: 'c', data: '2026-11-01T10:00:00Z', cidades: [maringa(80)] },
            { id: 'd', data: '2026-10-01T10:00:00Z', cidades: [maringa(85)] },
            { id: 'e', data: '2026-09-01T10:00:00Z', cidades: [{ ibge: 4113700, nome: 'Londrina', uf: 'PR', match: 85 }, maringa(60)] },
        ];
        const { cidadeMaisRecomendada, ranking } = calcularIndicadores(empate);
        expect(ranking[0].cidade).toBe('Maringá, PR');
        expect(cidadeMaisRecomendada).toEqual({ cidade: 'Maringá, PR', ibge: 4115200, vezes: 2, idAnalise: 'c' });
    });

    it('conta no ranking as vitórias de cada cidade, além das aparições', () => {
        const { ranking } = calcularIndicadores(analises);
        expect(ranking[0]).toEqual({ cidade: 'Curitiba, PR', ibge: 4106902, aparicoes: 3, vitorias: 2, matchMedio: 75 });
        expect(ranking[1]).toEqual({ cidade: 'Maringá, PR', ibge: 4115200, aparicoes: 2, vitorias: 1, matchMedio: 80 });
    });

    it('devolve todas as análises recentes, da mais nova para a mais antiga', () => {
        const { recentes } = calcularIndicadores(analises);
        expect(recentes.map(({ id }) => id)).toEqual(['recente', 'meio', 'antiga']);
        expect(recentes[0]).toMatchObject({ cidade: 'Maringá, PR', ibge: 4115200, match: 90 });
    });

    it('não quebra sem análises', () => {
        expect(calcularIndicadores([])).toMatchObject({ totalAnalises: 0, cidadeMaisRecomendada: null, melhorMatch: null, ranking: [], recentes: [] });
    });
});

describe('tracosPreenchidos', () => {
    it('é proporcional às aparições no total de traços', () => {
        expect(tracosPreenchidos(7, 16)).toBe(7);
        expect(tracosPreenchidos(16, 16)).toBe(16);
        expect(tracosPreenchidos(1, 2)).toBe(8);
    });

    it('preenche ao menos um traço para quem apareceu', () => {
        expect(tracosPreenchidos(1, 100)).toBe(1);
    });
});
