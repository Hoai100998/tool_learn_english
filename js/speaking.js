/**
 * DictaLearn - Robust Speaking & Pronunciation AI Assessment Engine
 * Supports Web Speech API (SpeechRecognition / webkitSpeechRecognition),
 * AudioContext real-time microphone volume metering,
 * and comprehensive error resolution.
 */

class SpeakingController {
  constructor(app) {
    this.app = app;
    this.recognition = null;
    this.isListening = false;
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.animFrameId = null;
    this.transcript = '';
    this.finalTranscript = '';
    
    this.checkBrowserCompatibility();
  }

  checkBrowserCompatibility() {
    this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.speechSupported = !!this.SpeechRecognition;
    this.isFileProtocol = window.location.protocol === 'file:';

    if (this.isFileProtocol) {
      console.warn('[SpeakingController] Running under file://. Chromium browsers require http://localhost or https:// for full microphone SpeechRecognition support.');
    }
  }

  async toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      await this.startListening();
    }
  }

  async requestMicrophonePermission() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaStream = stream;
        this.setupAudioVisualizer(stream);
        return true;
      }
    } catch (err) {
      console.warn('Microphone permission request failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.updateSpeakingUI('idle', '❌ Micro bị từ chối. Hãy bấm vào biểu tượng 🔒 hoặc 🎙️ bên trái thanh địa chỉ trình duyệt để chọn "Cho phép" (Allow) Micro.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        this.updateSpeakingUI('idle', '❌ Không tìm thấy thiết bị Microphone trên máy tính của bạn.');
      } else {
        this.updateSpeakingUI('idle', `❌ Lỗi truy cập Micro: ${err.message}`);
      }
      return false;
    }
    return true;
  }

  setupAudioVisualizer(stream) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const waveBars = document.querySelectorAll('.speaking-wave-bar');

      const animateWave = () => {
        if (!this.isListening) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        waveBars.forEach((bar, idx) => {
          const val = dataArray[idx % bufferLength] || average;
          const height = Math.max(6, Math.min(32, Math.round((val / 255) * 36)));
          bar.style.height = `${height}px`;
        });

        this.animFrameId = requestAnimationFrame(animateWave);
      };

      animateWave();
    } catch (e) {
      console.warn('Visualizer setup exception:', e);
    }
  }

  async startListening() {
    if (this.isFileProtocol) {
      const goLocal = confirm('⚠️ Trình duyệt Chrome / Edge chặn Micro khi mở trực tiếp từ file (C:/TA/index.html).\n\nBấm "OK" để chuyển sang http://localhost:5500 ngay bây giờ (Micro sẽ hoạt động 100% bình thường)!');
      if (goLocal) {
        window.location.href = 'http://localhost:5500/index.html';
        return;
      }
    }

    if (!this.speechSupported) {
      this.updateSpeakingUI('idle', '⚠️ Trình duyệt của bạn chưa hỗ trợ Web Speech API. Hãy mở bằng Google Chrome hoặc Microsoft Edge nhé!');
      alert('Vui lòng mở ứng dụng bằng Google Chrome hoặc Microsoft Edge để sử dụng đầy đủ tính năng Luyện Nói & Nhận diện Giọng Nói AI!');
      return;
    }

    // Request microphone access
    const hasMicAccess = await this.requestMicrophonePermission();
    if (!hasMicAccess) return;

    this.transcript = '';
    this.finalTranscript = '';
    this.isListening = true;

    // Create a fresh SpeechRecognition instance each time to prevent Chrome invalid state errors
    try {
      this.recognition = new this.SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 3;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateSpeakingUI('listening');
      };

      this.recognition.onaudiostart = () => {
        this.updateSpeakingUI('listening', '🎙️ Đang nghe giọng bạn... (Hãy đọc to và rõ ràng câu trên)');
      };

      this.recognition.onspeechstart = () => {
        this.updateSpeakingUI('listening', '🔊 Đang ghi nhận âm thanh... (Tiếp tục nói)');
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentLiveText = finalTrans || interimTranscript;
        if (currentLiveText) {
          this.transcript = currentLiveText;
          this.renderLiveTranscript(currentLiveText);
        }

        if (finalTrans) {
          this.finalTranscript = finalTrans;
          this.evaluatePronunciation(finalTrans);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        this.isListening = false;

        if (event.error === 'not-allowed') {
          if (this.isFileProtocol) {
            this.updateSpeakingUI('idle', '⚠️ Trình duyệt Chrome yêu cầu chạy qua Localhost để bật Micro. Hãy chạy tệp "run_app.bat" trong thư mục ứng dụng hoặc bấm Cho phép Micro.');
          } else {
            this.updateSpeakingUI('idle', '❌ Micro bị chặn. Hãy bấm icon 🔒/🎙️ trên thanh địa chỉ trình duyệt để cấp quyền "Cho phép" (Allow).');
          }
        } else if (event.error === 'no-speech') {
          this.updateSpeakingUI('idle', '⏳ Không nhận được giọng nói. Hãy bấm lại vào Micro và đọc to hơn nhé!');
        } else if (event.error === 'network') {
          this.updateSpeakingUI('idle', '⚠️ Lỗi kết nối dịch vụ nhận diện giọng nói Google. Vui lòng kiểm tra kết nối mạng Internet.');
        } else {
          this.updateSpeakingUI('idle', `Lỗi: ${event.error}. Hãy thử bấm nói lại.`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

        if (!this.finalTranscript && this.transcript) {
          this.evaluatePronunciation(this.transcript);
        } else if (!this.finalTranscript && !this.transcript) {
          this.updateSpeakingUI('idle');
        }
      };

      this.recognition.start();
      this.updateSpeakingUI('listening');
    } catch (err) {
      console.warn('Recognition start error:', err);
      this.isListening = false;
      this.updateSpeakingUI('idle', 'Lỗi khởi động nhận diện giọng nói. Hãy thử lại.');
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.updateSpeakingUI('idle');
  }

  updateSpeakingUI(state, customMsg) {
    const micBtn = document.getElementById('btnSpeakMic');
    const statusEl = document.getElementById('speakingStatusText');
    const waveEl = document.getElementById('speakingWaveVisualizer');

    if (!micBtn || !statusEl) return;

    if (state === 'listening') {
      micBtn.classList.add('listening');
      if (waveEl) waveEl.style.display = 'flex';
      statusEl.innerHTML = customMsg || '<span class="status-dot pulsing"></span> Đang lắng nghe giọng bạn nói... (Nói to và rõ ràng nhé)';
      statusEl.style.color = 'var(--accent-cyan)';
    } else if (state === 'evaluating') {
      micBtn.classList.remove('listening');
      if (waveEl) waveEl.style.display = 'none';
      statusEl.innerHTML = '⏳ Đang chấm điểm phát âm...';
      statusEl.style.color = 'var(--accent-purple)';
    } else {
      micBtn.classList.remove('listening');
      if (waveEl) waveEl.style.display = 'none';
      statusEl.innerHTML = customMsg || '🎙️ Bấm vào Micro và đọc to câu/từ tiếng Anh trên';
      statusEl.style.color = 'var(--text-secondary)';
    }
  }

  renderLiveTranscript(text) {
    const transcriptEl = document.getElementById('speakingTranscript');
    if (transcriptEl) {
      transcriptEl.innerHTML = `<em>"${this.escapeHtml(text)}"</em>`;
      transcriptEl.classList.add('active');
    }
  }

  evaluatePronunciation(spokenText) {
    const currentItem = this.app.currentItem;
    if (!currentItem || !spokenText) return;

    const targetText = currentItem.english.trim();
    const cleanTarget = targetText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    const cleanSpoken = spokenText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    let matchCount = 0;
    const wordBreakdown = [];

    cleanTarget.forEach((targetWord, idx) => {
      // Find best matching spoken word around current index (window of 2 words)
      let bestSimilarity = 0;
      let bestSpokenWord = '';

      const searchIndices = [idx, idx - 1, idx + 1, idx - 2, idx + 2].filter(i => i >= 0 && i < cleanSpoken.length);
      for (const sIdx of searchIndices) {
        const sim = this.calculateWordSimilarity(targetWord, cleanSpoken[sIdx]);
        if (sim > bestSimilarity) {
          bestSimilarity = sim;
          bestSpokenWord = cleanSpoken[sIdx];
        }
      }

      if (bestSimilarity >= 0.75) {
        matchCount++;
        wordBreakdown.push({ word: targetWord, status: 'correct', spoken: bestSpokenWord || targetWord });
      } else if (bestSimilarity >= 0.45) {
        matchCount += 0.6;
        wordBreakdown.push({ word: targetWord, status: 'close', spoken: bestSpokenWord });
      } else {
        wordBreakdown.push({ word: targetWord, status: 'missed', spoken: bestSpokenWord || '(chưa nghe rõ)' });
      }
    });

    const score = Math.min(100, Math.round((matchCount / Math.max(1, cleanTarget.length)) * 100));

    this.renderPronunciationResult(score, wordBreakdown, spokenText, targetText);

    // Speaking practice is learning too: keep the item in the same review
    // library and let its pronunciation score influence the SRS schedule.
    if (this.app.srs) {
      this.app.srs.recordAttempt(currentItem.id, score);
      this.app.renderLevelPills?.();
      this.app.updateStatsDisplay?.();
    }

    // Notify app study plan manager
    if (this.app.studyPlan) {
      this.app.studyPlan.recordSpeakingAttempt(score);
    }
  }

  calculateWordSimilarity(s1, s2) {
    if (!s1 || !s2) return 0;
    if (s1 === s2) return 1;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshtein(longer, shorter);
    return (longer.length - editDistance) / parseFloat(longer.length);
  }

  levenshtein(s1, s2) {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) costs[j] = j;
        else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  renderPronunciationResult(score, wordBreakdown, spokenText, targetText) {
    const resultBox = document.getElementById('speakingResultBox');
    const scoreValEl = document.getElementById('speakingScoreVal');
    const scoreRatingEl = document.getElementById('speakingScoreRating');
    const breakdownEl = document.getElementById('speakingWordBreakdown');
    const nextBtn = document.getElementById('btnNextSpeaking');

    if (!resultBox) return;

    resultBox.style.display = 'block';
    if (scoreValEl) scoreValEl.textContent = `${score}%`;

    let ratingText = '';
    let ratingColor = '';

    if (score >= 90) {
      ratingText = '🌟 Xuất sắc! Phát âm rất chuẩn như người bản xứ!';
      ratingColor = 'var(--accent-emerald)';
      if (this.app.audio && this.app.audio.playCelebrationSound) {
        this.app.audio.playCelebrationSound();
      }
    } else if (score >= 75) {
      ratingText = '👏 Rất tốt! Giọng rõ ràng và chuẩn xác.';
      ratingColor = 'var(--accent-cyan)';
    } else if (score >= 50) {
      ratingText = '💪 Khá ổn! Hãy nghe phát âm mẫu và luyện lại từng từ nhé.';
      ratingColor = 'var(--accent-amber)';
    } else {
      ratingText = '🎯 Cố lên! Hãy nghe kỹ phát âm mẫu và đọc to từng từ.';
      ratingColor = 'var(--accent-rose)';
    }

    if (scoreRatingEl) {
      scoreRatingEl.textContent = ratingText;
      scoreRatingEl.style.color = ratingColor;
    }

    if (breakdownEl) {
      breakdownEl.innerHTML = wordBreakdown.map(item => {
        let badgeClass = 'badge-correct';
        let icon = '✓';
        if (item.status === 'close') {
          badgeClass = 'badge-close';
          icon = '~';
        } else if (item.status === 'missed') {
          badgeClass = 'badge-missed';
          icon = '✗';
        }
        return `<span class="speaking-word-pill ${badgeClass}" title="Bạn nói: ${item.spoken || '(chưa nghe rõ)'}">${icon} ${item.word}</span>`;
      }).join(' ');
    }

    if (nextBtn) {
      nextBtn.style.display = 'inline-flex';
    }

    this.updateSpeakingUI('idle', '✅ Đã hoàn thành đánh giá giọng nói!');
  }

  escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

window.SpeakingController = SpeakingController;
