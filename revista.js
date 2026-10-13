// ===================================================================
//  MOLÍ 2 · REVISTA INNOVADORA
//   📥 Bandeja en el fotocheck: la docente y los Revisores ven cuántos trabajos esperan y los publican o devuelven.
//   🧐 Revisores: la docente le da el título a un estudiante (su DNI y una clave de 4 números).
//   Los trabajos viven en Firebase (colección «revista»); la página es repositorio.html (la laptop del aula).
// ===================================================================
(function () {
  const FB = Docente.FB, BASE = Docente.BASE, RAUTH = 'moli2:rauth', HU = 'moli2:hu';
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }, del(k) { try { localStorage.removeItem(k); } catch (e) {} } };
  const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  async function pbkdf(pass, salt, iter, bits) {
    const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
    return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: iter }, k, bits));
  }
  async function huella(dni) { const c = LS.get(HU, {}) || {}; if (c[dni]) return c[dni]; const h = 'r' + await pbkdf(dni, 'ciencia6-rank', 150000, 80); c[dni] = h; LS.set(HU, c); return h; }

  // ---- la lista de Revisores (config/site.rev) ----
  let REV = null, revAt = 0;
  async function revisores(forzar) {
    if (!forzar && REV && Date.now() - revAt < 120000) return REV;
    try { const r = await fetch(`${BASE}/config/site?key=${FB.apiKey}`, { cache: 'no-store' }); if (r.ok) { REV = Docente.fromDoc(await r.json()).rev || {}; revAt = Date.now(); } } catch (e) {}
    return REV || {};
  }
  const ROL = { rev: false, h: '' };
  async function revisar() {                                         // ¿el estudiante que entró es Revisor?
    const me = MD.yo(); ROL.rev = false; ROL.h = '';
    if (!me || me.docente || me.teacher || me.demo || !me.dni) return false;
    const rev = await revisores(), h = await huella(String(me.dni));
    if (rev[h]) { ROL.rev = true; ROL.h = h; } else LS.del(RAUTH);
    return ROL.rev;
  }
  async function tokRev() {
    const t = LS.get(RAUTH, null); if (!t || !t.refreshToken) return null;
    if (Date.now() < (t.exp || 0) - 60000) return t.idToken;
    try {
      const r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FB.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(t.refreshToken) });
      if (!r.ok) { if (r.status === 400) LS.del(RAUTH); return null; }
      const j = await r.json(); LS.set(RAUTH, { ...t, idToken: j.id_token, refreshToken: j.refresh_token, exp: Date.now() + 1000 * (+j.expires_in || 3600) }); return j.id_token;
    } catch (e) { return null; }
  }

  // ---- 📥 cuántos trabajos esperan (aviso en el fotocheck) ----
  let N = 0, contando = false, ultimo = 0;
  const foto = () => document.getElementById('foto');
  function aviso() {
    const f = foto(); if (!f) return; let b = f.querySelector('.fc-rv');
    const staff = MD.esDocente() || ROL.rev;
    if (!b) { b = document.createElement('button'); b.type = 'button'; b.className = 'fc-rv'; b.setAttribute('aria-label', 'Bandeja de la Revista Innovadora'); f.appendChild(b);
      b.addEventListener('click', e => { e.stopPropagation(); abrirBandeja(); }); }
    b.hidden = !staff; b.classList.toggle('hay', N > 0);
    b.innerHTML = `📥${N > 0 ? `<b>${N > 99 ? '99+' : N}</b>` : ''}`;
    b.title = N > 0 ? `📥 ${N} trabajo${N > 1 ? 's' : ''} por revisar` : '📥 Bandeja de la Revista';
  }
  async function contar(forzar) {
    if (contando || (!forzar && Date.now() - ultimo < 150000) || document.hidden) return;
    contando = true; ultimo = Date.now();
    try {
      const doc = MD.esDocente(); if (!doc) await revisar();
      if (!doc && !ROL.rev) { N = 0; return aviso(); }
      const t = doc ? await Docente.token() : await tokRev(); aviso(); if (!t) return;
      const r = await fetch(`${BASE}:runQuery?key=${FB.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
        body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'revista' }], where: { fieldFilter: { field: { fieldPath: 'st' }, op: 'EQUAL', value: { stringValue: 'pend' } } }, select: { fields: [{ fieldPath: 'st' }] }, limit: 99 } }) });
      if (r.ok) { N = (await r.json()).filter(x => x.document).length; aviso(); }
    } catch (e) {} finally { contando = false; }
  }
  addEventListener('moli2:me', () => { N = 0; REV = null; aviso(); contar(true); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) contar(true); });
  setInterval(() => contar(false), 30000); setTimeout(() => contar(true), 1500);
  addEventListener('message', e => { const d = e.data; if (d && typeof d.rvCount === 'number') { N = d.rvCount; aviso(); } else if (d && d.revistaSent) ultimo = 0; });

  // ---- la bandeja (repositorio.html en grande) ----
  let win = null;
  function abrirBandeja(vista = 'bandeja') {
    if (!win) {
      win = document.createElement('div'); win.id = 'rvWin';
      win.innerHTML = '<div class="rv-c"><button class="rv-x" type="button" aria-label="Cerrar">✕</button><iframe title="Revista Innovadora"></iframe></div>';
      document.body.appendChild(win);
      win.addEventListener('click', e => { if (e.target === win || e.target.closest('.rv-x')) cerrarBandeja(); });
    }
    win.querySelector('iframe').src = `repositorio.html?v=${vista}&t=${Date.now()}`;
    win.classList.add('on'); if (window.Foto) Foto.cerrar();
  }
  function cerrarBandeja() { if (!win) return; win.classList.remove('on'); setTimeout(() => { if (!win.classList.contains('on')) win.querySelector('iframe').src = 'about:blank'; }, 400); contar(true); }

  // ---- 🧐 Revisores (sólo la docente) ----
  const filas = rev => Object.entries(rev || {}).map(([h, v]) => { const [x, n, c] = String(v).split('|'); return { h, x, n: n || 'Revisor', c: c || '' }; });
  async function panelRevisores(msg) {
    const rev = await revisores(true), L = filas(rev);
    const b = Herramientas.abrir('🧐 Revisores de la Revista', 'Estudiantes que publican o devuelven trabajos como tú.', 'pensativa', `
      <p class="hp-tip">Dale el título de <b>🧐 Revisor</b> a un estudiante: escribe su <b>DNI</b> y una <b>clave de 4 números</b>. Cuando un compañero envíe su trabajo a la <b>Revista Innovadora</b>, le llegará a su <b>📥 bandeja</b> (igual que a ti) para publicarlo o devolverlo con un consejo.</p>
      <div class="hp-lista">${L.length ? `<ol>${L.map(r => `<li>🧐 <b>${esc(r.n)}</b>${r.c ? ` <small>6° ${esc(r.c)}</small>` : ''} <button data-rv="rm" data-h="${esc(r.h)}" class="rv-q">Quitar</button></li>`).join('')}</ol>` : '<small>Todavía no hay Revisores.</small>'}</div>
      <form class="hp-f" data-rvf="1"><div class="hp-row"><input name="dni" inputmode="numeric" maxlength="8" placeholder="DNI del estudiante" required>
        <input name="pin" inputmode="numeric" maxlength="4" placeholder="Clave (4 números)" required></div>
        <button class="hp-ok" type="submit">🧐 Nombrar Revisor</button><p class="hp-msg">${msg || ''}</p></form>`);
    b.addEventListener('submit', async e => {
      e.preventDefault(); const f = e.target, m = f.querySelector('.hp-msg'), bt = f.querySelector('button');
      const dni = f.dni.value.replace(/\D/g, ''), pin = f.pin.value.replace(/\D/g, '');
      if (!/^\d{8}$/.test(dni)) { m.textContent = 'El DNI debe tener 8 números.'; return; }
      if (!/^\d{4}$/.test(pin)) { m.textContent = 'La clave debe tener 4 números.'; return; }
      bt.disabled = true; m.textContent = 'Dándole el título…';
      try {
        if (!await Docente.token()) throw new Error('AUTH');
        const k = await Docente.kid(dni), r = await fetch(`${BASE}/students/${k}?key=${FB.apiKey}`);
        if (!r.ok) throw new Error('NOEST');
        const st = Docente.fromDoc(await r.json()), h = await huella(dni);
        if (await Docente.quien(dni)) throw new Error('DOC');
        const x = hex(crypto.getRandomValues(new Uint8Array(3))), pass = await pbkdf(pin, 'ciencia-apin-' + h + '|' + x, 200000, 256);
        const a = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FB.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: `${h}-${x}@${FB.projectId}.firebaseapp.com`, password: pass, returnSecureToken: true }) });
        if (!a.ok) { const j = await a.json().catch(() => ({})); throw new Error(/OPERATION_NOT_ALLOWED|CONFIGURATION/.test((j.error || {}).message) ? 'EMAIL' : 'RED'); }
        const nm = String(st.name || 'Revisor').replace(/\|/g, ' ').slice(0, 40), nuevo = { ...await revisores(true), [h]: `${x}|${nm}|${String(st.section || '').slice(-1)}` };
        await Docente.commit([{ update: { name: Docente.DOC('config', 'site'), fields: Docente.toF({ rev: nuevo, updatedAt: new Date() }) }, updateMask: { fieldPaths: ['rev', 'updatedAt'] } }]);
        REV = nuevo; panelRevisores(`✅ <b>${esc(nm)}</b> ya es 🧐 Revisor. Su clave es <b>${pin}</b>: la escribirá la primera vez que abra su 📥 bandeja.`);
      } catch (x) {
        bt.disabled = false;
        m.textContent = x.message === 'AUTH' ? '🔐 Conecta tu cuenta: toca tu fotocheck → «Conectar mi cuenta».' : x.message === 'NOEST' ? 'Ese DNI no tiene cuenta de estudiante. Créala con «🤖 Crear cuenta con Molí».'
          : x.message === 'DOC' ? 'Ese DNI es de un docente.' : x.message === 'EMAIL' ? '🔧 Falta activar «Correo electrónico/contraseña» en Firebase (Authentication → Método de acceso).' : '📶 No se pudo. Revisa tu internet e intenta otra vez.';
      }
    });
    b.addEventListener('click', async e => {
      const q = e.target.closest('[data-rv="rm"]'); if (!q) return; const h = q.dataset.h, r = L.find(z => z.h === h);
      if (!r || !confirm(`¿Quitarle el título de Revisor a ${r.n}?`)) return;
      try { const nuevo = { ...await revisores(true) }; delete nuevo[h];
        await Docente.commit([{ update: { name: Docente.DOC('config', 'site'), fields: Docente.toF({ rev: nuevo, updatedAt: new Date() }) }, updateMask: { fieldPaths: ['rev', 'updatedAt'] } }]);
        REV = nuevo; panelRevisores(`Listo: ${esc(r.n)} ya no es Revisor.`); }
      catch (x) { alert(x.message === 'AUTH' ? 'Conecta tu cuenta de docente primero.' : 'No se pudo guardar. Intenta otra vez.'); }
    });
  }

  Herramientas.extra.bandeja = () => abrirBandeja('bandeja');
  Herramientas.extra.revisores = () => panelRevisores();
  window.Revista = { abrirBandeja, cerrarBandeja, esRevisor: () => ROL.rev, pendientes: () => N, contar };

  document.head.insertAdjacentHTML('beforeend', `<style id="rvcss">
  #foto .fc-rv { position: absolute; top: clamp(30px, 10vh, 80px); right: -14px; z-index: 2; display: flex; align-items: center; gap: 3px; padding: 5px 8px; border: 3px solid #2b2547; border-radius: 999px; background: #fff; font: 900 16px "Trebuchet MS", system-ui, sans-serif; color: #2b2547; box-shadow: 0 4px 0 #2b2547; cursor: pointer; }
  #foto .fc-rv[hidden] { display: none; }
  #foto .fc-rv b { min-width: 20px; height: 20px; padding: 0 5px; border-radius: 999px; background: #e2483d; color: #fff; font-size: 12px; display: grid; place-items: center; }
  #foto .fc-rv.hay { animation: rvPulso 1.6s ease-in-out infinite; }
  @keyframes rvPulso { 50% { box-shadow: 0 4px 0 #2b2547, 0 0 0 6px rgba(140,198,63,.55); } }
  #rvWin { position: fixed; inset: 0; z-index: 80; display: flex; align-items: center; justify-content: center; padding: 10px; background: rgba(8,26,45,.55); backdrop-filter: blur(3px); opacity: 0; pointer-events: none; transition: opacity .25s; }
  #rvWin.on { opacity: 1; pointer-events: auto; }
  #rvWin .rv-c { position: relative; width: min(1180px, 100%); height: 100%; border-radius: 22px; overflow: hidden; border: 4px solid #2b2547; background: #fbfaf6; box-shadow: 0 24px 60px rgba(0,0,0,.45); transform: scale(.94); transition: transform .35s cubic-bezier(.2,1.3,.4,1); }
  #rvWin.on .rv-c { transform: scale(1); }
  #rvWin iframe { width: 100%; height: 100%; border: 0; display: block; }
  #rvWin .rv-x { position: absolute; top: 10px; right: 12px; z-index: 2; width: 42px; height: 42px; border-radius: 50%; border: 3px solid #2b2547; background: #fde68a; color: #2b2547; font: 900 18px system-ui; box-shadow: 0 3px 0 #2b2547; cursor: pointer; }
  .rv-q { margin-left: 6px; border: 0; background: none; color: #e2483d; font-weight: 900; cursor: pointer; }
  </style>`);
})();
