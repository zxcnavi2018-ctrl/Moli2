// ===================================================================
//  MOLÍ 2 · CONTROL REMOTO (como en Molí 1): el celular de la docente maneja la laptop o el proyector.
//  Los dos entran con la misma cuenta de docente (DNI + clave) y se encuentran solos por un canal secreto.
//  También las ANIMACIONES de clase (silencio, tambor, atención, acuerdos, roles, puntos por grupo, final,
//  sorteo y temporizador), ahora con el nuevo Molí 3D.
// ===================================================================
(function () {
  const FB = { projectId: 'ciencia6abcd', apiKey: 'AIzaSyB3IlHEFGkCGtZhPZxV5-a47Pg2mAaIjSM' };
  const BASE = `https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents/remote`;
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toV = v => typeof v === 'number' ? { integerValue: String(Math.round(v)) } : v instanceof Date ? { timestampValue: v.toISOString() } : { stringValue: String(v) };
  const fromV = v => 'integerValue' in v ? +v.integerValue : 'timestampValue' in v ? Date.parse(v.timestampValue) : v.stringValue;
  async function leer(id) { const r = await fetch(`${BASE}/${id}?key=${FB.apiKey}`, { cache: 'no-store' }); if (r.status === 404) return null; if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json(), o = {}; Object.entries(j.fields || {}).forEach(([k, v]) => o[k] = fromV(v)); return o; }
  async function poner(id, obj) { const ks = Object.keys(obj), q = ks.map(k => 'updateMask.fieldPaths=' + k).join('&');
    const r = await fetch(`${BASE}/${id}?${q}&key=${FB.apiKey}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: Object.fromEntries(ks.map(k => [k, toV(obj[k])])) }) });
    if (!r.ok) throw new Error(r.status === 403 ? 'REGLAS' : 'RED'); }
  const hex32 = () => [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
  const esCel = () => /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent) || (matchMedia('(pointer:coarse)').matches && Math.min(screen.width, screen.height) < 820);
  const R = { rol: null, c: null, last: 0, t: 0, vivo: false, sAt: 0, sAt0: null };
  async function canal() {
    const me = MD.yo(); if (!me || !me.rcs) throw new Error('CLAVE');
    const p = 'p-' + me.rcs; let d = null; try { d = await leer(p); } catch (e) {}
    let c = d && /^[0-9a-f]{32}$/.test(d.c || '') ? d.c : null;
    if (!c) { c = hex32(); await poner(p, { c, at: new Date() }); await poner('c-' + c, { cmd: '', arg: '', seq: 0, at: new Date() }); await poner('s-' + c, { st: '{}', cfg: '', at: new Date() }); }
    return c;
  }
  function detener() { clearInterval(R.t); R.t = 0; R.rol = null; R.c = null; R.vivo = false; LS.set('moli2:rc:rol', null); pintaChip(); }

  // ---------------- LAPTOP / PROYECTOR: recibe las órdenes ----------------
  async function comoLaptop() {
    detener(); R.c = await canal(); R.rol = 'pc'; LS.set('moli2:rc:rol', 'pc');
    try { const d = await leer('c-' + R.c); R.last = d && +d.seq || 0; } catch (e) {}
    estado(); let n = 0;
    R.t = setInterval(async () => { if (document.hidden) return;
      try { const d = await leer('c-' + R.c); if (d && +d.seq > R.last) { R.last = +d.seq; ejecutar(d.cmd, d.arg || ''); estado(); } } catch (e) {}
      if (++n % 10 === 0) estado(); }, 1000);
    pintaChip();
  }
  let stT = 0;
  function estado() { clearTimeout(stT); stT = setTimeout(() => { if (R.rol !== 'pc') return; const G = window.G; const st = { i: G ? G.TOUR.i : 0, p: puntos(), n: Date.now() % 100000 };
    poner('s-' + R.c, { st: JSON.stringify(st), at: new Date() }).catch(() => {}); }, 300); }
  function ejecutar(cmd, arg) {
    if (window.ComPres && ComPres.abierta() && (cmd === 'nx' || cmd === 'pv')) return ComPres.enviar(cmd);   // presentación de Comunicación abierta: el control la pasa
    const G = window.G; if (!G) return;
    const sh = G.sheet, abierto = sh && sh.style.display === 'block', clic = sel => { const b = sh.querySelector(sel); if (b && !b.disabled) { b.click(); return true; } return false; };
    if (cmd === 'off') { quitarTimer(); puntosReset(); return detener(); }
    if (cmd === 'nx' || cmd === 'pv') { const d = cmd === 'nx' ? 1 : -1;
      if (abierto && (clic(`[data-nav="${d}"]`) || clic(`[data-cv="${d}"]`) || clic(`[data-pp="${d}"]`))) return; return G.go(d); }
    if (cmd === 'ir') { const k = +arg; if (k >= 0 && k < G.STOPS.length && k !== G.TOUR.i) G.go(k - G.TOUR.i); return; }
    if (cmd === 'fs') { const de = document.documentElement; if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else de.requestFullscreen && de.requestFullscreen().catch(() => {}); return; }
    if (cmd === 'tm') return +arg ? timer(+arg) : quitarTimer();
    if (cmd === 'an') return animar(arg);
    if (cmd === 'sr') return sorteo(arg);
    if (cmd === 'mx') { G.moli.expr(arg); G.moli.accion('saltar'); setTimeout(() => G.moli.expr('normal'), 2600); }
  }

  // ---------------- CELULAR: el control ----------------
  async function comoCelular() {
    detener(); R.c = await canal(); R.rol = 'phone'; LS.set('moli2:rc:rol', 'phone'); R.sAt0 = null; R.vivo = false;
    const ping = async () => { try { const d = await leer('s-' + R.c); if (d) { if (R.sAt0 == null) R.sAt0 = d.at; else if (d.at !== R.sAt0) { R.vivo = true; R.sAt0 = d.at; } try { R.st = JSON.parse(d.st || '{}'); } catch (e) {} } } catch (e) {} pintaControl(); };
    enviar('pi', ''); ping(); R.t = setInterval(() => { if (!document.hidden) ping(); }, 2500);
    pintaChip(); abrirControl();
  }
  async function enviar(cmd, arg) {
    if (!R.c) return; try { await poner('c-' + R.c, { cmd: String(cmd).slice(0, 10), arg: String(arg || '').slice(0, 60), seq: Date.now(), at: new Date() }); navigator.vibrate && navigator.vibrate(18); }
    catch (e) { aviso('📶 No se pudo enviar. Revisa tu internet.'); }
  }
  const escenas = () => { const B = [...document.querySelectorAll('#dots button')]; return B.length ? B.map(b => { const t = b.textContent.trim(), i = t.split(' ')[0]; return [i, t.slice(i.length).trim()]; }) : ESC; };   // las escenas reales del aula (incluye las nuevas)
  const ESC = [['🏫', 'Mi aula'], ['📗', 'Sesiones'], ['🎟️', 'Exit tickets'], ['💻', 'Laboratorio'], ['📌', 'Corcho'], ['📂', 'Notas'], ['💪', 'Misiones'], ['📽️', 'Pizarra']];
  const ANIM = [['palmas', '👏', 'Palmas'], ['shh', '🤫', 'Silencio'], ['drum', '🥁', 'Tambor'], ['angry', '😠', 'Atención'], ['acu', '🤝', 'Acuerdos'], ['rol', '👥', 'Roles'], ['fin', '🏆', 'Final']];
  const GC = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
  let cuerpo = null;
  function abrirControl() {
    cuerpo = Herramientas.abrir('📱 Control remoto', 'Con tu misma cuenta de docente · la laptop debe estar en «Laptop».', 'decidida', '<div class="rc"></div>', true);
    Herramientas.cerrarActual = () => { cuerpo = null; };
    cuerpo.addEventListener('click', e => { const b = e.target.closest('[data-rc]'); if (!b) return; const k = b.dataset.rc, v = b.dataset.v || '';
      b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
      if (k === 'off') { enviar('off', ''); setTimeout(detener, 400); Herramientas.cerrar(); return; }
      if (k === 'srs') { LS.set('moli2:rc:srs', v); return pintaControl(); }
      if (k === 'sr') return sortear();
      if (k === 'g') { const p = puntos(); p[+v] = (p[+v] || 0) + 1; LS.set(PK, p); }
      enviar(k === 'g' ? 'an' : k, k === 'g' ? 'g' + (+v + 1) : v); pintaControl(); });
    pintaControl();
  }
  function pintaControl() {                                            // se arma una vez; después sólo se actualiza lo que cambia (no parpadea)
    if (!cuerpo) return; const st = R.st || {}, p = (st.p && st.p.length ? st.p : puntos()), sec = LS.get('moli2:rc:srs', 'A'), box = cuerpo.querySelector('.rc');
    if (box.firstChild) {
      const e = box.querySelector('.rc-est'); e.innerHTML = `<i class="${R.vivo ? 'on' : ''}"></i>${R.vivo ? 'Laptop conectada' : 'Buscando tu laptop… (ábrela y elige «💻 Laptop»)'}`;
      box.querySelectorAll('[data-rc="ir"]').forEach(b => b.classList.toggle('on', +b.dataset.v === st.i));
      box.querySelectorAll('[data-rc="g"] small').forEach((x, k) => { x.textContent = p[k] || 0; });
      box.querySelectorAll('[data-rc="srs"]').forEach(b => b.classList.toggle('on', b.dataset.v === sec)); box.querySelector('.rc-go').textContent = `¡Sortear en ${MD.espInfo().gn} ${sec}!`;
      return;
    }
    box.innerHTML = `<p class="rc-est"><i class="${R.vivo ? 'on' : ''}"></i>${R.vivo ? 'Laptop conectada' : 'Buscando tu laptop… (ábrela y elige «💻 Laptop»)'}</p>
      <div class="rc-card"><b>🎬 Escenas</b><div class="rc-g8">${escenas().map(([i, t], k) => `<button data-rc="ir" data-v="${k}" class="${st.i === k ? 'on' : ''}"><i>${i}</i>${t}</button>`).join('')}</div></div>
      <div class="rc-card"><b>📽️ Proyección</b><div class="rc-pad"><button data-rc="pv">◀</button><button data-rc="fs">⛶ Pantalla</button><button data-rc="nx">▶</button></div>
        <div class="rc-tm">⏱️ ${[5, 10, 15, 20].map(m => `<button data-rc="tm" data-v="${m}">${m} min</button>`).join('')}<button data-rc="tm" data-v="0">✕</button></div></div>
      <div class="rc-card"><b>🏅 Grupos · +1 punto</b><div class="rc-gp">${GC.map((c, k) => `<button data-rc="g" data-v="${k}" style="--c:${c}">G${k + 1}<small>${p[k] || 0}</small></button>`).join('')}</div></div>
      <div class="rc-card"><b>🎲 Sorteo</b><div class="rc-sr">${['A', 'B', 'C', 'D'].map(x => `<button data-rc="srs" data-v="${x}" class="${sec === x ? 'on' : ''}">${MD.espInfo().gn} ${x}</button>`).join('')}<button data-rc="sr" class="rc-go">¡Sortear en ${MD.espInfo().gn} ${sec}!</button></div></div>
      <div class="rc-card"><b>🤖 Animaciones de Molí</b><div class="rc-an">${ANIM.map(([k, i, t]) => `<button data-rc="an" data-v="${k}"><i>${i}</i>${t}</button>`).join('')}</div>
        <div class="rc-mx">${['feliz', 'estrellas', 'sorpresa', 'guiño', 'pensativo', 'triste', 'enojado', 'normal'].map(x => `<button data-rc="mx" data-v="${x}">${{ feliz: '😊', estrellas: '🤩', sorpresa: '😮', 'guiño': '😉', pensativo: '🤔', triste: '😢', enojado: '😠', normal: '🙂' }[x]}</button>`).join('')}</div></div>
      <p class="rc-pie"><button data-rc="off">⏻ Apagar el control</button></p>`;
  }
  async function sortear() {
    const sec = LS.get('moli2:rc:srs', 'A'); let E = [];
    try { E = (await Docente.estudiantes()).filter(e => e.section === sec); } catch (e) { return aviso('🔐 Conecta tu cuenta de docente para el sorteo.'); }
    if (!E.length) return aviso('No hay estudiantes en ' + MD.espInfo().gn + ' ' + sec + '.');
    const k = 'moli2:rc:sr:' + sec; let ya = LS.get(k, []); let libres = E.filter(e => !ya.includes(e.key)); if (!libres.length) { ya = []; libres = E; }
    const w = libres[Math.floor(Math.random() * libres.length)]; ya.push(w.key); LS.set(k, ya);
    enviar('sr', sec + '|' + w.key); aviso('🎲 Salió: ' + w.name);
  }
  function aviso(t) { if (!cuerpo) return; let a = cuerpo.querySelector('.rc-av'); if (!a) { a = document.createElement('p'); a.className = 'rc-av'; cuerpo.prepend(a); } a.textContent = t; }

  // ---------------- chip en la esquina (sólo docente) ----------------
  const chip = document.createElement('button'); chip.id = 'rcChip'; chip.hidden = true;
  const ponChip = () => { if (!chip.isConnected && document.body) document.body.appendChild(chip); };
  document.addEventListener('DOMContentLoaded', ponChip); ponChip();
  function pintaChip() { chip.hidden = !R.rol; chip.textContent = R.rol === 'pc' ? '💻 Laptop · control activo' : R.rol === 'phone' ? '📱 Control' : ''; chip.classList.toggle('pc', R.rol === 'pc'); }
  chip.addEventListener('click', e => { e.stopPropagation(); if (R.rol === 'phone') abrirControl(); else if (R.rol === 'pc' && confirm('¿Desconectar el control remoto de esta pantalla?')) detener(); });

  // ---------------- 💻 / 📱: qué hace este equipo ----------------
  function equipo() {
    const b = Herramientas.abrir('💻 Laptop o 📱 celular', 'El control remoto usa tu misma cuenta de docente en los dos equipos.', 'idea', `
      <div class="rc-eq"><button data-q="pc"><i>💻</i><b>Laptop / proyector</b><small>Esta pantalla la verá la clase. Tu celular la maneja.</small></button>
      <button data-q="ph"><i>📱</i><b>Celular (control)</b><small>Desde aquí manejas la laptop: escenas, animaciones, sorteo…</small></button></div>
      <p class="hp-msg"></p>${R.rol ? '<p class="rc-pie"><button data-q="off">⏻ Desconectar este equipo</button></p>' : ''}`);
    b.addEventListener('click', async e => { const q = e.target.closest('[data-q]'); if (!q) return; const m = b.querySelector('.hp-msg');
      if (q.dataset.q === 'off') { detener(); Herramientas.cerrar(); return; }
      m.textContent = 'Conectando…';
      try { if (q.dataset.q === 'pc') { await comoLaptop(); m.textContent = '✅ Listo: esta pantalla espera tu celular. En tu celular elige «📱 Celular».'; setTimeout(() => Herramientas.cerrar(), 1800); }
        else await comoCelular(); }
      catch (x) { m.textContent = x.message === 'CLAVE' ? '🔐 Vuelve a entrar con tu DNI y clave (toca tu fotocheck → Cerrar sesión y entra otra vez).' : x.message === 'REGLAS' ? '🔧 Falta publicar las reglas de Firebase del control remoto.' : '📶 No pude conectarme. Revisa tu internet.'; } });
  }
  function remoto() { if (R.rol === 'phone') return abrirControl(); if (R.rol === 'pc') return equipo(); return esCel() ? comoCelular().catch(() => equipo()) : equipo(); }
  Herramientas.extra.remoto = remoto; Herramientas.extra.equipo = equipo;
  window.RemotoCmd = ejecutar;                                         // el 🎮 Mando de control usa las mismas animaciones
  // si este equipo ya era la laptop, se vuelve a conectar sola
  addEventListener('load', () => { if (LS.get('moli2:rc:rol', null) === 'pc' && MD.esDocente()) setTimeout(() => comoLaptop().catch(() => {}), 3000); });

  // =================================================================
  //  ANIMACIONES DE CLASE (con el nuevo Molí 3D)
  // =================================================================
  const capa = document.createElement('div'); capa.id = 'anim';
  const ponCapa = () => { if (!capa.isConnected && document.body) document.body.appendChild(capa); };
  document.addEventListener('DOMContentLoaded', ponCapa); ponCapa();
  let capaT = 0, capaN = 0;
  const IMG = n => `img/moli/${n}.webp`;
  function mostrar(html, ms, cls) { ponCapa(); clearTimeout(capaT); const n = ++capaN; capa.className = 'on ' + (cls || ''); capa.innerHTML = html; capaT = setTimeout(() => cerrarCapa(n), ms); }
  function cerrarCapa(n) { if (n != null && n !== capaN) return; const m = capaN; capa.classList.add('fuera'); setTimeout(() => { if (m === capaN) { capa.className = ''; capa.innerHTML = ''; } }, 450); }
  capa.addEventListener('click', () => cerrarCapa(capaN));
  const molí3d = (expr, acc) => { const G = window.G; if (!G) return; G.moli.expr(expr); if (acc) G.moli.accion(acc, 1); setTimeout(() => G.moli.expr('normal'), 4000); };
  // ---- sonidos (sin archivos) ----
  let ac = null; const A = () => ac || (ac = new (window.AudioContext || window.webkitAudioContext)());
  function tono(f, t0, d, tipo = 'sine', v = .25) { const a = A(), o = a.createOscillator(), g = a.createGain(); o.type = tipo; o.frequency.value = f; g.gain.setValueAtTime(0, a.currentTime + t0); g.gain.linearRampToValueAtTime(v, a.currentTime + t0 + .01); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + t0 + d); o.connect(g).connect(a.destination); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + d + .05); }
  function ruido(t0, d, f = 3000, v = .3) { const a = A(), n = a.sampleRate * d, b = a.createBuffer(1, n, a.sampleRate), x = b.getChannelData(0); for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n);
    const s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(); s.buffer = b; fl.type = 'bandpass'; fl.frequency.value = f; g.gain.value = v; s.connect(fl).connect(g).connect(a.destination); s.start(a.currentTime + t0); }
  const golpe = t0 => { tono(90, t0, .25, 'sine', .7); ruido(t0, .08, 180, .5); };
  function sonido(d, arma) { const a = A(), n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), x = b.getChannelData(0); let ult = 0;
    for (let i = 0; i < n; i++) { ult = .97 * ult + .03 * (Math.random() * 2 - 1); x[i] = ult * 9; }                       // ruido suave (rosado)
    const s = a.createBufferSource(); s.buffer = b; arma(a, s, a.currentTime); s.start(); }
  function jet(d) { sonido(d, (a, s, t) => {                             // ✈️ la turbina del avión: «shhhhhh» que crece y se va
    const bp = a.createBiquadFilter(), g = a.createGain(), lp = a.createBiquadFilter(), g2 = a.createGain();
    bp.type = 'bandpass'; bp.Q.value = .7; bp.frequency.setValueAtTime(700, t); bp.frequency.linearRampToValueAtTime(2600, t + d * .55); bp.frequency.linearRampToValueAtTime(900, t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.55, t + d * .4); g.gain.linearRampToValueAtTime(.4, t + d * .7); g.gain.linearRampToValueAtTime(0, t + d);
    lp.type = 'lowpass'; lp.frequency.value = 160; g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(.5, t + d * .4); g2.gain.linearRampToValueAtTime(0, t + d);
    s.connect(bp).connect(g).connect(a.destination); s.connect(lp).connect(g2).connect(a.destination); }); }
  function helice(d) { sonido(d, (a, s, t) => {                          // 🚁 el «chop-chop-chop» de las hélices
    const lp = a.createBiquadFilter(), am = a.createGain(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 520; lfo.type = 'square'; lfo.frequency.value = 13; lg.gain.value = .5; am.gain.value = .5; lfo.connect(lg).connect(am.gain);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.9, t + .5); g.gain.setValueAtTime(.9, t + d - .8); g.gain.linearRampToValueAtTime(0, t + d);
    s.connect(lp).connect(am).connect(g).connect(a.destination); lfo.start(t); lfo.stop(t + d); }); }
  function espacio(d) { const a = A(), t = a.currentTime;                // 🚀 zumbido suave de la nave
    [55, 82.5].forEach(f => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.09, t + 1); g.gain.setValueAtTime(.09, t + d - 1); g.gain.linearRampToValueAtTime(0, t + d); o.connect(g).connect(a.destination); o.start(t); o.stop(t + d); }); }
  // ✈️ avión de pasajeros (mira a la derecha), Molí de piloto en la ventana de la cabina
  const AVION = img => `<svg class="an-avion" viewBox="0 0 400 170" aria-hidden="true">
    <path d="M70 70 L40 12 Q38 6 46 6 L64 6 Q70 6 74 12 L118 66 Z" fill="#2563eb" stroke="#1e3a8a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M40 86 Q40 58 90 56 L320 56 Q372 58 386 88 Q372 116 320 118 L90 118 Q40 116 40 86 Z" fill="#f8fafc" stroke="#334155" stroke-width="3.5"/>
    <path d="M60 104 Q200 116 368 100" stroke="#2563eb" stroke-width="8" fill="none" stroke-linecap="round"/>
    ${[0, 1, 2, 3, 4].map(q => `<rect x="${112 + q * 26}" y="72" width="13" height="17" rx="6" fill="#7dd3fc" stroke="#1e3a8a" stroke-width="2"/>`).join('')}
    <path d="M180 92 L120 150 Q116 156 124 156 L150 156 Q156 156 160 150 L240 96 Z" fill="#3b82f6" stroke="#1e3a8a" stroke-width="3" stroke-linejoin="round"/>
    <rect x="160" y="122" width="54" height="16" rx="8" fill="#94a3b8" stroke="#334155" stroke-width="2.5"/>
    <path d="M352 66 Q372 72 382 86 L352 86 Z" fill="#bae6fd" stroke="#1e3a8a" stroke-width="2.5"/>
    <clipPath id="anCab"><circle cx="306" cy="76" r="44"/></clipPath><circle cx="306" cy="76" r="47" fill="#bae6fd" stroke="#1e3a8a" stroke-width="5"/>
    <image href="${img}" x="256" y="28" width="100" height="100" clip-path="url(#anCab)"/><path d="M276 52 Q290 40 306 38" stroke="#fff" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/></svg>`;
  const AVIONNAV = img => `<svg class="an-avion" viewBox="0 0 400 170" aria-hidden="true">
    <path d="M70 70 L40 12 Q38 6 46 6 L64 6 Q70 6 74 12 L118 66 Z" fill="#16a34a" stroke="#14532d" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="66" cy="34" r="13" fill="none" stroke="#15803d" stroke-width="7"/><circle cx="66" cy="34" r="13" fill="none" stroke="#86efac" stroke-width="2" stroke-dasharray="2 5"/><path d="M60 46 l6 -5 l6 5" fill="#dc2626"/><circle cx="66" cy="44" r="3.5" fill="#dc2626"/>
    <clipPath id="anFus"><path d="M40 86 Q40 58 90 56 L320 56 Q372 58 386 88 Q372 116 320 118 L90 118 Q40 116 40 86 Z"/></clipPath>
    <path d="M40 86 Q40 58 90 56 L320 56 Q372 58 386 88 Q372 116 320 118 L90 118 Q40 116 40 86 Z" fill="#fff"/>
    <g clip-path="url(#anFus)">${Array.from({ length: 16 }, (_, q) => `<path d="M${20 + q * 26} 130 L${50 + q * 26} 40 L${62 + q * 26} 40 L${32 + q * 26} 130 Z" fill="${q % 2 ? '#dc2626' : '#16a34a'}" opacity=".9"/>`).join('')}</g>
    <path d="M40 86 Q40 58 90 56 L320 56 Q372 58 386 88 Q372 116 320 118 L90 118 Q40 116 40 86 Z" fill="none" stroke="#7f1d1d" stroke-width="3.5"/>
    <path d="M60 104 Q200 116 368 100" stroke="#facc15" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M70 60 Q190 48 330 58" stroke="#14532d" stroke-width="2" fill="none"/>
    ${Array.from({ length: 11 }, (_, q) => `<circle class="an-foco" cx="${78 + q * 24}" cy="${57 - Math.sin(q / 10 * Math.PI) * 6}" r="5" style="--d:${(q % 4) * .18}s;--c:${['#fde047', '#f87171', '#60a5fa', '#c084fc'][q % 4]}"/>`).join('')}
    ${[0, 1, 2, 3, 4].map(q => `<rect x="${112 + q * 26}" y="72" width="13" height="17" rx="6" fill="#fef9c3" stroke="#7f1d1d" stroke-width="2"/>`).join('')}
    <path d="M180 92 L120 150 Q116 156 124 156 L150 156 Q156 156 160 150 L240 96 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="3" stroke-linejoin="round"/>
    <path d="M150 122 L200 104" stroke="#fde047" stroke-width="4" stroke-linecap="round"/>
    <rect x="160" y="122" width="54" height="16" rx="8" fill="#facc15" stroke="#a16207" stroke-width="2.5"/>
    <path d="M352 66 Q372 72 382 86 L352 86 Z" fill="#bae6fd" stroke="#7f1d1d" stroke-width="2.5"/>
    <clipPath id="anCab2"><circle cx="306" cy="76" r="44"/></clipPath><circle cx="306" cy="76" r="47" fill="#e0f2fe" stroke="#facc15" stroke-width="6"/>
    <image href="${img}" x="256" y="28" width="100" height="100" clip-path="url(#anCab2)"/><path d="M276 52 Q290 40 306 38" stroke="#fff" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/></svg>`;
  // 🚁 helicóptero rojo con Molí enojado en la burbuja
  const TRINEO = img => `<svg class="an-trineo" viewBox="0 0 800 250" aria-hidden="true">
    <path d="M250 150 Q330 120 380 160 Q520 120 520 160 Q660 120 660 160" stroke="#fbbf24" stroke-width="3" fill="none"/>
<g transform="translate(330 92)"><g class="an-reno" style="--r:-.5s">
      <path d="M22 62 l-6 34 M34 66 l-2 32 M72 66 l4 32 M84 62 l10 30" class="an-pata" stroke="#5b3416" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="54" cy="56" rx="42" ry="21" fill="#8b5a2b"/><ellipse cx="50" cy="64" rx="26" ry="9" fill="#c8a27a"/><path d="M14 50 q-12 -6 -8 -16 q8 4 10 12z" fill="#fff"/>
      <path d="M78 50 Q92 34 98 18 L112 22 Q104 46 92 62 Z" fill="#8b5a2b"/>
      <path d="M76 52 Q92 44 98 26" stroke="#dc2626" stroke-width="7" fill="none"/><circle cx="90" cy="44" r="5" fill="#facc15" stroke="#a16207" stroke-width="1.5"/>
      <path d="M100 14 q-6 -16 -16 -20 M96 4 q-8 -2 -12 -10 M108 12 q2 -16 12 -22 M114 0 q8 -2 10 -10" stroke="#6b3f1d" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="106" cy="20" rx="15" ry="11" fill="#8b5a2b"/><ellipse cx="94" cy="10" rx="6" ry="3.5" fill="#6b3f1d" transform="rotate(-30 94 10)"/>
      <circle cx="108" cy="16" r="3.2" fill="#111827"/><circle cx="109" cy="15" r="1" fill="#fff"/>
      <circle cx="121" cy="22" r="4" fill="#3b2412"/></g></g><g transform="translate(470 92)"><g class="an-reno" style="--r:-.25s">
      <path d="M22 62 l-6 34 M34 66 l-2 32 M72 66 l4 32 M84 62 l10 30" class="an-pata" stroke="#5b3416" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="54" cy="56" rx="42" ry="21" fill="#8b5a2b"/><ellipse cx="50" cy="64" rx="26" ry="9" fill="#c8a27a"/><path d="M14 50 q-12 -6 -8 -16 q8 4 10 12z" fill="#fff"/>
      <path d="M78 50 Q92 34 98 18 L112 22 Q104 46 92 62 Z" fill="#8b5a2b"/>
      <path d="M76 52 Q92 44 98 26" stroke="#dc2626" stroke-width="7" fill="none"/><circle cx="90" cy="44" r="5" fill="#facc15" stroke="#a16207" stroke-width="1.5"/>
      <path d="M100 14 q-6 -16 -16 -20 M96 4 q-8 -2 -12 -10 M108 12 q2 -16 12 -22 M114 0 q8 -2 10 -10" stroke="#6b3f1d" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="106" cy="20" rx="15" ry="11" fill="#8b5a2b"/><ellipse cx="94" cy="10" rx="6" ry="3.5" fill="#6b3f1d" transform="rotate(-30 94 10)"/>
      <circle cx="108" cy="16" r="3.2" fill="#111827"/><circle cx="109" cy="15" r="1" fill="#fff"/>
      <circle cx="121" cy="22" r="4" fill="#3b2412"/></g></g><g transform="translate(610 92)"><g class="an-reno" style="--r:0s">
      <path d="M22 62 l-6 34 M34 66 l-2 32 M72 66 l4 32 M84 62 l10 30" class="an-pata" stroke="#5b3416" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="54" cy="56" rx="42" ry="21" fill="#8b5a2b"/><ellipse cx="50" cy="64" rx="26" ry="9" fill="#c8a27a"/><path d="M14 50 q-12 -6 -8 -16 q8 4 10 12z" fill="#fff"/>
      <path d="M78 50 Q92 34 98 18 L112 22 Q104 46 92 62 Z" fill="#8b5a2b"/>
      <path d="M76 52 Q92 44 98 26" stroke="#dc2626" stroke-width="7" fill="none"/><circle cx="90" cy="44" r="5" fill="#facc15" stroke="#a16207" stroke-width="1.5"/>
      <path d="M100 14 q-6 -16 -16 -20 M96 4 q-8 -2 -12 -10 M108 12 q2 -16 12 -22 M114 0 q8 -2 10 -10" stroke="#6b3f1d" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="106" cy="20" rx="15" ry="11" fill="#8b5a2b"/><ellipse cx="94" cy="10" rx="6" ry="3.5" fill="#6b3f1d" transform="rotate(-30 94 10)"/>
      <circle cx="108" cy="16" r="3.2" fill="#111827"/><circle cx="109" cy="15" r="1" fill="#fff"/>
      <circle cx="121" cy="22" r="6" fill="#ef4444" class="an-nariz"/></g></g>
    <path d="M30 118 L36 70 Q40 60 52 60 L60 60" fill="none" stroke="#7f1d1d" stroke-width="10" stroke-linecap="round"/>
    <image href="${img}" x="44" y="-6" width="150" height="150"/>
    <text x="178" y="120" font-size="44" class="an-tamb">🥁</text>
    <path d="M24 120 Q22 196 92 196 L226 196 Q262 196 268 160 Q276 128 300 124 Q312 122 312 110 Q296 106 284 116 Q262 132 240 120 L24 120 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="5" stroke-linejoin="round"/>
    <path d="M44 140 Q120 160 236 140" stroke="#fde047" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="140" cy="168" r="10" fill="#fde047"/><circle cx="104" cy="164" r="6" fill="#fde047"/><circle cx="176" cy="164" r="6" fill="#fde047"/>
    <path d="M60 196 l-6 26 M210 196 l6 26" stroke="#a16207" stroke-width="7"/>
    <path d="M6 214 Q14 232 44 232 L262 232 Q300 232 312 206 Q318 194 330 196" stroke="#facc15" stroke-width="9" fill="none" stroke-linecap="round"/></svg>`;
  const HELI = img => `<svg class="an-heli-s" viewBox="0 0 400 260" aria-hidden="true">
    <rect x="196" y="18" width="10" height="34" fill="#334155"/><g class="an-rot1"><ellipse cx="201" cy="20" rx="190" ry="9" fill="rgba(30,41,59,.75)"/></g>
    <path d="M40 120 L190 108 L190 132 L40 130 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="3"/><path d="M40 130 L24 96 L52 96 L62 126 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="3"/>
    <g class="an-rot2"><ellipse cx="30" cy="112" rx="7" ry="30" fill="rgba(30,41,59,.7)"/></g>
    <path d="M150 120 Q150 52 236 50 Q320 52 336 118 Q330 176 250 180 L180 180 Q150 176 150 120 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="4"/>
    <clipPath id="anBur"><path d="M232 64 Q306 66 318 122 L232 124 Z"/></clipPath><path d="M232 64 Q306 66 318 122 L232 124 Z" fill="#bae6fd" stroke="#1e3a8a" stroke-width="3"/>
    <image href="${img}" x="222" y="50" width="104" height="104" clip-path="url(#anBur)"/>
    <path d="M170 150 Q240 160 320 146" stroke="#fde047" stroke-width="7" fill="none" stroke-linecap="round"/>
    <line x1="190" y1="180" x2="180" y2="214" stroke="#334155" stroke-width="5"/><line x1="290" y1="180" x2="300" y2="214" stroke="#334155" stroke-width="5"/>
    <path d="M140 214 L340 214 Q352 214 356 204" stroke="#334155" stroke-width="7" fill="none" stroke-linecap="round"/></svg>`;
  function animar(k) {
    try { A().resume && A().resume(); } catch (e) {}
    if (k === 'palmas') return palmas();
    const NAV = window.esNavidad && esNavidad();                       // 🎄 del 1 de noviembre al 6 de enero: avión navideño, tambor = trineo, atención = árbol
    if (k === 'shh' && NAV) { molí3d('guiño'); jet(7); for (let i = 0; i < 30; i++) [2637, 3136].forEach((f, q) => tono(f, .3 + i * .22 + q * .01, .12, 'triangle', .02));   // 🤫✈️🎄 avión navideño
      const nubes = Array.from({ length: 7 }, (_, q) => `<i class="an-nube" style="top:${8 + (q * 37) % 78}%;--d:${5 + (q % 4) * 1.6}s;--r:${-(q * 1.3)}s;--s:${.7 + (q % 3) * .35}"></i>`).join('');
      const nieve = Array.from({ length: 30 }, (_, q) => `<i class="an-copo" style="left:${(q * 31) % 100}%;--d:${4 + q % 5}s;--r:${-(q * .7)}s;--s:${.5 + (q % 4) * .25}">${['❄', '✦', '❄', '★'][q % 4]}</i>`).join('');
      const regalos = ['🎁', '🍬', '⭐', '🎀', '🔔', '🎁'].map((e, q) => `<i class="an-reg" style="--x:${12 + q * 15}vw;--d:${1.2 + q * .55}s">${e}</i>`).join('');
      return mostrar(`<div class="an-st an-shh2 an-shnav">${nubes}${nieve}<div class="an-vuelo"><div class="an-banda"><span>🎄 ¡Feliz Navidad! 🎄</span></div>${AVIONNAV(window.moliDibujo ? moliDibujo('decidida') : IMG('decidida'))}${regalos}</div>
        <div class="an-big shh">🤫 Shhhhh…</div><div class="an-bub">¡Respetamos las normas!</div></div>`, 7600, 'cielonav'); }
    if (k === 'shh') { molí3d('guiño'); jet(7);                       // 🤫✈️ Molí viaja en su avión: la turbina hace «shhhhh»
      const nubes = Array.from({ length: 9 }, (_, q) => `<i class="an-nube" style="top:${8 + (q * 37) % 78}%;--d:${5 + (q % 4) * 1.6}s;--r:${-(q * 1.3)}s;--s:${.7 + (q % 3) * .35}"></i>`).join('');
      return mostrar(`<div class="an-st an-shh2">${nubes}<div class="an-vuelo"><div class="an-estela"></div>${AVION(IMG('decidida'))}</div>
        <div class="an-big shh">🤫 Shhhhh…</div><div class="an-bub">¡Respetamos las normas!</div></div>`, 7600, 'cielo'); }
    if (k === 'drum' && NAV) { molí3d('feliz', 'saltar');                     // 🥁🦌 Molí toca el tambor en su trineo con renos que flotan: ¡PUM! ¡PUM! ¡PUM! y cascabeles
      for (let i = 0; i < 22; i++) { const t0 = i * .3; tono(i % 3 ? 80 : 70, t0, .3, 'sine', i % 3 ? .55 : .85); ruido(t0, .07, 160, i % 3 ? .35 : .55); }
      for (let i = 0; i < 40; i++) { const t0 = i * .17 + (i % 2) * .05; [2637, 3136, 3520].forEach((f, q) => tono(f + (i % 3) * 40, t0 + q * .012, .18, 'triangle', .035)); }
      golpe(6.7); tono(55, 6.7, 1, 'triangle', .5);
      const nieve = Array.from({ length: 34 }, (_, q) => `<i class="an-copo" style="left:${(q * 31) % 100}%;--d:${4 + q % 5}s;--r:${-(q * .7)}s;--s:${.5 + (q % 4) * .25}">❄</i>`).join('');
      const est = Array.from({ length: 36 }, (_, q) => `<b class="an-est" style="left:${(q * 53) % 100}%;top:${(q * 29) % 70}%;--t:${1 + q % 4 * .5}s"></b>`).join('');
      return mostrar(`<div class="an-st an-navi">${est}<i class="an-lunag"></i>${nieve}<div class="an-pum"><b>¡PUM!</b><b>¡PUM!</b><b>¡PUM!</b></div>
        <div class="an-vtr"><div class="an-chisp"></div>${TRINEO(window.moliDibujo ? moliDibujo('salta') : IMG('salta'))}</div><div class="an-bub">🎄 ¡Jo, jo, jo! ¡Atentos!</div></div>`, 7800, 'noche'); }
    if (k === 'drum') { molí3d('feliz', 'saltar'); for (let i = 0; i < 16; i++) golpe(i * .14); golpe(2.6); tono(55, 2.6, 1.2, 'triangle', .5);
      return mostrar(`<div class="an-st an-drum"><img class="an-m bota" src="${IMG('salta')}" alt=""><div class="an-tam">🥁</div><div class="an-pum"><b>¡PUM!</b><b>¡PUM!</b><b>¡PUM!</b></div></div>`, 4600, 'naranja'); }
    if (k === 'angry' && NAV) { molí3d('feliz', 'señalar');            // 🎄⭐ Molí vuela al árbol, prende la estrella y suena «Jingle Bells»
      const JB = [[659,1],[659,1],[659,2],[659,1],[659,1],[659,2],[659,1],[784,1],[523,1.5],[587,.5],[659,4],[698,1],[698,1],[698,1.5],[698,.5],[698,1],[659,1],[659,1],[659,.5],[659,.5],[659,1],[587,1],[587,1],[659,1],[587,2],[784,2]];
      let tt = 2.5; JB.forEach(([f, d]) => { tono(f, tt, d * .2 + .1, 'triangle', .28); tono(f * 2, tt, .12, 'sine', .06); tt += d * .2; });
      tono(1568, 2.3, .5, 'sine', .25); tono(2093, 2.4, .7, 'sine', .2); ruido(2.3, 1.2, 6000, .08);
      for (let i = 0; i < 26; i++) [2637, 3136].forEach((f, q) => tono(f, 2.5 + i * .2 + q * .01, .12, 'triangle', .025));
      const B = [[200,150,'#ef4444'],[160,220,'#3b82f6'],[245,215,'#fbbf24'],[130,300,'#a855f7'],[205,285,'#ef4444'],[275,300,'#22d3ee'],[100,380,'#fbbf24'],[175,370,'#3b82f6'],[250,385,'#ef4444'],[310,375,'#a855f7']];
      const luces = Array.from({ length: 22 }, (_, q) => { const y = 130 + q * 12.5, w = (y - 70) * .62, x = 200 + Math.sin(q * 1.9) * w * .85; return `<circle class="an-foco" cx="${x.toFixed(0)}" cy="${y}" r="6" style="--d:${(q % 5) * .15}s;--c:${['#fde047', '#f87171', '#60a5fa', '#4ade80', '#f0abfc'][q % 5]}"/>`; }).join('');
      const est = Array.from({ length: 30 }, (_, q) => `<b class="an-est" style="left:${(q * 53) % 100}%;top:${(q * 29) % 70}%;--t:${1 + q % 4 * .5}s"></b>`).join('');
      const nieve = Array.from({ length: 26 }, (_, q) => `<i class="an-copo" style="left:${(q * 31) % 100}%;--d:${4 + q % 5}s;--r:${-(q * .7)}s;--s:${.5 + (q % 4) * .25}">❄</i>`).join('');
      mostrar(`<div class="an-st an-arb">${est}${nieve}<div class="an-esc"><svg class="an-tree" viewBox="0 0 400 470" aria-hidden="true">
        <rect x="178" y="420" width="44" height="40" rx="6" fill="#7c4a1e"/><rect x="150" y="440" width="100" height="26" rx="6" fill="#b91c1c"/>
        <path d="M200 70 L330 260 L280 260 L360 420 L40 420 L120 260 L70 260 Z" fill="#15803d" stroke="#14532d" stroke-width="6" stroke-linejoin="round"/>
        <path d="M120 260 Q200 290 280 260 M90 340 Q200 372 310 340" stroke="#fbbf24" stroke-width="5" fill="none" stroke-dasharray="2 12" stroke-linecap="round"/>
        ${B.map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="12" fill="${c}" stroke="#fff" stroke-width="2"/>`).join('')}${luces}
        <g class="an-tope"><circle class="an-halo" cx="200" cy="52" r="56" fill="url(#anHalo)"/><path d="M200 12 L211 42 L243 42 L217 61 L227 92 L200 73 L173 92 L183 61 L157 42 L189 42 Z" fill="#fde047" stroke="#ca8a04" stroke-width="3" stroke-linejoin="round"/></g>
        <defs><radialGradient id="anHalo"><stop offset="0" stop-color="#fff7c2" stop-opacity=".95"/><stop offset="1" stop-color="#fde047" stop-opacity="0"/></radialGradient></defs></svg>
        <div class="an-mvu"><img class="an-m" src="${IMG('estrellas')}" alt=""><i class="an-ests">⭐</i></div></div>
        <div class="an-bub">🎄 ¡Prestamos atención!</div></div>`, 8200, 'noche');
      return setTimeout(() => { const s = capa.querySelector('.an-arb'); s && s.classList.add('luz'); }, 2400); }
    if (k === 'angry') { molí3d('enojado'); helice(6.5); tono(110, .2, .9, 'sawtooth', .14); tono(98, .8, .9, 'sawtooth', .14);   // 😠🚁 Molí enojado en su helicóptero
      return mostrar(`<div class="an-st an-heli"><div class="an-hv">${HELI(IMG('enojado'))}<div class="an-vena">💢</div><div class="an-humo l">💨</div><div class="an-humo r">💨</div>
        <div class="an-soga"></div><div class="an-bub rojo an-colg">¡Prestamos atención!</div></div></div>`, 7000, 'rojo'); }
    if (k === 'acu' && NAV) {                                           // 🤝🎁 acuerdos en Navidad: cada regalo se abre y muestra una norma
      const L = [['✋', 'Levantamos la mano para participar'], ['🤐', 'No conversamos cuando otro habla'], ['🪑', 'Nos quedamos en nuestro sitio'], ['🤝', 'Respetamos a todos']];
      const C = [['#dc2626', '#fde047'], ['#16a34a', '#f87171'], ['#2563eb', '#fde047'], ['#a855f7', '#4ade80']], PASO = 4200;
      molí3d('feliz', 'señalar'); let i = 0;
      const nieve = Array.from({ length: 26 }, (_, q) => `<i class="an-copo" style="left:${(q * 31) % 100}%;--d:${4 + q % 5}s;--r:${-(q * .7)}s;--s:${.5 + (q % 4) * .25}">❄</i>`).join('');
      const regalos = L.map((x, q) => `<div class="an-gift" style="--c:${C[q][0]};--l:${C[q][1]}"><div class="an-gnum">${q + 1}</div><div class="an-gcar"><i>${x[0]}</i><b>${x[1]}</b></div><div class="an-gcaja"></div><div class="an-gtapa"><span class="an-glazo"></span></div></div>`).join('');
      const paso = () => { if (!capa.classList.contains('on')) return; const g = capa.querySelectorAll('.an-gift')[i], x = L[i]; if (!g) return;
        g.classList.add('sacude'); ruido(0, .5, 900, .12); [0, .12, .24, .36].forEach(t0 => tono(180, t0, .08, 'square', .06));
        setTimeout(() => { g.classList.remove('sacude'); g.classList.add('abre'); ruido(0, .12, 2500, .3); [784, 988, 1175, 1568].forEach((f, j) => tono(f, j * .08, .4, 'triangle', .22));
          const n = capa.querySelector('.an-gnorma'); n.style.setProperty('--c', C[i][0]); n.classList.remove('ve'); void n.offsetWidth; n.innerHTML = `<i>${x[0]}</i><b>${x[1]}</b>`; n.classList.add('ve'); i++; if (i < L.length) setTimeout(paso, PASO - 900); }, 900); };
      mostrar(`<div class="an-st an-gifts">${nieve}<h2>🎁 Acuerdos de convivencia</h2><div class="an-gnorma"><i>🎄</i><b>¡Abramos los regalos!</b></div>
        <div class="an-gfila"><img class="an-m flota" src="${IMG('feliz')}" alt="">${regalos}</div></div>`, L.length * PASO + 2400, 'noche');
      return setTimeout(paso, 1000); }
    if (k === 'acu') {                                                  // 🤝🚀 acuerdos en la nave espacial (tipo Orión): todo flota, Molí levanta su letrero
      const L = [['✋', 'Levantamos la mano para participar'], ['🤐', 'No conversamos cuando otro habla'], ['🪑', 'Nos quedamos en nuestro sitio'], ['🤝', 'Respetamos a todos']];
      molí3d('feliz', 'señalar'); espacio(L.length * 4800 / 1000 + 1.5); let i = 0;
      const flot = ['✏️', '📚', '🍎', '🧪', '🔭', '🧃', '📏', '🪐', '🎒', '🖍️'].map((e, q) => `<i class="an-flo" style="left:${(q * 23) % 92}%;top:${(q * 41) % 80}%;--d:${7 + q % 5}s;--r:${q * 37}deg;--x:${(q % 2 ? 1 : -1) * (3 + q % 4)}vw;--y:${(q % 3 - 1) * 4}vh">${e}</i>`).join('');
      const est = Array.from({ length: 40 }, (_, q) => `<b class="an-est" style="left:${(q * 53) % 100}%;top:${(q * 29) % 100}%;--t:${1 + q % 4 * .5}s"></b>`).join('');
      const paso = () => { if (!capa.classList.contains('on')) return; const x = L[i]; tono(988, 0, .12, 'sine', .18); tono(1318, .1, .18, 'sine', .15);
        const c = capa.querySelector('.an-letr'); c.classList.remove('gira'); void c.offsetWidth; c.classList.add('gira');
        setTimeout(() => { c.innerHTML = `<i>${x[0]}</i><b>${x[1]}</b>`; }, 260);
        capa.querySelectorAll('.an-dots i').forEach((d, j) => d.classList.toggle('on', j === i)); i++; if (i < L.length) setTimeout(paso, 4800); };
      mostrar(`<div class="an-st an-orion">${est}<div class="an-pared"><span class="an-vent v1"><i class="an-tierra"></i></span><span class="an-vent v2"><i class="an-luna"></i></span><em class="an-rot">ORIÓN · MOLÍ 🚀</em>
        <div class="an-led">${'<i></i>'.repeat(8)}</div></div>${flot}<h2>🤝 Acuerdos de convivencia</h2>
        <div class="an-grav"><img class="an-m" src="${IMG('feliz')}" alt=""><div class="an-palo"></div><div class="an-letr"></div></div><div class="an-dots">${L.map(() => '<i></i>').join('')}</div></div>`, L.length * 4800 + 1800, 'espacio');
      return setTimeout(paso, 700); }
    if (k === 'rol') {
      const L = [['🎤', 'VOCERO', 'Presenta lo que hizo el equipo'], ['📦', 'AYUDANTE', 'Trae y guarda los materiales'], ['⏳', 'CONTROLADOR DEL TIEMPO', 'Avisa cuánto tiempo queda'], ['✏️', 'DISEÑADOR', 'Escribe y dibuja el trabajo']];
      molí3d('feliz', 'señalar'); let i = 0;
      const paso = () => { if (!capa.classList.contains('on')) return; const x = L[i]; tono(660, 0, .15); tono(880, .12, .2);
        capa.querySelector('.an-sc').innerHTML = `<div class="an-card"><i>${x[0]}</i><b>${x[1]}</b>${x[2] ? `<small>${x[2]}</small>` : ''}</div>`;
        capa.querySelectorAll('.an-dots i').forEach((d, j) => d.classList.toggle('on', j === i)); i++; if (i < L.length) setTimeout(paso, 4200); };
      mostrar(`<div class="an-st an-sq"><img class="an-m flota" src="${IMG(k === 'acu' ? 'feliz' : 'decidida')}" alt=""><h2>${k === 'acu' ? '🤝 Acuerdos de convivencia' : '👥 Roles de trabajo'}</h2><div class="an-sc"></div><div class="an-dots">${L.map(() => '<i></i>').join('')}</div></div>`, L.length * 4200 + 1800, 'azul');
      return setTimeout(paso, 600); }
    if (/^g[1-6]$/.test(k)) { const g = +k[1] - 1, p = puntos(), antes = p[g] || 0; if (R.rol !== 'phone') { p[g] = antes + 1; LS.set(PK, p); } const ahora = p[g], lleno = ahora >= 10;
      molí3d(lleno ? 'estrellas' : 'feliz', 'saltar'); [523, 659, 784].forEach((f, j) => tono(f, j * .1, .25, 'triangle', .3)); if (lleno) [784, 988, 1175, 1568].forEach((f, j) => tono(f, .4 + j * .12, .35, 'triangle', .3));
      mostrar(`<div class="an-st an-gp${lleno ? ' lleno' : ''}" style="--gc:${GC[g]}"><img class="an-m bota" src="${IMG(lleno ? 'estrellas' : 'feliz')}" alt=""><div class="an-mas">+1</div>
        <div class="an-term"><div class="an-tubo"><i style="height:${Math.min(100, ahora * 10)}%"></i></div><span>🏆</span></div><h2>${lleno ? `🏆 ¡El Grupo ${g + 1} llenó el termómetro!` : `¡+1 punto para el Grupo ${g + 1}!`}</h2>
        <div class="an-all">${GC.map((c, j) => `<div style="--c:${c}"><i style="height:${Math.min(100, (p[j] || 0) * 10)}%"></i><b>${p[j] || 0}</b></div>`).join('')}</div>${lleno ? '<div class="an-conf">' + '<i></i>'.repeat(20) + '</div>' : ''}</div>`, lleno ? 7600 : 5400, 'claro');
      return estado(); }
    if (k === 'fin') { const p = puntos(), mx = Math.max(0, ...GC.map((c, j) => p[j] || 0)), gan = GC.map((c, j) => j).filter(j => (p[j] || 0) === mx && mx > 0);
      for (let i = 0; i < 18; i++) golpe(i * .12); setTimeout(() => { [523, 659, 784, 1047].forEach((f, j) => tono(f, j * .15, .5, 'triangle', .35)); ruido(.6, 2.5, 2000, .15); }, 2600);
      molí3d('sorpresa'); setTimeout(() => molí3d(gan.length ? 'estrellas' : 'pensativo', 'girar'), 2700);
      return mostrar(`<div class="an-st an-fin"><div class="an-tel l"></div><div class="an-tel r"></div><div class="an-luz"></div><h2 class="an-quien">¿Quién ganó? 🥁</h2>
        <div class="an-win"><img class="an-m bota" src="${IMG(gan.length ? 'estrellas' : 'pensativa')}" alt="">${gan.length ? `<b>🏆 ${gan.length > 1 ? '¡Empate! ' : ''}${gan.map(j => 'Grupo ' + (j + 1)).join(' y ')}</b><span>${mx} puntos</span>` : '<b>Aún no hay puntos</b>'}
        <div class="an-rk">${GC.map((c, j) => [j, p[j] || 0]).sort((a, b) => b[1] - a[1]).map(([j, v], r) => `<span style="--c:${GC[j]}">${r + 1}.º G${j + 1} · ${v}</span>`).join('')}</div></div>${gan.length ? '<div class="an-conf">' + '<i></i>'.repeat(22) + '</div>' : ''}</div>`, 16000, 'oscuro'); }
  }
  // ---- 👏 palmas: Molí aplaude «palma … palma palma palma palma» y los niños responden «palma palma» (dos veces) ----
  let PAL = null;
  function palmas() {
    if (PAL) PAL.parar();
    const B = [{ t: 0, q: 'm' }, { t: .9, q: 'm' }, { t: 1.14, q: 'm' }, { t: 1.38, q: 'm' }, { t: 1.62, q: 'm' }, { t: 2.35, q: 'n' }, { t: 2.65, q: 'n' }];   // un compás
    const R = 3.6, VUELTAS = 2, golpes = [];
    for (let v = 0; v < VUELTAS; v++) B.forEach(b => golpes.push({ ...b, t: 1.8 + v * R + b.t, v }));
    const fin = 1.8 + VUELTAS * R + .6;
    mostrar(`<div class="an-st an-pal"><div class="pal-mo"><canvas></canvas><img class="an-m bota" src="${IMG('feliz')}" alt="" hidden></div>
      <div class="pal-txt"><b class="pal-q">👏 ¡Aplaudimos con Molí!</b></div>
      <div class="pal-rit">${B.map((b, j) => `${j === 1 ? '<span class="pal-sep"></span>' : j === 5 ? '<span class="pal-sep g"></span>' : ''}<i class="${b.q}" data-j="${j}">👏</i>`).join('')}</div>
      <div class="pal-et"><span class="m">MOLÍ</span><span class="n">¡USTEDES!</span></div></div>`, (fin + 2.4) * 1000, 'naranja');
    const st = capa.querySelector('.an-pal'), cv = st.querySelector('canvas'), x = window.Guion && Guion.tres ? Guion.tres(cv) : null;
    if (!x) { cv.hidden = true; st.querySelector('img').hidden = false; }
    const M = x && x.m, T = [], t0 = performance.now(), q = st.querySelector('.pal-q');
    const en = (s, f) => T.push(setTimeout(f, s * 1000));
    PAL = { parar() { T.forEach(clearTimeout); if (x) x.parar(); if (PAL && PAL.st === st) PAL = null; }, st };
    try { A().resume && A().resume(); } catch (e) {}
    const aplauso = (t, v) => { ruido(t, .05, 1700, v); ruido(t, .03, 3200, v * .6); };   // el «clap» (sin archivos)
    if (M) { M.expr('feliz'); M.accion('saludar'); }
    en(.9, () => { q.textContent = '👀 ¡Miren y escuchen!'; if (M) M.palma(0); });
    golpes.forEach(g => {
      const j = B.findIndex(b => Math.abs(b.t - (g.t - 1.8 - g.v * R)) < 1e-6), el = () => st.querySelector(`.pal-rit i[data-j="${j}"]`);
      if (g.q === 'm') { en(g.t - .07, () => M && M.palma(1)); en(g.t + .06, () => M && M.palma(0)); en(g.t, () => aplauso(0, .7)); }   // el sonido sale junto con el golpe de manos
      en(g.t, () => { const e = el(); if (!e) return; e.classList.remove('on'); void e.offsetWidth; e.classList.add('on'); });
      if (j === 0) en(g.t - .15, () => { q.textContent = g.v ? '🔁 ¡Otra vez!' : '👏 Molí aplaude…'; st.classList.remove('turno'); st.querySelectorAll('.pal-rit i').forEach(i => i.classList.remove('on')); if (M) { M.palma(0); M.expr('feliz'); } });
      if (j === 5) en(g.t - .45, () => { q.textContent = '🙌 ¡Ahora ustedes!'; st.classList.add('turno'); if (M) { M.palma(null); M.expr('estrellas'); M.accion('señalar', 1); } });
    });
    en(fin, () => { q.textContent = '🌟 ¡Muy bien! ¡Estamos atentos!'; st.classList.remove('turno'); st.classList.add('fin'); if (M) { M.palma(null); M.expr('estrellas'); M.accion('saltar'); } [523, 659, 784].forEach((f, k) => tono(f, k * .12, .3, 'triangle', .3)); });
    en(fin + 2.3, () => PAL && PAL.st === st && PAL.parar());
  }
  // ---- sorteo: los nombres giran y se detiene en el elegido ----
  async function sorteo(arg) {
    const [sec, key] = String(arg).split('|'); let E = [];
    try { E = (await Docente.estudiantes()).filter(e => e.section === sec); } catch (e) {}
    const w = E.find(e => e.key === key); if (!w) return;
    molí3d('sorpresa');
    mostrar(`<div class="an-st an-sr"><img class="an-m flota" src="${IMG('curiosa')}" alt=""><h2>🎲 Sorteo · ${MD.espInfo().gn} ${esc(sec)}</h2><div class="an-nom"><span></span></div></div>`, 20000, 'azul');
    const sp = capa.querySelector('.an-nom span'), otros = E.filter(e => e !== w).sort(() => Math.random() - .5).slice(0, 14); let d = 60, i = 0;
    const gira = () => { if (!sp.isConnected) return; if (d < 420) { sp.textContent = (otros.length ? otros[i++ % otros.length] : w).name; tono(500 + Math.random() * 300, 0, .05, 'square', .08); d *= 1.13; setTimeout(gira, d); }
      else { sp.textContent = w.name; capa.querySelector('.an-sr').classList.add('win'); [523, 659, 784, 1047].forEach((f, j) => tono(f, j * .12, .4, 'triangle', .3)); molí3d('estrellas', 'saltar'); } };
    gira();
  }
  // ---- temporizador: arriba, junto a Molí ----
  const tmx = document.createElement('div'); tmx.id = 'tmx'; let tmI = 0;
  function timer(min) { quitarTimer(); if (!tmx.isConnected) document.body.appendChild(tmx); const fin = Date.now() + min * 60000; tmx.className = 'on';
    const tic = () => { const r = Math.max(0, fin - Date.now()), s = Math.ceil(r / 1000); tmx.innerHTML = `<img src="${IMG('decidida')}" alt=""><b>⏱️ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}</b>`; tmx.classList.toggle('warn', s <= 60);
      if (r <= 0) { clearInterval(tmI); tmx.classList.add('end'); tmx.innerHTML = `<img src="${IMG('curiosa')}" alt=""><b>⏰ ¡Tiempo!</b>`; for (let i = 0; i < 6; i++) tono(880, i * .3, .18, 'square', .15); molí3d('sorpresa', 'saltar'); setTimeout(quitarTimer, 15000); } };
    tic(); tmI = setInterval(tic, 500); }
  function quitarTimer() { clearInterval(tmI); tmx.className = ''; tmx.innerHTML = ''; }
  // ---- puntos de los grupos ----
  const PK = 'moli2:grpts';
  const puntos = () => LS.get(PK, [0, 0, 0, 0, 0, 0]);
  const puntosReset = () => LS.set(PK, [0, 0, 0, 0, 0, 0]);

  window.Remoto = { comoLaptop, comoCelular, detener, animar, timer, sorteo, ejecutar, estado: () => ({ ...R }) };
})();
