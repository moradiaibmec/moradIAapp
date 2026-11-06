import { useState } from 'react';
import { pontoMedioRenda } from '../../analise/respostas.js';
import { GASTOS_ZERADOS, aluguelDoCenario, cenarioDoDomicilio, simular } from '../../analise/simulador.js';

// O cenário fica na página, e não no cartão, para sobreviver à troca de abas.
export function useSimulador(cidade, respostas) {
    const original = {
        renda: pontoMedioRenda(respostas.orcamento.faixaRenda),
        cenario: cenarioDoDomicilio(respostas.domicilio),
        gastos: GASTOS_ZERADOS,
    };
    const [valores, setValores] = useState(original);
    const aluguel = aluguelDoCenario(cidade, valores.cenario);

    return {
        ...valores,
        aluguel,
        simulacao: simular({ renda: valores.renda, aluguel, gastos: valores.gastos }),
        alterado: JSON.stringify(valores) !== JSON.stringify(original),
        alterarRenda: (renda) => setValores((atuais) => ({ ...atuais, renda })),
        alterarCenario: (cenario) => setValores((atuais) => ({ ...atuais, cenario })),
        alterarGasto: (id, valor) => setValores((atuais) => ({ ...atuais, gastos: { ...atuais.gastos, [id]: valor } })),
        restaurar: () => setValores(original),
    };
}
