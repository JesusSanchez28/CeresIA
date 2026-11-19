import React, { useState } from 'react';
import api from '../services/api';

const PerfilUsuario = ({ usuario, onUsuarioActualizado, onVolver }) => {
    const [nombre, setNombre] = useState(usuario.nombre || '');
    const [sueloPreferido, setSueloPreferido] = useState(usuario.suelo_preferido || 'Franco arcilloso');
    const [mensajePerfil, setMensajePerfil] = useState(null);

    const [passwordActual, setPasswordActual] = useState('');
    const [passwordNueva, setPasswordNueva] = useState('');
    const [mensajePass, setMensajePass] = useState(null);

    const guardarPerfil = async (e) => {
        e.preventDefault();
        setMensajePerfil(null);
        try {
            const res = await api.put('/auth/profile', {
                id_usuario: usuario.id_usuario,
                nombre,
                suelo_preferido: sueloPreferido
            });
            localStorage.setItem('ceresia_usuario', JSON.stringify(res.data.usuario));
            onUsuarioActualizado(res.data.usuario);
            setMensajePerfil({ tipo: 'success', texto: res.data.mensaje });
        } catch (err) {
            setMensajePerfil({ tipo: 'danger', texto: err.response?.data?.error || 'Error al actualizar perfil.' });
        }
    };

    const guardarPassword = async (e) => {
        e.preventDefault();
        setMensajePass(null);
        try {
            const res = await api.put('/auth/password', {
                id_usuario: usuario.id_usuario,
                passwordActual,
                passwordNueva
            });
            setPasswordActual('');
            setPasswordNueva('');
            setMensajePass({ tipo: 'success', texto: res.data.mensaje });
        } catch (err) {
            setMensajePass({ tipo: 'danger', texto: err.response?.data?.error || 'Error al cambiar contraseña.' });
        }
    };

    return (
        <div>
            <button onClick={onVolver} className="btn btn-outline-secondary mb-3">
                ← Volver al Menú Principal
            </button>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-success text-white fw-bold">
                            ⚙️ Configuración de Cuenta y Terreno
                        </div>
                        <div className="card-body">
                            {mensajePerfil && <div className={`alert alert-${mensajePerfil.tipo} py-2`}>{mensajePerfil.texto}</div>}

                            <form onSubmit={guardarPerfil}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Nombre Completo</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Correo Electrónico</label>
                                    <input type="email" className="form-control bg-light" value={usuario.correo} disabled />
                                    <small className="text-success fw-semibold">✔ Cuenta verificada</small>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Tipo de Suelo Predominante</label>
                                    <select
                                        className="form-select"
                                        value={sueloPreferido}
                                        onChange={(e) => setSueloPreferido(e.target.value)}
                                    >
                                        <option value="Franco arcilloso">Franco arcilloso</option>
                                        <option value="Franco arenoso">Franco arenoso</option>
                                        <option value="Franco limoso">Franco limoso</option>
                                        <option value="Orgánico / Negro">Orgánico / Negro</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-success w-100 fw-bold">
                                    Guardar Preferencias
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-dark text-white fw-bold">
                            🔒 Seguridad y Contraseña
                        </div>
                        <div className="card-body">
                            {mensajePass && <div className={`alert alert-${mensajePass.tipo} py-2`}>{mensajePass.texto}</div>}

                            <form onSubmit={guardarPassword}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Contraseña Actual</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordActual}
                                        onChange={(e) => setPasswordActual(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Mínimo 6 caracteres"
                                        value={passwordNueva}
                                        onChange={(e) => setPasswordNueva(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-dark w-100 fw-bold">
                                    Actualizar Contraseña
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilUsuario;