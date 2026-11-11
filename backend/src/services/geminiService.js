const { GoogleGenAI } = require('@google/genai');

// Inicializar el cliente usando la clave de entorno
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analiza una imagen en base64 para detectar estado o posibles plagas/enfermedades
 * @param {string} base64Image - Imagen codificada en Base64
 * @param {string} mimeType - Tipo de imagen (ej. 'image/jpeg' o 'image/png')
 */
const analizarImagenPlanta = async (base64Image, mimeType = 'image/jpeg') => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType
                    }
                },
                'Actúa como un experto agrónomo. Analiza la imagen de la planta o semilla adjunta. Proporciona un diagnóstico conciso en un solo párrafo indicando la salud general, posibles deficiencias de nutrientes o plagas detectadas.'
            ]
        });

        return response.text;
    } catch (error) {
        console.error('Error al consultar Gemini API:', error);
        throw new Error('No se pudo procesar la imagen con la IA.');
    }
};

module.exports = { analizarImagenPlanta };