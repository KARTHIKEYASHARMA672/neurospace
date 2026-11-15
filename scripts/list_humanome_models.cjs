const https = require('https');
https.get('https://humanome.co', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    // Look for all .glb matches
    const glbs = data.match(/\/models\/[^\s\"']+\.glb/gi) || [];
    console.log('All GLB models found in Humanome:', [...new Set(glbs)]);
  });
});
