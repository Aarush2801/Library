// Single source of truth for palette, sizes and timings.

export const PALETTE = {
  INK: 0x0d0d0d,
  DARK: 0x5a5a5a,
  LIGHT: 0xb4b4b4,
  PAPER: 0xf0efe8,
};

export const CSS = {
  INK: '#0d0d0d',
  DARK: '#5a5a5a',
  LIGHT: '#b4b4b4',
  PAPER: '#f0efe8',
};

// Internal resolution. Height is fixed; width shrinks on narrow screens so
// portrait phones show fewer slots per shelf instead of fractional scaling.
// integerScale: false lets the scene fill the space above the console at any
// scale (Aarush's call; pixels may be slightly uneven). true restores whole-number steps.
export const RES = {
  H: 270,
  MAX_W: 480,
  MIN_W: 240,
  integerScale: false,
};

export const FPS = {
  anim: 10,
  dust: 8,
};

// Bookcase geometry. Row 0 is the bottom shelf.
export const SHELF = {
  railY: 3,
  crownY: 8,
  top: 18,
  rows: 6,
  rowH: 31,
  board: 4,
  plinth: 12,
  floorY: 240,
  side: 6,
  divider: 4,
  bayTarget: 100,
  spineMin: 5,
  spineMax: 9,
  featureW: 9,
  gapChance: 0.07,
  seed: 9173,
};

export const LADDER = {
  w: 15,
  rungGap: 8,
  startX: 0.62, // fraction of scene width
};

export const DUST = {
  count: 24,
};
