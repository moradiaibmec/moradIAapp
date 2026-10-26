import { PORTES, TOLERANCIA_TETO } from './opcoes.js';
import { pessoasNoDomicilio } from './respostas.js';

const RAIO_TERRA_KM = 6371;

export function porteDaCidade(populacao) {
    return PORTES.find(({ minimo }) => populacao >= minimo).id;
}

export function distanciaKm(a, b) {
    const rad = (graus) => (graus * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLon = rad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(h));
}

// Quem divide com amigos paga metade do aluguel de um imóvel para 2 pessoas.
export function aluguelDoDomicilio(cidade, domicilio) {
    const { aluguel } = cidade.indicadores;
    if (!aluguel) return null; // município sem dado de aluguel (por exemplo, sem Censo 2010)
    if (domicilio.moradia === 'amigos') return aluguel[2] === null || aluguel[2] === undefined ? null : aluguel[2] / 2;
    return aluguel[pessoasNoDomicilio(domicilio)] ?? null;
}

// Cada filtro só vale quando a pessoa o configurou. Dado ausente nunca elimina uma cidade.
const FILTROS = [
    {
        id: 'orcamento',
        rotulo: 'Orçamento para moradia',
        ativo: (r) => r.orcamento.tetoMoradia !== null,
        passa: (cidade, r) => {
            const aluguel = aluguelDoDomicilio(cidade, r.domicilio);
            return aluguel === null || aluguel <= r.orcamento.tetoMoradia * TOLERANCIA_TETO;
        },
    },
    {
        id: 'regioes',
        rotulo: 'Regiões',
        ativo: (r) => r.onde.regioes.length > 0,
        passa: (cidade, r) => r.onde.regioes.includes(cidade.regiao),
    },
    {
        id: 'referencia',
        rotulo: 'Distância da cidade de referência',
        ativo: (r) => r.onde.referencia !== null && r.onde.referencia.lat !== null,
        passa: (cidade, r) => distanciaKm(cidade, r.onde.referencia) <= r.onde.referencia.raioKm,
    },
    {
        id: 'portes',
        rotulo: 'Porte da cidade',
        ativo: (r) => r.onde.portes.length > 0,
        passa: (cidade, r) => r.onde.portes.includes(porteDaCidade(cidade.populacao)),
    },
    {
        id: 'praia',
        rotulo: 'Praia indispensável',
        ativo: (r) => r.onde.praia === 'indispensavel',
        passa: (cidade) => cidade.litoranea,
    },
];

export function aplicarFiltros(respostas, cidades, ignorar = null) {
    const ativos = FILTROS.filter(({ id, ativo }) => id !== ignorar && ativo(respostas));
    return cidades.filter((cidade) => ativos.every(({ passa }) => passa(cidade, respostas)));
}

// Rótulos dos filtros ativos que eliminam a cidade do ranking.
export function filtrosReprovados(respostas, cidade) {
    return FILTROS.filter(({ ativo, passa }) => ativo(respostas) && !passa(cidade, respostas)).map(({ rotulo }) => rotulo);
}

// O filtro que, se removido, devolveria mais cidades. Usado para orientar quando sobram poucas.
export function filtroMaisRestritivo(respostas, cidades) {
    const atuais = aplicarFiltros(respostas, cidades).length;
    let maisRestritivo = null;
    for (const { id, rotulo, ativo } of FILTROS) {
        if (!ativo(respostas)) continue;
        const cidadesSem = aplicarFiltros(respostas, cidades, id).length;
        if (cidadesSem > atuais && (!maisRestritivo || cidadesSem > maisRestritivo.cidadesSem)) {
            maisRestritivo = { id, rotulo, cidadesSem };
        }
    }
    return maisRestritivo;
}
