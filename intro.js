// ✨ Portada mágica de la sesión · Molí aparece, el nombre de la sesión sale letra por letra con brillitos, Molí lo lee con su voz
//  (las palabras se iluminan mientras habla), luego el título sube, se deshace en chispas y queda la portada normal.
//  Intro.play(contenedor, { n, titulo }, alTerminar) · Intro.parar() · voz: audio/ses/<n>-<huella del título>.mp3
(() => {
  const css = document.createElement('style');
  css.textContent = `
  .in-capa { position: absolute; inset: 0; z-index: 2; overflow: hidden; pointer-events: none; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(ellipse at 50% 45%, #5b21b6, #1e1b4b); animation: inFondo .6s ease-out both; }
  .in-capa.fuera { animation: inFuera .9s ease-in forwards; }
  .in-est { position: absolute; border-radius: 50%; background: #fff; animation: inTitila 1.6s ease-in-out infinite alternate; }
  .in-moli { position: absolute; left: 1%; bottom: 0; width: 19em; animation: inMoli .9s cubic-bezier(.3,1.6,.5,1) both; filter: drop-shadow(0 0 .8em rgba(250,204,21,.6)); }
  .in-moli.habla { animation: inMoli .9s cubic-bezier(.3,1.6,.5,1) both, inHabla .45s ease-in-out .9s infinite alternate; }
  .in-capa.fuera .in-moli { animation: inMoliSale .8s ease-in forwards; }
  .in-txt { position: relative; max-width: 72%; margin-left: 12%; text-align: center; color: #fff; }
  .in-ses { display: inline-block; font: 900 1.6em "Baloo 2", system-ui, sans-serif; color: #fde68a; letter-spacing: .1em; padding: .1em .8em; border: .1em solid rgba(253,230,138,.6); border-radius: 99em; margin-bottom: .4em; opacity: 0; animation: inPop .6s cubic-bezier(.3,1.6,.5,1) .5s forwards; }
  .in-tit { font: 900 3.4em/1.15 "Baloo 2", system-ui, sans-serif; text-shadow: 0 0 .4em rgba(250,204,21,.55); }
  .in-tit .w { display: inline-block; white-space: nowrap; transition: color .25s, transform .25s, text-shadow .25s; }
  .in-tit .w.lee { color: #fde047; transform: translateY(-.08em) scale(1.08); text-shadow: 0 0 .5em #facc15, 0 0 1.2em #f59e0b; }
  .in-tit .l { display: inline-block; opacity: 0; filter: blur(.25em); transform: translateY(.4em) scale(.6); animation: inLetra .5s cubic-bezier(.3,1.5,.5,1) forwards; }
  .in-tit.sube { animation: inSube 1s ease-in forwards; }
  .in-tit.sube .l { animation: inVuela 1s ease-in forwards; }
  .in-chis { position: absolute; font-size: 1.4em; pointer-events: none; animation: inChis 1.1s ease-out forwards; }
  .in-varita { position: absolute; top: 50%; left: 18%; width: 4em; height: 4em; margin-top: -2em; border-radius: 50%; background: radial-gradient(circle, #fff, rgba(253,224,71,.8) 30%, rgba(253,224,71,0) 70%); animation: inVarita 1.8s ease-in-out .3s forwards; opacity: 0; }
  @keyframes inFondo { from { opacity: 0; } to { opacity: 1; } }
  @keyframes inFuera { to { opacity: 0; } }
  @keyframes inTitila { from { opacity: .15; transform: scale(.6); } to { opacity: .9; transform: scale(1.1); } }
  @keyframes inMoli { from { opacity: 0; transform: translateY(60%) scale(.4) rotate(-12deg); } to { opacity: 1; transform: none; } }
  @keyframes inHabla { from { transform: translateY(0) rotate(-2deg); } to { transform: translateY(-.25em) rotate(2deg); } }
  @keyframes inMoliSale { to { opacity: 0; transform: translateX(-60%) scale(.5) rotate(-20deg); } }
  @keyframes inPop { from { opacity: 0; transform: scale(.3); } to { opacity: 1; transform: none; } }
  @keyframes inLetra { to { opacity: 1; filter: none; transform: none; } }
  @keyframes inSube { to { transform: translateY(-40%) scale(1.15); } }
  @keyframes inVuela { to { opacity: 0; filter: blur(.2em); transform: translate(var(--dx), var(--dy)) rotate(var(--r)) scale(.2); } }
  @keyframes inChis { from { opacity: 1; transform: translate(0, 0) scale(.4); } to { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1.3) rotate(160deg); } }
  @keyframes inVarita { 0% { opacity: 0; left: 18%; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; left: 88%; } }`;
  document.head.appendChild(css);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const huella = t => { let h = 5381; t = String(t || '').trim(); for (let i = 0; i < t.length; i++) h = 33 * h + t.charCodeAt(i) | 0; return (h >>> 0).toString(36); };
  const dibujo = n => window.moliDibujo ? moliDibujo(n) : 'img/moli/' + n + '.webp';
  let ctx = null;
  function tintin() {                                                   // ✨ campanitas mágicas al aparecer el título
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); const t0 = ctx.currentTime;
      [1318, 1568, 1976, 2637, 2093].forEach((f, k) => { const t = t0 + k * 0.09, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.75); });
    } catch (e) {}
  }
  let A = null;
  function parar() { if (!A) return; A.T.forEach(clearTimeout); try { A.au.pause(); } catch (e) {} A.capa.remove(); A = null; }
  function play(host, { n, titulo }, alFin) {
    parar(); if (!host || !titulo) return alFin && alFin();
    const capa = document.createElement('div'); capa.className = 'in-capa';
    const est = Array.from({ length: 26 }, () => `<i class="in-est" style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${.15 + Math.random() * .3}em;height:${.15 + Math.random() * .3}em;animation-delay:${Math.random() * 1.6}s"></i>`).join('');
    let k = 0; const palabras = String(titulo).split(/\s+/).filter(Boolean);
    const tit = palabras.map(w => `<span class="w">${[...w].map(ch => `<span class="l" style="animation-delay:${(0.9 + (k++) * 0.035).toFixed(3)}s">${esc(ch)}</span>`).join('')}</span>`).join(' ');
    capa.innerHTML = `${est}<i class="in-varita"></i><img class="in-moli" src="${dibujo('idea')}" alt=""><div class="in-txt"><div class="in-ses">✨ SESIÓN ${esc(n)} ✨</div><div class="in-tit">${tit}</div></div>`;
    host.appendChild(capa);
    const au = new Audio(`audio/ses/${n}-${huella(titulo)}.mp3`), T = [], img = capa.querySelector('.in-moli'), W = [...capa.querySelectorAll('.w')];
    A = { capa, au, T }; const yo = A;
    const vivo = () => A === yo, t = (ms, f) => T.push(setTimeout(() => vivo() && f(), ms));
    const fin = () => {                                                 // el título sube y se deshace en chispas
      if (!vivo() || yo.fin) return; yo.fin = 1; W.forEach(w => w.classList.remove('lee')); const tt = capa.querySelector('.in-tit'); tt.classList.add('sube');
      capa.querySelectorAll('.l').forEach(l => { l.style.setProperty('--dx', (Math.random() - .5) * 26 + 'em'); l.style.setProperty('--dy', -(4 + Math.random() * 14) + 'em'); l.style.setProperty('--r', (Math.random() - .5) * 720 + 'deg'); });
      const R = tt.getBoundingClientRect(), C = capa.getBoundingClientRect();
      for (let q = 0; q < 18; q++) { const s = document.createElement('i'); s.className = 'in-chis'; s.textContent = ['✨', '⭐', '💫', '🌟'][q % 4];
        s.style.left = (R.left - C.left + Math.random() * R.width) + 'px'; s.style.top = (R.top - C.top + Math.random() * R.height) + 'px';
        s.style.setProperty('--dx', (Math.random() - .5) * 18 + 'em'); s.style.setProperty('--dy', -(3 + Math.random() * 9) + 'em'); s.style.animationDelay = Math.random() * 0.4 + 's'; capa.appendChild(s); }
      tintin(); img.src = dibujo('genial');
      t(900, () => capa.classList.add('fuera')); t(1800, () => { parar(); alFin && alFin(); });
    };
    t(300, tintin);
    const nL = k, tLetras = 900 + nL * 35 + 400;
    t(tLetras, () => {                                                  // Molí lee: las palabras se iluminan al ritmo de su voz
      img.classList.add('habla'); img.src = dibujo('hola');
      let dur = 0, i = 0; const marca = () => { W.forEach((w, j) => w.classList.toggle('lee', j === i)); };
      const avanzar = () => { if (!vivo()) return; marca(); i++; if (i <= W.length) t(Math.max(220, dur * 1000 / (W.length + 1)), avanzar); };
      const sinVoz = () => { if (yo.sv) return; yo.sv = 1; dur = Math.max(2, W.length * 0.45); avanzar(); t(dur * 1000 + 500, () => { img.classList.remove('habla'); fin(); }); };
      au.onloadedmetadata = () => { if (!vivo()) return; dur = au.duration || 0; };
      au.onended = () => { img.classList.remove('habla'); t(400, fin); };
      au.onerror = () => vivo() && !dur && sinVoz();
      const p = au.play(); if (p && p.then) p.then(() => { t(50, () => { dur = au.duration || W.length * 0.45; avanzar(); }); }).catch(() => vivo() && sinVoz());
      t(15000, () => fin());                                             // por si el audio nunca termina
    });
  }
  window.Intro = { play, parar, huella };
})();
