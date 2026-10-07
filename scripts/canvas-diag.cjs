/* Canvas diagnostic: sizes and positions of the model canvases. */
const puppeteer = require('puppeteer-core');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BOOK_START = 0.60, RANGE = 0.40, TOTAL_SPREADS = 16, FLAT = 0.35;
const progFor = (spread, frac) => BOOK_START + RANGE * ((spread + frac) / TOTAL_SPREADS);

setTimeout(() => { console.log('HARD TIMEOUT'); process.exit(2); }, 120000).unref();

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--headless=new'],
    defaultViewport: { width: 1600, height: 900 },
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message.slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE:', m.text().slice(0, 200)); });
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
  await sleep(6000);

  const diag = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.sketch-model').forEach((el) => {
      const c = el.querySelector('canvas');
      const r = el.getBoundingClientRect();
      const cr = c ? c.getBoundingClientRect() : null;
      out.push({
        div: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        canvas: c ? {
          x: Math.round(cr.x), y: Math.round(cr.y), w: Math.round(cr.width), h: Math.round(cr.height),
          bufW: c.width, bufH: c.height, styleW: c.style.width, styleH: c.style.height,
        } : null,
      });
    });
    return out;
  });
  console.log(JSON.stringify(diag, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
