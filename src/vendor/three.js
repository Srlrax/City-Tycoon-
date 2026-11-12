const sources = [
  'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
  'https://unpkg.com/three@0.160.0/build/three.module.js',
  'https://esm.sh/three@0.160.0'
];

let THREE = null;
const failures = [];

for (const source of sources) {
  try {
    THREE = await import(source);
    break;
  } catch (error) {
    failures.push(source + ': ' + (error?.message || String(error)));
  }
}

if (!THREE) {
  throw new Error(
    'Could not download the 3D engine from the available CDNs. ' +
    'Your network may block these script hosts. ' + failures.join(' | ')
  );
}

export default THREE;
