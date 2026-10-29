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
    rol_fin: '¡Excelente! Cada uno cumple su rol para que el equipo funcione.',
    sab_hola: '¡Miren mi caja secreta! ¿Qué habrá adentro?', sab_intro: '¿Sabías que…?',
    ref_hola: '¡Es hora de la reflexión! Pensemos en lo que aprendimos hoy.',
    ref_q1: '¿Qué aprendí el día de hoy?', ref_q2: '¿Qué necesité para alcanzar la meta?', ref_q3: '¿Cómo o dónde aplicaría lo que aprendí?',
    ref_fin: '¡Muy bien! Gracias por compartir sus ideas.',
    rt_hola: '¡Hola! Les cuento nuestra secuencia de clase.',
    rt_1: 'Primero, nos saludamos con alegría.', rt_2: 'Luego, organizamos el aula y recordamos nuestros roles.',
    rt_3: 'Después, conocemos la meta y los criterios de éxito.', rt_4: 'Luego, realizamos las actividades de clase.',
    rt_5: 'Después, reflexionamos sobre lo que aprendimos.', rt_6: 'Y al final, dejamos el aula limpia y ordenada.',
    rt_fin: '¡Esa es nuestra secuencia de clase!' };
  const REF = ['ref_q1', 'ref_q2', 'ref_q3'];
  // el texto del «¿Sabías que…?» cambia en cada sesión: su voz se busca por su huella (audio/guion/sab/<huella>.mp3)
  const huella = t => { let h = 5381; t = String(t || '').trim(); for (let i = 0; i < t.length; i++) h = 33 * h + t.charCodeAt(i) | 0; return (h >>> 0).toString(36); };
  const limpiaSab = t => String(t || '').replace(/^\s*¿?\s*sab[ií]as\s+que\s*(…|\.\.\.)?\s*/i, '').trim();
  const RUTA = k => /^(silbato|ding)$/.test(k) ? 'audio/sync/' + k + '.mp3' : /^sab:/.test(k) ? 'audio/guion/sab/' + huella(k.slice(4)) + '.mp3' : 'audio/guion/' + k + '.mp3';
  const texto = k => /^sab:/.test(k) ? k.slice(4) : SUB[k] || '';
  const dur = k => k === 'silbato' ? 1.6 : k === 'ding' ? 0.6 : Math.max(1.4, texto(k).split(/\s+/).length * 0.42);   // si el audio no carga, el subtítulo se queda lo que tardaría en decirse
  const AUD = {}, audio = k => AUD[k] || (AUD[k] = Object.assign(new Audio(RUTA(k)), { preload: 'auto' }));
  let S = null;

  // 🕷️ en Halloween la tarjeta del «¿Sabías que…?» baja colgada de una araña, rebota con un «plop» y la araña se vuelve a subir
  const HW = () => !!(window.esHalloween && esHalloween());
  const ARANA = `<div class="gu-arana" aria-hidden="true"><i></i><svg viewBox="0 0 120 100"><g stroke="#111" stroke-width="5" stroke-linecap="round" fill="none">
    <path d="M45 50 Q25 30 8 38"/><path d="M45 56 Q22 50 4 62"/><path d="M47 62 Q28 70 12 88"/><path d="M50 66 Q38 82 30 98"/>
    <path d="M75 50 Q95 30 112 38"/><path d="M75 56 Q98 50 116 62"/><path d="M73 62 Q92 70 108 88"/><path d="M70 66 Q82 82 90 98"/></g>
    <ellipse cx="60" cy="60" rx="22" ry="20" fill="#1c1917"/><circle cx="60" cy="36" r="14" fill="#1c1917"/>
    <circle cx="54" cy="34" r="5" fill="#fff"/><circle cx="66" cy="34" r="5" fill="#fff"/><circle cx="55" cy="35" r="2.4" fill="#111"/><circle cx="67" cy="35" r="2.4" fill="#111"/>
    <path d="M53 44 Q60 49 67 44" stroke="#f97316" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M50 62 L70 62" stroke="#f97316" stroke-width="3"/></svg></div>`;
  let ctxA = null;
  function plop() { try { ctxA = ctxA || new (window.AudioContext || window.webkitAudioContext)(); const c = ctxA, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(700, t); o.frequency.exponentialRampToValueAtTime(130, t + 0.16); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.25); } catch (e) {} }
  function html(tipo, D) {
    if (tipo === 'sab') return `<div class="cv-sl sy gu gu-sab${HW() ? ' hw' : ''}" style="--c1:#1e1b4b;--c2:#7c3aed"><div class="sy-luz"></div>
      <div class="sy-mo"><canvas></canvas><img class="sy-img" src="img/moli/estrellas.webp" alt="Molí" hidden></div>
      <div class="gu-caja"><i class="gu-tapa"></i><i class="gu-cuerpo">?</i><i class="gu-brillo"></i></div><div class="gu-pum"></div>
      <div class="sy-bub" hidden></div>
      <div class="gu-dato" hidden>${HW() ? ARANA : ''}<b>💡 ¿Sabías que…?</b><p>${esc(limpiaSab(D && D.t) || '✨ Molí está buscando un dato curioso…')}</p></div>
      <div class="sy-bt"><button type="button" class="sy-rep" data-gurep title="Repetir desde el inicio">🔁</button><button type="button" class="sy-a" data-gua hidden>Ⓐ Abrir la caja secreta</button></div></div>`;
    if (tipo === 'ref') return `<div class="cv-sl sy gu gu-ref" style="--c1:#7c2d12;--c2:#f59e0b"><div class="sy-luz"></div>
      <div class="sy-mo"><canvas></canvas><img class="sy-img" src="img/moli/feliz.webp" alt="Molí" hidden></div>
      <div class="sy-bub" hidden></div>
      <div class="gu-pan" hidden><h2 class="gu-t">🪞 Reflexionamos</h2><ol class="gu-ref-l">${REF.map((k, j) => `<li class="gu-c" data-k="${j}"><b>${esc(SUB[k])}</b></li>`).join('')}</ol></div>
      <div class="sy-bt"><button type="button" class="sy-rep" data-gurep title="Repetir desde el inicio">🔁</button><button type="button" class="sy-a" data-gua hidden>Ⓐ Siguiente pregunta</button></div></div>`;
    const acu = tipo === 'acu', L = acu ? ACU : ROL;
    return `<div class="cv-sl sy gu gu-${tipo}" style="--c1:${acu ? '#065f46' : '#4c1d95'};--c2:${acu ? '#10b981' : '#8b5cf6'}"><div class="sy-luz"></div>
      <div class="sy-mo"><canvas></canvas><img class="sy-img" src="img/moli/hola.webp" alt="Molí" hidden><div class="sy-fl i"></div><div class="sy-fl d"></div></div>
      <div class="sy-bub" hidden></div>
      <div class="gu-pan" hidden><h2 class="gu-t">${acu ? '🤝 Acuerdos de convivencia' : '👥 Roles de trabajo'}</h2>
        ${acu ? '<i class="gu-cuerda"></i>' : ''}<ul class="gu-cards gu-n${L.length}">${L.map((x, k) => `<li class="gu-c" data-k="${k}">${acu ? '<i class="gu-pinza"></i>' : '<i class="gu-num">' + (k + 1) + '</i>'}<span>${x[0]}</span><b>${esc(x[1])}</b>${acu ? '' : `<small>${esc(x[2])}</small>`}</li>`).join('')}</ul>
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
      if (sub && texto(k)) burbuja(texto(k)); if (s.M && voz) s.M.hablar(true);
      const leer = () => { if (!/^sab:/.test(k) || !window.speechSynthesis) return false;   // sin voz grabada para ese dato: lo lee el navegador en español
        try { const u = new SpeechSynthesisUtterance(texto(k)); u.lang = 'es-PE'; const v = speechSynthesis.getVoices().find(x => /^es/i.test(x.lang) && /female|mujer|helena|sabina|paulina|dalia|camila|elvira/i.test(x.name)) || speechSynthesis.getVoices().find(x => /^es/i.test(x.lang)); if (v) u.voice = v;
          u.rate = 0.95; u.onend = () => setTimeout(listo, 150); u.onerror = () => setTimeout(listo, 300); s.u = u; speechSynthesis.cancel(); speechSynthesis.speak(u); return true; } catch (e) { return false; } };
      s.a = a; a.onended = () => setTimeout(listo, 150); a.onerror = () => { if (!leer()) s.T.push(setTimeout(listo, Math.max(0, d * 1000 - (Date.now() - t0)))); };
      try { a.currentTime = 0; } catch (e) {}
      const p = a.play(); if (p && p.catch) p.catch(() => s.T.push(setTimeout(listo, d * 1000)));
      s.T.push(setTimeout(listo, d * 1000 + 6000)); });
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
  PASOS.sab = [
    async ok => { const M = S.M; M.expr('feliz'); mano(true, true); S.el.classList.add('caja'); decir('ding', false); await espera(500); ok(); await decir('sab_hola'); ok(); M.expr('estrellas'); S.btxt = 'Ⓐ Abrir la caja secreta'; },
    async ok => { const el = S.el, M = S.M; burbuja(''); el.classList.add('tiembla'); await espera(900); ok(); el.classList.remove('tiembla'); el.classList.add('pum'); decir('ding', false); M.expr('sorpresa'); M.accion && M.accion('saltar');
      await espera(500); ok(); mano(false, true); el.classList.add('abierta'); const d = el.querySelector('.gu-dato'); d.hidden = false; d.classList.add('in'); if (el.classList.contains('hw')) S.T.push(setTimeout(plop, 780)); M.expr('feliz');
      await decir('sab_intro'); ok(); const t = limpiaSab(S.D && S.D.t); if (t) { burbuja(''); M.expr('estrellas'); await decir('sab:' + t, false); ok(); } M.expr('feliz'); return 'fin'; }];
  PASOS.ref = [
    async ok => { const M = S.M; M.expr('feliz'); M.accion && M.accion('girar'); mano(true, true); await decir('ding', false); ok(); await decir('ref_hola'); ok(); mano(false, true); M.accion && M.accion('saltar'); await espera(400); ok(); panel(); await espera(600); ok();
      marcar(0); M.expr('pensativo'); await decir(REF[0]); ok(); M.expr('normal'); S.btxt = 'Ⓐ Siguiente pregunta'; },
    ...REF.slice(1).map((k, j) => async ok => { marcar(j + 1); S.M.expr('pensativo'); S.M.accion && S.M.accion('asentir'); await decir(k); ok(); S.M.expr('normal'); }),
    async ok => { marcar(-2); mano(true, true); S.M.expr('estrellas'); S.M.accion && S.M.accion('saltar'); await decir('ref_fin'); ok(); await espera(700); ok(); mano(false, true); S.M.expr('feliz'); return 'fin'; }];
  async function correr() {                                           // corre el paso actual; al terminar aparece el botón A (si quedan pasos)
    if (!S) return; const g = ++S.g, s = S, ok = () => { if (!S || S !== s || S.g !== g) throw 0; };
    boton(false);
    try { const r = await PASOS[s.tipo][s.p](ok); ok(); s.p++; const b = s.el.querySelector('[data-gua]'); if (s.btxt) b.textContent = s.tipo === 'ref' && s.p === PASOS.ref.length - 1 ? 'Ⓐ Terminar' : s.btxt; boton(r !== 'fin' && s.p < PASOS[s.tipo].length); } catch (e) {}
  }
  function cortar() { if (!S) return; S.T.forEach(clearTimeout); S.T = []; if (S.a) { try { S.a.pause(); } catch (e) {} } if (S.u && window.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} } if (S.M) S.M.hablar(false); }
  function avanzar() {                                                // A: si Molí todavía habla, salta al final de ese paso; si no, el siguiente
    if (!S) return; const btn = S.el.querySelector('[data-gua]');
    if (btn.hidden) { if (S.p === 0 && (S.tipo === 'acu' || S.tipo === 'rol')) { cortar(); S.g++; burbuja(''); panel(); S.p = 1; marcar(null); return correr(); } return; }
    if (S.p < PASOS[S.tipo].length) correr();
  }
  function montar(el, tipo, D) {
    parar(); if (!PASOS[tipo]) return;
    const cv = el.querySelector('canvas'), mo = el.querySelector('.sy-mo'), x = tres(cv);
    if (!x) { cv.hidden = true; el.querySelector('.sy-img').hidden = false; mo.classList.add('d2'); }
    S = { el, tipo, D, p: 0, g: 0, T: [], a: null, x, M: x ? x.m : M2D(mo) };
    el.addEventListener('click', e => { if (e.target.closest('[data-gua]')) { e.stopPropagation(); avanzar(); } else if (e.target.closest('[data-gurep]')) { e.stopPropagation(); repetir(); } });
    Object.keys(SUB).forEach(audio); audio('silbato');                  // que no se trabe la primera vez
    const s = S; setTimeout(() => S === s && correr(), 500);
  }
  function repetir() { if (!S) return; const { el, tipo } = S; cortar(); S.g++; el.classList.remove('izq', 'caja', 'tiembla', 'pum', 'abierta'); const dt = el.querySelector('.gu-dato'); if (dt) { dt.hidden = true; dt.classList.remove('in'); } const p = el.querySelector('.gu-pan'); p.hidden = true; p.classList.remove('in'); pregunta(''); burbuja(''); marcar(null); mano(false, true); S.p = 0; correr(); }
  function parar() { if (!S) return; cortar(); S.g++; if (S.x) S.x.parar(); S = null; }
  // ⌨️ la tecla A (sin escribir en un cuadro de texto) hace el siguiente paso
  addEventListener('keydown', e => { if (!S || e.repeat || e.ctrlKey || e.metaKey || e.altKey || (e.key || '').toLowerCase() !== 'a' || /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '') || (e.target && e.target.isContentEditable)) return;
    if (!document.body.contains(S.el)) return parar(); e.preventDefault(); e.stopPropagation(); avanzar(); }, true);
  // ---- 🔢 la secuencia de la clase: un Molí pequeño, al lado de las bolitas de la rutina, la cuenta con su voz ----
  let Q = null;
  function secuencia(nav) {
    if (Q) return finSec();
    const r = nav.getBoundingClientRect(), box = document.createElement('div'); box.id = 'rtMoli';
    box.innerHTML = '<div class="rm-mo"><canvas></canvas><img src="img/moli/hola.webp" alt="Molí" hidden></div><div class="rm-bub"></div><button type="button" class="rm-x" aria-label="Cerrar">✕</button>';
    Object.assign(box.style, { left: (r.right + 8) + 'px', top: Math.max(8, r.top + r.height * 0.18) + 'px' });
    document.body.appendChild(box);
    const cv = box.querySelector('canvas'), x = tres(cv); if (!x) { cv.hidden = true; box.querySelector('img').hidden = false; }
    const q = Q = { box, nav, x, M: x ? x.m : M2D(box.querySelector('.rm-mo')), T: [], a: null };
    box.querySelector('.rm-x').addEventListener('click', e => { e.stopPropagation(); finSec(); });
    ['pointerdown', 'pointerup'].forEach(t => box.addEventListener(t, e => e.stopPropagation()));
    const vivo = () => { if (Q !== q) throw 0; };
    const decirQ = k => new Promise(res => { const a = audio(k), d = dur(k); let fin = false; const listo = () => { if (fin) return; fin = true; q.M.hablar(false); res(); };
      box.querySelector('.rm-bub').textContent = SUB[k] || ''; q.M.hablar(true); q.a = a; a.onended = () => setTimeout(listo, 150); a.onerror = () => q.T.push(setTimeout(listo, d * 1000));
      try { a.currentTime = 0; } catch (e) {} const p = a.play(); if (p && p.catch) p.catch(() => q.T.push(setTimeout(listo, d * 1000))); q.T.push(setTimeout(listo, d * 1000 + 5000)); });
    const guia = i => nav.querySelectorAll('.rt-b').forEach((b, j) => b.classList.toggle('guia', j === i));
    (async () => { try {
      box.classList.add('in'); q.M.expr('feliz'); q.M.accion && q.M.accion('saludar'); await decirQ('rt_hola'); vivo();
      for (let i = 0; i < 6; i++) { guia(i); q.M.accion && q.M.accion('asentir'); await decirQ('rt_' + (i + 1)); vivo(); await new Promise(r => q.T.push(setTimeout(r, 350))); vivo(); }
      guia(-1); q.M.expr('estrellas'); q.M.accion && q.M.accion('saltar'); await decirQ('rt_fin'); vivo(); await new Promise(r => q.T.push(setTimeout(r, 1200))); vivo(); finSec();
    } catch (e) {} })();
  }
  function finSec() { const q = Q; if (!q) return; Q = null; q.T.forEach(clearTimeout); if (q.a) { try { q.a.pause(); } catch (e) {} } q.nav.querySelectorAll('.rt-b').forEach(b => b.classList.remove('guia')); if (q.x) q.x.parar(); q.box.remove(); }
  function dato(t) { if (!S || S.tipo !== 'sab') return; S.D = { t }; const p = S.el.querySelector('.gu-dato p'); if (p) p.textContent = limpiaSab(t); }
  window.Guion = { tres, html, montar, avanzar, parar, dato, secuencia, finSec, activo: () => !!S && document.body.contains(S.el), tipo: () => S && S.tipo, SUB, ACU, ROL, huella, limpiaSab };
})();
