const https = require('https');
https.get('https://humanome.co/?sys=muscular%2Corgans%2Cskeleton%2Cskin&view=xray', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const title = (data.match(/<title>([^<]*)<\/title>/) || [])[1];
    console.log('Title:', title);
    const m = data.match(/systems|muscular|skeleton|organs|skin|xray|render|model|gltf/gi);
    console.log('Sample tokens count:', m ? m.length : 0);

    // Look for JSON script tags
    const scripts = data.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    console.log('Total scripts found:', scripts.length);
    for (const s of scripts) {
      if (s.includes('skeleton') || s.includes('muscular') || s.includes('organs')) {
        console.log('Found anatomy script snippet:', s.slice(0, 300));
        break;
      }
    }
  });
}).on('error', err => console.error(err));
