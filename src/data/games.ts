export type GameDimension = '2D' | '3D'
export type GameStatus = 'demo' | 'early-access' | 'released' | 'coming-soon'

export interface GameLinks {
  play?: string
  download?: string
  steam?: string
  itch?: string
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
    id: 'neon-harbor',
    slug: 'neon-harbor',
    titleZh: '霓虹港戰',
    titleEn: 'Neon Harbor Clash',
    taglineZh: 'Frag Channel 開播——快一步，今晚先有糧。',
    taglineEn: 'Frag Channel is live—half a step faster, tonight you eat.',
    dimension: '3D',
    status: 'demo',
    year: 2026,
    genres: ['射擊', '競技'],
    hookZh:
      'Frag Channel 開播——快一步，今晚先有糧。你加入 Channel 7；八張地圖——貨櫃、廟市、招牌街、小巴巷、唐樓轉角、霓虹屋頂、電車街同啟德天台，打贏先有收視。',
    hookEn:
      'Frag Channel is live—half a step faster and tonight you eat. You join Channel 7 across eight maps: cargo, temple, sign street, minibus alley, Tong Lau bend, neon rooftop, Tram Street and Kai Tak Roof—win the fight, win the ratings.',
    gameplayZh:
      '瀏覽器第一人稱射擊試玩：四種角色（閃／隼／石／影）、八張地圖（貨櫃碼頭／霓虹廟市／招牌街／夜間小巴巷／唐樓轉角／霓虹屋頂／電車街／啟德天台）、對戰 AI、跳與蹲滑。約 2.5 分鐘或先到 20 殺。',
    gameplayEn:
      'Browser FPS demo: four classes (Spark / Falcon / Rock / Shade), eight maps (Cargo Pier / Neon Temple / Sign Street / Night Minibus Alley / Tong Lau Bend / Neon Rooftop / Tram Street / Kai Tak Roof), FFA vs AI, jump and crouch-slide. ~2.5 min or first to 20 kills.',
    features: [
      {
        titleZh: '港式霓虹競技場',
        titleEn: 'Neon harbour arenas',
        bodyZh: '貨櫃碼頭、廟市、招牌街、小巴巷、唐樓轉角、霓虹屋頂、電車街與啟德天台——洋紅／青／琥珀霓虹低模。',
        bodyEn: 'Cargo, temple, sign street, minibus alley, Tong Lau bend, neon rooftop, Tram Street & Kai Tak Roof—magenta/cyan/amber low-poly.',
      },
      {
        titleZh: '四種港戰角色',
        titleEn: 'Four harbour fighters',
        bodyZh: '閃（AR）、隼（狙擊）、石（散彈重裝）、影（SMG 機動）。',
        bodyEn: 'Spark AR, Falcon sniper, Rock shotgun-tank, Shade SMG mobility.',
      },
      {
        titleZh: '滑跳手感',
        titleEn: 'Slide-hop lite',
        bodyZh: 'WASD、跳躍、蹲滑加速，即開即玩無需安裝。',
        bodyEn: 'WASD, jump, crouch-slide boost—instant browser play.',
      },
    ],
    coverImage: 'covers/neon-harbor.jpg',
    palette: {
      from: '#050818',
      via: '#1a0830',
      to: '#ff4dc8',
      accent: '#40f0ff',
      pattern: 'harbor',
    },
    links: {
      play: '/vincent-games-studio/demos/neon-harbor/',
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
      play: '#play-demo',
      download: '#download',
      itch: 'https://itch.io',
      steam: 'https://store.steampowered.com',
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
      play: '#play-demo',
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
    status: 'coming-soon',
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
      play: '#play-demo',
      download: '#download',
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
