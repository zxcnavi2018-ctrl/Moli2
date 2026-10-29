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
  // 🏴‍☠️ la capitana Molí: «levanten la vela» (la mano) derecha o izquierda; su voz pirata está en audio/sync/pirata/
  const SUB = { hola: '¡Ahoy, marineros! ¡Soy la capitana Molí! ¡Vamos a sincronizarnos!', der: 'Levanten la vela derecha en…', izq: 'Ahora, la vela izquierda en…', bien: '¡Muy bien, marineros!', rapido: '¡Ahora, más rápido!', d: '¡Derecha!', i: '¡Izquierda!',
    listos: '¡Excelente, tripulación! ¡Ya estamos sincronizados!', expl1: 'Ahora, vamos a responder la pregunta.', expl2: '⛵ Vela izquierda si la respuesta es el barco de la izquierda.', expl3: 'Vela derecha si la respuesta es el barco de la derecha. ⛵',
    lee: '¡Lee la pregunta, marinero, y piensa bien tu respuesta!', arriba1: '¡Velas arriba en…', arriba: '¡Arriba!', correcta: '¡Este es el barco correcto! ¡Muy bien, marineros!' };
  const DUR = { silbato: 1.6, hola: 3.4, der: 1.8, izq: 1.7, n3: 0.6, n2: 0.6, n1: 0.6, bien: 1.3, rapido: 1.3, d: 0.8, i: 0.8, listos: 3, expl1: 2.1, expl2: 3.1, expl3: 3.1, lee: 3.1, arriba1: 1.2, arriba: 0.7, correcta: 2.5, ding: 0.6 };
  const AUD = {}, audio = k => AUD[k] || (AUD[k] = Object.assign(new Audio('audio/sync/' + (/^(silbato|ding)$/.test(k) ? '' : 'pirata/') + k + '.mp3'), { preload: 'auto' }));
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
    : `${nv ? `<p class="sy-nv">${nv === 1 ? '🔥 ¡Más difícil!' : '🔥🔥 ¡La más difícil!'}</p>` : ''}<p class="sy-q">${esc(Q.q)}</p><div class="sy-ops sy-mar"><i class="sy-mundo"><i class="sy-arco"></i><i class="sy-sol"></i></i><div class="sy-op i">${VELA('#2563eb')}<span class="sy-lado">✋ IZQUIERDA</span><b>${esc(Q.i)}</b><i class="sy-roca"></i></div><div class="sy-op d">${VELA('#f97316')}<span class="sy-lado">DERECHA ✋</span><b>${esc(Q.d)}</b><i class="sy-roca"></i></div><i class="sy-olas"></i></div>`;
  // ⛵ cada respuesta es un barco: vela de su color y la respuesta escrita en el casco
  function VELA(c) { return `<svg class="sy-vela" viewBox="0 0 220 130" aria-hidden="true">
    <path d="M150 30 L208 104" stroke="#78350f" stroke-width="4"/><path d="M152 34 L200 98 L152 98 Z" fill="#fff7ed" stroke="#78350f" stroke-width="2"/>
    <line x1="72" y1="34" x2="72" y2="130" stroke="#78350f" stroke-width="6"/><line x1="138" y1="6" x2="138" y2="130" stroke="#78350f" stroke-width="7"/>
    <path d="M44 44 Q72 38 100 44 L104 96 Q72 104 40 96 Z" fill="#fff7ed" stroke="#78350f" stroke-width="2.5"/>
    <path d="M102 24 Q138 16 174 24 L180 70 Q138 78 96 70 Z" fill="${c}" stroke="#78350f" stroke-width="2.5"/>
    <path d="M110 22 L106 72 M126 19 L124 75 M152 19 L152 75 M166 21 L170 72" stroke="#fff" stroke-width="6" opacity=".85"/>
    <path d="M96 78 Q138 72 180 78 L176 112 Q138 118 100 112 Z" fill="#fff7ed" stroke="#78350f" stroke-width="2.5"/>
    <rect x="128" y="10" width="20" height="8" rx="2" fill="#92400e"/>
    <path d="M138 6 L170 10 L138 22 Z" fill="#1f1b16"/><circle cx="150" cy="13" r="4.5" fill="#fff"/><circle cx="148.3" cy="12.5" r="1.2" fill="#2563eb"/><circle cx="151.7" cy="12.5" r="1.2" fill="#2563eb"/>
    <path d="M72 34 L92 38 L72 44 Z" fill="${c}"/></svg>`; }

  // ---- Molí 3D con sus dos banderas (si no hay 3D, su foto con banderitas de CSS) ----
  function tres(cv) {
    const T = window.THREE; if (!T || !window.crearMoli) return null;
    let r; try { r = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch (e) { return null; }
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.setClearColor(0x000000, 0);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 50);
    sc.add(new T.HemisphereLight(0xfffdf8, 0x7f8ba3, 0.75)); const k1 = new T.DirectionalLight(0xfff8ee, 0.85), k2 = new T.DirectionalLight(0x9fd6ff, 0.5); k1.position.set(2.5, 4, 5); k2.position.set(-3, 2, -2); sc.add(k1, k2);
    const m = crearMoli(T, { renderer: r }); sc.add(m.root); m.mirar(new T.Vector3(0, 1.05, 8));
    const HW = !!(window.esHalloween && esHalloween()), flags = {};      // 🎃 en Halloween: banderas naranja y morada con calabazas
    const lienzo = (w, h, dib) => { const c = document.createElement('canvas'); c.width = w; c.height = h; dib(c.getContext('2d'), w, h); return c; };
    const calabaza = (g, cx, cy, r) => { g.fillStyle = '#4d7c0f'; g.fillRect(cx - r * .12, cy - r * 1.15, r * .24, r * .4);
      [-.55, 0, .55].forEach(o => { g.fillStyle = o ? '#ea580c' : '#f97316'; g.beginPath(); g.ellipse(cx + o * r, cy, r * .62, r * .85, 0, 0, 7); g.fill(); });
      g.fillStyle = '#1c1917'; [-1, 1].forEach(e => { g.beginPath(); g.moveTo(cx + e * r * .45, cy - r * .35); g.lineTo(cx + e * r * .2, cy + r * .05); g.lineTo(cx + e * r * .7, cy + r * .05); g.fill(); });
      g.beginPath(); g.moveTo(cx - r * .65, cy + r * .25); for (let k = 0; k <= 6; k++) g.lineTo(cx - r * .65 + k * r * .217, cy + r * (k % 2 ? .38 : .25)); g.lineTo(cx + r * .5, cy + r * .6); g.lineTo(cx - r * .5, cy + r * .6); g.fill(); };
    const estrella = (g, cx, cy, r, col) => { g.fillStyle = col; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r * .45 : r; g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } g.fill(); };
    const telaTex = sx => new T.CanvasTexture(lienzo(256, 168, (g, w, h) => {
      g.fillStyle = HW ? (sx < 0 ? '#6d28d9' : '#f97316') : (sx < 0 ? COL.i : COL.d); g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(0, 0, w, 12); g.fillRect(0, h - 12, w, 12);
      if (!HW) return estrella(g, w / 2, h / 2, 52, '#fff');
      if (sx < 0) calabaza(g, w / 2, h / 2 + 8, 50); else { g.fillStyle = '#1c1917'; [-1, 1].forEach(e => { g.beginPath(); g.moveTo(w / 2 + e * 52, 40); g.lineTo(w / 2 + e * 22, 86); g.lineTo(w / 2 + e * 82, 86); g.fill(); });
        g.beginPath(); g.moveTo(60, 104); for (let k = 0; k <= 8; k++) g.lineTo(60 + k * 17, k % 2 ? 122 : 104); g.lineTo(190, 140); g.lineTo(66, 140); g.fill(); } }));
    [-1, 1].forEach(sx => {                                             // palito + tela que flamea; sale de la manito hacia afuera cuando el brazo sube
      const g = new T.Group();
      const palo = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 0.78, 10), new T.MeshStandardMaterial({ color: HW ? 0x3f2a14 : 0xf1e7d0, roughness: 0.6 })); palo.position.y = -0.27; g.add(palo);
      if (HW) { const cal = new T.Mesh(new T.SphereGeometry(0.055, 16, 12), new T.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45 })); cal.scale.set(1, 0.8, 1); cal.position.y = -0.68; g.add(cal);
        const tallo = new T.Mesh(new T.CylinderGeometry(0.008, 0.012, 0.035, 8), new T.MeshStandardMaterial({ color: 0x4d7c0f })); tallo.position.y = -0.73; g.add(tallo); }
      else { const bola = new T.Mesh(new T.SphereGeometry(0.03, 12, 10), new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })); bola.position.y = -0.67; g.add(bola); }
      const geo = new T.PlaneGeometry(0.46, 0.3, 18, 6); geo.translate(-0.23 * sx, 0, 0);
      const tela = new T.Mesh(geo, new T.MeshStandardMaterial({ map: telaTex(sx), roughness: 0.55, side: T.DoubleSide })); tela.position.set(-0.012 * sx, -0.5, 0); g.add(tela);
      m.manos[sx].add(g); flags[sx] = { g, geo, tela, base: geo.attributes.position.array.slice(), amp: 0.35, up: false, sw: 0 };
    });
    // chispitas al levantar la bandera: estrellas (o murciélagos y caramelos en Halloween)
    const spr = dib => new T.SpriteMaterial({ map: new T.CanvasTexture(lienzo(64, 64, dib)), transparent: true, depthWrite: false });
    const MATS = HW ? [spr(g => { g.fillStyle = '#1f1235'; g.beginPath(); g.moveTo(32, 26); g.quadraticCurveTo(20, 8, 2, 18); g.quadraticCurveTo(10, 26, 8, 36); g.quadraticCurveTo(18, 30, 22, 40); g.quadraticCurveTo(28, 34, 32, 44); g.quadraticCurveTo(36, 34, 42, 40); g.quadraticCurveTo(46, 30, 56, 36); g.quadraticCurveTo(54, 26, 62, 18); g.quadraticCurveTo(44, 8, 32, 26); g.fill(); g.beginPath(); g.arc(32, 30, 7, 0, 7); g.fill(); }),
        spr(g => { g.fillStyle = '#f97316'; g.beginPath(); g.ellipse(32, 32, 14, 10, 0, 0, 7); g.fill(); g.fillStyle = '#facc15'; [[10, 32, 18, 24, 18, 40], [54, 32, 46, 24, 46, 40]].forEach(([a, b, c, d, e, h]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.lineTo(e, h); g.fill(); }); })]
      : [spr(g => estrella(g, 32, 32, 28, '#facc15')), spr(g => estrella(g, 32, 32, 22, '#fff'))];
    const parts = [], pw = new T.Vector3();
    const chispas = F => { F.tela.getWorldPosition(pw); for (let k = 0; k < 8; k++) { const s = new T.Sprite(MATS[k % 2].clone()); s.position.copy(pw); s.scale.setScalar(HW ? 0.24 : 0.14); sc.add(s);
      parts.push({ s, v: new T.Vector3((Math.random() - 0.5) * 1.4, 0.7 + Math.random() * 0.9, Math.random() * 0.5), t: 0 }); } };
    if (m.head) {                                                       // 🏴‍☠️ sombrero pirata y parche en el ojo
      const top = HW ? 0.6 : 0.47, fz = HW ? 0.74 : 0.56, NEG = new T.MeshStandardMaterial({ color: 0x1f1b16, roughness: 0.7 }), ORO = new T.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.3 });
      const som = new T.Group(); som.position.set(0, top, -0.02); som.rotation.set(-0.12, 0, 0.1); m.head.add(som);
      const ala = new T.Mesh(new T.CylinderGeometry(0.66, 0.66, 0.04, 40), NEG); ala.scale.set(1, 1, 0.78); som.add(ala);
      [-1, 1].forEach(l => { const p = new T.Mesh(new T.SphereGeometry(0.2, 16, 10), NEG); p.scale.set(1.1, 0.5, 0.9); p.position.set(l * 0.52, 0.06, 0); som.add(p); });   // las puntas levantadas
      const copa = new T.Mesh(new T.SphereGeometry(0.4, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), NEG); copa.scale.set(1, 0.75, 0.9); som.add(copa);
      const cinta = new T.Mesh(new T.TorusGeometry(0.39, 0.03, 8, 40), ORO); cinta.rotation.x = Math.PI / 2; cinta.scale.set(1, 0.9, 1); cinta.position.y = 0.04; som.add(cinta);
      const em = new T.Mesh(new T.CircleGeometry(0.09, 24), new T.MeshStandardMaterial({ color: 0xffffff })); em.position.set(0, 0.17, 0.355); em.rotation.x = -0.35; som.add(em);
      [-1, 1].forEach(l => { const o = new T.Mesh(new T.CircleGeometry(0.022, 12), new T.MeshBasicMaterial({ color: 0x1d4ed8 })); o.position.set(l * 0.035, 0.18, 0.362); o.rotation.x = -0.35; som.add(o); });
      const par = new T.Mesh(new T.CircleGeometry(0.15, 28), NEG); par.scale.set(1, 1.15, 1); par.position.set(-0.225, -0.04, fz); m.head.add(par);   // parche en el ojo derecho de Molí
      if (!HW) { const tira = new T.Mesh(new T.TorusGeometry(0.6, 0.014, 6, 60), NEG); tira.rotation.set(0, 0, 0.55); tira.scale.set(1, 1, 0.9); tira.position.y = 0.05; m.head.add(tira); }   // con la calabaza, el parche va pegado
    }
    const brazo0 = m.brazo.bind(m);
    m.brazo = (l, on) => { brazo0(l, on); const F = flags[l > 0 ? 1 : -1]; if (!F) return; if (on && !F.up) { F.sw = 1; setTimeout(() => chispas(F), 180); } F.up = !!on; };
    let raf = 0, t0 = performance.now() / 1000, last = t0, w = 0, h = 0;
    const tick = () => { raf = requestAnimationFrame(tick); const now = performance.now() / 1000, dt = now - last; last = now;
      const W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return; if (W !== w || H !== h) { w = W; h = H; r.setSize(W, H, false); cam.aspect = W / H; const f = Math.max(1, 0.62 / cam.aspect); cam.position.set(0, 1.12, 5.4 * f); cam.lookAt(0, 1.12, 0); cam.updateProjectionMatrix(); }
      m.update(now - t0, dt);
      [-1, 1].forEach(sx => { const F = flags[sx], p = F.geo.attributes.position, fr = F.up ? 12 : 7;     // la tela flamea más fuerte cuando la bandera está arriba
        F.amp += ((F.up ? 1 : 0.35) - F.amp) * Math.min(1, dt * 4); F.sw *= Math.pow(0.03, dt);
        for (let i = 0; i < p.count; i++) { const x = F.base[i * 3], y = F.base[i * 3 + 1], k = Math.abs(x) / 0.46;
          p.setZ(i, (Math.sin(now * fr - k * 6 + y * 4) * 0.075 + Math.sin(now * 19 - k * 11) * 0.012) * k * F.amp); p.setY(i, y + Math.sin(now * fr * 0.8 - k * 5) * 0.018 * k * F.amp); }
        p.needsUpdate = true; F.geo.computeVertexNormals(); F.g.rotation.x = Math.sin(now * 24) * 0.4 * F.sw; });
      for (let k = parts.length - 1; k >= 0; k--) { const q = parts[k]; q.t += dt; q.v.y -= 1.6 * dt; q.s.position.addScaledVector(q.v, dt); q.s.material.rotation += dt * 3; q.s.material.opacity = Math.max(0, 1 - q.t / 1.2);
        if (q.t > 1.2) { sc.remove(q.s); q.s.material.dispose(); parts.splice(k, 1); } }
      r.render(sc, cam); };
    tick();
    return { m, parar() { cancelAnimationFrame(raf); try { r.dispose(); r.forceContextLoss(); } catch (e) {} } };
  }
  const Molí2D = el => ({ expr() {}, accion() {}, hablar(on) { el.classList.toggle('habla', !!on); }, brazo(l, on) { el.classList.toggle(l > 0 ? 'upd' : 'upi', !!on); } });

  // ---- hablar, esperar y la línea de tiempo ----
  const espera = ms => new Promise(res => { const t = setTimeout(res, ms); S && S.T.push(t); });
  function decir(k, sub = true) {
    return new Promise(res => { if (!S) return res(); const s = S, a = audio(k), t0 = Date.now(); let fin = false;
      const listo = () => { if (fin) return; const falta = DUR[k] * 900 - (Date.now() - t0); if (falta > 40) { s.T.push(setTimeout(listo, falta)); return; } fin = true; a.onended = a.onerror = null; if (s.M && k !== 'silbato' && k !== 'ding') s.M.hablar(false); bajito(false); res(); };
      if (sub && SUB[k]) burbuja(SUB[k]); if (s.M && k !== 'silbato' && k !== 'ding') s.M.hablar(true); if (k !== 'silbato' && k !== 'ding') bajito(true);
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
        const ops = el.querySelector('.sy-ops'); el.querySelectorAll('.sy-op').forEach(o => o.classList.add(o.classList.contains(Q && Q.ok === 'd' ? 'd' : 'i') ? 'ok' : 'no'));
        ops.classList.add('rev', lado > 0 ? 'gana-d' : 'gana-i'); sonido('choque', 0.55); sonido('magia', 0.2); chispas(ops.querySelector('.sy-op.ok'));
        M.expr('estrellas'); M.accion('saltar'); await espera(500); ok(); await decir('correcta'); ok(); await espera(1200); ok(); M.expr('feliz'); }
    } catch (e) {}
  }
  // 🔊 efectos del barco: «¡crash!» del que choca y campanitas mágicas del que llega al mundo brillante
  let AC = null;
  function sonido(tipo, retraso = 0) { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const c = AC, t = c.currentTime + retraso;
    if (tipo === 'choque') { const n = c.createBufferSource(), b = c.createBuffer(1, c.sampleRate * 0.6, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.5);
      const f = c.createBiquadFilter(), g = c.createGain(); f.type = 'lowpass'; f.frequency.value = 900; g.gain.value = 0.5; n.buffer = b; n.connect(f); f.connect(g); g.connect(c.destination); n.start(t);
      const o = c.createOscillator(), og = c.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.4); og.gain.setValueAtTime(0.4, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.45); o.connect(og); og.connect(c.destination); o.start(t); o.stop(t + 0.5); }
    else [1047, 1319, 1568, 2093, 2637].forEach((fr, k) => { const o = c.createOscillator(), g = c.createGain(), tt = t + k * 0.1; o.type = 'sine'; o.frequency.value = fr; g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.07, tt + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.8); o.connect(g); g.connect(c.destination); o.start(tt); o.stop(tt + 0.85); });
  } catch (e) {} }
  function chispas(op) { if (!op) return; for (let k = 0; k < 16; k++) { const i = document.createElement('i'); i.className = 'sy-chis'; i.textContent = ['✨', '⭐', '🌟', '💫'][k % 4];
    i.style.left = (10 + Math.random() * 80) + '%'; i.style.top = (Math.random() * 60) + '%'; i.style.animationDelay = (0.3 + Math.random() * 1.2) + 's'; op.appendChild(i); } }
  // 🎶 canción pirata suave de fondo (6/8, compuesta aquí): melodía de punteo, bajo y pandereta; baja cuando Molí habla
  const MEL = [[62,2],[65,1],[69,2],[69,1],[67,2],[65,1],[64,3],[64,2],[67,1],[70,2],[69,1],[65,3],[62,3],[62,2],[65,1],[69,2],[72,1],[70,2],[69,1],[67,3],[65,2],[64,1],[62,3],[0,3]];
  const BAJO = [38, 38, 45, 45, 43, 45, 38, 38];
  let MUS = null;
  function musica(on) { try {
    if (!on) { if (MUS) { clearInterval(MUS.iv); MUS.g.gain.setTargetAtTime(0, MUS.c.currentTime, 0.3); MUS = null; } return; }
    if (MUS) return; AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const c = AC; if (c.state === 'suspended') c.resume();
    const g = c.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(0.05, c.currentTime, 0.8); g.connect(c.destination);
    const paso = 0.2, hz = n => 440 * Math.pow(2, (n - 69) / 12); let t = c.currentTime + 0.1, mi = 0, ma = 0, pulso = 0;
    const nota = (f, t0, dur, tipo, vol) => { const o = c.createOscillator(), e = c.createGain(); o.type = tipo; o.frequency.value = f; e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(vol, t0 + 0.015); e.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(e); e.connect(g); o.start(t0); o.stop(t0 + dur + 0.05); };
    const ruido = t0 => { const b = c.createBuffer(1, c.sampleRate * 0.08, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); const n = c.createBufferSource(), f = c.createBiquadFilter(), e = c.createGain(); f.type = 'highpass'; f.frequency.value = 5000; e.gain.value = 0.25; n.buffer = b; n.connect(f); f.connect(e); e.connect(g); n.start(t0); };
    const prog = () => { while (t < c.currentTime + 0.6) {                     // cada «pulso» es una corchea (6 por compás)
        if (ma <= 0) { const [n, d] = MEL[mi % MEL.length]; if (n) { nota(hz(n), t, d * paso * 1.1, 'triangle', 0.5); nota(hz(n + 12), t, d * paso * 0.5, 'sine', 0.08); } ma = d; mi++; }
        if (pulso % 3 === 0) nota(hz(BAJO[Math.floor(pulso / 6) % BAJO.length]), t, paso * 2.6, 'sine', 0.45);
        if (pulso % 6 === 3) ruido(t);
        ma--; pulso++; t += paso; } };
    prog(); MUS = { c, g, iv: setInterval(prog, 200) };
  } catch (e) {} }
  const bajito = on => { if (MUS) MUS.g.gain.setTargetAtTime(on ? 0.022 : 0.05, MUS.c.currentTime, 0.15); };
  function cortar() { if (!S) return; S.T.forEach(clearTimeout); S.T = []; if (S.a) { try { S.a.pause(); } catch (e) {} } }

  function montar(el, Q) {
    parar();
    const cv = el.querySelector('canvas'), mo = el.querySelector('.sy-mo'), x = tres(cv);
    if (!x) { cv.hidden = true; el.querySelector('.sy-img').hidden = false; mo.classList.add('d2'); }
    S = { el, Q, f: 0, g: 0, T: [], a: null, x, M: x ? x.m : Molí2D(mo) };
    el.addEventListener('click', e => { if (e.target.closest('[data-sync]')) { e.stopPropagation(); avanzar(); } else if (e.target.closest('[data-syrep]')) { e.stopPropagation(); repetir(); } });
    Object.keys(DUR).forEach(audio);                                   // que no se trabe la primera vez
    musica(true);
    const g = ++S.g; setTimeout(() => S && S.g === g && intro(g), 500);
  }
  function repetir() { if (!S) return; S.k = 0; const { el, Q } = S; el.classList.remove('izq'); const p = el.querySelector('.sy-pre'); p.hidden = true; p.classList.remove('in'); p.innerHTML = preHtml(Q);
    cortar(); bandera(1, false); bandera(-1, false); S.f = 0; fase(0); el.classList.remove('izq'); const g = ++S.g; intro(g); }
  function avanzar() { if (S && (S.f < 4 || hayMas())) paso(); }
  function actualizar(Q) { if (!S) return; S.Q = Q; if (!S.k && S.f < 4) { const p = S.el.querySelector('.sy-pre'); p.innerHTML = preHtml(Q); } }
  function parar() { musica(false); if (!S) return; cortar(); S.g++; if (S.x) S.x.parar(); S = null; }
  // ⌨️ la tecla A (sin escribir en un cuadro de texto) hace el siguiente paso
  addEventListener('keydown', e => { if (!S || e.repeat || e.ctrlKey || e.metaKey || e.altKey || (e.key || '').toLowerCase() !== 'a' || /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '') || (e.target && e.target.isContentEditable)) return;
    if (!document.body.contains(S.el)) return parar(); e.preventDefault(); e.stopPropagation(); avanzar(); }, true);
  window.Sincro = { html, montar, avanzar, actualizar, parar, activo: () => !!S && document.body.contains(S.el) };
})();
