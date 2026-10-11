// ===================================================================
//  MOLÍ 2 · DIPLOMAS DE FELICITACIONES (lo que se proyecta en la pizarra para el estudiante)
//  Su pasaporte de sellos, en modo proyección: por cada sesión con 🎟️ Exit ticket AD, 🙋 +4 en participación,
//  🤝 buena conducta y 💪 su refuerzo completo, gana un Diploma de felicitaciones (se descarga como imagen).
// ===================================================================
(function () {
  const { esc, L, IMG, temaDe } = Hojas._;
  const PROFE = 'Christian Quispe Llerena';
  const SELLOS = [
    { k: 'exit', i: '🎟️', t: 'Exit AD', c: '#b91c1c', d: 'Logras AD en tu Exit ticket' },
    { k: 'part', i: '🙋', t: 'Participación +4', c: '#1d4ed8', d: 'Tu profe te pone +4 en participación' },
    { k: 'cond', i: '🤝', t: 'Buena conducta', c: '#047857', d: 'Conducta muy buena (AD) o buena (A)' },
    { k: 'mis', i: '🎯', t: 'Misión', c: '#7c3aed', d: 'Completas tu misión de refuerzo (si la sesión tiene)' }
  ];
  const fuente = new FontFace('Moli Script', 'url(img/fonts/great-vibes.woff2)'); fuente.load().then(f => document.fonts.add(f)).catch(() => {});

  function diplomas(host) {
    const P = { i: 0, L: [], u: null, me: MD.yo(), T: null, prog: {} };
    const sellosDe = n => {
      const T = P.T || {}, x = T[n], pa = T[30 + n], co = T[60 + n], ms = MD.misionesDe(P.u.key).filter(m => m.ses && m.ses.n === n);
      const o = { exit: !!x && MD.nivel(x).k === 'AD', part: !!pa && MD.partic(pa) === 4, cond: !!co && ['AD', 'A'].includes(MD.nivel(co).k) };
      if (ms.length) o.mis = ms.every(m => MD.misionCompleta(m, P.prog));
      o.todo = Object.values(o).every(Boolean); o.hay = ms.length > 0; o.conducta = co ? MD.nivel(co).k : ''; return o;
    };
    function armar() {
      const L0 = [];
      if (!P.me) { P.L = [{ k: 'login' }]; return; }
      if (!P.u) { P.L = [{ k: 'vacio' }]; return; }
      const S = MD.sesionesDe(P.u), Z = S.map(x => ({ ...x, o: sellosDe(x.n) }));
      const got = Z.reduce((a, z) => a + SELLOS.filter(s => z.o[s.k]).length, 0), tot = Z.reduce((a, z) => a + (z.o.hay ? 4 : 3), 0);
      L0.push({ k: 'tapa' }, { k: 'datos', got, tot }, { k: 'reglas' });
      Z.forEach(z => { L0.push({ k: 'visa', ...z }); if (z.o.todo) L0.push({ k: 'dip', ...z }); });
      P.L = L0;
    }
    const pie = `<div class="pp-pie">🛂 República de la Ciencia · ${esc(P.me ? P.me.name : '')}</div>`;
    function slide(it) {
      const u = P.u;
      if (it.k === 'login') return `<div class="pp-sl pp-azul"><img class="pp-mol" src="${IMG('hola')}" alt=""><h2>🛂 Mis diplomas</h2><p>Toca tu <b>fotocheck</b> en «Mi aula» y escribe tu DNI para ver tu pasaporte de sellos.</p></div>`;
      if (it.k === 'vacio') return `<div class="pp-sl pp-azul"><img class="pp-mol" src="${IMG('pensativa')}" alt=""><h2>Aún no hay unidades</h2></div>`;
      if (it.k === 'tapa') return `<div class="pp-sl pp-tapa"><div class="pp-oro"><small>REPÚBLICA DE LA CIENCIA</small><div class="pp-em">${esc(u.icon || '🔬')}</div><h1>Pasaporte<span>científico</span></h1>
        <p class="pp-un">Unidad ${esc(u.num)} · ${esc(u.title)}</p><p class="pp-nm">${esc(P.me.name)}</p><small>Desliza o toca › para abrir</small></div></div>`;
      if (it.k === 'datos') return `<div class="pp-sl pp-papel"><h2>🆔 Datos del viajero</h2><div class="pp-id"><div class="pp-ph"><img src="${IMG('feliz')}" alt=""></div><dl>
        <dt>Nombre</dt><dd>${esc(P.me.name)}</dd><dt>Grado</dt><dd>6° ${esc(P.me.section)}</dd><dt>Área</dt><dd>Ciencia y Tecnología</dd><dt>Unidad</dt><dd>${esc(u.num)} · ${esc(u.title)}</dd><dt>Sellos</dt><dd><b>${it.got}</b> de ${it.tot}</dd></dl></div>
        <div class="pp-mrz">P&lt;PER&lt;${esc(String(P.me.name).toUpperCase().replace(/\s+/g, '<'))}&lt;&lt;&lt;<br>${esc(String(P.me.dni || '').replace(/\d(?=\d{3})/g, '•'))}&lt;CIENCIA&lt;MOLI&lt;&lt;&lt;</div>${pie}</div>`;
      if (it.k === 'reglas') return `<div class="pp-sl pp-papel"><div class="pp-mq"><img class="pp-mol" src="${IMG('decidida')}" alt=""><div class="pp-bub"><b>¡Hola, ${esc(String(P.me.name).split(' ')[0])}! Soy Molí.</b> En cada sesión puedes ganar <b>4 sellos</b>. Si los juntas todos, ¡recibes un <b>Diploma de felicitaciones</b> que puedes descargar! 🏅</div></div>
        <ul class="pp-ins">${SELLOS.map(s => `<li><span class="pp-st on" style="--c:${s.c};--r:-6deg"><i>${s.i}</i><b>${s.t}</b></span><span>${s.d}</span></li>`).join('')}</ul>${pie}</div>`;
      if (it.k === 'visa') { const o = it.o, ss = SELLOS.filter(s => s.k !== 'mis' || o.hay), h = ss.filter(s => o[s.k]).length;
        return `<div class="pp-sl pp-papel"><div class="pp-k">${esc(u.icon || '📘')} Unidad ${esc(u.num)}</div><h2>🛂 Sesión ${it.n} <small>${esc(temaDe(it.s, it.n))}</small></h2>
          <div class="pp-visa">${ss.map((s, k) => `<div class="pp-st${o[s.k] ? ' on' : ''}" style="--c:${s.c};--r:${(k * 37 + it.n * 11) % 17 - 8}deg"><i>${s.i}</i><b>${s.t}</b>${o[s.k] ? '<small>✓</small>' : ''}</div>`).join('')}</div>
          <p class="pp-msg">${o.todo ? '🌟 ¡Visa completa! Pasa a la siguiente lámina: ahí está tu diploma.' : `Tienes ${h} de ${ss.length} sellos. ¡Tú puedes! 💪`}</p>
          <div class="pp-dip${o.todo ? ' on' : ''}">${o.todo ? '🏅' : '🔒'} Diploma de felicitaciones</div>${pie}</div>`; }
      if (it.k === 'dip') { const o = it.o, why = porQue(it);
        return `<div class="pp-sl pp-fondo"><div class="dp"><div class="dp-in"><i class="dp-c tl"></i><i class="dp-c tr"></i><i class="dp-c bl"></i><i class="dp-c br"></i>
          <span class="dp-medal">🏅</span><small>¡Felicitaciones!</small><h3>Diploma de felicitaciones</h3><p>Se otorga el presente diploma a</p><b class="dp-n">${esc(P.me.name)}</b>
          <p class="dp-why">${esc(why)}</p><div class="dp-f"><div><img src="${IMG('genial')}" alt=""><i>Molí</i><small>Tu robot de Ciencia</small></div><span class="dp-seal">★</span><div><i class="dp-sig">${esc(PROFE)}</i><small>Docente de Ciencia</small></div></div></div></div>
          <button class="pp-dl" data-pp="dl" data-n="${it.n}">⬇️ Descargar diploma</button></div>`; }
      return '';
    }
    const porQue = it => `por haber realizado con éxito la Sesión ${it.n} de la Unidad ${P.u.num}: ${P.u.title}, logrando AD en el Exit ticket, +4 en participación, conducta ${it.o.conducta === 'AD' ? 'muy buena' : 'buena'}${it.o.hay ? ' y su refuerzo completo' : ''}.`;

    let el = null;
    function pinta(dir) {
      if (!el) return;
      const st = el.querySelector('.pp-stage');
      P.i = Math.max(0, Math.min(P.L.length - 1, P.i));
      const it = P.L[P.i], nuevo = document.createElement('div'); nuevo.className = 'pp-cuadro'; nuevo.innerHTML = slide(it);
      const viejo = st.querySelector('.pp-cuadro');
      if (viejo && dir) { viejo.classList.add('pp-out'); setTimeout(() => viejo.remove(), 520); nuevo.classList.add('pp-in'); el.classList.remove('pp-flash'); void el.offsetWidth; el.classList.add('pp-flash'); }
      else if (viejo) viejo.remove();
      st.appendChild(nuevo);
      el.querySelector('.pp-n').textContent = P.L.length > 1 ? `${P.i + 1} / ${P.L.length}` : '';
      el.querySelector('[data-pp="-1"]').disabled = P.i === 0; el.querySelector('[data-pp="1"]').disabled = P.i >= P.L.length - 1;
      if (it.k === 'visa' && it.o.todo && window.moliReaccion) window.moliReaccion('estrellas');
    }
    async function cargarUnidad(u) {
      P.u = u; P.T = null; P.i = 0;
      if (P.me && u) { try { [P.T, P.prog] = await Promise.all([MD.ticketsDe(u, P.me), MD.avance(P.me)]); } catch (e) { P.T = {}; } }
      armar(); pinta(1);
    }
    function montar() {
      const U = MD.unidades().filter(u => MD.sesionesDe(u).length);
      host.innerHTML = `<div class="cv pp"><div class="pp-stage"></div><div class="cv-bar"><button data-pp="-1" aria-label="Anterior">‹</button>
        <select aria-label="Unidad">${U.map(u => `<option value="${esc(u.key)}">🛂 Unidad ${esc(u.num)} · ${esc(u.title)}</option>`).join('')}</select><span class="pp-n"></span><button data-pp="1" aria-label="Siguiente">›</button></div></div>`;
      el = host.firstChild; const fs = () => { el.style.fontSize = Math.max(8, Math.min(22, el.clientHeight / 26)) + 'px'; }; fs(); P.ro = new ResizeObserver(fs); P.ro.observe(el);
      el.addEventListener('click', e => { const b = e.target.closest('[data-pp]'); if (!b) return; e.stopPropagation();
        if (b.dataset.pp === 'dl') return descargar(b, P.L.find(z => z.k === 'dip' && z.n === +b.dataset.n));
        P.i += +b.dataset.pp; pinta(+b.dataset.pp); });
      const sel = el.querySelector('select'); sel.addEventListener('change', () => cargarUnidad(U.find(u => u.key === sel.value)));
      let x0 = null; el.addEventListener('pointerdown', e => { x0 = e.target.closest('.cv-bar,.pp-dl') ? null : e.clientX; });
      el.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) { const d = dx < 0 ? 1 : -1; P.i += d; pinta(d); } });
      const u0 = U[U.length - 1]; if (u0) sel.value = u0.key; cargarUnidad(u0 || null);
    }
    async function descargar(btn, it) {
      if (!it) return; btn.disabled = true; const nm = P.me.name, W = 1600, H = 1130, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      try {
        try { await document.fonts.load('80px "Moli Script"'); } catch (e) {}
        const im = await new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = IMG('genial'); });
        const g = x.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 900); g.addColorStop(0, '#fffdf6'); g.addColorStop(1, '#f7ecd2'); x.fillStyle = g; x.fillRect(0, 0, W, H);
        const gold = x.createLinearGradient(0, 0, W, H); gold.addColorStop(0, '#b8860b'); gold.addColorStop(.5, '#f6d365'); gold.addColorStop(1, '#b8860b');
        x.strokeStyle = gold; x.lineWidth = 26; x.strokeRect(34, 34, W - 68, H - 68); x.strokeStyle = '#1d3c8f'; x.lineWidth = 3; x.strokeRect(72, 72, W - 144, H - 144); x.strokeRect(84, 84, W - 168, H - 168);
        const orn = (cx, cy, r) => { x.save(); x.translate(cx, cy); x.rotate(r); x.strokeStyle = gold; x.lineWidth = 5; x.beginPath(); x.moveTo(0, 70); x.quadraticCurveTo(0, 0, 70, 0); x.stroke(); x.beginPath(); x.arc(18, 18, 9, 0, 7); x.fillStyle = gold; x.fill(); x.restore(); };
        orn(96, 96, 0); orn(W - 96, 96, Math.PI / 2); orn(W - 96, H - 96, Math.PI); orn(96, H - 96, -Math.PI / 2);
        x.textAlign = 'center'; x.fillStyle = '#1d3c8f'; x.font = '800 30px system-ui,sans-serif'; x.fillText('★  ¡ F E L I C I T A C I O N E S !  ★', W / 2, 180);
        x.fillStyle = gold; x.font = "700 92px Georgia,'Times New Roman',serif"; x.fillText('Diploma de felicitaciones', W / 2, 285);
        x.fillStyle = '#3b4767'; x.font = 'italic 34px Georgia,serif'; x.fillText('Se otorga el presente diploma a', W / 2, 370);
        x.fillStyle = '#12224a'; x.font = '118px "Moli Script","Great Vibes",cursive'; x.fillText(nm, W / 2, 500);
        x.strokeStyle = gold; x.lineWidth = 3; x.beginPath(); x.moveTo(360, 530); x.lineTo(W - 360, 530); x.stroke();
        x.fillStyle = '#2f3d63'; x.font = '600 32px system-ui,sans-serif'; const w = []; let ln = '';
        porQue(it).split(' ').forEach(t => { const n = ln ? ln + ' ' + t : t; if (x.measureText(n).width > W - 420) { w.push(ln); ln = t; } else ln = n; }); if (ln) w.push(ln); w.forEach((t, i) => x.fillText(t, W / 2, 600 + 44 * i));
        x.drawImage(im, 270, 730, 220, 220); x.fillStyle = '#12224a'; x.font = '64px "Moli Script","Great Vibes",cursive'; x.fillText('Molí', 380, 1010);
        x.font = '600 22px system-ui,sans-serif'; x.fillStyle = '#5b6785'; x.fillText('Tu robot de Ciencia', 380, 1046);
        x.save(); x.translate(W / 2, 900); const sg = x.createRadialGradient(0, 0, 10, 0, 0, 95); sg.addColorStop(0, '#ffe08a'); sg.addColorStop(1, '#c8961e'); x.fillStyle = sg; x.beginPath();
        for (let k = 0; k < 24; k++) { const R = k % 2 ? 78 : 95, A = k * Math.PI / 12; x.lineTo(Math.cos(A) * R, Math.sin(A) * R); } x.closePath(); x.fill(); x.fillStyle = '#fff'; x.font = '900 64px system-ui'; x.fillText('★', 0, 22); x.restore();
        x.fillStyle = '#12224a'; x.font = '62px "Moli Script","Great Vibes",cursive'; x.fillText(PROFE, W - 420, 975);
        x.strokeStyle = '#94a3b8'; x.lineWidth = 2; x.beginPath(); x.moveTo(W - 640, 995); x.lineTo(W - 200, 995); x.stroke();
        x.font = '600 22px system-ui,sans-serif'; x.fillStyle = '#5b6785'; x.fillText('Docente de Ciencia', W - 420, 1030);
        x.font = 'italic 22px Georgia,serif'; x.fillText(new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, 1030);
        const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = 'Diploma de felicitaciones - ' + nm + ' - Sesión ' + it.n + '.png'; document.body.appendChild(a); a.click(); a.remove();
        btn.textContent = '✅ ¡Diploma descargado!';
      } catch (e) { btn.textContent = '📶 Intenta otra vez'; }
      btn.disabled = false;
    }
    P.iniciar = () => { host.innerHTML = '<div class="cv pp"><div class="cv-gate"><b style="font-size:1.4em">🛂 Abriendo tus diplomas…</b></div></div>';
      Promise.all([MD.cargar(), MD.cargarMisiones().catch(() => {})]).then(montar).catch(() => { host.innerHTML = '<div class="cv"><div class="cv-gate"><b>📶 No pude cargar. Revisa tu internet.</b></div></div>'; }); };
    P.cerrar = () => { P.ro && P.ro.disconnect(); };
    return P;
  }
  Hojas.diplomas = diplomas;
})();
