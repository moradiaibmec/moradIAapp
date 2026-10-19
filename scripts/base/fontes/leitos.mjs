// Ministério da Saúde (CNES): leitos existentes (SUS e não SUS) por município, no mês mais recente do arquivo.
import { unzipSync } from 'fflate';
import { baixar } from '../baixar.mjs';

const ANO = 2026;
const URL = `https://s3.sa-east-1.amazonaws.com/ckan.saude.gov.br/Leitos_SUS/Leitos_csv_${ANO}.zip`;

const semAspas = (texto) => texto.replace(/^"|"$/g, '');

export async function coletarLeitos(universo) {
    const zip = await baixar(URL, { arquivoCache: `leitos-${ANO}.zip`, fonte: 'Ministério da Saúde, Leitos' });
    const [, bytes] = Object.entries(unzipSync(new Uint8Array(zip))).find(([nome]) => nome.toLowerCase().endsWith('.csv'));
    const [cabecalho, ...linhas] = Buffer.from(bytes).toString('latin1').split(/\r?\n/).filter(Boolean);
    const colunas = cabecalho.split(';').map(semAspas);
    const iComp = colunas.indexOf('COMP');
    const iIbge = colunas.indexOf('CO_IBGE');
    const iLeitos = colunas.indexOf('LEITOS_EXISTENTES');

    const registros = linhas.map((linha) => linha.split(';').map(semAspas));
    const ultimaCompetencia = registros.reduce((maior, r) => (r[iComp] > maior ? r[iComp] : maior), '');
    const leitosPorCodigo6 = new Map();
    for (const r of registros) {
        if (r[iComp] !== ultimaCompetencia) continue;
        const codigo = Number(r[iIbge]);
        leitosPorCodigo6.set(codigo, (leitosPorCodigo6.get(codigo) ?? 0) + (Number(r[iLeitos]) || 0));
    }

    const porIbge = new Map();
    const avisos = [];
    for (const municipio of universo) {
        // Município fora do arquivo não tem nenhum estabelecimento com leito: 0, não "sem dado".
        const leitos = leitosPorCodigo6.get(Math.floor(municipio.ibge / 10)) ?? 0;
        if (leitos === 0) avisos.push(`Nenhum leito cadastrado em ${municipio.nome}, ${municipio.uf} (registrado como 0)`);
        porIbge.set(municipio.ibge, { leitos1k: Math.round((leitos * 10000) / municipio.populacao) / 10 });
    }
    const periodo = `${ultimaCompetencia.slice(4, 6)}/${ultimaCompetencia.slice(0, 4)}`;
    return {
        porIbge,
        fonte: { leitos1k: { nome: 'Ministério da Saúde, CNES (leitos)', periodo, url: URL } },
        avisos,
    };
}
