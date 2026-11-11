import React, { useState, useEffect } from 'react';
import api from '../services/api';

const FormularioAnalisis = ({ onAnalisisCreado }) => {
    const [plantas, setPlantas] = useState([]);
    const [formData, setFormData] = useState({
        id_usuario: 1, // Usuario de prueba (Carlos Pérez)
        id_planta_semilla: '',
        imagen_url: 'https://via.placeholder.com/150',
        resultado_diagnostico: 'Hojas sanas con óptimo nivel de clorofila.',
        tipo_suelo: 'Franco arcilloso',
        temperatura: '',
        humedad: '',
        es_apto: true
    });

    const [mensaje, setMensaje] = useState(null);

    // Cargar la lista de plantas para el selector dropdown
    useEffect(() => {
        api.get('/plantas')
            .then(res => {
                setPlantas(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, id_planta_semilla: res.data[0].id }));
                }
            })
            .catch(err => console.error('Error al cargar plantas para el formulario:', err));
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Enviar datos al Stored Procedure mediante el backend
        api.post('/analisis', formData)
            .then(res => {
                setMensaje({ tipo: 'success', texto: res.data.mensaje || '¡Análisis registrado exitosamente!' });
                if (onAnalisisCreado) onAnalisisCreado();
            })
            .catch(err => {
                console.error('Error al guardar análisis:', err);
                setMensaje({ tipo: 'danger', texto: 'Error al conectar con el servidor para registrar el análisis.' });
            });
    };

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
                <h4 className="mb-0">🧪 Nuevo Análisis Agroclimático (CeresIA)</h4>
            </div>
            <div className="card-body">
                {mensaje && <div className={`alert alert-${mensaje.tipo}`}>{mensaje.texto}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-weight-bold">Seleccionar Planta/Semilla</label>
                            <select 
                                className="form-select" 
                                name="id_planta_semilla" 
                                value={formData.id_planta_semilla} 
                                onChange={handleChange}
                                required
                            >
                                {plantas.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombreComun} ({p.nombreCientifico})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label font-weight-bold">Tipo de Suelo</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                name="tipo_suelo" 
                                value={formData.tipo_suelo} 
                                onChange={handleChange} 
                                placeholder="Ej. Franco arcilloso, Arenoso..."
                                required 
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label font-weight-bold">Temperatura (°C)</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                className="form-control" 
                                name="temperatura" 
                                value={formData.temperatura} 
                                onChange={handleChange} 
                                placeholder="Ej. 18.5"
                                required 
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label font-weight-bold">Humedad (%)</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                className="form-control" 
                                name="humedad" 
                                value={formData.humedad} 
                                onChange={handleChange} 
                                placeholder="Ej. 75.0"
                                required 
                            />
                        </div>
                    </div>

                    <div className="mb-3 form-check">
                        <input 
                            type="checkbox" 
                            className="form-check-input" 
                            id="es_apto" 
                            name="es_apto" 
                            checked={formData.es_apto} 
                            onChange={handleChange} 
                        />
                        <label className="form-check-label" htmlFor="es_apto">
                            ¿Condiciones óptimas/aptas para la siembra?
                        </label>
                    </div>

                    <button type="submit" className="btn btn-success w-100">
                        Guardar Análisis Completo
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FormularioAnalisis;