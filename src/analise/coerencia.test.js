// O ranking sobre a base real precisa refletir o que a pessoa marcou (spec da base, "Validação").
import { describe, expect, it } from 'vitest';
import { PILARES } from './opcoes.js';
import { criarRespostasIniciais } from './respostas.js';
import { calcularMatch } from './match.js';
import base from '../dados/cidades.json';

const { cidades } = base;
const todosTantoFaz = Object.fromEntries(PILARES.map(({ id }) => [id, 'tantoFaz']));
const cidadeDe = (resultado) => cidades.find((c) => c.ibge === resultado.ibge);

function respostas(mudancas) {
    return { ...criarRespostasIniciais(), ...mudancas };
}

describe('coerência do ranking sobre a base real', () => {
    it('com inverno frio como único critério, as 10 primeiras têm mês mais frio até 15 °C', () => {
        const r = respostas({ clima: { temperatura: 'frio', chuvaIncomoda: false }, pesos: { ...todosTantoFaz, clima: 'essencial' } });
        const topo = calcularMatch(r, cidades).slice(0, 10).map(cidadeDe);
        for (const cidade of topo) expect(cidade.indicadores.tempMesFrio, cidade.nome).toBeLessThanOrEqual(15);
    });

    it('com segurança essencial e o resto em tanto faz, as 10 primeiras têm homicídios abaixo da mediana da base', () => {
        const taxas = cidades.map((c) => c.indicadores.homicidios100k).filter((t) => t !== null).sort((a, b) => a - b);
        const mediana = taxas[Math.floor(taxas.length / 2)];
        const r = respostas({ pesos: { ...todosTantoFaz, seguranca: 'essencial' } });
        const topo = calcularMatch(r, cidades).slice(0, 10).map(cidadeDe);
        for (const cidade of topo) expect(cidade.indicadores.homicidios100k, cidade.nome).toBeLessThan(mediana);
    });

    it('toda cidade fora do FipeZap tem o custo marcado como estimado', () => {
        for (const resultado of calcularMatch(respostas({}), cidades)) {
            expect(resultado.notas.custo.estimado, resultado.cidade).toBe(cidadeDe(resultado).estimados.includes('aluguel'));
        }
    });
});
