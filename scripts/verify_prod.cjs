const { chromium } = require('playwright');

(async () => {
  console.log('Testing live production at https://neurospace-3d.vercel.app ...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--headless=new', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('[Prod Console Error]:', msg.text());
      errors.push(msg.text());
    }
  });

  await page.goto('https://neurospace-3d.vercel.app', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'screenshots/verify_live_prod_heart.png' });
  console.log('Saved screenshots/verify_live_prod_heart.png');

  // Click Reset View
  const resetBtn = await page.locator('button:has-text("Reset View")').first();
  if (await resetBtn.isVisible()) {
    console.log('Clicking Reset View (Full Body)...');
    await resetBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'screenshots/verify_live_prod_fullbody.png' });
    console.log('Saved screenshots/verify_live_prod_fullbody.png');
  }

  console.log('Total production console errors:', errors.length);
  await browser.close();
  console.log('Live production verification complete!');
})();
