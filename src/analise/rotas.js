// A tela atual fica na query string (?tela=ranking&analise=...), para sobreviver ao F5 e funcionar com o Voltar do navegador.
// Query string, e não caminho: não exige regra de rewrite na hospedagem. E o hash já é usado pelas seções do Perfil e pelo login.
import { MAXIMO_COMPARADAS } from './comparacao.js';

// Telas que dependem de uma análise aberta.
export const TELAS_DE_ANALISE = ['resultados', 'ranking', 'explorar', 'comparar'];

// "processando" fica de fora de propósito: é só uma transição, e não deve ser um destino do Voltar.
const TELAS = ['dashboard', 'perfil', 'cidades', 'metodologia', 'onboarding', ...TELAS_DE_ANALISE];
const ORIGENS = ['resultados', 'ranking', 'comparar', 'cidades'];
const ABAS = ['geral', 'custo', 'clima', 'trabalho', 'educacao'];

const inteiroPositivo = (texto) => (/^\d+$/.test(texto ?? '') ? Number(texto) : null);

function lerComparadas(texto) {
    if (!texto) return null;
    const codigos = [...new Set(texto.split(',').map(inteiroPositivo).filter((codigo) => codigo !== null))];
    return codigos.length ? codigos.slice(0, MAXIMO_COMPARADAS) : null;
}

// Tudo aqui veio da barra de endereços: o que for inválido cai no valor padrão.
export function lerUrl(busca) {
    const parametros = new URLSearchParams(busca);
    const pagina = parametros.get('tela');
    const origem = parametros.get('origem');
    const aba = parametros.get('aba');
    return {
        pagina: TELAS.includes(pagina) ? pagina : 'dashboard',
        idAnalise: parametros.get('analise') || null,
        selecionada: inteiroPositivo(parametros.get('posicao')) ?? 0,
        cidade: inteiroPositivo(parametros.get('cidade')),
        origem: ORIGENS.includes(origem) ? origem : 'resultados',
        aba: ABAS.includes(aba) ? aba : 'geral',
        comparadas: lerComparadas(parametros.get('comparar')),
        etapa: parametros.get('etapa') || null,
    };
}

// Só entram os parâmetros que a tela usa, para a URL não guardar sobras da tela anterior.
export function montarUrl({ pagina, idAnalise, selecionada, cidade, origem, aba, comparadas, etapa }) {
    if (!TELAS.includes(pagina) || pagina === 'dashboard') return '';
    const parametros = new URLSearchParams({ tela: pagina });
    if (TELAS_DE_ANALISE.includes(pagina) && idAnalise) parametros.set('analise', idAnalise);
    if (pagina === 'onboarding' && etapa) parametros.set('etapa', etapa);
    if (pagina === 'resultados' && selecionada > 0) parametros.set('posicao', selecionada);
    if (pagina === 'comparar' && comparadas) parametros.set('comparar', comparadas.join(','));
    if (pagina === 'explorar') {
        if (cidade !== null) parametros.set('cidade', cidade);
        if (origem !== 'resultados') parametros.set('origem', origem);
        if (aba !== 'geral') parametros.set('aba', aba);
    }
    return `?${parametros}`;
}

// Trocar de tela, de cidade ou de etapa cria uma entrada no histórico; ajustes dentro da mesma tela só atualizam a atual.
// Ao concluir a análise, os resultados substituem o questionário: voltar deles não reabre um formulário já enviado.
export function deveEmpilhar(atual, nova) {
    if (atual.pagina === 'onboarding' && nova.pagina === 'resultados') return false;
    return atual.pagina !== nova.pagina
        || (nova.pagina === 'explorar' && atual.cidade !== nova.cidade)
        || (nova.pagina === 'onboarding' && atual.etapa !== nova.etapa);
}
