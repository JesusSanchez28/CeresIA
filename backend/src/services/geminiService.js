require('dotenv').config();
const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const conTimeout = (promesa, ms, mensajeError) => {
    return Promise.race([
        promesa,
        new Promise((_, reject) => setTimeout(() => reject(new Error(mensajeError)), ms))
    ]);
};

// Detecta y guarda en caché el mejor modelo de texto activo en tu cuenta de Groq
let groqTextModelCache = null;
const obtenerModeloTextoGroq = async () => {
    if (groqTextModelCache) return groqTextModelCache;

    const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`No se pudieron listar los modelos de Groq: ${err}`);
    }

    const data = await res.json();
    const ids = (data.data || [])
        .map(m => m.id)
        .filter(id => !id.includes('whisper') && !id.includes('tts') && !id.includes('guard'));

    groqTextModelCache =
        ids.find(id => id === 'openai/gpt-oss-120b') ||
        ids.find(id => id === 'qwen/qwen3.8-27b') ||
        ids.find(id => id === 'openai/gpt-oss-20b') ||
        ids[0] ||
        null;

    console.log('✅ Modelo de texto Groq activo:', groqTextModelCache);
    return groqTextModelCache;
};

const consultarGroqTexto = async (prompt) => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('No hay GROQ_API_KEY configurada.');
    }

    const modelo = await obtenerModeloTextoGroq();
    if (!modelo) throw new Error('No hay modelos de texto disponibles en Groq.');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: modelo,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.2
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    console.log(`✅ Respuesta rápida obtenida con Groq (${modelo})`);
    return parsed;
};

const INTENTOS_GEMINI = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash'
];

// 1. ANÁLISIS DE IMAGEN (Especie, estado fitosanitario, viabilidad climática y cuidados)
const analizarImagenPlanta = async (base64Image, mimeType = 'image/jpeg', temperatura = 18, humedad = 70) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('Falta GEMINI_API_KEY en el archivo .env del backend.');
    }

    const prompt = `Actúa como ingeniero agrónomo y botánico experto. Analiza la imagen adjunta y las condiciones climáticas actuales (Temperatura: ${temperatura}°C, Humedad relativa: ${humedad}%).
Responde ÚNICAMENTE un objeto JSON válido con estas 7 claves:
- "es_planta": booleano (true si muestra material vegetal real: planta, hoja, flor, fruto, cultivo o semilla; false si muestra personas, objetos, animales o cosas).
- "nombre_comun": string (nombre común de la planta/semilla en español o "No aplica").
- "nombre_cientifico": string (nombre científico o "No aplica").
- "tipo": string ("Planta", "Flor", "Semilla", "Grano", "Tubérculo", "Frutal" o "No aplica").
- "descripcion": string (breve descripción agronómica en español en máximo 15 palabras).
- "diagnostico": string (si es_planta es false indica qué se observa y pide subir una planta o semilla; si es true redacta un informe práctico en español en 1 párrafo que incluya: 1) Estado sanitario visible de la planta/semilla, 2) Viabilidad frente al clima actual de ${temperatura}°C y ${humedad}% humedad, y 3) Cuidados clave de riego, luz, suelo y prevención de plagas).
- "es_apto": booleano (true si el clima ${temperatura}°C y ${humedad}% humedad es favorable para esta especie, false en caso contrario).`;

    for (let i = 0; i < INTENTOS_GEMINI.length; i++) {
        const modelo = INTENTOS_GEMINI[i];
        try {
            const response = await conTimeout(
                ai.models.generateContent({
                    model: modelo,
                    contents: [
                        { inlineData: { data: base64Image, mimeType } },
                        prompt
                    ],
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                es_planta: { type: Type.BOOLEAN },
                                nombre_comun: { type: Type.STRING },
                                nombre_cientifico: { type: Type.STRING },
                                tipo: { type: Type.STRING },
                                descripcion: { type: Type.STRING },
                                diagnostico: { type: Type.STRING },
                                es_apto: { type: Type.BOOLEAN }
                            },
                            required: ['es_planta', 'nombre_comun', 'nombre_cientifico', 'tipo', 'descripcion', 'diagnostico', 'es_apto']
                        }
                    }
                }),
                12000,
                `Timeout ${modelo}`
            );
            console.log(`✅ Imagen analizada con Gemini (${modelo})`);
            return JSON.parse(response.text);
        } catch (err) {
            console.warn(`⚠️ Intento ${i + 1} (${modelo}) falló:`, err.message);
            if (i < INTENTOS_GEMINI.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }
    }

    throw new Error('Los servidores de análisis visual tienen alta demanda en este momento. Intenta de nuevo en unos segundos.');
};

// 2. RECOMENDACIÓN DE CULTIVOS POR CLIMA (Groq Texto ultrarrápido + respaldo Gemini)
const recomendarCultivosPorClima = async (ubicacion, temperatura, humedad) => {
    const prompt = `Actúa como ingeniero agrónomo experto en Colombia.
Ubicación actual: ${ubicacion}
Temperatura actual: ${temperatura}°C
Humedad relativa: ${humedad}%

Recomienda exactamente 4 cultivos o semillas altamente compatibles y rentables para sembrar en estas condiciones agroclimáticas en español.
Responde ÚNICAMENTE un objeto JSON válido con esta estructura exacta:
{
  "resumen_climatico": "Análisis breve del piso térmico y condiciones en 2 líneas",
  "cultivos_recomendados": [
    {
      "nombre_comun": "...",
      "nombre_cientifico": "...",
      "compatibilidad": "95% Alta",
      "suelo_ideal": "...",
      "consejo_siembra": "..."
    }
  ]
}`;

    if (process.env.GROQ_API_KEY) {
        try {
            return await conTimeout(consultarGroqTexto(prompt), 8000, 'Timeout Groq Texto');
        } catch (errGroq) {
            console.warn('⚠️ Groq Texto falló, pasando a Gemini:', errGroq.message);
        }
    }

    if (process.env.GEMINI_API_KEY) {
        for (const modelo of ['gemini-3.5-flash-lite', 'gemini-3.8-flash']) {
            try {
                const response = await conTimeout(
                    ai.models.generateContent({
                        model: modelo,
                        contents: [prompt],
                        config: {
                            responseMimeType: 'application/json',
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    resumen_climatico: { type: Type.STRING },
                                    cultivos_recomendados: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                nombre_comun: { type: Type.STRING },
                                                nombre_cientifico: { type: Type.STRING },
                                                compatibilidad: { type: Type.STRING },
                                                suelo_ideal: { type: Type.STRING },
                                                consejo_siembra: { type: Type.STRING }
                                            },
                                            required: ['nombre_comun', 'nombre_cientifico', 'compatibilidad', 'suelo_ideal', 'consejo_siembra']
                                        }
                                    }
                                },
                                required: ['resumen_climatico', 'cultivos_recomendados']
                            }
                        }
                    }),
                    10000,
                    `Timeout ${modelo}`
                );
                return JSON.parse(response.text);
            } catch (err) {
                console.warn(`⚠️ Falló compatibilidad con Gemini (${modelo}):`, err.message);
            }
        }
    }

    throw new Error('Los motores de IA están ocupados en este momento. Intenta de nuevo.');
};

module.exports = { analizarImagenPlanta, recomendarCultivosPorClima };