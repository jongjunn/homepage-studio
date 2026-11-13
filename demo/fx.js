// 데모 3종 공통 연출. 라이브러리 없이 스크롤 진행률(--p)만 CSS에 넘긴다.
const $ = (s, r = document) => [...r.querySelectorAll(s)];
const B = document.body;

// 로더: 첫 화면 사진이 뜨면 걷는다 (최대 1.8초)
const ready = () => B.classList.add('ready');
const hero = document.querySelector('.hero img');
if (!hero || hero.complete) setTimeout(ready, 300); else hero.addEventListener('load', () => setTimeout(ready, 200));
setTimeout(ready, 1800);

// 등장 효과
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .15 });
$('.rv,.ri').forEach(e => io.observe(e));

// 스크롤에 따라 단어가 차례로 진해지는 문장
$('[data-words]').forEach(el => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
});

// 진행률: data-p="pin"은 고정 구간 통과율, 그 외는 화면 통과율
const ps = $('[data-p],[data-words]');
const clamp = v => Math.min(1, Math.max(0, v));
let last = 0, tick = 0;
function frame() {
  tick = 0;
  const vh = innerHeight, y = scrollY;
  for (const el of ps) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -vh || r.top > vh * 2) continue;
    if ('p' in el.dataset) {
      const p = el.dataset.p === 'pin' ? -r.top / (r.height - vh) : (vh - r.top) / (vh + r.height);
      el.style.setProperty('--p', clamp(p).toFixed(4));
    }
    if ('words' in el.dataset) {
      const n = el.children.length, q = clamp((vh * .85 - r.top) / (r.height + vh * .4)) * n;
      for (let i = 0; i < n; i++) el.children[i].style.opacity = q > i ? 1 : .16;
    }
  }
  B.classList.toggle('scrolled', y > 60);
  B.classList.toggle('hide-h', y > last && y > 500 && !B.classList.contains('menu'));
  last = y;
}
addEventListener('scroll', () => { if (!tick) tick = requestAnimationFrame(frame); }, { passive: true });
addEventListener('resize', frame);
frame();

// 전체 메뉴
$('[data-menu]').forEach(b => b.addEventListener('click', () => B.classList.toggle('menu')));
$('.nav-ov a').forEach(a => a.addEventListener('click', () => B.classList.remove('menu')));
addEventListener('keydown', e => e.key === 'Escape' && B.classList.remove('menu'));

// 스크롤 위치에 따라 활성 단계 번호를 컨테이너에 기록 (사진 교체용)
$('[data-steps]').forEach(c => {
  const items = $('.step', c);
  const set = i => { c.dataset.active = i; };
  const o = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && set(items.indexOf(e.target))),
    { rootMargin: '-45% 0px -45% 0px' });
  items.forEach((it, i) => { o.observe(it); it.addEventListener('mouseenter', () => c.dataset.hover !== undefined && set(i)); });
  set(0);
});

// 숫자 카운트업
const co = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  co.unobserve(e.target);
  const end = +e.target.dataset.count, t0 = performance.now();
  const step = t => {
    const k = clamp((t - t0) / 1600), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
    e.target.textContent = v.toLocaleString();
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}), { threshold: .5 });
$('[data-count]').forEach(e => co.observe(e));

// 데모 폼: 실제 전송 없이 접수 화면만 보여준다
$('form[data-demo]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); f.classList.add('sent'); }));
