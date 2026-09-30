/**
 * Colour identities for activity types and groups.
 * Each helper returns a theme class that sets --tc / --tc-soft / --tc-border,
 * which the theme-* utilities in src/styles.css consume.
 */

const ACTIVITY_THEMES: Record<string, string> = {
  "creative-corner": "theme-amber",
  presentations: "theme-violet",
  "group-activities": "theme-emerald",
  projects: "theme-cyan",
};

const GROUP_THEMES: Record<string, string> = {
  "group-5": "theme-blue",
  "group-6": "theme-teal",
  "group-7": "theme-gold",
  "group-8": "theme-rose",
  "group-9": "theme-indigo",
  "group-10": "theme-orange",
};

const FALLBACKS = [
  "theme-blue",
  "theme-teal",
  "theme-gold",
  "theme-rose",
  "theme-indigo",
  "theme-orange",
];

function fallbackFor(key: string) {
  let sum = 0;
  for (let i = 0; i < key.length; i += 1) sum += key.charCodeAt(i);
  return FALLBACKS[sum % FALLBACKS.length]!;
}

/** Theme class for one of the four activity types. */
export function activityTheme(slug: string | null | undefined) {
  if (!slug) return "theme-blue";
  return ACTIVITY_THEMES[slug] ?? fallbackFor(slug);
}

/** Theme class for a group, keyed by its slug. */
export function groupTheme(slug: string | null | undefined) {
  if (!slug) return "theme-blue";
  return GROUP_THEMES[slug] ?? fallbackFor(slug);
}
