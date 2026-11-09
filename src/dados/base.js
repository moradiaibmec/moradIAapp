// A base real de cidades (~380 KB) só é baixada quando a pessoa começa uma análise.
// Gerada por `npm run base:gerar` (docs/superpowers/specs/2026-10-19-base-cidades-design.md).
// Usa fetch, e não import(): alguns navegadores guardam a falha de um import() e nunca tentam de novo.
import urlDaBase from './cidades.json?url';
// Fotos e créditos (Wikimedia Commons), gerados por `npm run base:fotos`.
import urlDasFotos from './fotos.json?url';

let promessaBase;
let promessaFotos;

function baixarJson(url, descricao) {
    return fetch(url).then((resposta) => {
        if (!resposta.ok) throw new Error(`Falha ao carregar ${descricao}: HTTP ${resposta.status}`);
        return resposta.json();
    });
}

// Fotos por código IBGE. Sem elas tudo funciona do mesmo jeito: a falha vira uma lista vazia, e a próxima chamada tenta de novo.
export function carregarFotos() {
    promessaFotos ??= baixarJson(urlDasFotos, 'as fotos')
        .then(({ fotos }) => fotos)
        .catch(() => {
            promessaFotos = undefined;
            return {};
        });
    return promessaFotos;
}

export function carregarBase() {
    promessaBase ??= Promise.all([baixarJson(urlDaBase, 'as cidades'), carregarFotos()])
        .then(([base, fotosPorIbge]) => ({
            ...base,
            cidades: base.cidades.map((cidade) => ({ ...cidade, foto: fotosPorIbge[cidade.ibge] ?? null })),
        }))
        .catch((erro) => {
            promessaBase = undefined; // a próxima tentativa faz uma requisição nova
            throw erro;
        });
    return promessaBase;
}
