// Patience: a number from 0 to max. Reports every change and the moment it hits 0.
import { PATIENCE } from './config.js';

export function createPatience({ onChange, onEmpty }) {
  let value = PATIENCE.start;

  function set(next) {
    const prev = value;
    value = Math.max(0, Math.min(PATIENCE.max, Math.round(next)));
    if (value === prev) return;
    onChange?.(value, prev);
    if (value === 0) onEmpty?.();
  }

  return {
    get value() {
      return value;
    },
    set,
    spend: (n) => set(value - n),
    restore: (n) => set(value + n),
    fill: () => set(PATIENCE.max),
  };
}
