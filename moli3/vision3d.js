// ===================================================================
//  MOLÍ 3 · VISIÓN 3D: lo que Molí ve desde sus ojos.
//  Una mesa con carpetas en un organizador, un vaso con lápices y el brazo de Molí
//  (antebrazo blanco abultado, codo oscuro con luz roja, triángulo rojo neón y 3 deditos azules).
//  Vision3D(THREE, canvas) -> { brazo(on), luz(on), hit(x, y), caja() }
// ===================================================================
function Vision3D(THREE, canvas) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  R.outputEncoding = THREE.sRGBEncoding;
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.92;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;

  const S = new THREE.Scene();
  S.background = new THREE.Color(0xd9e2ee);
  S.fog = new THREE.Fog(0xd9e2ee, 2.6, 6);

  // ---- reflejos: estudio de luz hecho a mano (igual que el Molí 3D) ----
  const sstep = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  try {
    const es = new THREE.Scene(), sg = new THREE.SphereGeometry(10, 32, 16), q = sg.attributes.position, col = [];
    for (let i = 0; i < q.count; i++) { const h = q.getY(i) / 10, k1 = sstep(-0.5, 0.15, h), k2 = sstep(0.3, 0.95, h);
      [0.4 + 0.52 * k1, 0.44 + 0.52 * k1, 0.54 + 0.44 * k1].forEach(v => col.push(v + (1.12 - v) * k2)); }
    sg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    es.add(new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const panel = (w, h, p, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); es.add(m); };
    panel(7, 3.5, [-4.5, 6, 5], new THREE.Color(2.8, 2.8, 2.7));
    panel(2.5, 6, [7, 1.5, 3], new THREE.Color(1.3, 1.4, 1.5));
    panel(6, 2, [0, 2.5, -8], new THREE.Color(0.5, 1.0, 2.0));
    const pm = new THREE.PMREMGenerator(R); S.environment = pm.fromScene(es, 0.04).texture; pm.dispose();
  } catch (e) { }

  // ---- luces ----
  S.add(new THREE.HemisphereLight(0xffffff, 0xb08a66, 0.45));
  const sol = new THREE.DirectionalLight(0xfff1de, 1.7);
  sol.position.set(-1.3, 2.4, 1.0); sol.target.position.set(0, 0.75, -0.1);
  sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.01;
  Object.assign(sol.shadow.camera, { left: -1.1, right: 1.1, top: 1.1, bottom: -1.1, near: 0.5, far: 6 });
  S.add(sol, sol.target);
  const relleno = new THREE.DirectionalLight(0xcfe2ff, 0.45); relleno.position.set(1.6, 1.2, 1.4); S.add(relleno);

  // ---- ayudas ----
  const PM = (o) => new THREE.MeshPhysicalMaterial(Object.assign({ metalness: 0, envMapIntensity: 0.45 }, o));
  const rrect = (w, h, r) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
  const rbox = (w, h, d, r) => { const b = Math.min(r, d / 2 - 1e-4, w / 2 - 1e-4, h / 2 - 1e-4) * 0.9;
    const g = new THREE.ExtrudeGeometry(rrect(w - 2 * b, h - 2 * b, Math.max(Math.min(r, w / 2, h / 2) - b, 0.0005)),
      { depth: Math.max(d - 2 * b, 0.0001), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 6 });
    g.translate(0, 0, -Math.max(d - 2 * b, 0.0001) / 2); g.computeVertexNormals(); return g; };
  const malla = (g, m, p, rot, padre) => { const o = new THREE.Mesh(g, m); if (p) o.position.set(...p); if (rot) o.rotation.set(...rot);
    o.castShadow = o.receiveShadow = true; (padre || S).add(o); return o; };
  const lienzo = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; };
  const etiqueta = (txt, fondo, tinta, w = 384, h = 128, fs = 64) => lienzo(w, h, (g) => {
    g.fillStyle = fondo; g.beginPath(); g.roundRect ? g.roundRect(0, 0, w, h, h * 0.22) : g.rect(0, 0, w, h); g.fill();
    g.fillStyle = tinta; g.font = `800 ${fs}px "Baloo 2", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + fs * 0.06); });
  const plano = (w, h, tex, p, padre, extra) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial(Object.assign({ map: tex, roughness: 0.6, transparent: true }, extra))); m.position.set(...p); (padre || S).add(m); return m; };

  // ---- cuarto: pared, ventana, corcho ----
  malla(new THREE.PlaneGeometry(10, 5), new THREE.MeshStandardMaterial({ color: 0xe6ecf4, roughness: 0.95 }), [0, 1.8, -0.8]).castShadow = false;
  const ventana = new THREE.Group(); ventana.position.set(-1.05, 1.5, -0.78); S.add(ventana);
  malla(rbox(0.9, 0.62, 0.04, 0.02), PM({ color: 0xffffff, roughness: 0.4 }), [0, 0, 0], null, ventana);
  const vidrio = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.54), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.65, 1.85), fog: false }));
  vidrio.position.z = 0.022; ventana.add(vidrio);
  malla(new THREE.BoxGeometry(0.02, 0.54, 0.02), PM({ color: 0xffffff }), [0, 0, 0.03], null, ventana);
  const corcho = new THREE.Group(); corcho.position.set(1.0, 1.42, -0.78); S.add(corcho);
  malla(rbox(0.8, 0.52, 0.03, 0.015), PM({ color: 0xffffff, roughness: 0.4 }), [0, 0, 0], null, corcho);
  malla(new THREE.BoxGeometry(0.74, 0.46, 0.01), new THREE.MeshStandardMaterial({ color: 0xc89a66, roughness: 1 }), [0, 0, 0.012], null, corcho);
  [[-0.2, 0.08, 0xfef08a, -0.08], [0.06, 0.1, 0xbfdbfe, 0.06], [0.24, -0.05, 0xfbcfe8, -0.04], [-0.12, -0.12, 0xbbf7d0, 0.1]].forEach(([x, y, c, r]) => {
    malla(new THREE.BoxGeometry(0.16, 0.12, 0.002), new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }), [x, y, 0.02], [0, 0, r], corcho);
    malla(new THREE.SphereGeometry(0.008, 12, 8), PM({ color: 0xef4444 }), [x, y + 0.045, 0.026], null, corcho); });

  // ---- mesa de madera ----
  const madera = lienzo(1024, 512, (g, w, h) => {
    g.fillStyle = '#c88f58'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const y = Math.random() * h, a = 0.03 + Math.random() * 0.08;
      g.strokeStyle = Math.random() < 0.5 ? `rgba(110,60,25,${a})` : `rgba(255,220,170,${a})`; g.lineWidth = 1 + Math.random() * 3;
      g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x / 140 + i) * 4); g.stroke(); } });
  madera.wrapS = madera.wrapT = THREE.RepeatWrapping; madera.repeat.set(2, 1);
  malla(new THREE.BoxGeometry(3.4, 0.05, 1.7), PM({ map: madera, roughness: 0.45, clearcoat: 0.35, clearcoatRoughness: 0.35 }), [0, 0.725, 0.05]).castShadow = false;

  // ---- organizador blanco con 6 carpetas ----
  const org = new THREE.Group(); org.position.set(0, 0.75, -0.05); S.add(org);
  const BLANCO = PM({ color: 0xf6f7f9, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const NAVY = PM({ color: 0x14205a, roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.12 });
  malla(rbox(0.7, 0.36, 0.02, 0.01), BLANCO, [0, 0.01, 0], [Math.PI / 2, 0, 0], org);
  const lado = new THREE.Shape(); [[0.18, 0], [0.18, 0.1], [0.06, 0.15], [-0.08, 0.21], [-0.18, 0.24], [-0.18, 0]].forEach(([z, y], i) => i ? lado.lineTo(-z, y) : lado.moveTo(-z, y));
  [-0.34, 0.34].forEach(x => { const g = new THREE.ExtrudeGeometry(lado, { depth: 0.01, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 });
    g.rotateY(Math.PI / 2); g.translate(x - 0.005, 0, 0); malla(g, BLANCO, [0, 0, 0], null, org); });
  malla(rbox(0.7, 0.24, 0.016, 0.008), BLANCO, [0, 0.12, -0.18], null, org);
  malla(rbox(0.7, 0.1, 0.016, 0.008), BLANCO, [0, 0.05, 0.18], null, org);
  malla(rbox(0.2, 0.05, 0.008, 0.02), NAVY, [0, 0.055, 0.19], null, org);
  plano(0.18, 0.045, etiqueta('6.° CyT', 'rgba(0,0,0,0)', '#ffffff', 384, 96, 64), [0, 0.055, 0.1945], org, { roughness: 0.4 });
  [-0.075, 0.075].forEach(x => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.005, 12, 8), new THREE.MeshBasicMaterial({ color: 0x5fd0ff })); l.position.set(x * 1.05, 0.055, 0.195); org.add(l); });
  const CARP = [['CIENCIA', 0xe5484d], ['TAREAS', 0xf59e0b], ['MISIONES', 0x10b981], ['EXIT', 0x3b82f6], ['NOTAS', 0x8b5cf6], ['LAB', 0xec4899]];
  const TABX = [-0.17, -0.06, 0.05, 0.16, -0.12, 0.1];
  CARP.forEach(([txt, col], i) => {
    const k = CARP.length - 1 - i;                   // la primera queda adelante
    const f = new THREE.Group(); f.position.set(0, 0.155 + k * 0.024, 0.13 - k * 0.05); f.rotation.x = -0.1; org.add(f);
    const mat = PM({ color: col, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4 });
    malla(rbox(0.6, 0.27, 0.008, 0.012), mat, [0, 0, 0], null, f);
    malla(new THREE.BoxGeometry(0.57, 0.26, 0.006), new THREE.MeshStandardMaterial({ color: 0xfbfbf8, roughness: 0.9 }), [0.008, 0.012, -0.008], null, f);
    malla(rbox(0.12, 0.05, 0.008, 0.012), mat, [TABX[i], 0.15, 0], null, f);
    plano(0.105, 0.03, etiqueta(txt, '#ffffff', '#1f2937', 384, 112, 66), [TABX[i], 0.153, 0.0045], f);
  });

  // ---- carpetas echadas a la izquierda ----
  const pila = new THREE.Group(); pila.position.set(-0.68, 0.75, 0.12); pila.rotation.y = 0.18; S.add(pila);
  [[0x3b82f6, 0], [0xfbbf24, 0.05], [0x10b981, -0.04]].forEach(([c, r], i) => {
    malla(new THREE.BoxGeometry(0.33, 0.006, 0.25), new THREE.MeshStandardMaterial({ color: 0xfbfbf8, roughness: 0.9 }), [0.01, 0.012 + i * 0.02, -0.005], [0, r, 0], pila);
    malla(rbox(0.36, 0.27, 0.008, 0.012), PM({ color: c, roughness: 0.5, clearcoat: 0.25 }), [0, 0.006 + i * 0.02, 0], [-Math.PI / 2, 0, r], pila); });

  // ---- vaso con lápices a la derecha ----
  const vaso = new THREE.Group(); vaso.position.set(0.66, 0.75, 0.05); S.add(vaso);
  malla(new THREE.CylinderGeometry(0.058, 0.052, 0.14, 48, 1, true), PM({ color: 0xffffff, roughness: 0.2, clearcoat: 1, side: THREE.DoubleSide }), [0, 0.07, 0], null, vaso);
  malla(new THREE.CylinderGeometry(0.052, 0.052, 0.006, 48), PM({ color: 0xe5e9f0 }), [0, 0.003, 0], null, vaso);
  malla(new THREE.TorusGeometry(0.058, 0.003, 8, 48), PM({ color: 0xffffff }), [0, 0.14, 0], [Math.PI / 2, 0, 0], vaso);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 8), new THREE.MeshBasicMaterial({ color: 0x5fd0ff })); led.position.set(0, 0.07, 0.056); vaso.add(led);
  [[0xf59e0b, -0.022, -0.2, 0.18], [0xef4444, 0.004, 0.02, 0.21], [0x3b82f6, 0.024, 0.22, 0.17], [0x22c55e, -0.006, -0.08, 0.19]].forEach(([c, x, r, l]) => {
    const lp = new THREE.Group(); lp.position.set(x, 0.02, x * 0.5); lp.rotation.z = r; vaso.add(lp);
    malla(new THREE.CylinderGeometry(0.0065, 0.0065, l, 6), PM({ color: c, roughness: 0.35, clearcoat: 0.5 }), [0, l / 2, 0], null, lp);
    malla(new THREE.ConeGeometry(0.0065, 0.022, 6), new THREE.MeshStandardMaterial({ color: 0xf1c9a0, roughness: 0.8 }), [0, l + 0.011, 0], null, lp);
    malla(new THREE.ConeGeometry(0.0022, 0.007, 6), new THREE.MeshStandardMaterial({ color: 0x333333 }), [0, l + 0.0195, 0], null, lp); });

  // ---- cámara = ojos de Molí ----
  const cam = new THREE.PerspectiveCamera(44, 1, 0.02, 20); S.add(cam);
  const OJO = V(0, 1.12, 0.82), MIRA = V(0, 0.9, -0.08);
  cam.position.copy(OJO); cam.lookAt(MIRA); const qBase = cam.quaternion.clone();

  // ---- brazo de Molí (en el espacio de la cámara) ----
  const BL = PM({ color: 0xf4f6f9, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.12, envMapIntensity: 1 });
  const AZ = PM({ color: 0x1b2c80, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1 });
  const OSC = PM({ color: 0x141820, roughness: 0.3, clearcoat: 0.8 });
  const UNION = new THREE.MeshStandardMaterial({ color: 0x8792a6, roughness: 0.5 });
  const brazo = new THREE.Group(); cam.add(brazo);
  const torno = (n, largo, radio) => { const pts = []; for (let i = 0; i <= n; i++) { const u = i / n; pts.push(new THREE.Vector2(Math.max(radio(u), 1e-4), u * largo)); }
    const g = new THREE.LatheGeometry(pts, 64); g.rotateZ(-Math.PI / 2); return g; };   // eje Y -> eje X
  const LA = 0.24;                                                   // antebrazo cortito
  const rA = u => (0.084 + 0.026 * Math.sin(Math.PI * Math.pow(u, 0.85))) * Math.pow(Math.max(0, 1 - Math.pow(2 * u - 1, 12)), 0.22);
  const ante = malla(torno(60, LA, rA), BL, [0, 0, 0], null, brazo);
  const anillo = (x, r, t) => { const g = new THREE.TorusGeometry(r, t, 8, 64); g.rotateY(Math.PI / 2); return malla(g, UNION, [x, 0, 0], null, brazo); };
  anillo(LA * 0.13, rA(0.13) + 0.0004, 0.0016);
  // costura de arriba (panel)
  { const g = new THREE.TorusGeometry(rA(0.66) + 0.0004, 0.0014, 6, 32, 0.9); g.rotateY(Math.PI / 2); g.rotateX(Math.PI / 2 - 0.45); malla(g, UNION, [LA * 0.66, 0, 0], null, brazo); }
  // muñeca
  const rM = u => 0.072 * Math.pow(Math.max(0, 1 - Math.pow(2 * u - 1, 8)), 0.28);
  malla(torno(30, 0.06, rM), BL, [LA - 0.012, 0, 0], null, brazo);
  anillo(LA - 0.004, 0.071, 0.003);
  // 3 deditos azules ovalados, separados
  const dedo = new THREE.SphereGeometry(1, 40, 20);
  [[0.064, 0.38], [0, 0.04], [-0.064, -0.3]].forEach(([y, r], i) => {
    const d = malla(dedo, AZ, [LA + 0.085 - (i === 1 ? 0 : 0.008), y, 0.012], [0, 0, r], brazo); d.scale.set(0.066, 0.025, 0.03); });
  // codo oscuro con lucecita roja + brazo de arriba
  malla(new THREE.SphereGeometry(0.083, 40, 24), OSC, [-0.012, 0, 0], null, brazo);
  const codoLuz = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.0035, 10, 32), new THREE.MeshBasicMaterial({ color: 0xff2b3b }));
  codoLuz.position.set(-0.03, 0.04, 0.066); codoLuz.rotation.set(-0.5, -0.4, 0); brazo.add(codoLuz);
  // brazo de arriba: va del codo hacia el hombro de Molí (abajo y cerca de sus ojos), así nunca se ve suelto
  const hombroG = new THREE.CylinderGeometry(1, 1, 1, 48, 1, true); hombroG.translate(0, 0.5, 0);
  const hombro = new THREE.Mesh(hombroG, BL); cam.add(hombro);
  const HOMBRO = V(-0.3, -0.5, -0.36), codoC = V(), dirC = V(), Y = V(0, 1, 0);

  // triángulo de aviso: hundido y oscuro, con línea roja neón
  const curvo = (w, h, rad) => { const g = new THREE.PlaneGeometry(w, h, 24, 24), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, Math.sqrt(Math.max(rad * rad - y * y, 0)) - rad); } g.computeVertexNormals(); return g; };
  const triang = (g, cx, cy, s) => { g.beginPath(); for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 3; g.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s); } g.closePath(); };
  const conGiro = (g, w, f) => { g.save(); g.translate(w / 2, w / 2); g.rotate(Math.PI / 2 - 0.2); g.translate(-w / 2, -w / 2); f(); g.restore(); };
  // símbolo blanco un poquito hundido en el brazo; solo su silueta brilla en rojo
  const hundido = (g, dibuja) => {
    g.save(); dibuja(); g.fillStyle = '#e9edf3'; g.fill(); g.clip();
    g.shadowColor = 'rgba(60,72,96,.75)'; g.shadowBlur = 18; g.shadowOffsetY = 7; g.lineWidth = 26; g.strokeStyle = 'rgba(120,130,150,.9)'; dibuja(); g.stroke();
    g.restore();
    g.save(); dibuja(); g.lineWidth = 3; g.strokeStyle = 'rgba(110,120,140,.55)'; g.stroke(); g.restore(); };
  const exc = (g) => { g.beginPath(); g.moveTo(244, 196); g.lineTo(268, 196); g.lineTo(262, 284); g.lineTo(250, 284); g.closePath(); g.moveTo(256 + 15, 318); g.arc(256, 318, 15, 0, 7); };
  const baseTex = lienzo(512, 512, (g, w) => conGiro(g, w, () => {
    g.lineJoin = 'round'; hundido(g, () => triang(g, 256, 272, 165));
    g.save(); triang(g, 256, 272, 165); g.clip(); hundido(g, () => exc(g)); g.restore(); }));
  const luzTex = lienzo(512, 512, (g, w) => conGiro(g, w, () => {
    g.lineJoin = 'round'; g.shadowColor = '#ff1a3a';
    for (const [bl, lw, c] of [[50, 16, 'rgba(255,26,58,.6)'], [22, 10, '#ff1f3d'], [6, 4, '#ffb3bd']]) {
      g.shadowBlur = bl; g.strokeStyle = c; g.lineWidth = lw; triang(g, 256, 272, 168); g.stroke(); } }));
  const rayosTex = lienzo(512, 512, (g, w) => { g.lineCap = 'round'; g.shadowColor = '#ff1a3a'; g.shadowBlur = 16; g.strokeStyle = '#ff1f3d'; g.lineWidth = 11;
    for (let k = 0; k < 9; k++) { const a = -Math.PI * 0.95 + k * Math.PI * 0.24 - 0.2 + Math.PI / 2 - 0.2, r0 = 175, r1 = 215 + (k % 2) * 20;
      g.beginPath(); g.moveTo(256 + Math.cos(a) * r0, 256 + Math.sin(a) * r0); g.lineTo(256 + Math.cos(a) * r1, 256 + Math.sin(a) * r1); g.stroke(); }
    const rg = g.createRadialGradient(256, 256, 40, 256, 256, 200); rg.addColorStop(0, 'rgba(255,30,60,.28)'); rg.addColorStop(1, 'rgba(255,30,60,0)'); g.shadowBlur = 0; g.fillStyle = rg; g.fillRect(0, 0, 512, 512); });
  const XT = LA * 0.55, RT = rA(0.55);
  const decal = new THREE.Mesh(curvo(0.15, 0.15, RT), new THREE.MeshPhysicalMaterial({ map: baseTex, transparent: true, roughness: 0.3, clearcoat: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  decal.position.set(XT, 0, 0.0008); brazo.add(decal);
  const ADD = (t) => new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -4 });
  const neon = new THREE.Mesh(curvo(0.15, 0.15, RT), ADD(luzTex)); neon.position.set(XT, 0, 0.0012); brazo.add(neon);
  const rayos = new THREE.Mesh(curvo(0.25, 0.25, RT), ADD(rayosTex)); rayos.position.set(XT, 0, 0.0016); brazo.add(rayos);
  [decal, neon, rayos].forEach(m => m.geometry.translate(0, 0, RT));
  brazo.traverse(o => { if (o.isMesh) o.castShadow = false; });

  // poses del brazo (abajo escondido / arriba mostrando la luz)
  const POSE = { abajo: { p: V(-0.22, -0.52, -0.62), r: V(-0.3, 0.3, 0.3) }, arriba: { p: V(-0.22, -0.12, -0.62), r: V(-0.3, 0.3, 0.7) } };
  let objetivo = 0, k = 0, luzOn = false, vis = 0, desde = 0, t0 = 0;
  function poner(kk) {
    const a = POSE.abajo, b = POSE.arriba, asp = cam.aspect, dx = asp < 1 ? 0.1 : -0.08 * Math.min(asp - 1, 1);
    brazo.position.set(a.p.x + dx + (b.p.x - a.p.x) * kk, a.p.y + (b.p.y - a.p.y) * kk, a.p.z);
    brazo.rotation.set(a.r.x + (b.r.x - a.r.x) * kk, a.r.y + (b.r.y - a.r.y) * kk, a.r.z + (b.r.z - a.r.z) * kk);
    brazo.scale.setScalar(asp < 1 ? 0.46 : 0.6);
  }

  // los colores se escribieron en sRGB: pasarlos a lineal para que no se vean lavados
  { const vistos = new Set(); S.traverse(o => { const ms = o.material ? [].concat(o.material) : [];
    ms.forEach(m => { if (vistos.has(m)) return; vistos.add(m); if (m.color && !m.map) m.color.convertSRGBToLinear(); }); }); }

  // ---- tamaño y bucle ----
  function tam() { const w = canvas.clientWidth, h = canvas.clientHeight; R.setSize(w, h, false); cam.aspect = w / h;
    cam.fov = cam.aspect < 1 ? 72 : 44; cam.updateProjectionMatrix(); }
  window.addEventListener('resize', tam); tam();
  const reloj = new THREE.Clock(); let t = 0;
  const eul = new THREE.Euler(), qq = new THREE.Quaternion();
  function bucle() {
    const dt = Math.min(reloj.getDelta(), 0.12); t += dt;
    // cabeza que se mueve un poquito
    eul.set(Math.sin(t * 0.37) * 0.012, Math.sin(t * 0.23) * 0.022, Math.sin(t * 0.31) * 0.006); qq.setFromEuler(eul);
    cam.quaternion.copy(qBase).multiply(qq);
    // brazo con resorte suave
    // brazo: sube y baja despacito (1.6 s) y se tambalea suave cuando está arriba
    { const ahora = performance.now() / 1000; vis = desde + Math.sign(objetivo - desde) * Math.min(Math.abs(objetivo - desde), (ahora - t0) / 1.6); }
    k = vis; const e = k * k * k * (k * (6 * k - 15) + 10);
    poner(e); brazo.visible = k > 0.002;
    brazo.rotation.z += (Math.sin(t * 1.25) * 0.022 + Math.sin(t * 2.1) * 0.008) * e;
    brazo.rotation.x += Math.sin(t * 0.9 + 1) * 0.02 * e;
    brazo.position.y += Math.sin(t * 1.6) * 0.005 * e; brazo.position.x += Math.sin(t * 0.8) * 0.003 * e;
    brazo.updateMatrix(); codoC.set(-0.012, 0, 0).applyMatrix4(brazo.matrix);
    const hb = HOMBRO.clone(); if (cam.aspect < 1) hb.x = -0.18;
    dirC.subVectors(hb, codoC); const largo = dirC.length(); dirC.normalize();
    hombro.position.copy(codoC); hombro.quaternion.setFromUnitVectors(Y, dirC);
    const rr = 0.078 * brazo.scale.x; hombro.scale.set(rr, largo, rr); hombro.visible = brazo.visible;
    const on = luzOn && Math.floor(t * 3.4) % 2 === 0;
    neon.material.opacity = luzOn ? (on ? 1 : 0.1) : 0; rayos.material.opacity = luzOn ? (on ? 1 : 0) : 0;
    codoLuz.material.color.setHex(luzOn && !on ? 0x7a1820 : 0xff2b3b);
    R.render(S, cam); requestAnimationFrame(bucle);
  }
  requestAnimationFrame(bucle);

  const ray = new THREE.Raycaster(), m2 = new THREE.Vector2();
  return {
    _dbg: { brazo, cam, S, R, POSE, set k(v) { vis = desde = objetivo = v; } },
    brazo(on) { desde = vis; t0 = performance.now() / 1000; objetivo = on ? 1 : 0; },
    luz(on) { luzOn = !!on; },
    hit(x, y) { if (!brazo.visible) return false; const r = canvas.getBoundingClientRect();
      m2.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1); ray.setFromCamera(m2, cam);
      return ray.intersectObjects([decal, rayos], false).length > 0; },
    caja() { const b = new THREE.Box3().setFromObject(org), r = canvas.getBoundingClientRect(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let i = 0; i < 8; i++) { const v = V(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).project(cam);
        const sx = (v.x + 1) / 2 * r.width, sy = (1 - v.y) / 2 * r.height; x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy); }
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; }
  };
}
