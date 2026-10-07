// FIXTURE: valores plausíveis, não oficiais, só para desenvolver o onboarding e o motor de score.
// Será substituída pela base gerada na peça (b) da spec, com o mesmo formato.
// aluguel: R$/mês estimado por número de pessoas no domicílio (1 a 4).

export const versaoDados = 'fixture';

export const cidades = [
    { ibge: 3550308, nome: 'São Paulo', uf: 'SP', regiao: 'SE', lat: -23.55, lon: -46.63, populacao: 11451999, litoranea: false, indicadores: { aluguel: { 1: 2600, 2: 3400, 3: 4300, 4: 5200 } } },
    { ibge: 3304557, nome: 'Rio de Janeiro', uf: 'RJ', regiao: 'SE', lat: -22.91, lon: -43.17, populacao: 6211223, litoranea: true, indicadores: { aluguel: { 1: 2300, 2: 3100, 3: 3900, 4: 4700 } } },
    { ibge: 3106200, nome: 'Belo Horizonte', uf: 'MG', regiao: 'SE', lat: -19.92, lon: -43.94, populacao: 2315560, litoranea: false, indicadores: { aluguel: { 1: 1700, 2: 2300, 3: 2900, 4: 3500 } } },
    { ibge: 2927408, nome: 'Salvador', uf: 'BA', regiao: 'NE', lat: -12.97, lon: -38.50, populacao: 2417678, litoranea: true, indicadores: { aluguel: { 1: 1500, 2: 2000, 3: 2600, 4: 3100 } } },
    { ibge: 2304400, nome: 'Fortaleza', uf: 'CE', regiao: 'NE', lat: -3.73, lon: -38.52, populacao: 2428708, litoranea: true, indicadores: { aluguel: { 1: 1400, 2: 1900, 3: 2400, 4: 2900 } } },
    { ibge: 1302603, nome: 'Manaus', uf: 'AM', regiao: 'N', lat: -3.12, lon: -60.02, populacao: 2063689, litoranea: false, indicadores: { aluguel: { 1: 1400, 2: 1800, 3: 2300, 4: 2800 } } },
    { ibge: 4106902, nome: 'Curitiba', uf: 'PR', regiao: 'S', lat: -25.43, lon: -49.27, populacao: 1773718, litoranea: false, indicadores: { aluguel: { 1: 1800, 2: 2400, 3: 3000, 4: 3500 } } },
    { ibge: 2611606, nome: 'Recife', uf: 'PE', regiao: 'NE', lat: -8.05, lon: -34.88, populacao: 1488920, litoranea: true, indicadores: { aluguel: { 1: 1500, 2: 2000, 3: 2500, 4: 3000 } } },
    { ibge: 5208707, nome: 'Goiânia', uf: 'GO', regiao: 'CO', lat: -16.69, lon: -49.26, populacao: 1437366, litoranea: false, indicadores: { aluguel: { 1: 1500, 2: 2000, 3: 2500, 4: 3000 } } },
    { ibge: 4314902, nome: 'Porto Alegre', uf: 'RS', regiao: 'S', lat: -30.03, lon: -51.23, populacao: 1332845, litoranea: false, indicadores: { aluguel: { 1: 1600, 2: 2100, 3: 2700, 4: 3200 } } },
    { ibge: 2408102, nome: 'Natal', uf: 'RN', regiao: 'NE', lat: -5.79, lon: -35.21, populacao: 751300, litoranea: true, indicadores: { aluguel: { 1: 1300, 2: 1700, 3: 2200, 4: 2600 } } },
    { ibge: 3170206, nome: 'Uberlândia', uf: 'MG', regiao: 'SE', lat: -18.92, lon: -48.28, populacao: 713224, litoranea: false, indicadores: { aluguel: { 1: 1300, 2: 1700, 3: 2200, 4: 2600 } } },
    { ibge: 4209102, nome: 'Joinville', uf: 'SC', regiao: 'S', lat: -26.30, lon: -48.85, populacao: 616317, litoranea: false, indicadores: { aluguel: { 1: 1400, 2: 1900, 3: 2400, 4: 2800 } } },
    { ibge: 4205407, nome: 'Florianópolis', uf: 'SC', regiao: 'S', lat: -27.59, lon: -48.55, populacao: 537211, litoranea: true, indicadores: { aluguel: { 1: 2200, 2: 2900, 3: 3600, 4: 4300 } } },
    { ibge: 2504009, nome: 'Campina Grande', uf: 'PB', regiao: 'NE', lat: -7.23, lon: -35.88, populacao: 419379, litoranea: false, indicadores: { aluguel: { 1: 1000, 2: 1300, 3: 1700, 4: 2000 } } },
    { ibge: 4115200, nome: 'Maringá', uf: 'PR', regiao: 'S', lat: -23.42, lon: -51.94, populacao: 409657, litoranea: false, indicadores: { aluguel: { 1: 1300, 2: 1700, 3: 2200, 4: 2600 } } },
];
