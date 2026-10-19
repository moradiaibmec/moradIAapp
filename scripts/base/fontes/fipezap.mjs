// FipeZap: preço médio de locação residencial (R$/m²) do último mês de cada cidade.
import ExcelJS from 'exceljs';
import { baixar } from '../baixar.mjs';
import { casarAbasFipezap } from '../lib/fipezap.mjs';

const URL = 'https://downloads.fipe.org.br/indices/fipezap/fipezap-serieshistoricas.xlsx';
const ABAS_QUE_NAO_SAO_CIDADES = new Set(['Resumo', 'Aux', 'Índice FipeZAP']);

const valorDaCelula = (celula) => {
    const valor = celula?.value;
    if (valor && typeof valor === 'object' && 'result' in valor) return valor.result;
    if (valor && typeof valor === 'object' && Array.isArray(valor.richText)) return valor.richText.map((parte) => parte.text).join('');
    return valor;
};

// Coluna "Preço médio (R$/m²)" Total dentro da seção de locação (linhas 2 e 3 do cabeçalho de cada aba).
// A seção se chama "Locação" ou "Preços de locação", conforme a aba.
function colunaDoPrecoDeLocacao(aba) {
    let dentroDeLocacao = false;
    const secoes = aba.getRow(2);
    const titulos = aba.getRow(3);
    for (let coluna = 1; coluna <= aba.columnCount; coluna += 1) {
        const secao = valorDaCelula(secoes.getCell(coluna));
        if (typeof secao === 'string' && secao.trim()) dentroDeLocacao = /loca[cç][aã]o/i.test(secao);
        const titulo = valorDaCelula(titulos.getCell(coluna));
        if (dentroDeLocacao && typeof titulo === 'string' && titulo.startsWith('Preço médio')) return coluna;
    }
    return null;
}

function ultimoPreco(aba, coluna) {
    for (let linha = aba.rowCount; linha >= 5; linha -= 1) {
        const valor = valorDaCelula(aba.getRow(linha).getCell(coluna));
        if (typeof valor === 'number') return { m2: valor, data: valorDaCelula(aba.getRow(linha).getCell(2)) };
    }
    return null;
}

// Devolve { porIbge: Map<ibge, R$/m²>, periodo, avisos }.
export async function coletarFipezap(municipios) {
    const planilha = new ExcelJS.Workbook();
    await planilha.xlsx.load(await baixar(URL, { arquivoCache: 'fipezap.xlsx', fonte: 'FipeZap' }));

    const abas = planilha.worksheets.filter((aba) => !ABAS_QUE_NAO_SAO_CIDADES.has(aba.name));
    const { casadas, naoEncontradas } = casarAbasFipezap(abas.map((aba) => aba.name), municipios);
    const porIbge = new Map();
    const avisos = naoEncontradas.map((aba) => `FipeZap: aba "${aba}" sem município correspondente`);
    let ultimaData = null;

    for (const aba of abas) {
        const ibge = casadas.get(aba.name);
        const coluna = ibge && colunaDoPrecoDeLocacao(aba);
        if (!coluna) continue;
        const preco = ultimoPreco(aba, coluna);
        if (!preco) continue;
        porIbge.set(ibge, preco.m2);
        if (preco.data instanceof Date && (!ultimaData || preco.data > ultimaData)) ultimaData = preco.data;
    }

    const periodo = ultimaData
        ? ultimaData.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' }).replace(' de ', '/').replace('.', '')
        : 'último mês disponível';
    return { porIbge, periodo, url: URL, avisos };
}
