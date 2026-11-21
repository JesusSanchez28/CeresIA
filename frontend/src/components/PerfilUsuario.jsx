import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SaveIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </svg>
);

function PerfilUsuario({ usuario, onUsuarioActualizado, onVolver, onLogout }) {
    const [nombre, setNombre] = useState(usuario?.nombre || '');
    const [sueloPreferido, setSueloPreferido] = useState(
        usuario?.suelo_preferido || 'Franco arcilloso'
    );
    const [guardando, setGuardando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (usuario) {
            setNombre(usuario.nombre || '');
            setSueloPreferido(usuario.suelo_preferido || 'Franco arcilloso');
        }
    }, [usuario]);

    const iniciales = nombre
        ? nombre
              .trim()
              .split(' ')
              .slice(0, 2)
              .map((n) => n[0])
              .join('')
              .toUpperCase()
        : 'U';

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            setError('El nombre del productor no puede estar vacío.');
            return;
        }

        setGuardando(true);
        setError(null);
        setMensajeExito(null);

        try {
            const payload = {
                id_usuario: usuario.id_usuario,
                nombre: nombre.trim(),
                suelo_preferido: sueloPreferido
            };

            const res = await api.put('/auth/profile', payload);

            const usuarioActualizado = {
                ...usuario,
                ...(res.data?.usuario || {}),
                nombre: nombre.trim(),
                suelo_preferido: sueloPreferido
            };

            if (localStorage.getItem('ceresia_usuario')) {
                localStorage.setItem('ceresia_usuario', JSON.stringify(usuarioActualizado));
            }
            if (sessionStorage.getItem('ceresia_usuario')) {
                sessionStorage.setItem('ceresia_usuario', JSON.stringify(usuarioActualizado));
            }

            if (onUsuarioActualizado) {
                onUsuarioActualizado(usuarioActualizado);
            }

            setMensajeExito('Perfil y parámetros de suelo actualizados correctamente.');
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    'No se pudieron guardar los cambios en el servidor.'
            );
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div className="ceres-section-header">
                <div>
                    <h1 className="ceres-section-title">Configuración de Cuenta</h1>
                    <p className="ceres-section-subtitle">
                        Administra tus datos personales, el tipo de suelo predeterminado de tu parcela y la sesión activa.
                    </p>
                </div>

                {onVolver && (
                    <button
                        type="button"
                        className="ceres-btn-outline"
                        onClick={onVolver}
                    >
                        <ArrowLeftIcon />
                        <span>Volver al Panel</span>
                    </button>
                )}
            </div>

            {error && <div className="ceres-alert-banner">{error}</div>}

            {mensajeExito && (
                <div
                    style={{
                        background: '#E5EDE2',
                        border: '1px solid #B7CEB2',
                        color: '#163D2B',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        marginBottom: '1.1rem'
                    }}
                >
                    {mensajeExito}
                </div>
            )}

            <section className="ceres-surface-card">
                {/* CABECERA DE IDENTIDAD DEL PRODUCTOR */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        paddingBottom: '1.25rem',
                        marginBottom: '1.25rem',
                        borderBottom: '1px solid var(--ceres-light)',
                        flexWrap: 'wrap'
                    }}
                >
                    <div
                        style={{
                            width: '58px',
                            height: '58px',
                            borderRadius: '18px',
                            background: 'var(--ceres-forest)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            flexShrink: 0
                        }}
                    >
                        {iniciales}
                    </div>

                    <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                        <h2
                            style={{
                                fontFamily: 'Manrope, sans-serif',
                                fontSize: '1.12rem',
                                fontWeight: 800,
                                color: 'var(--ceres-charcoal)',
                                margin: '0 0 0.25rem 0',
                                wordBreak: 'break-word'
                            }}
                        >
                            {usuario?.nombre || 'Productor Agrícola'}
                        </h2>
                        <div
                            style={{
                                fontSize: '0.82rem',
                                color: 'var(--ceres-muted)',
                                overflowWrap: 'anywhere',
                                lineHeight: 1.4
                            }}
                        >
                            {usuario?.correo || 'Correo registrado'} ·{' '}
                            <strong style={{ color: 'var(--ceres-natural)' }}>
                                {usuario?.rol || 'Agricultor'}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* FORMULARIO DE ACTUALIZACIÓN */}
                <form onSubmit={handleGuardar}>
                    <div className="ceres-form-row-2">
                        <div>
                            <label className="ceres-field-label" htmlFor="perfil-nombre">
                                Nombre completo
                            </label>
                            <input
                                id="perfil-nombre"
                                type="text"
                                className="ceres-input-box"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Tu nombre"
                                required
                            />
                        </div>

                        <div>
                            <label className="ceres-field-label" htmlFor="perfil-suelo">
                                Tipo de suelo predeterminado
                            </label>
                            <select
                                id="perfil-suelo"
                                className="ceres-select-box"
                                value={sueloPreferido}
                                onChange={(e) => setSueloPreferido(e.target.value)}
                            >
                                <option value="Franco arcilloso">Franco arcilloso</option>
                                <option value="Franco arenoso">Franco arenoso</option>
                                <option value="Franco limoso">Franco limoso</option>
                                <option value="Orgánico / Negro">Orgánico / Negro</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <label className="ceres-field-label" htmlFor="perfil-correo">
                            Correo electrónico (solo lectura)
                        </label>
                        <input
                            id="perfil-correo"
                            type="email"
                            className="ceres-input-box"
                            value={usuario?.correo || ''}
                            disabled
                            style={{
                                background: 'var(--ceres-light)',
                                color: 'var(--ceres-muted)',
                                cursor: 'not-allowed',
                                fontSize: '0.85rem'
                            }}
                        />
                    </div>

                    <div style={{ marginTop: '1.35rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            className="ceres-btn-forest"
                            style={{ width: '100%' }}
                            disabled={guardando}
                        >
                            <SaveIcon />
                            <span>{guardando ? 'Guardando cambios...' : 'Guardar cambios'}</span>
                        </button>
                    </div>
                </form>

                {/* SECCIÓN DE CIERRE DE SESIÓN CON ALTO CONTRASTE */}
                {onLogout && (
                    <div
                        style={{
                            marginTop: '1.6rem',
                            paddingTop: '1.3rem',
                            borderTop: '1px solid var(--ceres-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            flexWrap: 'wrap'
                        }}
                    >
                        <div style={{ flex: '1 1 220px' }}>
                            <strong
                                style={{
                                    display: 'block',
                                    fontSize: '0.92rem',
                                    color: 'var(--ceres-charcoal)'
                                }}
                            >
                                Sesión en este dispositivo
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--ceres-muted)' }}>
                                Finaliza tu sesión actual para volver a la pantalla de acceso.
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={onLogout}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                width: '100%',
                                padding: '0.72rem 1.15rem',
                                borderRadius: '12px',
                                border: '1px solid #F3B8B8',
                                background: '#FEF2F2',
                                color: '#B91C1C',
                                fontWeight: 700,
                                fontSize: '0.86rem',
                                cursor: 'pointer'
                            }}
                        >
                            <LogoutIcon />
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default PerfilUsuario;