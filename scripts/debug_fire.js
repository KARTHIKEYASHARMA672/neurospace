import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import http from 'http';

const PORT = 4321;
const BASE = `http://localhost:${PORT}`;

function waitForServer(url, timeoutMs = 45000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http.get(url, (res) => { res.resume(); resolve(); }).on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error('no server'));
        else setTimeout(attempt, 350);
      });
    };
    attempt();
  });
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: path.resolve('.'), shell: true, stdio: 'ignore',
});
process.on('exit', () => { try { server.kill(); } catch {} });

try {
  await waitForServer(BASE);
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--headless=new', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  page.on('console', (m) => console.log('console[' + m.type() + ']:', m.text()));
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200);

  await page.locator('nav button', { hasText: 'SIGNALS' }).first().click();
  await page.waitForTimeout(800);

  const all = page.locator('button:has-text("Fire signal")');
  console.log('fire button count:', await all.count());
  for (let i = 0; i < await all.count(); i++) {
    const t = (await all.nth(i).innerText()).replace(/\s+/g, ' ').trim();
    const vis = await all.nth(i).isVisible();
    const box = await all.nth(i).boundingBox();
    console.log(`match[${i}] visible=${vis} box=${JSON.stringify(box)} text="${t.slice(0, 60)}"`);
  }

  await fireBtn.click();
  await page.waitForTimeout(1200);
  const logText = await page.evaluate(() => document.body.innerText.match(/Propagation log[\s\S]{0,600}/)?.[0] ?? 'not found');
  console.log('--- LOG AREA ---\n', logText);
  const firingText = await page.evaluate(() => (document.body.innerText.match(/Signal propagating[^\n]{0,40}/) ?? ['none'])[0]);
  console.log('button state text:', firingText);

  await browser.close();
} finally {
  try { server.kill(); } catch {}
}
