import React from 'react';
import ListaPlantas from './components/ListaPlantas';

function App() {
  return (
    <div>
      <nav className="navbar navbar-dark bg-success shadow-sm">
        <div className="container">
          <span className="navbar-brand mb-0 h1">🌿 CeresIA - Agro-climática</span>
        </div>
      </nav>
      <div className="container mt-4">
        <ListaPlantas />
      </div>
    </div>
  );
}

export default App;