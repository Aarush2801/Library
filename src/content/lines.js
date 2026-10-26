// The librarian's voice. Grumpy, short, never mean to the visitor.

// Fetch acknowledgements get shorter as his patience runs out.
export const FETCHING = {
  high: ['Sure.', 'Right. Hold on.', 'One moment.', 'That one. Of course.'],
  mid: ['Fine.', 'Ugh. One moment.', 'Sure. Whatever.', 'Again? Fine.'],
  low: ['THIS is the last one.', 'You are testing me.', 'Unbelievable.', '*sigh*'],
};

export const BUSY = [
  "I'm literally on a ladder.",
  'One book at a time.',
  'Do I look free?',
  'Wait your turn.',
  'Hands. Full.',
];

export const HANDOFF = ['Here.', 'There. Happy?', "Don't fold the pages.", 'Return it when you’re done.'];

export const UNKNOWN = ["That's not a thing.", 'No idea what that means.', 'Not in the catalogue.'];

export const CLOSING = 'That’s it. The library is CLOSED.';
export const CLOSED = ['CLOSED.', 'Zzz. Closed.', 'Read the sign.'];
export const REOPEN = '...Fine. We’re open.';

export const MANNERS = ['...Thank you.', 'Hm. Manners. Rare.', 'Okay. That helps.'];
export const MANNERS_REOPEN = '...Oh. You said the magic word. Fine, we’re open.';
export const COFFEE = 'COFFEE. Okay. I love you. Ask me anything.';

export const pick = (list) => list[Math.floor(Math.random() * list.length)];

export const fetchLine = (patience) =>
  pick(patience >= 70 ? FETCHING.high : patience >= 40 ? FETCHING.mid : FETCHING.low);
