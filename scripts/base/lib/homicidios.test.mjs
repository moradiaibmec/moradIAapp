import { describe, expect, it } from 'vitest';
import { taxaHomicidios } from './homicidios.mjs';

describe('taxaHomicidios', () => {
    it('faz a média dos anos e converte para 100 mil habitantes (Curitiba, 2020–2022)', () => {
        expect(taxaHomicidios({ 2020: 336, 2021: 320, 2022: 361 }, 1773718)).toBeCloseTo(19.11, 2);
    });

    it('descarta o ano que destoa mais de 3 vezes da média dos outros', () => {
        expect(taxaHomicidios({ 2020: 2, 2021: 320, 2022: 361 }, 1773718)).toBeCloseTo(19.20, 2);
    });

    it('devolve null sem nenhum ano com dado', () => {
        expect(taxaHomicidios({ 2020: null, 2021: null, 2022: null }, 1000)).toBeNull();
    });
});
