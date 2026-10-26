// The librarian's mood: patience, closing time and his resting pose.
// At 0 he puts up the CLOSED sign and dozes for a while; manners or coffee reopen early.
import { PATIENCE } from './config.js';
import { CLOSING, COFFEE, MANNERS, MANNERS_REOPEN, REOPEN, pick } from './content/lines.js';
import { createPatience } from './patience.js';

export function createMood({ getLibrary, hud, log, isBusy }) {
  let closed = false;
  let pendingClose = false; // hit 0 mid-fetch: close once he's done
  let reopenAt = 0;
  let timer = null;

  const patience = createPatience({
    onChange: (value) => {
      hud.setPatience(value, { closed });
      settle();
    },
    onEmpty: () => (isBusy() ? (pendingClose = true) : close()),
  });

  // Swap between idle and huff when patience crosses the line, if he's resting.
  function settle() {
    const guy = getLibrary()?.librarian;
    if (!guy || closed) return;
    if (guy.state === 'idle' || guy.state === 'huff') guy.rest();
  }

  function close() {
    closed = true;
    pendingClose = false;
    reopenAt = Date.now() + PATIENCE.closedMs;
    log(CLOSING);
    showClosed();
    hud.setPatience(patience.value, { closed });
    timer = setTimeout(() => reopen(REOPEN), PATIENCE.closedMs);
  }

  function showClosed() {
    const lib = getLibrary();
    lib.sign.visible = true;
    lib.librarian.jumpTo(lib.deskHome);
    lib.librarian.set('closed');
  }

  function reopen(line) {
    clearTimeout(timer);
    closed = false;
    getLibrary().sign.visible = false;
    patience.set(Math.max(patience.value, PATIENCE.reopenAt));
    hud.setPatience(patience.value);
    getLibrary().librarian.rest();
    log(line);
  }

  // Slow recovery while nothing is happening.
  setInterval(() => {
    if (!closed && !isBusy() && patience.value < PATIENCE.max) patience.restore(PATIENCE.regen);
  }, PATIENCE.regenEveryMs);

  hud.setPatience(patience.value);

  return {
    get value() {
      return patience.value;
    },
    get closed() {
      return closed;
    },
    get secondsLeft() {
      return Math.max(1, Math.ceil((reopenAt - Date.now()) / 1000));
    },
    spend: (n) => patience.spend(n),
    manners() {
      patience.restore(PATIENCE.manners);
      if (closed) reopen(MANNERS_REOPEN);
      else log(pick(MANNERS));
    },
    coffee() {
      patience.fill();
      if (closed) reopen(COFFEE);
      else log(COFFEE);
    },
    // A fetch just finished; close now if patience ran out during it.
    afterFetch() {
      if (pendingClose) close();
    },
    // Call after every scene rebuild so the new librarian has the right mood.
    applyToScene() {
      const lib = getLibrary();
      lib.librarian.setRest(() => (patience.value < PATIENCE.huffBelow ? 'huff' : 'idle'));
      if (closed) showClosed();
      else lib.librarian.rest();
    },
  };
}
