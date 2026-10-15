// ===================================================================
//  MOLÍ 2 · 📷 ESCANEAR (docente): lee las tarjetas de Exit ticket en papel con la cámara, igual que Molí 1
//  (las mismas tarjetas impresas: 4 cuadraditos en las esquinas, código de la sesión, 3 últimos del DNI,
//  respuestas, participación, conducta y sección). Guarda la nota, la participación y la conducta.
// ===================================================================
(function () {
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // ---- la tarjeta (en mm), tal como la imprime Molí ----
  const Li = { W: 96, H: 90, fid: [[5, 5], [91, 5], [5, 85], [91, 85]],
    code: { pts: [[11.2, 9.2], [14.1, 9.2], [17.0, 9.2], [19.9, 9.2], [22.8, 9.2], [25.7, 9.2], [11.2, 12.1], [14.1, 12.1], [17.0, 12.1], [19.9, 12.1], [22.8, 12.1], [25.7, 12.1], [11.2, 15.0], [14.1, 15.0], [17.0, 15.0], [19.9, 15.0], [22.8, 15.0], [25.7, 15.0]], n: 18, s: 2.4 },
    dni: { x0: 17.5, dx: 10, y0: 34.4, dy: 5.6, r: 2.6, n: 3 }, ans: { x0: 60.5, dx: 7.6, y0: 38.6, dy: 7, dyf: e => e > 6 ? 6 : 7, r: 3, max: 8 },
    cls: { x0: 57.9, dx: 7.6, y: 85.9, r: 2.5, max: 6, k: ['+4', '3', '2', '1'], par: 1 }, cond: { x0: 57.9, dx: 7.6, y: 77, r: 2.5, max: 5, k: ['AD', 'A', 'B', 'C'], face: 1 },
    sec: { x0: 57.5, dx: 8, y: 26.6, r: 3, k: ['A', 'B', 'C', 'D'] }, paper: [[47, 40], [47, 60], [47, 80], [30, 88.6]] };
  const LiM = { code: { y: 85, x0: 13, dx: 4.4, n: 17, s: 3.2 }, dni: { x0: 19.1, dx: 10, y0: 24.6, dy: 5.8, r: 2.55, n: 3 }, ans: { x0: 63.5, dx: 7.6, y0: 30.2, dy: 6.8, r: 3, max: 8 },
    cls: { x0: 63.5, dx: 7.6, y: 76.6, r: 2.6, max: 6, k: ['AD', 'A', 'B', 'C'] }, cond: { x0: 63.5, dx: 7.6, y: 67.4, r: 2.6, max: 5, k: ['AD', 'A', 'B', 'C'] }, sec: { x0: 63.5, dx: 7.6, y: 20.2, r: 2.7, k: ['A', 'B', 'C', 'D'] } };
  const LiO = { code: { y: 85, x0: 17, dx: 5, n: 13, s: 3.4 }, dni: { x0: 19.1, dx: 10, y0: 25.5, dy: 5.6, r: 2.5, n: 3 }, ans: { x0: 63.5, dx: 7.6, y0: 27, dy: 6.8, r: 2.6, max: 8 },
    cls: { x0: 63.5, dx: 7.6, y: 72.4, r: 2.6, max: 6, k: ['AD', 'A', 'B', 'C'] }, cond: { x0: 63.5, dx: 7.6, y: 63.9, r: 2.4, max: 5, k: ['AD', 'A', 'B', 'C'] } };
  const SL = { AD: 4, A: 3, B: 2, C: 1 }, CONDN = { AD: '😄 Muy bueno', A: '🙂 Bueno', B: '😐 Intermedio', C: '😢 Por mejorar' };

  // ---- busca un cuadradito negro (esquina) cerca de (cx, cy) ----
  function fiducial(px, W, H, cx, cy, rad, tam) {
    const x0 = Math.max(0, Math.round(cx - rad)), y0 = Math.max(0, Math.round(cy - rad)), w = Math.min(W, Math.round(cx + rad)) - x0, h = Math.min(H, Math.round(cy + rad)) - y0;
    if (w < 12 || h < 12) return null;
    const g = new Uint8Array(w * h), hist = new Uint32Array(256);
    for (let y = 0; y < h; y++) { let s = 4 * ((y0 + y) * W + x0); for (let x = 0; x < w; x++, s += 4) { const v = 77 * px[s] + 150 * px[s + 1] + 29 * px[s + 2] >> 8; g[y * w + x] = v; hist[v]++; } }
    const N = w * h; let tot = 0; for (let i = 0; i < 256; i++) tot += i * hist[i];
    let sB = 0, wB = 0, best = -1, th = 0;
    for (let i = 0; i < 256; i++) { wB += hist[i]; if (!wB) continue; const wF = N - wB; if (!wF) break; sB += i * hist[i]; const mB = sB / wB, mF = (tot - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if (v > best) { best = v; th = i; } }
    let s0 = 0, n0 = 0, s1 = 0, n1 = 0; for (let i = 0; i < 256; i++) if (i <= th) { s0 += i * hist[i]; n0 += hist[i]; } else { s1 += i * hist[i]; n1 += hist[i]; }
    if (!n0 || !n1 || s1 / n1 - s0 / n0 < 45) return null;
    const lab = new Int32Array(N), st = new Int32Array(N); let L = 0, mejor = null, pun = 0;
    const amin = (.45 * tam) ** 2, amax = (2.3 * tam) ** 2;
    for (let e = 0; e < N; e++) {
      if (lab[e] || g[e] > th) continue; L++;
      let sp = 0, a = 0, sx = 0, sy = 0, mx = w, my = h, Mx = 0, My = 0, borde = false;
      for (st[sp++] = e, lab[e] = L; sp;) {
        const q = st[--sp], x = q % w, y = (q - x) / w; a++; sx += x; sy += y; if (x < mx) mx = x; if (x > Mx) Mx = x; if (y < my) my = y; if (y > My) My = y;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) borde = true;
        if (x > 0 && !lab[q - 1] && g[q - 1] <= th) { lab[q - 1] = L; st[sp++] = q - 1; }
        if (x < w - 1 && !lab[q + 1] && g[q + 1] <= th) { lab[q + 1] = L; st[sp++] = q + 1; }
        if (y > 0 && !lab[q - w] && g[q - w] <= th) { lab[q - w] = L; st[sp++] = q - w; }
        if (y < h - 1 && !lab[q + w] && g[q + w] <= th) { lab[q + w] = L; st[sp++] = q + w; }
      }
      if (borde || a < amin || a > amax) continue;
      const bw = Mx - mx + 1, bh = My - my + 1, ar = bw / bh; if (ar < .6 || ar > 1.65 || a / (bw * bh) < .62) continue;
      const fx = x0 + sx / a, fy = y0 + sy / a, sc = a * (1 - .6 * Math.min(1, Math.hypot(fx - cx, fy - cy) / rad));
      if (sc > pun) { pun = sc; mejor = [fx, fy, Math.sqrt(a)]; }
    }
    return mejor;
  }
  // ---- homografía: de mm de la tarjeta a píxeles ----
  function homografia(src, dst) {
    const A = [], b = [];
    for (let k = 0; k < 4; k++) { const [x, y] = src[k], [u, v] = dst[k]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v); }
    const n = b.length, M = A.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; if (Math.abs(M[p][c]) < 1e-9) return null; [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < n; r++) { if (r === c) continue; const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } }
    const h = M.map((r, i) => r[n] / r[i]);
    return (x, y) => { const d = h[6] * x + h[7] * y + 1; return [(h[0] * x + h[1] * y + h[2]) / d, (h[3] * x + h[4] * y + h[5]) / d]; };
  }
  // ---- lee la tarjeta de una imagen ----
  function leer(img, guia, opcionesDe) {
    const { data: px, width: W, height: H } = img, kx = guia.w / Li.W, ky = guia.h / Li.H, tam = 6 * (kx + ky) / 2, F = [];
    for (const [x, y] of Li.fid) { const f = fiducial(px, W, H, guia.x + x * kx, guia.y + y * ky, .2 * guia.w, tam); if (!f) return { found: false }; F.push(f); }
    const [a, b, c, d] = F, D = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]), top = D(a, b), bot = D(c, d), izq = D(a, c), der = D(b, d);
    if (top / bot < .6 || top / bot > 1.65 || izq / der < .6 || izq / der > 1.65) return { found: false };
    const rel = (top + bot) / (izq + der) * (80 / 86); if (rel < .65 || rel > 1.5) return { found: false };
    const pts = F.map(p => [p[0], p[1]]);
    const prueba = esquinas => {
      const map = homografia(Li.fid, esquinas); if (!map) return null;
      const gris = (x, y, r) => { const [u, v] = map(x, y), [u2, v2] = map(x + r, y), R = Math.max(1.2, Math.hypot(u2 - u, v2 - v)); let s = 0, n = 0;
        for (let yy = Math.floor(v - R); yy <= v + R; yy++) for (let xx = Math.floor(u - R); xx <= u + R; xx++) { if (xx < 0 || yy < 0 || xx >= W || yy >= H || (xx - u) ** 2 + (yy - v) ** 2 > R * R) continue; const i = 4 * (yy * W + xx); s += 77 * px[i] + 150 * px[i + 1] + 29 * px[i + 2] >> 8; n++; }
        return n ? s / n : 255; };
      const med = v => { const t = [...v].sort((p, q) => p - q), m = t.length >> 1; return t.length % 2 ? t[m] : (t[m - 1] + t[m]) / 2; };
      const papel = med(Li.paper.map(([x, y]) => gris(x, y, 1.3))); if (papel < 40) return null;
      const bits = L => (L.pts || Array.from({ length: L.n }, (_, i) => [L.x0 + i * L.dx, L.y])).map(([x, y]) => 1 - gris(x, y, 1.1 * (L.s || 3.2) / 3.2) / papel > .3 ? 1 : 0);
      const d17 = e => { if (e[0] !== 1 || e[16] !== 0) return null; const num = e.slice(1, 5).reduce((s, v) => 2 * s + v, 0), n = e.slice(5, 10).reduce((s, v) => 2 * s + v, 0), ar = e.slice(10, 14).reduce((s, v) => 2 * s + v, 0), ck = 2 * e[14] + e[15];
        return num >= 1 && n >= 1 && ck === (7 * num + 3 * n + 5 * ar) % 4 ? { num, n, area: ar } : null; };
      const g18 = bits(Li.code);
      const code = (g18[17] === 1 ? d17(g18) : null) || (() => { const e = d17(bits(LiM.code)); return e && { ...e, mid: 1 }; })() || (e => { if (e[0] !== 1 || e[12] !== 0) return null;
        const num = e.slice(1, 5).reduce((s, v) => 2 * s + v, 0), n = e.slice(5, 10).reduce((s, v) => 2 * s + v, 0), ck = 2 * e[10] + e[11]; return num >= 1 && n >= 1 && ck === (7 * num + 3 * n) % 4 ? { num, n, old: 1 } : null; })(bits(LiO.code));
      if (!code) return null;
      const LL = code.old ? LiO : code.mid ? LiM : Li;
      const marca = (v, ref) => { const a = v.map(x => 1 - x / Math.max(ref, 1)).map((x, i) => [x, i]).sort((p, q) => q[0] - p[0]); return a[0][0] < .25 ? -1 : a.length > 1 && a[1][0] >= .25 && a[0][0] - a[1][0] < .18 ? -2 : a[0][1]; };
      const dni = []; for (let c = 0; c < LL.dni.n; c++) { const v = Array.from({ length: 10 }, (_, k) => gris(LL.dni.x0 + c * LL.dni.dx, LL.dni.y0 + k * LL.dni.dy, .6 * LL.dni.r)); dni.push(marca(v, med(v))); }
      const nOp = opcionesDe(code), A = LL.ans;
      const marks = (nOp || []).map((n, q) => { const v = Array.from({ length: n }, (_, k) => gris(A.x0 + k * A.dx, A.y0 + q * (A.dyf ? A.dyf(nOp.length) : A.dy), .6 * A.r)); return marca(v, Math.max(...v, .9 * papel)); });
      const C = LL.cls, gv = nOp && nOp.length <= C.max ? C.k.map((_, k) => gris(C.x0 + k * C.dx, C.y, .6 * C.r)) : null;
      const Q = LL.cond, cv = nOp && nOp.length <= Q.max ? Q.k.map((_, k) => gris(Q.x0 + k * Q.dx, Q.y, .6 * Q.r)) : null;
      const sv = LL.sec ? LL.sec.k.map((_, k) => gris(LL.sec.x0 + k * LL.sec.dx, LL.sec.y, .6 * LL.sec.r)) : null;
      return { code, dni, marks, grade: gv ? marca(gv, Math.max(...gv, .9 * papel)) : -1, cond: cv ? marca(cv, Math.max(...cv, .9 * papel)) : -1, sec: sv ? marca(sv, Math.max(...sv, .9 * papel)) : -1, map, L: LL };
    };
    const r = prueba(pts) || prueba([pts[3], pts[2], pts[1], pts[0]]);
    return r ? { found: true, pts, ...r } : { found: true, pts, bad: true };
  }
  // ---- qué sesión es (por el número de unidad y de sesión) ----
  const numU = u => { const t = parseInt(u.num, 10); return t >= 1 && t <= 15 ? t : 0; };
  function sesionDe(code) { const c = MD.contenido(); const u = c && c.units.find(x => numU(x) === code.num), s = u && u.sessions[code.n - 1], qs = s ? MD.preguntas(s).slice(0, Li.ans.max) : []; return qs.length ? { u, s, n: code.n, qs } : null; }
  const guiaDe = (w, h) => { const ar = Li.W / Li.H; let gw = .86, gh = gw * w / ar / h; if (gh > .86) { gh = .86; gw = gh * h * ar / w; } return { x: (1 - gw) / 2, y: (1 - gh) / 2, w: gw, h: gh }; };

  // =================================================================
  //  la ventanita del escáner
  // =================================================================
  let S = null;
  function parar() { if (!S) return; clearTimeout(S.t); S.vivo = false; S.stream && S.stream.getTracks().forEach(t => t.stop()); S = null; }
  async function abrir() {
    parar(); await MD.cargar().catch(() => {});
    const b = Herramientas.abrir('📷 Escanear Exit tickets', 'Encaja cada tarjeta en el recuadro con buena luz: se lee y se guarda sola.', 'curiosa', `
      <div class="sc-cam"><video playsinline muted autoplay></video><canvas aria-hidden="true"></canvas><div class="sc-guia"><i></i><i></i><i></i><i></i></div><div class="sc-msg">Abriendo la cámara…</div></div>
      <div class="sc-ult"></div><div class="sc-lista"></div>
      <details class="hp-mas"><summary>ℹ️ ¿Cómo se usa?</summary><p class="hp-tip">Usa las mismas tarjetas de Molí (al final de cada ficha o «Descargar tarjetas»). Cada estudiante pinta los 3 últimos números de su DNI y una letra por pregunta; tú marcas su participación y conducta. Encaja la tarjeta en el recuadro: se guarda su nota, su participación y su conducta.</p></details>`, true);
    Herramientas.cerrarActual = parar;
    const st = S = { vivo: true, prev: '', busy: false, lista: [], b, roster: null };
    const msg = t => { const m = b.querySelector('.sc-msg'); if (m && m.textContent !== t) m.textContent = t; };
    try { st.roster = await Docente.estudiantes(); } catch (e) { msg(e.message === 'AUTH' ? '🔐 Conecta tu cuenta de docente para usar el escáner.' : '📶 No se pudo cargar la lista de estudiantes.'); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return msg('📷 Este equipo no tiene cámara disponible.');
    try { st.stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } }); }
    catch (e) { return msg(e.name === 'NotAllowedError' ? '📷 Diste «No permitir» a la cámara. Actívala en el candado de la barra de direcciones.' : '📷 No se pudo abrir la cámara.'); }
    if (S !== st) { st.stream.getTracks().forEach(t => t.stop()); return; }
    const v = b.querySelector('video'), cam = b.querySelector('.sc-cam'), gEl = b.querySelector('.sc-guia'), over = b.querySelector('canvas');
    v.srcObject = st.stream; v.play().catch(() => {});
    const listo = () => { cam.style.aspectRatio = `${v.videoWidth} / ${v.videoHeight}`; const g = guiaDe(v.videoWidth, v.videoHeight); Object.assign(gEl.style, { left: g.x * 100 + '%', top: g.y * 100 + '%', width: g.w * 100 + '%', height: g.h * 100 + '%' }); msg('Encaja la tarjeta en el recuadro'); ciclo(); };
    v.readyState >= 1 ? listo() : v.addEventListener('loadedmetadata', listo, { once: true });
    function ciclo() { if (!st.vivo) return; st.t = setTimeout(() => { cuadro(); ciclo(); }, st.busy ? 400 : 140); }
    function cuadro() {
      if (st.busy || !v.videoWidth || v.readyState < 2) return;
      const k = 960 / Math.max(v.videoWidth, v.videoHeight), w = Math.round(v.videoWidth * Math.min(1, k)), h = Math.round(v.videoHeight * Math.min(1, k));
      if (!st.cv) { st.cv = document.createElement('canvas'); st.cx = st.cv.getContext('2d', { willReadFrequently: true }); }
      if (st.cv.width !== w) { st.cv.width = w; st.cv.height = h; } st.cx.drawImage(v, 0, 0, w, h);
      const g = guiaDe(w, h), r = leer(st.cx.getImageData(0, 0, w, h), { x: g.x * w, y: g.y * h, w: g.w * w, h: g.h * h }, code => { const x = sesionDe(code); return x ? x.qs.map(q => q.opts.length) : null; });
      dibujar(r, w, h); decidir(r);
    }
    function dibujar(r, w, h) {
      if (over.width !== w) { over.width = w; over.height = h; } const c = over.getContext('2d'); c.clearRect(0, 0, w, h); if (!r.found) return;
      const [p0, p1, p2, p3] = r.pts; c.lineWidth = Math.max(3, w / 200); c.strokeStyle = r.bad ? '#f5b400' : '#22c55e'; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.lineTo(p3[0], p3[1]); c.lineTo(p2[0], p2[1]); c.closePath(); c.stroke();
      if (!r.map) return; c.fillStyle = 'rgba(34,197,94,.75)'; const L = r.L || Li, N = r.marks.length, pto = (x, y) => { const [u, q] = r.map(x, y); c.beginPath(); c.arc(u, q, w / 160, 0, 7); c.fill(); };
      r.dni.forEach((k, i) => k >= 0 && pto(L.dni.x0 + i * L.dni.dx, L.dni.y0 + k * L.dni.dy)); r.marks.forEach((k, i) => k >= 0 && pto(L.ans.x0 + k * L.ans.dx, L.ans.y0 + i * (L.ans.dyf ? L.ans.dyf(N) : L.ans.dy)));
      if (r.grade >= 0) pto(L.cls.x0 + r.grade * L.cls.dx, L.cls.y); if (r.cond >= 0) pto(L.cond.x0 + r.cond * L.cond.dx, L.cond.y);
    }
    async function decidir(r) {
      if (!r.found) { st.prev = ''; return msg('Encaja la tarjeta en el recuadro'); }
      if (r.bad || !r.code) { st.prev = ''; return msg('Acerca un poco más y evita sombras'); }
      if (r.code.area != null && r.code.area !== 0) { st.prev = ''; return msg('Esta tarjeta es de otra área (no se guardó aquí)'); }
      const x = sesionDe(r.code); if (!x) { st.prev = ''; return msg(`La Unidad ${r.code.num} · Sesión ${r.code.n} no tiene Exit ticket`); }
      const fal = r.dni.findIndex(e => e < 0); if (fal >= 0) { st.prev = ''; return msg(r.dni[fal] === -2 ? `Últimos 3 del DNI: la columna ${fal + 1} tiene dos números pintados` : `Últimos 3 del DNI: falta pintar la columna ${fal + 1}`); }
      const firma = `${r.code.num}|${r.code.n}|${r.dni.join('')}|${r.marks.join(',')}|${r.grade}|${r.cond}|${r.sec}`;
      if (firma !== st.prev) { st.prev = firma; return msg('Leyendo… no muevas la tarjeta'); }   // se guarda cuando 2 lecturas seguidas coinciden
      st.prev = ''; st.busy = true;
      const tres = r.dni.join(''), secL = r.sec >= 0 ? Li.sec.k[r.sec] : '', busca = () => st.roster.filter(e => String(e.dni || '').replace(/\D/g, '').endsWith(tres));
      let c0 = busca(); if (!c0.length && !st.fresco) { st.fresco = true; try { st.roster = await Docente.estudiantes(true); } catch (z) {} c0 = busca(); }   // no lo encontró: vuelve a pedir la lista (por si estaba vieja) y busca otra vez
      const cand = secL && c0.some(e => e.section === secL) ? c0.filter(e => e.section === secL) : c0;
      const e = cand.length > 1 ? await elegir(cand, tres) : cand[0];
      if (S !== st) return;
      const fin = (it, ms = 2200) => { st.ult = it; if (it.kind !== 'warn') st.lista.unshift(it); pintaLista(); try { navigator.vibrate && navigator.vibrate(it.kind === 'ok' ? 90 : [60, 60, 60]); } catch (z) {}
        msg(it.kind === 'ok' ? '¡Guardado! Pasa la siguiente tarjeta' : it.kind === 'dup' ? 'Ya tenía nota · pasa la siguiente' : 'Revisa la tarjeta'); setTimeout(() => { if (S === st) { st.busy = false; msg('Encaja la tarjeta en el recuadro'); } }, ms); };
      if (!e) return fin({ kind: 'warn', name: `DNI terminado en ${tres}`, info: cand.length > 1 ? 'No elegiste a nadie.' : `Ningún estudiante tiene un DNI que termine en ${tres}.` }, 3200);
      if (st.lista.some(z => z.key === e.key && z.sk === `${x.u.key}|${x.n}`)) { st.busy = false; return msg('Esta tarjeta ya se guardó ✅ Pasa a la siguiente'); }
      msg('Guardando…');
      const ans = x.qs.map((q, i) => { const m = r.marks[i]; return m >= 0 && !!q.opts[m] && q.opts[m].i === q.answer; }), score = ans.filter(Boolean).length, total = x.qs.length;
      let extra = '';
      if (r.grade === -2) extra += ' · ⚠️ Participación: dos marcas (no se guardó)';
      else if (r.grade >= 0) { const L = r.L || Li, v = L.cls.par ? 4 - r.grade : SL[L.cls.k[r.grade]];
        try { await Docente.guardarNota(x.u, 30 + x.n, e, v); extra += ` · Participación: ${v === 4 ? '+4' : v}`; } catch (z) { extra += ' · ⚠️ No se pudo guardar la participación'; } }
      if (r.cond === -2) extra += ' · ⚠️ Conducta: dos notas (no se guardó)';
      else if (r.cond >= 0) { const L = r.L || Li, k = L.cond.k[r.cond];
        try { await Docente.guardarNota(x.u, 60 + x.n, e, SL[k]); extra += ` · Conducta: ${CONDN[k]}`; } catch (z) { extra += ' · ⚠️ No se pudo guardar la conducta'; } }
      let res;
      try { res = await Docente.crearTicket(x.u, x.n, e, ans); } catch (z) { return fin({ kind: 'warn', name: e.name, info: '📶 No se pudo guardar. Vuelve a pasar la tarjeta.' }, 3000); }
      const base = { key: e.key, name: e.name, sk: `${x.u.key}|${x.n}` };
      if (res === 'dup') return fin({ kind: 'dup', ...base, info: `6° ${e.section} · U${x.u.num} S${x.n} · ya tenía este Exit ticket (no se cambió)${extra}` });
      fin({ kind: 'ok', ...base, info: `6° ${e.section} · U${x.u.num} S${x.n} · nota guardada${extra}`, score: `${score}/${total}` });
    }
    function elegir(L, tres) { return new Promise(res => { const d = document.createElement('div'); d.className = 'sc-pick';
      d.innerHTML = `<p><b>Hay ${L.length} estudiantes con DNI terminado en ${esc(tres)}.</b> ¿De quién es esta tarjeta?</p>${L.map((e, i) => `<button data-k="${i}">${esc(e.name)} · 6° ${esc(e.section)}</button>`).join('')}<button data-k="-1">Ninguno</button>`;
      d.addEventListener('click', ev => { const k = ev.target.closest('[data-k]'); if (!k) return; ev.stopPropagation(); d.remove(); res(L[+k.dataset.k] || null); });
      b.querySelector('.sc-ult').before(d); }); }
    function pintaLista() {
      const u = st.ult; b.querySelector('.sc-ult').innerHTML = u ? `<div class="sc-row ${u.kind}"><span>${u.kind === 'ok' ? '✅' : u.kind === 'dup' ? '📌' : '⚠️'}</span><div><b>${esc(u.name)}</b><small>${esc(u.info)}</small></div>${u.score ? `<strong>${esc(u.score)}</strong>` : ''}</div>` : '';
      b.querySelector('.sc-lista').innerHTML = st.lista.length ? `<b>Guardadas ahora (${st.lista.length})</b>` + st.lista.map(z => `<div class="sc-row ${z.kind}"><span>${z.kind === 'ok' ? '✅' : '📌'}</span><div><b>${esc(z.name)}</b><small>${esc(z.info)}</small></div><em>${esc(z.score || '')}</em></div>`).join('') : '';
    }
  }
  Herramientas.extra.escanear = abrir;
  window.Escaner = { leer, Li, homografia };
})();
