// Rolling library ladder hooked over the top rail.
import { Sprite } from 'pixi.js';
import { LADDER, SHELF, CSS } from '../config.js';
import { canvasTexture } from './pixel.js';

const height = SHELF.floorY + 4 - SHELF.railY; // feet stand on the floor, just in front of the plinth

function ladderTexture() {
  const w = LADDER.w;
  return canvasTexture(w, height, (p) => {
    // Rails: ink / light / ink, three pixels wide each.
    for (const x of [0, w - 3]) {
      p.rect(x, 2, 3, height - 5, CSS.INK);
      p.rect(x + 1, 2, 1, height - 5, CSS.LIGHT);
    }
    for (let y = 10; y < height - 6; y += LADDER.rungGap) {
      p.rect(3, y, w - 6, 1, CSS.LIGHT);
      p.rect(3, y + 1, w - 6, 1, CSS.INK);
    }
    // Hooks curling over the rail.
    for (const x of [0, w - 3]) {
      p.rect(x, 0, 3, 1, CSS.INK);
      p.rect(x + (x === 0 ? 2 : 0), 1, 1, 1, CSS.INK);
    }
    // Wheels.
    for (const x of [0, w - 3]) {
      p.rect(x, height - 3, 3, 3, CSS.INK);
      p.rect(x + 1, height - 2, 1, 1, CSS.LIGHT);
    }
  });
}

export function createLadder(sceneW) {
  const sprite = new Sprite(ladderTexture());
  sprite.position.set(Math.round(sceneW * LADDER.startX), SHELF.railY);
  return {
    sprite,
    get x() {
      return sprite.x;
    },
    set x(v) {
      sprite.x = Math.round(v);
    },
    // Rung y positions in scene space, for climbing later.
    rungs() {
      const out = [];
      for (let y = 10; y < height - 6; y += LADDER.rungGap) out.push(SHELF.railY + y);
      return out;
    },
  };
}
