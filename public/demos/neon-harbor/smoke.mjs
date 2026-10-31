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

  await page.click('#btnEnter');
  await page.waitForSelector('#panelMode.on');
  const modeCount = await page.$$eval('#modeGrid .pick', (els) => els.length);
  check('3 game modes', modeCount === 3, String(modeCount));
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
  const before = await page.evaluate(() => window.__dbg());
  check('running after start', before.running === true, JSON.stringify(before));
  check('class spark', before.className === 'Spark', before.className);
  check('map cargo', before.map === 'cargo', before.map);
  check('mode ffa', before.gameMode === 'ffa', before.gameMode);

  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', bubbles: true }));
  });
  await new Promise((r) => setTimeout(r, 450));
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD', bubbles: true }));
  });
  const afterMove = await page.evaluate(() => window.__dbg());
  const moved = Math.hypot(afterMove.x - before.x, afterMove.z - before.z) > 0.2;
  check('WASD moves player', moved, `before=${before.x},${before.z} after=${afterMove.x},${afterMove.z}`);

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
