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
    return `<div class="tq"><b class="tq-t">U${esc(u.num)} S${n} · Exit ticket</b>${qs.map((q, i) => `<div class="tq-q"><b>${i + 1}. ${esc(q.q)}</b><div>${q.opts.map((o, k) => `<span><i>${LETRA[k]}</i>${esc(o.t)}</span>`).join('')}</div></div>`).join('')}</div>`;
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
      .tq { width: 128mm; padding: 2mm; font-size: 3.3mm; } .tq-t { display: block; font-size: 4mm; margin-bottom: 2mm; } .tq-q { margin: 0 0 2.4mm; } .tq-q div { display: flex; flex-wrap: wrap; gap: 1mm 4mm; margin-top: 1mm; }
      .tq-q span { display: inline-flex; align-items: center; gap: 1.2mm; } .tq-q i { font-style: normal; font-weight: 700; width: 4mm; height: 4mm; border: .25mm solid #333; border-radius: 50%; display: inline-grid; place-items: center; font-size: 2.6mm; }
      .ayuda { padding: 6mm; font-size: 4mm; } @media print { .ayuda { display: none; } }
    </style></head><body><div class="ayuda">🖨️ Imprime en A4 horizontal, a doble cara (voltear por el borde corto). Escala 100 %. <button onclick="print()">Imprimir</button></div>
      <div class="hoja">${[0, 1, 2, 3].map(() => cel(t)).join('')}</div><div class="hoja">${[0, 1, 2, 3].map(() => cel(p)).join('')}</div>
      <script>setTimeout(() => print(), 600)<\/script></body></html>`);
    w.document.close();
  }
  window.Tarjetas = { elementos, svgTarjeta, preguntasHtml, imprimir, bits };
})();
