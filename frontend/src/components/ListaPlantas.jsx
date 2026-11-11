import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ListaPlantas = () => {
    const [plantas, setPlantas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Llamada a la API del backend usando nuestro servicio configurado
        api.get('/plantas')
            .then(response => {
                setPlantas(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error al obtener las plantas:', err);
                setError('No se pudo conectar con el servidor backend.');
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center mt-5">Cargando catálogo de plantas...</div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-success">🌱 Catálogo de Plantas - CeresIA</h2>
            <div className="row">
                {plantas.map(planta => (
                    <div className="col-md-4 mb-3" key={planta.id}>
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title text-primary">{planta.nombreComun}</h5>
                                <h6 className="card-subtitle mb-2 text-muted fst-italic">{planta.nombreCientifico}</h6>
                                <span className="badge bg-secondary mb-2">{planta.tipo}</span>
                                <p className="card-text">{planta.descripcion}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListaPlantas;