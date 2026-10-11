// ===================================================================
//  MOLÍ 2 · DATOS: se conecta al mismo Firebase de Molí (sesiones, Exit tickets, notas, misiones).
//  Sólo lee y escribe lo mismo que Molí; no cambia nada de Molí 1.
// ===================================================================
(function () {
  const FB = { projectId: 'ciencia6abcd', apiKey: 'AIzaSyB3IlHEFGkCGtZhPZxV5-a47Pg2mAaIjSM' };
  const BASE = `https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents`;
  const DOC = (col, id) => `projects/${FB.projectId}/databases/(default)/documents/${col}/${id}`;
  const GRADE = '6to';
  // códigos de Molí para las otras notas que registra la docente (en la misma colección de Exit tickets)
  const PART = 30, PROD = 50, CUAD = 51, COND = 60;

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
  async function entrar(dni) {
    dni = String(dni || '').replace(/\D/g, '').slice(0, 8);
    if (dni.length !== 8) throw new Error('DNI');
    const key = await idDeDni(dni), st = await get('students', key);
    if (!st) throw new Error('NOEXISTE');
    const me = { key, dni, name: st.name, section: st.section, grade: st.grade || GRADE };
    LS.set(ME_KEY, me); return me;
  }
  function salir() { try { localStorage.removeItem(ME_KEY); } catch (e) {} }

  // ---- contenido: unidades y sesiones ----
  let contenido = null, misiones = null;
  async function cargar() {
    if (contenido) return contenido;
    const c = await get('config', 'content');
    const units = [];
    for (let i = 0; i < 24; i++) { const s = c && c['u' + i]; if (!s) continue; try { units.push(JSON.parse(s)); } catch (e) {} }
    let files = {}; try { files = JSON.parse(c.data || '{}').files || {}; } catch (e) {}
    contenido = { units, files };
    LS.set('moli2:content', contenido);
    return contenido;
  }
  const lleno = t => !!String(t || '').trim();
  const unidades = () => (contenido ? contenido.units : []).filter(u => !u.hidden && lleno(u.title));
  const sesionesDe = u => (u.sessions || []).map((s, i) => ({ s, n: i + 1 })).filter(x => !x.s.hidden && (lleno(x.s.meta) || lleno(x.s.title) || (x.s.activities || []).some(a => lleno(a.title) || lleno(a.desc))));
  const preguntas = s => ((s.ticket && s.ticket.questions) || []).map(q => ({ q: q.q, why: q.why || '', opts: (q.options || []).map((t, i) => ({ t, i })).filter(o => lleno(o.t)), answer: q.answer })).filter(q => lleno(q.q) && q.opts.length >= 2);

  // ---- Exit tickets ----
  const ticketId = (u, n, k) => `${u}-s${n}-${k}`;
  async function ticket(unit, n, me) { const t = await get('exitTickets', ticketId(unit, n, me.key)); return t && (!t.dni || t.dni === me.dni) ? t : null; }
  async function guardarTicket(me, u, n, answers) {
    const score = answers.filter(Boolean).length, total = answers.length;
    const res = { unit: u.key, unitNum: String(u.num), session: n, grade: GRADE, section: me.section, name: me.name, student: me.key, dni: me.dni, score, total, answers, createdAt: new Date() };
    if (me.demo) { LS.set('moli2:demo:' + ticketId(u.key, n, me.key), { ...res, createdAt: Date.now() }); return { ...res, createdAt: Date.now() }; }
    const body = { writes: [{ update: { name: DOC('exitTickets', ticketId(u.key, n, me.key)), fields: toF(res) }, currentDocument: { exists: false } }] };
    const r = await fetch(`${BASE}:commit?key=${FB.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) { const e = await r.json().catch(() => ({})), st = e.error && e.error.status; if (st === 'ALREADY_EXISTS' || st === 'FAILED_PRECONDITION') return ticket(u.key, n, me); throw new Error(st || 'HTTP ' + r.status); }
    return { ...res, createdAt: Date.now() };
  }
  async function ticketsDe(u, me) {                                      // los Exit tickets de la unidad (y las notas que registra la docente)
    if (me.demo) { const o = {}; sesionesDe(u).forEach(({ n }) => { const t = LS.get('moli2:demo:' + ticketId(u.key, n, me.key), null); if (t) o[n] = t; }); return o; }
    const ns = []; sesionesDe(u).forEach(({ n }) => ns.push(n, PART + n, COND + n)); ns.push(PROD, CUAD);
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
    const c = await get('config', 'mis1'); let d = null; try { d = JSON.parse(c.data || 'null'); } catch (e) {}
    misiones = d && Array.isArray(d.ms) ? d.ms : [];
    return misiones;
  }
  const misionesDe = uKey => (misiones || []).filter(m => m.acts && m.acts.length && m.ses && m.ses.u === uKey && (() => {
    const u = (contenido ? contenido.units : []).find(x => x.key === uKey), s = u && u.sessions[m.ses.n - 1]; return u && !u.hidden && s && !s.hidden; })());
  const progKey = me => 'moli2:mis:' + (me ? me.key : 'anon');
  async function avance(me) {
    let p = LS.get(progKey(me), {});
    if (me && !me.demo) try { const d = await get('mision', 'm1-' + me.key); if (d && d.p) { const r = JSON.parse(d.p); Object.entries(r).forEach(([k, [err, last, n]]) => { if (!p[k] || (p[k].n || 0) < n) p[k] = { err, last, n }; }); } } catch (e) {}
    LS.set(progKey(me), p); return p;
  }
  let subirT = 0;
  function marcarActividad(me, id, errores) {
    const p = LS.get(progKey(me), {}), t = p[id];
    p[id] = { err: t ? Math.min(t.err, errores) : errores, last: errores, n: (t && t.n || 0) + 1, at: Date.now() };
    LS.set(progKey(me), p);
    if (!me || me.demo) return;
    clearTimeout(subirT); subirT = setTimeout(async () => {
      const q = {}; Object.entries(LS.get(progKey(me), {})).forEach(([k, v]) => q[k] = [v.err, v.last, v.n]);
      try { await fetch(`${BASE}/mision/m1-${me.key}?key=${FB.apiKey}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: toF({ p: JSON.stringify(q), n: String(me.name).slice(0, 60), sec: me.section, at: new Date() }) }) }); } catch (e) {}
    }, 1500);
  }
  const misionCompleta = (m, p) => m.acts.length > 0 && m.acts.every(a => p[a.id]);

  // ---- Molí piensa (Gemini por Firebase, el mismo que usa Molí); si no responde, se usan preguntas de plantilla ----
  const MODELOS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];
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

  window.MD = { FB, yo, entrar, salir, cargar, unidades, sesionesDe, preguntas, ticket, guardarTicket, ticketsDe, nivel, partic, promedio, CONDUCTA, NIVEL,
    PART, PROD, CUAD, COND, cargarMisiones, misionesDe, avance, marcarActividad, misionCompleta, pensar, LS, lleno, contenido: () => contenido };
})();
