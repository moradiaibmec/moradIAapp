import { useId, useState } from 'react';
import styled from "styled-components"
import { FiCheck } from 'react-icons/fi';
import CabecalhoApp from '../CabecalhoApp/index.jsx';
import Selecao from '../Selecao/index.jsx';
import CidadesSalvas from '../CidadesSalvas/index.jsx';
import { supabase } from '../../lib/supabase.js';
import {
    opcoesEstadoCivil, opcoesGenero, opcoesModeloTrabalho, opcoesOrcamento, opcoesPrioridades,
} from '../../dados/opcoesPerfil.js';

const Pagina = styled.div`
    min-height: 100vh;
    background-color: #F8FAFC;
    font-family: var(--fonte-moradia);
`;

const Conteudo = styled.main`
    display: flex;
    align-items: flex-start;
    gap: 32px;
    max-width: 1440px;
    margin: 0 auto;
    padding: 48px 80px 80px;

    @media (max-width: 1100px) {
        flex-direction: column;
        align-items: stretch;
    }

    @media (max-width: 900px) {
        padding: 32px 16px 64px;
    }
`;

const BarraLateral = styled.aside`
    position: sticky;
    top: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex-shrink: 0;
    width: 360px;
    padding: 32px;
    border: 1px solid #E5E7EB;
    border-radius: 24px;
    background-color: #FFFFFF;
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.02);

    @media (max-width: 1100px) {
        position: static;
        width: auto;
    }

    @media (max-width: 600px) {
        padding: 24px;
    }
`;

const Identidade = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
`;

const Avatar = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
`;

const AvatarIniciais = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #EEF2FF;
    color: var(--roxo-moradia);
    font-size: 36px;
    font-weight: 800;
`;

const NomeUsuario = styled.p`
    font-size: 20px;
    font-weight: 800;
    color: #111827;
`;

const TextoSuave = styled.p`
    margin-top: 4px;
    font-size: 13px;
    color: #6B7280;
`;

const Divisoria = styled.hr`
    width: 100%;
    margin: 0;
    border: none;
    border-top: 1px solid #E5E7EB;
`;

const Estatisticas = styled.dl`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0;
    font-size: 14px;

    div {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    dt {
        color: #6B7280;
    }

    dd {
        margin: 0;
        font-weight: 700;
        color: #111827;
    }
`;

const MenuSecoes = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ItemMenu = styled.a`
    padding: 10px 16px;
    border-radius: 8px;
    background-color: ${({ $ativo }) => ($ativo ? '#EEF2FF' : 'transparent')};
    color: ${({ $ativo }) => ($ativo ? 'var(--roxo-moradia)' : '#6B7280')};
    font-size: 14px;
    font-weight: ${({ $ativo }) => ($ativo ? 700 : 500)};
    text-decoration: none;
    transition: background-color 0.2s;

    &:hover {
        background-color: #EEF2FF;
    }
`;

const Formularios = styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
    flex: 1;
    min-width: 0;
`;

const Cartao = styled.section`
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 32px;
    border: 1px solid #E5E7EB;
    border-radius: 20px;
    background-color: #FFFFFF;
    scroll-margin-top: 24px;

    @media (max-width: 600px) {
        padding: 24px;
    }
`;

const TituloCartao = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
`;

const Campos = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px 16px;

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const Campo = styled.label`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    font-size: 13px;
    font-weight: 600;
    color: #6B7280;
`;

const estiloEntrada = `
    width: 100%;
    box-sizing: border-box;
    padding: 12px 16px;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    background-color: #FFFFFF;
    color: #111827;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 400;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
        outline: none;
        border-color: var(--roxo-moradia);
        box-shadow: 0 0 0 3px #EEF2FF;
    }

    &::placeholder {
        color: #9CA3AF;
    }
`;

const Entrada = styled.input`
    ${estiloEntrada}

    &:read-only {
        background-color: #F8FAFC;
        color: #6B7280;
        cursor: not-allowed;
    }
`;

const Grupo = styled.fieldset`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 0;
    border: none;

    legend {
        margin-bottom: 12px;
        padding: 0;
        font-size: 13px;
        font-weight: 600;
        color: #6B7280;
    }
`;

const Etiquetas = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const Etiqueta = styled.button`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: 1px solid ${({ $ativa }) => ($ativa ? 'var(--roxo-moradia)' : '#E5E7EB')};
    border-radius: 20px;
    background-color: ${({ $ativa }) => ($ativa ? '#EEF2FF' : '#FFFFFF')};
    color: ${({ $ativa }) => ($ativa ? 'var(--roxo-moradia)' : '#6B7280')};
    font-family: var(--fonte-moradia);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;

    &:hover {
        border-color: var(--roxo-moradia);
    }
`;

const Acoes = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
`;

const Aviso = styled.p`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-right: auto;
    font-size: 13px;
    font-weight: 600;
    color: ${({ $erro }) => ($erro ? '#DC2626' : '#10B981')};
`;

const Botao = styled.button`
    padding: 10px 20px;
    border-radius: 8px;
    font-family: var(--fonte-moradia);
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.2s, opacity 0.2s;

    &:disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

const BotaoSecundario = styled(Botao)`
    border: 1px solid #E5E7EB;
    background-color: #FFFFFF;
    color: #6B7280;

    &:hover:not(:disabled) {
        background-color: #F8FAFC;
    }
`;

const BotaoPrimario = styled(Botao)`
    border: 1px solid var(--roxo-moradia);
    background-color: var(--roxo-moradia);
    color: #FFFFFF;

    &:hover:not(:disabled) {
        background-color: #4338CA;
    }
`;

const Selo = styled.span`
    flex-shrink: 0;
    padding: ${({ $pilula }) => ($pilula ? '6px 14px' : '4px 8px')};
    border-radius: ${({ $pilula }) => ($pilula ? '20px' : '6px')};
    background-color: ${({ $cor }) => ({ verde: '#ECFDF5', roxo: '#EEF2FF', cinza: '#F3F4F6' })[$cor]};
    color: ${({ $cor }) => ({ verde: '#10B981', roxo: 'var(--roxo-moradia)', cinza: '#6B7280' })[$cor]};
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
`;

const ListaSeguranca = styled.ul`
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const ItemSeguranca = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    & + & {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #E5E7EB;
    }
`;

const TituloItem = styled.p`
    font-size: 14px;
    font-weight: 700;
    color: #111827;
`;

const BotaoNeutro = styled(Botao)`
    padding: 8px 16px;
    border: 1px solid #E5E7EB;
    background-color: #FFFFFF;
    color: #111827;
    font-size: 13px;
    font-weight: 700;
`;

const secoes = [
    { id: 'dados-pessoais', rotulo: 'Dados Pessoais' },
    { id: 'preferencias', rotulo: 'Preferências de Moradia' },
    { id: 'cidades-salvas', rotulo: 'Cidades Salvas' },
    { id: 'seguranca', rotulo: 'Segurança da Conta' },
];

const formatoMembroDesde = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

function membroDesde(data) {
    const [mes, ano] = formatoMembroDesde.format(new Date(data)).split(' de ');
    return `Membro desde ${mes.charAt(0).toUpperCase()}${mes.slice(1)}, ${ano}`;
}

// Formata enquanto digita: +55 (11) 98765-4321.
function formatarTelefone(valor) {
    // Remove o "+55" que a própria máscara insere, senão ele é relido como DDD a cada tecla.
    const semPais = valor.trimStart().startsWith('+55') ? valor.trimStart().slice(3) : valor;
    let digitos = semPais.replace(/\D/g, '');
    if (digitos.startsWith('55') && digitos.length > 11) digitos = digitos.slice(2);
    digitos = digitos.slice(0, 11);
    if (!digitos) return '';

    const ddd = digitos.slice(0, 2);
    const numero = digitos.slice(2);
    const corte = numero.length > 8 ? 5 : 4;
    let resultado = `+55 (${ddd}`;
    if (digitos.length > 2) resultado += `) ${numero.slice(0, corte)}`;
    if (numero.length > corte) resultado += `-${numero.slice(corte)}`;
    return resultado;
}

// Estado de um formulário editável com "Descartar" e "Salvar" no user_metadata do Supabase.
function useFormulario(valoresSalvos, salvar) {
    const [valores, setValores] = useState(valoresSalvos);
    const [salvando, setSalvando] = useState(false);
    const [aviso, setAviso] = useState(null);
    const alterado = JSON.stringify(valores) !== JSON.stringify(valoresSalvos);

    function alterar(campo, valor) {
        setValores((atuais) => ({ ...atuais, [campo]: valor }));
        setAviso(null);
    }

    function descartar() {
        setValores(valoresSalvos);
        setAviso(null);
    }

    async function enviar(evento) {
        evento.preventDefault();
        setSalvando(true);
        const { error } = await salvar(valores);
        setSalvando(false);
        setAviso(error
            ? { erro: true, texto: 'Não foi possível salvar. Tente novamente.' }
            : { erro: false, texto: 'Alterações salvas' });
    }

    return { valores, alterar, alterado, salvando, aviso, descartar, enviar };
}

function AcoesFormulario({ formulario }) {
    const { alterado, salvando, aviso, descartar } = formulario;
    return (
        <Acoes>
            {aviso && (
                <Aviso $erro={aviso.erro} role="status">
                    {!aviso.erro && <FiCheck />} {aviso.texto}
                </Aviso>
            )}
            <BotaoSecundario type="button" onClick={descartar} disabled={!alterado || salvando}>
                Descartar
            </BotaoSecundario>
            <BotaoPrimario type="submit" disabled={!alterado || salvando}>
                {salvando ? 'Salvando…' : 'Salvar alterações'}
            </BotaoPrimario>
        </Acoes>
    );
}

function CampoSelecao({ rotulo, valor, opcoes, onChange }) {
    const idRotulo = useId();
    return (
        <Campo as="div">
            <span id={idRotulo}>{rotulo}</span>
            <Selecao valor={valor} opcoes={opcoes} onChange={onChange} aria-labelledby={idRotulo} />
        </Campo>
    );
}

function CabecalhoSecao({ titulo, descricao }) {
    return (
        <div>
            <TituloCartao>{titulo}</TituloCartao>
            <TextoSuave>{descricao}</TextoSuave>
        </div>
    );
}

function Perfil({ usuario, onNavegar, onNovaAnalise, analises = [], comparativos = [] }){
    const metadados = usuario.user_metadata ?? {};
    const perfil = metadados.perfil ?? {};
    const nomeExibido = perfil.nome || metadados.full_name || usuario.email;
    const loginComSenha = usuario.app_metadata?.provider === 'email';
    const [secaoAtiva, setSecaoAtiva] = useState(secoes[0].id);

    // Grava no user_metadata.perfil, preservando os campos do outro formulário.
    function salvarPerfil(parcial) {
        return supabase.auth.updateUser({ data: { perfil: { ...perfil, ...parcial } } });
    }

    const dadosPessoais = useFormulario({
        nome: perfil.nome ?? metadados.full_name ?? '',
        genero: perfil.genero ?? '',
        telefone: perfil.telefone ?? '',
        cidadeAtual: perfil.cidadeAtual ?? '',
        estadoCivil: perfil.estadoCivil ?? '',
    }, salvarPerfil);

    const preferencias = useFormulario({
        orcamento: perfil.orcamento ?? '',
        modeloTrabalho: perfil.modeloTrabalho ?? '',
        prioridades: perfil.prioridades ?? [],
    }, salvarPerfil);

    function alternarPrioridade(prioridade) {
        const atuais = preferencias.valores.prioridades;
        preferencias.alterar('prioridades', atuais.includes(prioridade)
            ? atuais.filter((item) => item !== prioridade)
            : [...atuais, prioridade]);
    }

    const cidadesSalvas = perfil.cidadesSalvas ?? [];

    return(
        <Pagina>
            <CabecalhoApp usuario={usuario} paginaAtiva="perfil" onNavegar={onNavegar} onNovaAnalise={onNovaAnalise} comparacaoIndisponivel={analises.length === 0} />

            <Conteudo>
                <BarraLateral>
                    <Identidade>
                        {metadados.avatar_url
                            ? <Avatar src={metadados.avatar_url} alt="" referrerPolicy="no-referrer" />
                            : <AvatarIniciais aria-hidden="true">{nomeExibido.charAt(0).toUpperCase()}</AvatarIniciais>}
                        <div>
                            <NomeUsuario>{nomeExibido}</NomeUsuario>
                            <TextoSuave>{membroDesde(usuario.created_at)}</TextoSuave>
                        </div>
                    </Identidade>

                    <Divisoria />

                    <Estatisticas>
                        <div><dt>Análises Realizadas</dt><dd>{analises.length} {analises.length === 1 ? 'análise' : 'análises'}</dd></div>
                        <div><dt>Cidades Salvas</dt><dd>{cidadesSalvas.length} {cidadesSalvas.length === 1 ? 'cidade' : 'cidades'}</dd></div>
                        <div><dt>Comparativos</dt><dd>{comparativos.length} {comparativos.length === 1 ? 'salvo' : 'salvos'}</dd></div>
                    </Estatisticas>

                    <Divisoria />

                    <MenuSecoes aria-label="Seções do perfil">
                        {secoes.map(({ id, rotulo }) => (
                            <ItemMenu
                                key={id}
                                href={`#${id}`}
                                $ativo={id === secaoAtiva}
                                aria-current={id === secaoAtiva ? 'true' : undefined}
                                onClick={() => setSecaoAtiva(id)}
                            >
                                {rotulo}
                            </ItemMenu>
                        ))}
                    </MenuSecoes>
                </BarraLateral>

                <Formularios>
                    <Cartao as="form" id="dados-pessoais" onSubmit={dadosPessoais.enviar}>
                        <CabecalhoSecao
                            titulo="Informações Pessoais"
                            descricao="Gerencie suas informações de contato e dados pessoais básicos"
                        />
                        <Campos>
                            <Campo>
                                Nome Completo
                                <Entrada
                                    value={dadosPessoais.valores.nome}
                                    onChange={(e) => dadosPessoais.alterar('nome', e.target.value)}
                                    autoComplete="name"
                                    required
                                />
                            </Campo>
                            <CampoSelecao
                                rotulo="Gênero"
                                valor={dadosPessoais.valores.genero}
                                opcoes={opcoesGenero}
                                onChange={(valor) => dadosPessoais.alterar('genero', valor)}
                            />
                            <Campo>
                                E-mail
                                <Entrada value={usuario.email ?? ''} readOnly title="O e-mail vem da sua conta de login" />
                            </Campo>
                            <Campo>
                                Telefone
                                <Entrada
                                    type="tel"
                                    value={dadosPessoais.valores.telefone}
                                    onChange={(e) => dadosPessoais.alterar('telefone', formatarTelefone(e.target.value))}
                                    placeholder="+55 (11) 98765-4321"
                                    autoComplete="tel"
                                />
                            </Campo>
                            <Campo>
                                Cidade Atual
                                <Entrada
                                    value={dadosPessoais.valores.cidadeAtual}
                                    onChange={(e) => dadosPessoais.alterar('cidadeAtual', e.target.value)}
                                    placeholder="Ex.: São Paulo, SP"
                                />
                            </Campo>
                            <CampoSelecao
                                rotulo="Estado Civil"
                                valor={dadosPessoais.valores.estadoCivil}
                                opcoes={opcoesEstadoCivil}
                                onChange={(valor) => dadosPessoais.alterar('estadoCivil', valor)}
                            />
                        </Campos>
                        <AcoesFormulario formulario={dadosPessoais} />
                    </Cartao>

                    <Cartao as="form" id="preferencias" onSubmit={preferencias.enviar}>
                        <CabecalhoSecao
                            titulo="Preferências & Estilo de Vida"
                            descricao="Parâmetros baseados nas suas respostas do onboarding de 8 etapas"
                        />
                        <Campos>
                            <CampoSelecao
                                rotulo="Faixa de Orçamento Mensal"
                                valor={preferencias.valores.orcamento}
                                opcoes={opcoesOrcamento}
                                onChange={(valor) => preferencias.alterar('orcamento', valor)}
                            />
                            <CampoSelecao
                                rotulo="Modelo de Trabalho"
                                valor={preferencias.valores.modeloTrabalho}
                                opcoes={opcoesModeloTrabalho}
                                onChange={(valor) => preferencias.alterar('modeloTrabalho', valor)}
                            />
                        </Campos>
                        <Grupo>
                            <legend>Suas Prioridades de Match</legend>
                            <Etiquetas>
                                {opcoesPrioridades.map((prioridade) => {
                                    const ativa = preferencias.valores.prioridades.includes(prioridade);
                                    return (
                                        <Etiqueta
                                            key={prioridade}
                                            type="button"
                                            $ativa={ativa}
                                            aria-pressed={ativa}
                                            onClick={() => alternarPrioridade(prioridade)}
                                        >
                                            {ativa && <FiCheck />} {prioridade}
                                        </Etiqueta>
                                    );
                                })}
                            </Etiquetas>
                        </Grupo>
                        <AcoesFormulario formulario={preferencias} />
                    </Cartao>

                    <Cartao id="cidades-salvas">
                        <CabecalhoSecao
                            titulo="Cidades Salvas"
                            descricao="Pesquise e salve as cidades que você quer acompanhar"
                        />
                        <CidadesSalvas
                            cidades={cidadesSalvas}
                            onSalvar={(lista) => salvarPerfil({ cidadesSalvas: lista })}
                        />
                    </Cartao>

                    <Cartao id="seguranca">
                        <CabecalhoSecao
                            titulo="Segurança da Conta"
                            descricao="Monitore as configurações de acesso e segurança do seu perfil"
                        />
                        <ListaSeguranca>
                            <ItemSeguranca>
                                <div>
                                    <TituloItem>Verificação de Duas Etapas (MFA)</TituloItem>
                                    <TextoSuave>Adicione uma camada extra de segurança à sua conta</TextoSuave>
                                </div>
                                <Selo $pilula $cor="cinza">Em breve</Selo>
                            </ItemSeguranca>
                            <ItemSeguranca>
                                <div>
                                    <TituloItem>Alterar Senha</TituloItem>
                                    <TextoSuave>
                                        {loginComSenha
                                            ? 'Defina uma nova senha de acesso'
                                            : 'Você entra com sua conta Google — a senha é gerenciada por lá'}
                                    </TextoSuave>
                                </div>
                                <BotaoNeutro type="button" disabled title="Em breve">Redefinir</BotaoNeutro>
                            </ItemSeguranca>
                        </ListaSeguranca>
                    </Cartao>
                </Formularios>
            </Conteudo>
        </Pagina>
    )
}

export default Perfil
