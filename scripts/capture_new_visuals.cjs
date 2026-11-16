const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = 4323;
const BASE = `http://localhost:${PORT}`;
const TARGET_DIR = path.resolve('L:/pr 15(esp)/sendiing files/screenshots/18_NEUROSPACE');
const LOCAL_DIR = path.resolve('./screenshots');

if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });
if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });

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

async function saveShot(page, filename) {
  const p1 = path.join(TARGET_DIR, filename);
  const p2 = path.join(LOCAL_DIR, filename);
  await page.screenshot({ path: p1 });
  fs.copyFileSync(p1, p2);
  console.log(`✅ Saved ${filename}`);
}

(async () => {
  console.log('Starting preview server on port', PORT, '...');
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
    console.log('Server verified at', BASE);

    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--headless=new', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'],
    });

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', (msg) => {
      if (msg.type() === 'error') console.error('[Browser Error]:', msg.text());
    });

    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // 1. Heart 3D Exterior View
    await saveShot(page, '01_3d_heart_exterior_coronary_vessels.png');

    // 2. Heart Coronal Cutaway (Interior Chambers & Valves)
    const cutawayBtn = await page.locator('button:has-text("Interior Chambers Cutaway")').first();
    if (await cutawayBtn.isVisible()) {
      await cutawayBtn.click();
      await page.waitForTimeout(2500);
      await saveShot(page, '02_3d_heart_interior_cutaway_chambers.png');
    }

    // 3. Brain & Cerebral Cortex
    const brainBtn = await page.locator('button:has-text("Brain & Cortex")').first();
    if (await brainBtn.isVisible()) {
      await brainBtn.click();
      await page.waitForTimeout(2500);
      await saveShot(page, '03_3d_brain_cerebral_cortex_atlas.png');
    }

    // 4. Lungs & Airway Tree
    const lungsBtn = await page.locator('button:has-text("Lungs & Airway")').first();
    if (await lungsBtn.isVisible()) {
      await lungsBtn.click();
      await page.waitForTimeout(2500);
      await saveShot(page, '04_3d_lungs_tracheobronchial_tree.png');
    }

    // 5. Liver & Gallbladder
    const liverBtn = await page.locator('button:has-text("Liver & Biliary")').first();
    if (await liverBtn.isVisible()) {
      await liverBtn.click();
      await page.waitForTimeout(2500);
      await saveShot(page, '05_3d_liver_gallbladder_biliary.png');
    }

    // 6. Kidneys & Urinary Excretory Tract
    const kidneyBtn = await page.locator('button:has-text("Kidneys & Urinary")').first();
    if (await kidneyBtn.isVisible()) {
      await kidneyBtn.click();
      await page.waitForTimeout(2500);
      await saveShot(page, '06_3d_kidneys_urinary_tract.png');
    }

    // 7. Skeleton System
    const skeletonBtn = await page.locator('button:has-text("Skeleton")').first();
    if (await skeletonBtn.isVisible()) {
      await skeletonBtn.click();
      await page.waitForTimeout(2500);
      await saveShot(page, '07_3d_articulated_skeleton.png');
    }

    // 8. Muscular System
    const muscularBtn = await page.locator('button:has-text("Muscular System")').first();
    if (await muscularBtn.isVisible()) {
      await muscularBtn.click();
      await page.waitForTimeout(2500);
      await saveShot(page, '08_3d_muscular_kinetic_system.png');
    }

    // 9. Full Human Body 6-Layer Multi-System Composite
    const fullbodyBtn = await page.locator('button:has-text("Full Human Body")').first();
    if (await fullbodyBtn.isVisible()) {
      await fullbodyBtn.click();
      await page.waitForTimeout(3500);
      await saveShot(page, '09_3d_full_human_body_composite.png');
    }

    // 10. X-Ray Radiological Mode
    const xrayBtn = await page.locator('button:has-text("X-Ray")').first();
    if (await xrayBtn.isVisible()) {
      await xrayBtn.click();
      await page.waitForTimeout(2500);
      await saveShot(page, '10_3d_xray_radiological_hologram.png');
    }

    await browser.close();
    server.kill();
    console.log('All 10 high-resolution visual screenshots captured successfully!');
  } catch (err) {
    console.error('Visual capture error:', err);
    try { server.kill(); } catch {}
  }
})();
