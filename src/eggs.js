// All easter eggs live here. Progress is saved in this visitor's browser.
// Adding one: append to EGG_LIST, trigger it with found(id); the counter total follows.
import gsap from 'gsap';
import { Sprite } from 'pixi.js';
import { CSS, EGGS, FPS, LIB } from './config.js';
import { pick } from './content/lines.js';
import { avalanche } from './scene/avalanche.js';
import { canvasTexture } from './scene/pixel.js';
import { sfx } from './audio.js';

export const EGG_LIST = [
  { id: 'sudo', name: 'Sudo' },
  { id: 'manners', name: 'Manners' },
  { id: 'coffee', name: 'Coffee' },
  { id: 'shh', name: 'Shh' },
  { id: 'rmrf', name: 'rm -rf' },
  { id: 'throw', name: 'Last straw' },
  { id: 'lights', name: 'Lights out' },
  { id: 'xyzzy', name: 'Xyzzy' },
];

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const STORE = 'library.eggs';
const POKE_LINES = ['Hey.', 'Stop that.', "I'm warning you.", 'Last warning.'];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function loadFound() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE)) ?? []);
  } catch {
    return new Set();
  }
}

// ctx: { getLibrary, log, mood, hud, isBusy, run(text), reducedMotion }
export function createEggs(ctx) {
  const found = loadFound();
  let pokes = [];
  let lightsOn = true;
  let lightsTimer = null;
  let konami = 0;
  let playing = false; // a scene-wide egg (avalanche, shush, throw) is running

  const lib = () => ctx.getLibrary();
  const guyFree = () => !ctx.isBusy() && !ctx.mood.closed && !playing;

  function found_(id) {
    if (found.has(id)) return;
    found.add(id);
    try {
      localStorage.setItem(STORE, JSON.stringify([...found]));
    } catch {}
    const egg = EGG_LIST.find((e) => e.id === id);
    ctx.log(`Secret found: ${egg.name} (${found.size}/${EGG_LIST.length}).`);
    setTimeout(() => sfx('secret', { vary: 0 }), 250);
    ctx.hud.setSecrets(found.size, EGG_LIST.length, { flash: true });
  }

  // ── 1. sudo ────────────────────────────────────────────────────
  function sudo() {
    ctx.log("Nice try. You don't have admin rights in MY library.");
    if (guyFree()) lib().librarian.hold('huff', 1200);
    found_('sudo');
  }

  // ── 2/3. manners and coffee (they also restore patience) ──────
  function manners(arg) {
    ctx.mood.manners();
    found_('manners');
    if (arg) ctx.run(arg); // "please resume" is polite *and* a request
  }

  function coffee() {
    ctx.mood.coffee();
    found_('coffee');
  }

  // ── 4. shh: he shushes back and the room dims ─────────────────
  async function shh() {
    found_('shh');
    if (ctx.mood.closed) return ctx.log('...He is already very quiet. He is asleep.');
    ctx.log('SHHHH. This is a LIBRARY.');
    sfx('shush');
    if (playing) return;
    playing = true;
    const L = lib();
    if (!ctx.isBusy()) L.librarian.set('shush');
    const steps = ctx.reducedMotion ? [8] : [4, 8];
    for (const level of steps) {
      L.dimmer.set(level);
      await wait(1000 / FPS.anim);
    }
    await wait(EGGS.shushMs);
    for (const level of [...steps].reverse().slice(1).concat(0)) {
      L.dimmer.set(level);
      await wait(1000 / FPS.anim);
    }
    if (!ctx.isBusy() && L.librarian.state === 'shush') L.librarian.rest();
    playing = false;
  }

  // ── 5. rm -rf: book avalanche ─────────────────────────────────
  async function rmrf() {
    if (ctx.isBusy()) return ctx.log("Not while I'm on the ladder. Absolutely not.");
    if (ctx.mood.closed) return ctx.log("Zzz. (Even asleep, he's guarding the shelves.)");
    if (playing) return;
    playing = true;
    found_('rmrf');
    ctx.log('...Did you just rm -rf my LIBRARY?');
    // A rumble of thuds while the books come down.
    if (!ctx.reducedMotion) for (let i = 0; i < 10; i++) setTimeout(() => sfx('thud', { vary: 0.25 }), 250 + i * 140);
    await avalanche(lib(), { reducedMotion: ctx.reducedMotion });
    ctx.log('Reshelved. Every. Single. One. Again.');
    playing = false;
  }

  // ── 6. poke him five times and he throws a book ───────────────
  function poke() {
    if (ctx.isBusy() || playing) return;
    if (ctx.mood.closed) return ctx.log('Zzz.');
    const now = Date.now();
    pokes = pokes.filter((t) => now - t < EGGS.pokeWindowMs).concat(now);
    if (pokes.length >= EGGS.pokesToThrow) {
      pokes = [];
      throwBook();
      return;
    }
    ctx.log(POKE_LINES[Math.min(pokes.length, POKE_LINES.length) - 1]);
    sfx('huff');
    lib().librarian.hold('huff', LIB.pokeHuffMs);
  }

  async function throwBook() {
    playing = true;
    found_('throw');
    ctx.log('THAT. IS. IT.');
    const L = lib();
    const guy = L.librarian;
    guy.set('throw', { facing: guy.x > L.w / 2 ? -1 : 1 });
    await wait(1000 / (LIB.fps / 3)); // wind-up frame

    // The book arcs out of his hand toward the visitor, then the screen shakes.
    const book = new Sprite(
      canvasTexture(12, 8, (p) => {
        p.rect(0, 0, 12, 8, CSS.INK);
        p.rect(1, 1, 10, 6, CSS.DARK);
        p.rect(1, 3, 10, 2, CSS.PAPER);
      }),
    );
    book.anchor.set(0.5);
    book.position.set(guy.x, guy.y - 34);
    L.fxLayer.addChild(book);
    sfx('throw');
    const path = { t: 0 };
    const from = { x: book.x, y: book.y };
    const to = { x: L.w / 2, y: 120 };
    await new Promise((resolve) =>
      gsap.to(path, {
        t: 1,
        duration: ctx.reducedMotion ? 0.01 : 0.5,
        ease: 'steps(6)',
        onUpdate: () => {
          if (book.destroyed) return;
          const arc = Math.sin(path.t * Math.PI) * 40;
          book.position.set(
            Math.round(from.x + (to.x - from.x) * path.t),
            Math.round(from.y + (to.y - from.y) * path.t - arc),
          );
          book.rotation = Math.round(path.t * 6) * (Math.PI / 4);
        },
        onComplete: resolve,
      }),
    );
    sfx('thud');
    if (!ctx.reducedMotion) L.shake(EGGS.throwShakeMs, 3);
    // Thunk. It drops to the floor and lies there a moment.
    if (!book.destroyed) {
      book.rotation = 0;
      book.y = 255;
    }
    await wait(900);
    book.destroy({ texture: true, textureSource: true });
    ctx.log("...Sorry. That was unprofessional. Don't tell anyone.");
    guy.rest();
    playing = false;
  }

  // ── 7. lights out: lamp follows the cursor ────────────────────
  function setLights(on) {
    lightsOn = on;
    clearTimeout(lightsTimer);
    sfx('click', { vary: 0 });
    lib().darkness.sprite.visible = !on;
    if (!on) lightsTimer = setTimeout(() => setLights(true), EGGS.lightsOutMs);
  }

  function lightsOut(source) {
    found_('lights');
    if (!lightsOn) return ctx.log('It’s already dark. Type nox to bring the lights back.');
    ctx.log(source === 'lumos' ? 'Lumos. You are the lamp now. (nox to stop)' : 'Up up down down... the power just went out.');
    setLights(false);
  }

  document.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    konami = key === KONAMI[konami] ? konami + 1 : key === KONAMI[0] ? 1 : 0;
    if (konami === KONAMI.length) {
      konami = 0;
      if (lightsOn) lightsOut('konami');
      else {
        setLights(true);
        ctx.log('Power restored.');
      }
    }
  });

  // ── 8. xyzzy: unlocks the hidden R.S. book ────────────────────
  function xyzzy() {
    const first = !found.has('xyzzy');
    found_('xyzzy');
    ctx.log(first ? 'A hollow voice says "Fool." ...Fine. The R.S. book is unlocked.' : 'Nothing happens. (It’s already unlocked.)');
    if (first) ctx.run('fetch rs');
  }

  // Returns true when the text was an egg.
  function handle(text) {
    const t = text.trim();
    const lower = t.toLowerCase();
    const [head, ...rest] = lower.split(/\s+/);
    if (head === 'sudo') return sudo(), true;
    if (head === 'please' || head === 'sorry') return manners(head === 'please' ? t.split(/\s+/).slice(1).join(' ') : ''), true;
    if (head === 'coffee') return coffee(), true;
    if (/^sh+$/.test(head) || head === 'shush') return shh(), true;
    if (head === 'rm' && rest[0]?.startsWith('-') && rest[0].includes('r') && rest[0].includes('f')) return rmrf(), true;
    if (head === 'lumos') return lightsOut('lumos'), true;
    if (head === 'nox') {
      if (lightsOn) ctx.log('The lights are already on.');
      else {
        setLights(true);
        ctx.log('Nox. Lights back on.');
      }
      return true;
    }
    if (head === 'xyzzy') return xyzzy(), true;
    return false;
  }

  ctx.hud.setSecrets(found.size, EGG_LIST.length);

  return {
    handle,
    poke,
    isUnlocked: (slug) => slug !== 'rs' || found.has('xyzzy'),
    // Call after every scene rebuild.
    applyToScene() {
      lib().darkness.sprite.visible = !lightsOn;
    },
  };
}
