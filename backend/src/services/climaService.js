/**
 * Obtiene temperatura, humedad y nombre del municipio usando coordenadas GPS del dispositivo
 */
const obtenerClimaPorCoordenadas = async (latitud, longitud) => {
    try {
        // 1. Consultar temperatura y humedad actuales en Open-Meteo con lat/lon
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m,relative_humidity_2m`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const temperatura = weatherData.current?.temperature_2m ?? 15.5;
        const humedad = weatherData.current?.relative_humidity_2m ?? 78.0;

        // 2. Geocodificación inversa para obtener el nombre del municipio/ciudad automáticamente
        let nombreUbicacion = `${Number(latitud).toFixed(4)}, ${Number(longitud).toFixed(4)}`;
        try {
            const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitud}&lon=${longitud}&zoom=10`;
            const geoRes = await fetch(geoUrl, {
                headers: { 'User-Agent': 'CeresIA-AgroApp/1.0' }
            });
            const geoData = await geoRes.json();
            
            if (geoData && geoData.address) {
                const ciudad = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.municipality || '';
                const estado = geoData.address.state || '';
                if (ciudad) {
                    nombreUbicacion = estado ? `${ciudad}, ${estado}` : ciudad;
                }
            }
        } catch (geoErr) {
            console.warn('No se pudo resolver el nombre de la ciudad, usando coordenadas:', geoErr.message);
        }

        return {
            ubicacion: nombreUbicacion,
            temperatura,
            humedad
        };
    } catch (error) {
        console.error('Error al consultar clima por coordenadas:', error);
        return {
            ubicacion: 'Facatativá, Cundinamarca (Fallback)',
            temperatura: 15.5,
            humedad: 78.0
        };
    }
};

module.exports = { obtenerClimaPorCoordenadas };