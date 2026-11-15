/**
 * 커스텀 마우스 커서
 *  - 정확히 따라오는 점 + 관성으로 늦게 따라오는 링
 *  - 네온 그라데이션 꼬리 (속도에 따라 굵어짐)
 *  - 클릭 시 충격파 + 불꽃 파티클
 *  - 카드/코드 위에서는 링이 커지며 색이 바뀜
 *  - 2.5초 가만히 있으면 자동으로 숨김 (발표 중 방해 X)
 * window.Pointer 로 위치를 공개 → 배경 애니메이션이 반응할 수 있음
 */
(() => {
  if (window.matchMedia('(pointer: coarse)').matches) return; // 터치 기기는 기본 동작

  const Pointer = (window.Pointer = { x: -999, y: -999, active: false, speed: 0 });

  /* DOM */
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  const cv = document.createElement('canvas');
  cv.className = 'cursor-fx';
  document.body.append(cv, ring, dot);
  document.documentElement.classList.add('custom-cursor');
  const ctx = cv.getContext('2d');

  const COLORS = ['76,201,240', '123,92,255', '247,37,133'];
  let W, H, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  /* 상태 */
  let mx = -999, my = -999, rx = mx, ry = my, px = mx, py = my;
  let idle = 0, hover = false, down = false;
  const trail = [];   // {x, y, life, w}
  const sparks = [];  // {x, y, vx, vy, life, c}
  const waves = [];   // {x, y, t, c}

  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!Pointer.active) { rx = px = mx; ry = py = my; }
    Pointer.active = true;
    idle = 0;
    document.documentElement.classList.remove('cursor-idle');
  });
  document.addEventListener('mouseleave', () => { Pointer.active = false; });

  addEventListener('mousedown', () => {
    down = true;
    waves.push({ x: mx, y: my, t: 0, c: COLORS[(Math.random() * 3) | 0] });
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 6;
      sparks.push({ x: mx, y: my, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: COLORS[i % 3] });
    }
  });
  addEventListener('mouseup', () => { down = false; });

  const HOVER_SEL = 'a, button, pre, .card, .stat, .agenda li';
  document.addEventListener('mouseover', (e) => { hover = !!e.target.closest(HOVER_SEL); });

  /* 루프 */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05), k = dt * 60;
    last = now;

    // 링 관성
    const ease = 1 - Math.pow(1 - 0.18, k);
    rx += (mx - rx) * ease; ry += (my - ry) * ease;

    // 속도
    const vx = mx - px, vy = my - py, sp = Math.hypot(vx, vy);
    Pointer.x = mx; Pointer.y = my; Pointer.speed = sp;
    if (Pointer.active && sp > 0.5) {
      const steps = Math.min(8, Math.ceil(sp / 6)); // 빠르게 움직여도 꼬리가 끊기지 않게 보간
      for (let i = 1; i <= steps; i++) {
        trail.push({ x: px + (vx * i) / steps, y: py + (vy * i) / steps, life: 1, w: Math.min(10, 2 + sp * 0.15) });
      }
    }
    px = mx; py = my;

    // 자동 숨김
    idle += dt;
    if (idle > 2.5) document.documentElement.classList.add('cursor-idle');

    // DOM 커서
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    const stretch = Math.min(sp * 0.012, 0.35), ang = Math.atan2(vy, vx);
    const scale = (hover ? 1.9 : 1) * (down ? 0.7 : 1);
    ring.style.transform = `translate(${rx}px, ${ry}px) rotate(${ang}rad) scale(${scale * (1 + stretch)}, ${scale * (1 - stretch)})`;
    ring.classList.toggle('hover', hover);

    // 캔버스 FX
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    for (let i = trail.length - 1; i >= 0; i--) if ((trail[i].life -= 0.045 * k) <= 0) trail.splice(i, 1);
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i], f = i / trail.length;
      const c = COLORS[Math.min(2, Math.floor((1 - f) * 3))];
      ctx.strokeStyle = `rgba(${c},${b.life * 0.8})`;
      ctx.lineWidth = b.w * b.life;
      ctx.shadowBlur = 18; ctx.shadowColor = `rgba(${c},1)`;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.shadowBlur = 0;

    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i];
      w.t += dt;
      if (w.t > 0.6) { waves.splice(i, 1); continue; }
      const p = w.t / 0.6, r = 8 + (1 - Math.pow(1 - p, 3)) * 90;
      ctx.strokeStyle = `rgba(${w.c},${1 - p})`;
      ctx.lineWidth = 3 * (1 - p) + 0.5;
      ctx.beginPath(); ctx.arc(w.x, w.y, r, 0, Math.PI * 2); ctx.stroke();
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx * k; s.y += s.vy * k;
      s.vx *= Math.pow(0.9, k); s.vy = s.vy * Math.pow(0.9, k) + 0.08 * k;
      if ((s.life -= 0.03 * k) <= 0) { sparks.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(${s.c},${s.life})`;
      ctx.lineWidth = 2 * s.life;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
