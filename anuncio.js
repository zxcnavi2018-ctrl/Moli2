// ===================================================================
//  MOLÍ 2 · 📺 ANUNCIO AL ENTRAR: un video con cuenta regresiva de 15 s; recién entonces sale la ✕.
//  Si se cierra, se cierra; si no, el video sigue hasta el final y se cierra solo. Una vez por visita.
//  Si hay varios, salen uno tras otro (al cerrarse uno, aparece el siguiente).
// ===================================================================
(function () {
  const ANS = [
    { id: 'rc-2026-10', video: 'video/revisores-confiables.mp4', poster: 'video/revisores-confiables.jpg', titulo: 'Estudiantes RC · Revisores Confiables', hasta: '2026-10-18', espera: 15 },
    { id: 'juegos-enf-2026-10', html: `<div class="pz"><i class="gl g1"></i><i class="gl g2"></i><i class="gl g3"></i><i class="gl g4"></i>
  <div class="pz-top"><span class="pz-nuevo">✨ ¡NUEVO EN MOLÍ 2! ✨</span><h2>¡Defiende tu cuerpo!</h2><p>Dos juegos de cartas para vencer a los microbios con tu <b>sistema inmune</b></p></div>
  <div class="pz-cs">
    <div class="pz-c c1"><span class="pz-n">1</span><svg viewBox="0 0 160 130"><g class="bob"><ellipse cx="80" cy="66" rx="42" ry="50" fill="#84cc16" stroke="#1a2e05" stroke-width="5"/><path d="M42 92 q-26 10 -30 30 M118 92 q26 10 30 30" stroke="#65a30d" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="66" cy="58" r="12" fill="#fff" stroke="#1a2e05" stroke-width="4"/><circle cx="94" cy="58" r="12" fill="#fff" stroke="#1a2e05" stroke-width="4"/><circle cx="68" cy="60" r="5" fill="#dc2626"/><circle cx="92" cy="60" r="5" fill="#dc2626"/><path d="M52 42 l22 8 M108 42 l-22 8" stroke="#1a2e05" stroke-width="6" stroke-linecap="round"/><path d="M62 82 q18 12 36 0 q-18 -6 -36 0z" fill="#1a0510"/><path d="M68 82 l4 6 4 -6 M86 82 l4 6 4 -6" fill="#fff"/></g><g class="cartita"><rect x="118" y="18" width="30" height="42" rx="5" fill="#4d7c0f" stroke="#0b1220" stroke-width="3" transform="rotate(14 133 39)"/><text x="133" y="45" font-size="18" text-anchor="middle" transform="rotate(14 133 39)">🦠</text></g></svg>
      <b>ENFERMEDADES</b><em>Duelo inmune</em><small>Vence a <b>Bacterius</b> y a <b>Virax</b> eligiendo la carta de defensa correcta 🛡️</small></div>
    <span class="pz-vs">VS</span>
    <div class="pz-c c2"><span class="pz-n">2</span><svg viewBox="0 0 160 130"><g class="bob b2"><line x1="118" y1="70" x2="134" y2="70" stroke="#3b0764" stroke-width="5"/><circle cx="134" cy="70" r="7" fill="#f0abfc" stroke="#3b0764" stroke-width="3"/><line x1="107" y1="97" x2="118" y2="108" stroke="#3b0764" stroke-width="5"/><circle cx="118" cy="108" r="7" fill="#f0abfc" stroke="#3b0764" stroke-width="3"/><line x1="80" y1="108" x2="80" y2="124" stroke="#3b0764" stroke-width="5"/><circle cx="80" cy="124" r="7" fill="#f0abfc" stroke="#3b0764" stroke-width="3"/><line x1="53" y1="97" x2="42" y2="108" stroke="#3b0764" stroke-width="5"/><circle cx="42" cy="108" r="7" fill="#f0abfc" stroke="#3b0764" stroke-width="3"/><line x1="42" y1="70" x2="26" y2="70" stroke="#3b0764" stroke-width="5"/><circle cx="26" cy="70" r="7" fill="#f0abfc" stroke="#3b0764" stroke-width="3"/><line x1="53" y1="43" x2="42" y2="32" stroke="#3b0764" stroke-width="5"/><circle cx="42" cy="32" r="7" fill="#f0abfc" stroke="#3b0764" stroke-width="3"/><line x1="80" y1="32" x2="80" y2="16" stroke="#3b0764" stroke-width="5"/><circle cx="80" cy="16" r="7" fill="#f0abfc" stroke="#3b0764" stroke-width="3"/><line x1="107" y1="43" x2="118" y2="32" stroke="#3b0764" stroke-width="5"/><circle cx="118" cy="32" r="7" fill="#f0abfc" stroke="#3b0764" stroke-width="3"/><circle cx="80" cy="70" r="38" fill="#a855f7" stroke="#3b0764" stroke-width="5"/><path d="M58 30 l8 -18 9 12 5 -16 5 16 9 -12 8 18z" fill="#facc15" stroke="#854d0e" stroke-width="3"/><circle cx="68" cy="66" r="10" fill="#fff" stroke="#3b0764" stroke-width="4"/><circle cx="92" cy="66" r="10" fill="#fff" stroke="#3b0764" stroke-width="4"/><circle cx="69" cy="67" r="4.5" fill="#facc15"/><circle cx="91" cy="67" r="4.5" fill="#facc15"/><path d="M64 86 q16 12 32 0" stroke="#1e0a2e" stroke-width="5" fill="none" stroke-linecap="round"/></g></svg>
      <b>ENFERMEDADES 2</b><em>Leuco contra el Virus Titán 👑</em><small>El tiempo se pone lento: lee la carta del virus y ¡detén al <b>titán</b>!</small></div>
  </div>
  <div class="pz-pie"><span>📚 Búscalos en la escena <b>🎮 Juegos</b>: discos 1 y 2</span><button type="button" class="pz-ir" data-ir="juegos">🎮 ¡Quiero jugar!</button></div></div>`, titulo: 'Nuevos juegos · Enfermedades 1 y 2', hasta: '2026-12-31', espera: 5, todos: true },
    { id: 'rc-reglas-2026-10', video: 'video/revisores-reglas.mp4', poster: 'video/revisores-reglas.jpg', titulo: 'Revisores Confiables · ¿Cómo revisan?', hasta: '2026-10-18', espera: 10 },
  ];
  if (window.parent !== window) return;                                  // dentro de otra página (iframe) no sale
  const visto = a => { try { return !!sessionStorage.getItem('moli2:anuncio:' + a.id); } catch (e) { return false; } };
  const COLA = ANS.filter(a => new Date() <= new Date(a.hasta + 'T23:59:59') && !visto(a)).sort((a, b) => !!b.todos - !!a.todos);   // pasada la fecha o ya visto, no sale
  let abierto = false;
  const esDocente = () => { try { if (window.MD && MD.esDocente) return MD.esDocente(); const m = JSON.parse(localStorage.getItem('moli2:me') || 'null'); return !!(m && (m.docente || m.teacher)); } catch (e) { return false; } };   // al profe no le salen estos videos

  if (!document.querySelector('link[href*="Bangers"]')) { const f = document.createElement('link'); f.rel = 'stylesheet'; f.href = 'https://fonts.googleapis.com/css2?family=Bangers&display=swap'; document.head.appendChild(f); }
  const css = document.createElement('style');
  css.textContent = `
  #anuncio { position: fixed; inset: 0; z-index: 2147482000; display: grid; place-items: center; padding: 14px; background: rgba(5,12,28,.82); backdrop-filter: blur(3px); opacity: 0; transition: opacity .35s; font-family: "Trebuchet MS", system-ui, sans-serif; }
  #anuncio.on { opacity: 1; }
  #anuncio .ac { position: relative; width: min(1100px, 100%, calc((100vh - 90px) * 16 / 9)); border-radius: 18px; overflow: hidden; background: #000; box-shadow: 0 30px 80px rgba(0,0,0,.6); border: 3px solid #facc15; }
  #anuncio video { display: block; width: 100%; aspect-ratio: 16 / 9; background: #000; }
  #anuncio .tag { position: absolute; left: 12px; top: 12px; padding: 5px 12px; border-radius: 999px; background: rgba(0,0,0,.6); color: #facc15; font: 900 13px "Trebuchet MS", sans-serif; letter-spacing: .06em; }
  #anuncio .cuenta { position: absolute; right: 12px; top: 12px; min-width: 44px; height: 44px; padding: 0 12px; border-radius: 999px; display: grid; place-items: center; background: rgba(0,0,0,.65); color: #fff; font: 900 15px "Trebuchet MS", sans-serif; border: 2px solid rgba(255,255,255,.5); }
  #anuncio .ax { position: absolute; right: 12px; top: 12px; width: 48px; height: 48px; border-radius: 50%; border: 3px solid #fff; background: #ef4444; color: #fff; font: 900 24px/1 "Trebuchet MS", sans-serif; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,.4); animation: axIn .35s cubic-bezier(.34,1.56,.64,1); }
  #anuncio .ax:hover { transform: scale(1.08); } @keyframes axIn { from { transform: scale(0); } }
  #anuncio .son { position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); border: 0; border-radius: 999px; padding: 11px 20px; background: #facc15; color: #1f2937; font: 900 16px "Trebuchet MS", sans-serif; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,.4); }
  #anuncio .bar { position: absolute; left: 0; bottom: 0; height: 5px; background: #facc15; width: 0; }
  #anuncio .ac.poster { width: min(980px, 100%); max-height: calc(100vh - 28px); overflow: auto; background: #1b0414; border-color: #f472b6; animation: pzIn .6s cubic-bezier(.2,1.3,.4,1); }
  @keyframes pzIn { from { transform: scale(.6) rotate(-3deg); opacity: 0; } }
  #anuncio .bar.t { transition: width linear; }
  .pz { position: relative; overflow: hidden; padding: clamp(14px, 3vw, 30px); color: #fff; text-align: center; background: radial-gradient(120% 80% at 50% 110%, #ff5d73, #a3123a 30%, #4c0a2e 60%, #1b0414 90%); }
  .pz .gl { position: absolute; border-radius: 50%; background: radial-gradient(circle, #7f0d22 0 28%, #d81f3c 42%, #ff6b7d 62%, transparent 70%); opacity: .55; filter: blur(2px); animation: pzFl 9s ease-in-out infinite alternate; }
  .pz .g1 { width: 120px; height: 100px; left: -30px; top: 30px; } .pz .g2 { width: 80px; height: 66px; right: 8%; top: 12px; animation-delay: -3s; } .pz .g3 { width: 150px; height: 120px; right: -40px; bottom: 10px; animation-delay: -5s; } .pz .g4 { width: 70px; height: 56px; left: 30%; bottom: -10px; animation-delay: -2s; }
  @keyframes pzFl { to { transform: translate(30px, -18px) rotate(40deg); } }
  .pz-top { position: relative; } .pz-nuevo { display: inline-block; padding: 5px 16px; border-radius: 999px; background: #facc15; color: #4a0e2a; font-weight: 900; font-size: clamp(11px, 1.5vw, 15px); letter-spacing: .1em; animation: pzLat 1.2s ease-in-out infinite; }
  @keyframes pzLat { 50% { transform: scale(1.08); } }
  .pz h2 { margin: 8px 0 2px; font: 900 clamp(28px, 5.4vw, 58px)/1 "Bangers", "Trebuchet MS", sans-serif; letter-spacing: .04em; color: #fde047; text-shadow: 0 4px 0 #9d174d, 0 0 24px rgba(253,224,71,.6); }
  .pz-top p { margin: 0; font-weight: 800; font-size: clamp(12px, 1.7vw, 17px); opacity: .92; }
  .pz-cs { position: relative; display: flex; align-items: stretch; justify-content: center; gap: clamp(8px, 2vw, 22px); margin: clamp(10px, 2.4vw, 22px) 0; }
  .pz-c { position: relative; flex: 1; max-width: 340px; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 12px 14px; border-radius: 18px; background: linear-gradient(160deg, var(--a), var(--b)); box-shadow: 0 0 0 4px #0b1220, 0 0 0 7px var(--c), 0 0 30px var(--c), 0 18px 30px rgba(0,0,0,.5); animation: pzCa 3.4s ease-in-out infinite; }
  .pz-c.c1 { --a: #f43f5e; --b: #7e22ce; --c: #a3e635; transform: rotate(-3deg); } .pz-c.c2 { --a: #a855f7; --b: #1e1b4b; --c: #e879f9; transform: rotate(3deg); animation-delay: -1.7s; }
  @keyframes pzCa { 50% { translate: 0 -8px; } }
  .pz-c svg { width: min(100%, 230px); height: auto; filter: drop-shadow(0 8px 10px rgba(0,0,0,.45)); }
  .pz-c .bob { animation: pzBob 1.8s ease-in-out infinite; transform-origin: 80px 110px; } .pz-c .b2 { animation-duration: 2.2s; }
  @keyframes pzBob { 50% { transform: translateY(-5px) scale(1.04, .97); } }
  .pz-c b { font: 900 clamp(18px, 2.8vw, 30px)/1 "Bangers", "Trebuchet MS", sans-serif; letter-spacing: .05em; } .pz-c em { font-style: normal; font-weight: 900; color: #fde68a; font-size: clamp(12px, 1.6vw, 16px); }
  .pz-c small { font-weight: 700; font-size: clamp(11px, 1.35vw, 14px); line-height: 1.3; opacity: .95; } .pz-c small b { font: inherit; font-weight: 900; letter-spacing: 0; }
  .pz-n { position: absolute; left: -10px; top: -12px; display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; background: #facc15; color: #4a0e2a; font: 900 24px/1 "Bangers", sans-serif; border: 3px solid #0b1220; }
  .pz-vs { align-self: center; font: 900 clamp(26px, 4.4vw, 50px)/1 "Bangers", sans-serif; color: #fde047; text-shadow: 0 0 16px rgba(253,224,71,.7), 0 3px 0 #92400e; }
  .pz-pie { position: relative; display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; font-weight: 800; font-size: clamp(12px, 1.5vw, 15px); }
  .pz-ir { border: 0; border-radius: 999px; padding: 12px 24px; background: linear-gradient(135deg, #22c55e, #0ea5e9); color: #fff; font: 900 clamp(15px, 1.9vw, 19px) "Trebuchet MS", sans-serif; cursor: pointer; box-shadow: 0 5px 0 #065f46, 0 0 24px rgba(34,197,94,.6); animation: pzLat 1.4s ease-in-out infinite; }
  @media (max-height: 520px) { .pz { padding: 10px 14px; } .pz-top p { display: none; } .pz h2 { font-size: 28px; margin: 4px 0 0; } .pz-cs { margin: 8px 0; } .pz-c { padding: 6px 10px 8px; } .pz-c svg { width: min(100%, 92px); } .pz-c small { display: none; } .pz-ir { padding: 8px 18px; } }`;
  document.head.appendChild(css);

  // otros videos (p. ej. el tutorial de la laptop) entran a la misma cola: una vez por visita
  window.AnuncioVer = a => { if (esDocente() || visto(a) || COLA.some(x => x.id === a.id)) return; COLA.push(a); if (!abierto) mostrar(COLA.length - 1); };
  function mostrar(i) {
    const AN = COLA[i], KEY = 'moli2:anuncio:' + AN.id; abierto = true;
    const el = document.createElement('div'); el.id = 'anuncio'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', AN.titulo);
    if (AN.html) return poster(AN, el, KEY, i);
    el.innerHTML = `<div class="ac"><video playsinline preload="auto" poster="${AN.poster}"><source src="${AN.video}" type="video/mp4"><source src="${AN.video.replace(/\.mp4$/, '.webm')}" type="video/webm"></video><span class="tag">📺 ${AN.titulo}</span><span class="cuenta">${AN.espera}</span><button type="button" class="ax" aria-label="Cerrar" hidden>✕</button><button type="button" class="son" hidden>🔊 Toca para escuchar</button><i class="bar"></i></div>`;
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    const v = el.querySelector('video'), cu = el.querySelector('.cuenta'), x = el.querySelector('.ax'), so = el.querySelector('.son'), bar = el.querySelector('.bar');
    let falta = AN.espera, cerrado = false;
    const cerrar = () => { if (cerrado) return; cerrado = true; clearInterval(T); v.pause(); el.classList.remove('on'); setTimeout(() => { el.remove(); abierto = false; if (COLA[i + 1] && (COLA[i + 1].todos || !esDocente())) mostrar(i + 1); }, 380); };   // y luego el siguiente anuncio
    const T = setInterval(() => { falta--; if (falta > 0) cu.textContent = falta; else { clearInterval(T); cu.remove(); x.hidden = false; } }, 1000);
    v.play().catch(() => { v.muted = true; so.hidden = false; v.play().catch(() => {}); });     // el navegador a veces no deja sonido sin un toque: va en silencio con el botón 🔊
    const sonido = () => { if (!v.muted) return; v.muted = false; so.hidden = true; v.play().catch(() => {}); };
    so.addEventListener('click', e => { e.stopPropagation(); sonido(); });
    el.addEventListener('pointerdown', e => { if (e.target !== x) sonido(); });
    x.addEventListener('click', e => { e.stopPropagation(); cerrar(); });
    v.addEventListener('timeupdate', () => { if (v.duration) bar.style.width = (v.currentTime / v.duration * 100) + '%'; });
    v.addEventListener('ended', cerrar);                                 // si lo dejan, el video sigue y al terminar se cierra solo
    const esc = e => { if (cerrado) return removeEventListener('keydown', esc); if (e.key === 'Escape' && !x.hidden) cerrar(); }; addEventListener('keydown', esc);
    window.Anuncio = { cerrar: () => { if (!x.hidden) cerrar(); }, abierto: () => !cerrado };
  }
  // 🖼️ póster (sin video): la ✕ sale a los «espera» segundos; un botón lleva a la escena de Juegos
  function poster(AN, el, KEY, i) {
    el.innerHTML = `<div class="ac poster">${AN.html}<span class="cuenta">${AN.espera}</span><button type="button" class="ax" aria-label="Cerrar" hidden>✕</button><i class="bar t"></i></div>`;
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    const cu = el.querySelector('.cuenta'), x = el.querySelector('.ax'), bar = el.querySelector('.bar');
    bar.style.transitionDuration = AN.espera + 's'; requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = '100%'; }));
    let falta = AN.espera, cerrado = false;
    const cerrar = () => { if (cerrado) return; cerrado = true; clearInterval(T); el.classList.remove('on'); setTimeout(() => { el.remove(); abierto = false; if (COLA[i + 1] && !esDocente()) mostrar(i + 1); }, 380); };
    const T = setInterval(() => { falta--; if (falta > 0) cu.textContent = falta; else { clearInterval(T); cu.remove(); x.hidden = false; } }, 1000);
    x.addEventListener('click', e => { e.stopPropagation(); cerrar(); });
    el.addEventListener('click', e => { const b = e.target.closest('[data-ir]'); if (!b) return; e.stopPropagation(); cerrar();
      setTimeout(() => { try { const G = window.G, k = G ? G.STOPS.findIndex(s => s.kind === 'biblio') : -1; if (k >= 0 && k !== G.TOUR.i && window.MD && MD.yo()) G.go(k - G.TOUR.i); } catch (er) {} }, 450); });
    const esc = e => { if (cerrado) return removeEventListener('keydown', esc); if (e.key === 'Escape' && !x.hidden) cerrar(); }; addEventListener('keydown', esc);
    window.Anuncio = { cerrar: () => { if (!x.hidden) cerrar(); }, abierto: () => !cerrado };
  }
  const listo = () => { const sp = document.getElementById('splash'); return !sp || sp.classList.contains('out') || getComputedStyle(sp).display === 'none'; };   // después de la pantalla de carga
  const ir = () => { let n = 0; const T = setInterval(() => { if (!listo() && ++n < 60) return; clearInterval(T); setTimeout(() => { const a = COLA[0]; if (a && !abierto && (a.todos || !esDocente())) mostrar(0); }, 700); }, 300); };
  if (document.readyState === 'complete') ir(); else addEventListener('load', ir, { once: true });
})();
