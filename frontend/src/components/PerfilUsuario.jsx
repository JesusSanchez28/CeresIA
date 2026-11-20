import React, { useState } from 'react';
import api from '../services/api';

function PerfilUsuario({ usuario, onUsuarioActualizado, onVolver }) {
    const [nombre, setNombre] = useState(usuario?.nombre || '');
    const [sueloPreferido, setSueloPreferido] = useState(usuario?.suelo_preferido || 'Franco arcilloso');
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    // Cambio de contraseña
    const [passwordActual, setPasswordActual] = useState('');
    const [passwordNueva, setPasswordNueva] = useState('');
    const [cambiandoPass, setCambiandoPass] = useState(false);
    const [msgPass, setMsgPass] = useState(null);
    const [errPass, setErrPass] = useState(null);

    const iniciales = nombre
        ? nombre
              .split(' ')
              .slice(0, 2)
              .map((n) => n[0])
              .join('')
              .toUpperCase()
        : 'U';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            setError('El nombre no puede estar vacío.');
            return;
        }

        setGuardando(true);
        setError(null);
        setMensaje(null);

        try {
            const res = await api.put('/auth/profile', {
                id_usuario: usuario.id_usuario,
                nombre: nombre.trim(),
                suelo_preferido: sueloPreferido
            });

            const actualizado = res.data?.usuario || {
                ...usuario,
                nombre: nombre.trim(),
                suelo_preferido: sueloPreferido
            };

            if (localStorage.getItem('ceresia_usuario')) {
                localStorage.setItem('ceresia_usuario', JSON.stringify(actualizado));
            }
            if (sessionStorage.getItem('ceresia_usuario')) {
                sessionStorage.setItem('ceresia_usuario', JSON.stringify(actualizado));
            }

            onUsuarioActualizado(actualizado);
            setMensaje('Cambios guardados y sincronizados con tu cuenta.');
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo actualizar el perfil.');
        } finally {
            setGuardando(false);
        }
    };

    const handleCambioPassword = async (e) => {
        e.preventDefault();
        if (passwordNueva.length < 6) {
            setErrPass('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setCambiandoPass(true);
        setErrPass(null);
        setMsgPass(null);

        try {
            const res = await api.put('/auth/password', {
                id_usuario: usuario.id_usuario,
                passwordActual,
                passwordNueva
            });
            setMsgPass(res.data?.mensaje || 'Contraseña actualizada correctamente.');
            setPasswordActual('');
            setPasswordNueva('');
        } catch (err) {
            setErrPass(err.response?.data?.error || 'No se pudo cambiar la contraseña.');
        } finally {
            setCambiandoPass(false);
        }
    };

    return (
        <div>
            <div className="ceres-section-header">
                <div>
                    <h1 className="ceres-section-title">Configuración de Cuenta y Terreno</h1>
                    <p className="ceres-section-subtitle">
                        Administra tu identidad dentro de CERES IA, el sustrato predeterminado y la seguridad de acceso.
                    </p>
                </div>
            </div>

            <div className="ceres-profile-grid">
                {/* TARJETA DE IDENTIDAD */}
                <aside className="ceres-profile-banner-card">
                    <div className="ceres-profile-avatar-lg">{iniciales}</div>
                    <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                        {usuario?.nombre}
                    </h2>
                    <span style={{ fontSize: '0.82rem', color: 'var(--ceres-sage)', display: 'block', marginBottom: '1.15rem' }}>
                        {usuario?.correo}
                    </span>

                    <div
                        style={{
                            padding: '0.75rem',
                            borderRadius: '12px',
                            background: 'rgba(248, 248, 243, 0.08)',
                            border: '1px solid rgba(229, 237, 226, 0.14)',
                            fontSize: '0.8rem',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--ceres-sage)' }}>Rol asignado</span>
                            <strong>{usuario?.rol || 'Agricultor'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--ceres-sage)' }}>Estado</span>
                            <strong style={{ color: '#4ADE80' }}>Verificado</strong>
                        </div>
                    </div>
                </aside>

                {/* FORMULARIOS DE CONFIGURACIÓN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <form className="ceres-surface-card" onSubmit={handleSubmit}>
                        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.05rem', fontWeight: 800, color: 'var(--ceres-forest)', margin: '0 0 1rem 0' }}>
                            Datos Generales y Sustrato
                        </h3>

                        {mensaje && <div className="ceres-success-banner">{mensaje}</div>}
                        {error && <div className="ceres-alert-banner">{error}</div>}

                        <div style={{ marginBottom: '1.15rem' }}>
                            <label className="ceres-field-label">Nombre completo</label>
                            <input
                                type="text"
                                className="ceres-input-box"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.15rem' }}>
                            <label className="ceres-field-label">Correo electrónico registrado</label>
                            <input
                                type="email"
                                className="ceres-input-box"
                                value={usuario?.correo || ''}
                                disabled
                                style={{ opacity: 0.7, cursor: 'not-allowed' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.35rem' }}>
                            <label className="ceres-field-label">Tipo de suelo predeterminado</label>
                            <select
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

                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button type="submit" className="ceres-btn-forest" disabled={guardando}>
                                {guardando ? 'Guardando cambios...' : 'Guardar configuración'}
                            </button>

                            {onVolver && (
                                <button type="button" className="ceres-btn-outline" onClick={onVolver}>
                                    Regresar al Inicio
                                </button>
                            )}
                        </div>
                    </form>

                    {/* SEGURIDAD Y CONTRASEÑA */}
                    <form className="ceres-surface-card" onSubmit={handleCambioPassword}>
                        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.05rem', fontWeight: 800, color: 'var(--ceres-forest)', margin: '0 0 1rem 0' }}>
                            Seguridad de Acceso
                        </h3>

                        {msgPass && <div className="ceres-success-banner">{msgPass}</div>}
                        {errPass && <div className="ceres-alert-banner">{errPass}</div>}

                        <div className="ceres-form-row-2" style={{ marginTop: 0, marginBottom: '1.25rem' }}>
                            <div>
                                <label className="ceres-field-label">Contraseña actual</label>
                                <input
                                    type="password"
                                    className="ceres-input-box"
                                    value={passwordActual}
                                    onChange={(e) => setPasswordActual(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="ceres-field-label">Nueva contraseña</label>
                                <input
                                    type="password"
                                    className="ceres-input-box"
                                    value={passwordNueva}
                                    onChange={(e) => setPasswordNueva(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="ceres-btn-outline" disabled={cambiandoPass}>
                            {cambiandoPass ? 'Actualizando...' : 'Actualizar contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PerfilUsuario;