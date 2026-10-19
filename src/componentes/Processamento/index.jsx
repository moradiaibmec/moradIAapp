import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from "styled-components"
import { FiCheck } from 'react-icons/fi';

const ETAPAS = [
    'Analisando suas preferências',
    'Comparando custo de vida',
    'Avaliando qualidade de vida',
    'Analisando segurança',
    'Encontrando melhores combinações',
];

const INTERVALO_MS = 500;

const girar = keyframes`
    to { transform: rotate(360deg); }
`;

const Pagina = styled.main`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    min-height: 100vh;
    box-sizing: border-box;
    padding: 48px 16px;
    background-color: #F8FAFC;
    font-family: var(--fonte-moradia);
`;

const Cartao = styled.section`
    display: flex;
    flex-direction: column;
    gap: 32px;
    width: 100%;
    max-width: 500px;
    box-sizing: border-box;
    padding: 36px;
    border-radius: 24px;
    background-color: #FFFFFF;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

    @media (max-width: 500px) {
        padding: 24px;
    }
`;

const Ilustracao = styled.div`
    position: relative;
    height: 170px;
    overflow: hidden;
    border-radius: 16px;
    background-color: #EEF2FF;

    svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
    }

    .orbita {
        transform-origin: 50% 50%;
        transform-box: fill-box;
        animation: ${girar} 12s linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
        .orbita {
            animation: none;
        }
    }
`;

const Selo = styled.p`
    position: absolute;
    top: 24px;
    left: 50%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 20px;
    background-color: #FFFFFF;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
    color: #111827;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    transform: translateX(-10%);

    &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #10B981;
    }
`;

const Textos = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: center;
`;

const Titulo = styled.h1`
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: #111827;
`;

const Subtitulo = styled.p`
    font-size: 14px;
    line-height: 1.5;
    color: #6B7280;
`;

const Lista = styled.ol`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const Item = styled.li`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: ${({ $estado }) => ($estado === 'atual' ? 700 : 600)};
    color: ${({ $estado }) => ({ feita: '#111827', atual: 'var(--roxo-moradia)', pendente: '#9CA3AF' })[$estado]};
`;

const Marcador = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    box-sizing: border-box;
    border-radius: 50%;
    background-color: ${({ $estado }) => ($estado === 'feita' ? '#ECFDF5' : 'transparent')};
    border: ${({ $estado }) => ($estado === 'atual' ? '2px dashed var(--roxo-moradia)' : $estado === 'pendente' ? '2px solid #E5E7EB' : 'none')};
    color: #10B981;
    font-size: 12px;

    &::after {
        content: '';
        display: ${({ $estado }) => ($estado === 'atual' ? 'block' : 'none')};
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: var(--roxo-moradia);
    }
`;

const Rodape = styled.p`
    font-size: 13px;
    color: #6B7280;
`;

// Tela de espera entre o fim do onboarding e os resultados. O cálculo é instantâneo;
// a animação dá tempo para a análise ser salva e para a pessoa acompanhar o que está sendo feito.
function Processamento({ totalCidades, onConcluido }) {
    const [concluidas, setConcluidas] = useState(0);
    const aoConcluir = useRef(onConcluido);

    useEffect(() => {
        aoConcluir.current = onConcluido;
    });

    useEffect(() => {
        const avanco = setInterval(() => setConcluidas((atual) => Math.min(atual + 1, ETAPAS.length - 1)), INTERVALO_MS);
        const fim = setTimeout(() => aoConcluir.current(), INTERVALO_MS * ETAPAS.length);
        return () => {
            clearInterval(avanco);
            clearTimeout(fim);
        };
    }, []);

    return (
        <Pagina>
            <Cartao aria-busy="true">
                <Ilustracao aria-hidden="true">
                    <svg viewBox="0 0 420 170" preserveAspectRatio="xMidYMid slice">
                        <circle className="orbita" cx="210" cy="150" r="110" fill="none" stroke="#A5B4FC" strokeWidth="1.5" strokeDasharray="4 6" />
                        <circle className="orbita" cx="216" cy="88" r="30" fill="none" stroke="#A5B4FC" strokeWidth="3" strokeDasharray="1 5" strokeLinecap="round" />
                        <circle cx="96" cy="52" r="5" fill="#4F46E5" />
                        <circle cx="166" cy="120" r="4" fill="#4F46E5" />
                        <circle cx="270" cy="106" r="5" fill="#10B981" />
                        <circle cx="352" cy="64" r="3" fill="#4F46E5" />
                    </svg>
                    <Selo>Comparando {totalCidades} cidades</Selo>
                </Ilustracao>

                <Textos>
                    <Titulo>Analisando seu perfil…</Titulo>
                    <Subtitulo>Estamos comparando suas preferências com cidades brasileiras.</Subtitulo>
                </Textos>

                <Lista>
                    {ETAPAS.map((etapa, indice) => {
                        const estado = indice < concluidas ? 'feita' : indice === concluidas ? 'atual' : 'pendente';
                        return (
                            <Item key={etapa} $estado={estado}>
                                <Marcador $estado={estado}>{estado === 'feita' && <FiCheck aria-hidden="true" />}</Marcador>
                                {etapa}
                            </Item>
                        );
                    })}
                </Lista>
            </Cartao>
            <Rodape>Isso deve levar menos de 10 segundos.</Rodape>
        </Pagina>
    );
}

export default Processamento
