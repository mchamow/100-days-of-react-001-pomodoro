export function load<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable (private mode, quota); the app still works without it.
  }
}

export interface DailyStats {
  date: string
  focusSessions: number
}

/** Local date as YYYY-MM-DD. */
export const todayKey = () => new Date().toLocaleDateString('en-CA')

export function recordFocusSession(stats: DailyStats): DailyStats {
  const date = todayKey()
  return { date, focusSessions: stats.date === date ? stats.focusSessions + 1 : 1 }
}
