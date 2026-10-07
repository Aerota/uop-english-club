export type TextPart = { text: string; href?: string };

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

/** Split paragraph text on [label](https://url) markers. Only http(s) links are allowed. */
export function parseLinks(input: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const m of input.matchAll(LINK_RE)) {
    const i = m.index ?? 0;
    if (i > last) parts.push({ text: input.slice(last, i) });
    parts.push({ text: m[1] ?? "", href: m[2] ?? "" });
    last = i + m[0].length;
  }
  if (last < input.length) parts.push({ text: input.slice(last) });
  return parts;
}

export function normalizeLink(url: string) {
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}
