// Book reader: a modal <dialog> (native focus trap) over a pixel-art open book.
// Two pages on wide screens, one on phones. Title page first, DATE DUE card last.
import { TOME } from '../config.js';
import { OWNER } from '../content/books.js';
import { LAYOUTS, drawBook, dissolve } from './tome-art.js';
import { sfx } from '../audio.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const frameMs = 1000 / TOME.fps;
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const stampDate = (d) =>
  d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase().replace(',', '');

// Loan history lives in this visitor's browser only.
function recordLoan(slug) {
  const key = `stacks.loans.${slug}`;
  let past = [];
  try {
    past = JSON.parse(localStorage.getItem(key)) ?? [];
  } catch {}
  try {
    localStorage.setItem(key, JSON.stringify([...past, Date.now()].slice(-TOME.loansKept)));
  } catch {}
  return past.slice(-(TOME.loansKept - 1));
}

function titlePage(book) {
  return `<div class="tp">
    <p class="tp__call">${esc(book.call)}</p>
    <h2 class="tp__title" id="tome-title">${esc(book.title)}</h2>
    <p class="tp__from">From the library of ${esc(OWNER.name)}</p>
    <p class="tp__shelf">Shelf ${book.shelf + 1} · Slot ${book.slot + 1}</p>
  </div>`;
}

function cardPage(book, past) {
  const due = new Date(Date.now() + TOME.loanDays * 864e5);
  const rows = past.map((t) => `<li><span class="stamp">${stampDate(new Date(t))}</span></li>`);
  rows.push(`<li><span class="stamp stamp--new">DUE ${stampDate(due)}</span></li>`);
  while (rows.length < TOME.loansKept + 1) rows.push('<li></li>');
  return `<div class="card">
    <p class="card__head">Date due</p>
    <ol class="card__rows">${rows.join('')}</ol>
    <p class="card__foot">${esc(book.call)}</p>
  </div>`;
}

export function createTome(dialog, { onClose }) {
  const bookEl = dialog.querySelector('[data-book]');
  const canvas = dialog.querySelector('[data-art]');
  const ctx = canvas.getContext('2d');
  const scratch = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const pageEls = [...dialog.querySelectorAll('[data-page]')];
  const prevBtn = dialog.querySelector('[data-prev]');
  const nextBtn = dialog.querySelector('[data-next]');
  const closeBtn = dialog.querySelector('[data-close]');
  const counter = dialog.querySelector('[data-count]');
  const narrow = window.matchMedia('(max-width: 719px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  let book = null;
  let pages = [];
  let index = 0; // first visible page
  let animating = false;

  const layout = () => (narrow.matches ? LAYOUTS.single : LAYOUTS.spread);
  const perView = () => layout().pages.length;

  function sizeCanvas() {
    const L = layout();
    canvas.width = L.w;
    canvas.height = L.h;
    scratch.canvas.width = L.w;
    scratch.canvas.height = L.h;
    dialog.classList.toggle('is-single', L === LAYOUTS.single);
    L.text.forEach((t, i) => {
      const el = pageEls[i];
      el.style.left = `${(t.x / L.w) * 100}%`;
      el.style.top = `${(t.y / L.h) * 100}%`;
      el.style.width = `${(t.w / L.w) * 100}%`;
      el.style.height = `${(t.h / L.h) * 100}%`;
    });
  }

  // CSS px per book pixel, so the text scales with the art.
  new ResizeObserver(() => {
    dialog.style.setProperty('--u', `${bookEl.clientWidth / layout().w}px`);
  }).observe(bookEl);

  function showText(visible) {
    pageEls.forEach((el, i) => {
      const n = index + i;
      el.hidden = !visible || i >= perView();
      if (!el.hidden) {
        el.innerHTML = pages[n] ?? '';
        el.setAttribute('aria-label', `Page ${n + 1} of ${pages.length}`);
      }
    });
    // The DATE DUE card is the last page: thunk the stamp when it comes into view.
    if (visible && index + perView() >= pages.length) setTimeout(() => sfx('stamp'), 200);
    const last = Math.min(index + perView(), pages.length);
    counter.textContent = perView() > 1 ? `${index + 1}-${last} / ${pages.length}` : `${index + 1} / ${pages.length}`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index + perView() >= pages.length;
  }

  async function playDissolve(levels) {
    drawBook(scratch, layout());
    for (const level of levels) {
      dissolve(ctx, scratch, level);
      await wait(frameMs);
    }
  }

  async function turn(dir) {
    const step = perView();
    const target = index + dir * step;
    if (animating || target < 0 || target >= pages.length) return;
    animating = true;
    sfx('page');
    if (!reduced.matches) {
      showText(false);
      const all = TOME.turnFrames.map((_, i) => i);
      // A single page can only lift away (forward) or settle back (backward).
      const frames = step > 1 ? all : dir > 0 ? all.slice(0, 3) : all.slice(0, 3).reverse();
      for (const i of frames) {
        drawBook(ctx, layout(), { dir, i });
        await wait(frameMs);
      }
    }
    index = target;
    drawBook(ctx, layout());
    showText(true);
    animating = false;
    // A button that just disabled itself drops focus out of the dialog.
    if (document.activeElement?.disabled || !dialog.contains(document.activeElement)) {
      (nextBtn.disabled ? (prevBtn.disabled ? closeBtn : prevBtn) : nextBtn).focus();
    }
  }

  async function open(next) {
    if (dialog.open) return;
    book = next;
    pages = [titlePage(book), ...book.pages, cardPage(book, recordLoan(book.slug))];
    index = 0;
    sizeCanvas();
    dialog.setAttribute('aria-label', book.title);
    showText(false);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dialog.showModal();
    sfx('open');
    animating = true;
    if (reduced.matches) drawBook(ctx, layout());
    else await playDissolve(TOME.dissolveLevels);
    showText(true);
    animating = false;
    nextBtn.disabled ? closeBtn.focus() : nextBtn.focus();
  }

  async function close() {
    if (!dialog.open || animating) return;
    animating = true;
    showText(false);
    sfx('close');
    if (!reduced.matches) await playDissolve([...TOME.dissolveLevels].reverse().slice(1).concat(0));
    dialog.close();
    animating = false;
    onClose?.(book);
  }

  prevBtn.addEventListener('click', () => turn(-1));
  nextBtn.addEventListener('click', () => turn(1));
  closeBtn.addEventListener('click', close);
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault(); // Esc returns the book through the close animation
    close();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close(); // backdrop
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') turn(1);
    else if (e.key === 'ArrowLeft') turn(-1);
  });
  narrow.addEventListener('change', () => {
    if (!dialog.open) return;
    index -= index % perView();
    sizeCanvas();
    drawBook(ctx, layout());
    showText(true);
  });

  return {
    open,
    close,
    get isOpen() {
      return dialog.open;
    },
  };
}
