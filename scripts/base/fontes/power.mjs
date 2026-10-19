// NASA POWER: temperatura média diária e chuva diária (reanálise MERRA-2), 2015–2024, nas coordenadas da cidade.
// Substitui o Open-Meteo, cujo plano gratuito não comporta 10 anos de dados para ~320 cidades (ver ledger da Tarefa 6).
import { baixar } from '../baixar.mjs';
import { resumirClima } from '../lib/clima.mjs';

const PAUSA_MS = 1000;
const VALOR_AUSENTE = -999;

const url = ({ lat, lon }) => 'https://power.larc.nasa.gov/api/temporal/daily/point'
    + `?parameters=T2M,PRECTOTCORR&community=RE&longitude=${lon}&latitude=${lat}&start=20150101&end=20241231&format=JSON`;

const valor = (v) => (v === VALOR_AUSENTE ? null : v);

export async function coletarClima(universo) {
    const porIbge = new Map();
    const avisos = [];
    for (const municipio of universo) {
        try {
            const dados = JSON.parse((await baixar(url(municipio), {
                arquivoCache: `power-${municipio.ibge}.json`, fonte: 'NASA POWER', pausaMs: PAUSA_MS,
            })).toString('utf8'));
            const { T2M, PRECTOTCORR } = dados.properties.parameter;
            const dias = Object.keys(T2M).sort();
            porIbge.set(municipio.ibge, resumirClima({
                time: dias.map((d) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`),
                temperature_2m_mean: dias.map((d) => valor(T2M[d])),
                precipitation_sum: dias.map((d) => valor(PRECTOTCORR[d])),
            }));
        } catch (erro) {
            avisos.push(`Clima indisponível para ${municipio.nome}, ${municipio.uf}: ${erro.message}`);
        }
    }
    const fonte = { nome: 'NASA POWER, reanálise MERRA-2', periodo: '2015–2024', url: 'https://power.larc.nasa.gov' };
    return {
        porIbge,
        fonte: { tempMedia: fonte, tempMesFrio: fonte, tempMesQuente: fonte, diasChuvaAno: fonte },
        avisos,
    };
}
