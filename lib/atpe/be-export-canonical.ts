export function stableSortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableSortObject)
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => [key, stableSortObject(val)])

    return Object.fromEntries(entries)
  }

  return value
}

export function toCanonicalJson(value: unknown) {
  return JSON.stringify(stableSortObject(value))
}