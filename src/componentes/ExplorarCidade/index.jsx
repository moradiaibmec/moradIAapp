import { useState } from 'react';
import styled from "styled-components"
import { LuArrowLeft, LuHeart, LuShare2, LuSparkles } from 'react-icons/lu';
import CabecalhoApp from '../CabecalhoApp/index.jsx';
import IconePilar from '../IconePilar/index.jsx';
import CreditoFoto from '../CreditoFoto/index.jsx';
import SimuladorCusto from './SimuladorCusto.jsx';
import { AbaClima, AbaCusto, AbaEducacaoSaude, AbaTrabalho, ClimaDaCidade } from './AbasCidade.jsx';
import { useSimulador } from './useSimulador.js';
import {
    Cartao, Ponto, Preenchimento, SeloEstimado, TextoTopo, TituloCartao, TopoCartao, Trilho,
} from './estilos.js';
import { PILARES, REGIOES } from '../../analise/opcoes.js';
import { comoFoiEstimado, fonteDoPilar, fraseDoPilar, lemaDaCidade, nomeDaCidade, qualificarNota } from '../../analise/explicacao.js';
import { formatarPopulacao, nomeDoEstado } from '../../analise/formatacao.js';

const NOTA_EXCELENTE = 85;

const ABAS = [
    { id: 'geral', rotulo: 'Visão geral' },
    { id: 'custo', rotulo: 'Custo de vida' },
    { id: 'clima', rotulo: 'Clima' },
    { id: 'trabalho', rotulo: 'Mercado de trabalho' },
    { id: 'educacao', rotulo: 'Educação e saúde' },
];

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

// Até 1420px, nomes longos como Itaquaquecetuba não caberiam inteiros ao lado dos fatos: empilha os dois.
const BaseHero = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;

    @media (max-width: 1420px) {
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

    @media (max-width: 480px) {
        font-size: 8.5vw;
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

    @media (max-width: 1420px) {
        align-items: flex-start;
    }
`;

// A largura zero com mínimo de 100% impede que um crédito longo alargue a coluna: ele acompanha os fatos e é cortado com reticências.
const LinhaCredito = styled.div`
    display: flex;
    justify-content: flex-end;
    width: 0;
    min-width: 100%;

    @media (max-width: 1420px) {
        justify-content: flex-start;
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
    cursor: ${({ $ativa }) => ($ativa ? 'default' : 'pointer')};

    &:hover {
        color: var(--roxo-moradia);
    }
`;

const AvisoErro = styled.p`
    padding: 12px 80px;
    background-color: #FEF2F2;
    color: #B91C1C;
    font-size: 14px;
    font-weight: 600;

    @media (max-width: 900px) {
        padding: 12px 16px;
    }
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

const graus = (valor) => `${Math.round(valor)} °C`;
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

function ExplorarCidade({
    usuario, onNavegar, onNovaAnalise, onVoltar, rotuloVoltar = 'Voltar aos resultados', resultado, posicao, cidade, cidades, respostas, fontes,
    salva, onAlternarSalva,
}) {
    const nome = nomeDaCidade(resultado.cidade);
    const fatos = fatosDaCidade(cidade);
    const [abaAtiva, setAbaAtiva] = useState('geral');
    const [salvando, setSalvando] = useState(false);
    const [erroSalvar, setErroSalvar] = useState(false);
    const simulador = useSimulador(cidade, respostas);
    const dadosDaAba = { nome, cidade, cidades, respostas, resultado, fontes };

    async function alternarSalva() {
        setSalvando(true);
        setErroSalvar(false);
        const { error } = await onAlternarSalva();
        setSalvando(false);
        setErroSalvar(Boolean(error));
    }

    return (
        <Pagina>
            <CabecalhoApp usuario={usuario} paginaAtiva="resultados" onNavegar={onNavegar} onNovaAnalise={onNovaAnalise} />

            <Hero aria-label={`Sobre ${resultado.cidade}`} $foto={cidade.foto?.url}>
                <TopoHero>
                    <BotaoVidro type="button" onClick={onVoltar}><LuArrowLeft aria-hidden="true" /> {rotuloVoltar}</BotaoVidro>
                    <AcoesHero>
                        <BotaoVidro type="button" onClick={alternarSalva} disabled={salvando} aria-pressed={salva}>
                            <LuHeart aria-hidden="true" fill={salva ? 'currentColor' : 'none'} /> {salva ? 'Salva' : 'Salvar'}
                        </BotaoVidro>
                        <BotaoVidro type="button" disabled title="Em breve"><LuShare2 aria-hidden="true" /> Compartilhar</BotaoVidro>
                    </AcoesHero>
                </TopoHero>

                <BaseHero>
                    <InfoCidade>
                        <SeloMatch>
                            <LuSparkles aria-hidden="true" />
                            {resultado.match}% compatível com você · {posicao === null ? 'fora do seu ranking' : `#${posicao + 1} no ranking`}
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
                        {cidade.foto && <LinhaCredito><CreditoFoto foto={cidade.foto} /></LinhaCredito>}
                    </LateralHero>
                </BaseHero>
            </Hero>

            {erroSalvar && <AvisoErro role="alert">Não foi possível atualizar suas cidades salvas. Tente novamente.</AvisoErro>}

            <Abas aria-label="Seções da cidade">
                {ABAS.map(({ id, rotulo }) => (
                    <Aba
                        key={id}
                        type="button"
                        $ativa={id === abaAtiva}
                        aria-current={id === abaAtiva ? 'page' : undefined}
                        onClick={() => setAbaAtiva(id)}
                    >
                        {rotulo}
                    </Aba>
                ))}
            </Abas>

            <Corpo>
                {abaAtiva === 'geral' && (
                    <>
                        <Coluna>
                            <FichaDaCidade resultado={resultado} respostas={respostas} fontes={fontes} />
                        </Coluna>
                        <Coluna $largura={420}>
                            <SimuladorCusto nome={nome} simulador={simulador} />
                            <ClimaDaCidade cidade={cidade} />
                        </Coluna>
                    </>
                )}
                {abaAtiva === 'custo' && (
                    <>
                        <Coluna><AbaCusto {...dadosDaAba} /></Coluna>
                        <Coluna $largura={420}><SimuladorCusto nome={nome} simulador={simulador} /></Coluna>
                    </>
                )}
                {abaAtiva === 'clima' && (
                    <>
                        <Coluna><AbaClima {...dadosDaAba} /></Coluna>
                        <Coluna $largura={420}><ClimaDaCidade cidade={cidade} /></Coluna>
                    </>
                )}
                {abaAtiva === 'trabalho' && <Coluna><AbaTrabalho {...dadosDaAba} /></Coluna>}
                {abaAtiva === 'educacao' && <Coluna><AbaEducacaoSaude {...dadosDaAba} /></Coluna>}
            </Corpo>
        </Pagina>
    );
}

export default ExplorarCidade
