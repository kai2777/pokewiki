// 所有圖鑑範圍及翻譯統一放在這裡；擴充世代時不需要複製 UI。
export const API_BASE = 'https://pokeapi.co/api/v2';
export const POKEDEX_START = 1;
export const POKEDEX_END = 151;
export const PAGE_SIZE = 24;
export const IMAGE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
export const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export const TYPE_INFO = {
  normal: { label: '一般', color: '#9298a1' },
  fire: { label: '火', color: '#ee7d43' },
  water: { label: '水', color: '#5596d1' },
  electric: { label: '電', color: '#e3b93d' },
  grass: { label: '草', color: '#65ae63' },
  ice: { label: '冰', color: '#74bfc9' },
  fighting: { label: '格鬥', color: '#cb6c56' },
  poison: { label: '毒', color: '#a176b5' },
  ground: { label: '地面', color: '#d6a35b' },
  flying: { label: '飛行', color: '#8aa9d9' },
  psychic: { label: '超能力', color: '#e47b9e' },
  bug: { label: '蟲', color: '#8aa84c' },
  rock: { label: '岩石', color: '#b5a673' },
  ghost: { label: '幽靈', color: '#786aab' },
  dragon: { label: '龍', color: '#656ac1' },
  dark: { label: '惡', color: '#7e6e6c' },
  steel: { label: '鋼', color: '#81999d' },
  fairy: { label: '妖精', color: '#d99abf' }
};

export const STAT_INFO = [
  ['hp', 'HP'],
  ['attack', '攻擊'],
  ['defense', '防禦'],
  ['special-attack', '特攻'],
  ['special-defense', '特防'],
  ['speed', '速度']
];

// 第一世代繁體中文名稱備援；詳情頁如果 PokéAPI 有 zh-Hant，優先使用 API 名稱。
// 新增世代時只需繼續擴充此清單，不需修改搜尋與渲染程式。
const GEN_ONE_NAMES = [
  '妙蛙種子','妙蛙草','妙蛙花','小火龍','火恐龍','噴火龍','傑尼龜','卡咪龜','水箭龜','綠毛蟲',
  '鐵甲蛹','巴大蝶','獨角蟲','鐵殼蛹','大針蜂','波波','比比鳥','大比鳥','小拉達','拉達',
  '烈雀','大嘴雀','阿柏蛇','阿柏怪','皮卡丘','雷丘','穿山鼠','穿山王','尼多蘭','尼多娜',
  '尼多后','尼多朗','尼多力諾','尼多王','皮皮','皮可西','六尾','九尾','胖丁','胖可丁',
  '超音蝠','大嘴蝠','走路草','臭臭花','霸王花','派拉斯','派拉斯特','毛球','摩魯蛾','地鼠',
  '三地鼠','喵喵','貓老大','可達鴨','哥達鴨','猴怪','火爆猴','卡蒂狗','風速狗','蚊香蝌蚪',
  '蚊香君','蚊香泳士','凱西','勇基拉','胡地','腕力','豪力','怪力','喇叭芽','口呆花',
  '大食花','瑪瑙水母','毒刺水母','小拳石','隆隆石','隆隆岩','小火馬','烈焰馬','呆呆獸','呆殼獸',
  '小磁怪','三合一磁怪','大蔥鴨','嘟嘟','嘟嘟利','小海獅','白海獅','臭泥','臭臭泥','大舌貝',
  '刺甲貝','鬼斯','鬼斯通','耿鬼','大岩蛇','催眠貘','引夢貘人','大鉗蟹','巨鉗蟹','霹靂電球',
  '頑皮雷彈','蛋蛋','椰蛋樹','卡拉卡拉','嘎啦嘎啦','飛腿郎','快拳郎','大舌頭','瓦斯彈','雙彈瓦斯',
  '獨角犀牛','鑽角犀獸','吉利蛋','蔓藤怪','袋獸','墨海馬','海刺龍','角金魚','金魚王','海星星',
  '寶石海星','魔牆人偶','飛天螳螂','迷唇姐','電擊獸','鴨嘴火獸','凱羅斯','肯泰羅','鯉魚王','暴鯉龍',
  '拉普拉斯','百變怪','伊布','水伊布','雷伊布','火伊布','多邊獸','菊石獸','多刺菊石獸','化石盔',
  '鐮刀盔','化石翼龍','卡比獸','急凍鳥','閃電鳥','火焰鳥','迷你龍','哈克龍','快龍','超夢','夢幻'
];
export const LOCAL_NAMES = Object.fromEntries(GEN_ONE_NAMES.map((name, index) => [index + 1, name]));

export function generationLabel() {
  if (POKEDEX_END <= 151) return '第一世代 · 關都';
  if (POKEDEX_END <= 251) return '第一至第二世代 · 關都與城都';
  return `全國圖鑑 · ${formatDexId(POKEDEX_START)}–${formatDexId(POKEDEX_END)}`;
}

export function formatDexId(id) {
  return `#${String(id).padStart(3, '0')}`;
}

export function artworkUrl(id) {
  return `${IMAGE_BASE}/${id}.png`;
}

export function spriteUrl(id) {
  return `${SPRITE_BASE}/${id}.png`;
}

export function localizedName(id, englishName, speciesData = null) {
  const apiName = speciesData?.names?.find((entry) => entry.language?.name === 'zh-Hant')?.name;
  return apiName || LOCAL_NAMES[id] || englishName || `Pokémon ${id}`;
}

export function speciesIdFromUrl(url) {
  const match = String(url).match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}
