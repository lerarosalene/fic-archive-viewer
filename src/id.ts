let lastID = 1;

export function id(prefix?: string) {
  return prefix ? `${prefix}-${lastID++}` : `${lastID++}`;
}
