import fs from 'fs';
import path from 'path';

// Parse a GLB file to extract the names of all meshes and nodes inside it
function inspectGLB(filename) {
  const filePath = path.resolve('public/models/anatomy', filename);
  const buf = fs.readFileSync(filePath);

  // Read header
  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546c67) {
    console.log(filename, 'Not a valid GLB');
    return;
  }

  // First chunk is JSON
  const jsonChunkLen = buf.readUInt32LE(12);
  const jsonBuf = buf.subarray(20, 20 + jsonChunkLen);
  const json = JSON.parse(jsonBuf.toString('utf8'));

  const nodes = json.nodes ? json.nodes.map(n => n.name).filter(Boolean) : [];
  const meshes = json.meshes ? json.meshes.map(m => m.name).filter(Boolean) : [];

  console.log(`\n=== ${filename} ===`);
  console.log(`Total nodes: ${json.nodes ? json.nodes.length : 0}, named nodes: ${nodes.length}`);
  console.log(`Total meshes: ${json.meshes ? json.meshes.length : 0}, named meshes: ${meshes.length}`);
  console.log('Sample node names (first 25):', nodes.slice(0, 25));
}

inspectGLB('z-organs.glb');
inspectGLB('z-skeleton.glb');
inspectGLB('z-nervous.glb');
inspectGLB('z-cardiovascular.glb');
inspectGLB('z-muscular.glb');
inspectGLB('z-skin.glb');
