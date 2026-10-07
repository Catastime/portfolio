/* Model page verification: settle on spread 5 (three models), confirm the
 * canvases appear after the deferred load and the page stays responsive. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const DIST = path.join(process.cwd(), 'dist');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.glb': 'model/gltf-binary', '.otf': 'font/otf', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(DIST, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BOOK_START = 0.60, RANGE = 0.40, TOTAL_SPREADS = 16, FLAT = 0.35;
const progFor = (spread, frac) => BOOK_START + RANGE * ((spread + frac) / TOTAL_SPREADS);

setTimeout(() => { console.log('HARD TIMEOUT'); process.exit(2); }, 170000).unref();

server.listen(8775, async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: 'new',
      args: ['--headless=new', '--use-angle=swiftshader'],
      defaultViewport: { width: 1600, height: 900 },
    });
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message.slice(0, 150)));
    await page.goto('http://127.0.0.1:8775/', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(async () => { await document.fonts.ready; });
    await sleep(1500);
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    const scrollTo = (p) => page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), p * max);

    // Settle on spread 4, then turn to spread 5 (the model spread)
    await scrollTo(progFor(4, 0.1));
    await sleep(2500);
    const steps = 30;
    for (let i = 1; i <= steps; i++) {
      await scrollTo(progFor(4, FLAT + (i / steps) * (1 - FLAT)));
      await sleep(20);
    }
    // Sample: model canvases should appear over time (deferred + queued)
    for (let i = 0; i < 12; i++) {
      const st = await page.evaluate(() => ({
        canvases: document.querySelectorAll('.sketch-model canvas').length,
        failed: document.querySelectorAll('.sketch-model-failed').length,
      }));
      console.log(`t=${i * 300}ms:`, JSON.stringify(st));
      if (st.canvases >= 3) break;
      await sleep(300);
    }
    await sleep(2000);
    const final = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('.sketch-model canvas').forEach((c) => {
        let p = c.parentElement, chain = [];
        for (let i = 0; i < 7 && p; i++) { chain.push(p.className ? String(p.className).split(' ')[0] : p.tagName); p = p.parentElement; }
        out.push(chain.join(' > '));
      });
      return out;
    });
    console.log('final:', JSON.stringify(final));
    console.log('done');
    process.exit(0);
  } finally {
    server.close();
  }
});
process.on('unhandledRejection', (e) => { console.error(e); process.exit(1); });
