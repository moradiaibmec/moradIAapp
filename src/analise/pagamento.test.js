import { describe, expect, it } from 'vitest';
import { formatarCpf, formatarCvv, formatarNumeroCartao, formatarTempo, formatarValidade } from './pagamento.js';

describe('máscaras do cartão', () => {
    it('agrupa o número de 4 em 4 e limita a 16 dígitos', () => {
        expect(formatarNumeroCartao('42424')).toBe('4242 4');
        expect(formatarNumeroCartao('4242-4242 4242 4242 9999')).toBe('4242 4242 4242 4242');
    });

    it('formata a validade como MM/AA', () => {
        expect(formatarValidade('1')).toBe('1');
        expect(formatarValidade('12')).toBe('12');
        expect(formatarValidade('1234')).toBe('12/34');
        expect(formatarValidade('12/345')).toBe('12/34');
    });

    it('deixa o CVV só com até 4 dígitos', () => {
        expect(formatarCvv('12a3456')).toBe('1234');
    });

    it('formata o CPF enquanto ele é digitado', () => {
        expect(formatarCpf('123')).toBe('123');
        expect(formatarCpf('1234')).toBe('123.4');
        expect(formatarCpf('1234567')).toBe('123.456.7');
        expect(formatarCpf('12345678901234')).toBe('123.456.789-01');
    });
});

describe('formatarTempo', () => {
    it('mostra minutos e segundos', () => {
        expect(formatarTempo(872)).toBe('14:32');
        expect(formatarTempo(5)).toBe('00:05');
    });
});
