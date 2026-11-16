# PokéWiki — 寶可夢互動圖鑑

[開啟 PokéWiki](https://kai2777.github.io/pokewiki/)

探索關都地區的 151 隻寶可夢。用繁體中文、英文或全國圖鑑編號搜尋，再依 18 種屬性篩選。點開卡片即可查看身高、體重、特性、六項能力值與分支進化。

## 本機預覽

下載並解壓縮後，在含有 `index.html` 的資料夾執行：

```powershell
python -m http.server 8002 --bind 127.0.0.1
```

保持終端機運行，在瀏覽器開啟 [本機預覽](http://127.0.0.1:8002/)。下載版需要透過 HTTP 開啟，並連網取得圖鑑資料與圖片。

## 資料與圖片

資料來自 [PokéAPI](https://pokeapi.co/)，圖片由 [PokéAPI sprites](https://github.com/PokeAPI/sprites) 提供。PokéWiki 是非官方、非商業教育作品。寶可夢名稱、角色與圖像權利屬其各自權利人。
