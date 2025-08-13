(function(){
  const listEl = document.getElementById('posts-list');
  if (!listEl) {
    alert('缺少容器：#posts-list');
    return;
  }

  fetch('posts.json?ts=' + Date.now(), { cache: 'no-store' })
    .then(r => r.json())
    .then(d => {
      const items = Array.isArray(d) ? d : (Array.isArray(d.posts) ? d.posts : Object.values(d));
      // 在标题下方显示加载数量，方便你确认脚本拿到了多少篇
      const h2 = document.querySelector('#posts h2.major');
      if (h2) h2.insertAdjacentHTML('afterend', `<p style="opacity:.6">Loaded ${items.length} posts</p>`);
      render(items);
    })
    .catch(e => listEl.innerHTML = `<p>加载失败：${String(e)}</p>`);

  function render(items){
    if (!items.length){
      listEl.innerHTML = '<p>没有匹配的文章。</p>';
      return;
    }
    listEl.innerHTML = items.map(card).join('');
  }

  function card(p){
    return `
      <article>
        <h3>${esc(p.title || '')}</h3>
        <p style="margin:.25rem 0 .5rem 0; opacity:.8;">${esc(p.date || '')}</p>
        <p>${esc(p.summary || '')}</p>
        <ul class="actions">
          <li><a class="button primary" href="${esc(p.href || '#')}">Read</a></li>
        </ul>
      </article>`;
  }

  function esc(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
})();
