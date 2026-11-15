import fs from 'fs';
import path from 'path';

function listAllNodes(filename) {
  const filePath = path.resolve('public/models/anatomy', filename);
  const buf = fs.readFileSync(filePath);
  const jsonChunkLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonChunkLen).toString('utf8'));
  return json.nodes ? json.nodes.map(n => n.name).filter(Boolean) : [];
}

const organNodes = listAllNodes('z-organs.glb');
console.log('Organ nodes count:', organNodes.length);
console.log('Sample organ names:', organNodes.filter(n => !n.endsWith('.g')).slice(0, 40));
