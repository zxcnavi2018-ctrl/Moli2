// ===================================================================
//  MOLÍ 2 · ✏️ EDITAR AULA (sólo la docente)
//  Las mesas y sillas de los estudiantes (y lo que la docente agregue) son muebles que se pueden mover,
//  girar, duplicar, pintar o quitar. Cámara libre y vista de plano. Distribuciones rápidas.
//  Se guarda en Firebase (files/faula-0, igual que los archivos de Molí: no hay que cambiar las reglas)
//  y todos los estudiantes ven el aula como la dejó su profe.
// ===================================================================
(function () {
  if (typeof AULA0 === 'undefined' || !AULA0) return;
  const A0 = AULA0, FY = A0.fy, TAU = Math.PI * 2;
  const FILE = 'faula-0', LSK = 'moli2:aula:borrador';
  const COLORES = [0xff7a1a, 0x3b82f6, 0x22c55e, 0xef4444, 0xa855f7, 0xfacc15, 0xf1f5f9];
  const SILLA0 = 0xff7a1a;
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------------- geometrías (las mismas del aula) ----------------
  const rr = (w, d, r) => { const sh = new THREE.Shape(), x = -w / 2, y = -d / 2; sh.moveTo(x + r, y); sh.lineTo(x + w - r, y); sh.quadraticCurveTo(x + w, y, x + w, y + r); sh.lineTo(x + w, y + d - r); sh.quadraticCurveTo(x + w, y + d, x + w - r, y + d); sh.lineTo(x + r, y + d); sh.quadraticCurveTo(x, y + d, x, y + d - r); sh.lineTo(x, y + r); sh.quadraticCurveTo(x, y, x + r, y); return sh; };
  const seatG = new THREE.ExtrudeGeometry(rr(0.4, 0.38, 0.07), { depth: 0.018, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.008, bevelSegments: 2, curveSegments: 4 }); seatG.rotateX(-Math.PI / 2); seatG.translate(0, 0.445, 0);
  const bk = new THREE.Shape(), BR = 0.5, BA = 0.43; bk.absarc(0, 0, BR, -Math.PI / 2 - BA, -Math.PI / 2 + BA, false); bk.absarc(0, 0, BR - 0.02, -Math.PI / 2 + BA, -Math.PI / 2 - BA, true);
  const backG = new THREE.ExtrudeGeometry(bk, { depth: 0.24, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 1, curveSegments: 10 }); backG.rotateX(-Math.PI / 2); backG.translate(0, 0.6, -0.27);
  const tubeG = new THREE.CylinderGeometry(0.012, 0.012, 1, 8), footG = new THREE.CylinderGeometry(0.017, 0.017, 0.02, 10), legG = new THREE.CylinderGeometry(0.016, 0.014, 1, 10), boxG = new THREE.BoxGeometry(1, 1, 1);
  const up = new THREE.Vector3(0, 1, 0), V = (x, y, z) => new THREE.Vector3(x, y, z);
  const seg = (a, b) => { const d = new THREE.Vector3().subVectors(b, a); return new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(up, d.clone().normalize()), V(1, d.length(), 1)); };
  const TUBOS = [], PIES = [];
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([i, j]) => { TUBOS.push(seg(V(0.165 * i, 0.44, 0.15 * j), V(0.19 * i, 0.012, 0.185 * j))); PIES.push(new THREE.Matrix4().makeTranslation(0.19 * i, 0.01, 0.185 * j)); });
  [-1, 1].forEach(i => { TUBOS.push(seg(V(0.165 * i, 0.43, -0.15), V(0.165 * i, 0.43, 0.15))); TUBOS.push(seg(V(0.14 * i, 0.44, 0.16), V(0.14 * i, 0.69, 0.235))); });

  // ---------------- piscinas de instancias (rápido en celular) ----------------
  const blanco = () => toon(0xffffff);
  const MAT = { plas: blanco(), metal: toon(0x8d939c), goma: toon(0x334155), lam: toon(0xffffff, { map: laminate }), gris: blanco() };
  const POOLS = [];
  function pool(geo, mat, cap, tinta) {
    const m = new THREE.InstancedMesh(geo, mat, cap); m.setColorAt(0, new THREE.Color(0xffffff)); m.count = 0; m.frustumCulled = false; m.userData.own = []; m.userData.mueble = true; scene.add(m);   // (el color se crea antes de vaciar: si no, queda sin espacio)
    if (tinta) { const k = new THREE.InstancedMesh(geo, geo.type === 'BoxGeometry' ? INK_BOX : INK_NRM, cap); k.instanceMatrix = m.instanceMatrix; k.count = 0; k.frustumCulled = false; scene.add(k); m.userData.ink = k; }
    POOLS.push(m); return m;
  }
  const PL = { seat: pool(seatG, MAT.plas, 400, true), back: pool(backG, MAT.plas, 400, true), tube: pool(tubeG, MAT.metal, 4000, true), foot: pool(footG, MAT.goma, 1600, true),
    top: pool(topGeo, MAT.lam, 480, false), rim: pool(hexGeo, MAT.gris, 480, true), frame: pool(boxG, MAT.gris, 480, true), leg: pool(legG, MAT.gris, 3000, true),
    mtop: pool(boxG, MAT.lam, 300, true), mbox: pool(boxG, MAT.gris, 600, true) };
  const tmpM = new THREE.Matrix4(), tmpM2 = new THREE.Matrix4(), col = new THREE.Color(), dum = new THREE.Object3D();
  const poner = (p, mtx, color, own) => { const i = p.count++; p.setMatrixAt(i, mtx); col.setHex(color); p.setColorAt(i, col); p.userData.own[i] = own; };
  const caja = (p, x, y, z, sx, sy, sz, rot, color, own) => { dum.position.set(x, y, z); dum.rotation.set(0, rot, 0); dum.scale.set(sx, sy, sz); dum.updateMatrix(); poner(p, dum.matrix, color, own); };
  const rot = (ox, oz, r) => [ox * Math.cos(r) + oz * Math.sin(r), -ox * Math.sin(r) + oz * Math.cos(r)];

  // ---------------- el aula como datos ----------------
  let items = JSON.parse(JSON.stringify(A0.items));
  const RADIO = { hex: 1.45, mesa: 0.85, pupitre: 0.55, silla: 0.3, planta: 0.35, estante: 0.6, cartel: 0.55, tacho: 0.25, alfombra: 1.1 };
  function asientos(it) {                                          // dónde van las sillas de cada mesa (x, z, giro)
    if (it.t === 'hex') return [0, 1, 2, 3, 4, 5].map(k => { const a = A0.a0 + (it.r || 0) + k * Math.PI / 3; return { x: it.x + Math.sin(a) * 1.05, z: it.z + Math.cos(a) * 1.05, yaw: a, k, d: 0.47 }; });
    const L = it.t === 'mesa' ? [[-0.32, 0.62], [0.32, 0.62]] : it.t === 'pupitre' ? [[0, 0.55]] : [];
    return L.map(([lx, lz], k) => { const [ox, oz] = rot(lx, lz, it.r || 0); return { x: it.x + ox, z: it.z + oz, yaw: it.r || 0, k, d: 0.4 }; });
  }
  function silla(x, z, yaw, color, own) {
    tmpM.makeRotationY(yaw).setPosition(x, FY, z); poner(PL.seat, tmpM, color, own); col.setHex(color).multiplyScalar(0.94); const i = PL.back.count++; PL.back.setMatrixAt(i, tmpM); PL.back.setColorAt(i, col); PL.back.userData.own[i] = own;
    TUBOS.forEach(t => poner(PL.tube, tmpM2.multiplyMatrices(tmpM, t), 0xffffff, own)); PIES.forEach(t => poner(PL.foot, tmpM2.multiplyMatrices(tmpM, t), 0xffffff, own));
  }
  const EXTRAS = new Map();                                        // objetos del catálogo (pocos): cada uno su grupito
  function extra(it, i) {
    let g = EXTRAS.get(it); const clave = it.t + '|' + (it.txt || '') + '|' + (it.c || '');
    if (!g || g.userData.clave !== clave) { if (g) { scene.remove(g); } g = armarExtra(it); g.userData.clave = clave; EXTRAS.set(it, g); scene.add(g); }
    g.position.set(it.x, FY, it.z); g.rotation.y = it.r || 0; g.traverse(o => { o.userData.own = { i, k: -1 }; });
  }
  function mesh(geo, mat, x, y, z, sx = 1, sy = 1, sz = 1) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); addInk(m); return m; }
  function armarExtra(it) {
    const g = new THREE.Group();
    if (it.t === 'planta') { g.add(mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.32, 16), toon(0xc2410c), 0, 0.16, 0)); const v = toon(0x16a34a), v2 = toon(0x22c55e);
      [[0, 0.55, 0, 0.2], [0.12, 0.47, 0.05, 0.15, 1], [-0.1, 0.5, -0.06, 0.16, 1], [0.02, 0.68, -0.04, 0.14]].forEach(([x, y, z, r, k]) => g.add(mesh(new THREE.SphereGeometry(r, 14, 10), k ? v2 : v, x, y, z))); }
    if (it.t === 'estante') { const mad = toon(0x9a6634); g.add(mesh(boxG, mad, 0, 0.6, 0, 1.0, 1.2, 0.34));
      const L = [0xef4444, 0x3b82f6, 0x22c55e, 0xf59e0b, 0xa855f7, 0x0ea5e9, 0xec4899];
      [0.33, 0.73].forEach((y, f) => { for (let k = 0; k < 7; k++) g.add(mesh(boxG, toon(L[(k + f * 3) % 7]), -0.38 + k * 0.12, y + 0.12, 0.13, 0.09, 0.24 + ((k * 7 + f) % 3) * 0.03, 0.2)); });
      [0.27, 0.67, 1.07].forEach(y => g.add(mesh(boxG, toon(0x7c4a20), 0, y, 0.17, 0.96, 0.03, 0.02))); }
    if (it.t === 'tacho') { g.add(mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.48, 18), toon(0x2563eb), 0, 0.24, 0)); g.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 18), toon(0x1d4ed8), 0, 0.49, 0)); }
    if (it.t === 'alfombra') { const m = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.02, 1.5), toon(it.c || 0x60a5fa)); m.position.y = 0.012; g.add(m);
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.022, 1.2), toon(0xffffff)); b.position.y = 0.013; b.material.color.setHex(it.c || 0x60a5fa).lerp(new THREE.Color(0xffffff), 0.45); g.add(b); }
    if (it.t === 'cartel') {
      const c = document.createElement('canvas'); c.width = 512; c.height = 360; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 512, 360); x.strokeStyle = '#2563eb'; x.lineWidth = 14; x.strokeRect(10, 10, 492, 340);
      x.fillStyle = '#1e3a8a'; x.textAlign = 'center'; x.textBaseline = 'middle'; const pal = String(it.txt || '¡Hola!').split(/\s+/), lin = []; let l = ''; x.font = 'bold 54px Trebuchet MS, sans-serif';
      pal.forEach(w => { const n = l ? l + ' ' + w : w; if (x.measureText(n).width > 440 && l) { lin.push(l); l = w; } else l = n; }); if (l) lin.push(l);
      lin.slice(0, 4).forEach((t, k, a) => x.fillText(t, 256, 180 + (k - (a.length - 1) / 2) * 64));
      const tx = new THREE.CanvasTexture(c), mad = toon(0x8b5a2b);
      const tab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.64, 0.03), [mad, mad, mad, mad, new THREE.MeshBasicMaterial({ map: tx }), mad]); tab.position.set(0, 1.15, 0); tab.rotation.x = -0.12; addInk(tab); g.add(tab);
      [[-0.32, 0.06], [0.32, 0.06], [0, -0.35]].forEach(([lx, lz]) => { const p = new THREE.Mesh(boxG, mad); p.scale.set(0.04, 1.35, 0.04); p.position.set(lx, 0.66, lz); p.rotation.x = lz < 0 ? 0.28 : -0.05; g.add(p); }); }
    return g;
  }
  function pintar() {
    POOLS.forEach(p => { p.count = 0; p.userData.own = []; });
    const vivos = new Set();
    items.forEach((it, i) => {
      const own = { i, k: -1 }, r = it.r || 0, cc = it.c || SILLA0;
      if (it.t === 'hex') {
        for (let k = 0; k < 6; k++) { const tb = k * Math.PI / 3 + Math.PI / 6, bx = Math.sin(tb), bz = Math.cos(tb);
          let [ox, oz] = rot(bx * 0.008, bz * 0.008, r); caja(PL.top, it.x + ox, FY + 0.725, it.z + oz, 0.84, 0.035, 0.84, k * Math.PI / 3 + r, 0xe9e7e1, own);
          [ox, oz] = rot(bx * 0.03, bz * 0.03, r); caja(PL.rim, it.x + ox, FY + 0.698, it.z + oz, 0.8, 0.022, 0.8, k * Math.PI / 3 + r, 0xb9c0c8, own);
          [ox, oz] = rot(bx * 0.39, bz * 0.39, r); caja(PL.frame, it.x + ox, FY + 0.665, it.z + oz, 0.36, 0.04, 0.36, k * Math.PI / 3 + Math.PI / 6 + r, 0x5b6470, own);
          for (const [rr2, tt] of [[0.9, 0.1], [0.9, Math.PI / 3 - 0.1], [0.42, 0.24], [0.42, Math.PI / 3 - 0.24]]) { const an = tt + k * Math.PI / 3; [ox, oz] = rot(bx * 0.025 + rr2 * 0.83 * Math.sin(an), bz * 0.025 + rr2 * 0.83 * Math.cos(an), r); caja(PL.leg, it.x + ox, FY + 0.34, it.z + oz, 1, 0.68, 1, 0, 0x8d939c, own); } }
      }
      if (it.t === 'mesa' || it.t === 'pupitre') { const w = it.t === 'mesa' ? 1.2 : 0.62, d = it.t === 'mesa' ? 0.6 : 0.48;
        caja(PL.mtop, it.x, FY + 0.72, it.z, w, 0.035, d, r, 0xe9e7e1, own); caja(PL.mbox, it.x, FY + 0.685, it.z, w - 0.08, 0.035, d - 0.08, r, 0x5b6470, own);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([i2, j]) => { const [ox, oz] = rot(i2 * (w / 2 - 0.06), j * (d / 2 - 0.06), r); caja(PL.leg, it.x + ox, FY + 0.34, it.z + oz, 1, 0.68, 1, 0, 0x8d939c, own); }); }
      if (it.s) asientos(it).forEach(a => { if (it.s[a.k]) silla(a.x, a.z, a.yaw, cc, { i, k: a.k }); });
      if (it.t === 'silla') silla(it.x, it.z, r, cc, own);
      if (['planta', 'estante', 'cartel', 'tacho', 'alfombra'].includes(it.t)) { extra(it, i); vivos.add(it); }
    });
    for (const [it, g] of EXTRAS) if (!vivos.has(it)) { scene.remove(g); EXTRAS.delete(it); }
    POOLS.forEach(p => { p.instanceMatrix.needsUpdate = true; if (p.instanceColor) p.instanceColor.needsUpdate = true; if (p.userData.ink) p.userData.ink.count = p.count; });
    cuaderno(); try { rayT = null; } catch (e) {}                     // Molí vuelve a mirar dónde hay muebles
    marcar();
  }
  // ---- el cuaderno del estudiante va en la mesa, frente a una silla ----
  function cuaderno() {
    const S = []; items.forEach(it => { if (it.s) asientos(it).forEach(a => { if (it.s[a.k]) S.push({ ...a, tx: it.x, tz: it.z }); }); });
    const F = FOCUS.mesa; if (!F || !F.nb || !S.length) return;
    const c = S[strHash((typeof ME !== 'undefined' && ME && (ME.key || ME.name)) || '6B') % S.length], o = [Math.sin(c.yaw), Math.cos(c.yaw)];
    const nx = c.x - o[0] * c.d, nz = c.z - o[1] * c.d; F.nb.position.set(nx, FY + 0.745, nz); F.nb.rotation.y = c.yaw;
    F.look.set(nx, FY + 0.74, nz); F.from.set(c.x + o[0] * 0.08, FY + 1.5, c.z + o[1] * 0.08);
    const st = STOPS.find(x => x.obj === F.nb); if (st) { st.look = F.look.clone(); st.from = F.from.clone(); }
  }

  // ---------------- cargar el aula publicada (todos la ven) ----------------
  const b64e = s => btoa(unescape(encodeURIComponent(s))), b64d = s => decodeURIComponent(escape(atob(s)));
  const valido = L => Array.isArray(L) && L.every(x => x && typeof x.t === 'string' && isFinite(x.x) && isFinite(x.z));
  async function publicada() {
    try { const r = await fetch(`https://firestore.googleapis.com/v1/projects/ciencia6abcd/databases/(default)/documents/files/${FILE}?key=AIzaSyB3IlHEFGkCGtZhPZxV5-a47Pg2mAaIjSM`, { cache: 'no-store' });
      if (!r.ok) return null; const j = await r.json(), d = JSON.parse(b64d(j.fields.b64.stringValue)); return d && valido(d.items) ? d.items : null; } catch (e) { return null; }
  }

  // =================================================================
  //  EL EDITOR
  // =================================================================
  const TH0 = Math.atan2(A0.uvec[0], A0.uvec[1]);                   // mirando desde el fondo hacia la pizarra (en el plano, la pizarra queda arriba)
  const E = { on: false, sel: -1, plano: false, th: TH0 + 0.35, ph: 0.95, rad: 9.5, cx: R6B.cx, cz: R6B.cz, hist: [], fut: [], viendo: false };
  const ui = document.createElement('div'); ui.id = 'ed'; document.body.appendChild(ui);
  const anillo = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 48), new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.95, depthTest: false }));
  anillo.rotation.x = -Math.PI / 2; anillo.renderOrder = 10; anillo.visible = false; scene.add(anillo);
  const rejilla = new THREE.GridHelper(9, 45, 0xff7a1a, 0x94a3b8); rejilla.position.set(R6B.cx, FY + 0.006, R6B.cz); rejilla.material.transparent = true; rejilla.material.opacity = 0.35; rejilla.visible = false; scene.add(rejilla);
  pintar();                                                        // el aula de siempre; si la docente publicó otra, se cambia
  publicada().then(L => { if (L && !E.on) { items = L; pintar(); } });
  function marcar() { const it = items[E.sel]; anillo.visible = E.on && !!it; if (!it) return; const R = RADIO[it.t] || 0.5; anillo.scale.setScalar(R); anillo.position.set(it.x, FY + 0.02, it.z); }
  const guardarLocal = () => { try { localStorage.setItem(LSK, JSON.stringify(items)); } catch (e) {} };
  const foto = () => JSON.stringify(items);
  function cambio(f) { E.hist.push(foto()); if (E.hist.length > 60) E.hist.shift(); E.fut = []; f(); pintar(); guardarLocal(); pintaUI(); }
  const limite = (it) => { const R = Math.min(RADIO[it.t] || 0.5, 1.4) * 0.7; it.x = Math.max(R6B.cx - 3.75 + R, Math.min(R6B.cx + 3.75 - R, it.x)); it.z = Math.max(R6B.cz - 4.25 + R, Math.min(R6B.cz + 4.25 - R, it.z)); };

  // ---- cámara libre ----
  animHooks.push(() => { if (!E.on) return; const ph = E.plano ? 0.02 : E.ph, rad = E.plano ? 12.5 : E.rad, th = E.plano ? TH0 : E.th;
    TOUR.look.set(E.cx, FY + 0.4, E.cz); TOUR.pos.set(E.cx + Math.sin(th) * Math.sin(ph) * rad, FY + 0.4 + Math.cos(ph) * rad, E.cz + Math.cos(th) * Math.sin(ph) * rad); TOUR.roll = 0; TOUR.zoom = 0; });

  // ---- tocar / arrastrar ----
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), piso = new THREE.Plane(new THREE.Vector3(0, 1, 0), -FY), hit = new THREE.Vector3();
  const rayo = e => { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); camera.updateMatrixWorld(); rc.setFromCamera(ndc, camera); };
  function elegir(e) { rayo(e); const objs = [...POOLS.filter(p => p.count), ...EXTRAS.values()];
    const h = rc.intersectObjects(objs, true).find(x => (x.object.isInstancedMesh ? x.object.userData.own[x.instanceId] : x.object.userData.own)); if (!h) return null;
    return h.object.isInstancedMesh ? h.object.userData.own[h.instanceId] : h.object.userData.own; }
  const enPiso = e => { rayo(e); return rc.ray.intersectPlane(piso, hit) ? hit.clone() : null; };
  const P = new Map(); let arr = null, pin = null;
  const lienzo = renderer.domElement;
  addEventListener('pointerdown', e => { if (!E.on || e.target !== lienzo) return; e.stopImmediatePropagation(); P.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (P.size === 2) { arr = null; const [a, b] = [...P.values()]; pin = { d: Math.hypot(a.x - b.x, a.y - b.y), rad: E.rad, cx: E.cx, cz: E.cz, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; return; }
    const o = elegir(e);
    if (o) { let i = o.i; const it0 = items[i];
      if (o.k >= 0 && it0.t !== 'silla') { E.sel = i; E.selK = o.k; } else { E.sel = i; E.selK = -1; }
      const p = enPiso(e); arr = { tipo: 'mueble', i: E.sel, k: E.selK, p0: p, x0: items[E.sel].x, z0: items[E.sel].z, movio: false, antes: foto() }; marcar(); pintaUI(); }
    else { arr = { tipo: 'cam', x: e.clientX, y: e.clientY, th: E.th, ph: E.ph, cx: E.cx, cz: E.cz, movio: false }; } }, true);
  addEventListener('pointermove', e => { if (!E.on || !P.has(e.pointerId)) return; P.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pin && P.size === 2) { const [a, b] = [...P.values()], d = Math.hypot(a.x - b.x, a.y - b.y); E.rad = Math.max(3, Math.min(16, pin.rad * pin.d / Math.max(d, 1))); return; }
    if (!arr) return;
    if (arr.tipo === 'cam') { const dx = e.clientX - arr.x, dy = e.clientY - arr.y; if (Math.hypot(dx, dy) > 4) arr.movio = true;
      if (E.plano) { const k = 12 / innerHeight, t = TH0; E.cx = arr.cx - (dx * Math.cos(t) + dy * Math.sin(t)) * k; E.cz = arr.cz - (-dx * Math.sin(t) + dy * Math.cos(t)) * k; }
      else { E.th = arr.th - dx * 0.008; E.ph = Math.max(0.15, Math.min(1.35, arr.ph - dy * 0.006)); } return; }
    const p = enPiso(e); if (!p || !arr.p0) return; const it = items[arr.i]; if (!it) return;
    if (!arr.movio && Math.hypot(p.x - arr.p0.x, p.z - arr.p0.z) < 0.05) return;
    if (!arr.movio && arr.k >= 0 && it.t !== 'silla') {               // mover una silla de una mesa: se separa como silla suelta
      const a = asientos(it).find(z => z.k === arr.k); it.s[arr.k] = 0; items.push({ t: 'silla', x: a.x, z: a.z, r: a.yaw, c: it.c }); arr.i = items.length - 1; arr.x0 = a.x; arr.z0 = a.z; arr.k = -1; E.sel = arr.i; E.selK = -1; }
    arr.movio = true; const it2 = items[arr.i]; it2.x = Math.round((arr.x0 + p.x - arr.p0.x) * 20) / 20; it2.z = Math.round((arr.z0 + p.z - arr.p0.z) * 20) / 20; limite(it2); pintar(); }, true);
  const soltar = e => { if (!E.on || !P.has(e.pointerId)) return; e.stopImmediatePropagation(); P.delete(e.pointerId); if (P.size < 2) pin = null;
    if (arr && arr.tipo === 'mueble' && arr.movio) { E.hist.push(arr.antes); E.fut = []; guardarLocal(); }
    if (arr && arr.tipo === 'cam' && !arr.movio) { E.sel = -1; marcar(); }
    arr = null; pintaUI(); };
  addEventListener('pointerup', soltar, true); addEventListener('pointercancel', soltar, true);
  addEventListener('click', e => { if (E.on && e.target === lienzo) e.stopImmediatePropagation(); }, true);
  addEventListener('wheel', e => { if (!E.on || e.target !== lienzo) return; E.rad = Math.max(3, Math.min(16, E.rad * (e.deltaY > 0 ? 1.1 : 0.9))); }, { passive: true });
  addEventListener('keydown', e => { if (!E.on) return; if (/Arrow/.test(e.code)) e.stopImmediatePropagation(); if ((e.key === 'Delete' || e.key === 'Backspace') && E.sel >= 0 && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) quitar(); }, true);

  // ---- acciones ----
  const it = () => items[E.sel];
  function girar(d) { const x = it(); if (!x) return; cambio(() => { if (E.selK >= 0 && x.t !== 'silla') return; x.r = ((x.r || 0) + d) % TAU; }); }
  function duplicar() { const x = it(); if (!x) return; cambio(() => { const n = JSON.parse(JSON.stringify(x)); if (E.selK >= 0 && x.t !== 'silla') { const a = asientos(x).find(z => z.k === E.selK); Object.assign(n, { t: 'silla', x: a.x, z: a.z, r: a.yaw, c: x.c }); delete n.s; }
    const R = Math.min(RADIO[n.t] || 0.5, 1) * 1.3; n.x += R; n.z += R * 0.4; limite(n); items.push(n); E.sel = items.length - 1; E.selK = -1; }); }
  function quitar() { const x = it(); if (!x) return; cambio(() => { if (E.selK >= 0 && x.t !== 'silla') { x.s[E.selK] = 0; E.selK = -1; return; } items.splice(E.sel, 1); E.sel = -1; }); }
  function pintarColor() { const x = it(); if (!x) return; cambio(() => { const i = COLORES.indexOf(x.c || (x.t === 'alfombra' ? 0x60a5fa : SILLA0)); x.c = COLORES[(i + 1) % COLORES.length]; }); }
  function deshacer() { if (!E.hist.length) return; E.fut.push(foto()); items = JSON.parse(E.hist.pop()); E.sel = -1; pintar(); guardarLocal(); pintaUI(); }
  function rehacer() { if (!E.fut.length) return; E.hist.push(foto()); items = JSON.parse(E.fut.pop()); E.sel = -1; pintar(); guardarLocal(); pintaUI(); }
  function centroVista() { const ph = E.plano ? 0.02 : E.ph; return { x: E.cx, z: E.cz }; }
  function agregar(t) { const c = centroVista(), n = { t, x: c.x, z: c.z, r: 0 };
    if (t === 'hex') n.s = [1, 1, 1, 1, 1, 1]; if (t === 'mesa') { n.s = [1, 1]; n.r = Math.atan2(A0.uvec[0], A0.uvec[1]); } if (t === 'pupitre') { n.s = [1]; n.r = Math.atan2(A0.uvec[0], A0.uvec[1]); }
    if (t === 'silla') n.r = Math.atan2(A0.uvec[0], A0.uvec[1]);
    if (t === 'cartel') { const tx = prompt('¿Qué dice el cartel?', '¡Bienvenidos!'); if (tx == null) return; n.txt = tx.slice(0, 80); n.r = Math.atan2(A0.uvec[0], A0.uvec[1]); }   // el texto mira a los estudiantes
    cambio(() => { limite(n); items.push(n); E.sel = items.length - 1; E.selK = -1; }); cerrarPanel(); }
  function textoCartel() { const x = it(); if (!x || x.t !== 'cartel') return; const tx = prompt('¿Qué dice el cartel?', x.txt || ''); if (tx == null) return; cambio(() => { x.txt = tx.slice(0, 80); }); }

  // ---- distribuciones rápidas (en coordenadas del aula: u hacia el fondo, s a lo ancho) ----
  const frente = () => Math.atan2(A0.uvec[0], A0.uvec[1]);          // las sillas miran a la pizarra
  const at = (u, s) => A0.P(u, s);
  const DIST = {
    grupos6: () => [[-1.5, 1.6], [2.25, 1.6], [-1.5, 6.0], [2.25, 6.0], [0.4, 3.8]].map(([u, s]) => { const [x, z] = at(u, s); return { t: 'hex', x, z, r: 0, s: [1, 1, 1, 1, 1, 1] }; }),
    grupos4: () => { const L = []; [-1.5, 0.7, 2.6].forEach(u => [1.6, 4.0, 6.4].forEach(s => { const [x, z] = at(u, s), f = frente(); [0, Math.PI].forEach(k => { const [ox, oz] = rot(0, 0.31, f + k); L.push({ t: 'mesa', x: x + ox, z: z + oz, r: f + k, s: [1, 1] }); }); })); return L; },
    filas: () => { const L = []; [-1.5, -0.3, 0.9, 2.1].forEach(u => [1.0, 2.8, 4.6, 6.4].forEach(s => { const [x, z] = at(u, s); L.push({ t: 'mesa', x, z, r: frente(), s: [1, 1] }); })); return L; },
    u: () => { const L = [], f = frente(); [-1.2, 0.2, 1.6].forEach(u => { let [x, z] = at(u, 1.1); L.push({ t: 'mesa', x, z, r: f - Math.PI / 2 * Math.sign(A0.svec[0] * A0.uvec[1] - A0.svec[1] * A0.uvec[0] || 1), s: [1, 1] }); [x, z] = at(u, 6.7); L.push({ t: 'mesa', x, z, r: f + Math.PI / 2 * Math.sign(A0.svec[0] * A0.uvec[1] - A0.svec[1] * A0.uvec[0] || 1), s: [1, 1] }); });
      [2.0, 3.3, 4.6, 5.9].forEach(s => { const [x, z] = at(2.8, s); L.push({ t: 'mesa', x, z, r: f, s: [1, 1] }); }); return L; },
    examen: () => { const L = []; [-1.6, -0.5, 0.6, 1.7, 2.8].forEach(u => [0.9, 2.2, 3.5, 4.8, 6.1, 7.2].forEach(s => { const [x, z] = at(u, s); L.push({ t: 'pupitre', x, z, r: frente(), s: [1] }); })); return L; }
  };
  function distribuir(k) { if (!confirm('Se cambiarán todas las mesas y sillas de los estudiantes. ¿Continuar?')) return;
    cambio(() => { const otros = items.filter(x => !['hex', 'mesa', 'pupitre', 'silla'].includes(x.t)); items = [...DIST[k](), ...otros]; items.forEach(limite); E.sel = -1; }); cerrarPanel(); }

  // ---- guardar y publicar ----
  async function publicar() {
    const b = ui.querySelector('[data-e="pub"]'); if (b) { b.disabled = true; b.textContent = 'Publicando…'; }
    try { await Docente.commit([{ update: { name: Docente.DOC('files', FILE), fields: Docente.toF({ b64: b64e(JSON.stringify({ v: 1, items, at: Date.now() })), updatedAt: new Date() }) } }]);
      aviso('✅ ¡Publicado! Tus estudiantes verán el aula así.'); }
    catch (e) { aviso(e.message === 'AUTH' ? '🔐 Conecta tu cuenta (fotocheck → Conectar mi cuenta) para publicar. Tus cambios quedan guardados en este equipo.' : '📶 No se pudo publicar. Tus cambios quedan guardados en este equipo.'); }
    if (b) { b.disabled = false; b.textContent = '💾 Publicar'; }
  }
  let avT = 0; function aviso(t) { const a = ui.querySelector('.ed-av'); if (!a) return; a.textContent = t; a.classList.add('on'); clearTimeout(avT); avT = setTimeout(() => a.classList.remove('on'), 4200); }

  // ---- entrar / salir ----
  async function entrar() {
    if (!MD.esDocente()) return;
    if (TOUR.busy) return;
    if (TOUR.i !== 0) { await go(-TOUR.i); }
    callar(); Foto.mostrar(false); E.on = true; E.viendo = false; E.sel = -1; E.hist = []; E.fut = [];
    try { const L = JSON.parse(localStorage.getItem(LSK) || 'null'); if (valido(L) && confirm('Tienes cambios sin publicar en este equipo. ¿Seguir con ellos?')) { items = L; pintar(); } } catch (e) {}
    moli.root.visible = false; rejilla.visible = true; document.body.classList.add('editando'); pintaUI(); marcar();
  }
  function salir(sinGuardar) {
    if (sinGuardar && E.hist.length && !confirm('¿Salir sin publicar? Tus cambios quedan guardados sólo en este equipo.')) return;
    E.on = false; E.sel = -1; marcar(); rejilla.visible = false; moli.root.visible = true; document.body.classList.remove('editando'); ui.innerHTML = '';
    TOUR.pos.copy(fromOf(STOPS[0])); TOUR.look.copy(STOPS[0].look); setTimeout(() => Foto.mostrar(TOUR.i === 0), 400);
  }
  function verComoEstudiante() { E.on = false; E.viendo = true; marcar(); rejilla.visible = false; moli.root.visible = true; document.body.classList.remove('editando');
    TOUR.pos.copy(fromOf(STOPS[0])); TOUR.look.copy(STOPS[0].look); ui.innerHTML = '<button class="ed-volver" data-e="volver">✏️ Volver a editar</button>'; }
  function volver() { E.on = true; E.viendo = false; moli.root.visible = false; rejilla.visible = true; document.body.classList.add('editando'); pintaUI(); }

  // ---- la barra del editor ----
  const NOMBRE = { hex: 'Mesa de 6', mesa: 'Mesa de 2', pupitre: 'Pupitre', silla: 'Silla', planta: 'Planta', estante: 'Estante', cartel: 'Cartel', tacho: 'Tacho', alfombra: 'Alfombra' };
  const CATA = [['hex', '⬡', 'Mesa de 6 (con sillas)'], ['mesa', '▭', 'Mesa de 2'], ['pupitre', '▫️', 'Pupitre'], ['silla', '🪑', 'Silla'], ['planta', '🪴', 'Planta'], ['estante', '📚', 'Estante'], ['cartel', '🪧', 'Cartel'], ['tacho', '🗑️', 'Tacho'], ['alfombra', '🟦', 'Alfombra']];
  const DISTS = [['grupos6', '⬡⬡', 'Grupos de 6'], ['grupos4', '▭▭', 'Grupos de 4'], ['filas', '☰', 'En filas'], ['u', '⊔', 'En U'], ['examen', '⠿', 'Modo examen']];
  let panel = '';
  function pintaUI() {
    if (!E.on) return; const x = it(), suelta = x && (E.selK < 0 || x.t === 'silla');
    ui.innerHTML = `<div class="ed-top"><b>✏️ Editando el aula</b><button data-e="plano">${E.plano ? '🧊 Vista 3D' : '🗺️ Vista de plano'}</button><button data-e="dist">🧩 Distribuciones</button><button data-e="ver">👀 Ver como estudiante</button>
        <button data-e="pub" class="ok">💾 Publicar</button><button data-e="salir" class="x">✕ Salir</button></div>
      <div class="ed-av"></div>
      <div class="ed-tip">${x ? `Elegiste: <b>${E.selK >= 0 && x.t !== 'silla' ? 'Silla de la ' + NOMBRE[x.t].toLowerCase() : NOMBRE[x.t]}</b> · arrástrala para moverla` : 'Toca un mueble para elegirlo · arrastra el piso para mover la vista · pellizca para acercar'}</div>
      <div class="ed-bot"><button data-e="agregar" class="ok">➕ Agregar</button>
        ${x ? `${suelta ? '<button data-e="izq">↺ Girar</button><button data-e="der">↻ Girar</button>' : ''}<button data-e="dup">📋 Duplicar</button>${x.t === 'silla' || x.s || x.t === 'alfombra' ? '<button data-e="color">🎨 Color</button>' : ''}${x.t === 'cartel' ? '<button data-e="txt">✏️ Texto</button>' : ''}<button data-e="quitar" class="x">🗑️ Quitar</button>` : ''}
        <span class="ed-sep"></span><button data-e="undo"${E.hist.length ? '' : ' disabled'}>↩️</button><button data-e="redo"${E.fut.length ? '' : ' disabled'}>↪️</button></div>
      ${panel === 'agregar' ? `<div class="ed-panel"><b>➕ ¿Qué agregamos?</b><div class="ed-grid">${CATA.map(([k, i, t]) => `<button data-a="${k}"><i>${i}</i>${t}</button>`).join('')}</div><button data-e="cerrar">Cerrar</button></div>` : ''}
      ${panel === 'dist' ? `<div class="ed-panel"><b>🧩 Distribuciones rápidas</b><p>Molí acomoda todas las mesas y sillas; después tú ajustas.</p><div class="ed-grid">${DISTS.map(([k, i, t]) => `<button data-d="${k}"><i>${i}</i>${t}</button>`).join('')}</div><button data-e="cerrar">Cerrar</button></div>` : ''}`;
  }
  function cerrarPanel() { panel = ''; pintaUI(); }
  ui.addEventListener('pointerdown', e => e.stopPropagation());
  ui.addEventListener('click', e => { e.stopPropagation(); const b = e.target.closest('button'); if (!b) return;
    const a = b.dataset.a, d = b.dataset.d, k = b.dataset.e;
    if (a) return agregar(a); if (d) return distribuir(d);
    ({ plano: () => { E.plano = !E.plano; pintaUI(); }, dist: () => { panel = panel === 'dist' ? '' : 'dist'; pintaUI(); }, agregar: () => { panel = panel === 'agregar' ? '' : 'agregar'; pintaUI(); }, cerrar: cerrarPanel,
      ver: verComoEstudiante, volver, pub: publicar, salir: () => salir(true), izq: () => girar(Math.PI / 12), der: () => girar(-Math.PI / 12), dup: duplicar, quitar, color: pintarColor, txt: textoCartel, undo: deshacer, redo: rehacer }[k] || (() => {}))(); });

  Herramientas.extra.editar = entrar;
  window.Editor = { entrar, salir, get items() { return items; }, set items(L) { items = L; pintar(); }, pintar, E, DIST };
})();
