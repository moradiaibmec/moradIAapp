// Taxa de homicídios por 100 mil habitantes a partir do número absoluto de cada ano.
// A taxa pronta do Ipeadata tem erros (Curitiba aparece com 0,05 em 2020), por isso calculamos aqui.

const FATOR_DESTOANTE = 3;

export function taxaHomicidios(porAno, populacao) {
    const valores = Object.values(porAno).filter((v) => v !== null && v !== undefined && !Number.isNaN(v));
    if (valores.length === 0 || !populacao) return null;

    // Um ano que destoa mais de 3 vezes (para cima ou para baixo) da média dos outros é descartado.
    const confiaveis = valores.filter((valor, i) => {
        const outros = valores.filter((_, j) => j !== i);
        if (outros.length === 0) return true;
        const media = outros.reduce((s, v) => s + v, 0) / outros.length;
        if (media === 0) return valor === 0;
        return valor <= media * FATOR_DESTOANTE && valor >= media / FATOR_DESTOANTE;
    });
    const usados = confiaveis.length > 0 ? confiaveis : valores;
    const media = usados.reduce((s, v) => s + v, 0) / usados.length;
    return (media * 100000) / populacao;
}
