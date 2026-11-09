let ctx: AudioContext | null = null;
let enabled = false;
const listeners = new Set<(v: boolean) => void>();

export const sound = {
  get enabled() { return enabled; },
  toggle() {
    enabled = !enabled;
    if (enabled && !ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (enabled) ctx?.resume();
    listeners.forEach((l) => l(enabled));
    if (enabled) this.tick();
  },
  subscribe(fn: (v: boolean) => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
  tone(freq: number, start: number, dur: number, gain = 0.06, type: OscillatorType = "sine") {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime + start;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  },
  tick() { this.tone(1800, 0, 0.05, 0.015, "triangle"); },
  // Acorde suave cuando "todo encaja"
  chime() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, i * 0.07, 1.4, 0.045));
    this.tone(2093, 0.32, 0.9, 0.015, "triangle");
  },
};
