// script.js – waits for word lists, then runs the game
(async function() {
  // Wait for both word lists
  await Promise.all([window.validWordsPromise, window.answersPromise]);
  
  // If answers still empty, generate from validWords
  if (!window.answersList || window.answersList.length === 0) {
    window.answersList = window.validWords.slice(0, 1000);
  }

  // ---------- GAME STATE ----------
  let answer = '';
  let boardState = Array(6).fill().map(() => Array(5).fill(''));
  let rowColors = Array(6).fill().map(() => Array(5).fill(''));
  let currentRow = 0;
  let currentCol = 0;
  let gameOver = false;
  let keyboardState = {};
  
  let stats = {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastGameTimestamp: 0,
    lastWin: false
  };

  // DOM elements
  const boardEl = document.getElementById('board');
  const messageEl = document.getElementById('message');
  const keys = document.querySelectorAll('.key');

  // ---------- UTILITIES ----------
  function getUTCDayIndex() {
    const now = new Date();
    const utc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startDate = new Date(Date.UTC(2024, 0, 1));
    return Math.floor((utc - startDate) / (24 * 60 * 60 * 1000));
  }

  function getDailyAnswer() {
    const idx = getUTCDayIndex() % window.answersList.length;
    return window.answersList[idx].toUpperCase();
  }

  // ---------- STATS ----------
  function loadStats() {
    try {
      const saved = localStorage.getItem('wordleStats');
      if (saved) stats = JSON.parse(saved);
    } catch (e) {}
  }

  function saveStats() {
    localStorage.setItem('wordleStats', JSON.stringify(stats));
  }

  function refreshStatsDisplay() {
    document.getElementById('games-played').innerText = stats.played;
    const winPct = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
    document.getElementById('win-rate').innerText = winPct;
    document.getElementById('current-streak').innerText = stats.currentStreak;
    document.getElementById('max-streak').innerText = stats.maxStreak;
  }

  // ---------- BOARD RENDERING ----------
  function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < 6; r++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'row';
      for (let c = 0; c < 5; c++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        if (boardState[r][c]) tile.innerText = boardState[r][c];
        if (rowColors[r][c]) tile.classList.add(rowColors[r][c]);
        rowDiv.appendChild(tile);
      }
      boardEl.appendChild(rowDiv);
    }
  }

  function animateTile(row, col, colorClass, letter) {
    const rowDivs = boardEl.children;
    if (!rowDivs[row]) return;
    const tile = rowDivs[row].children[col];
    tile.innerText = letter;
    tile.classList.add('flip', colorClass);
    setTimeout(() => tile.classList.remove('flip'), 400);
  }

  // ---------- KEYBOARD ----------
  function updateKeyboard() {
    keys.forEach(key => {
      const letter = key.dataset.key;
      if (!letter || letter === 'ENTER' || letter === 'BACKSPACE') return;
      const status = keyboardState[letter];
      key.classList.remove('correct', 'present', 'absent');
      if (status) key.classList.add(status);
    });
  }

  // ---------- GAME ACTIONS ----------
  function submitGuess() {
    if (gameOver) return false;
    
    const guess = boardState[currentRow].join('').toUpperCase();
    if (guess.length < 5) {
      messageEl.innerText = 'Not enough letters';
      return false;
    }
    
    if (!window.validWords.includes(guess.toLowerCase())) {
      messageEl.innerText = 'Not in word list';
      return false;
    }

    const answerArr = answer.split('');
    const guessArr = guess.split('');
    const result = new Array(5).fill('absent');
    const used = new Array(5).fill(false);

    // correct positions
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] === answerArr[i]) {
        result[i] = 'correct';
        used[i] = true;
      }
    }
    // present but wrong spot
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

    // update board and keyboard
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

    // check win/loss
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
    
    // auto-save board after each move
    saveGameBoard();
    return true;
  }

  function addLetter(letter) {
    if (gameOver || currentCol >= 5) return;
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
          // rebuild keyboardState from rowColors
          keyboardState = {};
          for (let r = 0; r <= currentRow; r++) {
            for (let c = 0; c < 5; c++) {
              const letter = boardState[r][c];
              if (!letter) continue;
              const color = rowColors[r][c];
              if (color === 'correct') keyboardState[letter] = 'correct';
              else if (color === 'present' && keyboardState[letter] !== 'correct') {
                keyboardState[letter] = 'present';
              } else if (color === 'absent' && !keyboardState[letter]) {
                keyboardState[letter] = 'absent';
              }
            }
          }
          renderBoard();
          updateKeyboard();
          return;
        }
      } catch (e) {}
    }
    resetGame();
  }

  // ---------- SHARE ----------
  function shareResult() {
    if (!gameOver) {
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
    }).catch(() => alert('Press Ctrl+C to copy'));
  }

  // ---------- EVENT LISTENERS ----------
  keys.forEach(key => {
    key.addEventListener('click', (e) => {
      const keyVal = e.currentTarget.dataset.key;
      if (keyVal === 'ENTER') submitGuess();
      else if (keyVal === 'BACKSPACE') deleteLetter();
      else addLetter(keyVal);
    });
  });

  window.addEventListener('keydown', (e) => {
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
  });

  // Modal controls
  document.getElementById('help-btn').addEventListener('click', () => {
    document.getElementById('help-modal').classList.add('show');
  });
  document.getElementById('close-help').addEventListener('click', () => {
    document.getElementById('help-modal').classList.remove('show');
  });

  document.getElementById('stats-btn').addEventListener('click', () => {
    refreshStatsDisplay();
    document.getElementById('stats-modal').classList.add('show');
  });
  document.getElementById('close-stats').addEventListener('click', () => {
    document.getElementById('stats-modal').classList.remove('show');
  });
  document.getElementById('copy-share').addEventListener('click', () => {
    shareResult();
    document.getElementById('stats-modal').classList.remove('show');
  });

  document.getElementById('share-btn').addEventListener('click', shareResult);

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('show');
    }
  });

  // ---------- INITIALIZATION ----------
  loadStats();
  answer = getDailyAnswer();
  const todayIdx = getUTCDayIndex();
  if (stats.lastGameTimestamp !== todayIdx) {
    resetGame();
  } else {
    loadGameBoard();
  }

  // Auto-save board periodically
  setInterval(() => {
    if (!gameOver) saveGameBoard();
  }, 2000);

  // Check for new day every hour
  setInterval(() => {
    if (stats.lastGameTimestamp !== getUTCDayIndex()) {
      resetGame();
    }
  }, 3600000);
})();
