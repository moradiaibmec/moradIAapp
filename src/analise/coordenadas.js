// As coordenadas (~150 KB) só são baixadas quando a pessoa escolhe uma cidade de referência.
let promessaCoordenadas;

export function carregarCoordenadas() {
    promessaCoordenadas ??= import('../dados/coordenadasMunicipios.json').then((modulo) => modulo.default);
    return promessaCoordenadas;
}

export async function coordenadasDe(cidade) {
    const ponto = (await carregarCoordenadas())[cidade];
    return ponto ? { lat: ponto[0], lon: ponto[1] } : null;
}
