// Textos da tela de resultados, montados só a partir dos dados do match (sem LLM).
import { formatarReais } from './formatacao.js';
import { pontoMedioRenda } from './respostas.js';

const NOMES_NO_TEXTO = {
    custo: 'custo de vida',
    seguranca: 'segurança',
    clima: 'clima',
    trabalho: 'trabalho',
    saude: 'saúde',
    educacao: 'educação',
    lazer: 'lazer e cultura',
    natureza: 'natureza',
};

const decimal = (valor) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

export function qualificarNota(nota) {
    if (nota >= 85) return 'Excelente';
    if (nota >= 70) return 'Muito bom';
    if (nota >= 50) return 'Bom';
    if (nota >= 30) return 'Regular';
    return 'Fraco';
}

export function listar(itens) {
    if (itens.length <= 1) return itens.join('');
    return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}

export function fraseDoPilar(pilar, { bruto, dadoIndisponivel }, respostas) {
    if (dadoIndisponivel) return 'Dado indisponível para esta cidade';
    switch (pilar) {
        case 'custo':
            return pontoMedioRenda(respostas.orcamento.faixaRenda) === null
                ? `Aluguel estimado de ${formatarReais(bruto)} por mês`
                : `Aluguel compromete cerca de ${Math.round(bruto * 100)}% da sua renda`;
        case 'seguranca':
            return `${Math.round(bruto)} homicídios por 100 mil habitantes`;
        case 'clima':
            return `Temperatura média de ${Math.round(bruto)} °C`;
        case 'trabalho':
            return `${Math.round(bruto * 100)} empregos formais a cada 100 habitantes`;
        case 'saude':
            return `${decimal(bruto)} médicos por mil habitantes`;
        case 'educacao':
            return respostas.trabalho.ensinoSuperior && !respostas.domicilio.filhosEscolares
                ? `${Math.round(bruto)} vagas no ensino superior por 10 mil habitantes`
                : `Ideb médio de ${decimal(bruto)}`;
        case 'lazer':
            return `${Math.round(bruto)} restaurantes, bares e espaços culturais por 10 mil habitantes`;
        case 'natureza':
            return `${Math.round(bruto)} m² de parques por habitante`;
        default:
            return '';
    }
}

const nomeDaCidade = (cidade) => cidade.slice(0, cidade.lastIndexOf(', '));
const nomesNoTexto = (pilares) => pilares.map((pilar) => NOMES_NO_TEXTO[pilar]);

export function lemaDaCidade({ pontosFortes }) {
    if (pontosFortes.length === 0) return 'Equilíbrio entre os critérios que você escolheu';
    return `Ideal para quem valoriza ${listar(nomesNoTexto(pontosFortes.slice(0, 2)))}`;
}

export function porQueCombina({ cidade, pontosFortes, pontosAtencao }) {
    const nome = nomeDaCidade(cidade);
    const destaque = pontosFortes.length === 0
        ? `${nome} tem desempenho equilibrado nos critérios que você escolheu.`
        : `${nome} se destaca em ${listar(nomesNoTexto(pontosFortes))}, que ${pontosFortes.length === 1 ? 'pesou' : 'pesaram'} no seu match.`;
    let atencao = ' Nenhum deles ficou abaixo do esperado.';
    if (pontosAtencao.length === 1) atencao = ` O ponto de atenção é ${nomesNoTexto(pontosAtencao)[0]}.`;
    if (pontosAtencao.length > 1) atencao = ` Os pontos de atenção são ${listar(nomesNoTexto(pontosAtencao))}.`;
    return destaque + atencao;
}
