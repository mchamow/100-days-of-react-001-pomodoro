import { MODE_LABELS, MODES, type Settings } from './pomodoro'

interface Props {
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
}

export function SettingsPanel({ settings, onChange }: Props) {
  return (
    <details className="settings">
      <summary>Settings</summary>
      <div className="settings-grid">
        {MODES.map((mode) => (
          <NumberField
            key={mode}
            label={`${MODE_LABELS[mode]} (min)`}
            value={settings.minutes[mode]}
            max={120}
            onChange={(value) => onChange({ minutes: { ...settings.minutes, [mode]: value } })}
          />
        ))}
        <NumberField
          label="Long break every"
          value={settings.longBreakEvery}
          max={12}
          onChange={(value) => onChange({ longBreakEvery: value })}
        />
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.autoStart}
            onChange={(e) => onChange({ autoStart: e.target.checked })}
          />
          Start the next session automatically
        </label>
        <label className="toggle">
          <input type="checkbox" checked={settings.sound} onChange={(e) => onChange({ sound: e.target.checked })} />
          Play a chime when a session ends
        </label>
      </div>
    </details>
  )
}

interface NumberFieldProps {
  label: string
  value: number
  max: number
  onChange: (value: number) => void
}

function NumberField({ label, value, max, onChange }: NumberFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      {/* Uncontrolled so the field can be cleared while typing; only valid values are applied. */}
      <input
        type="number"
        min={1}
        max={max}
        defaultValue={value}
        onChange={(e) => {
          const next = e.target.valueAsNumber
          if (Number.isInteger(next) && next >= 1 && next <= max) onChange(next)
        }}
      />
    </label>
  )
}
