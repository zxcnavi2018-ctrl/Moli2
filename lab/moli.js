// Moli guarda su mensaje: al llegar uno nuevo muestra 💬. Al tocar a Moli se abre su globo con el último mensaje,
// cómo se juega este juego y un aviso para completar las misiones (que se iluminan un momento).
(()=>{const box=document.querySelector('.moli-say');if(!box)return;const p=box.querySelector('p'),img=box.querySelector('img');let t=0,last='';
const HELP={
 'circuitos.html':['Arrastra la <b>pila</b>, los <b>cables</b> y un <b>foco</b> a la mesa.','Une los puntos dorados ● arrastrando de uno a otro: así pones un cable.','La corriente debe salir del <b>+</b> de la pila y volver al <b>−</b>.','Toca el <b>interruptor</b> para abrirlo o cerrarlo. ¡Ojo: muchas pilas queman el foco!'],
 'placas.html':['Arrastra el planeta para <b>girarlo</b>.','Toca una placa para saber si es <b>continental</b> u <b>oceánica</b>.','Arrastra una tarjeta (convergente, subducción, divergente o transformante) al planeta y mira qué pasa.'],
 'energias.html':['Toca una tarjeta de energía y se construye en la isla.','Cuida que la ciudad tenga <b>luz</b>, <b>aire limpio</b> y <b>monedas</b>.','Cuando suene una <b>alarma</b>, construye lo que se necesita.','Si contaminas mucho, las aves se van. ¡Cuida la isla <b>4 días</b>!'],
 'evolucion.html':['Elige un animal o toca <b>«Animal sorpresa»</b>.','Lee la historia y elige lo que mejor ayude a <b>sobrevivir</b>.','Toca <b>«Pasar a la siguiente generación»</b>.','Si eliges mal muchas veces, la especie se <b>extingue</b>.'],
 'enfermedades.html':['Bacterius lanza un <b>microbio</b>.','Toca tus cartas para leerlas.','<b>Arrastra al centro</b> la defensa correcta.','Gana quien deje al otro sin energía.'],
 'maquinas.html':['Se abre el <b>telón</b> y empieza una obra con un problema.','<b>Arrastra al escenario</b> la máquina que ayuda (o tócala 2 veces).','Lee la explicación y cierra el telón para ver la siguiente obra.'],
 'solar.html':['Arrastra para moverte por el espacio; pellizca o usa la rueda para acercarte.','Toca un planeta para <b>viajar</b> y leer sus datos.','Los planetas que no conoces tienen <b>?</b>: ¡búscalos!','Responde las <b>preguntitas</b> del sistema solar.'],
 'luna.html':['El punto rojo es <b>tu playa</b>: mira cómo sube y baja el mar.','Usa <b>⏩ Apresurar</b> para ver las mareas y <b>🚀 Muy rápido</b> para ver las fases de la Luna.','Responde las <b>preguntitas</b> de la Luna, la Tierra y el mar.'],
 'cadenas.html':['Elige un ecosistema: <b>sierra</b>, <b>mar</b> o <b>selva</b>.','Arrastra cada ser vivo a su lugar, empezando por el <b>productor</b> junto al Sol.','No olvides al <b>descomponedor</b>.','Luego responde <b>«¿Qué pasa si…?»</b>.'],
 'ecosistemas.html':['Elige un lugar del Perú en tu <b>pasaporte</b>.','Mira lo que brilla y decide: ¿<b>tiene vida</b> (biótico) o <b>no tiene vida</b> (abiótico)?','Lee las <b>pistas</b> y elige el tipo: terrestre, acuático o mixto.','Responde la pregunta para <b>pensar</b> y gana el sello.'],
 'agua.html':['Elige un <b>experimento</b> arriba.','Arrastra o toca los objetos para usarlos en la mesa.','Observa qué pasa y lee la explicación.','Cada experimento logrado completa una misión.'],
 'energia.html':['<b>Arrastra al skater</b> hacia arriba por la rampa y suéltalo.','Mira las barras: arriba hay más energía <b>potencial</b>; abajo, más energía <b>cinética</b>.','Prueba <b>con y sin fricción</b> y con distinta masa.','Toca <b>🎯 Reto</b>, predice hasta dónde llegará y comprueba.'],
 'gravedad.html':['Elige un experimento arriba: <b>caída libre</b>, <b>planetas</b> u <b>órbita</b>.','En caída libre, suelta dos objetos <b>con aire</b> y <b>sin aire</b>: ¿cuál llega primero?','Salta en distintos planetas y mira la <b>báscula</b>.','Lanza la bala cada vez más rápido hasta ponerla en <b>órbita</b>.']
};
const page=(location.pathname.split('/').pop()||'').toLowerCase(),steps=HELP[page];
const col=document.createElement('div');col.className='moli-col';p.parentNode.insertBefore(col,p);col.appendChild(p);
const help=document.createElement('div');help.className='moli-help';col.appendChild(help);
if(steps)help.innerHTML=`<b class="mh-t">🎮 ¿Cómo se juega?</b><ol>${steps.map(s=>`<li>${s}</li>`).join('')}</ol><b class="mh-m">🎯 ¡Completa las misiones!</b>`;else help.remove();
if(getComputedStyle(box).bottom==='auto')col.classList.add('top');
const mis=()=>document.querySelector('#mis,.mis,.pick');
const glow=()=>{const m=mis();if(!m)return;m.classList.remove('mis-glow');void m.offsetWidth;m.classList.add('mis-glow');try{m.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){}setTimeout(()=>m.classList.remove('mis-glow'),3200)};
const open=(v,quiet)=>{box.classList.toggle('open',v);box.classList.remove('new');clearTimeout(t);if(v){if(!quiet){img.classList.remove('hop');void img.offsetWidth;img.classList.add('hop');if(steps)glow()}t=setTimeout(()=>box.classList.remove('open'),steps?20000:9000)}};
img.setAttribute('role','button');img.setAttribute('tabindex','0');img.setAttribute('aria-label','Moli: cómo se juega');
img.addEventListener('click',()=>open(!box.classList.contains('open')));img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')open(!box.classList.contains('open'))});
col.addEventListener('click',e=>{if(!e.target.closest('button'))open(false)});
new MutationObserver(()=>{const s=p.textContent.trim();if(!s||s===last)return;last=s;if(box.classList.contains('open'))open(true,1);else box.classList.add('new')}).observe(p,{childList:true,subtree:true,characterData:true});
if(p.textContent.trim()){last=p.textContent.trim();box.classList.add('new')}})();
