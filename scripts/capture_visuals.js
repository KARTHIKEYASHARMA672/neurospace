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
    await page.waitForTimeout(3000); // boot animation & 3D warmup

    // 01 — Full Body 3D Overview: Spinal Cord & Plexus Network
    await saveShot(page, '01_fullbody_nervous_system_overview.png');

    // 02 — Peripheral Nervous System & Brachial / Sciatic Inspection
    await page.locator('button:has-text("Nervous System")').first().click();
    await page.waitForTimeout(1200);
    // Click on Sciatic Nerve in the list
    const sciaticBtn = page.locator('button:has-text("Sciatic Nerve")').first();
    if (await sciaticBtn.isVisible()) {
      await sciaticBtn.click();
      await page.waitForTimeout(1000);
    }
    await saveShot(page, '02_peripheral_nerves_sciatic_detail.png');

    // 03 — Visceral & Autonomic Organs ("Second Brain" & Cardiac Plexus)
    const organsPill = page.locator('button:has-text("Organs & Plexus")').first();
    if (await organsPill.isVisible()) {
      await organsPill.click();
      await page.waitForTimeout(800);
    }
    const entericBtn = page.locator('button:has-text("Enteric Nervous System")').first();
    if (await entericBtn.isVisible()) {
      await entericBtn.click();
      await page.waitForTimeout(1000);
    }
    await saveShot(page, '03_autonomic_visceral_second_brain.png');

    // 04 — Cutaneous Integumentary & Dermatome Segmental Mapping (C2–S5)
    const dermPill = page.locator('button:has-text("Dermatomes C2–S5")').first();
    if (await dermPill.isVisible()) {
      await dermPill.click();
      await page.waitForTimeout(1000);
    }
    await saveShot(page, '04_skin_integumentary_dermatomes.png');

    // 05 — Brain Focus 3D Mode & 12 Regional Cortical Territories
    await page.locator('button:has-text("Brain Focus")').first().click();
    await page.waitForTimeout(1500);
    await saveShot(page, '05_brain_focus_cortical_atlas.png');

    // 06 — Full Body Signal Cascade (Foot Stepping on Pin — Spinal Reflex & Pain)
    await page.locator('button:has-text("Full Body 3D")').first().click();
    await page.waitForTimeout(600);
    await page.locator('nav button', { hasText: 'SIGNALS' }).first().click();
    await page.waitForTimeout(800);
    const fireBtn = page.getByRole('button', { name: 'Fire Full-Body Neural Circuit' }).first();
    if (await fireBtn.isVisible()) {
      await fireBtn.click();
      await page.waitForTimeout(1800); // capture mid-conduction pulse
    }
    await saveShot(page, '06_signal_propagation_spinal_reflex.png');
    await page.waitForTimeout(4000); // let cascade settle

    // 07 — Living Neurological Pathologies & Scenarios
    await page.locator('nav button', { hasText: 'SCENARIOS' }).first().click();
    await page.waitForTimeout(800);
    await saveShot(page, '07_neurological_scenarios_pathology.png');

    // 08 — Live Telemetry, EEG Brainwave Power Bands & Neurotransmitter Matrix
    await page.locator('nav button', { hasText: 'TELEMETRY' }).first().click();
    await page.waitForTimeout(1000);
    await saveShot(page, '08_live_eeg_telemetry_neurotransmitters.png');

    console.log('🎉 All 8 high-resolution 3D visual artifacts captured successfully!');
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
