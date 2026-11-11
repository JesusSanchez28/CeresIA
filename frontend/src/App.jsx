import React from 'react';
import ListaPlantas from './components/ListaPlantas';
import FormularioAnalisis from './components/FormularioAnalisis';
import HistorialAnalisis from './components/HistorialAnalisis';

function App() {
  return (
    <div>
      <nav className="navbar navbar-dark bg-success shadow-sm mb-4">
        <div className="container">
          <span className="navbar-brand mb-0 h1">🌿 CeresIA - Análisis Agroclimático</span>
        </div>
      </nav>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <FormularioAnalisis />
          </div>
          <div className='col-md-12'>
            <HistorialAnalisis/>
          </div>
          <div className="col-md-12">
            <ListaPlantas />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;