import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'http';

const TARGET_DIR_1 = path.resolve('L:/pr 15(esp)/sendiing files/screenshots/18_NEUROSPACE');
const TARGET_DIR_2 = path.resolve('./screenshots');
const PORT = 4321;
const BASE = `http://localhost:${PORT}`;

if (!fs.existsSync(TARGET_DIR_1)) fs.mkdirSync(TARGET_DIR_1, { recursive: true });
if (!fs.existsSync(TARGET_DIR_2)) fs.mkdirSync(TARGET_DIR_2, { recursive: true });

function waitForServer(url, timeoutMs = 45000) {
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
          else setTimeout(attempt, 350);
        });
    };
    attempt();
  });
}

async function saveShot(page, filename) {
  const file1 = path.join(TARGET_DIR_1, filename);
  await page.screenshot({ path: file1 });
  fs.copyFileSync(file1, path.join(TARGET_DIR_2, filename));
  console.log(`✅ Saved ${filename}`);
}

async function run() {
  console.log('Starting vite preview on port', PORT, '...');
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: path.resolve('.'),
    shell: true,
    stdio: 'ignore',
  });
  process.on('exit', () => {
    try {
      server.kill();
    } catch {}
  });

  try {
    await waitForServer(BASE);
    console.log('Server verified up. Launching Google Chrome headless with WebGL...');

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

    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.error('Console error:', msg.text());
    });
    page.on('pageerror', (err) => console.error('Page error:', err.message));

    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4500); // Wait for Z-Anatomy 3D models to finish loading into WebGL

    // 01 — X-Ray Multi-System Composite (Skeleton + Organs + Muscular + Skin)
    await saveShot(page, '01_humanome_xray_multisystem_composite.png');

    // 02 — Skeletal System Isolation & Mineral Matrix
    const muscBtn = page.locator('button[title*="Hide System Layer"]').nth(1);
    if (await muscBtn.isVisible()) await muscBtn.click();
    const skinBtn = page.locator('button[title*="Hide System Layer"]').nth(4);
    if (await skinBtn.isVisible()) await skinBtn.click();
    await page.waitForTimeout(1000);
    await saveShot(page, '02_skeletal_axial_appendicular_system.png');

    // 03 — Cardiovascular Angiography & Deep Circulation Network
    await page.locator('button:has-text("PHOTOREAL")').first().click();
    await page.waitForTimeout(1200);
    await saveShot(page, '03_cardiovascular_arterial_photoreal.png');

    // 04 — Computed Tomography (CT) Radiological Scan Mode
    await page.locator('button:has-text("CT")').first().click();
    await page.waitForTimeout(1000);
    await saveShot(page, '04_computed_tomography_radiological_ct.png');

    // 05 — Magnetic Resonance Imaging (MRI T2-Weighted Fluid Contrast)
    await page.locator('button:has-text("MRI")').first().click();
    await page.waitForTimeout(1000);
    await saveShot(page, '05_magnetic_resonance_imaging_mri.png');

    // 06 — Full-Body Signal Propagation: Stepping on Pin (Spinal Reflex Arc)
    await page.locator('button:has-text("XRAY")').first().click();
    await page.waitForTimeout(500);
    await page.locator('nav button', { hasText: 'SIGNALS' }).first().click();
    await page.waitForTimeout(800);
    const fireBtn = page.getByRole('button', { name: 'Fire Full-Body Neural Circuit' }).first();
    if (await fireBtn.isVisible()) {
      await fireBtn.click();
      await page.waitForTimeout(1500);
    }
    await saveShot(page, '06_signal_propagation_spinal_reflex.png');
    await page.waitForTimeout(3500);

    // 07 — Neurological Scenarios & Pathology Engine
    await page.locator('nav button', { hasText: 'SCENARIOS' }).first().click();
    await page.waitForTimeout(800);
    await saveShot(page, '07_neurological_scenarios_pathology.png');

    // 08 — Live Telemetry & 60 Hz Fourier Power Bands
    await page.locator('nav button', { hasText: 'TELEMETRY' }).first().click();
    await page.waitForTimeout(1000);
    await saveShot(page, '08_live_eeg_telemetry_neurotransmitters.png');

    console.log('🎉 All 8 medical-grade 3D visual artifacts captured successfully!');
    await browser.close();
  } catch (err) {
    console.error('Error during visual capture:', err);
    process.exit(1);
  } finally {
    try {
      server.kill();
    } catch {}
  }
}

run();
