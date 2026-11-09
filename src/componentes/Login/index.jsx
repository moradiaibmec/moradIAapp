import { useState } from 'react';
import styled, { keyframes } from "styled-components"
import { FaGoogle, FaMicrosoft, FaApple, FaChevronLeft, FaMapMarkerAlt, FaLock} from 'react-icons/fa';
import FotoPersonaImg from '../../assets/persona.jpeg';
import { entrarCom } from '../../lib/supabase.js';

const NavContainer = styled.nav`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-top: 40px; /* Ajuste para o espaçamento no topo */
    font-family: "Inter", sans-serif;
`;

const VoltarLink = styled.a`
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6B7280;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
        color: var(--roxo-moradia);
    }
`;

const CampoApresentacao = styled.section`
    display: flex;
    flex-direction: row-reverse;
    gap: 10px;
    height: 100vh;
    overflow: hidden;
`
const DivTextos = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
`

const TextosApresentacao = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 560px;
`

const TituloApresentacao = styled.h2`
    margin: 0;
    line-height: 1.1;
    font-family: var(--fonte-moradia);
    font-weight: 700;
    font-size: 40px;
    letter-spacing: -0.02em;
    color: #111827;
`
const DescricaoApresentacao = styled.p`
    font-family: var(--fonte-moradia);
    text-align: left;
    font-weight: 400;
    font-size: 16px;
    line-height: 1.6;
    color: #6B7280;
`

const preencher = keyframes`
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
`;

const CartaoAnalise = styled.div`
    margin-top: 40px;
    max-width: 480px;
    padding: 24px;
    background-color: #FFFFFF;
    border: 1px solid #E0E7FF;
    border-radius: 16px;
    box-shadow: 0 24px 48px -24px rgba(79, 70, 229, 0.35);
    font-family: var(--fonte-moradia);
`;

const Perfil = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding-bottom: 20px;
    border-bottom: 1px solid #EEF2FF;
    color: #6B7280;
    font-size: 13px;
    line-height: 1.5;

    strong {
        display: block;
        color: #111827;
        font-size: 14px;
    }
`;

const FotoPersona = styled.img`
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #FFFFFF;
    box-shadow: 0 0 0 2px var(--roxo-moradia);
`;

const ListaCidades = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 16px;
`;

const ItemCidade = styled.li`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px;
    border-radius: 10px;
    background-color: ${({ $destaque }) => ($destaque ? '#EEF2FF' : 'transparent')};
`;

const LinhaCidade = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: #111827;

    span {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    svg {
        color: ${({ $destaque }) => ($destaque ? 'var(--roxo-moradia)' : '#9CA3AF')};
    }
`;

const Compatibilidade = styled.span`
    color: ${({ $destaque }) => ($destaque ? 'var(--roxo-moradia)' : '#6B7280')};
    font-variant-numeric: tabular-nums;
`;

const Trilho = styled.div`
    height: 6px;
    border-radius: 999px;
    background-color: ${({ $destaque }) => ($destaque ? '#FFFFFF' : '#F3F4F6')};
    overflow: hidden;
`;

const Barra = styled.div`
    height: 100%;
    width: ${({ $valor }) => $valor}%;
    border-radius: 999px;
    background-color: ${({ $destaque }) => ($destaque ? 'var(--roxo-moradia)' : '#A5B4FC')};
    transform-origin: left;
    animation: ${preencher} 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: ${({ $atraso }) => $atraso}s;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
`;

const Criterios = styled.div`
    margin-top: 28px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-family: var(--fonte-moradia);
    font-size: 13px;
    color: #6B7280;
`;

const ListaCriterios = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-width: 520px;

    li {
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid #C7D2FE;
        background-color: #FFFFFF;
        color: #3730A3;
        font-weight: 500;
    }
`;

const LoginSection = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 100px;
  height: 100vh;
  width: 25%;
  flex-shrink: 0;
  background-color: #FFF;
  border-bottom: solid 1px #E5E7EB;
`
const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
    margin-top: 72px;
    width: 100%;
    max-width: 450px;
`;

const CabecalhoFormulario = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const TituloFormulario = styled.h3`
    margin: 16px 0 0;
    font-family: var(--fonte-moradia), sans-serif;
    font-weight: 700;
    font-size: 24px;
    color: #111827;
`;

const DescricaoFormulario = styled.p`
    margin: 0;
    font-family: var(--fonte-moradia), sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: #6B7280;
    line-height: 1.5;
`;

const GrupoBotoes = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const BotaoSocial = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px 20px;
    background-color: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    font-family: "Inter", sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #111827;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;

    &:hover:not(:disabled) {
        background-color: #EEF2FF;
        border-color: #A5B4FC;
    }

    &:focus-visible {
        outline: 2px solid var(--roxo-moradia);
        outline-offset: 2px;
    }

    &:disabled {
        opacity: 0.6;
        cursor: default;
    }
`;

const BotaoEmBreve = styled(BotaoSocial)`
    &:disabled {
        opacity: 1;
        color: #9CA3AF;
        background-color: #F9FAFB;
        cursor: not-allowed;
    }
`;

const EtiquetaEmBreve = styled.span`
    padding: 2px 8px;
    border-radius: 999px;
    background-color: #EEF2FF;
    color: #3730A3;
    font-size: 11px;
    font-weight: 600;
`;

const MensagemErro = styled.p`
    font-family: var(--fonte-moradia);
    font-size: 13px;
    color: #B91C1C;
`;

const AvisoConta = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 10px;
    background-color: #EEF2FF;
    font-family: var(--fonte-moradia);
    font-size: 13px;
    line-height: 1.5;
    color: #4B5563;

    svg {
        flex-shrink: 0;
        margin-top: 2px;
        color: var(--roxo-moradia);
    }

    strong {
        color: #3730A3;
    }
`;

const TextoTermos = styled.p`
    font-family: "Inter", sans-serif;
    font-size: 12px;
    color: #9CA3AF;
    text-align: center;
    line-height: 1.5;
`;

const LinkTermos = styled.a`
    color: #9CA3AF;
    text-decoration: underline;
    cursor: pointer;

    &:hover {
        color: var(--roxo-moradia);
    }
`;

const cidadesExemplo = [
    { nome: "Curitiba, PR", valor: 94 },
    { nome: "Florianópolis, SC", valor: 89 },
    { nome: "Belo Horizonte, MG", valor: 83 },
];

const criterios = [
    "Custo de vida",
    "Vagas na sua área",
    "Segurança",
    "Transporte público",
    "Clima",
    "Lazer e cultura",
];

function Login(){
    const [provedorCarregando, setProvedorCarregando] = useState(null);
    const [erro, setErro] = useState('');

    async function handleEntrar(provedor) {
        setErro('');
        setProvedorCarregando(provedor);
        // Em caso de sucesso o navegador é redirecionado para o provedor
        const { error } = await entrarCom(provedor);
        if (error) {
            setErro('Não foi possível entrar agora. Tente novamente.');
            setProvedorCarregando(null);
        }
    }

    return(

        <CampoApresentacao>
        <LoginSection>
                <NavContainer>
                    <VoltarLink href="https://moradia-landing-page.vercel.app/">
                        <FaChevronLeft size={12} /> Voltar ao site
                    </VoltarLink>
                </NavContainer>

                <FormContainer>
                    <CabecalhoFormulario>
                        
                        <TituloFormulario>Acesse sua conta</TituloFormulario>
                        <DescricaoFormulario>
                            Entre ou crie sua conta com um clique para continuar sua jornada de descoberta.
                        </DescricaoFormulario>
                    </CabecalhoFormulario>

                    <GrupoBotoes>
                        <BotaoSocial onClick={() => handleEntrar('google')} disabled={provedorCarregando !== null}>
                            <FaGoogle size={16} />
                            {provedorCarregando === 'google' ? 'Redirecionando...' : 'Continuar com o Google'}
                        </BotaoSocial>
                        <BotaoEmBreve disabled>
                            <FaMicrosoft size={16} />
                            Continuar com o Outlook
                            <EtiquetaEmBreve>Em breve</EtiquetaEmBreve>
                        </BotaoEmBreve>
                        <BotaoEmBreve disabled>
                            <FaApple size={18} />
                            Continuar com a Apple
                            <EtiquetaEmBreve>Em breve</EtiquetaEmBreve>
                        </BotaoEmBreve>
                    </GrupoBotoes>

                    {erro && <MensagemErro role="alert">{erro}</MensagemErro>}

                    <AvisoConta>
                        <FaLock size={14} />
                        <span>
                            <strong>Primeira vez aqui?</strong> Sua conta é criada automaticamente no primeiro acesso. Sem senha para lembrar.
                        </span>
                    </AvisoConta>

                    <TextoTermos>
                        Ao continuar, você concorda com os nossos <LinkTermos href="#">Termos de Serviço</LinkTermos> e nossa <LinkTermos href="#">Política de Privacidade</LinkTermos>.
                    </TextoTermos>

                </FormContainer>
        </LoginSection>
        
            <DivTextos>
                <TextosApresentacao>
                    <TituloApresentacao>Descubra o destino ideal para o seu próximo capítulo.</TituloApresentacao>
                    <DescricaoApresentacao>Conectamos seu estilo de vida, orçamento e metas de carreira com a infraestrutura das melhores cidades do país.</DescricaoApresentacao>
                </TextosApresentacao>

                <CartaoAnalise>
                    <Perfil>
                        <FotoPersona src={FotoPersonaImg} alt="Foto da persona do exemplo" />
                        <div>
                            <strong>Desenvolvedora, orçamento de R$ 4.500/mês</strong>
                            Quer trabalho híbrido, clima ameno e boa oferta de parques.
                        </div>
                    </Perfil>

                    <ListaCidades>
                        {cidadesExemplo.map((cidade, indice) => {
                            const destaque = indice === 0;
                            return (
                                <ItemCidade key={cidade.nome} $destaque={destaque}>
                                    <LinhaCidade $destaque={destaque}>
                                        <span><FaMapMarkerAlt size={12} /> {cidade.nome}</span>
                                        <Compatibilidade $destaque={destaque}>{cidade.valor}% compatível</Compatibilidade>
                                    </LinhaCidade>
                                    <Trilho $destaque={destaque}>
                                        <Barra $valor={cidade.valor} $destaque={destaque} $atraso={0.2 + indice * 0.15} />
                                    </Trilho>
                                </ItemCidade>
                            );
                        })}
                    </ListaCidades>
                </CartaoAnalise>

                <Criterios>
                    O que a moradIA compara para você:
                    <ListaCriterios>
                        {criterios.map((criterio) => (
                            <li key={criterio}>{criterio}</li>
                        ))}
                    </ListaCriterios>
                </Criterios>
            </DivTextos>
        </CampoApresentacao>
    )
}

export default Login
