import { describe, expect, it } from 'vitest';
import { coordenadasDe } from './coordenadas.js';
import municipios from '../dados/municipios.json';
import coordenadas from '../dados/coordenadasMunicipios.json';

describe('coordenadasDe', () => {
    it('encontra as coordenadas de uma cidade da busca', async () => {
        const curitiba = await coordenadasDe('Curitiba, PR');
        expect(curitiba.lat).toBeCloseTo(-25.42, 1);
        expect(curitiba.lon).toBeCloseTo(-49.27, 1);
    });

    it('retorna null para cidade desconhecida', async () => {
        expect(await coordenadasDe('Cidade Inventada, XX')).toBeNull();
    });

    it('cobre todos os nomes usados na busca de cidades', () => {
        expect(municipios.filter((nome) => !coordenadas[nome])).toEqual([]);
    });
});
