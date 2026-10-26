const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function formatarReais(valor) {
    return reais.format(valor);
}

const decimal = (casas) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

export function formatarPopulacao(habitantes) {
    if (habitantes >= 1_000_000) return `${decimal(2).format(habitantes / 1_000_000)} mi`;
    return `${decimal(0).format(habitantes / 1000)} mil`;
}

const ESTADOS = {
    AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
    ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
    PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
    RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};

export function nomeDoEstado(uf) {
    return ESTADOS[uf] ?? uf;
}

export function textoDoCredito({ autor, licenca }) {
    return `Foto: ${autor} · ${licenca}`;
}
