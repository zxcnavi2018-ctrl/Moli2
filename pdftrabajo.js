// ===================================================================
//  MOLÍ 2 · 📄 DESCARGAR UN TRABAJO APROBADO EN PDF (Revista y Biblioteca)
//  Formato «artículo académico» (Modelo A): convierte la guía en un artículo de investigación
//  (resumen, pregunta, desarrollo, conclusión y referencias APA) y abre «Guardar como PDF» del navegador.
// ===================================================================
(function () {
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TIPO = { opi: 'Opinión científica', ens: 'Ensayo', inv: 'Investigación', dis: 'Diseño de investigación', pro: 'Producto o maqueta', info: 'Infografía', exp: 'Experimento', maq: 'Maqueta', vid: 'Video' };
  // el grado y el profe del trabajo (6.° → Christian; 7.° → el docente de 7.° anotado en config/site.tchG)
  const P7 = { n: '' }; fetch('https://firestore.googleapis.com/v1/projects/ciencia6abcd/databases/(default)/documents/config/site?key=AIzaSyB3IlHEFGkCGtZhPZxV5-a47Pg2mAaIjSM')
    .then(r => r.ok ? r.json() : null).then(j => { const G = j && j.fields && j.fields.tchG && j.fields.tchG.mapValue.fields || {}; Object.values(G).forEach(v => { const [e, n] = String(v.stringValue).split('|'); if (e === 'c7' && n) P7.n = n; }); }).catch(() => {});
  const grado = w => +w.g === 7 || (!+w.g && window.MD && MD.espInfo && MD.espInfo().k === 'c7') ? 7 : 6;
  const profe = w => grado(w) === 7 ? P7.n || 'Docente de 7.° grado' : 'Christian Quispe Llerena';
  // ✨ Resumen y Abstract escritos aparte para trabajos ya publicados que llegaron en Word (antes de que Molí los escribiera solo)
  const FIJO = { 'ke61a1080d4e6873e9fb7-mvbskrdm': {
    s: 'En esta investigación quise saber qué diferencia hay entre una enfermedad contagiosa y una que no lo es. Encontré que la gripe se contagia por virus cuando una persona habla, tose o estornuda, mientras que la diabetes y las enfermedades del corazón no se transmiten y dependen de la genética y de los hábitos de vida. Por eso concluyo que con higiene, vacunas, buena alimentación y ejercicio podemos prevenirlas.',
    a: 'Mariana investigated the difference between a contagious disease and one that is not. Using information from the World Health Organization, she explains that the flu is spread by viruses when people talk, cough or sneeze, while diabetes and cardiovascular diseases are not contagious and are linked to genetics and lifestyle habits. She concludes that hygiene, vaccines, a healthy diet and exercise help prevent them.' } };
  window.pdfFijo = FIJO;
  const CSS = `@page { size: A4; margin: 20mm 20mm 22mm; } * { box-sizing: border-box; } body { margin: 0; font: 11.5pt/1.6 "Times New Roman", "Liberation Serif", Georgia, serif; color: #111; }
.hd { display: flex; justify-content: space-between; font: 9pt Arial, "Liberation Sans", sans-serif; color: #555; border-bottom: 1px solid #999; padding-bottom: 4px; }
h1 { text-align: center; font: 700 20pt/1.25 "Times New Roman", "Liberation Serif", serif; margin: 26px 0 10px; } .au { text-align: center; font-size: 12.5pt; } .af { text-align: center; font-size: 10pt; color: #444; font-style: italic; margin-bottom: 16px; }
.abs { border-top: 2px solid #111; border-bottom: 2px solid #111; padding: 10px 0; margin: 10px 0 16px; font-size: 10.5pt; text-align: justify; } .abs b { font-variant: small-caps; letter-spacing: .04em; }
h2 { font: 700 12pt "Times New Roman", "Liberation Serif", serif; margin: 16px 0 6px; font-variant: small-caps; letter-spacing: .04em; break-after: avoid; } p { margin: 0 0 8px; text-align: justify; text-indent: 1.2em; }
.refs p { text-indent: -1.2em; padding-left: 1.2em; font-size: 10.5pt; } .url { word-break: break-all; color: #333; } .anx { margin-top: 12px; text-align: center; break-inside: avoid; } .anx img { max-width: 100%; max-height: 85mm; border: 1px solid #bbb; } .anx small { display: block; font-size: 9.5pt; color: #555; }
.ft { margin-top: 24px; border-top: 1px solid #999; padding-top: 4px; font: 9pt Arial, "Liberation Sans", sans-serif; color: #555; display: flex; justify-content: space-between; gap: 10px; }`;
  const fecha = v => { const d = v ? new Date(v) : null; return d && !isNaN(d) ? d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : ''; };
  const anio = w => { const d = new Date(w.at || Date.now()); return isNaN(d) ? new Date().getFullYear() : d.getFullYear(); };
  // ---- la guía (PASO …) en partes de un artículo ----
  function partes(w) {
    const L = String(w.d || '').split(/\n+/).map(x => x.trim()).filter(Boolean), S = [], F = []; let cur = null, fu = null, enF = false, salta = L.some(x => /^PASO\b/.test(x));   // antes del 1.er PASO: sólo títulos repetidos
    for (const x of L) {
      if (/^PASO\b/.test(x)) { const t = x.replace(/^PASO\s*\d*\s*/, '').trim(); enF = /fuentes/i.test(t); fu = null;
        salta = /revisa y publica/i.test(t); if (salta) { cur = null; continue; }
        if (!enF) { cur = { t, k: /^abstract/i.test(t) ? 'a' : /resumen/i.test(t) ? 's' : /respuesta|conclusi/i.test(t) ? 'r' : /pregunta|tema/i.test(t) ? 'q' : /encontr|desarrollo|razones|datos|ciencia/i.test(t) ? 'h' : 'o', p: [] }; S.push(cur); } continue; }
      if (enF) { if (/^Fuente\s*\d/i.test(x)) { fu = {}; F.push(fu); continue; }
        const m = /^(Autor o página|Año|Tema|Título|Link):\s*(.*)$/i.exec(x); if (m && fu) fu[{ 'autor o página': 'a', 'año': 'y', 'tema': 't', 'título': 't', 'link': 'l' }[m[1].toLowerCase()]] = m[2]; continue; }
      if (salta || /^(si|x|✓|☑|☐)(\s|$)/i.test(x)) continue;
      if (!cur) { cur = { t: '', k: 'o', p: [] }; S.push(cur); }
      cur.p.push(x.replace(/^Hallazgo\s*\d+\s*:\s*/i, ''));
    }
    return { S: S.filter(s => s.p.length), F };
  }
  const autorDe = w => { const n = String(w.n || '').trim(); return n === 'Molí' ? 'Molí' : w.sec ? 'Est. ' + n : n ? 'Prof. ' + n.replace(/^Prof\.?\s*/i, '') : ''; };
  const revDe = w => !w.rv ? '' : w.rv === 'tu profe' ? 'Prof. ' + profe(w) : 'Est. ' + w.rv + ' (Revisor Confiable)';
  const apellido = n => { const p = String(n || '').trim().split(/\s+/); return p.length >= 3 ? p[p.length - 2] : p[p.length - 1] || ''; };
  const lnk = h => h.replace(/https?:\/\/[^\s<]+/g, u => `<span class="url">${u}</span>`);
  function articulo(w, nro) {
    const P = partes(w), q = P.S.find(s => s.k === 'q'), r = P.S.find(s => s.k === 'r'), su = P.S.find(s => s.k === 's'), ab = P.S.find(s => s.k === 'a'), rest = P.S.filter(s => s !== q && s !== r && s !== su && s !== ab);
    const kws = String(w.kw || '').split(',').map(x => x.trim()).filter(Boolean), A = [w.img, w.img2, w.img3].filter(Boolean), y = anio(w);
    const ref = x => `${esc(x.a || 'Autor desconocido')}. (${esc(x.y || 's. f.')}). <i>${esc(x.t || 'Sin título')}</i>.${x.l ? ` Recuperado de <span class="url">${esc(x.l)}</span>` : ''}`;
    const fx = !su && FIJO[w.id];                                     // (sin Abstract: el PDF sólo lleva el Resumen)
    const res0 = (fx ? fx.s : su ? su.p.join(' ') : [q && q.p.join(' '), r && r.p.join(' ')].filter(Boolean).join(' ')).split(/\s+/).filter(Boolean), resumen = !su && !fx && res0.length > 70 ? res0.slice(0, 70).join(' ').replace(/[,;:.]?$/, '…') : res0.join(' ');   // como en las revistas: corto
    let n = 0; const sec = (t, ps) => `<h2>${++n}. ${esc(t)}</h2>${ps.map(x => `<p>${lnk(esc(x))}</p>`).join('')}`;
    const cuerpo = (q ? sec('Pregunta de investigación', q.p) : '') + rest.map(s => sec(s.k === 'h' ? (rest.length === 1 ? 'Desarrollo' : s.t) : s.t || 'Desarrollo', s.p)).join('') + (r ? sec('Conclusión', r.p) : '');
    const cita = w.sec ? `${apellido(w.n)} (${y})` : `${String(w.n || '').split(/\s+/).pop()} (${y})`;
    return `
<div class="hd"><span>REVISTA INNOVADORA · Repositorio Educativo${nro ? ' · Artículo ' + nro : ''}</span><span>${esc(TIPO[w.ty] || 'Trabajo')} · Vol. 1 · ${y}</span></div>
<h1>${esc(w.t || 'Trabajo')}</h1><div class="au">${esc(autorDe(w))}</div><div class="af">${w.sec ? `${grado(w)}.° grado «${esc(w.sec)}» · ` : ''}Ciencia y Tecnología · Innova Schools · Tacna</div>
${resumen || kws.length ? `<div class="abs">${resumen ? `<b>Resumen.</b> ${esc(resumen)}` : ''}${kws.length ? `${resumen ? '<br>' : ''}<b>Palabras clave:</b> ${esc(kws.join(', '))}.` : ''}</div>` : ''}
${cuerpo || '<p>Este trabajo no trae texto.</p>'}
${P.F.length ? `<div class="refs"><h2>Referencias</h2>${P.F.map(x => `<p>${ref(x)}</p>`).join('')}</div>` : w.f ? `<div class="refs"><h2>Referencias</h2><p>${lnk(esc(w.f))}</p></div>` : ''}
${A.length ? `<h2>Anexos</h2>${A.map((x, i) => `<div class="anx"><img src="${esc(x)}" alt=""><small>Anexo ${i + 1}</small></div>`).join('')}` : ''}
<div class="ft"><span>Publicado el ${esc(fecha(w.at))}${revDe(w) ? ' · Revisado por: ' + esc(revDe(w)) : ''}</span><span>Cómo citar: ${esc(cita)}</span></div>
`;
  }
  const html = w => {
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(w.t || 'Trabajo')} - ${esc(w.n || '')}</title><style>${CSS}</style></head><body>${articulo(w)}
<script>addEventListener('load', () => setTimeout(() => { print(); }, 350)); addEventListener('afterprint', () => setTimeout(() => close(), 300));<\/script></body></html>`;
  };
  window.pdfHtml = html;
  // ---- 📚 la REVISTA completa de un grado: carátula formal (blanco y negro), índice con las preguntas de investigación y los artículos ----
  const preguntaDe = w => { const q = partes(w).S.find(s => s.k === 'q'); return String(q ? q.p.join(' ') : w.t || 'Trabajo').replace(/\s+/g, ' ').trim(); };
  const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const ARTE = `<svg viewBox="0 0 200 200" width="190" height="190" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="100" r="92" stroke-width="1.2"/><circle cx="100" cy="100" r="84" stroke-width="0.6"/>
    <ellipse cx="100" cy="100" rx="62" ry="22"/><ellipse cx="100" cy="100" rx="62" ry="22" transform="rotate(60 100 100)"/><ellipse cx="100" cy="100" rx="62" ry="22" transform="rotate(120 100 100)"/>
    <circle cx="100" cy="100" r="9" fill="#111"/><circle cx="162" cy="100" r="4" fill="#111"/><circle cx="69" cy="46" r="4" fill="#111"/><circle cx="69" cy="154" r="4" fill="#111"/></svg>`;
  function revista(L, o) {
    const hoy = new Date(), fechaTx = `${MES[hoy.getMonth()]} de ${hoy.getFullYear()}`, GR = o.grado === 7 ? 'Séptimo grado' : 'Sexto grado';
    const portada = `<section class="cv">
      <div class="cv-top"><span>Innova Schools · Tacna</span><span>Ciencia y Tecnología</span><span>Vol. 1 · ${hoy.getFullYear()}</span></div>
      <div class="cv-mast"><small>Revista Innovadora</small><h1>REPOSITORIO<br>EDUCATIVO</h1><div class="cv-sub">Revista de investigación escolar</div></div>
      <div class="cv-bar"><span>Edición · ${esc(o.edicion || 'Unidad 7')}</span><span>${esc(fechaTx)}</span></div>
      <div class="cv-mid">${ARTE}<div><h2>${GR}</h2><p>Investigaciones de nuestros estudiantes, leídas y aprobadas por el Equipo de la Revista.</p></div></div>
      <div class="cv-en"><b>En esta edición</b>${L.slice(0, 4).map((w, i) => `<p><i>${i + 1}</i>${esc(preguntaDe(w))}</p>`).join('')}${L.length > 4 ? `<p class="mas">… y ${L.length - 4} ${L.length - 4 > 1 ? 'investigaciones' : 'investigación'} más.</p>` : ''}</div>
      <div class="cv-pie"><span>${L.length} artículo${L.length > 1 ? 's' : ''}</span><span>Dirección: ${esc(o.grado === 7 ? 'Prof. ' + (P7.n || 'Docente de 7.° grado') : 'Prof. Christian Quispe Llerena')}</span></div></section>`;
    const indice = `<section class="ix"><div class="hd"><span>REPOSITORIO EDUCATIVO · Revista Innovadora</span><span>${esc(GR)} · Edición ${esc(o.edicion || 'Unidad 7')}</span></div>
      <h2 class="ix-t">Índice</h2><p class="ix-s">Preguntas de investigación de esta edición</p>
      <ol>${L.map((w, i) => `<li><span class="n">${i + 1}</span><div><b>${esc(preguntaDe(w))}</b><small>${esc(autorDe(w))}${w.sec ? ` · ${grado(w)}.° «${esc(w.sec)}»` : ''}</small></div></li>`).join('')}</ol></section>`;
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Repositorio Educativo · ${esc(GR)} · ${esc(o.edicion || 'Unidad 7')}</title><style>${CSS}
@page { @bottom-center { content: counter(page); font: 9pt "Times New Roman", serif; color: #555; } } @page :first { @bottom-center { content: none; } }
.cv { height: 253mm; display: flex; flex-direction: column; border: 3px double #111; padding: 9mm 10mm; break-after: page; color: #111; }
.cv-top { display: flex; justify-content: space-between; font: 700 8.5pt Arial, sans-serif; letter-spacing: .18em; text-transform: uppercase; border-bottom: 1px solid #111; padding-bottom: 3mm; }
.cv-mast { text-align: center; padding: 9mm 0 5mm; border-bottom: 4px solid #111; } .cv-mast small { font: italic 15pt "Times New Roman", serif; letter-spacing: .08em; }
.cv-mast h1 { margin: 2mm 0 0; font: 900 46pt/0.95 "Times New Roman", "Liberation Serif", serif; letter-spacing: .06em; } .cv-sub { margin-top: 3mm; font: 700 9pt Arial, sans-serif; letter-spacing: .35em; text-transform: uppercase; }
.cv-bar { display: flex; justify-content: space-between; padding: 2mm 1mm; border-bottom: 1px solid #111; font: 700 10.5pt "Times New Roman", serif; letter-spacing: .12em; text-transform: uppercase; }
.cv-mid { flex: 1; display: flex; align-items: center; gap: 9mm; padding: 6mm 4mm; } .cv-mid h2 { margin: 0 0 3mm; font: 900 30pt/1 "Times New Roman", serif; text-transform: uppercase; letter-spacing: .04em; } .cv-mid p { margin: 0; font: italic 13pt/1.45 "Times New Roman", serif; text-indent: 0; text-align: left; }
.cv-en { border-top: 2px solid #111; padding-top: 3mm; } .cv-en b { font: 700 9pt Arial, sans-serif; letter-spacing: .3em; text-transform: uppercase; } .cv-en p { margin: 2mm 0 0; text-indent: 0; font: 12pt/1.35 "Times New Roman", serif; display: flex; gap: 3mm; } .cv-en i { font-style: normal; font-weight: 900; } .cv-en .mas { font-style: italic; color: #333; }
.cv-pie { display: flex; justify-content: space-between; margin-top: 5mm; padding-top: 2mm; border-top: 4px solid #111; font: 700 9pt Arial, sans-serif; letter-spacing: .12em; text-transform: uppercase; }
.ix { break-after: page; } .ix-t { text-align: center; font: 900 26pt "Times New Roman", serif; font-variant: normal; letter-spacing: .1em; margin: 14mm 0 0; text-transform: uppercase; } .ix-s { text-align: center; text-indent: 0; font-style: italic; margin-bottom: 8mm; }
.ix ol { list-style: none; margin: 0; padding: 0; } .ix li { display: flex; gap: 5mm; padding: 3.2mm 0; border-bottom: 1px dotted #777; break-inside: avoid; } .ix .n { font: 900 15pt "Times New Roman", serif; min-width: 9mm; }
.ix li b { display: block; font: 700 12pt/1.35 "Times New Roman", serif; } .ix li small { font: 9.5pt Arial, sans-serif; color: #444; }
.art { break-before: page; }</style></head><body>${portada}${indice}${L.map((w, i) => `<article class="art">${articulo(w, i + 1)}</article>`).join('')}
<script>addEventListener('load', () => setTimeout(() => { print(); }, 600));<\/script></body></html>`;
  }
  window.pdfRevista = function (L, o, v) {                            // L: trabajos completos (con su texto); o: { grado: 6|7, edicion }
    v = v || window.open('', '_blank'); if (!v) { alert('Permite las ventanas emergentes para descargar el PDF.'); return; }
    v.document.open(); v.document.write(revista(L, o || {})); v.document.close();
  };
  // abre la hoja y el «Guardar como PDF» del navegador (se llama dentro de un toque, así el navegador no la bloquea)
  window.pdfVentana = () => { const v = window.open('', '_blank'); if (!v) { alert('Permite las ventanas emergentes para descargar el PDF.'); return null; } v.document.write('<p style="font:16px Arial;margin:40px">⏳ Preparando el PDF…</p>'); return v; };
  window.pdfTrabajo = function (w, v) {                               // v: una ventana ya abierta con pdfVentana() (si hubo que esperar datos)
    v = v || window.open('', '_blank'); if (!v) { alert('Permite las ventanas emergentes para descargar el PDF.'); return; }
    v.document.open(); v.document.write(html(w)); v.document.close();
  };
})();
