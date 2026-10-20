// ===================================================================
//  MOLÍ 2 · DOCENTE: el mismo ingreso de Molí 1 (DNI → clave) y la cuenta de Firebase para leer y guardar
//  lo de todos los estudiantes (6° A, B, C y D).
// ===================================================================
(function () {
  const FB = { projectId: 'ciencia6abcd', apiKey: 'AIzaSyB3IlHEFGkCGtZhPZxV5-a47Pg2mAaIjSM', authDomain: 'ciencia6abcd.firebaseapp.com' };
  const BASE = `https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents`;
  const DOC = (col, id) => `projects/${FB.projectId}/databases/(default)/documents/${col}/${id}`;
  const OWNER = 'rd95127ea7f0b0f753143', PIN_H = 'pdcf3e4aa508220bd8346', OWNER_EMAIL = 'zxc.navi2018@gmail.com', OWNER_NAME = 'Christian Quispe Llerena';
  const AUTH = 'moli2:auth', ME = 'moli2:me';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }, del(k) { try { localStorage.removeItem(k); } catch (e) {} } };
  const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  async function pbkdf(pass, salt, iter, bits) {
    const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
    return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: iter }, k, bits));
  }
  const rid = dni => pbkdf(dni, 'ciencia6-rank', 150000, 80).then(h => 'r' + h);
  async function kid(dni) { const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ciencia6|' + dni)); return 'k' + hex(h).slice(0, 20); }

  // ---- Firestore (formato) ----
  const toV = v => typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
    : typeof v === 'boolean' ? { booleanValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(toV) } }
    : v instanceof Date ? { timestampValue: v.toISOString() } : v && typeof v === 'object' ? { mapValue: { fields: toF(v) } } : { stringValue: String(v) };
  const toF = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, toV(v)]));
  const fromV = v => 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'booleanValue' in v ? v.booleanValue
    : 'timestampValue' in v ? Date.parse(v.timestampValue) : 'arrayValue' in v ? (v.arrayValue.values || []).map(fromV)
    : 'stringValue' in v ? v.stringValue : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, fromV(x)])) : null;
  const fromDoc = d => { const o = {}; Object.entries(d.fields || {}).forEach(([k, v]) => o[k] = fromV(v)); o.id = d.name.split('/').pop(); return o; };

  // ---- cuenta de Firebase (para leer/guardar lo de todos) ----
  async function idt(method, body) {
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${FB.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error((j.error && j.error.message) || 'LOGIN'); return j;
  }
  const guardarToken = (email, idToken, refreshToken, exp) => LS.set(AUTH, { email, idToken, refreshToken, exp: Date.now() + 1000 * (+exp || 3600) });
  async function conCorreo(email, password) { const j = await idt('signInWithPassword', { email, password, returnSecureToken: true }); guardarToken(j.email, j.idToken, j.refreshToken, j.expiresIn); return true; }
  async function conGoogle() {                                       // ventana de Google (el dominio debe estar autorizado en Firebase)
    const V = 'https://www.gstatic.com/firebasejs/12.19.0/';
    const [{ initializeApp, getApps }, A] = await Promise.all([import(V + 'firebase-app.js'), import(V + 'firebase-auth.js')]);
    const app = getApps().find(a => a.name === 'moli2') || initializeApp({ apiKey: FB.apiKey, authDomain: FB.authDomain, projectId: FB.projectId }, 'moli2');
    const auth = A.getAuth(app); await A.setPersistence(auth, A.inMemoryPersistence);
    const pr = new A.GoogleAuthProvider(); pr.setCustomParameters({ prompt: 'select_account' });
    const res = await A.signInWithPopup(auth, pr), u = res.user;
    guardarToken(u.email, await u.getIdToken(), u.refreshToken, 3600); return true;
  }
  async function token() {
    const t = LS.get(AUTH, null); if (!t) return null;
    if (Date.now() < t.exp - 60000) return t.idToken;
    const r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FB.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(t.refreshToken) });
    if (!r.ok) { LS.del(AUTH); return null; }
    const j = await r.json(); guardarToken(t.email, j.id_token, j.refresh_token, j.expires_in); return j.id_token;
  }
  const conectado = () => !!LS.get(AUTH, null);

  // ---- ¿este DNI es de un docente? ----
  async function quien(dni) {
    const r = await rid(dni);
    if (r === OWNER) return { tipo: 'owner', rid: r, dni, name: LS.get('moli2:tname:' + r, OWNER_NAME) };
    let site = null; try { const x = await fetch(`${BASE}/config/site?key=${FB.apiKey}`); if (x.ok) site = fromDoc(await x.json()); } catch (e) {}
    if (site && Array.isArray(site.tch) && site.tch.includes(r)) {
      const a = String((site.tchA || {})[r] || ''), [s, area] = a.split('|');
      return { tipo: 'admin', rid: r, dni, s, area: area || '', name: (site.tchN || {})[r] || 'Docente' };
    }
    const g = Object.entries((site && site.tchG) || {}).find(([, v]) => String(v).split('|')[2] === r);   // docente con su Gmail (lo agrega la dueña)
    if (g) { const [esp, name] = String(g[1]).split('|'); return { tipo: 'gmail', rid: r, dni, email: g[0], esp, name: name || 'Docente' }; }
    return null;
  }
  async function conClave(info, pin) {                               // dueño: su código; otro docente: sus 4 números (con eso entra a Firebase)
    pin = String(pin || '').trim(); if (!pin) throw new Error('CLAVE');
    if (info.tipo === 'owner') { if ('p' + await pbkdf(pin, 'ciencia6-pin', 150000, 80) !== PIN_H) throw new Error('CLAVE'); }
    else {
      const pass = await pbkdf(pin, 'ciencia-apin-' + info.rid + '|' + info.s, 200000, 256);   // igual que Molí 1 (la clave es la «contraseña» y la cuenta va en la sal)
      try { await conCorreo(`${info.rid}-${info.s}@${FB.authDomain}`, pass); } catch (e) { throw new Error(/TOO_MANY/.test(e.message) ? 'MUCHOS' : /INVALID|PASSWORD|EMAIL_NOT_FOUND|USER_DISABLED/.test(e.message) ? 'CLAVE' : 'RED'); }
    }
    const rcs = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('moli2-rc|' + info.rid + '|' + pin))).slice(0, 32);   // canal del control remoto (celular y laptop con la misma cuenta)
    const esp = window.MD && MD.ESPS[info.area] ? info.area : '';
    const me = { key: await kid(info.dni), dni: info.dni, name: info.name, section: 'DOC', rid: info.rid, teacher: true, docente: true, tipo: info.tipo, area: info.area || '', esp, rcs };
    LS.set(ME, me); return me;
  }
  async function conGmail(info) {                                    // docente con Gmail: entra con Google y debe ser el mismo correo que anotó la dueña
    await conGoogle();
    if (correo().toLowerCase() !== String(info.email).toLowerCase()) { LS.del(AUTH); throw new Error('CORREO'); }
    const rcs = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('moli2-rc|' + info.rid + '|' + info.email))).slice(0, 32);
    const me = { key: await kid(info.dni), dni: info.dni, name: info.name, section: 'DOC', rid: info.rid, teacher: true, docente: true, tipo: 'gmail', area: '', esp: info.esp, email: info.email, rcs };
    LS.set(ME, me); return me;
  }
  const correo = () => (LS.get(AUTH, null) || {}).email || '';
  // 👩‍🏫 la dueña anota a otro docente: su Gmail, su nombre, su DNI y su corcho (config/site.tchG: correo → «espacio|nombre|cuenta»)
  async function sitio() { const x = await fetch(`${BASE}/config/site?key=${FB.apiKey}`, { cache: 'no-store' }); if (!x.ok) throw new Error('RED'); return fromDoc(await x.json()); }
  async function docentesGmail() { const st = await sitio(); return Object.entries(st.tchG || {}).map(([email, v]) => { const [esp, name] = String(v).split('|'); return { email, esp, name }; }); }
  async function guardarTchG(cambiar) {
    const st = await sitio(), G = { ...(st.tchG || {}) }; await cambiar(G);
    await commit([{ update: { name: DOC('config', 'site'), fields: toF({ tchG: G, updatedAt: new Date() }) }, updateMask: { fieldPaths: ['tchG', 'updatedAt'] } }]);
  }
  async function agregarDocente(email, name, dni, esp) {
    email = String(email || '').trim().toLowerCase(); if (!/^[^\s@|]+@[^\s@|]+\.[a-z]{2,}$/.test(email)) throw new Error('CORREO');
    name = String(name || '').trim().replace(/[|]/g, ' ').replace(/\s+/g, ' ').slice(0, 60); if (name.length < 3) throw new Error('NOMBRE');
    dni = String(dni || '').replace(/\D/g, ''); if (!/^\d{8}$/.test(dni)) throw new Error('DNI');
    const r = await rid(dni); if (r === OWNER) throw new Error('DNI');
    await guardarTchG(G => { Object.keys(G).forEach(k => { if (String(G[k]).split('|')[2] === r) delete G[k]; }); G[email] = `${esp}|${name}|${r}`; });
  }
  const quitarDocente = email => guardarTchG(G => { delete G[email]; });
  // administradores antiguos de Molí 1 (entran con DNI y clave: config/site.tch, tchN, tchA). La dueña puede quitarlos.
  async function adminsDni() { const st = await sitio(); return (st.tch || []).map(r => ({ rid: r, name: (st.tchN || {})[r] || 'Docente', area: String((st.tchA || {})[r] || '').split('|')[1] || '' })); }
  async function quitarAdmin(rid) {
    const st = await sitio(), tch = (st.tch || []).filter(r => r !== rid), tchN = { ...(st.tchN || {}) }, tchA = { ...(st.tchA || {}) }; delete tchN[rid]; delete tchA[rid];
    await commit([{ update: { name: DOC('config', 'site'), fields: toF({ tch, tchN, tchA, updatedAt: new Date() }) }, updateMask: { fieldPaths: ['tch', 'tchN', 'tchA', 'updatedAt'] } }]);
  }

  // ---- lecturas y escrituras de docente ----
  async function H() { const t = await token(); if (!t) throw new Error('AUTH'); return { Authorization: 'Bearer ' + t }; }
  async function pedir(url, opt = {}) {
    const r = await fetch(url, { ...opt, headers: { ...(opt.headers || {}), ...(await H()) } });
    if (r.status === 401 || r.status === 403) throw new Error('AUTH');
    if (!r.ok && r.status !== 404) throw new Error('HTTP ' + r.status);
    return r.status === 404 ? null : r.json();
  }
  async function lista(col) {
    const out = []; let pt = '';
    do { const j = await pedir(`${BASE}/${col}?pageSize=300&key=${FB.apiKey}${pt ? '&pageToken=' + encodeURIComponent(pt) : ''}`); (j && j.documents || []).forEach(d => out.push(fromDoc(d))); pt = j && j.nextPageToken; } while (pt);
    return out;
  }
  async function consulta(col, filtros) {
    const F = filtros.map(([f, op, v]) => ({ fieldFilter: { field: { fieldPath: f }, op, value: Array.isArray(v) ? { arrayValue: { values: v.map(x => ({ stringValue: String(x) })) } } : toV(v) } }));
    const where = F.length === 1 ? F[0] : { compositeFilter: { op: 'AND', filters: F } };
    const j = await pedir(`${BASE}:runQuery?key=${FB.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ structuredQuery: { from: [{ collectionId: col }], where } }) });
    return (j || []).filter(x => x.document).map(x => fromDoc(x.document));
  }
  async function commit(writes) {
    const r = await fetch(`${BASE}:commit?key=${FB.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(await H()) }, body: JSON.stringify({ writes }) });
    const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? 'AUTH' : (j.error && j.error.status) || 'HTTP ' + r.status); return j;
  }

  // estudiantes (6° A-D), guardados un ratito para no pedirlos cada vez
  let est = null;
  async function estudiantes(forzar) {
    const EK = 'moli2:tcache:est' + MD.esp(), g = MD.espInfo().g, c = LS.get(EK, null);
    if (!forzar && est) return est;
    if (!forzar && c && Date.now() - c.at < 6 * 3600e3 && Array.isArray(c.L) && c.L.length && c.L.every(e => e.dni)) return (est = c.L);   // (una lista guardada sin DNI no sirve para el escáner)
    const L = (await lista('students')).filter(s => /^[A-D]$/.test(s.section) && (s.grade || '6to') === g)
      .map(s => ({ key: s.id, dni: String(s.dni == null ? '' : s.dni).replace(/\D/g, ''), name: s.name, section: s.section, area: s.area || '' })).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    LS.set(EK, { at: Date.now(), L }); return (est = L);
  }
  const ticketsUnidad = (unitKey, sec) => consulta('exitTickets', sec ? [['unit', 'EQUAL', unitKey], ['section', 'EQUAL', sec]] : [['unit', 'EQUAL', unitKey]]);
  async function misionesTodos() {
    const pre = 'm1' + MD.esp() + '-';
    return (await lista('mision')).filter(d => d.id.startsWith(pre + 'k')).map(d => { let p = {}; try { p = JSON.parse(d.p || '{}'); } catch (e) {} return { key: d.id.slice(pre.length), n: d.n || '', sec: d.sec || '', p, at: +d.at || 0 }; });
  }
  // una nota del registro (participación 30+n, conducta 60+n, producto 50, cuaderno 51): se borra la anterior y se crea la nueva
  async function guardarNota(u, n, s, score) {
    const id = `${u.key}-s${n}-${s.key}`, name = DOC('exitTickets', id);
    try { await commit([{ delete: name }]); } catch (e) { if (e.message === 'AUTH') throw e; }
    if (!score) return null;
    const rec = { unit: u.key, unitNum: String(u.num), session: n, grade: MD.espInfo().g, section: s.section, name: s.name, student: s.key, dni: s.dni, score, total: 4, answers: [0, 1, 2, 3].map(i => i < score), createdAt: new Date() };
    await commit([{ update: { name, fields: toF(rec) }, currentDocument: { exists: false } }]);
    return { ...rec, createdAt: Date.now() };
  }
  async function crearTicket(u, n, s, answers) {                    // Exit ticket leído con el escáner (se crea una sola vez, como en Molí)
    const id = `${u.key}-s${n}-${s.key}`, score = answers.filter(Boolean).length;
    const rec = { unit: u.key, unitNum: String(u.num), session: n, grade: MD.espInfo().g, section: s.section, name: s.name, student: s.key, dni: s.dni, score, total: answers.length, answers, createdAt: new Date() };
    const r = await fetch(`${BASE}:commit?key=${FB.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ writes: [{ update: { name: DOC('exitTickets', id), fields: toF(rec) }, currentDocument: { exists: false } }] }) });
    if (r.ok) return 'ok'; const j = await r.json().catch(() => ({})), st = j.error && j.error.status; if (st === 'ALREADY_EXISTS' || st === 'FAILED_PRECONDITION') return 'dup'; throw new Error(st || 'RED');
  }
  async function crearEstudiante(dni, name, section) {
    dni = String(dni || '').replace(/\D/g, ''); if (!/^\d{8}$/.test(dni)) throw new Error('DNI');
    name = String(name || '').trim().replace(/\s+/g, ' '); if (name.length < 3 || name.length > 60) throw new Error('NOMBRE');
    const k = await kid(dni);
    try { await commit([{ update: { name: DOC('students', k), fields: toF({ dni, name, grade: MD.espInfo().g, section, createdAt: new Date() }) }, currentDocument: { exists: false } }]); }
    catch (e) { if (/ALREADY|FAILED_PRECONDITION/.test(e.message)) throw new Error('YAEXISTE'); throw e; }
    est = null; LS.del('moli2:tcache:est' + MD.esp()); return { key: k, dni, name, section };
  }

  // 🔢 códigos para entrar (00000 y los 3 últimos números del DNI): índice público con sólo la clave, el nombre corto y la sección
  async function publicarCodigos() {
    const L = await estudiantes(true), codes = {}, g = MD.espInfo().gn;
    L.forEach(e => { if (!/^\d{8}$/.test(e.dni)) return; const t = e.dni.slice(-3); (codes[t] = codes[t] || []).push({ k: e.key, n: String(e.name || '').split(/\s+/).slice(0, 2).join(' '), s: e.section, g }); });
    await commit([{ update: { name: DOC('files', MD.fid('fcod')), fields: toF({ b64: btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, codes })))), updatedAt: new Date() }) } }]);
    return L.length;
  }
  addEventListener('load', () => setTimeout(() => { if (window.MD && MD.esDocente() && conectado()) publicarCodigos().catch(() => {}); }, 6000));   // al entrar la docente, se actualiza solo

  window.Docente = { conGmail, publicarCodigos, docentesGmail, agregarDocente, quitarDocente, adminsDni, quitarAdmin, quien, conClave, conCorreo, conGoogle, conectado, token, salirCuenta: () => LS.del(AUTH),
    lista, consulta, commit, estudiantes, ticketsUnidad, misionesTodos, guardarNota, crearEstudiante, crearTicket, OWNER_EMAIL,
    FB, BASE, DOC, toF, fromDoc, kid, correo };
})();
