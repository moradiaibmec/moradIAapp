import { describe, expect, it } from 'vitest';
import { aplicarFaixas, montarBase, montarCidade } from './montagem.mjs';

const identidade = { ibge: 1, nome: 'Teste', uf: 'PR', regiao: 'S', lat: -25, lon: -49, populacao: 200000, litoranea: false };

describe('aplicarFaixas', () => {
    it('anula valores fora da faixa ou negativos e diz quais foram', () => {
        const { indicadores, foraDaFaixa } = aplicarFaixas({ tempMedia: 45, homicidios100k: 12, leitos1k: -1 });
        expect(indicadores).toEqual({ tempMedia: null, homicidios100k: 12, leitos1k: null });
        expect(foraDaFaixa).toEqual(['tempMedia', 'leitos1k']);
    });

    it('aceita Ideb acima de 9, como o de Sobral (9,6)', () => {
        expect(aplicarFaixas({ idebIniciais: 9.6 }).indicadores.idebIniciais).toBe(9.6);
    });

    it('aceita crescimento de emprego negativo', () => {
        expect(aplicarFaixas({ crescimentoEmprego: -3.2 }).indicadores.crescimentoEmprego).toBe(-3.2);
    });
});

describe('montarCidade', () => {
    it('monta a cidade mesmo sem os dados de uma fonte, deixando os campos como null', () => {
        const cidade = montarCidade(identidade, [{ homicidios100k: 10 }, { lazer1k: 30 }], []);
        expect(cidade.indicadores.tempMedia).toBeNull();
        expect(cidade.indicadores.medicos1k).toBeNull();
        expect(cidade.indicadores.homicidios100k).toBe(10);
        expect(cidade.estimados).toEqual([]);
        expect(cidade.nome).toBe('Teste');
    });
});

describe('montarBase', () => {
    it('ordena por código IBGE e registra a versão pelo mês da geração', () => {
        const base = montarBase([{ ibge: 2 }, { ibge: 1 }], { x: {} }, new Date('2026-10-19T12:00:00Z'));
        expect(base.cidades.map((c) => c.ibge)).toEqual([1, 2]);
        expect(base.versaoDados).toBe('2026-10');
        expect(base.geradoEm).toBe('2026-10-19T12:00:00.000Z');
    });
});
