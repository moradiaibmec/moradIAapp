import { afterEach, describe, expect, it, vi } from 'vitest';
import { carregarBase } from './base.js';

describe('carregarBase', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('faz uma nova requisição quando a pessoa tenta de novo depois de uma falha', async () => {
        const fetch = vi.fn()
            .mockRejectedValueOnce(new TypeError('Failed to fetch'))
            .mockResolvedValueOnce({ ok: true, json: async () => ({ cidades: [1, 2] }) });
        vi.stubGlobal('fetch', fetch);

        await expect(carregarBase()).rejects.toThrow();
        await expect(carregarBase()).resolves.toEqual({ cidades: [1, 2] });
        expect(fetch).toHaveBeenCalledTimes(2);
    });
});
