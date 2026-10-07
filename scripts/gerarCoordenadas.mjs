// Gera src/dados/coordenadasMunicipios.json: { "Nome, UF": [lat, lon] }.
// Uso: node scripts/gerarCoordenadas.mjs
import { readFile, writeFile } from 'node:fs/promises';

const URL_IBGE = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado';
const URL_COORDENADAS = 'https://raw.githubusercontent.com/kelvins/municipios-brasileiros/main/csv/municipios.csv';
const DESTINO = new URL('../src/dados/coordenadasMunicipios.json', import.meta.url);
const LISTA_DE_NOMES = new URL('../src/dados/municipios.json', import.meta.url);

async function baixar(url) {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Falha ao baixar ${url}: ${resposta.status}`);
    return resposta;
}

const municipiosIbge = await (await baixar(URL_IBGE)).json();
const csv = await (await baixar(URL_COORDENADAS)).text();

// Colunas: codigo_ibge,nome,latitude,longitude,...
const coordenadasPorCodigo = new Map(
    csv.trim().split('\n').slice(1).map((linha) => {
        const [codigo, , latitude, longitude] = linha.split(',');
        return [Number(codigo), [Number(latitude), Number(longitude)]];
    }),
);

const coordenadas = {};
const semCoordenada = [];
for (const municipio of municipiosIbge) {
    const nome = `${municipio['municipio-nome']}, ${municipio['UF-sigla']}`;
    const ponto = coordenadasPorCodigo.get(municipio['municipio-id']);
    if (ponto) coordenadas[nome] = ponto.map((valor) => Math.round(valor * 10000) / 10000);
    else semCoordenada.push(nome);
}

const nomesDaBusca = JSON.parse(await readFile(LISTA_DE_NOMES, 'utf8'));
const foraDaBusca = nomesDaBusca.filter((nome) => !coordenadas[nome]);

await writeFile(DESTINO, JSON.stringify(coordenadas));
console.log(`${Object.keys(coordenadas).length} municípios com coordenadas.`);
if (semCoordenada.length) console.warn('Sem coordenada no dataset:', semCoordenada);
if (foraDaBusca.length) console.warn('Nomes de municipios.json sem coordenada:', foraDaBusca);
