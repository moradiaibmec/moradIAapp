// Estimativa do aluguel (spec "Estimativa do aluguel"): mediana do Censo 2010 calibrada pelo FipeZap atual.

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

// Mínimos quadrados de ln y = a + b · ln x.
export function ajustarRegressao(pares) {
    const pontos = pares.map(({ x, y }) => ({ x: Math.log(x), y: Math.log(y) }));
    const n = pontos.length;
    const mediaX = pontos.reduce((s, p) => s + p.x, 0) / n;
    const mediaY = pontos.reduce((s, p) => s + p.y, 0) / n;
    const sxy = pontos.reduce((s, p) => s + (p.x - mediaX) * (p.y - mediaY), 0);
    const sxx = pontos.reduce((s, p) => s + (p.x - mediaX) ** 2, 0);
    const b = sxy / sxx;
    const a = mediaY - b * mediaX;
    const residuos = pontos.reduce((s, p) => s + (p.y - (a + b * p.x)) ** 2, 0);
    const totalQuadrados = pontos.reduce((s, p) => s + (p.y - mediaY) ** 2, 0);
    return { a, b, r2: 1 - residuos / totalQuadrados, n };
}

export function preverM2({ a, b }, mediana) {
    return Math.exp(a + b * Math.log(mediana));
}

export function aluguelPorTamanho(m2) {
    return Object.fromEntries(Object.entries(AREA_POR_PESSOAS).map(([pessoas, area]) => [pessoas, Math.round(m2 * area)]));
}
