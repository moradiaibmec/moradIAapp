// Ipeadata: número de homicídios por município (Atlas da Violência, fonte DataSUS).
// A série de taxa pronta (AVIOL12_THOMIC) tem erros, por isso a taxa é calculada a partir do número absoluto.
import { baixar } from '../baixar.mjs';
import { taxaHomicidios } from '../lib/homicidios.mjs';

const SERIE = 'AVIOL12_HOMIC';
const ANOS = ['2020', '2021', '2022'];
const URL = `http://www.ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='${SERIE}')`;

export async function coletarHomicidios(universo) {
    const dados = JSON.parse((await baixar(URL, { arquivoCache: 'ipeadata-homicidios.json', fonte: 'Ipeadata' })).toString('utf8'));
    const porMunicipio = new Map();
    for (const valor of dados.value) {
        const ano = valor.VALDATA.slice(0, 4);
        if (valor.NIVNOME !== 'Municípios' || !ANOS.includes(ano)) continue;
        const ibge = Number(valor.TERCODIGO);
        if (!porMunicipio.has(ibge)) porMunicipio.set(ibge, {});
        porMunicipio.get(ibge)[ano] = valor.VALVALOR;
    }

    const porIbge = new Map();
    const avisos = [];
    for (const municipio of universo) {
        const porAno = porMunicipio.get(municipio.ibge);
        const taxa = porAno ? taxaHomicidios(porAno, municipio.populacao) : null;
        if (taxa === null) avisos.push(`Ipeadata sem homicídios para ${municipio.nome}, ${municipio.uf}`);
        else porIbge.set(municipio.ibge, { homicidios100k: Math.round(taxa * 10) / 10 });
    }
    return {
        porIbge,
        fonte: { homicidios100k: { nome: 'Atlas da Violência / DataSUS (Ipeadata)', periodo: '2020–2022', url: 'http://www.ipeadata.gov.br' } },
        avisos,
    };
}
