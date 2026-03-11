// answers.js – daily answer pool for Wordle clone
// Uses subset of words from words.js

function generateAnswerPool(size = 700) {

  // ensure validWords exists
  if (!window.validWords || window.validWords.length === 0) {
    console.error("validWords must load before answers.js");
    return [];
  }

  const shuffled = [...window.validWords]
    .filter(w => w.length === 5)
    .sort(() => 0.5 - Math.random());

  return shuffled.slice(0, size);
}

window.answersList = generateAnswerPool(700).map(w => w.toLowerCase());
