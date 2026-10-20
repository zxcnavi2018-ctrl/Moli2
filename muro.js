// ===================================================================
//  MOLÍ 2 · 🖼️ MURO DESTACABLE («Producto» en la barrita)
//  La docente sube fotos de los mejores trabajos con el nombre del estudiante (o estudiantes).
//  Cada trabajo se muestra como un collage automático y horizontal (1 foto = una grande; 2, 3 o 4 = lado a lado; 5 o 6 = dos filas).
//  En la pared del aula, el papelógrafo muestra los últimos trabajos pegados con cinta.
//  Se guarda en Firebase (files/fmuroidx-0 = la lista; files/fm…-0 = las fotos de cada trabajo).
// ===================================================================
(function () {
  if (!window.Docente) return;
  const IDX = MD.fid('fmuroidx'), URL = id => `${Docente.BASE}/files/${id}?key=${Docente.FB.apiKey}`;
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const b64e = s => btoa(unescape(encodeURIComponent(s))), b64d = s => decodeURIComponent(escape(atob(s)));
  const esDoc = () => !!(window.MD && MD.esDocente && MD.esDocente());
  const fecha = v => v ? new Date(v).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' }) : '';
  let LISTA = null, FOTOS = {}, EL = null;

  async function leer(id) { const r = await fetch(URL(id), { cache: 'no-store' }); if (r.status === 404) return null; if (!r.ok) throw new Error('NET'); const j = await r.json(), v = j.fields && j.fields.b64 && j.fields.b64.stringValue; return v ? JSON.parse(b64d(v)) : null; }
  async function guardar(id, obj) { if (!await Docente.token()) throw new Error('AUTH'); await Docente.commit([{ update: { name: Docente.DOC('files', id), fields: Docente.toF({ b64: b64e(JSON.stringify(obj)), updatedAt: new Date() }) } }]); }
  async function borrarDoc(id) { if (!await Docente.token()) throw new Error('AUTH'); await Docente.commit([{ delete: Docente.DOC('files', id) }]); }
  async function cargarLista() { try { const x = await leer(IDX); LISTA = (x && Array.isArray(x.items) ? x.items : []).sort((a, b) => (b.at || 0) - (a.at || 0)); } catch (e) { LISTA = LISTA || []; } pintarMural(); return LISTA; }
  async function fotosDe(it) { if (FOTOS[it.id]) return FOTOS[it.id]; try { const x = await leer(it.id); FOTOS[it.id] = (x && x.imgs) || []; } catch (e) { FOTOS[it.id] = []; } return FOTOS[it.id]; }

  // ---- fotos más livianas (para que entren en Firebase) ----
  function achicar(file, max, q) { return new Promise((ok, no) => { const u = URL_.createObjectURL(file), im = new Image();
    im.onload = () => { const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL_.revokeObjectURL(u); ok(c.toDataURL('image/jpeg', q)); }; im.onerror = () => { URL_.revokeObjectURL(u); no(new Error('IMG')); }; im.src = u; }); }
  const URL_ = window.URL;
  async function prepararFotos(files) {
    for (const [max, q] of [[1280, 0.74], [1080, 0.68], [900, 0.62], [760, 0.58], [640, 0.55], [540, 0.5]]) {      // va bajando hasta que todo entre (≈ 850 KB)
      const imgs = []; for (const f of files) imgs.push(await achicar(f, max, q));
      if (imgs.join('').length < 850000) return imgs; }
    throw new Error('GRANDE');
  }

  // ---- el papelógrafo de la pared: los últimos trabajos pegados con cinta ----
  const cargarImg = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
  async function pintarMural() {                                     // minimalista: sin tablero; sólo papelotes pegados con cinta masking en la pared
    const M = window.MURO_MESH; if (!M) return;
    const W = 1300, H = 500, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#334155'; g.font = '700 30px "Trebuchet MS", sans-serif'; if ('letterSpacing' in g) g.letterSpacing = '6px'; g.fillText('TRABAJOS DESTACADOS', W / 2, 30); if ('letterSpacing' in g) g.letterSpacing = '0px';
    g.fillStyle = '#f59e0b'; g.fillRect(W / 2 - 40, 52, 80, 4);                                  // título pequeño y una rayita
    const cinta = (x, y, a) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = 'rgba(232,220,192,.92)'; g.fillRect(-34, -11, 68, 22); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-34, -11, 68, 5); g.restore(); };
    const papel = (cw, ch) => { g.fillStyle = 'rgba(15,23,42,.13)'; g.fillRect(-cw / 2 + 5, -ch / 2 + 7, cw, ch); g.fillStyle = '#fdfdfb'; g.fillRect(-cw / 2, -ch / 2, cw, ch); cinta(-cw / 2 + 14, -ch / 2 + 4, -0.6); cinta(cw / 2 - 14, -ch / 2 + 4, 0.6); };
    const L = (LISTA || []).slice(0, 5);
    if (!L.length) { g.save(); g.translate(W / 2, 285); g.rotate(-0.015); papel(420, 260); g.fillStyle = '#94a3b8'; g.font = '700 30px "Trebuchet MS", sans-serif'; g.fillText('Pronto, aquí', 0, -18); g.fillText('los mejores trabajos', 0, 22); g.restore(); }
    const n = Math.max(1, L.length), cw = Math.min(250, (W - 80) / n - 26), ch = 380;
    for (let k = 0; k < L.length; k++) {
      const it = L[k], x = 40 + (W - 80) / n * (k + 0.5), y = 285, ang = ((k * 37) % 7 - 3) * 0.012, im = it.th ? await cargarImg(it.th) : null;
      g.save(); g.translate(x, y); g.rotate(ang); papel(cw, ch);
      const iw = cw - 24, ih = 250;
      if (im) { const r = Math.max(iw / im.width, ih / im.height), sw = iw / r, sh = ih / r; g.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, -iw / 2, -ch / 2 + 14, iw, ih); }
      else { g.fillStyle = '#f1f5f9'; g.fillRect(-iw / 2, -ch / 2 + 14, iw, ih); }
      g.fillStyle = '#1e293b'; const nom = String(it.n || ''); let fs = 22; do { g.font = '800 ' + fs + 'px "Trebuchet MS", sans-serif'; fs--; } while (g.measureText(nom).width > cw - 16 && fs > 12); g.fillText(nom.length > 40 ? nom.slice(0, 38) + '…' : nom, 0, ch / 2 - 66);
      if (it.t) { g.fillStyle = '#64748b'; g.font = '600 17px "Trebuchet MS", sans-serif'; g.fillText(String(it.t).slice(0, 26), 0, ch / 2 - 34); }
      g.restore();
    }
    const t = new THREE.CanvasTexture(c); t.anisotropy = 8; const old = M.material.map; M.material.map = t; M.material.needsUpdate = true; if (old) old.dispose();
  }

  // ---- la ventana del muro ----
  const css = document.createElement('style');
  css.textContent = `
  #muro { position: fixed; inset: 0; z-index: 60; display: none; place-items: center; padding: 14px; background: rgba(15,23,42,.55); font-family: "Trebuchet MS", system-ui, sans-serif; }
  #muro.on { display: grid; }
  #muro .mw { position: relative; width: min(1180px, 100%); max-height: calc(100vh - 28px); overflow: auto; border-radius: 24px; background: #fdf6e3; border: 4px solid #8b5a2b; box-shadow: 0 30px 70px rgba(0,0,0,.45); padding: 18px 22px 22px; }
  #muro .hd { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; } #muro h2 { margin: 0; flex: 1; font: 900 30px "Trebuchet MS", sans-serif; color: #7c2d12; }
  #muro .x { width: 44px; height: 44px; border-radius: 50%; border: 0; background: #7c2d12; color: #fff; font-size: 20px; cursor: pointer; }
  #muro .sub { margin: 4px 0 14px; color: #92400e; font-weight: 700; }
  #muro .btn { position: static; display: inline-block; width: auto; height: auto; touch-action: auto; border: 0; border-radius: 999px; padding: 10px 16px; font: 900 15px "Trebuchet MS", sans-serif; cursor: pointer; background: #16a34a; color: #fff; box-shadow: 0 4px 0 #15803d; }
  #muro .gal { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 16px; }
  #muro .tr { position: relative; background: #fff; border-radius: 16px; padding: 10px 10px 12px; box-shadow: 0 8px 18px rgba(124,45,18,.18); border: 1px solid #f1d9a8; cursor: zoom-in; }
  #muro .tr:nth-child(odd) { transform: rotate(-.6deg); } #muro .tr:nth-child(even) { transform: rotate(.5deg); }
  #muro .tr::before { content: ''; position: absolute; left: 50%; top: -10px; width: 90px; height: 22px; transform: translateX(-50%) rotate(-3deg); background: rgba(250,204,21,.8); border-radius: 3px; }
  .col { display: flex; gap: 6px; height: 220px; border-radius: 10px; overflow: hidden; background: #f1f5f9; }
  .col img { flex: 1 1 0; min-width: 0; height: 100%; object-fit: cover; } .col.u1 img { object-fit: contain; background: #0f172a; }
  .col.u5, .col.u6 { flex-wrap: wrap; } .col.u5 img, .col.u6 img { flex: 1 1 30%; height: calc(50% - 3px); }
  .col .ph { flex: 1; display: grid; place-items: center; color: #94a3b8; font-weight: 800; }
  #muro .nm { margin-top: 8px; font-weight: 900; color: #1e3a8a; font-size: 17px; } #muro .tt { color: #475569; font-weight: 700; font-size: 14px; } #muro .dt { color: #94a3b8; font-size: 12.5px; font-weight: 700; }
  #muro .del { position: absolute; right: 10px; bottom: 10px; border: 0; border-radius: 999px; padding: 5px 10px; background: #fee2e2; color: #b91c1c; font: 900 12px "Trebuchet MS", sans-serif; cursor: pointer; }
  #muro .vacio { text-align: center; padding: 40px 10px; color: #92400e; font-weight: 800; font-size: 18px; }
  #muro form { background: #fff; border-radius: 18px; padding: 14px 16px; margin-bottom: 16px; border: 2px dashed #d6a656; display: grid; gap: 10px; }
  #muro label { font-weight: 900; color: #7c2d12; } #muro input[type=text] { width: 100%; padding: 10px 12px; border-radius: 12px; border: 2px solid #e2c48a; font: 700 16px "Trebuchet MS", sans-serif; }
  #muro .fotos { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; } #muro .pick { border: 2px dashed #94a3b8; background: #f8fafc; border-radius: 12px; padding: 10px 14px; font-weight: 900; color: #334155; cursor: pointer; }
  #muro .msg { font-weight: 800; color: #475569; min-height: 20px; }
  #muroVer { position: fixed; inset: 0; z-index: 61; display: none; place-items: center; padding: 16px; background: rgba(0,0,0,.85); }
  #muroVer.on { display: grid; } #muroVer .col { height: min(70vh, 640px); width: min(1500px, 96vw); } #muroVer .col img { object-fit: contain; background: #000; }
  #muroVer .pie { margin-top: 10px; color: #fff; text-align: center; font: 900 22px "Trebuchet MS", sans-serif; } #muroVer .pie small { display: block; color: #cbd5e1; font-size: 15px; }
  #muroVer .x { position: fixed; right: 16px; top: 16px; width: 48px; height: 48px; border-radius: 50%; border: 0; background: #fff; font-size: 22px; cursor: pointer; }
  @media (max-width: 600px) { #muro .gal { grid-template-columns: 1fr; } .col { height: 180px; } }`;
  document.head.appendChild(css);

  const collage = (imgs, cls = '') => `<div class="col u${Math.min(imgs.length, 6)} ${cls}">${imgs.length ? imgs.map(s => `<img src="${s}" alt="" loading="lazy">`).join('') : '<span class="ph">📷</span>'}</div>`;
  async function pintar(msg) {
    if (!EL) return; const doc = esDoc();
    EL.innerHTML = `<div class="mw" role="dialog" aria-label="Muro Destacable"><div class="hd"><h2>🖼️ Muro Destacable</h2>${doc ? '<button type="button" class="btn" data-nuevo>➕ Subir trabajo</button>' : ''}<button type="button" class="x" data-x aria-label="Cerrar">✕</button></div>
      <p class="sub">Los mejores trabajos y productos de la clase. Toca uno para verlo grande.</p><div class="fm"></div><div class="gal"><div class="vacio">Cargando…</div></div></div>`;
    if (msg) mostrarForm(msg);
    const L = await cargarLista(), gal = EL && EL.querySelector('.gal'); if (!gal) return;
    if (!L.length) { gal.innerHTML = `<div class="vacio">⭐ Aún no hay trabajos en el muro.${doc ? '<br>Toca «➕ Subir trabajo» para pegar el primero.' : '<br>¡Pronto tu profe pegará los mejores!'}</div>`; return; }
    gal.innerHTML = L.map(it => `<div class="tr" data-ver="${esc(it.id)}">${collage([], 'cg')}<div class="nm">⭐ ${esc(it.n)}</div>${it.t ? `<div class="tt">${esc(it.t)}</div>` : ''}<div class="dt">${fecha(it.at)}</div>${doc ? `<button type="button" class="del" data-del="${esc(it.id)}">🗑 Quitar</button>` : ''}</div>`).join('');
    L.forEach(async it => { const imgs = await fotosDe(it), box = EL && EL.querySelector(`[data-ver="${it.id}"] .cg`); if (box) box.outerHTML = collage(imgs, 'cg'); });
  }
  function mostrarForm(msg) {
    const fm = EL.querySelector('.fm'); if (!fm) return;
    fm.innerHTML = `<form><label>📷 Fotos del trabajo (1 a 6)</label><div class="fotos"><label class="pick">📁 Elegir fotos<input type="file" accept="image/*" multiple hidden name="f"></label><span class="cnt">Ninguna foto elegida</span></div><div class="prev"></div>
      <label>✍️ Nombre del estudiante o estudiantes</label><input type="text" name="n" maxlength="120" placeholder="Ej.: Emilio Alarcón, Ana Quispe" required>
      <label>🏷️ Título del trabajo (opcional)</label><input type="text" name="t" maxlength="60" placeholder="Ej.: Maqueta de la célula">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button type="submit" class="btn">📌 Pegar en el muro</button><button type="button" class="btn" data-cancel style="background:#94a3b8;box-shadow:0 4px 0 #64748b">Cancelar</button><span class="msg">${msg && msg !== true ? msg : ''}</span></div></form>`;
    const f = fm.querySelector('form'), inp = f.elements.f;
    inp.addEventListener('change', () => { const F = [...inp.files].slice(0, 6); f.querySelector('.cnt').textContent = F.length ? `${F.length} foto${F.length > 1 ? 's' : ''}${inp.files.length > 6 ? ' (sólo se usan 6)' : ''}` : 'Ninguna foto elegida';
      f.querySelector('.prev').innerHTML = F.length ? collage(F.map(x => URL_.createObjectURL(x))) : ''; });
    fm.querySelector('[data-cancel]').onclick = () => { fm.innerHTML = ''; };
    f.addEventListener('submit', async e => { e.preventDefault(); const m = f.querySelector('.msg'), bt = f.querySelector('[type=submit]'), F = [...inp.files].slice(0, 6), n = f.elements.n.value.replace(/\s+/g, ' ').trim(), t = f.elements.t.value.replace(/\s+/g, ' ').trim();
      if (!F.length) { m.textContent = '📷 Elige al menos una foto.'; return; } if (n.length < 3) { m.textContent = '✍️ Escribe el nombre del estudiante o estudiantes.'; return; }
      bt.disabled = true; m.textContent = '⏳ Preparando las fotos…';
      try { const imgs = await prepararFotos(F), th = await achicar(F[0], 360, 0.6), id = 'fm' + Date.now().toString(36) + '-0';
        m.textContent = '⏳ Pegando en el muro…';
        await guardar(id, { v: 1, imgs });
        // (sólo los 8 últimos trabajos guardan su miniatura, para no pasar el límite de Firebase)
        const L = (await leer(IDX).catch(() => null)) || { items: [] }; (L.items = L.items || []).unshift({ id, n: n.slice(0, 120), t: t.slice(0, 60), at: Date.now(), th, k: imgs.length });
        await guardar(IDX, { v: 1, items: L.items.slice(0, 60).map((x, i) => i < 8 ? x : { ...x, th: '' }) }); FOTOS[id] = imgs; LISTA = null; pintar(); avisar('📌 ¡Trabajo pegado en el Muro Destacable!');
      } catch (er) { bt.disabled = false; m.textContent = er.message === 'AUTH' ? '🔐 Conecta tu cuenta: toca tu fotocheck → «Conectar mi cuenta».' : er.message === 'GRANDE' ? '📷 Las fotos son muy pesadas: prueba con menos fotos.' : '📶 No se pudo guardar. Revisa tu internet.'; } });
  }
  function verGrande(it) {
    let V = document.getElementById('muroVer'); if (!V) { V = document.createElement('div'); V.id = 'muroVer'; document.body.appendChild(V); V.addEventListener('click', e => { if (e.target === V || e.target.closest('.x')) V.classList.remove('on'); }); }
    V.innerHTML = `<button type="button" class="x" aria-label="Cerrar">✕</button><div>${collage(FOTOS[it.id] || [])}<div class="pie">⭐ ${esc(it.n)}${it.t ? `<small>${esc(it.t)}</small>` : ''}</div></div>`; V.classList.add('on');
  }
  function avisar(t) { if (typeof window.toast === 'function') window.toast(t, 3); }
  function abrir() {
    if (!EL) { EL = document.createElement('div'); EL.id = 'muro'; document.body.appendChild(EL);
      ['keydown', 'keyup', 'keypress'].forEach(t => EL.addEventListener(t, e => e.stopPropagation()));   // al escribir (espacios, flechas) no se mueve el aula
      EL.addEventListener('click', async e => {
        if (e.target === EL || e.target.closest('[data-x]')) return cerrar(true);
        if (e.target.closest('[data-nuevo]')) return mostrarForm(true);
        const d = e.target.closest('[data-del]'); if (d) { e.stopPropagation(); const it = (LISTA || []).find(x => x.id === d.dataset.del); if (!it || !confirm(`¿Quitar del muro el trabajo de ${it.n}?`)) return;
          try { const L = (await leer(IDX)) || { items: [] }; L.items = (L.items || []).filter(x => x.id !== it.id); await guardar(IDX, L); borrarDoc(it.id).catch(() => {}); LISTA = null; pintar(); avisar('🗑 Quitado del muro.'); }
          catch (er) { avisar(er.message === 'AUTH' ? '🔐 Conecta tu cuenta para quitarlo.' : '📶 No se pudo quitar.'); } return; }
        const v = e.target.closest('[data-ver]'); if (v && !e.target.closest('form')) { const it = (LISTA || []).find(x => x.id === v.dataset.ver); if (it) { await fotosDe(it); verGrande(it); } }
      }); }
    EL.classList.add('on'); pintar();
  }
  function cerrar() { if (EL) EL.classList.remove('on'); const V = document.getElementById('muroVer'); if (V) V.classList.remove('on'); }
  addEventListener('keydown', e => { if (e.key !== 'Escape') return; const V = document.getElementById('muroVer'); if (V && V.classList.contains('on')) { V.classList.remove('on'); e.stopPropagation(); } else if (EL && EL.classList.contains('on')) { cerrar(); e.stopPropagation(); } }, true);
  // tocar el papelógrafo en la pared lo vuelve a abrir
  const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
  addEventListener('pointerup', e => { const G = window.G, M = window.MURO_MESH; if (!G || !M || (EL && EL.classList.contains('on')) || e.target !== G.renderer.domElement) return;
    v2.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(v2, G.camera); if (ray.intersectObject(M, false).length) abrir(); });
  cargarLista();
  window.Muro = { abrir, cerrar, abierto: () => !!(EL && EL.classList.contains('on')), recargar: () => { LISTA = null; return cargarLista(); } };
})();
