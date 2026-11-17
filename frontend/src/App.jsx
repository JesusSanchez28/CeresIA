import React, { useState, useEffect } from 'react';
import FormularioAnalisis from './components/FormularioAnalisis';
import HistorialAnalisis from './components/HistorialAnalisis';
import ListaPlantas from './components/ListaPlantas';
import CompatibilidadZona from './components/CompatibilidadZona';
import AuthForm from './components/AuthForm';

function App() {
    const [usuario, setUsuario] = useState(null);
    const [vistaActual, setVistaActual] = useState('inicio');
    const [recargar, setRecargar] = useState(0);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('ceresia_usuario');
        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('ceresia_token');
        localStorage.removeItem('ceresia_usuario');
        setUsuario(null);
        setVistaActual('inicio');
    };

    if (!usuario) {
        return <AuthForm onLoginSuccess={(user) => setUsuario(user)} />;
    }

    return (
        <div className="bg-light min-vh-100">
            <nav className="navbar navbar-dark bg-success shadow-sm mb-4 px-3 px-md-4">
                <span 
                    className="navbar-brand fw-bold mb-0 h1" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setVistaActual('inicio')}
                >
                    🌿 CeresIA
                </span>
                <div className="d-flex align-items-center text-white">
                    <span className="me-3 small d-none d-sm-inline">Hola, <strong>{usuario.nombre}</strong></span>
                    <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
                        Salir
                    </button>
                </div>
            </nav>

            <div className="container pb-5" style={{ maxWidth: '900px' }}>
                {vistaActual === 'inicio' && (
                    <div>
                        <div className="p-4 mb-4 bg-white rounded-4 shadow-sm border-start border-success border-5">
                            <h3 className="fw-bold text-dark mb-1">Bienvenido, {usuario.nombre} 👋</h3>
                            <p className="text-muted mb-0">Selecciona una herramienta agroclimática para comenzar:</p>
                        </div>

                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <div 
                                    className="card h-100 border-0 shadow-sm rounded-4 p-3"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setVistaActual('escanear')}
                                >
                                    <div className="card-body d-flex align-items-center">
                                        <div className="bg-success bg-opacity-10 text-success rounded-4 p-3 me-3 fs-2">
                                            📸
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-1 text-dark">Analizar por Imagen</h5>
                                            <p className="text-muted small mb-0">Escanea una planta o semilla y evalúa su viabilidad con tu clima GPS.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-6">
                                <div 
                                    className="card h-100 border-0 shadow-sm rounded-4 p-3"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setVistaActual('compatibilidad')}
                                >
                                    <div className="card-body d-flex align-items-center">
                                        <div className="bg-primary bg-opacity-10 text-primary rounded-4 p-3 me-3 fs-2">
                                            🌱
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-1 text-dark">Ver Compatibilidad</h5>
                                            <p className="text-muted small mb-0">Descubre qué cultivos son ideales para sembrar según tu ubicación actual.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-6">
                                <div 
                                    className="card h-100 border-0 shadow-sm rounded-4 p-3"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setVistaActual('historial')}
                                >
                                    <div className="card-body d-flex align-items-center">
                                        <div className="bg-warning bg-opacity-10 text-warning rounded-4 p-3 me-3 fs-2">
                                            📊
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-1 text-dark">Mi Historial</h5>
                                            <p className="text-muted small mb-0">Consulta todos tus diagnósticos previos y resultados guardados.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-6">
                                <div 
                                    className="card h-100 border-0 shadow-sm rounded-4 p-3"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setVistaActual('catalogo')}
                                >
                                    <div className="card-body d-flex align-items-center">
                                        <div className="bg-info bg-opacity-10 text-info rounded-4 p-3 me-3 fs-2">
                                            🌿
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-1 text-dark">Catálogo de Plantas</h5>
                                            <p className="text-muted small mb-0">Explora las especies y semillas registradas en CeresIA.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {vistaActual === 'escanear' && (
                    <div>
                        <button onClick={() => setVistaActual('inicio')} className="btn btn-outline-secondary mb-3">
                            ← Volver al Menú Principal
                        </button>
                        <FormularioAnalisis 
                            usuario={usuario} 
                            onAnalisisCreado={() => setRecargar(prev => prev + 1)} 
                        />
                    </div>
                )}

                {vistaActual === 'compatibilidad' && (
                    <CompatibilidadZona onVolver={() => setVistaActual('inicio')} />
                )}

                {vistaActual === 'historial' && (
                    <div>
                        <button onClick={() => setVistaActual('inicio')} className="btn btn-outline-secondary mb-3">
                            ← Volver al Menú Principal
                        </button>
                        <HistorialAnalisis usuario={usuario} recargar={recargar} />
                    </div>
                )}

                {vistaActual === 'catalogo' && (
                    <div>
                        <button onClick={() => setVistaActual('inicio')} className="btn btn-outline-secondary mb-3">
                            ← Volver al Menú Principal
                        </button>
                        <ListaPlantas recargar={recargar} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;