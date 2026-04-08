/**
 * Markdown rendering for script text — pure parsing functions.
 */

export interface Token {
  text: string;
  bold?: boolean;
  italic?: boolean;
  heading?: boolean;
}

/**
 * Parse a single line for **bold** and *italic* markdown,
 * returning an array of tokens.
 */
export function parseLine(line: string): Token[] {
  if (line === "") return [];

  const tokens: Token[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: line.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined) {
      tokens.push({ text: match[1], bold: true });
    } else if (match[2] !== undefined) {
      tokens.push({ text: match[2], italic: true });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex) });
  }

  return tokens;
}
