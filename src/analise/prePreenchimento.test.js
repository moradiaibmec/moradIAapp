import { describe, expect, it } from 'vitest';
import { OPCOES_MOTIVACAO, OPCOES_SITUACAO } from './opcoes.js';
import { criarRespostasIniciais } from './respostas.js';
import { limitarEssenciais, pesosPadrao, sugerirPesos } from './prePreenchimento.js';

function respostasCom(mudancas) {
    return { ...criarRespostasIniciais(), ...mudancas };
}

function comTemperatura(temperatura, mudancas = {}) {
    return respostasCom({ ...mudancas, clima: { temperatura, chuvaIncomoda: false } });
}

describe('pesosPadrao', () => {
    it('deixa Educação em Tanto faz e o resto em Importante', () => {
        expect(pesosPadrao()).toEqual({
            custo: 'importante', seguranca: 'importante', clima: 'importante', trabalho: 'importante',
            saude: 'importante', educacao: 'tantoFaz', lazer: 'importante', natureza: 'importante',
        });
    });
});

describe('sugerirPesos', () => {
    it('com respostas neutras, só tira o peso do clima (temperatura "tanto faz")', () => {
        const { pesos, motivos } = sugerirPesos(criarRespostasIniciais());
        expect(pesos).toEqual({ ...pesosPadrao(), clima: 'tantoFaz' });
        expect(motivos.clima).toBe('Você disse que tanto faz a temperatura');
    });

    it('marca Trabalho como essencial para quem procura emprego', () => {
        const { pesos, motivos } = sugerirPesos(comTemperatura('ameno', { situacao: ['procurando'] }));
        expect(pesos.trabalho).toBe('essencial');
        expect(motivos.trabalho).toBe('Você está procurando emprego');
    });

    it('tira o peso de Trabalho só quando nenhuma situação depende do mercado local', () => {
        expect(sugerirPesos(comTemperatura('ameno', { situacao: ['remoto', 'aposentado'] })).pesos.trabalho).toBe('tantoFaz');
        expect(sugerirPesos(comTemperatura('ameno', { situacao: ['remoto', 'presencial'] })).pesos.trabalho).toBe('importante');
        expect(sugerirPesos(comTemperatura('ameno', { situacao: [] })).pesos.trabalho).toBe('importante');
    });

    it('sobe Educação para Importante com filhos em idade escolar, explicando o motivo', () => {
        const r = comTemperatura('ameno', { domicilio: { moradia: 'familia', filhosEscolares: true } });
        const { pesos, motivos } = sugerirPesos(r);
        expect(pesos.educacao).toBe('importante');
        expect(motivos.educacao).toBe('Você tem filhos em idade escolar');
    });

    it('combina aposentadoria e motivação "economizar"', () => {
        const { pesos } = sugerirPesos(comTemperatura('calor', { situacao: ['aposentado'], motivacao: 'economizar' }));
        expect(pesos.saude).toBe('essencial');
        expect(pesos.custo).toBe('essencial');
        expect(pesos.trabalho).toBe('tantoFaz');
    });

    it('nunca sugere mais de 3 essenciais, em nenhuma combinação de respostas', () => {
        const situacoes = OPCOES_SITUACAO.map(({ id }) => id);
        const motivacoes = [null, ...OPCOES_MOTIVACAO.map(({ id }) => id)];
        for (let mascara = 0; mascara < 2 ** situacoes.length; mascara += 1) {
            const situacao = situacoes.filter((_, i) => mascara & (1 << i));
            for (const motivacao of motivacoes) {
                for (const filhosEscolares of [false, true]) {
                    const r = comTemperatura('ameno', { situacao, motivacao, domicilio: { moradia: 'familia', filhosEscolares } });
                    const essenciais = Object.values(sugerirPesos(r).pesos).filter((nivel) => nivel === 'essencial');
                    expect(essenciais.length).toBeLessThanOrEqual(3);
                }
            }
        }
    });
});

describe('limitarEssenciais', () => {
    const quatroEssenciais = { ...pesosPadrao(), custo: 'essencial', seguranca: 'essencial', saude: 'essencial', trabalho: 'essencial' };

    it('mantém os 3 primeiros da ordem e rebaixa o resto para Importante', () => {
        const pesos = limitarEssenciais(quatroEssenciais, ['trabalho', 'saude', 'custo', 'seguranca']);
        expect(pesos.seguranca).toBe('importante');
        expect([pesos.trabalho, pesos.saude, pesos.custo]).toEqual(['essencial', 'essencial', 'essencial']);
    });

    it('rebaixa primeiro os essenciais que não estão na ordem', () => {
        const pesos = limitarEssenciais(quatroEssenciais, ['custo', 'seguranca', 'saude']);
        expect(pesos.trabalho).toBe('importante');
    });

    it('não mexe em quem já está dentro do limite', () => {
        const pesos = { ...pesosPadrao(), custo: 'essencial' };
        expect(limitarEssenciais(pesos, [])).toEqual(pesos);
    });
});
