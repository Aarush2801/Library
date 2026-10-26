# CLAUDE.md — Aarush's Library

Personal portfolio site. It shows a pixel-art library wall packed with books. The user types commands into a console at the bottom. A grumpy librarian rolls a ladder over, climbs to the right shelf, pulls the book, and opens it so the visitor can read it page by page. Hidden easter eggs are scattered around.

`reference/prototype.html` is the original single-file prototype. Use it for **behaviour** (command list, librarian sequence, easter eggs, patience meter). **Do not copy its visual style.** This version is a full pixel-art rebuild.

---

## 1. Aesthetic rules (hard constraints)

- **2D only.** No 3D transforms, no perspective, no WebGL 3D, no `rotateY` page flips.
- **Pixel art, retro game, black and white.** Think 1-bit Macintosh / Game Boy in greyscale.
- **Palette (4 values max):**
  | Token | Hex | Use |
  |---|---|---|
  | `INK` | `#0d0d0d` | outlines, text, shadows |
  | `DARK` | `#5a5a5a` | shading, book spines |
  | `LIGHT` | `#b4b4b4` | highlights, wood grain |
  | `PAPER` | `#f0efe8` | background, pages, speech bubbles |

  Never add other colours. Use dithering (Bayer 2×2 / 4×4 patterns) for gradients and lamplight, not alpha blends.
- **Fixed internal resolution:** render the scene at **480×270** (narrower on phones) and scale it to fill the space above the console. Non-integer scaling is an approved exception (Aarush, 2026-10-26); `RES.integerScale` in `config.js` restores whole-number steps. Letterbox with `INK`.
- **Crisp pixels everywhere:**
  - CSS `image-rendering: pixelated`
  - PixiJS nearest-neighbour scaling, `roundPixels: true`
  - no sub-pixel positions (`Math.round` every x/y)
  - no anti-aliased fonts on canvas
- **Animation feels like a game, not a website:**
  - frame-by-frame sprites at **8–12 fps**
  - CSS/GSAP tweens use stepped easing (`steps(n)`), so movement snaps to pixels
  - no smooth fades or opacity tweens; use dither dissolves or frame swaps
- **Fonts:** pixel fonts only.
  - UI: `Press Start 2P` or `Silkscreen`
  - long reading text: `VT323` or `Pixelify Sans`
  - all from Google Fonts, self-hosted in `public/fonts`

## 2. Stack

| Purpose | Package | Notes |
|---|---|---|
| Build/dev | **Vite** (vanilla JS) | no React; keep it light |
| Scene rendering | **PixiJS** (v8) | sprites, animated sprites, Aseprite sheet loading |
| Orchestration/tweens | **GSAP** + `PixiPlugin` | timelines for the fetch sequence; always stepped/rounded |
| Physics easter eggs | **Matter.js** | `rm -rf` book avalanche only; snap rendered positions to pixels |
| Audio | **Howler.js** | chiptune SFX, mute toggle, default muted until first interaction |
| Optional particles | hand-rolled in Pixi | dust motes: 1px `LIGHT` pixels, no particle library |

Do not add other runtime dependencies without asking.

### External tools (Aarush uses these, not Claude)
- **Aseprite** (or free: **LibreSprite** / **Piskel**) for sprites. Export each sprite as `PNG + JSON (Hash)` with frame tags. Tags are the animation names: `idle`, `walk`, `push`, `climb`, `grab`, `huff`, `shush`, `throw`.
- **jsfxr / sfxr** for sound effects.
- **BeepBox** for optional ambient chiptune.
- **Kenney.nl** (CC0) for placeholder pixel assets.

## 3. Setup

```bash
npm create vite@latest stacks -- --template vanilla
cd stacks
npm install pixi.js gsap matter-js howler
mkdir -p reference public/sprites public/sfx public/fonts src/content
# put prototype.html in reference/
npm run dev
```

Deploy: `npm run build` → `dist/` → GitHub Pages or Vercel.

## 4. Project structure

```
src/
  main.js            boot, scaling, resize/letterbox
  config.js          palette, internal resolution, fps, speeds
  scene/
    shelves.js       bookcase built from tiles + book spine sprites
    ladder.js        rolling ladder on top rail
    librarian.js     state machine + AnimatedSprite per state
    fx.js            dust, dither dissolve, screen shake
  ui/
    console.js       command input, log, example chips (DOM, pixel-styled)
    tome.js          book reader: pixel page spread, frame-by-frame page turn
    hud.js           patience meter, secrets counter
  commands.js        parser + command table
  eggs.js            all easter eggs in one place
  audio.js           Howler wrapper
  content/books.js   ALL portfolio copy lives here
public/sprites/      Aseprite exports (png + json)
public/sfx/          wav/ogg
public/fonts/
reference/prototype.html
```

## 5. Core behaviour

### Librarian state machine
The librarian is a boy with round glasses and black hair. He gets visibly more annoyed with every request.
`idle → walk → push (ladder) → climb → grab → climb(down) → walk → handoff → idle`

Interrupt states:
- `huff`: patience < 50
- `shush`: on the `shh` command
- `throw`: poked 5 times
- `closed`: patience 0; he is asleep at the desk with a "CLOSED" sign for ~9s

Rules:
- A request made while he is busy → he refuses with a line from `BUSY` and loses patience.
- Every state is an Aseprite tag. Use placeholder rectangles until art exists.

### Fetch sequence (GSAP timeline)
1. Walk to the ladder.
2. Push the ladder to the book's x.
3. Climb to the book's shelf (skip if the book is on the bottom shelf).
4. Book slides out 2px at a time.
5. Climb down.
6. Walk to the reading spot.
7. Open the tome.

Timings come from `config.js`. Respect `prefers-reduced-motion` by running at ~10× speed with no shake.

### Commands
`help` · `ls` · `fetch|get|open|read <book>` · `resume` · `projects` · `github` · `contact` · `random` · `whoami` · `clear`

`resume`, `projects`, `github` and `contact` are each one book; typing the name is the same as `fetch <name>`.

Matching uses slug, then aliases, then a title substring. Clicking a spine is the same as `fetch`.

### Patience
- Starts at 100.
- `fetch` costs −12, an unknown command −5, a busy interrupt −8.
- At 0 the library closes. `please`, `sorry` and `coffee` restore it.

### Easter eggs (8, progress saved in localStorage)
| Trigger | Egg |
|---|---|
| `sudo …` | refusal |
| `please` / `sorry` | manners |
| `coffee` | full patience |
| `shh` | he shushes back, screen dims |
| `rm -rf …` | Matter.js book avalanche, then books reshelve |
| click librarian 5× | he throws a book, screen shakes |
| Konami code or `lumos` | lights out, dithered lamp circle follows cursor |
| `xyzzy` | password for the hidden "R.S." book on the top shelf; hint lives in the NES book |

Add new eggs only in `eggs.js` and update the counter total.

### Tome (book reader)
- Pixel-art open book: two pages on desktop, one on mobile.
- Page turn is a 4–6 frame sprite animation, not a transform.
- First page is a generated title page with the call number.
- Last page is a "DATE DUE" library card with stamp sprites.
- Controls: arrow keys flip, Esc returns the book.

## 6. Content

All copy lives in `src/content/books.js`:

```js
{ slug, title, call /* Library of Congress style */, shelf, slot, aliases: [], pages: [ /* short HTML strings */ ] }
```

**Never invent facts about Aarush.** If a field is missing, leave a visible `TODO:` placeholder and tell him.

## 7. Engineering rules

- Plain ES modules, no TypeScript unless asked. Small files, one concern each.
- Logic never hardcodes pixel positions of books. Positions are computed from shelf/slot.
- Layout:
  - desktop and phone (portrait shows fewer slots per shelf; real books sit in the first slots)
  - the page body never scrolls horizontally
- Accessibility:
  - console input has a label
  - books are reachable by keyboard
  - the tome is a focus-trapped dialog
  - there is a sound mute toggle
- Performance: a single Pixi app, sprite sheets not individual PNGs, 60 fps render with 8–12 fps animation frames.

## 8. How to work with me

- For anything bigger than a small fix, **propose a short plan first** and wait for the OK.
- One feature per change, then remind me to commit (`git commit -m "<feature>"`).
- Use placeholder art (palette-coloured rectangles plus labels) until I supply sprites. Never block on missing art.
- Keep `config.js` as the single source of truth for palette, sizes and timings.
- If an instruction conflicts with §1 (aesthetic rules), ask before breaking it.
- Be terse. Show diffs or file lists rather than long explanations.

---

## 9. What I want (Aarush fills this in)

<!-- Describe the specific changes, scenes, sprites, and new eggs here. Claude: treat this section as the current task list. -->

- [ ] 
