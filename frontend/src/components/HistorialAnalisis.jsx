import React, { useEffect, useState } from 'react';
import api from '../services/api';

const HistorialAnalisis = ({ usuario, recargar }) => {
    const [historial, setHistorial] = useState([]);

    const cargarHistorial = () => {
        if (!usuario?.id_usuario) return;

        api.get(`/analisis?id_usuario=${usuario.id_usuario}`)
            .then(res => setHistorial(res.data))
            .catch(err => console.error('Error al cargar historial:', err));
    };

    useEffect(() => {
        cargarHistorial();
    }, [usuario, recargar]);

    return (
        <div className="card shadow-sm mt-2 mb-5">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">📊 Mi Historial de Análisis Agroclimáticos</h5>
                <span className="badge bg-light text-primary">{historial.length} registros</span>
            </div>
            <div className="card-body p-0">
                {historial.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <p className="mb-0">Aún no tienes análisis registrados en tu cuenta.</p>
                        <small>Ve a "Analizar por Imagen" para realizar tu primer escaneo.</small>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover table-striped mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>#</th>
                                    <th>Planta</th>
                                    <th>Ubicación</th>
                                    <th>Diagnóstico IA</th>
                                    <th>Suelo</th>
                                    <th>Temp (°C)</th>
                                    <th>Humedad (%)</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td className="fw-bold">{item.planta}</td>
                                        <td>{item.ubicacion}</td>
                                        <td style={{ maxWidth: '300px', fontSize: '0.9rem' }}>
                                            {item.diagnostico}
                                        </td>
                                        <td>{item.tipo_suelo}</td>
                                        <td>{item.temperatura}°C</td>
                                        <td>{item.humedad}%</td>
                                        <td>
                                            <span className={`badge bg-${item.es_apto ? 'success' : 'danger'}`}>
                                                {item.es_apto ? 'Apto' : 'No Apto'}
                                            </span>
                                        </td>
                                        <td>{new Date(item.fecha).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialAnalisis;