// Composes the scene for a given internal width. Rebuilt when the width changes.
import { Container } from 'pixi.js';
import { DESK, FPS, RES } from '../config.js';
import { createShelves } from './shelves.js';
import { createLadder } from './ladder.js';
import { createLibrarian } from './librarian.js';
import { createClosedSign, createDesk, deskX } from './desk.js';
import { createDarkness, createDimmer, createDust, createFloor, createVignette } from './fx.js';

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
  const fxLayer = new Container(); // avalanche books, thrown books
  const dimmer = createDimmer(w);
  const darkness = createDarkness(w);
  vignette.eventMode = 'none';
  dust.container.eventMode = 'none';
  fxLayer.eventMode = 'none';

  // Back to front.
  root.addChild(
    shelves.container,
    floor,
    ladder.sprite,
    librarian.root,
    desk,
    sign,
    fxLayer,
    dust.container,
    vignette,
    dimmer.sprite,
    darkness.sprite,
  );

  // The lights-out lamp starts centred; main.js moves it with the pointer.
  darkness.moveTo(w / 2, RES.H / 2);

  // Screen shake: whole-pixel jitter at animation rate.
  let shakeTimer = null;
  function shake(ms, amp = 2) {
    clearInterval(shakeTimer);
    const end = Date.now() + ms;
    shakeTimer = setInterval(() => {
      if (root.destroyed || Date.now() > end) {
        clearInterval(shakeTimer);
        if (!root.destroyed) root.position.set(0, 0);
        return;
      }
      root.position.set(Math.round((Math.random() * 2 - 1) * amp), Math.round((Math.random() * 2 - 1) * amp));
    }, 1000 / FPS.anim);
  }

  return {
    root,
    w,
    alive: true,
    shelves,
    ladder,
    librarian,
    sign,
    fxLayer,
    dimmer,
    darkness,
    shake,
    deskHome,
    update: (deltaMS) => dust.update(deltaMS),
    destroy() {
      this.alive = false;
      // Librarian frames are cached and shared, so his sprite keeps its textures.
      root.removeChild(librarian.root);
      librarian.root.destroy({ children: true });
      shelves.destroy();
      root.removeChild(dimmer.sprite);
      dimmer.destroy();
      dimmer.sprite.destroy();
      root.destroy({ children: true, texture: true, textureSource: true });
    },
  };
}
