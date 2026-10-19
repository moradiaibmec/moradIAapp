import { describe, expect, it } from 'vitest';
import { criarRespostasIniciais } from './respostas.js';
import { fraseDoPilar, lemaDaCidade, listar, porQueCombina, qualificarNota } from './explicacao.js';

const avaliacao = (nota, bruto, extra = {}) => ({ nota, peso: 'importante', bruto, dadoIndisponivel: false, ...extra });

describe('qualificarNota', () => {
    it('traduz a nota em palavras', () => {
        expect(qualificarNota(92)).toBe('Excelente');
        expect(qualificarNota(85)).toBe('Excelente');
        expect(qualificarNota(70)).toBe('Muito bom');
        expect(qualificarNota(50)).toBe('Bom');
        expect(qualificarNota(30)).toBe('Regular');
        expect(qualificarNota(29)).toBe('Fraco');
    });
});

describe('listar', () => {
    it('junta itens com vírgula e "e"', () => {
        expect(listar([])).toBe('');
        expect(listar(['clima'])).toBe('clima');
        expect(listar(['clima', 'saúde'])).toBe('clima e saúde');
        expect(listar(['clima', 'saúde', 'lazer'])).toBe('clima, saúde e lazer');
    });
});

describe('fraseDoPilar', () => {
    const respostas = criarRespostasIniciais();

    it('descreve o dado real de cada pilar', () => {
        expect(fraseDoPilar('seguranca', avaliacao(84, 14.2), respostas)).toBe('14 homicídios por 100 mil habitantes');
        expect(fraseDoPilar('clima', avaliacao(100, 17.9), respostas)).toBe('Temperatura média de 18 °C');
        expect(fraseDoPilar('trabalho', avaliacao(70, 0.48), respostas)).toBe('48 empregos formais a cada 100 habitantes');
        expect(fraseDoPilar('saude', avaliacao(70, 4.1), respostas)).toBe('4,1 médicos por mil habitantes');
        expect(fraseDoPilar('lazer', avaliacao(70, 39), respostas)).toBe('39 restaurantes, bares e espaços culturais por 10 mil habitantes');
        expect(fraseDoPilar('natureza', avaliacao(70, 51), respostas)).toBe('51 m² de parques por habitante');
    });

    it('fala do custo em relação à renda quando ela foi informada', () => {
        const comRenda = { ...respostas, orcamento: { faixaRenda: 'r7a12', tetoMoradia: 2850 } };
        expect(fraseDoPilar('custo', avaliacao(93, 0.2737), comRenda)).toBe('Aluguel compromete cerca de 27% da sua renda');
        expect(fraseDoPilar('custo', avaliacao(60, 1800), respostas)).toBe('Aluguel estimado de R$ 1.800 por mês');
    });

    it('escolhe o indicador de educação conforme a situação da pessoa', () => {
        const estudante = { ...respostas, trabalho: { setores: [], ensinoSuperior: true } };
        expect(fraseDoPilar('educacao', avaliacao(70, 410), estudante)).toBe('410 vagas no ensino superior por 10 mil habitantes');
        expect(fraseDoPilar('educacao', avaliacao(70, 6.25), respostas)).toBe('Ideb médio de 6,3');
    });

    it('avisa quando o dado não existe', () => {
        expect(fraseDoPilar('seguranca', { nota: 50, peso: 'importante', bruto: null, dadoIndisponivel: true }, respostas))
            .toBe('Dado indisponível para esta cidade');
    });
});

describe('textos da cidade', () => {
    const resultado = (pontosFortes, pontosAtencao) => ({ cidade: 'Curitiba, PR', match: 82, pontosFortes, pontosAtencao });

    it('monta o lema a partir dos dois maiores pontos fortes', () => {
        expect(lemaDaCidade(resultado(['seguranca', 'clima', 'natureza'], []))).toBe('Ideal para quem valoriza segurança e clima');
        expect(lemaDaCidade(resultado([], []))).toBe('Equilíbrio entre os critérios que você escolheu');
    });

    it('explica por que a cidade combina, citando os pontos de atenção', () => {
        expect(porQueCombina(resultado(['seguranca', 'natureza'], ['custo'])))
            .toBe('Curitiba se destaca em segurança e natureza, que pesaram no seu match. O ponto de atenção é custo de vida.');
        expect(porQueCombina(resultado(['seguranca'], ['custo', 'clima'])))
            .toBe('Curitiba se destaca em segurança, que pesou no seu match. Os pontos de atenção são custo de vida e clima.');
        expect(porQueCombina(resultado([], [])))
            .toBe('Curitiba tem desempenho equilibrado nos critérios que você escolheu. Nenhum deles ficou abaixo do esperado.');
    });
});
