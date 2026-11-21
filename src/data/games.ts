export type GameDimension = '2D' | '3D'
export type GameStatus = 'demo' | 'early-access' | 'released' | 'coming-soon'

export interface GameLinks {
  play?: string
  download?: string
  steam?: string
  itch?: string
}

/** A separately playable title under one catalog entry. `links.play` stays the hub. */
export interface GamePlayTitle {
  titleZh: string
  titleEn: string
  href: string
}

/** Supplied still for the detail gallery. */
export interface GameStill {
  src: string
  labelZh: string
}

export interface GameFeature {
  titleZh: string
  titleEn: string
  bodyZh: string
  bodyEn: string
}

export interface Game {
  id: string
  slug: string
  titleZh: string
  titleEn: string
  taglineZh: string
  taglineEn: string
  dimension: GameDimension
  status: GameStatus
  year: number
  genres: string[]
  hookZh: string
  hookEn: string
  gameplayZh: string
  gameplayEn: string
  features: GameFeature[]
  /** Key art under public/covers — optional; falls back to palette art */
  coverImage?: string
  /** CSS gradient / SVG palette for placeholder art */
  palette: {
    from: string
    via: string
    to: string
    accent: string
    pattern: 'harbor' | 'fault' | 'crane' | 'void'
  }
  links: GameLinks
  /** Extra titles that stay inside this entry and open their own demo HTML. */
  playTitles?: GamePlayTitle[]
  /** Real stills. When present, the detail gallery uses these instead of placeholders. */
  stills?: GameStill[]
}

export const studio = {
  nameZh: 'Vincent Games Studio',
  nameEn: 'Vincent Games Studio',
  studioZh: 'Vincent Games Studio',
  studioEn: 'Vincent Games Studio',
  taglineZh: '歡迎嚟玩。氣氛、手感、再玩一次——香港獨立遊戲工作室。',
  taglineEn: 'Crafting memorable indie experiences through light, shadow, and story.',
  aboutZh: `Vincent Games Studio 係香港獨立遊戲工作室，專心打磨氣氛同手感。作品有 2D 亦有 3D，靈感好多時嚟自城市街景、港口霧氣，同埋差啲講出口嘅感覺。

我哋只想一件事：等你願意停低，再撳一次「再玩一次」。`,
  aboutEn: `Vincent Games Studio is focused on atmospheric storytelling and tactile feel. The work spans 2D and 3D, often inspired by Hong Kong's urban grain, harbour fog, and emotions that almost get said out loud.

The studio's aim is simple: make players stop—and hit "play again."`,
  email: 'press@vincentgames.studio',
  location: 'Hong Kong · 香港',
}

export const games: Game[] = [
  {
    id: 'neon-ark-1994',
    slug: 'neon-ark-1994',
    titleZh: '霓虹方舟：1994',
    titleEn: 'NEON ARK: 1994',
    taglineZh: '1994年東海人工島，微笑海豚與時間珊瑚的深海煉獄。',
    taglineEn: 'A 1994 retro-futuristic marine dome overrun by temporal coral horrors.',
    dimension: '3D',
    status: 'demo',
    year: 2026,
    genres: ['生存恐怖', '箱庭解謎', '3D'],
    hookZh:
      '1994年，科技大亨維克多·斯旺打造的80年代海洋博覽館「太陽神穹頂」荒廢兩年後，自稱海事保險調查員的少女林薇拉獨自登島。在微笑的海豚吉祥物與合成波霓虹燈下，徘徊著來自西元2142年「淹沒世紀」的時空難民異變體——而薇拉左臂繃帶下的藍紫結晶，也藏著她「09號接觸者」的真實身分。',
    hookEn:
      'In 1994, investigator Vera Lin enters the abandoned Solaris Dome marine expo. Beneath 1980s neon mascots lurk mutated 2142 time-refugees—and the secret cure for the temporal coral crystallizing in Vera’s own arm.',
    gameplayZh:
      '致敬《Crow Country》之 32-Bit 微縮箱庭 3D 生存恐怖：WASD 移動（支援現代 360° 與經典坦克操作切換）、Q/C 旋轉等距視角、按住右鍵或空白鍵停步雷射瞄準（蓄力爆頭雙倍傷害）。內建顏色編碼智慧地圖、星象神諭機提示、密碼與管風琴解謎、四種武器與 S-Rank 通關評級。同時提供瀏覽器 WebGL 即玩版與 PC 原生 OpenGL 版下載。',
    gameplayEn:
      '32-bit isometric 3D survival horror inspired by Crow Country: rotatable diorama camera, stop-and-aim 3D laser sight, color-coded smart completion map, ASTRO-ORACLE hints, 6 puzzles, 4 weapons, and S-Rank grading.',
    features: [
      {
        titleZh: '可旋轉 3D 箱庭與雷射瞄準',
        titleEn: 'Rotatable 3D Diorama & Laser Sight',
        bodyZh: '360° 自由旋轉微縮場景檢查死角；停步舉槍投射實體 3D 雷射線，收束準星擊發雙倍爆頭暴擊或引爆瓦斯桶。',
        bodyEn: 'Pivot the isometric camera to inspect blind spots; plant your feet to project a 3D laser sight for focused critical shots.',
      },
      {
        titleZh: '顏色編碼智慧地圖與占卜機',
        titleEn: 'Smart Completion Map & Astro-Oracle',
        bodyZh: '十個互通展區即時標示「已清空（亮青綠）」或「尚餘謎題物資（琥珀橘）」，搭配限用 10 次的星象神諭機提示。',
        bodyEn: 'Color-coded rooms turn emerald when fully looted, paired with 10-token Astro-Oracle hint booths.',
      },
      {
        titleZh: '雙重時空反轉與 S-Rank 評價',
        titleEn: 'Dual Twists & S-Rank Grading',
        bodyZh: '收集 12 份機密文獻與 8 個隱藏秘密，揭開 2142 難民與主角真實身分，挑戰終局 S+ 級評價。',
        bodyEn: 'Uncover 12 lore memos and 8 secrets across two narrative twists, graded from C to S+ Rank.',
      },
    ],
    coverImage: 'covers/neon-ark-1994.jpg',
    palette: {
      from: '#080b16',
      via: '#1e293b',
      to: '#ec4899',
      accent: '#38bdf8',
      pattern: 'void',
    },
    links: {
      play: '/vincent-games-studio/demos/neon-ark-1994/',
      download: '/vincent-games-studio/demos/neon-ark-1994/neon-ark-1994-pc-opengl.zip',
    },
  },
  {
    id: 'eiswald-sanatorium',
    slug: 'eiswald-sanatorium',
    titleZh: '霧嶺療養院：白鴉之冬',
    titleEn: 'Eiswald Sanatorium: Winter of the White Crow',
    taglineZh: '1991 年阿爾卑斯雪山孤立療養院——箱庭式立體解謎生存恐怖。本機 3D 遊戲啟動中心。',
    taglineEn: '1991 Alpine sanatorium—Metroidvania-lite 3D survival horror. Native 3D launch center and complete game pack.',
    dimension: '3D',
    status: 'demo',
    year: 2026,
    genres: ['生存恐怖', '箱庭解謎', '3D'],
    hookZh:
      '1991 年冬，奧地利阿爾卑斯山脈深處的「霧嶺溫泉療養院」突遭封院，院長愛德華·克勞失蹤。特別調查員薇拉·林德奎斯特（Vera Lindqvist）獨自駕車穿過暴風雪抵達童話鎮中庭，卻發現整座渡假村已被詭異的「蒼白靈液」與機械傀儡吞噬。',
    hookEn:
      'Winter 1991. Investigator Vera Lindqvist arrives at the snowbound Eiswald Sanatorium in the Austrian Alps, only to find the fairytale resort overrun by Pale Ichor monstrosities and clockwork automata.',
    gameplayZh:
      '致敬《Crow Country》箱庭式互聯結構（童話鎮中庭、鬧鬼山丘、海洋王國、地底挖掘場四大分區）。支援 45° 自由旋轉微縮視角、3D 雷射瞄準弱點暴擊、現代直覺與經典坦克雙操作（F4 切換）、算命機三階段提示與三大難度模式。試玩開啟本機 3D 遊戲啟動中心，可下載含全部 18 個場景模型的完整 Godot 4.3 遊戲包，或以一鍵安裝程式在電腦上啟動。',
    gameplayEn:
      'Crow Country-inspired interconnected Metroidvania-lite hub across 4 themed zones. 45° rotatable diorama camera, laser-sight weakpoint crits, Modern/Tank controls, Fortune Teller hints, and 3 difficulty modes. Play opens the native launch center, where you can download the complete Godot 4.3 pack (all 18 scene models) or the one-click installer.',
    features: [
      {
        titleZh: '箱庭式四大分區與捷徑',
        titleEn: 'Interconnected 4-Zone Hub',
        bodyZh: '童話鎮中庭放射連接哥德墓園、深海展示廳與地下實驗室，解鎖單向鐵門捷徑與營火安全屋。',
        bodyEn: 'Fairytale Courtyard radiating into Gothic Crypt, Ocean Kingdom, and Underground Bio-Lab with shortcuts and safe rooms.',
      },
      {
        titleZh: '45° 旋轉視角與雷射弱點瞄準',
        titleEn: 'Rotatable Diorama & Laser Aim',
        bodyZh: 'Q/E 自由旋轉 3D 鏡頭，右鍵舉槍觸發體積雷射紅線與準星收縮（最高 +55% 弱點暴擊）。',
        bodyEn: 'Free 3D camera rotation and over-the-shoulder volumetric laser aiming with reticle focus criticals.',
      },
      {
        titleZh: '本機 3D 啟動中心',
        titleEn: 'Native 3D launch center',
        bodyZh: '試玩進入《霧嶺療養院：白鴉之冬》啟動中心，下載完整遊戲包或一鍵安裝程式後，在本機 Godot 4.3 啟動原版遊戲。',
        bodyEn: 'Play opens the Eiswald launch center. Download the complete pack or the one-click installer, then start the original game in Godot 4.3 on your PC.',
      },
    ],
    coverImage: 'covers/eiswald-sanatorium.png',
    palette: {
      from: '#0b1320',
      via: '#1b2a42',
      to: '#8ecae6',
      accent: '#e63946',
      pattern: 'void',
    },
    links: {
      play: '/vincent-games-studio/demos/eiswald-sanatorium/',
      download: '/vincent-games-studio/demos/eiswald-sanatorium/eiswald_sanatorium_full_game.tar.gz',
    },
  },
  {
    id: 'rift-arena',
    slug: 'rift-arena',
    titleZh: '裂空擂台',
    titleEn: 'Rift Arena',
    taglineZh: '三人同技，裂空一戰。',
    taglineEn: 'Three kits. One rift. First to five.',
    dimension: '2D',
    status: 'demo',
    year: 2026,
    genres: ['競技', '技能', '2D'],
    hookZh:
      '裂隙擂台只得一方平地。破鋒、弦鳴、定潮以純冷卻技能對決——先奪五殺者勝，落敗者短暫重生再戰。',
    hookEn:
      'A single symmetric rift arena. Pòfēng, Xiánmíng, and Dìngcháo duel on cooldowns alone—first to five kills wins, with brief respawns between falls.',
    gameplayZh:
      '俯視 1v1 技能決鬥：WASD 移動、滑鼠瞄準、LMB 普攻、Q/E 技能、R 絕招。對手為同英雄池 AI。',
    gameplayEn:
      'Top-down 1v1 skill duel: WASD, mouse aim, LMB basic, Q/E skills, R ultimate. Bot uses the same three-hero roster.',
    features: [
      {
        titleZh: '三名英雄',
        titleEn: 'Three heroes',
        bodyZh: '破鋒近戰、弦鳴遠程、定潮控制——手感分明。',
        bodyEn: 'Melee, ranged, and CC kits with distinct cadence.',
      },
      {
        titleZh: '先五殺',
        titleEn: 'First to five',
        bodyZh: '陣亡後短暫重生，計分直至一方達五殺。',
        bodyEn: 'Short respawn loop until one side reaches five kills.',
      },
      {
        titleZh: '對稱擂台',
        titleEn: 'Symmetric arena',
        bodyZh: '單張競技場地圖與稀疏掩體，無兵線與塔。',
        bodyEn: 'One arena map with sparse cover—no lanes or towers.',
      },
    ],
    coverImage: 'covers/rift-arena.jpg',
    palette: {
      from: '#0a1628',
      via: '#1e3a5f',
      to: '#14b8a6',
      accent: '#f472b6',
      pattern: 'void',
    },
    links: {
      play: '/vincent-games-studio/demos/rift-arena/',
    },
  },
  {
    id: 'pixel-plays-diorama',
    slug: 'pixel-plays-diorama',
    titleZh: '石橋迴響',
    titleEn: 'Pixel Plays Diorama',
    taglineZh: '阿遠的舊色士風，吹醒翡翠河谷。',
    taglineEn: 'A wandering saxophonist in a jade-valley bridge town.',
    dimension: '2D',
    status: 'demo',
    year: 2026,
    genres: ['微遊戲', '像素', '等角'],
    hookZh:
      '翡翠河谷的石橋小鎮裡，居民的記憶隨風飄散。流浪色士風手阿遠背著一把 1928 年的古典色士風來到拱橋邊，用三個微縮章節把溫度喚回來。',
    hookEn:
      'In a jade-valley stone-bridge town, memories drift off on the wind. Wandering saxophonist Ah Yuen arrives with a 1928 classical saxophone and wakes the town through three miniature chapters.',
    gameplayZh:
      '同一個零圖片等角像素沙盤裡的三個小遊戲：古橋金笛共鳴、河畔飛躍試煉、暴風雨前收樂譜。按住畫布或空白鍵操作，R 重新開始。',
    gameplayEn:
      'Three mini-games share one isometric zero-image diorama: 古橋金笛共鳴、河畔飛躍試煉、暴風雨前收樂譜. Hold the canvas or Space; R restarts.',
    features: [
      {
        titleZh: '零圖片等角沙盤',
        titleEn: 'Zero-image isometric diorama',
        bodyZh: '畫布軟體光柵與 Web Audio，沒有圖片或外部音檔。',
        bodyEn: 'Canvas software rasterizer and Web Audio—no image or audio files.',
      },
      {
        titleZh: '三章同一座橋',
        titleEn: 'Three chapters, one bridge',
        bodyZh: '古橋金笛共鳴、河畔飛躍試煉、暴風雨前收樂譜，場景共用。',
        bodyEn: '古橋金笛共鳴、河畔飛躍試煉、暴風雨前收樂譜 share one town.',
      },
      {
        titleZh: '按住即玩',
        titleEn: 'Hold to play',
        bodyZh: '按住畫布或空白鍵，放開完成動作；R 重新開始。',
        bodyEn: 'Hold the canvas or Space, release to finish the move; R restarts.',
      },
    ],
    palette: {
      from: '#14261c',
      via: '#3d6b4f',
      to: '#c96a3b',
      accent: '#e8c15a',
      pattern: 'harbor',
    },
    links: {
      play: '/vincent-games-studio/demos/pixel-plays-diorama/',
    },
  },
  {
    id: 'pixel-plays-trilogy',
    slug: 'pixel-plays-trilogy',
    titleZh: '像素劇場三部曲',
    titleEn: 'Three Pixel Plays',
    taglineZh: '三個原創故事，各自可玩，共用零圖片等角像素。',
    taglineEn: 'Three original stories, each playable, one zero-image isometric craft.',
    dimension: '2D',
    status: 'demo',
    year: 2026,
    genres: ['微遊戲', '像素', '等角'],
    hookZh:
      '《霧港守燈人》、《廟街夜貓》、《茶樓點心塔》三部各自可玩。故事與玩法完全分開，共用同一套零圖片等角像素：360×280 軟體光柵、Z-Buffer、Bayer 抖點，場景與音效都由程式即時生成。',
    hookEn:
      '《霧港守燈人》, 《廟街夜貓》, and 《茶樓點心塔》 are separately playable. The stories and mechanics stay apart, and they share one zero-image isometric craft: a 360×280 software raster, z-buffer, and Bayer dither, with scenes and sound drawn live.',
    gameplayZh:
      '從三部曲入口分別進入。《霧港守燈人》主角阿澄，章節是第一晚初霧、第二晚漲霧、第三晚風暴前夜，玩法是油量 ⇋ 亮度取捨。《廟街夜貓》主角阿灰，章節是第一夜魚檔初探、第二夜狗仔巡更、第三夜全街清醒，玩法是潛行 ⇋ 疾走節奏。《茶樓點心塔》主角阿珍，章節是第一朝首籠、第二朝風起、第三朝開市前，玩法是精準吊放＋平衡物理。按住空白鍵、畫布或主按鈕，放開完成動作；R 重玩本關。',
    gameplayEn:
      'Open each title from the trilogy hub. 《霧港守燈人》 follows 阿澄 through 第一晚初霧、第二晚漲霧、第三晚風暴前夜 — 油量 ⇋ 亮度取捨. 《廟街夜貓》 follows 阿灰 through 第一夜魚檔初探、第二夜狗仔巡更、第三夜全街清醒 — 潛行 ⇋ 疾走節奏. 《茶樓點心塔》 follows 阿珍 through 第一朝首籠、第二朝風起、第三朝開市前 — 精準吊放＋平衡物理. Hold Space, the canvas, or the main button; release to act. R restarts the current stage.',
    features: [
      {
        titleZh: '霧港守燈人',
        titleEn: 'Fog Harbor Keeper',
        bodyZh: '可單獨試玩。主角阿澄。油量 ⇋ 亮度取捨。章節：第一晚初霧、第二晚漲霧、第三晚風暴前夜。',
        bodyEn: 'Separately playable. 阿澄. 油量 ⇋ 亮度取捨. Chapters: 第一晚初霧、第二晚漲霧、第三晚風暴前夜.',
      },
      {
        titleZh: '廟街夜貓',
        titleEn: 'Temple Street Cat',
        bodyZh: '可單獨試玩。主角阿灰。潛行 ⇋ 疾走節奏。章節：第一夜魚檔初探、第二夜狗仔巡更、第三夜全街清醒。',
        bodyEn: 'Separately playable. 阿灰. 潛行 ⇋ 疾走節奏. Chapters: 第一夜魚檔初探、第二夜狗仔巡更、第三夜全街清醒.',
      },
      {
        titleZh: '茶樓點心塔',
        titleEn: 'Dim Sum Tower',
        bodyZh: '可單獨試玩。主角阿珍。精準吊放＋平衡物理。章節：第一朝首籠、第二朝風起、第三朝開市前。',
        bodyEn: 'Separately playable. 阿珍. 精準吊放＋平衡物理. Chapters: 第一朝首籠、第二朝風起、第三朝開市前.',
      },
    ],
    coverImage: 'covers/pixel-plays-trilogy.png',
    stills: [
      { src: 'covers/fog-harbor-keeper.png', labelZh: '霧港守燈人' },
      { src: 'covers/temple-street-cat.png', labelZh: '廟街夜貓' },
      { src: 'covers/dim-sum-tower.png', labelZh: '茶樓點心塔' },
    ],
    palette: {
      from: '#16202e',
      via: '#3a3344',
      to: '#c96a3b',
      accent: '#f8c85c',
      pattern: 'harbor',
    },
    links: {
      play: '/vincent-games-studio/demos/pixel-plays-trilogy/',
    },
    playTitles: [
      {
        titleZh: '霧港守燈人',
        titleEn: 'Fog Harbor Keeper',
        href: '/vincent-games-studio/demos/pixel-plays-trilogy/game-keeper.html',
      },
      {
        titleZh: '廟街夜貓',
        titleEn: 'Temple Street Cat',
        href: '/vincent-games-studio/demos/pixel-plays-trilogy/game-cat.html',
      },
      {
        titleZh: '茶樓點心塔',
        titleEn: 'Dim Sum Tower',
        href: '/vincent-games-studio/demos/pixel-plays-trilogy/game-stall.html',
      },
    ],
  },
  {
    id: 'pulse-arena',
    slug: 'pulse-arena',
    titleZh: '脈衝槍戰',
    titleEn: 'Pulse Arena',
    taglineZh: '方塊競技場，脈衝槍火。',
    taglineEn: 'Blocky arena. Pulse fire. Arcade FFA.',
    dimension: '3D',
    status: 'demo',
    year: 2026,
    genres: ['射擊', '街機', '競技'],
    hookZh:
      '城市被切成發光方塊之後，競技場成了唯一合法的戰場。你帶着脈衝槍械，在貨櫃與色塊之間滑行、跳射——證明自己還在「脈衝網」裡面。',
    hookEn:
      'After the city was sliced into glowing blocks, the arena became the only legal battlefield. Slide, jump-shot, and prove you still belong on the Pulse Net.',
    gameplayZh:
      '瀏覽器第一人稱競技場：WASD 移動、跳躍與滑行、五種武器（步槍／手槍／狙擊／散彈／短刃），對戰 3–5 名 AI。支援開鏡、換彈與計分板。',
    gameplayEn:
      'Browser FPS arena: WASD, jump, slide, five weapons (AR / pistol / sniper / shotgun / blade) vs AI bots. ADS, reload, and Tab scoreboard.',
    features: [
      {
        titleZh: '低面數競技場',
        titleEn: 'Low-poly arena',
        bodyZh: '明亮方塊地圖，貨櫃與掩體，街機節奏。',
        bodyEn: 'Bright blocky map with crates and cover—arcade tempo.',
      },
      {
        titleZh: '滑行與跳射',
        titleEn: 'Slide & jump-shot',
        bodyZh: 'Shift／C 滑行，Space 跳，手感偏街機。',
        bodyEn: 'Shift/C slide, Space jump—arcade movement feel.',
      },
      {
        titleZh: '武器輪盤',
        titleEn: 'Weapon wheel',
        bodyZh: '1–5 或滾輪切換步槍、手槍、狙擊、散彈、短刃。',
        bodyEn: '1–5 or scroll: rifle, pistol, sniper, shotgun, blade.',
      },
    ],
    coverImage: 'covers/pulse-arena.jpg',
    palette: {
      from: '#1a1030',
      via: '#5a2a7a',
      to: '#ff6bcb',
      accent: '#7ef0ff',
      pattern: 'fault',
    },
    links: {
      play: '/vincent-games-studio/demos/pulse-arena/',
    },
  },
  {
    id: 'midnight-estate',
    slug: 'midnight-estate',
    titleZh: '午夜屋邨',
    titleEn: 'Midnight Estate',
    taglineZh: '舊邨走廊，紅衣與鑰匙。',
    taglineEn: 'Old estate corridors, a lady in red, and the keys out.',
    dimension: '3D',
    status: 'demo',
    year: 2026,
    genres: ['探索', '驚悚'],
    hookZh:
      '午夜的舊式屋邨走廊裡，電燈忽明忽滅。你要在幽靈與紅衣女人之間找到鑰匙、打開鐵閘，一層一層往下走。',
    hookEn:
      'In a midnight Hong Kong estate corridor, lights flicker. Find keys, open gates, and descend floor by floor past ghosts and the Lady in Red.',
    gameplayZh:
      '瀏覽器 3D 試玩：移動探索、收集鑰匙與玉器，避開幽靈。支援觸控虛擬搖桿。',
    gameplayEn:
      'Browser 3D demo: explore, collect keys and jade, avoid ghosts. Touch joystick supported.',
    features: [
      {
        titleZh: '屋邨氛圍',
        titleEn: 'Estate atmosphere',
        bodyZh: '鐵閘、通花磚、長廊燈光，香港舊邨味道。',
        bodyEn: 'Gates, breeze-block patterns, corridor light—old-estate grain.',
      },
      {
        titleZh: '分層關卡',
        titleEn: 'Floor by floor',
        bodyZh: '每層鑰匙與閘門，節奏逐步加快。',
        bodyEn: 'Keys and gates each floor; pressure rises as you descend.',
      },
      {
        titleZh: '即開即玩',
        titleEn: 'Instant play',
        bodyZh: '單一頁面試玩，無需安裝。',
        bodyEn: 'Single-page demo—no install.',
      },
    ],
    coverImage: 'covers/midnight-estate.jpg',
    palette: {
      from: '#071C22',
      via: '#16444C',
      to: '#E8A33A',
      accent: '#E8A33A',
      pattern: 'void',
    },
    links: {
      play: '/vincent-games-studio/demos/midnight-estate/',
    },
  },
  {
    id: 'neon-chase',
    slug: 'neon-chase',
    titleZh: '霓虹追蹤',
    titleEn: 'Neon Chase',
    taglineZh: '旺角夜街，無盡狂奔。',
    taglineEn: 'Endless sprint through Mong Kok neon alleys.',
    dimension: '2D',
    status: 'demo',
    year: 2026,
    genres: ['街機', '反應'],
    hookZh:
      '霓虹在雨後路面拉成長影。你在旺角窄巷裡左右閃避、躍過路障，撿起時鐘爭取更遠的距離——直到撞上無法避開的障礙。',
    hookEn:
      'Neon streaks across wet asphalt. Dodge, jump, and grab extra time in Mong Kok alleys—until something you cannot avoid catches you.',
    gameplayZh:
      '無盡跑酷：左右換線、跳躍躲障礙，收集時鐘加分。速度會隨距離加快。支援鍵盤與觸控。',
    gameplayEn:
      'Endless runner: switch lanes, jump obstacles, collect clocks. Speed ramps up with distance. Keyboard and touch friendly.',
    features: [
      {
        titleZh: '旺角霓虹巷',
        titleEn: 'Mong Kok neon lanes',
        bodyZh: '粉紅與青色招牌、濕地倒影，營造夜間追趕節奏。',
        bodyEn: 'Pink-cyan signs and wet reflections set a night-chase pulse.',
      },
      {
        titleZh: '漸快節奏',
        titleEn: 'Rising tempo',
        bodyZh: '跑得越遠，障礙越密、速度越快。',
        bodyEn: 'The farther you go, denser hazards and higher speed.',
      },
      {
        titleZh: '即開即玩',
        titleEn: 'Instant play',
        bodyZh: '瀏覽器單檔試玩，無需安裝。',
        bodyEn: 'Single-file browser demo—no install.',
      },
    ],
    coverImage: 'covers/neon-chase.jpg',
    palette: {
      from: '#120018',
      via: '#4a0a5c',
      to: '#ff4dc8',
      accent: '#40f0ff',
      pattern: 'fault',
    },
    links: {
      play: '/vincent-games-studio/demos/neon-chase/',
    },
  },
  {
    id: 'rooftop-cat',
    slug: 'rooftop-cat',
    titleZh: '天台貓',
    titleEn: 'Rooftop Cat',
    taglineZh: '日落前，跳到最遠那座屋頂。',
    taglineEn: 'Reach the far roof before the sun dips.',
    dimension: '2D',
    status: 'demo',
    year: 2026,
    genres: ['平台', '動作'],
    hookZh:
      '紅領巾小貓穿梭舊樓天台：水塔、天線、晾衣架都是跳板。短程平台挑戰——掉下去就重來，抵達終點旗就算過關。',
    hookEn:
      'A bandana kitten vaults old-building rooftops—water tanks, antennas, laundry poles. Short platform run: fall and retry, flag means clear.',
    gameplayZh:
      '左右移動與可變高度跳躍，從近端屋頂一路跳到遠端終點。適合手機點按操作。',
    gameplayEn:
      'Move and variable-height jump across rooftops to the far goal. Tap-friendly on mobile.',
    features: [
      {
        titleZh: '香港天台風景',
        titleEn: 'HK rooftop scenery',
        bodyZh: '水塔、晾衫竹、日落天際線，一跳一景。',
        bodyEn: 'Tanks, laundry poles, sunset skyline—each hop a postcard.',
      },
      {
        titleZh: '短程通關',
        titleEn: 'Short clear run',
        bodyZh: '不是無盡模式：目標明確，重玩手感。',
        bodyEn: 'Not endless—clear goal, satisfying retries.',
      },
      {
        titleZh: '可變跳躍',
        titleEn: 'Variable jump',
        bodyZh: '短按輕跳、長按高跳，精準落點。',
        bodyEn: 'Tap short, hold high—land where you mean to.',
      },
    ],
    coverImage: 'covers/rooftop-cat.jpg',
    palette: {
      from: '#2a1838',
      via: '#c05060',
      to: '#f09050',
      accent: '#ffd36a',
      pattern: 'harbor',
    },
    links: {
      play: '/vincent-games-studio/demos/rooftop-cat/',
    },
  },
  {
    id: 'tea-rush',
    slug: 'tea-rush',
    titleZh: '茶餐廳限時',
    titleEn: 'Tea Rush',
    taglineZh: '快單！熱茶！來不及猶豫。',
    taglineEn: 'Fast orders. Hot tea. No time to spare.',
    dimension: '2D',
    status: 'demo',
    year: 2026,
    genres: ['反應', '休閒'],
    hookZh:
      '茶餐廳櫃位前訂單飛來：奶茶、西多士、菠蘿油……把正確組合點上托盤再上菜。限時內分數越高越好。',
    hookEn:
      'Tickets fly at the cha chaan teng counter—milk tea, French toast, pineapple buns. Match the tray and serve before time runs out.',
    gameplayZh:
      '點擊／輕觸菜單把餐點放上托盤，核對點單後按「上菜」。做錯扣分；做對加時。紀錄保存在本機。',
    gameplayEn:
      'Tap menu items onto the tray, then Serve. Misses cost points; hits add time. Best score saved locally.',
    features: [
      {
        titleZh: '茶餐廳菜單',
        titleEn: 'Cha chaan teng menu',
        bodyZh: '奶茶、凍檸茶、鴛鴦、西多士等經典組合。',
        bodyEn: 'Milk tea, lemon tea, yuan yang, French toast, and more.',
      },
      {
        titleZh: '限時對單',
        titleEn: 'Timed matching',
        bodyZh: '越做越難的點單長度，考驗眼快手快。',
        bodyEn: 'Orders grow longer—eyes and fingers race the clock.',
      },
      {
        titleZh: '手機友善',
        titleEn: 'Mobile friendly',
        bodyZh: '大按鈕點按，無需鍵盤。',
        bodyEn: 'Big tap targets—no keyboard required.',
      },
    ],
    coverImage: 'covers/tea-rush.jpg',
    palette: {
      from: '#1a1008',
      via: '#5a3018',
      to: '#ff9a40',
      accent: '#ffd36a',
      pattern: 'crane',
    },
    links: {
      play: '/vincent-games-studio/demos/tea-rush/',
    },
  },
  {
    id: 'mist-harbor',
    slug: 'mist-harbor-lights',
    titleZh: '霧港燈影',
    titleEn: 'Mist Harbor Lights',
    taglineZh: '在霧氣散盡前，找到回家的燈。',
    taglineEn: 'Find the light home before the fog claims everything.',
    dimension: '2D',
    status: 'demo',
    year: 2025,
    genres: ['探索', '氛圍', '敘事'],
    hookZh:
      '你醒來時，碼頭只剩一盞搖晃的燈。港口被濃霧吞沒，居民變成剪影。每一扇門背後，都是一段未說完的故事。',
    hookEn:
      'You wake to a single swaying lantern. The harbour is swallowed by fog; residents are silhouettes. Behind every door, a story left unfinished.',
    gameplayZh:
      '橫向探索與輕解謎交織。收集燈芯、解讀殘簡，決定誰能被帶回光裡。沒有戰鬥——只有選擇與安靜的後果。',
    gameplayEn:
      'Side-scrolling exploration meets light puzzles. Gather wicks, read scraps, and choose who returns to the light. No combat—only choices and quiet consequences.',
    features: [
      {
        titleZh: '手繪剪影世界',
        titleEn: 'Hand-crafted silhouettes',
        bodyZh: '墨色港口與霓虹倒影，每一幀都像一幅移動的畫。',
        bodyEn: 'Ink harbours and neon reflections—every frame a moving painting.',
      },
      {
        titleZh: '分岐結局',
        titleEn: 'Branching endings',
        bodyZh: '你的燈火能照亮多少人，取決於你願意留下什麼。',
        bodyEn: 'How many you save depends on what you are willing to leave behind.',
      },
      {
        titleZh: '原創配樂',
        titleEn: 'Original score',
        bodyZh: '港灣潮聲與低音弦樂，跟著霧氣起伏。',
        bodyEn: 'Harbour tides and low strings that rise with the mist.',
      },
    ],
    coverImage: 'covers/fog-harbor.jpg',
    palette: {
      from: '#0a1628',
      via: '#1a3a5c',
      to: '#0d9488',
      accent: '#f0c14a',
      pattern: 'harbor',
    },
    links: {
      play: '/vincent-games-studio/demos/mist-harbor-lights/',
    },
  },
  {
    id: 'faultline',
    slug: 'faultline-walker',
    titleZh: '斷層行者',
    titleEn: 'Faultline Walker',
    taglineZh: '城市在崩裂。你在裂縫上奔跑。',
    taglineEn: 'The city splits. You run the seams.',
    dimension: '3D',
    status: 'early-access',
    year: 2026,
    genres: ['跑酷', '動作', '科幻'],
    hookZh:
      '地殼裂開的那一夜，重力變成了可切換的工具。你是被選中的「行者」——在懸浮街區之間跳躍，搶在城市沉沒前送達訊號。',
    hookEn:
      'The night the crust cracked, gravity became a switch. You are a Walker—vaulting between floating blocks to deliver a signal before the city sinks.',
    gameplayZh:
      '第三人稱跑酷：牆跑、重力翻轉、時間減速。關卡是可解構的立體迷宮，速度與路線選擇同樣重要。',
    gameplayEn:
      'Third-person parkour: wall-runs, gravity flips, brief time-dilate. Levels are deconstructable 3D mazes where speed and route matter equally.',
    features: [
      {
        titleZh: '動態重力',
        titleEn: 'Dynamic gravity',
        bodyZh: '一鍵翻轉「下」的方向，建築瞬間變成跑道。',
        bodyEn: 'Flip "down" with one tap—architecture becomes runway.',
      },
      {
        titleZh: '幽靈競速',
        titleEn: 'Ghost races',
        bodyZh: '與自己的最佳路線疊影競速，打磨每一個轉角。',
        bodyEn: 'Race your best ghost and polish every corner.',
      },
      {
        titleZh: '可模組關卡',
        titleEn: 'Modular stages',
        bodyZh: '官方關卡包與社群創作工具即將開放。',
        bodyEn: 'Official packs and community tools coming soon.',
      },
    ],
    coverImage: 'covers/fault-walker.jpg',
    palette: {
      from: '#1a0a2e',
      via: '#4c1d95',
      to: '#f43f5e',
      accent: '#5eead4',
      pattern: 'fault',
    },
    links: {
      play: '/vincent-games-studio/demos/faultline-walker/',
      steam: 'https://store.steampowered.com',
      itch: 'https://itch.io',
    },
  },
  {
    id: 'paper-crane',
    slug: 'paper-crane-epoch',
    titleZh: '紙鶴紀元',
    titleEn: 'Paper Crane Epoch',
    taglineZh: '摺一隻鶴，改寫一個時代。',
    taglineEn: 'Fold one crane. Rewrite an age.',
    dimension: '2D',
    status: 'demo',
    year: 2026,
    genres: ['解謎', '奇幻', '溫柔'],
    hookZh:
      '在紙做成的國度裡，記憶會褪色成空白。你扮演一名摺紙師，用鶴、舟、燈籠，把人們遺失的名字一筆一筆寫回去。',
    hookEn:
      'In a kingdom of paper, memories fade to blank. You are a folder—using cranes, boats, and lanterns to rewrite the names people lost.',
    gameplayZh:
      '點擊與拖曳式解謎。每道題都是一幅可互動的和紙風景；解答方式往往不止一種，結局也會隨之改變。',
    gameplayEn:
      'Click-and-drag puzzles set in interactive washi landscapes. Most puzzles have multiple solutions—and endings shift with them.',
    features: [
      {
        titleZh: '可觸感的紙世界',
        titleEn: 'Tactile paper world',
        bodyZh: '摺痕、撕邊、墨暈——介面本身就是玩法的一部分。',
        bodyEn: 'Creases, torn edges, ink blooms—the UI is part of play.',
      },
      {
        titleZh: '短章敘事',
        titleEn: 'Chaptered tales',
        bodyZh: '每隻鶴帶出一段完整短篇，適合碎片時間遊玩。',
        bodyEn: 'Each crane unlocks a short story—perfect in small sittings.',
      },
      {
        titleZh: '無失敗壓力',
        titleEn: 'Failure-free design',
        bodyZh: '解不開也能換一條路；溫柔，但不失深度。',
        bodyEn: 'Stuck? Take another path. Gentle—never shallow.',
      },
    ],
    coverImage: 'covers/paper-crane.jpg',
    palette: {
      from: '#2a1810',
      via: '#9a3412',
      to: '#fbbf24',
      accent: '#fda4af',
      pattern: 'crane',
    },
    links: {
      play: '/vincent-games-studio/demos/paper-crane-epoch/',
      itch: 'https://itch.io',
      steam: 'https://store.steampowered.com',
    },
  },
  {
    id: 'echoes-void',
    slug: 'echoes-of-void',
    titleZh: '深空遺音',
    titleEn: 'Echoes of Void',
    taglineZh: '訊號來自無人的星艦。你會回覆嗎？',
    taglineEn: 'A signal from an empty ship. Will you answer?',
    dimension: '3D',
    status: 'demo',
    year: 2024,
    genres: ['敘事', '科幻', '步行模擬'],
    hookZh:
      '你是遠距打撈員。一艘被遺棄的研究艦在黑洞邊緣循環播放同一段錄音。走進艙房，拼湊船員消失前最後七十二小時。',
    hookEn:
      'You are a salvage operator. An abandoned research vessel loops one recording at a black hole\'s edge. Walk the decks. Reconstruct the crew\'s final seventy-two hours.',
    gameplayZh:
      '第一人稱探索。環境說故事；錄音、日誌與空間聲場是唯一「武器」。你的選擇影響結局——以及你帶回去的真相版本。',
    gameplayEn:
      'First-person exploration. Environment-as-story; logs and spatial audio are your only tools. Choices shape the ending—and which truth you bring home.',
    features: [
      {
        titleZh: '空間音景',
        titleEn: 'Spatial soundscape',
        bodyZh: '戴上耳機，走廊另一端的低語會告訴你該往哪走。',
        bodyEn: 'With headphones, whispers down the hall tell you where to go.',
      },
      {
        titleZh: '非線性船艙',
        titleEn: 'Non-linear decks',
        bodyZh: '艙門依你解鎖的記憶開啟；每次遊玩路徑都不同。',
        bodyEn: 'Doors open with unlocked memories—routes change each run.',
      },
      {
        titleZh: '極簡操作',
        titleEn: 'Minimal controls',
        bodyZh: '走、看、聽、選擇。沒有 HUD 噪音。',
        bodyEn: 'Walk, look, listen, choose. No HUD noise.',
      },
    ],
    coverImage: 'covers/deep-space.jpg',
    palette: {
      from: '#020617',
      via: '#1e3a5f',
      to: '#6366f1',
      accent: '#c4b5fd',
      pattern: 'void',
    },
    links: {
      play: '/vincent-games-studio/demos/echoes-of-void/',
      steam: 'https://store.steampowered.com',
      itch: 'https://itch.io',
    },
  },
]

export function getGameBySlug(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug)
}

export function filterGames(dimension: 'all' | GameDimension): Game[] {
  if (dimension === 'all') return games
  return games.filter((g) => g.dimension === dimension)
}
