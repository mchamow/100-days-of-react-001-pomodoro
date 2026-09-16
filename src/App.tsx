import { useEffect, useEffectEvent } from 'react'
import { formatTime, MODE_LABELS, MODES } from './pomodoro'
import { ProgressRing } from './ProgressRing'
import { SettingsPanel } from './SettingsPanel'
import { usePomodoro } from './usePomodoro'

export default function App() {
  const pomodoro = usePomodoro()
  const { mode, running, remaining, duration, settings } = pomodoro
  const time = formatTime(remaining)

  useEffect(() => {
    document.title = `${time} · ${MODE_LABELS[mode]} — Pomodoro`
  }, [time, mode])

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (e.metaKey || e.ctrlKey || e.altKey || target.matches('input, textarea, select')) return
    if (e.code === 'Space') {
      // A focused button already handles Space as a click.
      if (target.matches('button, summary')) return
      e.preventDefault()
      pomodoro.toggle()
    } else if (e.key === 'r') {
      pomodoro.reset()
    } else if (e.key === 's') {
      pomodoro.skip()
    }
  })

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <main className="app" data-mode={mode}>
      <header className="header">
        <h1>
          <span aria-hidden="true">🍅</span> Pomodoro
        </h1>
        <p className="today">
          <strong>{pomodoro.focusSessionsToday}</strong> focus{' '}
          {pomodoro.focusSessionsToday === 1 ? 'session' : 'sessions'} today
        </p>
      </header>

      <div className="modes" role="group" aria-label="Session type">
        {MODES.map((m) => (
          <button key={m} type="button" aria-pressed={m === mode} onClick={() => pomodoro.selectMode(m)}>
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <ProgressRing progress={1 - remaining / duration}>
        <time className="time" role="timer" aria-live="off">
          {time}
        </time>
        <span className="mode-label">{running ? MODE_LABELS[mode] : 'Paused'}</span>
      </ProgressRing>

      <ol className="cycle" aria-label={`${pomodoro.cycleCount} of ${settings.longBreakEvery} focus sessions until a long break`}>
        {Array.from({ length: settings.longBreakEvery }, (_, i) => (
          <li key={i} className={i < pomodoro.cycleCount ? 'done' : undefined} />
        ))}
      </ol>

      <div className="controls">
        <button type="button" className="secondary" onClick={pomodoro.reset}>
          Reset
        </button>
        <button type="button" className="primary" onClick={pomodoro.toggle}>
          {running ? 'Pause' : 'Start'}
        </button>
        <button type="button" className="secondary" onClick={pomodoro.skip}>
          Skip
        </button>
      </div>

      <p className="hint">
        <kbd>Space</kbd> start / pause · <kbd>R</kbd> reset · <kbd>S</kbd> skip
      </p>

      <SettingsPanel settings={settings} onChange={pomodoro.updateSettings} />
    </main>
  )
}
