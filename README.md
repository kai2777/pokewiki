# PokéWiki — 寶可夢互動圖鑑

這是一個以 **HTML、CSS、JavaScript ES Modules** 與 [PokéAPI](https://pokeapi.co/) 製作的非官方、非商業課堂專案。

## 功能

- 第一世代全國圖鑑 #001–#151，依編號呈現。
- 繁體中文、英文、編號搜尋，支援 18 種屬性篩選與分頁。
- 點擊卡片取得詳細資料：身高、體重、特性、六項基礎能力值及進化鏈（包含分支進化）。
- 響應式版面、鍵盤操作、載入中與錯誤／重試提示。
- 先讀取清單和屬性對照；點擊卡片時才載入個別詳細資訊。
- 詳情資料由 API 模組統一整理，包含身高與體重的單位換算、屬性、能力值及進化樹。介面採臺灣繁體中文，卡片與詳情保留寶可夢英文名稱。

## 如何在本機執行

請先將整個專案資料夾解壓縮，在資料夾內啟動本機 HTTP 伺服器：

```bash
python -m http.server 8000
```

接著在瀏覽器開啟 `http://localhost:8000/`。亦可使用 VS Code 的 Live Server。

> 不建議直接雙擊 `index.html` 用 `file://` 開啟，因為瀏覽器的 JavaScript ES Modules 載入規則可能造成錯誤。
> 需要網路連線，PokéAPI 與遠端圖片才能正常使用。屬性資料有 18 個 API 請求，首次載入可能稍慢。

## GitHub Pages 部署

1. 在 GitHub 建立 **Public** Repository，例如 `pokewiki`。
2. 上傳此資料夾**內**所有檔案，確保 `index.html` 與 `AGENTS.md` 在 Repository 根目錄。
3. 至 `Settings → Pages`，選 `Deploy from a branch`，再選 `main` 和 `/(root)`，儲存。
4. 部署成功後網址通常是 `https://<GitHub使用者名稱>.github.io/pokewiki/`。

## 資料來源與限制

- 圖鑑名稱、型別、身高、體重、能力值及進化鏈均與 PokéAPI 資料整合；第一世代繁體中文名稱有備援清單。
- 英文特性名稱是 API 的英文識別字；遇到沒有中文資料時，以英文顯示。
- 如果屬性來源局部失敗，網站會顯示警告及重試選項；屬性篩選可能暫時不完整。
- 詳情主資料載入失敗時，可在視窗內重試。物種或進化鏈請求失敗時，仍會顯示已取得的基本資料，並提供「重新載入進化路線」。
- API 為線上服務，離線時不能期待所有資料可以正常顯示。
- 進化鏈可能包含第二世代或更後面的寶可夢，但**首頁**初始只顯示 #001–#151。

## AI 協作開發規範

請先閱讀根目錄的 **[AGENTS.md](./AGENTS.md)** 再新增或修改功能。規範明確定義檔案責任、資料標準、視覺風格、無障礙要求、AI 修改流程與擴充世代的步驟。

示範指令：

> 請先閱讀 AGENTS.md，依照現有規則將圖鑑擴充至第二世代 #001–#251。重用原本卡片、搜尋、篩選、能力值與進化鏈，不要重新建立新網站。更新 README，並說明測試結果。

請參考 [擴充驗證流程](./docs/extension-demo.md)。

本次修正已通過 JavaScript 語法檢查，以及使用模擬 API 回應與模擬 DOM 的回歸測試。真實 PokéAPI、遠端圖片、手機版及 GitHub Pages 部署仍待瀏覽器驗收。

## 非官方聲明

PokéWiki 是非官方、非商業教育作品，非 Nintendo、Game Freak、Creatures 或 The Pokémon Company 所提供或背書。寶可夢名稱、角色與圖像的權利屬其各自權利人。圖片連結引用 [PokeAPI/sprites](https://github.com/PokeAPI/sprites) 公開託管的素材；資料介接使用 [PokéAPI](https://pokeapi.co/)。
