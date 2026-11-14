# SCMOS｜營運與供應鏈期末複習

依課綱章節累積的繁體中文複習網站，優先考慮 iPad 橫向、直向與分割畫面。

目前包含第一週 Ch1 的 8 組框架與 12 題練習，以及第二週 Ch2 的 11 組框架與 15 題練習。
第二週將預習、老師講解與未完學生報告分開標記，保留來源差異與待補事項。

## 使用與部署

無第三方套件或建置依賴；入口為 `docs/index.html`，資料放在 `docs/data/`。

```sh
python3 -m http.server 8000 --directory docs
```

開啟 `http://localhost:8000`。請透過 HTTP 使用，直接用 `file://` 開 HTML 會無法載入 JSON。
GitHub Pages 維持使用 `main` 分支的 `/docs` 目錄發布。

## 功能

- 依課綱切章節，未提供的章節顯示待補，總覽保留 16 週。
- 觀念框架、考前速讀、互動練習、核對紀錄。
- 選擇題與數值題自動核對，提示與逐步解答按需展開；申論題以要點自評。
- 作答與草稿以題目 ID 和版本儲存在瀏覽器 localStorage，切章節或重新整理可保留。
- 尚未接 Supabase，無登入或跨裝置同步；清除網站資料會清除紀錄。
- 瀏覽器封鎖儲存時退回本頁暫存，介面會提示。

## 每週更新

原始 RTF、PDF、擷取文字、個人路徑及 Skill 保留於本機，不在公開倉庫中。
公開整理內容可由任何人讀取；來源代碼供持有教材者對照，不提供原始檔下載。

在教材工作區新增 `output/weekNN/content.json` 後執行：

```sh
python3 scripts/prepare_pages.py
node --test tests/study-core.test.js
```

匯出工具驗證來源定位、題型及穩定 ID，再產生公開資料與清單。
需要本機的 `materials/` 和 `output/`，不必先產生每週 HTML。
僅複製公開倉庫仍能直接修改 `docs/data/`、執行與部署網站。
新增資料可使用 `docs/data/week02.json` 的格式，題目修改答案或大幅改寫時提高 `version`，避免舊作答被套到新題。

上傳更新：

```sh
git add docs scripts tests package.json README.md
git commit -m "Add week 2 strategy materials and chapter navigation"
git push
```

## 驗證範圍

測試涵蓋數值判分、錯誤輸入、題目版本隔離、作答序列化與計分。
瀏覽器另檢查章節切換、數值題提交及重新整理後的保存。
iPad 比例以瀏覽器視窗模擬，並非實機 Safari 驗證。
自編練習不代表老師指定考題或完整教科書範圍。
