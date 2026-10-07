// Opções do questionário de análise. Os ids são gravados nas respostas;
// os rótulos só aparecem na interface.

export const PILARES = [
    { id: 'custo', rotulo: 'Custo de vida', descricao: 'Quanto da sua renda a cidade compromete com moradia e custos básicos.' },
    { id: 'seguranca', rotulo: 'Segurança', descricao: 'Taxa de homicídios por 100 mil habitantes.' },
    { id: 'clima', rotulo: 'Clima', descricao: 'O quanto o clima da cidade combina com o que você prefere.' },
    { id: 'trabalho', rotulo: 'Trabalho', descricao: 'Emprego formal e oportunidades no seu setor.' },
    { id: 'saude', rotulo: 'Saúde', descricao: 'Médicos e leitos por habitante.' },
    { id: 'educacao', rotulo: 'Educação', descricao: 'Qualidade das escolas e oferta de ensino superior.' },
    { id: 'lazer', rotulo: 'Lazer & cultura', descricao: 'Restaurantes, bares e equipamentos culturais por habitante.' },
    { id: 'natureza', rotulo: 'Natureza', descricao: 'Parques, áreas verdes e praia.' },
];

export const NIVEIS_IMPORTANCIA = [
    { id: 'essencial', rotulo: 'Essencial' },
    { id: 'importante', rotulo: 'Importante' },
    { id: 'tantoFaz', rotulo: 'Tanto faz' },
];

export const MAXIMO_ESSENCIAIS = 3;

export const OPCOES_MORADIA = [
    { id: 'sozinho', rotulo: 'Sozinho(a)' },
    { id: 'parceiro', rotulo: 'Com parceiro(a)' },
    { id: 'familia', rotulo: 'Com família' },
    { id: 'amigos', rotulo: 'Com amigos' },
];

export const SIM_NAO = [
    { id: 'sim', rotulo: 'Sim' },
    { id: 'nao', rotulo: 'Não' },
];

export const OPCOES_SITUACAO = [
    { id: 'remoto', rotulo: 'Remoto' },
    { id: 'hibrido', rotulo: 'Híbrido' },
    { id: 'presencial', rotulo: 'Presencial' },
    { id: 'procurando', rotulo: 'Procurando emprego' },
    { id: 'estudo', rotulo: 'Estudo ou vou estudar' },
    { id: 'aposentado', rotulo: 'Aposentado(a)' },
    { id: 'naoTrabalho', rotulo: 'Não trabalho no momento' },
];

// Situações em que o mercado de trabalho ou o estudo local importam: exibem a etapa 4.
export const SITUACOES_COM_TRABALHO = ['presencial', 'hibrido', 'procurando', 'estudo'];

export const OPCOES_MOTIVACAO = [
    { id: 'economizar', rotulo: 'Economizar' },
    { id: 'qualidadeVida', rotulo: 'Qualidade de vida' },
    { id: 'carreira', rotulo: 'Carreira' },
    { id: 'estudar', rotulo: 'Estudar' },
    { id: 'pertoDeAlguem', rotulo: 'Ficar perto de alguém' },
    { id: 'recomecar', rotulo: 'Recomeçar' },
];

export const FAIXAS_RENDA = [
    { id: 'r0a2', rotulo: 'Até R$ 2.000', pontoMedio: 1500 },
    { id: 'r2a4', rotulo: 'R$ 2.000 - R$ 4.000', pontoMedio: 3000 },
    { id: 'r4a7', rotulo: 'R$ 4.000 - R$ 7.000', pontoMedio: 5500 },
    { id: 'r7a12', rotulo: 'R$ 7.000 - R$ 12.000', pontoMedio: 9500 },
    { id: 'r12a20', rotulo: 'R$ 12.000 - R$ 20.000', pontoMedio: 16000 },
    { id: 'r20', rotulo: 'Acima de R$ 20.000', pontoMedio: 25000 },
];

export const TETO_MINIMO = 500;
export const TETO_MAXIMO = 8000;
export const PASSO_TETO = 50;
export const TOLERANCIA_TETO = 1.1;

export const REGIOES = [
    { id: 'N', rotulo: 'Norte' },
    { id: 'NE', rotulo: 'Nordeste' },
    { id: 'CO', rotulo: 'Centro-Oeste' },
    { id: 'SE', rotulo: 'Sudeste' },
    { id: 'S', rotulo: 'Sul' },
];

// Em ordem decrescente de população mínima (o ranking só tem cidades com mais de ~100 mil habitantes).
export const PORTES = [
    { id: 'metropole', rotulo: 'Metrópole', detalhe: 'Mais de 1 milhão', minimo: 1_000_000 },
    { id: 'grande', rotulo: 'Grande', detalhe: '500 mil a 1 milhão', minimo: 500_000 },
    { id: 'media', rotulo: 'Média', detalhe: '100 a 500 mil', minimo: 0 },
];

export const RAIOS_KM = [100, 300, 600];
export const RAIO_PADRAO_KM = 300;

export const OPCOES_PRAIA = [
    { id: 'indispensavel', rotulo: 'Indispensável' },
    { id: 'bom', rotulo: 'Seria bom' },
    { id: 'tantoFaz', rotulo: 'Tanto faz' },
];

export const SETORES = [
    { id: 'tecnologia', rotulo: 'Tecnologia' },
    { id: 'financas', rotulo: 'Finanças' },
    { id: 'saude', rotulo: 'Saúde' },
    { id: 'educacao', rotulo: 'Educação' },
    { id: 'industria', rotulo: 'Indústria' },
    { id: 'comercio', rotulo: 'Comércio' },
    { id: 'servicos', rotulo: 'Serviços' },
    { id: 'agronegocio', rotulo: 'Agronegócio' },
    { id: 'outro', rotulo: 'Outro' },
];

export const MAXIMO_SETORES = 2;

export const OPCOES_TEMPERATURA = [
    { id: 'calor', rotulo: 'Calor o ano todo' },
    { id: 'ameno', rotulo: 'Ameno' },
    { id: 'frio', rotulo: 'Gosto de inverno frio' },
    { id: 'tantoFaz', rotulo: 'Tanto faz' },
];
