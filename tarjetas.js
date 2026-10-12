// ===================================================================
//  MOLÍ 2 · TARJETAS DEL EXIT TICKET para escanear (las mismas de Molí 1: mismas medidas en milímetros)
//  Adelante: código de la sesión, últimos 3 del DNI, sección, respuestas, conducta y participación.
//  Atrás: las preguntas. Hoja A4 horizontal, 4 tarjetas por hoja, a doble cara.
// ===================================================================
(function () {
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const Li = Escaner.Li, LETRA = 'ABCD', DL = { AD: 1, A: .6, B: 0, C: -.7 };
  const numU = u => { const t = parseInt(u.num, 10); return t >= 1 && t <= 15 ? t : 0; };
  function bits(num, n, area = 0) { const a = [1]; for (let t = 3; t >= 0; t--) a.push(num >> t & 1); for (let t = 4; t >= 0; t--) a.push(n >> t & 1); for (let t = 3; t >= 0; t--) a.push(area >> t & 1); const s = (7 * num + 3 * n + 5 * area) % 4; a.push(s >> 1 & 1, s & 1, 0); return a; }
  // ---- los elementos de la tarjeta (igual que Molí 1) ----
  function elementos(u, n, s) {
    const qs = MD.preguntas(s).slice(0, Li.ans.max), B = bits(numU(u), n), D = Li.dni, A = Li.ans, C = Li.code, E = [], K = '#2b3038', ad = A.dyf(qs.length);
    Li.fid.forEach(([x, y]) => E.push({ t: 'rect', x: x - 3, y: y - 3, w: 6, h: 6, fill: '#595959' }));
    C.pts.forEach(([x, y], i) => { if (i < B.length ? B[i] : 1) E.push({ t: 'rect', x: x - C.s / 2, y: y - C.s / 2, w: C.s, h: C.s, fill: '#111111' }); });
    E.push({ t: 'text', x: 30.2, y: 14.4, s: `CIENCIA · UNIDAD ${u.num} · SESIÓN ${n}`, size: 3.4, bold: 1 });
    E.push({ t: 'text', x: 13, y: 21.3, s: 'ÚLTIMOS 3 DÍGITOS', size: 2.75, bold: 1 }, { t: 'text', x: 13, y: 24.4, s: 'DE MI DNI', size: 2.75, bold: 1 });
    for (let c = 0; c < D.n; c++) { const x = D.x0 + c * D.dx; E.push({ t: 'rect', x: x - 2.8, y: 26, w: 5.6, h: 5.4, stroke: '#555555', lw: .3 });
      for (let k = 0; k < 10; k++) { const y = D.y0 + k * D.dy; E.push({ t: 'circle', x, y, r: D.r, stroke: '#222222', lw: .3 }, { t: 'text', x, y: y + 1.05, s: String(k), size: 3, color: K, align: 'center' }); } }
    E.push({ t: 'text', x: 52.6, y: 21.3, s: 'SECCIÓN', size: 2.75, bold: 1 });
    Li.sec.k.forEach((k, i) => E.push({ t: 'circle', x: Li.sec.x0 + i * Li.sec.dx, y: Li.sec.y, r: Li.sec.r, stroke: '#222222', lw: .3 }, { t: 'text', x: Li.sec.x0 + i * Li.sec.dx, y: Li.sec.y + 1.1, s: k, size: 3.2, color: K, align: 'center' }));
    E.push({ t: 'text', x: 52.6, y: 33.7, s: 'MIS RESPUESTAS', size: 2.75, bold: 1 });
    const caja = (x, y, w, h) => [[x, y, x + w, y], [x, y + h, x + w, y + h], [x, y, x, y + h], [x + w, y, x + w, y + h]].forEach(([a, b, c, d]) => E.push({ t: 'line', x1: a, y1: b, x2: c, y2: d, stroke: '#111111', lw: .3, dash: .8 }));
    const fila = L => L.k.forEach((k, i) => { const x = L.x0 + i * L.dx, y = L.y; E.push({ t: 'circle', x, y, r: L.r, stroke: '#222222', lw: .3 });
      if (L.face) { const col = '#5b6270'; [-1, 1].forEach(e => E.push({ t: 'circle', x: x + .8 * e, y: y - .6, r: .18, stroke: col, lw: .5 }));
        const pt = e => [x - 1.1 + 2.2 * e, y + .45 + (DL[k] < 0 ? .55 : 0) + .75 * DL[k] * (1 - (2 * e - 1) ** 2)];
        for (let e = 0; e < 6; e++) { const [a, b] = pt(e / 6), [c, d] = pt((e + 1) / 6); E.push({ t: 'line', x1: a, y1: b, x2: c, y2: d, stroke: col, lw: .45 }); } }
      else E.push({ t: 'text', x, y: y + .95, s: k, size: k.length > 1 ? 2.6 : 2.9, color: K, align: 'center' }); });
    if (qs.length <= Li.cond.max) { caja(51.5, 70.8, 35.7, 18.2); E.push({ t: 'text', x: 69.35, y: 73.7, s: 'Conducta', size: 2.6, bold: 1, align: 'center' }, { t: 'text', x: 69.35, y: 82.5, s: 'Participación', size: 2.6, bold: 1, align: 'center' }); fila(Li.cond); fila(Li.cls); }
    else if (qs.length <= Li.cls.max) { caja(51.5, 77.4, 35.7, 11.6); E.push({ t: 'text', x: 69.35, y: 80.7, s: 'Participación', size: 2.6, bold: 1, align: 'center' }); fila(Li.cls); }
    qs.forEach((q, i) => { const y = A.y0 + i * ad; E.push({ t: 'text', x: 54.8, y: y + 1.15, s: String(i + 1), size: 3.3, bold: 1, align: 'center' });
      q.opts.forEach((o, k) => E.push({ t: 'circle', x: A.x0 + k * A.dx, y, r: A.r, stroke: '#222222', lw: .3 }, { t: 'text', x: A.x0 + k * A.dx, y: y + 1.1, s: LETRA[k], size: 3.1, color: K, align: 'center' })); });
    return E;
  }
  // ---- a SVG (en milímetros: se imprime al tamaño exacto) ----
  function svgTarjeta(u, n, s, extra = '') {
    const el = elementos(u, n, s).map(e => e.t === 'rect' ? `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="${e.fill || 'none'}"${e.stroke ? ` stroke="${e.stroke}" stroke-width="${e.lw || .2}"` : ''}/>`
      : e.t === 'circle' ? `<circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="none" stroke="${e.stroke || '#333'}" stroke-width="${e.lw || .22}"/>`
      : e.t === 'line' ? `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke || '#777'}" stroke-width="${e.lw || .2}"${e.dash ? ` stroke-dasharray="${e.dash} ${e.dash}"` : ''}/>`
      : `<text x="${e.x}" y="${e.y}" font-size="${e.size}" font-family="Arial, Helvetica, sans-serif"${e.bold ? ' font-weight="700"' : ''} fill="${e.color || '#111'}"${e.align === 'center' ? ' text-anchor="middle"' : ''}>${esc(e.s)}</text>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Li.W} ${Li.H}" width="${Li.W}mm" height="${Li.H}mm"><rect x="0" y="0" width="${Li.W}" height="${Li.H}" fill="#fff"/>${el}${extra}</svg>`;
  }
  function preguntasHtml(u, n, s) {
    const qs = MD.preguntas(s).slice(0, Li.ans.max);
    const c = s.ticket && s.ticket.caso, caso = c && (c.t || (c.d || []).length) ? `<div class="caso">${esc(c.t || '')}${c.c && c.c.length ? `<table class="t"><tr>${c.c.map(x => `<th>${esc(x)}</th>`).join('')}</tr>${(c.d || []).map(f => '<tr>' + c.c.map((_, j) => `<td>${esc(f[j] || '')}</td>`).join('') + '</tr>').join('')}</table>` : ''}</div>` : '';
    return `<div class="tq"><b class="tq-t">U${esc(u.num)} S${n} · Exit ticket</b>${caso}${qs.map((q, i) => `<div class="tq-q"><b>${i + 1}. ${esc(q.q)}</b><div>${q.opts.map((o, k) => `<span><i>${LETRA[k]}</i>${esc(o.t)}</span>`).join('')}</div></div>`).join('')}</div>`;
  }
  // ---- imprimir: A4 horizontal, 4 tarjetas adelante y sus preguntas atrás ----
  function imprimir(u, n) {
    const s = u.sessions[n - 1]; if (!s || !MD.preguntas(s).length) return alert('Esta sesión no tiene Exit ticket.');
    const t = svgTarjeta(u, n, s), p = preguntasHtml(u, n, s), cel = x => `<div class="c">${x}</div>`;
    const w = window.open('', '_blank'); if (!w) return alert('Permite las ventanas emergentes para imprimir las tarjetas.');
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Tarjetas · U${esc(u.num)} S${n}</title><style>
      @page { size: A4 landscape; margin: 0; } * { box-sizing: border-box; } body { margin: 0; font-family: Arial, Helvetica, sans-serif; }
      .hoja { width: 297mm; height: 210mm; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; page-break-after: always; break-after: page; position: relative; }
      .hoja::before, .hoja::after { content: ''; position: absolute; border: 0 dashed #b5bccb; } .hoja::before { left: 50%; top: 4mm; bottom: 4mm; border-left-width: .25mm; } .hoja::after { top: 50%; left: 4mm; right: 4mm; border-top-width: .25mm; }
      .c { display: flex; align-items: center; justify-content: center; } .c svg { width: 107.5mm; height: 100.8mm; }
      .caso { font-size: 3mm; margin-bottom: 2mm; } .caso table { border-collapse: collapse; margin-top: 1mm; } .caso td, .caso th { border: .25mm solid #333; padding: .4mm 1.5mm; }
      .tq { width: 128mm; padding: 2mm; font-size: 3.3mm; } .tq-t { display: block; font-size: 4mm; margin-bottom: 2mm; } .tq-q { margin: 0 0 2.4mm; } .tq-q div { display: flex; flex-wrap: wrap; gap: 1mm 4mm; margin-top: 1mm; }
      .tq-q span { display: inline-flex; align-items: center; gap: 1.2mm; } .tq-q i { font-style: normal; font-weight: 700; width: 4mm; height: 4mm; border: .25mm solid #333; border-radius: 50%; display: inline-grid; place-items: center; font-size: 2.6mm; }
      .ayuda { padding: 6mm; font-size: 4mm; } @media print { .ayuda { display: none; } }
    </style></head><body><div class="ayuda">🖨️ Imprime en A4 horizontal, a doble cara (voltear por el borde corto). Escala 100 %. <button onclick="print()">Imprimir</button></div>
      <div class="hoja">${[0, 1, 2, 3].map(() => cel(t)).join('')}</div><div class="hoja">${[0, 1, 2, 3].map(() => cel(p)).join('')}</div>
      <script>setTimeout(() => print(), 600)<\/script></body></html>`);
    w.document.close();
  }
  // ---- imprimir la FICHA de la sesión (como la del colegio, con el estilo de Molí) y al final su cierre con la tarjeta ----
  // ---- la ficha impresa (estilo ficha de colegio, blanco y negro, 1 o 2 hojas): encabezado y pie con el área, la unidad y la página ----
  const sinEmoji = t => String(t == null ? '' : t).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').replace(/\s{2,}/g, ' ').trim();
  const e2 = t => esc(sinEmoji(t));
  function fichaPrint(fx, s) {
    const P = [], A = (s && s.activities) || [];
    const tabla = (c, r, it = [], d) => `<table class="t"><tr>${c.map(x => `<th>${e2(x)}</th>`).join('')}</tr>${(d && d.length ? d : Array.from({ length: Math.max(1, r || 3, it.length) }, (_, i) => c.map((_, j) => j === 0 && it[i] ? it[i] : ''))).map(f => '<tr>' + c.map((_, j) => `<td${j === 0 && c.length > 2 && (f[0] || '').length < 40 && !(d && d.length) && it.length ? ' class="c1"' : !(d && d.length) && !it.length && (r || 3) <= 1 ? ' class="alto"' : ''}>${e2(f[j] || '')}</td>`).join('') + '</tr>').join('')}</table>`;
    const lineas = (k, f) => (f ? `<div class="ln f">${e2(f)}</div>` : '') + '<div class="ln"></div>'.repeat(Math.max(f ? k - 1 : k, f ? 0 : 1));
    let a0 = 0, nq = 0;
    (fx.s || []).forEach(x => {
      if (x.a && x.a !== a0) { a0 = x.a; const ac = A[x.a - 1]; P.push(`<h3>Actividad ${x.a}${ac ? ': ' + e2(ac.title) : ''}${ac && /group|grupo/.test(ac.mode) ? ' <small>(en equipo)</small>' : ac && /pair|pareja/.test(ac.mode) ? ' <small>(en pareja)</small>' : ''}</h3>`); }
      const num = fx.nn ? '' : `<b>${++nq}.</b> `, hp = x.hp ? `<small class="hp">${e2(x.hp)}</small>` : '';
      if (x.k === 'texto') P.push(`<div class="tx">${x.h ? `<h4>${e2(x.h)}</h4>` : ''}${String(x.t || '').split('\n').map(p => `<p>${e2(p)}</p>`).join('')}</div>`);
      else if (x.k === 'lista') P.push(`<div class="tx">${x.h ? `<h4>${e2(x.h)}</h4>` : ''}${x.t ? `<p>${e2(x.t)}</p>` : ''}<ul>${(x.it || []).map(t => `<li>${e2(t)}</li>`).join('')}</ul></div>`);
      else if (x.k === 'datos') P.push(`<div class="q">${x.h ? `<h4>${e2(x.h)}</h4>` : ''}${x.t ? `<p class="qt">${e2(x.t)}</p>` : ''}${tabla(x.c || [], 0, [], x.d)}</div>`);
      else if (x.k === 'tabla') P.push(`<div class="q"><p class="qt">${num}${e2(x.t || x.h)}</p>${hp}${x.c && x.c.length ? tabla(x.c, x.r, x.it || [], x.d) : ''}</div>`);
      else if (x.k === 'cuad') P.push(`<div class="q"><p class="qt">${num}${e2(x.t)}</p>${hp}<div class="cu"></div></div>`);
      else P.push(`<div class="q"><p class="qt">${num}${e2(x.t || x.h)}</p>${hp}${x.op && x.op.length ? `<div class="op">${x.op.map(o => `<span>☐ ${e2(o)}</span>`).join('')}</div>` : ''}${x.op && x.op.length && !x.ln ? '' : lineas(x.ln || 1, x.f)}</div>`);
    });
    if (fx.sb) P.push(`<div class="sb"><b>¿Sabías que…?</b> ${e2(String(fx.sb).replace(/^\s*¿?\s*sab[ií]as\s+que\s*(…|\.\.\.)?\s*/i, ''))}</div>`);
    return P.join('');
  }
  const CSS_FICHA = `

      * { box-sizing: border-box; } html, body { margin: 0; } body { font: 9.6pt/1.3 Arial, Helvetica, sans-serif; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .cab { display: grid; grid-template-columns: auto 1fr auto; gap: 0; border: .4mm solid #000; font-size: 8.6pt; } .cab div { padding: 1.2mm 2mm; border-right: .3mm solid #000; } .cab div:last-child { border-right: 0; }
      h1 { font-size: 15pt; text-align: center; margin: 0 0 .5mm; text-transform: uppercase; letter-spacing: .3px; } .sub { text-align: center; font-style: italic; margin: 0 0 2mm; font-size: 9pt; }
      .dat { display: flex; gap: 4mm; font-size: 9pt; margin: 0 0 2mm; } .dat span { flex: 1; border-bottom: .3mm solid #000; }
      .meta { border: .3mm solid #000; padding: 1.5mm 2.5mm; font-size: 8.8pt; margin-bottom: 1.5mm; } .meta ul { margin: .5mm 0 0; padding-left: 5mm; } .meta li { margin: 0; }
      h3 { font-size: 10pt; margin: 2.5mm 0 1.2mm; padding: .3mm 0 .3mm 2mm; background: none; border-left: 1.2mm solid #000; border-bottom: .3mm solid #000; break-after: avoid; } h3 small { font-weight: 400; }
      h4 { margin: 1.5mm 0 .6mm; font-size: 9.8pt; break-after: avoid; }
      .tx p { margin: 0 0 1mm; text-align: justify; } .tx ul { margin: .5mm 0 1mm; padding-left: 5mm; } .tx li { margin: 0; }
      .q { margin: 1.6mm 0; break-inside: avoid; } .qt { margin: 0 0 .6mm; font-weight: 700; } .hp { display: block; color: #333; font-size: 8.3pt; font-style: italic; margin: -.3mm 0 .6mm; }
      .ln { height: 6.2mm; border-bottom: .25mm solid #777; } .ln.f { height: auto; min-height: 6.2mm; padding-top: 1mm; font-size: 9pt; color: #222; line-height: 1.9; }
      .t { width: 100%; border-collapse: collapse; margin-top: .6mm; } .t th, .t td { border: .25mm solid #000; padding: .6mm 1.4mm; height: 6.6mm; font-size: 8.8pt; vertical-align: top; text-align: left; } .t th { background: none; font-weight: 700; } .t td.c1 { font-weight: 700; width: 30%; } .t td.alto { height: 15mm; }
      .op { display: flex; flex-wrap: wrap; gap: 1mm 7mm; margin: .6mm 0; }
      .cu { height: 55mm; border: .3mm solid #000; background-image: linear-gradient(#999 .15mm, transparent .15mm), linear-gradient(90deg, #999 .15mm, transparent .15mm); background-size: 5mm 5mm; }
      .sb { margin: 2mm 0; padding: 1.2mm 2.5mm; border: .3mm dashed #000; font-size: 8.6pt; break-inside: avoid; }
      .cierre { break-inside: avoid; margin-top: 2.5mm; } .cc { width: 100%; border-collapse: collapse; } .cc td, .cc th { border: .25mm solid #000; padding: .7mm 2mm; font-size: 8.6pt; } .cc th { width: 17mm; background: none; } .cc td.bx { width: 17mm; } .cc { margin-bottom: 1.5mm; }
      .exit { display: flex; gap: 3mm; align-items: flex-start; margin-top: 2.5mm; padding: 1.5mm; border: .3mm dashed #000; break-inside: avoid; } .exit svg { width: 96mm; height: 90mm; flex: none; }
      .tq { flex: 1; font-size: 9.2pt; line-height: 1.25; } .tq-t { display: block; font-size: 10.5pt; margin-bottom: 1.2mm; } .tq-q { margin: 0 0 1.6mm; } .tq-q div { display: flex; flex-wrap: wrap; gap: .5mm 2.5mm; margin-top: .4mm; } .tq-q span { display: inline-flex; gap: .8mm; }
      .tq-q i { font-style: normal; font-weight: 700; display: inline-grid; place-items: center; width: 4mm; height: 4mm; border: .25mm solid #000; border-radius: 50%; font-size: 2.6mm; flex: none; }
      .caso { margin: 0 0 1.5mm; font-size: 9pt; } .caso .t td, .caso .t th { height: auto; padding: .4mm 1.2mm; font-size: 9pt; }
      .exit svg * { filter: grayscale(1); } .ayuda { padding: 3mm; background: #eee; font: 10pt Arial; } @media print { .ayuda { display: none; } }`;
  // la ficha completa (cual: 'ficha' = la de la sesión, con su cierre y su Exit ticket; 'tarea' = la tarea flipped sola)
  function fichaDoc(u, n, cual = 'ficha', conBoton = true) {
    const s = u.sessions[n - 1], fx = cual === 'tarea' ? s.tarea || (s.fx && s.fx.tarea) : s.fx; if (!fx) return '';
    const cr = (s.criteria || []).filter(x => String(x || '').trim()), hayT = cual === 'ficha' && MD.preguntas(s).length;
    const uni = `Unidad ${u.num}${u.title ? ': ' + u.title : ''}`, cabI = `Ciencia y Tecnología · 6.° grado · ${uni}`, cabD = `Sesión ${n}${cual === 'tarea' ? ' · Tarea flipped' : ''}`;
    const q = t => '"' + String(t).replace(/["\\]/g, '') + '"';
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${e2(`U${u.num} S${n} · ${fx.t || 'Ficha'}`)}</title><style>@page { size: A4; margin: 11mm 12mm 14mm 12mm;
        @bottom-left { content: ${q(cabI + ' · ' + cabD)}; font: 8pt Arial, sans-serif; color: #333; }
        @bottom-right { content: "Página " counter(page) " de " counter(pages); font: 8pt Arial, sans-serif; color: #333; } }${CSS_FICHA}</style></head><body>
      ${conBoton ? '<div class="ayuda">Imprime en A4, escala 100 %, blanco y negro. <button onclick="print()">Imprimir</button></div>' : ''}
      <h1>${e2(fx.t || s.title || 'Ficha de la sesión')}</h1>${fx.st ? `<p class="sub">${e2(fx.st)}</p>` : ''}
      ${fichaPrint(fx, cual === 'ficha' ? s : null)}
      ${hayT ? `<div class="exit">${svgTarjeta(u, n, s)}${preguntasHtml(u, n, s)}</div>` : ''}
      </body></html>`;
  }
  function imprimirFicha(u, n, cual = 'ficha') {
    const s = u.sessions[n - 1]; if (!s || !(cual === 'tarea' ? s.tarea : s.fx)) return alert('Esta sesión no tiene ficha.');
    const w = window.open('', '_blank'); if (!w) return alert('Permite las ventanas emergentes para imprimir la ficha.');
    w.document.write(fichaDoc(u, n, cual).replace('</body>', '<script>setTimeout(() => print(), 700)<\/script></body>')); w.document.close();
  }
  window.Tarjetas = { elementos, svgTarjeta, preguntasHtml, imprimir, imprimirFicha, fichaDoc, bits };
})();
