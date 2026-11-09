import { describe, expect, it } from 'vitest';
import { alternarCidade, destaquesDasSalvas, detalharSalvas, ordenarSalvas } from './cidadesSalvas.js';

describe('alternarCidade', () => {
    it('adiciona a cidade que não está salva', () => {
        expect(alternarCidade(['Curitiba, PR'], 'Santos, SP')).toEqual(['Curitiba, PR', 'Santos, SP']);
    });

    it('remove a cidade que já está salva', () => {
        expect(alternarCidade(['Curitiba, PR', 'Santos, SP'], 'Curitiba, PR')).toEqual(['Santos, SP']);
    });
});

describe('detalharSalvas', () => {
    const curitiba = { ibge: 1, nome: 'Curitiba', uf: 'PR' };
    const santos = { ibge: 2, nome: 'Santos', uf: 'SP' };
    const cidades = [curitiba, santos];
    const avaliadas = [{ ibge: 1, match: 80 }, { ibge: 2, match: 60 }];
    const ranking = [{ ibge: 1, match: 80 }];

    it('junta a cidade, o match e a posição no ranking', () => {
        const [item] = detalharSalvas(['Curitiba, PR'], cidades, avaliadas, ranking);
        expect(item.cidade).toBe(curitiba);
        expect(item.resultado.match).toBe(80);
        expect(item.posicao).toBe(0);
    });

    it('marca como fora do ranking a cidade eliminada pelos filtros', () => {
        const [item] = detalharSalvas(['Santos, SP'], cidades, avaliadas, ranking);
        expect(item.resultado.match).toBe(60);
        expect(item.posicao).toBeNull();
    });

    it('aceita município fora da base', () => {
        expect(detalharSalvas(['Paraty, RJ'], cidades, avaliadas, ranking)[0])
            .toEqual({ nome: 'Paraty, RJ', cidade: null, resultado: null, posicao: null });
    });

    it('funciona sem nenhuma análise', () => {
        const [item] = detalharSalvas(['Curitiba, PR'], cidades, null, null);
        expect(item.cidade).toBe(curitiba);
        expect(item.resultado).toBeNull();
        expect(item.posicao).toBeNull();
    });
});

describe('ordenarSalvas', () => {
    const item = (nome, match, aluguel, populacao) => ({
        nome,
        cidade: populacao ? { populacao } : null,
        resultado: match ? { match } : null,
        aluguel,
    });
    const itens = [
        item('Santos, SP', 60, 2500, 400_000),
        item('Paraty, RJ', null, null, null),
        item('Curitiba, PR', 80, 2000, 1_800_000),
        item('Bauru, SP', 70, null, 380_000),
    ];
    const nomes = (lista) => lista.map(({ nome }) => nome);

    it('ordena pelo maior match, com quem não tem match no fim', () => {
        expect(nomes(ordenarSalvas(itens, 'match'))).toEqual(['Curitiba, PR', 'Bauru, SP', 'Santos, SP', 'Paraty, RJ']);
    });

    it('ordena pelo menor aluguel', () => {
        expect(nomes(ordenarSalvas(itens, 'aluguel'))).toEqual(['Curitiba, PR', 'Santos, SP', 'Paraty, RJ', 'Bauru, SP']);
    });

    it('ordena pela maior população e pelo nome', () => {
        expect(nomes(ordenarSalvas(itens, 'populacao'))).toEqual(['Curitiba, PR', 'Santos, SP', 'Bauru, SP', 'Paraty, RJ']);
        expect(nomes(ordenarSalvas(itens, 'nome'))).toEqual(['Bauru, SP', 'Curitiba, PR', 'Paraty, RJ', 'Santos, SP']);
    });

    it('não altera a lista original', () => {
        ordenarSalvas(itens, 'nome');
        expect(itens[0].nome).toBe('Santos, SP');
    });
});

describe('destaquesDasSalvas', () => {
    const item = (nome, match, aluguel) => ({ nome, resultado: match ? { match } : null, aluguel });

    it('junta os dois selos quando a mesma cidade vence nos dois', () => {
        const selos = destaquesDasSalvas([item('A', 80, 2000), item('B', 70, 2500)]);
        expect([...selos]).toEqual([['A', 'Maior match e menor aluguel']]);
    });

    it('separa os selos entre cidades diferentes', () => {
        const selos = destaquesDasSalvas([item('A', 80, 3000), item('B', 70, 2500)]);
        expect(selos.get('A')).toBe('Maior match');
        expect(selos.get('B')).toBe('Menor aluguel');
    });

    it('não marca nada com uma cidade só ou sem análise', () => {
        expect(destaquesDasSalvas([item('A', 80, 2000)]).size).toBe(0);
        expect(destaquesDasSalvas([item('A', null, null), item('B', null, null)]).size).toBe(0);
    });
});
