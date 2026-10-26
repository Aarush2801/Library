// ALL portfolio copy lives here. Never invent facts: leave TODO: until Aarush supplies them.
// shelf: 0 = bottom shelf, counting up. slot: spine position from the left of that shelf.

export const OWNER = {
  name: 'Aarush',
  whoami: 'TODO: one-line bio for the whoami command.',
};

export const BOOKS = [
  {
    slug: 'resume',
    title: 'Résumé',
    call: 'HF5383 .S56 2026',
    shelf: 2,
    slot: 4,
    aliases: ['cv', 'resume.pdf'],
    pages: ['TODO: résumé content (education, experience, skills) or a link to the PDF.'],
  },
  {
    slug: 'projects',
    title: 'Projects',
    call: 'QA76.76 .S56 2026',
    shelf: 4,
    slot: 11,
    aliases: ['work', 'portfolio'],
    pages: ['TODO: one page per project: name, what it does, stack, link.'],
  },
  {
    slug: 'github',
    title: 'GitHub',
    call: 'QA76.9 .S56 2026',
    shelf: 1,
    slot: 16,
    aliases: ['gh', 'git', 'code'],
    pages: ['TODO: GitHub username and profile link.'],
  },
  {
    slug: 'contact',
    title: 'Contact',
    call: 'HE6183 .S56 2026',
    shelf: 0,
    slot: 7,
    aliases: ['email', 'mail', 'hire'],
    pages: ['TODO: email and any other contact links.'],
  },
  {
    slug: 'nes',
    title: 'NES Manual',
    call: 'GV1469.32 .N47',
    shelf: 3,
    slot: 2,
    aliases: ['nintendo', 'manual'],
    pages: ['Some doors still open for an old adventurer’s word. Type it at the desk.'],
  },
  {
    slug: 'rs',
    title: 'R.S.',
    call: 'Z1041 .R7',
    shelf: 5,
    slot: 13,
    aliases: [],
    hidden: true,
    pages: ['TODO: what the hidden R.S. book contains.'],
  },
];
