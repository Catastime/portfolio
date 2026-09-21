// Single source of truth for the deploy base path.
// Follows vite.config.ts `base` via Vite's BASE_URL, so changing the
// base there is the only change needed when the URL changes.
const raw = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'
export const BASE: string = raw.endsWith('/') ? raw : `${raw}/`
