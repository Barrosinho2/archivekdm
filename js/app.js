/* =========================================================
   KDM ARCHIVING — app
   Estrutura pensada para virar e-commerce:
   - Catalog: lê PRODUTOS (data.js). Trocar por fetch('/api/produtos') no futuro.
   - Store: sacola + favoritos (localStorage). checkout() decide o canal pelo CONFIG.checkout.mode.
   - UI: renderização de cards, PDP (#peca-<slug>), sacola e filtros.
   - Motion: GSAP + ScrollTrigger + Lenis (opcional: o site funciona sem eles).
   ========================================================= */
(() => {
  'use strict';
  const C = window.CONFIG, P = window.PRODUTOS, CATS = window.CATEGORIAS, TAGS = window.ETIQUETAS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const brl = v => v == null ? '' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const num = v => String(v).replace('.', ',');
  const catName = id => (CATS.find(c => c.id === id) || {}).nome || id;
  const bySlug = s => P.find(p => p.slug === s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Store ---------------- */
  const mem = {};
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return mem[k] ?? d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { mem[k] = v; } }
  };
  const Store = {
    bag: ls.get('kdm_bag', []),
    favs: ls.get('kdm_favs', []),
    save() { ls.set('kdm_bag', this.bag); ls.set('kdm_favs', this.favs); UI.counts(); },
    add(id) {
      const p = P.find(x => x.id === id);
      if (!p || p.estoque < 1) return false;
      if (!this.bag.includes(id)) this.bag.push(id);   // peça única: quantidade sempre 1
      this.save(); return true;
    },
    remove(id) { this.bag = this.bag.filter(x => x !== id); this.save(); },
    toggleFav(id) {
      this.favs = this.favs.includes(id) ? this.favs.filter(x => x !== id) : [...this.favs, id];
      this.save(); return this.favs.includes(id);
    },
    items() { return this.bag.map(id => P.find(p => p.id === id)).filter(Boolean); },
    total() { return this.items().reduce((s, p) => s + (p.preco || 0), 0); },
    /* Mensagem pronta (DM hoje, WhatsApp quando houver número) */
    message(items = this.items()) {
      const lines = items.map(p => `• ${p.nome} (${p.tamanho}) — ${brl(p.preco)} [${p.id}]`);
      return `Oi! Vi no site e quero:\n${lines.join('\n')}\nTotal: ${brl(items.reduce((s, p) => s + (p.preco || 0), 0))}\nAinda estão disponíveis?`;
    },
    /* Adaptador de checkout: aqui entra Nuvemshop/Shopify/Stripe no futuro */
    checkoutHref(msg) {
      if (C.checkout.mode === 'dm') {
        return C.whatsapp ? `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}` : C.dmUrl;
      }
      return '#';   // TODO e-commerce: retornar URL do carrinho/checkout da plataforma
    }
  };

  /* copiar a mensagem antes de abrir a DM (o Instagram não aceita texto pronto) */
  function copyAndGo(msg) {
    if (C.whatsapp) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).then(() => UI.toast('Mensagem copiada. É só colar na DM.')).catch(() => UI.toast('Abrindo a DM do @archivekdm'));
    } else UI.toast('Abrindo a DM do @archivekdm');
  }

  /* ---------------- Templates ---------------- */
  const statusLabel = p => p.status === 'disponivel' ? 'Disponível' : (p.encomenda ? 'Vendido sob encomenda' : 'Vendido');
  const coverImg = p => p.recorte || p.fotos[p.capa];

  function cardHTML(p) {
    const sold = p.status !== 'disponivel';
    const fav = Store.favs.includes(p.id);
    return `
    <article class="card${sold ? ' is-sold' : ''}" data-slug="${p.slug}" data-id="${p.id}">
      <div class="card__media">
        <img class="card__a${p.recorte ? '' : ' is-photo'}" src="${coverImg(p)}" alt="${p.nome}" loading="lazy">
        <img class="card__b" src="${p.fotos[p.hover]}" alt="" loading="lazy">
        ${sold ? `<span class="card__stamp">Vendido${p.encomenda ? '<small>sob encomenda</small>' : ''}</span>` : ''}
        <button class="card__fav${fav ? ' is-on' : ''}" data-fav="${p.id}" aria-label="Favoritar ${p.nome}" aria-pressed="${fav}"><svg><use href="#i-heart"/></svg></button>
        <div class="card__quick">${sold
          ? `<button class="btn btn--light" data-dm="parecida" data-ref="${p.slug}"><span data-t="Quero uma parecida">Quero uma parecida</span></button>`
          : `<button class="btn btn--dark" data-add="${p.id}"><span data-t="Adicionar à sacola">Adicionar à sacola</span></button>`}
        </div>
      </div>
      <div class="card__info">
        <p class="card__flag${sold ? ' is-sold' : ''}">${statusLabel(p)}</p>
        <h3 class="card__name">${p.nome}</h3>
        <p class="card__meta">${p.marca} · ${catName(p.categoria)}</p>
        <p class="card__ficha">Cond. ${num(p.cond)}/10 · Tam. ${p.tamanho} · Cor ${p.cor}%</p>
        <p class="card__price">${sold ? '—' : brl(p.preco)}</p>
      </div>
    </article>`;
  }

  /* ---------------- UI ---------------- */
  const UI = {
    counts() {
      $$('[data-count="bag"]').forEach(e => e.textContent = Store.bag.length || '');
      $$('[data-count="favs"]').forEach(e => e.textContent = Store.favs.length || '');
    },
    toast(t) {
      const el = $('#toast'); el.textContent = t; el.classList.add('is-on');
      clearTimeout(this._t); this._t = setTimeout(() => el.classList.remove('is-on'), 2600);
    },
    lock(on) {
      document.documentElement.style.overflow = on ? 'hidden' : '';
      if (window.__lenis) on ? window.__lenis.stop() : window.__lenis.start();
    }
  };

  /* ---------- duo ---------- */
  $('#duo').innerHTML = P.filter(p => p.status === 'disponivel').slice(0, 2).map(p => `
    <a class="feature" href="#peca-${p.slug}" data-open="${p.slug}">
      <img src="${p.fotos[p.capa]}" alt="${p.nome}" loading="lazy">
      <div class="feature__copy">
        <p class="feature__name">${p.nome.replace('Polo Edição ', 'Polo ')}</p>
        <p class="feature__meta">Tam. ${p.tamanho} · Cond. ${num(p.cond)}/10 · ${brl(p.preco)}</p>
        <span class="btn btn--light"><span data-t="Comprar">Comprar</span></span>
      </div>
    </a>`).join('');

  /* ---------- categorias ---------- */
  $('#rail-cats').innerHTML = CATS.map((c, i) => {
    const n = P.filter(p => p.categoria === c.id).length;
    const photo = c.capa.includes('/produtos/');
    return `<a class="cat" href="#loja" data-filter-cat="${c.id}">
      <div class="cat__img"><span class="cat__n">${String(i + 1).padStart(2, '0')} / ${n} ${n === 1 ? 'peça' : 'peças'}</span><img src="${c.capa}" alt="" class="${photo ? 'is-photo' : ''}" loading="lazy"></div>
      <p class="cat__label">${c.nome}<svg><use href="#i-arrow"/></svg></p></a>`;
  }).join('');

  /* ---------- fotos reais ---------- */
  $('#real-track').innerHTML = TAGS.map((t, i) => {
    const [a, b] = t.legenda.split(' — ');
    return `<figure class="shot"><div class="shot__img"><img src="${t.img}" alt="${t.legenda}" loading="lazy"></div><figcaption><span>${a}</span><span>${b}</span></figcaption></figure>`;
  }).join('');

  /* ---------- filtros ---------- */
  const F = { status: new Set(), cat: new Set(), marca: new Set(), q: '', sort: 'recentes' };
  const statusDefs = [
    { id: 'disponivel', nome: 'Disponível', icon: 'img/marca/icone-destaque-disponivel.png', test: p => p.status === 'disponivel' },
    { id: 'encomenda', nome: 'Sob encomenda', icon: 'img/marca/icone-destaque-arquivos.png', test: p => p.encomenda },
    { id: 'vendido', nome: 'Vendido (arquivo)', icon: 'img/marca/icone-destaque-vendido.png', test: p => p.status === 'vendido' }
  ];
  const marcas = [...new Set(P.map(p => p.marca))].sort();
  const chk = (group, id, label, n, icon) => `<label class="check"><input type="checkbox" data-g="${group}" value="${id}">${icon ? `<img src="${icon}" alt="">` : ''}<span>${label}</span><span class="n">${n}</span></label>`;
  $('#f-status').innerHTML = statusDefs.map(s => chk('status', s.id, s.nome, P.filter(s.test).length, s.icon)).join('');
  $('#f-cat').innerHTML = CATS.map(c => chk('cat', c.id, c.nome, P.filter(p => p.categoria === c.id).length)).join('');
  $('#f-marca').innerHTML = marcas.map(m => chk('marca', m, m, P.filter(p => p.marca === m).length)).join('');
  $('#filters').insertAdjacentHTML('afterbegin', '<button class="icon-btn filters__close" aria-label="Fechar filtros"><svg><use href="#i-close"/></svg></button>');

  function filtered() {
    const q = F.q.trim().toLowerCase();
    let list = P.filter(p =>
      (!F.status.size || [...F.status].some(s => statusDefs.find(d => d.id === s).test(p))) &&
      (!F.cat.size || F.cat.has(p.categoria)) &&
      (!F.marca.size || F.marca.has(p.marca)) &&
      (!q || `${p.nome} ${p.marca} ${catName(p.categoria)} ${p.tamanho}`.toLowerCase().includes(q)));
    const s = {
      recentes: (a, b) => b.data.localeCompare(a.data),
      disponiveis: (a, b) => (a.status === 'disponivel' ? -1 : 1) - (b.status === 'disponivel' ? -1 : 1) || b.data.localeCompare(a.data),
      cond: (a, b) => b.cond - a.cond,
      az: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR')
    }[F.sort];
    return list.sort(s);
  }

  function renderGrid(animate = true) {
    const list = filtered();
    $('#shop-count').textContent = `(${list.length})`;
    $('#grid').innerHTML = list.length ? list.map(cardHTML).join('') : '<p class="empty">Nenhuma peça com esses filtros. <button class="text-btn text-btn--u" data-clear>Limpar filtros</button></p>';
    $$('#filters input').forEach(i => i.checked = F[i.dataset.g].has(i.value));
    if (animate && window.gsap && !reduce) {
      gsap.fromTo('#grid .card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .04, ease: 'power3.out', clearProps: 'transform,opacity' });
      gsap.fromTo('#grid .card__stamp', { scale: 2.2, opacity: 0, rotate: -24 }, { scale: 1, opacity: 1, rotate: -6, duration: .5, stagger: .04, delay: .25, ease: 'back.out(2.2)' });
    }
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  function setFilter(group, value, scroll = true) {
    F.status.clear(); F.cat.clear(); F.marca.clear(); F.q = ''; $('#busca').value = '';
    if (value) F[group].add(value);
    renderGrid();
    if (scroll) goTo('#loja');
  }

  function goTo(sel) {
    const el = $(sel); if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -8, duration: 1.2 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------- PDP ---------- */
  let current = null;
  function openPDP(slug, push = true) {
    const p = bySlug(slug); if (!p) return;
    current = p;
    const sold = p.status !== 'disponivel';
    const thumbs = p.fotos.map((f, i) => `<button data-i="${i}" class="${i === p.capa ? 'is-on' : ''}" aria-label="Foto ${i + 1}"><img src="${f}" alt=""></button>`).join('');
    $('#pdp-thumbs').innerHTML = thumbs;
    const img = $('#pdp-img'); img.src = p.fotos[p.capa]; img.alt = p.nome;
    $('.pdp__main').classList.remove('is-zoom');
    $('#pdp-info').innerHTML = `
      <p class="pdp__status${sold ? ' is-sold' : ''}">${statusLabel(p)}</p>
      <h2 class="pdp__name" id="pdp-name">${p.nome}</h2>
      <p class="pdp__brand">${p.marca} · ${catName(p.categoria)}</p>
      <p class="pdp__price">${sold ? 'Vendido' : brl(p.preco)}</p>
      <p class="pdp__label">Tamanho</p>
      <div class="pdp__sizes"><span class="size">${p.tamanho}</span></div>
      <div class="pdp__ctas">${sold
        ? `<button class="btn btn--dark btn--block" data-dm="parecida" data-ref="${p.slug}"><span data-t="Quero uma parecida">Quero uma parecida</span></button>`
        : `<button class="btn btn--dark btn--block" data-add="${p.id}"><span data-t="Adicionar à sacola">Adicionar à sacola</span></button>
           <button class="btn btn--outline btn--block" data-buy="${p.id}"><span data-t="Comprar agora pela DM">Comprar agora pela DM</span></button>`}
        <button class="btn btn--outline btn--block" data-fav="${p.id}"><span data-t="${Store.favs.includes(p.id) ? 'Nos favoritos' : 'Favoritar'}">${Store.favs.includes(p.id) ? 'Nos favoritos' : 'Favoritar'}</span></button>
        ${C.enjoeiUrl ? `<a class="btn btn--outline btn--block" href="${C.enjoeiUrl}" target="_blank" rel="noopener"><span data-t="Ver no Enjoei">Ver no Enjoei</span></a>` : ''}
      </div>
      <dl class="pdp__ficha">
        <div><dt>Cond.</dt><dd><span class="meter" style="--v:${p.cond / 10}"><i></i></span></dd><dd>${num(p.cond)}/10</dd></div>
        <div><dt>Cor</dt><dd><span class="meter" style="--v:${p.cor / 100}"><i></i></span></dd><dd>${p.cor}%</dd></div>
        <div><dt>Tamanho</dt><dd></dd><dd>${p.tamanho}</dd></div>
        ${p.obs ? `<div><dt>Detalhe</dt><dd></dd><dd>${p.obs}</dd></div>` : ''}
        <div><dt>Ref.</dt><dd></dd><dd>${p.id.toUpperCase()}</dd></div>
      </dl>
      <p class="pdp__note">${C.frases.fotos} <a href="${p.post}" target="_blank" rel="noopener">Ver o post</a></p>`;
    $('#pdp').hidden = false; UI.lock(true);
    if (push && location.hash !== `#peca-${p.slug}`) history.pushState(null, '', `#peca-${p.slug}`);
    if (window.gsap && !reduce) {
      gsap.fromTo('.pdp__scrim', { opacity: 0 }, { opacity: 1, duration: .35 });
      gsap.fromTo('.pdp__panel', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .55, ease: 'power3.out' });
      gsap.fromTo('#pdp-info > *', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .035, delay: .1, ease: 'power3.out' });
      gsap.fromTo('.pdp__ficha .meter i', { scaleX: 0 }, { scaleX: 1, duration: .9, delay: .4, ease: 'power3.out' });
    }
    $('.pdp__close').focus({ preventScroll: true });
  }
  function closePDP(back = true) {
    if ($('#pdp').hidden) return;
    const done = () => { $('#pdp').hidden = true; UI.lock(false); };
    if (window.gsap && !reduce) gsap.to('.pdp__panel', { y: 30, opacity: 0, duration: .3, ease: 'power2.in', onComplete: done });
    else done();
    if (back && location.hash.startsWith('#peca-')) history.replaceState(null, '', location.pathname + location.search);
    current = null;
  }
  $('#pdp-thumbs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !current) return;
    $$('#pdp-thumbs button').forEach(x => x.classList.toggle('is-on', x === b));
    const img = $('#pdp-img');
    if (window.gsap && !reduce) gsap.fromTo(img, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: .45, ease: 'power2.out' });
    img.src = current.fotos[+b.dataset.i];
    $('.pdp__main').classList.remove('is-zoom');
  });
  $('.pdp__main').addEventListener('click', e => {
    const m = e.currentTarget, r = m.getBoundingClientRect();
    $('#pdp-img').style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    m.classList.toggle('is-zoom');
  });
  $('.pdp__main').addEventListener('mousemove', e => {
    const m = e.currentTarget; if (!m.classList.contains('is-zoom')) return;
    const r = m.getBoundingClientRect();
    $('#pdp-img').style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  });

  /* ---------- drawer (sacola / favoritos) ---------- */
  function openDrawer(kind = 'bag') {
    const isBag = kind === 'bag';
    const items = isBag ? Store.items() : Store.favs.map(id => P.find(p => p.id === id)).filter(Boolean);
    $('#drawer-title').textContent = isBag ? 'Sacola' : 'Favoritos';
    $('#drawer-body').innerHTML = items.length ? items.map(p => `
      <div class="line-item">
        <div class="line-item__img"><img src="${coverImg(p)}" alt=""></div>
        <div><h3>${p.nome}</h3><p>${p.marca} · Tam. ${p.tamanho}</p><p>${statusLabel(p)}</p>
          <button class="line-item__rm" data-${isBag ? 'rm' : 'fav'}="${p.id}">Remover</button>
          ${!isBag && p.status === 'disponivel' && !Store.bag.includes(p.id) ? `<button class="line-item__rm" data-add="${p.id}">Mover para a sacola</button>` : ''}
        </div>
        <p><b>${p.status === 'disponivel' ? brl(p.preco) : '—'}</b></p>
      </div>`).join('') : `<p class="drawer__empty">${isBag ? 'Sua sacola está vazia. As peças disponíveis aparecem com o botão “Adicionar à sacola”.' : 'Nenhum favorito ainda. Toque no coração de uma peça.'}</p>`;
    const msg = Store.message();
    $('#drawer-foot').innerHTML = isBag && items.length ? `
      <div class="total"><span>Subtotal</span><span>${brl(Store.total())}</span></div>
      <p class="drawer__hint">Frete combinado na DM. ${C.frases.entrega}</p>
      <a class="btn btn--dark btn--block" href="${Store.checkoutHref(msg)}" target="_blank" rel="noopener" data-checkout><span data-t="Finalizar pela DM">Finalizar pela DM</span></a>
      <p class="drawer__hint">${C.whatsapp ? 'A mensagem com as peças abre pronta no WhatsApp.' : 'Ao tocar, copiamos a mensagem com as peças. É só colar na DM do @archivekdm.'}</p>` :
      `<button class="btn btn--outline btn--block" data-close-drawer data-go="#loja"><span data-t="Ver peças">Ver peças</span></button>`;
    $('#drawer').dataset.kind = kind;
    if ($('#drawer').hidden) {
      $('#drawer').hidden = false; UI.lock(true);
      if (window.gsap && !reduce) {
        gsap.fromTo('.drawer__scrim', { opacity: 0 }, { opacity: 1, duration: .3 });
        gsap.fromTo('.drawer__panel', { xPercent: 100 }, { xPercent: 0, duration: .55, ease: 'power3.out' });
      }
    }
  }
  function closeDrawer() {
    if ($('#drawer').hidden) return;
    const done = () => { $('#drawer').hidden = true; if ($('#pdp').hidden) UI.lock(false); };
    if (window.gsap && !reduce) gsap.to('.drawer__panel', { xPercent: 100, duration: .4, ease: 'power3.in', onComplete: done });
    else done();
  }

  /* ---------- eventos globais ---------- */
  document.addEventListener('click', e => {
    const t = e.target;
    const fav = t.closest('[data-fav]');
    if (fav) {
      e.preventDefault(); e.stopPropagation();
      const on = Store.toggleFav(fav.dataset.fav);
      $$(`.card__fav[data-fav="${fav.dataset.fav}"]`).forEach(b => { b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); });
      if (fav.matches('.btn')) { const s = fav.querySelector('span'); s.textContent = on ? 'Nos favoritos' : 'Favoritar'; s.dataset.t = s.textContent; }
      if (!$('#drawer').hidden && $('#drawer').dataset.kind === 'favs') openDrawer('favs');
      UI.toast(on ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
      return;
    }
    const add = t.closest('[data-add]');
    if (add) {
      e.preventDefault(); e.stopPropagation();
      if (Store.add(add.dataset.add)) { UI.toast('Adicionado à sacola'); closePDP(); openDrawer('bag'); }
      return;
    }
    const buy = t.closest('[data-buy]');
    if (buy) {
      e.preventDefault();
      const p = P.find(x => x.id === buy.dataset.buy), msg = Store.message([p]);
      copyAndGo(msg);
      const a = document.createElement('a'); a.href = Store.checkoutHref(msg); a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
      return;
    }
    const ck = t.closest('[data-checkout]');
    if (ck) { copyAndGo(Store.message()); return; }
    const rm = t.closest('[data-rm]');
    if (rm) { Store.remove(rm.dataset.rm); openDrawer('bag'); return; }
    const dm = t.closest('[data-dm]');
    if (dm) {
      e.preventDefault(); e.stopPropagation();
      const p = dm.dataset.ref ? bySlug(dm.dataset.ref) : null;
      const msg = p ? `Oi! Vi no site a ${p.nome} (${p.tamanho}), que já foi vendida. Vocês conseguem uma parecida?` : 'Oi! Estou procurando uma peça: (marca, modelo e tamanho). Vocês conseguem por encomenda?';
      copyAndGo(msg);
      const a = document.createElement('a'); a.href = C.whatsapp ? `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}` : C.dmUrl; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
      return;
    }
    const open = t.closest('[data-open]');
    if (open) { e.preventDefault(); openPDP(open.dataset.open); return; }
    const card = t.closest('.card');
    if (card) { openPDP(card.dataset.slug); return; }
    if (t.closest('[data-close]')) { closePDP(); return; }
    const cd = t.closest('[data-close-drawer]');
    if (cd) { closeDrawer(); if (cd.dataset.go) setTimeout(() => goTo(cd.dataset.go), 350); return; }
    if (t.closest('[data-clear]')) { setFilter(null, null, false); return; }
    const fs = t.closest('[data-filter-status]');
    if (fs) { e.preventDefault(); $('#mnav').hidden = true; UI.lock(false); setFilter('status', fs.dataset.filterStatus); return; }
    const fc = t.closest('[data-filter-cat]');
    if (fc) { e.preventDefault(); setFilter('cat', fc.dataset.filterCat); return; }
    const a = t.closest('a[href^="#"]');
    if (a && a.getAttribute('href').length > 1 && !a.getAttribute('href').startsWith('#peca-')) {
      const target = $(a.getAttribute('href'));
      if (target) { e.preventDefault(); $('#mnav').hidden = true; UI.lock(false); goTo(a.getAttribute('href')); }
    }
  });
  $('#btn-bag').addEventListener('click', () => openDrawer('bag'));
  $('#btn-favs').addEventListener('click', () => openDrawer('favs'));
  $('#btn-menu').addEventListener('click', () => { $('#mnav').hidden = false; UI.lock(true); if (window.gsap && !reduce) gsap.fromTo('#mnav nav a', { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: .05, duration: .5, ease: 'power3.out' }); });
  $('#mnav-close').addEventListener('click', () => { $('#mnav').hidden = true; UI.lock(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closePDP(); closeDrawer(); $('#mnav').hidden = true; } });

  $('#filters').addEventListener('change', e => {
    const i = e.target; if (!i.dataset.g) return;
    i.checked ? F[i.dataset.g].add(i.value) : F[i.dataset.g].delete(i.value);
    renderGrid();
  });
  $('#limpar').addEventListener('click', () => setFilter(null, null, false));
  $('#ordenar').addEventListener('change', e => { F.sort = e.target.value; renderGrid(); });
  let qt;
  $('#busca').addEventListener('input', e => {
    clearTimeout(qt);
    qt = setTimeout(() => { F.q = e.target.value; renderGrid(); if (F.q.length > 1) goTo('#loja'); }, 220);
  });
  $('.search').addEventListener('click', e => {
    if (innerWidth > 860) return;
    const s = e.currentTarget;
    if (!s.classList.contains('is-open')) { s.classList.add('is-open'); $('#busca').focus(); }
  });
  $('#busca').addEventListener('blur', () => { if (!$('#busca').value) $('.search').classList.remove('is-open'); });

  const shop = $('#loja');
  $('#toggle-filters').addEventListener('click', () => {
    if (innerWidth <= 860) { shop.classList.add('filters-open'); UI.lock(true); return; }
    const off = shop.classList.toggle('filters-off');
    $('#toggle-filters span').textContent = off ? 'Mostrar filtros' : 'Ocultar filtros';
    shop.querySelector('.grid').style.gridTemplateColumns = off && innerWidth > 1180 ? 'repeat(4, 1fr)' : '';
    setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 520);
  });
  $('.filters__close').addEventListener('click', () => { shop.classList.remove('filters-open'); UI.lock(false); });
  const mqMobile = matchMedia('(max-width: 860px)');
  const syncFilterLabel = () => { $('#toggle-filters span').textContent = mqMobile.matches ? 'Filtros' : (shop.classList.contains('filters-off') ? 'Mostrar filtros' : 'Ocultar filtros'); };
  mqMobile.addEventListener('change', syncFilterLabel); syncFilterLabel();

  /* rails */
  $$('[data-rail]').forEach(b => b.addEventListener('click', () => {
    const r = $('#rail-' + b.dataset.rail);
    r.scrollBy({ left: b.dataset.dir * r.clientWidth * .8, behavior: 'smooth' });
  }));
  const railState = () => {
    const r = $('#rail-cats');
    $$('[data-rail="cats"]').forEach(b => b.disabled = b.dataset.dir < 0 ? r.scrollLeft < 8 : r.scrollLeft + r.clientWidth > r.scrollWidth - 8);
  };
  $('#rail-cats').addEventListener('scroll', railState, { passive: true }); railState();

  /* rota: #peca-<slug> abre a PDP */
  const route = () => { const h = location.hash; if (h.startsWith('#peca-')) openPDP(h.slice(6), false); else closePDP(false); };
  addEventListener('hashchange', route);
  addEventListener('popstate', route);

  if (C.enjoeiUrl) $$('[data-enjoei]').forEach(a => { a.href = C.enjoeiUrl; a.hidden = false; });
  UI.counts();
  renderGrid(false);

  /* palavra do rodapé ocupa a largura toda */
  const fit = () => {
    const w = $('.footer__word'); w.style.fontSize = '100px';
    const [a, b] = w.children, need = a.offsetWidth + b.offsetWidth + 25;
    w.style.fontSize = Math.floor(100 * w.clientWidth / need * .985) + 'px';
  };
  document.fonts ? document.fonts.ready.then(fit) : fit();
  addEventListener('resize', fit);

  /* manifesto: palavras */
  const man = $('#manifesto');
  const brandWords = ['única.', 'verdade,', '10.'];
  man.innerHTML = man.textContent.split(' ').map(w => `<span class="w${brandWords.includes(w) ? ' is-brand' : ''}">${w}</span>`).join(' ');

  /* ---------------- Motion ---------------- */
  const header = $('#header');
  let lastY = 0;
  const onScroll = y => {
    const down = y > lastY;
    header.classList.toggle('is-scrolled', y > 10);
    const hide = down && y > 260;
    header.classList.toggle('is-hidden', hide);
    document.body.classList.toggle('header-on', !hide);
    lastY = y;
  };

  if (!window.gsap || !window.ScrollTrigger || reduce) {
    addEventListener('scroll', () => onScroll(scrollY), { passive: true });
    $$('#manifesto .w').forEach(w => w.classList.add('is-on'));
    route();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ({ scroll }) => { ScrollTrigger.update(); onScroll(scroll); });
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  /* ticker com velocidade do scroll */
  const track = $('.ticker__track');
  const tick = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    onUpdate: s => {
      const v = gsap.utils.clamp(-6, 6, s.getVelocity() / 300);
      gsap.to(tick, { timeScale: v < 0 ? -1 + v : 1 + v, duration: .3, overwrite: true });
      gsap.to(tick, { timeScale: v < 0 ? -1 : 1, duration: 1.2, delay: .3 });
    }
  });

  /* hero */
  const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
  intro.from('.hero__img', { scale: 1.28, duration: 1.8, ease: 'power3.out' })
    .from('.hero__title .line > span', { yPercent: 110, duration: 1.1, stagger: .09 }, .25)
    .from('.hero .eyebrow, .hero__actions .btn', { y: 20, opacity: 0, duration: .8, stagger: .07 }, .6);
  gsap.to('.hero__img', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__copy', { y: -80, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });

  /* contador */
  const cnt = { v: 0 };
  ScrollTrigger.create({
    trigger: '.count', start: 'top 75%', once: true,
    onEnter: () => gsap.to(cnt, { v: C.vendidos, duration: 2, ease: 'power2.out', onUpdate: () => $('#contador').textContent = Math.round(cnt.v) })
  });
  $('#contador').textContent = '0';
  gsap.from('.count__num', { scale: .86, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.count', start: 'top 80%' } });

  /* duo: cortina */
  $$('.feature').forEach(f => {
    gsap.fromTo(f, { clipPath: 'inset(18% 8% 0% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: f, start: 'top 95%', end: 'top 35%', scrub: .6 } });
    gsap.fromTo(f.querySelector('img'), { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: f, start: 'top 95%', end: 'bottom 40%', scrub: .6 } });
    gsap.from(f.querySelectorAll('.feature__copy > *'), { y: 30, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: f, start: 'top 55%' } });
  });

  /* categorias */
  gsap.from('.cat', { y: 60, opacity: 0, duration: .9, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.rail', start: 'top 85%' } });
  gsap.from('.cat__img img:not(.is-photo)', { yPercent: 30, rotate: 8, duration: 1.2, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.rail', start: 'top 85%' } });

  /* manifesto: acende palavra por palavra */
  const words = $$('#manifesto .w');
  ScrollTrigger.create({
    trigger: '.manifesto', start: 'top 75%', end: 'bottom 45%', scrub: true,
    onUpdate: s => { const n = Math.round(s.progress * words.length); words.forEach((w, i) => w.classList.toggle('is-on', i < n)); }
  });

  /* fotos reais: pin + horizontal (desktop) */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    const tr = $('#real-track');
    const dist = () => tr.scrollWidth - (innerWidth - tr.getBoundingClientRect().left) + 40;
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.real', start: 'top top', end: () => '+=' + dist(), scrub: .8, pin: '.real__pin', invalidateOnRefresh: true, anticipatePin: 1 } });
    tl.to(tr, { x: () => -dist(), ease: 'none' }, 0);
    $$('.shot__img img').forEach(img => tl.fromTo(img, { xPercent: 8 }, { xPercent: -8, ease: 'none' }, 0));
    gsap.from('.real__head > *', { y: 40, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.real', start: 'top 60%' } });
  });
  mm.add('(max-width: 860px)', () => {
    gsap.from('.shot', { y: 40, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.real', start: 'top 70%' } });
  });

  /* ficha: etiqueta balança e medidores enchem */
  gsap.from('.tag', { rotate: -9, y: -40, opacity: 0, duration: 1.4, ease: 'elastic.out(1, .55)', scrollTrigger: { trigger: '.ficha', start: 'top 70%' } });
  gsap.from('.tag .meter i', { scaleX: 0, duration: 1.2, stagger: .15, delay: .5, ease: 'power3.out', scrollTrigger: { trigger: '.ficha', start: 'top 70%' } });
  gsap.from('.ficha__copy > *', { y: 30, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.ficha', start: 'top 70%' } });

  /* loja: cards entram em lote, carimbo bate */
  gsap.set('#grid .card', { opacity: 0 });
  ScrollTrigger.batch('#grid .card', {
    start: 'top 92%', once: true,
    onEnter: b => {
      gsap.fromTo(b, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .07, ease: 'power3.out', clearProps: 'transform,opacity' });
      gsap.fromTo(b.map(c => c.querySelector('.card__stamp')).filter(Boolean), { scale: 2.4, opacity: 0, rotate: -26 }, { scale: 1, opacity: 1, rotate: -6, duration: .55, stagger: .07, delay: .35, ease: 'back.out(2.4)' });
    }
  });

  /* encomenda */
  gsap.fromTo('.order__media img', { yPercent: -14 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.order', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.order__copy > *', { y: 40, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.order', start: 'top 60%' } });

  /* como comprar */
  gsap.fromTo('.how__list', { borderTopColor: 'rgba(36,31,28,0)' }, { borderTopColor: 'rgba(36,31,28,1)', duration: .8, scrollTrigger: { trigger: '.how', start: 'top 70%' } });
  gsap.from('.how__list li', { y: 40, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.how', start: 'top 70%' } });
  gsap.from('.faq details', { y: 24, opacity: 0, stagger: .06, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: '.faq', start: 'top 75%' } });

  /* rodapé: palavra gigante sobe */
  gsap.from('.footer__word span', { yPercent: 100, duration: 1.2, stagger: .12, ease: 'power4.out', scrollTrigger: { trigger: '.footer__word', start: 'top 95%' } });

  addEventListener('load', () => ScrollTrigger.refresh());
  route();
})();
