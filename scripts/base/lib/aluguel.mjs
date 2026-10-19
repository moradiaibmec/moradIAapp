// Estimativa do aluguel (spec "Estimativa do aluguel"): mediana do Censo 2010 levada ao nível atual do FipeZap.

export const SALARIO_MINIMO_2010 = 510;

// Limites das 8 faixas do agregado 3511, em salários mínimos. A faixa aberta "mais de 5 SM" vai até 7,5.
const LIMITES_SM = [0, 1 / 8, 1 / 4, 1 / 2, 1, 2, 3, 5, 7.5];

export const AREA_POR_PESSOAS = { 1: 40, 2: 55, 3: 70, 4: 85 };

// Mediana em R$ de 2010, por interpolação linear dentro da faixa que contém a metade dos domicílios.
export function medianaAluguel2010(contagens) {
    const total = contagens.reduce((soma, n) => soma + n, 0);
    if (total === 0) return null;
    const metade = total / 2;
    let acumulado = 0;
    for (let i = 0; i < contagens.length; i += 1) {
        if (acumulado + contagens[i] >= metade && contagens[i] > 0) {
            const fracao = (metade - acumulado) / contagens[i];
            const sm = LIMITES_SM[i] + fracao * (LIMITES_SM[i + 1] - LIMITES_SM[i]);
            return sm * SALARIO_MINIMO_2010;
        }
        acumulado += contagens[i];
    }
    return null;
}

// Área de referência para comparar o aluguel atual (R$/m² do FipeZap) com a mediana de 2010 (aluguel inteiro).
export const AREA_REFERENCIA = 55;

// Fator único que leva a mediana de 2010 ao nível atual: mediana das razões nas cidades com FipeZap.
// Decisão de 2026-10-19: uma regressão explicava só 2% da variação e deixava as cidades estimadas quase iguais.
export function calibrarFator(pares) {
    const razoes = pares.map(({ mediana, m2 }) => (m2 * AREA_REFERENCIA) / mediana).sort((a, b) => a - b);
    const meio = Math.floor(razoes.length / 2);
    return razoes.length % 2 ? razoes[meio] : (razoes[meio - 1] + razoes[meio]) / 2;
}

// R$/m² estimado: a mediana de 2010 trazida ao nível atual, mantendo a ordem do Censo entre as cidades.
export function estimarM2(fator, mediana) {
    return (mediana * fator) / AREA_REFERENCIA;
}

export function aluguelPorTamanho(m2) {
    return Object.fromEntries(Object.entries(AREA_POR_PESSOAS).map(([pessoas, area]) => [pessoas, Math.round(m2 * area)]));
}
