import { describe, expect, it } from 'vitest';
import { indicadoresEmprego, lazerPorMil } from './emprego.mjs';

describe('indicadoresEmprego', () => {
    it('calcula emprego por habitante, crescimento e participação dos setores', () => {
        const r = indicadoresEmprego({ total2022: 100, total2024: 110, porSecao: { J: 11, I: 10, L: 5, M: 5, N: 5, S: 5, C: 20 } }, 1000);
        expect(r.empregoPerCapita).toBeCloseTo(0.11, 6);
        expect(r.crescimentoEmprego).toBe(10);
        expect(r.empregoSetor.tecnologia).toBeCloseTo(0.1, 6);
        expect(r.empregoSetor.servicos).toBeCloseTo(0.2727, 4);
        expect(r.empregoSetor.industria).toBeCloseTo(0.1818, 4);
        expect(r.empregoSetor.agronegocio).toBe(0);
    });
});

describe('lazerPorMil', () => {
    it('soma alimentação e hospedagem (I) com artes, cultura e recreação (R) por mil habitantes', () => {
        expect(lazerPorMil({ I: 30, R: 8, C: 100 }, 1000)).toBe(38);
        expect(lazerPorMil({}, 1000)).toBeNull();
    });
});
