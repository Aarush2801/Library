// Boot, integer scaling and letterboxing.
import { Application, TextureSource } from 'pixi.js';
import { PALETTE, RES } from './config.js';
import { BOOKS } from './content/books.js';
import { createLibrary } from './scene/library.js';
import { createConsole } from './ui/console.js';
import './style.css';

TextureSource.defaultOptions.scaleMode = 'nearest';

const stage = document.getElementById('stage');
const consoleEl = document.getElementById('console');
const ui = createConsole(consoleEl);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

let library = null;
let sceneW = 0;

function build(w) {
  library?.destroy();
  library = createLibrary(w, BOOKS, {
    reducedMotion,
    onHover: (book) => ui.setCaption(book),
    onSelect: (book) => ui.setCaption(book),
  });
  app.stage.addChild(library.root);
}

// Scale in *device* pixels. With integerScale every scene pixel is an exact
// square; otherwise the scene fills the space. Narrow screens get a narrower
// scene (fewer slots per shelf) rather than a squashed one.
// The scene and console are centred together, so measure what the console leaves.
function fit() {
  const dpr = window.devicePixelRatio || 1;
  const gutter = parseFloat(getComputedStyle(document.body).getPropertyValue('--gutter')) || 16;
  const availW = Math.floor((document.documentElement.clientWidth - gutter * 2) * dpr);
  const availH = Math.floor((window.innerHeight - consoleEl.offsetHeight - gutter * 3) * dpr);
  let k = Math.min(availW / RES.MIN_W, availH / RES.H);
  k = RES.integerScale ? Math.max(1, Math.floor(k)) : Math.max(1, k);
  const w = Math.max(RES.MIN_W, Math.min(RES.MAX_W, Math.floor(availW / k)));

  if (w !== sceneW) {
    sceneW = w;
    app.renderer.resize(w, RES.H);
    build(w);
  }
  const cssW = Math.floor(w * k) / dpr;
  app.canvas.style.width = `${cssW}px`;
  app.canvas.style.height = `${Math.floor(RES.H * k) / dpr}px`;
  document.documentElement.style.setProperty('--stage-w', `${cssW}px`);
}

app.ticker.add((t) => library?.update(t.deltaMS));
window.addEventListener('resize', fit);
new ResizeObserver(fit).observe(consoleEl);
await document.fonts.ready;
fit();
