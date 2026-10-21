// ===================================================================
//  MOLÍ 3 · BRAZO 3D: el brazo de Molí visto desde sus ojos, pegado a la cámara del aula.
//  Antebrazo blanco cortito y abultado, codo oscuro con luz roja, triángulo blanco hundido cuya silueta brilla en rojo
//  y 3 deditos azules. Sube y baja despacito y se tambalea suave cuando está arriba.
//  BrazoMoli(THREE, renderer, cam) -> { brazo(on), luz(on), hit(nx, ny), update() }
// ===================================================================
function BrazoMoli(THREE, renderer, cam) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // ---- reflejos: estudio de luz hecho a mano (igual que el Molí 3D) para que el plástico brille ----
  const sstep = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  let env = null;
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
    const pm = new THREE.PMREMGenerator(renderer); env = pm.fromScene(es, 0.04).texture; pm.dispose();
  } catch (e) { }
  const PM = (o) => new THREE.MeshPhysicalMaterial(Object.assign({ metalness: 0, envMap: env, fog: false }, o, { envMapIntensity: 0.5 }));
  const malla = (g, m, p, rot, padre) => { const o = new THREE.Mesh(g, m); if (p) o.position.set(...p); if (rot) o.rotation.set(...rot); padre.add(o); return o; };
  const lienzo = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t; };

  const BL = PM({ color: 0xf1f4f8, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.12, envMapIntensity: 1 });
  const AZ = PM({ color: 0x1b2c80, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1 });
  const OSC = PM({ color: 0x141820, roughness: 0.3, clearcoat: 0.8 });
  const UNION = new THREE.MeshStandardMaterial({ color: 0x8792a6, roughness: 0.5 });
  const brazo = new THREE.Group(); brazo.renderOrder = 10; cam.add(brazo);
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

  // si la escena trabaja en sRGB, los colores (escritos en sRGB) se pasan a lineal
  if (renderer.outputEncoding === THREE.sRGBEncoding) { const vistos = new Set();
    [brazo, hombro].forEach(r => r.traverse(o => { if (!o.material || vistos.has(o.material)) return; const m = o.material; vistos.add(m);
      if (m.map) m.map.encoding = THREE.sRGBEncoding; else if (m.color) m.color.convertSRGBToLinear(); })); }

  // poses del brazo (abajo escondido / arriba mostrando la luz), pensadas para un ángulo de visión de 44° (72° en celular parado)
  const POSE = { abajo: { p: V(-0.22, -0.52, -0.62), r: V(-0.3, 0.3, 0.3) }, arriba: { p: V(-0.22, -0.12, -0.62), r: V(-0.3, 0.3, 0.7) } };
  let objetivo = 0, luzOn = false, vis = 0, desde = 0, t0 = 0;
  const t00 = performance.now() / 1000;
  function update() {
    const ahora = performance.now() / 1000, t = ahora - t00, asp = cam.aspect;
    const f = Math.tan((asp < 1 ? 72 : 44) * Math.PI / 360) / Math.tan(cam.fov * Math.PI / 360);   // mismo tamaño en pantalla con cualquier ángulo de visión
    vis = desde + Math.sign(objetivo - desde) * Math.min(Math.abs(objetivo - desde), (ahora - t0) / 1.6);
    const k = vis, e = k * k * k * (k * (6 * k - 15) + 10), a = POSE.abajo, b = POSE.arriba, dx = asp < 1 ? 0.1 : -0.08 * Math.min(asp - 1, 1);
    brazo.position.set(a.p.x + dx + (b.p.x - a.p.x) * e, a.p.y + (b.p.y - a.p.y) * e, a.p.z);
    brazo.rotation.set(a.r.x + (b.r.x - a.r.x) * e, a.r.y + (b.r.y - a.r.y) * e, a.r.z + (b.r.z - a.r.z) * e);
    brazo.rotation.z += (Math.sin(t * 1.25) * 0.022 + Math.sin(t * 2.1) * 0.008) * e;
    brazo.rotation.x += Math.sin(t * 0.9 + 1) * 0.02 * e;
    brazo.position.y += Math.sin(t * 1.6) * 0.005 * e; brazo.position.x += Math.sin(t * 0.8) * 0.003 * e;
    brazo.position.multiplyScalar(f); brazo.scale.setScalar((asp < 1 ? 0.46 : 0.6) * f);
    brazo.visible = k > 0.002;
    brazo.updateMatrix(); codoC.set(-0.012, 0, 0).applyMatrix4(brazo.matrix);
    const hb = HOMBRO.clone(); if (asp < 1) hb.x = -0.18; hb.multiplyScalar(f);
    dirC.subVectors(hb, codoC); const largo = dirC.length(); dirC.normalize();
    hombro.position.copy(codoC); hombro.quaternion.setFromUnitVectors(Y, dirC);
    const rr = 0.078 * brazo.scale.x; hombro.scale.set(rr, largo, rr); hombro.visible = brazo.visible;
    const on = luzOn && Math.floor(t * 3.4) % 2 === 0;
    neon.material.opacity = luzOn ? (on ? 1 : 0.1) : 0; rayos.material.opacity = luzOn ? (on ? 1 : 0) : 0;
    codoLuz.material.color.setHex(luzOn && !on ? 0x7a1820 : 0xff2b3b);
  }

  const ray = new THREE.Raycaster(), m2 = new THREE.Vector2();
  return {
    brazo(on) { desde = vis; t0 = performance.now() / 1000; objetivo = on ? 1 : 0; },
    luz(on) { luzOn = !!on; },
    hit(nx, ny) { if (!brazo.visible) return false; m2.set(nx, ny); ray.setFromCamera(m2, cam); return ray.intersectObjects([decal, rayos], false).length > 0; },
    update
  };
}
