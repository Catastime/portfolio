/* Rect probe: sample bounding rects of all page items across a page turn,
 * and report any element whose rendered size changes. Catches layout- and
 * transform-driven "gets bigger" glitches in the DOM, independent of the
 * compositor. */
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

server.listen(8755, async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: 'new',
      args: ['--headless=new', '--use-angle=swiftshader'],
      defaultViewport: { width: 1600, height: 900 },
    });
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message.slice(0, 150)));
    await page.goto('http://127.0.0.1:8755/', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(async () => { await document.fonts.ready; });
    await sleep(1500);
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    const scrollTo = (p) => page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), p * max);

    // Install the rect sampler: every rAF, record rects of all sketch items
    // in both stacks; keep only samples where something changed.
    await page.evaluate(() => {
      window.__rectLog = [];
      window.__prev = null;
      const snap = () => {
        const out = { t: performance.now(), items: [] };
        document.querySelectorAll('.sketchbook-page-stack > * .sketch-item, .sketchbook-page-stack > .sketch-item, .sketchbook-page-turning .sketch-item').forEach((el) => {
          const r = el.getBoundingClientRect();
          out.items.push({ cls: (el.className || '').split(' ')[1] || el.className, x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) });
        });
        const tp = document.querySelector('.sketchbook-page-turning');
        out.turning = tp ? tp.style.transform : null;
        const key = JSON.stringify(out.items) + out.turning;
        if (window.__prev !== key) {
          window.__rectLog.push(out);
          window.__prev = key;
        }
        requestAnimationFrame(snap);
      };
      requestAnimationFrame(snap);
    });

    // Turn 3 -> 4 (page 9 text arrives on the right stack)
    await scrollTo(progFor(3, 0.1));
    await sleep(2000);
    await page.evaluate(() => { window.__rectLog = []; window.__prev = null; });
    const steps = 30;
    for (let i = 1; i <= steps; i++) {
      await scrollTo(progFor(3, FLAT + (i / steps) * (1 - FLAT)));
      await sleep(20);
    }
    await sleep(1500); // grace + hint reset window

    const log = await page.evaluate(() => window.__rectLog.slice(0, 400));
    console.log(`samples with changes: ${log.length}`);
    for (const s of log) {
      const sizes = s.items.map((i) => `${i.cls}:${i.w}x${i.h}@${i.x},${i.y}`);
      console.log(`t=${Math.round(s.t)}ms turning=${s.turning ? s.turning.slice(0, 40) : 'none'}`);
      console.log('   ', sizes.slice(0, 12).join(' | '));
    }
    console.log('done');
    process.exit(0);
  } finally {
    server.close();
  }
});
process.on('unhandledRejection', (e) => { console.error(e); process.exit(1); });
