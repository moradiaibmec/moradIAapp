import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase.js';
import Login from './componentes/Login/index.jsx';
import Dashboard from './componentes/Dashboard/index.jsx';
import Perfil from './componentes/Perfil/index.jsx';
import Onboarding from './componentes/Onboarding/index.jsx';


function App(){
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState('dashboard');

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
    return <Onboarding usuario={sessao.user} onSair={() => navegar('dashboard')} />;
  }

  return pagina === 'perfil'
    ? <Perfil usuario={sessao.user} onNavegar={navegar} onNovaAnalise={iniciarAnalise} />
    : <Dashboard usuario={sessao.user} onNavegar={navegar} onIniciarAnalise={iniciarAnalise} />;
}

export default App;
