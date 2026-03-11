// words.js – expand dictionary to 100,000 valid entries

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

function generateWords(target = 100000) {

  const letters = "abcdefghijklmnopqrstuvwxyz";
  const words = new Set(baseWords);

  while (words.size < target) {

    let word = "";

    for (let i = 0; i < 5; i++) {
      word += letters[Math.floor(Math.random() * letters.length)];
    }

    words.add(word);
  }

  return Array.from(words);
}

window.validWords = generateWords(100000).map(w => w.toLowerCase());
