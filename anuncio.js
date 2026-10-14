// ===================================================================
//  MOLÍ 2 · 📺 ANUNCIO AL ENTRAR: un video con cuenta regresiva de 15 s; recién entonces sale la ✕.
//  Si se cierra, se cierra; si no, el video sigue hasta el final y se cierra solo. Una vez por visita.
//  Si hay varios, salen uno tras otro (al cerrarse uno, aparece el siguiente).
// ===================================================================
(function () {
  const ANS = [
    { id: 'rc-2026-10', video: 'video/revisores-confiables.mp4', poster: 'video/revisores-confiables.jpg', titulo: 'Estudiantes RC · Revisores Confiables', hasta: '2026-10-18', espera: 15 },
    { id: 'rc-reglas-2026-10', video: 'video/revisores-reglas.mp4', poster: 'video/revisores-reglas.jpg', titulo: 'Revisores Confiables · ¿Cómo revisan?', hasta: '2026-10-18', espera: 10 },
  ];
  if (window.parent !== window) return;                                  // dentro de otra página (iframe) no sale
  const visto = a => { try { return !!sessionStorage.getItem('moli2:anuncio:' + a.id); } catch (e) { return false; } };
  const COLA = ANS.filter(a => new Date() <= new Date(a.hasta + 'T23:59:59') && !visto(a));   // pasada la fecha o ya visto, no sale
  let abierto = false;

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
  #anuncio .bar { position: absolute; left: 0; bottom: 0; height: 5px; background: #facc15; width: 0; }`;
  document.head.appendChild(css);

  // otros videos (p. ej. el tutorial de la laptop) entran a la misma cola: una vez por visita
  window.AnuncioVer = a => { if (visto(a) || COLA.some(x => x.id === a.id)) return; COLA.push(a); if (!abierto) mostrar(COLA.length - 1); };
  function mostrar(i) {
    const AN = COLA[i], KEY = 'moli2:anuncio:' + AN.id; abierto = true;
    const el = document.createElement('div'); el.id = 'anuncio'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', AN.titulo);
    el.innerHTML = `<div class="ac"><video playsinline preload="auto" poster="${AN.poster}"><source src="${AN.video}" type="video/mp4"><source src="${AN.video.replace(/\.mp4$/, '.webm')}" type="video/webm"></video><span class="tag">📺 ${AN.titulo}</span><span class="cuenta">${AN.espera}</span><button type="button" class="ax" aria-label="Cerrar" hidden>✕</button><button type="button" class="son" hidden>🔊 Toca para escuchar</button><i class="bar"></i></div>`;
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    const v = el.querySelector('video'), cu = el.querySelector('.cuenta'), x = el.querySelector('.ax'), so = el.querySelector('.son'), bar = el.querySelector('.bar');
    let falta = AN.espera, cerrado = false;
    const cerrar = () => { if (cerrado) return; cerrado = true; clearInterval(T); v.pause(); el.classList.remove('on'); setTimeout(() => { el.remove(); abierto = false; if (COLA[i + 1]) mostrar(i + 1); }, 380); };   // y luego el siguiente anuncio
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
  const ir = () => setTimeout(() => { if (COLA.length && !abierto) mostrar(0); }, 900);
  if (document.readyState === 'complete') ir(); else addEventListener('load', ir, { once: true });
})();
