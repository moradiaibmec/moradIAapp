import { useEffect, useState } from 'react';
import styled, { keyframes } from "styled-components"
import { FiArrowLeft, FiCheck, FiCheckCircle, FiCompass, FiCopy, FiCreditCard, FiInfo, FiLoader, FiLock } from 'react-icons/fi';
import { LuQrCode } from 'react-icons/lu';
import qrPixSimulado from '../../assets/qr-pix-simulado.svg';
import { textoDoCredito } from '../../analise/formatacao.js';
import {
    PRECO_CENTAVOS, PRECO_TEXTO, formatarCpf, formatarCvv, formatarNumeroCartao, formatarTempo, formatarValidade,
} from '../../analise/pagamento.js';
import { carregarFotos } from '../../dados/base.js';
import { processarPagamento } from '../../lib/gatewayPagamento.js';

// A foto do cartão bloqueado é sempre a mesma (Curitiba): a do 1º lugar entregaria o resultado antes do pagamento.
const IBGE_FOTO_BLOQUEADA = 4106902;
const LARGURAS_OCULTAS = [170, 130, 150];
const INCLUI = [
    'Ranking de cidades com seu percentual de match',
    'Indicadores e pontos de atenção de cada cidade',
    'Relatório para baixar e compartilhar',
];
const PASSOS_PIX = [
    'Abra o app do seu banco e escolha pagar com Pix',
    'Escaneie o QR code ou cole o código',
    `Confira o valor de ${PRECO_TEXTO} e confirme`,
];
const DADOS_DE_TESTE = { numero: '4242 4242 4242 4242', nome: 'TITULAR DE TESTE', validade: '12/34', cvv: '123', cpf: '000.000.000-00' };
const CARTAO_VAZIO = { numero: '', nome: '', validade: '', cvv: '', cpf: '' };
const VALIDADE_PIX_SEGUNDOS = 15 * 60;
// O final "SIMU" não é um CRC válido: nenhum banco aceita este código.
const CODIGO_PIX = '00020126580014BR.GOV.BCB.PIX0136a1f4c9e2-7b3d-4e8a-9c11-5f2e8d7a6b30520400005303986540519.905802BR5907MORADIA6009SAO PAULO62070503***6304SIMU';

const girar = keyframes`
    to { transform: rotate(360deg); }
`;

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F6F7F9;
    font-family: var(--fonte-moradia);
`;

const Cabecalho = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    height: 73px;
    padding: 0 80px;
    border-bottom: 1px solid #E6E8EC;
    background-color: #FFFFFF;
    box-sizing: border-box;

    @media (max-width: 900px) {
        padding: 0 16px;
    }
`;

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--fonte-titulo);
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.4px;
    color: #0F172A;
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

const BotaoVoltar = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    border: none;
    background: none;
    color: #5B6475;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;

    svg {
        flex-shrink: 0;
        font-size: 16px;
    }

    &:hover {
        color: var(--roxo-moradia);
    }
`;

const Conteudo = styled.main`
    display: flex;
    flex-direction: column;
    gap: 28px;
    max-width: 1440px;
    margin: 0 auto;
    padding: 40px 80px 64px;
    box-sizing: border-box;

    @media (max-width: 900px) {
        padding: 24px 16px 48px;
    }
`;

const CabecalhoPagina = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Status = styled.p`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #5B6475;

    svg {
        flex-shrink: 0;
        font-size: 16px;
        color: #059669;
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

const Colunas = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) 460px;
    gap: 24px;

    @media (max-width: 1100px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

const CartaoFormulario = styled.section`
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
    padding: 32px;
    border: 1px solid #E6E8EC;
    border-radius: 20px;
    background-color: #FFFFFF;
    box-sizing: border-box;

    @media (max-width: 600px) {
        padding: 20px 16px;
    }
`;

const TituloFormulario = styled.h2`
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: #0F172A;
`;

const Metodos = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    padding: 4px;
    border-radius: 12px;
    background-color: #F1F3F6;
`;

const BotaoMetodo = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 44px;
    border: 1px solid ${({ $ativo }) => ($ativo ? '#E6E8EC' : 'transparent')};
    border-radius: 9px;
    background-color: ${({ $ativo }) => ($ativo ? '#FFFFFF' : 'transparent')};
    color: ${({ $ativo }) => ($ativo ? 'var(--roxo-moradia)' : '#5B6475')};
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    svg {
        flex-shrink: 0;
        font-size: 16px;
    }

    &:focus-visible {
        outline: 2px solid var(--roxo-moradia);
        outline-offset: 1px;
    }
`;

const Aviso = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    padding: 12px 14px;
    border-radius: 10px;
    background-color: #FFF7E6;
    font-size: 13px;
    color: #0F172A;

    > svg {
        flex-shrink: 0;
        font-size: 16px;
        color: #D97706;
    }

    > p {
        flex: 1 1 280px;
        min-width: 0;
    }
`;

const AcaoAviso = styled.button`
    padding: 0;
    border: none;
    background: none;
    color: var(--roxo-moradia);
    font-family: var(--fonte-moradia);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;

    &:hover:not(:disabled) {
        text-decoration: underline;
    }
`;

const Formulario = styled.form`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 20px;
    flex: 1;
`;

const Campos = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const LinhaCampos = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 600px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));

        > :last-child {
            grid-column: 1 / -1;
        }
    }
`;

const Campo = styled.label`
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    font-size: 13px;
    font-weight: 600;
    color: #0F172A;
`;

const CaixaEntrada = styled.span`
    display: flex;
    align-items: center;
    gap: 10px;
    height: 48px;
    padding: 0 14px;
    border: 1px solid #E6E8EC;
    border-radius: 10px;
    background-color: #FFFFFF;
    box-sizing: border-box;
    transition: border-color 0.2s;

    &:focus-within {
        border-color: var(--roxo-moradia);
    }

    svg {
        flex-shrink: 0;
        font-size: 18px;
        color: #5B6475;
    }
`;

const Entrada = styled.input`
    flex: 1;
    width: 100%;
    min-width: 0;
    padding: 0;
    border: none;
    outline: none;
    background: none;
    color: #0F172A;
    font-family: var(--fonte-moradia);
    font-size: 15px;
    font-weight: 400;

    &::placeholder {
        color: #5B6475;
        opacity: 1;
    }
`;

const BotaoPagar = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 56px;
    padding: 8px 16px;
    border: none;
    border-radius: 12px;
    background-color: var(--roxo-moradia);
    color: #FFFFFF;
    font-family: var(--fonte-moradia);
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s;

    svg {
        flex-shrink: 0;
        font-size: 18px;
    }

    &:hover:not(:disabled) {
        background-color: #4338CA;
    }

    &:disabled {
        opacity: 0.7;
        cursor: default;
    }

    &:focus-visible {
        outline: 2px solid var(--roxo-moradia);
        outline-offset: 2px;
    }
`;

const AreaPix = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 20px;
    flex: 1;
`;

const LinhaPix = styled.div`
    display: flex;
    align-items: center;
    gap: 32px;

    @media (max-width: 800px) {
        flex-direction: column;
        align-items: stretch;
        gap: 24px;
    }
`;

const CaixaQr = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 232px;
    height: 232px;
    border: 1px solid #E6E8EC;
    border-radius: 16px;
    background-color: #FFFFFF;
    box-sizing: border-box;

    img {
        display: block;
        width: 196px;
        height: 196px;
    }

    @media (max-width: 800px) {
        align-self: center;
    }
`;

const InstrucoesPix = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    min-width: 0;
`;

const StatusPix = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const LinhaStatusPix = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

const Aguardando = styled.p`
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--fonte-titulo);
    font-size: 17px;
    font-weight: 700;
    color: #0F172A;

    svg {
        flex-shrink: 0;
        font-size: 18px;
        color: var(--roxo-moradia);
        animation: ${girar} 1.6s linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
        svg {
            animation: none;
        }
    }
`;

const SeloExpira = styled.span`
    padding: 4px 10px;
    border-radius: 999px;
    background-color: #EEF0FF;
    color: var(--roxo-moradia);
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
`;

const SubPix = styled.p`
    font-size: 14px;
    color: #5B6475;
`;

const Passos = styled.ol`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: #0F172A;
    }
`;

const NumeroPasso = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #EEF0FF;
    color: var(--roxo-moradia);
    font-size: 12px;
    font-weight: 700;
`;

const CopiaECola = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const RotuloCopia = styled.p`
    font-size: 13px;
    font-weight: 600;
    color: #0F172A;
`;

const LinhaCopia = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const CodigoPix = styled.p`
    flex: 1;
    min-width: 0;
    height: 52px;
    padding: 0 14px;
    border: 1px solid #E6E8EC;
    border-radius: 10px;
    background-color: #F8F9FB;
    color: #5B6475;
    font-size: 14px;
    line-height: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-sizing: border-box;
`;

const BotaoCopiar = styled(BotaoPagar)`
    gap: 8px;
    flex-shrink: 0;
    min-height: 52px;
    min-width: 173px;
    font-size: 15px;
`;

const Resumo = styled.aside`
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
`;

const RankingBloqueado = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
    flex: 1;
    min-height: 318px;
    padding: 24px;
    border-radius: 20px;
    background-color: #1E293B;
    color: #FFFFFF;
    overflow: hidden;
    box-sizing: border-box;
`;

const FotoDesfocada = styled.div`
    position: absolute;
    inset: -40px;
    background: ${({ $foto }) => ($foto ? `url("${$foto}") center / cover no-repeat` : 'none')};
    filter: blur(22px);
`;

const VeuBloqueado = styled.div`
    position: absolute;
    inset: 0;
    background-color: rgba(11, 18, 32, 0.65);
`;

const TituloBloqueado = styled.h2`
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 18px;
    font-weight: 700;

    svg {
        flex-shrink: 0;
        font-size: 16px;
    }
`;

const LinhasOcultas = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const LinhaOculta = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    height: 48px;
    padding: 0 14px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.12);
    font-size: 13px;
    font-weight: 600;

    strong {
        font-size: 14px;
        font-weight: 700;
    }
`;

const NomeOculto = styled.span`
    flex: 1;
    min-width: 0;

    &::before {
        content: '';
        display: block;
        width: ${({ $largura }) => $largura}px;
        max-width: 100%;
        height: 12px;
        border-radius: 6px;
        background-color: rgba(255, 255, 255, 0.6);
        filter: blur(3px);
    }
`;

const ResumoPedido = styled.section`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    border: 1px solid #E6E8EC;
    border-radius: 20px;
    background-color: #FFFFFF;
`;

const TituloPedido = styled.h2`
    margin: 0;
    font-family: var(--fonte-titulo);
    font-size: 16px;
    font-weight: 700;
    color: #0F172A;
`;

const ListaInclui = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: #0F172A;
    }

    svg {
        flex-shrink: 0;
        font-size: 16px;
        color: #059669;
    }
`;

const Total = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid #EDEFF3;
`;

const RotuloTotal = styled.p`
    font-size: 14px;
    font-weight: 600;
    color: #0F172A;
`;

const SubTotal = styled.p`
    margin-top: 2px;
    font-size: 13px;
    color: #5B6475;
`;

const Preco = styled.p`
    font-family: var(--fonte-titulo);
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.6px;
    color: #0F172A;
    white-space: nowrap;
`;

function FormularioCartao({ enviando, onPagar }) {
    // Os dados só existem neste estado: nada é gravado nem enviado.
    const [cartao, setCartao] = useState(CARTAO_VAZIO);

    function alterar(campo, formatar) {
        return ({ target }) => setCartao((atual) => ({ ...atual, [campo]: formatar(target.value) }));
    }

    function enviar(evento) {
        evento.preventDefault();
        onPagar('cartao');
    }

    return (
        <>
            <Aviso>
                <FiInfo aria-hidden="true" />
                <p>Pagamento simulado: nenhuma cobrança será feita. Não use um cartão real.</p>
                <AcaoAviso type="button" onClick={() => setCartao(DADOS_DE_TESTE)}>Preencher dados de teste</AcaoAviso>
            </Aviso>
            <Formulario onSubmit={enviar} autoComplete="off">
                <Campos>
                    <Campo>
                        Número do cartão
                        <CaixaEntrada>
                            <Entrada inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" value={cartao.numero} onChange={alterar('numero', formatarNumeroCartao)} />
                            <FiCreditCard aria-hidden="true" />
                        </CaixaEntrada>
                    </Campo>
                    <Campo>
                        Nome impresso no cartão
                        <CaixaEntrada>
                            <Entrada autoComplete="off" placeholder="Como aparece no cartão" value={cartao.nome} onChange={alterar('nome', (valor) => valor)} />
                        </CaixaEntrada>
                    </Campo>
                    <LinhaCampos>
                        <Campo>
                            Validade
                            <CaixaEntrada>
                                <Entrada inputMode="numeric" autoComplete="off" placeholder="MM/AA" value={cartao.validade} onChange={alterar('validade', formatarValidade)} />
                            </CaixaEntrada>
                        </Campo>
                        <Campo>
                            CVV
                            <CaixaEntrada>
                                <Entrada inputMode="numeric" autoComplete="off" placeholder="123" value={cartao.cvv} onChange={alterar('cvv', formatarCvv)} />
                            </CaixaEntrada>
                        </Campo>
                        <Campo>
                            CPF do titular
                            <CaixaEntrada>
                                <Entrada inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={cartao.cpf} onChange={alterar('cpf', formatarCpf)} />
                            </CaixaEntrada>
                        </Campo>
                    </LinhaCampos>
                </Campos>
                <BotaoPagar type="submit" disabled={enviando}>
                    <FiLock aria-hidden="true" /> Pagar {PRECO_TEXTO} e ver meu resultado
                </BotaoPagar>
            </Formulario>
        </>
    );
}

function PagamentoPix({ enviando, onPagar }) {
    const [restante, setRestante] = useState(VALIDADE_PIX_SEGUNDOS);
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        const contador = setInterval(() => setRestante((atual) => Math.max(atual - 1, 0)), 1000);
        return () => clearInterval(contador);
    }, []);

    useEffect(() => {
        if (!copiado) return undefined;
        const aviso = setTimeout(() => setCopiado(false), 2000);
        return () => clearTimeout(aviso);
    }, [copiado]);

    async function copiar() {
        try {
            await navigator.clipboard.writeText(CODIGO_PIX);
            setCopiado(true);
        } catch {
            // Sem acesso à área de transferência, o botão só não confirma a cópia.
        }
    }

    return (
        <>
            <Aviso>
                <FiInfo aria-hidden="true" />
                <p>Pagamento simulado: nenhuma cobrança será feita. Este QR code não é real.</p>
                <AcaoAviso type="button" disabled={enviando} onClick={() => onPagar('pix')}>Simular pagamento aprovado</AcaoAviso>
            </Aviso>
            <AreaPix>
                <LinhaPix>
                    <CaixaQr><img src={qrPixSimulado} alt="QR code simulado do Pix" /></CaixaQr>
                    <InstrucoesPix>
                        <StatusPix>
                            <LinhaStatusPix>
                                <Aguardando><FiLoader aria-hidden="true" /> Aguardando pagamento</Aguardando>
                                <SeloExpira>{restante > 0 ? `Expira em ${formatarTempo(restante)}` : 'Código expirado'}</SeloExpira>
                            </LinhaStatusPix>
                            <SubPix>Seu resultado abre sozinho assim que o Pix for confirmado.</SubPix>
                        </StatusPix>
                        <Passos>
                            {PASSOS_PIX.map((passo, indice) => (
                                <li key={passo}>
                                    <NumeroPasso aria-hidden="true">{indice + 1}</NumeroPasso>
                                    {passo}
                                </li>
                            ))}
                        </Passos>
                    </InstrucoesPix>
                </LinhaPix>
                <CopiaECola>
                    <RotuloCopia>Pix copia e cola</RotuloCopia>
                    <LinhaCopia>
                        <CodigoPix title={CODIGO_PIX}>{CODIGO_PIX}</CodigoPix>
                        <BotaoCopiar type="button" onClick={copiar}>
                            {copiado ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
                            <span aria-live="polite">{copiado ? 'Copiado!' : 'Copiar código'}</span>
                        </BotaoCopiar>
                    </LinhaCopia>
                </CopiaECola>
            </AreaPix>
        </>
    );
}

// Entre o fim da análise e o resultado. Esta tela não recebe o ranking: nada do resultado aparece antes do pagamento.
function Pagamento({ onVoltar, onPago }) {
    const [metodo, setMetodo] = useState('cartao');
    const [enviando, setEnviando] = useState(false);
    const [foto, setFoto] = useState(null);

    useEffect(() => {
        let ativo = true;
        carregarFotos().then((fotos) => {
            if (ativo) setFoto(fotos[IBGE_FOTO_BLOQUEADA] ?? null);
        });
        return () => {
            ativo = false;
        };
    }, []);

    async function pagar(metodoEscolhido) {
        setEnviando(true);
        const { aprovado } = await processarPagamento({ metodo: metodoEscolhido, centavos: PRECO_CENTAVOS });
        if (aprovado) onPago();
        else setEnviando(false);
    }

    return (
        <Pagina>
            <Cabecalho>
                <Logo>
                    <IconeLogo><FiCompass /></IconeLogo>
                    <p>MoradIA</p>
                </Logo>
                <BotaoVoltar type="button" onClick={onVoltar}>
                    <FiArrowLeft aria-hidden="true" /> Voltar às respostas
                </BotaoVoltar>
            </Cabecalho>

            <Conteudo>
                <CabecalhoPagina>
                    <Status><FiCheckCircle aria-hidden="true" /> Análise concluída: todas as etapas respondidas</Status>
                    <Titulo>Falta só o pagamento para ver seu resultado</Titulo>
                </CabecalhoPagina>

                <Colunas>
                    <CartaoFormulario>
                        <TituloFormulario>Forma de pagamento</TituloFormulario>
                        <Metodos role="group" aria-label="Forma de pagamento">
                            <BotaoMetodo type="button" $ativo={metodo === 'cartao'} aria-pressed={metodo === 'cartao'} onClick={() => setMetodo('cartao')}>
                                <FiCreditCard aria-hidden="true" /> Cartão de crédito
                            </BotaoMetodo>
                            <BotaoMetodo type="button" $ativo={metodo === 'pix'} aria-pressed={metodo === 'pix'} onClick={() => setMetodo('pix')}>
                                <LuQrCode aria-hidden="true" /> Pix
                            </BotaoMetodo>
                        </Metodos>
                        {metodo === 'cartao'
                            ? <FormularioCartao enviando={enviando} onPagar={pagar} />
                            : <PagamentoPix enviando={enviando} onPagar={pagar} />}
                    </CartaoFormulario>

                    <Resumo>
                        <RankingBloqueado aria-label="Seu ranking está pronto e bloqueado" title={foto ? `${textoDoCredito(foto)} (Wikimedia Commons)` : undefined}>
                            <FotoDesfocada $foto={foto?.miniatura} />
                            <VeuBloqueado />
                            <TituloBloqueado><FiLock aria-hidden="true" /> Seu ranking está pronto</TituloBloqueado>
                            <LinhasOcultas aria-hidden="true">
                                {LARGURAS_OCULTAS.map((largura, indice) => (
                                    <LinhaOculta key={largura}>
                                        <strong>{indice + 1}</strong>
                                        <NomeOculto $largura={largura} />
                                        ??% match
                                    </LinhaOculta>
                                ))}
                            </LinhasOcultas>
                        </RankingBloqueado>

                        <ResumoPedido>
                            <TituloPedido>O que você recebe nesta análise</TituloPedido>
                            <ListaInclui>
                                {INCLUI.map((item) => (
                                    <li key={item}><FiCheck aria-hidden="true" /> {item}</li>
                                ))}
                            </ListaInclui>
                            <Total>
                                <div>
                                    <RotuloTotal>Total</RotuloTotal>
                                    <SubTotal>Pagamento único, sem assinatura</SubTotal>
                                </div>
                                <Preco>{PRECO_TEXTO}</Preco>
                            </Total>
                        </ResumoPedido>
                    </Resumo>
                </Colunas>
            </Conteudo>
        </Pagina>
    );
}

export default Pagamento
