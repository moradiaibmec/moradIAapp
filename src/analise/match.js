// Motor de score: transforma respostas + base de cidades em um ranking explicável.
// Regras em docs/superpowers/specs/2026-10-05-onboarding-analise-design.md ("Cálculo do match").
import { PILARES } from './opcoes.js';
import { aluguelDoDomicilio, aplicarFiltros } from './filtros.js';
import { sugerirPesos } from './prePreenchimento.js';
import { pontoMedioRenda } from './respostas.js';

const VALOR_PESO = { essencial: 3, importante: 1, tantoFaz: 0 };
const NOTA_NEUTRA = 50;
const PENALIDADE_ESSENCIAL = 0.85;
const LIMITE_ESSENCIAL_RUIM = 30;
const LIMITE_PONTO_FORTE = 70;
const LIMITE_PONTO_ATENCAO = 40;
const MAXIMO_PONTOS_FORTES = 3;
const BONUS_PRAIA = 15;
const PERDA_POR_GRAU = 15;
const COMPROMETIMENTO_IDEAL = 0.25;
const COMPROMETIMENTO_MAXIMO = 0.6;

const FAIXAS_TEMPERATURA = {
    calor: { indicador: 'tempMedia', minimo: 24, maximo: Infinity },
    ameno: { indicador: 'tempMedia', minimo: 18, maximo: 24 },
    frio: { indicador: 'tempMesFrio', minimo: -Infinity, maximo: 15 },
};

const ausente = (valor) => valor === null || valor === undefined;

// Fração (0–100) das outras cidades com valor menor; empates contam pela metade.
export function percentil(valor, valores) {
    const validos = valores.filter((v) => !ausente(v));
    if (validos.length <= 1) return NOTA_NEUTRA;
    const menores = validos.filter((v) => v < valor).length;
    const iguais = validos.filter((v) => v === valor).length;
    return (100 * (menores + 0.5 * (iguais - 1))) / (validos.length - 1);
}

export function notaTemperatura(temperatura, cidade) {
    const faixa = FAIXAS_TEMPERATURA[temperatura];
    if (!faixa) return null;
    const valor = cidade.indicadores[faixa.indicador];
    if (ausente(valor)) return null;
    const distancia = valor < faixa.minimo ? faixa.minimo - valor : valor > faixa.maximo ? valor - faixa.maximo : 0;
    return Math.max(0, 100 - PERDA_POR_GRAU * distancia);
}

export function notaCusto(comprometimento) {
    if (comprometimento <= COMPROMETIMENTO_IDEAL) return 100;
    if (comprometimento >= COMPROMETIMENTO_MAXIMO) return 0;
    return (100 * (COMPROMETIMENTO_MAXIMO - comprometimento)) / (COMPROMETIMENTO_MAXIMO - COMPROMETIMENTO_IDEAL);
}

function media(valores) {
    const validos = valores.filter((v) => !ausente(v));
    return validos.length ? validos.reduce((a, b) => a + b, 0) / validos.length : null;
}

// Cada pilar devolve { nota, bruto } ou null quando falta o dado.
function criarAvaliadores(respostas, universo) {
    const percentilDe = (extrair, cidade, invertido = false) => {
        const valor = extrair(cidade);
        if (ausente(valor)) return null;
        const p = percentil(valor, universo.map(extrair));
        return invertido ? 100 - p : p;
    };
    const indicador = (nome) => (cidade) => cidade.indicadores[nome];

    // Custo = só o aluguel do tamanho do domicílio, a régua conhecida do "até 30% da renda com moradia".
    const renda = pontoMedioRenda(respostas.orcamento.faixaRenda);
    const aluguel = (cidade) => aluguelDoDomicilio(cidade, respostas.domicilio);

    const { temperatura, chuvaIncomoda } = respostas.clima;
    const setores = respostas.trabalho.setores.filter((setor) => setor !== 'outro');
    const { filhosEscolares } = respostas.domicilio;
    const { ensinoSuperior } = respostas.trabalho;
    const ideb = (cidade) => {
        const { idebIniciais, idebFinais } = cidade.indicadores;
        return ausente(idebIniciais) || ausente(idebFinais) ? null : (idebIniciais + idebFinais) / 2;
    };

    return {
        custo(cidade) {
            const valor = aluguel(cidade);
            if (ausente(valor)) return null;
            // Sem renda informada, compara o aluguel entre as cidades.
            if (renda === null) return { nota: percentilDe(aluguel, cidade, true), bruto: valor };
            const comprometimento = valor / renda;
            return { nota: notaCusto(comprometimento), bruto: comprometimento };
        },
        seguranca(cidade) {
            const nota = percentilDe(indicador('homicidios100k'), cidade, true);
            return nota === null ? null : { nota, bruto: cidade.indicadores.homicidios100k };
        },
        clima(cidade) {
            const chuva = percentilDe(indicador('diasChuvaAno'), cidade, true);
            if (temperatura === 'tantoFaz') {
                if (!chuvaIncomoda) return { nota: NOTA_NEUTRA, bruto: cidade.indicadores.tempMedia };
                return chuva === null ? null : { nota: chuva, bruto: cidade.indicadores.diasChuvaAno };
            }
            const nota = notaTemperatura(temperatura, cidade);
            if (nota === null || (chuvaIncomoda && chuva === null)) return null;
            return { nota: chuvaIncomoda ? 0.7 * nota + 0.3 * chuva : nota, bruto: cidade.indicadores.tempMedia };
        },
        trabalho(cidade) {
            const geral = media([
                percentilDe(indicador('empregoPerCapita'), cidade),
                percentilDe(indicador('saldoEmprego12m'), cidade),
            ]);
            if (geral === null) return null;
            const doSetor = media(setores.map((setor) => percentilDe((c) => c.indicadores.empregoSetor?.[setor], cidade)));
            return { nota: doSetor === null ? geral : 0.6 * geral + 0.4 * doSetor, bruto: cidade.indicadores.empregoPerCapita };
        },
        saude(cidade) {
            const nota = media([percentilDe(indicador('medicos1k'), cidade), percentilDe(indicador('leitos1k'), cidade)]);
            return nota === null ? null : { nota, bruto: cidade.indicadores.medicos1k };
        },
        educacao(cidade) {
            const notaIdeb = percentilDe(ideb, cidade);
            const notaSuperior = percentilDe(indicador('vagasSuperior10k'), cidade);
            if (filhosEscolares && !ensinoSuperior) return notaIdeb === null ? null : { nota: notaIdeb, bruto: ideb(cidade) };
            if (ensinoSuperior && !filhosEscolares) {
                return notaSuperior === null ? null : { nota: notaSuperior, bruto: cidade.indicadores.vagasSuperior10k };
            }
            const nota = media([notaIdeb, notaSuperior]);
            return nota === null ? null : { nota, bruto: ideb(cidade) };
        },
        lazer(cidade) {
            const nota = percentilDe(indicador('lazer10k'), cidade);
            return nota === null ? null : { nota, bruto: cidade.indicadores.lazer10k };
        },
        natureza(cidade) {
            const parques = percentilDe(indicador('parquesM2Hab'), cidade);
            if (parques === null) return null;
            const bonus = respostas.onde.praia === 'bom' && cidade.litoranea ? BONUS_PRAIA : 0;
            return { nota: Math.min(100, parques + bonus), bruto: cidade.indicadores.parquesM2Hab };
        },
    };
}

function pesosEfetivos(respostas) {
    const pesos = respostas.pesos ?? sugerirPesos(respostas).pesos;
    const todosTantoFaz = PILARES.every(({ id }) => pesos[id] === 'tantoFaz');
    return Object.fromEntries(PILARES.map(({ id }) => [id, todosTantoFaz ? 1 : VALOR_PESO[pesos[id]]]));
}

export function calcularMatch(respostas, cidades) {
    const avaliadores = criarAvaliadores(respostas, cidades);
    const pesos = respostas.pesos ?? sugerirPesos(respostas).pesos;
    const valores = pesosEfetivos(respostas);
    const essenciais = PILARES.map(({ id }) => id).filter((id) => pesos[id] === 'essencial');

    const resultados = aplicarFiltros(respostas, cidades).map((cidade) => {
        const notas = {};
        for (const { id } of PILARES) {
            const avaliacao = avaliadores[id](cidade);
            notas[id] = avaliacao
                ? { nota: Math.round(avaliacao.nota), peso: pesos[id], bruto: avaliacao.bruto, dadoIndisponivel: false }
                : { nota: NOTA_NEUTRA, peso: pesos[id], bruto: null, dadoIndisponivel: true };
        }

        const somaPesos = PILARES.reduce((total, { id }) => total + valores[id], 0);
        let match = PILARES.reduce((total, { id }) => total + valores[id] * notas[id].nota, 0) / somaPesos;
        for (const id of essenciais) {
            if (!notas[id].dadoIndisponivel && notas[id].nota < LIMITE_ESSENCIAL_RUIM) match *= PENALIDADE_ESSENCIAL;
        }

        const comPeso = PILARES.map(({ id }) => id).filter((id) => pesos[id] !== 'tantoFaz' && !notas[id].dadoIndisponivel);
        const pontosFortes = comPeso
            .filter((id) => notas[id].nota >= LIMITE_PONTO_FORTE)
            .sort((a, b) => VALOR_PESO[pesos[b]] * notas[b].nota - VALOR_PESO[pesos[a]] * notas[a].nota)
            .slice(0, MAXIMO_PONTOS_FORTES);
        const pontosAtencao = comPeso.filter((id) => notas[id].nota < LIMITE_PONTO_ATENCAO);

        return { ibge: cidade.ibge, cidade: `${cidade.nome}, ${cidade.uf}`, match: Math.round(match), notas, pontosFortes, pontosAtencao };
    });

    // Empate: maior nota no primeiro pilar essencial; depois, ordem alfabética.
    const desempate = essenciais[0];
    return resultados.sort((a, b) => (
        b.match - a.match
        || (desempate ? b.notas[desempate].nota - a.notas[desempate].nota : 0)
        || a.cidade.localeCompare(b.cidade, 'pt-BR')
    ));
}
