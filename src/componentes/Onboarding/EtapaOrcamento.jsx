import styled from "styled-components"
import { FAIXAS_RENDA, PASSO_TETO, TETO_MAXIMO, TETO_MINIMO } from '../../analise/opcoes.js';
import { pontoMedioRenda, tetoPadrao } from '../../analise/respostas.js';
import { formatarReais } from '../../analise/formatacao.js';
import { Ajuda, Pergunta } from './estilos.js';
import { ContadorCidades, GrupoOpcoes } from './elementos.jsx';

const Linha = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 32px;

    @media (max-width: 900px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const ValoresSlider = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    font-size: 14px;
    color: #6B7280;

    strong {
        font-size: 18px;
        font-weight: 800;
        color: var(--roxo-moradia);
    }
`;

const Slider = styled.input`
    width: 100%;
    height: 8px;
    margin: 12px 0;
    border-radius: 4px;
    background: linear-gradient(
        to right,
        var(--roxo-moradia) ${({ $preenchimento }) => $preenchimento}%,
        #E5E7EB ${({ $preenchimento }) => $preenchimento}%
    );
    appearance: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
        width: 20px;
        height: 20px;
        border: 3px solid var(--roxo-moradia);
        border-radius: 50%;
        background-color: #FFFFFF;
        appearance: none;
    }

    &::-moz-range-thumb {
        width: 14px;
        height: 14px;
        border: 3px solid var(--roxo-moradia);
        border-radius: 50%;
        background-color: #FFFFFF;
    }

    &:focus-visible {
        outline: 3px solid #EEF2FF;
        outline-offset: 4px;
    }
`;

const Simulacao = styled.dl`
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
    width: 340px;
    box-sizing: border-box;
    margin: 0;
    padding: 24px;
    border-radius: 16px;
    background-color: #F8FAFC;
    font-size: 13px;

    @media (max-width: 900px) {
        width: auto;
    }

    div {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
    }

    dt {
        font-weight: 500;
        color: #111827;
    }

    dd {
        margin: 0;
        font-weight: 700;
    }
`;

const TituloSimulacao = styled.p`
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    color: #6B7280;
`;

const LinhaRenda = styled.div`
    border-bottom: 1px solid #E5E7EB;
    font-size: 14px;

    dt, dd {
        font-weight: 700;
        color: #111827;
    }
`;

function EtapaOrcamento({ respostas, alterar, cidades }) {
    const { faixaRenda, tetoMoradia } = respostas.orcamento;
    const renda = pontoMedioRenda(faixaRenda);
    const preenchimento = tetoMoradia === null ? 0 : ((tetoMoradia - TETO_MINIMO) / (TETO_MAXIMO - TETO_MINIMO)) * 100;
    const sobra = renda === null ? 0 : renda - tetoMoradia;

    return (
        <>
            <GrupoOpcoes
                legenda="Qual é a renda mensal do seu domicílio?"
                ajuda="Some a renda de todos que vão dividir as despesas."
                opcoes={FAIXAS_RENDA}
                valor={faixaRenda}
                onChange={(id) => alterar('orcamento', { faixaRenda: id, tetoMoradia: tetoPadrao(id) })}
            />

            {faixaRenda && (
                <Linha>
                    <Pergunta>
                        <legend>Quanto você pode gastar com moradia?</legend>
                        <div>
                            <ValoresSlider>
                                <span>{formatarReais(TETO_MINIMO)}</span>
                                <strong>{formatarReais(tetoMoradia)} / mês</strong>
                                <span>{formatarReais(TETO_MAXIMO)}+</span>
                            </ValoresSlider>
                            <Slider
                                type="range"
                                min={TETO_MINIMO}
                                max={TETO_MAXIMO}
                                step={PASSO_TETO}
                                value={tetoMoradia}
                                $preenchimento={preenchimento}
                                aria-label="Gasto máximo com moradia por mês"
                                aria-valuetext={`${formatarReais(tetoMoradia)} por mês`}
                                onChange={(e) => alterar('orcamento', { tetoMoradia: Number(e.target.value) })}
                            />
                        </div>
                        <Ajuda>
                            Cidades em que o aluguel estimado passa deste valor (com 10% de tolerância) saem do ranking.
                        </Ajuda>
                    </Pergunta>

                    <Simulacao aria-label="Simulação de orçamento">
                        <TituloSimulacao>Simulação de orçamento</TituloSimulacao>
                        <LinhaRenda><dt>Renda estimada</dt><dd>{formatarReais(renda)}</dd></LinhaRenda>
                        <div><dt>Moradia (meta)</dt><dd style={{ color: 'var(--roxo-moradia)' }}>{formatarReais(tetoMoradia)}</dd></div>
                        <div>
                            <dt>Sobra para o resto</dt>
                            <dd style={{ color: sobra < 0 ? '#DC2626' : '#10B981' }}>{formatarReais(sobra)}</dd>
                        </div>
                        <div><dt>Moradia / renda</dt><dd style={{ color: '#6B7280' }}>{Math.round((tetoMoradia / renda) * 100)}%</dd></div>
                    </Simulacao>
                </Linha>
            )}

            <ContadorCidades respostas={respostas} cidades={cidades} />
        </>
    );
}

export default EtapaOrcamento
