import { describe, expect, it } from 'vitest';
import { alternarCidade, detalharSalvas } from './cidadesSalvas.js';

describe('alternarCidade', () => {
    it('adiciona a cidade que não está salva', () => {
        expect(alternarCidade(['Curitiba, PR'], 'Santos, SP')).toEqual(['Curitiba, PR', 'Santos, SP']);
    });

    it('remove a cidade que já está salva', () => {
        expect(alternarCidade(['Curitiba, PR', 'Santos, SP'], 'Curitiba, PR')).toEqual(['Santos, SP']);
    });
});

describe('detalharSalvas', () => {
    const curitiba = { ibge: 1, nome: 'Curitiba', uf: 'PR' };
    const santos = { ibge: 2, nome: 'Santos', uf: 'SP' };
    const cidades = [curitiba, santos];
    const avaliadas = [{ ibge: 1, match: 80 }, { ibge: 2, match: 60 }];
    const ranking = [{ ibge: 1, match: 80 }];

    it('junta a cidade, o match e a posição no ranking', () => {
        const [item] = detalharSalvas(['Curitiba, PR'], cidades, avaliadas, ranking);
        expect(item.cidade).toBe(curitiba);
        expect(item.resultado.match).toBe(80);
        expect(item.posicao).toBe(0);
    });

    it('marca como fora do ranking a cidade eliminada pelos filtros', () => {
        const [item] = detalharSalvas(['Santos, SP'], cidades, avaliadas, ranking);
        expect(item.resultado.match).toBe(60);
        expect(item.posicao).toBeNull();
    });

    it('aceita município fora da base', () => {
        expect(detalharSalvas(['Paraty, RJ'], cidades, avaliadas, ranking)[0])
            .toEqual({ nome: 'Paraty, RJ', cidade: null, resultado: null, posicao: null });
    });

    it('funciona sem nenhuma análise', () => {
        const [item] = detalharSalvas(['Curitiba, PR'], cidades, null, null);
        expect(item.cidade).toBe(curitiba);
        expect(item.resultado).toBeNull();
        expect(item.posicao).toBeNull();
    });
});
