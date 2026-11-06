import { describe, expect, it } from 'vitest';
import { deveEmpilhar, lerUrl, montarUrl } from './rotas.js';

const ida = (estado) => lerUrl(montarUrl({ ...lerUrl(''), ...estado }));

describe('lerUrl', () => {
    it('abre o dashboard sem parâmetros', () => {
        expect(lerUrl('')).toEqual({
            pagina: 'dashboard', idAnalise: null, selecionada: 0, cidade: null, origem: 'resultados', aba: 'geral', comparadas: null, etapa: null,
        });
    });

    it('ignora valores inválidos', () => {
        const url = lerUrl('?tela=processando&posicao=abc&cidade=-1&origem=x&aba=bairros&comparar=a,b');
        expect(url).toMatchObject({ pagina: 'dashboard', selecionada: 0, cidade: null, origem: 'resultados', aba: 'geral', comparadas: null });
    });

    it('limita e remove repetições das cidades comparadas', () => {
        expect(lerUrl('?tela=comparar&comparar=1,1,2,3,4').comparadas).toEqual([1, 2, 3]);
    });

    it('ignora parâmetros desconhecidos, como os do retorno do login', () => {
        expect(lerUrl('?code=abc').pagina).toBe('dashboard');
    });
});

describe('montarUrl', () => {
    it('não coloca nada na URL do dashboard', () => {
        expect(montarUrl({ ...lerUrl(''), idAnalise: 'a1' })).toBe('');
    });

    it('não leva a análise para telas que não a usam', () => {
        expect(montarUrl({ ...lerUrl(''), pagina: 'perfil', idAnalise: 'a1' })).toBe('?tela=perfil');
    });

    it('omite os valores padrão', () => {
        expect(montarUrl({ ...lerUrl(''), pagina: 'explorar', idAnalise: 'a1', cidade: 7 })).toBe('?tela=explorar&analise=a1&cidade=7');
    });

    it('não gera URL para a transição de processamento', () => {
        expect(montarUrl({ ...lerUrl(''), pagina: 'processando' })).toBe('');
    });

    it.each([
        { pagina: 'resultados', idAnalise: 'a1', selecionada: 2 },
        { pagina: 'ranking', idAnalise: 'a1' },
        { pagina: 'comparar', idAnalise: 'a1', comparadas: [1, 2] },
        { pagina: 'explorar', idAnalise: 'a1', cidade: 7, origem: 'ranking', aba: 'clima' },
        { pagina: 'onboarding', etapa: 'clima' },
        { pagina: 'cidades' },
        { pagina: 'metodologia' },
    ])('restaura o estado depois do F5: $pagina', (estado) => {
        expect(ida(estado)).toMatchObject(estado);
    });
});

describe('deveEmpilhar', () => {
    const tela = (estado) => ({ ...lerUrl(''), ...estado });

    it('empilha ao trocar de tela', () => {
        expect(deveEmpilhar(tela({ pagina: 'dashboard' }), tela({ pagina: 'perfil' }))).toBe(true);
    });

    it('empilha ao trocar de cidade ou de etapa', () => {
        expect(deveEmpilhar(tela({ pagina: 'explorar', cidade: 1 }), tela({ pagina: 'explorar', cidade: 2 }))).toBe(true);
        expect(deveEmpilhar(tela({ pagina: 'onboarding', etapa: 'momento' }), tela({ pagina: 'onboarding', etapa: 'clima' }))).toBe(true);
    });

    it('não empilha ajustes dentro da mesma tela', () => {
        expect(deveEmpilhar(tela({ pagina: 'explorar', cidade: 1 }), tela({ pagina: 'explorar', cidade: 1, aba: 'clima' }))).toBe(false);
        expect(deveEmpilhar(tela({ pagina: 'resultados' }), tela({ pagina: 'resultados', selecionada: 2 }))).toBe(false);
        expect(deveEmpilhar(tela({ pagina: 'resultados' }), tela({ pagina: 'resultados', idAnalise: 'a1' }))).toBe(false);
    });

    it('os resultados substituem o questionário no histórico', () => {
        expect(deveEmpilhar(tela({ pagina: 'onboarding' }), tela({ pagina: 'resultados' }))).toBe(false);
    });
});
