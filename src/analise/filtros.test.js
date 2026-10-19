import { describe, expect, it } from 'vitest';
import { criarRespostasIniciais } from './respostas.js';
import { aluguelDoDomicilio, aplicarFiltros, distanciaKm, filtroMaisRestritivo, porteDaCidade } from './filtros.js';
import { cidades as fixture } from '../dados/cidadesFixture.js';

const curitiba = { nome: 'Curitiba', regiao: 'S', lat: -25.43, lon: -49.27, populacao: 1773718, litoranea: false, indicadores: { aluguel: { 1: 1800, 2: 2400, 3: 3000, 4: 3500 } } };
const salvador = { nome: 'Salvador', regiao: 'NE', lat: -12.97, lon: -38.50, populacao: 2417678, litoranea: true, indicadores: { aluguel: { 1: 1500, 2: 2000, 3: 2600, 4: 3100 } } };
const joinville = { nome: 'Joinville', regiao: 'S', lat: -26.30, lon: -48.85, populacao: 616317, litoranea: false, indicadores: { aluguel: { 1: 1400, 2: 1900, 3: 2400, 4: 2800 } } };
const santos = { nome: 'Santos', regiao: 'SE', lat: -23.96, lon: -46.33, populacao: 418608, litoranea: true, indicadores: { aluguel: { 1: 2200, 2: 2900, 3: 3600, 4: 4200 } } };
const cidades = [curitiba, salvador, joinville, santos];

const nomes = (lista) => lista.map(({ nome }) => nome);

function respostasCom({ orcamento, onde, domicilio } = {}) {
    const base = criarRespostasIniciais();
    return {
        ...base,
        domicilio: { ...base.domicilio, ...domicilio },
        orcamento: { ...base.orcamento, ...orcamento },
        onde: { ...base.onde, ...onde },
    };
}

describe('porteDaCidade', () => {
    it('classifica pelos limites de população', () => {
        expect(porteDaCidade(1_000_000)).toBe('metropole');
        expect(porteDaCidade(999_999)).toBe('grande');
        expect(porteDaCidade(500_000)).toBe('grande');
        expect(porteDaCidade(499_999)).toBe('media');
    });
});

describe('distanciaKm', () => {
    it('calcula a distância em linha reta', () => {
        const km = distanciaKm(curitiba, joinville);
        expect(km).toBeGreaterThan(100);
        expect(km).toBeLessThan(112);
        expect(distanciaKm(curitiba, curitiba)).toBe(0);
    });
});

describe('aluguelDoDomicilio', () => {
    it('usa o aluguel do número de pessoas', () => {
        expect(aluguelDoDomicilio(curitiba, { moradia: 'parceiro', filhosEscolares: false })).toBe(2400);
        expect(aluguelDoDomicilio(curitiba, { moradia: 'familia', filhosEscolares: true })).toBe(3500);
    });

    it('usa metade do aluguel de 2 pessoas para quem divide com amigos', () => {
        expect(aluguelDoDomicilio(curitiba, { moradia: 'amigos', filhosEscolares: false })).toBe(1200);
    });

    it('retorna null quando a cidade não tem aluguel nenhum (município sem Censo 2010)', () => {
        const semAluguel = { ...curitiba, indicadores: { aluguel: null } };
        expect(aluguelDoDomicilio(semAluguel, { moradia: 'sozinho', filhosEscolares: false })).toBeNull();
        expect(aluguelDoDomicilio(semAluguel, { moradia: 'amigos', filhosEscolares: false })).toBeNull();
    });

    it('retorna null quando o dado não existe', () => {
        const semDado = { ...curitiba, indicadores: { aluguel: { 1: null, 2: null, 3: null, 4: null } } };
        expect(aluguelDoDomicilio(semDado, { moradia: 'sozinho', filhosEscolares: false })).toBeNull();
    });
});

describe('aplicarFiltros', () => {
    it('com respostas neutras, mantém todas as cidades', () => {
        expect(aplicarFiltros(criarRespostasIniciais(), cidades)).toHaveLength(4);
    });

    it('elimina cidades com aluguel acima do teto com 10% de tolerância', () => {
        const r = respostasCom({ orcamento: { faixaRenda: 'r4a7', tetoMoradia: 1600 } });
        expect(nomes(aplicarFiltros(r, cidades))).toEqual(['Salvador', 'Joinville']);
    });

    it('aplica o teto ao aluguel compartilhado de quem mora com amigos', () => {
        const r = respostasCom({ domicilio: { moradia: 'amigos' }, orcamento: { faixaRenda: 'r2a4', tetoMoradia: 1000 } });
        expect(nomes(aplicarFiltros(r, cidades))).toEqual(['Salvador', 'Joinville']);
    });

    it('não elimina cidade com aluguel indisponível', () => {
        const semDado = { ...santos, nome: 'Sem dado', indicadores: { aluguel: { 1: null, 2: null, 3: null, 4: null } } };
        const r = respostasCom({ orcamento: { faixaRenda: 'r0a2', tetoMoradia: 500 } });
        expect(nomes(aplicarFiltros(r, [...cidades, semDado]))).toEqual(['Sem dado']);
    });

    it('filtra por região, porte e praia', () => {
        expect(nomes(aplicarFiltros(respostasCom({ onde: { regioes: ['S'] } }), cidades))).toEqual(['Curitiba', 'Joinville']);
        expect(nomes(aplicarFiltros(respostasCom({ onde: { portes: ['media'] } }), cidades))).toEqual(['Santos']);
        expect(nomes(aplicarFiltros(respostasCom({ onde: { praia: 'indispensavel' } }), cidades))).toEqual(['Salvador', 'Santos']);
    });

    it('não filtra por praia quando ela só "seria bom"', () => {
        expect(aplicarFiltros(respostasCom({ onde: { praia: 'bom' } }), cidades)).toHaveLength(4);
    });

    it('filtra pela distância da cidade de referência', () => {
        // Joinville fica a ~106 km e Santos a ~340 km de Curitiba.
        const referencia = { cidade: 'Curitiba, PR', lat: -25.43, lon: -49.27, raioKm: 300 };
        expect(nomes(aplicarFiltros(respostasCom({ onde: { referencia } }), cidades))).toEqual(['Curitiba', 'Joinville']);
        const pertinho = { ...referencia, raioKm: 100 };
        expect(nomes(aplicarFiltros(respostasCom({ onde: { referencia: pertinho } }), cidades))).toEqual(['Curitiba']);
    });

    it('ignora a referência enquanto ela não tem coordenadas', () => {
        const referencia = { cidade: null, lat: null, lon: null, raioKm: 100 };
        expect(aplicarFiltros(respostasCom({ onde: { referencia } }), cidades)).toHaveLength(4);
    });

    it('funciona com a fixture completa', () => {
        const r = respostasCom({ onde: { regioes: ['NE'], praia: 'indispensavel' } });
        expect(nomes(aplicarFiltros(r, fixture))).toEqual(['Salvador', 'Fortaleza', 'Recife', 'Natal']);
    });
});

describe('filtroMaisRestritivo', () => {
    it('indica o filtro que, removido, devolve mais cidades', () => {
        const r = respostasCom({ onde: { regioes: ['S', 'NE'], praia: 'indispensavel' } });
        expect(filtroMaisRestritivo(r, cidades)).toEqual({ id: 'praia', rotulo: 'Praia indispensável', cidadesSem: 3 });
    });

    it('aponta um filtro mesmo quando o resultado zerou', () => {
        const r = respostasCom({ onde: { regioes: ['S'], praia: 'indispensavel' } });
        expect(aplicarFiltros(r, cidades)).toHaveLength(0);
        expect(filtroMaisRestritivo(r, cidades)?.cidadesSem).toBe(2);
    });

    it('retorna null sem filtros ativos', () => {
        expect(filtroMaisRestritivo(criarRespostasIniciais(), cidades)).toBeNull();
    });
});
