// Circulation desk with a lamp, a bell and a stack of returns.
// The texture includes the props standing on the desk top.
import { Sprite } from 'pixi.js';
import { CSS, DESK } from '../config.js';
import { canvasTexture } from './pixel.js';

const PROPS_H = 18;

export function deskX(sceneW) {
  return sceneW - DESK.right - DESK.w;
}

export function createDesk(sceneW) {
  const w = DESK.w;
  const h = DESK.h + PROPS_H;
  const top = PROPS_H;
  const sprite = new Sprite(
    canvasTexture(w, h, (p) => {
      // Lamp: base, stem, shade, and a dithered pool of light on the desk.
      p.dither(1, top - 1, 16, 1, CSS.PAPER, 8);
      p.dither(3, top - 4, 12, 3, CSS.PAPER, 3);
      p.rect(5, top - 2, 7, 2, CSS.INK);
      p.rect(8, top - 12, 1, 10, CSS.INK);
      p.rect(4, top - 15, 9, 1, CSS.INK);
      p.rect(3, top - 14, 11, 3, CSS.DARK);
      p.rect(3, top - 14, 11, 1, CSS.LIGHT);
      p.rect(2, top - 11, 13, 1, CSS.INK);
      p.rect(2, top - 14, 1, 3, CSS.INK);
      p.rect(14, top - 14, 1, 3, CSS.INK);

      // Bell.
      p.rect(34, top - 4, 5, 3, CSS.INK);
      p.rect(35, top - 4, 1, 1, CSS.LIGHT);
      p.rect(33, top - 1, 7, 1, CSS.INK);
      p.rect(36, top - 5, 1, 1, CSS.INK);

      // Returns stack.
      p.rect(41, top - 3, 13, 3, CSS.INK);
      p.rect(42, top - 2, 11, 1, CSS.LIGHT);
      p.rect(43, top - 6, 10, 3, CSS.INK);
      p.rect(44, top - 5, 8, 1, CSS.DARK);

      // Desk top overhang and body.
      p.rect(0, top, w, 4, CSS.INK);
      p.rect(1, top + 1, w - 2, 2, CSS.LIGHT);
      p.rect(2, top + 4, w - 4, DESK.h - 4, CSS.INK);
      p.rect(3, top + 4, w - 6, DESK.h - 5, CSS.DARK);
      p.dither(3, top + 4, w - 6, 2, CSS.INK, 8);
      // Two raised front panels.
      const pw = Math.floor((w - 14) / 2);
      for (const px of [6, 8 + pw]) {
        p.rect(px, top + 8, pw, 1, CSS.LIGHT);
        p.rect(px, top + 8, 1, DESK.h - 13, CSS.LIGHT);
        p.rect(px, top + DESK.h - 5, pw, 1, CSS.INK);
        p.rect(px + pw - 1, top + 8, 1, DESK.h - 13, CSS.INK);
      }
    }),
  );
  sprite.position.set(deskX(sceneW), DESK.y - PROPS_H);
  return sprite;
}

// 3x5 pixel letters for the CLOSED sign (no canvas fonts).
const GLYPHS = {
  C: ['###', '#..', '#..', '#..', '###'],
  L: ['#..', '#..', '#..', '#..', '###'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  S: ['###', '#..', '###', '..#', '###'],
  E: ['###', '#..', '##.', '#..', '###'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
};

// A sign hung on the desk front when he closes, so he stays visible dozing behind.
export function createClosedSign(sceneW) {
  const word = 'CLOSED';
  const w = word.length * 4 - 1 + 6;
  const h = 11 + 2;
  const sprite = new Sprite(
    canvasTexture(w, h, (p) => {
      p.rect(0, 0, w, 11, CSS.INK);
      p.rect(1, 1, w - 2, 9, CSS.PAPER);
      [...word].forEach((ch, i) => {
        GLYPHS[ch].forEach((row, y) => {
          for (let x = 0; x < 3; x++) if (row[x] === '#') p.rect(3 + i * 4 + x, 3 + y, 1, 1, CSS.INK);
        });
      });
      // Dither shadow on the desk below it.
      p.dither(1, 11, w - 1, 2, CSS.INK, 8);
    }),
  );
  sprite.position.set(deskX(sceneW) + Math.round((DESK.w - w) / 2), DESK.y + 7);
  sprite.visible = false;
  return sprite;
}
