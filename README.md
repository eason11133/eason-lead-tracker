# Eason Lead Tracker

**Eason Systems 市場驗證期間自製的 Lead / CRM 追蹤工具**

這個工具是我在 2026 年進行軟體接案與市場驗證時，為了管理大量潛在客戶、聯絡進度、需求判斷與後續追蹤而做的內部系統。

當時我不是只用試算表記名單，而是把「找名單 → 判斷需求 → 寄信 → 追蹤 → 回覆 → 洽談 → 報價 / 暫放」整理成一套可以持續維護的流程。

在這段市場測試中，我共整理 **671 筆潛在客戶名單**，其中 **670 筆完成寄送、595 筆持續追蹤，累積 125 筆回覆**。最後沒有形成正式成交，但這套系統讓我第一次用實際資料管理冷開發流程，也更清楚看到需求、回覆、預算與合作條件之間的落差。

> 這是一個歷史專案，主要保留 Eason Systems 從「會做系統」走向「開始驗證市場是否真的需要」的過程。

## 為什麼自己做

一開始用一般表格整理名單時，很快就遇到幾個問題：

- 同一個單位可能被重複加入。
- 寄信、第一次追蹤、後續回覆散在不同地方。
- 很難快速看出哪些名單真的有痛點，哪些只是表面上看起來相關。
- 報價、需求、下一步與預計聯絡日容易遺漏。
- 名單一多，就很難知道今天真正該追哪些人。

因此我把它做成一個專門給自己使用的 Lead Tracker，讓每一筆潛在客戶都有明確狀態與下一步。

## 主要功能

### Lead 狀態追蹤

每筆名單可以記錄：

- 單位名稱與類型
- Email / 聯絡來源
- 目前狀態
- 預計聯絡日
- 實際寄送與追蹤日期
- 是否回覆
- 需求與備註
- 下一步行動

系統把流程拆成從「未聯絡、已寄信、已追蹤、對方回覆」到「需求確認、報價、洽談、未成交 / 暫放」等不同階段。

### 商機與需求判斷

除了聯絡狀態，我後來也加入：

- Lead quality
- Pain point type
- Why pay
- Product / solution fit
- Next commitment
- Opportunity level

目的不是讓系統自動判斷「這個客戶一定會成交」，而是逼自己把判斷依據寫清楚，避免因為對方有回信就把它當成真正需求。

### Follow-up 排程

系統會根據寄信與追蹤日期整理下一步，協助我管理：

- 第一次追蹤
- 內部討論等待時間
- 後續聯絡
- 暫放與重新評估

### 重複名單檢查

透過名稱、Email 與 domain 等資訊，協助找出可能重複的潛在客戶，減少重複寄送與資料分散。

### Outreach 輔助

工具內也整理不同需求情境下的聯絡模板，並依照 Lead 的產品方向、痛點與來源產生可再人工修改的 Email 草稿。

這些內容是寄信輔助，不代表系統自動寄信或自動決定合作對象。

## 我從這個工具學到什麼

這個專案最重要的不是 CRM 本身，而是它讓我看到：

**做得出系統，和市場願意採用，是兩件不同的事。**

即使整理了大量名單、有實際回覆，也不代表需求強度、預算、時程或合作條件真的成立。

這次市場驗證後，Eason Systems 的方向逐步從廣泛客製接案，轉向自主產品開發。

相關歷史：

- [Eason Systems](https://github.com/eason11133/eason-systems)
- [Eason Systems Legacy](https://github.com/eason11133/eason-systems-legacy)
- [Toilet Bot](https://github.com/eason11133/toilet-bot)

## 技術

- React
- Vite
- Supabase
- Tailwind CSS
- Framer Motion
- Lucide React
- LocalStorage fallback / local state persistence

Supabase 相關設定透過環境變數注入；repository 不應包含真實 service secrets 或私人 Lead 資料。

## 本機執行

```bash
npm install
npm run dev
```

正式 build：

```bash
npm run build
```

## Public repository 說明

這個 repository 公開的是系統程式碼，不包含實際潛在客戶名單、私人聯絡紀錄、Supabase credentials 或其他不適合公開的市場資料。
