// Composes the scene for a given internal width. Rebuilt when the width changes.
import { Container } from 'pixi.js';
import { DESK } from '../config.js';
import { createShelves } from './shelves.js';
import { createLadder } from './ladder.js';
import { createLibrarian } from './librarian.js';
import { createClosedSign, createDesk, deskX } from './desk.js';
import { createFloor, createVignette, createDust } from './fx.js';

export function createLibrary(w, books, { reducedMotion, onHover, onSelect, onPoke }) {
  const root = new Container();
  const shelves = createShelves(w, books, { onHover, onSelect });
  const ladder = createLadder(w);
  const floor = createFloor(w);
  const deskHome = deskX(w) + Math.round(DESK.w / 2);
  const librarian = createLibrarian({ x: deskHome, onPoke });
  const desk = createDesk(w);
  const sign = createClosedSign(w);
  const dust = createDust(w, reducedMotion);
  const vignette = createVignette(w);
  vignette.eventMode = 'none';
  dust.container.eventMode = 'none';

  // Back to front.
  root.addChild(shelves.container, floor, ladder.sprite, librarian.root, desk, sign, dust.container, vignette);

  return {
    root,
    w,
    alive: true,
    shelves,
    ladder,
    librarian,
    sign,
    deskHome,
    update: (deltaMS) => dust.update(deltaMS),
    destroy() {
      this.alive = false;
      // Librarian frames are cached and shared, so his sprite keeps its textures.
      root.removeChild(librarian.root);
      librarian.root.destroy({ children: true });
      root.destroy({ children: true, texture: true, textureSource: true });
    },
  };
}
