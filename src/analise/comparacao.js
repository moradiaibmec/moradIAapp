// Comparação lado a lado de 2 a 3 cidades, montada só a partir dos dados do match.
// Além das cidades do ranking, dá para comparar qualquer cidade da base, mesmo as eliminadas pelos filtros.
import { PILARES } from './opcoes.js';
import { listar, nomeDaCidade, nomesNoTexto } from './explicacao.js';
import { normalizar } from '../componentes/BuscaCidade/busca.js';

export const MINIMO_COMPARADAS = 2;
export const MAXIMO_COMPARADAS = 3;

const ORDEM_PESO = { essencial: 0, importante: 1, tantoFaz: 2 };
const MAXIMO_LIDERADOS_NO_TEXTO = 3;
const MAXIMO_DESTAQUES_ALTERNATIVA = 2;
const LIMITE_BUSCA = 8;

export const ROTULO_PESO = { essencial: 'Peso alto', importante: 'Peso médio', tantoFaz: 'Peso baixo' };

// Pilares do mais ao menos importante para a pessoa (os pesos são os mesmos em todas as cidades da análise).
export function pilaresPorPeso(notas) {
    return [...PILARES].sort((a, b) => ORDEM_PESO[notas[a.id].peso] - ORDEM_PESO[notas[b.id].peso]);
}

// Índices das cidades com a maior nota no pilar. Ninguém vence quando falta dado em todas ou quando todas empatam.
export function vencedoresDoPilar(resultados, pilar) {
    const comDado = resultados
        .map(({ notas }, indice) => ({ ...notas[pilar], indice }))
        .filter(({ dadoIndisponivel }) => !dadoIndisponivel);
    if (comDado.length === 0) return [];
    const maior = Math.max(...comDado.map(({ nota }) => nota));
    const vencedores = comDado.filter(({ nota }) => nota === maior).map(({ indice }) => indice);
    return vencedores.length === resultados.length ? [] : vencedores;
}

// Pilares em que alguma das cidades tem dado: é o total do "vence em X de N critérios".
export function pilaresComparaveis(resultados) {
    return PILARES.filter(({ id }) => resultados.some(({ notas }) => !notas[id].dadoIndisponivel)).length;
}

export function vitoriasPorCidade(resultados) {
    const vitorias = resultados.map(() => 0);
    for (const { id } of PILARES) {
        for (const indice of vencedoresDoPilar(resultados, id)) vitorias[indice] += 1;
    }
    return vitorias;
}

function indiceDoExtremo(valores, melhor) {
    const validos = valores.map((valor, indice) => ({ valor, indice })).filter(({ valor }) => valor !== null && valor !== undefined);
    if (validos.length < 2) return null;
    const extremo = melhor(...validos.map(({ valor }) => valor));
    const empatados = validos.filter(({ valor }) => valor === extremo);
    return empatados.length === 1 ? empatados[0].indice : null;
}

// Índice do menor (ou maior) valor, ou null quando há menos de 2 valores ou empate no topo.
export const indiceDoMenor = (valores) => indiceDoExtremo(valores, Math.min);
export const indiceDoMaior = (valores) => indiceDoExtremo(valores, Math.max);

// Pilares que pesaram em que a cidade em `indice` tem a maior nota, do mais ao menos importante.
function pilaresLiderados(resultados, indice) {
    return pilaresPorPeso(resultados[indice].notas)
        .map(({ id }) => id)
        .filter((id) => resultados[indice].notas[id].peso !== 'tantoFaz' && vencedoresDoPilar(resultados, id).includes(indice));
}

// Recomendação final: a primeira cidade (maior match) e o que as outras oferecem de diferente.
// `alugueis` segue a ordem de `resultados` (null quando falta o dado).
export function veredito(resultados, alugueis = []) {
    const nomes = resultados.map(({ cidade }) => nomeDaCidade(cidade));
    const liderados = pilaresLiderados(resultados, 0);
    // Só "vence nos critérios que mais pesam" se nenhuma outra cidade lidera mais critérios essenciais.
    const essenciaisLiderados = resultados.map((_, indice) => (
        pilaresLiderados(resultados, indice).filter((id) => resultados[indice].notas[id].peso === 'essencial').length
    ));
    const lideraEssenciais = essenciaisLiderados[0] > 0 && essenciaisLiderados.every((total) => total <= essenciaisLiderados[0]);
    const titulo = lideraEssenciais
        ? `${nomes[0]} vence nos critérios que mais pesam para você`
        : `${nomes[0]} tem o maior match para o seu perfil`;

    let texto;
    if (liderados.length === 0) {
        texto = 'Não lidera sozinha nenhum critério, mas tem o melhor equilíbrio entre eles.';
    } else {
        const citados = liderados.slice(0, MAXIMO_LIDERADOS_NO_TEXTO);
        const todosEssenciais = citados.every((id) => resultados[0].notas[id].peso === 'essencial');
        let reforco = '';
        if (todosEssenciais) reforco = citados.length === 1 ? ', com peso alto no seu perfil' : ' — todos com peso alto no seu perfil';
        texto = `Lidera em ${listar(nomesNoTexto(citados))}${reforco}.`;
    }

    const maisBarata = indiceDoMenor(alugueis);
    const alternativas = resultados.slice(1).map((_, posicao) => {
        const indice = posicao + 1;
        const destaques = nomesNoTexto(pilaresLiderados(resultados, indice).slice(0, MAXIMO_DESTAQUES_ALTERNATIVA));
        const partes = [];
        if (destaques.length && indice === 1) partes.push(`é a melhor alternativa se você priorizar ${listar(destaques)}`);
        else if (destaques.length) partes.push(`se destaca em ${listar(destaques)}`);
        if (maisBarata === indice) partes.push('oferece o menor aluguel');
        return partes.length ? `${nomes[indice]} ${partes.join(', e ')}` : null;
    }).filter(Boolean);

    if (alternativas.length) texto += ` ${alternativas.join('; ')}.`;
    return { titulo, texto };
}

// Cidades do ranking primeiro, na ordem dele; depois as de fora, do maior para o menor match.
// `avaliadas` são todas as cidades da base, já ordenadas pelo match.
export function ordenarComparadas(avaliadas, ranking, comparadas) {
    const noRanking = new Set(ranking.map(({ ibge }) => ibge));
    return [
        ...ranking.filter(({ ibge }) => comparadas.includes(ibge)),
        ...avaliadas.filter(({ ibge }) => comparadas.includes(ibge) && !noRanking.has(ibge)),
    ];
}

// Busca por nome entre todas as cidades avaliadas que ainda não estão na comparação.
// Ordem: nome exato, depois começa com o termo, depois só contém; em cada grupo, o maior match primeiro.
export function buscarParaComparar(avaliadas, comparadas, termo) {
    const busca = normalizar(termo);
    if (!busca) return [];

    const encontradas = [];
    for (const resultado of avaliadas) {
        if (comparadas.includes(resultado.ibge)) continue;
        const nome = normalizar(nomeDaCidade(resultado.cidade));
        const grupo = nome === busca ? 0 : nome.startsWith(busca) ? 1 : nome.includes(busca) ? 2 : -1;
        if (grupo >= 0) encontradas.push({ resultado, grupo });
    }

    // `avaliadas` já vem do maior para o menor match, e a ordenação é estável.
    return encontradas.sort((a, b) => a.grupo - b.grupo).slice(0, LIMITE_BUSCA).map(({ resultado }) => resultado);
}
