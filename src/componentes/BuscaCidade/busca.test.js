import { describe, expect, it } from 'vitest';
import { buscarCidades, normalizar } from './busca.js';
import municipios from '../../dados/municipios.json';

describe('normalizar', () => {
    it('ignora acentos, maiúsculas e espaços nas pontas', () => {
        expect(normalizar('  São Paulo ')).toBe('sao paulo');
    });
});

describe('buscarCidades', () => {
    it('coloca o nome exato primeiro', () => {
        expect(buscarCidades(municipios, 'sao paulo')[0]).toBe('São Paulo, SP');
        expect(buscarCidades(municipios, 'campinas')[0]).toBe('Campinas, SP');
    });

    it('prioriza capitais entre os nomes que começam com o termo', () => {
        expect(buscarCidades(municipios, 'rio').slice(0, 2)).toEqual(['Rio Branco, AC', 'Rio de Janeiro, RJ']);
    });

    it('encontra também nomes que só contêm o termo, depois dos que começam com ele', () => {
        expect(buscarCidades(municipios, 'curit')).toEqual(['Curitiba, PR', 'Curitibanos, SC', 'Bacurituba, MA', 'Urucurituba, AM']);
    });

    it('limita a 8 sugestões e devolve vazio sem termo ou sem resultado', () => {
        expect(buscarCidades(municipios, 'sao')).toHaveLength(8);
        expect(buscarCidades(municipios, '   ')).toEqual([]);
        expect(buscarCidades(municipios, 'xyzw')).toEqual([]);
    });
});
