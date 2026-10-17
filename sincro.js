// ===================================================================
//  🚩 MOLÍ NOS SINCRONIZA (diapositiva de Mi presentación, después de las preguntas de cada actividad)
//  Suena un silbato y Molí, con una bandera en cada mano, hace levantar la mano derecha y la izquierda
//  (3, 2, 1), luego explica cómo se responde y se va a la izquierda. La docente aprieta A (teclado o mando):
//    A → sale la pregunta con una respuesta a cada lado · A → «¡Manos arriba!» 3, 2, 1 · A → la respuesta correcta.
//  Es la misma animación en todas las actividades: sólo cambian la pregunta y sus respuestas.
//  Sincro.html(Q) · Sincro.montar(diapositiva, Q) · Sincro.avanzar() · Sincro.actualizar(Q) · Sincro.parar()
//  Q = { q, i, d, ok: 'i' | 'd', wait }  (la voz es la de Molí en los videos: audio/sync/*.mp3)
// ===================================================================
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SUB = { hola: '¡Hola, chicos! ¡Vamos a sincronizarnos!', der: 'Levanta tu mano derecha en…', izq: 'Ahora, levanta tu mano izquierda en…', bien: '¡Muy bien!', rapido: '¡Ahora, más rápido!', d: '¡Derecha!', i: '¡Izquierda!',
    listos: '¡Excelente! ¡Ya estamos sincronizados!', expl1: 'Ahora, vamos a responder la pregunta.', expl2: '✋ Mano izquierda si la respuesta es la de la izquierda.', expl3: 'Mano derecha si la respuesta es la de la derecha. ✋',
    lee: '¡Lee la pregunta y piensa bien tu respuesta!', arriba1: '¡Manos arriba en…', arriba: '¡Arriba!', correcta: '¡Esta es la respuesta correcta!' };
  const DUR = { silbato: 1.6, hola: 2.2, der: 1.8, izq: 2.1, n3: 0.6, n2: 0.6, n1: 0.6, bien: 0.8, rapido: 1.3, d: 0.8, i: 0.8, listos: 2.2, expl1: 2.1, expl2: 3.4, expl3: 3, lee: 2.5, arriba1: 1.2, arriba: 0.7, correcta: 1.7, ding: 0.6 };
  const AUD = {}, audio = k => AUD[k] || (AUD[k] = Object.assign(new Audio('audio/sync/' + k + '.mp3'), { preload: 'auto' }));
  const BOT = ['', 'Ⓐ Mostrar la pregunta', 'Ⓐ ¡Manos arriba!', 'Ⓐ Ver la respuesta', ''];
  const cur = () => S && (S.k ? (S.Q && S.Q.mas || [])[S.k - 1] : S.Q);            // la pregunta que está en pantalla (la 1.ª o una más difícil)
  const hayMas = () => !!(S && S.Q && S.Q.mas && (S.k || 0) < S.Q.mas.length);
  const COL = { i: '#2563eb', d: '#f97316' };
  let S = null;

  function html(Q) {
    return `<div class="cv-sl sy" style="--c1:#0b3b6f;--c2:#0ea5e9"><div class="sy-luz"></div>
      <div class="sy-mo"><canvas></canvas><img class="sy-img" src="img/moli/hola.webp" alt="Molí" hidden><div class="sy-fl i"></div><div class="sy-fl d"></div></div>
      <div class="sy-bub" hidden></div><div class="sy-num"></div>
      <div class="sy-pre" hidden>${preHtml(Q)}</div>
      <div class="sy-bt"><button type="button" class="sy-rep" data-syrep title="Repetir la sincronización">🔁</button><button type="button" class="sy-a" data-sync hidden></button></div></div>`;
  }
  const preHtml = (Q, nv) => !Q || !Q.q ? '<p class="sy-q">✨ Molí está pensando la pregunta…</p>'
    : `${nv ? `<p class="sy-nv">${nv === 1 ? '🔥 ¡Más difícil!' : '🔥🔥 ¡La más difícil!'}</p>` : ''}<p class="sy-q">${esc(Q.q)}</p><div class="sy-ops"><div class="sy-op i"><span class="sy-lado">✋ IZQUIERDA</span><b>${esc(Q.i)}</b></div><div class="sy-op d"><span class="sy-lado">DERECHA ✋</span><b>${esc(Q.d)}</b></div></div>`;

  // ---- Molí 3D con sus dos banderas (si no hay 3D, su foto con banderitas de CSS) ----
  function tres(cv) {
    const T = window.THREE; if (!T || !window.crearMoli) return null;
    let r; try { r = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch (e) { return null; }
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.setClearColor(0x000000, 0);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 50);
    sc.add(new T.HemisphereLight(0xfffdf8, 0x7f8ba3, 0.75)); const k1 = new T.DirectionalLight(0xfff8ee, 0.85), k2 = new T.DirectionalLight(0x9fd6ff, 0.5); k1.position.set(2.5, 4, 5); k2.position.set(-3, 2, -2); sc.add(k1, k2);
    const m = crearMoli(T, { renderer: r }); sc.add(m.root); m.mirar(new T.Vector3(0, 1.05, 8));
    const flags = {};
    [-1, 1].forEach(sx => {                                             // palito + tela que flamea; sale de la manito hacia afuera cuando el brazo sube
      const g = new T.Group(), c = new T.Color(sx < 0 ? COL.i : COL.d);
      const palo = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 0.78, 10), new T.MeshStandardMaterial({ color: 0xf1e7d0, roughness: 0.6 })); palo.position.y = -0.27; g.add(palo);
      const bola = new T.Mesh(new T.SphereGeometry(0.03, 12, 10), new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })); bola.position.y = -0.67; g.add(bola);
      const geo = new T.PlaneGeometry(0.46, 0.3, 14, 4); geo.translate(-0.23 * sx, 0, 0);
      const tela = new T.Mesh(geo, new T.MeshStandardMaterial({ color: c, roughness: 0.55, side: T.DoubleSide })); tela.position.set(-0.012 * sx, -0.5, 0); g.add(tela);
      m.manos[sx].add(g); flags[sx] = { g, geo, base: geo.attributes.position.array.slice() };
    });
    let raf = 0, t0 = performance.now() / 1000, last = t0, w = 0, h = 0;
    const tick = () => { raf = requestAnimationFrame(tick); const now = performance.now() / 1000, dt = now - last; last = now;
      const W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return; if (W !== w || H !== h) { w = W; h = H; r.setSize(W, H, false); cam.aspect = W / H; const f = Math.max(1, 0.62 / cam.aspect); cam.position.set(0, 1.12, 5.4 * f); cam.lookAt(0, 1.12, 0); cam.updateProjectionMatrix(); }
      m.update(now - t0, dt);
      [-1, 1].forEach(sx => { const F = flags[sx], p = F.geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = F.base[i * 3], k = Math.abs(x) / 0.46; p.setZ(i, Math.sin(now * 7 + k * 5) * 0.045 * k); } p.needsUpdate = true; });
      r.render(sc, cam); };
    tick();
    return { m, parar() { cancelAnimationFrame(raf); try { r.dispose(); r.forceContextLoss(); } catch (e) {} } };
  }
  const Molí2D = el => ({ expr() {}, accion() {}, hablar(on) { el.classList.toggle('habla', !!on); }, brazo(l, on) { el.classList.toggle(l > 0 ? 'upd' : 'upi', !!on); } });

  // ---- hablar, esperar y la línea de tiempo ----
  const espera = ms => new Promise(res => { const t = setTimeout(res, ms); S && S.T.push(t); });
  function decir(k, sub = true) {
    return new Promise(res => { if (!S) return res(); const s = S, a = audio(k), t0 = Date.now(); let fin = false;
      const listo = () => { if (fin) return; const falta = DUR[k] * 900 - (Date.now() - t0); if (falta > 40) { s.T.push(setTimeout(listo, falta)); return; } fin = true; a.onended = a.onerror = null; if (s.M && k !== 'silbato' && k !== 'ding') s.M.hablar(false); res(); };
      if (sub && SUB[k]) burbuja(SUB[k]); if (s.M && k !== 'silbato' && k !== 'ding') s.M.hablar(true);
      s.a = a; a.onended = listo; a.onerror = () => setTimeout(listo, DUR[k] * 1000); try { a.currentTime = 0; } catch (e) {}
      const p = a.play(); if (p && p.catch) p.catch(() => { const t = setTimeout(listo, DUR[k] * 1000); s.T.push(t); });
      s.T.push(setTimeout(listo, DUR[k] * 1000 + 2500)); });
  }
  function burbuja(t) { if (!S) return; const b = S.el.querySelector('.sy-bub'); b.hidden = !t; b.textContent = t || ''; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
  function numero(n) { if (!S) return; const e = S.el.querySelector('.sy-num'); e.textContent = n; e.classList.remove('pop'); if (n) { void e.offsetWidth; e.classList.add('pop'); } }
  const bandera = (l, on) => { if (!S || !S.M) return; S.M.brazo(l, on); };
  async function intro(g) {
    const ok = () => { if (!S || S.g !== g) throw 0; }, M = S.M;
    try {
      M.expr('feliz'); await decir('silbato'); ok(); await decir('hola'); ok(); M.expr('normal');
      for (const [k, l] of [['der', 1], ['izq', -1]]) {
        await decir(k); ok();
        for (const n of ['n3', 'n2', 'n1']) { numero(n[1]); await Promise.all([decir(n, false), espera(900)]); ok(); }
        numero(''); bandera(l, true); M.expr('feliz'); await decir('bien'); ok(); await espera(700); ok(); bandera(l, false); M.expr('normal'); await espera(400); ok();
      }
      await decir('rapido'); ok();
      for (const l of [1, -1, 1, -1]) { bandera(-l, false); bandera(l, true); await decir(l > 0 ? 'd' : 'i'); ok(); await espera(420); ok(); }
      bandera(1, false); bandera(-1, false); M.expr('feliz'); M.accion('girar'); await decir('listos'); ok(); M.expr('normal'); await espera(300); ok();
      await decir('expl1'); ok();
      bandera(-1, true); await decir('expl2'); ok(); bandera(-1, false); await espera(250); ok();
      bandera(1, true); await decir('expl3'); ok(); bandera(1, false); await espera(500); ok();
      fase(1);
    } catch (e) {}
  }
  function fase(n) {
    if (!S) return; S.f = n; const el = S.el, b = el.querySelector('[data-sync]');
    const tx = n === 4 && hayMas() ? 'Ⓐ Otra pregunta más difícil' : BOT[n];
    el.classList.toggle('izq', n >= 1); b.hidden = !tx; b.textContent = tx;
    if (n === 1) { burbuja(''); numero(''); }
    if (n >= 2) { const p = el.querySelector('.sy-pre'); if (p.hidden) { p.hidden = false; p.classList.add('in'); } }
  }
  async function paso() {                                             // lo que hace cada A
    const g = ++S.g, ok = () => { if (!S || S.g !== g) throw 0; }, M = S.M, el = S.el;
    try {
      if (S.f === 0) { cortar(); bandera(1, false); bandera(-1, false); M.hablar(false); return fase(1); }   // A durante la animación: la salta
      if (S.f === 1) { fase(2); decir('ding', false); await espera(350); ok(); M.expr('pensativo'); await decir('lee'); ok(); burbuja(''); M.expr('normal'); return; }
      if (S.f === 2) { fase(3); await decir('arriba1'); ok(); for (const n of ['n3', 'n2', 'n1']) { numero(n[1]); await Promise.all([decir(n, false), espera(900)]); ok(); }
        numero(''); bandera(1, true); bandera(-1, true); M.expr('feliz'); await decir('arriba'); ok(); await espera(900); ok(); bandera(1, false); bandera(-1, false); M.expr('normal'); burbuja(''); return; }
      if (S.f === 4) { S.k = (S.k || 0) + 1; const p = el.querySelector('.sy-pre'); p.innerHTML = preHtml(cur(), S.k); p.classList.remove('in'); void p.offsetWidth; p.classList.add('in');   // A: otra pregunta, más difícil
        bandera(1, false); bandera(-1, false); fase(2); decir('ding', false); await espera(350); ok(); M.expr('pensativo'); await decir('lee'); ok(); burbuja(''); M.expr('normal'); return; }
      if (S.f === 3) { const Q = cur(), lado = Q && Q.ok === 'd' ? 1 : -1; fase(4);
        el.querySelectorAll('.sy-op').forEach(o => o.classList.add(o.classList.contains(Q && Q.ok === 'd' ? 'd' : 'i') ? 'ok' : 'no'));
        bandera(lado, true); M.expr('estrellas'); M.accion('saltar'); decir('ding', false); await espera(300); ok(); await decir('correcta'); ok(); await espera(1200); ok(); bandera(lado, false); M.expr('feliz'); }
    } catch (e) {}
  }
  function cortar() { if (!S) return; S.T.forEach(clearTimeout); S.T = []; if (S.a) { try { S.a.pause(); } catch (e) {} } }

  function montar(el, Q) {
    parar();
    const cv = el.querySelector('canvas'), mo = el.querySelector('.sy-mo'), x = tres(cv);
    if (!x) { cv.hidden = true; el.querySelector('.sy-img').hidden = false; mo.classList.add('d2'); }
    S = { el, Q, f: 0, g: 0, T: [], a: null, x, M: x ? x.m : Molí2D(mo) };
    el.addEventListener('click', e => { if (e.target.closest('[data-sync]')) { e.stopPropagation(); avanzar(); } else if (e.target.closest('[data-syrep]')) { e.stopPropagation(); repetir(); } });
    Object.keys(DUR).forEach(audio);                                   // que no se trabe la primera vez
    const g = ++S.g; setTimeout(() => S && S.g === g && intro(g), 500);
  }
  function repetir() { if (!S) return; S.k = 0; const { el, Q } = S; el.classList.remove('izq'); const p = el.querySelector('.sy-pre'); p.hidden = true; p.classList.remove('in'); p.innerHTML = preHtml(Q);
    cortar(); bandera(1, false); bandera(-1, false); S.f = 0; fase(0); el.classList.remove('izq'); const g = ++S.g; intro(g); }
  function avanzar() { if (S && (S.f < 4 || hayMas())) paso(); }
  function actualizar(Q) { if (!S) return; S.Q = Q; if (!S.k && S.f < 4) { const p = S.el.querySelector('.sy-pre'); p.innerHTML = preHtml(Q); } }
  function parar() { if (!S) return; cortar(); S.g++; if (S.x) S.x.parar(); S = null; }
  // ⌨️ la tecla A (sin escribir en un cuadro de texto) hace el siguiente paso
  addEventListener('keydown', e => { if (!S || e.repeat || e.ctrlKey || e.metaKey || e.altKey || (e.key || '').toLowerCase() !== 'a' || /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '') || (e.target && e.target.isContentEditable)) return;
    if (!document.body.contains(S.el)) return parar(); e.preventDefault(); e.stopPropagation(); avanzar(); }, true);
  window.Sincro = { html, montar, avanzar, actualizar, parar, activo: () => !!S && document.body.contains(S.el) };
})();
