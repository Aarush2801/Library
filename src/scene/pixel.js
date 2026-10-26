// Palette-exact pixel drawing into textures. Every draw call uses integer
// coordinates, so nothing is ever anti-aliased.
import { Texture } from 'pixi.js';

export const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// Deterministic RNG (mulberry32) so the shelves look the same every visit.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function painter(ctx) {
  return {
    rect(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    },
    // level 0..16: share of pixels filled using the 4x4 Bayer matrix.
    dither(x, y, w, h, color, level) {
      ctx.fillStyle = color;
      for (let j = y; j < y + h; j++) {
        for (let i = x; i < x + w; i++) {
          if (BAYER4[j & 3][i & 3] < level) ctx.fillRect(i, j, 1, 1);
        }
      }
    },
  };
}

export function canvasTexture(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(painter(canvas.getContext('2d')), w, h);
  const texture = Texture.from(canvas);
  texture.source.scaleMode = 'nearest';
  return texture;
}

// Full-surface dither where levelAt(x, y) returns 0..16 per pixel.
export function ditherTexture(w, h, hex, levelAt) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(w, h);
  const r = (hex >> 16) & 255;
  const g = (hex >> 8) & 255;
  const b = hex & 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (BAYER4[y & 3][x & 3] < levelAt(x, y)) {
        const i = (y * w + x) * 4;
        img.data[i] = r;
        img.data[i + 1] = g;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  const texture = Texture.from(canvas);
  texture.source.scaleMode = 'nearest';
  return texture;
}
