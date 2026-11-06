import { useState } from 'react';

// Lista de cidades salvas com atualização otimista: se a gravação falhar, volta ao estado anterior.
export function useCidadesSalvas(cidades, onSalvar) {
    const [salvas, setSalvas] = useState(cidades);
    const [salvando, setSalvando] = useState(false);
    const [erroSalvar, setErroSalvar] = useState(false);

    async function atualizar(novaLista) {
        const anterior = salvas;
        setSalvas(novaLista);
        setSalvando(true);
        setErroSalvar(false);
        const { error } = await onSalvar(novaLista);
        setSalvando(false);
        if (error) {
            setSalvas(anterior);
            setErroSalvar(true);
        }
    }

    function salvar(cidade) {
        if (salvando || salvas.includes(cidade)) return;
        atualizar([...salvas, cidade]);
    }

    function remover(cidade) {
        atualizar(salvas.filter((item) => item !== cidade));
    }

    return { salvas, salvando, erroSalvar, salvar, remover };
}
