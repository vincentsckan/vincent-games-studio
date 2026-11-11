import { chromium } from "playwright";
import { createHash } from "node:crypto";
import { readFileSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outDir = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";
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
        await page.goto(url, { waitUntil: "networkidle" });
        await page.waitForFunction(() => window.__SHOT_READY === true, null, { timeout: 30000 });
        await page.waitForTimeout(250);
        const file = path.join(outDir, `rift-${hero}-${side}-${angle}.png`);
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
  await live.goto("http://127.0.0.1:5174/", { waitUntil: "networkidle" });
  await live.waitForFunction(() => document.getElementById("who").textContent.includes("破鋒"));
  await live.click("#view");
  const hold = async (code, ms) => {
    await live.keyboard.down(code);
    await live.waitForTimeout(ms);
    await live.keyboard.up(code);
  };
  await hold("KeyW", 900);
  await hold("KeyD", 700);
  await hold("KeyS", 800);
  await hold("KeyA", 700);
  await live.keyboard.press("Digit2");
  await live.waitForTimeout(300);
  await live.keyboard.press("KeyF");
  await live.waitForTimeout(250);
  await hold("KeyW", 700);
  await hold("KeyA", 600);
  await live.keyboard.press("Digit3");
  await live.waitForTimeout(250);
  await live.keyboard.press("KeyF");
  await live.waitForTimeout(200);
  await hold("KeyD", 800);
  await hold("KeyS", 600);
  await live.keyboard.press("Digit1");
  await live.waitForTimeout(400);
  const video = live.video();
  await context.close();
  const webm = path.join(outDir, "rift-arena-wasd-switch.webm");
  await video.saveAs(webm);
  hashFile(webm);
  await browser.close();
} finally {
  server.kill("SIGTERM");
}
