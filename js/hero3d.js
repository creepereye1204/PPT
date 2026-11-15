/**
 * 표지용 Three.js 3D 입자 구체
 * - 1,800개 입자가 숨쉬듯 일렁이는 구체 + 와이어프레임 코어 + 궤도 링
 * - 마우스(window.Pointer) 방향으로 기울어짐
 * - 표지 슬라이드가 보일 때만 렌더링
 */
(() => {
  const host = document.querySelector('[data-hero3d]');
  if (!host || !window.THREE) return;
  const T = window.THREE;

  const W = 1920, H = 1080;
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(W, H, false);
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  host.appendChild(renderer.domElement);

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(42, W / H, 0.1, 100);
  camera.position.z = 10;
  const group = new T.Group();
  scene.add(group);

  /* 입자 구체 (피보나치 분포) */
  const N = 1800, R = 3.1;
  const base = new Float32Array(N * 3), pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const c1 = new T.Color('#4cc9f0'), c2 = new T.Color('#7b5cff'), c3 = new T.Color('#f72585'), tmp = new T.Color();
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * Math.PI * (3 - Math.sqrt(5));
    base.set([Math.cos(th) * r, y, Math.sin(th) * r], i * 3);
    const k = (y + 1) / 2;
    k < 0.5 ? tmp.copy(c3).lerp(c2, k * 2) : tmp.copy(c2).lerp(c1, (k - 0.5) * 2);
    col.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(pos, 3));
  geo.setAttribute('color', new T.BufferAttribute(col, 3));
  const points = new T.Points(geo, new T.PointsMaterial({
    size: 0.05, vertexColors: true, transparent: true, opacity: 0.9,
    blending: T.AdditiveBlending, depthWrite: false,
  }));
  group.add(points);

  /* 와이어프레임 코어 */
  const core = new T.LineSegments(
    new T.WireframeGeometry(new T.IcosahedronGeometry(1.6, 1)),
    new T.LineBasicMaterial({ color: 0x7b5cff, transparent: true, opacity: 0.35 }),
  );
  group.add(core);

  /* 궤도 링 */
  const rings = [[4.0, 0.4, 0x4cc9f0], [4.5, -0.7, 0xf72585], [3.7, 1.2, 0x7b5cff]].map(([rad, tilt, color]) => {
    const pts = new T.EllipseCurve(0, 0, rad, rad, 0, Math.PI * 2).getPoints(160).map((p) => new T.Vector3(p.x, p.y, 0));
    const line = new T.LineLoop(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color, transparent: true, opacity: 0.35 }));
    line.rotation.x = Math.PI / 2 + tilt;
    line.rotation.y = tilt * 0.5;
    group.add(line);
    return line;
  });

  let active = false, t = 0, last = performance.now();
  document.addEventListener('slide:enter', (e) => { active = e.detail.slide.contains(host); });

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!active) return;
    t += dt;
    for (let i = 0; i < N; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
      const d = R * (1 + 0.07 * Math.sin(y * 5 + t * 1.6) + 0.05 * Math.sin(x * 4 - t * 1.1 + z * 3));
      pos[i * 3] = x * d; pos[i * 3 + 1] = y * d; pos[i * 3 + 2] = z * d;
    }
    geo.attributes.position.needsUpdate = true;
    const P = window.Pointer;
    const tx = P && P.active ? (P.y / innerHeight - 0.5) * 0.6 : 0;
    const ty = P && P.active ? (P.x / innerWidth - 0.5) * 0.8 : 0;
    group.rotation.x += (tx - group.rotation.x) * 0.04;
    points.rotation.y += dt * 0.15;
    core.rotation.y -= dt * 0.3; core.rotation.x += dt * 0.12;
    rings.forEach((r, i) => { r.rotation.z += dt * (0.2 + i * 0.1) * (i % 2 ? -1 : 1); });
    group.rotation.y += (ty - group.rotation.y) * 0.04;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
})();
