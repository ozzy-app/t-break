/**
 * Formats a name according to the company naming convention.
 * Jane Smith 210 → "Jane (JSm) 210"
 * Input is case-insensitive.
 */
export function formatDisplayName(firstName, lastName, extension) {
  const first = firstName.trim();
  const last  = lastName.trim();
  const ext   = extension.trim();

  if (!first || !last) return '';

  const fCap  = first[0].toUpperCase() + first.slice(1).toLowerCase();
  const code  = first[0].toUpperCase() + last[0].toUpperCase() + last[1].toLowerCase();

  return ext ? `${fCap} (${code}) ${ext}` : `${fCap} (${code})`;
}
