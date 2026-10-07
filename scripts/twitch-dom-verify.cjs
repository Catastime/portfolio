/* DOM-level verification: corners travel with the turning page; shadow is
 * zero when flat and strong mid-turn. */
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

setTimeout(() => { console.log('HARD TIMEOUT'); process.exit(2); }, 150000).unref();

server.listen(8765, async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: 'new',
      args: ['--headless=new', '--use-angle=swiftshader'],
      defaultViewport: { width: 1600, height: 900 },
    });
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message.slice(0, 150)));
    await page.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(async () => { await document.fonts.ready; });
    await sleep(1500);
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    const scrollTo = (p) => page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), p * max);

    const probe = () => page.evaluate(() => {
      const tp = document.querySelector('.sketchbook-page-turning');
      const front = document.querySelector('.sketchbook-page-turning-front');
      const back = document.querySelector('.sketchbook-page-turning-back');
      const leftStack = document.querySelector('.sketchbook-page-stack-left');
      return {
        turningExists: !!tp,
        frontCorners: front ? front.querySelectorAll('.sketchbook-corners').length : -1,
        backCorners: back ? back.querySelectorAll('.sketchbook-corners').length : -1,
        frontShadow: front ? front.style.boxShadow.slice(0, 60) : 'n/a',
        backShadow: back ? back.style.boxShadow.slice(0, 60) : 'n/a',
        leftChildren: leftStack.children.length,
        leftCornersInside: leftStack.querySelectorAll('.sketchbook-corners').length,
      };
    });

    await scrollTo(progFor(3, 0.1));
    await sleep(2000);
    console.log('settled s3:', JSON.stringify(await probe()));

    // Mid-turn
    await scrollTo(progFor(3, 0.7));
    await sleep(400);
    console.log('mid-turn:', JSON.stringify(await probe()));

    // Nearly landed
    await scrollTo(progFor(3, 0.99));
    await sleep(400);
    console.log('near-landed:', JSON.stringify(await probe()));

    // Let the settle snap land it
    await sleep(1500);
    console.log('landed:', JSON.stringify(await probe()));

    console.log('done');
    process.exit(0);
  } finally {
    server.close();
  }
});
process.on('unhandledRejection', (e) => { console.error(e); process.exit(1); });
