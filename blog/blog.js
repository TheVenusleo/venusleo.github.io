(function(){
  const listEl = document.getElementById('posts-list');
  const searchEl = document.getElementById('search');
  const tagBar = document.getElementById('tag-bar');
  let allPosts = [];
  let activeTag = null;

  fetch('posts.json')
    .then(r => r.json())
    .then(data => {
      allPosts = data;
      renderTags(collectTags(allPosts));
      render(allPosts);
    })
    .catch(err => {
      listEl.innerHTML = '<p>加载文章列表失败：' + String(err) + '</p>';
    });

  function collectTags(items){
    const set = new Set();
    items.forEach(p => (p.tags||[]).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }

  function renderTags(tags){
    tagBar.innerHTML = '';
    const allBtn = pill('全部', !activeTag, () => { activeTag = null; applyFilter(); });
    tagBar.appendChild(allBtn);
    tags.forEach(t => {
      const btn = pill(t, activeTag === t, () => { activeTag = (activeTag===t?null:t); applyFilter(); });
      tagBar.appendChild(btn);
    });
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

  function applyFilter(){
    const q = (searchEl.value || '').trim().toLowerCase();
    const filtered = allPosts.filter(p => {
      const inText = (p.title + ' ' + (p.summary||'') + ' ' + (p.tags||[]).join(' ')).toLowerCase().includes(q);
      const inTag = activeTag ? (p.tags||[]).includes(activeTag) : true;
      return inText && inTag;
    });
    render(filtered);
    renderTags(collectTags(allPosts)); // keep pills; highlight current
  }

  searchEl && searchEl.addEventListener('input', applyFilter);

  function render(items){
    if(!items.length){
      listEl.innerHTML = '<p>没有匹配的文章。</p>';
      return;
    }
    listEl.innerHTML = items.map(card).join('\n');
  }

  function card(p){
    const cover = p.cover ? `<span class="image main"><img src="${escapeHtml(p.cover)}" alt=""></span>` : '';
    const attachments = (p.attachments && p.attachments.length)
      ? `<div style="margin-top:.5rem;"><strong>附件：</strong> ` + p.attachments.map(a => {
          return `<a href="${escapeHtml(a.path)}" download>${escapeHtml(a.name)}</a>`;
        }).join(' | ') + `</div>`
      : '';
    const tags = (p.tags||[]).map(t => `<code style="opacity:.8">${escapeHtml(t)}</code>`).join(' ');
    return `
      <article>
        ${cover}
        <h3>${escapeHtml(p.title)}</h3>
        <p style="margin:.25rem 0 .5rem 0; opacity:.8;">${escapeHtml(p.date)} ${tags? ' · ' + tags : ''}</p>
        <p>${escapeHtml(p.summary||'')}</p>
        <ul class="actions">
          <li><a class="button primary" href="${escapeHtml(p.href)}">Read</a></li>
        </ul>
        ${attachments}
      </article>
    `;
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[s]));
  }
})();