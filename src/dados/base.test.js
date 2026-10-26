import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const resposta = (corpo) => ({ ok: true, json: async () => corpo });
const ehFotos = (url) => String(url).includes('fotos');

// carregarBase guarda a promessa no módulo: cada teste importa uma cópia nova.
let carregarBase;

describe('carregarBase', () => {
    beforeEach(async () => {
        vi.resetModules();
        ({ carregarBase } = await import('./base.js'));
    });

    afterEach(() => vi.unstubAllGlobals());

    it('faz uma nova requisição quando a pessoa tenta de novo depois de uma falha', async () => {
        let pedidosDaBase = 0;
        const fetch = vi.fn((url) => {
            if (ehFotos(url)) return Promise.resolve(resposta({ fotos: {} }));
            pedidosDaBase += 1;
            return pedidosDaBase === 1 ? Promise.reject(new TypeError('Failed to fetch')) : Promise.resolve(resposta({ cidades: [{ ibge: 1 }] }));
        });
        vi.stubGlobal('fetch', fetch);

        await expect(carregarBase()).rejects.toThrow();
        await expect(carregarBase()).resolves.toEqual({ cidades: [{ ibge: 1, foto: null }] });
        expect(pedidosDaBase).toBe(2);
    });

    it('junta a foto de cada cidade pelo código IBGE', async () => {
        const foto = { url: 'https://upload.wikimedia.org/a.jpg' };
        vi.stubGlobal('fetch', vi.fn((url) => Promise.resolve(
            ehFotos(url) ? resposta({ fotos: { 10: foto } }) : resposta({ cidades: [{ ibge: 10 }, { ibge: 20 }] }),
        )));

        const { cidades } = await carregarBase();
        expect(cidades).toEqual([{ ibge: 10, foto }, { ibge: 20, foto: null }]);
    });

    it('carrega a base mesmo se as fotos falharem', async () => {
        vi.stubGlobal('fetch', vi.fn((url) => (
            ehFotos(url) ? Promise.reject(new TypeError('Failed to fetch')) : Promise.resolve(resposta({ cidades: [{ ibge: 30 }] }))
        )));

        const { cidades } = await carregarBase();
        expect(cidades).toEqual([{ ibge: 30, foto: null }]);
    });
});
