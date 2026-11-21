import React, { useState, useEffect } from 'react';
import api from '../services/api';

const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
    </svg>
);

const ThermometerIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
);

const DropletsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
        <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
    </svg>
);

function CompatibilidadZona({ usuario }) {
    const [suelo, setSuelo] = useState(usuario?.suelo_preferido || 'Franco arcilloso');
    const [datosZona, setDatosZona] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const consultarCompatibilidad = (sueloSeleccionado) => {
        setCargando(true);
        setError(null);

        const ejecutarPeticion = (lat, lon) => {
            const params = new URLSearchParams();
            if (lat && lon) {
                params.append('lat', lat);
                params.append('lon', lon);
            }
            if (sueloSeleccionado) {
                params.append('suelo', sueloSeleccionado);
            }

            api.get(`/analisis/compatibilidad?${params.toString()}`)
                .then((res) => {
                    setDatosZona(res.data);
                })
                .catch((err) => {
                    setError(
                        err.response?.data?.error ||
                            'No se pudo obtener el cruce agroclimático de la zona.'
                    );
                })
                .finally(() => setCargando(false));
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => ejecutarPeticion(pos.coords.latitude, pos.coords.longitude),
                () => ejecutarPeticion(4.8136, -74.3545)
            );
        } else {
            ejecutarPeticion(4.8136, -74.3545);
        }
    };

    useEffect(() => {
        const sueloActivo = usuario?.suelo_preferido || 'Franco arcilloso';
        setSuelo(sueloActivo);
        consultarCompatibilidad(sueloActivo);
    }, [usuario?.suelo_preferido]);

    const clima = datosZona?.clima || {};
    const cultivos =
        datosZona?.cultivos_recomendados ||
        datosZona?.recomendaciones ||
        datosZona?.plantas ||
        [];

    return (
        <div>
            <div className="ceres-section-header">
                <div>
                    <h1 className="ceres-section-title">Compatibilidad Agroclimática por Terreno</h1>
                    <p className="ceres-section-subtitle">
                        Cruce en tiempo real entre las variables atmosféricas de tu ubicación y los requerimientos fisiológicos de cada cultivo.
                    </p>
                </div>

                <div className="ceres-zona-controls">
                    <select
                        className="ceres-select-box"
                        style={{ background: '#FFFFFF' }}
                        value={suelo}
                        onChange={(e) => {
                            setSuelo(e.target.value);
                            consultarCompatibilidad(e.target.value);
                        }}
                    >
                        <option value="Franco arcilloso">Suelo: Franco arcilloso</option>
                        <option value="Franco arenoso">Suelo: Franco arenoso</option>
                        <option value="Franco limoso">Suelo: Franco limoso</option>
                        <option value="Orgánico / Negro">Suelo: Orgánico / Negro</option>
                    </select>

                    <button
                        type="button"
                        className="ceres-btn-forest"
                        onClick={() => consultarCompatibilidad(suelo)}
                        disabled={cargando}
                    >
                        <RefreshIcon />
                        <span>{cargando ? 'Calculando...' : 'Recalcular'}</span>
                    </button>
                </div>
            </div>

            {error && <div className="ceres-alert-banner">{error}</div>}

            {cargando ? (
                <div className="ceres-surface-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <strong style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--ceres-forest)', display: 'block', marginBottom: '0.35rem' }}>
                        Analizando microclima y sustrato ({suelo})...
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--ceres-muted)' }}>
                        Consultando estación meteorológica y motor agronómico CERES IA.
                    </span>
                </div>
            ) : (
                datosZona && (
                    <>
                        {/* BANNER DE TELEMETRÍA METEOROLÓGICA */}
                        <section className="ceres-weather-banner">
                            <div>
                                <span
                                    style={{
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.09em',
                                        textTransform: 'uppercase',
                                        color: 'var(--ceres-gold)'
                                    }}
                                >
                                    Estación Agroclimática Activa
                                </span>
                                <h2
                                    style={{
                                        fontFamily: 'Manrope, sans-serif',
                                        fontSize: '1.45rem',
                                        fontWeight: 800,
                                        margin: '0.25rem 0'
                                    }}
                                >
                                    {clima.ubicacion || 'Zona de Cultivo Evaluada'}
                                </h2>
                                <span style={{ fontSize: '0.86rem', color: 'var(--ceres-light)' }}>
                                    {clima.descripcion || 'Condiciones estables'} · Sustrato: <strong>{suelo}</strong>
                                </span>
                            </div>

                            <div className="ceres-weather-stats">
                                <div className="ceres-weather-stat-box">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: 'var(--ceres-sage)' }}>
                                        <ThermometerIcon />
                                        <span>Temperatura</span>
                                    </div>
                                    <strong style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.35rem' }}>
                                        {clima.temperatura !== undefined ? `${Math.round(clima.temperatura)}°C` : '18°C'}
                                    </strong>
                                </div>

                                <div className="ceres-weather-stat-box">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: 'var(--ceres-sage)' }}>
                                        <DropletsIcon />
                                        <span>Humedad Relativa</span>
                                    </div>
                                    <strong style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.35rem' }}>
                                        {clima.humedad !== undefined ? `${clima.humedad}%` : '74%'}
                                    </strong>
                                </div>
                            </div>
                        </section>

                        {/* TARJETAS DE CULTIVOS COMPATIBLES */}
                        {cultivos.length > 0 ? (
                            <div className="ceres-crops-grid">
                                {cultivos.map((item, idx) => {
                                    const afinidad = item.porcentaje_compatibilidad || item.compatibilidad || (95 - idx * 6);
                                    return (
                                        <article key={item.id_planta_semilla || item.id_planta || idx} className="ceres-crop-card">
                                            <div>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <h3
                                                        style={{
                                                            fontFamily: 'Manrope, sans-serif',
                                                            fontSize: '1.1rem',
                                                            fontWeight: 800,
                                                            color: 'var(--ceres-forest)',
                                                            margin: 0
                                                        }}
                                                    >
                                                        {item.nombre_comun || item.nombre}
                                                    </h3>
                                                    <span className="ceres-status-pill apto">
                                                        {afinidad}% Afinidad
                                                    </span>
                                                </div>

                                                {item.nombre_cientifico && (
                                                    <em style={{ fontSize: '0.8rem', color: 'var(--ceres-muted)' }}>
                                                        {item.nombre_cientifico}
                                                    </em>
                                                )}

                                                <div className="ceres-progress-track">
                                                    <div
                                                        className="ceres-progress-fill"
                                                        style={{ width: `${Math.min(100, Math.max(20, afinidad))}%` }}
                                                    />
                                                </div>

                                                <p
                                                    style={{
                                                        fontSize: '0.84rem',
                                                        color: 'var(--ceres-charcoal)',
                                                        lineHeight: 1.5,
                                                        margin: '0 0 0.85rem 0'
                                                    }}
                                                >
                                                    {item.descripcion ||
                                                        item.motivo ||
                                                        `Desarrollo óptimo en suelos ${item.tipo_suelo_ideal || suelo} bajo el régimen térmico actual.`}
                                                </p>
                                            </div>

                                            <div
                                                style={{
                                                    paddingTop: '0.75rem',
                                                    borderTop: '1px solid var(--ceres-light)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    fontSize: '0.76rem',
                                                    color: 'var(--ceres-muted)'
                                                }}
                                            >
                                                <span>
                                                    Temp: <strong>{item.temp_min ?? 12}°C – {item.temp_max ?? 24}°C</strong>
                                                </span>
                                                <span>
                                                    Suelo: <strong>{item.tipo_suelo_ideal || suelo}</strong>
                                                </span>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="ceres-surface-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                                <p style={{ color: 'var(--ceres-muted)', margin: 0 }}>
                                    No se encontraron cultivos registrados en el catálogo para cruzar con esta temperatura.
                                </p>
                            </div>
                        )}
                    </>
                )
            )}
        </div>
    );
}

export default CompatibilidadZona;