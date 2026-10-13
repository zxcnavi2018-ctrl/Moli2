// ===================================================================
//  MOLÍ 2 · 🎮 MANDO DE CONTROL (sólo la docente)
//  Un mando Bluetooth o USB (tipo Switch Pro) que la PC ya reconoce. Aquí se elige qué hace cada botón.
//  Funciona en el aula y en la Biblioteca. Se guarda en este equipo (localStorage «moli2:mando»).
// ===================================================================
(function () {
  const KEY = 'moli2:mando';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const esDocente = () => { if (LS.get('moli2:rauth', null)) return true;      // la docente o un Revisor
    if (window.MD && MD.esDocente) return MD.esDocente(); const m = LS.get('moli2:me', null); return !!(m && (m.docente || m.teacher)); };
  const AULA = !!document.getElementById('dots'), BIBL = !AULA && /biblioteca/.test(location.pathname), REPO = !AULA && /repositorio/.test(location.pathname);

  // ---- los botones del mando (mapa estándar de Chrome: así llega un mando de Switch por Bluetooth) ----
  const BOT = [[0, 'B'], [1, 'A'], [2, 'Y'], [3, 'X'], [4, 'L'], [5, 'R'], [6, 'ZL'], [7, 'ZR'], [8, '−  (menos)'], [9, '+  (más)'], [10, 'Joystick izq. (presionar)'], [11, 'Joystick der. (presionar)'],
    [12, 'Cruceta ↑'], [13, 'Cruceta ↓'], [14, 'Cruceta ←'], [15, 'Cruceta →'], [16, 'Home ⌂'], [17, 'Captura ◉']];
  const NOM = Object.fromEntries(BOT);
  // los joysticks: cada dirección hace algo (el izquierdo mueve las escenas)
  const STK = [['l<', 'Joystick izq. ←'], ['l>', 'Joystick izq. →'], ['l^', 'Joystick izq. ↑'], ['lv', 'Joystick izq. ↓'], ['r<', 'Joystick der. ←'], ['r>', 'Joystick der. →'], ['r^', 'Joystick der. ↑'], ['rv', 'Joystick der. ↓']];
  const DEF = { v: 5, on: true, b: { 1: 'aceptar', 0: 'salir', 3: 'bib', 2: 'crono', 4: 'tabA', 5: 'tabS', 6: 'grupos', 7: 'revista', 8: 'zoomM', 9: 'zoomP', 11: 'vidGrande', 12: 'pagA', 13: 'pagS', 14: 'pagA', 15: 'pagS', 16: 'aula', 17: 'video' },
    s: { 'l<': 'escA', 'l>': 'escS', 'l^': 'escA', 'lv': 'escS', 'r^': 'an:shh', 'rv': 'an:drum', 'r<': 'an:angry', 'r>': 'an:acu' } };
  let CFG = (c => c && c.b && c.v >= 5 && c.b[17] === 'video' ? { v: 5, on: c.on !== false, b: { ...c.b }, s: { ...DEF.s, ...(c.s || {}) } } : JSON.parse(JSON.stringify(DEF)))(LS.get(KEY, null));
  const guardar = () => LS.set(KEY, CFG);
  let P = null, SEL = null, btn = null, CR = null, GR = null, grBtn = -1;                     // panel, botón elegido, botón 🎮 y el selector del cronómetro
  const panelAbierto = () => !!(P && P.classList.contains('on'));

  // ---- lo que puede hacer cada botón ----
  function acciones() {
    const A = [['nada', '— Nada —'], ['aceptar', '✅ Aceptar (abrir, jugar, confirmar)'], ['salir', '❌ Salir (cerrar, volver)'], ['pagS', '📄 Página siguiente (libros, juegos, proyección)'], ['pagA', '📄 Página anterior (libros, juegos, proyección)'], ['sig', '▶ Siguiente (página o escena)'], ['ant', '◀ Anterior (página o escena)']];
    if (AULA) {
      A.push(['escS', '⏭ Escena siguiente'], ['escA', '⏮ Escena anterior'], ['abrir', '📖 Abrir o cerrar lo de la escena']);
      [...document.querySelectorAll('#dots button')].forEach((b, k) => A.push(['e:' + k, '➡ Ir a ' + b.textContent.trim()]));
      A.push(['crono', '⏱️ Cronómetro (elige el tiempo con las flechas)'], ['bib', '📚 Ir a la Biblioteca'], ['fs', '⛶ Pantalla completa'], ['moli', '🤖 Molí salta y saluda'],
        ['an:shh', '🤫 Animación: Silencio'], ['an:drum', '🥁 Animación: Tambor'], ['an:angry', '😠 Animación: Atención'], ['an:acu', '🤝 Animación: Acuerdos'], ['an:rol', '👥 Animación: Roles'], ['an:fin', '🏆 Animación: Final'],
        ['panel', '🎮 Abrir este panel']);
      A.push(['tabS', '➡ Pestaña siguiente (en la Revista)'], ['tabA', '⬅ Pestaña anterior (en la Revista)'], ['revista', '📰 Abrir la Revista Innovadora'], ['grupos', '🏅 Grupos: mantén apretado y da +1 punto'], ['video', '🎬 Video: iniciar o pausar'], ['vidGrande', '🎬 Video: agrandar o achicar'], ['zoomP', '🔍 Acercar (zoom +)'], ['zoomM', '🔎 Alejar (zoom −)'], ['aula', '🏫 Volver al salón general']);
    } else A.push(['escS', '⏭ Estante siguiente (Biblioteca)'], ['escA', '⏮ Estante anterior (Biblioteca)'], ['tabS', '➡ Pestaña siguiente'], ['tabA', '⬅ Pestaña anterior'], ['revista', '📰 Abrir la Revista Innovadora'], ['zoomP', '🔍 Acercar (zoom +)'], ['zoomM', '🔎 Alejar (zoom −)'], ['aula', '🏫 Volver al aula'], ['fs', '⛶ Pantalla completa']);
    return A;
  }

  // ---- hacer la acción ----
  const tecla = k => dispatchEvent(new KeyboardEvent('keydown', { key: k, code: k, bubbles: true }));
  function pantalla() { const de = document.documentElement; if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else de.requestFullscreen && de.requestFullscreen().catch(() => {}); }
  let selB = 0;
  function hacer(a) {
    if (!a || a === 'nada') return;
    if (CR) return cronoTecla(a);                                      // con el cronómetro abierto: flechas eligen, A acepta, B sale
    if (GR) return grupoTecla(a);
    if (ZM && a === 'salir') return modoZoom(false);
    if (ZM && /^(escS|escA|tabS|tabA|aula|e:|bib|revista)/.test(a)) modoZoom(false);   // al cambiar de escena se sale del zoom
    if (a === 'revista' && !REPO) { try { sessionStorage.setItem('moli2:fs', document.fullscreenElement ? '1' : '0'); } catch (e) {} location.href = 'repositorio.html'; return; }
    if (a === 'zoomP' || a === 'zoomM') return zoom(a === 'zoomP' ? -1 : 1);
    if (REPO) return enRevista(a);
    if (panelAbierto() && a !== 'panel') return;                       // con el panel abierto el mando sólo se prueba
    if (a === 'fs') return pantalla();
    if (BIBL) {
      if (a === 'tabS' || a === 'tabA') a = a === 'tabS' ? 'escS' : 'escA';
      const libro = document.getElementById('libro');
      if (a === 'escS' || a === 'escA') return tecla(a === 'escS' ? 'ArrowRight' : 'ArrowLeft');
      if (a === 'pagS' || a === 'pagA') a = a === 'pagS' ? 'sig' : 'ant';
      if (a === 'sig' || a === 'ant') { const d = a === 'sig' ? 1 : -1, B = window.BIB;
        if (libro && libro.classList.contains('on')) { const b = libro.querySelector(`[data-hp="${d}"]`); if (b && !b.disabled) b.click(); return; }
        if (B && B.modo === 'estante') { const L = (B.ESTANTES[B.actual] || {}).items || []; if (!L.length) return; selB = (selB + d + L.length) % L.length;   // elegir libro del estante; A lo abre
          return window.aviso && window.aviso(`📖 ${selB + 1} de ${L.length}: «${L[selB].t || 'Trabajo'}» · A para abrir`, 3); }
        return tecla(d > 0 ? 'ArrowRight' : 'ArrowLeft'); }
      const B = window.BIB, abierto = libro && libro.classList.contains('on');
      if (a === 'salir') { if (abierto) return tecla('Escape'); if (B && B.modo === 'estante') return B.irSala(); a = 'aula'; }
      if (a === 'aula') { if (abierto) return tecla('Escape'); const v = document.getElementById('volver'); return v && v.click(); }
      if (a === 'aceptar' && B && !abierto) { if (B.modo === 'estante') { const E = B.ESTANTES[B.actual], L = E ? E.items : []; if (!L.length) return; return B.abrirLibro(L[Math.min(selB, L.length - 1)]); } if (B.modo === 'sala') return B.irEstante(0); }
      return;
    }
    const G = window.G; if (!G) return;
    if (a === 'panel') return panelAbierto() ? cerrarPanel() : abrirPanel();
    if (a === 'sig' || a === 'ant' || a === 'pagS' || a === 'pagA') { const d = a === 'sig' || a === 'pagS' ? 1 : -1, sh = document.getElementById('sheet');
      if (sh && sh.style.display === 'block') for (const s of [`[data-nav="${d}"]`, `[data-cv="${d}"]`, `[data-pp="${d}"]`]) { const b = sh.querySelector(s); if (b && !b.disabled) return b.click(); }
      const bb = document.getElementById('bibBar'); if (bb && bb.classList.contains('on')) { const b = document.getElementById(d > 0 ? 'bibNext' : 'bibPrev'); if (b) return b.click(); }   // los juegos: disco siguiente / anterior
      if (a === 'pagS' || a === 'pagA') return;                        // «página» nunca cambia de escena
      return G.go(d); }
    if (a === 'video') return videoPlay();
    if (a === 'vidGrande') return videoGrande();
    if (a === 'crono') return abrirCrono();
    if (a === 'grupos') return abrirGrupos();
    if (a === 'tabS' || a === 'tabA') a = a === 'tabS' ? 'escS' : 'escA';
    if (a === 'salir') {
      if (cerrarAnim()) return;                                        // B primero quita la animación que esté en pantalla
      const h = document.querySelector('#herr.on [data-h="x"], .fp-x'); if (h && h.offsetParent) return h.click();
      const fv = document.getElementById('fotoVer'); if (fv && fv.classList.contains('on')) return fv.classList.remove('on');
      const mb = document.getElementById('moliBack'), mw = document.getElementById('moliWin'); if (mw && mw.style.display === 'flex' && mb) return mb.click();
      const st = G.STOPS[G.TOUR.i]; if (st.abierto && st.leave && !G.TOUR.busy) { st.abierto = false; return st.leave(); }
      if (G.TOUR.i !== 0) return G.go(-G.TOUR.i); return; }
    if (a === 'aceptar') {
      const sh = document.getElementById('sheet'), f = document.activeElement;
      if (sh && sh.style.display === 'block' && f && sh.contains(f) && /BUTTON|A/.test(f.tagName)) return f.click();
      const bb = document.getElementById('bibBar'); if (bb && bb.classList.contains('on')) { const b = document.getElementById('bibPlay'); if (b) return b.click(); }
      a = 'abrir'; }
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

  function cerrarAnim() { const an = document.getElementById('anim'); if (an && an.classList.contains('on') && !an.classList.contains('fuera')) { an.click(); return true; } return false; }
  // ---- 🔍 zoom de la cámara (− aleja, + acerca) ----
  let uz = 0, ZM = false, px = 0, py = 0, zmEl = null;
  function zoom(d) { uz = Math.max(-30, Math.min(16, uz + d * 6)); modoZoom(true);
    if (window.G && G.TOUR) { G.TOUR.uz = uz; return; }
    const B = window.BIB; if (B && B.camera) { const c = B.camera; c.userData.fov0 = c.userData.fov0 || c.fov; c.fov = c.userData.fov0 + uz; c.updateProjectionMatrix(); } }
  function modoZoom(on) { ZM = on;                                     // modo zoom: L3 mueve la cámara, B sale
    if (!on) { uz = px = py = 0; if (window.G && G.TOUR) Object.assign(G.TOUR, { uz: 0, px: 0, py: 0 }); const B = window.BIB; if (B && B.camera && B.camera.userData.fov0) { B.camera.fov = B.camera.userData.fov0; B.camera.updateProjectionMatrix(); } }
    if (on && !zmEl) { zmEl = document.createElement('div'); zmEl.id = 'zoomM'; zmEl.innerHTML = '🔍 <b>Modo zoom</b> · <b>+</b> / <b>−</b> acerca o aleja · <b>L3</b> mueve la cámara · <b>B</b> para salir'; document.body.appendChild(zmEl); }
    if (!on && zmEl) { zmEl.remove(); zmEl = null; } }
  function mirar(x, y) { if (!(window.G && G.TOUR)) return; px = Math.max(-0.7, Math.min(0.7, px - x * 0.015)); py = Math.max(-0.45, Math.min(0.45, py - y * 0.012)); G.TOUR.px = px; G.TOUR.py = py; }
  const cssZ = document.createElement('style');
  cssZ.textContent = `#zoomM { position: fixed; left: 50%; top: 14px; transform: translateX(-50%); z-index: 70; padding: 10px 18px; border-radius: 999px; background: rgba(15,23,42,.85); color: #fff; font: 700 16px "Trebuchet MS", system-ui, sans-serif; box-shadow: 0 6px 18px rgba(0,0,0,.3); pointer-events: none; } #zoomM b { color: #facc15; }`;
  document.head.appendChild(cssZ);
  // ---- 📰 en la Revista: L / R cambian de pestaña, la cruceta baja o sube, B vuelve al aula ----
  function enRevista(a) {
    const T = [...document.querySelectorAll('#tabs [data-tab]')].filter(b => !b.hidden), i = T.findIndex(b => b.classList.contains('on'));
    if (a === 'tabS' || a === 'tabA' || a === 'escS' || a === 'escA') { const d = a === 'tabS' || a === 'escS' ? 1 : -1; const b = T[(i + d + T.length) % T.length]; return b && b.click(); }
    if (a === 'pagS' || a === 'pagA' || a === 'sig' || a === 'ant') return scrollBy({ top: (a === 'pagS' || a === 'sig' ? 1 : -1) * innerHeight * 0.6, behavior: 'smooth' });
    if (a === 'aceptar') { const f = document.activeElement; if (f && f !== document.body) f.click(); return; }
    if (a === 'salir') { const m = document.getElementById('modal'); if (m && !m.hidden) { m.hidden = true; m.innerHTML = ''; return; } if (document.querySelector('#dniAviso:not([hidden])')) return document.getElementById('dniAviso').click(); a = 'aula'; }
    if (a === 'aula' || a === 'bib') { try { sessionStorage.setItem('moli2:fs', document.fullscreenElement ? '1' : '0'); } catch (e) {} location.href = a === 'bib' ? 'biblioteca.html' : 'index.html'; }
  }
  // ---- 🏅 grupos: mantén ZL, elige el grupo con un joystick o la cruceta y A le da +1 punto ----
  let grI = 0;
  const GCOL = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
  function abrirGrupos() { if (!window.RemotoCmd) return; grBtn = ultimo; if (!GR) { GR = document.createElement('div'); GR.id = 'gruposM'; document.body.appendChild(GR);
      GR.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b) { grI = +b.dataset.g; grupoTecla('aceptar'); } else if (e.target === GR) cerrarGrupos(); }); }
    pintaGrupos(); }
  function pintaGrupos() { let p = []; try { p = JSON.parse(localStorage.getItem('moli2:grpts') || '[]'); } catch (e) {}
    GR.innerHTML = `<div class="gm"><h3>🏅 ¿Qué grupo gana un punto?</h3><p>Mueve con el joystick o la cruceta · <b>A</b> da +1 punto · suelta para cerrar</p><div class="gg">${GCOL.map((c, i) => `<button type="button" data-g="${i}" style="--c:${c}" class="${i === grI ? 'on' : ''}">Grupo ${i + 1}<small>${p[i] || 0} pts</small></button>`).join('')}</div></div>`; }
  function cerrarGrupos() { if (GR) { GR.remove(); GR = null; } grBtn = -1; }
  function grupoTecla(a) {
    if (a === 'salir') return cerrarGrupos();
    if (a === 'aceptar') { window.RemotoCmd('an', 'g' + (grI + 1)); return setTimeout(() => GR && pintaGrupos(), 300); }
    const m = { pagS: 1, sig: 1, escS: 1, tabS: 1, pagA: -1, ant: -1, escA: -1, tabA: -1 }[a]; if (!m) return;
    grI = (grI + m + 6) % 6; pintaGrupos(); }
  const dirMov = d => ({ '>': 1, '<': -1, 'v': 3, '^': -3 }[d] || 0);   // en las listas: ← → de uno en uno, ↑ ↓ por filas de 3

  // ---- 🎬 videos de YouTube (en las hojas o la proyección): Captura inicia / pausa, R3 agranda, R3 ← → salta 10 s ----
  const VT = new WeakMap(), VP = new WeakMap(), VV = new WeakMap();
  const vids = () => [...document.querySelectorAll('.vid')].filter(v => { const r = v.getBoundingClientRect(); return r.width > 40 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; });
  const videoVisible = () => vids().some(v => v.querySelector('iframe'));
  addEventListener('message', e => { if (!/youtube/.test(e.origin)) return; let d = e.data; try { d = typeof d === 'string' ? JSON.parse(d) : d; } catch (er) { return; }
    const f = [...document.querySelectorAll('.vid iframe')].find(x => x.contentWindow === e.source); if (!f || !d || !d.info) return;
    if (typeof d.info.currentTime === 'number') VT.set(f, d.info.currentTime); if (typeof d.info.playerState === 'number') VP.set(f, d.info.playerState); if (typeof d.info.volume === 'number') VV.set(f, d.info.volume); });
  const yt = (f, func, args = []) => f.contentWindow && f.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
  const escuchar = f => { if (f.dataset.esc) return; f.dataset.esc = '1'; const go = () => f.contentWindow && f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*'); go(); f.addEventListener('load', go); setTimeout(go, 1500); };
  function videoPlay() { const V = vids(); if (!V.length) return;
    const f = V.map(v => v.querySelector('iframe')).find(Boolean); if (!f) { const b = V.find(v => v.dataset.a === 'video'); if (b) { b.click(); setTimeout(() => { const n = document.querySelector('.vid.on iframe'); if (n) escuchar(n); }, 300); } return; }
    escuchar(f); const st = VP.get(f); yt(f, st === 1 ? 'pauseVideo' : 'playVideo'); VP.set(f, st === 1 ? 2 : 1); }
  function videoGrande() { const v = vids().find(x => x.querySelector('iframe')) || document.querySelector('.vid.grande'); if (!v) return videoPlay();
    v.classList.toggle('grande'); }
  function videoSalto(s) { const f = vids().map(v => v.querySelector('iframe')).find(Boolean); if (!f) return; escuchar(f);
    const t = Math.max(0, (VT.get(f) || 0) + s); yt(f, 'seekTo', [t, true]); VT.set(f, t); avisar(s > 0 ? '⏩ +10 s' : '⏪ −10 s'); }
  function videoVol(s) { const f = vids().map(v => v.querySelector('iframe')).find(Boolean); if (!f) return; escuchar(f);
    const v = Math.max(0, Math.min(100, (VV.has(f) ? VV.get(f) : 100) + s)); if (v > 0) yt(f, 'unMute'); yt(f, 'setVolume', [v]); VV.set(f, v); avisar((v ? '🔊 Volumen ' : '🔇 Volumen ') + v + '%'); }
  const cssV = document.createElement('style');
  cssV.textContent = `.vid.grande { position: fixed !important; inset: 3vh 3vw !important; width: auto !important; max-width: none !important; height: auto !important; aspect-ratio: auto !important; margin: 0 !important; z-index: 2147483000 !important; background: #000; box-shadow: 0 0 0 100vmax rgba(0,0,0,.75); border-radius: 14px !important; }`;
  document.head.appendChild(cssV);

  // ---- ⏱️ cronómetro: Y lo abre, las flechas eligen el tiempo, A lo pone, B sale ----
  const TIEMPOS = [1, 2, 3, 5, 10, 15, 20, 30, 0];
  let crI = 3;
  function abrirCrono() { if (!window.RemotoCmd) return; if (!CR) { CR = document.createElement('div'); CR.id = 'cronoM'; document.body.appendChild(CR);
      CR.addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { crI = +b.dataset.t; cronoTecla('aceptar'); } else if (e.target === CR) cronoTecla('salir'); }); }
    pintaCrono(); }
  function pintaCrono() { CR.innerHTML = `<div class="cm"><h3>⏱️ Cronómetro</h3><p>Elige con las flechas · <b>A</b> para empezar · <b>B</b> para salir</p><div class="cg">${TIEMPOS.map((t, i) => `<button type="button" data-t="${i}" class="${i === crI ? 'on' : ''}">${t ? t + ' min' : '✖ Quitar'}</button>`).join('')}</div></div>`; }
  function cronoTecla(a) {
    if (a === 'salir' || a === 'crono') { CR.remove(); CR = null; return; }
    if (a === 'aceptar') { const t = TIEMPOS[crI]; CR.remove(); CR = null; window.RemotoCmd('tm', String(t)); return avisar(t ? `⏱️ Cronómetro de ${t} min` : '⏱️ Cronómetro quitado'); }
    const m = { pagS: 1, sig: 1, escS: 1, pagA: -1, ant: -1, escA: -1 }[a]; if (!m) return;
    crI = (crI + m + TIEMPOS.length) % TIEMPOS.length; pintaCrono();
  }
  const cssC = document.createElement('style');
  cssC.textContent = `#cronoM { position: fixed; inset: 0; z-index: 85; display: grid; place-items: center; background: rgba(15,23,42,.5); font-family: "Trebuchet MS", system-ui, sans-serif; }
  #cronoM .cm { background: #fff; border: 4px solid #2b2547; border-radius: 24px; padding: 20px 24px; text-align: center; box-shadow: 0 8px 0 #2b2547, 0 30px 60px rgba(0,0,0,.4); }
  #cronoM h3 { margin: 0; font: 900 30px "Trebuchet MS", sans-serif; color: #1e3a8a; } #cronoM p { margin: 6px 0 14px; font-weight: 700; color: #475569; }
  #cronoM .cg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; } #cronoM button { border: 3px solid #cbd5e1; border-radius: 16px; padding: 14px 18px; background: #f8fafc; font: 900 22px "Trebuchet MS", sans-serif; color: #1e293b; cursor: pointer; }
  #cronoM button.on { background: linear-gradient(180deg, #ffb15c, #ff7a2f); border-color: #c2410c; color: #fff; transform: scale(1.08); box-shadow: 0 4px 0 #c2410c; }`;
  document.head.appendChild(cssC);

  function moverSel(d) { const m = dirMov(d);
    if (GR) { grI = (grI + m + 6) % 6; return pintaGrupos(); }
    if (CR) { crI = (crI + m + TIEMPOS.length) % TIEMPOS.length; pintaCrono(); } }
  const cssG = document.createElement('style');
  cssG.textContent = `#gruposM { position: fixed; inset: 0; z-index: 85; display: grid; place-items: center; background: rgba(15,23,42,.45); font-family: "Trebuchet MS", system-ui, sans-serif; }
  #gruposM .gm { background: #fff; border: 4px solid #2b2547; border-radius: 24px; padding: 20px 24px; text-align: center; box-shadow: 0 8px 0 #2b2547, 0 30px 60px rgba(0,0,0,.4); }
  #gruposM h3 { margin: 0; font: 900 30px "Trebuchet MS", sans-serif; color: #1e3a8a; } #gruposM p { margin: 6px 0 14px; font-weight: 700; color: #475569; }
  #gruposM .gg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; } #gruposM button { min-width: 170px; border: 4px solid var(--c); border-radius: 18px; padding: 16px 18px; background: #fff; font: 900 26px "Trebuchet MS", sans-serif; color: var(--c); cursor: pointer; }
  #gruposM button small { display: block; font-size: 15px; color: #64748b; } #gruposM button.on { background: var(--c); color: #fff; transform: scale(1.1); box-shadow: 0 6px 0 rgba(0,0,0,.25); } #gruposM button.on small { color: #fff; }`;
  document.head.appendChild(cssG);

  // ---- pantalla completa: si venía en pantalla completa (aula → Biblioteca → Revista), cualquier botón la devuelve ----
  const FSQ = 'moli2:quiereFS';
  addEventListener('fullscreenchange', () => { try { sessionStorage.setItem(FSQ, document.fullscreenElement ? '1' : '0'); } catch (e) {} });
  addEventListener('pagehide', () => { try { if (document.fullscreenElement) sessionStorage.setItem(FSQ, '1'); } catch (e) {} });
  let fsAvisado = false;
  function volverFS() { let q = '0'; try { q = sessionStorage.getItem(FSQ) || '0'; } catch (e) {} if (q !== '1' || document.fullscreenElement) return;
    const de = document.documentElement; if (!de.requestFullscreen) return;
    de.requestFullscreen().catch(() => { if (!fsAvisado) { fsAvisado = true; avisar('⛶ Toca la pantalla una vez para volver a pantalla completa'); } }); }

  // ---- 🖱️ modo mouse: ZL + ZR juntos lo prenden y lo apagan; L3 mueve la flecha, A hace clic, R3 baja o sube ----
  let MM = false, mx = innerWidth / 2, my = innerHeight / 2, cur = null, combo = false, sobre = null;
  const pend = {};
  function boton(i) {
    if (MM) { if (i === 1) return clicMouse(); if (i === 0) return cerrarAnim(); }   // en modo mouse: A = clic (B no hace nada)
    if ((CR || GR) && i >= 12 && i <= 15) return moverSel(['^', 'v', '<', '>'][i - 12]);      // en el cronómetro o los grupos, la cruceta elige
    if (CFG.on) hacer(CFG.b[i]);
  }
  function modoMouse(on) { MM = on;
    if (on) { if (!cur) { cur = document.createElement('div'); cur.id = 'mandoCur'; cur.innerHTML = '<svg viewBox="0 0 32 32" width="40" height="40"><path d="M4 2 L4 26 L10 20 L15 30 L19 28 L14 18 L23 18 Z" fill="#fff" stroke="#111827" stroke-width="2.2" stroke-linejoin="round"/></svg>'; document.body.appendChild(cur); }
      pintaCur(); avisar('🖱️ Modo mouse: L3 mueve · A hace clic · ZL + ZR para salir'); }
    else { if (cur) { cur.remove(); cur = null; } avisar('🖱️ Saliste del modo mouse'); } }
  const pintaCur = () => { if (cur) cur.style.transform = `translate(${mx}px, ${my}px)`; };
  function evento(tipo, el, extra = {}) { const o = { bubbles: true, cancelable: true, composed: true, clientX: mx, clientY: my, button: 0, buttons: tipo.endsWith('down') ? 1 : 0, view: window, ...extra };
    el.dispatchEvent(tipo.startsWith('pointer') ? new PointerEvent(tipo, { pointerId: 9, pointerType: 'mouse', isPrimary: true, ...o }) : new MouseEvent(tipo, o)); }
  const bajo = () => { if (cur) cur.style.display = 'none'; const el = document.elementFromPoint(mx, my); if (cur) cur.style.display = ''; return el; };
  function moverMouse(x, y, sy, k = 1) {
    const m = v => Math.abs(v) < 0.15 ? 0 : Math.sign(v) * Math.pow((Math.abs(v) - 0.15) / 0.85, 1.6);
    const vx = m(x), vy = m(y); if (vx || vy) { mx = Math.max(0, Math.min(innerWidth - 4, mx + vx * 15 * k)); my = Math.max(0, Math.min(innerHeight - 4, my + vy * 15 * k)); pintaCur();
      const el = bajo(); if (el) { evento('pointermove', el); evento('mousemove', el); if (el !== sobre) { if (sobre) evento('mouseout', sobre); evento('mouseover', el); sobre = el; } } }
    const s = m(sy); if (s) { const el = bajo(); let c = el; while (c && c !== document.body && !(c.scrollHeight > c.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(c).overflowY))) c = c.parentElement;
      (c && c !== document.body ? c : document.scrollingElement || document.documentElement).scrollBy(0, s * 22 * k); }
  }
  function clicMouse() { const el = bajo(); if (!el) return; if (cur) { cur.classList.remove('clic'); void cur.offsetWidth; cur.classList.add('clic'); }
    evento('pointerdown', el); evento('mousedown', el); if (/INPUT|TEXTAREA|SELECT/.test(el.tagName)) el.focus();
    evento('pointerup', el); evento('mouseup', el); evento('click', el); }
  const cssM = document.createElement('style');
  cssM.textContent = `#mandoCur { position: fixed; left: 0; top: 0; z-index: 2147483647; pointer-events: none; filter: drop-shadow(0 3px 4px rgba(0,0,0,.45)); will-change: transform; }
  #mandoCur.clic svg { animation: mcClic .25s ease; } @keyframes mcClic { 50% { transform: scale(.8); } }`;
  document.head.appendChild(cssM);

  // ---- leer el mando ----
  const rep = {}, stkN = { l: 0, r: 0 };
  let prev = [], stk = { l: '', r: '' }, stkT = { l: 0, r: 0 }, raf = 0, ultimo = null, ver = null;
  const mandos = () => [...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(Boolean);
  function leer() {
    raf = 0; const P = mandos(); if (!P.length) { prev = []; pintaEstado(); return; }
    const g = P[0], ahora = performance.now(), k60 = Math.min(4, (ahora - (leer.t || ahora - 16.7)) / 16.7); leer.t = ahora;   // cuánto pasó (en cuadros de 60 fps): se mueve igual de parejo aunque la PC vaya lenta
    const on = g.buttons.map(b => b.pressed || b.value > 0.5);
    if (on[6] && on[7] && !combo) { combo = true; delete pend[6]; delete pend[7]; if (!panelAbierto()) modoMouse(!MM); }   // ZL + ZR juntos: modo mouse
    if (!on[6] && !on[7]) combo = false;
    on.forEach((o, i) => {
      if (o && !prev[i]) { ultimo = i; volverFS(); if (ver) ver(i);
        if (combo && (i === 6 || i === 7)) {}
        else if (i === 6 || i === 7) pend[i] = ahora;                   // ZL / ZR esperan un instante: por si apretaste los dos juntos
        else boton(i); }
      if (o && prev[i] && i >= 12 && i <= 15) { const t0 = rep[i] || (rep[i] = { t: ahora, n: 0 }); const espera = t0.n ? 140 : 420;   // cruceta mantenida: repite (primero espera, luego rápido)
        if (ahora - t0.t > espera) { t0.t = ahora; t0.n++; boton(i); } }
      if (!o) delete rep[i];
      if (!o && prev[i] && GR && i === grBtn) cerrarGrupos();           // soltaste ZL: se cierran los grupos
      prev[i] = o; });
    [6, 7].forEach(i => { if (pend[i] != null && ahora - pend[i] > 160) { delete pend[i]; if (!combo) { ultimo = i; boton(i); if (!on[i] && GR && i === grBtn) cerrarGrupos(); } } });
    if (MM) { moverMouse(g.axes[0] || 0, g.axes[1] || 0, g.axes[3] || 0, k60); if (ver) ver(null, g); raf = requestAnimationFrame(leer); return; }   // modo mouse: los joysticks mueven la flecha y bajan la página
    if (ZM) { const x = g.axes[0] || 0, y = g.axes[1] || 0; if (Math.abs(x) > 0.15 || Math.abs(y) > 0.15) mirar(x * k60, y * k60); }
    [['l', 0], ['r', 2]].forEach(([k, ax]) => { const x = g.axes[ax] || 0, y = g.axes[ax + 1] || 0;      // la dirección que más se empuja: ← → ↑ ↓
      if (ZM && k === 'l') return;
      const d = Math.max(Math.abs(x), Math.abs(y)) < 0.6 ? '' : Math.abs(x) >= Math.abs(y) ? (x > 0 ? '>' : '<') : (y > 0 ? 'v' : '^');
      if (k === 'r' && d && videoVisible()) { if (d !== stk[k] || ahora - stkT[k] > 350) { stkT[k] = ahora; if (d === '<' || d === '>') videoSalto(d === '>' ? 10 : -10); else videoVol(d === '^' ? 10 : -10); } stk[k] = d; return; }   // con un video: R3 ← → salta, ↑ ↓ volumen
      const acc = CFG.s[k + d] || '', lento = /^(esc|e:|aula|bib|revista|an:|crono|grupos|panel|fs)/.test(acc) && !(CR || GR);
      if (d !== stk[k]) stkN[k] = 0;
      const espera = !stkN[k] ? 0 : lento ? 700 : stkN[k] === 1 ? 380 : 150;       // al mantener: primero espera un poquito, luego repite
      if (d && (d !== stk[k] || ahora - stkT[k] > espera)) { stkT[k] = ahora; stkN[k]++; if (CR || GR) moverSel(d); else if (CFG.on) hacer(acc); if (ver) ver('s' + k + d); }
      stk[k] = d; });
    if (ver) ver(null, g);
    raf = requestAnimationFrame(leer);
  }
  const arrancar = () => { if (!raf) raf = requestAnimationFrame(leer); };
  addEventListener('gamepadconnected', e => { arrancar(); pintaEstado(); if (esDocente()) avisar('🎮 Mando conectado: ' + nombreMando(e.gamepad)); });
  addEventListener('gamepaddisconnected', () => { pintaEstado(); if (esDocente()) avisar('🎮 Se desconectó el mando'); });
  if (mandos().length) arrancar();
  const nombreMando = g => String(g && g.id || 'mando').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim().slice(0, 40) || 'mando';
  function avisar(t) { if (typeof window.toast === 'function') return window.toast(t, REPO ? 3000 : 3); if (BIBL && typeof window.aviso === 'function') return window.aviso(t, 3); }

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
  #mandoP .mp { width: min(1500px, 100%); max-height: calc(100vh - 28px); overflow: auto; background: #0f172a; color: #e2e8f0; border-radius: 22px; border: 3px solid #334155; box-shadow: 0 30px 70px rgba(0,0,0,.5); padding: 18px 20px 20px; }
  #mandoP .hd { display: flex; align-items: center; gap: 12px; } #mandoP h2 { margin: 0; font: 900 26px "Trebuchet MS", sans-serif; color: #fff; flex: 1; } #mandoP .x { width: 42px; height: 42px; border-radius: 50%; border: 0; background: #334155; color: #fff; font-size: 20px; cursor: pointer; }
  #mandoP .est { margin: 6px 0 10px; font-weight: 800; color: #94a3b8; } #mandoP .est.ok { color: #4ade80; }
  #mandoP .gr { display: grid; grid-template-columns: minmax(380px, .9fr) 1.4fr; gap: 20px; align-items: start; } @media (max-width: 1000px) { #mandoP .gr { grid-template-columns: 1fr; } }
  #mandoP svg.pad { width: 100%; height: auto; } #mandoP svg.pad .k { fill: #1e293b; stroke: #cbd5e1; stroke-width: 3; cursor: pointer; transition: fill .08s; } #mandoP svg.pad .k:hover { stroke: #facc15; }
  #mandoP svg.pad .k.on { fill: #facc15; stroke: #fde047; } #mandoP svg.pad .k.sel { stroke: #38bdf8; stroke-width: 5; } #mandoP svg.pad .ar text { font-size: 13px; fill: #38bdf8; } #mandoP svg.pad .dot { pointer-events: none; transition: cx .05s, cy .05s; } #mandoP svg.pad text { fill: #e2e8f0; font: 900 18px "Trebuchet MS", sans-serif; text-anchor: middle; dominant-baseline: central; pointer-events: none; }
  #mandoP .ult { margin: 8px 0 0; padding: 10px 12px; border-radius: 14px; background: #1e293b; border: 2px dashed #475569; font-weight: 800; min-height: 24px; }
  #mandoP .ult select { margin-left: 6px; }
  #mandoP .lst { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 10px; } @media (max-width: 760px) { #mandoP .lst { grid-template-columns: 1fr; } } #mandoP .row { display: grid; grid-template-columns: 150px 1fr; gap: 8px; align-items: center; padding: 6px 8px; border-radius: 12px; background: #1e293b; } #mandoP .row.sel { outline: 3px solid #38bdf8; } #mandoP .row.on { background: #3f3a12; }
  #mandoP .row b { font-size: 15px; color: #fff; } #mandoP select { width: 100%; padding: 7px 8px; border-radius: 10px; border: 2px solid #475569; background: #0f172a; color: #e2e8f0; font: 700 14px "Trebuchet MS", sans-serif; }
  #mandoP .ft { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 14px; } #mandoP .ft button { border: 0; border-radius: 999px; padding: 10px 16px; font: 900 14px "Trebuchet MS", sans-serif; cursor: pointer; }
  #mandoP .sw { display: inline-flex; align-items: center; gap: 8px; font-weight: 900; } #mandoP .sw input { width: 22px; height: 22px; }
  #mandoP .hint { color: #94a3b8; font-size: 13.5px; font-weight: 700; margin: 6px 0 0; }`;
  document.head.appendChild(css);
  const ICO = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 22 q4-6 12-6 h12 q8 0 12 6 l6 18 q2 9-5 10 q-5 1-9-6 l-2-4 H24 l-2 4 q-4 7-9 6 q-7-1-5-10z" fill="#2b2547"/><circle cx="21" cy="30" r="4" fill="#ef4444"/><circle cx="43" cy="35" r="4" fill="#38bdf8"/><circle cx="46" cy="25" r="2.6" fill="#fff"/><circle cx="51" cy="29" r="2.6" fill="#fff"/><path d="M27 34 h4 v-4 h2 v4 h4 v2 h-4 v4 h-2 v-4 h-4z" fill="#fff"/></svg><i></i>';
  btn = document.createElement('button'); btn.id = 'mandoBtn'; btn.type = 'button'; btn.title = 'Mando de control'; btn.setAttribute('aria-label', 'Mando de control'); btn.innerHTML = ICO; btn.hidden = true;
  document.body.appendChild(btn);
  const lugar = () => { const l = document.getElementById('bibLink'); if (!l) return; const r = l.getBoundingClientRect(); btn.style.right = Math.round(innerWidth - r.left + 12) + 'px'; };
  const mostrar = () => { btn.hidden = !esDocente(); if (!btn.hidden) lugar(); };
  addEventListener('resize', lugar); addEventListener('moli2:me', mostrar); setTimeout(mostrar, 300); setTimeout(mostrar, 2500);
  btn.addEventListener('click', e => { e.stopPropagation(); abrirPanel(); });
  function pintaEstado() { if (!btn) return; btn.classList.toggle('on', mandos().length > 0); const e = P && P.querySelector('.est'); if (e) { const g = mandos()[0]; e.className = 'est' + (g ? ' ok' : ''); e.textContent = g ? '🟢 Mando conectado: ' + nombreMando(g) + (g.mapping === 'standard' ? '' : ' · (mapa no estándar: prueba cada botón)') : '⚪ Conecta tu mando por Bluetooth y presiona cualquier botón para que aparezca.'; } }

  // ---- el panel: el dibujo del mando y la lista de botones ----
  function padSvg() {
    const k = (i, el) => el.replace('<', `<g data-k="${i}"><`).replace(/\/>$/, ` class="k" />`) + '</g>';
    const t = (x, y, s) => `<text x="${x}" y="${y}">${s}</text>`;
    return `<svg class="pad" viewBox="0 0 620 400" role="img" aria-label="Dibujo del mando">
      <path d="M150 78 q40-22 110-22 h100 q70 0 110 22 q38 24 52 90 l30 140 q12 64-38 72 q-38 6-66-40 l-26-44 H218 l-26 44 q-28 46-66 40 q-50-8-38-72 l30-140 q14-66 52-90z" fill="#111827" stroke="#475569" stroke-width="4"/>
      <path d="M118 112 q0-22 36-36" fill="none" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/><path d="M502 112 q0-22-36-36" fill="none" stroke="#38bdf8" stroke-width="8" stroke-linecap="round"/>
      ${k(6, '<rect x="118" y="8" width="96" height="30" rx="14"/>')}${t(166, 23, 'ZL')}${k(4, '<rect x="128" y="42" width="110" height="26" rx="12"/>')}${t(183, 55, 'L')}
      ${k(7, '<rect x="406" y="8" width="96" height="30" rx="14"/>')}${t(454, 23, 'ZR')}${k(5, '<rect x="382" y="42" width="110" height="26" rx="12"/>')}${t(437, 55, 'R')}
      ${k(10, '<circle cx="182" cy="150" r="40"/>')}${t(182, 150, 'L3')}<g class="ar" fill="#38bdf8">${t(182, 96, '▲')}${t(182, 204, '▼')}${t(128, 150, '◀')}${t(236, 150, '▶')}</g><circle class="dot" data-st="l" cx="182" cy="150" r="11" fill="#38bdf8" opacity=".85"/>
      ${k(12, '<rect x="232" y="196" width="36" height="40" rx="7"/>')}${t(250, 216, '↑')}${k(13, '<rect x="232" y="270" width="36" height="40" rx="7"/>')}${t(250, 290, '↓')}
      ${k(14, '<rect x="192" y="235" width="42" height="36" rx="7"/>')}${t(213, 253, '←')}${k(15, '<rect x="266" y="235" width="42" height="36" rx="7"/>')}${t(287, 253, '→')}
      ${k(11, '<circle cx="390" cy="252" r="40"/>')}${t(390, 252, 'R3')}<circle class="dot" data-st="r" cx="390" cy="252" r="11" fill="#38bdf8" opacity=".85"/>
      ${k(3, '<circle cx="450" cy="106" r="22"/>')}${t(450, 106, 'X')}${k(1, '<circle cx="494" cy="148" r="22"/>')}${t(494, 148, 'A')}
      ${k(0, '<circle cx="450" cy="190" r="22"/>')}${t(450, 190, 'B')}${k(2, '<circle cx="406" cy="148" r="22"/>')}${t(406, 148, 'Y')}
      ${k(8, '<circle cx="262" cy="96" r="14"/>')}${t(262, 96, '−')}${k(9, '<circle cx="358" cy="96" r="14"/>')}${t(358, 96, '+')}
      ${k(17, '<rect x="268" y="132" width="26" height="26" rx="6"/>')}${t(281, 145, '◉')}${k(16, '<circle cx="340" cy="145" r="15"/>')}${t(340, 145, '⌂')}
      <g fill="#64748b">${[0, 1, 2, 3].map(j => `<rect x="${272 + j * 20}" y="330" width="12" height="6" rx="2"/>`).join('')}</g></svg>`;
  }
  const opciones = (L, v) => L.map(([k, t]) => `<option value="${esc(k)}"${k === v ? ' selected' : ''}>${esc(t)}</option>`).join('');
  function lista() { const A = acciones();
    return STK.slice(0, 4).map(([k, n]) => `<div class="row" data-rs="${k}"><b>${esc(n)}</b><select data-s="${k}">${opciones(A, CFG.s[k] || 'nada')}</select></div>`).join('') + BOT.map(([i, n]) => `<div class="row" data-r="${i}"><b>${esc(n)}</b><select data-b="${i}">${opciones(A, CFG.b[i] || 'nada')}</select></div>`).join('') +
      STK.slice(4).map(([k, n]) => `<div class="row" data-rs="${k}"><b>${esc(n)}</b><select data-s="${k}">${opciones(A, CFG.s[k] || 'nada')}</select></div>`).join(''); }
  function abrirPanel() {
    if (!P) { P = document.createElement('div'); P.id = 'mandoP'; document.body.appendChild(P);
      P.addEventListener('click', e => { if (e.target === P || e.target.closest('.x')) return cerrarPanel();
        const g = e.target.closest('[data-k]'); if (g) return elegir(+g.dataset.k);
        if (e.target.closest('[data-reset]')) { CFG = JSON.parse(JSON.stringify(DEF)); guardar(); pintarPanel(); } });
      P.addEventListener('change', e => { const s = e.target;
        if (s.dataset.b != null) { CFG.b[s.dataset.b] = s.value; guardar(); const o = P.querySelector(`.ult select`); if (o && +o.dataset.b === +s.dataset.b) o.value = s.value; const r = P.querySelector(`.lst select[data-b="${s.dataset.b}"]`); if (r) r.value = s.value; }
        if (s.dataset.s) { CFG.s[s.dataset.s] = s.value; guardar(); P.querySelectorAll(`select[data-s="${s.dataset.s}"]`).forEach(o => { if (o !== s) o.value = s.value; }); }
        if (s.dataset.on != null) { CFG.on = s.checked; guardar(); } }); }
    pintarPanel(); P.classList.add('on'); arrancar();
    ver = (i, g) => { if (typeof i === 'string') return elegirS(i.slice(1)); if (i != null) elegir(i);
      if (g && P) [['l', 182, 150, 0], ['r', 390, 252, 2]].forEach(([k, cx, cy, ax]) => { const d = P.querySelector(`.dot[data-st="${k}"]`); if (d) { d.setAttribute('cx', cx + (g.axes[ax] || 0) * 26); d.setAttribute('cy', cy + (g.axes[ax + 1] || 0) * 26); } }); if (g && P) { const on = g.buttons.map(b => b.pressed || b.value > 0.5); P.querySelectorAll('[data-k]').forEach(x => x.querySelector('.k').classList.toggle('on', !!on[+x.dataset.k])); P.querySelectorAll('.row[data-r]').forEach(x => x.classList.toggle('on', !!on[+x.dataset.r])); } };
  }
  function pintarPanel() {
    P.innerHTML = `<div class="mp" role="dialog" aria-label="Mando de control"><div class="hd"><h2>🎮 Mando de control</h2><button class="x" type="button" aria-label="Cerrar">✕</button></div><p class="est"></p>
      <div class="gr"><div>${padSvg()}<div class="ult">${SEL == null ? '👆 Presiona un botón de tu mando (o tócalo en el dibujo) para elegir qué hace.' : `<span>Botón <b>${esc(NOM[SEL])}</b>:</span> <select data-b="${SEL}">${opciones(acciones(), CFG.b[SEL] || 'nada')}</select>`}</div>
        <p class="hint">Mientras este panel está abierto, el mando no mueve el aula: sólo se prueba. Ciérralo para usarlo.<br>🖱️ <b>ZL + ZR juntos</b>: modo mouse (L3 mueve la flecha, A hace clic, R3 baja la página). Otra vez ZL + ZR para salir.</p></div>
      <div class="lst">${lista()}</div></div>
      <div class="ft"><label class="sw"><input type="checkbox" data-on${CFG.on ? ' checked' : ''}> Usar el mando en el aula y en la Biblioteca</label><span style="flex:1"></span><button type="button" data-reset style="background:#334155;color:#fff">↺ Volver a lo de fábrica</button><button type="button" class="x" style="width:auto;height:auto;border-radius:999px;background:#22c55e;color:#052e16">✓ Listo</button></div></div>`;
    pintaEstado(); if (SEL != null) marcarSel();
  }
  function elegir(i) { SEL = i; const u = P.querySelector('.ult'); if (u) u.innerHTML = `<span>Botón <b>${esc(NOM[i])}</b>:</span> <select data-b="${i}">${opciones(acciones(), CFG.b[i] || 'nada')}</select>`; marcarSel(); }
  function elegirS(k) { SEL = null; const n = (STK.find(x => x[0] === k) || [])[1]; const u = P.querySelector('.ult'); if (u) u.innerHTML = `<span><b>${esc(n)}</b>:</span> <select data-s="${k}">${opciones(acciones(), CFG.s[k] || 'nada')}</select>`;
    P.querySelectorAll('.row').forEach(x => x.classList.toggle('sel', x.dataset.rs === k)); P.querySelectorAll('[data-k] .k').forEach(x => x.classList.remove('sel')); }
  function marcarSel() { P.querySelectorAll('[data-k] .k').forEach(x => x.classList.toggle('sel', +x.parentNode.dataset.k === SEL)); P.querySelectorAll('.row[data-r]').forEach(x => x.classList.toggle('sel', +x.dataset.r === SEL)); }
  function cerrarPanel() { if (P) P.classList.remove('on'); ver = null; }
  addEventListener('keydown', e => { if (e.key === 'Escape' && panelAbierto()) { e.stopPropagation(); cerrarPanel(); } }, true);
  if (window.Herramientas) Herramientas.extra.mando = () => { if (window.Herramientas.cerrar) try { Herramientas.cerrar(); } catch (e) {} abrirPanel(); };
  window.Mando = { abrir: abrirPanel, cerrar: cerrarPanel, hacer, get cfg() { return CFG; } };
})();
