/**
 * 슬라이드 컨트롤
 *  → / Space / PageDown / 클릭 : 다음 (fragment 먼저)
 *  ← / PageUp / 화면 왼쪽 클릭  : 이전
 *  Home / End                   : 처음 / 끝
 *  F                            : 전체화면
 *  B                            : 배경 애니메이션 일시정지
 */
(() => {
  const stage = document.getElementById('stage');
  const slides = [...stage.querySelectorAll('.slide')];
  const counter = document.getElementById('counter');
  const progress = document.getElementById('progress');
  let cur = 0;

  /* 1920x1080 스테이지를 창 크기에 맞게 */
  function fit() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  }

  function go(n, revealAll = false) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((el, i) => {
      el.classList.toggle('active', i === n);
      el.classList.toggle('past', i < n);
    });
    slides[n].querySelectorAll('.fragment').forEach((f) => f.classList.toggle('visible', revealAll));
    cur = n;
    counter.textContent = `${n + 1} / ${slides.length}`;
    progress.style.width = `${((n + 1) / slides.length) * 100}%`;
    history.replaceState(null, '', `#${n + 1}`);
    Backgrounds.set(slides[n].dataset.bg);
  }

  function next() {
    const hidden = slides[cur].querySelector('.fragment:not(.visible)');
    if (hidden) hidden.classList.add('visible');
    else if (cur < slides.length - 1) go(cur + 1);
  }

  function prev() {
    const shown = slides[cur].querySelectorAll('.fragment.visible');
    if (shown.length) shown[shown.length - 1].classList.remove('visible');
    else if (cur > 0) go(cur - 1, true);
  }

  /* 간단한 문법 하이라이트 (pre.code[data-lang=python|json|shell]) */
  const KW = /\b(def|class|return|import|from|as|if|elif|else|for|in|while|with|self|None|True|False|true|false|null|lambda|and|or|not|super|yield|try|except|raise|pass|break)\b/;
  function highlight(el, lang) {
    const src = el.textContent;
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const kw = lang === 'shell' ? '()(?!)' : KW.source;
    const re = new RegExp(`((?:^|\\s)#.*$)|("""[\\s\\S]*?"""|'[^'\\n]*'|"[^"\\n]*")|${kw}|\\b(\\d+(?:\\.\\d+)?)\\b|((?<=^|\\s)\\/[a-z][\\w-]*|\\b[A-Za-z_]\\w*(?=\\())`, 'gm');
    let out = '', i = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(i, m.index));
      const cls = m[1] ? 'cm' : m[2] ? 'str' : m[3] ? 'kw' : m[4] ? 'num' : 'fn';
      out += `<span class="${cls}">${esc(m[0])}</span>`;
      i = re.lastIndex;
    }
    el.innerHTML = out + esc(src.slice(i));
  }
  document.querySelectorAll('pre.code[data-lang]').forEach((pre) => highlight(pre.querySelector('code'), pre.dataset.lang));

  /* 입력 */
  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(slides.length - 1, true);
    else if (e.key === 'f' || e.key === 'F') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    } else if (e.key === 'b' || e.key === 'B') Backgrounds.toggle();
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, pre')) return;
    e.clientX < window.innerWidth / 3 ? prev() : next();
  });

  let tx = null;
  document.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    tx = null;
  });

  window.addEventListener('resize', fit);
  fit();
  go((parseInt(location.hash.slice(1), 10) || 1) - 1);
})();
