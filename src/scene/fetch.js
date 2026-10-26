// The fetch sequence: walk to the ladder, push it under the book, climb,
// slide the book out, climb down, walk back to the desk, hand it over.
// skip() jumps straight to the handoff.
import { FETCH, LADDER, LIB, SHELF } from '../config.js';
import { rowBase } from './shelves.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

class Aborted extends Error {}
class Skipped extends Error {}

export function createFetcher({ getLibrary, onStart, onHandoff, onEnd }) {
  let busy = false;
  let skipping = false;
  let out = null; // the spine currently off its shelf
  const wakers = new Set();

  // A wait that skip() can cut short.
  function sleep(ms) {
    return new Promise((resolve) => {
      const done = () => {
        clearTimeout(timer);
        wakers.delete(done);
        resolve();
      };
      const timer = setTimeout(done, ms);
      wakers.add(done);
    });
  }

  function reshelve() {
    if (out && !out.sprite.destroyed) {
      out.sprite.visible = true;
      out.sprite.y = out.restY;
    }
    out = null;
  }

  async function walkSequence({ lib, spot, ladderX }) {
    const { librarian: guy, ladder } = lib;
    const check = () => {
      if (!lib.alive) throw new Aborted();
      if (skipping) throw new Skipped();
    };

    if (spot.row > 0) {
      const dx = ladderX - ladder.x;
      if (Math.abs(dx) > 1) {
        // Stand on the far side of the ladder and push it along.
        const start = dx < 0 ? ladder.x + LADDER.w + 7 : ladder.x - 7;
        await guy.walkTo(start);
        check();
        const l0 = ladder.x;
        await guy.pushTo(start + dx, (d) => (ladder.x = l0 + d));
        check();
        ladder.x = ladderX;
      }
      await guy.walkTo(ladder.x + Math.ceil(LADDER.w / 2));
      check();
      await guy.climbTo(rowBase(spot.row) + FETCH.reach);
      check();
    } else {
      await guy.walkTo(spot.x + Math.round(spot.w / 2));
      check();
    }

    guy.set('grab');
    for (let i = 0; i < FETCH.slideSteps; i++) {
      spot.sprite.y -= 2;
      await sleep(1000 / LIB.fps);
      check();
    }
    spot.sprite.visible = false;
    out = spot;
    await sleep(FETCH.grabMs);
    check();

    if (guy.y !== LIB.walkY) await guy.climbTo(LIB.walkY);
    check();
    await guy.walkTo(lib.deskHome);
    check();
  }

  // Skip: put everything where the sequence would have left it.
  function snapToEnd({ lib, spot, ladderX }) {
    if (spot.row > 0) lib.ladder.x = ladderX;
    spot.sprite.visible = false;
    out = spot;
    lib.librarian.jumpTo(lib.deskHome);
  }

  async function fetch(book) {
    const lib = getLibrary();
    const spot = lib.shelves.featured.find((f) => f.book === book);
    if (!spot) return false;
    const plan = {
      lib,
      spot,
      ladderX: clamp(Math.round(spot.x + spot.w / 2 - LADDER.w / 2), SHELF.side, lib.w - SHELF.side - LADDER.w),
    };

    busy = true;
    skipping = false;
    reshelve();
    onStart?.(book);
    try {
      let skipped = false;
      try {
        await walkSequence(plan);
      } catch (e) {
        if (!(e instanceof Skipped)) throw e;
        snapToEnd(plan);
        skipped = true;
      }
      lib.librarian.set('handoff');
      onHandoff?.(book, { skipped });
      busy = false;
      onEnd?.(book);
      await sleep(FETCH.handoffMs);
      if (lib.librarian.state === 'handoff') lib.librarian.rest();
      return true;
    } catch (e) {
      if (!(e instanceof Aborted)) throw e;
      out = null; // the rebuilt scene has every book back on its shelf
      return false;
    } finally {
      if (busy) {
        busy = false;
        onEnd?.(book);
      }
    }
  }

  return {
    get busy() {
      return busy;
    },
    fetch,
    reshelve,
    skip() {
      if (!busy) return false;
      skipping = true;
      getLibrary().librarian.finishMove();
      for (const wake of [...wakers]) wake();
      return true;
    },
  };
}
