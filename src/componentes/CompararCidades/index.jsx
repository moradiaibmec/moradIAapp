import { useEffect, useRef, useState } from 'react';
import styled from "styled-components"
import {
    LuArrowRight, LuArrowUpRight, LuDownload, LuListChecks, LuPlus, LuScale, LuSearch, LuSparkles, LuTrophy, LuWallet, LuX,
} from 'react-icons/lu';
import CabecalhoApp from '../CabecalhoApp/index.jsx';
import { comoFoiEstimado, fraseDoPilar, nomeDaCidade } from '../../analise/explicacao.js';
import { formatarPopulacao, formatarReais, nomeDoEstado, textoDoCredito } from '../../analise/formatacao.js';
import { aluguelDoDomicilio, filtrosReprovados } from '../../analise/filtros.js';
import { pontoMedioRenda } from '../../analise/respostas.js';
import {
    MAXIMO_COMPARADAS, MINIMO_COMPARADAS, ROTULO_PESO, buscarParaComparar, indiceDoMaior, indiceDoMenor, ordenarComparadas,
    pilaresComparaveis, pilaresPorPeso, vencedoresDoPilar, veredito, vitoriasPorCidade,
} from '../../analise/comparacao.js';

// Cidades sem foto (ou enquanto ela carrega) mostram um gradiente da marca no lugar da imagem.
const FUNDOS_CIDADE = [
    'linear-gradient(135deg, #6366F1 0%, #312E81 100%)',
    'linear-gradient(135deg, #818CF8 0%, #3730A3 100%)',
    'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
];
const SOMBRA_FOTO = 'linear-gradient(180deg, rgba(11, 18, 32, 0) 35%, rgba(11, 18, 32, 0.85) 100%)';
const LARGURA_ROTULOS = 264;

const fundoComFoto = (url, reserva) => (url ? `url("${url}") center / cover no-repeat, ${reserva}` : reserva);
const graus = (valor) => `${Math.round(valor)} °C`;
const ausente = (valor) => valor === null || valor === undefined;

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F6F7F9;
    font-family: var(--fonte-moradia);
`;

const Conteudo = styled.main`
    display: flex;
    flex-direction: column;
    gap: 32px;
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

    p {
        font-size: 15px;
        color: #5B6475;
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
    cursor: pointer;
    transition: border-color 0.2s;

    svg {
        font-size: 16px;
    }

    &:hover:not(:disabled) {
        border-color: var(--roxo-moradia);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const Adicionar = styled.div`
    position: relative;
`;

const MenuAdicionar = styled.div`
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    width: 320px;
    max-width: calc(100vw - 32px);
    border: 1px solid #E6E8EC;
    border-radius: 12px;
    background-color: #FFFFFF;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
    box-sizing: border-box;
    overflow: hidden;
`;

const CampoBusca = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 6px;
    padding: 0 12px;
    border: 1px solid #E6E8EC;
    border-radius: 8px;
    color: #9CA3AF;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus-within {
        border-color: var(--roxo-moradia);
        box-shadow: 0 0 0 3px #EEF2FF;
    }

    svg {
        flex-shrink: 0;
        font-size: 16px;
    }

    input {
        flex: 1;
        min-width: 0;
        padding: 10px 0;
        border: none;
        outline: none;
        background: none;
        color: #0F172A;
        font-family: var(--fonte-moradia);
        font-size: 14px;
    }

    input::placeholder {
        color: #9CA3AF;
    }
`;

const TituloLista = styled.p`
    padding: 6px 18px 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: #5B6475;
`;

const SemResultados = styled.p`
    padding: 12px 18px 16px;
    font-size: 13px;
    color: #5B6475;
`;

const ListaAdicionar = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 300px;
    margin: 0;
    padding: 0 6px 6px;
    list-style: none;
    overflow-y: auto;

    button {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 12px;
        border: none;
        border-radius: 8px;
        background: none;
        color: #0F172A;
        font-family: var(--fonte-moradia);
        font-size: 14px;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
    }

    button:hover,
    button:focus-visible {
        outline: none;
        background-color: #EEF0FF;
    }

    small {
        flex-shrink: 0;
        width: 36px;
        font-size: 12px;
        font-weight: 600;
        color: #5B6475;
    }

    span {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    em {
        flex-shrink: 0;
        font-size: 12px;
        font-style: normal;
        font-weight: 700;
        color: var(--roxo-moradia);
    }
`;

// Cabeçalhos das cidades e tabela rolam juntos na horizontal em telas estreitas.
const Rolagem = styled.div`
    margin: 0 -16px;
    padding: 0 16px;
    overflow-x: auto;
`;

const Comparacao = styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
    min-width: 900px;
`;

// Mesma grade nos cabeçalhos e nas linhas da tabela, para as colunas de cada cidade se alinharem.
const Grade = styled.div`
    display: grid;
    grid-template-columns: ${LARGURA_ROTULOS}px repeat(${({ $colunas }) => $colunas}, minmax(0, 1fr));
    gap: 16px;
    padding-right: 12px;
`;

const Resumo = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
    padding: 24px;
    border-radius: 20px;
    background-color: #0F172A;
`;

const TopoResumo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;

    svg {
        font-size: 24px;
        color: #A5B4FC;
    }

    h2 {
        margin: 0;
        font-family: var(--fonte-titulo);
        font-size: 20px;
        font-weight: 700;
        color: #FFFFFF;
    }

    p {
        font-size: 13px;
        line-height: 1.5;
        color: #CBD5E1;
    }
`;

const Legenda = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #E2E8F0;
    }
`;

const Amostra = styled.span`
    width: 16px;
    height: 6px;
    border-radius: 3px;
    background-color: ${({ $cor }) => $cor};
`;

const CartaoCidade = styled.article`
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    background-color: #FFFFFF;
    outline: ${({ $melhor }) => ($melhor ? '2px solid var(--roxo-moradia)' : '1px solid #E6E8EC')};
    outline-offset: ${({ $melhor }) => ($melhor ? '-1px' : '-0.5px')};
    overflow: hidden;
`;

const Foto = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 180px;
    padding: 16px;
    background: ${SOMBRA_FOTO}, ${({ $fundo }) => $fundo};
    box-sizing: border-box;
`;

const TopoFoto = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

const AcoesFoto = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
`;

const SeloMelhor = styled.span`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: 999px;
    background-color: var(--roxo-moradia);
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    white-space: nowrap;

    svg {
        font-size: 12px;
    }
`;

const SeloFora = styled.span`
    padding: 5px 10px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 999px;
    background-color: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(8px);
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    white-space: nowrap;
    cursor: help;
`;

const PilulaMatch = styled.span`
    padding: 5px 10px;
    border-radius: 999px;
    background-color: #FFFFFF;
    color: var(--roxo-moradia);
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
`;

const BotaoRemover = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    background-color: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(8px);
    color: #FFFFFF;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover,
    &:focus-visible {
        outline: none;
        background-color: rgba(15, 23, 42, 0.7);
    }
`;

const NomeFoto = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;

    h2 {
        margin: 0;
        font-family: var(--fonte-titulo);
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.6px;
        color: #FFFFFF;
        overflow-wrap: anywhere;
    }

    p {
        font-size: 13px;
        font-weight: 500;
        color: #E2E8F0;
    }
`;

const CorpoCartao = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 16px;
`;

const Vitorias = styled.p`
    display: flex;
    flex-direction: column;
    gap: 2px;

    strong {
        font-size: 14px;
        font-weight: 700;
        color: #0F172A;
    }

    span {
        font-size: 12px;
        color: #5B6475;
    }
`;

const BotaoVerCidade = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: none;
    border-radius: 10px;
    background-color: ${({ $principal }) => ($principal ? 'var(--roxo-moradia)' : '#EEF0FF')};
    color: ${({ $principal }) => ($principal ? '#FFFFFF' : 'var(--roxo-moradia)')};
    font-family: var(--fonte-moradia);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.2s;

    svg {
        font-size: 14px;
    }

    &:hover {
        background-color: ${({ $principal }) => ($principal ? '#4338CA' : '#E0E7FF')};
    }
`;

const Tabela = styled.section`
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    background-color: #FFFFFF;
    outline: 1px solid #E6E8EC;
    outline-offset: -0.5px;
    overflow: hidden;
`;

const Secao = styled.h2`
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 14px 24px;
    border-bottom: 1px solid #E6E8EC;
    background-color: #F8F9FB;
    color: #5B6475;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;

    svg {
        font-size: 16px;
    }
`;

const Linha = styled(Grade)`
    align-items: center;
    padding-top: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #E6E8EC;

    &:last-child {
        border-bottom: none;
    }
`;

const RotuloLinha = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding-left: 24px;

    strong {
        font-size: 15px;
        font-weight: 600;
        color: #0F172A;
    }
`;

const SeloPeso = styled.span`
    padding: 2px 8px;
    border-radius: 6px;
    background-color: #EEF0FF;
    color: var(--roxo-moradia);
    font-size: 11px;
    font-weight: 600;
`;

const SeloEstimado = styled.span`
    margin-left: 8px;
    padding: 2px 6px;
    border-radius: 6px;
    background-color: #FFFBEB;
    color: #B45309;
    font-size: 11px;
    font-weight: 700;
    cursor: help;
`;

const CelulaNota = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 10px;
    background-color: ${({ $vence }) => ($vence ? '#F3F4FF' : 'transparent')};
`;

const Trilho = styled.div`
    flex: 1;
    height: 8px;
    border-radius: 4px;
    background-color: #EDEFF3;
    overflow: hidden;
`;

const Preenchimento = styled.div`
    width: ${({ $valor }) => $valor}%;
    height: 100%;
    border-radius: inherit;
    background-color: ${({ $vence }) => ($vence ? 'var(--roxo-moradia)' : '#CBD5E1')};
`;

const ValorNota = styled.span`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    gap: 4px;
    width: 64px;
    font-family: var(--fonte-titulo);
    font-size: 15px;
    font-weight: ${({ $vence }) => ($vence ? 800 : 600)};
    color: ${({ $vence }) => ($vence ? 'var(--roxo-moradia)' : '#5B6475')};

    svg {
        font-size: 14px;
    }
`;

const CelulaValor = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 12px 14px;
    border-radius: 10px;
    background-color: ${({ $destaque }) => ($destaque ? '#ECFDF5' : 'transparent')};

    strong {
        font-family: var(--fonte-titulo);
        font-size: 16px;
        font-weight: 700;
        color: ${({ $destaque, $negativo }) => ($destaque ? '#047857' : $negativo ? '#DC2626' : '#0F172A')};
    }

    span {
        font-size: 13px;
        color: #5B6475;
    }
`;

const SeloDestaque = styled.span`
    padding: 2px 8px;
    border-radius: 6px;
    background-color: #D1FAE5;
    color: #047857 !important;
    font-size: 11px !important;
    font-weight: 600;
`;

const Veredito = styled.section`
    display: flex;
    align-items: center;
    gap: 32px;
    padding: 32px;
    border-radius: 20px;
    background: linear-gradient(90deg, #312E81 0%, #4F46E5 100%);

    @media (max-width: 900px) {
        flex-direction: column;
        align-items: stretch;
        padding: 24px;
    }
`;

const TextoVeredito = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;

    h2 {
        margin: 0;
        font-family: var(--fonte-titulo);
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.6px;
        color: #FFFFFF;
    }

    p {
        font-size: 15px;
        line-height: 1.55;
        color: #E0E7FF;
    }
`;

const Sobrancelha = styled.span`
    display: flex;
    align-items: center;
    gap: 8px;
    color: #C7D2FE;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;

    svg {
        font-size: 16px;
    }
`;

const AcoesVeredito = styled.div`
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 10px;
    width: 240px;

    @media (max-width: 900px) {
        width: auto;
    }
`;

const BotaoVeredito = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    border: 1px solid ${({ $vidro }) => ($vidro ? 'rgba(255, 255, 255, 0.25)' : 'transparent')};
    border-radius: 12px;
    background-color: ${({ $vidro }) => ($vidro ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF')};
    color: ${({ $vidro }) => ($vidro ? '#FFFFFF' : 'var(--roxo-moradia)')};
    font-family: var(--fonte-moradia);
    font-size: 15px;
    font-weight: ${({ $vidro }) => ($vidro ? 600 : 700)};
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s;

    svg {
        font-size: 16px;
    }

    &:hover {
        background-color: ${({ $vidro }) => ($vidro ? 'rgba(255, 255, 255, 0.2)' : '#EEF0FF')};
    }
`;

// Sem termo, sugere as cidades do ranking; com termo, busca em toda a base, inclusive fora dos filtros.
function BotaoAdicionar({ ranking, avaliadas, posicoes, comparadas, onAdicionar }) {
    const [aberta, setAberta] = useState(false);
    const [termo, setTermo] = useState('');
    const referencia = useRef(null);
    const cheia = comparadas.length >= MAXIMO_COMPARADAS;

    const buscando = termo.trim() !== '';
    const opcoes = buscando
        ? buscarParaComparar(avaliadas, comparadas, termo)
        : ranking.filter(({ ibge }) => !comparadas.includes(ibge));

    function fechar() {
        setAberta(false);
        setTermo('');
    }

    function adicionar(ibge) {
        onAdicionar(ibge);
        fechar();
    }

    useEffect(() => {
        if (!aberta) return undefined;
        const fecharFora = (evento) => {
            if (!referencia.current.contains(evento.target)) fechar();
        };
        const fecharComEsc = (evento) => {
            if (evento.key === 'Escape') fechar();
        };
        document.addEventListener('mousedown', fecharFora);
        document.addEventListener('keydown', fecharComEsc);
        return () => {
            document.removeEventListener('mousedown', fecharFora);
            document.removeEventListener('keydown', fecharComEsc);
        };
    }, [aberta]);

    return (
        <Adicionar ref={referencia}>
            <BotaoContorno
                type="button"
                onClick={() => (aberta ? fechar() : setAberta(true))}
                disabled={cheia}
                title={cheia ? `Remova uma cidade para adicionar outra (máximo de ${MAXIMO_COMPARADAS})` : undefined}
                aria-expanded={aberta}
                aria-haspopup="true"
            >
                <LuPlus aria-hidden="true" /> Adicionar cidade
            </BotaoContorno>
            {aberta && (
                <MenuAdicionar>
                    <CampoBusca>
                        <LuSearch aria-hidden="true" />
                        <input
                            type="search"
                            value={termo}
                            onChange={(evento) => setTermo(evento.target.value)}
                            onKeyDown={(evento) => {
                                if (evento.key === 'Enter' && opcoes.length) adicionar(opcoes[0].ibge);
                            }}
                            placeholder="Pesquisar qualquer cidade"
                            aria-label="Pesquisar cidade para comparar"
                            autoFocus
                        />
                    </CampoBusca>
                    {opcoes.length === 0 ? (
                        <SemResultados>
                            {buscando
                                ? 'Nenhuma cidade encontrada. A base tem os municípios com mais de 100 mil habitantes.'
                                : 'Todas as cidades do seu ranking já estão na comparação. Pesquise outra cidade.'}
                        </SemResultados>
                    ) : (
                        <>
                            <TituloLista>{buscando ? 'Cidades encontradas' : 'Do seu ranking'}</TituloLista>
                            <ListaAdicionar aria-label={buscando ? 'Cidades encontradas' : 'Cidades do seu ranking'}>
                                {opcoes.map((resultado) => {
                                    const posicao = posicoes.get(resultado.ibge);
                                    return (
                                        <li key={resultado.ibge}>
                                            <button type="button" onClick={() => adicionar(resultado.ibge)}>
                                                <small title={posicao === undefined ? 'Fora do seu ranking: não passa nos seus filtros' : undefined}>
                                                    {posicao === undefined ? 'Fora' : `#${posicao + 1}`}
                                                </small>
                                                <span>{resultado.cidade}</span>
                                                <em>{resultado.match}%</em>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ListaAdicionar>
                        </>
                    )}
                </MenuAdicionar>
            )}
        </Adicionar>
    );
}

function CompararCidades({
    usuario, onNavegar, onNovaAnalise, respostas, resultados, avaliadas, cidades, fontes, comparadas, onAlterarComparadas, onVerCidade,
    onVerAnalise,
}) {
    // As cidades do ranking vêm primeiro, na ordem dele (a primeira é a de maior match); as de fora dos filtros, depois.
    const posicoes = new Map(resultados.map(({ ibge }, indice) => [ibge, indice]));
    const itens = ordenarComparadas(avaliadas, resultados, comparadas).map((resultado) => ({
        resultado,
        indice: posicoes.get(resultado.ibge) ?? null,
        cidade: cidades.find(({ ibge }) => ibge === resultado.ibge),
    }));
    const comparados = itens.map(({ resultado }) => resultado);
    const nomes = comparados.map(({ cidade }) => nomeDaCidade(cidade));

    const pilares = pilaresPorPeso(comparados[0].notas);
    const totalCriterios = pilaresComparaveis(comparados);
    const vitorias = vitoriasPorCidade(comparados);

    const renda = pontoMedioRenda(respostas.orcamento.faixaRenda);
    const alugueis = itens.map(({ cidade }) => (cidade ? aluguelDoDomicilio(cidade, respostas.domicilio) : null));
    const sobras = alugueis.map((aluguel) => (renda === null || aluguel === null ? null : renda - aluguel));
    const temperaturas = itens.map(({ cidade }) => cidade?.indicadores.tempMedia ?? null);
    const populacoes = itens.map(({ cidade }) => cidade?.populacao ?? null);
    const maisBarata = indiceDoMenor(alugueis);
    const maiorSobra = indiceDoMaior(sobras);
    const { titulo, texto } = veredito(comparados, alugueis);

    const saoOsPrimeiros = itens.every(({ indice }, posicao) => indice === posicao);
    const subtitulo = saoOsPrimeiros
        ? `Veja lado a lado como seus ${itens.length} maiores matches se saem em cada critério que você priorizou.`
        : 'Veja lado a lado como as cidades escolhidas se saem em cada critério que você priorizou.';
    const podeRemover = comparadas.length > MINIMO_COMPARADAS;

    const linhasDiaADia = [
        { rotulo: 'Aluguel médio', valores: alugueis, formatar: formatarReais, sufixo: '/mês', destaque: maisBarata, selo: 'Mais barato', dica: 'Para o tamanho do seu domicílio' },
        renda !== null && { rotulo: 'Sobra após o aluguel', valores: sobras, formatar: formatarReais, sufixo: '/mês', destaque: maiorSobra, selo: 'Maior sobra', dica: 'Sua renda prevista menos o aluguel médio' },
        { rotulo: 'Temperatura média', valores: temperaturas, formatar: graus },
        { rotulo: 'População', valores: populacoes, formatar: formatarPopulacao },
    ].filter(Boolean);

    return (
        <Pagina>
            <CabecalhoApp usuario={usuario} paginaAtiva="comparar" onNavegar={onNavegar} onNovaAnalise={onNovaAnalise} />

            <Conteudo>
                <Cabecalho>
                    <TextoCabecalho>
                        <Titulo>Compare suas opções</Titulo>
                        <p>{subtitulo}</p>
                    </TextoCabecalho>
                    <AcoesCabecalho>
                        <BotaoAdicionar
                            ranking={resultados}
                            avaliadas={avaliadas}
                            posicoes={posicoes}
                            comparadas={comparadas}
                            onAdicionar={(ibge) => onAlterarComparadas([...comparadas, ibge])}
                        />
                        <BotaoContorno type="button" disabled title="Em breve"><LuDownload aria-hidden="true" /> Baixar comparação</BotaoContorno>
                    </AcoesCabecalho>
                </Cabecalho>

                <Rolagem>
                    <Comparacao>
                        <Grade $colunas={itens.length}>
                            <Resumo>
                                <TopoResumo>
                                    <LuScale aria-hidden="true" />
                                    <h2>{totalCriterios} critérios analisados</h2>
                                    <p>Pesos definidos pelas suas respostas no questionário. Os critérios de peso alto contam mais no score final.</p>
                                </TopoResumo>
                                <Legenda>
                                    <li><Amostra $cor="var(--roxo-moradia)" /> Melhor resultado</li>
                                    <li><Amostra $cor="#CBD5E1" /> Demais cidades</li>
                                </Legenda>
                            </Resumo>

                            {itens.map(({ resultado, indice, cidade }, posicao) => {
                                const melhor = posicao === 0;
                                const foto = cidade?.foto;
                                return (
                                    <CartaoCidade key={resultado.ibge} $melhor={melhor} aria-label={resultado.cidade}>
                                        <Foto
                                            $fundo={fundoComFoto(foto?.url, FUNDOS_CIDADE[posicao % FUNDOS_CIDADE.length])}
                                            title={foto ? `${textoDoCredito(foto)} (Wikimedia Commons)` : undefined}
                                        >
                                            <TopoFoto>
                                                {melhor && indice !== null && <SeloMelhor><LuTrophy aria-hidden="true" /> Melhor opção</SeloMelhor>}
                                                {indice === null && (
                                                    <SeloFora title={`Não passa nos seus filtros: ${filtrosReprovados(respostas, cidade).join(', ')}`}>
                                                        Fora do ranking
                                                    </SeloFora>
                                                )}
                                                <AcoesFoto>
                                                    <PilulaMatch>{resultado.match}% match</PilulaMatch>
                                                    {podeRemover && (
                                                        <BotaoRemover
                                                            type="button"
                                                            onClick={() => onAlterarComparadas(comparadas.filter((ibge) => ibge !== resultado.ibge))}
                                                            title="Remover da comparação"
                                                            aria-label={`Remover ${nomes[posicao]} da comparação`}
                                                        >
                                                            <LuX aria-hidden="true" />
                                                        </BotaoRemover>
                                                    )}
                                                </AcoesFoto>
                                            </TopoFoto>
                                            <NomeFoto>
                                                <h2>{nomes[posicao]}</h2>
                                                {cidade && <p>{nomeDoEstado(cidade.uf)}</p>}
                                            </NomeFoto>
                                        </Foto>
                                        <CorpoCartao>
                                            <Vitorias>
                                                <strong>Vence em {vitorias[posicao]} de {totalCriterios}</strong>
                                                <span>critérios</span>
                                            </Vitorias>
                                            <BotaoVerCidade type="button" $principal={melhor} onClick={() => onVerCidade(resultado.ibge)} disabled={!cidade}>
                                                Ver cidade <LuArrowUpRight aria-hidden="true" />
                                            </BotaoVerCidade>
                                        </CorpoCartao>
                                    </CartaoCidade>
                                );
                            })}
                        </Grade>

                        <Tabela aria-label="Comparação por critério">
                            <Secao><LuListChecks aria-hidden="true" /> Critérios do seu perfil</Secao>
                            {pilares.map(({ id, rotulo }) => {
                                const vencedores = vencedoresDoPilar(comparados, id);
                                const estimado = comparados.some(({ notas }) => notas[id].estimado);
                                return (
                                    <Linha key={id} $colunas={itens.length}>
                                        <RotuloLinha>
                                            <strong>
                                                {rotulo}
                                                {estimado && <SeloEstimado title={comoFoiEstimado(id, fontes)}>Estimado</SeloEstimado>}
                                            </strong>
                                            <SeloPeso>{ROTULO_PESO[comparados[0].notas[id].peso]}</SeloPeso>
                                        </RotuloLinha>
                                        {comparados.map((resultado, posicao) => {
                                            const avaliacao = resultado.notas[id];
                                            const vence = vencedores.includes(posicao);
                                            return (
                                                <CelulaNota
                                                    key={resultado.ibge}
                                                    $vence={vence}
                                                    title={fraseDoPilar(id, avaliacao, respostas) || undefined}
                                                >
                                                    <Trilho aria-hidden="true">
                                                        {!avaliacao.dadoIndisponivel && <Preenchimento $valor={avaliacao.nota} $vence={vence} />}
                                                    </Trilho>
                                                    <ValorNota $vence={vence}>
                                                        {vence && <LuTrophy role="img" aria-label="Melhor resultado" />}
                                                        {avaliacao.dadoIndisponivel ? '—' : `${avaliacao.nota}%`}
                                                    </ValorNota>
                                                </CelulaNota>
                                            );
                                        })}
                                    </Linha>
                                );
                            })}

                            <Secao><LuWallet aria-hidden="true" /> Custo e dia a dia</Secao>
                            {linhasDiaADia.map(({ rotulo, valores, formatar, sufixo, destaque, selo, dica }) => (
                                <Linha key={rotulo} $colunas={itens.length}>
                                    <RotuloLinha title={dica}><strong>{rotulo}</strong></RotuloLinha>
                                    {valores.map((valor, posicao) => (
                                        <CelulaValor
                                            key={comparados[posicao].ibge}
                                            $destaque={destaque === posicao}
                                            $negativo={!ausente(valor) && valor < 0}
                                        >
                                            <strong>{ausente(valor) ? '—' : formatar(valor)}</strong>
                                            {sufixo && !ausente(valor) && <span>{sufixo}</span>}
                                            {destaque === posicao && <SeloDestaque>{selo}</SeloDestaque>}
                                        </CelulaValor>
                                    ))}
                                </Linha>
                            ))}
                        </Tabela>
                    </Comparacao>
                </Rolagem>

                <Veredito aria-labelledby="titulo-veredito">
                    <TextoVeredito>
                        <Sobrancelha><LuSparkles aria-hidden="true" /> Nossa recomendação</Sobrancelha>
                        <h2 id="titulo-veredito">{titulo}</h2>
                        <p>{texto}</p>
                    </TextoVeredito>
                    <AcoesVeredito>
                        <BotaoVeredito type="button" onClick={() => onVerCidade(itens[0].resultado.ibge)} disabled={!itens[0].cidade}>
                            Explorar {nomes[0]} <LuArrowRight aria-hidden="true" />
                        </BotaoVeredito>
                        <BotaoVeredito type="button" $vidro onClick={onVerAnalise}>Ver análise completa</BotaoVeredito>
                    </AcoesVeredito>
                </Veredito>
            </Conteudo>
        </Pagina>
    );
}

export default CompararCidades
