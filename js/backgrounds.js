/**
 * 움직이는 배경 모음
 * 슬라이드에 data-bg="이름" 으로 지정합니다.
 *
 * 새 배경 추가 방법:
 *   EFFECTS.myEffect = {
 *     init(ctx, w, h) { return state },              // 상태 초기화 (리사이즈 때도 호출)
 *     draw(ctx, s, t, k, w, h) { ... },              // 매 프레임 호출
 *   };                                              // t: 경과 시간(초), k: 60fps 기준 프레임 배율
 */
const Backgrounds = (() => {
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');

  const P = {
    bg: '#070b1a',
    c1: '76,201,240',   // cyan
    c2: '123,92,255',   // violet
    c3: '247,37,133',   // pink
  };
  const rgba = (c, a) => `rgba(${c},${a})`;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const fillBg = (ctx, w, h, color = P.bg) => { ctx.fillStyle = color; ctx.fillRect(0, 0, w, h); };

  const EFFECTS = {
    /* 1. 신경망: 노드가 떠다니고 연결선 위로 신호가 흐름 */
    neural: {
      init(ctx, w, h) {
        const n = Math.max(40, Math.min(110, Math.floor((w * h) / 16000)));
        return {
          nodes: Array.from({ length: n }, () => ({
            x: rand(0, w), y: rand(0, h), vx: rand(-0.35, 0.35), vy: rand(-0.35, 0.35),
          })),
          pulses: [],
        };
      },
      draw(ctx, s, t, k, w, h) {
        fillBg(ctx, w, h);
        const N = s.nodes, D = 170;
        for (const p of N) {
          p.x += p.vx * k; p.y += p.vy * k;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
        ctx.lineWidth = 1;
        for (let i = 0; i < N.length; i++) {
          for (let j = i + 1; j < N.length; j++) {
            const dx = N[i].x - N[j].x, dy = N[i].y - N[j].y, d2 = dx * dx + dy * dy;
            if (d2 > D * D) continue;
            const a = 1 - Math.sqrt(d2) / D;
            ctx.strokeStyle = rgba(P.c1, a * 0.35);
            ctx.beginPath(); ctx.moveTo(N[i].x, N[i].y); ctx.lineTo(N[j].x, N[j].y); ctx.stroke();
            if (s.pulses.length < 40 && Math.random() < 0.0006 * k) {
              s.pulses.push({ a: N[i], b: N[j], p: 0, c: Math.random() < 0.5 ? P.c2 : P.c3 });
            }
          }
        }
        s.pulses = s.pulses.filter((q) => (q.p += 0.012 * k) < 1);
        for (const q of s.pulses) {
          const x = q.a.x + (q.b.x - q.a.x) * q.p, y = q.a.y + (q.b.y - q.a.y) * q.p;
          const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
          g.addColorStop(0, rgba(q.c, 0.95)); g.addColorStop(1, rgba(q.c, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = rgba(P.c1, 0.85);
        for (const p of N) { ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill(); }
      },
    },

    /* 2. 오로라: 큰 색 덩어리가 천천히 섞임 */
    aurora: {
      init(ctx, w, h) {
        const colors = [P.c1, P.c2, P.c3, P.c2, P.c1];
        return {
          blobs: colors.map((c) => ({
            c, r: rand(0.35, 0.55) * Math.max(w, h),
            sx: rand(0.05, 0.12), sy: rand(0.05, 0.12), ph: rand(0, Math.PI * 2),
          })),
          dust: Array.from({ length: 70 }, () => ({ x: rand(0, w), y: rand(0, h), v: rand(0.1, 0.4), r: rand(0.5, 1.8) })),
        };
      },
      draw(ctx, s, t, k, w, h) {
        fillBg(ctx, w, h);
        ctx.globalCompositeOperation = 'lighter';
        for (const b of s.blobs) {
          const x = w * (0.5 + 0.4 * Math.sin(t * b.sx * 2 + b.ph));
          const y = h * (0.5 + 0.4 * Math.cos(t * b.sy * 2 + b.ph * 1.3));
          const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
          g.addColorStop(0, rgba(b.c, 0.28)); g.addColorStop(1, rgba(b.c, 0));
          ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (const d of s.dust) {
          d.y -= d.v * k; if (d.y < -5) { d.y = h + 5; d.x = rand(0, w); }
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        }
      },
    },

    /* 3. 신스웨이브 그리드: 원근 격자가 앞으로 흘러옴 */
    grid: {
      init(ctx, w, h) {
        return { stars: Array.from({ length: 160 }, () => ({ x: rand(0, w), y: rand(0, h * 0.58), r: rand(0.4, 1.6), ph: rand(0, 6) })) };
      },
      draw(ctx, s, t, k, w, h) {
        const hz = h * 0.58;
        const sky = ctx.createLinearGradient(0, 0, 0, hz);
        sky.addColorStop(0, P.bg); sky.addColorStop(1, '#1d0b3d');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, w, hz);
        ctx.fillStyle = P.bg; ctx.fillRect(0, hz, w, h - hz);

        for (const st of s.stars) {
          ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + st.ph))})`;
          ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
        }
        // 지평선 글로우
        const glow = ctx.createLinearGradient(0, hz - 80, 0, hz + 40);
        glow.addColorStop(0, rgba(P.c3, 0)); glow.addColorStop(0.65, rgba(P.c3, 0.35)); glow.addColorStop(1, rgba(P.c3, 0));
        ctx.fillStyle = glow; ctx.fillRect(0, hz - 80, w, 120);

        // 가로선
        const N = 22, off = (t * 0.45) % 1;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < N; i++) {
          const z = (i + off) / N, y = hz + (h - hz) * z * z;
          ctx.strokeStyle = rgba(P.c2, 0.15 + 0.6 * z);
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
        // 세로선 (소실점으로 수렴)
        const cx = w / 2, step = w / 14;
        ctx.strokeStyle = rgba(P.c2, 0.45);
        for (let i = -16; i <= 16; i++) {
          ctx.beginPath(); ctx.moveTo(cx + i * step * 0.04, hz); ctx.lineTo(cx + i * step * 1.6, h); ctx.stroke();
        }
      },
    },

    /* 4. 흐름장: 입자가 보이지 않는 벡터장을 따라 흐름 */
    flow: {
      init(ctx, w, h) {
        fillBg(ctx, w, h);
        const n = Math.min(1400, Math.floor((w * h) / 1400));
        const spawn = () => ({ x: rand(0, w), y: rand(0, h), life: rand(60, 260), c: Math.random() < 0.6 ? 0 : 1 });
        return { ps: Array.from({ length: n }, spawn), spawn };
      },
      draw(ctx, s, t, k, w, h) {
        ctx.fillStyle = 'rgba(7,11,26,0.07)'; ctx.fillRect(0, 0, w, h);
        const paths = [new Path2D(), new Path2D()];
        for (let i = 0; i < s.ps.length; i++) {
          const p = s.ps[i];
          const a = (Math.sin(p.x * 0.0025 + t * 0.15) + Math.cos(p.y * 0.003 - t * 0.1) + Math.sin((p.x + p.y) * 0.001 + t * 0.05)) * Math.PI * 0.66;
          const nx = p.x + Math.cos(a) * 1.6 * k, ny = p.y + Math.sin(a) * 1.6 * k;
          paths[p.c].moveTo(p.x, p.y); paths[p.c].lineTo(nx, ny);
          p.x = nx; p.y = ny; p.life -= k;
          if (p.life < 0 || nx < 0 || nx > w || ny < 0 || ny > h) s.ps[i] = s.spawn();
        }
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = rgba(P.c1, 0.55); ctx.stroke(paths[0]);
        ctx.strokeStyle = rgba(P.c2, 0.65); ctx.stroke(paths[1]);
      },
    },

    /* 5. 파동: 겹겹의 사인파 */
    waves: {
      init() { return {}; },
      draw(ctx, s, t, k, w, h) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, P.bg); g.addColorStop(1, '#0e1034');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        const cols = [P.c1, P.c1, P.c2, P.c2, P.c3, P.c3];
        for (let i = 0; i < cols.length; i++) {
          const amp = h * (0.035 + 0.018 * i), f = 0.0014 + 0.0005 * i, sp = 0.35 + 0.12 * i, base = h * (0.42 + i * 0.075);
          ctx.beginPath();
          for (let x = 0; x <= w + 10; x += 10) {
            const y = base + Math.sin(x * f + t * sp + i) * amp + Math.sin(x * f * 2.3 - t * sp * 0.7) * amp * 0.3;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.strokeStyle = rgba(cols[i], 0.55); ctx.lineWidth = 2; ctx.stroke();
          ctx.lineTo(w + 10, h); ctx.lineTo(0, h); ctx.closePath();
          ctx.fillStyle = rgba(cols[i], 0.035); ctx.fill();
        }
      },
    },

    /* 6. 토큰 레인: 기호와 토큰이 위에서 쏟아짐 */
    matrix: {
      init(ctx, w, h) {
        fillBg(ctx, w, h);
        const fs = 22, cols = Math.ceil(w / fs);
        return {
          fs,
          drops: Array.from({ length: cols }, () => Math.floor(rand(-h / fs, 0))),
          speed: Array.from({ length: cols }, () => rand(0.15, 0.5)),
          acc: new Array(cols).fill(0),
          chars: '01アカサタナハマヤラワλΣ∂∇θπ∫≈{}[]<>/*+-=AIGPTQKV'.split(''),
        };
      },
      draw(ctx, s, t, k, w, h) {
        ctx.fillStyle = 'rgba(7,11,26,0.06)'; ctx.fillRect(0, 0, w, h);
        ctx.font = `${s.fs}px 'JetBrains Mono', monospace`;
        for (let i = 0; i < s.drops.length; i++) {
          s.acc[i] += s.speed[i] * k;
          if (s.acc[i] < 1) continue;
          s.acc[i] -= 1;
          const y = s.drops[i] * s.fs;
          ctx.fillStyle = i % 7 === 0 ? rgba(P.c3, 0.8) : Math.random() < 0.08 ? 'rgba(230,250,255,0.95)' : rgba(P.c1, 0.7);
          ctx.fillText(pick(s.chars), i * s.fs, y);
          s.drops[i]++;
          if (y > h && Math.random() > 0.97) s.drops[i] = 0;
        }
      },
    },

    /* 7. 궤도: 오른쪽에 원자/모델 같은 궤도 구조 */
    orbit: {
      init(ctx, w, h) {
        const sc = Math.min(w, h) / 1080;
        return {
          cx: w * 0.74, cy: h * 0.5,
          rings: Array.from({ length: 5 }, (_, i) => ({
            rx: (130 + i * 85) * sc, ry: (130 + i * 85) * sc * 0.4,
            tilt: -0.5 + i * 0.25, speed: (i % 2 ? -1 : 1) * (0.5 / (i + 1) + 0.1),
            dots: Array.from({ length: 2 + i }, (_, j) => ({ ph: (j / (2 + i)) * Math.PI * 2, c: pick([P.c1, P.c2, P.c3]) })),
          })),
        };
      },
      draw(ctx, s, t, k, w, h) {
        fillBg(ctx, w, h);
        const core = 60 + 10 * Math.sin(t * 2);
        const g = ctx.createRadialGradient(s.cx, s.cy, 0, s.cx, s.cy, core * 3);
        g.addColorStop(0, rgba(P.c2, 0.7)); g.addColorStop(1, rgba(P.c2, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.cx, s.cy, core * 3, 0, Math.PI * 2); ctx.fill();
        for (const r of s.rings) {
          ctx.save(); ctx.translate(s.cx, s.cy); ctx.rotate(r.tilt + t * 0.03);
          ctx.strokeStyle = rgba(P.c1, 0.15); ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2); ctx.stroke();
          for (const d of r.dots) {
            const a = d.ph + t * r.speed, x = Math.cos(a) * r.rx, y = Math.sin(a) * r.ry;
            const dg = ctx.createRadialGradient(x, y, 0, x, y, 16);
            dg.addColorStop(0, rgba(d.c, 1)); dg.addColorStop(1, rgba(d.c, 0));
            ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
          }
          ctx.restore();
        }
      },
    },

    /* 8. 워프: 별이 화면 밖으로 날아옴 */
    warp: {
      init(ctx, w, h) {
        fillBg(ctx, w, h);
        return { stars: Array.from({ length: 500 }, () => ({ x: rand(-1, 1) * w, y: rand(-1, 1) * h, z: rand(1, w) })) };
      },
      draw(ctx, s, t, k, w, h) {
        ctx.fillStyle = 'rgba(7,11,26,0.35)'; ctx.fillRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2;
        for (const st of s.stars) {
          const pz = st.z;
          st.z -= 2.5 * k;
          if (st.z < 1) { st.x = rand(-1, 1) * w; st.y = rand(-1, 1) * h; st.z = w; continue; }
          const sx = cx + (st.x / st.z) * cx, sy = cy + (st.y / st.z) * cy;
          const px = cx + (st.x / pz) * cx, py = cy + (st.y / pz) * cy;
          const n = 1 - st.z / w;
          ctx.strokeStyle = n > 0.85 ? `rgba(255,255,255,${n})` : rgba(P.c1, n);
          ctx.lineWidth = n * 2.5;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
        }
      },
    },

    /* 9. 펄스: 중앙에서 퍼지는 링 */
    pulse: {
      init(ctx, w, h) {
        return { rings: [], last: -10, dots: Array.from({ length: 90 }, () => ({ x: rand(0, w), y: rand(0, h), v: rand(0.15, 0.5), r: rand(0.6, 2) })) };
      },
      draw(ctx, s, t, k, w, h) {
        fillBg(ctx, w, h);
        if (t - s.last > 1.2) { s.last = t; s.rings.push({ born: t, c: s.rings.length % 2 ? P.c2 : P.c1 }); }
        const R = Math.max(w, h) * 0.18;
        s.rings = s.rings.filter((r) => t - r.born < 4.5);
        for (const r of s.rings) {
          const age = t - r.born;
          ctx.strokeStyle = rgba(r.c, Math.max(0, 1 - age / 4.5) * 0.5);
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(w / 2, h / 2, age * R, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = rgba(P.c1, 0.6);
        for (const d of s.dots) {
          d.y -= d.v * k; if (d.y < -5) { d.y = h + 5; d.x = rand(0, w); }
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        }
      },
    },
  };

  /* ---------- 엔진 ---------- */
  let W = 0, H = 0, current = null, state = null;
  let time = 0, last = performance.now(), paused = false, needsFrame = true, switchTimer = null;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) paused = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (current) state = EFFECTS[current].init(ctx, W, H);
    needsFrame = true;
  }

  function apply(name) {
    current = name;
    ctx.globalCompositeOperation = 'source-over';
    fillBg(ctx, W, H);
    state = EFFECTS[name].init(ctx, W, H);
    needsFrame = true;
  }

  function set(name) {
    if (!EFFECTS[name]) name = 'neural';
    clearTimeout(switchTimer);
    if (name === current) { canvas.classList.remove('fading'); return; }
    if (!current) { apply(name); return; }
    canvas.classList.add('fading');
    switchTimer = setTimeout(() => { apply(name); canvas.classList.remove('fading'); }, 350);
  }

  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (current && (!paused || needsFrame)) {
      if (!paused) time += dt;
      EFFECTS[current].draw(ctx, state, time, dt * 60, W, H);
      needsFrame = false;
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(loop);

  return {
    set,
    toggle() { paused = !paused; return paused; },
    get names() { return Object.keys(EFFECTS); },
    EFFECTS,
  };
})();
