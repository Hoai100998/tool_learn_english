/**
 * DictaLearn - High-Definition Audio Engine
 * Features:
 * 1. Studio-grade Natural Neural Voice Selection (Google US/UK, Microsoft Jenny/Guy/Aria Online)
 * 2. High-Fidelity Online TTS Audio Streaming with Oxford/Cambridge & Google Neural fallback
 * 3. Precision rate (0.5x - 1.2x) and crisp phonetic articulation
 */

class AudioController {
  constructor() {
    this.audioElement = new Audio();
    this.speechSynth = window.speechSynthesis;
    this.currentRate = 0.85; // Optimal clarity & natural tempo
    this.voiceLang = 'en-US'; // 'en-US' or 'en-GB'
    this.selectedVoice = null;
    this.availableVoices = [];
    this.isPlaying = false;
    this.currentText = '';
    this.currentAudioUrl = null;
    this.preferredVoiceName = null;

    this.onStateChangeCallbacks = [];
    this.initVoices();
    this.initAudioElementListeners();
  }

  /**
   * Initialize speech synthesis voices with neural voice prioritization
   */
  initVoices() {
    if (!this.speechSynth) return;

    const loadVoices = () => {
      this.availableVoices = this.speechSynth.getVoices();
      this.populateVoiceSelectOptions();
      this.pickBestVoice();
    };

    loadVoices();
    if (this.speechSynth.onvoiceschanged !== undefined) {
      this.speechSynth.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Populate Voice Selector in UI with premium high-clarity voices
   */
  populateVoiceSelectOptions() {
    const voiceSelect = document.getElementById('voiceSelect');
    if (!voiceSelect || !this.availableVoices || this.availableVoices.length === 0) return;

    // Filter English voices
    const enVoices = this.availableVoices.filter(v => v.lang.startsWith('en'));
    if (enVoices.length === 0) return;

    const currentVal = voiceSelect.value;
    voiceSelect.innerHTML = '';

    // Add smart default option
    const defaultOpt = document.createElement('option');
    defaultOpt.value = 'auto-best';
    defaultOpt.textContent = '✨ Giọng AI Tự Nhiên & Rõ Nhất';
    voiceSelect.appendChild(defaultOpt);

    // Group voices into US, UK and others
    enVoices.sort((a, b) => {
      const score = (v) => {
        let s = 0;
        if (/natural|neural/i.test(v.name)) s += 50;
        if (/google/i.test(v.name)) s += 40;
        if (/jenny|guy|aria|ryan|samantha|daniel/i.test(v.name)) s += 30;
        if (v.lang === 'en-US') s += 10;
        if (v.lang === 'en-GB') s += 8;
        return s;
      };
      return score(b) - score(a);
    });

    enVoices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.name;
      const isNeural = /natural|neural|google/i.test(v.name);
      const flag = v.lang.includes('GB') ? '🇬🇧' : '🇺🇸';
      opt.textContent = `${flag} ${v.name} ${isNeural ? '🌟 (Cực rõ)' : ''}`;
      voiceSelect.appendChild(opt);
    });

    if (currentVal && Array.from(voiceSelect.options).some(o => o.value === currentVal)) {
      voiceSelect.value = currentVal;
    }
  }

  /**
   * Auto pick highest quality neural/natural voice matching current language
   */
  pickBestVoice() {
    if (!this.availableVoices || this.availableVoices.length === 0) return;

    if (this.preferredVoiceName && this.preferredVoiceName !== 'auto-best') {
      const found = this.availableVoices.find(v => v.name === this.preferredVoiceName);
      if (found) {
        this.selectedVoice = found;
        return;
      }
    }

    const langVoices = this.availableVoices.filter(v => v.lang.startsWith(this.voiceLang));
    
    // Ranked preference list: Google Natural -> Microsoft Neural -> Apple Natural -> Standard
    const preferred = langVoices.find(v => /google us|google uk/i.test(v.name)) ||
      langVoices.find(v => /natural|neural/i.test(v.name)) ||
      langVoices.find(v => /jenny|guy|aria|ryan|samantha|daniel/i.test(v.name)) ||
      langVoices[0] ||
      this.availableVoices[0];

    this.selectedVoice = preferred;
  }

  initAudioElementListeners() {
    this.audioElement.addEventListener('play', () => this.notifyState(true));
    this.audioElement.addEventListener('pause', () => this.notifyState(false));
    this.audioElement.addEventListener('ended', () => this.notifyState(false));
    this.audioElement.addEventListener('error', () => {
      this.notifyState(false);
      this.speakWithSpeechSynthesis(this.currentText);
    });
  }

  onStateChange(callback) {
    this.onStateChangeCallbacks.push(callback);
  }

  notifyState(isPlaying) {
    this.isPlaying = isPlaying;
    this.onStateChangeCallbacks.forEach(cb => cb(isPlaying));
  }

  setRate(rate) {
    this.currentRate = Math.max(0.5, Math.min(1.5, parseFloat(rate)));
    this.audioElement.playbackRate = this.currentRate;
  }

  setVoiceLang(voiceOptionValue) {
    if (voiceOptionValue === 'auto-best') {
      this.preferredVoiceName = null;
      this.voiceLang = 'en-US';
    } else if (voiceOptionValue === 'en-US' || voiceOptionValue === 'en-GB') {
      this.voiceLang = voiceOptionValue;
      this.preferredVoiceName = null;
    } else {
      this.preferredVoiceName = voiceOptionValue;
      const matchingVoice = this.availableVoices.find(v => v.name === voiceOptionValue);
      if (matchingVoice) {
        this.voiceLang = matchingVoice.lang;
        this.selectedVoice = matchingVoice;
        return;
      }
    }
    this.pickBestVoice();
  }

  /**
   * Play target item with maximum phonetic clarity
   * Multi-tier: 1) Explicit item MP3 -> 2) Crystal-Clear Online TTS -> 3) Neural Web Speech
   */
  playItem(item) {
    if (!item || !item.english) return;

    this.stop();
    this.currentText = item.english.trim();

    // 1. If explicit audio URL exists (Oxford/Cambridge studio recording)
    if (item.audioUrl && item.audioUrl.startsWith('http')) {
      this.playUrl(item.audioUrl);
      return;
    }

    // 2. For single words and short phrases: Stream HD Google Neural Pronunciation
    const cleanQuery = this.currentText.replace(/[/\\#,+()$~%.'":*?<>{}]/g, '');
    const isShortText = cleanQuery.split(/\s+/).length <= 15;
    
    if (isShortText) {
      const langCode = this.voiceLang.startsWith('en-GB') ? 'en-gb' : 'en-us';
      const hdAudioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodeURIComponent(cleanQuery)}`;
      this.playUrl(hdAudioUrl, () => {
        // Fallback to SpeechSynthesis on stream blockage
        this.speakWithSpeechSynthesis(this.currentText);
      });
      return;
    }

    // 3. For longer sentences: Use High-Definition SpeechSynthesis
    this.speakWithSpeechSynthesis(this.currentText);
  }

  playUrl(url, onErrorFallback) {
    this.audioElement.src = url;
    this.audioElement.playbackRate = this.currentRate;

    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (onErrorFallback) onErrorFallback();
        else this.speakWithSpeechSynthesis(this.currentText);
      });
    }
  }

  /**
   * Speak using browser Web Speech API with Neural voice configuration
   */
  speakWithSpeechSynthesis(text) {
    if (!this.speechSynth || !text) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    if (!this.selectedVoice) {
      this.pickBestVoice();
    }
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = this.voiceLang;
    utterance.rate = this.currentRate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => this.notifyState(true);
    utterance.onend = () => this.notifyState(false);
    utterance.onerror = () => this.notifyState(false);

    this.speechSynth.speak(utterance);
  }

  togglePlay(currentItem) {
    if (this.isPlaying) {
      this.stop();
    } else if (currentItem) {
      this.playItem(currentItem);
    }
  }

  stop() {
    if (!this.audioElement.paused) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (this.speechSynth && this.speechSynth.speaking) {
      this.speechSynth.cancel();
    }
    this.notifyState(false);
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioController;
} else {
  window.AudioController = AudioController;
}
