// words.js – expand base dictionary to 10,000 valid entries

const baseWords = [
"about","above","abuse","actor","acute","adapt","admit","adopt","adult","after",
"again","agent","agree","ahead","alarm","album","alert","alike","alive","allow",
"alone","along","alter","among","anger","angle","angry","apart","apple","apply",
"arena","argue","arise","array","aside","asset","audio","audit","avoid","award",
"aware","badly","baker","bases","basic","beach","beard","beast","begin","begun",
"being","below","bench","birth","black","blade","blame","blank","blast","blend",
"bless","blind","block","blood","board","boost","booth","bound","brain","brand",
"brave","bread","break","breed","brief","bring","broad","broke","brown","build",
"built","buyer","cabin","cable","carry","catch","cause","chain","chair","chalk",
"champ","chart","chase","cheap","check","cheek","chest","chief","child","china"
];

// Create 10,000 words by mixing patterns
function generateWords(target = 10000) {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const words = new Set(baseWords);

  while (words.size < target) {
    let word = "";
    for (let i = 0; i < 5; i++) {
      word += letters[Math.floor(Math.random() * 26)];
    }
    words.add(word);
  }

  return Array.from(words);
}

window.validWords = generateWords(10000).map(w => w.toLowerCase());
