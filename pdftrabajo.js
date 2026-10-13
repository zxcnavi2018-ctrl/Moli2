// ===================================================================
//  MOLÍ 2 · 📄 DESCARGAR UN TRABAJO APROBADO EN PDF (Revista y Biblioteca)
//  Arma una hoja bonita con el trabajo y abre «Guardar como PDF» del navegador.
// ===================================================================
(function () {
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TIPO = { opi: 'Opinión científica', ens: 'Ensayo', inv: 'Investigación', dis: 'Diseño de investigación', pro: 'Producto o maqueta', info: 'Infografía', exp: 'Experimento', maq: 'Maqueta', vid: 'Video' };
  const fecha = v => { const d = v ? new Date(v) : null; return d && !isNaN(d) ? d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : ''; };
  function pregunta(w) {
    const L = String(w.d || '').split(/\n+/).map(x => x.trim()).filter(Boolean), es = x => /\?\s*$/.test(x) && x.length > 8 && !/^PASO\b/.test(x);
    const i = L.findIndex(x => /^PASO\b.*(pregunta|tema)/i.test(x));
    if (i >= 0) for (let k = i + 1; k < L.length && !/^PASO\b/.test(L[k]); k++) if (es(L[k])) return L[k];
    const q = L.find(es); return q || '';
  }
  function html(w) {
    const parr = String(w.d || '').split(/\n+/).map(x => x.trim()).filter(Boolean);
    const lnk = h => h.replace(/https?:\/\/[^\s<]+/g, u => `<a href="${u}">${u}</a>`);
    const cuerpo = parr.map(x => /^PASO\b/.test(x) ? ((h) => h ? `<h3>${esc(h)}</h3>` : '')(x.replace(/^PASO\s*\d*\s*/, '')) : /^Fuente \d/.test(x) ? `<p class="fu"><b>${esc(x)}</b></p>` : `<p>${lnk(esc(x))}</p>`).join('');
    const A = [w.img, w.img2, w.img3].filter(Boolean), q = w.ty === 'inv' ? pregunta(w) : '';
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(w.t || 'Trabajo')} - ${esc(w.n || '')}</title>
<style>@page { size: A4; margin: 16mm 16mm 18mm; } * { box-sizing: border-box; } body { margin: 0; font: 12pt/1.55 Georgia, "Times New Roman", serif; color: #1f2937; }
.top { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0b2e4f; padding-bottom: 6px; font: 700 9.5pt Arial, sans-serif; color: #0b2e4f; letter-spacing: .08em; text-transform: uppercase; }
.top span:last-child { color: #b45309; } h1 { margin: 14px 0 4px; font: 700 24pt/1.15 Georgia, serif; color: #0b2e4f; } .pq { margin: 4px 0 8px; font: italic 700 14pt Georgia, serif; color: #0f4c81; }
.meta { font: 10pt Arial, sans-serif; color: #475569; margin-bottom: 14px; } .meta b { color: #0b2e4f; } .tag { display: inline-block; padding: 2px 9px; border-radius: 99px; background: #dbeafe; color: #1e3a8a; font-weight: 700; margin-right: 6px; }
h3 { margin: 16px 0 4px; font: 700 12.5pt Arial, sans-serif; color: #0b2e4f; border-left: 4px solid #f59e0b; padding-left: 8px; } p { margin: 0 0 7px; text-align: justify; } p.fu { margin-top: 8px; }
a { color: #1d4ed8; word-break: break-all; } .anx { margin-top: 14px; page-break-inside: avoid; } .anx img { max-width: 100%; max-height: 90mm; display: block; margin: 6px auto; border: 1px solid #cbd5e1; border-radius: 6px; } .anx small { display: block; text-align: center; font: 9pt Arial, sans-serif; color: #64748b; }
.pie { margin-top: 18px; padding-top: 6px; border-top: 1px solid #cbd5e1; font: 9pt Arial, sans-serif; color: #64748b; text-align: center; }</style></head><body>
<div class="top"><span>Revista Innovadora · Repositorio Educativo</span><span>✔ Aprobado</span></div>
<h1>${esc(w.t || 'Trabajo')}</h1>${q ? `<p class="pq">❓ ${esc(q)}</p>` : ''}
<div class="meta"><span class="tag">${esc(TIPO[w.ty] || 'Trabajo')}</span><b>${esc(w.n || '')}</b>${w.sec ? ' · 6.° ' + esc(w.sec) : ''}${fecha(w.at) ? ' · ' + fecha(w.at) : ''}${w.rv ? ' · Revisado por ' + esc(w.rv) : ''}</div>
${cuerpo || '<p>Este trabajo no trae texto.</p>'}${w.f ? `<h3>Fuentes</h3><p>${lnk(esc(w.f))}</p>` : ''}
${A.length ? `<h3>Anexos</h3>${A.map((x, i) => `<div class="anx"><img src="${esc(x)}" alt=""><small>Anexo ${i + 1}</small></div>`).join('')}` : ''}
<div class="pie">Molí 2 · Ciencia y Tecnología · Innova Schools</div>
<script>addEventListener('load', () => setTimeout(() => { print(); }, 350)); addEventListener('afterprint', () => setTimeout(() => close(), 300));<\/script></body></html>`;
  }
  // abre la hoja y el «Guardar como PDF» del navegador (se llama dentro de un toque, así el navegador no la bloquea)
  window.pdfTrabajo = function (w) {
    const v = window.open('', '_blank'); if (!v) { alert('Permite las ventanas emergentes para descargar el PDF.'); return; }
    v.document.open(); v.document.write(html(w)); v.document.close();
  };
})();
