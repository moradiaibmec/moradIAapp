import { MAXIMO_SETORES, SETORES, SIM_NAO } from '../../analise/opcoes.js';
import { GrupoOpcoes } from './elementos.jsx';

function EtapaTrabalho({ respostas, alterar }) {
    const { setores, ensinoSuperior } = respostas.trabalho;

    return (
        <>
            <GrupoOpcoes
                legenda="Quais setores te interessam?"
                ajuda={`Escolha até ${MAXIMO_SETORES}. Usamos isso para avaliar o mercado da sua área em cada cidade.`}
                opcoes={SETORES}
                valor={setores}
                onChange={(valor) => alterar('trabalho', { setores: valor })}
                multipla
                maximo={MAXIMO_SETORES}
            />

            {respostas.situacao.includes('estudo') && (
                <GrupoOpcoes
                    legenda="Você vai cursar o ensino superior?"
                    ajuda="Se sim, avaliamos a oferta de faculdades e universidades."
                    opcoes={SIM_NAO}
                    valor={ensinoSuperior ? 'sim' : 'nao'}
                    onChange={(valor) => alterar('trabalho', { ensinoSuperior: valor === 'sim' })}
                    colunas={2}
                />
            )}
        </>
    );
}

export default EtapaTrabalho
