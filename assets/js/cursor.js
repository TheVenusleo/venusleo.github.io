(() => {
  // 触摸屏等粗指针设备直接跳过
  if (!window.matchMedia || !matchMedia('(pointer:fine)').matches) return;

  // 创建元素
  const dot  = document.createElement('div');  dot.id  = 'cursor-dot';
  const ring = document.createElement('div');  ring.id = 'cursor-ring';
  document.body.append(dot, ring);
  document.body.classList.add('cursor-enabled');

  let x = window.innerWidth / 2,  y = window.innerHeight / 2; // 实际位置
  let rx = x, ry = y;                                         // 外环缓动位置

  // 跟随
  function onMove(e){ x = e.clientX; y = e.clientY; }
  document.addEventListener('mousemove', onMove, { passive: true });

  // 动画帧（外环带一点滞后感）
  const ease = 0.2;
  function raf(){
    rx += (x - rx) * ease;
    ry += (y - ry) * ease;
    dot.style.left  = x + 'px'; dot.style.top  = y + 'px';
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(raf);
  }
  raf();

  // 悬停在可点击元素上放大外环
  const hoverables = 'a, button, .button, [role="button"], input[type="submit"]';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverables)) document.body.classList.add('is-hovering-link');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverables)) document.body.classList.remove('is-hovering-link');
  });

  // 点击涟漪
  document.addEventListener('mousedown', e => {
    const r = document.createElement('span');
    r.className = 'cursor-ripple';
    r.style.left = e.clientX + 'px';
    r.style.top  = e.clientY + 'px';
    document.body.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });
})();
