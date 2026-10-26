// Composes the scene for a given internal width. Rebuilt when the width changes.
import { Container } from 'pixi.js';
import { createShelves } from './shelves.js';
import { createLadder } from './ladder.js';
import { createFloor, createVignette, createDust } from './fx.js';

export function createLibrary(w, books, { reducedMotion, onHover, onSelect }) {
  const root = new Container();
  const shelves = createShelves(w, books, { onHover, onSelect });
  const ladder = createLadder(w);
  const floor = createFloor(w);
  const dust = createDust(w, reducedMotion);
  const vignette = createVignette(w);
  vignette.eventMode = 'none';
  dust.container.eventMode = 'none';

  // Back to front. The librarian will sit between the ladder and the floor.
  root.addChild(shelves.container, ladder.sprite, floor, dust.container, vignette);

  return {
    root,
    shelves,
    ladder,
    update: (deltaMS) => dust.update(deltaMS),
    destroy: () => root.destroy({ children: true, texture: true, textureSource: true }),
  };
}
