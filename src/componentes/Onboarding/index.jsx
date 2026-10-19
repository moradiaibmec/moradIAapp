import { useState } from 'react';
import styled from "styled-components"
import { FiCheck, FiClock, FiCompass, FiX } from 'react-icons/fi';
import { cidades, versaoDados } from '../../dados/cidades.js';
import { salvarAnalise } from '../../lib/supabase.js';
import { montarAnalise } from '../../analise/analises.js';
import { calcularMatch } from '../../analise/match.js';
import { aplicarFiltros } from '../../analise/filtros.js';
import { sugerirPesos } from '../../analise/prePreenchimento.js';
import {
    criarRespostasIniciais, etapaAnterior, etapasVisiveis, limparEtapa, limparEtapasOcultas, podeAvancar, proximaEtapa,
} from '../../analise/respostas.js';
import { Ajuda, TituloEtapa } from './estilos.js';
import { ContadorCidades } from './elementos.jsx';
import EtapaMomento from './EtapaMomento.jsx';
import EtapaOrcamento from './EtapaOrcamento.jsx';
import EtapaOnde from './EtapaOnde.jsx';
import EtapaTrabalho from './EtapaTrabalho.jsx';
import EtapaClima from './EtapaClima.jsx';
import EtapaPrioridades from './EtapaPrioridades.jsx';

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F8FAFC;
    font-family: var(--fonte-moradia);
`;

const Topo = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 80px;
    padding: 0 80px;
    border-bottom: 1px solid #E5E7EB;
    background-color: #FFFFFF;

    @media (max-width: 900px) {
        padding: 0 16px;
    }
`;

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 700;
    color: #111827;

    span {
        color: var(--roxo-moradia);
    }
`;

const IconeLogo = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background-color: var(--roxo-moradia);
    color: #FFFFFF;
    font-size: 16px;
`;

const LadoDireito = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;

    @media (max-width: 600px) {
        gap: 12px;
    }
`;

const Progresso = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #6B7280;
`;

const TrilhaProgresso = styled.div`
    width: 160px;
    height: 6px;
    overflow: hidden;
    border-radius: 3px;
    background-color: #E5E7EB;

    div {
        width: ${({ $valor }) => $valor}%;
        height: 100%;
        background-color: var(--roxo-moradia);
        transition: width 0.3s;
    }

    @media (max-width: 600px) {
        width: 96px;
    }
`;

const Tempo = styled.p`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-size: 12px;
    font-weight: 700;

    @media (max-width: 600px) {
        display: none;
    }
`;

const BotaoSair = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    background-color: #FFFFFF;
    color: #6B7280;
    font-size: 16px;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
        color: var(--roxo-moradia);
    }
`;

const Cartao = styled.main`
    display: flex;
    flex-direction: column;
    gap: 40px;
    box-sizing: border-box;
    max-width: 1000px;
    margin: 48px auto 80px;
    padding: 64px 64px 48px;
    border-radius: 24px;
    background-color: #FFFFFF;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

    @media (max-width: 1040px) {
        margin: 24px 16px 48px;
        padding: 32px 24px;
    }
`;

const Conteudo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
`;

const Rodape = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    padding-top: 24px;
    border-top: 1px solid #E5E7EB;
`;

const BotaoPular = styled.button`
    padding: 0;
    border: none;
    background: none;
    color: #6B7280;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        color: var(--roxo-moradia);
    }
`;

const Acoes = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-left: auto;

    @media (max-width: 500px) {
        width: 100%;

        button {
            flex: 1;
        }
    }
`;

const Botao = styled.button`
    padding: 12px 24px;
    border-radius: 8px;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const BotaoVoltar = styled(Botao)`
    border: 1px solid #E5E7EB;
    background-color: #FFFFFF;
    color: #111827;
`;

const BotaoContinuar = styled(Botao)`
    border: 1px solid var(--roxo-moradia);
    background-color: var(--roxo-moradia);
    color: #FFFFFF;

    &:hover:not(:disabled) {
        background-color: #4338CA;
    }
`;

const Concluido = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;

    p {
        max-width: 520px;
    }
`;

const StatusSalvamento = styled.p`
    font-size: 13px;
    font-weight: 600;
    color: ${({ $erro }) => ($erro ? '#DC2626' : '#10B981')};
`;

const IconeConcluido = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background-color: #ECFDF5;
    color: #10B981;
    font-size: 28px;
`;

const ETAPAS_INFO = {
    momento: { titulo: 'Primeiro, queremos conhecer o seu momento.', Componente: EtapaMomento },
    orcamento: { titulo: 'Quanto você pretende gastar para viver?', Componente: EtapaOrcamento },
    onde: { titulo: 'Onde você topa morar?', Componente: EtapaOnde },
    trabalho: { titulo: 'Sua cidade precisa acompanhar seus objetivos.', Componente: EtapaTrabalho },
    clima: { titulo: 'Qual clima combina com você?', Componente: EtapaClima },
    prioridades: { titulo: 'Agora, o que realmente importa para você?', Componente: EtapaPrioridades },
};

// Etapas que já mostram o contador de cidades no próprio conteúdo.
const ETAPAS_COM_CONTADOR = ['orcamento', 'onde'];

function isObjetoSimples(valor) {
    return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}

function Onboarding({ usuario, onSair, onAnaliseSalva }) {
    const [respostas, setRespostas] = useState(criarRespostasIniciais);
    const [etapaAtual, setEtapaAtual] = useState('momento');
    const [pesosAjustados, setPesosAjustados] = useState(false);
    // null enquanto responde; depois { status: 'salvando' | 'salva' | 'erro', respostas, resultados }.
    const [conclusao, setConclusao] = useState(null);
    const concluido = conclusao !== null;

    const etapas = etapasVisiveis(respostas);
    const posicao = etapas.indexOf(etapaAtual) + 1;
    const restantes = aplicarFiltros(respostas, cidades).length;
    const { titulo, Componente } = ETAPAS_INFO[etapaAtual];
    const ultimaEtapa = proximaEtapa(etapas, etapaAtual) === null;
    const avancoLiberado = podeAvancar(etapaAtual, restantes, ultimaEtapa);

    // `valor` pode ser uma função que recebe o estado atual da seção (para atualizações assíncronas).
    function alterar(secao, valor) {
        setRespostas((atuais) => {
            const novo = typeof valor === 'function' ? valor(atuais[secao]) : valor;
            return {
                ...atuais,
                [secao]: isObjetoSimples(atuais[secao]) && isObjetoSimples(novo) ? { ...atuais[secao], ...novo } : novo,
            };
        });
    }

    function alterarPeso(pilar, nivel) {
        setPesosAjustados(true);
        alterar('pesos', { [pilar]: nivel });
    }

    function irPara(etapa) {
        setEtapaAtual(etapa);
        window.scrollTo(0, 0);
    }

    // Os pesos só são sugeridos enquanto a pessoa não os ajustou à mão.
    function avancar(base) {
        const limpas = limparEtapasOcultas(base);
        const proxima = proximaEtapa(etapasVisiveis(limpas), etapaAtual);
        if (!proxima) {
            setRespostas(limpas);
            salvar(limpas, calcularMatch(limpas, cidades));
            window.scrollTo(0, 0);
            return;
        }
        const sugerir = proxima === 'prioridades' && !pesosAjustados;
        setRespostas(sugerir ? { ...limpas, pesos: sugerirPesos(limpas).pesos } : limpas);
        irPara(proxima);
    }

    async function salvar(final, resultados) {
        setConclusao({ status: 'salvando', respostas: final, resultados });
        const { error } = await salvarAnalise(montarAnalise(final, resultados, versaoDados));
        setConclusao({ status: error ? 'erro' : 'salva', respostas: final, resultados });
        if (!error) onAnaliseSalva?.();
    }

    function voltar() {
        const anterior = etapaAnterior(etapas, etapaAtual);
        if (anterior) irPara(anterior);
        else onSair();
    }

    function pular() {
        if (etapaAtual === 'prioridades') {
            setPesosAjustados(false);
            avancar({ ...respostas, pesos: sugerirPesos(respostas).pesos });
            return;
        }
        avancar(limparEtapa(respostas, etapaAtual));
    }

    return (
        <Pagina>
            <Topo>
                <Logo>
                    <IconeLogo><FiCompass /></IconeLogo>
                    <p>Morad<span>IA</span></p>
                </Logo>
                <LadoDireito>
                    {!concluido && (
                        <Progresso>
                            Etapa {posicao} de {etapas.length}
                            <TrilhaProgresso
                                $valor={(posicao / etapas.length) * 100}
                                role="progressbar"
                                aria-valuemin={1}
                                aria-valuemax={etapas.length}
                                aria-valuenow={posicao}
                                aria-label="Progresso da análise"
                            >
                                <div />
                            </TrilhaProgresso>
                        </Progresso>
                    )}
                    <Tempo><FiClock aria-hidden="true" /> ~3 min</Tempo>
                    <BotaoSair type="button" onClick={onSair} title="Sair da análise" aria-label="Sair da análise">
                        <FiX />
                    </BotaoSair>
                </LadoDireito>
            </Topo>

            <Cartao>
                {concluido ? (
                    <Concluido>
                        <IconeConcluido><FiCheck /></IconeConcluido>
                        <TituloEtapa>Tudo pronto!</TituloEtapa>
                        <Ajuda>
                            Sua cidade com mais match é <strong>{conclusao.resultados[0].cidade}</strong>,
                            com {conclusao.resultados[0].match}%. {conclusao.resultados.length}{' '}
                            {conclusao.resultados.length === 1 ? 'cidade atende' : 'cidades atendem'} aos seus critérios.
                        </Ajuda>
                        <StatusSalvamento $erro={conclusao.status === 'erro'} role="status">
                            {conclusao.status === 'salvando' && 'Salvando sua análise…'}
                            {conclusao.status === 'salva' && 'Análise salva no seu histórico.'}
                            {conclusao.status === 'erro' && 'Não foi possível salvar a análise.'}
                        </StatusSalvamento>
                        {conclusao.status === 'erro' ? (
                            <BotaoContinuar type="button" onClick={() => salvar(conclusao.respostas, conclusao.resultados)}>
                                Tentar de novo
                            </BotaoContinuar>
                        ) : (
                            <BotaoContinuar type="button" onClick={onSair} disabled={conclusao.status === 'salvando'}>
                                Voltar ao dashboard
                            </BotaoContinuar>
                        )}
                    </Concluido>
                ) : (
                    <>
                        <TituloEtapa>{titulo}</TituloEtapa>
                        <Conteudo>
                            {Componente && (
                                <Componente
                                    respostas={respostas}
                                    alterar={alterar}
                                    alterarPeso={alterarPeso}
                                    usuario={usuario}
                                />
                            )}
                        </Conteudo>
                        {restantes === 0 && !ETAPAS_COM_CONTADOR.includes(etapaAtual) && (
                            <ContadorCidades respostas={respostas} cidades={cidades} />
                        )}
                        <Rodape>
                            <BotaoPular type="button" onClick={pular}>Pular esta etapa</BotaoPular>
                            <Acoes>
                                <BotaoVoltar type="button" onClick={voltar}>Voltar</BotaoVoltar>
                                <BotaoContinuar
                                    type="button"
                                    onClick={() => avancar(respostas)}
                                    disabled={!avancoLiberado}
                                    title={avancoLiberado ? undefined : 'Nenhuma cidade atende aos seus filtros'}
                                >
                                    {ultimaEtapa ? 'Encontrar minha cidade' : 'Continuar'}
                                </BotaoContinuar>
                            </Acoes>
                        </Rodape>
                    </>
                )}
            </Cartao>
        </Pagina>
    );
}

export default Onboarding
