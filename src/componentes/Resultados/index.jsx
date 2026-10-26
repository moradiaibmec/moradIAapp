import styled from "styled-components"
import {
    LuArrowRight, LuArrowUpRight, LuCheck, LuCircleAlert, LuCircleCheck, LuDownload, LuGitCompare, LuShare2,
    LuThumbsUp, LuTrendingUp, LuTriangleAlert, LuTrophy,
} from 'react-icons/lu';
import CabecalhoApp from '../CabecalhoApp/index.jsx';
import IconePilar from '../IconePilar/index.jsx';
import CreditoFoto from '../CreditoFoto/index.jsx';
import { PILARES, REGIOES } from '../../analise/opcoes.js';
import {
    comoFoiEstimado, fonteDoPilar, fraseDoPilar, lemaDaCidade, mediaDasNotas, melhorQue, nomeDaCidade, porQueCombina, qualificarMatch,
    qualificarNota,
} from '../../analise/explicacao.js';
import { nomeDoEstado, textoDoCredito } from '../../analise/formatacao.js';

const OUTRAS_CIDADES = 4;
const MATCH_ALTO = 75;
const NOTA_EXCELENTE = 85;

// Cidades sem foto (ou enquanto ela carrega) mostram um gradiente da marca no lugar da imagem.
const FUNDO_HERO = 'linear-gradient(135deg, #4338CA 0%, #312E81 45%, #0B1220 100%)';
const FUNDOS_CIDADE = [
    'linear-gradient(135deg, #6366F1 0%, #312E81 100%)',
    'linear-gradient(135deg, #818CF8 0%, #3730A3 100%)',
    'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
    'linear-gradient(135deg, #A5B4FC 0%, #4338CA 100%)',
];

const fundoComFoto = (url, reserva) => (url ? `url("${url}") center / cover no-repeat, ${reserva}` : reserva);

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F6F7F9;
    font-family: var(--fonte-moradia);
`;

const Conteudo = styled.main`
    display: flex;
    flex-direction: column;
    gap: 40px;
    max-width: 1440px;
    margin: 0 auto;
    padding: 40px 80px 80px;
    box-sizing: border-box;

    @media (max-width: 900px) {
        padding: 32px 16px 64px;
    }
`;

const Cabecalho = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
`;

const TextoCabecalho = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Status = styled.p`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #5B6475;

    svg {
        flex-shrink: 0;
        font-size: 16px;
        color: #059669;
    }
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

const AvisoSalvamento = styled.p`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 13px;
    font-weight: 600;
    color: ${({ $erro }) => ($erro ? '#DC2626' : '#5B6475')};

    button {
        padding: 0;
        border: none;
        background: none;
        color: var(--roxo-moradia);
        font-family: var(--fonte-moradia);
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
    }
`;

const AcoesCabecalho = styled.div`
    display: flex;
    gap: 12px;
`;

const BotaoContorno = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: 1px solid #E6E8EC;
    border-radius: 10px;
    background-color: #FFFFFF;
    color: #0F172A;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;

    svg {
        font-size: 16px;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const Hero = styled.section`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 32px;
    min-height: 540px;
    padding: 40px;
    border-radius: 24px;
    background:
        linear-gradient(90deg, rgba(11, 18, 32, 0.6) 0%, rgba(11, 18, 32, 0) 60%),
        linear-gradient(180deg, rgba(11, 18, 32, 0.2) 0%, rgba(11, 18, 32, 0) 30%, rgba(11, 18, 32, 0.9) 100%),
        ${({ $foto }) => fundoComFoto($foto, FUNDO_HERO)};
    box-sizing: border-box;

    @media (max-width: 900px) {
        min-height: 0;
        padding: 24px;
    }
`;

const TopoHero = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
`;

const SeloMelhor = styled.span`
    display: flex;
    align-items: center;
    align-self: flex-start;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 999px;
    background-color: #FFFFFF;
    color: var(--roxo-moradia);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;

    svg {
        font-size: 14px;
    }
`;

const BaseHero = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;

    @media (max-width: 900px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const InfoCidade = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 640px;
`;

const Estado = styled.p`
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #C7D2FE;
`;

const NomeCidade = styled.h2`
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 96px;
    font-weight: 800;
    line-height: 0.95;
    letter-spacing: -3px;
    color: #FFFFFF;
    overflow-wrap: anywhere;

    @media (max-width: 900px) {
        font-size: 56px;
        letter-spacing: -1.5px;
    }
`;

const Lema = styled.p`
    font-size: 18px;
    line-height: 1.5;
    color: #E2E8F0;
`;

const AcoesHero = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 8px;
`;

const BotaoHero = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 22px;
    border: 1px solid ${({ $vidro }) => ($vidro ? 'rgba(255, 255, 255, 0.3)' : 'transparent')};
    border-radius: 12px;
    background-color: ${({ $vidro }) => ($vidro ? 'rgba(255, 255, 255, 0.12)' : 'var(--roxo-moradia)')};
    backdrop-filter: ${({ $vidro }) => ($vidro ? 'blur(12px)' : 'none')};
    color: #FFFFFF;
    font-family: var(--fonte-moradia);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    svg {
        font-size: 18px;
    }

    &:hover:not(:disabled) {
        background-color: #4338CA;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const PainelScore = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    gap: 20px;
    width: 300px;
    padding: 28px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    background-color: rgba(15, 23, 42, 0.35);
    backdrop-filter: blur(20px);
    box-sizing: border-box;
    text-align: center;

    @media (max-width: 900px) {
        width: 100%;
    }
`;

const Anel = styled.div`
    position: relative;
    width: 168px;
    height: 168px;

    svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
    }

    div {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
    }

    strong {
        font-family: var(--fonte-titulo);
        font-size: 48px;
        font-weight: 800;
        letter-spacing: -1.5px;
        color: #FFFFFF;
    }

    span {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        color: #CBD5E1;
    }
`;

const TextoScore = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;

    h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: #FFFFFF;
    }

    p {
        font-size: 13px;
        line-height: 1.45;
        color: #CBD5E1;
    }
`;

const Detalhes = styled.div`
    display: flex;
    gap: 24px;

    @media (max-width: 1100px) {
        flex-direction: column;
    }
`;

const Cartao = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${({ $gap }) => $gap}px;
    padding: 32px;
    border: 1px solid #E6E8EC;
    border-radius: 20px;
    background-color: #FFFFFF;
    box-sizing: border-box;

    @media (max-width: 600px) {
        padding: 20px;
    }
`;

const CartaoIndicadores = styled(Cartao)`
    flex: 1;
    min-width: 0;
`;

const CartaoPorQue = styled(Cartao)`
    align-self: flex-start;
    flex-shrink: 0;
    width: 460px;

    @media (max-width: 1100px) {
        align-self: stretch;
        width: auto;
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
        color: #5B6475;
    }
`;

const TituloCartao = styled.h2`
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: #0F172A;
`;

const Media = styled.span`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 999px;
    background-color: #EEF0FF;
    color: var(--roxo-moradia);
    font-size: 13px;
    font-weight: 600;

    svg {
        font-size: 14px;
    }
`;

const ListaIndicadores = styled.ul`
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
    gap: 20px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const Indicador = styled.li`
    display: flex;
    align-items: center;
    gap: 16px;
    opacity: ${({ $semPeso }) => ($semPeso ? 0.6 : 1)};
`;

const CaixaIcone = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background-color: #EEF0FF;
    color: var(--roxo-moradia);
    font-size: 20px;
`;

const RotuloIndicador = styled.div`
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 2px;
    width: 190px;

    strong {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 600;
        color: #0F172A;
    }

    span {
        font-size: 13px;
        color: #5B6475;
    }

    @media (max-width: 600px) {
        width: 130px;
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
    flex: 1;
    height: ${({ $altura }) => $altura}px;
    border-radius: ${({ $altura }) => $altura / 2}px;
    background-color: #EDEFF3;
    overflow: hidden;
`;

const Preenchimento = styled.div`
    width: ${({ $valor }) => $valor}%;
    height: 100%;
    border-radius: inherit;
    background-color: ${({ $forte }) => ($forte ? 'var(--roxo-moradia)' : '#A5B4FC')};
`;

const ValorIndicador = styled.span`
    flex-shrink: 0;
    width: 44px;
    font-family: var(--fonte-titulo);
    font-size: 16px;
    font-weight: 700;
    text-align: right;
    color: #0F172A;
`;

const TextoPorQue = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;

    p {
        font-size: 15px;
        line-height: 1.6;
        color: #5B6475;
    }
`;

const CORES_PONTOS = {
    fortes: { fundo: '#ECFDF5', cor: '#059669' },
    atencao: { fundo: '#FFF7E6', cor: '#D97706' },
};

const CaixaPontos = styled.div`
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 20px;
    border-radius: 14px;
    background-color: ${({ $tipo }) => CORES_PONTOS[$tipo].fundo};

    h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        color: ${({ $tipo }) => CORES_PONTOS[$tipo].cor};
    }

    ul {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    li {
        display: flex;
        gap: 10px;
    }

    svg {
        flex-shrink: 0;
        font-size: 16px;
        color: ${({ $tipo }) => CORES_PONTOS[$tipo].cor};
    }

    strong {
        font-size: 14px;
        font-weight: 600;
        color: #0F172A;
    }

    li span {
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: 13px;
        color: #5B6475;
    }
`;

const Outras = styled.section`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const CabecalhoOutras = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
`;

const LinkSeta = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    border: none;
    background: none;
    color: var(--roxo-moradia);
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;

    svg {
        font-size: 16px;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const GradeOutras = styled.ul`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
    margin: 0;
    padding: 0;
    list-style: none;

    @media (max-width: 1100px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 500px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

const CartaoOutra = styled.button`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 1px solid #E6E8EC;
    border-radius: 16px;
    background-color: #FFFFFF;
    font-family: var(--fonte-moradia);
    text-align: left;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover,
    &:focus-visible {
        outline: none;
        border-color: var(--roxo-moradia);
    }
`;

const FotoOutra = styled.span`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    height: 160px;
    padding: 12px;
    background: ${({ $fundo }) => $fundo};
    box-sizing: border-box;
`;

const Pilula = styled.span`
    padding: 4px 10px;
    border-radius: 999px;
    background-color: ${({ $escura }) => ($escura ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF')};
    backdrop-filter: ${({ $escura }) => ($escura ? 'blur(8px)' : 'none')};
    color: ${({ $escura }) => ($escura ? '#FFFFFF' : 'var(--roxo-moradia)')};
    font-size: 12px;
    font-weight: 700;
`;

const CorpoOutra = styled.span`
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 20px;
`;

const NomeOutra = styled.span`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-family: var(--fonte-titulo);
    font-size: 17px;
    font-weight: 700;
    color: #0F172A;

    svg {
        flex-shrink: 0;
        font-size: 18px;
        color: #5B6475;
    }
`;

const LemaOutra = styled.span`
    font-size: 14px;
    color: #5B6475;
`;

const RAIO = 78;
const ESPESSURA = 12;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

function AnelMatch({ match }) {
    return (
        <Anel role="img" aria-label={`${match}% de match`}>
            <svg viewBox="0 0 168 168" aria-hidden="true">
                <circle cx="84" cy="84" r={RAIO} fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth={ESPESSURA} />
                <circle
                    cx="84" cy="84" r={RAIO} fill="none" stroke="#A5B4FC" strokeWidth={ESPESSURA}
                    strokeDasharray={CIRCUNFERENCIA} strokeDashoffset={CIRCUNFERENCIA * (1 - match / 100)}
                />
            </svg>
            <div aria-hidden="true">
                <strong>{match}%</strong>
                <span>Match Score</span>
            </div>
        </Anel>
    );
}

const rotuloDoPilar = (id) => PILARES.find((pilar) => pilar.id === id).rotulo;
const nomeDaRegiao = (id) => REGIOES.find((regiao) => regiao.id === id)?.rotulo;

function textoStatus(resultados) {
    const altos = resultados.filter(({ match }) => match >= MATCH_ALTO).length;
    if (altos === 0) return `Análise concluída · ${resultados.length} ${resultados.length === 1 ? 'cidade analisada' : 'cidades analisadas'}`;
    return `Análise concluída · ${altos} ${altos === 1 ? 'cidade' : 'cidades'} com alta compatibilidade`;
}

function Resultados({
    usuario, onNavegar, onNovaAnalise, respostas, resultados, cidades, fontes, salvamento, onTentarSalvar,
    selecionada, onSelecionar, onExplorar,
}) {
    const destaque = resultados[selecionada];
    const nome = nomeDaCidade(destaque.cidade);
    const fotoDe = (ibge) => cidades.find((cidade) => cidade.ibge === ibge)?.foto ?? null;
    const cidade = cidades.find(({ ibge }) => ibge === destaque.ibge);
    const regiao = nomeDaRegiao(cidade?.regiao);
    const media = mediaDasNotas(destaque.notas);
    const percentil = melhorQue(resultados, selecionada);
    const outras = resultados
        .map((resultado, indice) => ({ resultado, indice }))
        .filter(({ indice }) => indice !== selecionada)
        .slice(0, OUTRAS_CIDADES);

    function selecionar(indice) {
        onSelecionar(indice);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <Pagina>
            <CabecalhoApp usuario={usuario} paginaAtiva="resultados" onNavegar={onNavegar} onNovaAnalise={onNovaAnalise} />

            <Conteudo>
                <Cabecalho>
                    <TextoCabecalho>
                        <Status><LuCircleCheck aria-hidden="true" /> {textoStatus(resultados)}</Status>
                        <Titulo>A cidade que mais combina com você</Titulo>
                        {salvamento === 'salvando' && <AvisoSalvamento role="status">Salvando sua análise…</AvisoSalvamento>}
                        {salvamento === 'erro' && (
                            <AvisoSalvamento $erro role="alert">
                                Não foi possível salvar esta análise no seu histórico.
                                <button type="button" onClick={onTentarSalvar}>Tentar de novo</button>
                            </AvisoSalvamento>
                        )}
                    </TextoCabecalho>
                    <AcoesCabecalho>
                        <BotaoContorno type="button" disabled title="Em breve"><LuShare2 aria-hidden="true" /> Compartilhar</BotaoContorno>
                        <BotaoContorno type="button" disabled title="Em breve"><LuDownload aria-hidden="true" /> Baixar relatório</BotaoContorno>
                    </AcoesCabecalho>
                </Cabecalho>

                <Hero aria-label={`Análise de ${destaque.cidade}`} $foto={cidade?.foto?.url}>
                    <TopoHero>
                        <SeloMelhor>
                            <LuTrophy aria-hidden="true" />
                            {selecionada === 0 ? 'Sua melhor opção' : `${selecionada + 1}º lugar no ranking`}
                        </SeloMelhor>
                        {cidade?.foto && <CreditoFoto foto={cidade.foto} />}
                    </TopoHero>

                    <BaseHero>
                        <InfoCidade>
                            {cidade && <Estado>{nomeDoEstado(cidade.uf)}{regiao && ` · Região ${regiao}`}</Estado>}
                            <NomeCidade>{nome}</NomeCidade>
                            <Lema>{lemaDaCidade(destaque)}.</Lema>
                            <AcoesHero>
                                <BotaoHero type="button" onClick={onExplorar} disabled={!cidade}>
                                    Explorar {nome} <LuArrowRight aria-hidden="true" />
                                </BotaoHero>
                                <BotaoHero type="button" $vidro disabled title="Em breve">
                                    <LuGitCompare aria-hidden="true" /> Comparar cidades
                                </BotaoHero>
                            </AcoesHero>
                        </InfoCidade>

                        <PainelScore>
                            <AnelMatch match={destaque.match} />
                            <TextoScore>
                                <h3>{qualificarMatch(destaque.match)}</h3>
                                {percentil !== null && <p>Melhor que {percentil}% das cidades analisadas para o seu perfil</p>}
                            </TextoScore>
                        </PainelScore>
                    </BaseHero>
                </Hero>

                <Detalhes>
                    <CartaoIndicadores $gap={28} aria-labelledby="titulo-indicadores">
                        <TopoCartao>
                            <TextoTopo>
                                <TituloCartao id="titulo-indicadores">Análise de indicadores</TituloCartao>
                                <p>Como {nome} se sai nas prioridades que você definiu</p>
                            </TextoTopo>
                            {media !== null && <Media><LuTrendingUp aria-hidden="true" /> Média geral {media}%</Media>}
                        </TopoCartao>

                        <ListaIndicadores>
                            {PILARES.map(({ id, rotulo }) => {
                                const avaliacao = destaque.notas[id];
                                const semPeso = avaliacao.peso === 'tantoFaz';
                                const detalhe = [fraseDoPilar(id, avaliacao, respostas), fonteDoPilar(id, fontes)].filter(Boolean).join('\n');
                                return (
                                    <Indicador key={id} $semPeso={semPeso} title={detalhe || undefined}>
                                        <CaixaIcone><IconePilar pilar={id} /></CaixaIcone>
                                        <RotuloIndicador>
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
                                        </RotuloIndicador>
                                        <Trilho $altura={8} aria-hidden="true">
                                            {!avaliacao.dadoIndisponivel && (
                                                <Preenchimento $valor={avaliacao.nota} $forte={avaliacao.nota >= NOTA_EXCELENTE} />
                                            )}
                                        </Trilho>
                                        <ValorIndicador>{avaliacao.dadoIndisponivel ? '—' : `${avaliacao.nota}%`}</ValorIndicador>
                                    </Indicador>
                                );
                            })}
                        </ListaIndicadores>
                    </CartaoIndicadores>

                    <CartaoPorQue $gap={24} aria-labelledby="titulo-por-que">
                        <TextoPorQue>
                            <TituloCartao id="titulo-por-que">Por que {nome} combina com você?</TituloCartao>
                            <p>{porQueCombina(destaque)}</p>
                        </TextoPorQue>
                        {destaque.pontosFortes.length > 0 && (
                            <CaixaPontos $tipo="fortes">
                                <h3><LuThumbsUp aria-hidden="true" /> Pontos fortes</h3>
                                <ul>
                                    {destaque.pontosFortes.map((id) => (
                                        <li key={id}><LuCheck aria-hidden="true" /> <strong>{rotuloDoPilar(id)}</strong></li>
                                    ))}
                                </ul>
                            </CaixaPontos>
                        )}
                        {destaque.pontosAtencao.length > 0 && (
                            <CaixaPontos $tipo="atencao">
                                <h3><LuTriangleAlert aria-hidden="true" /> Pontos de atenção</h3>
                                <ul>
                                    {destaque.pontosAtencao.map((id) => (
                                        <li key={id}>
                                            <LuCircleAlert aria-hidden="true" />
                                            <span>
                                                <strong>{rotuloDoPilar(id)}</strong>
                                                {fraseDoPilar(id, destaque.notas[id], respostas)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CaixaPontos>
                        )}
                    </CartaoPorQue>
                </Detalhes>

                {outras.length > 0 && (
                    <Outras aria-labelledby="titulo-outras">
                        <CabecalhoOutras>
                            <TextoTopo>
                                <TituloCartao id="titulo-outras">Outras cidades que combinam com você</TituloCartao>
                                <p>Alternativas com alta compatibilidade para o seu perfil</p>
                            </TextoTopo>
                            <LinkSeta type="button" disabled title="Em breve">Ver ranking completo <LuArrowRight aria-hidden="true" /></LinkSeta>
                        </CabecalhoOutras>
                        <GradeOutras>
                            {outras.map(({ resultado, indice }, posicao) => {
                                const foto = fotoDe(resultado.ibge);
                                return (
                                    <li key={resultado.cidade}>
                                        <CartaoOutra type="button" onClick={() => selecionar(indice)} aria-label={`Ver análise de ${resultado.cidade}, ${resultado.match}% de match`}>
                                            <FotoOutra
                                                $fundo={fundoComFoto(foto?.miniatura, FUNDOS_CIDADE[posicao % FUNDOS_CIDADE.length])}
                                                title={foto ? `${textoDoCredito(foto)} (Wikimedia Commons)` : undefined}
                                            >
                                                <Pilula $escura>#{indice + 1}</Pilula>
                                                <Pilula>{resultado.match}% match</Pilula>
                                            </FotoOutra>
                                            <CorpoOutra>
                                                <NomeOutra>{resultado.cidade} <LuArrowUpRight aria-hidden="true" /></NomeOutra>
                                                <LemaOutra>{lemaDaCidade(resultado)}</LemaOutra>
                                            </CorpoOutra>
                                        </CartaoOutra>
                                    </li>
                                );
                            })}
                        </GradeOutras>
                    </Outras>
                )}
            </Conteudo>
        </Pagina>
    );
}

export default Resultados
