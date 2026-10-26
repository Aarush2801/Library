// Bookcase: wall, rail, crown, posts, boards, plinth and filler spines baked
// into one texture; portfolio books are separate sprites so they can slide out.
import { Container, Sprite } from 'pixi.js';
import { SHELF, CSS } from '../config.js';
import { canvasTexture, rng } from './pixel.js';

const caseBottom = SHELF.floorY;
const pitch = SHELF.rowH + SHELF.board;

// Top of a row's interior (row 0 = bottom shelf).
export function rowTop(row) {
  return SHELF.top + (SHELF.rows - 1 - row) * pitch;
}

// Y where books stand on that row's board.
export function rowBase(row) {
  return rowTop(row) + SHELF.rowH;
}

function layoutBays(w) {
  const x0 = SHELF.side;
  const x1 = w - SHELF.side;
  const n = Math.max(1, Math.round((x1 - x0) / SHELF.bayTarget));
  const each = Math.floor((x1 - x0 - SHELF.divider * (n - 1)) / n);
  const bays = [];
  let x = x0;
  for (let i = 0; i < n; i++) {
    const bw = i === n - 1 ? x1 - x : each;
    bays.push({ x, w: bw });
    x += bw + SHELF.divider;
  }
  return bays;
}

function layoutRow(row, bays, books) {
  const rand = rng(SHELF.seed + row * 131);
  const spines = [];
  let slot = 0;
  for (const bay of bays) {
    let x = bay.x + 1;
    const end = bay.x + bay.w - 1;
    for (;;) {
      const book = books.find((b) => b.shelf === row && b.slot === slot);
      if (!book && rand() < SHELF.gapChance) {
        x += 3 + Math.floor(rand() * 4);
        continue;
      }
      const w = book
        ? SHELF.featureW
        : SHELF.spineMin + Math.floor(rand() * (SHELF.spineMax - SHELF.spineMin + 1));
      const h = book ? SHELF.rowH - 5 : SHELF.rowH - 3 - Math.floor(rand() * 10);
      const style = Math.floor(rand() * 1e6);
      if (x + w > end) break;
      spines.push({ row, slot, x, w, h, book, style });
      x += w + 1;
      slot++;
    }
  }
  return spines;
}

function woodPost(p, x, y, w, h) {
  p.rect(x, y, w, h, CSS.LIGHT);
  p.dither(x + 1, y, w - 2, h, CSS.DARK, 2);
  p.rect(x, y, 1, h, CSS.INK);
  p.rect(x + w - 1, y, 1, h, CSS.INK);
}

// Draws a filler spine with its top-left at (x, y).
function drawFiller(p, s, x = s.x, y = rowBase(s.row) - s.h) {
  const r = rng(s.style);
  const body = [CSS.DARK, CSS.DARK, CSS.LIGHT, CSS.LIGHT, CSS.INK, CSS.PAPER][Math.floor(r() * 6)];
  const accent = body === CSS.INK || body === CSS.LIGHT ? CSS.DARK : body === CSS.PAPER ? CSS.LIGHT : CSS.LIGHT;
  p.rect(x, y, s.w, s.h, body);
  const kind = Math.floor(r() * 4);
  if (kind === 0) {
    p.rect(x, y + 3, s.w, 1, accent);
    p.rect(x, y + s.h - 4, s.w, 1, accent);
  } else if (kind === 1) {
    p.rect(x, y + 4, s.w, 3, accent);
  } else if (kind === 2) {
    p.dither(x, y, s.w, s.h, accent, 4);
  }
  // Rounded-spine shading: shadow on the right edge, cap on top.
  p.rect(x + s.w - 1, y, 1, s.h, body === CSS.INK ? CSS.DARK : CSS.INK);
  if (body !== CSS.INK) p.rect(x, y, s.w - 1, 1, CSS.DARK);
}

// Portfolio books carry a paper label with "type" on it; fillers never do.
function featureTexture(book, w, h) {
  return canvasTexture(w, h, (p) => {
    const body = book.hidden ? CSS.INK : CSS.DARK;
    const band = book.hidden ? CSS.DARK : CSS.LIGHT;
    p.rect(0, 0, w, h, body);
    p.rect(0, 2, w, 1, band);
    p.rect(0, h - 4, w, 1, band);
    p.rect(1, 6, w - 3, 10, CSS.PAPER);
    if (book.hidden) {
      p.rect(3, 9, 1, 1, CSS.INK);
      p.rect(5, 12, 1, 1, CSS.INK);
    } else {
      for (let ly = 8; ly <= 13; ly += 2) p.rect(2, ly, w - 5, 1, CSS.INK);
    }
    p.rect(w - 1, 0, 1, h, book.hidden ? CSS.DARK : CSS.INK);
  });
}

export function createShelves(w, books, { onHover, onSelect } = {}) {
  const bays = layoutBays(w);
  const spines = [];
  for (let row = 0; row < SHELF.rows; row++) spines.push(...layoutRow(row, bays, books));

  const plinthY = rowBase(0) + SHELF.board;
  // withSpines false gives bare shelves, shown while the books are on the floor.
  const drawCase = (withSpines) => canvasTexture(w, caseBottom, (p) => {
    // Wall above the case, then the ladder rail and crown moulding.
    p.rect(0, 0, w, SHELF.crownY, CSS.PAPER);
    p.dither(0, 0, w, SHELF.crownY, CSS.LIGHT, 4);
    p.rect(0, SHELF.railY, w, 1, CSS.LIGHT);
    p.rect(0, SHELF.railY + 1, w, 1, CSS.INK);
    p.rect(0, SHELF.crownY, w, SHELF.top - SHELF.crownY, CSS.LIGHT);
    p.rect(0, SHELF.crownY, w, 1, CSS.INK);
    p.rect(0, SHELF.crownY + 3, w, 1, CSS.DARK);
    p.dither(0, SHELF.crownY + 4, w, 5, CSS.DARK, 2);
    p.rect(0, SHELF.top - 1, w, 1, CSS.INK);

    // Back panel.
    p.rect(0, SHELF.top, w, plinthY - SHELF.top, CSS.INK);
    p.dither(0, SHELF.top, w, plinthY - SHELF.top, CSS.DARK, 1);

    if (withSpines) for (const s of spines) if (!s.book) drawFiller(p, s);

    for (let row = 0; row < SHELF.rows; row++) {
      const y = rowBase(row);
      p.rect(0, y, w, 1, CSS.LIGHT);
      p.rect(0, y + 1, w, 2, CSS.DARK);
      p.rect(0, y + 3, w, 1, CSS.INK);
    }

    // Posts in front of the boards; rail brackets above each post.
    const posts = [[0, SHELF.side], [w - SHELF.side, SHELF.side]];
    for (let i = 0; i < bays.length - 1; i++) posts.push([bays[i].x + bays[i].w, SHELF.divider]);
    for (const [x, pw] of posts) {
      woodPost(p, x, SHELF.top, pw, plinthY - SHELF.top);
      const bx = x + Math.floor(pw / 2) - 1;
      p.rect(bx, SHELF.railY + 2, 2, SHELF.crownY - SHELF.railY - 2, CSS.INK);
    }

    // Plinth with one raised panel per bay.
    p.rect(0, plinthY, w, caseBottom - plinthY, CSS.DARK);
    p.rect(0, plinthY, w, 1, CSS.LIGHT);
    p.rect(0, caseBottom - 1, w, 1, CSS.INK);
    for (const bay of bays) {
      const px = bay.x + 3;
      const pw = bay.w - 6;
      p.rect(px, plinthY + 3, pw, 1, CSS.LIGHT);
      p.rect(px, plinthY + 3, 1, 6, CSS.LIGHT);
      p.rect(px, plinthY + 8, pw, 1, CSS.INK);
      p.rect(px + pw - 1, plinthY + 3, 1, 6, CSS.INK);
    }
  });

  const fullTex = drawCase(true);
  let emptyTex = null; // built on first use
  const caseSprite = new Sprite(fullTex);
  const container = new Container();
  container.addChild(caseSprite);

  const featured = [];
  for (const s of spines) {
    if (!s.book) continue;
    const sprite = new Sprite(featureTexture(s.book, s.w, s.h));
    const restY = rowBase(s.row) - s.h;
    sprite.position.set(s.x, restY);
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';
    sprite.on('pointerover', () => {
      sprite.y = restY - 1;
      onHover?.(s.book);
    });
    sprite.on('pointerout', () => {
      sprite.y = restY;
      onHover?.(null);
    });
    sprite.on('pointertap', () => onSelect?.(s.book));
    container.addChild(sprite);
    featured.push({ book: s.book, sprite, x: s.x, w: s.w, row: s.row, restY });
  }

  const missing = books.filter((b) => !featured.some((f) => f.book === b));
  if (missing.length) {
    console.warn('Books with a slot past the end of their shelf at this width:', missing.map((b) => b.slug));
  }

  return {
    container,
    featured,
    bays,
    spines,
    // A standalone texture for one spine, for the avalanche.
    spineTexture(s) {
      return s.book ? featureTexture(s.book, s.w, s.h) : canvasTexture(s.w, s.h, (p) => drawFiller(p, s, 0, 0));
    },
    // Empty shelves (books gone) or full ones.
    setEmpty(empty) {
      if (empty) emptyTex ??= drawCase(false);
      caseSprite.texture = empty ? emptyTex : fullTex;
      for (const f of featured) f.sprite.visible = !empty;
    },
    // Call before the scene destroys its sprites, so each texture is freed once.
    destroy() {
      caseSprite.texture = fullTex;
      emptyTex?.destroy(true);
    },
  };
}
