// Fotos das cidades: imagem principal (P18) do Wikidata, com crédito e licença do Wikimedia Commons.

export function arquivoDaImagem(uri) {
    return decodeURIComponent(uri.slice(uri.lastIndexOf('/') + 1));
}

const ENTIDADES = { '&amp;': '&', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ' };

export function limparHtml(html) {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&(amp|quot|#39|lt|gt|nbsp);/g, (entidade) => ENTIDADES[entidade])
        .replace(/\s+/g, ' ')
        .trim();
}

export function semRastreio(url) {
    const limpa = new URL(url);
    for (const chave of [...limpa.searchParams.keys()]) if (chave.startsWith('utm_')) limpa.searchParams.delete(chave);
    return limpa.toString();
}

// `grande` e `pequena` são os imageinfo do mesmo arquivo pedidos em larguras diferentes.
// Sem licença conhecida não dá para creditar a foto, então ela não entra.
export function montarFoto(grande, pequena) {
    const metadados = grande?.extmetadata ?? {};
    const licenca = metadados.LicenseShortName?.value;
    if (!grande?.thumburl || !licenca) return null;
    const autor = metadados.Artist?.value ? limparHtml(metadados.Artist.value) : '';
    return {
        url: semRastreio(grande.thumburl),
        miniatura: semRastreio(pequena?.thumburl ?? grande.thumburl),
        autor: autor || 'Autor desconhecido',
        licenca: limparHtml(licenca),
        urlLicenca: metadados.LicenseUrl?.value ?? null,
        pagina: grande.descriptionurl,
    };
}
