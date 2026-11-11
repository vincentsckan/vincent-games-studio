# 裂空擂台 · 立體公仔樣本

本地驗收用的瀏覽器樣本。破鋒、弦鳴、定潮各有 P1／P2，共六個可在競技場走動的立體公仔。不是正式對戰，不改第一關或第 2–20 關規則，也不會部署到 GitHub Pages。

## 怎麼在本機看

```bash
cd demos/rift-arena-heroes-3d-sample
python3 -m http.server 5174
```

打開 `http://127.0.0.1:5174/`。請用本機伺服器，不要直接用 `file://`。

- WASD 或方向鍵移動，公仔面向前進方向
- 拖曳滑鼠旋轉鏡頭，滾輪拉近拉遠
- 1／2／3 切換破鋒、弦鳴、定潮
- F 或按鈕切換 P1／P2
- R 回到場地中央

鏡頭是第三人稱。預設看到的是胸腹與臉，不是背面。

## 這一版裡有什麼

六個 `assets/models/*.glb` 是已縮到網頁尺寸的 PBR 公仔，帶 baseColor、法線與 ORM。樣本只負責擺放、把臉轉到正面、以及讓它們在場上走。不要再用舊的單色黏土網格蓋掉這些檔。

場地按已鎖定的 mm-arena-v2 圖重做。地面用 `assets/arena/arena-topdown-v2.png` 的原像素，外圈氣氛用 `arena-mood-v2.png`。圖檔像素沒有改。水晶、柱與矮掩體是貼著圖上位置加的立體件，方便走動與碰撞。

`tools/reconstruct_local.py` 是早期本機重建草稿，不能覆寫現在的六個 GLB。
