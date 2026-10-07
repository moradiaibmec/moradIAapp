import { OPCOES_MORADIA, OPCOES_MOTIVACAO, OPCOES_SITUACAO, SIM_NAO } from '../../analise/opcoes.js';
import { GrupoOpcoes } from './elementos.jsx';

function EtapaMomento({ respostas, alterar }) {
    const { moradia, filhosEscolares } = respostas.domicilio;

    return (
        <>
            <GrupoOpcoes
                legenda="Com quem você vai morar?"
                opcoes={OPCOES_MORADIA}
                valor={moradia}
                onChange={(valor) => alterar('domicilio', { moradia: valor })}
                colunas={4}
            />

            {moradia === 'familia' && (
                <GrupoOpcoes
                    legenda="Tem filhos em idade escolar?"
                    opcoes={SIM_NAO}
                    valor={filhosEscolares ? 'sim' : 'nao'}
                    onChange={(valor) => alterar('domicilio', { filhosEscolares: valor === 'sim' })}
                    colunas={2}
                />
            )}

            <GrupoOpcoes
                legenda="Qual é a sua situação hoje?"
                ajuda="Pode marcar mais de uma."
                opcoes={OPCOES_SITUACAO}
                valor={respostas.situacao}
                onChange={(valor) => alterar('situacao', valor)}
                multipla
                colunas={4}
            />

            <GrupoOpcoes
                legenda="O que mais te motiva a mudar? (opcional)"
                ajuda="Usamos isso só para sugerir suas prioridades no final. Você pode mudar tudo lá."
                opcoes={OPCOES_MOTIVACAO}
                valor={respostas.motivacao}
                onChange={(valor) => alterar('motivacao', valor)}
            />
        </>
    );
}

export default EtapaMomento
