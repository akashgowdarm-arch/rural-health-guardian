import { LanguageCode } from '../types';

export class SpeechService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static recognition: any = null;

  public static speak(text: string, language: LanguageCode = 'en') {
    if (!this.synth) return;
    
    // Stop any ongoing speech
    this.synth.cancel();

    // Strip markdown formatting for cleaner audio
    const cleanText = text
      .replace(/[#*_`~-]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/🚨|❤️|🩸|🌡️|🫁|🩺|📊|🟢|🟡|🔴|⚠️/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Map language code to BCP 47 voice tag
    if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'kn') {
      utterance.lang = 'kn-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95; // Slightly slower for clarity in rural listening
    utterance.pitch = 1.0;

    // Pick matching voice if available
    const voices = this.synth.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    this.synth.speak(utterance);
  }

  public static stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public static isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  public static playEmergencyTone() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.4);
      osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn('AudioContext not allowed or supported', e);
    }
  }
}
