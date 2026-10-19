// IBGE: municípios defrontantes com o mar (2024). Lê o .dbf do shapefile das sedes, que traz o código IBGE.
import { unzipSync } from 'fflate';
import { baixar } from '../baixar.mjs';

const URL = 'https://geoftp.ibge.gov.br/organizacao_do_territorio/estrutura_territorial/municipios_defrontantes_com_o_mar/2024/Sedes_Municipios_Defrontantes_com_o_Mar_2024_shp.zip';

// Leitor mínimo de dBase III: cabeçalho de 32 bytes, descritores de campo de 32 bytes até 0x0D, registros de tamanho fixo.
function lerDbf(dbf) {
    const registros = dbf.readUInt32LE(4);
    const tamanhoCabecalho = dbf.readUInt16LE(8);
    const tamanhoRegistro = dbf.readUInt16LE(10);
    const campos = [];
    for (let posicao = 32; dbf[posicao] !== 0x0d; posicao += 32) {
        campos.push({ nome: dbf.toString('latin1', posicao, posicao + 11).replace(/\0.*/, ''), tamanho: dbf[posicao + 16] });
    }
    const linhas = [];
    for (let i = 0; i < registros; i += 1) {
        let posicao = tamanhoCabecalho + i * tamanhoRegistro + 1; // o primeiro byte marca registro apagado
        const linha = {};
        for (const { nome, tamanho } of campos) {
            linha[nome] = dbf.toString('utf8', posicao, posicao + tamanho).trim();
            posicao += tamanho;
        }
        linhas.push(linha);
    }
    return linhas;
}

export async function coletarLitoral() {
    const zip = await baixar(URL, { arquivoCache: 'ibge-defrontantes-2024.zip', fonte: 'IBGE municípios defrontantes com o mar' });
    const arquivos = unzipSync(new Uint8Array(zip));
    const [, dbf] = Object.entries(arquivos).find(([nome]) => nome.toLowerCase().endsWith('.dbf'));
    const codigos = new Set(lerDbf(Buffer.from(dbf)).map((linha) => Number(linha.CD_MUN)));
    return {
        litoraneas: codigos,
        fonte: { litoranea: { nome: 'IBGE, municípios defrontantes com o mar', periodo: '2024', url: URL } },
    };
}
