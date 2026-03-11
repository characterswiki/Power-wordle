// answers.js – generate answer pool from dictionary file
async function generateAnswers(size = 2000) {

  try {
    // fetch the dictionary file
    const res = await fetch("/data/words5.txt");
    if (!res.ok) throw new Error("Dictionary file not found");

    const text = await res.text();

    // split into 5-letter words only
    const allWords = text
      .split("\n")
      .map(w => w.trim().toLowerCase())
      .filter(w => /^[a-z]{5}$/.test(w));

    // remove duplicates
    const uniqueWords = [...new Set(allWords)];

    // shuffle
    const shuffled = uniqueWords.sort(() => 0.5 - Math.random());

    // pick top 'size' words
    window.answersList = shuffled.slice(0, size);

    console.log("Loaded answers:", window.answersList.length);

  } catch (err) {
    console.error("Error generating answers:", err);
  }
}

// call the function
generateAnswers(2000);
