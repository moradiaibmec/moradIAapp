import { useId, useState } from 'react';
import styled from "styled-components"
import { LuArrowLeft, LuArrowRight, LuSearch } from 'react-icons/lu';
import CabecalhoApp from '../CabecalhoApp/index.jsx';
import Selecao from '../Selecao/index.jsx';
import { PILARES } from '../../analise/opcoes.js';
import { nomeDaCidade, nomesNoTexto } from '../../analise/explicacao.js';
import { aluguelDoDomicilio } from '../../analise/filtros.js';
import { formatarReais, nomeDoEstado } from '../../analise/formatacao.js';
import { montarRanking } from '../../analise/ranking.js';

const ORDEM_MATCH = 'Maior match';

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F6F7F9;
    font-family: var(--fonte-moradia);
`;

const Conteudo = styled.main`
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 1100px;
    margin: 0 auto;
    padding: 40px 32px 80px;
    box-sizing: border-box;

    @media (max-width: 900px) {
        padding: 32px 16px 64px;
    }
`;

const BotaoVoltar = styled.button`
    display: flex;
    align-items: center;
    align-self: flex-start;
    gap: 8px;
    padding: 0;
    border: none;
    background: none;
    color: var(--roxo-moradia);
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
`;

const Titulo = styled.h1`
    margin: 0 0 6px;
    font-family: var(--fonte-titulo);
    font-size: 36px;
    font-weight: 800;
    color: #0F172A;

    @media (max-width: 600px) {
        font-size: 28px;
    }
`;

const Subtitulo = styled.p`
    font-size: 16px;
    line-height: 1.5;
    color: #5B6475;
`;

const Controles = styled.div`
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 16px;
`;

const CampoBusca = styled.label`
    display: flex;
    flex: 1 1 280px;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid #E6E8EC;
    border-radius: 10px;
    background-color: #FFFFFF;
    color: #5B6475;

    input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: none;
        color: #0F172A;
        font-family: var(--fonte-moradia);
        font-size: 14px;
    }

    &:focus-within {
        border-color: var(--roxo-moradia);
    }
`;

const CampoOrdem = styled.div`
    display: flex;
    flex: 0 1 240px;
    flex-direction: column;
    gap: 6px;
    min-width: 200px;
    font-size: 13px;
    font-weight: 600;
    color: #5B6475;
`;

const Lista = styled.ol`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const Linha = styled.button`
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 16px 20px;
    border: 1px solid #E6E8EC;
    border-radius: 14px;
    background-color: #FFFFFF;
    font-family: var(--fonte-moradia);
    text-align: left;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
        border-color: var(--roxo-moradia);
    }

    > svg {
        flex-shrink: 0;
        color: #5B6475;
    }

    @media (max-width: 600px) {
        gap: 12px;
        padding: 14px;
    }
`;

const Posicao = styled.span`
    flex-shrink: 0;
    width: 44px;
    color: #5B6475;
    font-size: 14px;
    font-weight: 700;
`;

const Cidade = styled.span`
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    strong {
        color: #0F172A;
        font-size: 15px;
        font-weight: 700;
    }

    small {
        color: #5B6475;
        font-size: 13px;
    }
`;

const Aluguel = styled.span`
    flex-shrink: 0;
    color: #0F172A;
    font-size: 14px;
    font-weight: 600;

    @media (max-width: 700px) {
        display: none;
    }
`;

const SeloValor = styled.span`
    flex-shrink: 0;
    min-width: 72px;
    padding: 4px 8px;
    border-radius: 6px;
    background-color: ${({ $neutro }) => ($neutro ? '#EEF0FF' : '#ECFDF5')};
    color: ${({ $neutro }) => ($neutro ? 'var(--roxo-moradia)' : '#047857')};
    font-size: 12px;
    font-weight: 700;
    text-align: center;
`;

const Vazio = styled.p`
    padding: 32px;
    border: 1px dashed #E6E8EC;
    border-radius: 14px;
    background-color: #FFFFFF;
    color: #5B6475;
    font-size: 14px;
    text-align: center;
`;

function RankingCompleto({ usuario, onNavegar, onNovaAnalise, onVoltar, resultados, cidades, domicilio, onVerCidade }) {
    const [termo, setTermo] = useState('');
    const [rotuloOrdem, setRotuloOrdem] = useState(ORDEM_MATCH);
    const idOrdem = useId();
    const pilarDaOrdem = PILARES.find(({ rotulo }) => rotulo === rotuloOrdem) ?? null;
    const linhas = montarRanking(resultados, { termo, ordem: pilarDaOrdem?.id ?? null });

    return (
        <Pagina>
            <CabecalhoApp usuario={usuario} paginaAtiva="resultados" onNavegar={onNavegar} onNovaAnalise={onNovaAnalise} />

            <Conteudo>
                <BotaoVoltar type="button" onClick={onVoltar}><LuArrowLeft aria-hidden="true" /> Voltar aos resultados</BotaoVoltar>

                <div>
                    <Titulo>Ranking completo</Titulo>
                    <Subtitulo>
                        {resultados.length} {resultados.length === 1 ? 'cidade passou' : 'cidades passaram'} nos seus filtros, da mais à menos compatível com você.
                    </Subtitulo>
                </div>

                <Controles>
                    <CampoBusca>
                        <LuSearch aria-hidden="true" />
                        <input
                            type="search"
                            value={termo}
                            onChange={(evento) => setTermo(evento.target.value)}
                            placeholder="Buscar cidade ou estado (UF)"
                            aria-label="Buscar no ranking"
                        />
                    </CampoBusca>
                    <CampoOrdem>
                        <span id={idOrdem}>Ordenar por</span>
                        <Selecao
                            valor={rotuloOrdem}
                            opcoes={[ORDEM_MATCH, ...PILARES.map(({ rotulo }) => rotulo)]}
                            onChange={setRotuloOrdem}
                            aria-labelledby={idOrdem}
                        />
                    </CampoOrdem>
                </Controles>

                {linhas.length === 0 ? (
                    <Vazio>Nenhuma cidade do seu ranking corresponde a “{termo.trim()}”.</Vazio>
                ) : (
                    <Lista aria-label="Cidades do ranking">
                        {linhas.map(({ resultado, posicao }) => {
                            const cidade = cidades.find(({ ibge }) => ibge === resultado.ibge);
                            const aluguel = cidade ? aluguelDoDomicilio(cidade, domicilio) : null;
                            const notaDaOrdem = pilarDaOrdem ? resultado.notas[pilarDaOrdem.id] : null;
                            return (
                                <li key={resultado.ibge}>
                                    <Linha type="button" onClick={() => onVerCidade(resultado.ibge)} aria-label={`Ver ${resultado.cidade}, ${resultado.match}% de match`}>
                                        <Posicao>#{posicao + 1}</Posicao>
                                        <Cidade>
                                            <strong>{nomeDaCidade(resultado.cidade)}</strong>
                                            <small>
                                                {cidade && nomeDoEstado(cidade.uf)}
                                                {resultado.pontosFortes.length > 0 && ` · Forte em ${nomesNoTexto(resultado.pontosFortes.slice(0, 2)).join(' e ')}`}
                                            </small>
                                        </Cidade>
                                        {aluguel !== null && <Aluguel>{formatarReais(aluguel)}/mês</Aluguel>}
                                        {notaDaOrdem && (
                                            <SeloValor $neutro>{notaDaOrdem.dadoIndisponivel ? 'Sem dado' : `${notaDaOrdem.nota}%`}</SeloValor>
                                        )}
                                        <SeloValor>{resultado.match}% match</SeloValor>
                                        <LuArrowRight aria-hidden="true" />
                                    </Linha>
                                </li>
                            );
                        })}
                    </Lista>
                )}
            </Conteudo>
        </Pagina>
    );
}

export default RankingCompleto
