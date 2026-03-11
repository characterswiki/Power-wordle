function generateAnswers(size = 2000) {

  const shuffled = [...window.validWords]
    .sort(() => 0.5 - Math.random());

  window.answersList = shuffled.slice(0, size);
}

generateAnswers();
