import { useState } from 'react';
import styled from "styled-components"
import { FiAward, FiCheck, FiChevronDown, FiMapPin, FiPlus } from 'react-icons/fi';
import { LuGitCompareArrows } from 'react-icons/lu';
import CabecalhoApp from '../CabecalhoApp/index.jsx';
import BuscaCidade from '../BuscaCidade/index.jsx';
import { useCidadesSalvas } from '../CidadesSalvas/useCidadesSalvas.js';
import { ORDENACOES, destaquesDasSalvas, detalharSalvas, ordenarSalvas } from '../../analise/cidadesSalvas.js';
import { MAXIMO_COMPARADAS, MINIMO_COMPARADAS } from '../../analise/comparacao.js';
import { aluguelDoDomicilio } from '../../analise/filtros.js';
import { formatarPopulacao, formatarReais, nomeDoEstado, textoDoCredito } from '../../analise/formatacao.js';

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F6F7F9;
    font-family: var(--fonte-moradia);
`;

const Conteudo = styled.main`
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 1440px;
    margin: 0 auto;
    padding: 40px 80px 64px;
    box-sizing: border-box;

    @media (max-width: 900px) {
        padding: 32px 16px 64px;
    }
`;

const Topo = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;

    @media (max-width: 900px) {
        flex-direction: column;
        align-items: stretch;
        gap: 20px;
    }
`;

const Titulo = styled.h1`
    margin: 0 0 6px;
    color: #0F172A;
    font-family: var(--fonte-titulo);
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.8px;

    @media (max-width: 600px) {
        font-size: 28px;
    }
`;

const Subtitulo = styled.p`
    color: #5B6475;
    font-size: 16px;
    line-height: 1.5;
`;

const LimiteBusca = styled.div`
    flex-shrink: 0;
    width: 380px;

    input {
        padding-top: 14px;
        padding-bottom: 14px;
        border-color: #E6E8EC;
        border-radius: 12px;
        font-size: 15px;
    }

    @media (max-width: 900px) {
        width: 100%;
    }
`;

const Erro = styled.p`
    color: #DC2626;
    font-size: 13px;
    font-weight: 600;
`;

const Lista = styled.section`
    overflow: hidden;
    border: 1px solid #E6E8EC;
    border-radius: 20px;
    background-color: #FFFFFF;
`;

const BarraAcoes = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 24px;

    @media (max-width: 600px) {
        padding: 16px;
    }
`;

const Resumo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const Contagem = styled.p`
    color: #0F172A;
    font-size: 15px;
    font-weight: 600;
`;

const Ordenar = styled.label`
    position: relative;
    display: flex;
    align-items: center;

    select {
        appearance: none;
        padding: 6px 28px 6px 10px;
        border: none;
        border-radius: 8px;
        background-color: #F1F3F6;
        color: #0F172A;
        font-family: var(--fonte-moradia);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
    }

    select:focus-visible {
        outline: 2px solid var(--roxo-moradia);
        outline-offset: 2px;
    }

    svg {
        position: absolute;
        right: 10px;
        color: #5B6475;
        font-size: 14px;
        pointer-events: none;
    }
`;

const BotaoComparar = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    padding: 0 18px;
    border: none;
    border-radius: 10px;
    background-color: var(--roxo-moradia);
    color: #FFFFFF;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;

    svg {
        font-size: 16px;
    }

    &:hover:not(:disabled) {
        background-color: #4338CA;
    }

    &:disabled {
        background-color: #C7D2FE;
        cursor: default;
    }
`;

// Uma grade só para o cabeçalho e as linhas, para as colunas alinharem.
const COLUNAS = '20px minmax(0, 1fr) 230px 100px 130px 116px';

const Colunas = styled.div`
    display: grid;
    grid-template-columns: ${COLUNAS};
    gap: 24px;
    padding: 10px 24px;
    border-top: 1px solid #EDEFF3;
    border-bottom: 1px solid #EDEFF3;
    background-color: #F8F9FB;
    color: #5B6475;
    font-size: 12px;
    font-weight: 600;

    span:nth-child(5) {
        text-align: right;
    }

    @media (max-width: 1100px) {
        display: none;
    }
`;

const Linha = styled.li`
    display: grid;
    grid-template-columns: ${COLUNAS};
    grid-template-areas: "selecao cidade match populacao aluguel acoes";
    align-items: center;
    gap: 24px;
    padding: 16px 24px;
    background-color: ${({ $selecionada }) => ($selecionada ? '#F3F4FF' : '#FFFFFF')};

    & + & {
        border-top: 1px solid #EDEFF3;
    }

    @media (max-width: 1100px) {
        grid-template-columns: 20px minmax(0, 1fr) minmax(0, 1fr);
        grid-template-areas:
            "selecao cidade cidade"
            ". match match"
            ". populacao aluguel"
            ". acoes acoes";
        gap: 16px;
        padding: 16px;
    }
`;

const Selecao = styled.label`
    grid-area: selecao;
    position: relative;
    display: flex;
    width: 20px;
    height: 20px;

    input {
        position: absolute;
        inset: 0;
        margin: 0;
        opacity: 0;
        cursor: pointer;
    }

    input:disabled {
        cursor: not-allowed;
    }

    span {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        border: ${({ $marcada }) => ($marcada ? 'none' : '1.5px solid #CBD5E1')};
        border-radius: 6px;
        background-color: ${({ $marcada }) => ($marcada ? 'var(--roxo-moradia)' : '#FFFFFF')};
        color: #FFFFFF;
        font-size: 14px;
        opacity: ${({ $desabilitada }) => ($desabilitada ? 0.4 : 1)};
    }

    input:focus-visible + span {
        outline: 2px solid var(--roxo-moradia);
        outline-offset: 2px;
    }
`;

const SemSelecao = styled.span`
    grid-area: selecao;
`;

const Dados = styled.dl`
    display: contents;
`;

const Cidade = styled.div`
    grid-area: cidade;
    display: flex;
    align-items: center;
    gap: 20px;
    min-width: 0;

    @media (max-width: 600px) {
        gap: 14px;
    }
`;

const Foto = styled.div`
    flex-shrink: 0;
    width: 184px;
    height: 104px;
    border-radius: 12px;
    background: ${({ $url }) => ($url ? `url("${$url}") center / cover no-repeat, ` : '')} linear-gradient(135deg, #6366F1 0%, #312E81 100%);

    @media (max-width: 1280px) {
        width: 128px;
        height: 80px;
    }

    @media (max-width: 600px) {
        width: 88px;
        height: 64px;
        border-radius: 10px;
    }
`;

const Nome = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-width: 0;
`;

const NomeCidade = styled.h2`
    margin: 0;
    color: #0F172A;
    font-family: var(--fonte-titulo);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.3px;
    overflow-wrap: anywhere;
`;

const Estado = styled.p`
    color: #5B6475;
    font-size: 14px;
`;

const Destaque = styled.span`
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 2px;
    padding: 3px 10px;
    border-radius: 999px;
    background-color: #ECFDF5;
    color: #047857;
    font-size: 12px;
    font-weight: 600;

    svg {
        flex-shrink: 0;
        font-size: 13px;
    }
`;

const Match = styled.div`
    grid-area: match;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const ValorMatch = styled.p`
    color: #0F172A;
    font-family: var(--fonte-titulo);
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.6px;
    line-height: 1.2;
`;

const Barra = styled.div`
    overflow: hidden;
    height: 6px;
    border-radius: 3px;
    background-color: #E2E8F0;

    span {
        display: block;
        width: ${({ $valor }) => $valor}%;
        height: 100%;
        border-radius: 3px;
        background-color: var(--roxo-moradia);
    }
`;

const TextoSuave = styled.p`
    color: #5B6475;
    font-size: 13px;
    line-height: 1.5;
`;

// No celular as colunas viram blocos, então cada valor ganha o rótulo que no desktop fica no cabeçalho.
const Dado = styled.div`
    grid-area: ${({ $area }) => $area};
    display: flex;
    flex-direction: column;
    align-items: ${({ $direita }) => ($direita ? 'flex-end' : 'flex-start')};
    gap: 2px;

    dt {
        display: none;
        color: #5B6475;
        font-size: 12px;
        font-weight: 600;
    }

    dd {
        margin: 0;
        color: #0F172A;
        font-size: 16px;
        font-weight: 600;
    }

    small {
        color: #5B6475;
        font-size: 13px;
        font-weight: 400;
    }

    @media (max-width: 1100px) {
        align-items: flex-start;

        dt {
            display: block;
        }
    }
`;

const Acoes = styled.div`
    grid-area: acoes;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    @media (max-width: 1100px) {
        flex-direction: row;
        justify-content: flex-start;
        gap: 16px;
    }
`;

const BotaoVer = styled.button`
    width: 100%;
    height: 40px;
    border: 1px solid #E6E8EC;
    border-radius: 10px;
    background-color: #FFFFFF;
    color: #0F172A;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        border-color: var(--roxo-moradia);
        color: var(--roxo-moradia);
    }

    @media (max-width: 1100px) {
        width: auto;
        padding: 0 18px;
    }
`;

const BotaoRemover = styled.button`
    padding: 0;
    border: none;
    background: none;
    color: #5B6475;
    font-family: var(--fonte-moradia);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;

    &:hover:not(:disabled) {
        color: #DC2626;
    }

    &:disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

const Linhas = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
`;

const Vazio = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px 24px;
    border: 1px dashed #E6E8EC;
    border-radius: 20px;
    background-color: #FFFFFF;
    color: #5B6475;
    font-size: 14px;
    text-align: center;
`;

const CaixaIcone = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-size: 24px;
`;

const creditoDe = (foto) => (foto ? `${textoDoCredito(foto)} (Wikimedia Commons)` : undefined);

function rotuloComparar(quantidade) {
    if (quantidade < MINIMO_COMPARADAS) return `Selecione ${MINIMO_COMPARADAS} ou ${MAXIMO_COMPARADAS} para comparar`;
    return `Comparar ${quantidade} cidades`;
}

function MinhasCidades({
    usuario, onNavegar, onNovaAnalise, comparacaoIndisponivel, cidadesSalvas, onSalvar, cidades, avaliadas, ranking, domicilio, onVerCidade, onComparar,
}) {
    const { salvas, salvando, erroSalvar, salvar, remover } = useCidadesSalvas(cidadesSalvas, onSalvar);
    const [ordem, setOrdem] = useState('match');
    const [marcadas, setMarcadas] = useState([]);

    const comAnalise = Boolean(avaliadas);
    const ordenacoes = ORDENACOES.filter(({ precisaAnalise }) => comAnalise || !precisaAnalise);
    const criterio = ordenacoes.some(({ valor }) => valor === ordem) ? ordem : ordenacoes[0].valor;

    const detalhadas = detalharSalvas(salvas, cidades, avaliadas, ranking).map((item) => ({
        ...item,
        aluguel: item.cidade && domicilio ? aluguelDoDomicilio(item.cidade, domicilio) : null,
    }));
    const itens = ordenarSalvas(detalhadas, criterio);
    const destaques = destaquesDasSalvas(detalhadas);

    // Só entra na comparação quem tem match; a seleção some junto com a cidade removida.
    const selecionadas = marcadas.filter((ibge) => detalhadas.some(({ cidade, resultado }) => resultado && cidade.ibge === ibge));
    const cheia = selecionadas.length >= MAXIMO_COMPARADAS;

    function alternarMarcada(ibge) {
        setMarcadas(selecionadas.includes(ibge) ? selecionadas.filter((item) => item !== ibge) : [...selecionadas, ibge]);
    }

    return (
        <Pagina>
            <CabecalhoApp
                usuario={usuario}
                paginaAtiva="cidades"
                onNavegar={onNavegar}
                onNovaAnalise={onNovaAnalise}
                comparacaoIndisponivel={comparacaoIndisponivel}
            />

            <Conteudo>
                <Topo>
                    <div>
                        <Titulo>Minhas cidades</Titulo>
                        <Subtitulo>
                            {comAnalise
                                ? 'As cidades que você quer acompanhar, com o match da sua análise mais recente.'
                                : 'As cidades que você quer acompanhar. Faça uma análise para ver o match de cada uma.'}
                        </Subtitulo>
                    </div>

                    <LimiteBusca>
                        <BuscaCidade
                            onEscolher={salvar}
                            indisponiveis={salvas}
                            rotuloAcao="Salvar"
                            iconeAcao={<FiPlus aria-hidden="true" />}
                            rotuloIndisponivel="Salva"
                            placeholder="Adicionar cidade pelo nome"
                            rotuloAcessivel="Pesquisar cidade para salvar"
                            desabilitada={salvando}
                        />
                    </LimiteBusca>
                </Topo>

                {erroSalvar && <Erro role="alert">Não foi possível salvar. Tente novamente.</Erro>}

                {itens.length === 0 ? (
                    <Vazio>
                        <CaixaIcone><FiMapPin /></CaixaIcone>
                        Você ainda não salvou nenhuma cidade. Pesquise acima ou toque em Salvar na página de uma cidade.
                    </Vazio>
                ) : (
                    <Lista aria-label="Cidades salvas">
                        <BarraAcoes>
                            <Resumo>
                                <Contagem>{itens.length} {itens.length === 1 ? 'cidade' : 'cidades'}</Contagem>
                                {itens.length > 1 && (
                                    <Ordenar>
                                        <select value={criterio} onChange={(evento) => setOrdem(evento.target.value)} aria-label="Ordenar cidades">
                                            {ordenacoes.map(({ valor, rotulo }) => <option key={valor} value={valor}>{rotulo}</option>)}
                                        </select>
                                        <FiChevronDown aria-hidden="true" />
                                    </Ordenar>
                                )}
                            </Resumo>
                            {comAnalise && (
                                <BotaoComparar
                                    type="button"
                                    disabled={selecionadas.length < MINIMO_COMPARADAS}
                                    onClick={() => onComparar(selecionadas)}
                                >
                                    <LuGitCompareArrows aria-hidden="true" />
                                    {rotuloComparar(selecionadas.length)}
                                </BotaoComparar>
                            )}
                        </BarraAcoes>

                        <Colunas aria-hidden="true">
                            <span />
                            <span>Cidade</span>
                            <span>Match</span>
                            <span>População</span>
                            <span>Aluguel médio</span>
                            <span />
                        </Colunas>

                        <Linhas>
                            {itens.map(({ nome, cidade, resultado, posicao, aluguel }) => {
                                const nomeCidade = cidade ? cidade.nome : nome.slice(0, nome.lastIndexOf(', '));
                                const marcada = Boolean(cidade && selecionadas.includes(cidade.ibge));
                                const bloqueada = !marcada && cheia;
                                const destaque = destaques.get(nome);
                                return (
                                    <Linha key={nome} $selecionada={marcada}>
                                        {resultado ? (
                                            <Selecao
                                                $marcada={marcada}
                                                $desabilitada={bloqueada}
                                                title={bloqueada ? `Desmarque uma cidade para escolher outra (máximo de ${MAXIMO_COMPARADAS})` : undefined}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={marcada}
                                                    disabled={bloqueada}
                                                    onChange={() => alternarMarcada(cidade.ibge)}
                                                    aria-label={`Selecionar ${nomeCidade} para comparar`}
                                                />
                                                <span aria-hidden="true">{marcada && <FiCheck />}</span>
                                            </Selecao>
                                        ) : <SemSelecao />}

                                        <Cidade>
                                            <Foto $url={cidade?.foto?.miniatura} title={creditoDe(cidade?.foto)} />
                                            <Nome>
                                                <NomeCidade>{nomeCidade}</NomeCidade>
                                                <Estado>{nomeDoEstado(nome.slice(nome.lastIndexOf(', ') + 2))}</Estado>
                                                {destaque && (
                                                    <Destaque>
                                                        <FiAward aria-hidden="true" />
                                                        {destaque}
                                                    </Destaque>
                                                )}
                                            </Nome>
                                        </Cidade>

                                        <Match>
                                            {resultado ? (
                                                <>
                                                    <ValorMatch>{resultado.match}%</ValorMatch>
                                                    <Barra $valor={resultado.match} aria-hidden="true"><span /></Barra>
                                                    <TextoSuave>
                                                        {posicao === null ? 'Fora do seu ranking' : `${posicao + 1}º no seu ranking`}
                                                    </TextoSuave>
                                                </>
                                            ) : (
                                                <TextoSuave>
                                                    {cidade
                                                        ? 'Faça uma análise para ver o match desta cidade.'
                                                        : 'Sem indicadores: a base cobre os municípios com 50 mil habitantes ou mais.'}
                                                </TextoSuave>
                                            )}
                                        </Match>

                                        {cidade ? (
                                            <Dados>
                                                <Dado $area="populacao">
                                                    <dt>População</dt>
                                                    <dd>{formatarPopulacao(cidade.populacao)}</dd>
                                                </Dado>
                                                <Dado $area="aluguel" $direita>
                                                    <dt>Aluguel médio</dt>
                                                    <dd>{aluguel === null ? '—' : <>{formatarReais(aluguel)} <small>/mês</small></>}</dd>
                                                </Dado>
                                            </Dados>
                                        ) : null}

                                        <Acoes>
                                            {cidade && resultado && (
                                                <BotaoVer type="button" onClick={() => onVerCidade(cidade.ibge)}>
                                                    Ver cidade
                                                </BotaoVer>
                                            )}
                                            <BotaoRemover
                                                type="button"
                                                onClick={() => remover(nome)}
                                                disabled={salvando}
                                                aria-label={`Remover ${nomeCidade}`}
                                            >
                                                Remover
                                            </BotaoRemover>
                                        </Acoes>
                                    </Linha>
                                );
                            })}
                        </Linhas>
                    </Lista>
                )}
            </Conteudo>
        </Pagina>
    );
}

export default MinhasCidades
