import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from './pomodoro'
import { playChime } from './sound'
import { usePomodoro } from './usePomodoro'

// jsdom has no Web Audio.
vi.mock('./sound', () => ({ playChime: vi.fn(), unlockAudio: vi.fn() }))

const MIN = 60_000

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 8, 16, 10, 0))
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.clearAllMocks()
})

const setup = () => renderHook(() => usePomodoro())
const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms))

describe('usePomodoro', () => {
  it('starts paused on a full focus session', () => {
    const { result } = setup()
    expect(result.current).toMatchObject({
      mode: 'focus',
      running: false,
      remaining: 25 * MIN,
      duration: 25 * MIN,
      cycleCount: 0,
      focusSessionsToday: 0,
    })
  })

  it('counts down while running and holds while paused', () => {
    const { result } = setup()
    act(() => result.current.toggle())
    expect(result.current.running).toBe(true)

    wait(MIN)
    expect(result.current.remaining).toBe(24 * MIN)

    act(() => result.current.toggle())
    wait(5 * MIN)
    expect(result.current).toMatchObject({ running: false, remaining: 24 * MIN })

    act(() => result.current.toggle())
    wait(MIN)
    expect(result.current.remaining).toBe(23 * MIN)
  })

  it('finishes a focus session: chimes, counts it and moves to a short break', () => {
    const { result } = setup()
    act(() => result.current.toggle())
    wait(25 * MIN)

    expect(result.current).toMatchObject({
      mode: 'shortBreak',
      running: false,
      remaining: 5 * MIN,
      cycleCount: 1,
      focusSessionsToday: 1,
    })
    expect(playChime).toHaveBeenCalledOnce()
    expect(JSON.parse(localStorage.getItem('pomodoro:stats')!)).toEqual({ date: '2026-09-16', focusSessions: 1 })
  })

  it('does not count finished breaks as focus sessions', () => {
    const { result } = setup()
    act(() => result.current.selectMode('shortBreak'))
    act(() => result.current.toggle())
    wait(5 * MIN)

    expect(result.current).toMatchObject({ mode: 'focus', focusSessionsToday: 0 })
    expect(playChime).toHaveBeenCalledOnce()
  })

  it('stays silent when sound is off', () => {
    const { result } = setup()
    act(() => result.current.updateSettings({ sound: false }))
    act(() => result.current.toggle())
    wait(25 * MIN)

    expect(result.current.mode).toBe('shortBreak')
    expect(playChime).not.toHaveBeenCalled()
  })

  it('runs the next session straight away with auto-start on', () => {
    const { result } = setup()
    act(() => result.current.updateSettings({ autoStart: true }))
    act(() => result.current.toggle())
    wait(25 * MIN)
    expect(result.current).toMatchObject({ mode: 'shortBreak', running: true })

    wait(MIN)
    expect(result.current.remaining).toBe(4 * MIN)
  })

  it('reaches a long break after the configured number of focus sessions', () => {
    const { result } = setup()
    act(() => result.current.updateSettings({ longBreakEvery: 2, autoStart: true }))
    act(() => result.current.toggle())
    wait(25 * MIN) // focus 1
    wait(5 * MIN) // short break
    wait(25 * MIN) // focus 2

    expect(result.current).toMatchObject({ mode: 'longBreak', cycleCount: 2, focusSessionsToday: 2 })
  })

  it('skip moves on without counting the session for today', () => {
    const { result } = setup()
    act(() => result.current.skip())
    expect(result.current).toMatchObject({ mode: 'shortBreak', running: false, focusSessionsToday: 0 })
  })

  it('skip keeps running if the timer was running', () => {
    const { result } = setup()
    act(() => result.current.toggle())
    act(() => result.current.skip())
    expect(result.current).toMatchObject({ mode: 'shortBreak', running: true, remaining: 5 * MIN })
  })

  it('reset restores the full session and stops the timer', () => {
    const { result } = setup()
    act(() => result.current.toggle())
    wait(3 * MIN)
    act(() => result.current.reset())
    expect(result.current).toMatchObject({ running: false, remaining: 25 * MIN })
  })

  it('applies a new duration to a session that has not started', () => {
    const { result } = setup()
    act(() => result.current.updateSettings({ minutes: { ...DEFAULT_SETTINGS.minutes, focus: 50 } }))
    expect(result.current).toMatchObject({ remaining: 50 * MIN, duration: 50 * MIN })
  })

  it('keeps the time left in a session that is under way when durations change', () => {
    const { result } = setup()
    act(() => result.current.toggle())
    wait(MIN)
    act(() => result.current.updateSettings({ minutes: { ...DEFAULT_SETTINGS.minutes, focus: 50 } }))
    expect(result.current.remaining).toBe(24 * MIN)
  })

  it('restores saved settings', () => {
    localStorage.setItem(
      'pomodoro:settings',
      JSON.stringify({ ...DEFAULT_SETTINGS, minutes: { ...DEFAULT_SETTINGS.minutes, focus: 45 } }),
    )
    expect(setup().result.current.remaining).toBe(45 * MIN)
  })

  it('shows zero sessions when the saved count is from another day', () => {
    localStorage.setItem('pomodoro:stats', JSON.stringify({ date: '2026-09-15', focusSessions: 6 }))
    expect(setup().result.current.focusSessionsToday).toBe(0)
  })
})
