// Montagem das cidades e da base no formato de src/dados/cidades.json (spec "Formato gerado").

export const CAMPOS_INDICADORES = [
    'aluguel', 'homicidios100k', 'tempMedia', 'tempMesFrio', 'tempMesQuente', 'diasChuvaAno',
    'empregoPerCapita', 'crescimentoEmprego', 'empregoSetor', 'leitos1k', 'medicos1k',
    'idebIniciais', 'idebFinais', 'vagasSuperior10k', 'lazer10k', 'parques10k',
];

// Fora destas faixas o valor é tratado como erro da fonte e vira null.
export const FAIXAS = {
    tempMedia: [10, 30],
    homicidios100k: [0, 150],
    leitos1k: [0, 20],
    idebIniciais: [2, 9],
    idebFinais: [2, 9],
};

// Indicadores que podem ser negativos.
const PODEM_SER_NEGATIVOS = new Set(['crescimentoEmprego', 'tempMesFrio', 'tempMesQuente']);

function valido(campo, valor) {
    if (typeof valor !== 'number') return true;
    if (Number.isNaN(valor)) return false;
    if (!PODEM_SER_NEGATIVOS.has(campo) && valor < 0) return false;
    const faixa = FAIXAS[campo];
    return !faixa || (valor >= faixa[0] && valor <= faixa[1]);
}

export function aplicarFaixas(indicadores) {
    const resultado = {};
    const foraDaFaixa = [];
    for (const [campo, valor] of Object.entries(indicadores)) {
        if (valido(campo, valor)) {
            resultado[campo] = valor;
        } else {
            resultado[campo] = null;
            foraDaFaixa.push(campo);
        }
    }
    return { indicadores: resultado, foraDaFaixa };
}

export function montarCidade(identidade, parciais, estimados) {
    const juntos = Object.assign({}, ...parciais);
    const indicadores = Object.fromEntries(CAMPOS_INDICADORES.map((campo) => [campo, juntos[campo] ?? null]));
    indicadores.medicos1k = null;
    return { ...identidade, indicadores, estimados };
}

export function montarBase(cidades, fontes, agora) {
    return {
        versaoDados: agora.toISOString().slice(0, 7),
        geradoEm: agora.toISOString(),
        fontes,
        cidades: [...cidades].sort((a, b) => a.ibge - b.ibge),
    };
}
