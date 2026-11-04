const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/config/db');

const app = express();
// Agrega esto en tu server.js junto a las demás configuraciones
const plantasRoutes = require('./src/routes/plantasRoutes');

// Usar las rutas
app.use('/api/plantas', plantasRoutes);

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba inicial
app.get('/', (req, res) => {
    res.json({ mensaje: '¡Servidor de CeresIA activo y funcionando correctamente!' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});