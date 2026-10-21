// ===================================================================
//  MOLÍ 3 · LO QUE MOLÍ SABE (conversación tipo Jarvis, 6.° grado · Unidad 7 «Microorganismos en acción»)
//  Molí arma cada respuesta juntando bloques grabados con su voz:  [reacción] + [dato del tema] + [pregunta para seguir]
//  - temas: claves = comienzos de palabra que lo activan (en minúsculas, sin tildes); datos = lo que cuenta (uno distinto cada vez)
//    cada dato trae su pregunta (q) y el tema al que lleva si le dicen «sí» (sig).
//  - Para enseñarle algo nuevo, agrega un dato o un tema igual a los de abajo, con un id nuevo.
//    Si existe audio/b/<id>.mp3, Molí lo dice con su voz; si no, usa la voz del navegador.
// ===================================================================
window.SABER = {
  reacciones: [
    { id: 'r-buena', t: '¡Buena pregunta!' }, { id: 'r-excelente', t: '¡Excelente!' }, { id: 'r-interesante', t: 'Mmm, interesante.' },
    { id: 'r-encanta', t: '¡Me encanta ese tema!' }, { id: 'r-claro', t: '¡Claro!' }, { id: 'r-muybien', t: '¡Muy bien!' }
  ],
  reaccionesSi: [{ id: 'rs-cuento', t: '¡Te cuento!' }, { id: 'rs-vamos', t: '¡Vamos!' }, { id: 'rs-perfecto', t: '¡Perfecto!' }, { id: 'rs-genial', t: '¡Genial!' }],

  // ---- órdenes: Molí responde y se mueve ----
  ordenes: [
    { id: 'ir-aula', ir: 'aula', claves: ['aula', 'salon', 'vista general', 'inicio'], t: '¡Vamos al aula!' },
    { id: 'ir-cuaderno', ir: 'cuaderno', claves: ['sesion', 'cuaderno'], t: '¡Vamos al cuaderno de sesiones!' },
    { id: 'ir-corcho', ir: 'corcho', claves: ['corcho', 'normas', 'proposito'], t: '¡Vamos al corcho!' },
    { id: 'ir-holograma', ir: 'holograma', claves: ['holograma', 'diapositivas', 'presentacion', 'proyeccion'], t: '¡Vamos al holograma!' },
    { id: 'ir-muro', ir: 'muro', claves: ['muro', 'trabajos destacados', 'destacados'], t: '¡Vamos al muro del aula!' },
    { id: 'acercar', accion: 'acercar', claves: ['acercate', 'mas cerca', 'zoom', 'acercar'], t: 'Me acerco.' },
    { id: 'alejar', accion: 'alejar', claves: ['alejate', 'mas lejos', 'alejar'], t: 'Me alejo.' },
    { id: 'siguiente', accion: 'siguiente', claves: ['siguiente', 'pasa la diapositiva'], t: 'Siguiente diapositiva.' },
    { id: 'anterior', accion: 'anterior', claves: ['anterior', 'regresa la diapositiva'], t: 'Diapositiva anterior.' }
  ],

  // ---- charla ----
  charla: [
    { id: 'c-hola', claves: ['hola', 'buenos dias', 'buenas tardes', 'buenas'], t: '¡Hola! Hoy conversamos sobre los microorganismos en acción.', q: { id: 'q-que-es', t: '¿Sabes qué es un microorganismo?', sig: 'microorganismos' } },
    { id: 'c-quien', claves: ['quien eres', 'como te llamas', 'tu nombre', 'que eres'], t: 'Soy Molí 3, tu robot asistente de Ciencia y Tecnología.', q: 'general' },
    { id: 'c-como', claves: ['como estas', 'que tal'], t: '¡Estoy muy bien, con las baterías cargadas!', q: 'general' },
    { id: 'c-gracias', claves: ['gracias'], t: '¡De nada!', q: { id: 'q-curioso', t: '¿Te cuento algo curioso?', sig: 'curioso' } },
    { id: 'c-adios', claves: ['adios', 'chau', 'hasta luego', 'nos vemos'], t: '¡Hasta luego! Recuerda lavarte las manos.' }
  ],
  general: { id: 'q-general', t: '¿De qué quieres conversar: bacterias, virus u hongos?' },

  // ---- temas de la Unidad 7 ----
  temas: {
    microorganismos: { claves: ['microorganism', 'microbio'], datos: [
      { id: 'd-micro1', t: 'Un microorganismo es un ser vivo tan pequeño que solo se puede ver con un microscopio.', q: { id: 'q-tipos', t: '¿Sabes cuáles son sus tipos?', sig: 'tipos' } },
      { id: 'd-micro2', t: 'Los microorganismos están en el aire, el agua, el suelo, los alimentos y hasta en tu piel.', q: { id: 'q-tamano', t: '¿Quieres saber qué tan pequeños son?', sig: 'tamano' } },
      { id: 'd-micro3', t: 'En tu cuerpo hay más bacterias que células humanas, y la mayoría son buenas.', q: { id: 'q-buenas', t: '¿Quieres conocer a las bacterias buenas?', sig: 'utiles' } } ] },
    curioso: { claves: ['curios', 'dato', 'interesante', 'sabias'], datos: [
      { id: 'd-cur1', t: '¿Sabías que una bacteria puede dividirse en dos en solo veinte minutos? ¡En pocas horas pueden ser millones!', q: { id: 'q-herida', t: '¿Sabes por qué una herida sucia se infecta rápido?', sig: 'prevenir' } },
      { id: 'd-cur2', t: '¿Sabías que en la punta de un alfiler caben miles de bacterias?', q: { id: 'q-ver', t: '¿Quieres saber cómo las podemos ver?', sig: 'microscopio' } } ] },
    tipos: { claves: ['tipo', 'clase', 'grupo', 'cuales son'], datos: [
      { id: 'd-tipos1', t: 'Los principales tipos son las bacterias, los virus, los hongos microscópicos y los protozoos.', q: { id: 'q-empezamos', t: '¿Empezamos por las bacterias?', sig: 'bacterias' } },
      { id: 'd-tipos2', t: 'Se agrupan en bacterias, virus, hongos y protozoos, y cada grupo vive de una forma distinta.', q: { id: 'q-virus', t: '¿Quieres saber de los virus?', sig: 'virus' } } ] },
    bacterias: { claves: ['bacteri'], datos: [
      { id: 'd-bac1', t: 'Las bacterias son seres vivos de una sola célula, tan pequeños que solo se ven con microscopio.', q: { id: 'q-intestino', t: '¿Sabías que en tu intestino viven millones de bacterias buenas?', sig: 'utiles' } },
      { id: 'd-bac2', t: 'Las bacterias pueden tener forma de bolita, de bastón o de espiral.', q: { id: 'q-rapido', t: '¿Quieres saber qué tan rápido se reproducen?', sig: 'reproduccion' } },
      { id: 'd-bac3', t: 'Algunas bacterias causan enfermedades, como la tifoidea o las infecciones de garganta.', q: { id: 'q-prevenirlas', t: '¿Sabes cómo prevenirlas?', sig: 'prevenir' } } ] },
    reproduccion: { claves: ['reproduc', 'multiplic', 'rapido', 'se dividen'], datos: [
      { id: 'd-rep1', t: 'Una bacteria se divide en dos en unos veinte minutos. ¡En pocas horas pueden ser millones!', q: 'q-herida' } ] },
    virus: { claves: ['virus', 'viral'], datos: [
      { id: 'd-vir1', t: 'Los virus son mucho más pequeños que las bacterias y no pueden vivir solos: necesitan entrar en las células de otro ser vivo.', q: { id: 'q-contagian', t: '¿Sabes cómo se contagian?', sig: 'contagio' } },
      { id: 'd-vir2', t: 'Los virus causan enfermedades como la gripe, el resfrío, la varicela y el COVID.', q: { id: 'q-vacunas', t: '¿Quieres saber cómo nos protegen las vacunas?', sig: 'vacunas' } },
      { id: 'd-vir3', t: 'Los antibióticos no sirven contra los virus. Tu cuerpo los combate con sus defensas.', q: { id: 'q-defensas', t: '¿Quieres conocer las defensas de tu cuerpo?', sig: 'defensas' } } ] },
    contagio: { claves: ['contagi', 'transmit', 'propag', 'se pasa', 'se pega'], datos: [
      { id: 'd-cont1', t: 'Se contagian por el aire al toser o estornudar, al tocar cosas sucias y luego la boca, o por agua y alimentos contaminados.', q: { id: 'q-prevenirlo', t: '¿Quieres saber cómo prevenirlo?', sig: 'prevenir' } } ] },
    hongos: { claves: ['hong', 'levadur', 'champi'], datos: [
      { id: 'd-hon1', t: 'Hay hongos grandes como los champiñones y hongos microscópicos como la levadura y el moho.', q: { id: 'q-moho', t: '¿Has visto moho en un pan viejo?', sig: 'moho' } },
      { id: 'd-hon2', t: 'La levadura es un hongo que hace que la masa del pan crezca y quede esponjosa.', q: { id: 'q-alimentos', t: '¿Quieres saber qué otros alimentos hacen los microorganismos?', sig: 'alimentos' } } ] },
    moho: { claves: ['moho', 'mohoso', 'pan viejo'], datos: [
      { id: 'd-moho1', t: 'El moho es un hongo que aparece como manchas verdes o negras en los alimentos viejos. ¡No se debe comer!', q: { id: 'q-medicamento', t: '¿Sabías que de un moho salió un medicamento muy importante?', sig: 'fleming' } } ] },
    fleming: { claves: ['fleming', 'penicilina', 'medicamento'], datos: [
      { id: 'd-fle1', t: 'Alexander Fleming descubrió la penicilina en 1928, gracias a un moho que eliminó a las bacterias de su experimento.', q: { id: 'q-antibioticos', t: '¿Quieres saber qué son los antibióticos?', sig: 'antibioticos' } } ] },
    antibioticos: { claves: ['antibiotic', 'medicina', 'pastilla'], datos: [
      { id: 'd-ant1', t: 'Los antibióticos son medicinas que combaten a las bacterias. Solo se toman cuando el doctor lo indica.', q: { id: 'q-novirus', t: '¿Sabías que no sirven contra los virus?', sig: 'virus' } } ] },
    protozoos: { claves: ['protozo', 'ameba', 'parasit'], datos: [
      { id: 'd-pro1', t: 'Los protozoos son microorganismos de una sola célula que viven en el agua. La ameba puede causar dolor de estómago.', q: { id: 'q-hervir', t: '¿Sabes por qué debemos hervir el agua?', sig: 'agua' } } ] },
    agua: { claves: ['agua', 'hervi'], datos: [
      { id: 'd-agua1', t: 'Al hervir el agua, el calor elimina a la mayoría de los microorganismos dañinos.', q: { id: 'q-consejos', t: '¿Quieres más consejos para no enfermarte?', sig: 'prevenir' } } ] },
    utiles: { claves: ['util', 'benefic', 'buen', 'ayud', 'intestin'], datos: [
      { id: 'd-uti1', t: 'Las bacterias buenas de tu intestino te ayudan a digerir los alimentos y a defenderte de las bacterias malas.', q: { id: 'q-causan', t: '¿Quieres saber cuáles causan enfermedades?', sig: 'daninos' } },
      { id: 'd-uti2', t: 'Muchos microorganismos son útiles: hacen el pan, el yogur y el queso, y descomponen los restos de la naturaleza.', q: { id: 'q-descomp', t: '¿Quieres saber qué es la descomposición?', sig: 'descomposicion' } } ] },
    alimentos: { claves: ['yogur', 'queso', 'fermenta', 'chicha', 'alimento', 'comida'], datos: [
      { id: 'd-ali1', t: 'Gracias a la fermentación, la levadura hace el pan y la chicha, y las bacterias convierten la leche en yogur y queso.', q: { id: 'q-experimento', t: '¿Te gustaría hacer un experimento con moho?', sig: 'experimento' } } ] },
    descomposicion: { claves: ['descompo', 'pudr', 'abono', 'compost', 'recicl'], datos: [
      { id: 'd-des1', t: 'Las bacterias y los hongos se alimentan de restos de plantas y animales y los convierten en abono. ¡Son los recicladores de la naturaleza!', q: { id: 'q-donde', t: '¿Quieres saber dónde más viven los microorganismos?', sig: 'donde' } } ] },
    daninos: { claves: ['danin', 'malo', 'mala', 'enferm', 'infecc', 'causan'], datos: [
      { id: 'd-dan1', t: 'Algunos microorganismos causan enfermedades: bacterias, virus y protozoos pueden enfermarnos si entran a nuestro cuerpo.', q: 'q-contagian' },
      { id: 'd-dan2', t: 'La gripe la causa un virus, la tifoidea una bacteria y la amebiasis un protozoo.', q: 'q-prevenirlas' } ] },
    prevenir: { claves: ['preven', 'cuid', 'evit', 'proteg', 'higien'], datos: [
      { id: 'd-pre1', t: 'Para prevenir enfermedades: lávate las manos con agua y jabón, cúbrete al toser y lava las frutas y verduras.', q: { id: 'q-manos', t: '¿Sabes cuánto tiempo debes lavarte las manos?', sig: 'manos' } },
      { id: 'd-pre2', t: 'También ayuda tomar agua hervida, mantener limpia el aula y vacunarte.', q: 'q-vacunas' } ] },
    manos: { claves: ['mano', 'jabon', 'lavar', 'lavo'], datos: [
      { id: 'd-man1', t: 'Lávate las manos por lo menos veinte segundos, frotando entre los dedos y las uñas. ¡Es como cantar dos veces feliz cumpleaños!', q: { id: 'q-defiende', t: '¿Quieres saber cómo te defiende tu cuerpo?', sig: 'defensas' } } ] },
    vacunas: { claves: ['vacun'], datos: [
      { id: 'd-vac1', t: 'Las vacunas entrenan a tus defensas para reconocer a un microbio antes de que te enferme. ¡Son como un simulacro para tu cuerpo!', q: { id: 'q-soldados', t: '¿Quieres conocer a los soldados de tu cuerpo?', sig: 'defensas' } } ] },
    defensas: { claves: ['defens', 'inmun', 'globulo', 'soldado'], datos: [
      { id: 'd-def1', t: 'Tu piel es una barrera y los glóbulos blancos atacan a los microbios que entran. ¡Son como los soldados de tu cuerpo!', q: { id: 'q-vemos', t: '¿Quieres saber cómo vemos a los microbios?', sig: 'microscopio' } } ] },
    microscopio: { claves: ['microscop', 'lupa', 'lente'], datos: [
      { id: 'd-mic1', t: 'El microscopio usa lentes para agrandar lo muy pequeño, hasta mil veces o más.', q: { id: 'q-quienvio', t: '¿Sabes quién vio por primera vez a los microorganismos?', sig: 'leeuwenhoek' } } ] },
    leeuwenhoek: { claves: ['leeuwenhoek', 'primera vez', 'descubri'], datos: [
      { id: 'd-lee1', t: 'Fue Anton van Leeuwenhoek, hace más de trescientos años. Con un microscopio hecho por él vio pequeños seres en una gota de agua.', q: 'q-donde' } ] },
    donde: { claves: ['donde', 'lugar', 'viven'], datos: [
      { id: 'd-don1', t: 'Viven en casi todos lados: el aire, el agua, el suelo, tu piel y tu boca. ¡Hasta en lugares muy fríos o muy calientes!', q: 'q-tamano' } ] },
    tamano: { claves: ['tamano', 'pequen', 'miden', 'chiquit'], datos: [
      { id: 'd-tam1', t: 'Son tan pequeños que se miden en micras. ¡En la punta de un alfiler caben miles de bacterias!', q: 'q-tipos' } ] },
    experimento: { claves: ['experiment', 'practica', 'observar'], datos: [
      { id: 'd-exp1', t: 'Deja un pedazo de pan húmedo en una bolsa cerrada unos días y observa con lupa cómo aparece el moho. ¡Sin abrir la bolsa!', q: { id: 'q-quemoho', t: '¿Sabes qué es el moho?', sig: 'moho' } } ] },
    meta: { claves: ['meta', 'objetivo'], datos: [
      { id: 'd-meta1', t: 'La meta de hoy es identificar microorganismos beneficiosos y dañinos en nuestra vida diaria.', q: { id: 'q-criterios', t: '¿Quieres saber los criterios de éxito?', sig: 'criterios' } } ] },
    criterios: { claves: ['criterio'], datos: [
      { id: 'd-cri1', t: 'Nombras tres tipos de microorganismos, das un ejemplo útil y uno dañino, y explicas cómo prevenir enfermedades.', q: { id: 'q-reto', t: '¿Te cuento el reto del día?', sig: 'reto' } } ] },
    reto: { claves: ['reto', 'desafio'], datos: [
      { id: 'd-reto1', t: 'En equipo, diseñen un afiche para prevenir enfermedades causadas por microorganismos. Tienen quince minutos.', q: { id: 'q-materiales', t: '¿Quieres saber qué materiales necesitas?', sig: 'materiales' } } ] },
    materiales: { claves: ['material', 'que traigo', 'que debo traer', 'tarea'], datos: [
      { id: 'd-mat1', t: 'Necesitas cartulina, plumones, tijeras, goma, regla y lápiz.', q: { id: 'q-repasar', t: '¿Repasamos cómo prevenir enfermedades?', sig: 'prevenir' } } ] }
  },

  // ---- cuando se sale del tema: pregunta y lo devuelve a la clase ----
  fuera: { id: 'f-fuera', t: '¿Este comentario es parte de tu aprendizaje?' },
  volver: [
    { id: 'v-contagio', t: 'Volvamos a la clase: ¿sabes cómo se contagian los virus?', sig: 'contagio' },
    { id: 'v-ayudan', t: 'Mejor sigamos con los microorganismos: ¿quieres saber cómo nos ayudan las bacterias?', sig: 'utiles' },
    { id: 'v-moho', t: 'Volvamos al tema: ¿sabías que de un moho salió un medicamento?', sig: 'fleming' }
  ],
  no: { id: 'x-no', t: 'Está bien.' },
  siSinTema: { id: 'x-si', t: '¡Genial!' },
  nada: { id: 'x-nada', t: 'No te escuché bien. ¿Puedes repetirlo?' },
  yaAqui: { id: 'x-aqui', t: 'Ya estamos aquí.' }
};
