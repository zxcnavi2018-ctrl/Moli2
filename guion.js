// ===================================================================
//  🤝 ACUERDOS DE CONVIVENCIA y 👥 ROLES DE TRABAJO (diapositivas de Mi presentación, en todas las sesiones)
//  Como «Molí nos sincroniza»: suena el silbato, Molí 3D saluda con la voz de los videos (audio/guion/*.mp3)
//  y luego se va a la izquierda. La docente aprieta A (teclado o mando) para seguir.
//   Acuerdos: Molí presenta cada acuerdo y pregunta «¿Por qué es importante?» · A → «¿Qué pasaría si no lo cumplimos?» · A → el siguiente…
//   Roles: Molí nombra los roles · A → «¡Levanten la mano los helpers!» · A → los líderes… (cada A, el siguiente rol)
//  Guion.html(tipo) · Guion.montar(diapositiva, tipo) · Guion.avanzar() · Guion.parar() · Guion.activo()
// ===================================================================
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ACU = [['✋', 'Levantar la mano para participar', 'acu1'], ['🤫', 'No conversamos en clase', 'acu2'], ['🪑', 'Nos quedamos en nuestro sitio', 'acu3']];
  const ROL = [['🧰', 'HELPER', 'Trae y organiza los materiales', 'rol_helper'], ['⭐', 'LÍDER', 'Organiza al equipo y anima a todos a participar', 'rol_lider'], ['🎨', 'DESIGNER', 'Hace que el trabajo se vea bonito y ordenado', 'rol_designer'],
    ['⏱️', 'TIMER', 'Cuida el tiempo del equipo', 'rol_timer'], ['🎤', 'SPEAKER', 'Presenta y habla por el equipo', 'rol_speaker']];
  // lo que dice Molí (subtítulo = lo mismo que la voz grabada)
  const SUB = {
    acu_hola: '¡Hola, chicos! Ahora vamos a recordar nuestros acuerdos de convivencia.',
    acu1: 'Primer acuerdo: levantamos la mano para participar.', acu2: 'Segundo acuerdo: no conversamos en clase.', acu3: 'Tercer acuerdo: nos quedamos en nuestro sitio.',
    acu_pq: '¿Por qué es importante este acuerdo?', acu_no: '¿Y qué pasaría si no lo cumplimos?', acu_fin: '¡Muy bien! Cumplamos nuestros acuerdos para aprender mejor.',
    rol_hola: '¡Hola, chicos! Ahora vamos a recordar nuestros roles de trabajo.',
    rol_lista: 'En cada equipo existen los helpers, el designer, el líder, el timer y el speaker.',
    rol_helper: '¡Levanten la mano los helpers! Ustedes traen y organizan los materiales.',
    rol_lider: '¡Levanten la mano los líderes! Ustedes organizan al equipo y animan a todos a participar.',
    rol_designer: '¡Levanten la mano los designers! Ustedes hacen que el trabajo se vea bonito y ordenado.',
    rol_timer: '¡Levanten la mano los timers! Ustedes cuidan el tiempo del equipo.',
    rol_speaker: '¡Levanten la mano los speakers! Ustedes presentan y hablan por el equipo.',
    rol_fin: '¡Excelente! Cada uno cumple su rol para que el equipo funcione.' };
  const RUTA = k => /^(silbato|ding)$/.test(k) ? 'audio/sync/' + k + '.mp3' : 'audio/guion/' + k + '.mp3';
  const dur = k => k === 'silbato' ? 1.6 : k === 'ding' ? 0.6 : Math.max(1.4, String(SUB[k] || '').split(/\s+/).length * 0.42);   // si el audio no carga, el subtítulo se queda lo que tardaría en decirse
  const AUD = {}, audio = k => AUD[k] || (AUD[k] = Object.assign(new Audio(RUTA(k)), { preload: 'auto' }));
  let S = null;

  function html(tipo) {
    const acu = tipo === 'acu', L = acu ? ACU : ROL;
    return `<div class="cv-sl sy gu gu-${tipo}" style="--c1:${acu ? '#065f46' : '#4c1d95'};--c2:${acu ? '#10b981' : '#8b5cf6'}"><div class="sy-luz"></div>
      <div class="sy-mo"><canvas></canvas><img class="sy-img" src="img/moli/hola.webp" alt="Molí" hidden><div class="sy-fl i"></div><div class="sy-fl d"></div></div>
      <div class="sy-bub" hidden></div>
      <div class="gu-pan" hidden><h2 class="gu-t">${acu ? '🤝 Acuerdos de convivencia' : '👥 Roles de trabajo'}</h2>
        <ul class="gu-cards gu-n${L.length}">${L.map((x, k) => `<li class="gu-c" data-k="${k}"><span>${x[0]}</span><b>${esc(x[1])}</b>${acu ? '' : `<small>${esc(x[2])}</small>`}</li>`).join('')}</ul>
        <div class="gu-q" hidden></div></div>
      <div class="sy-bt"><button type="button" class="sy-rep" data-gurep title="Repetir desde el inicio">🔁</button><button type="button" class="sy-a" data-gua hidden>Ⓐ Siguiente</button></div></div>`;
  }

  // ---- Molí 3D (si no hay 3D, su foto) ----
  function tres(cv) {
    const T = window.THREE; if (!T || !window.crearMoli) return null;
    let r; try { r = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch (e) { return null; }
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.setClearColor(0x000000, 0);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 50);
    sc.add(new T.HemisphereLight(0xfffdf8, 0x7f8ba3, 0.75)); const k1 = new T.DirectionalLight(0xfff8ee, 0.85), k2 = new T.DirectionalLight(0x9fd6ff, 0.5); k1.position.set(2.5, 4, 5); k2.position.set(-3, 2, -2); sc.add(k1, k2);
    const m = crearMoli(T, { renderer: r }); sc.add(m.root); m.mirar(new T.Vector3(0, 1.05, 8));
    let raf = 0, t0 = performance.now() / 1000, last = t0, w = 0, h = 0;
    const tick = () => { raf = requestAnimationFrame(tick); const now = performance.now() / 1000, dt = now - last; last = now;
      const W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return; if (W !== w || H !== h) { w = W; h = H; r.setSize(W, H, false); cam.aspect = W / H; const f = Math.max(1, 0.62 / cam.aspect); cam.position.set(0, 1.12, 5.4 * f); cam.lookAt(0, 1.12, 0); cam.updateProjectionMatrix(); }
      m.update(now - t0, dt); r.render(sc, cam); };
    tick();
    return { m, parar() { cancelAnimationFrame(raf); try { r.dispose(); r.forceContextLoss(); } catch (e) {} } };
  }
  const M2D = el => ({ expr() {}, accion() {}, hablar(on) { el.classList.toggle('habla', !!on); }, brazo(l, on) { el.classList.toggle(l > 0 ? 'upd' : 'upi', !!on); } });

  // ---- hablar y esperar ----
  const espera = ms => new Promise(res => { const t = setTimeout(res, ms); S && S.T.push(t); });
  function decir(k, sub = true) {
    return new Promise(res => { if (!S) return res(); const s = S, a = audio(k), t0 = Date.now(), d = dur(k), voz = !/^(silbato|ding)$/.test(k); let fin = false;
      const listo = () => { if (fin) return; fin = true; a.onended = a.onerror = null; if (s.M && voz) s.M.hablar(false); res(); };
      if (sub && SUB[k]) burbuja(SUB[k]); if (s.M && voz) s.M.hablar(true);
      s.a = a; a.onended = () => setTimeout(listo, 150); a.onerror = () => s.T.push(setTimeout(listo, Math.max(0, d * 1000 - (Date.now() - t0))));
      try { a.currentTime = 0; } catch (e) {}
      const p = a.play(); if (p && p.catch) p.catch(() => s.T.push(setTimeout(listo, d * 1000)));
      s.T.push(setTimeout(listo, d * 1000 + 4000)); });
  }
  function burbuja(t) { if (!S) return; const b = S.el.querySelector('.sy-bub'); b.hidden = !t; b.textContent = t || ''; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
  function pregunta(t) { if (!S) return; const q = S.el.querySelector('.gu-q'); q.hidden = !t; q.textContent = t || ''; q.classList.remove('in'); if (t) { void q.offsetWidth; q.classList.add('in'); } }
  const marcar = k => { if (!S) return; S.el.querySelectorAll('.gu-c').forEach(c => { const j = +c.dataset.k; c.classList.toggle('on', j === k); c.classList.toggle('ya', k != null && j < k); c.classList.toggle('apa', k === -2 || j <= (k == null ? -1 : k)); }); };
  const boton = on => { if (!S) return; S.el.querySelector('[data-gua]').hidden = !on; };
  const panel = () => { if (!S) return; S.el.classList.add('izq'); const p = S.el.querySelector('.gu-pan'); if (p.hidden) { p.hidden = false; p.classList.add('in'); } };
  const mano = (on, ambas) => { if (!S || !S.M) return; S.M.brazo(1, on); if (ambas) S.M.brazo(-1, on); };

  // ---- los guiones: una lista de pasos; cada paso corre solo y al terminar espera la A ----
  const PASOS = {
    acu: [
      async ok => { const M = S.M; M.expr('feliz'); await decir('silbato'); ok(); M.accion && M.accion('saludar'); await decir('acu_hola'); ok(); M.expr('normal'); await espera(300); ok(); panel(); await espera(900); ok(); },
      ...ACU.flatMap((x, k) => [
        async ok => { pregunta(''); marcar(k); mano(k === 0); S.M.expr('feliz'); await decir(x[2]); ok(); mano(false); S.M.expr('pensativo'); pregunta('🤔 ' + SUB.acu_pq); await decir('acu_pq', false); ok(); S.M.expr('normal'); },
        async ok => { S.M.expr('sorpresa'); pregunta('😮 ' + SUB.acu_no); await decir('acu_no', false); ok(); S.M.expr('normal'); }]),
      async ok => { pregunta(''); marcar(-2); mano(true, true); S.M.expr('estrellas'); S.M.accion && S.M.accion('saltar'); await decir('acu_fin'); ok(); await espera(800); ok(); mano(false, true); S.M.expr('feliz'); return 'fin'; }],
    rol: [
      async ok => { const M = S.M; M.expr('feliz'); await decir('silbato'); ok(); M.accion && M.accion('saludar'); await decir('rol_hola'); ok(); M.expr('normal'); panel(); await espera(700); ok();
        const p = decir('rol_lista'); for (let k = 0; k < ROL.length; k++) { marcar(k); await espera(820); ok(); } marcar(-1); S.el.querySelectorAll('.gu-c').forEach(c => c.classList.add('apa')); await p; ok(); },
      ...ROL.map((x, k) => async ok => { marcar(k); mano(true); S.M.expr('feliz'); decir('ding', false); await espera(250); ok(); await decir(x[3]); ok(); await espera(500); ok(); mano(false); S.M.expr('normal'); }),
      async ok => { marcar(-2); mano(true, true); S.M.expr('estrellas'); S.M.accion && S.M.accion('girar'); await decir('rol_fin'); ok(); await espera(800); ok(); mano(false, true); S.M.expr('feliz'); return 'fin'; }]
  };
  async function correr() {                                           // corre el paso actual; al terminar aparece el botón A (si quedan pasos)
    if (!S) return; const g = ++S.g, s = S, ok = () => { if (!S || S !== s || S.g !== g) throw 0; };
    boton(false);
    try { const r = await PASOS[s.tipo][s.p](ok); ok(); s.p++; boton(r !== 'fin' && s.p < PASOS[s.tipo].length); } catch (e) {}
  }
  function cortar() { if (!S) return; S.T.forEach(clearTimeout); S.T = []; if (S.a) { try { S.a.pause(); } catch (e) {} } if (S.M) S.M.hablar(false); }
  function avanzar() {                                                // A: si Molí todavía habla, salta al final de ese paso; si no, el siguiente
    if (!S) return; const btn = S.el.querySelector('[data-gua]');
    if (btn.hidden) { if (S.p === 0) { cortar(); S.g++; burbuja(''); panel(); S.p = 1; marcar(null); return correr(); } return; }
    if (S.p < PASOS[S.tipo].length) correr();
  }
  function montar(el, tipo) {
    parar(); if (!PASOS[tipo]) return;
    const cv = el.querySelector('canvas'), mo = el.querySelector('.sy-mo'), x = tres(cv);
    if (!x) { cv.hidden = true; el.querySelector('.sy-img').hidden = false; mo.classList.add('d2'); }
    S = { el, tipo, p: 0, g: 0, T: [], a: null, x, M: x ? x.m : M2D(mo) };
    el.addEventListener('click', e => { if (e.target.closest('[data-gua]')) { e.stopPropagation(); avanzar(); } else if (e.target.closest('[data-gurep]')) { e.stopPropagation(); repetir(); } });
    Object.keys(SUB).forEach(audio); audio('silbato');                  // que no se trabe la primera vez
    const s = S; setTimeout(() => S === s && correr(), 500);
  }
  function repetir() { if (!S) return; const { el, tipo } = S; cortar(); S.g++; el.classList.remove('izq'); const p = el.querySelector('.gu-pan'); p.hidden = true; p.classList.remove('in'); pregunta(''); burbuja(''); marcar(null); mano(false, true); S.p = 0; correr(); }
  function parar() { if (!S) return; cortar(); S.g++; if (S.x) S.x.parar(); S = null; }
  // ⌨️ la tecla A (sin escribir en un cuadro de texto) hace el siguiente paso
  addEventListener('keydown', e => { if (!S || e.repeat || e.ctrlKey || e.metaKey || e.altKey || (e.key || '').toLowerCase() !== 'a' || /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '') || (e.target && e.target.isContentEditable)) return;
    if (!document.body.contains(S.el)) return parar(); e.preventDefault(); e.stopPropagation(); avanzar(); }, true);
  window.Guion = { html, montar, avanzar, parar, activo: () => !!S && document.body.contains(S.el), SUB, ACU, ROL };
})();
