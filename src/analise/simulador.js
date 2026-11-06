// Simulador de custo mensal da página da cidade.
// O aluguel vem da base; os demais gastos não existem por município, então é a pessoa quem os informa.
import { aluguelDoDomicilio } from './filtros.js';

export const LIMITE_MORADIA = 0.3; // a régua conhecida do "até 30% da renda com moradia"

export const CENARIOS_MORADIA = [
    { id: 'sozinho', rotulo: 'Sozinho(a)', domicilio: { moradia: 'sozinho', filhosEscolares: false } },
    { id: 'parceiro', rotulo: 'Com parceiro(a)', domicilio: { moradia: 'parceiro', filhosEscolares: false } },
    { id: 'familia', rotulo: 'Família, sem filhos na escola', domicilio: { moradia: 'familia', filhosEscolares: false } },
    { id: 'familiaFilhos', rotulo: 'Família, com filhos na escola', domicilio: { moradia: 'familia', filhosEscolares: true } },
    { id: 'amigos', rotulo: 'Dividindo com amigos', domicilio: { moradia: 'amigos', filhosEscolares: false } },
];

export const GASTOS = [
    { id: 'alimentacao', rotulo: 'Alimentação' },
    { id: 'transporte', rotulo: 'Transporte' },
    { id: 'contas', rotulo: 'Contas da casa' },
    { id: 'outros', rotulo: 'Lazer e outros' },
];

export const GASTOS_ZERADOS = Object.fromEntries(GASTOS.map(({ id }) => [id, 0]));

export function cenarioDoDomicilio({ moradia, filhosEscolares }) {
    if (moradia === 'familia' && filhosEscolares) return 'familiaFilhos';
    return CENARIOS_MORADIA.some(({ id }) => id === moradia) ? moradia : 'sozinho';
}

export function aluguelDoCenario(cidade, idCenario) {
    return aluguelDoDomicilio(cidade, CENARIOS_MORADIA.find(({ id }) => id === idCenario).domicilio);
}

// Lê o que foi digitado num campo de valor: só os dígitos contam; vazio vale 0.
export function lerValor(texto) {
    return Number(String(texto).replace(/\D/g, ''));
}

// Sem renda ou sem aluguel não há saldo a mostrar: `saldo` e `comprometimento` ficam nulos.
export function simular({ renda, aluguel, gastos }) {
    const fatia = (valor) => (renda ? Math.round((100 * valor) / renda) : null);
    const itens = [
        { id: 'moradia', rotulo: 'Moradia e aluguel', valor: aluguel ?? 0 },
        ...GASTOS.map(({ id, rotulo }) => ({ id, rotulo, valor: gastos[id] ?? 0 })).filter(({ valor }) => valor > 0),
    ].map((item) => ({ ...item, fatia: fatia(item.valor) }));

    const despesas = itens.reduce((total, { valor }) => total + valor, 0);
    const calculavel = Boolean(renda) && aluguel !== null;

    return {
        itens,
        despesas,
        saldo: calculavel ? renda - despesas : null,
        fatiaSaldo: calculavel ? fatia(renda - despesas) : null,
        comprometimento: calculavel ? aluguel / renda : null,
        acimaDoLimite: calculavel && aluguel / renda > LIMITE_MORADIA,
    };
}
