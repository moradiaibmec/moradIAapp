// A base real de cidades (~380 KB) só é carregada quando a pessoa começa uma análise.
// Gerada por `npm run base:gerar` (docs/superpowers/specs/2026-10-19-base-cidades-design.md).
let promessaBase;

export function carregarBase() {
    promessaBase ??= import('./cidades.json')
        .then((modulo) => modulo.default)
        .catch((erro) => {
            promessaBase = undefined; // permite tentar de novo
            throw erro;
        });
    return promessaBase;
}
