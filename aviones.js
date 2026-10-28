// ✈️ Aviones de Molí · efectos que pasan por encima de algunas diapositivas de «Mi presentación» (no tapan nada por mucho tiempo:
//  cruzan la pantalla en unos segundos y se van). Llevan su sonido de motor hecho con Web Audio, que va de izquierda a derecha.
//  Aviones.play(tipo, contenedor, { n }) · tipos: ses (despega con Molí de piloto), meta (cartel), acu (cartel), rol (lanza cajas),
//  sync (Molí pide manos arriba), exit (aterriza)
(() => {
  const css = document.createElement('style');
  css.textContent = `
  .av-capa { position: absolute; inset: 0; pointer-events: none; z-index: 2; overflow: hidden; }
  .av-vuelo { position: absolute; left: 0; top: 0; font-size: 1.25em; display: flex; align-items: center; will-change: transform; }
  .av-bob { display: flex; align-items: center; animation: avBob 1.1s ease-in-out infinite alternate; }
  .av-avion { width: 11em; height: 6.1em; flex: none; filter: drop-shadow(0 .35em .4em rgba(0,0,0,.3)); }
  .av-helice { transform-origin: 166px 56px; animation: avHel .09s linear infinite; }
  .av-cartel { display: flex; align-items: center; margin-right: -.3em; }
  .av-cartel b { background: #fff; color: #1e3a8a; font: 900 1.05em "Baloo 2", system-ui, sans-serif; padding: .3em .9em; border: .12em solid #1e3a8a; border-radius: .35em; white-space: nowrap;
    box-shadow: 0 .25em .5em rgba(0,0,0,.25); transform-origin: right center; animation: avOnda .5s ease-in-out infinite alternate; }
  .av-cartel i { display: block; width: 2.2em; border-top: .1em dashed #334155; }
  .av-caja { position: absolute; display: flex; flex-direction: column; align-items: center; font-size: 1.6em; line-height: 1; will-change: transform; }
  .av-caja span:first-child { font-size: 1.1em; } .av-caja span:last-child { margin-top: -.15em; font-size: .9em; background: #fde68a; border: .08em solid #92400e; border-radius: .2em; padding: .05em .12em; }
  .av-nube { position: absolute; width: 2.4em; height: 1em; border-radius: 1em; background: rgba(255,255,255,.85); filter: blur(.05em); animation: avNube 1.6s ease-out forwards; }
  @keyframes avBob { from { transform: translateY(-.25em) rotate(-1.5deg); } to { transform: translateY(.25em) rotate(1.5deg); } }
  @keyframes avHel { from { transform: scaleY(1); } 50% { transform: scaleY(.15); } to { transform: scaleY(1); } }
  @keyframes avOnda { from { transform: skewY(-2deg) scaleX(.98); } to { transform: skewY(2deg) scaleX(1.02); } }
  @keyframes avNube { from { opacity: .9; transform: scale(.4); } to { opacity: 0; transform: scale(1.6) translateX(-1.5em); } }`;
  document.head.appendChild(css);
  const dibujo = n => window.moliDibujo ? moliDibujo(n) : 'img/moli/' + n + '.webp';
  // el avioncito (mira a la derecha): cuerpo amarillo, ala y cola, ventana con Molí de piloto y la hélice que gira
  const avion = (piloto, color = '#facc15') => `<svg class="av-avion" viewBox="0 0 180 100" aria-hidden="true">
    <path d="M30 46 L12 14 Q10 9 16 9 L28 9 Q32 9 35 13 L56 40 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="34" cy="55" rx="18" ry="5" fill="#ef4444" stroke="#7f1d1d" stroke-width="2.2"/>
    <path d="M22 56 Q22 38 52 36 L130 36 Q158 38 160 56 Q158 74 130 76 L52 76 Q22 74 22 56 Z" fill="${color}" stroke="#78350f" stroke-width="3"/>
    <path d="M44 66 Q90 70 150 64" stroke="#f97316" stroke-width="5" fill="none" stroke-linecap="round"/>
    <line x1="80" y1="74" x2="76" y2="88" stroke="#334155" stroke-width="3"/><line x1="122" y1="74" x2="126" y2="88" stroke="#334155" stroke-width="3"/>
    <circle cx="76" cy="90" r="5.5" fill="#1f2937"/><circle cx="126" cy="90" r="5.5" fill="#1f2937"/>
    <ellipse cx="96" cy="62" rx="40" ry="9" fill="#3b82f6" stroke="#1e3a8a" stroke-width="2.5"/>
    <circle cx="112" cy="40" r="19" fill="#bae6fd" stroke="#1e3a8a" stroke-width="3"/>
    <clipPath id="avVen"><circle cx="112" cy="40" r="17"/></clipPath>
    <image href="${dibujo(piloto || 'feliz')}" x="88" y="16" width="48" height="48" clip-path="url(#avVen)"/>
    <path d="M100 30 Q106 24 114 24" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>
    <path d="M158 50 Q166 56 158 62 Z" fill="#475569"/>
    <g class="av-helice"><rect x="163" y="30" width="6" height="52" rx="3" fill="#334155"/></g>
  </svg>`;
  // ---- sonido: motor de hélice que se acerca y se aleja (Doppler) y pasa de un parlante al otro ----
  let ctx = null;
  const ac = () => { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; } catch (e) { return null; } };
  function motor(seg, vol = 0.12, de = -0.9, a = 0.9) {
    const c = ac(); if (!c) return; const t = c.currentTime, f = 82;
    const o1 = c.createOscillator(), o2 = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain(), am = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    const pan = c.createStereoPanner ? c.createStereoPanner() : null;
    o1.type = 'sawtooth'; o2.type = 'square'; lp.type = 'lowpass'; lp.frequency.value = 850;
    o1.frequency.setValueAtTime(f * 1.12, t); o1.frequency.linearRampToValueAtTime(f * 0.9, t + seg);
    o2.frequency.setValueAtTime(f * 2.24, t); o2.frequency.linearRampToValueAtTime(f * 1.8, t + seg);
    lfo.frequency.value = 22; lg.gain.value = 0.35; am.gain.value = 0.65; lfo.connect(lg); lg.connect(am.gain);   // el «tra-tra-tra» de la hélice
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + seg * 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t + seg);
    o1.connect(lp); o2.connect(lp); lp.connect(am); am.connect(g);
    if (pan) { pan.pan.setValueAtTime(de, t); pan.pan.linearRampToValueAtTime(a, t + seg); g.connect(pan); pan.connect(c.destination); } else g.connect(c.destination);
    [o1, o2, lfo].forEach(o => { o.start(t); o.stop(t + seg + 0.05); });
  }
  function silbido(retraso = 0, vol = 0.06) {                          // la cajita que cae: silbido que baja y un «pop» del paracaídas
    const c = ac(); if (!c) return; const t = c.currentTime + retraso, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(500, t + 0.7);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.8);
    const p = c.createOscillator(), pg = c.createGain(); p.type = 'triangle'; p.frequency.setValueAtTime(320, t + 0.75); p.frequency.exponentialRampToValueAtTime(120, t + 0.85);
    pg.gain.setValueAtTime(0.0001, t + 0.74); pg.gain.exponentialRampToValueAtTime(vol * 1.6, t + 0.76); pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    p.connect(pg); pg.connect(c.destination); p.start(t + 0.74); p.stop(t + 0.92);
  }
  function campanita(retraso = 0) {                                     // «¡din-don!» al aterrizar o al mostrar el cartel
    const c = ac(); if (!c) return; [[880, 0], [660, 0.18]].forEach(([f, d]) => { const t = c.currentTime + retraso + d, o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.65); });
  }
  // ---- el vuelo: puntos (x, y en % del cuadro) y cuánto dura; se va solo al terminar ----
  let actual = null;
  function parar() { if (actual) { actual.cancelar(); actual = null; } }
  function volar(host, { html, ruta, seg, giro = [0, 0], escala = 1, alPaso }) {
    const capa = document.createElement('div'); capa.className = 'av-capa';
    const v = document.createElement('div'); v.className = 'av-vuelo'; v.innerHTML = `<div class="av-bob">${html}</div>`; capa.appendChild(v); host.appendChild(capa);
    const W = () => capa.clientWidth, H = () => capa.clientHeight;
    const kf = ruta.map(([x, y], k) => ({ transform: `translate(${x / 100 * (W() + v.offsetWidth) - v.offsetWidth}px, ${y / 100 * H()}px) rotate(${giro[0] + (giro[1] - giro[0]) * k / (ruta.length - 1)}deg) scale(${escala})` }));
    const an = v.animate(kf, { duration: seg * 1000, easing: 'ease-in-out', fill: 'forwards' });
    const T = []; let vivo = true;
    if (alPaso) alPaso.forEach(([t, fn]) => T.push(setTimeout(() => vivo && fn(v, capa), t * 1000)));
    const fin = () => { vivo = false; T.forEach(clearTimeout); try { an.cancel(); } catch (e) {} capa.remove(); };
    an.onfinish = () => { capa.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250 }).onfinish = fin; };
    actual = { cancelar: fin };
  }
  const cartel = t => `<div class="av-cartel"><b>${t}</b><i></i></div>`;
  function caja(capa, v, emo) {                                         // cae una caja con paracaídas desde donde va el avión
    const r = v.getBoundingClientRect(), R = capa.getBoundingClientRect(), x = r.left - R.left + r.width * 0.55, y = r.top - R.top + r.height * 0.7;
    const c = document.createElement('div'); c.className = 'av-caja'; c.innerHTML = `<span>🪂</span><span>${emo}</span>`; capa.appendChild(c);
    c.animate([{ transform: `translate(${x}px, ${y}px) scale(.4)`, opacity: 0 }, { transform: `translate(${x - 8}px, ${y + 30}px) scale(1)`, opacity: 1, offset: 0.15 },
      { transform: `translate(${x + 12}px, ${R.height * 0.45}px) rotate(6deg)`, offset: 0.6 }, { transform: `translate(${x - 6}px, ${R.height * 0.68}px) rotate(-4deg)`, opacity: 1, offset: 0.9 },
      { transform: `translate(${x}px, ${R.height * 0.7}px)`, opacity: 0 }], { duration: 2600, easing: 'ease-out', fill: 'forwards' });
  }
  function nube(capa, v) { const r = v.getBoundingClientRect(), R = capa.getBoundingClientRect(), n = document.createElement('div'); n.className = 'av-nube';
    n.style.left = (r.left - R.left + 6) + 'px'; n.style.top = (r.top - R.top + r.height * 0.45) + 'px'; capa.appendChild(n); setTimeout(() => n.remove(), 1700); }
  function play(tipo, host, o = {}) {
    if (!host || matchMedia('(prefers-reduced-motion: reduce)').matches) return; parar();
    const cruza = (texto, y = 4, seg = 4.2, piloto = 'feliz') => { motor(seg); volar(host, { html: cartel(texto) + avion(piloto), ruta: [[-5, y], [50, y + 2], [105, y]], seg, alPaso: [[seg * 0.45, (v, c) => nube(c, v)]] }); };
    if (tipo === 'ses') { motor(4.6, 0.13, -0.6, 0.9); volar(host, { html: cartel(`🛫 ¡Despegamos! Sesión ${o.n || ''}`) + avion('hola'), ruta: [[-5, 78], [30, 60], [70, 22], [108, 2]], giro: [-4, -14], seg: 4.6,
      alPaso: [[0.6, (v, c) => nube(c, v)], [1.4, (v, c) => nube(c, v)]] }); }
    else if (tipo === 'meta') { cruza('🎯 ¡Nuestra meta de hoy!', 2, 4.2, 'decidida'); campanita(1.6); }
    else if (tipo === 'acu') cruza('✋ ¡Levanta la mano para participar!', 3, 4.6, 'hola');
    else if (tipo === 'sync') { motor(4.4); volar(host, { html: cartel('✋ ¡Levanten la mano!') + avion('salta', '#a7f3d0'), ruta: [[-5, 6], [50, 10], [105, 4]], seg: 4.4 }); }
    else if (tipo === 'rol') { const E = ['🧰', '⭐', '🎨', '⏱️', '🎤']; motor(5); volar(host, { html: cartel('📦 ¡Llegan los roles!') + avion('genial'), ruta: [[-5, 3], [50, 5], [105, 3]], seg: 5,
      alPaso: E.map((e, k) => [1.0 + k * 0.62, (v, c) => { caja(c, v, e); silbido(0); }]) }); }
    else if (tipo === 'exit') { motor(4, 0.12, -0.9, 0.3); campanita(3.9); volar(host, { html: cartel('🛬 ¡Aterrizamos! Exit ticket') + avion('feliz', '#fbcfe8'), ruta: [[-5, 2], [25, 30], [48, 56], [60, 63], [60, 63]], giro: [10, 0], seg: 5 }); }
  }
  window.Aviones = { play, parar };
})();
