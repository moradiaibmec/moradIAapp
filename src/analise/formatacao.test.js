import { describe, expect, it } from 'vitest';
import { formatarPopulacao, formatarReais, nomeDoEstado, textoDoCredito } from './formatacao.js';

describe('formatarReais', () => {
    it('formata em reais sem centavos', () => {
        expect(formatarReais(2850)).toBe('R$ 2.850');
        expect(formatarReais(-400)).toBe('-R$ 400');
    });
});

describe('formatarPopulacao', () => {
    it('usa "mi" a partir de um milhão e "mil" abaixo disso', () => {
        expect(formatarPopulacao(1773718)).toBe('1,77 mi');
        expect(formatarPopulacao(11451999)).toBe('11,45 mi');
        expect(formatarPopulacao(104500)).toBe('105 mil');
    });
});

describe('nomeDoEstado', () => {
    it('devolve o nome do estado pela sigla', () => {
        expect(nomeDoEstado('PR')).toBe('Paraná');
        expect(nomeDoEstado('DF')).toBe('Distrito Federal');
    });

    it('devolve a própria sigla quando não conhece o estado', () => {
        expect(nomeDoEstado('XX')).toBe('XX');
    });
});

describe('textoDoCredito', () => {
    it('cita o autor e a licença da foto', () => {
        expect(textoDoCredito({ autor: 'Thomas Hobbs', licenca: 'CC BY-SA 2.0' })).toBe('Foto: Thomas Hobbs · CC BY-SA 2.0');
    });
});
