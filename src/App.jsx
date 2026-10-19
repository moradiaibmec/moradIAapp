import { useEffect, useState } from 'react';
import { listarAnalises, supabase } from './lib/supabase.js';
import { paraHistorico } from './analise/analises.js';
import Login from './componentes/Login/index.jsx';
import Dashboard from './componentes/Dashboard/index.jsx';
import Perfil from './componentes/Perfil/index.jsx';
import Onboarding from './componentes/Onboarding/index.jsx';


function App(){
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState('dashboard');
  const [analises, setAnalises] = useState([]);
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

  function iniciarAnalise() {
    navegar('onboarding');
  }

  if (carregando) return null;
  if (!sessao) return <Login />;

  if (pagina === 'onboarding') {
    return <Onboarding usuario={sessao.user} onSair={() => navegar('dashboard')} onAnaliseSalva={carregarAnalises} />;
  }

  return pagina === 'perfil'
    ? <Perfil usuario={sessao.user} onNavegar={navegar} onNovaAnalise={iniciarAnalise} analises={analises} />
    : <Dashboard usuario={sessao.user} onNavegar={navegar} onIniciarAnalise={iniciarAnalise} analises={analises} />;
}

export default App;
