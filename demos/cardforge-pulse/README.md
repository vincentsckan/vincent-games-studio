# 牌鍛脈搏 · Cardforge Pulse

瀏覽器短局 Roguelite 組牌垂直切片（脈搏鍛造所主題）。

## 開發

```bash
cd demos/cardforge-pulse
npm install
npm run dev
npm test
npm run build   # 輸出到 ../../public/demos/cardforge-pulse/
```

## 點樣玩

1. 主畫面按 **開新鍛局**
2. 在地圖揀當前節點 **進入**
3. 戰鬥：點牌消耗 **節拍**，再按 **結束回合**
4. 打赢 **揀一張帶走上路**；司爐休息可 **穩一穩脈**
5. 通關主脈爐心或 **斷拍** 後按 **再開一局**

## 資源

- 文案：`src/copy/zh-HK.ts`（v1 文案包）
- 美術：`assets/mm-slice-v1/`（frames / icons / enemies / palette）

## Smoke（GitHub Pages）

1. 建置後開啟  
   `https://vincentsckan.github.io/vincent-games-studio/demos/cardforge-pulse/?v=<short-sha>`
2. Console 無錯誤；卡框與敵人 PNG 有載入
3. 完成至少一場戰鬥並选牌
4. 斷拍或通關後 **再開一局** 可重置

詳見 `SMOKE.md`。
