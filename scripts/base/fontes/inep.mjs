// INEP: Ideb 2023 da rede pública por município (anos iniciais e finais) e vagas presenciais no ensino superior (Censo 2023).
import ExcelJS from 'exceljs';
import { unzipSync } from 'fflate';
import { baixar } from '../baixar.mjs';

const URL_IDEB = (etapa) => `https://download.inep.gov.br/ideb/resultados/divulgacao_anos_${etapa}_municipios_2023.zip`;
const URL_SUPERIOR = 'https://download.inep.gov.br/microdados/microdados_censo_da_educacao_superior_2023.zip';
const LINHA_DOS_CODIGOS = 10;
const MODALIDADE_PRESENCIAL = '1';

async function idebPublico(etapa) {
    const zip = await baixar(URL_IDEB(etapa), { arquivoCache: `inep-divulgacao_anos_${etapa}_municipios_2023.zip`, fonte: `INEP Ideb anos ${etapa}` });
    const [, bytes] = Object.entries(unzipSync(new Uint8Array(zip))).find(([nome]) => nome.endsWith('.xlsx'));
    const planilha = new ExcelJS.Workbook();
    await planilha.xlsx.load(Buffer.from(bytes));
    const aba = planilha.worksheets[0];
    const codigos = aba.getRow(LINHA_DOS_CODIGOS).values;
    const [iMunicipio, iRede, iIdeb] = ['CO_MUNICIPIO', 'REDE', 'VL_OBSERVADO_2023'].map((codigo) => codigos.indexOf(codigo));

    const porIbge = new Map();
    aba.eachRow((linha, numero) => {
        if (numero <= LINHA_DOS_CODIGOS || linha.values[iRede] !== 'Pública') return;
        const ideb = linha.values[iIdeb];
        if (typeof ideb === 'number') porIbge.set(Number(linha.values[iMunicipio]), ideb);
    });
    return porIbge;
}

async function vagasPresenciais() {
    const zip = await baixar(URL_SUPERIOR, { arquivoCache: 'inep-superior-2023.zip', fonte: 'INEP Censo da Educação Superior' });
    const arquivos = unzipSync(new Uint8Array(zip), { filter: (f) => /CADASTRO_CURSOS.*\.csv$/i.test(f.name) });
    const [, bytes] = Object.entries(arquivos)[0];
    const [cabecalho, ...linhas] = Buffer.from(bytes).toString('latin1').split(/\r?\n/).filter(Boolean);
    const colunas = cabecalho.split(';');
    const [iMunicipio, iModalidade, iVagas] = ['CO_MUNICIPIO', 'TP_MODALIDADE_ENSINO', 'QT_VG_TOTAL'].map((nome) => colunas.indexOf(nome));

    const porIbge = new Map();
    for (const linha of linhas) {
        const campos = linha.split(';');
        if (campos[iModalidade] !== MODALIDADE_PRESENCIAL) continue;
        const ibge = Number(campos[iMunicipio]);
        porIbge.set(ibge, (porIbge.get(ibge) ?? 0) + (Number(campos[iVagas]) || 0));
    }
    return porIbge;
}

export async function coletarInep(universo) {
    const [iniciais, finais, vagas] = [await idebPublico('iniciais'), await idebPublico('finais'), await vagasPresenciais()];
    const porIbge = new Map();
    const avisos = [];
    for (const municipio of universo) {
        const vagasDoMunicipio = vagas.get(municipio.ibge) ?? 0;
        porIbge.set(municipio.ibge, {
            idebIniciais: iniciais.get(municipio.ibge) ?? null,
            idebFinais: finais.get(municipio.ibge) ?? null,
            vagasSuperior10k: Math.round((vagasDoMunicipio * 100000) / municipio.populacao) / 10,
        });
        if (!iniciais.has(municipio.ibge) || !finais.has(municipio.ibge)) avisos.push(`Ideb incompleto para ${municipio.nome}, ${municipio.uf}`);
    }
    const ideb = { nome: 'INEP, Ideb (rede pública)', periodo: '2023', url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb' };
    return {
        porIbge,
        fonte: {
            idebIniciais: ideb,
            idebFinais: ideb,
            vagasSuperior10k: { nome: 'INEP, Censo da Educação Superior (cursos presenciais)', periodo: '2023', url: URL_SUPERIOR },
        },
        avisos,
    };
}
