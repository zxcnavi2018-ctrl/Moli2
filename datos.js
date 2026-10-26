// ===================================================================
//  MOLÍ 2 · DATOS: se conecta al mismo Firebase de Molí (sesiones, Exit tickets, notas, misiones).
//  Sólo lee y escribe lo mismo que Molí; no cambia nada de Molí 1.
// ===================================================================
(function () {
  const FB = { projectId: 'ciencia6abcd', apiKey: 'AIzaSyB3IlHEFGkCGtZhPZxV5-a47Pg2mAaIjSM' };
  const BASE = `https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents`;
  const DOC = (col, id) => `projects/${FB.projectId}/databases/(default)/documents/${col}/${id}`;
  // ---- espacios: cada docente con su propio corcho (unidades, sesiones, Exit tickets, misiones y notas).
  //  '' = Ciencia 6.° (el de siempre: config/content, mis1) · 'c7' = Ciencia 7.° (config/content-c7, mis1-c7). Lo común: el aula, los juegos y Molí.
  const ESPS = { '': { g: '6to', gn: '6°', txt: '6.° grado de primaria', edad: '11 y 12 años', area: 'Ciencia y Tecnología' },
    c7: { g: '7mo', gn: '7°', txt: '7.° grado', edad: '12 y 13 años', area: 'Ciencia y Tecnología' } };
  // códigos de Molí para las otras notas que registra la docente (en la misma colección de Exit tickets)
  const PART = 30, PROD = 50, CUAD = 51, COND = 60, TRAB = 80;            // TRAB + n: trabajo en clase de la sesión n (rúbrica)

  // ---- formato de Firestore ----
  const toV = v => typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
    : typeof v === 'boolean' ? { booleanValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(toV) } }
    : v instanceof Date ? { timestampValue: v.toISOString() } : v && typeof v === 'object' ? { mapValue: { fields: toF(v) } } : { stringValue: String(v) };
  const toF = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, toV(v)]));
  const fromV = v => 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'booleanValue' in v ? v.booleanValue
    : 'timestampValue' in v ? Date.parse(v.timestampValue) : 'arrayValue' in v ? (v.arrayValue.values || []).map(fromV)
    : 'stringValue' in v ? v.stringValue : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, fromV(x)])) : null;
  const fromDoc = d => { const o = {}; Object.entries(d.fields || {}).forEach(([k, v]) => o[k] = fromV(v)); o.id = d.name.split('/').pop(); return o; };
  async function get(col, id) {
    const r = await fetch(`${BASE}/${col}/${id}?key=${FB.apiKey}`);
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return fromDoc(await r.json());
  }

  // ---- guardado local ----
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const ME_KEY = 'moli2:me', ME_MOLI1 = 'ciencia4b:me:1ba4092d0e';

  // ---- el alumno: su id sale de su DNI (igual que en Molí) ----
  async function idDeDni(dni) {
    const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ciencia6|' + dni));
    return 'k' + [...new Uint8Array(h)].slice(0, 10).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  function yo() {
    const q = new URLSearchParams(location.search);
    if (q.get('seccion')) return { key: 'demo-' + q.get('seccion'), dni: '00000000', name: q.get('nombre') || 'Estudiante', section: q.get('seccion').toUpperCase(), demo: 1 };
    const m = LS.get(ME_KEY, null); if (m && m.key) return m;
    const m1 = LS.get(ME_MOLI1, null);                                      // si ya entró en Molí en este mismo sitio, también vale
    return m1 && m1.key && !m1.teacher && !m1.demo ? m1 : null;
  }
  // ---- entrar: con su DNI o con su código de 8 números (00000 y los 3 últimos de su DNI). Si el código es de varios, elige su nombre ----
  async function candidatos(t) {                                       // índices que publica la docente: files/fcod-0 (6.°) y files/fcodc7-0 (7.°)
    const L = [];
    for (const e of Object.keys(ESPS)) {
      try { const r = await fetch(`${BASE}/files/fcod${e}-0?key=${FB.apiKey}`, { cache: 'no-store' }); if (!r.ok) continue;
        const j = await r.json(), v = j.fields && j.fields.b64 && j.fields.b64.stringValue, x = v ? JSON.parse(decodeURIComponent(escape(atob(v)))) : null;
        ((x && x.codes && x.codes[t]) || []).forEach(c => L.push(c)); } catch (er) {}
    }
    return L;
  }
  async function entrar(num, elegido) {
    num = String(num || '').replace(/\D/g, '').slice(0, 8);
    if (num.length !== 8) throw new Error('DNI');
    if (window.Docente) { const d = await Docente.quien(num); if (d) { const e = new Error('DOCENTE'); e.info = d; throw e; } }   // DNI de docente: pide su clave
    let key = await idDeDni(num), st = await get('students', key);
    if (/^00000\d{3}$/.test(num)) {                                    // su código (o una cuenta creada con ese DNI falso)
      const C = await candidatos(num.slice(-3)), c = elegido ? C.find(x => x.k === elegido) : !st && C.length === 1 ? C[0] : null;
      if (!c && C.length > 1) { const e = new Error('VARIOS'); e.lista = C; throw e; }   // el número es de varios: elige su nombre
      if (c && /^k[0-9a-f]{20}$/.test(c.k) && c.k !== key) { key = c.k; st = await get('students', key); }
    }
    if (!st) throw new Error('NOEXISTE');
    const me = { key, dni: String(st.dni || num), name: st.name, section: st.section, grade: st.grade || '6to' };   // (el DNI de verdad: con él se guardan sus Exit tickets)
    LS.set(ME_KEY, me); return me;
  }
  function salir() { try { localStorage.removeItem(ME_KEY); } catch (e) {} if (window.Docente) Docente.salirCuenta(); }
  const esDocente = () => { const m = yo(); return !!(m && (m.docente || m.teacher)); };
  function esp() {                                                     // el corcho de quien entró: docente → su espacio; estudiante → el de su grado
    const m = yo();
    if (m && (m.docente || m.teacher)) { const e = m.tipo === 'owner' ? LS.get('moli2:esp', '') : m.esp || ''; return ESPS[e] ? e : ''; }
    return m && m.grade === '7mo' ? 'c7' : '';
  }
  const espInfo = () => ({ k: esp(), ...ESPS[esp()] });
  ESPS[''].profe = 'Christian Quispe Llerena';                        // el nombre del docente de cada corcho (diplomas y artículos en PDF)
  const profe = () => ESPS[esp()].profe || 'tu profe';
  if (esp()) get('config', 'site').then(st => Object.entries((st && st.tchG) || {}).forEach(([, v]) => { const [k, n] = String(v).split('|'); if (ESPS[k] && n) ESPS[k].profe = n; })).catch(() => {});
  const GRADE_ = () => ESPS[esp()].g;
  const CONT = () => esp() ? 'content-' + esp() : 'content', MIS = () => esp() ? 'mis1-' + esp() : 'mis1';
  const MISD = me => 'm1' + esp() + '-' + me.key;                     // avance de misiones del estudiante (m1-… en 6.°, m1c7-… en 7.°)
  const fid = base => base + esp() + '-0';                             // archivos sueltos de cada corcho (candados, videos, corcho, muro)
  const E0 = esp();                                                    // si al entrar o salir cambia de corcho, se vuelve a abrir el aula
  addEventListener('moli2:me', () => { if (esp() !== E0) setTimeout(() => location.reload(), 300); });

  // ---- contenido: unidades y sesiones ----
  let contenido = null, misiones = null;
  async function cargar() {
    if (contenido) return contenido;
    const c = await get('config', CONT());
    const units = [];
    for (let i = 0; i < 24; i++) { const s = c && c['u' + i]; if (!s) continue; try { units.push(JSON.parse(s)); } catch (e) {} }
    let files = {}; try { files = JSON.parse((c && c.data) || '{}').files || {}; } catch (e) {}
    if (!esp()) try { const r = await fetch('data/ticket-u7s1.json', { cache: 'no-cache' }); if (r.ok) { const T = await r.json();      // Exit ticket nuevo de la Sesión 1 (Unidad 7), puesto directo
      const u = units.find(x => String(x.num) === String(T.unidad)), s = u && u.sessions && u.sessions[T.sesion - 1]; if (s && Array.isArray(T.questions) && T.questions.length) s.ticket = { ...(s.ticket || {}), questions: T.questions }; } } catch (e) {}
    if (!esp()) try { const r = await fetch('data/unidad7.json', { cache: 'no-cache' }); if (r.ok) { const P = await r.json();   // sesiones de la Unidad 7 sin ficha (cuaderno y papelote), puestas directo
      const u = units.find(x => String(x.num) === String(P.num));
      if (u && u.sessions) P.sesiones.filter(x => x.sinFicha).forEach(x => { const s = u.sessions[x.n - 1]; if (!s) return; const A0 = s.activities || [];
        Object.assign(s, { title: x.title, meta: x.meta, criteria: x.criteria }); if (x.ticket && x.ticket.questions) s.ticket = { ...(s.ticket || {}), ...x.ticket }; delete s.fx; delete s.pdf;
        s.activities = x.activities.map((a, k) => { const v = { ...(A0[k] || {}), mode: a.mode, title: a.title, desc: a.desc, ficha: '', file: '' }; ['cu', 'ej', 'nx'].forEach(c => { if (a[c]) v[c] = a[c]; else delete v[c]; }); return v; }); }); } } catch (e) {}
    contenido = { units, files };
    LS.set('moli2:content' + esp(), contenido);
    return contenido;
  }
  async function abrirPdf(url, id, nombre) {                          // la ficha en PDF, para ver y descargar (como en Molí 1)
    const w = window.open('', '_blank');
    try {
      let blob;
      if (url) { const r = await fetch(url); if (!r.ok) throw new Error('HTTP'); blob = await r.blob(); }
      else { const f = (contenido && contenido.files || {})[id]; if (!f) throw new Error('NOFILE');
        const P = []; for (let i = 0; i < (+f.parts || 1); i++) { const d = await get('files', `${id}-${i}`); P.push(d && d.b64 || ''); }
        const bin = atob(P.join('')), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        blob = new Blob([u8], { type: f.type || 'application/pdf' }); nombre = nombre || f.name; }
      const href = URL.createObjectURL(new File([blob], nombre || 'ficha.pdf', { type: 'application/pdf' }));
      if (w) w.location.href = href; else { const a = document.createElement('a'); a.href = href; a.download = nombre || 'ficha.pdf'; a.click(); }
      return true;
    } catch (e) { if (w) w.close(); throw e; }
  }
  const lleno = t => !!String(t || '').trim();
  const unidades = () => (contenido ? contenido.units : []).filter(u => !u.hidden && lleno(u.title));
  const sesionesDe = u => (u.sessions || []).map((s, i) => ({ s, n: i + 1 })).filter(x => !x.s.hidden && (lleno(x.s.meta) || lleno(x.s.title) || (x.s.activities || []).some(a => lleno(a.title) || lleno(a.desc))));
  const preguntas = s => ((s.ticket && s.ticket.questions) || []).map(q => ({ q: q.q, why: q.why || '', opts: (q.options || []).map((t, i) => ({ t, i })).filter(o => lleno(o.t)), answer: q.answer })).filter(q => lleno(q.q) && q.opts.length >= 2);

  // ---- la docente edita una sesión: se trae lo último publicado, se cambia sólo esa sesión y se publica igual que Molí ----
  const cH = e => { let t = 5381; for (let a = 0; a < e.length; a++) t = 33 * t + e.charCodeAt(a) | 0; return (t >>> 0).toString(36) + e.length.toString(36); };
  const cSplit = e => { const t = e.units.map(x => JSON.stringify(x)), a = t.map(cH), o = { data: JSON.stringify({ ...e, units: e.units.map((x, i) => ({ key: x.key, _s: i })), hs: a }), h: JSON.stringify(a) }; t.forEach((x, i) => o['u' + i] = x); return o; };
  async function crudo() {
    const c = await get('config', CONT());
    if (!c) { if (esp()) return { d: { files: {} }, units: [], savedAt: 0 }; throw new Error('VACIO'); }   // corcho nuevo: empieza vacío
    const d = JSON.parse(c.data || '{}'); let units = d.units || [];
    if (units.length && '_s' in units[0]) units = units.map(x => JSON.parse(c['u' + x._s]));
    return { d, units, savedAt: +c.savedAt || +d.savedAt || 0 };
  }
  async function publicar(cambiar) {                                   // cambiar(units) modifica las unidades; luego se publica todo
    const { d, units, savedAt } = await crudo();
    await cambiar(units, d);
    const n = Math.max(Date.now(), savedAt + 1), obj = { ...d, savedAt: n, units }; delete obj.hs;
    const full = JSON.stringify(obj); if (full.length > 9e5) throw new Error('GRANDE');
    const fields = units.length <= 24 ? { ...cSplit(obj), savedAt: n, updatedAt: new Date() } : { data: full, savedAt: n, updatedAt: new Date() };
    await Docente.commit([{ update: { name: DOC('config', CONT()), fields: toF(fields) } }]);
    contenido = null; LS.set('moli2:content' + esp(), null); await cargar(); return true;
  }
  const guardarSesion = (uKey, n, s, archivos) => publicar((units, d) => { const u = units.find(x => x.key === uKey); if (!u || !u.sessions[n - 1]) throw new Error('NOSES'); u.sessions[n - 1] = s;
    if (archivos) d.files = { ...(d.files || {}), ...archivos }; });            // archivos: las fichas PDF que subió en esta sesión
  const sesVacia = () => ({ title: '', meta: '', criteria: ['', '', ''], rubric: '', flipped: { enabled: false, title: '', desc: '', file: '' }, flipped2: { enabled: false, title: '', desc: '', file: '' }, activities: [], ticket: { questions: [] }, hidden: false });
  // ➕ unidad nueva (clave con el espacio delante, para que no choque con las de otro corcho: c7unit1…)
  const nuevaUnidad = (num, title, icon) => publicar(units => {
    num = String(num || '').trim(); if (!num) throw new Error('NUM');
    const key = esp() + 'unit' + num.replace(/[^0-9a-z]/gi, '').toLowerCase();
    if (units.some(u => u.key === key)) throw new Error('YA');
    units.push({ key, num, title: String(title || '').trim() || 'Unidad ' + num, icon: icon || '📘', sessions: [] });
  });
  const nuevaSesion = uKey => publicar(units => { const u = units.find(x => x.key === uKey); if (!u) throw new Error('NOSES'); u.sessions = u.sessions || []; if (u.sessions.length >= 30) throw new Error('MUCHAS'); u.sessions.push({ ...sesVacia(), title: 'Sesión ' + (u.sessions.length + 1) }); });
  // 📄 ficha en PDF que sube la docente: va a files/<id>-<k> (en trozos) y queda anotada en el contenido
  async function subirArchivo(file) {
    if (!file || file.size > 12e6) throw new Error('GRANDE');
    const buf = new Uint8Array(await file.arrayBuffer()); let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    const b = btoa(bin), id = 'f' + (esp() || 'c6') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), parts = Math.ceil(b.length / 880000);
    for (let k = 0; k < parts; k++) await Docente.commit([{ update: { name: DOC('files', `${id}-${k}`), fields: toF({ b64: b.slice(k * 880000, (k + 1) * 880000), updatedAt: new Date() }) } }]);
    return { id, info: { name: String(file.name || 'ficha.pdf').slice(0, 80), type: file.type || 'application/pdf', parts } };
  }
  const sesionCruda = async (uKey, n) => { const { units } = await crudo(); const u = units.find(x => x.key === uKey); return u && JSON.parse(JSON.stringify(u.sessions[n - 1] || null)); };

  // ---- Exit tickets ----
  const ticketId = (u, n, k) => `${u}-s${n}-${k}`;
  async function ticket(unit, n, me) { const t = await get('exitTickets', ticketId(unit, n, me.key)); return t && (!t.dni || t.dni === me.dni) ? t : null; }
  async function guardarTicket(me, u, n, answers) {
    const score = answers.filter(Boolean).length, total = answers.length;
    const res = { unit: u.key, unitNum: String(u.num), session: n, grade: GRADE_(), section: me.section, name: me.name, student: me.key, dni: me.dni, score, total, answers, createdAt: new Date() };
    if (me.demo) { LS.set('moli2:demo:' + ticketId(u.key, n, me.key), { ...res, createdAt: Date.now() }); return { ...res, createdAt: Date.now() }; }
    const body = { writes: [{ update: { name: DOC('exitTickets', ticketId(u.key, n, me.key)), fields: toF(res) }, currentDocument: { exists: false } }] };
    const r = await fetch(`${BASE}:commit?key=${FB.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) { const e = await r.json().catch(() => ({})), st = e.error && e.error.status; if (st === 'ALREADY_EXISTS' || st === 'FAILED_PRECONDITION') return ticket(u.key, n, me); throw new Error(st || 'HTTP ' + r.status); }
    return { ...res, createdAt: Date.now() };
  }
  // 💪 refuerzo marcado a mano por la docente (Realizado / Pendiente), por unidad: files/frf<unidad>-0 → { s: { claveEstudiante: { n: 'ok' | 'pe' } } }
  const RFF = k => 'frf' + String(k).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) + '-0';
  async function refuerzoManual(uKey) {
    try { const r = await fetch(`${BASE}/files/${RFF(uKey)}?key=${FB.apiKey}`, { cache: 'no-store' }); if (!r.ok) return {};
      const j = await r.json(), v = j.fields && j.fields.b64 && j.fields.b64.stringValue; return v ? (JSON.parse(decodeURIComponent(escape(atob(v)))).s || {}) : {}; } catch (e) { return {}; }
  }
  async function ticketsDe(u, me) {                                      // los Exit tickets de la unidad (y las notas que registra la docente)
    if (me.demo) { const o = {}; sesionesDe(u).forEach(({ n }) => { const t = LS.get('moli2:demo:' + ticketId(u.key, n, me.key), null); if (t) o[n] = t; }); return o; }
    const ns = []; sesionesDe(u).forEach(({ n }) => ns.push(n, PART + n, COND + n, TRAB + n)); ns.push(PROD, CUAD);
    const o = {};
    for (let i = 0; i < ns.length; i += 12) await Promise.all(ns.slice(i, i + 12).map(async n => { try { const t = await ticket(u.key, n, me); if (t) o[n] = t; } catch (e) {} }));
    return o;
  }

  // ---- notas (igual que Molí): AD / A / B / C ----
  const NIVEL = [{ k: 'AD', name: 'Logro destacado', min: .9, color: '#12224a', ink: '#fff' }, { k: 'A', name: 'Logro esperado', min: .7, color: '#2f6fed', ink: '#fff' },
    { k: 'B', name: 'En proceso', min: .5, color: '#8fb2f5', ink: '#12224a' }, { k: 'C', name: 'En inicio', min: 0, color: '#c9dafb', ink: '#12224a' }];
  const CONDUCTA = { AD: { f: '😄', name: 'Muy bueno' }, A: { f: '🙂', name: 'Bueno' }, B: { f: '😐', name: 'Intermedio' }, C: { f: '😢', name: 'Por mejorar' } };
  const frac = r => r && r.total ? r.score / r.total : 0;
  const nivel = r => NIVEL.find(l => frac(r) >= l.min - 1e-9);
  const partic = r => r ? Math.max(1, Math.min(4, Math.round(r.score / (r.total || 4) * 4))) : 0;
  const promedio = L => { L = L.filter(Boolean); return L.length ? { score: Math.round(L.reduce((a, r) => a + frac(r), 0) / L.length * 100), total: 100 } : null; };

  // ---- misiones de refuerzo ----
  async function cargarMisiones() {
    if (misiones) return misiones;
    const c = await get('config', MIS()); let d = null; try { d = JSON.parse(c.data || 'null'); } catch (e) {}
    misiones = d && Array.isArray(d.ms) ? d.ms : [];
    return misiones;
  }
  async function publicarMisiones(cambiar) {                          // 💪 la docente crea o borra misiones: se trae lo último, se cambia y se guarda
    const c = await get('config', MIS()); let d = null; try { d = JSON.parse((c && c.data) || 'null'); } catch (e) {}
    d = d && typeof d === 'object' ? d : {}; d.ms = Array.isArray(d.ms) ? d.ms : [];
    await cambiar(d.ms);
    const data = JSON.stringify(d); if (data.length > 4e5) throw new Error('GRANDE');
    await Docente.commit([{ update: { name: DOC('config', MIS()), fields: toF({ data, updatedAt: new Date() }) } }]);
    misiones = null; return cargarMisiones();
  }
  const misionesDe = uKey => (misiones || []).filter(m => m.acts && m.acts.length && m.ses && m.ses.u === uKey && (() => {
    const u = (contenido ? contenido.units : []).find(x => x.key === uKey), s = u && u.sessions[m.ses.n - 1]; return u && !u.hidden && s && !s.hidden; })());
  const progKey = me => 'moli2:mis:' + (me ? me.key : 'anon');
  async function avance(me) {
    let p = LS.get(progKey(me), {});
    if (me && !me.demo) try { const d = await get('mision', MISD(me)); if (d && d.p) { const r = JSON.parse(d.p); Object.entries(r).filter(([k, v]) => Array.isArray(v)).forEach(([k, [err, last, n]]) => { if (!p[k] || (p[k].n || 0) < n) p[k] = { err, last, n }; }); } } catch (e) {}
    LS.set(progKey(me), p); return p;
  }
  let subirT = 0;
  function marcarActividad(me, id, errores) {
    if (id != null) { const p = LS.get(progKey(me), {}), t = p[id];
      p[id] = { err: t ? Math.min(t.err, errores) : errores, last: errores, n: (t && t.n || 0) + 1, at: Date.now() };
      LS.set(progKey(me), p); }
    if (!me || me.demo) return;
    clearTimeout(subirT); subirT = setTimeout(async () => {
      const q = {}; Object.entries(LS.get(progKey(me), {})).forEach(([k, v]) => q[k] = [v.err, v.last, v.n]);
      const lab = labDe(me); if (Object.keys(lab).length) q._lab = lab;                  // también el avance del laboratorio (lo ve la docente)
      try { await fetch(`${BASE}/mision/${MISD(me)}?key=${FB.apiKey}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: toF({ p: JSON.stringify(q), n: String(me.name).slice(0, 60), sec: me.section, at: new Date() }) }) }); } catch (e) {}
    }, 1500);
  }
  // ---- laboratorio: cuántos pasos lleva en cada juego (se guarda junto a sus misiones) ----
  const LAB = { circ: 2, plac: 2, ener: 3, evo: 4, enf: 3, maq: 3, sol: 2, luna: 3, cad: 4, eco2: 3, tens: 4, orig: 4, lama: 3, vuln: 4, cin: 4, grav: 4 };
  function labDe(me) { const o = {}; Object.keys(LAB).forEach(k => { const v = LS.get('lab:' + me.key + ':' + k, null); if (v && typeof v === 'object') { const c = Math.min(LAB[k], Object.values(v).filter(Boolean).length); if (c) o[k] = c; } }); return o; }
  function subirLab(me) { if (!me || me.demo || me.docente) return; marcarActividad(me, null); }
  const misionCompleta = (m, p) => m.acts.length > 0 && m.acts.every(a => p[a.id]);

  // ---- Molí piensa (Gemini por Firebase, el mismo que usa Molí); si no responde, se usan preguntas de plantilla ----
  const MODELOS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];
  // con archivos (imágenes, PDF, texto) y más espacio: lo usa «Trabajar con Molí»
  async function pensarCon(parts, prompt, schema, opt = {}) {
    const body = JSON.stringify({ contents: [{ role: 'user', parts: [...parts, { text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: .8, maxOutputTokens: opt.maxTokens || 8192 } });
    const lista = [...MODELOS], vistos = new Set(); let ultimo = 'IA';
    for (let vuelta = 0; vuelta < (opt.intentos || 3); vuelta++) {
      for (const m of lista) {
        if (opt.parar && opt.parar()) throw new Error('STOP');
        const ac = new AbortController(), to = setTimeout(() => ac.abort(), opt.timeout || 120000);
        let r; try { r = await fetch(`https://firebasevertexai.googleapis.com/v1beta/projects/${FB.projectId}/models/${m}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': FB.apiKey }, body, signal: ac.signal }); }
        catch (e) { clearTimeout(to); ultimo = 'BUSY'; continue; } clearTimeout(to);
        const j = await r.json().catch(() => ({}));
        if (r.status === 404) { (JSON.stringify(j).match(/models\/(gemini-[\w.-]+)/g) || []).map(x => x.slice(7)).forEach(x => { if (!vistos.has(x)) { vistos.add(x); lista.push(x); } }); continue; }
        if (r.status === 429) { ultimo = 'QUOTA'; continue; }
        if (!r.ok) { ultimo = 'BUSY'; continue; }
        const t = (((j.candidates || [])[0] || {}).content || {}).parts, txt = t && t.map(p => p.text || '').join('');
        try { const v = JSON.parse(txt); const ok = opt.validar ? opt.validar(v) : v; if (ok) return ok; ultimo = 'EMPTY'; } catch (e) { ultimo = 'EMPTY'; }
      }
      opt.alReintentar && opt.alReintentar(vuelta + 1, ultimo);
      await new Promise(r => setTimeout(r, ultimo === 'QUOTA' ? 60000 : [5000, 15000, 30000][vuelta] || 30000));
    }
    throw new Error(ultimo);
  }
  async function pensar(prompt, schema) {
    const body = JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: schema ? { responseMimeType: 'application/json', responseSchema: schema, temperature: .8, maxOutputTokens: 4096 } : { temperature: .4, maxOutputTokens: 2048 } });
    const lista = [...MODELOS], vistos = new Set();
    while (lista.length) {
      const m = lista.shift(); if (vistos.has(m)) continue; vistos.add(m);
      const ac = new AbortController(), to = setTimeout(() => ac.abort(), 30000);
      let r; try { r = await fetch(`https://firebasevertexai.googleapis.com/v1beta/projects/${FB.projectId}/models/${m}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': FB.apiKey }, body, signal: ac.signal }); }
      catch (e) { clearTimeout(to); continue; } clearTimeout(to);
      const j = await r.json().catch(() => ({}));
      if (r.status === 404) { (JSON.stringify(j).match(/models\/(gemini-[\w.-]+)/g) || []).map(x => x.slice(7)).forEach(x => lista.push(x)); continue; }
      if (!r.ok) continue;
      const t = (((j.candidates || [])[0] || {}).content || {}).parts; const txt = t && t.map(p => p.text || '').join('');
      if (!txt) continue;
      try { return schema ? JSON.parse(txt) : txt; } catch (e) { continue; }
    }
    throw new Error('IA');
  }

  window.MD = { profe, esp, espInfo, ESPS, fid, CONT, MIS, nuevaUnidad, nuevaSesion, subirArchivo, publicarMisiones, abrirPdf, pensarCon, _c: { crudo: () => crudo(), cSplit: e => cSplit(e) }, FB, get, yo, publicar, guardarSesion, sesionCruda, LAB, labDe, subirLab, entrar, salir, esDocente, cargar, unidades, sesionesDe, preguntas, ticket, guardarTicket, ticketsDe, nivel, partic, promedio, CONDUCTA, NIVEL,
    PART, PROD, CUAD, COND, TRAB, RFF, refuerzoManual, cargarMisiones, misionesDe, avance, marcarActividad, misionCompleta, pensar, LS, lleno, contenido: () => contenido };
})();
