// answers.js – daily answer pool for 100k dictionary

function generateAnswerPool(size = 1800) {

  if (!window.validWords || window.validWords.length === 0) {
    console.error("words.js must load before answers.js");
    return [];
  }

  // keep only 5-letter alphabetic words
  const filtered = window.validWords.filter(
    w => typeof w === "string" && w.length === 5 && /^[a-z]+$/.test(w)
  );

  // shuffle words
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());

  // take subset
  return shuffled.slice(0, size);
}

window.answersList = generateAnswerPool(1800).map(w => w.toLowerCase());
