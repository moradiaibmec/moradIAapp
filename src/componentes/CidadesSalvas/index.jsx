import { useState } from 'react';
import styled from "styled-components"
import { FiMapPin, FiPlus, FiX } from 'react-icons/fi';
import BuscaCidade from '../BuscaCidade/index.jsx';

const Lista = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const ItemCidade = styled.li`
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding: 16px;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    background-color: #FFFFFF;
`;

const CaixaIcone = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-size: 20px;
`;

const TextosCidade = styled.div`
    flex: 1;
    min-width: 0;
`;

const NomeCidade = styled.p`
    overflow: hidden;
    color: #111827;
    font-size: 16px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const UfCidade = styled.p`
    margin-top: 2px;
    color: #6B7280;
    font-size: 12px;
`;

const BotaoRemover = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    background-color: #FFFFFF;
    color: #6B7280;
    font-size: 16px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;

    &:hover:not(:disabled) {
        border-color: #FCA5A5;
        color: #DC2626;
    }

    &:disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

const Vazio = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 32px 24px;
    border: 1px dashed #E5E7EB;
    border-radius: 16px;
    background-color: #F8FAFC;
    color: #6B7280;
    font-size: 14px;
    text-align: center;
`;

const Erro = styled.p`
    color: #DC2626;
    font-size: 13px;
    font-weight: 600;
`;

function separarCidade(cidade) {
    const corte = cidade.lastIndexOf(', ');
    return { nome: cidade.slice(0, corte), uf: cidade.slice(corte + 2) };
}

function CidadesSalvas({ cidades, onSalvar }) {
    const [salvas, setSalvas] = useState(cidades);
    const [salvando, setSalvando] = useState(false);
    const [erroSalvar, setErroSalvar] = useState(false);

    async function atualizar(novaLista) {
        const anterior = salvas;
        setSalvas(novaLista);
        setSalvando(true);
        setErroSalvar(false);
        const { error } = await onSalvar(novaLista);
        setSalvando(false);
        if (error) {
            setSalvas(anterior);
            setErroSalvar(true);
        }
    }

    function salvar(cidade) {
        if (salvando || salvas.includes(cidade)) return;
        atualizar([...salvas, cidade]);
    }

    function remover(cidade) {
        atualizar(salvas.filter((item) => item !== cidade));
    }

    return (
        <>
            <BuscaCidade
                onEscolher={salvar}
                indisponiveis={salvas}
                rotuloAcao="Salvar"
                iconeAcao={<FiPlus aria-hidden="true" />}
                rotuloIndisponivel="Salva"
                rotuloAcessivel="Pesquisar cidade para salvar"
                desabilitada={salvando}
            />

            {erroSalvar && <Erro role="alert">Não foi possível salvar. Tente novamente.</Erro>}

            {salvas.length > 0 ? (
                <Lista aria-label="Cidades salvas">
                    {salvas.map((cidade) => {
                        const { nome, uf } = separarCidade(cidade);
                        return (
                            <ItemCidade key={cidade}>
                                <CaixaIcone><FiMapPin /></CaixaIcone>
                                <TextosCidade>
                                    <NomeCidade title={nome}>{nome}</NomeCidade>
                                    <UfCidade>{uf}</UfCidade>
                                </TextosCidade>
                                <BotaoRemover
                                    type="button"
                                    onClick={() => remover(cidade)}
                                    disabled={salvando}
                                    title="Remover"
                                    aria-label={`Remover ${cidade}`}
                                >
                                    <FiX />
                                </BotaoRemover>
                            </ItemCidade>
                        );
                    })}
                </Lista>
            ) : (
                <Vazio>
                    <CaixaIcone><FiMapPin /></CaixaIcone>
                    Você ainda não salvou nenhuma cidade. Pesquise acima para começar.
                </Vazio>
            )}
        </>
    );
}

export default CidadesSalvas
