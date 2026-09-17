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
    <div className="relative aspect-square w-[min(280px,80vw)]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block size-full" aria-hidden="true">
        <circle className="fill-none stroke-foreground/8" cx={center} cy={center} r={RADIUS} strokeWidth={STROKE} />
        <circle
          className="fill-none stroke-mode transition-[stroke-dashoffset,stroke] duration-300 ease-linear"
          cx={center}
          cy={center}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
