import { describe, expect, it } from 'vitest';
import { validarBase } from './validacao.mjs';

const cidade = (ibge, nome, uf, { tempMesFrio, litoranea, estimados = [] }) => ({
    ibge, nome, uf, litoranea, estimados,
    indicadores: { aluguel: { 1: 1000, 2: 1400, 3: 1800, 4: 2100 }, tempMesFrio, homicidios100k: 20, medicos1k: null },
});

const coerentes = () => [
    cidade(1, 'Curitiba', 'PR', { tempMesFrio: 13.6, litoranea: false }),
    cidade(2, 'Porto Alegre', 'RS', { tempMesFrio: 13.5, litoranea: false }),
    cidade(3, 'Fortaleza', 'CE', { tempMesFrio: 26, litoranea: true }),
    cidade(4, 'Salvador', 'BA', { tempMesFrio: 24.5, litoranea: true }),
    cidade(5, 'Florianópolis', 'SC', { tempMesFrio: 16.5, litoranea: true }),
    cidade(6, 'Rio de Janeiro', 'RJ', { tempMesFrio: 21, litoranea: true }),
    cidade(7, 'Brasília', 'DF', { tempMesFrio: 19, litoranea: false }),
    cidade(8, 'Belo Horizonte', 'MG', { tempMesFrio: 18.5, litoranea: false, estimados: ['aluguel'] }),
];
const ibgesFipezap = new Set([1, 2, 3, 4, 5, 6, 7]);
const validar = (cidades) => validarBase({ cidades }, { ibgesFipezap, minimo: 1 });

describe('validarBase', () => {
    it('aceita uma base coerente', () => {
        expect(validar(coerentes())).toEqual([]);
    });

    it('acusa Curitiba mais quente que Fortaleza', () => {
        const cidades = coerentes().map((c) => (c.nome === 'Curitiba' ? { ...c, indicadores: { ...c.indicadores, tempMesFrio: 27 } } : c));
        expect(validar(cidades).some((erro) => erro.includes('Curitiba'))).toBe(true);
    });

    it('acusa cidade do FipeZap marcada como estimada', () => {
        const cidades = coerentes().map((c) => (c.nome === 'Salvador' ? { ...c, estimados: ['aluguel'] } : c));
        expect(validar(cidades).some((erro) => erro.includes('Salvador'))).toBe(true);
    });

    it('acusa número de cidades fora do intervalo', () => {
        expect(validarBase({ cidades: coerentes() }, { ibgesFipezap }).some((erro) => erro.includes('8 cidades'))).toBe(true);
    });
});
