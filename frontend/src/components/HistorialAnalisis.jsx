import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const LeafIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
);

const TrashIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

function HistorialAnalisis({ usuario }) {
    const [historial, setHistorial] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [expandidoId, setExpandidoId] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!usuario?.id_usuario) return;
        setCargando(true);
        api.get(`/analisis?id_usuario=${usuario.id_usuario}`)
            .then((res) => {
                setHistorial(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => {
                setError('No se pudo recuperar el historial de diagnósticos.');
            })
            .finally(() => setCargando(false));
    }, [usuario?.id_usuario]);

    const eliminarRegistro = async (idRegistro) => {
        if (!window.confirm('¿Deseas eliminar este diagnóstico de tu historial?')) return;
        try {
            await api.delete(`/analisis/${idRegistro}`);
            setHistorial((prev) => prev.filter((item) => item.id !== idRegistro));
        } catch {
            setError('No se pudo eliminar el registro seleccionado.');
        }
    };

    const filtrados = historial.filter((item) => {
        const nombre = (item.planta || '').toLowerCase();
        const diag = (item.diagnostico || '').toLowerCase();
        const coincideTexto =
            nombre.includes(busqueda.toLowerCase()) || diag.includes(busqueda.toLowerCase());

        const esApto = item.es_apto === 1 || item.es_apto === true;
        if (filtroEstado === 'aptos') return coincideTexto && esApto;
        if (filtroEstado === 'alerta') return coincideTexto && !esApto;
        return coincideTexto;
    });

    return (
        <div>
            <div className="ceres-section-header">
                <div>
                    <h1 className="ceres-section-title">Historial de Diagnósticos Fitotécnicos</h1>
                    <p className="ceres-section-subtitle">
                        Registro cronológico de muestras analizadas, telemetría climática capturada y protocolos emitidos.
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
                        placeholder="Buscar por cultivo o diagnóstico..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="ceres-filter-pills">
                    <button
                        type="button"
                        className={`ceres-filter-pill ${filtroEstado === 'todos' ? 'active' : ''}`}
                        onClick={() => setFiltroEstado('todos')}
                    >
                        Todos ({historial.length})
                    </button>
                    <button
                        type="button"
                        className={`ceres-filter-pill ${filtroEstado === 'aptos' ? 'active' : ''}`}
                        onClick={() => setFiltroEstado('aptos')}
                    >
                        Viables
                    </button>
                    <button
                        type="button"
                        className={`ceres-filter-pill ${filtroEstado === 'alerta' ? 'active' : ''}`}
                        onClick={() => setFiltroEstado('alerta')}
                    >
                        Con alerta
                    </button>
                </div>
            </div>

            {cargando ? (
                <div className="ceres-surface-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <span style={{ color: 'var(--ceres-muted)', fontSize: '0.9rem' }}>
                        Sincronizando registros desde MySQL...
                    </span>
                </div>
            ) : filtrados.length === 0 ? (
                <div className="ceres-surface-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <strong style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.05rem', color: 'var(--ceres-charcoal)' }}>
                        No hay diagnósticos que coincidan con el filtro actual
                    </strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--ceres-muted)', marginTop: '0.4rem', marginBottom: 0 }}>
                        Realiza un nuevo escáner foliar desde el módulo Analizar Planta para registrar resultados.
                    </p>
                </div>
            ) : (
                <div className="ceres-history-list">
                    {filtrados.map((item) => {
                        const esApto = item.es_apto === 1 || item.es_apto === true;
                        const abierto = expandidoId === item.id;
                        const fechaTexto = item.fecha
                            ? new Date(item.fecha).toLocaleDateString('es-CO', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                              })
                            : 'Fecha registrada';

                        return (
                            <article
                                key={item.id}
                                className="ceres-history-card"
                                style={{ flexDirection: 'column', alignItems: 'stretch' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', minWidth: 0, flex: '1 1 240px' }}>
                                        <div className="ceres-history-thumb">
                                            <LeafIcon />
                                        </div>

                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                                                <h3
                                                    style={{
                                                        fontFamily: 'Manrope, sans-serif',
                                                        fontSize: '1.05rem',
                                                        fontWeight: 800,
                                                        color: 'var(--ceres-forest)',
                                                        margin: 0
                                                    }}
                                                >
                                                    {item.planta || 'Especie Evaluada'}
                                                </h3>
                                                <span className={`ceres-status-pill ${esApto ? 'apto' : 'alerta'}`}>
                                                    {esApto ? 'Viable' : 'Requiere atención'}
                                                </span>
                                            </div>

                                            <span style={{ fontSize: '0.78rem', color: 'var(--ceres-muted)', display: 'block', marginTop: '0.25rem', lineHeight: 1.4 }}>
                                                {fechaTexto} · Suelo: <strong>{item.tipo_suelo || 'Franco arcilloso'}</strong>
                                                {item.ubicacion ? ` · ${item.ubicacion}` : ''}
                                                {item.temperatura != null ? ` (${Math.round(item.temperatura)}°C / ${Math.round(item.humedad ?? 0)}%)` : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="ceres-history-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button
                                            type="button"
                                            className="ceres-btn-outline ceres-btn-view-report"
                                            style={{ height: '38px', fontSize: '0.8rem' }}
                                            onClick={() => setExpandidoId(abierto ? null : item.id)}
                                        >
                                            {abierto ? 'Ocultar informe' : 'Ver informe'}
                                        </button>

                                        <button
                                            type="button"
                                            className="ceres-btn-outline"
                                            style={{ height: '38px', padding: '0 0.75rem', color: '#B91C1C', borderColor: '#F3B8B8', background: '#FEF2F2' }}
                                            title="Eliminar registro"
                                            onClick={() => eliminarRegistro(item.id)}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>

                                {abierto && (
                                    <div
                                        style={{
                                            marginTop: '1rem',
                                            paddingTop: '1rem',
                                            borderTop: '1px solid var(--ceres-light)'
                                        }}
                                    >
                                        <div className="ceres-report-block" style={{ marginBottom: 0, overflowWrap: 'anywhere' }}>
                                            <h4>Resultado del Diagnóstico y Protocolo</h4>
                                            <p>{item.diagnostico || 'Diagnóstico registrado en el sistema.'}</p>
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default HistorialAnalisis;