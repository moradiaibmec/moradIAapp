import styled from "styled-components"
import { FiArrowRight, FiMapPin, FiPlus, FiX } from 'react-icons/fi';
import CabecalhoApp from '../CabecalhoApp/index.jsx';
import BuscaCidade from '../BuscaCidade/index.jsx';
import { useCidadesSalvas } from '../CidadesSalvas/useCidadesSalvas.js';
import { detalharSalvas } from '../../analise/cidadesSalvas.js';
import { aluguelDoDomicilio } from '../../analise/filtros.js';
import { formatarPopulacao, formatarReais, nomeDoEstado } from '../../analise/formatacao.js';

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
    padding: 48px 80px 80px;
    box-sizing: border-box;

    @media (max-width: 900px) {
        padding: 32px 16px 64px;
    }
`;

const Titulo = styled.h1`
    margin: 0 0 8px;
    color: #111827;
    font-size: 36px;
    font-weight: 800;

    @media (max-width: 600px) {
        font-size: 28px;
    }
`;

const Subtitulo = styled.p`
    color: #6B7280;
    font-size: 16px;
    line-height: 1.6;
`;

const LimiteBusca = styled.div`
    max-width: 560px;
`;

const Grade = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const Cartao = styled.li`
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    background-color: #FFFFFF;
`;

const Foto = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    height: 140px;
    padding: 12px;
    box-sizing: border-box;
    background: ${({ $url }) => ($url ? `url("${$url}") center / cover no-repeat, ` : '')} linear-gradient(135deg, #6366F1 0%, #312E81 100%);
`;

const Pilula = styled.span`
    padding: 4px 10px;
    border-radius: 999px;
    background-color: ${({ $fora }) => ($fora ? '#FFFBEB' : '#ECFDF5')};
    color: ${({ $fora }) => ($fora ? '#B45309' : '#047857')};
    font-size: 12px;
    font-weight: 700;
`;

const BotaoRemover = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    margin-left: auto;
    border: none;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.92);
    color: #6B7280;
    font-size: 16px;
    cursor: pointer;

    &:hover:not(:disabled) {
        color: #DC2626;
    }

    &:disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

const Corpo = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
`;

const NomeCidade = styled.h2`
    margin: 0;
    color: #111827;
    font-size: 18px;
    font-weight: 700;
`;

const Estado = styled.p`
    margin-top: 2px;
    color: #6B7280;
    font-size: 13px;
`;

const Dados = styled.dl`
    display: flex;
    gap: 24px;
    margin: 0;

    dt {
        color: #6B7280;
        font-size: 12px;
    }

    dd {
        margin: 2px 0 0;
        color: #111827;
        font-size: 15px;
        font-weight: 700;
    }
`;

const BotaoVer = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding: 0;
    border: none;
    background: none;
    color: var(--roxo-moradia);
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
`;

const TextoSuave = styled.p`
    margin-top: auto;
    color: #6B7280;
    font-size: 13px;
    line-height: 1.5;
`;

const Vazio = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px 24px;
    border: 1px dashed #E5E7EB;
    border-radius: 16px;
    background-color: #FFFFFF;
    color: #6B7280;
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

const Erro = styled.p`
    color: #DC2626;
    font-size: 13px;
    font-weight: 600;
`;

function MinhasCidades({
    usuario, onNavegar, onNovaAnalise, comparacaoIndisponivel, cidadesSalvas, onSalvar, cidades, avaliadas, ranking, domicilio, onVerCidade,
}) {
    const { salvas, salvando, erroSalvar, salvar, remover } = useCidadesSalvas(cidadesSalvas, onSalvar);
    const itens = detalharSalvas(salvas, cidades, avaliadas, ranking);

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
                <div>
                    <Titulo>Minhas cidades</Titulo>
                    <Subtitulo>
                        {avaliadas
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
                        rotuloAcessivel="Pesquisar cidade para salvar"
                        desabilitada={salvando}
                    />
                </LimiteBusca>

                {erroSalvar && <Erro role="alert">Não foi possível salvar. Tente novamente.</Erro>}

                {itens.length === 0 ? (
                    <Vazio>
                        <CaixaIcone><FiMapPin /></CaixaIcone>
                        Você ainda não salvou nenhuma cidade. Pesquise acima ou toque em Salvar na página de uma cidade.
                    </Vazio>
                ) : (
                    <Grade aria-label="Cidades salvas">
                        {itens.map(({ nome, cidade, resultado, posicao }) => {
                            const aluguel = cidade && domicilio ? aluguelDoDomicilio(cidade, domicilio) : null;
                            return (
                                <Cartao key={nome}>
                                    <Foto $url={cidade?.foto?.miniatura}>
                                        {resultado && (
                                            <Pilula $fora={posicao === null}>
                                                {resultado.match}% match{posicao === null ? ' · fora do ranking' : ` · #${posicao + 1}`}
                                            </Pilula>
                                        )}
                                        <BotaoRemover
                                            type="button"
                                            onClick={() => remover(nome)}
                                            disabled={salvando}
                                            title="Remover"
                                            aria-label={`Remover ${nome}`}
                                        >
                                            <FiX />
                                        </BotaoRemover>
                                    </Foto>
                                    <Corpo>
                                        <div>
                                            <NomeCidade>{cidade ? cidade.nome : nome.slice(0, nome.lastIndexOf(', '))}</NomeCidade>
                                            <Estado>{nomeDoEstado(nome.slice(nome.lastIndexOf(', ') + 2))}</Estado>
                                        </div>
                                        {cidade && (
                                            <Dados>
                                                <div>
                                                    <dt>População</dt>
                                                    <dd>{formatarPopulacao(cidade.populacao)}</dd>
                                                </div>
                                                {aluguel !== null && (
                                                    <div>
                                                        <dt>Aluguel médio</dt>
                                                        <dd>{formatarReais(aluguel)}/mês</dd>
                                                    </div>
                                                )}
                                            </Dados>
                                        )}
                                        {!cidade && (
                                            <TextoSuave>Sem indicadores: a base cobre os municípios com mais de 100 mil habitantes.</TextoSuave>
                                        )}
                                        {cidade && resultado && (
                                            <BotaoVer type="button" onClick={() => onVerCidade(cidade.ibge)}>
                                                Ver cidade <FiArrowRight aria-hidden="true" />
                                            </BotaoVer>
                                        )}
                                        {cidade && !resultado && <TextoSuave>Faça uma análise para ver os detalhes desta cidade.</TextoSuave>}
                                    </Corpo>
                                </Cartao>
                            );
                        })}
                    </Grade>
                )}
            </Conteudo>
        </Pagina>
    );
}

export default MinhasCidades
