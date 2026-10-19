import styled from "styled-components"

const Pagina = styled.main`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 100vh;
    padding: 16px;
    box-sizing: border-box;
    background-color: #F8FAFC;
    font-family: var(--fonte-moradia);
    text-align: center;
`;

const Texto = styled.p`
    font-size: 16px;
    color: ${({ $erro }) => ($erro ? '#DC2626' : '#6B7280')};
    font-weight: ${({ $erro }) => ($erro ? 600 : 400)};
`;

const Botoes = styled.div`
    display: flex;
    gap: 12px;
`;

const Botao = styled.button`
    padding: 12px 24px;
    border-radius: 8px;
    border: 1px solid ${({ $primario }) => ($primario ? 'var(--roxo-moradia)' : '#E5E7EB')};
    background-color: ${({ $primario }) => ($primario ? 'var(--roxo-moradia)' : '#FFFFFF')};
    color: ${({ $primario }) => ($primario ? '#FFFFFF' : '#111827')};
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
`;

// Tela de espera enquanto a base de cidades carrega, ou de erro se o carregamento falhar.
function CarregandoBase({ erro, onTentarDeNovo, onSair }) {
    return (
        <Pagina aria-busy={!erro}>
            <Texto $erro={erro} role={erro ? 'alert' : 'status'}>
                {erro ? 'Não foi possível carregar as cidades.' : 'Carregando cidades…'}
            </Texto>
            {erro && (
                <Botoes>
                    <Botao type="button" onClick={onSair}>Voltar ao dashboard</Botao>
                    <Botao type="button" $primario onClick={onTentarDeNovo}>Tentar de novo</Botao>
                </Botoes>
            )}
        </Pagina>
    );
}

export default CarregandoBase
