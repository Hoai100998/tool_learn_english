/**
 * DictaLearn - Online API Service
 * Fetches real-time English vocabulary, definitions, authentic IPA, MP3 audio,
 * and automatic Vietnamese translation from free public APIs.
 * 
 * APIs used (No API Key Required):
 * 1. Free Dictionary API (https://api.dictionaryapi.dev)
 * 2. Datamuse Vocabulary API (https://api.datamuse.com)
 * 3. Quotable / Sentence API (https://api.quotable.io)
 * 4. MyMemory Translation API (https://api.mymemory.translated.net)
 */

class APIService {
  /**
   * Fetch word details from Free Dictionary API
   * @param {string} word 
   * @returns {Promise<Object|null>}
   */
  static async fetchWordDetails(word) {
    try {
      const cleanWord = encodeURIComponent(word.trim().toLowerCase());
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
      if (!res.ok) return null;
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const entry = data[0];
        const phonetics = entry.phonetics || [];
        const phoneticWithAudio = phonetics.find(p => p.audio && p.audio.length > 0);
        const phoneticText = entry.phonetic || (phonetics[0] ? phonetics[0].text : '');
        
        let example = '';
        let partOfSpeech = 'word';
        let definition = '';

        if (entry.meanings && entry.meanings.length > 0) {
          const firstMeaning = entry.meanings[0];
          partOfSpeech = firstMeaning.partOfSpeech || 'word';
          if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
            definition = firstMeaning.definitions[0].definition || '';
            example = firstMeaning.definitions[0].example || '';
          }
        }

        return {
          word: entry.word,
          ipa: phoneticText,
          audioUrl: phoneticWithAudio ? phoneticWithAudio.audio : null,
          partOfSpeech,
          definition,
          example: example || `The word "${entry.word}" is commonly used in English.`
        };
      }
    } catch (e) {
      console.warn('[APIService] fetchWordDetails error:', e);
    }
    return null;
  }

  /**
   * Translate English text to Vietnamese using Google Translate API (with MyMemory fallback)
   * @param {string} text 
   * @returns {Promise<string>}
   */
  static async translateToVietnamese(text) {
    if (!text || text.trim().length === 0) return '';
    try {
      const q = encodeURIComponent(text.trim());
      // 1. Primary: Google Translate (Instant, natural, authentic Vietnamese)
      const gRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${q}`);
      if (gRes.ok) {
        const gData = await gRes.json();
        if (Array.isArray(gData) && Array.isArray(gData[0])) {
          const trans = gData[0].map(item => item[0]).join('').trim();
          if (trans) return trans;
        }
      }
    } catch (e) {
      // Continue to fallback
    }

    // 2. Secondary Fallback: MyMemory Translation API
    try {
      const q = encodeURIComponent(text.trim());
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${q}&langpair=en|vi`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.responseData && data.responseData.translatedText) {
          return data.responseData.translatedText.trim();
        }
      }
    } catch (e) {
      console.warn('[APIService] translateToVietnamese error:', e);
    }
    return '';
  }

  /**
   * Fetch a list of related words by topic or CEFR seed from Datamuse API
   * @param {string} topic (e.g., 'travel', 'technology', 'business', 'education')
   * @param {number} limit 
   * @returns {Promise<string[]>}
   */
  static async fetchWordsByTopic(topic = 'communication', limit = 10) {
    try {
      const res = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(topic)}&max=${limit}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.map(item => item.word).filter(w => !w.includes(' ') && w.length > 2);
    } catch (e) {
      console.warn('[APIService] fetchWordsByTopic error:', e);
    }
    return [];
  }

  /**
   * Fetch authentic quotes/sentences from public API
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  static async fetchRandomSentences(limit = 5) {
    try {
      const res = await fetch(`https://api.quotable.io/quotes/random?limit=${limit}&maxLength=80`);
      if (!res.ok) return [];
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map(q => q.content);
      }
    } catch (e) {
      console.warn('[APIService] fetchRandomSentences error:', e);
    }
    // Fallback authentic sentences if quotable is rate-limited
    return [
      "Success usually comes to those who are too busy to be looking for it.",
      "The beautiful thing about learning is that no one can take it away from you.",
      "Language is the road map of a culture it tells you where its people come from.",
      "Continuous improvement is better than delayed perfection.",
      "Knowledge of languages is the doorway to wisdom."
    ];
  }

  /**
   * Auto-generate a complete DictaLearn practice item from any English word or sentence
   * @param {string} input (Word or Sentence)
   * @param {string} level ('A1'|'A2'|'B1'|'B2'|'C1')
   * @returns {Promise<Object>}
   */
  static async createItemFromAPI(input, level = 'B1') {
    const isSentence = input.includes(' ') || input.length > 20;
    const type = isSentence ? 'sentence' : 'word';
    
    let ipa = '';
    let vietnamese = '';
    let example = input;
    let example_vi = '';
    let audioUrl = null;
    let part_of_speech = type === 'sentence' ? 'sentence' : 'word';

    if (!isSentence) {
      const details = await this.fetchWordDetails(input);
      if (details) {
        ipa = details.ipa || '';
        audioUrl = details.audioUrl || null;
        part_of_speech = details.partOfSpeech || 'word';
        example = details.example || `I often use "${input}" in conversation.`;
      }
      vietnamese = await this.translateToVietnamese(input);
      if (example && example !== input) {
        example_vi = await this.translateToVietnamese(example);
      }
    } else {
      vietnamese = await this.translateToVietnamese(input);
    }

    return {
      id: `API_${level}_${Date.now().toString().slice(-4)}`,
      level: level,
      type: type,
      english: input,
      ipa: ipa || '',
      vietnamese: vietnamese || 'Bản dịch tự động từ API',
      part_of_speech: part_of_speech,
      hint: isSentence ? 'Nghe kỹ câu từ API và chép lại' : `Từ loại: ${type}`,
      example: example,
      example_vi: example_vi,
      audioUrl: audioUrl,
      source: 'Online Public API'
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIService;
} else {
  window.APIService = APIService;
}
