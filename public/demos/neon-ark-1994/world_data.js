// NEON ARK: 1994 — World Rooms, Lore Notes, Weapons & ASTRO-ORACLE Data

export const WEAPON_SPECS = {
  pistol: {
    id: 'pistol',
    name: '88式警用手槍 (9mm)',
    short: '1:手槍',
    ammoKey: 'ammo_pistol',
    damage: 18,
    critMult: 2.2,
    cooldown: 0.32,
    range: 18.0,
    pellets: 1,
    spreadDeg: 1.5,
    laserColor: 0xff2942,
  },
  shotgun: {
    id: 'shotgun',
    name: 'M90 鎮暴霰彈槍 (12G)',
    short: '2:霰彈',
    ammoKey: 'ammo_shotgun',
    damage: 14,
    critMult: 1.6,
    cooldown: 0.75,
    range: 10.5,
    pellets: 6,
    spreadDeg: 13.0,
    laserColor: 0xff8c24,
  },
  flamer: {
    id: 'flamer',
    name: '極光熱熔噴射器 (Plasma)',
    short: '3:熱熔',
    ammoKey: 'ammo_flamer',
    damage: 8,
    critMult: 1.35,
    cooldown: 0.11,
    range: 7.5,
    pellets: 1,
    spreadDeg: 7.0,
    laserColor: 0x38bdf8,
  },
  magnum: {
    id: 'magnum',
    name: '脈衝麥格農 (.44 Magnum)',
    short: '4:麥格農',
    ammoKey: 'ammo_magnum',
    damage: 72,
    critMult: 2.5,
    cooldown: 0.82,
    range: 22.0,
    pellets: 1,
    spreadDeg: 0.4,
    laserColor: 0xf43f5e,
  },
};

export const LORE_NOTES = {
  note_01_gate: {
    title: '【文獻 01】太陽神穹頂・安檢亭值班日誌',
    date: '1992年10月14日',
    body: '致夜班保全：\n斯旺博士下令今晚起全面封鎖「太陽神穹頂海洋博覽館」。\n若忘記北側旋轉閘門電子鎖密碼，請記住：密碼就是本博覽館盛大開幕的年份——【1986】。\n切勿靠近西翼海豚劇場傳來的怪聲！',
  },
  note_02_plaza: {
    title: '【文獻 02】博覽館導覽手冊（染血殘頁）',
    date: '1986年 紀念印刷版',
    body: '歡迎來到維克多·斯旺博士打造的明日烏托邦《太陽神穹頂 SOLARIS DOME》！\n・西翼【仿生海豚劇場】：需持有「青銅海豚徽章」方可進入。\n・東翼【星際明日世界】：需持有「白銀星光徽章」方可啟動。\n・北側【深海冷卻水道】：唯有斯旺博士的「黃金日冕徽章」能開啟。\n若迷路請尋找發光的「星象神諭機 (ASTRO-ORACLE)」。',
  },
  note_03_lounge: {
    title: '【文獻 03】員工安全室・錄音帶轉譯稿',
    date: '1992年10月12日',
    body: '「……這根本不是主題樂園。我們在休息室底下聽見高壓鑽頭日夜轟鳴。斯旺博士在海床下三千公尺挖到了活體礦脈【逆熵銥金】。每當深海採掘層提高抽吸功率，園區裡的機械吉祥物就會滲出溫熱的組織液……備用的『青銅海豚徽章』就放在安全室桌上，快逃！」',
  },
  note_04_dolphin: {
    title: '【文獻 04】仿生海豚調音師的樂譜筆記',
    date: '1992年09月28日',
    body: '巨型機械海豚「波塞頓號」嘴裡的保險匣卡住了，裡面放著通往東翼的【白銀星光徽章】。\n只有用舞台旁的諧波管風琴彈奏正確的四音符「深海搖籃曲」，機械顎骨才會張開：\n  第一音：C（深海之底 Do）\n  第二音：E（珊瑚微光 Mi）\n  第三音：G（潮汐湧動 Sol）\n  第四音：B（星辰倒影 Si）\n依序輸入【 C - E - G - B 】即可解鎖。',
  },
  note_05_VIP_incident: {
    title: '【文獻 05】1992年貴賓館「零號咬傷事件」報告',
    date: '1992年10月13日 醫療部',
    body: '【最高機密：接觸者 #09 號檔案】\n受害者姓名：林克拉拉（Clara Lin），14歲，博覽館青少年海洋科學營實習生。\n事發經過：第一隻從深海裂隙爬出的「迴響體」闖入海豚劇場，咬傷了少女左前臂。\n異常症狀：傷口長出帶有時間逆流特性的螢光深海珊瑚結晶。斯旺博士隨即封鎖全島。',
  },
  note_06_astro: {
    title: '【文獻 06】星際明日世界・化學家遺言',
    date: '1992年10月15日',
    body: '那些怪物身上的鈣化時間珊瑚刀槍難入！我們在北邊的「深海生物實驗室」調配了一瓶高濃度的【深海強酸試劑 (Abyssal Acid)】。只要把強酸淋在實驗室北牆的珊瑚結塊上，就能瞬間溶解並取出【極光熱熔噴射器】與【深海新月浮雕】！',
  },
  note_07_biolab: {
    title: '【文獻 07】「迴響體」解剖與訊號破譯報告（第一重真相）',
    date: '1992年11月02日 斯旺首席科學家',
    body: '上帝啊，我們終於破譯了第一具「迴響體」胸腔內的鈦合金銘牌：\n【它們是來自西元 2142 年「淹沒世紀」的人類難民！】\n2142年地球因海平面暴漲幾近滅絕，未來人透過「深海時間脈絡」逆時空逃難回 1992 年。但因斯旺博士瘋狂抽取脈絡中的「逆熵銥金」牟利，導致時空接收端扭曲，抵達的未來難民活生生與深海珊瑚及園區吉祥物融合成了怪物！',
  },
  note_08_maintenance: {
    title: '【文獻 08】地下冷卻水道・工程師手札',
    date: '1992年10月16日',
    body: '通往「零號時間晶簇核心」的走廊被帶電冷卻水淹沒了。我把【液壓搖柄 (Hydraulic Crank)】留在了仿生海豚劇場的貴賓後台。只要用搖柄轉動冷卻水道左側的紅色排水閥門，就能排乾積水！',
  },
  note_09_director: {
    title: '【文獻 09】維克多·斯旺館長私人日記（保險箱密碼）',
    date: '1993年04月19日',
    body: '每開採一公克「逆熵銥金」就能換取上億美金，未來難民的死活與 1994 年的我何干？\n我把威力最強的【脈衝麥格農 .44】鎖在館長室鈦金保險箱裡，密碼就設為那些未來人逃離的毀滅年份——【2142】。',
  },
  note_10_vera_truth: {
    title: '【文獻 10】林薇拉口袋裡的偽造證件與病歷（第二重真相）',
    date: '1994年11月17日 隨身私人物品',
    body: '（你低頭看著左臂繃帶下發光的藍紫色珊瑚結晶）：\n患者原名：林克拉拉（化名：林薇拉 Vera Lin），1992年「零號接觸者」。體內時間珊瑚結晶化已達 78%，剩餘壽命不足 48 小時。\n你根本不是保險調查員——你潛入這座煉獄，是為了在自己徹底變成怪物前，找到斯旺合成的【逆熵穩定血清】！',
  },
  note_11_astral: {
    title: '【文獻 11】深海聖所・三曜星盤銘文',
    date: '無年份記載',
    body: '「欲開啟零號時間晶簇之門，須集齊【黃金日冕徽章】（藏於館長貴賓室）與【深海新月浮雕】（封於生物實驗室鈣化珊瑚下），嵌合於冷卻水道北端的三曜星盤祭壇，時間裂隙之門方為汝敞開。」',
  },
  note_12_swan_final: {
    title: '【文獻 12】零號採掘層・斯旺博士最後實驗記錄',
    date: '1994年11月18日 凌晨',
    body: '「09號女孩……克拉拉，我知道妳終究會找來這裡。實驗台上那支藍色的【逆熵穩定血清】是我提煉出的唯一解藥。至於我？我要親自跳進零號時間晶簇池，跨越到 2142 年成為永恆之神！」',
  },
};

export function getOracleHint(keyItems, solvedPuzzles) {
  if (!solvedPuzzles.has('door_keypad_1986')) {
    return ['星象神諭籤 #01：『初生之門』', '北側旋轉閘門緊閉。閱讀門口的安檢日誌吧——太陽神穹頂開幕於【1986】年，那是開啟新星廣場的密語。'];
  }
  if (!keyItems.has('bronze_key') && !solvedPuzzles.has('door_bronze')) {
    return ['星象神諭籤 #02：『青銅海豚的嘆息』', '前往新星中央廣場西側的【員工安全室】，桌上放著【青銅海豚徽章】與【M90 鎮暴霰彈槍】。'];
  }
  if (!solvedPuzzles.has('organ_solved')) {
    return ['星象神諭籤 #03：『四音符深海搖籃曲』', '調查新星廣場左下角的海豚雕像進入【仿生海豚劇場】，在諧波管風琴彈奏【 C - E - G - B 】取得白銀星光徽章。'];
  }
  if (!keyItems.has('hydraulic_crank')) {
    return ['星象神諭籤 #04：『後台的遺落工具』', '從仿生海豚劇場北門進入【貴賓後台】，拾取桌上的【液壓搖柄】。'];
  }
  if (!solvedPuzzles.has('coral_melted')) {
    return ['星象神諭籤 #05：『溶解時間的甲殼』', '用白銀徽章開啟廣場東門進入【星際明日世界】再往北去【深海生物實驗室】，拾取強酸試劑溶解北牆鈣化珊瑚。'];
  }
  if (!keyItems.has('gold_key')) {
    return ['星象神諭籤 #06：『館長的傲慢與2142』', '從星際明日世界往南進入【館長私人貴賓室】拿取【黃金日冕徽章】，並用密碼【2142】打開保險箱拿麥格農。'];
  }
  if (!solvedPuzzles.has('flooded_drained')) {
    return ['星象神諭籤 #07：『乾涸的雷霆水道』', '用黃金徽章進入廣場北側【地下冷卻水道】，對左側排水閥使用【液壓搖柄】排乾漏電積水。'];
  }
  if (!solvedPuzzles.has('astral_unlocked')) {
    return ['星象神諭籤 #08：『三曜祭壇的共鳴』', '調查冷卻水道北門旁的【三曜星盤祭壇】，嵌入黃金日冕徽章與深海新月浮雕開啟最終大門。'];
  }
  return ['星象神諭籤 #09：『直面零號時間晶簇』', '踏入北方的【零號時間晶簇核心】，擊潰時空融合體維克多·斯旺，在左上角實驗台領取【逆熵穩定血清】！'];
}

export function createInitialWorld() {
  return {
    entrance_gate: {
      id: 'entrance_gate',
      name: '入口棧橋與安檢亭',
      zone: '外圍海堤區',
      grid: [1, 3],
      w: 18, d: 16,
      floorCol: 0x222b38, wallCol: 0x334155,
      visited: true,
      isSaveRoom: false,
      doors: {
        north: { target: 'nova_plaza', spawn: [0, 7.2], lockId: 'keypad_1986', lockName: '1986開幕年份電子密碼鎖', unlocked: false, offset: 0 },
      },
      props: [
        { kind: 'keypad', x: 1.9, z: -7.1, label: '北側安檢電子鎖 [輸入4位密碼]', interactId: 'puzzle_keypad_1986', r: 0.9 },
        { kind: 'oracle', x: -5.8, z: -4.5, label: '星象神諭機 ASTRO-ORACLE', interactId: 'use_oracle', r: 1.0 },
        { kind: 'desk', x: 5.0, z: -3.5, label: '安檢值班桌', interactId: '', r: 1.1 },
        { kind: 'vending', x: -6.2, z: 3.5, label: '1986海豚汽水機', interactId: '', r: 1.0 },
      ],
      hazards: [],
      pickups: [
        { uid: 'p_gate_n1', kind: 'note', name: '安檢亭值班日誌', x: 4.5, z: -2.2, amount: 1, noteId: 'note_01_gate', collected: false },
        { uid: 'p_gate_n10', kind: 'note', name: '林薇拉隨身病歷檔案', x: -2.2, z: 4.2, amount: 1, noteId: 'note_10_vera_truth', collected: false },
        { uid: 'p_gate_a1', kind: 'ammo_pistol', name: '9mm 手槍彈藥 x12', x: -4.5, z: 1.5, amount: 12, collected: false },
        { uid: 'p_gate_s1', kind: 'secret', name: '【秘密 #1】黃金海豚紀念幣', x: -5.0, z: 3.8, amount: 1, isSecret: true, collected: false },
      ],
      enemies: [],
      npcs: [],
    },

    nova_plaza: {
      id: 'nova_plaza',
      name: '新星中央廣場',
      zone: '中央樞紐 Hub',
      grid: [1, 2],
      w: 24, d: 22,
      floorCol: 0x26203a, wallCol: 0x3b2f5c,
      visited: false,
      isSaveRoom: false,
      doors: {
        south: { target: 'entrance_gate', spawn: [0, -5.8], lockId: null, lockName: '', unlocked: true, offset: 0 },
        west: { target: 'staff_save_room', spawn: [5.2, 0], lockId: null, lockName: '員工安全室', unlocked: true, offset: -3.5 },
        east: { target: 'astro_tomorrow', spawn: [-8.5, 0], lockId: 'silver_key', lockName: '白銀星光徽章之門', unlocked: false, offset: 0 },
        north: { target: 'coolant_tunnel', spawn: [0, 7.2], lockId: 'gold_key', lockName: '黃金日冕徽章大門', unlocked: false, offset: 0 },
      },
      props: [
        { kind: 'fountain', x: 0, z: 0, label: '太陽神海豚紀念噴泉', interactId: 'examine_fountain', r: 2.2 },
        { kind: 'dolphin_gate', x: -6.8, z: -6.8, label: '西翼劇場雕像門 [進入仿生海豚劇場]', interactId: 'door_to_dolphinarium', r: 1.3 },
        { kind: 'oracle', x: 7.5, z: 6.2, label: '星象神諭機 ASTRO-ORACLE', interactId: 'use_oracle', r: 1.0 },
        { kind: 'arcade', x: -8.5, z: 5.8, label: '復古街機 CRONOS-86', interactId: '', r: 1.0 },
      ],
      hazards: [
        { kind: 'explosive_barrel', x: -3.8, z: -3.5, r: 1.3, active: true },
        { kind: 'explosive_barrel', x: 4.5, z: -2.0, r: 1.3, active: true },
      ],
      pickups: [
        { uid: 'p_plz_n2', kind: 'note', name: '博覽館導覽手冊', x: 2.6, z: 2.4, amount: 1, noteId: 'note_02_plaza', collected: false },
        { uid: 'p_plz_a1', kind: 'ammo_pistol', name: '9mm 手槍彈藥 x15', x: 8.0, z: -6.2, amount: 15, collected: false },
        { uid: 'p_plz_m1', kind: 'medkit', name: '急救噴霧罐', x: -8.0, z: -2.0, amount: 1, collected: false },
        { uid: 'p_plz_s2', kind: 'secret', name: '【秘密 #2】限量版海豚星靈徽章', x: -7.4, z: 5.8, amount: 1, isSecret: true, collected: false },
      ],
      enemies: [
        { uid: 'e_plz_1', kind: 'echo_walker', name: '迴響體・漫遊者', x: -4.5, z: -4.2, hp: 45, maxHp: 45, speed: 2.2, dmg: 14, alive: true },
        { uid: 'e_plz_2', kind: 'echo_walker', name: '迴響體・漫遊者', x: 5.2, z: -3.5, hp: 45, maxHp: 45, speed: 2.3, dmg: 14, alive: true },
      ],
      npcs: [
        {
          uid: 'npc_elena', name: '艾蕾娜·斯旺 (Elena Swan)', role: '創辦人之女・吹哨者', x: 3.2, z: 5.5, color: 0x38bdf8, idx: 0,
          lines: [
            '艾蕾娜：「別開槍！我是維克多·斯旺的女兒艾蕾娜……西邊的『員工安全室』沒有怪物，桌上有【青銅海豚徽章】與【霰彈槍】。」',
            '艾蕾娜：「按住【滑鼠右鍵】或【空白鍵】停步雷射瞄準，等準星收束變紅時開火，能造成雙倍爆頭傷害，還能引爆紅色瓦斯桶！」',
          ],
        },
      ],
    },

    staff_save_room: {
      id: 'staff_save_room',
      name: '員工安全室 (SAVE ROOM)',
      zone: '後勤安全區',
      grid: [0, 2],
      w: 14, d: 12,
      floorCol: 0x163832, wallCol: 0x1f4d44,
      visited: false,
      isSaveRoom: true,
      doors: {
        east: { target: 'nova_plaza', spawn: [-9.2, -3.5], lockId: null, lockName: '', unlocked: true, offset: 0 },
      },
      props: [
        { kind: 'save_terminal', x: -4.2, z: -3.8, label: 'CRT 存檔終端機 [保存進度]', interactId: 'save_game', r: 1.0 },
        { kind: 'heal_station', x: 0.0, z: -4.2, label: '戰術醫療補給站 [完全恢復HP]', interactId: 'heal_station', r: 1.1 },
        { kind: 'desk', x: 4.0, z: -3.5, label: '值班工程師長桌', interactId: '', r: 1.1 },
      ],
      hazards: [],
      pickups: [
        { uid: 'p_sav_bronze', kind: 'key_item', itemId: 'bronze_key', name: '【鑰匙】青銅海豚徽章', x: -1.5, z: 1.2, amount: 1, collected: false },
        { uid: 'p_sav_sg', kind: 'weapon', itemId: 'shotgun', name: '【武器】M90 鎮暴霰彈槍', x: 3.0, z: -1.6, amount: 1, collected: false },
        { uid: 'p_sav_sga', kind: 'ammo_shotgun', name: '12號霰彈 x8', x: 4.4, z: 1.5, amount: 8, collected: false },
        { uid: 'p_sav_n3', kind: 'note', name: '員工安全室錄音帶轉譯稿', x: -3.2, z: 2.4, amount: 1, noteId: 'note_03_lounge', collected: false },
        { uid: 'p_sav_up1', kind: 'upgrade', name: '【改裝零件】高精度雷射收束器', x: 2.2, z: 3.4, amount: 1, isSecret: true, collected: false },
      ],
      enemies: [],
      npcs: [],
    },

    dolphinarium: {
      id: 'dolphinarium',
      name: '仿生海豚劇場',
      zone: '西翼海洋館',
      grid: [0, 1],
      w: 22, d: 20,
      floorCol: 0x163048, wallCol: 0x1e4264,
      visited: false,
      isSaveRoom: false,
      doors: {
        south: { target: 'nova_plaza', spawn: [-5.5, -5.0], lockId: null, lockName: '', unlocked: true, offset: 0 },
        north: { target: 'backstage_vip', spawn: [0, 5.2], lockId: null, lockName: '', unlocked: true, offset: 0 },
      },
      props: [
        { kind: 'giant_dolphin', x: 0, z: -2.0, label: '巨型機械海豚『波塞頓號』', interactId: 'examine_giant_dolphin', r: 2.1 },
        { kind: 'organ', x: -6.2, z: -3.5, label: '諧波管風琴控制台 [彈奏四音符謎題]', interactId: 'puzzle_organ', r: 1.2 },
      ],
      hazards: [
        { kind: 'electric_puddle', x: 3.5, z: 1.5, r: 2.1, active: true },
        { kind: 'explosive_barrel', x: -3.5, z: 2.5, r: 1.3, active: true },
      ],
      pickups: [
        { uid: 'p_dol_n4', kind: 'note', name: '仿生海豚調音師的樂譜筆記', x: -5.2, z: 2.2, amount: 1, noteId: 'note_04_dolphin', collected: false },
        { uid: 'p_dol_sga', kind: 'ammo_shotgun', name: '12號霰彈 x6', x: 6.5, z: -2.5, amount: 6, collected: false },
        { uid: 'p_dol_m1', kind: 'medkit', name: '急救噴霧罐', x: 6.8, z: 5.2, amount: 1, collected: false },
      ],
      enemies: [
        { uid: 'e_dol_1', kind: 'coral_hound', name: '深海珊瑚獵犬', x: 4.2, z: -3.5, hp: 35, maxHp: 35, speed: 3.3, dmg: 12, alive: true },
        { uid: 'e_dol_2', kind: 'mascot_brute', name: '失控吉祥物・海豚隊長', x: -2.8, z: 3.8, hp: 85, maxHp: 85, speed: 1.85, dmg: 20, alive: true },
      ],
      npcs: [],
    },

    backstage_vip: {
      id: 'backstage_vip',
      name: '海豚劇場・貴賓後台',
      zone: '西翼海洋館',
      grid: [0, 0],
      w: 16, d: 14,
      floorCol: 0x2c2036, wallCol: 0x402c4d,
      visited: false,
      isSaveRoom: false,
      doors: {
        south: { target: 'dolphinarium', spawn: [0, -7.0], lockId: null, lockName: '', unlocked: true, offset: 0 },
      },
      props: [
        { kind: 'cryo_tank', x: 4.5, z: -3.2, label: '破裂的零號標本培養槽', interactId: '', r: 1.2 },
        { kind: 'oracle', x: -5.2, z: 3.2, label: '星象神諭機 ASTRO-ORACLE', interactId: 'use_oracle', r: 1.0 },
      ],
      hazards: [],
      pickups: [
        { uid: 'p_vip_crank', kind: 'key_item', itemId: 'hydraulic_crank', name: '【工具】液壓搖柄 (Hydraulic Crank)', x: 0, z: -2.5, amount: 1, collected: false },
        { uid: 'p_vip_n5', kind: 'note', name: '1992年貴賓館「零號咬傷事件」報告', x: -3.5, z: -2.0, amount: 1, noteId: 'note_05_VIP_incident', collected: false },
        { uid: 'p_vip_a1', kind: 'ammo_pistol', name: '9mm 手槍彈藥 x15', x: 4.2, z: 2.8, amount: 15, collected: false },
        { uid: 'p_vip_s3', kind: 'secret', name: '【秘密 #3】1992實習生名牌『林克拉拉』', x: 3.5, z: -4.2, amount: 1, isSecret: true, collected: false },
      ],
      enemies: [],
      npcs: [
        {
          uid: 'npc_arthur', name: '陳亞瑟 (Arthur Chen)', role: '超自然現象記者', x: -1.8, z: 2.8, color: 0xfbbf24, idx: 0,
          lines: [
            '陳亞瑟：「兩年前一個叫林克拉拉的14歲女孩在這裡被第一隻怪物咬傷，斯旺為了掩蓋真相才封鎖了整座人工島。」',
            '陳亞瑟：「妳拿走桌上的【液壓搖柄】吧，地下冷卻水道的排水閥門用得上！」',
          ],
        },
      ],
    },

    astro_tomorrow: {
      id: 'astro_tomorrow',
      name: '星際明日世界展館',
      zone: '東翼太空館',
      grid: [2, 2],
      w: 22, d: 20,
      floorCol: 0x241c40, wallCol: 0x3b2d64,
      visited: false,
      isSaveRoom: false,
      doors: {
        west: { target: 'nova_plaza', spawn: [9.0, 0], lockId: null, lockName: '', unlocked: true, offset: 0 },
        north: { target: 'marine_biolab', spawn: [0, 5.8], lockId: null, lockName: '', unlocked: true, offset: 0 },
        south: { target: 'director_suite', spawn: [0, -5.2], lockId: null, lockName: '', unlocked: true, offset: 0 },
      },
      props: [
        { kind: 'arcade', x: 7.2, z: 5.0, label: '太空射擊街機 GALAXY-90', interactId: '', r: 1.0 },
      ],
      hazards: [
        { kind: 'explosive_barrel', x: 0, z: 0.5, r: 1.4, active: true },
        { kind: 'electric_puddle', x: -4.8, z: 2.0, r: 2.0, active: true },
      ],
      pickups: [
        { uid: 'p_ast_n6', kind: 'note', name: '星際明日世界・化學家遺言', x: -6.5, z: -4.5, amount: 1, noteId: 'note_06_astro', collected: false },
        { uid: 'p_ast_sga', kind: 'ammo_shotgun', name: '12號霰彈 x8', x: 6.5, z: -4.5, amount: 8, collected: false },
        { uid: 'p_ast_s4', kind: 'secret', name: '【秘密 #4】復古太空人黃金模型', x: 7.5, z: 3.0, amount: 1, isSecret: true, collected: false },
      ],
      enemies: [
        { uid: 'e_ast_1', kind: 'acid_spitter', name: '迴響體・強酸噴吐者', x: -3.2, z: -1.5, hp: 55, maxHp: 55, speed: 2.1, dmg: 15, alive: true },
        { uid: 'e_ast_2', kind: 'echo_walker', name: '迴響體・太空服漫遊者', x: 4.0, z: 2.5, hp: 50, maxHp: 50, speed: 2.4, dmg: 15, alive: true },
      ],
      npcs: [],
    },

    marine_biolab: {
      id: 'marine_biolab',
      name: '深海生物與時間珊瑚實驗室',
      zone: '東翼太空館',
      grid: [2, 1],
      w: 18, d: 16,
      floorCol: 0x1a363b, wallCol: 0x264e56,
      visited: false,
      isSaveRoom: false,
      doors: {
        south: { target: 'astro_tomorrow', spawn: [0, -7.0], lockId: null, lockName: '', unlocked: true, offset: 0 },
      },
      props: [
        { kind: 'coral_plaque', x: 0, z: -6.6, label: '鈣化時間珊瑚展示櫃 [需深海強酸試劑]', interactId: 'puzzle_melt_coral', r: 1.3 },
        { kind: 'cryo_tank', x: -5.5, z: -2.5, label: '2142年難民遺骸保存槽', interactId: '', r: 1.2 },
        { kind: 'cryo_tank', x: 5.5, z: -2.5, label: '時間珊瑚增殖槽', interactId: '', r: 1.2 },
      ],
      hazards: [],
      pickups: [
        { uid: 'p_bio_acid', kind: 'key_item', itemId: 'acid_vial', name: '【化學品】深海強酸試劑 (Abyssal Acid)', x: -3.5, z: 1.8, amount: 1, collected: false },
        { uid: 'p_bio_n7', kind: 'note', name: '「迴響體」解剖與訊號破譯報告 (2142真相)', x: 3.8, z: 2.2, amount: 1, noteId: 'note_07_biolab', collected: false },
        { uid: 'p_bio_fa', kind: 'ammo_flamer', name: '極光熱熔燃料罐 x50', x: -6.0, z: 4.5, amount: 50, collected: false },
        { uid: 'p_bio_s5', kind: 'secret', name: '【秘密 #5】2142年難民的懷錶殘骸', x: -5.5, z: -4.8, amount: 1, isSecret: true, collected: false },
      ],
      enemies: [
        { uid: 'e_bio_1', kind: 'acid_spitter', name: '迴響體・實驗體零肆號', x: 2.5, z: -1.8, hp: 60, maxHp: 60, speed: 2.2, dmg: 16, alive: true },
      ],
      npcs: [],
    },

    director_suite: {
      id: 'director_suite',
      name: '維克多·斯旺館長私人貴賓室',
      zone: '東翼行政區',
      grid: [2, 3],
      w: 16, d: 14,
      floorCol: 0x3b1d28, wallCol: 0x562838,
      visited: false,
      isSaveRoom: false,
      doors: {
        north: { target: 'astro_tomorrow', spawn: [0, 7.0], lockId: null, lockName: '', unlocked: true, offset: 0 },
      },
      props: [
        { kind: 'safe_vault', x: 5.0, z: -4.4, label: '館長室鈦金保險箱 [4位密碼鎖]', interactId: 'puzzle_safe_2142', r: 1.1 },
        { kind: 'save_terminal', x: -5.0, z: -4.2, label: '館長專用備份終端機 [可存檔]', interactId: 'save_game', r: 1.0 },
      ],
      hazards: [],
      pickups: [
        { uid: 'p_dir_gold', kind: 'key_item', itemId: 'gold_key', name: '【鑰匙】黃金日冕徽章 (Gold Corona Key)', x: 0, z: -1.5, amount: 1, collected: false },
        { uid: 'p_dir_n9', kind: 'note', name: '維克多·斯旺館長私人日記', x: 1.8, z: -2.8, amount: 1, noteId: 'note_09_director', collected: false },
        { uid: 'p_dir_ma', kind: 'ammo_magnum', name: '.44 脈衝麥格農子彈 x6', x: -4.5, z: 3.2, amount: 6, collected: false },
        { uid: 'p_dir_s6', kind: 'secret', name: '【秘密 #6】純逆熵銥金原石樣本', x: 5.2, z: 3.6, amount: 1, isSecret: true, collected: false },
      ],
      enemies: [],
      npcs: [
        {
          uid: 'npc_marcus', name: '馬庫斯·范斯 (Marcus Vance)', role: '企業保全總監', x: -3.2, z: 1.5, color: 0xf87171, idx: 0,
          lines: [
            '馬庫斯：「桌上的【黃金日冕徽章】妳儘管拿去，可以打開中央廣場北門通往地下冷卻水道。」',
            '馬庫斯：「牆角鈦金保險箱裡有【脈衝麥格農 .44】，密碼是未來人毀滅的年份【2142】！」',
          ],
        },
      ],
    },

    coolant_tunnel: {
      id: 'coolant_tunnel',
      name: '地下冷卻水道與三曜祭壇',
      zone: '深海連接層',
      grid: [1, 1],
      w: 20, d: 20,
      floorCol: 0x1e293b, wallCol: 0x334155,
      visited: false,
      isSaveRoom: false,
      doors: {
        south: { target: 'nova_plaza', spawn: [0, -8.2], lockId: null, lockName: '', unlocked: true, offset: 0 },
        north: { target: 'pelagic_core', spawn: [0, 7.8], lockId: 'astral_seal', lockName: '三曜星盤封印大門', unlocked: false, offset: 0 },
      },
      props: [
        { kind: 'valve_wheel', x: -5.2, z: 2.5, label: '主排水液壓閥門 [需液壓搖柄]', interactId: 'puzzle_drain_flood', r: 1.1 },
        { kind: 'astral_pedestal', x: 2.2, z: -7.2, label: '深海三曜星盤祭壇 [需黃金徽章+新月浮雕]', interactId: 'puzzle_astral_gate', r: 1.1 },
        { kind: 'heal_station', x: -6.5, z: -5.5, label: '決戰前緊急醫療補給箱 [恢復HP]', interactId: 'heal_station', r: 1.0 },
      ],
      hazards: [
        { kind: 'electric_puddle', x: 0, z: 0.5, r: 3.6, active: true },
        { kind: 'explosive_barrel', x: 4.5, z: -2.5, r: 1.3, active: true },
      ],
      pickups: [
        { uid: 'p_tun_n8', kind: 'note', name: '地下冷卻水道・工程師手札', x: -6.2, z: 5.8, amount: 1, noteId: 'note_08_maintenance', collected: false },
        { uid: 'p_tun_n11', kind: 'note', name: '深海聖所・三曜星盤銘文', x: 4.5, z: -5.8, amount: 1, noteId: 'note_11_astral', collected: false },
        { uid: 'p_tun_ma', kind: 'ammo_magnum', name: '.44 脈衝麥格農子彈 x6', x: -6.2, z: -2.2, amount: 6, collected: false },
        { uid: 'p_tun_s7', kind: 'secret', name: '【秘密 #7】深海潛水鐘純金銘牌', x: -7.2, z: -7.0, amount: 1, isSecret: true, collected: false },
      ],
      enemies: [
        { uid: 'e_tun_1', kind: 'mascot_brute', name: '重裝吉祥物・深海守衛', x: -3.0, z: -3.5, hp: 95, maxHp: 95, speed: 1.95, dmg: 22, alive: true },
      ],
      npcs: [],
    },

    pelagic_core: {
      id: 'pelagic_core',
      name: '零號時間晶簇核心 (FINAL CHAMBER)',
      zone: '海底三千公尺・時間裂隙',
      grid: [1, 0],
      w: 24, d: 22,
      floorCol: 0x1a142e, wallCol: 0x2e1f4d,
      visited: false,
      isSaveRoom: false,
      doors: {
        south: { target: 'coolant_tunnel', spawn: [0, -7.2], lockId: null, lockName: '', unlocked: true, offset: 0 },
      },
      props: [
        { kind: 'vein_crystal', x: 0, z: -3.5, label: '零號時間晶簇母體 (The Pelagic Vein)', interactId: '', r: 2.3 },
        { kind: 'serum_desk', x: -6.5, z: 5.2, label: '斯旺最終實驗台 [領取逆熵穩定血清・迎來結局]', interactId: 'claim_serum_ending', r: 1.3 },
      ],
      hazards: [
        { kind: 'explosive_barrel', x: -4.8, z: 1.5, r: 1.4, active: true },
        { kind: 'explosive_barrel', x: 4.8, z: 1.5, r: 1.4, active: true },
        { kind: 'explosive_barrel', x: 0.0, z: 3.8, r: 1.4, active: true },
      ],
      pickups: [
        { uid: 'p_cor_n12', kind: 'note', name: '斯旺博士最後實驗記錄', x: -5.2, z: 5.5, amount: 1, noteId: 'note_12_swan_final', collected: false },
        { uid: 'p_cor_m1', kind: 'medkit', name: '急救噴霧罐', x: 7.2, z: 6.2, amount: 1, collected: false },
        { uid: 'p_cor_ma', kind: 'ammo_magnum', name: '.44 脈衝麥格農子彈 x8', x: -7.5, z: -6.0, amount: 8, collected: false },
        { uid: 'p_cor_s8', kind: 'secret', name: '【秘密 #8】2142年時間方舟核心晶片', x: 0, z: -8.2, amount: 1, isSecret: true, collected: false },
      ],
      enemies: [
        { uid: 'boss_swan', kind: 'boss_swan', name: '【最終首領】時空融合體・維克多·斯旺', x: 0, z: -0.5, hp: 320, maxHp: 320, speed: 2.15, dmg: 24, alive: true, phase: 1 },
      ],
      npcs: [],
    },
  };
}
