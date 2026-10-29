// Molí explica · Molí cuenta, paso a paso y con su voz, cómo se hace una actividad (Unidad 7, sesiones 6 a 12, actividades 1 y 2)
//  MoliExp.tiene(u, s, n, j) · MoliExp.html(n, j, x) · MoliExp.montar(el, alFinal) · MoliExp.mover(d) · MoliExp.parar()
//  Cada paso: m = cara de Molí, t = lo que dice (su voz está en audio/mx/u7-<sesión>-<actividad>-<paso>.mp3), a = piezas que aparecen en la pizarra
(() => {
  // piezas de la pizarra: tag (cómo se trabaja) · tit (idea grande) · col (columna de un cuadro) · fila (paso numerado) · chips · dato (operación) · ok / no / nota · graf (gráfico de barras)
  const TIT = { 6: 'Determinamos las variables', 7: 'Diseñamos y validamos la indagación', 8: 'Experimentamos con la levadura', 9: 'Procesamos los datos obtenidos', 10: 'Interpretamos patrones y diferencias', 11: 'Argumentamos nuestra conclusión', 12: 'Evaluamos nuestra capacidad para indagar' };
  const E = {
    '6-1': [
      { m: 'hola', t: '¡Hola! Soy Molí. En esta actividad, cada uno hará en su cuaderno el cuadro de variables. ¡Te explico cómo!', a: [{ k: 'tag', x: '📓 En tu cuaderno · Individual' }] },
      { m: 'idea', t: 'Primero, copia la pregunta y la hipótesis que sacó tu equipo cuando observamos la levadura.', a: [{ k: 'fila', n: 1, i: '❓', x: 'Copia la pregunta de tu equipo' }, { k: 'fila', n: 2, i: '💡', x: 'Copia la hipótesis de tu equipo' }] },
      { m: 'pensativa', t: 'Debajo, dibuja una tabla de doble entrada con dos columnas. En la primera, la variable independiente: lo que vamos a cambiar. ¡Solo una cosa!', a: [{ k: 'col', i: '🔄', h: 'VARIABLE INDEPENDIENTE', x: 'Lo que cambiamos · solo UNA cosa' }] },
      { m: 'curiosa', t: 'En la segunda, la variable dependiente: lo que vamos a medir, con qué instrumento y en qué unidad.', a: [{ k: 'col', i: '📏', h: 'VARIABLE DEPENDIENTE', x: 'Lo que medimos · con qué instrumento y en qué unidad' }] },
      { m: 'decidida', t: '¿Por qué se llama dependiente? ¡Porque depende de lo que cambiamos! Si cambia la variable independiente, cambia lo que medimos.', a: [{ k: 'tit', x: '🔄 VI cambia → 📏 la VD también cambia' }] },
      { m: 'genial', t: '¡Recuerda la regla de oro! Una sola cosa cambia, y una se mide con un instrumento. Mira el ejemplo y el contraejemplo que vienen.', a: [{ k: 'ok', x: '1 cosa cambia (VI) · 1 se mide con instrumento (VD)' }] }],
    '6-2': [
      { m: 'hola', t: 'Ahora trabajaremos en equipo, en un papelote. ¡Escuchen la historia de Don Pepe, el panadero!', a: [{ k: 'tag', x: '📜 Papelote · En equipo' }] },
      { m: 'curiosa', t: 'Don Pepe quería saber si con agua tibia la levadura infla más la masa del pan. Entonces hizo dos masas.', a: [{ k: 'tit', x: '🍞 ¿Con agua tibia se infla más la masa?' }] },
      { m: 'pensativa', t: 'La masa uno: agua fría, poquita levadura, y la dejó en la refrigeradora. La masa dos: agua tibia, mucha levadura, y la dejó al lado del horno. ¡La masa dos se infló más!', a: [{ k: 'col', i: '🧊', h: 'Masa 1', x: 'Agua fría · poca levadura · en la refrigeradora' }, { k: 'col', i: '🔥', h: 'Masa 2', x: 'Agua tibia · mucha levadura · al lado del horno' }] },
      { m: 'enojado', t: '¿Ven el error? Don Pepe cambió varias cosas a la vez, no solo el agua. ¡Así no sabe por qué se infló!', a: [{ k: 'no', x: 'Cambió el agua, la levadura y el lugar… ¡todo a la vez!' }] },
      { m: 'idea', t: 'En el papelote copien esta tabla de doble entrada. Arriba dice: la mezcla que hizo Don Pepe, y cómo debió hacerlo. En la primera fila va la masa uno, y en la segunda, la masa dos.', a: [{ k: 'tabla', c: ['La mezcla que hizo Don Pepe', 'Cómo debió hacerlo'], d: [['Masa 1:', ''], ['Masa 2:', '']], ult: { s: 5, f: ['✏️ Aquí dibujan la masa 1 de Don Pepe', '✏️ Aquí dibujan la masa 2 de Don Pepe'] } }] },
      { m: 'curiosa', t: 'En la fila de abajo, dibujen: a la izquierda la masa uno, y a la derecha la masa dos. Y encierren en rojo todo lo que Don Pepe cambió además del agua.', a: [] },
      { m: 'decidida', t: 'Al final completen la frase: en nuestros vasos con levadura, solo cambiaremos… y lo demás será igual. Cada uno la copia en su cuaderno.', a: [{ k: 'nota', x: 'Solo cambiaremos ________ y lo demás será igual: ________' }] }],
    '7-1': [
      { m: 'hola', t: 'Hoy cada equipo prepara, en un papelote, la lista de materiales para SU vaso con levadura.', a: [{ k: 'tag', x: '📜 Papelote · En equipo' }] },
      { m: 'curiosa', t: 'Recuerden: cada equipo investiga su propia causa. Puede ser la temperatura del agua, la cantidad de azúcar o la cantidad de levadura. Primero escriban su causa y el valor que les tocó.', a: [{ k: 'chips', x: ['🌡️ Temperatura', '🍬 Azúcar', '🟤 Levadura'] }, { k: 'nota', x: 'Nuestra causa: ________ · El valor que nos tocó: ________' }] },
      { m: 'pensativa', t: 'En el papelote hagan un cuadro de tres columnas: el material, para qué sirve, y cuánto usarán.', a: [{ k: 'col', i: '🧰', h: 'Material', x: '' }, { k: 'col', i: '❓', h: '¿Para qué sirve?', x: '' }, { k: 'col', i: '🥄', h: '¿Cuánto usaremos?', x: '' }] },
      { m: 'idea', t: 'Los materiales son: vaso, agua, azúcar, levadura, termómetro, regla y reloj.', a: [{ k: 'chips', x: ['🥛 Vaso', '💧 Agua', '🍬 Azúcar', '🟤 Levadura', '🌡️ Termómetro', '📏 Regla', '⏱️ Reloj'] }] },
      { m: 'decidida', t: '¡Muy importante! Solo cambia nuestra causa. Todo lo demás va en la misma cantidad que en los equipos que investigan nuestra misma causa. Así, después, podremos compartir y comparar datos.', a: [{ k: 'ok', x: 'Solo cambia NUESTRA causa · lo demás, igual que los equipos de la misma causa' }] },
      { m: 'genial', t: 'Cuando terminen, cada uno copia el cuadro en su cuaderno. ¡A trabajar!', a: [{ k: 'nota', x: '📓 Cada uno lo copia en su cuaderno' }] }],
    '7-2': [
      { m: 'hola', t: 'Ahora, cada uno en su cuaderno, escribirá los pasos del experimento que haremos la próxima clase.', a: [{ k: 'tag', x: '📓 En tu cuaderno · Individual' }] },
      { m: 'pensativa', t: 'Haz un cuadro de tres columnas: el número del paso, qué hacemos, y un dibujo.', a: [{ k: 'col', i: '🔢', h: 'Paso', x: '' }, { k: 'col', i: '✍️', h: '¿Qué hacemos?', x: '' }, { k: 'col', i: '✏️', h: 'Dibujo', x: '' }] },
      { m: 'idea', t: 'Escribe los pasos en orden: desde preparar el vaso, hasta medir la espuma.', a: [{ k: 'chips', x: ['🥛 Preparar el vaso', '➡️', '…', '➡️', '📏 Medir la espuma'] }] },
      { m: 'curiosa', t: 'Al lado de cada paso, haz un dibujito. ¡Así cualquiera entiende tu experimento!', a: [{ k: 'ok', x: 'Cada paso con su dibujito ✏️' }] },
      { m: 'decidida', t: 'Debajo, escribe tres cuidados para trabajar seguros.', a: [{ k: 'nota', x: '🦺 Mis 3 cuidados: 1) ______ 2) ______ 3) ______' }] },
      { m: 'genial', t: '¡Así, la próxima clase, tu equipo sabrá exactamente qué hacer!', a: [] }],
    '8-1': [
      { m: 'hola', t: '¡Llegó el día del experimento! Cada equipo prepara SU vaso. Primero comprobamos la mezcla, todavía sin levadura.', a: [{ k: 'tag', x: '🧪 En equipo · Un vaso · En el cuaderno' }] },
      { m: 'idea', t: 'Repartan los roles: responsable de condiciones, del tiempo, de la medición y del registro.', a: [{ k: 'chips', x: ['⚖️ Condiciones', '⏱️ Tiempo', '📏 Medición', '✍️ Registro'] }] },
      { m: 'pensativa', t: 'En el cuaderno copien el cuadro: su causa, el valor que les tocó, y las cantidades de agua, azúcar y levadura, y la temperatura.', a: [{ k: 'tabla', c: ['Causa', 'Valor', 'Agua', 'Azúcar', 'Levadura', 'Temp.'], d: [['', '', 'mL', 'g', 'g', '°C']] }] },
      { m: 'curiosa', t: 'Luego preparen la mezcla: midan el agua, agreguen el azúcar, comprueben la temperatura con el termómetro y marquen el nivel inicial en el vaso.', a: [{ k: 'fila', n: 1, i: '💧', x: 'Medir el agua (mL)' }, { k: 'fila', n: 2, i: '🍬', x: 'Agregar el azúcar (g)' }, { k: 'fila', n: 3, i: '🌡️', x: 'Comprobar la temperatura' }, { k: 'fila', n: 4, i: '🖊️', x: 'Marcar el nivel inicial' }] },
      { m: 'decidida', t: 'Revisen la seguridad: el agua, como máximo a treinta y cinco grados. El vaso estable. No acercar la cara a la mezcla. Y papel para limpiar derrames.', a: [{ k: 'ok', x: '🦺 Agua máx. 35 °C · vaso estable · no acercar el rostro · papel para derrames' }] },
      { m: 'genial', t: '¡Listo! Ahora sí, preparados para añadir la levadura.', a: [] }],
    '8-2': [
      { m: 'hola', t: 'Ahora viene lo más emocionante: añadimos la levadura y medimos la espuma.', a: [{ k: 'tag', x: '🧪 En equipo · En el cuaderno' }] },
      { m: 'decidida', t: 'Añadan la levadura, mezclen diez segundos, y el responsable del tiempo inicia el cronómetro.', a: [{ k: 'fila', n: 1, i: '🟤', x: 'Añadir la levadura' }, { k: 'fila', n: 2, i: '🥄', x: 'Mezclar 10 segundos' }, { k: 'fila', n: 3, i: '⏱️', x: '¡Inicia el cronómetro!' }] },
      { m: 'pensativa', t: 'En el cuaderno copien la tabla y midan la espuma a los cero, diez y veinte minutos: regla vertical, desde la línea inicial, con los ojos a la altura de la regla.', a: [{ k: 'tabla', c: ['Tiempo', 'Altura de la espuma (cm)', 'Lo que observamos'], d: [['0 min', '', ''], ['10 min', '', ''], ['20 min', '', '']] }] },
      { m: 'curiosa', t: 'A los veinte minutos, tres integrantes miden la misma espuma, cada uno sin mirar el dato del otro. Anoten las tres lecturas debajo de la tabla.', a: [{ k: 'chips', x: ['📏 Lectura 1', '📏 Lectura 2', '📏 Lectura 3'] }] },
      { m: 'idea', t: '¿Para qué tres lecturas? En la próxima clase compartiremos datos con los equipos de nuestra misma causa y sacaremos el promedio.', a: [{ k: 'nota', x: '🤝 Sesión 9: compartimos datos y sacamos promedios' }] },
      { m: 'genial', t: 'Si pasa algo raro, como un derrame, anótenlo debajo como incidencia. ¡Y cuiden su cuaderno: esos datos los usaremos en las próximas clases!', a: [{ k: 'ok', x: '⚠️ ¿Algo raro? Anótalo como incidencia · 📓 Cuida tus datos' }] }],
    '9-1': [
      { m: 'hola', t: 'Hoy trabajamos un criterio muy importante: organizar y procesar datos. Todo lo haremos en el cuaderno.', a: [{ k: 'tag', x: '⭐ Criterio: Organiza y procesa datos · Cuaderno' }] },
      { m: 'curiosa', t: 'Cada equipo probó un solo valor de su causa. Por eso, ¡compartimos datos! Júntense con los equipos que investigaron su misma causa.', a: [{ k: 'chips', x: ['🌡️ Temperatura', '🍬 Azúcar', '🟤 Levadura'] }, { k: 'tit', x: '🤝 Compartimos datos con nuestra misma causa' }] },
      { m: 'pensativa', t: 'Paso uno: nuestro equipo dicta su valor y sus tres lecturas. Paso dos: los otros equipos dictan las suyas. Paso tres: todos las copiamos en la tabla.', a: [{ k: 'fila', n: 1, i: '🗣️', x: 'Dictamos nuestro valor y lecturas' }, { k: 'fila', n: 2, i: '👂', x: 'Escuchamos a los otros equipos' }, { k: 'fila', n: 3, i: '✍️', x: 'Copiamos todo en la tabla' }] },
      { m: 'idea', t: 'Copien la tabla en el cuaderno: primero va nuestro equipo, y debajo los otros dos equipos.', a: [{ k: 'tabla', c: ['Equipo', 'Valor', 'L1', 'L2', 'L3'], d: [['Nuestro equipo', '', '', '', ''], ['Equipo ___', '', '', '', ''], ['Equipo ___', '', '', '', '']] }] },
      { m: 'decidida', t: 'Antes de seguir, revisen: ¿están los tres valores? ¿Cada uno con sus tres lecturas? ¿Todo en centímetros?', a: [{ k: 'chips', x: ['✅ 3 valores', '✅ 3 lecturas cada uno', '✅ En cm'] }] },
      { m: 'genial', t: '¡Ahora tienen tres valores para comparar! Con estos datos sacaremos los promedios.', a: [] }],
    '9-2': [
      { m: 'hola', t: 'Con los datos compartidos, cada uno calcula los promedios.', a: [{ k: 'tag', x: '⭐ Criterio: Organiza y procesa datos · Cuaderno' }] },
      { m: 'pensativa', t: 'Usa el andamio. Paso uno: suma las tres lecturas del mismo equipo. Paso dos: divide entre tres. Paso tres: escribe el resultado en centímetros, con un decimal.', a: [{ k: 'fila', n: 1, i: '➕', x: 'Suma las 3 lecturas' }, { k: 'fila', n: 2, i: '➗', x: 'Divide entre 3' }, { k: 'fila', n: 3, i: '📏', x: 'Escribe en cm (1 decimal)' }] },
      { m: 'genial', t: 'Por ejemplo: uno, más uno coma dos, más uno coma uno, es tres coma tres. Dividido entre tres: ¡uno coma uno centímetros!', a: [{ k: 'dato', x: '(1,0 + 1,2 + 1,1) ÷ 3 = 3,3 ÷ 3 = 1,1 cm' }] },
      { m: 'idea', t: 'Copia la tabla de doble entrada en tu cuaderno y haz un cálculo para cada equipo.', a: [{ k: 'nota', x: '___ + ___ + ___ = ___ → ___ ÷ 3 = ___ cm' }] },
      { m: 'curiosa', t: 'Después pasa los promedios a la tabla de doble entrada: a la izquierda los valores de tu causa, a la derecha la altura promedio. Y el título: altura de la espuma según… tu causa… a los veinte minutos.', a: [{ k: 'col', i: '🔄', h: 'Variable independiente', x: 'Valores de tu causa' }, { k: 'col', i: '📏', h: 'Variable dependiente', x: 'Altura promedio (cm)' }] },
      { m: 'decidida', t: '¡Cuiden bien su cuaderno! En la sesión diez construiremos el gráfico y analizaremos estos datos.', a: [{ k: 'ok', x: '➡️ Sesión 10: gráfico y análisis con esta tabla' }] }],
    '10-1': [
      { m: 'hola', t: 'Hoy seguimos con la tabla de doble entrada de la sesión nueve. Primero, cada uno construye su gráfico de barras en el cuaderno.', a: [{ k: 'tag', x: '⭐ Criterio: Organiza y procesa datos · Cuaderno' }] },
      { m: 'pensativa', t: 'En el eje horizontal, los tres valores de tu causa. En el eje vertical, la altura en centímetros, empezando en cero y de cero coma cinco en cero coma cinco.', a: [{ k: 'graf', x: ['Valor 1', 'Valor 2', 'Valor 3'] }, { k: 'chips', x: ['↔️ Valores de tu causa', '↕️ Altura (cm) · de 0,5 en 0,5'] }] },
      { m: 'idea', t: 'Dibuja una barra por cada valor, hasta su promedio. Píntala de un color y haz la leyenda.', a: [{ k: 'chips', x: ['📊 Barra = promedio', '🎨 Colores y leyenda'] }] },
      { m: 'curiosa', t: 'Ponle título con el andamio: altura de la espuma según… tu causa… a los veinte minutos.', a: [{ k: 'nota', x: '📝 «Altura de la espuma según ________ a los 20 minutos»' }] },
      { m: 'decidida', t: 'Al final revísalo con la lista: título, ejes, escala pareja, barras iguales a la tabla, colores y leyenda.', a: [{ k: 'ok', x: 'Título · ejes · escala · barras = tabla · colores · leyenda' }] },
      { m: 'genial', t: '¡Ya tienes tus datos en una tabla y en un gráfico! Ahora vamos a analizarlos.', a: [] }],
    '10-2': [
      { m: 'hola', t: 'Ahora somos detectives de datos: en equipo, en un papelote, comparamos los tres valores de nuestra causa.', a: [{ k: 'tag', x: '⭐ Criterio: Organiza y procesa datos · Papelote' }] },
      { m: 'pensativa', t: 'Para cada valor, escriban la altura inicial, la de los veinte minutos y el cambio: la de los veinte minutos menos la inicial.', a: [{ k: 'dato', x: 'Cambio = altura a los 20 min − altura inicial' }] },
      { m: 'curiosa', t: 'Encuentren la mayor y la menor altura, y calculen la diferencia.', a: [{ k: 'nota', x: 'La mayor fue ___ cm con ____; la menor, ___ cm con ____. Diferencia: ___ cm' }] },
      { m: 'idea', t: 'Ahora el patrón, con el andamio: cuando… aumenta, la altura de la espuma… Y den dos datos que lo demuestran.', a: [{ k: 'tit', x: '🔁 Cuando ____ aumenta, la espuma ____' }] },
      { m: 'decidida', t: '¿Hay algún dato que no sigue el patrón? ¡No se borra! Se revisa y se busca en las incidencias de la sesión ocho qué pasó.', a: [{ k: 'ok', x: '🧐 Dato inusual: no se borra, se revisa con las incidencias' }] },
      { m: 'genial', t: 'Al final, cada uno escribirá qué muestran la tabla y el gráfico, y hasta dónde llegan nuestros resultados.', a: [{ k: 'nota', x: 'La tabla y el gráfico muestran que ____. Lo sé porque ____. Solo para ____.' }] }],
    '11-1': [
      { m: 'hola', t: 'Hoy cada uno prepara su conclusión, en el cuaderno. Primero recuperamos lo que encontramos.', a: [{ k: 'tag', x: '🧑 Individual · En el cuaderno' }] },
      { m: 'pensativa', t: 'Escribe tu pregunta, el resultado principal y el patrón que encontraste.', a: [{ k: 'chips', x: ['❓ Pregunta', '🏆 Resultado', '🔁 Patrón'] }] },
      { m: 'idea', t: 'Ahora la información científica: la levadura es un ser vivo de una sola célula. Con agua y azúcar hace la fermentación, y libera dióxido de carbono.', a: [{ k: 'tit', x: '🟤 Levadura + 💧 agua + 🍬 azúcar → 🫧 dióxido de carbono' }] },
      { m: 'curiosa', t: 'El azúcar es su alimento. Con más levadura hay más células trabajando. Y una temperatura cálida la ayuda a trabajar más rápido.', a: [{ k: 'chips', x: ['🍬 Azúcar = alimento', '🟤 Más levadura = más células', '🌡️ Calor suave = más rápido'] }] },
      { m: 'decidida', t: 'En el cuadro, une cada información científica con un dato de tu experimento, y explica cómo ayuda a entender el resultado.', a: [{ k: 'col', i: '🔬', h: 'Información científica', x: '' }, { k: 'col', i: '📊', h: 'Dato del experimento', x: '' }, { k: 'col', i: '💬', h: '¿Cómo lo explica?', x: '' }] },
      { m: 'genial', t: '¡Así tus datos y la ciencia trabajan juntos!', a: [] }],
    '11-2': [
      { m: 'hola', t: 'Llegó el momento de la verdad: ¿nuestra hipótesis se cumplió?', a: [{ k: 'tag', x: '🧑 Individual · En el cuaderno' }] },
      { m: 'pensativa', t: 'En el cuadro compara lo que predijo tu hipótesis con lo que mostraron los resultados.', a: [{ k: 'col', i: '🔮', h: 'Mi hipótesis predijo', x: '' }, { k: 'col', i: '📊', h: 'Los resultados mostraron', x: '' }, { k: 'col', i: '⚖️', h: 'La hipótesis fue…', x: '' }] },
      { m: 'curiosa', t: 'Decide: la hipótesis fue respaldada, parcialmente respaldada, o no respaldada.', a: [{ k: 'chips', x: ['✅ Respaldada', '🟡 Parcialmente respaldada', '❌ No respaldada'] }] },
      { m: 'idea', t: '¡No pasa nada si no se cumplió! Los científicos también aprenden cuando su hipótesis no es respaldada.', a: [{ k: 'ok', x: 'Si no se cumplió, ¡también aprendimos algo!' }] },
      { m: 'decidida', t: 'Escribe tu conclusión con el andamio: responde la pregunta, usa dos datos, explica con la ciencia y di hasta dónde llegan tus resultados.', a: [{ k: 'nota', x: 'Los resultados ____ la hipótesis porque ____. A los 20 min, ____, mientras que ____. Esto se explica porque la levadura ____…' }] },
      { m: 'genial', t: '¡Ya eres un verdadero científico o científica!', a: [] }],
    '12-1': [
      { m: 'hola', t: 'Hoy demuestras todo lo que aprendiste, con una situación nueva. Trabajas solo, en tu cuaderno. ¡Tú puedes!', a: [{ k: 'tag', x: '🧑 Individual · Cuaderno · ⏱️ 28 minutos' }] },
      { m: 'pensativa', t: 'Lee con calma la situación de la panadería y la tarjeta científica que están en la pantalla.', a: [{ k: 'fila', n: '📖', i: '', x: 'Leo la situación y la tarjeta científica' }] },
      { m: 'idea', t: 'Bloque uno, en catorce minutos: describe el fenómeno, escribe tu pregunta, y tu hipótesis con: Si… entonces… porque…', a: [{ k: 'col', i: '👀', h: 'Fenómeno', x: '' }, { k: 'col', i: '❓', h: 'Pregunta', x: '' }, { k: 'col', i: '💡', h: 'Hipótesis', x: 'Si… entonces… porque…' }] },
      { m: 'curiosa', t: 'Bloque dos, en catorce minutos: organiza el diseño. La variable independiente con sus valores, la dependiente con su instrumento y unidad, y lo que se mantiene igual.', a: [{ k: 'chips', x: ['🔄 Variable independiente', '📏 Variable dependiente', '⚖️ Lo que no cambia'] }] },
      { m: 'decidida', t: 'Explica también por qué se hacen tres repeticiones, y escribe las medidas de seguridad.', a: [{ k: 'chips', x: ['🔁 ¿Por qué 3 repeticiones?', '🦺 Seguridad'] }] },
      { m: 'genial', t: '¡Es igual que nuestro experimento con la levadura! Respira y empieza.', a: [] }],
    '12-2': [
      { m: 'hola', t: 'Ahora los bloques tres y cuatro: trabajas con los datos de la pantalla y escribes la conclusión en tu cuaderno.', a: [{ k: 'tag', x: '🧑 Individual · Cuaderno · ⏱️ 29 minutos' }] },
      { m: 'pensativa', t: 'Bloque tres: copia la tabla y calcula los cuatro promedios. Muestra al menos un cálculo.', a: [{ k: 'dato', x: 'Promedio = (R1 + R2 + R3) ÷ 3' }] },
      { m: 'idea', t: 'Construye un gráfico de barras, con título, ejes con unidades y una escala pareja.', a: [{ k: 'graf', x: ['0 g', '5 g', '10 g', '15 g'] }] },
      { m: 'curiosa', t: 'Bloque cuatro: compara. Calcula la diferencia entre quince gramos y cero gramos a los veinte minutos. Y mira qué cambió entre los diez y los veinte minutos.', a: [{ k: 'chips', x: ['➖ 15 g − 0 g (a los 20 min)', '⏱️ ¿Qué cambió de 10 a 20 min?'] }] },
      { m: 'decidida', t: 'Escribe tu conclusión sustentada: responde la pregunta, usa dos datos y la tarjeta científica.', a: [{ k: 'chips', x: ['❓ Respuesta', '📊 2 datos', '🔬 Tarjeta científica'] }] },
      { m: 'genial', t: 'Revisa tu trabajo antes de entregar. ¡Estoy muy orgullosa de ti!', a: [] }],
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const tiene = (u, s, n, j) => !!(u && s && String(u.num) === '7' && TIT[n] && s.title === TIT[n] && E[n + '-' + j]);
  function pieza(p, k) {
    const d = `data-s="${k}"`;
    if (p.k === 'tag') return `<div class="mx-p mx-tag" ${d}>${esc(p.x)}</div>`;
    if (p.k === 'tit') return `<div class="mx-p mx-tit" ${d}>${esc(p.x)}</div>`;
    if (p.k === 'col') return `<div class="mx-p mx-col" ${d}><span>${p.i}</span><b>${esc(p.h)}</b>${p.x ? `<small>${esc(p.x)}</small>` : '<i></i><i></i>'}</div>`;
    if (p.k === 'fila') return `<div class="mx-p mx-fila" ${d}><span class="mx-n">${esc(p.n)}</span>${p.i ? `<span>${p.i}</span>` : ''}<b>${esc(p.x)}</b></div>`;
    if (p.k === 'chips') return `<div class="mx-p mx-chips" ${d}>${p.x.map(c => `<span>${esc(c)}</span>`).join('')}</div>`;
    if (p.k === 'tabla') return `<div class="mx-p mx-tabla" ${d}><table><tr>${p.c.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${p.d.map(f => `<tr>${f.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}${p.ult ? `<tr class="mx-tr mx-dib" data-s="${p.ult.s}">${p.ult.f.map(x => `<td>${esc(x)}</td>`).join('')}</tr>` : ''}</table></div>`;
    if (p.k === 'dato') return `<div class="mx-p mx-dato" ${d}>${esc(p.x)}</div>`;
    if (p.k === 'graf') return `<div class="mx-p mx-graf" ${d}><div class="mx-gb">${p.x.map((c, q) => `<div><i style="height:${30 + q * 55 / p.x.length}%;background:${['#60a5fa', '#34d399', '#fbbf24', '#f87171'][q % 4]}">?</i><small>${esc(c)}</small></div>`).join('')}</div></div>`;
    return `<div class="mx-p mx-${p.k}" ${d}>${p.k === 'ok' ? '✅ ' : p.k === 'no' ? '❌ ' : ''}${esc(p.x)}</div>`;
  }
  function html(n, j, x) {
    const P = E[n + '-' + j] || []; let pz = '', cols = '';                     // las columnas seguidas forman un cuadro
    const cierra = () => { if (cols) pz += `<div class="mx-cols">${cols}</div>`; cols = ''; };
    P.forEach((s, k) => s.a.forEach(p => { if (p.k === 'col') cols += pieza(p, k); else { cierra(); pz += pieza(p, k); } }));
    cierra();
    return `<div class="cv-sl mx" data-mxk="${n}-${j}" style="--c1:#0f766e;--c2:#0ea5e9">
      <div class="mx-h"><span class="cv-num">${j}</span><div><b>🎬 ¡Molí te explica!</b><small>Actividad ${j}${x && x.title ? ' · ' + esc(x.title) : ''}</small></div></div>
      <div class="mx-b"><div class="mx-mo"><div class="mx-bub"></div><img class="mx-img" src="img/moli/hola.webp" alt="Molí"></div><div class="mx-pz">${pz}</div></div>
      <div class="mx-ctl"><button type="button" data-mxb="-1">◀ Atrás</button><span class="mx-dots">${P.map(() => '<i></i>').join('')}</span><button type="button" data-mxb="0">🔊 Repetir</button><button type="button" data-mxb="1" class="mx-sig">Siguiente ▶</button></div></div>`;
  }
  let S = null;
  const audio = new Audio();
  audio.addEventListener('playing', () => S && S.el.classList.add('habla'));
  ['pause', 'ended', 'error'].forEach(t => audio.addEventListener(t, () => S && S.el.classList.remove('habla')));
  function hablar() { if (!S) return; try { audio.pause(); audio.src = `audio/mx/u7-${S.k}-${S.p}.mp3`; audio.currentTime = 0; audio.play().catch(() => {}); } catch (e) {} }
  function paso(n, voz) {
    if (!S) return; const P = E[S.k]; S.p = n; const st = P[n], el = S.el;
    el.querySelectorAll('.mx-p, .mx-tr').forEach(p => { const k = +p.dataset.s; p.classList.toggle('ver', k <= n); p.classList.toggle('nue', k === n); });
    const b = el.querySelector('.mx-bub'); b.textContent = st.t; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    el.querySelector('.mx-img').src = `img/moli/${st.m}.webp`;
    el.querySelectorAll('.mx-dots i').forEach((d, k) => { d.classList.toggle('on', k === n); d.classList.toggle('ya', k < n); });
    const z = el.querySelector('.mx-pz'); if (z.clientHeight) { let lo = .6, hi = 1.45; for (let q = 0; q < 8; q++) { const m = (lo + hi) / 2; z.style.fontSize = m + 'em'; if (z.scrollHeight <= z.clientHeight + 1) lo = m; else hi = m; } z.style.fontSize = lo + 'em'; }   // la pizarra llena su cuadro sin cortarse
    el.querySelector('.mx-sig').textContent = n === P.length - 1 ? 'Continuar ▶' : 'Siguiente ▶';
    if (voz) hablar(); else audio.pause();
  }
  function mover(d) { if (!S) return false; const n = S.p + d; if (n < 0 || n >= E[S.k].length) return false; paso(n, true); return true; }
  function montar(el, alFinal) {
    parar(); if (!el) return; S = { el, k: el.dataset.mxk, p: 0 };
    el.addEventListener('click', e => { const b = e.target.closest('[data-mxb]'); if (!b) return; e.stopPropagation(); const d = +b.dataset.mxb;
      if (!d) return hablar(); if (!mover(d)) { const nav = document.querySelector(`[data-cv="${d}"]`); nav && nav.click(); } });
    paso(alFinal ? E[S.k].length - 1 : 0, !alFinal);
  }
  function parar() { try { audio.pause(); } catch (e) {} S = null; }
  window.MoliExp = { tiene, html, montar, mover, parar, activo: () => !!S && S.el.isConnected, E };
})();
