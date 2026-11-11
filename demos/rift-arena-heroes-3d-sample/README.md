# 裂空擂台 · 立體公仔樣本

本地驗收用的瀏覽器樣本。破鋒、弦鳴、定潮各有 P1／P2，共六個可在競技場走動的立體公仔。不是正式對戰，不改第一關或第 2–20 關規則，也不會部署到 GitHub Pages。

## 怎麼在本機看

```bash
cd demos/rift-arena-heroes-3d-sample
python3 -m http.server 5174
```

打開 `http://127.0.0.1:5174/`。請用本機伺服器，不要直接用 `file://`。

- WASD 或方向鍵移動
- 拖曳滑鼠旋轉鏡頭，滾輪拉近拉遠
- 1／2／3 切換破鋒、弦鳴、定潮
- F 或按鈕切換 P1／P2
- R 回到場地中央

鏡頭是第三人稱，公仔有自己的朝向，不會永遠正面對着相機。

## 公仔怎麼來的

只用免費、本機工具：

- [TripoSR](https://github.com/VAST-AI-Research/TripoSR)（MIT，Stability AI / VAST 的研究模型）在 CPU 上從鎖定的全身切割圖重建網格。這不是 Tripo、Meshy、CSM 的付費 API，也沒有花任何費用。
- Blender 只做軸向、輕微平滑、把腳底放到地面，再輸出 glTF。
- 場景用 Three.js 幾何體搭出來（青／洋紅兩端、水晶、稀疏掩體、中央符文），沒有把 mm-arena-v2 概念圖貼成一張地面。

參考圖只讀、不改像素，也沒有當成場景裡的 2D 廣告牌。每個 GLB 都是有體積的網格：正面能認出服裝、髮型與武器，背面是同一套單張重建的另一面，輪廓跟正面不同，腳踩在場上。

重跑（需要已安裝的 Blender 與本機 TripoSR，權重不會放進這個倉庫）：

```bash
REF_DIR=/path/to/readonly-sprites python3 tools/reconstruct_local.py assets/models
```

`REF_DIR` 裡要有六張未改過的透明全身圖：`pofeng-full-p1.png`、`pofeng-full-p2.png`、`xianming-full-p1.png`、`xianming-full-p2.png`、`dingchao-full-p1.png`、`dingchao-full-p2.png`。
