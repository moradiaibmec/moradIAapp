// A base real de cidades (~380 KB) só é baixada quando a pessoa começa uma análise.
// Gerada por `npm run base:gerar` (docs/superpowers/specs/2026-10-19-base-cidades-design.md).
// Usa fetch, e não import(): alguns navegadores guardam a falha de um import() e nunca tentam de novo.
import urlDaBase from './cidades.json?url';
// Fotos e créditos (Wikimedia Commons), gerados por `npm run base:fotos`.
import urlDasFotos from './fotos.json?url';

let promessaBase;

function baixarJson(url, descricao) {
    return fetch(url).then((resposta) => {
        if (!resposta.ok) throw new Error(`Falha ao carregar ${descricao}: HTTP ${resposta.status}`);
        return resposta.json();
    });
}

export function carregarBase() {
    promessaBase ??= Promise.all([
        baixarJson(urlDaBase, 'as cidades'),
        // Sem fotos a análise funciona do mesmo jeito: a falha delas não derruba a base.
        baixarJson(urlDasFotos, 'as fotos').then(({ fotos }) => fotos).catch(() => ({})),
    ])
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
