/**
 * DictaLearn - Diff Engine & Text Comparison Module
 * Handles punctuation stripping, tokenization, Levenshtein distance,
 * token-level alignment (correct/wrong/missing/extra), and accuracy scoring.
 */

class DiffEngine {
  /**
   * Normalize string by converting to lowercase, removing punctuation, 
   * collapsing whitespace, and normalizing unicode/quotes.
   * @param {string} str
   * @returns {string}
   */
  static normalizeText(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'") // Normalize curly single quotes
      .replace(/[\u201C\u201D]/g, '"') // Normalize curly double quotes
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'–—]/g, ' ') // Strip punctuation
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Tokenize normalized text into an array of words
   * @param {string} text
   * @returns {string[]}
   */
  static tokenize(text) {
    const normalized = this.normalizeText(text);
    return normalized ? normalized.split(' ') : [];
  }

  /**
   * Compute token-level diff using Longest Common Subsequence (LCS)
   * @param {string} userInput
   * @param {string} expectedText
   * @returns {Object} { tokens: Array, accuracy: number, isPerfect: boolean, rawUser: string, rawExpected: string }
   */
  static computeDiff(userInput, expectedText) {
    const userTokens = this.tokenize(userInput);
    const expectedTokens = this.tokenize(expectedText);

    if (expectedTokens.length === 0) {
      return { tokens: [], accuracy: 100, isPerfect: true };
    }

    const n = userTokens.length;
    const m = expectedTokens.length;

    // LCS dynamic programming table
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (userTokens[i - 1] === expectedTokens[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to construct aligned tokens
    let i = n;
    let j = m;
    const diffResult = [];
    let matchCount = 0;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && userTokens[i - 1] === expectedTokens[j - 1]) {
        diffResult.unshift({
          type: 'correct',
          userWord: userTokens[i - 1],
          expectedWord: expectedTokens[j - 1]
        });
        matchCount++;
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        // Missing token
        diffResult.unshift({
          type: 'missing',
          expectedWord: expectedTokens[j - 1]
        });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        // Extra token
        diffResult.unshift({
          type: 'extra',
          userWord: userTokens[i - 1]
        });
        i--;
      }
    }

    // Post-process to group adjacent missing + extra tokens into 'wrong' (mismatch)
    const consolidated = [];
    for (let k = 0; k < diffResult.length; k++) {
      const current = diffResult[k];
      const next = diffResult[k + 1];

      if (current.type === 'extra' && next && next.type === 'missing') {
        consolidated.push({
          type: 'wrong',
          userWord: current.userWord,
          expectedWord: next.expectedWord
        });
        k++; // Skip next
      } else if (current.type === 'missing' && next && next.type === 'extra') {
        consolidated.push({
          type: 'wrong',
          userWord: next.userWord,
          expectedWord: current.expectedWord
        });
        k++; // Skip next
      } else {
        consolidated.push(current);
      }
    }

    // Calculate accuracy percentage
    const maxTokens = Math.max(n, m);
    const accuracy = maxTokens > 0 ? Math.round((matchCount / maxTokens) * 100) : 0;
    const isPerfect = accuracy === 100 && n === m;

    return {
      tokens: consolidated,
      accuracy,
      isPerfect,
      matchCount,
      totalExpected: m,
      userTokensCount: n
    };
  }

  /**
   * Character-level comparison for single words
   * @param {string} userInput
   * @param {string} expectedText
   * @returns {Array} Array of { char, status: 'char-correct'|'char-wrong'|'char-missing' }
   */
  static computeCharDiff(userInput, expectedText) {
    const userChars = this.normalizeText(userInput).split('');
    const expChars = this.normalizeText(expectedText).split('');
    const result = [];

    const maxLen = Math.max(userChars.length, expChars.length);
    for (let i = 0; i < maxLen; i++) {
      const u = userChars[i];
      const e = expChars[i];

      if (u && e && u === e) {
        result.push({ char: e, status: 'char-correct' });
      } else if (u && e && u !== e) {
        result.push({ char: u, expected: e, status: 'char-wrong' });
      } else if (!u && e) {
        result.push({ char: e, status: 'char-missing' });
      } else if (u && !e) {
        result.push({ char: u, status: 'char-wrong' });
      }
    }
    return result;
  }

  /**
   * Parse target text into detailed word groups and letter tiles
   * @param {string} targetText
   * @returns {Array} Detailed structure for letter-by-letter dictation
   */
  static parseLetterStructure(targetText) {
    if (!targetText) return [];
    const rawTokens = targetText.trim().split(/\s+/);
    
    return rawTokens.map((rawWord, wIdx) => {
      // Extract prefix punctuation (e.g. quotes), letters/numbers, and suffix punctuation
      const match = rawWord.match(/^([^a-zA-Z0-9']*)([a-zA-Z0-9']+)([^a-zA-Z0-9']*)$/);
      let prefix = '';
      let cleanPart = rawWord;
      let suffix = '';

      if (match) {
        prefix = match[1] || '';
        cleanPart = match[2] || '';
        suffix = match[3] || '';
      } else {
        cleanPart = rawWord.replace(/[^a-zA-Z0-9']/g, '');
        suffix = rawWord.replace(/[a-zA-Z0-9']/g, '');
      }

      const letters = cleanPart.split('');
      const cleanLetters = letters.map(c => c.toLowerCase());

      return {
        wordIndex: wIdx,
        rawWord,
        cleanWord: cleanPart.toLowerCase(),
        prefixPunct: prefix,
        suffixPunct: suffix,
        letterCount: letters.length,
        letters,
        cleanLetters
      };
    });
  }

  /**
   * Evaluate user typed text against word slots in real-time
   * @param {string} userInput 
   * @param {string} targetText 
   * @param {boolean} isFinalCheck True when clicking 'Kiểm tra' or pressing Enter
   * @returns {Object} { slots: Array, totalCorrect: number, totalSlots: number, isAllCorrect: boolean }
   */
  static matchLiveSlots(userInput, targetText, isFinalCheck = false) {
    const slots = this.getWordSlots(targetText);
    if (slots.length === 0) return { slots: [], totalCorrect: 0, totalSlots: 0, isAllCorrect: true };

    const rawInput = userInput || '';
    const hasTrailingSpace = rawInput.endsWith(' ');
    // Split input into words, keeping empty trailing word if space is pressed
    const userWords = rawInput.trim().length > 0 
      ? rawInput.trim().split(/\s+/) 
      : [];

    let correctCount = 0;

    const evaluatedSlots = slots.map((slot, i) => {
      const userWord = userWords[i];
      const isCurrentlyTyping = !isFinalCheck && (i === userWords.length - 1) && !hasTrailingSpace && userWord !== undefined;

      if (userWord === undefined) {
        // User hasn't reached this word yet
        return {
          ...slot,
          status: 'pending', // 'pending' | 'typing' | 'correct' | 'wrong'
          displayText: slot.placeholder,
          userText: ''
        };
      }

      const cleanUser = userWord.toLowerCase().replace(/[^a-z0-9']/g, '');
      const isMatch = cleanUser === slot.cleanWord;

      if (isCurrentlyTyping) {
        // Active word being typed
        if (isMatch) {
          correctCount++;
          return {
            ...slot,
            status: 'correct',
            displayText: slot.rawWord,
            userText: userWord
          };
        } else {
          // In-progress typing
          const typedLen = cleanUser.length;
          const remainingStars = '*'.repeat(Math.max(0, slot.letterCount - typedLen));
          return {
            ...slot,
            status: 'typing',
            displayText: `${slot.prefix}${cleanUser}${remainingStars}${slot.suffix}`,
            userText: userWord
          };
        }
      } else {
        // Word is submitted / space pressed / final check
        if (isMatch) {
          correctCount++;
          return {
            ...slot,
            status: 'correct',
            displayText: slot.rawWord,
            userText: userWord
          };
        } else {
          return {
            ...slot,
            status: 'wrong',
            displayText: userWord || '___',
            expectedWord: slot.rawWord,
            userText: userWord
          };
        }
      }
    });

    const isAllCorrect = correctCount === slots.length && userWords.length >= slots.length;

    return {
      slots: evaluatedSlots,
      totalCorrect: correctCount,
      totalSlots: slots.length,
      isAllCorrect,
      accuracy: Math.round((correctCount / slots.length) * 100)
    };
  }

  /**
   * Generate next hint character/token
   * @param {string} currentInput
   * @param {string} fullText
   * @returns {string} Suggested addition
   */
  static getNextHint(currentInput, fullText) {
    const normFull = this.normalizeText(fullText);
    const normInput = this.normalizeText(currentInput);

    if (normFull.startsWith(normInput)) {
      const nextChar = fullText.slice(normInput.length, normInput.length + 1);
      return nextChar;
    }

    // If input is divergent, return the next word of target
    const fullTokens = fullText.split(' ');
    const inputTokens = currentInput.split(' ').filter(Boolean);
    const idx = Math.min(inputTokens.length, fullTokens.length - 1);
    return fullTokens[idx] || '';
  }
}

// Export for ES Module or browser global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiffEngine;
} else {
  window.DiffEngine = DiffEngine;
}
