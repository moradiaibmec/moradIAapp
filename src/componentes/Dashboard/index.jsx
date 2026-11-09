import { useEffect, useState } from 'react';
import styled from "styled-components"
import { FiArrowRight, FiAward, FiCheck, FiChevronRight, FiClock } from 'react-icons/fi';
import CabecalhoApp from '../CabecalhoApp/index.jsx';
import CreditoFoto from '../CreditoFoto/index.jsx';
import { textoDoCredito } from '../../analise/formatacao.js';
import { carregarFotos } from '../../dados/base.js';
import { TOTAL_TRACOS, calcularIndicadores, tracosPreenchidos } from '../../dados/indicadores.js';

// Cidades sem foto (ou enquanto ela carrega) mostram um gradiente da marca no lugar da imagem.
const FUNDO_RESERVA = 'linear-gradient(135deg, #6366F1 0%, #312E81 100%)';
const fundoComFoto = (url) => (url ? `url("${url}") center / cover no-repeat, ${FUNDO_RESERVA}` : FUNDO_RESERVA);

const RECENTES_VISIVEIS = 5;

// Ranking ilustrativo do convite à primeira análise. Os códigos IBGE só servem para achar as fotos.
const EXEMPLO_PRIMEIRA = { ibge: 4106902, cidade: '1. Curitiba, PR', match: 94, detalhe: 'Qualidade de vida e mobilidade em destaque' };
const EXEMPLO_PROXIMAS = [
    { ibge: 4205407, cidade: '2. Florianópolis, SC', match: 91 },
    { ibge: 3106200, cidade: '3. Belo Horizonte, MG', match: 88 },
];

const COMO_FUNCIONA = [
    { titulo: 'Conte o que importa para você', texto: 'Custo de vida, segurança, clima, trabalho e outras prioridades, em poucas etapas.' },
    { titulo: 'Receba seu ranking de cidades', texto: 'Cada cidade vem com um percentual de match calculado para o seu perfil.' },
    { titulo: 'Explore e compare as melhores', texto: 'Veja bairros, custos e indicadores lado a lado para decidir com segurança.' },
];

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F6F7F9;
    font-family: var(--fonte-moradia);
`;

const Conteudo = styled.main`
    display: flex;
    flex-direction: column;
    gap: ${({ $primeira }) => ($primeira ? '48px' : '24px')};
    max-width: 1440px;
    margin: 0 auto;
    padding: ${({ $primeira }) => ($primeira ? '32px' : '40px')} 80px 64px;
    box-sizing: border-box;

    @media (max-width: 900px) {
        padding: 24px 16px 48px;
    }
`;

const Saudacao = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Titulo = styled.h1`
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.8px;
    color: #0F172A;

    @media (max-width: 600px) {
        font-size: 28px;
    }
`;

const Subtitulo = styled.p`
    font-size: 16px;
    color: #5B6475;
`;

const LinhaHero = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;

    @media (max-width: 1100px) {
        grid-template-columns: 1fr;
    }
`;

const HeroCidade = styled.section`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 32px;
    min-width: 0;
    min-height: 400px;
    padding: 32px;
    border-radius: 24px;
    background:
        linear-gradient(180deg, rgba(11, 18, 32, 0.25) 0%, rgba(11, 18, 32, 0) 30%, rgba(11, 18, 32, 0.9) 100%),
        ${({ $foto }) => fundoComFoto($foto)};
    color: #FFFFFF;
    box-sizing: border-box;

    @media (max-width: 600px) {
        min-height: 340px;
        padding: 20px;
    }
`;

const TopoHero = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

const EtiquetaHero = styled.p`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    background-color: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(8px);
    font-size: 13px;
    font-weight: 600;

    svg {
        flex-shrink: 0;
        font-size: 14px;
    }
`;

// Alguns créditos do Commons são enormes: aqui eles cortam, e o texto inteiro fica no title.
const CreditoHero = styled(CreditoFoto)`
    max-width: 320px;
`;

const BaseHero = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const InfoHero = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
`;

const CidadeHero = styled.h2`
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 40px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -1px;

    @media (max-width: 600px) {
        font-size: 28px;
    }
`;

const DetalheHero = styled.p`
    font-size: 15px;
`;

const BotaoVerCidade = styled.button`
    flex-shrink: 0;
    padding: 12px 18px;
    border: none;
    border-radius: 10px;
    background-color: #FFFFFF;
    color: #0F172A;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #EEF0FF;
    }

    &:focus-visible {
        outline: 2px solid #FFFFFF;
        outline-offset: 2px;
    }
`;

const ChamadaAnalise = styled.section`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 32px;
    min-width: 0;
    padding: 32px;
    border-radius: 24px;
    background-color: var(--roxo-moradia);
    color: #FFFFFF;
    box-sizing: border-box;

    @media (max-width: 600px) {
        padding: 24px 20px;
    }
`;

const TextosChamada = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const UltimaAnalise = styled.p`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #E0E7FF;

    svg {
        flex-shrink: 0;
        font-size: 14px;
    }
`;

const TituloChamada = styled.h2`
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 32px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.7px;
`;

const TextoChamada = styled.p`
    font-size: 15px;
    line-height: 1.55;
`;

const BotaoBranco = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 52px;
    border: none;
    border-radius: 12px;
    background-color: #FFFFFF;
    color: var(--roxo-moradia);
    font-family: var(--fonte-moradia);
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s;

    svg {
        flex-shrink: 0;
        font-size: 18px;
    }

    &:hover {
        background-color: #EEF0FF;
    }

    &:focus-visible {
        outline: 2px solid #FFFFFF;
        outline-offset: 2px;
    }
`;

const Resumo = styled.section`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid #E6E8EC;
    border-radius: 16px;
    background-color: #FFFFFF;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const ItemResumo = styled.div`
    display: flex;
    align-items: center;
    gap: 18px;
    min-width: 0;
    padding: 20px 28px;

    & + & {
        border-left: 1px solid #E6E8EC;
    }

    @media (max-width: 900px) {
        & + & {
            border-left: none;
            border-top: 1px solid #E6E8EC;
        }
    }
`;

const ValorResumo = styled.p`
    font-family: var(--fonte-titulo);
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.8px;
    color: ${({ $cor }) => $cor ?? '#0F172A'};
`;

const TextosResumo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
`;

const RotuloResumo = styled.p`
    font-size: 14px;
    font-weight: 600;
    color: #0F172A;
`;

const DetalheSecundario = styled.p`
    font-size: 13px;
    color: #5B6475;
`;

const Historico = styled.div`
    display: grid;
    grid-template-columns: 41fr 22fr;
    gap: 20px;

    @media (max-width: 1100px) {
        grid-template-columns: 1fr;
    }
`;

const Cartao = styled.section`
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 24px 28px 12px;
    border: 1px solid #E6E8EC;
    border-radius: 16px;
    background-color: #FFFFFF;
    box-sizing: border-box;

    @media (max-width: 600px) {
        padding: 20px 16px 8px;
    }
`;

const CabecalhoCartao = styled.div`
    display: flex;
    align-items: ${({ $base }) => ($base ? 'flex-end' : 'flex-start')};
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 16px;
`;

const TextosCabecalho = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
`;

const TituloCartao = styled.h2`
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: #0F172A;
`;

const DescricaoCartao = styled.p`
    font-size: 14px;
    color: #5B6475;
`;

const RotulosColunas = styled.div`
    display: grid;
    grid-template-columns: 150px 76px;
    gap: 24px;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 500;
    color: #5B6475;

    span:last-child {
        text-align: right;
    }

    @media (max-width: 700px) {
        display: none;
    }
`;

const Lista = styled.ol`
    display: flex;
    flex-direction: column;
    flex: 1;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const LinhaCidade = styled.li`
    display: grid;
    grid-template-columns: auto 44px minmax(0, 1fr) 150px 86px;
    align-items: center;
    gap: 14px;
    min-height: 76px;
    padding: 12px 0;
    border-top: 1px solid #EDEFF3;
    box-sizing: border-box;

    @media (max-width: 700px) {
        grid-template-columns: auto 44px minmax(0, 1fr) auto;
    }
`;

const Posicao = styled.span`
    min-width: 14px;
    font-size: 14px;
    font-weight: 700;
    color: #5B6475;
`;

const Miniatura = styled.div`
    flex-shrink: 0;
    width: ${({ $tamanho }) => $tamanho}px;
    height: ${({ $tamanho }) => $tamanho}px;
    border-radius: 10px;
    background: ${({ $foto }) => fundoComFoto($foto)};
`;

const TextosCidade = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
`;

const NomeCidade = styled.p`
    font-size: 15px;
    font-weight: 600;
    color: #0F172A;
`;

const Frequencia = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;

    @media (max-width: 700px) {
        grid-column: 1 / -1;
        grid-row: 2;
    }
`;

const RotuloFrequencia = styled.p`
    font-size: 13px;
    color: #0F172A;
`;

const Medidor = styled.div`
    display: flex;
    gap: 2px;
    height: 10px;
    max-width: 142px;
`;

const Traco = styled.span`
    flex: 1;
    border-radius: 2px;
    background-color: ${({ $cheio }) => ($cheio ? 'var(--roxo-moradia)' : '#E6E8EC')};
`;

const MatchMedio = styled.p`
    font-family: var(--fonte-titulo);
    font-size: 18px;
    font-weight: 700;
    color: #0F172A;
    text-align: right;
`;

const LinkTexto = styled.button`
    flex-shrink: 0;
    padding: 0;
    border: none;
    background: none;
    color: var(--roxo-moradia);
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;

const LinhaRecente = styled.li`
    display: flex;
    border-top: 1px solid #EDEFF3;
`;

const BotaoRecente = styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 76px;
    padding: 12px 0;
    border: none;
    background: none;
    font: inherit;
    text-align: left;
    cursor: pointer;

    > svg {
        flex-shrink: 0;
        font-size: 18px;
        color: #5B6475;
        transition: transform 0.2s;
    }

    &:hover > svg {
        transform: translateX(2px);
    }

    &:focus-visible {
        outline: 2px solid var(--roxo-moradia);
        outline-offset: -2px;
    }

    ${TextosCidade} {
        flex: 1;
    }
`;

const Selo = styled.span`
    flex-shrink: 0;
    padding: 4px 10px;
    border-radius: 999px;
    background-color: ${({ $branco }) => ($branco ? '#FFFFFF' : '#EEF0FF')};
    color: var(--roxo-moradia);
    font-family: var(--fonte-moradia);
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
`;

const ConvitePrimeira = styled.section`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 56px;
    padding: 56px 56px 56px 64px;
    border-radius: 28px;
    background-color: var(--roxo-moradia);
    color: #FFFFFF;

    @media (max-width: 1100px) {
        flex-direction: column;
        align-items: stretch;
        gap: 40px;
        padding: 40px 32px;
    }

    @media (max-width: 600px) {
        padding: 28px 20px;
        border-radius: 20px;
    }
`;

const Convite = styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
    flex: 1;
    min-width: 0;
`;

const TextosConvite = styled.div`
    display: flex;
    flex-direction: column;
    gap: 18px;
`;

const TituloConvite = styled.h1`
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 60px;
    font-weight: 800;
    line-height: 1.06;
    letter-spacing: -1.8px;

    @media (max-width: 1300px) {
        font-size: 48px;
    }

    @media (max-width: 600px) {
        font-size: 34px;
        letter-spacing: -1px;
    }
`;

const TextoConvite = styled.p`
    max-width: 560px;
    font-size: 18px;
    line-height: 1.5;

    @media (max-width: 600px) {
        font-size: 16px;
    }
`;

const AcaoConvite = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
`;

const BotaoPrimeira = styled(BotaoBranco)`
    gap: 10px;
    height: auto;
    padding: 20px 28px;
    border-radius: 14px;
    font-size: 17px;

    svg {
        font-size: 20px;
    }

    @media (max-width: 600px) {
        width: 100%;
        padding: 18px 16px;
        font-size: 16px;
    }
`;

const Garantias = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 500;
    }

    svg {
        flex-shrink: 0;
        font-size: 16px;
    }
`;

const Exemplo = styled.aside`
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex-shrink: 0;
    width: 420px;
    max-width: 100%;
    padding: 20px;
    border-radius: 20px;
    background-color: #FFFFFF;
    box-shadow: 0 16px 40px rgba(30, 27, 75, 0.25);
    box-sizing: border-box;

    @media (max-width: 1100px) {
        width: 100%;
    }
`;

const RotuloExemplo = styled.p`
    font-size: 13px;
    font-weight: 600;
    color: #5B6475;
`;

const PrimeiroExemplo = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 190px;
    padding: 14px;
    border-radius: 14px;
    background:
        linear-gradient(180deg, rgba(11, 18, 32, 0) 35%, rgba(11, 18, 32, 0.85) 100%),
        ${({ $foto }) => fundoComFoto($foto)};
    color: #FFFFFF;
    box-sizing: border-box;

    ${Selo} {
        align-self: flex-end;
    }
`;

const TextosPrimeiroExemplo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const CidadeExemplo = styled.p`
    font-family: var(--fonte-titulo);
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.4px;
`;

const DetalheExemplo = styled.p`
    font-size: 13px;
`;

const ProximasExemplo = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
`;

const LinhaExemplo = styled.li`
    display: flex;
    align-items: center;
    gap: 12px;
    height: 60px;

    & + & {
        border-top: 1px solid #EDEFF3;
    }

    ${NomeCidade} {
        flex: 1;
        min-width: 0;
    }
`;

const ComoFunciona = styled.section`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const TituloComoFunciona = styled.h2`
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: #0F172A;
`;

const Etapas = styled.ol`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
    margin: 0;
    padding: 0;
    list-style: none;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 24px;
    }
`;

const Etapa = styled.li`
    display: flex;
    gap: 14px;
`;

const NumeroEtapa = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #EEF0FF;
    color: var(--roxo-moradia);
    font-size: 14px;
    font-weight: 700;
`;

const TextosEtapa = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const TituloEtapa = styled.h3`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #0F172A;
`;

const TextoEtapa = styled.p`
    font-size: 14px;
    line-height: 1.5;
    color: #5B6475;
`;

const formatoData = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
});

const formatarData = (data) => formatoData.format(new Date(data));
const analisesNoPlural = (quantidade) => (quantidade === 1 ? 'análise' : 'análises');
const creditoDe = (foto) => (foto ? `${textoDoCredito(foto)} (Wikimedia Commons)` : undefined);

function PrimeiraAnalise({ primeiroNome, fotos, onIniciarAnalise }) {
    const fotoPrimeira = fotos[EXEMPLO_PRIMEIRA.ibge];
    return (
        <>
            <ConvitePrimeira>
                <Convite>
                    <TextosConvite>
                        <TituloConvite>Olá, {primeiroNome ?? 'bem-vindo(a)'}! Qual cidade combina com você?</TituloConvite>
                        <TextoConvite>
                            Faça sua primeira análise: conte o que importa na sua vida e receba um ranking de cidades com o seu percentual de match.
                        </TextoConvite>
                    </TextosConvite>
                    <AcaoConvite>
                        <BotaoPrimeira onClick={onIniciarAnalise}>
                            Fazer minha primeira análise <FiArrowRight />
                        </BotaoPrimeira>
                        <Garantias>
                            <li><FiCheck aria-hidden="true" /> Poucas etapas rápidas</li>
                            <li><FiCheck aria-hidden="true" /> Refaça quando quiser</li>
                        </Garantias>
                    </AcaoConvite>
                </Convite>

                <Exemplo aria-label="Exemplo de resultado">
                    <RotuloExemplo>Exemplo de resultado</RotuloExemplo>
                    <PrimeiroExemplo $foto={fotoPrimeira?.miniatura} title={creditoDe(fotoPrimeira)}>
                        <Selo $branco>{EXEMPLO_PRIMEIRA.match}% match</Selo>
                        <TextosPrimeiroExemplo>
                            <CidadeExemplo>{EXEMPLO_PRIMEIRA.cidade}</CidadeExemplo>
                            <DetalheExemplo>{EXEMPLO_PRIMEIRA.detalhe}</DetalheExemplo>
                        </TextosPrimeiroExemplo>
                    </PrimeiroExemplo>
                    <ProximasExemplo>
                        {EXEMPLO_PROXIMAS.map(({ ibge, cidade, match }) => (
                            <LinhaExemplo key={ibge}>
                                <Miniatura $tamanho={40} $foto={fotos[ibge]?.miniatura} title={creditoDe(fotos[ibge])} />
                                <NomeCidade>{cidade}</NomeCidade>
                                <Selo>{match}% match</Selo>
                            </LinhaExemplo>
                        ))}
                    </ProximasExemplo>
                </Exemplo>
            </ConvitePrimeira>

            <ComoFunciona>
                <TituloComoFunciona>Como funciona</TituloComoFunciona>
                <Etapas>
                    {COMO_FUNCIONA.map(({ titulo, texto }, indice) => (
                        <Etapa key={titulo}>
                            <NumeroEtapa aria-hidden="true">{indice + 1}</NumeroEtapa>
                            <TextosEtapa>
                                <TituloEtapa>{titulo}</TituloEtapa>
                                <TextoEtapa>{texto}</TextoEtapa>
                            </TextosEtapa>
                        </Etapa>
                    ))}
                </Etapas>
            </ComoFunciona>
        </>
    );
}

function ComHistorico({ primeiroNome, indicadores, fotos, onIniciarAnalise, onAbrirAnalise, onVerCidade }) {
    const { totalAnalises, cidadeMaisRecomendada: campea, melhorMatch, cidadesAvaliadas, ranking, recentes } = indicadores;
    const [verTodas, setVerTodas] = useState(false);
    const fotoCampea = fotos[campea.ibge];
    const dataUltima = formatarData(recentes[0].data);
    const recentesVisiveis = verTodas ? recentes : recentes.slice(0, RECENTES_VISIVEIS);

    return (
        <>
            <Saudacao>
                <Titulo>Olá, {primeiroNome ?? 'bem-vindo(a)'}</Titulo>
                <Subtitulo>Acompanhe suas análises e veja quais cidades mais combinam com você.</Subtitulo>
            </Saudacao>

            <LinhaHero>
                <HeroCidade aria-label="Sua cidade mais recomendada" $foto={fotoCampea?.url}>
                    <TopoHero>
                        <EtiquetaHero><FiAward aria-hidden="true" /> Sua cidade mais recomendada</EtiquetaHero>
                        {fotoCampea && <CreditoHero foto={fotoCampea} />}
                    </TopoHero>
                    <BaseHero>
                        <InfoHero>
                            <CidadeHero>{campea.cidade}</CidadeHero>
                            <DetalheHero>
                                {totalAnalises === 1
                                    ? '1º lugar na sua primeira análise'
                                    : `1º lugar em ${campea.vezes} das suas ${totalAnalises} análises`}
                            </DetalheHero>
                        </InfoHero>
                        <BotaoVerCidade onClick={() => onVerCidade(campea.ibge, campea.idAnalise)}>Ver cidade</BotaoVerCidade>
                    </BaseHero>
                </HeroCidade>

                <ChamadaAnalise>
                    <TextosChamada>
                        <UltimaAnalise><FiClock aria-hidden="true" /> Última análise em {dataUltima}</UltimaAnalise>
                        <TituloChamada>Suas prioridades mudaram?</TituloChamada>
                        <TextoChamada>Responda poucas etapas rápidas e receba um novo ranking de cidades com o seu percentual de match.</TextoChamada>
                    </TextosChamada>
                    <BotaoBranco onClick={onIniciarAnalise}>
                        Iniciar nova análise <FiArrowRight />
                    </BotaoBranco>
                </ChamadaAnalise>
            </LinhaHero>

            <Resumo aria-label="Resumo">
                <ItemResumo>
                    <ValorResumo>{totalAnalises}</ValorResumo>
                    <TextosResumo>
                        <RotuloResumo>{totalAnalises === 1 ? 'Análise realizada' : 'Análises realizadas'}</RotuloResumo>
                        <DetalheSecundario>Última em {dataUltima}</DetalheSecundario>
                    </TextosResumo>
                </ItemResumo>
                <ItemResumo>
                    <ValorResumo>{cidadesAvaliadas}</ValorResumo>
                    <TextosResumo>
                        <RotuloResumo>{cidadesAvaliadas === 1 ? 'Cidade avaliada' : 'Cidades avaliadas'}</RotuloResumo>
                        <DetalheSecundario>Diferentes cidades nos seus rankings</DetalheSecundario>
                    </TextosResumo>
                </ItemResumo>
                <ItemResumo>
                    <ValorResumo $cor="#059669">{melhorMatch.match}%</ValorResumo>
                    <TextosResumo>
                        <RotuloResumo>Melhor match obtido</RotuloResumo>
                        <DetalheSecundario>{melhorMatch.cidade}</DetalheSecundario>
                    </TextosResumo>
                </ItemResumo>
            </Resumo>

            <Historico>
                <Cartao>
                    <CabecalhoCartao $base>
                        <TextosCabecalho>
                            <TituloCartao>Cidades que mais aparecem para você</TituloCartao>
                            <DescricaoCartao>Frequência nos seus rankings e match médio</DescricaoCartao>
                        </TextosCabecalho>
                        <RotulosColunas aria-hidden="true">
                            <span>Frequência</span>
                            <span>Match médio</span>
                        </RotulosColunas>
                    </CabecalhoCartao>
                    <Lista>
                        {ranking.map(({ cidade, ibge, aparicoes, vitorias, matchMedio }, indice) => {
                            const cheios = tracosPreenchidos(aparicoes, totalAnalises);
                            return (
                                <LinhaCidade key={cidade}>
                                    <Posicao>{indice + 1}</Posicao>
                                    <Miniatura $tamanho={44} $foto={fotos[ibge]?.miniatura} title={creditoDe(fotos[ibge])} />
                                    <TextosCidade>
                                        <NomeCidade>{cidade}</NomeCidade>
                                        <DetalheSecundario>
                                            {vitorias > 0
                                                ? `1º lugar em ${vitorias} ${analisesNoPlural(vitorias)}`
                                                : 'Ainda não ficou em 1º lugar'}
                                        </DetalheSecundario>
                                    </TextosCidade>
                                    <Frequencia>
                                        <RotuloFrequencia>em {aparicoes} de {totalAnalises} {analisesNoPlural(totalAnalises)}</RotuloFrequencia>
                                        <Medidor aria-hidden="true">
                                            {Array.from({ length: TOTAL_TRACOS }, (_, traco) => (
                                                <Traco key={traco} $cheio={traco < cheios} />
                                            ))}
                                        </Medidor>
                                    </Frequencia>
                                    <MatchMedio title="Match médio">{matchMedio}%</MatchMedio>
                                </LinhaCidade>
                            );
                        })}
                    </Lista>
                </Cartao>

                <Cartao>
                    <CabecalhoCartao>
                        <TextosCabecalho>
                            <TituloCartao>Análises recentes</TituloCartao>
                            <DescricaoCartao>Cidade em 1º lugar em cada análise</DescricaoCartao>
                        </TextosCabecalho>
                        {recentes.length > RECENTES_VISIVEIS && (
                            <LinkTexto type="button" aria-expanded={verTodas} onClick={() => setVerTodas(!verTodas)}>
                                {verTodas ? 'Ver menos' : 'Ver todas'}
                            </LinkTexto>
                        )}
                    </CabecalhoCartao>
                    <Lista>
                        {recentesVisiveis.map(({ id, data, cidade, match }) => (
                            <LinhaRecente key={id}>
                                <BotaoRecente type="button" onClick={() => onAbrirAnalise(id)} title="Ver resultados desta análise">
                                    <TextosCidade>
                                        <NomeCidade>{cidade}</NomeCidade>
                                        <DetalheSecundario>{formatarData(data)}</DetalheSecundario>
                                    </TextosCidade>
                                    <Selo>{match}% match</Selo>
                                    <FiChevronRight aria-hidden="true" />
                                </BotaoRecente>
                            </LinhaRecente>
                        ))}
                    </Lista>
                </Cartao>
            </Historico>
        </>
    );
}

function Dashboard({ usuario, onNavegar, onIniciarAnalise, onAbrirAnalise, onVerCidade, analises = [], analisesCarregadas = true }){
    const [fotos, setFotos] = useState({});
    const primeiroNome = usuario.user_metadata?.full_name?.split(' ')[0];
    const indicadores = calcularIndicadores(analises);
    const temHistorico = indicadores.totalAnalises > 0;

    useEffect(() => {
        let ativo = true;
        carregarFotos().then((carregadas) => {
            if (ativo) setFotos(carregadas);
        });
        return () => {
            ativo = false;
        };
    }, []);

    return(
        <Pagina>
            <CabecalhoApp
                usuario={usuario}
                paginaAtiva="dashboard"
                onNavegar={onNavegar}
                onNovaAnalise={onIniciarAnalise}
                comparacaoIndisponivel={!temHistorico}
                semNovaAnalise={!temHistorico}
            />

            {/* Enquanto o histórico chega, nada aparece: quem já tem análises não deve ver o convite à primeira. */}
            {analisesCarregadas && (
                <Conteudo $primeira={!temHistorico}>
                    {temHistorico ? (
                        <ComHistorico
                            primeiroNome={primeiroNome}
                            indicadores={indicadores}
                            fotos={fotos}
                            onIniciarAnalise={onIniciarAnalise}
                            onAbrirAnalise={onAbrirAnalise}
                            onVerCidade={onVerCidade}
                        />
                    ) : (
                        <PrimeiraAnalise primeiroNome={primeiroNome} fotos={fotos} onIniciarAnalise={onIniciarAnalise} />
                    )}
                </Conteudo>
            )}
        </Pagina>
    )
}

export default Dashboard
