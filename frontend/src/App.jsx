import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import FormularioAnalisis from './components/FormularioAnalisis';
import CompatibilidadZona from './components/CompatibilidadZona';
import HistorialAnalisis from './components/HistorialAnalisis';
import ListaPlantas from './components/ListaPlantas';
import PerfilUsuario from './components/PerfilUsuario';
import api from './services/api';
import './styles/dashboard.css';

/* Iconos SVG vectoriales (sin emojis) */
const LeafBrandIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
);

const HomeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const ScanIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const CompassIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
);

const HistoryIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
    </svg>
);

const SproutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
);

const MapPinIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const LayersIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

const ActivityIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const TITULOS_VISTA = {
    inicio: 'Panel Principal',
    analizar: 'Diagnóstico Fitosanitario',
    compatibilidad: 'Compatibilidad de Terreno',
    historial: 'Historial de Diagnósticos',
    catalogo: 'Catálogo Botánico',
    perfil: 'Configuración de Cuenta'
};

function App() {
    const [usuario, setUsuario] = useState(null);
    const [vistaActual, setVistaActual] = useState('inicio');
    const [topbarOculta, setTopbarOculta] = useState(false);
    const [metricas, setMetricas] = useState({ total: 0, aptos: 0, ultimoCultivo: 'Sin registros' });
    const [telemetria, setTelemetria] = useState({
        ubicacion: 'Detectando GPS...',
        temperatura: '--°C',
        humedad: '--%',
        condicion: 'Sincronizando clima'
    });

    useEffect(() => {
        const usuarioGuardado =
            localStorage.getItem('ceresia_usuario') ||
            sessionStorage.getItem('ceresia_usuario');
        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        }
    }, []);

    // Ocultar AppBar al desplazarse hacia abajo y mostrarla al subir
    useEffect(() => {
        let ultimoScroll = window.scrollY;
        const manejarScroll = () => {
            const actual = window.scrollY;
            if (actual > ultimoScroll && actual > 64) {
                setTopbarOculta(true);
            } else if (actual < ultimoScroll) {
                setTopbarOculta(false);
            }
            ultimoScroll = actual;
        };
        window.addEventListener('scroll', manejarScroll, { passive: true });
        return () => window.removeEventListener('scroll', manejarScroll);
    }, []);

    // Al cambiar de vista, asegurar que la barra superior esté visible y arriba
    const cambiarVista = (nuevaVista) => {
        setVistaActual(nuevaVista);
        setTopbarOculta(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Sincronizar métricas reales de MySQL y telemetría climática GPS
    useEffect(() => {
        if (!usuario) return;

        api.get(`/analisis?id_usuario=${usuario.id_usuario}`)
            .then((res) => {
                if (Array.isArray(res.data)) {
                    const lista = res.data;
                    const aptos = lista.filter((item) => item.es_apto === 1 || item.es_apto === true).length;
                    const ultimo = lista[0]?.planta || 'Sin registros';
                    setMetricas({
                        total: lista.length,
                        aptos,
                        ultimoCultivo: ultimo
                    });
                }
            })
            .catch(() => {});

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    api.get(`/analisis/compatibilidad?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
                        .then((res) => {
                            if (res.data?.clima) {
                                setTelemetria({
                                    ubicacion: res.data.clima.ubicacion || 'Coordenadas GPS activas',
                                    temperatura: `${Math.round(res.data.clima.temperatura)}°C`,
                                    humedad: `${res.data.clima.humedad}%`,
                                    condicion: res.data.clima.descripcion || 'Condición estable'
                                });
                            }
                        })
                        .catch(() => {
                            setTelemetria((prev) => ({
                                ...prev,
                                ubicacion: 'Facatativá, Cundinamarca',
                                temperatura: '17°C',
                                humedad: '76%',
                                condicion: 'Clima de sabana'
                            }));
                        });
                },
                () => {
                    setTelemetria({
                        ubicacion: 'Facatativá, Cundinamarca',
                        temperatura: '17°C',
                        humedad: '76%',
                        condicion: 'Clima de sabana'
                    });
                }
            );
        }
    }, [usuario, vistaActual]);

    // Cambio rápido de tipo de suelo desde la Topbar
    const handleCambioSueloRapido = async (nuevoSuelo) => {
        const actualizado = { ...usuario, suelo_preferido: nuevoSuelo };
        setUsuario(actualizado);

        if (localStorage.getItem('ceresia_usuario')) {
            localStorage.setItem('ceresia_usuario', JSON.stringify(actualizado));
        }
        if (sessionStorage.getItem('ceresia_usuario')) {
            sessionStorage.setItem('ceresia_usuario', JSON.stringify(actualizado));
        }

        try {
            await api.put('/auth/profile', {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                suelo_preferido: nuevoSuelo
            });
        } catch (err) {
            console.error('Error sincronizando suelo:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('ceresia_token');
        localStorage.removeItem('ceresia_usuario');
        sessionStorage.removeItem('ceresia_token');
        sessionStorage.removeItem('ceresia_usuario');
        setUsuario(null);
        setVistaActual('inicio');
    };

    if (!usuario) {
        return <AuthForm onLoginSuccess={(user) => setUsuario(user)} />;
    }

    const primerNombre = usuario.nombre ? usuario.nombre.split(' ')[0] : 'Usuario';
    const iniciales = usuario.nombre
        ? usuario.nombre
              .split(' ')
              .slice(0, 2)
              .map((n) => n[0])
              .join('')
              .toUpperCase()
        : 'U';

    return (
        <div className="ceres-app-shell">
            {/* SIDEBAR PERSISTENTE (ESCRITORIO) */}
            <aside className="ceres-sidebar">
                <div>
                    <div className="ceres-sidebar-header">
                        <div className="ceres-logo-box">
                            <LeafBrandIcon />
                        </div>
                        <div>
                            <div className="ceres-logo-text">CERES IA</div>
                            <span className="ceres-logo-sub">Agro-Inteligencia</span>
                        </div>
                    </div>

                    <div className="ceres-nav-section-label">Plataforma</div>
                    <nav className="ceres-nav-group" aria-label="Menú principal">
                        <button
                            type="button"
                            className={`ceres-nav-btn ${vistaActual === 'inicio' ? 'active' : ''}`}
                            onClick={() => cambiarVista('inicio')}
                        >
                            <span className="ceres-nav-btn-left">
                                <HomeIcon />
                                <span>Inicio</span>
                            </span>
                        </button>

                        <button
                            type="button"
                            className={`ceres-nav-btn ${vistaActual === 'analizar' ? 'active' : ''}`}
                            onClick={() => cambiarVista('analizar')}
                        >
                            <span className="ceres-nav-btn-left">
                                <ScanIcon />
                                <span>Analizar Planta</span>
                            </span>
                        </button>

                        <button
                            type="button"
                            className={`ceres-nav-btn ${vistaActual === 'compatibilidad' ? 'active' : ''}`}
                            onClick={() => cambiarVista('compatibilidad')}
                        >
                            <span className="ceres-nav-btn-left">
                                <CompassIcon />
                                <span>Compatibilidad</span>
                            </span>
                        </button>

                        <button
                            type="button"
                            className={`ceres-nav-btn ${vistaActual === 'historial' ? 'active' : ''}`}
                            onClick={() => cambiarVista('historial')}
                        >
                            <span className="ceres-nav-btn-left">
                                <HistoryIcon />
                                <span>Historial</span>
                            </span>
                            {metricas.total > 0 && (
                                <span className="ceres-nav-badge">{metricas.total}</span>
                            )}
                        </button>

                        <button
                            type="button"
                            className={`ceres-nav-btn ${vistaActual === 'catalogo' ? 'active' : ''}`}
                            onClick={() => cambiarVista('catalogo')}
                        >
                            <span className="ceres-nav-btn-left">
                                <SproutIcon />
                                <span>Catálogo Botánico</span>
                            </span>
                        </button>

                        <button
                            type="button"
                            className={`ceres-nav-btn ${vistaActual === 'perfil' ? 'active' : ''}`}
                            onClick={() => cambiarVista('perfil')}
                        >
                            <span className="ceres-nav-btn-left">
                                <SettingsIcon />
                                <span>Configuración</span>
                            </span>
                        </button>
                    </nav>
                </div>

                <div className="ceres-sidebar-bottom">
                    <div className="ceres-engine-status">
                        <span className="ceres-pulse-dot" />
                        <div>
                            <strong style={{ display: 'block', fontSize: '0.78rem' }}>Visión IA Operativa</strong>
                            <span style={{ fontSize: '0.71rem', color: 'var(--ceres-sage)' }}>
                                Base MySQL sincronizada
                            </span>
                        </div>
                    </div>

                    <button type="button" className="ceres-logout-btn" onClick={handleLogout}>
                        <LogoutIcon />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* ÁREA DE TRABAJO */}
            <div className="ceres-workspace">
                {/* TOPBAR FUNCIONAL (AppBar colapsable en móvil) */}
                <header className={`ceres-topbar ${topbarOculta ? 'topbar-hidden' : ''}`}>
                    <div className="ceres-breadcrumb">
                        {vistaActual !== 'inicio' && (
                            <>
                                <button
                                    type="button"
                                    className="ceres-mobile-back-btn"
                                    onClick={() => cambiarVista('inicio')}
                                    aria-label="Volver al inicio"
                                >
                                    <BackIcon />
                                </button>
                                <span
                                    className="ceres-breadcrumb-root"
                                    onClick={() => cambiarVista('inicio')}
                                >
                                    Inicio
                                </span>
                                <span className="ceres-breadcrumb-sep" style={{ color: 'var(--ceres-sage)' }}>/</span>
                            </>
                        )}
                        <span className="ceres-breadcrumb-current">
                            {vistaActual === 'inicio'
                                ? `Hola, ${primerNombre}`
                                : TITULOS_VISTA[vistaActual]}
                        </span>
                    </div>

                    <div className="ceres-topbar-controls">
                        {/* Selector rápido de suelo activo (visible en escritorio) */}
                        <div className="ceres-chip-control ceres-chip-hide-mobile" title="Cambiar suelo predeterminado para análisis">
                            <LayersIcon />
                            <span>Suelo:</span>
                            <select
                                className="ceres-chip-select"
                                value={usuario.suelo_preferido || 'Franco arcilloso'}
                                onChange={(e) => handleCambioSueloRapido(e.target.value)}
                            >
                                <option value="Franco arcilloso">Franco arcilloso</option>
                                <option value="Franco arenoso">Franco arenoso</option>
                                <option value="Franco limoso">Franco limoso</option>
                                <option value="Orgánico / Negro">Orgánico / Negro</option>
                            </select>
                        </div>

                        <div className="ceres-chip-control ceres-chip-hide-mobile">
                            <MapPinIcon />
                            <span>{telemetria.ubicacion}</span>
                        </div>

                        <button
                            type="button"
                            className="ceres-user-pill"
                            onClick={() => cambiarVista('perfil')}
                            title="Gestionar perfil"
                        >
                            <div className="ceres-avatar">{iniciales}</div>
                            <span
                                className="ceres-role-label-mobile"
                                style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ceres-charcoal)' }}
                            >
                                {usuario.rol || 'Agricultor'}
                            </span>
                        </button>
                    </div>
                </header>

                {/* CONTENIDO DINÁMICO */}
                <main className="ceres-content-container" key={vistaActual}>
                    {vistaActual === 'inicio' && (
                        <>
                            {/* HERO EDITORIAL CON TELEMETRÍA INTEGRADA */}
                            <section className="ceres-hero-card">
                                <div className="ceres-hero-left">
                                    <span className="ceres-hero-kicker">Plataforma de Precisión Agrícola</span>
                                    <h1 className="ceres-hero-heading">
                                        Potencia tu cultivo con Inteligencia Artificial
                                    </h1>
                                    <p className="ceres-hero-lead">
                                        Diagnostica enfermedades foliares mediante visión artificial, cruza variables microclimáticas por GPS y determina la viabilidad agronómica de cada siembra.
                                    </p>
                                    <div className="ceres-hero-actions">
                                        <button
                                            type="button"
                                            className="ceres-btn-cta-primary"
                                            onClick={() => cambiarVista('analizar')}
                                        >
                                            <ScanIcon />
                                            <span>Iniciar diagnóstico</span>
                                        </button>

                                        <button
                                            type="button"
                                            className="ceres-btn-cta-secondary"
                                            onClick={() => cambiarVista('compatibilidad')}
                                        >
                                            <span>Evaluar terreno</span>
                                            <ArrowRightIcon />
                                        </button>
                                    </div>
                                </div>

                                <div className="ceres-hero-telemetry-card">
                                    <div className="ceres-hero-temp-row">
                                        <span className="ceres-hero-temp">{telemetria.temperatura}</span>
                                        <span className="ceres-hero-weather-tag">GPS En Vivo</span>
                                    </div>
                                    <div className="ceres-hero-meta-list">
                                        <div className="ceres-hero-meta-item">
                                            <span>Condición</span>
                                            <strong>{telemetria.condicion}</strong>
                                        </div>
                                        <div className="ceres-hero-meta-item">
                                            <span>Humedad relativa</span>
                                            <strong>{telemetria.humedad}</strong>
                                        </div>
                                        <div className="ceres-hero-meta-item">
                                            <span>Terreno activo</span>
                                            <strong>{usuario.suelo_preferido || 'Franco arcilloso'}</strong>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 4 MÓDULOS DE ACCESO DIRECTO */}
                            <section className="ceres-modules-grid">
                                <button
                                    type="button"
                                    className="ceres-module-card"
                                    onClick={() => cambiarVista('analizar')}
                                >
                                    <div className="ceres-module-top">
                                        <div className="ceres-module-icon">
                                            <ScanIcon />
                                        </div>
                                        <h2 className="ceres-module-title">Analizar por Imagen</h2>
                                        <p className="ceres-module-desc">
                                            Identifica especie, estado sanitario y recomendaciones de manejo a partir de una captura foliar.
                                        </p>
                                    </div>
                                    <div
                                        className="ceres-module-media"
                                        style={{
                                            backgroundImage:
                                                "url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80')"
                                        }}
                                    >
                                        <span className="ceres-module-action-label">Abrir escáner</span>
                                        <span className="ceres-module-arrow"><ArrowRightIcon /></span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    className="ceres-module-card"
                                    onClick={() => cambiarVista('compatibilidad')}
                                >
                                    <div className="ceres-module-top">
                                        <div className="ceres-module-icon">
                                            <CompassIcon />
                                        </div>
                                        <h2 className="ceres-module-title">Ver Compatibilidad</h2>
                                        <p className="ceres-module-desc">
                                            Obtén cultivos recomendados según la temperatura, humedad y tipo de suelo de tu parcela.
                                        </p>
                                    </div>
                                    <div
                                        className="ceres-module-media"
                                        style={{
                                            backgroundImage:
                                                "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80')"
                                        }}
                                    >
                                        <span className="ceres-module-action-label">Analizar zona</span>
                                        <span className="ceres-module-arrow"><ArrowRightIcon /></span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    className="ceres-module-card"
                                    onClick={() => cambiarVista('historial')}
                                >
                                    <div className="ceres-module-top">
                                        <div className="ceres-module-icon">
                                            <HistoryIcon />
                                        </div>
                                        <h2 className="ceres-module-title">Mi Historial</h2>
                                        <p className="ceres-module-desc">
                                            Consulta el registro cronológico de tus diagnósticos, fechas y criterios de viabilidad.
                                        </p>
                                    </div>
                                    <div
                                        className="ceres-module-media"
                                        style={{
                                            backgroundImage:
                                                "url('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80')"
                                        }}
                                    >
                                        <span className="ceres-module-action-label">Ver registros</span>
                                        <span className="ceres-module-arrow"><ArrowRightIcon /></span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    className="ceres-module-card"
                                    onClick={() => cambiarVista('catalogo')}
                                >
                                    <div className="ceres-module-top">
                                        <div className="ceres-module-icon">
                                            <SproutIcon />
                                        </div>
                                        <h2 className="ceres-module-title">Catálogo de Plantas</h2>
                                        <p className="ceres-module-desc">
                                            Explora parámetros térmicos, requerimientos hídricos y suelos óptimos por especie.
                                        </p>
                                    </div>
                                    <div
                                        className="ceres-module-media"
                                        style={{
                                            backgroundImage:
                                                "url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80')"
                                        }}
                                    >
                                        <span className="ceres-module-action-label">Explorar fichas</span>
                                        <span className="ceres-module-arrow"><ArrowRightIcon /></span>
                                    </div>
                                </button>
                            </section>

                            {/* KPI STRIP CON DATOS REALES DEL USUARIO */}
                            <section className="ceres-kpi-grid">
                                <div className="ceres-kpi-card">
                                    <div className="ceres-kpi-icon">
                                        <ActivityIcon />
                                    </div>
                                    <div>
                                        <span className="ceres-kpi-label">Diagnósticos realizados</span>
                                        <span className="ceres-kpi-value">{metricas.total}</span>
                                        <span className="ceres-kpi-trend">
                                            {metricas.aptos} cultivos con viabilidad óptima
                                        </span>
                                    </div>
                                </div>

                                <div className="ceres-kpi-card">
                                    <div className="ceres-kpi-icon">
                                        <SproutIcon />
                                    </div>
                                    <div>
                                        <span className="ceres-kpi-label">Última especie evaluada</span>
                                        <span className="ceres-kpi-value" style={{ fontSize: '1.1rem' }}>
                                            {metricas.ultimoCultivo}
                                        </span>
                                        <span className="ceres-kpi-trend">Historial sincronizado</span>
                                    </div>
                                </div>

                                <div className="ceres-kpi-card">
                                    <div className="ceres-kpi-icon">
                                        <LayersIcon />
                                    </div>
                                    <div>
                                        <span className="ceres-kpi-label">Suelo predeterminado</span>
                                        <span className="ceres-kpi-value" style={{ fontSize: '1.1rem' }}>
                                            {usuario.suelo_preferido || 'Franco arcilloso'}
                                        </span>
                                        <span className="ceres-kpi-trend">Aplicado en nuevos escaneos</span>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {vistaActual === 'analizar' && <FormularioAnalisis usuario={usuario} />}
                    {vistaActual === 'compatibilidad' && <CompatibilidadZona usuario={usuario} />}
                    {vistaActual === 'historial' && <HistorialAnalisis usuario={usuario} />}
                    {vistaActual === 'catalogo' && <ListaPlantas />}
                    {vistaActual === 'perfil' && (
                        <PerfilUsuario
                            usuario={usuario}
                            onUsuarioActualizado={(userActualizado) => setUsuario(userActualizado)}
                            onVolver={() => cambiarVista('inicio')}
                            onLogout={handleLogout}
                        />
                    )}
                </main>
            </div>

            {/* BARRA INFERIOR NATIVA PARA CELULARES (<= 768px) */}
            <nav className="ceres-mobile-bottom-nav" aria-label="Navegación móvil">
                <button
                    type="button"
                    className={`ceres-bottom-tab ${vistaActual === 'inicio' ? 'active' : ''}`}
                    onClick={() => cambiarVista('inicio')}
                >
                    <HomeIcon />
                    <span>Inicio</span>
                </button>

                <button
                    type="button"
                    className={`ceres-bottom-tab ${vistaActual === 'compatibilidad' ? 'active' : ''}`}
                    onClick={() => cambiarVista('compatibilidad')}
                >
                    <CompassIcon />
                    <span>Zona</span>
                </button>

                <button
                    type="button"
                    className={`ceres-bottom-tab ${vistaActual === 'analizar' ? 'active' : ''}`}
                    onClick={() => cambiarVista('analizar')}
                    aria-label="Escanear planta"
                >
                    <span className="ceres-bottom-tab-scan">
                        <ScanIcon />
                    </span>
                    <span>Escanear</span>
                </button>

                <button
                    type="button"
                    className={`ceres-bottom-tab ${vistaActual === 'historial' ? 'active' : ''}`}
                    onClick={() => cambiarVista('historial')}
                >
                    <HistoryIcon />
                    <span>Historial</span>
                </button>

                <button
                    type="button"
                    className={`ceres-bottom-tab ${vistaActual === 'catalogo' ? 'active' : ''}`}
                    onClick={() => cambiarVista('catalogo')}
                >
                    <SproutIcon />
                    <span>Catálogo</span>
                </button>
            </nav>
        </div>
    );
}

export default App;