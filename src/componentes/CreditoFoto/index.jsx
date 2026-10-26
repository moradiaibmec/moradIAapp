import styled from "styled-components"
import { LuCamera } from 'react-icons/lu';
import { textoDoCredito } from '../../analise/formatacao.js';

const Credito = styled.a`
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    padding: 8px 14px;
    border-radius: 999px;
    background-color: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(12px);
    color: #FFFFFF;
    font-family: var(--fonte-moradia);
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
    box-sizing: border-box;

    svg {
        flex-shrink: 0;
        font-size: 14px;
    }

    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &:hover span,
    &:focus-visible span {
        text-decoration: underline;
    }
`;

// As licenças livres do Commons exigem citar autor e licença onde a foto aparece.
function CreditoFoto({ foto, className }) {
    const texto = textoDoCredito(foto);
    return (
        <Credito className={className} href={foto.pagina} target="_blank" rel="noopener noreferrer" title={`${texto} (Wikimedia Commons)`}>
            <LuCamera aria-hidden="true" />
            <span>{texto}</span>
        </Credito>
    );
}

export default CreditoFoto
