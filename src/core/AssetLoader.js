import THREE from '../vendor/three.js';

export class AssetLoader {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.textureCache = new Map();
  }

  loadTexture(url, options = {}) {
    if (this.textureCache.has(url)) return Promise.resolve(this.textureCache.get(url));
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        texture => {
          texture.colorSpace = options.colorSpace || THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(8, options.anisotropy || 4);
          texture.wrapS = options.repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
          texture.wrapT = options.repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
          if (options.repeat) texture.repeat.set(options.repeat[0], options.repeat[1]);
          this.textureCache.set(url, texture);
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  dispose() {
    for (const texture of this.textureCache.values()) texture.dispose();
    this.textureCache.clear();
  }
}

export function createNoiseTexture(base, variation = 14, repeatX = 4, repeatY = 4) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas textures are unavailable in this browser.');
  context.fillStyle = base;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < image.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * variation;
    image.data[i] = Math.max(0, Math.min(255, image.data[i] + noise));
    image.data[i + 1] = Math.max(0, Math.min(255, image.data[i + 1] + noise));
    image.data[i + 2] = Math.max(0, Math.min(255, image.data[i + 2] + noise));
  }

  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
