/**
 * 커스텀 마우스 커서 — "AI 스캐너 레티클"
 *  - 중앙: 빛나는 다이아몬드 (마우스 위치 그대로)
 *  - 주변: 서로 반대로 회전하는 호 + 4개의 코너 브래킷 (관성으로 따라옴)
 *  - 카드/코드 위: 브래킷이 요소 테두리로 벌어지며 "타깃 락온"
 *  - 이동: 꼬리 대신 흩어지는 픽셀 먼지
 *  - 클릭: 회전하는 사각 충격파 + 파편
 *  - 2.5초 가만히 있으면 자동으로 숨김 (발표 중 방해 X)
 * window.Pointer 로 위치를 공개 → 배경 애니메이션이 반응할 수 있음
 */
(() => {
  if (window.matchMedia('(pointer: coarse)').matches) return; // 터치 기기는 기본 동작

  const Pointer = (window.Pointer = { x: -999, y: -999, active: false, speed: 0 });

  const cv = document.createElement('canvas');
  cv.className = 'cursor-fx';
  document.body.append(cv);
  document.documentElement.classList.add('custom-cursor');
  const ctx = cv.getContext('2d');

  const C = { c1: '76,201,240', c2: '123,92,255', c3: '247,37,133' };
  const PALETTE = [C.c1, C.c2, C.c3];
  let W, H;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  /* 상태 */
  let mx = -999, my = -999, rx = mx, ry = my, px = mx, py = my;
  let idle = 0, vis = 0, down = false, rot = 0, hoverEl = null;
  const box = { x: 0, y: 0, w: 0, h: 0 };
  const dust = [];   // {x, y, vx, vy, life, s, c}
  const shocks = []; // {x, y, t, c}

  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!Pointer.active) { rx = px = mx; ry = py = my; Object.assign(box, { x: mx - 16, y: my - 16, w: 32, h: 32 }); }
    Pointer.active = true;
    idle = 0;
  });
  document.addEventListener('mouseleave', () => { Pointer.active = false; });

  addEventListener('mousedown', () => {
    down = true;
    shocks.push({ x: mx, y: my, t: 0, c: PALETTE[(Math.random() * 3) | 0] });
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2, v = 1.5 + Math.random() * 4;
      dust.push({ x: mx, y: my, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, s: 2 + Math.random() * 2, c: PALETTE[i % 3] });
    }
  });
  addEventListener('mouseup', () => { down = false; });

  const HOVER_SEL = 'a, button, pre, .card, .stat, .agenda li';
  document.addEventListener('mouseover', (e) => { hoverEl = e.target.closest(HOVER_SEL); });

  const lerp = (a, b, t) => a + (b - a) * t;

  function corners(x, y, w, h, len) {
    ctx.beginPath();
    ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
    ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
    ctx.moveTo(x + w, y + h - len); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - len, y + h);
    ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
    ctx.stroke();
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05), k = dt * 60;
    last = now;
    idle += dt;
    vis = lerp(vis, Pointer.active && idle < 2.5 ? 1 : 0, 1 - Math.pow(0.85, k));

    const ease = 1 - Math.pow(1 - 0.2, k);
    rx = lerp(rx, mx, ease); ry = lerp(ry, my, ease);
    const sp = Math.hypot(mx - px, my - py);
    px = mx; py = my;
    Pointer.x = mx; Pointer.y = my; Pointer.speed = sp;
    rot += dt * (hoverEl ? 3.5 : 1.6);

    // 이동할 때 픽셀 먼지 (연속된 꼬리 X)
    if (Pointer.active && sp > 2) {
      const n = Math.min(3, Math.floor(sp / 10) + (Math.random() < 0.5 ? 1 : 0));
      for (let i = 0; i < n; i++) {
        dust.push({
          x: mx + (Math.random() - 0.5) * 14, y: my + (Math.random() - 0.5) * 14,
          vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2,
          life: 1, s: 1.5 + Math.random() * 2.5, c: PALETTE[(Math.random() * 3) | 0],
        });
      }
    }

    // 브래킷 목표: 호버 요소 테두리 or 커서 주변 작은 사각형
    const r = hoverEl && hoverEl.getBoundingClientRect();
    const s = down ? 11 : 17;
    const tgt = r && r.width
      ? { x: r.left - 10, y: r.top - 10, w: r.width + 20, h: r.height + 20 }
      : { x: rx - s, y: ry - s, w: s * 2, h: s * 2 };
    const be = 1 - Math.pow(1 - 0.22, k);
    box.x = lerp(box.x, tgt.x, be); box.y = lerp(box.y, tgt.y, be);
    box.w = lerp(box.w, tgt.w, be); box.h = lerp(box.h, tgt.h, be);

    ctx.clearRect(0, 0, W, H);
    if (vis > 0.01 || dust.length || shocks.length) {
      ctx.globalAlpha = vis;
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'square';

      // 픽셀 먼지
      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i];
        d.x += d.vx * k; d.y += d.vy * k;
        d.vx *= Math.pow(0.92, k); d.vy *= Math.pow(0.92, k);
        if ((d.life -= 0.035 * k) <= 0) { dust.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(${d.c},${d.life})`;
        ctx.fillRect(d.x - d.s / 2, d.y - d.s / 2, d.s, d.s);
      }

      // 클릭 충격파 (회전하는 사각형)
      for (let i = shocks.length - 1; i >= 0; i--) {
        const w = shocks[i];
        w.t += dt;
        if (w.t > 0.55) { shocks.splice(i, 1); continue; }
        const p = w.t / 0.55, size = 10 + (1 - Math.pow(1 - p, 3)) * 70;
        ctx.save();
        ctx.translate(w.x, w.y); ctx.rotate(Math.PI / 4 + p * 1.2);
        ctx.strokeStyle = `rgba(${w.c},${1 - p})`;
        ctx.lineWidth = 2.5 * (1 - p) + 0.5;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      }

      const col = hoverEl ? C.c3 : C.c1;
      ctx.shadowBlur = 12; ctx.shadowColor = `rgba(${col},1)`;

      // 코너 브래킷
      ctx.strokeStyle = `rgba(${col},0.95)`;
      ctx.lineWidth = 2;
      corners(box.x, box.y, box.w, box.h, Math.min(16, box.w / 3, box.h / 3));

      // 회전하는 호 (두 겹, 반대 방향)
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(${C.c2},0.9)`;
      for (const off of [0, Math.PI]) { ctx.beginPath(); ctx.arc(rx, ry, 24, rot + off, rot + off + 1.1); ctx.stroke(); }
      ctx.strokeStyle = `rgba(${col},0.6)`;
      for (const off of [Math.PI / 2, -Math.PI / 2]) { ctx.beginPath(); ctx.arc(rx, ry, 30, -rot * 0.7 + off, -rot * 0.7 + off + 0.5); ctx.stroke(); }

      // 중앙 다이아몬드
      ctx.save();
      ctx.translate(mx, my); ctx.rotate(Math.PI / 4);
      ctx.shadowColor = '#fff'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#fff';
      const ds = down ? 4 : 6;
      ctx.fillRect(-ds / 2, -ds / 2, ds, ds);
      ctx.restore();
      ctx.shadowBlur = 0;

      // HUD 텍스트
      ctx.font = "600 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = `rgba(${col},0.75)`;
      ctx.fillText(hoverEl ? '◉ TARGET LOCKED' : `${mx | 0} · ${my | 0}`, box.x + box.w + 6, box.y + box.h + 4);

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
