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

  // Exit via back link exists (don't navigate away mid-test)
  check('can exit via catalog link', backHref === '/vincent-games-studio/games');

} catch (e) {
  ok = false;
  results.push({ name: 'uncaught', ok: false, detail: String(e && e.stack || e) });
}

console.log(JSON.stringify({ ok, results, errors, pageErrors }, null, 2));
await browser.close();
process.exit(ok && errors.length === 0 && pageErrors.length === 0 ? 0 : 1);
