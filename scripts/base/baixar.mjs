// Download com cache em disco para os scripts da base de cidades.
// Regerar a base reaproveita o que já foi baixado; apague scripts/base/.cache para baixar tudo de novo.
import { existsSync, mkdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const USER_AGENT = 'MoradIA-base/1.0 (prototipo academico)';

const pastaCache = () => process.env.MORADIA_CACHE_DIR ?? fileURLToPath(new URL('./.cache/', import.meta.url));
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export async function baixar(url, { arquivoCache, fonte, pausaMs = 0, metodo = 'GET', corpo, esperaRepeticaoMs = 5000 } = {}) {
    const pasta = pastaCache();
    const caminho = join(pasta, arquivoCache);
    if (existsSync(caminho)) return readFile(caminho);

    const requisitar = () => fetch(url, {
        method: metodo,
        body: corpo,
        headers: {
            'User-Agent': USER_AGENT,
            ...(corpo ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
        },
    });
    let resposta;
    try {
        resposta = await requisitar();
    } catch {
        // Queda de conexão (comum em arquivos grandes do INEP): uma segunda tentativa. Erro HTTP não é repetido.
        await esperar(esperaRepeticaoMs);
        resposta = await requisitar();
    }
    if (!resposta.ok) throw new Error(`Falha ao baixar ${fonte}: HTTP ${resposta.status} (${url})`);

    const dados = Buffer.from(await resposta.arrayBuffer());
    mkdirSync(pasta, { recursive: true });
    await writeFile(caminho, dados);
    if (pausaMs > 0) await esperar(pausaMs);
    return dados;
}
