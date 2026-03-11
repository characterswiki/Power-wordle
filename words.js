async function loadValidWords() {
  try {
    const res = await fetch("/data/words5.txt");
    if (!res.ok) throw new Error("Dictionary file not found");

    const text = await res.text();

    // keep only 5-letter words
    window.validWords = text
      .split("\n")
      .map(w => w.trim().toLowerCase())
      .filter(w => /^[a-z]{5}$/.test(w));

    console.log("Loaded valid words:", window.validWords.length);

  } catch (err) {
    console.error("Error loading valid words:", err);
  }
}
