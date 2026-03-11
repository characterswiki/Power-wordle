// script.js – full game logic, localStorage, share, UTC daily puzzle + help modal

// ---------- GLOBALS (populated from words.js & answers.js) ----------
const startDate = new Date(Date.UTC(2024, 0, 1)); // Jan 1, 2024 as day 0

let answer = '';
let boardState = [];        // 2D: [row][col] letter
let rowColors = [];         // parallel: 'correct','present','absent',''
let currentRow = 0;
let currentCol = 0;
let gameOver = false;
let keyboardState = {};     // letter -> status
let stats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastGameTimestamp: 0,     // UTC day index played
  lastWin: false
};

// DOM elements
const boardEl = document.getElementById('board');
const messageEl = document.getElementById('message');
const keys = document.querySelectorAll('.key');
const statsBtn = document.getElementById('stats-btn');
const shareBtn = document.getElementById('share-btn');
const helpBtn = document.getElementById('help-btn');
const statsModal = document.getElementById('stats-modal');
const helpModal = document.getElementById('help-modal');
const closeStats = document.getElementById('close-stats');
const closeHelp = document.getElementById('close-help');
const copyShareBtn = document.getElementById('copy-share');

// ---------- helpers ----------
function getUTCDayIndex() {
  const now = new Date();
  const utc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const diff = utc - startDate;
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

function getDailyAnswer() {
  const idx = getUTCDayIndex() % answersList.length;
  return answersList[idx].toUpperCase();
}

// initialize or load from localStorage
function loadStats() {
  try {
    const saved = localStorage.getItem('wordleStats');
    if (saved) {
      stats = JSON.parse(saved);
    }
  } catch (e) { console.warn('no stats'); }
}

function saveStats() {
  localStorage.setItem('wordleStats', JSON.stringify(stats));
}

function saveGameBoard() {
  const state = { boardState, rowColors, currentRow, currentCol, gameOver, answer };
  localStorage.setItem('wordleBoard', JSON.stringify(state));
}

function loadGameBoard() {
  const saved = localStorage.getItem('wordleBoard');
  if (saved) {
    try {
      const st = JSON.parse(saved);
      if (st.answer === answer) {
        boardState = st.boardState;
        rowColors = st.rowColors;
        currentRow = st.currentRow;
        currentCol = st.currentCol;
        gameOver = st.gameOver;
        renderBoard();
        rebuildKeyboardState();
        updateKeyboard();
        return;
      }
    } catch (e) { console.warn('failed to load board'); }
  }
  resetGame();
}

function rebuildKeyboardState() {
  keyboardState = {};
  for (let r = 0; r <= currentRow; r++) {
    if (!rowColors[r]) continue;
    for (let c = 0; c < 5; c++) {
      const letter = boardState[r][c];
      if (!letter) continue;
      const color = rowColors[r][c];
      const cur = keyboardState[letter];
      if (color === 'correct') keyboardState[letter] = 'correct';
      else if (color === 'present' && cur !== 'correct') keyboardState[letter] = 'present';
      else if (color === 'absent' && !cur) keyboardState[letter] = 'absent';
    }
  }
}

// update display of stats modal
function refreshStatsDisplay() {
  document.getElementById('games-played').innerText = stats.played;
  const winPct = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
  document.getElementById('win-rate').innerText = winPct;
  document.getElementById('current-streak').innerText = stats.currentStreak;
  document.getElementById('max-streak').innerText = stats.maxStreak;
}

// render board from boardState and rowColors
function renderBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < 6; r++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row';
    for (let c = 0; c < 5; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      if (boardState[r] && boardState[r][c]) {
        tile.innerText = boardState[r][c];
      }
      if (rowColors[r] && rowColors[r][c]) {
        tile.classList.add(rowColors[r][c]);
      }
      rowDiv.appendChild(tile);
    }
    boardEl.appendChild(rowDiv);
  }
}

// apply flip animation to a specific tile (row, col) and set its color
function animateTile(row, col, colorClass, letter) {
  const rowDivs = boardEl.children;
  if (!rowDivs[row]) return;
  const tile = rowDivs[row].children[col];
  tile.innerText = letter;
  tile.classList.add('flip', colorClass);
  setTimeout(() => tile.classList.remove('flip'), 400);
}

// update keyboard colors based on keyboardState
function updateKeyboard() {
  keys.forEach(key => {
    const letter = key.dataset.key;
    if (!letter || letter === 'ENTER' || letter === 'BACKSPACE') return;
    const status = keyboardState[letter];
    key.classList.remove('correct', 'present', 'absent');
    if (status) key.classList.add(status);
  });
}

// evaluate current guess against answer, update colors and keyboard
function submitGuess() {
  if (gameOver) return false;
  const guess = boardState[currentRow].join('').toUpperCase();
  if (guess.length < 5) {
    messageEl.innerText = 'Not enough letters';
    return false;
  }
  // validate against word list
  if (!validWords.includes(guess.toLowerCase())) {
    messageEl.innerText = 'Not in word list';
    return false;
  }

  // process guess
  const answerArr = answer.split('');
  const guessArr = guess.split('');
  const result = new Array(5).fill('absent');
  const used = new Array(5).fill(false);

  // first pass: correct positions
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === answerArr[i]) {
      result[i] = 'correct';
      used[i] = true;
    }
  }
  // second pass: present but wrong position
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'correct') continue;
    for (let j = 0; j < 5; j++) {
      if (!used[j] && guessArr[i] === answerArr[j]) {
        result[i] = 'present';
        used[j] = true;
        break;
      }
    }
  }

  // animate and set colors
  rowColors[currentRow] = result;
  for (let i = 0; i < 5; i++) {
    const color = result[i];
    animateTile(currentRow, i, color, guessArr[i]);
    const letter = guessArr[i];
    const curStatus = keyboardState[letter];
    if (color === 'correct') keyboardState[letter] = 'correct';
    else if (color === 'present' && curStatus !== 'correct') keyboardState[letter] = 'present';
    else if (color === 'absent' && !curStatus) keyboardState[letter] = 'absent';
  }

  updateKeyboard();

  // check win
  const win = guess === answer;
  if (win) {
    gameOver = true;
    messageEl.innerText = '🎉 Genius!';
    stats.wins++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
    stats.lastWin = true;
  } else if (currentRow === 5) {
    gameOver = true;
    messageEl.innerText = `😢 ${answer}`;
    stats.currentStreak = 0;
    stats.lastWin = false;
  } else {
    currentRow++;
    currentCol = 0;
  }

  if (gameOver) {
    stats.played++;
    stats.lastGameTimestamp = getUTCDayIndex();
    saveStats();
    refreshStatsDisplay();
  }
  saveGameBoard();
  return true;
}

// handle letter input
function addLetter(letter) {
  if (gameOver || currentCol >= 5) return;
  if (!boardState[currentRow]) boardState[currentRow] = [];
  boardState[currentRow][currentCol] = letter;
  currentCol++;
  renderBoard();
  saveGameBoard();
}

function deleteLetter() {
  if (gameOver || currentCol <= 0) return;
  currentCol--;
  boardState[currentRow][currentCol] = '';
  renderBoard();
  saveGameBoard();
}

// reset for new day if needed
function checkForNewDay() {
  const todayIdx = getUTCDayIndex();
  if (stats.lastGameTimestamp !== todayIdx) {
    resetGame();
  }
}

function resetGame() {
  answer = getDailyAnswer();
  boardState = Array(6).fill().map(() => Array(5).fill(''));
  rowColors = Array(6).fill().map(() => Array(5).fill(''));
  currentRow = 0;
  currentCol = 0;
  gameOver = false;
  keyboardState = {};
  renderBoard();
  updateKeyboard();
  messageEl.innerText = '';
  saveGameBoard();
}

// share result as emoji grid
function shareResult() {
  if (!gameOver || (!stats.lastWin && currentRow === 6 && !gameOver)) {
    messageEl.innerText = 'Finish the game first';
    return;
  }
  let shareText = `Power Wordle ${getUTCDayIndex()} ${stats.lastWin ? currentRow+1 : 'X'}/6\n\n`;
  for (let r = 0; r <= currentRow; r++) {
    let line = '';
    for (let c = 0; c < 5; c++) {
      const color = rowColors[r][c];
      if (color === 'correct') line += '🟩';
      else if (color === 'present') line += '🟨';
      else line += '⬛';
    }
    shareText += line + '\n';
  }
  navigator.clipboard.writeText(shareText).then(() => {
    messageEl.innerText = 'Result copied!';
    setTimeout(() => messageEl.innerText = '', 2000);
  }).catch(() => alert('Press CTRL+C to copy'));
}

// ---------- event listeners ----------
function handleKeyClick(e) {
  const key = e.currentTarget.dataset.key;
  if (!key) return;
  if (key === 'ENTER') {
    submitGuess();
  } else if (key === 'BACKSPACE') {
    deleteLetter();
  } else {
    addLetter(key);
  }
}

function handlePhysicalKey(e) {
  if (gameOver) return;
  const key = e.key.toUpperCase();
  if (key === 'ENTER') {
    e.preventDefault();
    submitGuess();
  } else if (key === 'BACKSPACE') {
    e.preventDefault();
    deleteLetter();
  } else if (/^[A-Z]$/.test(key) && key.length === 1) {
    addLetter(key);
  }
}

// stats modal
statsBtn.addEventListener('click', () => {
  refreshStatsDisplay();
  statsModal.classList.add('show');
});
closeStats.addEventListener('click', () => statsModal.classList.remove('show'));

// help modal
helpBtn.addEventListener('click', () => {
  helpModal.classList.add('show');
});
closeHelp.addEventListener('click', () => helpModal.classList.remove('show'));

// close modals on background click
window.addEventListener('click', (e) => {
  if (e.target === statsModal) statsModal.classList.remove('show');
  if (e.target === helpModal) helpModal.classList.remove('show');
});

shareBtn.addEventListener('click', shareResult);
copyShareBtn.addEventListener('click', () => {
  shareResult();
  statsModal.classList.remove('show');
});

// ---------- initialization ----------
window.addEventListener('load', () => {
  loadStats();
  if (typeof answersList === 'undefined' || !answersList.length) {
    alert('Error: answers list missing');
    return;
  }
  if (typeof validWords === 'undefined' || !validWords.length) {
    alert('Error: word list missing');
    return;
  }
  answer = getDailyAnswer();
  loadGameBoard();
  keys.forEach(k => k.addEventListener('click', handleKeyClick));
  window.addEventListener('keydown', handlePhysicalKey);
  setInterval(() => {
    const newToday = getUTCDayIndex();
    if (stats.lastGameTimestamp !== newToday) {
      resetGame();
    }
  }, 3600000);
});
