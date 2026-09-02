/**
 * DictaLearn - Spaced Repetition System (SRS) & LocalStorage Manager
 * Implements SuperMemo SM-2 algorithm, daily streak calculation,
 * review queue priority management, and learning analytics.
 */

class SRSManager {
  constructor(storageKey = 'dictalearn_srs_data') {
    this.storageKey = storageKey;
    this.data = this.loadData();
  }

  /**
   * Default initial storage structure
   */
  getDefaultData() {
    return {
      version: '1.2.0',
      items: {}, // Map itemId -> SRS Item State
      meaningOverrides: {}, // Map itemId -> user-provided Vietnamese meaning
      stats: {
        totalPracticed: 0,
        totalCorrect: 0,
        currentStreak: 0,
        lastActiveDate: null,
        history: [] // { date: 'YYYY-MM-DD', count: number, accuracy: number }
      },
      reviewQueue: [] // Array of itemIds needing review
    };
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const normalized = this.normalizeImportedData(parsed);
        if (normalized) return normalized;
      }
    } catch (e) {
      console.error('[SRSManager] Error reading LocalStorage:', e);
    }
    return this.getDefaultData();
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.error('[SRSManager] Error saving to LocalStorage:', e);
    }
  }

  /**
   * Get or initialize item SRS record
   */
  getItemRecord(itemId) {
    if (!this.data.items[itemId]) {
      this.data.items[itemId] = {
        id: itemId,
        repetitions: 0,
        interval: 1, // in days
        easeFactor: 2.5, // Standard SM-2 starting EF
        lastReviewed: null,
        nextReviewDate: null,
        mistakeCount: 0,
        totalAttempts: 0,
        mastered: false
      };
    }
    return this.data.items[itemId];
  }

  /**
   * Process practice attempt with SuperMemo SM-2 algorithm
   * @param {string} itemId
   * @param {number} accuracy (0 - 100)
   * @param {number} userRating 1: Again, 3: Hard, 4: Good, 5: Easy (Optional rating)
   */
  recordAttempt(itemId, accuracy, userRating = null) {
    const item = this.getItemRecord(itemId);
    const now = new Date();
    const todayStr = this.getLocalDateString(now);

    // Determine quality grade q (0 - 5) based on accuracy or explicit rating
    let q;
    if (userRating !== null) {
      q = userRating;
    } else {
      if (accuracy === 100) q = 5;
      else if (accuracy >= 85) q = 4;
      else if (accuracy >= 65) q = 3;
      else if (accuracy >= 40) q = 2;
      else q = 1;
    }

    item.totalAttempts++;
    item.lastReviewed = now.toISOString();

    // SM-2 Algorithm Updates
    if (q >= 3) {
      // Correct response
      if (item.repetitions === 0) {
        item.interval = 1;
      } else if (item.repetitions === 1) {
        item.interval = 6;
      } else {
        item.interval = Math.round(item.interval * item.easeFactor);
      }
      item.repetitions++;
      
      // Calculate new Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
      item.easeFactor = Math.max(1.3, item.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

      if (item.repetitions >= 4 && item.mistakeCount <= 1) {
        item.mastered = true;
      }

      // Keep non-mastered material scheduled; mastered material leaves the queue.
      if (item.mastered) this.removeFromReviewQueue(itemId);
      else this.addToReviewQueue(itemId);
    } else {
      // Incorrect response -> Reset repetition cycle
      item.repetitions = 0;
      item.interval = 1;
      item.mistakeCount++;
      item.mastered = false;

      // Add to Review Queue
      this.addToReviewQueue(itemId);
    }

    // Set next review timestamp
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + item.interval);
    item.nextReviewDate = nextDate.toISOString();

    // Update Global Analytics & Streak
    this.updateGlobalStats(todayStr, accuracy >= 80);
    this.saveData();

    return item;
  }

  /** Apply a subjective rating to the attempt already recorded by the app. */
  rateLastAttempt(itemId, rating) {
    const item = this.getItemRecord(itemId);
    const q = Math.max(1, Math.min(5, Number(rating) || 1));
    item.lastRating = q;
    item.easeFactor = Math.max(1.3, item.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    if (q < 3) {
      item.repetitions = 0;
      item.interval = 1;
      item.mastered = false;
      this.addToReviewQueue(itemId);
    }
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + item.interval);
    item.nextReviewDate = nextDate.toISOString();
    this.saveData();
    return item;
  }

  getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getDueReviewIds(now = new Date()) {
    return this.data.reviewQueue.filter(id => {
      const item = this.data.items[id];
      return item && (!item.nextReviewDate || new Date(item.nextReviewDate) <= now);
    });
  }

  setMeaningOverride(itemId, meaning) {
    const clean = String(meaning || '').trim();
    if (!itemId || !clean) return false;
    if (!this.data.meaningOverrides || typeof this.data.meaningOverrides !== 'object') {
      this.data.meaningOverrides = {};
    }
    this.data.meaningOverrides[itemId] = clean;
    this.saveData();
    return true;
  }

  getMeaningOverride(itemId) {
    return this.data.meaningOverrides?.[itemId] || '';
  }

  addToReviewQueue(itemId) {
    if (!this.data.reviewQueue.includes(itemId)) {
      this.data.reviewQueue.push(itemId);
    }
  }

  removeFromReviewQueue(itemId) {
    this.data.reviewQueue = this.data.reviewQueue.filter(id => id !== itemId);
  }

  /**
   * Update streak and daily practice counters
   */
  updateGlobalStats(todayStr, isSuccess) {
    const stats = this.data.stats;
    stats.totalPracticed++;
    if (isSuccess) stats.totalCorrect++;

    let today = stats.history.find(entry => entry.date === todayStr);
    if (!today) {
      today = { date: todayStr, count: 0, correct: 0, accuracy: 0 };
      stats.history.push(today);
    }
    today.count++;
    if (isSuccess) today.correct++;
    today.accuracy = Math.round((today.correct / today.count) * 100);
    stats.history = stats.history.slice(-366);

    if (!stats.lastActiveDate) {
      stats.currentStreak = 1;
      stats.lastActiveDate = todayStr;
    } else if (stats.lastActiveDate !== todayStr) {
      const lastDate = new Date(stats.lastActiveDate);
      const currentDate = new Date(todayStr);
      const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        stats.currentStreak++;
      } else if (diffDays > 1) {
        // Streak broken
        stats.currentStreak = 1;
      }
      stats.lastActiveDate = todayStr;
    }
  }

  /**
   * Get learning overview for UI dashboards
   */
  getAnalyticsOverview() {
    const totalItems = Object.keys(this.data.items).length;
    let masteredCount = 0;
    let mistakeCount = 0;

    Object.values(this.data.items).forEach(it => {
      if (it.mastered) masteredCount++;
      mistakeCount += (it.mistakeCount || 0);
    });

    const accuracyRate = this.data.stats.totalPracticed > 0
      ? Math.round((this.data.stats.totalCorrect / this.data.stats.totalPracticed) * 100)
      : 100;

    return {
      totalPracticed: this.data.stats.totalPracticed,
      totalCorrect: this.data.stats.totalCorrect,
      accuracyRate,
      currentStreak: this.data.stats.currentStreak || 0,
      masteredCount,
      reviewQueueCount: this.getDueReviewIds().length,
      totalMistakes: mistakeCount
    };
  }

  /**
   * Export progress as downloadable JSON
   */
  exportProgressJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Import progress from JSON string
   */
  importProgressJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const normalized = this.normalizeImportedData(parsed);
      if (normalized) {
        this.data = normalized;
        this.saveData();
        return true;
      }
    } catch (e) {
      console.error('[SRSManager] Failed to parse imported JSON:', e);
    }
    return false;
  }

  normalizeImportedData(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    if (!parsed.items || typeof parsed.items !== 'object' || Array.isArray(parsed.items)) return null;
    if (!parsed.stats || typeof parsed.stats !== 'object' || Array.isArray(parsed.stats)) return null;

    const defaults = this.getDefaultData();
    const stats = { ...defaults.stats, ...parsed.stats };
    stats.history = Array.isArray(parsed.stats.history) ? parsed.stats.history.slice(-366) : [];
    for (const key of ['totalPracticed', 'totalCorrect', 'currentStreak']) {
      if (!Number.isFinite(stats[key]) || stats[key] < 0) return null;
    }
    const items = {};
    for (const [id, raw] of Object.entries(parsed.items)) {
      if (!id || !raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
      items[id] = { ...this.getItemRecordDefaults(id), ...raw, id };
      for (const key of ['repetitions', 'interval', 'easeFactor', 'mistakeCount', 'totalAttempts']) {
        if (!Number.isFinite(items[id][key]) || items[id][key] < 0) return null;
      }
    }
    const reviewQueue = Array.isArray(parsed.reviewQueue)
      ? [...new Set(parsed.reviewQueue.filter(id => typeof id === 'string' && items[id]))]
      : [];
    const meaningOverrides = {};
    if (parsed.meaningOverrides && typeof parsed.meaningOverrides === 'object' && !Array.isArray(parsed.meaningOverrides)) {
      for (const [id, meaning] of Object.entries(parsed.meaningOverrides)) {
        const clean = typeof meaning === 'string' ? meaning.trim() : '';
        if (id && clean && clean.length <= 1000) meaningOverrides[id] = clean;
      }
    }
    return { version: '1.2.0', items, stats, reviewQueue, meaningOverrides };
  }

  getItemRecordDefaults(itemId) {
    return {
      id: itemId, repetitions: 0, interval: 1, easeFactor: 2.5,
      lastReviewed: null, nextReviewDate: null, mistakeCount: 0,
      totalAttempts: 0, mastered: false
    };
  }

  /**
   * Reset all progress data
   */
  resetAllData() {
    this.data = this.getDefaultData();
    this.saveData();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SRSManager;
} else {
  window.SRSManager = SRSManager;
}
