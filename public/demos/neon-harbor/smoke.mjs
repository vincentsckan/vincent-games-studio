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
page.setDefaultTimeout(20000);
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') {
    const t = m.text();
    if (/favicon/i.test(t)) return;
    // Chrome logs generic 404 text without URL sometimes — ignore lone favicon noise after navigation
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

try {
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('#vg-back-tr');
  const backHref = await page.$eval('#vg-back-tr', (a) => a.getAttribute('href'));
  check('vg-back-tr present', !!backHref);
  check('vg-back-tr href', backHref === '/vincent-games-studio/games', backHref);

  await page.click('#btnEnter');
  await page.waitForSelector('#panelMap.on');
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

  // Force kill: teleport onto bot and fire hitscan via Falcon one-shots
  const killResult = await page.evaluate(async () => {
    window.__startForTest('cargo', 'falcon');
    await new Promise((r) => setTimeout(r, 100));
    // find first bot via dbg + internal: expose temp
    const bots = window.__botsForTest;
    // Use internal hook if present; else brute by shooting many directions
    // Place player and aim - we'll set state via __forceKillTest
    if (typeof window.__forceHitTest === 'function') {
      return window.__forceHitTest();
    }
    // fallback: spray
    for (let i = 0; i < 40; i++) {
      window.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
      await new Promise((r) => setTimeout(r, 50));
      window.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true }));
    }
    return window.__dbg();
  });

  // Prefer dedicated hit test
  const hit = await page.evaluate(() => {
    if (typeof window.__forceHitTest === 'function') return window.__forceHitTest();
    return null;
  });
  if (hit) {
    check('hits register on bots', hit.ok === true, JSON.stringify(hit));
  } else {
    // soft: at least ammo decreased from shooting
    const ammoOk = killResult && typeof killResult.ammo === 'number' && killResult.ammo < 5;
    check('shooting consumes ammo', ammoOk, JSON.stringify(killResult));
  }

  await page.evaluate(() => window.__startForTest('temple', 'shade'));
  await page.waitForFunction(() => window.__dbg().map === 'temple' && window.__dbg().running, { timeout: 5000 });
  const temple = await page.evaluate(() => window.__dbg());
  check('temple map switch', temple.map === 'temple', JSON.stringify(temple));
  check('shade class', temple.className === 'Shade', temple.className);

  const t0 = await page.evaluate(() => window.__dbg());
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', bubbles: true })));
  await new Promise((r) => setTimeout(r, 350));
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', bubbles: true })));
  const t1 = await page.evaluate(() => window.__dbg());
  check('temple WASD move', Math.hypot(t1.x - t0.x, t1.z - t0.z) > 0.15, `${t0.x},${t0.z} -> ${t1.x},${t1.z}`);

  // Nostalgic maps: signs / estate / teahouse — start + brief WASD
  for (const mid of ['signs', 'estate', 'teahouse']) {
    await page.evaluate((id) => window.__startForTest(id, 'spark'), mid);
    await page.waitForFunction((id) => window.__dbg().map === id && window.__dbg().running, mid, { timeout: 5000 });
    const m0 = await page.evaluate(() => window.__dbg());
    check(`${mid} map switch`, m0.map === mid, JSON.stringify(m0));
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', bubbles: true })));
    await new Promise((r) => setTimeout(r, 350));
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', bubbles: true })));
    const m1 = await page.evaluate(() => window.__dbg());
    check(`${mid} WASD move`, Math.hypot(m1.x - m0.x, m1.z - m0.z) > 0.15, `${m0.x},${m0.z} -> ${m1.x},${m1.z}`);
  }

  await page.click('#c').catch(() => {});

  check('no pageerror', pageErrors.length === 0, pageErrors.join(' | '));
  const critical = errors.filter((e) => !/favicon/i.test(e));
  check('no critical console/net errors', critical.length === 0, critical.join(' | '));

  await page.screenshot({ path: '/tmp/pp-smoke/neon-harbor-smoke.png' });
} catch (e) {
  ok = false;
  results.push({ name: 'exception', ok: false, detail: String(e.stack || e) });
}

await browser.close();
console.log(JSON.stringify({ ok, results, pageErrors, errors }, null, 2));
process.exit(ok ? 0 : 1);
