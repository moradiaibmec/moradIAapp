import { describe, expect, it } from 'vitest';
import { formatarReais } from './formatacao.js';

describe('formatarReais', () => {
    it('formata em reais sem centavos', () => {
        expect(formatarReais(2850)).toBe('R$ 2.850');
        expect(formatarReais(-400)).toBe('-R$ 400');
    });
});
