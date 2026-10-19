// A base real de cidades (~380 KB) só é baixada quando a pessoa começa uma análise.
// Gerada por `npm run base:gerar` (docs/superpowers/specs/2026-10-19-base-cidades-design.md).
// Usa fetch, e não import(): alguns navegadores guardam a falha de um import() e nunca tentam de novo.
import urlDaBase from './cidades.json?url';

let promessaBase;

export function carregarBase() {
    promessaBase ??= fetch(urlDaBase)
        .then((resposta) => {
            if (!resposta.ok) throw new Error(`Falha ao carregar as cidades: HTTP ${resposta.status}`);
            return resposta.json();
        })
        .catch((erro) => {
            promessaBase = undefined; // a próxima tentativa faz uma requisição nova
            throw erro;
        });
    return promessaBase;
}
