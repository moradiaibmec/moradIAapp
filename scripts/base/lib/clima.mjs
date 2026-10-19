// Resumo de uma série diária do Open-Meteo (temperatura média e chuva) em normais do município.

const CHUVA_MINIMA_MM = 1;
const umaCasa = (valor) => Math.round(valor * 10) / 10;

export function resumirClima({ time, temperature_2m_mean: temperaturas, precipitation_sum: chuvas }) {
    const porMes = Array.from({ length: 12 }, () => ({ soma: 0, dias: 0 }));
    const anos = new Set();
    let somaTotal = 0;
    let diasComTemperatura = 0;
    let diasDeChuva = 0;

    time.forEach((data, i) => {
        anos.add(data.slice(0, 4));
        const temperatura = temperaturas[i];
        if (temperatura !== null && temperatura !== undefined) {
            const mes = Number(data.slice(5, 7)) - 1;
            porMes[mes].soma += temperatura;
            porMes[mes].dias += 1;
            somaTotal += temperatura;
            diasComTemperatura += 1;
        }
        if ((chuvas[i] ?? 0) >= CHUVA_MINIMA_MM) diasDeChuva += 1;
    });

    const mediasMensais = porMes.filter(({ dias }) => dias > 0).map(({ soma, dias }) => soma / dias);
    return {
        tempMedia: umaCasa(somaTotal / diasComTemperatura),
        tempMesFrio: umaCasa(Math.min(...mediasMensais)),
        tempMesQuente: umaCasa(Math.max(...mediasMensais)),
        diasChuvaAno: umaCasa(diasDeChuva / anos.size),
    };
}
