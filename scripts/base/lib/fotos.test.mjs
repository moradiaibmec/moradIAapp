import { describe, expect, it } from 'vitest';
import { arquivoDaImagem, limparHtml, montarFoto, semRastreio } from './fotos.mjs';

describe('arquivoDaImagem', () => {
    it('extrai o nome do arquivo do link Special:FilePath do Wikidata', () => {
        expect(arquivoDaImagem('http://commons.wikimedia.org/wiki/Special:FilePath/Montagem%20Maring%C3%A1.jpg')).toBe('Montagem Maringá.jpg');
    });
});

describe('limparHtml', () => {
    it('tira as tags e decodifica entidades comuns', () => {
        expect(limparHtml('<a href="https://flickr.com/x">Thomas &amp; Ana</a>\n')).toBe('Thomas & Ana');
        expect(limparHtml('<span class="fn">José</span> (<a href="/u">fala</a>)')).toBe('José (fala)');
    });
});

describe('semRastreio', () => {
    it('remove os parâmetros utm_ das URLs do Commons', () => {
        expect(semRastreio('https://upload.wikimedia.org/a/b.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo'))
            .toBe('https://upload.wikimedia.org/a/b.jpg');
    });
});

const info = (thumburl, extmetadata) => ({
    thumburl,
    descriptionurl: 'https://commons.wikimedia.org/wiki/File:Curitiba.jpg',
    extmetadata,
});

describe('montarFoto', () => {
    const metadados = {
        Artist: { value: '<a href="https://www.flickr.com/people/x">Thomas Hobbs</a>' },
        LicenseShortName: { value: 'CC BY-SA 2.0' },
        LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/2.0' },
    };

    it('junta as duas larguras e o crédito exigido pela licença', () => {
        const foto = montarFoto(
            info('https://upload.wikimedia.org/thumb/1280px-Curitiba.jpg?utm_source=x', metadados),
            info('https://upload.wikimedia.org/thumb/500px-Curitiba.jpg?utm_source=x', metadados),
        );
        expect(foto).toEqual({
            url: 'https://upload.wikimedia.org/thumb/1280px-Curitiba.jpg',
            miniatura: 'https://upload.wikimedia.org/thumb/500px-Curitiba.jpg',
            autor: 'Thomas Hobbs',
            licenca: 'CC BY-SA 2.0',
            urlLicenca: 'https://creativecommons.org/licenses/by-sa/2.0',
            pagina: 'https://commons.wikimedia.org/wiki/File:Curitiba.jpg',
        });
    });

    it('usa a imagem grande como miniatura quando falta a pequena e marca autor desconhecido', () => {
        const foto = montarFoto(info('https://upload.wikimedia.org/a.jpg', { LicenseShortName: { value: 'Public domain' } }), undefined);
        expect(foto.miniatura).toBe('https://upload.wikimedia.org/a.jpg');
        expect(foto.autor).toBe('Autor desconhecido');
        expect(foto.urlLicenca).toBeNull();
    });

    it('descarta a foto sem licença informada', () => {
        expect(montarFoto(info('https://upload.wikimedia.org/a.jpg', {}), undefined)).toBeNull();
        expect(montarFoto(undefined, undefined)).toBeNull();
    });
});
