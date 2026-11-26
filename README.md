# 🌱 CERES IA — Plataforma de Diagnóstico Botánico y Telemetría Agroclimática

**CERES IA** es una plataforma web y móvil progresiva de agricultura de precisión que combina **visión artificial**, **telemetría meteorológica en tiempo real** y **análisis de compatibilidad edafoclimática** para identificar especies vegetales, detectar patologías foliares y recomendar cultivos viables según la ubicación GPS y el tipo de suelo del productor.

🌐 **Aplicación en Producción:** [https://ceresia.vercel.app](https://ceresia.vercel.app)  
⚙️ **API REST Desplegada:** [https://ceresia-backend.onrender.com](https://ceresia-backend.onrender.com)

---

## 🚀 Funcionalidades Principales

* **Escáner Fitosanitario por Visión IA:** Identificación taxonómica (nombre común, nombre científico y categoría), ficha botánica, diagnóstico sanitario y protocolo de manejo agronómico a partir de fotografías tomadas en campo o cargadas desde galería.
* **Telemetría Climática por GPS:** Captura automática de coordenadas para consultar temperatura ambiente y humedad relativa en tiempo real, evaluando la viabilidad climática del cultivo.
* **Compatibilidad Agroclimática de Terreno:** Recomendación inteligente de cultivos y semillas óptimos cruzando el piso térmico local con el sustrato de la parcela (*Franco arcilloso*, *Franco arenoso*, *Franco limoso*, *Orgánico / Negro*).
* **Catálogo Botánico de Referencia:** Base de conocimiento colaborativa con trazabilidad de usuario, rangos térmicos e hídricos ideales por especie y filtrado dinámico por tipo de suelo.
* **Historial Fitotécnico y Exportación PDF:** Registro cronológico por productor en base de datos relacional con generación de fichas técnicas imprimibles/PDF.
* **Autenticación Segura y Cumplimiento Normativo:** Inicio de sesión con Google OAuth 2.0, verificación de correo mediante código OTP y consentimiento expreso alineado con la **Ley 1581 de 2012 (Habeas Data)** y **Ley 527 de 1999** de Colombia.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 18, Vite, CSS3 Modular (Diseño Responsivo Web + App Móvil), Google Identity Services |
| **Backend** | Node.js, Express.js, MySQL2, JSON Web Tokens (JWT), Bcrypt |
| **Inteligencia Artificial** | Google Gemini API (Visión Multimodal con esquema JSON estructurado) + Groq API (Inferencia rápida de recomendaciones) |
| **Servicios Externos** | OpenWeatherMap API (Telemetría climática), Brevo API (Envío transaccional OTP) |
| **Base de Datos** | MySQL 8 (Procedimientos almacenados, integridad referencial y auto-migración segura) |
| **Infraestructura Cloud** | Vercel (Frontend CI/CD), Render (Backend Node.js), Aiven (MySQL Cloud) |

---

## 📂 Estructura del Proyecto

```text
CeresIA/
├── backend/
│   ├── src/
│   │   ├── config/          # Conexión pool a MySQL (Aiven / Local)
│   │   ├── controllers/     # Lógica de negocio (auth, analisis, plantas)
│   │   ├── routes/          # Endpoints REST (/api/auth, /api/analisis, /api/plantas)
│   │   └── services/        # Integración con Gemini, Groq, OpenWeather y Brevo
│   ├── server.js            # Punto de entrada Express y healthcheck
│   └── package.json
├── frontend/
│   ├── public/              # Logo oficial, manifiesto e íconos
│   ├── src/
│   │   ├── components/      # AuthForm, FormularioAnalisis, CompatibilidadZona, HistorialAnalisis, ListaPlantas, PerfilUsuario
│   │   ├── services/        # Cliente Axios con interceptores JWT
│   │   ├── styles/          # Hojas de estilo globales, auth y dashboard
│   │   └── App.jsx          # Enrutamiento de vistas y navegación responsiva
│   └── package.json
└── ceresia_backup.sql       # Esquema DDL, relaciones y procedimiento almacenado
⚙️ Instalación y Ejecución Local
1. Clonar el repositorio
Bash
git clone [https://github.com/JesusSanchez28/CeresIA.git](https://github.com/JesusSanchez28/CeresIA.git)
cd CeresIA
2. Configurar y ejecutar el Backend
Bash
cd backend
npm install
Crea un archivo .env dentro de backend/ con las siguientes variables:

Fragmento de código
PORT=3000
DB_HOST=tu_host_mysql
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=ceresia
JWT_SECRET=tu_clave_secreta_jwt
GEMINI_API_KEY=tu_api_key_gemini
GROQ_API_KEY=tu_api_key_groq
OPENWEATHER_API_KEY=tu_api_key_openweather
GOOGLE_CLIENT_ID=tu_client_id_google
BREVO_API_KEY=tu_api_key_brevo
Inicia el servidor:

Bash
npx nodemon server.js
3. Configurar y ejecutar el Frontend
Bash
cd ../frontend
npm install
Crea un archivo .env dentro de frontend/:

Fragmento de código
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=tu_client_id_google
Inicia la aplicación:

Bash
npm run dev
👨‍💻 Autores
Franklin Jesús Sánchez Ruiz
Luis Gerardo Rico Camelo

Tecnólogo en Análisis y Desarrollo / Técnico en Programación de Software — SENA (CBA Facatativá)

GitHub: @JesusSanchez28