import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CompatibilidadZona = ({ onVolver }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [datos, setDatos] = useState(null);

    const consultarCompatibilidad = useCallback(() => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Tu dispositivo no soporta geolocalización.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await api.get(`/analisis/compatibilidad?lat=${latitude}&lon=${longitude}`);
                    setDatos(res.data);
                } catch (err) {
                    setError(err.response?.data?.error || 'Error al analizar la compatibilidad de tu zona.');
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setError('Debes permitir el acceso a tu ubicación GPS para evaluar la compatibilidad de tu terreno.');
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    useEffect(() => {
        consultarCompatibilidad();
    }, [consultarCompatibilidad]);

    return (
        <div>
            <button onClick={onVolver} className="btn btn-outline-secondary mb-3">
                ← Volver al Menú Principal
            </button>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">🌱 Compatibilidad Agroclimática de tu Zona</h4>
                </div>
                <div className="card-body">
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success mb-3" role="status"></div>
                            <p className="fw-bold text-muted">Analizando piso térmico, humedad y cultivos ideales...</p>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <span>{error}</span>
                            <button onClick={consultarCompatibilidad} className="btn btn-sm btn-danger">
                                🔄 Reintentar
                            </button>
                        </div>
                    )}

                    {datos && (
                        <>
                            <div className="alert alert-info d-flex justify-content-between align-items-center flex-wrap">
                                <div>
                                    <strong>📍 Zona detectada:</strong> {datos.clima?.ubicacion}
                                    <p className="mb-0 small mt-1">{datos.resumen_climatico}</p>
                                </div>
                                <div className="mt-2 mt-md-0">
                                    <span className="badge bg-primary fs-6 me-2">🌡️ {datos.clima?.temperatura}°C</span>
                                    <span className="badge bg-info text-dark fs-6">💧 {datos.clima?.humedad}%</span>
                                </div>
                            </div>

                            <h5 className="mt-4 mb-3 fw-bold text-success">Cultivos Recomendados para Siembra:</h5>
                            <div className="row g-3">
                                {datos.cultivos_recomendados?.map((cultivo, index) => (
                                    <div className="col-md-6" key={index}>
                                        <div className="card h-100 border-success shadow-sm">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <h5 className="card-title text-success fw-bold mb-0">{cultivo.nombre_comun}</h5>
                                                    <span className="badge bg-success">{cultivo.compatibilidad}</span>
                                                </div>
                                                <small className="text-muted fst-italic">{cultivo.nombre_cientifico}</small>
                                                <hr />
                                                <p className="mb-1 small"><strong>🌍 Suelo ideal:</strong> {cultivo.suelo_ideal}</p>
                                                <p className="mb-0 small"><strong>💡 Consejo:</strong> {cultivo.consejo_siembra}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompatibilidadZona;