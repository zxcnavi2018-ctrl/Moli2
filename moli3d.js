// Molí 3D compartido (aula y Biblioteca)
// ===================================================================
//  MOLÍ 3D: robotito de plástico blanco satinado, con el visor azul noche hundido en el casco (borde blanco
//  alrededor), ojos ovalados celestes que brillan y boquita cuando habla, audífonos azul noche con aro de luz,
//  bracitos gorditos con manitos azul noche, una línea en el cuerpo, base azul noche y su luz azul de abajo.
//  Todo se mueve con resortes: llega suave, con un poquito de rebote.
//  crearMoli(THREE, { renderer }) -> { root, update(t, dt, mov), expr(nombre), accion(nombre, lado), hablar(on), mirar(v3), brazo(lado, arriba), manos }
// ===================================================================
function crearMoli(THREE, opt = {}) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const sstep = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  // ---- reflejos: un estudio de luz hecho a mano (sin archivos) para que el plástico brille bonito ----
  let env = null;
  if (opt.renderer && THREE.PMREMGenerator) try {
    const es = new THREE.Scene(), sg = new THREE.SphereGeometry(10, 32, 16), q = sg.attributes.position, col = [];
    for (let i = 0; i < q.count; i++) { const h = q.getY(i) / 10, k1 = sstep(-0.5, 0.15, h), k2 = sstep(0.3, 0.95, h);
      [0.4 + 0.52 * k1, 0.44 + 0.52 * k1, 0.54 + 0.44 * k1].forEach(v => col.push(v + (1.12 - v) * k2)); }
    sg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    es.add(new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const panel = (w, h, p, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); es.add(m); };
    panel(7, 3.5, [-4.5, 6, 5], new THREE.Color(2.8, 2.8, 2.7));      // ventana de luz grande arriba a la izquierda
    panel(2.5, 6, [7, 1.5, 3], new THREE.Color(1.3, 1.4, 1.5));       // tira de luz a la derecha
    panel(6, 2, [0, 2.5, -8], new THREE.Color(0.5, 1.0, 2.0));        // contraluz azulito
    const pm = new THREE.PMREMGenerator(opt.renderer); env = pm.fromScene(es, 0.04).texture; pm.dispose();
    es.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  } catch (e) { env = null; }
  const PM = (o) => new THREE.MeshPhysicalMaterial(Object.assign({ envMap: env, metalness: 0 }, o));
  const WHITE = PM({ color: 0xe5ded1, roughness: 0.52, clearcoat: 0.3, clearcoatRoughness: 0.32, envMapIntensity: 0.28 });   // marfil cálido satinado
  const NAVY = PM({ color: 0x17245a, roughness: 0.4, clearcoat: 0.55, clearcoatRoughness: 0.25, envMapIntensity: 0.45 });
  const NAVYD = PM({ color: 0x0d163d, roughness: 0.45, envMapIntensity: 0.3 });
  const VISOR = PM({ color: 0x0b1438, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.62 });
  const SEAM = PM({ color: 0xaeb7c7, roughness: 0.5, envMapIntensity: 0.3 });
  const LED = new THREE.MeshBasicMaterial({ color: 0x5fd0ff });
  const ADD = (o) => new THREE.MeshBasicMaterial(Object.assign({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }, o));

  // ---- juntar piezas (mismo material y mismo grupo) en una sola malla: pocas llamadas de dibujo ----
  const batches = new Map();
  const part = (geo, mat, parent, pos, rot, scl) => {
    const m4 = new THREE.Matrix4().compose(V(...(pos || [0, 0, 0])), new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot || [0, 0, 0]))), V(...(scl || [1, 1, 1])));
    const k = parent.uuid + mat.uuid; let b = batches.get(k); if (!b) batches.set(k, b = { parent, mat, list: [] }); b.list.push({ geo, m4 });
  };
  const merge = (list) => {
    let nv = 0, ni = 0; list.forEach(({ geo }) => { nv += geo.attributes.position.count; ni += geo.index ? geo.index.count : geo.attributes.position.count; });
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    const v = new THREE.Vector3(), nm = new THREE.Matrix3(); let ov = 0, oi = 0;
    list.forEach(({ geo, m4 }) => {
      const P = geo.attributes.position, N = geo.attributes.normal, U = geo.attributes.uv; nm.getNormalMatrix(m4);
      for (let i = 0; i < P.count; i++) { const o = (ov + i) * 3;
        v.fromBufferAttribute(P, i).applyMatrix4(m4); pos[o] = v.x; pos[o + 1] = v.y; pos[o + 2] = v.z;
        v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nor[o] = v.x; nor[o + 1] = v.y; nor[o + 2] = v.z;
        if (U) { uv[(ov + i) * 2] = U.getX(i); uv[(ov + i) * 2 + 1] = U.getY(i); } }
      if (geo.index) for (let i = 0; i < geo.index.count; i++) idx[oi + i] = geo.index.getX(i) + ov; else for (let i = 0; i < P.count; i++) idx[oi + i] = ov + i;
      ov += P.count; oi += geo.index ? geo.index.count : P.count;
    });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeBoundingSphere(); return g;
  };
  const flush = () => { batches.forEach(b => { const m = new THREE.Mesh(merge(b.list), b.mat); b.parent.add(m); }); batches.clear(); };
  const smooth = (g, ws, hs) => {                                      // normales suaves también en la costura y en los polos de la esfera
    g.computeVertexNormals();
    const n = g.attributes.normal, v = new THREE.Vector3(), row = ws + 1;
    const avg = (ids) => { v.set(0, 0, 0); ids.forEach(i => { v.x += n.getX(i); v.y += n.getY(i); v.z += n.getZ(i); }); v.normalize(); ids.forEach(i => n.setXYZ(i, v.x, v.y, v.z)); };
    for (let iy = 1; iy < hs; iy++) avg([iy * row, iy * row + ws]);
    const top = [], bot = []; for (let ix = 0; ix <= ws; ix++) { top.push(ix); bot.push(hs * row + ix); } avg(top); avg(bot);
    return g;
  };
  const lathe = (f, n = 24, seg = 40) => { const pts = []; for (let i = 0; i <= n; i++) { const [r, y] = f(i / n); pts.push(new THREE.Vector2(Math.max(r, 0.0004), y)); } return new THREE.LatheGeometry(pts, seg); };
  const puck = (r, h, b, seg = 48) => {                               // disco con bordes redondeados (eje Y)
    const L = [[0.0004, -h / 2], [r - b, -h / 2]];
    for (let i = 1; i <= 6; i++) { const a = -Math.PI / 2 + i / 6 * Math.PI / 2; L.push([r - b + Math.cos(a) * b, -h / 2 + b + Math.sin(a) * b]); }
    for (let i = 1; i <= 6; i++) { const a = i / 6 * Math.PI / 2; L.push([r - b + Math.cos(a) * b, h / 2 - b + Math.sin(a) * b]); }
    L.push([0.0004, h / 2]); return new THREE.LatheGeometry(L.map(([x, y]) => new THREE.Vector2(x, y)), seg);
  };
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; };
  const glowTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(180,244,255,1)'); gr.addColorStop(0.3, 'rgba(80,185,255,.55)'); gr.addColorStop(1, 'rgba(40,120,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  const glow = (parent, pos, s, op = 1) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })); sp.position.set(...pos); sp.scale.set(s, s, 1); parent.add(sp); return sp; };

  // ---- ojos y boquita: dibujos de luz celeste (uno por expresión) ----
  const lightFill = (g, y0, y1) => { const f = g.createLinearGradient(0, y0, 0, y1); f.addColorStop(0, '#e4fdff'); f.addColorStop(0.4, '#7ef1ff'); f.addColorStop(1, '#2fb4ff'); return f; };
  const halo = (g, x, y, r) => { const h = g.createRadialGradient(x, y, r * 0.2, x, y, r); h.addColorStop(0, 'rgba(90,215,255,.6)'); h.addColorStop(1, 'rgba(50,150,255,0)'); g.fillStyle = h; g.fillRect(0, 0, g.canvas.width, g.canvas.height); };
  const EYE = {};
  const eyeTex = (kind) => canvasTex(128, 192, (g) => {
    halo(g, 64, 96, 66); g.fillStyle = g.strokeStyle = lightFill(g, 30, 162); g.lineCap = 'round'; g.lineJoin = 'round';
    if (kind === 'open') { g.beginPath(); g.ellipse(64, 96, 31, 54, 0, 0, 6.3); g.fill(); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(54, 70, 8, 13, -0.25, 0, 6.3); g.fill(); }
    else if (kind === 'wow') { g.beginPath(); g.ellipse(64, 96, 38, 50, 0, 0, 6.3); g.fill(); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(52, 76, 10, 12, -0.3, 0, 6.3); g.fill(); }
    else if (kind === 'happy') { g.lineWidth = 19; g.beginPath(); g.arc(64, 116, 32, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); }
    else if (kind === 'closed') { g.lineWidth = 14; g.beginPath(); g.moveTo(36, 100); g.quadraticCurveTo(64, 116, 92, 100); g.stroke(); }
    else if (kind === 'wink') { g.lineWidth = 15; g.beginPath(); g.moveTo(84, 72); g.lineTo(44, 96); g.lineTo(84, 120); g.stroke(); }
    else if (kind === 'star') { g.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 22 : 50, a = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(64 + Math.cos(a) * r, 98 + Math.sin(a) * r); } g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(56, 84, 6, 8, -0.3, 0, 6.3); g.fill(); }
    else if (kind === 'sadL' || kind === 'sadR') { const d = kind === 'sadL' ? 1 : -1;               // ojitos tristes: el párpado de arriba cae hacia afuera
      g.save(); g.beginPath(); g.moveTo(0, 86 + 22 * d); g.lineTo(128, 86 - 22 * d); g.lineTo(128, 192); g.lineTo(0, 192); g.closePath(); g.clip();
      g.beginPath(); g.ellipse(64, 104, 29, 44, 0, 0, 6.3); g.fill(); g.restore();
      g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(58, 116, 7, 9, 0, 0, 6.3); g.fill(); }
    else if (kind === 'angL' || kind === 'angR') { const d = kind === 'angL' ? -1 : 1;               // enojado: el párpado cae hacia adentro
      g.save(); g.beginPath(); g.moveTo(0, 80 + 26 * d); g.lineTo(128, 80 - 26 * d); g.lineTo(128, 192); g.lineTo(0, 192); g.closePath(); g.clip();
      g.beginPath(); g.ellipse(64, 104, 30, 46, 0, 0, 6.3); g.fill(); g.restore(); }
    else if (kind === 'think') {                                                                  // pensando: medio cerrados, mirando arriba
      g.save(); g.beginPath(); g.rect(0, 0, 128, 100); g.clip(); g.beginPath(); g.ellipse(64, 92, 30, 48, 0, 0, 6.3); g.fill(); g.restore();
      g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(74, 62, 7, 10, 0.2, 0, 6.3); g.fill(); }
  });
  ['open', 'wow', 'happy', 'closed', 'wink', 'star', 'sadL', 'sadR', 'think', 'angL', 'angR'].forEach(k => EYE[k] = eyeTex(k));
  const MOUTH = {};
  const mouthTex = (kind) => canvasTex(128, 96, (g) => {
    halo(g, 64, 48, 46); g.fillStyle = g.strokeStyle = lightFill(g, 20, 80); g.lineCap = 'round';
    if (kind === 'smile') { g.lineWidth = 9; g.beginPath(); g.arc(64, 30, 26, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); }
    else if (kind === 'open') { g.beginPath(); g.moveTo(40, 40); g.quadraticCurveTo(64, 34, 88, 40); g.quadraticCurveTo(84, 74, 64, 74); g.quadraticCurveTo(44, 74, 40, 40); g.fill(); }
    else if (kind === 'o') { g.lineWidth = 8; g.beginPath(); g.ellipse(64, 48, 13, 16, 0, 0, 6.3); g.stroke(); }
    else if (kind === 'frown') { g.lineWidth = 8; g.beginPath(); g.arc(64, 70, 22, Math.PI * 1.22, Math.PI * 1.78); g.stroke(); }
    else if (kind === 'flat') { g.lineWidth = 8; g.beginPath(); g.moveTo(50, 50); g.quadraticCurveTo(66, 46, 82, 42); g.stroke(); }
  });
  ['smile', 'open', 'o', 'frown', 'flat'].forEach(k => MOUTH[k] = mouthTex(k));

  // ---- armazón: root (pies en el piso) > hover (flota) > body (se inclina y respira) > cabeza / brazos ----
  const root = new THREE.Group(), hover = new THREE.Group(), body = new THREE.Group(); root.add(hover); hover.add(body);
  const headPivot = new THREE.Group(); headPivot.position.y = 0.84; body.add(headPivot);
  const head = new THREE.Group(); head.position.y = 0.45; headPivot.add(head);

  // ---- casco: superelipsoide (más redondito arriba) con el hueco del visor adelante ----
  const HS = [0.6, 0.5, 0.53], VI = { y: -0.08, bx: 0.44, by: 0.29, r: 0.2, d: 0.075, w: 0.032 };
  const sp = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);
  const sdRR = (x, y) => { const qx = Math.abs(x) - VI.bx + VI.r, qy = Math.abs(y - VI.y) - VI.by + VI.r; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - VI.r; };
  const HW = 96, HH = 72;                                             // resolución del casco (borde del visor bien liso)
  const helmet = () => {
    const g = new THREE.SphereGeometry(1, HW, HH); g.rotateY(-Math.PI / 2);      // la costura queda atrás
    const q = g.attributes.position;
    for (let i = 0; i < q.count; i++) { const x = q.getX(i), y = q.getY(i), z = q.getZ(i), yy = sp(y, 0.7), k = 1 - 0.13 * Math.max(0, yy) ** 2 - 0.04 * Math.max(0, -yy) ** 2;
      q.setXYZ(i, sp(x, 0.6) * k * HS[0], yy * HS[1], sp(z, 0.62) * k * HS[2]); }
    return g;
  };
  const shell = helmet(), base0 = shell.clone();
  { const q = shell.attributes.position;
    for (let i = 0; i < q.count; i++) { const X = q.getX(i), Y = q.getY(i), Z = q.getZ(i); if (Z <= 0) continue;
      const s = sstep(VI.w, -VI.w, sdRR(X, Y)) * sstep(0.12, 0.3, Z); if (s > 0) q.setZ(i, Z - VI.d * s); } }
  smooth(shell, HW, HH);
  // el visor: la misma forma del casco, metida en el hueco (abombadita al centro) y escondida debajo del borde
  const visorGeo = (function () {
    const q = base0.attributes.position, keep = new Uint8Array(q.count);
    for (let i = 0; i < q.count; i++) { const X = q.getX(i), Y = q.getY(i), Z = q.getZ(i), d = sdRR(X, Y);
      const inside = sstep(0.0, -0.05, d), bulge = 0.016 * Math.max(0, 1 - (X / VI.bx) ** 2) * Math.max(0, 1 - ((Y - VI.y) / VI.by) ** 2);
      q.setZ(i, Z - VI.d - 0.03 + inside * (0.07 + bulge)); keep[i] = Z > 0.1 && d < 0.05 ? 1 : 0; }
    const src = base0.index.array, out = [];
    for (let i = 0; i < src.length; i += 3) if (keep[src[i]] && keep[src[i + 1]] && keep[src[i + 2]]) out.push(src[i], src[i + 1], src[i + 2]);
    base0.setIndex(out); return smooth(base0, HW, HH);
  })();
  part(shell, WHITE, head);
  part(visorGeo, VISOR, head);
  // brillo del visor (reflejo de ventana arriba a la izquierda)
  const shineTex = canvasTex(256, 96, (g) => { g.filter = 'blur(3px)'; g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(128, 48, 112, 22, 0, 0, 6.3); g.fill(); });
  const shine = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.09), new THREE.MeshBasicMaterial({ map: shineTex, transparent: true, depthWrite: false, opacity: 0.55 }));
  shine.position.set(-0.04, VI.y + VI.by - 0.06, 0.5); shine.rotation.set(-0.32, 0, 0.04); head.add(shine);
  // ojos y boca (planitos de luz sobre el visor)
  const face = new THREE.Group(); face.position.set(0, VI.y, 0.502); head.add(face);
  const eyes = [-1, 1].map(sx => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.6), ADD({ map: EYE.open })); m.position.set(0.225 * sx, 0.035, 0); m.rotation.y = 0.14 * sx; face.add(m); return m; });
  const mouth = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.15), ADD({ map: MOUTH.smile, opacity: 0 })); mouth.position.set(0, -0.2, -0.004); mouth.visible = false;   // Molí no tiene boca: se expresa con los ojos
  // audífonos: disco azul noche con aro de luz y su brillito
  const ears = [-1, 1].map(sx => {
    const e = new THREE.Group(); e.position.set(0.58 * sx, VI.y + 0.02, -0.04); head.add(e);
    part(puck(0.205, 0.15, 0.05), NAVY, e, [0.04 * sx, 0, 0], [0, 0, Math.PI / 2]);
    part(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 40), NAVYD, e, [0.117 * sx, 0, 0], [0, 0, Math.PI / 2]);
    part(new THREE.TorusGeometry(0.152, 0.02, 14, 64), LED, e, [0.113 * sx, 0, 0], [0, Math.PI / 2, 0]);
    return { e, halo: glow(e, [0.16 * sx, 0, 0], 0.56, 0.5) };
  });
  // ---- cuello, cuerpito (frijolito blanco con una línea), hombros y base azul noche ----
  part(new THREE.CylinderGeometry(0.115, 0.135, 0.12, 32), NAVY, body, [0, 0.8, 0]);
  const torsoR = (y) => { const s = Math.max(-1, Math.min(1, (y - 0.545) / 0.215)), a = Math.asin(s); return 0.4 * Math.pow(Math.cos(a), 0.72) * (1 - 0.07 * s); };
  part(lathe(k => { const a = -Math.PI / 2 + Math.PI * k, y = 0.545 + 0.215 * Math.sin(a); return [torsoR(y), y]; }, 32, 56), WHITE, body);
  part(new THREE.TorusGeometry(torsoR(0.45) + 0.001, 0.0065, 8, 72), SEAM, body, [0, 0.45, 0], [Math.PI / 2, 0, 0]);
  part(lathe(k => { if (k < 0.82) { const a = Math.PI / 2 * (1 - k / 0.82); return [0.235 * Math.pow(Math.cos(a), 0.8), 0.37 - 0.16 * Math.sin(a)]; }
    const u = (k - 0.82) / 0.18; return [0.235 - 0.07 * u, 0.37 + 0.03 * Math.sin(u * Math.PI / 2)]; }, 28, 56), NAVY, body);
  part(new THREE.TorusGeometry(0.06, 0.013, 10, 48), LED, body, [0, 0.215, 0], [Math.PI / 2, 0, 0]);
  const baseGlow = glow(body, [0, 0.18, 0], 0.34, 0.6);
  [-1, 1].forEach(sx => part(new THREE.SphereGeometry(0.1, 24, 18), NAVY, body, [0.35 * sx, 0.655, 0.01]));
  // ---- en el pecho: el cuadradito del sodio, como en la tabla periódica (Na · 11 · 22,990) ----
  const rr = (g, x, y, w, h, r) => { if (g.roundRect) return g.roundRect(x, y, w, h, r); g.rect(x, y, w, h); };   // (navegadores antiguos: esquinas rectas)
  const naTex = canvasTex(256, 256, (g, w, h) => {                   // estilo LED: panel azul noche con luz celeste
    g.fillStyle = '#0d1b3f'; g.beginPath(); rr(g, 6, 6, w - 12, h - 12, 30); g.fill();
    const led = (fn, blur, col) => { g.save(); g.shadowColor = '#38bdf8'; g.shadowBlur = blur; g.fillStyle = col; g.strokeStyle = col; fn(); g.restore(); };
    led(() => { g.lineWidth = 9; g.beginPath(); rr(g, 22, 22, w - 44, h - 44, 18); g.stroke(); }, 22, '#7dd3fc');
    led(() => { g.lineWidth = 3; g.beginPath(); rr(g, 22, 22, w - 44, h - 44, 18); g.stroke(); }, 0, '#e0f7ff');
    g.textBaseline = 'alphabetic';
    led(() => { g.font = '700 30px Arial, sans-serif'; g.textAlign = 'left'; g.fillText('11', 44, 70); }, 12, '#a5f3fc');
    led(() => { g.font = '800 106px Arial, sans-serif'; g.textAlign = 'center'; g.fillText('Na', w / 2, 160); }, 26, '#bae6fd');
    led(() => { g.font = '800 106px Arial, sans-serif'; g.textAlign = 'center'; g.fillText('Na', w / 2, 160); }, 0, '#f0fbff');
    led(() => { g.font = '600 24px Arial, sans-serif'; g.textAlign = 'center'; g.fillText('Sodio', w / 2, 194); g.fillText('22,990', w / 2, 222); }, 10, '#7dd3fc'); });
  { const S = 0.17, geo = new THREE.PlaneGeometry(S, S, 12, 12), q = geo.attributes.position, yc = 0.585;
    for (let i = 0; i < q.count; i++) { const x = q.getX(i), y = yc + q.getY(i), R = torsoR(y); q.setXYZ(i, x, y, Math.sqrt(Math.max(0, R * R - x * x)) + 0.004); }   // pegadito a la pancita
    geo.computeVertexNormals(); const na = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: naTex, transparent: true })); na.renderOrder = 2; body.add(na); }
  // ---- bracitos (frijolito blanco) y manitos azul noche: palma, 3 deditos y pulgar ----
  const armGeo = lathe(k => { const y = -0.39 + 0.44 * k; return [0.135 * Math.pow(Math.sin(Math.PI * k), 0.4) * (0.8 + 0.2 * k), y]; }, 28, 36);   // brazo gordito (frijol)
  const arms = [-1, 1].map(sx => {
    const sh = new THREE.Group(); sh.position.set(0.37 * sx, 0.655, 0.01); body.add(sh);
    part(armGeo, WHITE, sh, [0.008 * sx, 0, 0]);
    const hand = new THREE.Group(); hand.position.set(0.014 * sx, -0.43, 0.008); sh.add(hand);
    part(new THREE.SphereGeometry(0.1, 24, 18), NAVY, hand, [0, 0, 0], null, [1, 0.92, 0.84]);
    [-1, 0, 1].forEach(j => part(new THREE.SphereGeometry(0.042, 14, 12), NAVY, hand, [0.016 * sx * (1 - Math.abs(j)), -0.088, j * 0.049 + 0.004], [0, 0, 0.12 * j * sx], [1, 1.4, 1]));
    part(new THREE.SphereGeometry(0.04, 14, 12), NAVY, hand, [-0.068 * sx, -0.03, 0.06], [0, 0, -0.6 * sx], [1, 1.35, 1]);
    return { sh, hand, sx, a: 0.42, v: 0, f: 0 };
  });
  flush();

  // ---- la luz azul de abajo: aro en el piso que respira, ondas suaves que salen y un brillo ----
  const floorFx = new THREE.Group(); root.add(floorFx);
  const ringTex = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 60, 128, 128, 128);
    gr.addColorStop(0, 'rgba(90,200,255,0)'); gr.addColorStop(0.72, 'rgba(90,200,255,0)'); gr.addColorStop(0.84, 'rgba(160,236,255,1)'); gr.addColorStop(0.9, 'rgba(80,190,255,.55)'); gr.addColorStop(1, 'rgba(40,140,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const flat = (tex, s, op) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), ADD({ map: tex, opacity: op, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.scale.setScalar(s); floorFx.add(m); return m; };
  const floorGlow = flat(glowTex, 0.9, 0.35); floorGlow.position.y = 0.002;
  const floorRing = flat(ringTex, 0.62, 0.9); floorRing.position.y = 0.004;
  const ripples = [0, 1, 2].map(() => { const r = flat(ringTex, 0.6, 0); r.position.y = 0.003; return r; });

  // ---- estado y animación ----
  const CLAP = { cerr: -0.62, abie: 0.8, fwd: -1.9 };              // ángulos del aplauso (se ajustan mirando el 3D)
  const S = { clap: null, expr: 'normal', act: null, side: -1, at: 0, talk: false, mo: 0, moT: 0, blink: 0, nextBlink: 1.2, look: V(0, 1.2, 6),
    idle: V(0, 0, 0), nextIdle: 2.5, sac: V(0, 0, 0), nextSac: 1, hy: 0, vy: 0, hx: 0, vx: 0, hz: 0, vz: 0, tilt: 0, vt: 0, yaw: 0, vyaw: 0, ex: 0, ey: 0, sq: 0, vsq: 0, up: {} };
  const spring = (x, v, to, k, d, dt) => { v += (to - x) * k * dt; v *= Math.exp(-d * dt); return [x + v * dt, v]; };
  const tmp = V(0, 0, 0);
  function expr(n) { S.expr = n || 'normal'; }
  function accion(n, lado) { S.act = n; S.at = 0; if (lado) S.side = lado; }
  function hablar(on) { S.talk = !!on; }
  function mirar(v) { S.look.copy(v); }
  function brazo(lado, on) { S.up[lado] = !!on; }
  function palma(v) { S.clap = v == null ? null : v ? 1 : 0; }      // 👏 aplaudir: 1 = manos juntas al frente, 0 = abiertas, null = deja de aplaudir                     // 🚩 levanta (o baja) el brazo de ese lado: 1 = derecha de la pantalla, -1 = izquierda
  function update(t, dt, mov = 0) {                                  // mov: qué tan rápido se mueve la cámara (se inclina y los brazos quedan atrás)
    dt = Math.min(Math.max(dt, 0), 0.1); S.at += dt; mov = Math.max(-1.6, Math.min(1.6, mov || 0));   // (el primer cuadro puede venir con tiempo negativo)
    let jump = 0, spin = 0, wave = 0, point = 0, nod = 0, cheer = S.expr === 'feliz';
    if (S.act === 'saltar') { const k = S.at / 0.75; jump = k < 1 ? Math.sin(k * Math.PI) * 0.3 : 0; if (k >= 1) S.act = null; }
    if (S.act === 'girar') { const k = Math.min(1, S.at / 1.15); spin = (1 - Math.pow(1 - k, 3)) * Math.PI * 2; cheer = true; if (k >= 1) S.act = null; }
    if (S.act === 'saludar') { wave = S.at < 2.0 ? 1 : 0; if (!wave) S.act = null; }
    if (S.act === 'señalar') { point = S.at < 2.8 ? 1 : 0; if (!point) S.act = null; }
    if (S.act === 'asentir') { nod = S.at < 0.9 ? Math.sin(S.at / 0.9 * Math.PI * 2) * 0.16 : 0; if (S.at >= 0.9) S.act = null; }
    // flota y respira (se estira al subir, se aplasta un poquito al bajar)
    const bob = Math.sin(t * 1.75) * 0.042 + Math.sin(t * 0.63 + 1) * 0.014;
    hover.position.y = 0.16 + bob + jump; hover.rotation.y = spin;
    [S.sq, S.vsq] = spring(S.sq, S.vsq, Math.cos(t * 1.75) * 0.016 + (S.act === 'saltar' ? Math.cos(S.at / 0.75 * Math.PI * 2) * 0.05 : 0), 120, 12, dt);
    body.scale.set(1 - S.sq * 0.6, 1 + S.sq, 1 - S.sq * 0.6);
    // se inclina con el movimiento de la cámara y gira un poquito hacia donde señala
    [S.yaw, S.vyaw] = spring(S.yaw, S.vyaw, point ? S.side * 0.22 : 0, 40, 9, dt); body.rotation.y = S.yaw;
    [S.tilt, S.vt] = spring(S.tilt, S.vt, mov * 0.22 + Math.sin(t * 0.9) * 0.03, 50, 7, dt);
    body.rotation.z = S.tilt; body.rotation.x = Math.sin(t * 1.75 + 0.6) * 0.025 + Math.abs(mov) * 0.06;
    // mira: a lo que le piden + curiosea de vez en cuando + movimientos chiquitos de los ojos
    S.nextIdle -= dt; if (S.nextIdle < 0) { S.nextIdle = 2.8 + Math.random() * 4; S.idle.set((Math.random() - 0.5) * 3, (Math.random() - 0.35) * 1.6, 0); }
    if (S.nextIdle < 1.8) S.idle.multiplyScalar(Math.exp(-dt * 2.5));
    S.nextSac -= dt; if (S.nextSac < 0) { S.nextSac = 0.6 + Math.random() * 1.8; S.sac.set((Math.random() - 0.5) * 0.024, (Math.random() - 0.5) * 0.014, 0); }
    headPivot.updateWorldMatrix(true, false); tmp.copy(S.look); if (!S.talk && !point) tmp.add(S.idle); headPivot.worldToLocal(tmp);
    const ty = Math.max(-0.9, Math.min(0.9, Math.atan2(tmp.x, tmp.z))), tx = Math.max(-0.38, Math.min(0.42, -Math.atan2(tmp.y - 0.45, Math.hypot(tmp.x, tmp.z))));
    [S.hy, S.vy] = spring(S.hy, S.vy, ty, 32, 7.5, dt);
    [S.hx, S.vx] = spring(S.hx, S.vx, tx + nod + (S.talk ? Math.sin(t * 6.5) * 0.04 : 0) - (cheer ? 0.06 : 0) + (S.expr === 'triste' ? 0.13 : 0), 36, 7.5, dt);
    [S.hz, S.vz] = spring(S.hz, S.vz, -S.tilt * 0.6 + Math.sin(t * 1.05) * 0.035 + (S.talk ? Math.sin(t * 2.7) * 0.05 : 0) + (S.expr === 'guiño' ? 0.14 : S.expr === 'pensativo' ? -0.2 : S.expr === 'triste' ? 0.08 : 0), 30, 7, dt);
    headPivot.rotation.set(S.hx, S.hy, S.hz);
    S.ex += (Math.max(-1, Math.min(1, ty * 1.4)) * 0.024 + S.sac.x - S.ex) * Math.min(1, dt * 12);
    S.ey += (Math.max(-1, Math.min(1, -tx * 2)) * 0.018 + S.sac.y - S.ey) * Math.min(1, dt * 12);
    face.position.x = S.ex; face.position.y = VI.y + S.ey;
    // bracitos con resorte (se atrasan un poquito: sensación de peso)
    arms.forEach((A, i) => {
      const lead = A.sx === S.side;
      let to = 0.4 + Math.sin(t * 1.75 - 0.4 + i * 0.7) * 0.05, fwd = 0;
      if (S.talk) { to = 0.62 + Math.max(0, Math.sin(t * 2.4 + i * Math.PI)) * 0.5; fwd = -0.25; }
      if (cheer) { to = 2.05 + Math.sin(t * 9 + i * 2.2) * 0.2; fwd = -0.3; }
      if (wave && lead) { to = 2.0 + Math.sin(S.at * 11) * 0.25; fwd = -0.45; }
      if (point && lead) { to = 1.5 + Math.sin(S.at * 3) * 0.04; fwd = -0.35; }
      if (S.up[A.sx]) { to = 2.75 + Math.sin(t * 7 + i) * 0.04; fwd = -0.12; }
      if (S.clap != null) { to = S.clap ? CLAP.cerr : CLAP.abie; fwd = CLAP.fwd; }
      to += mov * 0.35 * A.sx;
      [A.a, A.v] = spring(A.a, A.v, to, S.clap != null ? 420 : 75, S.clap != null ? 30 : 9.5, dt); A.f += (fwd - A.f) * Math.min(1, dt * (S.clap != null ? 22 : 8));
      A.sh.rotation.z = A.a * A.sx; A.sh.rotation.x = A.f;
      A.hand.rotation.z = wave && lead ? Math.sin(S.at * 11 + 1) * 0.5 * A.sx : Math.sin(t * 1.75 + i) * 0.08 * A.sx;
    });
    // ojos: expresión + parpadeo (a veces doble) + rebote al hablar
    S.nextBlink -= dt; if (S.nextBlink <= 0) { S.blink = 0.15; S.nextBlink = Math.random() < 0.22 ? 0.26 : 2 + Math.random() * 3.5; }
    let open = 1; if (S.blink > 0) { S.blink -= dt; const k = 1 - Math.abs(S.blink / 0.075 - 1); open = 1 - Math.max(0, k) * 0.94; }
    const ex = S.expr, happy = cheer || S.act === 'girar';
    // 8 expresiones (sólo con los ojos): normal, feliz, sorpresa, guiño, estrellas, triste, pensativo y enojado
    const kind = happy ? 'happy' : ex === 'sorpresa' ? 'wow' : ex === 'estrellas' ? 'star' : ex === 'triste' ? 'sad' : ex === 'enojado' ? 'ang' : ex === 'pensativo' ? 'think' : 'open';
    eyes.forEach((e, i) => { const wink = ex === 'guiño' && i === 1, map = wink ? EYE.wink : kind === 'sad' ? EYE[i ? 'sadR' : 'sadL'] : kind === 'ang' ? EYE[i ? 'angR' : 'angL'] : EYE[kind];
      if (e.material.map !== map) e.material.map = map;
      const sy = (happy || wink || kind === 'star' ? 1 : open) * (S.talk ? 1 + Math.abs(Math.sin(t * 10)) * 0.05 : 1);
      e.scale.set(kind === 'wow' ? 1.06 : 1, sy, 1); e.material.opacity = 0.9 + Math.sin(t * 3 + i) * 0.1; });
    // boquita: aparece al hablar (se abre y se cierra), sonrisa cuando está feliz, "o" de sorpresa
    let mMap = MOUTH.smile, mOp = 0, mSy = 1;
    if (S.talk) { S.moT -= dt; if (S.moT < 0) { S.moT = 0.07 + Math.random() * 0.1; S.mo = Math.random() < 0.18 ? 0 : 0.35 + Math.random() * 0.65; } mMap = MOUTH.open; mOp = 1; mSy = 0.25 + S.mo * 0.75; }
    else if (ex === 'sorpresa') { mMap = MOUTH.o; mOp = 1; }
    else if (ex === 'estrellas') { mMap = MOUTH.open; mOp = 1; mSy = 0.8; }
    else if (ex === 'triste' || ex === 'enojado') { mMap = MOUTH.frown; mOp = 1; }
    else if (ex === 'pensativo') { mMap = MOUTH.flat; mOp = 1; }
    else if (happy || ex === 'feliz' || ex === 'guiño') { mMap = MOUTH.smile; mOp = 1; }
    if (mouth.material.map !== mMap) mouth.material.map = mMap;
    mouth.material.opacity += (mOp - mouth.material.opacity) * Math.min(1, dt * 14); mouth.scale.y += (mSy - mouth.scale.y) * Math.min(1, dt * 22);
    // luces que respiran: audífonos, base y el aro del piso con sus ondas
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.3);
    ears.forEach(e => { e.halo.material.opacity = 0.28 + pulse * 0.32; });
    baseGlow.material.opacity = 0.3 + pulse * 0.3; baseGlow.scale.setScalar(0.3 + pulse * 0.08);
    const hgt = hover.position.y, near = Math.max(0, 1 - (hgt - 0.12) * 2.2);
    floorRing.scale.setScalar(0.6 + pulse * 0.05 + (hgt - 0.16) * 0.6); floorRing.material.opacity = (0.55 + pulse * 0.35) * (0.5 + near * 0.5);
    floorGlow.material.opacity = (0.22 + pulse * 0.16) * (0.4 + near * 0.6);
    ripples.forEach((r, k) => { const ph = (t * 0.42 + k / 3) % 1; r.scale.setScalar(0.62 + ph * 0.75); r.material.opacity = Math.sin(ph * Math.PI) * (1 - ph) * 0.7 * (0.4 + near * 0.6); });
  }
  return { root, update, expr, accion, hablar, mirar, brazo, palma, CLAP, manos: { '-1': arms[0].hand, 1: arms[1].hand }, env };
}
window.crearMoli = crearMoli;
