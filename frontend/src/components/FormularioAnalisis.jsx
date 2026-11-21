import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const CameraIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);

const ImageFolderIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
);

const UploadCloudIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
        <path d="M12 12v9" />
        <path d="m16 16-4-4-4 4" />
    </svg>
);

const SparklesScanIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const CopyIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
);

const FilePdfIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
);

const CheckIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const LeafOutlineIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
);

const convertirArchivoABase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            const base64Puro = dataUrl.split(',')[1];
            resolve({ base64: base64Puro, mimeType: file.type || 'image/jpeg' });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

function FormularioAnalisis({ usuario }) {
    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState(null);
    const [tipoSuelo, setTipoSuelo] = useState(usuario?.suelo_preferido || 'Franco arcilloso');
    const [usarGps, setUsarGps] = useState(true);
    const [coords, setCoords] = useState({ lat: null, lon: null });
    const [dragging, setDragging] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [resultado, setResultado] = useState(null);
    const [copiado, setCopiado] = useState(false);

    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    useEffect(() => {
        if (usuario?.suelo_preferido) {
            setTipoSuelo(usuario.suelo_preferido);
        }
    }, [usuario?.suelo_preferido]);

    useEffect(() => {
        if (usarGps && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                () => setCoords({ lat: null, lon: null })
            );
        }
    }, [usarGps]);

    const procesarArchivo = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Selecciona un archivo de imagen válido (JPG, PNG o WEBP).');
            return;
        }
        setError(null);
        setResultado(null);
        setImagen(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        procesarArchivo(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imagen) {
            setError('Selecciona o captura una imagen antes de ejecutar el diagnóstico.');
            return;
        }

        setCargando(true);
        setError(null);

        try {
            const { base64, mimeType } = await convertirArchivoABase64(imagen);

            const payload = {
                id_usuario: usuario.id_usuario,
                imagen_base64: base64,
                mime_type: mimeType,
                tipo_suelo: tipoSuelo,
                latitud: usarGps && coords.lat ? coords.lat : 4.8143,
                longitud: usarGps && coords.lon ? coords.lon : -74.3547
            };

            const res = await api.post('/analisis', payload);

            if (res.data?.es_planta === false) {
                setError(
                    `${res.data.mensaje || 'No se detectó material vegetal.'} ${res.data.diagnostico || ''}`
                );
                setResultado(null);
                return;
            }

            setResultado(res.data);
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    'No se pudo completar el diagnóstico con el motor de visión IA.'
            );
        } finally {
            setCargando(false);
        }
    };

    const esApto = resultado?.clima?.es_apto ?? true;

    const copiarInforme = () => {
        if (!resultado) return;
        const texto = [
            `INFORME BOTÁNICO CERES IA`,
            `Especie: ${resultado.planta || 'Identificada'}`,
            `Nombre científico: ${resultado.nombre_cientifico || 'N/A'}`,
            `Categoría: ${resultado.tipo || 'Planta'}`,
            `Ubicación y clima: ${resultado.clima?.ubicacion || 'Zona evaluada'} (${resultado.clima?.temperatura ?? '--'}°C / ${resultado.clima?.humedad ?? '--'}% HR)`,
            `Suelo evaluado: ${tipoSuelo}`,
            `Diagnóstico y protocolo: ${resultado.diagnostico || ''}`
        ].join('\n');

        navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2200);
    };

    const descargarInforme = () => {
        if (!resultado) return;
        const ventana = window.open('', '_blank', 'width=820,height=900');
        if (!ventana) return;

        const fechaHoy = new Date().toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        ventana.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <title>Informe Fitotécnico — CERES IA</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; color: #252B27; margin: 40px; line-height: 1.55; }
                    .header { border-bottom: 3px solid #163D2B; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
                    .brand { color: #163D2B; font-size: 22px; font-weight: 800; letter-spacing: 1px; margin: 0; }
                    .sub { color: #39764B; font-size: 12px; font-weight: 600; text-transform: uppercase; }
                    .meta { font-size: 12px; color: #5C6660; text-align: right; }
                    .title { font-size: 20px; color: #163D2B; margin: 0 0 4px 0; }
                    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; background: #E5EDE2; color: #163D2B; margin-top: 8px; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
                    .box { background: #F8F8F3; border: 1px solid #DCE3D9; border-radius: 8px; padding: 12px; }
                    .box label { display: block; font-size: 11px; color: #5C6660; text-transform: uppercase; font-weight: 700; }
                    .section { margin-top: 18px; border-left: 3px solid #163D2B; padding-left: 14px; }
                    .section h3 { font-size: 14px; color: #163D2B; margin: 0 0 6px 0; }
                    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #DCE3D9; font-size: 11px; color: #5C6660; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <p class="brand">CERES IA</p>
                        <span class="sub">Diagnóstico Botánico y Telemetría Agrícola</span>
                    </div>
                    <div class="meta">
                        <div>Fecha: ${fechaHoy}</div>
                        <div>Productor: ${usuario?.nombre || 'Usuario'}</div>
                    </div>
                </div>
                <h1 class="title">${resultado.planta || 'Especie Identificada'}</h1>
                <div><em>${resultado.nombre_cientifico || ''}</em> · ${resultado.tipo || 'Especie vegetal'}</div>
                <span class="badge">${esApto ? 'Viable en la zona evaluada' : 'Requiere manejo técnico'}</span>
                <div class="grid">
                    <div class="box"><label>Ubicación y Clima</label><strong>${resultado.clima?.ubicacion || 'Zona evaluada'} (${resultado.clima?.temperatura ?? '--'}°C / ${resultado.clima?.humedad ?? '--'}% HR)</strong></div>
                    <div class="box"><label>Sustrato Evaluado</label><strong>${tipoSuelo}</strong></div>
                </div>
                ${resultado.descripcion ? `<div class="section"><h3>Descripción Botánica</h3><p>${resultado.descripcion}</p></div>` : ''}
                <div class="section" style="border-left-color: #C6A66A;">
                    <h3>Diagnóstico Fitosanitario y Protocolo</h3>
                    <p>${(resultado.diagnostico || '').replace(/\n/g, '<br/>')}</p>
                </div>
                <div class="footer">Documento generado automáticamente por CERES IA · Inteligencia Artificial aplicada a la agricultura.</div>
            </body>
            </html>
        `);
        ventana.document.close();
        ventana.focus();
        ventana.print();
    };

    return (
        <div>
            <div className="ceres-section-header">
                <div>
                    <h1 className="ceres-section-title">Escáner Fitosanitario por Visión IA</h1>
                    <p className="ceres-section-subtitle">
                        <span className="ceres-only-desktop">
                            Sube una fotografía foliar desde tu equipo para identificar la especie, detectar posibles patologías y evaluar su viabilidad.
                        </span>
                        <span className="ceres-only-mobile">
                            Captura una fotografía directa con tu cámara o sube una imagen de tu galería para evaluar el cultivo.
                        </span>
                    </p>
                </div>
            </div>

            {error && <div className="ceres-alert-banner">{error}</div>}

            <div className="ceres-split-workspace">
                {/* PANEL IZQUIERDO: CARGA / CAPTURA */}
                <form className="ceres-surface-card" onSubmit={handleSubmit}>
                    {/* Input dedicado a cámara trasera en móvil */}
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        hidden
                        onChange={(e) => procesarArchivo(e.target.files?.[0])}
                    />

                    {/* Input dedicado a galería móvil / explorador de archivos web */}
                    <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => procesarArchivo(e.target.files?.[0])}
                    />

                    <div
                        className={`ceres-dropzone ${dragging ? 'dragging' : ''} ${preview ? 'has-image' : ''}`}
                        onClick={() => !cargando && galleryInputRef.current?.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                    >
                        {preview ? (
                            <>
                                {cargando && <div className="ceres-scan-beam" />}
                                <img src={preview} alt="Muestra botánica" className="ceres-preview-img" />
                                <div className="ceres-preview-overlay">
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                        {imagen?.name || 'Captura de muestra'}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '0.75rem',
                                            background: 'rgba(255,255,255,0.2)',
                                            padding: '4px 10px',
                                            borderRadius: '999px'
                                        }}
                                    >
                                        Reemplazar
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="ceres-dropzone-icon">
                                    <UploadCloudIcon />
                                </div>
                                <strong
                                    style={{
                                        fontFamily: 'Manrope, sans-serif',
                                        fontSize: '1rem',
                                        color: 'var(--ceres-forest)'
                                    }}
                                >
                                    <span className="ceres-only-desktop">
                                        Arrastra una imagen aquí o haz clic para seleccionarla
                                    </span>
                                    <span className="ceres-only-mobile">
                                        Toma una foto en campo o sube una imagen
                                    </span>
                                </strong>
                                <span
                                    style={{
                                        fontSize: '0.82rem',
                                        color: 'var(--ceres-muted)',
                                        marginTop: '0.35rem',
                                        maxWidth: '320px'
                                    }}
                                >
                                    <span className="ceres-only-desktop">
                                        Selecciona una fotografía foliar desde tu equipo (JPG, PNG o WEBP).
                                    </span>
                                    <span className="ceres-only-mobile">
                                        Optimizado para captura móvil directa y archivos JPG, PNG o WEBP.
                                    </span>
                                </span>
                            </>
                        )}
                    </div>

                    {/* BOTONES RÁPIDOS DE CÁMARA Y GALERÍA (SOLO EN MÓVIL <= 768px) */}
                    <div className="ceres-mobile-capture-grid">
                        <button
                            type="button"
                            className="ceres-btn-outline"
                            disabled={cargando}
                            onClick={() => cameraInputRef.current?.click()}
                        >
                            <CameraIcon />
                            <span>Cámara</span>
                        </button>

                        <button
                            type="button"
                            className="ceres-btn-outline"
                            disabled={cargando}
                            onClick={() => galleryInputRef.current?.click()}
                        >
                            <ImageFolderIcon />
                            <span>Galería</span>
                        </button>
                    </div>

                    <div className="ceres-form-row-2">
                        <div>
                            <label className="ceres-field-label">Tipo de suelo de la parcela</label>
                            <select
                                className="ceres-select-box"
                                value={tipoSuelo}
                                onChange={(e) => setTipoSuelo(e.target.value)}
                            >
                                <option value="Franco arcilloso">Franco arcilloso</option>
                                <option value="Franco arenoso">Franco arenoso</option>
                                <option value="Franco limoso">Franco limoso</option>
                                <option value="Orgánico / Negro">Orgánico / Negro</option>
                            </select>
                        </div>

                        <div>
                            <label className="ceres-field-label">Telemetría climática GPS</label>
                            <select
                                className="ceres-select-box"
                                value={usarGps ? 'si' : 'no'}
                                onChange={(e) => setUsarGps(e.target.value === 'si')}
                            >
                                <option value="si">
                                    {coords.lat ? 'GPS Activo (Coordenadas listas)' : 'Activar ubicación automática'}
                                </option>
                                <option value="no">Evaluar con coordenadas base</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                        <button
                            type="submit"
                            className="ceres-btn-forest"
                            style={{ flex: 1 }}
                            disabled={cargando || !imagen}
                        >
                            <SparklesScanIcon />
                            <span>{cargando ? 'Analizando tejido vegetal...' : 'Ejecutar Diagnóstico IA'}</span>
                        </button>

                        {preview && (
                            <button
                                type="button"
                                className="ceres-btn-outline"
                                disabled={cargando}
                                onClick={() => {
                                    setImagen(null);
                                    setPreview(null);
                                    setResultado(null);
                                    setError(null);
                                }}
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </form>

                {/* PANEL DERECHO: RESULTADO CLÍNICO ESTRUCTURADO */}
                {resultado ? (
                    <section className="ceres-surface-card">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div>
                                <span
                                    style={{
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        color: 'var(--ceres-natural)'
                                    }}
                                >
                                    {resultado.tipo || 'Informe Técnico Generado'}
                                </span>
                                <h2
                                    style={{
                                        fontFamily: 'Manrope, sans-serif',
                                        fontSize: '1.45rem',
                                        fontWeight: 800,
                                        color: 'var(--ceres-forest)',
                                        margin: '0.2rem 0'
                                    }}
                                >
                                    {resultado.planta || 'Especie Identificada'}
                                </h2>
                                {resultado.nombre_cientifico && (
                                    <em style={{ fontSize: '0.88rem', color: 'var(--ceres-muted)' }}>
                                        {resultado.nombre_cientifico}
                                    </em>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span className={`ceres-status-pill ${esApto ? 'apto' : 'alerta'}`}>
                                    {esApto ? 'Viable en esta zona' : 'Requiere manejo técnico'}
                                </span>

                                <button
                                    type="button"
                                    className="ceres-btn-outline"
                                    style={{ height: '38px', padding: '0 0.75rem', fontSize: '0.78rem' }}
                                    onClick={copiarInforme}
                                >
                                    {copiado ? <CheckIcon /> : <CopyIcon />}
                                    <span>{copiado ? 'Copiado' : 'Copiar'}</span>
                                </button>

                                <button
                                    type="button"
                                    className="ceres-btn-outline"
                                    style={{ height: '38px', padding: '0 0.75rem', fontSize: '0.78rem' }}
                                    onClick={descargarInforme}
                                >
                                    <FilePdfIcon />
                                    <span>PDF</span>
                                </button>
                            </div>
                        </div>

                        <div className="ceres-report-grid">
                            <div className="ceres-report-metric">
                                <span className="ceres-kpi-label">Microclima Capturado</span>
                                <strong style={{ fontSize: '0.92rem', color: 'var(--ceres-charcoal)' }}>
                                    {resultado.clima?.ubicacion || 'Zona evaluada'} ·{' '}
                                    {resultado.clima?.temperatura !== undefined
                                        ? `${Math.round(resultado.clima.temperatura)}°C`
                                        : ''}{' '}
                                    {resultado.clima?.humedad !== undefined
                                        ? `/ ${Math.round(resultado.clima.humedad)}% HR`
                                        : ''}
                                </strong>
                            </div>

                            <div className="ceres-report-metric">
                                <span className="ceres-kpi-label">Sustrato Evaluado</span>
                                <strong style={{ fontSize: '0.92rem', color: 'var(--ceres-charcoal)' }}>
                                    {tipoSuelo}
                                </strong>
                            </div>
                        </div>

                        {resultado.descripcion && (
                            <div className="ceres-report-block">
                                <h4>Descripción Botánica de la Especie</h4>
                                <p>{resultado.descripcion}</p>
                            </div>
                        )}

                        {resultado.diagnostico && (
                            <div className="ceres-report-block" style={{ borderLeftColor: 'var(--ceres-gold)' }}>
                                <h4>Diagnóstico Fitosanitario y Recomendaciones</h4>
                                <p>{resultado.diagnostico}</p>
                            </div>
                        )}
                    </section>
                ) : (
                    <div className="ceres-report-empty">
                        <div
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: 'var(--ceres-light)',
                                color: 'var(--ceres-forest)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}
                        >
                            <LeafOutlineIcon />
                        </div>
                        <h3
                            style={{
                                fontFamily: 'Manrope, sans-serif',
                                fontSize: '1.1rem',
                                fontWeight: 800,
                                color: 'var(--ceres-charcoal)',
                                margin: '0 0 0.45rem 0'
                            }}
                        >
                            Esperando muestra botánica
                        </h3>
                        <p
                            style={{
                                fontSize: '0.86rem',
                                color: 'var(--ceres-muted)',
                                maxWidth: '360px',
                                margin: '0 auto',
                                lineHeight: 1.55
                            }}
                        >
                            <span className="ceres-only-desktop">
                                Selecciona una fotografía foliar desde tu equipo para obtener la identificación taxonómica, estado sanitario y plan de manejo.
                            </span>
                            <span className="ceres-only-mobile">
                                Usa <strong>Cámara</strong> en campo o selecciona una imagen de tu <strong>Galería</strong> para obtener el diagnóstico completo.
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FormularioAnalisis;