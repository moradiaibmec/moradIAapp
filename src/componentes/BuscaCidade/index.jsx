import { useEffect, useId, useRef, useState } from 'react';
import styled from "styled-components"
import { FiSearch } from 'react-icons/fi';
import { buscarCidades, carregarMunicipios } from './busca.js';

const Busca = styled.div`
    position: relative;
`;

const IconeBusca = styled(FiSearch)`
    position: absolute;
    top: 50%;
    left: 16px;
    color: #9CA3AF;
    font-size: 16px;
    transform: translateY(-50%);
    pointer-events: none;
`;

const EntradaBusca = styled.input`
    width: 100%;
    box-sizing: border-box;
    padding: 12px 16px 12px 44px;
    border: 1px solid ${({ $aberta }) => ($aberta ? 'var(--roxo-moradia)' : '#E5E7EB')};
    border-radius: 8px;
    background-color: #FFFFFF;
    box-shadow: ${({ $aberta }) => ($aberta ? '0 0 0 3px #EEF2FF' : 'none')};
    color: #111827;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
        outline: none;
        border-color: var(--roxo-moradia);
        box-shadow: 0 0 0 3px #EEF2FF;
    }

    &::placeholder {
        color: #9CA3AF;
    }
`;

const Sugestoes = styled.ul`
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0;
    padding: 6px;
    list-style: none;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    background-color: #FFFFFF;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
`;

const Sugestao = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 8px;
    background-color: ${({ $destacada }) => ($destacada ? '#F8FAFC' : 'transparent')};
    color: ${({ $salva }) => ($salva ? '#9CA3AF' : '#111827')};
    font-size: 14px;
    cursor: ${({ $salva }) => ($salva ? 'default' : 'pointer')};

    span:last-child {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
        color: ${({ $salva }) => ($salva ? '#9CA3AF' : 'var(--roxo-moradia)')};
        font-size: 13px;
        font-weight: 600;
    }
`;

const MensagemSugestoes = styled.li`
    padding: 10px 12px;
    color: #6B7280;
    font-size: 14px;
`;

function BuscaCidade({
    onEscolher, indisponiveis = [], rotuloAcao = 'Escolher', iconeAcao = null,
    rotuloIndisponivel = 'Escolhida', placeholder = 'Pesquise uma cidade pelo nome', rotuloAcessivel, desabilitada = false,
}) {
    const [termo, setTermo] = useState('');
    const [municipios, setMunicipios] = useState(null);
    const [erroCarregar, setErroCarregar] = useState(false);
    const [aberta, setAberta] = useState(false);
    const [destaque, setDestaque] = useState(0);
    const busca = useRef(null);
    const idSugestoes = useId();

    const sugestoes = municipios ? buscarCidades(municipios, termo) : [];
    const mostrarSugestoes = aberta && termo.trim() !== '';

    useEffect(() => {
        if (!mostrarSugestoes) return;
        function fecharSeFora(evento) {
            if (!busca.current.contains(evento.target)) setAberta(false);
        }
        document.addEventListener('mousedown', fecharSeFora);
        return () => document.removeEventListener('mousedown', fecharSeFora);
    }, [mostrarSugestoes]);

    function prepararBusca() {
        if (municipios) return;
        carregarMunicipios()
            .then(setMunicipios)
            .catch(() => setErroCarregar(true));
    }

    function escolher(cidade) {
        if (!cidade || desabilitada || indisponiveis.includes(cidade)) return;
        onEscolher(cidade);
        setTermo('');
        setAberta(false);
    }

    function handleTeclado(evento) {
        if (!mostrarSugestoes || sugestoes.length === 0) return;
        const acoes = {
            ArrowDown: () => setDestaque((atual) => Math.min(atual + 1, sugestoes.length - 1)),
            ArrowUp: () => setDestaque((atual) => Math.max(atual - 1, 0)),
            Enter: () => escolher(sugestoes[destaque]),
            Escape: () => setAberta(false),
        };
        if (acoes[evento.key]) {
            evento.preventDefault();
            acoes[evento.key]();
        }
    }

    return (
        <Busca ref={busca}>
            <IconeBusca aria-hidden="true" />
            <EntradaBusca
                type="search"
                role="combobox"
                aria-label={rotuloAcessivel}
                aria-autocomplete="list"
                aria-expanded={mostrarSugestoes}
                aria-controls={idSugestoes}
                aria-activedescendant={mostrarSugestoes && sugestoes.length > 0 ? `${idSugestoes}-${destaque}` : undefined}
                $aberta={mostrarSugestoes}
                value={termo}
                placeholder={placeholder}
                autoComplete="off"
                onFocus={() => { prepararBusca(); setAberta(true); }}
                onChange={(e) => { setTermo(e.target.value); setDestaque(0); setAberta(true); }}
                onKeyDown={handleTeclado}
            />

            {mostrarSugestoes && (
                <Sugestoes id={idSugestoes} role="listbox">
                    {erroCarregar && <MensagemSugestoes>Não foi possível carregar as cidades.</MensagemSugestoes>}
                    {!erroCarregar && !municipios && <MensagemSugestoes>Carregando cidades…</MensagemSugestoes>}
                    {municipios && sugestoes.length === 0 && (
                        <MensagemSugestoes>Nenhuma cidade encontrada para “{termo.trim()}”.</MensagemSugestoes>
                    )}
                    {sugestoes.map((cidade, indice) => {
                        const indisponivel = indisponiveis.includes(cidade);
                        return (
                            <Sugestao
                                key={cidade}
                                id={`${idSugestoes}-${indice}`}
                                role="option"
                                aria-selected={indice === destaque}
                                aria-disabled={indisponivel}
                                $destacada={indice === destaque}
                                $salva={indisponivel}
                                onMouseEnter={() => setDestaque(indice)}
                                onMouseDown={(evento) => evento.preventDefault()}
                                onClick={() => escolher(cidade)}
                            >
                                <span>{cidade}</span>
                                <span>{indisponivel ? rotuloIndisponivel : <>{iconeAcao} {rotuloAcao}</>}</span>
                            </Sugestao>
                        );
                    })}
                </Sugestoes>
            )}
        </Busca>
    );
}

export default BuscaCidade
