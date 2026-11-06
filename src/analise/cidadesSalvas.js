// Cidades salvas da pessoa: nomes "Cidade, UF" guardados em user_metadata.perfil.cidadesSalvas.
// Qualquer município do IBGE pode ser salvo, mas só os da base têm indicadores e match.

export function alternarCidade(salvas, cidade) {
    return salvas.includes(cidade) ? salvas.filter((item) => item !== cidade) : [...salvas, cidade];
}

// `avaliadas` e `ranking` são nulos enquanto a pessoa não tiver uma análise.
export function detalharSalvas(salvas, cidades, avaliadas, ranking) {
    return salvas.map((nome) => {
        const cidade = cidades.find((item) => `${item.nome}, ${item.uf}` === nome) ?? null;
        if (!cidade) return { nome, cidade: null, resultado: null, posicao: null };
        const resultado = avaliadas?.find(({ ibge }) => ibge === cidade.ibge) ?? null;
        const indice = ranking?.findIndex(({ ibge }) => ibge === cidade.ibge) ?? -1;
        return { nome, cidade, resultado, posicao: indice === -1 ? null : indice };
    });
}
