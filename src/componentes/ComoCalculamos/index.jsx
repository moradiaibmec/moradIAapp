import styled from "styled-components"
import { FiAlertCircle, FiAlertTriangle, FiArrowDown, FiExternalLink } from 'react-icons/fi';
import CabecalhoApp from '../CabecalhoApp/index.jsx';
import IconePilar from '../IconePilar/index.jsx';
import { PASSOS, criteriosDaMetodologia, exemploDeCalculo, limitacoes, resumoDaBase } from '../../analise/metodologia.js';
import { LIMITE_ESSENCIAL_RUIM, PENALIDADE_ESSENCIAL } from '../../analise/match.js';

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F6F7F9;
    font-family: var(--fonte-moradia);
`;

const Conteudo = styled.main`
    display: flex;
    flex-direction: column;
    gap: 72px;
    max-width: 1440px;
    margin: 0 auto;
    padding: 56px 80px 80px;
    box-sizing: border-box;

    @media (max-width: 900px) {
        gap: 48px;
        padding: 32px 16px 64px;
    }
`;

const Hero = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 40px;

    @media (max-width: 1100px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 32px;
    }
`;

const TextoHero = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    max-width: 820px;
`;

const Titulo = styled.h1`
    margin: 0;
    color: #0F172A;
    font-family: var(--fonte-titulo);
    font-size: 52px;
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -1.4px;

    @media (max-width: 600px) {
        font-size: 34px;
        letter-spacing: -0.8px;
    }
`;

const Lead = styled.p`
    color: #5B6475;
    font-size: 18px;
    line-height: 1.55;

    @media (max-width: 600px) {
        font-size: 16px;
    }
`;

const LinkLimitacoes = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    border: none;
    background: none;
    color: var(--roxo-moradia);
    font-family: var(--fonte-moradia);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;

const Numeros = styled.dl`
    display: flex;
    flex-shrink: 0;
    margin: 0;

    div {
        display: flex;
        flex-direction: column-reverse;
        gap: 2px;
        padding: 0 20px;
    }

    div + div {
        border-left: 1px solid #E6E8EC;
    }

    div:first-child {
        padding-left: 0;
    }

    dt {
        color: #5B6475;
        font-size: 14px;
    }

    dd {
        margin: 0;
        color: #0F172A;
        font-family: var(--fonte-titulo);
        font-size: 44px;
        font-weight: 800;
        letter-spacing: -1px;
        line-height: 1.15;
    }

    @media (max-width: 600px) {
        div {
            padding: 0 14px;
        }

        dt {
            font-size: 13px;
        }

        dd {
            font-size: 34px;
        }
    }
`;

const Secao = styled.section`
    display: flex;
    flex-direction: column;
    gap: 28px;
    scroll-margin-top: 24px;
`;

const TituloSecao = styled.h2`
    margin: 0;
    color: #0F172A;
    font-family: var(--fonte-titulo);
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.5px;

    @media (max-width: 600px) {
        font-size: 24px;
    }
`;

const PassosEExemplo = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 56px;

    @media (max-width: 1100px) {
        flex-direction: column;
        align-items: stretch;
        gap: 40px;
    }
`;

const Passos = styled.ol`
    flex: 1;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const Passo = styled.li`
    display: flex;
    gap: 18px;

    h3 {
        margin: 0 0 6px;
        color: #0F172A;
        font-family: var(--fonte-titulo);
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.2px;
    }

    p {
        color: #5B6475;
        font-size: 15px;
        line-height: 1.55;
    }
`;

// Número do passo com a linha que o liga ao próximo; o último passo não tem linha.
const Trilho = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 36px;

    &::after {
        content: '';
        flex: 1;
        width: 2px;
        background-color: #E2E8F0;
    }

    li:last-child > &::after {
        display: none;
    }
`;

const NumeroPasso = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 999px;
    background-color: #EEF0FF;
    color: var(--roxo-moradia);
    font-size: 15px;
    font-weight: 700;
`;

const TextoPasso = styled.div`
    padding: 6px 0 28px;

    li:last-child > & {
        padding-bottom: 0;
    }
`;

const Exemplo = styled.aside`
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex-shrink: 0;
    width: 640px;
    padding: 32px;
    box-sizing: border-box;
    border-radius: 24px;
    background-color: #0F172A;
    color: #FFFFFF;

    h3 {
        margin: 0 0 4px;
        font-family: var(--fonte-titulo);
        font-size: 22px;
        font-weight: 700;
        letter-spacing: -0.3px;
    }

    @media (max-width: 1100px) {
        width: 100%;
    }

    @media (max-width: 600px) {
        padding: 24px 20px;
        border-radius: 20px;
    }
`;

const TextoClaro = styled.p`
    color: #CBD5E1;
    font-size: 14px;
`;

const TabelaExemplo = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 15px;
    font-variant-numeric: tabular-nums;

    th {
        padding: 0 0 8px;
        color: #CBD5E1;
        font-size: 12px;
        font-weight: 600;
        text-align: right;
    }

    td {
        height: 44px;
        padding: 0;
        border-top: 1px solid rgba(255, 255, 255, 0.12);
        font-weight: 500;
        text-align: right;
    }

    th:first-child,
    td:first-child,
    th:nth-child(2),
    td:nth-child(2) {
        text-align: left;
    }

    td:first-child {
        font-weight: 600;
    }

    td:nth-child(2) {
        color: #CBD5E1;
    }

    th + th,
    td + td {
        padding-left: 8px;
    }

    @media (max-width: 600px) {
        font-size: 13px;

        th:nth-child(2),
        td:nth-child(2) {
            display: none;
        }
    }
`;

const NotaPenalizada = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #FCD34D;
    font-weight: 700;

    svg {
        font-size: 14px;
    }
`;

const Contas = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const Conta = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    small {
        display: block;
        margin-bottom: 2px;
        color: ${({ $alerta }) => ($alerta ? '#FCD34D' : '#CBD5E1')};
        font-size: 12px;
        font-weight: 600;
    }

    p {
        font-size: 14px;
    }

    strong {
        flex-shrink: 0;
        font-size: 16px;
        font-weight: 700;
        white-space: nowrap;
    }
`;

const MatchFinal = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 20px;
    border-radius: 14px;
    background-color: rgba(255, 255, 255, 0.08);

    small {
        display: block;
        margin-bottom: 2px;
        color: #CBD5E1;
        font-size: 12px;
        font-weight: 600;
    }

    p {
        font-family: var(--fonte-titulo);
        font-size: 17px;
        font-weight: 700;
    }

    strong {
        font-family: var(--fonte-titulo);
        font-size: 48px;
        font-weight: 800;
        letter-spacing: -1.2px;
        line-height: 1;
    }
`;

// Uma grade só para o cabeçalho e as linhas, para as colunas alinharem.
const COLUNAS_CRITERIOS = '176px 290px 370px minmax(0, 1fr)';

const TabelaCriterios = styled.div`
    overflow: hidden;
    border: 1px solid #E6E8EC;
    border-radius: 20px;
    background-color: #FFFFFF;
`;

const ColunasCriterios = styled.div`
    display: grid;
    grid-template-columns: ${COLUNAS_CRITERIOS};
    gap: 24px;
    padding: 12px 28px;
    background-color: #F8F9FB;
    color: #5B6475;
    font-size: 12px;
    font-weight: 600;

    @media (max-width: 1280px) {
        display: none;
    }
`;

const ListaCriterios = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
`;

const Criterio = styled.li`
    display: grid;
    grid-template-columns: ${COLUNAS_CRITERIOS};
    gap: 24px;
    padding: 20px 28px;
    border-top: 1px solid #EDEFF3;
    font-size: 14px;
    line-height: 1.5;

    @media (max-width: 1280px) {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 12px 24px;

        & > :first-child {
            grid-column: 1 / -1;
        }
    }

    @media (max-width: 700px) {
        grid-template-columns: minmax(0, 1fr);
        padding: 20px;
    }

    &:first-child {
        @media (max-width: 1280px) {
            border-top: none;
        }
    }
`;

const NomeCriterio = styled.h3`
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    color: #0F172A;
    font-family: var(--fonte-titulo);
    font-size: 16px;
    font-weight: 700;
    line-height: 1.3;
`;

const CaixaIcone = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background-color: #EEF0FF;
    color: var(--roxo-moradia);
    font-size: 18px;
`;

// No desktop o rótulo fica no cabeçalho da tabela; abaixo dele, cada célula mostra o seu.
const Celula = styled.div`
    color: ${({ $suave }) => ($suave ? '#5B6475' : '#0F172A')};

    & > span {
        display: none;
        margin-bottom: 2px;
        color: #5B6475;
        font-size: 12px;
        font-weight: 600;
    }

    @media (max-width: 1280px) {
        & > span {
            display: block;
        }
    }
`;

const Fontes = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;

    a {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        color: var(--roxo-moradia);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.45;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    svg {
        flex-shrink: 0;
        margin-top: 2px;
        font-size: 14px;
    }
`;

const Limitacoes = styled.ul`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 28px 32px;
    margin: 0;
    padding: 32px;
    border: 1px solid #FCD34D;
    border-radius: 20px;
    background-color: #FFF7E6;
    list-style: none;

    h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 8px;
        color: #0F172A;
        font-family: var(--fonte-titulo);
        font-size: 16px;
        font-weight: 700;
    }

    h3 svg {
        flex-shrink: 0;
        color: #D97706;
        font-size: 16px;
    }

    p {
        color: #0F172A;
        font-size: 14px;
        line-height: 1.55;
    }

    @media (max-width: 1100px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 700px) {
        grid-template-columns: minmax(0, 1fr);
        gap: 24px;
        padding: 24px 20px;
    }
`;

const numero = (valor) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

function ExemploDeCalculo({ totalCriterios }) {
    const { linhas, somaPontos, somaPesos, media, penalizadas, comPenalidade, match } = exemploDeCalculo();
    const multiplicadores = penalizadas.map(() => ` × ${numero(PENALIDADE_ESSENCIAL)}`).join('');
    const nomesPenalizados = penalizadas.map(({ rotulo }) => rotulo).join(' e ');

    return (
        <Exemplo aria-labelledby="titulo-exemplo">
            <div>
                <h3 id="titulo-exemplo">O cálculo em uma cidade fictícia</h3>
                <TextoClaro>Exemplo ilustrativo com {linhas.length} dos {totalCriterios} critérios.</TextoClaro>
            </div>

            <TabelaExemplo>
                <thead>
                    <tr>
                        <th scope="col">Critério</th>
                        <th scope="col">Prioridade</th>
                        <th scope="col">Nota</th>
                        <th scope="col">Peso</th>
                        <th scope="col">Pontos</th>
                    </tr>
                </thead>
                <tbody>
                    {linhas.map(({ pilar, rotulo, prioridade, nota, peso, pontos, penalizada }) => (
                        <tr key={pilar}>
                            <td>{rotulo}</td>
                            <td>{prioridade}</td>
                            <td>
                                {penalizada
                                    ? <NotaPenalizada><FiAlertTriangle aria-label="Abaixo do limite" />{nota}</NotaPenalizada>
                                    : nota}
                            </td>
                            <td>× {peso}</td>
                            <td>{pontos}</td>
                        </tr>
                    ))}
                </tbody>
            </TabelaExemplo>

            <Contas>
                <Conta>
                    <div>
                        <small>Passo 3</small>
                        <p>Soma dos pontos dividida pela soma dos pesos</p>
                    </div>
                    <strong>{somaPontos} ÷ {somaPesos} = {numero(media)}</strong>
                </Conta>
                {penalizadas.length > 0 && (
                    <Conta $alerta>
                        <div>
                            <small>Passo 4</small>
                            <p>
                                {nomesPenalizados} {penalizadas.length > 1 ? 'são Essenciais e ficaram' : 'é Essencial e ficou'} abaixo
                                de {LIMITE_ESSENCIAL_RUIM}, então vira ponto de atenção
                            </p>
                        </div>
                        <strong>{numero(media)}{multiplicadores} = {numero(comPenalidade)}</strong>
                    </Conta>
                )}
            </Contas>

            <MatchFinal>
                <div>
                    <small>Passo 5</small>
                    <p>Match da cidade no ranking</p>
                </div>
                <strong>{match}%</strong>
            </MatchFinal>
        </Exemplo>
    );
}

function ComoCalculamos({ usuario, onNavegar, onNovaAnalise, comparacaoIndisponivel, base }) {
    const resumo = resumoDaBase(base);
    const criterios = criteriosDaMetodologia(base.fontes);
    const listaLimitacoes = limitacoes(resumo);

    function irParaLimitacoes() {
        document.getElementById('limitacoes')?.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <Pagina>
            <CabecalhoApp
                usuario={usuario}
                paginaAtiva="metodologia"
                onNavegar={onNavegar}
                onNovaAnalise={onNovaAnalise}
                comparacaoIndisponivel={comparacaoIndisponivel}
            />

            <Conteudo>
                <Hero>
                    <TextoHero>
                        <Titulo>Como calculamos o seu match</Titulo>
                        <Lead>
                            O ranking é um cálculo transparente sobre dados públicos: as mesmas respostas sempre geram o mesmo resultado, e cada nota pode ser conferida na fonte.
                        </Lead>
                        <LinkLimitacoes type="button" onClick={irParaLimitacoes}>
                            Ver as {listaLimitacoes.length} limitações da base <FiArrowDown aria-hidden="true" />
                        </LinkLimitacoes>
                    </TextoHero>

                    <Numeros>
                        <div><dt>Cidades analisadas</dt><dd>{resumo.totalCidades}</dd></div>
                        <div><dt>Critérios avaliados</dt><dd>{resumo.totalCriterios}</dd></div>
                        <div><dt>Fontes públicas</dt><dd>{resumo.totalFontes}</dd></div>
                    </Numeros>
                </Hero>

                <Secao aria-labelledby="titulo-passos">
                    <TituloSecao id="titulo-passos">Passo a passo</TituloSecao>
                    <PassosEExemplo>
                        <Passos>
                            {PASSOS.map(({ titulo, texto }, indice) => (
                                <Passo key={titulo}>
                                    <Trilho><NumeroPasso aria-hidden="true">{indice + 1}</NumeroPasso></Trilho>
                                    <TextoPasso>
                                        <h3>{titulo}</h3>
                                        <p>{texto}</p>
                                    </TextoPasso>
                                </Passo>
                            ))}
                        </Passos>
                        <ExemploDeCalculo totalCriterios={resumo.totalCriterios} />
                    </PassosEExemplo>
                </Secao>

                <Secao aria-labelledby="titulo-criterios">
                    <TituloSecao id="titulo-criterios">Os {resumo.totalCriterios} critérios</TituloSecao>
                    <TabelaCriterios>
                        <ColunasCriterios aria-hidden="true">
                            <span>Critério</span>
                            <span>O que mede</span>
                            <span>Como vira nota</span>
                            <span>Fonte</span>
                        </ColunasCriterios>
                        <ListaCriterios>
                            {criterios.map(({ id, rotulo, mede, nota, fontes }) => (
                                <Criterio key={id}>
                                    <NomeCriterio><CaixaIcone><IconePilar pilar={id} /></CaixaIcone>{rotulo}</NomeCriterio>
                                    <Celula><span>O que mede</span>{mede}</Celula>
                                    <Celula $suave><span>Como vira nota</span>{nota}</Celula>
                                    <Celula>
                                        <span>Fonte</span>
                                        {fontes.length > 0 ? (
                                            <Fontes aria-label={`Fontes de ${rotulo}`}>
                                                {fontes.map(({ nome, periodo, url }) => (
                                                    <li key={`${nome}${periodo}`}>
                                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                                            <FiExternalLink aria-hidden="true" /> {nome}, {periodo}
                                                        </a>
                                                    </li>
                                                ))}
                                            </Fontes>
                                        ) : '—'}
                                    </Celula>
                                </Criterio>
                            ))}
                        </ListaCriterios>
                    </TabelaCriterios>
                </Secao>

                <Secao id="limitacoes" aria-labelledby="titulo-limitacoes">
                    <TituloSecao id="titulo-limitacoes">Limitações que você precisa conhecer</TituloSecao>
                    <Limitacoes>
                        {listaLimitacoes.map(({ titulo, texto }) => (
                            <li key={titulo}>
                                <h3><FiAlertCircle aria-hidden="true" />{titulo}</h3>
                                <p>{texto}</p>
                            </li>
                        ))}
                    </Limitacoes>
                </Secao>
            </Conteudo>
        </Pagina>
    );
}

export default ComoCalculamos
