const https = require('https');

const candidates = [
  // Organs
  '/models/anatomy/z-brain.glb',
  '/models/anatomy/z-heart.glb',
  '/models/anatomy/z-lungs.glb',
  '/models/anatomy/z-digestive.glb',
  '/models/anatomy/z-urinary.glb',
  '/models/anatomy/z-endocrine.glb',
  '/models/anatomy/z-lymphatic.glb',
  '/models/anatomy/z-respiratory.glb',
  '/models/anatomy/z-viscera.glb',
  '/models/anatomy/z-liver.glb',
  '/models/anatomy/z-kidneys.glb',
  '/models/anatomy/z-eye.glb',
  '/models/anatomy/z-ear.glb',
  '/models/anatomy/z-head.glb',
  // Variants
  '/models/z-skeleton.glb',
  '/models/z-organs.glb',
  '/models/z-nervous.glb',
  '/models/z-brain.glb'
];

candidates.forEach(path => {
  https.get('https://humanome.co' + path, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    if (res.statusCode === 200) {
      console.log('FOUND:', path, 'Size:', res.headers['content-length']);
    }
  });
});
