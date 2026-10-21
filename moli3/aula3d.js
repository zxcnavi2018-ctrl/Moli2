// ===================================================================
//  MOLÍ 3 · AULA FUTURISTA: el aula de ciencia (como la de Molí 2) pero limpia y tecnológica.
//  Mesas hexagonales blancas con luz celeste en el borde, sillas de concha, cuaderno de sesiones
//  de vidrio con holograma, el corcho convertido en pantalla moderna y el muro «Área de Ciencia».
//  AulaMoli3(THREE, canvas) -> { renderer, camera, pos, look, ESC: [{ n, obj, from, look }], update() }
// ===================================================================
function AulaMoli3(THREE, canvas) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  R.outputEncoding = THREE.sRGBEncoding;
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.86;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  const S = new THREE.Scene();
  S.background = new THREE.Color(0xe9eef5);

  // ---- reflejos: estudio de luz hecho a mano ----
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

  // ---- ayudas ----
  const C = h => new THREE.Color(h).convertSRGBToLinear();
  const PM = (o) => { const m = new THREE.MeshPhysicalMaterial(Object.assign({ metalness: 0, envMapIntensity: 0.6 }, o)); if (o.color !== undefined && !o.map) m.color = C(o.color); return m; };
  const LUZ = (hex, k = 1) => new THREE.MeshBasicMaterial({ color: C(hex).multiplyScalar(k), toneMapped: false });
  const malla = (g, m, p, rot, padre, sombra = true) => { const o = new THREE.Mesh(g, m); if (p) o.position.set(...p); if (rot) o.rotation.set(...rot);
    o.castShadow = o.receiveShadow = sombra; (padre || S).add(o); return o; };
  const lienzo = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; };
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const F = (peso, px) => `${peso} ${px}px "Baloo 2", "Trebuchet MS", sans-serif`;
  const ORB = (px) => `800 ${px}px Orbitron, "Trebuchet MS", sans-serif`;
  const cabe = (g, txt, x, y, max, peso, px) => { let k = px; g.font = F(peso, k); while (k > 16 && g.measureText(txt).width > max) { k -= 2; g.font = F(peso, k); } g.fillText(txt, x, y); };

  // ---- sala: 8 m × 9 m × 3 m ----
  const AN = 8, LA = 9, AL = 3, X = AN / 2, Z = LA / 2;
  const piso = lienzo(1024, 1024, (g, w) => {
    g.fillStyle = '#b8c3d1'; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#b3bfce' : '#bec8d5'; g.fillRect(i * 256, j * 256, 256, 256); }
    g.strokeStyle = 'rgba(120,135,160,.45)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 256, 0); g.lineTo(i * 256, w); g.stroke(); g.beginPath(); g.moveTo(0, i * 256); g.lineTo(w, i * 256); g.stroke(); } });
  piso.wrapS = piso.wrapT = THREE.RepeatWrapping; piso.repeat.set(AN / 2, LA / 2);
  malla(new THREE.PlaneGeometry(AN, LA), PM({ map: piso, roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.2 }), [0, 0, 0], [-Math.PI / 2, 0, 0]).castShadow = false;
  const techo = malla(new THREE.PlaneGeometry(AN, LA), PM({ color: 0xf4f6f9, roughness: 0.9 }), [0, AL, 0], [Math.PI / 2, 0, 0]); techo.castShadow = false;
  const paredTex = lienzo(512, 512, (g, w) => { g.fillStyle = '#f3f6fa'; g.fillRect(0, 0, w, w); g.fillStyle = 'rgba(150,165,190,.35)'; g.fillRect(0, 0, 3, w); g.fillRect(0, 0, w, 2); });
  paredTex.wrapS = paredTex.wrapT = THREE.RepeatWrapping;
  const pared = (w, pos, ry) => { const t = paredTex.clone(); t.needsUpdate = true; t.repeat.set(w / 1.2, AL / 1.5);
    const m = malla(new THREE.PlaneGeometry(w, AL), PM({ map: t, roughness: 0.55 }), pos, [0, ry, 0]); m.castShadow = false; return m; };
  pared(AN, [0, AL / 2, -Z], 0); pared(AN, [0, AL / 2, Z], Math.PI); pared(LA, [-X, AL / 2, 0], Math.PI / 2); pared(LA, [X, AL / 2, 0], -Math.PI / 2);
  // líneas de luz celeste al pie y arriba de las paredes
  const CIAN = LUZ(0x5fe3ff, 1.6);
  [[AN, 0, -Z + 0.01, 0], [AN, 0, Z - 0.01, 0], [LA, -X + 0.01, 0, Math.PI / 2], [LA, X - 0.01, 0, Math.PI / 2]].forEach(([w, x, z, ry]) => {
    [0.1, AL - 0.12].forEach(y => malla(new THREE.BoxGeometry(w, 0.018, 0.01), CIAN, [x, y, z], [0, ry, 0], S, false)); });
  // paneles de luz en el techo
  const PANEL = LUZ(0xffffff, 1.4);
  for (const x of [-2, 2]) for (const z of [-3, 0, 3]) { malla(new THREE.BoxGeometry(1.4, 0.02, 0.5), PANEL, [x, AL - 0.012, z], null, S, false);
    malla(new THREE.BoxGeometry(1.46, 0.012, 0.56), LUZ(0x9feaff, 1.1), [x, AL - 0.004, z], null, S, false); }
  // ventanales a la izquierda (luz de cielo)
  const cielo = lienzo(256, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#bfe6ff'); gr.addColorStop(1, '#f2fbff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  for (const z of [-2.6, 0, 2.6]) {
    malla(new THREE.BoxGeometry(0.06, 1.9, 1.9), PM({ color: 0xffffff, roughness: 0.3 }), [-X + 0.03, 1.55, z], null, S, false);
    const vid = new THREE.Mesh(new THREE.PlaneGeometry(1.76, 1.76), new THREE.MeshBasicMaterial({ map: cielo, toneMapped: false })); vid.position.set(-X + 0.065, 1.55, z); vid.rotation.y = Math.PI / 2; S.add(vid);
    malla(new THREE.BoxGeometry(0.02, 1.76, 0.03), PM({ color: 0xffffff }), [-X + 0.075, 1.55, z], null, S, false); }

  // ---- luces ----
  S.add(new THREE.HemisphereLight(0xffffff, 0x9aa7bb, 0.55));
  const sol = new THREE.DirectionalLight(0xffffff, 1.4); sol.position.set(-3.5, 6, 2); sol.target.position.set(0, 0, 0);
  sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); sol.shadow.bias = -0.0005; sol.shadow.normalBias = 0.02;
  Object.assign(sol.shadow.camera, { left: -5, right: 5, top: 5.5, bottom: -5.5, near: 1, far: 14 }); S.add(sol, sol.target);
  const rel = new THREE.DirectionalLight(0xdbeaff, 0.35); rel.position.set(3, 4, -3); S.add(rel);

  // ---- mesas hexagonales futuristas + sillas de concha ----
  const BL = PM({ color: 0xf5f7fa, roughness: 0.22, clearcoat: 0.9, clearcoatRoughness: 0.1 }), BLD = BL.clone(); BLD.side = THREE.DoubleSide;
  const PLATA = PM({ color: 0xc9d1dc, metalness: 0.85, roughness: 0.25 });
  const NAVY = PM({ color: 0x16245e, roughness: 0.45, clearcoat: 0.4 });
  const hexTop = new THREE.CylinderGeometry(0.9, 0.9, 0.05, 6), hexLed = new THREE.CylinderGeometry(0.885, 0.885, 0.014, 6);
  const centro = new THREE.RingGeometry(0.13, 0.16, 48);
  const asiento = new THREE.CylinderGeometry(0.22, 0.2, 0.06, 32), cojin = new THREE.CylinderGeometry(0.19, 0.19, 0.02, 32);
  const respaldo = new THREE.CylinderGeometry(0.24, 0.23, 0.34, 32, 1, true, -1.1, 2.2);
  const MESAS = [[-1.9, -1.6], [1.9, -1.6], [-1.9, 1.5], [1.9, 1.5]];
  MESAS.forEach(([x, z], mi) => {
    const m = new THREE.Group(); m.position.set(x, 0, z); m.rotation.y = Math.PI / 6; S.add(m);
    malla(hexTop, BL, [0, 0.76, 0], null, m);
    malla(new THREE.CylinderGeometry(0.905, 0.905, 0.022, 6), NAVY, [0, 0.725, 0], null, m);
    malla(hexLed, CIAN, [0, 0.709, 0], null, m, false);
    malla(centro, LUZ(0x5fe3ff, 1.3), [0, 0.786, 0], [-Math.PI / 2, 0, 0], m, false);
    malla(new THREE.CylinderGeometry(0.08, 0.1, 0.7, 24), PLATA, [0, 0.38, 0], null, m);
    malla(new THREE.CylinderGeometry(0.42, 0.45, 0.03, 6), PLATA, [0, 0.015, 0], null, m);
    for (let k = 0; k < 6; k++) {                                        // una silla en cada lado del hexágono
      const a = k * Math.PI / 3, s = new THREE.Group(); s.position.set(Math.sin(a) * 1.18, 0, Math.cos(a) * 1.18); s.rotation.y = a + Math.PI; m.add(s);
      malla(asiento, BL, [0, 0.46, 0], null, s); malla(cojin, NAVY, [0, 0.5, 0], null, s);
      malla(respaldo, BLD, [0, 0.72, 0], [0, Math.PI, 0], s);
      malla(new THREE.CylinderGeometry(0.03, 0.035, 0.43, 16), PLATA, [0, 0.22, 0], null, s);
      malla(new THREE.CylinderGeometry(0.2, 0.22, 0.02, 24), PLATA, [0, 0.01, 0], null, s);
    }
  });

  // ---- 📗 cuaderno de sesiones futurista: tablet de vidrio con borde de luz y un holograma encima ----
  const mesa0 = MESAS[2], CU = V(mesa0[0] + 0.05, 0.786, mesa0[1] + 0.46);
  const cuTex = lienzo(1024, 768, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#0d1d4a'); gr.addColorStop(1, '#06102e'); g.fillStyle = gr; rr(g, 0, 0, w, h, 60); g.fill();
    g.strokeStyle = '#5fe3ff'; g.lineWidth = 10; g.shadowColor = '#5fe3ff'; g.shadowBlur = 24; rr(g, 26, 26, w - 52, h - 52, 44); g.stroke(); g.shadowBlur = 0;
    g.fillStyle = '#9ff0ff'; g.font = ORB(40); g.textAlign = 'center'; g.fillText('CUADERNO DE SESIONES', w / 2, 140);
    g.fillStyle = '#ffffff'; g.font = F(800, 110); g.fillText('6.° CyT', w / 2, 300);
    g.textAlign = 'left'; g.font = F(700, 46);
    ['Sesión 1', 'Sesión 2', 'Sesión 3'].forEach((t, i) => { const y = 400 + i * 100; g.fillStyle = 'rgba(95,227,255,.16)'; rr(g, 140, y - 50, w - 280, 76, 20); g.fill();
      g.fillStyle = '#5fe3ff'; g.beginPath(); g.arc(190, y - 12, 14, 0, 7); g.fill(); g.fillStyle = '#e8fbff'; g.fillText(t, 230, y + 4); }); });
  const cuad = new THREE.Group(); cuad.position.copy(CU); cuad.rotation.y = 0.15; S.add(cuad);
  malla(new THREE.BoxGeometry(0.34, 0.014, 0.26), PM({ color: 0x0b1438, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, metalness: 0.2 }), [0, 0.007, 0], null, cuad);
  const pantCu = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.25), new THREE.MeshBasicMaterial({ map: cuTex, toneMapped: false })); pantCu.position.y = 0.0145; pantCu.rotation.x = -Math.PI / 2; cuad.add(pantCu);
  const holoTex = lienzo(512, 320, (g, w, h) => {
    g.fillStyle = 'rgba(8,26,70,.78)'; rr(g, 8, 8, w - 16, h - 16, 26); g.fill(); g.strokeStyle = 'rgba(160,245,255,.95)'; g.lineWidth = 5; rr(g, 8, 8, w - 16, h - 16, 26); g.stroke();
    g.fillStyle = '#c8fbff'; g.font = ORB(30); g.textAlign = 'center'; g.fillText('UNIDAD 7', w / 2, 70);
    g.font = F(800, 40); g.fillStyle = '#ffffff'; g.fillText('Microorganismos', w / 2, 140); g.fillText('en acción', w / 2, 190);
    g.fillStyle = 'rgba(200,251,255,.8)'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(w / 2 - 50 + i * 50, 250, 12, 0, 7); g.fill(); } });
  const holo = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.19), new THREE.MeshBasicMaterial({ map: holoTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  holo.position.set(0, 0.24, -0.02); cuad.add(holo);
  const cono = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.03, 0.18, 24, 1, true), new THREE.MeshBasicMaterial({ color: C(0x2aa8d8), transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }));
  cono.position.set(0, 0.1, -0.02); cuad.add(cono);

  // ---- 📌 el corcho ahora es una pantalla moderna en la pared derecha ----
  const CO = window.CORCHO_M3 || { head: '🔬 CIENCIA · 6° GRADO', l1: 'La unidad a trabajar es:', unidad: 'Unidad 7 · Microorganismos en acción', l2: 'El propósito de la unidad es:', prop: '',
    normasT: 'NORMAS DEL AULA', normas: ['✋ Levanto la mano', '🤝 Trabajo en equipo', '👂 Escucho a todos', '🧹 Cuido mi aula'], cientT: '¡SOMOS CIENTÍFICOS!', pasos: ['Observo', 'Me pregunto', 'Experimento', 'Concluyo'] };
  const coTex = lienzo(2048, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0c1a46'); gr.addColorStop(1, '#050b24'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(95,227,255,.08)'; g.lineWidth = 2; for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    const tarjeta = (x, y, ww, hh) => { g.fillStyle = 'rgba(95,227,255,.10)'; rr(g, x, y, ww, hh, 34); g.fill(); g.strokeStyle = 'rgba(120,235,255,.75)'; g.lineWidth = 4; rr(g, x, y, ww, hh, 34); g.stroke(); };
    g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.font = F(800, 92); g.shadowColor = '#5fe3ff'; g.shadowBlur = 22; g.fillText(CO.head, w / 2, 150); g.shadowBlur = 0;
    tarjeta(560, 220, 930, 520);
    g.fillStyle = '#9ff0ff'; g.font = F(700, 52); g.fillText(CO.l1, w / 2, 320);
    g.fillStyle = '#ffffff'; cabe(g, CO.unidad, w / 2, 420, 860, 800, 64);
    g.fillStyle = '#9ff0ff'; g.font = F(700, 52); g.fillText(CO.l2, w / 2, 540);
    g.fillStyle = '#e8fbff'; cabe(g, CO.prop || '· · ·', w / 2, 630, 860, 600, 44);
    tarjeta(60, 220, 450, 700); g.fillStyle = '#9ff0ff'; g.font = ORB(40); g.fillText(CO.normasT, 285, 300);
    g.textAlign = 'left'; g.fillStyle = '#ffffff'; CO.normas.forEach((t, i) => cabe(g, t, 100, 410 + i * 120, 380, 700, 46));
    tarjeta(1540, 220, 450, 700); g.textAlign = 'center'; g.fillStyle = '#9ff0ff'; g.font = ORB(36); g.fillText(CO.cientT, 1765, 300);
    g.textAlign = 'left'; CO.pasos.forEach((t, i) => { const y = 420 + i * 120; g.fillStyle = ['#38bdf8', '#f59e0b', '#22c55e', '#a78bfa'][i]; g.beginPath(); g.arc(1610, y - 16, 30, 0, 7); g.fill();
      g.fillStyle = '#05102e'; g.font = F(800, 40); g.textAlign = 'center'; g.fillText(i + 1, 1610, y - 2); g.textAlign = 'left'; g.fillStyle = '#ffffff'; g.font = F(700, 48); g.fillText(t, 1665, y); });
    g.textAlign = 'center'; g.fillStyle = 'rgba(160,245,255,.7)'; g.font = ORB(30); g.fillText('CORCHO DE UNIDAD · MOLÍ 3', w / 2, 830); });
  const PANT = { c: V(X - 0.06, 1.62, 0.6), w: 3.2, h: 1.6 };
  const pant = new THREE.Group(); pant.position.copy(PANT.c); pant.rotation.y = -Math.PI / 2; S.add(pant);
  malla(new THREE.BoxGeometry(PANT.w + 0.12, PANT.h + 0.12, 0.06), PM({ color: 0x1a2030, roughness: 0.3, metalness: 0.6 }), [0, 0, -0.01], null, pant);
  const pantM = new THREE.Mesh(new THREE.PlaneGeometry(PANT.w, PANT.h), new THREE.MeshBasicMaterial({ map: coTex, toneMapped: false })); pantM.position.z = 0.022; pant.add(pantM);
  malla(new THREE.BoxGeometry(PANT.w + 0.16, 0.012, 0.012), CIAN, [0, -PANT.h / 2 - 0.08, 0.02], null, pant, false);

  // ---- 🖼️ el muro del aula: «Área de Ciencia» en letras de luz + trabajos destacados ----
  const muroTex = lienzo(2048, 1024, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.textAlign = 'center';
    g.strokeStyle = '#1b2c80'; g.lineWidth = 9; const ax = 560, ay = 150;   // átomo
    for (let k = 0; k < 3; k++) { g.save(); g.translate(ax, ay); g.rotate(k * Math.PI / 3); g.beginPath(); g.ellipse(0, 0, 70, 26, 0, 0, 7); g.stroke(); g.restore(); }
    g.fillStyle = '#22c3e6'; g.beginPath(); g.arc(ax, ay, 14, 0, 7); g.fill();
    g.fillStyle = '#16245e'; g.font = F(800, 150); g.textAlign = 'left'; g.fillText('Área de Ciencia', 660, 200);
    g.fillStyle = '#22c3e6'; g.fillRect(660, 230, 220, 10);
    g.textAlign = 'center'; g.fillStyle = '#334155'; g.font = ORB(46); g.fillText('TRABAJOS DESTACADOS', w / 2, 360); });
  const muro = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.1), new THREE.MeshStandardMaterial({ map: muroTex, transparent: true, roughness: 0.6 }));
  muro.position.set(0, 1.95, Z - 0.02); muro.rotation.y = Math.PI; S.add(muro);
  const marcoTex = lienzo(512, 400, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0c1a46'); gr.addColorStop(1, '#06102e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(95,227,255,.85)'; g.lineWidth = 8; rr(g, 14, 14, w - 28, h - 28, 26); g.stroke();
    g.fillStyle = '#9ff0ff'; g.font = F(700, 40); g.textAlign = 'center'; g.fillText('Pronto, aquí', w / 2, h / 2 - 10); g.fillText('los mejores trabajos', w / 2, h / 2 + 45); });
  [-1.25, 0, 1.25].forEach(x => { const f = new THREE.Group(); f.position.set(x, 1.15, Z - 0.03); f.rotation.y = Math.PI; S.add(f);
    malla(new THREE.BoxGeometry(1.05, 0.82, 0.04), PM({ color: 0x1a2030, roughness: 0.3, metalness: 0.6 }), [0, 0, -0.01], null, f, false);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.78), new THREE.MeshBasicMaterial({ map: marcoTex, toneMapped: false })); p.position.z = 0.012; f.add(p); });

  // ---- pizarra blanca al frente + proyector en el techo que proyecta sobre ella ----
  const piz = new THREE.Group(); piz.position.set(0, 1.6, -Z + 0.03); S.add(piz);
  malla(new THREE.BoxGeometry(4.5, 1.9, 0.05), PLATA, [0, 0, 0], null, piz, false);                       // marco de aluminio
  malla(new THREE.BoxGeometry(4.4, 1.8, 0.052), PM({ color: 0xfbfcfe, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04 }), [0, 0, 0.002], null, piz, false);
  malla(new THREE.BoxGeometry(4.0, 0.035, 0.09), PLATA, [0, -0.97, 0.05], null, piz, false);              // bandeja de plumones
  [[-1.4, 0x2563eb], [-1.25, 0xef4444], [-1.1, 0x16a34a]].forEach(([x, c]) => { const pl = malla(new THREE.CylinderGeometry(0.011, 0.011, 0.13, 12), PM({ color: c, roughness: 0.4 }), [x, -0.94, 0.06], [0, 0, Math.PI / 2], piz, false); });
  const DIA = { w: 3.1, h: 1.6 };
  const diaTex = lienzo(2048, 1056, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#0f2a66'); gr.addColorStop(1, '#081538'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(95,227,255,.10)'; g.lineWidth = 2; for (let x = 0; x < w; x += 80) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.font = ORB(150); g.shadowColor = '#5fe3ff'; g.shadowBlur = 34; g.fillText('MOLÍ 3', w / 2, h / 2 - 20); g.shadowBlur = 0;
    g.fillStyle = '#9ff0ff'; g.font = F(700, 68); g.fillText('Aula de Ciencia y Tecnología', w / 2, h / 2 + 100);
    g.fillStyle = 'rgba(159,240,255,.85)'; g.font = ORB(34); g.fillText('6.° GRADO · INNOVA SCHOOLS', w / 2, h - 90); });
  const dia = new THREE.Mesh(new THREE.PlaneGeometry(DIA.w, DIA.h), new THREE.MeshBasicMaterial({ map: diaTex, toneMapped: false, transparent: true, opacity: 0.96 }));
  dia.position.set(0, 0.05, 0.03); piz.add(dia);
  // el proyector: cuelga del techo, con su lente que brilla
  const PRO = V(0, AL - 0.42, -Z + 2.7), pro = new THREE.Group(); pro.position.copy(PRO); S.add(pro);
  malla(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 12), PLATA, [0, 0.22, 0], null, pro);
  malla(new THREE.BoxGeometry(0.44, 0.13, 0.36), BL, [0, 0, 0], null, pro);
  malla(new THREE.BoxGeometry(0.44, 0.012, 0.36), NAVY, [0, -0.07, 0], null, pro);
  malla(new THREE.CylinderGeometry(0.055, 0.06, 0.05, 32), PM({ color: 0x111827, roughness: 0.2, clearcoat: 1 }), [0.1, -0.005, -0.19], [Math.PI / 2, 0, 0], pro);
  const lente = new THREE.Mesh(new THREE.CircleGeometry(0.045, 32), LUZ(0xe8fbff, 2)); lente.position.set(0.1, -0.005, -0.216); lente.rotation.y = Math.PI; pro.add(lente);
  malla(new THREE.SphereGeometry(0.008, 12, 8), LUZ(0x5fe3ff, 2), [-0.15, 0.0, -0.181], null, pro, false);
  // el haz de luz: de la lente a las 4 esquinas de la imagen, más fuerte cerca de la lente
  const L0 = PRO.clone().add(V(0.1, -0.005, -0.216)), cz = piz.position.z + 0.03, cy = piz.position.y + 0.05;
  const esq = [V(-DIA.w / 2, cy - DIA.h / 2, cz), V(DIA.w / 2, cy - DIA.h / 2, cz), V(DIA.w / 2, cy + DIA.h / 2, cz), V(-DIA.w / 2, cy + DIA.h / 2, cz)];
  const hp = [], huv = []; for (let k = 0; k < 4; k++) { const a = esq[k], b = esq[(k + 1) % 4]; hp.push(L0.x, L0.y, L0.z, a.x, a.y, a.z, b.x, b.y, b.z); huv.push(0.5, 0, 0, 1, 1, 1); }
  const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(hp, 3)); hg.setAttribute('uv', new THREE.Float32BufferAttribute(huv, 2));
  const hazTex = lienzo(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,.12)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const haz = new THREE.Mesh(hg, new THREE.MeshBasicMaterial({ color: C(0xbfefff), alphaMap: hazTex, transparent: true, opacity: 0.085, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
  S.add(haz);
  // polvito flotando dentro del haz
  const NP = 140, pp = new Float32Array(NP * 3), sem = [];
  for (let k = 0; k < NP; k++) sem.push([Math.random(), Math.random(), Math.random(), Math.random() * 6.28]);
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const polvo = new THREE.Points(pg, new THREE.PointsMaterial({ color: C(0xe8fbff), size: 0.012, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  S.add(polvo);
  const polvoVa = (t) => { for (let k = 0; k < NP; k++) { const [u, v, w, f] = sem[k], d = (u + t * 0.015) % 1, x = (v - 0.5) * DIA.w * d * 0.95, y = (w - 0.5) * DIA.h * d * 0.95;
      pp[k * 3] = L0.x + x + Math.sin(t * 0.4 + f) * 0.02; pp[k * 3 + 1] = L0.y + (cy - L0.y) * d + y + Math.sin(t * 0.5 + f * 2) * 0.015; pp[k * 3 + 2] = L0.z + (cz - L0.z) * d; }
    pg.attributes.position.needsUpdate = true; };
  // sombritas de contacto bajo mesas y sillas (más realista)
  const somTex = lienzo(128, 128, (g) => { const rg = g.createRadialGradient(64, 64, 4, 64, 64, 64); rg.addColorStop(0, 'rgba(20,30,50,.55)'); rg.addColorStop(1, 'rgba(20,30,50,0)'); g.fillStyle = rg; g.fillRect(0, 0, 128, 128); });
  const somM = new THREE.MeshBasicMaterial({ map: somTex, transparent: true, depthWrite: false });
  MESAS.forEach(([x, z]) => { const sm = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), somM); sm.rotation.x = -Math.PI / 2; sm.position.set(x, 0.004, z); S.add(sm); });
  // puerta moderna con marco de luz (pared derecha, adelante)
  const pu = new THREE.Group(); pu.position.set(X - 0.02, 1.05, -Z + 1.3); pu.rotation.y = -Math.PI / 2; S.add(pu);
  malla(new THREE.BoxGeometry(1.0, 2.1, 0.04), PM({ color: 0xe9eef5, roughness: 0.3, clearcoat: 0.6 }), [0, 0, 0], null, pu, false);
  [[0, 1.06, 1.04, 0.02], [-0.51, 0, 0.02, 2.12], [0.51, 0, 0.02, 2.12]].forEach(([x, y, w, h]) => malla(new THREE.BoxGeometry(w, h, 0.02), CIAN, [x, y, 0.025], null, pu, false));
  malla(new THREE.BoxGeometry(0.04, 0.3, 0.03), PLATA, [0.38, 0, 0.035], null, pu, false);

  // ---- cámara (los ojos de Molí) y sus 4 lugares ----
  const cam = new THREE.PerspectiveCamera(55, 1, 0.05, 60); S.add(cam);
  const ESC = [
    { n: '🏫 Aula', obj: 'AULA DE CIENCIA', from: V(0.4, 1.6, Z - 0.6), look: V(0, 1.0, -Z + 0.5) },
    { n: '📗 Cuaderno', obj: 'CUADERNO DE SESIONES', from: CU.clone().add(V(0.0, 0.62, 0.78)), look: CU.clone().add(V(0, 0.1, -0.06)) },
    { n: '📌 Corcho', obj: 'CORCHO DE UNIDAD', from: V(X - 2.55, 1.58, 0.6), look: PANT.c.clone() },
    { n: '🧑‍🏫 Pizarra', obj: 'PIZARRA Y PROYECTOR', from: V(0.5, 1.7, -Z + 4.1), look: V(0, 1.6, -Z) },
    { n: '🖼️ Muro', obj: 'MURO DEL AULA', from: V(0, 1.62, Z - 3.7), look: V(0, 1.78, Z) }
  ];
  const pos = ESC[0].from.clone(), look = ESC[0].look.clone();
  const tam = () => { const w = canvas.clientWidth, h = canvas.clientHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.fov = cam.aspect < 1 ? 72 : 55; cam.updateProjectionMatrix(); };
  addEventListener('resize', tam); tam();
  const t00 = performance.now() / 1000; let roll = 0, fovMas = 0;
  return {
    renderer: R, camera: cam, pos, look, ESC,
    set roll(v) { roll = v; }, set fov(v) { fovMas = v; },
    update() {
      const t = performance.now() / 1000 - t00;
      const fv = (cam.aspect < 1 ? 72 : 55) + fovMas; if (Math.abs(cam.fov - fv) > 0.01) { cam.fov = fv; cam.updateProjectionMatrix(); }
      cam.position.copy(pos); cam.position.x += Math.sin(t * 0.5) * 0.008; cam.position.y += Math.sin(t * 0.7) * 0.006; cam.lookAt(look); if (roll) cam.rotateZ(roll);
      polvoVa(t);
      holo.position.y = 0.24 + Math.sin(t * 1.6) * 0.008; holo.rotation.y = Math.sin(t * 0.6) * 0.12; holo.material.opacity = 0.85 + Math.sin(t * 9) * 0.08;
      R.render(S, cam);
    }
  };
}
