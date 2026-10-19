// Valida src/dados/cidades.json. Uso: npm run base:validar
import { readFile } from 'node:fs/promises';
import { listarUniverso } from './fontes/ibge.mjs';
import { coletarFipezap } from './fontes/fipezap.mjs';
import { validarBase } from './lib/validacao.mjs';

const base = JSON.parse(await readFile(new URL('../../src/dados/cidades.json', import.meta.url), 'utf8'));
const { todos } = await listarUniverso();
const { porIbge } = await coletarFipezap(todos);
const erros = validarBase(base, { ibgesFipezap: new Set(porIbge.keys()) });

if (erros.length) {
    console.error('Base inválida:');
    for (const erro of erros) console.error(`  - ${erro}`);
    process.exit(1);
}
console.log(`Base válida: ${base.cidades.length} cidades`);
