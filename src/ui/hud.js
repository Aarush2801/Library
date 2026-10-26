// HUD in the console bar: a ten-segment patience meter and the secrets counter.
import { PATIENCE } from '../config.js';

const SEGMENTS = 10;

export function createHud(root) {
  const meter = root.querySelector('[data-meter]');
  const label = root.querySelector('[data-meter-label]');
  const secrets = root.querySelector('[data-secrets]');
  const segs = Array.from({ length: SEGMENTS }, () => {
    const s = document.createElement('span');
    s.className = 'meter__seg';
    meter.append(s);
    return s;
  });

  return {
    setPatience(value, { closed = false } = {}) {
      const filled = Math.ceil((value / PATIENCE.max) * SEGMENTS);
      segs.forEach((s, i) => s.classList.toggle('is-on', i < filled));
      meter.setAttribute('aria-valuenow', String(value));
      meter.setAttribute('aria-valuetext', closed ? 'Closed' : `${value} of ${PATIENCE.max}`);
      root.classList.toggle('is-low', !closed && value < PATIENCE.lowBelow);
      root.classList.toggle('is-closed', closed);
      label.textContent = closed ? 'Closed' : 'Patience';
    },
    setSecrets(n, total, { flash = false } = {}) {
      secrets.textContent = `${n}/${total}`;
      secrets.setAttribute('aria-label', `${n} of ${total} secrets found`);
      if (flash) {
        secrets.classList.remove('is-new');
        void secrets.offsetWidth; // restart the animation
        secrets.classList.add('is-new');
      }
    },
  };
}
