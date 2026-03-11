// words.js – loads valid words from /data/words5.txt
window.validWordsPromise = new Promise((resolve, reject) => {
  fetch('data/words5.txt')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load words');
      return response.text();
    })
    .then(text => {
      const words = text.split('\n')
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length === 5);
      if (words.length === 0) throw new Error('No valid words found');
      window.validWords = words;
      resolve(words);
    })
    .catch(err => {
      console.error(err);
      // Fallback minimal list
      window.validWords = ["about", "above", "abuse", "actor", "acute"];
      resolve(window.validWords);
    });
});
