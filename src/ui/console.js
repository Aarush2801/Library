// Bottom console panel: hover caption, scrolling log, command chips, input.
import { COMMANDS } from '../commands.js';

const MAX_LINES = 40;

export function createConsole(root, { onCommand, onSkip }) {
  const hover = root.querySelector('[data-hover]');
  const logEl = root.querySelector('[data-log]');
  const list = root.querySelector('[data-commands]');
  const form = root.querySelector('[data-form]');
  const input = root.querySelector('[data-input]');
  const skipBtn = root.querySelector('[data-skip]');
  skipBtn.addEventListener('click', () => onSkip());
  const history = [];
  let cursor = 0;

  for (const cmd of COMMANDS) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = cmd.name;
    button.title = cmd.hint;
    button.addEventListener('click', () => submit(cmd.name));
    li.append(button);
    list.append(li);
  }

  function log(text, kind = 'say') {
    const li = document.createElement('li');
    li.className = `line line--${kind}`;
    li.textContent = text;
    logEl.append(li);
    while (logEl.children.length > MAX_LINES) logEl.firstChild.remove();
    logEl.scrollTop = logEl.scrollHeight;
  }

  function submit(raw) {
    const text = raw.trim();
    if (!text) return;
    history.push(text);
    cursor = history.length;
    input.value = '';
    log(`> ${text}`, 'cmd');
    onCommand(text);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submit(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    cursor = Math.max(0, Math.min(history.length, cursor + (e.key === 'ArrowUp' ? -1 : 1)));
    input.value = history[cursor] ?? '';
  });

  return {
    log,
    submit,
    // The Skip button only shows while the librarian is fetching.
    setBusy(busy) {
      const hadFocus = document.activeElement === skipBtn;
      skipBtn.hidden = !busy;
      if (hadFocus && !busy) input.focus();
    },
    clear() {
      logEl.replaceChildren();
    },
    setHover(book) {
      hover.textContent = book ? `${book.hidden ? '???' : book.title}  ·  ${book.call}` : '';
    },
  };
}
