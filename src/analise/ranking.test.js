import { describe, expect, it } from 'vitest';
import { montarRanking } from './ranking.js';

const nota = (valor, dadoIndisponivel = false) => ({ nota: valor, dadoIndisponivel });
const resultados = [
    { cidade: 'São Paulo, SP', notas: { clima: nota(40), lazer: nota(90) } },
    { cidade: 'Curitiba, PR', notas: { clima: nota(80), lazer: nota(50, true) } },
    { cidade: 'Santos, SP', notas: { clima: nota(80), lazer: nota(60) } },
];
const nomes = (linhas) => linhas.map(({ resultado }) => resultado.cidade);

describe('montarRanking', () => {
    it('mantém a ordem do match por padrão', () => {
        expect(montarRanking(resultados).map(({ posicao }) => posicao)).toEqual([0, 1, 2]);
    });

    it('busca ignorando acentos e guarda a posição original', () => {
        const linhas = montarRanking(resultados, { termo: 'sao pa' });
        expect(nomes(linhas)).toEqual(['São Paulo, SP']);
        expect(montarRanking(resultados, { termo: 'santos' })[0].posicao).toBe(2);
    });

    it('busca também pela UF', () => {
        expect(nomes(montarRanking(resultados, { termo: 'pr' }))).toEqual(['Curitiba, PR']);
    });

    it('ordena pela nota do critério e desempata pela posição', () => {
        expect(nomes(montarRanking(resultados, { ordem: 'clima' }))).toEqual(['Curitiba, PR', 'Santos, SP', 'São Paulo, SP']);
    });

    it('deixa as cidades sem dado no fim', () => {
        expect(nomes(montarRanking(resultados, { ordem: 'lazer' })).at(-1)).toBe('Curitiba, PR');
    });

    it('não altera a lista recebida', () => {
        montarRanking(resultados, { ordem: 'clima' });
        expect(resultados[0].cidade).toBe('São Paulo, SP');
    });
});
