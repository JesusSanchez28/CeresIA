import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const SproutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </svg>
);

const UserScanIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

function ListaPlantas() {
    const [plantas, setPlantas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [sueloFiltro, setSueloFiltro] = useState('todos');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/plantas')
            .then((res) => {
                setPlantas(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => {
                setError('No se pudo cargar el catálogo botánico.');
            })
            .finally(() => setCargando(false));
    }, []);

    const obtenerNombrePlanta = (p) =>
        p.nombre_comun || p.nombre || p.especie || p.nombre_planta || 'Especie botánica identificada';

    const obtenerAutorEscaneo = (p) =>
        p.usuario_nombre || p.nombre_usuario || p.escaneado_por || 'Base Agronómica CERES IA';

    const filtradas = plantas.filter((p) => {
        const nombrePlanta = obtenerNombrePlanta(p);
        const autor = obtenerAutorEscaneo(p);
        const texto = `${nombrePlanta} ${p.nombre_cientifico || ''} ${p.tipo || ''} ${p.descripcion || ''} ${autor}`.toLowerCase();
        const coincideTexto = texto.includes(busqueda.toLowerCase());
        if (sueloFiltro === 'todos') return coincideTexto;
        return coincideTexto && (p.tipo_suelo_ideal || '').toLowerCase().includes(sueloFiltro.toLowerCase());
    });

    return (
        <div>
            <div className="ceres-section-header">
                <div>
                    <h1 className="ceres-section-title">Catálogo Botánico de Referencia</h1>
                    <p className="ceres-section-subtitle">
                        Base de conocimiento agronómico con clasificación taxonómica, rangos térmicos, sustratos ideales y trazabilidad de escaneo.
                    </p>
                </div>
            </div>

            {error && <div className="ceres-alert-banner">{error}</div>}

            <div className="ceres-toolbar">
                <div className="ceres-search-wrapper">
                    <span className="ceres-search-icon">
                        <SearchIcon />
                    </span>
                    <input
                        type="text"
                        className="ceres-search-input"
                        placeholder="Filtrar por planta, nombre científico, tipo o usuario..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <select
                    className="ceres-select-box ceres-catalog-soil-select"
                    style={{ width: '220px', background: '#FFFFFF' }}
                    value={sueloFiltro}
                    onChange={(e) => setSueloFiltro(e.target.value)}
                >
                    <option value="todos">Todos los tipos de suelo</option>
                    <option value="Franco arcilloso">Franco arcilloso</option>
                    <option value="Franco arenoso">Franco arenoso</option>
                    <option value="Franco limoso">Franco limoso</option>
                    <option value="Orgánico">Orgánico / Negro</option>
                </select>
            </div>

            {cargando ? (
                <div className="ceres-surface-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <span style={{ color: 'var(--ceres-muted)' }}>Cargando especies registradas...</span>
                </div>
            ) : filtradas.length === 0 ? (
                <div className="ceres-surface-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <span style={{ color: 'var(--ceres-muted)' }}>No hay especies que coincidan con tu búsqueda.</span>
                </div>
            ) : (
                <div className="ceres-plant-grid">
                    {filtradas.map((planta, idx) => (
                        <article key={planta.id_planta_semilla || planta.id_planta || idx} className="ceres-plant-card">
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '11px',
                                                background: 'var(--ceres-light)',
                                                color: 'var(--ceres-forest)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            <SproutIcon />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <h3
                                                style={{
                                                    fontFamily: 'Manrope, sans-serif',
                                                    fontSize: '1.05rem',
                                                    fontWeight: 800,
                                                    color: 'var(--ceres-forest)',
                                                    margin: 0
                                                }}
                                            >
                                                {obtenerNombrePlanta(planta)}
                                            </h3>
                                            {planta.nombre_cientifico && (
                                                <em style={{ fontSize: '0.78rem', color: 'var(--ceres-muted)', display: 'block' }}>
                                                    {planta.nombre_cientifico}
                                                </em>
                                            )}
                                        </div>
                                    </div>

                                    {planta.tipo && (
                                        <span className="ceres-spec-tag" style={{ background: 'var(--ceres-light)', color: 'var(--ceres-forest)' }}>
                                            {planta.tipo}
                                        </span>
                                    )}
                                </div>

                                <p style={{ fontSize: '0.84rem', lineHeight: 1.52, color: 'var(--ceres-charcoal)', margin: '0 0 0.75rem' }}>
                                    {planta.descripcion || 'Cultivo registrado en la base agronómica de CERES IA.'}
                                </p>
                            </div>

                            <div className="ceres-spec-tags">
                                <span className="ceres-spec-tag">
                                    Temp: {planta.temp_min ?? 12}°C – {planta.temp_max ?? 25}°C
                                </span>
                                <span className="ceres-spec-tag">
                                    Humedad: {planta.humedad_min ?? 50}% – {planta.humedad_max ?? 80}%
                                </span>
                                {planta.tipo_suelo_ideal && (
                                    <span className="ceres-spec-tag" style={{ background: 'var(--ceres-light)', color: 'var(--ceres-forest)' }}>
                                        {planta.tipo_suelo_ideal}
                                    </span>
                                )}
                            </div>

                            {/* PIE DE TARJETA: USUARIO QUE ESCANEÓ */}
                            <div
                                style={{
                                    marginTop: '0.8rem',
                                    paddingTop: '0.6rem',
                                    borderTop: '1px solid #E5ECE6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.5rem',
                                    fontSize: '0.76rem',
                                    color: 'var(--ceres-muted)'
                                }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--ceres-forest)' }}>
                                    <UserScanIcon />
                                    Escaneado por: {obtenerAutorEscaneo(planta)}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ListaPlantas;