// Tiny chiptune synth: renders square/triangle/noise blips into WAV data URIs
// for Howler. Placeholders until real jsfxr exports land in public/sfx/.

const RATE = 22050;

// Each voice: { wave, from, to (Hz), ms, vol, at (ms offset) }.
function render(voices) {
  const total = Math.max(...voices.map((v) => (v.at ?? 0) + v.ms));
  const out = new Float32Array(Math.ceil((total / 1000) * RATE));
  let noise = 1;
  for (const v of voices) {
    const start = Math.floor(((v.at ?? 0) / 1000) * RATE);
    const n = Math.floor((v.ms / 1000) * RATE);
    let phase = 0;
    let held = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const f = v.from + (v.to - v.from) * t;
      phase = (phase + f / RATE) % 1;
      let s;
      if (v.wave === 'noise') {
        // Sample-and-hold noise at the voice frequency: crunchy, NES-ish.
        if (phase < f / RATE) {
          noise ^= noise << 13;
          noise ^= noise >> 17;
          noise ^= noise << 5;
          held = ((noise >>> 0) / 4294967296) * 2 - 1;
        }
        s = held;
      } else if (v.wave === 'triangle') s = 4 * Math.abs(phase - 0.5) - 1;
      else s = phase < (v.duty ?? 0.5) ? 1 : -1;
      const env = Math.min(1, i / 40) * (1 - t) ** (v.decay ?? 1); // tiny attack, linear-ish decay
      out[start + i] += s * env * v.vol;
    }
  }
  return out;
}

function toWav(samples) {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const dv = new DataView(buf);
  const str = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  dv.setUint32(4, 36 + samples.length * 2, true);
  str(8, 'WAVEfmt ');
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, RATE, true);
  dv.setUint32(28, RATE * 2, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  str(36, 'data');
  dv.setUint32(40, samples.length * 2, true);
  samples.forEach((s, i) => dv.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x7fff, true));
  let bin = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(bin)}`;
}

const notes = (list, ms, wave = 'square', vol = 0.25) =>
  list.map((f, i) => ({ wave, from: f, to: f, ms, vol, at: i * ms, duty: 0.25 }));

export const PATCHES = {
  step: [{ wave: 'noise', from: 3000, to: 1500, ms: 35, vol: 0.18 }],
  rung: [{ wave: 'square', from: 260, to: 200, ms: 45, vol: 0.15, duty: 0.25 }],
  scrape: [{ wave: 'noise', from: 900, to: 600, ms: 90, vol: 0.12 }],
  slide: [{ wave: 'square', from: 500, to: 900, ms: 50, vol: 0.15, duty: 0.125 }],
  pop: [{ wave: 'square', from: 880, to: 1320, ms: 60, vol: 0.18 }],
  handoff: notes([523, 784], 70),
  open: notes([392, 523, 659, 784], 55, 'triangle', 0.35),
  close: notes([784, 659, 523, 392], 55, 'triangle', 0.35),
  page: [{ wave: 'noise', from: 6000, to: 2500, ms: 70, vol: 0.12, decay: 2 }],
  stamp: [
    { wave: 'square', from: 120, to: 70, ms: 90, vol: 0.3 },
    { wave: 'noise', from: 2000, to: 800, ms: 60, vol: 0.2 },
  ],
  huff: [{ wave: 'noise', from: 1800, to: 700, ms: 220, vol: 0.14, decay: 1.5 }],
  shush: [{ wave: 'noise', from: 9000, to: 7000, ms: 600, vol: 0.12, decay: 0.6 }],
  throw: [{ wave: 'square', from: 1000, to: 180, ms: 260, vol: 0.18, duty: 0.25 }],
  thud: [
    { wave: 'square', from: 90, to: 50, ms: 120, vol: 0.35 },
    { wave: 'noise', from: 1200, to: 300, ms: 90, vol: 0.25 },
  ],
  secret: notes([523, 659, 784, 1047], 70),
  closed: [{ wave: 'triangle', from: 110, to: 70, ms: 700, vol: 0.4, decay: 0.7 }],
  reopen: notes([392, 523], 80),
  happy: notes([659, 784, 1047], 60),
  error: [{ wave: 'square', from: 150, to: 110, ms: 140, vol: 0.18 }],
  type: [{ wave: 'square', from: 1200, to: 1200, ms: 15, vol: 0.08, duty: 0.125 }],
  click: [
    { wave: 'noise', from: 5000, to: 5000, ms: 15, vol: 0.2 },
    { wave: 'square', from: 1600, to: 1600, ms: 10, vol: 0.1, at: 15 },
  ],
};

export function synth(name) {
  return toWav(render(PATCHES[name]));
}
