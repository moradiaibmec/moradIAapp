// Gera src/dados/fotos.json com a foto e o crédito de cada cidade da base. Uso: npm run base:fotos
// Fica separado de cidades.json para as fotos poderem ser atualizadas sem baixar de novo todas as fontes.
import { readFile, writeFile } from 'node:fs/promises';
import { coletarFotos } from './fontes/wikimedia.mjs';

const BASE = new URL('../../src/dados/cidades.json', import.meta.url);
const DESTINO = new URL('../../src/dados/fotos.json', import.meta.url);
const MINIMO_COM_FOTO = 0.8; // abaixo disso algo mudou nas fontes; melhor não sobrescrever o arquivo atual

async function gerar() {
    const { cidades } = JSON.parse(await readFile(BASE, 'utf8'));
    console.log(`→ Fotos (Wikidata e Wikimedia Commons) de ${cidades.length} cidades…`);
    const { porIbge, avisos, fonte } = await coletarFotos(cidades.map(({ ibge }) => ibge));
    for (const aviso of avisos) console.log(`   aviso: ${aviso}`);

    if (porIbge.size < cidades.length * MINIMO_COM_FOTO) {
        console.error(`\nSó ${porIbge.size} de ${cidades.length} cidades com foto; fotos.json não foi alterado.`);
        process.exit(1);
    }

    const fotos = Object.fromEntries(cidades.filter(({ ibge }) => porIbge.has(ibge)).map(({ ibge }) => [ibge, porIbge.get(ibge)]));
    await writeFile(DESTINO, `${JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), fonte, fotos }, null, 2)}\n`);
    console.log(`\nFotos gravadas: ${porIbge.size} de ${cidades.length} cidades.`);
}

gerar().catch((erro) => {
    console.error(`\nFalha ao gerar as fotos; fotos.json não foi alterado.\n${erro.stack ?? erro.message}`);
    process.exit(1);
});
