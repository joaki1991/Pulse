// Debug script para verificar configuración
console.log('🔧 DEBUG: Configuración de la aplicación');
console.log('📍 URL actual:', window.location.href);
console.log('🌍 Entorno:', import.meta.env.MODE);
console.log('🔗 VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('📊 Todas las variables de entorno:', import.meta.env);

// Test de conectividad automático
const testConnection = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  console.log('🧪 Probando conexión a:', apiUrl);
  
  try {
    const response = await fetch(`${apiUrl}/users/anonymous`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexión exitosa:', data);
    } else {
      console.error('❌ Error en respuesta:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('📄 Detalle del error:', errorData);
    }
  } catch (error) {
    console.error('🚫 Error de red:', error);
  }
};

// Ejecutar test después de que se cargue la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testConnection);
} else {
  testConnection();
}

export { testConnection };
