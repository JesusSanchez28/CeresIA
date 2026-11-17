import React, { useState } from 'react';
import api from '../services/api';

const AuthForm = ({ onLoginSuccess }) => {
    const [esRegistro, setEsRegistro] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const endpoint = esRegistro ? '/auth/register' : '/auth/login';
            const payload = esRegistro 
                ? formData 
                : { correo: formData.correo, password: formData.password };

            const res = await api.post(endpoint, payload);

            // Guardar sesión en localStorage
            localStorage.setItem('ceresia_token', res.data.token);
            localStorage.setItem('ceresia_usuario', JSON.stringify(res.data.usuario));

            onLoginSuccess(res.data.usuario);
        } catch (err) {
            setError(err.response?.data?.error || 'Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
            <div className="card shadow-lg border-0" style={{ maxWidth: '430px', width: '100%' }}>
                <div className="card-header bg-success text-white text-center py-3">
                    <h3 className="mb-0">🌿 CeresIA</h3>
                    <small>{esRegistro ? 'Crea tu cuenta de agricultor' : 'Inicia sesión para analizar tus cultivos'}</small>
                </div>
                <div className="card-body p-4">
                    {error && <div className="alert alert-danger py-2">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {esRegistro && (
                            <div className="mb-3">
                                <label className="form-label fw-bold">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    className="form-control"
                                    placeholder="Ej. Franklin Sánchez"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label fw-bold">Correo Electrónico</label>
                            <input
                                type="email"
                                name="correo"
                                className="form-control"
                                placeholder="correo@ejemplo.com"
                                value={formData.correo}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-success w-100 btn-lg mt-2" disabled={loading}>
                            {loading ? 'Procesando...' : esRegistro ? 'Registrarse e Ingresar' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <hr className="my-4" />
                    <div className="text-center">
                        <button
                            type="button"
                            className="btn btn-link text-success text-decoration-none fw-bold"
                            onClick={() => {
                                setEsRegistro(!esRegistro);
                                setError(null);
                            }}
                        >
                            {esRegistro ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Regístrate gratis'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;