// Bottom console panel: status line, clickable command list, input.
// Commands only echo until the librarian is hired (step 4).
import { COMMANDS } from '../commands.js';

export function createConsole(root, { onCommand } = {}) {
  const caption = root.querySelector('[data-caption]');
  const list = root.querySelector('[data-commands]');
  const form = root.querySelector('[data-form]');
  const input = root.querySelector('[data-input]');
  const idle = caption.textContent;
  let message = idle;

  for (const cmd of COMMANDS) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = cmd.name;
    button.title = cmd.hint;
    button.addEventListener('click', () => run(cmd.name));
    li.append(button);
    list.append(li);
  }

  function say(text) {
    message = text;
    caption.textContent = text;
  }

  function run(raw) {
    const text = raw.trim();
    if (!text) return;
    input.value = '';
    say(onCommand?.(text) ?? `> ${text}: nobody's at the desk yet.`);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run(input.value);
  });

  return {
    say,
    setCaption(book) {
      caption.textContent = book
        ? `${book.hidden ? '???' : book.title.toUpperCase()}  ·  ${book.call}`
        : message;
    },
  };
}
