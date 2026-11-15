const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsDir = path.resolve('public/models/anatomy');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const files = [
  'z-skeleton.glb',
  'z-muscular.glb',
  'z-organs.glb',
  'z-skin.glb',
  'z-nervous.glb',
  'z-cardiovascular.glb'
];

function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const dest = path.join(modelsDir, filename);
    const file = fs.createWriteStream(dest);
    const url = `https://humanome.co/models/anatomy/${filename}`;

    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${filename}, status: ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`✅ Downloaded ${filename} (${fs.statSync(dest).size} bytes)`);
          resolve();
        });
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('Downloading 6 official Z-Anatomy 3D GLB systems from Humanome...');
  for (const f of files) {
    await downloadFile(f);
  }
  console.log('🎉 All 6 genuine medical 3D anatomical systems downloaded successfully!');
}

run().catch(console.error);
