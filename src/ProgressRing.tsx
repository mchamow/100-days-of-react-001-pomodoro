import type { ReactNode } from 'react'

const SIZE = 280
const STROKE = 12
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface Props {
  /** 0 → 1, how much of the session has elapsed. */
  progress: number
  children: ReactNode
}

export function ProgressRing({ progress, children }: Props) {
  const center = SIZE / 2
  return (
    <div className="ring">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <circle className="ring-track" cx={center} cy={center} r={RADIUS} strokeWidth={STROKE} />
        <circle
          className="ring-bar"
          cx={center}
          cy={center}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="ring-content">{children}</div>
    </div>
  )
}
