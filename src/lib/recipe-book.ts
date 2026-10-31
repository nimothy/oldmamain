/**
 * The recipe book lives in this browser's localStorage: a list of recipe ids.
 * Storage can be unavailable (private windows, blocked site data), so every
 * access is guarded and the page still works without it.
 */

const KEY = 'oldmamain:recipe-book';

export function readBook(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeBook(book: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(book));
  } catch {
    // Not saved; the in-page state still updates.
  }
}

let memory: string[] | undefined;

export function toggleInBook(id: string): string[] {
  const book = memory ?? readBook();
  const next = book.includes(id) ? book.filter((x) => x !== id) : [...book, id];
  memory = next;
  writeBook(next);
  return next;
}

export function bookCountText(n: number): string {
  if (n === 0) return 'No recipes in the book yet';
  return n === 1 ? '1 recipe in the book' : `${n} recipes in the book`;
}
