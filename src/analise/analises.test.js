import { describe, expect, it } from 'vitest';
import { montarAnalise, paraHistorico } from './analises.js';
import { criarRespostasIniciais, VERSAO_QUESTIONARIO } from './respostas.js';

const resultado = (cidade, match) => ({
    ibge: 1, cidade, match, pontosFortes: ['clima'], pontosAtencao: [],
    notas: { clima: { nota: 90, peso: 'importante', bruto: 20, dadoIndisponivel: false } },
});

describe('montarAnalise', () => {
    it('guarda as respostas, as versões e só o top 10 sem as notas detalhadas', () => {
        const respostas = criarRespostasIniciais();
        const resultados = Array.from({ length: 12 }, (_, i) => resultado(`Cidade ${i}, UF`, 90 - i));
        const analise = montarAnalise(respostas, resultados, 'fixture');

        expect(analise.versao_questionario).toBe(VERSAO_QUESTIONARIO);
        expect(analise.versao_dados).toBe('fixture');
        expect(analise.respostas).toBe(respostas);
        expect(analise.resultados).toHaveLength(10);
        expect(analise.resultados[0]).toEqual({ ibge: 1, cidade: 'Cidade 0, UF', match: 90, pontosFortes: ['clima'], pontosAtencao: [] });
    });
});

describe('paraHistorico', () => {
    it('converte a linha do banco no formato usado pelos indicadores do Dashboard', () => {
        const linha = {
            id: 'abc', criada_em: '2026-10-19T14:30:00+00:00', respostas: { versao: 1 },
            resultados: [{ ibge: 1, cidade: 'Belo Horizonte, MG', match: 82 }, { ibge: 2, cidade: 'Campina Grande, PB', match: 70 }],
        };
        expect(paraHistorico(linha)).toEqual({
            id: 'abc',
            data: '2026-10-19T14:30:00+00:00',
            respostas: { versao: 1 },
            cidades: [{ nome: 'Belo Horizonte', uf: 'MG', match: 82 }, { nome: 'Campina Grande', uf: 'PB', match: 70 }],
        });
    });
});
