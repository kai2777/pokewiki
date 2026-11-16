import {
  API_BASE, POKEDEX_START, POKEDEX_END, TYPE_INFO, STAT_INFO,
  localizedName, speciesIdFromUrl
} from './config.js';

const requestCache = new Map();
const REQUEST_TIMEOUT_MS = 18000;

export async function getJson(url) {
  if (requestCache.has(url)) return requestCache.get(url);
  const promise = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (error?.name === 'AbortError') throw new Error('連線逾時，請稍後再試。');
      throw error;
    } finally {
      clearTimeout(timer);
    }
  })();
  requestCache.set(url, promise);
  promise.catch(() => requestCache.delete(url));
  return promise;
}

async function mapWithConcurrency(items, maxConcurrent, worker) {
  let nextIndex = 0;
  const results = new Array(items.length);
  const runWorker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      try {
        results[index] = { status: 'fulfilled', value: await worker(items[index]) };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(maxConcurrent, items.length) }, runWorker));
  return results;
}

/** 從 PokéAPI 取得指定圖鑑範圍。屬性只需各請求一次，不需 151 次詳情請求。 */
export async function fetchCatalog() {
  const count = POKEDEX_END - POKEDEX_START + 1;
  const list = await getJson(`${API_BASE}/pokemon?limit=${count}&offset=${POKEDEX_START - 1}`);
  const pokemon = (list.results || [])
    .map((entry) => ({
      id: speciesIdFromUrl(entry.url),
      englishName: entry.name,
      types: []
    }))
    .filter((entry) => Number.isInteger(entry.id) && entry.id >= POKEDEX_START && entry.id <= POKEDEX_END)
    .sort((a, b) => a.id - b.id);

  if (!pokemon.length) throw new Error('PokéAPI 沒有回傳可用的寶可夢清單。');

  const byId = new Map(pokemon.map((entry) => [entry.id, entry]));
  const types = Object.keys(TYPE_INFO);
  const results = await mapWithConcurrency(types, 6, async (type) => {
    const detail = await getJson(`${API_BASE}/type/${type}`);
    return { type, names: detail.pokemon || [] };
  });

  const failedTypes = [];
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      failedTypes.push(types[index]);
      return;
    }
    result.value.names.forEach((member) => {
      const id = speciesIdFromUrl(member.pokemon?.url);
      if (byId.has(id) && !byId.get(id).types.includes(result.value.type)) {
        byId.get(id).types.push(result.value.type);
      }
    });
  });

  pokemon.forEach((entry) => {
    entry.types.sort((a, b) => types.indexOf(a) - types.indexOf(b));
    entry.name = localizedName(entry.id, entry.englishName);
  });

  return { pokemon, failedTypes };
}

function normalizeEvolution(chain) {
  const id = speciesIdFromUrl(chain.species?.url);
  return {
    id,
    name: localizedName(id, chain.species?.name),
    children: (chain.evolves_to || []).map(normalizeEvolution)
  };
}

/** 詳情只在點擊卡片時載入，避免首頁一次請求大量細節。 */
export async function fetchPokemonDetail(id) {
  const [pokemonResult, speciesResult] = await Promise.allSettled([
    getJson(`${API_BASE}/pokemon/${id}`),
    getJson(`${API_BASE}/pokemon-species/${id}`)
  ]);
  if (pokemonResult.status === 'rejected') throw pokemonResult.reason;

  const pokemon = pokemonResult.value;
  const species = speciesResult.status === 'fulfilled' ? speciesResult.value : null;
  let evolution = null;
  let evolutionError = speciesResult.status === 'rejected'
    ? '無法載入物種資料，因此暫時無法顯示進化路線。'
    : '';
  if (species?.evolution_chain?.url) {
    try {
      const data = await getJson(species.evolution_chain.url);
      if (data?.chain) evolution = normalizeEvolution(data.chain);
    } catch {
      evolutionError = '進化路線載入失敗，請稍後再試。';
    }
  }
  const stats = new Map((pokemon.stats || []).map((stat) => [stat.stat.name, stat.base_stat]));
  const description = species?.flavor_text_entries?.find((item) => item.language?.name === 'zh-Hant');
  return {
    id: pokemon.id,
    englishName: pokemon.name,
    name: localizedName(id, pokemon.name, species),
    types: (pokemon.types || []).map((item) => item.type.name),
    height: Number.isFinite(pokemon.height) ? `${(pokemon.height / 10).toFixed(1)} m` : '—',
    weight: Number.isFinite(pokemon.weight) ? `${(pokemon.weight / 10).toFixed(1)} kg` : '—',
    abilities: (pokemon.abilities || []).map((item) => item.ability.name.replaceAll('-', ' ')).join('、') || '—',
    stats: STAT_INFO.map(([key, label]) => {
      const value = stats.get(key);
      return {
        label,
        text: Number.isFinite(value) ? String(value) : '—',
        percent: Number.isFinite(value) ? Math.max(0, Math.min(100, value / 255 * 100)) : 0
      };
    }),
    description: description?.flavor_text?.replace(/[\n\f\r]/g, ' '),
    evolution,
    evolutionError
  };
}
