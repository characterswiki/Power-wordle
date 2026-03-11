async function loadAnswers(size = 2000) {
  try {
    // ensure validWords is loaded first
    if (!window.validWords || window.validWords.length === 0) {
      await loadValidWords();
    }

    // remove duplicates and shuffle
    const uniqueWords = [...new Set(window.validWords)];
    const shuffled = uniqueWords.sort(() => 0.5 - Math.random());

    // pick top 'size' words
    window.answersList = shuffled.slice(0, size);

    console.log("Loaded answers:", window.answersList.length);

    // call game start
    if (typeof window.onGameReady === "function") {
      window.onGameReady();
    }

  } catch (err) {
    console.error("Error loading answers:", err);
  }
}
