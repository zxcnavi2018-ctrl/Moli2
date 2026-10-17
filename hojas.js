// ===================================================================
//  MOLÍ 2 · HOJAS: lo que se escribe dentro de los cuadernos, el portafolio y los folders del aula,
//  y la presentación del proyector. Se pasan las hojas como en un libro de verdad.
// ===================================================================
(function () {
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = t => MD.lleno(t);
  // ---- 🔒 candados de la docente: bloquea una unidad entera o una sesión (cuaderno, Exit tickets y misiones). Se guarda en files/fbloq-0 ----
  const BQ = { u: {}, s: {} }, BQF = MD.fid('fbloq'), LIBROS = [];
  const BQURL = () => `https://firestore.googleapis.com/v1/projects/${MD.FB.projectId}/databases/(default)/documents/files/${BQF}?key=${MD.FB.apiKey}`;
  const bqOn = (k, n) => n == null ? !!BQ.u[k] : !!BQ.s[k + ':' + n];
  const cerrado = (k, n) => !MD.esDocente() && (!!BQ.u[k] || (n != null && !!BQ.s[k + ':' + n]));     // sólo los estudiantes ven el candado cerrado
  const lk = (k, n) => MD.esDocente() ? `<span class="lk${bqOn(k, n) ? ' on' : ''}" data-a="candado" data-k="${esc(k)}"${n == null ? '' : ` data-n="${n}"`} title="${bqOn(k, n) ? 'Bloqueado: toca para desbloquear' : 'Abierto: toca para bloquear'}">${bqOn(k, n) ? '🔒' : '🔓'}</span>` : '';
  const repintar = () => LIBROS.forEach(b => { if (!b.ocupado && document.body.contains(b.el || document.body)) b.pinta(false); });
  fetch(BQURL(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => { const v = j && j.fields && j.fields.b64 && j.fields.b64.stringValue; if (!v) return;
    const x = JSON.parse(decodeURIComponent(escape(atob(v)))); BQ.u = x.u || {}; BQ.s = x.s || {}; repintar(); }).catch(() => {});
  async function candado(ds) {
    const key = ds.n == null ? ds.k : ds.k + ':' + ds.n, M = ds.n == null ? BQ.u : BQ.s, antes = !!M[key];
    if (antes) delete M[key]; else M[key] = true; repintar();
    try { if (!window.Docente || !await Docente.token()) throw new Error('AUTH');
      await Docente.commit([{ update: { name: Docente.DOC('files', BQF), fields: Docente.toF({ b64: btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, u: BQ.u, s: BQ.s, at: Date.now() })))), updatedAt: new Date() }) } }]);
    } catch (e) { if (antes) M[key] = true; else delete M[key]; repintar();
      alert(e.message === 'AUTH' ? '🔐 Conecta tu cuenta: toca tu fotocheck → «Conectar mi cuenta».' : '📶 No se pudo guardar el candado. Revisa tu internet.'); }
  }
  const mezcla = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const nom1 = me => String(me && me.name || '').split(' ')[0].toLowerCase().replace(/^./, c => c.toUpperCase());
  const MODOS = { individual: '👤 Individual', group: '👥 En equipo', grupo: '👥 En equipo', pair: '👫 En pareja', pairs: '👫 En pareja', pareja: '👫 En pareja', whole: '🏫 Toda la clase', clase: '🏫 Toda la clase' };
  const temaDe = (s, n) => L(s.title) ? s.title : (() => { const m = String(s.meta || '').trim().replace(/\.$/, ''); return m ? (m.length > 80 ? m.slice(0, 78).replace(/\s+\S*$/, '') + '…' : m) : 'Sesión ' + n; })();
  const temaCorto = (u, s, n) => {                                     // el tema: el título de la sesión, o el que Molí le puso en «Mi presentación» (sin repetir la meta)
    if (L(s.title)) return s.title;
    const S = MD.sesionesDe(u), k = S.findIndex(z => z.n === n), C = cacheIA(hashQ({ u, s, n, prev: k > 0 ? S[k - 1] : null }));
    return C && L(C.t) ? C.t : '';
  };
  const nivelChip = r => { const v = MD.nivel(r); return `<span class="lv" style="background:${v.color};color:${v.ink}">${v.k}</span>`; };
  const IMG = n => `img/moli/${n}.webp`;
  const cargando = (t = 'Molí está abriendo tu cuaderno…') => `<div class="load">${esc(t)}</div>`;

  // =================================================================
  //  EL LIBRO: dos hojas, se pasan con animación; el texto nuevo se escribe solo
  // =================================================================
  function Libro(host, tema, flujo) {
    host.innerHTML = `<div class="bk bk-${tema}"><div class="bk-cov"></div><div class="bk-pp"><div class="bk-p bk-l"><div class="bk-in"></div></div><div class="bk-sp"></div><div class="bk-p bk-r"><div class="bk-in"></div></div></div>
      <button class="bk-tab" hidden></button><div class="bk-nav"><button data-nav="-1" aria-label="Hoja anterior">‹</button><span></span><button data-nav="1" aria-label="Hoja siguiente">›</button></div></div>`;
    const el = host.firstChild, pp = el.querySelector('.bk-pp'), Lp = el.querySelector('.bk-l .bk-in'), Rp = el.querySelector('.bk-r .bk-in');
    const nav = el.querySelector('.bk-nav'), num = nav.querySelector('span'), tab = el.querySelector('.bk-tab');
    const B = { el, flujo, ocupado: false, p: 0, PH: [], first: [] };
    // ---- medir: lo que no entra en una hoja pasa a la siguiente ----
    const med = document.createElement('div'); med.className = 'bk-p bk-l bk-med'; med.innerHTML = '<div class="bk-in"></div>'; pp.appendChild(med);
    const medIn = med.firstChild;
    function partir(html) {
      if (!html) return [''];
      medIn.innerHTML = html;
      if (medIn.scrollHeight <= medIn.clientHeight + 2) return [html];
      const nodos = [...medIn.childNodes].filter(n => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()));
      const pags = []; let cur = [];
      medIn.innerHTML = '';
      nodos.forEach(n => {
        medIn.appendChild(n); cur.push(n);
        if (medIn.scrollHeight > medIn.clientHeight + 2 && cur.length > 1) {
          medIn.removeChild(n); cur.pop();
          const lleva = [];                                            // un título no se queda solo al final de la hoja: se va con lo suyo
          while (cur.length > 1 && cur[cur.length - 1].nodeType === 1 && /^(H[1-4])$/.test(cur[cur.length - 1].tagName) || cur.length > 1 && cur[cur.length - 1].classList && cur[cur.length - 1].classList.contains('crumb')) lleva.unshift(cur.pop());
          pags.push(cur.map(x => x.nodeType === 1 ? x.outerHTML : x.textContent).join(''));
          medIn.innerHTML = ''; cur = [...lleva, n]; cur.forEach(x => medIn.appendChild(x));
        }
      });
      if (cur.length) pags.push(cur.map(x => x.nodeType === 1 ? x.outerHTML : x.textContent).join(''));
      return pags.length ? pags : [html];
    }
    function maquetar() {
      const S = flujo.hojas(); flujo.i = Math.max(0, Math.min(S.length - 1, flujo.i || 0));
      B.PH = []; B.first = []; B.last = [];
      S.forEach((h, j) => {
        const P = [...partir(h.l || ''), ...(h.r != null ? partir(h.r || '') : [])];
        B.first[j] = B.PH.length;
        for (let k = 0; k < P.length; k += 2) B.PH.push({ l: P[k], r: P[k + 1] || '', log: j });
        B.last[j] = B.PH.length - 1;
      });
      medIn.innerHTML = '';
    }
    const enRango = () => B.p >= B.first[flujo.i] && B.p <= B.last[flujo.i];
    let tamListo = false, tT = 0;
    const talla = () => { const h = el.clientHeight || 300, w = el.clientWidth || 600; el.style.fontSize = Math.max(9, Math.min(30, h / 23, w / 44)) + 'px';   // crece con la pantalla (en la PC se lee grande)
      clearTimeout(tT); tT = setTimeout(() => { const ae = document.activeElement; if (B.ocupado || (ae && el.contains(ae) && /INPUT|TEXTAREA|SELECT/.test(ae.tagName))) return; pinta(!tamListo); tamListo = true; }, 160); };   // (si está escribiendo, no se repinta: no se cierra el teclado)
    B.ro = new ResizeObserver(talla); B.ro.observe(el);
    document.fonts && document.fonts.ready.then(() => !B.ocupado && tamListo && pinta(false));
    const escribir = (cont) => { let d = 0; cont.querySelectorAll('.w').forEach(x => { x.style.setProperty('--d', d.toFixed(2) + 's'); d += 0.09; }); };
    function pinta(anim) {
      maquetar();
      if (!enRango()) B.p = B.first[flujo.i] || 0;
      const h = B.PH[B.p] || { l: '', r: '' };
      el.classList.toggle('quieto', !anim);
      Lp.innerHTML = h.l || ''; Rp.innerHTML = h.r || '';
      if (anim) { escribir(Lp); escribir(Rp); Lp.scrollTop = Rp.scrollTop = 0; }
      const total = B.PH.length;
      nav.children[0].disabled = !(B.p > 0 || !!flujo.atras); nav.children[2].disabled = !(B.p < total - 1);
      num.textContent = total > 1 ? `${B.p + 1} / ${total}` : '';
      nav.style.visibility = flujo.sinNav ? 'hidden' : '';
      if (flujo.pestana) { tab.hidden = false; tab.textContent = flujo.pestana; } else tab.hidden = true;
      flujo.alPintar && flujo.alPintar(el);
    }
    B.pinta = pinta;
    // pasar la hoja: dir 1 = adelante (la hoja derecha se va a la izquierda), -1 = atrás
    B.pasar = function (dir, cambio) {
      if (B.ocupado) return; B.ocupado = true;
      const viejoL = Lp.innerHTML, viejoR = Rp.innerHTML, p0 = B.p;
      cambio(); maquetar();
      if (B.p === p0 || !(B.p >= 0 && B.p < B.PH.length)) B.p = B.first[flujo.i] || 0;
      const h = B.PH[B.p] || { l: '', r: '' };
      const Lb = Lp.parentNode, Rb = Rp.parentNode, rL = Lb.getBoundingClientRect(), rR = Rb.getBoundingClientRect(), rP = pp.getBoundingClientRect();
      const leaf = document.createElement('div'); leaf.className = 'bk-leaf';
      const ref = dir > 0 ? rR : rL;
      Object.assign(leaf.style, { left: (ref.left - rP.left) + 'px', width: ref.width + 'px', transformOrigin: dir > 0 ? '0 50%' : '100% 50%' });
      leaf.innerHTML = `<div class="bk-p ${dir > 0 ? 'bk-r' : 'bk-l'}"><div class="bk-in">${dir > 0 ? viejoR : viejoL}</div><i class="bk-sh"></i></div><div class="bk-p bk-back ${dir > 0 ? 'bk-l' : 'bk-r'}"><div class="bk-in">${dir > 0 ? h.l || '' : h.r || ''}</div></div>`;
      leaf.querySelectorAll('.w').forEach(x => x.classList.remove('w'));
      pp.appendChild(leaf);
      el.classList.add('quieto');
      if (dir > 0) Rp.innerHTML = h.r || ''; else Lp.innerHTML = h.l || '';
      requestAnimationFrame(() => requestAnimationFrame(() => { leaf.style.transform = `rotateY(${dir > 0 ? -180 : 180}deg)`; leaf.querySelector('.bk-sh').style.opacity = 1; }));
      setTimeout(() => { leaf.remove(); B.ocupado = false; pinta(true); }, 780);
    };
    el.addEventListener('click', e => {
      const n = e.target.closest('[data-nav]');
      if (n) { e.stopPropagation(); const d = +n.dataset.nav;
        if (d < 0 && B.p <= 0 && flujo.atras) return B.pasar(-1, () => flujo.atras());
        if (B.p + d < 0 || B.p + d >= B.PH.length) return;
        return B.pasar(d, () => { B.p += d; flujo.i = B.PH[B.p].log; flujo.alMover && flujo.alMover(); }); }
      if (e.target.closest('.bk-tab')) { e.stopPropagation(); flujo.alTab && flujo.alTab(); return; }
      const a = e.target.closest('[data-a]');
      if (a && a.dataset.a === 'candado') { e.stopPropagation(); return candado(a.dataset); }
      if (a && !a.disabled) { e.stopPropagation(); flujo.act(a.dataset.a, a.dataset, a); }
    });
    el.addEventListener('submit', e => { e.preventDefault(); const f = e.target; flujo.act(f.dataset.a, f.dataset, f); });
    flujo.libro = B; B.el = el; LIBROS.push(B);
    pinta(true);
    return B;
  }

  // ---- entrar con DNI (lo usan el portafolio, las notas y las misiones) ----
  const hojaEntrar = (para) => ({
    l: `<img class="moli w" src="${IMG('hola')}" alt=""><div class="crumb w">Molí 2</div><h1 class="w">¡Hola! 👋</h1><p class="hand w">Para ver ${para}, escribe tu <b>DNI</b>. Es el mismo con el que entras a Molí.</p><p class="hand w">Así guardo todo en tu cuenta. 📝</p>`,
    r: `<form data-a="entrar" class="center"><h2 class="w">🔑 Mi cuenta</h2><input class="dni" name="dni" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="DNI"><div class="err"></div><button class="bt gr" type="submit">Entrar ✓</button></form>`
  });
  async function entrarCon(flujo, f) {
    const inp = f.querySelector('input'), err = f.querySelector('.err'), b = f.querySelector('button');
    b.disabled = true; b.textContent = 'Un momento…'; err.textContent = '';
    try { flujo.me = await MD.entrar(inp.value); window.dispatchEvent(new Event('moli2:me')); flujo.alEntrar ? flujo.alEntrar() : flujo.libro.pasar(1, () => { flujo.i = 0; }); }
    catch (e) { b.disabled = false; b.textContent = 'Entrar ✓'; err.textContent = e.message === 'DNI' ? 'Escribe los 8 números de tu DNI.' : e.message === 'NOEXISTE' ? 'No encuentro ese DNI. Pide a tu profe que cree tu cuenta.' : 'No pude conectarme. Revisa tu internet.'; }
  }
  // ---- elegir la unidad ----
  const hojaUnidades = (titulo, icono, frase, me) => {
    const U = MD.unidades();
    return { l: `<img class="moli w" src="${IMG('feliz')}" alt=""><div class="crumb w">${me ? esc(me.name) + (me.docente ? ' · Docente' : ' · ' + MD.espInfo().gn + ' ' + esc(me.section)) : 'Ciencia y Tecnología · ' + MD.espInfo().gn}</div><h1 class="w">${icono} ${esc(titulo)}</h1><p class="hand w">${frase}</p>`,
      r: `<h2 class="w">📚 Elige tu unidad</h2>${U.length ? U.map(u => { const c = cerrado(u.key); return `<button class="row w${c ? ' off' : ''}" ${c ? 'disabled' : `data-a="unidad" data-k="${esc(u.key)}"`}><span class="ico" style="font-size:1.6em">${esc(u.icon || '📘')}</span><span class="rt"><b>Unidad ${esc(u.num)}</b><small>${c ? '🔒 Bloqueada por tu profe' : esc(u.title)}</small></span>${lk(u.key)}<span>${c ? '🔒' : '›'}</span></button>`; }).join('') : '<p class="hand w">Todavía no hay unidades visibles.</p>'}` };
  };

  // ---- el caso del Exit ticket (texto y su tabla), cuando la ficha del colegio lo trae ----
  const casoHtml = c => c && (L(c.t) || (c.d || []).length) ? `<div class="box w fx-caso">📋 ${esc(c.t || '')}${c.c && c.c.length ? `<table class="fx-t"><tr>${c.c.map(x => `<th>${esc(x)}</th>`).join('')}</tr>${(c.d || []).map(f => '<tr>' + c.c.map((_, j) => `<td>${esc(f[j] || '')}</td>`).join('') + '</tr>').join('')}</table>` : ''}</div>` : '';
  // ---- la ficha de la sesión (la arma «Trabajar con Molí»): va dentro del cuaderno, en sus propias hojas ----
  const fichaHtml = (fx, n, ses) => {
    if (!fx) return '';
    const P = [`<div class="crumb w">📄 Ficha · Sesión ${n}</div>`, `<h1 class="w">${esc(fx.t || 'Ficha de la sesión')}</h1>`];
    if (L(fx.st)) P.push(`<p class="hand w">${esc(fx.st)}</p>`);
    const trozos = t => { const o = [], fr = String(t || '').match(/[^.!?\n]+[.!?]*\s*|\n+/g) || []; let c = ''; fr.forEach(f => { if ((c + f).length > 300 && c.trim()) { o.push(c.trim()); c = ''; } c += f; }); if (c.trim()) o.push(c.trim()); return o; };
    const bloque = (cls, tit, t) => trozos(t).forEach((x, k) => P.push(`<div class="${cls} w">${!k && tit ? `<b>${tit}</b>` : ''}<p>${esc(x).replace(/\n/g, '<br>')}</p></div>`));   // en trocitos: si no entra, sigue en la otra hoja
    const tabla = (c, r, it = [], d) => `<table class="fx-t"><tr>${c.map(x => `<th>${esc(x)}</th>`).join('')}</tr>${(d && d.length ? d : Array.from({ length: Math.max(1, r || 3, it.length) }, (_, i) => c.map((_, j) => j === 0 && it[i] ? it[i] : ''))).map(f => '<tr>' + c.map((_, j) => `<td>${esc(f[j] || '')}</td>`).join('') + '</tr>').join('')}</table>`;   // d: la tabla ya llena (lo vacío se escribe)
    const marcas = op => op && op.length ? `<div class="fx-op">${op.map(o => `<span>☐ ${esc(o)}</span>`).join('')}</div>` : '';
    const sabias = () => L(fx.sb) ? `<div class="box tip w">💡 <b>¿Sabías que…?</b> <span class="hand">${esc(String(fx.sb).replace(/^\s*¿?\s*sab[ií]as\s+que\s*(…|\.\.\.)?\s*/i, ''))}</span></div>` : '';
    let nq = 0, a0 = 0, sb = false;
    const N = () => fx.nn ? '✎' : ++nq;                              // nn: la ficha ya trae la numeración del colegio
    if (fx.v === 2) {                                                // la ficha del colegio, en su orden (✨ = lo que agregó Molí)
      (fx.s || []).forEach(x => {
        const m = x.o ? ' <small class="fx-mol">✨ Molí</small>' : '';
        if (x.a && x.a !== a0 && x.k !== 'texto') { a0 = x.a; P.push(`<h3 class="w">🧪 Actividad ${x.a}</h3>`); }
        if (x.k === 'texto') { bloque('fx-bl', (L(x.h) ? esc(x.h) : '') + m, x.t); if (!sb && L(fx.sb)) { P.push(sabias()); sb = true; } }
        else if (x.k === 'lista') P.push(`<div class="fx-bl w">${L(x.h) ? `<b>${esc(x.h)}</b>${m}` : ''}${L(x.t) ? `<p>${esc(x.t)}</p>` : ''}<ul>${(x.it || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`);
        else if (x.k === 'datos') P.push(`<div class="fx-bl w">${L(x.h) ? `<b>${esc(x.h)}</b>${m}` : ''}${L(x.t) ? `<p>${esc(x.t)}</p>` : ''}${tabla(x.c || [], 0, [], x.d)}</div>`);
        else if (x.k === 'tabla') P.push(`<div class="fx-q w"><b class="n">${N()}</b><div><p>${esc(x.t || x.h)}${m}</p>${L(x.hp) ? `<small>💬 ${esc(x.hp)}</small>` : ''}${x.c && x.c.length ? tabla(x.c, x.r, x.it || [], x.d) : ''}</div></div>`);
        else if (x.k === 'cuad') P.push(`<div class="fx-q w"><b class="n">${N()}</b><div><p>${esc(x.t)}</p>${L(x.hp) ? `<small>💬 ${esc(x.hp)}</small>` : ''}<div class="fx-cuad"></div></div></div>`);
        else P.push(`<div class="fx-q w"><b class="n">${N()}</b><div><p>${esc(x.t || x.h)}${m}</p>${L(x.hp) ? `<small>💬 ${esc(x.hp)}</small>` : ''}${marcas(x.op)}${x.op && x.op.length && !x.ln ? '' : `<div class="fx-ln"${x.ln > 1 ? ` style="height:${1.55 * (x.ln + 1)}em"` : ''}>${L(x.f) ? `<span>${esc(x.f)}</span>` : ''}</div>`}</div></div>`);
      });
      if (!sb) P.push(sabias());
    } else {                                                         // fichas de antes
      if (L(fx.rd)) bloque('fx-lee', '📖 Lectura', fx.rd);
      (fx.b || []).forEach(x => bloque('fx-bl', L(x.h) ? esc(x.h) : '', x.t));
      P.push(sabias());
      (fx.k || []).forEach((x, i) => {
        if (x.a && x.a !== a0) { a0 = x.a; P.push(`<h3 class="w">🧪 Actividad ${x.a}</h3>`); }
        P.push(`<div class="fx-q w"><b class="n">${i + 1}</b><div><p>${esc(x.q)}</p>${L(x.h) ? `<small>💬 ${esc(x.h)}</small>` : ''}${x.c && x.c.length ? tabla(x.c, x.r) : `<div class="fx-ln">${L(x.f) ? `<span>${esc(x.f)}</span>` : ''}</div>`}</div></div>`);
      });
    }
    if (ses) {                                                       // el cierre de la sesión (como las fichas de Molí)
      const cr = (ses.criteria || []).filter(L), f = ses.flipped && ses.flipped.enabled && (L(ses.flipped.title) || L(ses.flipped.desc)) ? ses.flipped : null, q = (ses.ticket && ses.ticket.questions || []).filter(x => L(x.q)).length;
      if (cr.length) P.push(`<div class="fx-cierre w"><b>✅ ¿Cómo me fue hoy?</b>${cr.map(c => `<div class="fx-cr"><span>${esc(c)}</span><i>😀</i><i>🤔</i></div>`).join('')}<small>😀 Lo logré · 🤔 Aún estoy en proceso</small></div>`);
      if (f) P.push(`<div class="box tip w"><b>🏠 Para la siguiente clase:</b> <span class="hand">${esc(f.title)}${L(f.desc) ? ' — ' + esc(f.desc) : ''}</span></div>`);
      if (q) P.push(`<div class="box w">🎟️ <b>Exit ticket</b> · ${q} preguntas<br><span class="hand">Respóndelo en tu portafolio verde del locker (o en tu tarjeta, si tu profe la imprime).</span></div>`);
    }
    return P.join('');
  };

  // ---- archivos de la unidad (página izquierda del cuaderno): carátula y rúbrica de la competencia ----
  const DOCS_U = { unit7: [['data/unidad/u7-caratula.pdf', '🎨', 'Carátula de unidad', 'U7 Carátula.pdf'], ['data/unidad/rubrica-indaga.pdf', '📏', 'Rúbrica · Competencia Indaga', 'Rúbrica Indaga 5.° y 6.°.pdf']],
    unit8: [['data/unidad/u8-caratula.pdf', '🎨', 'Carátula de unidad', 'U8 Carátula.pdf'], ['data/unidad/rubrica-explica.pdf', '📏', 'Rúbrica · Competencia Explica', 'Rúbrica Explica 5.° y 6.°.pdf']] };
  const docsUnidad = u => { const D = DOCS_U[u && u.key]; return D ? `<div class="u-docs w"><b>📎 Archivos de la unidad</b>${D.map(([url, ic, t, nm], k) => `<button class="u-doc" data-a="udoc" data-k="${k}"><i>${ic}</i><span><b>${t}</b><small>PDF · ver o descargar</small></span><em>›</em></button>`).join('')}</div>` : ''; };
  const abrirDocU = (u, k, el) => { const d = (DOCS_U[u && u.key] || [])[+k]; if (!d) return; const t = el && el.innerHTML; if (el) { el.disabled = true; el.querySelector('small').textContent = '⏳ Abriendo…'; }
    MD.abrirPdf(d[0], null, d[3]).catch(() => alert('No pude abrir el archivo. Revisa tu internet.')).finally(() => { if (el) { el.disabled = false; el.innerHTML = t; } }); };

  // ---- Sesión 01 de la Unidad 7 (Retos Bebras): 3 desafíos en foto, sin respuestas ----
  const BEBRAS = [
    { mode: 'individual', title: 'Desafío 1 · El camino más barato', desc: 'Leemos el reto con calma y buscamos el recorrido que le cueste al castor la menor cantidad de monedas.', img: 'img/bebras/reto1.jpg',
      en: ['Un castor quiere visitar a todos sus amigos en los pueblos A, B, C, D y E en transporte público.', 'Va a visitar a todos sus amigos en un solo viaje, sin visitar un pueblo más de una vez, y regresando a casa al final del viaje.', 'El precio de cada camino se muestra con monedas 🪙.'],
      ej: 'Un posible recorrido que cuesta 11 monedas es: Inicio → B → E → A → D → C → Inicio.', fig: 'img/bebras/fig1.jpg',
      pr: 'Encuentra un orden de visitas que le cueste al castor la menor cantidad de monedas posible. ¡Puede haber varias soluciones!' },
    { mode: 'pair', title: 'Desafío 2 · El ascensor', desc: 'En parejas probamos cómo repartir a los castores en los dos viajes del ascensor (máximo 30 kg) para que suban la mayor cantidad.', img: 'img/bebras/reto2.jpg',
      en: ['Un grupo de castores está visitando un parque y quiere tomar el ascensor hasta el mirador.', 'Pero es tarde y el ascensor solo sube dos veces.', 'El ascensor tiene una capacidad de carga de 30 kg (cada castor con su equipaje).'], fig: 'img/bebras/fig2.jpg',
      pr: '¿Cómo podemos repartir a los castores entre los dos viajes del ascensor para que suban tantos castores como sea posible?' },
    { mode: 'whole', title: 'Desafío 3 · El código secreto', desc: 'Con toda la clase usamos las 4 pistas, una por una, para descubrir el código de 3 dígitos de la cueva de José.', img: 'img/bebras/reto3.jpg',
      en: ['José tiene una cueva donde ha escondido todos sus tesoros.', 'Desafortunadamente, olvidó el código de 3 dígitos de la alarma. Por si acaso, había escrito estas pistas:'],
      pistas: [['172', 'Solo uno de estos dígitos es correcto, pero está en la posición incorrecta.'], ['854', 'Dos de estos dígitos son correctos, pero están en la posición incorrecta.'], ['986', 'Solo uno de estos dígitos es correcto, pero está en la posición incorrecta.'], ['751', 'Solo uno de estos dígitos es correcto y está en la posición correcta.']],
      pr: '¿Cuál es el código correcto?' }];
  const esBebras = (u, s) => !!(u && s && /unit7/.test(u.key || '') && /bebras/i.test(String(s.title || '') + ' ' + String(s.rubric || '')));
  const actsDe = (u, s) => esBebras(u, s) ? BEBRAS : (s.activities || []);
  const fotoHtml = (a, cls = '') => L(a && a.img) ? `<button type="button" class="foto-reto ${cls}" data-foto="${esc(a.img)}" data-ft="${esc(a.title || '')}" aria-label="Ver la foto en grande"><img src="${esc(a.img)}" alt="${esc(a.title || 'Foto del reto')}" loading="lazy"><i>👁️ Ver grande</i></button>` : '';
  function verFoto(src, t) {
    let v = document.getElementById('fotoVer');
    if (!v) { v = document.createElement('div'); v.id = 'fotoVer'; document.body.appendChild(v);
      v.addEventListener('click', e => { if (e.target === v || e.target.closest('.fv-x')) { v.classList.remove('on'); } else if (e.target.tagName === 'IMG') v.classList.toggle('z'); }); }
    v.innerHTML = `<div class="fv-top"><b>${esc(t || '')}</b><button type="button" class="fv-x" aria-label="Cerrar">✕</button></div><div class="fv-sc"><img src="${esc(src)}" alt="${esc(t || '')}"></div><p class="fv-tip">👆 Toca la foto para acercarla o alejarla</p>`;
    v.classList.remove('z'); v.classList.add('on');
  }
  document.addEventListener('click', e => { const f = e.target.closest && e.target.closest('[data-foto]'); if (!f) return; e.stopPropagation(); e.preventDefault(); verFoto(f.dataset.foto, f.dataset.ft); }, true);
  addEventListener('keydown', e => { const v = document.getElementById('fotoVer'); if (e.key === 'Escape' && v && v.classList.contains('on')) { e.stopPropagation(); v.classList.remove('on'); } }, true);

  // ---- ir a otro libro del aula (el portafolio de Exit tickets o el cuaderno de misiones), ya abierto en esta unidad ----
  let destino = null;
  const refDe = (u, n) => MD.misionesDe(u.key).some(m => m.ses && m.ses.n === n);
  const irA = (titulo, u, n, kind) => { const k = G.STOPS.findIndex(st => st.title === titulo); if (k < 0) return; destino = { u: u.key, n, kind }; G.go(k - G.TOUR.i); };
  const tomarDestino = kind => { const d = destino && destino.kind === kind ? destino : null; if (d) destino = null; return d; };
  // ---- las fichas de la sesión: solo el PDF para ver o descargar (como en Molí 1) ----
  const fichaDe = (s, cual) => cual === 'tarea' ? { url: s.tareaPdf, id: s.flipped && s.flipped.enabled && s.flipped.file } : { url: s.pdf, id: ((s.activities || []).find(a => a && a.file) || {}).file };
  const pdfs = (s, n) => { const B = [['ficha', '📄 Ficha de la sesión'], ['tarea', '🏠 Tarea flipped']].filter(([c]) => { const f = fichaDe(s, c); return f.url || (f.id && MD.contenido() && (MD.contenido().files || {})[f.id]) || (c === 'tarea' ? s.tarea : s.fx); });
    return B.length ? `<div class="box w fx-pdfs"><b>📎 Fichas</b><br>${B.map(([c, t]) => `<button class="bt" data-a="pdf" data-n="${n}" data-c="${c}">${t} (PDF)</button>`).join(' ')}</div>` : ''; };
  const abrirFicha = (u, n, cual, el) => { const s = u.sessions[n - 1], f = fichaDe(s, cual), t = el && el.textContent;
    if (!f.url && !(f.id && (MD.contenido().files || {})[f.id])) return Tarjetas.imprimirFicha(u, n, cual);   // sin PDF todavía: se abre lista para imprimir o guardar como PDF
    if (el) { el.disabled = true; el.textContent = '⏳ Abriendo…'; }
    MD.abrirPdf(f.url, f.id, `U${u.num} S${n} ${cual === 'tarea' ? 'Tarea flipped' : 'Ficha'}.pdf`).catch(() => alert('No pude abrir la ficha. Revisa tu internet.')).finally(() => { if (el) { el.disabled = false; el.textContent = t; } }); };

  // =================================================================
  //  1) MIS SESIONES DE UNIDAD (cuaderno verde de la mesa)
  // =================================================================
  function flujoSesiones() {
    const F = { i: 0, u: null, listo: false, me: MD.yo() };
    F.hojas = () => {
      if (!F.listo) return [{ l: cargando(), r: '' }];
      if (!F.u) return [hojaUnidades('Mis sesiones de unidad', '📗', `¡Hola${F.me ? ' ' + esc(nom1(F.me)) : ''}! Aquí está todo lo que aprendemos en cada clase. Elige tu unidad y pasa las hojas. ✏️`, F.me)];
      const u = F.u, S0 = MD.sesionesDe(u), S = S0.filter(x => !cerrado(u.key, x.n));
      const H = [{ l: `<div class="crumb w">Ciencia y Tecnología · ${MD.espInfo().gn}</div><div class="ico w">${esc(u.icon || '📘')}</div><div class="big w">Unidad ${esc(u.num)}</div><h1 class="w">${esc(u.title)}</h1><p class="hand w">📗 Mi cuaderno de sesiones</p><p class="hand w">${S.length} ${S.length === 1 ? 'sesión' : 'sesiones'} · pasa la hoja ›</p>${docsUnidad(u)}`,
        r: `<h2 class="w">📑 Índice</h2>${S0.map(({ s, n }) => { const c = cerrado(u.key, n); return `<button class="row w${c ? ' off' : ''}" ${c ? 'disabled' : `data-a="ir" data-i="${S.findIndex(x => x.n === n) + 1}"`}><b class="lv" style="background:#dbeafe;color:#1d4ed8">${n}</b><span class="rt"><b>Sesión ${n}</b><small>${c ? '🔒 Bloqueada por tu profe' : esc(temaDe(s, n))}</small></span>${lk(u.key, n)}${c ? '🔒' : ''}</button>`; }).join('')}` }];
      S.forEach(({ s, n }) => {
        const cr = (s.criteria || []).filter(L), acts = actsDe(u, s).slice(0, 3).filter(a => L(a.title) || L(a.desc)), q = MD.preguntas(s).length, bb = esBebras(u, s);
        const tareas = [[s.flipped2, '📌 Trae para esta clase:'], [s.flipped, '🏠 Para la casa:']].filter(([f]) => f && f.enabled && (L(f.title) || L(f.desc)));
        H.push({ l: `<div class="crumb w">${esc(u.icon || '📘')} Unidad ${esc(u.num)} · ${esc(u.title)}</div><div class="big w">Sesión ${n}</div>${temaCorto(u, s, n) ? `<h2 class="w">${esc(temaCorto(u, s, n))}</h2>` : ''}
            ${L(s.meta) ? `<h3 class="w">🎯 Meta de la sesión</h3><p class="hand w">${esc(s.meta)}</p>` : ''}
            ${cr.length ? `<h3 class="w">✅ Criterios de éxito</h3><ul class="cr hand">${cr.map(c => `<li class="w">${esc(c)}</li>`).join('')}</ul>` : ''}
            ${L(s.rubric) ? `<h3 class="w">📏 Lo que se evalúa</h3><p class="hand w">${esc(s.rubric)}</p>` : ''}`,
          r: `<h2 class="w">🧪 Actividades</h2>${acts.length ? acts.map((a, j) => `<div class="act w"><b class="n">${j + 1}</b>${MODOS[String(a.mode || '').toLowerCase()] ? `<span class="chip">${MODOS[String(a.mode || '').toLowerCase()]}</span>` : ''}<div><b>${esc(a.title || 'Actividad ' + (j + 1))}</b></div>${L(a.desc) ? `<p class="hand">${esc(a.desc)}</p>` : ''}${fotoHtml(a)}</div>${Hojas.videoHtml ? Hojas.videoHtml(a) : ''}`).join('') : '<p class="hand w">Tu profe aún no escribe las actividades.</p>'}
            ${tareas.map(([f, et]) => `<div class="box tip w"><b>${et}</b> <span class="hand">${esc(f.title)}${L(f.desc) ? ' — ' + esc(f.desc) : ''}</span></div>`).join('')}
            ${bb ? '' : pdfs(s, n)}${q || refDe(u, n) ? `<div class="box w fx-pdfs"><b>➡️ Después de la clase</b><br>${q ? `<button class="bt gr" data-a="irexit" data-n="${n}">🎟️ Exit ticket</button> ` : ''}${refDe(u, n) ? `<button class="bt or" data-a="irref" data-n="${n}">💪 Refuerzo</button>` : ''}</div>` : ''}` });
      });
      return H;
    };
    F.atras = () => { if (F.u) { F.u = null; F.i = 0; } };
    F.alMover = () => {}; F.pestana = null;
    F.act = (a, ds, el) => {
      if (a === 'unidad') F.libro.pasar(1, () => { F.u = MD.unidades().find(u => u.key === ds.k); F.i = 0; F.pestana = '📚 Unidades'; });
      if (a === 'ir') F.libro.pasar(1, () => { F.i = +ds.i; });
      if (a === 'pdf') return abrirFicha(F.u, +ds.n, ds.c, el);
      if (a === 'udoc') return abrirDocU(F.u, ds.k, el);
      if (a === 'irexit') return irA('Mis Exit tickets', F.u, +ds.n, 'exit');
      if (a === 'irref') return irA('Mis misiones de refuerzo', F.u, +ds.n, 'ref');
      if (a === 'video') el.outerHTML = `<div class="vid on"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(ds.y)}?autoplay=1&enablejsapi=1&rel=0&start=${+ds.t || 0}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div>`;
    };
    F.alTab = () => F.libro.pasar(-1, () => { F.u = null; F.i = 0; F.pestana = null; });
    F.iniciar = () => MD.cargar().then(() => MD.cargarMisiones().catch(() => {})).then(() => { F.listo = true; F.libro.pinta(true); }).catch(() => { F.listo = true; F.libro.pinta(true); });
    return F;
  }

  // =================================================================
  //  2) MIS EXIT TICKETS (portafolio verde del locker)
  // =================================================================
  function flujoTickets() {
    const F = { i: 0, u: null, listo: false, me: MD.yo(), modo: 'lista', T: null };
    const pendiente = () => { const S = MD.sesionesDe(F.u).filter(x => MD.preguntas(x.s).length); return S.find(x => !F.T[x.n] && !cerrado(F.u.key, x.n)); };
    F.hojas = () => {
      if (!F.listo) return [{ l: cargando(), r: '' }];
      if (!F.me) return [hojaEntrar('tus Exit tickets')];
      if (!F.u) return [hojaUnidades('Mis Exit tickets', '🎟️', 'Al final de cada clase respondes tu Exit ticket. Aquí quedan guardados en tu portafolio. 📁', F.me)];
      const u = F.u;
      if (!F.T) return [{ l: cargando('Buscando tus Exit tickets…'), r: '' }];
      if (F.modo === 'lista') {
        const S = MD.sesionesDe(u).filter(x => MD.preguntas(x.s).length), hechos = S.filter(x => F.T[x.n]), pe = pendiente();
        const prom = MD.promedio(hechos.map(x => F.T[x.n]));
        return [{ l: `<img class="moli w" src="${IMG(pe ? 'decidida' : 'orgullosa')}" alt=""><div class="crumb w">${esc(u.icon || '📘')} Unidad ${esc(u.num)} · ${esc(u.title)}</div><h1 class="w">🎟️ Mis Exit tickets</h1>
            <p class="hand w">${hechos.length} de ${S.length} respondidos.</p>${prom ? `<p class="w">Promedio: ${nivelChip(prom)} <b>${prom.score}%</b></p>` : ''}
            <p class="hand w">${pe ? `Te toca el de la <b>Sesión ${pe.n}</b>. Van en orden, uno por uno. 📚` : S.length ? '¡Respondiste todos! 🏆' : 'Tu profe aún no activa los Exit tickets.'}</p>`,
          r: `<h2 class="w">📋 Sesiones</h2>${S.map(({ s, n }) => { const t = F.T[n], es = pe && pe.n === n, c = cerrado(u.key, n);
              return `<button class="row w${c || (!t && !es) ? ' off' : ''}" ${!c && (t || es) ? `data-a="${t ? 'ver' : 'empezar'}" data-n="${n}"` : 'disabled'}><b class="lv" style="background:#dcfce7;color:#166534">${n}</b><span class="rt"><b>Sesión ${n}</b><small>${c ? '🔒 Bloqueada por tu profe' : esc(temaDe(s, n))}</small></span>${lk(u.key, n)}${c ? '🔒' : t ? `${nivelChip(t)}<small>${t.score}/${t.total}</small>` : es ? '<span class="bt or" style="font-size:.75em">Responder ›</span>' : '🔒'}</button>`; }).join('')}` }];
      }
      const x = F.x;
      if (F.modo === 'preg') return x.qs.map((q, k) => {             // si trae un caso (texto y tabla), el caso va a la izquierda y la pregunta con sus opciones a la derecha
        const R = x.res[k], c = !!casoHtml(x.caso), fb = R != null ? `<p class="why ${R ? 'ok-msg' : 'no-msg'}">${R ? '✓ ¡Correcto!' : '✗ No era esa'}</p>${L(q.why) ? `<p class="why hand">💡 ${esc(q.why)}</p>` : ''}` : '';
        return {
          l: `<div class="crumb w">Sesión ${x.n} · Exit ticket${c ? ` · Pregunta ${k + 1} de ${x.qs.length}` : ''}</div>${c ? '' : `<h2 class="w">Pregunta ${k + 1} de ${x.qs.length}</h2>`}<div class="bar w"><i style="width:${k / x.qs.length * 100}%"></i></div>${c ? casoHtml(x.caso) + fb
            : `<p class="hand w" style="font-size:1.45em;margin-top:.5em">${esc(q.q)}</p>${fb || `<img class="moli w" src="${IMG('pensativa')}" alt="" style="width:3.6em">`}`}`,
          r: `${c ? `<p class="hand w" style="font-size:1.2em;margin:.2em 0 .4em">${esc(q.q)}</p>` : '<h2 class="w">Elige tu respuesta</h2>'}${q.ord.map((o, j) => { const sel = x.sel[k] === o.i, ok = o.i === q.answer;
              return `<button class="opt w${c ? ' chico' : ''}${R != null && ok ? ' ok' : R != null && sel && !ok ? ' no' : ''}" data-a="resp" data-k="${k}" data-o="${o.i}" ${R != null ? 'disabled' : ''}><i>${'ABCD'[j]}</i>${esc(o.t)}</button>`; }).join('')}
            ${R != null ? `<p class="center"><button class="bt gr" data-a="sig">${k + 1 < x.qs.length ? 'Siguiente ›' : 'Ver mi resultado ›'}</button></p>` : ''}` };
      });
      if (F.modo === 'fin') { const t = F.T[x.n] || x.guardado, v = t ? MD.nivel(t) : null, p = t ? Math.round(t.score / t.total * 100) : 0;
        return [{ l: `<div class="crumb w">Sesión ${x.n} · Exit ticket</div><h1 class="w">${p === 100 ? '¡Perfecto! 🏆' : p >= 80 ? '¡Muy bien! 🌟' : p >= 60 ? '¡Buen trabajo! 💪' : '¡Sigue practicando! 📚'}</h1>
            ${t ? `<div class="ring w" style="--p:${p};--c:${v.color === '#c9dafb' ? '#8fb2f5' : v.color}"><b>${t.score}/${t.total}</b></div><p class="center w">${nivelChip(t)} ${esc(v.name)}</p>` : `<p class="hand">${x.err ? '📶 No pude guardar. Revisa tu internet e inténtalo otra vez.' : 'Guardando…'}</p>`}
            <p class="hand w center">${x.err ? '' : 'Quedó guardado en tu portafolio y en tus notas. ✅'}</p>
            <p class="center">${x.err ? '<button class="bt or" data-a="reintentar">Guardar otra vez</button> ' : ''}<button class="bt" data-a="lista">‹ Mis Exit tickets</button></p>`,
          r: `<h2 class="w">🔎 Repasemos</h2>${x.qs.map((q, k) => `<div class="box w" style="padding:.35em .55em"><b>${x.res[k] ? '✅' : '❌'} ${esc(q.q)}</b><br><small>✓ ${esc((q.opts.find(o => o.i === q.answer) || {}).t || '')}</small></div>`).join('')}` }]; }
      if (F.modo === 'ver') { const t = F.T[F.vn], s = MD.sesionesDe(u).find(z => z.n === F.vn).s, qs = MD.preguntas(s);
        return [{ l: `<div class="crumb w">Sesión ${F.vn} · Exit ticket</div><h1 class="w">✅ Ya lo respondiste</h1><div class="ring w" style="--p:${Math.round(t.score / t.total * 100)}"><b>${t.score}/${t.total}</b></div><p class="center w">${nivelChip(t)} ${esc(MD.nivel(t).name)}</p>
            <p class="hand w center">${t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' }) : ''}</p><p class="center"><button class="bt" data-a="lista">‹ Mis Exit tickets</button></p>`,
          r: `<h2 class="w">🔎 Tus respuestas</h2>${qs.map((q, k) => `<div class="box w" style="padding:.35em .55em"><b>${(t.answers || [])[k] ? '✅' : '❌'} ${esc(q.q)}</b><br><small>✓ ${esc((q.opts.find(o => o.i === q.answer) || {}).t || '')}</small></div>`).join('')}` }]; }
      return [{ l: '', r: '' }];
    };
    const abrirUnidad = (u) => { F.u = u; F.T = null; F.modo = 'lista'; F.i = 0; F.pestana = '📚 Unidades'; MD.ticketsDe(u, F.me).then(T => { F.T = T; F.libro.pinta(true); }).catch(() => { F.T = {}; F.libro.pinta(true); }); };
    F.atras = () => { if (F.modo !== 'lista') { F.modo = 'lista'; F.i = 0; } else if (F.u) { F.u = null; F.i = 0; F.pestana = null; } };
    F.alTab = () => F.libro.pasar(-1, () => { F.u = null; F.i = 0; F.modo = 'lista'; F.pestana = null; });
    F.act = (a, ds, el) => {
      if (a === 'entrar') return entrarCon(F, el);
      if (a === 'unidad') return F.libro.pasar(1, () => abrirUnidad(MD.unidades().find(u => u.key === ds.k)));
      if (a === 'empezar') { const n = +ds.n, s = MD.sesionesDe(F.u).find(z => z.n === n).s;
        const qs = MD.preguntas(s).map(q => ({ ...q, ord: mezcla(q.opts) }));
        return F.libro.pasar(1, () => { F.x = { n, qs, res: [], sel: [], caso: s.ticket && s.ticket.caso }; F.modo = 'preg'; F.i = 0; }); }
      if (a === 'resp') { const k = +ds.k, o = +ds.o, q = F.x.qs[k]; if (F.x.res[k] != null) return;
        F.x.sel[k] = o; F.x.res[k] = o === q.answer; F.libro.pinta(false); return; }
      if (a === 'sig') { const k = F.i;
        if (k + 1 < F.x.qs.length) return F.libro.pasar(1, () => { F.i = k + 1; });
        return guardar(); }
      if (a === 'reintentar') return guardar();
      if (a === 'ver') return F.libro.pasar(1, () => { F.vn = +ds.n; F.modo = 'ver'; F.i = 0; });
      if (a === 'lista') return F.libro.pasar(-1, () => { F.modo = 'lista'; F.i = 0; });
    };
    F.alMover = () => {};
    async function guardar() {
      const x = F.x, u = F.u; x.err = false;
      F.libro.pasar(1, () => { F.modo = 'fin'; F.i = 0; });
      try { const t = await MD.guardarTicket(F.me, u, x.n, x.qs.map((q, k) => !!x.res[k])); F.T[x.n] = t; x.guardado = t; }
      catch (e) { x.err = true; }
      setTimeout(() => F.libro.pinta(false), 800);
    }
    // al responder no se puede pasar con las flechas (sólo con «Siguiente»)
    F.alPintar = (el) => { const bloq = F.modo === 'preg'; el.querySelector('.bk-nav').style.visibility = bloq ? 'hidden' : ''; };
    F.alEntrar = () => F.libro.pasar(1, () => { F.i = 0; });
    F.iniciar = () => MD.cargar().then(() => { F.listo = true; const d = tomarDestino('exit'), u = d && MD.unidades().find(x => x.key === d.u); if (u) abrirUnidad(u); F.libro.pinta(true); }).catch(() => { F.listo = true; F.libro.pinta(true); });
    return F;
  }

  // =================================================================
  //  3) MIS NOTAS (folder azul de la mesa del profesor) · registro automático
  // =================================================================
  function flujoNotas() {
    const F = { i: 0, u: null, listo: false, me: MD.yo(), T: null, P: null };
    const fila = (ic, ti, tx, v) => `<div class="box w" style="display:flex;align-items:center;gap:.5em"><div style="flex:1"><b>${ic} ${ti}</b><br><small class="hand" style="font-size:.95em">${tx}</small></div><div class="center">${v}</div></div>`;
    const sin = '<small class="hand">Aún sin nota</small>';
    const conducta = r => { const c = MD.CONDUCTA[MD.nivel(r).k]; return `<span style="font-size:1.5em">${c.f}</span><br><small>${c.name}</small>`; };
    F.hojas = () => {
      if (!F.listo) return [{ l: cargando('Abriendo tu folder de notas…'), r: '' }];
      if (!F.me) return [hojaEntrar('tus notas')];
      if (!F.u) return [hojaUnidades('Mis notas', '📂', 'Tus notas se registran solas: con tus Exit tickets y lo que tu profe anota en clase. 📝', F.me)];
      if (!F.T) return [{ l: cargando('Revisando tus notas…'), r: '' }];
      const u = F.u, T = F.T, S = MD.sesionesDe(u), Ms = MD.misionesDe(u.key);
      const pags = S.map(({ s, n }) => { const r = T[n], pa = T[MD.PART + n], co = T[MD.COND + n], tw = T[MD.TRAB + n], m = Ms.find(x => x.ses.n === n), mok = m && MD.misionCompleta(m, F.P || {});
        return `<div class="crumb w">${esc(u.icon || '📘')} Unidad ${esc(u.num)} · Sesión ${n}</div><h2 class="w">${esc(temaDe(s, n))}</h2>
          ${fila('🎟️', 'Exit ticket', 'Cuánto lograste la meta de hoy.', r ? `${nivelChip(r)}<br><small>${r.score}/${r.total}</small>` : sin)}
          ${fila('🛠️', 'Trabajo en clase', 'Lo que hiciste con tu equipo en la sesión (rúbrica).', tw ? `${nivelChip(tw)}<br><small>${esc(MD.nivel(tw).name)}</small>` : sin)}
          ${fila('🙋', 'Participación', 'Preguntar, responder, explicar y ayudar (1 a +4).', pa ? `<span class="lv" style="background:#e0f2fe;color:#075985">${MD.partic(pa) === 4 ? '+4' : MD.partic(pa)}</span>` : sin)}
          ${fila('🤝', 'Conducta', 'Cómo viviste las normas del aula.', co ? conducta(co) : sin)}
          ${(rv => m || rv ? fila('💪', 'Refuerzo', 'La misión de esta sesión.', (rv ? rv === 'ok' : mok) ? '<span class="lv" style="background:#bbf7d0;color:#166534">✓</span><br><small>Realizado</small>' : '<small class="hand">Pendiente</small>') : '')((F.RM || {})[n])}`; });
      const ex = S.map(({ n }) => T[n]).filter(Boolean), eg = MD.promedio(ex), pq = S.reduce((a, { n }) => a + MD.partic(T[MD.PART + n]), 0), cf = MD.promedio(S.map(({ n }) => T[MD.COND + n]));
      const G = r => r ? `${nivelChip(r)}<br><small>${esc(MD.nivel(r).name)}</small>` : sin;
      pags.push(`<div class="crumb w">${esc(u.icon || '📘')} Unidad ${esc(u.num)} · ${esc(u.title)}</div><h2 class="w">🏁 Resumen de la unidad</h2>
        ${fila('🏆', 'Producto o evaluación · 50%', 'El trabajo final: la mitad de tu nota.', G(T[MD.PROD]))}
        <p class="w"><b>El otro 50% sale de:</b></p>
        ${fila('📓', 'Cuaderno', 'Tus apuntes y tareas.', G(T[MD.CUAD]))}
        ${fila('🎟️', 'Exit tickets', 'El promedio de tus Exit tickets.', eg ? G(eg) : sin)}
        ${(tg => fila('🛠️', 'Trabajo en clase', 'El promedio de tu trabajo en equipo.', tg ? G(tg) : sin))(MD.promedio(S.map(({ n }) => T[MD.TRAB + n]).filter(Boolean)))}
        ${fila('🙋', 'Participación', 'Todas tus participaciones.', pq ? `<span class="lv" style="background:#e0f2fe;color:#075985">${pq}</span>` : sin)}
        ${cf ? fila('🤝', 'Conducta de la unidad', 'Cómo viviste las normas en la unidad.', conducta(cf)) : ''}`);
      const H = [{ l: `<img class="moli w" src="${IMG('orgullosa')}" alt=""><div class="crumb w">${esc(F.me.name)} · ${MD.espInfo().gn} ${esc(F.me.section)}</div><h1 class="w">📂 Mis notas</h1><h2 class="w">${esc(u.icon || '📘')} Unidad ${esc(u.num)}: ${esc(u.title)}</h2>
          <p class="hand w">Se llenan solas: tu Exit ticket al responderlo y lo que tu profe registra en clase.</p>
          <div class="box w"><small><b>🎟️ Exit ticket por sesión</b></small><br>${S.map(({ n }) => `<span title="Sesión ${n}" style="display:inline-flex;flex-direction:column;align-items:center;margin:.15em;font-size:.8em;color:#64748b">S${n}${T[n] ? nivelChip(T[n]) : '<span class="lv" style="background:#f1f5f9;color:#94a3b8">–</span>'}</span>`).join('')}</div>`, r: pags[0] || '' }];
      for (let k = 1; k < pags.length; k += 2) H.push({ l: pags[k], r: pags[k + 1] || `<p class="hand w" style="margin-top:40%">📂 Fin de tu folder de notas.</p>` });
      return H;
    };
    F.atras = () => { if (F.u) { F.u = null; F.i = 0; F.pestana = null; } };
    F.alTab = () => F.libro.pasar(-1, () => { F.u = null; F.i = 0; F.pestana = null; });
    F.act = (a, ds, el) => {
      if (a === 'entrar') return entrarCon(F, el);
      if (a === 'unidad') return F.libro.pasar(1, () => { const u = MD.unidades().find(x => x.key === ds.k); F.u = u; F.T = null; F.i = 0; F.pestana = '📚 Unidades';
        Promise.all([MD.ticketsDe(u, F.me), MD.cargarMisiones().then(() => MD.avance(F.me)), MD.refuerzoManual(u.key)]).then(([T, P, RM]) => { F.T = T; F.P = P; F.RM = (RM || {})[F.me.key] || {}; F.libro.pinta(true); }).catch(() => { F.T = {}; F.libro.pinta(true); }); });
    };
    F.alEntrar = () => F.libro.pasar(1, () => { F.i = 0; });
    F.iniciar = () => MD.cargar().then(() => { F.listo = true; F.libro.pinta(true); }).catch(() => { F.listo = true; F.libro.pinta(true); });
    return F;
  }

  // =================================================================
  //  4) MIS MISIONES DE REFUERZO (cuaderno verde de la mesa del profesor)
  // =================================================================
  const NIVELES = { ws: 'Recordar', scr: 'Recordar', match: 'Comprender', tf: 'Comprender', fill: 'Comprender', mc: 'Aplicar', sent: 'Aplicar', sort: 'Analizar', order: 'Analizar' };
  const QUE = { ws: 'Encuentra las palabras: toca la primera letra y luego la última.', scr: 'Ordena las letras para formar la palabra.', match: 'Une cada palabra con su pareja.', tf: '¿Verdadero o falso?',
    fill: 'Completa el texto con las palabras correctas.', mc: 'Elige la respuesta correcta.', sent: 'Ordena las palabras para formar la oración.', sort: 'Clasifica cada palabra en su grupo.', order: 'Ordena los pasos.' };
  const COLW = ['#bbf7d0', '#bfdbfe', '#fde68a', '#fbcfe8', '#ddd6fe', '#fed7aa', '#a5f3fc', '#d9f99d'];
  function sopa(words) {
    const W = words.map(w => String(w).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-ZÑ]/g, '')).filter(w => w.length > 1);
    const n = Math.min(12, Math.max(8, ...W.map(w => w.length + 1))), g = Array.from({ length: n }, () => Array(n).fill('')), pos = [], D = [[0, 1], [1, 0], [1, 1], [-1, 1]];
    W.forEach(w => { if (w.length > n) return; for (let t = 0; t < 300; t++) { const d = D[Math.floor(Math.random() * D.length)], r = Math.floor(Math.random() * n), c = Math.floor(Math.random() * n), er = r + d[0] * (w.length - 1), ec = c + d[1] * (w.length - 1);
      if (er < 0 || er >= n || ec < 0 || ec >= n) continue; let ok = true; for (let k = 0; k < w.length; k++) { const x = g[r + d[0] * k][c + d[1] * k]; if (x && x !== w[k]) { ok = false; break; } }
      if (!ok) continue; for (let k = 0; k < w.length; k++) g[r + d[0] * k][c + d[1] * k] = w[k]; pos.push({ w, r, c, d }); return; } });
    const AB = 'ABCDEFGHIJLMNOPRSTUV'; g.forEach(row => row.forEach((x, c) => { if (!x) row[c] = AB[Math.floor(Math.random() * AB.length)]; }));
    return { g, n, pos, words: pos.map(p => p.w) };
  }
  function estadoAct(x) {                                                // cómo empieza cada actividad
    const E = { err: 0, step: 0, hecho: false, msg: '' };
    if (x.ty === 'tf' || x.ty === 'mc') E.res = [];
    if (x.ty === 'fill') { E.bank = mezcla([...x.w.map((t, i) => ({ t, i })), ...(x.x || []).map(t => ({ t, i: -1 }))]); E.puestos = []; }
    if (x.ty === 'match') { E.der = mezcla(x.p.map((p, i) => ({ t: p[1], i }))); E.ok = []; E.sel = null; }
    if (x.ty === 'order') { E.pool = mezcla(x.it.map((t, i) => ({ t, i }))); E.seq = []; }
    if (x.ty === 'sort') { E.items = mezcla(x.it.map((p, i) => ({ t: p[0], g: p[1], i }))); }
    if (x.ty === 'sent' || x.ty === 'scr') E.prep = () => { const src = x.ty === 'sent' ? x.ss[E.step] : String(x.w[E.step][0]).toUpperCase(); E.parts = x.ty === 'sent' ? src.split(/\s+/) : [...src]; E.pool = mezcla(E.parts.map((t, i) => ({ t, i }))); E.seq = []; };
    if (E.prep) E.prep();
    if (x.ty === 'ws') { E.s = sopa(x.w); E.found = []; E.a = null; }
    return E;
  }
  function vistaAct(x, E) {                                              // lo que se ve en la hoja derecha
    const t = x.ty;
    if (E.hecho) return `<div class="center" style="margin-top:12%"><div class="ico w">🌟</div><h2 class="w">¡Actividad completada!</h2><p class="hand w">${E.err === 0 ? '¡Sin errores! Eres un crack 🏆' : `Con ${E.err} ${E.err === 1 ? 'error' : 'errores'}. ¡Bien hecho! 💪`}</p><button class="bt gr w" data-a="sigact">Siguiente ›</button></div>`;
    if (t === 'tf' || t === 'mc') {
      const qs = x.qs, k = E.step, q = qs[k], R = E.res[k];
      if (t === 'tf') return `<p class="crumb">${k + 1} de ${qs.length}</p><p class="hand" style="font-size:1.3em">${esc(q[0])}</p>
        ${[true, false].map(v => `<button class="opt${R != null && v === q[1] ? ' ok' : R != null && E.sel === v && v !== q[1] ? ' no' : ''}" data-a="tf" data-v="${v ? 1 : 0}" ${R != null ? 'disabled' : ''}><i>${v ? 'V' : 'F'}</i>${v ? 'Verdadero' : 'Falso'}</button>`).join('')}
        ${R != null ? `${q[2] ? `<p class="why hand">💡 ${esc(q[2])}</p>` : ''}<p class="center"><button class="bt gr" data-a="paso">Siguiente ›</button></p>` : ''}`;
      const ops = E.ord || (E.ord = q.o.map((o, i) => ({ t: String(o).split(' // ')[0], why: String(o).split(' // ')[1] || '', i })));
      return `<p class="crumb">${k + 1} de ${qs.length}</p><p class="hand" style="font-size:1.25em">${esc(q.q)}</p>
        ${ops.map((o, j) => `<button class="opt${R != null && o.i === q.a ? ' ok' : R != null && E.sel === o.i && o.i !== q.a ? ' no' : ''}" data-a="mc" data-v="${o.i}" ${R != null ? 'disabled' : ''}><i>${'ABCD'[j]}</i>${esc(o.t)}</button>`).join('')}
        ${R != null ? `${(ops.find(o => o.i === q.a) || {}).why || q.why ? `<p class="why hand">💡 ${esc((ops.find(o => o.i === q.a) || {}).why || q.why)}</p>` : ''}<p class="center"><button class="bt gr" data-a="paso">Siguiente ›</button></p>` : ''}`;
    }
    if (t === 'fill') { let b = 0; const cur = E.puestos.length;
      return `<p class="hand" style="font-size:1.15em">${x.tx.map(p => /^\{\d+\}$/.test(p) ? (() => { const k = b++; return `<span class="blank${k === cur ? ' cur' : ''}">${E.puestos[k] != null ? esc(x.w[k]) : '&nbsp;'}</span>`; })() : esc(p)).join('')}</p>
        <div class="bank">${E.bank.map((o, j) => `<button data-a="fill" data-j="${j}" class="${o.usado ? 'ok' : o.mal ? 'no' : ''}" ${o.usado ? 'disabled' : ''}>${esc(o.t)}</button>`).join('')}</div>`; }
    if (t === 'match') return `<div class="cols"><div>${x.p.map((p, i) => `<button class="tile${E.ok.includes(i) ? ' ok' : E.sel === i ? ' sel' : ''}" data-a="mi" data-i="${i}" ${E.ok.includes(i) ? 'disabled' : ''}>${esc(p[0])}</button>`).join('')}</div>
        <div>${E.der.map(o => `<button class="tile${E.ok.includes(o.i) ? ' ok' : E.mal === o.i ? ' no' : ''}" data-a="md" data-i="${o.i}" ${E.ok.includes(o.i) ? 'disabled' : ''}>${esc(o.t)}</button>`).join('')}</div></div>`;
    if (t === 'order') return `<div class="build">${E.seq.map(i => `<span>${E.seq.indexOf(i) + 1}. ${esc(x.it[i])}</span>`).join('')}</div>
        <div class="bank" style="flex-direction:column">${E.pool.filter(o => !E.seq.includes(o.i)).map(o => `<button data-a="ord" data-i="${o.i}" class="${E.mal === o.i ? 'no' : ''}" style="text-align:left">${esc(o.t)}</button>`).join('')}</div>`;
    if (t === 'sort') { const it = E.items[E.step];
      return `<p class="crumb">${E.step + 1} de ${E.items.length}</p><div class="center"><span class="tile sel" style="font-size:1.3em;display:inline-block">${esc(it.t)}</span></div>
        <div class="cols" style="margin-top:.6em">${x.g.map((g, gi) => `<button class="tile${E.mal === gi ? ' no' : ''}" data-a="srt" data-g="${gi}" style="text-align:center">📦 ${esc(g)}</button>`).join('')}</div>`; }
    if (t === 'sent' || t === 'scr') { const n = t === 'scr' ? x.w.length : x.ss.length;
      return `<p class="crumb">${E.step + 1} de ${n}${t === 'scr' && x.w[E.step][1] ? ' · Pista: ' + esc(x.w[E.step][1]) : ''}</p><div class="build">${E.seq.map(i => `<span>${esc(E.parts[i])}</span>`).join('')}</div>
        <div class="bank">${E.pool.filter(o => !E.seq.includes(o.i)).map(o => `<button data-a="bld" data-i="${o.i}" class="${E.mal === o.i ? 'no' : ''}">${esc(o.t)}</button>`).join('')}</div>`; }
    if (t === 'ws') { const S = E.s, en = (r, c) => { let k = -1; E.found.forEach((w, j) => { const p = S.pos.find(z => z.w === w); for (let q = 0; q < w.length; q++) if (p.r + p.d[0] * q === r && p.c + p.d[1] * q === c) k = j; }); return k; };
      return `<div class="words">${S.words.map(w => `<span class="${E.found.includes(w) ? 'ok' : ''}">${esc(w)}</span>`).join('')}</div>
        <div class="grid" style="grid-template-columns:repeat(${S.n},1fr)">${S.g.map((row, r) => row.map((ch, c) => { const k = en(r, c); return `<button data-a="ws" data-r="${r}" data-c="${c}" class="${k >= 0 ? 'ok' : E.a && E.a[0] === r && E.a[1] === c ? 'sel' : ''}" ${k >= 0 ? `style="--wc:${COLW[k % COLW.length]}"` : ''}>${ch}</button>`; }).join('')).join('')}</div>`; }
    return '<p>Actividad no disponible.</p>';
  }
  function flujoMisiones() {
    const F = { i: 0, u: null, listo: false, me: MD.yo(), P: {}, m: null, modo: 'lista' };
    F.hojas = () => {
      if (!F.listo) return [{ l: cargando('Abriendo tu cuaderno de misiones…'), r: '' }];
      if (!F.u) return [hojaUnidades('Mis misiones de refuerzo', '💪', 'Juega las misiones de cada sesión para recordar mejor lo que aprendiste. 🎮', F.me)];
      const u = F.u, Ms = MD.misionesDe(u.key);
      if (F.modo === 'lista') { const hechas = Ms.filter(m => MD.misionCompleta(m, F.P)).length;
        return [{ l: `<img class="moli w" src="${IMG('salta')}" alt=""><div class="crumb w">${esc(u.icon || '📘')} Unidad ${esc(u.num)} · ${esc(u.title)}</div><h1 class="w">💪 Mis misiones</h1><p class="hand w">${hechas} de ${Ms.length} misiones completas.</p><div class="bar w"><i style="width:${Ms.length ? hechas / Ms.length * 100 : 0}%"></i></div>
            ${F.me ? '' : '<p class="hand w">💡 Entra con tu DNI en tu portafolio para guardar tu avance en tu cuenta.</p>'}`,
          r: `<h2 class="w">🗺️ Misiones</h2>${Ms.length ? Ms.map((m, k) => { const n = m.acts.filter(a => F.P[a.id]).length, c = cerrado(u.key, m.ses.n);
              return `<button class="row w${c ? ' off' : ''}" ${c ? 'disabled' : `data-a="mision" data-k="${k}"`}><b class="lv" style="background:${n === m.acts.length ? '#bbf7d0' : '#fef3c7'};color:#2b2547">${n === m.acts.length ? '✓' : k + 1}</b><span class="rt"><b>${esc(m.t)}</b><small>Sesión ${m.ses.n} · ${c ? '🔒 Bloqueada por tu profe' : n + '/' + m.acts.length + ' actividades'}</small></span>${lk(u.key, m.ses.n)}${c ? '🔒' : '›'}</button>`; }).join('') : '<p class="hand w">Tu profe aún no crea misiones para esta unidad.</p>'}` }];
      }
      const m = F.m;
      if (F.modo === 'fin') return [{ l: `<div class="center"><div class="ico w" style="font-size:4em">🏆</div><h1 class="w">¡Misión completa!</h1><p class="hand w">${esc(m.t)}</p></div>`,
        r: `<img class="moli w" src="${IMG('genial')}" alt="" style="float:none;display:block;margin:10% auto .5em;width:6em"><p class="hand w center">¡Lo lograste! Tu avance quedó guardado. 💾</p><p class="center"><button class="bt w" data-a="volver">‹ Mis misiones</button></p>` }];
      const x = m.acts[F.ai], E = F.E;
      return [{ l: `<div class="crumb w">${esc(m.t)} · ${F.ai + 1} de ${m.acts.length}</div><span class="chip w">${NIVELES[x.ty] || ''}</span><h2 class="w">${esc(x.t || '')}</h2>${L(x.tp) ? `<p class="hand w">📌 ${esc(x.tp)}</p>` : ''}
          <div class="box tip w">${QUE[x.ty] || ''}</div><div class="bar w"><i style="width:${F.ai / m.acts.length * 100}%"></i></div>${E.msg ? `<p class="why ${E.msgOk ? 'ok-msg' : 'no-msg'}">${E.msg}</p>` : ''}`,
        r: vistaAct(x, E) }];
    };
    const empezarAct = () => { F.E = estadoAct(F.m.acts[F.ai]); };
    const terminar = () => { const x = F.m.acts[F.ai]; F.E.hecho = true; MD.marcarActividad(F.me, x.id, F.E.err); F.P[x.id] = { err: F.E.err }; };
    const fallo = (k) => { F.E.err++; F.E.mal = k; F.E.msg = '¡Ups! Inténtalo otra vez 💪'; F.E.msgOk = false; F.libro.pinta(false); setTimeout(() => { F.E.mal = null; F.libro.pinta(false); }, 450); };
    const bien = (txt) => { F.E.msg = txt || '¡Bien! ✓'; F.E.msgOk = true; };
    F.atras = () => { if (F.modo !== 'lista') { F.modo = 'lista'; F.i = 0; } else if (F.u) { F.u = null; F.i = 0; F.pestana = null; } };
    F.alTab = () => F.libro.pasar(-1, () => { F.u = null; F.i = 0; F.modo = 'lista'; F.pestana = null; });
    F.alPintar = (el) => { el.querySelector('.bk-nav').style.visibility = F.modo === 'act' ? 'hidden' : ''; };
    F.act = (a, ds, el) => {
      const E = F.E, x = F.m && F.m.acts[F.ai];
      if (a === 'unidad') return F.libro.pasar(1, () => { F.u = MD.unidades().find(u => u.key === ds.k); F.modo = 'lista'; F.i = 0; F.pestana = '📚 Unidades'; });
      if (a === 'mision') return F.libro.pasar(1, () => { F.m = MD.misionesDe(F.u.key)[+ds.k]; F.ai = Math.max(0, F.m.acts.findIndex(z => !F.P[z.id])); F.modo = 'act'; F.i = 0; empezarAct(); });
      if (a === 'volver') return F.libro.pasar(-1, () => { F.modo = 'lista'; F.i = 0; });
      if (a === 'sigact') return F.libro.pasar(1, () => { F.ai++; if (F.ai >= F.m.acts.length) F.modo = 'fin'; else empezarAct(); });
      if (!E || E.hecho) return;
      E.msg = '';
      if (a === 'tf' || a === 'mc') { const q = x.qs[E.step], v = a === 'tf' ? ds.v === '1' : +ds.v, ok = a === 'tf' ? v === q[1] : v === q.a;
        E.sel = v; E.res[E.step] = ok; if (!ok) E.err++; ok ? bien('✓ ¡Correcto!') : (E.msg = '✗ Esa no era', E.msgOk = false); return F.libro.pinta(false); }
      if (a === 'paso') { E.step++; E.sel = null; E.ord = null; E.msg = ''; if (E.step >= x.qs.length) terminar(); return F.libro.pasar(1, () => {}); }
      if (a === 'fill') { const o = E.bank[+ds.j], k = E.puestos.length; if (o.i === k) { o.usado = true; E.puestos.push(k); bien(); if (E.puestos.length >= x.w.length) terminar(); return F.libro.pinta(false); }
        o.mal = true; F.E.err++; E.msg = '¡Ups! Esa no va ahí 💪'; F.libro.pinta(false); return setTimeout(() => { o.mal = false; F.libro.pinta(false); }, 450); }
      if (a === 'mi') { E.sel = +ds.i; return F.libro.pinta(false); }
      if (a === 'md') { if (E.sel == null) { E.msg = 'Primero toca una palabra de la izquierda 👈'; E.msgOk = false; return F.libro.pinta(false); }
        if (+ds.i === E.sel) { E.ok.push(E.sel); E.sel = null; bien(); if (E.ok.length >= x.p.length) terminar(); return F.libro.pinta(false); } return fallo(+ds.i); }
      if (a === 'ord') { const i = +ds.i; if (i === E.seq.length) { E.seq.push(i); bien(); if (E.seq.length >= x.it.length) terminar(); return F.libro.pinta(false); } return fallo(i); }
      if (a === 'srt') { const g = +ds.g, it = E.items[E.step]; if (g === it.g) { E.step++; bien(); if (E.step >= E.items.length) terminar(); return F.libro.pinta(false); } return fallo(g); }
      if (a === 'bld') { const i = +ds.i, want = E.parts[E.seq.length];
        if (E.parts[i] === want) { E.seq.push(i); if (E.seq.length >= E.parts.length) { E.step++; bien('✓ ¡Muy bien!'); const n = x.ty === 'scr' ? x.w.length : x.ss.length; if (E.step >= n) terminar(); else E.prep(); } return F.libro.pinta(false); } return fallo(i); }
      if (a === 'ws') { const r = +ds.r, c = +ds.c;
        if (!E.a) { E.a = [r, c]; return F.libro.pinta(false); }
        const [r0, c0] = E.a; E.a = null; const dr = Math.sign(r - r0), dc = Math.sign(c - c0), len = Math.max(Math.abs(r - r0), Math.abs(c - c0)) + 1;
        if ((r - r0 !== 0 && c - c0 !== 0 && Math.abs(r - r0) !== Math.abs(c - c0)) || len < 2) return F.libro.pinta(false);
        let w = ''; for (let k = 0; k < len; k++) w += E.s.g[r0 + dr * k][c0 + dc * k];
        const hit = E.s.words.find(z => !E.found.includes(z) && (z === w || z === [...w].reverse().join('')));
        if (hit) { const p = E.s.pos.find(z => z.w === hit); if (!(p.r === r0 && p.c === c0) && !(p.r === r && p.c === c)) { /* misma palabra leída desde otro lado */ }
          E.found.push(hit); bien('✓ ¡Encontraste ' + hit + '!'); if (E.found.length >= E.s.words.length) terminar(); return F.libro.pinta(false); }
        E.err++; E.msg = 'Esa no es una de las palabras 🔎'; E.msgOk = false; return F.libro.pinta(false); }
    };
    F.iniciar = () => Promise.all([MD.cargar(), MD.cargarMisiones()]).then(() => MD.avance(F.me)).then(P => { F.P = P; F.listo = true; const d = tomarDestino('ref'), u = d && MD.unidades().find(x => x.key === d.u); if (u) { F.u = u; F.modo = 'lista'; F.pestana = '📚 Unidades'; } F.libro.pinta(true); }).catch(() => { F.listo = true; F.libro.pinta(true); });
    return F;
  }

  // =================================================================
  //  5) MI PRESENTACIÓN (modo Canva, en el proyector)
  // =================================================================
  const CV_K = { uni: ['📘', 'Unidad'], ses: ['🗓️', 'Sesión'], meta: ['🎯', 'Meta y criterios'], rol: ['👥', 'Roles'], acu: ['🤝', 'Acuerdos'], act: ['🧪', 'Actividad'], exit: ['🎟️', 'Exit ticket'], mq: ['🤖', 'Molí pregunta'], aq: ['🤖', 'Molí pregunta'], exa: ['✅', 'Respuestas'], sync: ['🚩', 'Molí nos sincroniza'], voc: ['📖', 'Palabra nueva'], sab: ['💡', '¿Sabías que?'], ref: ['🪞', 'Reflexión'] };
  const CV_BG = { reto: ['#0b2e4f', '#0a6aa1'], meta: ['#2563eb', '#38bdf8'], rol: ['#7c3aed', '#c084fc'], acu: ['#0d9488', '#34d399'], act: ['#ea580c', '#facc15'], exit: ['#db2777', '#f472b6'], mq: ['#4338ca', '#0ea5e9'], aq: ['#0e7490', '#a855f7'], exa: ['#be185d', '#f472b6'], voc: ['#0f766e', '#22d3ee'], sab: ['#c2410c', '#facc15'], ref: ['#4338ca', '#22d3ee'] };
  const CV_PAL = [['#7c3aed', '#06b6d4'], ['#0ea5e9', '#22c55e'], ['#f97316', '#ec4899'], ['#2563eb', '#8b5cf6'], ['#14b8a6', '#6366f1'], ['#e11d48', '#f59e0b']];
  const CV_ROL = [['🎤', 'SPEAKER', 'Presenta y habla por el equipo'], ['🧰', 'HELPER', 'Trae y organiza los materiales'], ['⏱️', 'TIMER', 'Cuida el tiempo del equipo'], ['🎨', 'DESIGNER', 'Hace que el trabajo se vea bonito y ordenado']];
  const CV_ACU = [['✋', 'Levantar la mano para participar'], ['🤫', 'No conversamos en clase'], ['🪑', 'Nos quedamos en nuestro sitio']];
  // ---- lo que devuelve la IA de Molí se revisa antes de mostrarlo: nada de «borradores», inglés o textos pegados ----
  const RARO = /\b(let'?s|json|string|valid|wait|standard|make it|output|field|error|->)\b|[{}<>\[\]|\\]|\b[pdesw]\s*:/i;
  const limpio = (t, max) => { t = String(t == null ? '' : t).replace(/\s+/g, ' ').trim(); return t && t.length <= max && !RARO.test(t) ? t : ''; };
  const palabraOk = p => { p = limpio(p, 32); return p && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ\- ]*$/.test(p) && p.split(' ').length <= 3 && !/[a-záéíóúñ][A-ZÁÉÍÓÚÑ]/.test(p) ? p : ''; };
  function limpiarIA(R) {
    if (!R || typeof R !== 'object' || R._fallo) return R;
    const o = { ...R }, Q = a => (Array.isArray(a) ? a : []).map(x => limpio(x, 160)).filter(x => x && /\?\s*$/.test(x)).slice(0, 3);
    o.t = limpio(R.t, 60); o.s = limpio(R.s, 260); ['r', 'a1', 'a2', 'a3'].forEach(k => { o[k] = Q(R[k]); });
    const w = R.w || {}, p = palabraOk(w.p), d = limpio(w.d, 220);
    o.w = p && d ? { p, d, e: limpio(w.e, 180) } : null;                 // si la palabra nueva salió rara, esa diapositiva no se muestra
    return o;
  }
  const cacheIA = k => { const C = MD.LS.get(k, null); return C ? limpiarIA(C) : null; };
  const hashQ = it => { const t = JSON.stringify([it.u.title, it.s.title, it.s.meta, actsDe(it.u, it.s).slice(0, 3).map(x => x && [x.title, x.desc]), it.prev && [it.prev.s.title, it.prev.s.meta]]); let h = 5381; for (let i = 0; i < t.length; i++) h = (h * 33 ^ t.charCodeAt(i)) >>> 0; return 'moli2:cv:' + h.toString(36); };
  // ---- 🎬 diapositivas de video que la docente añade entre las demás (botón + al pasar el mouse). Se guardan en files/fcvvid-0 ----
  const CVF = MD.fid('fcvvid'), CVV = { L: [], ok: false };
  const CVURL = () => `https://firestore.googleapis.com/v1/projects/${MD.FB.projectId}/databases/(default)/documents/files/${CVF}?key=${MD.FB.apiKey}`;
  const cargarVideos = () => fetch(CVURL(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => { const v = j && j.fields && j.fields.b64 && j.fields.b64.stringValue;
    if (v) { const x = JSON.parse(decodeURIComponent(escape(atob(v)))); CVV.L = Array.isArray(x.L) ? x.L : []; } CVV.ok = true; }).catch(() => { CVV.ok = true; });
  async function guardarVideos(L) {
    if (!window.Docente || !await Docente.token()) throw new Error('AUTH');
    await Docente.commit([{ update: { name: Docente.DOC('files', CVF), fields: Docente.toF({ b64: btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, L, at: Date.now() })))), updatedAt: new Date() }) } }]);
    CVV.L = L;
  }
  function medioDe(url) {                                              // YouTube, Google Drive, Vimeo o un archivo .mp4: se ve dentro de la diapositiva
    const u = String(url || '').trim(), yt = u.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/)([\w-]{11})/), t = u.match(/[?&](?:t|start)=(\d+)/);
    if (yt) return { tipo: 'yt', id: yt[1], src: `https://www.youtube-nocookie.com/embed/${yt[1]}?enablejsapi=1&rel=0&modestbranding=1${t ? '&start=' + t[1] : ''}`, img: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg` };
    const dr = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]{20,})/); if (dr) return { tipo: 'if', src: `https://drive.google.com/file/d/${dr[1]}/preview` };
    const vi = u.match(/vimeo\.com\/(?:video\/)?(\d{6,})/); if (vi) return { tipo: 'if', src: `https://player.vimeo.com/video/${vi[1]}` };
    if (/^https:\/\/\S+\.(mp4|webm|ogg)(\?\S*)?$/i.test(u)) return { tipo: 'mp4', src: u };
    return /^https?:\/\/\S+$/i.test(u) ? { tipo: 'link', src: u } : null;
  }
  const claveSl = it => it.k === 'vid' ? 'v:' + it.id : [it.k, it.u ? it.u.key : '', it.n == null ? '' : it.n, it.j == null ? '' : it.j, it.p || ''].join('|');
  // ---- 🟢 la rutina de la clase en bolitas, al costado izquierdo de la presentación: la docente toca cada una (mouse o cursor del mando) y se colorea ----
  const RUT = [['👋', 'Saludo', '#f59e0b', '#facc15'], ['🪑', 'Organización', '#7c3aed', '#c084fc'], ['🎯', 'Meta y criterios', '#2563eb', '#38bdf8'], ['🧪', 'Actividades de clase', '#ea580c', '#fb923c'], ['🪞', 'Reflexionamos', '#0d9488', '#34d399'], ['🎒', 'Organización final', '#db2777', '#f472b6']];
  function rutina(host) {
    const R = { el: null, k: '', n: 0, t: 0 }, hoy = () => new Date().toISOString().slice(0, 10);
    const ding = () => { try { const a = new Audio('audio/sync/ding.mp3'); a.volume = 0.6; a.play().catch(() => {}); } catch (e) {} };
    function pinta(pop) {
      if (!R.el) return; const B = R.el.querySelectorAll('.rt-b');
      B.forEach((b, i) => { b.classList.toggle('on', i < R.n); b.classList.toggle('sig', i === R.n); b.classList.toggle('pop', i === pop); });
      R.el.classList.toggle('fin', R.n >= RUT.length);
    }
    function guardar() { MD.LS.set('moli2:rutina', { k: R.k, d: hoy(), n: R.n }); }
    function sesion(k) {                                                // cada sesión tiene su rutina (empieza de cero cada día)
      if (!k || k === R.k) return; R.k = k; const G = MD.LS.get('moli2:rutina', null); R.n = G && G.k === k && G.d === hoy() ? +G.n || 0 : 0; pinta();
    }
    function ubicar() {                                                 // a la izquierda del cuadro de la presentación, de su mismo alto
      if (!R.el) return; const sh = host.closest('#sheet') || host, r = sh.getBoundingClientRect(), vis = r.width > 50 && getComputedStyle(sh).display !== 'none';
      R.el.style.display = vis ? '' : 'none'; if (!vis) return;
      const esp = r.left, w = Math.max(64, Math.min(118, esp - 12));
      Object.assign(R.el.style, { left: Math.max(4, (esp - w) / 2) + 'px', width: w + 'px', top: Math.max(4, r.top) + 'px', height: (Math.min(innerHeight - 4, r.bottom) - Math.max(4, r.top)) + 'px' });
    }
    R.montar = () => {
      R.el = document.createElement('nav'); R.el.id = 'rutina'; R.el.setAttribute('aria-label', 'Rutina de la clase');
      R.el.innerHTML = '<button type="button" class="rt-mas" data-rtmas title="Molí nos cuenta nuestra secuencia de clase" aria-label="Molí nos cuenta nuestra secuencia de clase">+</button>' + RUT.map(([ic, t, c1, c2], i) => `${i === 3 ? '<i class="rt-esp"></i>' : ''}<button type="button" class="rt-b" data-rt="${i}" style="--c1:${c1};--c2:${c2}" title="${esc(t)}"><span class="rt-o"><span class="rt-i">${ic}</span><span class="rt-ok">✓</span></span><small>${esc(t)}</small></button>`).join('') ;
      document.body.appendChild(R.el);
      R.el.addEventListener('click', e => { if (e.target.closest('[data-rtmas]')) { e.stopPropagation(); if (window.Guion) Guion.secuencia(R.el); return; }
        const b = e.target.closest('[data-rt]'); if (!b) return; e.stopPropagation(); const i = +b.dataset.rt;
        if (i < R.n) { if (i === R.n - 1) { R.n--; guardar(); pinta(); } return; }     // tocar la última coloreada la despinta (por si fue sin querer)
        R.n = i + 1; guardar(); pinta(i); ding(); if (R.n >= RUT.length) setTimeout(() => { const t = window.toast || window.aviso; t && t('🎉 ¡Rutina completa! ¡Excelente clase!', 3.5); }, 500); });
      R.el.addEventListener('pointerdown', e => e.stopPropagation()); R.el.addEventListener('pointerup', e => e.stopPropagation());
      ubicar(); R.t = setInterval(ubicar, 300); addEventListener('resize', ubicar);
    };
    R.quitar = () => { if (window.Guion) Guion.finSec(); clearInterval(R.t); removeEventListener('resize', ubicar); if (R.el) R.el.remove(); R.el = null; R.k = ''; };
    R.sesion = sesion; return R;
  }
  const GU = new Set(['rol', 'acu', 'sab', 'ref']);                  // diapositivas que Molí hace con su voz (guion.js)
  const sabDe = it => { const f = it.s && it.s.fx; return f && L(f.sb) ? f.sb : (cacheIA(hashQ(it)) || {}).s || ''; };   // el «¿Sabías que…?»: el de la ficha de la sesión o el que pensó Molí
  function flujoPresentacion(host) {
    const P = { L: [], i: 0, ia: {}, pide: new Set() }, RT = rutina(host);
    const actOk = x => x && (L(x.title) || L(x.desc));
    function armar() {
      const Lst = [];
      MD.unidades().forEach(u => {
        const ss = MD.sesionesDe(u).filter(({ s }) => L(s.title) || L(s.meta) || (s.activities || []).some(actOk));
        Lst.push({ k: 'uni', u, ss });
        ss.forEach(({ s, n }, q) => {
          const b = { u, s, n, prev: q ? ss[q - 1] : null }, C = cacheIA(hashQ(b)) || {}, SB = sabDe(b);
          Lst.push({ ...b, k: 'ses' }, { ...b, k: 'meta' }, { ...b, k: 'mq' });
          if (C.w && L(C.w.p)) Lst.push({ ...b, k: 'voc' });
          Lst.push({ ...b, k: 'rol' }, { ...b, k: 'acu' });
          const acts = actsDe(u, s).slice(0, 3), ok = acts.map((x, j) => actOk(x) ? j + 1 : 0).filter(Boolean), sj = ok.includes(2) ? 2 : ok[ok.length - 1];
          acts.forEach((x, j) => { if (!actOk(x)) return; Lst.push({ ...b, k: 'act', x, j: j + 1 }); if (x.en) Lst.push({ ...b, k: 'reto', x, j: j + 1, p: 'en' }, { ...b, k: 'reto', x, j: j + 1, p: x.pistas ? 'pis' : 'fig' }); Lst.push({ ...b, k: 'aq', x, j: j + 1 }); if (window.Sincro) Lst.push({ ...b, k: 'sync', x, j: j + 1 }); if (L(SB) && j + 1 === sj) Lst.push({ ...b, k: 'sab' }); });
          if (L(SB) && !sj) Lst.push({ ...b, k: 'sab' });
          Lst.push({ ...b, k: 'ref' }, { ...b, k: 'exit' }, { ...b, k: 'exa' });
        });
      });
      let pend = CVV.L.slice();                                         // los videos van justo después de la diapositiva que eligió la docente
      for (let vuelta = 0; pend.length && vuelta < 8; vuelta++) { const rest = [];
        pend.forEach(v => { const i = Lst.findIndex(z => claveSl(z) === v.a); if (i < 0) return rest.push(v);
          let j = i + 1; while (j < Lst.length && Lst[j].k === 'vid' && Lst[j].ancla === v.a) j++;
          const z = Lst[i]; Lst.splice(j, 0, { k: 'vid', id: v.id, t: v.t, url: v.url, ancla: v.a, u: z.u, s: z.s, n: z.n }); });
        pend = rest; }
      pend.forEach(v => { const z = Lst[Lst.length - 1] || {}; Lst.push({ k: 'vid', id: v.id, t: v.t, url: v.url, ancla: v.a, u: z.u, s: z.s, n: z.n }); });   // si su diapositiva ya no existe, va al final
      P.L = Lst;
    }
    const plantilla = it => { const u = it.u.title;
      if (it.k === 'aq') { const t = String(it.x.title || '').replace(/[¿?¡!«»"]/g, '').trim(); return [`¿Qué hicimos en la actividad ${it.j}${t ? `, «${t}»` : ''}?`, '¿Qué descubrimos o aprendimos con esta actividad?']; }
      if (!it.prev) return [`¿Qué crees que haremos en la unidad «${u}»?`, `¿Qué sabemos sobre ${u.charAt(0).toLowerCase() + u.slice(1)}?`];
      const p = String(temaDe(it.prev.s, it.prev.n)).replace(/[¿?¡!«»"]/g, '').trim(); return [`¿Qué hicimos en la sesión anterior${p ? `, «${p}»` : ''}?`, '¿Qué aprendimos la clase pasada?']; };
    async function pedirIA(it) {                                         // Molí piensa sus preguntas, la palabra nueva y el dato curioso (una vez por sesión)
      const k = hashQ(it); if (P.pide.has(k) || MD.LS.get(k, null)) return; P.pide.add(k);
      const s = it.s, acts = actsDe(it.u, s).slice(0, 3), A = { type: 'ARRAY', items: { type: 'STRING' } };
      const pr = `Eres Molí, un robot amigable que acompaña a una docente de Ciencia y Tecnología de ${MD.espInfo().txt} en Perú. Escribe preguntas que tú, Molí, harás en voz alta a las niñas y niños en una diapositiva gigante. Cada pregunta: corta (máximo 14 palabras), clara, abierta, en primera persona del plural («¿Qué observamos…?»), sin la respuesta dentro, con signos ¿?.
Unidad ${it.u.num}: «${it.u.title}».
Sesión ${it.n}: «${s.title || ''}». Meta: «${s.meta || ''}».
Criterios de éxito: ${(s.criteria || []).filter(L).map((c, i) => `${i + 1}) ${c}`).join(' | ') || '(no hay)'}.
${it.prev ? `Sesión anterior (${it.prev.n}): «${it.prev.s.title || ''}». Meta anterior: «${it.prev.s.meta || ''}».` : 'Es la PRIMERA sesión de la unidad.'}
Actividades de hoy:
${acts.map((x, j) => x && (L(x.title) || L(x.desc)) ? `${j + 1}) «${x.title || ''}»: ${x.desc || ''}` : `${j + 1}) (no hay)`).join('\n')}
Devuelve JSON:
- "t": el TEMA de esta sesión como título corto y atractivo (2 a 6 palabras, sin punto final), sacado de la meta y las actividades.
- "w": una PALABRA NUEVA importante de esta sesión que los niños quizá no conozcan: "p" la palabra, "d" qué significa con palabras sencillas (máximo 22 palabras), "e" un ejemplo corto de la vida diaria.
- "s": un dato curioso REAL y conocido sobre el tema de la sesión, apto para niños, que empiece en minúscula para completar «¿Sabías que…?» (máximo 30 palabras, sin inventar cifras).
- "c": 3 números, uno por actividad: el número del criterio de éxito que se EVIDENCIA en lo que los niños hacen o producen en esa actividad (0 si no hay actividad).
- "r": 2 preguntas para empezar. ${it.prev ? 'Que recuerden qué hicieron y qué aprendieron en la sesión anterior.' : 'Que digan qué creen que haremos en esta unidad y qué saben ya sobre el tema de la unidad.'}
- "a1", "a2", "a3": 2 preguntas cada una para DESPUÉS de esa actividad, sobre lo que hicieron, observaron o descubrieron en ella (si la actividad no existe, lista vacía).`;
      try {
        const R = await MD.pensar(pr, { type: 'OBJECT', properties: { t: { type: 'STRING' }, w: { type: 'OBJECT', properties: { p: { type: 'STRING' }, d: { type: 'STRING' }, e: { type: 'STRING' } } }, s: { type: 'STRING' }, c: { type: 'ARRAY', items: { type: 'INTEGER' } }, r: A, a1: A, a2: A, a3: A }, required: ['t', 'r', 'a1', 'a2', 'a3'] });
        MD.LS.set(k, limpiarIA(R)); const cur = P.L[P.i]; armar(); if (cur) P.i = Math.max(0, P.L.findIndex(z => z.k === cur.k && z.u === cur.u && z.n === cur.n && z.j === cur.j)); pinta(false);
      } catch (e) { MD.LS.set(k, { _fallo: Date.now() }); pinta(false); }
    }
    // ---- 🚩 «Molí nos sincroniza»: una pregunta por actividad con 2 respuestas (izquierda / derecha), que Molí piensa según la sesión ----
    const SYK = it => 'moli2:sy2:' + hashQ(it).slice(9);                 // sy2: 3 preguntas por actividad, de la más fácil a la más difícil
    const hs = t => { let h = 7; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; };
    const aLados = (x, wait) => hs(x.q) % 2 ? { q: x.q, i: x.ok, d: x.mal, ok: 'i', wait } : { q: x.q, i: x.mal, d: x.ok, ok: 'd', wait };   // la correcta cae a veces a la izquierda y a veces a la derecha
    async function pedirSync(it) {
      const k = SYK(it); if (P.pide.has(k) || MD.LS.get(k, null)) return; P.pide.add(k);
      const s = it.s, acts = actsDe(it.u, s).slice(0, 3), tq = ((s.ticket && s.ticket.questions) || []).map(x => x && x.q).filter(L);
      const pr = `Eres Molí, un robot amigable que acompaña a una docente de Ciencia y Tecnología de ${MD.espInfo().txt} en Perú. Vas a jugar con las niñas y niños a «mano izquierda o mano derecha»: en una diapositiva gigante sale una pregunta y dos respuestas, una a cada lado, y levantan la mano del lado de la respuesta correcta.
Unidad ${it.u.num}: «${it.u.title}». Sesión ${it.n}: «${s.title || ''}». Meta: «${s.meta || ''}».
Actividades de hoy:
${acts.map((x, j) => x && (L(x.title) || L(x.desc)) ? `${j + 1}) «${x.title || ''}»: ${x.desc || ''}` : `${j + 1}) (no hay)`).join('\n')}
${tq.length ? `No repitas estas preguntas del Exit ticket: ${tq.map(q => `«${q}»`).join(' ')}` : ''}
Devuelve JSON con "p": 3 elementos, uno para DESPUÉS de cada actividad (en orden). Cada elemento tiene "n": 3 preguntas sobre lo que se trabaja en la sesión y en esa actividad, de la más fácil a la más difícil: la 1.ª fácil (recordar), la 2.ª media (comprender o comparar) y la 3.ª difícil (razonar, aplicar a un caso nuevo o predecir). Cada pregunta:
- "q": la pregunta, clara y corta (máximo 16 palabras), con signos ¿?, sin la respuesta dentro.
- "ok": la respuesta correcta y científicamente cierta (máximo 8 palabras).
- "mal": una respuesta incorrecta pero creíble, parecida en largo a la correcta (máximo 8 palabras).
Nada de «todas las anteriores», «ninguna» ni preguntas de opinión.`;
      try {
        const PQ = { type: 'OBJECT', properties: { q: { type: 'STRING' }, ok: { type: 'STRING' }, mal: { type: 'STRING' } }, required: ['q', 'ok', 'mal'] };
        const R = await MD.pensar(pr, { type: 'OBJECT', properties: { p: { type: 'ARRAY', items: { type: 'OBJECT', properties: { n: { type: 'ARRAY', items: PQ } }, required: ['n'] } } }, required: ['p'] });
        const una = x => { const q = limpio(x && x.q, 170), ok = limpio(x && x.ok, 90), mal = limpio(x && x.mal, 90); return q && /\?\s*$/.test(q) && ok && mal && ok.toLowerCase() !== mal.toLowerCase() ? { q, ok, mal } : null; };
        const p = (R && Array.isArray(R.p) ? R.p : []).slice(0, 3).map(x => (x && Array.isArray(x.n) ? x.n : []).slice(0, 3).map(una).filter(Boolean));
        MD.LS.set(k, p.some(x => x.length) ? { p } : { _fallo: Date.now() });
      } catch (e) { MD.LS.set(k, { _fallo: Date.now() }); }
      const cur = P.L[P.i]; if (cur && cur.k === 'sync' && SYK(cur) === k && window.Sincro) Sincro.actualizar(syncDe(cur));
    }
    function syncDe(it) {
      const C = MD.LS.get(SYK(it), null), x = C && Array.isArray(C.p) && C.p[it.j - 1];
      if (Array.isArray(x) && x.length) return { ...aLados(x[0]), mas: x.slice(1).map(z => aLados(z)) };   // con A, la siguiente más difícil
      if (!C) { pedirSync(it); return { wait: true }; }
      const qs = ((it.s.ticket && it.s.ticket.questions) || []).filter(z => z && L(z.q) && Array.isArray(z.options)), t = qs.length && qs[(it.j - 1) % qs.length];   // si Molí no pudo pensarla: una del Exit ticket
      const ok = t && t.options[t.answer], mal = t && t.options.find((o, k) => k !== t.answer && L(o));
      const otra = (z) => { const o = z.options[z.answer], m = z.options.find((v, k) => k !== z.answer && L(v)); return o && m ? aLados({ q: z.q, ok: o, mal: m }) : null; };
      return ok && mal ? { ...aLados({ q: t.q, ok, mal }), mas: qs.filter(z => z !== t).slice(0, 2).map(otra).filter(Boolean) } : { q: '¿Estamos listos para seguir aprendiendo?', i: '¡Sí, listos!', d: 'Todavía no', ok: 'i' };
    }
    const preguntasDe = it => { const C = cacheIA(hashQ(it)), key = it.k === 'aq' ? 'a' + it.j : 'r'; if (C && Array.isArray(C[key]) && C[key].length) return { q: C[key] }; pedirIA(it); return { q: plantilla(it), wait: P.pide.has(hashQ(it)) && !C }; };
    const tema = it => { if (L(it.s.title)) return it.s.title; const C = cacheIA(hashQ(it)); return C && L(C.t) ? C.t : temaDe(it.s, it.n); };
    const color = u => CV_PAL[(parseInt(u.num, 10) || 1) % CV_PAL.length];
    const crumb = it => `<div class="cv-crumb">${esc(it.u.icon || '📘')} Unidad ${esc(it.u.num)} · ${esc(it.u.title)} <b>Sesión ${it.n}</b></div>`;
    function slideVideo(it) {
      const m = medioDe(it.url), doc = MD.esDocente();
      const media = !m ? '<p class="cv-lead">⚠️ El link del video no es válido.</p>'
        : m.tipo === 'yt' || m.tipo === 'if' ? `<iframe src="${esc(m.src)}" title="${esc(it.t || 'Video')}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>`
        : m.tipo === 'mp4' ? `<video src="${esc(m.src)}" controls playsinline></video>`
        : `<a class="cv-vlink" href="${esc(m.src)}" target="_blank" rel="noopener">▶ Abrir el video</a>`;
      return `<div class="cv-sl cv-vid" style="--c1:#1e1b4b;--c2:#7c3aed">${it.u ? crumb(it) : ''}<h2 class="cv-h2 cv-vt">🎬 ${esc(it.t || 'Video')}</h2><div class="cv-vbox">${media}</div>${doc ? '<div class="cv-ved"><button type="button" data-vid="edit">✏️ Editar</button><button type="button" data-vid="del" title="Quitar esta diapositiva">🗑️ Quitar</button></div>' : ''}</div>`;
    }
    function slide(it) {
      if (it.k === 'vid') return slideVideo(it);
      if (it.k === 'sync') return Sincro.html(syncDe(it));
      const u = it.u, s = it.s, [c1, c2] = it.k in CV_BG ? CV_BG[it.k] : color(u), st = `style="--c1:${c1};--c2:${c2}"`;
      const mol = (im, inner) => `<div class="cv-sl" ${st}>${crumb(it)}<div class="cv-mqb"><img class="cv-moli" src="${IMG(im)}" alt="Molí"><div class="cv-bub">${inner}</div></div></div>`;
      if (it.k === 'uni') return `<div class="cv-sl cv-c" ${st}><span class="cv-pill">UNIDAD ${esc(u.num)}</span><div class="cv-ico">${esc(u.icon || '📘')}</div><h2 class="cv-h1">${esc(u.title)}</h2><p class="cv-sub">${it.ss.length} ${it.ss.length === 1 ? 'sesión' : 'sesiones'}</p></div>`;
      if (it.k === 'ses') return `<div class="cv-sl cv-c" ${st}><span class="cv-pill">${esc(u.icon || '📘')} UNIDAD ${esc(u.num)} · ${esc(u.title).toUpperCase()}</span><div class="cv-big">Sesión ${it.n}</div><h2 class="cv-h1">${esc(tema(it))}</h2></div>`;
      if (it.k === 'meta') { const cr = (s.criteria || []).filter(L); return `<div class="cv-sl cv-meta" ${st}>${crumb(it)}<h2 class="cv-h2">🎯 Meta de la sesión</h2><p class="cv-lead">${L(s.meta) ? esc(s.meta) : 'Sin meta todavía'}</p>${cr.length ? `<h3>✅ Criterios de éxito</h3><ul class="cv-cards">${cr.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}${L(s.rubric) ? `<p class="cv-sub">📏 Criterio de la rúbrica: ${esc(s.rubric)}</p>` : ''}</div>`; }
      if (GU.has(it.k) && window.Guion) return Guion.html(it.k, { t: sabDe(it) });   // Molí los hace con su voz (guion.js)
      if (it.k === 'rol') return `<div class="cv-sl" ${st}>${crumb(it)}<h2 class="cv-h2">👥 Roles de trabajo</h2><ul class="cv-cards cv-c4">${CV_ROL.map(([i, n, d]) => `<li class="cv-role"><span>${i}</span><b>${n}</b><small>${d}</small></li>`).join('')}</ul></div>`;
      if (it.k === 'acu') return `<div class="cv-sl" ${st}>${crumb(it)}<h2 class="cv-h2">🤝 Acuerdos de convivencia</h2><ul class="cv-cards cv-c3">${CV_ACU.map(([i, t]) => `<li class="cv-role"><span>${i}</span><b>${t}</b></li>`).join('')}</ul></div>`;
      if (it.k === 'mq' || it.k === 'aq') { const Q = preguntasDe(it), tt = it.k === 'aq' ? `Sobre la actividad ${it.j}${L(it.x.title) ? ': ' + esc(it.x.title) : ''}` : it.prev ? `Recordamos la sesión ${it.prev.n}` : '¡Empezamos la unidad!';
        return mol(it.k === 'aq' ? 'curiosa' : it.prev ? 'pensativa' : 'hola', `<p class="cv-mqt">${tt}</p><ol>${Q.q.map(x => `<li>${esc(x)}</li>`).join('')}</ol>${Q.wait ? '<p class="cv-think">✨ Molí está leyendo la sesión…</p>' : ''}`); }
      if (it.k === 'voc' || it.k === 'sab') { const C = cacheIA(hashQ(it)) || {}, w = C.w || {};
        return it.k === 'voc' ? mol('idea', `<p class="cv-mqt">📖 Palabra nueva</p><p class="cv-vw">${esc(w.p)}</p><p class="cv-vd">${esc(w.d)}</p>${L(w.e) ? `<p class="cv-ve">✏️ Ejemplo: ${esc(w.e)}</p>` : ''}`)
          : mol('estrellas', `<p class="cv-mqt">💡 ¿Sabías que…?</p><p class="cv-sb">${esc(C.s)}</p>`); }
      if (it.k === 'ref') return mol('pensativa', '<p class="cv-mqt">🪞 Nuestra última reflexión de la sesión</p><ol><li>¿Qué aprendí el día de hoy?</li><li>¿Qué necesité para alcanzar la meta?</li><li>¿Cómo o dónde aplicaría lo que aprendí?</li></ol>');
      if (it.k === 'exit') { const n = MD.preguntas(s).length; return mol('decidida', `<p class="cv-mqt">🎟️ Exit ticket</p><p class="cv-sb">¡Es momento de realizar nuestro Exit ticket!</p><p class="cv-mqt">⏱️ 5 minutos${n ? ` · ${n} pregunta${n > 1 ? 's' : ''}` : ''}</p>`); }
      if (it.k === 'reto') { const x = it.x, top = `<div class="cv-rt"><span class="cv-num">${it.j}</span><b>${esc(x.title)}</b>${MODOS[x.mode] ? `<span class="cv-pill">${MODOS[x.mode]}</span>` : ''}</div>`;
        if (it.p === 'en') return `<div class="cv-sl cv-reto" ${st}>${top}<div class="cv-rcard"><div class="cv-ren">${x.en.map(t => `<p>${esc(t)}</p>`).join('')}${L(x.ej) ? `<p class="cv-rej">💬 ${esc(x.ej)}</p>` : ''}</div><p class="cv-rpr">🦫 ${esc(x.pr)}</p></div></div>`;
        if (it.p === 'pis') return `<div class="cv-sl cv-reto" ${st}>${top}<div class="cv-rcard"><ul class="cv-pis">${x.pistas.map(([n, t], k) => `<li><span class="cv-pk">Pista ${k + 1}</span><span class="cv-dig">${[...n].map(c => `<i>${c}</i>`).join('')}</span><span class="cv-pt">${esc(t)}</span></li>`).join('')}</ul><p class="cv-rpr">🔐 ${esc(x.pr)} <span class="cv-dig cv-qq"><i>?</i><i>?</i><i>?</i></span></p></div></div>`;
        return `<div class="cv-sl cv-reto" ${st}>${top}<div class="cv-rfig">${fotoHtml({ img: x.fig, title: x.title }, 'cv-fimg cv-big')}</div><p class="cv-rpr cv-rbar">🦫 ${esc(x.pr)}</p></div>`; }
      if (it.k === 'act') { const x = it.x, m = MODOS[String(x.mode || '').toLowerCase()], C = (s.criteria || []).filter(L), Q = cacheIA(hashQ(it)) || {}, ai = Q.c && +Q.c[it.j - 1], c = C[(ai >= 1 && ai <= C.length ? ai : Math.min(it.j, C.length)) - 1];
        if (L(x.img)) return `<div class="cv-sl cv-foto" ${st}>${crumb(it)}<div class="cv-fw"><div class="cv-ftx"><div class="cv-acth"><span class="cv-num">${it.j}</span><h2 class="cv-h2" style="margin:0">Actividad ${it.j}</h2></div>${m ? `<span class="cv-pill">${m}</span>` : ''}${L(x.title) ? `<h3 class="cv-at">${esc(x.title)}</h3>` : ''}${L(x.desc) ? `<p class="cv-box">${esc(x.desc)}</p>` : ''}${c ? `<div class="cv-crb"><b>✅ Criterio de éxito</b>${esc(c)}</div>` : ''}</div>${fotoHtml(x, 'cv-fimg')}</div></div>`;
        return `<div class="cv-sl" ${st}>${crumb(it)}<div class="cv-acth"><span class="cv-num">${it.j}</span><h2 class="cv-h2" style="margin:0">Actividad ${it.j}</h2>${m ? `<span class="cv-pill">${m}</span>` : ''}</div>${c ? `<div class="cv-crb"><b>✅ Criterio de éxito</b>${esc(c)}</div>` : ''}${L(x.title) ? `<h3 class="cv-at">${esc(x.title)}</h3>` : ''}${L(x.desc) ? `<p class="cv-lead cv-box">${esc(x.desc)}</p>` : ''}${L(x.ficha) ? `<span class="cv-pill">📄 ${esc(x.ficha)}</span>` : ''}</div>`; }
      const qs = ((s.ticket && s.ticket.questions) || []).filter(x => x && L(x.q));
      return `<div class="cv-sl" ${st}>${crumb(it)}<h2 class="cv-h2">✅ Respuestas del Exit ticket</h2>${qs.length ? `<ol class="cv-cards cv-q">${qs.map(x => `<li><b>${esc(x.q)}</b><ul>${(x.options || []).map((o, k) => L(o) ? `<li class="${k === x.answer ? 'ok' : ''}">${k === x.answer ? '✓ ' : ''}${esc(o)}</li>` : '').join('')}</ul></li>`).join('')}</ol>` : '<p class="cv-lead">Sin preguntas todavía.</p>'}</div>`;
    }
    function ajustar(d) {                                               // la diapositiva usa todo el cuadro: agranda la letra hasta llenarlo sin cortarse
      if (!d || d.classList.contains('sy') || d.classList.contains('cv-foto') || d.classList.contains('cv-vid') || d.querySelector('.cv-rfig')) return;
      const H = d.clientHeight, Wd = d.clientWidth; if (!H || !Wd) return;
      const prev = d.style.justifyContent; d.style.justifyContent = 'flex-start'; d.style.overflow = 'visible';
      const cabe = () => { const kids = [...d.children].filter(c => getComputedStyle(c).position !== 'absolute'); if (!kids.length) return true;
        const top = kids[0].getBoundingClientRect().top, bot = Math.max(...kids.map(c => c.getBoundingClientRect().bottom)), r = d.getBoundingClientRect(), cs = getComputedStyle(d);
        const der = Math.max(...kids.map(c => Math.max(c.getBoundingClientRect().right, c.scrollWidth > c.clientWidth + 2 ? 1e9 : 0)));
        return bot - top <= r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 4 && der <= r.right - parseFloat(cs.paddingRight) + 2; };
      let lo = 0.7, hi = 2.6; for (let k = 0; k < 9; k++) { const m = (lo + hi) / 2; d.style.fontSize = m + 'em'; if (cabe()) lo = m; else hi = m; }
      d.style.fontSize = (lo * 0.97) + 'em'; d.style.justifyContent = prev; d.style.overflow = '';
      const cr = d.querySelector('.cv-crumb'); if (cr) cr.style.fontSize = (0.8 / (lo * 0.97)) + 'em';
    }
    let el = null;
    function pinta(anim) {
      if (!el) return;
      const sl = el.querySelector('.cv-stage'); if (!P.L.length) { sl.innerHTML = `<div class="cv-sl cv-c" style="--c1:#7c3aed;--c2:#06b6d4"><div class="cv-ico">🎨</div><h2 class="cv-h1">Aún no hay sesiones</h2></div>`; return; }
      P.i = Math.max(0, Math.min(P.L.length - 1, P.i)); const it = P.L[P.i];
      const sk = it.k === 'sync' ? claveSl(it) : '';
      if (sk && P.syk === sk && Sincro.activo()) Sincro.actualizar(syncDe(it));   // ya está en pantalla (llegó lo que pensó Molí): no se reinicia la animación
      else if (GU.has(it.k) && window.Guion && P.guk === claveSl(it) + it.k && Guion.activo()) Guion.dato(sabDe(it));   // ya está en pantalla: no se reinicia
      else { if (window.Sincro) Sincro.parar(); if (window.Guion) Guion.parar(); P.syk = sk; sl.innerHTML = slide(it); const gu = GU.has(it.k) && window.Guion; P.guk = gu ? claveSl(it) + it.k : ''; if (!gu) ajustar(sl.firstChild); if (anim) sl.firstChild.classList.add('cv-in'); if (sk) Sincro.montar(sl.firstChild, syncDe(it)); if (gu) Guion.montar(sl.firstChild, it.k, { t: sabDe(it) }); }
      if (it.s && it.u && window.Sincro) syncDe({ ...it, j: 1 });
      if (it.u && it.n != null) RT.sesion(it.u.key + ':' + it.n);                // Molí piensa las preguntas de la sesión desde antes
      if (it.s) { preguntasDe({ ...it, k: 'mq' }); const nx = P.L.slice(P.i + 1).find(z => z.k === 'ses' && !(z.u === it.u && z.n === it.n)); nx && preguntasDe({ ...nx, k: 'mq' }); }
      el.querySelector('.cv-n').textContent = `${P.i + 1} / ${P.L.length}`;
      el.querySelector('[data-cv="-1"]').disabled = P.i === 0; el.querySelector('[data-cv="1"]').disabled = P.i === P.L.length - 1;
      const sel = el.querySelector('select'), key = !it.u ? '' : it.k === 'uni' ? 'u:' + it.u.key : 's:' + it.u.key + ':' + it.n; if (key && sel.value !== key && [...sel.options].some(o => o.value === key)) sel.value = key;
      const ad = el.querySelector('.cv-add'); if (ad) ad.title = `Añadir un video entre la diapositiva ${P.i + 1} y la ${P.i + 2}`;
    }
    // ---- el formulario del video (nuevo o editar) ----
    function formVideo(v) {
      const f = document.createElement('div'); f.className = 'cv-form';
      f.innerHTML = `<form><b class="cv-fh">🎬 ${v ? 'Editar' : 'Nueva'} diapositiva de video</b><small>${v ? '' : `Irá entre la diapositiva ${P.i + 1} y la ${P.i + 2}.`}</small>
        <label>Título de la diapositiva<input name="t" maxlength="80" placeholder="Ej.: Así crecen las levaduras" value="${esc(v ? v.t : '')}"></label>
        <label>Link del video (YouTube, Drive, Vimeo o .mp4)<input name="url" maxlength="400" inputmode="url" placeholder="https://www.youtube.com/watch?v=…" value="${esc(v ? v.url : '')}" required></label>
        <div class="cv-fprev"></div><p class="cv-ferr"></p>
        <div class="cv-fbt"><button type="button" data-vf="no">Cancelar</button><button type="submit">💾 Guardar</button></div></form>`;
      el.appendChild(f); const F = f.querySelector('form'), pv = f.querySelector('.cv-fprev'), er = f.querySelector('.cv-ferr');
      const prev = () => { const m = medioDe(F.url.value); pv.innerHTML = !F.url.value.trim() ? '' : !m ? '⚠️ Ese link no parece de un video.' : m.img ? `<img src="${esc(m.img)}" alt=""> ✅ Video de YouTube` : m.tipo === 'link' ? '🔗 Se mostrará un botón para abrir el link.' : '✅ Video listo'; };
      F.url.addEventListener('input', prev); prev();
      ['keydown', 'keyup', 'keypress'].forEach(t => f.addEventListener(t, e => { e.stopPropagation(); if (t === 'keydown' && e.key === 'Escape') f.remove(); }));   // al escribir no se mueven las escenas
      f.addEventListener('pointerdown', e => e.stopPropagation()); f.addEventListener('pointerup', e => e.stopPropagation());
      f.addEventListener('click', e => { e.stopPropagation(); if (e.target.closest('[data-vf="no"]') || e.target === f) f.remove(); });
      F.addEventListener('submit', async e => { e.preventDefault();
        const t = F.t.value.replace(/\s+/g, ' ').trim().slice(0, 80), url = F.url.value.trim();
        if (!medioDe(url)) { er.textContent = '⚠️ Pega el link completo del video (debe empezar con https://).'; return; }
        const bt = F.querySelector('[type=submit]'); bt.disabled = true; bt.textContent = '⏳ Guardando…'; er.textContent = '';
        const cur = P.L[P.i], id = v ? v.id : Date.now().toString(36), L2 = v ? CVV.L.map(x => x.id === v.id ? { ...x, t, url } : x) : [...CVV.L, { id, a: claveSl(cur), t, url }];
        try { await guardarVideos(L2); f.remove(); armar(); const k = P.L.findIndex(z => z.k === 'vid' && z.id === id); if (k >= 0) P.i = k; pinta(true); }
        catch (x) { bt.disabled = false; bt.textContent = '💾 Guardar'; er.textContent = x.message === 'AUTH' ? '🔐 Conecta tu cuenta: toca tu fotocheck → «Conectar mi cuenta».' : '📶 No se pudo guardar. Revisa tu internet.'; } });
      setTimeout(() => (v ? F.t : F.url).focus(), 50);
    }
    async function quitarVideo(it) {
      if (!confirm(`¿Quitar la diapositiva de video «${it.t || 'Video'}»?`)) return;
      try { await guardarVideos(CVV.L.filter(x => x.id !== it.id)); P.i = Math.max(0, P.i - 1); armar(); pinta(true); }
      catch (x) { alert(x.message === 'AUTH' ? '🔐 Conecta tu cuenta: toca tu fotocheck → «Conectar mi cuenta».' : '📶 No se pudo quitar. Revisa tu internet.'); }
    }
    function montar() {
      armar();
      host.innerHTML = `<div class="cv"><div class="cv-stage"></div>${MD.esDocente() ? '<button type="button" class="cv-add" aria-label="Añadir una diapositiva de video aquí">+</button>' : ''}<div class="cv-bar"><button data-cv="-1" aria-label="Anterior">‹</button><select aria-label="Ir a">${MD.unidades().map(u => `<option value="u:${esc(u.key)}">📘 Unidad ${esc(u.num)} · ${esc(u.title)}</option>${MD.sesionesDe(u).map(({ s, n }) => `<option value="s:${esc(u.key)}:${n}">   🗓️ Sesión ${n} · ${esc(temaDe(s, n)).slice(0, 50)}</option>`).join('')}`).join('')}</select><span class="cv-n"></span><button data-cv="1" aria-label="Siguiente">›</button></div></div>`;
      RT.montar(); el = host.firstChild; const fs = () => { el.style.fontSize = Math.max(8, Math.min(60, el.clientHeight / 32.5, el.clientWidth / 57)) + 'px'; const d = el.querySelector('.cv-stage > .cv-sl'); if (d) { d.style.fontSize = ''; ajustar(d); } }; fs(); P.ro = new ResizeObserver(fs); P.ro.observe(el);
      el.addEventListener('click', e => {
        if (e.target.closest('.cv-add')) { e.stopPropagation(); return formVideo(null); }
        const vb = e.target.closest('[data-vid]'); if (vb) { e.stopPropagation(); const it = P.L[P.i]; if (it && it.k === 'vid') { if (vb.dataset.vid === 'del') quitarVideo(it); else formVideo(CVV.L.find(x => x.id === it.id) || it); } return; }
        const b = e.target.closest('[data-cv]'); if (!b) return; e.stopPropagation(); P.i += +b.dataset.cv; pinta(true); });
      el.querySelector('select').addEventListener('change', e => { const v = e.target.value.split(':'); const k = P.L.findIndex(z => v[0] === 'u' ? z.k === 'uni' && z.u.key === v[1] : z.k === 'ses' && z.u.key === v[1] && z.n === +v[2]); if (k >= 0) { P.i = k; pinta(true); } });
      let x0 = null; el.addEventListener('pointerdown', e => { x0 = e.target.closest('.cv-bar,.cv-add,.cv-ved,.cv-form') ? null : e.clientX; }); el.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) { P.i += dx < 0 ? 1 : -1; pinta(true); } });
      pinta(true);
    }
    function gate() {
      host.innerHTML = `<div class="cv"><div class="cv-gate"><form><img src="${IMG('decidida')}" alt="" style="width:4em"><br><b>🔒 Mi presentación</b><p style="margin:.3em 0">Escribe la contraseña para entrar.</p><input type="password" inputmode="numeric" autocomplete="off" aria-label="Contraseña"><div class="err" style="color:#b91c1c;font-weight:800;min-height:1.2em"></div><button type="submit">Entrar</button></form></div></div>`;
      el = host.firstChild; el.style.fontSize = Math.max(9, Math.min(18, el.clientHeight / 24)) + 'px';
      const f = el.querySelector('form'); f.addEventListener('submit', e => { e.preventDefault(); if (f.querySelector('input').value.trim() === '123') { try { sessionStorage.setItem('moli2:cv', '1'); } catch (x) {} el = null; montar(); } else f.querySelector('.err').textContent = 'Contraseña incorrecta.'; });
    }
    P.iniciar = () => { host.innerHTML = '<div class="cv"><div class="cv-gate"><b style="font-size:1.4em">🎨 Preparando Mi presentación…</b></div></div>';
      Promise.all([MD.cargar(), CVV.ok ? null : cargarVideos()]).then(() => { let ok = MD.esDocente(); try { ok = ok || sessionStorage.getItem('moli2:cv') === '1'; } catch (e) {} ok ? montar() : gate(); }).catch(() => { host.innerHTML = '<div class="cv"><div class="cv-gate"><b>📶 No pude cargar las sesiones. Revisa tu internet.</b></div></div>'; }); };
    P.cerrar = () => { P.ro && P.ro.disconnect(); if (window.Sincro) Sincro.parar(); if (window.Guion) Guion.parar(); P.guk = ''; P.syk = ''; RT.quitar(); };
    return P;
  }

  // =================================================================
  //  abrir y cerrar
  // =================================================================
  let actual = null;
  window.Hojas = {
    abrir(kind, host) {
      Hojas.cerrar();
      host.classList.add('libro');
      if (kind === 'pizarra') { actual = MD.esDocente() || !Hojas.diplomas ? flujoPresentacion(host) : Hojas.diplomas(host); actual.iniciar(); return; }   // estudiante: sus diplomas; docente: Mi presentación
      const D = MD.esDocente() && Hojas.docente ? Hojas.docente[kind] : null;     // la docente ve su versión: registro de 6° A-D, avances y editar
      const F = D ? D() : kind === 'cuaderno' ? flujoSesiones() : kind === 'folder' ? flujoTickets() : kind === 'docente' ? flujoNotas() : kind === 'mision' ? flujoMisiones() : null;
      if (!F) return;
      const tema = { cuaderno: 'ses', folder: 'exit', docente: 'notas', mision: 'mis' }[kind];
      Libro(host, tema, F); actual = F; F.iniciar && F.iniciar();
    },
    _: { lk, docsUnidad, abrirDocU, actsDe, fotoHtml, esBebras, Libro, esc, L, IMG, cargando, nivelChip, temaDe, temaCorto, MODOS, hojaUnidades, fichaHtml, pdfs, abrirFicha, fichaDe },
    cerrar() { if (actual) { actual.libro && actual.libro.ro && actual.libro.ro.disconnect(); actual.cerrar && actual.cerrar(); actual = null; } }
  };
})();
