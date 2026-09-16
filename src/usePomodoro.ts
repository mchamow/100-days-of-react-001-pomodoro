import { useEffect, useState } from 'react'
import {
  advance,
  DEFAULT_SETTINGS,
  durationOf,
  initialState,
  pause,
  reset,
  start,
  switchMode,
  type Mode,
  type Settings,
} from './pomodoro'
import { playChime, unlockAudio } from './sound'
import { load, recordFocusSession, save, todayKey, type DailyStats } from './storage'

const SETTINGS_KEY = 'pomodoro:settings'
const STATS_KEY = 'pomodoro:stats'

export function usePomodoro() {
  const [settings, setSettings] = useState(() => load(SETTINGS_KEY, DEFAULT_SETTINGS))
  const [timer, setTimer] = useState(() => initialState(settings))
  const [now, setNow] = useState(() => Date.now())
  const [stats, setStats] = useState(() => load<DailyStats>(STATS_KEY, { date: todayKey(), focusSessions: 0 }))

  useEffect(() => save(SETTINGS_KEY, settings), [settings])
  useEffect(() => save(STATS_KEY, stats), [stats])

  // While running, re-render a few times a second and finish the session once its end time passes.
  useEffect(() => {
    const { endsAt } = timer
    if (endsAt === null) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t < endsAt) return
      clearInterval(id)
      if (settings.sound) playChime()
      if (timer.mode === 'focus') setStats(recordFocusSession(stats))
      setTimer(advance(timer, settings, t, settings.autoStart))
    }, 250)
    return () => clearInterval(id)
  }, [timer, settings, stats])

  const running = timer.endsAt !== null
  const remaining = timer.endsAt === null ? timer.remaining : Math.max(0, timer.endsAt - now)

  const toggle = () => {
    const t = Date.now()
    unlockAudio()
    setNow(t)
    setTimer(running ? pause(timer, t) : start(timer, t))
  }

  const skip = () => {
    const t = Date.now()
    setNow(t)
    setTimer(advance(timer, settings, t, running))
  }

  const updateSettings = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    // Apply new durations right away unless the current session is already under way.
    const untouched = !running && timer.remaining === durationOf(timer.mode, settings)
    if (untouched) setTimer(reset(timer, next))
  }

  return {
    settings,
    mode: timer.mode,
    cycleCount: timer.cycleCount,
    running,
    remaining,
    duration: durationOf(timer.mode, settings),
    focusSessionsToday: stats.date === todayKey() ? stats.focusSessions : 0,
    toggle,
    skip,
    reset: () => setTimer(reset(timer, settings)),
    selectMode: (mode: Mode) => setTimer(switchMode(timer, mode, settings)),
    updateSettings,
  }
}
