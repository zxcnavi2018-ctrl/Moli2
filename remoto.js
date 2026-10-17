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
  function animar(k) {
    try { A().resume && A().resume(); } catch (e) {}
    if (k === 'palmas') return palmas();
    if (k === 'shh') { molí3d('guiño'); [0, 1.4, 2.8].forEach(t => ruido(t, 1.1, 3500, .35));
      return mostrar(`<div class="an-st an-shh"><div class="an-ondas"><i></i><i></i><i></i></div><img class="an-m flota" src="${IMG('decidida')}" alt=""><div class="an-big">🤫 Shhhhh…</div><div class="an-bub">¡Respetamos las normas!</div></div>`, 7000, 'azul'); }
    if (k === 'drum') { molí3d('feliz', 'saltar'); for (let i = 0; i < 16; i++) golpe(i * .14); golpe(2.6); tono(55, 2.6, 1.2, 'triangle', .5);
      return mostrar(`<div class="an-st an-drum"><img class="an-m bota" src="${IMG('salta')}" alt=""><div class="an-tam">🥁</div><div class="an-pum"><b>¡PUM!</b><b>¡PUM!</b><b>¡PUM!</b></div></div>`, 4600, 'naranja'); }
    if (k === 'angry') { molí3d('enojado'); tono(110, 0, .9, 'sawtooth', .18); tono(98, .5, .9, 'sawtooth', .18);
      return mostrar(`<div class="an-st an-angry"><img class="an-m tiembla" src="${IMG('enojado')}" alt=""><div class="an-vena">💢</div><div class="an-humo l">💨</div><div class="an-humo r">💨</div><div class="an-bub rojo">¡Prestamos atención!</div></div>`, 6500, 'rojo'); }
    if (k === 'acu' || k === 'rol') {
      const L = k === 'acu' ? [['✋', 'Levantamos la mano para participar'], ['🤐', 'No conversamos cuando otro habla'], ['🪑', 'Nos quedamos en nuestro sitio'], ['🤝', 'Respetamos a todos']]
        : [['🎤', 'VOCERO', 'Presenta lo que hizo el equipo'], ['📦', 'AYUDANTE', 'Trae y guarda los materiales'], ['⏳', 'CONTROLADOR DEL TIEMPO', 'Avisa cuánto tiempo queda'], ['✏️', 'DISEÑADOR', 'Escribe y dibuja el trabajo']];
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
