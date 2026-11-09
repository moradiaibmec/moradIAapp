// Conteúdo do relatório da análise, usado para gerar o PDF e o resumo de compartilhamento.
// Como ele pode ser enviado a outras pessoas, não traz nome nem nada que revele a renda.
import { fraseDoPilar, lemaDaCidade, porQueCombina, qualificarMatch, qualificarNota } from './explicacao.js';
import { nomeDoEstado } from './formatacao.js';
import { limitacoes, resumoDaBase } from './metodologia.js';
import { PILARES } from './opcoes.js';
import { pontoMedioRenda } from './respostas.js';

const CIDADES_NO_RELATORIO = 10;
const CIDADES_NO_RESUMO = 3;
const FUSO = 'America/Sao_Paulo';

const dataPorExtenso = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: FUSO });
const dataIso = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO });

const rotuloDoPilar = (id) => PILARES.find((pilar) => pilar.id === id).rotulo;

// Com a renda informada, a frase do custo diz quanto do orçamento o aluguel consome: isso revelaria a renda.
function fraseSemRenda(id, avaliacao, respostas) {
    if (id === 'custo' && !avaliacao.dadoIndisponivel && pontoMedioRenda(respostas.orcamento.faixaRenda) !== null) return '';
    return fraseDoPilar(id, avaliacao, respostas);
}

function indicadoresDa(resultado, respostas) {
    return PILARES.map(({ id, rotulo }) => {
        const avaliacao = resultado.notas[id];
        const semDado = Boolean(avaliacao.dadoIndisponivel);
        return {
            id,
            rotulo,
            nota: semDado ? null : avaliacao.nota,
            qualificacao: semDado ? 'Sem dado' : qualificarNota(avaliacao.nota),
            frase: fraseSemRenda(id, avaliacao, respostas),
            estimado: Boolean(avaliacao.estimado),
            pesou: avaliacao.peso !== 'tantoFaz',
        };
    });
}

function citacoes(fontes = {}) {
    return [...new Set(Object.values(fontes).map(({ nome, periodo }) => `${nome}, ${periodo}`))];
}

export function montarRelatorio({ respostas, resultados, cidades, fontes, data }) {
    const momento = new Date(data);
    const selecionados = resultados.slice(0, CIDADES_NO_RELATORIO);
    const pesos = respostas.pesos ?? {};
    const comPeso = (peso) => PILARES.filter(({ id }) => pesos[id] === peso).map(({ rotulo }) => rotulo);

    return {
        data: dataPorExtenso.format(momento),
        nomeArquivo: `moradia-relatorio-${dataIso.format(momento)}.pdf`,
        totalCidades: resultados.length,
        prioridades: { essenciais: comPeso('essencial'), importantes: comPeso('importante') },
        ranking: selecionados.map(({ cidade, match }, indice) => ({
            posicao: indice + 1, cidade, match, qualificacao: qualificarMatch(match),
        })),
        cidades: selecionados.map((resultado, indice) => {
            const dados = cidades.find(({ ibge }) => ibge === resultado.ibge);
            return {
                posicao: indice + 1,
                cidade: resultado.cidade,
                estado: dados ? nomeDoEstado(dados.uf) : null,
                match: resultado.match,
                qualificacao: qualificarMatch(resultado.match),
                lema: lemaDaCidade(resultado),
                porQue: porQueCombina(resultado),
                indicadores: indicadoresDa(resultado, respostas),
                pontosFortes: resultado.pontosFortes.map(rotuloDoPilar),
                pontosAtencao: resultado.pontosAtencao.map((id) => ({
                    rotulo: rotuloDoPilar(id),
                    frase: fraseSemRenda(id, resultado.notas[id], respostas),
                })),
            };
        }),
        // O PDF lista as limitações em texto corrido, com o título à frente.
        limitacoes: limitacoes(resumoDaBase({ cidades, fontes })).map(({ titulo, texto }) => `${titulo}: ${texto[0].toLowerCase()}${texto.slice(1)}`),
        fontes: citacoes(fontes),
    };
}

export function textoParaCompartilhar({ ranking }) {
    const linhas = ranking.slice(0, CIDADES_NO_RESUMO).map(({ posicao, cidade, match }) => `${posicao}. ${cidade}: ${match}% de match`);
    return ['Meu resultado no MoradIA, as cidades que mais combinam comigo:', ...linhas].join('\n');
}
