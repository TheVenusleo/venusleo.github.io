(function(){
  const listEl  = document.getElementById('posts-list');
  const searchEl = document.getElementById('search');
  const tagBar   = document.getElementById('tag-bar');
  if (!listEl) { alert('缺少容器：#posts-list'); return; }

  let allPosts = [];
  let activeTag = null;

  // 防缓存 + 兼容数组或 {posts:[...]}
  fetch('posts.json?ts=' + Date.now(), { cache: 'no-store' })
    .then(r => r.json())
    .then(d => {
      const arr = Array.isArray(d) ? d : (Array.isArray(d.posts) ? d.posts : Object.values(d));
      allPosts = Array.isArray(arr) ? arr : [];
      renderTags(collectTags(allPosts));
      render(allPosts);
    })
    .catch(e => listEl.innerHTML = `<p>加载文章列表失败：${String(e)}</p>`);

  // 收集标签
  function collectTags(items){
    const set = new Set();
    items.forEach(p => (p.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }

  // 渲染标签条
  function renderTags(tags){
    if (!tagBar) return;
    tagBar.innerHTML = '';
    tagBar.appendChild(pill('全部', !activeTag, () => { activeTag = null; applyFilter(); }));
    tags.forEach(t => tagBar.appendChild(
      pill(t, activeTag === t, () => { activeTag = (activeTag === t ? null : t); applyFilter(); })
    ));
  }
  function pill(text, active, onClick){
    const a = document.createElement('a');
    a.textContent = text;
    a.href = 'javascript:void(0)';
    a.style.padding = '.35rem .65rem';
    a.style.border = '1px solid rgba(255,255,255,.25)';
    a.style.borderRadius = '999px';
    a.style.fontSize = '.9rem';
    a.style.opacity = active ? '1' : '.7';
    a.onclick = onClick;
    return a;
  }

  // 搜索
  searchEl && searchEl.addEventListener('input', applyFilter);
  function applyFilter(){
    const q = (searchEl.value || '').trim().toLowerCase();
    const filtered = allPosts.filter(p => {
      const inText = (p.title + ' ' + (p.summary||'') + ' ' + (p.tags||[]).join(' ')).toLowerCase().includes(q);
      const inTag  = activeTag ? (p.tags||[]).includes(activeTag) : true;
      return inText && inTag;
    });
    render(filtered);
    renderTags(collectTags(allPosts));
  }

  // 核心：渲染卡片（用 <div>，并附最小样式，避免被主题样式隐藏）
  function render(items){
    if (!items.length){ listEl.innerHTML = '<p>没有匹配的文章。</p>'; return; }
    listEl.innerHTML = items.map(card).join('');
  }
  function card(p){
    const cover = p.cover ? `
  <div class="cover" style="
    width:100%;
    aspect-ratio:16/9;       /* 或改为 height:220px; */
    overflow:hidden;
    border-radius:.75rem;
    margin:0 0 .75rem 0;">
    <img src="${escapeHtml(p.cover)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">
  </div>
` : '';
    const tags = (p.tags||[]).map(t => `<code style="opacity:.8">${esc(t)}</code>`).join(' ');
    const attachments = (p.attachments && p.attachments.length)
      ? `<div style="margin-top:.5rem;"><strong>附件：</strong> ${
          p.attachments.map(a => `<a href="${esc(a.path)}" download>${esc(a.name)}</a>`).join(' | ')
        }</div>` : '';
    return `
      <div class="post-card" style="border:1px solid rgba(255,255,255,.15);padding:1rem;border-radius:.75rem;margin:1rem 0;">
        ${cover}
        <h3 style="margin:0 0 .25rem 0">${esc(p.title || '')}</h3>
        <p style="margin:.25rem 0 .75rem 0;opacity:.8;">${esc(p.date || '')}${tags ? ' · ' + tags : ''}</p>
        <p>${esc(p.summary || '')}</p>
        <ul class="actions" style="margin-top:.75rem;">
          <li><a class="button primary" href="${esc(p.href || '#')}">Read</a></li>
        </ul>
        ${attachments}
      </div>`;
  }

  function esc(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
})();
