// Lista de nombres aleatorios para usuarios anónimos
const adjectives = [
  'Valiente', 'Creativo', 'Inteligente', 'Curioso', 'Amigable', 'Brillante', 'Audaz',
  'Gentil', 'Sabio', 'Alegre', 'Paciente', 'Divertido', 'Misterioso', 'Aventurero',
  'Tranquilo', 'Dinámico', 'Espontáneo', 'Reflexivo', 'Optimista', 'Innovador',
  'Determinado', 'Carismático', 'Sereno', 'Entusiasta', 'Perspicaz', 'Honesto',
  'Generoso', 'Astuto', 'Noble', 'Energético'
]

const animals = [
  'León', 'Águila', 'Delfín', 'Lobo', 'Tigre', 'Oso', 'Zorro', 'Ciervo', 'Halcón',
  'Panda', 'Gato', 'Perro', 'Búho', 'Elefante', 'Jirafa', 'Pingüino', 'Koala',
  'Canguro', 'Mariposa', 'Libélula', 'Colibrí', 'Tortuga', 'Pulpo', 'Ballena',
  'Estrella', 'Jaguar', 'Puma', 'Nutria', 'Ardilla', 'Conejo'
]

const colors = [
  'Dorado', 'Plateado', 'Azul', 'Verde', 'Rojo', 'Violeta', 'Naranja', 'Rosa',
  'Turquesa', 'Coral', 'Esmeralda', 'Rubí', 'Zafiro', 'Ámbar', 'Cristal',
  'Índigo', 'Magenta', 'Cian', 'Lima', 'Aqua'
]

/**
 * Genera un nombre aleatorio para usuarios anónimos
 * Formato: [Adjetivo] [Animal] [Color] [Número]
 * Ejemplo: "Valiente León Dorado 42"
 */
export const generateAnonymousName = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const color = colors[Math.floor(Math.random() * colors.length)]
  const number = Math.floor(Math.random() * 999) + 1
  
  return `${adjective} ${animal} ${color} ${number}`
}

/**
 * Genera un hash simple basado en la IP para asegurar consistencia
 * El mismo IP siempre generará el mismo nombre
 */
export const generateConsistentAnonymousName = (ip) => {
  // Crear un hash simple de la IP
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  // Usar el hash para seleccionar elementos de forma consistente
  const adjectiveIndex = Math.abs(hash) % adjectives.length
  const animalIndex = Math.abs(hash >> 8) % animals.length
  const colorIndex = Math.abs(hash >> 16) % colors.length
  const number = Math.abs(hash) % 999 + 1
  
  return `${adjectives[adjectiveIndex]} ${animals[animalIndex]} ${colors[colorIndex]} ${number}`
}
