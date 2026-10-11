// ===================================================================
//  MOLÍ 2 · HOJAS: lo que se escribe dentro de los cuadernos, el portafolio y los folders del aula,
//  y la presentación del proyector. Se pasan las hojas como en un libro de verdad.
// ===================================================================
(function () {
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = t => MD.lleno(t);
  const mezcla = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const nom1 = me => String(me && me.name || '').split(' ')[0].toLowerCase().replace(/^./, c => c.toUpperCase());
  const MODOS = { individual: '👤 Individual', group: '👥 En equipo', grupo: '👥 En equipo', pair: '👫 En pareja', pairs: '👫 En pareja', pareja: '👫 En pareja', whole: '🏫 Toda la clase', clase: '🏫 Toda la clase' };
  const temaDe = (s, n) => L(s.title) ? s.title : (() => { const m = String(s.meta || '').trim().replace(/\.$/, ''); return m ? (m.length > 80 ? m.slice(0, 78).replace(/\s+\S*$/, '') + '…' : m) : 'Sesión ' + n; })();
  const temaCorto = (u, s, n) => {                                     // el tema: el título de la sesión, o el que Molí le puso en «Mi presentación» (sin repetir la meta)
    if (L(s.title)) return s.title;
    const S = MD.sesionesDe(u), k = S.findIndex(z => z.n === n), C = MD.LS.get(hashQ({ u, s, n, prev: k > 0 ? S[k - 1] : null }), null);
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
    const talla = () => { const h = el.clientHeight || 300; el.style.fontSize = Math.max(9, Math.min(17, h / 23)) + 'px';
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
      if (a && !a.disabled) { e.stopPropagation(); flujo.act(a.dataset.a, a.dataset, a); }
    });
    el.addEventListener('submit', e => { e.preventDefault(); const f = e.target; flujo.act(f.dataset.a, f.dataset, f); });
    flujo.libro = B;
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
    return { l: `<img class="moli w" src="${IMG('feliz')}" alt=""><div class="crumb w">${me ? esc(me.name) + (me.docente ? ' · Docente' : ' · 6° ' + esc(me.section)) : 'Ciencia y Tecnología · 6°'}</div><h1 class="w">${icono} ${esc(titulo)}</h1><p class="hand w">${frase}</p>`,
      r: `<h2 class="w">📚 Elige tu unidad</h2>${U.length ? U.map(u => `<button class="row w" data-a="unidad" data-k="${esc(u.key)}"><span class="ico" style="font-size:1.6em">${esc(u.icon || '📘')}</span><span class="rt"><b>Unidad ${esc(u.num)}</b><small>${esc(u.title)}</small></span><span>›</span></button>`).join('') : '<p class="hand w">Todavía no hay unidades visibles.</p>'}` };
  };

  // ---- la ficha de la sesión (la arma «Trabajar con Molí»): va dentro del cuaderno, en sus propias hojas ----
  const fichaHtml = (fx, n) => {
    if (!fx) return '';
    const P = [`<div class="crumb w">📄 Ficha · Sesión ${n}</div>`, `<h1 class="w">${esc(fx.t || 'Ficha de la sesión')}</h1>`];
    if (L(fx.st)) P.push(`<p class="hand w">${esc(fx.st)}</p>`);
    const trozos = t => { const o = [], fr = String(t || '').match(/[^.!?]+[.!?]*\s*/g) || []; let c = ''; fr.forEach(f => { if ((c + f).length > 300 && c) { o.push(c.trim()); c = ''; } c += f; }); if (c.trim()) o.push(c.trim()); return o; };
    const bloque = (cls, tit, t) => trozos(t).forEach((x, k) => P.push(`<div class="${cls} w">${!k && tit ? `<b>${tit}</b>` : ''}<p>${esc(x)}</p></div>`));   // en trocitos: si no entra, sigue en la otra hoja
    if (L(fx.rd)) bloque('fx-lee', '📖 Lectura', fx.rd);
    (fx.b || []).forEach(x => bloque('fx-bl', L(x.h) ? esc(x.h) : '', x.t));
    if (L(fx.sb)) P.push(`<div class="box tip w">💡 <b>¿Sabías que…?</b> <span class="hand">${esc(String(fx.sb).replace(/^\s*¿?\s*sab[ií]as\s+que\s*(…|\.\.\.)?\s*/i, ''))}</span></div>`);
    let a0 = 0;
    (fx.k || []).forEach((x, i) => {
      if (x.a && x.a !== a0) { a0 = x.a; P.push(`<h3 class="w">🧪 Actividad ${x.a}</h3>`); }
      P.push(`<div class="fx-q w"><b class="n">${i + 1}</b><div><p>${esc(x.q)}</p>${L(x.h) ? `<small>💬 ${esc(x.h)}</small>` : ''}${x.c && x.c.length ? `<table class="fx-t"><tr>${x.c.map(c => `<th>${esc(c)}</th>`).join('')}</tr>${'<tr>' + x.c.map(() => '<td></td>').join('') + '</tr>'.repeat(1)}${Array.from({ length: Math.max(1, (x.r || 3) - 1) }, () => '<tr>' + x.c.map(() => '<td></td>').join('') + '</tr>').join('')}</table>` : `<div class="fx-ln">${L(x.f) ? `<span>${esc(x.f)}</span>` : ''}</div>`}</div></div>`);
    });
    return P.join('');
  };

  // =================================================================
  //  1) MIS SESIONES DE UNIDAD (cuaderno verde de la mesa)
  // =================================================================
  function flujoSesiones() {
    const F = { i: 0, u: null, listo: false, me: MD.yo() };
    F.hojas = () => {
      if (!F.listo) return [{ l: cargando(), r: '' }];
      if (!F.u) return [hojaUnidades('Mis sesiones de unidad', '📗', `¡Hola${F.me ? ' ' + esc(nom1(F.me)) : ''}! Aquí está todo lo que aprendemos en cada clase. Elige tu unidad y pasa las hojas. ✏️`, F.me)];
      const u = F.u, S = MD.sesionesDe(u);
      const H = [{ l: `<div class="crumb w">Ciencia y Tecnología · 6°</div><div class="ico w">${esc(u.icon || '📘')}</div><div class="big w">Unidad ${esc(u.num)}</div><h1 class="w">${esc(u.title)}</h1><p class="hand w">📗 Mi cuaderno de sesiones</p><p class="hand w">${S.length} ${S.length === 1 ? 'sesión' : 'sesiones'} · pasa la hoja ›</p>`,
        r: `<h2 class="w">📑 Índice</h2>${S.map(({ s, n }, k) => `<button class="row w" data-a="ir" data-i="${k + 1}"><b class="lv" style="background:#dbeafe;color:#1d4ed8">${n}</b><span class="rt"><b>Sesión ${n}</b><small>${esc(temaDe(s, n))}</small></span></button>`).join('')}` }];
      S.forEach(({ s, n }) => {
        const cr = (s.criteria || []).filter(L), acts = (s.activities || []).slice(0, 3).filter(a => L(a.title) || L(a.desc)), q = MD.preguntas(s).length;
        const tareas = [s.flipped, s.flipped2].filter(f => f && f.enabled && (L(f.title) || L(f.desc)));
        H.push({ l: `<div class="crumb w">${esc(u.icon || '📘')} Unidad ${esc(u.num)} · ${esc(u.title)}</div><div class="big w">Sesión ${n}</div>${temaCorto(u, s, n) ? `<h2 class="w">${esc(temaCorto(u, s, n))}</h2>` : ''}
            ${L(s.meta) ? `<h3 class="w">🎯 Meta de la sesión</h3><p class="hand w">${esc(s.meta)}</p>` : ''}
            ${cr.length ? `<h3 class="w">✅ Criterios de éxito</h3><ul class="cr hand">${cr.map(c => `<li class="w">${esc(c)}</li>`).join('')}</ul>` : ''}
            ${L(s.rubric) ? `<h3 class="w">📏 Lo que se evalúa</h3><p class="hand w">${esc(s.rubric)}</p>` : ''}`,
          r: `<h2 class="w">🧪 Actividades</h2>${acts.length ? acts.map((a, j) => `<div class="act w"><b class="n">${j + 1}</b>${MODOS[String(a.mode || '').toLowerCase()] ? `<span class="chip">${MODOS[String(a.mode || '').toLowerCase()]}</span>` : ''}<div><b>${esc(a.title || 'Actividad ' + (j + 1))}</b></div>${L(a.desc) ? `<p class="hand">${esc(a.desc)}</p>` : ''}</div>${Hojas.videoHtml ? Hojas.videoHtml(a) : ''}`).join('') : '<p class="hand w">Tu profe aún no escribe las actividades.</p>'}
            ${tareas.map(f => `<div class="box tip w"><b>🏠 Para la casa:</b> <span class="hand">${esc(f.title)}${L(f.desc) ? ' — ' + esc(f.desc) : ''}</span></div>`).join('')}
            ${q ? `<div class="box w">🎟️ <b>Exit ticket</b> · ${q} ${q === 1 ? 'pregunta' : 'preguntas'}<br><span class="hand">Respóndelo en tu portafolio verde del locker.</span></div>` : ''}` });
        if (s.fx) H.push({ l: fichaHtml(s.fx, n), r: null });
      });
      return H;
    };
    F.atras = () => { if (F.u) { F.u = null; F.i = 0; } };
    F.alMover = () => {}; F.pestana = null;
    F.act = (a, ds, el) => {
      if (a === 'unidad') F.libro.pasar(1, () => { F.u = MD.unidades().find(u => u.key === ds.k); F.i = 0; F.pestana = '📚 Unidades'; });
      if (a === 'ir') F.libro.pasar(1, () => { F.i = +ds.i; });
      if (a === 'video') el.outerHTML = `<div class="vid on"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(ds.y)}?autoplay=1&rel=0&start=${+ds.t || 0}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div>`;
    };
    F.alTab = () => F.libro.pasar(-1, () => { F.u = null; F.i = 0; F.pestana = null; });
    F.iniciar = () => MD.cargar().then(() => { F.listo = true; F.libro.pinta(true); }).catch(() => { F.listo = true; F.libro.pinta(true); });
    return F;
  }

  // =================================================================
  //  2) MIS EXIT TICKETS (portafolio verde del locker)
  // =================================================================
  function flujoTickets() {
    const F = { i: 0, u: null, listo: false, me: MD.yo(), modo: 'lista', T: null };
    const pendiente = () => { const S = MD.sesionesDe(F.u).filter(x => MD.preguntas(x.s).length); return S.find(x => !F.T[x.n]); };
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
          r: `<h2 class="w">📋 Sesiones</h2>${S.map(({ s, n }) => { const t = F.T[n], es = pe && pe.n === n;
              return `<button class="row w${!t && !es ? ' off' : ''}" ${t || es ? `data-a="${t ? 'ver' : 'empezar'}" data-n="${n}"` : 'disabled'}><b class="lv" style="background:#dcfce7;color:#166534">${n}</b><span class="rt"><b>Sesión ${n}</b><small>${esc(temaDe(s, n))}</small></span>${t ? `${nivelChip(t)}<small>${t.score}/${t.total}</small>` : es ? '<span class="bt or" style="font-size:.75em">Responder ›</span>' : '🔒'}</button>`; }).join('')}` }];
      }
      const x = F.x;
      if (F.modo === 'preg') return x.qs.map((q, k) => ({
        l: `<div class="crumb w">Sesión ${x.n} · Exit ticket</div><h2 class="w">Pregunta ${k + 1} de ${x.qs.length}</h2><div class="bar w"><i style="width:${k / x.qs.length * 100}%"></i></div><p class="hand w" style="font-size:1.45em;margin-top:.5em">${esc(q.q)}</p>
            ${x.res[k] != null ? `<p class="why ${x.res[k] ? 'ok-msg' : 'no-msg'}">${x.res[k] ? '✓ ¡Correcto!' : '✗ No era esa'}</p>${L(q.why) ? `<p class="why hand">💡 ${esc(q.why)}</p>` : ''}` : `<img class="moli w" src="${IMG('pensativa')}" alt="" style="width:3.6em">`}`,
        r: `<h2 class="w">Elige tu respuesta</h2>${q.ord.map((o, j) => { const R = x.res[k], sel = x.sel[k] === o.i, ok = o.i === q.answer;
            return `<button class="opt w${R != null && ok ? ' ok' : R != null && sel && !ok ? ' no' : ''}" data-a="resp" data-k="${k}" data-o="${o.i}" ${R != null ? 'disabled' : ''}><i>${'ABCD'[j]}</i>${esc(o.t)}</button>`; }).join('')}
            ${x.res[k] != null ? `<p class="center"><button class="bt gr" data-a="sig">${k + 1 < x.qs.length ? 'Siguiente ›' : 'Ver mi resultado ›'}</button></p>` : ''}` }));
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
        return F.libro.pasar(1, () => { F.x = { n, qs, res: [], sel: [] }; F.modo = 'preg'; F.i = 0; }); }
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
    F.iniciar = () => MD.cargar().then(() => { F.listo = true; F.libro.pinta(true); }).catch(() => { F.listo = true; F.libro.pinta(true); });
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
      const pags = S.map(({ s, n }) => { const r = T[n], pa = T[MD.PART + n], co = T[MD.COND + n], m = Ms.find(x => x.ses.n === n), mok = m && MD.misionCompleta(m, F.P || {});
        return `<div class="crumb w">${esc(u.icon || '📘')} Unidad ${esc(u.num)} · Sesión ${n}</div><h2 class="w">${esc(temaDe(s, n))}</h2>
          ${fila('🎟️', 'Exit ticket', 'Cuánto lograste la meta de hoy.', r ? `${nivelChip(r)}<br><small>${r.score}/${r.total}</small>` : sin)}
          ${fila('🙋', 'Participación', 'Preguntar, responder, explicar y ayudar (1 a +4).', pa ? `<span class="lv" style="background:#e0f2fe;color:#075985">${MD.partic(pa) === 4 ? '+4' : MD.partic(pa)}</span>` : sin)}
          ${fila('🤝', 'Conducta', 'Cómo viviste las normas del aula.', co ? conducta(co) : sin)}
          ${m ? fila('💪', 'Refuerzo', 'La misión de esta sesión.', mok ? '<span class="lv" style="background:#bbf7d0;color:#166534">✓</span>' : '<small class="hand">Pendiente</small>') : ''}`; });
      const ex = S.map(({ n }) => T[n]).filter(Boolean), eg = MD.promedio(ex), pq = S.reduce((a, { n }) => a + MD.partic(T[MD.PART + n]), 0), cf = MD.promedio(S.map(({ n }) => T[MD.COND + n]));
      const G = r => r ? `${nivelChip(r)}<br><small>${esc(MD.nivel(r).name)}</small>` : sin;
      pags.push(`<div class="crumb w">${esc(u.icon || '📘')} Unidad ${esc(u.num)} · ${esc(u.title)}</div><h2 class="w">🏁 Resumen de la unidad</h2>
        ${fila('🏆', 'Producto o evaluación · 50%', 'El trabajo final: la mitad de tu nota.', G(T[MD.PROD]))}
        <p class="w"><b>El otro 50% sale de:</b></p>
        ${fila('📓', 'Cuaderno', 'Tus apuntes y tareas.', G(T[MD.CUAD]))}
        ${fila('🎟️', 'Exit tickets', 'El promedio de tus Exit tickets.', eg ? G(eg) : sin)}
        ${fila('🙋', 'Participación', 'Todas tus participaciones.', pq ? `<span class="lv" style="background:#e0f2fe;color:#075985">${pq}</span>` : sin)}
        ${cf ? fila('🤝', 'Conducta de la unidad', 'Cómo viviste las normas en la unidad.', conducta(cf)) : ''}`);
      const H = [{ l: `<img class="moli w" src="${IMG('orgullosa')}" alt=""><div class="crumb w">${esc(F.me.name)} · 6° ${esc(F.me.section)}</div><h1 class="w">📂 Mis notas</h1><h2 class="w">${esc(u.icon || '📘')} Unidad ${esc(u.num)}: ${esc(u.title)}</h2>
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
        Promise.all([MD.ticketsDe(u, F.me), MD.cargarMisiones().then(() => MD.avance(F.me))]).then(([T, P]) => { F.T = T; F.P = P; F.libro.pinta(true); }).catch(() => { F.T = {}; F.libro.pinta(true); }); });
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
          r: `<h2 class="w">🗺️ Misiones</h2>${Ms.length ? Ms.map((m, k) => { const n = m.acts.filter(a => F.P[a.id]).length;
              return `<button class="row w" data-a="mision" data-k="${k}"><b class="lv" style="background:${n === m.acts.length ? '#bbf7d0' : '#fef3c7'};color:#2b2547">${n === m.acts.length ? '✓' : k + 1}</b><span class="rt"><b>${esc(m.t)}</b><small>Sesión ${m.ses.n} · ${n}/${m.acts.length} actividades</small></span>›</button>`; }).join('') : '<p class="hand w">Tu profe aún no crea misiones para esta unidad.</p>'}` }];
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
    F.iniciar = () => Promise.all([MD.cargar(), MD.cargarMisiones()]).then(() => MD.avance(F.me)).then(P => { F.P = P; F.listo = true; F.libro.pinta(true); }).catch(() => { F.listo = true; F.libro.pinta(true); });
    return F;
  }

  // =================================================================
  //  5) MI PRESENTACIÓN (modo Canva, en el proyector)
  // =================================================================
  const CV_K = { uni: ['📘', 'Unidad'], ses: ['🗓️', 'Sesión'], meta: ['🎯', 'Meta y criterios'], rol: ['👥', 'Roles'], acu: ['🤝', 'Acuerdos'], act: ['🧪', 'Actividad'], exit: ['🎟️', 'Exit ticket'], mq: ['🤖', 'Molí pregunta'], aq: ['🤖', 'Molí pregunta'], exa: ['✅', 'Respuestas'], voc: ['📖', 'Palabra nueva'], sab: ['💡', '¿Sabías que?'], ref: ['🪞', 'Reflexión'] };
  const CV_BG = { meta: ['#2563eb', '#38bdf8'], rol: ['#7c3aed', '#c084fc'], acu: ['#0d9488', '#34d399'], act: ['#ea580c', '#facc15'], exit: ['#db2777', '#f472b6'], mq: ['#4338ca', '#0ea5e9'], aq: ['#0e7490', '#a855f7'], exa: ['#be185d', '#f472b6'], voc: ['#0f766e', '#22d3ee'], sab: ['#c2410c', '#facc15'], ref: ['#4338ca', '#22d3ee'] };
  const CV_PAL = [['#7c3aed', '#06b6d4'], ['#0ea5e9', '#22c55e'], ['#f97316', '#ec4899'], ['#2563eb', '#8b5cf6'], ['#14b8a6', '#6366f1'], ['#e11d48', '#f59e0b']];
  const CV_ROL = [['🎤', 'SPEAKER', 'Presenta y habla por el equipo'], ['🧰', 'HELPER', 'Trae y organiza los materiales'], ['⏱️', 'TIMER', 'Cuida el tiempo del equipo'], ['🎨', 'DESIGNER', 'Hace que el trabajo se vea bonito y ordenado']];
  const CV_ACU = [['✋', 'Levantar la mano para participar'], ['🤫', 'No conversamos en clase'], ['🪑', 'Nos quedamos en nuestro sitio']];
  const hashQ = it => { const t = JSON.stringify([it.u.title, it.s.title, it.s.meta, (it.s.activities || []).slice(0, 3).map(x => x && [x.title, x.desc]), it.prev && [it.prev.s.title, it.prev.s.meta]]); let h = 5381; for (let i = 0; i < t.length; i++) h = (h * 33 ^ t.charCodeAt(i)) >>> 0; return 'moli2:cv:' + h.toString(36); };
  function flujoPresentacion(host) {
    const P = { L: [], i: 0, ia: {}, pide: new Set() };
    const actOk = x => x && (L(x.title) || L(x.desc));
    function armar() {
      const Lst = [];
      MD.unidades().forEach(u => {
        const ss = MD.sesionesDe(u).filter(({ s }) => L(s.title) || L(s.meta) || (s.activities || []).some(actOk));
        Lst.push({ k: 'uni', u, ss });
        ss.forEach(({ s, n }, q) => {
          const b = { u, s, n, prev: q ? ss[q - 1] : null }, C = MD.LS.get(hashQ(b), null) || {};
          Lst.push({ ...b, k: 'ses' }, { ...b, k: 'meta' }, { ...b, k: 'mq' });
          if (C.w && L(C.w.p)) Lst.push({ ...b, k: 'voc' });
          Lst.push({ ...b, k: 'rol' }, { ...b, k: 'acu' });
          const acts = (s.activities || []).slice(0, 3), ok = acts.map((x, j) => actOk(x) ? j + 1 : 0).filter(Boolean), sj = ok.includes(2) ? 2 : ok[ok.length - 1];
          acts.forEach((x, j) => { if (!actOk(x)) return; Lst.push({ ...b, k: 'act', x, j: j + 1 }, { ...b, k: 'aq', x, j: j + 1 }); if (L(C.s) && j + 1 === sj) Lst.push({ ...b, k: 'sab' }); });
          if (L(C.s) && !sj) Lst.push({ ...b, k: 'sab' });
          Lst.push({ ...b, k: 'ref' }, { ...b, k: 'exit' }, { ...b, k: 'exa' });
        });
      });
      P.L = Lst;
    }
    const plantilla = it => { const u = it.u.title;
      if (it.k === 'aq') { const t = String(it.x.title || '').replace(/[¿?¡!«»"]/g, '').trim(); return [`¿Qué hicimos en la actividad ${it.j}${t ? `, «${t}»` : ''}?`, '¿Qué descubrimos o aprendimos con esta actividad?']; }
      if (!it.prev) return [`¿Qué crees que haremos en la unidad «${u}»?`, `¿Qué sabemos sobre ${u.charAt(0).toLowerCase() + u.slice(1)}?`];
      const p = String(temaDe(it.prev.s, it.prev.n)).replace(/[¿?¡!«»"]/g, '').trim(); return [`¿Qué hicimos en la sesión anterior${p ? `, «${p}»` : ''}?`, '¿Qué aprendimos la clase pasada?']; };
    async function pedirIA(it) {                                         // Molí piensa sus preguntas, la palabra nueva y el dato curioso (una vez por sesión)
      const k = hashQ(it); if (P.pide.has(k) || MD.LS.get(k, null)) return; P.pide.add(k);
      const s = it.s, acts = (s.activities || []).slice(0, 3), A = { type: 'ARRAY', items: { type: 'STRING' } };
      const pr = `Eres Molí, un robot amigable que acompaña a una docente de Ciencia y Tecnología de 6.° grado de primaria en Perú. Escribe preguntas que tú, Molí, harás en voz alta a las niñas y niños en una diapositiva gigante. Cada pregunta: corta (máximo 14 palabras), clara, abierta, en primera persona del plural («¿Qué observamos…?»), sin la respuesta dentro, con signos ¿?.
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
        MD.LS.set(k, R); const cur = P.L[P.i]; armar(); if (cur) P.i = Math.max(0, P.L.findIndex(z => z.k === cur.k && z.u === cur.u && z.n === cur.n && z.j === cur.j)); pinta(false);
      } catch (e) { MD.LS.set(k, { _fallo: Date.now() }); pinta(false); }
    }
    const preguntasDe = it => { const C = MD.LS.get(hashQ(it), null), key = it.k === 'aq' ? 'a' + it.j : 'r'; if (C && Array.isArray(C[key]) && C[key].length) return { q: C[key] }; pedirIA(it); return { q: plantilla(it), wait: P.pide.has(hashQ(it)) && !C }; };
    const tema = it => { if (L(it.s.title)) return it.s.title; const C = MD.LS.get(hashQ(it), null); return C && L(C.t) ? C.t : temaDe(it.s, it.n); };
    const color = u => CV_PAL[(parseInt(u.num, 10) || 1) % CV_PAL.length];
    const crumb = it => `<div class="cv-crumb">${esc(it.u.icon || '📘')} Unidad ${esc(it.u.num)} · ${esc(it.u.title)} <b>Sesión ${it.n}</b></div>`;
    function slide(it) {
      const u = it.u, s = it.s, [c1, c2] = it.k in CV_BG ? CV_BG[it.k] : color(u), st = `style="--c1:${c1};--c2:${c2}"`;
      const mol = (im, inner) => `<div class="cv-sl" ${st}>${crumb(it)}<div class="cv-mqb"><img class="cv-moli" src="${IMG(im)}" alt="Molí"><div class="cv-bub">${inner}</div></div></div>`;
      if (it.k === 'uni') return `<div class="cv-sl cv-c" ${st}><span class="cv-pill">UNIDAD ${esc(u.num)}</span><div class="cv-ico">${esc(u.icon || '📘')}</div><h2 class="cv-h1">${esc(u.title)}</h2><p class="cv-sub">${it.ss.length} ${it.ss.length === 1 ? 'sesión' : 'sesiones'}</p></div>`;
      if (it.k === 'ses') return `<div class="cv-sl cv-c" ${st}><span class="cv-pill">${esc(u.icon || '📘')} UNIDAD ${esc(u.num)} · ${esc(u.title).toUpperCase()}</span><div class="cv-big">Sesión ${it.n}</div><h2 class="cv-h1">${esc(tema(it))}</h2></div>`;
      if (it.k === 'meta') { const cr = (s.criteria || []).filter(L); return `<div class="cv-sl" ${st}>${crumb(it)}<h2 class="cv-h2">🎯 Meta de la sesión</h2><p class="cv-lead">${L(s.meta) ? esc(s.meta) : 'Sin meta todavía'}</p>${cr.length ? `<h3>✅ Criterios de éxito</h3><ul class="cv-cards">${cr.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}${L(s.rubric) ? `<p class="cv-sub">📏 Criterio de la rúbrica: ${esc(s.rubric)}</p>` : ''}</div>`; }
      if (it.k === 'rol') return `<div class="cv-sl" ${st}>${crumb(it)}<h2 class="cv-h2">👥 Roles de trabajo</h2><ul class="cv-cards cv-c4">${CV_ROL.map(([i, n, d]) => `<li class="cv-role"><span>${i}</span><b>${n}</b><small>${d}</small></li>`).join('')}</ul></div>`;
      if (it.k === 'acu') return `<div class="cv-sl" ${st}>${crumb(it)}<h2 class="cv-h2">🤝 Acuerdos de convivencia</h2><ul class="cv-cards cv-c3">${CV_ACU.map(([i, t]) => `<li class="cv-role"><span>${i}</span><b>${t}</b></li>`).join('')}</ul></div>`;
      if (it.k === 'mq' || it.k === 'aq') { const Q = preguntasDe(it), tt = it.k === 'aq' ? `Sobre la actividad ${it.j}${L(it.x.title) ? ': ' + esc(it.x.title) : ''}` : it.prev ? `Recordamos la sesión ${it.prev.n}` : '¡Empezamos la unidad!';
        return mol(it.k === 'aq' ? 'curiosa' : it.prev ? 'pensativa' : 'hola', `<p class="cv-mqt">${tt}</p><ol>${Q.q.map(x => `<li>${esc(x)}</li>`).join('')}</ol>${Q.wait ? '<p class="cv-think">✨ Molí está leyendo la sesión…</p>' : ''}`); }
      if (it.k === 'voc' || it.k === 'sab') { const C = MD.LS.get(hashQ(it), null) || {}, w = C.w || {};
        return it.k === 'voc' ? mol('idea', `<p class="cv-mqt">📖 Palabra nueva</p><p class="cv-vw">${esc(w.p)}</p><p class="cv-vd">${esc(w.d)}</p>${L(w.e) ? `<p class="cv-ve">✏️ Ejemplo: ${esc(w.e)}</p>` : ''}`)
          : mol('estrellas', `<p class="cv-mqt">💡 ¿Sabías que…?</p><p class="cv-sb">${esc(C.s)}</p>`); }
      if (it.k === 'ref') return mol('pensativa', '<p class="cv-mqt">🪞 Nuestra última reflexión de la sesión</p><ol><li>¿Qué aprendí el día de hoy?</li><li>¿Qué necesité para alcanzar la meta?</li><li>¿Cómo o dónde aplicaría lo que aprendí?</li></ol>');
      if (it.k === 'exit') { const n = MD.preguntas(s).length; return mol('decidida', `<p class="cv-mqt">🎟️ Exit ticket</p><p class="cv-sb">¡Es momento de realizar nuestro Exit ticket!</p><p class="cv-mqt">⏱️ 5 minutos${n ? ` · ${n} pregunta${n > 1 ? 's' : ''}` : ''}</p>`); }
      if (it.k === 'act') { const x = it.x, m = MODOS[String(x.mode || '').toLowerCase()], C = (s.criteria || []).filter(L), Q = MD.LS.get(hashQ(it), null) || {}, ai = Q.c && +Q.c[it.j - 1], c = C[(ai >= 1 && ai <= C.length ? ai : Math.min(it.j, C.length)) - 1];
        return `<div class="cv-sl" ${st}>${crumb(it)}<div class="cv-acth"><span class="cv-num">${it.j}</span><h2 class="cv-h2" style="margin:0">Actividad ${it.j}</h2>${m ? `<span class="cv-pill">${m}</span>` : ''}</div>${c ? `<div class="cv-crb"><b>✅ Criterio de éxito</b>${esc(c)}</div>` : ''}${L(x.title) ? `<h3 class="cv-at">${esc(x.title)}</h3>` : ''}${L(x.desc) ? `<p class="cv-lead cv-box">${esc(x.desc)}</p>` : ''}${L(x.ficha) ? `<span class="cv-pill">📄 ${esc(x.ficha)}</span>` : ''}</div>`; }
      const qs = ((s.ticket && s.ticket.questions) || []).filter(x => x && L(x.q));
      return `<div class="cv-sl" ${st}>${crumb(it)}<h2 class="cv-h2">✅ Respuestas del Exit ticket</h2>${qs.length ? `<ol class="cv-cards cv-q">${qs.map(x => `<li><b>${esc(x.q)}</b><ul>${(x.options || []).map((o, k) => L(o) ? `<li class="${k === x.answer ? 'ok' : ''}">${k === x.answer ? '✓ ' : ''}${esc(o)}</li>` : '').join('')}</ul></li>`).join('')}</ol>` : '<p class="cv-lead">Sin preguntas todavía.</p>'}</div>`;
    }
    let el = null;
    function pinta(anim) {
      if (!el) return;
      const sl = el.querySelector('.cv-stage'); if (!P.L.length) { sl.innerHTML = `<div class="cv-sl cv-c" style="--c1:#7c3aed;--c2:#06b6d4"><div class="cv-ico">🎨</div><h2 class="cv-h1">Aún no hay sesiones</h2></div>`; return; }
      P.i = Math.max(0, Math.min(P.L.length - 1, P.i)); const it = P.L[P.i];
      sl.innerHTML = slide(it); if (anim) sl.firstChild.classList.add('cv-in');
      if (it.s) { preguntasDe({ ...it, k: 'mq' }); const nx = P.L.slice(P.i + 1).find(z => z.k === 'ses' && !(z.u === it.u && z.n === it.n)); nx && preguntasDe({ ...nx, k: 'mq' }); }
      el.querySelector('.cv-n').textContent = `${P.i + 1} / ${P.L.length}`;
      el.querySelector('[data-cv="-1"]').disabled = P.i === 0; el.querySelector('[data-cv="1"]').disabled = P.i === P.L.length - 1;
      const sel = el.querySelector('select'), key = it.k === 'uni' ? 'u:' + it.u.key : 's:' + it.u.key + ':' + it.n; if (sel.value !== key && [...sel.options].some(o => o.value === key)) sel.value = key;
    }
    function montar() {
      armar();
      host.innerHTML = `<div class="cv"><div class="cv-stage"></div><div class="cv-bar"><button data-cv="-1" aria-label="Anterior">‹</button><select aria-label="Ir a">${MD.unidades().map(u => `<option value="u:${esc(u.key)}">📘 Unidad ${esc(u.num)} · ${esc(u.title)}</option>${MD.sesionesDe(u).map(({ s, n }) => `<option value="s:${esc(u.key)}:${n}">   🗓️ Sesión ${n} · ${esc(temaDe(s, n)).slice(0, 50)}</option>`).join('')}`).join('')}</select><span class="cv-n"></span><button data-cv="1" aria-label="Siguiente">›</button></div></div>`;
      el = host.firstChild; const fs = () => { el.style.fontSize = Math.max(8, Math.min(22, el.clientHeight / 26)) + 'px'; }; fs(); P.ro = new ResizeObserver(fs); P.ro.observe(el);
      el.addEventListener('click', e => { const b = e.target.closest('[data-cv]'); if (!b) return; e.stopPropagation(); P.i += +b.dataset.cv; pinta(true); });
      el.querySelector('select').addEventListener('change', e => { const v = e.target.value.split(':'); const k = P.L.findIndex(z => v[0] === 'u' ? z.k === 'uni' && z.u.key === v[1] : z.k === 'ses' && z.u.key === v[1] && z.n === +v[2]); if (k >= 0) { P.i = k; pinta(true); } });
      let x0 = null; el.addEventListener('pointerdown', e => { x0 = e.target.closest('.cv-bar') ? null : e.clientX; }); el.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) { P.i += dx < 0 ? 1 : -1; pinta(true); } });
      pinta(true);
    }
    function gate() {
      host.innerHTML = `<div class="cv"><div class="cv-gate"><form><img src="${IMG('decidida')}" alt="" style="width:4em"><br><b>🔒 Mi presentación</b><p style="margin:.3em 0">Escribe la contraseña para entrar.</p><input type="password" inputmode="numeric" autocomplete="off" aria-label="Contraseña"><div class="err" style="color:#b91c1c;font-weight:800;min-height:1.2em"></div><button type="submit">Entrar</button></form></div></div>`;
      el = host.firstChild; el.style.fontSize = Math.max(9, Math.min(18, el.clientHeight / 24)) + 'px';
      const f = el.querySelector('form'); f.addEventListener('submit', e => { e.preventDefault(); if (f.querySelector('input').value.trim() === '123') { try { sessionStorage.setItem('moli2:cv', '1'); } catch (x) {} el = null; montar(); } else f.querySelector('.err').textContent = 'Contraseña incorrecta.'; });
    }
    P.iniciar = () => { host.innerHTML = '<div class="cv"><div class="cv-gate"><b style="font-size:1.4em">🎨 Preparando Mi presentación…</b></div></div>';
      MD.cargar().then(() => { let ok = MD.esDocente(); try { ok = ok || sessionStorage.getItem('moli2:cv') === '1'; } catch (e) {} ok ? montar() : gate(); }).catch(() => { host.innerHTML = '<div class="cv"><div class="cv-gate"><b>📶 No pude cargar las sesiones. Revisa tu internet.</b></div></div>'; }); };
    P.cerrar = () => { P.ro && P.ro.disconnect(); };
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
    _: { Libro, esc, L, IMG, cargando, nivelChip, temaDe, temaCorto, MODOS, hojaUnidades, fichaHtml },
    cerrar() { if (actual) { actual.libro && actual.libro.ro && actual.libro.ro.disconnect(); actual.cerrar && actual.cerrar(); actual = null; } }
  };
})();
