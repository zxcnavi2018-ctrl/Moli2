// ===================================================================
//  MOLÍ 2 · 🎮 MANDO DE CONTROL (sólo la docente)
//  Un mando Bluetooth o USB (tipo Switch Pro) que la PC ya reconoce. Aquí se elige qué hace cada botón.
//  Funciona en el aula y en la Biblioteca. Se guarda en este equipo (localStorage «moli2:mando»).
// ===================================================================
(function () {
  const KEY = 'moli2:mando';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const esDocente = () => { if (window.MD && MD.esDocente) return MD.esDocente(); const m = LS.get('moli2:me', null); return !!(m && (m.docente || m.teacher)); };
  const AULA = !!document.getElementById('dots'), BIBL = !AULA && /biblioteca/.test(location.pathname);

  // ---- los botones del mando (mapa estándar de Chrome: así llega un mando de Switch por Bluetooth) ----
  const BOT = [[0, 'B'], [1, 'A'], [2, 'Y'], [3, 'X'], [4, 'L'], [5, 'R'], [6, 'ZL'], [7, 'ZR'], [8, '−  (menos)'], [9, '+  (más)'], [10, 'Joystick izq. (presionar)'], [11, 'Joystick der. (presionar)'],
    [12, 'Cruceta ↑'], [13, 'Cruceta ↓'], [14, 'Cruceta ←'], [15, 'Cruceta →'], [16, 'Home ⌂'], [17, 'Captura ◉']];
  const NOM = Object.fromEntries(BOT);
  const STK = [['lx', 'Joystick izquierdo ← →'], ['rx', 'Joystick derecho ← →']];
  const DEF = { on: true, b: { 1: 'sig', 0: 'ant', 3: 'bib', 2: 'moli', 4: 'escA', 5: 'escS', 6: 'ant', 7: 'sig', 8: 'panel', 9: 'fs', 12: 'an:shh', 13: 'an:drum', 14: 'ant', 15: 'sig', 16: 'aula' }, s: { lx: 'nav', rx: 'nada' } };
  let CFG = (c => c && c.b ? { on: c.on !== false, b: { ...c.b }, s: { ...DEF.s, ...(c.s || {}) } } : JSON.parse(JSON.stringify(DEF)))(LS.get(KEY, null));
  const guardar = () => LS.set(KEY, CFG);

  // ---- lo que puede hacer cada botón ----
  function acciones() {
    const A = [['nada', '— Nada —'], ['sig', '▶ Siguiente (hoja o escena)'], ['ant', '◀ Anterior (hoja o escena)']];
    if (AULA) {
      A.push(['escS', '⏭ Escena siguiente'], ['escA', '⏮ Escena anterior'], ['abrir', '📖 Abrir o cerrar lo de la escena']);
      [...document.querySelectorAll('#dots button')].forEach((b, k) => A.push(['e:' + k, '➡ Ir a ' + b.textContent.trim()]));
      A.push(['bib', '📚 Ir a la Biblioteca'], ['fs', '⛶ Pantalla completa'], ['moli', '🤖 Molí salta y saluda'],
        ['an:shh', '🤫 Animación: Silencio'], ['an:drum', '🥁 Animación: Tambor'], ['an:angry', '😠 Animación: Atención'], ['an:acu', '🤝 Animación: Acuerdos'], ['an:rol', '👥 Animación: Roles'], ['an:fin', '🏆 Animación: Final'],
        ['panel', '🎮 Abrir este panel']);
    } else A.push(['aula', '🏫 Volver al aula'], ['fs', '⛶ Pantalla completa']);
    return A;
  }
  const ACC_STK = [['nada', '— Nada —'], ['nav', '◀ ▶ Anterior / siguiente'], ['esc', '⏮ ⏭ Escena anterior / siguiente']];

  // ---- hacer la acción ----
  const tecla = k => dispatchEvent(new KeyboardEvent('keydown', { key: k, code: k, bubbles: true }));
  function pantalla() { const de = document.documentElement; if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else de.requestFullscreen && de.requestFullscreen().catch(() => {}); }
  function hacer(a) {
    if (!a || a === 'nada') return;
    if (panelAbierto() && a !== 'panel') return;                       // con el panel abierto el mando sólo se prueba
    if (a === 'fs') return pantalla();
    if (BIBL) {
      const libro = document.getElementById('libro');
      if (a === 'sig' || a === 'ant') { if (libro && libro.classList.contains('on')) { const b = libro.querySelector(`[data-hp="${a === 'sig' ? 1 : -1}"]`); if (b && !b.disabled) b.click(); return; } return tecla(a === 'sig' ? 'ArrowRight' : 'ArrowLeft'); }
      if (a === 'aula') { if (libro && libro.classList.contains('on')) return tecla('Escape'); const v = document.getElementById('volver'); return v && v.click(); }
      return;
    }
    const G = window.G; if (!G) return;
    if (a === 'panel') return panelAbierto() ? cerrarPanel() : abrirPanel();
    if (a === 'sig' || a === 'ant') { const d = a === 'sig' ? 1 : -1, sh = document.getElementById('sheet');
      if (sh && sh.style.display === 'block') for (const s of [`[data-nav="${d}"]`, `[data-cv="${d}"]`, `[data-pp="${d}"]`]) { const b = sh.querySelector(s); if (b && !b.disabled) return b.click(); }
      return G.go(d); }
    if (a === 'escS') return G.go(1);
    if (a === 'escA') return G.go(-1);
    if (a.startsWith('e:')) { const k = +a.slice(2); if (k >= 0 && k < G.STOPS.length && k !== G.TOUR.i) G.go(k - G.TOUR.i); return; }
    if (a === 'aula') { if (G.TOUR.i !== 0) G.go(-G.TOUR.i); return; }
    if (a === 'abrir') { const st = G.STOPS[G.TOUR.i]; if (G.TOUR.busy || !st.enter) return;
      if (st.abierto) { st.abierto = false; st.leave && st.leave(); } else st.enter().then(() => { st.abierto = true; }); return; }
    if (a === 'bib') { const l = document.getElementById('bibLink'); return l && l.click(); }
    if (a === 'moli') { G.moli.expr('feliz'); G.moli.accion('saltar'); setTimeout(() => G.moli.expr('normal'), 2400); return; }
    if (a.startsWith('an:') && window.RemotoCmd) return window.RemotoCmd('an', a.slice(3));
  }

  // ---- leer el mando ----
  let prev = [], stk = { lx: 0, rx: 0 }, stkT = { lx: 0, rx: 0 }, raf = 0, ultimo = null, ver = null;
  const mandos = () => [...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(Boolean);
  function leer() {
    raf = 0; const P = mandos(); if (!P.length) { prev = []; pintaEstado(); return; }
    const g = P[0], ahora = performance.now();
    g.buttons.forEach((b, i) => { const on = b.pressed || b.value > 0.5;
      if (on && !prev[i]) { ultimo = i; if (CFG.on) hacer(CFG.b[i]); if (ver) ver(i); }
      prev[i] = on; });
    [['lx', 0], ['rx', 2]].forEach(([k, ax]) => { const v = g.axes[ax] || 0, d = v > 0.6 ? 1 : v < -0.6 ? -1 : 0, a = CFG.s[k];
      if (d && (d !== stk[k] || ahora - stkT[k] > 550)) { stkT[k] = ahora; if (CFG.on && a !== 'nada' && !panelAbierto()) { if (a === 'nav') hacer(d > 0 ? 'sig' : 'ant'); else if (a === 'esc' && window.G) G.go(d); } }
      stk[k] = d; });
    if (ver) ver(null, g);
    raf = requestAnimationFrame(leer);
  }
  const arrancar = () => { if (!raf) raf = requestAnimationFrame(leer); };
  addEventListener('gamepadconnected', e => { arrancar(); pintaEstado(); if (esDocente()) avisar('🎮 Mando conectado: ' + nombreMando(e.gamepad)); });
  addEventListener('gamepaddisconnected', () => { pintaEstado(); if (esDocente()) avisar('🎮 Se desconectó el mando'); });
  if (mandos().length) arrancar();
  const nombreMando = g => String(g && g.id || 'mando').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim().slice(0, 40) || 'mando';
  function avisar(t) { if (typeof window.toast === 'function') return window.toast(t, 3); if (BIBL && typeof window.aviso === 'function') return window.aviso(t, 3); }

  if (!AULA) return;                                                     // en la Biblioteca sólo se usan los botones; el panel está en el aula

  // ---- el botón 🎮 al costado de BIBLIOTECA ----
  const css = document.createElement('style');
  css.textContent = `
  #mandoBtn { position: fixed; top: max(22px, calc(env(safe-area-inset-top) + 8px)); z-index: 24; width: 62px; height: 62px; border-radius: 18px; border: 3px solid #2b2547; background: linear-gradient(180deg, #ffffff, #e0e7ff); display: grid; place-items: center; cursor: pointer; box-shadow: 0 5px 0 #2b2547, 0 10px 18px rgba(0,0,0,.25); transition: transform .2s, opacity .3s; padding: 0; }
  #mandoBtn:hover { transform: translateY(-2px) rotate(-4deg); } #mandoBtn svg { width: 44px; height: 44px; } #mandoBtn i { position: absolute; right: 5px; top: 5px; width: 11px; height: 11px; border-radius: 50%; background: #94a3b8; border: 2px solid #fff; } #mandoBtn.on i { background: #22c55e; }
  body.open #mandoBtn, body.tut #mandoBtn, body.editando #mandoBtn { opacity: 0; pointer-events: none; }
  @media (max-height: 500px), (max-width: 600px) { #mandoBtn { width: 48px; height: 48px; border-radius: 14px; } #mandoBtn svg { width: 34px; height: 34px; } }
  #mandoP { position: fixed; inset: 0; z-index: 80; display: none; place-items: center; background: rgba(15,23,42,.55); padding: 14px; font-family: "Trebuchet MS", system-ui, sans-serif; }
  #mandoP.on { display: grid; }
  #mandoP .mp { width: min(1100px, 100%); max-height: calc(100vh - 28px); overflow: auto; background: #0f172a; color: #e2e8f0; border-radius: 22px; border: 3px solid #334155; box-shadow: 0 30px 70px rgba(0,0,0,.5); padding: 18px 20px 20px; }
  #mandoP .hd { display: flex; align-items: center; gap: 12px; } #mandoP h2 { margin: 0; font: 900 26px "Trebuchet MS", sans-serif; color: #fff; flex: 1; } #mandoP .x { width: 42px; height: 42px; border-radius: 50%; border: 0; background: #334155; color: #fff; font-size: 20px; cursor: pointer; }
  #mandoP .est { margin: 6px 0 10px; font-weight: 800; color: #94a3b8; } #mandoP .est.ok { color: #4ade80; }
  #mandoP .gr { display: grid; grid-template-columns: 1.15fr 1fr; gap: 18px; align-items: start; } @media (max-width: 860px) { #mandoP .gr { grid-template-columns: 1fr; } }
  #mandoP svg.pad { width: 100%; height: auto; } #mandoP svg.pad .k { fill: #1e293b; stroke: #cbd5e1; stroke-width: 3; cursor: pointer; transition: fill .08s; } #mandoP svg.pad .k:hover { stroke: #facc15; }
  #mandoP svg.pad .k.on { fill: #facc15; stroke: #fde047; } #mandoP svg.pad .k.sel { stroke: #38bdf8; stroke-width: 5; } #mandoP svg.pad text { fill: #e2e8f0; font: 900 18px "Trebuchet MS", sans-serif; text-anchor: middle; dominant-baseline: central; pointer-events: none; }
  #mandoP .ult { margin: 8px 0 0; padding: 10px 12px; border-radius: 14px; background: #1e293b; border: 2px dashed #475569; font-weight: 800; min-height: 24px; }
  #mandoP .ult select { margin-left: 6px; }
  #mandoP .lst { display: grid; gap: 6px; } #mandoP .row { display: grid; grid-template-columns: 180px 1fr; gap: 8px; align-items: center; padding: 6px 8px; border-radius: 12px; background: #1e293b; } #mandoP .row.sel { outline: 3px solid #38bdf8; } #mandoP .row.on { background: #3f3a12; }
  #mandoP .row b { font-size: 15px; color: #fff; } #mandoP select { width: 100%; padding: 7px 8px; border-radius: 10px; border: 2px solid #475569; background: #0f172a; color: #e2e8f0; font: 700 14px "Trebuchet MS", sans-serif; }
  #mandoP .ft { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 14px; } #mandoP .ft button { border: 0; border-radius: 999px; padding: 10px 16px; font: 900 14px "Trebuchet MS", sans-serif; cursor: pointer; }
  #mandoP .sw { display: inline-flex; align-items: center; gap: 8px; font-weight: 900; } #mandoP .sw input { width: 22px; height: 22px; }
  #mandoP .hint { color: #94a3b8; font-size: 13.5px; font-weight: 700; margin: 6px 0 0; }`;
  document.head.appendChild(css);
  const ICO = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 22 q4-6 12-6 h12 q8 0 12 6 l6 18 q2 9-5 10 q-5 1-9-6 l-2-4 H24 l-2 4 q-4 7-9 6 q-7-1-5-10z" fill="#2b2547"/><circle cx="21" cy="30" r="4" fill="#ef4444"/><circle cx="43" cy="35" r="4" fill="#38bdf8"/><circle cx="46" cy="25" r="2.6" fill="#fff"/><circle cx="51" cy="29" r="2.6" fill="#fff"/><path d="M27 34 h4 v-4 h2 v4 h4 v2 h-4 v4 h-2 v-4 h-4z" fill="#fff"/></svg><i></i>';
  const btn = document.createElement('button'); btn.id = 'mandoBtn'; btn.type = 'button'; btn.title = 'Mando de control'; btn.setAttribute('aria-label', 'Mando de control'); btn.innerHTML = ICO; btn.hidden = true;
  document.body.appendChild(btn);
  const lugar = () => { const l = document.getElementById('bibLink'); if (!l) return; const r = l.getBoundingClientRect(); btn.style.right = Math.round(innerWidth - r.left + 12) + 'px'; };
  const mostrar = () => { btn.hidden = !esDocente(); if (!btn.hidden) lugar(); };
  addEventListener('resize', lugar); addEventListener('moli2:me', mostrar); setTimeout(mostrar, 300); setTimeout(mostrar, 2500);
  btn.addEventListener('click', e => { e.stopPropagation(); abrirPanel(); });
  function pintaEstado() { btn.classList.toggle('on', mandos().length > 0); const e = P && P.querySelector('.est'); if (e) { const g = mandos()[0]; e.className = 'est' + (g ? ' ok' : ''); e.textContent = g ? '🟢 Mando conectado: ' + nombreMando(g) + (g.mapping === 'standard' ? '' : ' · (mapa no estándar: prueba cada botón)') : '⚪ Conecta tu mando por Bluetooth y presiona cualquier botón para que aparezca.'; } }

  // ---- el panel: el dibujo del mando y la lista de botones ----
  let P = null, SEL = null;
  const panelAbierto = () => !!(P && P.classList.contains('on'));
  function padSvg() {
    const k = (i, el) => el.replace('<', `<g data-k="${i}"><`).replace(/\/>$/, ` class="k" />`) + '</g>';
    const t = (x, y, s) => `<text x="${x}" y="${y}">${s}</text>`;
    return `<svg class="pad" viewBox="0 0 620 400" role="img" aria-label="Dibujo del mando">
      <path d="M150 78 q40-22 110-22 h100 q70 0 110 22 q38 24 52 90 l30 140 q12 64-38 72 q-38 6-66-40 l-26-44 H218 l-26 44 q-28 46-66 40 q-50-8-38-72 l30-140 q14-66 52-90z" fill="#111827" stroke="#475569" stroke-width="4"/>
      <path d="M118 112 q0-22 36-36" fill="none" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/><path d="M502 112 q0-22-36-36" fill="none" stroke="#38bdf8" stroke-width="8" stroke-linecap="round"/>
      ${k(6, '<rect x="118" y="8" width="96" height="30" rx="14"/>')}${t(166, 23, 'ZL')}${k(4, '<rect x="128" y="42" width="110" height="26" rx="12"/>')}${t(183, 55, 'L')}
      ${k(7, '<rect x="406" y="8" width="96" height="30" rx="14"/>')}${t(454, 23, 'ZR')}${k(5, '<rect x="382" y="42" width="110" height="26" rx="12"/>')}${t(437, 55, 'R')}
      ${k(10, '<circle cx="182" cy="150" r="40"/>')}${t(182, 150, 'L3')}
      ${k(12, '<rect x="232" y="196" width="36" height="40" rx="7"/>')}${t(250, 216, '↑')}${k(13, '<rect x="232" y="270" width="36" height="40" rx="7"/>')}${t(250, 290, '↓')}
      ${k(14, '<rect x="192" y="235" width="42" height="36" rx="7"/>')}${t(213, 253, '←')}${k(15, '<rect x="266" y="235" width="42" height="36" rx="7"/>')}${t(287, 253, '→')}
      ${k(11, '<circle cx="390" cy="252" r="40"/>')}${t(390, 252, 'R3')}
      ${k(3, '<circle cx="450" cy="106" r="22"/>')}${t(450, 106, 'X')}${k(1, '<circle cx="494" cy="148" r="22"/>')}${t(494, 148, 'A')}
      ${k(0, '<circle cx="450" cy="190" r="22"/>')}${t(450, 190, 'B')}${k(2, '<circle cx="406" cy="148" r="22"/>')}${t(406, 148, 'Y')}
      ${k(8, '<circle cx="262" cy="96" r="14"/>')}${t(262, 96, '−')}${k(9, '<circle cx="358" cy="96" r="14"/>')}${t(358, 96, '+')}
      ${k(17, '<rect x="268" y="132" width="26" height="26" rx="6"/>')}${t(281, 145, '◉')}${k(16, '<circle cx="340" cy="145" r="15"/>')}${t(340, 145, '⌂')}
      <g fill="#64748b">${[0, 1, 2, 3].map(j => `<rect x="${272 + j * 20}" y="330" width="12" height="6" rx="2"/>`).join('')}</g></svg>`;
  }
  const opciones = (L, v) => L.map(([k, t]) => `<option value="${esc(k)}"${k === v ? ' selected' : ''}>${esc(t)}</option>`).join('');
  function lista() { const A = acciones();
    return BOT.map(([i, n]) => `<div class="row" data-r="${i}"><b>${esc(n)}</b><select data-b="${i}">${opciones(A, CFG.b[i] || 'nada')}</select></div>`).join('') +
      STK.map(([k, n]) => `<div class="row"><b>${esc(n)}</b><select data-s="${k}">${opciones(ACC_STK, CFG.s[k] || 'nada')}</select></div>`).join(''); }
  function abrirPanel() {
    if (!P) { P = document.createElement('div'); P.id = 'mandoP'; document.body.appendChild(P);
      P.addEventListener('click', e => { if (e.target === P || e.target.closest('.x')) return cerrarPanel();
        const g = e.target.closest('[data-k]'); if (g) return elegir(+g.dataset.k);
        if (e.target.closest('[data-reset]')) { CFG = JSON.parse(JSON.stringify(DEF)); guardar(); pintarPanel(); } });
      P.addEventListener('change', e => { const s = e.target;
        if (s.dataset.b != null) { CFG.b[s.dataset.b] = s.value; guardar(); const o = P.querySelector(`.ult select`); if (o && +o.dataset.b === +s.dataset.b) o.value = s.value; const r = P.querySelector(`.lst select[data-b="${s.dataset.b}"]`); if (r) r.value = s.value; }
        if (s.dataset.s) { CFG.s[s.dataset.s] = s.value; guardar(); }
        if (s.dataset.on != null) { CFG.on = s.checked; guardar(); } }); }
    pintarPanel(); P.classList.add('on'); arrancar();
    ver = (i, g) => { if (i != null) elegir(i); if (g && P) { const on = g.buttons.map(b => b.pressed || b.value > 0.5); P.querySelectorAll('[data-k]').forEach(x => x.querySelector('.k').classList.toggle('on', !!on[+x.dataset.k])); P.querySelectorAll('.row[data-r]').forEach(x => x.classList.toggle('on', !!on[+x.dataset.r])); } };
  }
  function pintarPanel() {
    P.innerHTML = `<div class="mp" role="dialog" aria-label="Mando de control"><div class="hd"><h2>🎮 Mando de control</h2><button class="x" type="button" aria-label="Cerrar">✕</button></div><p class="est"></p>
      <div class="gr"><div>${padSvg()}<div class="ult">${SEL == null ? '👆 Presiona un botón de tu mando (o tócalo en el dibujo) para elegir qué hace.' : `<span>Botón <b>${esc(NOM[SEL])}</b>:</span> <select data-b="${SEL}">${opciones(acciones(), CFG.b[SEL] || 'nada')}</select>`}</div>
        <p class="hint">Mientras este panel está abierto, el mando no mueve el aula: sólo se prueba. Ciérralo para usarlo.</p></div>
      <div class="lst">${lista()}</div></div>
      <div class="ft"><label class="sw"><input type="checkbox" data-on${CFG.on ? ' checked' : ''}> Usar el mando en el aula y en la Biblioteca</label><span style="flex:1"></span><button type="button" data-reset style="background:#334155;color:#fff">↺ Volver a lo de fábrica</button><button type="button" class="x" style="width:auto;height:auto;border-radius:999px;background:#22c55e;color:#052e16">✓ Listo</button></div></div>`;
    pintaEstado(); if (SEL != null) marcarSel();
  }
  function elegir(i) { SEL = i; const u = P.querySelector('.ult'); if (u) u.innerHTML = `<span>Botón <b>${esc(NOM[i])}</b>:</span> <select data-b="${i}">${opciones(acciones(), CFG.b[i] || 'nada')}</select>`; marcarSel(); }
  function marcarSel() { P.querySelectorAll('[data-k] .k').forEach(x => x.classList.toggle('sel', +x.parentNode.dataset.k === SEL)); P.querySelectorAll('.row[data-r]').forEach(x => x.classList.toggle('sel', +x.dataset.r === SEL)); }
  function cerrarPanel() { if (P) P.classList.remove('on'); ver = null; }
  addEventListener('keydown', e => { if (e.key === 'Escape' && panelAbierto()) { e.stopPropagation(); cerrarPanel(); } }, true);
  if (window.Herramientas) Herramientas.extra.mando = () => { if (window.Herramientas.cerrar) try { Herramientas.cerrar(); } catch (e) {} abrirPanel(); };
  window.Mando = { abrir: abrirPanel, cerrar: cerrarPanel, hacer, get cfg() { return CFG; } };
})();
