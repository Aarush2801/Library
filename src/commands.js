// Command table. The parser and actions arrive with the librarian (step 4);
// for now this drives the list shown in the console.

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
