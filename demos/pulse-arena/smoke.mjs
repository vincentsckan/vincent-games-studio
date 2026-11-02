import puppeteer from 'puppeteer-core';

const URL = process.env.PULSE_URL || 'http://127.0.0.1:8766/pulse-arena/';
const chrome = process.env.CHROME || '/usr/bin/google-chrome';

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
    if (/status of 404/i.test(t)) return; // soft-missing optional assets
    errors.push(t);
  }
});
page.on('requestfailed', (r) => {
  const u = r.url();
  if (u.includes('favicon')) return;
  if (/\/refs\//.test(u)) return;
  errors.push(`REQFAIL ${u} ${r.failure()?.errorText}`);
});

let ok = true;
const results = [];
function check(name, cond, detail = '') {
  results.push({ name, ok: !!cond, detail });
  if (!cond) ok = false;
}

try {
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('#vg-back-tr');
  const backHref = await page.$eval('#vg-back-tr', (a) => a.getAttribute('href'));
  check('vg-back-tr present', !!backHref);
  check('vg-back-tr href', backHref === '/vincent-games-studio/games', backHref);

  const story = await page.$eval('#lobbyStory', (el) => el.textContent.trim());
  check('lobby story zh stub', /脈衝|競技場|故事草稿/.test(story), story.slice(0, 80));

  await page.click('#btnStart');
  await page.waitForFunction(() => typeof window.__dbg === 'function' && window.__dbg().running === true, { timeout: 10000 });
  const started = await page.evaluate(() => window.__dbg());
  check('running after start', started.running === true, JSON.stringify(started));
  check('bots spawned >=3', started.botCount >= 3, String(started.botCount));

  // Multimedia textured assets (chroma viewmodels / bot skins / arena mats)
  await page.waitForFunction(() => {
    const d = window.__dbg();
    return d && d.mmReady === true && d.mmWeapons >= 5 && d.mmBotSkins >= 4 && d.mmMats >= 6;
  }, { timeout: 15000 }).catch(() => {});
  const mm = await page.evaluate(() => window.__dbg());
  check('multimedia ready', mm.mmReady === true, JSON.stringify({ mmReady: mm.mmReady, mmWeapons: mm.mmWeapons, mmBotSkins: mm.mmBotSkins, mmMats: mm.mmMats }));
  check('5 weapon viewmodels', mm.mmWeapons >= 5, String(mm.mmWeapons));
  check('4 bot skins', mm.mmBotSkins >= 4, String(mm.mmBotSkins));
  check('arena materials', mm.mmMats >= 6, String(mm.mmMats));
  check('camera in scene', mm.cameraInScene === true, JSON.stringify({ cameraInScene: mm.cameraInScene }));
  check('viewmodel arms visible', mm.armsVisible === true && mm.armsChildCount >= 2, JSON.stringify({ armsVisible: mm.armsVisible, armsChildCount: mm.armsChildCount, viewmodelGun: mm.viewmodelGun }));
  check('weapon viewmesh present', mm.viewmodelGun >= 1, String(mm.viewmodelGun));
  check('spawn clear of geometry', mm.spawnClear === true, JSON.stringify({ x: mm.x, z: mm.z, spawnClear: mm.spawnClear }));

  // Cycle all 5 weapons — each must keep arms + gun mesh
  const vmCycle = await page.evaluate(() => {
    const out = [];
    for (let i = 0; i < 5; i++) {
      window.__switchWeapon(i);
      const d = window.__dbg();
      out.push({
        weapon: d.weapon,
        armsVisible: d.armsVisible,
        armsChildCount: d.armsChildCount,
        viewmodelGun: d.viewmodelGun,
      });
    }
    window.__switchWeapon(0);
    return out;
  });
  check(
    'all 5 weapons have viewmodel',
    vmCycle.length === 5 && vmCycle.every((v) => v.armsVisible && v.viewmodelGun >= 1),
    JSON.stringify(vmCycle),
  );

  const wasd = await page.evaluate(() => window.__forceWasdProbe(0.7));
  check('WASD moves player', !!(wasd && wasd.ok), JSON.stringify(wasd));

  const jump = await page.evaluate(() => window.__forceJumpProbe());
  check('jump works', !!(jump && jump.ok), JSON.stringify(jump));

  // land before slide probe
  await page.waitForFunction(() => {
    const d = window.__dbg();
    return d && d.onGround === true;
  }, { timeout: 3000 }).catch(() => {});
  await page.evaluate(() => { window.__setKey('Space', false); });

  const slide = await page.evaluate(() => window.__forceSlideProbe());
  check('slide works', !!(slide && slide.ok), JSON.stringify(slide));

  // Hard FAIL: sprint/slide must not embed into outer fence / diamond wall
  const wall = await page.evaluate(() => window.__forceWallEmbedProbe());
  check(
    'no fence/wall embed on sprint+slide',
    !!(wall && wall.ok),
    JSON.stringify(wall),
  );
  const eyeClear = await page.evaluate(() => {
    const d = window.__dbg();
    return { eyeInSolid: d.eyeInSolid, x: d.x, z: d.z, y: d.y };
  });
  check('eye outside solids after wall probe', eyeClear.eyeInSolid === false, JSON.stringify(eyeClear));

  const weapons = await page.evaluate(async () => {
    const ids = [];
    for (let i = 0; i < 5; i++) {
      window.__switchWeapon(i);
      ids.push(window.__dbg().weapon);
    }
    return ids;
  });
  check('5 weapons switchable', weapons.length === 5 && new Set(weapons).size === 5, weapons.join(','));
  check('includes melee knife', weapons.includes('knife'), weapons.join(','));
  check('includes ar+pistol+sniper', weapons.includes('ar') && weapons.includes('pistol') && weapons.includes('sniper'), weapons.join(','));
  check('includes shotgun', weapons.includes('shotgun'), weapons.join(','));

  const switchGate = await page.evaluate(() => {
    const t0 = performance.now();
    window.__switchWeapon(0);
    // spend some AR ammo
    const d0 = window.__dbg();
    const bags0 = window.__weaponBags();
    window.__dbg(); // ensure hooks live
    // mutate via shooting hooks if present; else poke ammo then switch away/back
    const st = window.__dbg();
    // force bag persistence: switch to pistol, then back — bags API must exist
    window.__switchWeapon(1);
    const mid = window.__dbg();
    window.__switchWeapon(0);
    const back = window.__dbg();
    const t1 = performance.now();
    return {
      ms: t1 - t0,
      expand: mid.mmExpand || back.mmExpand,
      ver: back.mmVer,
      scene: back.mmScene,
      hasBags: typeof window.__weaponBags === 'function',
      backWeapon: back.weapon,
      midWeapon: mid.weapon,
      strip: !!(document.getElementById('weapStrip') && document.getElementById('weapStrip').children.length >= 5),
    };
  });
  check('instant switch < 50ms for 0→1→0', switchGate.ms < 50, JSON.stringify(switchGate));
  check('MM_EXPAND weaponswitch', switchGate.expand === 'expand-v1-weaponswitch', JSON.stringify(switchGate));
  check('MM_VER mm5 preserved', switchGate.ver === 'mm5', JSON.stringify(switchGate));
  check('MM_SCENE mm6-realism preserved', switchGate.scene === 'mm6-realism', JSON.stringify(switchGate));
  check('weapon strip HUD', switchGate.strip === true, JSON.stringify(switchGate));
  check('weapon bags hook', switchGate.hasBags === true, JSON.stringify(switchGate));

  // Shoot + kill bot
  await page.evaluate(() => {
    window.__switchWeapon(0);
    // place a bot in front via kill helper
  });
  const kill = await page.evaluate(() => window.__killNearestBot());
  check('kill bot scores', !!(kill && kill.ok && kill.kills >= 1), JSON.stringify(kill));

  const afterKill = await page.evaluate(() => window.__dbg());
  check('scoreboard kills updated', afterKill.kills >= 1, JSON.stringify(afterKill));

  // Tab scoreboard
  await page.keyboard.down('Tab');
  await page.waitForSelector('#scoreboard.on');
  const sbRows = await page.$$eval('#sbBody tr', (els) => els.length);
  check('Tab scoreboard rows', sbRows >= 2, String(sbRows));
  await page.keyboard.up('Tab');


  // —— expand-v1: multi-map, archetypes, pickups, boss, sfx ——
  const mapsDbg = await page.evaluate(() => window.__dbg());
  check('multi-level maps >=7', mapsDbg.mapCount >= 7, JSON.stringify(mapsDbg.maps));
  check('maps include yard+containers+oasis', Array.isArray(mapsDbg.maps) && mapsDbg.maps.includes('yard') && mapsDbg.maps.includes('containers') && mapsDbg.maps.includes('oasis'), JSON.stringify(mapsDbg.maps));
  check('maps include platforms+neon-alley+dunes+coliseum', mapsDbg.maps?.includes('platforms') && mapsDbg.maps?.includes('neon-alley') && mapsDbg.maps?.includes('dunes') && mapsDbg.maps?.includes('pulse-coliseum'), JSON.stringify(mapsDbg.maps));

  const switched = await page.evaluate(async () => window.__loadMap('containers'));
  check('switch map containers', !!(switched && switched.ok && switched.mapId === 'containers'), JSON.stringify(switched));
  const afterMap = await page.evaluate(() => window.__dbg());
  check('containers bots spawned', afterMap.botCount >= 4, String(afterMap.botCount));
  check('new archetype E+ present', afterMap.hasNewArchetype === true, JSON.stringify(afterMap.botTags));
  check('pickups spawned', afterMap.pickupCount >= 4, String(afterMap.pickupCount));

  // fence regression still on yard
  await page.evaluate(async () => window.__loadMap('yard'));
  const wall2 = await page.evaluate(() => window.__forceWallEmbedProbe());
  check('yard fence sky-clear after expand', !!(wall2 && wall2.ok), JSON.stringify(wall2));

  const grab = await page.evaluate(() => {
    // ensure pickups on yard
    return window.__grabNearestPickup();
  });
  check('pickup grab works', !!(grab && grab.ok), JSON.stringify(grab));

  // boss spawn smoke on coliseum
  const bossMap = await page.evaluate(async () => window.__loadMap('pulse-coliseum'));
  check('coliseum loads', !!(bossMap && bossMap.ok), JSON.stringify(bossMap));
  const bossSpawn = await page.evaluate(() => {
    const d = window.__dbg();
    if (d.bossAlive) return { ok: true, via: 'map', bossId: d.bossId, hp: d.bossHp };
    return window.__spawnBossNow('Boss_ContainerTitan');
  });
  check('boss spawn', !!(bossSpawn && bossSpawn.ok), JSON.stringify(bossSpawn));
  const bossDmg = await page.evaluate(() => window.__damageBoss(250));
  check('boss takes damage', !!(bossDmg && bossDmg.ok && bossDmg.hp < 1200), JSON.stringify(bossDmg));

  // SFX hooks — buffers may or may not be decoded in headless; ensure API present
  const sfx = await page.evaluate(() => {
    const d = window.__dbg();
    return { enableSfx: d.enableSfx, sfxReady: d.sfxReady, keys: d.sfxBuffers };
  });
  check('SFX enabled flag', sfx.enableSfx === true, JSON.stringify(sfx));

  // Exit via back link exists (don't navigate away mid-test)
  check('can exit via catalog link', backHref === '/vincent-games-studio/games');

} catch (e) {
  ok = false;
  results.push({ name: 'uncaught', ok: false, detail: String(e && e.stack || e) });
}

console.log(JSON.stringify({ ok, results, errors, pageErrors }, null, 2));
await browser.close();
process.exit(ok && errors.length === 0 && pageErrors.length === 0 ? 0 : 1);
