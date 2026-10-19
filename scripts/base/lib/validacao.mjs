// Regras de `npm run base:validar` (spec "Validação"). Devolve a lista de erros; vazia = base válida.

const LIMITE_NULOS = 0.1;
const SEMPRE_NULOS = new Set(['medicos1k']);

const nulo = (valor) => valor === null || valor === undefined;

function acharCidade(cidades, nome, uf) {
    return cidades.find((c) => c.nome === nome && c.uf === uf);
}

function checarCoerencia(cidades) {
    const erros = [];
    const temp = (nome, uf) => acharCidade(cidades, nome, uf)?.indicadores.tempMesFrio;

    for (const [fria, uf] of [['Curitiba', 'PR'], ['Porto Alegre', 'RS']]) {
        const valorFria = temp(fria, uf);
        if (nulo(valorFria) || valorFria > 15) erros.push(`${fria}: mês mais frio deveria ser até 15 °C (veio ${valorFria}).`);
        for (const [quente, ufQuente] of [['Fortaleza', 'CE'], ['Salvador', 'BA']]) {
            const valorQuente = temp(quente, ufQuente);
            if (nulo(valorFria) || nulo(valorQuente) || valorFria >= valorQuente) {
                erros.push(`${fria}: mês mais frio deveria ser menor que o de ${quente} (${valorFria} x ${valorQuente}).`);
            }
        }
    }

    const litoral = { 'Florianópolis|SC': true, 'Rio de Janeiro|RJ': true, 'Salvador|BA': true, 'Brasília|DF': false, 'Belo Horizonte|MG': false };
    for (const [chave, esperado] of Object.entries(litoral)) {
        const [nome, uf] = chave.split('|');
        const cidade = acharCidade(cidades, nome, uf);
        if (!cidade || cidade.litoranea !== esperado) erros.push(`${nome}: litorânea deveria ser ${esperado}.`);
    }
    return erros;
}

export function validarBase(base, { ibgesFipezap, minimo = 290, maximo = 340 }) {
    const { cidades } = base;
    const erros = [];

    if (cidades.length < minimo || cidades.length > maximo) {
        erros.push(`A base tem ${cidades.length} cidades; o esperado é entre ${minimo} e ${maximo}.`);
    }

    const campos = new Set(cidades.flatMap((c) => Object.keys(c.indicadores)));
    for (const campo of campos) {
        if (SEMPRE_NULOS.has(campo)) continue;
        const nulos = cidades.filter((c) => nulo(c.indicadores[campo])).length;
        if (nulos > cidades.length * LIMITE_NULOS) erros.push(`${campo}: ${nulos} de ${cidades.length} cidades sem dado.`);
    }

    for (const cidade of cidades) {
        const doFipezap = ibgesFipezap.has(cidade.ibge);
        const estimada = cidade.estimados.includes('aluguel');
        const temAluguel = !nulo(cidade.indicadores.aluguel);
        if (doFipezap && estimada) erros.push(`${cidade.nome}: tem FipeZap, mas o aluguel está marcado como estimado.`);
        if (!doFipezap && temAluguel && !estimada) erros.push(`${cidade.nome}: aluguel sem FipeZap deveria estar marcado como estimado.`);
    }

    return [...erros, ...checarCoerencia(cidades)];
}
