import { describe, expect, it } from 'vitest';
import {
    CENARIOS_MORADIA, GASTOS_ZERADOS, aluguelDoCenario, cenarioDoDomicilio, lerValor, simular,
} from './simulador.js';

const cidade = { indicadores: { aluguel: { 1: 1000, 2: 1400, 3: 1800, 4: 2200 } } };

describe('cenarioDoDomicilio', () => {
    it('separa a família com filhos na escola', () => {
        expect(cenarioDoDomicilio({ moradia: 'familia', filhosEscolares: true })).toBe('familiaFilhos');
        expect(cenarioDoDomicilio({ moradia: 'familia', filhosEscolares: false })).toBe('familia');
    });

    it('usa "sozinho" quando a etapa foi pulada', () => {
        expect(cenarioDoDomicilio({ moradia: null, filhosEscolares: false })).toBe('sozinho');
    });
});

describe('aluguelDoCenario', () => {
    it('lê o aluguel da base para cada cenário', () => {
        const alugueis = CENARIOS_MORADIA.map(({ id }) => aluguelDoCenario(cidade, id));
        expect(alugueis).toEqual([1000, 1400, 1800, 2200, 700]);
    });

    it('devolve nulo sem dado de aluguel', () => {
        expect(aluguelDoCenario({ indicadores: { aluguel: null } }, 'sozinho')).toBeNull();
    });
});

describe('lerValor', () => {
    it('considera só os dígitos', () => {
        expect(lerValor('R$ 3.500')).toBe(3500);
    });

    it('trata vazio como zero', () => {
        expect(lerValor('')).toBe(0);
    });
});

describe('simular', () => {
    it('desconta o aluguel e os gastos informados da renda', () => {
        const { despesas, saldo, fatiaSaldo } = simular({
            renda: 5000, aluguel: 1000, gastos: { ...GASTOS_ZERADOS, alimentacao: 800, transporte: 200 },
        });
        expect(despesas).toBe(2000);
        expect(saldo).toBe(3000);
        expect(fatiaSaldo).toBe(60);
    });

    it('lista só os gastos preenchidos, com a moradia sempre presente', () => {
        const { itens } = simular({ renda: 5000, aluguel: 1000, gastos: { ...GASTOS_ZERADOS, contas: 300 } });
        expect(itens.map(({ id }) => id)).toEqual(['moradia', 'contas']);
        expect(itens[0].fatia).toBe(20);
    });

    it('avisa quando o aluguel passa de 30% da renda', () => {
        expect(simular({ renda: 3000, aluguel: 1000, gastos: GASTOS_ZERADOS }).acimaDoLimite).toBe(true);
        expect(simular({ renda: 3000, aluguel: 900, gastos: GASTOS_ZERADOS }).acimaDoLimite).toBe(false);
    });

    it('permite saldo negativo', () => {
        expect(simular({ renda: 1000, aluguel: 1500, gastos: GASTOS_ZERADOS }).saldo).toBe(-500);
    });

    it('não calcula saldo sem renda ou sem aluguel', () => {
        expect(simular({ renda: null, aluguel: 1000, gastos: GASTOS_ZERADOS }).saldo).toBeNull();
        expect(simular({ renda: 0, aluguel: 1000, gastos: GASTOS_ZERADOS }).saldo).toBeNull();
        expect(simular({ renda: 5000, aluguel: null, gastos: GASTOS_ZERADOS }).saldo).toBeNull();
    });
});
