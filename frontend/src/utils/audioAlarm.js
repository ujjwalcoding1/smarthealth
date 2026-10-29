// Web Audio API Synthesizer for Fall / Emergency Alarms
class AudioAlarmService {
  constructor() {
    this.audioCtx = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSiren() {
    this.init();
    if (!this.audioCtx || this.isPlaying) return;

    this.isPlaying = true;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    // Frequency modulation for siren sound
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.35);
    osc.frequency.linearRampToValueAtTime(600, now + 0.7);

    gain.gain.setValueAtTime(0.15, now);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    this.oscillator = osc;
    this.gainNode = gain;

    // Siren loop
    this.intervalId = setInterval(() => {
      if (!this.audioCtx || !this.isPlaying) return;
      const t = this.audioCtx.currentTime;
      try {
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.linearRampToValueAtTime(950, t + 0.35);
        osc.frequency.linearRampToValueAtTime(600, t + 0.7);
      } catch (e) {
        // pass
      }
    }, 700);

    // Speak Voice Alert
    this.speakVoiceAlert("Warning! Fall detected. Emergency SOS initiated.");
  }

  speakVoiceAlert(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }

  stopSiren() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (e) {}
      this.oscillator = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioAlarm = new AudioAlarmService();
