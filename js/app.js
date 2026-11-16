import { POKEDEX_START, POKEDEX_END, PAGE_SIZE, TYPE_INFO, formatDexId, generationLabel } from './config.js';
import { fetchCatalog, fetchPokemonDetail } from './api.js';
import { renderSkeleton, renderCards, renderPager, renderDetailLoading, renderDetailError, renderDetail } from './ui.js';

const grid = document.querySelector('#pokemon-grid');
const searchInput = document.querySelector('#search');
const typeSelect = document.querySelector('#type-filter');
const status = document.querySelector('#status');
const pager = document.querySelector('#pagination');
const retryButton = document.querySelector('#retry');
const dialog = document.querySelector('#detail-dialog');
const detailContent = document.querySelector('#detail-content');
const closeDetail = document.querySelector('#close-detail');
const rangeLabel = document.querySelector('#range-label');

const state = {
  catalog: [],
  query: '',
  type: 'all',
  page: 1,
  failedTypes: [],
  lastFocusedElement: null,
  detailSequence: 0
};

function initLabels() {
  const total = POKEDEX_END - POKEDEX_START + 1;
  rangeLabel.textContent = `${formatDexId(POKEDEX_START)} — ${formatDexId(POKEDEX_END)} · 共 ${total} 隻`;
  document.querySelector('#generation-label').textContent = generationLabel();
  Object.entries(TYPE_INFO).forEach(([key, info]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${info.label}屬性`;
    typeSelect.append(option);
  });
}

function matchesPokemon(item) {
  const raw = state.query.trim().normalize('NFKC').toLowerCase();
  const normalized = raw.replace(/^#/, '');
  const nameMatch = !raw || item.name.includes(state.query.trim()) || item.englishName.toLowerCase().includes(raw);
  const idMatch = !!normalized && /^\d+$/.test(normalized) && (String(item.id) === String(Number(normalized)) || String(item.id).padStart(3, '0').includes(normalized));
  const typeMatch = state.type === 'all' || item.types.includes(state.type);
  return (nameMatch || idMatch) && typeMatch;
}

function updateView() {
  if (!state.catalog.length) return;
  const filtered = state.catalog.filter(matchesPokemon);
  const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  state.page = Math.min(state.page, maxPage);
  const start = (state.page - 1) * PAGE_SIZE;
  renderCards(grid, filtered.slice(start, start + PAGE_SIZE), openDetail);
  renderPager(pager, filtered.length, state.page, PAGE_SIZE, (page) => {
    state.page = page;
    updateView();
    document.querySelector('#catalog-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const first = filtered.length ? start + 1 : 0;
  const last = Math.min(filtered.length, start + PAGE_SIZE);
  status.textContent = `顯示 ${first}–${last} 隻／符合條件共 ${filtered.length} 隻`;
  if (state.failedTypes.length) {
    status.textContent += ` · 有 ${state.failedTypes.length} 種屬性資料暫時無法載入，部分篩選可能不完整。`;
  }
}

async function loadCatalog() {
  retryButton.hidden = true;
  status.textContent = '正在從 PokéAPI 載入圖鑑與屬性資料…';
  renderSkeleton(grid);
  pager.replaceChildren();
  try {
    const result = await fetchCatalog();
    state.catalog = result.pokemon;
    state.failedTypes = result.failedTypes;
    retryButton.hidden = !state.failedTypes.length;
    retryButton.textContent = '重新取得屬性資料';
    updateView();
  } catch (error) {
    status.textContent = '資料載入失敗，請檢查網路連線後重試。';
    grid.replaceChildren();
    retryButton.hidden = false;
    retryButton.textContent = '重新載入圖鑑';
    console.error('圖鑑載入失敗：', error);
  }
}

async function showDetail(id, sequence, keepDetail = false) {
  const retry = (keepDetail) => showDetail(id, ++state.detailSequence, keepDetail);
  if (!keepDetail) renderDetailLoading(detailContent);
  try {
    const data = await fetchPokemonDetail(id);
    if (sequence !== state.detailSequence) return;
    renderDetail(detailContent, data, () => retry(true));
  } catch (error) {
    if (sequence !== state.detailSequence) return;
    renderDetailError(detailContent, '無法從 PokéAPI 載入這隻寶可夢的詳細資料，請稍後再試。', () => retry(false));
    console.error('詳細資料載入失敗：', error);
  }
}

function openDetail(id) {
  state.lastFocusedElement = document.activeElement;
  const sequence = ++state.detailSequence;
  if (!dialog.open) dialog.showModal();
  showDetail(id, sequence);
}

searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  state.page = 1;
  updateView();
});

typeSelect.addEventListener('change', () => {
  state.type = typeSelect.value;
  state.page = 1;
  updateView();
});

retryButton.addEventListener('click', loadCatalog);
closeDetail.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener('close', () => {
  ++state.detailSequence;
  state.lastFocusedElement?.focus?.();
});

initLabels();
loadCatalog();
