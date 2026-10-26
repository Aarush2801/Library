// Pixel-art open book for the reader, drawn on a small canvas and scaled up.
// Page turns are frame-by-frame redraws (no transforms); opening and closing
// dissolve through the Bayer matrix.
import { CSS, TOME } from '../config.js';
import { BAYER4, painter, rng } from '../scene/pixel.js';

export const LAYOUTS = {
  spread: {
    w: 320,
    h: 200,
    spine: 160,
    pages: [
      { x: 12, w: 147 },
      { x: 161, w: 147 },
    ],
    pageY: 8,
    pageH: 179,
    // Where the HTML text sits, in book pixels.
    text: [
      { x: 22, y: 18, w: 128, h: 160 },
      { x: 170, y: 18, w: 128, h: 160 },
    ],
  },
  single: {
    w: 172,
    h: 220,
    spine: 8,
    pages: [{ x: 9, w: 153 }],
    pageY: 8,
    pageH: 199,
    text: [{ x: 20, y: 18, w: 132, h: 180 }],
  },
};

function cover(p, L) {
  p.rect(1, 2, L.w - 2, L.h - 2, CSS.INK);
  p.rect(0, 3, L.w, L.h - 4, CSS.INK);
  p.rect(2, 3, L.w - 4, L.h - 4, CSS.DARK);
  p.rect(2, 3, L.w - 4, 1, CSS.LIGHT);
  p.dither(2, L.h - 8, L.w - 4, 6, CSS.INK, 6);
}

// Stepped page edges under each page so the book looks thick.
function pageStack(p, L) {
  const y = L.pageY + L.pageH;
  for (const pg of L.pages) {
    p.rect(pg.x, y, pg.w, 4, CSS.INK);
    p.rect(pg.x + 1, y, pg.w - 2, 1, CSS.LIGHT);
    p.rect(pg.x + 1, y + 2, pg.w - 2, 1, CSS.LIGHT);
  }
}

function page(p, L, pg, { lines = false, back = false, top = L.pageY, h = L.pageH } = {}) {
  p.rect(pg.x, top, pg.w, h, CSS.INK);
  p.rect(pg.x + 1, top + 1, pg.w - 2, h - 2, back ? CSS.LIGHT : CSS.PAPER);
  // Shade toward the spine.
  const nearSpine = pg.x + pg.w / 2 < L.spine ? pg.x + pg.w - 9 : pg.x + 1;
  if (pg.w > 12) p.dither(nearSpine, top + 1, 8, h - 2, CSS.LIGHT, back ? 0 : 6);
  if (lines && pg.w > 24) {
    const r = rng(pg.x * 7 + 3);
    for (let y = top + 14; y < top + h - 12; y += 8) {
      const len = Math.floor((pg.w - 24) * (0.55 + r() * 0.45));
      p.rect(pg.x + 10, y, len, 1, CSS.DARK);
    }
  }
}

function spine(p, L) {
  if (L.pages.length === 2) p.rect(L.spine - 1, L.pageY - 2, 2, L.pageH + 4, CSS.INK);
}

// frame: null for a still book, or { dir: 1 | -1, i } for page-turn frame i.
export function drawBook(ctx, L, turn = null) {
  const p = painter(ctx);
  ctx.clearRect(0, 0, L.w, L.h);
  cover(p, L);
  pageStack(p, L);
  for (const pg of L.pages) page(p, L, pg, { lines: !!turn });
  spine(p, L);
  if (!turn) return;

  // Turning page: anchored at the spine, narrowing then widening on the other
  // side. It lifts a few pixels at the narrowest frames.
  const f = TOME.turnFrames[turn.i];
  const lift = Math.round((1 - Math.abs(f)) * 4);
  const top = L.pageY - lift;
  const h = L.pageH + lift;
  const full = L.pages[L.pages.length - 1].w;
  const width = Math.max(2, Math.round(Math.abs(f) * full));
  const forward = turn.dir > 0;
  if (L.pages.length === 2) {
    // f > 0: still on the side it started from; f < 0: crossed the spine.
    const onRight = forward ? f > 0 : f < 0;
    const x = onRight ? L.spine + 1 : L.spine - 1 - width;
    page(p, L, { x, w: width }, { lines: true, back: f < 0, top, h });
  } else {
    page(p, L, { x: L.spine + 1, w: width }, { lines: true, back: !forward, top, h });
  }
}

// Copy `src` into `dst`, keeping only pixels whose Bayer threshold is below level (0..16).
export function dissolve(dst, src, level) {
  const { width: w, height: h } = src.canvas;
  dst.clearRect(0, 0, w, h);
  if (level >= 16) return dst.drawImage(src.canvas, 0, 0);
  const img = src.getImageData(0, 0, w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (BAYER4[y & 3][x & 3] >= level) d[(y * w + x) * 4 + 3] = 0;
    }
  }
  dst.putImageData(img, 0, 0);
}
