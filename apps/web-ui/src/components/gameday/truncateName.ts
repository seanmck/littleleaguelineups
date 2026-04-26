/**
 * Truncate a player name to fit "Sawyer L." style: first name + last initial,
 * subject to a max character budget. If the abbreviated form fits, use it.
 * Otherwise fall back to a hard char-cap on the first name.
 */
export function truncateName(name: string, max = 11): string {
  const trimmed = name.trim();
  if (trimmed.length <= max) return trimmed;

  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0];
    const lastInitial = parts[parts.length - 1][0];
    const abbreviated = `${first} ${lastInitial}.`;
    if (abbreviated.length <= max) return abbreviated;
    // First name itself too long; truncate it
    return `${first.slice(0, Math.max(1, max - 3))}… ${lastInitial}.`;
  }

  return `${trimmed.slice(0, max - 1)}…`;
}
