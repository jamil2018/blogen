export function entityId(
  entity: { id?: string } | string | null | undefined
): string | undefined {
  if (!entity) return undefined;
  return typeof entity === "string" ? entity : entity.id;
}
