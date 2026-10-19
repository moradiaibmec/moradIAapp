import { describe, expect, it } from 'vitest';
import { ajustarRegressao, aluguelPorTamanho, medianaAluguel2010, preverM2 } from './aluguel.mjs';

describe('medianaAluguel2010', () => {
    it('interpola a mediana dentro da faixa (dados reais de Curitiba, Censo 2010)', () => {
        expect(medianaAluguel2010([68, 839, 18737, 55902, 35085, 6434, 2631, 683])).toBeCloseTo(439.95, 1);
    });

    it('devolve null quando não há domicílios alugados', () => {
        expect(medianaAluguel2010([0, 0, 0, 0, 0, 0, 0, 0])).toBeNull();
    });
});

describe('ajustarRegressao e preverM2', () => {
    it('recupera a reta em escala log', () => {
        const pares = [100, 400, 900].map((x) => ({ x, y: Math.exp(1 + 0.5 * Math.log(x)) }));
        const regressao = ajustarRegressao(pares);
        expect(regressao.a).toBeCloseTo(1, 6);
        expect(regressao.b).toBeCloseTo(0.5, 6);
        expect(regressao.r2).toBeCloseTo(1, 6);
        expect(regressao.n).toBe(3);
        expect(preverM2(regressao, 400)).toBeCloseTo(Math.exp(1) * 20, 6);
    });
});

describe('aluguelPorTamanho', () => {
    it('converte R$/m² em aluguel por número de pessoas', () => {
        expect(aluguelPorTamanho(50)).toEqual({ 1: 2000, 2: 2750, 3: 3500, 4: 4250 });
    });
});
