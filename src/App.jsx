import { useEffect, useState } from 'react';
import { listarAnalises, salvarAnalise, supabase } from './lib/supabase.js';
import { montarAnalise, paraHistorico } from './analise/analises.js';
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
  // Análise recém-concluída: { respostas, resultados } e o estado do salvamento no histórico.
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

  if (pagina === 'resultados' && analiseAtual) {
    return (
      <Resultados
        usuario={sessao.user}
        onNavegar={navegar}
        onNovaAnalise={iniciarAnalise}
        respostas={analiseAtual.respostas}
        resultados={analiseAtual.resultados}
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
    const resultado = analiseAtual.resultados[cidadeSelecionada];
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
    : <Dashboard usuario={sessao.user} onNavegar={navegar} onIniciarAnalise={iniciarAnalise} analises={analises} />;
}

export default App;
