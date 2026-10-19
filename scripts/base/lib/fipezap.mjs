// As abas da planilha do FipeZap trazem só o nome da cidade; a UF vem desta tabela fixa
// (as 50 abas com Locação na pesquisa de 2026-10-19, mais as que só têm Venda).
export const UF_DAS_ABAS = {
    'São Paulo': 'SP', 'Barueri': 'SP', 'Campinas': 'SP', 'Diadema': 'SP', 'Guarujá': 'SP', 'Guarulhos': 'SP',
    'Osasco': 'SP', 'Praia Grande': 'SP', 'Ribeirão Preto': 'SP', 'Santo André': 'SP', 'Santos': 'SP',
    'São Bernardo do Campo': 'SP', 'São Caetano do Sul': 'SP', 'São José do Rio Preto': 'SP', 'São José dos Campos': 'SP',
    'São Vicente': 'SP', 'Rio de Janeiro': 'RJ', 'Niterói': 'RJ', 'Belo Horizonte': 'MG', 'Betim': 'MG', 'Contagem': 'MG',
    'Porto Alegre': 'RS', 'Canoas': 'RS', 'Caxias do Sul': 'RS', 'Novo Hamburgo': 'RS', 'Pelotas': 'RS', 'Santa Maria': 'RS',
    'São Leopoldo': 'RS', 'Curitiba': 'PR', 'Londrina': 'PR', 'São José dos Pinhais': 'PR', 'Florianópolis': 'SC',
    'Balneário Camboriú': 'SC', 'Blumenau': 'SC', 'Itajaí': 'SC', 'Itapema': 'SC', 'Joinville': 'SC', 'São José': 'SC',
    'Vitória': 'ES', 'Vila Velha': 'ES', 'Brasília': 'DF', 'Goiânia': 'GO', 'Campo Grande': 'MS', 'Cuiabá': 'MT',
    'Aracaju': 'SE', 'Fortaleza': 'CE', 'João Pessoa': 'PB', 'Maceió': 'AL', 'Natal': 'RN', 'Recife': 'PE',
    'Salvador': 'BA', 'São Luís': 'MA', 'Teresina': 'PI', 'Jaboatão dos Guararapes': 'PE', 'Belém': 'PA', 'Manaus': 'AM',
};

export function casarAbasFipezap(abas, municipios) {
    const porNomeUf = new Map(municipios.map(({ ibge, nome, uf }) => [`${nome}|${uf}`, ibge]));
    const casadas = new Map();
    const naoEncontradas = [];
    for (const aba of abas) {
        const ibge = UF_DAS_ABAS[aba] && porNomeUf.get(`${aba}|${UF_DAS_ABAS[aba]}`);
        if (ibge) casadas.set(aba, ibge);
        else naoEncontradas.push(aba);
    }
    return { casadas, naoEncontradas };
}
