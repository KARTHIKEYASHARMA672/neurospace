const { chromium } = require('playwright');

(async () => {
  console.log('Launching Chrome to diagnose visibility...');
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

  page.on('console', (msg) => {
    console.log(`[Browser Console ${msg.type()}]:`, msg.text());
  });

  page.on('requestfailed', (req) => {
    console.log('[Request Failed]:', req.url(), req.failure()?.errorText);
  });

  page.on('response', (res) => {
    if (res.url().includes('.glb')) {
      console.log('[GLB Response]:', res.url(), res.status());
    }
  });

  console.log('Navigating to https://neurospace-3d.vercel.app...');
  await page.goto('https://neurospace-3d.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });

  // Wait 4 seconds for Three.js to render
  await page.waitForTimeout(4000);

  // Take screenshot of default view
  await page.screenshot({ path: 'screenshots/diag_01_default.png' });
  console.log('Captured diag_01_default.png');

  // Check what is in the 3D scene
  const sceneDebug = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return {
      hasCanvas: !!canvas,
      canvasRect: canvas ? canvas.getBoundingClientRect() : null,
    };
  });
  console.log('Scene Debug:', sceneDebug);

  // Now inspect clicking Heart
  const heartCard = await page.locator('text=Heart & Ventricles').first();
  if (await heartCard.isVisible()) {
    console.log('Clicking Heart...');
    await heartCard.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/diag_02_heart.png' });
    console.log('Captured diag_02_heart.png');
  }

  // Switch to Photoreal view
  const photorealBtn = await page.locator('button:has-text("Photoreal")').first();
  if (await photorealBtn.isVisible()) {
    console.log('Clicking Photoreal...');
    await photorealBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/diag_03_photoreal.png' });
    console.log('Captured diag_03_photoreal.png');
  }

  await browser.close();
  console.log('Diagnosis complete.');
})();
