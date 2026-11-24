// ===================================================================
//  🗳️ VOTACIONES MOLÍ 2026 · «¡Escogemos a nuestros líderes!»
//  1) Intro tipo «flash electoral» con música original (audio/voto/intro.mp3)
//  2) Molí entra a la cabina, marca su cédula y la deposita en el ánfora
//  3) Set de noticias: Molí reportera, EN VIVO, explica cómo ejercer un voto sano y seguro (voz audio/voto/rp_*.mp3)
//  Votacion.abrir() · Votacion.cerrar() · botón 🗳️ en la barra de la rutina (debajo del «+») · Esc o ✕ cierra
// ===================================================================
(function () {
  const TIPS = [['🚶', 'Fila en orden', 'Esperamos nuestro turno.'], ['🤐', 'Nadie habla', 'Silencio durante la votación.'],
    ['🙈', 'El voto es secreto', 'No miramos ni preguntamos por quién votó otro.'], ['✍️', 'Una sola opción', 'Una ✗ dentro del recuadro y doblamos la cédula.'],
    ['💡', 'Votamos por propuestas', 'Ni por amistad ni por presión.'], ['🤝', 'Respetamos el resultado', '¡Cuando votamos bien, ganamos todos!']];
  const SUB = { rp_hola: '¡Buenos días, Innova! Les habla Molí, en vivo desde el set de Votaciones Molí 2026. ¡Hoy escogemos a nuestros líderes!',
    rp_ya: 'Yo ya voté. Ahora les cuento cómo ejercer un voto sano y seguro.',
    rp_1: 'Primera indicación: hacemos nuestra fila en orden y esperamos nuestro turno.',
    rp_2: 'Segunda: durante la votación nadie habla. Guardamos silencio para que todos piensen con calma.',
    rp_3: 'Tercera: el voto es secreto. No miramos ni preguntamos por quién votó un compañero.',
    rp_4: 'Cuarta: marcamos una sola opción, con una ✗ dentro del recuadro, y doblamos la cédula.',
    rp_5: 'Quinta: votamos por las mejores propuestas, no por amistad ni porque alguien nos presiona.',
    rp_6: 'Y sexta: aceptamos el resultado con respeto. ¡Cuando votamos bien, ganamos todos!',
    rp_fin: '¡Así se vota de forma sana y segura! Les habló Molí, desde Votaciones Molí 2026. ¡Hasta la próxima!' };
  const DUR = { rp_hola: 7.2, rp_ya: 3.5, rp_1: 4.2, rp_2: 5.2, rp_3: 4.6, rp_4: 4.9, rp_5: 5.2, rp_6: 4.8, rp_fin: 6.2 };
  const CARA = ['decidida', 'curiosa', 'pensativa', 'idea', 'feliz', 'orgullosa'];
  const IM = n => 'img/moli/' + n + '.webp';
  let V = null, AC = null;
  const ctx = () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); AC.resume && AC.resume(); } catch (e) {} return AC; };
  function papel() {                                                     // «fshh» del papel + «toc» al caer en el ánfora + campanita
    const a = ctx(); if (!a) return; const t = a.currentTime, n = a.sampleRate * .35, b = a.createBuffer(1, n, a.sampleRate), x = b.getChannelData(0);
    for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n) * .5;
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = 2500; g.gain.value = .5; s.connect(f).connect(g).connect(a.destination); s.start(t);
    const o = a.createOscillator(), h = a.createGain(); o.frequency.setValueAtTime(220, t + .55); o.frequency.exponentialRampToValueAtTime(90, t + .7);
    h.gain.setValueAtTime(0, t + .55); h.gain.linearRampToValueAtTime(.5, t + .56); h.gain.exponentialRampToValueAtTime(.001, t + .8); o.connect(h).connect(a.destination); o.start(t + .55); o.stop(t + .85);
    [1319, 1568, 2093].forEach((fq, i) => { const c = a.createOscillator(), k = a.createGain(); c.type = 'triangle'; c.frequency.value = fq; k.gain.setValueAtTime(0, t + .8 + i * .1); k.gain.linearRampToValueAtTime(.12, t + .81 + i * .1); k.gain.exponentialRampToValueAtTime(.001, t + 1.3 + i * .1); c.connect(k).connect(a.destination); c.start(t + .8 + i * .1); c.stop(t + 1.4 + i * .1); });
  }
  function ding() { const a = ctx(); if (!a) return; const t = a.currentTime; [880, 1175].forEach((fq, i) => { const c = a.createOscillator(), k = a.createGain(); c.type = 'sine'; c.frequency.value = fq; k.gain.setValueAtTime(0, t + i * .12); k.gain.linearRampToValueAtTime(.18, t + i * .12 + .01); k.gain.exponentialRampToValueAtTime(.001, t + i * .12 + .6); c.connect(k).connect(a.destination); c.start(t + i * .12); c.stop(t + i * .12 + .7); }); }
  const edificio = () => {                                               // un edificio de gobierno genérico, iluminado de noche
    const col = Array.from({ length: 10 }, (_, q) => `<rect x="${88 + q * 46}" y="150" width="18" height="150" fill="url(#vcol)"/>`).join('');
    const ven = Array.from({ length: 9 }, (_, q) => `<rect x="${108 + q * 46}" y="180" width="22" height="40" rx="11" fill="#fde68a" opacity=".85"/><rect x="${108 + q * 46}" y="240" width="22" height="40" rx="3" fill="#fbbf24" opacity=".8"/>`).join('');
    return `<svg class="in-edi" viewBox="0 0 640 340" aria-hidden="true"><defs><linearGradient id="vcol" x1="0" x2="1"><stop offset="0" stop-color="#fef3c7"/><stop offset=".5" stop-color="#fde68a"/><stop offset="1" stop-color="#d97706"/></linearGradient>
      <linearGradient id="vfac" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fcd34d"/><stop offset="1" stop-color="#b45309"/></linearGradient></defs>
      <rect x="60" y="140" width="520" height="170" fill="url(#vfac)"/>${ven}${col}<polygon points="60,140 320,60 580,140" fill="#fde68a" stroke="#b45309" stroke-width="4"/>
      <circle cx="320" cy="112" r="20" fill="#fff7ed" stroke="#b45309" stroke-width="3"/><text x="320" y="120" text-anchor="middle" font-size="22">🗳️</text>
      <rect x="40" y="300" width="560" height="22" fill="#92400e"/><rect x="290" y="240" width="60" height="70" rx="30" fill="#78350f"/>
      <line x1="320" y1="60" x2="320" y2="8" stroke="#e5e7eb" stroke-width="3"/><g class="in-ban"><rect x="321" y="8" width="16" height="22" fill="#dc2626"/><rect x="337" y="8" width="16" height="22" fill="#fff"/><rect x="353" y="8" width="16" height="22" fill="#dc2626"/></g></svg>`; };
  function abrir() {
    if (V) return cerrar(); ctx();
    const box = document.createElement('div'); box.id = 'moVoto';
    const est = Array.from({ length: 30 }, (_, q) => `<i class="vo-est" style="left:${(q * 37) % 100}%;top:${(q * 53) % 45}%;--r:${-(q % 9) * .4}s;--s:${.5 + (q % 4) * .25}">★</i>`).join('');
    const ban = Array.from({ length: 22 }, (_, q) => `<i class="${q % 2 ? 'b' : 'r'}"></i>`).join('');
    const conf = Array.from({ length: 60 }, (_, q) => `<i class="vo-cf" style="left:${(q * 41) % 100}%;--c:${['#dc2626', '#fff', '#facc15', '#2563eb'][q % 4]};--d:${2.5 + (q % 5) * .5}s;--r:${-(q % 10) * .3}s;--x:${(q % 7) - 3}vw"></i>`).join('');
    const cara = '<span>ELECCIONES</span><b>2026</b>';
    const tick = TIPS.map(([i, t]) => `${i} ${t}`).join('  ·  ');
    box.innerHTML = `
      <section class="f-intro">${est}<div class="in-luz l1"></div><div class="in-luz l2"></div><div class="in-luz l3"></div>${edificio()}<div class="in-piso"></div>
        <div class="in-cubo"><div class="cu"><i class="f1">${cara}</i><i class="f2">${cara}</i><i class="f3">${cara}</i><i class="f4">${cara}</i><i class="f5"></i></div></div>
        <div class="in-flash">⚡ EDICIÓN ESPECIAL ⚡</div>
        <div class="in-tit"><b>VOTACIONES</b><b class="m">MOLÍ 2026</b></div><div class="in-sub">🗳️ ¡Escogemos a nuestros líderes! 🗳️</div><div class="in-brillo"></div></section>
      <section class="f-voto"><div class="vo-ban">${ban}</div>${est}
        <div class="vo-cab"><div class="vo-cab-t">CABINA<br>DE VOTACIÓN</div><div class="vo-cor"></div></div>
        <div class="vo-anf"><div class="vo-ran"></div><div class="vo-den"></div><div class="vo-emb">🗳️<b>ÁNFORA</b></div></div>
        <div class="vo-mo"><img src="${IM('hola')}" alt="Molí"><div class="vo-ced"><b>CÉDULA</b><i></i><i></i><i class="x"></i></div></div>
        <div class="vo-rec">● REC · Molí vota</div><div class="vo-ya">¡MOLÍ YA VOTÓ! ✔</div></section>
      <section class="f-set"><div class="st-fondo"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="st-logo">📺 MOLÍ <b>NOTICIAS</b></div><div class="st-vivo">● EN VIVO</div><div class="st-hora"></div>
        <div class="st-pant"><div class="sp-cab">🗳️ VOTO SANO Y SEGURO</div><div class="sp-cur"><span></span><b></b><small></small></div>
          <ol class="sp-lis">${TIPS.map(([i, t, d], k) => `<li><span>${i}</span><div><b>${k + 1}. ${t}</b><small>${d}</small></div></li>`).join('')}</ol>
          <div class="sp-dots">${TIPS.map(() => '<i></i>').join('')}</div></div>
        <div class="st-mo"><img src="${IM('hola')}" alt="Molí reportera"><div class="st-mic"><i></i><b>MOLÍ<br>TV</b></div></div>
        <div class="st-mesa"><b>🗳️ VOTACIONES MOLÍ 2026</b></div>
        <div class="st-zoc"><div class="z-tag">VOTACIONES MOLÍ 2026</div><div class="z-txt"></div></div>
        <div class="st-tick"><div><span>🔴 ÚLTIMO MINUTO: ¡Hoy escogemos a nuestros líderes!  ·  ${tick}  ·  </span><span>🔴 ÚLTIMO MINUTO: ¡Hoy escogemos a nuestros líderes!  ·  ${tick}  ·  </span></div></div>
        <div class="vo-sello">VOTO SANO Y SEGURO ✔</div></section>
      <div class="vo-cfs">${conf}</div><div class="vo-wipe"></div><button type="button" class="vo-x" aria-label="Cerrar">✕</button>`;
    document.body.appendChild(box);
    const q = V = { box, T: [], A: [], ck: 0 }, $ = s => box.querySelector(s);
    $('.vo-x').addEventListener('click', e => { e.stopPropagation(); cerrar(); });
    ['pointerdown', 'pointerup', 'click', 'wheel'].forEach(t => box.addEventListener(t, e => e.stopPropagation()));
    const vivo = () => { if (V !== q) throw 0; }, espera = ms => new Promise(r => q.T.push(setTimeout(r, ms)));
    const pista = (src, vol = 1, loop = false) => { const a = new Audio(src); a.volume = vol; a.loop = loop; q.A.push(a); const p = a.play(); if (p && p.catch) p.catch(() => {}); return a; };
    const sonar = (src, max) => new Promise(res => { const a = pista(src); let fin = false; const ok = () => { if (!fin) { fin = true; res(); } };
      a.onended = ok; a.onerror = () => q.T.push(setTimeout(ok, 800)); q.T.push(setTimeout(ok, max)); });
    const fase = async f => { box.classList.add('wipe'); await espera(450); vivo(); box.dataset.f = f; await espera(100); box.classList.remove('wipe'); };
    const hora = () => { const d = new Date(); $('.st-hora').textContent = '🕒 ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }); };
    q.ck = setInterval(hora, 15000); hora();
    const mo = $('.vo-mo'), ced = $('.vo-ced'), smo = $('.st-mo img');
    const decir = async k => { const z = $('.z-txt'); z.textContent = SUB[k]; z.classList.remove('pop'); void z.offsetWidth; z.classList.add('pop'); box.classList.add('habla');
      await sonar('audio/voto/' + k + '.mp3', DUR[k] * 1000 + 4000); box.classList.remove('habla'); await espera(350); };
    (async () => { try {
      box.dataset.f = 'intro'; requestAnimationFrame(() => box.classList.add('in'));
      // 1) ⚡ intro «flash electoral»: la música manda el ritmo (golpe del título a los 3,75 s · final a los 11,25 s)
      const mu = pista('audio/voto/intro.mp3'), t0 = performance.now(), en = s => espera(Math.max(0, s * 1000 - (performance.now() - t0)));
      await en(.2); vivo(); box.classList.add('i1'); await en(3.75); vivo(); box.classList.add('i2'); await en(5.6); vivo(); box.classList.add('i3');
      await en(11.25); vivo(); box.classList.add('i4'); await en(12.6); vivo();
      // 2) 🗳️ Molí vota
      await fase('voto'); const cama = pista('audio/voto/cama.mp3', .0, true); let vol = 0; const sube = setInterval(() => { vol = Math.min(.22, vol + .02); cama.volume = vol; if (vol >= .22) clearInterval(sube); }, 120); q.T.push(sube);
      mo.className = 'vo-mo en-cab'; await espera(1300); vivo(); box.classList.add('cort'); ced.className = 'vo-ced marca'; await espera(1300); vivo(); box.classList.remove('cort');
      mo.className = 'vo-mo en-anf'; await espera(1300); vivo(); ced.className = 'vo-ced cae'; papel(); await espera(800); vivo();
      const d = document.createElement('i'); d.className = 'vo-pap'; $('.vo-den').appendChild(d); $('.vo-mo img').src = IM('estrellas'); box.classList.add('yavoto'); await espera(2200); vivo();
      // 3) 📺 el set de noticias: Molí reportera
      await fase('set'); { const c = $('.sp-cur'); c.querySelector('span').textContent = '🗳️'; c.querySelector('b').textContent = 'Votaciones Molí 2026'; c.querySelector('small').textContent = '¡Hoy escogemos a nuestros líderes!'; c.classList.add('pop'); } await espera(400); vivo(); await decir('rp_hola'); vivo(); smo.src = IM('feliz'); await decir('rp_ya'); vivo();
      for (let i = 0; i < TIPS.length; i++) {
        const [ic, t, ds] = TIPS[i], cur = $('.sp-cur'); cur.querySelector('span').textContent = ic; cur.querySelector('b').textContent = (i + 1) + '. ' + t; cur.querySelector('small').textContent = ds;
        cur.classList.remove('pop'); void cur.offsetWidth; cur.classList.add('pop'); box.querySelectorAll('.sp-dots i')[i].classList.add('on'); box.querySelectorAll('.sp-lis li')[i].classList.add('on');
        smo.src = IM(CARA[i]); ding(); await decir('rp_' + (i + 1)); vivo();
      }
      box.classList.add('lista'); smo.src = IM('estrellas'); box.classList.add('fin'); pista('audio/voto/final.mp3', .9); await espera(500); vivo(); await decir('rp_fin');
    } catch (e) {} })();
  }
  function cerrar() { const q = V; if (!q) return; V = null; q.T.forEach(t => { clearTimeout(t); clearInterval(t); }); clearInterval(q.ck); q.A.forEach(a => { try { a.pause(); } catch (e) {} }); q.box.classList.remove('in'); setTimeout(() => q.box.remove(), 400); }
  addEventListener('keydown', e => { if (V && e.key === 'Escape') { e.preventDefault(); cerrar(); } }, true);
  window.Votacion = { abrir, cerrar, activo: () => !!V };
})();
