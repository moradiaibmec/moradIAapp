import { useState } from 'react';
import styled from "styled-components"
import { FiMapPin } from 'react-icons/fi';
import { OPCOES_PRAIA, PORTES, RAIO_PADRAO_KM, RAIOS_KM, REGIOES, SIM_NAO } from '../../analise/opcoes.js';
import { coordenadasDe } from '../../analise/coordenadas.js';
import { cidades } from '../../dados/cidades.js';
import BuscaCidade from '../BuscaCidade/index.jsx';
import { Ajuda, Pergunta } from './estilos.js';
import { ContadorCidades, GrupoOpcoes } from './elementos.jsx';

const CidadeEscolhida = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 2px solid var(--roxo-moradia);
    border-radius: 12px;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-size: 14px;
    font-weight: 700;

    button {
        margin-left: auto;
        padding: 0;
        border: none;
        background: none;
        color: #6B7280;
        font-family: var(--fonte-moradia);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
    }
`;

const Erro = styled.p`
    color: #DC2626;
    font-size: 13px;
    font-weight: 600;
`;

const opcoesRaio = RAIOS_KM.map((km) => ({ id: String(km), rotulo: `Até ${km} km` }));

function EtapaOnde({ respostas, alterar, usuario }) {
    const { regioes, referencia, portes, praia } = respostas.onde;
    const [erroReferencia, setErroReferencia] = useState(null);
    const cidadeDoPerfil = usuario.user_metadata?.perfil?.cidadeAtual?.trim();

    async function escolherReferencia(cidade, { silencioso = false } = {}) {
        const raioKm = referencia?.raioKm ?? RAIO_PADRAO_KM;
        const coordenadas = await coordenadasDe(cidade).catch(() => null);
        if (!coordenadas) {
            if (!silencioso) setErroReferencia('Não encontramos a localização dessa cidade. Escolha outra.');
            return;
        }
        setErroReferencia(null);
        alterar('onde', { referencia: { cidade, ...coordenadas, raioKm } });
    }

    function alternarProximidade(valor) {
        setErroReferencia(null);
        if (valor === 'nao') {
            alterar('onde', { referencia: null });
            return;
        }
        alterar('onde', { referencia: { cidade: null, lat: null, lon: null, raioKm: RAIO_PADRAO_KM } });
        if (cidadeDoPerfil) escolherReferencia(cidadeDoPerfil, { silencioso: true });
    }

    return (
        <>
            <GrupoOpcoes
                legenda="Em quais regiões você toparia morar?"
                ajuda="Desmarque as regiões que não quer considerar. Pelo menos uma precisa ficar marcada."
                opcoes={REGIOES}
                valor={regioes}
                onChange={(valor) => alterar('onde', { regioes: valor })}
                multipla
                minimo={1}
                colunas={5}
            />

            <GrupoOpcoes
                legenda="Quer ficar perto de alguma cidade?"
                ajuda="Por exemplo, a cidade onde você mora hoje ou onde mora sua família."
                opcoes={SIM_NAO}
                valor={referencia ? 'sim' : 'nao'}
                onChange={alternarProximidade}
                colunas={2}
            />

            {referencia && (
                <Pergunta>
                    <legend>Perto de qual cidade?</legend>
                    {referencia.cidade ? (
                        <CidadeEscolhida>
                            <FiMapPin aria-hidden="true" /> {referencia.cidade}
                            <button
                                type="button"
                                onClick={() => alterar('onde', { referencia: { ...referencia, cidade: null, lat: null, lon: null } })}
                            >
                                Trocar
                            </button>
                        </CidadeEscolhida>
                    ) : (
                        <BuscaCidade onEscolher={escolherReferencia} rotuloAcessivel="Pesquisar cidade de referência" />
                    )}
                    {erroReferencia && <Erro role="alert">{erroReferencia}</Erro>}
                    <GrupoOpcoes
                        legenda="A que distância, no máximo?"
                        ajuda="Distância em linha reta."
                        opcoes={opcoesRaio}
                        valor={String(referencia.raioKm)}
                        onChange={(id) => alterar('onde', { referencia: { ...referencia, raioKm: Number(id) } })}
                    />
                </Pergunta>
            )}

            <GrupoOpcoes
                legenda="De que tamanho de cidade você gosta?"
                ajuda="Pode marcar mais de um."
                opcoes={PORTES}
                valor={portes}
                onChange={(valor) => alterar('onde', { portes: valor })}
                multipla
                minimo={1}
            />

            <GrupoOpcoes
                legenda="E praia?"
                opcoes={OPCOES_PRAIA}
                valor={praia}
                onChange={(valor) => alterar('onde', { praia: valor })}
            />

            <Ajuda>Indispensável deixa só cidades litorâneas no ranking; “Seria bom” dá um bônus a elas.</Ajuda>

            <ContadorCidades respostas={respostas} cidades={cidades} />
        </>
    );
}

export default EtapaOnde
