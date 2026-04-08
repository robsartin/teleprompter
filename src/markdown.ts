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

/**
 * Returns true if the line is a heading (starts with "# ").
 */
export function isHeading(line: string): boolean {
  return line.startsWith("# ");
}

/**
 * Remove markdown syntax from a line, returning plain text.
 * Strips heading prefix, bold, and italic markers.
 */
export function stripMarkdown(line: string): string {
  let result = line;
  // Strip heading prefix
  if (result.startsWith("# ")) {
    result = result.slice(2);
  }
  // Strip **bold** markers
  result = result.replace(/\*\*(.+?)\*\*/g, "$1");
  // Strip *italic* markers
  result = result.replace(/\*(.+?)\*/g, "$1");
  return result;
}

/**
 * Strip markdown from all lines (for glasses plain text output).
 */
export function stripAllMarkdown(lines: string[]): string[] {
  return lines.map(stripMarkdown);
}
