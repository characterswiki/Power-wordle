// wordlist-loader.js
// Fetches large word lists from a trusted CDN, stores them in localStorage for offline use.
// Falls back to a minimal embedded list if fetch fails.

(function() {
  // 1. Define global variables that script.js expects
  window.validWords = [];
  window.answersList = [];

  // 2. Minimal fallback lists (a few hundred words each) – ensures game works offline.
  const fallbackValid = ["about", "above", "abuse", "actor", "acute", "admit", "adopt", "adult", "after", "again",
    "agent", "agree", "ahead", "alarm", "album", "alert", "alike", "alive", "allow", "alone",
    "along", "alter", "among", "anger", "angle", "angry", "apart", "apple", "apply", "arena",
    "argue", "arise", "array", "aside", "asset", "avoid", "award", "aware", "badly", "baker",
    // ... (in production this would be much larger, but we keep it minimal for fallback)
  ];

  const fallbackAnswers = ["about", "above", "abuse", "actor", "acute", "admit", "adopt", "adult", "after", "again",
    "agent", "agree", "ahead", "alarm", "album", "alert", "alike", "alive", "allow", "alone",
    "along", "alter", "among", "anger", "angle", "angry", "apart", "apple", "apply", "arena",
    "argue", "arise", "array", "aside", "asset", "avoid", "award", "aware", "badly", "baker",
    // ... (truncated for example)
  ];

  // 3. Try to load from localStorage (if previously fetched)
  function loadFromCache() {
    try {
      const cachedValid = localStorage.getItem('fullValidWords');
      const cachedAnswers = localStorage.getItem('fullAnswersList');
      if (cachedValid && cachedAnswers) {
        window.validWords = JSON.parse(cachedValid);
        window.answersList = JSON.parse(cachedAnswers);
        console.log('Loaded word lists from cache');
        return true;
      }
    } catch (e) {}
    return false;
  }

  // 4. Save fetched lists to cache
  function cacheLists(valid, answers) {
    try {
      localStorage.setItem('fullValidWords', JSON.stringify(valid));
      localStorage.setItem('fullAnswersList', JSON.stringify(answers));
    } catch (e) {}
  }

  // 5. Fetch from CDN (using raw GitHub or similar)
  async function fetchLists() {
    try {
      // Example URLs – replace with actual hosted word lists
      const validRes = await fetch('https://raw.githubusercontent.com/tabatkins/wordle-list/main/words.txt');
      const answersRes = await fetch('https://raw.githubusercontent.com/tabatkins/wordle-list/main/answers.txt');
      if (!validRes.ok || !answersRes.ok) throw new Error('Fetch failed');

      const validText = await validRes.text();
      const answersText = await answersRes.text();

      // Assume each file contains one word per line
      const valid = validText.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length === 5);
      const answers = answersText.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length === 5);

      if (valid.length > 1000 && answers.length > 100) {
        window.validWords = valid;
        window.answersList = answers;
        cacheLists(valid, answers);
        console.log(`Fetched ${valid.length} valid words and ${answers.length} answers`);
        return true;
      } else {
        throw new Error('Insufficient words');
      }
    } catch (e) {
      console.warn('Using fallback word lists', e);
      return false;
    }
  }

  // 6. Initialize: try cache, then fetch, then fallback
  (async function init() {
    if (!loadFromCache()) {
      const fetched = await fetchLists();
      if (!fetched) {
        window.validWords = fallbackValid;
        window.answersList = fallbackAnswers;
      }
    }
    // Dispatch an event so script.js knows lists are ready
    window.dispatchEvent(new CustomEvent('wordlistsready'));
  })();
})();
