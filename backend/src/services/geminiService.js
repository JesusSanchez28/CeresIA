require('dotenv').config();
const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Ponemos el modelo más rápido y disponible primero para evitar esperas por 503
const MODELOS_DISPONIBLES = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash'
];

const analizarImagenPlanta = async (base64Image, mimeType = 'image/jpeg', temperatura = 18, humedad = 70) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('Falta GEMINI_API_KEY en el archivo .env del backend');
    }

    const prompt = `Actúa como un agrónomo y botánico experimentado, con sólida formación en fisiología vegetal, ecología y fitotecnia. Tu tarea es determinar si la imagen adjunta muestra material vegetal real y, si es así, identificar la especie con la mayor precisión posible y evaluar su salud y viabilidad bajo las condiciones climáticas actuales.

Primero determina estrictamente si la imagen muestra una planta, hoja, flor, fruto, cultivo o semilla real ("es_planta"). Si la imagen muestra otra cosa (personas, objetos, pantallas, animales, paisajes sin foco botánico, texto, etc.), marca "es_planta": false y explica brevemente en "diagnostico" qué aparece en la foto.

Si sí es una planta o semilla ("es_planta": true), identifícala a partir de sus rasgos visibles (hojas, tallo, flores, frutos, semillas, textura, coloración y estructura general) y evalúa su salud y viabilidad considerando:





Temperatura: ${temperatura}°C



Humedad relativa: ${humedad}%

Al evaluar, considera el rango térmico e hídrico óptimo de la especie, sus umbrales de estrés por calor o frío, su requerimiento de humedad y la sensibilidad de sus órganos visibles (por ejemplo, si la semilla o la flor es especialmente vulnerable). Indica si las condiciones son favorables, limitantes o adversas, y explica qué rasgos observables en la imagen respaldan tu juicio.

Si la imagen no permite una identificación segura, indícalo, señala qué rasgos faltan para confirmarla y ofrece la evaluación más probable con su grado de incertidumbre. Si las variables de temperatura o humedad no son valores numéricos válidos, señálalo y evalúa la viabilidad de forma cualitativa, explicando qué rango de condiciones necesitaría la especie.

Responde en español, de forma clara y técnica pero accesible, indicando la especie probable, el veredicto de viabilidad y sus razones, los riesgos principales y las recomendaciones prácticas de manejo que correspondan a las condiciones dadas.`;

    let ultimoError = null;

    for (const modelo of MODELOS_DISPONIBLES) {
        try {
            const response = await ai.models.generateContent({
                model: modelo,
                contents: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType
                        }
                    },
                    prompt
                ],
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            es_planta: {
                                type: Type.BOOLEAN,
                                description: 'true ÚNICAMENTE si la imagen muestra una planta, flor, hoja, fruto o semilla. false si es cualquier otro objeto, persona o cosa.'
                            },
                            nombre_comun: {
                                type: Type.STRING,
                                description: 'Nombre común de la planta o semilla (o "No aplica" si es_planta es false)'
                            },
                            nombre_cientifico: {
                                type: Type.STRING,
                                description: 'Nombre científico (o "No aplica" si es_planta es false)'
                            },
                            tipo: {
                                type: Type.STRING,
                                description: 'Planta, Flor, Semilla, Grano, Tubérculo, Frutal o No aplica'
                            },
                            descripcion: {
                                type: Type.STRING,
                                description: 'Breve descripción agronómica en máximo 15 palabras'
                            },
                            diagnostico: {
                                type: Type.STRING,
                                description: 'Si es_planta es false, indica qué se ve en la imagen y pide subir una planta o semilla. Si es true, da el diagnóstico de salud y clima en 1 párrafo.'
                            },
                            es_apto: {
                                type: Type.BOOLEAN,
                                description: 'true si el clima actual es favorable para la especie, false en caso contrario'
                            }
                        },
                        required: ['es_planta', 'nombre_comun', 'nombre_cientifico', 'tipo', 'descripcion', 'diagnostico', 'es_apto']
                    }
                }
            });

            return JSON.parse(response.text);
        } catch (error) {
            ultimoError = error;
            console.warn(`⚠️ Falló el modelo ${modelo}:`, error.message || error);
        }
    }

    throw new Error(`Error IA: ${ultimoError?.message || 'No se pudo procesar la imagen.'}`);
};

module.exports = { analizarImagenPlanta };