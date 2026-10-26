// Boot, scaling and letterboxing; wires the console to the librarian.
import { Application, TextureSource } from 'pixi.js';
import { PALETTE, PATIENCE, RES, TOME } from './config.js';
import { BOOKS } from './content/books.js';
import { BUSY, CLOSED, HANDOFF, fetchLine, pick } from './content/lines.js';
import { createCommands } from './commands.js';
import { createLibrary } from './scene/library.js';
import { STATES } from './scene/librarian.js';
import { createFetcher } from './scene/fetch.js';
import { createConsole } from './ui/console.js';
import { createTome } from './ui/tome.js';
import { createHud } from './ui/hud.js';
import { createMood } from './mood.js';
import { createEggs } from './eggs.js';
import './style.css';

TextureSource.defaultOptions.scaleMode = 'nearest';

const stage = document.getElementById('stage');
const consoleEl = document.getElementById('console');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let library = null;
let sceneW = 0;

const tome = createTome(document.getElementById('tome'), {
  // Esc / Return book: back on the shelf it goes.
  onClose: () => {
    fetcher.reshelve();
    ui.log('He shelves it with a sigh.');
  },
});

const fetcher = createFetcher({
  getLibrary: () => library,
  onStart: () => ui.setBusy(true),
  onEnd: () => {
    ui.setBusy(false);
    mood.afterFetch();
  },
  onHandoff: (book, { skipped }) => {
    ui.log(`${pick(HANDOFF)} ${book.title}.`);
    setTimeout(() => tome.open(book), skipped ? 0 : TOME.openDelayMs);
  },
});

const run = createCommands({
  log: (text) => ui.log(text),
  clear: () => ui.clear(),
  fetch(book) {
    if (mood.closed) return ui.log(`${pick(CLOSED)} Back in ${mood.secondsLeft}s. Or ask nicely.`);
    if (fetcher.busy) {
      ui.log(pick(BUSY));
      return mood.spend(PATIENCE.busyCost);
    }
    mood.spend(PATIENCE.fetchCost);
    if (mood.closed) return; // that request was the last straw
    ui.log(fetchLine(mood.value));
    fetcher.fetch(book);
  },
  skip: () => fetcher.skip(),
  unknown: () => mood.spend(PATIENCE.unknownCost),
  canRead: (book) => eggs.isUnlocked(book.slug),
});

const ui = createConsole(consoleEl, {
  onCommand: (text) => devCommand(text) || eggs.handle(text) || run(text),
  onSkip: () => fetcher.skip(),
});

const hud = createHud(consoleEl.querySelector('[data-hud]'));

const mood = createMood({
  getLibrary: () => library,
  hud,
  log: (text) => ui.log(text),
  isBusy: () => fetcher.busy,
});

const eggs = createEggs({
  getLibrary: () => library,
  log: (text) => ui.log(text),
  mood,
  hud,
  isBusy: () => fetcher.busy,
  run: (text) => run(text),
  reducedMotion,
});

// Esc while he's fetching skips straight to the book (the reader handles its own Esc).
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !tome.isOpen && fetcher.busy) fetcher.skip();
});

const app = new Application();
await app.init({
  width: RES.MAX_W,
  height: RES.H,
  background: PALETTE.INK,
  antialias: false,
  resolution: 1,
  roundPixels: true,
});
app.canvas.setAttribute('aria-label', 'A pixel-art library wall full of books');
app.canvas.setAttribute('role', 'img');
stage.appendChild(app.canvas);

// The lights-out lamp follows the pointer (scene pixels). A DOM listener, so the
// scene root never has to be interactive and swallow clicks meant for books.
app.canvas.addEventListener('pointermove', (e) => {
  const r = app.canvas.getBoundingClientRect();
  library?.darkness.moveTo(((e.clientX - r.left) / r.width) * sceneW, ((e.clientY - r.top) / r.height) * RES.H);
});

function build(w) {
  library?.destroy();
  library = createLibrary(w, BOOKS, {
    reducedMotion,
    onHover: (book) => ui.setHover(book),
    // Clicking a spine is the same as typing fetch.
    onSelect: (book) => ui.submit(`fetch ${book.slug}`),
    onPoke: () => eggs.poke(),
  });
  app.stage.addChild(library.root);
  mood.applyToScene();
  eggs.applyToScene();
  if (import.meta.env.DEV) Object.assign(window, { __library: library, __app: app });
}

// Dev-only: `anim <state>` previews one librarian state. Stripped from builds.
function devCommand(text) {
  if (!import.meta.env.DEV || !library) return false;
  const [cmd, arg] = text.toLowerCase().split(/\s+/);
  if (cmd !== 'anim') return false;
  if (!STATES.includes(arg)) ui.log(`anim: one of ${STATES.join(', ')}`);
  else if (!fetcher.busy && !mood.closed) library.librarian.set(arg);
  return true;
}

// Scene width follows the page width only, so height changes (a phone keyboard
// opening) rescale without rebuilding. Scale is in device pixels; with
// integerScale every scene pixel is an exact square.
function fit() {
  const dpr = window.devicePixelRatio || 1;
  const gutter = parseFloat(getComputedStyle(document.body).getPropertyValue('--gutter')) || 16;
  const cssW = document.documentElement.clientWidth - gutter * 2;
  const availW = Math.floor(cssW * dpr);
  const availH = Math.floor((window.innerHeight - consoleEl.offsetHeight - gutter * 3) * dpr);
  const w = Math.max(RES.MIN_W, Math.min(RES.MAX_W, Math.floor(cssW / RES.minCssPerPx)));
  let k = Math.min(availW / w, availH / RES.H);
  k = RES.integerScale ? Math.max(1, Math.floor(k)) : Math.max(1, k);

  if (w !== sceneW) {
    sceneW = w;
    app.renderer.resize(w, RES.H);
    build(w);
  }
  const outW = Math.floor(w * k) / dpr;
  app.canvas.style.width = `${outW}px`;
  app.canvas.style.height = `${Math.floor(RES.H * k) / dpr}px`;
  document.documentElement.style.setProperty('--stage-w', `${outW}px`);
}

app.ticker.add((t) => library?.update(t.deltaMS));
window.addEventListener('resize', fit);
new ResizeObserver(fit).observe(consoleEl);
await document.fonts.ready;
fit();
