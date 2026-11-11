const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rutas
const plantasRoutes = require('./src/routes/plantasRoutes');
const analisisRoutes = require('./src/routes/analisisRoutes');

// Usar rutas
app.use('/api/plantas', plantasRoutes);
app.use('/api/analisis', analisisRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
