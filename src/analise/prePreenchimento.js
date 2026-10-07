import { MAXIMO_ESSENCIAIS, PILARES } from './opcoes.js';

const SEM_TRABALHO_LOCAL = ['remoto', 'aposentado', 'naoTrabalho'];

// Aplicadas de cima para baixo: uma regra posterior sobrescreve a anterior no mesmo pilar.
const REGRAS = [
    {
        aplica: (r) => r.clima.temperatura === 'tantoFaz',
        efeitos: { clima: 'tantoFaz' },
        motivo: 'Você disse que tanto faz a temperatura',
    },
    {
        aplica: (r) => r.situacao.length > 0 && r.situacao.every((s) => SEM_TRABALHO_LOCAL.includes(s)),
        efeitos: { trabalho: 'tantoFaz' },
        motivo: 'Sua situação não depende do mercado de trabalho local',
    },
    {
        aplica: (r) => r.situacao.includes('procurando'),
        efeitos: { trabalho: 'essencial' },
        motivo: 'Você está procurando emprego',
    },
    {
        aplica: (r) => r.domicilio.filhosEscolares || r.situacao.includes('estudo'),
        efeitos: { educacao: 'importante' },
        motivo: (r) => (r.domicilio.filhosEscolares ? 'Você tem filhos em idade escolar' : 'Você estuda ou vai estudar'),
    },
    {
        aplica: (r) => r.situacao.includes('aposentado'),
        efeitos: { saude: 'essencial' },
        motivo: 'Você é aposentado(a)',
    },
    {
        aplica: (r) => r.motivacao === 'economizar',
        efeitos: { custo: 'essencial' },
        motivo: 'Sua motivação é economizar',
    },
    {
        aplica: (r) => r.motivacao === 'qualidadeVida',
        efeitos: { seguranca: 'essencial', natureza: 'importante' },
        motivo: 'Sua motivação é qualidade de vida',
    },
    {
        aplica: (r) => r.motivacao === 'carreira',
        efeitos: { trabalho: 'essencial' },
        motivo: 'Sua motivação é a carreira',
    },
    {
        aplica: (r) => r.motivacao === 'estudar',
        efeitos: { educacao: 'essencial' },
        motivo: 'Sua motivação é estudar',
    },
];

export function pesosPadrao() {
    return Object.fromEntries(PILARES.map(({ id }) => [id, id === 'educacao' ? 'tantoFaz' : 'importante']));
}

// `ordem` lista os pilares do mais para o menos prioritário. Essenciais fora da ordem são rebaixados primeiro.
export function limitarEssenciais(pesos, ordem) {
    const essenciais = Object.keys(pesos).filter((pilar) => pesos[pilar] === 'essencial');
    const priorizados = [
        ...ordem.filter((pilar) => essenciais.includes(pilar)),
        ...essenciais.filter((pilar) => !ordem.includes(pilar)),
    ];
    const manter = new Set(priorizados.slice(0, MAXIMO_ESSENCIAIS));
    return Object.fromEntries(Object.entries(pesos).map(([pilar, nivel]) => (
        [pilar, nivel === 'essencial' && !manter.has(pilar) ? 'importante' : nivel]
    )));
}

export function sugerirPesos(respostas) {
    const pesos = pesosPadrao();
    const motivos = {};
    const definidoPelaRegra = {};

    REGRAS.forEach((regra, indice) => {
        if (!regra.aplica(respostas)) return;
        const motivo = typeof regra.motivo === 'function' ? regra.motivo(respostas) : regra.motivo;
        for (const [pilar, nivel] of Object.entries(regra.efeitos)) {
            pesos[pilar] = nivel;
            motivos[pilar] = motivo;
            definidoPelaRegra[pilar] = indice;
        }
    });

    // Regras mais abaixo na lista têm prioridade para continuar essenciais.
    const ordem = Object.keys(definidoPelaRegra).sort((a, b) => definidoPelaRegra[b] - definidoPelaRegra[a]);
    return { pesos: limitarEssenciais(pesos, ordem), motivos };
}
