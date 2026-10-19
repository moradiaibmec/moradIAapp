import { describe, expect, it } from 'vitest';
import { casarAbasFipezap } from './fipezap.mjs';

const municipios = [
    { ibge: 4106902, nome: 'Curitiba', uf: 'PR' },
    { ibge: 4216602, nome: 'São José', uf: 'SC' },
    { ibge: 3549904, nome: 'São José dos Campos', uf: 'SP' },
    { ibge: 4125506, nome: 'São José dos Pinhais', uf: 'PR' },
];

describe('casarAbasFipezap', () => {
    it('casa pelo nome e pela UF da aba, sem confundir homônimos', () => {
        const { casadas, naoEncontradas } = casarAbasFipezap(['Curitiba', 'São José', 'Cidade Fantasma'], municipios);
        expect(casadas.get('Curitiba')).toBe(4106902);
        expect(casadas.get('São José')).toBe(4216602);
        expect(naoEncontradas).toEqual(['Cidade Fantasma']);
    });
});
