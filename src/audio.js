// Howler wrapper. Sound is off until the visitor turns it on; the choice is
// remembered in their browser. Sounds are built on first use.
import { Howl, Howler } from 'howler';
import { SFX } from './config.js';
import { synth } from './sfx-synth.js';

const STORE = 'library.sound';
const howls = new Map();
let enabled = false;
try {
  enabled = localStorage.getItem(STORE) === 'on';
} catch {}
Howler.mute(!enabled);

function howl(name) {
  if (!howls.has(name)) {
    // A real file in public/sfx/ wins over the synth placeholder.
    const src = SFX.files[name] ?? synth(name);
    howls.set(name, new Howl({ src: [src], volume: SFX.volume }));
  }
  return howls.get(name);
}

// Play a named effect. vary: random pitch spread so repeats don't drone.
export function sfx(name, { vary = 0.06 } = {}) {
  if (!enabled) return;
  const h = howl(name);
  const id = h.play();
  if (vary) h.rate(1 + (Math.random() * 2 - 1) * vary, id);
}

export function soundOn() {
  return enabled;
}

export function setSound(on) {
  enabled = on;
  Howler.mute(!on);
  try {
    localStorage.setItem(STORE, on ? 'on' : 'off');
  } catch {}
}
