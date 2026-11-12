import React, { useState, useEffect } from 'react';
import api from '../services/api';

const FormularioAnalisis = ({ onAnalisisCreado }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);

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
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                setFormData(prev => ({
                    ...prev,
                    imagen_base64: base64String,
                    mime_type: file.type
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje(null);

        try {
            const payload = {
                ...formData,
                latitud: coordenadas.latitud,
                longitud: coordenadas.longitud
            };

            const response = await api.post('/analisis', payload);
            setMensaje({ 
                tipo: 'success', 
                texto: `${response.data.mensaje} — Ubicación: ${response.data.clima?.ubicacion}.` 
            });
            setLoading(false);
            if (onAnalisisCreado) onAnalisisCreado();
        } catch (err) {
            console.error('Error al procesar análisis:', err);
            setMensaje({ tipo: 'danger', texto: err.response?.data?.error || 'Error al analizar la imagen.' });
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
                        {loading ? '🤖 Identificando especie y evaluando clima con Gemini IA...' : '🚀 Identificar y Analizar Ahora'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FormularioAnalisis;