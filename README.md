# 🗳️ Pulse - Sistema de Encuestas

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)

Un sistema completo de encuestas con usuarios registrados y anónimos, desarrollado con **Node.js**, **React** y **MongoDB**.

## 🚀 Características

### Backend (Node.js + Express)
- ✅ Autenticación JWT
- ✅ Usuarios registrados y anónimos (por IP)
- ✅ CRUD completo de encuestas
- ✅ Sistema de votación
- ✅ Resultados en tiempo real
- ✅ Encuestas públicas y privadas
- ✅ Subida de imágenes con Cloudinary

### Frontend (React + Vite)
- ✅ Interfaz moderna y responsiva
- ✅ Autenticación de usuarios
- ✅ Creación y gestión de encuestas
- ✅ Visualización de resultados
- ✅ Modo anónimo para votar

## 📦 Instalación

### Backend
```bash
cd backend
npm install
# Crear archivo .env con las variables necesarias
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Variables de Entorno

Crear archivo `.env` en la carpeta `backend`:

```env
MONGO_URI=tu_connection_string_mongodb
JWT_SECRET=tu_jwt_secret_seguro
CLOUDINARY_CLOUD_NAME=tu_cloudinary_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
PORT=5000
```

## 📡 API Endpoints

### Usuarios
- `POST /api/users/register` - Registrar usuario
- `POST /api/users/login` - Login
- `POST /api/users/anonymous` - Crear usuario anónimo

### Encuestas
- `GET /api/polls/public` - Obtener encuestas públicas
- `POST /api/polls` - Crear encuesta
- `GET /api/polls/:id` - Obtener encuesta por ID

### Votos
- `POST /api/votes` - Votar en encuesta
- `GET /api/votes/results/:pollId` - Obtener resultados

## 🛠️ Tecnologías

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT para autenticación
- bcryptjs para encriptación
- Cloudinary para imágenes
- CORS configurado

### Frontend
- React 18
- Vite
- CSS moderno
- Fetch API

## 📄 Licencia

Este proyecto está disponible bajo diferentes licencias según el uso:

### 🏠 **Uso Personal/Educativo** 
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

Para uso personal, educativo y no comercial, este proyecto está licenciado bajo [Creative Commons Attribution-NonCommercial 4.0](LICENSE).

**Puedes:**
- ✅ Usar el código para aprender
- ✅ Modificar y adaptar para uso personal
- ✅ Compartir con atribución

**No puedes:**
- ❌ Usar comercialmente sin permiso
- ❌ Vender o monetizar directamente

### 💼 **Uso Comercial**
Para uso comercial, contacta al autor para obtener una licencia comercial.

📧 **Contacto para licencia comercial:** [joaquinpiqueras91@gmail.com](mailto:joaquinpiqueras91@gmail.com)

---

## 👨‍💻 Autor

**Joaquín Piqueras** - [joaquinpiqueras91@gmail.com](mailto:joaquinpiqueras91@gmail.com)
