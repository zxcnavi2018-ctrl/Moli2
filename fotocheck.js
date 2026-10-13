// ===================================================================
//  MOLÍ 2 · FOTOCHECK: cuelga a la izquierda en «Mi aula».
//  Estudiante: al tocarlo escribe su DNI (una sola vez); luego queda con su nombre y ya no hace nada.
//  Docente: al tocarlo se abren sus herramientas.
// ===================================================================
(function () {
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const el = document.createElement('div'); el.id = 'foto';
  el.innerHTML = '<i class="fc-cinta"></i><button class="fc-card" type="button" aria-label="Mi fotocheck"></button>';
  const card = el.querySelector('.fc-card');
  const panel = document.createElement('div'); panel.id = 'fcPanel';
  document.addEventListener('DOMContentLoaded', () => { document.body.append(el, panel); });
  if (document.body) document.body.append(el, panel);

  const iniciales = n => String(n || '').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
  const COL = { A: '#ef4444', B: '#2563eb', C: '#16a34a', D: '#f59e0b' };
  function pintar() {
    const me = MD.yo(), doc = MD.esDocente();
    el.classList.toggle('vacio', !me); el.classList.toggle('doc', doc);
    if (!me) {
      card.innerHTML = `<i class="fc-clip"></i><div class="fc-top">CIENCIA Y TECNOLOGÍA</div><div class="fc-ph q">?</div><b class="fc-n">¿Quién eres?</b><span class="fc-s">Toca y escribe tu DNI</span><div class="fc-bar"></div>`;
      return;
    }
    const sec = String(me.section || '').toUpperCase();
    card.innerHTML = `<i class="fc-clip"></i><div class="fc-top">CIENCIA Y TECNOLOGÍA</div>
      <div class="fc-ph" style="--c:${doc ? '#7c3aed' : COL[sec] || '#2563eb'}">${esc(iniciales(me.name))}</div>
      <b class="fc-n">${esc(String(me.name || '').split(' ').slice(0, 2).join(' '))}</b>
      <span class="fc-s">${doc ? '👩‍🏫 Docente · 6° grado' : '6° ' + esc(sec) + ' · Estudiante'}</span><div class="fc-bar"></div>`;
  }

  // ---- ventanitas ----
  function abrir(html) { panel.innerHTML = `<div class="fp-c">${html}</div>`; panel.classList.add('on'); }
  function cerrar() { panel.classList.remove('on'); }
  function pedirDni() {
    abrir(`<button class="fp-x" data-f="x" aria-label="Cerrar">✕</button>
      <div class="fp-h"><img src="img/moli/hola.webp" alt=""><div><b>¡Hola! 👋</b><span>Escribe tu <b>DNI</b> para tu fotocheck. Sólo lo haces una vez.</span></div></div>
      <form data-f="dni"><input name="dni" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="DNI (8 números)"><div class="fp-err"></div><button class="fp-ok" type="submit">Entrar ✓</button></form>`);
    setTimeout(() => { const i = panel.querySelector('input'); i && i.focus(); }, 250);
  }
  const HERR = [
    ['editar', '✏️', 'Editar aula', 'Mueve mesas, sillas y más'],
    ['corcho', '📌', 'Editar corcho', 'Unidad y propósito'],
    ['cuenta', '🤖', 'Crear cuenta con Molí', 'Cuentas de tus estudiantes'],
    ['trabajar', '✨', 'Trabajar con Molí', 'Crea la ficha de tu sesión'],
    ['preparadas', '📦', 'Sesiones preparadas', 'Unidad 7 lista para publicar'],
    ['escanear', '📷', 'Escanear', 'Exit tickets en papel'],
    ['remoto', '📱', 'Control remoto', 'Maneja la pantalla desde tu celular'],
    ['equipo', '💻', 'Laptop o celular', 'Qué hace este equipo'],
    ['bandeja', '📥', 'Bandeja de la Revista', 'Trabajos por revisar'],
    ['revisores', '🧐', 'Revisores', 'Estudiantes que aprueban trabajos']
  ];
  let infoDoc = null;
  function pedirClave(info) {
    infoDoc = info;
    abrir(`<button class="fp-x" data-f="x" aria-label="Cerrar">✕</button>
      <div class="fp-h"><img src="img/moli/decidida.webp" alt=""><div><b>👩‍🏫 Modo docente</b><span>Hola, ${esc(String(info.name).split(' ')[0])}. Escribe tu <b>clave</b>.</span></div></div>
      <form data-f="clave"><input name="pin" type="password" inputmode="${info.tipo === 'owner' ? 'text' : 'numeric'}" autocomplete="off" placeholder="Clave"><div class="fp-err"></div><button class="fp-ok" type="submit">Entrar ✓</button></form>`);
    setTimeout(() => { const i = panel.querySelector('input'); i && i.focus(); }, 250);
  }
  function pedirCuenta() {
    abrir(`<button class="fp-x" data-f="x" aria-label="Cerrar">✕</button>
      <div class="fp-h"><img src="img/moli/idea.webp" alt=""><div><b>🔐 Conecta tu cuenta</b><span>Así veo y guardo lo de tus estudiantes de 6° A, B, C y D.</span></div></div>
      <form data-f="cuenta"><input name="email" type="email" autocomplete="username" placeholder="Correo" value="${esc(Docente.OWNER_EMAIL)}" style="font-size:16px;letter-spacing:0">
        <input name="pass" type="password" autocomplete="current-password" placeholder="Contraseña" style="font-size:16px;letter-spacing:0"><div class="fp-err"></div>
        <button class="fp-ok" type="submit">Conectar ✓</button></form>
      <p class="fp-me"><button data-f="google">Entrar con Google</button> · <button data-f="despues">Después</button></p>`);
  }
  function menuEstudiante() {
    const me = MD.yo();
    abrir(`<button class="fp-x" data-f="x" aria-label="Cerrar">✕</button>
      <div class="fp-h"><img src="img/moli/feliz.webp" alt=""><div><b>¡Hola, ${esc(String(me.name || '').split(' ')[0])}! 👋</b><span>${esc(me.name)} · 6° ${esc(me.section || '')}</span></div></div>
      ${window.Revista && Revista.esRevisor() ? '<button class="fp-ok" data-f="h" data-k="bandeja">📥 Mi bandeja de Revisor</button>' : ''}
      <button class="fp-out" data-f="salir1">🚪 Salir de cuenta</button>`);
  }
  function confirmarSalir() {
    abrir(`<div class="fp-h"><img src="img/moli/pensativa.webp" alt=""><div><b>¿Salir de tu cuenta?</b><span>Para volver a entrar tendrás que escribir tu DNI otra vez.</span></div></div>
      <div class="fp-dos"><button class="fp-no" data-f="x">Cancelar</button><button class="fp-out" data-f="salir">🚪 Sí, salir</button></div>`);
  }
  function menuDocente() {
    const me = MD.yo();
    abrir(`<button class="fp-x" data-f="x" aria-label="Cerrar">✕</button>
      <div class="fp-h"><img src="img/moli/feliz.webp" alt=""><div><b>¡Hola, ${esc(String(me.name || 'profe').split(' ')[0])}! 👩‍🏫</b><span>Tus herramientas de docente.</span></div></div>
      <div class="fp-g">${HERR.map(([k, ic, t, d]) => `<button data-f="h" data-k="${k}"><i>${ic}</i><b>${t}</b><small>${d}</small></button>`).join('')}</div>
      <p class="fp-me">${Docente.conectado() ? '✅ Cuenta conectada · ' + esc(Docente.correo()) : '<button data-f="conectar">🔌 Conectar mi cuenta</button>'}<br>${esc(me.name)} · <button data-f="salir1">🚪 Salir de cuenta</button></p>`);
  }
  card.addEventListener('click', e => {
    e.stopPropagation();
    const me = MD.yo();
    if (!me) return pedirDni();
    if (MD.esDocente()) return menuDocente();
    el.classList.remove('meneo'); void el.offsetWidth; el.classList.add('meneo');   // estudiante: se mece y puede salir de su cuenta
    menuEstudiante();
  });
  panel.addEventListener('click', e => {
    if (e.target === panel) return cerrar();
    const b = e.target.closest('[data-f]'); if (!b || b.tagName === 'FORM') return;
    e.stopPropagation();
    const f = b.dataset.f;
    if (f === 'x') return cerrar();
    if (f === 'salir1') return confirmarSalir();
    if (f === 'salir') { MD.salir(); cerrar(); pintar(); window.dispatchEvent(new Event('moli2:me')); return; }
    if (f === 'h') { cerrar(); window.dispatchEvent(new CustomEvent('moli2:herramienta', { detail: b.dataset.k })); }
    if (f === 'conectar') return pedirCuenta();
    if (f === 'despues') return menuDocente();
    if (f === 'google') { const err = panel.querySelector('.fp-err'); Docente.conGoogle().then(() => { window.dispatchEvent(new Event('moli2:me')); menuDocente(); })
      .catch(x => { if (err) err.textContent = /unauthorized-domain/.test(x.code || x.message) ? 'Falta autorizar este sitio en Firebase (Authentication → Dominios autorizados).' : 'No se pudo entrar con Google.'; }); }
  });
  panel.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, i = f.querySelector('input'), err = f.querySelector('.fp-err'), b = f.querySelector('button');
    b.disabled = true; b.textContent = 'Un momento…'; err.textContent = '';
    if (f.dataset.f === 'clave') {
      try { await Docente.conClave(infoDoc, i.value); window.dispatchEvent(new Event('moli2:me')); pintar(); Docente.conectado() ? menuDocente() : pedirCuenta(); }
      catch (x) { b.disabled = false; b.textContent = 'Entrar ✓'; i.value = ''; err.textContent = x.message === 'CLAVE' ? 'Clave incorrecta.' : x.message === 'MUCHOS' ? 'Muchos intentos. Espera unos minutos.' : 'No pude conectarme. Revisa tu internet.'; }
      return;
    }
    if (f.dataset.f === 'cuenta') {
      try { await Docente.conCorreo(f.email.value.trim(), f.pass.value); window.dispatchEvent(new Event('moli2:me')); menuDocente(); }
      catch (x) { b.disabled = false; b.textContent = 'Conectar ✓'; err.textContent = /INVALID|PASSWORD|EMAIL/.test(x.message) ? 'Correo o contraseña incorrectos.' : /TOO_MANY/.test(x.message) ? 'Muchos intentos. Espera unos minutos.' : 'No pude conectarme.'; }
      return;
    }
    try {
      await MD.entrar(i.value);
      window.dispatchEvent(new Event('moli2:me')); pintar();
      if (MD.esDocente()) menuDocente(); else { cerrar(); el.classList.remove('meneo'); void el.offsetWidth; el.classList.add('meneo'); }
    } catch (x) {
      if (x.message === 'DOCENTE') return pedirClave(x.info);
      b.disabled = false; b.textContent = 'Entrar ✓';
      err.textContent = x.message === 'DNI' ? 'Escribe los 8 números de tu DNI.' : x.message === 'NOEXISTE' ? 'No encuentro ese DNI. Pide a tu profe que cree tu cuenta.' : x.message === 'CLAVE' ? 'Clave incorrecta.' : 'No pude conectarme. Revisa tu internet.';
    }
  });
  addEventListener('moli2:me', pintar);

  window.Foto = {
    mostrar(on) { el.classList.toggle('on', !!on); if (!on) cerrar(); },
    pintar, cerrar
  };
  pintar();
})();
