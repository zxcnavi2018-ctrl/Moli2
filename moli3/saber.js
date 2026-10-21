// ===================================================================
//  MOLÍ 3 · LO QUE MOLÍ SABE (para conversar por voz)
//  Cada idea: { id, claves: [palabras o frases que la activan], resp: 'lo que Molí responde', ir / accion }
//  - Para enseñarle algo nuevo, agrega una línea igual a las de abajo (claves en minúsculas, sin tildes).
//  - Si existe audio/s/<id>.mp3, Molí lo dice con su voz; si no, usa la voz del navegador.
//  - ir: escena a la que vuela (aula, cuaderno, corcho, holograma, muro). accion: acercar, alejar, siguiente, anterior.
// ===================================================================
window.SABER = [
  // ---- órdenes: moverse por el aula ----
  { id: 'ir-aula', ir: 'aula', claves: ['aula', 'salon', 'vista general', 'general', 'inicio'], resp: '¡Vamos al aula!' },
  { id: 'ir-cuaderno', ir: 'cuaderno', claves: ['sesion', 'sesiones', 'cuaderno'], resp: '¡Vamos al cuaderno de sesiones!' },
  { id: 'ir-corcho', ir: 'corcho', claves: ['corcho', 'normas', 'proposito'], resp: '¡Vamos al corcho!' },
  { id: 'ir-holograma', ir: 'holograma', claves: ['holograma', 'diapositivas', 'presentacion', 'proyeccion'], resp: '¡Vamos al holograma!' },
  { id: 'ir-muro', ir: 'muro', claves: ['muro', 'trabajos destacados', 'destacados', 'pared'], resp: '¡Vamos al muro del aula!' },
  { id: 'acercar', accion: 'acercar', claves: ['acercate', 'acerca', 'mas cerca', 'zoom', 'acercar'], resp: 'Me acerco.' },
  { id: 'alejar', accion: 'alejar', claves: ['alejate', 'aleja', 'mas lejos', 'alejar'], resp: 'Me alejo.' },
  { id: 'siguiente', accion: 'siguiente', claves: ['siguiente', 'pasa la diapositiva', 'adelante'], resp: 'Siguiente diapositiva.' },
  { id: 'anterior', accion: 'anterior', claves: ['anterior', 'regresa la diapositiva', 'atras'], resp: 'Diapositiva anterior.' },

  // ---- conversación ----
  { id: 'hola', claves: ['hola', 'buenos dias', 'buenas tardes', 'buenas'], resp: '¡Hola, usuario! ¿En qué te ayudo?' },
  { id: 'quien', claves: ['quien eres', 'como te llamas', 'tu nombre', 'que eres'], resp: 'Soy Molí 3, tu asistente robot del aula de Ciencia y Tecnología.' },
  { id: 'gracias', claves: ['gracias'], resp: '¡De nada, usuario!' },

  // ---- Unidad 7 · Microorganismos en acción ----
  { id: 'u7-que-son', claves: ['que son los microorganismos', 'microorganismo', 'microorganismos'], resp: 'Son seres vivos tan pequeños que solo se ven con microscopio, como las bacterias, los virus y algunos hongos.' },
  { id: 'u7-bacterias', claves: ['bacteria', 'bacterias'], resp: 'Las bacterias tienen una sola célula. Algunas nos ayudan, como las del yogur, y otras causan enfermedades.' },
  { id: 'u7-virus', claves: ['virus'], resp: 'Los virus son muy pequeños y solo se multiplican dentro de las células de otros seres vivos. Causan enfermedades como la gripe.' },
  { id: 'u7-hongos', claves: ['hongo', 'hongos', 'levadura', 'moho'], resp: 'Algunos hongos son microscópicos, como la levadura que hace crecer el pan, y otros son grandes, como los champiñones.' },
  { id: 'u7-prevenir', claves: ['prevenir', 'prevencion', 'cuidarnos', 'evitar'], resp: 'Para prevenir enfermedades: lávate las manos, cúbrete al toser, lava los alimentos y mantén limpia tu aula.' },
  { id: 'u7-utiles', claves: ['beneficioso', 'beneficiosos', 'utiles', 'util', 'buenos', 'ayudan'], resp: 'Hay microorganismos útiles: ayudan a hacer yogur, queso y pan, y descomponen los restos en la naturaleza.' },
  { id: 'u7-daninos', claves: ['danino', 'daninos', 'enfermedad', 'enfermedades', 'malos'], resp: 'Algunos microorganismos causan enfermedades, como la gripe, la tos o las infecciones del estómago.' },
  { id: 'u7-microscopio', claves: ['microscopio'], resp: 'El microscopio agranda lo muy pequeño para que podamos ver a los microorganismos.' },
  { id: 'u7-meta', claves: ['meta', 'objetivo'], resp: 'La meta es identificar microorganismos beneficiosos y dañinos en nuestra vida diaria.' },
  { id: 'u7-criterios', claves: ['criterio', 'criterios'], resp: 'Nombro tres tipos de microorganismos, doy un ejemplo útil y uno dañino, y explico cómo prevenir enfermedades.' },
  { id: 'u7-reto', claves: ['reto', 'desafio'], resp: 'En equipo, diseñen un afiche para prevenir enfermedades causadas por microorganismos. Tienen quince minutos.' },
  { id: 'materiales', claves: ['materiales', 'que traigo', 'que debo traer', 'tarea'], resp: 'Debes traer cartulina, plumones, tijeras, goma, regla y lápiz.' }
];
// lo que dice cuando el comentario no es de la clase, y cuando no escuchó nada
window.SABER_FUERA = { id: 'fuera', resp: '¿Este comentario es parte de tu aprendizaje?' };
window.SABER_NADA = { id: 'nada', resp: 'No te escuché bien. ¿Puedes repetirlo?' };
window.SABER_ESCENA = { id: 'ya-aqui', resp: 'Ya estamos aquí.' };
