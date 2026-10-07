import { OPCOES_TEMPERATURA, SIM_NAO } from '../../analise/opcoes.js';
import { GrupoOpcoes } from './elementos.jsx';

function EtapaClima({ respostas, alterar }) {
    const { temperatura, chuvaIncomoda } = respostas.clima;

    return (
        <>
            <GrupoOpcoes
                legenda="Qual temperatura combina com o seu dia a dia?"
                opcoes={OPCOES_TEMPERATURA}
                valor={temperatura}
                onChange={(valor) => alterar('clima', { temperatura: valor })}
                colunas={4}
            />

            <GrupoOpcoes
                legenda="Chuva frequente te incomoda?"
                opcoes={SIM_NAO}
                valor={chuvaIncomoda ? 'sim' : 'nao'}
                onChange={(valor) => alterar('clima', { chuvaIncomoda: valor === 'sim' })}
                colunas={2}
            />
        </>
    );
}

export default EtapaClima
