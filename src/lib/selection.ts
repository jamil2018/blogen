export function selectionToIds(
  keys: "all" | Iterable<React.Key>,
  allIds: string[]
): string[] {
  if (keys === "all") return allIds;
  return Array.from(keys, String);
}
