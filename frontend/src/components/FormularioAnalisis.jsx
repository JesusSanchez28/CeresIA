import React, { useState, useEffect } from 'react';
import api from '../services/api';

const FormularioAnalisis = ({ usuario, onAnalisisCreado }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [resultado, setResultado] = useState(null);

    const [coordenadas, setCoordenadas] = useState({ latitud: null, longitud: null });
    const [climaActual, setClimaActual] = useState({
        cargando: true,
        error: null,
        temperatura: null,
        humedad: null,
        ubicacionTexto: 'Detectando ubicación del dispositivo...'
    });

    const [formData, setFormData] = useState({
        id_usuario: 1,
        imagen_base64: '',
        mime_type: 'image/jpeg',
        tipo_suelo: 'Franco arcilloso'
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setClimaActual({
                cargando: false,
                error: 'Tu navegador no soporta geolocalización.',
                temperatura: null,
                humedad: null,
                ubicacionTexto: 'No disponible'
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoordenadas({ latitud: latitude, longitud: longitude });

                try {
                    const res = await api.get(`/analisis/clima?lat=${latitude}&lon=${longitude}`);

                    setClimaActual({
                        cargando: false,
                        error: null,
                        temperatura: res.data.temperatura,
                        humedad: res.data.humedad,
                        ubicacionTexto: `${res.data.ubicacion} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
                    });
                } catch (err) {
                    console.error('Error al consultar clima desde backend:', err);
                    setClimaActual({
                        cargando: false,
                        error: 'No se pudo conectar con el servidor para obtener el clima.',
                        temperatura: null,
                        humedad: null,
                        ubicacionTexto: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`
                    });
                }
            },
            () => {
                setClimaActual({
                    cargando: false,
                    error: 'Activa el permiso de ubicación en tu navegador.',
                    temperatura: null,
                    humedad: null,
                    ubicacionTexto: 'Permiso denegado'
                });
            },
            { enableHighAccuracy: true }
        );
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreviewUrl(URL.createObjectURL(file));
        setMensaje(null);
        setResultado(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const maxWidth = 800;
                const scaleSize = img.width > maxWidth ? maxWidth / img.width : 1;
                const canvas = document.createElement('canvas');
                canvas.width = img.width * scaleSize;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
                setFormData(prev => ({
                    ...prev,
                    imagen_base64: compressedDataUrl.split(',')[1],
                    mime_type: 'image/jpeg'
                }));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.imagen_base64) {
            setMensaje({ tipo: 'danger', texto: 'Por favor espera un segundo a que cargue la imagen o selecciona otra.' });
            return;
        }

        setLoading(true);
        setMensaje(null);
        setResultado(null);

        try {
            const payload = {
                ...formData,
                id_usuario: usuario.id_usuario,
                latitud: coordenadas.latitud,
                longitud: coordenadas.longitud
            };

            const response = await api.post('/analisis', payload);

            if (response.data.es_planta === false) {
                setMensaje({
                    tipo: 'warning',
                    texto: `${response.data.mensaje} ${response.data.diagnostico}`
                });
            } else {
                setResultado(response.data);
                if (onAnalisisCreado) onAnalisisCreado();
            }
        } catch (err) {
            console.error('Error al procesar análisis:', err);
            setMensaje({ tipo: 'danger', texto: err.response?.data?.error || 'Error al analizar la imagen.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
                <h4 className="mb-0">📸 Escaneo y Análisis Agroclimático (CeresIA)</h4>
            </div>
            <div className="card-body">
                <div className="alert alert-info d-flex justify-content-between align-items-center flex-wrap">
                    <div>
                        <strong>📍 Sensor GPS del Dispositivo:</strong> {climaActual.ubicacionTexto}
                        {climaActual.error && <div className="text-danger small mt-1">{climaActual.error}</div>}
                    </div>
                    {!climaActual.cargando && climaActual.temperatura !== null && (
                        <div className="mt-2 mt-md-0">
                            <span className="badge bg-primary fs-6 me-2">
                                🌡️ Temp: {climaActual.temperatura}°C
                            </span>
                            <span className="badge bg-info text-dark fs-6">
                                💧 Humedad: {climaActual.humedad}%
                            </span>
                        </div>
                    )}
                </div>

                {mensaje && <div className={`alert alert-${mensaje.tipo}`}>{mensaje.texto}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Sube o toma una foto de la Planta o Semilla</label>
                        <input 
                            type="file" 
                            className="form-control form-control-lg" 
                            accept="image/*" 
                            capture="environment"
                            onChange={handleImageChange} 
                            required
                        />
                    </div>

                    {previewUrl && (
                        <div className="text-center mb-3">
                            <img 
                                src={previewUrl} 
                                alt="Vista previa del cultivo" 
                                className="img-thumbnail" 
                                style={{ maxHeight: '220px' }} 
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-success w-100 btn-lg mt-2" disabled={loading}>
                        {loading ? '🤖 Identificando especie, estado y cuidados...' : '🚀 Identificar y Analizar Ahora'}
                    </button>
                </form>

                {/* TARJETA DE RESULTADO Y CUIDADOS EN PANTALLA */}
                {resultado && (
                    <div className={`card mt-4 border-2 ${resultado.clima?.es_apto ? 'border-success' : 'border-warning'} shadow-sm`}>
                        <div className={`card-header text-white d-flex justify-content-between align-items-center flex-wrap ${resultado.clima?.es_apto ? 'bg-success' : 'bg-warning text-dark'}`}>
                            <div>
                                <h5 className="mb-0 fw-bold">🌿 {resultado.planta}</h5>
                                {resultado.nombre_cientifico && (
                                    <small className="fst-italic">{resultado.nombre_cientifico}</small>
                                )}
                            </div>
                            <span className={`badge fs-6 ${resultado.clima?.es_apto ? 'bg-light text-success' : 'bg-dark text-warning'}`}>
                                {resultado.clima?.es_apto ? '✅ Clima Apto' : '⚠️ Clima No Ideal'}
                            </span>
                        </div>

                        <div className="card-body">
                            <div className="mb-2 d-flex flex-wrap gap-2">
                                {resultado.tipo && (
                                    <span className="badge bg-secondary">Categoría: {resultado.tipo}</span>
                                )}
                                {resultado.clima?.ubicacion && (
                                    <span className="badge bg-info text-dark">
                                        📍 {resultado.clima.ubicacion} ({resultado.clima.temperatura}°C | {resultado.clima.humedad}%)
                                    </span>
                                )}
                            </div>

                            {resultado.descripcion && (
                                <p className="text-muted small mb-3">{resultado.descripcion}</p>
                            )}

                            <div className="p-3 bg-light rounded border">
                                <h6 className="fw-bold text-success mb-2">🩺 Estado Fitosanitario y Guía de Cuidados:</h6>
                                <p className="mb-0" style={{ lineHeight: '1.6' }}>
                                    {resultado.diagnostico}
                                </p>
                            </div>

                            <div className="text-end mt-2">
                                <small className="text-success fw-semibold">✔ Guardado automáticamente en Mi Historial</small>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormularioAnalisis;