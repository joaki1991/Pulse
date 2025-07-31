# 🗳️ Pulse - Sistema de Encuestas

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

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**Joaquín Piqueras** - [joaquinpiqueras91@gmail.com](mailto:joaquinpiqueras91@gmail.com)
