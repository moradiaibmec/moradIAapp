import styled from "styled-components"
import { LuSnowflake, LuSun } from 'react-icons/lu';
import { comoFoiEstimado, fraseDoPilar } from '../../analise/explicacao.js';
import { formatarReais } from '../../analise/formatacao.js';
import { aluguelDoDomicilio } from '../../analise/filtros.js';
import { alugueisPorTamanho, citarFonte, comparacaoNaBase, setoresDaCidade } from '../../analise/perfilCidade.js';
import { pessoasNoDomicilio } from '../../analise/respostas.js';
import { Cartao, Preenchimento, SeloEstimado, TextoTopo, TituloCartao, Trilho } from './estilos.js';

const INVERNO_FRIO = 15;
const VERAO_QUENTE = 27;
const TEMPERATURA_FRIA = 16;

const graus = (valor) => `${Math.round(valor)} °C`;
const alturaDaBarra = (temperatura) => Math.min(110, Math.max(12, (temperatura - 5) * 4.5));
const decimal = (valor) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const porcentagem = (fracao) => `${decimal(fracao * 100)}%`;

const Grafico = styled.ul`
    display: flex;
    align-items: flex-end;
    gap: 16px;
    height: 150px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const ColunaGrafico = styled.li`
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    height: 100%;

    strong {
        font-size: 11px;
        font-weight: 600;
        color: #5B6475;
    }

    span {
        font-size: 12px;
        color: #5B6475;
        text-align: center;
    }
`;

const Barra = styled.div`
    width: 100%;
    height: ${({ $altura }) => $altura}px;
    border-radius: 4px;
    background-color: ${({ $fria }) => ($fria ? '#93C5FD' : '#FCD34D')};
`;

const Nota = styled.p`
    display: flex;
    gap: 8px;
    padding: 14px;
    border-radius: 12px;
    background-color: ${({ $quente }) => ($quente ? '#FFF7E6' : '#EFF6FF')};
    color: ${({ $quente }) => ($quente ? '#92400E' : '#1E3A8A')};
    font-size: 13px;
    line-height: 1.45;

    svg {
        flex-shrink: 0;
        font-size: 16px;
        color: ${({ $quente }) => ($quente ? '#D97706' : '#2563EB')};
    }
`;

const GradeMetricas = styled.ul`
    display: grid;
    grid-template-columns: repeat(${({ $colunas = 2 }) => $colunas}, minmax(0, 1fr));
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;

    @media (max-width: 700px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

const CartaoMetrica = styled.li`
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 18px;
    border: 1px solid #E6E8EC;
    border-radius: 14px;
    background-color: #F8F9FB;

    > span {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        color: #5B6475;
    }

    > strong {
        font-family: var(--fonte-titulo);
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: #0F172A;
    }

    > p {
        font-size: 13px;
        line-height: 1.4;
        color: #5B6475;
    }

    > small {
        font-size: 11px;
        color: #8A93A3;
    }
`;

const TabelaAluguel = styled.ul`
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const LinhaAluguel = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 12px;
    border-bottom: 1px solid #E6E8EC;
    border-radius: ${({ $seu }) => ($seu ? '10px' : '0')};
    background-color: ${({ $seu }) => ($seu ? '#EEF0FF' : 'transparent')};
    font-size: 14px;
    color: #0F172A;

    &:last-child {
        border-bottom: none;
    }

    strong {
        font-weight: 700;
    }

    em {
        margin-left: 8px;
        color: var(--roxo-moradia);
        font-size: 12px;
        font-style: normal;
        font-weight: 700;
    }
`;

const ListaSetores = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const LinhaSetor = styled.li`
    display: flex;
    flex-direction: column;
    gap: 6px;

    div:first-child {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 14px;
        color: #0F172A;
    }

    em {
        margin-left: 8px;
        color: var(--roxo-moradia);
        font-size: 12px;
        font-style: normal;
        font-weight: 700;
    }

    strong {
        font-weight: 700;
    }
`;

const NotaFonte = styled.p`
    font-size: 12px;
    line-height: 1.45;
    color: #8A93A3;
`;

function Metrica({ rotulo, valor, comparacao, fonte, estimado }) {
    return (
        <CartaoMetrica>
            <span>{rotulo}{estimado && <SeloEstimado title={estimado}>Estimado</SeloEstimado>}</span>
            <strong>{valor}</strong>
            {comparacao && <p>{comparacao}</p>}
            {fonte && <small>{fonte}</small>}
        </CartaoMetrica>
    );
}

export function ClimaDaCidade({ cidade }) {
    const { tempMedia, tempMesFrio, tempMesQuente } = cidade.indicadores;
    const barras = [
        ['Mês mais frio', tempMesFrio],
        ['Média anual', tempMedia],
        ['Mês mais quente', tempMesQuente],
    ].filter(([, valor]) => valor !== null && valor !== undefined);
    if (barras.length === 0) return null;

    const invernoFrio = tempMesFrio !== null && tempMesFrio !== undefined && tempMesFrio < INVERNO_FRIO;
    const veraoQuente = tempMesQuente !== null && tempMesQuente !== undefined && tempMesQuente >= VERAO_QUENTE;

    return (
        <Cartao aria-labelledby="titulo-clima">
            <TextoTopo>
                <TituloCartao id="titulo-clima">Clima ao longo do ano</TituloCartao>
                <p>Temperatura média (°C)</p>
            </TextoTopo>

            <Grafico>
                {barras.map(([rotulo, valor]) => (
                    <ColunaGrafico key={rotulo}>
                        <strong>{Math.round(valor)}°</strong>
                        <Barra $altura={alturaDaBarra(valor)} $fria={valor <= TEMPERATURA_FRIA} />
                        <span>{rotulo}</span>
                    </ColunaGrafico>
                ))}
            </Grafico>

            {invernoFrio && (
                <Nota>
                    <LuSnowflake aria-hidden="true" />
                    Inverno frio, com média de {graus(tempMesFrio)} no mês mais frio. Considere imóveis com boa vedação e aquecimento.
                </Nota>
            )}
            {!invernoFrio && veraoQuente && (
                <Nota $quente>
                    <LuSun aria-hidden="true" />
                    Verão quente, com média de {graus(tempMesQuente)} no mês mais quente. Considere imóveis com boa ventilação ou ar-condicionado.
                </Nota>
            )}
        </Cartao>
    );
}

export function AbaCusto({ nome, cidade, cidades, respostas, resultado, fontes }) {
    const seuTamanho = respostas.domicilio.moradia === 'amigos' ? null : pessoasNoDomicilio(respostas.domicilio);
    const aluguel = aluguelDoDomicilio(cidade, respostas.domicilio);
    const estimado = cidade.estimados?.includes('aluguel') ? comoFoiEstimado('custo', fontes) : null;
    const tamanhos = alugueisPorTamanho(cidade);
    const fonte = citarFonte(fontes, 'aluguel');

    return (
        <Cartao aria-labelledby="titulo-aba-custo">
            <TextoTopo>
                <TituloCartao id="titulo-aba-custo">Custo de moradia em {nome}</TituloCartao>
                <p>{fraseDoPilar('custo', resultado.notas.custo, respostas)}</p>
            </TextoTopo>

            <GradeMetricas>
                <Metrica
                    rotulo="Aluguel para o seu domicílio"
                    valor={aluguel === null ? '—' : `${formatarReais(aluguel)}/mês`}
                    comparacao={comparacaoNaBase(cidades, (item) => aluguelDoDomicilio(item, respostas.domicilio), aluguel, 'Mais caro')}
                    estimado={estimado}
                />
                <Metrica rotulo="Nota de custo no seu perfil" valor={resultado.notas.custo.dadoIndisponivel ? '—' : `${resultado.notas.custo.nota}%`} />
            </GradeMetricas>

            {tamanhos.length > 0 && (
                <div>
                    <TituloCartao as="h3" style={{ fontSize: 16, marginBottom: 8 }}>Aluguel médio por tamanho do domicílio</TituloCartao>
                    <TabelaAluguel>
                        {tamanhos.map(({ pessoas, valor }) => (
                            <LinhaAluguel key={pessoas} $seu={pessoas === seuTamanho}>
                                <span>
                                    {pessoas} {pessoas === 1 ? 'pessoa' : 'pessoas'}
                                    {pessoas === seuTamanho && <em>Seu perfil</em>}
                                </span>
                                <strong>{formatarReais(valor)}/mês</strong>
                            </LinhaAluguel>
                        ))}
                    </TabelaAluguel>
                </div>
            )}

            {fonte && <NotaFonte>{fonte}</NotaFonte>}
        </Cartao>
    );
}

export function AbaClima({ nome, cidade, cidades, respostas, resultado, fontes }) {
    const { tempMedia, tempMesFrio, tempMesQuente, diasChuvaAno } = cidade.indicadores;
    const indicador = (nome) => (item) => item.indicadores[nome];
    const presente = (valor) => valor !== null && valor !== undefined;

    return (
        <Cartao aria-labelledby="titulo-aba-clima">
            <TextoTopo>
                <TituloCartao id="titulo-aba-clima">Como é o clima em {nome}</TituloCartao>
                <p>Nota de clima no seu perfil: {resultado.notas.clima.dadoIndisponivel ? 'sem dado' : `${resultado.notas.clima.nota}%`}</p>
            </TextoTopo>

            <GradeMetricas>
                <Metrica
                    rotulo="Temperatura média anual"
                    valor={presente(tempMedia) ? graus(tempMedia) : '—'}
                    comparacao={comparacaoNaBase(cidades, indicador('tempMedia'), tempMedia, 'Mais quente')}
                />
                <Metrica
                    rotulo="Mês mais frio"
                    valor={presente(tempMesFrio) ? graus(tempMesFrio) : '—'}
                    comparacao={comparacaoNaBase(cidades, indicador('tempMesFrio'), tempMesFrio, 'Mais quente')}
                />
                <Metrica
                    rotulo="Mês mais quente"
                    valor={presente(tempMesQuente) ? graus(tempMesQuente) : '—'}
                    comparacao={comparacaoNaBase(cidades, indicador('tempMesQuente'), tempMesQuente, 'Mais quente')}
                />
                <Metrica
                    rotulo="Dias de chuva por ano"
                    valor={presente(diasChuvaAno) ? Math.round(diasChuvaAno) : '—'}
                    comparacao={comparacaoNaBase(cidades, indicador('diasChuvaAno'), diasChuvaAno, 'Mais chuvoso')}
                />
            </GradeMetricas>

            {respostas.clima.chuvaIncomoda && <NotaFonte>Você disse que chuva frequente incomoda, então ela entrou na sua nota.</NotaFonte>}
            {citarFonte(fontes, 'tempMedia') && <NotaFonte>{citarFonte(fontes, 'tempMedia')}</NotaFonte>}
        </Cartao>
    );
}

export function AbaTrabalho({ nome, cidade, cidades, respostas, resultado, fontes }) {
    const { empregoPerCapita, crescimentoEmprego } = cidade.indicadores;
    const setores = setoresDaCidade(cidade, respostas.trabalho.setores);
    const maior = Math.max(...setores.map(({ participacao }) => participacao), 0);
    const presente = (valor) => valor !== null && valor !== undefined;
    const indicador = (nome) => (item) => item.indicadores[nome];
    const sinal = crescimentoEmprego > 0 ? '+' : '';

    return (
        <Cartao aria-labelledby="titulo-aba-trabalho">
            <TextoTopo>
                <TituloCartao id="titulo-aba-trabalho">Mercado de trabalho em {nome}</TituloCartao>
                <p>Nota de trabalho no seu perfil: {resultado.notas.trabalho.dadoIndisponivel ? 'sem dado' : `${resultado.notas.trabalho.nota}%`}</p>
            </TextoTopo>

            <GradeMetricas>
                <Metrica
                    rotulo="Empregos formais a cada 100 habitantes"
                    valor={presente(empregoPerCapita) ? Math.round(empregoPerCapita * 100) : '—'}
                    comparacao={comparacaoNaBase(cidades, indicador('empregoPerCapita'), empregoPerCapita)}
                />
                <Metrica
                    rotulo="Crescimento dos empregos, 2022 a 2024"
                    valor={presente(crescimentoEmprego) ? `${sinal}${decimal(crescimentoEmprego)}%` : '—'}
                    comparacao={comparacaoNaBase(cidades, indicador('crescimentoEmprego'), crescimentoEmprego)}
                />
            </GradeMetricas>

            {setores.length > 0 && (
                <div>
                    <TituloCartao as="h3" style={{ fontSize: 16, marginBottom: 14 }}>Onde estão os empregos formais</TituloCartao>
                    <ListaSetores>
                        {setores.map(({ id, rotulo, participacao, escolhido }) => (
                            <LinhaSetor key={id}>
                                <div>
                                    <span>{rotulo}{escolhido && <em>Seu setor</em>}</span>
                                    <strong>{porcentagem(participacao)}</strong>
                                </div>
                                <Trilho aria-hidden="true">
                                    <Preenchimento $valor={maior ? (100 * participacao) / maior : 0} $forte={escolhido} />
                                </Trilho>
                            </LinhaSetor>
                        ))}
                    </ListaSetores>
                </div>
            )}

            {citarFonte(fontes, 'empregoSetor') && <NotaFonte>{citarFonte(fontes, 'empregoSetor')}</NotaFonte>}
        </Cartao>
    );
}

export function AbaEducacaoSaude({ nome, cidade, cidades, fontes }) {
    const { idebIniciais, idebFinais, vagasSuperior10k, leitos1k } = cidade.indicadores;
    const presente = (valor) => valor !== null && valor !== undefined;
    const indicador = (nome) => (item) => item.indicadores[nome];

    return (
        <Cartao aria-labelledby="titulo-aba-educacao">
            <TextoTopo>
                <TituloCartao id="titulo-aba-educacao">Educação e saúde em {nome}</TituloCartao>
                <p>Indicadores da rede pública de ensino, do ensino superior e da rede hospitalar</p>
            </TextoTopo>

            <GradeMetricas>
                <Metrica
                    rotulo="Ideb, anos iniciais"
                    valor={presente(idebIniciais) ? decimal(idebIniciais) : '—'}
                    comparacao={comparacaoNaBase(cidades, indicador('idebIniciais'), idebIniciais)}
                    fonte={citarFonte(fontes, 'idebIniciais')}
                />
                <Metrica
                    rotulo="Ideb, anos finais"
                    valor={presente(idebFinais) ? decimal(idebFinais) : '—'}
                    comparacao={comparacaoNaBase(cidades, indicador('idebFinais'), idebFinais)}
                    fonte={citarFonte(fontes, 'idebFinais')}
                />
                <Metrica
                    rotulo="Vagas no ensino superior por 10 mil habitantes"
                    valor={presente(vagasSuperior10k) ? Math.round(vagasSuperior10k) : '—'}
                    comparacao={comparacaoNaBase(cidades, indicador('vagasSuperior10k'), vagasSuperior10k)}
                    fonte={citarFonte(fontes, 'vagasSuperior10k')}
                />
                <Metrica
                    rotulo="Leitos por mil habitantes"
                    valor={presente(leitos1k) ? decimal(leitos1k) : '—'}
                    comparacao={comparacaoNaBase(cidades, indicador('leitos1k'), leitos1k)}
                    fonte={citarFonte(fontes, 'leitos1k')}
                />
            </GradeMetricas>
        </Cartao>
    );
}
