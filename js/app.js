/**
 * DictaLearn - Main Application Controller
 * Orchestrates datasets, UI rendering, diff evaluation, audio controls,
 * Spaced Repetition persistence, and PWA integration.
 */

class DictaLearnApp {
  constructor() {
    this.currentLevel = 'A1';
    this.currentMode = 'all'; // 'all' | 'word' | 'phrase' | 'sentence'
    this.currentTab = 'practice'; // 'practice' | 'review' | 'mastered'
    this.isShuffleMode = true; // Randomize vocabulary by default
    
    this.datasets = {}; // { A1: [], A2: [], ... }
    this.catalog = null;
    this.activeList = [];
    this.currentIndex = 0;
    this.currentItem = null;

    this.isResultsVisible = false;
    this.lastAttemptItemId = null;
    this.audioAutoPlay = true;

    // Submodules
    this.audio = new AudioController();
    this.srs = new SRSManager();
    this.speaking = new SpeakingController(this);
    this.studyPlan = new StudyPlanManager(this);
    this.shortcuts = new ShortcutsController(this);

    this.init();
  }

  async init() {
    this.bindDOM();
    this.initTheme();
    this.setupAudioListeners();
    await this.loadCatalogAndData();
    this.setupUIEventListeners();
    this.registerServiceWorker();
    this.updateStatsDisplay();
    this.studyPlan.updateDailyMissionWidget();
  }

  bindDOM() {
    // Top Bar
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.statsModalBtn = document.getElementById('statsModalBtn');
    this.shortcutsModalBtn = document.getElementById('shortcutsModalBtn');
    this.studyPlanBtn = document.getElementById('studyPlanBtn');
    this.streakCounterEl = document.getElementById('streakCounter');

    // Filters & Tabs
    this.levelPillsContainer = document.getElementById('levelPills');
    this.tabPracticeBtn = document.getElementById('tabPractice');
    this.tabSpeakingBtn = document.getElementById('tabSpeaking');
    this.tabReviewBtn = document.getElementById('tabReview');
    this.tabPlanBtn = document.getElementById('tabPlan');
    this.reviewCountBadge = document.getElementById('reviewCountBadge');

    // Daily Mission Widget
    this.dailyMissionWidget = document.getElementById('dailyMissionWidget');
    this.btnOpenRoadmapModal = document.getElementById('btnOpenRoadmapModal');
    this.btnCompleteDay = document.getElementById('btnCompleteDay');

    // Studio Card
    this.studioCard = document.getElementById('studioCard');
    this.tagLevel = document.getElementById('tagLevel');
    this.tagType = document.getElementById('tagType');
    this.btnShuffleToggle = document.getElementById('btnShuffleToggle');
    this.progressIndicator = document.getElementById('progressIndicator');

    // Speaking Mode Box Elements
    this.speakingPracticeBox = document.getElementById('speakingPracticeBox');
    this.speakingTargetEn = document.getElementById('speakingTargetEn');
    this.speakingTargetIPA = document.getElementById('speakingTargetIPA');
    this.speakingTargetVi = document.getElementById('speakingTargetVi');
    this.btnSpeakMic = document.getElementById('btnSpeakMic');
    this.btnListenModelAudio = document.getElementById('btnListenModelAudio');
    this.speakingResultBox = document.getElementById('speakingResultBox');
    this.btnRetrySpeaking = document.getElementById('btnRetrySpeaking');
    this.btnNextSpeaking = document.getElementById('btnNextSpeaking');

    // Audio Box (Typing Mode)
    this.audioVisualBox = document.getElementById('audioVisualBox');
    this.btnPlayHero = document.getElementById('btnPlayHero');
    this.voiceSelect = document.getElementById('voiceSelect');
    this.speedBtns = document.querySelectorAll('.speed-btn');

    // Input & Actions & Word Slots
    this.wordSlotsBoard = document.getElementById('wordSlotsBoard');
    this.slotsMatchCount = document.getElementById('slotsMatchCount');
    this.dictationInput = document.getElementById('dictationInput');
    this.charCounter = document.getElementById('charCounter');
    this.btnCheck = document.getElementById('btnCheck');
    this.btnReplay = document.getElementById('btnReplay');
    this.btnHint = document.getElementById('btnHint');
    this.btnSkip = document.getElementById('btnSkip');

    // Instant Translation Card Elements
    this.instantTranslationCard = document.getElementById('instantTranslationCard');
    this.instantIPA = document.getElementById('instantIPA');
    this.instantCategory = document.getElementById('instantCategory');
    this.instantVietnamese = document.getElementById('instantVietnamese');
    this.instantExample = document.getElementById('instantExample');

    // Permanent Always-Visible Meaning Bar Elements
    this.permanentMeaningBar = document.getElementById('permanentMeaningBar');
    this.permanentMeaningText = document.getElementById('permanentMeaningText');
    this.permanentIpaTag = document.getElementById('permanentIpaTag');
    this.btnEditViPermanent = document.getElementById('btnEditViPermanent');
    this.btnToggleMeaning = document.getElementById('btnToggleMeaning');
    this.customViInputPermanent = document.getElementById('customViInputPermanent');
    this.inlineViEditFormPermanent = document.getElementById('inlineViEditFormPermanent');
    this.btnSaveViPermanent = document.getElementById('btnSaveViPermanent');
    this.btnCancelViPermanent = document.getElementById('btnCancelViPermanent');

    // Custom Vietnamese Meaning Editor Elements (Other Panels)
    this.btnEditViSpeaking = document.getElementById('btnEditViSpeaking');
    this.btnSaveViSpeaking = document.getElementById('btnSaveViSpeaking');
    this.btnCancelViSpeaking = document.getElementById('btnCancelViSpeaking');
    this.customViInputSpeaking = document.getElementById('customViInputSpeaking');
    this.inlineViEditFormSpeaking = document.getElementById('inlineViEditFormSpeaking');

    this.btnEditViInstant = document.getElementById('btnEditViInstant');
    this.btnSaveViInstant = document.getElementById('btnSaveViInstant');
    this.btnCancelViInstant = document.getElementById('btnCancelViInstant');
    this.customViInputInstant = document.getElementById('customViInputInstant');
    this.inlineViEditFormInstant = document.getElementById('inlineViEditFormInstant');

    this.btnEditViResult = document.getElementById('btnEditViResult');
    this.btnSaveViResult = document.getElementById('btnSaveViResult');
    this.btnCancelViResult = document.getElementById('btnCancelViResult');
    this.customViInputResult = document.getElementById('customViInputResult');
    this.inlineViEditFormResult = document.getElementById('inlineViEditFormResult');

    // Results & SRS Panel
    this.resultsPanel = document.getElementById('resultsPanel');
    this.accuracyCircle = document.getElementById('accuracyCircle');
    this.accuracyScoreEl = this.accuracyCircle;
    this.feedbackTitle = document.getElementById('feedbackTitle');
    this.feedbackDesc = document.getElementById('feedbackDesc');
    this.diffTokensStream = document.getElementById('diffTokensStream');
    this.targetContextCard = document.getElementById('targetContextCard');
    this.originalTextEl = document.getElementById('originalText');
    this.ipaBadgeEl = document.getElementById('ipaBadge');
    this.vietnameseTextEl = document.getElementById('vietnameseText');
    this.exampleBoxEl = document.getElementById('exampleBox');
    this.btnNextAfterResult = document.getElementById('btnNextAfterResult');

    // Modals
    this.statsModal = document.getElementById('statsModal');
    this.shortcutsModal = document.getElementById('shortcutsModal');
    this.studyPlanModal = document.getElementById('studyPlanModal');
    this.apiModal = document.getElementById('apiModal');
    this.apiModalBtn = document.getElementById('apiModalBtn');
    this.modalCloseBtns = document.querySelectorAll('.modal-close');

    // API Modal Controls
    this.btnFetchApiWords = document.getElementById('btnFetchApiWords');
    this.btnFetchApiSentences = document.getElementById('btnFetchApiSentences');
    this.btnFetchCustomWord = document.getElementById('btnFetchCustomWord');
    this.customWordInput = document.getElementById('customWordInput');
    this.apiTopicSelect = document.getElementById('apiTopicSelect');
    this.apiStatusBox = document.getElementById('apiStatusBox');

    // Analytics elements in modal
    this.statTotalPracticed = document.getElementById('statTotalPracticed');
    this.statAccuracyRate = document.getElementById('statAccuracyRate');
    this.statMasteredCount = document.getElementById('statMasteredCount');
    this.statReviewCount = document.getElementById('statReviewCount');
    this.statStreak = document.getElementById('statStreak');
    this.btnExportData = document.getElementById('btnExportData');
    this.btnImportData = document.getElementById('btnImportData');
    this.importFileInput = document.getElementById('importFileInput');
    this.btnResetData = document.getElementById('btnResetData');
  }

  initTheme() {
    const savedTheme = localStorage.getItem('dictalearn_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dictalearn_theme', next);
  }

  setupAudioListeners() {
    this.audio.onStateChange((isPlaying) => {
      if (isPlaying) {
        this.audioVisualBox.classList.add('playing');
        this.btnPlayHero.classList.add('is-playing');
      } else {
        this.audioVisualBox.classList.remove('playing');
        this.btnPlayHero.classList.remove('is-playing');
      }
    });
  }

  async loadCatalogAndData() {
    // 1. Optional embedded datasets (normally empty in the HTTP build).
    if (window.EMBEDDED_CATALOG) {
      this.catalog = window.EMBEDDED_CATALOG;
    }

    this.datasets = {
      'A1': window.DATA_A1 || (window.EMBEDDED_DATASETS && window.EMBEDDED_DATASETS['A1']) || [],
      'A2': window.DATA_A2 || (window.EMBEDDED_DATASETS && window.EMBEDDED_DATASETS['A2']) || [],
      'B1': window.DATA_B1 || (window.EMBEDDED_DATASETS && window.EMBEDDED_DATASETS['B1']) || [],
      'B2': window.DATA_B2 || (window.EMBEDDED_DATASETS && window.EMBEDDED_DATASETS['B2']) || [],
      'C1': window.DATA_C1 || (window.EMBEDDED_DATASETS && window.EMBEDDED_DATASETS['C1']) || []
    };

    // 2. Load only the active level. HTTP uses JSON; file:// falls back to a
    // lazily injected classic script because browsers block local JSON fetches.
    await this.loadLevelData(this.currentLevel);

    // Render level buttons and load first item
    this.renderLevelPills();
    this.applyFilter();
  }

  renderLevelPills() {
    if (!this.catalog || !this.levelPillsContainer) return;

    this.levelPillsContainer.innerHTML = this.catalog.levels.map(lvl => {
      const count = (this.datasets[lvl.code] || []).length || lvl.total || 5000;
      return `
        <button class="level-pill ${lvl.code === this.currentLevel ? 'active' : ''}" data-level="${lvl.code}">
          ${lvl.code} <span class="badge-count">${count.toLocaleString()} từ</span>
        </button>
      `;
    }).join('');

    this.levelPillsContainer.querySelectorAll('.level-pill').forEach(btn => {
      btn.addEventListener('click', async () => {
        this.currentLevel = btn.dataset.level;
        this.levelPillsContainer.querySelectorAll('.level-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        await this.loadLevelData(this.currentLevel);

        this.applyFilter();
      });
    });
  }

  async loadLevelData(level) {
    const hasCommunicationData = (items) => Array.isArray(items) &&
      items.length >= 7000 && items.some(item => item.type === 'phrase') && items.some(item => item.type === 'sentence');
    if (hasCommunicationData(this.datasets[level])) return true;

    try {
      const response = await fetch(`./data/data_${level}.json?v=6`, { cache: 'reload' });
      if (response.ok) {
        const items = await response.json();
        if (hasCommunicationData(items)) {
          this.datasets[level] = items;
          return true;
        }
      }
    } catch (error) {
      // Expected for file://. Continue with the script fallback below.
    }

    try {
      await this.loadDatasetScript(level);
      const embedded = window[`DATA_${level}`];
      if (Array.isArray(embedded) && embedded.length) {
        this.datasets[level] = embedded;
        return true;
      }
    } catch (error) {
      console.error(`[DictaLearn] Cannot load dataset ${level}:`, error);
    }
    return false;
  }

  loadDatasetScript(level) {
    const id = `dataset-script-${level}`;
    const existing = document.getElementById(id);
    if (existing) {
      return window[`DATA_${level}`]
        ? Promise.resolve()
        : new Promise((resolve, reject) => {
            existing.addEventListener('load', resolve, { once: true });
            existing.addEventListener('error', reject, { once: true });
          });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = id;
      script.src = `./data/data_${level}.js?v=6`;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Missing data_${level}.js`));
      document.head.appendChild(script);
    });
  }

  shuffleArray(array) {
    if (!array || array.length <= 1) return array ? [...array] : [];
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  applyFilter() {
    let pool = [];

    if (this.currentTab === 'review') {
      // Collect items present in Review Queue across all levels or selected level
      const queueIds = this.srs.getDueReviewIds();
      const allItems = Object.values(this.datasets).flat();
      pool = allItems.filter(item => queueIds.includes(item.id));
    } else {
      // Standard Level Dataset
      pool = this.datasets[this.currentLevel] || [];
    }

    this.updateModeAvailability(pool);

    // Apply Mode Filter (word / phrase / sentence)
    if (this.currentMode !== 'all') {
      pool = pool.filter(it => it.type === this.currentMode);
    }

    // Randomize / Shuffle or keep ordered
    if (this.isShuffleMode) {
      this.activeList = this.shuffleArray(pool);
    } else {
      this.activeList = [...pool];
    }

    this.currentIndex = 0;
    this.updateStatsDisplay();
    this.loadItem(this.currentIndex);
  }

  updateModeAvailability(pool) {
    document.querySelectorAll('.mode-pill').forEach(btn => {
      const mode = btn.dataset.mode;
      const count = mode === 'all' ? pool.length : pool.filter(item => item.type === mode).length;
      const labels = { all: 'Tất cả', word: 'Từ đơn', phrase: 'Cụm từ', sentence: 'Câu' };
      btn.textContent = `${labels[mode] || mode} (${count.toLocaleString('vi-VN')})`;
      if (mode === 'all') return;
      const available = count > 0;
      btn.disabled = !available;
      btn.title = available ? '' : 'Bộ dữ liệu hiện tại chưa có nội dung loại này';
      if (!available && this.currentMode === btn.dataset.mode) {
        this.currentMode = 'all';
        document.querySelector('.mode-pill[data-mode="all"]')?.classList.add('active');
        btn.classList.remove('active');
      }
    });
  }

  loadItem(index) {
    if (!this.activeList || this.activeList.length === 0) {
      this.renderEmptyState();
      return;
    }

    if (index < 0) index = 0;
    if (index >= this.activeList.length) index = 0;

    this.currentIndex = index;
    this.currentItem = this.activeList[this.currentIndex];

    // User-provided meanings always take precedence over bundled/API data.
    const legacyOverride = localStorage.getItem('dictalearn_custom_vi_' + this.currentItem.id);
    const savedOverride = this.srs.getMeaningOverride(this.currentItem.id) || legacyOverride;
    if (savedOverride) {
      this.currentItem.vietnamese = savedOverride;
      if (!this.srs.getMeaningOverride(this.currentItem.id)) {
        this.srs.setMeaningOverride(this.currentItem.id, savedOverride);
      }
    }

    // Update UI Meta
    this.tagLevel.textContent = this.currentItem.level || this.currentLevel;
    this.tagType.textContent = this.currentItem.type || 'Sentence';
    this.progressIndicator.textContent = `${this.currentIndex + 1} / ${this.activeList.length}`;

    // Update Speaking Prompt Card
    if (this.speakingTargetEn) this.speakingTargetEn.textContent = this.currentItem.english;
    if (this.speakingTargetIPA) this.speakingTargetIPA.textContent = this.currentItem.ipa || '';
    if (this.speakingTargetVi) this.speakingTargetVi.textContent = this.currentItem.vietnamese || '';
    if (this.speakingResultBox) this.speakingResultBox.style.display = 'none';
    if (this.speaking) this.speaking.updateSpeakingUI('idle');

    // Update Permanent Meaning Bar
    if (this.permanentMeaningText) this.permanentMeaningText.textContent = this.currentItem.vietnamese || 'Đang tra nghĩa...';
    if (this.permanentIpaTag) this.permanentIpaTag.textContent = this.currentItem.ipa || '';
    if (this.inlineViEditFormPermanent) this.inlineViEditFormPermanent.style.display = 'none';

    // Reset Input Box & Letter Engine
    this.dictationInput.value = '';
    this.isItemCompleted = false;
    if (this.autoAdvanceTimer) clearTimeout(this.autoAdvanceTimer);
    if (this.instantTranslationCard) this.instantTranslationCard.style.display = 'none';

    this.letterStructure = DiffEngine.parseLetterStructure(this.currentItem.english);
    this.syncTilesFromInput();
    this.hideResults();

    // Auto-focus input if in practice mode
    if (this.currentTab !== 'speaking') {
      setTimeout(() => {
        this.dictationInput.focus();
      }, 100);
    }

    // Auto-enrich Vietnamese meaning and IPA in background if needed
    this.enrichItemMeaning(this.currentItem);

    // Auto-play audio if enabled
    if (this.audioAutoPlay) {
      setTimeout(() => {
        this.audio.playItem(this.currentItem);
      }, 300);
    }
  }

  async enrichItemMeaning(item) {
    if (!item || !item.english) return;
    const wordKey = item.english.trim().toLowerCase();

    // 1. Check local storage cache for instant offline reuse
    const cachedVi = localStorage.getItem('dictalearn_vi_' + wordKey);
    const cachedIPA = localStorage.getItem('dictalearn_ipa_' + wordKey);
    const cachedPOS = localStorage.getItem('dictalearn_pos_' + wordKey);

    if (cachedVi) {
      item.vietnamese = cachedVi;
      if (cachedIPA && (!item.ipa || item.ipa === `/${wordKey}/`)) {
        item.ipa = cachedIPA;
      }
      if (cachedPOS) item.part_of_speech = cachedPOS;
      this.updateTranslationCardIfVisible(item);
      const hasIPA = cachedIPA || (item.ipa && item.ipa !== `/${wordKey}/`);
      const hasPOS = item.type !== 'word' || (item.part_of_speech && !['word', 'vocabulary'].includes(item.part_of_speech));
      if (hasIPA && hasPOS) return;
    }

    // 2. Enrich fields independently. Parentheses often contain valid usage notes.
    const needsTranslation = !item.vietnamese || item.vietnamese.startsWith('Từ vựng') ||
      /(^|\s)(xem|s\. of|c\. of)\b/i.test(item.vietnamese);
    const needsIPA = item.type === 'word' && (!item.ipa || item.ipa === `/${wordKey}/`);
    const needsPOS = item.type === 'word' && (!item.part_of_speech || ['word', 'vocabulary'].includes(item.part_of_speech));
    if ((needsTranslation || needsIPA || needsPOS) && typeof APIService !== 'undefined') {
      try {
        const viPromise = needsTranslation ? APIService.translateToVietnamese(item.english) : Promise.resolve('');
        const detailsPromise = (needsIPA || needsPOS) ? APIService.fetchWordDetails(item.english) : Promise.resolve(null);

        const [viText, details] = await Promise.all([viPromise, detailsPromise]);

        if (viText && viText.toLowerCase() !== item.english.toLowerCase()) {
          item.vietnamese = viText;
          localStorage.setItem('dictalearn_vi_' + wordKey, viText);
        }

        if (details && details.ipa) {
          item.ipa = details.ipa;
          localStorage.setItem('dictalearn_ipa_' + wordKey, details.ipa);
        }
        if (details && details.partOfSpeech) {
          item.part_of_speech = details.partOfSpeech;
          localStorage.setItem('dictalearn_pos_' + wordKey, details.partOfSpeech);
        }

        this.updateTranslationCardIfVisible(item);
      } catch (err) {
        // Fallback gracefully
      }
    }
  }

  updateTranslationCardIfVisible(item) {
    if (this.currentItem && this.currentItem.id === item.id) {
      const viDisplay = item.vietnamese || 'Đang tra nghĩa...';
      if (this.permanentMeaningText) this.permanentMeaningText.textContent = viDisplay;
      if (this.permanentIpaTag && item.ipa) this.permanentIpaTag.textContent = item.ipa;
      if (this.instantVietnamese) this.instantVietnamese.textContent = viDisplay;
      if (this.instantIPA && item.ipa) this.instantIPA.textContent = item.ipa;
      if (this.vietnameseTextEl) this.vietnameseTextEl.textContent = viDisplay;
      if (this.speakingTargetVi) this.speakingTargetVi.textContent = viDisplay;
      if (this.ipaBadgeEl) {
        this.ipaBadgeEl.textContent = [item.ipa, this.getPartOfSpeechLabel(item)].filter(Boolean).join(' • ');
      }
      if (this.instantCategory) this.instantCategory.textContent = this.getPartOfSpeechLabel(item);
    }
  }

  saveCustomVietnameseMeaning(newMeaning) {
    if (!this.currentItem || !newMeaning || !newMeaning.trim()) return;
    const cleanMeaning = newMeaning.trim();
    const wordKey = this.currentItem.english.trim().toLowerCase();

    // 1. Update in-memory item
    this.currentItem.vietnamese = cleanMeaning;

    // 2. Persist to localStorage for both exact ID and word key
    localStorage.setItem('dictalearn_vi_' + wordKey, cleanMeaning);
    localStorage.setItem('dictalearn_custom_vi_' + this.currentItem.id, cleanMeaning);
    this.srs.setMeaningOverride(this.currentItem.id, cleanMeaning);

    // 3. Update all instances in current dataset
    const lvlDataset = this.datasets[this.currentLevel] || [];
    lvlDataset.forEach(it => {
      if (it.english.trim().toLowerCase() === wordKey || it.id === this.currentItem.id) {
        it.vietnamese = cleanMeaning;
      }
    });

    // 4. Update UI displays
    this.updateTranslationCardIfVisible(this.currentItem);
    if (this.speakingTargetVi) this.speakingTargetVi.textContent = cleanMeaning;
    if (this.vietnameseTextEl) this.vietnameseTextEl.textContent = cleanMeaning;
    if (this.instantVietnamese) this.instantVietnamese.textContent = cleanMeaning;
    if (this.permanentMeaningText) this.permanentMeaningText.textContent = cleanMeaning;

    // 5. Hide edit forms
    this.closeAllViEditForms();

    // 6. Toast confirmation
    this.showToast(`✅ Đã lưu nghĩa mới: "${cleanMeaning}"!`);
  }

  closeAllViEditForms() {
    [this.inlineViEditFormPermanent, this.inlineViEditFormSpeaking, this.inlineViEditFormInstant, this.inlineViEditFormResult].forEach(form => {
      if (form) form.style.display = 'none';
    });
  }

  getPartOfSpeechLabel(item) {
    if (!item) return '';
    if (item.type === 'phrase') return 'Cụm từ';
    if (item.type === 'sentence') return 'Câu giao tiếp';
    const value = String(item.part_of_speech || '').toLowerCase();
    const labels = {
      noun: 'Danh từ', verb: 'Động từ', adjective: 'Tính từ', adverb: 'Trạng từ',
      pronoun: 'Đại từ', preposition: 'Giới từ', conjunction: 'Liên từ',
      interjection: 'Thán từ', determiner: 'Từ hạn định', article: 'Mạo từ',
      numeral: 'Số từ', auxiliary: 'Trợ động từ', modal: 'Động từ khuyết thiếu'
    };
    return labels[value] || (value && !['word', 'vocabulary'].includes(value) ? item.part_of_speech : 'Từ vựng');
  }

  syncTilesFromInput() {
    if (!this.wordSlotsBoard || !this.currentItem || !this.letterStructure) return;

    const rawInput = this.dictationInput.value;
    const hasTrailingSpace = rawInput.endsWith(' ');
    const userWords = rawInput.trimStart().length > 0 
      ? rawInput.trimStart().split(/\s+/) 
      : [];

    let completedWordsCount = 0;
    let allWordsCorrect = true;

    // Determine currently active word index
    let activeWordIndex = 0;
    if (userWords.length > 0) {
      activeWordIndex = Math.min(userWords.length - 1, this.letterStructure.length - 1);
      // If current word is fully typed and correct, and user pressed space, advance active word pointer
      const activeWordObj = this.letterStructure[activeWordIndex];
      const activeUserWord = userWords[activeWordIndex] || '';
      if (activeUserWord.toLowerCase() === activeWordObj.cleanWord && hasTrailingSpace && activeWordIndex < this.letterStructure.length - 1) {
        activeWordIndex++;
      }
    }

    const boardHTML = this.letterStructure.map((w, wIdx) => {
      const userWord = userWords[wIdx] || '';
      const userLetters = userWord.split('');
      const isWordActive = wIdx === activeWordIndex;
      const isWordMatch = userWord.toLowerCase() === w.cleanWord;

      if (isWordMatch) {
        completedWordsCount++;
      } else {
        allWordsCorrect = false;
      }

      const lettersHTML = w.letters.map((char, lIdx) => {
        let tileClass = 'letter-tile pending';
        let displayChar = '•';

        if (lIdx < userLetters.length) {
          const typedChar = userLetters[lIdx];
          const expectedClean = w.cleanLetters[lIdx];
          const isCharCorrect = typedChar.toLowerCase() === expectedClean;

          if (isCharCorrect) {
            tileClass = 'letter-tile correct';
            displayChar = w.letters[lIdx]; // Show correct letter in green
          } else {
            tileClass = 'letter-tile wrong';
            displayChar = this.escapeHTML(typedChar); // Never inject typed HTML into the board
          }
        } else if (isWordActive && lIdx === userLetters.length && !this.isItemCompleted) {
          tileClass = 'letter-tile active';
          displayChar = '_';
        }

        return `<span class="${tileClass}" id="tile_${wIdx}_${lIdx}">${displayChar}</span>`;
      }).join('');

      const groupClass = `word-group ${isWordActive ? 'active' : ''} ${isWordMatch ? 'completed' : ''}`;
      return `
        <div class="${groupClass}" id="wgroup_${wIdx}" title="Từ ${wIdx + 1}: ${w.letterCount} chữ cái">
          <div class="letter-tiles-row">
            ${w.prefixPunct ? `<span class="word-punct">${this.escapeHTML(w.prefixPunct)}</span>` : ''}
            ${lettersHTML}
            ${w.suffixPunct ? `<span class="word-punct">${this.escapeHTML(w.suffixPunct)}</span>` : ''}
          </div>
          <span class="word-sub-label">${w.letterCount} chữ</span>
        </div>
      `;
    }).join('');

    this.wordSlotsBoard.className = `word-slots-board ${allWordsCorrect && userWords.length >= this.letterStructure.length ? 'all-completed' : ''}`;
    this.wordSlotsBoard.innerHTML = boardHTML;

    // Update Counter
    if (this.slotsMatchCount) {
      this.slotsMatchCount.textContent = `${completedWordsCount} / ${this.letterStructure.length} từ đúng`;
    }

    const totalChars = this.dictationInput.value.length;
    if (this.charCounter) {
      this.charCounter.textContent = `${totalChars} ký tự`;
    }

    // Check if ALL words are completed and correct -> AUTO-PASS!
    if (allWordsCorrect && userWords.length >= this.letterStructure.length && !this.isItemCompleted) {
      this.handleSentenceCompleted();
    }
  }

  handleSentenceCompleted() {
    this.isItemCompleted = true;
    this.wordSlotsBoard?.classList.add('all-completed');

    // Show Instant Translation Card prominently with Vietnamese Meaning & IPA
    if (this.instantTranslationCard) {
      this.instantTranslationCard.style.display = 'flex';
      if (this.instantIPA) this.instantIPA.textContent = this.currentItem.ipa || '';
      if (this.instantCategory) this.instantCategory.textContent = this.getPartOfSpeechLabel(this.currentItem);
      if (this.instantVietnamese) this.instantVietnamese.textContent = this.currentItem.vietnamese || 'Đang tra nghĩa...';
      if (this.instantExample && this.currentItem.example && this.currentItem.example !== this.currentItem.english) {
        this.instantExample.style.display = 'block';
        this.instantExample.replaceChildren();
        const label = document.createElement('strong');
        label.textContent = 'Ví dụ: ';
        const example = document.createElement('em');
        example.textContent = this.currentItem.example;
        this.instantExample.append(label, example, document.createTextNode(` — ${this.currentItem.example_vi || ''}`));
      } else if (this.instantExample) {
        this.instantExample.style.display = 'none';
      }
    }

    // Show Diff / Results Banner
    const fullText = this.currentItem.english;
    const diff = DiffEngine.computeDiff(this.dictationInput.value, fullText);
    this.renderDiffResult(diff, this.currentItem);
    this.isResultsVisible = true;
    this.resultsPanel.classList.add('visible');

    // Record SRS Mastered & Study Plan Progress
    this.srs.recordAttempt(this.currentItem.id, 100);
    this.studyPlan?.recordTypingAttempt(this.currentItem, true);
    this.updateStatsDisplay();

    // Keep the result visible. The learner explicitly presses Enter or the
    // next button when they are ready to continue.
    if (this.autoAdvanceTimer) clearTimeout(this.autoAdvanceTimer);
    this.autoAdvanceTimer = null;
  }

  renderEmptyState() {
    this.tagLevel.textContent = this.currentLevel;
    this.tagType.textContent = 'Trống';
    this.progressIndicator.textContent = '0 / 0';
    if (this.wordSlotsBoard) this.wordSlotsBoard.innerHTML = '<span style="color: var(--text-muted); font-size: 0.9rem;">Chưa có dữ liệu bài học</span>';
    if (this.slotsMatchCount) this.slotsMatchCount.textContent = '0 / 0 từ';
    if (this.instantTranslationCard) this.instantTranslationCard.style.display = 'none';
    this.dictationInput.value = '';
    this.hideResults();
  }

  updateCharCounter() {
    const len = this.dictationInput.value.length;
    this.charCounter.textContent = `${len} ký tự`;
  }

  toggleAudio() {
    if (this.currentItem) {
      this.audio.togglePlay(this.currentItem);
    }
  }

  replayAudio() {
    if (this.currentItem) {
      this.audio.playItem(this.currentItem);
    }
  }

  handleEnterKey() {
    // If word/sentence is completed or results shown, Enter immediately jumps to the next question!
    if (this.isItemCompleted || this.isResultsVisible) {
      if (this.autoAdvanceTimer) clearTimeout(this.autoAdvanceTimer);
      this.nextItem();
    } else {
      this.evaluateAnswer();
    }
  }

  requestHint() {
    if (!this.currentItem || !this.letterStructure) return;

    const rawInput = this.dictationInput.value;
    const userWords = rawInput.trimStart().length > 0 ? rawInput.trimStart().split(/\s+/) : [];
    const activeWordIdx = Math.min(Math.max(0, userWords.length - 1), this.letterStructure.length - 1);
    const targetWord = this.letterStructure[activeWordIdx];

    const currentWordTyped = userWords[activeWordIdx] || '';
    if (currentWordTyped.length < targetWord.letters.length) {
      const nextLetter = targetWord.letters[currentWordTyped.length];
      this.dictationInput.value += nextLetter;
    } else if (activeWordIdx < this.letterStructure.length - 1) {
      this.dictationInput.value += (rawInput.endsWith(' ') ? '' : ' ') + this.letterStructure[activeWordIdx + 1].letters[0];
    }
    this.syncTilesFromInput();
    this.srs.addToReviewQueue(this.currentItem.id);
    this.srs.saveData();
  }

  evaluateAnswer() {
    if (!this.currentItem) return;

    const userInput = this.dictationInput.value.trim();
    const target = this.currentItem.english;
    const diff = DiffEngine.computeDiff(userInput, target);

    // Render Diff UI
    this.renderDiffResult(diff, this.currentItem);
    this.isResultsVisible = true;
    this.resultsPanel.classList.add('visible');

    // Save SRS record
    this.srs.recordAttempt(this.currentItem.id, diff.accuracy);
    this.updateStatsDisplay();

    // Scroll to results if needed
    this.resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  renderDiffResult(diff, item) {
    // 1. Accuracy Circle & Scores
    if (this.accuracyScoreEl) this.accuracyScoreEl.textContent = `${diff.accuracy}%`;
    this.accuracyCircle.textContent = `${diff.accuracy}%`;
    this.accuracyCircle.className = 'accuracy-circle';
    
    if (diff.accuracy >= 90) {
      this.accuracyCircle.classList.add('accuracy-high');
      this.feedbackTitle.textContent = '🎉 Xuất sắc! Gần như hoàn hảo!';
      this.feedbackDesc.textContent = 'Bạn đã nghe và chép chính xác nội dung.';
    } else if (diff.accuracy >= 60) {
      this.accuracyCircle.classList.add('accuracy-mid');
      this.feedbackTitle.textContent = '👍 Khá tốt! Hãy chú ý các từ sai!';
      this.feedbackDesc.textContent = 'Một số từ hoặc ký tự chưa chính xác, hãy xem so sánh bên dưới.';
    } else {
      this.accuracyCircle.classList.add('accuracy-low');
      this.feedbackTitle.textContent = '💪 Cần cố gắng hơn nữa!';
      this.feedbackDesc.textContent = 'Câu này đã được tự động thêm vào danh sách Ôn tập.';
    }

    // 2. Token Stream Highlighting
    this.diffTokensStream.innerHTML = diff.tokens.map(tok => {
      if (tok.type === 'correct') {
        return `<span class="diff-token correct">${this.escapeHTML(tok.userWord)}</span>`;
      } else if (tok.type === 'wrong') {
        return `
          <span class="diff-token wrong">
            <span class="user-word">${this.escapeHTML(tok.userWord)}</span>
            <span class="expected-word">${this.escapeHTML(tok.expectedWord)}</span>
          </span>
        `;
      } else if (tok.type === 'missing') {
        return `<span class="diff-token missing">${this.escapeHTML(tok.expectedWord)}</span>`;
      } else if (tok.type === 'extra') {
        return `<span class="diff-token extra">${this.escapeHTML(tok.userWord)}</span>`;
      }
      return '';
    }).join(' ');

    // 3. Target & Context Card (IPA, Translation, Example)
    this.originalTextEl.textContent = item.english;
    const posLabel = this.getPartOfSpeechLabel(item);
    this.ipaBadgeEl.textContent = [item.ipa, posLabel].filter(Boolean).join(' • ');
    this.vietnameseTextEl.textContent = item.vietnamese || '';
    
    if (item.example && item.example !== item.english) {
      this.exampleBoxEl.style.display = 'block';
      this.exampleBoxEl.replaceChildren();
      const exampleLine = document.createElement('div');
      const label = document.createElement('strong');
      label.textContent = 'Ví dụ: ';
      const example = document.createElement('em');
      example.textContent = item.example;
      exampleLine.append(label, example);
      const translation = document.createElement('div');
      translation.style.cssText = 'font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;';
      translation.textContent = item.example_vi || '';
      this.exampleBoxEl.append(exampleLine, translation);
    } else {
      this.exampleBoxEl.style.display = 'none';
    }
  }

  rateItem(rating) {
    if (!this.currentItem) return;
    this.srs.rateLastAttempt(this.currentItem.id, rating);
    this.nextItem();
  }

  escapeHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  hideResults() {
    this.isResultsVisible = false;
    this.resultsPanel.classList.remove('visible');
  }

  nextItem() {
    if (this.autoAdvanceTimer) clearTimeout(this.autoAdvanceTimer);
    if (this.instantTranslationCard) this.instantTranslationCard.style.display = 'none';
    if (this.activeList.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.activeList.length;
    this.loadItem(this.currentIndex);
  }

  prevItem() {
    if (this.activeList.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.activeList.length) % this.activeList.length;
    this.loadItem(this.currentIndex);
  }

  updateStatsDisplay() {
    const stats = this.srs.getAnalyticsOverview();
    
    if (this.streakCounterEl) {
      this.streakCounterEl.textContent = `${stats.currentStreak} ngày`;
    }
    if (this.reviewCountBadge) {
      this.reviewCountBadge.textContent = stats.reviewQueueCount;
    }

    // Modal stats
    if (this.statTotalPracticed) this.statTotalPracticed.textContent = stats.totalPracticed;
    if (this.statAccuracyRate) this.statAccuracyRate.textContent = `${stats.accuracyRate}%`;
    if (this.statMasteredCount) this.statMasteredCount.textContent = stats.masteredCount;
    if (this.statReviewCount) this.statReviewCount.textContent = stats.reviewQueueCount;
    if (this.statStreak) this.statStreak.textContent = `${stats.currentStreak} ngày`;
  }

  setupUIEventListeners() {
    // Theme toggle
    this.themeToggleBtn?.addEventListener('click', () => this.toggleTheme());

    // Modals
    this.statsModalBtn?.addEventListener('click', () => {
      this.updateStatsDisplay();
      this.statsModal.classList.add('active');
    });
    this.shortcutsModalBtn?.addEventListener('click', () => {
      this.shortcutsModal.classList.add('active');
    });
    this.apiModalBtn?.addEventListener('click', () => {
      this.apiModal.classList.add('active');
    });

    this.modalCloseBtns?.forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });
    [this.statsModal, this.shortcutsModal, this.apiModal].forEach(m => {
      m?.addEventListener('click', (e) => {
        if (e.target === m) this.closeAllModals();
      });
    });

    // Online API Actions
    this.btnFetchApiWords?.addEventListener('click', () => this.handleFetchApiWords());
    this.btnFetchApiSentences?.addEventListener('click', () => this.handleFetchApiSentences());
    this.btnFetchCustomWord?.addEventListener('click', () => this.handleFetchCustomWord());
    this.customWordInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleFetchCustomWord();
      }
    });

    // Shuffle Mode Toggle (Randomize 5,000 words order)
    this.btnShuffleToggle?.addEventListener('click', () => {
      this.isShuffleMode = !this.isShuffleMode;
      if (this.isShuffleMode) {
        this.btnShuffleToggle.classList.add('active');
      } else {
        this.btnShuffleToggle.classList.remove('active');
      }
      this.applyFilter();
    });

    // Mode filter pills
    document.querySelectorAll('.mode-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode;
        this.applyFilter();
      });
    });

    // Tab buttons (Luyện gõ vs Luyện nói vs Ôn tập vs Lộ trình)
    this.tabPracticeBtn?.addEventListener('click', () => {
      this.currentTab = 'practice';
      this.setActiveTabPill(this.tabPracticeBtn);
      this.updateUIModeViews();
      this.applyFilter();
    });

    this.tabSpeakingBtn?.addEventListener('click', () => {
      this.currentTab = 'speaking';
      this.setActiveTabPill(this.tabSpeakingBtn);
      this.updateUIModeViews();
      this.applyFilter();
    });

    this.tabReviewBtn?.addEventListener('click', () => {
      this.currentTab = 'review';
      this.setActiveTabPill(this.tabReviewBtn);
      this.updateUIModeViews();
      this.applyFilter();
    });

    this.tabPlanBtn?.addEventListener('click', () => {
      this.studyPlan.renderRoadmap();
      this.studyPlanModal?.classList.add('active');
    });

    this.studyPlanBtn?.addEventListener('click', () => {
      this.studyPlan.renderRoadmap();
      this.studyPlanModal?.classList.add('active');
    });

    this.btnOpenRoadmapModal?.addEventListener('click', () => {
      this.studyPlan.renderRoadmap();
      this.studyPlanModal?.classList.add('active');
    });
    this.btnCompleteDay?.addEventListener('click', () => {
      this.studyPlan.completeTodayAndDownload();
    });

    // Speaking Practice Controls
    this.btnSpeakMic?.addEventListener('click', () => {
      this.speaking.toggleListening();
    });
    this.btnListenModelAudio?.addEventListener('click', () => {
      this.audio.playItem(this.currentItem);
    });
    this.btnRetrySpeaking?.addEventListener('click', () => {
      if (this.speakingResultBox) this.speakingResultBox.style.display = 'none';
      this.speaking.startListening();
    });
    this.btnNextSpeaking?.addEventListener('click', () => {
      this.nextItem();
    });

    // Audio Player Buttons
    this.btnPlayHero?.addEventListener('click', () => this.toggleAudio());
    this.btnReplay?.addEventListener('click', () => this.replayAudio());

    // Speed Selector Buttons
    this.speedBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        this.speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.audio.setRate(btn.dataset.speed);
      });
    });

    // Voice accent select
    this.voiceSelect?.addEventListener('change', (e) => {
      this.audio.setVoiceLang(e.target.value);
    });

    // Real-time Input Synchronization
    this.dictationInput?.addEventListener('input', () => {
      this.syncTilesFromInput();
    });

    this.wordSlotsBoard?.addEventListener('click', () => {
      this.dictationInput?.focus();
    });

    // Action Buttons
    this.btnCheck?.addEventListener('click', () => this.handleEnterKey());
    this.btnHint?.addEventListener('click', () => this.requestHint());
    this.btnSkip?.addEventListener('click', () => this.nextItem());
    this.btnNextAfterResult?.addEventListener('click', () => this.nextItem());

    // Custom Vietnamese Meaning Edit Forms
    const setupViEdit = (btnEdit, form, input, btnSave, btnCancel) => {
      btnEdit?.addEventListener('click', () => {
        const currentVi = this.currentItem?.vietnamese || '';
        if (input) input.value = currentVi;
        if (form) form.style.display = 'flex';
        input?.focus();
      });

      btnSave?.addEventListener('click', () => {
        if (input) this.saveCustomVietnameseMeaning(input.value);
      });

      btnCancel?.addEventListener('click', () => {
        if (form) form.style.display = 'none';
      });

      input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.saveCustomVietnameseMeaning(input.value);
        } else if (e.key === 'Escape') {
          if (form) form.style.display = 'none';
        }
      });
    };

    setupViEdit(this.btnEditViPermanent, this.inlineViEditFormPermanent, this.customViInputPermanent, this.btnSaveViPermanent, this.btnCancelViPermanent);
    setupViEdit(this.btnEditViSpeaking, this.inlineViEditFormSpeaking, this.customViInputSpeaking, this.btnSaveViSpeaking, this.btnCancelViSpeaking);
    setupViEdit(this.btnEditViInstant, this.inlineViEditFormInstant, this.customViInputInstant, this.btnSaveViInstant, this.btnCancelViInstant);
    setupViEdit(this.btnEditViResult, this.inlineViEditFormResult, this.customViInputResult, this.btnSaveViResult, this.btnCancelViResult);

    // Toggle Vietnamese Meaning Visibility
    this.btnToggleMeaning?.addEventListener('click', () => {
      if (this.permanentMeaningText) {
        this.permanentMeaningText.classList.toggle('blurred-meaning');
      }
    });

    // SRS Rating Buttons inside results
    document.querySelectorAll('.srs-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.dataset.rating, 10);
        this.rateItem(rating);
      });
    });

    // Export / Import / Reset progress
    this.btnExportData?.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(this.srs.exportProgressJSON());
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `dictalearn_progress_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    this.btnImportData?.addEventListener('click', () => this.importFileInput.click());
    this.importFileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        let ok = false;
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.format === 'DictaLearn Daily Progress' && parsed.srsData && parsed.studyPlan) {
            ok = this.srs.importProgressJSON(JSON.stringify(parsed.srsData));
            if (ok) {
              localStorage.setItem(this.studyPlan.storageKey, JSON.stringify(parsed.studyPlan));
              this.studyPlan.state = this.studyPlan.loadState();
              this.studyPlan.updateDailyMissionWidget();
              this.studyPlan.renderRoadmap();
            }
          } else {
            ok = this.srs.importProgressJSON(event.target.result);
          }
        } catch (error) {
          ok = false;
        }
        if (ok) {
          alert('Khôi phục tiến trình học thành công!');
          this.updateStatsDisplay();
          this.applyFilter();
          this.closeAllModals();
        } else {
          alert('Tệp dữ liệu không hợp lệ.');
        }
      };
      reader.readAsText(file);
    });

    this.btnResetData?.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học tập và chuỗi ngày không?')) {
        this.srs.resetAllData();
        this.updateStatsDisplay();
        this.applyFilter();
        this.closeAllModals();
      }
    });
  }

  setApiStatus(msg, isError = false) {
    if (!this.apiStatusBox) return;
    this.apiStatusBox.style.display = 'block';
    this.apiStatusBox.textContent = msg;
    this.apiStatusBox.style.color = isError ? 'var(--accent-rose)' : 'var(--accent-cyan)';
    this.apiStatusBox.style.borderColor = isError ? 'rgba(244, 63, 94, 0.4)' : 'rgba(6, 182, 212, 0.4)';
  }

  async handleFetchApiWords() {
    const topic = this.apiTopicSelect ? this.apiTopicSelect.value : 'technology';
    this.setApiStatus(`⏳ Đang gọi Datamuse & Dictionary API tải từ vựng chủ đề "${topic}"...`);
    
    try {
      const words = await APIService.fetchWordsByTopic(topic, 5);
      if (!words || words.length === 0) {
        this.setApiStatus('[-] Không thể lấy từ vựng từ API lúc này.', true);
        return;
      }

      const newItems = [];
      for (const w of words) {
        this.setApiStatus(`⏳ Đang dịch và lấy phiên âm IPA cho từ "${w}"...`);
        const item = await APIService.createItemFromAPI(w, this.currentLevel);
        newItems.push(item);
      }

      if (!this.datasets[this.currentLevel]) {
        this.datasets[this.currentLevel] = [];
      }
      this.datasets[this.currentLevel].unshift(...newItems);
      this.renderLevelPills();
      this.applyFilter();
      this.setApiStatus(`✅ Đã tải thành công ${newItems.length} từ vựng mới từ API!`);
      setTimeout(() => this.closeAllModals(), 1200);
    } catch (e) {
      this.setApiStatus('[-] Lỗi kết nối API: ' + e.message, true);
    }
  }

  async handleFetchApiSentences() {
    this.setApiStatus('⏳ Đang gọi Quotable & MyMemory API lấy câu ví dụ ngẫu nhiên...');
    try {
      const sentences = await APIService.fetchRandomSentences(3);
      const newItems = [];
      for (const s of sentences) {
        this.setApiStatus(`⏳ Đang dịch câu: "${s.slice(0, 30)}..."`);
        const item = await APIService.createItemFromAPI(s, this.currentLevel);
        newItems.push(item);
      }

      if (!this.datasets[this.currentLevel]) {
        this.datasets[this.currentLevel] = [];
      }
      this.datasets[this.currentLevel].unshift(...newItems);
      this.renderLevelPills();
      this.applyFilter();
      this.setApiStatus(`✅ Đã tải thành công ${newItems.length} câu ví dụ mới từ API!`);
      setTimeout(() => this.closeAllModals(), 1200);
    } catch (e) {
      this.setApiStatus('[-] Lỗi kết nối API: ' + e.message, true);
    }
  }

  async handleFetchCustomWord() {
    const input = this.customWordInput ? this.customWordInput.value.trim() : '';
    if (!input) {
      this.setApiStatus('[-] Vui lòng nhập một từ hoặc câu tiếng Anh.', true);
      return;
    }

    this.setApiStatus(`⏳ Đang truy vấn Dictionary API & dịch "${input}"...`);
    try {
      const item = await APIService.createItemFromAPI(input, this.currentLevel);
      if (!this.datasets[this.currentLevel]) {
        this.datasets[this.currentLevel] = [];
      }
      this.datasets[this.currentLevel].unshift(item);
      this.renderLevelPills();
      this.applyFilter();
      this.setApiStatus(`✅ Đã thêm bài tập mới: "${input}"!`);
      if (this.customWordInput) this.customWordInput.value = '';
      setTimeout(() => this.closeAllModals(), 1000);
    } catch (e) {
      this.setApiStatus('[-] Lỗi kết nối API: ' + e.message, true);
    }
  }

  updateUIModeViews() {
    const isSpeaking = this.currentTab === 'speaking';
    if (this.speakingPracticeBox) {
      this.speakingPracticeBox.style.display = isSpeaking ? 'block' : 'none';
    }
    if (this.permanentMeaningBar) {
      this.permanentMeaningBar.style.display = isSpeaking ? 'none' : 'block';
    }
    const typingElements = [
      this.wordSlotsBoard?.closest('.word-slots-board-container'),
      document.querySelector('.input-section'),
      this.audioVisualBox
    ];
    typingElements.forEach(el => {
      if (el) el.style.display = isSpeaking ? 'none' : '';
    });
  }

  setActiveTabPill(activeBtn) {
    [this.tabPracticeBtn, this.tabSpeakingBtn, this.tabReviewBtn, this.tabPlanBtn].forEach(b => b?.classList.remove('active'));
    activeBtn?.classList.add('active');
  }

  closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('active');
  }

  showToast(message) {
    let toast = document.getElementById('appToastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToastNotification';
      toast.className = 'app-toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  filterAndRenderActiveList() {
    this.applyFilter();
  }

  closeAllModals() {
    this.statsModal?.classList.remove('active');
    this.shortcutsModal?.classList.remove('active');
    this.apiModal?.classList.remove('active');
    this.studyPlanModal?.classList.remove('active');
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.log('[PWA] ServiceWorker registration skipped:', err);
        });
      });
    }
  }
}

// Bootstrap on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.dictaApp = new DictaLearnApp();
  window.app = window.dictaApp;
});
