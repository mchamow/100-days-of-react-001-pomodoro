import { describe, expect, it } from 'vitest'
import {
  advance,
  DEFAULT_SETTINGS,
  durationOf,
  formatTime,
  initialState,
  pause,
  reset,
  start,
  switchMode,
  type Settings,
  type TimerState,
} from './pomodoro'

const MIN = 60_000
const settings: Settings = { ...DEFAULT_SETTINGS, longBreakEvery: 2 }

const state = (overrides: Partial<TimerState> = {}): TimerState => ({ ...initialState(settings), ...overrides })

describe('initialState', () => {
  it('starts paused on a full focus session', () => {
    expect(initialState(settings)).toEqual({ mode: 'focus', remaining: 25 * MIN, endsAt: null, cycleCount: 0 })
  })
})

describe('durationOf', () => {
  it('converts the configured minutes to ms', () => {
    expect(durationOf('focus', settings)).toBe(25 * MIN)
    expect(durationOf('shortBreak', settings)).toBe(5 * MIN)
    expect(durationOf('longBreak', settings)).toBe(15 * MIN)
  })
})

describe('start / pause', () => {
  it('start sets the end time from the remaining time', () => {
    expect(start(state({ remaining: 10 * MIN }), 1000).endsAt).toBe(1000 + 10 * MIN)
  })

  it('start does nothing when already running', () => {
    const running = state({ endsAt: 5000 })
    expect(start(running, 1000)).toBe(running)
  })

  it('pause keeps the time that was left', () => {
    const paused = pause(state({ endsAt: 10 * MIN }), 4 * MIN)
    expect(paused).toMatchObject({ remaining: 6 * MIN, endsAt: null })
  })

  it('pause never leaves negative time', () => {
    expect(pause(state({ endsAt: 1000 }), 5000).remaining).toBe(0)
  })

  it('pause does nothing when already paused', () => {
    const paused = state()
    expect(pause(paused, 1000)).toBe(paused)
  })
})

describe('switchMode / reset', () => {
  it('switchMode stops the timer and loads the new duration, keeping cycle progress', () => {
    const next = switchMode(state({ endsAt: 999, cycleCount: 1 }), 'longBreak', settings)
    expect(next).toEqual({ mode: 'longBreak', remaining: 15 * MIN, endsAt: null, cycleCount: 1 })
  })

  it('reset restores the full duration of the current mode', () => {
    const next = reset(state({ mode: 'shortBreak', remaining: 1000, endsAt: 999 }), settings)
    expect(next).toMatchObject({ mode: 'shortBreak', remaining: 5 * MIN, endsAt: null })
  })
})

describe('advance', () => {
  it('goes from focus to a short break and counts the session', () => {
    expect(advance(state(), settings, 0, false)).toEqual({
      mode: 'shortBreak',
      remaining: 5 * MIN,
      endsAt: null,
      cycleCount: 1,
    })
  })

  it('goes to a long break once the cycle is complete', () => {
    expect(advance(state({ cycleCount: 1 }), settings, 0, false)).toMatchObject({ mode: 'longBreak', cycleCount: 2 })
  })

  it('still gives a long break if the cycle length was lowered mid-cycle', () => {
    expect(advance(state({ cycleCount: 5 }), settings, 0, false).mode).toBe('longBreak')
  })

  it('goes from a short break back to focus, keeping cycle progress', () => {
    expect(advance(state({ mode: 'shortBreak', cycleCount: 1 }), settings, 0, false)).toMatchObject({
      mode: 'focus',
      remaining: 25 * MIN,
      cycleCount: 1,
    })
  })

  it('starts a new cycle after a long break', () => {
    expect(advance(state({ mode: 'longBreak', cycleCount: 2 }), settings, 0, false)).toMatchObject({
      mode: 'focus',
      cycleCount: 0,
    })
  })

  it('starts the next session right away when autoStart is on', () => {
    expect(advance(state(), settings, 1000, true).endsAt).toBe(1000 + 5 * MIN)
  })
})

describe('formatTime', () => {
  it.each([
    [25 * MIN, '25:00'],
    [5 * MIN + 7000, '05:07'],
    [120 * MIN, '120:00'],
    [0, '00:00'],
  ])('formats %i ms as %s', (ms, expected) => {
    expect(formatTime(ms)).toBe(expected)
  })

  it('rounds up partial seconds so 00:00 only shows when time is up', () => {
    expect(formatTime(59_001)).toBe('01:00')
    expect(formatTime(1)).toBe('00:01')
  })
})
