import styled from "styled-components"
import { MAXIMO_ESSENCIAIS, NIVEIS_IMPORTANCIA, PILARES } from '../../analise/opcoes.js';
import { sugerirPesos } from '../../analise/prePreenchimento.js';
import { Ajuda } from './estilos.js';

const Cabecalho = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
`;

const ContadorEssenciais = styled.p`
    padding: 6px 12px;
    border-radius: 8px;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-size: 13px;
    font-weight: 700;
`;

const AvisoLimite = styled.p`
    padding: 12px 16px;
    border-radius: 12px;
    background-color: #FFFBEB;
    color: #B45309;
    font-size: 14px;
`;

const Lista = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const LinhaPilar = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 20px;
    border: 1px solid #E5E7EB;
    border-radius: 16px;

    @media (max-width: 700px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const TextosPilar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
`;

const NomePilar = styled.p`
    font-size: 16px;
    font-weight: 700;
    color: #111827;
`;

const DescricaoPilar = styled.p`
    font-size: 13px;
    color: #6B7280;
`;

const Motivo = styled.p`
    font-size: 12px;
    font-weight: 600;
    color: var(--roxo-moradia);
`;

const Segmentado = styled.div`
    display: flex;
    flex-shrink: 0;
    min-width: 0;
    gap: 4px;
    padding: 4px;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
`;

const CORES_NIVEL = {
    essencial: { fundo: 'var(--roxo-moradia)', texto: '#FFFFFF' },
    importante: { fundo: '#EEF2FF', texto: 'var(--roxo-moradia)' },
    tantoFaz: { fundo: '#F3F4F6', texto: '#6B7280' },
};

const BotaoNivel = styled.button`
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    background-color: ${({ $ativo, $nivel }) => ($ativo ? CORES_NIVEL[$nivel].fundo : 'transparent')};
    color: ${({ $ativo, $nivel }) => ($ativo ? CORES_NIVEL[$nivel].texto : '#6B7280')};
    font-family: var(--fonte-moradia);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;

    &:hover:not(:disabled):not([aria-checked='true']) {
        color: var(--roxo-moradia);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    @media (max-width: 500px) {
        min-width: 0;
        padding: 8px 4px;
        font-size: 12px;
        white-space: normal;
    }
`;

function EtapaPrioridades({ respostas, alterarPeso }) {
    const { pesos } = respostas;
    const { motivos } = sugerirPesos(respostas);
    const essenciais = Object.values(pesos).filter((nivel) => nivel === 'essencial').length;

    return (
        <>
            <Cabecalho>
                <Ajuda>
                    Já sugerimos uma combinação com base nas suas respostas. Ajuste à vontade: os essenciais pesam
                    3 vezes mais, e “Tanto faz” tira o pilar do cálculo.
                </Ajuda>
                <ContadorEssenciais>Essenciais: {essenciais} de {MAXIMO_ESSENCIAIS}</ContadorEssenciais>
            </Cabecalho>

            {essenciais >= MAXIMO_ESSENCIAIS && (
                <AvisoLimite role="status">
                    Você já marcou {MAXIMO_ESSENCIAIS} essenciais. Para marcar outro, mude um deles para Importante.
                </AvisoLimite>
            )}

            <Lista>
                {PILARES.map(({ id, rotulo, descricao }) => (
                    <LinhaPilar key={id}>
                        <TextosPilar>
                            <NomePilar>{rotulo}</NomePilar>
                            <DescricaoPilar>{descricao}</DescricaoPilar>
                            {motivos[id] && <Motivo>Sugerido: {motivos[id]}</Motivo>}
                        </TextosPilar>
                        <Segmentado role="radiogroup" aria-label={`Importância de ${rotulo}`}>
                            {NIVEIS_IMPORTANCIA.map((nivel) => {
                                const ativo = pesos[id] === nivel.id;
                                const bloqueado = nivel.id === 'essencial' && !ativo && essenciais >= MAXIMO_ESSENCIAIS;
                                return (
                                    <BotaoNivel
                                        key={nivel.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={ativo}
                                        $ativo={ativo}
                                        $nivel={nivel.id}
                                        disabled={bloqueado}
                                        title={bloqueado ? `Máximo de ${MAXIMO_ESSENCIAIS} essenciais` : undefined}
                                        onClick={() => alterarPeso(id, nivel.id)}
                                    >
                                        {nivel.rotulo}
                                    </BotaoNivel>
                                );
                            })}
                        </Segmentado>
                    </LinhaPilar>
                ))}
            </Lista>
        </>
    );
}

export default EtapaPrioridades
