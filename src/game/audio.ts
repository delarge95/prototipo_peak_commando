// ============================================================
// PEAK COMMANDO — SFX sintetizado (WebAudio, cero assets)
// Equivalente Unity: servicio SfxSynth del módulo Juice.
// ============================================================

type OscType = OscillatorType;

class SfxEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.24;
    this.master.connect(this.ctx.destination);
  }

  private tone(freq: number, dur: number, type: OscType, vol = 1, slideTo?: number, delay = 0) {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noise(dur: number, vol = 0.5, delay = 0) {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(g).connect(this.master);
    src.start(t0);
  }

  ui() { this.tone(660, 0.07, "square", 0.35); this.tone(990, 0.06, "square", 0.25, undefined, 0.06); }
  pickup() { this.tone(880, 0.08, "square", 0.4); this.tone(1320, 0.1, "square", 0.32, undefined, 0.07); }
  deposit() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.12, "triangle", 0.4, undefined, i * 0.09)); }
  swing() { this.noise(0.09, 0.28); this.tone(300, 0.08, "sawtooth", 0.12, 120); }
  hit() { this.tone(180, 0.09, "square", 0.5, 90); this.noise(0.06, 0.35); }
  crit() { this.tone(140, 0.14, "sawtooth", 0.55, 60); this.noise(0.1, 0.4); }
  hurt() { this.tone(220, 0.18, "sawtooth", 0.5, 80); this.noise(0.12, 0.3); }
  death() { [392, 311, 233, 155].forEach((f, i) => this.tone(f, 0.22, "sawtooth", 0.4, undefined, i * 0.16)); }
  bossRoar() { this.tone(70, 0.7, "sawtooth", 0.6, 45); this.tone(93, 0.7, "square", 0.3, 50, 0.05); this.noise(0.5, 0.3); }
  victory() { [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.16, "triangle", 0.42, undefined, i * 0.11)); }
  eraClear() { [392, 523, 659, 784].forEach((f, i) => this.tone(f, 0.14, "square", 0.35, undefined, i * 0.1)); }
  heartbeat() { this.tone(55, 0.12, "sine", 0.7, 40); this.tone(50, 0.1, "sine", 0.55, 38, 0.18); }
  slip() { this.tone(900, 0.22, "sawtooth", 0.3, 180); }
  chest() { this.tone(587, 0.1, "triangle", 0.4); this.tone(880, 0.16, "triangle", 0.4, undefined, 0.09); }
  portal() { this.tone(220, 0.5, "sine", 0.4, 660); this.tone(440, 0.5, "sine", 0.25, 880, 0.08); }
  revive() { [262, 330, 392].forEach((f, i) => this.tone(f, 0.1, "square", 0.3, undefined, i * 0.08)); }
  push() { this.noise(0.1, 0.3); this.tone(150, 0.12, "square", 0.3, 70); }
  stink() { this.tone(120, 0.4, "sawtooth", 0.25, 60); }
}

export const sfx = new SfxEngine();
