import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apagarRascunho, gravarRascunho, lerRascunho } from './rascunho.js';

function armazenamento() {
    const dados = new Map();
    return {
        getItem: (chave) => dados.get(chave) ?? null,
        setItem: (chave, valor) => dados.set(chave, valor),
        removeItem: (chave) => dados.delete(chave),
    };
}

describe('rascunho', () => {
    beforeEach(() => vi.stubGlobal('sessionStorage', armazenamento()));
    afterEach(() => vi.unstubAllGlobals());

    it('devolve o que foi gravado', () => {
        gravarRascunho('u1', { respostas: { versao: 1 } });
        expect(lerRascunho('u1')).toEqual({ respostas: { versao: 1 } });
    });

    it('não mistura pessoas', () => {
        gravarRascunho('u1', { respostas: {} });
        expect(lerRascunho('u2')).toBeNull();
    });

    it('apaga o rascunho', () => {
        gravarRascunho('u1', { respostas: {} });
        apagarRascunho('u1');
        expect(lerRascunho('u1')).toBeNull();
    });

    it('ignora conteúdo corrompido', () => {
        sessionStorage.setItem('moradia:rascunho:u1', '{quebrado');
        expect(lerRascunho('u1')).toBeNull();
    });

    it('funciona sem armazenamento disponível', () => {
        vi.stubGlobal('sessionStorage', undefined);
        expect(() => gravarRascunho('u1', {})).not.toThrow();
        expect(() => apagarRascunho('u1')).not.toThrow();
        expect(lerRascunho('u1')).toBeNull();
    });
});
