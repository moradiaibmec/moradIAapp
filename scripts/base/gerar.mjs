// Gera src/dados/cidades.json a partir das fontes públicas. Uso: npm run base:gerar
// Só grava o arquivo se a validação passar; qualquer falha encerra com código 1 sem tocar na base atual.
import { writeFile } from 'node:fs/promises';
import { coletarAluguel2010, coletarArborizacao, coletarEmprego, listarUniverso } from './fontes/ibge.mjs';
import { coletarFipezap } from './fontes/fipezap.mjs';
import { coletarHomicidios } from './fontes/ipeadata.mjs';
import { coletarClima } from './fontes/power.mjs';
import { coletarLeitos } from './fontes/leitos.mjs';
import { coletarInep } from './fontes/inep.mjs';
import { coletarLitoral } from './fontes/litoral.mjs';
import { aluguelPorTamanho, calibrarFator, estimarM2 } from './lib/aluguel.mjs';
import { aplicarFaixas, montarBase, montarCidade } from './lib/montagem.mjs';
import { validarBase } from './lib/validacao.mjs';

const DESTINO = new URL('../../src/dados/cidades.json', import.meta.url);
const log = (...partes) => console.log(...partes);

async function etapa(nome, tarefa) {
    log(`→ ${nome}…`);
    const resultado = await tarefa();
    for (const aviso of resultado?.avisos ?? []) log(`   aviso: ${aviso}`);
    return resultado;
}

async function gerar() {
    const { todos, universo } = await etapa('Universo (IBGE, Censo 2022)', listarUniverso);
    log(`   ${universo.length} municípios com 100 mil habitantes ou mais`);

    const fipezap = await etapa('Aluguel medido (FipeZap)', () => coletarFipezap(todos));
    const comAluguelMedido = new Set([...fipezap.porIbge.keys()]);
    const medianas = await etapa('Aluguel de 2010 (Censo)', () => coletarAluguel2010([...new Set([...universo.map((m) => m.ibge), ...comAluguelMedido])]));

    const pares = [...comAluguelMedido].filter((ibge) => medianas.get(ibge)).map((ibge) => ({ mediana: medianas.get(ibge), m2: fipezap.porIbge.get(ibge) }));
    const fator = calibrarFator(pares);
    log(`   fator da estimativa: aluguel de 55 m² hoje = ${fator.toFixed(2)} × mediana de 2010 (calibrado em ${pares.length} cidades com FipeZap)`);

    const coletas = [
        await etapa('Emprego (IBGE CEMPRE)', () => coletarEmprego(universo)),
        await etapa('Homicídios (Ipeadata)', () => coletarHomicidios(universo)),
        await etapa('Leitos (Ministério da Saúde)', () => coletarLeitos(universo)),
        await etapa('Educação (INEP)', () => coletarInep(universo)),
        await etapa('Clima (NASA POWER) — uma requisição por cidade', () => coletarClima(universo)),
        await etapa('Arborização (IBGE, Censo 2022)', () => coletarArborizacao(universo)),
    ];
    const litoral = await etapa('Litoral (IBGE)', coletarLitoral);

    const fontes = Object.assign(
        {
            aluguel: {
                nome: 'FipeZap (Locação) e estimativa MoradIA', periodo: fipezap.periodo, url: fipezap.url,
                comoEstimado: 'Calculado pelo MoradIA a partir do Censo 2010 e do FipeZap',
            },
        },
        litoral.fonte,
        ...coletas.map((c) => c.fonte),
    );

    const cidades = universo.map((municipio) => {
        const medido = fipezap.porIbge.get(municipio.ibge);
        const mediana = medianas.get(municipio.ibge);
        const m2 = medido ?? (mediana ? estimarM2(fator, mediana) : null);
        const estimados = medido === undefined && m2 !== null ? ['aluguel'] : [];
        const juntos = Object.assign({ aluguel: m2 === null ? null : aluguelPorTamanho(m2) }, ...coletas.map((c) => c.porIbge.get(municipio.ibge) ?? {}));
        const { indicadores, foraDaFaixa } = aplicarFaixas(juntos);
        if (foraDaFaixa.length) log(`   fora da faixa em ${municipio.nome}, ${municipio.uf}: ${foraDaFaixa.join(', ')} (anulado)`);
        const { ibge, nome, uf, regiao, lat, lon, populacao } = municipio;
        return montarCidade({ ibge, nome, uf, regiao, lat, lon, populacao, litoranea: litoral.litoraneas.has(ibge) }, [indicadores], estimados);
    });

    const base = montarBase(cidades, fontes, new Date());
    const erros = validarBase(base, { ibgesFipezap: comAluguelMedido });
    if (erros.length) {
        console.error('\nA base não passou na validação; cidades.json não foi alterado:');
        for (const erro of erros) console.error(`  - ${erro}`);
        process.exit(1);
    }

    await writeFile(DESTINO, `${JSON.stringify(base, null, 2)}\n`);
    const estimadas = cidades.filter((c) => c.estimados.length).length;
    log(`\nBase gravada: ${cidades.length} cidades (${cidades.length - estimadas} com aluguel medido, ${estimadas} estimado).`);
}

gerar().catch((erro) => {
    console.error(`\nFalha na geração; cidades.json não foi alterado.\n${erro.stack ?? erro.message}`);
    process.exit(1);
});
