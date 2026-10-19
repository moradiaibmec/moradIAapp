// IBGE: universo de municípios (Censo 2022), Censo 2010 (aluguel) e Cadastro Central de Empresas (emprego).
import { readFile } from 'node:fs/promises';
import { baixar } from '../baixar.mjs';
import { medianaAluguel2010 } from '../lib/aluguel.mjs';
import { indicadoresEmprego, lazerPorMil } from '../lib/emprego.mjs';

const POPULACAO_MINIMA = 100000;
const URL_LOCALIDADES = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado';
const COORDENADAS = new URL('../../../src/dados/coordenadasMunicipios.json', import.meta.url);

// Classes do agregado 3511 (classificação 511), da menor para a maior faixa de aluguel.
const CLASSES_ALUGUEL_2010 = [13323, 13328, 13329, 13330, 13331, 13332, 13333, 13334];

// Seções CNAE do agregado 9510 (classificação 12762) usadas pelos setores.
const SECOES_CEMPRE = {
    Total: 117897, A: 116830, C: 116910, G: 117363, I: 117543, J: 117555, K: 117608,
    L: 117666, M: 117673, N: 117714, P: 117788, Q: 117810, R: 117838, S: 117861,
};

const numero = (valor) => (valor === undefined || valor === null || Number.isNaN(Number(valor)) ? null : Number(valor));

async function sidra(caminho, arquivoCache) {
    const url = `https://servicodados.ibge.gov.br/api/v3/agregados/${caminho}`;
    const dados = await baixar(url, { arquivoCache, fonte: 'IBGE SIDRA' });
    return JSON.parse(dados.toString('utf8'));
}

const localidades = (ibges) => (ibges ? `N6[${ibges.join(',')}]` : 'N6[all]');

export async function listarUniverso() {
    const municipios = JSON.parse((await baixar(URL_LOCALIDADES, { arquivoCache: 'ibge-municipios.json', fonte: 'IBGE localidades' })).toString('utf8'));
    const coordenadas = JSON.parse(await readFile(COORDENADAS, 'utf8'));
    const populacao = await sidra(
        `4709/periodos/2022/variaveis/93?localidades=${encodeURIComponent('N6[all]')}`,
        'ibge-populacao-2022.json',
    );
    const populacaoPorIbge = new Map(populacao[0].resultados[0].series.map((s) => [Number(s.localidade.id), numero(s.serie['2022'])]));

    const todos = municipios.map((m) => {
        const nome = m['municipio-nome'];
        const uf = m['UF-sigla'];
        const [lat, lon] = coordenadas[`${nome}, ${uf}`] ?? [null, null];
        return { ibge: m['municipio-id'], nome, uf, regiao: m['regiao-sigla'], lat, lon, populacao: populacaoPorIbge.get(m['municipio-id']) ?? null };
    });
    return {
        todos,
        universo: todos.filter((m) => m.populacao >= POPULACAO_MINIMA),
    };
}

// Mediana do aluguel em 2010 (R$ de 2010) para cada município pedido.
export async function coletarAluguel2010(ibges) {
    const classificacao = `511[${CLASSES_ALUGUEL_2010.join(',')}]|125[0]|137[0]|65[0]|74[0]`;
    const dados = await sidra(
        `3511/periodos/2010/variaveis/1549?localidades=${encodeURIComponent(localidades(ibges))}&classificacao=${encodeURIComponent(classificacao)}`,
        `ibge-aluguel-2010-${ibges.length}.json`,
    );
    const contagens = new Map();
    for (const resultado of dados[0].resultados) {
        const classe = Number(Object.keys(resultado.classificacoes.find((c) => c.id === '511').categoria)[0]);
        const posicao = CLASSES_ALUGUEL_2010.indexOf(classe);
        for (const serie of resultado.series) {
            const ibge = Number(serie.localidade.id);
            if (!contagens.has(ibge)) contagens.set(ibge, Array(CLASSES_ALUGUEL_2010.length).fill(0));
            contagens.get(ibge)[posicao] = numero(serie.serie['2010']) ?? 0;
        }
    }
    return new Map([...contagens].map(([ibge, lista]) => [ibge, medianaAluguel2010(lista)]));
}

export async function coletarEmprego(universo) {
    const classificacao = `12762[${Object.values(SECOES_CEMPRE).join(',')}]`;
    const dados = await sidra(
        `9510/periodos/2022|2024/variaveis/708?localidades=${encodeURIComponent(localidades(universo.map((m) => m.ibge)))}&classificacao=${encodeURIComponent(classificacao)}`,
        `ibge-cempre-${universo.length}.json`,
    );
    const letraDaCategoria = Object.fromEntries(Object.entries(SECOES_CEMPRE).map(([letra, id]) => [String(id), letra]));
    const porMunicipio = new Map();
    for (const resultado of dados[0].resultados) {
        const letra = letraDaCategoria[Object.keys(resultado.classificacoes[0].categoria)[0]];
        for (const serie of resultado.series) {
            const ibge = Number(serie.localidade.id);
            if (!porMunicipio.has(ibge)) porMunicipio.set(ibge, { 2022: {}, 2024: {} });
            porMunicipio.get(ibge)[2022][letra] = numero(serie.serie['2022']);
            porMunicipio.get(ibge)[2024][letra] = numero(serie.serie['2024']);
        }
    }

    const porIbge = new Map();
    for (const municipio of universo) {
        const anos = porMunicipio.get(municipio.ibge);
        if (!anos) continue;
        const { Total: total2024, ...porSecao } = anos[2024];
        porIbge.set(municipio.ibge, {
            ...indicadoresEmprego({ total2022: anos[2022].Total, total2024, porSecao }, municipio.populacao),
            lazer1k: lazerPorMil(porSecao, municipio.populacao),
        });
    }
    const fonte = { nome: 'IBGE, Cadastro Central de Empresas', periodo: '2022–2024', url: 'https://sidra.ibge.gov.br/tabela/9510' };
    return {
        porIbge,
        fonte: {
            empregoPerCapita: fonte,
            crescimentoEmprego: fonte,
            empregoSetor: fonte,
            lazer1k: { ...fonte, nome: 'IBGE, Cadastro Central de Empresas (alimentação, hospedagem, artes e recreação)', periodo: '2024' },
        },
        avisos: universo.filter((m) => !porIbge.has(m.ibge)).map((m) => `CEMPRE sem dado para ${m.nome}, ${m.uf}`),
    };
}

// Natureza: % dos domicílios com 5 ou mais árvores na face de quadra (Censo 2022, pesquisa do entorno, agregado 9585).
export async function coletarArborizacao(universo) {
    const classificacao = '11275[91176]|14[72281]';
    const dados = await sidra(
        `9585/periodos/2022/variaveis/1009599?localidades=${encodeURIComponent(localidades(universo.map((m) => m.ibge)))}&classificacao=${encodeURIComponent(classificacao)}`,
        `ibge-arborizacao-${universo.length}.json`,
    );
    const porIbge = new Map();
    for (const serie of dados[0].resultados[0].series) {
        const valor = numero(serie.serie['2022']);
        if (valor !== null) porIbge.set(Number(serie.localidade.id), { arborizacao: valor });
    }
    return {
        porIbge,
        fonte: { arborizacao: { nome: 'IBGE, Censo 2022 (entorno dos domicílios)', periodo: '2022', url: 'https://sidra.ibge.gov.br/tabela/9585' } },
        avisos: universo.filter((m) => !porIbge.has(m.ibge)).map((m) => `Sem arborização para ${m.nome}, ${m.uf}`),
    };
}
