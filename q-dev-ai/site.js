/* q-dev-ai 공용 동작 (2026-11-27). JS 가 없어도 글·링크는 모두 보인다. */
(function () {
  'use strict';
  var rm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';

  /* 영상: 보일 때만 재생, 벗어나면 멈춤. 움직임 줄이기면 자동 재생 없음 */
  var vids = [].slice.call(document.querySelectorAll('video[data-loop]'));
  vids.forEach(function (v) {
    v.muted = true; v.loop = true; v.preload = 'none';
    v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
    if (rm && !v.closest('a')) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'v-play'; b.innerHTML = PLAY; b.setAttribute('aria-label', '영상 재생');
      v.parentNode.appendChild(b);
      b.addEventListener('click', function () { v.play().catch(function () {}); });
      v.addEventListener('play', function () { b.hidden = true; });
      v.addEventListener('pause', function () { b.hidden = false; });
    }
  });
  if (!rm && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target; v._in = e.isIntersecting;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { io.observe(v); });
    document.addEventListener('visibilitychange', function () {
      vids.forEach(function (v) { if (document.hidden) v.pause(); else if (v._in) v.play().catch(function () {}); });
    });
  }

  /* 전체 소개 영상: 눌렀을 때만 iframe 을 만든다 */
  [].forEach.call(document.querySelectorAll('[data-yt]'), function (btn) {
    btn.addEventListener('click', function () {
      var box = btn.closest('.hero-media'); if (!box) return;
      var slot = box.querySelector('.yt-slot');
      var f = document.createElement('iframe');
      f.src = btn.getAttribute('data-yt') + '?autoplay=1&rel=0';
      f.title = btn.getAttribute('data-title') || '소개 영상';
      f.allow = 'autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.referrerPolicy = 'strict-origin-when-cross-origin'; f.allowFullscreen = true;
      slot.appendChild(f); slot.hidden = false;
      [].forEach.call(box.querySelectorAll('.vwin,.vcap-live,[data-yt]'), function (n) { n.hidden = true; n.style.display = 'none'; });
      [].forEach.call(box.querySelectorAll('.vcap-yt'), function (n) { n.hidden = false; });
      vids.forEach(function (v) { if (box.contains(v)) v.pause(); });
      f.focus();
    });
  });

  /* 가로 쇼케이스 이전·다음 */
  [].forEach.call(document.querySelectorAll('[data-carousel]'), function (c) {
    var tr = c.querySelector('.sc-list'), pv = c.querySelector('.sc-prev'), nx = c.querySelector('.sc-next');
    if (!tr || !pv || !nx) return;
    function upd() {
      pv.disabled = tr.scrollLeft < 4;
      nx.disabled = tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 4;
    }
    function go(d) { tr.scrollBy({ left: d * Math.max(240, tr.clientWidth * 0.8), behavior: rm ? 'auto' : 'smooth' }); }
    pv.addEventListener('click', function () { go(-1); });
    nx.addEventListener('click', function () { go(1); });
    tr.addEventListener('scroll', function () { window.requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener('resize', upd); upd();
  });

  /* 휴대폰 메뉴 시트 */
  var mb = document.querySelector('.mn-btn'), sh = document.getElementById('mnSheet');
  if (mb && sh) {
    function setM(o) { sh.hidden = !o; mb.setAttribute('aria-expanded', o ? 'true' : 'false'); document.body.classList.toggle('mn-open', o); }
    mb.addEventListener('click', function () { setM(sh.hidden); });
    sh.addEventListener('click', function (e) { if (e.target.closest('a')) setM(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sh.hidden) { setM(false); mb.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 820) setM(false); });
  }

  /* 도움말: 분류 탭 + 검색 */
  var hb = document.getElementById('helpTools');
  if (hb) {
    var groups = [].slice.call(document.querySelectorAll('.pg-fgroup'));
    var tabs = hb.querySelector('.tabs'), q = hb.querySelector('.help-search'), empty = document.getElementById('helpEmpty');
    var cur = -1;
    q.hidden = false;
    function mk(label, idx) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = label;
      b.setAttribute('aria-pressed', idx === cur ? 'true' : 'false');
      b.addEventListener('click', function () { cur = idx; q.value = ''; render(); });
      tabs.appendChild(b); return b;
    }
    var btns = [mk('전체', -1)].concat(groups.map(function (g, i) { return mk(g.querySelector('h2').textContent, i); }));
    function render() {
      var term = q.value.trim().toLowerCase(), shown = 0;
      groups.forEach(function (g, i) {
        var any = 0;
        [].forEach.call(g.querySelectorAll('details'), function (d) {
          var ok = !term || d.textContent.toLowerCase().indexOf(term) >= 0;
          d.hidden = !ok; if (ok) any++;
        });
        var vis = any > 0 && (term ? true : (cur < 0 || cur === i));
        g.hidden = !vis; if (vis) shown += any;
      });
      btns.forEach(function (b, i) { b.setAttribute('aria-pressed', (term ? i === 0 : i === cur + 1) ? 'true' : 'false'); });
      empty.hidden = shown > 0;
    }
    q.addEventListener('input', render); render();
  }
})();
