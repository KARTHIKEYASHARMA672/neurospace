const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const PORT = 4322;
const BASE = `http://localhost:${PORT}`;

function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http
        .get(url, (res) => {
          res.resume();
          resolve();
        })
        .on('error', () => {
          if (Date.now() - start > timeoutMs) reject(new Error('server did not start in time'));
          else setTimeout(attempt, 300);
        });
    };
    attempt();
  });
}

(async () => {
  console.log('Starting vite preview on port', PORT, '...');
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: path.resolve('.'),
    shell: true,
    stdio: 'ignore',
  });

  process.on('exit', () => {
    try { server.kill(); } catch {}
  });

  try {
    await waitForServer(BASE);
    console.log('Server is up at', BASE);

    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: [
        '--headless=new',
        '--enable-webgl',
        '--ignore-gpu-blocklist',
        '--no-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    const errors = [];
    page.on('console', (msg) => {
      console.log(`[Browser ${msg.type()}]:`, msg.text());
      if (msg.type() === 'error') errors.push(msg.text());
    });

    console.log('Navigating to', BASE, '...');
    await page.goto(BASE, { waitUntil: 'networkidle' });

    // Wait 5 seconds for all 6 GLB models to parse and render
    await page.waitForTimeout(5000);

    // Save screenshot of initial state (focused on Heart by default)
    await page.screenshot({ path: 'screenshots/verify_01_heart_default_focus.png' });
    console.log('Saved verify_01_heart_default_focus.png');

    // Click "Full Body" button
    const fullBodyBtn = await page.locator('button:has-text("Reset View")').first();
    if (await fullBodyBtn.isVisible()) {
      console.log('Clicking Reset View (Full Body)...');
      await fullBodyBtn.click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: 'screenshots/verify_02_full_body_composite.png' });
      console.log('Saved verify_02_full_body_composite.png');
    }

    // Switch to Photoreal
    const photorealBtn = await page.locator('button:has-text("Photoreal")').first();
    if (await photorealBtn.isVisible()) {
      console.log('Switching to Photoreal mode...');
      await photorealBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/verify_03_photoreal_view.png' });
      console.log('Saved verify_03_photoreal_view.png');
    }

    // Focus on Liver
    const liverCard = await page.locator('text=Liver & Hepatic Segments').first();
    if (await liverCard.isVisible()) {
      console.log('Clicking Liver...');
      await liverCard.click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: 'screenshots/verify_04_liver_focus.png' });
      console.log('Saved verify_04_liver_focus.png');
    }

    // Focus on Brain
    const brainCard = await page.locator('text=Brain & Cerebral Cortex').first();
    if (await brainCard.isVisible()) {
      console.log('Clicking Brain...');
      await brainCard.click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: 'screenshots/verify_05_brain_focus.png' });
      console.log('Saved verify_05_brain_focus.png');
    }

    // Switch to CT mode
    const ctBtn = await page.locator('button:has-text("ct")').first();
    if (await ctBtn.isVisible()) {
      console.log('Switching to CT mode...');
      await ctBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/verify_06_ct_mode.png' });
      console.log('Saved verify_06_ct_mode.png');
    }

    // Switch to MRI mode
    const mriBtn = await page.locator('button:has-text("mri")').first();
    if (await mriBtn.isVisible()) {
      console.log('Switching to MRI mode...');
      await mriBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/verify_07_mri_mode.png' });
      console.log('Saved verify_07_mri_mode.png');
    }

    console.log('Total console errors recorded:', errors.length);
    await browser.close();
    server.kill();
    console.log('Visual verification complete!');
  } catch (err) {
    console.error('Error during verification:', err);
    try { server.kill(); } catch {}
  }
})();
