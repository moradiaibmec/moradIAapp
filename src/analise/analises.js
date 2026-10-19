// Formato das análises salvas na tabela `analises` (supabase/migrations/20261019_analises.sql).
import { VERSAO_QUESTIONARIO } from './respostas.js';

const CIDADES_SALVAS_POR_ANALISE = 10;

// Linha a inserir: as notas detalhadas ficam de fora, já que podem ser recalculadas a partir das respostas.
export function montarAnalise(respostas, resultados, versaoDados) {
    return {
        versao_questionario: VERSAO_QUESTIONARIO,
        versao_dados: versaoDados,
        respostas,
        resultados: resultados.slice(0, CIDADES_SALVAS_POR_ANALISE).map(({ ibge, cidade, match, pontosFortes, pontosAtencao }) => (
            { ibge, cidade, match, pontosFortes, pontosAtencao }
        )),
    };
}

// Formato do histórico usado pelos indicadores do Dashboard (src/dados/indicadores.js).
export function paraHistorico(linha) {
    return {
        id: linha.id,
        data: linha.criada_em,
        cidades: linha.resultados.map(({ cidade, match }) => {
            const corte = cidade.lastIndexOf(', ');
            return { nome: cidade.slice(0, corte), uf: cidade.slice(corte + 2), match };
        }),
    };
}
