// Estilos compartilhados pelas etapas (em .js para não quebrar o Fast Refresh dos componentes).
import styled from "styled-components"

export const TituloEtapa = styled.h1`
    margin: 0;
    font-size: 32px;
    font-weight: 800;
    line-height: 1.2;
    color: #111827;

    @media (max-width: 600px) {
        font-size: 24px;
    }
`;

export const Pergunta = styled.fieldset`
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: none;

    legend {
        margin-bottom: 16px;
        padding: 0;
        font-size: 16px;
        font-weight: 700;
        color: #111827;
    }
`;

export const Ajuda = styled.p`
    font-size: 13px;
    line-height: 1.5;
    color: #6B7280;
`;
