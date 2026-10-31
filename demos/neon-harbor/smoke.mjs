import puppeteer from 'puppeteer-core';

const URL = 'http://127.0.0.1:8765/neon-harbor/';
const chrome = '/usr/bin/google-chrome';

const errors = [];
const pageErrors = [];

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--window-size=1280,720',
  ],
});

const page = await browser.newPage();
page.setDefaultTimeout(30000);
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') {
    const t = m.text();
    if (/favicon/i.test(t)) return;
    if (t === 'Failed to load resource: the server responded with a status of 404 (File not found)') return;
    errors.push(t);
  }
});
page.on('requestfailed', (r) => {
  const u = r.url();
  if (u.includes('favicon')) return;
  // Soft-missing Multimedia cinematic plates — scaffold keeps playable without them
  if (/\/refs\/env\/env-[^/?#]+\.jpg(?:\?|$)/.test(u)) return;
  errors.push(`REQFAIL ${u} ${r.failure()?.errorText}`);
});

let ok = true;
const results = [];
function check(name, cond, detail = '') {
  results.push({ name, ok: !!cond, detail });
  if (!cond) ok = false;
}

const ALL_MAPS = ['signs','minibus','tonglau','tram','nightstall','neonroof','kaitak','estate','skybridge','watertower','cargo','temple','teahouse','loading','crane','pawnarcade','signcanyon','doubletram','ch7studio','harbourfinal'];

try {
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('#vg-back-tr');
  const backHref = await page.$eval('#vg-back-tr', (a) => a.getAttribute('href'));
  check('vg-back-tr present', !!backHref);
  check('vg-back-tr href', backHref === '/vincent-games-studio/games', backHref);

  const splashPrimary = await page.$eval('#splashPrimary', (el) => el.textContent.trim()).catch(() => '');
  const splashSecondary = await page.$eval('#splashSecondary', (el) => el.textContent.trim()).catch(() => '');
  check('splash primary Translation', splashPrimary === '鏡頭跟住你，港灣開打。', splashPrimary);
  check('splash secondary Translation', splashSecondary === 'Channel 7 開波，今晚收視你話事。', splashSecondary);
  const heroA1 = await page.$eval('#splashHeroA1', (img) => ({ src: img.getAttribute('src'), ok: img.complete && img.naturalWidth > 0 })).catch(() => null);
  const heroB2 = await page.$eval('#splashHeroB2', (img) => ({ src: img.getAttribute('src'), ok: img.complete && img.naturalWidth > 0 })).catch(() => null);
  check('splash hero A1 招牌峽谷', !!(heroA1 && heroA1.ok && /hero\.jpg$/.test(heroA1.src)), JSON.stringify(heroA1));
  check('splash hero B2 天台連橋', !!(heroB2 && heroB2.ok && /hero-roof\.jpg$/.test(heroB2.src)), JSON.stringify(heroB2));
  const ogImg = await page.$eval('meta[property="og:image"]', (m) => m.getAttribute('content')).catch(() => '');
  check('og:image cover.jpg', /\/cover\.jpg$/.test(ogImg || ''), ogImg);

  await page.click('#btnEnter');
  await page.waitForSelector('#panelMode.on');
  const modeSplashP = await page.$eval('#modeSplashPrimary', (el) => el.textContent.trim()).catch(() => '');
  const modeSplashS = await page.$eval('#modeSplashSecondary', (el) => el.textContent.trim()).catch(() => '');
  check('mode splash primary', modeSplashP === '鏡頭跟住你，港灣開打。', modeSplashP);
  check('mode splash secondary', modeSplashS === 'Channel 7 開波，今晚收視你話事。', modeSplashS);
  const modeCount = await page.$$eval('#modeGrid .pick', (els) => els.length);
  check('6 game modes', modeCount === 6, String(modeCount));
  const modeLabels = await page.$$eval('#modeGrid .pick b', (els) => els.map((e) => e.textContent.trim()));
  check('mode label 混戰', modeLabels.includes('混戰'), modeLabels.join('|'));
  check('mode label 團隊死鬥', modeLabels.includes('團隊死鬥'), modeLabels.join('|'));
  check('mode label 據點爭奪', modeLabels.includes('據點爭奪'), modeLabels.join('|'));
  check('mode label 槍階亂鬥', modeLabels.includes('槍階亂鬥'), modeLabels.join('|'));
  check('mode label Boss 狩獵', modeLabels.includes('Boss 狩獵'), modeLabels.join('|'));
  check('mode label Channel 7', modeLabels.includes('Channel 7'), modeLabels.join('|'));
  await page.click('#modeGrid .pick[data-id="ffa"]');
  await page.click('#btnModeNext');
  await page.waitForSelector('#panelMap.on');
  const mapCount = await page.$$eval('#mapGrid .pick', (els) => els.length);
  check('20 maps in picker', mapCount === 20, String(mapCount));
  await page.click('#mapGrid .pick[data-id="cargo"]');
  await page.click('#btnMapNext');
  await page.waitForSelector('#panelClass.on');
  await page.click('#classGrid .pick[data-id="spark"]');
  await page.click('#btnStart');

  await page.waitForFunction(() => typeof window.__dbg === 'function' && window.__dbg().running === true, { timeout: 10000 });
  const beforeReady = await page.evaluate(() => window.__dbg());
  check('running after start', beforeReady.running === true, JSON.stringify(beforeReady));
  check('class spark', beforeReady.className === 'Spark', beforeReady.className);
  check('map cargo', beforeReady.map === 'cargo', beforeReady.map);
  check('mode ffa', beforeReady.gameMode === 'ffa', beforeReady.gameMode);
  check('cameraMode tpp', beforeReady.cameraMode === 'tpp', String(beforeReady.cameraMode));
  check('player hero visible', beforeReady.playerVisible === true, JSON.stringify({ playerVisible: beforeReady.playerVisible }));

  // Wait for atlas densify so unstick does not fire mid-WASD
  await page.waitForFunction(() => {
    const s = window.__envPlateStatus && window.__envPlateStatus('cargo');
    return s && (s.status === 'ready' || s.status === 'missing');
  }, { timeout: 10000 });
  const wasdProbe = await page.evaluate(() => {
    if (typeof window.__forceWasdProbe === 'function') return window.__forceWasdProbe(0.9);
    // fallback: keyboard hold
    if (typeof window.__clearPlayerToCorridor === 'function') window.__clearPlayerToCorridor();
    const before = window.__dbg();
    if (typeof window.__setKey === 'function') { window.__setKey('KeyW', true); window.__setKey('KeyD', true); }
    return { ok: false, d: 0, before: { x: before.x, z: before.z }, after: { x: before.x, z: before.z }, deferred: true };
  });
  check('WASD moves player', !!(wasdProbe && wasdProbe.ok), JSON.stringify(wasdProbe));

  await page.waitForFunction(() => {
    const d = window.__dbg && window.__dbg();
    return d && d.playerBillboard === true;
  }, { timeout: 8000 }).catch(() => {});
  const afterBill = await page.evaluate(() => window.__dbg());
  check('player billboard textured', afterBill.playerBillboard === true, JSON.stringify({ pose: afterBill.playerPose, billboard: afterBill.playerBillboard }));

  // Hard gate: no near-field solid-color Box/Plane/canvas slabs outside cinematicEnv/hero/bots/pickups
  await page.waitForFunction(() => {
    const s = window.__envPlateStatus && window.__envPlateStatus('cargo');
    return s && (s.status === 'ready' || s.status === 'missing');
  }, { timeout: 8000 });
  const audit = await page.evaluate(() => window.__arenaVisualAudit && window.__arenaVisualAudit());
  check('arena audit API', !!audit, JSON.stringify(audit));
  check('no leftover blocky boxes', audit && audit.box === 0, JSON.stringify(audit));
  check('no leftover blocky planes', audit && audit.plane === 0, JSON.stringify(audit));
  check('no leftover canvas signs', audit && audit.canvas === 0, JSON.stringify(audit));
  check('no solid-color box slabs', audit && (audit.solidColorBoxes|0) === 0, JSON.stringify(audit));
  check('no cyan hold rings', audit && (audit.rings|0) === 0, JSON.stringify(audit));
  check('near-FOV solid color count 0', audit && (audit.nearFovSolid|0) === 0, JSON.stringify(audit));
  check('ground not stretched neon photo', audit && audit.groundMappedNeon === false, JSON.stringify(audit));
  check('env-textured cover present', audit && (audit.texturedCover|0) >= 6, JSON.stringify(audit));
  check('collision solids kept', audit && audit.solids > 8, JSON.stringify(audit));

  // signs map — Vincent FAIL screenshot map; near FOV must stay plate-only (no 青環／綠霓虹板／拉伸字)
  await page.evaluate(() => window.__startForTest('signs', 'spark'));
  await page.waitForFunction(() => {
    const d = window.__dbg && window.__dbg();
    const s = window.__envPlateStatus && window.__envPlateStatus('signs');
    return d && d.map === 'signs' && d.running && s && (s.status === 'ready' || s.status === 'missing');
  }, { timeout: 10000 });
  const signsAudit = await page.evaluate(() => window.__arenaVisualAudit && window.__arenaVisualAudit());
  check('signs no blocky boxes', signsAudit && signsAudit.box === 0, JSON.stringify(signsAudit));
  check('signs no solid-color slabs', signsAudit && (signsAudit.solidColorBoxes|0) === 0, JSON.stringify(signsAudit));
  check('signs no canvas lightboxes', signsAudit && signsAudit.canvas === 0, JSON.stringify(signsAudit));
  check('signs no cyan rings/pads', signsAudit && (signsAudit.rings|0) === 0, JSON.stringify(signsAudit));
  check('signs near-FOV solid color count 0', signsAudit && (signsAudit.nearFovSolid|0) === 0, JSON.stringify(signsAudit));
  check('signs ground not stretched neon photo', signsAudit && signsAudit.groundMappedNeon === false, JSON.stringify(signsAudit));
  check('signs env-textured cover present', signsAudit && (signsAudit.texturedCover|0) >= 8, JSON.stringify(signsAudit));
  check('signs collision cover dense', signsAudit && signsAudit.solids > 20, JSON.stringify(signsAudit));
  check('signs atlas wall props', signsAudit && signsAudit.atlasHit && (signsAudit.atlasHit.wall|0) >= 6, JSON.stringify(signsAudit.atlasHit));
  check('signs atlas gate props', signsAudit && signsAudit.atlasHit && (signsAudit.atlasHit.gate|0) >= 4, JSON.stringify(signsAudit.atlasHit));
  check('signs atlas neon strips', signsAudit && signsAudit.atlasHit && (signsAudit.atlasHit.neon|0) >= 4, JSON.stringify(signsAudit.atlasHit));
  check('signs atlas pavement', signsAudit && signsAudit.atlasHit && signsAudit.atlasHit.pavement === true, JSON.stringify(signsAudit.atlasHit));
  check('signs parallax far', signsAudit && signsAudit.atlasHit && signsAudit.atlasHit.far === true, JSON.stringify(signsAudit.atlasHit));
  check('signs parallax near', signsAudit && signsAudit.atlasHit && signsAudit.atlasHit.near === true, JSON.stringify(signsAudit.atlasHit));

  // Pickups must be visible + collectible (最低互動)
  const pickupProbe = await page.evaluate(() => {
    const d = window.__dbg && window.__dbg();
    const before = d && d.pickups;
    // walk onto first alive pickup
    const got = (typeof window.__forcePickupTest === 'function')
      ? window.__forcePickupTest()
      : null;
    const after = window.__dbg && window.__dbg();
    return { before, afterPickups: after && after.pickups, force: got, coins: after && after.coins, armor: after && after.armor, hp: after && after.hp };
  });
  check('pickups spawned', pickupProbe && pickupProbe.before >= 3, JSON.stringify(pickupProbe));
  check('pickup collectable', !!(pickupProbe && pickupProbe.force && pickupProbe.force.ok), JSON.stringify(pickupProbe));

  // NPC must walk/chase — standing still is a bug (Vincent)
  const botMotion = await page.evaluate(() => {
    if (typeof window.__botMotionProbe !== 'function') return { ok: false, reason: 'no-probe' };
    return window.__botMotionProbe(0.9);
  });
  check('bots move/chase', botMotion && botMotion.ok === true, JSON.stringify(botMotion));
  const botVis = await page.evaluate(() => {
    const d = window.__dbg && window.__dbg();
    return { bots: d && d.bots, enemy: d && d.enemyBots, alive: (window.__botMotionProbe && true) };
  });
  check('bots spawned', botVis && botVis.bots >= 4, JSON.stringify(botVis));
  // Wait briefly for chroma billboard textures (bot refs or player fallback)
  await page.waitForFunction(() => {
    const p = window.__botVisualProbe && window.__botVisualProbe();
    return p && p.billboards >= 2;
  }, { timeout: 8000 }).catch(() => {});
  const botLook = await page.evaluate(() => window.__botVisualProbe && window.__botVisualProbe());
  check('bots billboard not navy capsule', !!(botLook && botLook.ok), JSON.stringify(botLook));
  const cityProbe = await page.evaluate(() => {
    let vehicles = 0, npcs = 0, npcMoving = false;
    const root = window.__dbg && true;
    // count via probes
    const vp = (typeof window.__cityPropProbe === 'function') ? window.__cityPropProbe() : null;
    return vp || { vehicles: 0, npcs: 0 };
  });
  check('vehicles collidable present', cityProbe && cityProbe.vehicles >= 3, JSON.stringify(cityProbe));
  check('civilian npcs present', cityProbe && cityProbe.npcs >= 2, JSON.stringify(cityProbe));
  if (cityProbe && cityProbe.npcMoved != null) {
    check('civilian npcs move', cityProbe.npcMoved === true, JSON.stringify(cityProbe));
  }

  const meleeHud = await page.$eval('#meleeHud', (el) => el.textContent.trim()).catch(() => '');
  check('melee HUD 身肉搏 · 拳頭', /^身肉搏 · (拳頭|膝撞|霓虹刀)$/.test(meleeHud), meleeHud);
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV', bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV', bubbles: true }));
  });
  await new Promise((r) => setTimeout(r, 80));
  const meleeHud2 = await page.$eval('#meleeHud', (el) => el.textContent.trim()).catch(() => '');
  check('melee HUD after V', meleeHud2 === '身肉搏 · 拳頭' || meleeHud2 === '身肉搏 · 膝撞' || meleeHud2 === '身肉搏 · 霓虹刀', meleeHud2);

  const hit = await page.evaluate(() => {
    if (typeof window.__forceHitTest === 'function') return window.__forceHitTest();
    return null;
  });
  if (hit) check('hits register on bots', hit.ok === true, JSON.stringify(hit));

  // unique builders table
  const builders = await page.evaluate(() => window.__mapBuilders());
  const vals = Object.values(builders);
  check('20 builder entries', vals.length === 20, String(vals.length));
  check('builders all unique fn names', new Set(vals).size === 20, vals.join(','));

  // cinematic env plate scaffold (soft-missing ok)
  const envApi = await page.evaluate(() => window.__envPlateStatus && window.__envPlateStatus('cargo'));
  check('env plate API present', !!envApi, JSON.stringify(envApi));
  check('env plate url pattern', !!(envApi && envApi.url && /env-cargo\.jpg$/.test(envApi.url)), JSON.stringify(envApi));
  check('env plate ids 20', !!(envApi && Array.isArray(envApi.envMapIds) && envApi.envMapIds.length === 20), JSON.stringify(envApi && envApi.envMapIds));
  await page.evaluate(() => window.__startForTest('cargo', 'spark'));
  await page.waitForFunction(() => {
    const s = window.__envPlateStatus && window.__envPlateStatus('cargo');
    return s && (s.status === 'ready' || s.status === 'missing');
  }, { timeout: 8000 });
  const envAfter = await page.evaluate(() => window.__envPlateStatus('cargo'));
  check('env plate resolves ready|missing', envAfter && (envAfter.status === 'ready' || envAfter.status === 'missing'), JSON.stringify(envAfter));

  // Wire-first smoke for env plates already on disk (Multimedia drop)
  // All 20 Multimedia cinematic env plates must resolve ready
  const PRESENT_ENV = ALL_MAPS.slice();
  for (const mid of PRESENT_ENV) {
    await page.evaluate((id) => window.__startForTest(id, 'spark'), mid);
    await page.waitForFunction((id) => {
      const s = window.__envPlateStatus && window.__envPlateStatus(id);
      return window.__dbg().map === id && window.__dbg().running && s && (s.status === 'ready' || s.status === 'missing');
    }, { timeout: 10000 }, mid);
    const st = await page.evaluate((id) => window.__envPlateStatus(id), mid);
    check(`${mid} env plate ready`, st && st.status === 'ready', JSON.stringify(st));
  }

  // every map boots + moves
  for (const mid of ALL_MAPS) {
    await page.evaluate((id) => window.__startForTest(id, 'spark'), mid);
    await page.waitForFunction((id) => window.__dbg().map === id && window.__dbg().running, { timeout: 10000 }, mid);
    const m0 = await page.evaluate(() => window.__dbg());
    check(`${mid} map switch`, m0.map === mid, JSON.stringify(m0));
    let movedOk = false;
    let m1 = m0;
    for (const code of ['KeyW', 'KeyS', 'KeyA', 'KeyD']) {
      await page.evaluate((c) => window.dispatchEvent(new KeyboardEvent('keydown', { code: c, bubbles: true })), code);
      await new Promise((r) => setTimeout(r, 260));
      await page.evaluate((c) => window.dispatchEvent(new KeyboardEvent('keyup', { code: c, bubbles: true })), code);
      m1 = await page.evaluate(() => window.__dbg());
      if (Math.hypot(m1.x - m0.x, m1.z - m0.z) > 0.12) { movedOk = true; break; }
    }
    check(`${mid} WASD move`, movedOk, `${m0.x},${m0.z} -> ${m1.x},${m1.z}`);
    check(`${mid} has pickups`, m0.pickups > 0, String(m0.pickups));
  }

  // campaign level 1 + boss level 3
  const camp1 = await page.evaluate(() => window.__startCampaignTest(1, 'spark'));
  await page.waitForFunction(() => window.__dbg().gameMode === 'campaign' && window.__dbg().running, { timeout: 8000 });
  const c1 = await page.evaluate(() => window.__dbg());
  check('campaign L1 mode', c1.gameMode === 'campaign', JSON.stringify(c1));
  check('campaign L1 map signs', c1.map === 'signs', c1.map);
  check('campaign L1 level', c1.campaignLevel === 1, String(c1.campaignLevel));
  check('campaign L1 kill obj', c1.objective && c1.objective.type === 'kill' && c1.objective.target === 10, JSON.stringify(c1.objective));

  // Channel 7 transition plate (Multimedia 20/20)
  const transUrl = await page.evaluate(() => window.__transPlateUrl && window.__transPlateUrl('tonglau'));
  check('trans url tonglau', typeof transUrl === 'string' && /trans-tonglau\.jpg$/.test(transUrl), String(transUrl));
  const transOk = await page.evaluate(() => window.__showTransitionTest && window.__showTransitionTest(3));
  await page.waitForSelector('#transition.on', { timeout: 5000 });
  const transCopy = await page.evaluate(() => ({
    on: !!document.getElementById('transition')?.classList.contains('on'),
    level: document.getElementById('transLevel')?.textContent.trim(),
    next: document.getElementById('transNext')?.textContent.trim(),
    hint: document.getElementById('transHint')?.textContent.trim(),
    boss: document.getElementById('transBoss')?.textContent.trim(),
    src: document.getElementById('transPlate')?.getAttribute('src') || '',
  }));
  check('transition panel on', transCopy.on === true, JSON.stringify(transCopy));
  check('transition level copy', transCopy.level === '過場 · 第 3 關', transCopy.level);
  check('transition next copy', /下一站——/.test(transCopy.next || ''), transCopy.next);
  check('transition hint', transCopy.hint === 'Channel 7 轉場中…', transCopy.hint);
  check('transition boss hook', /鐵閘阿爺/.test(transCopy.boss || ''), transCopy.boss);
  check('transition plate src', /trans-tonglau\.jpg/.test(transCopy.src || ''), transCopy.src);
  // dismiss via continue so later tests aren't blocked
  await page.click('#btnTransContinue');
  await page.waitForFunction(() => !document.getElementById('transition')?.classList.contains('on'), { timeout: 5000 });
  await page.waitForFunction(() => window.__dbg().campaignLevel === 3 && window.__dbg().running, { timeout: 10000 });

  const camp3 = await page.evaluate(() => window.__startCampaignTest(3, 'rock'));
  await page.waitForFunction(() => window.__dbg().campaignLevel === 3 && window.__dbg().running, { timeout: 8000 });
  const c3 = await page.evaluate(() => window.__dbg());
  check('campaign L3 map tonglau', c3.map === 'tonglau', c3.map);
  check('campaign L3 has boss', c3.bosses >= 1, String(c3.bosses));

  const camp20 = await page.evaluate(() => window.__startCampaignTest(20, 'falcon'));
  await page.waitForFunction(() => window.__dbg().campaignLevel === 20 && window.__dbg().running, { timeout: 8000 });
  const c20 = await page.evaluate(() => window.__dbg());
  check('campaign L20 harbourfinal', c20.map === 'harbourfinal', c20.map);
  check('campaign L20 kill40', c20.objective && c20.objective.target === 40, JSON.stringify(c20.objective));

  // hold mode
  const hold = await page.evaluate(() => window.__startHoldTest('cargo', 'shade'));
  await page.waitForFunction(() => window.__dbg().gameMode === 'hold' && window.__dbg().running, { timeout: 8000 });
  const h0 = await page.evaluate(() => window.__dbg());
  check('hold mode', h0.gameMode === 'hold', h0.gameMode);
  check('hold objective', h0.objective && h0.objective.type === 'hold', JSON.stringify(h0.objective));

  // lexicon locked names
  const lex = await page.evaluate(() => window.__lexicon());
  check('lexicon splash primary', lex.splash && lex.splash.primary === '鏡頭跟住你，港灣開打。', JSON.stringify(lex.splash));
  check('lexicon splash secondary', lex.splash && lex.splash.secondary === 'Channel 7 開波，今晚收視你話事。', JSON.stringify(lex.splash));
  check('lexicon melee hud labels', !!(lex.melee && lex.melee.hud === '身肉搏' && lex.melee.fist === '拳頭' && lex.melee.knee === '膝撞' && lex.melee.knife === '霓虹刀'), JSON.stringify(lex.melee));
  check('lexicon transition copy', !!(lex.transition && lex.transition.hint === 'Channel 7 轉場中…'), JSON.stringify(lex.transition));
  check('lexicon modes 5+campaign', lex.modes.length === 6, JSON.stringify(lex.modes));
  check('lexicon ladder 8 guns', lex.ladder.length === 8, lex.ladder.join('|'));
  check('lexicon has 港灣AR', lex.ladder.includes('港灣AR'), lex.ladder.join('|'));
  check('lexicon has 霓虹刀', lex.ladder.includes('霓虹刀'), lex.ladder.join('|'));
  check('lexicon has 貨櫃火箭', lex.ladder.includes('貨櫃火箭'), lex.ladder.join('|'));
  check('lexicon bosses 8', lex.bosses.length === 8, JSON.stringify(lex.bosses));
  check('lexicon has 製片人', lex.bosses.some((b) => b.id === 'producer' && b.nameZh === '製片人'), JSON.stringify(lex.bosses));
  check('lexicon has 收視魔王', lex.bosses.some((b) => b.id === 'ratings' && b.nameZh === '收視魔王'), JSON.stringify(lex.bosses));
  check('lexicon has 吊機鐵臂', lex.bosses.some((b) => b.id === 'cranearm'), JSON.stringify(lex.bosses));
  check('lexicon has 峽谷鬼牌', lex.bosses.some((b) => b.id === 'canyon'), JSON.stringify(lex.bosses));
  check('lexicon all 8 boss art', lex.bosses.length === 8 && lex.bosses.every((b) => typeof b.art === 'string' && b.art.includes('refs/ui/boss-')), JSON.stringify(lex.bosses.map((b) => [b.id, b.art])));
  check('ui weapons sheet', lex.sheets && lex.sheets.weapons.includes('weapons-sheet'), JSON.stringify(lex.sheets));
  check('campaign boss table', JSON.stringify(lex.campaignBosses) === JSON.stringify([
    {level:3,bossId:'gate',nameZh:'鐵閘阿爺'},{level:6,bossId:'sign',nameZh:'招牌鬼手'},{level:9,bossId:'tower',nameZh:'天台水塔怪'},{level:12,bossId:'cargo',nameZh:'貨櫃鐵甲'},{level:15,bossId:'cranearm',nameZh:'吊機鐵臂'},{level:17,bossId:'canyon',nameZh:'峽谷鬼牌'},{level:19,bossId:'producer',nameZh:'製片人'},{level:20,bossId:'ratings',nameZh:'收視魔王'}
  ]), JSON.stringify(lex.campaignBosses));
  check('lexicon pickup lines', lex.pickups.join('|') === '取得彈藥箱|取得護甲片|取得醫療包|取得速度飲料|取得金幣', lex.pickups.join('|'));

  // TDM
  const tdm = await page.evaluate(() => window.__startTdmTest('cargo', 'spark'));
  await page.waitForFunction(() => window.__dbg().gameMode === 'tdm' && window.__dbg().running, { timeout: 8000 });
  const t0 = await page.evaluate(() => window.__dbg());
  check('tdm mode', t0.gameMode === 'tdm', t0.gameMode);
  check('tdm objective', t0.objective && t0.objective.type === 'tdm', JSON.stringify(t0.objective));
  check('tdm has allies', t0.allyBots >= 1, String(t0.allyBots));
  check('tdm has enemies', t0.enemyBots >= 1, String(t0.enemyBots));

  // Gun Game
  const gg = await page.evaluate(() => window.__startGunGameTest('temple', 'shade'));
  await page.waitForFunction(() => window.__dbg().gameMode === 'gungame' && window.__dbg().running, { timeout: 8000 });
  const g0 = await page.evaluate(() => window.__dbg());
  check('gungame mode', g0.gameMode === 'gungame', g0.gameMode);
  check('gungame obj', g0.objective && g0.objective.type === 'gungame', JSON.stringify(g0.objective));
  check('gungame starts rung 0', g0.gunIndex === 0, String(g0.gunIndex));
  check('gungame weaponOverride revolver', g0.weaponOverride === 'revolver', String(g0.weaponOverride));

  // Boss Hunt
  const bh = await page.evaluate(() => window.__startBossHuntTest('harbourfinal', 'rock', 'producer'));
  await page.waitForFunction(() => window.__dbg().gameMode === 'bosshunt' && window.__dbg().running, { timeout: 8000 });
  const b0 = await page.evaluate(() => window.__dbg());
  check('bosshunt mode', b0.gameMode === 'bosshunt', b0.gameMode);
  check('bosshunt has boss', b0.bosses >= 1, String(b0.bosses));
  check('bosshunt 製片人', b0.bossName === '製片人', String(b0.bossName));

  // campaign L19 製片人 / L20 收視魔王
  await page.evaluate(() => window.__startCampaignTest(19, 'falcon'));
  await page.waitForFunction(() => window.__dbg().campaignLevel === 19 && window.__dbg().running, { timeout: 8000 });
  const c19 = await page.evaluate(() => window.__dbg());
  check('campaign L19 boss 製片人', c19.bossName === '製片人', String(c19.bossName));

  const campFin = await page.evaluate(() => window.__startCampaignTest(20, 'falcon'));
  await page.waitForFunction(() => window.__dbg().campaignLevel === 20 && window.__dbg().running, { timeout: 8000 });
  const cf = await page.evaluate(() => window.__dbg());
  check('campaign L20 boss 收視魔王', cf.bossName === '收視魔王', String(cf.bossName));

  // campaign L3 鐵閘阿爺 / L12 貨櫃鐵甲 / L15 吊機鐵臂
  await page.evaluate(() => window.__startCampaignTest(3, 'spark'));
  await page.waitForFunction(() => window.__dbg().campaignLevel === 3 && window.__dbg().running, { timeout: 8000 });
  const c3b = await page.evaluate(() => window.__dbg());
  check('campaign L3 boss 鐵閘阿爺', c3b.bossName === '鐵閘阿爺', String(c3b.bossName));

  await page.evaluate(() => window.__startCampaignTest(12, 'rock'));
  await page.waitForFunction(() => window.__dbg().campaignLevel === 12 && window.__dbg().running, { timeout: 8000 });
  const c12 = await page.evaluate(() => window.__dbg());
  check('campaign L12 boss 貨櫃鐵甲', c12.bossName === '貨櫃鐵甲', String(c12.bossName));

  await page.evaluate(() => window.__startCampaignTest(15, 'shade'));
  await page.waitForFunction(() => window.__dbg().campaignLevel === 15 && window.__dbg().running, { timeout: 8000 });
  const c15 = await page.evaluate(() => window.__dbg());
  check('campaign L15 boss 吊機鐵臂', c15.bossName === '吊機鐵臂', String(c15.bossName));

  check('no pageerror', pageErrors.length === 0, pageErrors.join(' | '));
  const critical = errors.filter((e) => !/favicon/i.test(e));
  check('no critical console/net errors', critical.length === 0, critical.join(' | '));

  await page.screenshot({ path: '/tmp/pp-smoke/neon-harbor-smoke.png' }).catch(() => {});
} catch (e) {
  ok = false;
  results.push({ name: 'exception', ok: false, detail: String(e.stack || e) });
}

await browser.close();
console.log(JSON.stringify({ ok, results, pageErrors, errors }, null, 2));
process.exit(ok ? 0 : 1);
