import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { baixar } from './baixar.mjs';

const resposta = (status, corpo = 'conteudo') => ({
    ok: status >= 200 && status < 300,
    status,
    arrayBuffer: async () => new TextEncoder().encode(corpo).buffer,
});

describe('baixar', () => {
    let pasta;

    beforeEach(() => {
        pasta = mkdtempSync(join(tmpdir(), 'moradia-cache-'));
        vi.stubEnv('MORADIA_CACHE_DIR', pasta);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        rmSync(pasta, { recursive: true, force: true });
    });

    it('usa o cache sem chamar a rede na segunda vez', async () => {
        const fetch = vi.fn(async () => resposta(200, 'dados'));
        vi.stubGlobal('fetch', fetch);
        const primeira = await baixar('https://x', { arquivoCache: 'x.txt', fonte: 'Teste' });
        const segunda = await baixar('https://x', { arquivoCache: 'x.txt', fonte: 'Teste' });
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(primeira.toString()).toBe('dados');
        expect(segunda.toString()).toBe('dados');
    });

    it('manda o User-Agent do projeto', async () => {
        const fetch = vi.fn(async () => resposta(200));
        vi.stubGlobal('fetch', fetch);
        await baixar('https://x', { arquivoCache: 'ua.txt', fonte: 'Teste' });
        expect(fetch.mock.calls[0][1].headers['User-Agent']).toBe('MoradIA-base/1.0 (prototipo academico)');
    });

    it('falha com o nome da fonte e a URL quando a resposta não é 2xx', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => resposta(404)));
        await expect(baixar('https://x', { arquivoCache: 'erro.txt', fonte: 'FipeZap' }))
            .rejects.toThrow('Falha ao baixar FipeZap: HTTP 404 (https://x)');
    });
});
