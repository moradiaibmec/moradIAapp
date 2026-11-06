import { useState } from 'react';
import styled from "styled-components"
import { LuCheck, LuPencil, LuRotateCcw, LuSlidersHorizontal, LuTriangleAlert } from 'react-icons/lu';
import Selecao from '../Selecao/index.jsx';
import { formatarReais } from '../../analise/formatacao.js';
import { CENARIOS_MORADIA, GASTOS, LIMITE_MORADIA, lerValor } from '../../analise/simulador.js';
import { Cartao, Ponto, TextoTopo, TituloCartao } from './estilos.js';

const COR_SALDO = '#10B981';
const CORES_GASTOS = { moradia: '#4F46E5', alimentacao: '#818CF8', transporte: '#F59E0B', contas: '#38BDF8', outros: '#F472B6' };

const CaixaRenda = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 20px;
    border-radius: 14px;
    background-color: #EEF0FF;

    > span {
        font-size: 13px;
        font-weight: 500;
        color: var(--roxo-moradia);
    }
`;

const LinhaRenda = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;

    strong {
        font-family: var(--fonte-titulo);
        font-size: 32px;
        font-weight: 800;
        letter-spacing: -0.8px;
        color: #0F172A;
    }
`;

const BotaoEditar = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 0 6px;
    border: none;
    background: none;
    color: var(--roxo-moradia);
    font-family: var(--fonte-moradia);
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;

    svg {
        font-size: 14px;
    }
`;

const Distribuicao = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const BarraEmpilhada = styled.div`
    display: flex;
    gap: 3px;
    height: 12px;
`;

const Segmento = styled.span`
    flex: ${({ $peso }) => $peso};
    border-radius: 3px;
    background-color: ${({ $cor }) => $cor};
`;

const ListaGastos = styled.ul`
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const ItemGasto = styled.li`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: ${({ $saldo }) => ($saldo ? '14px 12px' : '12px 0')};
    border-bottom: ${({ $saldo }) => ($saldo ? 'none' : '1px solid #E6E8EC')};
    border-radius: ${({ $saldo }) => ($saldo ? '10px' : '0')};
    background-color: ${({ $saldo, $negativo }) => ($negativo ? '#FEF2F2' : $saldo ? '#ECFDF5' : 'transparent')};
    color: ${({ $saldo, $negativo }) => ($negativo ? '#B91C1C' : $saldo ? '#047857' : '#0F172A')};
    font-size: 14px;

    span:nth-of-type(2) {
        flex: 1;
        font-weight: ${({ $saldo }) => ($saldo ? 700 : 500)};
    }

    small {
        font-size: 13px;
        color: ${({ $saldo, $negativo }) => ($negativo ? '#B91C1C' : $saldo ? '#047857' : '#5B6475')};
    }

    strong {
        font-weight: 700;
    }
`;

const BotaoPrimario = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 12px;
    background-color: var(--roxo-moradia);
    color: #FFFFFF;
    font-family: var(--fonte-moradia);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;

    svg {
        font-size: 16px;
    }
`;

const AvisoSemDado = styled.p`
    font-size: 14px;
    line-height: 1.5;
    color: #5B6475;
`;

const CampoRenda = styled.input`
    width: 100%;
    min-width: 0;
    padding: 6px 10px;
    border: 1px solid #C7D2FE;
    border-radius: 8px;
    background-color: #FFFFFF;
    color: #0F172A;
    font-family: var(--fonte-titulo);
    font-size: 24px;
    font-weight: 800;
`;

const Alerta = styled.p`
    display: flex;
    gap: 8px;
    padding: 12px 14px;
    border-radius: 12px;
    background-color: ${({ $grave }) => ($grave ? '#FEF2F2' : '#FFFBEB')};
    color: ${({ $grave }) => ($grave ? '#B91C1C' : '#92400E')};
    font-size: 13px;
    line-height: 1.45;

    svg {
        flex-shrink: 0;
        margin-top: 2px;
        font-size: 15px;
    }
`;

const PainelCenario = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px;
    border: 1px solid #E6E8EC;
    border-radius: 14px;
    background-color: #F8F9FB;

    > p {
        font-size: 12px;
        line-height: 1.45;
        color: #5B6475;
    }
`;

const RotuloCampo = styled.label`
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #0F172A;
`;

const GradeGastos = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
`;

const CampoGasto = styled.input`
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    background-color: #FFFFFF;
    color: #0F172A;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 500;

    &:focus {
        outline: 2px solid var(--roxo-moradia);
        outline-offset: -1px;
    }
`;

const BotaoRestaurar = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 4px;
    border: none;
    background: none;
    color: var(--roxo-moradia);
    font-family: var(--fonte-moradia);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
`;

function SimuladorCusto({ nome, simulador }) {
    const {
        renda, cenario, gastos, aluguel, simulacao, alterado, alterarRenda, alterarCenario, alterarGasto, restaurar,
    } = simulador;
    const [editandoRenda, setEditandoRenda] = useState(false);
    const [abrirCenario, setAbrirCenario] = useState(false);
    const { itens, saldo, fatiaSaldo, comprometimento, acimaDoLimite } = simulacao;
    const rotuloCenario = CENARIOS_MORADIA.find(({ id }) => id === cenario).rotulo;

    return (
        <Cartao aria-labelledby="titulo-simulador">
            <TextoTopo>
                <TituloCartao id="titulo-simulador">Simulador de custo mensal</TituloCartao>
                <p>Projeção com a sua renda e o aluguel médio de {nome}</p>
            </TextoTopo>

            <CaixaRenda>
                <span id="rotulo-renda">Renda mensal prevista</span>
                <LinhaRenda>
                    {editandoRenda ? (
                        <CampoRenda
                            aria-labelledby="rotulo-renda"
                            inputMode="numeric"
                            autoFocus
                            value={renda ? renda.toLocaleString('pt-BR') : ''}
                            placeholder="R$ 0"
                            onChange={(evento) => alterarRenda(lerValor(evento.target.value) || null)}
                            onKeyDown={(evento) => { if (evento.key === 'Enter') setEditandoRenda(false); }}
                        />
                    ) : (
                        <strong>{renda ? formatarReais(renda) : 'Informe sua renda'}</strong>
                    )}
                    <BotaoEditar type="button" onClick={() => setEditandoRenda(!editandoRenda)}>
                        {editandoRenda ? <><LuCheck aria-hidden="true" /> Pronto</> : <><LuPencil aria-hidden="true" /> Editar</>}
                    </BotaoEditar>
                </LinhaRenda>
            </CaixaRenda>

            {aluguel === null && <AvisoSemDado>Ainda não temos dado de aluguel para {nome}.</AvisoSemDado>}

            <Distribuicao>
                {saldo !== null && (
                    <BarraEmpilhada aria-hidden="true">
                        {itens.filter(({ valor }) => valor > 0).map(({ id, valor }) => (
                            <Segmento key={id} $peso={valor} $cor={CORES_GASTOS[id]} />
                        ))}
                        {saldo > 0 && <Segmento $peso={saldo} $cor={COR_SALDO} />}
                    </BarraEmpilhada>
                )}
                <ListaGastos>
                    {itens.map(({ id, rotulo, valor, fatia }) => (
                        <ItemGasto key={id}>
                            <Ponto $tamanho={10} $cor={CORES_GASTOS[id]} />
                            <span>{rotulo}</span>
                            {fatia !== null && <small>{fatia}%</small>}
                            <strong>{id === 'moradia' && aluguel === null ? '—' : formatarReais(valor)}</strong>
                        </ItemGasto>
                    ))}
                    {saldo !== null && (
                        <ItemGasto $saldo $negativo={saldo < 0}>
                            <Ponto $tamanho={10} $cor={saldo < 0 ? '#DC2626' : COR_SALDO} />
                            <span>Saldo livre</span>
                            <small>{fatiaSaldo}%</small>
                            <strong>{formatarReais(saldo)}</strong>
                        </ItemGasto>
                    )}
                </ListaGastos>
            </Distribuicao>

            {saldo !== null && saldo < 0 && (
                <Alerta $grave role="status">
                    <LuTriangleAlert aria-hidden="true" />
                    Neste cenário, faltariam {formatarReais(-saldo)} por mês.
                </Alerta>
            )}
            {saldo !== null && saldo >= 0 && acimaDoLimite && (
                <Alerta role="status">
                    <LuTriangleAlert aria-hidden="true" />
                    O aluguel ficaria em {Math.round(comprometimento * 100)}% da renda, acima dos {Math.round(LIMITE_MORADIA * 100)}% recomendados.
                </Alerta>
            )}

            {abrirCenario && (
                <PainelCenario>
                    <RotuloCampo as="div">
                        <span id="rotulo-moradia">Com quem você vai morar</span>
                        <Selecao
                            valor={rotuloCenario}
                            opcoes={CENARIOS_MORADIA.map(({ rotulo }) => rotulo)}
                            onChange={(rotulo) => alterarCenario(CENARIOS_MORADIA.find((item) => item.rotulo === rotulo).id)}
                            aria-labelledby="rotulo-moradia"
                        />
                    </RotuloCampo>
                    <GradeGastos>
                        {GASTOS.map(({ id, rotulo }) => (
                            <RotuloCampo key={id}>
                                {rotulo}
                                <CampoGasto
                                    inputMode="numeric"
                                    placeholder="R$ 0"
                                    value={gastos[id] ? gastos[id].toLocaleString('pt-BR') : ''}
                                    onChange={(evento) => alterarGasto(id, lerValor(evento.target.value))}
                                />
                            </RotuloCampo>
                        ))}
                    </GradeGastos>
                    <p>O aluguel vem da nossa base. Os outros gastos são informados por você: ainda não os temos por cidade.</p>
                </PainelCenario>
            )}

            <BotaoPrimario type="button" onClick={() => setAbrirCenario(!abrirCenario)} aria-expanded={abrirCenario}>
                <LuSlidersHorizontal aria-hidden="true" /> {abrirCenario ? 'Fechar simulação' : 'Simular outro cenário'}
            </BotaoPrimario>
            {alterado && (
                <BotaoRestaurar type="button" onClick={restaurar}>
                    <LuRotateCcw aria-hidden="true" /> Voltar ao meu cenário
                </BotaoRestaurar>
            )}
        </Cartao>
    );
}

export default SimuladorCusto
