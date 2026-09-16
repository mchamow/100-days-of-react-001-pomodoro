export type Mode = 'focus' | 'shortBreak' | 'longBreak'

export const MODES: Mode[] = ['focus', 'shortBreak', 'longBreak']

export const MODE_LABELS: Record<Mode, string> = {
  focus: 'Focus',
  shortBreak: 'Short break',
  longBreak: 'Long break',
}

export interface Settings {
  minutes: Record<Mode, number>
  longBreakEvery: number
  autoStart: boolean
  sound: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  minutes: { focus: 25, shortBreak: 5, longBreak: 15 },
  longBreakEvery: 4,
  autoStart: false,
  sound: true,
}

export interface TimerState {
  mode: Mode
  /** Time left while paused, in ms. */
  remaining: number
  /** Timestamp the current run ends at; null while paused. */
  endsAt: number | null
  /** Focus sessions finished in the current cycle (resets after a long break). */
  cycleCount: number
}

export const durationOf = (mode: Mode, settings: Settings) => settings.minutes[mode] * 60_000

export function initialState(settings: Settings): TimerState {
  return { mode: 'focus', remaining: durationOf('focus', settings), endsAt: null, cycleCount: 0 }
}

export function start(state: TimerState, now: number): TimerState {
  if (state.endsAt !== null) return state
  return { ...state, endsAt: now + state.remaining }
}

export function pause(state: TimerState, now: number): TimerState {
  if (state.endsAt === null) return state
  return { ...state, remaining: Math.max(0, state.endsAt - now), endsAt: null }
}

export function switchMode(state: TimerState, mode: Mode, settings: Settings): TimerState {
  return { ...state, mode, remaining: durationOf(mode, settings), endsAt: null }
}

export function reset(state: TimerState, settings: Settings): TimerState {
  return switchMode(state, state.mode, settings)
}

/** Moves to the next session in the cycle, both when a session ends and when it's skipped. */
export function advance(state: TimerState, settings: Settings, now: number, autoStart: boolean): TimerState {
  let mode: Mode
  let cycleCount = state.cycleCount
  if (state.mode === 'focus') {
    cycleCount += 1
    mode = cycleCount >= settings.longBreakEvery ? 'longBreak' : 'shortBreak'
  } else {
    mode = 'focus'
    if (state.mode === 'longBreak') cycleCount = 0
  }
  const remaining = durationOf(mode, settings)
  return { mode, cycleCount, remaining, endsAt: autoStart ? now + remaining : null }
}

export function formatTime(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
