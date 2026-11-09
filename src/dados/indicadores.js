// Funções puras que derivam os KPIs do dashboard a partir do histórico de análises.
// Quando houver backend, basta trocar a fonte das análises.

const chaveCidade = ({ nome, uf }) => `${nome}, ${uf}`;

function porDataDesc(a, b) {
    return b.data.localeCompare(a.data);
}

// Cidade que ficou em 1º lugar mais vezes (empate: a que venceu mais recentemente).
// `idAnalise` é a análise mais recente em que ela venceu, usada para abrir a página da cidade.
function cidadeMaisRecomendada(analises) {
    const vitorias = new Map();
    for (const analise of [...analises].sort(porDataDesc)) {
        const vencedora = analise.cidades[0];
        const chave = chaveCidade(vencedora);
        const atual = vitorias.get(chave) ?? { cidade: chave, ibge: vencedora.ibge, vezes: 0, idAnalise: analise.id };
        atual.vezes += 1;
        vitorias.set(chave, atual);
    }

    let campea = null;
    for (const candidata of vitorias.values()) {
        if (!campea || candidata.vezes > campea.vezes) campea = candidata;
    }
    return campea;
}

function melhorMatch(analises) {
    let melhor = null;
    for (const analise of analises) {
        for (const cidade of analise.cidades) {
            if (!melhor || cidade.match > melhor.match) {
                melhor = { cidade: chaveCidade(cidade), match: cidade.match };
            }
        }
    }
    return melhor;
}

// Cidades que mais aparecem em qualquer posição do ranking, com o match médio e as vezes em 1º lugar.
function rankingCidades(analises, limite) {
    const cidades = new Map();
    for (const analise of analises) {
        analise.cidades.forEach((cidade, posicao) => {
            const chave = chaveCidade(cidade);
            const atual = cidades.get(chave) ?? { cidade: chave, ibge: cidade.ibge, aparicoes: 0, vitorias: 0, somaMatch: 0 };
            atual.aparicoes += 1;
            atual.somaMatch += cidade.match;
            if (posicao === 0) atual.vitorias += 1;
            cidades.set(chave, atual);
        });
    }

    return [...cidades.values()]
        .map(({ somaMatch, ...cidade }) => ({
            ...cidade,
            matchMedio: Math.round(somaMatch / cidade.aparicoes),
        }))
        .sort((a, b) => b.aparicoes - a.aparicoes || b.matchMedio - a.matchMedio)
        .slice(0, limite);
}

function analisesRecentes(analises) {
    return [...analises]
        .sort(porDataDesc)
        .map((analise) => ({
            id: analise.id,
            data: analise.data,
            cidade: chaveCidade(analise.cidades[0]),
            ibge: analise.cidades[0].ibge,
            match: analise.cidades[0].match,
        }));
}

// Quantos traços do medidor de frequência ficam preenchidos; quem apareceu tem sempre ao menos um.
export const TOTAL_TRACOS = 16;

export function tracosPreenchidos(aparicoes, totalAnalises) {
    return Math.max(1, Math.round((aparicoes / totalAnalises) * TOTAL_TRACOS));
}

export function calcularIndicadores(analises) {
    const cidadesAvaliadas = new Set(
        analises.flatMap((analise) => analise.cidades.map(chaveCidade))
    );

    return {
        totalAnalises: analises.length,
        cidadeMaisRecomendada: cidadeMaisRecomendada(analises),
        melhorMatch: melhorMatch(analises),
        cidadesAvaliadas: cidadesAvaliadas.size,
        ranking: rankingCidades(analises, 5),
        recentes: analisesRecentes(analises),
    };
}
