// rm -rf: every book on the wall falls to the floor (Matter.js), lies there a
// moment, then vanishes back onto the shelves a few at a time.
import { Sprite, Ticker } from 'pixi.js';
import { AVALANCHE, LIB } from '../config.js';
import { rowBase } from './shelves.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const STEP = Math.PI / 8; // rotation snaps to 22.5° so falling books stay chunky

export async function avalanche(lib, { reducedMotion }) {
  const { shelves, fxLayer } = lib;
  if (reducedMotion) {
    shelves.setEmpty(true);
    await wait(AVALANCHE.reducedHoldMs);
    shelves.setEmpty(false);
    return;
  }

  const { default: Matter } = await import('matter-js');
  const { Engine, Bodies, Body, Composite } = Matter;
  const engine = Engine.create({ gravity: { x: 0, y: 1, scale: AVALANCHE.gravity } });
  const thick = 40;
  Composite.add(engine.world, [
    Bodies.rectangle(lib.w / 2, AVALANCHE.groundY + thick / 2, lib.w * 2, thick, { isStatic: true }),
    Bodies.rectangle(-thick / 2, 0, thick, 1000, { isStatic: true }),
    Bodies.rectangle(lib.w + thick / 2, 0, thick, 1000, { isStatic: true }),
  ]);

  // One body per spine, starting exactly where it stood. Lower shelves let go first.
  const books = shelves.spines.map((s) => {
    const sprite = new Sprite(shelves.spineTexture(s));
    sprite.anchor.set(0.5);
    sprite.position.set(s.x + s.w / 2, rowBase(s.row) - s.h / 2);
    fxLayer.addChild(sprite);
    const body = Bodies.rectangle(sprite.x, sprite.y, s.w, s.h, {
      friction: 0.7,
      frictionStatic: 1,
      restitution: 0.08,
      isSleeping: false,
    });
    return { sprite, body, releaseAt: s.row * AVALANCHE.rowDelayMs + Math.random() * AVALANCHE.jitterMs };
  });
  shelves.setEmpty(true);

  let elapsed = 0;
  const tick = (t) => {
    if (!lib.alive) return;
    elapsed += t.deltaMS;
    for (const b of books) {
      if (!b.added && elapsed >= b.releaseAt) {
        b.added = true;
        Body.setVelocity(b.body, { x: (Math.random() - 0.5) * 3, y: 0 });
        Body.setAngularVelocity(b.body, (Math.random() - 0.5) * 0.15);
        Composite.add(engine.world, b.body);
      }
    }
    Engine.update(engine, Math.min(t.deltaMS, 33));
    for (const b of books) {
      if (!b.added || b.sprite.destroyed) continue;
      b.sprite.position.set(Math.round(b.body.position.x), Math.round(b.body.position.y));
      b.sprite.rotation = Math.round(b.body.angle / STEP) * STEP;
    }
  };
  Ticker.shared.add(tick);

  await wait(AVALANCHE.settleMs);
  lib.librarian.set('huff');

  // Reshelve: books blink out a handful per frame, then the shelves fill back up.
  const order = books.sort(() => Math.random() - 0.5);
  for (let i = 0; i < order.length; i += AVALANCHE.reshelvePerFrame) {
    if (!lib.alive) break;
    for (const b of order.slice(i, i + AVALANCHE.reshelvePerFrame)) b.sprite.visible = false;
    await wait(1000 / LIB.fps);
  }
  Ticker.shared.remove(tick);
  Engine.clear(engine);
  for (const b of books) b.sprite.destroy({ texture: true, textureSource: true });
  if (lib.alive) {
    shelves.setEmpty(false);
    lib.librarian.rest();
  }
}
