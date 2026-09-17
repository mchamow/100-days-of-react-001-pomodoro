import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { useEffect, useEffectEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatTime, MODE_LABELS, MODES, type Mode } from './pomodoro'
import { ProgressRing } from './ProgressRing'
import { SettingsPanel } from './SettingsPanel'
import { usePomodoro } from './usePomodoro'

/** Space already activates these, so it must not also start or pause the timer. */
const HANDLES_SPACE = 'button, summary, a, [role="button"], [role="switch"], [role="checkbox"]'

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
      if (target.matches(HANDLES_SPACE)) return
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
    <main data-mode={mode} className="mx-auto flex max-w-[440px] flex-col items-center gap-6 px-4 pt-8 pb-12">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          <span aria-hidden="true">🍅</span> Pomodoro
        </h1>
        <p className="mt-1 text-muted-foreground">
          <strong className="text-mode">{pomodoro.focusSessionsToday}</strong> focus{' '}
          {pomodoro.focusSessionsToday === 1 ? 'session' : 'sessions'} today
        </p>
      </header>

      <ToggleGroup
        aria-label="Session type"
        value={[mode]}
        // Clicking the current session type un-presses it (empty value); treat that as "restart it".
        onValueChange={(value) => pomodoro.selectMode((value[0] as Mode | undefined) ?? mode)}
        spacing={1}
        className="rounded-full bg-muted p-1"
      >
        {MODES.map((m) => (
          <ToggleGroupItem
            key={m}
            value={m}
            className="h-9 rounded-full px-3.5 text-muted-foreground hover:bg-transparent aria-pressed:bg-background aria-pressed:font-semibold aria-pressed:text-mode aria-pressed:shadow-sm aria-pressed:hover:bg-background aria-pressed:hover:text-mode"
          >
            {MODE_LABELS[m]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <ProgressRing progress={1 - remaining / duration}>
        <time role="timer" aria-live="off" className="text-[clamp(3rem,15vw,4.25rem)] font-bold tracking-tighter tabular-nums">
          {time}
        </time>
        <span className="text-sm tracking-[0.12em] text-muted-foreground uppercase">
          {running ? MODE_LABELS[mode] : 'Paused'}
        </span>
      </ProgressRing>

      <ol
        aria-label={`${pomodoro.cycleCount} of ${settings.longBreakEvery} focus sessions until a long break`}
        className="flex gap-2"
      >
        {Array.from({ length: settings.longBreakEvery }, (_, i) => (
          <li
            key={i}
            data-done={i < pomodoro.cycleCount || undefined}
            className="size-2.5 rounded-full bg-foreground/15 transition-colors duration-300 data-done:bg-mode"
          />
        ))}
      </ol>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="lg" className="h-10 rounded-full px-4 hover:border-mode" onClick={pomodoro.reset}>
          <RotateCcw data-icon="inline-start" />
          Reset
        </Button>
        <Button
          size="lg"
          className="h-13 min-w-32 rounded-full bg-mode px-6 text-lg font-semibold text-white shadow-lg shadow-mode/35 hover:bg-mode hover:brightness-105 dark:text-neutral-950"
          onClick={pomodoro.toggle}
        >
          {running ? <Pause className="size-5" /> : <Play className="size-5" />}
          {running ? 'Pause' : 'Start'}
        </Button>
        <Button variant="outline" size="lg" className="h-10 rounded-full px-4 hover:border-mode" onClick={pomodoro.skip}>
          Skip
          <SkipForward data-icon="inline-end" />
        </Button>
      </div>

      <p className="-mt-2 text-xs text-muted-foreground">
        <Kbd>Space</Kbd> start / pause · <Kbd>R</Kbd> reset · <Kbd>S</Kbd> skip
      </p>

      <SettingsPanel settings={settings} onChange={pomodoro.updateSettings} />
    </main>
  )
}
