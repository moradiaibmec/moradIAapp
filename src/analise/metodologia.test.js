import { describe, expect, it } from 'vitest';
import { PILARES } from './opcoes.js';
import { PASSOS, criteriosDaMetodologia, fontesDoPilar, limitacoes, resumoDaBase } from './metodologia.js';

const fontes = {
    empregoPerCapita: { nome: 'IBGE', periodo: '2024', url: 'https://ibge' },
    crescimentoEmprego: { nome: 'IBGE', periodo: '2024', url: 'https://ibge' },
    aluguel: { nome: 'FipeZap', periodo: '2026', url: 'https://fipe' },
};

describe('fontesDoPilar', () => {
    it('não repete a mesma fonte', () => {
        expect(fontesDoPilar('trabalho', fontes)).toHaveLength(1);
    });

    it('fica vazia sem fontes', () => {
        expect(fontesDoPilar('clima')).toEqual([]);
    });
});

describe('criteriosDaMetodologia', () => {
    it('explica todos os pilares do score', () => {
        const criterios = criteriosDaMetodologia(fontes);
        expect(criterios.map(({ id }) => id)).toEqual(PILARES.map(({ id }) => id));
        for (const { mede, nota } of criterios) {
            expect(mede).toBeTruthy();
            expect(nota).toBeTruthy();
        }
    });
});

describe('resumoDaBase', () => {
    const cidades = [{ estimados: ['aluguel'] }, { estimados: ['aluguel'] }, { estimados: [] }, {}];

    it('conta cidades, fontes distintas e aluguel estimado', () => {
        expect(resumoDaBase({ cidades, fontes })).toMatchObject({
            totalCidades: 4, totalFontes: 2, aluguelEstimado: 2, aluguelMedido: 2,
        });
    });
});

describe('textos', () => {
    it('usa os números do motor nos passos', () => {
        const texto = PASSOS.map((passo) => passo.texto).join(' ');
        expect(texto).toContain('Essencial vale 3');
        expect(texto).toContain('0,85');
        expect(texto).toContain('10% de tolerância');
    });

    it('usa os números da base nas limitações', () => {
        expect(limitacoes({ totalCidades: 319, aluguelEstimado: 283, aluguelMedido: 36 })[0]).toContain('283 das 319');
    });
});
