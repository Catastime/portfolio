/* Layer-content probe: through forward and backward turns, log what the
 * turning page faces and both stacks are showing at every moment. */
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

server.listen(8757, async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: 'new',
      args: ['--headless=new', '--use-angle=swiftshader'],
      defaultViewport: { width: 1600, height: 900 },
    });
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message.slice(0, 150)));
    await page.goto('http://127.0.0.1:8757/', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(async () => { await document.fonts.ready; });
    await sleep(1500);
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    const scrollTo = (p) => page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), p * max);

    const probe = () => page.evaluate(() => {
      const tp = document.querySelector('.sketchbook-page-turning');
      const front = document.querySelector('.sketchbook-page-turning-front');
      const back = document.querySelector('.sketchbook-page-turning-back');
      const right = document.querySelector('.sketchbook-page-stack-right');
      const left = document.querySelector('.sketchbook-page-stack-left');
      const firstImg = (root) => {
        if (!root) return 'none';
        const im = root.querySelector('img');
        return im ? im.src.split('/').pop().slice(0, 24) : (root.querySelector('.sketch-text') ? 'text' : 'empty');
      };
      return {
        turning: tp ? tp.style.transform.replace('perspective(2000px) ', '') : 'none',
        frontVis: front ? front.style.visibility : '-',
        frontImg: firstImg(front),
        backVis: back ? back.style.visibility : '-',
        backImg: firstImg(back),
        rightImg: firstImg(right),
        leftImg: firstImg(left),
      };
    });

    const logSeq = async (label) => {
      const seen = new Set();
      for (let i = 0; i < 40; i++) {
        const s = await probe();
        const key = JSON.stringify(s);
        if (!seen.has(key)) {
          seen.add(key);
          console.log(label, JSON.stringify(s));
        }
        await sleep(30);
      }
    };

    // Forward turn 3 -> 4
    await scrollTo(progFor(3, 0.1));
    await sleep(1500);
    console.log('--- forward turn ---');
    const steps = 30;
    const fwd = (async () => {
      for (let i = 1; i <= steps; i++) {
        await scrollTo(progFor(3, FLAT + (i / steps) * (1 - FLAT)));
        await sleep(20);
      }
    })();
    await logSeq('F');
    await fwd;
    await sleep(800);

    // Backward turn 4 -> 3
    console.log('--- backward turn ---');
    const back = (async () => {
      for (let i = 1; i <= 30; i++) {
        await scrollTo(progFor(3, Math.max(0.1, 0.99 - (i / 30) * 0.9)));
        await sleep(20);
      }
    })();
    await logSeq('B');
    await back;
    await sleep(800);
    console.log('final:', JSON.stringify(await probe()));
    console.log('done');
    process.exit(0);
  } finally {
    server.close();
  }
});
process.on('unhandledRejection', (e) => { console.error(e); process.exit(1); });
