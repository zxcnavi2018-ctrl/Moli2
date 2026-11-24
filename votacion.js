// ===================================================================
//  🗳️ MOLÍ EN LAS ELECCIONES: suena una fanfarria presidencial (original), Molí entra a la cabina,
//  marca su cédula y la deposita en el ánfora. Con cada voto nos da una idea para votar bien.
//  Votacion.abrir() · Votacion.cerrar() · botón 🗳️ en la barra de la rutina (debajo del «+»)
// ===================================================================
(function () {
  const TIPS = [['👂', 'Conoce a los candidatos', 'Escucha con atención sus propuestas.'],
    ['💡', 'Elige por las ideas', 'No por amistad ni porque alguien es popular.'],
    ['🤔', 'Piensa si se puede cumplir', '¿La propuesta es posible? ¿Ayuda a todos?'],
    ['🤫', 'Tu voto es libre y secreto', 'Nadie puede obligarte ni decirte por quién votar.'],
    ['🤝', 'Respeta el resultado', 'Y a quienes piensan diferente: somos un mismo equipo.']];
  const SUB = { vt_hola: '¡Hola, chicos! ¡Hoy es día de elecciones! Acompáñenme a votar y aprendamos juntos a votar bien.',
    vt_1: 'Primero: conoce a los candidatos y escucha con atención sus propuestas.',
    vt_2: 'Segundo: elige por las ideas, no por amistad ni porque alguien es popular.',
    vt_3: 'Tercero: piensa si esas propuestas se pueden cumplir y si ayudan a todos.',
    vt_4: 'Cuarto: tu voto es libre y secreto. Nadie puede obligarte ni decirte por quién votar.',
    vt_5: 'Quinto: respeta el resultado y a quienes piensan diferente. ¡Todos somos un mismo equipo!',
    vt_fin: '¡Votar es un derecho y una gran responsabilidad! ¡A votar con conciencia!' };
  const DUR = { vt_hola: 5.2, vt_1: 4, vt_2: 4.2, vt_3: 4.1, vt_4: 4.9, vt_5: 4.9, vt_fin: 4.3 };
  const CARA = ['feliz', 'curiosa', 'idea', 'pensativa', 'decidida', 'orgullosa'];
  let V = null, AC = null;
  const ctx = () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); AC.resume && AC.resume(); } catch (e) {} return AC; };
  function papel() {                                                     // «fshh» del papel + «toc» al caer en el ánfora
    const a = ctx(); if (!a) return; const t = a.currentTime, n = a.sampleRate * .35, b = a.createBuffer(1, n, a.sampleRate), x = b.getChannelData(0);
    for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n) * .5;
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = 2500; g.gain.value = .5; s.connect(f).connect(g).connect(a.destination); s.start(t);
    const o = a.createOscillator(), h = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(220, t + .55); o.frequency.exponentialRampToValueAtTime(90, t + .7);
    h.gain.setValueAtTime(0, t + .55); h.gain.linearRampToValueAtTime(.5, t + .56); h.gain.exponentialRampToValueAtTime(.001, t + .8); o.connect(h).connect(a.destination); o.start(t + .55); o.stop(t + .85);
    [1319, 1568].forEach((fq, i) => { const c = a.createOscillator(), k = a.createGain(); c.type = 'triangle'; c.frequency.value = fq; k.gain.setValueAtTime(0, t + .8 + i * .1); k.gain.linearRampToValueAtTime(.12, t + .81 + i * .1); k.gain.exponentialRampToValueAtTime(.001, t + 1.3 + i * .1); c.connect(k).connect(a.destination); c.start(t + .8 + i * .1); c.stop(t + 1.4 + i * .1); });
  }
  function abrir() {
    if (V) return cerrar(); ctx();
    const box = document.createElement('div'); box.id = 'moVoto';
    const est = Array.from({ length: 26 }, (_, q) => `<i class="vo-est" style="left:${(q * 37) % 100}%;top:${(q * 53) % 60}%;--r:${-(q % 9) * .4}s;--s:${.5 + (q % 4) * .25}">★</i>`).join('');
    const ban = Array.from({ length: 22 }, (_, q) => `<i class="${q % 2 ? 'b' : 'r'}"></i>`).join('');
    const conf = Array.from({ length: 60 }, (_, q) => `<i class="vo-cf" style="left:${(q * 41) % 100}%;--c:${['#dc2626', '#fff', '#facc15', '#2563eb'][q % 4]};--d:${2.5 + (q % 5) * .5}s;--r:${-(q % 10) * .3}s;--x:${(q % 7) - 3}vw"></i>`).join('');
    box.innerHTML = `<div class="vo-luz l1"></div><div class="vo-luz l2"></div>${est}<div class="vo-ban">${ban}</div>
      <div class="vo-tit"><span>🗳️ ¡Molí en las elecciones!</span><small>Cómo ejercer un buen voto</small></div>
      <div class="vo-esc"><div class="vo-cab"><div class="vo-cab-t">CABINA<br>DE VOTACIÓN</div><div class="vo-cor"></div></div>
        <div class="vo-anf"><div class="vo-ran"></div><div class="vo-den"></div><div class="vo-emb">🗳️<b>ÁNFORA</b></div></div>
        <div class="vo-mo"><img src="img/moli/hola.webp" alt="Molí"><div class="vo-ced"><b>CÉDULA</b><i></i><i></i><i class="x"></i></div></div>
        <div class="vo-cnt">Votos: <b>0</b></div></div>
      <ol class="vo-tips">${TIPS.map(([i, t, d], k) => `<li style="--i:${k}"><span>${i}</span><div><b>${k + 1}. ${t}</b><small>${d}</small></div></li>`).join('')}</ol>
      <div class="vo-bub"></div><div class="vo-sello">¡YA VOTÉ! ✔</div><div class="vo-cfs">${conf}</div><button type="button" class="vo-x" aria-label="Cerrar">✕</button>`;
    document.body.appendChild(box);
    const q = V = { box, T: [], a: null }, mo = box.querySelector('.vo-mo'), img = mo.querySelector('img'), ced = mo.querySelector('.vo-ced');
    box.querySelector('.vo-x').addEventListener('click', e => { e.stopPropagation(); cerrar(); });
    ['pointerdown', 'pointerup', 'click', 'wheel'].forEach(t => box.addEventListener(t, e => e.stopPropagation()));
    const vivo = () => { if (V !== q) throw 0; }, espera = ms => new Promise(r => q.T.push(setTimeout(r, ms)));
    const sonar = (src, max) => new Promise(res => { const a = new Audio(src); q.a = a; let fin = false; const ok = () => { if (!fin) { fin = true; res(); } };
      a.onended = ok; a.onerror = () => q.T.push(setTimeout(ok, 800)); const p = a.play(); if (p && p.catch) p.catch(() => q.T.push(setTimeout(ok, 800))); q.T.push(setTimeout(ok, max)); });
    const decir = async k => { const bb = box.querySelector('.vo-bub'); bb.textContent = SUB[k]; bb.classList.remove('pop'); void bb.offsetWidth; bb.classList.add('pop'); box.classList.add('habla');
      await sonar('audio/voto/' + k + '.mp3', DUR[k] * 1000 + 4000); box.classList.remove('habla'); await espera(250); };
    const ir = async (cls, ms = 1100) => { mo.className = 'vo-mo ' + cls; await espera(ms); };
    (async () => { try {
      requestAnimationFrame(() => box.classList.add('in'));
      await sonar('audio/voto/fanfarria.mp3', 7000); vivo();
      await ir('en-anf', 900); vivo(); await decir('vt_hola'); vivo();
      for (let i = 0; i < TIPS.length; i++) {
        img.src = 'img/moli/' + CARA[i] + '.webp'; await ir('en-cab', 1200); vivo();
        box.classList.add('cort'); ced.className = 'vo-ced marca'; await espera(1100); vivo(); box.classList.remove('cort');
        await ir('en-anf', 1200); vivo(); ced.className = 'vo-ced cae'; papel(); await espera(800); vivo(); ced.className = 'vo-ced';
        const d = document.createElement('i'); d.className = 'vo-pap'; d.style.setProperty('--k', i); box.querySelector('.vo-den').appendChild(d);
        box.querySelector('.vo-cnt b').textContent = i + 1; box.querySelector('.vo-cnt').classList.remove('pop'); void box.offsetWidth; box.querySelector('.vo-cnt').classList.add('pop');
        box.querySelectorAll('.vo-tips li')[i].classList.add('on'); await decir('vt_' + (i + 1)); vivo();
      }
      img.src = 'img/moli/estrellas.webp'; await ir('centro', 900); vivo(); box.classList.add('fin');
      sonar('audio/voto/final.mp3', 4000); await espera(600); vivo(); await decir('vt_fin');
    } catch (e) {} })();
  }
  function cerrar() { const q = V; if (!q) return; V = null; q.T.forEach(clearTimeout); try { q.a && q.a.pause(); } catch (e) {} q.box.classList.remove('in'); setTimeout(() => q.box.remove(), 400); }
  addEventListener('keydown', e => { if (V && e.key === 'Escape') { e.preventDefault(); cerrar(); } }, true);
  window.Votacion = { abrir, cerrar, activo: () => !!V };
})();
