// ===================================================================
//  MOLÍ 2 · HERRAMIENTAS DE LA DOCENTE (se abren desde su fotocheck)
//   🤖 Crear cuenta con Molí · ✨ Trabajar con Molí · 📷 Escanear · 📱 Control remoto · 💻 Laptop o celular
// ===================================================================
(function () {
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = t => !!String(t || '').trim();
  const cut = (t, n) => String(t || '').replace(/\s+/g, ' ').trim().slice(0, n);
  const panel = document.createElement('div'); panel.id = 'herr';
  const montarPanel = () => { if (!panel.isConnected && document.body) document.body.appendChild(panel); };
  document.addEventListener('DOMContentLoaded', montarPanel); montarPanel();
  let cerrarActual = null;
  function abrir(titulo, sub, img, html, ancho) {
    montarPanel(); if (cerrarActual) { const c = cerrarActual; cerrarActual = null; c(); }
    panel.innerHTML = `<div class="hp-c${ancho ? ' ancho' : ''}"><button class="hp-x" data-h="x" aria-label="Cerrar">✕</button>
      <div class="hp-h"><img src="img/moli/${img}.webp" alt=""><div><b>${titulo}</b><span>${sub}</span></div></div><div class="hp-b">${html}</div></div>`;
    panel.classList.add('on'); return panel.querySelector('.hp-b');
  }
  function cerrar() { panel.classList.remove('on'); if (cerrarActual) { const c = cerrarActual; cerrarActual = null; c(); } }
  panel.addEventListener('click', e => { if (e.target === panel || e.target.closest('[data-h="x"]')) cerrar(); });
  const errTxt = e => e && e.message === 'AUTH' ? '🔐 Conecta tu cuenta de docente: toca tu fotocheck → «Conectar mi cuenta».' : e && e.message === 'QUOTA' ? '⏳ Google está al límite por ahora. Intenta en un minuto.' : '📶 No se pudo. Revisa tu internet e intenta otra vez.';

  // =================================================================
  //  🤖 CREAR CUENTA CON MOLÍ
  // =================================================================
  function crearCuenta() {
    const b = abrir('🤖 Crear cuenta con Molí', 'Tus estudiantes entran con su DNI (como en Molí 1).', 'feliz', `
      <form class="hp-f" data-f="uno"><div class="hp-row"><input name="dni" inputmode="numeric" maxlength="8" placeholder="DNI (8 números)" required>
        <select name="sec">${['A', 'B', 'C', 'D'].map(x => `<option>${x}</option>`).join('')}</select></div>
        <input name="nom" maxlength="60" placeholder="Nombre completo" required><button class="hp-ok" type="submit">➕ Crear cuenta</button><p class="hp-msg"></p></form>
      <details class="hp-mas"><summary>📋 Varios a la vez (pegar de Excel)</summary>
        <p class="hp-tip">Pega una fila por estudiante: <b>DNI</b> · <b>Nombre completo</b> · <b>Sección</b> (A, B, C o D). Puedes copiarlas directo de Excel.</p>
        <textarea rows="6" placeholder="71234567	Ana Pérez Ríos	A&#10;72345678	Bruno Díaz Soto	B"></textarea><button class="hp-ok" data-h="varios">➕ Crear todas</button><p class="hp-msg2"></p></details>
      <div class="hp-lista"><b>👥 Estudiantes</b><div class="hp-secs">${['A', 'B', 'C', 'D'].map(x => `<button data-h="ver" data-k="${x}">6° ${x}</button>`).join('')}</div><div class="hp-ls"></div></div>`);
    const ver = async sec => { const ls = b.querySelector('.hp-ls'); b.querySelectorAll('[data-h="ver"]').forEach(x => x.classList.toggle('on', x.dataset.k === sec)); ls.innerHTML = '<small>Cargando…</small>';
      try { const E = (await Docente.estudiantes(true)).filter(e => e.section === sec); ls.innerHTML = E.length ? `<small>${E.length} estudiantes</small><ol>${E.map(e => `<li>${esc(e.name)} <small>••••${esc(String(e.dni).slice(-4))}</small></li>`).join('')}</ol>` : '<small>Sin estudiantes todavía.</small>'; }
      catch (e) { ls.innerHTML = `<small>${errTxt(e)}</small>`; } };
    b.addEventListener('submit', async e => { e.preventDefault(); const f = e.target, m = f.querySelector('.hp-msg'), bt = f.querySelector('button'); bt.disabled = true; m.textContent = 'Creando…';
      try { const s = await Docente.crearEstudiante(f.dni.value, f.nom.value, f.sec.value); m.innerHTML = `✅ Cuenta de <b>${esc(s.name)}</b> (6° ${s.section}) creada. Ya puede entrar con su DNI.`; f.dni.value = ''; f.nom.value = ''; ver(s.section); }
      catch (x) { m.textContent = x.message === 'DNI' ? 'El DNI debe tener 8 números.' : x.message === 'NOMBRE' ? 'Escribe el nombre completo (3 a 60 letras).' : x.message === 'YAEXISTE' ? 'Ese DNI ya tiene cuenta.' : errTxt(x); }
      bt.disabled = false; });
    b.addEventListener('click', async e => { const k = e.target.closest('[data-h]'); if (!k) return;
      if (k.dataset.h === 'ver') ver(k.dataset.k);
      if (k.dataset.h === 'varios') { const m = b.querySelector('.hp-msg2'), filas = b.querySelector('textarea').value.split(/\r?\n/).map(l => l.split(/\t|;|,/).map(x => x.trim())).filter(r => r.length >= 3 && r[0]);
        let ok = 0, mal = []; k.disabled = true;
        for (const [d, n, s] of filas) { m.textContent = `Creando ${ok + mal.length + 1} de ${filas.length}…`; const sec = String(s).toUpperCase().replace(/[^A-D]/g, '').slice(-1);
          try { if (!sec) throw new Error('SEC'); await Docente.crearEstudiante(d, n, sec); ok++; } catch (x) { mal.push(`${d} (${x.message === 'YAEXISTE' ? 'ya existe' : x.message === 'DNI' ? 'DNI' : x.message === 'SEC' ? 'sección' : x.message === 'AUTH' ? 'cuenta' : 'error'})`); if (x.message === 'AUTH') break; } }
        m.innerHTML = `✅ ${ok} creadas.${mal.length ? ' ⚠️ No se crearon: ' + esc(mal.join(', ')) : ''}`; k.disabled = false; } });
    ver('A');
  }

  // =================================================================
  //  ✨ TRABAJAR CON MOLÍ: arma la unidad con tus fotos, PDF o Word y la pone tal cual en el cuaderno
  // =================================================================
  const ESTILO = `ESTILO DEL PROFESOR (síguelo siempre):
- EXIT TICKET: 5 preguntas de opción múltiple con 4 opciones (A, B, C, D), preguntas de máximo 14 palabras y opciones de máximo 6 palabras del mismo largo; evalúan la meta y lo que se hizo en las actividades de la sesión, de la más fácil a la más difícil; las opciones incorrectas son errores típicos de los niños; nada de «todas las anteriores».
- ACTIVIDAD Y FICHA SIEMPRE IGUALES: la ficha hace exactamente lo que dicen el título y la descripción de la actividad.
- ESPACIO Y TEXTO: la información va primero y bien desarrollada; las preguntas van después. Cada pregunta abierta es corta y clara.
- FICHA O PAPELOTE: en las actividades en equipo, si construyen un producto para presentar lo hacen en un PAPELOTE y la ficha solo indica «En equipo, en un papelote…»; si es un trabajo corto se hace en la ficha.
- UNA FICHA POR SESIÓN: cada sesión lleva UNA sola ficha que sirve para sus 3 actividades.
- Todo en español sencillo para niñas y niños de 11 y 12 años de Perú; cuida la seguridad en los experimentos.
`;
  const S_TXT = { type: 'STRING' }, S_ARR = { type: 'ARRAY', items: { type: 'STRING' } };
  const ESQ_PLAN = { type: 'OBJECT', required: ['units', 'aviso'], properties: { aviso: S_TXT, units: { type: 'ARRAY', items: { type: 'OBJECT', required: ['num', 'title', 'product', 'rubric', 'sessions'],
    properties: { num: S_TXT, title: S_TXT, product: S_TXT, rubricName: S_TXT, rubric: S_ARR, sessions: { type: 'ARRAY', items: { type: 'OBJECT', required: ['meta', 'criteria', 'rubric'],
      properties: { meta: S_TXT, criteria: S_ARR, rubric: S_TXT, mat: S_TXT, hoyT: S_TXT, hoyD: S_TXT, sigT: S_TXT, sigD: S_TXT } } } } } } } };
  const ESQ_SES = { type: 'OBJECT', required: ['activities', 'enfoque', 'ticket'], properties: {
    activities: { type: 'ARRAY', items: { type: 'OBJECT', required: ['title', 'desc'], properties: { title: S_TXT, desc: S_TXT, video: S_TXT } } },
    enfoque: { type: 'STRING', enum: ['lectura', 'andamios', 'casos', 'experimento'] },
    ticket: { type: 'ARRAY', items: { type: 'OBJECT', required: ['q', 'options', 'answer'], properties: { q: S_TXT, options: S_ARR, answer: { type: 'INTEGER' }, why: S_TXT } } } } };
  const ESQ_FICHA = { type: 'OBJECT', required: ['title', 'sections'], properties: { title: S_TXT, subtitle: S_TXT, sabias: S_TXT,
    sections: { type: 'ARRAY', items: { type: 'OBJECT', required: ['kind'], properties: { kind: { type: 'STRING', enum: ['texto', 'pregunta', 'tabla', 'lista'] }, heading: S_TXT, text: S_TXT, act: { type: 'INTEGER' },
      help: S_TXT, frame: S_TXT, cols: S_ARR, rows: { type: 'INTEGER' }, items: S_ARR, own: { type: 'BOOLEAN' } } } } } };
  const mezclar = q => { const o = q.options.map((t, i) => ({ t, ok: i === q.answer })); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return { q: q.q, options: o.map(x => x.t), answer: o.findIndex(x => x.ok), why: q.why || '' }; };

  // ---- leer archivos: imágenes (achicadas), PDF, Word (.docx) y texto ----
  const b64 = buf => { let s = '', u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  async function imagen(f) { const bm = await createImageBitmap(f), k = Math.min(1, 1280 / Math.max(bm.width, bm.height)), c = document.createElement('canvas'); c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k);
    c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .72).split(',')[1]; }
  async function docx(f) {                                           // Word: se lee word/document.xml del ZIP
    const buf = await f.arrayBuffer(), dv = new DataView(buf), u8 = new Uint8Array(buf);
    let eocd = -1; for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('DOCX');
    let p = dv.getUint32(eocd + 16, true); const n = dv.getUint16(eocd + 10, true);
    for (let k = 0; k < n; k++) {
      const met = dv.getUint16(p + 10, true), csz = dv.getUint32(p + 20, true), fl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
      const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + fl)); p += 46 + fl + xl + cl;
      if (name !== 'word/document.xml') continue;
      const lfl = dv.getUint16(off + 26, true), lxl = dv.getUint16(off + 28, true), data = u8.subarray(off + 30 + lfl + lxl, off + 30 + lfl + lxl + csz);
      const xml = met === 0 ? new TextDecoder().decode(data) : await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
      return xml.replace(/<\/w:p>/g, '\n').replace(/<w:tab\/>/g, '\t').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n').trim().slice(0, 30000);
    }
    throw new Error('DOCX');
  }
  async function partes(files) {                                     // todas las partes y, aparte, las de cada archivo (para dárselas a su sesión)
    const P = []; P.de = new Map();
    for (const f of files) { const n0 = P.length;
      const et = `[${/pdf$/i.test(f.name) ? 'PDF' : /docx$/i.test(f.name) ? 'Word' : /^image/.test(f.type) ? 'Imagen' : 'Texto'} adjunto: ${f.name}]${f._s ? ` (Sesión ${f._s})` : ''}`;
      if (/^image\//.test(f.type)) P.push({ text: et }, { inlineData: { mimeType: 'image/jpeg', data: await imagen(f) } });
      else if (/\.pdf$/i.test(f.name) || f.type === 'application/pdf') P.push({ text: et }, { inlineData: { mimeType: 'application/pdf', data: b64(await f.arrayBuffer()) } });
      else if (/\.docx$/i.test(f.name)) P.push({ text: et + '\n' + await docx(f) });
      else P.push({ text: et + '\n' + (await f.text()).slice(0, 30000) });
      P.de.set(f, P.slice(n0));
    }
    return P;
  }
  const sesDeNombre = n => { const m = String(n).match(/(?:s|ses|sesi[oó]n)[\s._-]*0?(\d{1,2})/i); return m ? +m[1] : 0; };

  const trabajar = () => MD.cargar().then(trabajarUI).catch(() => abrir('✨ Trabajar con Molí', '', 'pensativa', '<p>📶 No pude cargar las unidades. Revisa tu internet.</p>'));
  function trabajarUI() {
    const U = (MD.contenido() ? MD.contenido().units : []).filter(u => /^unit\d+$/.test(u.key));
    const W = { files: [], stop: false, run: false };
    const b = abrir('✨ Trabajar con Molí', 'Molí arma tu unidad con tus fotos, PDF o Word y la pone tal cual en el cuaderno.', 'idea', `
      <div class="hp-f"><label>📘 Unidad</label><select class="tw-u">${U.map(u => `<option value="${esc(u.key)}">Unidad ${esc(u.num)}${L(u.title) ? ' · ' + esc(u.title) : ''}${(u.sessions || []).some(s => L(s.meta)) ? ' (se reemplaza)' : ''}</option>`).join('')}</select>
        <label>📝 Indicaciones para Molí</label><textarea class="tw-n" rows="3" placeholder="Por ejemplo: son 10 sesiones; la sesión 4 es de laboratorio; usa los anexos del PDF…"></textarea>
        <label>📎 Materiales (fotos, PDF, Word)</label><input class="tw-f" type="file" multiple accept="image/*,.pdf,.docx,.txt"><div class="tw-fl"></div>
        <label class="hp-ck"><input type="checkbox" class="tw-fi" checked> 📄 Crear también la ficha de cada sesión (va dentro del cuaderno)</label>
        <label class="hp-ck"><input type="checkbox" class="tw-v" checked> 🎬 Dejar espacios para videos</label>
        <button class="hp-ok tw-go">✨ ¡Molí, arma la unidad!</button><p class="hp-msg tw-m"></p></div>
      <div class="tw-w" hidden><div class="tw-bar"><i></i></div><p class="tw-msg"></p><p class="tw-sub"></p><button class="hp-no tw-stop">⏹ Detener</button></div>
      <div class="tw-r" hidden></div>`, true);
    const $ = s => b.querySelector(s);
    const pintaFiles = () => { $('.tw-fl').innerHTML = W.files.map((f, i) => `<div class="tw-fi1"><span>${/pdf$/i.test(f.name) ? '📕' : /docx$/i.test(f.name) ? '📘' : /^image/.test(f.type) ? '🖼️' : '📄'} ${esc(f.name)}</span>
      <select data-i="${i}"><option value="0">General</option>${Array.from({ length: 14 }, (_, k) => `<option value="${k + 1}"${f._s === k + 1 ? ' selected' : ''}>Sesión ${k + 1}</option>`).join('')}</select><button data-q="${i}">✕</button></div>`).join(''); };
    $('.tw-f').addEventListener('change', e => { [...e.target.files].forEach(f => { if (f.size > 15e6) return; f._s = sesDeNombre(f.name); W.files.push(f); }); e.target.value = ''; pintaFiles(); });
    $('.tw-fl').addEventListener('change', e => { const s = e.target.closest('select'); if (s) W.files[+s.dataset.i]._s = +s.value; });
    $('.tw-fl').addEventListener('click', e => { const q = e.target.closest('[data-q]'); if (q) { W.files.splice(+q.dataset.q, 1); pintaFiles(); } });
    $('.tw-stop').addEventListener('click', () => { W.stop = true; $('.tw-msg').textContent = 'Deteniendo…'; });
    cerrarActual = () => { W.stop = true; };
    const prog = (msg, sub, k) => { $('.tw-msg').textContent = msg; $('.tw-sub').textContent = sub || ''; if (k != null) $('.tw-bar i').style.width = Math.round(k * 100) + '%'; };
    $('.tw-go').addEventListener('click', async () => {
      if (W.run) return; const uKey = $('.tw-u').value, unit = U.find(u => u.key === uKey); if (!unit) return;
      if (!Docente.conectado()) { $('.tw-m').textContent = errTxt({ message: 'AUTH' }); return; }
      if (!W.files.length && !L($('.tw-n').value)) { $('.tw-m').textContent = 'Sube tus materiales o escribe indicaciones para Molí.'; return; }
      W.run = true; W.stop = false; $('.hp-f').hidden = true; $('.tw-w').hidden = false; $('.tw-r').hidden = true;
      const fichas = $('.tw-fi').checked, videos = $('.tw-v').checked, nota = cut($('.tw-n').value, 3000), parar = () => W.stop;
      const reint = (k, why) => prog($('.tw-msg').textContent, `⏳ ${why === 'QUOTA' ? 'Límite por minuto de Google: Molí espera 1 minuto' : 'Google está ocupado'} y reintenta (${k})…`);
      try {
        prog('Molí está leyendo tus materiales…', `${W.files.length} archivo(s)`, .03);
        const P = await partes(W.files);
        prog('Molí arma el plan de la unidad…', 'Metas, criterios y rúbrica de cada sesión', .08);
        const plan = await MD.pensarCon(P, `Eres una docente experta de Ciencia y Tecnología de 6.° grado de primaria en Perú. Vas a armar la UNIDAD ${unit.num}${L(unit.title) ? ` («${unit.title}»)` : ''} completa (pon "num": "${unit.num}").
${ESTILO}CÓMO ARMAR LA UNIDAD COMPLETA:
1) Lee TODOS los materiales adjuntos y las indicaciones del profesor. Las indicaciones del profesor mandan sobre todo lo demás. Si un archivo dice «(Sesión N)», es material de la sesión N.
2) Identifica el propósito, el producto final y la rúbrica con sus criterios.
3) Toma la meta y los criterios de éxito de cada sesión tal como vienen en los materiales (si son largos, resúmelos en 3 criterios cortos que empiezan con verbo).
4) Si faltan sesiones o metas, créalas siguiendo la lógica del producto (indagación: observar, preguntar, hipótesis, variables, diseño, experimento, datos, interpretación, conclusión; o explicar: conocer, describir, relacionar, opinar, producir).
5) A cada sesión asígnale el criterio de la rúbrica que trabaja.
6) Propón flipped «para hoy» y «para la siguiente sesión» solo cuando hagan falta.
7) Las metas van en tercera persona y presente (Describe, Explica, Elabora), nunca en infinitivo.
8) Revisa CADA captura o página: no te saltes ninguna sesión que aparezca en los materiales.
Indicaciones del profesor: «${nota || '(ninguna)'}»
Devuelve "units" (una sola unidad) con "num", "title" (título corto), "product", "rubricName", "rubric" (criterios cortos) y "sessions": cada sesión con "meta" (una oración que empieza con verbo), "criteria" (exactamente 3 criterios cortos que empiezan con verbo), "rubric" (el criterio de la rúbrica que trabaja), "hoyT"/"hoyD" (flipped para hoy: título y descripción, o vacíos) y "sigT"/"sigD" (flipped para la siguiente sesión, o vacíos). Entre 2 y 14 sesiones. Además "aviso": 1 o 2 oraciones para el profesor sobre lo que faltó o tuviste que deducir (vacío si todo estaba completo).
IMPORTANTE: en cada sesión pon también "mat": un resumen (máximo 1500 caracteres) de lo que dicen los materiales sobre ESA sesión (sus actividades, textos, preguntas y su Exit ticket si lo trae).`, ESQ_PLAN,
          { maxTokens: 12288, timeout: 150000, parar, alReintentar: reint, validar: v => { const u = v && Array.isArray(v.units) && v.units[0]; if (!u || !Array.isArray(u.sessions) || u.sessions.length < 1) return null;
            u.sessions = u.sessions.slice(0, 14).map(s => ({ meta: cut(s.meta, 240), criteria: [...(s.criteria || []).map(c => cut(c, 120)), '', '', ''].slice(0, 3), rubric: cut(s.rubric, 200), mat: cut(s.mat, 1600), hoyT: cut(s.hoyT, 80), hoyD: cut(s.hoyD, 300), sigT: cut(s.sigT, 80), sigD: cut(s.sigD, 300) })).filter(s => L(s.meta));
            return u.sessions.length ? v : null; } });
        const U0 = plan.units[0], N = U0.sessions.length, pasos = N * (fichas ? 2 : 1); let hecho = 0;
        const etiquetados = W.files.some(f => f._s);
        const deSesion = k => { const F = W.files.filter(f => f._s === k); if (F.length) return { P: F.flatMap(f => P.de.get(f) || []), nota: '' };   // los archivos de esa sesión, completos
          return etiquetados ? { P: [], nota: '' } : { P, nota: `\nLos materiales adjuntos son de toda la unidad: usa SOLO lo que corresponde a la sesión ${k} («${U0.sessions[k - 1].meta}»).` }; };
        const sesiones = [];
        for (let s = 0; s < N; s++) {
          if (W.stop) throw new Error('STOP');
          const o = U0.sessions[s]; prog(`Sesión ${s + 1} de ${N}: actividades y Exit ticket…`, o.meta, .1 + .88 * hecho / pasos);
          const lista = U0.sessions.map((x, k) => `${k + 1}. ${x.meta}${k === s ? '  ← ESTA SESIÓN' : ''}`).join('\n');
          const SP = deSesion(s + 1);
          const r = await MD.pensarCon(SP.P, `Eres una docente experta de Ciencia y Tecnología de 6.° grado de primaria en Perú.${SP.nota}
${ESTILO}Unidad ${U0.num}: «${U0.title}». Producto: «${U0.product}». Rúbrica: ${(U0.rubric || []).join(' · ')}.
Sesiones de la unidad:
${lista}
ESTA SESIÓN (${s + 1}): meta «${o.meta}»; criterios de éxito: ${o.criteria.filter(L).join(' | ')}; criterio de la rúbrica: «${o.rubric}».${o.mat ? `\nLo que dicen los materiales del colegio sobre esta sesión (RESPÉTALO): «${o.mat}»` : ''}
Indicaciones del profesor: «${nota || '(ninguna)'}»
Crea:
- "activities": EXACTAMENTE 3: la 1 individual (presenta el material: casos, lectura, observación o video), la 2 colaborativa en equipos, la 3 individual (cada estudiante escribe su parte del producto con un andamio). Cada una con "title" (2 a 6 palabras, primera persona del plural, en presente), "desc" (máximo 200 caracteres, empieza con «En esta actividad» y sigue en FUTURO)${videos ? ' y "video": una búsqueda corta para YouTube (3 a 7 palabras, en español) de un video corto y apto para niños que ayude en esa actividad, o vacío si no hace falta (máximo 2 videos por sesión)' : ''}.
- "enfoque": "lectura", "andamios", "casos" o "experimento" según lo que prioriza la sesión.
- "ticket": 5 preguntas de opción múltiple (máximo 14 palabras) con 4 opciones MUY cortas (máximo 6 palabras), "answer" (0 a 3) y "why" (una oración). Español sencillo para 11 y 12 años.
RESPETA LA FICHA DEL COLEGIO: si los materiales de esta sesión traen sus actividades, usa esas mismas actividades en el mismo orden (con su sentido y contenido). Si traen su propio Exit ticket o preguntas de evaluación, úsalas tal cual (sólo adáptalas a 4 opciones si hace falta).`, ESQ_SES,
            { maxTokens: 4096, timeout: 90000, parar, alReintentar: reint, validar: v => { const a = (v && v.activities || []).slice(0, 3).filter(x => L(x.title)), q = (v && v.ticket || []).filter(x => L(x.q) && (x.options || []).filter(L).length >= 3);
              return a.length >= 2 && q.length >= 3 ? { a, q, enf: v.enfoque } : null; } });
          hecho++;
          const ses = { title: '', meta: o.meta, criteria: o.criteria, rubric: o.rubric, flipped2: { enabled: L(o.hoyT), title: o.hoyT, desc: o.hoyD, file: '' }, flipped: { enabled: L(o.sigT), title: o.sigT, desc: o.sigD, file: '' },
            activities: r.a.map((x, k) => ({ mode: k === 1 ? 'group' : 'individual', title: cut(x.title, 80), desc: cut(x.desc, 220), ficha: '', file: '', ...(videos && L(x.video) ? { ytq: cut(x.video, 80) } : {}) })),
            ticket: { questions: r.q.slice(0, 5).map(x => mezclar({ q: cut(x.q, 160), options: x.options.filter(L).slice(0, 4).map(t => cut(t, 60)), answer: Math.max(0, Math.min(3, +x.answer || 0)), why: cut(x.why, 200) })) }, hidden: false };
          if (fichas) {
            if (W.stop) throw new Error('STOP');
            prog(`Sesión ${s + 1} de ${N}: la ficha…`, ses.activities.map(a => a.title).join(' · '), .1 + .88 * hecho / pasos);
            try {
              const fx = await MD.pensarCon(SP.P, `Eres una docente experta de Ciencia y Tecnología de 6.° grado en Perú. Arma la FICHA de la sesión ${s + 1} que los estudiantes verán dentro de su cuaderno (y que también se imprime).${SP.nota}
Meta: «${o.meta}». Criterios: ${o.criteria.filter(L).join(' | ')}. Enfoque: ${r.enf || 'andamios'}.${o.mat ? `\nLo que dicen los materiales del colegio sobre esta sesión: «${o.mat}»` : ''}
Actividades:
${ses.activities.map((a, k) => `${k + 1}) (${a.mode === 'group' ? 'en equipos' : 'individual'}) «${a.title}»: ${a.desc}`).join('\n')}
REGLA DE ORO — RESPETA LA FICHA DEL COLEGIO: si los materiales traen la ficha de esta sesión, copia FIELMENTE su información y su estructura: los mismos apartados, en el MISMO orden, con sus textos informativos completos, sus consignas, sus preguntas y sus tablas (con los mismos encabezados). No resumas, no cambies datos, no inventes; sólo corrige la ortografía. Si una parte es una imagen o un dibujo, descríbela en una línea entre corchetes, por ejemplo [Imagen: ciclo del agua].
CÓMO SEPARAR: cada pregunta o consigna numerada de la ficha es UNA sección "pregunta" aparte (nunca juntes varias preguntas en una sola), sin su número al inicio. El encabezado (nombre del colegio, número de ficha) NO va como sección: úsalo para el "title". NO copies el Exit ticket de la ficha dentro de las secciones (va aparte, al final, en la tarjeta).
TABLAS: en "cols" van los encabezados exactos y en "items" lo que ya viene escrito en la primera columna de cada fila (por ejemplo los nombres), en orden; "rows" es el número de filas.
A TU ESTILO (Molí), OBLIGATORIO y sin quitar nada: un "title" atractivo y corto, un "subtitle" de una línea, en CADA pregunta abierta una pista corta ("help") y un inicio de oración para responder ("frame"), y un "sabias" (dato curioso real y corto sobre el tema). Marca con "own": true cada sección que agregues tú y que NO esté en la ficha del colegio.
Si NO hay ficha del colegio para esta sesión, créala tú con la misma estructura de las fichas del colegio (información primero y luego las preguntas en el orden de las actividades).
Devuelve "sections" en orden; cada una con "kind": "texto" (información: "heading" y "text" completo), "pregunta" (la consigna en "text", con "act" 1, 2 o 3, "help" y "frame"), "tabla" ("text" con la consigna, "cols" con los encabezados y "rows" con el número de filas, 2 a 8) o "lista" ("heading" e "items").`, ESQ_FICHA,
                { maxTokens: 8192, timeout: 120000, parar, alReintentar: reint, validar: v => v && L(v.title) && Array.isArray(v.sections) && v.sections.length ? v : null });
              let tot = 0;
              ses.fx = { v: 2, t: cut(fx.title, 90), st: cut(fx.subtitle, 160), sb: cut(fx.sabias, 260),
                s: (fx.sections || []).slice(0, 24).map(x => ({ k: ['texto', 'pregunta', 'tabla', 'lista'].includes(x.kind) ? x.kind : 'texto', h: cut(x.heading, 100), t: cut(x.text, 2200), a: +x.act || 0, hp: cut(x.help, 200), f: cut(x.frame, 160),
                  c: (x.cols || []).filter(L).slice(0, 5).map(c => cut(c, 50)), r: Math.max(2, Math.min(8, +x.rows || 3)), it: (x.items || []).filter(L).slice(0, 12).map(t => cut(t, 200)), o: x.own ? 1 : 0 })).map(x => ({ ...x, t: x.k === 'pregunta' ? x.t.replace(/^\s*\d+\s*[.)-]\s*/, '') : x.t }))
                  .filter(x => L(x.t) || L(x.h) || x.it.length).filter(x => (tot += JSON.stringify(x).length) < 14000) };
              ses.activities.forEach(a => { a.ficha = 'Ficha de la sesión'; });
            } catch (x) { if (x.message === 'STOP') throw x; }
            hecho++;
          }
          sesiones.push(ses);
        }
        prog('Publicando en el cuaderno de tus estudiantes…', '', .99);
        await MD.publicar(units => { const u = units.find(x => x.key === uKey); if (!u) throw new Error('NOUNIT'); u.sessions = sesiones; if (!L(u.title)) u.title = cut(U0.title, 80); u.hidden = false; });
        prog('¡Listo!', '', 1);
        $('.tw-w').hidden = true; const R = $('.tw-r'); R.hidden = false;
        R.innerHTML = `<div class="tw-ok"><img src="img/moli/estrellas.webp" alt=""><div><b>✅ ¡Unidad ${esc(U0.num)} lista y publicada!</b><span>Ya está en el cuaderno de sesiones de tus estudiantes: ${N} sesiones${fichas ? ' con su ficha' : ''}${videos ? ' y espacios para videos' : ''}.</span></div></div>
          ${L(plan.aviso) ? `<p class="hp-tip">💬 Molí: ${esc(cut(plan.aviso, 300))}</p>` : ''}
          <ol class="tw-ls">${sesiones.map((s, k) => `<li><b>Sesión ${k + 1}.</b> ${esc(s.meta)}<br><small>${s.activities.map(a => esc(a.title)).join(' · ')} · 🎟️ ${s.ticket.questions.length} preguntas${s.fx ? ' · 📄 ficha' : ''}${s.activities.some(a => a.ytq) ? ' · 🎬 video' : ''}</small></li>`).join('')}</ol>
          <p class="hp-tip">✏️ Si quieres cambiar algo, abre el cuaderno de sesiones y toca «Editar sesión». Para los videos, pega el enlace de YouTube que elijas.</p>`;
      } catch (e) {
        $('.tw-w').hidden = true; $('.hp-f').hidden = false;
        $('.tw-m').textContent = e.message === 'STOP' ? '⏹ Detenido. No se cambió nada en el cuaderno.' : e.message === 'GRANDE' ? 'El cuaderno quedó muy grande: desmarca las fichas e intenta otra vez.' : errTxt(e);
      }
      W.run = false;
    });
  }

  // =================================================================
  //  📦 SESIONES PREPARADAS: una unidad ya armada (data/*.json) fiel a las fichas del colegio; la docente la revisa y la publica
  // =================================================================
  const OFF = { enabled: false, title: '', desc: '', file: '' };
  async function preparadas() {
    const b = abrir('📦 Sesiones preparadas', 'Tus sesiones con sus fichas del colegio, listas para publicar.', 'estrellas', '<p class="hp-tip">Cargando…</p>', true);
    let P, T = [];
    try { P = await (await fetch('data/unidad7.json?v=' + Date.now(), { cache: 'no-store' })).json(); await MD.cargar(); }
    catch (e) { b.innerHTML = '<p>📶 No pude cargar las sesiones preparadas. Revisa tu internet.</p>'; return; }
    try { T = await Docente.ticketsUnidad(P.unit); } catch (e) { b.innerHTML = `<p>${errTxt(e)}</p>`; return; }
    const u = MD.unidades().find(x => x.key === P.unit) || { sessions: [] };
    // ¿la unidad todavía tiene la numeración de antes? (su sesión 1 era la de enfermedades) → se renumera como el colegio y sus registros se mudan
    const R = P.renum, viejo = !!(R && new RegExp(R.si, 'i').test(String((u.sessions[0] || {}).meta || '')));
    const base = c => c % 30, cod = t => +t.session;
    const mover = viejo ? T.filter(t => R.mover.includes(base(cod(t))) && cod(t) < 90) : [], quitar = viejo ? T.filter(t => R.quitar.includes(base(cod(t))) && cod(t) < 90) : [];
    const deN = x => viejo ? x.de : x.n;                                // de qué sesión publicada sale cada sesión nueva
    const hechos = {}; T.forEach(t => { const n = cod(t); if (n > 0 && n < 30) hechos[n] = (hechos[n] || 0) + 1; });
    b.innerHTML = `<p class="hp-tip">📘 <b>Unidad ${esc(P.num)} · ${esc(P.titulo)}</b> · ${P.sesiones.length} sesiones como en el colegio. Cada una trae su ficha en PDF (1 o 2 hojas, fiel al anexo, para imprimir), meta, criterios, 3 actividades y su Exit ticket de 5 preguntas. Se mantienen tus archivos y videos; si un Exit ticket ya fue respondido, sus preguntas no se cambian (a menos que lo marques).</p>
      ${viejo ? `<p class="hp-tip">🔢 Tu unidad tenía otra numeración: ahora la <b>Sesión 1 es Bebras</b> y enfermedades pasa a ser la <b>Sesión 2</b>.${mover.length ? ` Muevo ${mover.length} registros (Exit tickets y notas) de la sesión 1 a la 2.` : ''}${quitar.length ? ` Quito ${quitar.length} registros de la antigua sesión 2 (la tarea de microorganismos, que ahora es la tarea flipped de la sesión 2).` : ''}</p>` : ''}
      <div class="pq-ls">${P.sesiones.map(x => { const q = x.ticket && x.ticket.questions ? x.ticket.questions.length : -1, d = deN(x), h = d ? hechos[d] || 0 : 0, ya = d && u.sessions[d - 1];
        return `<div class="pq-s"><input type="checkbox" data-n="${x.n}" id="pq${x.n}" checked><span><label for="pq${x.n}"><b>Sesión ${x.n} · ${esc(x.title)}</b><small>${ya ? '🔄 reemplaza la actual' : '🆕 sesión nueva'} · 📄 ficha · 🧪 ${x.activities.length} actividades · ${q > 0 ? `🎟️ ${q} preguntas (${x.ticket.questions.some(z => !z.m) ? 'del colegio' + (x.ticket.questions.some(z => z.m) ? ' + Molí' : '') : 'de Molí'})` : q === 0 ? '🎟️ sin Exit ticket' : '🎟️ se mantiene el actual'}</small></label>
          ${q > 0 && h ? `<small class="pq-av">⚠️ ${h} ya respondieron su Exit ticket: se mantienen sus preguntas. <label><input type="checkbox" data-r="${x.n}"> Reemplazar igual</label></small>` : ''}</span></div>`; }).join('')}</div>
      <button class="hp-ok" data-h="pub">📤 Publicar las sesiones marcadas</button><p class="hp-msg"></p>`;
    b.querySelector('[data-h="pub"]').addEventListener('click', async e => {
      const bt = e.currentTarget, m = b.querySelector('.hp-msg'), sel = new Set([...b.querySelectorAll('[data-n]:checked')].map(i => +i.dataset.n)), rep = new Set([...b.querySelectorAll('[data-r]:checked')].map(i => +i.dataset.r));
      if (!sel.size) { m.textContent = 'Marca al menos una sesión.'; return; }
      if (viejo && sel.size < P.sesiones.length) { m.textContent = 'Como cambia la numeración, esta vez publica todas las sesiones juntas.'; return; }
      bt.disabled = true;
      try {
        if (viejo && (quitar.length || mover.length)) {                // 1) los registros se mudan a su nueva sesión (sin perder nada)
          const D = id => Docente.DOC('exitTickets', id), paso = async (W, txt) => { for (let k = 0; k < W.length; k += 200) { m.textContent = `${txt} (${Math.min(k + 200, W.length)} de ${W.length})…`; await Docente.commit(W.slice(k, k + 200)); } };
          await paso(quitar.map(t => ({ delete: D(t.id) })), 'Quitando los registros de la antigua sesión 2');
          await paso(mover.flatMap(t => { const n = cod(t) + 1, rec = { unit: t.unit, unitNum: String(t.unitNum || P.num), session: n, grade: t.grade || '6to', section: t.section, name: t.name, student: t.student, dni: t.dni, score: t.score, total: t.total, answers: t.answers, createdAt: new Date(t.createdAt || Date.now()) };
            return [{ update: { name: D(`${t.unit}-s${n}-${t.student}`), fields: Docente.toF(rec) }, currentDocument: { exists: false } }, { delete: D(t.id) }]; }), 'Moviendo los registros de la sesión 1 a la 2');
        }
        // 2) las fichas en PDF también se guardan como archivos de Molí (así Molí 1 las muestra en «Ver ficha»)
        const ARCH = {}, b64 = buf => { const u8 = new Uint8Array(buf); let t = ''; for (let k = 0; k < u8.length; k += 32768) t += String.fromCharCode.apply(null, u8.subarray(k, k + 32768)); return btoa(t); };
        const subir = async (url, id, name) => { const buf = await (await fetch(url, { cache: 'no-store' })).arrayBuffer(), t = b64(buf), parts = Math.ceil(t.length / 880000);
          for (let k = 0; k < parts; k++) await Docente.commit([{ update: { name: Docente.DOC('files', `${id}-${k}`), fields: Docente.toF({ b64: t.slice(k * 880000, (k + 1) * 880000), updatedAt: new Date() }) } }]);
          ARCH[id] = { name, type: 'application/pdf', size: buf.byteLength, parts }; };
        const SS = P.sesiones.filter(x => sel.has(x.n));
        for (const [k, x] of SS.entries()) { m.textContent = `Subiendo las fichas en PDF (${k + 1} de ${SS.length})…`;
          if (x.pdf) await subir(x.pdf, `fu${P.num}s${x.n}`, `Ficha · Unidad ${P.num} · Sesión ${x.n}.pdf`);
          if (x.tareaPdf) await subir(x.tareaPdf, `fu${P.num}s${x.n}t`, `Tarea flipped · Unidad ${P.num} · Sesión ${x.n}.pdf`); }
        m.textContent = 'Publicando…';
        await MD.publicar((units, D) => {                                // 3) las sesiones
          D.files = { ...(D.files || {}), ...ARCH };
          const U = units.find(x => x.key === P.unit); if (!U) throw new Error('NOUNIT');
          const antes = U.sessions.slice(), vacia = () => ({ title: '', meta: '', criteria: ['', '', ''], rubric: '', flipped: OFF, flipped2: OFF, activities: [], ticket: { questions: [] }, hidden: false });
          if (viejo) U.sessions = P.sesiones.map(x => vacia());
          P.sesiones.filter(x => sel.has(x.n)).forEach(x => {
            const d = deN(x), s0 = (d && antes[d - 1]) || vacia(), A0 = s0.activities || [];
            const s = { ...s0, title: x.title, meta: x.meta, criteria: x.criteria, rubric: x.rubric, flipped: { ...OFF, ...x.flipped, file: (s0.flipped || {}).file || '' }, flipped2: { ...OFF, ...x.flipped2, file: (s0.flipped2 || {}).file || '' }, fx: x.fx };
            if ('hidden' in x) s.hidden = x.hidden;
            s.activities = x.activities.map((a, k) => ({ ...(A0[k] || {}), ficha: 'Ficha de la sesión', file: k === 0 && x.pdf ? `fu${P.num}s${x.n}` : '', mode: a.mode, title: a.title, desc: a.desc }));   // se quedan sus videos; una sola ficha por sesión
            if (x.pdf) s.pdf = x.pdf; if (x.tareaPdf) { s.tareaPdf = x.tareaPdf; s.flipped.file = `fu${P.num}s${x.n}t`; } if (x.tarea) s.tarea = x.tarea;
            if (!(d && hechos[d] && !rep.has(x.n) && s0.ticket && (s0.ticket.questions || []).length)) s.ticket = x.ticket;   // si ya lo respondieron, se quedan sus preguntas
            while (U.sessions.length < x.n - 1) U.sessions.push(vacia());
            U.sessions[x.n - 1] = s;
          });
        });
        m.innerHTML = `✅ ¡Listo! Publiqué ${sel.size} ${sel.size === 1 ? 'sesión' : 'sesiones'}${viejo && mover.length ? ` y moví ${mover.length} registros a la sesión 2` : ''}. Ya están en el cuaderno de sesiones (y en Molí 1). Revisa cada una y, si quieres, toca «✏️ Editar sesión».`;
      } catch (x) { bt.disabled = false; m.textContent = x.message === 'NOUNIT' ? 'No encontré la unidad en tus sesiones.' : x.message === 'GRANDE' ? 'El contenido quedó muy grande.' : errTxt(x); }
    });
  }

  // ---- qué abre cada botón del fotocheck ----
  const H = { cuenta: crearCuenta, trabajar, preparadas };
  addEventListener('moli2:herramienta', e => { const f = H[e.detail] || (window.Herramientas && window.Herramientas.extra && window.Herramientas.extra[e.detail]); if (f) f(); });
  window.Herramientas = { abrir, cerrar, esc, extra: {}, set cerrarActual(f) { cerrarActual = f; } };
})();
