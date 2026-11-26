import React, { useState, useMemo, useEffect, useRef } from 'react';
import api from '../services/api';
import '../styles/auth.css';

/* Nuevo logo oficial de CERES IA (ubicado en frontend/public/logo.png) */
const LeafLogoIcon = () => (
    <img
        src="/logo.png"
        alt="CERES IA"
        onError={(e) => {
            e.currentTarget.style.display = 'none';
        }}
        style={{
            width: '34px',
            height: '34px',
            objectFit: 'contain',
            borderRadius: '8px',
            display: 'block'
        }}
    />
);

const SwapArrowIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

const UserIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const MailIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const LockIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

const ShieldCheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const EyeIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
);

const AlertCircleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const evaluarSeguridadPassword = (password) => {
    if (!password) return { nivel: 0, etiqueta: '', detalle: 'Mínimo 6 caracteres' };

    let puntaje = 0;
    if (password.length >= 6) puntaje += 1;
    if (password.length >= 8 && /[A-Z]/.test(password)) puntaje += 1;
    if (/[0-9]/.test(password)) puntaje += 1;
    if (/[^A-Za-z0-9]/.test(password)) puntaje += 1;

    const niveles = {
        1: { etiqueta: 'Débil', detalle: 'Añade mayúsculas y números' },
        2: { etiqueta: 'Aceptable', detalle: 'Buen inicio, añade un símbolo' },
        3: { etiqueta: 'Segura', detalle: 'Contraseña sólida' },
        4: { etiqueta: 'Muy segura', detalle: 'Protección óptima' }
    };

    return {
        nivel: puntaje,
        etiqueta: niveles[puntaje]?.etiqueta || 'Débil',
        detalle: niveles[puntaje]?.detalle || 'Mínimo 6 caracteres'
    };
};

const AuthForm = ({ onLoginSuccess }) => {
    // 'login' | 'register' | 'verify' | 'forgot' | 'reset'
    const [vista, setVista] = useState('login');
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        password: '',
        confirmarPassword: '',
        rol: 'Agricultor',
        suelo_preferido: 'Franco arcilloso'
    });
    const [codigoOTP, setCodigoOTP] = useState('');
    const [recordarSesion, setRecordarSesion] = useState(true);
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [modalTerminosAbierto, setModalTerminosAbierto] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const panelesIntercambiados = vista === 'register';

    const seguridadPassword = useMemo(
        () => evaluarSeguridadPassword(formData.password),
        [formData.password]
    );

    const passwordsCoinciden =
        (vista === 'register' || vista === 'reset') &&
        formData.confirmarPassword.length > 0 &&
        formData.password === formData.confirmarPassword;

    const passwordsNoCoinciden =
        (vista === 'register' || vista === 'reset') &&
        formData.confirmarPassword.length > 0 &&
        formData.password !== formData.confirmarPassword;

    // Cerrar modal con tecla Escape
    useEffect(() => {
        if (!modalTerminosAbierto) return;
        const manejarEscape = (e) => {
            if (e.key === 'Escape') setModalTerminosAbierto(false);
        };
        window.addEventListener('keydown', manejarEscape);
        return () => window.removeEventListener('keydown', manejarEscape);
    }, [modalTerminosAbierto]);

    const guardarSesion = (token, usuario) => {
        const storage = recordarSesion ? localStorage : sessionStorage;
        localStorage.removeItem('ceresia_token');
        localStorage.removeItem('ceresia_usuario');
        sessionStorage.removeItem('ceresia_token');
        sessionStorage.removeItem('ceresia_usuario');

        storage.setItem('ceresia_token', token);
        storage.setItem('ceresia_usuario', JSON.stringify(usuario));
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const cambiarVista = (nuevaVista) => {
        setVista(nuevaVista);
        setError(null);
        setInfo(null);
        setMostrarPassword(false);
        setMostrarConfirmar(false);
    };

    const alternarSwap = () => {
        cambiarVista(panelesIntercambiados ? 'login' : 'register');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setInfo(null);

        try {
            const res = await api.post('/auth/login', {
                correo: formData.correo,
                password: formData.password
            });

            if (res.data.requiereVerificacion) {
                setVista('verify');
                setInfo(res.data.mensaje);
                return;
            }

            guardarSesion(res.data.token, res.data.usuario);
            onLoginSuccess(res.data.usuario);
        } catch (err) {
            if (err.response?.data?.requiereVerificacion) {
                setVista('verify');
                setError(err.response.data.error);
            } else {
                setError(err.response?.data?.error || 'No se pudo iniciar sesión. Verifica tus credenciales.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setInfo(null);

        if (formData.nombre.trim().length < 3) {
            setError('Ingresa tu nombre completo.');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe contener al menos 6 caracteres.');
            return;
        }

        if (formData.password !== formData.confirmarPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (!aceptaTerminos) {
            setError('Debes aceptar los Términos, Condiciones y la Política de Tratamiento de Datos para crear tu cuenta.');
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/auth/register', {
                nombre: formData.nombre,
                correo: formData.correo,
                password: formData.password,
                rol: formData.rol,
                suelo_preferido: formData.suelo_preferido
            });

            if (res.data.requiereVerificacion) {
                setVista('verify');
                setInfo(res.data.mensaje);
                return;
            }

            guardarSesion(res.data.token, res.data.usuario);
            onLoginSuccess(res.data.usuario);
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo completar el registro.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerificarCodigo = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setInfo(null);

        try {
            const res = await api.post('/auth/verify', {
                correo: formData.correo,
                codigo: codigoOTP
            });

            guardarSesion(res.data.token, res.data.usuario);
            onLoginSuccess(res.data.usuario);
        } catch (err) {
            setError(err.response?.data?.error || 'El código ingresado es incorrecto.');
        } finally {
            setLoading(false);
        }
    };

    const handleReenviarCodigo = async () => {
        setError(null);
        setInfo(null);

        try {
            const res = await api.post('/auth/resend-code', { correo: formData.correo });
            setInfo(res.data.mensaje);
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo reenviar el código de verificación.');
        }
    };

    const handleSolicitarRecuperacion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setInfo(null);

        try {
            const res = await api.post('/auth/forgot-password', { correo: formData.correo });
            setCodigoOTP('');
            setFormData((prev) => ({ ...prev, password: '', confirmarPassword: '' }));
            setVista('reset');
            setInfo(res.data.mensaje);
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo enviar el código de recuperación.');
        } finally {
            setLoading(false);
        }
    };

    const handleRestablecerPassword = async (e) => {
        e.preventDefault();
        setError(null);
        setInfo(null);

        if (formData.password.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (formData.password !== formData.confirmarPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/auth/reset-password', {
                correo: formData.correo,
                codigo: codigoOTP,
                nuevaPassword: formData.password
            });

            setCodigoOTP('');
            setFormData((prev) => ({ ...prev, password: '', confirmarPassword: '' }));
            setVista('login');
            setInfo(res.data.mensaje);
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo restablecer la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    const googleBtnRef = useRef(null);
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const preferenciasRef = useRef({
        rol: formData.rol,
        suelo_preferido: formData.suelo_preferido,
        onLoginSuccess
    });

    useEffect(() => {
        preferenciasRef.current = {
            rol: formData.rol,
            suelo_preferido: formData.suelo_preferido,
            onLoginSuccess
        };
    }, [formData.rol, formData.suelo_preferido, onLoginSuccess]);

    useEffect(() => {
        if ((vista !== 'login' && vista !== 'register') || !googleClientId) return;

        const renderizarBotonGoogle = () => {
            if (!window.google?.accounts?.id || !googleBtnRef.current) return;

            const anchoContenedor = googleBtnRef.current.parentElement?.offsetWidth || 300;
            const anchoBoton = Math.max(220, Math.min(380, Math.floor(anchoContenedor)));

            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
                theme: 'outline',
                size: 'large',
                shape: 'pill',
                text: vista === 'register' ? 'signup_with' : 'continue_with',
                width: anchoBoton,
                locale: 'es'
            });
        };

        const inicializarUnaSolaVez = () => {
            if (!window.google?.accounts?.id || !googleBtnRef.current) return;

            if (!window.__ceresGoogleInitialized) {
                window.__ceresGoogleInitialized = true;
                window.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: async (response) => {
                        setLoading(true);
                        setError(null);
                        setInfo(null);
                        try {
                            const { rol, suelo_preferido, onLoginSuccess: onSuccess } = preferenciasRef.current;
                            const res = await api.post('/auth/google', {
                                credential: response.credential,
                                rol,
                                suelo_preferido
                            });
                            guardarSesion(res.data.token, res.data.usuario);
                            onSuccess(res.data.usuario);
                        } catch (err) {
                            setError(err.response?.data?.error || 'No se pudo iniciar sesión con Google.');
                        } finally {
                            setLoading(false);
                        }
                    }
                });
            }

            renderizarBotonGoogle();
        };

        let timer;
        if (window.google?.accounts?.id) {
            inicializarUnaSolaVez();
        } else {
            timer = setInterval(() => {
                if (window.google?.accounts?.id) {
                    clearInterval(timer);
                    inicializarUnaSolaVez();
                }
            }, 250);
        }

        window.addEventListener('resize', renderizarBotonGoogle);
        return () => {
            if (timer) clearInterval(timer);
            window.removeEventListener('resize', renderizarBotonGoogle);
        };
    }, [vista, googleClientId]);

    return (
        <div className={`ceres-auth-page ${panelesIntercambiados ? 'is-swapped' : ''}`}>
            {/* PANEL VISUAL (Desplazable) */}
            <aside className={`ceres-visual-panel ${panelesIntercambiados ? 'mode-register' : 'mode-login'}`}>
                <div className="ceres-visual-overlay" />
                <div className="ceres-visual-glow" />

                <div className="ceres-visual-content">
                    <div className="ceres-brand">
                        <div className="ceres-brand-mark" style={{ background: '#FFFFFF', padding: '4px' }}>
                            <LeafLogoIcon />
                        </div>
                        <div>
                            <span className="ceres-brand-name">CERES IA</span>
                            <span className="ceres-brand-tag">Agro-Inteligencia</span>
                        </div>
                    </div>

                    <div className="ceres-hero-copy">
                        <span className="ceres-hero-eyebrow">
                            <span className="ceres-eyebrow-dot" />
                            Plataforma de Precisión Agrícola
                        </span>
                        <h1 className="ceres-hero-title">
                            La inteligencia que impulsa el futuro de la agricultura
                        </h1>
                        <p className="ceres-hero-subtitle">
                            Analiza la salud fitosanitaria de tus plantas mediante visión artificial, evalúa el microclima por GPS y optimiza la compatibilidad de cada cultivo con tu terreno.
                        </p>

                        <div className="ceres-hud-card">
                            <div className="ceres-hud-header">
                                <span>Telemetría Agroclimática</span>
                                <span className="ceres-hud-badge">
                                    <CheckCircleIcon />
                                    Motor IA Activo
                                </span>
                            </div>
                            <div className="ceres-hud-grid">
                                <div className="ceres-hud-metric">
                                    <span>Visión Botánica</span>
                                    <strong>Especie y Salud</strong>
                                </div>
                                <div className="ceres-hud-metric">
                                    <span>Clima Local</span>
                                    <strong>Tiempo Real</strong>
                                </div>
                                <div className="ceres-hud-metric">
                                    <span>Suelo y Siembra</span>
                                    <strong>Alta Precisión</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ceres-visual-footer">
                        <span>Protegido bajo Ley 1581 de 2012 (Habeas Data) · Colombia</span>
                        <span style={{ color: 'var(--ceres-gold)', fontWeight: 600 }}>CERES IA</span>
                    </div>
                </div>
            </aside>

            {/* BOTÓN CIRCULAR FLOTANTE DE DESPLAZAMIENTO */}
            <button
                type="button"
                className="ceres-swap-trigger"
                onClick={alternarSwap}
                aria-label={panelesIntercambiados ? 'Cambiar a Iniciar sesión' : 'Cambiar a Crear cuenta'}
            >
                <SwapArrowIcon />
                <span className="ceres-swap-tooltip">
                    {panelesIntercambiados ? 'Ir a Iniciar sesión' : 'Ir a Crear cuenta'}
                </span>
            </button>

            {/* PANEL DE FORMULARIO (Desplazable en dirección contraria) */}
            <main className="ceres-form-panel">
                <div className="ceres-form-shell">
                    <div className="ceres-form-container" key={vista}>
                        <div className="ceres-mobile-brand">
                            <div className="ceres-brand-mark" style={{ background: '#FFFFFF', padding: '4px' }}>
                                <LeafLogoIcon />
                            </div>
                            <div>
                                <span className="ceres-brand-name">CERES IA</span>
                                <span className="ceres-brand-tag">Agro-Inteligencia</span>
                            </div>
                        </div>

                        {(vista === 'login' || vista === 'register') && (
                            <div className="ceres-mode-switcher" role="tablist">
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={vista === 'login'}
                                    className={`ceres-mode-btn ${vista === 'login' ? 'active' : ''}`}
                                    onClick={() => cambiarVista('login')}
                                >
                                    Iniciar sesión
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={vista === 'register'}
                                    className={`ceres-mode-btn ${vista === 'register' ? 'active' : ''}`}
                                    onClick={() => cambiarVista('register')}
                                >
                                    Crear cuenta
                                </button>
                            </div>
                        )}

                        {/* VISTA 1: INICIO DE SESIÓN */}
                        {vista === 'login' && (
                            <>
                                <header className="ceres-form-header">
                                    <h2 className="ceres-form-title">Bienvenido de nuevo</h2>
                                    <p className="ceres-form-subtitle">Ingresa a tu cuenta para continuar</p>
                                </header>

                                {error && (
                                    <div className="ceres-banner error" role="alert">
                                        <AlertCircleIcon />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {info && (
                                    <div className="ceres-banner success" role="status">
                                        <CheckCircleIcon />
                                        <span>{info}</span>
                                    </div>
                                )}

                                <form onSubmit={handleLogin} noValidate>
                                    <div className="ceres-field-group">
                                        <label htmlFor="login-correo" className="ceres-label">
                                            Correo electrónico
                                        </label>
                                        <div className="ceres-input-wrapper">
                                            <span className="ceres-input-icon"><MailIcon /></span>
                                            <input
                                                id="login-correo"
                                                type="email"
                                                name="correo"
                                                className="ceres-input"
                                                placeholder="nombre@empresa.com"
                                                value={formData.correo}
                                                onChange={handleChange}
                                                autoComplete="email"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="ceres-field-group">
                                        <label htmlFor="login-password" className="ceres-label">
                                            Contraseña
                                        </label>
                                        <div className="ceres-input-wrapper">
                                            <span className="ceres-input-icon"><LockIcon /></span>
                                            <input
                                                id="login-password"
                                                type={mostrarPassword ? 'text' : 'password'}
                                                name="password"
                                                className="ceres-input has-toggle"
                                                placeholder="Ingresa tu contraseña"
                                                value={formData.password}
                                                onChange={handleChange}
                                                autoComplete="current-password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="ceres-eye-btn"
                                                onClick={() => setMostrarPassword((prev) => !prev)}
                                                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                {mostrarPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="ceres-form-options">
                                        <label className="ceres-checkbox-label">
                                            <input
                                                type="checkbox"
                                                className="ceres-checkbox"
                                                checked={recordarSesion}
                                                onChange={(e) => setRecordarSesion(e.target.checked)}
                                            />
                                            <span>Recordar sesión</span>
                                        </label>

                                        <button
                                            type="button"
                                            className="ceres-link-btn"
                                            onClick={() => cambiarVista('forgot')}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>

                                    <button type="submit" className="ceres-btn-primary" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="ceres-spinner" />
                                                <span>Verificando acceso...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Iniciar sesión</span>
                                                <ArrowRightIcon />
                                            </>
                                        )}
                                    </button>
                                    <div className="ceres-divider">
                                        <span>o continúa con</span>
                                    </div>

                                    <div
                                        className="ceres-google-wrapper"
                                        style={{
                                            width: '100%',
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {googleClientId ? (
                                            <div
                                                ref={googleBtnRef}
                                                className="ceres-google-slot"
                                                style={{ maxWidth: '100%', display: 'flex', justifyContent: 'center' }}
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                className="ceres-btn-google-fallback"
                                                onClick={() =>
                                                    setError('Configura VITE_GOOGLE_CLIENT_ID en frontend/.env y GOOGLE_CLIENT_ID en backend/.env para activar Google.')
                                                }
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                                                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                                                    <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                                                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                                                </svg>
                                                <span>Continuar con Google</span>
                                            </button>
                                        )}
                                    </div>
                                </form>

                                <div className="ceres-auth-switch">
                                    ¿Aún no tienes una cuenta en CERES IA?{' '}
                                    <button
                                        type="button"
                                        className="ceres-link-btn"
                                        onClick={() => cambiarVista('register')}
                                    >
                                        Crear una cuenta
                                    </button>
                                </div>
                            </>
                        )}

                        {/* VISTA 2: REGISTRO DE USUARIOS */}
                        {vista === 'register' && (
                            <>
                                <header className="ceres-form-header">
                                    <h2 className="ceres-form-title">Únete a CERES IA</h2>
                                    <p className="ceres-form-subtitle">
                                        Comienza a descubrir nuevas posibilidades para tus cultivos
                                    </p>
                                </header>

                                {error && (
                                    <div className="ceres-banner error" role="alert">
                                        <AlertCircleIcon />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleRegister} noValidate>
                                    <div className="ceres-field-group">
                                        <label htmlFor="reg-nombre" className="ceres-label">
                                            Nombre completo
                                        </label>
                                        <div className="ceres-input-wrapper">
                                            <span className="ceres-input-icon"><UserIcon /></span>
                                            <input
                                                id="reg-nombre"
                                                type="text"
                                                name="nombre"
                                                className="ceres-input"
                                                placeholder="Ej. Franklin Sánchez"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                autoComplete="name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="ceres-field-group">
                                        <label htmlFor="reg-correo" className="ceres-label">
                                            Correo electrónico
                                        </label>
                                        <div className="ceres-input-wrapper">
                                            <span className="ceres-input-icon"><MailIcon /></span>
                                            <input
                                                id="reg-correo"
                                                type="email"
                                                name="correo"
                                                className="ceres-input"
                                                placeholder="nombre@empresa.com"
                                                value={formData.correo}
                                                onChange={handleChange}
                                                autoComplete="email"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="ceres-field-row">
                                        <div>
                                            <label htmlFor="reg-rol" className="ceres-label">
                                                Perfil agrícola
                                            </label>
                                            <select
                                                id="reg-rol"
                                                name="rol"
                                                className="ceres-select"
                                                value={formData.rol}
                                                onChange={handleChange}
                                            >
                                                <option value="Agricultor">Agricultor</option>
                                                <option value="Agrónomo">Agrónomo / Técnico</option>
                                                <option value="Investigador">Investigador</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="reg-suelo" className="ceres-label">
                                                Suelo principal
                                            </label>
                                            <select
                                                id="reg-suelo"
                                                name="suelo_preferido"
                                                className="ceres-select"
                                                value={formData.suelo_preferido}
                                                onChange={handleChange}
                                            >
                                                <option value="Franco arcilloso">Franco arcilloso</option>
                                                <option value="Franco arenoso">Franco arenoso</option>
                                                <option value="Franco limoso">Franco limoso</option>
                                                <option value="Orgánico / Negro">Orgánico / Negro</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="ceres-field-group">
                                        <label htmlFor="reg-password" className="ceres-label">
                                            Contraseña
                                        </label>
                                        <div className="ceres-input-wrapper">
                                            <span className="ceres-input-icon"><LockIcon /></span>
                                            <input
                                                id="reg-password"
                                                type={mostrarPassword ? 'text' : 'password'}
                                                name="password"
                                                className="ceres-input has-toggle"
                                                placeholder="Crea una contraseña segura"
                                                value={formData.password}
                                                onChange={handleChange}
                                                autoComplete="new-password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="ceres-eye-btn"
                                                onClick={() => setMostrarPassword((prev) => !prev)}
                                                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                {mostrarPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </button>
                                        </div>

                                        {formData.password.length > 0 && (
                                            <div className="ceres-strength-wrapper">
                                                <div className="ceres-strength-bars">
                                                    {[1, 2, 3, 4].map((paso) => (
                                                        <div
                                                            key={paso}
                                                            className={`ceres-strength-bar ${
                                                                seguridadPassword.nivel >= paso
                                                                    ? `level-${seguridadPassword.nivel}`
                                                                    : ''
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="ceres-strength-meta">
                                                    <span>Seguridad: <strong>{seguridadPassword.etiqueta}</strong></span>
                                                    <span>{seguridadPassword.detalle}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="ceres-field-group">
                                        <label htmlFor="reg-confirm" className="ceres-label">
                                            <span>Confirmar contraseña</span>
                                            {passwordsCoinciden && (
                                                <span className="ceres-match-tag">
                                                    <CheckCircleIcon />
                                                    Coinciden
                                                </span>
                                            )}
                                        </label>
                                        <div className="ceres-input-wrapper">
                                            <span className="ceres-input-icon"><LockIcon /></span>
                                            <input
                                                id="reg-confirm"
                                                type={mostrarConfirmar ? 'text' : 'password'}
                                                name="confirmarPassword"
                                                className={`ceres-input has-toggle ${passwordsNoCoinciden ? 'is-invalid' : ''}`}
                                                placeholder="Repite tu contraseña"
                                                value={formData.confirmarPassword}
                                                onChange={handleChange}
                                                autoComplete="new-password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="ceres-eye-btn"
                                                onClick={() => setMostrarConfirmar((prev) => !prev)}
                                                aria-label={mostrarConfirmar ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                                            >
                                                {mostrarConfirmar ? <EyeOffIcon /> : <EyeIcon />}
                                            </button>
                                        </div>
                                        {passwordsNoCoinciden && (
                                            <div className="ceres-field-hint error">
                                                Las contraseñas ingresadas no coinciden.
                                            </div>
                                        )}
                                    </div>

                                    {/* BLOQUE COMPACTO DE CONSENTIMIENTO QUE ABRE VENTANA FLOTANTE */}
                                    <div
                                        style={{
                                            margin: '0.55rem 0 1.05rem',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.55rem'
                                        }}
                                    >
                                        <input
                                            id="reg-terminos"
                                            type="checkbox"
                                            className="ceres-checkbox"
                                            checked={aceptaTerminos}
                                            onChange={(e) => setAceptaTerminos(e.target.checked)}
                                            style={{ marginTop: '2px', flexShrink: 0, cursor: 'pointer' }}
                                            required
                                        />
                                        <div style={{ fontSize: '0.8rem', lineHeight: 1.45, color: '#3B4D3F' }}>
                                            <label htmlFor="reg-terminos" style={{ cursor: 'pointer' }}>
                                                Acepto los <strong>Términos y Condiciones</strong> y la Política de Datos.
                                            </label>{' '}
                                            <button
                                                type="button"
                                                onClick={() => setModalTerminosAbierto(true)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    padding: 0,
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    color: '#183D2B',
                                                    textDecoration: 'underline',
                                                    textUnderlineOffset: '3px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Ver más
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="ceres-btn-primary"
                                        disabled={loading || passwordsNoCoinciden || !aceptaTerminos}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="ceres-spinner" />
                                                <span>Creando cuenta...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Crear cuenta</span>
                                                <ArrowRightIcon />
                                            </>
                                        )}
                                    </button>
                                    <div className="ceres-divider">
                                        <span>o continúa con</span>
                                    </div>

                                    <div
                                        className="ceres-google-wrapper"
                                        style={{
                                            width: '100%',
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {googleClientId ? (
                                            <div
                                                ref={googleBtnRef}
                                                className="ceres-google-slot"
                                                style={{ maxWidth: '100%', display: 'flex', justifyContent: 'center' }}
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                className="ceres-btn-google-fallback"
                                                onClick={() =>
                                                    setError('Configura VITE_GOOGLE_CLIENT_ID en frontend/.env y GOOGLE_CLIENT_ID en backend/.env para activar Google.')
                                                }
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                                                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                                                    <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                                                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                                                </svg>
                                                <span>Continuar con Google</span>
                                            </button>
                                        )}
                                    </div>

                                    <p
                                        style={{
                                            marginTop: '0.85rem',
                                            textAlign: 'center',
                                            fontSize: '0.72rem',
                                            color: '#6C7D70',
                                            lineHeight: 1.4
                                        }}
                                    >
                                        Protegido bajo <strong>Ley 1581 de 2012</strong> (Habeas Data) · Colombia
                                    </p>
                                </form>

                                <div className="ceres-auth-switch">
                                    ¿Ya tienes una cuenta registrada?{' '}
                                    <button
                                        type="button"
                                        className="ceres-link-btn"
                                        onClick={() => cambiarVista('login')}
                                    >
                                        Iniciar sesión
                                    </button>
                                </div>
                            </>
                        )}

                        {/* VISTA 3: VERIFICACIÓN DE CORREO (OTP) */}
                        {vista === 'verify' && (
                            <>
                                <header className="ceres-form-header">
                                    <h2 className="ceres-form-title">Verifica tu correo</h2>
                                    <p className="ceres-form-subtitle">
                                        Ingresa el código de 6 dígitos enviado a <strong>{formData.correo}</strong>
                                    </p>
                                </header>

                                {error && (
                                    <div className="ceres-banner error" role="alert">
                                        <AlertCircleIcon />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {info && (
                                    <div className="ceres-banner success" role="status">
                                        <CheckCircleIcon />
                                        <span>{info}</span>
                                    </div>
                                )}

                                <form onSubmit={handleVerificarCodigo}>
                                    <div className="ceres-field-group">
                                        <label htmlFor="otp-code" className="ceres-label">
                                            Código de verificación
                                        </label>
                                        <input
                                            id="otp-code"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength="6"
                                            className="ceres-input ceres-input-otp"
                                            placeholder="000000"
                                            value={codigoOTP}
                                            onChange={(e) => setCodigoOTP(e.target.value.replace(/\D/g, ''))}
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="ceres-btn-primary" disabled={loading || codigoOTP.length < 6}>
                                        {loading ? (
                                            <>
                                                <span className="ceres-spinner" />
                                                <span>Confirmando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Confirmar código</span>
                                                <ArrowRightIcon />
                                            </>
                                        )}
                                    </button>

                                    <div className="ceres-otp-actions">
                                        <button
                                            type="button"
                                            className="ceres-link-btn"
                                            onClick={handleReenviarCodigo}
                                        >
                                            Reenviar código
                                        </button>
                                        <button
                                            type="button"
                                            className="ceres-link-btn"
                                            onClick={() => {
                                                setCodigoOTP('');
                                                cambiarVista('login');
                                            }}
                                        >
                                            Volver al inicio de sesión
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* VISTA 4: SOLICITAR RECUPERACIÓN DE CONTRASEÑA */}
                        {vista === 'forgot' && (
                            <>
                                <header className="ceres-form-header">
                                    <h2 className="ceres-form-title">Recuperar acceso</h2>
                                    <p className="ceres-form-subtitle">
                                        Ingresa el correo de tu cuenta y te enviaremos un código de seguridad para restablecer tu contraseña.
                                    </p>
                                </header>

                                {error && (
                                    <div className="ceres-banner error" role="alert">
                                        <AlertCircleIcon />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSolicitarRecuperacion}>
                                    <div className="ceres-field-group">
                                        <label htmlFor="forgot-correo" className="ceres-label">
                                            Correo electrónico registrado
                                        </label>
                                        <div className="ceres-input-wrapper">
                                            <span className="ceres-input-icon"><MailIcon /></span>
                                            <input
                                                id="forgot-correo"
                                                type="email"
                                                name="correo"
                                                className="ceres-input"
                                                placeholder="nombre@empresa.com"
                                                value={formData.correo}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="ceres-btn-primary" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="ceres-spinner" />
                                                <span>Enviando código...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Enviar código de recuperación</span>
                                                <ArrowRightIcon />
                                            </>
                                        )}
                                    </button>

                                    <div className="ceres-auth-switch">
                                        <button
                                            type="button"
                                            className="ceres-link-btn"
                                            onClick={() => cambiarVista('login')}
                                        >
                                            Volver al inicio de sesión
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* VISTA 5: RESTABLECER NUEVA CONTRASEÑA */}
                        {vista === 'reset' && (
                            <>
                                <header className="ceres-form-header">
                                    <h2 className="ceres-form-title">Nueva contraseña</h2>
                                    <p className="ceres-form-subtitle">
                                        Introduce el código enviado a <strong>{formData.correo}</strong> y define tu nueva clave.
                                    </p>
                                </header>

                                {error && (
                                    <div className="ceres-banner error" role="alert">
                                        <AlertCircleIcon />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {info && (
                                    <div className="ceres-banner success" role="status">
                                        <CheckCircleIcon />
                                        <span>{info}</span>
                                    </div>
                                )}

                                <form onSubmit={handleRestablecerPassword}>
                                    <div className="ceres-field-group">
                                        <label htmlFor="reset-otp" className="ceres-label">
                                            Código de recuperación (6 dígitos)
                                        </label>
                                        <input
                                            id="reset-otp"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength="6"
                                            className="ceres-input ceres-input-otp"
                                            placeholder="000000"
                                            value={codigoOTP}
                                            onChange={(e) => setCodigoOTP(e.target.value.replace(/\D/g, ''))}
                                            required
                                        />
                                    </div>

                                    <div className="ceres-field-group">
                                        <label htmlFor="reset-pass" className="ceres-label">
                                            Nueva contraseña
                                        </label>
                                        <div className="ceres-input-wrapper">
                                            <span className="ceres-input-icon"><LockIcon /></span>
                                            <input
                                                id="reset-pass"
                                                type={mostrarPassword ? 'text' : 'password'}
                                                name="password"
                                                className="ceres-input has-toggle"
                                                placeholder="Mínimo 6 caracteres"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="ceres-eye-btn"
                                                onClick={() => setMostrarPassword((prev) => !prev)}
                                                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                {mostrarPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="ceres-field-group">
                                        <label htmlFor="reset-confirm" className="ceres-label">
                                            <span>Confirmar nueva contraseña</span>
                                            {passwordsCoinciden && (
                                                <span className="ceres-match-tag">
                                                    <CheckCircleIcon />
                                                    Coinciden
                                                </span>
                                            )}
                                        </label>
                                        <div className="ceres-input-wrapper">
                                            <span className="ceres-input-icon"><LockIcon /></span>
                                            <input
                                                id="reset-confirm"
                                                type={mostrarConfirmar ? 'text' : 'password'}
                                                name="confirmarPassword"
                                                className={`ceres-input has-toggle ${passwordsNoCoinciden ? 'is-invalid' : ''}`}
                                                placeholder="Repite la nueva contraseña"
                                                value={formData.confirmarPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="ceres-eye-btn"
                                                onClick={() => setMostrarConfirmar((prev) => !prev)}
                                                aria-label={mostrarConfirmar ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                                            >
                                                {mostrarConfirmar ? <EyeOffIcon /> : <EyeIcon />}
                                            </button>
                                        </div>
                                        {passwordsNoCoinciden && (
                                            <div className="ceres-field-hint error">
                                                Las contraseñas ingresadas no coinciden.
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="ceres-btn-primary"
                                        disabled={loading || codigoOTP.length < 6 || passwordsNoCoinciden}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="ceres-spinner" />
                                                <span>Actualizando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Guardar nueva contraseña</span>
                                                <ArrowRightIcon />
                                            </>
                                        )}
                                    </button>

                                    <div className="ceres-auth-switch">
                                        <button
                                            type="button"
                                            className="ceres-link-btn"
                                            onClick={() => cambiarVista('login')}
                                        >
                                            Cancelar y volver al inicio
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* VENTANA FLOTANTE (MODAL) DE TÉRMINOS, CONDICIONES Y MARCO LEGAL */}
            {modalTerminosAbierto && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ceres-modal-legal-title"
                    onClick={() => setModalTerminosAbierto(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: 'rgba(15, 34, 24, 0.58)',
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '460px',
                            maxHeight: '86vh',
                            background: '#FFFFFF',
                            borderRadius: '20px',
                            boxShadow: '0 24px 60px rgba(10, 28, 19, 0.32)',
                            border: '1px solid #DDE7DF',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Cabecera del Modal */}
                        <div
                            style={{
                                padding: '1.25rem 1.4rem 1rem',
                                borderBottom: '1px solid #EBF1EC',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.75rem',
                                background: 'linear-gradient(180deg, #F5F9F6 0%, #FFFFFF 100%)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: '11px',
                                        background: '#E6F0E8',
                                        color: '#183D2B',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}
                                >
                                    <ShieldCheckIcon />
                                </div>
                                <div>
                                    <h3
                                        id="ceres-modal-legal-title"
                                        style={{
                                            margin: 0,
                                            fontSize: '1.05rem',
                                            fontWeight: 800,
                                            color: '#183D2B',
                                            letterSpacing: '-0.01em'
                                        }}
                                    >
                                        Términos y Condiciones
                                    </h3>
                                    <span style={{ fontSize: '0.74rem', color: '#5E7163' }}>
                                        Política de Datos y Marco Legal · CERES IA
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalTerminosAbierto(false)}
                                aria-label="Cerrar ventana"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: '1px solid #E0E8E2',
                                    background: '#F7FAF8',
                                    color: '#3B4D3F',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Cuerpo desplazable del Modal */}
                        <div
                            style={{
                                padding: '1.15rem 1.4rem',
                                overflowY: 'auto',
                                fontSize: '0.82rem',
                                lineHeight: 1.58,
                                color: '#334438'
                            }}
                        >
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontWeight: 700, color: '#183D2B', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                                    1. Datos que requerimos y finalidad
                                </div>
                                <p style={{ margin: 0 }}>
                                    Para brindarte diagnósticos fitosanitarios y recomendaciones de siembra, <strong>CERES IA</strong> solicita tu nombre completo, correo electrónico, perfil agrícola, tipo de suelo preferido, capturas fotográficas de plantas/semillas y ubicación GPS opcional. Estos datos se utilizan exclusivamente para operar tu cuenta, generar análisis con IA y acreditar tu autoría en el catálogo botánico.
                                </p>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontWeight: 700, color: '#183D2B', marginBottom: '0.45rem', fontSize: '0.85rem' }}>
                                    2. Marco Legal Vigente (Colombia)
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                    <div style={{ background: '#F4F8F5', padding: '0.55rem 0.75rem', borderRadius: '10px', borderLeft: '3px solid #183D2B' }}>
                                        <strong style={{ color: '#183D2B' }}>Ley 1581 de 2012 y Decreto 1377 de 2013 (Habeas Data):</strong>{' '}
                                        Protege tu derecho a conocer, actualizar, rectificar y solicitar la supresión de tus datos personales en cualquier momento.
                                    </div>
                                    <div style={{ background: '#F4F8F5', padding: '0.55rem 0.75rem', borderRadius: '10px', borderLeft: '3px solid #2D6A4F' }}>
                                        <strong style={{ color: '#183D2B' }}>Ley 527 de 1999 (Consentimiento Electrónico):</strong>{' '}
                                        Otorga plena validez jurídica y probatoria a la aceptación digital realizada mediante verificación OTP y esta ventana de consentimiento.
                                    </div>
                                    <div style={{ background: '#F4F8F5', padding: '0.55rem 0.75rem', borderRadius: '10px', borderLeft: '3px solid #40916C' }}>
                                        <strong style={{ color: '#183D2B' }}>Ley 1273 de 2009 y Ley 23 de 1982:</strong>{' '}
                                        Garantiza la seguridad criptográfica de tus credenciales y respeta los derechos de autor sobre las especies que escanees y aportes al catálogo.
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontWeight: 700, color: '#183D2B', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                                    3. Alcance del diagnóstico por IA
                                </div>
                                <p style={{ margin: 0, color: '#526557' }}>
                                    Los resultados emitidos por el motor de visión artificial tienen carácter orientativo de apoyo técnico y no sustituyen el dictamen presencial de un Ingeniero Agrónomo certificado.
                                </p>
                            </div>
                        </div>

                        {/* Botones inferiores estilo píldora (Cancelar / Aceptar) */}
                        <div
                            style={{
                                padding: '0.95rem 1.4rem 1.2rem',
                                borderTop: '1px solid #EBF1EC',
                                background: '#FAFDFB',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '0.65rem'
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setAceptaTerminos(false);
                                    setModalTerminosAbierto(false);
                                }}
                                style={{
                                    padding: '0.58rem 1.2rem',
                                    borderRadius: '999px',
                                    border: '1.5px solid #C8D6CB',
                                    background: '#FFFFFF',
                                    color: '#3B4D3F',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setAceptaTerminos(true);
                                    setError(null);
                                    setModalTerminosAbierto(false);
                                }}
                                style={{
                                    padding: '0.58rem 1.35rem',
                                    borderRadius: '999px',
                                    border: 'none',
                                    background: '#183D2B',
                                    color: '#FFFFFF',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 6px 16px rgba(24, 61, 43, 0.22)'
                                }}
                            >
                                Aceptar y continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthForm;