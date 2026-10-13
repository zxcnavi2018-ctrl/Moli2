// ===================================================================
//  MOLÍ 2 · 📌 EDITAR CORCHO (sólo la docente)
//  La unidad, su propósito, las normas y los pasos del corcho del aula.
//  Se guarda en Firebase (files/fcorcho-0, como el aula editada) y todos los estudiantes lo ven igual.
// ===================================================================
(function () {
  const FILE = 'fcorcho-0', URL0 = `${Docente.BASE}/files/${FILE}?key=${Docente.FB.apiKey}`;
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const b64e = s => btoa(unescape(encodeURIComponent(s))), b64d = s => decodeURIComponent(escape(atob(s)));
  const cut = (t, n) => String(t == null ? '' : t).replace(/\s+/g, ' ').trim().slice(0, n);
  function aplicar(x) {
    const C = window.CORCHO; if (!C || !x || typeof x !== 'object') return;
    ['head', 'l1', 'unidad', 'l2', 'normasT', 'cientT'].forEach(k => { if (typeof x[k] === 'string' && x[k].trim()) C[k] = cut(x[k], 70); });
    if (typeof x.prop === 'string') C.prop = cut(x.prop, 260);
    ['normas', 'pasos'].forEach(k => { if (Array.isArray(x[k])) { const L = x[k].map(t => cut(t, 40)).filter(Boolean).slice(0, 4); if (L.length) C[k] = L; } });
    pintar();
  }
  function pintar() { const K = window.CORK; if (!K || typeof corkTex !== 'function') return; const old = K.mesh.material.map; K.mesh.material.map = corkTex(K.LL); K.mesh.material.needsUpdate = true; if (old) old.dispose(); }
  fetch(URL0, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => { const v = j && j.fields && j.fields.b64 && j.fields.b64.stringValue; if (v) aplicar(JSON.parse(b64d(v))); }).catch(() => {});

  function panel(msg) {
    const C = window.CORCHO;
    const b = Herramientas.abrir('📌 Editar corcho', 'Lo que ven tus estudiantes en el corcho del aula.', 'idea', `
      <form class="hp-f" data-cor="1">
        <label>Cartel de arriba</label><input name="head" maxlength="70" value="${esc(C.head)}">
        <label>Unidad</label><div class="hp-row"><input name="l1" maxlength="70" value="${esc(C.l1)}"><input name="unidad" maxlength="70" value="${esc(C.unidad)}" placeholder="Unidad 8 · …"></div>
        <label>Propósito de la unidad</label><input name="l2" maxlength="70" value="${esc(C.l2)}"><textarea name="prop" rows="3" maxlength="260" placeholder="Escribe aquí el propósito de la unidad">${esc(C.prop)}</textarea>
        <label>Normas del aula (una por línea, máximo 4)</label><input name="normasT" maxlength="70" value="${esc(C.normasT)}"><textarea name="normas" rows="4">${esc(C.normas.join('\n'))}</textarea>
        <label>Pasos del científico (una por línea, máximo 4)</label><input name="cientT" maxlength="70" value="${esc(C.cientT)}"><textarea name="pasos" rows="4">${esc(C.pasos.join('\n'))}</textarea>
        <button class="hp-ok" type="submit">💾 Guardar corcho</button><p class="hp-msg">${msg || ''}</p></form>`);
    b.addEventListener('submit', async e => {
      e.preventDefault(); const f = e.target; if (!f.dataset.cor) return; const m = f.querySelector('.hp-msg'), bt = f.querySelector('button');
      const v = n => f.elements[n].value, x = { head: v('head'), l1: v('l1'), unidad: v('unidad'), l2: v('l2'), prop: v('prop'), normasT: v('normasT'), normas: v('normas').split(/\n+/), cientT: v('cientT'), pasos: v('pasos').split(/\n+/) };
      bt.disabled = true; m.textContent = 'Guardando…';
      try {
        if (!await Docente.token()) throw new Error('AUTH');
        await Docente.commit([{ update: { name: Docente.DOC('files', FILE), fields: Docente.toF({ b64: b64e(JSON.stringify({ v: 1, ...x, at: Date.now() })), updatedAt: new Date() }) } }]);
        aplicar(x); panel('✅ ¡Listo! El corcho ya está actualizado para todos.');
      } catch (er) { bt.disabled = false; m.textContent = er.message === 'AUTH' ? '🔐 Conecta tu cuenta: toca tu fotocheck → «Conectar mi cuenta».' : '📶 No se pudo guardar. Revisa tu internet.'; }
    });
  }
  Herramientas.extra.corcho = () => panel();
  window.Corcho = { aplicar, pintar };
})();
