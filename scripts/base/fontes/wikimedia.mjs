// Wikidata + Wikimedia Commons: foto principal de cada município (propriedade P18), achada pelo código IBGE (P1585).
import { createHash } from 'node:crypto';
import { baixar } from '../baixar.mjs';
import { arquivoDaImagem, montarFoto } from '../lib/fotos.mjs';

const SPARQL = 'https://query.wikidata.org/sparql';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const POR_LOTE = 20; // lotes pequenos: o Commons limita (HTTP 429) consultas que geram muitas miniaturas de uma vez
const TENTATIVAS = 5;
const ESPERA_429_MS = 30_000;
export const LARGURA_GRANDE = 1280;
export const LARGURA_MINIATURA = 500;

const resumo = (texto) => createHash('sha1').update(texto).digest('hex').slice(0, 10);
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

async function baixarComPaciencia(url, opcoes) {
    for (let tentativa = 1; ; tentativa += 1) {
        try {
            return await baixar(url, opcoes);
        } catch (erro) {
            if (!erro.message.includes('HTTP 429') || tentativa === TENTATIVAS) throw erro;
            const espera = ESPERA_429_MS * tentativa;
            console.log(`   Commons pediu calma (HTTP 429); nova tentativa em ${espera / 1000} s…`);
            await esperar(espera);
        }
    }
}

async function imagensDoWikidata(ibges) {
    const valores = ibges.map((ibge) => `"${ibge}"`).join(' ');
    const consulta = `SELECT ?ibge (SAMPLE(?img) AS ?foto) WHERE { VALUES ?ibge { ${valores} } ?m wdt:P1585 ?ibge . ?m wdt:P18 ?img } GROUP BY ?ibge`;
    const corpo = new URLSearchParams({ query: consulta, format: 'json' }).toString();
    const dados = await baixar(SPARQL, {
        metodo: 'POST', corpo, arquivoCache: `wikidata-fotos-${resumo(consulta)}.json`, fonte: 'Wikidata (imagens dos municípios)',
    });
    const linhas = JSON.parse(dados.toString('utf8')).results.bindings;
    return new Map(linhas.map((linha) => [Number(linha.ibge.value), arquivoDaImagem(linha.foto.value)]));
}

// imageinfo de um lote de arquivos numa largura; devolve título pedido → imageinfo.
async function imageinfo(arquivos, largura) {
    const titulos = arquivos.map((arquivo) => `File:${arquivo}`);
    const parametros = new URLSearchParams({
        action: 'query', format: 'json', formatversion: '2', redirects: '1', prop: 'imageinfo',
        iiprop: 'url|extmetadata', iiurlwidth: String(largura), iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl',
        titles: titulos.join('|'),
    });
    const dados = await baixarComPaciencia(`${COMMONS}?${parametros}`, {
        arquivoCache: `commons-fotos-${largura}-${resumo(titulos.join('|'))}.json`, fonte: 'Wikimedia Commons (créditos das fotos)', pausaMs: 1500,
    });
    const { query } = JSON.parse(dados.toString('utf8'));
    const renomeados = new Map([...(query.normalized ?? []), ...(query.redirects ?? [])].map(({ from, to }) => [from, to]));
    const porTitulo = new Map(query.pages.map((pagina) => [pagina.title, pagina.imageinfo?.[0]]));
    const resolver = (titulo) => (renomeados.has(titulo) ? resolver(renomeados.get(titulo)) : titulo);
    return new Map(titulos.map((titulo) => [titulo, porTitulo.get(resolver(titulo))]));
}

export async function coletarFotos(ibges) {
    const arquivos = await imagensDoWikidata(ibges);
    const unicos = [...new Set(arquivos.values())];
    const grandes = new Map();
    const pequenas = new Map();
    for (let inicio = 0; inicio < unicos.length; inicio += POR_LOTE) {
        const lote = unicos.slice(inicio, inicio + POR_LOTE);
        for (const [titulo, info] of await imageinfo(lote, LARGURA_GRANDE)) grandes.set(titulo, info);
        for (const [titulo, info] of await imageinfo(lote, LARGURA_MINIATURA)) pequenas.set(titulo, info);
    }

    const porIbge = new Map();
    const avisos = [];
    for (const ibge of ibges) {
        const arquivo = arquivos.get(ibge);
        if (!arquivo) {
            avisos.push(`sem foto no Wikidata: ${ibge}`);
            continue;
        }
        const foto = montarFoto(grandes.get(`File:${arquivo}`), pequenas.get(`File:${arquivo}`));
        if (foto) porIbge.set(ibge, foto);
        else avisos.push(`foto sem licença conhecida, ignorada: ${ibge} (${arquivo})`);
    }
    return {
        porIbge,
        avisos,
        fonte: { nome: 'Wikidata e Wikimedia Commons', url: 'https://commons.wikimedia.org' },
    };
}
