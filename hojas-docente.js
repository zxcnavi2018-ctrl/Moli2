// ===================================================================
//  MOLÍ 2 · HOJAS DE LA DOCENTE: los mismos cuadernos del aula, pero con lo de todos sus estudiantes (6° A, B, C y D).
//   · Folder azul (Mis notas)  → Registro: Exit ticket, participación, conducta y refuerzo de cada estudiante (se puede poner la nota)
//   · Portafolio (Exit tickets) → cuántos respondieron, qué preguntas fallaron más y cómo le fue a cada uno
//   · Cuaderno verde (misiones) → quiénes ya cumplieron su refuerzo y quiénes no
//   · Cuaderno de sesiones      → igual que el del estudiante, con «✏️ Editar sesión»
//   · Laptop                    → avance de cada estudiante en el Laboratorio de Molí
// ===================================================================
(function () {
  const { Libro, esc, L, IMG, cargando, nivelChip, temaDe, MODOS, hojaUnidades, fichaHtml, lk } = Hojas._;
  const SECS = ['A', 'B', 'C', 'D'], GN = () => MD.espInfo().gn;
  const LSd = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const PAV = ['', '1', '2', '3', '+4'], CONDK = ['', 'C', 'B', 'A', 'AD'];
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const errTxt = e => e && e.message === 'AUTH' ? '🔐 Conecta tu cuenta de docente: toca tu fotocheck → «Conectar mi cuenta».' : '📶 No pude traer los datos. Revisa tu internet.';
  const secBar = F => `<div class="secs w">${SECS.map(x => `<button class="sec${F.sec === x ? ' on' : ''}" data-a="sec" data-k="${x}">${GN()} ${x}</button>`).join('')}</div>`;
  const nomCorto = n => String(n || '').split(' ').slice(0, 3).join(' ');
  const pBool = v => Array.isArray(v) ? true : !!v;

  // ---- base: elegir unidad → sección → páginas ----
  function base(titulo, icono, frase) {
    const F = { i: 0, u: null, listo: false, me: MD.yo(), sec: LSd.get('moli2:dsec', 'A'), D: null, err: null };
    const carga = () => { F.D = null; F.err = null; const u = F.u, sec = F.sec;
      F.datos(u, sec).then(D => { if (F.u === u && F.sec === sec) F.D = D; }).catch(e => { F.err = errTxt(e); }).finally(() => F.libro && F.libro.pinta(true)); };
    F.recargar = carga;
    F.hojas = () => {
      if (!F.listo) return [{ l: cargando(), r: '' }];
      if (!F.u) { const h = hojaUnidades(titulo, icono, frase, F.me); if (F.masUnidades) h.l += F.masUnidades(); return [h]; }
      if (F.ed0) return F.ed0();                                         // un editor abierto (Exit ticket o misión nueva) no espera la lista de estudiantes
      const cab = `<div class="crumb w">${esc(F.u.icon || '📘')} Unidad ${esc(F.u.num)} · ${esc(F.u.title)}</div><h1 class="w">${icono} ${esc(titulo)}</h1>${secBar(F)}`;
      if (F.err) return [{ l: cab + `<p class="hand w">${F.err}</p><p class="center"><button class="bt" data-a="reint">Intentar otra vez</button></p>`, r: '' }];
      if (!F.D) return [{ l: cab + cargando('Trayendo lo de ' + GN() + ' ' + F.sec + '…'), r: '' }];
      return F.paginas(cab);
    };
    F.atras = () => { if (F.u) { F.u = null; F.i = 0; F.pestana = null; } };
    F.alTab = () => F.libro.pasar(-1, () => { F.u = null; F.i = 0; F.pestana = null; });
    F.alMover = () => {};
    F.act = (a, ds, el) => {
      if (a === 'unidad') return F.libro.pasar(1, () => { F.u = MD.unidades().find(u => u.key === ds.k); F.i = 0; F.pestana = '📚 Unidades'; carga(); });
      if (a === 'sec') { if (ds.k === F.sec) return; F.sec = ds.k; LSd.set('moli2:dsec', F.sec); F.i = 0; carga(); return F.libro.pinta(true); }
      if (a === 'reint') { carga(); return F.libro.pinta(true); }
      if (a === 'ir') return F.libro.pasar(1, () => { F.i = +ds.i; });
      F.act2 && F.act2(a, ds, el);
    };
    F.iniciar = () => MD.cargar().then(() => MD.cargarMisiones().catch(() => {})).then(() => { F.listo = true; F.libro.pinta(true); }).catch(() => { F.listo = true; F.libro.pinta(true); });
    return F;
  }
  const setP = (o, path, v) => { const k = path.split('.'); let x = o; k.slice(0, -1).forEach((p, i) => { if (x[p] == null) x[p] = /^\d+$/.test(k[i + 1]) ? [] : {}; x = x[p]; }); x[k[k.length - 1]] = v; };
  const iaTxt = e => e && e.message === 'QUOTA' ? '⏳ Google está al límite. Intenta en un minuto.' : '🤖 Molí no pudo ahora. Intenta otra vez.';
  const pubTxt = x => x && x.message === 'AUTH' ? 'Conecta tu cuenta de docente (fotocheck → Conectar mi cuenta).' : x && x.message === 'GRANDE' ? 'El contenido es muy grande.' : 'No se pudo publicar. Revisa tu internet.';
  const resumenSes = (u, s, n) => `Unidad ${u.num}: ${u.title || ''}\nSesión ${n}: ${s.title || ''}\nMeta: ${s.meta || ''}\nCriterios: ${(s.criteria || []).filter(L).join('; ')}\nActividades:\n${(s.activities || []).filter(a => a && (L(a.title) || L(a.desc))).map((a, i) => `${i + 1}. ${a.title || ''}: ${a.desc || ''}`).join('\n')}`;
  const mezclar = A => { for (let i = A.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [A[i], A[j]] = [A[j], A[i]]; } return A; };
  async function estDe(sec) { return (await Docente.estudiantes()).filter(s => s.section === sec); }
  const porEst = T => { const o = {}; T.forEach(t => { (o[t.student] = o[t.student] || {})[t.session] = t; }); return o; };

  // =================================================================
  //  FOLDER AZUL · REGISTRO
  // =================================================================
  // ================================================================
  //  🎤 DICTAR NOTAS: «Chris conducta B», «Ana participación 3», «todos trabajo A»…
  //  Se escucha (o se escribe), se arma una ventanita con los cambios y sólo se guarda al apretar «✅ Correcto».
  // ================================================================
  const sinT = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const CAMPOS = [['w', /trabajo( en clase)?|rubrica|producto/], ['p', /participa\w*/], ['c', /conducta|comportamiento/], ['e', /exit( ticket)?|ticket/], ['r', /refuerzo|mision/]];
  const CNOM = { w: '🛠️ Trabajo en clase', p: '🙋 Participación', c: '🤝 Conducta', e: '🎟️ Exit ticket', r: '💪 Refuerzo' };
  const VALS = t => t === 'p' ? [[1, '1'], [2, '2'], [3, '3'], [4, '+4']] : t === 'r' ? [['ok', '✅ Realizado'], ['pe', '⏳ Pendiente']] : [[4, 'AD'], [3, 'A'], [2, 'B'], [1, 'C']];
  function valorDe(t, r) {
    const x = ' ' + r.replace(/[^a-z0-9+ ]/g, ' ').replace(/\s+/g, ' ').trim() + ' ', tk = x.trim().split(' '), tiene = w => tk.includes(w);
    if (t === 'r') return /realiz|hecho|hizo|cumpli|listo|complet/.test(x) && !/no hizo|no cumpli/.test(x) ? 'ok' : /pendiente|falta|no hizo|no cumpli/.test(x) ? 'pe' : null;
    if (t === 'p') { if (/(\+ ?4|mas cuatro|cuatro|\b4\b)/.test(x)) return 4; if (/\b(3|tres)\b/.test(x)) return 3; if (/\b(2|dos)\b/.test(x)) return 2; if (/\b(1|uno|una)\b/.test(x)) return 1; return null; }
    if (/logro destacado|destacad|excelente|sobresaliente| a d /.test(x) || tiene('ad')) return 4;
    if (/por mejorar|en proceso|proceso|regular/.test(x) || tiene('b') || tiene('be') || tiene('ve')) return 2;
    if (/en inicio|inicio|necesita apoyo/.test(x) || tiene('c') || tiene('ce') || tiene('se')) return 1;
    if (/logro esperado|logrado|esperado|muy bien|bien/.test(x) || tiene('a')) return 3;
    return null;
  }
  function buscarEst(q, est) {                                         // por el nombre o el apellido; «Chris» sirve para «Christian»
    const Q = sinT(q).split(/\s+/).filter(w => w.length >= 2 && !/^(a|al|el|la|los|las|de|del|para|nota|ponle|pon|poner)$/.test(w)); if (!Q.length) return [];
    const sc = est.map(e => { const N = sinT(e.name).split(/\s+/); let s = 0; Q.forEach(w => { let b = 0; N.forEach(n => { b = Math.max(b, n === w ? 3 : n.startsWith(w) && w.length >= 3 ? 2 : w.startsWith(n) && n.length >= 3 ? 1 : 0); }); s += b; }); return { e, s }; }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
    return sc.filter(x => x.s === (sc[0] || {}).s).map(x => x.e);
  }
  const SECRE = /(?:^| )(?:sexto|6to|6 ?°?|seis|s[eé]ptimo|7mo|7 ?°?|siete)\s*(?:grado\s*)?(?:seccion\s*)?([abcd])(?= |$)/;
  function leerOrden(txt, est, todos, sec) {                          // todos: estudiantes de 6° A-D; sec: la sección abierta
    const out = [];
    sinT(txt).split(/[,.;]| y luego | luego | despues | tambien /).map(x => x.trim()).filter(Boolean).forEach(pz => {
      let campo = null, idx = -1, len = 0;
      CAMPOS.forEach(([k, re]) => { const m = pz.match(re); if (m && (idx < 0 || m.index < idx)) { campo = k; idx = m.index; len = m[0].length; } });
      if (!campo) return out.push({ err: pz });
      let quien = pz.slice(0, idx).trim(); const v = valorDe(campo, pz.slice(idx + len));
      if (v == null) return out.push({ err: pz });
      const ms = quien.match(SECRE), sc = ms ? ms[1].toUpperCase() : sec; if (ms) quien = quien.replace(SECRE, ' ').trim();   // «Christian sexto C …»
      const grupo = sc === sec ? est : (todos || []).filter(e => e.section === sc);
      if (/(^| )(todos|todas|toda la clase|todo el salon)( |$)/.test(quien)) return grupo.forEach(e => out.push({ s: e.key, t: campo, v }));
      const C = buscarEst(quien, grupo); out.push({ s: C[0] ? C[0].key : '', t: campo, v, oido: quien + (ms ? ' (' + GN() + ' ' + sc + ')' : ''), duda: C.length !== 1 });
    });
    return out;
  }
  const guardarRefVoz = (F, c) => F.guardarRef(c);
  function ventanaVoz(F, n) {
    const est = F.D.est, SR = window.SpeechRecognition || window.webkitSpeechRecognition; let todos = est;
    Docente.estudiantes().then(L => { todos = L.filter(e => /^[A-D]$/.test(e.section)); }).catch(() => {});
    let V = document.getElementById('vozM'); if (V) V.remove(); V = document.createElement('div'); V.id = 'vozM'; document.body.appendChild(V);
    let filas = [], rec = null;
    const opcEst = sel => ['A', 'B', 'C', 'D'].map(x => { const L = (x === F.sec ? est : todos.filter(e => e.section === x)); return L.length ? `<optgroup label="${GN()} ${x}">${L.map(e => `<option value="${e.key}"${e.key === sel ? ' selected' : ''}>${esc(e.name)}${x === F.sec ? '' : ' · 6° ' + x}</option>`).join('')}</optgroup>` : ''; }).join('');
    const buscaTodos = k => est.find(e => e.key === k) || todos.find(e => e.key === k);
    const pinta = (txt) => {
      V.innerHTML = `<div class="vz"><div class="vz-h"><b>🎤 Dictar notas · Sesión ${n} · ${GN()} ${esc(F.sec)}</b><button class="vz-x" data-v="x">✕</button></div>
        <p class="vz-tip">Di o escribe, por ejemplo: <i>«Chris conducta B»</i>, <i>«Ana participación 3»</i>, <i>«Luis trabajo en clase A»</i>, <i>«todos refuerzo realizado»</i>. Puedes decir varias seguidas, separadas con «luego».</p>
        <div class="vz-in"><input placeholder="Lo que dijiste aparece aquí…" value="${esc(txt || '')}"><button data-v="leer">Leer</button>${SR ? '<button class="vz-mic" data-v="mic">🎤 Hablar</button>' : ''}</div>
        ${SR ? '' : '<p class="vz-tip" style="color:#b45309">ℹ️ Este navegador no reconoce la voz (usa Chrome o tu celular). Puedes escribir la orden.</p>'}
        <div class="vz-l">${filas.length ? filas.map((f, i) => f.err ? `<div class="vz-r vz-err">⚠️ No entendí: «${esc(f.err)}»<button data-v="del" data-i="${i}">✕</button></div>`
          : `<div class="vz-r${f.duda || !f.s ? ' duda' : ''}"><select data-i="${i}" data-c="s"><option value="">— ¿Quién? —</option>${opcEst(f.s)}</select>
            <select data-i="${i}" data-c="t">${Object.keys(CNOM).map(k => `<option value="${k}"${k === f.t ? ' selected' : ''}>${CNOM[k]}</option>`).join('')}</select>
            <select data-i="${i}" data-c="v">${VALS(f.t).map(([v, tx]) => `<option value="${v}"${String(v) === String(f.v) ? ' selected' : ''}>${tx}</option>`).join('')}</select><button data-v="del" data-i="${i}">✕</button>
            ${f.duda && f.oido ? `<small>Oí «${esc(f.oido)}»: revisa que sea el estudiante correcto</small>` : ''}</div>`).join('') : '<p class="vz-vacio">Aquí aparecerán los cambios antes de guardarlos.</p>'}</div>
        <div class="vz-f"><span class="vz-msg"></span><button data-v="x">Cancelar</button><button class="vz-ok" data-v="ok"${filas.some(f => !f.err && f.s) ? '' : ' disabled'}>✅ Correcto, guardar</button></div></div>`;
    };
    const leer = txt => { if (rec) { rec.onend = null; rec.abort(); rec = null; } filas = filas.filter(f => !f.err).concat(leerOrden(txt, est, todos, F.sec)); pinta(''); };
    const hablar = () => { if (rec) return rec.stop(); rec = new SR(); rec.lang = 'es-PE'; rec.interimResults = true; rec.continuous = false; let fin = '';
      const b = V.querySelector('[data-v="mic"]'), inp = V.querySelector('input'); b.textContent = '⏺ Te escucho… (toca para parar)'; b.classList.add('on');
      rec.onresult = e => { let t = ''; for (const r of e.results) t += r[0].transcript; inp.value = t; if (e.results[e.results.length - 1].isFinal) fin = t; };
      rec.onerror = e => { const m = V.querySelector('.vz-msg'); if (m) m.textContent = e.error === 'not-allowed' ? '🔒 Permite el micrófono en el navegador.' : '🎤 No te escuché. Intenta otra vez.'; };
      rec.onend = () => { rec = null; if (fin.trim()) leer(fin); else { const b2 = V.querySelector('[data-v="mic"]'); if (b2) { b2.textContent = '🎤 Hablar'; b2.classList.remove('on'); } } };
      rec.start(); };
    V.addEventListener('click', async e => { const b = e.target.closest('[data-v]'); if (!b && e.target === V) return V.remove(); if (!b) return; const a = b.dataset.v;
      if (a === 'x') { if (rec) rec.abort(); return V.remove(); }
      if (a === 'mic') return hablar();
      if (a === 'leer') return leer(V.querySelector('input').value);
      if (a === 'del') { filas.splice(+b.dataset.i, 1); return pinta(''); }
      if (a === 'ok') { const ok = filas.filter(f => !f.err && f.s); if (!ok.length) return; b.disabled = true; const m = V.querySelector('.vz-msg');
        const refs = ok.filter(f => f.t === 'r').map(f => [f.s, n, f.v]), notas = ok.filter(f => f.t !== 'r'); let hechos = 0, mal = 0;
        try { if (refs.length) { await guardarRefVoz(F, refs); hechos += refs.length; }
          for (let i = 0; i < notas.length; i += 4) await Promise.all(notas.slice(i, i + 4).map(async f => { const code = { e: 0, p: 30, c: 60, w: 80 }[f.t] + n, e2 = buscaTodos(f.s);
            try { const r = await Docente.guardarNota(F.u, code, e2, +f.v); const R = F.D.byS[f.s] = F.D.byS[f.s] || {}; if (r) R[code] = r; hechos++; } catch (x) { mal++; if (x.message === 'AUTH') throw x; } finally { m.textContent = `Guardando… ${hechos + mal} de ${ok.length}`; } }));
          F.libro.pinta(false); if (mal) { m.textContent = `⚠️ ${mal} no se guardaron. Revisa tu internet.`; b.disabled = false; return; } V.remove(); }
        catch (x) { m.textContent = errTxt(x); b.disabled = false; } }
    });
    V.addEventListener('change', e => { const s = e.target.closest('select[data-i]'); if (!s) return; const f = filas[+s.dataset.i]; if (!f) return;
      if (s.dataset.c === 's') { f.s = s.value; f.duda = false; } if (s.dataset.c === 't') { f.t = s.value; f.v = VALS(f.t)[0][0]; } if (s.dataset.c === 'v') f.v = s.value; pinta(V.querySelector('input').value); });
    V.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter' && e.target.tagName === 'INPUT') leer(e.target.value); if (e.key === 'Escape') V.remove(); });
    pinta(''); if (SR) hablar(); else setTimeout(() => V.querySelector('input').focus(), 50);
  }
  if (!document.getElementById('vozCss')) { const st = document.createElement('style'); st.id = 'vozCss'; st.textContent = `
    #vozM { position: fixed; inset: 0; z-index: 2147483200; display: grid; place-items: center; padding: 12px; background: rgba(15,23,42,.55); font-family: "Trebuchet MS", system-ui, sans-serif; }
    #vozM .vz { width: min(720px, 100%); max-height: calc(100vh - 24px); overflow: auto; background: #fff; color: #1e293b; border-radius: 18px; border: 3px solid #2b2547; padding: 14px 16px; box-shadow: 0 20px 50px rgba(0,0,0,.4); }
    #vozM .vz-h { display: flex; align-items: center; gap: 8px; font-size: 18px; } #vozM .vz-h b { flex: 1; color: #4338ca; } #vozM .vz-x { border: 0; background: #f1f5f9; border-radius: 50%; width: 34px; height: 34px; font-size: 16px; cursor: pointer; }
    #vozM .vz-tip { margin: 6px 0; font-size: 13.5px; color: #475569; } #vozM .vz-tip i { color: #1d4ed8; font-style: normal; font-weight: 800; }
    #vozM .vz-in { display: flex; gap: 6px; flex-wrap: wrap; margin: 8px 0; } #vozM .vz-in input { flex: 1; min-width: 180px; font: 700 15px system-ui; padding: 10px 12px; border: 2px solid #cbd5e1; border-radius: 12px; }
    #vozM button { font: 800 14px system-ui; border: 2px solid #2b2547; border-radius: 999px; padding: 8px 14px; background: #fff; cursor: pointer; }
    #vozM .vz-mic { background: #ef4444; color: #fff; border-color: #b91c1c; } #vozM .vz-mic.on { animation: vzP 1s ease-in-out infinite; } @keyframes vzP { 50% { box-shadow: 0 0 0 8px rgba(239,68,68,.25); } }
    #vozM .vz-l { display: grid; gap: 6px; margin: 8px 0; } #vozM .vz-vacio { color: #94a3b8; text-align: center; margin: 14px 0; }
    #vozM .vz-r { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 8px; border-radius: 12px; background: #f0fdf4; border: 2px solid #bbf7d0; } #vozM .vz-r.duda { background: #fffbeb; border-color: #fcd34d; } #vozM .vz-r.vz-err { background: #fef2f2; border-color: #fecaca; color: #b91c1c; font-weight: 700; justify-content: space-between; }
    #vozM .vz-r select { font: 700 14px system-ui; padding: 6px; border-radius: 8px; border: 1.5px solid #cbd5e1; max-width: 100%; } #vozM .vz-r select[data-c="s"] { flex: 1; min-width: 160px; } #vozM .vz-r small { width: 100%; color: #b45309; font-weight: 700; } #vozM .vz-r > button { padding: 4px 10px; }
    #vozM .vz-f { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; } #vozM .vz-msg { flex: 1; font-weight: 800; color: #b45309; font-size: 13px; }
    #vozM .vz-ok { background: #22c55e; color: #fff; border-color: #15803d; font-size: 16px; padding: 10px 18px; } #vozM .vz-ok:disabled { opacity: .5; }
    .bk .voz-b { margin: .4em 0; border: .15em solid #2b2547; border-radius: 999px; padding: .3em .9em; background: #ef4444; color: #fff; font: 900 .95em "Trebuchet MS", system-ui; cursor: pointer; box-shadow: 0 .2em 0 #2b2547; }`; document.head.appendChild(st); }
  function registro() {
    const F = base('Registro', '📂', 'Elige la unidad: verás el registro de ' + GN() + ' A, B, C y D. Se llena solo con los Exit tickets; tú pones participación y conducta. ✏️');
    F.datos = async (u, sec) => {
      const [est, T, M, rm] = await Promise.all([estDe(sec), Docente.ticketsUnidad(u.key, sec), Docente.misionesTodos().catch(() => []), MD.refuerzoManual(u.key)]);
      const mp = {}; M.forEach(m => { mp[m.key] = m.p; });
      return { est, byS: porEst(T), mp, mis: MD.misionesDe(u.key), rm };
    };
    const refDe = (D, s, n) => { const o = ((D.rm || {})[s.key] || {})[n]; if (o) return o === 'ok';      // lo que marcó la docente manda
      const ms = D.mis.filter(m => m.ses && m.ses.n === n); if (!ms.length) return null; const p = D.mp[s.key] || {}; return ms.every(m => m.acts.every(a => pBool(p[a.id]))); };
    const COD = { e: 0, p: 30, c: 60, w: 80 }, TNOM = { e: '🎟️ Exit ticket', p: '🙋 Participación', c: '🤝 Conducta', w: '🛠️ Trabajo en clase', r: '💪 Refuerzo' }, TCOR = { p: 'Particip.', c: 'Conducta', w: 'Trabajo', r: 'Refuerzo' };   // trabajo en clase (rúbrica): 80 + n
    const OPS = t => t === 'p' ? [[1, '1'], [2, '2'], [3, '3'], [4, '+4']] : t === 'r' ? [['ok', '✅ Realizado'], ['pe', '⏳ Pendiente']] : [[4, 'AD'], [3, 'A'], [2, 'B'], [1, 'C']];
    const celdaRef = (F, s, n) => { const rf = refDe(F.D, s, n), man = (((F.D.rm || {})[s.key] || {})[n]);
      if (F.guarda === `r|${n}|${s.key}`) return '<span class="rg-c"><span class="rg-b">…</span></span>';
      return `<span class="rg-c"><button class="rg-b${rf === null ? '' : ' on'}${rf ? ' cAD' : rf === false ? ' cB' : ''}" data-a="nota" data-t="r" data-n="${n}" data-s="${s.key}" title="${man ? 'Marcado por ti' : 'Automático (misiones)'}">${rf === null ? '·' : rf ? '✅' : '⏳'}</button></span>`; };
    F.guardarRef = cambios => guardarRef(F, cambios);
    async function guardarRef(F, cambios) {                             // guarda las marcas de refuerzo de la unidad (un solo archivo)
      const rm = F.D.rm = F.D.rm || {}, antes = JSON.stringify(rm);
      cambios.forEach(([k, n, v]) => { const o = rm[k] = rm[k] || {}; if (v) o[n] = v; else { delete o[n]; if (!Object.keys(o).length) delete rm[k]; } });
      try { const todo = { ...(await MD.refuerzoManual(F.u.key)) }; Object.keys(todo).forEach(k => { if (F.D.est.some(e => e.key === k)) delete todo[k]; }); Object.assign(todo, rm);   // no pisa a las otras secciones
        await Docente.commit([{ update: { name: Docente.DOC('files', MD.RFF(F.u.key)), fields: Docente.toF({ b64: btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, s: todo, at: Date.now() })))), updatedAt: new Date() }) } }]); }
      catch (x) { F.D.rm = JSON.parse(antes); alert(errTxt(x)); }
    }
    const celda = (F, s, n, t) => {
      const D = F.D, r = (D.byS[s.key] || {})[COD[t] + n], k = `${t}|${n}|${s.key}`;
      if (F.guarda === k) return '<span class="rg-c"><span class="rg-b">…</span></span>';
      const v = r ? (t === 'p' ? PAV[MD.partic(r)] : MD.nivel(r).k) : '·';
      return `<span class="rg-c"><button class="rg-b${r ? ' on' : ''}${t !== 'p' && r ? ' c' + MD.nivel(r).k : ''}" data-a="nota" data-t="${t}" data-n="${n}" data-s="${s.key}">${v}</button></span>`;
    };
    F.paginas = (cab) => {
      const u = F.u, D = F.D, S = MD.sesionesDe(u);
      if (!D.est.length) return [{ l: cab + '<p class="hand w">No hay estudiantes en esta sección todavía. Créalos con «Crear cuenta con Molí» (tu fotocheck).</p>', r: '' }];
      const res = D.est.map(s => { const R = D.byS[s.key] || {}, ex = S.map(x => R[x.n]).filter(Boolean), pr = MD.promedio(ex), pa = S.map(x => R[30 + x.n]).filter(Boolean);
        const refs = S.map(x => refDe(D, s, x.n)).filter(v => v !== null);
        const tw = MD.promedio(S.map(x => R[80 + x.n]).filter(Boolean));
        return `<div class="rg w"><span class="rg-n">${esc(nomCorto(s.name))}</span><span class="rg-c">${pr ? nivelChip(pr) : '<small>—</small>'}</span><span class="rg-c"><small>${ex.length}/${S.length}</small></span><span class="rg-c">${tw ? nivelChip(tw) : '<small>—</small>'}</span><span class="rg-c"><small>${pa.reduce((a, r) => a + MD.partic(r), 0)}</small></span><span class="rg-c"><small>${refs.length ? refs.filter(Boolean).length + '/' + refs.length : ''}</small></span></div>`; }).join('');
      const H = [{ l: cab + `<p class="hand w">${D.est.length} estudiantes · ${S.length} sesiones.</p><p class="hand w">Pasa la hoja: en cada sesión tocas la casilla de cada estudiante para poner su nota, o usas <b>⚡ Llenar</b> para poner la misma nota a todos los que faltan. Se guarda al toque. ✅</p>
          <div class="box w"><b>Leyenda</b><br><small>🎟️ Exit ticket (sumativa) · 🛠️ Trabajo en clase: rúbrica AD/A/B/C (sumativa) · 🙋 Participación 1 a +4 · 🤝 Conducta AD/A/B/C · 💪 Refuerzo</small></div>`,
        r: `<h2 class="w">🏁 Resumen de la unidad</h2><div class="rg rg-h w"><span class="rg-n">Estudiante</span><span class="rg-c">🎟️<i>Exit</i></span><span class="rg-c">✔<i>hechos</i></span><span class="rg-c">🛠️<i>Trabajo</i></span><span class="rg-c">🙋<i>Particip.</i></span><span class="rg-c">💪<i>Refuerzo</i></span></div>${res}` }];
      S.forEach(({ s, n }) => {
        const resp = D.est.filter(e => (D.byS[e.key] || {})[n]), pr = MD.promedio(resp.map(e => D.byS[e.key][n]));
        H.push({ l: `<div class="crumb w">${esc(u.icon || '📘')} Unidad ${esc(u.num)} · ${GN()} ${F.sec}</div><div class="big w">Sesión ${n}</div><h2 class="w">${esc(temaDe(s, n))}</h2>${secBar(F)}
            <p class="hand w">🎟️ Exit ticket: <b>${resp.length} de ${D.est.length}</b> respondieron${pr ? ' · promedio ' + nivelChip(pr) : ''}.</p><p class="hand w">Toca la casilla de cada estudiante para poner su nota, o <b>⚡ Llenar</b> para ponerla a todos los que faltan.</p><button class="voz-b w" data-a="voz" data-n="${n}">🎤 Dictar notas</button>${F.llenando ? `<p class="hand w" style="color:#b45309">⏳ ${esc(F.llenando)}</p>` : ''}`,
          r: `<div class="rg rg-h w"><span class="rg-n">Sesión ${n}</span><span class="rg-c">🎟️<i>Exit</i></span>${['w', 'p', 'c', 'r'].map(t => `<span class="rg-c">${TNOM[t].split(' ')[0]}<i>${TCOR[t]}</i><button class="rg-q" data-a="llenar" data-t="${t}" data-n="${n}" title="Llenado rápido: lo mismo a todos los que faltan">⚡ Llenar</button></span>`).join('')}</div>`
            + (F.fill && F.fill.n === n ? `<div class="rg pick w"><span class="rg-n">⚡ ${TNOM[F.fill.t]}: poner a todos los que faltan</span>${OPS(F.fill.t).map(([v, tx]) => `<button class="rg-b" data-a="llenaTodos" data-v="${v}">${tx}</button>`).join('')}<button class="rg-b x" data-a="llenaTodos" data-v="0">✕</button></div>` : '')
            + D.est.map(e => {
            const R = D.byS[e.key] || {}, x = R[n], rf = refDe(D, e, n);
            if (F.pick && F.pick.n === n && F.pick.s === e.key) { const t = F.pick.t;
              return `<div class="rg pick w"><span class="rg-n">${TNOM[t].split(' ')[0]} ${esc(nomCorto(e.name))}</span>${OPS(t).map(([v, tx]) => `<button class="rg-b" data-a="pon" data-v="${v}">${tx}</button>`).join('')}<button class="rg-b x" data-a="pon" data-v="0" title="${t === 'r' ? 'Quitar tu marca (vuelve a lo automático)' : 'Borrar la nota'}">✕</button></div>`; }
            return `<div class="rg w"><span class="rg-n">${esc(nomCorto(e.name))}</span>${celda(F, e, n, 'e')}${celda(F, e, n, 'w')}${celda(F, e, n, 'p')}${celda(F, e, n, 'c')}${celdaRef(F, e, n)}</div>`; }).join('') });
      });
      return H;
    };
    F.act2 = async (a, ds) => {
      if (a === 'voz') return ventanaVoz(F, +ds.n);
      if (a === 'nota') { F.pick = { t: ds.t, n: +ds.n, s: ds.s }; F.fill = null; return F.libro.pinta(false); }
      if (a === 'llenar') { F.fill = F.fill && F.fill.t === ds.t && F.fill.n === +ds.n ? null : { t: ds.t, n: +ds.n }; F.pick = null; return F.libro.pinta(false); }
      if (a === 'llenaTodos') {                                       // ⚡ llenado rápido: la misma nota a todos los que todavía no la tienen
        const { t, n } = F.fill; F.fill = null;
        if (t === 'r') { if (!ds.v || ds.v === '0' || F.llenando) return F.libro.pinta(false);       // refuerzo: a todos los que no tienen marca tuya
          const L = F.D.est.filter(e => !(((F.D.rm || {})[e.key] || {})[n])); if (!L.length) { alert('Ya marcaste el refuerzo de todos. Para cambiar uno, toca su casilla.'); return F.libro.pinta(false); }
          F.llenando = 'Guardando refuerzos…'; F.libro.pinta(false); await guardarRef(F, L.map(e => [e.key, n, ds.v])); F.llenando = ''; return F.libro.pinta(false); }
        const v = +ds.v; if (!v || F.llenando) return F.libro.pinta(false);
        const code = COD[t] + n, L = F.D.est.filter(e => !(F.D.byS[e.key] || {})[code]);
        if (!L.length) { F.llenando = ''; alert('Todos ya tienen esa nota. Para cambiar una, toca su casilla.'); return F.libro.pinta(false); }
        let ok = 0, mal = 0; const pinta = () => { F.llenando = `Llenando ${TNOM[t]}: ${ok + mal} de ${L.length}…`; F.libro.pinta(false); }; pinta();
        for (let i = 0; i < L.length; i += 4) await Promise.all(L.slice(i, i + 4).map(async e => {
          try { const r = await Docente.guardarNota(F.u, code, e, v); const R = F.D.byS[e.key] = F.D.byS[e.key] || {}; if (r) R[code] = r; ok++; } catch (x) { mal++; if (x.message === 'AUTH') throw x; } finally { pinta(); } })).catch(x => { alert(errTxt(x)); i = L.length; });
        F.llenando = ''; F.libro.pinta(false); if (mal) alert(`⚠️ ${mal} nota${mal > 1 ? 's' : ''} no se guardaron. Revisa tu internet y vuelve a tocar ⚡ Llenar.`);
        return;
      }
      if (a === 'pon') {
        const { t, n, s } = F.pick; F.pick = null;
        if (t === 'r') { F.guarda = `r|${n}|${s}`; F.libro.pinta(false); await guardarRef(F, [[s, n, ds.v === '0' ? '' : ds.v]]); F.guarda = null; return F.libro.pinta(false); }
        const v = +ds.v, code = COD[t] + n, e = F.D.est.find(x => x.key === s);
        if (t === 'e' && !v && !confirm(`¿Borrar el Exit ticket de ${e ? e.name : 'este estudiante'} en la sesión ${n}?`)) return F.libro.pinta(false);
        F.guarda = `${t}|${n}|${s}`; F.libro.pinta(false);
        try { const r = await Docente.guardarNota(F.u, code, e, v); const R = F.D.byS[s] = F.D.byS[s] || {}; if (r) R[code] = r; else delete R[code]; }
        catch (x) { alert(errTxt(x)); }
        F.guarda = null; F.libro.pinta(false);
      }
    };
    return F;
  }

  // =================================================================
  //  PORTAFOLIO · EXIT TICKETS (avances y errores)
  // =================================================================
  function exitDoc() {
    const F = base('Exit tickets', '🎟️', 'Elige la unidad: verás cuántos respondieron, qué preguntas costaron más y cómo le fue a cada estudiante. 📊');
    F.datos = async (u, sec) => { const [est, T] = await Promise.all([estDe(sec), Docente.ticketsUnidad(u.key, sec)]); return { est, byS: porEst(T) }; };
    F.paginas = (cab) => {
      const u = F.u, D = F.D, S = MD.sesionesDe(u).filter(x => MD.preguntas(x.s).length);
      const fila = ({ s, n }, k) => { const R = D.est.filter(e => (D.byS[e.key] || {})[n]), pr = MD.promedio(R.map(e => D.byS[e.key][n]));
        return `<button class="row w" data-a="ir" data-i="${k + 1}"><b class="lv" style="background:#dcfce7;color:#166534">${n}</b><span class="rt"><b>Sesión ${n} · ${R.length}/${D.est.length}</b><small>${esc(temaDe(s, n))}</small></span>${pr ? nivelChip(pr) : ''}${lk(u.key, n)}</button>`; };
      const H = [{ l: cab + `<p class="hand w">${D.est.length} estudiantes en ${GN()} ${F.sec}.</p><p class="hand w">Toca una sesión para ver sus preguntas: las que están en rojo hay que <b>reforzarlas</b>. ⚠️</p>`,
        r: `<h2 class="w">📋 Sesiones</h2>${S.length ? S.map(fila).join('') : '<p class="hand w">Esta unidad aún no tiene Exit tickets.</p>'}
          <h3 class="w">✏️ Crear o editar el Exit ticket</h3><p class="w">${MD.sesionesDe(u).map(({ s, n }) => `<button class="bt${MD.preguntas(s).length ? ' gr' : ''}" data-a="tedit" data-n="${n}" title="${esc(temaDe(s, n))}">S${n}${MD.preguntas(s).length ? ' ✓' : ' ➕'}</button>`).join(' ') || '<span class="hand">Primero crea tus sesiones en el cuaderno de sesiones.</span>'}</p>` }];
      S.forEach(({ s, n }) => {
        const qs = MD.preguntas(s), R = D.est.map(e => [e, (D.byS[e.key] || {})[n]]), hechos = R.filter(x => x[1]).map(x => x[1]);
        const dist = { AD: 0, A: 0, B: 0, C: 0 }; hechos.forEach(t => dist[MD.nivel(t).k]++);
        const ok = qs.map((q, k) => { const c = hechos.filter(t => (t.answers || []).length > k); return c.length ? pct(c.filter(t => t.answers[k] === true).length, c.length) : null; });
        const peor = ok.reduce((m, v, k) => v != null && (m < 0 || v < ok[m]) ? k : m, -1), pr = MD.promedio(hechos);
        const tot = hechos.length || 1;
        H.push({ l: `<div class="crumb w">Unidad ${esc(u.num)} · ${GN()} ${F.sec}</div><div class="big w">Sesión ${n}</div>${secBar(F)}
            <p class="hand w">Respondieron <b>${hechos.length} de ${D.est.length}</b>${pr ? ' · promedio ' + nivelChip(pr) + ' ' + pr.score + '%' : ''}</p>
            <div class="dist w">${['AD', 'A', 'B', 'C'].map(k => dist[k] ? `<i class="d${k}" style="flex:${dist[k]}">${k} ${dist[k]}</i>` : '').join('') || '<i class="d0" style="flex:1">Nadie aún</i>'}</div>
            <h3 class="w">❓ Preguntas <button class="mini" data-a="tedit" data-n="${n}">✏️ Editar</button></h3>` + qs.map((q, k) => `<div class="qst w${ok[k] != null && ok[k] < 60 ? ' mal' : ''}${k === peor && hechos.length ? ' peor' : ''}"><b>P${k + 1}</b><span class="qt">${esc(q.q)}</span><span class="qb"><i style="width:${ok[k] || 0}%"></i></span><b>${ok[k] == null ? '—' : ok[k] + '%'}</b>${ok[k] != null && ok[k] < 60 ? '<small>⚠️ Reforzar</small>' : ''}${k === peor && hechos.length ? '<small>🔥 La más difícil</small>' : ''}</div>`).join(''),
          r: `<h2 class="w">👥 Estudiantes</h2>` + R.sort((a, b) => (a[1] ? a[1].score / a[1].total : 2) - (b[1] ? b[1].score / b[1].total : 2)).map(([e, t]) => t
            ? `<div class="rg w"><span class="rg-n">${esc(nomCorto(e.name))}</span>${nivelChip(t)}<small>${t.score}/${t.total}</small><span class="dots">${(t.answers || []).map((b, k) => `<i class="${b ? 'si' : 'no'}" title="P${k + 1}"></i>`).join('')}</span></div>`
            : `<div class="rg off w"><span class="rg-n">${esc(nomCorto(e.name))}</span><small>⏳ Pendiente</small></div>`).join('') + `<p class="hand w"><small>🟢 correcta · 🔴 incorrecta (P1, P2, …)</small></p>` });
      });
      return H;
    };
    // ---- ✏️ el Exit ticket de una sesión: 5 preguntas con 4 opciones (Molí puede proponerlas) ----
    const qVacia = () => ({ q: '', options: ['', '', '', ''], answer: 0, why: '' });
    const tc = (path, val, ph) => `<input data-te="${path}" value="${esc(val || '')}" placeholder="${ph}">`;
    function paginasTicket() {
      const e = F.ted;
      if (e.estado === 'cargando') return [{ l: cargando('Abriendo el Exit ticket…'), r: '' }];
      if (e.estado === 'listo') return [{ l: `<img class="moli w" src="${IMG('estrellas')}" alt=""><h1 class="w">✅ ¡Publicado!</h1><p class="hand w">Tus estudiantes ya pueden responder el Exit ticket de la Sesión ${e.n} en su portafolio. 🎟️</p><p class="center"><button class="bt gr" data-a="tcerrar">‹ Volver</button></p>`, r: '' }];
      const ocupado = e.estado === 'pensando' || e.estado === 'guardando';
      const P = [`<div class="crumb">✏️ Exit ticket · Unidad ${esc(F.u.num)}</div>`, `<div class="big">Sesión ${e.n}</div>`, `<p class="hand">${esc(temaDe(e.s, e.n))}</p>`,
        `<p class="center"><button class="bt or" data-a="tmoli"${ocupado ? ' disabled' : ''}>${e.estado === 'pensando' ? '🤖 Molí está pensando…' : '✨ Molí, propón las 5 preguntas'}</button></p>`];
      e.qs.forEach((q, k) => P.push(`<div class="fld q-ed"><label>Pregunta ${k + 1} <button class="mini" data-a="tqrm" data-k="${k}">🗑️</button></label>${tc(`${k}.q`, q.q, 'Pregunta')}
        ${[0, 1, 2, 3].map(i => `<div class="opt-ed"><input type="radio" name="tans${k}" data-te="${k}.answer" value="${i}"${+q.answer === i ? ' checked' : ''}>${tc(`${k}.options.${i}`, (q.options || [])[i], 'Opción ' + 'ABCD'[i])}</div>`).join('')}
        ${tc(`${k}.why`, q.why, '💡 Por qué (se muestra al responder)')}</div>`));
      P.push(`<p class="center"><button class="bt" data-a="tqadd">➕ Agregar pregunta</button></p>`,
        `<div class="fld guardar"><p class="hand">${e.err ? '⚠️ ' + esc(e.err) : 'Marca con ⚪ la respuesta correcta de cada pregunta.'}</p><p class="center"><button class="bt gr" data-a="tguardar"${ocupado ? ' disabled' : ''}>${e.estado === 'guardando' ? 'Publicando…' : '💾 Guardar y publicar'}</button> <button class="bt" data-a="tcerrar">Cancelar</button></p></div>`);
      return [{ l: P.join(''), r: null }];
    }
    const ESQ_TK = { type: 'OBJECT', required: ['qs'], properties: { qs: { type: 'ARRAY', items: { type: 'OBJECT', required: ['q', 'options', 'answer'], properties: { q: { type: 'STRING' }, options: { type: 'ARRAY', items: { type: 'STRING' } }, answer: { type: 'INTEGER' }, why: { type: 'STRING' } } } } } };
    async function moliTicket(u, s, n) {
      const I = MD.espInfo();
      const R = await MD.pensar(`Eres una docente experta de ${I.area} de ${I.txt} en Perú. Escribe el EXIT TICKET de esta sesión: 5 preguntas de opción múltiple con 4 opciones cada una, de la más fácil a la más difícil, que evalúen la meta y lo que se hizo en las actividades. Preguntas de máximo 14 palabras; opciones cortas (máximo 6 palabras) y de largo parecido; las incorrectas son errores típicos de estudiantes de ${I.edad}. «answer» es el número (0 a 3) de la opción correcta y «why» explica en una frase corta por qué es la correcta. Todo en español sencillo.\n\n${resumenSes(u, s, n)}`, ESQ_TK);
      const qs = ((R && R.qs) || []).filter(q => L(q.q) && Array.isArray(q.options) && q.options.length === 4 && q.options.every(L) && q.answer >= 0 && q.answer < 4).slice(0, 5)
        .map(q => { const o = mezclar(q.options.map((t, i) => ({ t: String(t).trim(), ok: i === q.answer }))); return { q: String(q.q).trim(), options: o.map(x => x.t), answer: o.findIndex(x => x.ok), why: String(q.why || '').trim() }; });
      if (!qs.length) throw new Error('IA'); return qs;
    }
    F.alPintar = el => { if (el._te) return; el._te = 1;
      const fija = ev => { const t = ev.target, p = t.dataset && t.dataset.te; if (!p || !F.ted) return; setP(F.ted.qs, p, t.type === 'radio' ? +t.value : t.value); };
      el.addEventListener('input', fija); el.addEventListener('change', fija); };
    F.act2 = async (a, ds) => {
      const e = F.ted;
      if (a === 'tedit') { const n = +ds.n; F.ted = { n, s: {}, qs: [], estado: 'cargando' }; F.ed0 = paginasTicket; F.libro.pasar(1, () => { F.i = 0; });
        try { const s = await MD.sesionCruda(F.u.key, n) || {}, Q = (s.ticket && s.ticket.questions) || [];
          F.ted = { n, s, qs: Q.length ? Q.map(q => ({ q: q.q || '', options: [0, 1, 2, 3].map(i => (q.options || [])[i] || ''), answer: +q.answer || 0, why: q.why || '' })) : [0, 1, 2, 3, 4].map(qVacia), estado: '' }; }
        catch (x) { F.ted = null; F.ed0 = null; alert(errTxt(x)); }
        return F.libro.pinta(true); }
      if (!e) return;
      if (a === 'tqadd') { e.qs.push(qVacia()); return F.libro.pinta(false); }
      if (a === 'tqrm') { e.qs.splice(+ds.k, 1); return F.libro.pinta(false); }
      if (a === 'tmoli') { e.estado = 'pensando'; e.err = ''; F.libro.pinta(false);
        try { e.qs = await moliTicket(F.u, e.s, e.n); e.estado = ''; } catch (x) { e.estado = ''; e.err = iaTxt(x); }
        return F.libro.pinta(false); }
      if (a === 'tguardar') {
        const qs = e.qs.filter(q => L(q.q)).map(q => ({ q: q.q.trim(), options: q.options.map(o => o || ''), answer: +q.answer || 0, why: q.why || '' }));
        if (qs.some(q => q.options.filter(L).length < 2 || !L(q.options[q.answer]))) { e.err = 'Cada pregunta necesita sus opciones y la respuesta correcta marcada.'; return F.libro.pinta(false); }
        e.estado = 'guardando'; e.err = ''; F.libro.pinta(false);
        try { await MD.publicar(units => { const u = units.find(x => x.key === F.u.key), s = u && u.sessions[e.n - 1]; if (!s) throw new Error('NOSES'); s.ticket = { ...(s.ticket || {}), questions: qs }; });
          F.u = MD.unidades().find(x => x.key === F.u.key) || F.u; e.estado = 'listo'; }
        catch (x) { e.estado = ''; e.err = pubTxt(x); }
        return F.libro.pinta(false); }
      if (a === 'tcerrar') return F.libro.pasar(-1, () => { F.ted = null; F.ed0 = null; F.i = 0; F.recargar(); });
    };
    return F;
  }

  // =================================================================
  //  CUADERNO VERDE · MISIONES (quiénes ya cumplieron)
  // =================================================================
  function misionesDoc() {
    const F = base('Refuerzos', '💪', 'Elige la unidad: verás quiénes ya cumplieron sus misiones de refuerzo y quiénes todavía no. ✅⏳');
    F.datos = async (u, sec) => { const [est, M] = await Promise.all([estDe(sec), Docente.misionesTodos()]); const mp = {}; M.forEach(m => { mp[m.key] = m.p; }); return { est, mp, mis: MD.misionesDe(u.key) }; };
    const hechas = (m, p) => m.acts.filter(a => pBool((p || {})[a.id])).length;
    F.paginas = (cab) => {
      const D = F.D, ms = D.mis;
      if (!ms.length) return [{ l: cab + '<p class="hand w">Esta unidad aún no tiene misiones de refuerzo.</p>', r: crearBox() }];
      const H = [{ l: cab + `<p class="hand w">${ms.length} misiones · ${D.est.length} estudiantes.</p><p class="hand w">${D.est.filter(e => ms.every(m => hechas(m, D.mp[e.key]) === m.acts.length)).length} completaron todas. 🏆</p>` + crearBox(),
        r: `<h2 class="w">👥 Avance</h2>` + D.est.map(e => { const c = ms.filter(m => hechas(m, D.mp[e.key]) === m.acts.length).length;
          return `<div class="rg w"><span class="rg-n">${esc(nomCorto(e.name))}</span><span class="qb"><i style="width:${pct(c, ms.length)}%"></i></span><b>${c}/${ms.length}</b><span>${c === ms.length ? '✅' : '⏳'}</span></div>`; }).join('') }];
      ms.forEach((m, j) => {
        const errs = m.acts.map(a => D.est.reduce((s, e) => { const v = (D.mp[e.key] || {})[a.id]; return s + (Array.isArray(v) ? +v[0] || 0 : 0); }, 0));
        const kp = errs.reduce((b, v, k) => v > (errs[b] || 0) ? k : b, 0), comp = D.est.filter(e => hechas(m, D.mp[e.key]) === m.acts.length).length;
        H.push({ l: `<div class="crumb w">Misión ${j + 1} · Sesión ${m.ses.n} · ${GN()} ${F.sec}</div><h1 class="w">💪 ${esc(m.t || 'Misión ' + (j + 1))}</h1>${secBar(F)}
            <p class="hand w"><b>${comp} de ${D.est.length}</b> la completaron · ${m.acts.length} actividades.</p>
            ${errs[kp] ? `<div class="box w">🔥 <b>Lo que más costó:</b><br><span class="hand">${esc(m.acts[kp].t || 'Actividad ' + (kp + 1))}</span> <small>(${errs[kp]} errores)</small></div>` : ''}
            <p class="w"><button class="mini" data-a="mver" data-k="${j}">👀 Ver actividades</button> <button class="mini" data-a="mborrar" data-k="${j}">🗑️ Borrar misión</button></p>`,
          r: `<h2 class="w">👥 Estudiantes</h2>` + D.est.map(e => { const h = hechas(m, D.mp[e.key]);
            return `<div class="rg w${h ? '' : ' off'}"><span class="rg-n">${esc(nomCorto(e.name))}</span><span class="qb"><i style="width:${pct(h, m.acts.length)}%"></i></span><small>${h}/${m.acts.length}</small><span>${h === m.acts.length ? '✅ Cumplió' : h ? '⏳ Le falta' : '⬜ No empezó'}</span></div>`; }).join('') });
      });
      return H;
    };
    // ---- ✨ crear una misión con Molí: eliges la sesión y los juegos, la revisas y la publicas ----
    const TIPOS = [['tf', '✅ Verdadero o falso'], ['mc', '🔤 Opción múltiple'], ['match', '🔗 Unir parejas'], ['fill', '✍️ Completar el texto'], ['order', '🔢 Ordenar pasos'], ['sort', '📦 Clasificar'], ['ws', '🔎 Sopa de letras']];
    const TIT = { tf: 'Verdadero o falso', mc: 'Elige la respuesta', match: 'Une las parejas', fill: 'Completa el texto', order: 'Ordena los pasos', sort: 'Clasifica', ws: 'Sopa de letras' };
    F.tipos = F.tipos || ['tf', 'mc', 'match', 'fill'];
    function crearBox() {
      const S = MD.sesionesDe(F.u);
      if (!S.length) return '<p class="hand w">Primero crea tus sesiones en el cuaderno de sesiones.</p>';
      return `<div class="box w"><b>✨ Crear misión con Molí</b><br><select class="mg-s">${S.map(({ s, n }) => `<option value="${n}">Sesión ${n} · ${esc(temaDe(s, n)).slice(0, 50)}</option>`).join('')}</select>
        <div class="mg-t">${TIPOS.map(([k, t]) => `<label><input type="checkbox" value="${k}"${F.tipos.includes(k) ? ' checked' : ''}> ${t}</label>`).join(' ')}</div>
        <button class="bt gr" data-a="mcrear">✨ ¡Molí, crea la misión!</button></div>`;
    }
    const resumenAct = x => x.ty === 'tf' ? x.qs.map(q => `${q[1] ? '✔️' : '❌'} ${q[0]}`) : x.ty === 'mc' ? x.qs.map(q => `${q.q} → ${q.o[q.a]}`) : x.ty === 'match' ? x.p.map(p => `${p[0]} ↔ ${p[1]}`)
      : x.ty === 'fill' ? [x.tx.map(t => /^\{\d+\}$/.test(t) ? `[${x.w[+t.slice(1, -1)]}]` : t).join('')] : x.ty === 'order' ? x.it.map((t, i) => `${i + 1}. ${t}`) : x.ty === 'sort' ? x.it.map(p => `${p[0]} → ${x.g[p[1]]}`) : x.ty === 'ws' ? [x.w.join(' · ')] : [];
    const verActs = m => m.acts.map(x => `<div class="fld"><label>${esc(TIPOS.find(t => t[0] === x.ty)[1])}</label>${resumenAct(x).map(t => `<p class="hand" style="margin:.15em 0">${esc(t)}</p>`).join('')}</div>`).join('');
    function paginasMision() {
      const g = F.mg;
      if (g.estado === 'pensando') return [{ l: `<img class="moli w" src="${IMG('pensativa')}" alt="">` + cargando('🤖 Molí está creando la misión de la Sesión ' + g.n + '…'), r: '' }];
      if (g.estado === 'listo') return [{ l: `<img class="moli w" src="${IMG('estrellas')}" alt=""><h1 class="w">✅ ¡Misión publicada!</h1><p class="hand w">Tus estudiantes ya la ven en su cuaderno de misiones. 💪</p><p class="center"><button class="bt gr" data-a="mcerrar">‹ Volver</button></p>`, r: '' }];
      if (g.estado === 'ver') return [{ l: `<div class="crumb">💪 Misión · Sesión ${g.m.ses.n}</div><h2>${esc(g.m.t)}</h2>${verActs(g.m)}<p class="center"><button class="bt" data-a="mcerrar">‹ Volver</button></p>`, r: null }];
      if (!g.m) return [{ l: `<h2 class="w">😕 ${esc(g.err || 'Molí no pudo crear la misión.')}</h2><p class="center"><button class="bt gr" data-a="motra">🔄 Intentar otra vez</button> <button class="bt" data-a="mcerrar">Cancelar</button></p>`, r: '' }];
      return [{ l: `<div class="crumb">✨ Misión nueva · Sesión ${g.n}</div><h2>💪 ${esc(g.m.t)}</h2><p class="hand">Revísala: así la jugarán tus estudiantes.</p>${verActs(g.m)}
        <div class="fld guardar"><p class="hand">${g.err ? '⚠️ ' + esc(g.err) : ''}</p><p class="center"><button class="bt gr" data-a="mpub"${g.estado === 'guardando' ? ' disabled' : ''}>${g.estado === 'guardando' ? 'Publicando…' : '💾 Publicar misión'}</button> <button class="bt or" data-a="motra">🔄 Otra</button> <button class="bt" data-a="mcerrar">Cancelar</button></p></div>`, r: null }];
    }
    const S_ = t => ({ type: t }), SA = { type: 'ARRAY', items: { type: 'STRING' } };
    const ESQ_MS = { type: 'OBJECT', required: ['t'], properties: { t: S_('STRING'),
      tf: { type: 'ARRAY', items: { type: 'OBJECT', required: ['s', 'v'], properties: { s: S_('STRING'), v: S_('BOOLEAN'), why: S_('STRING') } } },
      mc: { type: 'ARRAY', items: { type: 'OBJECT', required: ['q', 'o', 'a'], properties: { q: S_('STRING'), o: SA, a: S_('INTEGER'), why: S_('STRING') } } },
      match: { type: 'ARRAY', items: { type: 'OBJECT', required: ['a', 'b'], properties: { a: S_('STRING'), b: S_('STRING') } } },
      fill: { type: 'OBJECT', properties: { texto: S_('STRING'), extra: SA } }, order: SA,
      sort: { type: 'OBJECT', properties: { g: SA, it: { type: 'ARRAY', items: { type: 'OBJECT', required: ['t', 'g'], properties: { t: S_('STRING'), g: S_('INTEGER') } } } } }, ws: SA } };
    const PIDE = { tf: '«tf»: 4 afirmaciones cortas (la mitad verdaderas), con «why» que explica en una frase.', mc: '«mc»: 3 preguntas con 4 opciones cortas en «o»; «a» es el número (0 a 3) de la correcta.',
      match: '«match»: 5 parejas concepto (a) y su definición muy corta (b, máximo 6 palabras).', fill: '«fill»: un «texto» de 2 o 3 oraciones con 3 o 4 palabras clave entre corchetes [así], y 2 palabras de «extra» que confunden.',
      order: '«order»: 4 o 5 pasos de un proceso de la sesión, en el orden correcto.', sort: '«sort»: 2 grupos en «g» y 6 elementos en «it» (g es el número del grupo, 0 o 1).', ws: '«ws»: 6 palabras clave de una sola palabra, sin tildes, de máximo 10 letras.' };
    const cut = (t, n) => String(t == null ? '' : t).replace(/\s+/g, ' ').trim().slice(0, n);
    function armar(R, tipos, n) {
      const id = k => 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + k, A = [];
      tipos.forEach((ty, k) => { const b = { id: id(k), ty, t: TIT[ty] };
        if (ty === 'tf') { const qs = (R.tf || []).filter(x => L(x.s)).slice(0, 6).map(x => [cut(x.s, 160), !!x.v, cut(x.why, 160)]); if (qs.length >= 3) A.push({ ...b, qs }); }
        if (ty === 'mc') { const qs = (R.mc || []).filter(x => L(x.q) && Array.isArray(x.o) && x.o.length === 4 && x.o.every(L) && x.a >= 0 && x.a < 4).slice(0, 4)
          .map(x => { const o = mezclar(x.o.map((t, i) => ({ t: cut(t, 60), ok: i === x.a }))); return { q: cut(x.q, 160), o: o.map(z => z.t), a: o.findIndex(z => z.ok), why: cut(x.why, 160) }; }); if (qs.length >= 2) A.push({ ...b, qs }); }
        if (ty === 'match') { const p = (R.match || []).filter(x => L(x.a) && L(x.b)).slice(0, 6).map(x => [cut(x.a, 40), cut(x.b, 60)]); if (p.length >= 3) A.push({ ...b, p }); }
        if (ty === 'fill' && R.fill && L(R.fill.texto)) { const parts = String(R.fill.texto).split(/\[([^\]]+)\]/), tx = [], w = [];
          parts.forEach((t, i) => { if (i % 2) { tx.push('{' + w.length + '}'); w.push(cut(t, 30)); } else if (t) tx.push(t); });
          if (w.length >= 2) A.push({ ...b, tx, w, x: (R.fill.extra || []).filter(L).slice(0, 3).map(t => cut(t, 30)) }); }
        if (ty === 'order') { const it = (R.order || []).filter(L).slice(0, 6).map(t => cut(t, 90)); if (it.length >= 3) A.push({ ...b, it }); }
        if (ty === 'sort' && R.sort) { const g = (R.sort.g || []).filter(L).slice(0, 3).map(t => cut(t, 30)), it = (R.sort.it || []).filter(x => L(x.t) && x.g >= 0 && x.g < g.length).slice(0, 8).map(x => [cut(x.t, 40), x.g]);
          if (g.length >= 2 && it.length >= 4) A.push({ ...b, g, it }); }
        if (ty === 'ws') { const w = (R.ws || []).map(t => String(t).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-ZÑ]/g, '')).filter(t => t.length >= 3 && t.length <= 10).slice(0, 8); if (w.length >= 4) A.push({ ...b, w }); }
      });
      if (!A.length) throw new Error('IA');
      return { t: cut(R.t, 60) || 'Misión de la sesión ' + n, ses: { u: F.u.key, n }, acts: A };
    }
    async function generar() {
      const g = F.mg; g.estado = 'pensando'; g.m = null; g.err = ''; F.libro.pinta(false);
      try { const I = MD.espInfo(), s = await MD.sesionCruda(F.u.key, g.n) || {};
        const R = await MD.pensar(`Eres una docente experta de ${I.area} de ${I.txt} en Perú. Crea UNA misión de refuerzo (juegos cortos) para que estudiantes de ${I.edad} repasen esta sesión. «t» es un título corto y motivador (máximo 6 palabras). Llena SOLO estos juegos:\n${g.tipos.map(k => '- ' + PIDE[k]).join('\n')}\nTodo en español sencillo, correcto y sobre lo que se trabajó en la sesión.\n\n${resumenSes(F.u, s, g.n)}`, ESQ_MS);
        g.m = armar(R || {}, g.tipos, g.n); g.estado = ''; }
      catch (x) { g.estado = ''; g.m = null; g.err = iaTxt(x); }
      F.libro.pinta(false);
    }
    F.act2 = async (a, ds, el) => {
      if (a === 'mcrear') { const box = el.closest('.box'), n = +box.querySelector('.mg-s').value, tipos = [...box.querySelectorAll('.mg-t input:checked')].map(x => x.value);
        if (!tipos.length) return alert('Elige al menos un juego.');
        F.tipos = tipos; F.mg = { n, tipos }; F.ed0 = paginasMision; F.libro.pasar(1, () => { F.i = 0; }); return generar(); }
      if (a === 'mver') { F.mg = { estado: 'ver', m: F.D.mis[+ds.k] }; F.ed0 = paginasMision; return F.libro.pasar(1, () => { F.i = 0; }); }
      if (a === 'mborrar') { const m = F.D.mis[+ds.k]; if (!m || !confirm(`¿Borrar la misión «${m.t}»? Tus estudiantes ya no la verán.`)) return;
        try { await MD.publicarMisiones(ms => { const i = ms.findIndex(x => x.acts && m.acts && x.acts[0] && x.acts[0].id === m.acts[0].id && x.ses && x.ses.n === m.ses.n && x.ses.u === m.ses.u); if (i >= 0) ms.splice(i, 1); });
          F.i = 0; F.recargar(); } catch (x) { alert(pubTxt(x)); }
        return F.libro.pinta(true); }
      const g = F.mg; if (!g) return;
      if (a === 'motra') return generar();
      if (a === 'mpub') { g.estado = 'guardando'; g.err = ''; F.libro.pinta(false);
        try { await MD.publicarMisiones(ms => { ms.push(g.m); }); g.estado = 'listo'; } catch (x) { g.estado = ''; g.err = pubTxt(x); }
        return F.libro.pinta(false); }
      if (a === 'mcerrar') return F.libro.pasar(-1, () => { F.mg = null; F.ed0 = null; F.i = 0; F.recargar(); });
    };
    return F;
  }

  // =================================================================
  //  CUADERNO DE SESIONES · con «✏️ Editar sesión»
  // =================================================================
  const ytDe = url => { const m = String(url || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/) || String(url || '').match(/^([\w-]{11})$/); if (!m) return null;
    const t = String(url).match(/[?&](?:t|start)=(\d+)/); return { id: m[1], t: t ? +t[1] : 0 }; };
  const videoHtml = a => a && a.yt ? `<button class="vid w" data-a="video" data-y="${esc(a.yt)}" data-t="${+a.yts || 0}"><img src="https://i.ytimg.com/vi/${esc(a.yt)}/hqdefault.jpg" alt="" loading="lazy"><i>▶</i></button>`
    : a && a.ytq ? `<div class="vid vacio w">🎬 <small>Espacio para video: «${esc(a.ytq)}»</small></div>` : '';
  function sesionesDoc() {
    const F = base('Sesiones', '📗', 'Elige la unidad. En cada sesión tienes «✏️ Editar sesión»: lo que cambies lo ven tus estudiantes en su cuaderno.');
    F.datos = async () => ({});
    F.masUnidades = () => `<div class="box w"><b>➕ Nueva unidad</b><div class="hp-row"><input class="un-n" inputmode="numeric" maxlength="3" placeholder="N.°" style="width:4em"> <input class="un-t" maxlength="80" placeholder="Título de la unidad"></div>
      <button class="bt gr" data-a="unew">➕ Crear unidad</button>${F.uerr ? `<p class="hand">⚠️ ${esc(F.uerr)}</p>` : ''}</div>`;
    F.paginas = () => {
      const u = F.u;
      if (F.ed) return paginasEditar();
      const S = MD.sesionesDe(u);
      const H = [{ l: `<div class="crumb w">Ciencia y Tecnología · ${GN()}</div><div class="ico w">${esc(u.icon || '📘')}</div><div class="big w">Unidad ${esc(u.num)}</div><h1 class="w">${esc(u.title)}</h1><p class="hand w">📗 Cuaderno de sesiones · ${S.length} sesiones</p>${Hojas._.docsUnidad(u)}`,
        r: `<h2 class="w">📑 Índice</h2>${S.map(({ s, n }, k) => `<button class="row w" data-a="ir" data-i="${k + 1}"><b class="lv" style="background:#dbeafe;color:#1d4ed8">${n}</b><span class="rt"><b>Sesión ${n}</b><small>${esc(temaDe(s, n))}</small></span>${lk(u.key, n)}</button>`).join('')}
          <p class="center w"><button class="bt gr" data-a="snew"${F.creando ? ' disabled' : ''}>${F.creando ? 'Creando…' : '➕ Nueva sesión'}</button></p>` }];
      S.forEach(({ s, n }) => {
        const cr = (s.criteria || []).filter(L), acts = Hojas._.actsDe(u, s).slice(0, 3).filter(a => L(a.title) || L(a.desc)), q = MD.preguntas(s).length;
        H.push({ l: `<div class="crumb w">${esc(u.icon || '📘')} Unidad ${esc(u.num)}</div><div class="big w">Sesión ${n}</div>${L(s.title) ? `<h2 class="w">${esc(s.title)}</h2>` : ''}
            ${L(s.meta) ? `<h3 class="w">🎯 Meta</h3><p class="hand w">${esc(s.meta)}</p>` : ''}${cr.length ? `<h3 class="w">✅ Criterios</h3><ul class="cr hand">${cr.map(c => `<li class="w">${esc(c)}</li>`).join('')}</ul>` : ''}
            <p class="center w"><button class="bt or" data-a="editar" data-n="${n}">✏️ Editar sesión</button>${q ? ` <button class="bt" data-a="tarjetas" data-n="${n}">🖨️ Tarjetas</button>` : ''}</p>${Hojas._.esBebras(u, s) ? '' : Hojas._.pdfs(s, n)}`,
          r: `<h2 class="w">🧪 Actividades</h2>${acts.map((a, j) => `<div class="act w"><b class="n">${j + 1}</b>${MODOS[String(a.mode || '').toLowerCase()] ? `<span class="chip">${MODOS[String(a.mode || '').toLowerCase()]}</span>` : ''}<div><b>${esc(a.title || 'Actividad ' + (j + 1))}</b></div>${L(a.desc) ? `<p class="hand">${esc(a.desc)}</p>` : ''}${Hojas._.fotoHtml(a)}</div>${videoHtml(a)}`).join('') || '<p class="hand w">Sin actividades todavía.</p>'}
            ${q ? `<div class="box w">🎟️ <b>Exit ticket</b> · ${q} preguntas <small>(lo responden en el portafolio de Exit tickets)</small></div>` : ''}` });
      });
      return H;
    };
    // ---- editar: los campos viven en F.ed.s; al pasar la hoja no se pierde nada ----
    const campo = (path, val, ph, area) => area ? `<textarea data-ed="${path}" placeholder="${ph}" rows="3">${esc(val || '')}</textarea>` : `<input data-ed="${path}" value="${esc(val || '')}" placeholder="${ph}">`;
    function paginasEditar() {
      const e = F.ed, s = e.s, n = e.n;
      if (e.estado === 'cargando') return [{ l: cargando('Abriendo la sesión para editar…'), r: '' }];
      if (e.estado === 'listo') return [{ l: `<img class="moli w" src="${IMG('estrellas')}" alt=""><h1 class="w">✅ ¡Publicado!</h1><p class="hand w">Tus estudiantes ya ven la Sesión ${n} en su cuaderno.</p><p class="center"><button class="bt gr" data-a="volver">‹ Volver al cuaderno</button></p>`, r: '' }];
      const acts = s.activities || [], qs = (s.ticket && s.ticket.questions) || [];
      const P = [];
      P.push(`<div class="crumb">✏️ Editando · Unidad ${esc(F.u.num)}</div>`, `<div class="big">Sesión ${n}</div>`,
        `<div class="fld"><label>Título (opcional)</label>${campo('title', s.title, 'Título de la sesión')}</div>`,
        `<div class="fld"><label>🎯 Meta de la sesión</label>${campo('meta', s.meta, 'Lo que lograrán hoy', 1)}</div>`,
        `<div class="fld"><label>✅ Criterios de éxito</label>${[0, 1, 2].map(k => campo('criteria.' + k, (s.criteria || [])[k], 'Criterio ' + (k + 1))).join('')}</div>`,
        `<div class="fld"><label>📏 Lo que se evalúa</label>${campo('rubric', s.rubric, 'Rúbrica', 1)}</div>`);
      const up = e.up || {}, tiene = c => up[c] ? (up[c].id ? '✅ ' + esc(up[c].info.name) + ' (se publica al guardar)' : up[c].err ? '⚠️ ' + esc(up[c].err) : '⏳ Subiendo…') : (() => { const f = Hojas._.fichaDe ? Hojas._.fichaDe(s, c) : {}; return f.url || f.id ? '✅ Ya tiene' : 'Sin archivo'; })();
      P.push(`<div class="fld"><label>📄 Ficha de la sesión (PDF)</label><input type="file" accept="application/pdf,.pdf" data-up="ficha"><small>${tiene('ficha')}</small>
        <label>🏠 Tarea para la casa (PDF, opcional)</label><input type="file" accept="application/pdf,.pdf" data-up="tarea"><small>${tiene('tarea')}</small></div>`);
      [0, 1, 2].forEach(j => { const a = acts[j] || {};
        P.push(`<div class="fld act-ed"><label>🧪 Actividad ${j + 1} <select data-ed="activities.${j}.mode"><option value="individual"${a.mode !== 'group' ? ' selected' : ''}>👤 Individual</option><option value="group"${a.mode === 'group' ? ' selected' : ''}>👥 En equipo</option></select></label>
          ${campo(`activities.${j}.title`, a.title, 'Título de la actividad')}${campo(`activities.${j}.desc`, a.desc, 'Qué harán', 1)}
          <label>🎬 Video (enlace de YouTube)</label>${campo(`activities.${j}._url`, a._url != null ? a._url : a.yt ? 'https://youtu.be/' + a.yt + (a.yts ? '?t=' + a.yts : '') : '', a.ytq ? 'Busca: ' + a.ytq : 'https://youtu.be/…')}</div>`); });
      const f = s.flipped || {};
      P.push(`<div class="fld"><label>🏠 Para la siguiente clase (opcional)</label>${campo('flipped.title', f.title, 'Tarea')}${campo('flipped.desc', f.desc, 'Qué deben hacer', 1)}</div>`);
      P.push(`<h2>🎟️ Exit ticket</h2>`);
      qs.forEach((q, k) => P.push(`<div class="fld q-ed"><label>Pregunta ${k + 1} <button class="mini" data-a="qrm" data-k="${k}">🗑️</button></label>${campo(`ticket.questions.${k}.q`, q.q, 'Pregunta')}
        ${[0, 1, 2, 3].map(i => `<div class="opt-ed"><input type="radio" name="ans${k}" data-ed="ticket.questions.${k}.answer" value="${i}"${+q.answer === i ? ' checked' : ''}>${campo(`ticket.questions.${k}.options.${i}`, (q.options || [])[i], 'Opción ' + 'ABCD'[i])}</div>`).join('')}
        ${campo(`ticket.questions.${k}.why`, q.why, '💡 Por qué (se muestra al responder)')}</div>`));
      P.push(`<p class="center"><button class="bt" data-a="qadd">➕ Agregar pregunta</button></p>`);
      P.push(`<div class="fld guardar"><p class="hand">${e.err ? '⚠️ ' + esc(e.err) : 'Revisa y publica: tus estudiantes lo verán al toque.'}</p><p class="center"><button class="bt gr" data-a="guardar"${e.estado === 'guardando' ? ' disabled' : ''}>${e.estado === 'guardando' ? 'Publicando…' : '💾 Guardar y publicar'}</button> <button class="bt" data-a="cancelar">Cancelar</button></p></div>`);
      const html = P.join(''); return [{ l: html, r: null }];
    }
    const setPath = (o, path, v) => { const k = path.split('.'); let x = o; k.slice(0, -1).forEach((p, i) => { if (x[p] == null) x[p] = /^\d+$/.test(k[i + 1]) ? [] : {}; x = x[p]; }); x[k[k.length - 1]] = v; };
    F.alPintar = el => { if (el._ed) return; el._ed = 1;
      el.addEventListener('change', async ev => { const t = ev.target, c = t.dataset && t.dataset.up, f = t.files && t.files[0]; if (!c || !f || !F.ed) return;
        const e = F.ed; e.up = e.up || {}; e.up[c] = {}; F.libro.pinta(false);
        try { e.up[c] = await MD.subirArchivo(f); } catch (x) { e.up[c] = { err: x.message === 'GRANDE' ? 'El PDF pesa más de 12 MB.' : x.message === 'AUTH' ? 'Conecta tu cuenta de docente.' : 'No se pudo subir. Revisa tu internet.' }; }
        F.libro.pinta(false); });
      el.addEventListener('input', ev => { const t = ev.target, p = t.dataset && t.dataset.ed; if (!p || !F.ed) return; setPath(F.ed.s, p, t.type === 'radio' ? +t.value : t.value); });
      el.addEventListener('change', ev => { const t = ev.target, p = t.dataset && t.dataset.ed; if (!p || !F.ed) return; setPath(F.ed.s, p, t.type === 'radio' ? +t.value : t.value); }); };
    F.act2 = async (a, ds, el) => {
      if (a === 'video') { el.outerHTML = `<div class="vid on"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(ds.y)}?autoplay=1&enablejsapi=1&rel=0&start=${+ds.t || 0}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div>`; return; }
      if (a === 'tarjetas') return Tarjetas.imprimir(F.u, +ds.n);
      if (a === 'pdf') return Hojas._.abrirFicha(F.u, +ds.n, ds.c, el);
      if (a === 'udoc') return Hojas._.abrirDocU(F.u, ds.k, el);
      if (a === 'impficha') return Tarjetas.imprimirFicha(F.u, +ds.n);   // la ficha con su cierre y la tarjeta del Exit ticket   // tarjetas del Exit ticket para escanear
      if (a === 'unew') { const box = el.closest('.box'), num = box.querySelector('.un-n').value, tit = box.querySelector('.un-t').value; F.uerr = '';
        if (!String(num).trim()) { F.uerr = 'Escribe el número de la unidad.'; return F.libro.pinta(false); }
        el.disabled = true; el.textContent = 'Creando…';
        try { await MD.nuevaUnidad(num, tit); const u = MD.unidades().find(x => x.key === MD.esp() + 'unit' + String(num).replace(/[^0-9a-z]/gi, '').toLowerCase());
          if (u) return F.libro.pasar(1, () => { F.u = u; F.i = 0; F.pestana = '📚 Unidades'; F.recargar(); }); }
        catch (x) { F.uerr = x.message === 'YA' ? 'Ya existe una unidad con ese número.' : pubTxt(x); }
        return F.libro.pinta(false); }
      if (a === 'snew') { F.creando = true; F.libro.pinta(false);
        try { await MD.nuevaSesion(F.u.key); F.u = MD.unidades().find(x => x.key === F.u.key) || F.u; const S = MD.sesionesDe(F.u); F.creando = false;
          return F.act2('editar', { n: S[S.length - 1].n }); }
        catch (x) { F.creando = false; alert(x.message === 'MUCHAS' ? 'La unidad ya tiene 30 sesiones.' : pubTxt(x)); return F.libro.pinta(false); } }
      if (a === 'editar') { const n = +ds.n; F.ed = { n, s: {}, estado: 'cargando' }; F.libro.pasar(1, () => { F.i = 0; });
        try { const s = await MD.sesionCruda(F.u.key, n); F.ed = { n, s: s || {}, estado: '' }; } catch (x) { F.ed = null; alert(errTxt(x)); }
        return F.libro.pinta(true); }
      if (a === 'qadd') { const t = F.ed.s.ticket = F.ed.s.ticket || { questions: [] }; t.questions = t.questions || []; t.questions.push({ q: '', options: ['', '', '', ''], answer: 0, why: '' }); return F.libro.pinta(false); }
      if (a === 'qrm') { F.ed.s.ticket.questions.splice(+ds.k, 1); return F.libro.pinta(false); }
      if (a === 'cancelar' || a === 'volver') return F.libro.pasar(-1, () => { const n = F.ed.n; F.ed = null; F.u = MD.unidades().find(u => u.key === F.u.key) || F.u; const k = MD.sesionesDe(F.u).findIndex(x => x.n === n); F.i = k + 1; });
      if (a === 'guardar') {
        const e = F.ed, s = JSON.parse(JSON.stringify(e.s));
        (s.activities || []).forEach(x => { if (!x) return; if (x._url != null) { const v = ytDe(x._url); if (v) { x.yt = v.id; if (v.t) x.yts = v.t; else delete x.yts; delete x.ytq; } else if (!String(x._url).trim()) { delete x.yt; delete x.yts; } } delete x._url;
          x.mode = x.mode || 'individual'; x.title = x.title || ''; x.desc = x.desc || ''; });
        s.criteria = (s.criteria || []).map(c => c || ''); if (s.flipped) s.flipped.enabled = L(s.flipped.title) || L(s.flipped.desc);
        if (s.ticket && s.ticket.questions) s.ticket.questions = s.ticket.questions.filter(q => L(q.q)).map(q => ({ ...q, options: (q.options || []).map(o => o || ''), answer: +q.answer || 0 }));
        const up = e.up || {}, arch = {};
        if (up.ficha && up.ficha.id) { s.activities = s.activities || []; s.activities.forEach(x => { if (x) delete x.file; }); s.activities[0] = s.activities[0] || { title: '', desc: '', mode: 'individual' };
          s.activities[0].file = up.ficha.id; delete s.pdf; arch[up.ficha.id] = up.ficha.info; }
        if (up.tarea && up.tarea.id) { s.flipped = { ...(s.flipped || {}), file: up.tarea.id, enabled: true }; if (!L(s.flipped.title)) s.flipped.title = 'Tarea para la casa'; delete s.tareaPdf; arch[up.tarea.id] = up.tarea.info; }
        if (Object.values(up).some(x => x && !x.id && !x.err)) { e.err = 'Espera a que termine de subir el PDF.'; return F.libro.pinta(false); }
        e.estado = 'guardando'; e.err = ''; F.libro.pinta(false);
        try { await MD.guardarSesion(F.u.key, e.n, s, Object.keys(arch).length ? arch : null); e.estado = 'listo'; F.libro.pasar(1, () => { F.i = 0; }); }
        catch (x) { e.estado = ''; e.err = x.message === 'AUTH' ? 'Conecta tu cuenta de docente (fotocheck → Conectar mi cuenta).' : x.message === 'GRANDE' ? 'El contenido es muy grande.' : 'No se pudo publicar. Revisa tu internet.'; F.libro.pinta(false); }
      }
    };
    return F;
  }

  // =================================================================
  //  LAPTOP · avance del Laboratorio de Molí
  // =================================================================
  const JUEGOS = { circ: '⚡ Circuitos', plac: '🌋 Placas', ener: '🔋 Energías', evo: '🦒 Evolución', enf: '🦠 Enfermedades', maq: '⚙️ Máquinas', sol: '🪐 Sistema solar', luna: '🌙 Tierra y Luna',
    cad: '🦊 Cadenas', eco2: '🌳 Ecosistemas', tens: '💧 Tensión', orig: '🧬 Orígenes', lama: '🦒 Lamarck', vuln: '🎭 Vulnerabilidad', cin: '🎢 Cinética', grav: '🍎 Gravedad' };
  function labDocente(host, abrirLab) {
    let sec = LSd.get('moli2:dsec', 'A'), D = null, err = '';
    const pinta = () => {
      const tot = Object.values(MD.LAB).reduce((a, b) => a + b, 0);
      host.innerHTML = `<div class="labd"><div class="labd-h"><img src="img/moli/feliz.webp" alt=""><div><b>🧪 Laboratorio de Molí</b><span>Avance de tus estudiantes</span></div>
        <button class="bt gr" data-l="jugar">▶ Abrir el laboratorio</button></div>
        <div class="secs">${SECS.map(x => `<button class="sec${sec === x ? ' on' : ''}" data-l="sec" data-k="${x}">${GN()} ${x}</button>`).join('')}</div>
        <div class="labd-t">${err ? `<p>${err}</p>` : !D ? '<p>Trayendo el avance…</p>' : !D.length ? '<p>No hay estudiantes en esta sección.</p>' : D.map(e => { const p = e.lab || {}, h = Object.keys(MD.LAB).reduce((a, k) => a + Math.min(MD.LAB[k], +p[k] || 0), 0);
          return `<div class="labd-r"><span class="rg-n">${esc(nomCorto(e.name))}</span><span class="qb"><i style="width:${pct(h, tot)}%"></i></span><b>${pct(h, tot)}%</b><span class="labd-j">${Object.keys(MD.LAB).map(k => `<i class="${(+p[k] || 0) >= MD.LAB[k] ? 'ok' : p[k] ? 'mid' : ''}" title="${JUEGOS[k]}: ${+p[k] || 0}/${MD.LAB[k]}">${JUEGOS[k].split(' ')[0]}</i>`).join('')}</span></div>`; }).join('')}</div>
        <p class="labd-p">⭐ Completo · ◐ empezado · los íconos son los 16 juegos del laboratorio.</p></div>`;
    };
    const carga = async () => { D = null; err = ''; pinta();
      try { const [E, M] = await Promise.all([Docente.estudiantes(), Docente.misionesTodos()]); const mp = {}; M.forEach(m => { mp[m.key] = m.p; });
        D = E.filter(e => e.section === sec).map(e => ({ ...e, lab: (mp[e.key] || {})._lab || {} })); } catch (x) { err = errTxt(x); }
      pinta(); };
    host.addEventListener('click', ev => { const b = ev.target.closest('[data-l]'); if (!b) return; ev.stopPropagation();
      if (b.dataset.l === 'sec') { sec = b.dataset.k; LSd.set('moli2:dsec', sec); carga(); }
      if (b.dataset.l === 'jugar') abrirLab && abrirLab(); });
    carga();
  }

  Hojas.docente = { docente: registro, folder: exitDoc, mision: misionesDoc, cuaderno: sesionesDoc };
  Hojas.labDocente = labDocente;
  Hojas.videoHtml = videoHtml;
})();
