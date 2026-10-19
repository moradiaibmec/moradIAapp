import {
    FAIXAS_RENDA, PASSO_TETO, PORTES, REGIOES, SITUACOES_COM_TRABALHO, TETO_MAXIMO, TETO_MINIMO,
} from './opcoes.js';

export const VERSAO_QUESTIONARIO = 1;

export const ETAPAS = ['momento', 'orcamento', 'onde', 'trabalho', 'clima', 'prioridades'];

// Partes das respostas que cada etapa preenche (usado para "Pular esta etapa").
const SECOES_DA_ETAPA = {
    momento: ['domicilio', 'situacao', 'motivacao'],
    orcamento: ['orcamento'],
    onde: ['onde'],
    trabalho: ['trabalho'],
    clima: ['clima'],
    prioridades: ['pesos'],
};

export function criarRespostasIniciais() {
    return {
        versao: VERSAO_QUESTIONARIO,
        domicilio: { moradia: null, filhosEscolares: false },
        situacao: [],
        motivacao: null,
        orcamento: { faixaRenda: null, tetoMoradia: null },
        onde: {
            regioes: REGIOES.map(({ id }) => id),
            referencia: null,
            portes: PORTES.map(({ id }) => id),
            praia: 'tantoFaz',
        },
        trabalho: { setores: [], ensinoSuperior: false },
        clima: { temperatura: 'tantoFaz', chuvaIncomoda: false },
        pesos: null,
    };
}

export function etapasVisiveis(respostas) {
    const comTrabalho = respostas.situacao.some((situacao) => SITUACOES_COM_TRABALHO.includes(situacao));
    return ETAPAS.filter((etapa) => etapa !== 'trabalho' || comTrabalho);
}

export function proximaEtapa(etapas, atual) {
    return etapas[etapas.indexOf(atual) + 1] ?? null;
}

export function etapaAnterior(etapas, atual) {
    const indice = etapas.indexOf(atual);
    return indice > 0 ? etapas[indice - 1] : null;
}

export function limparEtapa(respostas, etapa) {
    const neutras = criarRespostasIniciais();
    const limpas = { ...respostas };
    for (const secao of SECOES_DA_ETAPA[etapa]) limpas[secao] = neutras[secao];
    return limpas;
}

// Respostas de perguntas que deixaram de aparecer não podem influenciar o resultado.
export function limparEtapasOcultas(respostas) {
    let limpas = respostas;

    if (!etapasVisiveis(limpas).includes('trabalho')) {
        limpas = limparEtapa(limpas, 'trabalho');
    } else if (!limpas.situacao.includes('estudo') && limpas.trabalho.ensinoSuperior) {
        limpas = { ...limpas, trabalho: { ...limpas.trabalho, ensinoSuperior: false } };
    }

    if (limpas.domicilio.moradia !== 'familia' && limpas.domicilio.filhosEscolares) {
        limpas = { ...limpas, domicilio: { ...limpas.domicilio, filhosEscolares: false } };
    }

    return limpas;
}

export function pontoMedioRenda(faixaId) {
    return FAIXAS_RENDA.find(({ id }) => id === faixaId)?.pontoMedio ?? null;
}

export function tetoPadrao(faixaId) {
    const renda = pontoMedioRenda(faixaId);
    if (renda === null) return null;
    const teto = Math.round((renda * 0.3) / PASSO_TETO) * PASSO_TETO;
    return Math.min(Math.max(teto, TETO_MINIMO), TETO_MAXIMO);
}

// Quem divide com amigos conta como 1 pessoa: paga a sua parte de um imóvel compartilhado.
export function pessoasNoDomicilio({ moradia, filhosEscolares }) {
    if (moradia === 'parceiro') return 2;
    if (moradia === 'familia') return filhosEscolares ? 4 : 3;
    return 1;
}

// Etapas onde a pessoa configura os filtros que podem zerar o resultado.
const ETAPAS_DE_FILTRO = ['orcamento', 'onde'];

// Com 0 cidades, só bloqueia onde dá para resolver (etapas de filtro) e no botão final.
// Antes delas, avançar é o único caminho até o filtro que precisa ser afrouxado.
export function podeAvancar(etapa, cidadesRestantes, ultimaEtapa) {
    if (cidadesRestantes > 0) return true;
    return !ultimaEtapa && !ETAPAS_DE_FILTRO.includes(etapa);
}
