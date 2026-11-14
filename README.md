# SCMOS｜營運與供應鏈期末複習

依課綱章節逐週累積的繁體中文複習網站，優先考慮 iPad 閱讀。

目前包含第一週 Ch1 的 8 組觀念框架、考前速讀與 12 題自編練習。
選擇題可核對答案與查看解析；申論題使用評分要點自評。

## 執行與部署

網站是無建置依賴的靜態 HTML、CSS 與 JavaScript，入口為 `docs/index.html`。

```sh
python3 -m http.server 8000 --directory docs
```

開啟 `http://localhost:8000`。
GitHub Pages 使用 `main` 分支的 `/docs` 目錄發布。
更新並推送該目錄後，Pages 會重新部署。

## 教材更新

原始 RTF、PDF、擷取文字、個人路徑及 Skill 保留於本機，不在公開倉庫中。
公開的整理內容仍可由任何人讀取。來源代碼僅供持有原始教材者對照，網站不提供原始檔下載。

在原教材工作區整理完成後執行：

```sh
python3 scripts/prepare_pages.py
```

此匯出工具需要未納入版本控制的 `output/week01/practice.html`；
僅複製本倉庫也可直接執行、修改或部署 `docs/index.html`，不需要教材原檔。

## 目前限制

- 尚未連接 Supabase，無登入或跨裝置同步。
- 作答僅存在目前頁面，重新整理即清除。
- 自編練習不代表老師指定考題或完整教科書範圍。
- 尚未完成 iPad 實機驗證。
