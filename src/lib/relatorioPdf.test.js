import { afterEach, describe, expect, it, vi } from 'vitest';
import { compartilharRelatorio, gerarPdfRelatorio } from './relatorioPdf.js';

const indicador = (id, rotulo, nota) => ({
    id, rotulo, nota, qualificacao: nota === null ? 'Sem dado' : 'Bom', frase: 'Frase longa do indicador com acentuação', estimado: id === 'custo', pesou: true,
});

const cidade = (posicao) => ({
    posicao,
    cidade: `São José ${posicao}, SP`,
    estado: 'São Paulo',
    match: 90 - posicao,
    qualificacao: 'Compatibilidade alta',
    lema: 'Ideal para quem valoriza segurança',
    porQue: 'Esta cidade se destaca em segurança, que pesou no seu match.',
    indicadores: [indicador('custo', 'Custo', 70), indicador('saude', 'Saúde', null)],
    pontosFortes: ['Segurança'],
    pontosAtencao: [{ rotulo: 'Clima', frase: 'Temperatura média de 30 °C' }],
});

const relatorio = {
    data: '06 de novembro de 2026',
    nomeArquivo: 'moradia-relatorio-2026-11-06.pdf',
    totalCidades: 10,
    prioridades: { essenciais: ['Segurança'], importantes: ['Clima'] },
    ranking: Array.from({ length: 10 }, (_, indice) => ({
        posicao: indice + 1, cidade: `São José ${indice + 1}, SP`, match: 89 - indice, qualificacao: 'Compatibilidade alta',
    })),
    cidades: Array.from({ length: 10 }, (_, indice) => cidade(indice + 1)),
    limitacoes: ['Custo de vida considera só o aluguel.'],
    fontes: ['FipeZap, set/2026'],
};

describe('gerarPdfRelatorio', () => {
    it('gera um PDF com várias páginas', async () => {
        const pdf = await gerarPdfRelatorio(relatorio);
        const conteudo = await pdf.text();
        expect(pdf.type).toBe('application/pdf');
        expect(conteudo.startsWith('%PDF-')).toBe(true);
        expect(Number(conteudo.match(/\/Count (\d+)/)[1])).toBeGreaterThan(1);
    });
});

describe('compartilharRelatorio', () => {
    afterEach(() => vi.unstubAllGlobals());

    const stubNavegador = (navegador) => vi.stubGlobal('navigator', navegador);

    it('envia o PDF pelo menu de compartilhamento quando o navegador aceita arquivos', async () => {
        const share = vi.fn().mockResolvedValue();
        stubNavegador({ canShare: () => true, share, clipboard: { writeText: vi.fn() } });

        await expect(compartilharRelatorio(relatorio)).resolves.toBe('compartilhado');
        const [{ files, text }] = share.mock.calls[0];
        expect(files[0].name).toBe(relatorio.nomeArquivo);
        expect(text).toContain('MoradIA');
    });

    it('não faz nada quando a pessoa cancela o compartilhamento', async () => {
        const writeText = vi.fn();
        const cancelou = Object.assign(new Error('cancelou'), { name: 'AbortError' });
        stubNavegador({ canShare: () => true, share: vi.fn().mockRejectedValue(cancelou), clipboard: { writeText } });

        await expect(compartilharRelatorio(relatorio)).resolves.toBe('cancelado');
        expect(writeText).not.toHaveBeenCalled();
    });

    it('copia um resumo quando o navegador não compartilha arquivos', async () => {
        const writeText = vi.fn().mockResolvedValue();
        stubNavegador({ clipboard: { writeText } });

        await expect(compartilharRelatorio(relatorio)).resolves.toBe('copiado');
        expect(writeText.mock.calls[0][0]).toContain('1. São José 1, SP: 89% de match');
    });

    it('copia o resumo também quando o compartilhamento falha por outro motivo', async () => {
        const writeText = vi.fn().mockResolvedValue();
        const bloqueado = Object.assign(new Error('bloqueado'), { name: 'NotAllowedError' });
        stubNavegador({ canShare: () => true, share: vi.fn().mockRejectedValue(bloqueado), clipboard: { writeText } });

        await expect(compartilharRelatorio(relatorio)).resolves.toBe('copiado');
    });

    it('avisa quando nada funcionou', async () => {
        stubNavegador({ clipboard: { writeText: vi.fn().mockRejectedValue(new Error('negado')) } });
        await expect(compartilharRelatorio(relatorio)).resolves.toBe('erro');
    });
});
