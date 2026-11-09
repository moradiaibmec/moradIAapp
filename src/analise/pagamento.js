// Preço e máscaras da tela de pagamento.
export const PRECO_CENTAVOS = 1990;
export const PRECO_TEXTO = 'R$ 19,90';

const soDigitos = (texto, limite) => texto.replace(/\D/g, '').slice(0, limite);

export function formatarNumeroCartao(texto) {
    return soDigitos(texto, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatarValidade(texto) {
    return soDigitos(texto, 4).replace(/^(\d{2})(\d)/, '$1/$2');
}

export function formatarCvv(texto) {
    return soDigitos(texto, 4);
}

export function formatarCpf(texto) {
    return soDigitos(texto, 11)
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, '$1-$2');
}

export function formatarTempo(segundos) {
    const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
    return `${minutos}:${String(segundos % 60).padStart(2, '0')}`;
}
