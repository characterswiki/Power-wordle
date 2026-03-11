async function loadWords() {

  const res = await fetch("/data/words5.txt");
  const text = await res.text();

  window.validWords = text
    .split("\n")
    .map(w => w.trim().toLowerCase())
    .filter(w => /^[a-z]{5}$/.test(w));

  console.log("Loaded words:", window.validWords.length);
}

loadWords();
