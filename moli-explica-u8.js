//  Explicaciones de Molí para la Unidad 8 (El sistema reproductor humano): actividades 1 y 2 de cada sesión.
//  Se cargan antes de moli-explica.js, que las une con las de la Unidad 7 (clave '8:n-j'). Voz: audio/mx/u8-n-j-paso.mp3
window.MX8 = {
  TIT: { 1: 'Conocemos el sistema reproductor humano', 2: 'Conocemos el sistema reproductor masculino', 3: 'Conocemos el sistema reproductor femenino y el ciclo ovárico', 4: 'La fecundación y el primer trimestre del embarazo', 5: 'El desarrollo del bebé en el segundo y tercer trimestre', 6: 'La tecnología en el embarazo: la ecografía', 7: 'Planificamos nuestros pósters científicos', 8: 'Elaboramos y exponemos nuestros pósters', 9: 'Celebramos lo aprendido: galería y reflexión' },
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
      { m: 'curiosa', t: 'En esta unidad aparecerán muchas palabras nuevas, como óvulo, espermatozoide o útero. ¡Vamos a guardarlas!', a: [{ k: 'chips', x: ['🥚 Óvulo', '🔵 Espermatozoide', '🫖 Útero', '🌸 Ovario'] }] },
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
      { m: 'curiosa', t: 'El ciclo dura unos veintiocho días y tiene tres fases: la fase folicular, la ovulación, y la fase lútea.', a: [{ k: 'chips', x: ['🌱 Folicular · días 1 a 13', '🥚 Ovulación · día 14', '🫖 Lútea · días 15 a 28'] }] },
      { m: 'idea', t: 'Copien el organizador en su papelote: qué le pasa al óvulo, a la pared del útero y a las trompas en cada etapa. Algunas casillas ya tienen una pista.', a: [{ k: 'tabla', c: ['', 'Días 1-5', 'Días 6-13', 'Día 14', 'Días 15-28'], d: [['Óvulo', '', 'Madura', '', ''], ['Pared del útero', 'Se desprende', '', '', 'Se engrosa'], ['Trompas', '', '', '', '']] }] },
      { m: 'decidida', t: 'Recuerden: si el óvulo no es fecundado, la pared del útero se desprende. Eso es la menstruación, y es natural.', a: [{ k: 'ok', x: '🌷 La menstruación es natural' }] },
      { m: 'genial', t: 'Al final, vuelvan a sus respuestas del inicio. ¿Qué cambió? ¡Eso es aprender!', a: [{ k: 'nota', x: '🔄 Antes pensaba… ahora sé…' }] }],
    '4-1': [
      { m: 'hola', t: 'Hoy empezamos con una imagen misteriosa. Obsérvala con atención y escribe en tu cuaderno: veo, pienso, me pregunto.', a: [{ k: 'tag', x: '👤 Individual · Cuaderno' }, { k: 'chips', x: ['👀 Veo', '💭 Pienso', '❓ Me pregunto'] }] },
      { m: 'curiosa', t: '¡Llegó la caja sorpresa! Un voluntario saca una tarjeta y la pega en la pizarra. Entre todos ordenamos la ruta de la vida.', a: [{ k: 'tit', x: '🎁 La caja sorpresa' }, { k: 'chips', x: ['Óvulo', 'Espermatozoide', 'Trompa', 'Cigoto', 'Blastocisto', 'Útero'] }] },
      { m: 'pensativa', t: 'Después vemos el video de la fecundación. Atentos: dónde se unen las células y qué se forma.', a: [{ k: 'fila', n: 1, i: '📺', x: 'Vemos el video' }, { k: 'fila', n: 2, i: '📍', x: '¿Dónde se unen?' }, { k: 'fila', n: 3, i: '🔬', x: '¿Qué se forma?' }] },
      { m: 'idea', t: 'Al final, cada uno completa el andamio en su cuaderno con tres preguntas.', a: [{ k: 'tabla', c: ['Pregunta', 'Mi respuesta'], d: [['¿Qué células se unen?', ''], ['¿Por qué se unen?', ''], ['¿Qué pasa después?', '']] }] },
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
      { m: 'curiosa', t: 'Cada uno tiene una tirita de siete centímetros. ¿Qué crees que representa?', a: [{ k: 'tag', x: '👤 Individual · Cuaderno' }, { k: 'tit', x: '📏 ¿Qué será esta tirita?' }] },
      { m: 'idea', t: '¡De la caja sorpresa salen frutas! Las ordenamos en la pizarra de la más pequeña a la más grande.', a: [{ k: 'chips', x: ['🍋', '🥑', '🍌', '🌽', '🥦', '🍈', '🍍', '🍉'] }] },
      { m: 'pensativa', t: 'En tu cuaderno escribe tu predicción: qué representa la tirita, el orden de las frutas y cuánto mide el bebé al nacer.', a: [{ k: 'tabla', c: ['Pregunta', 'Mi respuesta'], d: [['¿Qué representa la tirita?', ''], ['¿Orden de las frutas?', ''], ['¿Cuánto mide al nacer?', '']] }] },
      { m: 'genial', t: '¡Después lo comprobamos juntos!', a: [{ k: 'ok', x: '🍉 ¡A comprobar!' }] }],
    '5-2': [
      { m: 'hola', t: 'Ahora leemos la ficha del segundo y del tercer trimestre, hasta el parto. Subraya lo importante.', a: [{ k: 'tag', x: '👤 Individual · Cuaderno' }, { k: 'tit', x: '📖 Segundo y tercer trimestre' }] },
      { m: 'pensativa', t: 'Anota en tu cuaderno qué sucede en cada etapa: de la catorce a la veinte, de la veintiuno a la veintisiete, y así hasta el parto.', a: [{ k: 'tabla', c: ['Etapa', '¿Qué sucede?'], d: [['Sem. 14 a 20', ''], ['Sem. 21 a 27', ''], ['Sem. 28 a 35', ''], ['Sem. 36 a 39', ''], ['Sem. 40: el parto', '']] }] },
      { m: 'genial', t: 'Usa palabras científicas: surfactante, fontanelas, contracciones, cordón umbilical.', a: [{ k: 'ok', x: '✍️ Ideas cortas, con tus palabras' }] }],
    '5-3': [
      { m: 'hola', t: 'En equipo organizaremos el segundo y el tercer trimestre, y el parto, en un papelote.', a: [{ k: 'tag', x: '👥 En equipo · Papelote' }] },
      { m: 'idea', t: 'Pueden hacer una línea de tiempo con frutas, una historieta, un organizador gráfico o el diario del bebé.', a: [{ k: 'chips', x: ['🍌 Línea con frutas', '💬 Historieta', '🗂️ Organizador', '📔 Diario del bebé'] }] },
      { m: 'decidida', t: 'Revisen su papelote con la tabla del equipo, y luego cada integrante expone una etapa.', a: [{ k: 'ok', x: '🎤 ¡Todos exponemos!' }] }],
    '6-1': [
      { m: 'curiosa', t: 'Hoy jugamos: ¡adivina sin mirar! Un voluntario toca con un palito el objeto escondido en la caja y describe su forma.', a: [{ k: 'tag', x: '👤 Individual · Cuaderno' }, { k: 'tit', x: '🔍 ¡Adivina sin mirar!' }] },
      { m: 'idea', t: 'Así funciona la ecografía: no mira con luz, sino con ondas que rebotan y forman una imagen.', a: [{ k: 'chips', x: ['🔊 Ultrasonido', '🔁 Rebota', '🖥️ Imagen'] }] },
      { m: 'pensativa', t: 'Vemos el video de las ecografías y cada uno responde en su cuaderno.', a: [{ k: 'tabla', c: ['Pregunta', 'Mi respuesta'], d: [['¿Cómo funciona?', ''], ['¿Para qué en el 1.er trimestre?', ''], ['¿En el 2.°?', ''], ['¿En el 3.er?', '']] }] },
      { m: 'genial', t: '¡La ciencia nos ayuda a cuidar la vida!', a: [{ k: 'ok', x: '🩺 Una tecnología segura' }] }],
    '6-2': [
      { m: 'hola', t: 'En equipo, saquen una tecnología de la caja sorpresa: ecografía, incubadora, monitor fetal o vacunas.', a: [{ k: 'tag', x: '👥 En equipo · Cuaderno' }, { k: 'chips', x: ['🩻 Ecografía', '🍼 Incubadora', '💓 Monitor fetal', '💉 Vacunas'] }] },
      { m: 'pensativa', t: 'Escriban sus consecuencias positivas, sus cuidados, y una opinión fundamentada con una fuente.', a: [{ k: 'nota', x: 'Opinamos que ____ porque ____. Según ____, ____.' }] },
      { m: 'decidida', t: 'El portavoz presenta su opinión. ¡Y recuerden traer imágenes para el póster!', a: [{ k: 'ok', x: '🖼️ Imágenes para el póster' }] }],
    '7-1': [
      { m: 'hola', t: '¡Llegó el momento del reto! Hoy planificamos nuestros pósters científicos. Trabajamos en equipo y en el cuaderno.', a: [{ k: 'tag', x: '👥 En equipo · Cuaderno' }] },
      { m: 'curiosa', t: 'Primero observemos un póster científico modelo. ¿Qué partes tiene?', a: [{ k: 'chips', x: ['📌 Título', '🖼️ Imágenes', '✍️ Textos cortos', '➡️ Flechas', '📚 Fuentes'] }] },
      { m: 'pensativa', t: 'Fíjense en cómo se conectan las imágenes: con flechas y títulos que explican la relación.', a: [{ k: 'tit', x: '🔗 Imágenes conectadas' }] },
      { m: 'idea', t: 'Copien el cuadro y describan qué tiene el póster modelo en cada parte.', a: [{ k: 'tabla', c: ['Parte del póster', '¿Qué tiene?'], d: [['Título', ''], ['Imágenes', ''], ['Textos cortos', ''], ['Flechas', ''], ['Fuentes', '']] }] },
      { m: 'decidida', t: 'Un buen póster se entiende de lejos: título grande, imágenes conectadas y poco texto.', a: [{ k: 'ok', x: '👀 ¡Que se entienda de lejos!' }] },
      { m: 'genial', t: '¡Observen bien, futuros científicos!', a: [] }],
    '7-2': [
      { m: 'hola', t: 'Ahora cada equipo hará el boceto de sus dos pósters, en el cuaderno.', a: [{ k: 'tag', x: '👥 En equipo · Cuaderno' }] },
      { m: 'curiosa', t: 'El póster uno describe los sistemas reproductores masculino y femenino, y el ciclo ovárico. El póster dos describe tecnologías en la fecundación, el embarazo o el parto.', a: [{ k: 'col', i: '🧬', h: 'Póster 1', x: 'Sistemas + ciclo ovárico' }, { k: 'col', i: '🩺', h: 'Póster 2', x: 'Tecnología y vida' }] },
      { m: 'pensativa', t: 'Para cada póster, decidan: el título, tres ideas clave, las imágenes que usarán, y quién hará cada parte.', a: [{ k: 'tabla', c: ['', 'Póster 1', 'Póster 2'], d: [['Título', '', ''], ['3 ideas clave', '', ''], ['Imágenes', '', ''], ['¿Quién hace qué?', '', '']] }] },
      { m: 'idea', t: 'Usen todo lo que trabajaron: el diccionario científico, los cuadros y las fichas.', a: [{ k: 'chips', x: ['📖 Diccionario', '📓 Cuadros', '📄 Fichas'] }] },
      { m: 'decidida', t: 'Dibujen el boceto en el cuaderno: dónde irá el título, las imágenes y las flechas.', a: [{ k: 'ok', x: '✏️ Boceto antes del póster final' }] },
      { m: 'genial', t: '¡La próxima clase lo hacemos realidad!', a: [] }],
    '8-1': [
      { m: 'hola', t: '¡Hoy es el gran día! Elaboramos nuestros pósters científicos en equipo.', a: [{ k: 'tag', x: '👥 En equipo · Póster' }] },
      { m: 'curiosa', t: 'Usen su boceto y las imágenes que trajeron. Cada uno cumple su parte.', a: [{ k: 'chips', x: ['✏️ Boceto', '🖼️ Imágenes', '🤝 Cada uno su parte'] }] },
      { m: 'pensativa', t: 'Recuerden la rúbrica: explicar es dar razones. No solo nombren los órganos: expliquen cómo funcionan.', a: [{ k: 'tit', x: '⭐ Explica el saber científico' }] },
      { m: 'idea', t: 'Antes de terminar, revisen la lista de cotejo: título, imágenes conectadas, lenguaje científico, información correcta y fuentes.', a: [{ k: 'tabla', c: ['Revisamos', '✔️'], d: [['Título claro', ''], ['Imágenes con flechas', ''], ['Lenguaje científico', ''], ['Información correcta', ''], ['Fuentes', '']] }] },
      { m: 'decidida', t: 'El profe visitará cada mesa. ¡Aprovechen para preguntar!', a: [{ k: 'ok', x: '🙋 ¿Dudas? Pregunta al profe' }] },
      { m: 'genial', t: '¡Manos a la obra, científicos!', a: [] }],
    '8-2': [
      { m: 'hola', t: 'Ahora, ¡conferencia científica! Cada equipo expone sus pósters.', a: [{ k: 'tag', x: '👥 En equipo · Exposición' }] },
      { m: 'pensativa', t: 'Organicen quién explica cada parte. Todos participan según su rol.', a: [{ k: 'tabla', c: ['Rol', '¿Quién?', '¿Qué explicará?'], d: [['Portavoz', '', ''], ['Coordinador', '', ''], ['Secretario', '', ''], ['Crítico', '', '']] }] },
      { m: 'idea', t: 'Hablen fuerte y claro, miren al público y señalen las imágenes del póster.', a: [{ k: 'chips', x: ['🗣️ Fuerte y claro', '👀 Mirar al público', '👉 Señalar imágenes'] }] },
      { m: 'curiosa', t: 'El público escucha con respeto, y al final puede hacer preguntas.', a: [{ k: 'ok', x: '👂 Escuchamos con respeto' }] },
      { m: 'decidida', t: 'Al terminar, respondan: ¿qué conocimientos son nuevos para ti? ¿Qué te gustaría investigar?', a: [{ k: 'nota', x: '💭 ¿Qué es nuevo para mí? ¿Qué quiero investigar?' }] },
      { m: 'genial', t: '¡Son unos verdaderos científicos! Estoy muy orgulloso.', a: [] }],
    '9-1': [
      { m: 'hola', t: '¡Última sesión del año! Hoy celebramos lo aprendido con una galería de pósters. Trabajamos en equipo y en el cuaderno.', a: [{ k: 'tag', x: '👥 En equipo · Cuaderno' }] },
      { m: 'curiosa', t: 'Los pósters están pegados en el aula, como en un museo. Cada equipo recorrerá la galería.', a: [{ k: 'tit', x: '🖼️ Galería de pósters' }] },
      { m: 'pensativa', t: 'Para cada póster escriban tres estrellas: tres cosas que están muy bien. Y un deseo: una idea para mejorar.', a: [{ k: 'col', i: '⭐', h: '3 estrellas', x: 'Lo que hicieron muy bien' }, { k: 'col', i: '🌠', h: '1 deseo', x: 'Una idea para mejorar' }] },
      { m: 'idea', t: 'Copien el cuadro en el cuaderno, con una fila para cada póster que visiten.', a: [{ k: 'tabla', c: ['Póster del equipo', '⭐⭐⭐', '🌠'], d: [['', '', ''], ['', '', ''], ['', '', '']] }] },
      { m: 'decidida', t: 'Opinamos con respeto: primero lo bueno, después el deseo.', a: [{ k: 'ok', x: '💛 Respeto siempre' }] },
      { m: 'genial', t: '¡Disfruten el museo científico de su aula!', a: [] }],
    '9-2': [
      { m: 'hola', t: 'Ahora, cada uno escribirá su carta de científico, en su cuaderno.', a: [{ k: 'tag', x: '🧑 Individual · Cuaderno' }] },
      { m: 'curiosa', t: 'Es una carta para ti mismo, para darte cuenta de todo lo que lograste.', a: [{ k: 'tit', x: '✉️ Mi carta de científico' }] },
      { m: 'pensativa', t: 'Responde cuatro preguntas: qué aprendiste de nuevo, qué fue lo más difícil y cómo lo superaste, qué te gustaría investigar, y qué te gustó más de ciencia este año.', a: [{ k: 'fila', n: 1, i: '💡', x: '¿Qué aprendí de nuevo?' }, { k: 'fila', n: 2, i: '🧗', x: '¿Qué fue difícil y cómo lo superé?' }, { k: 'fila', n: 3, i: '🔭', x: '¿Qué me gustaría investigar?' }, { k: 'fila', n: 4, i: '❤️', x: '¿Qué me gustó más este año?' }] },
      { m: 'idea', t: 'Escribe con sinceridad. No hay respuestas buenas ni malas.', a: [{ k: 'ok', x: '💬 Con sinceridad' }] },
      { m: 'decidida', t: 'Si te sobra tiempo, completa la mini actividad: tu compromiso para cuidar y respetar tu cuerpo.', a: [{ k: 'nota', x: '⚡ Cuidar y respetar mi cuerpo es importante porque ________.' }] },
      { m: 'genial', t: '¡Gracias por este año lleno de ciencia! Fue un honor aprender con ustedes.', a: [{ k: 'dato', x: '🎉 ¡Gracias por un gran año!' }] }],
  },
};
