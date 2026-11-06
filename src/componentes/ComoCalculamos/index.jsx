import styled from "styled-components"
import { FiAlertCircle, FiExternalLink } from 'react-icons/fi';
import CabecalhoApp from '../CabecalhoApp/index.jsx';
import IconePilar from '../IconePilar/index.jsx';
import { PASSOS, criteriosDaMetodologia, limitacoes, resumoDaBase } from '../../analise/metodologia.js';

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F8FAFC;
    font-family: var(--fonte-moradia);
`;

const Conteudo = styled.main`
    display: flex;
    flex-direction: column;
    gap: 48px;
    max-width: 1100px;
    margin: 0 auto;
    padding: 48px 32px 80px;
    box-sizing: border-box;

    @media (max-width: 900px) {
        gap: 32px;
        padding: 32px 16px 64px;
    }
`;

const Eyebrow = styled.p`
    margin-bottom: 12px;
    color: var(--roxo-moradia);
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
`;

const Titulo = styled.h1`
    margin: 0 0 12px;
    color: #111827;
    font-size: 36px;
    font-weight: 800;

    @media (max-width: 600px) {
        font-size: 28px;
    }
`;

const Lead = styled.p`
    max-width: 760px;
    color: #6B7280;
    font-size: 18px;
    line-height: 1.6;
`;

const Numeros = styled.dl`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin: 0;

    div {
        padding: 20px;
        border: 1px solid #E5E7EB;
        border-radius: 16px;
        background-color: #FFFFFF;
    }

    dt {
        color: #6B7280;
        font-size: 14px;
    }

    dd {
        margin: 4px 0 0;
        color: var(--roxo-moradia);
        font-size: 32px;
        font-weight: 800;
    }

    @media (max-width: 600px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

const Secao = styled.section`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const TituloSecao = styled.h2`
    margin: 0;
    color: #111827;
    font-size: 24px;
    font-weight: 800;
`;

const Passos = styled.ol`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const Passo = styled.li`
    display: flex;
    gap: 16px;
    padding: 20px;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    background-color: #FFFFFF;

    h3 {
        margin: 0 0 4px;
        color: #111827;
        font-size: 16px;
        font-weight: 700;
    }

    p {
        color: #6B7280;
        font-size: 14px;
        line-height: 1.6;
    }
`;

const NumeroPasso = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-size: 16px;
    font-weight: 800;
`;

const GradeCriterios = styled.ul`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;

    @media (max-width: 800px) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

const Criterio = styled.li`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    background-color: #FFFFFF;

    h3 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
        color: #111827;
        font-size: 16px;
        font-weight: 700;
    }

    p {
        color: #6B7280;
        font-size: 14px;
        line-height: 1.5;
    }

    p strong {
        color: #111827;
        font-weight: 600;
    }
`;

const CaixaIcone = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-size: 20px;
`;

const Fontes = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: auto 0 0;
    padding: 10px 0 0;
    border-top: 1px solid #E5E7EB;
    list-style: none;

    a {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--roxo-moradia);
        font-size: 12px;
        font-weight: 600;
        line-height: 1.4;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    svg {
        flex-shrink: 0;
    }
`;

const Limitacoes = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 24px;
    border: 1px solid #FDE68A;
    border-radius: 16px;
    background-color: #FFFBEB;
    list-style: none;

    li {
        display: flex;
        gap: 10px;
        color: #92400E;
        font-size: 14px;
        line-height: 1.5;
    }

    svg {
        flex-shrink: 0;
        margin-top: 3px;
    }
`;

function ComoCalculamos({ usuario, onNavegar, onNovaAnalise, comparacaoIndisponivel, base }) {
    const resumo = resumoDaBase(base);
    const criterios = criteriosDaMetodologia(base.fontes);

    return (
        <Pagina>
            <CabecalhoApp
                usuario={usuario}
                paginaAtiva="metodologia"
                onNavegar={onNavegar}
                onNovaAnalise={onNovaAnalise}
                comparacaoIndisponivel={comparacaoIndisponivel}
            />

            <Conteudo>
                <div>
                    <Eyebrow>Metodologia</Eyebrow>
                    <Titulo>Como calculamos o seu match</Titulo>
                    <Lead>
                        O ranking é um cálculo transparente sobre dados públicos: as mesmas respostas sempre geram o mesmo resultado, e cada nota pode ser conferida na fonte.
                    </Lead>
                </div>

                <Numeros>
                    <div><dt>Cidades analisadas</dt><dd>{resumo.totalCidades}</dd></div>
                    <div><dt>Critérios avaliados</dt><dd>{resumo.totalCriterios}</dd></div>
                    <div><dt>Fontes públicas</dt><dd>{resumo.totalFontes}</dd></div>
                </Numeros>

                <Secao aria-labelledby="titulo-passos">
                    <TituloSecao id="titulo-passos">Passo a passo</TituloSecao>
                    <Passos>
                        {PASSOS.map(({ titulo, texto }, indice) => (
                            <Passo key={titulo}>
                                <NumeroPasso aria-hidden="true">{indice + 1}</NumeroPasso>
                                <div>
                                    <h3>{titulo}</h3>
                                    <p>{texto}</p>
                                </div>
                            </Passo>
                        ))}
                    </Passos>
                </Secao>

                <Secao aria-labelledby="titulo-criterios">
                    <TituloSecao id="titulo-criterios">Os {resumo.totalCriterios} critérios</TituloSecao>
                    <GradeCriterios>
                        {criterios.map(({ id, rotulo, mede, nota, fontes }) => (
                            <Criterio key={id}>
                                <h3><CaixaIcone><IconePilar pilar={id} /></CaixaIcone> {rotulo}</h3>
                                <p><strong>O que mede:</strong> {mede}</p>
                                <p><strong>Como vira nota:</strong> {nota}</p>
                                {fontes.length > 0 && (
                                    <Fontes aria-label={`Fontes de ${rotulo}`}>
                                        {fontes.map(({ nome, periodo, url }) => (
                                            <li key={`${nome}${periodo}`}>
                                                <a href={url} target="_blank" rel="noopener noreferrer">
                                                    <FiExternalLink aria-hidden="true" /> {nome}, {periodo}
                                                </a>
                                            </li>
                                        ))}
                                    </Fontes>
                                )}
                            </Criterio>
                        ))}
                    </GradeCriterios>
                </Secao>

                <Secao aria-labelledby="titulo-limitacoes">
                    <TituloSecao id="titulo-limitacoes">Limitações que você precisa conhecer</TituloSecao>
                    <Limitacoes>
                        {limitacoes(resumo).map((texto) => (
                            <li key={texto}><FiAlertCircle aria-hidden="true" /> {texto}</li>
                        ))}
                    </Limitacoes>
                </Secao>
            </Conteudo>
        </Pagina>
    );
}

export default ComoCalculamos
