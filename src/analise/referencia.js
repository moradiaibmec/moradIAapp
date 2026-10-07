// A cidade de referência é escolhida antes de suas coordenadas carregarem.
// Estas funções recebem sempre o estado atual, para que um carregamento lento
// não desfaça um "Não" ou uma troca de cidade feita nesse meio-tempo.

export function marcarReferenciaPendente(referencia, cidade) {
    if (referencia === null) return null;
    return { ...referencia, cidade, lat: null, lon: null };
}

export function resolverReferencia(referencia, cidade, coordenadas) {
    if (referencia === null || referencia.cidade !== cidade) return referencia;
    if (!coordenadas) return { ...referencia, cidade: null, lat: null, lon: null };
    return { ...referencia, ...coordenadas };
}
