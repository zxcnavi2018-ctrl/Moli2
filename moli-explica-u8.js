//  Explicaciones de Molí para la Unidad 8 (El sistema reproductor humano): actividades 1 y 2 de cada sesión.
//  Se cargan antes de moli-explica.js, que las une con las de la Unidad 7 (clave '8:n-j'). Voz: audio/mx/u8-n-j-paso.mp3
window.MX8 = {
  TIT: { 1: 'Conocemos el sistema reproductor humano', 2: 'Conocemos el sistema reproductor masculino', 3: 'Conocemos el sistema reproductor femenino y el ciclo ovárico', 4: 'La fecundación y el primer trimestre del embarazo', 5: 'El desarrollo del bebé en el segundo y tercer trimestre', 6: 'La tecnología en el embarazo: la ecografía', 7: 'Planificamos nuestro póster científico', 8: 'Elaboramos la versión final de nuestro póster', 9: 'Exponemos nuestros pósters: conferencia científica', 10: 'Creamos un cómic: el viaje de la vida' },
  E: {
    'pro-1': [
      { m: 'hola', t: '¡Hola, equipo! Hoy les presento algo nuevo: ¡el Equipo Pro! Cada equipo tendrá tres tarjetas de colores para comunicarse conmigo y con el profe.', a: [{ k: 'tag', x: '🏅 Equipo Pro · 3 tarjetas por equipo' }, { k: 'tit', x: '🃏 ¡Somos un Equipo Pro!' }] },
      { m: 'genial', t: 'La tarjeta verde significa: ¡queremos participar! Alguien del grupo quiere dar una idea o una respuesta.', a: [{ k: 'tarj', c: 'verde', i: '🙋', h: 'Verde', x: '¡Queremos participar!' }] },
      { m: 'curiosa', t: 'La tarjeta amarilla significa: tenemos una duda. El grupo, o alguien del grupo, quiere hacer una pregunta.', a: [{ k: 'tarj', c: 'amarillo', i: '❓', h: 'Amarilla', x: 'Tenemos una duda' }] },
      { m: 'decidida', t: 'La tarjeta roja es de peligro: ocurre algo en el grupo. Por ejemplo, alguien se siente mal, se derramó algo, o no logran ponerse de acuerdo. El profe irá de inmediato.', a: [{ k: 'tarj', c: 'rojo', i: '🚨', h: 'Roja', x: '¡Peligro! Ocurre algo en el grupo' }] },
      { m: 'pensativa', t: '¿Cómo se usan? El líder del grupo guarda las tarjetas. Cuando alguien necesita una, se la pide al líder. El líder le da la tarjeta, y el estudiante la levanta en alto. El profe la ve y los atiende.', a: [{ k: 'fila', n: 1, i: '🧭', x: 'El líder guarda las tarjetas' }, { k: 'fila', n: 2, i: '🤲', x: 'Le pido la tarjeta y el líder me la da' }, { k: 'fila', n: 3, i: '🙋', x: 'Yo levanto la tarjeta en alto' }, { k: 'fila', n: 4, i: '👀', x: 'El profe la ve y nos atiende' }] },
      { m: 'genial', t: '¡Así trabajamos en orden, y nadie se queda sin ser escuchado! ¿Listos para ser un Equipo Pro?', a: [{ k: 'ok', x: '🏅 ¡Listos para ser un Equipo Pro!' }] }],
    'pro-2': [
      { m: 'hola', t: '¡Equipo Pro! Antes de empezar, recordemos nuestras tres tarjetas.', a: [{ k: 'tit', x: '🃏 Las tarjetas del Equipo Pro' }] },
      { m: 'idea', t: 'Verde: queremos participar. Amarilla: tenemos una duda. Roja: ¡peligro!, ocurre algo en el grupo.', a: [{ k: 'tarj', c: 'verde', i: '🙋', h: 'Verde', x: '¡Queremos participar!' }, { k: 'tarj', c: 'amarillo', i: '❓', h: 'Amarilla', x: 'Tenemos una duda' }, { k: 'tarj', c: 'rojo', i: '🚨', h: 'Roja', x: '¡Peligro en el grupo!' }] },
      { m: 'decidida', t: 'Recuerden: se la piden al líder, el líder se la da, y ustedes la levantan en alto. ¡A trabajar como un Equipo Pro!', a: [{ k: 'ok', x: '🧭 El líder me la da · 🙋 yo la levanto' }] }],
    '1-1': [
      { m: 'hola', t: '¡Bienvenidos a nuestra última unidad! Hoy empezamos a conocer el sistema reproductor humano. Trabajamos en equipo y en el cuaderno.', a: [{ k: 'tag', x: '👥 En equipo · Cuaderno' }] },
      { m: 'curiosa', t: 'Nuestro reto: el colegio será sede de una feria científica. Al final de la unidad, cada equipo presentará dos pósters científicos.', a: [{ k: 'tit', x: '🏆 Reto: ¡dos pósters para la feria científica!' }, { k: 'col', i: '🧬', h: 'Póster 1', x: 'Sistemas reproductores y ciclo ovárico' }, { k: 'col', i: '🩺', h: 'Póster 2', x: 'Tecnología en el embarazo y el parto' }] },
      { m: 'idea', t: 'Primero repartan los roles del equipo: coordinador, secretario, crítico y portavoz.', a: [{ k: 'chips', x: ['🧭 Coordinador', '✍️ Secretario', '❓ Crítico', '🗣️ Portavoz'] }] },
      { m: 'pensativa', t: 'Cada equipo recibe dos rompecabezas en sobres distintos. Tienen cinco minutos para armarlos y ponerle un título a cada uno. ¡No los desarmen hasta el final!', a: [{ k: 'fila', n: 1, i: '🧩', x: 'Armamos los 2 rompecabezas' }, { k: 'fila', n: 2, i: '🏷️', x: 'Les ponemos un título' }, { k: 'fila', n: 3, i: '⏱️', x: '¡En 5 minutos!' }] },
      { m: 'decidida', t: 'Después del video, copien el cuadro y escriban los órganos de cada sistema. ¿Todos se ven a simple vista? ¿Qué órgano tenemos en común varones y mujeres?', a: [{ k: 'tabla', c: ['Sistema femenino 👩', 'Sistema masculino 👦'], d: [['', ''], ['', ''], ['', '']] }] },
      { m: 'genial', t: 'Hablamos con respeto y con palabras científicas. ¡Así aprendemos a conocer nuestro cuerpo!', a: [{ k: 'ok', x: '🔬 Palabras científicas · 💛 respeto' }] }],
    '1-2': [
      { m: 'hola', t: 'Ahora, cada uno empezará su diccionario científico, en una hoja de su cuaderno.', a: [{ k: 'tag', x: '🧑 Individual · Cuaderno' }] },
      { m: 'curiosa', t: 'En esta unidad aparecerán muchas palabras nuevas, como óvulo, espermatozoide o útero. ¡Vamos a guardarlas!', a: [{ k: 'chips', x: ['⚪ Óvulo', '🔵 Espermatozoide', '🫖 Útero', '🌸 Ovario'] }] },
      { m: 'pensativa', t: 'Haz un cuadro de tres columnas: la palabra nueva, qué significa con tus palabras, y un dibujo pequeño.', a: [{ k: 'col', i: '🔤', h: 'Palabra nueva', x: '' }, { k: 'col', i: '💬', h: '¿Qué significa?', x: '' }, { k: 'col', i: '✏️', h: 'Dibujo', x: '' }] },
      { m: 'idea', t: 'Usa las palabras del video y de la sopa de letras.', a: [{ k: 'nota', x: '🔍 Sopa de letras + video = palabras nuevas' }] },
      { m: 'decidida', t: 'Escribe el significado con tus palabras, no lo copies. Así lo entiendes de verdad.', a: [{ k: 'ok', x: '✍️ Con mis propias palabras' }] },
      { m: 'genial', t: 'Seguiremos completando tu diccionario en cada sesión. ¡Al final tendrás un gran tesoro científico!', a: [{ k: 'dato', x: '📖 Mi diccionario crece cada clase' }] }],
    '2-1': [
      { m: 'hola', t: '¡Llegó una noticia al Diario Científico de sexto! Hoy la leeremos juntos.', a: [{ k: 'tag', x: '📰 Leemos la noticia · Cuaderno' }, { k: 'tit', x: '📰 El Diario Científico de 6.°' }] },
      { m: 'curiosa', t: 'Mientras leemos, busca los nombres de los órganos, y fíjate para qué sirve cada uno.', a: [{ k: 'chips', x: ['🔎 Los órganos', '⚙️ Su función'] }] },
      { m: 'pensativa', t: 'Anota en tu cuaderno las palabras nuevas: testículos, escroto, conductos deferentes, vesícula seminal, uretra y pene.', a: [{ k: 'nota', x: '📓 Testículos · escroto · conductos deferentes · vesícula seminal · uretra · pene' }] },
      { m: 'genial', t: '¡Con esta noticia y el video, después completarás tu cuadro de apuntes!', a: [{ k: 'ok', x: '➡️ Luego: el cuadro de apuntes' }] }],
    '2-2': [
      { m: 'hola', t: 'Hoy conoceremos el sistema reproductor masculino. Tomaremos apuntes de un video, cada uno en su cuaderno.', a: [{ k: 'tag', x: '🧑 Individual · Cuaderno' }] },
      { m: 'curiosa', t: 'Veremos el video dos veces: la primera de corrido, para entender. La segunda con pausas, para tomar apuntes.', a: [{ k: 'fila', n: 1, i: '👀', x: '1.ª vez: de corrido' }, { k: 'fila', n: 2, i: '⏸️', x: '2.ª vez: con pausas y apuntes' }] },
      { m: 'pensativa', t: 'Copien el cuadro: cada órgano, si es interno o externo, sus características, su función y un dato interesante.', a: [{ k: 'tabla', c: ['Órgano', 'Interno o externo', 'Función'], d: [['Testículos', '', ''], ['Conductos deferentes', '', ''], ['Uretra', '', ''], ['Vesícula seminal', '', ''], ['Pene', '', ''], ['Escroto', '', '']] }] },
      { m: 'idea', t: 'Por ejemplo: los testículos son externos, están dentro del escroto, y producen los espermatozoides y la testosterona.', a: [{ k: 'dato', x: '🔵 Testículos · externos · producen espermatozoides y testosterona' }] },
      { m: 'decidida', t: '¡Muy importante! Sintetizar no es copiar. Escribe ideas cortas, con tus palabras y con lenguaje científico.', a: [{ k: 'ok', x: '✂️ Ideas cortas · 🔬 lenguaje científico' }] },
      { m: 'genial', t: '¡Listos para tomar apuntes como verdaderos científicos!', a: [] }],
    '2-3': [
      { m: 'hola', t: 'Ahora compartimos en equipo. Primero, cada uno escribe su descripción con el andamio y sus apuntes.', a: [{ k: 'tag', x: '👥 En equipo · Cuaderno' }] },
      { m: 'pensativa', t: 'El andamio te ayuda: el sistema reproductor masculino se encarga de… sus órganos principales son… y así, hasta completar todo.', a: [{ k: 'nota', x: 'El sistema reproductor masculino se encarga de ____. Sus órganos principales son ____.' }] },
      { m: 'decidida', t: 'Luego, el portavoz del equipo lee en voz alta la descripción. Los demás escuchan y la comparan con lo que escribieron.', a: [{ k: 'fila', n: 1, i: '✍️', x: 'Cada uno completa el andamio' }, { k: 'fila', n: 2, i: '🎤', x: 'El portavoz lee en voz alta' }, { k: 'fila', n: 3, i: '👂', x: 'Los demás comparan y escuchan' }] },
      { m: 'idea', t: 'Si les faltó algo, lo agregan con otro color. ¡Así aprendemos entre todos!', a: [{ k: 'chips', x: ['🖍️ Agrego con otro color', '🤝 Aprendemos juntos'] }] },
      { m: 'genial', t: 'Y en casa, verás el video del sistema femenino y completarás tu cuadro. ¡Buen trabajo, equipo!', a: [{ k: 'ok', x: '🏠 Flipped: video del sistema femenino' }] }],
    '3-1': [
      { m: 'hola', t: 'Hoy conocemos el sistema reproductor femenino y el ciclo ovárico. Primero, cada uno piensa solo, en su cuaderno.', a: [{ k: 'tag', x: '👤 Individual · Cuaderno' }] },
      { m: 'curiosa', t: 'Recordemos sus órganos: los ovarios, las trompas de Falopio, el útero y la vagina.', a: [{ k: 'chips', x: ['🌸 Ovarios', '〰️ Trompas de Falopio', '🫖 Útero', '🚪 Vagina'] }] },
      { m: 'pensativa', t: 'Ahora piensa: ¿será lo mismo menstruación y ciclo menstrual? ¿Y por qué se le llama ciclo?', a: [{ k: 'tit', x: '🤔 ¿Menstruación = ciclo menstrual?' }] },
      { m: 'idea', t: 'Copia el cuadro y escribe lo que piensas tú, con tus propias ideas. La última columna la completarás al final de la clase.', a: [{ k: 'tabla', c: ['Pregunta', 'Lo que pienso yo', 'Lo que sé ahora'], d: [['¿Es lo mismo?', '', ''], ['¿Por qué «ciclo»?', '', '']] }] },
      { m: 'decidida', t: 'No importa si no estás seguro: son tus ideas iniciales. ¡Al final de la clase veremos qué cambió!', a: [{ k: 'ok', x: '🔄 Volveremos a estas respuestas al final' }] },
      { m: 'genial', t: '¡A pensar como científicos!', a: [] }],
    '3-2': [
      { m: 'hola', t: 'Ahora trabajamos en equipo: armaremos el organizador del ciclo ovárico en un papelote.', a: [{ k: 'tag', x: '👥 En equipo · Papelote' }] },
      { m: 'pensativa', t: 'Primero vemos el video de las fases del ciclo. Fíjense bien: qué le pasa al óvulo, a la pared del útero y a las trompas.', a: [{ k: 'fila', n: 1, i: '📺', x: 'Vemos el video' }, { k: 'fila', n: 2, i: '👀', x: 'Óvulo · útero · trompas' }, { k: 'fila', n: 3, i: '📝', x: 'Anotamos ideas cortas' }] },
      { m: 'curiosa', t: 'El ciclo dura unos veintiocho días y tiene tres fases: la fase folicular, la ovulación, y la fase lútea.', a: [{ k: 'chips', x: ['🌱 Folicular · días 1 a 13', '⚪ Ovulación · día 14', '🫖 Lútea · días 15 a 28'] }] },
      { m: 'idea', t: 'Copien el organizador en su papelote: qué le pasa al óvulo, a la pared del útero y a las trompas en cada etapa. Algunas casillas ya tienen una pista.', a: [{ k: 'tabla', c: ['', 'Días 1-5', 'Días 6-13', 'Día 14', 'Días 15-28'], d: [['Óvulo', '', 'Madura', '', ''], ['Pared del útero', 'Se desprende', '', '', 'Se engrosa'], ['Trompas', '', '', '', '']] }] },
      { m: 'decidida', t: 'Recuerden: si el óvulo no es fecundado, la pared del útero se desprende. Eso es la menstruación, y es natural.', a: [{ k: 'ok', x: '🌷 La menstruación es natural' }] },
      { m: 'genial', t: 'Al final, vuelvan a sus respuestas del inicio. ¿Qué cambió? ¡Eso es aprender!', a: [{ k: 'nota', x: '🔄 Antes pensaba… ahora sé…' }] }],
    '4-1': [
      { m: 'hola', t: '¡Llegó la caja sorpresa! Cada uno saca piezas: el óvulo, el espermatozoide, la trompa, el cigoto, el blastocisto y el útero.', a: [{ k: 'tag', x: '👤 Individual · Cuaderno' }, { k: 'tit', x: '🎁 La caja sorpresa' }, { k: 'chips', x: ['Óvulo', 'Espermatozoide', 'Trompa', 'Cigoto', 'Blastocisto', 'Útero'] }] },
      { m: 'curiosa', t: 'Observa bien tus piezas y copia esta tabla en tu cuaderno: escribe lo que ves, lo que piensas y lo que te preguntas.', a: [{ k: 'tabla', c: ['👀 Veo', '💭 Pienso', '❓ Me pregunto'], d: [['', '', ''], ['', '', ''], ['', '', '']] }] },
      { m: 'pensativa', t: 'Cuando termines la tabla, un espermatozoide te traerá unas preguntas. Respóndelas en tu cuaderno. ¡Atentos!', a: [{ k: 'col', i: '🏊', h: 'Las preguntas del espermatozoide', x: 'Las respondo en mi cuaderno' }] },
      { m: 'genial', t: '¡A descubrir cómo empieza la vida!', a: [{ k: 'ok', x: '🌱 Todo empieza con una sola célula' }] }],
    '4-2': [
      { m: 'hola', t: 'Ahora leemos la ficha del primer trimestre. Cada uno lee en silencio y subraya las ideas importantes.', a: [{ k: 'tag', x: '👤 Individual · Cuaderno' }, { k: 'tit', x: '📖 El primer trimestre' }] },
      { m: 'pensativa', t: 'La ficha está organizada por etapas: semanas uno y dos, tres y cuatro, cinco a ocho, y nueve a trece.', a: [{ k: 'chips', x: ['Sem. 1–2', 'Sem. 3–4', 'Sem. 5–8', 'Sem. 9–13'] }] },
      { m: 'idea', t: 'En tu cuaderno escribe, con tus palabras, qué sucede en cada etapa. Ideas cortas, no copies todo.', a: [{ k: 'tabla', c: ['Etapa', '¿Qué sucede?'], d: [['Semanas 1 y 2', ''], ['Semanas 3 y 4', ''], ['Semanas 5 a 8', ''], ['Semanas 9 a 13', '']] }] },
      { m: 'genial', t: 'Usa palabras científicas: cigoto, embrión, feto, placenta. ¡Estas ideas las usarás en tu papelote!', a: [{ k: 'ok', x: '✍️ Sintetizar no es copiar' }] }],
    '4-3': [
      { m: 'hola', t: 'Ahora trabajamos en equipo: organizaremos el primer trimestre en un papelote, con mucha creatividad.', a: [{ k: 'tag', x: '👥 En equipo · Papelote' }] },
      { m: 'idea', t: 'Pueden hacer una línea de tiempo, un organizador gráfico, una historieta o un calendario del bebé.', a: [{ k: 'chips', x: ['➡️ Línea de tiempo', '🗂️ Organizador', '💬 Historieta', '📅 Calendario'] }] },
      { m: 'pensativa', t: 'Usen las ideas que anotaron. Cada etapa debe tener sus semanas y lo que sucede.', a: [{ k: 'fila', n: 1, i: '📓', x: 'Juntamos nuestras ideas' }, { k: 'fila', n: 2, i: '🎨', x: 'Organizamos el papelote' }, { k: 'fila', n: 3, i: '✅', x: 'Revisamos con la tabla' }] },
      { m: 'decidida', t: 'Antes de exponer, revisen su trabajo con la tabla del equipo. Luego cada integrante explica una etapa.', a: [{ k: 'ok', x: '🎤 ¡Todos exponemos!' }] }],
    '5-1': [
      { m: 'hola', t: '¡Llegó la caja sorpresa! Cada uno saca una tarjeta de fruta y la pegamos en la pizarra.', a: [{ k: 'tag', x: '👤 Individual · Cuaderno' }, { k: 'tit', x: '🎁 La caja sorpresa de las frutas' }, { k: 'chips', x: ['🍋', '🥑', '🍌', '🌽', '🥦', '🍈', '🍍', '🍉'] }] },
      { m: 'curiosa', t: 'Observa bien las frutas de la pizarra y copia esta tabla en tu cuaderno: escribe lo que ves, lo que piensas y lo que te preguntas.', a: [{ k: 'tabla', c: ['👀 Veo', '💭 Pienso', '❓ Me pregunto'], d: [['', '', ''], ['', '', ''], ['', '', '']] }] },
      { m: 'pensativa', t: '¿Qué tendrán que ver estas frutas con el bebé? ¡Pronto lo descubriremos!', a: [{ k: 'ok', x: '🍉 ¿Qué tendrán que ver con el bebé?' }] }],
    '5-2': [
      { m: 'hola', t: 'Ahora leemos la ficha del segundo y del tercer trimestre, hasta el parto. Subraya lo importante.', a: [{ k: 'tag', x: '👤 Individual · Cuaderno' }, { k: 'tit', x: '📖 Segundo y tercer trimestre' }] },
      { m: 'pensativa', t: 'Anota en tu cuaderno qué sucede en cada etapa: de la catorce a la veinte, de la veintiuno a la veintisiete, y así hasta el parto.', a: [{ k: 'tabla', c: ['Etapa', '¿Qué sucede?'], d: [['Sem. 14 a 20', ''], ['Sem. 21 a 27', ''], ['Sem. 28 a 35', ''], ['Sem. 36 a 39', ''], ['Sem. 40: el parto', '']] }] },
      { m: 'genial', t: 'Usa palabras científicas: surfactante, fontanelas, contracciones, cordón umbilical.', a: [{ k: 'ok', x: '✍️ Ideas cortas, con tus palabras' }] }],
    '5-3': [
      { m: 'hola', t: 'En equipo organizaremos el segundo y el tercer trimestre, y el parto, en un papelote.', a: [{ k: 'tag', x: '👥 En equipo · Papelote' }] },
      { m: 'idea', t: 'Pueden hacer una línea de tiempo con frutas, una historieta, un organizador gráfico o el diario del bebé.', a: [{ k: 'chips', x: ['🍌 Línea con frutas', '💬 Historieta', '🗂️ Organizador', '📔 Diario del bebé'] }] },
      { m: 'decidida', t: 'Revisen su papelote con la tabla del equipo, y luego cada integrante expone una etapa.', a: [{ k: 'ok', x: '🎤 ¡Todos exponemos!' }] }],
    '6-1': [
      { m: 'hola', t: 'Hoy vamos a ver un video sobre las tecnologías perinatales: herramientas sencillas que ayudan a cuidar a la mamá y al bebé.', a: [{ k: 'tag', x: '👤 Individual · Cuaderno' }, { k: 'tit', x: '📺 Observamos el video' }] },
      { m: 'curiosa', t: 'Fíjate en cada herramienta: cómo se llama, para qué sirve y en qué momento se usa.', a: [{ k: 'chips', x: ['📅 Gestograma', '📏 Cinta obstétrica', '🩺 Estetoscopio de Pinard', '🖐️ Dilatómetro', '👶 Cinta neonatal'] }] },
      { m: 'pensativa', t: 'Después del video, copia las preguntas en tu cuaderno y respóndelas con lo que viste.', a: [{ k: 'tabla', c: ['Pregunta', 'Mi respuesta'], d: [['¿Para qué sirve el gestograma?', ''], ['¿Qué mide la cinta obstétrica?', ''], ['¿Qué mide el dilatómetro?', '']] }] },
      { m: 'genial', t: '¡A ver el video con mucha atención!', a: [{ k: 'ok', x: '📺 ¡Ojos atentos!' }] }],
    '6-2': [
      { m: 'hola', t: 'Ahora, en equipo, hacemos la tabla de las herramientas que cuidan la vida en el embarazo, el parto y con el recién nacido.', a: [{ k: 'tag', x: '👥 En equipo · Cuaderno' }, { k: 'tit', x: '🩺 Las herramientas que cuidan la vida' }] },
      { m: 'idea', t: 'Para cada herramienta escriban para qué sirve, cuándo se usa y qué ventaja tiene.', a: [{ k: 'tabla', c: ['Herramienta', '¿Para qué sirve?', '¿Cuándo?', 'Ventaja'], d: [['Gestograma', '', '', ''], ['Estetoscopio de Pinard', '', '', ''], ['Dilatómetro', '', '', '']] }] },
      { m: 'decidida', t: 'Por ejemplo: el estetoscopio de Pinard sirve para escuchar los latidos del bebé, se usa en el embarazo y no necesita baterías.', a: [{ k: 'ok', x: '💡 Usen lo que vieron en el video' }] },
      { m: 'genial', t: 'Revisen su tabla con la autoevaluación y prepárense para explicarla. ¡Juntos aprendemos más!', a: [{ k: 'ok', x: '👥 ¡A trabajar en equipo!' }] }],
    '7-1': [
      { m: 'hola', t: '¡Llegó el momento de planificar nuestro póster científico! Trabajamos en equipo y en el cuaderno.', a: [{ k: 'tag', x: '👥 En equipo · Cuaderno' }, { k: 'tit', x: '🧩 Las partes de nuestro póster' }] },
      { m: 'curiosa', t: 'Miren este cuadro: son las partes que tendrá nuestro póster.', a: [{ k: 'chips', x: ['📌 Título', '👥 Integrantes', '🔬 Introducción', '🖼️ Imágenes', '➡️ Flechas', '💡 Ideas clave', '✅ Conclusión', '📚 Fuentes'] }] },
      { m: 'idea', t: 'Por ejemplo: en el título irá un título creativo y grande. En las imágenes, dibujos con su nombre.', a: [{ k: 'tabla', c: ['Parte', '¿Qué irá aquí?'], d: [['📌 Título', 'Un título creativo y grande'], ['🖼️ Imágenes', 'Dibujos con su nombre'], ['📚 Fuentes', 'De dónde sacamos la información']] }] },
      { m: 'pensativa', t: 'Ahora copien el cuadro y escriban, de forma general, qué irá en cada parte de su póster.', a: [{ k: 'ok', x: '✍️ En nuestro póster irá…' }] },
      { m: 'genial', t: '¡Pongan todas sus ideas, futuros científicos!', a: [{ k: 'ok', x: '👥 ¡Todos aportan!' }] }],
    '7-2': [
      { m: 'hola', t: 'Ahora les mostraré el póster de otro equipo. Obsérvenlo con mucha atención.', a: [{ k: 'tag', x: '👥 En equipo · Cuaderno' }, { k: 'tit', x: '🔍 Revisamos un póster' }] },
      { m: 'curiosa', t: '¿Este póster cumple con el trabajo? Revisen parte por parte.', a: [{ k: 'chips', x: ['📌 ¿Título claro?', '🖼️ ¿Imágenes con nombre?', '➡️ ¿Flechas?', '🔬 ¿Información correcta?', '📚 ¿Fuentes?'] }] },
      { m: 'pensativa', t: 'Copien el cuadro: si tiene cada parte, qué le falta y qué cambiarían.', a: [{ k: 'tabla', c: ['Parte', '¿La tiene?', '¿Qué cambiarían?'], d: [['Título claro', '', ''], ['Imágenes con nombre', '', ''], ['Información correcta', '', '']] }] },
      { m: 'decidida', t: 'Lean bien la información: ¿todo lo que dice es correcto?', a: [{ k: 'ok', x: '👀 ¡Ojos de científico!' }] }],
    '7-3': [
      { m: 'hola', t: 'Ahora, ¡a hacer la primera versión de nuestro póster!', a: [{ k: 'tag', x: '👥 En equipo · Hoja' }, { k: 'tit', x: '✏️ Primera versión del póster' }] },
      { m: 'idea', t: 'Usen su cuadro de partes y no repitan los errores del póster que revisamos.', a: [{ k: 'chips', x: ['📌 Título creativo', '🖼️ Imágenes con nombre', '➡️ Flechas', '💡 3 ideas clave', '✅ Conclusión', '📚 Fuentes'] }] },
      { m: 'decidida', t: 'Es un borrador: se puede corregir. La próxima clase hacemos la versión final.', a: [{ k: 'ok', x: '✏️ Primero el borrador' }] },
      { m: 'genial', t: '¡Cada integrante cumple su rol! ¡Manos a la obra!', a: [{ k: 'ok', x: '👥 ¡A trabajar en equipo!' }] }],
    '8-1': [
      { m: 'hola', t: '¡Hoy es el gran día! Toda la clase es para hacer la versión final de nuestro póster.', a: [{ k: 'tag', x: '👥 En equipo · Toda la clase' }, { k: 'tit', x: '🎨 La segunda versión del póster' }] },
      { m: 'idea', t: 'Usen su primera versión, el cuadro de partes y las imágenes que trajeron.', a: [{ k: 'chips', x: ['✏️ Primera versión', '🧩 Cuadro de partes', '🖼️ Imágenes'] }] },
      { m: 'pensativa', t: 'Recuerden la rúbrica: explicar es dar razones. No solo nombren los órganos: expliquen cómo funcionan.', a: [{ k: 'ok', x: '🔬 ¡Explicar es dar razones!' }] },
      { m: 'decidida', t: 'Antes de terminar, revisen la lista de cotejo: título, imágenes con nombre, flechas, información correcta, conclusión y fuentes.', a: [{ k: 'tabla', c: ['Revisamos', '✔️'], d: [['📌 Título grande', ''], ['➡️ Flechas', ''], ['📚 Fuentes', '']] }] },
      { m: 'genial', t: 'El profe y yo visitaremos cada mesa. ¡Manos a la obra, científicos!', a: [{ k: 'ok', x: '🎨 ¡A crear!' }] }],
    '9-1': [
      { m: 'hola', t: '¡Bienvenidos a la conferencia científica! Hoy cada equipo expone su póster.', a: [{ k: 'tag', x: '👥 En equipo · Exposición' }, { k: 'tit', x: '🎤 Conferencia científica' }] },
      { m: 'pensativa', t: 'Todos participan según su rol: el speaker, el líder, el designer, el timer y el helper.', a: [{ k: 'tabla', c: ['Rol', '¿Qué hará?'], d: [['🎤 Speaker', 'Presenta el tema'], ['🎨 Designer', 'Explica las imágenes'], ['🧰 Helper', 'Menciona las fuentes']] }] },
      { m: 'idea', t: 'Hablen fuerte y claro, miren al público y señalen las imágenes del póster.', a: [{ k: 'chips', x: ['🗣️ Fuerte y claro', '👀 Mirar al público', '👉 Señalar imágenes'] }] },
      { m: 'genial', t: '¡Explicar es dar razones! ¡Mucha suerte, científicos!', a: [{ k: 'ok', x: '🎤 ¡A exponer!' }] }],
    '9-2': [
      { m: 'hola', t: 'Cuando otro equipo expone, nosotros somos el público científico.', a: [{ k: 'tag', x: '👤 Individual · Cuaderno' }, { k: 'tit', x: '👂 Somos público científico' }] },
      { m: 'curiosa', t: 'Escuchen con respeto y anoten algo nuevo que aprendieron y una pregunta para el equipo.', a: [{ k: 'tabla', c: ['Equipo', 'Algo nuevo', 'Mi pregunta'], d: [['', '', ''], ['', '', '']] }] },
      { m: 'genial', t: 'Un buen público escucha en silencio y pregunta con respeto.', a: [{ k: 'ok', x: '🤫 Escuchamos con respeto' }] }],
    '10-1': [
      { m: 'hola', t: '¡Hoy creamos un cómic! Contaremos el viaje de la vida, desde la fecundación hasta el nacimiento.', a: [{ k: 'tag', x: '👤 Individual · Cuaderno' }, { k: 'tit', x: '💬 Planificamos nuestro cómic' }] },
      { m: 'curiosa', t: 'Serán seis viñetas. Yo les digo qué pasa en cada una.', a: [{ k: 'chips', x: ['1️⃣ Se encuentran', '2️⃣ Fecundación', '3️⃣ Anidación', '4️⃣ Crece', '5️⃣ Controles', '6️⃣ ¡Nace!'] }] },
      { m: 'idea', t: 'Ustedes inventan lo que dicen los personajes. Por ejemplo: ¡Hola, soy el cigoto, la primera célula de un nuevo ser!', a: [{ k: 'tabla', c: ['Viñeta', '¿Qué dice?'], d: [['2️⃣ Fecundación', '¡Hola, soy el cigoto!'], ['6️⃣ ¡Nace!', '']] }] },
      { m: 'genial', t: '¡Usen palabras científicas en sus diálogos!', a: [{ k: 'ok', x: '🔬 Cigoto · útero · trimestre' }] }],
    '10-2': [
      { m: 'hola', t: 'Ahora dibujamos el cómic en una hoja, con nuestro plan.', a: [{ k: 'tag', x: '👤 Individual · Hoja' }, { k: 'tit', x: '🎨 Dibujamos nuestro cómic' }] },
      { m: 'idea', t: 'Pongan un título, las seis viñetas en orden, los globos de diálogo y, al final, un mensaje sobre el cuidado del cuerpo.', a: [{ k: 'chips', x: ['📌 Título', '🖼️ 6 viñetas', '💬 Globos', '💛 Mensaje de cuidado'] }] },
      { m: 'genial', t: 'No importa si no dibujan perfecto: ¡lo importante es que se entienda la historia!', a: [{ k: 'ok', x: '🎨 ¡A dibujar!' }] }],
  },
};
