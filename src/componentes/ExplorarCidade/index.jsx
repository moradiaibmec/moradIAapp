import styled from "styled-components"
import { LuArrowLeft, LuHeart, LuPencil, LuShare2, LuSlidersHorizontal, LuSnowflake, LuSparkles, LuSun } from 'react-icons/lu';
import CabecalhoApp from '../CabecalhoApp/index.jsx';
import IconePilar from '../IconePilar/index.jsx';
import CreditoFoto from '../CreditoFoto/index.jsx';
import { PILARES, REGIOES } from '../../analise/opcoes.js';
import { comoFoiEstimado, fonteDoPilar, fraseDoPilar, lemaDaCidade, nomeDaCidade, qualificarNota } from '../../analise/explicacao.js';
import { formatarPopulacao, formatarReais, nomeDoEstado } from '../../analise/formatacao.js';
import { aluguelDoDomicilio } from '../../analise/filtros.js';
import { pontoMedioRenda } from '../../analise/respostas.js';

const NOTA_EXCELENTE = 85;
const INVERNO_FRIO = 15;
const VERAO_QUENTE = 27;
const TEMPERATURA_FRIA = 16;

// Só "Visão geral" tem conteúdo por enquanto.
const ABAS = ['Visão geral', 'Bairros', 'Custo de vida', 'Clima', 'Mercado de trabalho', 'Educação e saúde'];

const COR_MORADIA = '#4F46E5';
const COR_SALDO = '#10B981';

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F6F7F9;
    font-family: var(--fonte-moradia);
`;

const Hero = styled.section`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 32px;
    min-height: 480px;
    padding: 32px 80px 40px;
    background:
        linear-gradient(90deg, rgba(11, 18, 32, 0.6) 0%, rgba(11, 18, 32, 0) 60%),
        linear-gradient(180deg, rgba(11, 18, 32, 0.4) 0%, rgba(11, 18, 32, 0) 30%, rgba(11, 18, 32, 0.95) 100%),
        ${({ $foto }) => ($foto ? `url("${$foto}") center / cover no-repeat, ` : '')}
        linear-gradient(135deg, #4338CA 0%, #312E81 45%, #0B1220 100%);
    box-sizing: border-box;

    @media (max-width: 900px) {
        min-height: 0;
        padding: 24px 16px 32px;
    }
`;

const TopoHero = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
`;

const AcoesHero = styled.div`
    display: flex;
    gap: 10px;
`;

const BotaoVidro = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border: none;
    border-radius: 999px;
    background-color: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(12px);
    color: #FFFFFF;
    font-family: var(--fonte-moradia);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    svg {
        font-size: 16px;
    }

    &:hover:not(:disabled) {
        background-color: rgba(15, 23, 42, 0.6);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const BaseHero = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;

    @media (max-width: 1100px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const InfoCidade = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-width: 720px;
`;

const SeloMatch = styled.span`
    display: flex;
    align-items: center;
    align-self: flex-start;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    background-color: #10B981;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 700;

    svg {
        font-size: 14px;
    }
`;

const NomeCidade = styled.h1`
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 72px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -2.2px;
    color: #FFFFFF;
    overflow-wrap: anywhere;

    @media (max-width: 900px) {
        font-size: 44px;
        letter-spacing: -1.2px;
    }
`;

const Lema = styled.p`
    font-size: 18px;
    line-height: 1.5;
    color: #E2E8F0;
`;

const LateralHero = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex-shrink: 0;
    gap: 12px;
    min-width: 0;

    @media (max-width: 1100px) {
        align-items: flex-start;
    }
`;

const FatosRapidos = styled.dl`
    display: flex;
    flex-shrink: 0;
    margin: 0;
    padding: 18px 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    background-color: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(20px);

    div {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 0 22px;
        border-right: 1px solid rgba(255, 255, 255, 0.15);
    }

    div:last-child {
        border-right: none;
    }

    dt {
        font-size: 12px;
        color: #CBD5E1;
    }

    dd {
        margin: 0;
        font-family: var(--fonte-titulo);
        font-size: 22px;
        font-weight: 700;
        color: #FFFFFF;
        white-space: nowrap;
    }

    @media (max-width: 600px) {
        flex-wrap: wrap;
        row-gap: 16px;

        div {
            flex: 1 1 40%;
            border-right: none;
        }
    }
`;

const Abas = styled.nav`
    display: flex;
    gap: 32px;
    padding: 0 80px;
    border-bottom: 1px solid #E6E8EC;
    background-color: #FFFFFF;
    overflow-x: auto;

    @media (max-width: 900px) {
        padding: 0 16px;
    }
`;

const Aba = styled.button`
    flex-shrink: 0;
    padding: 18px 0 16px;
    border: none;
    border-bottom: 2px solid ${({ $ativa }) => ($ativa ? 'var(--roxo-moradia)' : 'transparent')};
    background: none;
    color: ${({ $ativa }) => ($ativa ? 'var(--roxo-moradia)' : '#5B6475')};
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: ${({ $ativa }) => ($ativa ? 600 : 500)};
    cursor: ${({ $ativa }) => ($ativa ? 'default' : 'not-allowed')};
`;

const Corpo = styled.main`
    display: flex;
    align-items: flex-start;
    gap: 24px;
    padding: 40px 80px 80px;
    box-sizing: border-box;

    @media (max-width: 1100px) {
        flex-direction: column;
        align-items: stretch;
    }

    @media (max-width: 900px) {
        padding: 24px 16px 64px;
    }
`;

const Coluna = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex: ${({ $largura }) => ($largura ? `0 0 ${$largura}px` : '1')};
    min-width: 0;

    @media (max-width: 1100px) {
        flex: none;
    }
`;

const Cartao = styled.section`
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

const TopoCartao = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
`;

const TextoTopo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;

    p {
        font-size: 14px;
        line-height: 1.45;
        color: #5B6475;
    }
`;

const TituloCartao = styled.h2`
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: #0F172A;
`;

const Legenda = styled.ul`
    display: flex;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #5B6475;
    }
`;

const Ponto = styled.span`
    flex-shrink: 0;
    width: ${({ $tamanho = 8 }) => $tamanho}px;
    height: ${({ $tamanho = 8 }) => $tamanho}px;
    border-radius: 50%;
    background-color: ${({ $cor }) => $cor};
`;

const GradeFicha = styled.ul`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;

    @media (max-width: 1300px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 500px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

const CartaoPilar = styled.li`
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px;
    border: 1px solid #E6E8EC;
    border-radius: 14px;
    background-color: #F8F9FB;
    opacity: ${({ $semPeso }) => ($semPeso ? 0.6 : 1)};
`;

const TopoPilar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

const CaixaIcone = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background-color: #EEF0FF;
    color: var(--roxo-moradia);
    font-size: 18px;
`;

const ValorPilar = styled.span`
    font-family: var(--fonte-titulo);
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #0F172A;
`;

const TextoPilar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;

    strong {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        font-size: 14px;
        font-weight: 600;
        color: #0F172A;
    }

    span {
        font-size: 13px;
        color: #5B6475;
    }
`;

const SeloEstimado = styled.span`
    padding: 2px 6px;
    border-radius: 6px;
    background-color: #FFFBEB;
    color: #B45309 !important;
    font-size: 11px !important;
    font-weight: 700;
    cursor: help;
`;

const Trilho = styled.div`
    height: 6px;
    border-radius: 3px;
    background-color: #E8EAF0;
    overflow: hidden;
`;

const Preenchimento = styled.div`
    width: ${({ $valor }) => $valor}%;
    height: 100%;
    border-radius: inherit;
    background-color: ${({ $forte }) => ($forte ? 'var(--roxo-moradia)' : '#A5B4FC')};
`;

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
    font-size: 13px;
    font-weight: 600;

    svg {
        font-size: 14px;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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
    background-color: ${({ $saldo }) => ($saldo ? '#ECFDF5' : 'transparent')};
    color: ${({ $saldo }) => ($saldo ? '#047857' : '#0F172A')};
    font-size: 14px;

    span:nth-of-type(2) {
        flex: 1;
        font-weight: ${({ $saldo }) => ($saldo ? 700 : 500)};
    }

    small {
        font-size: 13px;
        color: ${({ $saldo }) => ($saldo ? '#047857' : '#5B6475')};
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

    svg {
        font-size: 16px;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const AvisoSemDado = styled.p`
    font-size: 14px;
    line-height: 1.5;
    color: #5B6475;
`;

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

const graus = (valor) => `${Math.round(valor)} °C`;
const alturaDaBarra = (temperatura) => Math.min(110, Math.max(12, (temperatura - 5) * 4.5));
const nomeDaRegiao = (id) => REGIOES.find((regiao) => regiao.id === id)?.rotulo;

function fatosDaCidade(cidade) {
    const { tempMedia, diasChuvaAno } = cidade.indicadores;
    return [
        cidade.populacao && ['População', formatarPopulacao(cidade.populacao)],
        tempMedia !== null && tempMedia !== undefined && ['Temp. média', graus(tempMedia)],
        diasChuvaAno && ['Chuva', `${Math.round(diasChuvaAno)} dias/ano`],
        nomeDaRegiao(cidade.regiao) && ['Região', nomeDaRegiao(cidade.regiao)],
    ].filter(Boolean);
}

function FichaDaCidade({ resultado, respostas, fontes }) {
    return (
        <Cartao aria-labelledby="titulo-ficha">
            <TopoCartao>
                <TextoTopo>
                    <TituloCartao id="titulo-ficha">Ficha e indicadores da cidade</TituloCartao>
                    <p>Notas calculadas com base nas suas prioridades</p>
                </TextoTopo>
                <Legenda>
                    <li><Ponto $cor="var(--roxo-moradia)" /> Excelente</li>
                    <li><Ponto $cor="#A5B4FC" /> Bom</li>
                </Legenda>
            </TopoCartao>

            <GradeFicha>
                {PILARES.map(({ id, rotulo }) => {
                    const avaliacao = resultado.notas[id];
                    const semPeso = avaliacao.peso === 'tantoFaz';
                    const detalhe = [fraseDoPilar(id, avaliacao, respostas), fonteDoPilar(id, fontes)].filter(Boolean).join('\n');
                    return (
                        <CartaoPilar key={id} $semPeso={semPeso} title={detalhe || undefined}>
                            <TopoPilar>
                                <CaixaIcone><IconePilar pilar={id} /></CaixaIcone>
                                <ValorPilar>{avaliacao.dadoIndisponivel ? '—' : `${avaliacao.nota}%`}</ValorPilar>
                            </TopoPilar>
                            <TextoPilar>
                                <strong>
                                    {rotulo}
                                    {avaliacao.estimado && (
                                        <SeloEstimado title={comoFoiEstimado(id, fontes)} aria-label={`Estimado: ${comoFoiEstimado(id, fontes)}`}>
                                            Estimado
                                        </SeloEstimado>
                                    )}
                                </strong>
                                <span>
                                    {avaliacao.dadoIndisponivel ? 'Sem dado' : qualificarNota(avaliacao.nota)}
                                    {semPeso && ' · Não pesou'}
                                </span>
                            </TextoPilar>
                            <Trilho aria-hidden="true">
                                {!avaliacao.dadoIndisponivel && (
                                    <Preenchimento $valor={avaliacao.nota} $forte={avaliacao.nota >= NOTA_EXCELENTE} />
                                )}
                            </Trilho>
                        </CartaoPilar>
                    );
                })}
            </GradeFicha>
        </Cartao>
    );
}

// Sem dados de alimentação, transporte e lazer na base, o simulador separa só aluguel e saldo livre.
function SimuladorCusto({ nome, cidade, respostas }) {
    const renda = pontoMedioRenda(respostas.orcamento.faixaRenda);
    const aluguel = aluguelDoDomicilio(cidade, respostas.domicilio);
    const saldo = renda === null || aluguel === null ? null : renda - aluguel;
    const fatia = (valor) => Math.round((100 * valor) / renda);

    return (
        <Cartao aria-labelledby="titulo-simulador">
            <TextoTopo>
                <TituloCartao id="titulo-simulador">Simulador de custo mensal</TituloCartao>
                <p>
                    {renda === null
                        ? `Aluguel médio em ${nome} para o tamanho do seu domicílio`
                        : `Projeção baseada na sua renda e no aluguel médio de ${nome}`}
                </p>
            </TextoTopo>

            <CaixaRenda>
                <span>{renda === null ? 'Aluguel médio estimado' : 'Renda mensal prevista'}</span>
                <LinhaRenda>
                    <strong>{renda === null ? (aluguel === null ? '—' : formatarReais(aluguel)) : formatarReais(renda)}</strong>
                    <BotaoEditar type="button" disabled title="Em breve"><LuPencil aria-hidden="true" /> Editar</BotaoEditar>
                </LinhaRenda>
            </CaixaRenda>

            {aluguel === null && <AvisoSemDado>Ainda não temos dado de aluguel para {nome}.</AvisoSemDado>}

            {saldo !== null && (
                <Distribuicao>
                    <BarraEmpilhada aria-hidden="true">
                        <Segmento $peso={Math.min(aluguel, renda)} $cor={COR_MORADIA} />
                        {saldo > 0 && <Segmento $peso={saldo} $cor={COR_SALDO} />}
                    </BarraEmpilhada>
                    <ListaGastos>
                        <ItemGasto>
                            <Ponto $tamanho={10} $cor={COR_MORADIA} />
                            <span>Moradia e aluguel</span>
                            <small>{fatia(aluguel)}%</small>
                            <strong>{formatarReais(aluguel)}</strong>
                        </ItemGasto>
                        <ItemGasto $saldo>
                            <Ponto $tamanho={10} $cor={COR_SALDO} />
                            <span>Saldo livre</span>
                            <small>{fatia(saldo)}%</small>
                            <strong>{formatarReais(saldo)}</strong>
                        </ItemGasto>
                    </ListaGastos>
                </Distribuicao>
            )}

            <BotaoPrimario type="button" disabled title="Em breve">
                <LuSlidersHorizontal aria-hidden="true" /> Simular outro cenário
            </BotaoPrimario>
        </Cartao>
    );
}

function ClimaDaCidade({ cidade }) {
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

function ExplorarCidade({ usuario, onNavegar, onNovaAnalise, onVoltar, rotuloVoltar = 'Voltar aos resultados', resultado, posicao, cidade, respostas, fontes }) {
    const nome = nomeDaCidade(resultado.cidade);
    const fatos = fatosDaCidade(cidade);

    return (
        <Pagina>
            <CabecalhoApp usuario={usuario} paginaAtiva="resultados" onNavegar={onNavegar} onNovaAnalise={onNovaAnalise} />

            <Hero aria-label={`Sobre ${resultado.cidade}`} $foto={cidade.foto?.url}>
                <TopoHero>
                    <BotaoVidro type="button" onClick={onVoltar}><LuArrowLeft aria-hidden="true" /> {rotuloVoltar}</BotaoVidro>
                    <AcoesHero>
                        <BotaoVidro type="button" disabled title="Em breve"><LuHeart aria-hidden="true" /> Salvar</BotaoVidro>
                        <BotaoVidro type="button" disabled title="Em breve"><LuShare2 aria-hidden="true" /> Compartilhar</BotaoVidro>
                    </AcoesHero>
                </TopoHero>

                <BaseHero>
                    <InfoCidade>
                        <SeloMatch>
                            <LuSparkles aria-hidden="true" />
                            {resultado.match}% compatível com você · #{posicao + 1} no ranking
                        </SeloMatch>
                        <NomeCidade>{nome}, {nomeDoEstado(cidade.uf)}</NomeCidade>
                        <Lema>{lemaDaCidade(resultado)}.</Lema>
                    </InfoCidade>

                    <LateralHero>
                        {fatos.length > 0 && (
                            <FatosRapidos>
                                {fatos.map(([rotulo, valor]) => (
                                    <div key={rotulo}>
                                        <dt>{rotulo}</dt>
                                        <dd>{valor}</dd>
                                    </div>
                                ))}
                            </FatosRapidos>
                        )}
                        {cidade.foto && <CreditoFoto foto={cidade.foto} />}
                    </LateralHero>
                </BaseHero>
            </Hero>

            <Abas aria-label="Seções da cidade">
                {ABAS.map((aba, indice) => (
                    <Aba
                        key={aba}
                        type="button"
                        $ativa={indice === 0}
                        aria-current={indice === 0 ? 'page' : undefined}
                        disabled={indice !== 0}
                        title={indice === 0 ? undefined : 'Em breve'}
                    >
                        {aba}
                    </Aba>
                ))}
            </Abas>

            <Corpo>
                <Coluna>
                    <FichaDaCidade resultado={resultado} respostas={respostas} fontes={fontes} />
                </Coluna>
                <Coluna $largura={420}>
                    <SimuladorCusto nome={nome} cidade={cidade} respostas={respostas} />
                    <ClimaDaCidade cidade={cidade} />
                </Coluna>
            </Corpo>
        </Pagina>
    );
}

export default ExplorarCidade
