// Native Web Audio API Synthesizer for retro sci-fi sound effects
// Does not require any external audio files.

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy initialize on first interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  // Mini short click for button clicks and general interactions
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // Keystroke typing sound with randomized vintage frequency pitch
  public playTypewriter() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    // Random vintage typewriter/relay frequency
    const freq = 600 + Math.random() * 800;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  }

  // Realistic dull, heavy shoe steps ('터벅, 터벅' / '또박, 또박' footsteps with comfortable weight)
  public playFootsteps() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Play two steps spaced apart for walking cadence
    [0, 0.28].forEach((delay) => {
      const time = now + delay;
      
      // Part A: Deep heavy sole thud (160Hz -> 70Hz)
      const oscThump = ctx.createOscillator();
      const gainThump = ctx.createGain();
      const filterThump = ctx.createBiquadFilter();

      oscThump.type = "triangle";
      oscThump.frequency.setValueAtTime(160, time);
      oscThump.frequency.exponentialRampToValueAtTime(70, time + 0.12);

      filterThump.type = "lowpass";
      filterThump.frequency.setValueAtTime(200, time);

      gainThump.gain.setValueAtTime(0.40, time);
      gainThump.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      oscThump.connect(filterThump);
      filterThump.connect(gainThump);
      gainThump.connect(ctx.destination);

      oscThump.start(time);
      oscThump.stop(time + 0.13);

      // Part B: Slighter shoe impact / friction texture (380Hz -> 180Hz)
      const oscImpact = ctx.createOscillator();
      const gainImpact = ctx.createGain();
      const filterImpact = ctx.createBiquadFilter();

      oscImpact.type = "sine";
      oscImpact.frequency.setValueAtTime(380, time);
      oscImpact.frequency.exponentialRampToValueAtTime(180, time + 0.08);

      filterImpact.type = "bandpass";
      filterImpact.frequency.setValueAtTime(280, time);
      filterImpact.Q.setValueAtTime(1.5, time);

      gainImpact.gain.setValueAtTime(0.25, time);
      gainImpact.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      oscImpact.connect(filterImpact);
      filterImpact.connect(gainImpact);
      gainImpact.connect(ctx.destination);

      oscImpact.start(time);
      oscImpact.stop(time + 0.09);
    });
  }

  // Triad rising chime for a successful puzzle solve
  public playSuccess() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const time = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time + idx * 0.12);
      
      gain.gain.setValueAtTime(0, time + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.28, time + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time + idx * 0.12);
      osc.stop(time + idx * 0.12 + 0.5);
    });
  }

  // Dissonant dual buzz representing a wrong dial lock/code error
  public playFailure() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const time = ctx.currentTime;
    const freqs = [180, 185]; // Low beats dissonance

    freqs.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, time);

      // Lowpass filter to muffle the sawtooth harshness
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(700, time);

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.35);
    });
  }

  // High pitch signal frequency glitch sound
  public playGlitch() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(3000, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.Q.setValueAtTime(10, ctx.currentTime);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  }

  // Low mechanical boom + metal sliding scrape for unlocks
  public playUnlock() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const time = ctx.currentTime;

    // Part A: Base heavy rumble boom
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(110, time);
    osc1.frequency.exponentialRampToValueAtTime(45, time + 0.7);

    gain1.gain.setValueAtTime(0.42, time);
    gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(time);
    osc1.stop(time + 0.84);

    // Part B: Slit mechanical scrape sliding chirp
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sawtooth";
    osc2.frequency.setValueAtTime(150, time);
    osc2.frequency.linearRampToValueAtTime(480, time + 0.5);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(400, time);
    filter.frequency.exponentialRampToValueAtTime(1200, time + 0.5);

    gain2.gain.setValueAtTime(0.15, time);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.55);

    osc2.connect(filter);
    filter.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(time);
    osc2.stop(time + 0.58);
  }
}

export const audioSynth = new AudioService();
export default audioSynth;
