import { useState } from 'react';
import styled from "styled-components"
import { FiAlertCircle, FiCheck } from 'react-icons/fi';
import CabecalhoApp from '../CabecalhoApp/index.jsx';
import { PILARES } from '../../analise/opcoes.js';
import { comoFoiEstimado, fonteDoPilar, fraseDoPilar, lemaDaCidade, porQueCombina, qualificarNota } from '../../analise/explicacao.js';

const OUTRAS_CIDADES = 4;

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F8FAFC;
    font-family: var(--fonte-moradia);
`;

const Conteudo = styled.main`
    display: flex;
    flex-direction: column;
    gap: 40px;
    max-width: 1440px;
    margin: 0 auto;
    padding: 48px 80px 80px;
    box-sizing: border-box;

    @media (max-width: 900px) {
        padding: 32px 16px 64px;
    }
`;

const Cabecalho = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Titulo = styled.h1`
    margin: 0;
    font-size: 36px;
    font-weight: 800;
    line-height: 1.15;
    color: #111827;

    @media (max-width: 600px) {
        font-size: 28px;
    }
`;

const Subtitulo = styled.p`
    font-size: 16px;
    line-height: 1.6;
    color: #6B7280;
`;

const AvisoSalvamento = styled.p`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 13px;
    font-weight: 600;
    color: ${({ $erro }) => ($erro ? '#DC2626' : '#6B7280')};

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

const Principal = styled.section`
    display: grid;
    grid-template-columns: 360px minmax(0, 1fr);
    gap: 32px;
    align-items: start;

    @media (max-width: 1100px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

const CartaoDestaque = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 32px;
    border: 1px solid #E5E7EB;
    border-radius: 24px;
    background-color: #FFFFFF;
    text-align: center;
`;

const Sobretitulo = styled.p`
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--roxo-moradia);
`;

const Anel = styled.div`
    position: relative;
    width: 140px;
    height: 140px;

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
    }

    strong {
        font-size: 32px;
        font-weight: 800;
        color: #111827;
    }

    span {
        font-size: 11px;
        color: #6B7280;
    }
`;

const NomeDestaque = styled.h2`
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    color: #111827;
`;

const Lema = styled.p`
    margin-top: -12px;
    font-size: 14px;
    color: #6B7280;
`;

const BotaoExplorar = styled.button`
    width: 100%;
    padding: 14px 24px;
    border: none;
    border-radius: 12px;
    background-color: var(--roxo-moradia);
    color: #FFFFFF;
    font-family: var(--fonte-moradia);
    font-size: 15px;
    font-weight: 700;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const Analise = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
`;

const Subtitulo2 = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
`;

const GradeIndicadores = styled.ul`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;

    @media (max-width: 900px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 500px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

const Indicador = styled.li`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    background-color: #FFFFFF;
    opacity: ${({ $semPeso }) => ($semPeso ? 0.6 : 1)};
`;

const RotuloIndicador = styled.p`
    font-size: 12px;
    font-weight: 600;
    color: #6B7280;
`;

const ValorIndicador = styled.p`
    font-size: 18px;
    font-weight: 700;
    color: #111827;
`;

const TopoIndicador = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

const SeloEstimado = styled.span`
    flex-shrink: 0;
    padding: 2px 6px;
    border-radius: 6px;
    background-color: #FFFBEB;
    color: #B45309;
    font-size: 11px;
    font-weight: 700;
    cursor: help;
`;

const FonteIndicador = styled.p`
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.4;
    color: #9CA3AF;
`;

const DetalheIndicador = styled.p`
    font-size: 12px;
    line-height: 1.4;
    color: #6B7280;
`;

const PorQue = styled.div`
    display: flex;
    gap: 24px;
    padding: 24px;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    background-color: #FFFFFF;

    @media (max-width: 900px) {
        flex-direction: column;
    }
`;

const TextoPorQue = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-width: 0;

    h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: #111827;
    }

    p {
        font-size: 14px;
        line-height: 1.6;
        color: #6B7280;
    }
`;

const CORES_PONTOS = {
    fortes: { fundo: '#ECFDF5', titulo: '#10B981', icone: '#10B981' },
    atencao: { fundo: '#FFFBEB', titulo: '#B45309', icone: '#D97706' },
};

const CaixaPontos = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
    min-width: 180px;
    padding: 16px;
    border-radius: 12px;
    background-color: ${({ $tipo }) => CORES_PONTOS[$tipo].fundo};

    h4 {
        margin: 0;
        font-size: 13px;
        font-weight: 700;
        color: ${({ $tipo }) => CORES_PONTOS[$tipo].titulo};
    }

    ul {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #111827;
    }

    svg {
        flex-shrink: 0;
        color: ${({ $tipo }) => CORES_PONTOS[$tipo].icone};
    }
`;

const GradeOutras = styled.ul`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
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
    gap: 8px;
    width: 100%;
    height: 100%;
    padding: 20px;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    background-color: #FFFFFF;
    font-family: var(--fonte-moradia);
    text-align: left;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover,
    &:focus-visible {
        outline: none;
        border-color: var(--roxo-moradia);
    }
`;

const LinhaOutra = styled.span`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
`;

const Selo = styled.span`
    flex-shrink: 0;
    padding: 4px 8px;
    border-radius: 6px;
    background-color: ${({ $alto }) => ($alto ? '#ECFDF5' : '#EEF2FF')};
    color: ${({ $alto }) => ($alto ? '#10B981' : 'var(--roxo-moradia)')};
    font-size: 12px;
    font-weight: 700;
`;

const LemaOutra = styled.span`
    font-size: 13px;
    color: #6B7280;
`;

const RAIO = 60;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

function AnelMatch({ match }) {
    return (
        <Anel role="img" aria-label={`${match}% de match`}>
            <svg viewBox="0 0 140 140" aria-hidden="true">
                <circle cx="70" cy="70" r={RAIO} fill="none" stroke="#EEF2FF" strokeWidth="14" />
                <circle
                    cx="70" cy="70" r={RAIO} fill="none" stroke="#4F46E5" strokeWidth="14" strokeLinecap="round"
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

const nomeDaCidade = (cidade) => cidade.slice(0, cidade.lastIndexOf(', '));
const rotuloDoPilar = (id) => PILARES.find((pilar) => pilar.id === id).rotulo;

function Resultados({ usuario, onNavegar, onNovaAnalise, respostas, resultados, fontes, salvamento, onTentarSalvar }) {
    const [selecionada, setSelecionada] = useState(0);
    const destaque = resultados[selecionada];
    const nome = nomeDaCidade(destaque.cidade);
    const outras = resultados
        .map((resultado, indice) => ({ resultado, indice }))
        .filter(({ indice }) => indice !== selecionada)
        .slice(0, OUTRAS_CIDADES);

    function selecionar(indice) {
        setSelecionada(indice);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <Pagina>
            <CabecalhoApp usuario={usuario} paginaAtiva="resultados" onNavegar={onNavegar} onNovaAnalise={onNovaAnalise} />

            <Conteudo>
                <Cabecalho>
                    <Titulo>As cidades que mais combinam com você</Titulo>
                    <Subtitulo>
                        Encontramos {resultados.length} {resultados.length === 1 ? 'cidade compatível' : 'cidades compatíveis'} com
                        o seu perfil e as suas prioridades.
                    </Subtitulo>
                    {salvamento === 'salvando' && <AvisoSalvamento role="status">Salvando sua análise…</AvisoSalvamento>}
                    {salvamento === 'erro' && (
                        <AvisoSalvamento $erro role="alert">
                            Não foi possível salvar esta análise no seu histórico.
                            <button type="button" onClick={onTentarSalvar}>Tentar de novo</button>
                        </AvisoSalvamento>
                    )}
                </Cabecalho>

                <Principal aria-label={`Análise de ${destaque.cidade}`}>
                    <CartaoDestaque>
                        <Sobretitulo>{selecionada === 0 ? 'Sua melhor opção' : `${selecionada + 1}º lugar`}</Sobretitulo>
                        <AnelMatch match={destaque.match} />
                        <NomeDestaque>{destaque.cidade}</NomeDestaque>
                        <Lema>{lemaDaCidade(destaque)}</Lema>
                        <BotaoExplorar type="button" disabled title="Em breve">Explorar {nome}</BotaoExplorar>
                    </CartaoDestaque>

                    <Analise>
                        <Subtitulo2>Análise de indicadores</Subtitulo2>
                        <GradeIndicadores>
                            {PILARES.map(({ id, rotulo }) => {
                                const avaliacao = destaque.notas[id];
                                const semPeso = avaliacao.peso === 'tantoFaz';
                                return (
                                    <Indicador key={id} $semPeso={semPeso}>
                                        <TopoIndicador>
                                            <RotuloIndicador>{rotulo}</RotuloIndicador>
                                            {avaliacao.estimado && (
                                                <SeloEstimado title={comoFoiEstimado(id, fontes)} aria-label={`Estimado: ${comoFoiEstimado(id, fontes)}`}>
                                                    Estimado
                                                </SeloEstimado>
                                            )}
                                        </TopoIndicador>
                                        <ValorIndicador>
                                            {avaliacao.dadoIndisponivel ? 'Sem dado' : `${qualificarNota(avaliacao.nota)} (${avaliacao.nota}%)`}
                                        </ValorIndicador>
                                        <DetalheIndicador>
                                            {fraseDoPilar(id, avaliacao, respostas)}
                                            {semPeso && ' · Não pesou no seu match'}
                                        </DetalheIndicador>
                                        {fonteDoPilar(id, fontes) && <FonteIndicador>{fonteDoPilar(id, fontes)}</FonteIndicador>}
                                    </Indicador>
                                );
                            })}
                        </GradeIndicadores>

                        <PorQue>
                            <TextoPorQue>
                                <h3>Por que {nome} combina com você?</h3>
                                <p>{porQueCombina(destaque)}</p>
                            </TextoPorQue>
                            {destaque.pontosFortes.length > 0 && (
                                <CaixaPontos $tipo="fortes">
                                    <h4>Pontos fortes</h4>
                                    <ul>
                                        {destaque.pontosFortes.map((id) => (
                                            <li key={id}><FiCheck aria-hidden="true" /> {rotuloDoPilar(id)}</li>
                                        ))}
                                    </ul>
                                </CaixaPontos>
                            )}
                            {destaque.pontosAtencao.length > 0 && (
                                <CaixaPontos $tipo="atencao">
                                    <h4>Pontos de atenção</h4>
                                    <ul>
                                        {destaque.pontosAtencao.map((id) => (
                                            <li key={id}><FiAlertCircle aria-hidden="true" /> {rotuloDoPilar(id)}</li>
                                        ))}
                                    </ul>
                                </CaixaPontos>
                            )}
                        </PorQue>
                    </Analise>
                </Principal>

                {outras.length > 0 && (
                    <section aria-labelledby="titulo-outras">
                        <Subtitulo2 id="titulo-outras" style={{ marginBottom: 20 }}>Outras cidades que você pode se interessar</Subtitulo2>
                        <GradeOutras>
                            {outras.map(({ resultado, indice }) => (
                                <li key={resultado.cidade}>
                                    <CartaoOutra type="button" onClick={() => selecionar(indice)} aria-label={`Ver análise de ${resultado.cidade}, ${resultado.match}% de match`}>
                                        <LinhaOutra>
                                            {resultado.cidade}
                                            <Selo $alto={resultado.match >= 90}>{resultado.match}% Match</Selo>
                                        </LinhaOutra>
                                        <LemaOutra>{lemaDaCidade(resultado)}</LemaOutra>
                                    </CartaoOutra>
                                </li>
                            ))}
                        </GradeOutras>
                    </section>
                )}
            </Conteudo>
        </Pagina>
    );
}

export default Resultados
