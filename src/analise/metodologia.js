// Conteúdo da tela "Como calculamos". Os números vêm das constantes do motor e da base, para o texto nunca divergir do cálculo.
import { PILARES, TOLERANCIA_TETO } from './opcoes.js';
import {
    BONUS_PRAIA, COMPROMETIMENTO_IDEAL, COMPROMETIMENTO_MAXIMO, INDICADORES_DO_PILAR, LIMITE_ESSENCIAL_RUIM, PENALIDADE_ESSENCIAL,
    PERDA_POR_GRAU, VALOR_PESO,
} from './match.js';

const porcento = (fracao) => `${Math.round(fracao * 100)}%`;

export const PASSOS = [
    {
        titulo: 'Filtramos',
        texto: `Saem as cidades fora das regiões e dos portes que você aceita, longe demais da sua cidade de referência, sem praia (se ela for indispensável) ou com aluguel acima do seu teto, com ${porcento(TOLERANCIA_TETO - 1)} de tolerância.`,
    },
    {
        titulo: 'Damos uma nota de 0 a 100',
        texto: 'Cada cidade recebe uma nota em 8 critérios. A maioria das notas é um percentil: a posição da cidade entre todas as da base, não só entre as que passaram nos filtros. Custo e clima dependem da sua renda e da sua preferência.',
    },
    {
        titulo: 'Aplicamos os seus pesos',
        texto: `Essencial vale ${VALOR_PESO.essencial}, Importante vale ${VALOR_PESO.importante} e Tanto faz vale ${VALOR_PESO.tantoFaz}. O match é a média ponderada das notas por esses pesos.`,
    },
    {
        titulo: 'Penalizamos incoerências',
        texto: `Cada critério Essencial com nota abaixo de ${LIMITE_ESSENCIAL_RUIM} multiplica o match por ${String(PENALIDADE_ESSENCIAL).replace('.', ',')} e vira um ponto de atenção: uma cidade não deve ir bem se falha no que você disse ser indispensável.`,
    },
    {
        titulo: 'Ordenamos e explicamos',
        texto: 'O ranking segue o match, sem reescalar o percentual. Cada ponto forte e de atenção vem do dado bruto da cidade, e o mesmo perfil sempre gera o mesmo resultado.',
    },
];

const MEDIDAS_DO_PILAR = {
    custo: {
        mede: 'Quanto da renda vai para o aluguel, no tamanho do seu domicílio.',
        nota: `Até ${porcento(COMPROMETIMENTO_IDEAL)} da renda vale 100; a partir de ${porcento(COMPROMETIMENTO_MAXIMO)} vale 0. Sem renda informada, percentil invertido do aluguel.`,
    },
    seguranca: {
        mede: 'Homicídios por 100 mil habitantes.',
        nota: 'Percentil invertido: menos homicídios, nota maior.',
    },
    clima: {
        mede: 'Temperaturas e dias de chuva por ano.',
        nota: `Dentro da faixa que você prefere vale 100, com ${PERDA_POR_GRAU} pontos a menos por °C de distância. Se a chuva incomoda, ela responde por 30% da nota.`,
    },
    trabalho: {
        mede: 'Empregos formais por habitante, crescimento recente e participação do seu setor.',
        nota: 'Média dos percentis de emprego e crescimento. Com setor escolhido, ela vale 60% e o setor, 40%.',
    },
    saude: {
        mede: 'Leitos por mil habitantes.',
        nota: 'Percentil: mais leitos, nota maior.',
    },
    educacao: {
        mede: 'Ideb da rede pública e vagas no ensino superior.',
        nota: 'Percentil do Ideb se você tem filhos na escola, das vagas se vai cursar faculdade; caso contrário, a média dos dois.',
    },
    lazer: {
        mede: 'Empregos em bares, restaurantes, hospedagem e cultura por mil habitantes.',
        nota: 'Percentil: mais empregos no setor, nota maior.',
    },
    natureza: {
        mede: 'Domicílios com 5 ou mais árvores na rua e acesso à praia.',
        nota: `Percentil de arborização, com ${BONUS_PRAIA} pontos a mais para cidades litorâneas se você marcou praia como "Seria bom".`,
    },
};

// Fontes distintas dos indicadores do pilar (vários indicadores podem vir da mesma pesquisa).
export function fontesDoPilar(pilar, fontes = {}) {
    const vistas = new Map();
    for (const indicador of INDICADORES_DO_PILAR[pilar]) {
        const fonte = fontes[indicador];
        if (fonte) vistas.set(`${fonte.nome}|${fonte.periodo}`, fonte);
    }
    return [...vistas.values()];
}

export function criteriosDaMetodologia(fontes) {
    return PILARES.map(({ id, rotulo }) => ({ id, rotulo, ...MEDIDAS_DO_PILAR[id], fontes: fontesDoPilar(id, fontes) }));
}

export function resumoDaBase({ cidades, fontes = {} }) {
    const estimadas = cidades.filter(({ estimados = [] }) => estimados.includes('aluguel')).length;
    return {
        totalCidades: cidades.length,
        totalCriterios: PILARES.length,
        totalFontes: new Set(Object.values(fontes).map(({ nome }) => nome)).size,
        aluguelEstimado: estimadas,
        aluguelMedido: cidades.length - estimadas,
    };
}

export function limitacoes({ totalCidades, aluguelEstimado, aluguelMedido }) {
    return [
        `O aluguel é estimado em ${aluguelEstimado} das ${totalCidades} cidades, a partir do Censo 2010 corrigido pelo FipeZap. As outras ${aluguelMedido} têm dado direto do FipeZap. Os valores estimados trazem o selo "Estimado".`,
        'Custo de vida considera só o aluguel: nossa base não tem alimentação ou transporte por município. Por isso, esses gastos são informados por você no simulador.',
        'Segurança mede apenas homicídios: roubos e furtos não têm registro padronizado entre os municípios.',
        'Saúde usa apenas leitos: não incluímos o número de médicos por habitante nesta versão.',
        'Lazer é medido por empregos no setor, uma aproximação da oferta de bares, restaurantes e cultura.',
        'A base cobre os municípios com mais de 100 mil habitantes, e os indicadores têm anos diferentes, conforme a publicação de cada fonte.',
    ];
}
