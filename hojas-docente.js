// ===================================================================
//  MOLÍ 2 · HOJAS DE LA DOCENTE: los mismos cuadernos del aula, pero con lo de todos sus estudiantes (6° A, B, C y D).
//   · Folder azul (Mis notas)  → Registro: Exit ticket, participación, conducta y refuerzo de cada estudiante (se puede poner la nota)
//   · Portafolio (Exit tickets) → cuántos respondieron, qué preguntas fallaron más y cómo le fue a cada uno
//   · Cuaderno verde (misiones) → quiénes ya cumplieron su refuerzo y quiénes no
//   · Cuaderno de sesiones      → igual que el del estudiante, con «✏️ Editar sesión»
//   · Laptop                    → avance de cada estudiante en el Laboratorio de Molí
// ===================================================================
(function () {
  const { Libro, esc, L, IMG, cargando, nivelChip, temaDe, MODOS, hojaUnidades, fichaHtml } = Hojas._;
  const SECS = ['A', 'B', 'C', 'D'];
  const LSd = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const PAV = ['', '1', '2', '3', '+4'], CONDK = ['', 'C', 'B', 'A', 'AD'];
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const errTxt = e => e && e.message === 'AUTH' ? '🔐 Conecta tu cuenta de docente: toca tu fotocheck → «Conectar mi cuenta».' : '📶 No pude traer los datos. Revisa tu internet.';
  const secBar = F => `<div class="secs w">${SECS.map(x => `<button class="sec${F.sec === x ? ' on' : ''}" data-a="sec" data-k="${x}">6° ${x}</button>`).join('')}</div>`;
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
      if (!F.u) return [hojaUnidades(titulo, icono, frase, F.me)];
      const cab = `<div class="crumb w">${esc(F.u.icon || '📘')} Unidad ${esc(F.u.num)} · ${esc(F.u.title)}</div><h1 class="w">${icono} ${esc(titulo)}</h1>${secBar(F)}`;
      if (F.err) return [{ l: cab + `<p class="hand w">${F.err}</p><p class="center"><button class="bt" data-a="reint">Intentar otra vez</button></p>`, r: '' }];
      if (!F.D) return [{ l: cab + cargando('Trayendo lo de 6° ' + F.sec + '…'), r: '' }];
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
  async function estDe(sec) { return (await Docente.estudiantes()).filter(s => s.section === sec); }
  const porEst = T => { const o = {}; T.forEach(t => { (o[t.student] = o[t.student] || {})[t.session] = t; }); return o; };

  // =================================================================
  //  FOLDER AZUL · REGISTRO
  // =================================================================
  function registro() {
    const F = base('Registro', '📂', 'Elige la unidad: verás el registro de 6° A, B, C y D. Se llena solo con los Exit tickets; tú pones participación y conducta. ✏️');
    F.datos = async (u, sec) => {
      const [est, T, M] = await Promise.all([estDe(sec), Docente.ticketsUnidad(u.key, sec), Docente.misionesTodos().catch(() => [])]);
      const mp = {}; M.forEach(m => { mp[m.key] = m.p; });
      return { est, byS: porEst(T), mp, mis: MD.misionesDe(u.key) };
    };
    const refDe = (D, s, n) => { const ms = D.mis.filter(m => m.ses && m.ses.n === n); if (!ms.length) return null; const p = D.mp[s.key] || {}; return ms.every(m => m.acts.every(a => pBool(p[a.id]))); };
    const celda = (F, s, n, t) => {
      const D = F.D, r = (D.byS[s.key] || {})[t === 'p' ? 30 + n : 60 + n], k = `${t}|${n}|${s.key}`;
      if (F.guarda === k) return '<span class="rg-b">…</span>';
      const v = r ? (t === 'p' ? PAV[MD.partic(r)] : MD.nivel(r).k) : '·';
      return `<button class="rg-b${r ? ' on' : ''}${t === 'c' && r ? ' c' + MD.nivel(r).k : ''}" data-a="nota" data-t="${t}" data-n="${n}" data-s="${s.key}">${v}</button>`;
    };
    F.paginas = (cab) => {
      const u = F.u, D = F.D, S = MD.sesionesDe(u);
      if (!D.est.length) return [{ l: cab + '<p class="hand w">No hay estudiantes en esta sección todavía. Créalos con «Crear cuenta con Molí» (tu fotocheck).</p>', r: '' }];
      const res = D.est.map(s => { const R = D.byS[s.key] || {}, ex = S.map(x => R[x.n]).filter(Boolean), pr = MD.promedio(ex), pa = S.map(x => R[30 + x.n]).filter(Boolean);
        const refs = S.map(x => refDe(D, s, x.n)).filter(v => v !== null);
        return `<div class="rg w"><span class="rg-n">${esc(nomCorto(s.name))}</span><span>${pr ? nivelChip(pr) : '<small>—</small>'}</span><small>${ex.length}/${S.length}</small><small>🙋${pa.reduce((a, r) => a + MD.partic(r), 0)}</small><small>${refs.length ? '💪' + refs.filter(Boolean).length + '/' + refs.length : ''}</small></div>`; }).join('');
      const H = [{ l: cab + `<p class="hand w">${D.est.length} estudiantes · ${S.length} sesiones.</p><p class="hand w">Pasa la hoja: en cada sesión tocas 🙋 o 🤝 para poner la nota. Se guarda al toque. ✅</p>
          <div class="box w"><b>Leyenda</b><br><small>🎟️ Exit ticket · 🙋 Participación (1 a +4) · 🤝 Conducta (AD/A/B/C) · 💪 Refuerzo</small></div>`,
        r: `<h2 class="w">🏁 Resumen de la unidad</h2><div class="rg rg-h w"><span class="rg-n">Estudiante</span><span>🎟️</span><small>hechos</small><small>🙋</small><small>💪</small></div>${res}` }];
      S.forEach(({ s, n }) => {
        const resp = D.est.filter(e => (D.byS[e.key] || {})[n]), pr = MD.promedio(resp.map(e => D.byS[e.key][n]));
        H.push({ l: `<div class="crumb w">${esc(u.icon || '📘')} Unidad ${esc(u.num)} · 6° ${F.sec}</div><div class="big w">Sesión ${n}</div><h2 class="w">${esc(temaDe(s, n))}</h2>${secBar(F)}
            <p class="hand w">🎟️ Exit ticket: <b>${resp.length} de ${D.est.length}</b> respondieron${pr ? ' · promedio ' + nivelChip(pr) : ''}.</p><p class="hand w">Toca 🙋 o 🤝 en cada estudiante para poner su nota.</p>`,
          r: `<div class="rg rg-h w"><span class="rg-n">Sesión ${n}</span><span>🎟️</span><span>🙋</span><span>🤝</span><span>💪</span></div>` + D.est.map(e => {
            const R = D.byS[e.key] || {}, x = R[n], rf = refDe(D, e, n);
            if (F.pick && F.pick.n === n && F.pick.s === e.key) { const t = F.pick.t, ops = t === 'p' ? [[1, '1'], [2, '2'], [3, '3'], [4, '+4']] : [[4, 'AD'], [3, 'A'], [2, 'B'], [1, 'C']];
              return `<div class="rg pick w"><span class="rg-n">${t === 'p' ? '🙋' : '🤝'} ${esc(nomCorto(e.name))}</span>${ops.map(([v, tx]) => `<button class="rg-b" data-a="pon" data-v="${v}">${tx}</button>`).join('')}<button class="rg-b x" data-a="pon" data-v="0">✕</button></div>`; }
            return `<div class="rg w"><span class="rg-n">${esc(nomCorto(e.name))}</span><span>${x ? nivelChip(x) : '<small>—</small>'}</span>${celda(F, e, n, 'p')}${celda(F, e, n, 'c')}<span>${rf === null ? '' : rf ? '✅' : '⏳'}</span></div>`; }).join('') });
      });
      return H;
    };
    F.act2 = async (a, ds) => {
      if (a === 'nota') { F.pick = { t: ds.t, n: +ds.n, s: ds.s }; return F.libro.pinta(false); }
      if (a === 'pon') {
        const { t, n, s } = F.pick; F.pick = null; const v = +ds.v, code = t === 'p' ? 30 + n : 60 + n, e = F.D.est.find(x => x.key === s);
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
        return `<button class="row w" data-a="ir" data-i="${k + 1}"><b class="lv" style="background:#dcfce7;color:#166534">${n}</b><span class="rt"><b>Sesión ${n} · ${R.length}/${D.est.length}</b><small>${esc(temaDe(s, n))}</small></span>${pr ? nivelChip(pr) : ''}</button>`; };
      const H = [{ l: cab + `<p class="hand w">${D.est.length} estudiantes en 6° ${F.sec}.</p><p class="hand w">Toca una sesión para ver sus preguntas: las que están en rojo hay que <b>reforzarlas</b>. ⚠️</p>`,
        r: `<h2 class="w">📋 Sesiones</h2>${S.length ? S.map(fila).join('') : '<p class="hand w">Esta unidad aún no tiene Exit tickets.</p>'}` }];
      S.forEach(({ s, n }) => {
        const qs = MD.preguntas(s), R = D.est.map(e => [e, (D.byS[e.key] || {})[n]]), hechos = R.filter(x => x[1]).map(x => x[1]);
        const dist = { AD: 0, A: 0, B: 0, C: 0 }; hechos.forEach(t => dist[MD.nivel(t).k]++);
        const ok = qs.map((q, k) => { const c = hechos.filter(t => (t.answers || []).length > k); return c.length ? pct(c.filter(t => t.answers[k] === true).length, c.length) : null; });
        const peor = ok.reduce((m, v, k) => v != null && (m < 0 || v < ok[m]) ? k : m, -1), pr = MD.promedio(hechos);
        const tot = hechos.length || 1;
        H.push({ l: `<div class="crumb w">Unidad ${esc(u.num)} · 6° ${F.sec}</div><div class="big w">Sesión ${n}</div>${secBar(F)}
            <p class="hand w">Respondieron <b>${hechos.length} de ${D.est.length}</b>${pr ? ' · promedio ' + nivelChip(pr) + ' ' + pr.score + '%' : ''}</p>
            <div class="dist w">${['AD', 'A', 'B', 'C'].map(k => dist[k] ? `<i class="d${k}" style="flex:${dist[k]}">${k} ${dist[k]}</i>` : '').join('') || '<i class="d0" style="flex:1">Nadie aún</i>'}</div>
            <h3 class="w">❓ Preguntas</h3>` + qs.map((q, k) => `<div class="qst w${ok[k] != null && ok[k] < 60 ? ' mal' : ''}${k === peor && hechos.length ? ' peor' : ''}"><b>P${k + 1}</b><span class="qt">${esc(q.q)}</span><span class="qb"><i style="width:${ok[k] || 0}%"></i></span><b>${ok[k] == null ? '—' : ok[k] + '%'}</b>${ok[k] != null && ok[k] < 60 ? '<small>⚠️ Reforzar</small>' : ''}${k === peor && hechos.length ? '<small>🔥 La más difícil</small>' : ''}</div>`).join(''),
          r: `<h2 class="w">👥 Estudiantes</h2>` + R.sort((a, b) => (a[1] ? a[1].score / a[1].total : 2) - (b[1] ? b[1].score / b[1].total : 2)).map(([e, t]) => t
            ? `<div class="rg w"><span class="rg-n">${esc(nomCorto(e.name))}</span>${nivelChip(t)}<small>${t.score}/${t.total}</small><span class="dots">${(t.answers || []).map((b, k) => `<i class="${b ? 'si' : 'no'}" title="P${k + 1}"></i>`).join('')}</span></div>`
            : `<div class="rg off w"><span class="rg-n">${esc(nomCorto(e.name))}</span><small>⏳ Pendiente</small></div>`).join('') + `<p class="hand w"><small>🟢 correcta · 🔴 incorrecta (P1, P2, …)</small></p>` });
      });
      return H;
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
      if (!ms.length) return [{ l: cab + '<p class="hand w">Esta unidad aún no tiene misiones de refuerzo.</p>', r: '' }];
      const H = [{ l: cab + `<p class="hand w">${ms.length} misiones · ${D.est.length} estudiantes.</p><p class="hand w">${D.est.filter(e => ms.every(m => hechas(m, D.mp[e.key]) === m.acts.length)).length} completaron todas. 🏆</p>`,
        r: `<h2 class="w">👥 Avance</h2>` + D.est.map(e => { const c = ms.filter(m => hechas(m, D.mp[e.key]) === m.acts.length).length;
          return `<div class="rg w"><span class="rg-n">${esc(nomCorto(e.name))}</span><span class="qb"><i style="width:${pct(c, ms.length)}%"></i></span><b>${c}/${ms.length}</b><span>${c === ms.length ? '✅' : '⏳'}</span></div>`; }).join('') }];
      ms.forEach((m, j) => {
        const errs = m.acts.map(a => D.est.reduce((s, e) => { const v = (D.mp[e.key] || {})[a.id]; return s + (Array.isArray(v) ? +v[0] || 0 : 0); }, 0));
        const kp = errs.reduce((b, v, k) => v > (errs[b] || 0) ? k : b, 0), comp = D.est.filter(e => hechas(m, D.mp[e.key]) === m.acts.length).length;
        H.push({ l: `<div class="crumb w">Misión ${j + 1} · Sesión ${m.ses.n} · 6° ${F.sec}</div><h1 class="w">💪 ${esc(m.t || 'Misión ' + (j + 1))}</h1>${secBar(F)}
            <p class="hand w"><b>${comp} de ${D.est.length}</b> la completaron · ${m.acts.length} actividades.</p>
            ${errs[kp] ? `<div class="box w">🔥 <b>Lo que más costó:</b><br><span class="hand">${esc(m.acts[kp].t || 'Actividad ' + (kp + 1))}</span> <small>(${errs[kp]} errores)</small></div>` : ''}`,
          r: `<h2 class="w">👥 Estudiantes</h2>` + D.est.map(e => { const h = hechas(m, D.mp[e.key]);
            return `<div class="rg w${h ? '' : ' off'}"><span class="rg-n">${esc(nomCorto(e.name))}</span><span class="qb"><i style="width:${pct(h, m.acts.length)}%"></i></span><small>${h}/${m.acts.length}</small><span>${h === m.acts.length ? '✅ Cumplió' : h ? '⏳ Le falta' : '⬜ No empezó'}</span></div>`; }).join('') });
      });
      return H;
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
    F.paginas = () => {
      const u = F.u;
      if (F.ed) return paginasEditar();
      const S = MD.sesionesDe(u);
      const H = [{ l: `<div class="crumb w">Ciencia y Tecnología · 6°</div><div class="ico w">${esc(u.icon || '📘')}</div><div class="big w">Unidad ${esc(u.num)}</div><h1 class="w">${esc(u.title)}</h1><p class="hand w">📗 Cuaderno de sesiones · ${S.length} sesiones</p>`,
        r: `<h2 class="w">📑 Índice</h2>${S.map(({ s, n }, k) => `<button class="row w" data-a="ir" data-i="${k + 1}"><b class="lv" style="background:#dbeafe;color:#1d4ed8">${n}</b><span class="rt"><b>Sesión ${n}</b><small>${esc(temaDe(s, n))}</small></span></button>`).join('')}` }];
      S.forEach(({ s, n }) => {
        const cr = (s.criteria || []).filter(L), acts = (s.activities || []).slice(0, 3).filter(a => L(a.title) || L(a.desc)), q = MD.preguntas(s).length;
        H.push({ l: `<div class="crumb w">${esc(u.icon || '📘')} Unidad ${esc(u.num)}</div><div class="big w">Sesión ${n}</div>${L(s.title) ? `<h2 class="w">${esc(s.title)}</h2>` : ''}
            ${L(s.meta) ? `<h3 class="w">🎯 Meta</h3><p class="hand w">${esc(s.meta)}</p>` : ''}${cr.length ? `<h3 class="w">✅ Criterios</h3><ul class="cr hand">${cr.map(c => `<li class="w">${esc(c)}</li>`).join('')}</ul>` : ''}
            <p class="center w"><button class="bt or" data-a="editar" data-n="${n}">✏️ Editar sesión</button>${s.fx ? ` <button class="bt" data-a="impficha" data-n="${n}">🖨️ Ficha</button>` : ''}${q ? ` <button class="bt" data-a="tarjetas" data-n="${n}">🖨️ Tarjetas</button>` : ''}</p>`,
          r: `<h2 class="w">🧪 Actividades</h2>${acts.map((a, j) => `<div class="act w"><b class="n">${j + 1}</b>${MODOS[String(a.mode || '').toLowerCase()] ? `<span class="chip">${MODOS[String(a.mode || '').toLowerCase()]}</span>` : ''}<div><b>${esc(a.title || 'Actividad ' + (j + 1))}</b></div>${L(a.desc) ? `<p class="hand">${esc(a.desc)}</p>` : ''}</div>${videoHtml(a)}`).join('') || '<p class="hand w">Sin actividades todavía.</p>'}
            ${q ? `<div class="box w">🎟️ <b>Exit ticket</b> · ${q} preguntas</div>` : ''}` });
        if (s.fx) H.push({ l: fichaHtml(s.fx, n, s), r: null });
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
      el.addEventListener('input', ev => { const t = ev.target, p = t.dataset && t.dataset.ed; if (!p || !F.ed) return; setPath(F.ed.s, p, t.type === 'radio' ? +t.value : t.value); });
      el.addEventListener('change', ev => { const t = ev.target, p = t.dataset && t.dataset.ed; if (!p || !F.ed) return; setPath(F.ed.s, p, t.type === 'radio' ? +t.value : t.value); }); };
    F.act2 = async (a, ds, el) => {
      if (a === 'video') { el.outerHTML = `<div class="vid on"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(ds.y)}?autoplay=1&rel=0&start=${+ds.t || 0}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div>`; return; }
      if (a === 'tarjetas') return Tarjetas.imprimir(F.u, +ds.n);
      if (a === 'impficha') return Tarjetas.imprimirFicha(F.u, +ds.n);   // la ficha con su cierre y la tarjeta del Exit ticket   // tarjetas del Exit ticket para escanear
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
        e.estado = 'guardando'; e.err = ''; F.libro.pinta(false);
        try { await MD.guardarSesion(F.u.key, e.n, s); e.estado = 'listo'; F.libro.pasar(1, () => { F.i = 0; }); }
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
        <div class="secs">${SECS.map(x => `<button class="sec${sec === x ? ' on' : ''}" data-l="sec" data-k="${x}">6° ${x}</button>`).join('')}</div>
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
