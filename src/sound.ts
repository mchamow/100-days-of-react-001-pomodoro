let ctx: AudioContext | null = null

/** Call from a user gesture (e.g. the Start click) so the browser lets us play sound later. */
export function unlockAudio() {
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
}

/** A short three-note chime generated with Web Audio, so no audio file is needed. */
export function playChime() {
  const audio = ctx
  if (!audio) return
  const t0 = audio.currentTime
  const notes = [880, 880, 1046.5]
  notes.forEach((frequency, i) => {
    const at = t0 + i * 0.25
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(0.3, at + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22)
    osc.connect(gain).connect(audio.destination)
    osc.start(at)
    osc.stop(at + 0.25)
  })
}
