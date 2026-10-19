// Indicadores de trabalho a partir do Cadastro Central de Empresas (pessoal ocupado assalariado por seção CNAE).

export const SECOES_DOS_SETORES = {
    tecnologia: ['J'],
    financas: ['K'],
    saude: ['Q'],
    educacao: ['P'],
    industria: ['C'],
    comercio: ['G'],
    servicos: ['I', 'L', 'M', 'N', 'S'],
    agronegocio: ['A'],
};

export function indicadoresEmprego({ total2022, total2024, porSecao }, populacao) {
    const empregoSetor = Object.fromEntries(Object.entries(SECOES_DOS_SETORES).map(([setor, secoes]) => [
        setor,
        total2024 ? secoes.reduce((soma, secao) => soma + (porSecao[secao] ?? 0), 0) / total2024 : null,
    ]));
    return {
        empregoPerCapita: total2024 && populacao ? total2024 / populacao : null,
        crescimentoEmprego: total2022 && total2024 ? Math.round(((total2024 / total2022) - 1) * 1000) / 10 : null,
        empregoSetor,
    };
}
