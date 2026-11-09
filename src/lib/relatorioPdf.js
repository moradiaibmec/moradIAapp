// Gera, baixa e compartilha o PDF do relatório (o conteúdo vem de src/analise/relatorio.js).
// A jsPDF é importada só quando necessária, para não pesar no restante do app.
import { textoParaCompartilhar } from '../analise/relatorio.js';

const COR = {
    roxo: [79, 70, 229],
    roxoClaro: [224, 231, 255],
    texto: [15, 23, 42],
    secundario: [91, 100, 117],
    borda: [230, 232, 236],
    verde: [5, 150, 105],
    ambar: [180, 83, 9],
    branco: [255, 255, 255],
};

const LARGURA_PAGINA = 210;
const ALTURA_PAGINA = 297;
const MARGEM = 18;
const LARGURA_UTIL = LARGURA_PAGINA - MARGEM * 2;
const LIMITE_INFERIOR = ALTURA_PAGINA - 20;
const ENTRELINHA = 1.35;
const MM_POR_PONTO = 0.3528;
const X_BARRA = 112;
const LARGURA_BARRA = 52;
const LARGURA_TEXTO_INDICADOR = X_BARRA - MARGEM - 6;

const alturaDaLinha = (tamanho) => tamanho * MM_POR_PONTO * ENTRELINHA;

function criarDesenho(doc) {
    let y = MARGEM;

    function estilo(tamanho, peso, cor) {
        doc.setFont('helvetica', peso);
        doc.setFontSize(tamanho);
        doc.setTextColor(...cor);
    }

    const desenho = {
        get y() { return y; },
        pular(espaco) { y += espaco; },
        irPara(novoY) { y = novoY; },
        novaPagina() {
            doc.addPage();
            y = MARGEM;
        },
        garantir(altura) {
            if (y + altura > LIMITE_INFERIOR) desenho.novaPagina();
        },
        linhas(texto, tamanho, peso, largura) {
            estilo(tamanho, peso, COR.texto);
            return doc.splitTextToSize(texto, largura);
        },
        // Escreve o texto com quebra de linha e avança o cursor.
        texto(texto, { tamanho = 10, peso = 'normal', cor = COR.texto, x = MARGEM, largura = LARGURA_UTIL } = {}) {
            const linhas = desenho.linhas(texto, tamanho, peso, largura);
            const altura = alturaDaLinha(tamanho);
            desenho.garantir(altura * linhas.length);
            estilo(tamanho, peso, cor);
            linhas.forEach((linha) => {
                doc.text(linha, x, y + altura * 0.75);
                y += altura;
            });
        },
        textoEm(texto, x, yTexto, { tamanho = 10, peso = 'normal', cor = COR.texto, align = 'left' } = {}) {
            estilo(tamanho, peso, cor);
            doc.text(texto, x, yTexto, { align });
        },
        retangulo(x, yRet, largura, altura, cor, raio = 0) {
            doc.setFillColor(...cor);
            if (raio) doc.roundedRect(x, yRet, largura, altura, raio, raio, 'F');
            else doc.rect(x, yRet, largura, altura, 'F');
        },
        linhaHorizontal(cor = COR.borda) {
            doc.setDrawColor(...cor);
            doc.setLineWidth(0.25);
            doc.line(MARGEM, y, LARGURA_PAGINA - MARGEM, y);
        },
    };
    return desenho;
}

function desenharCapa(desenho, relatorio) {
    const [primeira] = relatorio.ranking;
    desenho.retangulo(0, 0, LARGURA_PAGINA, 62, COR.roxo);
    desenho.textoEm('MoradIA', MARGEM, 20, { tamanho: 13, peso: 'bold', cor: COR.branco });
    desenho.textoEm('Relatório da sua análise', MARGEM, 37, { tamanho: 26, peso: 'bold', cor: COR.branco });
    desenho.textoEm(`Análise de ${relatorio.data}`, MARGEM, 48, { tamanho: 11, cor: COR.roxoClaro });
    desenho.irPara(74);

    if (primeira) {
        desenho.texto('Sua cidade em 1º lugar', { tamanho: 10, peso: 'bold', cor: COR.roxo });
        desenho.pular(1);
        desenho.texto(primeira.cidade, { tamanho: 22, peso: 'bold' });
        desenho.pular(1);
        desenho.texto(`${primeira.match}% de match · ${primeira.qualificacao}`, { tamanho: 12, cor: COR.secundario });
        desenho.pular(9);
    }
}

function desenharPrioridades(desenho, { essenciais, importantes }) {
    if (!essenciais.length && !importantes.length) return;
    desenho.texto('Suas prioridades', { tamanho: 14, peso: 'bold' });
    desenho.pular(2);
    if (essenciais.length) desenho.texto(`Essenciais: ${essenciais.join(', ')}`, { tamanho: 10.5 });
    if (importantes.length) {
        desenho.pular(1);
        desenho.texto(`Importantes: ${importantes.join(', ')}`, { tamanho: 10.5 });
    }
    desenho.pular(9);
}

function desenharRanking(desenho, { ranking, totalCidades }) {
    desenho.texto('Ranking de cidades', { tamanho: 14, peso: 'bold' });
    desenho.pular(1);
    const descricao = totalCidades > ranking.length
        ? `As ${ranking.length} primeiras entre ${totalCidades} cidades que passaram nos seus filtros.`
        : `${totalCidades} ${totalCidades === 1 ? 'cidade passou' : 'cidades passaram'} nos seus filtros.`;
    desenho.texto(descricao, { tamanho: 10, cor: COR.secundario });
    desenho.pular(3);

    ranking.forEach(({ posicao, cidade, match, qualificacao }) => {
        desenho.garantir(9);
        const base = desenho.y + 5.6;
        desenho.linhaHorizontal();
        desenho.textoEm(String(posicao), MARGEM + 1, base, { tamanho: 10, peso: 'bold', cor: COR.secundario });
        desenho.textoEm(cidade, MARGEM + 10, base, { tamanho: 10.5, peso: 'bold' });
        desenho.textoEm(qualificacao, 150, base, { tamanho: 9, cor: COR.secundario, align: 'right' });
        desenho.textoEm(`${match}%`, LARGURA_PAGINA - MARGEM - 1, base, { tamanho: 11, peso: 'bold', cor: COR.roxo, align: 'right' });
        desenho.pular(8.5);
    });
}

const fraseDoIndicador = ({ frase, estimado, pesou }) => [frase, estimado && 'Valor estimado', !pesou && 'Não pesou no match'].filter(Boolean).join(' · ');

function alturaDoIndicador(desenho, indicador) {
    const frase = fraseDoIndicador(indicador);
    const linhas = frase ? desenho.linhas(frase, 8.5, 'normal', LARGURA_TEXTO_INDICADOR).length : 0;
    return 7 + linhas * alturaDaLinha(8.5);
}

function desenharIndicador(desenho, indicador) {
    const { rotulo, nota, qualificacao } = indicador;
    const inicio = desenho.y;
    desenho.textoEm(rotulo, MARGEM, inicio + 4, { tamanho: 10, peso: 'bold' });
    const frase = fraseDoIndicador(indicador);
    if (frase) {
        desenho.irPara(inicio + 5.2);
        desenho.texto(frase, { tamanho: 8.5, cor: COR.secundario, largura: LARGURA_TEXTO_INDICADOR });
    }
    desenho.retangulo(X_BARRA, inicio + 2, LARGURA_BARRA, 2.4, COR.borda, 1.2);
    if (nota !== null && nota > 0) desenho.retangulo(X_BARRA, inicio + 2, Math.max((LARGURA_BARRA * nota) / 100, 2.4), 2.4, COR.roxo, 1.2);
    desenho.textoEm(nota === null ? qualificacao : `${nota}%`, LARGURA_PAGINA - MARGEM, inicio + 4, { tamanho: 9.5, peso: 'bold', align: 'right', cor: nota === null ? COR.secundario : COR.texto });
    desenho.irPara(inicio + alturaDoIndicador(desenho, indicador));
}

function alturaDaCidade(desenho, cidade) {
    const linhasPorQue = desenho.linhas(cidade.porQue, 10, 'normal', LARGURA_UTIL).length;
    const indicadores = cidade.indicadores.reduce((total, indicador) => total + alturaDoIndicador(desenho, indicador), 0);
    const atencao = cidade.pontosAtencao.reduce((total, { rotulo, frase }) => (
        total + desenho.linhas(frase ? `${rotulo}: ${frase}` : rotulo, 9.5, 'normal', LARGURA_UTIL).length * alturaDaLinha(9.5)
    ), 0);
    return 32 + linhasPorQue * alturaDaLinha(10) + indicadores + atencao + 16;
}

function desenharCidade(desenho, cidade) {
    desenho.garantir(alturaDaCidade(desenho, cidade));
    desenho.linhaHorizontal(COR.roxo);
    desenho.pular(4);

    const topo = desenho.y;
    desenho.textoEm(`${cidade.match}%`, LARGURA_PAGINA - MARGEM, topo + 6, { tamanho: 18, peso: 'bold', cor: COR.roxo, align: 'right' });
    desenho.texto(`${cidade.posicao}º lugar`, { tamanho: 9, peso: 'bold', cor: COR.roxo });
    desenho.texto(cidade.cidade, { tamanho: 16, peso: 'bold', largura: LARGURA_UTIL - 28 });
    desenho.texto(cidade.qualificacao, { tamanho: 9.5, cor: COR.secundario });
    desenho.pular(3);
    desenho.texto(cidade.porQue, { tamanho: 10 });
    desenho.pular(4);

    cidade.indicadores.forEach((indicador) => desenharIndicador(desenho, indicador));

    if (cidade.pontosFortes.length) {
        desenho.pular(2);
        desenho.texto(`Pontos fortes: ${cidade.pontosFortes.join(', ')}`, { tamanho: 9.5, peso: 'bold', cor: COR.verde });
    }
    if (cidade.pontosAtencao.length) {
        desenho.pular(2);
        desenho.texto('Pontos de atenção', { tamanho: 9.5, peso: 'bold', cor: COR.ambar });
        cidade.pontosAtencao.forEach(({ rotulo, frase }) => {
            desenho.texto(frase ? `${rotulo}: ${frase}` : rotulo, { tamanho: 9.5 });
        });
    }
    desenho.pular(9);
}

function desenharSobre(desenho, { limitacoes, fontes }) {
    desenho.garantir(50);
    desenho.linhaHorizontal(COR.roxo);
    desenho.pular(5);
    desenho.texto('Limitações que você precisa conhecer', { tamanho: 13, peso: 'bold' });
    desenho.pular(2);
    limitacoes.forEach((limitacao) => {
        desenho.texto(`- ${limitacao}`, { tamanho: 9.5, cor: COR.secundario });
        desenho.pular(1.2);
    });
    if (fontes.length) {
        desenho.pular(5);
        desenho.texto('Fontes dos dados', { tamanho: 13, peso: 'bold' });
        desenho.pular(2);
        desenho.texto(fontes.join('; '), { tamanho: 9.5, cor: COR.secundario });
    }
    desenho.pular(6);
    desenho.texto('Este relatório é uma recomendação baseada em dados públicos e nas suas respostas. Confira as informações antes de tomar uma decisão.', { tamanho: 9.5, cor: COR.secundario });
}

function desenharRodapes(doc, desenho) {
    const total = doc.getNumberOfPages();
    for (let pagina = 1; pagina <= total; pagina += 1) {
        doc.setPage(pagina);
        desenho.textoEm('MoradIA · Relatório da análise', MARGEM, ALTURA_PAGINA - 10, { tamanho: 8, cor: COR.secundario });
        desenho.textoEm(`Página ${pagina} de ${total}`, LARGURA_PAGINA - MARGEM, ALTURA_PAGINA - 10, { tamanho: 8, cor: COR.secundario, align: 'right' });
    }
}

// Antecipa o download da biblioteca: o navegador só abre o menu de compartilhar logo depois do clique.
export function prepararPdf() {
    return import('jspdf').catch(() => null);
}

export async function gerarPdfRelatorio(relatorio) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.setProperties({ title: `Relatório MoradIA, ${relatorio.data}`, creator: 'MoradIA' });
    const desenho = criarDesenho(doc);

    desenharCapa(desenho, relatorio);
    desenharPrioridades(desenho, relatorio.prioridades);
    desenharRanking(desenho, relatorio);
    desenho.novaPagina();
    relatorio.cidades.forEach((cidade) => desenharCidade(desenho, cidade));
    desenharSobre(desenho, relatorio);
    desenharRodapes(doc, desenho);

    return doc.output('blob');
}

export async function baixarRelatorio(relatorio) {
    const pdf = await gerarPdfRelatorio(relatorio);
    const url = URL.createObjectURL(pdf);
    const link = document.createElement('a');
    link.href = url;
    link.download = relatorio.nomeArquivo;
    document.body.append(link);
    link.click();
    link.remove();
    // O navegador precisa da URL até começar o download.
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// Devolve o que aconteceu: 'compartilhado', 'cancelado', 'copiado' ou 'erro'.
export async function compartilharRelatorio(relatorio) {
    const texto = textoParaCompartilhar(relatorio);
    try {
        const pdf = await gerarPdfRelatorio(relatorio);
        const arquivo = new File([pdf], relatorio.nomeArquivo, { type: 'application/pdf' });
        if (navigator.canShare?.({ files: [arquivo] })) {
            await navigator.share({ files: [arquivo], title: 'Meu relatório MoradIA', text: texto });
            return 'compartilhado';
        }
    } catch (erro) {
        if (erro.name === 'AbortError') return 'cancelado';
    }

    try {
        await navigator.clipboard.writeText(texto);
        return 'copiado';
    } catch {
        return 'erro';
    }
}
