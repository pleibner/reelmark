export function deriveHandle(name: string): string {
  const normalized = name
    .toLowerCase()
    .replaceAll(/\s+/g, '_')
    .replaceAll(/[^a-z0-9_]/g, '')
    .slice(0, 30);

  return normalized || 'user';
}
