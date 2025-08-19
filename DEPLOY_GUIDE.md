# GUÍA PASO A PASO PARA DESPLIEGUE

## 1. Desplegar Backend en Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Ir al directorio backend
cd backend

# Login en Railway
railway login

# Crear nuevo proyecto
railway new

# Desplegar
railway up
```

## 2. Configurar variables en Railway
- MONGODB_URI=tu_string_de_mongodb_atlas
- JWT_SECRET=tu_secreto_jwt
- CLOUDINARY_CLOUD_NAME=tu_cloudinary_name
- CLOUDINARY_API_KEY=tu_cloudinary_key  
- CLOUDINARY_API_SECRET=tu_cloudinary_secret
- PORT=5000

## 3. Actualizar URL en frontend
- Editar .env.production con la URL de Railway
- VITE_API_URL=https://tu-app.railway.app/api

## 4. Commit y push
```bash
git add .
git commit -m "Preparar para despliegue"
git push origin main
```

## 5. Desplegar en Netlify
- netlify.com → New site from Git
- Base directory: frontend
- Build command: npm run build
- Publish directory: frontend/dist
- Environment variable: VITE_API_URL

## URLs finales:
- Frontend: https://tu-app.netlify.app
- Backend: https://tu-app.railway.app
