import { describe, expect, it } from 'vitest';
import { alugueisPorTamanho, citarFonte, comparacaoNaBase, setoresDaCidade } from './perfilCidade.js';

describe('comparacaoNaBase', () => {
    const cidades = [10, 20, 30, 40, 50].map((valor) => ({ valor }));
    const extrair = ({ valor }) => valor;

    it('compara o valor com as outras cidades', () => {
        expect(comparacaoNaBase(cidades, extrair, 50)).toBe('Maior que 100% das cidades da base');
        expect(comparacaoNaBase(cidades, extrair, 30, 'Mais caro')).toBe('Mais caro que 50% das cidades da base');
    });

    it('fica vazia sem dado', () => {
        expect(comparacaoNaBase(cidades, extrair, null)).toBe('');
    });
});

describe('alugueisPorTamanho', () => {
    it('lista os tamanhos com dado', () => {
        const cidade = { indicadores: { aluguel: { 1: 1000, 2: null, 3: 1800, 4: 2200 } } };
        expect(alugueisPorTamanho(cidade).map(({ pessoas }) => pessoas)).toEqual([1, 3, 4]);
    });

    it('fica vazio sem aluguel', () => {
        expect(alugueisPorTamanho({ indicadores: { aluguel: null } })).toEqual([]);
    });
});

describe('setoresDaCidade', () => {
    const cidade = { indicadores: { empregoSetor: { tecnologia: 0.03, comercio: 0.2, saude: null } } };

    it('ordena do maior para o menor e ignora setor sem dado', () => {
        expect(setoresDaCidade(cidade).map(({ id }) => id)).toEqual(['comercio', 'tecnologia']);
    });

    it('marca os setores escolhidos', () => {
        const [comercio, tecnologia] = setoresDaCidade(cidade, ['tecnologia']);
        expect(comercio.escolhido).toBe(false);
        expect(tecnologia.escolhido).toBe(true);
    });

    it('fica vazio sem dado de emprego', () => {
        expect(setoresDaCidade({ indicadores: {} })).toEqual([]);
    });
});

describe('citarFonte', () => {
    it('cita nome e período', () => {
        expect(citarFonte({ leitos1k: { nome: 'CNES', periodo: '2026' } }, 'leitos1k')).toBe('Fonte: CNES, 2026');
    });

    it('fica vazia sem a fonte', () => {
        expect(citarFonte({}, 'leitos1k')).toBe('');
        expect(citarFonte(undefined, 'leitos1k')).toBe('');
    });
});
