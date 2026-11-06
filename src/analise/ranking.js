// Lista da tela de ranking completo: busca por nome e ordenação por um critério, sem perder a posição no ranking.
import { normalizar } from '../componentes/BuscaCidade/busca.js';

// `ordem`: id de um pilar, ou nulo para a ordem do match. Cidades sem dado no pilar vão para o fim.
export function montarRanking(resultados, { termo = '', ordem = null } = {}) {
    const busca = normalizar(termo);
    const linhas = resultados
        .map((resultado, posicao) => ({ resultado, posicao }))
        .filter(({ resultado }) => normalizar(resultado.cidade).includes(busca));
    if (!ordem) return linhas;

    const nota = ({ resultado }) => (resultado.notas[ordem].dadoIndisponivel ? -1 : resultado.notas[ordem].nota);
    return linhas.sort((a, b) => nota(b) - nota(a) || a.posicao - b.posicao);
}
