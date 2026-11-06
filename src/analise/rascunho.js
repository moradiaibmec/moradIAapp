// Rascunho do questionário: guarda as respostas durante a sessão da aba para o F5 não apagar o que já foi preenchido.
// Por pessoa, para a próxima conta no mesmo navegador não herdar as respostas. Sem armazenamento disponível, só não há rascunho.
const chave = (idUsuario) => `moradia:rascunho:${idUsuario}`;

export function lerRascunho(idUsuario) {
    try {
        return JSON.parse(sessionStorage.getItem(chave(idUsuario)));
    } catch {
        return null;
    }
}

export function gravarRascunho(idUsuario, rascunho) {
    try {
        sessionStorage.setItem(chave(idUsuario), JSON.stringify(rascunho));
    } catch {
        // O questionário continua funcionando, só sem sobreviver ao F5.
    }
}

export function apagarRascunho(idUsuario) {
    try {
        sessionStorage.removeItem(chave(idUsuario));
    } catch {
        // Nada a apagar.
    }
}
