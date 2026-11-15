const https = require('https');
https.get('https://humanome.co/?sys=muscular%2Corgans%2Cskeleton%2Cskin&view=xray', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find text mentioning sys, view, xray, realistic, etc.
    const textMatches = data.match(/"([^"]*(?:muscular|skeleton|organs|skin|nervous|xray|render|anatomy|opacity|layer)[^"]*)"/gi) || [];
    console.log('Sample matched strings:', textMatches.slice(0, 20));
  });
});
