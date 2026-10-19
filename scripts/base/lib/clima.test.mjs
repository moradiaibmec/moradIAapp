import { describe, expect, it } from 'vitest';
import { resumirClima } from './clima.mjs';

// Dois anos sintéticos: janeiro a 25 °C, julho a 10 °C, demais meses a 20 °C; chuva ≥ 1 mm nos dias 1 a 30 de março.
function diarioSintetico() {
    const time = [], temperature_2m_mean = [], precipitation_sum = [];
    for (const ano of [2015, 2016]) {
        for (let dia = new Date(Date.UTC(ano, 0, 1)); dia.getUTCFullYear() === ano; dia.setUTCDate(dia.getUTCDate() + 1)) {
            const mes = dia.getUTCMonth();
            time.push(dia.toISOString().slice(0, 10));
            temperature_2m_mean.push(mes === 0 ? 25 : mes === 6 ? 10 : 20);
            precipitation_sum.push(mes === 2 && dia.getUTCDate() <= 30 ? 5 : 0.2);
        }
    }
    return { time, temperature_2m_mean, precipitation_sum };
}

describe('resumirClima', () => {
    it('resume temperatura por mês do calendário e dias de chuva por ano', () => {
        const clima = resumirClima(diarioSintetico());
        expect(clima.tempMesQuente).toBe(25);
        expect(clima.tempMesFrio).toBe(10);
        expect(clima.diasChuvaAno).toBe(30);
        expect(clima.tempMedia).toBeGreaterThan(19);
        expect(clima.tempMedia).toBeLessThan(21);
    });
});
