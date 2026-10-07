import { describe, expect, it } from 'vitest';
import { marcarReferenciaPendente, resolverReferencia } from './referencia.js';

const curitiba = { lat: -25.42, lon: -49.26 };
const pendente = (cidade, raioKm = 300) => ({ cidade, lat: null, lon: null, raioKm });

describe('marcarReferenciaPendente', () => {
    it('guarda a cidade escolhida, ainda sem coordenadas', () => {
        expect(marcarReferenciaPendente(pendente(null), 'Curitiba, PR')).toEqual(pendente('Curitiba, PR'));
    });

    it('não reativa a referência se a pessoa já respondeu "Não"', () => {
        expect(marcarReferenciaPendente(null, 'Curitiba, PR')).toBeNull();
    });
});

describe('resolverReferencia', () => {
    it('preenche as coordenadas da cidade pendente mantendo o raio atual', () => {
        expect(resolverReferencia(pendente('Curitiba, PR', 100), 'Curitiba, PR', curitiba))
            .toEqual({ cidade: 'Curitiba, PR', ...curitiba, raioKm: 100 });
    });

    it('descarta o resultado se a pessoa respondeu "Não" durante o carregamento', () => {
        expect(resolverReferencia(null, 'Curitiba, PR', curitiba)).toBeNull();
    });

    it('descarta o resultado se outra cidade foi escolhida durante o carregamento', () => {
        const atual = pendente('Joinville, SC');
        expect(resolverReferencia(atual, 'Curitiba, PR', curitiba)).toBe(atual);
    });

    it('volta para a busca quando a cidade não tem coordenadas', () => {
        expect(resolverReferencia(pendente('Curitiba, PR', 100), 'Curitiba, PR', null)).toEqual(pendente(null, 100));
    });
});
