// Parser + command table. Book matching: slug, then aliases, then a title substring.
import { BOOKS, OWNER } from './content/books.js';
import { pick, UNKNOWN } from './content/lines.js';

export const COMMANDS = [
  { name: 'help', hint: 'list commands' },
  { name: 'ls', hint: 'list the books' },
  { name: 'resume', hint: 'fetch the résumé' },
  { name: 'projects', hint: 'fetch the projects' },
  { name: 'github', hint: 'fetch the GitHub book' },
  { name: 'contact', hint: 'fetch contact info' },
  { name: 'random', hint: 'any book' },
  { name: 'whoami', hint: 'about the owner' },
  { name: 'clear', hint: 'clear the log' },
];

const FETCH_VERBS = new Set(['fetch', 'get', 'open', 'read']);
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function findBook(query) {
  const q = norm(query);
  if (!q) return null;
  return (
    BOOKS.find((b) => b.slug === q) ??
    BOOKS.find((b) => b.aliases.some((a) => norm(a) === q)) ??
    BOOKS.find((b) => !b.hidden && norm(b.title).includes(q)) ??
    null
  );
}

// ctx: { log(text), clear(), fetch(book), skip(), unknown(), manners(), coffee() }
export function createCommands(ctx) {
  let last = null;

  function requestBook(query) {
    if (!query) return ctx.log('Fetch what? Try ls.');
    const book = findBook(query);
    if (!book) return ctx.log(`No book called "${query}". Try ls.`);
    if (book.hidden) return ctx.log("That one's restricted.");
    last = book;
    ctx.fetch(book);
  }

  const table = {
    help() {
      ctx.log(`Commands: ${COMMANDS.map((c) => c.name).join(', ')}, fetch <book>. While he's fetching: skip.`);
    },
    ls() {
      const shelf = BOOKS.filter((b) => !b.hidden).map((b) => `${b.slug} (${b.call})`);
      ctx.log(`On the shelves: ${shelf.join(', ')}.`);
    },
    random() {
      const pool = BOOKS.filter((b) => !b.hidden && b !== last);
      requestBook(pick(pool).slug);
    },
    whoami() {
      ctx.log(`${OWNER.name}. ${OWNER.whoami}`);
    },
    clear() {
      ctx.clear();
    },
    skip() {
      if (!ctx.skip()) ctx.log("Nothing to skip. He's not doing anything.");
    },
    // Patience restorers. Step 7 counts these as easter eggs.
    // "please resume" is polite *and* a request.
    please(arg) {
      ctx.manners();
      if (arg) run(arg);
    },
    sorry: () => ctx.manners(),
    coffee: () => ctx.coffee(),
  };

  function run(raw) {
    const text = raw.trim();
    if (!text) return;
    const [head, ...rest] = text.split(/\s+/);
    const cmd = head.toLowerCase();
    const arg = rest.join(' ');
    if (table[cmd]) return table[cmd](arg);
    if (FETCH_VERBS.has(cmd)) return requestBook(arg);
    // A bare book name (resume, projects, github, contact, nes...) fetches it.
    const book = findBook(text);
    if (book) return requestBook(text);
    ctx.log(`${pick(UNKNOWN)} Try help.`);
    ctx.unknown();
  }

  return run;
}
