// Atmosphere: floor, dithered lamplight falloff and drifting dust.
import { Container, Sprite, Texture } from 'pixi.js';
import { CSS, PALETTE, RES, SHELF, DUST, FPS } from '../config.js';
import { canvasTexture, ditherTexture, rng } from './pixel.js';

export function createFloor(w) {
  const h = RES.H - SHELF.floorY;
  const sprite = new Sprite(
    canvasTexture(w, h, (p) => {
      p.rect(0, 0, w, h, CSS.LIGHT);
      // Plank seams with staggered butt joints.
      for (let row = 0, y = 9; y < h; row++, y += 10) {
        p.rect(0, y, w, 1, CSS.DARK);
        for (let x = (row % 2) * 17 + 6; x < w; x += 34) p.rect(x, y - 9, 1, 9, CSS.DARK);
      }
      p.dither(0, 0, w, h, CSS.DARK, 1);
      // Shadow cast by the bookcase.
      p.rect(0, 0, w, 1, CSS.INK);
      p.dither(0, 1, w, 2, CSS.INK, 8);
      p.dither(0, 3, w, 2, CSS.INK, 4);
    }),
  );
  sprite.y = SHELF.floorY;
  return sprite;
}

// Lamplight pools in the middle of the room; the corners fall off in ink dither.
export function createVignette(w) {
  const h = RES.H;
  const cx = w / 2;
  const cy = 120;
  const rx = Math.max(w * 0.62, 200);
  const ry = 175;
  return new Sprite(
    ditherTexture(w, h, PALETTE.INK, (x, y) => {
      const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
      return Math.floor(Math.min(1, Math.max(0, (d - 0.72) / 0.55)) * 8);
    }),
  );
}

export function createDust(w, reducedMotion) {
  const container = new Container();
  // One texture per mote so the scene can destroy textures with their sprites.
  const mote = () => canvasTexture(1, 1, (p) => p.rect(0, 0, 1, 1, CSS.LIGHT));
  const rand = rng(42);
  const top = SHELF.top + 2;
  const bottom = SHELF.floorY - 4;
  const motes = [];
  for (let i = 0; i < DUST.count; i++) {
    const s = new Sprite(mote());
    s.position.set(
      SHELF.side + Math.floor(rand() * (w - SHELF.side * 2)),
      top + Math.floor(rand() * (bottom - top)),
    );
    container.addChild(s);
    motes.push(s);
  }

  const step = 1000 / FPS.dust;
  let acc = 0;
  function update(deltaMS) {
    if (reducedMotion) return;
    acc += deltaMS;
    while (acc >= step) {
      acc -= step;
      for (const s of motes) {
        const r = Math.random();
        if (r < 0.3) s.y += 1;
        else if (r < 0.38) s.y -= 1;
        if (r > 0.85) s.x += Math.random() < 0.5 ? -1 : 1;
        if (r > 0.97) s.visible = !s.visible;
        if (s.y > bottom) s.y = top;
        if (s.y < top) s.y = bottom;
      }
    }
  }
  return { container, update };
}

// Uniform ink dither over the whole scene (the "shh" dim). set(0) hides it.
export function createDimmer(w) {
  const cache = new Map();
  const sprite = new Sprite();
  sprite.eventMode = 'none';
  sprite.visible = false;
  return {
    sprite,
    set(level) {
      sprite.visible = level > 0;
      if (!level) return;
      if (!cache.has(level)) cache.set(level, ditherTexture(w, RES.H, PALETTE.INK, () => level));
      sprite.texture = cache.get(level);
    },
    destroy() {
      sprite.texture = Texture.EMPTY;
      for (const t of cache.values()) t.destroy(true);
    },
  };
}

// Lights out: solid ink with a dithered lamp circle cut out of the middle.
// The texture is twice the scene size so the hole can reach every corner.
export function createDarkness(w) {
  const tw = w * 2;
  const th = RES.H * 2;
  const r0 = 26; // fully lit
  const r1 = 44; // fully dark
  const sprite = new Sprite(
    ditherTexture(tw, th, PALETTE.INK, (x, y) => {
      const d = Math.hypot(x - w, y - RES.H);
      return Math.round(Math.min(1, Math.max(0, (d - r0) / (r1 - r0))) * 16) + (d > r1 ? 1 : 0);
    }),
  );
  sprite.eventMode = 'none';
  sprite.visible = false;
  return {
    sprite,
    moveTo(x, y) {
      sprite.position.set(Math.round(x) - w, Math.round(y) - RES.H);
    },
  };
}
