/**
 * French wording helpers shared by the pages, kept pure so they are easy to test.
 */

/** "1 erreur", "0 erreur", "3 erreurs": in French, 0 and 1 take the singular. */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${Math.abs(count) >= 2 ? plural : singular}`;
}

/**
 * Describe the selected tables as a child would say it:
 * [7] -> "la table de 7", [2, 3, 4] -> "les tables de 2, 3 et 4",
 * all ten tables -> "toutes les tables".
 */
export function describeTables(tables: number[]): string {
  const sorted = [...tables].sort((a, b) => a - b);
  if (sorted.length === 0) return "aucune table";
  if (sorted.length === 10 && sorted.every((t, i) => t === i + 1)) {
    return "toutes les tables";
  }
  if (sorted.length === 1) return `la table de ${sorted[0]}`;
  const head = sorted.slice(0, -1).join(", ");
  return `les tables de ${head} et\u00a0${sorted[sorted.length - 1]}`;
}
