import { describe, expect, it } from 'vitest';
import { aluguelPorTamanho, calibrarFator, estimarM2, medianaAluguel2010 } from './aluguel.mjs';

describe('medianaAluguel2010', () => {
    it('interpola a mediana dentro da faixa (dados reais de Curitiba, Censo 2010)', () => {
        expect(medianaAluguel2010([68, 839, 18737, 55902, 35085, 6434, 2631, 683])).toBeCloseTo(439.95, 1);
    });

    it('devolve null quando não há domicílios alugados', () => {
        expect(medianaAluguel2010([0, 0, 0, 0, 0, 0, 0, 0])).toBeNull();
    });
});

describe('calibrarFator e estimarM2', () => {
    it('usa a mediana das razões entre o aluguel atual de 55 m² e a mediana de 2010', () => {
        const pares = [{ mediana: 100, m2: 20 }, { mediana: 200, m2: 30 }, { mediana: 400, m2: 40 }];
        // razões m2 × 55 ÷ mediana: 11; 8,25; 5,5 → mediana 8,25
        expect(calibrarFator(pares)).toBeCloseTo(8.25, 6);
    });

    it('preserva a ordem do Censo 2010 entre as cidades estimadas', () => {
        expect(estimarM2(8.25, 200)).toBeCloseTo(30, 6);
        expect(estimarM2(8.25, 100)).toBeLessThan(estimarM2(8.25, 200));
    });
});

describe('aluguelPorTamanho', () => {
    it('converte R$/m² em aluguel por número de pessoas', () => {
        expect(aluguelPorTamanho(50)).toEqual({ 1: 2000, 2: 2750, 3: 3500, 4: 4250 });
    });
});
