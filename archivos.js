// 📁 Mis archivos: carpeta flotante del estudiante (Aula y Revista). Guarda sus guías de investigación escritas en el «Word de Molí»:
//    ⏳ Por concluir (aún no la envía) o 📨 Enviado (con el estado que le dio su Revisor). Se guardan en este navegador.
(function () {
  'use strict';
  const BASE = 'https://firestore.googleapis.com/v1/projects/ciencia6abcd/databases/(default)/documents', KEY = 'AIzaSyB3IlHEFGkCGtZhPZxV5-a47Pg2mAaIjSM';
  const get = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const yo = () => { const m = get('moli2:me', null); if (m && m.key) return m; const v = get('ciencia4b:me:1ba4092d0e', null); return v && v.key && !v.demo ? v : null; };
  const REPO = /repositorio/.test(location.pathname), TIPO = { inv: ['🔬', 'Investigación'] };
  const lista = () => { const m = yo(), L = m ? get('moli2:hojas:' + m.key, []) : []; return Array.isArray(L) ? L.filter(h => TIPO[h.ty]) : []; };
  const fecha = ms => ms ? new Date(ms).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' }) : '';
  const palabras = h => Object.entries(h.v || {}).filter(([k, v]) => typeof v === 'string' && !/^f\d[yl]$/.test(k)).map(([, v]) => v).join(' ').split(/\s+/).filter(Boolean).length;
  const EST = { ok: ['ok', '✅ ¡Publicado!'], pend: ['rv', '📨 En revisión'], no: ['mj', '✏️ Por mejorar: lee el consejo'] }, cache = {};
  const css = document.createElement('style');
  css.textContent = `#maBtn{position:fixed;left:max(12px,env(safe-area-inset-left));bottom:max(170px,calc(env(safe-area-inset-bottom) + 170px));z-index:26;display:flex;align-items:center;gap:8px;padding:9px 14px 9px 10px;border:3px solid #2b2547;border-radius:16px;background:linear-gradient(180deg,#ffd76a,#f5b62a);color:#3b2a00;font:900 14px Nunito,system-ui,sans-serif;box-shadow:0 6px 0 #2b2547,0 12px 24px rgba(0,0,0,.3);cursor:pointer;transition:transform .15s}
  #maBtn:hover{transform:translateY(-2px)}#maBtn:active{transform:translateY(3px);box-shadow:0 2px 0 #2b2547}#maBtn .ic{font-size:24px;line-height:1}#maBtn b{min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#e2483d;color:#fff;font-size:12px;display:grid;place-items:center}#maBtn[hidden],#maBtn b[hidden]{display:none}
  body.repo #maBtn{bottom:max(18px,env(safe-area-inset-bottom))}
  #maWin{position:fixed;inset:0;z-index:85;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(8,26,45,.55);backdrop-filter:blur(3px)}#maWin[hidden]{display:none}
  #maWin .ma-c{width:min(640px,100%);max-height:100%;overflow:auto;border-radius:22px;border:4px solid #2b2547;background:#fbfaf6;font-family:Nunito,system-ui,sans-serif;color:#17324d;box-shadow:0 24px 60px rgba(0,0,0,.45)}
  .ma-h{position:sticky;top:0;display:flex;align-items:center;gap:10px;padding:14px 16px;background:linear-gradient(115deg,#0b2e4f,#0a6aa1);color:#fff}.ma-h h3{flex:1;margin:0;font:900 22px Fraunces,Georgia,serif}.ma-h button{width:38px;height:38px;border:0;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;font-size:18px;font-weight:900;cursor:pointer}
  .ma-b{padding:14px 16px 18px;display:grid;gap:10px}.ma-n{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border:3px dashed #9fb6d9;border-radius:16px;background:#fff;color:#0a6aa1;font:900 15px Nunito,sans-serif;cursor:pointer}
  .ma-f{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:16px;background:#fff;border:2px solid #d9e4ee}.ma-f .w{flex:none;display:grid;place-items:center;width:42px;height:50px;border-radius:7px;background:#2b579a;color:#fff;font:900 20px Georgia,serif}
  .ma-f .t{flex:1;min-width:0}.ma-f .t b{display:block;font:800 16px/1.2 Fraunces,Georgia,serif;color:#0b2e4f;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ma-f .t small{font-weight:800;color:#4b6075;font-size:12.5px}
  .ma-s{padding:4px 10px;border-radius:999px;font-weight:900;font-size:12px;white-space:nowrap;background:#fff4d6;color:#8a6100}.ma-s.ok{background:#eef8e3;color:#6aa52b}.ma-s.rv{background:#e0f2fe;color:#075985}.ma-s.mj{background:#fde8e6;color:#b23a30}.ma-s.en{background:#e0f2fe;color:#075985}
  .ma-f button{padding:8px 12px;border:0;border-radius:12px;background:#0a6aa1;color:#fff;font:900 13px Nunito,sans-serif;cursor:pointer}.ma-f button.del{background:#fff;color:#e2483d;border:2px solid #f3c4c0;padding:6px 9px}
  .ma-e{padding:20px;text-align:center;font-weight:800;color:#4b6075}.ma-p{margin:0;font-size:13px;font-weight:700;color:#4b6075}
  @media (max-width:520px){.ma-f{flex-wrap:wrap}.ma-f .t{flex-basis:calc(100% - 60px)}}`;
  document.head.appendChild(css); if (REPO) document.body.classList.add('repo');
  const btn = document.createElement('button'); btn.type = 'button'; btn.id = 'maBtn'; btn.innerHTML = '<span class="ic">📁</span>Mis archivos<b hidden></b>'; document.body.appendChild(btn);
  const win = document.createElement('div'); win.id = 'maWin'; win.hidden = true; document.body.appendChild(win);
  function pintarBtn() { const m = yo(); btn.hidden = !m || !!(m.teacher || m.docente); const n = lista().filter(h => h.st === 'por').length, b = btn.querySelector('b'); b.hidden = !n; b.textContent = n; }
  function estado(h) { if (h.st !== 'env') return ['', '⏳ Por concluir']; const e = EST[cache[h.rid]]; return e || ['en', '📨 Enviado']; }
  function pintar() {
    pintarBtn(); if (win.hidden) return; const L = lista().sort((a, b) => (b.at || 0) - (a.at || 0));
    win.innerHTML = `<div class="ma-c" role="dialog" aria-modal="true"><div class="ma-h"><span style="font-size:30px">📁</span><h3>Mis archivos</h3><button type="button" data-max aria-label="Cerrar">✕</button></div><div class="ma-b">
      <button type="button" class="ma-n" data-man>➕ Nueva investigación</button>
      ${L.length ? L.map(h => { const e = estado(h), t = TIPO[h.ty]; return `<div class="ma-f"><span class="w">W</span><div class="t"><b>${esc(h.nom || h.t || 'Mi investigación (sin nombre)')}</b><small>${t[0]} ${t[1]} · ${h.np ?? palabras(h)} palabras · ${h.st === 'env' ? 'enviada el ' + fecha(h.env) : 'editada el ' + fecha(h.at)}</small></div><span class="ma-s ${e[0]}">${e[1]}</span><button type="button" data-mao="${esc(h.id)}">${h.st === 'env' ? '👀 Ver' : '✏️ Seguir'}</button>${h.st === 'env' ? '' : `<button type="button" class="del" data-mad="${esc(h.id)}" aria-label="Borrar">🗑</button>`}</div>`; }).join('')
        : '<div class="ma-e">📂 Tu carpeta está vacía.<br>Toca «Nueva investigación» para empezar tu guía.</div>'}
      <p class="ma-p">💾 Tus guías se guardan solas en este dispositivo. Las «Por concluir» todavía no las envías: termínalas y envíalas desde la Revista.</p></div></div>`;
    L.filter(h => h.st === 'env' && h.rid && !(h.rid in cache)).forEach(h => { cache[h.rid] = '';
      fetch(`${BASE}/revista/${encodeURIComponent(h.rid)}?key=${KEY}`).then(r => r.ok ? r.json() : null).then(j => { cache[h.rid] = j && j.fields && j.fields.st ? j.fields.st.stringValue : ''; if (!win.hidden) pintar(); }).catch(() => {}); });
  }
  function abrir(q) {                                                  // en la Revista se abre aquí mismo; en el Aula, dentro de la Revista
    win.hidden = true;
    if (REPO && window.abrirHojaDoc) { if (q.nueva) { const f = window.nuevaHoja && window.nuevaHoja(q.nueva); if (f) window.abrirHojaDoc(f); } else window.abrirHojaDoc(q.hoja); return; }
    const v = 'enviar&' + (q.nueva ? 'nueva=' + q.nueva : 'hoja=' + encodeURIComponent(q.hoja));
    if (window.Revista && Revista.abrirBandeja) Revista.abrirBandeja(v); else location.href = 'repositorio.html?v=' + v;
  }
  btn.addEventListener('click', () => { win.hidden = false; pintar(); });
  win.addEventListener('click', e => {
    if (e.target === win || e.target.closest('[data-max]')) { win.hidden = true; return; }
    const o = e.target.closest('[data-mao]'); if (o) return abrir({ hoja: o.dataset.mao });
    if (e.target.closest('[data-man]')) return abrir({ nueva: 'inv' });
    const d = e.target.closest('[data-mad]'); if (d && confirm('¿Borrar esta guía que aún no enviaste? No se podrá recuperar.')) { const m = yo(); try { localStorage.setItem('moli2:hojas:' + m.key, JSON.stringify(lista().filter(h => h.id !== d.dataset.mad))); } catch (x) {} pintar(); }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !win.hidden) win.hidden = true; });
  addEventListener('moli2:me', pintarBtn); addEventListener('storage', pintarBtn); addEventListener('focus', pintarBtn);
  window.MisArchivos = { pintar, abrir: () => btn.click() };
  pintarBtn();
})();
