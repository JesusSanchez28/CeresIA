const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Importar rutas
const plantasRoutes = require('./src/routes/plantasRoutes');
const analisisRoutes = require('./src/routes/analisisRoutes');
const authRoutes = require('./src/routes/authRoutes');

// Endpoint de salud y monitoreo (evita "Cannot GET /" en Render)
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'CERES IA API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Usar rutas
app.use('/api/plantas', plantasRoutes);
app.use('/api/analisis', analisisRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor CERES IA corriendo en el puerto ${PORT}`);
});