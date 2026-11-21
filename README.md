# CERES IA — Plataforma de Diagnóstico Fitotécnico y Telemetría Agrícola

**CERES IA** es una aplicación web progresiva (PWA) full-stack impulsada por inteligencia artificial para la identificación botánica, el diagnóstico fitosanitario foliar mediante visión artificial y el análisis de viabilidad agroclimática por geolocalización y tipo de suelo.

---

## Características Principales

* **Escáner Fitosanitario por Visión IA:** Identificación taxonómica de plantas y detección de patologías a partir de fotografías tomadas en campo (cámara móvil nativa) o cargadas desde el equipo, con generación de informes técnicos exportables a PDF.
* **Evaluación de Compatibilidad Agroclimática:** Cruce de coordenadas GPS en tiempo real con variables meteorológicas locales y características del sustrato (franco arcilloso, franco arenoso, franco limoso y orgánico) para determinar la viabilidad de siembra.
* **Historial Fitotécnico:** Registro cronológico persistente de diagnósticos realizados, filtrado por estado sanitario y consulta detallada de protocolos de manejo.
* **Catálogo Botánico de Referencia:** Base de conocimiento agronómico con rangos óptimos de temperatura, humedad relativa y sustratos ideales por especie.
* **Autenticación Segura:** Registro e inicio de sesión con contraseñas cifradas (`bcrypt`), verificación de correo mediante código OTP, recuperación de contraseña, tokens JWT y acceso rápido con **Google Identity Services (OAuth 2.0)**.
* **Diseño Responsivo Web y Móvil:** Interfaz adaptativa con barra lateral en escritorio y navegación inferior con acceso directo al escáner en dispositivos móviles.

---

## Stack Tecnológico

* **Frontend:** React, Vite, Axios, CSS3 personalizado, Google Identity Services, soporte PWA (`manifest.json`).
* **Backend:** Node.js, Express, JSON Web Tokens (JWT), Bcryptjs, Nodemailer.
* **Inteligencia Artificial:** Google Gemini API (`gemini-3.5-flash-lite` para visión artificial) y Groq API (`openai/gpt-oss-120b` para recomendaciones agronómicas).
* **Base de Datos:** MySQL / MariaDB.

---

## Estructura del Proyecto

```text
CeresIA/
├── backend/
│   ├── config/             # Configuración de conexión a MySQL
│   ├── routes/             # Endpoints REST (auth, analisis, plantas)
│   ├── services/           # Integración con Gemini, Groq, clima y correo OTP
│   ├── .env                # Variables de entorno del servidor (no versionado)
│   ├── package.json
│   └── server.js           # Punto de entrada de Express
├── database/               # Scripts SQL y respaldos de la base de datos
├── frontend/
│   ├── public/             # Manifiesto PWA (manifest.json) e isotipo (ceres-icon.svg)
│   ├── src/
│   │   ├── components/     # AuthForm, FormularioAnalisis, CompatibilidadZona, HistorialAnalisis, ListaPlantas, PerfilUsuario
│   │   ├── services/       # Cliente HTTP Axios con detección dinámica de host (api.js)
│   │   ├── styles/         # Hojas de estilo responsivas (auth.css, dashboard.css)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
Instalación y Ejecución Local
1. Clonar el repositorio
Bash
git clone [https://github.com/JesusSanchez28/CeresIA.git](https://github.com/JesusSanchez28/CeresIA.git)
cd CeresIA
2. Configurar la base de datos MySQL
Inicia tu servidor MySQL (XAMPP / MariaDB).

Crea una base de datos llamada ceresia.

Importa el archivo .sql ubicado en la carpeta database/ desde phpMyAdmin o línea de comandos.

3. Configurar y ejecutar el Backend
Bash
cd backend
npm install
Crea un archivo .env dentro de backend/ con las siguientes variables:

Fragmento de código
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ceresia
JWT_SECRET=tu_clave_secreta_jwt
GEMINI_API_KEY=tu_api_key_de_gemini
GROQ_API_KEY=tu_api_key_de_groq
GOOGLE_CLIENT_ID=tu_client_id_de_google
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contrasena_de_aplicacion
Inicia el servidor:

Bash
npx nodemon server.js
4. Configurar y ejecutar el Frontend
En otra terminal:

Bash
cd frontend
npm install
Crea un archivo .env dentro de frontend/ (opcional para desarrollo local):

Fragmento de código
VITE_GOOGLE_CLIENT_ID=tu_client_id_de_google
VITE_API_URL=http://localhost:3000/api
Inicia la aplicación en modo desarrollo (con --host para pruebas en red local móvil):

Bash
npm run dev -- --host
Autor
Franklin Jesús Sánchez Ruiz

GitHub: @JesusSanchez28