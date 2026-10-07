/* work2 poster capture: dev server (real GPU), no CSS injection.
 * The model renders on the black page; the black background is keyed out
 * afterwards. */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const OUT = path.join(process.cwd(), 'public', 'bachelor-thesis');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BOOK_START = 0.60, RANGE = 0.40, TOTAL_SPREADS = 16, FLAT = 0.35;
const progFor = (spread, frac) => BOOK_START + RANGE * ((spread + frac) / TOTAL_SPREADS);

setTimeout(() => { console.log('HARD TIMEOUT'); process.exit(2); }, 150000).unref();

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--headless=new'],
    defaultViewport: { width: 1600, height: 900 },
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message.slice(0, 200)));
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(async () => { await document.fonts.ready; });
  await sleep(1500);
  const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const scrollTo = (p) => page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), p * max);

  await scrollTo(progFor(5, 0.1));
  for (let i = 0; i < 120; i++) {
    const n = await page.evaluate(() => document.querySelectorAll('.sketch-model canvas').length);
    if (n >= 3) break;
    await sleep(500);
  }
  await sleep(8000);

  const box = await page.evaluate(() => {
    const els = [...document.querySelectorAll('.sketch-model')];
    const el = els.find((e) => e.getBoundingClientRect().width > 300);
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  });
  console.log('work2 box:', JSON.stringify(box));

  const shot = await page.screenshot({ captureBeyondViewport: false });
  fs.writeFileSync(path.join(OUT, '_work2-shot.png'), shot);
  console.log('saved');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
