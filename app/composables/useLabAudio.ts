// Synthesized lab sound (Web Audio, no files). Silent until the visitor opts in.
const PREF_KEY = 'darwin-lab-sound'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let drone: { stop: () => void } | null = null
const lastPlayed: Record<string, number> = {}

function getCtx() {
  if (!import.meta.client) return null
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) void ctx?.suspend()
      else if (drone) void ctx?.resume()
    })
  }
  return ctx
}

function tone(
  freq: number,
  dur: number,
  o: { type?: OscillatorType; gain?: number; to?: number; delay?: number; attack?: number } = {},
) {
  const c = ctx
  if (!c || !master || c.state !== 'running') return
  const t = c.currentTime + (o.delay ?? 0)
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(freq, t)
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.15, t + (o.attack ?? 0.005))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

function startDrone() {
  const c = ctx
  if (!c || !master || drone) return
  const out = c.createGain()
  out.gain.value = 0.0001
  out.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 2.5)
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 420
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()
  lfo.frequency.value = 0.07
  lfoGain.gain.value = 160
  lfo.connect(lfoGain).connect(filter.frequency)
  const oscs = [55, 55.35, 110.2].map((f, i) => {
    const o = c.createOscillator()
    o.type = i === 2 ? 'sine' : 'sawtooth'
    o.frequency.value = f
    o.connect(filter)
    o.start()
    return o
  })
  filter.connect(out).connect(master)
  lfo.start()
  drone = {
    stop() {
      const t = c.currentTime
      out.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
      for (const o of [...oscs, lfo]) o.stop(t + 0.7)
    },
  }
}

/** Plays at most once per `ms`, so scroll-driven triggers can't machine-gun. */
function limited(key: string, ms: number) {
  const now = performance.now()
  if (now - (lastPlayed[key] ?? -Infinity) < ms) return false
  lastPlayed[key] = now
  return true
}

export function useLabAudio() {
  const enabled = useState('lab-sound', () => false)

  async function setEnabled(on: boolean) {
    enabled.value = on
    try { localStorage.setItem(PREF_KEY, on ? '1' : '0') } catch { /* private mode */ }
    if (!on) {
      drone?.stop()
      drone = null
      return
    }
    const c = getCtx()
    if (!c) return
    await c.resume()
    startDrone()
  }

  /** Returning visitors who chose sound: resume on their first gesture (autoplay policy). */
  function restorePreference() {
    let pref: string | null = null
    try { pref = localStorage.getItem(PREF_KEY) } catch { /* ignore */ }
    if (pref !== '1') return
    enabled.value = true
    const wake = () => { if (enabled.value) void setEnabled(true) }
    window.addEventListener('pointerdown', wake, { once: true })
    window.addEventListener('keydown', wake, { once: true })
  }

  const on = () => enabled.value && ctx?.state === 'running'

  return {
    enabled,
    setEnabled,
    restorePreference,
    blip(pitch = 1) {
      if (on() && limited('blip', 45)) tone(660 * pitch, 0.07, { type: 'triangle', gain: 0.06 })
    },
    heartbeat() {
      if (!on() || !limited('heart', 400)) return
      tone(70, 0.16, { to: 38, gain: 0.5 })
      tone(62, 0.14, { to: 36, gain: 0.32, delay: 0.19 })
    },
    chime() {
      if (!on() || !limited('chime', 300)) return
      ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.5, { gain: 0.07, delay: i * 0.07 }))
    },
    ping() {
      if (!on() || !limited('ping', 300)) return
      tone(1318.5, 0.18, { gain: 0.07 })
      tone(1318.5, 0.18, { gain: 0.06, delay: 0.22 })
    },
    buzz() {
      if (on() && limited('buzz', 300)) tone(98, 0.3, { type: 'square', gain: 0.045, to: 82 })
    },
    flatline() {
      if (on() && limited('flat', 1500)) tone(988, 2.2, { gain: 0.06, attack: 0.02 })
    },
    tick(up: boolean) {
      if (on() && limited(up ? 'tick-up' : 'tick-down', 120)) tone(up ? 1760 : 220, 0.04, { type: 'triangle', gain: 0.025 })
    },
  }
}
