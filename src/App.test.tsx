import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

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

const timer = () => screen.getByRole('timer').textContent
const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms))
const press = (key: string, code = key, target: Element = document.body) =>
  fireEvent.keyDown(target, { key, code })
const modeButton = (name: string) => screen.getByRole('button', { name })
const pressedMode = () =>
  screen
    .getAllByRole('button')
    .filter((b) => b.closest('[role="group"]') && b.getAttribute('aria-pressed') === 'true')
    .map((b) => b.textContent)
const openSettings = () => fireEvent.click(screen.getByRole('button', { name: 'Settings' }))

describe('App', () => {
  it('starts on a paused 25-minute focus session', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Pomodoro' })).toBeTruthy()
    expect(timer()).toBe('25:00')
    expect(screen.getByText('Paused')).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Session type' })).toBeTruthy()
    expect(pressedMode()).toEqual(['Focus'])
    expect(screen.getByRole('list', { name: '0 of 4 focus sessions until a long break' }).children).toHaveLength(4)
    expect(document.title).toBe('25:00 · Focus — Pomodoro')
  })

  it('starts and pauses with the button and with Space', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    wait(MIN)
    expect(timer()).toBe('24:00')
    expect(document.title).toBe('24:00 · Focus — Pomodoro')

    press(' ', 'Space')
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
    wait(MIN)
    expect(timer()).toBe('24:00')

    press(' ', 'Space')
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy()
    wait(MIN)
    expect(timer()).toBe('23:00')
  })

  it('leaves Space to a focused button or switch', () => {
    render(<App />)
    press(' ', 'Space', screen.getByRole('button', { name: 'Reset' }))
    openSettings()
    press(' ', 'Space', screen.getByRole('switch', { name: 'Play a chime when a session ends' }))
    wait(MIN)
    expect(timer()).toBe('25:00')
  })

  it('resets with R and skips with S', () => {
    render(<App />)
    press(' ', 'Space')
    wait(2 * MIN)
    press('r', 'KeyR')
    expect(timer()).toBe('25:00')
    expect(screen.getByText('Paused')).toBeTruthy()

    press('s', 'KeyS')
    expect(pressedMode()).toEqual(['Short break'])
    expect(timer()).toBe('05:00')
    expect(screen.getByRole('list', { name: '1 of 4 focus sessions until a long break' })).toBeTruthy()
    expect(document.querySelectorAll('li[data-done]')).toHaveLength(1)
    expect(document.querySelector('main')?.dataset.mode).toBe('shortBreak')
  })

  it('ignores shortcuts with modifier keys or while typing', () => {
    render(<App />)
    fireEvent.keyDown(document.body, { key: 's', code: 'KeyS', metaKey: true })
    openSettings()
    press('s', 'KeyS', screen.getByLabelText('Focus (min)'))
    expect(pressedMode()).toEqual(['Focus'])
  })

  it('switches session type from the toggle group', () => {
    render(<App />)
    fireEvent.click(modeButton('Long break'))
    expect(pressedMode()).toEqual(['Long break'])
    expect(timer()).toBe('15:00')
  })

  it('restarts the current session when its own type is clicked again', () => {
    render(<App />)
    press(' ', 'Space')
    wait(3 * MIN)
    fireEvent.click(modeButton('Focus'))
    expect(pressedMode()).toEqual(['Focus'])
    expect(timer()).toBe('25:00')
    expect(screen.getByText('Paused')).toBeTruthy()
  })

  it('changes durations and toggles in settings, and remembers them', () => {
    const { unmount } = render(<App />)
    expect(screen.queryByLabelText('Focus (min)')).toBeNull()
    openSettings()

    fireEvent.change(screen.getByLabelText('Focus (min)'), { target: { value: '50' } })
    expect(timer()).toBe('50:00')
    fireEvent.change(screen.getByLabelText('Short break (min)'), { target: { value: '0' } }) // invalid, ignored

    const chime = screen.getByRole('switch', { name: 'Play a chime when a session ends' })
    const autoStart = screen.getByRole('switch', { name: 'Start the next session automatically' })
    expect(chime.getAttribute('aria-checked')).toBe('true')
    expect(autoStart.getAttribute('aria-checked')).toBe('false')
    fireEvent.click(chime)
    fireEvent.click(autoStart)
    expect(chime.getAttribute('aria-checked')).toBe('false')
    expect(autoStart.getAttribute('aria-checked')).toBe('true')

    expect(JSON.parse(localStorage.getItem('pomodoro:settings')!)).toMatchObject({
      minutes: { focus: 50, shortBreak: 5, longBreak: 15 },
      sound: false,
      autoStart: true,
    })

    unmount()
    render(<App />)
    expect(timer()).toBe('50:00')
  })

  it('shows more cycle dots when long breaks come less often', () => {
    render(<App />)
    openSettings()
    fireEvent.change(screen.getByLabelText('Long break every'), { target: { value: '6' } })
    expect(screen.getByRole('list', { name: '0 of 6 focus sessions until a long break' }).children).toHaveLength(6)
  })
})
