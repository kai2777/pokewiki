import {
  TYPE_INFO, formatDexId, artworkUrl, spriteUrl
} from './config.js';

function element(tag, className = '', text = null) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== null) node.textContent = text;
  return node;
}

function pokemonImage(id, label, className = 'pokemon-image') {
  const image = element('img', className);
  image.src = artworkUrl(id);
  image.alt = `${label}的寶可夢圖片`;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    if (!image.dataset.fallback) {
      image.dataset.fallback = '1';
      image.src = spriteUrl(id);
    } else {
      image.hidden = true;
      image.parentElement?.append(element('span', 'image-fallback', '◒'));
    }
  });
  return image;
}

export function renderSkeleton(grid, count = 12) {
  grid.replaceChildren();
  for (let index = 0; index < count; index++) {
    const skeleton = element('div', 'skeleton-card');
    skeleton.setAttribute('aria-hidden', 'true');
    grid.append(skeleton);
  }
}

function typeBadge(type) {
  const info = TYPE_INFO[type] || { label: type, color: '#8b98a8' };
  const badge = element('span', 'type-badge', info.label);
  badge.style.setProperty('--type-color', info.color);
  return badge;
}

export function renderCards(grid, pokemon, onSelect) {
  grid.replaceChildren();
  if (!pokemon.length) {
    const empty = element('div', 'empty-state');
    empty.append(element('div', 'empty-symbol', '⌕'));
    empty.append(element('h3', '', '找不到符合條件的寶可夢'));
    empty.append(element('p', '', '試著更換搜尋名稱、編號，或切換屬性篩選。'));
    grid.append(empty);
    return;
  }
  const fragment = document.createDocumentFragment();
  pokemon.forEach((item) => {
    const card = element('button', 'pokemon-card');
    card.type = 'button';
    card.setAttribute('aria-label', `查看 ${item.name}（${formatDexId(item.id)}）的詳細資訊`);
    const media = element('div', 'card-media');
    media.append(element('span', 'card-number', formatDexId(item.id)));
    media.append(pokemonImage(item.id, item.name));
    const body = element('div', 'card-body');
    body.append(element('h3', 'card-title', item.name));
    body.append(element('p', 'card-english', item.englishName));
    const badges = element('div', 'badge-list');
    if (item.types.length) item.types.forEach((type) => badges.append(typeBadge(type)));
    else badges.append(element('span', 'type-badge is-muted', '屬性資料暫缺'));
    body.append(badges);
    card.append(media, body);
    card.addEventListener('click', () => onSelect(item.id));
    fragment.append(card);
  });
  grid.append(fragment);
}

export function renderPager(root, total, page, pageSize, onPageChange) {
  root.replaceChildren();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages === 1) return;
  const makeButton = (label, destination, disabled, current = false) => {
    const button = element('button', current ? 'page-btn is-current' : 'page-btn', label);
    button.type = 'button';
    button.disabled = disabled;
    if (current) button.setAttribute('aria-current', 'page');
    button.addEventListener('click', () => onPageChange(destination));
    return button;
  };
  root.append(makeButton('← 上一頁', page - 1, page === 1));
  const indicator = element('span', 'page-indicator', `${page} / ${pages}`);
  root.append(indicator);
  root.append(makeButton('下一頁 →', page + 1, page === pages));
}

function infoField(label, value) {
  const box = element('div', 'info-field');
  box.append(element('span', 'info-label', label), element('strong', 'info-value', value));
  return box;
}

function renderStats(stats) {
  const section = element('section', 'detail-section');
  section.append(element('h3', 'detail-heading', '基礎能力值'));
  const rows = element('div', 'stat-list');
  stats.forEach(({ label, text, percent }) => {
    const row = element('div', 'stat-row');
    row.append(element('span', 'stat-label', label));
    row.append(element('strong', 'stat-number', text));
    const track = element('div', 'stat-track');
    const fill = element('div', 'stat-fill');
    fill.style.width = `${percent}%`;
    track.append(fill);
    row.append(track);
    rows.append(row);
  });
  section.append(rows);
  return section;
}

function evolutionNode({ id, name, children }) {
  const item = element('div', 'evolution-branch');
  const self = element('div', 'evolution-pokemon');
  if (id) self.append(pokemonImage(id, name, 'evolution-image'));
  const description = element('div', 'evolution-description');
  description.append(element('span', 'evolution-number', id ? formatDexId(id) : '—'));
  description.append(element('strong', '', name));
  self.append(description);
  item.append(self);
  if (children.length) {
    const branches = element('div', 'evolution-children');
    children.forEach((child) => {
      const branch = element('div', 'evolution-child');
      branch.append(element('span', 'evolution-arrow', '↓ 進化'));
      branch.append(evolutionNode(child));
      branches.append(branch);
    });
    item.append(branches);
  }
  return item;
}

function renderEvolution(evolution, error, onRetry) {
  const section = element('section', 'detail-section');
  section.append(element('h3', 'detail-heading', '進化路線'));
  if (!evolution) {
    section.append(element('p', 'muted-copy', error || '目前沒有可顯示的進化路線。'));
    if (error) {
      const button = retryButton('重新載入進化路線', () => {
        button.disabled = true;
        button.textContent = '正在重新載入進化路線…';
        onRetry();
      });
      section.append(button);
    }
    return section;
  }
  const tree = element('div', 'evolution-tree');
  tree.append(evolutionNode(evolution));
  section.append(tree);
  section.append(element('p', 'evolution-note', '進化路線可能包含其他世代的寶可夢；這不會改變首頁圖鑑範圍。'));
  return section;
}

export function renderDetailLoading(root) {
  root.replaceChildren();
  const wrapper = element('div', 'detail-loading');
  wrapper.append(element('div', 'spinner'));
  wrapper.append(element('p', '', '正在取得寶可夢詳細資料…'));
  root.append(wrapper);
}

export function renderDetailError(root, message, onRetry) {
  root.replaceChildren();
  const wrapper = element('div', 'detail-loading');
  wrapper.append(element('h3', '', '詳細資料暫時無法載入'));
  wrapper.append(element('p', 'muted-copy', message));
  wrapper.append(retryButton('重新載入詳細資料', onRetry));
  root.append(wrapper);
}

function retryButton(label, onRetry) {
  const button = element('button', 'primary-btn', label);
  button.type = 'button';
  button.addEventListener('click', onRetry);
  return button;
}

export function renderDetail(root, data, onRetry) {
  root.replaceChildren();
  const { id, name, englishName, types, height, weight, abilities, stats, description, evolution, evolutionError } = data;
  const layout = element('div', 'detail-layout');
  const visual = element('div', 'detail-visual');
  visual.append(pokemonImage(id, name, 'detail-image'));
  visual.append(element('span', 'detail-number', formatDexId(id)));
  const main = element('div', 'detail-main');
  main.append(element('p', 'eyebrow', `全國圖鑑 · ${formatDexId(id)}`));
  main.append(element('h2', 'detail-name', name));
  main.append(element('p', 'detail-subtitle', englishName));
  const badges = element('div', 'badge-list detail-badges');
  types.forEach((type) => badges.append(typeBadge(type)));
  main.append(badges);
  const fields = element('div', 'info-grid');
  fields.append(infoField('身高', height));
  fields.append(infoField('體重', weight));
  fields.append(infoField('特性（英文）', abilities));
  main.append(fields);
  if (description) {
    main.append(element('p', 'detail-description', description));
  }
  main.append(renderStats(stats));
  main.append(renderEvolution(evolution, evolutionError, onRetry));
  layout.append(visual, main);
  root.append(layout);
}
