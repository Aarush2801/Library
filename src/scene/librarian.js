// The librarian: one AnimatedSprite whose frames swap per state, plus
// stepped movement so he snaps across the floor like a game sprite.
import { AnimatedSprite, Container, Sprite } from 'pixi.js';
import gsap from 'gsap';
import { CSS, FPS, LIB } from '../config.js';
import { canvasTexture } from './pixel.js';
import { librarianFrames } from './librarian-art.js';

export const STATES = ['idle', 'walk', 'push', 'climb', 'grab', 'handoff', 'huff', 'shush', 'throw', 'closed'];
const SIDE_VIEW = new Set(['walk', 'push', 'throw']);

// Stepped tween: position updates FPS.anim times a second, always on whole pixels.
// track() receives the tween so it can be finished early (skip).
function stepTo(target, prop, to, speed, track) {
  const from = target[prop];
  const duration = Math.abs(to - from) / speed;
  if (!duration) return Promise.resolve();
  const proxy = { v: from };
  return new Promise((resolve) => {
    track(gsap.to(proxy, {
      v: to,
      duration,
      ease: `steps(${Math.max(1, Math.round(duration * FPS.anim))})`,
      onUpdate: () => (target[prop] = Math.round(proxy.v)),
      onComplete: resolve,
    }));
  });
}

export function createLibrarian({ x, onPoke }) {
  const anims = librarianFrames();
  const root = new Container();

  const shadow = new Sprite(
    canvasTexture(14, 2, (p) => {
      p.dither(1, 0, 12, 1, CSS.INK, 8);
      p.dither(0, 1, 14, 1, CSS.INK, 12);
    }),
  );
  shadow.anchor.set(0.5, 0);

  const sprite = new AnimatedSprite(anims.idle.frames);
  sprite.anchor.set(0.5, 1);
  sprite.eventMode = 'static';
  sprite.cursor = 'pointer';
  sprite.on('pointertap', () => onPoke?.());
  root.addChild(shadow, sprite);

  let state = null;
  let restState = () => 'idle'; // what he falls back to; huff when patience is low
  let active = null; // the movement tween in progress
  const track = (tween) => (active = tween);
  const pos = { x: Math.round(x), y: LIB.walkY };

  function place() {
    if (sprite.destroyed) return; // scene was rebuilt mid-tween
    sprite.position.set(pos.x, pos.y);
    shadow.position.set(pos.x, LIB.walkY - 1);
    shadow.visible = pos.y >= LIB.walkY;
  }

  // Proxy so stepTo can write x/y and the sprite follows.
  const body = {
    get x() {
      return pos.x;
    },
    set x(v) {
      pos.x = v;
      place();
    },
    get y() {
      return pos.y;
    },
    set y(v) {
      pos.y = v;
      place();
    },
  };

  function set(next, { facing } = {}) {
    if (!anims[next]) throw new Error(`Unknown librarian state: ${next}`);
    if (sprite.destroyed) return;
    // Only side-view states flip; front and back views always face the visitor.
    sprite.scale.x = SIDE_VIEW.has(next) ? (facing ?? sprite.scale.x) : 1;
    if (next === state) return;
    state = next;
    const a = anims[next];
    sprite.textures = a.frames;
    sprite.animationSpeed = a.fps / 60;
    sprite.loop = a.loop;
    sprite.gotoAndPlay(0);
  }

  set('idle');
  place();

  return {
    root,
    get state() {
      return state;
    },
    get x() {
      return pos.x;
    },
    get y() {
      return pos.y;
    },
    set,
    async walkTo(tx) {
      tx = Math.round(tx);
      if (tx === pos.x) return;
      set('walk', { facing: tx > pos.x ? 1 : -1 });
      await stepTo(body, 'x', tx, LIB.walkSpeed, track);
    },
    // Walks while dragging something along (the ladder) via onStep.
    async pushTo(tx, onStep) {
      tx = Math.round(tx);
      if (tx === pos.x) return;
      set('push', { facing: tx > pos.x ? 1 : -1 });
      const start = pos.x;
      const proxy = {
        get x() {
          return pos.x;
        },
        set x(v) {
          body.x = v;
          onStep?.(v - start);
        },
      };
      await stepTo(proxy, 'x', tx, LIB.pushSpeed, track);
    },
    async climbTo(ty) {
      ty = Math.round(ty);
      if (ty === pos.y) return;
      set('climb');
      await stepTo(body, 'y', ty, LIB.climbSpeed, track);
    },
    setRest(fn) {
      restState = fn;
    },
    // Back to the resting pose (idle, or huff when he's had enough).
    rest() {
      set(restState());
    },
    // Skip support: complete the current move instantly, or teleport.
    finishMove() {
      active?.progress(1);
      active = null;
    },
    jumpTo(x, y = LIB.walkY) {
      pos.x = Math.round(x);
      pos.y = Math.round(y);
      place();
    },
    // Hold a state for a while, then return to idle unless something else took over.
    async hold(name, ms) {
      set(name);
      await new Promise((r) => setTimeout(r, ms));
      if (state === name) set(restState());
    },
  };
}
