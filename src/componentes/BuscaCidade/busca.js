const LIMITE_SUGESTOES = 8;

// A lista do IBGE (~100 KB) só é baixada quando a pessoa começa a buscar.
let promessaMunicipios;
export function carregarMunicipios() {
    promessaMunicipios ??= import('../../dados/municipios.json').then((modulo) => modulo.default);
    return promessaMunicipios;
}

// Ignora acentos e maiúsculas: "sao paulo" encontra "São Paulo, SP".
export function normalizar(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const capitais = new Set([
    'Aracaju, SE', 'Belém, PA', 'Belo Horizonte, MG', 'Boa Vista, RR', 'Brasília, DF', 'Campo Grande, MS',
    'Cuiabá, MT', 'Curitiba, PR', 'Florianópolis, SC', 'Fortaleza, CE', 'Goiânia, GO', 'João Pessoa, PB',
    'Macapá, AP', 'Maceió, AL', 'Manaus, AM', 'Natal, RN', 'Palmas, TO', 'Porto Alegre, RS', 'Porto Velho, RO',
    'Recife, PE', 'Rio Branco, AC', 'Rio de Janeiro, RJ', 'Salvador, BA', 'São Luís, MA', 'São Paulo, SP',
    'Teresina, PI', 'Vitória, ES',
]);

// Ordem: nome exato, depois começa com o termo, depois só contém;
// em cada grupo, capitais primeiro e então os nomes mais curtos.
export function buscarCidades(municipios, termo) {
    const busca = normalizar(termo);
    if (!busca) return [];

    const encontradas = [];
    for (const cidade of municipios) {
        const nome = normalizar(cidade.slice(0, cidade.lastIndexOf(', ')));
        const grupo = nome === busca ? 0 : nome.startsWith(busca) ? 1 : nome.includes(busca) ? 2 : -1;
        if (grupo >= 0) encontradas.push({ cidade, grupo, capital: capitais.has(cidade) ? 0 : 1 });
    }

    return encontradas
        .sort((a, b) => a.grupo - b.grupo || a.capital - b.capital || a.cidade.length - b.cidade.length)
        .slice(0, LIMITE_SUGESTOES)
        .map(({ cidade }) => cidade);
}
