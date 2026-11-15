/**
 * GSAP 애니메이션 도식
 * <div class="diagram" data-diagram="이름"></div> 가 있는 슬라이드에 들어가면 재생,
 * 나가면 정지합니다. 새 도식은 D.이름 = (el) => gsap.timeline 을 반환하도록 추가.
 */
(() => {
  if (!window.gsap) return;
  const NS = 'http://www.w3.org/2000/svg';
  const C = {
    c1: '#4cc9f0', c2: '#7b5cff', c3: '#f72585', ok: '#3ddc97',
    fg: '#e8ecff', muted: '#9aa3c7',
    card: 'rgba(255,255,255,0.06)', line: 'rgba(255,255,255,0.18)',
  };
  const rgba = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  };

  /* ---------- SVG 헬퍼 ---------- */
  function svg(el, w = 1600, h = 600) {
    el.innerHTML = '';
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', `0 0 ${w} ${h}`);
    s.setAttribute('width', '100%');
    s.setAttribute('height', '100%');
    const defs = add(s, 'defs');
    for (const [id, col] of [['arrow', C.muted], ['arrowPink', C.c3]]) {
      const m = add(defs, 'marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto-start-reverse' });
      add(m, 'path', { d: 'M0,0 L10,5 L0,10 z', fill: col });
    }
    el.appendChild(s);
    return s;
  }
  function add(p, tag, attrs = {}, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    p.appendChild(e);
    return e;
  }
  function text(p, x, y, str, { size = 28, color = C.fg, weight = 400, anchor = 'start', mono = false } = {}) {
    const t = add(p, 'text', { x, y, fill: color, 'font-size': size, 'font-weight': weight, 'text-anchor': anchor }, str);
    if (mono) t.setAttribute('font-family', "'JetBrains Mono', monospace");
    return t;
  }
  function box(p, x, y, w, h, { label, sub, color = C.c1, fill = C.card, r = 18, size = 30, subSize = 22 } = {}) {
    const g = add(p, 'g');
    g.rect = add(g, 'rect', { x, y, width: w, height: h, rx: r, fill, stroke: color, 'stroke-width': 2 });
    if (label) g.label = text(g, x + w / 2, y + h / 2 + (sub ? -8 : size * 0.35), label, { size, weight: 700, anchor: 'middle' });
    if (sub) g.sub = text(g, x + w / 2, y + h / 2 + subSize + 8, sub, { size: subSize, color: C.muted, anchor: 'middle' });
    g.cx = x + w / 2; g.cy = y + h / 2;
    return g;
  }
  function dot(p, r = 10, color = C.c1) {
    const c = add(p, 'circle', { cx: 0, cy: 0, r, fill: color });
    c.style.filter = `drop-shadow(0 0 10px ${color})`;
    return c;
  }
  const flash = (tl, g, color, pos) =>
    tl.fromTo(g.rect, { attr: { fill: rgba(color, 0.45) } }, { attr: { fill: C.card }, duration: 0.7, ease: 'power2.out' }, pos);

  const D = {};

  /* ================= 진화 타임라인 ================= */
  D.evolution = (el) => {
    const s = svg(el);
    const Y = 300, X0 = 140, STEP = 264;
    const data = [
      ['2020', ['GPT-3', 'few-shot 발견'], '프롬프트', C.c1],
      ['2022', ['CoT · ReAct', 'ChatGPT 출시'], '프롬프트 · 루프', C.c1],
      ['2023', ['Function Calling', 'AutoGPT 열풍'], '하네스 · 루프', C.c2],
      ['2024', ['LangGraph · MCP', '에이전트 패턴 정리'], '그래프 · 하네스', C.c2],
      ['2025', ['컨텍스트 엔지니어링', 'Claude Code · Ralph'], '컨텍스트 · 루프', C.c3],
      ['현재', ['하네스 엔지니어링', 'gstack · pstack'], '스킬 스택', C.c3],
    ];
    const line = add(s, 'line', { x1: 60, y1: Y, x2: 1540, y2: Y, stroke: C.line, 'stroke-width': 4, 'stroke-dasharray': 1480, 'stroke-dashoffset': 1480 });
    const glow = add(s, 'line', { x1: 60, y1: Y, x2: 60, y2: Y, stroke: C.c1, 'stroke-width': 4 });
    glow.style.filter = `drop-shadow(0 0 8px ${C.c1})`;
    const dots = [], cards = [];
    data.forEach(([yr, lines, stage, col], i) => {
      const x = X0 + i * STEP, up = i % 2 === 0;
      const g = add(s, 'g');
      add(g, 'line', { x1: x, y1: Y, x2: x, y2: up ? Y - 40 : Y + 40, stroke: rgba(col, 0.6), 'stroke-width': 2 });
      const cy = up ? 40 : 360;
      add(g, 'rect', { x: x - 120, y: cy, width: 240, height: 200, rx: 18, fill: C.card, stroke: rgba(col, 0.5), 'stroke-width': 2 });
      text(g, x, cy + 50, yr, { size: 36, weight: 800, color: col, anchor: 'middle', mono: true });
      lines.forEach((l, j) => text(g, x, cy + 95 + j * 34, l, { size: 23, anchor: 'middle' }));
      text(g, x, cy + 178, '→ ' + stage, { size: 20, color: C.muted, anchor: 'middle' });
      cards.push(g);
      const d = dot(s, 11, col);
      gsap.set(d, { x, y: Y });
      dots.push(d);
    });
    const pulse = dot(s, 7, '#fff');
    const tl = gsap.timeline();
    tl.set(cards, { opacity: 0 }).set(dots, { scale: 0, transformOrigin: '50% 50%' }).set(pulse, { x: 60, y: Y, opacity: 0 });
    tl.to(line, { attr: { 'stroke-dashoffset': 0 }, duration: 1.2, ease: 'power2.inOut' });
    tl.to(glow, { attr: { x2: 1540 }, duration: 1.2, ease: 'power2.inOut' }, '<');
    tl.to(dots, { scale: 1, duration: 0.4, stagger: 0.2, ease: 'back.out(3)' }, '<0.1');
    tl.fromTo(cards, { opacity: 0, y: (i) => (i % 2 ? 30 : -30) }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: 'power3.out' }, '<');
    tl.to(pulse, { opacity: 1, duration: 0.2 });
    tl.to(pulse, { x: 1540, duration: 3, ease: 'none', repeat: -1 });
    return tl;
  };

  /* ================= 01 프롬프트 ================= */
  D.prompt = (el) => {
    const s = svg(el);
    const blocks = [
      ['역할', '당신은 리뷰 분석가입니다', C.c1],
      ['지시', '감정을 3가지로 분류', C.c2],
      ['예시', '"배송 빨라요" → positive', C.c3],
      ['출력 형식', '{"label": ...}', C.c1],
    ];
    const bs = blocks.map(([l, sub, col], i) => {
      add(s, 'path', { d: `M500,${92 + i * 135} C600,${92 + i * 135} 600,300 690,300`, fill: 'none', stroke: C.line, 'stroke-width': 2, 'stroke-dasharray': '6 8' });
      return box(s, 60, 40 + i * 135, 440, 105, { label: l, sub, color: col, size: 32 });
    });
    const llm = box(s, 690, 170, 260, 260, { label: 'LLM', color: C.c2, size: 60, fill: rgba(C.c2, 0.15), r: 40 });
    add(s, 'line', { x1: 950, y1: 300, x2: 1130, y2: 300, stroke: C.muted, 'stroke-width': 2, 'marker-end': 'url(#arrow)' });
    const out = box(s, 1120, 200, 440, 200, { label: '{"label": "positive"}', sub: '"배송이 빨라서 좋았어요"', color: C.ok, size: 28 });
    out.label.setAttribute('font-family', "'JetBrains Mono', monospace");
    const toks = blocks.map(([, , col]) => dot(s, 10, col));

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
    tl.set(toks, { opacity: 0 }).set(out, { opacity: 0, x: -40 });
    tl.from(bs, { x: -80, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out' });
    tl.from(llm, { scale: 0.6, opacity: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(1.7)' }, '-=0.2');
    toks.forEach((t, i) => {
      tl.fromTo(t, { x: 500, y: 92 + i * 135, opacity: 1 }, { x: 820, y: 300, duration: 0.8, ease: 'power2.in' }, i === 0 ? '+=0.2' : '-=0.55');
      tl.to(t, { opacity: 0, duration: 0.1 });
    });
    tl.to(llm, { scale: 1.08, transformOrigin: '50% 50%', duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' });
    tl.to(out, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' });
    tl.to({}, { duration: 2.5 });
    return tl;
  };

  /* ================= 02 컨텍스트 ================= */
  D.context = (el) => {
    const s = svg(el);
    const src = [
      ['시스템 프롬프트', C.c2, 110], ['검색 문서 (RAG)', C.c1, 230], ['메모리', C.c3, 90],
      ['대화 기록', C.c2, 270], ['도구 결과', C.c1, 170], ['사용자 질문', C.c3, 80],
    ];
    const WX = 600, WY = 170, WW = 900, WH = 120;
    text(s, WX, WY - 26, '컨텍스트 창 (토큰 한도)', { size: 28, color: C.muted });
    const win = add(s, 'rect', { x: WX, y: WY, width: WW, height: WH, rx: 14, fill: 'rgba(255,255,255,0.03)', stroke: C.line, 'stroke-width': 3 });
    const pills = src.map(([l, col], i) => box(s, 40, 30 + i * 92, 400, 72, { label: l, color: col, size: 28 }));
    let x = WX;
    const segs = src.map(([, col, w]) => {
      const g = add(s, 'g');
      g.r = add(g, 'rect', { x: x + 3, y: WY + 8, width: w - 6, height: WH - 16, rx: 8, fill: col, opacity: 0.8 });
      g.x0 = x; g.w = w; x += w;
      return g;
    });
    const meter = text(s, WX, WY + WH + 80, '', { size: 40, weight: 800 });
    const note = text(s, WX, WY + WH + 145, '', { size: 30 });
    const cnt = { v: 0 };
    const showMeter = () => { meter.textContent = `토큰 사용량 ${Math.round(cnt.v)}%`; meter.setAttribute('fill', cnt.v > 100 ? C.c3 : C.fg); };

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tl.set(cnt, { v: 0, onComplete: showMeter })
      .set(segs[3].r, { attr: { width: 264 } })
      .set(segs.slice(4), { x: 0 })
      .set(win, { attr: { stroke: C.line } })
      .set(note, { opacity: 0 });
    tl.from(pills, { x: -60, opacity: 0, stagger: 0.1, duration: 0.5 });
    let sum = 0;
    segs.forEach((g, i) => {
      sum += g.w;
      tl.fromTo(g, { x: 440 - g.x0, y: 30 + i * 92 + 36 - (WY + WH / 2), opacity: 0, scale: 0.4 },
        { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }, i ? '-=0.25' : '+=0.2');
      tl.to(cnt, { v: (sum / WW) * 100, duration: 0.5, onUpdate: showMeter }, '<0.1');
      flash(tl, pills[i], src[i][1], '<');
    });
    tl.to(win, { attr: { stroke: C.c3 }, duration: 0.3 });
    tl.call(() => { note.textContent = '⚠ 한도 초과 → 오래된 대화를 요약 (Compaction)'; note.setAttribute('fill', C.c3); });
    tl.to(note, { opacity: 1, duration: 0.3 });
    tl.to({}, { duration: 1 });
    tl.to(segs[3].r, { attr: { width: 94 }, duration: 0.8, ease: 'power2.inOut' });
    tl.to(segs.slice(4), { x: -170, duration: 0.8, ease: 'power2.inOut' }, '<');
    tl.to(cnt, { v: (780 / WW) * 100, duration: 0.8, onUpdate: showMeter }, '<');
    tl.to(win, { attr: { stroke: C.ok }, duration: 0.3 });
    tl.call(() => { note.textContent = '✓ 요약 후 여유 확보 — 핵심만 남았다'; note.setAttribute('fill', C.ok); });
    tl.to({}, { duration: 2.5 });
    return tl;
  };

  /* ================= 03 하네스 ================= */
  D.harness = (el) => {
    const s = svg(el);
    const cx = 500, cy = 300;
    const sandbox = add(s, 'rect', { x: 40, y: 10, width: 920, height: 580, rx: 36, fill: 'rgba(123,92,255,0.04)', stroke: C.c2, 'stroke-width': 2, 'stroke-dasharray': '10 10' });
    const sbl = text(s, 70, 50, '샌드박스', { size: 24, color: C.c2, weight: 700 });
    const gate = add(s, 'circle', { cx, cy, r: 135, fill: 'none', stroke: C.c3, 'stroke-width': 3, 'stroke-dasharray': '4 10' });
    const gl = text(s, cx, cy - 148, '권한 게이트', { size: 22, color: C.c3, anchor: 'middle', weight: 700 });
    const core = add(s, 'circle', { cx, cy, r: 75, fill: rgba(C.c2, 0.3), stroke: C.c2, 'stroke-width': 3 });
    const coreT = text(s, cx, cy + 12, '모델', { size: 36, weight: 800, anchor: 'middle' });
    const names = ['Read', 'Edit', 'Bash', 'Browser', 'MCP', 'Skills'];
    const R = 235;
    const tools = names.map((n, i) => {
      const a = ((i * 60 - 90) * Math.PI) / 180;
      const g = box(s, cx + Math.cos(a) * R - 80, cy + Math.sin(a) * R - 30, 160, 60, { label: n, color: C.c1, size: 26, r: 30 });
      g.a = a;
      return g;
    });
    // 로그 패널
    add(s, 'rect', { x: 1010, y: 40, width: 560, height: 520, rx: 20, fill: 'rgba(5,8,20,0.7)', stroke: C.line });
    text(s, 1040, 90, '실행 로그', { size: 26, color: C.muted, weight: 700 });
    const logs = Array.from({ length: 6 }, (_, i) => text(s, 1040, 150 + i * 66, '', { size: 23, mono: true }));
    const mark = text(s, 0, 0, '', { size: 40, weight: 800, anchor: 'middle' });
    const tok = dot(s, 11, C.c1);

    const acts = [
      { tool: 1, ok: true, log: 'Edit(app.js)  ✓ 허용', hook: '↳ 훅: npm run lint --fix' },
      { tool: 2, ok: false, log: 'Bash(rm -rf /)  ✗ 거부' },
      { tool: 0, ok: false, log: 'Read(.env)  ✗ 거부' },
      { tool: 4, ok: true, log: 'MCP github.create_pr  ✓', hook: '↳ 훅: 테스트 통과 확인' },
    ];
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tl.set(logs, { opacity: 0 }).set(tok, { opacity: 0 }).set(mark, { opacity: 0 });
    tl.from([sandbox, sbl], { opacity: 0, duration: 0.5 });
    tl.from([core, coreT], { scale: 0, transformOrigin: `${cx}px ${cy}px`, duration: 0.5, ease: 'back.out(2)' });
    tl.from([gate, gl], { opacity: 0, rotation: -90, svgOrigin: `${cx} ${cy}`, duration: 0.7 });
    tl.from(tools, { opacity: 0, scale: 0.5, transformOrigin: '50% 50%', stagger: 0.08, duration: 0.4, ease: 'back.out(2)' });
    let li = 0;
    acts.forEach((act) => {
      const t = tools[act.tool], a = t.a;
      const gx = cx + Math.cos(a) * 135, gy = cy + Math.sin(a) * 135;
      const col = act.ok ? C.ok : C.c3;
      tl.set(tok, { x: cx, y: cy, opacity: 1, scale: 1, attr: { fill: C.c1 } });
      tl.to(tok, { x: gx, y: gy, duration: 0.5, ease: 'power1.in' });
      tl.call(() => { mark.textContent = act.ok ? '✓' : '✗'; mark.setAttribute('fill', col); });
      tl.fromTo(mark, { x: gx + Math.cos(a) * 34, y: gy + Math.sin(a) * 34 + 14, opacity: 0, scale: 0.4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.25 });
      if (act.ok) {
        tl.to(tok, { x: t.cx, y: t.cy, duration: 0.45, ease: 'power1.out' });
        flash(tl, t, C.ok);
      } else {
        tl.to(tok, { scale: 3, opacity: 0, attr: { fill: C.c3 }, duration: 0.4 });
      }
      const L1 = logs[li++];
      tl.call(() => { L1.textContent = act.log; L1.setAttribute('fill', col); }, null, '<');
      tl.fromTo(L1, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3 }, '<');
      if (act.hook) {
        const L2 = logs[li++];
        tl.call(() => { L2.textContent = act.hook; L2.setAttribute('fill', C.c2); });
        tl.fromTo(L2, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3 });
        tl.to(sandbox, { attr: { stroke: C.c1 }, duration: 0.15, yoyo: true, repeat: 1 }, '<');
      }
      tl.to(mark, { opacity: 0, duration: 0.3 }, '+=0.4');
      tl.set(tok, { opacity: 0 });
    });
    tl.to({}, { duration: 2 });
    return tl;
  };

  /* ================= 04 루프 ================= */
  D.loop = (el) => {
    const s = svg(el);
    const cx = 420, cy = 300, R = 210;
    add(s, 'circle', { cx, cy, r: R, fill: 'none', stroke: C.line, 'stroke-width': 3, 'stroke-dasharray': '2 10' });
    const nodes = [['계획', -90], ['행동', 0], ['관찰', 90], ['검증', 180]].map(([l, deg]) => {
      const a = (deg * Math.PI) / 180;
      return box(s, cx + Math.cos(a) * R - 90, cy + Math.sin(a) * R - 38, 180, 76, { label: l, color: deg === 180 ? C.c3 : C.c1, size: 32, r: 38 });
    });
    const center = text(s, cx, cy + 16, '', { size: 44, weight: 800, anchor: 'middle', mono: true });
    // 오른쪽 패널
    const PX = 820;
    add(s, 'rect', { x: PX - 30, y: 20, width: 760, height: 560, rx: 24, fill: 'rgba(5,8,20,0.82)', stroke: C.line });
    text(s, PX, 70, '예산', { size: 26, color: C.muted, weight: 700 });
    add(s, 'rect', { x: PX, y: 90, width: 700, height: 26, rx: 13, fill: 'rgba(255,255,255,0.08)' });
    const bar = add(s, 'rect', { x: PX, y: 90, width: 700, height: 26, rx: 13, fill: C.c1 });
    const budgetT = text(s, PX + 700, 70, '', { size: 24, color: C.muted, anchor: 'end', mono: true });
    text(s, PX, 180, '검증 결과', { size: 26, color: C.muted, weight: 700 });
    const results = ['테스트 3개 실패', '테스트 1개 실패', '모든 테스트 통과'];
    const logs = results.map((_, i) => text(s, PX, 240 + i * 60, '', { size: 28, mono: true }));
    const done = box(s, PX, 440, 700, 110, { label: '✓ 완료 — 루프 종료', color: C.ok, size: 36, fill: rgba(C.ok, 0.12) });
    const tok = dot(s, 14, C.c1);
    const st = { a: -90 };
    const place = () => gsap.set(tok, { x: cx + Math.cos((st.a * Math.PI) / 180) * R, y: cy + Math.sin((st.a * Math.PI) / 180) * R });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tl.set(st, { a: -90, onComplete: place })
      .set(logs, { opacity: 0 }).set(done, { opacity: 0, y: 20 })
      .set(bar, { attr: { width: 700, fill: C.c1 } })
      .set(tok, { opacity: 1, scale: 1 })
      .set(nodes[3].rect, { attr: { stroke: C.c3 } });
    tl.call(() => { budgetT.textContent = '0 / 20 steps'; center.textContent = '#0'; });
    tl.from(nodes, { scale: 0, transformOrigin: '50% 50%', stagger: 0.1, duration: 0.4, ease: 'back.out(2)' });
    results.forEach((res, lap) => {
      const pass = lap === results.length - 1;
      tl.call(() => { center.textContent = `#${lap + 1}`; budgetT.textContent = `${lap + 1} / 20 steps`; });
      tl.to(bar, { attr: { width: 700 * (1 - (lap + 1) * 0.22) }, duration: 0.4 }, '<');
      for (let q = 0; q < 3; q++) {
        tl.to(st, { a: `+=90`, duration: 0.55, ease: 'power1.inOut', onUpdate: place });
        flash(tl, nodes[q + 1], q === 2 ? (pass ? C.ok : C.c3) : C.c1);
      }
      tl.to(nodes[3].rect, { attr: { stroke: pass ? C.ok : C.c3 }, duration: 0.2 }, '<');
      tl.call(() => { logs[lap].textContent = `#${lap + 1}  ${res}  ${pass ? '✓' : '✗'}`; logs[lap].setAttribute('fill', pass ? C.ok : C.c3); });
      tl.fromTo(logs[lap], { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3 });
      if (!pass) {
        tl.to(st, { a: `+=90`, duration: 0.55, ease: 'power1.inOut', onUpdate: place });
        flash(tl, nodes[0], C.c1);
      }
    });
    tl.to(tok, { x: done.cx - 300, y: done.cy, duration: 0.7, ease: 'power2.inOut' });
    tl.to(tok, { opacity: 0, scale: 2, duration: 0.2 });
    tl.to(done, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, '<');
    tl.to({}, { duration: 2.5 });
    return tl;
  };

  /* ================= 05 그래프 ================= */
  D.graph = (el) => {
    const s = svg(el);
    const Y = 250;
    const start = add(s, 'circle', { cx: 110, cy: Y, r: 44, fill: C.card, stroke: C.muted, 'stroke-width': 2 });
    text(s, 110, Y + 8, 'START', { size: 20, anchor: 'middle', color: C.muted, weight: 700 });
    const N = {
      research: box(s, 260, Y - 50, 260, 100, { label: 'research', sub: '자료 조사', color: C.c1, size: 30 }),
      write: box(s, 640, Y - 50, 260, 100, { label: 'write', sub: '초안 작성', color: C.c2, size: 30 }),
      review: box(s, 1020, Y - 50, 260, 100, { label: 'review', sub: '검토', color: C.c3, size: 30 }),
    };
    Object.values(N).forEach((g) => g.label.setAttribute('font-family', "'JetBrains Mono', monospace"));
    const end = add(s, 'circle', { cx: 1480, cy: Y, r: 48, fill: C.card, stroke: C.muted, 'stroke-width': 2 });
    text(s, 1480, Y + 8, 'END', { size: 22, anchor: 'middle', color: C.muted, weight: 700 });
    const arrow = (x1, x2) => add(s, 'line', { x1, y1: Y, x2, y2: Y, stroke: C.muted, 'stroke-width': 2, 'marker-end': 'url(#arrow)' });
    arrow(154, 254); arrow(520, 634); arrow(900, 1014); arrow(1280, 1428);
    add(s, 'path', { d: `M1150,${Y - 52} Q960,40 770,${Y - 52}`, fill: 'none', stroke: C.c3, 'stroke-width': 2, 'stroke-dasharray': '8 8', 'marker-end': 'url(#arrowPink)' });
    text(s, 960, 92, 'needs_fix = True', { size: 22, color: C.c3, anchor: 'middle', mono: true });
    // State 패널
    add(s, 'rect', { x: 110, y: 400, width: 1380, height: 170, rx: 20, fill: 'rgba(5,8,20,0.7)', stroke: C.line });
    text(s, 140, 445, 'State', { size: 24, color: C.muted, weight: 700 });
    const sv = ['notes', 'draft', 'needs_fix'].map((k, i) => {
      text(s, 140 + i * 460, 515, `${k}:`, { size: 28, color: C.c1, mono: true });
      return text(s, 140 + i * 460 + (k.length + 2) * 17, 515, '—', { size: 28, mono: true });
    });
    const tok = dot(s, 12, '#fff');
    const set = (i, v, col = C.fg) => () => { sv[i].textContent = v; sv[i].setAttribute('fill', col); };

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tl.call(set(0, '—')).call(set(1, '—')).call(set(2, '—'))
      .set(tok, { x: 110, y: Y, opacity: 1 })
      .set(end, { attr: { stroke: C.muted, fill: C.card } });
    tl.from(Object.values(N), { y: 20, opacity: 0, stagger: 0.15, duration: 0.5 });
    const go = (x) => tl.to(tok, { x, y: Y, duration: 0.6, ease: 'power2.inOut' });
    go(N.research.cx); flash(tl, N.research, C.c1); tl.call(set(0, '자료 5건', C.c1));
    go(N.write.cx); flash(tl, N.write, C.c2); tl.call(set(1, '초안 v1', C.c2));
    go(N.review.cx); flash(tl, N.review, C.c3); tl.call(set(2, 'True ✗', C.c3));
    const arc = { t: 0 };
    tl.set(arc, { t: 0 });
    tl.to(arc, {
      t: 1, duration: 0.9, ease: 'power1.inOut',
      onUpdate: () => {
        const t = arc.t, u = 1 - t;
        gsap.set(tok, { x: u * u * 1150 + 2 * u * t * 960 + t * t * 770, y: u * u * (Y - 52) + 2 * u * t * 40 + t * t * (Y - 52) });
      },
    });
    flash(tl, N.write, C.c2); tl.call(set(1, '초안 v2', C.c2));
    tl.to(tok, { x: N.write.cx, y: Y, duration: 0.2 }, '<');
    go(N.review.cx); flash(tl, N.review, C.ok); tl.call(set(2, 'False ✓', C.ok));
    go(1480);
    tl.to(end, { attr: { stroke: C.ok, fill: rgba(C.ok, 0.25) }, duration: 0.3 });
    tl.to(tok, { opacity: 0, duration: 0.2 }, '<');
    tl.to({}, { duration: 2.5 });
    return tl;
  };

  /* ================= 06 gstack ================= */
  D.gstack = (el) => {
    const s = svg(el);
    const Y = 200, X0 = 120, STEP = 226;
    const stages = [
      ['Think', '/office-hours', '창업 멘토'], ['Plan', '/plan-*-review', 'CEO · EM'],
      ['Build', '구현', '엔지니어'], ['Review', '/review', '시니어 리뷰어'],
      ['Test', '/qa', 'QA'], ['Ship', '/ship', '릴리스 매니저'], ['Reflect', '/retro', '팀'],
    ];
    add(s, 'line', { x1: X0, y1: Y, x2: X0 + STEP * 6, y2: Y, stroke: C.line, 'stroke-width': 6, 'stroke-linecap': 'round' });
    const prog = add(s, 'line', { x1: X0, y1: Y, x2: X0, y2: Y, stroke: C.c1, 'stroke-width': 6, 'stroke-linecap': 'round' });
    prog.style.filter = `drop-shadow(0 0 8px ${C.c1})`;
    const nodes = stages.map(([name, cmd, role], i) => {
      const x = X0 + i * STEP, g = add(s, 'g');
      g.c = add(g, 'circle', { cx: x, cy: Y, r: 52, fill: '#0b1026', stroke: C.line, 'stroke-width': 3 });
      text(g, x, Y + 12, String(i + 1), { size: 36, weight: 800, anchor: 'middle', mono: true });
      text(g, x, Y - 80, name, { size: 30, weight: 700, anchor: 'middle' });
      text(g, x, Y + 100, cmd, { size: 22, color: C.c1, anchor: 'middle', mono: true });
      text(g, x, Y + 136, role, { size: 22, color: C.muted, anchor: 'middle' });
      g.x = x;
      return g;
    });
    const badge = (x, y, str, col) => {
      const g = add(s, 'g');
      add(g, 'line', { x1: x, y1: Y + 150, x2: x, y2: y, stroke: rgba(col, 0.6), 'stroke-width': 2 });
      add(g, 'rect', { x: x - 150, y, width: 300, height: 52, rx: 26, fill: rgba(col, 0.15), stroke: col, 'stroke-width': 2 });
      text(g, x, y + 34, str, { size: 22, anchor: 'middle', weight: 700, color: col });
      return g;
    };
    const b1 = badge(nodes[3].x - 60, 380, '버그 2건 발견 → 수정', C.c3);
    const b2 = badge(nodes[4].x + 60, 440, '브라우저 테스트 12/12 ✓', C.ok);
    const fin = box(s, 400, 515, 800, 80, { label: '✓ PR 머지 완료 — 다음 스프린트로', color: C.ok, size: 32, fill: rgba(C.ok, 0.12) });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tl.set(prog, { attr: { x2: X0 } }).set([b1, b2, fin], { opacity: 0 })
      .set(nodes.map((n) => n.c), { attr: { fill: '#0b1026', stroke: C.line } });
    tl.from(nodes, { opacity: 0, y: 20, stagger: 0.08, duration: 0.4 });
    nodes.forEach((n, i) => {
      if (i) tl.to(prog, { attr: { x2: n.x }, duration: 0.5, ease: 'power1.inOut' });
      tl.to(n.c, { attr: { fill: rgba(C.c2, 0.6), stroke: C.c1 }, duration: 0.25 });
      tl.fromTo(n.c, { attr: { r: 52 } }, { attr: { r: 62 }, duration: 0.2, yoyo: true, repeat: 1 }, '<');
      if (i === 3) tl.fromTo(b1, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
      if (i === 4) tl.fromTo(b2, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
      tl.to({}, { duration: 0.25 });
    });
    tl.fromTo(fin, { opacity: 0, scale: 0.9, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' });
    tl.to({}, { duration: 2.5 });
    return tl;
  };

  /* ================= 07 pstack ================= */
  D.pstack = (el) => {
    const s = svg(el);
    const phases = [
      ['이해', '/how · /why', '런타임 동작과 코드의 역사를 먼저 파악'],
      ['설계', '/architect · /tdd', '인터페이스 확정 → 실패하는 테스트 작성'],
      ['검증', '/interrogate', ''],
      ['정리', '/unslop', 'AI 말투를 걷어낸 깔끔한 PR 설명'],
    ];
    const trust = [25, 50, 90, 97];
    const P = phases.map(([n, cmd], i) => box(s, 40 + i * 320, 30, 290, 120, { label: n, sub: cmd, color: C.c1, size: 36 }));
    P.forEach((g) => g.sub.setAttribute('font-family', "'JetBrains Mono', monospace"));
    const caption = text(s, 660, 380, '', { size: 34, anchor: 'middle', weight: 600 });
    // 검증 장면
    const scene = add(s, 'g');
    const models = ['Model A', 'Model B', 'Model C'].map((m, i) => box(scene, 60, 210 + i * 125, 220, 80, { label: m, color: C.c2, size: 26, r: 40 }));
    const diff = add(scene, 'g');
    add(diff, 'rect', { x: 560, y: 220, width: 460, height: 330, rx: 16, fill: 'rgba(5,8,20,0.85)', stroke: C.line, 'stroke-width': 2 });
    text(diff, 590, 262, 'payment.ts  +42 −7', { size: 22, color: C.muted, mono: true });
    const lines = [['+', 'if (amount <= 0) return', C.ok], ['+', 'await charge(card, amount)', C.ok], ['−', 'retry(charge)', C.c3], ['+', 'log.info(card.number)', C.ok], ['+', 'return { ok: true }', C.ok]];
    lines.forEach(([sg, l, col], i) => text(diff, 590, 310 + i * 46, `${sg} ${l}`, { size: 22, color: col, mono: true }));
    const issues = [2, 3].map((li) => {
      const g = add(scene, 'g');
      add(g, 'rect', { x: 1030, y: 288 + li * 46, width: 230, height: 38, rx: 19, fill: rgba(C.c3, 0.2), stroke: C.c3 });
      g.t = text(g, 1145, 314 + li * 46, li === 2 ? '재시도 누락 ✗' : '카드번호 로깅 ✗', { size: 20, color: C.c3, anchor: 'middle', weight: 700 });
      g.r = g.firstChild;
      return g;
    });
    const shots = [0, 1, 2].map(() => dot(scene, 7, C.c3));
    // 신뢰도 미터
    const MX = 1400, MY = 30, MH = 520;
    add(s, 'rect', { x: MX, y: MY, width: 90, height: MH, rx: 45, fill: 'rgba(255,255,255,0.06)', stroke: C.line });
    const fill = add(s, 'rect', { x: MX, y: MY + MH, width: 90, height: 0, rx: 45, fill: C.ok, opacity: 0.85 });
    const pct = text(s, MX + 45, MY + MH + 50, '', { size: 30, weight: 800, anchor: 'middle', mono: true });
    text(s, MX - 20, MY + 30, '신뢰도', { size: 24, color: C.muted, anchor: 'end', weight: 700 });
    const tv = { v: 0 };
    const upd = () => { pct.textContent = `${Math.round(tv.v)}%`; gsap.set(fill, { attr: { y: MY + MH - (MH * tv.v) / 100, height: (MH * tv.v) / 100 } }); };

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tl.set(tv, { v: 0, onComplete: upd }).set(scene, { opacity: 0 }).set(issues, { opacity: 0 }).set(caption, { opacity: 0 })
      .set(P.map((p) => p.rect), { attr: { stroke: C.c1, fill: C.card } }).set(shots, { opacity: 0 });
    tl.from(P, { opacity: 0, y: -20, stagger: 0.1, duration: 0.4 });
    phases.forEach(([, , cap], i) => {
      tl.to(P[i].rect, { attr: { fill: rgba(C.c2, 0.4), stroke: C.ok }, duration: 0.3 });
      if (i === 2) {
        tl.to(caption, { opacity: 0, duration: 0.2 }, '<');
        tl.to(scene, { opacity: 1, duration: 0.4 });
        models.forEach((m, k) => {
          tl.fromTo(shots[k], { x: 280, y: m.cy, opacity: 1 }, { x: 560, y: 340 + k * 50, duration: 0.45, ease: 'power2.in' }, k ? '<0.15' : '>');
        });
        tl.to(shots, { opacity: 0, duration: 0.1 });
        tl.fromTo(issues, { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.25, duration: 0.3 });
        tl.to({}, { duration: 0.8 });
        issues.forEach((g, k) => {
          tl.call(() => { g.t.textContent = k ? '마스킹 처리 ✓' : '재시도 추가 ✓'; g.t.setAttribute('fill', C.ok); g.r.setAttribute('stroke', C.ok); g.r.setAttribute('fill', rgba(C.ok, 0.2)); });
          tl.to({}, { duration: 0.35 });
        });
        tl.to(tv, { v: trust[i], duration: 0.9, onUpdate: upd });
        tl.to({}, { duration: 1 });
        tl.to(scene, { opacity: 0, duration: 0.3 });
        tl.call(() => issues.forEach((g, k) => { g.t.textContent = k ? '카드번호 로깅 ✗' : '재시도 누락 ✗'; g.t.setAttribute('fill', C.c3); g.r.setAttribute('stroke', C.c3); g.r.setAttribute('fill', rgba(C.c3, 0.2)); }));
      } else {
        tl.call(() => { caption.textContent = cap; });
        tl.fromTo(caption, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 });
        tl.to(tv, { v: trust[i], duration: 0.9, onUpdate: upd }, '<');
        tl.to({}, { duration: 1.2 });
      }
    });
    tl.to({}, { duration: 2 });
    return tl;
  };

  /* ================= 정리: 겹겹이 감싸는 다섯 층 ================= */
  D.layers = (el) => {
    const s = svg(el);
    const cx = 470, cy = 300;
    const L = [
      ['그래프', '어떻게 나누고 연결할까', C.c3, 900, 580],
      ['루프', '언제까지 반복할까', C.c3, 740, 460],
      ['하네스', '무엇을 할 수 있게 할까', C.c2, 580, 340],
      ['컨텍스트', '무엇을 보여줄까', C.c1, 420, 220],
      ['프롬프트', '무엇을 말할까', C.c1, 260, 100],
    ];
    const rects = L.map(([n, , col, w, h]) => {
      const g = add(s, 'g');
      g.rect = add(g, 'rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 24, fill: rgba(col, 0.05), stroke: col, 'stroke-width': 2 });
      text(g, cx - w / 2 + 22, cy - h / 2 + (n === '프롬프트' ? 62 : 40), n, { size: n === '프롬프트' ? 36 : 26, weight: 800, color: col });
      return g;
    });
    const qs = [...L].reverse().map(([n, q, col], i) => {
      const g = add(s, 'g');
      text(g, 1000, 110 + i * 100, n, { size: 30, weight: 800, color: col });
      text(g, 1150, 110 + i * 100, q, { size: 30 });
      return g;
    });
    const inner = [...rects].reverse();
    const tl = gsap.timeline();
    tl.set(inner, { opacity: 0, scale: 0.85, transformOrigin: `${cx}px ${cy}px` }).set(qs, { opacity: 0 });
    inner.forEach((g, i) => {
      tl.to(g, { opacity: 1, scale: 1, svgOrigin: `${cx} ${cy}`, duration: 0.6, ease: 'back.out(1.6)' }, i ? '-=0.25' : 0);
      tl.fromTo(qs[i], { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5 }, '<0.1');
    });
    const pulse = gsap.timeline({ repeat: -1 });
    inner.forEach((g) => pulse.to(g.rect, { attr: { 'stroke-width': 6 }, duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut' }));
    pulse.to({}, { duration: 0.8 });
    tl.add(pulse, '+=0.3');
    return tl;
  };

  /* ---------- 재생 관리 ---------- */
  let active = null;
  document.addEventListener('slide:enter', (e) => {
    if (active) { active.kill(); active = null; }
    const el = e.detail.slide.querySelector('[data-diagram]');
    const fn = el && D[el.dataset.diagram];
    if (fn) active = fn(el);
    // 디버그: ?seek=초 → 해당 시점에 정지 (스크린샷 확인용)
    const seek = new URLSearchParams(location.search).get('seek');
    if (active && seek) active.seek(+seek, false).pause();
  });
  window.Diagrams = D;
})();
