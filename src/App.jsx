import { useEffect, useMemo, useState } from 'react';
import { listarAnalises, salvarAnalise, supabase } from './lib/supabase.js';
import { montarAnalise, paraHistorico } from './analise/analises.js';
import { calcularMatch } from './analise/match.js';
import { carregarBase } from './dados/base.js';
import Login from './componentes/Login/index.jsx';
import Dashboard from './componentes/Dashboard/index.jsx';
import Perfil from './componentes/Perfil/index.jsx';
import Onboarding from './componentes/Onboarding/index.jsx';
import Processamento from './componentes/Processamento/index.jsx';
import Resultados from './componentes/Resultados/index.jsx';
import ExplorarCidade from './componentes/ExplorarCidade/index.jsx';
import CarregandoBase from './componentes/CarregandoBase/index.jsx';


function App(){
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState('dashboard');
  const [analises, setAnalises] = useState([]);
  // Análise em exibição: { respostas, resultados } e o estado do salvamento no histórico.
  // Ao reabrir uma análise do histórico, `resultados` fica nulo e o ranking é recalculado quando a base carregar.
  const [analiseAtual, setAnaliseAtual] = useState(null);
  // Posição no ranking da cidade em destaque nos resultados (e aberta em "Explorar").
  const [cidadeSelecionada, setCidadeSelecionada] = useState(0);
  const [salvamento, setSalvamento] = useState(null);
  // Base de cidades: carregada só quando a pessoa começa uma análise.
  const [base, setBase] = useState(null);
  const [erroBase, setErroBase] = useState(false);
  const idUsuario = sessao?.user?.id;

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

  useEffect(() => {
    if (!idUsuario) return;
    carregarAnalises();
  }, [idUsuario]);

  const resultados = useMemo(() => {
    if (analiseAtual?.resultados) return analiseAtual.resultados;
    return analiseAtual && base ? calcularMatch(analiseAtual.respostas, base.cidades) : null;
  }, [analiseAtual, base]);

  async function carregarAnalises() {
    const { data, error } = await listarAnalises();
    if (!error) setAnalises(data.map(paraHistorico));
  }

  function navegar(novaPagina) {
    setPagina(novaPagina);
    window.scrollTo(0, 0);
  }

  function prepararBase() {
    setErroBase(false);
    carregarBase().then(setBase).catch(() => setErroBase(true));
  }

  function iniciarAnalise() {
    if (!base) prepararBase();
    navegar('onboarding');
  }

  async function salvar({ respostas, resultados }) {
    setSalvamento('salvando');
    const { error } = await salvarAnalise(montarAnalise(respostas, resultados, base.versaoDados));
    setSalvamento(error ? 'erro' : 'salva');
    if (!error) carregarAnalises();
  }

  function concluirAnalise(respostas, resultados) {
    const analise = { respostas, resultados };
    setAnaliseAtual(analise);
    setCidadeSelecionada(0);
    navegar('processando');
    salvar(analise);
  }

  // As notas detalhadas não são salvas: o ranking é recalculado a partir das respostas, sobre a base atual.
  function abrirAnalise(id) {
    const { respostas } = analises.find((analise) => analise.id === id);
    setAnaliseAtual({ respostas, resultados: null });
    setCidadeSelecionada(0);
    setSalvamento(null);
    if (!base) prepararBase();
    navegar('resultados');
  }

  if (carregando) return null;
  if (!sessao) return <Login />;

  if (pagina === 'onboarding' && !base) {
    return <CarregandoBase erro={erroBase} onTentarDeNovo={prepararBase} onSair={() => navegar('dashboard')} />;
  }

  if (pagina === 'onboarding') {
    return <Onboarding usuario={sessao.user} cidades={base.cidades} onSair={() => navegar('dashboard')} onConcluir={concluirAnalise} />;
  }

  if (pagina === 'processando') {
    return <Processamento totalCidades={base.cidades.length} onConcluido={() => navegar('resultados')} />;
  }

  if ((pagina === 'resultados' || pagina === 'explorar') && analiseAtual && !resultados) {
    return <CarregandoBase erro={erroBase} onTentarDeNovo={prepararBase} onSair={() => navegar('dashboard')} />;
  }

  if (pagina === 'resultados' && analiseAtual) {
    return (
      <Resultados
        usuario={sessao.user}
        onNavegar={navegar}
        onNovaAnalise={iniciarAnalise}
        respostas={analiseAtual.respostas}
        resultados={resultados}
        cidades={base.cidades}
        fontes={base.fontes}
        salvamento={salvamento}
        onTentarSalvar={() => salvar(analiseAtual)}
        selecionada={cidadeSelecionada}
        onSelecionar={setCidadeSelecionada}
        onExplorar={() => navegar('explorar')}
      />
    );
  }

  if (pagina === 'explorar' && analiseAtual) {
    const resultado = resultados[cidadeSelecionada];
    return (
      <ExplorarCidade
        usuario={sessao.user}
        onNavegar={navegar}
        onNovaAnalise={iniciarAnalise}
        onVoltar={() => navegar('resultados')}
        resultado={resultado}
        posicao={cidadeSelecionada}
        cidade={base.cidades.find(({ ibge }) => ibge === resultado.ibge)}
        respostas={analiseAtual.respostas}
        fontes={base.fontes}
      />
    );
  }

  return pagina === 'perfil'
    ? <Perfil usuario={sessao.user} onNavegar={navegar} onNovaAnalise={iniciarAnalise} analises={analises} />
    : <Dashboard usuario={sessao.user} onNavegar={navegar} onIniciarAnalise={iniciarAnalise} onAbrirAnalise={abrirAnalise} analises={analises} />;
}

export default App;
