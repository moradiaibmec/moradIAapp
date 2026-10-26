import { useState } from 'react';
import styled from "styled-components"
import { FiCompass, FiLogOut, FiPlus } from 'react-icons/fi';
import { sair } from '../../lib/supabase.js';

const Cabecalho = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    height: 80px;
    padding: 0 80px;
    background-color: #FFFFFF;
    border-bottom: 1px solid #E5E7EB;
    font-family: var(--fonte-moradia);

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
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background-color: var(--roxo-moradia);
    color: #FFFFFF;
    font-size: 18px;
`;

const Navegacao = styled.nav`
    display: flex;
    align-items: center;
    gap: 32px;

    @media (max-width: 900px) {
        display: none;
    }
`;

const LinkNavegacao = styled.button`
    padding: 0;
    border: none;
    background: none;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: ${({ $ativo }) => ($ativo ? 700 : 500)};
    color: ${({ $ativo }) => ($ativo ? 'var(--roxo-moradia)' : '#6B7280')};
    cursor: ${({ $ativo, $disponivel }) => ($ativo ? 'default' : $disponivel ? 'pointer' : 'not-allowed')};
    transition: color 0.2s;

    &:hover {
        color: ${({ $ativo, $disponivel }) => ($ativo || $disponivel ? 'var(--roxo-moradia)' : '#6B7280')};
    }
`;

const Acoes = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const BotaoNovaAnalise = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #E0E7FF;
    }

    @media (max-width: 600px) {
        span {
            display: none;
        }
    }
`;

const BotaoAvatar = styled.button`
    display: flex;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    box-shadow: ${({ $ativo }) => ($ativo ? '0 0 0 2px #FFFFFF, 0 0 0 4px var(--roxo-moradia)' : 'none')};
    cursor: ${({ $ativo }) => ($ativo ? 'default' : 'pointer')};
    transition: box-shadow 0.2s;

    &:hover,
    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px var(--roxo-moradia);
    }
`;

const Avatar = styled.img`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
`;

const AvatarIniciais = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-size: 14px;
    font-weight: 700;
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

    &:disabled {
        opacity: 0.6;
        cursor: default;
    }
`;

// Links sem `pagina` ainda não têm tela implementada.
const linksNavegacao = [
    { rotulo: 'Dashboard', pagina: 'dashboard' },
    { rotulo: 'Minhas cidades' },
    { rotulo: 'Comparar', pagina: 'comparar' },
    { rotulo: 'Meu perfil', pagina: 'perfil' },
];

// `comparacaoIndisponivel`: a pessoa ainda não tem análise para comparar.
function CabecalhoApp({ usuario, paginaAtiva, onNavegar, onNovaAnalise, comparacaoIndisponivel = false }){
    const [saindo, setSaindo] = useState(false);
    const { full_name, avatar_url } = usuario.user_metadata ?? {};
    const inicial = (full_name ?? usuario.email ?? '?').charAt(0).toUpperCase();

    async function handleSair() {
        setSaindo(true);
        await sair();
    }

    return(
        <Cabecalho>
            <Logo>
                <IconeLogo><FiCompass /></IconeLogo>
                <p>Morad<span>IA</span></p>
            </Logo>

            <Navegacao>
                {linksNavegacao.map(({ rotulo, pagina }) => {
                    const ativo = pagina !== undefined && pagina === paginaAtiva;
                    const bloqueada = pagina === 'comparar' && comparacaoIndisponivel;
                    const disponivel = Boolean(pagina && onNavegar) && !bloqueada;
                    return (
                        <LinkNavegacao
                            key={rotulo}
                            $ativo={ativo}
                            $disponivel={disponivel}
                            aria-current={ativo ? 'page' : undefined}
                            title={disponivel ? undefined : bloqueada ? 'Faça uma análise primeiro' : 'Em breve'}
                            onClick={disponivel && !ativo ? () => onNavegar(pagina) : undefined}
                        >
                            {rotulo}
                        </LinkNavegacao>
                    );
                })}
            </Navegacao>

            <Acoes>
                <BotaoNovaAnalise onClick={onNovaAnalise} aria-label="Nova Análise">
                    <FiPlus /> <span>Nova Análise</span>
                </BotaoNovaAnalise>
                <BotaoAvatar
                    type="button"
                    onClick={onNavegar && paginaAtiva !== 'perfil' ? () => onNavegar('perfil') : undefined}
                    $ativo={paginaAtiva === 'perfil'}
                    title="Meu perfil"
                    aria-label="Meu perfil"
                    aria-current={paginaAtiva === 'perfil' ? 'page' : undefined}
                >
                    {avatar_url
                        ? <Avatar src={avatar_url} alt="" referrerPolicy="no-referrer" />
                        : <AvatarIniciais aria-hidden="true">{inicial}</AvatarIniciais>}
                </BotaoAvatar>
                <BotaoSair onClick={handleSair} disabled={saindo} title="Sair" aria-label="Sair">
                    <FiLogOut />
                </BotaoSair>
            </Acoes>
        </Cabecalho>
    )
}

export default CabecalhoApp
