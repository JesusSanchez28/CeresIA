import React, { useState, useEffect } from 'react';
import api from '../services/api';

const FormularioAnalisis = ({ onAnalisisCreado }) => {
    const [plantas, setPlantas] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    const [formData, setFormData] = useState({
        id_usuario: 1, // Usuario de prueba (Carlos Pérez)
        id_planta_semilla: '',
        imagen_base64: '',
        mime_type: 'image/jpeg',
        tipo_suelo: 'Franco arcilloso',
        temperatura: '',
        humedad: '',
        es_apto: true
    });

    // Cargar catálogo de plantas para el selector
    useEffect(() => {
        api.get('/plantas')
            .then(res => {
                setPlantas(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, id_planta_semilla: res.data[0].id }));
                }
            })
            .catch(err => console.error('Error al cargar catálogo:', err));
    }, []);

    // Manejar subida de archivo y conversión a Base64
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));

            const reader = new FileReader();
            reader.onloadend = () => {
                // Extraer únicamente el string Base64 quitando el prefijo data:image/...;base64,
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje(null);

        try {
            const response = await api.post('/analisis', formData);
            setMensaje({ tipo: 'success', texto: response.data.mensaje || '¡Análisis guardado con éxito!' });
            setLoading(false);
            if (onAnalisisCreado) onAnalisisCreado();
        } catch (err) {
            console.error('Error al registrar análisis:', err);
            setMensaje({ tipo: 'danger', texto: 'Error al enviar el análisis al servidor.' });
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
                <h4 className="mb-0">🧪 Nuevo Análisis Agroclimático con Gemini IA</h4>
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
                            <label className="form-label font-weight-bold">Fotografía de la Planta/Semilla</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                required
                            />
                        </div>
                    </div>

                    {previewUrl && (
                        <div className="text-center mb-3">
                            <img 
                                src={previewUrl} 
                                alt="Vista previa" 
                                className="img-thumbnail" 
                                style={{ maxHeight: '180px' }} 
                            />
                        </div>
                    )}

                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label className="form-label font-weight-bold">Tipo de Suelo</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                name="tipo_suelo" 
                                value={formData.tipo_suelo} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="col-md-4 mb-3">
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

                        <div className="col-md-4 mb-3">
                            <label className="form-label font-weight-bold">Humedad (%)</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                className="form-control" 
                                name="humedad" 
                                value={formData.humedad} 
                                onChange={handleChange} 
                                placeholder="Ej. 70"
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

                    <button type="submit" className="btn btn-success w-100" disabled={loading}>
                        {loading ? 'Analizando imagen con Gemini IA...' : 'Analizar y Guardar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FormularioAnalisis;