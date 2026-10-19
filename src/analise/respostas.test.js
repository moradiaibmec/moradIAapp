import { describe, expect, it } from 'vitest';
import {
    criarRespostasIniciais, etapaAnterior, etapasVisiveis, limparEtapa, limparEtapasOcultas,
    pessoasNoDomicilio, podeAvancar, proximaEtapa, tetoPadrao,
} from './respostas.js';

function respostasCom(mudancas) {
    return { ...criarRespostasIniciais(), ...mudancas };
}

describe('criarRespostasIniciais', () => {
    it('começa neutra, com todas as regiões e portes aceitos', () => {
        const r = criarRespostasIniciais();
        expect(r.versao).toBe(1);
        expect(r.onde.regioes).toEqual(['N', 'NE', 'CO', 'SE', 'S']);
        expect(r.onde.portes).toEqual(['metropole', 'grande', 'media']);
        expect(r.orcamento).toEqual({ faixaRenda: null, tetoMoradia: null });
        expect(r.pesos).toBeNull();
    });

    it('devolve objetos novos a cada chamada', () => {
        const a = criarRespostasIniciais();
        a.onde.regioes.push('X');
        expect(criarRespostasIniciais().onde.regioes).not.toContain('X');
    });
});

describe('etapasVisiveis', () => {
    it('esconde a etapa de trabalho sem situação que dependa dela', () => {
        expect(etapasVisiveis(criarRespostasIniciais())).toEqual(['momento', 'orcamento', 'onde', 'clima', 'prioridades']);
        expect(etapasVisiveis(respostasCom({ situacao: ['remoto', 'aposentado'] }))).not.toContain('trabalho');
    });

    it('mostra a etapa de trabalho na 4ª posição quando alguma situação depende dela', () => {
        expect(etapasVisiveis(respostasCom({ situacao: ['remoto', 'estudo'] }))[3]).toBe('trabalho');
        expect(etapasVisiveis(respostasCom({ situacao: ['procurando'] }))).toContain('trabalho');
    });
});

describe('navegação', () => {
    const etapas = ['momento', 'orcamento', 'clima'];

    it('avança e volta pela lista', () => {
        expect(proximaEtapa(etapas, 'momento')).toBe('orcamento');
        expect(etapaAnterior(etapas, 'clima')).toBe('orcamento');
    });

    it('retorna null nas pontas', () => {
        expect(proximaEtapa(etapas, 'clima')).toBeNull();
        expect(etapaAnterior(etapas, 'momento')).toBeNull();
    });
});

describe('limparEtapa', () => {
    it('volta só as respostas daquela etapa ao neutro', () => {
        const r = respostasCom({
            onde: { regioes: ['S'], referencia: null, portes: ['media'], praia: 'indispensavel' },
            clima: { temperatura: 'frio', chuvaIncomoda: true },
        });
        const limpa = limparEtapa(r, 'onde');
        expect(limpa.onde).toEqual(criarRespostasIniciais().onde);
        expect(limpa.clima).toEqual({ temperatura: 'frio', chuvaIncomoda: true });
    });

    it('limpa domicílio, situação e motivação na etapa momento', () => {
        const r = respostasCom({
            domicilio: { moradia: 'familia', filhosEscolares: true },
            situacao: ['remoto'],
            motivacao: 'economizar',
        });
        const limpa = limparEtapa(r, 'momento');
        expect(limpa.domicilio).toEqual({ moradia: null, filhosEscolares: false });
        expect(limpa.situacao).toEqual([]);
        expect(limpa.motivacao).toBeNull();
    });
});

describe('limparEtapasOcultas', () => {
    it('descarta respostas de trabalho quando a etapa deixou de aparecer', () => {
        const r = respostasCom({ situacao: ['remoto'], trabalho: { setores: ['tecnologia'], ensinoSuperior: false } });
        expect(limparEtapasOcultas(r).trabalho).toEqual({ setores: [], ensinoSuperior: false });
    });

    it('descarta "ensino superior" quando a pessoa deixou de marcar estudo', () => {
        const r = respostasCom({ situacao: ['presencial'], trabalho: { setores: ['saude'], ensinoSuperior: true } });
        expect(limparEtapasOcultas(r).trabalho).toEqual({ setores: ['saude'], ensinoSuperior: false });
    });

    it('descarta "filhos em idade escolar" quando a moradia deixou de ser com família', () => {
        const r = respostasCom({ domicilio: { moradia: 'sozinho', filhosEscolares: true } });
        expect(limparEtapasOcultas(r).domicilio).toEqual({ moradia: 'sozinho', filhosEscolares: false });
    });

    it('mantém respostas que continuam visíveis', () => {
        const r = respostasCom({
            situacao: ['estudo'],
            domicilio: { moradia: 'familia', filhosEscolares: true },
            trabalho: { setores: ['educacao'], ensinoSuperior: true },
        });
        expect(limparEtapasOcultas(r)).toEqual(r);
    });
});

describe('tetoPadrao', () => {
    it('usa 30% do ponto médio da faixa, em múltiplos de R$ 50', () => {
        expect(tetoPadrao('r7a12')).toBe(2850);
        expect(tetoPadrao('r4a7')).toBe(1650);
    });

    it('respeita os limites do slider', () => {
        expect(tetoPadrao('r0a2')).toBe(500);
        expect(tetoPadrao('r20')).toBe(7500);
    });

    it('retorna null sem faixa', () => {
        expect(tetoPadrao(null)).toBeNull();
    });
});

describe('pessoasNoDomicilio', () => {
    it('conta as pessoas conforme a moradia', () => {
        expect(pessoasNoDomicilio({ moradia: 'sozinho', filhosEscolares: false })).toBe(1);
        expect(pessoasNoDomicilio({ moradia: 'parceiro', filhosEscolares: false })).toBe(2);
        expect(pessoasNoDomicilio({ moradia: 'familia', filhosEscolares: false })).toBe(3);
        expect(pessoasNoDomicilio({ moradia: 'familia', filhosEscolares: true })).toBe(4);
    });

    it('conta 1 pessoa para quem divide com amigos ou não respondeu', () => {
        expect(pessoasNoDomicilio({ moradia: 'amigos', filhosEscolares: false })).toBe(1);
        expect(pessoasNoDomicilio({ moradia: null, filhosEscolares: false })).toBe(1);
    });
});

describe('podeAvancar', () => {
    it('sempre deixa avançar quando há cidades', () => {
        expect(podeAvancar('momento', 5, false)).toBe(true);
        expect(podeAvancar('prioridades', 1, true)).toBe(true);
    });

    it('deixa avançar com 0 cidades antes das etapas de filtro, para a pessoa chegar até elas', () => {
        expect(podeAvancar('momento', 0, false)).toBe(true);
    });

    it('bloqueia com 0 cidades nas etapas de filtro e no botão final', () => {
        expect(podeAvancar('orcamento', 0, false)).toBe(false);
        expect(podeAvancar('onde', 0, false)).toBe(false);
        expect(podeAvancar('clima', 0, true)).toBe(false);
    });

    it('deixa avançar com 0 cidades nas etapas intermediárias depois dos filtros', () => {
        expect(podeAvancar('trabalho', 0, false)).toBe(true);
        expect(podeAvancar('clima', 0, false)).toBe(true);
    });
});
