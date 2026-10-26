import styled from "styled-components"
import { FiArrowRight, FiAward, FiBarChart2, FiChevronRight, FiClock, FiMap, FiTrendingUp } from 'react-icons/fi';
import CabecalhoApp from '../CabecalhoApp/index.jsx';
import { calcularIndicadores } from '../../dados/indicadores.js';

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F8FAFC;
    font-family: var(--fonte-moradia);
`;

const Conteudo = styled.main`
    display: flex;
    flex-direction: column;
    gap: 32px;
    max-width: 1440px;
    margin: 0 auto;
    padding: 48px 80px 96px;

    @media (max-width: 900px) {
        padding: 32px 16px 64px;
    }
`;

const Saudacao = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Titulo = styled.h1`
    margin: 0;
    font-size: 36px;
    font-weight: 800;
    line-height: 1.1;
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

const BannerAnalise = styled.section`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding: 40px 48px;
    border-radius: 24px;
    background-color: var(--roxo-moradia);
    color: #FFFFFF;

    @media (max-width: 900px) {
        flex-direction: column;
        align-items: flex-start;
        padding: 32px 24px;
    }
`;

const TextosBanner = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 640px;
`;

const EtiquetaBanner = styled.p`
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    color: #C7D2FE;
`;

const TituloBanner = styled.h2`
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    line-height: 1.2;
`;

const TextoBanner = styled.p`
    font-size: 16px;
    line-height: 1.6;
    color: #E0E7FF;
`;

const BotaoIniciar = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    padding: 16px 32px;
    border: none;
    border-radius: 12px;
    background-color: #FFFFFF;
    color: var(--roxo-moradia);
    font-family: var(--fonte-moradia);
    font-size: 16px;
    font-weight: 700;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-1px);
    }
`;

const GradeIndicadores = styled.section`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;

    @media (max-width: 1100px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const Cartao = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    background-color: #FFFFFF;
    min-width: 0;
`;

const CaixaIcone = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-size: 20px;
`;

const TextosIndicador = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const RotuloIndicador = styled.p`
    font-size: 12px;
    font-weight: 600;
    color: #6B7280;
`;

const ValorIndicador = styled.p`
    font-size: ${({ $compacto }) => ($compacto ? '20px' : '32px')};
    font-weight: 800;
    line-height: ${({ $compacto }) => ($compacto ? '38px' : '1.2')};
    color: ${({ $cor }) => $cor ?? '#111827'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const DetalheIndicador = styled.p`
    font-size: 12px;
    color: #6B7280;
`;

const DuasColunas = styled.div`
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 24px;
    align-items: start;

    @media (max-width: 1100px) {
        grid-template-columns: 1fr;
    }
`;

const CabecalhoCartao = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const TituloCartao = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
`;

const DescricaoCartao = styled.p`
    font-size: 14px;
    color: #6B7280;
`;

const Lista = styled.ol`
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const ItemLista = styled.li`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;

    & + & {
        border-top: 1px solid #E5E7EB;
    }
`;

const Posicao = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background-color: ${({ $primeiro }) => ($primeiro ? 'var(--roxo-moradia)' : '#F8FAFC')};
    color: ${({ $primeiro }) => ($primeiro ? '#FFFFFF' : '#6B7280')};
    font-size: 14px;
    font-weight: 700;
`;

const InfoCidade = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-width: 0;
`;

const LinhaCidade = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
`;

const NomeCidade = styled.p`
    font-size: 14px;
    font-weight: 700;
    color: #111827;
`;

const Aparicoes = styled.p`
    font-size: 12px;
    color: #6B7280;
    white-space: nowrap;
`;

const TrilhaBarra = styled.div`
    height: 6px;
    border-radius: 999px;
    background-color: #EEF2FF;
    overflow: hidden;
`;

const PreenchimentoBarra = styled.div`
    width: ${({ $valor }) => $valor}%;
    height: 100%;
    border-radius: 999px;
    background-color: var(--roxo-moradia);
`;

const Selo = styled.span`
    flex-shrink: 0;
    padding: 4px 8px;
    border-radius: 6px;
    background-color: ${({ $alto }) => ($alto ? '#ECFDF5' : '#EEF2FF')};
    color: ${({ $alto }) => ($alto ? '#10B981' : 'var(--roxo-moradia)')};
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
`;

const BotaoAnalise = styled.button`
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    margin: -8px;
    padding: 8px;
    border: none;
    border-radius: 12px;
    background: none;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #F8FAFC;
    }

    &:focus-visible {
        outline: 2px solid var(--roxo-moradia);
        outline-offset: 2px;
    }

    > svg {
        flex-shrink: 0;
        color: #9CA3AF;
    }
`;

const DataAnalise = styled.p`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #6B7280;
`;

const Vazio = styled.section`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 64px 24px;
    border: 1px dashed #C7D2FE;
    border-radius: 24px;
    background-color: #FFFFFF;
    text-align: center;

    p {
        max-width: 480px;
    }
`;

const CaixaIconeGrande = styled(CaixaIcone)`
    width: 56px;
    height: 56px;
    border-radius: 14px;
    font-size: 28px;
`;

const BotaoPrimario = styled(BotaoIniciar)`
    background-color: var(--roxo-moradia);
    color: #FFFFFF;
`;

const ListaVazia = styled.p`
    padding: 24px 0 8px;
    font-size: 14px;
    color: #9CA3AF;
    text-align: center;
`;

// Exibido nos indicadores enquanto não há análises.
const SEM_DADO = '--';

const formatoData = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
});

function SeloMatch({ valor, sufixo = 'Match' }) {
    return <Selo $alto={valor >= 90}>{valor}% {sufixo}</Selo>;
}

function CartaoIndicador({ icone, rotulo, valor, detalhe, compacto, cor }) {
    return (
        <Cartao>
            <CaixaIcone>{icone}</CaixaIcone>
            <TextosIndicador>
                <RotuloIndicador>{rotulo}</RotuloIndicador>
                <ValorIndicador $compacto={compacto} $cor={cor} title={String(valor)}>{valor}</ValorIndicador>
                <DetalheIndicador>{detalhe}</DetalheIndicador>
            </TextosIndicador>
        </Cartao>
    );
}

function Dashboard({ usuario, onNavegar, onIniciarAnalise, onAbrirAnalise, analises = [] }){
    const { full_name } = usuario.user_metadata ?? {};
    const primeiroNome = full_name?.split(' ')[0];
    const {
        totalAnalises, cidadeMaisRecomendada, melhorMatch, cidadesAvaliadas, ranking, recentes,
    } = calcularIndicadores(analises);

    return(
        <Pagina>
            <CabecalhoApp usuario={usuario} paginaAtiva="dashboard" onNavegar={onNavegar} onNovaAnalise={onIniciarAnalise} comparacaoIndisponivel={analises.length === 0} />

            <Conteudo>
                <Saudacao>
                    <Titulo>Olá, {primeiroNome ?? 'bem-vindo(a)'}!</Titulo>
                    <Subtitulo>
                        {totalAnalises > 0
                            ? 'Acompanhe suas análises e veja quais cidades mais combinam com você.'
                            : 'Que bom ter você aqui. Vamos encontrar a cidade onde sua vida faz mais sentido?'}
                    </Subtitulo>
                </Saudacao>

                {totalAnalises === 0 ? (
                    <Vazio>
                        <CaixaIconeGrande><FiMap /></CaixaIconeGrande>
                        <TituloCartao>Você ainda não fez nenhuma análise</TituloCartao>
                        <DescricaoCartao>
                            Responda 8 etapas rápidas sobre seu perfil, orçamento e estilo de vida e receba um ranking das cidades ideais para você.
                        </DescricaoCartao>
                        <BotaoPrimario onClick={onIniciarAnalise}>
                            Fazer minha primeira análise <FiArrowRight />
                        </BotaoPrimario>
                    </Vazio>
                ) : (
                    <BannerAnalise>
                        <TextosBanner>
                            <EtiquetaBanner>Nova análise</EtiquetaBanner>
                            <TituloBanner>Pronto para descobrir sua próxima cidade?</TituloBanner>
                            <TextoBanner>
                                Suas prioridades mudaram? Responda 8 etapas rápidas e receba um novo ranking de cidades com o seu percentual de match.
                            </TextoBanner>
                        </TextosBanner>
                        <BotaoIniciar onClick={onIniciarAnalise}>
                            Iniciar nova análise <FiArrowRight />
                        </BotaoIniciar>
                    </BannerAnalise>
                )}

                <GradeIndicadores aria-label="Indicadores">
                    <CartaoIndicador
                        icone={<FiBarChart2 />}
                        rotulo="Análises realizadas"
                        valor={totalAnalises}
                        detalhe={recentes.length > 0
                            ? `Última em ${formatoData.format(new Date(recentes[0].data))}`
                            : 'Nenhuma análise ainda'}
                    />
                    <CartaoIndicador
                        icone={<FiAward />}
                        rotulo="Cidade mais recomendada"
                        valor={cidadeMaisRecomendada?.cidade ?? SEM_DADO}
                        detalhe={cidadeMaisRecomendada
                            ? `1º lugar em ${cidadeMaisRecomendada.vezes} de ${totalAnalises} análises`
                            : 'Aparece após sua primeira análise'}
                        compacto={Boolean(cidadeMaisRecomendada)}
                    />
                    <CartaoIndicador
                        icone={<FiTrendingUp />}
                        rotulo="Melhor match obtido"
                        valor={melhorMatch ? `${melhorMatch.match}%` : SEM_DADO}
                        detalhe={melhorMatch?.cidade ?? 'Aparece após sua primeira análise'}
                        cor={melhorMatch ? '#10B981' : undefined}
                    />
                    <CartaoIndicador
                        icone={<FiMap />}
                        rotulo="Cidades avaliadas"
                        valor={cidadesAvaliadas}
                        detalhe="Diferentes cidades nos seus rankings"
                    />
                </GradeIndicadores>

                <DuasColunas>
                    <Cartao>
                        <CabecalhoCartao>
                            <TituloCartao>Cidades que mais aparecem para você</TituloCartao>
                            <DescricaoCartao>Frequência nos seus rankings e match médio</DescricaoCartao>
                        </CabecalhoCartao>
                        {ranking.length > 0 ? (
                            <Lista>
                                {ranking.map(({ cidade, aparicoes, matchMedio }, indice) => (
                                    <ItemLista key={cidade}>
                                        <Posicao $primeiro={indice === 0}>{indice + 1}</Posicao>
                                        <InfoCidade>
                                            <LinhaCidade>
                                                <NomeCidade>{cidade}</NomeCidade>
                                                <Aparicoes>em {aparicoes} de {totalAnalises} análises</Aparicoes>
                                            </LinhaCidade>
                                            <TrilhaBarra>
                                                <PreenchimentoBarra $valor={(aparicoes / totalAnalises) * 100} />
                                            </TrilhaBarra>
                                        </InfoCidade>
                                        <SeloMatch valor={matchMedio} sufixo="médio" />
                                    </ItemLista>
                                ))}
                            </Lista>
                        ) : (
                            <ListaVazia>As cidades dos seus rankings aparecem aqui.</ListaVazia>
                        )}
                    </Cartao>

                    <Cartao>
                        <CabecalhoCartao>
                            <TituloCartao>Análises recentes</TituloCartao>
                            <DescricaoCartao>Cidade em 1º lugar em cada análise</DescricaoCartao>
                        </CabecalhoCartao>
                        {recentes.length > 0 ? (
                            <Lista>
                                {recentes.map(({ id, data, cidade, match }) => (
                                    <ItemLista key={id}>
                                        <BotaoAnalise type="button" onClick={() => onAbrirAnalise(id)} title="Ver resultados desta análise">
                                            <InfoCidade>
                                                <NomeCidade>{cidade}</NomeCidade>
                                                <DataAnalise>
                                                    <FiClock /> {formatoData.format(new Date(data))}
                                                </DataAnalise>
                                            </InfoCidade>
                                            <SeloMatch valor={match} />
                                            <FiChevronRight aria-hidden="true" />
                                        </BotaoAnalise>
                                    </ItemLista>
                                ))}
                            </Lista>
                        ) : (
                            <ListaVazia>Suas análises mais recentes aparecem aqui.</ListaVazia>
                        )}
                    </Cartao>
                </DuasColunas>
            </Conteudo>
        </Pagina>
    )
}

export default Dashboard
