// Dados das abas da página da cidade, sempre comparados com o restante da base.
import { SETORES } from './opcoes.js';
import { percentil } from './match.js';

const ausente = (valor) => valor === null || valor === undefined;

// "Maior que 72% das cidades da base"; `rotulo` troca o "Maior" ("Mais caro", "Mais quente"...).
export function comparacaoNaBase(cidades, extrair, valor, rotulo = 'Maior') {
    if (ausente(valor)) return '';
    return `${rotulo} que ${Math.round(percentil(valor, cidades.map(extrair)))}% das cidades da base`;
}

// Aluguel por tamanho de domicílio, para a tabela da aba de custo.
export function alugueisPorTamanho(cidade) {
    const { aluguel } = cidade.indicadores;
    if (!aluguel) return [];
    return [1, 2, 3, 4]
        .filter((pessoas) => !ausente(aluguel[pessoas]))
        .map((pessoas) => ({ pessoas, valor: aluguel[pessoas] }));
}

// Setores do maior para o menor; os escolhidos na análise vêm marcados. "Outro" não tem dado.
export function setoresDaCidade(cidade, escolhidos = []) {
    const participacao = cidade.indicadores.empregoSetor ?? {};
    return SETORES
        .filter(({ id }) => !ausente(participacao[id]))
        .map(({ id, rotulo }) => ({ id, rotulo, participacao: participacao[id], escolhido: escolhidos.includes(id) }))
        .sort((a, b) => b.participacao - a.participacao);
}

// "Fonte: <nome>, <período>" de um indicador; vazio se a fonte não for conhecida.
export function citarFonte(fontes = {}, indicador) {
    const fonte = fontes[indicador];
    return fonte ? `Fonte: ${fonte.nome}, ${fonte.periodo}` : '';
}
