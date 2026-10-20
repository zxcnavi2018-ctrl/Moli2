// ===================================================================
//  MOLÍ 2 · 📢 COMUNICADOS DEL PROFE
//  La docente escribe un mensaje (y si quiere, una foto) para todo el grado o para una sección.
//  Al estudiante, al entrar, su fotocheck brilla y suena una campanita: lo toca y lee el comunicado.
//  Se guarda en Firebase (files/fcomu-0 en 6.°, files/fcomuc7-0 en 7.°): los 3 últimos. Lo leído queda en este navegador.
// ===================================================================
(function () {
  if (!window.Docente || !window.MD || window.parent !== window) return;
  const ID = MD.fid('fcomu'), URL0 = `${Docente.BASE}/files/${ID}?key=${Docente.FB.apiKey}`, LEIDOS = 'moli2:comu:leidos', DIAS = 30;
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const b64e = s => btoa(unescape(encodeURIComponent(s))), b64d = s => decodeURIComponent(escape(atob(s)));
  const fecha = ms => new Date(ms).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  const foto = s => typeof s === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s) ? s : '';
  const leidos = () => { try { return JSON.parse(localStorage.getItem(LEIDOS)) || []; } catch (e) { return []; } };
  const marcar = id => { try { const L = leidos(); if (!L.includes(id)) localStorage.setItem(LEIDOS, JSON.stringify([...L, id].slice(-40))); } catch (e) {} };
  const esEstudiante = () => { const m = MD.yo(); return !!(m && !MD.esDocente() && !m.demo); };
  let LISTA = [], MARCA = '';

  // ---- Firebase ----
  async function leer() {
    const r = await fetch(URL0, { cache: 'no-store' }); if (r.status === 404) return []; if (!r.ok) throw new Error('NET');
    const j = await r.json(), v = j.fields && j.fields.b64 && j.fields.b64.stringValue; MARCA = (j.fields && j.fields.updatedAt && j.fields.updatedAt.timestampValue) || '';
    const x = v ? JSON.parse(b64d(v)) : null; return x && Array.isArray(x.items) ? x.items : [];
  }
  async function cambio() {                                            // sólo la fecha del archivo (liviano): ¿hay algo nuevo?
    const r = await fetch(URL0 + '&mask.fieldPaths=updatedAt', { cache: 'no-store' }); if (!r.ok) return false;
    const j = await r.json(), m = (j.fields && j.fields.updatedAt && j.fields.updatedAt.timestampValue) || ''; return m !== MARCA;
  }
  async function guardar(items) {
    if (!await Docente.token()) throw new Error('AUTH');
    let b64 = b64e(JSON.stringify({ items }));
    while (b64.length > 880000 && items.length > 1) { items = items.slice(0, -1); b64 = b64e(JSON.stringify({ items })); }   // si no entra, se van los más viejos
    if (b64.length > 880000) throw new Error('GRANDE');
    await Docente.commit([{ update: { name: Docente.DOC('files', ID), fields: Docente.toF({ b64, updatedAt: new Date() }) } }]);
    return items;
  }
  function achicar(file, max, q) { return new Promise((ok, no) => { const u = URL.createObjectURL(file), im = new Image();
    im.onload = () => { const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); ok(c.toDataURL('image/jpeg', q)); }; im.onerror = () => { URL.revokeObjectURL(u); no(new Error('IMG')); }; im.src = u; }); }
  async function prepararFoto(file) {                                   // va bajando hasta que pese menos de ≈ 450 KB
    for (const [max, q] of [[1400, 0.78], [1200, 0.72], [1000, 0.66], [860, 0.6], [720, 0.55], [600, 0.5]]) { const s = await achicar(file, max, q); if (s.length < 450000) return s; }
    throw new Error('GRANDE');
  }

  // ---- 🔔 campanita (sin archivos: notas que suenan como una campana) ----
  function campanita() {
    try {
      const C = new (window.AudioContext || window.webkitAudioContext)(); let sono = false;
      const toca = () => { if (sono || C.state !== 'running') return; sono = true; const t0 = C.currentTime + 0.05;
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => { const t = t0 + i * 0.12;
          [[f, 'sine', 0.2], [f * 2.01, 'sine', 0.05], [f * 3, 'triangle', 0.025]].forEach(([fr, ty, v]) => { const o = C.createOscillator(), g = C.createGain();
            o.type = ty; o.frequency.value = fr; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0008, t + 1.3);
            o.connect(g); g.connect(C.destination); o.start(t); o.stop(t + 1.35); }); }); };
      C.resume().then(toca).catch(() => {});
      const una = () => { removeEventListener('pointerdown', una, true); removeEventListener('keydown', una, true); C.resume().then(toca).catch(() => {}); };   // el navegador deja sonar recién al primer toque
      addEventListener('pointerdown', una, true); addEventListener('keydown', una, true);
    } catch (e) {}
  }

  // ---- estilos ----
  const css = document.createElement('style');
  css.textContent = `
  #foto.comu .fc-card { animation: cmBrilla 1.5s ease-in-out infinite; }
  @keyframes cmBrilla { 0%, 100% { box-shadow: 0 0 0 3px #facc15, 0 0 14px 5px rgba(250,204,21,.65); } 50% { box-shadow: 0 0 0 5px #fde047, 0 0 34px 16px rgba(250,204,21,.95); } }
  #foto .cm-b { position: absolute; z-index: 3; top: clamp(18px, 7vh, 58px); right: -12px; padding: 3px 9px; border-radius: 999px; border: 3px solid #fff; background: #ef4444; color: #fff; font: 900 13px "Trebuchet MS", system-ui, sans-serif; box-shadow: 0 3px 0 rgba(0,0,0,.25); animation: cmSalta 1s ease-in-out infinite; pointer-events: none; }
  #foto .cm-g { position: absolute; z-index: 3; left: calc(100% + 12px); top: 45%; width: max-content; max-width: 210px; padding: 9px 12px; border-radius: 16px; border: 3px solid #2b2547; background: #fffbe6; color: #1e293b; font: 800 14px/1.3 "Trebuchet MS", system-ui, sans-serif; box-shadow: 0 4px 0 rgba(43,37,71,.25); pointer-events: none; animation: cmSalta 1.6s ease-in-out infinite; }
  #foto .cm-g::before { content: ''; position: absolute; left: -12px; top: 14px; border: 8px solid transparent; border-right: 10px solid #2b2547; border-left: 0; }
  @keyframes cmSalta { 50% { transform: translateY(-4px); } }
  #comu { position: fixed; inset: 0; z-index: 70; display: none; align-items: center; justify-content: center; padding: 12px; background: rgba(15,23,42,.55); backdrop-filter: blur(2px); }
  #comu.on { display: flex; }
  #comu .cm-c { position: relative; width: min(560px, 96vw); max-height: 94vh; overflow: auto; padding: 16px 16px 14px; border: 3px solid #2b2547; border-radius: 22px; background: #fff; box-shadow: 0 8px 0 rgba(43,37,71,.25); font-family: "Trebuchet MS", system-ui, sans-serif; color: #1e293b; animation: pop2 .35s cubic-bezier(.34,1.56,.64,1); }
  #comu .cm-x { position: absolute; top: 8px; right: 8px; width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid #2b2547; background: #fff; font-weight: 900; cursor: pointer; }
  #comu .cm-h { display: flex; gap: 10px; align-items: center; margin: 0 36px 10px 0; } #comu .cm-h img { width: 64px; height: 64px; object-fit: contain; }
  #comu .cm-h b { display: block; font-size: 19px; color: #b45309; } #comu .cm-h span { font-size: 13.5px; color: #475569; }
  #comu .cm-t { padding: 12px 14px; border-radius: 16px; background: #fffbe6; border: 2px dashed #f59e0b; font: 700 17px/1.45 "Trebuchet MS", system-ui, sans-serif; white-space: pre-wrap; overflow-wrap: anywhere; }
  #comu .cm-f { display: block; width: 100%; max-height: 52vh; object-fit: contain; margin-top: 10px; border-radius: 14px; border: 2.5px solid #2b2547; background: #f8fafc; cursor: zoom-in; }
  #comu.zoom .cm-f { position: fixed; inset: 0; z-index: 2; width: 100vw; max-height: none; height: 100vh; margin: 0; border: 0; border-radius: 0; background: rgba(0,0,0,.9); cursor: zoom-out; }
  #comu .cm-ok { display: block; width: 100%; margin-top: 12px; border: 0; border-radius: 14px; padding: 12px; background: #16a34a; color: #fff; font: 900 17px system-ui; box-shadow: 0 4px 0 #0f6b32; cursor: pointer; }
  #comu .cm-ok { position: sticky; bottom: 0; }
  @media (max-height: 520px) { #comu .cm-f { max-height: 38vh; } #comu .cm-h img { width: 44px; height: 44px; } #comu .cm-t { font-size: 15px; } }
  #comu .cm-n { margin-top: 8px; text-align: center; font-size: 13px; font-weight: 700; color: #64748b; }
  #herr .cm-foto { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border: 2.5px dashed #94a3b8; border-radius: 12px; color: #1d4ed8; cursor: pointer; }
  #herr .cm-prev img { display: block; max-width: 100%; max-height: 180px; margin: 4px auto 0; border-radius: 10px; border: 2px solid #2b2547; }
  #herr .cm-prev button { display: block; margin: 4px auto 0; border: 0; background: none; color: #dc2626; font-weight: 900; text-decoration: underline; cursor: pointer; }
  #herr .cm-it { display: flex; gap: 8px; align-items: flex-start; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 14px; }
  #herr .cm-it > div { flex: 1; min-width: 0; } #herr .cm-it small { display: block; color: #64748b; font-weight: 700; }
  #herr .cm-it button { flex: none; border: 2px solid #dc2626; border-radius: 10px; background: #fff; color: #dc2626; font-weight: 800; padding: 4px 8px; cursor: pointer; }`;
  document.head.appendChild(css);

  // ===================== 👦 ESTUDIANTE =====================
  const win = document.createElement('div'); win.id = 'comu';
  const montar = () => { if (!win.isConnected && document.body) document.body.appendChild(win); };
  document.addEventListener('DOMContentLoaded', montar); montar();
  const mios = () => { const me = MD.yo(), lim = Date.now() - DIAS * 864e5; return me ? LISTA.filter(it => it && it.id && (!it.sec || it.sec === me.section) && (it.at || 0) > lim).sort((a, b) => b.at - a.at) : []; };
  const pendientes = () => { const L = leidos(); return esEstudiante() ? mios().filter(it => !L.includes(it.id)) : []; };
  function avisar(sonar) {                                              // fotocheck que brilla, globito y campanita
    const el = document.getElementById('foto'); if (!el) return;
    const n = pendientes().length; el.classList.toggle('comu', n > 0);
    el.querySelectorAll('.cm-b, .cm-g').forEach(x => x.remove());
    if (!n) return;
    el.insertAdjacentHTML('beforeend', `<span class="cm-b">📢 ${n}</span><span class="cm-g">📢 ¡Tu profe te dejó ${n > 1 ? n + ' comunicados' : 'un comunicado'}! <b>Tócame</b> 👆</span>`);
    if (sonar) (function cuandoSeVea(k) { const f = document.getElementById('foto');      // suena cuando el fotocheck ya está colgado a la vista
      if (f && f.classList.contains('on') && !document.body.classList.contains('open')) campanita(); else if (k < 120) setTimeout(() => cuandoSeVea(k + 1), 500); })(0);
  }
  function ver(L, i = 0) {                                              // muestra uno; si hay más, «Siguiente»
    L = L || (pendientes().length ? pendientes() : mios()); if (!L.length) return; montar();
    const it = L[i], img = foto(it.img), sec = it.sec ? `${MD.espInfo().gn} ${esc(it.sec)}` : `Todo ${MD.espInfo().gn} grado`;
    win.className = 'on';
    win.innerHTML = `<div class="cm-c" role="dialog" aria-modal="true"><button class="cm-x" data-c="x" aria-label="Cerrar">✕</button>
      <div class="cm-h"><img src="img/moli/hola.webp" alt=""><div><b>📢 Comunicado de ${esc(it.de || 'tu profe')}</b><span>${esc(fecha(it.at))} · ${sec}</span></div></div>
      ${it.txt ? `<div class="cm-t">${esc(it.txt)}</div>` : ''}${img ? `<img class="cm-f" data-c="zoom" src="${img}" alt="Foto del comunicado">` : ''}
      <button class="cm-ok" data-c="ok">${i < L.length - 1 ? 'Siguiente comunicado ▶' : '✅ Ya lo leí'}</button>${L.length > 1 ? `<div class="cm-n">${i + 1} de ${L.length}</div>` : ''}</div>`;
    win.onclick = e => { const c = e.target.closest('[data-c]'); if (e.target === win) return cerrar();
      if (!c) return; if (c.dataset.c === 'zoom') return win.classList.toggle('zoom');
      marcar(it.id); if (c.dataset.c === 'ok' && i < L.length - 1) return ver(L, i + 1); cerrar(); };
    marcar(it.id); avisar(false);
  }
  function cerrar() { win.className = ''; win.innerHTML = ''; avisar(false); }
  document.addEventListener('click', e => {                            // con comunicado nuevo, tocar el fotocheck abre el comunicado
    if (!pendientes().length || !e.target.closest('#foto .fc-card')) return;
    e.stopImmediatePropagation(); e.preventDefault(); ver();
  }, true);
  async function revisar(sonar) {
    if (!esEstudiante()) { avisar(false); return; }
    try { LISTA = await leer(); } catch (e) { return; }
    avisar(sonar && pendientes().length > 0);
  }
  addEventListener('moli2:me', () => setTimeout(() => revisar(true), 600));
  setTimeout(() => revisar(true), 2500);                               // al entrar
  setInterval(async () => { if (esEstudiante() && !document.hidden && await cambio().catch(() => false)) revisar(true); }, 90000);   // si el profe envía uno en plena clase

  // ===================== 👩‍🏫 DOCENTE =====================
  function panel(msg) {
    const H = window.Herramientas; if (!H) return;
    const b = H.abrir('📢 Enviar comunicado', 'Al entrar, el fotocheck de tus estudiantes brilla y suena para que lo lean.', 'decidida', `
      <form class="hp-f" data-cm><label>Para</label><div class="hp-secs">${['', 'A', 'B', 'C', 'D'].map(s => `<button type="button" data-sec="${s}"${s ? '' : ' class="on"'}>${s ? MD.espInfo().gn + ' ' + s : 'Todo ' + MD.espInfo().gn}</button>`).join('')}</div>
        <label>Mensaje</label><textarea name="txt" rows="5" maxlength="900" placeholder="Ej.: Mañana traemos la ficha de la Unidad 7 impresa. ¡No olviden su cuaderno!"></textarea>
        <label class="cm-foto">📷 Agregar una foto (opcional)<input type="file" accept="image/*" hidden></label><div class="cm-prev"></div>
        <button class="hp-ok" type="submit">📨 Enviar comunicado</button><p class="hp-msg">${msg || ''}</p></form>
      <div class="hp-lista"><b>📋 Enviados (se guardan los 3 últimos)</b><div class="cm-ls"><small>Cargando…</small></div></div>`);
    let sec = '', img = '';
    const f = b.querySelector('[data-cm]'), m = f.querySelector('.hp-msg'), prev = f.querySelector('.cm-prev');
    const lista = async () => { const el = b.querySelector('.cm-ls');
      try { LISTA = await leer(); el.innerHTML = LISTA.length ? LISTA.map(it => `<div class="cm-it"><div><small>${esc(fecha(it.at))} · ${it.sec ? MD.espInfo().gn + ' ' + esc(it.sec) : 'Todo ' + MD.espInfo().gn}${foto(it.img) ? ' · 🖼️ con foto' : ''}</small>${esc(String(it.txt || '').slice(0, 120))}${String(it.txt || '').length > 120 ? '…' : ''}</div><button type="button" data-rm="${esc(it.id)}">🗑️ Quitar</button></div>`).join('') : '<small>Todavía no enviaste ninguno.</small>'; }
      catch (e) { el.innerHTML = '<small>📶 No pude cargar la lista.</small>'; } };
    b.querySelectorAll('[data-sec]').forEach(x => x.addEventListener('click', () => { sec = x.dataset.sec; b.querySelectorAll('[data-sec]').forEach(y => y.classList.toggle('on', y === x)); }));
    f.querySelector('input[type=file]').addEventListener('change', async e => { const file = e.target.files[0]; e.target.value = ''; if (!file) return;
      prev.innerHTML = '<small>Preparando la foto…</small>';
      try { img = await prepararFoto(file); prev.innerHTML = `<img src="${img}" alt=""><button type="button" data-q>Quitar foto</button>`; prev.querySelector('[data-q]').onclick = () => { img = ''; prev.innerHTML = ''; }; }
      catch (x) { img = ''; prev.innerHTML = '<small>⚠️ No pude usar esa foto. Prueba con otra.</small>'; } });
    f.addEventListener('submit', async e => {
      e.preventDefault(); const txt = f.txt.value.trim(), bt = f.querySelector('.hp-ok');
      if (!txt && !img) { m.textContent = '✍️ Escribe un mensaje o agrega una foto.'; return; }
      bt.disabled = true; m.textContent = 'Enviando…';
      try { const me = MD.yo() || {}, nuevo = { id: Date.now().toString(36), at: Date.now(), sec, txt, img, de: me.tipo === 'owner' ? MD.profe() : String(me.name || 'tu profe') };
        LISTA = await guardar([nuevo, ...(await leer())].slice(0, 3));
        f.txt.value = ''; img = ''; prev.innerHTML = ''; m.innerHTML = `✅ ¡Enviado a ${sec ? MD.espInfo().gn + ' ' + esc(sec) : 'todo ' + MD.espInfo().gn}! Al entrar, su fotocheck brillará y sonará.`; lista(); }
      catch (x) { m.textContent = x.message === 'AUTH' ? '🔐 Conecta tu cuenta: toca tu fotocheck → «Conectar mi cuenta».' : x.message === 'GRANDE' ? '📷 La foto es muy pesada. Prueba con otra.' : '📶 No se pudo enviar. Revisa tu internet e intenta otra vez.'; }
      bt.disabled = false; });
    b.addEventListener('click', async e => { const q = e.target.closest('[data-rm]'); if (!q || !confirm('¿Quitar este comunicado? Tus estudiantes ya no lo verán.')) return;
      q.disabled = true; try { LISTA = await guardar((await leer()).filter(it => it.id !== q.dataset.rm)); lista(); } catch (x) { q.disabled = false; alert('No se pudo quitar. Revisa tu internet.'); } });
    lista();
  }
  if (window.Herramientas) Herramientas.extra.comunicado = () => panel();

  window.Comunicado = { ver: () => ver(), hay: () => mios().length > 0, revisar };
})();
