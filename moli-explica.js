// Molí explica · Molí cuenta, paso a paso y con su voz, cómo se hace una actividad (Unidad 7, sesiones 6 a 12, actividades 1 y 2)
//  MoliExp.tiene(u, s, n, j) · MoliExp.html(n, j, x) · MoliExp.montar(el, alFinal) · MoliExp.mover(d) · MoliExp.parar()
//  Cada paso: m = cara de Molí, t = lo que dice (su voz está en audio/mx/u7-<sesión>-<actividad>-<paso>.mp3), a = piezas que aparecen en la pizarra
(() => {
  // piezas de la pizarra: tag (cómo se trabaja) · tit (idea grande) · col (columna de un cuadro) · fila (paso numerado) · chips · dato (operación) · ok / no / nota · graf (gráfico de barras)
  const TIT = { 6: 'Determinamos las variables', 7: 'Diseñamos y validamos la indagación', 8: 'Experimentamos con la levadura', 9: 'Procesamos los datos obtenidos', 10: 'Interpretamos patrones y diferencias', 11: 'Argumentamos nuestra conclusión', 12: 'Evaluamos nuestra capacidad para indagar' };
  const E = {
    '6-1': [
      { m: 'hola', t: '¡Hola! Soy Molí. En esta actividad, cada uno hará en su cuaderno una tabla de variables. ¡Te explico cómo!', a: [{ k: 'tag', x: '📓 En tu cuaderno · Individual' }] },
      { m: 'idea', t: 'Primero, copia la pregunta y la hipótesis que sacó tu equipo cuando observamos la levadura.', a: [{ k: 'fila', n: 1, i: '❓', x: 'Copia la pregunta de tu equipo' }, { k: 'fila', n: 2, i: '💡', x: 'Copia la hipótesis de tu equipo' }] },
      { m: 'pensativa', t: 'Luego dibuja una tabla de tres columnas. En la primera, CAMBIAREMOS: la única cosa que vas a cambiar, y con qué instrumento.', a: [{ k: 'col', i: '🔄', h: 'CAMBIAREMOS', x: 'Solo UNA cosa y con qué instrumento' }] },
      { m: 'curiosa', t: 'En la segunda, MEDIREMOS: lo que vas a medir, con qué instrumento y en qué unidad.', a: [{ k: 'col', i: '📏', h: 'MEDIREMOS', x: 'Qué mido, con qué instrumento y en qué unidad' }] },
      { m: 'decidida', t: 'En la tercera, MANTENDREMOS IGUAL: escribe al menos cuatro cosas que no van a cambiar.', a: [{ k: 'col', i: '⚖️', h: 'MANTENDREMOS IGUAL', x: 'Al menos 4 cosas que no cambian' }] },
      { m: 'genial', t: '¡Recuerda la regla de oro! Una sola cosa cambia, una se mide y todo lo demás se queda igual. Mira el ejemplo y el contraejemplo que vienen.', a: [{ k: 'ok', x: '1 cosa cambia · 1 se mide · lo demás queda igual' }] }],
    '6-2': [
      { m: 'hola', t: 'Ahora trabajaremos en equipo, en un papelote. ¡Escuchen la historia de Don Pepe, el panadero!', a: [{ k: 'tag', x: '📜 Papelote · En equipo' }] },
      { m: 'curiosa', t: 'Don Pepe quería saber si con agua tibia la levadura infla más la masa del pan. Entonces hizo dos masas.', a: [{ k: 'tit', x: '🍞 ¿Con agua tibia se infla más la masa?' }] },
      { m: 'pensativa', t: 'La masa uno: agua fría, poquita levadura, y la dejó en la refrigeradora. La masa dos: agua tibia, mucha levadura, y la dejó al lado del horno. ¡La masa dos se infló más!', a: [{ k: 'col', i: '🧊', h: 'Masa 1', x: 'Agua fría · poca levadura · en la refrigeradora' }, { k: 'col', i: '🔥', h: 'Masa 2', x: 'Agua tibia · mucha levadura · al lado del horno' }] },
      { m: 'enojado', t: '¿Ven el error? Don Pepe cambió varias cosas a la vez. En el papelote dibujen las dos masas y encierren en rojo lo que cambió además del agua.', a: [{ k: 'no', x: 'Cambió el agua, la levadura y el lugar… ¡todo a la vez!' }] },
      { m: 'idea', t: 'Después escriban cómo debió hacerlo Don Pepe, para saber si de verdad fue por el agua tibia.', a: [{ k: 'fila', n: '✍️', i: '', x: '¿Cómo debió hacerlo Don Pepe?' }] },
      { m: 'decidida', t: 'Al final completen la frase: en nuestros vasos con levadura, solo cambiaremos… y lo demás será igual. Cada uno la copia en su cuaderno.', a: [{ k: 'nota', x: 'Solo cambiaremos ________ y lo demás será igual: ________' }] }],
    '7-1': [
      { m: 'hola', t: 'Hoy cada equipo prepara, en un papelote, la lista de materiales para SU vaso con levadura.', a: [{ k: 'tag', x: '📜 Papelote · En equipo' }] },
      { m: 'curiosa', t: 'Recuerden: a cada equipo le tocó un agua diferente. Fría, tibia o caliente.', a: [{ k: 'chips', x: ['🧊 Fría', '🌤️ Tibia', '🔥 Caliente'] }] },
      { m: 'pensativa', t: 'En el papelote hagan un cuadro de tres columnas: el material, para qué sirve, y cuánto usarán.', a: [{ k: 'col', i: '🧰', h: 'Material', x: '' }, { k: 'col', i: '❓', h: '¿Para qué sirve?', x: '' }, { k: 'col', i: '🥄', h: '¿Cuánto usaremos?', x: '' }] },
      { m: 'idea', t: 'Los materiales son: vaso, agua, azúcar, levadura, termómetro, regla y reloj.', a: [{ k: 'chips', x: ['🥛 Vaso', '💧 Agua', '🍬 Azúcar', '🟤 Levadura', '🌡️ Termómetro', '📏 Regla', '⏱️ Reloj'] }] },
      { m: 'decidida', t: '¡Muy importante! La cantidad de agua, de azúcar y de levadura debe ser IGUAL en todos los equipos. Solo cambia la temperatura del agua.', a: [{ k: 'ok', x: 'Misma cantidad de agua, azúcar y levadura en TODOS los equipos' }] },
      { m: 'genial', t: 'Cuando terminen, cada uno copia el cuadro en su cuaderno. ¡A trabajar!', a: [{ k: 'nota', x: '📓 Cada uno lo copia en su cuaderno' }] }],
    '7-2': [
      { m: 'hola', t: 'Ahora, cada uno en su cuaderno, escribirá los pasos del experimento que haremos la próxima clase.', a: [{ k: 'tag', x: '📓 En tu cuaderno · Individual' }] },
      { m: 'pensativa', t: 'Haz un cuadro de tres columnas: el número del paso, qué hacemos, y un dibujo.', a: [{ k: 'col', i: '🔢', h: 'Paso', x: '' }, { k: 'col', i: '✍️', h: '¿Qué hacemos?', x: '' }, { k: 'col', i: '✏️', h: 'Dibujo', x: '' }] },
      { m: 'idea', t: 'Escribe los pasos en orden: desde preparar el vaso, hasta medir la espuma.', a: [{ k: 'chips', x: ['🥛 Preparar el vaso', '➡️', '…', '➡️', '📏 Medir la espuma'] }] },
      { m: 'curiosa', t: 'Al lado de cada paso, haz un dibujito. ¡Así cualquiera entiende tu experimento!', a: [{ k: 'ok', x: 'Cada paso con su dibujito ✏️' }] },
      { m: 'decidida', t: 'Debajo, escribe tres cuidados para trabajar seguros.', a: [{ k: 'nota', x: '🦺 Mis 3 cuidados: 1) ______ 2) ______ 3) ______' }] },
      { m: 'genial', t: '¡Así, la próxima clase, tu equipo sabrá exactamente qué hacer!', a: [] }],
    '8-1': [
      { m: 'hola', t: '¡Llegó el día del experimento! Primero preparamos y comprobamos las mezclas. Todavía sin levadura.', a: [{ k: 'tag', x: '🧪 En equipo · Con tu ficha' }] },
      { m: 'idea', t: 'Antes de empezar, repartan los roles: responsable de condiciones, del tiempo, de la medición y del registro.', a: [{ k: 'chips', x: ['⚖️ Condiciones', '⏱️ Tiempo', '📏 Medición', '✍️ Registro'] }] },
      { m: 'pensativa', t: 'Rotulen los tres recipientes: quince grados, veinticinco grados y treinta y cinco grados.', a: [{ k: 'col', i: '🧊', h: '15 °C', x: 'Recipiente 1' }, { k: 'col', i: '🌤️', h: '25 °C', x: 'Recipiente 2' }, { k: 'col', i: '♨️', h: '35 °C', x: 'Recipiente 3' }] },
      { m: 'curiosa', t: 'En cada uno: midan cincuenta mililitros de agua, agreguen cinco gramos de azúcar, comprueben la temperatura con el termómetro y marquen el nivel inicial.', a: [{ k: 'fila', n: 1, i: '💧', x: '50 mL de agua' }, { k: 'fila', n: 2, i: '🍬', x: '5 g de azúcar' }, { k: 'fila', n: 3, i: '🌡️', x: 'Comprobar la temperatura' }, { k: 'fila', n: 4, i: '🖊️', x: 'Marcar el nivel inicial' }] },
      { m: 'decidida', t: 'Revisen la seguridad: el agua, como máximo a treinta y cinco grados. Recipientes estables. No acercar la cara a las mezclas. Y papel para limpiar derrames.', a: [{ k: 'ok', x: '🦺 Agua máx. 35 °C · recipientes estables · no acercar el rostro · papel para derrames' }] },
      { m: 'genial', t: 'Completen las partes uno y dos de su ficha. ¡Y listos para la levadura!', a: [{ k: 'nota', x: '📄 Completa las partes 1 y 2 de tu ficha' }] }],
    '8-2': [
      { m: 'hola', t: 'Ahora viene lo más emocionante: añadimos la levadura y medimos la espuma.', a: [{ k: 'tag', x: '🧪 En equipo · Con tu ficha' }] },
      { m: 'decidida', t: 'Añadan dos gramos de levadura a los tres recipientes, ¡al mismo tiempo! Y mezclen diez segundos.', a: [{ k: 'fila', n: 1, i: '🟤', x: '2 g de levadura en los 3, a la vez' }, { k: 'fila', n: 2, i: '🥄', x: 'Mezclar 10 segundos' }] },
      { m: 'curiosa', t: 'El responsable del tiempo inicia el cronómetro.', a: [{ k: 'fila', n: 3, i: '⏱️', x: '¡Inicia el cronómetro!' }] },
      { m: 'pensativa', t: 'Para medir: la regla bien vertical, desde la línea inicial hasta lo más alto de la espuma, con los ojos a la altura de la regla.', a: [{ k: 'fila', n: 4, i: '📏', x: 'Regla vertical · desde la línea inicial · ojos a la altura' }] },
      { m: 'idea', t: 'El responsable del registro anota las tres repeticiones en la tabla, sin cambiar ningún dato.', a: [{ k: 'col', i: '🌡️', h: 'Temperatura', x: '' }, { k: 'col', i: '1️⃣', h: 'Repetición 1', x: '' }, { k: 'col', i: '2️⃣', h: 'Repetición 2', x: '' }, { k: 'col', i: '3️⃣', h: 'Repetición 3', x: '' }] },
      { m: 'genial', t: 'Si pasa algo raro, como un derrame, lo anotamos en incidencias. ¡Los científicos anotan todo!', a: [{ k: 'ok', x: '⚠️ ¿Pasó algo raro? Anótalo en «Incidencias»' }] }],
    '9-1': [
      { m: 'hola', t: 'Hoy procesamos los datos. Primero revisamos, en equipo, que el registro esté completo.', a: [{ k: 'tag', x: '👥 En equipo · Con tu ficha' }] },
      { m: 'pensativa', t: 'Comprueben: ¿tenemos datos de las tres temperaturas? ¿Están las tres repeticiones? ¿Todo está en centímetros? ¿Anotamos las incidencias?', a: [{ k: 'chips', x: ['✅ 15, 25 y 35 °C', '✅ 3 repeticiones', '✅ En cm', '✅ Incidencias'] }] },
      { m: 'idea', t: 'Ahora, el promedio. Los científicos repiten sus mediciones porque una sola medida puede tener errores.', a: [{ k: 'tit', x: '🤔 ¿Cómo se saca el promedio?' }] },
      { m: 'curiosa', t: 'Toma los tres datos de la misma temperatura. Súmalos. Divide entre tres. Y escribe el resultado en centímetros, con un decimal.', a: [{ k: 'fila', n: 1, i: '➕', x: 'Suma los 3 datos' }, { k: 'fila', n: 2, i: '➗', x: 'Divide entre 3' }, { k: 'fila', n: 3, i: '📏', x: 'Escribe en cm (1 decimal)' }] },
      { m: 'genial', t: 'Por ejemplo: uno, más uno coma dos, más uno coma uno, es tres coma tres. Dividido entre tres: ¡uno coma uno centímetros!', a: [{ k: 'dato', x: '(1,0 + 1,2 + 1,1) ÷ 3 = 3,3 ÷ 3 = 1,1 cm' }] },
      { m: 'decidida', t: 'Ahora calculen el promedio de cada temperatura en su ficha.', a: [{ k: 'nota', x: '📄 Un promedio para cada temperatura' }] }],
    '9-2': [
      { m: 'hola', t: 'Con los promedios listos, cada uno los organiza en una tabla y construye su gráfico.', a: [{ k: 'tag', x: '🧑 Individual · Con tu ficha' }] },
      { m: 'pensativa', t: 'Primero, pasa los promedios a una tabla de doble entrada: a un lado la temperatura, y al otro, la altura de la espuma.', a: [{ k: 'col', i: '🌡️', h: 'Variable independiente', x: 'Temperatura (°C)' }, { k: 'col', i: '📏', h: 'Variable dependiente', x: 'Altura de la espuma (cm)' }] },
      { m: 'idea', t: 'Ahora el gráfico de barras. Empieza con un título que diga de qué trata.', a: [{ k: 'graf', x: ['15 °C', '25 °C', '35 °C'] }, { k: 'chips', x: ['📝 Título'] }] },
      { m: 'curiosa', t: 'En el eje horizontal va la temperatura. En el eje vertical, la altura en centímetros.', a: [{ k: 'chips', x: ['↔️ Eje horizontal: temperatura', '↕️ Eje vertical: altura (cm)'] }] },
      { m: 'decidida', t: 'Usa una escala que avance igual, de cuadrito en cuadrito. Y pinta cada barra con un color, con su leyenda.', a: [{ k: 'chips', x: ['📐 Escala pareja', '🎨 Colores y leyenda'] }] },
      { m: 'genial', t: 'Revisa que tu gráfico tenga sus cinco partes: título, ejes, escala, colores y leyenda.', a: [{ k: 'ok', x: 'Título · ejes · escala · colores · leyenda' }] }],
    '10-1': [
      { m: 'hola', t: 'Hoy somos detectives de datos: comparamos los resultados de las tres temperaturas.', a: [{ k: 'tag', x: '🕵️ En equipo · Con tu ficha' }] },
      { m: 'pensativa', t: 'Usen la tabla y el gráfico de la sesión anterior. Miren la altura promedio de la espuma a los veinte minutos.', a: [{ k: 'graf', x: ['15 °C', '25 °C', '35 °C'] }] },
      { m: 'curiosa', t: 'Para cada temperatura, escriban la altura inicial, la final, y el cambio: la final menos la inicial.', a: [{ k: 'dato', x: 'Cambio = altura final − altura inicial' }] },
      { m: 'idea', t: 'Luego encuentren la mayor altura y la menor altura.', a: [{ k: 'chips', x: ['⬆️ Mayor altura', '⬇️ Menor altura'] }] },
      { m: 'decidida', t: '¡Y calculen la diferencia! La mayor menos la menor.', a: [{ k: 'dato', x: 'Diferencia = mayor − menor' }] },
      { m: 'genial', t: 'Así sabremos cuánto cambió la espuma con la temperatura.', a: [] }],
    '10-2': [
      { m: 'hola', t: 'Ahora buscamos el patrón: algo que se repite en los datos.', a: [{ k: 'tag', x: '🕵️ En equipo · Con tu ficha' }] },
      { m: 'idea', t: 'Un patrón es un comportamiento que se repite. Por ejemplo: la altura aumenta con el tiempo, o una temperatura siempre tiene valores mayores.', a: [{ k: 'tit', x: '🔁 Patrón = algo que se repite' }] },
      { m: 'pensativa', t: 'Escriban su patrón principal y dos datos que lo demuestran.', a: [{ k: 'col', i: '🔁', h: '¿Qué se repite?', x: '' }, { k: 'col', i: '1️⃣', h: 'Dato 1', x: '' }, { k: 'col', i: '2️⃣', h: 'Dato 2', x: '' }] },
      { m: 'curiosa', t: '¿Hay algún valor que no sigue el patrón? Ese es un dato inusual.', a: [{ k: 'nota', x: '🧐 Dato inusual: no sigue el patrón' }] },
      { m: 'decidida', t: '¡Ojo! Un dato inusual NO se borra. Se revisa, y se busca en las incidencias qué pasó.', a: [{ k: 'ok', x: 'No se borra: se revisa con las incidencias' }] },
      { m: 'genial', t: '¡Los meteorólogos hacen lo mismo con el clima: usan patrones para pronosticar!', a: [] }],
    '11-1': [
      { m: 'hola', t: 'Hoy cada uno prepara su conclusión. Primero recuperamos lo que encontramos.', a: [{ k: 'tag', x: '🧑 Individual · Con tu ficha' }] },
      { m: 'pensativa', t: 'Escribe tu pregunta de indagación, el resultado principal, dos datos que lo demuestran y el patrón.', a: [{ k: 'chips', x: ['❓ Pregunta', '🏆 Resultado', '📊 Dos datos', '🔁 Patrón'] }] },
      { m: 'idea', t: 'Ahora lee la información científica: la levadura es un ser vivo de una sola célula. Con agua y azúcar hace la fermentación, y libera dióxido de carbono.', a: [{ k: 'tit', x: '🟤 Levadura + 💧 agua + 🍬 azúcar → 🫧 dióxido de carbono' }] },
      { m: 'curiosa', t: '¡Las burbujas de ese gas forman la espuma! Por eso el pan es esponjoso.', a: [{ k: 'nota', x: '🫧 Burbujas de gas = espuma (y pan esponjoso 🍞)' }] },
      { m: 'decidida', t: 'Une cada información científica con un dato de tu experimento, y explica cómo ayuda a entender el resultado.', a: [{ k: 'col', i: '🔬', h: 'Información científica', x: '' }, { k: 'col', i: '📊', h: 'Dato experimental', x: '' }, { k: 'col', i: '💬', h: '¿Cómo lo explica?', x: '' }] },
      { m: 'genial', t: '¡Así tus datos y la ciencia trabajan juntos!', a: [] }],
    '11-2': [
      { m: 'hola', t: 'Llegó el momento de la verdad: ¿nuestra hipótesis se cumplió?', a: [{ k: 'tag', x: '🧑 Individual · Con tu ficha' }] },
      { m: 'pensativa', t: 'Compara lo que predijo tu hipótesis con lo que mostraron los resultados, y anota los datos que lo sustentan.', a: [{ k: 'col', i: '🔮', h: 'Mi hipótesis predijo', x: '' }, { k: 'col', i: '📊', h: 'Los resultados mostraron', x: '' }, { k: 'col', i: '📌', h: 'Datos que lo sustentan', x: '' }] },
      { m: 'curiosa', t: 'Decide: la hipótesis fue respaldada, parcialmente respaldada, o no respaldada.', a: [{ k: 'chips', x: ['✅ Respaldada', '🟡 Parcialmente respaldada', '❌ No respaldada'] }] },
      { m: 'idea', t: '¡No pasa nada si no se cumplió! Los científicos también aprenden cuando su hipótesis no es respaldada.', a: [{ k: 'ok', x: 'Si no se cumplió, ¡también aprendimos algo!' }] },
      { m: 'decidida', t: 'Escribe tu conclusión con cinco partes: la respuesta a la pregunta, la decisión sobre la hipótesis, dos evidencias, la explicación científica, y hasta dónde llegan tus resultados.', a: [{ k: 'fila', n: 1, i: '❓', x: 'Respuesta a la pregunta' }, { k: 'fila', n: 2, i: '⚖️', x: 'Decisión sobre la hipótesis' }, { k: 'fila', n: 3, i: '📊', x: 'Dos evidencias' }, { k: 'fila', n: 4, i: '🔬', x: 'Explicación científica' }, { k: 'fila', n: 5, i: '🎯', x: 'Hasta dónde llegan los resultados' }] },
      { m: 'genial', t: '¡Ya eres un verdadero científico o científica!', a: [] }],
    '12-1': [
      { m: 'hola', t: 'Hoy demuestras todo lo que aprendiste, con una situación nueva. ¡Tú puedes!', a: [{ k: 'tag', x: '🧑 Individual · ⏱️ 28 minutos' }] },
      { m: 'pensativa', t: 'Lee con calma la situación y la tarjeta científica.', a: [{ k: 'fila', n: '📖', i: '', x: 'Leo la situación y la tarjeta científica' }] },
      { m: 'idea', t: 'Bloque uno, en catorce minutos: describe el fenómeno, escribe tu pregunta, y tu hipótesis con: Si… entonces… porque…', a: [{ k: 'col', i: '👀', h: 'Fenómeno', x: '' }, { k: 'col', i: '❓', h: 'Pregunta', x: '' }, { k: 'col', i: '💡', h: 'Hipótesis', x: 'Si… entonces… porque…' }] },
      { m: 'curiosa', t: 'Bloque dos, en catorce minutos: organiza el diseño. La variable independiente con sus valores, la dependiente con su instrumento y unidad, y lo que se mantiene igual.', a: [{ k: 'chips', x: ['🔄 Variable independiente', '📏 Variable dependiente', '⚖️ Lo que no cambia'] }] },
      { m: 'decidida', t: 'Explica también por qué hacemos tres repeticiones, y escribe las medidas de seguridad.', a: [{ k: 'chips', x: ['🔁 ¿Por qué 3 repeticiones?', '🦺 Seguridad'] }] },
      { m: 'genial', t: '¡Es igual que nuestro experimento con la levadura! Respira y empieza.', a: [] }],
    '12-2': [
      { m: 'hola', t: 'Ahora los bloques tres y cuatro: trabajamos con los datos y escribimos la conclusión.', a: [{ k: 'tag', x: '🧑 Individual · ⏱️ 29 minutos' }] },
      { m: 'pensativa', t: 'Bloque tres: calcula los cuatro promedios. Muestra al menos un cálculo.', a: [{ k: 'dato', x: 'Promedio = (R1 + R2 + R3) ÷ 3' }] },
      { m: 'idea', t: 'Construye un gráfico de barras, con título, ejes con unidades y una escala pareja.', a: [{ k: 'graf', x: ['0 g', '5 g', '10 g', '15 g'] }] },
      { m: 'curiosa', t: 'Bloque cuatro: compara. Calcula la diferencia entre quince gramos y cero gramos a los veinte minutos. Y mira qué cambió entre los diez y los veinte minutos.', a: [{ k: 'chips', x: ['➖ 15 g − 0 g (a los 20 min)', '⏱️ ¿Qué cambió de 10 a 20 min?'] }] },
      { m: 'decidida', t: 'Escribe tu conclusión sustentada: responde la pregunta, usa dos datos y la tarjeta científica.', a: [{ k: 'chips', x: ['❓ Respuesta', '📊 2 datos', '🔬 Tarjeta científica'] }] },
      { m: 'genial', t: 'Revisa tu trabajo antes de entregar. ¡Estoy muy orgullosa de ti!', a: [] }]
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
    el.querySelectorAll('.mx-p').forEach(p => { const k = +p.dataset.s; p.classList.toggle('ver', k <= n); p.classList.toggle('nue', k === n); });
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
