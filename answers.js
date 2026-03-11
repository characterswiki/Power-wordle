// answers.js – loads daily answers from /data/answers.txt
window.answersPromise = new Promise((resolve, reject) => {
  fetch('data/answers.txt')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load answers');
      return response.text();
    })
    .then(text => {
      const answers = text.split('\n')
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length === 5);
      if (answers.length === 0) throw new Error('No answers found');
      window.answersList = answers;
      resolve(answers);
    })
    .catch(err => {
      console.warn('Using fallback answers (first 1000 from valid words)');
      // If answers.txt missing, use first 1000 words from validWords (once loaded)
      window.answersList = [];
      // We'll resolve later in script.js after validWords is ready
      window.answersPromise = Promise.resolve([]); // temporary
    });
});
