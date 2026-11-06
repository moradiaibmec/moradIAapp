import styled from "styled-components"

// Estilos usados pela página da cidade, pelas abas e pelo simulador.
export const Cartao = styled.section`
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 28px;
    border: 1px solid #E6E8EC;
    border-radius: 20px;
    background-color: #FFFFFF;

    @media (max-width: 600px) {
        padding: 20px;
    }
`;

export const TopoCartao = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
`;

export const TextoTopo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;

    p {
        font-size: 14px;
        line-height: 1.45;
        color: #5B6475;
    }
`;

export const TituloCartao = styled.h2`
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: #0F172A;
`;

export const Ponto = styled.span`
    flex-shrink: 0;
    width: ${({ $tamanho = 8 }) => $tamanho}px;
    height: ${({ $tamanho = 8 }) => $tamanho}px;
    border-radius: 50%;
    background-color: ${({ $cor }) => $cor};
`;

export const SeloEstimado = styled.span`
    padding: 2px 6px;
    border-radius: 6px;
    background-color: #FFFBEB;
    color: #B45309 !important;
    font-size: 11px !important;
    font-weight: 700;
    cursor: help;
`;

export const Trilho = styled.div`
    height: 6px;
    border-radius: 3px;
    background-color: #E8EAF0;
    overflow: hidden;
`;

export const Preenchimento = styled.div`
    width: ${({ $valor }) => $valor}%;
    height: 100%;
    border-radius: inherit;
    background-color: ${({ $forte }) => ($forte ? 'var(--roxo-moradia)' : '#A5B4FC')};
`;
