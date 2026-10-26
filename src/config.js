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
  minCssPerPx: 1.4, // scene width comes from page width only, so height changes (phone keyboard) never rebuild
};

export const FPS = {
  anim: 12,
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

// Speeds in scene pixels per second.
export const LIB = {
  frameW: 16,
  frameH: 36,
  walkY: 250, // feet on the floor
  fps: 12,
  walkSpeed: 48,
  pushSpeed: 34,
  climbSpeed: 36,
  pokeHuffMs: 1000,
};

export const DESK = {
  w: 56,
  h: 24,
  right: 40, // gap to the right edge of the scene, clear of the corner falloff
  y: 238, // desk top
};

export const DUST = {
  count: 24,
};

// Fetch sequence timings (all 20% quicker than the first pass).
export const FETCH = {
  reach: 20, // feet sit this far below the book row's base, so hands reach the spine
  slideSteps: 3, // book slides out 2px per animation frame
  grabMs: 500,
  handoffMs: 1500,
};

// Book reader.
export const TOME = {
  fps: 12,
  // Turning-page width per frame, as a share of a page. Positive = still on
  // the starting side, negative = crossed the spine.
  turnFrames: [0.75, 0.4, 0.1, -0.4, -0.75],
  dissolveLevels: [2, 5, 8, 11, 14, 16],
  openDelayMs: 500, // pause after the handoff before the book opens
  loansKept: 5, // past borrow dates stamped on the DATE DUE card
  loanDays: 14,
};

// Patience: 0..100. Costs per CLAUDE.md §5; regen and reopen values are tunable.
export const PATIENCE = {
  start: 100,
  max: 100,
  fetchCost: 12,
  unknownCost: 5,
  busyCost: 8,
  huffBelow: 50, // resting pose becomes the huff below this
  lowBelow: 30, // meter blinks below this
  closedMs: 9000,
  reopenAt: 40,
  manners: 25, // please / sorry
  regenEveryMs: 4000, // slow recovery while he's idle
  regen: 1,
};
