import { describe, expect, it } from 'vitest';
import { PILARES } from './opcoes.js';
import {
    buscarParaComparar, indiceDoMaior, ordenarComparadas, indiceDoMenor, pilaresComparaveis, pilaresPorPeso, vencedoresDoPilar, veredito, vitoriasPorCidade,
} from './comparacao.js';

const PESOS = {
    custo: 'essencial', seguranca: 'essencial', clima: 'importante', trabalho: 'importante',
    saude: 'tantoFaz', educacao: 'tantoFaz', lazer: 'importante', natureza: 'importante',
};

// Cria um resultado com nota 50 em todos os pilares, exceto os informados em `notas`.
function resultado(cidade, notas = {}, semDado = []) {
    return {
        cidade,
        notas: Object.fromEntries(PILARES.map(({ id }) => [
            id,
            { nota: notas[id] ?? 50, peso: PESOS[id], dadoIndisponivel: semDado.includes(id) },
        ])),
    };
}

describe('pilaresPorPeso', () => {
    it('ordena do peso alto ao baixo, mantendo a ordem original no empate', () => {
        const ids = pilaresPorPeso(resultado('Curitiba, PR').notas).map(({ id }) => id);
        expect(ids).toEqual(['custo', 'seguranca', 'clima', 'trabalho', 'lazer', 'natureza', 'saude', 'educacao']);
    });
});

describe('vencedoresDoPilar', () => {
    it('aponta a cidade com a maior nota', () => {
        const resultados = [resultado('A, PR', { clima: 60 }), resultado('B, SC', { clima: 90 }), resultado('C, MG', { clima: 70 })];
        expect(vencedoresDoPilar(resultados, 'clima')).toEqual([1]);
    });

    it('aceita empate no topo, mas ninguém vence se todas empatam', () => {
        const resultados = [resultado('A, PR', { clima: 90 }), resultado('B, SC', { clima: 90 }), resultado('C, MG', { clima: 70 })];
        expect(vencedoresDoPilar(resultados, 'clima')).toEqual([0, 1]);
        expect(vencedoresDoPilar(resultados, 'lazer')).toEqual([]);
    });

    it('ignora cidades sem dado no pilar', () => {
        const resultados = [resultado('A, PR', { clima: 90 }, ['clima']), resultado('B, SC', { clima: 60 })];
        expect(vencedoresDoPilar(resultados, 'clima')).toEqual([1]);
    });
});

describe('vitoriasPorCidade e pilaresComparaveis', () => {
    it('conta os pilares vencidos por cada cidade', () => {
        const resultados = [resultado('A, PR', { custo: 90, seguranca: 90 }), resultado('B, SC', { clima: 90 })];
        expect(vitoriasPorCidade(resultados)).toEqual([2, 1]);
    });

    it('deixa de fora pilares sem dado em nenhuma cidade', () => {
        const resultados = [resultado('A, PR', {}, ['saude']), resultado('B, SC', {}, ['saude'])];
        expect(pilaresComparaveis(resultados)).toBe(7);
    });
});

describe('indiceDoMenor e indiceDoMaior', () => {
    it('acham o extremo ignorando valores ausentes', () => {
        expect(indiceDoMenor([1800, null, 1500])).toBe(2);
        expect(indiceDoMaior([1800, null, 1500])).toBe(0);
    });

    it('não destacam ninguém em empate ou com um valor só', () => {
        expect(indiceDoMenor([1500, 1500, 2000])).toBeNull();
        expect(indiceDoMenor([1500, null])).toBeNull();
    });
});

describe('veredito', () => {
    const curitiba = resultado('Curitiba, PR', { seguranca: 92, custo: 88, trabalho: 89 });
    const floripa = resultado('Florianópolis, SC', { clima: 92, natureza: 97, custo: 75 });
    const bh = resultado('Belo Horizonte, MG', { lazer: 91, custo: 80 });

    it('recomenda a primeira cidade e cita os critérios em que ela lidera', () => {
        const { titulo, texto } = veredito([curitiba, floripa, bh], [1800, 2300, 1500]);
        expect(titulo).toBe('Curitiba vence nos critérios que mais pesam para você');
        expect(texto).toBe(
            'Lidera em custo de vida, segurança e trabalho. '
            + 'Florianópolis é a melhor alternativa se você priorizar clima e natureza; '
            + 'Belo Horizonte se destaca em lazer e cultura, e oferece o menor aluguel.',
        );
    });

    it('reforça o peso alto quando todos os critérios citados são essenciais', () => {
        const { texto } = veredito([resultado('Curitiba, PR', { custo: 90, seguranca: 90 }), resultado('Recife, PE')]);
        expect(texto).toBe('Lidera em custo de vida e segurança — todos com peso alto no seu perfil.');
    });

    it('não diz que vence nos critérios que mais pesam se outra cidade lidera mais critérios essenciais', () => {
        // Natureza vira essencial: Curitiba lidera 1 critério essencial, Pelotas lidera 2.
        const comNaturezaEssencial = (r) => ({ ...r, notas: { ...r.notas, natureza: { ...r.notas.natureza, peso: 'essencial' } } });
        const curitiba = comNaturezaEssencial(resultado('Curitiba, PR', { natureza: 90 }));
        const pelotas = comNaturezaEssencial(resultado('Pelotas, RS', { custo: 90, seguranca: 90 }));
        const { titulo } = veredito([curitiba, pelotas]);
        expect(titulo).toBe('Curitiba tem o maior match para o seu perfil');
    });

    it('explica o match quando a primeira cidade não lidera nenhum critério', () => {
        const { titulo, texto } = veredito([resultado('Curitiba, PR'), resultado('Recife, PE', { clima: 90 })]);
        expect(titulo).toBe('Curitiba tem o maior match para o seu perfil');
        expect(texto).toBe(
            'Não lidera sozinha nenhum critério, mas tem o melhor equilíbrio entre eles. '
            + 'Recife é a melhor alternativa se você priorizar clima.',
        );
    });
});

describe('ordenarComparadas', () => {
    // Todas as cidades avaliadas, do maior para o menor match; o ranking só tem as que passam nos filtros.
    const avaliadas = ['Santos, SP', 'Curitiba, PR', 'Recife, PE', 'Joinville, SC'].map((cidade) => ({ ibge: cidade, cidade }));
    const ranking = [avaliadas[1], avaliadas[3]];

    it('põe as cidades do ranking primeiro, na ordem dele, e depois as de fora, do maior para o menor match', () => {
        const comparadas = ['Recife, PE', 'Joinville, SC', 'Santos, SP', 'Curitiba, PR'];
        expect(ordenarComparadas(avaliadas, ranking, comparadas).map(({ cidade }) => cidade))
            .toEqual(['Curitiba, PR', 'Joinville, SC', 'Santos, SP', 'Recife, PE']);
    });
});

describe('buscarParaComparar', () => {
    const avaliadas = [
        { ibge: 1, cidade: 'Campinas, SP', match: 80 },
        { ibge: 2, cidade: 'São José dos Campos, SP', match: 75 },
        { ibge: 3, cidade: 'Campina Grande, PB', match: 70 },
        { ibge: 4, cidade: 'Campo Grande, MS', match: 60 },
        { ibge: 5, cidade: 'São Paulo, SP', match: 50 },
    ];

    it('ignora acentos e maiúsculas e põe quem começa com o termo antes de quem só o contém', () => {
        expect(buscarParaComparar(avaliadas, [], 'CAMP').map(({ ibge }) => ibge)).toEqual([1, 3, 4, 2]);
        expect(buscarParaComparar(avaliadas, [], 'sao').map(({ ibge }) => ibge)).toEqual([2, 5]);
    });

    it('não sugere cidades que já estão na comparação nem busca com termo vazio', () => {
        expect(buscarParaComparar(avaliadas, [1, 3], 'camp').map(({ ibge }) => ibge)).toEqual([4, 2]);
        expect(buscarParaComparar(avaliadas, [], '  ')).toEqual([]);
    });

    it('prefere o nome exato', () => {
        expect(buscarParaComparar(avaliadas, [], 'campo grande').map(({ ibge }) => ibge)).toEqual([4]);
    });
});
