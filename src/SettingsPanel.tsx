import { ChevronDown } from 'lucide-react'
import { useId } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { MODE_LABELS, MODES, type Settings } from './pomodoro'

interface Props {
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
}

export function SettingsPanel({ settings, onChange }: Props) {
  return (
    <Collapsible className="w-full rounded-xl border bg-card text-card-foreground">
      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl px-4 py-3 font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        Settings
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-panel-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4 px-4 pb-4">
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
          <SwitchField
            label="Start the next session automatically"
            checked={settings.autoStart}
            onChange={(autoStart) => onChange({ autoStart })}
          />
          <SwitchField
            label="Play a chime when a session ends"
            checked={settings.sound}
            onChange={(sound) => onChange({ sound })}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface NumberFieldProps {
  label: string
  value: number
  max: number
  onChange: (value: number) => void
}

function NumberField({ label, value, max, onChange }: NumberFieldProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="font-normal text-muted-foreground">
        {label}
      </Label>
      {/* Uncontrolled so the field can be cleared while typing; only valid values are applied. */}
      <Input
        id={id}
        type="number"
        min={1}
        max={max}
        defaultValue={value}
        onChange={(e) => {
          const next = e.currentTarget.valueAsNumber
          if (Number.isInteger(next) && next >= 1 && next <= max) onChange(next)
        }}
      />
    </div>
  )
}

interface SwitchFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function SwitchField({ label, checked, onChange }: SwitchFieldProps) {
  const id = useId()
  return (
    <div className="col-span-full flex items-center gap-2.5">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
    </div>
  )
}
