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

// Critérios de ordem da lista; os que dependem de uma análise só aparecem com ela.
export const ORDENACOES = [
    { valor: 'match', rotulo: 'Maior match', precisaAnalise: true },
    { valor: 'aluguel', rotulo: 'Menor aluguel', precisaAnalise: true },
    { valor: 'populacao', rotulo: 'Maior população', precisaAnalise: false },
    { valor: 'nome', rotulo: 'Nome', precisaAnalise: false },
];

const CHAVES = {
    match: (item) => (item.resultado ? -item.resultado.match : null),
    aluguel: (item) => item.aluguel ?? null,
    populacao: (item) => (item.cidade ? -item.cidade.populacao : null),
};

// `itens` vêm de detalharSalvas com o `aluguel` do domicílio já calculado (ou nulo).
// Quem não tem o dado do critério vai para o fim, na ordem em que foi salvo.
export function ordenarSalvas(itens, criterio) {
    if (criterio === 'nome') return [...itens].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const chave = CHAVES[criterio];
    if (!chave) return [...itens];
    return [...itens].sort((a, b) => {
        const [x, y] = [chave(a), chave(b)];
        if (x === null || y === null) return (x === null) - (y === null);
        return x - y;
    });
}

// Selos de "Maior match" e "Menor aluguel" entre as salvas; só fazem sentido com duas ou mais para comparar.
export function destaquesDasSalvas(itens) {
    const selos = new Map();
    const marcar = (lista, valor, rotulo) => {
        if (lista.length < 2) return;
        const melhor = lista.reduce((a, b) => (valor(b) < valor(a) ? b : a));
        selos.set(melhor.nome, [...(selos.get(melhor.nome) ?? []), rotulo]);
    };
    marcar(itens.filter((item) => item.resultado), (item) => -item.resultado.match, 'maior match');
    marcar(itens.filter((item) => item.aluguel != null), (item) => item.aluguel, 'menor aluguel');
    return new Map([...selos].map(([nome, rotulos]) => {
        const texto = rotulos.join(' e ');
        return [nome, texto[0].toUpperCase() + texto.slice(1)];
    }));
}
