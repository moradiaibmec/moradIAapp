// Gateway simulado: aprova tudo, sem cobrar nada e sem abrir nenhum pagamento.
// Quando houver um gateway real, é aqui que ele entra. Os dados do cartão nem chegam a esta função.
export async function processarPagamento({ metodo, centavos }) {
    return { aprovado: true, metodo, centavos };
}
