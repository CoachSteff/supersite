/**
 * Language Detection Utilities
 * Detects language from text using character ranges and simple heuristics
 */

// Common words for language detection (top 5 most common words per language)
const LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
  en: [/\b(the|is|and|to|of|in|that|it|with|for|hello|good|morning)\b/gi],
  es: [/\b(el|la|de|que|y|en|un|los|se|del|está|estás|cómo|qué|hola|buenos|días)\b/gi],
  fr: [/\b(le|de|la|et|un|les|des|en|à|que|vous|comment|allez|bonjour|merci)\b/gi],
  de: [/\b(der|die|und|in|den|von|zu|das|mit|für|wie|geht|ihnen|guten|morgen|tag)\b/gi],
  pt: [/\b(o|a|de|que|e|do|da|em|um|para|você|está|como|bom|dia|olá)\b/gi],
  it: [/\b(il|di|e|la|che|per|in|un|è|del|come|stai|sul|sono|buongiorno|ciao)\b/gi],
  nl: [/\b(de|het|een|van|en|in|op|is|te|dat|goedemorgen|goedemiddag|goedenavond|hallo|dag|dank)\b/gi],
  pl: [/\b(w|i|na|z|się|do|to|że|jest|nie|dzień|dobry)\b/gi],
  tr: [/\b(bir|ve|bu|için|de|ile|da|ne|ben|o|günaydın|merhaba)\b/gi],
};

/**
 * Detect language from text using character ranges and patterns
 * Returns ISO 639-1 language code or null if uncertain
 */
export function detectLanguageFromText(text: string): string | null {
  if (!text || text.trim().length === 0) {
    return null;
  }

  const cleanText = text.trim().toLowerCase();
  const charCounts: Record<string, number> = {};

  // Count characters by script
  for (const char of text) {
    const code = char.charCodeAt(0);

    // CJK Unified Ideographs (Chinese)
    if (code >= 0x4e00 && code <= 0x9fff) {
      charCounts.cjk = (charCounts.cjk || 0) + 1;
    }
    // Hiragana (Japanese)
    else if (code >= 0x3040 && code <= 0x309f) {
      charCounts.hiragana = (charCounts.hiragana || 0) + 1;
    }
    // Katakana (Japanese)
    else if (code >= 0x30a0 && code <= 0x30ff) {
      charCounts.katakana = (charCounts.katakana || 0) + 1;
    }
    // Hangul (Korean)
    else if (code >= 0xac00 && code <= 0xd7af) {
      charCounts.hangul = (charCounts.hangul || 0) + 1;
    }
    // Cyrillic (Russian, etc.)
    else if (code >= 0x0400 && code <= 0x04ff) {
      charCounts.cyrillic = (charCounts.cyrillic || 0) + 1;
    }
    // Arabic
    else if (code >= 0x0600 && code <= 0x06ff) {
      charCounts.arabic = (charCounts.arabic || 0) + 1;
    }
    // Hebrew
    else if (code >= 0x0590 && code <= 0x05ff) {
      charCounts.hebrew = (charCounts.hebrew || 0) + 1;
    }
    // Thai
    else if (code >= 0x0e00 && code <= 0x0e7f) {
      charCounts.thai = (charCounts.thai || 0) + 1;
    }
    // Devanagari (Hindi, Sanskrit, etc.)
    else if (code >= 0x0900 && code <= 0x097f) {
      charCounts.devanagari = (charCounts.devanagari || 0) + 1;
    }
    // Latin (most European languages)
    else if (
      (code >= 0x0041 && code <= 0x005a) || // A-Z
      (code >= 0x0061 && code <= 0x007a) || // a-z
      (code >= 0x00c0 && code <= 0x00ff)    // Latin Extended-A
    ) {
      charCounts.latin = (charCounts.latin || 0) + 1;
    }
  }

  const totalChars = text.replace(/\s/g, '').length;
  if (totalChars === 0) return null;

  // Check for script-based languages (threshold: 30% of non-whitespace chars)
  const threshold = totalChars * 0.3;

  if ((charCounts.hiragana || 0) > threshold || (charCounts.katakana || 0) > threshold) {
    return 'ja'; // Japanese
  }
  if ((charCounts.hangul || 0) > threshold) {
    return 'ko'; // Korean
  }
  if ((charCounts.cjk || 0) > threshold) {
    return 'zh'; // Chinese (Simplified or Traditional)
  }
  if ((charCounts.cyrillic || 0) > threshold) {
    return 'ru'; // Russian (could also be Ukrainian, Bulgarian, etc.)
  }
  if ((charCounts.arabic || 0) > threshold) {
    return 'ar'; // Arabic
  }
  if ((charCounts.hebrew || 0) > threshold) {
    return 'he'; // Hebrew
  }
  if ((charCounts.thai || 0) > threshold) {
    return 'th'; // Thai
  }
  if ((charCounts.devanagari || 0) > threshold) {
    return 'hi'; // Hindi
  }

  // For Latin-based languages, check common word patterns
  if ((charCounts.latin || 0) > threshold) {
    const scores: Record<string, number> = {};

    for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
      scores[lang] = 0;
      for (const pattern of patterns) {
        const matches = cleanText.match(pattern);
        if (matches) {
          scores[lang] += matches.length;
        }
      }
    }

    // Find language with highest score
    let maxScore = 0;
    let detectedLang: string | null = null;

    for (const [lang, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedLang = lang;
      }
    }

    // Only return if we have confidence (at least 1 match and clearly dominant)
    if (maxScore >= 1 && detectedLang) {
      // Check if this language is clearly dominant (has more matches than any other)
      const sortedScores = Object.values(scores).sort((a, b) => b - a);
      const secondHighest = sortedScores[1] || 0;
      
      // If we have at least 2 matches, or we're clearly dominant, return the language
      if (maxScore >= 2 || maxScore > secondHighest) {
        return detectedLang;
      }
    }

    // Default to English for Latin script if no clear pattern
    return 'en';
  }

  // Unable to detect with confidence
  return null;
}

/**
 * Parse Accept-Language header and extract primary language code
 * Example: "en-US,en;q=0.9,es;q=0.8" -> "en"
 */
export function getBrowserLanguage(acceptLanguageHeader: string): string {
  if (!acceptLanguageHeader || acceptLanguageHeader.trim().length === 0) {
    return 'en';
  }

  // Parse Accept-Language header
  // Format: "en-US,en;q=0.9,es;q=0.8"
  const languages = acceptLanguageHeader
    .split(',')
    .map(lang => {
      const parts = lang.trim().split(';');
      const code = parts[0].split('-')[0]; // Extract primary language code
      const quality = parts[1] ? parseFloat(parts[1].replace('q=', '')) : 1.0;
      return { code, quality };
    })
    .sort((a, b) => b.quality - a.quality); // Sort by quality (highest first)

  return languages[0]?.code || 'en';
}

/**
 * Determine response language based on user message and browser preference
 * Priority: User message language > Browser language > Default (en)
 */
export function determineResponseLanguage(
  userMessage: string,
  browserLang: string
): string {
  // Try to detect from user message first
  const detectedLang = detectLanguageFromText(userMessage);
  
  if (detectedLang) {
    return detectedLang;
  }

  // Fall back to browser language
  if (browserLang && browserLang !== 'en') {
    return browserLang;
  }

  // Default to English
  return 'en';
}

/**
 * Get language name from ISO 639-1 code
 */
export function getLanguageName(code: string): string {
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    pt: 'Portuguese',
    it: 'Italian',
    nl: 'Dutch',
    pl: 'Polish',
    tr: 'Turkish',
    ru: 'Russian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ar: 'Arabic',
    he: 'Hebrew',
    th: 'Thai',
    hi: 'Hindi',
  };

  return languageNames[code] || code.toUpperCase();
}
