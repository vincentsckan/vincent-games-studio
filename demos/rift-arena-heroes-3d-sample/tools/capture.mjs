import { chromium } from "playwright";
import { createHash } from "node:crypto";
import { readFileSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outDir = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts/rift-heroes-3d";
mkdirSync(outDir, { recursive: true });

const heroes = ["pofeng", "xianming", "dingchao"];
const sides = ["p1", "p2"];
const angles = ["front", "back", "left", "right", "threeq"];

const server = spawn("python3", ["-m", "http.server", "5174", "--bind", "127.0.0.1"], {
  cwd: root,
  stdio: "ignore",
});

function hashFile(file) {
  const digest = createHash("sha256").update(readFileSync(file)).digest("hex");
  console.log(`${digest}  ${path.basename(file)}`);
  return digest;
}

try {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on("pageerror", (error) => console.error("PAGE", error.message));

  for (const hero of heroes) {
    for (const side of sides) {
      for (const angle of angles) {
        const url = `http://127.0.0.1:5174/?shot=${hero}&side=${side}&angle=${angle}`;
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => window.__SHOT_READY === true, null, { timeout: 90000 });
        await page.waitForTimeout(400);
        const fileName = angle === "threeq" ? "three-quarter" : angle;
        const file = path.join(outDir, `rift-${hero}-${side}-${fileName}.png`);
        await page.screenshot({ path: file });
        hashFile(file);
      }
    }
  }

  const videoDir = path.join(outDir, "video-tmp");
  mkdirSync(videoDir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
  });
  const live = await context.newPage();
  await live.goto("http://127.0.0.1:5174/", { waitUntil: "domcontentloaded" });
  await live.waitForFunction(() => window.__SAMPLE_READY === true, null, { timeout: 90000 });
  await live.click("#view");
  const hold = async (code, ms) => {
    await live.keyboard.down(code);
    await live.waitForTimeout(ms);
    await live.keyboard.up(code);
  };
  const show = async (name) => {
    await live.click(`button:has-text("${name}")`);
    await live.waitForTimeout(450);
  };
  await hold("KeyW", 900);
  await hold("KeyD", 700);
  await hold("KeyS", 500);
  await show("弦鳴");
  await hold("KeyW", 700);
  await show("P2");
  await hold("KeyA", 650);
  await show("定潮");
  await hold("KeyD", 650);
  await show("P1");
  await hold("KeyS", 550);
  await show("破鋒");
  await show("P2");
  await hold("KeyW", 700);
  const box = await live.locator("#view").boundingBox();
  if (box) {
    await live.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.55);
    await live.mouse.down();
    await live.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.42, { steps: 12 });
    await live.mouse.up();
  }
  await live.waitForTimeout(400);
  const video = live.video();
  await context.close();
  const webm = path.join(outDir, "rift-arena-heroes-move.webm");
  await video.saveAs(webm);
  hashFile(webm);
  await browser.close();
} finally {
  server.kill("SIGTERM");
}
