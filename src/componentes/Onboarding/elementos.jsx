import styled from "styled-components"
import { FiAlertTriangle, FiMapPin } from 'react-icons/fi';
import { aplicarFiltros, filtroMaisRestritivo } from '../../analise/filtros.js';
import { Ajuda, Pergunta } from './estilos.js';

const Grade = styled.div`
    display: grid;
    grid-template-columns: repeat(${({ $colunas }) => $colunas}, 1fr);
    gap: 16px;

    @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const CartaoOpcao = styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 16px;
    border: 2px solid ${({ $ativa }) => ($ativa ? 'var(--roxo-moradia)' : '#E5E7EB')};
    border-radius: 12px;
    background-color: ${({ $ativa }) => ($ativa ? '#EEF2FF' : '#FFFFFF')};
    color: ${({ $ativa }) => ($ativa ? 'var(--roxo-moradia)' : '#111827')};
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 700;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;

    &:hover:not(:disabled),
    &:focus-visible {
        outline: none;
        border-color: var(--roxo-moradia);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    span {
        font-size: 12px;
        font-weight: 400;
        color: #6B7280;
    }
`;

// Seleção única (radio) ou múltipla (botões alternáveis), no visual de cartões do Figma.
export function GrupoOpcoes({
    legenda, ajuda, opcoes, valor, onChange, multipla = false, maximo = Infinity, minimo = 0, colunas = 3,
}) {
    const selecionadas = multipla ? valor : [valor];

    function alternar(id) {
        if (!multipla) return onChange(id);
        const nova = valor.includes(id) ? valor.filter((item) => item !== id) : [...valor, id];
        if (nova.length >= minimo) onChange(nova);
    }

    return (
        <Pergunta>
            <legend>{legenda}</legend>
            {ajuda && <Ajuda>{ajuda}</Ajuda>}
            <Grade $colunas={colunas} role={multipla ? 'group' : 'radiogroup'}>
                {opcoes.map(({ id, rotulo, detalhe }) => {
                    const ativa = selecionadas.includes(id);
                    const bloqueada = multipla && !ativa && valor.length >= maximo;
                    return (
                        <CartaoOpcao
                            key={id}
                            type="button"
                            role={multipla ? undefined : 'radio'}
                            aria-checked={multipla ? undefined : ativa}
                            aria-pressed={multipla ? ativa : undefined}
                            $ativa={ativa}
                            disabled={bloqueada}
                            title={bloqueada ? `Escolha no máximo ${maximo}` : undefined}
                            onClick={() => alternar(id)}
                        >
                            {rotulo}
                            {detalhe && <span>{detalhe}</span>}
                        </CartaoOpcao>
                    );
                })}
            </Grade>
        </Pergunta>
    );
}

const Caixa = styled.p`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 12px;
    background-color: ${({ $alerta }) => ($alerta ? '#FFFBEB' : '#EEF2FF')};
    color: ${({ $alerta }) => ($alerta ? '#B45309' : 'var(--roxo-moradia)')};
    font-size: 14px;
    line-height: 1.5;

    svg {
        flex-shrink: 0;
        font-size: 16px;
    }
`;

export function ContadorCidades({ respostas, cidades }) {
    const restantes = aplicarFiltros(respostas, cidades).length;
    const alerta = restantes < 3;
    const restritivo = alerta ? filtroMaisRestritivo(respostas, cidades) : null;

    return (
        <Caixa $alerta={alerta} role="status">
            {alerta ? <FiAlertTriangle aria-hidden="true" /> : <FiMapPin aria-hidden="true" />}
            <span>
                <strong>{restantes} de {cidades.length}</strong> cidades atendem aos seus critérios.
                {restantes === 0 && ' Afrouxe algum filtro para continuar.'}
                {restritivo && ` O filtro mais restritivo é: ${restritivo.rotulo}.`}
            </span>
        </Caixa>
    );
}
