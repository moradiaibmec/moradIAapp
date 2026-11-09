import { useEffect, useMemo, useState } from 'react';
import { listarAnalises, salvarAnalise, salvarCidades, supabase } from './lib/supabase.js';
import { montarAnalise, paraHistorico } from './analise/analises.js';
import { calcularMatch } from './analise/match.js';
import { MAXIMO_COMPARADAS, MINIMO_COMPARADAS } from './analise/comparacao.js';
import { alternarCidade } from './analise/cidadesSalvas.js';
import { apagarRascunho, gravarRascunho, lerRascunho } from './analise/rascunho.js';
import { etapasVisiveis } from './analise/respostas.js';
import { TELAS_DE_ANALISE, deveEmpilhar, lerUrl, montarUrl } from './analise/rotas.js';
import { carregarBase } from './dados/base.js';
import Login from './componentes/Login/index.jsx';
import Dashboard from './componentes/Dashboard/index.jsx';
import Perfil from './componentes/Perfil/index.jsx';
import Onboarding from './componentes/Onboarding/index.jsx';
import Processamento from './componentes/Processamento/index.jsx';
import Pagamento from './componentes/Pagamento/index.jsx';
import Resultados from './componentes/Resultados/index.jsx';
import ExplorarCidade from './componentes/ExplorarCidade/index.jsx';
import CompararCidades from './componentes/CompararCidades/index.jsx';
import CarregandoBase from './componentes/CarregandoBase/index.jsx';
import RankingCompleto from './componentes/RankingCompleto/index.jsx';
import MinhasCidades from './componentes/MinhasCidades/index.jsx';
import ComoCalculamos from './componentes/ComoCalculamos/index.jsx';


// Rótulo do "Voltar" da página da cidade, conforme a tela de onde a pessoa veio.
const ROTULOS_VOLTAR = {
  resultados: 'Voltar aos resultados',
  ranking: 'Voltar ao ranking',
  comparar: 'Voltar à comparação',
  cidades: 'Voltar às minhas cidades',
  dashboard: 'Voltar ao dashboard',
};

function App(){
  // A navegação começa do que está na URL, para o F5 reabrir a mesma tela (src/analise/rotas.js).
  const [urlInicial] = useState(() => lerUrl(window.location.search));
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(urlInicial.pagina);
  const [analises, setAnalises] = useState([]);
  const [analisesCarregadas, setAnalisesCarregadas] = useState(false);
  // Análise recém-concluída: { id, respostas, resultados }. O `id` só existe depois de salva.
  const [analiseNova, setAnaliseNova] = useState(null);
  // Questionário concluído e ainda não pago: { respostas, resultados }. Fica fora de `analiseNova` para nenhuma tela mostrar o resultado antes do pagamento.
  const [analisePendente, setAnalisePendente] = useState(null);
  // Análise do histórico pedida pela URL; nula = a recém-concluída.
  const [idAnalise, setIdAnalise] = useState(urlInicial.idAnalise);
  // Posição no ranking da cidade em destaque nos resultados.
  const [cidadeSelecionada, setCidadeSelecionada] = useState(urlInicial.selecionada);
  // Código IBGE da cidade aberta em "Explorar" (pode estar fora do ranking, se veio da comparação).
  const [cidadeExplorada, setCidadeExplorada] = useState(urlInicial.cidade);
  const [abaCidade, setAbaCidade] = useState(urlInicial.aba);
  // Códigos IBGE das cidades em comparação; nulo = as primeiras do ranking.
  const [comparadas, setComparadas] = useState(urlInicial.comparadas);
  // Tela para onde "Voltar" leva a partir de "Explorar".
  const [origemExplorar, setOrigemExplorar] = useState(urlInicial.origem);
  const [etapaOnboarding, setEtapaOnboarding] = useState(urlInicial.etapa);
  const [salvamento, setSalvamento] = useState(null);
  // Base de cidades: carregada só quando alguma tela precisa dela.
  const [base, setBase] = useState(null);
  const [erroBase, setErroBase] = useState(false);
  const idUsuario = sessao?.user?.id;
  const cidadesSalvas = sessao?.user?.user_metadata?.perfil?.cidadesSalvas ?? [];

  // Análise em exibição. As do histórico não guardam as notas detalhadas: `resultados` fica nulo e o ranking é recalculado quando a base carregar.
  const analiseAtual = useMemo(() => {
    if (analiseNova && (idAnalise === null || idAnalise === analiseNova.id)) return analiseNova;
    // Em "Minhas cidades", sem análise aberta, o match das cidades salvas vem da análise mais recente.
    const id = idAnalise ?? (pagina === 'cidades' ? analises[0]?.id : null);
    const doHistorico = analises.find((analise) => analise.id === id);
    return doHistorico ? { id, respostas: doHistorico.respostas, resultados: null } : null;
  }, [analiseNova, idAnalise, pagina, analises]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregando(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  // Voltar e Avançar do navegador: cada tela só lê da URL o que é dela, para não apagar o estado das outras.
  useEffect(() => {
    function aplicarUrl() {
      const url = lerUrl(window.location.search);
      // Questionário já enviado ou abandonado: sem rascunho, a entrada antiga do histórico leva ao início.
      if (url.pagina === 'onboarding' && !lerRascunho(idUsuario)) {
        window.history.replaceState(null, '', window.location.pathname);
        setPagina('dashboard');
        return;
      }
      setPagina(url.pagina);
      // De volta ao questionário, as respostas podem mudar: o que estava para pagar deixa de valer.
      if (url.pagina === 'onboarding') setAnalisePendente(null);
      if (url.idAnalise) setIdAnalise(url.idAnalise);
      if (url.pagina === 'resultados') setCidadeSelecionada(url.selecionada);
      if (url.pagina === 'comparar') setComparadas(url.comparadas);
      if (url.pagina === 'onboarding') setEtapaOnboarding(url.etapa);
      if (url.pagina === 'explorar') {
        setCidadeExplorada(url.cidade);
        setOrigemExplorar(url.origem);
        setAbaCidade(url.aba);
      }
    }

    window.addEventListener('popstate', aplicarUrl);
    return () => window.removeEventListener('popstate', aplicarUrl);
  }, [idUsuario]);


  // A base é baixada na primeira tela que precisa dela, inclusive quando o F5 já abre direto nessa tela.
  useEffect(() => {
    const precisaDaBase = ['onboarding', 'pagamento', 'cidades', 'metodologia', ...TELAS_DE_ANALISE].includes(pagina);
    if (!idUsuario || !precisaDaBase || base || erroBase) return;
    carregarBase().then(setBase).catch(() => setErroBase(true));
  }, [idUsuario, pagina, base, erroBase]);

  useEffect(() => {
    if (!idUsuario) return;
    carregarAnalises();
  }, [idUsuario]);

  const resultados = useMemo(() => {
    if (analiseAtual?.resultados) return analiseAtual.resultados;
    return analiseAtual && base ? calcularMatch(analiseAtual.respostas, base.cidades) : null;
  }, [analiseAtual, base]);

  // Todas as cidades da base, inclusive as eliminadas pelos filtros: a comparação pode incluir qualquer uma.
  const avaliadas = useMemo(() => (
    analiseAtual && base ? calcularMatch(analiseAtual.respostas, base.cidades, { filtrar: false }) : null
  ), [analiseAtual, base]);

  // No F5 do pagamento, a análise concluída é refeita a partir do rascunho, que só é apagado depois de pagar.
  const respostasDoRascunho = useMemo(() => {
    if (pagina !== 'pagamento' || analisePendente || !idUsuario) return null;
    const rascunho = lerRascunho(idUsuario);
    return rascunho?.concluida ? rascunho.respostas : null;
  }, [pagina, analisePendente, idUsuario]);

  const analiseParaPagar = useMemo(() => {
    if (analisePendente) return analisePendente;
    return respostasDoRascunho && base
      ? { respostas: respostasDoRascunho, resultados: calcularMatch(respostasDoRascunho, base.cidades) }
      : null;
  }, [analisePendente, respostasDoRascunho, base]);

  // A tela de fato exibida: uma URL pode pedir uma análise que não existe mais ou uma cidade inválida.
  let tela = pagina;
  if (pagina === 'pagamento' && !analisePendente && !respostasDoRascunho) tela = 'dashboard';
  else if (analisesCarregadas && TELAS_DE_ANALISE.includes(pagina) && !analiseAtual) tela = 'dashboard';
  else if (pagina === 'explorar' && avaliadas && !avaliadas.some(({ ibge }) => ibge === cidadeExplorada)) tela = 'resultados';
  const redirecionada = tela !== pagina;
  const idDaUrl = analiseAtual?.id ?? null;

  // Mantém a URL em dia com a tela. "processando" é só uma transição e não entra no histórico.
  // Redirecionamentos substituem a entrada atual, para o Voltar não cair neles de novo.
  useEffect(() => {
    if (carregando || !idUsuario || tela === 'processando') return;
    // Enquanto o histórico chega, a análise da URL ainda não foi encontrada: reescrever agora a perderia.
    if (!analisesCarregadas && TELAS_DE_ANALISE.includes(tela)) return;
    const busca = montarUrl({
      pagina: tela, idAnalise: idDaUrl, selecionada: cidadeSelecionada, cidade: cidadeExplorada, origem: origemExplorar, aba: abaCidade, comparadas, etapa: etapaOnboarding,
    });
    if (busca === window.location.search) return;
    const destino = `${window.location.pathname}${busca}`;
    if (!redirecionada && deveEmpilhar(lerUrl(window.location.search), lerUrl(busca))) window.history.pushState(null, '', destino);
    else window.history.replaceState(null, '', destino);
  }, [carregando, idUsuario, analisesCarregadas, tela, redirecionada, idDaUrl, cidadeSelecionada, cidadeExplorada, origemExplorar, abaCidade, comparadas, etapaOnboarding]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tela, cidadeExplorada, etapaOnboarding]);

  async function carregarAnalises() {
    const { data, error } = await listarAnalises();
    if (!error) setAnalises(data.map(paraHistorico));
    setAnalisesCarregadas(true);
  }

  function navegar(novaPagina) {
    if (novaPagina === 'comparar' && !analiseAtual) {
      // Pelo menu, sem análise aberta: compara as cidades da análise mais recente.
      if (analises.length) abrirAnalise(analises[0].id, 'comparar');
      return;
    }
    // Fixa a análise em exibição: em "Minhas cidades" ela pode ter vindo só da mais recente.
    if (analiseAtual?.id) setIdAnalise(analiseAtual.id);
    setPagina(novaPagina);
  }

  function explorar(ibge, origem) {
    setCidadeExplorada(ibge);
    setOrigemExplorar(origem);
    setAbaCidade('geral');
    navegar('explorar');
  }

  // Limpar o erro faz o efeito da base tentar de novo.
  function tentarBaseDeNovo() {
    setErroBase(false);
  }

  function iniciarAnalise() {
    apagarRascunho(idUsuario);
    setAnalisePendente(null);
    setEtapaOnboarding(null);
    navegar('onboarding');
  }

  function sairDaAnalise() {
    apagarRascunho(idUsuario);
    setAnalisePendente(null);
    navegar('dashboard');
  }

  async function salvar(analise) {
    setSalvamento('salvando');
    const { data, error } = await salvarAnalise(montarAnalise(analise.respostas, analise.resultados, base.versaoDados));
    setSalvamento(error ? 'erro' : 'salva');
    if (error) return;
    // A pessoa pode já ter aberto outra análise enquanto esta salvava.
    setAnaliseNova((atual) => (atual === analise ? { ...atual, id: data.id } : atual));
    carregarAnalises();
  }

  // O rascunho fica até o pagamento, marcado como concluído: o F5 e o "Voltar às respostas" dependem dele.
  // Ao reabrir o questionário, o próprio Onboarding regrava o rascunho sem essa marca.
  function concluirAnalise(respostas, resultados) {
    gravarRascunho(idUsuario, { ...lerRascunho(idUsuario), respostas, concluida: true });
    setAnalisePendente({ respostas, resultados });
    navegar('pagamento');
  }

  function voltarAsRespostas() {
    setEtapaOnboarding(etapasVisiveis(analiseParaPagar.respostas).at(-1));
    setAnalisePendente(null);
    navegar('onboarding');
  }

  // Só depois de pago a análise vira uma análise de verdade: entra no histórico e libera o resultado.
  function concluirPagamento() {
    const analise = { id: null, ...analiseParaPagar };
    apagarRascunho(idUsuario);
    setAnalisePendente(null);
    setIdAnalise(null);
    setAnaliseNova(analise);
    setCidadeSelecionada(0);
    setComparadas(null);
    setPagina('processando');
    salvar(analise);
  }

  // As notas detalhadas não são salvas: o ranking é recalculado a partir das respostas, sobre a base atual.
  function abrirAnalise(id, destino = 'resultados') {
    setIdAnalise(id);
    setCidadeSelecionada(0);
    setComparadas(null);
    setSalvamento(null);
    setPagina(destino);
  }

  // A página da cidade depende de uma análise aberta: o dashboard indica qual.
  function verCidadeDoDashboard(ibge, id) {
    setCidadeExplorada(ibge);
    setOrigemExplorar('dashboard');
    setAbaCidade('geral');
    abrirAnalise(id, 'explorar');
  }

  if (carregando) return null;
  if (!sessao) return <Login />;

  const telaDeCarregamento = <CarregandoBase erro={erroBase} onTentarDeNovo={tentarBaseDeNovo} onSair={() => navegar('dashboard')} />;

  if (['onboarding', 'cidades', 'metodologia'].includes(tela) && !base) return telaDeCarregamento;

  // No F5, o histórico ainda está chegando: esperar evita mostrar as cidades salvas sem o match.
  if (tela === 'cidades' && !analisesCarregadas) return telaDeCarregamento;

  if (tela === 'onboarding') {
    return (
      <Onboarding
        usuario={sessao.user}
        cidades={base.cidades}
        etapa={etapaOnboarding}
        onEtapa={setEtapaOnboarding}
        onSair={sairDaAnalise}
        onConcluir={concluirAnalise}
      />
    );
  }

  if (tela === 'processando') {
    return <Processamento totalCidades={base.cidades.length} onConcluido={() => navegar('resultados')} />;
  }

  if (tela === 'pagamento') {
    if (!analiseParaPagar) return telaDeCarregamento;
    return <Pagamento onVoltar={voltarAsRespostas} onPago={concluirPagamento} />;
  }

  // A análise da URL ainda pode estar chegando.
  if (TELAS_DE_ANALISE.includes(tela) && (!analiseAtual || !resultados)) return telaDeCarregamento;

  if (tela === 'resultados') {
    // A posição pode ter vindo de uma URL antiga, de um ranking que hoje é menor.
    const selecionada = Math.max(0, Math.min(cidadeSelecionada, resultados.length - 1));
    return (
      <Resultados
        usuario={sessao.user}
        onNavegar={navegar}
        onNovaAnalise={iniciarAnalise}
        respostas={analiseAtual.respostas}
        resultados={resultados}
        cidades={base.cidades}
        fontes={base.fontes}
        salvamento={analiseAtual === analiseNova ? salvamento : null}
        onTentarSalvar={() => salvar(analiseAtual)}
        // Análise recém-concluída ainda sem data no histórico: é a de agora.
        dataAnalise={analises.find(({ id }) => id === analiseAtual.id)?.data ?? new Date().toISOString()}
        selecionada={selecionada}
        onSelecionar={setCidadeSelecionada}
        onExplorar={() => explorar(resultados[selecionada].ibge, 'resultados')}
        onComparar={() => navegar('comparar')}
        onVerRanking={() => navegar('ranking')}
      />
    );
  }

  if (tela === 'ranking') {
    return (
      <RankingCompleto
        usuario={sessao.user}
        onNavegar={navegar}
        onNovaAnalise={iniciarAnalise}
        onVoltar={() => navegar('resultados')}
        resultados={resultados}
        cidades={base.cidades}
        domicilio={analiseAtual.respostas.domicilio}
        onVerCidade={(ibge) => explorar(ibge, 'ranking')}
      />
    );
  }

  if (tela === 'cidades') {
    return (
      <MinhasCidades
        usuario={sessao.user}
        onNavegar={navegar}
        onNovaAnalise={iniciarAnalise}
        comparacaoIndisponivel={analises.length === 0}
        cidadesSalvas={cidadesSalvas}
        onSalvar={(lista) => salvarCidades(sessao.user, lista)}
        cidades={base.cidades}
        avaliadas={avaliadas}
        ranking={resultados}
        domicilio={analiseAtual?.respostas.domicilio ?? null}
        onVerCidade={(ibge) => explorar(ibge, 'cidades')}
        onComparar={(ibges) => {
          setComparadas(ibges);
          navegar('comparar');
        }}
      />
    );
  }

  if (tela === 'metodologia') {
    return (
      <ComoCalculamos
        usuario={sessao.user}
        onNavegar={navegar}
        onNovaAnalise={iniciarAnalise}
        comparacaoIndisponivel={analises.length === 0}
        base={base}
      />
    );
  }

  if (tela === 'explorar') {
    const resultado = avaliadas.find(({ ibge }) => ibge === cidadeExplorada);
    const posicao = resultados.findIndex(({ ibge }) => ibge === cidadeExplorada);
    return (
      <ExplorarCidade
        usuario={sessao.user}
        onNavegar={navegar}
        onNovaAnalise={iniciarAnalise}
        onVoltar={() => navegar(origemExplorar)}
        rotuloVoltar={ROTULOS_VOLTAR[origemExplorar]}
        resultado={resultado}
        posicao={posicao === -1 ? null : posicao}
        cidade={base.cidades.find(({ ibge }) => ibge === resultado.ibge)}
        cidades={base.cidades}
        salva={cidadesSalvas.includes(resultado.cidade)}
        onAlternarSalva={() => salvarCidades(sessao.user, alternarCidade(cidadesSalvas, resultado.cidade))}
        respostas={analiseAtual.respostas}
        fontes={base.fontes}
        aba={abaCidade}
        onAba={setAbaCidade}
      />
    );
  }

  if (tela === 'comparar') {
    // As cidades da URL só valem se existirem na base e formarem uma comparação.
    const validas = comparadas?.filter((codigo) => avaliadas.some(({ ibge }) => ibge === codigo)) ?? [];
    return (
      <CompararCidades
        usuario={sessao.user}
        onNavegar={navegar}
        onNovaAnalise={iniciarAnalise}
        respostas={analiseAtual.respostas}
        resultados={resultados}
        avaliadas={avaliadas}
        cidades={base.cidades}
        fontes={base.fontes}
        comparadas={validas.length >= MINIMO_COMPARADAS ? validas : resultados.slice(0, MAXIMO_COMPARADAS).map(({ ibge }) => ibge)}
        onAlterarComparadas={setComparadas}
        onVerCidade={(ibge) => explorar(ibge, 'comparar')}
        onVerAnalise={() => navegar('resultados')}
      />
    );
  }

  return tela === 'perfil'
    ? <Perfil usuario={sessao.user} onNavegar={navegar} onNovaAnalise={iniciarAnalise} analises={analises} />
    : <Dashboard usuario={sessao.user} onNavegar={navegar} onIniciarAnalise={iniciarAnalise} onAbrirAnalise={abrirAnalise} onVerCidade={verCidadeDoDashboard} analises={analises} analisesCarregadas={analisesCarregadas} />;
}

export default App;
