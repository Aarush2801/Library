// Placeholder librarian frames, drawn in code until the Aseprite sheet exists.
// A boy with round glasses and black hair. 16x36 frames: 4px headroom, head,
// torso, legs. Side frames face right; the sprite flips to face left.
// Letters: K ink, D dark, L light, P paper, '.' transparent.
import { CSS, LIB } from '../config.js';
import { canvasTexture } from './pixel.js';

const COLOR = { K: CSS.INK, D: CSS.DARK, L: CSS.LIGHT, P: CSS.PAPER };
const HEAD_Y = 4;
const TORSO_Y = 18;
const LEGS_Y = 30;

const with_ = (rows, patch) => rows.map((r, i) => patch[i] ?? r);

// ── Heads (14 rows) ─────────────────────────────────────────────
const HEAD_FRONT = [
  '....KKKKKKKK....',
  '...KKKKKKKKKK...',
  '..KKKLLKKKKKKK..',
  '..KKLLKKKKKKKK..',
  '.KKKKKKKKKKKKKK.',
  '.KKKPKKPPKKPKKK.',
  '.KPPKKPPPPKKPPK.',
  '.KPKLKKKKKKLKPK.',
  '.KPKPKKPPKKPKPK.',
  '.KPPKKPPPPKKPPK.',
  '.KPPPPPPPPPPPPK.',
  '..KPPPPDDPPPPK..',
  '...KPPPPPPPPK...',
  '....KKKKKKKK....',
];
const HEAD_FRONT_BLINK = with_(HEAD_FRONT, {
  7: '.KPKLLKKKKLLKPK.',
  8: '.KPKKKKPPKKKKPK.',
});
const HEAD_FRONT_ANGRY = with_(HEAD_FRONT, {
  5: '.KKKKKKPPKKKKKK.',
  6: '.KPKKKPPPPKKKPK.',
  11: '..KPPPKKKKPPPK..',
});
const HEAD_SIDE = [
  '.....KKKKKK.....',
  '....KKKKKKKK....',
  '...KKKLLKKKKK...',
  '..KKKLLKKKKKKK..',
  '..KKKKKKKKKKKKK.',
  '..KKKKKKKKPKKPK.',
  '..KKKKKKPPPKKPK.',
  '..KKKKPPKKKLKKPK',
  '..KKKKPPPPKPKKPK',
  '..KKKKKPPPPKKPPK',
  '..KKKKPPPPPPPPK.',
  '...KKKPPPPPPDPK.',
  '....KKPPPPPPPK..',
  '.....KKKKKKKK...',
];
const HEAD_SIDE_ANGRY = with_(HEAD_SIDE, {
  6: '..KKKKKKPPKKKKK.',
  11: '...KKKPPPPPKKPK.',
});
const HEAD_BACK = [
  '....KKKKKKKK....',
  '...KKKKKKKKKK...',
  '..KKKLLKKKKKKK..',
  '..KKLLKKKKKKKK..',
  '.KKKKKKKKKKKKKK.',
  '.KKKKKKKKKKKKKK.',
  '.KKKKKKKKKKKKKK.',
  '.PKKKKKKKKKKKKP.',
  '.PKKKKKKKKKKKKP.',
  '.KKKKKKKKKKKKKK.',
  '.KKKKLKKKKLKKKK.',
  '..KKKKKKKKKKKK..',
  '...KKKKKKKKKK...',
  '.....KPPPPK.....',
];

// ── Torsos (12 rows): cardigan, shirt collar, tie, grey trousers ──
const TORSO_FRONT = [
  '....KPPKKPPK....',
  '...KDDPKKPDDK...',
  '..KDDDDKKDDDDK..',
  '.KDDDDDKKDDDDDK.',
  '.KDKDDDKKDDDKDK.',
  '.KDKDDDDKDDDKDK.',
  '.KDKDDDDDDDDKDK.',
  '.KDKDDDDDDDDKDK.',
  '.KPKDDDDDDDDKPK.',
  '.KKKLLLLLLLLKKK.',
  '...KLLLLLLLLK...',
  '...KLLLKKLLLK...',
];
const TORSO_FRONT_NOARMS = with_(TORSO_FRONT, {
  3: '..KDDDDKKDDDDK..',
  4: '..KDDDDKKDDDDK..',
  5: '..KDDDDDKDDDDK..',
  6: '..KDDDDDDDDDDK..',
  7: '..KDDDDDDDDDDK..',
  8: '..KDDDDDDDDDDK..',
  9: '..KLLLLLLLLLLK..',
});
const TORSO_FRONT_CROSSED = with_(TORSO_FRONT, {
  4: '.KDDDDDKKDDDDDK.',
  5: '.KKKKKKKKKKKKKK.',
  6: '.KPDDDDDDDDDDPK.',
  7: '.KKKKKKKKKKKKKK.',
  8: '..KDDDDDDDDDDK..',
  9: '..KLLLLLLLLLLK..',
});
const TORSO_SIDE = [
  '......KPPK......',
  '.....KDDPPK.....',
  '.....KDDDPDK....',
  '.....KDDDDDK....',
  '.....KDDDDDK....',
  '.....KDDDDDK....',
  '.....KDDDDDK....',
  '.....KDDDDDK....',
  '.....KDDDDDK....',
  '.....KLLLLLK....',
  '.....KLLLLLK....',
  '.....KLLLLLK....',
];
const TORSO_BACK = [
  '....KKDDDDKK....',
  '...KDDDDDDDDK...',
  '...KDDDDDDDDK...',
  '...KDDDDDDDDK...',
  '...KDDDDDDDDK...',
  '...KDDDDDDDDK...',
  '...KDDDDDDDDK...',
  '...KDDDDDDDDK...',
  '...KDDDDDDDDK...',
  '...KLLLLLLLLK...',
  '...KLLLLLLLLK...',
  '...KLLLKKLLLK...',
];

// ── Legs (6 rows) ───────────────────────────────────────────────
const LEGS_FRONT = [
  '...KLLK..KLLK...',
  '...KLLK..KLLK...',
  '...KLLK..KLLK...',
  '...KLLK..KLLK...',
  '..KKKKK..KKKKK..',
  '..KKKKK..KKKKK..',
];
const LEGS_FRONT_STEP = [
  '...KLLK..KLLK...',
  '...KKKK..KLLK...',
  '..KKKK...KLLK...',
  '.........KLLK...',
  '.........KKKKK..',
  '.........KKKKK..',
];
const LEGS_SIDE_STAND = [
  '......KLLK......',
  '......KLLK......',
  '......KLLK......',
  '......KLLK......',
  '......KKKKK.....',
  '......KKKKK.....',
];
const LEGS_SIDE_STRIDE = [
  '.....KLLLLK.....',
  '....KLLKKLLK....',
  '...KLLK..KLLK...',
  '..KLLK....KLLK..',
  '.KKKK.....KKKKK.',
  '.KKK.......KKKK.',
];
const LEGS_SIDE_HALF = [
  '.....KLLLK......',
  '.....KLLKLK.....',
  '....KLLK.KLK....',
  '....KLK..KLLK...',
  '...KKKK..KKKKK..',
  '...KKK....KKKK..',
];

// ── Arms and props (overlays) ───────────────────────────────────
const ARM_SIDE_DOWN = ['.......KDK......', '.......KDK......', '.......KDK......', '.......KDK......', '.......KPK......', '........K.......'];
const ARM_SIDE_FWD = ['.......KDK......', '........KDK.....', '.........KDK....', '..........KPK...', '...........K....'];
const ARM_SIDE_BACK = ['.......KDK......', '......KDK.......', '.....KDK........', '....KPK.........', '.....K..........'];
const ARM_PUSH = ['.......KDKKKKK..', '.......KDDDDDPK.', '.......KKKKKKK..'];
const ARM_THROW_UP = [
  'KKKKK...........',
  'KDDDK...........',
  'KDLDK...........',
  'KDLDK...........',
  'KDDDK...........',
  'KKPKK...........',
  '..KDK...........',
  '...KDK..........',
  '....KDK.........',
  '.....KDK........',
  '......KDK.......',
  '.......KDK......',
  '.......KDK......',
  '.......KDK......',
  '.......KDK......',
];
const ARM_THROW_FWD = ['.......KDK......', '........KDDK....', '..........KDDK..', '............KPK.', '.............K..'];
const SHUSH_HAND = [
  '........K.......',
  '........K.......',
  '........K.......',
  '.......KPK......',
  '.......KPPK.....',
  '........KDDK....',
  '.........KDDK...',
  '..........KDK...',
  '..........KDK...',
];
const HANDOFF_BOOK = ['...KKKKKKKKKK...', '..KPKDDDDDDKPK..', '..KPKDLLLLDKPK..', '...KKKKKKKKKK...'];
const STEAM_A = ['..LL.........LL.', '.LPPL.......LPPL', '..LL.........LL.'];
const STEAM_B = ['.LL.........LL..', 'LPPL.......LPPL.', '.LL.........LL..'];
const ZZZ_A = ['...........PPPP.', '.............P..', '............P...', '...........PPPP.'];
const ZZZ_B = ['..........PPP...', '...........P....', '..........PPP...', '................'];

// Arm drawn as a 3px column with a hand on top (back view, gripping a rung).
function armUp(x, top) {
  return (p) => {
    const bottom = TORSO_Y + 6;
    p.rect(x, top, 3, bottom - top, COLOR.K);
    p.rect(x + 1, top + 2, 1, bottom - top - 2, COLOR.D);
    p.rect(x + 1, top, 1, 2, COLOR.P);
  };
}

function stamp(p, rows, dy, flip) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = COLOR[row[x]];
      if (c) p.rect(flip ? LIB.frameW - 1 - x : x, y + dy, 1, 1, c);
    }
  });
}

// A frame is a list of layers, back to front: [rows, dy, flip?] or a draw function.
function frame(layers) {
  return canvasTexture(LIB.frameW, LIB.frameH, (p) => {
    for (const layer of layers) {
      if (typeof layer === 'function') layer(p);
      else stamp(p, layer[0], layer[1], layer[2]);
    }
    // Rim so his black hair and ink outline read against the dark shelf backs.
    p.outline(CSS.LIGHT);
  });
}

const front = (head, torso = TORSO_FRONT, legs = LEGS_FRONT, extra = []) =>
  frame([[legs, LEGS_Y], [torso, TORSO_Y], [head, HEAD_Y], ...extra]);
const side = (legs, arm, head = HEAD_SIDE, dx = 0) =>
  frame([[legs, LEGS_Y], [TORSO_SIDE, TORSO_Y], [head, HEAD_Y], [arm, TORSO_Y + 3]].map((l) => shiftX(l, dx)));
const shiftX = (layer, dx) => (dx ? [layer[0].map((r) => '.'.repeat(dx) + r.slice(0, r.length - dx)), layer[1]] : layer);

// Built once and shared across scene rebuilds, so they are never destroyed.
let cache = null;

// Returns { state: { frames: Texture[], fps, loop } }.
export function librarianFrames() {
  return (cache ??= buildFrames());
}

function buildFrames() {
  const open = front(HEAD_FRONT);
  const blink = front(HEAD_FRONT_BLINK);
  const walk = [
    side(LEGS_SIDE_STRIDE, ARM_SIDE_FWD),
    side(LEGS_SIDE_STAND, ARM_SIDE_DOWN),
    side(LEGS_SIDE_STRIDE, ARM_SIDE_BACK),
    side(LEGS_SIDE_STAND, ARM_SIDE_DOWN),
  ];
  const climb = (flip) =>
    frame([
      [flip ? LEGS_FRONT_STEP.map((r) => [...r].reverse().join('')) : LEGS_FRONT_STEP, LEGS_Y],
      [TORSO_BACK, TORSO_Y],
      [HEAD_BACK, HEAD_Y],
      armUp(flip ? 13 : 0, flip ? 4 : 11),
      armUp(flip ? 0 : 13, flip ? 11 : 4),
    ]);
  const grab = (top) => frame([[LEGS_FRONT, LEGS_Y], [TORSO_BACK, TORSO_Y], [HEAD_BACK, HEAD_Y], armUp(0, 11), armUp(13, top)]);
  const sleep = (z) => frame([[TORSO_FRONT_CROSSED, TORSO_Y + 2], [HEAD_BACK.slice(0, 13), HEAD_Y + 8], [z, 0]]);

  return {
    idle: { frames: [...Array(20).fill(open), blink], fps: LIB.fps, loop: true },
    walk: { frames: walk, fps: LIB.fps, loop: true },
    push: {
      frames: [
        frame([[LEGS_SIDE_STRIDE, LEGS_Y], [TORSO_SIDE, TORSO_Y], [HEAD_SIDE, HEAD_Y], [ARM_PUSH, TORSO_Y + 3]].map((l) => shiftX(l, 1))),
        frame([[LEGS_SIDE_HALF, LEGS_Y], [TORSO_SIDE, TORSO_Y], [HEAD_SIDE, HEAD_Y], [ARM_PUSH, TORSO_Y + 3]].map((l) => shiftX(l, 1))),
      ],
      fps: LIB.fps / 2,
      loop: true,
    },
    climb: { frames: [climb(false), climb(true)], fps: LIB.fps / 2, loop: true },
    grab: { frames: [grab(2), grab(5)], fps: LIB.fps / 3, loop: true },
    handoff: { frames: [front(HEAD_FRONT, TORSO_FRONT_NOARMS, LEGS_FRONT, [[HANDOFF_BOOK, TORSO_Y - 2]])], fps: 1, loop: false },
    huff: {
      frames: [
        front(HEAD_FRONT_ANGRY, TORSO_FRONT_CROSSED, LEGS_FRONT, [[STEAM_A, 0]]),
        front(HEAD_FRONT_ANGRY, TORSO_FRONT_CROSSED, LEGS_FRONT, [[STEAM_B, 0]]),
      ],
      fps: LIB.fps / 3,
      loop: true,
    },
    shush: { frames: [front(HEAD_FRONT_ANGRY, TORSO_FRONT_NOARMS, LEGS_FRONT, [[SHUSH_HAND, HEAD_Y + 9]])], fps: 1, loop: false },
    throw: {
      frames: [
        frame([[LEGS_SIDE_STRIDE, LEGS_Y], [ARM_THROW_UP, HEAD_Y - 4], [TORSO_SIDE, TORSO_Y], [HEAD_SIDE_ANGRY, HEAD_Y]]),
        side(LEGS_SIDE_STRIDE, ARM_THROW_FWD, HEAD_SIDE_ANGRY),
      ],
      fps: LIB.fps / 3,
      loop: false,
    },
    closed: { frames: [sleep(ZZZ_A), sleep(ZZZ_B)], fps: 2, loop: true },
  };
}
